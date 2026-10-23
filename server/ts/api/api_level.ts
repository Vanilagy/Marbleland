import express from 'express';
import * as path from 'path';
import * as fs from 'node:fs/promises';
import * as crypto from 'crypto';
import jszip from 'jszip';
import multer from 'multer';
import { z } from 'zod';
import { LevelInfo, PackInfo } from "../../../shared/types";
import { authorize, isSuspended, AccountDoc } from "../account";
import { CommentDoc, getCommentInfosForLevel } from "../comment";
import { config, db, keyValue, mbcryptRsaKey} from "../globals";
import { MissionDoc, Mission } from "../mission";
import { MissionUpload, ongoingUploads, registerPendingUpload } from "../mission_upload";
import { PackDoc, getPackInfo, createPackThumbnail } from "../pack";
import { app } from "../server";
import { compressAndSendImage, executeWithIpTimeout, ipTimeouts, parseBinaryBody, requireAccount, validate } from "./api";
import { Util } from '../util';
import { MissionZipStream } from '../zip';
import { MBPakFile } from '../mbcrypt/mbcrypt';
import { rateLimitRequest, HOUR, MINUTE } from '../rate_limiter';
import { COMMENT_MAX_LENGTH, LEVEL_REMARKS_MAX_LENGTH, PACK_DESCRIPTION_MAX_LENGTH, PACK_NAME_MAX_LENGTH } from '../../../shared/constants';

const MAX_UPLOAD_SIZE = 100 * 1024**2;

// In bytes, how much file data each multipart request has sent so far
const multipartUploadSizes = new WeakMap<express.Request, number>();

const lbEndpointScoreSchema = z.object({
    username: z.string(),
    score: z.number(),
    score_type: z.union([z.literal('time'), z.literal('score')]),
    placement: z.number()
});

const lbEndpointResponseSchema = z.object({
    scores: z.array(lbEndpointScoreSchema)
});

const editLevelSchema = z.object({
	missionInfo: z.record(z.string(), z.string()).nullable(),
	remarks: z.string().max(LEVEL_REMARKS_MAX_LENGTH).nullable()
});
const commentSchema = z.object({
	content: z.string().trim().min(1).max(COMMENT_MAX_LENGTH)
});
const curateVoteSchema = z.object({
	vote: z.boolean().nullable()
});
const zipIdsSchema = z.object({
	ids: z.string()
});
const submitUploadSchema = z.object({
	uploadId: z.string(),
	remarks: z.array(z.string().max(LEVEL_REMARKS_MAX_LENGTH)),
	addToPacks: z.array(z.number().int()),
	newPack: z.object({
		name: z.string().trim().min(1).max(PACK_NAME_MAX_LENGTH),
		description: z.string().trim().min(1).max(PACK_DESCRIPTION_MAX_LENGTH)
	}).nullable()
});

/** Verifies that the accessed level actually exists. */
const verifyLevelId = async (req: express.Request, res: express.Response) => {
	let levelId = Number(req.params.levelId);
	if (!Number.isInteger(levelId)) {
		res.status(400).send("400\nLevel ID has to be an integer.");
		return null;
	}

	let doc = await db.missions.findOneAsync({ _id: levelId });
	if (!doc) {
		res.status(404).send("404\nA level with this ID does not exist.");
		return null;
	}

	return levelId;
};

/** Parses and validates the `version` query parameter for a given level. Valid version numbers are 1 up to and including the level's current version number. Returns the parsed version number, undefined if the parameter is absent (meaning the current version), or null if the parameter is invalid (in which case a 400 response has been sent). */
const verifyVersionNumber = (req: express.Request, res: express.Response, doc: MissionDoc) => {
	if (req.query.version === undefined) return undefined;

	let version = Number(req.query.version);
	let currentVersion = (doc.previousVersions?.length ?? 0) + 1;

	if (!Number.isInteger(version) || version < 1 || version > currentVersion) {
		res.status(400).send("400\nInvalid version number.");
		return null;
	}

	return version;
};

