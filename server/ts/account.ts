import * as crypto from 'crypto';
import { db } from './globals';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ExtendedProfileInfo, LevelInfo, ProfileInfo, SignInInfo } from '../../shared/types';
import { Mission, MissionDoc } from './mission';
import { PackDoc } from './pack';

export interface AccountDoc {
	_id: number,
	email: string,
	username: string,
	passwordHash: string,
	created: number,
	tokens: {
		value: string,
		lastUsed: number
	}[],
	bio: string
}

export const generateNewAccessToken = () => {
	return crypto.randomBytes(32).toString('base64');
};

export const TOKEN_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

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

export const authorize = async (req: express.Request) => {
	let header = req.headers.authorization as string;
	if (!header) return null;

	let parts = header.split(' ');
	if (parts[0] !== 'Bearer') return null;

	let doc = await db.accounts.findOne({ 'tokens.value': parts[1] }) as AccountDoc;
	if (!doc) return null;

	let now = Date.now();
	let token = doc.tokens.find(x => x.value === parts[1]);;
	if (now - token.lastUsed >= TOKEN_TTL) return null;

	token.lastUsed = Date.now();
	await db.accounts.update({ _id: doc._id }, { $set: { tokens: doc.tokens} });

	return doc;
};

export const getProfileInfo = async (doc: AccountDoc): Promise<ProfileInfo> => {
	let hasAvatar = await fs.pathExists(path.join(__dirname, `storage/avatars/${doc._id}.jpg`));

	return {
		id: doc._id,
		username: doc.username,
		hasAvatar
	};
};

export const getExtendedProfileInfo = async (doc: AccountDoc): Promise<ExtendedProfileInfo> => {
	let profileInfo = await getProfileInfo(doc);

	let missionDocs = await db.missions.find({ addedBy: doc._id }) as MissionDoc[];
	let uploadedLevels: LevelInfo[] = [];

	for (let doc of missionDocs) {
		let mission = Mission.fromDoc(doc);
		uploadedLevels.push(mission.createLevelInfo());
	}

	return Object.assign(profileInfo, {
		bio: doc.bio,
		uploadedLevels
	});
};

export const getSignInInfo = async (doc: AccountDoc): Promise<SignInInfo> => {
	let profileInfo = await getProfileInfo(doc);
	let packs = await db.packs.find({ createdBy: doc._id }) as PackDoc[];

	return {
		profile: profileInfo,
		packs: packs.map(x => ({ id: x._id, name: x.name, levelIds: x.levels }))
	};
};