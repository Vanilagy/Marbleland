import * as fs from 'fs-extra';
import * as path from 'path';
import { Config } from './config';
import { MisParser, MissionElementSimGroup, MissionElementSky, MissionElementTSStatic, MissionElementType } from './mis_parser';
import hxDif from '../lib/hxDif';
import { Util } from './util';
import { DtsParser } from './dts_parser';

const IGNORE_MATERIALS = ['NULL', 'ORIGIN', 'TRIGGER', 'FORCEFIELD'];

export class Mission {
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