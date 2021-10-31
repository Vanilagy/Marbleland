import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { MisFile, MisParser, MissionElementScriptObject, MissionElementSimGroup, MissionElementSky, MissionElementTSStatic, MissionElementType } from './io/mis_parser';
import hxDif from '../lib/hxDif';
import { Util } from './util';
import { DtsParser } from './io/dts_parser';
import { Config } from './config';
import { db, keyValue, structureMBGSet, structurePQSet } from './globals';
import { Modification, GameType, LevelInfo, ExtendedLevelInfo, PackInfo } from '../../shared/types';
import { AccountDoc, getProfileInfo } from './account';
import { getPackInfo, PackDoc } from './pack'
import { getCommentInfosForLevel } from './comment';
import sharp from 'sharp';

export const IGNORE_MATERIALS = ['NULL', 'ORIGIN', 'TRIGGER', 'FORCEFIELD'];
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.dds'];

/** Representation of a mission in the database. */
export interface MissionDoc {
	_id: number,
	/** The absolute path to the root directory of this mission and all its dependencies. */
	baseDirectory: string,
	/** The relative path to the mission file from the base directory. */
	relativePath: string,
	dependencies: string[],
	fileSizes: number[],
	info: MissionElementScriptObject,
	gameType: GameType,
	modification: Modification,
	gems: number,
	hasEasterEgg: boolean,
	misHash: string,
	addedAt: number,
	addedBy?: number,
	remarks?: string,
	downloads: number,
	missesDependencies: boolean,
	preferPrevThumbnail: boolean
}

/** Represents a mission. Is responsible for constructing the asset dependency tree, as well as other smaller tasks. */
export class Mission {
	baseDirectory: string;
	relativePath: string;
	dependencies = new Set<string>();
	/** One for each dependency, matches with index. */
	fileSizes: number[];
	mis: MisFile;
	info: MissionElementScriptObject;
	gameType: GameType;
	modification: Modification;
	gems: number = 0;
	hasEasterEgg: boolean = false;
	misHash: string;
	/** Remember the paths that have already been visited to avoid exploring already known parts of the dependency tree again. */
	visitedPaths = new Set<string>();
	id: number;
	addedAt: number;
	addedBy: number;
	remarks: string;
	downloads: number = 0;
	missesDependencies = false;
	preferPrevThumbnail = false;

	constructor(baseDirectory: string, relativePath: string, id?: number) {
		this.baseDirectory = baseDirectory;
		this.relativePath = relativePath;

		if (id !== undefined) {
			// An ID override was specified, so use that one
			this.id = id;
		} else {
			this.id = keyValue.get('levelId');
			keyValue.set('levelId', this.id + 1);
		}
	}

	/** Creates a Mission instance from a database document. */
	static fromDoc(doc: MissionDoc) {
		let mission = new Mission(doc.baseDirectory, doc.relativePath, doc._id);
		mission.dependencies = new Set(doc.dependencies);
		mission.fileSizes = doc.fileSizes;
		mission.info = doc.info;
		mission.gameType = doc.gameType;
		mission.modification = doc.modification;
		mission.gems = doc.gems;
		mission.hasEasterEgg = doc.hasEasterEgg;
		mission.misHash = doc.misHash;
		mission.addedAt = doc.addedAt;
		mission.addedBy = doc.addedBy;
		mission.remarks = doc.remarks;
		mission.downloads = doc.downloads;
		mission.missesDependencies = doc.missesDependencies;
		mission.preferPrevThumbnail = doc.preferPrevThumbnail;

		return mission;
	}

	/** Fill the mission with data. */
	async hydrate() {
		await this.parseMission();
		await this.findDependencies();
		await this.storeFileSizes();
		this.scanSimGroup(this.mis.root);
		this.classify();
	}

