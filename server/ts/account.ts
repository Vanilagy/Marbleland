import * as crypto from 'crypto';
import { db } from './globals';
import * as express from 'express';

export interface AccountDoc {
	_id: number,
	email: string,
	username: string,
	passwordHash: string,
	created: number,
	tokens: {
		value: string,
		lastUsed: number
	}[]
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