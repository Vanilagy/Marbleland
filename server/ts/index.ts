import { scanForMissions } from "./mission";
import { initGlobals } from "./globals";
import { startHTTPServer } from "./server";
import * as fs from 'fs-extra';
import * as path from 'path';

const init = async () => {
	fs.ensureDirSync(path.join(__dirname, 'storage'));
	initGlobals();

	if (process.argv[2] === 'add-directory') {
		await scanForMissions(process.argv[3]);
		process.exit();
	} else {
		startHTTPServer(8080);
	}
};
init();