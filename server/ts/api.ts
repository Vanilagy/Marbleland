import { Mission, MissionDoc } from "./mission";
import { db, keyValue } from "./globals";
import * as path from 'path';
import * as fs from 'fs-extra';
import { app } from "./server";
import * as express from 'express';
import { CommentInfo, LevelInfo, PackInfo } from "../../shared/types";
import * as sharp from 'sharp';
import { AccountDoc, authorize, generateNewAccessToken, getExtendedProfileInfo, getSignInInfo } from "./account";
import * as bcrypt from 'bcryptjs';
import JSZip, * as jszip from 'jszip';
import { MissionUpload, ongoingUploads } from "./mission_upload";
import { createPackThumbnail, getExtendedPackInfo, getPackInfo, getPackThumbnailPath, PackDoc } from "./pack";
import { CommentDoc, getCommentInfo, getCommentInfosForLevel } from "./comment";

app.use(express.raw({
	limit: '15mb'
}));
app.use(express.json());
app.use(express.text());

const verifyLevelId = async (req: express.Request, res: express.Response) => {
	let levelId = Number(req.params.levelId);
	if (!Number.isInteger(levelId)) {
		res.status(400).send("400\nLevel ID has to be an integer.");
		return null;
	}

	let doc = await db.missions.findOne({ _id: levelId });
	if (!doc) {
		res.status(404).send("404\nA level with this ID does not exist.");
		return null;
	}

	return levelId;
};

app.get('/api/level/list', async (req, res) => {
	let docs = await db.missions.find({}) as MissionDoc[];
	let response: LevelInfo[] = [];

	for (let doc of docs) {
		let mission = Mission.fromDoc(doc);
		response.push(mission.createLevelInfo());
	}

	res.send(response);
});

app.get('/api/level/:levelId/zip', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let assuming = req.query.assuming as string;
	if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

	let zip = await mission.createZip(assuming as ('none' | 'gold' | 'platinumquest'));
	let stream = zip.generateNodeStream();

	res.set('Content-Type', 'application/zip');
	res.set('Content-Disposition', `attachment; filename="level-${doc._id}.zip"`);
	stream.pipe(res);
});

const compressAndSendImage = async (imagePath: string, req: express.Request, res: express.Response, defaultDimensions: {width: number, height: number}) => {
	let buffer = await fs.readFile(imagePath);

	if ('original' in req.query) {
		res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
		res.send(buffer);
		return;
	}

	if (req.query.width && req.query.height) {
		let width = Number(req.query.width);
		let height = Number(req.query.height);
		let valid = true;

		if (!Number.isInteger(width) || !Number.isInteger(height)) valid = false;
		if (width < 1 || height < 1) valid = false;
		if (width > 2048 || height > 2048) valid = false;

		if (!valid) {
			res.status(400).send("400\nQuery parameters invalid.");
			return;
		}

		let resized = await sharp(buffer).resize({width, height, fit: 'cover'}).jpeg({quality: 60}).toBuffer();
		res.set('Content-Type', 'image/jpeg');
		res.send(resized);

		return;
	}
	
	// Default
	let resized = await sharp(buffer).resize({width: defaultDimensions.width, height: defaultDimensions.height, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 60}).toBuffer();
	res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
	res.send(resized);
};

app.get('/api/level/:levelId/image', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let imagePath = mission.getImagePath();
	if (!imagePath) {
		res.status(404).send("This level is missing an image thumbnail.");
		return;
	}

	await compressAndSendImage(path.join(mission.baseDirectory, imagePath), req, res, { width: 640, height: 480 });
});

app.get('/api/level/:levelId/dependencies', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	let assuming = req.query.assuming as string;
	if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

	let normalizedDependencies = mission.getNormalizedDependencies(assuming as ('none' | 'gold' | 'platinumquest'));

	res.send(normalizedDependencies);
});

app.get('/api/level/:levelId/info', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	res.send(mission.createLevelInfo());
});

app.get('/api/level/:levelId/extended-info', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	res.send(await mission.createExtendedLevelInfo());
});

app.get('/api/level/:levelId/mission-info', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
	let mission = Mission.fromDoc(doc);

	res.send(mission.info);
});

