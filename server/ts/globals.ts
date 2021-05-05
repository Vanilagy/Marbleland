import { KeyValueStore, Util } from "./util";
import * as path from 'path';
import * as fs from 'fs-extra';
import Datastore from 'nedb-promises';
import { Config } from "./config";

/** Holds a directory structure. If the value is null, then the key is a file, otherwise the key is a directory and the value is another directory structure. */
export type DirectoryStructure = {[name: string]: null | DirectoryStructure};

export let config: { port: number, dataPQ: string };
export let keyValue: KeyValueStore<{ levelId: number, accountId: number, packId: number, commentId: number }>;
export let db: {
	missions: Datastore,
	accounts: Datastore,
	packs: Datastore,
	comments: Datastore
} = {} as any;
export let structureMBG: DirectoryStructure;
export let structurePQ: DirectoryStructure;
export let structureMBGSet: Set<string>;
export let structurePQSet: Set<string>;

export const initGlobals = async () => {
	let configExists = fs.existsSync(path.join(__dirname, 'data/config.json'));
	if (!configExists) fs.copyFileSync(path.join(__dirname, 'data/default_config.json'), path.join(__dirname, 'data/config.json'));
	config = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/config.json')).toString());
	Config.init();

	keyValue = new KeyValueStore(path.join(__dirname, 'storage/keyvalue.json'), { levelId: 0, accountId: 0, packId: 0, commentId: 0 });

	// Sometimes, NeDB kinda discards data for some weird reasons when first writing to a database file, so I'm doing this to (maybe) help prevent that:
	fs.ensureFileSync(path.join(__dirname, 'storage/missions.db'));
	fs.ensureFileSync(path.join(__dirname, 'storage/accounts.db'));
	fs.ensureFileSync(path.join(__dirname, 'storage/packs.db'));
	fs.ensureFileSync(path.join(__dirname, 'storage/comments.db'));

	db.missions = Datastore.create({ filename: path.join(__dirname, 'storage/missions.db'), autoload: true });
	db.missions.persistence.setAutocompactionInterval(1000 * 60 * 60); // Once an hour
	db.accounts = Datastore.create({ filename: path.join(__dirname, 'storage/accounts.db'), autoload: true });
	db.accounts.persistence.setAutocompactionInterval(1000 * 60 * 60);
	db.packs = Datastore.create({ filename: path.join(__dirname, 'storage/packs.db'), autoload: true });
	db.packs.persistence.setAutocompactionInterval(1000 * 60 * 60);
	db.comments = Datastore.create({ filename: path.join(__dirname, 'storage/comments.db'), autoload: true });
	db.comments.persistence.setAutocompactionInterval(1000 * 60 * 60);

	let pqStructurePath = path.join(__dirname, 'data/structure_pq.json');
	let exists = fs.existsSync(pqStructurePath);
	if (!exists) {
		console.log("No PQ data directory structure file found. Generating... (might take a while)");
		let structure = await scanDirectory(Config.dataPath);
		console.log("Generation complete.");

		fs.writeFileSync(pqStructurePath, JSON.stringify(structure));
	}

	// These two are used to quickly check if an asset is included in MBG/PQ or not
	structureMBG = Util.lowerCaseKeysDeep(JSON.parse(fs.readFileSync(path.join(__dirname, 'data/structure_mbg.json')).toString()));
	structurePQ = Util.lowerCaseKeysDeep(JSON.parse(fs.readFileSync(pqStructurePath).toString()));
	structureMBGSet = Util.directoryStructureToSet(structureMBG);
	structurePQSet = Util.directoryStructureToSet(structurePQ);
};

/** Scans the directory recursively. */
const scanDirectory = async (directoryPath: string) => {
	let files = await fs.readdir(directoryPath);
	let temp: DirectoryStructure = {};
	let promises: Promise<void>[] = [];

	for (let file of files) {
		promises.push(new Promise(async resolve => {
			let newPath = path.join(directoryPath, file);
			let stats = await fs.stat(newPath);
			if (stats.isDirectory()) temp[file] = await scanDirectory(newPath); // Recurse if necessary
			else temp[file] = null;

			resolve();
		}));
	}

	await Promise.all(promises);

	// Sort the keys to guarantee a deterministic outcome despite asynchronous nature of the function
	let keys = Object.keys(temp).sort((a, b) => a.localeCompare(b));
	let result: DirectoryStructure = {};
	for (let key of keys) result[key] = temp[key];
	return result;
};