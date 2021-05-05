import * as path from 'path';
import { config } from './globals';

export class Config {
	/** The path to the PQ data directory necessary for asset lookup. */
	static dataPath: string;

	static init() {
		this.dataPath = path.resolve(__dirname, config.dataPQ).replace(/\\/g, '/'); // Make sure it's a POSIX path
	}
}