app.get('/api/level/:levelId/packs', async (req, res) => {
	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let doc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
	let packDocs = await db.packs.find({ levels: doc._id }) as PackDoc[];
	let packInfos: PackInfo[] = [];
	for (let packDoc of packDocs) {
		packInfos.push(await getPackInfo(packDoc));
	}

	res.send(packInfos);
});

app.post('/api/level/:levelId/edit', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	if (req.body.remarks !== null && typeof req.body.remarks !== 'string') {
		res.status(400).end();
		return;
	}

	let missionDoc = await db.missions.findOne({ _id: levelId }) as MissionDoc;

	if (missionDoc.addedBy !== doc._id) {
		res.status(403).end();
		return;
	}

	missionDoc.remarks = req.body.remarks;
	await db.missions.update({ _id: levelId }, missionDoc);

	res.end();
});

app.delete('/api/level/:levelId/delete', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	let missionDoc = await db.missions.findOne({ _id: levelId }) as MissionDoc;

	if (missionDoc.addedBy !== doc._id) {
		res.status(403).end();
		return;
	}

	await db.missions.remove({ _id: levelId }, {});

	// Remove the level from all packs that contained it
	let packDocs = await db.packs.find({ levels: levelId }) as PackDoc[];
	for (let packDoc of packDocs) {
		packDoc.levels = packDoc.levels.filter(x => x !== levelId);
		await db.packs.update({ _id: packDoc._id }, packDoc);
		createPackThumbnail(packDoc);
	}

	res.end();
});

app.post('/api/level/:levelId/comment', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let levelId = await verifyLevelId(req, res);
	if (levelId === null) return;

	if (typeof req.body.content !== 'string' || !req.body.content.trim()) {
		res.status(400).end();
		return;
	}

	let id = keyValue.get('commentId');
	keyValue.set('commentId', id + 1);

	let comment: CommentDoc = {
		_id: id,
		for: levelId,
		forType: 'level',
		author: doc._id,
		time: Date.now(),
		content: req.body.content
	};
	await db.comments.insert(comment);

	res.send(await getCommentInfosForLevel(levelId));
});

app.post('/api/comment/:commentId/delete', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let commentDoc = await db.comments.findOne({ _id: Number(req.params.commentId) }) as CommentDoc;
	if (!commentDoc) {
		res.status(400).end();
		return;
	}

	if (commentDoc.author !== doc._id) {
		res.status(403).end();
		return;
	}

	await db.comments.remove({ _id: commentDoc._id }, {});

	// NOTE! Adjust this for when there's gonna be comment for more than just levels.
	res.send(await getCommentInfosForLevel(commentDoc.for));
});

const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

app.get('/api/account/register', async (req, res) => {
	let q = req.query as {email: string, username: string, password: string};
	if (!q.email || !q.username || !q.password) {
		res.status(400).send({ status: 'error', reason: "Missing parameters" });
		return;
	}

	q.email = q.email.trim();
	q.username = q.username.trim();

	if (!emailRegEx.test(q.email)) {
		res.status(400).send({ status: 'error', reason: "Invalid email." });
		return;
	}

	let existing: AccountDoc;

	existing = await db.accounts.findOne({ email: q.email });
	if (existing) {
		res.status(400).send({ status: 'error', reason: "Email already in use." });
		return;
	}

	existing = await db.accounts.findOne({ username: q.username });
	if (existing) {
		res.status(400).send({ status: 'error', reason: "Username already in use." });
		return;
	}
	
	if (q.username.length < 2) {
		res.status(400).send({ status: 'error', reason: 'Username too short.' });
		return;
	}

	if (q.password.length < 8) {
		res.status(400).send({ status: 'error', reason: "Password too short." });
		return;
	}

	let hash = await bcrypt.hash(q.password, 8);
	let id = keyValue.get('accountId');
	keyValue.set('accountId', id + 1);

	let doc: AccountDoc = {
		_id: id,
		email: q.email,
		username: q.username,
		passwordHash: hash,
		created: Date.now(),
		tokens: [],
		bio: ''
	};

	let newToken = generateNewAccessToken();
	doc.tokens.push({
		value: newToken,
		lastUsed: Date.now()
	});

	await db.accounts.insert(doc);

	res.status(200).send({ status: 'success', token: newToken, signInInfo: await getSignInInfo(doc) });
});

