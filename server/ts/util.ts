import * as fs from 'fs-extra';
import * as path from 'path';
import { Config } from './config';
import { DirectoryStructure } from './globals';

export class Util {
	/** Gets the index of a substring like String.prototype.indexOf, but only if that index lies outside of string literals. */
	static indexOfIgnoreStringLiterals(str: string, searchString: string, position = 0, strLiteralToken = '"') {
		let inString = false;
		for (let i = position; i < str.length; i++) {
			let c = str[i];

			if (inString) {
				if (c === strLiteralToken && str[i-1] !== '\\') inString = false;
				continue;
			}

			if (c === strLiteralToken) inString = true;
			else if (str.startsWith(searchString, i)) return i;
		}

		return -1;
	}

	/** Returns true iff the supplied index is part of a string literal. */
	static indexIsInStringLiteral(str: string, index: number, strLiteralToken = '"') {
		let inString = false;
		for (let i = 0; i < str.length; i++) {
			let c = str[i];

			if (inString) {
				if (i === index) return true;
				if (c === strLiteralToken && str[i-1] !== '\\') inString = false;
				continue;
			}

			if (c === strLiteralToken) inString = true;
		}

		return false;
	}

	/** Splits a string like String.prototype.split, but ignores the splitter if it appears inside string literal tokens. */
	static splitIgnoreStringLiterals(str: string, splitter: string, strLiteralToken = '"') {
		let indices: number[] = [];

		let inString = false;
		for (let i = 0; i < str.length; i++) {
			let c = str[i];

			if (inString) {
				if (c === strLiteralToken && str[i-1] !== '\\') inString = false;
				continue;
			}

			if (c === strLiteralToken) inString = true;
			else if (c === splitter) indices.push(i);
		}

		let parts: string[] = [];
		let remaining = str;

		for (let i = 0; i < indices.length; i++) {
			let index = indices[i] - (str.length - remaining.length);
			let part = remaining.slice(0, index);
			remaining = remaining.slice(index + 1);
			parts.push(part);
		}
		parts.push(remaining);

		return parts;
	}

	/** Unescapes escaped (\) characters. */
	static unescape(str: string) {
		let regex = /\\([^\\])/g;
		let match: RegExpExecArray = null;
		let specialCases: Record<string, string> = {
			't': '\t',
			'v': '\v',
			'0': '\0',
			'f': '\f',
			'n': '\n',
			'r': '\r'
		};

		while ((match = regex.exec(str)) !== null) {
			let replaceWith: string;

			if (specialCases[match[1]]) replaceWith = specialCases[match[1]];
			else replaceWith = match[1];

			str = str.slice(0, match.index) + replaceWith + str.slice(match.index + match[0].length);
			regex.lastIndex--;
		}

		return str;
	}

	static readdirCache = new Map<string, Promise<string[]>>();
	static readdirCached(directoryPath: string) {
		if (this.readdirCache.has(directoryPath)) return this.readdirCache.get(directoryPath);
		let promise = new Promise<string[]>(async resolve => {
			let exists = await fs.pathExists(directoryPath);
			if (!exists) {
				resolve([]);
				return;
			}
			
			let files = await fs.readdir(directoryPath);
			resolve(files);
		});
		this.readdirCache.set(directoryPath, promise);
		return promise;
	}

	static async getFullFileNames(fileName: string, directoryPath: string) {
		let files = await this.readdirCached(directoryPath);
		let lowerCase = fileName.toLowerCase();
		return files.filter(x => x.toLowerCase().startsWith(lowerCase));
	}

	static removeExtension(path: string) {
		let dotIndex = path.lastIndexOf('.');
		if (dotIndex === -1) return path;
		return path.slice(0, dotIndex);
	}

	static jsonClone<T>(obj: T) {
		return JSON.parse(JSON.stringify(obj));
	}

	static directoryStructureHasPath(directoryStructure: DirectoryStructure, path: string): boolean {
		if (!path) return false;
		let parts = path.split('/');
		let lowerCase = parts[0].toLowerCase();

		if (lowerCase in directoryStructure) {
			let entry = directoryStructure[lowerCase];
			if (entry) return this.directoryStructureHasPath(entry, parts.slice(1).join('/'));
			return parts.length === 1;
		}

		return false;
	}

	static equalCaseInsensitive(s1: string, s2: string) {
		return s1.toLowerCase() === s2.toLowerCase();
	}

	static lowerCaseKeysDeep(obj: Record<string, any>) {
		for (let key in obj) {
			let value = obj[key];
			if (typeof value === 'object') Util.lowerCaseKeysDeep(value);
			delete obj[key];
			obj[key.toLowerCase()] = value;
		}

		return obj;
	}

	static getFileName(path: string) {
		return path.slice(path.lastIndexOf('/') + 1)
	}
}

export class KeyValueStore<T> {
	private path: string;
	private data: Partial<T>;
	private needsSave = false;
	private saving = false;

	constructor(path: string, defaults: Partial<T>) {
		this.path = path;
		this.data = {};

		let exists = fs.pathExistsSync(path);
		if (exists) {
			this.data = JSON.parse(fs.readFileSync(path).toString());
		} else {
			this.data = {};
		}

		for (let key in defaults) {
			if (!(key in this.data)) this.data[key] = defaults[key];
		}
	}

	get(key: keyof T) {
		return this.data[key];
	}

	set<K extends keyof T>(key: K, value: T[K]) {
		this.data[key] = value;
		this.save();
	}

	setMultiple(values: Partial<T>) {
		Object.assign(this.data, values);
		this.save();
	}

	async save() {
		this.needsSave = true;

		if (!this.saving) {
			this.saving = true;
			this.needsSave = false;
			await fs.writeFile(this.path, JSON.stringify(this.data));
			this.saving = false;

			if (this.needsSave) this.save();
		}
	}
}