	async parseMission() {
		let missionText = (await fs.readFile(path.join(this.baseDirectory, this.relativePath))).toString();
		let misFile = new MisParser(missionText).parse();
		this.mis = misFile;

		// Hash the mission text for easy duplicate detection later on
		let misHash = crypto.createHash('sha256').update(missionText).digest('base64');
		this.misHash = misHash;
	}

	/** Finds all the dependencies of this mission. */
	async findDependencies() {
		let missionFileName = this.relativePath.slice(this.relativePath.lastIndexOf('/') + 1);
		let missionDirectory = this.relativePath.substring(0, this.relativePath.lastIndexOf('/'));

		// Add the mission itself
		this.dependencies.add(this.relativePath);

		// Add the mission thumbnail
		let fileNames = await Util.getFullFileNames(Util.removeExtension(missionFileName), path.join(this.baseDirectory, missionDirectory));
		let thumbnailPaths = fileNames.filter(x => IMAGE_EXTENSIONS.includes(path.extname(x).toLowerCase()));
		for (let thumbnailPath of thumbnailPaths) this.dependencies.add(path.posix.join(missionDirectory, thumbnailPath));

		let startsWith = Util.removeExtension(this.relativePath);
		// Create a list of potential candidates for the thumbnail file name
		let potentialNames = IMAGE_EXTENSIONS.map(x => (startsWith + x).toLowerCase());
		let thumbnail = [...this.dependencies].find(x => potentialNames.includes(x.toLowerCase()) && !x.includes('.dds'));
		if (thumbnail) {
			let buffer = await fs.readFile(path.join(this.baseDirectory, thumbnail));
			let metadata = await sharp(buffer).metadata();

			// If the regular thumbnail looks too crappy, fall back to the .prev
			if (Math.max(metadata.width, metadata.height) < 128) {
				this.preferPrevThumbnail = true;
			}
		}

		// Start walking over all elements over the mission file
		this.visitedPaths.clear();
		await this.addSimGroupDependencies(this.mis.root);
	}

	classify() {
		this.gameType = this.guessGameType();
		this.modification = this.guessModification();
	}

	/** Try to guess the game type of this mission. */
	guessGameType() {
		let i = this.info;

		if (i.gametype) return (i.gametype.toLowerCase() === 'singleplayer')? GameType.SinglePlayer : GameType.Multiplayer; // Explicitly set in the .mis
		if (this.relativePath.startsWith('multiplayer/')) return GameType.Multiplayer;

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

	/** Try to guess the modification (game) this mission was made for / is compatible with. */
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

		if (i.game && !i.game.toLowerCase().startsWith('custom')) return stringMap[i.game.toLowerCase() as keyof typeof stringMap];
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
			if (dependency.startsWith('lbinteriors_pq')) pickHigher(Modification.PlatinumQuest);
			if (dependency.startsWith('mbp_')) pickHigher(Modification.Platinum);
			if (dependency.startsWith('interiors_mbp')) pickHigher(Modification.Platinum);
			if (dependency.startsWith('lbinteriors_mbp')) pickHigher(Modification.Platinum);
			if (dependency.startsWith('fubargame')) pickHigher(Modification.Fubar);
			if (dependency.startsWith('mbu_')) pickHigher(Modification.Ultra);
		}

