import sharp from "sharp";
import { ExtendedPackInfo, LevelInfo, PackInfo } from "../../shared/types";
import { AccountDoc, getProfileInfo } from "./account";
import { db, keyValue } from "./globals";
import { Mission, MissionDoc } from "./mission";
import * as fs from 'fs-extra';
import * as path from 'path';
import { Util } from "./util";

/** Representation of a pack in the database. */
export interface PackDoc {
	_id: number,
	name: string,
	description: string,
	createdAt: number,
	createdBy: number,
	/** List of level IDs contained in this pack. */
	levels: number[],
	downloads: number,
	lovedBy?: number[]
}

/** Creates a new pack with given name and description. */
export const createPack = async (accountDoc: AccountDoc, name: string, description: string, insert = true) => {
	if (typeof name !== 'string' || typeof description !== 'string') {
		throw new Error("Bad data.");
	}

	let id = keyValue.get('packId');
	keyValue.set('packId', id + 1);

	let packDoc: PackDoc = {
		_id: id,
		name: name,
		description: description,
		createdAt: Date.now(),
		createdBy: accountDoc._id,
		levels: [],
		downloads: 0
	};
	if (insert) await db.packs.insert(packDoc);

	return packDoc;
};

export const getPackInfo = async (doc: PackDoc): Promise<PackInfo> => {
	let accountDoc = await db.accounts.findOne({ _id: doc.createdBy }) as AccountDoc;

	return {
		id: doc._id,
		name: doc.name,
		createdBy: await getProfileInfo(accountDoc),
		createdAt: doc.createdAt,
		levelIds: doc.levels,
		downloads: doc.downloads ?? 0,
		lovedCount: doc.lovedBy?.length ?? 0
	};
};

export const getExtendedPackInfo = async (doc: PackDoc, requesterId?: number): Promise<ExtendedPackInfo> => {
	let accountDoc = await db.accounts.findOne({ _id: doc.createdBy }) as AccountDoc;
	let levelInfos: LevelInfo[] = [];

	// Generate the level info for every level in this pack
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
		downloads: doc.downloads ?? 0,
		lovedCount: doc.lovedBy?.length ?? 0,
		lovedByYou: doc.lovedBy?.includes(requesterId) ?? false
	};
};

export const getPackThumbnailPath = (doc: PackDoc) => {
	return path.join(__dirname, `storage/pack_thumbnails/${doc._id}.jpg`);
};

/** Generates a thumbnail image for this pack based on the levels it contains. */
export const createPackThumbnail = async (doc: PackDoc) => {
	let thumbnailPath = getPackThumbnailPath(doc);
	try {
		await fs.unlink(thumbnailPath);
	} catch {} // Thing gon' throw an error if the file doesn't exist

	let width = 512;
	let height = 512;

	// Start by creating an empty image
	let image = sharp({
		create: {
			width: width,
			height: height,
			channels: 3,
			background: {r: 220, g: 220, b: 220}
		}
	});

	// We're going for a "slice" design, so the pack thumbnail consists of slices of the level thumbnails. Determine how many slices we need.
	let shownLevels = doc.levels.slice(0, 20);
	let sliceWidth = width / shownLevels.length;
	let promises: Promise<sharp.OverlayOptions>[] = [];

	for (let i = 0; i < shownLevels.length; i++) {
		promises.push(new Promise<sharp.OverlayOptions>(async resolve => {
			let missionDoc = await db.missions.findOne({ _id: shownLevels[i] }) as MissionDoc;
			let mission = Mission.fromDoc(missionDoc);
			let buffer: Buffer;
	
			let imagePath = mission.getImagePath();
			if (!imagePath) {
				// Use a transparent image for missions with no thumbnail
				buffer = await sharp({
					create: {
						width: Math.ceil(sliceWidth),
						height: height,
						channels: 4,
						background: { r: 0, g: 0, b: 0, alpha: 0 }
					}
				}).png().toBuffer();
			} else {
				let rawBuffer = await fs.readFile(path.join(mission.baseDirectory, imagePath));
				
				// Check if the image has a niche format and needs conversion first
				if (['.dds', '.bmp'].some(x => imagePath.toLowerCase().endsWith(x))) {
					rawBuffer = await Util.nicheFormatToPng(rawBuffer);
				}
	
				// Cut out the center part of the thumbnail in a slim strip
				buffer = await sharp(rawBuffer).resize({width: width, height: height, fit: 'cover'}).extract({
					left: Math.floor((width - sliceWidth) / 2),
					top: 0,
					width: Math.ceil(sliceWidth),
					height: height
				}).png({ compressionLevel: 0 }).toBuffer();
			}

			resolve({
				input: buffer,
				top: 0,
				left: Math.floor(sliceWidth * i)
			});
		}));
	}
	
	// Compose all images together, then export and store the thumbnail
	let toComposite = await Promise.all(promises);
	let resultBuffer = await image.composite(toComposite).jpeg({ quality: 100 }).toBuffer();

	await fs.writeFile(thumbnailPath, resultBuffer);
};