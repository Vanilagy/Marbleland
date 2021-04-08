import * as jszip from 'jszip';
import * as path from 'path';
import * as fs from 'fs-extra';
import { MisFile, MisParser, MissionElementScriptObject, MissionElementSimGroup, MissionElementType } from './mis_parser';
import { Config } from './config';
import hxDif from '../lib/hxDif';
import { IGNORE_MATERIALS, IMAGE_EXTENSIONS, Mission } from './mission';
import { Util } from './util';
import { DtsParser } from './dts_parser';
import { db, keyValue } from './globals';

export const ongoingUploads = new Map<string, MissionUpload>();
const UPLOAD_TTL = 1000 * 60 * 60 * 24;

setInterval(async () => {
	// Once a day, clean up the expired uploads
	for (let [key, upload] of ongoingUploads) {
		if (upload.hasExpired()) ongoingUploads.delete(key);
	}
}, 1000 * 60 * 60 * 24);

export class MissionUpload {
	id = Math.random().toString();
	started = Date.now();
	zip: jszip;
	problems = new Set<string>();
	misFile: MisFile;
	misFilePath: string;
	missionInfo: MissionElementScriptObject;
	interiorDependencies = new Set<string>();
	skyDependencies = new Set<string>();
	shapeDependencies = new Set<string>();
	normalizedDirectory = new Map<string, jszip.JSZipObject>();

	constructor(zip: jszip) {
		this.zip = zip;
	}

	async process() {
		if (!(await this.checkMis())) return;
		await this.checkInteriors();
		await this.checkSky();
		await this.checkShapes();
	}

