import sharp from "sharp";
import * as bcrypt from 'bcryptjs';
import * as fs from 'node:fs';
import * as path from 'path';
import { z } from 'zod';
import { AccountDoc, generateNewAccessToken, getSignInInfo, authorize, getExtendedProfileInfo, setTokenCookie, clearTokenCookie, hashToken, isSuspended, generateVerificationToken, isEmailVerificationEnabled, sendVerificationEmail, sendPasswordResetEmail, sendAccountExistsEmail, PendingRegistrationDoc, suspendAccount } from "../account";
import { config, db, keyValue } from "../globals";
import { app } from "../server";
import { tryAssociatingOldUserData } from "../recovery";
import { MissionDoc, Mission } from '../../../server/ts/mission';
import { SERVER_DIR } from '../paths';
import { parseBinaryBody, requireAccount, validate } from './api';
import { rateLimitRequest, HOUR, MINUTE } from '../rate_limiter';
import { MAX_IMAGE_PIXELS } from '../util';
import { BIO_MAX_LENGTH, SUSPENSION_REASON_MAX_LENGTH, USERNAME_MAX_LENGTH } from '../../../shared/constants';

const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

// Control, private-use, surrogate, unassigned and line/paragraph separator characters, plus invisible formatting characters.
// The zero-width joiner is the one formatting character allowed, since combined emoji need it.
const INVALID_USERNAME_CHARACTERS = /[\p{Cc}\p{Co}\p{Cs}\p{Cn}\p{Zl}\p{Zp}]|(?!‍)\p{Cf}/u;

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;
const MAX_TOKEN_LENGTH = 128;

// Compared against when signing in to an account that doesn't exist, so that the response time doesn't reveal it
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('', 8);

const signUpSchema = z.object({
	email: z.string().max(MAX_EMAIL_LENGTH),
	username: z.string().max(USERNAME_MAX_LENGTH * 4), // Generous, the real limit is checked after normalization
	password: z.string().max(MAX_PASSWORD_LENGTH)
});
const verifyEmailSchema = z.object({
	token: z.string().max(MAX_TOKEN_LENGTH)
});
const signInSchema = z.object({
	emailOrUsername: z.string().max(MAX_EMAIL_LENGTH),
	password: z.string().max(MAX_PASSWORD_LENGTH)
});
const bioSchema = z.string().max(BIO_MAX_LENGTH).optional();
const changePasswordSchema = z.object({
	currentPassword: z.string().max(MAX_PASSWORD_LENGTH),
	newPassword: z.string().max(MAX_PASSWORD_LENGTH)
});
const suspendSchema = z.object({
	reason: z.string()
});
const forgotPasswordSchema = z.object({
	email: z.string().max(MAX_EMAIL_LENGTH)
});
const resetPasswordSchema = z.object({
	token: z.string().max(MAX_TOKEN_LENGTH),
	password: z.string().max(MAX_PASSWORD_LENGTH)
});
const setCuratorSchema = z.object({
	isCurator: z.boolean()
});

