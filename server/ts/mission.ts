import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { MisFile, MisParser, MissionElement, MissionElementBase, MissionElementScriptObject, MissionElementSimGroup, MissionElementSky, MissionElementTSStatic, MissionElementType } from './io/mis_parser';
import hxDif from '../lib/hxDif';
import { Util } from './util';
import { DtsParser } from './io/dts_parser';
import { Config } from './config';
import { datablocksMBG, datablocksMBW, db, keyValue, structureMBGSet, structurePQSet } from './globals';
import { Modification, GameType, LevelInfo, ExtendedLevelInfo, PackInfo } from '../../shared/types';
import { AccountDoc, getProfileInfo } from './account';
import { getPackInfo, PackDoc } from './pack'
import { getCommentInfosForLevel } from './comment';
import { MUTABLE_MISSION_INFO_FIELDS } from '../../shared/constants';
import { guessGameType, guessModification } from '../../shared/classification';
import { MissionVerifier } from './verifier';

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
	addedBy: number,
	remarks: string,
	downloads: number,
	missesDependencies: boolean,
	preferPrevThumbnail: boolean,
	lovedBy: number[],
	editedAt: number,
	hasCustomCode: boolean,
	datablockCompatibility: 'mbg' | 'mbw' | 'pq'
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
	addedAt = Date.now();
	addedBy: number;
	remarks: string;
	downloads: number = 0;
	missesDependencies = false;
	preferPrevThumbnail = false;
	/** List of account IDs that love this mission. */
	lovedBy: number[];
	editedAt: number = null;
	hasCustomCode: boolean = false;
	datablockCompatibility: 'mbg' | 'mbw' | 'pq';

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
		mission.lovedBy = doc.lovedBy ?? [];
		mission.editedAt = doc.editedAt ?? null;
		mission.hasCustomCode = doc.hasCustomCode ?? false;
		mission.datablockCompatibility = doc.datablockCompatibility ?? 'pq';

		return mission;
	}

	/** Fill the mission with data. */
	async hydrate() {
		await this.parseMission();
		await this.findDependencies();
		await this.storeFileSizes();
		this.scanSimGroupForMetadata(this.mis.root);
		this.classify();
		this.hasCustomCode = !(((await MissionVerifier.verifyNoCustomCode(this)).valid));
		this.datablockCompatibility = this.determineDatablockCompatibility();
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

		// Add all mission images
		let fileNames = await Util.getFullFileNames(Util.removeExtension(missionFileName) + '.', path.join(this.baseDirectory, missionDirectory));
		let thumbnailPaths = fileNames.filter(x => IMAGE_EXTENSIONS.includes(path.extname(x).toLowerCase()));
		for (let thumbnailPath of thumbnailPaths) {
			this.dependencies.add(path.posix.join(missionDirectory, thumbnailPath));
		}

		let startsWith = Util.removeExtension(this.relativePath);
		// Create a list of potential candidates for the thumbnail file name
		let potentialNames = IMAGE_EXTENSIONS.map(x => (startsWith + x).toLowerCase());
		let thumbnail = [...this.dependencies].find(x => potentialNames.includes(x.toLowerCase()) && !x.includes('.dds'));
		if (thumbnail) {
			let buffer = await fs.readFile(path.join(this.baseDirectory, thumbnail));
			let dimensions = await Util.getImageDimensions(buffer);

			// If the regular thumbnail looks too crappy, fall back to the .prev
			if (Math.max(dimensions.width, dimensions.height) < 128) {
				this.preferPrevThumbnail = true;
			}
		}

		// Start walking over all elements over the mission file
		this.visitedPaths.clear();
		await this.addSimGroupDependencies(this.mis.root);
		await this.addFilePathDependencies(this.mis.datablockFilePaths);
		await this.addFilePathDependencies(this.mis.manualIncludes);
	}

	classify() {
		this.gameType = guessGameType(this.info, this.relativePath, [...this.dependencies]);
		this.modification = guessModification(this.info, this.hasEasterEgg, [...this.dependencies]);
	}

	/** Scans a sim group for metadata collection. */
	scanSimGroupForMetadata(simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.SimGroup) {
				this.scanSimGroupForMetadata(element);
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
				await this.addSkyDependencies(element.materiallist);
			} else if (element._type === MissionElementType.TSStatic) {
				await this.addShapeDependencies(element.shapename);
			} else if (element._type === MissionElementType.ScriptObject && element._name === 'MissionInfo') {
				if (element.music) {
					// Add the music as a dependency
					let relativePath = path.posix.join('sound/music', element.music);
					let fullPath = await this.findPath(relativePath);
					if (fullPath) this.dependencies.add(relativePath);
					else this.missesDependencies = true;
				}
			} else if (element._type === MissionElementType.Trigger) {
				if (element.datablock?.toLowerCase() === 'musictrigger') {
					// Also add this music as a dependency
					let relativePath = await this.findFile(element.text, 'sound/music', false);
					if (relativePath) this.dependencies.add(relativePath);
					else this.missesDependencies = true;
				}
			} else if (element._type === MissionElementType.AudioEmitter) {
				let audioPath = element.filename.slice(element.filename.indexOf('data/') + 'data/'.length);
				let fullPath = await this.findPath(audioPath);
				if (fullPath) this.dependencies.add(audioPath);
				else this.missesDependencies = true;
			}
		}
	}

	async addFilePathDependencies(filePaths: string[]) {
		for (let filePath of filePaths) {
			if (filePath.toLowerCase().endsWith('.dts')) {
				await this.addShapeDependencies(filePath);
			} else if (filePath.toLowerCase().endsWith('.dif')) {
				await this.addInteriorDependencies(filePath);
			} else if (filePath.toLowerCase().endsWith('.dml')) {
				await this.addSkyDependencies(filePath);
			} else {
				// We don't have any special handling for this extension, just add it in
				let slicedPath = filePath.slice(filePath.indexOf('data/') + 'data/'.length);
				let fullPath = await this.findPath(slicedPath);
				if (fullPath) this.dependencies.add(slicedPath);
				else this.missesDependencies = true;
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
	async addSkyDependencies(rawSkyPath: string) {
		let skyPath = rawSkyPath.slice(rawSkyPath.indexOf('data/') + 'data/'.length);
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
	async addShapeDependencies(rawShapePath: string) {
		let dtsPath = rawShapePath.slice(rawShapePath.indexOf('data/') + 'data/'.length);
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
	normalizeDependency(dependency: string, appendIdToMis: boolean, rootPath = '', missionsPath = 'missions') {
		let withoutExtension = Util.removeExtension(this.relativePath);
		if (dependency.startsWith(withoutExtension)) {
			let end = dependency.slice(dependency.lastIndexOf('/') + 1);
			let extension = end.slice(end.indexOf('.'));
			if (appendIdToMis) {
				// Append the mission's ID to the .mis and thumbnail files
				end = `${end.slice(0, -extension.length)}_${this.id}${extension}`;
			}

			return path.posix.join(rootPath, missionsPath, end);
		}
		return path.posix.join(rootPath, dependency);
	}

	getFilteredDependencies(assuming: 'none' | 'gold' | 'platinumquest', appendIdToMis: boolean, normalize = true) {
		let result: string[] = [];

		for (let dependency of this.dependencies) {
			// Skip preview images for MBG since they won't be used anyway
			if (assuming === 'gold' && dependency === this.getPrevImagePath()) continue;

			let normalized = this.normalizeDependency(dependency, appendIdToMis);
			if (assuming === 'gold' && structureMBGSet.has(normalized.toLowerCase())) continue;
			if (assuming === 'platinumquest' && structurePQSet.has(normalized.toLowerCase())) continue;

			result.push(normalize ? normalized : dependency);
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
			addedAt: this.addedAt,
			addedBy: this.addedBy,
			remarks: this.remarks,
			downloads: this.downloads,
			missesDependencies: this.missesDependencies,
			preferPrevThumbnail: this.preferPrevThumbnail,
			editedAt: this.editedAt,
			lovedBy: this.lovedBy,
			hasCustomCode: this.hasCustomCode,
			datablockCompatibility: this.datablockCompatibility
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
			editedAt: this.editedAt,

			qualifyingTime: this.info.time? MisParser.parseNumber(this.info.time) : undefined,
			goldTime: this.info.goldtime? MisParser.parseNumber(this.info.goldtime) : undefined,
			platinumTime: this.info.platinumtime? MisParser.parseNumber(this.info.platinumtime) : undefined,
			ultimateTime: this.info.ultimatetime? MisParser.parseNumber(this.info.ultimatetime) : undefined,
			awesomeTime: this.info.awesometime? MisParser.parseNumber(this.info.awesometime) : undefined,

			qualifyingScore: (this.info.score || this.info.score0)? MisParser.parseNumber(this.info.score || this.info.score0) : undefined,
			goldScore: (this.info.goldscore || this.info.goldscore0)? MisParser.parseNumber(this.info.goldscore || this.info.goldscore0) : undefined,
			platinumScore: (this.info.platinumscore || this.info.platinumscore0)? MisParser.parseNumber(this.info.platinumscore || this.info.platinumscore0) : undefined,
			ultimateScore: (this.info.ultimatescore || this.info.ultimatescore0)? MisParser.parseNumber(this.info.ultimatescore || this.info.ultimatescore0) : undefined,
			awesomeScore: (this.info.awesomescore || this.info.awesomescore0)? MisParser.parseNumber(this.info.awesomescore || this.info.awesomescore0) : undefined,

			gems: this.gems,
			hasEasterEgg: this.hasEasterEgg,

			downloads: this.downloads ?? 0,
			lovedCount: this.lovedBy.length,

			hasCustomCode: this.hasCustomCode,
			datablockCompatibility: this.datablockCompatibility
		};
	}

	async createExtendedLevelInfo(requesterId?: number): Promise<ExtendedLevelInfo> {
		let levelInfo = this.createLevelInfo();
		let accountDoc = await db.accounts.findOne({ _id: this.addedBy }) as AccountDoc;

		// Find all packs containing this mission
		let packDocs = await db.packs.find({ levels: this.id }) as PackDoc[];
		let packInfos: PackInfo[] = [];
		for (let packDoc of packDocs) {
			packInfos.push(await getPackInfo(packDoc));
		}

		let lovedByYou = this.lovedBy.includes(requesterId);

		return Object.assign(levelInfo, {
			addedBy: accountDoc && await getProfileInfo(accountDoc),
			remarks: this.remarks,
			packs: packInfos,
			comments: await getCommentInfosForLevel(this.id),
			downloads: this.downloads ?? 0,
			missesDependencies: this.missesDependencies,
			lovedByYou,
			hasPrevImage: this.getPrevImagePath() !== null,
			missionInfo: this.info as any,
			dependencies: this.getFilteredDependencies('none', false)
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
			let dependency = dependencyArray.find(x => potentialName.includes(x.toLowerCase()));
			if (dependency) return dependency;
		}
		return null;
	}

	/** Get the path to the preview image of this mission, if available. */
	getPrevImagePath() {
		let startsWith = Util.removeExtension(this.relativePath);
		let potentialStarts = [startsWith + '.prev'];
		// Create a list of potential candidates for the prev image file name
		let potentialNames = potentialStarts.map(start => IMAGE_EXTENSIONS.map(extension => (start + extension).toLowerCase())).flat();

		let dependencyArray = [...this.dependencies];

		for (let potentialName of potentialNames) {
			let dependency = dependencyArray.find(x => potentialName.includes(x.toLowerCase()));
			if (dependency) return dependency;
		}
		return null;
	}

	/** Returns the mission file's name (without the path). */
	getBaseName() {
		return Util.getFileName(this.relativePath);
	}

	/** Verifies changes to MissionInfo and, if valid, applies them and writes the new .mis to disk. */
	async applyMissionInfoChanges(newMissionInfo: Record<string, string>) {
		if (!newMissionInfo.name) return false;
		if (!newMissionInfo.artist) return false;

		// Check for changed immutable properties
		for (let key of new Set([...Object.keys(newMissionInfo), ...Object.keys(this.info)])) {
			if (newMissionInfo[key] !== this.info[key as keyof MissionElementScriptObject] && !MUTABLE_MISSION_INFO_FIELDS.includes(key)) {
				return false;
			}
		}

		let oldMissionInfo = this.info;
		this.info = newMissionInfo as any;

		// Check if classification changed (not allowed!)
		let gameType = guessGameType(this.info, this.relativePath, [...this.dependencies]);
		let modification = guessModification(this.info, this.hasEasterEgg, [...this.dependencies]);

		if (gameType !== this.gameType || modification !== this.modification) {
			this.info = oldMissionInfo;
			return false;
		}

		// Get the .mis file text and figure out where the MissionInfo element is
		let missionText = (await fs.readFile(path.join(this.baseDirectory, this.relativePath))).toString();
		let missionInfoStartMatch = /new\s+ScriptObject\(\s*MissionInfo\s*\)\s*{/i.exec(missionText);
		if (!missionInfoStartMatch) {
			return false;
		}

		// Create a new MissionInfo text and insert it into the old mission text
		let endIndex = Util.indexOfIgnoreStringLiterals(missionText, '};', missionInfoStartMatch.index + missionInfoStartMatch[0].length) + '};'.length;
		let missionInfoDeclaration = missionText.slice(missionInfoStartMatch.index, endIndex);
		let newMissionInfoDeclaration = this.modifyMissionInfoDeclarationText(missionInfoDeclaration, newMissionInfo, oldMissionInfo as any);
		missionText = missionText.slice(0, missionInfoStartMatch.index) + newMissionInfoDeclaration + missionText.slice(endIndex);

		// Check if we can still parse the mission. If we can't, assume the text transformation was invalid.
		try {
			new MisParser(missionText).parse();
		} catch (e) {
			return false;
		}

		// Update the mission hash
		let misHash = crypto.createHash('sha256').update(missionText).digest('base64');
		this.misHash = misHash;

		// Write the new .mis to disk
		await fs.writeFile(path.join(this.baseDirectory, this.relativePath), missionText);
		await this.storeFileSizes();

		// Update the database
		let doc = this.createDoc();
		await db.missions.update({ _id: doc._id }, doc);

		return true;
	}

	modifyMissionInfoDeclarationText(text: string, newMissionInfo: Record<string, string>, oldMissionInfo: Record<string, string>) {
		// This regular expression reads out property declarations in the form of "key = value;" and all its variations, while capturing key and value.
		const propertyDeclarationRegex = /((?:[a-zA-Z]|\$|_)(?:\w|\d|\$|_|\[|\])*)\s*=\s*((?:[^"]|(?:"(?:[^"\\]|\\.)*"))*?);/;
		const propertyDeclarationRegexG = /((?:[a-zA-Z]|\$|_)(?:\w|\d|\$|_|\[|\])*)\s*=\s*((?:[^"]|(?:"(?:[^"\\]|\\.)*"))*?);/g; // 😂 One-character change 👍

		for (let key of new Set([...Object.keys(newMissionInfo), ...Object.keys(oldMissionInfo)])) {
			if (newMissionInfo[key] === oldMissionInfo[key as keyof MissionElementScriptObject])
				continue; // The property didn't change, no need to edit the text!

			const getDeclarationOfKey = (key: string) => {
				let match: RegExpExecArray;
				propertyDeclarationRegexG.lastIndex = 0;

				while ((match = propertyDeclarationRegexG.exec(text)) !== null) {
					let key2 = match[1];
					if (key2.toLowerCase() === key) return match;
				}

				return null;
			};
			const getLastDeclaration = () => {
				let match: RegExpExecArray;
				let prevMatch: RegExpExecArray = null;
				propertyDeclarationRegexG.lastIndex = 0;

				while ((match = propertyDeclarationRegexG.exec(text)) !== null) {
					prevMatch = match;
				}

				return prevMatch;
			};

			if (key in newMissionInfo && key in oldMissionInfo) {
				let declaration = getDeclarationOfKey(key);
				if (!declaration) continue;

				// An existing property changed, replace the declaration.
				text = text.slice(0, declaration.index) + text.slice(declaration.index).replace(
					propertyDeclarationRegex,
					`${key} = "${newMissionInfo[key]}";`
				);
			} else if (key in newMissionInfo) {
				let lastDeclaration = getLastDeclaration();
				if (!lastDeclaration) continue;

				// A new property was added, add a declaration.
				text = text.slice(0, lastDeclaration.index + lastDeclaration[0].length) +
					`\n\t${key} = "${newMissionInfo[key]}";` +
					text.slice(lastDeclaration.index + lastDeclaration[0].length);
			} else {
				let declaration = getDeclarationOfKey(key);
				if (!declaration) continue;

				// An existing property was removed, remove the old declaration.
				text = text.slice(0, declaration.index) + text.slice(declaration.index + declaration[0].length);
			}
		}

		return text;
	}

	determineDatablockCompatibility(): Mission['datablockCompatibility'] {
		let queue = [this.mis.root] as MissionElement[];
		let result = 'mbg' as Mission['datablockCompatibility'];
		let cameraPathNodeRegEx = /camerapath\d+/i;

		const updateResult = (datablock: string) => {
			datablock = datablock.toLowerCase();

			if (result === 'mbg' && !datablocksMBG.includes(datablock)) {
				result = 'mbw';
			}

			if (result === 'mbw' && !datablocksMBW.includes(datablock)) {
				result = 'pq';
			}
		};

		while (queue.length > 0) {
			if (result === 'pq') {
				break;
			}

			let element = queue.pop();

			if (element._type === MissionElementType.SimGroup) {
				queue.push(...element.elements);
			} else if (element._type === MissionElementType.StaticShape) {
				if (
					element.datablock.toLowerCase() === 'pathnode' &&
					cameraPathNodeRegEx.test(element._name)
				) {
					continue; // Ignore PathNodes that belong to a camera path
				}

				updateResult(element.datablock);
			} else if (element._type === MissionElementType.Item) {
				updateResult(element.datablock);
			} else if (element._type === MissionElementType.ParticleEmitterNode) {
				updateResult(element.datablock);
			} else if (element._type === MissionElementType.Trigger) {
				updateResult(element.datablock);
			}
		}

		return result;
	}
}