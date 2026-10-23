import { KeyValueStore, Util } from "./util";
import * as path from 'path';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import Datastore from '@seald-io/nedb';
import { Config } from "./config";
import { GameDefinition, LeaderboardDefinition } from "../../shared/types";
import { SERVER_DIR } from './paths';
import type { MissionDoc } from './mission';
import type { AccountDoc, PendingRegistrationDoc } from './account';
import type { PackDoc } from './pack';
import type { CommentDoc } from './comment';

/** Holds a directory structure. If the value is null, then the key is a file, otherwise the key is a directory and the value is another directory structure. */
export type DirectoryStructure = {[name: string]: null | DirectoryStructure};

export let config: {
	port: number,
	dataPQ: string,
	backupRepositoryPath: string,
	backupRepositoryRemote: string,
	backupPeriod: number,
	backupPushSizeLimit: number,
	games: GameDefinition[],
	leaderboardSources: LeaderboardDefinition[],
	brevoApiKey: string | null,
	brevoSenderEmail: string | null,
	brevoSenderName: string | null,
	userCheckApiKey: string | null,
};
export let keyValue: KeyValueStore<{ levelId: number, accountId: number, packId: number, commentId: number }>;
export let db: {
	missions: Datastore<MissionDoc>,
	accounts: Datastore<AccountDoc>,
	packs: Datastore<PackDoc>,
	comments: Datastore<CommentDoc>,
	pendingRegistrations: Datastore<PendingRegistrationDoc>
} = {} as any;
export let structureMBG: DirectoryStructure;
export let structurePQ: DirectoryStructure;
export let structureMBGSet: Set<string>;
export let structurePQSet: Set<string>;
export let datablocksMBG: string[];
export let datablocksMBW: string[];

export let mbcryptRsaKey: crypto.KeyObject;
export let mbcryptAesKey: Buffer;

export const initGlobals = async () => {
	let configExists = fs.existsSync(path.join(SERVER_DIR, 'data/config.json'));
	if (!configExists) fs.copyFileSync(path.join(SERVER_DIR, 'data/default_config.json'), path.join(SERVER_DIR, 'data/config.json'));

	config = JSON.parse(fs.readFileSync(path.join(SERVER_DIR, 'data/config.json')).toString());

	// Copy over all new properties in default config that haven't been added to config
	let defaultConfig = JSON.parse(fs.readFileSync(path.join(SERVER_DIR, 'data/default_config.json')).toString());
	let changed = false;
	for (let key in defaultConfig) {
		if (config[key as keyof typeof config] === undefined) {
			(config as any)[key] = defaultConfig[key];
			changed = true;
		}
	}
	if (changed) fs.writeFileSync(path.join(SERVER_DIR, 'data/config.json'), JSON.stringify(config, null, 4));

	Config.init();

	if (fs.existsSync(path.join(SERVER_DIR, 'data/key.txt'))) {
		let key = parseKeyfile(path.join(SERVER_DIR, 'data/key.txt'));
		mbcryptRsaKey = key.rsakey;
		mbcryptAesKey = key.aeskey;
	}
	
	keyValue = new KeyValueStore(path.join(SERVER_DIR, 'storage/keyvalue.json'), { levelId: 1, accountId: 1, packId: 1, commentId: 1 });

	// Sometimes, NeDB kinda discards data for some weird reasons when first writing to a database file, so I'm doing this to (maybe) help prevent that:
	fs.appendFileSync(path.join(SERVER_DIR, 'storage/missions.db'), '');
	fs.appendFileSync(path.join(SERVER_DIR, 'storage/accounts.db'), '');
	fs.appendFileSync(path.join(SERVER_DIR, 'storage/packs.db'), '');
	fs.appendFileSync(path.join(SERVER_DIR, 'storage/comments.db'), '');
	fs.appendFileSync(path.join(SERVER_DIR, 'storage/pending_registrations.db'), '');

	db.missions = new Datastore({
		filename: path.join(SERVER_DIR, 'storage/missions.db'),
		autoload: true
	});
	db.missions.setAutocompactionInterval(1000 * 60 * 60); // Once an hour
	db.accounts = new Datastore({
		filename: path.join(SERVER_DIR, 'storage/accounts.db'),
		autoload: true
	});
	db.accounts.setAutocompactionInterval(1000 * 60 * 60);
	db.packs = new Datastore({
		filename: path.join(SERVER_DIR, 'storage/packs.db'),
		autoload: true
	});
	db.packs.setAutocompactionInterval(1000 * 60 * 60);
	db.comments = new Datastore({
		filename: path.join(SERVER_DIR, 'storage/comments.db'),
		autoload: true
	});
	db.comments.setAutocompactionInterval(1000 * 60 * 60);
	db.pendingRegistrations = new Datastore({
		filename: path.join(SERVER_DIR, 'storage/pending_registrations.db'),
		autoload: true
	});
	db.pendingRegistrations.setAutocompactionInterval(1000 * 60 * 60);

	let pqStructurePath = path.join(SERVER_DIR, 'data/structure_pq.json');
	let exists = fs.existsSync(pqStructurePath);
	if (!exists) {
		console.log("No PQ data directory structure file found. Generating... (might take a while)");
		let structure = await scanDirectory(Config.dataPath);
		console.log("Generation complete.");

		fs.writeFileSync(pqStructurePath, JSON.stringify(structure));
	}

	// These two are used to quickly check if an asset is included in MBG/PQ or not
	structureMBG = Util.lowerCaseKeysDeep(JSON.parse(fs.readFileSync(path.join(SERVER_DIR, 'data/structure_mbg.json')).toString()));
	structurePQ = Util.lowerCaseKeysDeep(JSON.parse(fs.readFileSync(pqStructurePath).toString()));
	structureMBGSet = Util.directoryStructureToSet(structureMBG);
	structurePQSet = Util.directoryStructureToSet(structurePQ);

	datablocksMBG = fs.readFileSync(path.join(SERVER_DIR, 'data/datablocks_mbg.txt')).toString().split('\n').map(x => x.trim().toLowerCase()).filter(Boolean);
	datablocksMBW = fs.readFileSync(path.join(SERVER_DIR, 'data/datablocks_mbw.txt')).toString().split('\n').map(x => x.trim().toLowerCase()).filter(Boolean);
};

/** Scans the directory recursively. */
const scanDirectory = async (directoryPath: string) => {
	let files = await fs.promises.readdir(directoryPath);
	let temp: DirectoryStructure = {};
	let promises: Promise<void>[] = [];

	for (let file of files) {
		promises.push(new Promise(async resolve => {
			let newPath = path.join(directoryPath, file);
			let stats = await fs.promises.stat(newPath);
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

const parseKeyfile = (file: string) => {
    let data = fs.readFileSync(file, "utf-8");
    let key = data.substring(data.indexOf("-----BEGIN RSA PRIVATE KEY-----") + 31, data.indexOf("-----END RSA PRIVATE KEY-----")).replace(/\s/g, '');
    let rsakey = crypto.createPrivateKey({
        key: Buffer.from(key, 'base64'),
        format: 'der',
        type: 'pkcs1'
    });
    let aeskey = Buffer.from(data.substring(data.indexOf("-----BEGIN AES KEY-----") + 25, data.indexOf("-----END AES KEY-----") - 2), "base64");
    return {
        rsakey: rsakey,
        aeskey: aeskey
    };
};