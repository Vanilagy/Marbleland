import { scanForMissions } from "./mission";
import { initGlobals } from "./globals";
import { startHTTPServer } from "./server";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as minimist from 'minimist';
import './api';

const init = async () => {
	fs.ensureDirSync(path.join(__dirname, 'storage'));
	initGlobals();

	let argv = minimist(process.argv.slice(2));

	if (argv._[0] === 'add-directory') {
		await scanForMissions(argv._[1], argv["id-map"]);
		process.exit();
	} else {
		startHTTPServer(8080);
	}
};
init();