		return result;
	}

	/** Scans a sim group for metadata collection. */
	scanSimGroup(simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.SimGroup) {
				this.scanSimGroup(element);
			} else if (element._type === MissionElementType.Item) {
				if (element.datablock?.toLowerCase().includes('gemitem')) this.gems++;
				let a = element.datablock?.toLowerCase();
				if (a && (a.startsWith('easteregg') || a.startsWith('nestegg'))) this.hasEasterEgg = true;
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

	async storeFileSizes() {
		let sizes: number[] = [];

		for (let dependency of this.dependencies) {
			let fullPath = await this.findPath(dependency);
			if (fullPath) {
				let stats = await fs.stat(fullPath);
				sizes.push(stats.size);
			} else {
				sizes.push(0);
			}
		}

		this.fileSizes = sizes;
	}

	findFile(fileName: string, relativePath: string, walkUp?: boolean, permittedExtensions?: string[]): Promise<string> {
		return Util.findFile(fileName, relativePath, [this.baseDirectory, Config.dataPath], walkUp, permittedExtensions);
	}

	findPath(filePath: string) {
		return Util.findPath(filePath, [this.baseDirectory, Config.dataPath]);
	}

	async addSimGroupDependencies(simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.SimGroup) {
				await this.addSimGroupDependencies(element); // Recurse
			} else if (element._type === MissionElementType.InteriorInstance) {
				await this.addInteriorDependencies(element.interiorfile);
			} else if (element._type === MissionElementType.PathedInterior) {
				await this.addInteriorDependencies(element.interiorresource);
			} else if (element._type === MissionElementType.Sky) {
				await this.addSkyDependencies(element);
			} else if (element._type === MissionElementType.TSStatic) {
				await this.addTSStaticDependencies(element);
			} else if (element._type === MissionElementType.ScriptObject && element._name === 'MissionInfo') {
				if (element.music) {
					// Add the music as a dependency
					let relativePath = path.posix.join('sound/music', element.music);
					let fullPath = await this.findPath(relativePath);
					if (fullPath) this.dependencies.add(relativePath);
				}
			}
		}
	}

	/** Adds all dependencies of a given interior. */
	async addInteriorDependencies(rawInteriorPath: string) {
		let interiorPath = rawInteriorPath.slice(rawInteriorPath.indexOf('data/') + 'data/'.length);
		let interiorDirectory: string;
		let fullPath: string;

		while (true) {
			interiorDirectory = interiorPath.substring(0, interiorPath.lastIndexOf('/'));

			if (this.visitedPaths.has(interiorPath)) return;
			else this.visitedPaths.add(interiorPath);

			fullPath = await this.findPath(interiorPath);
			if (fullPath) break;

			// Special case: If the directory is interiors, check again in interiors_mbg. This is because the default MBG assets (in PQ) are located in interiors_mbg, but the paths within the .mis files still point to interiors (it does some directory shadowing).
			if (interiorPath.startsWith('interiors/')) interiorPath = interiorPath.replace('interiors/', 'interiors_mbg/');
			else {
				// Otherwise, we haven't found a file, so abort.
				this.missesDependencies = true;
				return;
			}
		}

		this.dependencies.add(interiorPath); // Add the interior itself as a dependency

		// Read in the .dif
		let arrayBuffer = (await fs.readFile(fullPath)).buffer;
		let dif = hxDif.Dif.LoadFromArrayBuffer(arrayBuffer);

		// Add all its materials as dependencies
		for (let interior of dif.interiors.concat(dif.subObjects)) {
			let materialPaths = await this.getMaterialPaths(interior.materialList, interiorDirectory);
			for (let path of materialPaths) this.dependencies.add(path);
		}
	}

	/** Returns a list of relative file paths to the textures reference in a .dif MaterialList. */
	async getMaterialPaths(materialList: hxDif.Dif["interiors"][number]["materialList"], interiorDirectory: string) {
		let paths: string[] = [];

		for (let material of materialList) {
			if (IGNORE_MATERIALS.includes(material)) continue;

			let fileName = material.slice(material.lastIndexOf('/') + 1);
			let filePath = await this.findFile(fileName, interiorDirectory, true, IMAGE_EXTENSIONS);
			if (filePath) paths.push(filePath);
		}

		return paths;
	}

	/** Adds all sky dependencies. */
	async addSkyDependencies(element: MissionElementSky) {
		let skyPath = element.materiallist.slice(element.materiallist.indexOf('data/') + 'data/'.length);
		let skyDirectory = skyPath.substring(0, skyPath.lastIndexOf('/'));

		if (this.visitedPaths.has(skyPath)) return;
		else this.visitedPaths.add(skyPath);
		
		let fullPath = await this.findPath(skyPath);
		if (!fullPath) {
			this.missesDependencies = true;
			return;
		}

		this.dependencies.add(skyPath); // Add the .dml file itself

		// Read in the .dml
		let dmlText = (await fs.readFile(fullPath)).toString();
		let lines = dmlText.split('\n').map(x => x.trim()).filter(x => x);

		// Add all sky textures as dependencies
		for (let line of lines) {
			let filePath = await this.findFile(line, skyDirectory, true, IMAGE_EXTENSIONS); 
			if (filePath) this.dependencies.add(filePath);
			else this.missesDependencies = true;
		}
	}

	/** Adds all dependencies of a given TSStatic element. */
	async addTSStaticDependencies(element: MissionElementTSStatic) {
		let dtsPath = element.shapename.slice(element.shapename.indexOf('data/') + 'data/'.length);
		let dtsDirectory = dtsPath.substring(0, dtsPath.lastIndexOf('/'));

		if (this.visitedPaths.has(dtsPath)) return;
		else this.visitedPaths.add(dtsPath);

		let fullPath = await this.findPath(dtsPath);
		if (!fullPath) {
			this.missesDependencies = true;
			return;
		}

		this.dependencies.add(dtsPath); // Add the .dts itself

		// Read in the .dts
		let buffer = (await fs.readFile(fullPath)).buffer;
		let dtsFile = new DtsParser(buffer).parse(true); // Only read up until materials, we don't care about the rest

		// Add all used materials as dependencies
		for (let matName of dtsFile.matNames) {
			let relativePath = await this.findFile(matName, dtsDirectory, false, IMAGE_EXTENSIONS.concat(['.ifl']));
			if (relativePath) {
				// We found an .ifl material, so add all of its materials.
				if (relativePath.toLowerCase().endsWith('.ifl')) {
					let fullPath = await this.findPath(relativePath);
					let iflText = (await fs.readFile(fullPath)).toString();
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							let filePath = await this.findFile(textureName, dtsDirectory, false, IMAGE_EXTENSIONS);
							if (filePath) this.dependencies.add(filePath);
						}
					}
				} 

				this.dependencies.add(relativePath);
			}
		}
	}

	/** Normalizes all dependencies related directly to the .mis file to be in the missions/ directory, and leaves everything else untouched. */
	normalizeDependency(dependency: string) {
		let withoutExtension = Util.removeExtension(this.relativePath);
		if (dependency.startsWith(withoutExtension)) return path.posix.join('missions', dependency.slice(dependency.lastIndexOf('/') + 1));
		return dependency;
	}

	getNormalizedDependencies(assuming: 'none' | 'gold' | 'platinumquest') {
		let result: string[] = [];

		for (let dependency of this.dependencies) {
			let normalized = this.normalizeDependency(dependency);
			if (assuming === 'gold' && structureMBGSet.has(normalized.toLowerCase())) continue;
			if (assuming === 'platinumquest' && structurePQSet.has(normalized.toLowerCase())) continue;

			result.push(normalized);
		}

		return result;
	}

	/** Creates a mission doc for storage in the database. */
	createDoc(): MissionDoc {
		return {
			_id: this.id,
			baseDirectory: this.baseDirectory,
			relativePath: this.relativePath,
			dependencies: [...this.dependencies],
			fileSizes: this.fileSizes,
			info: this.info,
			gameType: this.gameType,
			modification: this.modification,
			gems: this.gems,
			hasEasterEgg: this.hasEasterEgg,
			misHash: this.misHash,
			addedAt: Date.now(),
			downloads: this.downloads,
			missesDependencies: this.missesDependencies,
			preferPrevThumbnail: this.preferPrevThumbnail
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

			qualifyingTime: this.info.time? MisParser.parseNumber(this.info.time) : undefined,
			goldTime: this.info.goldtime? MisParser.parseNumber(this.info.goldtime) : undefined,
			platinumTime: this.info.platinumtime? MisParser.parseNumber(this.info.platinumtime) : undefined,
			ultimateTime: this.info.ultimatetime? MisParser.parseNumber(this.info.ultimatetime) : undefined,
			awesomeTime: this.info.awesometime? MisParser.parseNumber(this.info.awesometime) : undefined,

			qualifyingScore: this.info.score? MisParser.parseNumber(this.info.score) : undefined,
			goldScore: this.info.goldscore? MisParser.parseNumber(this.info.goldscore) : undefined,
			platinumScore: this.info.platinumscore? MisParser.parseNumber(this.info.platinumscore) : undefined,
			ultimateScore: this.info.ultimatescore? MisParser.parseNumber(this.info.ultimatescore) : undefined,
			awesomeScore: this.info.awesomescore? MisParser.parseNumber(this.info.awesomescore) : undefined,

			gems: this.gems,
			hasEasterEgg: this.hasEasterEgg
		};
	}

	async createExtendedLevelInfo(): Promise<ExtendedLevelInfo> {
		let levelInfo = this.createLevelInfo();
		let accountDoc = await db.accounts.findOne({ _id: this.addedBy }) as AccountDoc;

		// Find all packs containing this mission
		let packDocs = await db.packs.find({ levels: this.id }) as PackDoc[];
		let packInfos: PackInfo[] = [];
		for (let packDoc of packDocs) {
			packInfos.push(await getPackInfo(packDoc));
		}

		return Object.assign(levelInfo, {
			addedBy: accountDoc && await getProfileInfo(accountDoc),
			remarks: this.remarks,
			packs: packInfos,
			comments: await getCommentInfosForLevel(this.id),
			downloads: this.downloads ?? 0,
			missesDependencies: this.missesDependencies
		});
	}

	/** Get the path to the image thumbnail of this mission. */
	getImagePath() {
		let startsWith = Util.removeExtension(this.relativePath);
		let potentialStarts = [startsWith, startsWith + '.prev'];
		if (this.preferPrevThumbnail) potentialStarts.reverse();
		// Create a list of potential candidates for the thumbnail file name
		let potentialNames = potentialStarts.map(start => IMAGE_EXTENSIONS.map(extension => (start + extension).toLowerCase())).flat();

		let dependencyArray = [...this.dependencies];

		for (let potentialName of potentialNames) {
			let dependency = dependencyArray.find(x => potentialName.includes(x.toLowerCase()) && !x.includes('.dds')); // Exclude dds files for now, until we can read them (aka probably never)
			if (dependency) return dependency;
		}
		return null;
	}

	/** Returns the mission file's name (without the path). */
	getBaseName() {
		return Util.getFileName(this.relativePath);
	}
}

