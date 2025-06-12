import { Mission, MissionDoc } from "./mission";
import { config, db, initGlobals } from "./globals";
import { startHTTPServer } from "./server";
import { initApi } from "./api/api";
import { AccountDoc, isEmailVerificationEnabled, suspendAccount } from "./account";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as minimist from 'minimist';
import { LevelInfo, Modification } from "../../shared/types";
import { MisParser, MissionElementSimGroup, MissionElementType } from "./io/mis_parser";
import { initializeImageMagick } from "@imagemagick/magick-wasm";
import { initBackup } from "./backup";
import { reimportMissions, scanForMissions } from "./import";

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

	// Log out unverified users if email verification is enabled. This forces them to log in again and verify their email
	if (isEmailVerificationEnabled()) {
		const allUsers = await db.accounts.find({}) as AccountDoc[];
		
		let loggedOutCount = 0;
		for (const user of allUsers) {
			if (!user.emailVerified && user.tokens.length > 0) {
				// Log 'em out
				await db.accounts.update({ _id: user._id }, { $set: { tokens: [] } });
				loggedOutCount++;
			}
		}
		
		if (loggedOutCount > 0) {
			console.log(`Logged out ${loggedOutCount} unverified users.`);
		}
	}

	const wasmLocation = path.join(__dirname, '../node_modules/@imagemagick/magick-wasm/dist/magick.wasm');
	const wasmBytes = fs.readFileSync(wasmLocation);
	await initializeImageMagick(wasmBytes);
	
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

		process.exit();
	} else if (argv._[0] === 'delete-accounts') {
		const accountIds = argv._.slice(1).map(x => Number(x));

		for (const id of accountIds) {
			const account = await db.accounts.findOne({ _id: id }) as AccountDoc;
			if (!account) {
				continue;
			}

			await suspendAccount(account, 'Asshole, probably');

			await db.accounts.remove({ _id: id }, {});

			console.log(`Deleted account with ID ${id}`);
		}

		process.exit();
	} else {
		// Usual path, boot up the API and HTTP server.
		initApi();
		startHTTPServer(config.port);
		if (config.backupRepositoryPath) initBackup();
	}
};
init();