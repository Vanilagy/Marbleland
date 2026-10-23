import { Util } from "../util";
import * as hxTS from "../../lib/hxTorquescript";

export interface MisFile {
	root: MissionElementSimGroup,
	/** The custom marble attributes overrides specified in the file. */
	marbleAttributes: Record<string, string>,
	activatedPackages: string[],
	datablockFilePaths: string[],
	manualIncludes: string[]
}

export enum MissionElementType {
	SimGroup,
	ScriptObject,
	MissionArea,
	Sky,
	Sun,
	InteriorInstance,
	StaticShape,
	Item,
	Path,
	Marker,
	PathedInterior,
	Trigger,
	AudioProfile,
	MessageVector,
	TSStatic,
	ParticleEmitterNode,
	AudioEmitter
}

export interface MissionElementBase {
	// Underscore prefix to avoid name clashes
	/** The general type of the element. */
	_type: MissionElementType,
	/** The object name, specified in the () of the "constructor". */
	_name: string,
	/** Is unique for every element in the mission file. */
	_id: number
}

/** A sim group simply holds a list of elements. */
export interface MissionElementSimGroup extends MissionElementBase {
	_type: MissionElementType.SimGroup,
	elements: MissionElement[]
}

/** Stores metadata about the mission. */
export interface MissionElementScriptObject extends MissionElementBase {
	_type: MissionElementType.ScriptObject,
	time: string,
	name: string,
	desc: string,
	type: string,
	starthelptext: string,
	level: string,
	artist: string,
	goldtime: string,
	platinumtime: string,
	ultimatetime: string,
	awesometime: string,
	game: string,
	modification: string,
	gamemode: string,
	music: string,
	gametype: string,

	score: string,
	score0: string,
	score1: string,
	goldscore: string,
	goldscore0: string,
	goldscore1: string,
	platinumscore: string,
	platinumscore0: string,
	platinumscore1: string,
	ultimatescore: string,
	ultimatescore0: string,
	ultimatescore1: string,
	awesomescore: string
	awesomescore0: string
	awesomescore1: string
}

export interface MissionElementMissionArea extends MissionElementBase {
	_type: MissionElementType.MissionArea,
	area: string,
	flightceiling: string,
	flightceilingRange: string,
	locked: string
}

export interface MissionElementSky extends MissionElementBase {
	_type: MissionElementType.Sky,
	position: string,
	rotation: string,
	scale: string,
	cloudheightper: string[],
	cloudspeed1: string,
	cloudspeed2: string,
	cloudspeed3: string,
	visibledistance: string,
	useskytextures: string,
	renderbottomtexture: string,
	skysolidcolor: string,
	fogdistance: string,
	fogcolor: string,
	fogvolume1: string,
	fogvolume2: string,
	fogvolume3: string,
	materiallist: string,
	windvelocity: string,
	windeffectprecipitation: string,
	norenderbans: string,
	fogvolumecolor1: string,
	fogvolumecolor2: string,
	fogvolumecolor3: string
}

/** Stores information about the lighting direction and color. */
export interface MissionElementSun extends MissionElementBase {
	_type: MissionElementType.Sun,
	direction: string,
	color: string,
	ambient: string
}

/** Represents a static (non-moving) interior instance. */
export interface MissionElementInteriorInstance extends MissionElementBase {
	_type: MissionElementType.InteriorInstance,
	position: string,
	rotation: string,
	scale: string,
	interiorfile: string,
	showterraininside: string
}

/** Represents a static shape. */
export interface MissionElementStaticShape extends MissionElementBase {
	_type: MissionElementType.StaticShape,
	position: string,
	rotation: string,
	scale: string,
	datablock: string,
	resettime?: string,
	timeout?: string
}

/** Represents an item. */
export interface MissionElementItem extends MissionElementBase {
	_type: MissionElementType.Item,
	position: string,
	rotation: string,
	scale: string,
	datablock: string,
	collideable: string,
	static: string,
	rotate: string,
	showhelponpickup: string,
	timebonus?: string
}

/** Holds the markers used for the path of a pathed interior. */
export interface MissionElementPath extends MissionElementBase {
	_type: MissionElementType.Path,
	markers: MissionElementMarker[]
}

