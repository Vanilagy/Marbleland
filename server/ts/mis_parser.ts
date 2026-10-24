import * as crypto from 'crypto';
import { Util } from "./util";
import * as hxTS from "../lib/hxTorquescript";

export interface MisFile {
	root: MissionElementSimGroup,
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
	_name: string
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

const includeDirectiveRegEx = /^\/\/\s*@include\s+"((?:[^"\\]|\\.)*)"/i;
const LEAF_ELEMENT_TYPES: Record<string, MissionElementType> = {
	scriptobject: MissionElementType.ScriptObject,
	missionarea: MissionElementType.MissionArea,
	sky: MissionElementType.Sky,
	sun: MissionElementType.Sun,
	interiorinstance: MissionElementType.InteriorInstance,
	staticshape: MissionElementType.StaticShape,
	item: MissionElementType.Item,
	marker: MissionElementType.Marker,
	pathedinterior: MissionElementType.PathedInterior,
	trigger: MissionElementType.Trigger,
	audioprofile: MissionElementType.AudioProfile,
	messagevector: MissionElementType.MessageVector,
	tsstatic: MissionElementType.TSStatic,
	particleemitternode: MissionElementType.ParticleEmitterNode,
	audioemitter: MissionElementType.AudioEmitter
};

/** A parser for .mis files, which hold mission information. */
export class MisParser {
	text: string;
	tokens: hxTS.Token[];
	statements: hxTS.expr_Stmt[];
	objectWriteBeginLine: number | null;
	objectWriteEndLine: number | null;
	variables: Map<string, string | number | boolean | null>;

	constructor(text: string) {
		this.text = text;
		this.tokens = new hxTS.Scanner(text).scanTokens();
		this.statements = new hxTS.Parser(this.tokens).parse();

		// The markers are comment tokens, so lookalikes inside string literals don't count
		this.objectWriteBeginLine = this.tokens.find(x => x.lexeme.startsWith('//--- OBJECT WRITE BEGIN ---'))?.line ?? null;
		this.objectWriteEndLine = this.tokens.findLast(x => x.lexeme.startsWith('//--- OBJECT WRITE END ---'))?.line ?? null;

		this.variables = new Map([['$usermods', '']]); // $usermods points to nothing
		for (let statement of this.statements) {
			if (!(statement instanceof hxTS.expr_AssignExpr)) continue;

			let key = statement.varExpr.print(0, false).toLowerCase();
			if (!this.variables.has(key)) this.variables.set(key, this.flattenValue(statement.expr));
		}
	}

	parse(): MisFile {
		// @include directives are comment tokens too, so lookalikes inside string literals don't count either
		let manualIncludes: string[] = [];
		for (let token of this.tokens) {
			let match = includeDirectiveRegEx.exec(token.lexeme);
			if (match) manualIncludes.push(Util.unescape(match[1]));
		}

		let objectDecls = this.statements.filter((x): x is hxTS.expr_ObjectDeclExpr => x instanceof hxTS.expr_ObjectDeclExpr);

		// Custom datablocks can pull in files of their own
		let datablockFilePaths: string[] = [];
		for (let decl of objectDecls) {
			if (!decl.structDecl) continue;

			for (let slot of decl.slotDecls) {
				let key = slot.slotName.lexeme.toLowerCase();
				if (key !== 'filename' && key !== 'shapefile') continue;

				let value = this.flattenValue(slot.expr);
				if (value !== null) datablockFilePaths.push(String(value));
			}
		}

		// Without the markers, the MissionGroup may sit anywhere at the top level
		let candidates = this.getObjectWriteStatements() ?? this.statements;
		let missionGroup = candidates.find((x): x is hxTS.expr_ObjectDeclExpr =>
			x instanceof hxTS.expr_ObjectDeclExpr
			&& this.flattenValue(x.objectNameExpr)?.toString().toLowerCase() === 'missiongroup'
		);
		if (!missionGroup) throw new Error("No MissionGroup found in mission file.");

		let root = this.toMissionElement(missionGroup);
		if (root?._type !== MissionElementType.SimGroup) throw new Error("Mission file doesn't have a MissionGroup SimGroup!");

		return {
			root: root as MissionElementSimGroup,
			datablockFilePaths,
			manualIncludes
		};
	}

	hash() {
		// Hashing the AST instead of the text makes formatting and comments not matter
		try {
			return sha256(this.statements.map(x => this.hashStmt(x)).join(''));
		} catch (e) {
			// Something in there we don't know how to hash, so just hash the raw text instead
			return sha256(this.text);
		}
	}