/** Scans a given directory for missions and imports them all.
 * @param idMapPath Path to a JSON file which maps mission base names to IDs. Can be used for controlled setting of IDs.
 */
export const scanForMissions = async (baseDirectory: string, idMapPath?: string, replaceDuplicates = false, allowedRelativePaths?: Set<string>) => {
	let idMap: { id: number, baseName: string }[] = null;
	if (idMapPath) {
		idMap = JSON.parse(fs.readFileSync(idMapPath).toString());
		console.log("ID map loaded.");
	}

	console.log("Replace duplicate mode: On.");

	let success = 0;
	let failure = 0;
	let skipped = 0;
	let duplicates = 0;

	/** Recursively scans a directory. */
	const scan = async (relativePath: string) => {
		let entries = await fs.readdir(path.join(baseDirectory, relativePath));

		for (let entry of entries) {
			let joined = path.join(baseDirectory, relativePath, entry);
			let stat = await fs.stat(joined);
			let fromStart = path.posix.join(relativePath, entry);
	
			if (stat.isDirectory()) {
				await scan(fromStart); // Recurse
			} else {
				if (entry.toLowerCase().endsWith('.mis')) {
					if (allowedRelativePaths && !allowedRelativePaths.has(fromStart)) continue;

					// Check if the same file already exists in default PQ, and if so, skip it
					let existsInPq = await fs.pathExists(path.join(Config.dataPath, relativePath, entry));
					let isProbablyCustom = relativePath.includes('custom');
					if (existsInPq && !isProbablyCustom) {
						skipped++;
						console.log("Skipping: ", fromStart);
						continue;
					}

					console.log("Importing: ", fromStart);

					let id: number;
					if (idMap) {
						// Find the ID in the map
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
						failure++;
						continue;
					}

					let duplicateDoc: MissionDoc;
					if (replaceDuplicates) {
						// Search for a duplicate level that was already added previously
						let duplicatesArr = await db.missions.find({ $or: [
							{
								// Primitive heuristic, but should work to identify candidates
								'info.name': mission.info.name,
								'info.desc': mission.info.desc,
								'info.artist': mission.info.artist,
								'info.starthelptext': mission.info.starthelptext
							},
							{
								misHash: mission.misHash
							}
						] }) as MissionDoc[];

						for (let duplicate of duplicatesArr) {
							if (duplicate.misHash !== mission.misHash) {
								// We found a possible duplicate candidate.
								let mis1 = new MisParser((await fs.readFile(path.join(duplicate.baseDirectory, duplicate.relativePath))).toString()).parse();
								let mis2 = mission.mis;

								// Compare the contents. If they don't match, it's (probably) not a duplicate.
								if (!compareMissions(mis1, mis2)) continue;
							}

							console.log(`Duplicate found for ${path.join(relativePath, entry)} in ${path.join(duplicate.baseDirectory, duplicate.relativePath)}. Replacing the old entry.`);
							duplicateDoc = duplicate;
							duplicates++;

							break;
						}
					}
					
					// Add the mission to the database
					let doc = mission.createDoc();
					if (duplicateDoc) {
						doc._id = duplicateDoc._id;
						doc.addedAt = duplicateDoc.addedAt;
						doc.addedBy = duplicateDoc.addedBy;
						doc.downloads = duplicateDoc.downloads;
						doc.remarks = duplicateDoc.remarks;
					}

					await db.missions.update({ _id: doc._id }, doc, { upsert: true });
	
					console.log("Level imported successfully with id " + mission.id);
					success++;
				}
			}
		}
	};

	await scan('');
	console.log(
`================
Imported ${success + failure + skipped} level(s).
Successes: ${success}
Failures: ${failure}
Skipped: ${skipped}
Duplicates: ${duplicates}
	`);
};