/** One keyframe in a pathed interior path. */
export interface MissionElementMarker extends MissionElementBase {
	_type: MissionElementType.Marker,
	position: string,
	rotation: string,
	scale: string,
	seqnum: string,
	mstonext: string,
	/** Either Linear, Accelerate or Spline. */
	smoothingtype: string
}

/** Represents a moving interior. */
export interface MissionElementPathedInterior extends MissionElementBase {
	_type: MissionElementType.PathedInterior,
	position: string,
	rotation: string,
	scale: string,
	datablock: string,
	interiorresource: string,
	interiorindex: string,
	baseposition: string,
	baserotation: string,
	basescale: string,
	// These two following values are a bit weird. See usage for more explanation.
	initialtargetposition: string,
	initialposition: string
}

/** Represents a trigger area used for out-of-bounds and help. */
export interface MissionElementTrigger extends MissionElementBase {
	_type: MissionElementType.Trigger,
	position: string,
	rotation: string,
	scale: string,
	datablock: string,
	/** A list of 12 strings representing 4 vectors. The first vector corresponds to the origin point of the cuboid, the other three are the side vectors. */
	polyhedron: string,
	text?: string,
	targettime?: string,
	instant?: string,
	icontinuetottime?: string,
}

/** Represents the song choice. */
export interface MissionElementAudioProfile extends MissionElementBase {
	_type: MissionElementType.AudioProfile,
	filename: string,
	description: string,
	preload: string
}

export interface MissionElementMessageVector extends MissionElementBase {
	_type: MissionElementType.MessageVector
}

/** Represents a static, unmoving, unanimated DTS shape. They're pretty dumb, tbh. */
export interface MissionElementTSStatic extends MissionElementBase {
	_type: MissionElementType.TSStatic,
	position: string,
	rotation: string,
	scale: string,
	shapename: string
}

/** Represents a particle emitter. Currently unused by this port (these are really niche). */
export interface MissionElementParticleEmitterNode extends MissionElementBase {
	_type: MissionElementType.ParticleEmitterNode,
	position: string,
	rotation: string,
	scale: string,
	datablock: string,
	emitter: string,
	velocity: string
}

export interface MissionElementAudioEmitter extends MissionElementBase {
	_type: MissionElementType.AudioEmitter,
	filename: string,
	description: string
}

export type MissionElement = MissionElementSimGroup | MissionElementScriptObject | MissionElementMissionArea | MissionElementSky | MissionElementSun | MissionElementInteriorInstance | MissionElementStaticShape | MissionElementItem | MissionElementPath | MissionElementMarker | MissionElementPathedInterior | MissionElementTrigger | MissionElementAudioProfile | MissionElementMessageVector | MissionElementTSStatic | MissionElementParticleEmitterNode | MissionElementAudioEmitter;

export interface TorqueScriptObject {
	name: string | null;
	class: string;
	properties?: Record<string, string | number | boolean | number[]>;
	children?: TorqueScriptObject[];
}

const elementHeadRegEx = /new\s+(\w+)\((.*?)\)\s*{/g;
const blockCommentRegEx = /\/\*(.|\n)*?\*\//g;
const lineCommentRegEx = /\/\/.*/g;
const assignmentRegEx = /(\$(?:\w|\d)+)\s*=\s*(.+?);/g;
const marbleAttributesRegEx = /setMarbleAttributes\("(\w+)",\s*(.+?)\);/g;
const activatePackageRegEx = /activatePackage\((.+?)\);/g;
const datablockFilePathRegEx = /(?<=datablock\s+.+?\n*{[^}]*)(?:filename|shapefile)\s*=\s*(.+?);/gi;
const includeDirectiveRegEx = /\/\/\s*@include\s+"((?:[^"\\]|\\.)*)"/gi;

/** A parser for .mis files, which hold mission information. */
export class MisParser {
	text: string;
	currentElementId = 0;
	variables: Record<string, string>;

	constructor(text: string) {
		this.text = text;
	}

