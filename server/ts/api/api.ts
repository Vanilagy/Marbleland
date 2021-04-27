import * as fs from 'fs-extra';
import { app } from "../server";
import * as express from 'express';
import * as sharp from 'sharp';
import { initLevelApi } from './api_level';
import { initCommentApi } from './api_comment';
import { initAccountApi } from './api_account';
import { initPackApi } from './api_pack';
import { initHomeApi } from './api_home';

/** Sets up all Express handlers for the API. */
export const initApi = () => {
	app.use(express.raw({ // Refers to binary data uploads, in our case mainly zips, whose size we want to limit.
		limit: '15mb',
		type: ['application/octet-stream', 'application/zip']
	}));
	app.use(express.json()); // The default size limits for these are sane enough
	app.use(express.text());
	
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

export const compressAndSendImage = async (imagePath: string, req: express.Request, res: express.Response, defaultDimensions: {width: number, height: number}) => {
	let buffer = await fs.readFile(imagePath);

	if ('original' in req.query) {
		// Transmit the uncompressed, original image
		res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
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

		let resized = await sharp(buffer).resize({width, height, fit: 'cover'}).jpeg({quality: 60}).toBuffer();
		res.set('Content-Type', 'image/jpeg');
		res.send(resized);

		return;
	}
	
	// Default case, compress and resize to a reasonable quality
	let resized = await sharp(buffer).resize({width: defaultDimensions.width, height: defaultDimensions.height, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 60}).toBuffer();
	res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
	res.send(resized);
};