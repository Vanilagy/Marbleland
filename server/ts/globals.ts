import { KeyValueStore } from "./util";
import * as path from 'path';
import Datastore from 'nedb-promises';

export let keyValue: KeyValueStore<{ levelId: number }>;
export let db: Datastore;

export const initGlobals = () => {
	keyValue = new KeyValueStore(path.join(__dirname, '../keyvalue.json'), { levelId: 0 });
	db = Datastore.create({ filename: path.join(__dirname, '../main.db'), autoload: true });
	db.persistence.setAutocompactionInterval(1000 * 60 * 60 * 24); // Once a day
};