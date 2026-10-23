import * as path from 'path';
import { config } from './globals';
import { SERVER_DIR } from './paths';

export class Config {
	/** The path to the PQ data directory necessary for asset lookup. */
	static dataPath: string;

	static init() {
		this.dataPath = path.resolve(SERVER_DIR, config.dataPQ).replace(/\\/g, '/'); // Make sure it's a POSIX path
	}
}