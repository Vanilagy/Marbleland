import { refreshMissions, scanForMissions } from "./mission";
import { initGlobals } from "./globals";
import { startHTTPServer } from "./server";
import { initApi } from "./api/api";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as minimist from 'minimist';

const init = async () => {
	// Ensure all necessary directories exist
	fs.ensureDirSync(path.join(__dirname, 'storage'));
	fs.ensureDirSync(path.join(__dirname, 'storage/avatars'));
	fs.ensureDirSync(path.join(__dirname, 'storage/pack_thumbnails'));
	initGlobals();
	
	let argv = minimist(process.argv.slice(2));

	if (argv._[0] === 'add-directory') {
		// Import a directory of levels to the level database.
		await scanForMissions(argv._[1], argv["id-map"], !!argv["replace-duplicates"]);
		process.exit();
	} else if (argv._[0] === 'refresh-missions') {
		await refreshMissions();
		process.exit();
	} else {
		// Usual path, boot up the API and HTTP server.
		initApi();
		startHTTPServer(8080);
	}
};
init();