import { Mission, MissionDoc, reimportMissions, scanForMissions } from "./mission";
import { config, db, initGlobals } from "./globals";
import { startHTTPServer } from "./server";
import { initApi } from "./api/api";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as minimist from 'minimist';
import { LevelInfo, Modification } from "../../shared/types";
import { MisParser, MissionElementSimGroup, MissionElementType } from "./io/mis_parser";

interface CLAEntry {
	addTime: string,
	artist: string,
	baseName: string,
	bitmap: string,
	desc: string,
	difficulty: string,
	egg: boolean,
	gameType: string,
	gems: number,
	goldTime: number,
	id: number,
	modification: string,
	name: string,
	rating: number,
	time: number,
	weight: number
}

const init = async () => {
	// Ensure all necessary directories exist
	fs.ensureDirSync(path.join(__dirname, 'storage'));
	fs.ensureDirSync(path.join(__dirname, 'storage/avatars'));
	fs.ensureDirSync(path.join(__dirname, 'storage/pack_thumbnails'));
	await initGlobals();
	
	let argv = minimist(process.argv.slice(2));

	if (argv._[0] === 'add-directory') {
		// Import a directory of levels to the level database.
		await scanForMissions(argv._[1], argv["id-map"], !!argv["replace-duplicates"]);
		process.exit();
	} else if (argv._[0] === 'reimport') {
		await reimportMissions(argv._.slice(1).map(x => Number(x)), !!argv["allow-creation"]);
		process.exit();
	} else if (argv._[0] === 'datablock-filter') {
		let goldMissions = await db.missions.find({ modification: Modification.Gold }) as MissionDoc[];
		let acceptedDatablocks = (await fs.readFile(argv._[1])).toString().split('\n').map(x => x.toLowerCase().trim());
		let acceptedIds = new Set<number>();

		for (let mission of goldMissions) {
			let misPath = path.join(mission.baseDirectory, mission.relativePath);
			let misText = (await fs.readFile(misPath)).toString();
			let misFile = new MisParser(misText).parse();
			let fine = true;

			const traverse = (simGroup: MissionElementSimGroup) => {
				for (let element of simGroup.elements) {
					if (element._type === MissionElementType.SimGroup) {
						traverse(element);
					} else if (element._type === MissionElementType.Item) {
						if (element.datablock && !acceptedDatablocks.includes(element.datablock.toLowerCase()))
							fine = false;
					} else if (element._type === MissionElementType.StaticShape) {
						if (element.datablock && !acceptedDatablocks.includes(element.datablock.toLowerCase()))
							fine = false;
					} else if (element._type === MissionElementType.ParticleEmitterNode) {
						if (element.datablock && !acceptedDatablocks.includes(element.datablock.toLowerCase()))
							fine = false;
					}
				}
			};
			traverse(misFile.root);

			if (fine) acceptedIds.add(mission._id);
		}

		console.log(`Before CLA add: ${acceptedIds.size}`);

		let claList = JSON.parse((await fs.readFile('cla_list.json')).toString()) as CLAEntry[];
		claList = claList.filter(x => x.modification === 'gold' && x.gameType.toLowerCase() === 'single player');
		for (let entry of claList) acceptedIds.add(entry.id);

		console.log(`After CLA add: ${acceptedIds.size}`);

		let allDocs = await db.missions.find({}) as MissionDoc[];
		allDocs = allDocs.filter(x => acceptedIds.has(x._id));

		let result: LevelInfo[] = [];

		for (let doc of allDocs) {
			let mission = Mission.fromDoc(doc);
			let levelInfo = mission.createLevelInfo();
			result.push(levelInfo);
		}

		await fs.writeFile('gold_levels.json', JSON.stringify(result));
	} else {
		// Usual path, boot up the API and HTTP server.
		initApi();
		startHTTPServer(config.port);
	}
};
init();