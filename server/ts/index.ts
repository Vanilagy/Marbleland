import { MisParser, MissionElementType } from "./mis_parser";
import * as fs from 'fs-extra';
import * as hxDif from '../lib/hxDif';
import { Mission } from "./mission";
import now from 'performance-now';

(async () => {
	let files = fs.readdirSync('D:\\HiGuyCLA\\cla-data\\data\\missions\\0-B');
	let total = files.filter(x => x.endsWith('.mis')).length;
	let count = 0;
	let promises: Promise<any>[] = [];
	for (let file of files) {
		if (file.endsWith('.mis')) {
			//console.log("Doing: ", 'missions/0-B/' + file);
			//console.time()
			promises.push(Mission.getMissionDependencies('missions/0-B/' + file));
			//console.timeEnd()
			//console.log("done", ++count, total);
		}
	}

	let start = now();
	await Promise.all(promises);
	console.log((now() - start) / total);
	//console.log(await Mission.getMissionDependencies('missions/U-Z/Xmarksthespot.mis' ?? 'missions/0-B/1-up.mis' ?? 'missions/0-B/1_2_3.mis'));
})();