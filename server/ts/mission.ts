import * as fs from 'fs-extra';
import * as path from 'path';
import { Config } from './config';
import { MisFile, MisParser, MissionElementScriptObject, MissionElementSimGroup, MissionElementSky, MissionElementTSStatic, MissionElementType } from './mis_parser';
import hxDif from '../lib/hxDif';
import { Util } from './util';
import { DtsParser } from './dts_parser';

const IGNORE_MATERIALS = ['NULL', 'ORIGIN', 'TRIGGER', 'FORCEFIELD'];

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

export class Mission {
	path: string;
	dependencies = new Set<string>();
	mis: MisFile;
	info: MissionElementScriptObject;
	gameType: GameType;
	modification: Modification;

	constructor(path: string) {
		this.path = path;
	}

	async hydrate() {
		await this.parseMission();
		await this.findDependencies();
		this.classify();
	}

	async parseMission() {
		let missionText = (await fs.readFile(path.join(Config.dataPath, this.path))).toString();
		let misFile = new MisParser(missionText).parse();

		this.mis = misFile;
		this.info = misFile.root.elements.find(x => x._type === MissionElementType.ScriptObject && x._name === "MissionInfo") as MissionElementScriptObject ?? null;
	}

	async findDependencies() {
		let missionFileName = this.path.slice(this.path.lastIndexOf('/') + 1);
		let missionDirectory = this.path.substring(0, this.path.lastIndexOf('/'));

		let dependencies = new Set<string>();

		// Add the mission itself
		dependencies.add(this.path);

		// Add the mission thumbnail
		let fileNames = await Util.getFullFileNames(Util.removeExtension(missionFileName), path.join(Config.dataPath, missionDirectory));
		let thumbnailPath = fileNames.find(x => ['.jpg', '.jpeg', '.png'].includes(path.extname(x)));
		if (thumbnailPath) dependencies.add(missionDirectory + '/' + thumbnailPath);

		Mission.visitedPaths.clear();
		await Mission.addSimGroupDependencies(dependencies, this.mis.root);

		for (let str of dependencies) this.dependencies.add(str.toLowerCase());
	}

	classify() {
		this.gameType = this.guessGameType();
		this.modification = this.guessModification();
	}