/** Compares two missions and returns true, if their contents match (excluding MissionInfo). */
export const compareMissions = (mis1: MisFile, mis2: MisFile) => {
	let root1 = Util.jsonClone(mis1.root);
	let root2 = Util.jsonClone(mis2.root);

	const prepare = (simGroup: MissionElementSimGroup) => {
		for (let i = 0; i < simGroup.elements.length; i++) {
			let element = simGroup.elements[i];

			if (element._type === MissionElementType.SimGroup) {
				prepare(element);
			} else if (element._type === MissionElementType.ScriptObject && element._name === "MissionInfo") {
				simGroup.elements.splice(i--, 1);
			}
		}
	};
	prepare(root1);
	prepare(root2);

	return JSON.stringify(root1) === JSON.stringify(root2);
};

export const reimportMissions = async (levelIds: number[], allowCreation: boolean) => {
	let missions = await db.missions.find({}) as MissionDoc[];
	if (levelIds.length > 0) missions = missions.filter(x => levelIds.includes(x._id));
	let baseDirectories = new Set(missions.map(x => x.baseDirectory));

	let relativePaths = allowCreation? null : new Set(missions.map(x => x.relativePath));

	console.log("Reimporting missions...");
	if (levelIds.length > 0) console.log(`Reimporting only level IDs ${levelIds.join(', ')}`);

	for (let directory of baseDirectories) {
		console.log(`Now re-scanning: ${directory}\n\n`);
		await scanForMissions(directory, null, true, relativePaths);
	}

	console.log("Reimport complete.");
};