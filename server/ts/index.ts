import { scanForMissions } from "./mission";
import { initGlobals } from "./globals";
import { startHTTPServer } from "./server";

initGlobals();

const init = async () => {
	if (process.argv[2] === 'add-directory') {
		await scanForMissions(process.argv[3]);
		process.exit();
	} else {
		startHTTPServer();
	}
};
init();