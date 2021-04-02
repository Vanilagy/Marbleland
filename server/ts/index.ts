import { MisParser, MissionElementType } from "./mis_parser";
import * as fs from 'fs-extra';
import * as hxDif from '../lib/hxDif';
import { Mission } from "./mission";
import now from 'performance-now';

(async () => {
	let files = fs.readdirSync('D:\\HiGuyCLA\\cla-data\\data\\missions\\0-B');
	let total = files.filter(x => x.endsWith('.mis')).length;
	let count = 0;
	let missions: Mission[] = [];

	for (let file of files) {
		if (file.endsWith('.mis')) {
			let path = 'missions/0-B/' + file;
			console.log("Doing: ", path);

			let mission = new Mission(path);
			await mission.hydrate();
			missions.push(mission);

			console.log("done", ++count, total);
		}
	}

	let boiledDown = missions.map(x => ({ path: x.path, info: x.info, dependencies: [...x.dependencies], gameType: x.gameType, modification: x.modification }));
	let string = JSON.stringify(boiledDown, null, 2);

	fs.writeFileSync('missions.json', string);
})();