import * as fs from "fs-extra";
import * as zlib from "zlib";
import * as crypto from "crypto";
import * as util from "util";
import path from "path";
import NodeRSA from "node-rsa";
import { Mission } from "../mission";
import { mbcryptAesKey, structureMBGSet, structurePQSet } from "../globals";
import { Util } from "../util";

/** MBPak file spec
 * signLength: int32
 * sign: int8[signLength] :: The RSA-SHA256-PKCS1_5 signature
 * entryCount: int32 :: The number of entries in the pak
 * for 0..entryCount:
 * 	fileNameLength: int8,
 * 	fileName: int8[fileNameLength] (utf-8 string), :: The file name, with the path in the pak
 * 	encrypted: int8, :: Whether the file is encrypted or not
 * 	fileOffset: int64, :: The index of the starting byte of the compressed file in data
 * 	uncompressedSize: int64, :: The length of the file when uncompressed
 * 	compressedSize: int32, :: The length of the file when compressed
 * data: int8[0..EOF] :: The compressed file data
 */

/** MBPak file support, loaded by PQ directly as virtual filesystem, easy installation of custom levels */
export class MBPakFileEntry {
	filePath: string = "";
	uncompressedSize: number = 0;
	compressedContents?: Buffer = Buffer.alloc(0);
	fileOffset: number = 0;
	encrypted: boolean = false;

	constructor() {
		this.filePath = "";
		this.uncompressedSize = 0;
		this.compressedContents = undefined;
		this.fileOffset = 0;
		this.encrypted = false;
	}

	/** Creates an entry containing the file at filePath, internally stored at path of actualPath */
	async makeEntry(filePath: string, actualPath: string) {
		this.filePath = actualPath;

		let data = Buffer.from(await fs.readFile(filePath, "binary"), "binary");
		this.uncompressedSize = data.length;
		this.compressedContents = await util.promisify(zlib.deflate)(data);
	}

	/* Encrypts the data */
	encrypt(key: crypto.CipherKey) {
		if (!this.encrypted) {
			let iv = crypto.randomBytes(16);
			let aes = crypto.createCipheriv("aes-256-cbc", key, iv);
			aes.setAutoPadding(true);
			let crypted = Buffer.concat([aes.update(this.compressedContents as Buffer), aes.final()]);
			
			let outbuf = Buffer.alloc(4, 0, "binary");
			outbuf.writeInt32LE(iv.length, 0);
			outbuf = Buffer.concat([outbuf, iv, crypted]);
			this.compressedContents = outbuf;
			this.encrypted = true;
		}
	}
}

/* The actual container file **/
export class MBPakFile {
	entries: MBPakFileEntry[] = [];

	constructor() {
		this.entries = [];
	}

	/** Creates an MBPakFile object from the mission */
	static async create(mission: Mission, assuming: string, appendIdToMis: boolean) {
		let includedFiles = new Set<string>();
		let mbpak = new MBPakFile();

		let rootPath = assuming === 'gold' ? 'marble/data' : 'platinum/data';

		for (let dependency of mission.dependencies) {
			// Skip default assets
			let normalized = mission.normalizeDependency(dependency, false);
			if (includedFiles.has(normalized)) continue;
			if (assuming === 'gold' && structureMBGSet.has(normalized.toLowerCase())) continue;
			if (assuming === 'platinumquest' && structurePQSet.has(normalized.toLowerCase())) continue;

			let fullPath = await mission.findPath(dependency);
			if (fullPath) {
				// Open up a read stream and add it to the mbpak
				let entry = new MBPakFileEntry();
				let normalized = mission.normalizeDependency(dependency, appendIdToMis, rootPath, 'missions/marbleland');
				await entry.makeEntry(fullPath, normalized);
				entry.encrypt(mbcryptAesKey);
				mbpak.entries.push(entry);
			}
		}
		return mbpak;
	}

	/** Writes the MBPakFile to buffer, signing it with rsakey */
	write(rsakey: string) {
		let totalSize = 0;
		for (let i = 0; i < this.entries.length; i++) {
			let entry = this.entries[i];
			entry.fileOffset = totalSize;
			totalSize += (entry.compressedContents as Buffer).length;
		}

		let databuffer = Buffer.concat([...this.entries.map(x => x.compressedContents as Buffer)]);

		let rsa = new NodeRSA(rsakey);
		rsa.setOptions({
			signingScheme: {
				scheme: "pkcs1",
				hash: "sha256",
			}
		})
		let sign = rsa.sign(databuffer, "buffer");
		let buf = Buffer.alloc(4, 0, "binary");
		buf.writeInt32LE(sign.length);
		buf = Buffer.concat([buf, sign]);
		let b3 = Buffer.alloc(4, 0, "binary");
		b3.writeInt32LE(this.entries.length);
		buf = Buffer.concat([buf, b3]);
		let bufsize = 0;
		this.entries.forEach(element => {
			bufsize += 1 + 1 + 8 + 8 + 4 + element.filePath.length;
		});

		let buf2 = Buffer.alloc(bufsize, 0, "binary");
		let off = 0;
		this.entries.forEach(element => {
			buf2.writeInt8(element.filePath.length, off);
			off++;
			buf2.write(element.filePath, off, 'utf-8');
			off += element.filePath.length;
			buf2.writeInt8(element.encrypted ? 1 : 0, off);
			off++;
			buf2.writeBigInt64LE(BigInt(element.fileOffset), off);
			off += 8;
			buf2.writeBigInt64LE(BigInt(element.uncompressedSize), off);
			off += 8;
			buf2.writeInt32LE(element.compressedContents!.length, off);
			off += 4;
		});

		buf = Buffer.concat([buf, buf2, databuffer]);
		return buf;
	}
}