import { Mission, MissionDoc } from "./mission";
import { db } from "./globals";
import * as path from 'path';
import * as fs from 'fs-extra';
import { app } from "./server";
import * as express from 'express';
import { LevelInfo } from "../../shared/types";
import * as sharp from 'sharp';

const verifyLevelId = async (req: express.Request, res: express.Response) => {
	let levelId = Number(req.params.levelId);
	if (!Number.isInteger(levelId)) {
		res.status(400).send("400\nLevel ID has to be an integer.");
		return null;
	}

	let doc = await db.findOne({ _id: levelId });
	if (!doc) {
		res.status(404).send("404\nA level with this ID does not exist.");
		return null;
	}

	return levelId;
};

app.get('/api/level/:levelId/zip', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let assuming = req.query.assuming as string;
	if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

	let zip = await mission.createZip(assuming as ('none' | 'gold' | 'platinumquest'));
	let stream = zip.generateNodeStream();

	res.set('Content-Type', 'application/zip');
	res.set('Content-Disposition', `attachment; filename="${doc._id}.zip"`);
	stream.pipe(res);
});

app.get('/api/level/:levelId/image', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let imagePath = mission.getImagePath();
	if (!imagePath) {
		res.status(404).send("This level is missing an image thumbnail.");
		return;
	}

	let buffer = await fs.readFile(path.join(mission.baseDirectory, imagePath));

	if ('original' in req.query) {
		res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
		res.send(buffer);
		return;
	}

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
	
	// Default
	let resized = await sharp(buffer).resize({width: 640, height: 480, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 60}).toBuffer();
	res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
	res.send(resized);
});

app.get('/api/level/:levelId/dependencies', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let assuming = req.query.assuming as string;
	if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

	let normalizedDependencies = mission.getNormalizedDependencies(assuming as ('none' | 'gold' | 'platinumquest'));

	res.send(normalizedDependencies);
});

app.get('/api/level/:levelId/info', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	res.send(mission.createLevelInfo(doc._id));
});

app.get('/api/level/:levelId/mission-info', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	res.send(mission.info);
});

app.get('/api/list', async (req, res) => {
	let docs = await db.find({}) as MissionDoc[];
	let response: LevelInfo[] = [];

	for (let doc of docs) {
		let mission = Mission.fromDoc(doc);
		response.push(mission.createLevelInfo(doc._id));
	}

	res.send(response);
});