	parseTorquescript(text: string): TorqueScriptObject {
		const scanner = new hxTS.Scanner(text);
		const parser = new hxTS.Parser(scanner.scanTokens());
		const astStmts = parser.parse();
		const optimizer = new hxTS.Optimizer(astStmts);
		const constFoldPass = new hxTS.optimizer_ConstantFoldingPass();
		optimizer.addOptimizerPass(constFoldPass);

		const varFoldPass = new hxTS.optimizer_ConstEvalPass();
		varFoldPass.addGlobal("$usermods", new hxTS.expr_StringConstExpr(0, "", false));
		optimizer.addOptimizerPass(varFoldPass);

		optimizer.optimize(2); // perform constant folding

		const missionGroup = optimizer.getAST().find(
			(stmt): stmt is hxTS.expr_ObjectDeclExpr => stmt instanceof hxTS.expr_ObjectDeclExpr && this.flattenValue(stmt.objectNameExpr)?.toString().toLowerCase() === "missiongroup"
		);
		if (!missionGroup) {
			throw new Error("No MissionGroup found in mission file");
		}

		return this.flattenObject(missionGroup);
	}

	flattenObject(stmt: hxTS.expr_ObjectDeclExpr): TorqueScriptObject {
		const properties: Record<string, string | number | boolean> = {};
		for (const slot of stmt.slotDecls) {
			let slotName = slot.slotName.lexeme;
			const arrayIndex = slot.arrayExpr !== null ? this.flattenValue(slot.arrayExpr) : "";
			if (arrayIndex !== null && arrayIndex !== "") {
				slotName += arrayIndex;
			}
			const value = this.flattenValue(slot.expr);
			if (value !== null) {
				properties[slotName.toLowerCase()] = value;
			}
		}
		return {
			name: this.flattenValue(stmt.objectNameExpr)?.toString() ?? null,
			class: this.flattenValue(stmt.className)?.toString() ?? "",
			children: stmt.subObjects.map(child => this.flattenObject(child)),
			properties,
		};
	}

	flattenValue(expr: hxTS.expr_Expr | null | undefined): string | number | boolean | null {
		if (!expr) return null;

		// The constant folding pass stores its result in a separate expression.
		if (expr instanceof hxTS.expr_BinaryExpr && expr.optimized && expr.optimizedExpr) return this.flattenValue(expr.optimizedExpr);
		if (expr instanceof hxTS.expr_IntUnaryExpr && expr.optimized && expr.optimizedExpr) return this.flattenValue(expr.optimizedExpr);
		if (expr instanceof hxTS.expr_FloatUnaryExpr && expr.optimized && expr.optimizedExpr) return this.flattenValue(expr.optimizedExpr);

		if (expr instanceof hxTS.expr_ConstantExpr) return expr.name.literal ?? expr.name.lexeme;
		if (expr instanceof hxTS.expr_StringConstExpr) return expr.value;
		if (expr instanceof hxTS.expr_IntExpr) return expr.value;
		if (expr instanceof hxTS.expr_FloatExpr) return expr.value;
		if (expr instanceof hxTS.expr_ParenthesisExpr) return this.flattenValue(expr.expr);

		if (expr instanceof hxTS.expr_VarExpr) {
			const variable = this.variables?.["$" + expr.name.lexeme];
			if (variable === undefined) return null;
			return this.resolveExpression(variable);
		}

		if (expr instanceof hxTS.expr_StrCatExpr) {
			const left = this.flattenValue(expr.left);
			const right = this.flattenValue(expr.right);
			if (left === null || right === null) return null;

			switch (expr.op.lexeme) {
				case "SPC": return `${left} ${right}`;
				case "TAB": return `${left}\t${right}`;
				case "NL": return `${left}\n${right}`;
				default: return `${left}${right}`;
			}
		}

		if (expr instanceof hxTS.expr_CommaCatExpr) {
			const left = this.flattenValue(expr.left);
			const right = this.flattenValue(expr.right);
			if (left === null || right === null) return null;
			return `${left},${right}`;
		}

		if (expr instanceof hxTS.expr_IntBinaryExpr || expr instanceof hxTS.expr_FloatBinaryExpr) {
			const left = Number(this.flattenValue(expr.left));
			const right = Number(this.flattenValue(expr.right));
			if (isNaN(left) || isNaN(right)) return null;

			switch (expr.op.lexeme) {
				case "+": return left + right;
				case "-": return left - right;
				case "*": return left * right;
				case "/": return right === 0 ? null : left / right;
				case "%": return right === 0 ? null : left % right;
				default: return null;
			}
		}

		if (expr instanceof hxTS.expr_IntUnaryExpr || expr instanceof hxTS.expr_FloatUnaryExpr) {
			const value = Number(this.flattenValue(expr.expr));
			if (isNaN(value)) return null;
			if (expr.op.lexeme === "-") return -value;
			if (expr.op.lexeme === "!") return value === 0 ? 1 : 0;
			return null;
		}

		return null;
	}

