import { Mission } from "./mission";
import * as fs from 'node:fs/promises';
import * as zlib from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import express from 'express';

const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const ZIP64_EXTRA_FIELD_SIZE = 12; // Only ever holds the local header offset
const ZIP64_END_SIZE = 56 + 20; // Zip64 end of central directory record plus its locator
const END_SIZE = 22;
const UINT16_MAX = 0xffff;
const UINT32_MAX = 0xffffffff;

interface ZipEntry {
	fullPath: string,
	name: Buffer,
	size: number,
	localHeaderOffset: number
}

export const sendMissionZip = async (
	res: express.Response,
	missions: Mission[],
	assuming: 'none' | 'gold' | 'platinumquest',
	appendIdToMis: boolean,
	fileName: string
) => {
	let entries: ZipEntry[] = [];
	let includedFiles = new Set<string>();
	let offset = 0;
	let dependencyCount = 0;

	// Files are stored uncompressed, so we can lay out the entire zip upfront and know its final size before sending
	// anything. We go through the missions in reverse to emulate the "files added late replace files added early" behavior.
	for (let i = missions.length - 1; i >= 0; i--) {
		let mission = missions[i];
		let dependencies = [...mission.dependencies];

		for (let dependency of mission.getFilteredDependencies(assuming, false, false)) {
			if (++dependencyCount % 512 === 0) {
				await new Promise(resolve => setImmediate(resolve)); // To avoid blocking for too long
			}

			let normalized = mission.normalizeDependency(dependency, false);
			if (includedFiles.has(normalized)) continue;

			let fullPath = await mission.findPath(dependency);
			if (!fullPath) continue;

			let name = Buffer.from(mission.normalizeDependency(dependency, appendIdToMis));
			let size = mission.fileSizes[dependencies.indexOf(dependency)];
			entries.push({
				fullPath,
				name,
				size,
				localHeaderOffset: offset
			});
			includedFiles.add(normalized);
			offset += LOCAL_HEADER_SIZE + name.byteLength + size;
		}
	}

	let centralDirectoryOffset = offset;
	let centralDirectorySize = 0;
	for (let entry of entries) {
		centralDirectorySize += CENTRAL_HEADER_SIZE + entry.name.byteLength;
		if (entry.localHeaderOffset >= UINT32_MAX) centralDirectorySize += ZIP64_EXTRA_FIELD_SIZE;
	}

	let needsZip64End =
		entries.length > UINT16_MAX
		|| centralDirectorySize >= UINT32_MAX
		|| centralDirectoryOffset >= UINT32_MAX;
	let totalSize = centralDirectoryOffset + centralDirectorySize + (needsZip64End ? ZIP64_END_SIZE : 0) + END_SIZE;

	res.set('Content-Type', 'application/zip');
	res.set('Content-Disposition', `attachment; filename="${fileName}"`);
	res.set('Content-Length', totalSize.toString());
	res.set('Access-Control-Allow-Origin', '*');

	let stream = Readable.from(
		generateZip(entries, centralDirectoryOffset, centralDirectorySize, needsZip64End),
		{ objectMode: false }
	);
	pipeline(stream, res).catch(error => {
		// Clients aborting downloads is business as usual
		if (error.code !== 'ERR_STREAM_PREMATURE_CLOSE') console.error("Error while streaming zip:", error);
	});
};

const READ_AHEAD_BYTES = 8 * 1024**2;

