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
		let missionText = (await fs.readFile(path.join(Config.dataPath, missionPath))).toString();
		let misFile = new MisParser(missionText).parse();
		let dependencies: string[] = [];

		this.visitedPaths.clear();

		dependencies.push(missionPath);
		dependencies.push(...await this.getSimGroupDependencies(misFile.root));

		return [...new Set(dependencies)]; // Remove duplicates
	}

	static async getSimGroupDependencies(simGroup: MissionElementSimGroup) {
		let dependencies: string[] = [];

		for (let element of simGroup.elements) {
			if (element._type === MissionElementType.SimGroup) {
				dependencies.push(...await this.getSimGroupDependencies(element));
			} else if (element._type === MissionElementType.InteriorInstance) {
				dependencies.push(...await this.getInteriorDependencies(element.interiorfile));
			} else if (element._type === MissionElementType.PathedInterior) {
				dependencies.push(...await this.getInteriorDependencies(element.interiorresource));
			} else if (element._type === MissionElementType.Sky) {
				dependencies.push(...await this.getSkyDependencies(element));
			} else if (element._type === MissionElementType.TSStatic) {
				dependencies.push(...await this.getTSStaticDependencies(element));
			}
		}

		return dependencies;
	}

	static async getInteriorDependencies(rawInteriorPath: string) {
		let dependencies: string[] = [];

		let interiorPath = rawInteriorPath.slice(rawInteriorPath.indexOf('data/') + 'data/'.length);
		let interiorDirectory = interiorPath.substring(0, interiorPath.lastIndexOf('/'));

		if (this.visitedPaths.has(interiorPath)) return dependencies;
		else this.visitedPaths.add(interiorPath);

		let fullPath = path.join(Config.dataPath, interiorPath);
		let exists = await fs.pathExists(fullPath);

		if (exists) {
			dependencies.push(interiorPath);

			let arrayBuffer = (await fs.readFile(fullPath)).buffer;
			let dif = hxDif.Dif.LoadFromBuffer(hxDif.haxe_io_Bytes.ofData(arrayBuffer));

			for (let interior of dif.interiors) dependencies.push(...await this.getMaterialPaths(interior.materialList, interiorDirectory));
			for (let interior of dif.subObjects) dependencies.push(...await this.getMaterialPaths(interior.materialList, interiorDirectory));
		}

		return dependencies;
	}

	static async getMaterialPaths(materialList: hxDif.Dif["interiors"][number]["materialList"], interiorDirectory: string) {
		let paths: string[] = [];

		for (let material of materialList) {
			if (IGNORE_MATERIALS.includes(material)) continue;

			let fileName = material.slice(material.lastIndexOf('/') + 1);
			let fullFileName = await Util.getFullFileName(fileName, path.join(Config.dataPath, interiorDirectory));
			if (fullFileName) {
				let materialPath = interiorDirectory + '/' + fullFileName;
				paths.push(materialPath);
			}
		}

		return paths;
	}

	static async getSkyDependencies(element: MissionElementSky) {
		let dependencies: string[] = [];

		let skyPath = element.materiallist.slice(element.materiallist.indexOf('data/') + 'data/'.length);
		let skyDirectory = skyPath.substring(0, skyPath.lastIndexOf('/'));

		if (this.visitedPaths.has(skyPath)) return skyPath;
		else this.visitedPaths.add(skyPath);
		
		let fullPath = path.join(Config.dataPath, skyPath);
		let exists = await fs.pathExists(fullPath);

		if (exists) {
			dependencies.push(skyPath);

			let dmlText = (await fs.readFile(fullPath)).toString();
			let lines = dmlText.split('\n').map(x => x.trim()).filter(x => x);

			for (let line of lines) {
				let fullFileName = await Util.getFullFileName(line, path.join(Config.dataPath, skyDirectory));
				if (fullFileName) {
					let texturePath = skyDirectory + '/' + fullFileName;
					dependencies.push(texturePath);
				}
			}
		}

		return dependencies;
	}

	static async getTSStaticDependencies(element: MissionElementTSStatic) {
		let dependencies: string[] = [];

		let dtsPath = element.shapename.slice(element.shapename.indexOf('data/') + 'data/'.length);
		let dtsDirectory = dtsPath.substring(0, dtsPath.lastIndexOf('/'));

		if (this.visitedPaths.has(dtsPath)) return dependencies;
		else this.visitedPaths.add(dtsPath);

		let fullPath = path.join(Config.dataPath, dtsPath);

		dependencies.push(dtsPath);

		let buffer = (await fs.readFile(fullPath)).buffer;
		let dtsFile = new DtsParser(buffer).parse();

		for (let matName of dtsFile.matNames) {
			let fullFileName = await Util.getFullFileName(matName, path.join(Config.dataPath, dtsDirectory));
			if (fullFileName) {
				let extension = path.extname(fullFileName);
				if (extension === '.ifl') {
					let iflText = (await fs.readFile(path.join(Config.dataPath, dtsDirectory, fullFileName))).toString();
					let lines = iflText.split('\n');
					for (let line of lines) {
						let textureName = line.split(' ')[0]?.trim();
						if (textureName) {
							dependencies.push(dtsDirectory + '/' + textureName);
						}
					}
				} else {
					dependencies.push(dtsDirectory + '/' + fullFileName);
				}
			}
		}

		return dependencies;
	}
}