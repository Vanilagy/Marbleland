import * as jszip from 'jszip';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as crypto from 'crypto';
import { MisFile, MisParser, MissionElementScriptObject, MissionElementSimGroup, MissionElementType } from './io/mis_parser';
import { Config } from './config';
import hxDif from '../lib/hxDif';
import { IGNORE_MATERIALS, IMAGE_EXTENSIONS, Mission } from './mission';
import { Util } from './util';
import { DtsParser } from './io/dts_parser';
import { db, keyValue } from './globals';
import sharp from 'sharp';

/** Stores a list of currently ongoing uploads that are waiting to be submitted. */
export const ongoingUploads = new Map<string, MissionUpload>();
const UPLOAD_TTL = 1000 * 60 * 60 * 24; // After a day, the chance of the upload still being submitted is extremely low, so the upload will be killed at that point.

setInterval(async () => {
	// Once a day, clean up the expired uploads
	for (let [key, upload] of ongoingUploads) {
		if (upload.hasExpired()) ongoingUploads.delete(key);
	}
}, 1000 * 60 * 60 * 24);

/** Represents a mission upload process. Handles processing, verification and submission of the uploaded mission. */
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
	misFile: MisFile;
	/** The path to the .mis file within the .zip directory. */
	misFilePath: string;
	missionInfo: MissionElementScriptObject;
	interiorDependencies = new Set<string>();
	skyDependencies = new Set<string>();
	shapeDependencies = new Set<string>();
	/** Stores the final, normalized directory structure for this level. */
	normalizedDirectory = new Map<string, jszip.JSZipObject>();

	constructor(zip: jszip) {
		this.zip = zip;
	}

	/** Processes the uploaded level, building the dependency tree while finding any problems present.
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
		let continueProcess = await this.checkMis();
		if (!continueProcess) return; // If the mis wasn't valid, no need to even continue

		await this.checkInteriors();
		await this.checkSky();
		await this.checkShapes();

		// Determine all files that are part of the archive but won't be included in the final directory
		let includedFiles = new Set(this.normalizedDirectory.values());
		let excludedFiles: string[] = [];

		for (let filePath in this.zip.files) {
			let file = this.zip.files[filePath];
			if (file.dir) continue;

			if (!includedFiles.has(file)) {
				excludedFiles.push(filePath);
			}
		}

		if (excludedFiles.length > 0) {
			this.warnings.add(`The .zip contains additional files that won't be submitted: ${excludedFiles.join(', ')}`);
		}
	}

	async checkMis() {
		let misFiles: jszip.JSZipObject[] = [];

		// Find all .mis files in the archive
		for (let filePath in this.zip.files) {
			if (filePath.toLowerCase().endsWith('.mis')) misFiles.push(this.zip.files[filePath]);
		}

		// We expect a single level to be uploaded, so abort if we find more than one .mis file.
		if (misFiles.length !== 1) {
			this.problems.add(`The archive must contain exactly one .mis file (found ${misFiles.length}).`);
			return false;
		}

		this.misFilePath = misFiles[0].name;
		this.normalizedDirectory.set(path.posix.join('missions', Util.getFileName(this.misFilePath)), misFiles[0]); // Set the .mis file to be in the missions/ directory

		let text = await misFiles[0].async('text'); // This might fuck up in extremely rare cases due to encoding stuff (because missions aren't UTF-8)
		let misFile: MisFile;

		// Check if this .mis file is already present in the database and if so, abort
		let misHash = crypto.createHash('sha256').update(text).digest('base64');
		let existing = await db.missions.findOne({ misHash: misHash });
		if (existing) {
			this.problems.add("Duplicate: This mission has already been uploaded.");
			return false;
		}

		try {
			let parser = new MisParser(text);
			misFile = parser.parse();
		} catch (e) {
			this.problems.add(`Could not parse ${this.misFilePath}.`);
			return false;
		}

		this.misFile = misFile;
		this.traverseMis(misFile.root); // Start scanning all elements in the .mis file to find possible dependencies

		if (!this.missionInfo) {
			this.problems.add("The mission does not contain a MissionInfo ScriptObject.");
		} else {
			let missing: string[] = [];
			if (!this.missionInfo.name) missing.push("name");
			if (!this.missionInfo.artist) missing.push("artist");

			if (missing.length > 0) this.problems.add(`The mission info is missing the following fields: ${missing.join(', ')}.`);
		}

		let startsWith = Util.removeExtension(misFiles[0].name);
		// Determine all potential image thumbnail names
		let potentialNames = IMAGE_EXTENSIONS.map(x => (startsWith + x).toLowerCase());
		let imageFound = false;

		for (let filePath in this.zip.files) {
			if (!imageFound && potentialNames.includes(filePath.toLowerCase())) {
				imageFound = true;

				let buffer = await this.zip.files[filePath].async('nodebuffer');
				let metadata = await sharp(buffer).metadata();

				if (Math.max(metadata.width, metadata.height) < 128) {
					this.warnings.add(`The image thumbnail contained with the level has a very low resolution (${metadata.width}x${metadata.height}). Please consider upping its resolution or including a .prev.png with your level.`);
				}
			}

			// Include all files as a dependency who start with the .mis file name and end with an image extension. So, level.mis would cause the inclusion of level.png, level.jpg and also level.prev.png and things like that.
			let fileName = Util.getFileName(filePath);
			if (fileName.startsWith(Util.removeExtension(Util.getFileName(misFiles[0].name))) && IMAGE_EXTENSIONS.includes(path.extname(fileName))) {
				this.normalizedDirectory.set(path.posix.join('missions', fileName), this.zip.files[filePath]);
			}
		}
		if (!imageFound) {
			this.problems.add("The level is missing an image thumbnail.");
		}

		return true;
	}

	traverseMis(simGroup: MissionElementSimGroup) {
		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.ScriptObject && element._name === 'MissionInfo' && !this.missionInfo) {
				this.missionInfo = element;
			} else if (element._type === MissionElementType.SimGroup) {
				this.traverseMis(element); // Recurse
			} else if (element._type === MissionElementType.InteriorInstance) {
				this.interiorDependencies.add(element.interiorfile);
			} else if (element._type === MissionElementType.PathedInterior) {
				this.interiorDependencies.add(element.interiorresource);
			} else if (element._type === MissionElementType.Sky) {
				this.skyDependencies.add(element.materiallist);
			} else if (element._type === MissionElementType.TSStatic) {
				this.shapeDependencies.add(element.shapename);
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
	async registerDependency(dependency: string, matchType: 'exact' | 'extension-agnostic', requiredBy: string, permittedExtensions?: string[], interiorsMbgFallback = false, originalDependency?: string): Promise<{ found: jszip.JSZipObject, relativeDirectory: string }> {;
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
					this.normalizedDirectory.set(path.posix.join(relativeDirectory, fileName2), this.zip.files[name]);
				} else {
					// The dependency was found more than once and we aren't sure which one is meant, so abort.
					this.problems.add(`The dependency ${dependency} could not be uniquely resolved to a file in the archive.`);
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
					return this.registerDependency(dependency.replace('interiors/', 'interiors_mbg/'), matchType, requiredBy, permittedExtensions, false, dependency);
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
	async checkInteriors() {
		for (let dependency of this.interiorDependencies) {
			let result = await this.registerDependency(dependency, 'exact', this.misFilePath, null, true);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			// Read in the .dif
			let arrayBuffer = await found.async('arraybuffer');
			let dif = hxDif.Dif.LoadFromArrayBuffer(arrayBuffer);

			// Go over all materials and add them as dependencies
			for (let interior of dif.interiors.concat(dif.subObjects)) {
				for (let material of interior.materialList) {
					if (IGNORE_MATERIALS.includes(material)) continue;

					let materialFileName = Util.getFileName(material);
					await this.registerDependency(path.posix.join(relativeDirectory, materialFileName), 'extension-agnostic', dependency, IMAGE_EXTENSIONS);
				}
			}
		}
	}

	/** Walks over the sky dependencies. */
	async checkSky() {
		for (let dependency of this.skyDependencies) {
			let result = await this.registerDependency(dependency, 'exact', this.misFilePath);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			// Read in the .dml
			let dmlText = await found.async('text');
			let lines = dmlText.split('\n').map(x => x.trim()).filter(x => x);
	
			// Register all sky textures as dependencies
			for (let line of lines) {
				await this.registerDependency(path.posix.join(relativeDirectory, line), 'extension-agnostic', dependency, IMAGE_EXTENSIONS);
			}
		}
	}

	/** Walks over all shapes and checks their dependencies. */
	async checkShapes() {
		for (let dependency of this.shapeDependencies) {
			let result = await this.registerDependency(dependency, 'exact', this.misFilePath);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			// Read in the .dts
			let buffer = await found.async('arraybuffer');
			let dtsFile = new DtsParser(buffer).parse(true); // Only read up until materials, we don't care about the rest

			// Go over all materials and register them as dependencies
			for (let matName of dtsFile.matNames) {
				let result2 = await this.registerDependency(path.posix.join(relativeDirectory, matName), 'extension-agnostic', dependency, IMAGE_EXTENSIONS.concat(['.ifl']));
				if (!result2) continue;

				let found2 = result2.found;
				
				// We found an .ifl material, so read it in and add all of its dependencies as well
				if (found2.name.toLowerCase().endsWith('.ifl')) {
					let iflText = await found2.async('text');
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							await this.registerDependency(path.posix.join(relativeDirectory, textureName), 'extension-agnostic', found2.name, IMAGE_EXTENSIONS);
						}
					}
				}
			}
		}
	}

	hasExpired() {
		return Date.now() - this.started >= UPLOAD_TTL;
	}

	/** Submits the uploaded mission to the database and writes its normalized directory to disk. */
	async submit(submitter: number, remarks?: string) {
		if (this.hasExpired()) throw new Error("Expired.");

		let levelId = keyValue.get('levelId');
		keyValue.set('levelId', levelId + 1);

		let directoryPath = path.join(__dirname, 'storage', 'levels', levelId.toString());
		await fs.ensureDir(directoryPath); // Create the new directory

		// Write everything to disk
		for (let [relativePath, file] of this.normalizedDirectory) {
			let buffer = await file.async('nodebuffer');
			let fullPath = path.join(directoryPath, relativePath);
			await fs.ensureFile(fullPath);
			await fs.writeFile(fullPath, buffer);
		}

		// Create a mission at the newly created directory and hydrate it like we would with any other mission
		let relativePath = [...this.normalizedDirectory.keys()].find(x => x.endsWith('.mis'));
		let mission = new Mission(directoryPath, relativePath, levelId);
		await mission.hydrate();

		// Add the mission to the database
		let doc = mission.createDoc();
		doc.addedBy = submitter;
		doc.remarks = remarks ?? '';

		await db.missions.insert(doc);
		ongoingUploads.delete(this.id);

		return doc;
	}
}