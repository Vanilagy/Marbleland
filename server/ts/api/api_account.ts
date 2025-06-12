import sharp from "sharp";
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { AccountDoc, generateNewAccessToken, getSignInInfo, authorize, getExtendedProfileInfo, setTokenCookie, isSuspended, generateVerificationToken, isEmailVerificationEnabled, sendVerificationEmail, PendingRegistrationDoc } from "../account";
import { db, keyValue } from "../globals";
import { app } from "../server";
import { tryAssociatingOldUserData } from "../recovery";
import { MissionDoc } from "../mission";
import { PackDoc } from "../pack";
import { deleteSingleLevel } from "./api_level";
import { deleteSinglePack } from "./api_pack";

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

		if (isEmailVerificationEnabled()) {
			// Create pending registration instead of account. We do this so we don't pollute the account ID space and
			// block emails or usernames.
			try {
				const pendingDoc: PendingRegistrationDoc = {
					_id: generateVerificationToken(),
					email: q.email,
					username: q.username,
					passwordHash: hash,
					created: Date.now(),
					verificationToken: generateVerificationToken()
				};

				await db.pendingRegistrations.insert(pendingDoc);
				await sendVerificationEmail(pendingDoc.email, pendingDoc.username, pendingDoc.verificationToken, 'signUp');

				res.status(200).send({ 
					status: 'success', 
					requiresVerificationForEmail: pendingDoc.email,
					message: 'Account created. Please check your email to verify your account.' 
				});
			} catch (error) {
				console.error('Failed to send verification email:', error);

				res.status(500).send({ 
					status: 'error', 
					reason: 'Failed to send verification email. Please try again.' 
				});
			}
		} else {
			// Email verification disabled, create account immediately and log in
			let id = keyValue.get('accountId');
			keyValue.set('accountId', id + 1);
			let newToken = generateNewAccessToken();

			let doc: AccountDoc = {
				_id: id,
				email: q.email,
				username: q.username,
				passwordHash: hash,
				created: Date.now(),
				tokens: [{ value: newToken, lastUsed: Date.now() }],
				bio: '',
				acknowledgedGuidelines: false
			};

			await db.accounts.insert(doc);
			await tryAssociatingOldUserData(doc.username, doc._id);

			setTokenCookie(res, newToken);
			res.status(200).send({ status: 'success', token: newToken, signInInfo: await getSignInInfo(doc) });
		}
	});

	app.get('/api/account/verify-email', async (req, res) => {
		const token = req.query.token as string;
		if (!token) {
			res.status(400).send({ status: 'error', reason: 'Missing verification token' });
			return;
		}

		// First check if this is a pending registration
		const pendingDoc = await db.pendingRegistrations.findOne({ verificationToken: token }) as PendingRegistrationDoc;
		let accountDoc: AccountDoc;
		
		if (pendingDoc) {
			// Check if username or email is already taken in the accounts table
			const existingByUsername = await db.accounts.findOne({ username: pendingDoc.username }) as AccountDoc;
			if (existingByUsername) {
				await db.pendingRegistrations.remove({ _id: pendingDoc._id }, {});
				res.status(400).send({ status: 'error', reason: 'Username is already taken. Please register again with a different username.' });
				return;
			}

			const existingByEmail = await db.accounts.findOne({ email: pendingDoc.email }) as AccountDoc;
			if (existingByEmail) {
				await db.pendingRegistrations.remove({ _id: pendingDoc._id }, {});
				res.status(400).send({ status: 'error', reason: 'Email is already taken. Please register again with a different email address.' });
				return;
			}

			const accountId = keyValue.get('accountId');
			keyValue.set('accountId', accountId + 1);

			// Create the actual account
			accountDoc = {
				_id: accountId,
				email: pendingDoc.email,
				username: pendingDoc.username,
				passwordHash: pendingDoc.passwordHash,
				created: pendingDoc.created,
				tokens: [],
				bio: '',
				acknowledgedGuidelines: false,
				emailVerified: true
			};
			await db.accounts.insert(accountDoc);
			
			await db.pendingRegistrations.remove({ _id: pendingDoc._id }, {});
		} else {
			// Check if this is an existing unverified account
			const existingAccount = await db.accounts.findOne({ verificationToken: token }) as AccountDoc;
			if (!existingAccount) {
				res.status(400).send({ status: 'error', reason: 'Invalid verification token' });
				return;
			}
			
			if (existingAccount.emailVerified) {
				res.status(400).send({ status: 'error', reason: 'Email already verified' });
				return;
			}

			// Update account to verified
			existingAccount.emailVerified = true;
			existingAccount.verificationToken = undefined;
			await db.accounts.update({ _id: existingAccount._id }, { $set: { emailVerified: true }, $unset: { verificationToken: 1 } });
			
			accountDoc = existingAccount;
		}

		// Generate access token and log them in
		let newToken = generateNewAccessToken();
		accountDoc.tokens.push({
			value: newToken,
			lastUsed: Date.now()
		});

		await db.accounts.update({ _id: accountDoc._id }, { $set: { tokens: accountDoc.tokens } });
		await tryAssociatingOldUserData(accountDoc.username, accountDoc._id);

		setTokenCookie(res, newToken);
		res.redirect(`/profile/${accountDoc._id}`);
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

		if (isEmailVerificationEnabled() && !doc.emailVerified) {
			// User needs to still verify email before logging in

			doc.verificationToken = generateVerificationToken();
			await db.accounts.update({ _id: doc._id }, { $set: { verificationToken: doc.verificationToken } });

			try {
				await sendVerificationEmail(doc.email, doc.username, doc.verificationToken, 'signIn');

				res.status(400).send({
					status: 'error',
					reason: 'Please verify your email address. A verification email has been sent.',
					requiresVerificationForEmail: doc.email
				});
			} catch (error) {
				console.error('Failed to send verification email:', error);

				res.status(500).send({
					status: 'error',
					reason: 'Failed to send verification email.'
				});
			}

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

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let accountDoc = await db.accounts.findOne({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!accountDoc) {
			res.end(400);
			return;
		}

		// Ensure the person doing the request has permission to set the avatar
		if (doc._id !== accountDoc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		// Norm the avatar into a square format
		let normed = await sharp(req.body).resize({ width: 1024, height: 1024, fit: 'cover', withoutEnlargement: true }).jpeg({ quality: 100 }).toBuffer();
		await fs.writeFile(path.join(__dirname, `storage/avatars/${accountDoc._id}.jpg`), normed);

		res.end();
	});

	// Set the biography for an account
	app.post('/api/account/:accountId/set-bio', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let accountDoc = await db.accounts.findOne({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!accountDoc) {
			res.end(400);
			return;
		}

		// Ensure the person doing the request has permission to edit the bio
		if (doc._id !== accountDoc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		accountDoc.bio = req.body.toString();
		await db.accounts.update({ _id: accountDoc._id }, accountDoc);

		res.end();
	});

	// Change the password for an account
	app.post('/api/account/change-password', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
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

	// Acknowledge the content guidelines
	app.post('/api/account/acknowledge-guidelines', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		doc.acknowledgedGuidelines = true;
		await db.accounts.update({ _id: doc._id }, doc);

		res.end();
	});

	// Suspend an account
	app.post('/api/account/:accountId/suspend', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		// Only moderators can suspend accounts
		if (!doc.moderator) {
			res.status(403).send("403\nForbidden.");
			return;
		}

		let targetAccountDoc = await db.accounts.findOne({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!targetAccountDoc) {
			res.status(404).send("404\nAccount not found.");
			return;
		}

		// Cannot suspend moderators
		if (targetAccountDoc.moderator) {
			res.status(400).send("400\nCannot suspend moderators.");
			return;
		}

		// Don't suspend if already suspended
		if (targetAccountDoc.suspended) {
			res.status(400).send("400\nAccount is already suspended.");
			return;
		}

		// Validate suspension reason
		if (!req.body.reason || typeof req.body.reason !== 'string' || req.body.reason.trim().length === 0) {
			res.status(400).send("400\nSuspension reason is required.");
			return;
		}

		if (req.body.reason.trim().length > 500) {
			res.status(400).send("400\nSuspension reason must be 500 characters or less.");
			return;
		}

		// Suspend the account
		targetAccountDoc.suspended = true;
		targetAccountDoc.suspensionReason = req.body.reason.trim();
		await db.accounts.update({ _id: targetAccountDoc._id }, targetAccountDoc);

		// Delete all levels by the user
		let missionDocs = await db.missions.find({ addedBy: targetAccountDoc._id }) as MissionDoc[];
		for (let missionDoc of missionDocs) {
			await deleteSingleLevel(missionDoc._id);
		}

		// Delete all packs by the user
		let packDocs = await db.packs.find({ createdBy: targetAccountDoc._id }) as PackDoc[];
		for (let packDoc of packDocs) {
			await deleteSinglePack(packDoc._id);
		}

		// Delete all comments by the user
		await db.comments.remove({ author: targetAccountDoc._id }, { multi: true });

		res.send({ success: true });
	});

	// Unsuspend an account
	app.post('/api/account/:accountId/unsuspend', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		// Only moderators can unsuspend accounts
		if (!doc.moderator) {
			res.status(403).send("403\nForbidden.");
			return;
		}

		let targetAccountDoc = await db.accounts.findOne({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!targetAccountDoc) {
			res.status(404).send("404\nAccount not found.");
			return;
		}

		// Don't unsuspend if not suspended
		if (!targetAccountDoc.suspended) {
			res.status(400).send("400\nAccount is not suspended.");
			return;
		}

		// Unsuspend the account
		targetAccountDoc.suspended = false;
		targetAccountDoc.suspensionReason = undefined;
		await db.accounts.update({ _id: targetAccountDoc._id }, targetAccountDoc);

		res.send({ success: true });
	});
};