	containsCustomCode() {
		let containsCode = false;
		let visitor: hxTS.IASTVisitor = {
			visitStmt: () => {},
			visitBreakStmt: () => {},
			visitContinueStmt: () => {},
			visitExpr: () => {},
			visitParenthesisExpr: () => {},
			visitReturnStmt: () => {},
			visitIfStmt: () => {
				containsCode = true;
			},
			visitLoopStmt: () => {
				containsCode = true;
			},
			visitBinaryExpr: () => {},
			visitFloatBinaryExpr: () => {},
			visitIntBinaryExpr: () => {},
			visitStrEqExpr: () => {},
			visitStrCatExpr: () => {},
			visitCommatCatExpr: () => {},
			visitConditionalExpr: () => {},
			visitIntUnaryExpr: () => {},
			visitFloatUnaryExpr: () => {},
			visitVarExpr: () => {},
			visitIntExpr: () => {},
			visitFloatExpr: () => {},
			visitStringConstExpr: () => {},
			visitConstantExpr: () => {},
			visitAssignExpr: () => {
				containsCode = true;
			},
			visitAssignOpExpr: () => {
				containsCode = true;
			},
			visitFuncCallExpr: () => {
				containsCode = true;
			},
			visitSlotAccessExpr: () => {},
			// Slot assignments without an object are just the fields of an object declaration
			visitSlotAssignExpr: expr => {
				if (expr.objectExpr != null) containsCode = true;
			},
			visitSlotAssignOpExpr: expr => {
				if (expr.objectExpr != null) containsCode = true;
			},
			visitObjectDeclExpr: expr => {
				if (
					expr.structDecl
					|| !(expr.objectNameExpr instanceof hxTS.expr_StringConstExpr || expr.objectNameExpr instanceof hxTS.expr_ConstantExpr)
					|| !(expr.className instanceof hxTS.expr_ConstantExpr)
					|| expr.parentObject != null
				) {
					containsCode = true;
				}
			},
			visitFunctionDeclStmt: () => {
				containsCode = true;
			}
		};

		for (let statement of this.statements) statement.visitStmt(visitor);
		if (containsCode) return true;

		// On top of that, the object write region must hold nothing but the MissionGroup itself
		let objectWriteStatements = this.getObjectWriteStatements();
		if (!objectWriteStatements || objectWriteStatements.length !== 1) return true;

		let missionGroup = objectWriteStatements[0];
		if (!(missionGroup instanceof hxTS.expr_ObjectDeclExpr)) return true;

		let nameExpr = missionGroup.objectNameExpr;
		if (nameExpr instanceof hxTS.expr_StringConstExpr && nameExpr.value !== 'MissionGroup') return true;
		if (nameExpr instanceof hxTS.expr_ConstantExpr && nameExpr.name.lexeme !== 'MissionGroup') return true;

		return false;
	}

	/** Parses a numeric value. */
	static parseNumber(string: string) {
		if (!string || typeof string !== 'string') return 0;
		// Strange thing here, apparently you can supply lists of numbers. In this case tho, we just take the first value.
		let val = Number(string.split(',')[0]);
		if (isNaN(val)) return 0;
		return val;
	}

	getObjectWriteStatements() {
		if (this.objectWriteBeginLine === null || this.objectWriteEndLine === null) return null;

		// The END marker is a line comment, so a statement on its line still comes before it
		return this.statements.filter(x => x.lineNo > this.objectWriteBeginLine && x.lineNo <= this.objectWriteEndLine);
	}

	toMissionElement(decl: hxTS.expr_ObjectDeclExpr): MissionElement {
		let className = (this.flattenValue(decl.className)?.toString() ?? '').toLowerCase();
		let name = this.flattenValue(decl.objectNameExpr)?.toString() ?? '';

		if (className === 'simgroup' || className === 'path') {
			let elements = decl.subObjects.map(x => this.toMissionElement(x)).filter(x => x);

			if (className === 'simgroup') {
				return {
					_type: MissionElementType.SimGroup,
					_name: name,
					elements
				} as MissionElementSimGroup;
			}

			let markers = (elements.filter(x => x._type === MissionElementType.Marker) as MissionElementMarker[])
				.sort((a, b) => MisParser.parseNumber(a.seqnum) - MisParser.parseNumber(b.seqnum));
			return {
				_type: MissionElementType.Path,
				_name: name,
				markers
			} as MissionElementPath;
		}

		let type = LEAF_ELEMENT_TYPES[className];
		if (type === undefined) return null;

		let element: Record<string, unknown> = {
			_type: type,
			_name: name
		};
		for (let slot of decl.slotDecls) {
			let slotName = slot.slotName.lexeme;
			let arrayIndex = slot.arrayExpr !== null ? this.flattenValue(slot.arrayExpr) : '';
			if (arrayIndex !== null && arrayIndex !== '') slotName += arrayIndex;

			let value = this.flattenValue(slot.expr);
			if (value !== null) element[slotName.toLowerCase()] = String(value);
		}

		return element as unknown as MissionElement;
	}

