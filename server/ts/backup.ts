import { db, config } from "./globals";
import fs from 'fs-extra';
import path from 'path';
import childProcess from 'child_process';
import { MissionDoc } from "./mission";
import { PackDoc } from "./pack";

export const initBackup = () => {
	setInterval(doBackup, config.backupPeriod * 1000);
	doBackup();	
};

/** Backs up the most vital data (levels and some databases) to a remote git repository. */
const doBackup = async () => {
	console.info("Starting repository backup...");

	// Copy over all the levels
	await fs.copy(path.join(__dirname, 'storage/levels'), path.join(config.backupRepositoryPath, 'levels'));

	// Prepare all the mission docs
	let missionDocs = await db.missions.find({}) as (MissionDoc & { lovedCount: number })[];
	missionDocs.forEach(x => {
		x.baseDirectory = x.baseDirectory.slice(x.baseDirectory.indexOf('levels'));
		x.lovedCount = (x.lovedBy ?? []).length;

		// Don't think these are necessary:
		delete x.fileSizes;
		delete x.preferPrevThumbnail;
		delete x.lovedBy;
	});
	await fs.writeFile(path.join(config.backupRepositoryPath, 'missions.json'), JSON.stringify(missionDocs, null, 4));

	// Prepare all the pack docs
	let packDocs = await db.packs.find({}) as (PackDoc & { lovedCount: number })[];
	packDocs.forEach(x => {
		x.lovedCount = (x.lovedBy ?? []).length;

		delete x.lovedBy;
	});
	await fs.writeFile(path.join(config.backupRepositoryPath, 'packs.json'), JSON.stringify(packDocs, null, 4));

	// Stage all changed or added files
	await execShellCommand('git add -A', config.backupRepositoryPath);

	// This boy can fail when there are no changes. We want that, empty commits are weird.
	try {
		// Commit that thing
		await execShellCommand('git commit -m "Automated commit"', config.backupRepositoryPath);
	} catch (e) {}

	// Push to the remote specified. The remote path should include authorization if necessary.
	await execShellCommand(`git push ${config.backupRepositoryRemote} --all`, config.backupRepositoryPath);

	console.info("Finished repository backup.");
};

const execShellCommand = (cmd: string, cwd: string) => {
	return new Promise<string>((resolve, reject) => {
		childProcess.exec(cmd, { cwd }, (error, stdout, stderr) => {
			if (error) reject(error);
			resolve(stdout? stdout : stderr);
		});
	});
};