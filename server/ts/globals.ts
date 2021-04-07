import { KeyValueStore, Util } from "./util";
import * as path from 'path';
import * as fs from 'fs';
import Datastore from 'nedb-promises';

/** Holds a directory structure. If the value is null, then the key is a file, otherwise the key is a directory and the value is another directory structure. */
export type DirectoryStructure = {[name: string]: null | DirectoryStructure};

export let keyValue: KeyValueStore<{ levelId: number, accountId: number }>;
export let db: {
	missions: Datastore,
	accounts: Datastore	
} = {} as any;
export let structureMBG: DirectoryStructure;
export let structurePQ: DirectoryStructure;

export const initGlobals = () => {
	keyValue = new KeyValueStore(path.join(__dirname, 'storage/keyvalue.json'), { levelId: 0, accountId: 0 });

	db.missions = Datastore.create({ filename: path.join(__dirname, 'storage/missions.db'), autoload: true });
	db.missions.persistence.setAutocompactionInterval(1000 * 60 * 60); // Once an hour
	db.accounts = Datastore.create({ filename: path.join(__dirname, 'storage/accounts.db'), autoload: true });
	db.accounts.persistence.setAutocompactionInterval(1000 * 60 * 60);

	structureMBG = Util.lowerCaseKeysDeep(JSON.parse(fs.readFileSync(path.join(__dirname, 'data/structure_mbg.json')).toString()));
	structurePQ = Util.lowerCaseKeysDeep(JSON.parse(fs.readFileSync(path.join(__dirname, 'data/structure_pq.json')).toString()));
};