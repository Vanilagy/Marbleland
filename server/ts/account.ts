import * as crypto from 'crypto';
import { db } from './globals';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ExtendedProfileInfo, LevelInfo, PackInfo, ProfileInfo, SignInInfo } from '../../shared/types';
import { Mission, MissionDoc } from './mission';
import { getPackInfo, PackDoc } from './pack';

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
	bio: string
}

export const generateNewAccessToken = () => {
	return crypto.randomBytes(32).toString('base64');
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

/** Generates the profile info for a given account. */
export const getProfileInfo = async (doc: AccountDoc): Promise<ProfileInfo> => {
	let hasAvatar = await fs.pathExists(path.join(__dirname, `storage/avatars/${doc._id}.jpg`));

	return {
		id: doc._id,
		username: doc.username,
		hasAvatar
	};
};

/** Generates the extended profile info for a given acount. */
export const getExtendedProfileInfo = async (doc: AccountDoc): Promise<ExtendedProfileInfo> => {
	let profileInfo = await getProfileInfo(doc);

	// Add all of their levels
	let missionDocs = await db.missions.find({ addedBy: doc._id }) as MissionDoc[];
	let uploadedLevels: LevelInfo[] = [];

	for (let doc of missionDocs) {
		let mission = Mission.fromDoc(doc);
		uploadedLevels.push(mission.createLevelInfo());
	}

	// Add all of their packs
	let packDocs = await db.packs.find({ createdBy: doc._id }) as PackDoc[];
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
		packs: packs.map(x => ({ id: x._id, name: x.name, levelIds: x.levels }))
	};
};