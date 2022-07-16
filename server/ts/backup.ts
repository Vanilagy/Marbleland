import { db, config } from "./globals";
import fs, { stat } from 'fs-extra';
import path from 'path';
import childProcess from 'child_process';
import { MissionDoc } from "./mission";
import { PackDoc } from "./pack";

export const initBackup = () => {
	setInterval(doBackup, config.backupPeriod * 1000);
	doBackup();
};

/** Backs up the most vital data (levels and some databases) to a remote git repository. This step may very well take many minutes to complete. That's what one's gotta do for the greater good, I guess.*/
const doBackup = async () => {
	console.info("Starting repository backup...");

	try {
		// Create a new, empty repository if necessary
		if (!(await fs.pathExists(path.join(config.backupRepositoryPath, '.git')))) {
			await execShellCommand('git init', config.backupRepositoryPath);
		}

		console.info("Copying...");

		// Delete the old level backup
		await fs.remove(path.join(config.backupRepositoryPath, 'levels'));
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
		
		console.info("Copy done.");

		const maxAllowedIterations = 64;
		for (let i = 0; i < maxAllowedIterations; i++) {
			let output = await execShellCommand('git status --porcelain -u', config.backupRepositoryPath);
			let lines = output.split('\n').map(x => x.trim()).filter(Boolean);
			let toAdd: string[] = [];
			let totalBytes = 0;
			const allowed = 2**31; // 2 GB
	
			for (let line of lines) {
				try {
					let filePath = line.slice(3);
					let stats = await fs.stat(path.join(config.backupRepositoryPath, filePath));
					totalBytes += stats.size;
	
					if (totalBytes <= allowed) toAdd.push(filePath);
					else break;
				} catch (e) {
					// Probably shouldn't reach this but lez be safe
					continue;
				}
			}

			if (toAdd.length === 0) break;

			console.log(toAdd.length);
			//console.log(toAdd);
	
			// Stage all changed or added files
			//await execShellCommand(`git add ${toAdd.map(x => '"' + x + '"').join(' ')}`, config.backupRepositoryPath);
			//await execShellCommand(toAdd.map(x => `git add "${x}"`).join(' && '), config.backupRepositoryPath);
			//console.info(`Added ${toAdd.length} files to backup repository.`);

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

			let promises = commands.map(x => execShellCommand(`git add ${x}`, config.backupRepositoryPath));
			await Promise.all(promises);

			/*
			for (let command of commands) {
				await execShellCommand(`git add ${command}`, config.backupRepositoryPath);
			}
			*/

			// let promises = toAdd.map(x => execShellCommand(`git add "${x}"`, config.backupRepositoryPath));
			// await Promise.allSettled(promises);
			/*
			for (let [index, file] of toAdd.entries()) {
				let promises: Promise<string>[] = [];
				for 
				try {
					await execShellCommand(`git add "${file}"`, config.backupRepositoryPath);
					console.log(index);
				} catch (e) {
					console.log(file);
					console.error(e);
					return;
				}
			}
			*/
			console.log("no way")

			break;
	
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