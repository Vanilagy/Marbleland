import * as crypto from 'crypto';
import { db, config } from './globals';
import express from 'express';
import * as fs from 'node:fs';
import * as path from 'path';
import { ExtendedProfileInfo, LevelInfo, PackInfo, ProfileInfo, SignInInfo } from '../../shared/types';
import { SERVER_DIR } from './paths';
import { Mission, MissionDoc } from './mission';
import { getPackInfo, PackDoc } from './pack';
import { ORIGIN } from '../../shared/constants';
import { deleteSingleLevel } from './api/api_level';
import { deleteSinglePack } from './api/api_pack';

/** The representation of an account in the database. */
export interface AccountDoc {
	_id: number,
	email: string,
	username: string,
	passwordHash: string,
	created: number,
	tokens: {
		/** The SHA-256 hash of the token. */
		value: string,
		/** The UNIX timestamp in milliseconds when the token was last utilized for authorization. */
		lastUsed: number
	}[],
	/** Set once the account's tokens have been migrated from plaintext to their hashes. */
	tokensHashed?: boolean,
	bio: string,
	moderator?: boolean,
	curator?: boolean,
	acknowledgedGuidelines?: boolean,
	suspended?: boolean,
	suspensionReason?: string,
	emailVerified?: boolean,
	verificationToken?: string,
	passwordResetToken?: string,
	passwordResetExpires?: number
}

/** The representation of a pending registration in the database. */
export interface PendingRegistrationDoc {
	_id: string,
	email: string,
	username: string,
	passwordHash: string,
	created: number,
	verificationToken: string
}

export const generateNewAccessToken = () => {
	return crypto.randomBytes(32).toString('base64');
};

// Tokens are 32 random bytes, so a plain fast hash is enough; there's nothing to brute-force
export const hashToken = (token: string) => {
	return crypto.createHash('sha256').update(token).digest('base64');
};

/** Hashes the plaintext tokens of all accounts that predate token hashing. */
export const migrateTokensToHashes = async () => {
	let accounts = await db.accounts.findAsync({ tokensHashed: { $ne: true } }) as AccountDoc[];
	for (let account of accounts) {
		let tokens = account.tokens.map(x => ({
			value: hashToken(x.value),
			lastUsed: x.lastUsed
		}));
		await db.accounts.updateAsync({ _id: account._id }, { $set: { tokens, tokensHashed: true } });
	}

	if (accounts.length > 0) console.log(`Migrated the tokens of ${accounts.length} accounts to hashes.`);
};

export const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString('base64');
};

export const isEmailVerificationEnabled = () => {
	return config.brevoApiKey && config.brevoSenderEmail;
};

export const TOKEN_TTL = 1000 * 60 * 60 * 24 * 30; // Tokens expire after 30 days of no use

export const startExpiredTokenCleanup = () => {
	setInterval(async () => {
		// Once a day, clean up the expired tokens
		let now = Date.now();
		let accounts = await db.accounts.findAsync({}) as AccountDoc[];
		for (let account of accounts) {
			let changed = false;

			for (let i = 0; i < account.tokens.length; i++) {
				let token = account.tokens[i];
				if (now - token.lastUsed >= TOKEN_TTL) {
					account.tokens.splice(i--, 1);
					changed = true;
				}
			}

			if (changed) db.accounts.updateAsync({ _id: account._id }, { $set: { tokens: account.tokens } });
		}
	}, 1000 * 60 * 60 * 24);
};

const getTokenFromAuthHeader = (req: express.Request) => {
	let header = req.headers.authorization as string;
	if (!header) return null;

	let parts = header.split(' ');
	if (parts[0] !== 'Bearer') return null;

	return parts[1] ?? null;
};

const getTokenFromCookie = (req: express.Request) => {
	return /token=(.*?)(;|$)/.exec(req.headers.cookie ?? '')?.[1];
};

export const setTokenCookie = (res: express.Response, token: string) => {
	res.set('Set-Cookie', `token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax`);
};

export const clearTokenCookie = (res: express.Response) => {
	res.set('Set-Cookie', `token=; Path=/; Max-Age=1; HttpOnly; SameSite=Lax`);
};

