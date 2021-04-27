import sharp from "sharp";
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AccountDoc, generateNewAccessToken, getSignInInfo, authorize, getExtendedProfileInfo, setTokenCookie } from "../account";
import { db, keyValue } from "../globals";
import { app } from "../server";

const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const initAccountApi = () => {
	// Create an account
	app.post('/api/account/sign-up', async (req, res) => {
		let q = req.body as {email: string, username: string, password: string};
		if (!q.email || !q.username || !q.password) {
			res.status(400).send({ status: 'error', reason: "Missing parameters" });
			return;
		}

		// These will throw if email or username aren't string
		q.email = q.email.trim();
		q.username = q.username.trim();

		if (typeof q.password !== 'string') {
			res.status(400).end();
			return;
		}

		if (!emailRegEx.test(q.email)) {
			res.status(400).send({ status: 'error', reason: "Invalid email." });
			return;
		}

		let existing: AccountDoc;

		existing = await db.accounts.findOne({ email: q.email });
		if (existing) {
			res.status(400).send({ status: 'error', reason: "Email already in use." });
			return;
		}

		existing = await db.accounts.findOne({ username: q.username });
		if (existing) {
			res.status(400).send({ status: 'error', reason: "Username already in use." });
			return;
		}
		
		if (q.username.length < 2) {
			res.status(400).send({ status: 'error', reason: 'Username too short.' });
			return;
		}

		if (q.password.length < 8) {
			res.status(400).send({ status: 'error', reason: "Password too short." });
			return;
		}

		// Generate the password hash
		let hash = await bcrypt.hash(q.password, 8);
		let id = keyValue.get('accountId');
		keyValue.set('accountId', id + 1);

		let doc: AccountDoc = {
			_id: id,
			email: q.email,
			username: q.username,
			passwordHash: hash,
			created: Date.now(),
			tokens: [],
			bio: ''
		};

		let newToken = generateNewAccessToken();
		doc.tokens.push({
			value: newToken,
			lastUsed: Date.now()
		});

		await db.accounts.insert(doc);

		// Send sign in info back
		setTokenCookie(res, newToken);
		res.status(200).send({ status: 'success', token: newToken, signInInfo: await getSignInInfo(doc) });
	});

	// Checks if a given token is still valid. If so, returns the sign in info for the corresponding account.
	app.get('/api/account/check-token', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		res.send(await getSignInInfo(doc));
	});

	// Sign in with an account
	app.post('/api/account/sign-in', async (req, res) => {
		let doc = await db.accounts.findOne({ $or: [{ email: req.body.emailOrUsername }, { username: req.body.emailOrUsername }] }) as AccountDoc;
		if (!doc) {
			res.status(400).send({
				status: 'error',
				reason: 'An account with this email or username does not exist.'
			});
			return;
		}

		let pwMatches = await bcrypt.compare((req.body.password as string) ?? '', doc.passwordHash);
		if (!pwMatches) {
			res.status(400).send({
				status: 'error',
				reason: 'Incorrect password.'
			});
			return;
		}

		// Generate a new access token
		let newToken = generateNewAccessToken();
		doc.tokens.push({
			value: newToken,
			lastUsed: Date.now()
		});

		await db.accounts.update({ _id: doc._id }, { $set: { tokens: doc.tokens} });

		setTokenCookie(res, newToken);
		res.status(200).send({ status: 'success', token: newToken, signInInfo: await getSignInInfo(doc) });
	});

	// Sign out a user by invalidating their current access token
	app.post('/api/account/sign-out', async (req, res) => {
		let { doc, token } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		// Remove the token from the list
		doc.tokens = doc.tokens.filter(x => x.value !== token);
		await db.accounts.update({ _id: doc._id }, { $set: { tokens: doc.tokens} });
		
		res.set('Set-Cookie', `token=; Path=/; Max-Age=1;`); // Clear the cookie
		res.end();
	});

	// Get extended profile info for an account
	app.get('/api/account/:accountId/info', async (req, res) => {
		let doc = await db.accounts.findOne({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!doc) {
			res.status(404).send("404\nAn account with this ID does not exist.");
			return;
		}

		res.send(await getExtendedProfileInfo(doc));
	});

	// Get the avatar image for an account, with options to resize
	app.get('/api/account/:accountId/avatar', async (req, res) => {
		let avatarPath = path.join(__dirname, `storage/avatars/${req.params.accountId}.jpg`);
		let exists = await fs.pathExists(avatarPath);

		// Never cache avatars because they could change any time
		res.set('Cache-Control', 'no-cache, no-store');

		if (!exists) {
			// Send back a default pic
			let stream = fs.createReadStream(path.join(__dirname, 'data/assets/avatar_default.png'));
			res.set('Content-Type', 'image/jpeg');
			stream.pipe(res);
			return;
		}

		let buffer = await fs.readFile(avatarPath);

		// Since avatars are always square, we only need a single size param
		if (req.query.size) {
			let size = Number(req.query.size);
			if (!Number.isInteger(size) || size < 1 || size > 1024) {
				res.status(400).end();
				return;
			}

			let resized = await sharp(buffer).resize({ width: size, height: size }).jpeg({ quality: 80 }).toBuffer();
			res.set('Content-Type', 'image/jpeg');
			res.send(resized);
			return;
		}

		res.set('Content-Type', 'image/jpeg');
		res.send(buffer);
	});

	// Set the avatar image for an account
	app.post('/api/account/:accountId/set-avatar', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		// Ensure the person doing the request is the one that owns the account
		if (doc._id !== Number(req.params.accountId)) {
			res.status(403).end();
			return;
		}

		// Norm the avatar into a square format
		let normed = await sharp(req.body).resize({ width: 1024, height: 1024, fit: 'cover', withoutEnlargement: true }).jpeg({ quality: 100 }).toBuffer();
		await fs.writeFile(path.join(__dirname, `storage/avatars/${doc._id}.jpg`), normed);

		res.end();
	});

	// Set the biography for an account
	app.post('/api/account/:accountId/set-bio', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		// Ensure the person doing the request is the one that owns the account
		if (doc._id !== Number(req.params.accountId)) {
			res.status(403).end();
			return;
		}

		doc.bio = req.body.toString();
		await db.accounts.update({ _id: doc._id }, doc);

		res.end();
	});

	// Change the password for an account
	app.post('/api/account/change-password', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		// Compare with previous password
		let pwMatches = await bcrypt.compare((req.body.currentPassword as string) ?? '', doc.passwordHash);
		if (!pwMatches) {
			res.status(400).end();
			return;
		}

		if (typeof req.body.newPassword !== 'string' || req.body.newPassword.length < 8) {
			res.status(400).end();
			return;
		}

		// Update the password hash
		let hash = await bcrypt.hash(req.body.newPassword, 8);
		doc.passwordHash = hash;
		await db.accounts.update({ _id: doc._id }, doc);

		res.end();
	});
};