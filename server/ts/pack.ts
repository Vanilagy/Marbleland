import sharp from "sharp";
import { ExtendedPackInfo, LevelInfo, PackInfo } from "../../shared/types";
import { AccountDoc, getProfileInfo } from "./account";
import { db } from "./globals";
import { Mission, MissionDoc } from "./mission";
import * as fs from 'fs-extra';
import * as path from 'path';

export interface PackDoc {
	_id: number,
	name: string,
	description: string,
	createdAt: number,
	createdBy: number,
	levels: number[],
	downloads: number
}


export const getPackInfo = async (doc: PackDoc): Promise<PackInfo> => {
	let accountDoc = await db.accounts.findOne({ _id: doc.createdBy }) as AccountDoc;

	return {
		id: doc._id,
		name: doc.name,
		createdBy: await getProfileInfo(accountDoc),
		createdAt: doc.createdAt,
		levelIds: doc.levels
	};
};

export const getExtendedPackInfo = async (doc: PackDoc): Promise<ExtendedPackInfo> => {
	let accountDoc = await db.accounts.findOne({ _id: doc.createdBy }) as AccountDoc;
	let levelInfos: LevelInfo[] = [];

	for (let levelId of doc.levels) {
		let missionDoc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
		if (!missionDoc) continue;
		let mission = Mission.fromDoc(missionDoc);
		levelInfos.push(mission.createLevelInfo());
	}

	return {
		id: doc._id,
		name: doc.name,
		description: doc.description,
		createdBy: await getProfileInfo(accountDoc),
		createdAt: doc.createdAt,
		levels: levelInfos,
		downloads: doc.downloads ?? 0
	};
};

export const getPackThumbnailPath = (doc: PackDoc) => {
	return path.join(__dirname, `storage/pack_thumbnails/${doc._id}.jpg`);
};

export const createPackThumbnail = async (doc: PackDoc) => {
	let thumbnailPath = getPackThumbnailPath(doc);
	try {
		await fs.unlink(thumbnailPath);
	} catch {} // Thing gon' throw an error if the file doesn't exist

	let width = 512;
	let height = 512;

	let image = sharp({
		create: {
			width: width,
			height: height,
			channels: 3,
			background: {r: 220, g: 220, b: 220}
		}
	});

	let shownLevels = doc.levels.slice(0, 20);
	let sliceWidth = width / shownLevels.length;
	let promises: Promise<sharp.OverlayOptions>[] = [];

	for (let i = 0; i < shownLevels.length; i++) {
		promises.push(new Promise<sharp.OverlayOptions>(async resolve => {
			let missionDoc = await db.missions.findOne({ _id: shownLevels[i] }) as MissionDoc;
			let mission = Mission.fromDoc(missionDoc);
	
			let imagePath = mission.getImagePath();
			if (!imagePath) return;
	
			let rawBuffer = await fs.readFile(path.join(mission.baseDirectory, imagePath));
	
			let buffer = await sharp(rawBuffer).resize({width: width, height: height, fit: 'cover'}).extract({
				left: Math.floor((width - sliceWidth) / 2),
				top: 0,
				width: Math.ceil(sliceWidth),
				height: height
			}).png({ compressionLevel: 0 }).toBuffer();
			
			resolve({
				input: buffer,
				top: 0,
				left: Math.floor(sliceWidth * i)
			});
		}));
	}
	
	let toComposite = await Promise.all(promises);
	let resultBuffer = await image.composite(toComposite).jpeg({ quality: 100 }).toBuffer();

	await fs.writeFile(thumbnailPath, resultBuffer);
};