import * as jszip from 'jszip';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as crypto from 'crypto';
import { MisFile, MisParser, MissionElementScriptObject, MissionElementSimGroup, MissionElementType } from './io/mis_parser';
import { Config } from './config';
import hxDif from '../lib/hxDif';
import { IGNORE_MATERIALS, IMAGE_EXTENSIONS, Mission, MissionDoc } from './mission';
import { Util } from './util';
import { DtsFile, DtsParser } from './io/dts_parser';
import { db, keyValue } from './globals';
import { createPack, createPackThumbnail, PackDoc } from './pack';
import { AccountDoc } from './account';

/** Stores a list of currently ongoing uploads that are waiting to be submitted. */
export const ongoingUploads = new Map<string, MissionUpload>();
const UPLOAD_TTL = 1000 * 60 * 60 * 24; // After a day, the chance of the upload still being submitted is extremely low, so the upload will be killed at that point.

setInterval(async () => {
	// Once a day, clean up the expired uploads
	for (let [key, upload] of ongoingUploads) {
		if (upload.hasExpired()) ongoingUploads.delete(key);
	}
}, 1000 * 60 * 60 * 24);

/** Stores data for each mission uploaded through an archive. */
interface MissionGroup {
	misFile: jszip.JSZipObject,
	misFilePath: string,
	missionInfo: MissionElementScriptObject,
	thumbnailFile: jszip.JSZipObject,
	interiorDependencies: Set<string>,
	skyDependencies: Set<string>,
	shapeDependencies: Set<string>,
	/** Stores the final, normalized directory structure for this level. */
	normalizedDirectory: Map<string, jszip.JSZipObject>
}

/** Represents a mission upload process. Handles processing, verification and submission of the uploaded missions. */
export class MissionUpload {
	/** A ID to uniquely identify this upload. */
	id = Math.random().toString(); // Plenty safe for this usecase 🥴
	/** Used to check expiration */
	started = Date.now();
	zip: jszip;
	/** Stores a list of problems with the uploaded mission. A problematic mission can't be uploaded. */
	problems = new Set<string>();
	/** Stores a list of warnings regarding mission upload, which are things to pay attention to but not things that will prevent submission. */
	warnings = new Set<string>();
	groups: MissionGroup[] = [];

	constructor(zip: jszip) {
		this.zip = zip;
	}

	/** Processes the uploaded missions, building the dependency tree while finding any problems present.
	 * 
	 * General explanation of the archive resolution process:
	 * Every time we try to find files in the uploaded archive, we view the archive as "flattened", meaning we assume that there are no subdirectories and
	 * all files are on the same level, in the same root directory. We do this because we don't want to impose a certain archive format because
	 * people like formatting their zips in different ways. However, the fact that we can't rely on a directory structure means we need to ignore it entirely
	 * to make resolution possible.
	 * Starting from the .mis file (which there can be only one of), the asset dependency tree is built and the necessary files are added and their paths normalized
	 * into a structure compatible with that of the PQ data directory. Note that all files included in the archive but not determined to be a dependency will
	 * not be included in the normalized directory.
	*/
	async process() {
		this.sanitizeArchive();
		this.createMissionGroups();

		// Now, process every mission separately
		for (let group of this.groups) {
			let continueProcess = await this.checkMis(group);
			if (!continueProcess) continue; // If the mis wasn't valid, no need to even continue
	
			await this.checkInteriors(group);
			await this.checkSky(group);
			await this.checkShapes(group);
		}

		// Determine all files that are part of the archive but won't be included in the final directory
		let includedFiles = new Set(this.groups.map(x => [...x.normalizedDirectory.values()]).flat());
		let excludedFiles: string[] = [];

		for (let filePath in this.zip.files) {
			let file = this.zip.files[filePath];
			if (file.dir) continue;

			if (!includedFiles.has(file)) {
				excludedFiles.push(filePath);
			}
		}

		if (excludedFiles.length > 0) {
			this.warnings.add(`The .zip contains additional files that won't be submitted because they're not a dependency: ${excludedFiles.join(', ')}`);
		}
	}