/** Finds the account belonging to a token specified in the Authorization header. If an account is found, also updates the `lastUsed` field. */
export const authorize = async (req: express.Request) => {
	let tokenString = getTokenFromAuthHeader(req);
	let doc: AccountDoc = null;
	if (tokenString) {
		doc = await db.accounts.findOneAsync({ 'tokens.value': hashToken(tokenString) }) as AccountDoc;
	}
	if (!doc) {
		// Check the cookie
		tokenString = getTokenFromCookie(req);
		if (tokenString) {
			doc = await db.accounts.findOneAsync({ 'tokens.value': hashToken(tokenString) }) as AccountDoc;
		}
	}

	if (!doc) return { doc: null, token: null };

	let now = Date.now();
	let token = doc.tokens.find(x => x.value === hashToken(tokenString));
	if (now - token.lastUsed >= TOKEN_TTL) return { doc: null, token: null };

	token.lastUsed = Date.now();
	await db.accounts.updateAsync({ _id: doc._id }, { $set: { tokens: doc.tokens} });

	return { doc, token: tokenString };
};

/** Checks if an account is suspended. Returns true if suspended, false if allowed. */
export const isSuspended = (doc: AccountDoc): boolean => {
	return !!doc.suspended;
};

export const suspendAccount = async (doc: AccountDoc, suspensionReason: string) => {
	if (doc.moderator) {
		throw new Error('Cannot suspend moderators.');
	}

	if (doc.suspended) {
		return;
	}

	// Suspend the account
	doc.suspended = true;
	doc.suspensionReason = suspensionReason;
	await db.accounts.updateAsync({ _id: doc._id }, doc);

	// Delete all levels by the user
	let missionDocs = await db.missions.findAsync({ addedBy: doc._id }) as MissionDoc[];
	for (let missionDoc of missionDocs) {
		await deleteSingleLevel(missionDoc._id);
	}

	// Delete all packs by the user
	let packDocs = await db.packs.findAsync({ createdBy: doc._id }) as PackDoc[];
	for (let packDoc of packDocs) {
		await deleteSinglePack(packDoc._id);
	}

	// Delete all comments by the user
	await db.comments.removeAsync({ author: doc._id }, { multi: true });

	// Remove all curator votes by the user
	if (doc.curator) await Mission.removeVotes(doc._id);
}

/** Generates the profile info for a given account. */
export const getProfileInfo = async (doc: AccountDoc): Promise<ProfileInfo> => {
	let hasAvatar = fs.existsSync(path.join(SERVER_DIR, `storage/avatars/${doc._id}.jpg`));
	let levelCount = await db.missions.countAsync({ addedBy: doc._id });

	return {
		id: doc._id,
		username: doc.username,
		hasAvatar,
		levelCount,
		isModerator: !!doc.moderator,
		isSuspended: !!doc.suspended,
		isCurator: !!doc.curator,
		suspensionReason: doc.suspensionReason
	};
};

/** Generates the extended profile info for a given acount. */
export const getExtendedProfileInfo = async (doc: AccountDoc): Promise<ExtendedProfileInfo> => {
	let profileInfo = await getProfileInfo(doc);

	// Add all of their levels
	let missionDocs = await db.missions.findAsync({ addedBy: doc._id }) as MissionDoc[];
	missionDocs.sort((a, b) => b.addedAt - a.addedAt); // Show newest ones first
	let uploadedLevels: LevelInfo[] = [];

	for (let doc of missionDocs) {
		let mission = Mission.fromDoc(doc);
		uploadedLevels.push(mission.createLevelInfo());
	}

	// Add all of their favorites
	let favoriteMissionDocs = await db.missions.findAsync({ lovedBy: doc._id }) as MissionDoc[];
	favoriteMissionDocs.sort((a, b) => b.addedAt - a.addedAt); // Show newest ones first
	let favoriteLevels: LevelInfo[] = [];

	for (let doc of favoriteMissionDocs) {
		let mission = Mission.fromDoc(doc);
		favoriteLevels.push(mission.createLevelInfo());
	}

	// Add all of their packs
	let packDocs = await db.packs.findAsync({ createdBy: doc._id }) as PackDoc[];
	packDocs.sort((a, b) => b.createdAt - a.createdAt); // Show newest ones first
	let createdPacks: PackInfo[] = [];

	for (let doc of packDocs) {
		createdPacks.push(await getPackInfo(doc));
	}

	let curatorVotesCast: number = undefined;
	if (doc.curator) {
		let votedMissions = await db.missions.findAsync({ [`curatorVotes.${doc._id}`]: { $exists: true } });
		curatorVotesCast = votedMissions.length;
	}

	return Object.assign(profileInfo, {
		bio: doc.bio,
		uploadedLevels,
		favoriteLevels,
		createdPacks,
		curatorVotesCast
	});
};

