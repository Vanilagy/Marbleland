import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { MisFile, MisParser, MissionElementScriptObject, MissionElementSimGroup, MissionElementSky, MissionElementTSStatic, MissionElementType } from './mis_parser';
import hxDif from '../lib/hxDif';
import { Util } from './util';
import { DtsParser } from './dts_parser';
import JSZip from 'jszip';
import { Config } from './config';
import { db, keyValue, structureMBG, structurePQ } from './globals';
import { Modification, GameType, LevelInfo, ExtendedLevelInfo, PackInfo } from '../../shared/types';
import { AccountDoc, getProfileInfo } from './account';
import { getPackInfo, PackDoc } from './pack'
import { getCommentInfosForLevel } from './comment';

export const IGNORE_MATERIALS = ['NULL', 'ORIGIN', 'TRIGGER', 'FORCEFIELD'];
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export interface MissionDoc {
	_id: number,
	baseDirectory: string,
	relativePath: string,
	dependencies: string[],
	info: MissionElementScriptObject,
	gameType: GameType,
	modification: Modification,
	gems: number,
	hasEasterEgg: boolean,
	misHash: string,
	addedAt: number,
	addedBy?: number,
	remarks?: string
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
	misHash: string;
	visitedPaths = new Set<string>();
	id: number;
	addedAt: number;
	addedBy: number;
	remarks: string;

	constructor(baseDirectory: string, relativePath: string, id?: number) {
		this.baseDirectory = baseDirectory;
		this.relativePath = relativePath;

		if (id !== undefined) {
			this.id = id;
		} else {
			this.id = keyValue.get('levelId');
			keyValue.set('levelId', this.id + 1);
		}
	}

	static fromDoc(doc: MissionDoc) {
		let mission = new Mission(doc.baseDirectory, doc.relativePath, doc._id);
		mission.dependencies = new Set(doc.dependencies);
		mission.info = doc.info;
		mission.gameType = doc.gameType;
		mission.modification = doc.modification;
		mission.gems = doc.gems;
		mission.hasEasterEgg = doc.hasEasterEgg;
		mission.misHash = doc.misHash;
		mission.addedAt = doc.addedAt;
		mission.addedBy = doc.addedBy;
		mission.remarks = doc.remarks;

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

		let misHash = crypto.createHash('sha256').update(missionText).digest('base64');
		this.misHash = misHash;
	}

	async findDependencies() {
		let missionFileName = this.relativePath.slice(this.relativePath.lastIndexOf('/') + 1);
		let missionDirectory = this.relativePath.substring(0, this.relativePath.lastIndexOf('/'));

		// Add the mission itself
		this.dependencies.add(this.relativePath);

		// Add the mission thumbnail
		let fileNames = await Util.getFullFileNames(Util.removeExtension(missionFileName), path.join(this.baseDirectory, missionDirectory));
		let thumbnailPaths = fileNames.filter(x => IMAGE_EXTENSIONS.includes(path.extname(x).toLowerCase()));
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

	async createZip(assuming: 'none' | 'gold' | 'platinumquest') {
		let zip = new JSZip();
		this.addToZip(zip, assuming);
		return zip;
	}

	async addToZip(zip: JSZip, assuming: 'none' | 'gold' | 'platinumquest') {
		for (let dependency of this.dependencies) {
			let normalized = this.normalizeDependency(dependency);
			if (assuming === 'gold' && Util.directoryStructureHasPath(structureMBG, normalized)) continue;
			if (assuming === 'platinumquest' && Util.directoryStructureHasPath(structurePQ, normalized)) continue;

			let fullPath: string, exists: boolean;

			fullPath = path.join(this.baseDirectory, dependency);
			exists = await fs.pathExists(fullPath);
			if (!exists) {
				fullPath = path.join(Config.dataPath, dependency);
				exists = await fs.pathExists(fullPath);
			}

			if (exists) {
				let stream = fs.createReadStream(fullPath);
				zip.file(normalized, stream);
			}
		}
	}

	normalizeDependency(dependency: string) {
		let withoutExtension = Util.removeExtension(this.relativePath);
		if (dependency.startsWith(withoutExtension)) return path.posix.join('missions', dependency.slice(dependency.lastIndexOf('/') + 1));
		return dependency;
	}

	getNormalizedDependencies(assuming: 'none' | 'gold' | 'platinumquest') {
		let result: string[] = [];

		for (let dependency of this.dependencies) {
			let normalized = this.normalizeDependency(dependency);
			if (assuming === 'gold' && Util.directoryStructureHasPath(structureMBG, normalized)) continue;
			if (assuming === 'platinumquest' && Util.directoryStructureHasPath(structurePQ, normalized)) continue;

			result.push(normalized);
		}

		return result;
	}

	createDoc(): MissionDoc {
		return {
			_id: this.id,
			baseDirectory: this.baseDirectory,
			relativePath: this.relativePath,
			dependencies: [...this.dependencies],
			info: this.info,
			gameType: this.gameType,
			modification: this.modification,
			gems: this.gems,
			hasEasterEgg: this.hasEasterEgg,
			misHash: this.misHash,
			addedAt: Date.now()
		};
	}

	createLevelInfo(): LevelInfo {
		return {
			id: this.id,
			baseName: this.getBaseName(),
			gameType: this.gameType,
			modification: this.modification,
			name: this.info.name,
			artist: this.info.artist,
			desc: this.info.desc,
			addedAt: this.addedAt,
			gameMode: this.info.gamemode,

			qualifyingTime: this.info.time? Number(this.info.time) : undefined,
			goldTime: this.info.goldtime? Number(this.info.goldtime) : undefined,
			platinumTime: this.info.platinumtime? Number(this.info.platinumtime) : undefined,
			ultimateTime: this.info.ultimatetime? Number(this.info.ultimatetime) : undefined,
			awesomeTime: this.info.awesometime? Number(this.info.awesometime) : undefined,
			gems: this.gems,
			hasEasterEgg: this.hasEasterEgg
		};
	}

	async createExtendedLevelInfo(): Promise<ExtendedLevelInfo> {
		let levelInfo = this.createLevelInfo();
		let accountDoc = await db.accounts.findOne({ _id: this.addedBy }) as AccountDoc;

		let packDocs = await db.packs.find({ levels: this.id }) as PackDoc[];
		let packInfos: PackInfo[] = [];
		for (let packDoc of packDocs) {
			packInfos.push(await getPackInfo(packDoc));
		}

		return Object.assign(levelInfo, {
			addedBy: accountDoc && await getProfileInfo(accountDoc),
			remarks: this.remarks,
			packs: packInfos,
			comments: await getCommentInfosForLevel(this.id)
		});
	}

	getImagePath() {
		let startsWith = Util.removeExtension(this.relativePath);
		let potentialNames = IMAGE_EXTENSIONS.map(x => (startsWith + x).toLowerCase());
		return [...this.dependencies].find(x => potentialNames.includes(x.toLowerCase())) ?? null;
	}

	getBaseName() {
		return Util.getFileName(this.relativePath);
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
				await this.addTSStaticDependencies(element);
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
		let lowerCase = fileName.toLowerCase();

		for (let file of dir1.concat(dir2)) {
			if (Util.removeExtension(file).toLowerCase() === lowerCase) return path.posix.join(relativePath, file);
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
		let dtsFile = new DtsParser(buffer).parse(true); // Only read up until materials, we don't care about the rest

		for (let matName of dtsFile.matNames) {
			let relativePath = await this.findFile(matName, dtsDirectory, false);
			if (relativePath) {
				if (relativePath.toLowerCase().endsWith('.ifl')) {
					let fullPath = await this.findPath(relativePath);
					let iflText = (await fs.readFile(fullPath)).toString();
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							let filePath = await this.findFile(textureName, dtsDirectory, false);
							if (filePath) this.dependencies.add(filePath);
						}
					}
				} 

				this.dependencies.add(relativePath);
			}
		}
	}
}