	sanitizeArchive() {
		// Remove all macOS-related files
		for (let filePath in this.zip.files) {
			if (filePath.startsWith('__MACOSX/')) delete this.zip.files[filePath];
			if (filePath.endsWith('.DS_Store')) delete this.zip.files[filePath];
		}
	}

	createMissionGroups() {
		let misFiles: jszip.JSZipObject[] = [];

		// Find all .mis files in the archive
		for (let filePath in this.zip.files) {
			if (filePath.toLowerCase().endsWith('.mis')) misFiles.push(this.zip.files[filePath]);
		}

		if (misFiles.length === 0) {
			this.problems.add(`The archive must contain at least one .mis file.`);
		}

		for (let file of misFiles) {
			let group: MissionGroup = {
				misFile: file,
				misFilePath: file.name,
				missionInfo: null,
				thumbnailFile: null,
				interiorDependencies: new Set(),
				skyDependencies: new Set(),
				shapeDependencies: new Set(),
				normalizedDirectory: new Map()
			};
			this.groups.push(group);
		}
	}

	async checkMis(group: MissionGroup) {
		group.normalizedDirectory.set(path.posix.join('missions', Util.getFileName(group.misFilePath)), group.misFile); // Set the .mis file to be in the missions/ directory

		let text = await group.misFile.async('text'); // This might fuck up in extremely rare cases due to encoding stuff (because missions aren't UTF-8)
		let misFile: MisFile;

		// Check if this .mis file is already present in the database and if so, abort
		let misHash = crypto.createHash('sha256').update(text).digest('base64');
		let existing = await db.missions.findOne({ misHash: misHash });
		if (existing) {
			this.problems.add(`Duplicate: Mission ${group.misFilePath} has already been uploaded.`);
			return false;
		}

		if (!text.includes('//--- OBJECT WRITE BEGIN ---') || !text.includes('//--- OBJECT WRITE END ---')) {
			this.problems.add(`${group.misFilePath} does not contain both "//--- OBJECT WRITE BEGIN ---" and "//--- OBJECT WRITE END ---", which are necessary for the level to behave correctly in the editor. Please add them around the outer MissionGroup element.`);
			return false;
		}

		try {
			let parser = new MisParser(text);
			misFile = parser.parse();
		} catch (e) {
			this.problems.add(`Could not parse ${group.misFilePath}.`);
			return false;
		}

		await this.traverseMis(group, misFile.root); // Start scanning all elements in the .mis file to find possible dependencies

		if (!group.missionInfo) {
			this.problems.add(`${group.misFilePath} does not contain a MissionInfo ScriptObject.`);
		} else {
			let missing: string[] = [];
			if (!group.missionInfo.name) missing.push("name");
			if (!group.missionInfo.artist) missing.push("artist");

			if (missing.length > 0) this.problems.add(`The mission info in ${group.misFilePath} is missing the following fields: ${missing.join(', ')}.`);
		}

		let startsWith = Util.removeExtension(group.misFile.name);
		// Determine all potential image thumbnail names
		let potentialNames = IMAGE_EXTENSIONS.map(x => (startsWith + x).toLowerCase());
		let imageFound = false;

		for (let filePath in this.zip.files) {
			if (!imageFound && potentialNames.includes(filePath.toLowerCase())) {
				imageFound = true;

				let buffer = await this.zip.files[filePath].async('nodebuffer');
				let dimensions = await Util.getImageDimensions(buffer);

				if (Math.max(dimensions.width, dimensions.height) < 128) {
					this.warnings.add(`The image thumbnail contained with the level ${group.misFilePath} has a very low resolution (${dimensions.width}x${dimensions.height}). Please consider upping its resolution or including a .prev.png with your level.`);
				}

				group.thumbnailFile = this.zip.files[filePath];
			}

			// Include all files as a dependency who start with the .mis file name and end with an image extension. So, level.mis would cause the inclusion of level.png, level.jpg and also level.prev.png and things like that.
			let fileName = Util.getFileName(filePath);
			if (fileName.toLowerCase().startsWith(Util.removeExtension(Util.getFileName(group.misFile.name).toLowerCase())) && IMAGE_EXTENSIONS.includes(path.extname(fileName.toLowerCase()))) {
				group.normalizedDirectory.set(path.posix.join('missions', fileName), this.zip.files[filePath]);
			}
		}
		if (!imageFound) {
			this.problems.add(`The level ${group.misFilePath} is missing an image thumbnail.`);
		}

		return true;
	}