	flattenValue(expr: hxTS.expr_Expr | null | undefined): string | number | boolean | null {
		if (!expr) return null;

		if (expr instanceof hxTS.expr_ConstantExpr) return expr.name.literal ?? expr.name.lexeme;
		if (expr instanceof hxTS.expr_StringConstExpr) return expr.value;
		if (expr instanceof hxTS.expr_IntExpr) return expr.value;
		if (expr instanceof hxTS.expr_FloatExpr) return expr.value;
		if (expr instanceof hxTS.expr_ParenthesisExpr) return this.flattenValue(expr.expr);

		if (expr instanceof hxTS.expr_VarExpr) return this.variables.get(expr.print(0, false).toLowerCase()) ?? null;

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

	hashStmt(stmt: hxTS.expr_Stmt): string {
		// The exact strings hashed here are baked into the stored astHashes, so don't change them
		switch (stmt.constructor) {
			case hxTS.expr_BreakStmt: return sha256(`break`);
			case hxTS.expr_ContinueStmt: return sha256(`continue`);
			case hxTS.expr_IntExpr: return sha256(`${(stmt as hxTS.expr_IntExpr).value}`);
			case hxTS.expr_FloatExpr: return sha256(`${(stmt as hxTS.expr_FloatExpr).value}`);
			case hxTS.expr_StringConstExpr: return sha256((stmt as hxTS.expr_StringConstExpr).value.toLowerCase());
			case hxTS.expr_ConstantExpr: return sha256((stmt as hxTS.expr_ConstantExpr).name.literal.toLowerCase());
			case hxTS.expr_ParenthesisExpr: return this.hashStmt((stmt as hxTS.expr_ParenthesisExpr).expr);
			case hxTS.expr_ReturnStmt: {
				let retExpr = (stmt as hxTS.expr_ReturnStmt).expr;
				if (retExpr == null) return sha256(`return;`);
				return sha256(`return ${this.hashStmt(retExpr)};`);
			}
			case hxTS.expr_IntUnaryExpr:
			case hxTS.expr_FloatUnaryExpr: {
				let expr = stmt as hxTS.expr_IntUnaryExpr | hxTS.expr_FloatUnaryExpr;
				return sha256(`${expr.op.lexeme}${this.hashStmt(expr.expr)}`);
			}
			case hxTS.expr_IntBinaryExpr:
			case hxTS.expr_FloatBinaryExpr:
			case hxTS.expr_StrCatExpr:
			case hxTS.expr_StrEqExpr: {
				let expr = stmt as hxTS.expr_BinaryExpr;
				return sha256(`${this.hashStmt(expr.left)}${expr.op.lexeme}${this.hashStmt(expr.right)}`);
			}
			case hxTS.expr_ConditionalExpr: {
				let expr = stmt as hxTS.expr_ConditionalExpr;
				return sha256(`${this.hashStmt(expr.condition)} ? ${this.hashStmt(expr.trueExpr)} : ${this.hashStmt(expr.falseExpr)}`);
			}
			case hxTS.expr_CommaCatExpr: {
				let expr = stmt as hxTS.expr_CommaCatExpr;
				return sha256(`${this.hashStmt(expr.left)},${this.hashStmt(expr.right)}`);
			}
			case hxTS.expr_AssignExpr: {
				let expr = stmt as hxTS.expr_AssignExpr;
				return sha256(`${this.hashStmt(expr.varExpr)} = ${this.hashStmt(expr.expr)}`);
			}
			case hxTS.expr_AssignOpExpr: {
				let expr = stmt as hxTS.expr_AssignOpExpr;
				expr.getAssignOpTypeOp(); // fix ++/--;
				return sha256(`${this.hashStmt(expr.varExpr)} ${expr.op.lexeme} ${this.hashStmt(expr.expr)}`);
			}
			case hxTS.expr_VarExpr: {
				let expr = stmt as hxTS.expr_VarExpr;
				if (expr.arrayIndex == null) return sha256(expr.name.lexeme.toLowerCase());
				return sha256(`${expr.name.lexeme.toLowerCase()}[${this.hashStmt(expr.arrayIndex)}]`);
			}
			case hxTS.expr_SlotAccessExpr: {
				let expr = stmt as hxTS.expr_SlotAccessExpr;
				let objHash = expr.objectExpr == null ? 'null' : this.hashStmt(expr.objectExpr);
				if (expr.arrayExpr == null) return sha256(`${objHash}.${expr.slotName.lexeme.toLowerCase()}`);
				return sha256(`${objHash}[${this.hashStmt(expr.arrayExpr)}].${expr.slotName.lexeme.toLowerCase()}`);
			}
			case hxTS.expr_SlotAssignExpr: {
				let expr = stmt as hxTS.expr_SlotAssignExpr;
				let objHash = expr.objectExpr == null ? 'null' : this.hashStmt(expr.objectExpr);
				if (expr.arrayExpr == null) return sha256(`${objHash}.${expr.slotName.lexeme.toLowerCase()} = ${this.hashStmt(expr.expr)}`);
				return sha256(`${objHash}[${this.hashStmt(expr.arrayExpr)}].${expr.slotName.lexeme.toLowerCase()} = ${this.hashStmt(expr.expr)}`);
			}
			case hxTS.expr_SlotAssignOpExpr: {
				let expr = stmt as hxTS.expr_SlotAssignOpExpr;
				expr.getAssignOpTypeOp(); // fix ++/--;
				let objHash = expr.objectExpr == null ? 'null' : this.hashStmt(expr.objectExpr);
				if (expr.arrayExpr == null) return sha256(`${objHash}.${expr.slotName.lexeme.toLowerCase()} ${expr.op.lexeme} ${this.hashStmt(expr.expr)}`);
				return sha256(`${objHash}[${this.hashStmt(expr.arrayExpr)}].${expr.slotName.lexeme.toLowerCase()} ${expr.op.lexeme} ${this.hashStmt(expr.expr)}`);
			}
			case hxTS.expr_IfStmt: {
				let ifStmt = stmt as hxTS.expr_IfStmt;
				let bodyHash = ifStmt.body.map(x => this.hashStmt(x)).join('');
				let condHash = this.hashStmt(ifStmt.condition);
				let elseHash = ifStmt.elseBlock != null ? ifStmt.elseBlock.map(x => this.hashStmt(x)).join('') : '';
				return sha256(`if (${condHash}) { ${bodyHash} } else { ${elseHash} }`);
			}
			case hxTS.expr_LoopStmt: {
				let loopStmt = stmt as hxTS.expr_LoopStmt;
				let initHash = loopStmt.init != null ? this.hashStmt(loopStmt.init) : '';
				let condHash = this.hashStmt(loopStmt.condition);
				let endHash = loopStmt.end != null ? this.hashStmt(loopStmt.end) : '';
				let bodyHash = loopStmt.body.map(x => this.hashStmt(x)).join('');
				return sha256(`for (${initHash}; ${condHash}; ${endHash}) { ${bodyHash} }`);
			}
			case hxTS.expr_FuncCallExpr: {
				let expr = stmt as hxTS.expr_FuncCallExpr;
				let argsHash = expr.args.map(x => this.hashStmt(x)).join(',');
				if (expr.callType === 0) {
					return sha256(`${expr.namespace != null ? expr.namespace.lexeme.toLowerCase() + '::' : ''}${expr.name.lexeme.toLowerCase()}(${argsHash})`);
				}
				if (expr.callType === 1) return sha256(`.${expr.name.lexeme.toLowerCase()}(${argsHash})`);
				return sha256(`Parent::${expr.name.lexeme.toLowerCase()}(${argsHash})`);
			}
			case hxTS.expr_FunctionDeclStmt: {
				let decl = stmt as hxTS.expr_FunctionDeclStmt;
				let argsHash = decl.args.map(x => x.name.lexeme.toLowerCase()).join(',');
				let qualifiedName = (decl.packageName != null ? decl.packageName.lexeme.toLowerCase() : '') + '::'
					+ (decl.namespace != null ? decl.namespace.lexeme.toLowerCase() : '') + '::'
					+ decl.functionName.lexeme.toLowerCase();
				let bodyHash = decl.stmts.map(x => this.hashStmt(x)).join('');
				return sha256(`function ${qualifiedName}(${argsHash}) { ${bodyHash} }`);
			}
			case hxTS.expr_ObjectDeclExpr: {
				let decl = stmt as hxTS.expr_ObjectDeclExpr;
				// The MissionInfo is left out so that editing it doesn't change the hash
				if (decl.objectNameExpr.print(0, false).toLowerCase() === 'missioninfo') return '';

				let objNameHash = this.hashStmt(decl.objectNameExpr);
				let argsHash = decl.args.map(x => this.hashStmt(x)).join(',');
				let parentObject = decl.parentObject != null ? decl.parentObject.lexeme.toLowerCase() : '';
				let classNameHash = this.hashStmt(decl.className);
				// Order-independent
				let slotHashes = decl.slotDecls.map(x => this.hashStmt(x)).sort().join('');
				let subObjectHashes = decl.subObjects.map(x => this.hashStmt(x)).sort().join('');
				return sha256(`${decl.structDecl ? 'datablock' : 'new'} ${parentObject}::${classNameHash}(${objNameHash}, ${argsHash}) { ${slotHashes} ${subObjectHashes} }`);
			}
			default: throw new Error(`Can't hash ${stmt.constructor.name}.`);
		}
	}
}

function sha256(text: string) {
	return crypto.createHash('sha256').update(text).digest('base64');
}
