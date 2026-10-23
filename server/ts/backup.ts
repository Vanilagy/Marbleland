import { db, config } from "./globals";
import fs from 'node:fs';
import path from 'path';
import childProcess from 'child_process';
import { MissionDoc } from "./mission";
import { PackDoc } from "./pack";
import { SERVER_DIR } from "./paths";

const MAX_COMMAND_ARGUMENTS_LENGTH = 30000;

export const initBackup = () => {
	setInterval(doBackup, config.backupPeriod * 1000);
	setTimeout(doBackup, 2000); // Chill a lil' before starting it
};

/** Backs up the most vital data (levels and some databases) to a remote git repository. This step may very well take many minutes to complete. That's what one's gotta do for the greater good, I guess.*/
const doBackup = async () => {
	console.info("Starting repository backup routine...");

	try {
		// Create a new, empty repository if necessary
		if (!fs.existsSync(path.join(config.backupRepositoryPath, '.git'))) {
			await execCommand('git', ['init'], config.backupRepositoryPath);
		}

		console.info("Writing...");

		try {
			// Check if rsync exists
			await execCommand('rsync', ['--version'], config.backupRepositoryPath);

			console.log("Copying using rsync...");

			await execCommand('rsync', ['-avu', '--delete', `${path.join(SERVER_DIR, 'storage/levels')}/`, path.join(config.backupRepositoryPath, 'levels')], config.backupRepositoryPath);
		} catch (e) {
			console.log("Copying manually...");
			// Delete the old level backup
			await fs.promises.rm(path.join(config.backupRepositoryPath, 'levels'), {
				recursive: true,
				force: true
			});
			// Copy over all the levels
			await fs.promises.cp(path.join(SERVER_DIR, 'storage/levels'), path.join(config.backupRepositoryPath, 'levels'), { recursive: true });
		}

		// Prepare all the mission docs
		let missionDocs = await db.missions.findAsync({}) as (MissionDoc & { lovedCount: number })[];
		missionDocs.forEach(x => {
			x.baseDirectory = x.baseDirectory.slice(x.baseDirectory.indexOf('levels'));
			x.lovedCount = (x.lovedBy ?? []).length;

			// Don't think these are necessary:
			delete x.fileSizes;
			delete x.preferPrevThumbnail;
			delete x.lovedBy;

			// The previous versions carry the same content fields, so give them the same treatment
			x.previousVersions?.forEach(y => {
				y.baseDirectory = y.baseDirectory.slice(y.baseDirectory.indexOf('levels'));

				delete y.fileSizes;
				delete y.preferPrevThumbnail;
			});
		});
		await fs.promises.writeFile(path.join(config.backupRepositoryPath, 'missions.json'), JSON.stringify(missionDocs, null, 4));

		// Prepare all the pack docs
		let packDocs = await db.packs.findAsync({}) as (PackDoc & { lovedCount: number })[];
		packDocs.forEach(x => {
			x.lovedCount = (x.lovedBy ?? []).length;

			delete x.lovedBy;
		});
		await fs.promises.writeFile(path.join(config.backupRepositoryPath, 'packs.json'), JSON.stringify(packDocs, null, 4));
		
		console.info("Write done.");

		// We need to split the changes into multiple commits because there is often a limit on how large a single push can be.
		const maxAllowedIterations = 64;
		for (let i = 0; i < maxAllowedIterations; i++) {
			// See which files have changed. -z gives us NUL-separated, unquoted paths, which regular
			// --porcelain doesn't: there, paths with spaces or non-ASCII get wrapped in quotes, which fucks up our logic.
			let output = await execCommand('git', ['status', '--porcelain', '-u', '-z'], config.backupRepositoryPath);
			let lines = output.split('\0').filter(Boolean);
			let toAdd: string[] = [];
			let totalBytes = 0;
	
			// Collect a list of files to add to the repository while staying below a max size limit
			for (let line of lines) {
				try {
					let filePath = line.slice(3);
					let stats = await fs.promises.stat(path.join(config.backupRepositoryPath, filePath));

					// GitHub rejects files over 100 MB, so don't even try
					if (stats.size > 100 * 1024**2) {
						console.warn(`Skipping ${filePath} (${stats.size} bytes), too large for the remote.`);
						continue;
					}

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

			// The OS caps a single command's argument length, so split the 'git add' into batches
			let batches: string[][] = [[]];
			let currentLength = 0;
			for (let file of toAdd) {
				// Each path also costs a separating space and, on Windows, possibly a pair of quotes
				let length = file.length + 3;
				if (currentLength > 0 && currentLength + length > MAX_COMMAND_ARGUMENTS_LENGTH) {
					batches.push([]);
					currentLength = 0;
				}
				batches[batches.length - 1].push(file);
				currentLength += length;
			}

			console.info(`Adding ${toAdd.length} files to repository...`);

			for (let batch of batches) {
				// The '--' makes git treat everything after it as a path
				await execCommand('git', ['add', '--', ...batch], config.backupRepositoryPath);
			}

			console.info("Added.");

			// This boy can fail when there are no changes. We want that, empty commits are weird.
			try {
				// Commit that thing
				await execCommand('git', ['commit', '-m', 'Automated commit'], config.backupRepositoryPath);
			} catch (e) {
				console.error("Error committing:", e);
			}

			// Push to the remote specified. The remote path should include authorization if necessary.
			console.info(`Pushing...`);
			await execCommand('git', ['push', config.backupRepositoryRemote, '--all'], config.backupRepositoryPath);
			console.info(`Pushed.`);
		}
	} catch (e) {
		console.error("Error during repository backup:");
		console.error(e);
	}

	console.info("Repository backup routine ended.");
};

// Runs a command with its arguments passed as an array, not a shell string, so file names and the remote can't inject commands
const execCommand = (command: string, args: string[], cwd: string) => {
	return new Promise<string>((resolve, reject) => {
		childProcess.execFile(command, args, { cwd, maxBuffer: 1024**3 }, (error, stdout, stderr) => {
			if (error) reject(error);
			resolve(stdout? stdout : stderr);
		});
	});
};