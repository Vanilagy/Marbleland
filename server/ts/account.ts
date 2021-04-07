import * as crypto from 'crypto';
import { db } from './globals';

export interface AccountDoc {
	_id: number,
	email: string,
	username: string,
	passwordHash: string,
	tokens: {
		value: string,
		lastUsed: number
	}[]
}

export const generateNewAccessToken = () => {
	return crypto.randomBytes(16).toString('hex');
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