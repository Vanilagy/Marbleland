import * as fs from 'fs-extra';
import * as path from 'path';
import { MisFile, MisParser, MissionElementScriptObject, MissionElementSimGroup, MissionElementSky, MissionElementTSStatic, MissionElementType } from './mis_parser';
import hxDif from '../lib/hxDif';
import { Util } from './util';
import { DtsParser } from './dts_parser';
import JSZip from 'jszip';
import { Config } from './config';
import { db } from './globals';

const IGNORE_MATERIALS = ['NULL', 'ORIGIN', 'TRIGGER', 'FORCEFIELD'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export enum GameType {
	SinglePlayer = "single",
	Multiplayer = "multi"
}

export enum Modification {
	Gold = "gold",
	Platinum = "platinum",
	Fubar = "fubar",
	Ultra = "ultra",
	PlatinumQuest = "platinumquest"
}

export interface MissionDoc {
	_id: number,
	baseDirectory: string,
	relativePath: string,
	dependencies: string[],
	info: MissionElementScriptObject,
	gameType: GameType,
	modification: Modification,
	gems: number,
	hasEasterEgg: boolean
}

export class Mission {
	baseDirectory: string;
	relativePath: string;
	dependencies = new Set<string>();
	mis: MisFile;
	info: MissionElementScriptObject;
	gameType: GameType;
	modification: Modification;
	gems: number = 0;
	hasEasterEgg: boolean = false;
	visitedPaths = new Set<string>();

	constructor(baseDirectory: string, relativePath: string) {
		this.baseDirectory = baseDirectory;
		this.relativePath = relativePath;
	}

	static fromDoc(doc: MissionDoc) {
		let mission = new Mission(doc.baseDirectory, doc.relativePath);
		mission.dependencies = new Set(doc.dependencies);
		mission.info = doc.info;
		mission.gameType = doc.gameType;
		mission.modification = doc.modification;

		return mission;
	}

	async hydrate() {
		await this.parseMission();
		await this.findDependencies();
		this.scanSimGroup(this.mis.root);
		this.classify();
	}

	async parseMission() {
		let missionText = (await fs.readFile(path.join(this.baseDirectory, this.relativePath))).toString();
		let misFile = new MisParser(missionText).parse();
		this.mis = misFile;
	}

	async findDependencies() {
		let missionFileName = this.relativePath.slice(this.relativePath.lastIndexOf('/') + 1);
		let missionDirectory = this.relativePath.substring(0, this.relativePath.lastIndexOf('/'));

		// Add the mission itself
		this.dependencies.add(this.relativePath);

		// Add the mission thumbnail
		let fileNames = await Util.getFullFileNames(Util.removeExtension(missionFileName), path.join(this.baseDirectory, missionDirectory));
		let thumbnailPaths = fileNames.filter(x => IMAGE_EXTENSIONS.includes(path.extname(x)));
		for (let thumbnailPath of thumbnailPaths) this.dependencies.add(path.posix.join(missionDirectory, thumbnailPath));

		this.visitedPaths.clear();
		await this.addSimGroupDependencies(this.mis.root);
	}

	classify() {
		this.gameType = this.guessGameType();
		this.modification = this.guessModification();
	}

	guessGameType() {
		if (this.relativePath.startsWith('multiplayer/')) return GameType.Multiplayer;

		let i = this.info;

		// "Telltale" multiplayer stuff
		if (Array.isArray(i.score) || i.score0 || i.score1 ||
			Array.isArray(i.goldscore) || i.goldscore0 || i.goldscore1 ||
			Array.isArray(i.platinumscore) || i.platinumscore0 || i.platinumscore1 ||
			Array.isArray(i.ultimatescore) || i.ultimatescore0 || i.ultimatescore1 ||
			Array.isArray(i.awesomescore) || i.awesomescore0 || i.awesomescore1)
			return GameType.Multiplayer;

		for (let dependency of this.dependencies) {
			if (dependency.startsWith('multiplayer/interiors')) return GameType.Multiplayer;
		}

		return GameType.SinglePlayer;
	}

	guessModification() {
		const index = {
			[Modification.Gold]: 0,
			[Modification.Platinum]: 1,
			[Modification.Fubar]: 1,
			[Modification.Ultra]: 1,
			[Modification.PlatinumQuest]: 2
		};
		const stringMap = {
			"gold": Modification.Gold,
			"platinum": Modification.Platinum,
			"fubar": Modification.Fubar,
			"ultra": Modification.Ultra,
			"platinumquest": Modification.PlatinumQuest
		};

		let i = this.info;

		if (i.game && !i.game.startsWith('custom')) return stringMap[i.game.toLowerCase() as keyof typeof stringMap];
		if (i.modification) return stringMap[i.modification.toLowerCase() as keyof typeof stringMap];

		let result = Modification.Gold;

		const pickHigher = (mod: Modification) => {
			if (index[mod] > index[result]) result = mod;
		};

		if (i.platinumtime) pickHigher(Modification.PlatinumQuest); // Added in PQ
		if (i.awesometime) pickHigher(Modification.PlatinumQuest);
		if (i.awesomescore) pickHigher(Modification.PlatinumQuest);
		if (Array.isArray(i.awesomescore)) pickHigher(Modification.PlatinumQuest);

		if (i.ultimatetime) pickHigher(Modification.Platinum);
		if (i.ultimatescore) pickHigher(Modification.Platinum);
		if (Array.isArray(i.score)) pickHigher(Modification.Platinum);
		if (Array.isArray(i.platinumscore)) pickHigher(Modification.Platinum);
		if (Array.isArray(i.ultimatescore)) pickHigher(Modification.Platinum);
		if (this.hasEasterEgg) pickHigher(Modification.Platinum);

		for (let dependency of this.dependencies) {
			if (dependency.startsWith('pq_')) pickHigher(Modification.PlatinumQuest);
			if (dependency.startsWith('interiors_pq')) pickHigher(Modification.PlatinumQuest);
			if (dependency.startsWith('mbp_')) pickHigher(Modification.Platinum);
			if (dependency.startsWith('interiors_mbp')) pickHigher(Modification.Platinum);
			if (dependency.startsWith('fubargame')) pickHigher(Modification.Fubar);
			if (dependency.startsWith('mbu_')) pickHigher(Modification.Ultra);
		}

		return result;
	}

	async createZip() {
		let zip = new JSZip();

		for (let dependency of this.dependencies) {
			let fullPath: string, exists: boolean;

			fullPath = path.join(this.baseDirectory, dependency);
			exists = await fs.pathExists(fullPath);
			if (!exists) {
				fullPath = path.join(Config.dataPath, dependency);
				exists = await fs.pathExists(fullPath);
			}

			if (exists) {
				let stream = fs.createReadStream(fullPath);
				zip.file(dependency, stream);
			}
		}

		return zip;
	}

	createDoc(id: number): MissionDoc {
		return {
			_id: id,
			baseDirectory: this.baseDirectory,
			relativePath: this.relativePath,
			dependencies: [...this.dependencies],
			info: this.info,
			gameType: this.gameType,
			modification: this.modification,
			gems: this.gems,
			hasEasterEgg: this.hasEasterEgg
		};
	}

	getImagePath() {
		let startsWith = Util.removeExtension(this.relativePath);
		let potentialNames = IMAGE_EXTENSIONS.map(x => startsWith + x);
		return [...this.dependencies].find(x => potentialNames.includes(x)) ?? null;
	}

	getBaseName() {
		return this.relativePath.slice(this.relativePath.lastIndexOf('/') + 1);
	}

	scanSimGroup(simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.SimGroup) {
				this.scanSimGroup(element);
			} else if (element._type === MissionElementType.Item) {
				if (element.datablock?.includes('GemItem')) this.gems++;
				if (['EasterEgg', 'NestEgg'].includes(element.datablock)) this.hasEasterEgg = true;
			} else if (!this.info && element._type === MissionElementType.ScriptObject && element._name === "MissionInfo") {
				this.info = element;
				this.info = Util.jsonClone(this.info);

				// Remove non-standard fields
				delete this.info._id;
				delete this.info._type;
				delete this.info._name;
			}
		}
	}

	async addSimGroupDependencies(simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.SimGroup) {
				await this.addSimGroupDependencies(element);
			} else if (element._type === MissionElementType.InteriorInstance) {
				await this.addInteriorDependencies(element.interiorfile);
			} else if (element._type === MissionElementType.PathedInterior) {
				await this.addInteriorDependencies(element.interiorresource);
			} else if (element._type === MissionElementType.Sky) {
				await this.addSkyDependencies(element);
			} else if (element._type === MissionElementType.TSStatic) {
				// TODO
				//await this.addTSStaticDependencies(element);
			}
		}
	}

	async addInteriorDependencies(rawInteriorPath: string) {
		let interiorPath = rawInteriorPath.slice(rawInteriorPath.indexOf('data/') + 'data/'.length);
		let interiorDirectory = interiorPath.substring(0, interiorPath.lastIndexOf('/'));

		if (this.visitedPaths.has(interiorPath)) return;
		else this.visitedPaths.add(interiorPath);

		let fullPath = await this.findPath(interiorPath);
		if (!fullPath) return;

		this.dependencies.add(interiorPath);

		let arrayBuffer = (await fs.readFile(fullPath)).buffer;
		let dif = hxDif.Dif.LoadFromArrayBuffer(arrayBuffer);

		for (let interior of dif.interiors.concat(dif.subObjects)) {
			let materialPaths = await this.getMaterialPaths(interior.materialList, interiorDirectory);
			for (let path of materialPaths) this.dependencies.add(path);
		}
	}

	async getMaterialPaths(materialList: hxDif.Dif["interiors"][number]["materialList"], interiorDirectory: string) {
		let paths: string[] = [];

		for (let material of materialList) {
			if (IGNORE_MATERIALS.includes(material)) continue;

			let fileName = material.slice(material.lastIndexOf('/') + 1);
			let filePath = await this.findFile(fileName, interiorDirectory);
			if (filePath) paths.push(filePath);
		}

		return paths;
	}
	
	async findFile(fileName: string, relativePath: string, walkUp = true): Promise<string> {
		let dir1 = await Util.readdirCached(path.join(this.baseDirectory, relativePath));
		let dir2 = await Util.readdirCached(path.join(Config.dataPath, relativePath));

		for (let file of dir1.concat(dir2)) {
			if (file.startsWith(fileName)) return path.posix.join(relativePath, file);
		}

		let slashIndex = relativePath.lastIndexOf('/');
		if (slashIndex === -1 || !walkUp) return null;
		return this.findFile(fileName, relativePath.slice(0, slashIndex));
	}

	async findPath(filePath: string) {
		let fullPath: string, exists: boolean;

		fullPath = path.join(this.baseDirectory, filePath);
		exists = await fs.pathExists(fullPath);
		if (exists) return fullPath;

		fullPath = path.join(Config.dataPath, filePath);
		exists = await fs.pathExists(fullPath);
		if (exists) return fullPath;
		
		return null;
	}

	async addSkyDependencies(element: MissionElementSky) {
		let skyPath = element.materiallist.slice(element.materiallist.indexOf('data/') + 'data/'.length);
		let skyDirectory = skyPath.substring(0, skyPath.lastIndexOf('/'));

		if (this.visitedPaths.has(skyPath)) return;
		else this.visitedPaths.add(skyPath);
		
		let fullPath = await this.findPath(skyPath);
		if (!fullPath) return;

		this.dependencies.add(skyPath);

		let dmlText = (await fs.readFile(fullPath)).toString();
		let lines = dmlText.split('\n').map(x => x.trim()).filter(x => x);

		for (let line of lines) {
			let filePath = await this.findFile(line, skyDirectory);
			if (filePath) this.dependencies.add(filePath);
		}
	}

	async addTSStaticDependencies(element: MissionElementTSStatic) {
		let dtsPath = element.shapename.slice(element.shapename.indexOf('data/') + 'data/'.length);
		let dtsDirectory = dtsPath.substring(0, dtsPath.lastIndexOf('/'));

		if (this.visitedPaths.has(dtsPath)) return;
		else this.visitedPaths.add(dtsPath);

		let fullPath = await this.findPath(dtsPath);
		if (!fullPath) return;

		this.dependencies.add(dtsPath);

		let buffer = (await fs.readFile(fullPath)).buffer;
		let dtsFile = new DtsParser(buffer).parse();

		for (let matName of dtsFile.matNames) {
			let relativePath = await this.findFile(matName, dtsDirectory, false);
			if (relativePath) {
				if (relativePath.endsWith('.ifl')) {
					let fullPath = await this.findPath(relativePath);
					let iflText = (await fs.readFile(fullPath)).toString();
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							this.dependencies.add(path.posix.join(dtsDirectory, textureName));
						}
					}
				} 

				this.dependencies.add(relativePath);
			}
		}
	}
}

const claList = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/cla_list.json')).toString()) as {id: number, baseName: string}[];
export const scanForMissions = async (baseDirectory: string, relativePath: string = '') => {
	let entries = await fs.readdir(path.join(baseDirectory, relativePath));

	for (let entry of entries) {
		let joined = path.join(baseDirectory, relativePath, entry);
		let stat = await fs.stat(joined);
		let fromStart = path.posix.join(relativePath, entry);

		if (stat.isDirectory()) {
			await scanForMissions(baseDirectory, fromStart);
		} else {
			if (entry.endsWith('.mis')) {
				console.log("Importing: ", fromStart);

				let mission = new Mission(baseDirectory, fromStart);
				await mission.hydrate();

				let baseName = mission.getBaseName();
				let id = claList.find(x => x.baseName === baseName)?.id;
				let doc = mission.createDoc(id);
				await db.update({ _id: id }, doc, { upsert: true });

				console.log("Level imported successfully with id " + id);
			}
		}
	}
};