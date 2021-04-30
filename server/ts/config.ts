import * as path from 'path';
import { config } from './globals';

export class Config {
	/** The path to the PQ data directory necessary for asset lookup. */
	static dataPath: string;

	static init() {
		this.dataPath = path.resolve(__dirname, config.dataPq).replace(/\\/g, '/'); // Make sure it's a POSIX path
		console.log(this.dataPath);
	}
}