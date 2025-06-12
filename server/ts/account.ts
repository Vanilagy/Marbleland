import * as crypto from 'crypto';
import { db, config } from './globals';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ExtendedProfileInfo, LevelInfo, PackInfo, ProfileInfo, SignInInfo } from '../../shared/types';
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
		value: string,
		/** The UNIX timestamp in milliseconds when the token was last utilized for authorization. */
		lastUsed: number
	}[],
	bio: string,
	moderator?: boolean,
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

export const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString('base64');
};

export const isEmailVerificationEnabled = () => {
	return config.brevoApiKey && config.brevoSenderEmail;
};

export const TOKEN_TTL = 1000 * 60 * 60 * 24 * 30; // Tokens expire after 30 days of no use

setInterval(async () => {
	// Once a day, clean up the expired tokens
	let now = Date.now();
	let accounts = await db.accounts.find({}) as AccountDoc[];
	for (let account of accounts) {
		let changed = false;

		for (let i = 0; i < account.tokens.length; i++) {
			let token = account.tokens[i];
			if (now - token.lastUsed >= TOKEN_TTL) {
				account.tokens.splice(i--, 1);
				changed = true;
			}
		}

		if (changed) db.accounts.update({ _id: account._id }, { $set: { tokens: account.tokens } });
	}
}, 1000 * 60 * 60 * 24);

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
	res.set('Set-Cookie', `token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 30};`);
};

/** Finds the account belonging to a token specified in the Authorization header. If an account is found, also updates the `lastUsed` field. */
export const authorize = async (req: express.Request) => {
	let tokenString = getTokenFromAuthHeader(req);
	let doc = await db.accounts.findOne({ 'tokens.value': tokenString }) as AccountDoc;
	if (!doc) {
		// Check the cookie
		tokenString = getTokenFromCookie(req);
		if (tokenString) {
			doc = await db.accounts.findOne({ 'tokens.value': tokenString }) as AccountDoc;
		}
	}

	if (!doc) return { doc: null, token: null };

	let now = Date.now();
	let token = doc.tokens.find(x => x.value === tokenString);
	if (now - token.lastUsed >= TOKEN_TTL) return { doc: null, token: null };

	token.lastUsed = Date.now();
	await db.accounts.update({ _id: doc._id }, { $set: { tokens: doc.tokens} });

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
	await db.accounts.update({ _id: doc._id }, doc);

	// Delete all levels by the user
	let missionDocs = await db.missions.find({ addedBy: doc._id }) as MissionDoc[];
	for (let missionDoc of missionDocs) {
		await deleteSingleLevel(missionDoc._id);
	}

	// Delete all packs by the user
	let packDocs = await db.packs.find({ createdBy: doc._id }) as PackDoc[];
	for (let packDoc of packDocs) {
		await deleteSinglePack(packDoc._id);
	}

	// Delete all comments by the user
	await db.comments.remove({ author: doc._id }, { multi: true });
}

/** Generates the profile info for a given account. */
export const getProfileInfo = async (doc: AccountDoc): Promise<ProfileInfo> => {
	let hasAvatar = await fs.pathExists(path.join(__dirname, `storage/avatars/${doc._id}.jpg`));

	return {
		id: doc._id,
		username: doc.username,
		hasAvatar,
		isModerator: !!doc.moderator,
		isSuspended: !!doc.suspended,
		suspensionReason: doc.suspensionReason
	};
};

/** Generates the extended profile info for a given acount. */
export const getExtendedProfileInfo = async (doc: AccountDoc): Promise<ExtendedProfileInfo> => {
	let profileInfo = await getProfileInfo(doc);

	// Add all of their levels
	let missionDocs = await db.missions.find({ addedBy: doc._id }) as MissionDoc[];
	missionDocs.sort((a, b) => b.addedAt - a.addedAt); // Show newest ones first
	let uploadedLevels: LevelInfo[] = [];

	for (let doc of missionDocs) {
		let mission = Mission.fromDoc(doc);
		uploadedLevels.push(mission.createLevelInfo());
	}

	// Add all of their packs
	let packDocs = await db.packs.find({ createdBy: doc._id }) as PackDoc[];
	packDocs.sort((a, b) => b.createdAt - a.createdAt); // Show newest ones first
	let createdPacks: PackInfo[] = [];

	for (let doc of packDocs) {
		createdPacks.push(await getPackInfo(doc));
	}

	return Object.assign(profileInfo, {
		bio: doc.bio,
		uploadedLevels,
		createdPacks
	});
};

/** Generates the sign-in info for a given account. */
export const getSignInInfo = async (doc: AccountDoc): Promise<SignInInfo> => {
	let profileInfo = await getProfileInfo(doc);
	let packs = await db.packs.find({ createdBy: doc._id }) as PackDoc[];

	return {
		profile: profileInfo,
		packs: packs.map(x => ({ id: x._id, name: x.name, levelIds: x.levels })),
		acknowledgedGuidelines: doc.acknowledgedGuidelines ?? false
	};
};

export const sendVerificationEmail = async (email: string, username: string, token: string, context: 'signUp' | 'signIn' = 'signUp') => {
	if (!isEmailVerificationEnabled()) {
		throw new Error('Email verification is not configured');
	}

	const verificationUrl = `${ORIGIN}/api/account/verify-email?token=${encodeURIComponent(token)}`;
	
	const isSignIn = context === 'signIn';
	const greeting = `Hey ${username},`;
	const mainMessage = isSignIn 
		? `Your account still requires email verification before you can sign in. Please verify your email address by clicking the link below:`
		: `Thank you for creating your Marbleland account! To complete your registration, please verify your email address by clicking the link below:`;
	const disclaimerMessage = isSignIn
		? `If you didn't trigger this action, you can safely ignore this email.`
		: `If you didn't create this account, you can safely ignore this email.`;
	
	const emailHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
</head>
<body>
	<p>${greeting}</p>
	<p>${mainMessage}</p>
	<p><a href="${verificationUrl}">Verify account</a></p>
	<p>${disclaimerMessage}</p>
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
			subject: 'Verify your Marbleland account',
			htmlContent: emailHtml
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to send verification email: ${response.status} ${errorText}`);
	}
};

export const sendPasswordResetEmail = async (email: string, username: string, token: string) => {
	if (!isEmailVerificationEnabled()) {
		throw new Error('Email verification is not configured');
	}

	const resetUrl = `${ORIGIN}/reset-password?token=${encodeURIComponent(token)}`;
	
	const emailHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
</head>
<body>
	<p>Hey ${username},</p>
	<p>You requested a password reset. Click the link below to set a new password:</p>
	<p><a href="${resetUrl}">Reset password</a></p>
	<p>This link will expire in 1 hour.</p>
	<p>If you didn't request this password reset, you can safely ignore this email.</p>
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
			subject: 'Reset your Marbleland password',
			htmlContent: emailHtml
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to send password reset email: ${response.status} ${errorText}`);
	}
};