	guessGameType() {
		if (this.path.startsWith('multiplayer/')) return GameType.Multiplayer;

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
		if (this.mis.root.elements.some(x => x._type === MissionElementType.Item && x.datablock?.toLowerCase() === 'easteregg')) pickHigher(Modification.Platinum);

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

	static visitedPaths = new Set<string>();

	static async getMissionDependencies(missionPath: string) {
		let missionFileName = missionPath.slice(missionPath.lastIndexOf('/') + 1);
		let missionDirectory = missionPath.substring(0, missionPath.lastIndexOf('/'));
		let missionText = (await fs.readFile(path.join(Config.dataPath, missionPath))).toString();
		let misFile = new MisParser(missionText).parse();
		let dependencies = new Set<string>();

		this.visitedPaths.clear();

		// Add the mission itself
		dependencies.add(missionPath);

		// Add the mission thumbnail
		let fileNames = await Util.getFullFileNames(Util.removeExtension(missionFileName), path.join(Config.dataPath, missionDirectory));
		let thumbnailPath = fileNames.find(x => ['.jpg', '.jpeg', '.png'].includes(path.extname(x)));
		if (thumbnailPath) dependencies.add(missionDirectory + '/' + thumbnailPath);

		await this.addSimGroupDependencies(dependencies, misFile.root);

		let lowercased = new Set<string>();
		for (let str of dependencies) lowercased.add(str.toLowerCase());

		return lowercased;
	}

	static async addSimGroupDependencies(dependencies: Set<string>, simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.SimGroup) {
				await this.addSimGroupDependencies(dependencies, element);
			} else if (element._type === MissionElementType.InteriorInstance) {
				await this.addInteriorDependencies(dependencies, element.interiorfile);
			} else if (element._type === MissionElementType.PathedInterior) {
				await this.addInteriorDependencies(dependencies, element.interiorresource);
			} else if (element._type === MissionElementType.Sky) {
				await this.addSkyDependencies(dependencies, element);
			} else if (element._type === MissionElementType.TSStatic) {
				// TODO
				//await this.addTSStaticDependencies(dependencies, element);
			}
		}
	}

	static async addInteriorDependencies(dependencies: Set<string>, rawInteriorPath: string) {
		let interiorPath = rawInteriorPath.slice(rawInteriorPath.indexOf('data/') + 'data/'.length);
		let interiorDirectory = interiorPath.substring(0, interiorPath.lastIndexOf('/'));

		if (this.visitedPaths.has(interiorPath)) return;
		else this.visitedPaths.add(interiorPath);

		let fullPath = path.join(Config.dataPath, interiorPath);
		let exists = await fs.pathExists(fullPath);
		if (!exists) return;

		dependencies.add(interiorPath);

		let arrayBuffer = (await fs.readFile(fullPath)).buffer;
		let dif = hxDif.Dif.LoadFromBuffer(hxDif.haxe_io_Bytes.ofData(arrayBuffer));

		for (let interior of dif.interiors.concat(dif.subObjects)) {
			let materialPaths = await this.getMaterialPaths(interior.materialList, interiorDirectory);
			for (let path of materialPaths) dependencies.add(path);
		}
	}

	static async getMaterialPaths(materialList: hxDif.Dif["interiors"][number]["materialList"], interiorDirectory: string) {
		let paths: string[] = [];

		for (let material of materialList) {
			if (IGNORE_MATERIALS.includes(material)) continue;

			let fileName = material.slice(material.lastIndexOf('/') + 1);
			let filePath = await Util.findFileInDataDirectory(fileName, interiorDirectory);
			if (filePath) paths.push(filePath);
		}

		return paths;
	}

	static async addSkyDependencies(dependencies: Set<string>, element: MissionElementSky) {
		let skyPath = element.materiallist.slice(element.materiallist.indexOf('data/') + 'data/'.length);
		let skyDirectory = skyPath.substring(0, skyPath.lastIndexOf('/'));

		if (this.visitedPaths.has(skyPath)) return;
		else this.visitedPaths.add(skyPath);
		
		let fullPath = path.join(Config.dataPath, skyPath);
		let exists = await fs.pathExists(fullPath);
		if (!exists) return;

		dependencies.add(skyPath);

		let dmlText = (await fs.readFile(fullPath)).toString();
		let lines = dmlText.split('\n').map(x => x.trim()).filter(x => x);

		for (let line of lines) {
			let filePath = await Util.findFileInDataDirectory(line, skyDirectory);
			if (filePath) dependencies.add(filePath);
		}
	}

	static async addTSStaticDependencies(dependencies: Set<string>, element: MissionElementTSStatic) {
		let dtsPath = element.shapename.slice(element.shapename.indexOf('data/') + 'data/'.length);
		let dtsDirectory = dtsPath.substring(0, dtsPath.lastIndexOf('/'));

		if (this.visitedPaths.has(dtsPath)) return;
		else this.visitedPaths.add(dtsPath);

		let fullPath = path.join(Config.dataPath, dtsPath);
		let exists = await fs.pathExists(fullPath);
		if (!exists) return;

		dependencies.add(dtsPath);

		let buffer = (await fs.readFile(fullPath)).buffer;
		let dtsFile = new DtsParser(buffer).parse();

		for (let matName of dtsFile.matNames) {
			let fullFileName = await Util.getFullFileName(matName, path.join(Config.dataPath, dtsDirectory));
			if (fullFileName) {
				if (fullFileName.endsWith('.ifl')) {
					let iflText = (await fs.readFile(path.join(Config.dataPath, dtsDirectory, fullFileName))).toString();
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							dependencies.add(dtsDirectory + '/' + textureName);
						}
					}
				} 

				dependencies.add(dtsDirectory + '/' + fullFileName);
			}
		}
	}
}