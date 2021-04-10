import { Mission, MissionDoc } from "./mission";
import { db, keyValue } from "./globals";
import * as path from 'path';
import * as fs from 'fs-extra';
import { app } from "./server";
import * as express from 'express';
import { LevelInfo, ProfileInfo } from "../../shared/types";
import * as sharp from 'sharp';
import { AccountDoc, authorize, generateNewAccessToken, getProfileInfo, TOKEN_TTL } from "./account";
import * as bcrypt from 'bcryptjs';
import * as jszip from 'jszip';
import { MissionUpload, ongoingUploads } from "./mission_upload";

app.use(express.raw({
	limit: '15mb'
}));
app.use(express.json());

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
	res.set('Content-Disposition', `attachment; filename="${doc._id}.zip"`);
	stream.pipe(res);
});

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

	let buffer = await fs.readFile(path.join(mission.baseDirectory, imagePath));

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
	let resized = await sharp(buffer).resize({width: 640, height: 480, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 60}).toBuffer();
	res.set('Content-Type', imagePath.endsWith('.png')? 'image/png' : 'image/jpeg');
	res.send(resized);
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

app.get('/api/list', async (req, res) => {
	let docs = await db.missions.find({}) as MissionDoc[];
	let response: LevelInfo[] = [];

	for (let doc of docs) {
		let mission = Mission.fromDoc(doc);
		response.push(mission.createLevelInfo());
	}

	res.send(response);
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
		tokens: []
	};

	let newToken = generateNewAccessToken();
	doc.tokens.push({
		value: newToken,
		lastUsed: Date.now()
	});

	await db.accounts.insert(doc);

	res.status(200).send({ status: 'success', token: newToken, profileInfo: await getProfileInfo(doc) });
});

app.get('/api/account/check-token', async (req, res) => {
	let doc = await authorize(req);
	if (!doc) {
		res.status(401).send("401\nInvalid token.");
		return;
	}

	res.send({
		profileInfo: await getProfileInfo(doc)
	});
});

app.get('/api/account/sign-in', async (req, res) => {
	let doc = await db.accounts.findOne({ email: req.query.email }) as AccountDoc;
	if (!doc) {
		res.status(400).send({
			status: 'error',
			reason: 'An account with this email does not exist.'
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

	res.status(200).send({ status: 'success', token: newToken, profileInfo: await getProfileInfo(doc) });
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

	res.send(await getProfileInfo(doc));
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
		res.status(400).end();
		return;
	}

	let normed = await sharp(req.body).resize({ width: 1024, height: 1024, fit: 'cover', withoutEnlargement: true }).jpeg({ quality: 100 }).toBuffer();
	await fs.writeFile(path.join(__dirname, `storage/avatars/${doc._id}.jpg`), normed);

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