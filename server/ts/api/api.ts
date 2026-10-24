import * as fs from 'node:fs/promises';
import { app } from "../server";
import express from 'express';
import sharp from 'sharp';
import { z } from 'zod';
import { initLevelApi } from './api_level';
import { initCommentApi } from './api_comment';
import { initAccountApi } from './api_account';
import { initPackApi } from './api_pack';
import { initHomeApi } from './api_home';
import { Util, MAX_IMAGE_PIXELS } from '../util';
import { authorize, isSuspended } from '../account';

/** Sets up all Express handlers for the API. */
export const initApi = () => {
	// Binary bodies are parsed per route instead, after authorization (see parseBinaryBody)
	app.use(express.json()); // The default size limits for these are sane enough
	app.use(express.text());
	app.use(express.urlencoded({ extended: true }));
	
	// Allow the CORS thing for all API requests
	app.use('/api', (req, res, next) => {
		res.set('Access-Control-Allow-Origin', '*');
		res.set('Cache-Control', 'no-cache, no-store'); // Don't cache API endpoints by default; can still be overridden by some endpoints
		next();
	});

	initLevelApi();
	initCommentApi();
	initAccountApi();
	initPackApi();
	initHomeApi();
};

/** Gates a route to signed-in, non-suspended accounts and stashes the account doc on res.locals.accountDoc. Placed before
 * any body parsing so that unauthorized requests never get their body buffered. */
export const requireAccount: express.RequestHandler = async (req, res, next) => {
	let { doc } = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}
	if (isSuspended(doc)) {
		res.status(403).send("403\nAccount is suspended.");
		return;
	}

	res.locals.accountDoc = doc;
	next();
};

/** Parses binary uploads (zips, images), whose size we want to limit. Mounted per route, after requireAccount. */
export const parseBinaryBody = express.raw({
	limit: '100mb',
	type: ['application/octet-stream', 'application/zip']
});

/** Validates request input against a schema. Responds with 400 Bad Request and returns null if it doesn't match. */
export const validate = <T extends z.ZodType>(schema: T, input: unknown, res: express.Response) => {
	let result = schema.safeParse(input);
	if (!result.success) {
		res.status(400).send({
			status: 'error',
			reason: 'Invalid request.'
		});
		return null;
	}

	return result.data;
};

export const compressAndSendImage = async (imagePath: string, req: express.Request, res: express.Response, defaultDimensions: {width: number, height: number}, bufferOverride?: Buffer) => {
	let buffer = bufferOverride ?? await fs.readFile(imagePath);

	// Convert the image to PNG if it's in a niche format
	if (['.dds', '.bmp'].some(x => imagePath.toLowerCase().endsWith(x))) {
		buffer = await Util.nicheFormatToPng(buffer);
		imagePath = imagePath.slice(0, -4) + '.png';
	}

	if ('original' in req.query) {
		// Transmit the uncompressed, original image
		res.set('Content-Type', imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
		res.set('Access-Control-Allow-Origin', '*');
		res.send(buffer);
		return;
	}

	// See if the user specified custom dimensions and if so, resize the image
	if (req.query.width && req.query.height) {
		let width = Number(req.query.width);
		let height = Number(req.query.height);
		let valid = true;

		if (!Number.isInteger(width) || !Number.isInteger(height)) valid = false;
		if (width < 1 || height < 1) valid = false;
		if (width > 2048 || height > 2048) valid = false;

		if (!valid) {
			res.status(400).send("400\nQuery parameters invalid.");
			return;
		}

		let resized = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).resize({ width, height, fit: 'cover' }).jpeg({ quality: 60 }).toBuffer();
		res.set('Content-Type', 'image/jpeg');
		res.set('Access-Control-Allow-Origin', '*');
		res.send(resized);

		return;
	}

	// Default case, compress and resize to a reasonable quality
	let resized = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).resize({width: defaultDimensions.width, height: defaultDimensions.height, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 60}).toBuffer();
	res.set('Content-Type', imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg');
	res.set('Access-Control-Allow-Origin', '*');
	res.send(resized);
};

const IP_TIMEOUT = 24*60*60*1000;

export const ipTimeouts = new Map<string, number>();

// Every hour, forget the timeouts that have run out
export const startIpTimeoutCleanup = () => {
	setInterval(() => {
		let now = Date.now();
		for (let [key, lastExecution] of ipTimeouts) {
			if (now - lastExecution >= IP_TIMEOUT) ipTimeouts.delete(key);
		}
	}, 60*60*1000);
};

/* Executes a callback only if the requester's IP hasn't done an action with the same ID in the last 24 hours. Prevents spamming of stuff. */
export const executeWithIpTimeout = async (req: express.Request, id: string, callback: () => Promise<void>) => {
	let key = `${req.ip} ${id}`;
	let lastExecution = ipTimeouts.get(key);
	let now = Date.now();
	let valid = !lastExecution || (now - lastExecution) >= IP_TIMEOUT;

	if (!valid) return;

	ipTimeouts.set(key, now);
	await callback();
};