export const initLevelApi = () => {
	// Get a list of all levels
	app.get('/api/level/list', async (req, res) => {
		let docs = await db.missions.findAsync({}) as MissionDoc[];
		let response: LevelInfo[] = [];

		for (let doc of docs) {
			let mission = Mission.fromDoc(doc);
			response.push(mission.createLevelInfo());
		}

		res.send(response);
	});

	// Get a .zip of multiple levels
	app.post('/api/level/zip', async (req, res) => {
		let q = validate(zipIdsSchema, req.body, res);
		if (!q) return;

		let levelIdsRaw = q.ids.split(',').map(x => Number(x));
		let levelIds = new Set(levelIdsRaw); // Remove duplicates
		
		// Fastest if we just get all missions at once because NeDB is kinda dumb
		let missionDocs = await db.missions.findAsync({}) as MissionDoc[];
		missionDocs = missionDocs.filter(x => levelIds.has(x._id));
		let missions = missionDocs.map(x => Mission.fromDoc(x));

		// Don't wait for this to finish because it can take quite a while
		(async () => {
			for (let doc of missionDocs) {
				await incrementLevelDownloads(doc, req);
			}
		})();

		let assuming = req.query.assuming as string;
		if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest'; // Default to PQ

		let stream = new MissionZipStream(missions, assuming as ('none' | 'gold' | 'platinumquest'), 'append-id-to-mis' in req.query);
		let hash = crypto.createHash('sha256').update([...levelIds].join(',')).digest('hex');
		let fileName = `levels-${hash.slice(0, 8)}.zip`;
		stream.connectToResponse(res, fileName);
	});

	// Get the .zip of a given level
	app.get('/api/level/:levelId/zip', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let version = verifyVersionNumber(req, res, doc);
		if (version === null) return;
		let mission = Mission.fromVersion(doc, version);

		let assuming = req.query.assuming as string;
		if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest'; // Default to PQ

		let stream = new MissionZipStream([mission], assuming as ('none' | 'gold' | 'platinumquest'), 'append-id-to-mis' in req.query);

		await incrementLevelDownloads(doc, req);

		let fileName = Util.removeSpecialChars(doc.info.name.toLowerCase().split(' ').map(x => Util.uppercaseFirstLetter(x)).join(''));
		stream.connectToResponse(res, `${fileName}-${doc._id}${version !== undefined ? `-v${version}` : ""}.zip`);
	});

	// Get the .mbpak of a given level
	app.get('/api/level/:levelId/mbpak', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let version = verifyVersionNumber(req, res, doc);
		if (version === null) return;
		let mission = Mission.fromVersion(doc, version);

		let assuming = req.query.assuming as string;
		if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest'; // Default to PQ

		if (mbcryptRsaKey === undefined) {
			res.status(401).send("401\nUnsupported");
			return;
		}

		let mbpak = await MBPakFile.create(mission, assuming, 'append-id-to-mis' in req.query);

		await incrementLevelDownloads(doc, req);

		let fileName = Util.removeSpecialChars(doc.info.name.toLowerCase().split(' ').map(x => Util.uppercaseFirstLetter(x)).join(''));

		let mbpakdata = mbpak.write(mbcryptRsaKey);

		res.writeHead(200, {
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': 'attachment;filename=' + `${fileName}-${doc._id}${version !== undefined ? `-v${version}` : ""}.mbpak`,
			'Content-Length': mbpakdata.length
		});
		res.end(mbpakdata);
	});

	// Get the image thumbnail of a level
	app.get('/api/level/:levelId/image', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let version = verifyVersionNumber(req, res, doc);
		if (version === null) return;
		let mission = Mission.fromVersion(doc, version);

		let imagePath = mission.getImagePath();
		if (!imagePath) {
			res.status(404).send("This level is missing an image thumbnail.");
			return;
		}

		res.set('Cache-Control', 'public, max-age=604800');
		await compressAndSendImage(path.join(mission.baseDirectory, imagePath), req, res, { width: 640, height: 480 });
	});

	// Get the preview image of a level
	app.get('/api/level/:levelId/prev-image', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let version = verifyVersionNumber(req, res, doc);
		if (version === null) return;
		let mission = Mission.fromVersion(doc, version);

		let imagePath = mission.getPrevImagePath();
		if (!imagePath) {
			res.status(404).send("This level is missing a preview image.");
			return;
		}

		res.set('Cache-Control', 'public, max-age=604800');
		await compressAndSendImage(path.join(mission.baseDirectory, imagePath), req, res, { width: 2000, height: 1400 });
	});

	// Get a list of all files a level depends on
	app.get('/api/level/:levelId/dependencies', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let version = verifyVersionNumber(req, res, doc);
		if (version === null) return;
		let mission = Mission.fromVersion(doc, version);

		let assuming = req.query.assuming as string;
		if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

		let normalizedDependencies = mission.getFilteredDependencies(assuming as ('none' | 'gold' | 'platinumquest'), 'append-id-to-mis' in req.query);

		res.send(normalizedDependencies);
	});

	// Get info about a given level. The info format for the level is identical to the one used for the levels in /list.
	app.get('/api/level/:levelId/info', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let version = verifyVersionNumber(req, res, doc);
		if (version === null) return;
		let mission = Mission.fromVersion(doc, version);

		res.send(mission.createLevelInfo());
	});

	// Get additional info about a given level
	app.get('/api/level/:levelId/extended-info', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return; 

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let mission = Mission.fromDoc(doc);

		let { doc: accountDoc } = await authorize(req);

		res.send(await mission.createExtendedLevelInfo(accountDoc?._id));
	});

	// Get the raw MissionInfo element from the .mis
	app.get('/api/level/:levelId/mission-info', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let version = verifyVersionNumber(req, res, doc);
		if (version === null) return;
		let mission = Mission.fromVersion(doc, version);

		res.send(mission.info);
	});

	// Get a list of all packs a level appears in
	app.get('/api/level/:levelId/packs', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let packDocs = await db.packs.findAsync({ levels: doc._id }) as PackDoc[];
		let packInfos: PackInfo[] = [];
		for (let packDoc of packDocs) {
			packInfos.push(await getPackInfo(packDoc));
		}

		res.send(packInfos);
	});

	const processMissionArchive = async (req: express.Request, ownerId: number, updateId?: number) => {
		/** A list of problems with the upload, will be populated later. */
		let problems: string[] = [];
		/** A list of warnings regarding the upload. Warnings won't prevent submission. */
		let warnings: string[] = [];
		let zip: jszip;

		if (req.headers['content-type']?.startsWith('multipart/form-data')) {
			// The storage engine stopped keeping data past the limit, so the files are incomplete if it was exceeded
			let files = (req.files as Express.Multer.File[]) ?? [];
			if ((multipartUploadSizes.get(req) ?? 0) > MAX_UPLOAD_SIZE) {
				problems.push("The uploaded files are too large (max 100 MB in total).");
				return { upload: null, problems, warnings };
			}

			zip = new jszip();
			for (let file of files) {
				zip.file(file.originalname, file.buffer);
			}
		} else {
			if (!Buffer.isBuffer(req.body)) {
				problems.push("The upload has to be sent as binary data.");
				return { upload: null, problems, warnings };
			}

			try {
				zip = await jszip.loadAsync(req.body);
			} catch (e) {
				problems.push("The uploaded file couldn't be unzipped.");
			}
		}

		if (!zip) return { upload: null, problems, warnings };

		const upload = new MissionUpload(zip, ownerId, updateId);
		try {
			await upload.process();
			problems.push(...upload.problems);
			warnings.push(...upload.warnings);
		} catch (e) {
			problems.push("An error occurred during processing.");
			console.error("Upload processing error:", e);
		}

		return { upload, problems, warnings };
	};

	// Like multer's memory storage, except that it stops keeping data once the request's files exceed MAX_UPLOAD_SIZE in total.
	// The rest is read and discarded, so memory stays bounded and the handler can still report the problem as usual.
	const boundedMemoryStorage: multer.StorageEngine = {
		_handleFile(req, file, callback) {
			let chunks: Buffer[] = [];
			file.stream.on('data', (chunk: Buffer) => {
				let totalSize = (multipartUploadSizes.get(req) ?? 0) + chunk.length;
				multipartUploadSizes.set(req, totalSize);
				if (totalSize <= MAX_UPLOAD_SIZE) chunks.push(chunk);
			});
			file.stream.on('error', callback);
			file.stream.on('end', () => {
				let buffer = Buffer.concat(chunks);
				callback(null, {
					buffer,
					size: buffer.length
				});
			});
		},
		_removeFile(req, file, callback) {
			delete file.buffer;
			callback(null);
		}
	};

	const upload = multer({
		storage: boundedMemoryStorage,
		limits: {
			files: 10000,
			fields: 10
		}
	});

	// Runs before the body is parsed, so that uploads over the limit don't get read in first
	const limitUploads: express.RequestHandler = (req, res, next) => {
		let doc = res.locals.accountDoc as AccountDoc;
		if (!rateLimitRequest(res, `level-upload:account:${doc._id}`, 30, HOUR)) return;
		next();
	};

	// Upload a level archive. This doesn't yet submit it, but causes the processing/verification step.
	app.post('/api/level/upload', requireAccount, limitUploads, parseBinaryBody, upload.any(), async (req, res) => {
        const doc = res.locals.accountDoc as AccountDoc;

        const { upload, problems } = await processMissionArchive(req, doc._id);

        if (problems.length > 0) {
            return res.status(400).send({ status: 'error', problems });
        }

        registerPendingUpload(upload);

        // Fetch user's packs
        let packDocs = await db.packs.findAsync({ createdBy: doc._id }) as PackDoc[];
        packDocs.sort((a, b) => b.createdAt - a.createdAt);
        let packs = await Promise.all(packDocs.map(p => getPackInfo(p)));

        res.send({
            status: 'success',
            uploadId: upload.id,
            missions: upload.groups.map(x => ({ misFilePath: x.misFilePath, name: x.missionInfo.name })),
            packs,
            warnings: [...upload.warnings]
        });
    });

	/** Looks up a pending upload of the requesting account. Responds with 404 and returns null if there's none. */
	const getOwnUpload = (uploadId: string, res: express.Response, doc: AccountDoc) => {
		// Pending uploads disappear when they expire or get pushed out by newer ones, which is the only way a regular user ends
		// up here, so the client treats a 404 as "expired". Someone else's upload counts as nonexistent.
		let upload = ongoingUploads.get(uploadId);
		if (!upload || upload.ownerId !== doc._id) {
			res.status(404).send("404\nInvalid or expired upload ID.");
			return null;
		}

		return upload;
	};

	/** Makes sure all packs exist and the account may add levels to them. Responds and returns false otherwise. */
	const checkPackPermissions = async (packIds: number[], res: express.Response, doc: AccountDoc) => {
		for (let packId of packIds) {
			let packDoc = await db.packs.findOneAsync({ _id: packId }) as PackDoc;
			if (!packDoc) {
				res.status(400).send("400\nOne of the packs doesn't exist.");
				return false;
			}

			if (packDoc.createdBy !== doc._id && !doc.moderator) {
				res.status(403).send("403\nNo permission to add levels to one of the packs.");
				return false;
			}
		}

		return true;
	};

	// Submit a previously uploaded mission
	app.post('/api/level/submit', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let q = validate(submitUploadSchema, req.body, res);
		if (!q) return;

		let upload = getOwnUpload(q.uploadId, res, doc);
		if (!upload) return;

		// An upload made to update a level was checked as such, so it can only be submitted as that level's update
		if (upload.updateId !== undefined) {
			res.status(400).send("400\nThis upload was made to update a level.");
			return;
		}

		let packsAllowed = await checkPackPermissions(q.addToPacks, res, doc);
		if (!packsAllowed) return;

		let { docs, newPackId } = await upload.submit(doc, q);

		res.send({
			levelIds: docs.map(x => x._id),
			newPackId
		});
	});

	// Upload the level for updating purposes
	app.post('/api/level/:levelId/upload', requireAccount, limitUploads, parseBinaryBody, upload.any(), async (req, res) => {
        const doc = res.locals.accountDoc as AccountDoc;

        const levelId = await verifyLevelId(req, res);
        if (levelId === null) return;

        // Verify ownership of the level being updated
        let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
        if (missionDoc.addedBy !== doc._id && !doc.moderator) {
            res.status(403).send("403\nUnauthorized to update this level.");
            return;
        }

        const { upload, problems, warnings } = await processMissionArchive(req, doc._id, levelId);

        if (problems.length > 0) {
            return res.status(400).send({ status: 'error', problems });
        }

        registerPendingUpload(upload);
        res.send({
            status: 'success',
            uploadId: upload.id,
            missions: upload.groups.map(x => ({ misFilePath: x.misFilePath, name: x.missionInfo.name })),
            warnings: [...warnings]
        });
    });

	// Submit a previously uploaded update
	app.post('/api/level/:levelId/submit', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		const levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		// Verify ownership of the level being updated
		let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		if (missionDoc.addedBy !== doc._id && !doc.moderator) {
			res.status(403).send("403\nUnauthorized to update this level.");
			return;
		}

		let q = validate(submitUploadSchema, req.body, res);
		if (!q) return;

		const upload = getOwnUpload(q.uploadId, res, doc);
		if (!upload) return;

		// Uploads are checked against the level they're meant to update (for example, it's exempt from duplicate detection), so
		// they can't be submitted for any other level
		if (upload.updateId !== levelId) {
			res.status(400).send("400\nThis upload wasn't made to update this level.");
			return;
		}

		// A changelog describing the new version is mandatory
		if (!q.remarks[0]?.trim()) {
			res.status(400).send("400\nA changelog describing the changes in the new version is required.");
			return;
		}

		let packsAllowed = await checkPackPermissions(q.addToPacks, res, doc);
		if (!packsAllowed) return;

		const { docs } = await upload.submit(doc, q, levelId);

		// Clear IP timeouts so the download count can increase again for the new version
		for (let [key] of ipTimeouts) {
			if (key.endsWith('level' + levelId)) ipTimeouts.delete(key);
		}

		res.send({ status: 'success', version: (docs[0].previousVersions?.length ?? 0) + 1, levelIds: [levelId] });
	});

	// Meaning upload (noun) image. Is used to get an image preview of a level currently pending submission but not yet submitted.
	app.get('/api/level/upload-image', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (typeof req.query.uploadId !== 'string') {
			res.status(400).end();
			return;
		}

		let upload = getOwnUpload(req.query.uploadId, res, doc);
		if (!upload) return;

		let missionId = Number(req.query.missionId);
		let group = upload.groups[missionId];
		if (!group) {
			res.status(400).end();
			return;
		}

		let buffer = await group.thumbnailFile.async('nodebuffer');

		res.removeHeader('Cache-Control');
		await compressAndSendImage(group.thumbnailFile.name, req, res, { width: 640, height: 480 }, buffer);
	});

	// Edit a previously submitted level (mission info and remarks)
	app.patch('/api/level/:levelId/edit', async (req, res) => {
		let { doc: accountDoc } = await authorize(req);
		if (!accountDoc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(accountDoc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let json = validate(editLevelSchema, req.body, res);
		if (!json) return;

		let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;

		// Make sure the person editing has permission to do so
		if (missionDoc.addedBy !== accountDoc._id && !accountDoc.moderator) {
			res.status(403).end();
			return;
		}

		if (json.missionInfo) {
			let mission = Mission.fromDoc(missionDoc);
			let applied = await mission.applyMissionInfoChanges(json.missionInfo);

			if (!applied) {
				res.status(400).end();
				return;
			}

			missionDoc = mission.createDoc();
		}

		missionDoc.remarks = json.remarks;
		missionDoc.editedAt = Date.now();
		await db.missions.updateAsync({ _id: levelId }, missionDoc);

		// Clear IP timeouts because of the edit
		for (let [key] of ipTimeouts) {
			if (key.endsWith('level' + levelId)) ipTimeouts.delete(key);
		}

		let mission = Mission.fromDoc(missionDoc);
		res.send(await mission.createExtendedLevelInfo(accountDoc._id));
	});

	// Delete a previous submitted level
	app.delete('/api/level/:levelId/delete', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;

		// Make sure the person deleting has permission to do so
		if (missionDoc.addedBy !== doc._id && !doc.moderator) {
			res.status(403).end();
			return;
		}

		await deleteSingleLevel(levelId);

		res.end();
	});

	// Add a comment to a level
	app.post('/api/level/:levelId/comment', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let q = validate(commentSchema, req.body, res);
		if (!q) return;

		if (!rateLimitRequest(res, `comment:account:${doc._id}`, 30, 10 * MINUTE)) return;

		let id = keyValue.get('commentId');
		keyValue.set('commentId', id + 1);

		let comment: CommentDoc = {
			_id: id,
			for: levelId,
			forType: 'level',
			author: doc._id,
			time: Date.now(),
			content: q.content
		};
		await db.comments.insertAsync(comment);

		// Respond with a list of all comments for that level
		res.send(await getCommentInfosForLevel(levelId));
	});

	// Mark the level as loved
	app.patch('/api/level/:levelId/love', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let lovedBy = missionDoc.lovedBy ?? [];

		if (!lovedBy.includes(doc._id)) lovedBy.push(doc._id);

		missionDoc.lovedBy = lovedBy;
		await db.missions.updateAsync({ _id: levelId }, missionDoc);

		res.end();
	});

	// Unmark the level as loved
	app.patch('/api/level/:levelId/unlove', async (req, res) => {
		let { doc } = await authorize(req);
		if (!doc) {
			res.status(401).send("401\nInvalid token.");
			return;
		}

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let lovedBy = missionDoc.lovedBy ?? [];

		if (lovedBy.includes(doc._id)) lovedBy.splice(lovedBy.indexOf(doc._id), 1);

		missionDoc.lovedBy = lovedBy;
		await db.missions.updateAsync({ _id: levelId }, missionDoc);

		res.end();
	});

	// Fetches the specified leaderboards for the level
	app.get('/api/level/:levelId/leaderboards/:leaderboardId', async (req, res) => {
		let levelId = await verifyLevelId(req, res);
		if (levelId === null) return;

		let doc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
		let mission = Mission.fromDoc(doc);

		let leaderboardId = req.params.leaderboardId;
		let lbQueryInfo = config.leaderboardSources.filter(x => x.datablockCompatibilities.includes(mission.datablockCompatibility) && ((mission.hasCustomCode && x.customCodeAllowed) || !mission.hasCustomCode));
		let query = lbQueryInfo.find(x => x.id === leaderboardId);
		if (query === undefined) {
			res.status(400).send("400\nLevel does not contain the specified leaderboard.");
			return null;
		}

		let json: any;

		try {
			json = await fetch(query.queryUrl.replace('{id}', levelId.toString())).then(x => x.json());
		} catch (e) {
			res.status(502).send("502\nLeaderboard endpoint response failed.");
			return null;
		}

		try {
			let respParsed = lbEndpointResponseSchema.parse(json);
			respParsed.scores.sort((a, b) => a.placement - b.placement); // Sort the scores in place anyway, make sure we always return sorted
			res.send(respParsed); // Just send it as it is, it's validated
		} catch (e) {
			res.status(502).send("502\nEndpoint schema did not return in the expected format.");
			return null;
		}
	});

	app.post('/api/level/:levelId/curate-vote', async (req, res) => {
        let { doc } = await authorize(req);
        if (!doc || !doc.curator) {
            res.status(403).send("403\nForbidden.");
            return;
        }

		if (isSuspended(doc)) {
			res.status(403).send("403\nAccount is suspended.");
			return;
		}

        let levelId = await verifyLevelId(req, res);
        if (levelId === null) return;

		let q = validate(curateVoteSchema, req.body, res);
		if (!q) return;

        let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;

		if(doc._id == missionDoc.addedBy) {
			res.status(403).send("403\nCan't vote on your own level.");
			return;
		}

		let mission = Mission.fromDoc(missionDoc);
		mission.setVote(doc._id, q.vote);
        await db.missions.updateAsync({ _id: levelId }, mission.createDoc());

        res.send({ success: true });
    });
};