	async checkMis() {
		let misFiles: jszip.JSZipObject[] = [];

		for (let filePath in this.zip.files) {
			if (filePath.toLowerCase().endsWith('.mis')) misFiles.push(this.zip.files[filePath]);
		}

		if (misFiles.length !== 1) {
			this.problems.add(`The archive must contain exactly one .mis file (found ${misFiles.length}).`);
			return false;
		}

		this.misFilePath = misFiles[0].name;
		this.normalizedDirectory.set(path.posix.join('missions', Util.getFileName(this.misFilePath)), misFiles[0]);

		let text = await misFiles[0].async('text'); // This might fuck up in extremely rare cases due to encoding stuff
		let misFile: MisFile;

		try {
			let parser = new MisParser(text);
			misFile = parser.parse();
		} catch (e) {
			this.problems.add(`Could not parse ${this.misFilePath}.`);
			return false;
		}

		this.misFile = misFile;
		this.traverseMis(misFile.root);

		if (!this.missionInfo) {
			this.problems.add("The mission does not contain a MissionInfo ScriptObject.");
		} else {
			let missing: string[] = [];
			if (!this.missionInfo.name) missing.push("name");
			if (!this.missionInfo.artist) missing.push("artist");

			if (missing.length > 0) this.problems.add(`The mission info is missing the following fields: ${missing.join(', ')}.`);
		}

		let startsWith = Util.removeExtension(misFiles[0].name);
		let potentialNames = IMAGE_EXTENSIONS.map(x => (startsWith + x).toLowerCase());
		let imageFound = false;

		for (let filePath in this.zip.files) {
			if (potentialNames.includes(filePath.toLowerCase())) {
				imageFound = true;
			}

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
				this.traverseMis(element);
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

	async findFile(fileName: string, relativePath: string, walkUp = true): Promise<string> {
		let dir = await Util.readdirCached(path.join(Config.dataPath, relativePath));
		let lowerCase = fileName.toLowerCase();

		for (let file of dir) {
			if (Util.removeExtension(file).toLowerCase() === lowerCase) return path.posix.join(relativePath, file);
		}

		let slashIndex = relativePath.lastIndexOf('/');
		if (slashIndex === -1 || !walkUp) return null;
		return this.findFile(fileName, relativePath.slice(0, slashIndex));
	}

	async findPath(filePath: string) {
		let fullPath: string, exists: boolean;

		fullPath = path.join(Config.dataPath, filePath);
		exists = await fs.pathExists(fullPath);
		if (exists) return fullPath;
		
		return null;
	}

	async resolve(dependency: string, matchType: 'exact' | 'extension-agnostic', requiredBy: string, findFile: boolean) {
		let fileName = Util.getFileName(dependency);
		let dataIndex = dependency.indexOf('data/');
		let relativePath = (dataIndex !== -1)? dependency.slice(dependency.indexOf('data/') + 'data/'.length) : dependency;
		let relativeDirectory = relativePath.substring(0, relativePath.lastIndexOf('/'));
		let found: jszip.JSZipObject;

		for (let name in this.zip.files) {
			let matches: boolean;
			let fileName2 = name.slice(name.lastIndexOf('/') + 1);

			if (matchType === 'exact') {
				matches = fileName2.toLowerCase() === fileName.toLowerCase();
			} else {
				matches = fileName2.toLowerCase() === fileName.toLowerCase() + path.extname(fileName2.toLowerCase());
			}

			if (matches) {
				if (!found) {
					found = this.zip.files[name];
					this.normalizedDirectory.set(path.posix.join(relativeDirectory, fileName2), this.zip.files[name]);
				} else {
					this.problems.add(`The dependency ${dependency} could not be uniquely resolved to a file in the archive.`);
					return;
				}
			}
		}

		if (!found) {
			let fullPath: string;

			if (findFile) fullPath = await this.findFile(fileName, relativeDirectory);
			else fullPath = await this.findPath(relativePath);

			if (!fullPath) {
				this.problems.add(`Missing dependency: ${dependency} is required by ${requiredBy} but couldn't be found.`);
			}

			return null;
		}

		return { found, relativeDirectory };
	}

	async checkInteriors() {
		for (let dependency of this.interiorDependencies) {
			let result = await this.resolve(dependency, 'exact', this.misFilePath, false);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			let arrayBuffer = await found.async('arraybuffer');
			let dif = hxDif.Dif.LoadFromArrayBuffer(arrayBuffer);

			for (let interior of dif.interiors.concat(dif.subObjects)) {
				for (let material of interior.materialList) {
					if (IGNORE_MATERIALS.includes(material)) continue;

					let materialFileName = Util.getFileName(material);
					await this.resolve(path.posix.join(relativeDirectory, materialFileName), 'extension-agnostic', dependency, true);
				}
			}
		}
	}

	async checkSky() {
		for (let dependency of this.skyDependencies) {
			let result = await this.resolve(dependency, 'exact', this.misFilePath, false);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			let dmlText = await found.async('text');
			let lines = dmlText.split('\n').map(x => x.trim()).filter(x => x);
	
			for (let line of lines) {
				await this.resolve(path.posix.join(relativeDirectory, line), 'extension-agnostic', dependency, true);
			}
		}
	}

	async checkShapes() {
		for (let dependency of this.shapeDependencies) {
			let result = await this.resolve(dependency, 'exact', this.misFilePath, false);
			if (!result) continue;

			let { found, relativeDirectory } = result;

			let buffer = await found.async('arraybuffer');
			let dtsFile = new DtsParser(buffer).parse(true); // Only read up until materials, we don't care about the rest

			for (let matName of dtsFile.matNames) {
				let result2 = await this.resolve(path.posix.join(relativeDirectory, matName), 'extension-agnostic', dependency, true);
				if (!result2) continue;

				let found2 = result2.found;
				
				if (found2.name.toLowerCase().endsWith('.ifl')) {
					let iflText = await found2.async('text');
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							await this.resolve(path.posix.join(relativeDirectory, textureName), 'extension-agnostic', found2.name, true);
						}
					}
				}
			}
		}
	}

	hasExpired() {
		return Date.now() - this.started >= UPLOAD_TTL;
	}

	async submit(submitter: number, remarks?: string) {
		if (this.hasExpired()) throw new Error("Expired.");

		let levelId = keyValue.get('levelId');
		keyValue.set('levelId', levelId + 1);

		let directoryPath = path.join(__dirname, 'storage', 'levels', levelId.toString());
		await fs.ensureDir(directoryPath);

		for (let [relativePath, file] of this.normalizedDirectory) {
			let buffer = await file.async('nodebuffer');
			let fullPath = path.join(directoryPath, relativePath);
			await fs.ensureFile(fullPath);
			await fs.writeFile(fullPath, buffer);
		}

		let relativePath = [...this.normalizedDirectory.keys()].find(x => x.endsWith('.mis'));
		let mission = new Mission(directoryPath, relativePath);
		await mission.hydrate();

		let doc = mission.createDoc(levelId);
		doc.addedBy = submitter;
		doc.remarks = remarks ?? '';

		await db.missions.insert(doc);
		ongoingUploads.delete(this.id);

		return doc;
	}
}