app.get('/api/account/check-token', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	res.send(await getSignInInfo(doc));
});

app.get('/api/account/sign-in', async (req, res) => {
	let doc = await db.accounts.findOne({ $or: [{ email: req.query.email_or_username }, { username: req.query.email_or_username }] }) as AccountDoc;
	if (!doc) {
		res.status(400).send({
			status: 'error',
			reason: 'An account with this email or username does not exist.'
		});
		return;
	}

	let pwMatches = await bcrypt.compare((req.query.password as string) ?? '', doc.passwordHash);
	if (!pwMatches) {
		res.status(400).send({
			status: 'error',
			reason: 'Incorrect password.'
		});
		return;
	}

	let newToken = generateNewAccessToken();
	doc.tokens.push({
		value: newToken,
		lastUsed: Date.now()
	});

	await db.accounts.update({ _id: doc._id }, { $set: { tokens: doc.tokens} });

	res.status(200).send({ status: 'success', token: newToken, signInInfo: await getSignInInfo(doc) });
});

app.get('/api/account/sign-out', async (req, res) => {
	if (!req.query.token) {
		res.status(400);
		return;
	}

	let doc = await db.accounts.findOne({ 'tokens.value': req.query.token }) as AccountDoc;
	if (doc) {
		doc.tokens = doc.tokens.filter(x => x.value !== req.query.token);
		await db.accounts.update({ _id: doc._id }, { $set: { tokens: doc.tokens} });
	}
	
	res.end();
});

app.get('/api/account/:accountId/info', async (req, res) => {
	let doc = await db.accounts.findOne({ _id: Number(req.params.accountId) }) as AccountDoc;
	if (!doc) {
		res.status(404).send("404\nAn account with this ID does not exist.");
		return;
	}

	res.send(await getExtendedProfileInfo(doc));
});

app.get('/api/account/:accountId/avatar', async (req, res) => {
	let avatarPath = path.join(__dirname, `storage/avatars/${req.params.accountId}.jpg`);
	let exists = await fs.pathExists(avatarPath);

	res.set('Cache-Control', 'no-cache, no-store');

	if (!exists) {
		let stream = fs.createReadStream(path.join(__dirname, 'data/assets/avatar_default.png'));
		res.set('Content-Type', 'image/jpeg');
		stream.pipe(res);
		return;
	}

	let buffer = await fs.readFile(avatarPath);

	if (req.query.size) {
		let size = Number(req.query.size);
		if (!Number.isInteger(size) || size < 1 || size > 1024) {
			res.status(400).end();
			return;
		}

		let resized = await sharp(buffer).resize({ width: size, height: size }).jpeg({ quality: 80 }).toBuffer();
		res.set('Content-Type', 'image/jpeg');
		res.send(resized);
		return;
	}

	res.set('Content-Type', 'image/jpeg');
	res.send(buffer);
});

app.post('/api/account/:accountId/set-avatar', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	if (doc._id !== Number(req.params.accountId)) {
		res.status(403).end();
		return;
	}

	let normed = await sharp(req.body).resize({ width: 1024, height: 1024, fit: 'cover', withoutEnlargement: true }).jpeg({ quality: 100 }).toBuffer();
	await fs.writeFile(path.join(__dirname, `storage/avatars/${doc._id}.jpg`), normed);

	res.end();
});

app.post('/api/account/:accountId/set-bio', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	if (doc._id !== Number(req.params.accountId)) {
		res.status(403).end();
		return;
	}

	doc.bio = req.body.toString();
	await db.accounts.update({ _id: doc._id }, doc);

	res.end();
});

app.post('/api/level/upload', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let problems: string[] = [];
	let zip: jszip;
	let upload: MissionUpload;

	try {
		zip = await jszip.loadAsync(req.body);
	} catch (e) {
		problems.push("The uploaded file couldn't be unzipped.");
	}

	if (zip) {
		try {
			upload = new MissionUpload(zip);
			await upload.process();
			problems.push(...upload.problems);
		} catch (e) {
			problems.push("An error occurred during processing.");
		}
	}

	if (problems.length > 0) {
		res.status(400).send({
			status: 'error',
			problems: problems
		});
	} else {
		ongoingUploads.set(upload.id, upload);

		res.send({
			status: 'success',
			uploadId: upload.id
		});
	}
});