export const scanForMissions = async (baseDirectory: string, idMapPath?: string) => {
	let idMap: { id: number, baseName: string }[] = null;
	if (idMapPath) {
		idMap = JSON.parse(fs.readFileSync(idMapPath).toString());
		console.log("ID map loaded.");
	}

	const scan = async (relativePath: string) => {
		let entries = await fs.readdir(path.join(baseDirectory, relativePath));

		for (let entry of entries) {
			let joined = path.join(baseDirectory, relativePath, entry);
			let stat = await fs.stat(joined);
			let fromStart = path.posix.join(relativePath, entry);
	
			if (stat.isDirectory()) {
				await scan(fromStart);
			} else {
				if (entry.toLowerCase().endsWith('.mis')) {
					console.log("Importing: ", fromStart);

					let id: number;
					if (idMap) {
						let baseName = Util.getFileName(fromStart);
						id = idMap.find(x => x.baseName === baseName)?.id;
						if (id === undefined) throw new Error(`ID map is missing entry for baseName ${baseName}.`);
						keyValue.set('levelId', Math.max(id, keyValue.get('levelId')));
					}

					let mission = new Mission(baseDirectory, fromStart, id);
	
					try {
						await mission.hydrate();
					} catch (e) {
						console.error(`Error in loading mission ${entry}:`, e);
						break;
					}
					
					let doc = mission.createDoc();
					await db.missions.update({ _id: doc._id }, doc, { upsert: true });
	
					console.log("Level imported successfully with id " + id);
				}
			}
		}
	};
	await scan('');
};