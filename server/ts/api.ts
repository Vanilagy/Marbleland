import { GameType, Mission, MissionDoc, Modification } from "./mission";
import { db } from "./globals";
import * as path from 'path';
import * as fs from 'fs-extra';
import { routes } from "./server";
import * as url from 'url';

const levelVerifier = async (parameters: Map<string, string>) => {
	let levelId = Number(parameters.get('levelId'));
	if (!Number.isInteger(levelId)) return {
		status: 400,
		body: "400\nLevel ID has to be an integer."
	};

	let doc = await db.findOne({ _id: levelId });
	if (!doc) return {
		status: 404,
		body: "404\nA level with this ID does not exist."
	};
};

routes.set('/api/level/<levelId>/zip', [levelVerifier, async (parameters: Map<string, string>, urlObj: url.URL) => {
	let levelId = Number(parameters.get('levelId'));
	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let assuming = urlObj.searchParams.get('assuming');
	if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

	let zip = await mission.createZip(assuming as ('none' | 'gold' | 'platinumquest'));
	let stream = zip.generateNodeStream();

	return {
		body: stream,
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${doc._id}.zip"`
		}
	};
}]);

routes.set('/api/level/<levelId>/image', [levelVerifier, async (parameters: Map<string, string>) => {
	let levelId = Number(parameters.get('levelId'));
	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let imagePath = mission.getImagePath();
	let stream = fs.createReadStream(path.join(mission.baseDirectory, imagePath));

	return {
		body: stream,
		headers: {
			'Content-Type': imagePath.endsWith('.png')? 'image/png' : 'image/jpeg'
		}
	};
}]);

routes.set('/api/level/<levelId>/dependencies', [levelVerifier, async (parameters: Map<string, string>, urlObj: url.URL) => {
	let levelId = Number(parameters.get('levelId'));
	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let assuming = urlObj.searchParams.get('assuming');
	if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

	let normalizedDependencies = mission.getNormalizedDependencies(assuming as ('none' | 'gold' | 'platinumquest'));

	return {
		body: normalizedDependencies
	};
}]);

routes.set('/api/level/<levelId>/info', [levelVerifier, async (parameters: Map<string, string>) => {
	let levelId = Number(parameters.get('levelId'));
	let doc = await db.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	return {
		body: mission.info
	};
}]);

routes.set('/api/list', async () => {
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

	return {
		body: response,
		headers: {
			"Content-Type": 'application/json'
		}
	};
});