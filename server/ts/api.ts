import { GameType, Mission, MissionDoc, Modification } from "./mission";
import { db } from "./globals";
import * as path from 'path';
import * as fs from 'fs-extra';
import { app } from "./server";
import * as express from 'express';

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
	let stream = fs.createReadStream(path.join(mission.baseDirectory, imagePath));

	res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
	stream.pipe(res);
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

	res.send(mission.info);
});

app.get('/api/list', async (req, res) => {
	let docs = await db.find({}) as MissionDoc[];
	let response: {
		id: number,
		baseName: string,
		gameType: GameType,
		modification: Modification,
		name: string,
		artist: string,
		desc: string,
		qualifyingTime: number,
		goldTime: number,
		platinumTime: number,
		ultimateTime: number,
		awesomeTime: number,
		gems: number,
		hasEasterEgg: boolean
	}[] = [];

	for (let doc of docs) {
		response.push({
			id: doc._id,
			baseName: doc.relativePath.slice(doc.relativePath.lastIndexOf('/') + 1),
			gameType: doc.gameType,
			modification: doc.modification,
			name: doc.info.name,
			artist: doc.info.artist,
			desc: doc.info.desc,
			qualifyingTime: doc.info.time? Number(doc.info.time) : undefined,
			goldTime: doc.info.goldtime? Number(doc.info.goldtime) : undefined,
			platinumTime: doc.info.platinumtime? Number(doc.info.platinumtime) : undefined,
			ultimateTime: doc.info.ultimatetime? Number(doc.info.ultimatetime) : undefined,
			awesomeTime: doc.info.awesometime? Number(doc.info.awesometime) : undefined,
			gems: doc.gems,
			hasEasterEgg: doc.hasEasterEgg
		});
	}

	res.send(response);
});