/** Generates the sign-in info for a given account. */
export const getSignInInfo = async (doc: AccountDoc): Promise<SignInInfo> => {
	let profileInfo = await getProfileInfo(doc);
	let packs = await db.packs.findAsync({ createdBy: doc._id }) as PackDoc[];

	let curatorVotes: Record<number, boolean> = undefined;
	if (doc.curator) {
		curatorVotes = {};
		let votedMissions = await db.missions.findAsync({ [`curatorVotes.${doc._id}`]: { $exists: true } }) as MissionDoc[];
		for (let mission of votedMissions) curatorVotes[mission._id] = mission.curatorVotes[doc._id];
	}

	return {
		profile: profileInfo,
		packs: packs.map(x => ({ id: x._id, name: x.name, levelIds: x.levels })),
		acknowledgedGuidelines: doc.acknowledgedGuidelines ?? false,
		curatorVotes
	};
};

export const sendVerificationEmail = async (email: string, username: string, token: string, context: 'signUp' | 'signIn' = 'signUp') => {
	if (!isEmailVerificationEnabled()) {
		throw new Error('Email verification is not configured');
	}

	const verificationUrl = `${ORIGIN}/api/account/verify-email?token=${encodeURIComponent(token)}`;

	const isSignIn = context === 'signIn';
	const mainMessage = isSignIn
		? `Your account still requires email verification before you can sign in. Please verify your email address by clicking the link below:`
		: `Thank you for creating your Marbleland account! To complete your registration, please verify your email address by clicking the link below:`;
	const disclaimerMessage = isSignIn
		? `If you didn't trigger this action, you can safely ignore this email.`
		: `If you didn't create this account, you can safely ignore this email.`;

	await sendEmail(email, username, 'Verify your Marbleland account', `
	<p>${mainMessage}</p>
	<p><a href="${verificationUrl}">Verify account</a></p>
	<p>${disclaimerMessage}</p>`);
};

export const sendPasswordResetEmail = async (email: string, username: string, token: string) => {
	if (!isEmailVerificationEnabled()) {
		throw new Error('Email verification is not configured');
	}

	const resetUrl = `${ORIGIN}/reset-password?token=${encodeURIComponent(token)}`;

	await sendEmail(email, username, 'Reset your Marbleland password', `
	<p>You requested a password reset. Click the link below to set a new password:</p>
	<p><a href="${resetUrl}">Reset password</a></p>
	<p>This link will expire in 1 hour.</p>
	<p>If you didn't request this password reset, you can safely ignore this email.</p>`);
};

export const sendAccountExistsEmail = async (email: string, username: string) => {
	if (!isEmailVerificationEnabled()) {
		throw new Error('Email verification is not configured');
	}

	await sendEmail(email, username, 'Your Marbleland account', `
	<p>Someone tried to create a new Marbleland account with this email address, but you already have an account with it.</p>
	<p>If you forgot your password, you can <a href="${ORIGIN}/forgot-password">reset it here</a>.</p>
	<p>If this wasn't you, you can safely ignore this email.</p>`);
};

const sendEmail = async (email: string, username: string, subject: string, bodyHtml: string) => {
	// Usernames can contain any printable characters, so they must not be interpreted as HTML
	const escapedUsername = username
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

	const emailHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
</head>
<body>
	<p>Hey ${escapedUsername},</p>${bodyHtml}
	<p>Best regards,<br>The Marbleland Team</p>
</body>
</html>
	`;

	const response = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'api-key': config.brevoApiKey!
		},
		body: JSON.stringify({
			sender: {
				name: config.brevoSenderName,
				email: config.brevoSenderEmail
			},
			to: [{
				email: email,
				name: username
			}],
			subject,
			htmlContent: emailHtml
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to send email: ${response.status} ${errorText}`);
	}
};