export const initAccountApi = () => {
	// Create an account
	app.post('/api/account/sign-up', async (req, res) => {
		let q = validate(signUpSchema, req.body, res);
		if (!q) return;

		if (!rateLimitRequest(res, `sign-up:ip:${req.ip}`, 5, HOUR)) return;

		let email = q.email.trim();
		let username = q.username.normalize('NFC').trim();

		if (!rateLimitRequest(res, `sign-up:email:${email.toLowerCase()}`, 3, HOUR)) return;

		if (!email || !username || !q.password) {
			res.status(400).send({ status: 'error', reason: "Missing parameters" });
			return;
		}

		if (!emailRegEx.test(email)) {
			res.status(400).send({ status: 'error', reason: "Invalid email." });
			return;
		}

		if (username.length < 2) {
			res.status(400).send({ status: 'error', reason: 'Username too short.' });
			return;
		}

		if (username.length > USERNAME_MAX_LENGTH) {
			res.status(400).send({ status: 'error', reason: 'Username too long.' });
			return;
		}

		if (INVALID_USERNAME_CHARACTERS.test(username)) {
			res.status(400).send({ status: 'error', reason: 'Username contains invalid characters.' });
			return;
		}

		if (q.password.length < 8) {
			res.status(400).send({ status: 'error', reason: "Password too short." });
			return;
		}

		if (config.userCheckApiKey) {
			// Let's hit the UserCheck API to see if the email is disposable
			const domain = email.split('@')[1];
			const result = await fetch('https://api.usercheck.com/domain/' + encodeURIComponent(domain), {
				headers: {
					'Authorization': `Bearer ${config.userCheckApiKey}`
				}
			}).then(x => x.json()) as {
				disposable: boolean
			};

			if (result.disposable) {
				res.status(400).send({ status: 'error', reason: "Looks like your email is disposable. To prevent spam, disposable emails are not allowed." });
				return;
			}
		}

		let existingByUsername = await db.accounts.findOneAsync({ username: username });
		if (existingByUsername) {
			res.status(400).send({ status: 'error', reason: "Username already in use." });
			return;
		}

		let existingByEmail = await db.accounts.findOneAsync({ email: email }) as AccountDoc;

		if (isEmailVerificationEnabled()) {
			const successResponse = {
				status: 'success',
				requiresVerificationForEmail: email,
				message: 'Account created. Please check your email to verify your account.'
			};

			if (existingByEmail) {
				try {
					await sendAccountExistsEmail(existingByEmail.email, existingByEmail.username);
				} catch (error) {
					console.error('Failed to send account exists email:', error);
				}

				res.status(200).send(successResponse);
				return;
			}

			// Create pending registration instead of account. We do this so we don't pollute the account ID space and
			// block emails or usernames.
			try {
				const pendingDoc: PendingRegistrationDoc = {
					_id: generateVerificationToken(),
					email: email,
					username: username,
					passwordHash: await bcrypt.hash(q.password, 8),
					created: Date.now(),
					verificationToken: generateVerificationToken()
				};

				// Only the latest registration attempt per email stays pending
				await db.pendingRegistrations.removeAsync({ email: email }, { multi: true });
				await db.pendingRegistrations.insertAsync(pendingDoc);
				await sendVerificationEmail(pendingDoc.email, pendingDoc.username, pendingDoc.verificationToken, 'signUp');

				res.status(200).send(successResponse);
			} catch (error) {
				console.error('Failed to send verification email:', error);

				res.status(500).send({
					status: 'error',
					reason: 'Failed to send verification email. Please try again.'
				});
			}
		} else {
			// Without email verification, there's no channel to tell the email's owner privately, so say it directly
			if (existingByEmail) {
				res.status(400).send({ status: 'error', reason: "Email already in use." });
				return;
			}

			// Email verification disabled, create account immediately and log in
			let id = keyValue.get('accountId');
			keyValue.set('accountId', id + 1);
			let newToken = generateNewAccessToken();

			let doc: AccountDoc = {
				_id: id,
				email: email,
				username: username,
				passwordHash: await bcrypt.hash(q.password, 8),
				created: Date.now(),
				tokens: [{ value: hashToken(newToken), lastUsed: Date.now() }],
				tokensHashed: true,
				bio: '',
				acknowledgedGuidelines: false
			};

			await db.accounts.insertAsync(doc);
			await tryAssociatingOldUserData(doc.username, doc._id);

			setTokenCookie(res, newToken);
			res.status(200).send({ status: 'success', token: newToken, signInInfo: await getSignInInfo(doc) });
		}
	});

	app.get('/api/account/verify-email', async (req, res) => {
		if (!rateLimitRequest(res, `verify-email:ip:${req.ip}`, 20, 10 * MINUTE)) return;

		let query = validate(verifyEmailSchema, req.query, res);
		if (!query) return;

		const token = query.token;
		if (!token) {
			res.status(400).send({ status: 'error', reason: 'Missing verification token' });
			return;
		}

		// First check if this is a pending registration
		const pendingDoc = await db.pendingRegistrations.findOneAsync({ verificationToken: token }) as PendingRegistrationDoc;
		let accountDoc: AccountDoc;

		if (pendingDoc) {
			// Check if username or email is already taken in the accounts table
			const existingByUsername = await db.accounts.findOneAsync({ username: pendingDoc.username }) as AccountDoc;
			if (existingByUsername) {
				await db.pendingRegistrations.removeAsync({ _id: pendingDoc._id }, {});
				res.status(400).send({ status: 'error', reason: 'Username is already taken. Please register again with a different username.' });
				return;
			}

			const existingByEmail = await db.accounts.findOneAsync({ email: pendingDoc.email }) as AccountDoc;
			if (existingByEmail) {
				await db.pendingRegistrations.removeAsync({ _id: pendingDoc._id }, {});
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
				tokensHashed: true,
				bio: '',
				acknowledgedGuidelines: false,
				emailVerified: true
			};
			await db.accounts.insertAsync(accountDoc);

			await db.pendingRegistrations.removeAsync({ _id: pendingDoc._id }, {});
		} else {
			// Check if this is an existing unverified account
			const existingAccount = await db.accounts.findOneAsync({ verificationToken: token }) as AccountDoc;
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
			await db.accounts.updateAsync({ _id: existingAccount._id }, { $set: { emailVerified: true }, $unset: { verificationToken: 1 } });

			accountDoc = existingAccount;
		}

		// Generate access token and log them in
		let newToken = generateNewAccessToken();
		accountDoc.tokens.push({
			value: hashToken(newToken),
			lastUsed: Date.now()
		});

		await db.accounts.updateAsync({ _id: accountDoc._id }, { $set: { tokens: accountDoc.tokens } });
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
		let q = validate(signInSchema, req.body, res);
		if (!q) return;

		if (!rateLimitRequest(res, `sign-in:ip:${req.ip}`, 20, 10 * MINUTE)) return;
		if (!rateLimitRequest(res, `sign-in:account-ip:${q.emailOrUsername.toLowerCase()}:${req.ip}`, 10, 10 * MINUTE)) return;

		let doc = await db.accounts.findOneAsync({ $or: [{ email: q.emailOrUsername }, { username: q.emailOrUsername }] }) as AccountDoc;

		// Whether the account doesn't exist or the password is wrong is deliberately indistinguishable
		let pwMatches = await bcrypt.compare(q.password, doc?.passwordHash ?? DUMMY_PASSWORD_HASH);
		if (!doc || !pwMatches) {
			res.status(400).send({
				status: 'error',
				reason: 'Incorrect email/username or password.'
			});
			return;
		}

		if (isEmailVerificationEnabled() && !doc.emailVerified) {
			// User needs to still verify email before logging in

			doc.verificationToken = generateVerificationToken();
			await db.accounts.updateAsync({ _id: doc._id }, { $set: { verificationToken: doc.verificationToken } });

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
			value: hashToken(newToken),
			lastUsed: Date.now()
		});

		await db.accounts.updateAsync({ _id: doc._id }, { $set: { tokens: doc.tokens} });

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
		doc.tokens = doc.tokens.filter(x => x.value !== hashToken(token));
		await db.accounts.updateAsync({ _id: doc._id }, { $set: { tokens: doc.tokens} });

		clearTokenCookie(res);
		res.end();
	});

	// Get extended profile info for an account
	app.get('/api/account/:accountId/info', async (req, res) => {
		let doc = await db.accounts.findOneAsync({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!doc) {
			res.status(404).send("404\nAn account with this ID does not exist.");
			return;
		}

		res.send(await getExtendedProfileInfo(doc));
	});

	// Get the avatar image for an account, with options to resize
	app.get('/api/account/:accountId/avatar', async (req, res) => {
		let accountId = Number(req.params.accountId);
		if (!Number.isInteger(accountId)) {
			res.status(400).send("400\nAccount ID has to be an integer.");
			return;
		}

		let avatarPath = path.join(SERVER_DIR, `storage/avatars/${accountId}.jpg`);
		let exists = fs.existsSync(avatarPath);

		// Never cache avatars because they could change any time
		res.set('Cache-Control', 'no-cache, no-store');

		if (!exists) {
			// Send back a default pic
			let stream = fs.createReadStream(path.join(SERVER_DIR, 'data/assets/avatar_default.png'));
			res.set('Content-Type', 'image/jpeg');
			stream.pipe(res);
			return;
		}

		let buffer = await fs.promises.readFile(avatarPath);

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
	app.post('/api/account/:accountId/set-avatar', requireAccount, parseBinaryBody, async (req, res) => {
		let doc = res.locals.accountDoc as AccountDoc;

		if (!rateLimitRequest(res, `set-avatar:account:${doc._id}`, 10, 10 * MINUTE)) return;

		if (!Buffer.isBuffer(req.body)) {
			res.status(400).send("400\nThe avatar has to be sent as binary data.");
			return;
		}

		let accountDoc = await db.accounts.findOneAsync({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!accountDoc) {
			res.status(400).end();
			return;
		}

		// Ensure the person doing the request has permission to set the avatar
		if (doc._id !== accountDoc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		// Norm the avatar into a square format
		let normed: Buffer;
		try {
			normed = await sharp(req.body, { limitInputPixels: MAX_IMAGE_PIXELS }).resize({ width: 1024, height: 1024, fit: 'cover', withoutEnlargement: true }).jpeg({ quality: 100 }).toBuffer();
		} catch (e) {
			res.status(400).send("400\nThe avatar couldn't be read as an image.");
			return;
		}
		await fs.promises.writeFile(path.join(SERVER_DIR, `storage/avatars/${accountDoc._id}.jpg`), normed);

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

		let bio = validate(bioSchema, req.body, res);
		if (bio === null) return;

		let accountDoc = await db.accounts.findOneAsync({ _id: Number(req.params.accountId) }) as AccountDoc;
		if (!accountDoc) {
			res.status(400).end();
			return;
		}

		// Ensure the person doing the request has permission to edit the bio
		if (doc._id !== accountDoc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		accountDoc.bio = bio ?? '';
		await db.accounts.updateAsync({ _id: accountDoc._id }, accountDoc);

		res.end();
	});

	// Change the password for an account
	app.post('/api/account/change-password', async (req, res) => {
		let { doc, token } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let q = validate(changePasswordSchema, req.body, res);
		if (!q) return;

		if (!rateLimitRequest(res, `change-password:account:${doc._id}`, 10, 10 * MINUTE)) return;

		// Compare with previous password
		let pwMatches = await bcrypt.compare(q.currentPassword, doc.passwordHash);
		if (!pwMatches) {
			res.status(400).end();
			return;
		}

		if (q.newPassword.length < 8) {
			res.status(400).end();
			return;
		}

		// Update the password hash and sign out all other sessions
		let hash = await bcrypt.hash(q.newPassword, 8);
		doc.passwordHash = hash;
		doc.tokens = doc.tokens.filter(x => x.value === hashToken(token));
		await db.accounts.updateAsync({ _id: doc._id }, doc);

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
		await db.accounts.updateAsync({ _id: doc._id }, doc);

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

		let q = validate(suspendSchema, req.body, res);
		if (!q) return;

		let targetAccountDoc = await db.accounts.findOneAsync({ _id: Number(req.params.accountId) }) as AccountDoc;
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
		let reason = q.reason.trim();
		if (reason.length === 0) {
			res.status(400).send("400\nSuspension reason is required.");
			return;
		}

		if (reason.length > SUSPENSION_REASON_MAX_LENGTH) {
			res.status(400).send(`400\nSuspension reason must be ${SUSPENSION_REASON_MAX_LENGTH} characters or less.`);
			return;
		}

		// Suspend the account
		await suspendAccount(targetAccountDoc, reason);

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

		let targetAccountDoc = await db.accounts.findOneAsync({ _id: Number(req.params.accountId) }) as AccountDoc;
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
		await db.accounts.updateAsync({ _id: targetAccountDoc._id }, targetAccountDoc);

		res.send({ success: true });
	});

	// Request password reset
	app.post('/api/account/forgot-password', async (req, res) => {
		let q = validate(forgotPasswordSchema, req.body, res);
		if (!q) return;

		const email = q.email.trim();

		if (!email) {
			res.status(400).send({ status: 'error', reason: 'Email is required' });
			return;
		}

		if (!isEmailVerificationEnabled()) {
			res.status(400).send({ status: 'error', reason: 'Password reset is not available' });
			return;
		}

		if (!emailRegEx.test(email)) {
			res.status(400).send({ status: 'error', reason: 'Invalid email format' });
			return;
		}

		if (!rateLimitRequest(res, `forgot-password:ip:${req.ip}`, 5, HOUR)) return;
		if (!rateLimitRequest(res, `forgot-password:email:${email.toLowerCase()}`, 3, HOUR)) return;

		// The response is the same no matter what happens, so this can't be used to find out which emails are registered
		const successResponse = {
			status: 'success',
			message: 'If an account with this email exists, a password reset link has been sent.'
		};

		const doc = await db.accounts.findOneAsync({ email: email }) as AccountDoc;
		if (!doc) {
			res.status(200).send(successResponse);
			return;
		}

		// Generate reset token and expiration
		const resetToken = generateVerificationToken();
		const expires = Date.now() + (60 * 60 * 1000); // 1 hour

		try {
			await sendPasswordResetEmail(doc.email, doc.username, resetToken);

			doc.passwordResetToken = resetToken;
			doc.passwordResetExpires = expires;
			await db.accounts.updateAsync({ _id: doc._id }, doc);
		} catch (error) {
			console.error('Failed to send password reset email:', error);
		}

		res.status(200).send(successResponse);
	});

	// Reset password with token
	app.post('/api/account/reset-password', async (req, res) => {
		let q = validate(resetPasswordSchema, req.body, res);
		if (!q) return;

		if (!rateLimitRequest(res, `reset-password:ip:${req.ip}`, 10, 10 * MINUTE)) return;

		const { token, password } = q;

		if (!token || !password) {
			res.status(400).send({ status: 'error', reason: 'Token and password are required' });
			return;
		}

		if (password.length < 8) {
			res.status(400).send({ status: 'error', reason: 'Password must be at least 8 characters long' });
			return;
		}

		const doc = await db.accounts.findOneAsync({ passwordResetToken: token }) as AccountDoc;
		if (!doc) {
			res.status(400).send({ status: 'error', reason: 'Invalid or expired reset token' });
			return;
		}

		// Check if token is expired
		if (!doc.passwordResetExpires || Date.now() > doc.passwordResetExpires) {
			res.status(400).send({ status: 'error', reason: 'Invalid or expired reset token' });
			return;
		}

		// Hash new password
		const hash = await bcrypt.hash(password, 8);

		// Sign out all existing sessions and log the user in with a fresh one
		const newToken = generateNewAccessToken();
		doc.tokens = [{
			value: hashToken(newToken),
			lastUsed: Date.now()
		}];

		// Update account
		doc.passwordHash = hash;
		delete doc.passwordResetToken;
		delete doc.passwordResetExpires;
		await db.accounts.updateAsync({ _id: doc._id }, doc);

		setTokenCookie(res, newToken);
		res.status(200).send({
			status: 'success',
			token: newToken,
			signInInfo: await getSignInInfo(doc)
		});
	});

	// Toggle curator status
    app.post('/api/account/:accountId/set-curator', async (req, res) => {
        let { doc } = await authorize(req);
        if (!doc) {
            res.status(401).send("401\nInvalid token.");
            return;
        }

        // Only moderators can grant curator status
        if (!doc.moderator) {
            res.status(403).send("403\nForbidden.");
            return;
        }

        let targetId = Number(req.params.accountId);
        if (!Number.isInteger(targetId)) {
            res.status(400).end();
            return;
        }

		let q = validate(setCuratorSchema, req.body, res);
		if (!q) return;

        let targetAccount = await db.accounts.findOneAsync({ _id: targetId }) as AccountDoc;
        if (!targetAccount) {
            res.status(404).send("404\nAccount not found.");
            return;
        }

        // Set the status based on the body (true/false)
        let isCurator = q.isCurator;

        targetAccount.curator = isCurator;
        await db.accounts.updateAsync({ _id: targetAccount._id }, targetAccount);

		// Remove curator votes from this account if it's a revoke
		if (!isCurator) Mission.removeVotes(targetAccount._id);

        res.send({ success: true, isCurator: targetAccount.curator });
    });
};