	/** Converts a flattened TorqueScript object into the public mission element shape. */
	toMissionElement(object: TorqueScriptObject): MissionElement {
		const name = object.name ?? "";

		switch (object.class.toLowerCase()) {
			case "simgroup": {
				// Children are converted first so that IDs are assigned in the same order as before.
				const elements = this.toMissionElements(object.children);
				return {
					_type: MissionElementType.SimGroup,
					_name: name,
					_id: this.currentElementId++,
					elements
				} as MissionElementSimGroup;
			}
			case "path": {
				const markers = (this.toMissionElements(object.children) as MissionElementMarker[])
					.filter(element => element._type === MissionElementType.Marker)
					.sort((a, b) => MisParser.parseNumber(a.seqnum) - MisParser.parseNumber(b.seqnum));
				return {
					_type: MissionElementType.Path,
					_name: name,
					_id: this.currentElementId++,
					markers
				} as MissionElementPath;
			}
			case "scriptobject": return this.createMissionElement(object, MissionElementType.ScriptObject);
			case "missionarea": return this.createMissionElement(object, MissionElementType.MissionArea);
			case "sky": return this.createMissionElement(object, MissionElementType.Sky);
			case "sun": return this.createMissionElement(object, MissionElementType.Sun);
			case "interiorinstance": return this.createMissionElement(object, MissionElementType.InteriorInstance);
			case "staticshape": return this.createMissionElement(object, MissionElementType.StaticShape);
			case "item": return this.createMissionElement(object, MissionElementType.Item);
			case "marker": return this.createMissionElement(object, MissionElementType.Marker);
			case "pathedinterior": return this.createMissionElement(object, MissionElementType.PathedInterior);
			case "trigger": return this.createMissionElement(object, MissionElementType.Trigger);
			case "audioprofile": return this.createMissionElement(object, MissionElementType.AudioProfile);
			case "messagevector": return this.createMissionElement(object, MissionElementType.MessageVector);
			case "tsstatic": return this.createMissionElement(object, MissionElementType.TSStatic);
			case "particleemitternode": return this.createMissionElement(object, MissionElementType.ParticleEmitterNode);
			case "audioemitter": return this.createMissionElement(object, MissionElementType.AudioEmitter);
			default: return null;
		}
	}

	toMissionElements(objects: TorqueScriptObject[] | undefined): MissionElement[] {
		const elements: MissionElement[] = [];
		for (const object of objects ?? []) {
			const element = this.toMissionElement(object);
			if (element) elements.push(element);
		}
		return elements;
	}

	createMissionElement(object: TorqueScriptObject, type: MissionElementType): MissionElement {
		const properties: Record<string, string> = {};
		for (const [key, value] of Object.entries(object.properties ?? {})) {
			properties[key] = Array.isArray(value) ? value.join(" ") : String(value);
		}

		return Object.assign({
			_type: type,
			_name: object.name ?? "",
			_id: this.currentElementId++
		}, properties) as unknown as MissionElement;
	}

