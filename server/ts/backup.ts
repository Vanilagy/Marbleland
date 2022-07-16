import { db, config } from "./globals";
import fs from 'fs-extra';
import path from 'path';
import childProcess from 'child_process';
import { MissionDoc } from "./mission";
import { PackDoc } from "./pack";

export const initBackup = () => {
	setInterval(doBackup, config.backupPeriod * 1000);
	setTimeout(doBackup, 2000); // Chill a lil' before starting it
};

/** Backs up the most vital data (levels and some databases) to a remote git repository. This step may very well take many minutes to complete. That's what one's gotta do for the greater good, I guess.*/
const doBackup = async () => {
	console.info("Starting repository backup routine...");

	try {
		// Create a new, empty repository if necessary
		if (!(await fs.pathExists(path.join(config.backupRepositoryPath, '.git')))) {
			await execShellCommand('git init', config.backupRepositoryPath);
		}

		console.info("Writing...");

		try {
			// Check if rsync exists
			await execShellCommand('rsync --version', config.backupRepositoryPath);

			console.log("Copying using rsync...");

			await execShellCommand(`rsync -avu --delete "${path.join(__dirname, 'storage/levels')}/" "${path.join(config.backupRepositoryPath, 'levels')}"`, config.backupRepositoryPath);
		} catch (e) {
			console.log("Copying manually...");
			// Delete the old level backup
			await fs.remove(path.join(config.backupRepositoryPath, 'levels'));
			// Copy over all the levels
			await fs.copy(path.join(__dirname, 'storage/levels'), path.join(config.backupRepositoryPath, 'levels'));
		}

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
		
		console.info("Write done.");

		// We need to split the changes into multiple commits because there is often a limit on how large a single push can be.
		const maxAllowedIterations = 64;
		for (let i = 0; i < maxAllowedIterations; i++) {
			// See which files have changed
			let output = await execShellCommand('git status --porcelain -u', config.backupRepositoryPath);
			let lines = output.split('\n').map(x => x.trimEnd()).filter(Boolean);
			let toAdd: string[] = [];
			let totalBytes = 0;
	
			// Collect a list of files to add to the repository while staying below a max size limit
			for (let line of lines) {
				try {
					let filePath = line.slice(3);
					let stats = await fs.stat(path.join(config.backupRepositoryPath, filePath));
					totalBytes += stats.size;
	
					if (totalBytes <= config.backupPushSizeLimit) toAdd.push(filePath);
					else break;
				} catch (e) {
					// Probably shouldn't reach this but lez be safe
					continue;
				}
			}

			if (toAdd.length === 0) {
				console.info("No files left to add.");
				break;
			};

			// Since shell commands have a length limit, split the 'git add'ing into multiple commands
			let commands = toAdd.reduce((arr, file) => {
				let last = arr[arr.length - 1];
				if (last.length > 4000) {
					last = '';
					arr.push(last);
				}

				last += `"${file}" `;
				arr[arr.length - 1] = last;

				return arr;
			}, ['']);

			console.info(`Adding ${toAdd.length} files to repository...`);

			for (let command of commands) {
				await execShellCommand(`git add ${command}`, config.backupRepositoryPath);
			}

			console.info("Added.");
	
			// This boy can fail when there are no changes. We want that, empty commits are weird.
			try {
				// Commit that thing
				await execShellCommand('git commit -m "Automated commit"', config.backupRepositoryPath);
			} catch (e) {}
	
			// Push to the remote specified. The remote path should include authorization if necessary.
			console.info(`Pushing...`);
			await execShellCommand(`git push ${config.backupRepositoryRemote} --all`, config.backupRepositoryPath);
			console.info(`Pushed.`);
		}
	} catch (e) {
		console.error("Error during repository backup:");
		console.error(e);
	}

	console.info("Repository backup routine ended.");
};

const execShellCommand = (cmd: string, cwd: string) => {
	return new Promise<string>((resolve, reject) => {
		childProcess.exec(cmd, { cwd, maxBuffer: 1024**3 }, (error, stdout, stderr) => {
			if (error) reject(error);
			resolve(stdout? stdout : stderr);
		});
	});
};