app.post('/api/level/submit', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let upload = ongoingUploads.get(req.body.uploadId);
	if (!upload) {
		res.status(400).end();
		return;
	}

	let missionDoc = await upload.submit(doc._id, req.body.remarks);

	res.send({
		levelId: missionDoc._id
	});
});

app.post('/api/pack/create', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	if (!req.body.name || !req.body.description) {
		res.status(401).end();
		return;
	}

	let id = keyValue.get('packId');
	keyValue.set('packId', id + 1);

	let packDoc: PackDoc = {
		_id: id,
		name: req.body.name,
		description: req.body.description,
		createdAt: Date.now(),
		createdBy: doc._id,
		levels: []
	};
	await db.packs.insert(packDoc);

	res.send({ packId: id });
});

app.get('/api/pack/list', async (req, res) => {
	let packDocs = await db.packs.find({}) as PackDoc[];
	let packInfos: PackInfo[] = [];

	for (let doc of packDocs) {
		packInfos.push(await getPackInfo(doc));
	}

	res.send(packInfos);
});

app.get('/api/pack/:packId/info', async (req, res) => {
	let doc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
	if (!doc) {
		res.status(404).send("404\nNo pack exists with this ID.");
		return;
	}

	let packInfo = await getExtendedPackInfo(doc);
	res.send(packInfo);
});

app.get('/api/pack/:packId/zip', async (req, res) => {
	let doc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
	if (!doc) {
		res.status(404).send("No pack exists with this ID.");
		return;
	}

	let assuming = req.query.assuming as string;
	if (!['none', 'gold', 'platinumquest'].includes(assuming)) assuming = 'platinumquest';

	let zip = new JSZip();

	for (let levelId of doc.levels) {
		let missionDoc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
		if (!missionDoc) continue;

		let mission = Mission.fromDoc(missionDoc);
		await mission.addToZip(zip, assuming as ('none' | 'gold' | 'platinumquest'));
	}

	let stream = zip.generateNodeStream();

	res.set('Content-Type', 'application/zip');
	res.set('Content-Disposition', `attachment; filename="pack-${doc._id}.zip"`);
	stream.pipe(res);
});

app.post('/api/pack/:packId/set-levels', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
	if (!packDoc) {
		res.status(400).end();
		return;
	}

	if (packDoc.createdBy !== doc._id) {
		res.status(403).end();
		return;
	}

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

	await createPackThumbnail(packDoc);
});

app.get('/api/pack/:packId/image', async (req, res) => {
	let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
	if (!packDoc) {
		res.status(400).end();
		return;
	}

	let imagePath = getPackThumbnailPath(packDoc);
	let exists = await fs.pathExists(imagePath);
	if (!exists) await createPackThumbnail(packDoc);

	res.set('Cache-Control', 'no-cache, no-store'); // Could change any time
	await compressAndSendImage(imagePath, req, res, { width: 512, height: 512 });
});

app.post('/api/pack/:packId/edit', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
	if (!packDoc) {
		res.status(400).end();
		return;
	}

	if (packDoc.createdBy !== doc._id) {
		res.status(403).end();
		return;
	}

	if (!req.body.name || !req.body.description) {
		res.status(401).end();
		return;
	}

	packDoc.name = req.body.name;
	packDoc.description = req.body.description;
	await db.packs.update({ _id: packDoc._id }, packDoc);

	res.end();
});

app.delete('/api/pack/:packId/delete', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	let packDoc = await db.packs.findOne({ _id: Number(req.params.packId) }) as PackDoc;
	if (!packDoc) {
		res.status(400).end();
		return;
	}

	if (packDoc.createdBy !== doc._id) {
		res.status(403).end();
		return;
	}

	await db.packs.remove({ _id: packDoc._id }, {});

	try {
		await fs.unlink(getPackThumbnailPath(packDoc)); // Delete the pack thumbnail
	} catch {}

	res.end();
});