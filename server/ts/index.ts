import { MisParser, MissionElementType } from "./mis_parser";
import * as fs from 'fs-extra';
import * as hxDif from '../lib/hxDif';
import { Mission } from "./mission";

(async () => {
	console.log(await Mission.getMissionDependencies('missions/0-B/1-up.mis' ?? 'missions/0-B/1_2_3.mis'));
})();



/*

let interiorBuffer = fs.readFileSync('D:\\HiGuyCLA\\cla-data\\data\\interiors\\123.dif').buffer as ArrayBuffer;

console.log(hxDif.haxe);

let dif = hxDif.Dif.LoadFromBuffer(hxDif.haxe_io_Bytes.ofData(interiorBuffer));
console.log(dif.interiors[0].materialList);

process.exit();*/

let text = fs.readFileSync('D:\\HiGuyCLA\\cla-data\\data\\missions\\0-B\\1_2_3.mis').toString();

let parser = new MisParser(text);
let result = parser.parse();
//console.log(result.root.elements.find(x => x._type === MissionElementType.InteriorInstance));