	parse(): MisFile {
		let match: RegExpMatchArray;

		let objectWriteBeginIndex = this.text.indexOf("//--- OBJECT WRITE BEGIN ---");
		let objectWriteEndIndex = this.text.lastIndexOf("//--- OBJECT WRITE END ---");

		let manualIncludes: string[] = [];
		match = null;
		includeDirectiveRegEx.lastIndex = 0;
		while ((match = includeDirectiveRegEx.exec(this.text)) !== null) {
			if (Util.indexIsInStringLiteral(this.text, match.index)) continue;
			manualIncludes.push(Util.unescape(match[1]));
		}

		// Replace all block and line comments with whitespace to make parsing easier
		let currentIndex = 0;
		while (true) {
			blockCommentRegEx.lastIndex = currentIndex;
			lineCommentRegEx.lastIndex = currentIndex;

			let blockMatch = blockCommentRegEx.exec(this.text);
			let lineMatch = lineCommentRegEx.exec(this.text);

			// The detected "comment" might be inside a string literal, in which case we ignore it 'cause it ain't no comment.
			if (blockMatch && Util.indexIsInStringLiteral(this.text, blockMatch.index)) blockMatch = null;
			if (lineMatch && Util.indexIsInStringLiteral(this.text, lineMatch.index)) lineMatch = null;

			if (!blockMatch && !lineMatch) break;
			else if (!lineMatch || (blockMatch && lineMatch && blockMatch.index < lineMatch.index)) {
				this.text = this.text.slice(0, blockMatch.index)
					+ ' '.repeat(blockMatch[0].length)
					+ this.text.slice(blockMatch.index + blockMatch[0].length);
				currentIndex = blockCommentRegEx.lastIndex;
			} else {
				this.text = this.text.slice(0, lineMatch.index)
					+ ' '.repeat(lineMatch[0].length)
					+ this.text.slice(lineMatch.index + lineMatch[0].length);
				currentIndex = lineCommentRegEx.lastIndex;
			}
		}

		let outsideText = this.text.slice(0, objectWriteBeginIndex) + this.text.slice(objectWriteEndIndex);

		// Find all specified variables
		this.variables = { "$usermods": '""' }; // Just make $usermods point to nothing
		assignmentRegEx.lastIndex = 0;
		match = null;
		while ((match = assignmentRegEx.exec(outsideText)) !== null) {
			// Only use the first variable found. This is because the variable is likely to be modified later on with conditional statements and that's too complex to parse right now.
			if (!this.variables[match[1]]) this.variables[match[1]] = match[2];
		}

		// Parse any custom marble attributes specified at the top of the file
		let marbleAttributes: Record<string, string> = {};
		match = null;
		marbleAttributesRegEx.lastIndex = 0;
		while ((match = marbleAttributesRegEx.exec(outsideText)) !== null) {
			marbleAttributes[match[1]] = this.resolveExpression(match[2]);
		}

		// Parse any packages that the mission file activates
		let activatedPackages: string[] = [];
		match = null;
		activatePackageRegEx.lastIndex = 0;
		while ((match = activatePackageRegEx.exec(outsideText)) !== null) {
			activatedPackages.push(this.resolveExpression(match[1]));
		}

		// Parse any file paths required by datablocks
		let datablockFilePaths: string[] = [];
		match = null;
		datablockFilePathRegEx.lastIndex = 0;
		while ((match = datablockFilePathRegEx.exec(outsideText)) !== null) {
			datablockFilePaths.push(this.resolveExpression(match[1]));
		}

		// Trim away the outside text
		if (objectWriteBeginIndex !== -1 && objectWriteEndIndex !== -1) {
			this.text = this.text.slice(objectWriteBeginIndex, objectWriteEndIndex);
		}

		const missionGroup = this.toMissionElement(this.parseTorquescript(this.text));
		if (!missionGroup || missionGroup._type !== MissionElementType.SimGroup) {
			throw new Error("Mission file doesn't have a MissionGroup SimGroup!");
		}

		return {
			root: missionGroup as MissionElementSimGroup,
			marbleAttributes,
			activatedPackages,
			datablockFilePaths,
			manualIncludes
		};
	}

	/** Resolves a TorqueScript rvalue expression. Currently only supports the concatenation @ operator. */
	resolveExpression(expr: string) {
		let parts = Util.splitIgnoreStringLiterals(expr, '@').map(x => {
			x = x.trim();

			if (x.startsWith('$') && this.variables[x] !== undefined) {
				// Replace the variable with its value
				x = this.resolveExpression(this.variables[x]);
			} else if (x.startsWith('"') && x.endsWith('"')) {
				x = Util.unescape(x.slice(1, -1)); // It's a string literal, so remove " "
			}

			return x;
		});

		return parts.join('');
	}

	/** Parses a numeric value. */
	static parseNumber(string: string) {
		if (!string || typeof string !== 'string') return 0;
		// Strange thing here, apparently you can supply lists of numbers. In this case tho, we just take the first value.
		let val = Number(string.split(',')[0]);
		if (isNaN(val)) return 0;
		return val;
	}
}