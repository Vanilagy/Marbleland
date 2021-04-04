import { GameType, Mission, MissionDoc, Modification } from "./mission";
import * as http from 'http';
import * as url from 'url';
import { db } from "./globals";
import * as path from 'path';
import * as fs from 'fs-extra';

export const startHTTPServer = (port: number) => {
	http.createServer(async (req, res) => {
		let urlObj = new url.URL(req.url, 'http://localhost/');
	
		if (urlObj.pathname.startsWith('/api/level/')) {
			let parts = urlObj.pathname.split('/').slice(3);
			let levelId = Number(parts[0]);
			let type = parts[1];
	
			let doc = await db.findOne({ _id: levelId }) as MissionDoc;
			let mission = Mission.fromDoc(doc);
	
			if (type === 'zip') {
				let assuming = urlObj.searchParams.get('assuming');
				if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

				let zip = await mission.createZip(assuming as ('none' | 'gold' | 'platinumquest'));
				let stream = zip.generateNodeStream();
	
				res.writeHead(200, {
					'Content-Disposition': `attachment; filename="${doc._id}.zip"`
				});
				stream.pipe(res);
			} else if (type === 'image') {
				let imagePath = mission.getImagePath();
				let stream = fs.createReadStream(path.join(mission.baseDirectory, imagePath));
	
				res.writeHead(200, {});
				stream.pipe(res);
			} else if (type === 'dependencies') {
				let assuming = urlObj.searchParams.get('assuming');
				if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

				let normalizedDependencies = mission.getNormalizedDependencies(assuming as ('none' | 'gold' | 'platinumquest'));

				res.writeHead(200, {});
				res.end(JSON.stringify(normalizedDependencies, null, '\t'));
			} else if (type === 'info') {
				res.writeHead(200, {});
				res.end(JSON.stringify(mission.info, null, '\t'));
			} else {
				res.writeHead(400);
				res.end("400 Bad Request");
			}
	
			return;
		} else if (urlObj.pathname === '/api/list') {
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
	
			res.writeHead(200, {});
			res.end(JSON.stringify(response));
	
			return;
		}
	
		res.end();
	}).listen(port);

	console.log(`Started HTTP server on port ${port}.`);
};