export const incrementLevelDownloads = (doc: MissionDoc, req: express.Request) => {
	// Increment download count but prevent spamming
	return executeWithIpTimeout(req, 'level' + doc._id, async () => {
		doc.downloads = (doc.downloads ?? 0) + 1;
		await db.missions.updateAsync({ _id: doc._id }, doc);
	});
};

/** Deletes a single level and handles all cleanup (removing from packs, deleting comments, etc.) */
export const deleteSingleLevel = async (levelId: number) => {
	let missionDoc = await db.missions.findOneAsync({ _id: levelId }) as MissionDoc;
	if (!missionDoc) return;

	await db.missions.removeAsync({ _id: levelId }, {});

	// Remove the level from all packs that contained it
	let packDocs = await db.packs.findAsync({ levels: levelId }) as PackDoc[];
	for (let packDoc of packDocs) {
		packDoc.levels = packDoc.levels.filter(x => x !== levelId);
		await db.packs.updateAsync({ _id: packDoc._id }, packDoc);
		createPackThumbnail(packDoc);
	}

	// Delete all comments for this level
	await db.comments.removeAsync({ forType: 'level', for: levelId }, { multi: true });

	// Collect all directories to potentially delete
	let directoriesToCheck = new Set<string>();

	// Current version directory
	if (missionDoc.baseDirectory) {
		directoriesToCheck.add(missionDoc.baseDirectory);
	}

	// Previous versions' directories
	if (missionDoc.previousVersions) {
		for (let version of missionDoc.previousVersions) {
			directoriesToCheck.add(version.baseDirectory);
		}
	}

	// Check each directory before deleting
	for (let dir of directoriesToCheck) {
		// Check if any OTHER mission still uses this directory
		let stillUsed = await db.missions.findOneAsync({
			$or: [ { baseDirectory: dir }, { "previousVersions.baseDirectory": dir } ]
		});

		if (!stillUsed) {
			await fs.rm(dir, {
				recursive: true,
				force: true
			});
		}
	}
};