	async traverseMis(missionGroup: MissionGroup, simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.ScriptObject && element._name === 'MissionInfo' && !missionGroup.missionInfo) {
				missionGroup.missionInfo = element;

				// Check for a music dependency
				if (element.music) await this.registerDependency(missionGroup, path.posix.join('sound/music', element.music), 'exact', missionGroup.misFilePath);
			} else if (element._type === MissionElementType.SimGroup) {
				await this.traverseMis(missionGroup, element); // Recurse
			} else if (element._type === MissionElementType.InteriorInstance) {
				missionGroup.interiorDependencies.add(element.interiorfile);
			} else if (element._type === MissionElementType.PathedInterior) {
				missionGroup.interiorDependencies.add(element.interiorresource);
			} else if (element._type === MissionElementType.Sky) {
				missionGroup.skyDependencies.add(element.materiallist);
			} else if (element._type === MissionElementType.TSStatic) {
				missionGroup.shapeDependencies.add(element.shapename);
			} else if (element._type === MissionElementType.Trigger) {
				// Check for music dependencies caused by MusicTriggers
				if (element.datablock?.toLowerCase() === 'musictrigger') {
					await this.registerDependency(missionGroup, path.posix.join('sound/music', element.text), 'extension-agnostic', missionGroup.misFilePath);
				}
			} else if (element._type === MissionElementType.AudioEmitter) {
				await this.registerDependency(missionGroup, element.filename, 'exact', missionGroup.misFilePath);
			}
		}
	}

	findFile(fileName: string, relativePath: string, permittedExtensions?: string[]): Promise<string> {
		return Util.findFile(fileName, relativePath, [Config.dataPath], true, permittedExtensions);
	}

	findPath(filePath: string) {
		return Util.findPath(filePath, [Config.dataPath]);
	}

	/** Finds and registers a mission dependency. This method first tries to find the given dependency inside the uploaded archive and
	 * if it finds it, its path is normalized and it is added to the normalized directory. If it cannot find it, it checks if the file can
	 * be found in the regular PQ data directory and if so, we don't need to worry about it. If, however, it can't even be found there, then
	 * this mission is dependening on an asset that cannot be found and therefore, the mission can't be submitted.
	 */
	async registerDependency(group: MissionGroup, dependency: string, matchType: 'exact' | 'extension-agnostic', requiredBy: string, permittedExtensions?: string[], interiorsMbgFallback = false, originalDependency?: string): Promise<{ found: jszip.JSZipObject, relativeDirectory: string }> {;
		// First, disect the dependency part into its different piecess
		let fileName = Util.getFileName(dependency);
		let dataIndex = dependency.indexOf('data/');
		let relativePath = (dataIndex !== -1)? dependency.slice(dependency.indexOf('data/') + 'data/'.length) : dependency;
		let relativeDirectory = relativePath.substring(0, relativePath.lastIndexOf('/'));
		let found: jszip.JSZipObject;

		// Then, check the archive and see if it contains the dependency
		for (let name in this.zip.files) {
			let matches: boolean;
			let fileName2 = name.slice(name.lastIndexOf('/') + 1); // We ignore the path completely because we assume the archive to be "flattened"

			if (matchType === 'exact') {
				matches = fileName2.toLowerCase() === fileName.toLowerCase();
			} else {
				matches = fileName2.toLowerCase() === fileName.toLowerCase() + path.extname(fileName2.toLowerCase());
			}

			// Also check if the extension is permitted
			if (permittedExtensions) matches &&= permittedExtensions.includes(path.extname(fileName2.toLowerCase()));

			if (matches) {
				if (!found) {
					// The dependency was found in the archive, so add it to the normalized directory
					found = this.zip.files[name];
					group.normalizedDirectory.set(path.posix.join(relativeDirectory, fileName2), this.zip.files[name]);
				} else {
					// The dependency was found more than once and we aren't sure which one is meant, so abort.
					this.problems.add(`The dependency ${dependency}, required by ${requiredBy}, could not be uniquely resolved to a file in the archive.`);
					return;
				}
			}
		}

		// The dependency wasn't found in the archive but may very well be a part of the regular PQ assets, so let's check that next
		if (!found) {
			let fullPath: string;

			// Find the file differently depending on the match type
			if (matchType === 'extension-agnostic') fullPath = await this.findFile(fileName, relativeDirectory, permittedExtensions);
			else fullPath = await this.findPath(relativePath);

			if (!fullPath) { // We couldn't resolve the dependency to any file
				if (interiorsMbgFallback && relativeDirectory.startsWith('interiors/')) {
					// Special case: If the directory is interiors, check again in interiors_mbg. This is because the default MBG assets (in PQ) are located in interiors_mbg, but the paths within the .mis files still point to interiors (it does some directory shadowing).
					return this.registerDependency(group, dependency.replace('interiors/', 'interiors_mbg/'), matchType, requiredBy, permittedExtensions, false, dependency);
				} else {
					// We definitely couldn't locate a file, add a problem
					this.problems.add(`Missing dependency: ${originalDependency ?? dependency} is required by ${requiredBy} but couldn't be found.`);
				}
			}

			// Since the dependency is not in this archive, we don't return anything
			return null;
		}

		// Return the found object in the archive and the directory we found it in
		return { found, relativeDirectory };
	}

	/** Walks over all interiors and checks their dependencies. */
	async checkInteriors(group: MissionGroup) {
		for (let dependency of group.interiorDependencies) {
			let result = await this.registerDependency(group, dependency, 'exact', group.misFilePath, null, true);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			// Read in the .dif
			let arrayBuffer = await found.async('arraybuffer');
			let dif: hxDif.Dif;

			try {
				dif = hxDif.Dif.LoadFromArrayBuffer(arrayBuffer);
			} catch (e) {
				this.problems.add(`Interior file ${dependency} failed to parse and is likely invalid.`);
				continue;
			}

			// Go over all materials and add them as dependencies
			for (let interior of dif.interiors.concat(dif.subObjects)) {
				let usedMaterials = new Set(interior.surfaces.map(x => x.textureIndex));

				for (let [i, material] of interior.materialList.entries()) {
					if (IGNORE_MATERIALS.includes(material)) continue;
					if (!usedMaterials.has(i)) continue; // If the material isn't used in any surface, we don't care if it's there or not

					let materialFileName = Util.getFileName(material);
					await this.registerDependency(group, path.posix.join(relativeDirectory, materialFileName), 'extension-agnostic', dependency, IMAGE_EXTENSIONS);
				}
			}
		}
	}

	/** Walks over the sky dependencies. */
	async checkSky(group: MissionGroup) {
		for (let dependency of group.skyDependencies) {
			let result = await this.registerDependency(group, dependency, 'exact', group.misFilePath);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			// Read in the .dml
			let dmlText = await found.async('text');
			let lines = dmlText.split('\n').map(x => x.trim()).filter(x => x);
	
			// Register all sky textures as dependencies
			for (let line of lines) {
				await this.registerDependency(group, path.posix.join(relativeDirectory, line), 'extension-agnostic', dependency, IMAGE_EXTENSIONS);
			}
		}
	}

	/** Walks over all shapes and checks their dependencies. */
	async checkShapes(group: MissionGroup) {
		for (let dependency of group.shapeDependencies) {
			let result = await this.registerDependency(group, dependency, 'exact', group.misFilePath);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			// Read in the .dts
			let buffer = await found.async('arraybuffer');
			let dtsFile: DtsFile;

			try {
				dtsFile = new DtsParser(buffer).parse(true); // Only read up until materials, we don't care about the rest
			} catch (e) {
				this.problems.add(`Shape file ${dependency} failed to parse and is likely invalid.`);
				continue;
			}

			// Go over all materials and register them as dependencies
			for (let matName of dtsFile.matNames) {
				let result2 = await this.registerDependency(group, path.posix.join(relativeDirectory, matName), 'extension-agnostic', dependency, IMAGE_EXTENSIONS.concat(['.ifl']));
				if (!result2) continue;

				let found2 = result2.found;
				
				// We found an .ifl material, so read it in and add all of its dependencies as well
				if (found2.name.toLowerCase().endsWith('.ifl')) {
					let iflText = await found2.async('text');
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							await this.registerDependency(group, path.posix.join(relativeDirectory, textureName), 'extension-agnostic', found2.name, IMAGE_EXTENSIONS);
						}
					}
				}
			}
		}
	}

	hasExpired() {
		return Date.now() - this.started >= UPLOAD_TTL;
	}

	/** Submits the uploaded missions to the database and writes their normalized directories to disk. */
	async submit(submitter: AccountDoc, requestBody: {
		remarks: string[],
		addToPacks: number[],
		newPack?: {
			name: string,
			description: string
		}
	}) {
		if (this.hasExpired()) throw new Error("Expired.");

		let packDocs: PackDoc[] = [];
		let newPackId: number = null;

		// Get all the pack docs ready
		for (let packId of new Set(requestBody.addToPacks)) {
			let doc = await db.packs.findOne({ _id: packId }) as PackDoc;
			if (!doc) {
				throw new Error("Pack doesn't exist.");
			}

			packDocs.push(doc);
		}

		// Create a new pack if needed
		if (requestBody.newPack) {
			let newPackDoc = await createPack(submitter, requestBody.newPack.name, requestBody.newPack.description, false);
			packDocs.push(newPackDoc);
			newPackId = newPackDoc._id;
		}

		let docs: MissionDoc[] = [];
		for (let [i, group] of this.groups.entries()) {
			let levelId = keyValue.get('levelId');
			keyValue.set('levelId', levelId + 1);

			let directoryPath = path.join(__dirname, 'storage', 'levels', levelId.toString());
			await fs.ensureDir(directoryPath); // Create the new directory

			// Write everything to disk
			for (let [relativePath, file] of group.normalizedDirectory) {
				let buffer = await file.async('nodebuffer');
				let fullPath = path.join(directoryPath, relativePath);
				await fs.ensureFile(fullPath);
				await fs.writeFile(fullPath, buffer);
			}

			// Create a mission at the newly created directory and hydrate it like we would with any other mission
			let relativePath = [...group.normalizedDirectory.keys()].find(x => x.endsWith('.mis'));
			let mission = new Mission(directoryPath, relativePath, levelId);
			await mission.hydrate();

			// Add the mission to the database
			let doc = mission.createDoc();
			doc.addedBy = submitter._id;
			doc.remarks = requestBody.remarks[i] ?? '';

			docs.push(doc);
		}

		await db.missions.insert(docs);

		// Now, let's do all the pack updating:

		let promises: Promise<any>[] = [];

		for (let packDoc of packDocs) {
			packDoc.levels.push(...docs.map(x => x._id));
			promises.push(createPackThumbnail(packDoc));

			await db.packs.update({ _id: packDoc._id }, packDoc, { upsert: true });
		}

		await Promise.allSettled(promises); // Wait for all the thumbnails to finish

		ongoingUploads.delete(this.id);

		return {
			docs,
			newPackId
		};
	}
}