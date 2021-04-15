import * as path from 'path';

export class Config {
	/** The path to the PQ data directory necessary for asset lookup. */
	static dataPath = path.posix.join(__dirname, 'data/data_pq');
}