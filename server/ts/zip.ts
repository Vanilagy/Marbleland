import { structureMBGSet, structurePQSet } from "./globals";
import { Mission } from "./mission";
import jszip from 'jszip';
import * as fs from 'fs-extra';
import { Readable } from 'stream';
import express from 'express';

/** Generates chunks of the zip over time. */
export async function* generateZip(missions: Mission[], assuming: 'none' | 'gold' | 'platinumquest', appendIdToMis: boolean) {
	let centralDirectories: Uint8Array[] = [];
	let centralDirectorySizeTotal = 0;
	let mainPartLength = 0;
	let includedFiles = new Set<string>();

	// We go through the missions in reverse to emulate the "files added late replace files added early" behavior.
	for (let mission of missions.slice().reverse()) {
		let zip = new jszip();

		for (let dependency of mission.dependencies) {
			// Skip default assets
			let normalized = mission.normalizeDependency(dependency, false);
			if (includedFiles.has(normalized)) continue;
			if (assuming === 'gold' && structureMBGSet.has(normalized.toLowerCase())) continue;
			if (assuming === 'platinumquest' && structurePQSet.has(normalized.toLowerCase())) continue;

			let fullPath = await mission.findPath(dependency);
			if (fullPath) {
				normalized = mission.normalizeDependency(dependency, appendIdToMis); // Refine it

				// Open up a read stream and add it to the zip
				let stream = fs.createReadStream(fullPath);
				zip.file(normalized, stream);
				includedFiles.add(normalized);

				console.log("Did: " + dependency, fullPath);
			} else {
				console.log("Didn't: " + dependency);
			}
		}

		// Remove all directory entries
		for (let fileName in zip.files) {
			if (zip.files[fileName].dir) delete zip.files[fileName];
		}

		// Generate a zip just for this very level
		let generated = await zip.generateAsync({ type: 'uint8array' });
		let dataView = new DataView(generated.buffer);

		for (let i = generated.byteLength - 4; i >= 0; i--) {
			// Find the end of central directory record to then jump to the start of the central directory record
			let matchesMagic = dataView.getUint32(i, false) === 0x504b0506;
			if (matchesMagic) {
				let startOfCentralDirectoryOffset = dataView.getUint32(i + 16, true);

				let mainPart = generated.slice(0, startOfCentralDirectoryOffset);
				yield mainPart.buffer; // Push all the file entires without the central directory (will be pushed later)

				console.log("did1");

				let centralDirectory = generated.slice(startOfCentralDirectoryOffset, i);
				centralDirectories.push(centralDirectory);
				centralDirectorySizeTotal += centralDirectory.byteLength;

				// Fix the offset local header values in the central directory file entries
				let localView = new DataView(centralDirectory.buffer);
				let index = 0;
				while (index < centralDirectory.byteLength) {
					let offsetLocalHeader = localView.getUint32(index + 0x2a, true);
					offsetLocalHeader += mainPartLength;
					localView.setUint32(index + 0x2a, offsetLocalHeader, true);
	
					let fileNameLen = localView.getUint16(index + 0x1c, true);
					let extraFieldLen = localView.getUint16(index + 0x1e, true);
					let fileCommentLen = localView.getUint16(index + 0x20, true);
	
					index += 0x2e + fileNameLen + extraFieldLen + fileCommentLen;
				}

				mainPartLength += mainPart.byteLength;
				break;
			}
		}
	}

	// Push out all the central directories
	for (let centralDirectory of centralDirectories) {
		yield centralDirectory.buffer;
		console.log("did2");
	}

	// At last, we need to generate the end of central directory record
	let endBuffer = new ArrayBuffer(22);
	let endView = new DataView(endBuffer);

	endView.setUint32(0, 0x504b0506, false); // Magic number
	endView.setUint16(4, 0, true);
	endView.setUint16(6, 0, true);
	endView.setUint16(8, includedFiles.size, true);
	endView.setUint16(10, includedFiles.size, true);
	endView.setUint32(12, centralDirectorySizeTotal, true);
	endView.setUint32(16, mainPartLength, true);
	endView.setUint16(20, 0, true);

	yield endBuffer;

	console.log("did3");
}

/** A readable stream for efficient generation and streaming of .zip files with missions in them. */
export class MissionZipStream extends Readable {
	missions: Mission[];
	assuming: 'none' | 'gold' | 'platinumquest';
	appendIdToMis: boolean;
	generator: AsyncGenerator<ArrayBufferLike, void, unknown>;
	expectedSize: number;

	constructor(missions: Mission[], assuming: 'none' | 'gold' | 'platinumquest', appendIdToMis: boolean) {
		super();

		//missions = missions.filter(x => x.fileSizes); // Kick the shitty ones
		this.missions = missions;
		this.assuming = assuming;
		this.appendIdToMis = appendIdToMis;
	}

	async init() {
		this.generator = generateZip(this.missions, this.assuming, this.appendIdToMis);

		// Precompute the final total size of the zip

		let includedFiles = new Set<string>();
		let totalSize = 0;

		for (let i = this.missions.length - 1; i >= 0; i--) {
			let mission = this.missions[i];
			let j = -1;

			for (let dependency of mission.dependencies) {
				j++;

				// Skip default assets
				let normalized = mission.normalizeDependency(dependency, false);
				if (includedFiles.has(normalized)) continue;
				if (this.assuming === 'gold' && structureMBGSet.has(normalized.toLowerCase())) continue;
				if (this.assuming === 'platinumquest' && structurePQSet.has(normalized.toLowerCase())) continue;

				let size = mission.fileSizes?.[j] ?? 0;
				totalSize += size; // Add the actual size of the file
				totalSize += 0x1e + 0x2e; // Local file header and central directory file header sizes
				totalSize += Buffer.byteLength(mission.normalizeDependency(dependency, this.appendIdToMis)) * 2; // Both headers contain the file name, so add its byte size twice

				includedFiles.add(normalized);
			}

			if (i % 100 === 0) await new Promise(resolve => setImmediate(resolve)); // To avoid blocking for too long
		}

		totalSize += 0x16; // Length of end of central directory record

		this.expectedSize = totalSize;
	}

	async _read() {
		while (true) {
			let next = await this.generator.next();
			
			if (next.done) {
				// We've streamed the entire .zip
				console.log("it said iz done bro");
				this.push(null);
				return;
			}

			let allowedMore = this.push(Buffer.from(next.value as ArrayBuffer));
			if (!allowedMore) break;
		}
	}

	async connectToResponse(res: express.Response, fileName: string) {
		await this.init();

		res.set('Content-Type', 'application/zip');
		res.set('Content-Disposition', `attachment; filename="${fileName}"`);
		//res.set('Content-Length', this.expectedSize.toString());

		this.pipe(res);
	}
}