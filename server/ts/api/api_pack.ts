import * as fs from 'fs-extra';
import { PackInfo } from "../../../shared/types";
import { authorize, isSuspended } from "../account";
import { db } from "../globals";
import { MissionDoc, Mission } from "../mission";
import { PackDoc, getPackInfo, getExtendedPackInfo, createPackThumbnail, getPackThumbnailPath, createPack } from "../pack";
import { app } from "../server";
import { compressAndSendImage, executeWithIpTimeout, ipTimeouts } from "./api";
import { Util } from "../util";
import { MissionZipStream } from "../zip";
import { incrementLevelDownloads } from './api_level';

export const initPackApi = () => {
	// Get a list of all packs
	app.get('/api/pack/list', async (req, res) => {
		let packDocs = await db.packs.find({}) as PackDoc[];
		let packInfos: PackInfo[] = [];

		for (let doc of packDocs) {
			packInfos.push(await getPackInfo(doc));
		}

		res.send(packInfos);
	});

	// Create a new, empty pack
	app.post('/api/pack/create', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let packDoc = await createPack(doc, req.body.name, req.body.description);

		res.send({ packId: packDoc._id });
	});

	// Get extended pack info for a given pack
	app.get('/api/pack/:packId/info', async (req, res) => {
		let doc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!doc) {
			res.status(404).send("404\nNo pack exists with this ID.");
			return;
		}

		let { doc: accountDoc } = await authorize(req);

		let packInfo = await getExtendedPackInfo(doc, accountDoc?._id);
		res.send(packInfo);
	});

	// Get the archive for a pack which contains all levels of the pack
	app.get('/api/pack/:packId/zip', async (req, res) => {
		let doc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!doc) {
			res.status(404).send("No pack exists with this ID.");
			return;
		}

		let assuming = req.query.assuming as string;
		if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest'; // PQ is the dafult

		let missions: Mission[] = [];
		let missionDocs: MissionDoc[] = [];

		// Iterate over all levels in this pack and add their contents to the zip one-by-one
		for (let levelId of doc.levels) {
			let missionDoc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
			if (!missionDoc) continue;

			let mission = Mission.fromDoc(missionDoc);
			missions.push(mission);
			missionDocs.push(missionDoc);
		}

		// Don't wait for this to finish because it can take quite a while
		(async () => {
			for (let doc of missionDocs) {
				await incrementLevelDownloads(doc, req);
			}
		})();

		let stream = new MissionZipStream(missions, assuming as ('none' | 'gold' | 'platinumquest'), 'append-id-to-mis' in req.query);

		// Increment the download count for the entire pack, with possible IP timeout
		await executeWithIpTimeout(req, 'pack' + doc._id, async () => {
			doc.downloads = (doc.downloads ?? 0) + 1;
			await db.packs.update({ _id: doc._id }, doc);
		});

		let fileName = Util.removeSpecialChars(doc.name.toLowerCase().split(' ').map(x => Util.uppercaseFirstLetter(x)).join(''));
		stream.connectToResponse(res, `${fileName}-pack-${doc._id}.zip`);
	});

	// Set the ordered list of levels contained in a pack
	app.post('/api/pack/:packId/set-levels', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!packDoc) {
			res.status(400).end();
			return;
		}

		// Make sure the user actually has permission
		if (packDoc.createdBy !== doc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		// Ensure the type of the body
		if ((req.body as unknown[]).some(x => typeof x !== 'number')) {
			res.status(400).end();
			return;
		}

		// No double entries
		if (new Set(req.body).size !== req.body.length) {
			res.status(400).end();
			return;
		}

		packDoc.levels = req.body;
		await db.packs.update({ _id: packDoc._id }, packDoc);

		res.end();

		// Update the thumbnail because levels have likely changed
		await createPackThumbnail(packDoc);
		clearIpTimeouts(packDoc._id);
	});

	// Get the image thumbnail for a pack
	app.get('/api/pack/:packId/image', async (req, res) => {
		let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!packDoc) {
			res.status(400).end();
			return;
		}

		let imagePath = getPackThumbnailPath(packDoc);
		let exists = await fs.pathExists(imagePath);
		if (!exists) await createPackThumbnail(packDoc); // If the thumbnail doesn't exist yet, it may not have been generated yet or is currently being regenerated. Therefore, generate it here.

		res.set('Cache-Control', 'no-cache, no-store'); // Could change any time
		await compressAndSendImage(imagePath, req, res, { width: 512, height: 512 });
	});

	// Edit pack metadata
	app.patch('/api/pack/:packId/edit', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!packDoc) {
			res.status(400).end();
			return;
		}

		if (packDoc.createdBy !== doc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		if (typeof req.body.name !== 'string' || typeof req.body.description !== 'string') {
			res.status(401).end();
			return;
		}

		packDoc.name = req.body.name;
		packDoc.description = req.body.description;
		await db.packs.update({ _id: packDoc._id }, packDoc);

		res.end();

		clearIpTimeouts(packDoc._id);
	});

	// Delete a pack
	app.delete('/api/pack/:packId/delete', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!packDoc) {
			res.status(400).end();
			return;
		}

		if (packDoc.createdBy !== doc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		await deleteSinglePack(packDoc._id);

		res.end();
	});

	// Mark the pack as loved
	app.patch('/api/pack/:packId/love', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!packDoc) {
			res.status(400).end();
			return;
		}
		let lovedBy = packDoc.lovedBy ?? [];

		if (!lovedBy.includes(doc._id)) lovedBy.push(doc._id);

		packDoc.lovedBy = lovedBy;
		await db.packs.update({ _id: packDoc._id }, packDoc);

		res.end();
	});

	// Unmark the pack as loved
	app.patch('/api/pack/:packId/unlove', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
		if (!packDoc) {
			res.status(400).end();
			return;
		}
		let lovedBy = packDoc.lovedBy ?? [];

		if (lovedBy.includes(doc._id)) lovedBy.splice(lovedBy.indexOf(doc._id), 1);

		packDoc.lovedBy = lovedBy;
		await db.packs.update({ _id: packDoc._id }, packDoc);

		res.end();
	});
};

const clearIpTimeouts = (packId: number) => {
	// Clear IP timeouts because of an edit
	for (let [key] of ipTimeouts) {
		if (key.endsWith('pack' + packId)) ipTimeouts.delete(key);
	}
};

/** Deletes a single pack and handles all cleanup (removing thumbnail, etc.) */
export const deleteSinglePack = async (packId: number) => {
	let packDoc = await db.packs.findOne({ _id: packId }) as PackDoc;
	if (!packDoc) return;

	await db.packs.remove({ _id: packId }, {});

	// Delete pack thumbnail
	try {
		await fs.unlink(getPackThumbnailPath(packDoc));
	} catch {}
};