async function* generateZip(
	entries: ZipEntry[],
	centralDirectoryOffset: number,
	centralDirectorySize: number,
	needsZip64End: boolean
) {
	let now = new Date();
	let dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
	let dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
	let crcs: number[] = [];

	let reads: Promise<Buffer>[] = []; // Starting at the current entry
	let nextReadIndex = 0;
	let bytesReadAhead = 0;

	for (let entry of entries) {
		// Read files ahead of time so that the disk keeps working while earlier files are still being sent
		while (nextReadIndex < entries.length && (reads.length === 0 || bytesReadAhead < READ_AHEAD_BYTES)) {
			let read = fs.readFile(entries[nextReadIndex].fullPath);
			read.catch(() => {}); // Nobody awaits it anymore if the download gets aborted
			reads.push(read);
			bytesReadAhead += entries[nextReadIndex].size;
			nextReadIndex++;
		}

		let data = await reads.shift();
		bytesReadAhead -= entry.size;
		if (data.byteLength !== entry.size) {
			throw new Error(`Size of ${entry.fullPath} (${data.byteLength}) doesn't match its stored size (${entry.size}).`);
		}

		let crc = zlib.crc32(data);
		crcs.push(crc);

		let localHeader = Buffer.alloc(LOCAL_HEADER_SIZE + entry.name.byteLength);
		localHeader.writeUInt32LE(0x04034b50, 0);
		writeCommonHeaderFields(localHeader, 4, entry, crc, dosTime, dosDate, 0);
		entry.name.copy(localHeader, LOCAL_HEADER_SIZE);

		yield localHeader;
		yield data;
	}

	let centralDirectory = Buffer.alloc(centralDirectorySize);
	let pos = 0;
	for (let [i, entry] of entries.entries()) {
		let needsZip64 = entry.localHeaderOffset >= UINT32_MAX;

		centralDirectory.writeUInt32LE(0x02014b50, pos);
		centralDirectory.writeUInt16LE(45, pos + 4); // Version made by
		writeCommonHeaderFields(centralDirectory, pos + 6, entry, crcs[i], dosTime, dosDate, needsZip64 ? ZIP64_EXTRA_FIELD_SIZE : 0);
		centralDirectory.writeUInt32LE(needsZip64 ? UINT32_MAX : entry.localHeaderOffset, pos + 42);
		entry.name.copy(centralDirectory, pos + CENTRAL_HEADER_SIZE);
		pos += CENTRAL_HEADER_SIZE + entry.name.byteLength;

		if (needsZip64) {
			centralDirectory.writeUInt16LE(0x0001, pos);
			centralDirectory.writeUInt16LE(8, pos + 2);
			centralDirectory.writeBigUInt64LE(BigInt(entry.localHeaderOffset), pos + 4);
			pos += ZIP64_EXTRA_FIELD_SIZE;
		}
	}

	yield centralDirectory;

	let end = Buffer.alloc((needsZip64End ? ZIP64_END_SIZE : 0) + END_SIZE);
	pos = 0;

	if (needsZip64End) {
		end.writeUInt32LE(0x06064b50, 0);
		end.writeBigUInt64LE(44n, 4); // Size of the rest of the record
		end.writeUInt16LE(45, 12); // Version made by
		end.writeUInt16LE(45, 14); // Version needed
		end.writeBigUInt64LE(BigInt(entries.length), 24);
		end.writeBigUInt64LE(BigInt(entries.length), 32);
		end.writeBigUInt64LE(BigInt(centralDirectorySize), 40);
		end.writeBigUInt64LE(BigInt(centralDirectoryOffset), 48);

		end.writeUInt32LE(0x07064b50, 56);
		end.writeBigUInt64LE(BigInt(centralDirectoryOffset + centralDirectorySize), 64);
		end.writeUInt32LE(1, 72); // Total number of disks
		pos = ZIP64_END_SIZE;
	}

	// Values that don't fit are maxed out, which tells readers to look at the zip64 record instead
	end.writeUInt32LE(0x06054b50, pos);
	end.writeUInt16LE(Math.min(entries.length, UINT16_MAX), pos + 8);
	end.writeUInt16LE(Math.min(entries.length, UINT16_MAX), pos + 10);
	end.writeUInt32LE(Math.min(centralDirectorySize, UINT32_MAX), pos + 12);
	end.writeUInt32LE(Math.min(centralDirectoryOffset, UINT32_MAX), pos + 16);

	yield end;
}

const writeCommonHeaderFields = (
	buffer: Buffer,
	pos: number,
	entry: ZipEntry,
	crc: number,
	dosTime: number,
	dosDate: number,
	extraFieldLength: number
) => {
	buffer.writeUInt16LE(entry.localHeaderOffset >= UINT32_MAX ? 45 : 20, pos); // Version needed
	buffer.writeUInt16LE(0x0800, pos + 2); // Flags: file name is UTF-8
	buffer.writeUInt16LE(0, pos + 4); // Compression method: stored
	buffer.writeUInt16LE(dosTime, pos + 6);
	buffer.writeUInt16LE(dosDate, pos + 8);
	buffer.writeUInt32LE(crc, pos + 10);
	buffer.writeUInt32LE(entry.size, pos + 14); // Compressed size
	buffer.writeUInt32LE(entry.size, pos + 18); // Uncompressed size
	buffer.writeUInt16LE(entry.name.byteLength, pos + 22);
	buffer.writeUInt16LE(extraFieldLength, pos + 24);
};
