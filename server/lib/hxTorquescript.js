var $hx_exports = typeof exports != "undefined" ? exports : typeof window != "undefined" ? window : typeof self != "undefined" ? self : this;
(function ($global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); },$hxEnums = $hxEnums || {},$_;
class CodeBlock {
	constructor(vm,fileName) {
		this.addedFunctions = false;
		this.resolveFuncMap = new haxe_ds_IntMap();
		this.resolveFuncId = 0;
		this.identMapSize = 1;
		let _g = new haxe_ds_IntMap();
		_g.h[0] = null;
		this.identMap = _g;
		this.opCodeLookup = new haxe_ds_IntMap();
		this.lineBreakPairs = [];
		this.codeStream = [];
		this.functionFloatTable = [];
		this.globalFloatTable = [];
		this.vm = vm;
		this.fileName = fileName;
		let _g1 = new haxe_ds_IntMap();
		_g1.h[0] = "FuncDecl";
		_g1.h[1] = "CreateObject";
		_g1.h[2] = "CreateDataBlock";
		_g1.h[3] = "NameObject";
		_g1.h[4] = "AddObject";
		_g1.h[5] = "EndObject";
		_g1.h[6] = "JmpIffNot";
		_g1.h[7] = "JmpIfNot";
		_g1.h[8] = "JmpIff";
		_g1.h[9] = "JmpIf";
		_g1.h[10] = "JmpIfNotNP";
		_g1.h[11] = "JmpIfNP";
		_g1.h[12] = "Jmp";
		_g1.h[13] = "Return";
		_g1.h[14] = "CmpEQ";
		_g1.h[15] = "CmpGT";
		_g1.h[16] = "CmpGE";
		_g1.h[17] = "CmpLT";
		_g1.h[18] = "CmpLE";
		_g1.h[19] = "CmpNE";
		_g1.h[20] = "Xor";
		_g1.h[21] = "Mod";
		_g1.h[22] = "BitAnd";
		_g1.h[23] = "BitOr";
		_g1.h[24] = "Not";
		_g1.h[25] = "NotF";
		_g1.h[26] = "OnesComplement";
		_g1.h[27] = "Shr";
		_g1.h[28] = "Shl";
		_g1.h[29] = "And";
		_g1.h[30] = "Or";
		_g1.h[31] = "Add";
		_g1.h[32] = "Sub";
		_g1.h[33] = "Mul";
		_g1.h[34] = "Div";
		_g1.h[35] = "Neg";
		_g1.h[36] = "SetCurVar";
		_g1.h[37] = "SetCurVarCreate";
		_g1.h[38] = "SetCurVarArray";
		_g1.h[39] = "SetCurVarArrayCreate";
		_g1.h[40] = "LoadVarUInt";
		_g1.h[41] = "LoadVarFlt";
		_g1.h[42] = "LoadVarStr";
		_g1.h[43] = "SaveVarUInt";
		_g1.h[44] = "SaveVarFlt";
		_g1.h[45] = "SaveVarStr";
		_g1.h[46] = "SetCurObject";
		_g1.h[47] = "SetCurObjectNew";
		_g1.h[48] = "SetCurField";
		_g1.h[49] = "SetCurFieldArray";
		_g1.h[50] = "LoadFieldUInt";
		_g1.h[51] = "LoadFieldFlt";
		_g1.h[52] = "LoadFieldStr";
		_g1.h[53] = "SaveFieldUInt";
		_g1.h[54] = "SaveFieldFlt";
		_g1.h[55] = "SaveFieldStr";
		_g1.h[56] = "StrToUInt";
		_g1.h[57] = "StrToFlt";
		_g1.h[58] = "StrToNone";
		_g1.h[59] = "FltToUInt";
		_g1.h[60] = "FltToStr";
		_g1.h[61] = "FltToNone";
		_g1.h[62] = "UIntToFlt";
		_g1.h[63] = "UIntToStr";
		_g1.h[64] = "UIntToNone";
		_g1.h[65] = "LoadImmedUInt";
		_g1.h[66] = "LoadImmedFlt";
		_g1.h[67] = "TagToStr";
		_g1.h[68] = "LoadImmedStr";
		_g1.h[69] = "LoadImmedIdent";
		_g1.h[70] = "CallFuncResolve";
		_g1.h[71] = "CallFunc";
		_g1.h[72] = "ProcessArgs";
		_g1.h[73] = "AdvanceStr";
		_g1.h[74] = "AdvanceStrAppendChar";
		_g1.h[75] = "AdvanceStrComma";
		_g1.h[76] = "AdvanceStrNul";
		_g1.h[77] = "RewindStr";
		_g1.h[78] = "TerminateRewindStr";
		_g1.h[79] = "CompareStr";
		_g1.h[80] = "Push";
		_g1.h[81] = "PushFrame";
		_g1.h[82] = "Break";
		_g1.h[83] = "Invalid";
		this.opCodeLookup = _g1;
	}
	loadFromData(bytes) {
		this.load(new haxe_io_BytesInput(bytes.getBytes()));
	}
	load(inData) {
		this.dsoVersion = inData.readInt32();
		if(this.dsoVersion != 33) {
			throw new haxe_Exception("Incorrect DSO version: " + this.dsoVersion);
		}
		let stSize = inData.readInt32();
		this.globalStringTable = "";
		let _g = 0;
		let _g1 = stSize;
		while(_g < _g1) {
			let i = _g++;
			let tmp = this;
			let tmp1 = tmp.globalStringTable;
			let code = inData.readByte();
			tmp.globalStringTable = tmp1 + String.fromCodePoint(code);
		}
		let size = inData.readInt32();
		let _g2 = 0;
		let _g3 = size;
		while(_g2 < _g3) {
			let i = _g2++;
			this.globalFloatTable.push(inData.readDouble());
		}
		let stSize1 = inData.readInt32();
		this.functionStringTable = "";
		let _g4 = 0;
		let _g5 = stSize1;
		while(_g4 < _g5) {
			let i = _g4++;
			let tmp = this;
			let tmp1 = tmp.functionStringTable;
			let code = inData.readByte();
			tmp.functionStringTable = tmp1 + String.fromCodePoint(code);
		}
		size = inData.readInt32();
		let _g6 = 0;
		let _g7 = size;
		while(_g6 < _g7) {
			let i = _g6++;
			this.functionFloatTable.push(inData.readDouble());
		}
		let codeSize = inData.readInt32();
		let lineBreakPairCount = inData.readInt32();
		let _g8 = 0;
		let _g9 = codeSize;
		while(_g8 < _g9) {
			let i = _g8++;
			let curByte = inData.readByte();
			if(curByte == 255) {
				this.codeStream.push(inData.readInt32());
			} else {
				this.codeStream.push(curByte);
			}
		}
		let _g10 = 0;
		let _g11 = lineBreakPairCount * 2;
		while(_g10 < _g11) {
			let i = _g10++;
			this.lineBreakPairs.push(inData.readInt32());
		}
		let identTable = new IdentTable();
		identTable.read(inData);
		let map = identTable.identMap;
		let _g12_map = map;
		let _g12_keys = map.keys();
		while(_g12_keys.hasNext()) {
			let key = _g12_keys.next();
			let _g13_value = _g12_map.get(key);
			let _g13_key = key;
			let ident = _g13_key;
			let offsets = _g13_value;
			let identStr = this.getStringTableValue(this.globalStringTable,ident);
			let identId = this.identMapSize;
			let _g = 0;
			while(_g < offsets.length) {
				let offset = offsets[_g];
				++_g;
				this.codeStream[offset] = this.identMapSize;
			}
			this.identMap.h[identId] = identStr;
			this.identMapSize++;
		}
	}
	getStringTableValue(table,offset) {
		return HxOverrides.substr(table,offset,table.indexOf("\x00",offset) - offset);
	}
	exec(ip,functionName,namespace,fnArgs,noCalls,packageName) {
		let currentStringTable = null;
		let currentFloatTable = null;
		this.vm.STR.clearFunctionOffset();
		let thisFunctionName = null;
		let argc = fnArgs.length;
		if(fnArgs.length != 0) {
			let fnArgc = this.codeStream[ip + 5];
			thisFunctionName = this.identMap.h[this.codeStream[ip]];
			argc = Math.min(fnArgs.length - 1,fnArgc);
			if(this.vm.traceOn) {
				Log.print("Entering ");
				if(packageName != null) {
					Log.print("[" + packageName + "] ");
				}
				if(namespace != null && namespace.name != null) {
					Log.print("" + namespace.name + "::" + thisFunctionName + "(");
				} else {
					Log.print("" + thisFunctionName + "(");
				}
				let _g = 0;
				let _g1 = argc;
				while(_g < _g1) {
					let i = _g++;
					Log.print("" + fnArgs[i]);
					if(i != argc - 1) {
						Log.print(", ");
					}
				}
				Log.println(")");
			}
			this.vm.evalState.pushFrame(thisFunctionName,namespace);
			let _g = 0;
			let _g1 = argc;
			while(_g < _g1) {
				let i = _g++;
				let varName = this.identMap.h[this.codeStream[ip + 6 + i]];
				this.vm.evalState.setCurVarNameCreate(varName);
				this.vm.evalState.setStringVariable(fnArgs[i + 1]);
			}
			ip += 6 + fnArgc;
			currentFloatTable = this.functionFloatTable;
			currentStringTable = this.functionStringTable;
		} else {
			currentFloatTable = this.globalFloatTable;
			currentStringTable = this.globalStringTable;
		}
		let curField = null;
		let curFieldArrayIndex = null;
		let currentNewObject = null;
		let curObject = null;
		let objParent = null;
		let breakContinue = false;
		let breakContinueIns = 83;
		let failJump = 0;
		let callArgs = [];
		let saveObj = null;
		_hx_loop3: while(true) {
			let instruction = !breakContinue ? this.codeStream[ip++] : breakContinueIns;
			if(breakContinue) {
				breakContinue = false;
			}
			switch(instruction) {
			case 0:
				if(!noCalls) {
					let fnName = this.identMap.h[this.codeStream[ip]];
					let fnNamespace = this.identMap.h[this.codeStream[ip + 1]];
					let pkg = this.identMap.h[this.codeStream[ip + 2]];
					let hasBody = this.codeStream[ip + 3] == 1;
					let nmspc = null;
					let _g = 0;
					let _g1 = this.vm.namespaces;
					while(_g < _g1.length) {
						let n = _g1[_g];
						++_g;
						if(n.name == fnNamespace && n.pkg == pkg) {
							nmspc = n;
							break;
						}
					}
					if(nmspc == null) {
						nmspc = new console_Namespace(fnNamespace,pkg,null);
						this.vm.namespaces.push(nmspc);
					}
					nmspc.addFunction(fnName,hasBody ? ip : 0,this);
					this.addedFunctions = true;
				}
				ip = this.codeStream[ip + 4];
				break;
			case 1:
				if(noCalls) {
					ip = failJump;
				}
				objParent = this.identMap.h[this.codeStream[ip]];
				let datablock = this.codeStream[ip + 1] == 1;
				failJump = this.codeStream[ip + 2];
				callArgs = this.vm.STR.getArgs("");
				currentNewObject = null;
				if(datablock) {
					let db = this.vm.dataBlocks.h[callArgs[2]];
					if(db != null) {
						if(db.getClassName().toLowerCase() == callArgs[1].toLowerCase()) {
							Log.println("Cannot re-declare data block " + callArgs[1] + " with a different class.");
							ip = failJump;
							continue;
						}
						currentNewObject = db;
					}
				}
				if(currentNewObject == null) {
					if(!datablock) {
						if(!Object.prototype.hasOwnProperty.call(console_ConsoleObjectConstructors.constructorMap.h,callArgs[1])) {
							Log.println("Unable to instantantiate non con-object class " + callArgs[1]);
							ip = failJump;
							continue;
						}
						currentNewObject = console_ConsoleObjectConstructors.constructorMap.h[callArgs[1]]();
					} else {
						currentNewObject = new console_SimDataBlock();
						currentNewObject.className = callArgs[1];
					}
					currentNewObject.assignId(datablock ? this.vm.nextDatablockId++ : this.vm.nextSimId++);
					if(objParent != null) {
						let parent = this.vm.simObjects.h[objParent];
						if(parent != null) {
							currentNewObject.assignFieldsFrom(parent);
						} else {
							Log.println("Parent object " + objParent + " for " + callArgs[1] + " does not exist.");
						}
					}
					if(callArgs.length > 2) {
						currentNewObject.name = callArgs[2];
					}
					if(callArgs.length > 3) {
						if(!currentNewObject.processArguments(callArgs.slice(3))) {
							currentNewObject = null;
							ip = failJump;
							continue;
						}
					}
				}
				ip += 3;
				break;
			case 2:
				break;
			case 3:
				break;
			case 4:
				let root = this.codeStream[ip++] == 1;
				let added = false;
				if(!Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,currentNewObject.name)) {
					added = true;
					let this1 = this.vm.simObjects;
					let key = currentNewObject.getName();
					this1.h[key] = currentNewObject;
				}
				this.vm.idMap.h[currentNewObject.id] = currentNewObject;
				currentNewObject.register(this.vm);
				let datablock1 = ((currentNewObject) instanceof console_SimDataBlock) ? currentNewObject : null;
				if(datablock1 != null) {
					if(!datablock1.preload()) {
						Log.println("Datablock " + datablock1.getName() + " failed to preload.");
						ip = failJump;
						this.vm.idMap.remove(currentNewObject.id);
						if(added) {
							let this1 = this.vm.simObjects;
							let key = currentNewObject.getName();
							let _this = this1;
							if(Object.prototype.hasOwnProperty.call(_this.h,key)) {
								delete(_this.h[key]);
							}
						}
						continue;
					} else {
						let this1 = this.vm.dataBlocks;
						let key = currentNewObject.getName();
						this1.h[key] = datablock1;
					}
				}
				let _this = this.vm.intStack;
				let groupAddId = _this.head == null ? null : _this.head.elt;
				if(!root || currentNewObject.group == null) {
					if(root) {
						this.vm.rootGroup.addObject(currentNewObject);
					} else if(this.vm.idMap.h[groupAddId] != null) {
						if(((currentNewObject) instanceof console_SimGroup) || ((currentNewObject) instanceof console_SimSet)) {
							(js_Boot.__cast(this.vm.idMap.h[groupAddId] , console_SimSet)).addObject(currentNewObject);
						} else {
							this.vm.rootGroup.addObject(currentNewObject);
						}
					} else {
						this.vm.rootGroup.addObject(currentNewObject);
					}
				}
				if(root) {
					let _this = this.vm.intStack;
					let k = _this.head;
					if(k != null) {
						_this.head = k.next;
					}
				}
				let _this1 = this.vm.intStack;
				_this1.head = new haxe_ds_GenericCell(currentNewObject.id,_this1.head);
				break;
			case 5:
				let root1 = this.codeStream[ip++] > 0;
				if(!root1) {
					let _this = this.vm.intStack;
					let k = _this.head;
					if(k != null) {
						_this.head = k.next;
					}
				}
				break;
			case 6:
				let _this2 = this.vm.floatStack;
				let k = _this2.head;
				let tmp;
				if(k == null) {
					tmp = null;
				} else {
					_this2.head = k.next;
					tmp = k.elt;
				}
				if(tmp > 0) {
					++ip;
				} else {
					ip = this.codeStream[ip];
				}
				break;
			case 7:
				let _this3 = this.vm.intStack;
				let k1 = _this3.head;
				let tmp1;
				if(k1 == null) {
					tmp1 = null;
				} else {
					_this3.head = k1.next;
					tmp1 = k1.elt;
				}
				if(tmp1 > 0) {
					++ip;
				} else {
					ip = this.codeStream[ip];
				}
				break;
			case 8:
				let _this4 = this.vm.floatStack;
				let k2 = _this4.head;
				let tmp2;
				if(k2 == null) {
					tmp2 = null;
				} else {
					_this4.head = k2.next;
					tmp2 = k2.elt;
				}
				if(tmp2 <= 0) {
					++ip;
				} else {
					ip = this.codeStream[ip];
				}
				break;
			case 9:
				let _this5 = this.vm.intStack;
				let k3 = _this5.head;
				let tmp3;
				if(k3 == null) {
					tmp3 = null;
				} else {
					_this5.head = k3.next;
					tmp3 = k3.elt;
				}
				if(tmp3 <= 0) {
					++ip;
				} else {
					ip = this.codeStream[ip];
				}
				break;
			case 10:
				let _this6 = this.vm.intStack;
				if((_this6.head == null ? null : _this6.head.elt) > 0) {
					let _this = this.vm.intStack;
					let k = _this.head;
					if(k != null) {
						_this.head = k.next;
					}
					++ip;
				} else {
					ip = this.codeStream[ip];
				}
				break;
			case 11:
				let _this7 = this.vm.intStack;
				if((_this7.head == null ? null : _this7.head.elt) <= 0) {
					let _this = this.vm.intStack;
					let k = _this.head;
					if(k != null) {
						_this.head = k.next;
					}
					++ip;
				} else {
					ip = this.codeStream[ip];
				}
				break;
			case 12:
				ip = this.codeStream[ip];
				break;
			case 13:
				break _hx_loop3;
			case 14:
				let _this8 = this.vm.intStack;
				let _this9 = this.vm.floatStack;
				let k4 = _this9.head;
				let item;
				if(k4 == null) {
					item = null;
				} else {
					_this9.head = k4.next;
					item = k4.elt;
				}
				let _this10 = this.vm.floatStack;
				let k5 = _this10.head;
				let item1;
				if(k5 == null) {
					item1 = null;
				} else {
					_this10.head = k5.next;
					item1 = k5.elt;
				}
				_this8.head = new haxe_ds_GenericCell(item == item1 ? 1 : 0,_this8.head);
				break;
			case 15:
				let _this11 = this.vm.intStack;
				let _this12 = this.vm.floatStack;
				let k6 = _this12.head;
				let item2;
				if(k6 == null) {
					item2 = null;
				} else {
					_this12.head = k6.next;
					item2 = k6.elt;
				}
				let _this13 = this.vm.floatStack;
				let k7 = _this13.head;
				let item3;
				if(k7 == null) {
					item3 = null;
				} else {
					_this13.head = k7.next;
					item3 = k7.elt;
				}
				_this11.head = new haxe_ds_GenericCell(item2 > item3 ? 1 : 0,_this11.head);
				break;
			case 16:
				let _this14 = this.vm.intStack;
				let _this15 = this.vm.floatStack;
				let k8 = _this15.head;
				let item4;
				if(k8 == null) {
					item4 = null;
				} else {
					_this15.head = k8.next;
					item4 = k8.elt;
				}
				let _this16 = this.vm.floatStack;
				let k9 = _this16.head;
				let item5;
				if(k9 == null) {
					item5 = null;
				} else {
					_this16.head = k9.next;
					item5 = k9.elt;
				}
				_this14.head = new haxe_ds_GenericCell(item4 >= item5 ? 1 : 0,_this14.head);
				break;
			case 17:
				let _this17 = this.vm.intStack;
				let _this18 = this.vm.floatStack;
				let k10 = _this18.head;
				let item6;
				if(k10 == null) {
					item6 = null;
				} else {
					_this18.head = k10.next;
					item6 = k10.elt;
				}
				let _this19 = this.vm.floatStack;
				let k11 = _this19.head;
				let item7;
				if(k11 == null) {
					item7 = null;
				} else {
					_this19.head = k11.next;
					item7 = k11.elt;
				}
				_this17.head = new haxe_ds_GenericCell(item6 < item7 ? 1 : 0,_this17.head);
				break;
			case 18:
				let _this20 = this.vm.intStack;
				let _this21 = this.vm.floatStack;
				let k12 = _this21.head;
				let item8;
				if(k12 == null) {
					item8 = null;
				} else {
					_this21.head = k12.next;
					item8 = k12.elt;
				}
				let _this22 = this.vm.floatStack;
				let k13 = _this22.head;
				let item9;
				if(k13 == null) {
					item9 = null;
				} else {
					_this22.head = k13.next;
					item9 = k13.elt;
				}
				_this20.head = new haxe_ds_GenericCell(item8 <= item9 ? 1 : 0,_this20.head);
				break;
			case 19:
				let _this23 = this.vm.intStack;
				let _this24 = this.vm.floatStack;
				let k14 = _this24.head;
				let item10;
				if(k14 == null) {
					item10 = null;
				} else {
					_this24.head = k14.next;
					item10 = k14.elt;
				}
				let _this25 = this.vm.floatStack;
				let k15 = _this25.head;
				let item11;
				if(k15 == null) {
					item11 = null;
				} else {
					_this25.head = k15.next;
					item11 = k15.elt;
				}
				_this23.head = new haxe_ds_GenericCell(item10 != item11 ? 1 : 0,_this23.head);
				break;
			case 20:
				let _this26 = this.vm.intStack;
				let _this27 = this.vm.intStack;
				let k16 = _this27.head;
				let item12;
				if(k16 == null) {
					item12 = null;
				} else {
					_this27.head = k16.next;
					item12 = k16.elt;
				}
				let _this28 = this.vm.intStack;
				let k17 = _this28.head;
				let item13;
				if(k17 == null) {
					item13 = null;
				} else {
					_this28.head = k17.next;
					item13 = k17.elt;
				}
				_this26.head = new haxe_ds_GenericCell(item12 ^ item13,_this26.head);
				break;
			case 21:
				let _this29 = this.vm.intStack;
				let _this30 = this.vm.intStack;
				let k18 = _this30.head;
				let item14;
				if(k18 == null) {
					item14 = null;
				} else {
					_this30.head = k18.next;
					item14 = k18.elt;
				}
				let _this31 = this.vm.intStack;
				let k19 = _this31.head;
				let item15;
				if(k19 == null) {
					item15 = null;
				} else {
					_this31.head = k19.next;
					item15 = k19.elt;
				}
				_this29.head = new haxe_ds_GenericCell(item14 % item15,_this29.head);
				break;
			case 22:
				let _this32 = this.vm.intStack;
				let _this33 = this.vm.intStack;
				let k20 = _this33.head;
				let item16;
				if(k20 == null) {
					item16 = null;
				} else {
					_this33.head = k20.next;
					item16 = k20.elt;
				}
				let _this34 = this.vm.intStack;
				let k21 = _this34.head;
				let item17;
				if(k21 == null) {
					item17 = null;
				} else {
					_this34.head = k21.next;
					item17 = k21.elt;
				}
				_this32.head = new haxe_ds_GenericCell(item16 & item17,_this32.head);
				break;
			case 23:
				let _this35 = this.vm.intStack;
				let _this36 = this.vm.intStack;
				let k22 = _this36.head;
				let item18;
				if(k22 == null) {
					item18 = null;
				} else {
					_this36.head = k22.next;
					item18 = k22.elt;
				}
				let _this37 = this.vm.intStack;
				let k23 = _this37.head;
				let item19;
				if(k23 == null) {
					item19 = null;
				} else {
					_this37.head = k23.next;
					item19 = k23.elt;
				}
				_this35.head = new haxe_ds_GenericCell(item18 | item19,_this35.head);
				break;
			case 24:
				let _this38 = this.vm.intStack;
				let _this39 = this.vm.intStack;
				let k24 = _this39.head;
				let item20;
				if(k24 == null) {
					item20 = null;
				} else {
					_this39.head = k24.next;
					item20 = k24.elt;
				}
				_this38.head = new haxe_ds_GenericCell(item20 > 0 ? 0 : 1,_this38.head);
				break;
			case 25:
				let _this40 = this.vm.intStack;
				let _this41 = this.vm.floatStack;
				let k25 = _this41.head;
				let item21;
				if(k25 == null) {
					item21 = null;
				} else {
					_this41.head = k25.next;
					item21 = k25.elt;
				}
				_this40.head = new haxe_ds_GenericCell(item21 > 0 ? 0 : 1,_this40.head);
				break;
			case 26:
				let _this42 = this.vm.intStack;
				let _this43 = this.vm.intStack;
				let k26 = _this43.head;
				let item22;
				if(k26 == null) {
					item22 = null;
				} else {
					_this43.head = k26.next;
					item22 = k26.elt;
				}
				_this42.head = new haxe_ds_GenericCell(~item22,_this42.head);
				break;
			case 27:
				let _this44 = this.vm.intStack;
				let _this45 = this.vm.intStack;
				let k27 = _this45.head;
				let item23;
				if(k27 == null) {
					item23 = null;
				} else {
					_this45.head = k27.next;
					item23 = k27.elt;
				}
				let _this46 = this.vm.intStack;
				let k28 = _this46.head;
				let item24;
				if(k28 == null) {
					item24 = null;
				} else {
					_this46.head = k28.next;
					item24 = k28.elt;
				}
				_this44.head = new haxe_ds_GenericCell(item23 >> item24,_this44.head);
				break;
			case 28:
				let _this47 = this.vm.intStack;
				let _this48 = this.vm.intStack;
				let k29 = _this48.head;
				let item25;
				if(k29 == null) {
					item25 = null;
				} else {
					_this48.head = k29.next;
					item25 = k29.elt;
				}
				let _this49 = this.vm.intStack;
				let k30 = _this49.head;
				let item26;
				if(k30 == null) {
					item26 = null;
				} else {
					_this49.head = k30.next;
					item26 = k30.elt;
				}
				_this47.head = new haxe_ds_GenericCell(item25 << item26,_this47.head);
				break;
			case 29:
				let _this50 = this.vm.intStack;
				let item27;
				let _this51 = this.vm.intStack;
				let k31 = _this51.head;
				let item28;
				if(k31 == null) {
					item28 = null;
				} else {
					_this51.head = k31.next;
					item28 = k31.elt;
				}
				if(item28 > 0) {
					let _this = this.vm.intStack;
					let k = _this.head;
					let item;
					if(k == null) {
						item = null;
					} else {
						_this.head = k.next;
						item = k.elt;
					}
					item27 = item > 0;
				} else {
					item27 = false;
				}
				_this50.head = new haxe_ds_GenericCell(item27 ? 1 : 0,_this50.head);
				break;
			case 30:
				let _this52 = this.vm.intStack;
				let item29;
				let _this53 = this.vm.intStack;
				let k32 = _this53.head;
				let item30;
				if(k32 == null) {
					item30 = null;
				} else {
					_this53.head = k32.next;
					item30 = k32.elt;
				}
				if(item30 <= 0) {
					let _this = this.vm.intStack;
					let k = _this.head;
					let item;
					if(k == null) {
						item = null;
					} else {
						_this.head = k.next;
						item = k.elt;
					}
					item29 = item > 0;
				} else {
					item29 = true;
				}
				_this52.head = new haxe_ds_GenericCell(item29 ? 1 : 0,_this52.head);
				break;
			case 31:
				let _this54 = this.vm.floatStack;
				let _this55 = this.vm.floatStack;
				let k33 = _this55.head;
				let item31;
				if(k33 == null) {
					item31 = null;
				} else {
					_this55.head = k33.next;
					item31 = k33.elt;
				}
				let _this56 = this.vm.floatStack;
				let k34 = _this56.head;
				let item32;
				if(k34 == null) {
					item32 = null;
				} else {
					_this56.head = k34.next;
					item32 = k34.elt;
				}
				_this54.head = new haxe_ds_GenericCell(item31 + item32,_this54.head);
				break;
			case 32:
				let _this57 = this.vm.floatStack;
				let _this58 = this.vm.floatStack;
				let k35 = _this58.head;
				let item33;
				if(k35 == null) {
					item33 = null;
				} else {
					_this58.head = k35.next;
					item33 = k35.elt;
				}
				let _this59 = this.vm.floatStack;
				let k36 = _this59.head;
				let item34;
				if(k36 == null) {
					item34 = null;
				} else {
					_this59.head = k36.next;
					item34 = k36.elt;
				}
				_this57.head = new haxe_ds_GenericCell(item33 - item34,_this57.head);
				break;
			case 33:
				let _this60 = this.vm.floatStack;
				let _this61 = this.vm.floatStack;
				let k37 = _this61.head;
				let item35;
				if(k37 == null) {
					item35 = null;
				} else {
					_this61.head = k37.next;
					item35 = k37.elt;
				}
				let _this62 = this.vm.floatStack;
				let k38 = _this62.head;
				let item36;
				if(k38 == null) {
					item36 = null;
				} else {
					_this62.head = k38.next;
					item36 = k38.elt;
				}
				_this60.head = new haxe_ds_GenericCell(item35 * item36,_this60.head);
				break;
			case 34:
				let _this63 = this.vm.floatStack;
				let _this64 = this.vm.floatStack;
				let k39 = _this64.head;
				let item37;
				if(k39 == null) {
					item37 = null;
				} else {
					_this64.head = k39.next;
					item37 = k39.elt;
				}
				let _this65 = this.vm.floatStack;
				let k40 = _this65.head;
				let item38;
				if(k40 == null) {
					item38 = null;
				} else {
					_this65.head = k40.next;
					item38 = k40.elt;
				}
				_this63.head = new haxe_ds_GenericCell(item37 / item38,_this63.head);
				break;
			case 35:
				let _this66 = this.vm.floatStack;
				let _this67 = this.vm.floatStack;
				let k41 = _this67.head;
				let item39;
				if(k41 == null) {
					item39 = null;
				} else {
					_this67.head = k41.next;
					item39 = k41.elt;
				}
				_this66.head = new haxe_ds_GenericCell(-item39,_this66.head);
				break;
			case 36:
				let varName = this.identMap.h[this.codeStream[ip++]];
				this.vm.evalState.setCurVarName(varName);
				break;
			case 37:
				let varName1 = this.identMap.h[this.codeStream[ip++]];
				this.vm.evalState.setCurVarNameCreate(varName1);
				break;
			case 38:
				let varName2 = this.vm.STR.getSTValue();
				this.vm.evalState.setCurVarName(varName2);
				break;
			case 39:
				let varName3 = this.vm.STR.getSTValue();
				this.vm.evalState.setCurVarNameCreate(varName3);
				break;
			case 40:
				let _this68 = this.vm.intStack;
				_this68.head = new haxe_ds_GenericCell(this.vm.evalState.getIntVariable(),_this68.head);
				break;
			case 41:
				let _this69 = this.vm.floatStack;
				_this69.head = new haxe_ds_GenericCell(this.vm.evalState.getFloatVariable(),_this69.head);
				break;
			case 42:
				this.vm.STR.setStringValue(this.vm.evalState.getStringVariable());
				break;
			case 43:
				let _this70 = this.vm.intStack;
				this.vm.evalState.setIntVariable(_this70.head == null ? null : _this70.head.elt);
				break;
			case 44:
				let _this71 = this.vm.floatStack;
				this.vm.evalState.setFloatVariable(_this71.head == null ? null : _this71.head.elt);
				break;
			case 45:
				this.vm.evalState.setStringVariable(this.vm.STR.getSTValue());
				break;
			case 46:
				let this1 = this.vm.simObjects;
				let key = this.vm.STR.getSTValue();
				curObject = this1.h[key];
				if(curObject == null) {
					let this1 = this.vm.idMap;
					let key = Std.parseInt(this.vm.STR.getSTValue());
					curObject = this1.h[key];
				}
				break;
			case 47:
				curObject = currentNewObject;
				break;
			case 48:
				curField = this.identMap.h[this.codeStream[ip++]];
				curFieldArrayIndex = null;
				break;
			case 49:
				curFieldArrayIndex = this.vm.STR.getSTValue();
				break;
			case 50:
				if(curObject != null) {
					let _this = this.vm.intStack;
					_this.head = new haxe_ds_GenericCell(parseFloat(curObject.getDataField(curField,curFieldArrayIndex)),_this.head);
				} else {
					let _this = this.vm.intStack;
					_this.head = new haxe_ds_GenericCell(0,_this.head);
				}
				break;
			case 51:
				if(curObject != null) {
					let _this = this.vm.floatStack;
					_this.head = new haxe_ds_GenericCell(parseFloat(curObject.getDataField(curField,curFieldArrayIndex)),_this.head);
				} else {
					let _this = this.vm.floatStack;
					_this.head = new haxe_ds_GenericCell(0,_this.head);
				}
				break;
			case 52:
				if(curObject != null) {
					this.vm.STR.setStringValue(curObject.getDataField(curField,curFieldArrayIndex));
				} else {
					this.vm.STR.setStringValue("");
				}
				break;
			case 53:
				let _this72 = this.vm.intStack;
				this.vm.STR.setIntValue(_this72.head == null ? null : _this72.head.elt);
				if(curObject != null) {
					curObject.setDataField(curField,curFieldArrayIndex,this.vm.STR.getSTValue());
				}
				break;
			case 54:
				let _this73 = this.vm.floatStack;
				this.vm.STR.setFloatValue(_this73.head == null ? null : _this73.head.elt);
				if(curObject != null) {
					curObject.setDataField(curField,curFieldArrayIndex,this.vm.STR.getSTValue());
				}
				break;
			case 55:
				if(curObject != null) {
					curObject.setDataField(curField,curFieldArrayIndex,this.vm.STR.getSTValue());
				}
				break;
			case 56:
				let _this74 = this.vm.intStack;
				_this74.head = new haxe_ds_GenericCell(this.vm.STR.getIntValue(),_this74.head);
				break;
			case 57:
				let _this75 = this.vm.floatStack;
				_this75.head = new haxe_ds_GenericCell(this.vm.STR.getFloatValue(),_this75.head);
				break;
			case 58:
				break;
			case 59:
				let _this76 = this.vm.intStack;
				let _this77 = this.vm.floatStack;
				let k42 = _this77.head;
				let item40;
				if(k42 == null) {
					item40 = null;
				} else {
					_this77.head = k42.next;
					item40 = k42.elt;
				}
				_this76.head = new haxe_ds_GenericCell(item40,_this76.head);
				break;
			case 60:
				let _this78 = this.vm.floatStack;
				let k43 = _this78.head;
				let tmp4;
				if(k43 == null) {
					tmp4 = null;
				} else {
					_this78.head = k43.next;
					tmp4 = k43.elt;
				}
				this.vm.STR.setFloatValue(tmp4);
				break;
			case 61:
				let _this79 = this.vm.floatStack;
				let k44 = _this79.head;
				if(k44 != null) {
					_this79.head = k44.next;
				}
				break;
			case 62:
				let _this80 = this.vm.floatStack;
				let _this81 = this.vm.intStack;
				let k45 = _this81.head;
				let item41;
				if(k45 == null) {
					item41 = null;
				} else {
					_this81.head = k45.next;
					item41 = k45.elt;
				}
				_this80.head = new haxe_ds_GenericCell(item41,_this80.head);
				break;
			case 63:
				let _this82 = this.vm.intStack;
				let k46 = _this82.head;
				let tmp5;
				if(k46 == null) {
					tmp5 = null;
				} else {
					_this82.head = k46.next;
					tmp5 = k46.elt;
				}
				this.vm.STR.setIntValue(tmp5);
				break;
			case 64:
				let _this83 = this.vm.intStack;
				let k47 = _this83.head;
				if(k47 != null) {
					_this83.head = k47.next;
				}
				break;
			case 65:
				let _this84 = this.vm.intStack;
				_this84.head = new haxe_ds_GenericCell(this.codeStream[ip++],_this84.head);
				break;
			case 66:
				let _this85 = this.vm.floatStack;
				_this85.head = new haxe_ds_GenericCell(currentFloatTable[this.codeStream[ip++]],_this85.head);
				break;
			case 67:
				this.codeStream[ip - 1] = 68;
				if(HxOverrides.cca(this.getStringTableValue(currentStringTable,this.codeStream[ip]),0) != 1) {
					let id = this.vm.taggedStrings.length;
					this.vm.taggedStrings.push(this.getStringTableValue(currentStringTable,this.codeStream[ip]));
					let idStr = "" + id;
					let before = currentStringTable.substring(0,this.codeStream[ip]);
					let after = currentStringTable.substring(this.codeStream[ip] + 8);
					let insert = StringTools.rpad("\x01" + idStr,"\x00",7);
					currentStringTable = before + insert + after;
				}
				break;
			case 68:
				this.vm.STR.setStringValue(this.getStringTableValue(currentStringTable,this.codeStream[ip++]));
				break;
			case 69:
				this.vm.STR.setStringValue(this.identMap.h[this.codeStream[ip++]]);
				break;
			case 70:
				let fnNamespace = this.identMap.h[this.codeStream[ip + 1]];
				let fnName = this.identMap.h[this.codeStream[ip]];
				let nsEntry = this.vm.findFunction(fnNamespace,fnName);
				if(nsEntry == null) {
					ip += 3;
					Log.println("Unable to find function " + fnNamespace + "::" + fnName);
					this.vm.STR.getArgs(fnName);
					continue;
				}
				this.codeStream[ip - 1] = 71;
				this.codeStream[ip + 1] = this.resolveFuncId;
				this.resolveFuncMap.h[this.resolveFuncId] = nsEntry;
				this.resolveFuncId++;
				--ip;
				continue;
			case 71:
				let fnName1 = this.identMap.h[this.codeStream[ip]];
				let callType = this.codeStream[ip + 2];
				ip += 3;
				callArgs = this.vm.STR.getArgs(fnName1);
				let nsEntry1 = null;
				let ns = null;
				if(callType == 0) {
					nsEntry1 = this.resolveFuncMap.h[this.codeStream[ip - 2]];
				} else if(callType == 1) {
					saveObj = this.vm.evalState.thisObject;
					this.vm.evalState.thisObject = this.vm.simObjects.h[callArgs[1]];
					if(this.vm.evalState.thisObject == null) {
						this.vm.evalState.thisObject = this.vm.idMap.h[Std.parseInt(callArgs[1])];
					}
					if(this.vm.evalState.thisObject == null) {
						Log.println("Unable to find object " + callArgs[1] + " attempting to call function " + fnName1);
						continue;
					}
					nsEntry1 = this.vm.findFunction(this.vm.evalState.thisObject.getClassName(),fnName1);
					ns = nsEntry1 != null ? nsEntry1.namespace : null;
				} else if(namespace != null) {
					ns = namespace.parent;
					if(ns != null) {
						nsEntry1 = ns.find(fnName1);
					} else {
						nsEntry1 = null;
					}
				} else {
					ns = null;
					nsEntry1 = null;
				}
				if(nsEntry1 == null || noCalls) {
					if(!noCalls) {
						Log.println("Unable to find function " + fnName1);
					}
					this.vm.STR.setStringValue("");
				}
				let _g = nsEntry1.type;
				if(_g._hx_index == 0) {
					let functionOffset = _g.functionOffset;
					let codeBlock = _g.codeBlock;
					if(functionOffset != 0) {
						codeBlock.exec(functionOffset,fnName1,nsEntry1.namespace,callArgs,false,nsEntry1.pkg);
					} else {
						this.vm.STR.setStringValue("");
					}
				} else {
					let x = _g;
					if(nsEntry1.minArgs > 0 && callArgs.length < nsEntry1.minArgs || nsEntry1.maxArgs > 0 && callArgs.length > nsEntry1.maxArgs) {
						Log.println("Invalid argument count for function " + fnName1);
					} else {
						switch(x._hx_index) {
						case 0:
							let _g1 = x.functionOffset;
							let _g2 = x.codeBlock;
							break;
						case 1:
							let callback = x.callback;
							let vargs = [];
							let _g3 = 0;
							while(_g3 < callArgs.length) {
								let arg = callArgs[_g3];
								++_g3;
								let v = new Variable("param",this.vm);
								v.setStringValue(arg);
								vargs.push(v);
							}
							let ret = callback(vargs);
							if(this.codeStream[ip] == 56) {
								++ip;
								let _this = this.vm.intStack;
								_this.head = new haxe_ds_GenericCell(Std.parseInt(ret),_this.head);
							} else if(this.codeStream[ip] == 57) {
								++ip;
								let _this = this.vm.floatStack;
								_this.head = new haxe_ds_GenericCell(parseFloat(ret),_this.head);
							} else if(this.codeStream[ip] == 58) {
								++ip;
							} else {
								this.vm.STR.setStringValue(ret);
							}
							break;
						case 2:
							let callback1 = x.callback;
							let ret1 = callback1(this.vm,this.vm.evalState.thisObject,callArgs);
							if(this.codeStream[ip] == 56) {
								++ip;
								let _this = this.vm.intStack;
								_this.head = new haxe_ds_GenericCell(ret1,_this.head);
							} else if(this.codeStream[ip] == 57) {
								++ip;
								let _this = this.vm.floatStack;
								_this.head = new haxe_ds_GenericCell(ret1,_this.head);
							} else if(this.codeStream[ip] == 58) {
								++ip;
							} else {
								this.vm.STR.setIntValue(ret1);
							}
							break;
						case 3:
							let callback2 = x.callback;
							let ret2 = callback2(this.vm,this.vm.evalState.thisObject,callArgs);
							if(this.codeStream[ip] == 56) {
								++ip;
								let _this = this.vm.intStack;
								_this.head = new haxe_ds_GenericCell(ret2,_this.head);
							} else if(this.codeStream[ip] == 57) {
								++ip;
								let _this = this.vm.floatStack;
								_this.head = new haxe_ds_GenericCell(ret2,_this.head);
							} else if(this.codeStream[ip] == 58) {
								++ip;
							} else {
								this.vm.STR.setFloatValue(ret2);
							}
							break;
						case 4:
							let callback3 = x.callback;
							let ret3 = callback3(this.vm,this.vm.evalState.thisObject,callArgs);
							if(ret3 != this.vm.STR.getSTValue()) {
								this.vm.STR.setStringValue(ret3);
							} else {
								this.vm.STR.setLen(ret3.length);
							}
							break;
						case 5:
							let callback4 = x.callback;
							callback4(this.vm,this.vm.evalState.thisObject,callArgs);
							if(this.codeStream[ip] != 58) {
								Log.println("Call to " + fnName1 + " uses result of void function call");
							}
							this.vm.STR.setStringValue("");
							break;
						case 6:
							let callback5 = x.callback;
							let ret4 = callback5(this.vm,this.vm.evalState.thisObject,callArgs);
							if(this.codeStream[ip] == 56) {
								++ip;
								let _this = this.vm.intStack;
								_this.head = new haxe_ds_GenericCell(ret4,_this.head);
							} else if(this.codeStream[ip] == 57) {
								++ip;
								let _this = this.vm.floatStack;
								_this.head = new haxe_ds_GenericCell(ret4,_this.head);
							} else if(this.codeStream[ip] == 58) {
								++ip;
							} else {
								this.vm.STR.setIntValue(ret4);
							}
							break;
						}
					}
					if(callType == 1) {
						this.vm.evalState.thisObject = saveObj;
					}
				}
				break;
			case 72:
				break;
			case 73:
				this.vm.STR.advance();
				break;
			case 74:
				this.vm.STR.advanceChar(this.codeStream[ip++]);
				break;
			case 75:
				this.vm.STR.advanceChar(HxOverrides.cca("_",0));
				break;
			case 76:
				this.vm.STR.advanceChar(0);
				break;
			case 77:
				this.vm.STR.rewind();
				break;
			case 78:
				this.vm.STR.rewindTerminate();
				break;
			case 79:
				let _this86 = this.vm.intStack;
				_this86.head = new haxe_ds_GenericCell(this.vm.STR.compare() ? 1 : 0,_this86.head);
				break;
			case 80:
				this.vm.STR.push();
				break;
			case 81:
				this.vm.STR.pushFrame();
				break;
			case 82:
				breakContinue = true;
				breakContinueIns = instruction;
				break;
			case 83:
				break _hx_loop3;
			}
		}
		if(fnArgs.length != 0) {
			this.vm.evalState.popFrame();
			if(this.vm.traceOn) {
				Log.print("Leaving ");
				if(packageName != null) {
					Log.print("[" + packageName + "] ");
				}
				if(namespace != null && namespace.name != null) {
					Log.println("" + namespace.name + "::" + thisFunctionName + "() - return " + this.vm.STR.getSTValue());
				} else {
					Log.println("" + thisFunctionName + "() - return " + this.vm.STR.getSTValue());
				}
			}
		}
		return this.vm.STR.getSTValue();
	}
}
$hx_exports["CodeBlock"] = CodeBlock;
CodeBlock.__name__ = true;
Object.assign(CodeBlock.prototype, {
	__class__: CodeBlock
});
var ConstTable = $hxEnums["ConstTable"] = { __ename__:true,__constructs__:null
	,StringTable: {_hx_name:"StringTable",_hx_index:0,__enum__:"ConstTable",toString:$estr}
	,FloatTable: {_hx_name:"FloatTable",_hx_index:1,__enum__:"ConstTable",toString:$estr}
};
ConstTable.__constructs__ = [ConstTable.StringTable,ConstTable.FloatTable];
var ConstTableType = $hxEnums["ConstTableType"] = { __ename__:true,__constructs__:null
	,Global: {_hx_name:"Global",_hx_index:0,__enum__:"ConstTableType",toString:$estr}
	,Function: {_hx_name:"Function",_hx_index:1,__enum__:"ConstTableType",toString:$estr}
};
ConstTableType.__constructs__ = [ConstTableType.Global,ConstTableType.Function];
class StringTableEntry {
	constructor(s,start,len,tag) {
		this.string = s;
		this.start = start;
		this.len = len;
		this.tag = tag;
	}
}
StringTableEntry.__name__ = true;
Object.assign(StringTableEntry.prototype, {
	__class__: StringTableEntry
});
class StringTable {
	constructor() {
		this.stringToIndex = new haxe_ds_StringMap();
		this.entries = [];
		this.totalLen = 0;
	}
	add(str,caseSens,tag) {
		if(Object.prototype.hasOwnProperty.call(this.stringToIndex.h,caseSens ? str : str.toLowerCase())) {
			return this.stringToIndex.h[caseSens ? str : str.toLowerCase()];
		}
		let len = str.length + 1;
		if(tag && len < 7) {
			len = 7;
		}
		let addEntry = new StringTableEntry(str,this.totalLen,len,tag);
		this.entries.push(addEntry);
		this.totalLen += len;
		this.stringToIndex.h[caseSens ? str : str.toLowerCase()] = addEntry.start;
		return addEntry.start;
	}
	write(bytesData) {
		bytesData.addInt32(this.totalLen);
		let _g = 0;
		let _g1 = this.entries;
		while(_g < _g1.length) {
			let entry = _g1[_g];
			++_g;
			let _g2 = 0;
			let _g3 = entry.string.length;
			while(_g2 < _g3) {
				let c = _g2++;
				bytesData.addByte(HxOverrides.cca(entry.string,c));
			}
			bytesData.addByte(0);
			if(entry.len > entry.string.length) {
				let _g = 0;
				let _g1 = entry.len - entry.string.length - 1;
				while(_g < _g1) {
					let i = _g++;
					bytesData.addByte(0);
				}
			}
		}
	}
	read(bytesInput) {
		this.totalLen = bytesInput.readInt32();
		let currentStr = "";
		let curStrLen = 0;
		let curStrStart = 0;
		let _g = 0;
		let _g1 = this.totalLen;
		while(_g < _g1) {
			let i = _g++;
			let c = bytesInput.readByte();
			if(c == 0) {
				let entry = new StringTableEntry(currentStr,curStrStart,curStrLen + 1,false);
				curStrLen = 0;
				currentStr = "";
				curStrStart = i + 1;
				this.entries.push(entry);
			} else {
				currentStr += String.fromCodePoint(c);
				++curStrLen;
			}
		}
	}
}
StringTable.__name__ = true;
Object.assign(StringTable.prototype, {
	__class__: StringTable
});
class IdentTable {
	constructor() {
		this.ipToIdentMap = new haxe_ds_IntMap();
		this.identMap = new haxe_ds_IntMap();
	}
	add(compiler,ste,ip) {
		let index = compiler.globalStringTable.add(ste,false,false);
		if(this.identMap.h.hasOwnProperty(index)) {
			this.identMap.h[index].push(ip);
		} else {
			this.identMap.h[index] = [ip];
		}
		this.ipToIdentMap.h[ip] = ste;
	}
	write(bytesData) {
		let count = 0;
		let kv = this.identMap.iterator();
		while(kv.hasNext()) {
			let kv1 = kv.next();
			++count;
		}
		bytesData.addInt32(count);
		let map = this.identMap;
		let kv_map = map;
		let kv_keys = map.keys();
		while(kv_keys.hasNext()) {
			let key = kv_keys.next();
			let kv_value = kv_map.get(key);
			let kv_key = key;
			bytesData.addInt32(kv_key);
			bytesData.addInt32(kv_value.length);
			let _g = 0;
			let _g1 = kv_value;
			while(_g < _g1.length) {
				let i = _g1[_g];
				++_g;
				bytesData.addInt32(i);
			}
		}
	}
	read(bytesInput) {
		let count = bytesInput.readInt32();
		let _g = 0;
		let _g1 = count;
		while(_g < _g1) {
			let i = _g++;
			let key = bytesInput.readInt32();
			let len = bytesInput.readInt32();
			let arr = [];
			let _g1 = 0;
			let _g2 = len;
			while(_g1 < _g2) {
				let j = _g1++;
				arr.push(bytesInput.readInt32());
			}
			this.identMap.h[key] = arr;
		}
	}
}
IdentTable.__name__ = true;
Object.assign(IdentTable.prototype, {
	__class__: IdentTable
});
class Compiler {
	constructor() {
		this.functionStringTable = new StringTable();
		this.globalStringTable = new StringTable();
		this.functionFloatTable = [];
		this.globalFloatTable = [];
		this.dsoVersion = 33;
		this.inFunction = false;
		this.breakLineCount = 0;
		this.currentFloatTable = this.globalFloatTable;
		this.currentStringTable = this.globalStringTable;
		this.identTable = new IdentTable();
	}
	precompileIdent(ident) {
		if(ident != null) {
			this.globalStringTable.add(ident,false,false);
		}
	}
	compileIdent(ident,ip) {
		if(ident != null) {
			this.identTable.add(this,ident,ip);
		}
		return 0;
	}
	addIntString(value) {
		return this.currentStringTable.add("" + value,true,false);
	}
	addFloatString(value) {
		return this.currentStringTable.add("" + value,true,false);
	}
	addFloat(value) {
		if(this.currentFloatTable.includes(value)) {
			return this.currentFloatTable.indexOf(value);
		} else {
			this.currentFloatTable.push(value);
			return this.currentFloatTable.length - 1;
		}
	}
	addString(value,caseSens,tag) {
		return this.currentStringTable.add(value,caseSens,tag);
	}
	setTable(target,prop) {
		switch(target._hx_index) {
		case 0:
			switch(prop._hx_index) {
			case 0:
				this.currentStringTable = this.globalStringTable;
				break;
			case 1:
				this.currentStringTable = this.functionStringTable;
				break;
			}
			break;
		case 1:
			switch(prop._hx_index) {
			case 0:
				this.currentFloatTable = this.globalFloatTable;
				break;
			case 1:
				this.currentFloatTable = this.functionFloatTable;
				break;
			}
			break;
		}
	}
	compile(code,optimizationLevel) {
		if(optimizationLevel == null) {
			optimizationLevel = 3;
		}
		let statementList = null;
		let scanner = new Scanner(code);
		let toks = scanner.scanTokens();
		let parser = new Parser(toks);
		statementList = parser.parse();
		let optimizer = new Optimizer(statementList);
		optimizer.optimize(optimizationLevel);
		statementList = optimizer.getAST();
		let outData = new haxe_io_BytesBuffer();
		outData.addInt32(this.dsoVersion);
		this.globalFloatTable = [];
		this.globalStringTable = new StringTable();
		this.functionFloatTable = [];
		this.functionStringTable = new StringTable();
		this.identTable = new IdentTable();
		this.currentStringTable = this.globalStringTable;
		this.currentFloatTable = this.globalFloatTable;
		this.inFunction = false;
		this.breakLineCount = 0;
		let codeSize = 1;
		if(statementList.length != 0) {
			codeSize = expr_Stmt.precompileBlock(this,statementList,0) + 1;
		}
		let lineBreakPairCount = this.breakLineCount * 2;
		let context = new CompileContext(codeSize,lineBreakPairCount);
		context.breakPoint = 0;
		context.continuePoint = 0;
		context.ip = 0;
		this.globalStringTable.write(outData);
		outData.addInt32(this.globalFloatTable.length);
		let _g = 0;
		let _g1 = this.globalFloatTable;
		while(_g < _g1.length) {
			let f = _g1[_g];
			++_g;
			outData.addDouble(f);
		}
		this.functionStringTable.write(outData);
		outData.addInt32(this.functionFloatTable.length);
		let _g2 = 0;
		let _g3 = this.functionFloatTable;
		while(_g2 < _g3.length) {
			let f = _g3[_g2];
			++_g2;
			outData.addDouble(f);
		}
		this.breakLineCount = 0;
		let lastIp = 0;
		if(statementList.length != 0) {
			lastIp = expr_Stmt.compileBlock(this,context,statementList);
		}
		if(lastIp != codeSize - 1) {
			throw new haxe_Exception("Precompile size mismatch");
		}
		context.codeStream[lastIp++] = 13;
		let totSize = codeSize + this.breakLineCount * 2;
		outData.addInt32(codeSize);
		outData.addInt32(this.breakLineCount);
		let _g4 = 0;
		let _g5 = codeSize;
		while(_g4 < _g5) {
			let i = _g4++;
			if(context.codeStream[i] < 255) {
				outData.addByte(context.codeStream[i]);
			} else {
				outData.addByte(255);
				outData.addInt32(context.codeStream[i]);
			}
		}
		let _g6 = 0;
		let _g7 = context.lineBreakPairs;
		while(_g6 < _g7.length) {
			let ibyte = _g7[_g6];
			++_g6;
			outData.addInt32(ibyte);
		}
		this.identTable.write(outData);
		return outData;
	}
	static stringToNumber(value) {
		if(value == "true") {
			return 1;
		}
		if(value == "false") {
			return 0;
		}
		let val = parseFloat(value);
		if(isNaN(val)) {
			return 0;
		}
		return val;
	}
}
$hx_exports["Compiler"] = Compiler;
Compiler.__name__ = true;
Object.assign(Compiler.prototype, {
	__class__: Compiler
});
class CompileContext {
	constructor(codeSize,lineBreakPairSize) {
		let this1 = new Array(codeSize);
		this.codeStream = this1;
		let this2 = new Array(lineBreakPairSize);
		this.lineBreakPairs = this2;
		this.codeSize = codeSize;
		this.lineBreakPairSize = lineBreakPairSize;
	}
}
CompileContext.__name__ = true;
Object.assign(CompileContext.prototype, {
	__class__: CompileContext
});
var LineType = $hxEnums["LineType"] = { __ename__:true,__constructs__:null
	,GlobalStringTable: {_hx_name:"GlobalStringTable",_hx_index:0,__enum__:"LineType",toString:$estr}
	,GlobalFloatTable: {_hx_name:"GlobalFloatTable",_hx_index:1,__enum__:"LineType",toString:$estr}
	,FunctionStringTable: {_hx_name:"FunctionStringTable",_hx_index:2,__enum__:"LineType",toString:$estr}
	,FunctionFloatTable: {_hx_name:"FunctionFloatTable",_hx_index:3,__enum__:"LineType",toString:$estr}
	,IdentTable: {_hx_name:"IdentTable",_hx_index:4,__enum__:"LineType",toString:$estr}
	,Code: {_hx_name:"Code",_hx_index:5,__enum__:"LineType",toString:$estr}
};
LineType.__constructs__ = [LineType.GlobalStringTable,LineType.GlobalFloatTable,LineType.FunctionStringTable,LineType.FunctionFloatTable,LineType.IdentTable,LineType.Code];
var DisassemblyVerbosity = $hxEnums["DisassemblyVerbosity"] = { __ename__:true,__constructs__:null
	,Code: {_hx_name:"Code",_hx_index:0,__enum__:"DisassemblyVerbosity",toString:$estr}
	,Args: {_hx_name:"Args",_hx_index:1,__enum__:"DisassemblyVerbosity",toString:$estr}
	,ConstTables: {_hx_name:"ConstTables",_hx_index:2,__enum__:"DisassemblyVerbosity",toString:$estr}
	,ConstTableReferences: {_hx_name:"ConstTableReferences",_hx_index:3,__enum__:"DisassemblyVerbosity",toString:$estr}
};
DisassemblyVerbosity.__constructs__ = [DisassemblyVerbosity.Code,DisassemblyVerbosity.Args,DisassemblyVerbosity.ConstTables,DisassemblyVerbosity.ConstTableReferences];
class DissassemblyData {
}
DissassemblyData.__name__ = true;
class DisassemblyReference extends DissassemblyData {
	constructor(referencesWhat,referenceIndex) {
		super();
		this.referencesWhat = referencesWhat;
		this.referenceIndex = referenceIndex;
	}
}
DisassemblyReference.__name__ = true;
DisassemblyReference.__super__ = DissassemblyData;
Object.assign(DisassemblyReference.prototype, {
	__class__: DisassemblyReference
});
class DisassemblyConst extends DissassemblyData {
	constructor(value) {
		super();
		this.value = value;
	}
}
DisassemblyConst.__name__ = true;
DisassemblyConst.__super__ = DissassemblyData;
Object.assign(DisassemblyConst.prototype, {
	__class__: DisassemblyConst
});
class Disassembler {
	constructor() {
		this.opCodeLookup = new haxe_ds_IntMap();
		this.identMapSize = 1;
		let _g = new haxe_ds_IntMap();
		_g.h[0] = null;
		this.identMap = _g;
		this.inFunction = false;
		this.lineBreakPairs = [];
		this.codeStream = [];
		this.dsoVersion = 33;
		this.identTable = new IdentTable();
		this.functionFloatTable = [];
		this.globalFloatTable = [];
		let _g1 = new haxe_ds_IntMap();
		_g1.h[0] = "FuncDecl";
		_g1.h[1] = "CreateObject";
		_g1.h[2] = "CreateDataBlock";
		_g1.h[3] = "NameObject";
		_g1.h[4] = "AddObject";
		_g1.h[5] = "EndObject";
		_g1.h[6] = "JmpIffNot";
		_g1.h[7] = "JmpIfNot";
		_g1.h[8] = "JmpIff";
		_g1.h[9] = "JmpIf";
		_g1.h[10] = "JmpIfNotNP";
		_g1.h[11] = "JmpIfNP";
		_g1.h[12] = "Jmp";
		_g1.h[13] = "Return";
		_g1.h[14] = "CmpEQ";
		_g1.h[15] = "CmpGT";
		_g1.h[16] = "CmpGE";
		_g1.h[17] = "CmpLT";
		_g1.h[18] = "CmpLE";
		_g1.h[19] = "CmpNE";
		_g1.h[20] = "Xor";
		_g1.h[21] = "Mod";
		_g1.h[22] = "BitAnd";
		_g1.h[23] = "BitOr";
		_g1.h[24] = "Not";
		_g1.h[25] = "NotF";
		_g1.h[26] = "OnesComplement";
		_g1.h[27] = "Shr";
		_g1.h[28] = "Shl";
		_g1.h[29] = "And";
		_g1.h[30] = "Or";
		_g1.h[31] = "Add";
		_g1.h[32] = "Sub";
		_g1.h[33] = "Mul";
		_g1.h[34] = "Div";
		_g1.h[35] = "Neg";
		_g1.h[36] = "SetCurVar";
		_g1.h[37] = "SetCurVarCreate";
		_g1.h[38] = "SetCurVarArray";
		_g1.h[39] = "SetCurVarArrayCreate";
		_g1.h[40] = "LoadVarUInt";
		_g1.h[41] = "LoadVarFlt";
		_g1.h[42] = "LoadVarStr";
		_g1.h[43] = "SaveVarUInt";
		_g1.h[44] = "SaveVarFlt";
		_g1.h[45] = "SaveVarStr";
		_g1.h[46] = "SetCurObject";
		_g1.h[47] = "SetCurObjectNew";
		_g1.h[48] = "SetCurField";
		_g1.h[49] = "SetCurFieldArray";
		_g1.h[50] = "LoadFieldUInt";
		_g1.h[51] = "LoadFieldFlt";
		_g1.h[52] = "LoadFieldStr";
		_g1.h[53] = "SaveFieldUInt";
		_g1.h[54] = "SaveFieldFlt";
		_g1.h[55] = "SaveFieldStr";
		_g1.h[56] = "StrToUInt";
		_g1.h[57] = "StrToFlt";
		_g1.h[58] = "StrToNone";
		_g1.h[59] = "FltToUInt";
		_g1.h[60] = "FltToStr";
		_g1.h[61] = "FltToNone";
		_g1.h[62] = "UIntToFlt";
		_g1.h[63] = "UIntToStr";
		_g1.h[64] = "UIntToNone";
		_g1.h[65] = "LoadImmedUInt";
		_g1.h[66] = "LoadImmedFlt";
		_g1.h[67] = "TagToStr";
		_g1.h[68] = "LoadImmedStr";
		_g1.h[69] = "LoadImmedIdent";
		_g1.h[70] = "CallFuncResolve";
		_g1.h[71] = "CallFunc";
		_g1.h[72] = "ProcessArgs";
		_g1.h[73] = "AdvanceStr";
		_g1.h[74] = "AdvanceStrAppendChar";
		_g1.h[75] = "AdvanceStrComma";
		_g1.h[76] = "AdvanceStrNul";
		_g1.h[77] = "RewindStr";
		_g1.h[78] = "TerminateRewindStr";
		_g1.h[79] = "CompareStr";
		_g1.h[80] = "Push";
		_g1.h[81] = "PushFrame";
		_g1.h[82] = "Break";
		_g1.h[83] = "Invalid";
		this.opCodeLookup = _g1;
	}
	loadFromBytes(bytes) {
		this.load(new haxe_io_BytesInput(haxe_io_Bytes.ofData(bytes)));
	}
	load(inData) {
		this.dsoVersion = inData.readInt32();
		if(this.dsoVersion != 33) {
			throw new haxe_Exception("Incorrect DSO version: " + this.dsoVersion);
		}
		let stSize = inData.readInt32();
		this.globalStringTable = "";
		let _g = 0;
		let _g1 = stSize;
		while(_g < _g1) {
			let i = _g++;
			let tmp = this;
			let tmp1 = tmp.globalStringTable;
			let code = inData.readByte();
			tmp.globalStringTable = tmp1 + String.fromCodePoint(code);
		}
		let size = inData.readInt32();
		let _g2 = 0;
		let _g3 = size;
		while(_g2 < _g3) {
			let i = _g2++;
			this.globalFloatTable.push(inData.readDouble());
		}
		let stSize1 = inData.readInt32();
		this.functionStringTable = "";
		let _g4 = 0;
		let _g5 = stSize1;
		while(_g4 < _g5) {
			let i = _g4++;
			let tmp = this;
			let tmp1 = tmp.functionStringTable;
			let code = inData.readByte();
			tmp.functionStringTable = tmp1 + String.fromCodePoint(code);
		}
		size = inData.readInt32();
		let _g6 = 0;
		let _g7 = size;
		while(_g6 < _g7) {
			let i = _g6++;
			this.functionFloatTable.push(inData.readDouble());
		}
		let codeSize = inData.readInt32();
		let lineBreakPairCount = inData.readInt32();
		let _g8 = 0;
		let _g9 = codeSize;
		while(_g8 < _g9) {
			let i = _g8++;
			let curByte = inData.readByte();
			if(curByte == 255) {
				this.codeStream.push(inData.readInt32());
			} else {
				this.codeStream.push(curByte);
			}
		}
		let _g10 = 0;
		let _g11 = lineBreakPairCount * 2;
		while(_g10 < _g11) {
			let i = _g10++;
			this.lineBreakPairs.push(inData.readInt32());
		}
		this.identTable.read(inData);
		let map = this.identTable.identMap;
		let _g12_map = map;
		let _g12_keys = map.keys();
		while(_g12_keys.hasNext()) {
			let key = _g12_keys.next();
			let _g13_value = _g12_map.get(key);
			let _g13_key = key;
			let ident = _g13_key;
			let offsets = _g13_value;
			let identStr = this.getStringTableValue(this.globalStringTable,ident);
			let identId = this.identMapSize;
			let _g = 0;
			while(_g < offsets.length) {
				let offset = offsets[_g];
				++_g;
				this.codeStream[offset] = this.identMapSize;
			}
			this.identMap.h[identId] = identStr;
			this.identMapSize++;
		}
	}
	getStringTableValue(table,offset) {
		return HxOverrides.substr(table,offset,table.indexOf("\x00",offset) - offset);
	}
	getStringTableValueFromRef(table,ref) {
		let zeroCount = 0;
		let str = new StringBuf();
		let _g = 0;
		let _g1 = table.length;
		while(_g < _g1) {
			let i = _g++;
			if(HxOverrides.cca(table,i) == 0) {
				if(zeroCount == ref) {
					return str.b;
				}
				str = new StringBuf();
				++zeroCount;
			} else {
				str.b += Std.string(table.charAt(i));
			}
		}
		return "";
	}
	normalizeSTE(steType,index) {
		let zeroCount = 0;
		if(steType == LineType.GlobalStringTable) {
			let _g = 0;
			let _g1 = this.globalStringTable.length;
			while(_g < _g1) {
				let i = _g++;
				if(HxOverrides.cca(this.globalStringTable,i) == 0) {
					++zeroCount;
				}
				if(i == index) {
					return zeroCount;
				}
			}
		}
		if(steType == LineType.FunctionStringTable) {
			let _g = 0;
			let _g1 = this.functionStringTable.length;
			while(_g < _g1) {
				let i = _g++;
				if(HxOverrides.cca(this.functionStringTable,i) == 0) {
					++zeroCount;
				}
				if(i == index) {
					return zeroCount;
				}
			}
		}
		return -1;
	}
	disassembleCode() {
		let ip = 0;
		let lines = [];
		let endFuncIp = -1;
		while(ip != this.codeStream.length) {
			if(ip == endFuncIp) {
				this.inFunction = false;
			}
			let instruction = this.codeStream[ip++];
			switch(instruction) {
			case 0:
				let fnName = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);
				let fnNamespace = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 1]);
				let fnPackage = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 2]);
				let hasBody = new DisassemblyConst(this.codeStream[ip + 3]);
				let fnEndOffset = new DisassemblyReference(LineType.Code,this.codeStream[ip + 4]);
				endFuncIp = this.codeStream[ip + 4];
				let fnArgc = new DisassemblyConst(this.codeStream[ip + 5]);
				let fnArgs = [];
				let _g = 0;
				let _g1 = fnArgc.value;
				while(_g < _g1) {
					let i = _g++;
					fnArgs.push(new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 6 + i]));
				}
				this.inFunction = true;
				let line = { type : LineType.Code, opCode : 0, args : [fnName,fnNamespace,fnPackage,hasBody,fnEndOffset,fnArgc].concat(fnArgs), lineNo : ip};
				ip += 6 + fnArgc.value;
				lines.push(line);
				break;
			case 1:
				let objParent = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);
				let datablock = new DisassemblyConst(this.codeStream[ip + 1]);
				let failJump = new DisassemblyReference(LineType.Code,this.codeStream[ip + 2]);
				let line1 = { type : LineType.Code, opCode : 1, args : [objParent,datablock,failJump], lineNo : ip};
				ip += 3;
				lines.push(line1);
				break;
			case 2:case 3:
				let line2 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line2);
				break;
			case 4:case 5:
				let root = new DisassemblyConst(this.codeStream[ip]);
				let line3 = { type : LineType.Code, opCode : instruction, args : [root], lineNo : ip};
				++ip;
				lines.push(line3);
				break;
			case 6:case 7:case 8:case 9:case 10:case 11:case 12:
				let jump = new DisassemblyReference(LineType.Code,this.codeStream[ip]);
				let line4 = { type : LineType.Code, opCode : instruction, args : [jump], lineNo : ip};
				++ip;
				lines.push(line4);
				break;
			case 13:
				let line5 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line5);
				break;
			case 14:case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 29:case 30:case 31:case 32:case 33:case 34:case 35:
				let line6 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line6);
				break;
			case 36:case 37:
				let varIdx = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);
				let line7 = { type : LineType.Code, opCode : instruction, args : [varIdx], lineNo : ip};
				++ip;
				lines.push(line7);
				break;
			case 38:case 39:
				let line8 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line8);
				break;
			case 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:
				let line9 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line9);
				break;
			case 48:
				let fieldIdx = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);
				let line10 = { type : LineType.Code, opCode : instruction, args : [fieldIdx], lineNo : ip};
				++ip;
				lines.push(line10);
				break;
			case 49:
				let line11 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line11);
				break;
			case 50:case 51:case 52:case 53:case 54:case 55:
				let line12 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line12);
				break;
			case 56:case 57:case 58:case 59:case 60:case 61:case 62:case 63:case 64:
				let line13 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line13);
				break;
			case 65:
				let immed = new DisassemblyConst(this.codeStream[ip]);
				let line14 = { type : LineType.Code, opCode : instruction, args : [immed], lineNo : ip};
				++ip;
				lines.push(line14);
				break;
			case 66:
				let immed1 = new DisassemblyReference(this.inFunction ? LineType.FunctionFloatTable : LineType.GlobalFloatTable,this.codeStream[ip]);
				let line15 = { type : LineType.Code, opCode : instruction, args : [immed1], lineNo : ip};
				++ip;
				lines.push(line15);
				break;
			case 67:case 68:
				let ref = new DisassemblyReference(this.inFunction ? LineType.FunctionStringTable : LineType.GlobalStringTable,this.normalizeSTE(this.inFunction ? LineType.FunctionStringTable : LineType.GlobalStringTable,this.codeStream[ip]));
				let line16 = { type : LineType.Code, opCode : instruction, args : [ref], lineNo : ip};
				++ip;
				lines.push(line16);
				break;
			case 69:
				let ref1 = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);
				let line17 = { type : LineType.Code, opCode : instruction, args : [ref1], lineNo : ip};
				++ip;
				lines.push(line17);
				break;
			case 70:case 71:
				let fnName1 = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);
				let fnNamespace1 = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 1]);
				let callType = new DisassemblyConst(this.codeStream[ip + 2]);
				let line18 = { type : LineType.Code, opCode : instruction, args : [fnName1,fnNamespace1,callType], lineNo : ip};
				ip += 3;
				lines.push(line18);
				break;
			case 74:
				let char = new DisassemblyConst(this.codeStream[ip]);
				let line19 = { type : LineType.Code, opCode : instruction, args : [char], lineNo : ip};
				++ip;
				lines.push(line19);
				break;
			case 72:case 73:case 75:case 76:case 77:case 78:case 79:
				let line20 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line20);
				break;
			case 80:case 81:case 82:case 83:
				let line21 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};
				lines.push(line21);
				break;
			}
		}
		let totalDism = [];
		let zeroCount = 0;
		let str = new StringBuf();
		let _g = 0;
		let _g1 = this.globalStringTable.length;
		while(_g < _g1) {
			let i = _g++;
			if(HxOverrides.cca(this.globalStringTable,i) == 0) {
				totalDism.push({ type : LineType.GlobalStringTable, lineNo : zeroCount, opCode : 0, args : [new DisassemblyConst(str.b)]});
				str = new StringBuf();
				++zeroCount;
			} else {
				str.b += Std.string(this.globalStringTable.charAt(i));
			}
		}
		let _g2 = 0;
		let _g3 = this.globalFloatTable.length;
		while(_g2 < _g3) {
			let i = _g2++;
			totalDism.push({ type : LineType.GlobalFloatTable, lineNo : i, opCode : 0, args : [new DisassemblyConst(this.globalFloatTable[i])]});
		}
		let zeroCount1 = 0;
		let str1 = new StringBuf();
		let _g4 = 0;
		let _g5 = this.functionStringTable.length;
		while(_g4 < _g5) {
			let i = _g4++;
			if(HxOverrides.cca(this.functionStringTable,i) == 0) {
				totalDism.push({ type : LineType.FunctionStringTable, lineNo : zeroCount1, opCode : 0, args : [new DisassemblyConst(str1.b)]});
				str1 = new StringBuf();
				++zeroCount1;
			} else {
				str1.b += Std.string(this.functionStringTable.charAt(i));
			}
		}
		let _g6 = 0;
		let _g7 = this.functionFloatTable.length;
		while(_g6 < _g7) {
			let i = _g6++;
			totalDism.push({ type : LineType.FunctionFloatTable, lineNo : i, opCode : 0, args : [new DisassemblyConst(this.functionFloatTable[i])]});
		}
		let map = this.identMap;
		let _g8_map = map;
		let _g8_keys = map.keys();
		while(_g8_keys.hasNext()) {
			let key = _g8_keys.next();
			let _g9_value = _g8_map.get(key);
			let _g9_key = key;
			let identIdx = _g9_key;
			let ident = _g9_value;
			totalDism.push({ type : LineType.IdentTable, lineNo : identIdx, opCode : 0, args : [new DisassemblyConst(ident)]});
		}
		totalDism = totalDism.concat(lines);
		return totalDism;
	}
	writeDisassembly(lines,outputVerbosity) {
		let output_b = "";
		let _g = 0;
		while(_g < lines.length) {
			let line = lines[_g];
			++_g;
			switch(line.type._hx_index) {
			case 0:
				let strData = line.args[0];
				if((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {
					output_b += Std.string("GlobalStringTable::" + StringTools.lpad("" + line.lineNo,"0",5) + ": " + strData.value + "\n");
				}
				break;
			case 1:
				let strData1 = line.args[0];
				if((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {
					output_b += Std.string("GlobalFloatTable::" + StringTools.lpad("" + line.lineNo,"0",5) + ": " + strData1.value + "\n");
				}
				break;
			case 2:
				let strData2 = line.args[0];
				if((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {
					output_b += Std.string("FunctionStringTable::" + StringTools.lpad("" + line.lineNo,"0",5) + ": " + strData2.value + "\n");
				}
				break;
			case 3:
				let strData3 = line.args[0];
				if((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {
					output_b += Std.string("FunctionFloatTable::" + StringTools.lpad("" + line.lineNo,"0",5) + ": " + strData3.value + "\n");
				}
				break;
			case 4:
				let strData4 = line.args[0];
				if((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {
					output_b += Std.string("IdentTable::" + StringTools.lpad("" + line.lineNo,"0",5) + ": " + strData4.value + "\n");
				}
				break;
			case 5:
				let args = "";
				if((outputVerbosity & 1 << DisassemblyVerbosity.Args._hx_index) != 0) {
					let _g = 0;
					let _g1 = line.args;
					while(_g < _g1.length) {
						let arg = _g1[_g];
						++_g;
						if(((arg) instanceof DisassemblyReference)) {
							let ref = arg;
							let refStr;
							switch(ref.referencesWhat._hx_index) {
							case 0:
								refStr = "GlobalStringTable::" + StringTools.lpad("" + ref.referenceIndex,"0",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? "<-\"" + this.getStringTableValueFromRef(this.globalStringTable,ref.referenceIndex) + "\"" : "");
								break;
							case 1:
								refStr = "GlobalFloatTable::" + StringTools.lpad("" + ref.referenceIndex,"0",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? "<-\"" + this.globalFloatTable[ref.referenceIndex] + "\"" : "");
								break;
							case 2:
								refStr = "FunctionStringTable::" + StringTools.lpad("" + ref.referenceIndex,"0",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? "<-\"" + this.getStringTableValueFromRef(this.functionStringTable,ref.referenceIndex) + "\"" : "");
								break;
							case 3:
								refStr = "FunctionFloatTable::" + StringTools.lpad("" + ref.referenceIndex,"0",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? "<-\"" + this.functionFloatTable[ref.referenceIndex] + "\"" : "");
								break;
							case 4:
								refStr = "IdentTable::" + StringTools.lpad("" + ref.referenceIndex,"0",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? "<-\"" + this.identMap.h[ref.referenceIndex] + "\"" : "");
								break;
							case 5:
								refStr = "Code::" + StringTools.lpad("" + ref.referenceIndex,"0",5);
								break;
							}
							args += refStr + " ";
						} else if(((arg) instanceof DisassemblyConst)) {
							let c = arg;
							args += "" + c.value + " ";
						}
					}
				}
				output_b += Std.string("Code::" + StringTools.lpad("" + line.lineNo,"0",5) + ": " + this.opCodeLookup.h[line.opCode] + " " + args + "\n");
				break;
			}
		}
		return output_b;
	}
}
$hx_exports["Disassembler"] = Disassembler;
Disassembler.__name__ = true;
Object.assign(Disassembler.prototype, {
	__class__: Disassembler
});
class HxOverrides {
	static cca(s,index) {
		let x = s.charCodeAt(index);
		if(x != x) {
			return undefined;
		}
		return x;
	}
	static substr(s,pos,len) {
		if(len == null) {
			len = s.length;
		} else if(len < 0) {
			if(pos == 0) {
				len = s.length + len;
			} else {
				return "";
			}
		}
		return s.substr(pos,len);
	}
	static remove(a,obj) {
		let i = a.indexOf(obj);
		if(i == -1) {
			return false;
		}
		a.splice(i,1);
		return true;
	}
	static now() {
		return Date.now();
	}
}
HxOverrides.__name__ = true;
class IASTVisitor {
}
IASTVisitor.__name__ = true;
IASTVisitor.__isInterface__ = true;
Object.assign(IASTVisitor.prototype, {
	__class__: IASTVisitor
});
class IOptimizerPass {
}
IOptimizerPass.__name__ = true;
IOptimizerPass.__isInterface__ = true;
IOptimizerPass.__interfaces__ = [IASTVisitor];
Object.assign(IOptimizerPass.prototype, {
	__class__: IOptimizerPass
});
class VarCollector {
	constructor() {
		this.currentFunction = null;
		this.localVars = new haxe_ds_ObjectMap();
		this.globalVars = [];
	}
	visitStmt(stmt) {
	}
	visitBreakStmt(stmt) {
	}
	visitContinueStmt(stmt) {
	}
	visitExpr(expr) {
	}
	visitParenthesisExpr(expr) {
	}
	visitReturnStmt(stmt) {
	}
	visitIfStmt(stmt) {
	}
	visitLoopStmt(stmt) {
	}
	visitBinaryExpr(expr) {
	}
	visitFloatBinaryExpr(expr) {
	}
	visitIntBinaryExpr(expr) {
	}
	visitStrEqExpr(expr) {
	}
	visitStrCatExpr(expr) {
	}
	visitCommatCatExpr(expr) {
	}
	visitConditionalExpr(expr) {
	}
	visitIntUnaryExpr(expr) {
	}
	visitFloatUnaryExpr(expr) {
	}
	visitVarExpr(expr) {
		if(expr.type == expr_VarType.Global) {
			let n = VarCollector.mangleName(expr.name.literal);
			if(!this.globalVars.includes(n)) {
				this.globalVars.push(n);
			}
		} else if(expr.type == expr_VarType.Local) {
			if(this.localVars.h.__keys__[this.currentFunction.__id__] != null) {
				let n = VarCollector.mangleName(expr.name.literal);
				if(!this.localVars.h[this.currentFunction.__id__].includes(n)) {
					this.localVars.h[this.currentFunction.__id__].push(n);
				}
			} else {
				let this1 = this.localVars;
				let k = this.currentFunction;
				let v = [VarCollector.mangleName(expr.name.literal)];
				this1.set(k,v);
			}
		}
	}
	visitIntExpr(expr) {
	}
	visitFloatExpr(expr) {
	}
	visitStringConstExpr(expr) {
	}
	visitConstantExpr(expr) {
	}
	visitAssignExpr(expr) {
	}
	visitAssignOpExpr(expr) {
	}
	visitFuncCallExpr(expr) {
	}
	visitSlotAccessExpr(expr) {
	}
	visitSlotAssignExpr(expr) {
	}
	visitSlotAssignOpExpr(expr) {
	}
	visitObjectDeclExpr(expr) {
	}
	visitFunctionDeclStmt(stmt) {
		this.currentFunction = stmt;
	}
	static mangleName(name) {
		let ret = name;
		let _g = 0;
		let _g1 = VarCollector.reservedKwds;
		while(_g < _g1.length) {
			let res = _g1[_g];
			++_g;
			if(ret == res) {
				ret = StringTools.replace(ret,res,"_" + res);
			}
		}
		ret = StringTools.replace(ret,"::","_");
		return ret;
	}
}
VarCollector.__name__ = true;
VarCollector.__interfaces__ = [IASTVisitor];
Object.assign(VarCollector.prototype, {
	__class__: VarCollector
});
class JSGenerator {
	constructor(stmts) {
		this.inFunction = false;
		this.varCollector = new VarCollector();
		this.builder = new StringBuf();
		this.indent = 0;
		this.stmts = stmts;
	}
	generate(embedLibrary) {
		if(embedLibrary == null) {
			embedLibrary = true;
		}
		if(embedLibrary) {
			let lib = JSGenerator.bootstrapEmbed();
			this.builder.b += lib == null ? "null" : "" + lib;
			let _this = this.builder;
			let x = this.println("const __vm = new VM();");
			_this.b += Std.string(x);
		}
		let _g = 0;
		let _g1 = this.stmts;
		while(_g < _g1.length) {
			let stmt = _g1[_g];
			++_g;
			stmt.visitStmt(this.varCollector);
			if(this.varCollector.currentFunction != null) {
				this.varCollector.currentFunction = null;
			}
		}
		let _g2 = 0;
		let _g3 = this.varCollector.globalVars;
		while(_g2 < _g3.length) {
			let global = _g3[_g2];
			++_g2;
			this.builder.b += Std.string("const global_" + global + " = new Variable(\"$" + "global_" + global + "\", __vm);\n");
		}
		let _g4 = 0;
		let _g5 = this.stmts;
		while(_g4 < _g5.length) {
			let stmt = _g5[_g4];
			++_g4;
			let _this = this.builder;
			let x = this.printStmt(stmt);
			_this.b += Std.string(x);
		}
		return this.builder.b;
	}
	printStmt(stmt) {
		if(((stmt) instanceof expr_BreakStmt)) {
			return this.println("break;");
		} else if(((stmt) instanceof expr_ContinueStmt)) {
			return this.println("continue;");
		} else if((((stmt) instanceof expr_Expr) ? stmt : null) != null) {
			return this.println(this.printExpr(stmt,expr_TypeReq.ReqNone) + ";");
		} else if(((stmt) instanceof expr_ReturnStmt)) {
			return this.printReturnStmt(stmt);
		} else if(((stmt) instanceof expr_IfStmt)) {
			return this.printIfStmt(stmt);
		} else if(((stmt) instanceof expr_LoopStmt)) {
			return this.printLoopStmt(stmt);
		} else if(((stmt) instanceof expr_FunctionDeclStmt)) {
			return this.printFunctionDeclStmt(stmt);
		} else {
			return "";
		}
	}
	printReturnStmt(returnStmt) {
		if(returnStmt.expr != null) {
			let expr = this.printExpr(returnStmt.expr,expr_TypeReq.ReqString);
			if(this.inFunction) {
				return this.println("return " + expr + ";");
			} else {
				return this.println(expr + ";");
			}
		} else if(this.inFunction) {
			return this.println("return;");
		} else {
			return "";
		}
	}
	printIfStmt(ifStmt) {
		let ret = "";
		ret += this.println("if (" + (ifStmt.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(ifStmt.condition,expr_TypeReq.ReqInt) : this.printExpr(ifStmt.condition,expr_TypeReq.ReqFloat)) + ") {");
		this.indent++;
		let _g = 0;
		let _g1 = ifStmt.body;
		while(_g < _g1.length) {
			let stmt = _g1[_g];
			++_g;
			ret += this.printStmt(stmt);
		}
		this.indent--;
		if(ifStmt.elseBlock != null) {
			ret += this.println("} else {");
			this.indent++;
			let _g = 0;
			let _g1 = ifStmt.elseBlock;
			while(_g < _g1.length) {
				let stmt = _g1[_g];
				++_g;
				ret += this.printStmt(stmt);
			}
			this.indent--;
		}
		ret += this.println("}");
		return ret;
	}
	printLoopStmt(loopStmt) {
		let ret = "";
		let isForLoop = loopStmt.init != null || loopStmt.end != null;
		if(isForLoop) {
			ret += this.println("for (" + (loopStmt.init != null ? this.printExpr(loopStmt.init,expr_TypeReq.ReqNone) : "") + ";" + (loopStmt.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(loopStmt.condition,expr_TypeReq.ReqInt) : this.printExpr(loopStmt.condition,expr_TypeReq.ReqFloat)) + ";" + (loopStmt.end != null ? this.printExpr(loopStmt.end,expr_TypeReq.ReqNone) : "") + ") {");
		} else {
			if(loopStmt.init != null) {
				ret += this.println(this.printExpr(loopStmt.init,expr_TypeReq.ReqNone) + ";");
			}
			ret += this.println("while (" + (loopStmt.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(loopStmt.condition,expr_TypeReq.ReqInt) : this.printExpr(loopStmt.condition,expr_TypeReq.ReqFloat)) + ") {");
		}
		this.indent++;
		let _g = 0;
		let _g1 = loopStmt.body;
		while(_g < _g1.length) {
			let stmt = _g1[_g];
			++_g;
			ret += this.printStmt(stmt);
		}
		if(!isForLoop) {
			if(loopStmt.end != null) {
				ret += this.println(this.printExpr(loopStmt.end,expr_TypeReq.ReqNone) + ";");
			}
		}
		this.indent--;
		ret += this.println("}");
		return ret;
	}
	printFunctionDeclStmt(functionDeclStmt) {
		let fnameStr = "" + (functionDeclStmt.namespace != null ? js_Boot.__cast(functionDeclStmt.namespace.literal , String) : "") + "_" + (functionDeclStmt.functionName.literal == null ? "null" : Std.string(functionDeclStmt.functionName.literal)) + "_" + (functionDeclStmt.packageName != null ? js_Boot.__cast(functionDeclStmt.packageName.literal , String) : "");
		let declStr = this.println("function " + fnameStr + "(args) {");
		this.indent++;
		let bodyStr = "";
		let addedVars = [];
		let _g = 0;
		let _g1 = functionDeclStmt.args.length;
		while(_g < _g1) {
			let i = _g++;
			let param = functionDeclStmt.args[i];
			let vname = VarCollector.mangleName(param.name.literal);
			bodyStr += this.println("let " + vname + " = args[" + (i + 1) + "];");
			addedVars.push(vname);
		}
		if(this.varCollector.localVars.h.__keys__[functionDeclStmt.__id__] != null) {
			let _g = 0;
			let _g1 = this.varCollector.localVars.h[functionDeclStmt.__id__];
			while(_g < _g1.length) {
				let localVar = _g1[_g];
				++_g;
				if(!addedVars.includes(localVar)) {
					bodyStr += this.println("const " + localVar + " = new Variable(\"%" + localVar + "\", __vm);");
				}
			}
		}
		this.inFunction = true;
		let _g2 = 0;
		let _g3 = functionDeclStmt.stmts;
		while(_g2 < _g3.length) {
			let stmt = _g3[_g2];
			++_g2;
			bodyStr += this.printStmt(stmt);
		}
		this.inFunction = false;
		this.indent--;
		declStr += bodyStr + this.println("}");
		declStr += this.println("__vm.addJSFunction(" + fnameStr + ",'" + (functionDeclStmt.functionName.literal == null ? "null" : Std.string(functionDeclStmt.functionName.literal)) + "','" + (functionDeclStmt.namespace != null ? js_Boot.__cast(functionDeclStmt.namespace.literal , String) : "") + "', '" + (functionDeclStmt.packageName != null ? js_Boot.__cast(functionDeclStmt.packageName.literal , String) : "") + "');");
		return declStr;
	}
	printExpr(expr,type) {
		if(((expr) instanceof expr_ParenthesisExpr)) {
			return this.printParenthesisExpr(expr,type);
		} else if(((expr) instanceof expr_ConditionalExpr)) {
			return this.printConditionalExpr(expr,type);
		} else if(((expr) instanceof expr_StrEqExpr)) {
			return this.printStrEqExpr(expr,type);
		} else if(((expr) instanceof expr_StrCatExpr)) {
			return this.printStrCatExpr(expr,type);
		} else if(((expr) instanceof expr_CommaCatExpr)) {
			return this.printCommaCatExpr(expr,type);
		} else if(((expr) instanceof expr_IntBinaryExpr)) {
			return this.printIntBinaryExpr(expr,type);
		} else if(((expr) instanceof expr_FloatBinaryExpr)) {
			return this.printFloatBinaryExpr(expr,type);
		} else if(((expr) instanceof expr_IntUnaryExpr)) {
			return this.printIntUnaryExpr(expr,type);
		} else if(((expr) instanceof expr_FloatUnaryExpr)) {
			return this.printFloatUnaryExpr(expr,type);
		} else if(((expr) instanceof expr_VarExpr)) {
			return this.printVarExpr(expr,type);
		} else if(((expr) instanceof expr_IntExpr)) {
			return this.printIntExpr(expr,type);
		} else if(((expr) instanceof expr_FloatExpr)) {
			return this.printFloatExpr(expr,type);
		} else if(((expr) instanceof expr_StringConstExpr)) {
			return this.printStringConstExpr(expr,type);
		} else if(((expr) instanceof expr_ConstantExpr)) {
			return this.printConstantExpr(expr,type);
		} else if(((expr) instanceof expr_AssignExpr)) {
			return this.printAssignExpr(expr,type);
		} else if(((expr) instanceof expr_AssignOpExpr)) {
			return this.printAssignOpExpr(expr,type);
		} else if(((expr) instanceof expr_FuncCallExpr)) {
			return this.printFuncCallExpr(expr,type);
		} else if(((expr) instanceof expr_SlotAccessExpr)) {
			return this.printSlotAccessExpr(expr,type);
		} else if(((expr) instanceof expr_SlotAssignExpr)) {
			return this.printSlotAssignExpr(expr,type);
		} else if(((expr) instanceof expr_SlotAssignOpExpr)) {
			return this.printSlotAssignOpExpr(expr,type);
		} else if(((expr) instanceof expr_ObjectDeclExpr)) {
			return this.printObjectDeclExpr(expr,type);
		} else {
			return "";
		}
	}
	printParenthesisExpr(parenthesisExpr,type) {
		return "(" + this.printExpr(parenthesisExpr.expr,type) + ")";
	}
	printConditionalExpr(conditionalExpr,type) {
		return (conditionalExpr.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(conditionalExpr.condition,expr_TypeReq.ReqInt) : this.printExpr(conditionalExpr.condition,expr_TypeReq.ReqFloat)) + " ? " + this.printExpr(conditionalExpr.trueExpr,type) + " : " + this.printExpr(conditionalExpr.falseExpr,type);
	}
	printStrEqExpr(strEqExpr,type) {
		return this.conversionOp(expr_TypeReq.ReqInt,type,this.printExpr(strEqExpr.left,expr_TypeReq.ReqString) + (strEqExpr.op.type == TokenType.StringEquals ? " == " : " != ") + this.printExpr(strEqExpr.right,expr_TypeReq.ReqString));
	}
	printStrCatExpr(strCatExpr,type) {
		let catExpr;
		switch(strCatExpr.op.type._hx_index) {
		case 41:
			catExpr = "";
			break;
		case 42:
			catExpr = "' ' + ";
			break;
		case 43:
			catExpr = "'\\t' + ";
			break;
		case 44:
			catExpr = "'\\n' + ";
			break;
		default:
			catExpr = "";
		}
		return this.conversionOp(expr_TypeReq.ReqString,type,this.printExpr(strCatExpr.left,expr_TypeReq.ReqString) + " + " + catExpr + this.printExpr(strCatExpr.right,expr_TypeReq.ReqString));
	}
	printCommaCatExpr(commaCatExpr,type) {
		return this.conversionOp(expr_TypeReq.ReqString,type,this.printExpr(commaCatExpr.left,expr_TypeReq.ReqString) + " + '_' + " + this.printExpr(commaCatExpr.right,expr_TypeReq.ReqString));
	}
	printIntBinaryExpr(intBinaryExpr,type) {
		intBinaryExpr.getSubTypeOperand();
		return this.conversionOp(expr_TypeReq.ReqInt,type,this.printExpr(intBinaryExpr.left,intBinaryExpr.subType) + " " + intBinaryExpr.op.lexeme + " " + this.printExpr(intBinaryExpr.right,intBinaryExpr.subType));
	}
	printFloatBinaryExpr(floatBinaryExpr,type) {
		return this.conversionOp(expr_TypeReq.ReqFloat,type,this.printExpr(floatBinaryExpr.left,expr_TypeReq.ReqFloat) + " " + floatBinaryExpr.op.lexeme + " " + this.printExpr(floatBinaryExpr.right,expr_TypeReq.ReqFloat));
	}
	printIntUnaryExpr(intUnaryExpr,type) {
		let prefType = intUnaryExpr.expr.getPrefferredType();
		switch(intUnaryExpr.op.type._hx_index) {
		case 35:
			return this.conversionOp(expr_TypeReq.ReqInt,type,"!" + (prefType == expr_TypeReq.ReqInt ? this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqInt) : this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqFloat)));
		case 38:
			return this.conversionOp(expr_TypeReq.ReqInt,type,"~" + (prefType == expr_TypeReq.ReqInt ? this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqInt) : this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqFloat)));
		default:
			return "";
		}
	}
	printFloatUnaryExpr(floatUnaryExpr,type) {
		return this.conversionOp(expr_TypeReq.ReqFloat,type,"-" + this.printExpr(floatUnaryExpr.expr,expr_TypeReq.ReqFloat));
	}
	printVarExpr(varExpr,type) {
		switch(varExpr.type._hx_index) {
		case 0:
			if(varExpr.arrayIndex == null) {
				switch(type._hx_index) {
				case 0:
					return "global_" + VarCollector.mangleName(varExpr.name.literal);
				case 1:
					return "global_" + VarCollector.mangleName(varExpr.name.literal) + ".getIntValue()";
				case 2:
					return "global_" + VarCollector.mangleName(varExpr.name.literal) + ".getFloatValue()";
				case 3:
					return "global_" + VarCollector.mangleName(varExpr.name.literal) + ".getStringValue()";
				}
			} else {
				switch(type._hx_index) {
				case 0:
					return "global_" + VarCollector.mangleName(varExpr.name.literal) + "[" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + "]";
				case 1:
					return "global_" + VarCollector.mangleName(varExpr.name.literal) + ".resolveArray(" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + ").getIntValue()";
				case 2:
					return "global_" + VarCollector.mangleName(varExpr.name.literal) + ".resolveArray(" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + ").getFloatValue()";
				case 3:
					return "global_" + VarCollector.mangleName(varExpr.name.literal) + ".resolveArray(" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + ").getStringValue()";
				}
			}
			break;
		case 1:
			if(varExpr.arrayIndex == null) {
				switch(type._hx_index) {
				case 0:
					return VarCollector.mangleName(varExpr.name.literal);
				case 1:
					return VarCollector.mangleName(varExpr.name.literal) + ".getIntValue()";
				case 2:
					return VarCollector.mangleName(varExpr.name.literal) + ".getFloatValue()";
				case 3:
					return VarCollector.mangleName(varExpr.name.literal) + ".getStringValue()";
				}
			} else {
				switch(type._hx_index) {
				case 0:
					return VarCollector.mangleName(varExpr.name.literal) + ".resolveArray(" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + ")";
				case 1:
					return VarCollector.mangleName(varExpr.name.literal) + ".resolveArray(" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + ").getIntValue()";
				case 2:
					return VarCollector.mangleName(varExpr.name.literal) + ".resolveArray(" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + ").getFloatValue()";
				case 3:
					return VarCollector.mangleName(varExpr.name.literal) + ".resolveArray(" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + ").getStringValue()";
				}
			}
			break;
		}
	}
	printIntExpr(intExpr,type) {
		switch(type._hx_index) {
		case 0:
			return "" + intExpr.value;
		case 1:
			return "" + intExpr.value;
		case 2:
			return "" + intExpr.value;
		case 3:
			return "'" + intExpr.value + "'";
		}
	}
	printFloatExpr(floatExpr,type) {
		switch(type._hx_index) {
		case 0:
			return "" + floatExpr.value;
		case 1:
			return "" + (floatExpr.value | 0);
		case 2:
			return "" + floatExpr.value;
		case 3:
			return "'" + floatExpr.value + "'";
		}
	}
	printStringConstExpr(stringConstExpr,type) {
		switch(type._hx_index) {
		case 0:
			return "'" + stringConstExpr.value + "'";
		case 1:
			let intValue = Std.parseInt(stringConstExpr.value);
			if(intValue == null) {
				return "0";
			}
			return "" + intValue;
		case 2:
			let floatValue = parseFloat(stringConstExpr.value);
			if(isNaN(floatValue)) {
				return "0";
			}
			return "" + floatValue;
		case 3:
			return "'" + Scanner.escape(stringConstExpr.value) + "'";
		}
	}
	printConstantExpr(constantExpr,type) {
		switch(type._hx_index) {
		case 0:
			return "__vm.resolveIdent('" + (constantExpr.name.literal == null ? "null" : Std.string(constantExpr.name.literal)) + "')";
		case 1:
			return "" + (Compiler.stringToNumber(constantExpr.name.literal) | 0);
		case 2:
			return "" + Compiler.stringToNumber(constantExpr.name.literal);
		case 3:
			return "'" + Scanner.escape(constantExpr.name.literal) + "'";
		}
	}
	printAssignExpr(assignExpr,type) {
		let varStr;
		switch(assignExpr.varExpr.type._hx_index) {
		case 0:
			varStr = assignExpr.varExpr.arrayIndex == null ? "global_" + VarCollector.mangleName(assignExpr.varExpr.name.literal) + "." : "global_" + VarCollector.mangleName(assignExpr.varExpr.name.literal) + ".resolveArray(" + this.printExpr(assignExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + ").";
			break;
		case 1:
			varStr = assignExpr.varExpr.arrayIndex == null ? VarCollector.mangleName(assignExpr.varExpr.name.literal) + "." : VarCollector.mangleName(assignExpr.varExpr.name.literal) + ".resolveArray(" + this.printExpr(assignExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + ").";
			break;
		}
		let varStr1;
		switch(assignExpr.expr.getPrefferredType()._hx_index) {
		case 0:
			varStr1 = "setStringValue(" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqString) + ")";
			break;
		case 1:
			varStr1 = "setIntValue(" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqInt) + ")";
			break;
		case 2:
			varStr1 = "setFloatValue(" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqFloat) + ")";
			break;
		case 3:
			varStr1 = "setStringValue(" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqString) + ")";
			break;
		}
		varStr += varStr1;
		switch(type._hx_index) {
		case 0:
			break;
		case 1:case 2:case 3:
			varStr = "(() => {" + varStr + "; return " + this.printVarExpr(assignExpr.varExpr,type) + "; })()";
			break;
		}
		return varStr;
	}
	printAssignOpExpr(assignOpExpr,type) {
		assignOpExpr.getAssignOpTypeOp();
		let assignValue = this.printVarExpr(assignOpExpr.varExpr,assignOpExpr.subType) + " " + HxOverrides.substr(assignOpExpr.op.lexeme,0,assignOpExpr.op.lexeme.length - 1) + " " + this.printExpr(assignOpExpr.expr,assignOpExpr.subType);
		let varStr;
		switch(assignOpExpr.varExpr.type._hx_index) {
		case 0:
			varStr = assignOpExpr.varExpr.arrayIndex == null ? "global_" + VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + "." : "global_" + VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + ".resolveArray(" + this.printExpr(assignOpExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + ").";
			break;
		case 1:
			varStr = assignOpExpr.varExpr.arrayIndex == null ? VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + "." : VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + ".resolveArray(" + this.printExpr(assignOpExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + ").";
			break;
		}
		let varStr1;
		switch(assignOpExpr.expr.getPrefferredType()._hx_index) {
		case 1:
			varStr1 = "setIntValue(" + assignValue + ")";
			break;
		case 2:
			varStr1 = "setFloatValue(" + assignValue + ")";
			break;
		case 3:
			varStr1 = "setStringValue(" + assignValue + ")";
			break;
		default:
			return "";
		}
		varStr += varStr1;
		switch(type._hx_index) {
		case 0:
			break;
		case 1:case 2:case 3:
			varStr = "(() => {" + varStr + "; return " + this.printVarExpr(assignOpExpr.varExpr,type) + "; })()";
			break;
		}
		return varStr;
	}
	printFuncCallExpr(funcCallExpr,type) {
		let _gthis = this;
		let _this = funcCallExpr.args;
		let result = new Array(_this.length);
		let _g = 0;
		let _g1 = _this.length;
		while(_g < _g1) {
			let i = _g++;
			result[i] = _gthis.printExpr(_this[i],expr_TypeReq.ReqString);
		}
		let paramStr = "[" + result.join(", ") + "]";
		let callTypeStr;
		switch(funcCallExpr.callType) {
		case 0:
			callTypeStr = "FunctionCall";
			break;
		case 1:
			callTypeStr = "MethodCall";
			break;
		case 2:
			callTypeStr = "ParentCall";
			break;
		}
		if(funcCallExpr.name.literal == "eval") {
			funcCallExpr.name.literal = "eval_js";
		}
		let callStr = "__vm.callFunc(" + (funcCallExpr.namespace != null ? "'" + (funcCallExpr.namespace.literal == null ? "null" : Std.string(funcCallExpr.namespace.literal)) + "'" : "''") + ", '" + (funcCallExpr.name.literal == null ? "null" : Std.string(funcCallExpr.name.literal)) + "', " + paramStr + ", '" + callTypeStr + "')";
		switch(type._hx_index) {
		case 0:case 3:
			break;
		case 1:
			callStr = "parseInt(" + callStr + ")";
			break;
		case 2:
			callStr = "parseFloat(" + callStr + ")";
			break;
		}
		return callStr;
	}
	printSlotAccessExpr(slotAccessExpr,type) {
		let objStr = this.printExpr(slotAccessExpr.objectExpr,expr_TypeReq.ReqString);
		let slotStr = "__vm.slotAccess(" + objStr + ", '" + (slotAccessExpr.slotName.literal == null ? "null" : Std.string(slotAccessExpr.slotName.literal)) + "', " + (slotAccessExpr.arrayExpr != null ? this.printExpr(slotAccessExpr.arrayExpr,expr_TypeReq.ReqString) : "null") + ")";
		let retStr = slotStr;
		switch(type._hx_index) {
		case 0:
			break;
		case 1:
			retStr += ".getIntValue()";
			break;
		case 2:
			retStr += ".getFloatValue()";
			break;
		case 3:
			retStr += ".getStringValue()";
			break;
		}
		return retStr;
	}
	printSlotAssignExpr(slotAssignExpr,type) {
		let objStr = this.printExpr(slotAssignExpr.objectExpr,expr_TypeReq.ReqNone);
		let slotStr = "'" + (slotAssignExpr.slotName.literal == null ? "null" : Std.string(slotAssignExpr.slotName.literal)) + "'";
		let slotArrayStr = slotAssignExpr.arrayExpr != null ? this.printExpr(slotAssignExpr.arrayExpr,expr_TypeReq.ReqString) : "null";
		let valueStr = this.printExpr(slotAssignExpr.expr,expr_TypeReq.ReqString);
		let assignStr = "__vm.slotAssign(" + objStr + ", " + slotStr + ", " + slotArrayStr + ", " + valueStr + ")";
		switch(type._hx_index) {
		case 0:
			break;
		case 1:
			assignStr = "parseInt(" + assignStr + ")";
			break;
		case 2:
			assignStr = "parseFloat(" + assignStr + ")";
			break;
		case 3:
			assignStr = "String(" + assignStr + ")";
			break;
		}
		return assignStr;
	}
	printSlotAssignOpExpr(slotAssignOpExpr,type) {
		slotAssignOpExpr.getAssignOpTypeOp();
		let objAccessStr = this.printExpr(slotAssignOpExpr.objectExpr,expr_TypeReq.ReqString);
		let objStr = this.printExpr(slotAssignOpExpr.objectExpr,expr_TypeReq.ReqNone);
		let slotStr = "'" + (slotAssignOpExpr.slotName.literal == null ? "null" : Std.string(slotAssignOpExpr.slotName.literal)) + "'";
		let slotArrayStr = slotAssignOpExpr.arrayExpr != null ? this.printExpr(slotAssignOpExpr.arrayExpr,expr_TypeReq.ReqString) : "";
		let slotRetrieveStr = "__vm.slotAccess(" + objAccessStr + ", '" + (slotAssignOpExpr.slotName.literal == null ? "null" : Std.string(slotAssignOpExpr.slotName.literal)) + "', " + (slotAssignOpExpr.arrayExpr != null ? this.printExpr(slotAssignOpExpr.arrayExpr,expr_TypeReq.ReqString) : "null") + ")";
		let valueStr = slotRetrieveStr + ".";
		let valueStr1;
		switch(slotAssignOpExpr.subType._hx_index) {
		case 0:case 3:
			valueStr1 = "getStringValue() ";
			break;
		case 1:
			valueStr1 = "getIntValue() ";
			break;
		case 2:
			valueStr1 = "getFloatValue() ";
			break;
		}
		let valueStr2 = valueStr + valueStr1;
		valueStr2 += HxOverrides.substr(slotAssignOpExpr.op.lexeme,0,slotAssignOpExpr.op.lexeme.length - 1) + " " + this.printExpr(slotAssignOpExpr.expr,slotAssignOpExpr.subType);
		let assignStr = "__vm.slotAssign(" + objStr + ", " + slotStr + ", " + slotArrayStr + ", " + valueStr2 + ")";
		switch(type._hx_index) {
		case 0:
			break;
		case 1:
			assignStr = "parseInt(" + assignStr + ")";
			break;
		case 2:
			assignStr = "parseFloat(" + assignStr + ")";
			break;
		case 3:
			assignStr = "String(" + assignStr + ")";
			break;
		}
		return assignStr;
	}
	printObjectDeclExpr(objDeclExpr,type,root) {
		if(root == null) {
			root = true;
		}
		let retExpr = "__vm.newObject(" + this.printExpr(objDeclExpr.className,expr_TypeReq.ReqString) + ", " + this.printExpr(objDeclExpr.objectNameExpr,expr_TypeReq.ReqString) + ", " + (objDeclExpr.structDecl == null ? "null" : "" + objDeclExpr.structDecl) + ", " + (objDeclExpr.parentObject != null ? "'" + (objDeclExpr.parentObject.literal == null ? "null" : Std.string(objDeclExpr.parentObject.literal)) + "'" : null) + ", " + (root == null ? "null" : "" + root) + ", ";
		if(objDeclExpr.slotDecls.length != 0) {
			retExpr += "{\n";
			this.indent++;
			let _g = 0;
			let _g1 = objDeclExpr.slotDecls.length;
			while(_g < _g1) {
				let i = _g++;
				let slotdecl = objDeclExpr.slotDecls[i];
				let slotStr = slotdecl.slotName.literal;
				if(slotdecl.arrayExpr != null) {
					slotStr += ".resolveArray(" + this.printExpr(slotdecl.arrayExpr,expr_TypeReq.ReqString) + ")";
				}
				slotStr += ": " + this.printExpr(slotdecl.expr,expr_TypeReq.ReqNone);
				retExpr += this.println(slotStr + (i < objDeclExpr.slotDecls.length - 1 ? "," : ""));
			}
			this.indent--;
			let _g2 = 0;
			let _g3 = this.indent;
			while(_g2 < _g3) {
				let i = _g2++;
				retExpr += "\t";
			}
			retExpr += this.print("}, ");
		} else {
			retExpr += "{}, ";
		}
		if(objDeclExpr.subObjects.length != 0) {
			retExpr += "[\n";
			this.indent++;
			let _g = 0;
			let _g1 = objDeclExpr.subObjects.length;
			while(_g < _g1) {
				let i = _g++;
				let subObj = objDeclExpr.subObjects[i];
				retExpr += this.println(this.printObjectDeclExpr(subObj,expr_TypeReq.ReqNone,false) + (i < objDeclExpr.subObjects.length - 1 ? "," : ""));
			}
			this.indent--;
			let _g2 = 0;
			let _g3 = this.indent;
			while(_g2 < _g3) {
				let i = _g2++;
				retExpr += "\t";
			}
			retExpr += this.print("])");
		} else {
			retExpr += "[])";
		}
		let retExpr1;
		switch(type._hx_index) {
		case 0:
			retExpr1 = "";
			break;
		case 1:
			retExpr1 = ".getIntValue()";
			break;
		case 2:
			retExpr1 = ".getFloatValue()";
			break;
		case 3:
			retExpr1 = ".getStringValue()";
			break;
		}
		retExpr += retExpr1;
		return retExpr;
	}
	conversionOp(src,dest,exprStr) {
		switch(src._hx_index) {
		case 1:
			switch(dest._hx_index) {
			case 0:
				return "(() => { " + exprStr + "; return 0; })()";
			case 2:
				return exprStr;
			case 3:
				return "String(" + exprStr + ")";
			default:
				return exprStr;
			}
			break;
		case 2:
			switch(dest._hx_index) {
			case 0:
				return "(() => { " + exprStr + "; return 0.0; })()";
			case 1:
				return "Math.round(" + exprStr + ")";
			case 3:
				return "String(" + exprStr + ")";
			default:
				return exprStr;
			}
			break;
		case 3:
			switch(dest._hx_index) {
			case 0:
				return "(() => { " + exprStr + "; return \"\"; })()";
			case 1:
				return "parseInt(" + exprStr + ")";
			case 2:
				return "parseFloat(" + exprStr + ")";
			default:
				return exprStr;
			}
			break;
		default:
			return exprStr;
		}
	}
	print(str) {
		return str;
	}
	println(str) {
		let indentStr = "";
		let _g = 0;
		let _g1 = this.indent;
		while(_g < _g1) {
			let i = _g++;
			indentStr += "    ";
		}
		return indentStr + str + "\n";
	}
	static bootstrapEmbed() {
		return StringTools.replace(JSGenerator.embedLib,"__" + "EMBED_LIB" + "__",Scanner.escape(JSGenerator.embedLib)) + "\n";
	}
}
$hx_exports["JSGenerator"] = JSGenerator;
JSGenerator.__name__ = true;
Object.assign(JSGenerator.prototype, {
	__class__: JSGenerator
});
class Log {
	static outputFunction(text,newline) {
		if(newline) {
			console.log(Log.savedStr + text);
			Log.savedStr = "";
		} else {
			Log.savedStr += text;
		}
	}
	static println(text) {
		Log.outputFunction(text,true);
	}
	static print(text) {
		Log.outputFunction(text,false);
	}
	static setOutputFunction(func) {
		Log.outputFunction = func;
	}
}
$hx_exports["Log"] = Log;
Log.__name__ = true;
Math.__name__ = true;
class Optimizer {
	constructor(ast) {
		this.ast = ast;
		this.optimizerPasses = [new optimizer_ConstantFoldingPass()];
	}
	optimize(level) {
		let _g = 0;
		let _g1 = this.optimizerPasses;
		while(_g < _g1.length) {
			let pass = _g1[_g];
			++_g;
			if(pass.getLevel() <= level) {
				pass.optimize(this.ast);
			}
		}
	}
	getAST() {
		return this.ast;
	}
}
Optimizer.__name__ = true;
Object.assign(Optimizer.prototype, {
	__class__: Optimizer
});
class Parser {
	constructor(tokens) {
		this.syntaxErrors = [];
		this.panicMode = false;
		this.current = 0;
		this.tokens = [];
		this.comments = [];
		this.positionStack = new haxe_ds_GenericStack();
		let _g = 0;
		while(_g < tokens.length) {
			let token = tokens[_g];
			++_g;
			let _g1 = token.type;
			if(_g1._hx_index == 80) {
				let multiline = _g1.multiline;
				this.comments.push(token);
			} else {
				this.tokens.push(token);
			}
		}
	}
	parse() {
		return this.start();
	}
	start() {
		let decls = [];
		let d = this.decl();
		while(d[0] != null) {
			decls = decls.concat(d);
			d = this.decl();
		}
		let _g = 0;
		let _g1 = this.syntaxErrors;
		while(_g < _g1.length) {
			let err = _g1[_g];
			++_g;
			Log.println(err.toString());
		}
		if(this.syntaxErrors.length != 0) {
			throw new haxe_Exception("Syntax errors while parsing");
		}
		return decls;
	}
	decl() {
		try {
			let pkfuncs = this.packageDecl();
			let d = null;
			if(pkfuncs == null) {
				d = this.functionDecl();
				if(d == null) {
					d = this.stmt();
				}
			}
			if(pkfuncs != null) {
				let result = new Array(pkfuncs.length);
				let _g = 0;
				let _g1 = pkfuncs.length;
				while(_g < _g1) {
					let i = _g++;
					result[i] = pkfuncs[i];
				}
				return result;
			} else {
				return [d];
			}
		} catch( _g ) {
			let _g1 = haxe_Exception.caught(_g);
			if(((_g1) instanceof SyntaxError)) {
				let err = _g1;
				if(!this.panicMode) {
					this.syntaxErrors.push(err);
					this.panicMode = true;
				}
				while(!this.match([TokenType.Semicolon,TokenType.Eof]) && !this.isAtEnd()) this.advance();
				this.advance();
				this.panicMode = false;
				return this.decl();
			} else {
				throw _g;
			}
		}
	}
	packageDecl() {
		if(this.match([TokenType.Package])) {
			this.advance();
			let name = this.consume(TokenType.Label,"Expected package name");
			this.consume(TokenType.LBracket,"Expected '{' before package name");
			let decls = [];
			let d = this.functionDecl();
			d.packageName = name;
			if(d == null) {
				throw new SyntaxError("Expected function declaration",this.tokens[this.current - 1]);
			}
			while(d != null) {
				decls.push(d);
				d = this.functionDecl();
				if(d != null) {
					d.packageName = name;
				}
			}
			this.consumeSynchronize(TokenType.RBracket,"Expected '}' after package functions");
			this.consume(TokenType.Semicolon,"Expected ';' after package block");
			return decls;
		} else {
			return null;
		}
	}
	functionDecl() {
		if(this.match([TokenType.Function])) {
			this.advance();
			let fnname = this.consume(TokenType.Label,"Expected function name");
			let parentname = null;
			let parameters = [];
			if(this.match([TokenType.DoubleColon])) {
				this.advance();
				let temp = this.consume(TokenType.Label,"Expected function name");
				parentname = fnname;
				fnname = temp;
			}
			this.consume(TokenType.LParen,"Expected '(' after function name");
			let vardecl = this.variable();
			while(vardecl != null) {
				parameters.push(vardecl);
				if(this.match([TokenType.Comma])) {
					this.advance();
					vardecl = this.variable();
					if(vardecl == null) {
						throw new SyntaxError("Expected variable declaration",this.tokens[this.current - 1]);
					}
				} else {
					vardecl = null;
				}
			}
			this.consumeSynchronize(TokenType.RParen,"Expected ')' after function parameters");
			this.consume(TokenType.LBracket,"Expected '{' before function body");
			let body = this.statementList();
			this.consumeSynchronize(TokenType.RBracket,"Expected '}' after function body");
			return new expr_FunctionDeclStmt(fnname,parameters,body,parentname);
		} else {
			return null;
		}
	}
	statementList() {
		let stmts = [];
		try {
			let s = this.stmt();
			while(s != null) {
				stmts.push(s);
				s = this.stmt();
			}
		} catch( _g ) {
			let _g1 = haxe_Exception.caught(_g);
			if(((_g1) instanceof SyntaxError)) {
				let err = _g1;
				if(!this.panicMode) {
					this.syntaxErrors.push(err);
					this.panicMode = true;
				}
				while(!this.match([TokenType.Semicolon,TokenType.Eof]) && !this.isAtEnd()) this.advance();
				this.advance();
				this.panicMode = false;
				return stmts.concat(this.statementList());
			} else {
				throw _g;
			}
		}
		return stmts;
	}
	variable() {
		let varName = "";
		let varType;
		let varStart = [TokenType.Label,TokenType.Package,TokenType.Return,TokenType.Break,TokenType.Continue,TokenType.While,TokenType.False,TokenType.True,TokenType.Function,TokenType.Else,TokenType.If,TokenType.Datablock,TokenType.Case,TokenType.SpaceConcat,TokenType.TabConcat,TokenType.NewlineConcat,TokenType.Default,TokenType.New];
		let varMid = [TokenType.DoubleColon];
		let varEnd = [TokenType.Label,TokenType.Package,TokenType.Default,TokenType.Return,TokenType.Break,TokenType.Continue,TokenType.While,TokenType.False,TokenType.True,TokenType.Function,TokenType.Else,TokenType.If,TokenType.New,TokenType.Int,TokenType.Datablock,TokenType.Case];
		if(this.match([TokenType.Dollar,TokenType.Modulus])) {
			let typetok = this.advance();
			switch(typetok.type._hx_index) {
			case 19:
				varType = expr_VarType.Local;
				break;
			case 74:
				varType = expr_VarType.Global;
				break;
			default:
				throw new SyntaxError("Unexpected token " + Std.string(typetok.type),typetok);
			}
			if(this.match(varStart)) {
				varName = this.advance().literal;
				while(this.match(varMid)) {
					let tok = this.advance();
					varName += tok.type._hx_index == 68 ? "::" : tok.literal;
					while(this.match(varEnd)) {
						let tmp = this.advance().literal;
						varName += tmp == null ? "null" : Std.string(tmp);
					}
				}
				let retexpr = new expr_VarExpr(new Token(TokenType.Label,varName,varName,typetok.line,typetok.position),null,varType);
				return retexpr;
			} else {
				throw new SyntaxError("Expected variable name",this.tokens[this.current - 1]);
			}
		} else {
			return null;
		}
	}
	stmt() {
		let e = this.breakStmt();
		if(e == null) {
			e = this.returnStmt();
		}
		if(e == null) {
			e = this.continueStmt();
		}
		if(e == null) {
			e = this.expressionStmt();
		}
		if(e == null) {
			e = this.switchStmt();
		}
		if(e == null) {
			e = this.datablockStmt();
		}
		if(e == null) {
			e = this.forStmt();
		}
		if(e == null) {
			e = this.whileStmt();
		}
		if(e == null) {
			e = this.ifStmt();
		}
		return e;
	}
	returnStmt() {
		if(this.match([TokenType.Return])) {
			let line = this.peek().line;
			this.advance();
			if(this.match([TokenType.Semicolon])) {
				this.advance();
				return new expr_ReturnStmt(line,null);
			} else {
				let expr = this.expression();
				this.consume(TokenType.Semicolon,"Expected ';' after return expression");
				return new expr_ReturnStmt(line,expr);
			}
		} else {
			return null;
		}
	}
	continueStmt() {
		if(this.match([TokenType.Continue])) {
			let line = this.peek().line;
			this.advance();
			this.consume(TokenType.Semicolon,"Expected ';' after continue");
			return new expr_ContinueStmt(line);
		} else {
			return null;
		}
	}
	breakStmt() {
		if(this.match([TokenType.Break])) {
			let line = this.peek().line;
			this.advance();
			this.consume(TokenType.Semicolon,"Expected ';' after break");
			return new expr_BreakStmt(line);
		} else {
			return null;
		}
	}
	switchStmt() {
		if(this.match([TokenType.Switch])) {
			let switchLine = this.peek().line;
			this.advance();
			let isStringSwitch = false;
			if(this.match([TokenType.Dollar])) {
				this.advance();
				isStringSwitch = true;
			}
			this.consume(TokenType.LParen,"Expected '(' after switch");
			let expr = this.expression();
			this.consumeSynchronize(TokenType.RParen,"Expected ')' after switch expression");
			this.consume(TokenType.LBracket,"Expected '{' before switch body");
			let cases = this.caseBlock();
			if(cases == null) {
				throw new SyntaxError("Expected switch cases",this.tokens[this.current - 1]);
			}
			this.consumeSynchronize(TokenType.RBracket,"Expected '}' after switch body");
			let generateCaseCheckExpr = function(caseData) {
				let checkExpr = null;
				if(isStringSwitch) {
					checkExpr = new expr_StrEqExpr(expr,caseData.conditions[0],new Token(TokenType.StringEquals,"$=","$=",0,0));
					caseData.conditions.shift();
					while(caseData.conditions.length > 0) checkExpr = new expr_IntBinaryExpr(checkExpr,new expr_StrEqExpr(expr,caseData.conditions.shift(),new Token(TokenType.StringEquals,"$=","$=",0,0)),new Token(TokenType.LogicalOr,"||","||",0,0));
					return checkExpr;
				} else {
					checkExpr = new expr_IntBinaryExpr(expr,caseData.conditions[0],new Token(TokenType.Equal,"==","==",0,0));
					caseData.conditions.shift();
					while(caseData.conditions.length > 0) checkExpr = new expr_IntBinaryExpr(checkExpr,new expr_IntBinaryExpr(expr,caseData.conditions.shift(),new Token(TokenType.Equal,"==","==",0,0)),new Token(TokenType.LogicalOr,"||","||",0,0));
					return checkExpr;
				}
			};
			let ifStmt = new expr_IfStmt(switchLine,generateCaseCheckExpr(cases),cases.stmts,null);
			if(cases.next == null) {
				if(cases.defaultStmts != null) {
					if(cases.defaultStmts.length != 0) {
						ifStmt.elseBlock = cases.defaultStmts;
					}
				}
			} else {
				let itrIf = ifStmt;
				while(cases.next != null) {
					let cond = generateCaseCheckExpr(cases.next);
					itrIf.elseBlock = [new expr_IfStmt(cond.lineNo,cond,cases.next.stmts,null)];
					itrIf = itrIf.elseBlock[0];
					cases = cases.next;
					if(cases.defaultStmts != null) {
						itrIf.elseBlock = cases.defaultStmts;
					}
				}
			}
			return ifStmt;
		} else {
			return null;
		}
	}
	caseBlock() {
		if(this.match([TokenType.Case])) {
			this.advance();
			let caseExprs = [];
			let caseExpr = this.expression();
			while(caseExpr != null) {
				caseExprs.push(caseExpr);
				if(this.match([TokenType.Or])) {
					this.advance();
					caseExpr = this.expression();
				} else {
					break;
				}
			}
			this.consume(TokenType.Colon,"Expected ':' after case expression");
			let stmtList = this.statementList();
			let nextCase = this.caseBlock();
			if(nextCase == null) {
				let defExprs = null;
				if(this.match([TokenType.Default])) {
					this.advance();
					this.consume(TokenType.Colon,"Expected ':' after default");
					defExprs = this.statementList();
				}
				return { conditions : caseExprs, stmts : stmtList, defaultStmts : defExprs, next : null};
			} else {
				return { conditions : caseExprs, stmts : stmtList, defaultStmts : null, next : nextCase};
			}
		} else {
			return null;
		}
	}
	datablockStmt() {
		if(this.match([TokenType.Datablock])) {
			this.advance();
			let className = this.consume(TokenType.Label,"Expected identifier after datablock");
			this.consume(TokenType.LParen,"Expected '(' after datablock name");
			let name = this.consume(TokenType.Label,"Expected identifier after datablock name");
			let parentName = null;
			if(this.match([TokenType.Colon])) {
				this.advance();
				parentName = this.consume(TokenType.Label,"Expected identifier after datablock name");
			}
			this.consumeSynchronize(TokenType.RParen,"Expected ')' after datablock name");
			this.consume(TokenType.LBracket,"Expected '{' before datablock body");
			let slots = [];
			let slot = this.slotAssign();
			if(slot == null) {
				throw new SyntaxError("Expected slot assignment",this.tokens[this.current - 1]);
			}
			while(slot != null) {
				slots.push(slot);
				slot = this.slotAssign();
			}
			this.consumeSynchronize(TokenType.RBracket,"Expected '}' after datablock body");
			this.consume(TokenType.Semicolon,"Expected ';' after datablock body");
			let dbdecl = new expr_ObjectDeclExpr(new expr_ConstantExpr(className),parentName,new expr_ConstantExpr(name),[],slots,[],true);
			dbdecl.structDecl = true;
			return dbdecl;
		} else {
			return null;
		}
	}
	slotAssign() {
		if(this.match([TokenType.Label])) {
			let slotName = this.consume(TokenType.Label,"Expected identifier after slot assignment");
			let arrayIdx = null;
			if(this.match([TokenType.LeftSquareBracket])) {
				this.advance();
				arrayIdx = null;
				let arrayExpr = this.expression();
				if(arrayExpr == null) {
					throw new SyntaxError("Expected expression after '['",this.tokens[this.current - 1]);
				}
				while(arrayExpr != null) {
					if(arrayIdx == null) {
						arrayIdx = arrayExpr;
					} else {
						arrayIdx = new expr_CommaCatExpr(arrayIdx,arrayExpr);
					}
					if(this.match([TokenType.Comma])) {
						this.advance();
						arrayExpr = this.expression();
					} else {
						break;
					}
				}
				this.consume(TokenType.RightSquareBracket,"Expected ']' after array index");
			}
			this.consume(TokenType.Assign,"Expected '=' after slot assignment");
			let slotExpr = this.expression();
			if(slotExpr == null) {
				throw new SyntaxError("Expected expression after '='",this.tokens[this.current - 1]);
			}
			this.consume(TokenType.Semicolon,"Expected ';' after slot assignment");
			return new expr_SlotAssignExpr(null,arrayIdx,slotName,slotExpr);
		} else if(this.match([TokenType.Datablock])) {
			let slotName = this.advance();
			this.consume(TokenType.Assign,"Expected '=' after slot assignment");
			let slotExpr = this.expression();
			if(slotExpr == null) {
				throw new SyntaxError("Expected expression after '='",this.tokens[this.current - 1]);
			}
			this.consume(TokenType.Semicolon,"Expected ';' after slot assignment");
			return new expr_SlotAssignExpr(null,null,slotName,slotExpr);
		} else {
			return null;
		}
	}
	forStmt() {
		if(this.match([TokenType.For])) {
			let forLine = this.peek().line;
			this.advance();
			this.consume(TokenType.LParen,"Expected '(' after 'for'");
			let initExpr = this.expression();
			this.consume(TokenType.Semicolon,"Expected ';' after initializer in for loop");
			let condExpr = this.expression();
			this.consume(TokenType.Semicolon,"Expected ';' after condition in for loop");
			let iterExpr = this.expression();
			this.consumeSynchronize(TokenType.RParen,"Expected ')' after iteration in for loop");
			let body = [];
			let islist = false;
			if(this.match([TokenType.LBracket])) {
				this.advance();
				body = this.statementList();
				this.consumeSynchronize(TokenType.RBracket,"Expected '}' after for loop body");
				islist = true;
			} else {
				body = [this.stmt()];
			}
			let loopstmt = new expr_LoopStmt(forLine,condExpr,initExpr,iterExpr,body);
			loopstmt.isForLoop = true;
			loopstmt.isStatementList = islist;
			return loopstmt;
		} else {
			return null;
		}
	}
	whileStmt() {
		if(this.match([TokenType.While])) {
			let whileLine = this.peek().line;
			this.advance();
			this.consume(TokenType.LParen,"Expected '(' after 'while'");
			let condExpr = this.expression();
			this.consumeSynchronize(TokenType.RParen,"Expected ')' after condition in while loop");
			let body = [];
			let islist = false;
			if(this.match([TokenType.LBracket])) {
				this.advance();
				body = this.statementList();
				this.consumeSynchronize(TokenType.RBracket,"Expected '}' after for loop body");
				islist = true;
			} else {
				body = [this.stmt()];
			}
			let loopstmt = new expr_LoopStmt(whileLine,condExpr,null,null,body);
			loopstmt.isStatementList = islist;
			return loopstmt;
		} else {
			return null;
		}
	}
	ifStmt() {
		if(this.match([TokenType.If])) {
			let ifLine = this.peek().line;
			this.advance();
			this.consume(TokenType.LParen,"Expected '(' after 'if'");
			let condExpr = this.expression();
			this.consumeSynchronize(TokenType.RParen,"Expected ')' after condition in if statement");
			let bodylist = false;
			let elselist = false;
			let body = [];
			if(this.match([TokenType.LBracket])) {
				this.advance();
				body = this.statementList();
				bodylist = true;
				this.consumeSynchronize(TokenType.RBracket,"Expected '}' after if statement body");
			} else {
				body = [this.stmt()];
			}
			let elseBody = null;
			if(this.match([TokenType.Else])) {
				this.advance();
				if(this.match([TokenType.LBracket])) {
					this.advance();
					elseBody = this.statementList();
					if(elseBody.length == 0) {
						elseBody = null;
					}
					elselist = true;
					this.consumeSynchronize(TokenType.RBracket,"Expected '}' after else statement body");
				} else {
					elseBody = [this.stmt()];
				}
			}
			return new expr_IfStmt(ifLine,condExpr,body,elseBody);
		} else {
			return null;
		}
	}
	expressionStmt() {
		let exprstmt = this.stmtExpr();
		if(exprstmt != null) {
			this.consume(TokenType.Semicolon,"Expected ';' after expression statement");
		}
		return exprstmt;
	}
	stmtExpr() {
		let curPos = this.current;
		let expr = this.expression();
		if(expr != null) {
			if(this.match([TokenType.Dot])) {
				console.log("src/Parser.hx:611:","HERE!!!");
				this.advance();
				let labelAccess = this.consume(TokenType.Label,"Expected label after expression");
				let arrAccess = null;
				if(this.match([TokenType.LeftSquareBracket])) {
					this.advance();
					arrAccess = null;
					let arrExpr = this.expression();
					if(arrExpr == null) {
						throw new SyntaxError("Expected expression after '['",this.tokens[this.current - 1]);
					}
					while(arrExpr != null) {
						if(arrAccess == null) {
							arrAccess = arrExpr;
						} else {
							arrAccess = new expr_CommaCatExpr(arrAccess,arrExpr);
						}
						if(this.match([TokenType.Comma])) {
							this.advance();
							arrExpr = this.expression();
						} else {
							break;
						}
					}
					this.consume(TokenType.RightSquareBracket,"Expected ']' after array index");
				}
				let nextTok = this.advance();
				switch(nextTok.type._hx_index) {
				case 20:
					let rexpr = this.expression();
					return new expr_SlotAssignExpr(expr,arrAccess,labelAccess,rexpr);
				case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:
					let rexpr1 = this.expression();
					return new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,rexpr1,nextTok);
				case 63:
					if(arrAccess == null) {
						let funcexprs = [expr];
						let funcexpr = this.expression();
						while(funcexpr != null) {
							funcexprs.push(funcexpr);
							if(this.match([TokenType.Comma])) {
								this.advance();
								funcexpr = this.expression();
							} else {
								break;
							}
						}
						this.consume(TokenType.RParen,"Expected ')' after function call arguments");
						return new expr_FuncCallExpr(labelAccess,null,funcexprs,1);
					} else {
						throw new SyntaxError("Cannot call array methods with a dot notation accessor",this.tokens[this.current - 1]);
					}
					break;
				case 76:case 77:
					return new expr_ParenthesisExpr(new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,null,nextTok));
				default:
					this.current = curPos;
					return null;
				}
			} else if(((expr) instanceof expr_VarExpr)) {
				let varExpr = expr;
				let arrAccess = null;
				if(this.match([TokenType.LeftSquareBracket])) {
					this.advance();
					arrAccess = [];
					let arrExpr = this.expression();
					if(arrExpr == null) {
						throw new SyntaxError("Expected expression after '['",this.tokens[this.current - 1]);
					}
					while(arrExpr != null) {
						arrAccess.push(arrExpr);
						if(this.match([TokenType.Comma])) {
							this.advance();
							arrExpr = this.expression();
						} else {
							break;
						}
					}
					this.consume(TokenType.RightSquareBracket,"Expected ']' after array index");
				}
				let nextTok = this.advance();
				switch(nextTok.type._hx_index) {
				case 20:
					let rexpr = this.expression();
					return new expr_AssignExpr(varExpr,rexpr);
				case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:
					let rexpr1 = this.expression();
					return new expr_AssignOpExpr(varExpr,rexpr1,nextTok);
				case 76:case 77:
					return new expr_ParenthesisExpr(new expr_AssignOpExpr(varExpr,null,nextTok));
				default:
					this.current = curPos;
					return null;
				}
			} else {
				return expr;
			}
		} else {
			let varExpr = this.variable();
			if(varExpr != null) {
				let arrAccess = null;
				if(this.match([TokenType.LeftSquareBracket])) {
					this.advance();
					arrAccess = [];
					let arrExpr = this.expression();
					if(arrExpr == null) {
						throw new SyntaxError("Expected expression after '['",this.tokens[this.current - 1]);
					}
					while(arrExpr != null) {
						arrAccess.push(arrExpr);
						if(this.match([TokenType.Comma])) {
							this.advance();
							arrExpr = this.expression();
						} else {
							break;
						}
					}
					this.consume(TokenType.RightSquareBracket,"Expected ']' after array index");
				}
				let nextTok = this.advance();
				switch(nextTok.type._hx_index) {
				case 20:
					let rexpr = this.expression();
					return new expr_AssignExpr(varExpr,rexpr);
				case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:
					let rexpr1 = this.expression();
					return new expr_AssignOpExpr(varExpr,rexpr1,nextTok);
				case 76:case 77:
					return new expr_ParenthesisExpr(new expr_AssignOpExpr(varExpr,null,nextTok));
				default:
					this.current = curPos;
					return null;
				}
			} else {
				let objD = this.objectDecl();
				if(objD != null) {
					return objD;
				} else if(this.match([TokenType.Label])) {
					let funcname = this.consume(TokenType.Label,"Expected any expression statement");
					let parentname = null;
					if(this.match([TokenType.DoubleColon])) {
						let temp = this.consume(TokenType.Label,"Expected function name");
						parentname = funcname;
						funcname = temp;
					}
					this.consume(TokenType.LParen,"Expected parenthesis after function name");
					let funcexprs = [];
					let funcexpr = this.expression();
					while(funcexpr != null) {
						funcexprs.push(funcexpr);
						if(this.match([TokenType.Comma])) {
							this.advance();
							funcexpr = this.expression();
						} else {
							break;
						}
					}
					this.consume(TokenType.RParen,"Expected ')' after function parameters");
					return new expr_FuncCallExpr(funcname,parentname,funcexprs,(js_Boot.__cast(parentname.literal , String)).toLowerCase() == "parent" ? 2 : 0);
				} else {
					return null;
				}
			}
		}
	}
	objectDecl() {
		if(this.match([TokenType.New])) {
			this.advance();
			let classNameExpr = null;
			if(this.match([TokenType.LParen])) {
				this.advance();
				classNameExpr = new expr_ParenthesisExpr(this.expression());
				this.consumeSynchronize(TokenType.RParen,"Expected ')' after class name");
			} else {
				classNameExpr = new expr_ConstantExpr(this.consume(TokenType.Label,"Expected class name"));
			}
			this.consume(TokenType.LParen,"Expected '(' after class name");
			let objNameExpr = null;
			let parentObj = null;
			let objArgs = [];
			if(!this.match([TokenType.RParen])) {
				objNameExpr = this.expression();
				if(this.match([TokenType.Colon])) {
					this.advance();
					parentObj = this.consume(TokenType.Label,"Expected parent object name");
				}
				if(this.match([TokenType.Comma])) {
					objArgs = [];
					let objArg = this.expression();
					while(objArg != null) {
						objArgs.push(objArg);
						if(this.match([TokenType.Comma])) {
							this.advance();
							objArg = this.expression();
						} else {
							break;
						}
					}
				}
				this.consumeSynchronize(TokenType.RParen,"Expected ')' after object parameters");
			} else {
				this.advance();
			}
			if(this.match([TokenType.LBracket])) {
				this.advance();
				let slotAssigns = [];
				let sa = this.slotAssign();
				while(sa != null) {
					slotAssigns.push(sa);
					sa = this.slotAssign();
				}
				let subObjects = [];
				let so = this.objectDecl();
				if(so != null) {
					this.consume(TokenType.Semicolon,"Expected ';' after object declaration");
				}
				while(so != null) {
					subObjects.push(so);
					so = this.objectDecl();
					if(so != null) {
						this.consume(TokenType.Semicolon,"Expected ';' after object declaration");
					}
				}
				this.consumeSynchronize(TokenType.RBracket,"Expected '}'");
				return new expr_ObjectDeclExpr(classNameExpr,parentObj,objNameExpr,objArgs,slotAssigns,subObjects,false);
			} else {
				return new expr_ObjectDeclExpr(classNameExpr,parentObj,objNameExpr,objArgs,[],[],false);
			}
		} else {
			return null;
		}
	}
	expression() {
		let chainExpr = null;
		let ternaryExp = null;
		let _gthis = this;
		let primaryExpr = function() {
			if(_gthis.match([TokenType.LParen])) {
				_gthis.advance();
				let subexpr = _gthis.expression();
				_gthis.consume(TokenType.RParen,"Expected ')' after expression");
				return new expr_ParenthesisExpr(subexpr);
			} else if(_gthis.match([TokenType.Minus])) {
				let tok = _gthis.advance();
				let subexpr = chainExpr();
				if(((subexpr) instanceof expr_IntBinaryExpr) || ((subexpr) instanceof expr_FloatBinaryExpr)) {
					let bexpr = js_Boot.__cast(subexpr , expr_BinaryExpr);
					bexpr.left = new expr_FloatUnaryExpr(bexpr.left,tok);
					return bexpr;
				} else {
					return new expr_FloatUnaryExpr(subexpr,tok);
				}
			} else if(_gthis.match([TokenType.Not,TokenType.Tilde])) {
				let tok = _gthis.advance();
				let subexpr = chainExpr();
				if(((subexpr) instanceof expr_IntBinaryExpr) || ((subexpr) instanceof expr_FloatBinaryExpr)) {
					let bexpr = js_Boot.__cast(subexpr , expr_BinaryExpr);
					bexpr.left = new expr_IntUnaryExpr(bexpr.left,tok);
					return bexpr;
				} else {
					return new expr_IntUnaryExpr(subexpr,tok);
				}
			} else if(_gthis.match([TokenType.Modulus,TokenType.Dollar])) {
				let varExpr = _gthis.variable();
				let varIdx = null;
				if(_gthis.match([TokenType.LeftSquareBracket])) {
					_gthis.advance();
					let arrExpr = _gthis.expression();
					if(arrExpr == null) {
						throw new SyntaxError("Expected array index",_gthis.tokens[_gthis.current - 1]);
					}
					while(arrExpr != null) {
						if(varIdx == null) {
							varIdx = arrExpr;
						} else {
							varIdx = new expr_CommaCatExpr(varIdx,arrExpr);
						}
						if(_gthis.match([TokenType.Comma])) {
							_gthis.advance();
							arrExpr = _gthis.expression();
						} else {
							break;
						}
					}
					_gthis.consume(TokenType.RightSquareBracket,"Expected ']' after array index");
				}
				varExpr.arrayIndex = varIdx;
				return varExpr;
			} else if(_gthis.match([TokenType.String])) {
				let str = _gthis.advance();
				return new expr_StringConstExpr(str.line,str.literal,false);
			} else if(_gthis.match([TokenType.TaggedString])) {
				let str = _gthis.advance();
				return new expr_StringConstExpr(str.line,str.literal,true);
			} else if(_gthis.match([TokenType.Label,TokenType.Break])) {
				let label = _gthis.advance();
				return new expr_ConstantExpr(label);
			} else if(_gthis.match([TokenType.Int])) {
				let intTok = _gthis.advance();
				return new expr_IntExpr(intTok.line,Std.parseInt(intTok.literal));
			} else if(_gthis.match([TokenType.Float])) {
				let floatTok = _gthis.advance();
				return new expr_FloatExpr(floatTok.line,parseFloat(floatTok.literal));
			} else if(_gthis.match([TokenType.True])) {
				let trueLine = _gthis.peek().line;
				_gthis.advance();
				return new expr_IntExpr(trueLine,1);
			} else if(_gthis.match([TokenType.False])) {
				let falseLine = _gthis.peek().line;
				_gthis.advance();
				return new expr_IntExpr(falseLine,0);
			} else {
				return null;
			}
		};
		chainExpr = function() {
			let expr = primaryExpr();
			let chExpr = null;
			if(expr != null) {
				if(_gthis.match([TokenType.Dot])) {
					_gthis.advance();
					let labelAccess = _gthis.consume(TokenType.Label,"Expected label after expression");
					let arrAccess = null;
					if(_gthis.match([TokenType.LeftSquareBracket])) {
						_gthis.advance();
						arrAccess = null;
						let arrExpr = _gthis.expression();
						if(arrExpr == null) {
							throw new SyntaxError("Expected expression after '['",_gthis.tokens[_gthis.current - 1]);
						}
						while(arrExpr != null) {
							if(arrAccess == null) {
								arrAccess = arrExpr;
							} else {
								arrAccess = new expr_CommaCatExpr(arrAccess,arrExpr);
							}
							if(_gthis.match([TokenType.Comma])) {
								_gthis.advance();
								arrExpr = _gthis.expression();
							} else {
								break;
							}
						}
						_gthis.consume(TokenType.RightSquareBracket,"Expected ']' after array index");
					}
					let nextTok = _gthis.peek();
					switch(nextTok.type._hx_index) {
					case 20:
						_gthis.advance();
						let rexpr = ternaryExp();
						chExpr = new expr_SlotAssignExpr(expr,arrAccess,labelAccess,rexpr);
						break;
					case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:
						_gthis.advance();
						let rexpr1 = ternaryExp();
						chExpr = new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,rexpr1,nextTok);
						break;
					case 63:
						_gthis.advance();
						if(arrAccess == null) {
							let funcexprs = [expr];
							let funcexpr = _gthis.expression();
							while(funcexpr != null) {
								funcexprs.push(funcexpr);
								if(_gthis.match([TokenType.Comma])) {
									_gthis.advance();
									funcexpr = _gthis.expression();
								} else {
									break;
								}
							}
							_gthis.consume(TokenType.RParen,"Expected ')' after function call arguments");
							chExpr = new expr_FuncCallExpr(labelAccess,null,funcexprs,1);
						} else {
							throw new SyntaxError("Cannot call array methods with a dot notation accessor",_gthis.tokens[_gthis.current - 1]);
						}
						break;
					case 76:case 77:
						_gthis.advance();
						chExpr = new expr_ParenthesisExpr(new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,null,nextTok));
						break;
					default:
						chExpr = new expr_SlotAccessExpr(expr,arrAccess,labelAccess);
					}
				} else if(((expr) instanceof expr_VarExpr)) {
					let varExpr = expr;
					let nextTok = _gthis.peek();
					switch(nextTok.type._hx_index) {
					case 20:
						_gthis.advance();
						let rexpr = ternaryExp();
						chExpr = new expr_AssignExpr(varExpr,rexpr);
						break;
					case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:
						_gthis.advance();
						let rexpr1 = ternaryExp();
						chExpr = new expr_AssignOpExpr(varExpr,rexpr1,nextTok);
						break;
					case 76:case 77:
						_gthis.advance();
						chExpr = new expr_ParenthesisExpr(new expr_AssignOpExpr(varExpr,null,nextTok));
						break;
					default:
						chExpr = varExpr;
					}
				} else if(((expr) instanceof expr_ConstantExpr)) {
					if(_gthis.match([TokenType.LParen])) {
						_gthis.advance();
						let fnname = (js_Boot.__cast(expr , expr_ConstantExpr)).name;
						let fnArgs = [];
						let fnArg = _gthis.expression();
						while(fnArg != null) {
							fnArgs.push(fnArg);
							if(_gthis.match([TokenType.Comma])) {
								_gthis.advance();
								fnArg = _gthis.expression();
							} else {
								break;
							}
						}
						_gthis.consume(TokenType.RParen,"Expected ')' after constant function arguments");
						chExpr = new expr_FuncCallExpr(fnname,null,fnArgs,0);
					} else if(_gthis.match([TokenType.DoubleColon])) {
						_gthis.advance();
						let parentname = (js_Boot.__cast(expr , expr_ConstantExpr)).name;
						let fnname = _gthis.consume(TokenType.Label,"Expected a function name after '::'");
						_gthis.consume(TokenType.LParen,"Expected '(' after constant function name");
						let fnArgs = [];
						let fnArg = _gthis.expression();
						while(fnArg != null) {
							fnArgs.push(fnArg);
							if(_gthis.match([TokenType.Comma])) {
								_gthis.advance();
								fnArg = _gthis.expression();
							} else {
								break;
							}
						}
						_gthis.consume(TokenType.RParen,"Expected ')' after constant function arguments");
						chExpr = new expr_FuncCallExpr(fnname,parentname,fnArgs,(js_Boot.__cast(parentname.literal , String)).toLowerCase() == "parent" ? 2 : 0);
					} else {
						chExpr = expr;
					}
				} else {
					chExpr = expr;
				}
			} else {
				let objD = _gthis.objectDecl();
				if(objD != null) {
					chExpr = objD;
				} else {
					return null;
				}
			}
			while(_gthis.match([TokenType.Dot])) {
				_gthis.advance();
				let label = _gthis.consume(TokenType.Label,"Expected a property name after '.'");
				if(_gthis.match([TokenType.LParen])) {
					_gthis.advance();
					let fnArgs = [chExpr];
					let fnArg = _gthis.expression();
					while(fnArg != null) {
						fnArgs.push(fnArg);
						if(_gthis.match([TokenType.Comma])) {
							_gthis.advance();
							fnArg = _gthis.expression();
						} else {
							break;
						}
					}
					_gthis.consume(TokenType.RParen,"Expected ')' after function arguments");
					chExpr = new expr_FuncCallExpr(label,null,fnArgs,1);
				} else {
					let arrAccess = null;
					if(_gthis.match([TokenType.LeftSquareBracket])) {
						_gthis.advance();
						arrAccess = null;
						let arrExpr = _gthis.expression();
						if(arrExpr == null) {
							throw new SyntaxError("Expected expression after '['",_gthis.tokens[_gthis.current - 1]);
						}
						while(arrExpr != null) {
							if(arrAccess == null) {
								arrAccess = arrExpr;
							} else {
								arrAccess = new expr_CommaCatExpr(arrAccess,arrExpr);
							}
							if(_gthis.match([TokenType.Comma])) {
								_gthis.advance();
								arrExpr = _gthis.expression();
							} else {
								break;
							}
						}
						_gthis.consume(TokenType.RightSquareBracket,"Expected ']' after array index");
					}
					let nextTok = _gthis.peek();
					switch(nextTok.type._hx_index) {
					case 20:
						_gthis.advance();
						let rexpr = ternaryExp();
						chExpr = new expr_SlotAssignExpr(chExpr,arrAccess,label,rexpr);
						break;
					case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:
						_gthis.advance();
						let rexpr1 = ternaryExp();
						chExpr = new expr_SlotAssignOpExpr(chExpr,arrAccess,label,rexpr1,nextTok);
						break;
					case 76:case 77:
						_gthis.advance();
						chExpr = new expr_ParenthesisExpr(new expr_SlotAssignOpExpr(chExpr,arrAccess,label,null,nextTok));
						break;
					default:
						chExpr = new expr_SlotAccessExpr(chExpr,arrAccess,label);
					}
				}
			}
			return chExpr;
		};
		let factorExp = function() {
			let lhs = chainExpr();
			if(_gthis.match([TokenType.Multiply,TokenType.Divide,TokenType.Modulus])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = chainExpr();
				if(rhs == null) {
					throw new SyntaxError("Expected rhs after bitwise operator",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = op.type != TokenType.Modulus ? new expr_FloatBinaryExpr(lhs,rhs,op) : new expr_IntBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.Multiply,TokenType.Divide,TokenType.Modulus])) {
					let op2 = _gthis.advance();
					let rhs2 = chainExpr();
					if(rhs2 == null) {
						throw new SyntaxError("Expected rhs after bitwise operator",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = op2.type != TokenType.Modulus ? new expr_FloatBinaryExpr(rhs,rhs2,op2) : new expr_IntBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let termExp = function() {
			let lhs = factorExp();
			if(_gthis.match([TokenType.Plus,TokenType.Minus])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = factorExp();
				if(rhs == null) {
					throw new SyntaxError("Expected expression after plus/minus operator",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = new expr_FloatBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.Plus,TokenType.Minus])) {
					let op2 = _gthis.advance();
					let rhs2 = factorExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected expression after plus/minus operator",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = new expr_FloatBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let bitshiftExp = function() {
			let lhs = termExp();
			if(_gthis.match([TokenType.LeftBitShift,TokenType.RightBitShift])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = termExp();
				if(rhs == null) {
					throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = new expr_IntBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.LeftBitShift,TokenType.RightBitShift])) {
					let op2 = _gthis.advance();
					let rhs2 = termExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = new expr_IntBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let strOpExp = function() {
			let lhs = bitshiftExp();
			if(_gthis.match([TokenType.Concat,TokenType.TabConcat,TokenType.SpaceConcat,TokenType.NewlineConcat,TokenType.StringEquals,TokenType.StringNotEquals])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = bitshiftExp();
				if(rhs == null) {
					throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
				}
				switch(op.type._hx_index) {
				case 39:case 40:
					rhs = new expr_StrEqExpr(lhs,rhs,op);
					break;
				case 41:case 42:case 43:case 44:
					rhs = new expr_StrCatExpr(lhs,rhs,op);
					break;
				default:
					rhs = null;
				}
				while(_gthis.match([TokenType.Concat,TokenType.TabConcat,TokenType.SpaceConcat,TokenType.NewlineConcat,TokenType.StringEquals,TokenType.StringNotEquals])) {
					let op2 = _gthis.advance();
					let rhs2 = bitshiftExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
					}
					switch(op2.type._hx_index) {
					case 39:case 40:
						rhs = new expr_StrEqExpr(rhs,rhs2,op2);
						break;
					case 41:case 42:case 43:case 44:
						rhs = new expr_StrCatExpr(rhs,rhs2,op2);
						break;
					default:
						rhs = null;
					}
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let relationalExp = function() {
			let lhs = strOpExp();
			if(_gthis.match([TokenType.LessThan,TokenType.GreaterThan,TokenType.LessThanEqual,TokenType.GreaterThanEqual])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = strOpExp();
				if(rhs == null) {
					throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = new expr_IntBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.LessThan,TokenType.GreaterThan,TokenType.LessThanEqual,TokenType.GreaterThanEqual])) {
					let op2 = _gthis.advance();
					let rhs2 = strOpExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = new expr_IntBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let equalityExp = function() {
			let lhs = relationalExp();
			if(_gthis.match([TokenType.Equal,TokenType.NotEqual])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = relationalExp();
				if(rhs == null) {
					throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
				}
				switch(op.type._hx_index) {
				case 36:case 37:
					rhs = new expr_IntBinaryExpr(lhs,rhs,op);
					break;
				default:
					rhs = null;
				}
				while(_gthis.match([TokenType.Equal,TokenType.NotEqual])) {
					let op2 = _gthis.advance();
					let rhs2 = relationalExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
					}
					switch(op.type._hx_index) {
					case 36:case 37:
						rhs = new expr_IntBinaryExpr(rhs,rhs2,op2);
						break;
					default:
						rhs = null;
					}
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let andExp = function() {
			let lhs = equalityExp();
			if(_gthis.match([TokenType.BitwiseAnd])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = equalityExp();
				if(rhs == null) {
					throw new SyntaxError("Expected expression after bitwise operator",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = new expr_IntBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.BitwiseAnd])) {
					let op2 = _gthis.advance();
					let rhs2 = equalityExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected expression after bitwise operator",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = new expr_IntBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let xorExp = function() {
			let lhs = andExp();
			if(_gthis.match([TokenType.BitwiseXor])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = andExp();
				if(rhs == null) {
					throw new SyntaxError("Expected expression after bitwise operator",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = new expr_IntBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.BitwiseXor])) {
					let op2 = _gthis.advance();
					let rhs2 = andExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected expression after bitwise operator",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = new expr_IntBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let orExp = function() {
			let lhs = xorExp();
			if(_gthis.match([TokenType.BitwiseOr])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = xorExp();
				if(rhs == null) {
					throw new SyntaxError("Expected expression after bitwise operator",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = new expr_IntBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.BitwiseOr])) {
					let op2 = _gthis.advance();
					let rhs2 = xorExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected expression after bitwise operator",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = new expr_IntBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		let logicalExp = function() {
			let lhs = orExp();
			if(_gthis.match([TokenType.LogicalAnd,TokenType.LogicalOr])) {
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let op = _gthis.advance();
				let rhs = orExp();
				if(rhs == null) {
					throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
				}
				rhs = new expr_IntBinaryExpr(lhs,rhs,op);
				while(_gthis.match([TokenType.LogicalAnd,TokenType.LogicalOr])) {
					let op2 = _gthis.advance();
					let rhs2 = orExp();
					if(rhs2 == null) {
						throw new SyntaxError("Expected right hand side",_gthis.tokens[_gthis.current - 1]);
					}
					rhs = new expr_IntBinaryExpr(rhs,rhs2,op2);
				}
				if(lhsAssign) {
					lhsExpr.expr = rhs;
					return lhsExpr;
				} else {
					return rhs;
				}
			} else {
				return lhs;
			}
		};
		ternaryExp = function() {
			let lhs = logicalExp();
			if(_gthis.match([TokenType.QuestionMark])) {
				_gthis.advance();
				let lhsExpr = null;
				let lhsAssign = false;
				if(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {
					lhsExpr = lhs;
					lhs = lhsExpr.expr;
					lhsAssign = true;
				}
				let trueExpr = _gthis.expression();
				if(trueExpr == null) {
					throw new SyntaxError("Expected true expression",_gthis.tokens[_gthis.current - 1]);
				}
				_gthis.consume(TokenType.Colon,"Expected : after true expression");
				let falseExpr = _gthis.expression();
				if(falseExpr == null) {
					throw new SyntaxError("Expected false expression",_gthis.tokens[_gthis.current - 1]);
				}
				if(lhsAssign) {
					lhsExpr.expr = new expr_ConditionalExpr(lhs,trueExpr,falseExpr);
					return lhsExpr;
				} else {
					return new expr_ConditionalExpr(lhs,trueExpr,falseExpr);
				}
			} else {
				return lhs;
			}
		};
		return ternaryExp();
	}
	isAtEnd() {
		return this.current >= this.tokens.length;
	}
	peek() {
		return this.tokens[this.current];
	}
	previous() {
		return this.tokens[this.current - 1];
	}
	advance() {
		if(!this.isAtEnd()) {
			this.current++;
		}
		return this.tokens[this.current - 1];
	}
	consume(tokenType,message) {
		if(this.check(tokenType)) {
			this.advance();
			return this.previous();
		}
		throw new SyntaxError(message,this.tokens[this.current - 1]);
	}
	consumeSynchronize(tokenType,message) {
		if(this.check(tokenType)) {
			this.advance();
			return this.previous();
		}
		if(!this.panicMode) {
			this.syntaxErrors.push(new SyntaxError(message,this.tokens[this.current - 1]));
			this.panicMode = true;
		}
		while(!this.check(tokenType) && !this.isAtEnd()) this.advance();
		this.advance();
		this.panicMode = false;
		return this.previous();
	}
	match(types) {
		let _g = 0;
		while(_g < types.length) {
			let type = types[_g];
			++_g;
			if(this.check(type)) {
				return true;
			}
		}
		return false;
	}
	check(type) {
		if(this.isAtEnd()) {
			return false;
		}
		return this.peek().type == type;
	}
	enterScope() {
		let _this = this.positionStack;
		_this.head = new haxe_ds_GenericCell(this.current,_this.head);
	}
	exitScope() {
		let _this = this.positionStack;
		let k = _this.head;
		let tmp;
		if(k == null) {
			tmp = null;
		} else {
			_this.head = k.next;
			tmp = k.elt;
		}
		this.current = tmp;
	}
}
$hx_exports["Parser"] = Parser;
Parser.__name__ = true;
Object.assign(Parser.prototype, {
	__class__: Parser
});
class Reflect {
	static compare(a,b) {
		if(a == b) {
			return 0;
		} else if(a > b) {
			return 1;
		} else {
			return -1;
		}
	}
	static isEnumValue(v) {
		if(v != null) {
			return v.__enum__ != null;
		} else {
			return false;
		}
	}
}
Reflect.__name__ = true;
class Scanner {
	constructor(s) {
		let _g = new haxe_ds_StringMap();
		_g.h["datablock"] = TokenType.Datablock;
		_g.h["package"] = TokenType.Package;
		_g.h["function"] = TokenType.Function;
		_g.h["if"] = TokenType.If;
		_g.h["else"] = TokenType.Else;
		_g.h["while"] = TokenType.While;
		_g.h["for"] = TokenType.For;
		_g.h["break"] = TokenType.Break;
		_g.h["continue"] = TokenType.Continue;
		_g.h["case"] = TokenType.Case;
		_g.h["switch"] = TokenType.Switch;
		_g.h["return"] = TokenType.Return;
		_g.h["new"] = TokenType.New;
		_g.h["true"] = TokenType.True;
		_g.h["false"] = TokenType.False;
		_g.h["default"] = TokenType.Default;
		_g.h["or"] = TokenType.Or;
		this.keywords = _g;
		this.line = 1;
		this.current = 0;
		this.start = 0;
		this.tokens = [];
		this.source = s;
	}
	scanTokens() {
		while(!this.isAtEnd()) {
			this.start = this.current;
			this.scanToken();
		}
		return this.tokens;
	}
	isAtEnd() {
		return this.current >= this.source.length;
	}
	scanToken() {
		let c = this.advance();
		switch(c) {
		case 10:
			let x = c;
			if(49 <= x && x <= 57) {
				this.number();
			} else {
				this.line++;
			}
			break;
		case 9:case 13:case 32:
			let x1 = c;
			if(49 <= x1 && x1 <= 57) {
				this.number();
			} else {
				let a = 1;
			}
			break;
		case 33:
			if(this.match("=")) {
				this.addToken(TokenType.NotEqual);
			} else if(this.match("$")) {
				if(this.match("=")) {
					this.addToken(TokenType.StringNotEquals);
				} else {
					this.addToken(TokenType.Not);
					this.addToken(TokenType.Dollar);
				}
			} else {
				this.addToken(TokenType.Not);
			}
			break;
		case 34:
			this.string(34,TokenType.String);
			break;
		case 36:
			this.addToken(this.match("=") ? TokenType.StringEquals : TokenType.Dollar);
			break;
		case 37:
			this.addToken(this.match("=") ? TokenType.ModulusAssign : TokenType.Modulus);
			break;
		case 38:
			this.addToken(this.match("=") ? TokenType.AndAssign : this.match("&") ? TokenType.LogicalAnd : TokenType.BitwiseAnd);
			break;
		case 39:
			this.string(39,TokenType.TaggedString);
			break;
		case 40:
			this.addToken(TokenType.LParen);
			break;
		case 41:
			this.addToken(TokenType.RParen);
			break;
		case 42:
			this.addToken(this.match("=") ? TokenType.MultiplyAssign : TokenType.Multiply);
			break;
		case 43:
			this.addToken(this.match("=") ? TokenType.PlusAssign : this.match("+") ? TokenType.PlusPlus : TokenType.Plus);
			break;
		case 44:
			this.addToken(TokenType.Comma);
			break;
		case 45:
			this.addToken(this.match("=") ? TokenType.MinusAssign : this.match("-") ? TokenType.MinusMinus : TokenType.Minus);
			break;
		case 46:
			this.addToken(TokenType.Dot);
			break;
		case 47:
			if(this.match("/")) {
				let commentBegin = this.start;
				while(this.peek() != 10 && !this.isAtEnd()) this.advance();
				this.addToken(TokenType.Comment(false),this.source.substring(commentBegin + 2,this.current));
			} else if(this.match("*")) {
				let commentBegin = this.start;
				while(this.peek() != 42 || this.peekNext() != 47) {
					if(this.isAtEnd()) {
						console.log("src/Scanner.hx:98:","Unterminated comment.");
					}
					this.advance();
				}
				this.addToken(TokenType.Comment(true),this.source.substring(commentBegin + 2,this.current));
				this.advance();
				this.advance();
			} else {
				this.addToken(this.match("=") ? TokenType.DivideAssign : TokenType.Divide);
			}
			break;
		case 48:
			if(this.match("x")) {
				this.hexNumber();
			} else {
				this.number();
			}
			break;
		case 58:
			this.addToken(this.match(":") ? TokenType.DoubleColon : TokenType.Colon);
			break;
		case 59:
			this.addToken(TokenType.Semicolon);
			break;
		case 60:
			this.addToken(this.match("=") ? TokenType.LessThanEqual : this.match("<") ? this.match("=") ? TokenType.ShiftLeftAssign : TokenType.LeftBitShift : TokenType.LessThan);
			break;
		case 61:
			this.addToken(this.match("=") ? TokenType.Equal : TokenType.Assign);
			break;
		case 62:
			this.addToken(this.match("=") ? TokenType.GreaterThanEqual : this.match(">") ? this.match("=") ? TokenType.ShiftRightAssign : TokenType.RightBitShift : TokenType.GreaterThan);
			break;
		case 63:
			this.addToken(TokenType.QuestionMark);
			break;
		case 64:
			this.addToken(TokenType.Concat);
			break;
		case 91:
			this.addToken(TokenType.LeftSquareBracket);
			break;
		case 93:
			this.addToken(TokenType.RightSquareBracket);
			break;
		case 94:
			this.addToken(this.match("=") ? TokenType.XorAssign : TokenType.BitwiseXor);
			break;
		case 123:
			this.addToken(TokenType.LBracket);
			break;
		case 124:
			this.addToken(this.match("=") ? TokenType.OrAssign : this.match("|") ? TokenType.LogicalOr : TokenType.BitwiseOr);
			break;
		case 125:
			this.addToken(TokenType.RBracket);
			break;
		case 126:
			this.addToken(TokenType.Tilde);
			break;
		default:
			let x2 = c;
			if(49 <= x2 && x2 <= 57) {
				this.number();
			} else if(this.isAlpha(c)) {
				this.identifier();
			} else {
				console.log("src/Scanner.hx:165:","Unexpected character " + this.line + " - " + c);
			}
		}
	}
	advance() {
		return this.source.charCodeAt(this.current++);
	}
	peekPrev() {
		if(this.current == 0) {
			return "";
		}
		return this.source.charAt(this.current - 1);
	}
	peekPrev2() {
		if(this.current <= 1) {
			return "";
		}
		return this.source.charAt(this.current - 2);
	}
	peek() {
		if(this.isAtEnd()) {
			return 0;
		}
		return this.source.charCodeAt(this.current);
	}
	addToken(type,literal) {
		let text = this.source.substring(this.start,this.current);
		this.tokens.push(new Token(type,text,literal,this.line,this.start));
	}
	match(expected) {
		if(this.isAtEnd()) {
			return false;
		}
		if(this.source.charAt(this.current) != expected) {
			return false;
		}
		this.current++;
		return true;
	}
	string(delimiter,tokenType) {
		let doingEscapeSequence = false;
		while(this.peek() != delimiter && !this.isAtEnd() || doingEscapeSequence) {
			if(this.peek() == 10) {
				this.line++;
			}
			if(!doingEscapeSequence) {
				if(this.peek() == 92) {
					doingEscapeSequence = true;
				}
			} else {
				doingEscapeSequence = false;
			}
			this.advance();
		}
		if(this.isAtEnd()) {
			console.log("src/Scanner.hx:224:","Unterminated string");
			return;
		}
		this.advance();
		let value = Scanner.unescape(this.source.substring(this.start + 1,this.current - 1));
		this.addToken(tokenType,value);
	}
	isDigit(cd) {
		if(cd >= 48) {
			return cd <= 57;
		} else {
			return false;
		}
	}
	isAlpha(cd) {
		if(!(cd >= 97 && cd <= 122 || cd >= 65 && cd <= 90)) {
			return cd == 95;
		} else {
			return true;
		}
	}
	isAlphaNumeric(c) {
		if(!this.isAlpha(c)) {
			return this.isDigit(c);
		} else {
			return true;
		}
	}
	peekNext() {
		if(this.current + 1 >= this.source.length) {
			return 0;
		}
		return this.source.charCodeAt(this.current + 1);
	}
	hexNumber() {
		while(true) {
			let c = this.peek();
			if(c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
				this.advance();
			} else {
				break;
			}
		}
		this.addToken(TokenType.HexInt,this.source.substring(this.start,this.current));
	}
	number() {
		while(this.isDigit(this.peek())) this.advance();
		let isFloat = false;
		if(this.peek() == 46 && this.isDigit(this.peekNext())) {
			isFloat = true;
			this.advance();
			while(this.isDigit(this.peek())) this.advance();
			if(this.peek() == 101 || this.peek() == 69) {
				this.advance();
				if(this.peek() == 43 || this.peek() == 45) {
					this.advance();
				}
				while(this.isDigit(this.peek())) this.advance();
			}
		}
		if(this.peek() == 101 || this.peek() == 69) {
			isFloat = true;
			this.advance();
			if(this.peek() == 43 || this.peek() == 45) {
				this.advance();
			}
			while(this.isDigit(this.peek())) this.advance();
		}
		if(isFloat) {
			this.addToken(TokenType.Float,this.source.substring(this.start,this.current));
		} else {
			this.addToken(TokenType.Int,this.source.substring(this.start,this.current));
		}
	}
	identifier() {
		while(this.isAlphaNumeric(this.peek())) this.advance();
		let text = this.source.substring(this.start,this.current);
		if(Object.prototype.hasOwnProperty.call(this.keywords.h,text)) {
			this.addToken(this.keywords.h[text],text);
		} else if(text == "SPC") {
			this.addToken(TokenType.SpaceConcat,text);
		} else if(text == "NL") {
			this.addToken(TokenType.NewlineConcat,text);
		} else if(text == "TAB") {
			this.addToken(TokenType.TabConcat,text);
		} else {
			this.addToken(TokenType.Label,text);
		}
	}
	static unescape(s) {
		let escapeFrom = ["\\t","\\n","\\r","\\\"","\\'","\\\\","\\c0","\\c1","\\c2","\\c3","\\c4","\\c5","\\c6","\\c7","\\c8","\\c9","\\cr","\\cp","\\co"];
		let escapeTo = ["\t","\n","\r","\"","'","\\","\x01","\x02","\x03","\x04","\x05","\x06","\x07","\x0B","\x0C","\x0E","\x0F","\x10","\x11"];
		let _g = 0;
		let _g1 = escapeFrom.length;
		while(_g < _g1) {
			let i = _g++;
			if(s.includes(escapeFrom[i])) {
				s = StringTools.replace(s,escapeFrom[i],escapeTo[i]);
			}
		}
		if(HxOverrides.cca(s,0) == 1) {
			s = "\x02" + s;
		}
		let newStr = s;
		while(newStr.indexOf("\\x") != -1) {
			if(newStr.indexOf("\\x") == newStr.length - 2) {
				break;
			}
			let hexString = newStr.substring(newStr.indexOf("\\x") + 2,newStr.indexOf("\\x") + 4);
			let intValue = Std.parseInt("0x" + hexString);
			newStr = newStr.substring(0,newStr.indexOf("\\x")) + String.fromCodePoint(intValue) + newStr.substring(newStr.indexOf("\\x") + 4);
		}
		return newStr;
	}
	static escape(s) {
		let escapeFrom = ["\\","'","\"","\x1F","\x1E","\x1D","\x1C","\x1B","\x1A","\x19","\x18","\x17","\x16","\x15","\x14","\x13","\x12","\x11","\x10","\x0F","\x0E","\r","\x0C","\x0B","\n","\t","\x08","\x07","\x06","\x05","\x04","\x03","\x02","\x01"];
		let escapeTo = ["\\\\","\\'","\\\"","\\x1F","\\x1E","\\x1D","\\x1C","\\x1B","\\x1A","\\x19","\\x18","\\x17","\\x16","\\x15","\\x14","\\x13","\\x12","\\co","\\cp","\\cr","\\c9","\\r","\\c8","\\c7","\\n","\\t","\\x08","\\c6","\\c5","\\c4","\\c3","\\c2","\\c1","\\c0"];
		let tagged = false;
		if(HxOverrides.cca(s,0) == 2 && HxOverrides.cca(s,1) == 1) {
			s = HxOverrides.substr(s,1,null);
			tagged = true;
		}
		let _g = 0;
		let _g1 = escapeFrom.length;
		while(_g < _g1) {
			let i = _g++;
			s = StringTools.replace(s,escapeFrom[i],escapeTo[i]);
		}
		if(tagged) {
			s = "\x01" + HxOverrides.substr(s,3,null);
		}
		return s;
	}
}
$hx_exports["Scanner"] = Scanner;
Scanner.__name__ = true;
Object.assign(Scanner.prototype, {
	__class__: Scanner
});
class Std {
	static string(s) {
		return js_Boot.__string_rec(s,"");
	}
	static parseInt(x) {
		if(x != null) {
			let _g = 0;
			let _g1 = x.length;
			while(_g < _g1) {
				let i = _g++;
				let c = x.charCodeAt(i);
				if(c <= 8 || c >= 14 && c != 32 && c != 45) {
					let nc = x.charCodeAt(i + 1);
					let v = parseInt(x,nc == 120 || nc == 88 ? 16 : 10);
					if(isNaN(v)) {
						return null;
					} else {
						return v;
					}
				}
			}
		}
		return null;
	}
}
Std.__name__ = true;
class StringBuf {
	constructor() {
		this.b = "";
	}
}
StringBuf.__name__ = true;
Object.assign(StringBuf.prototype, {
	__class__: StringBuf
});
class StringTools {
	static isSpace(s,pos) {
		let c = HxOverrides.cca(s,pos);
		if(!(c > 8 && c < 14)) {
			return c == 32;
		} else {
			return true;
		}
	}
	static ltrim(s) {
		let l = s.length;
		let r = 0;
		while(r < l && StringTools.isSpace(s,r)) ++r;
		if(r > 0) {
			return HxOverrides.substr(s,r,l - r);
		} else {
			return s;
		}
	}
	static rtrim(s) {
		let l = s.length;
		let r = 0;
		while(r < l && StringTools.isSpace(s,l - r - 1)) ++r;
		if(r > 0) {
			return HxOverrides.substr(s,0,l - r);
		} else {
			return s;
		}
	}
	static trim(s) {
		return StringTools.ltrim(StringTools.rtrim(s));
	}
	static lpad(s,c,l) {
		if(c.length <= 0) {
			return s;
		}
		let buf_b = "";
		l -= s.length;
		while(buf_b.length < l) buf_b += c == null ? "null" : "" + c;
		buf_b += s == null ? "null" : "" + s;
		return buf_b;
	}
	static rpad(s,c,l) {
		if(c.length <= 0) {
			return s;
		}
		let buf_b = "";
		buf_b += s == null ? "null" : "" + s;
		while(buf_b.length < l) buf_b += c == null ? "null" : "" + c;
		return buf_b;
	}
	static replace(s,sub,by) {
		return s.split(sub).join(by);
	}
}
StringTools.__name__ = true;
class haxe_Exception extends Error {
	constructor(message,previous,native) {
		super(message);
		this.message = message;
		this.__previousException = previous;
		this.__nativeException = native != null ? native : this;
	}
	toString() {
		return this.get_message();
	}
	get_message() {
		return this.message;
	}
	get_native() {
		return this.__nativeException;
	}
	static caught(value) {
		if(((value) instanceof haxe_Exception)) {
			return value;
		} else if(((value) instanceof Error)) {
			return new haxe_Exception(value.message,null,value);
		} else {
			return new haxe_ValueException(value,null,value);
		}
	}
	static thrown(value) {
		if(((value) instanceof haxe_Exception)) {
			return value.get_native();
		} else if(((value) instanceof Error)) {
			return value;
		} else {
			let e = new haxe_ValueException(value);
			return e;
		}
	}
}
haxe_Exception.__name__ = true;
haxe_Exception.__super__ = Error;
Object.assign(haxe_Exception.prototype, {
	__class__: haxe_Exception
});
class SyntaxError extends haxe_Exception {
	constructor(msg,token) {
		super(msg);
		this.token = token;
	}
	toString() {
		let origmsg = super.toString();
		origmsg += " at line " + this.token.line + ", column " + this.token.position + ", token: " + this.token.lexeme;
		return origmsg;
	}
}
SyntaxError.__name__ = true;
SyntaxError.__super__ = haxe_Exception;
Object.assign(SyntaxError.prototype, {
	__class__: SyntaxError
});
class Token {
	constructor(type,lexeme,literal,line,position) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
		this.position = position;
	}
}
Token.__name__ = true;
Object.assign(Token.prototype, {
	__class__: Token
});
var TokenType = $hxEnums["TokenType"] = { __ename__:true,__constructs__:null
	,Datablock: {_hx_name:"Datablock",_hx_index:0,__enum__:"TokenType",toString:$estr}
	,Package: {_hx_name:"Package",_hx_index:1,__enum__:"TokenType",toString:$estr}
	,Function: {_hx_name:"Function",_hx_index:2,__enum__:"TokenType",toString:$estr}
	,If: {_hx_name:"If",_hx_index:3,__enum__:"TokenType",toString:$estr}
	,Else: {_hx_name:"Else",_hx_index:4,__enum__:"TokenType",toString:$estr}
	,Switch: {_hx_name:"Switch",_hx_index:5,__enum__:"TokenType",toString:$estr}
	,Case: {_hx_name:"Case",_hx_index:6,__enum__:"TokenType",toString:$estr}
	,Return: {_hx_name:"Return",_hx_index:7,__enum__:"TokenType",toString:$estr}
	,Break: {_hx_name:"Break",_hx_index:8,__enum__:"TokenType",toString:$estr}
	,New: {_hx_name:"New",_hx_index:9,__enum__:"TokenType",toString:$estr}
	,While: {_hx_name:"While",_hx_index:10,__enum__:"TokenType",toString:$estr}
	,For: {_hx_name:"For",_hx_index:11,__enum__:"TokenType",toString:$estr}
	,True: {_hx_name:"True",_hx_index:12,__enum__:"TokenType",toString:$estr}
	,False: {_hx_name:"False",_hx_index:13,__enum__:"TokenType",toString:$estr}
	,Default: {_hx_name:"Default",_hx_index:14,__enum__:"TokenType",toString:$estr}
	,Plus: {_hx_name:"Plus",_hx_index:15,__enum__:"TokenType",toString:$estr}
	,Minus: {_hx_name:"Minus",_hx_index:16,__enum__:"TokenType",toString:$estr}
	,Multiply: {_hx_name:"Multiply",_hx_index:17,__enum__:"TokenType",toString:$estr}
	,Divide: {_hx_name:"Divide",_hx_index:18,__enum__:"TokenType",toString:$estr}
	,Modulus: {_hx_name:"Modulus",_hx_index:19,__enum__:"TokenType",toString:$estr}
	,Assign: {_hx_name:"Assign",_hx_index:20,__enum__:"TokenType",toString:$estr}
	,PlusAssign: {_hx_name:"PlusAssign",_hx_index:21,__enum__:"TokenType",toString:$estr}
	,MinusAssign: {_hx_name:"MinusAssign",_hx_index:22,__enum__:"TokenType",toString:$estr}
	,MultiplyAssign: {_hx_name:"MultiplyAssign",_hx_index:23,__enum__:"TokenType",toString:$estr}
	,OrAssign: {_hx_name:"OrAssign",_hx_index:24,__enum__:"TokenType",toString:$estr}
	,AndAssign: {_hx_name:"AndAssign",_hx_index:25,__enum__:"TokenType",toString:$estr}
	,XorAssign: {_hx_name:"XorAssign",_hx_index:26,__enum__:"TokenType",toString:$estr}
	,ModulusAssign: {_hx_name:"ModulusAssign",_hx_index:27,__enum__:"TokenType",toString:$estr}
	,DivideAssign: {_hx_name:"DivideAssign",_hx_index:28,__enum__:"TokenType",toString:$estr}
	,ShiftLeftAssign: {_hx_name:"ShiftLeftAssign",_hx_index:29,__enum__:"TokenType",toString:$estr}
	,ShiftRightAssign: {_hx_name:"ShiftRightAssign",_hx_index:30,__enum__:"TokenType",toString:$estr}
	,LessThan: {_hx_name:"LessThan",_hx_index:31,__enum__:"TokenType",toString:$estr}
	,GreaterThan: {_hx_name:"GreaterThan",_hx_index:32,__enum__:"TokenType",toString:$estr}
	,LessThanEqual: {_hx_name:"LessThanEqual",_hx_index:33,__enum__:"TokenType",toString:$estr}
	,GreaterThanEqual: {_hx_name:"GreaterThanEqual",_hx_index:34,__enum__:"TokenType",toString:$estr}
	,Not: {_hx_name:"Not",_hx_index:35,__enum__:"TokenType",toString:$estr}
	,NotEqual: {_hx_name:"NotEqual",_hx_index:36,__enum__:"TokenType",toString:$estr}
	,Equal: {_hx_name:"Equal",_hx_index:37,__enum__:"TokenType",toString:$estr}
	,Tilde: {_hx_name:"Tilde",_hx_index:38,__enum__:"TokenType",toString:$estr}
	,StringEquals: {_hx_name:"StringEquals",_hx_index:39,__enum__:"TokenType",toString:$estr}
	,StringNotEquals: {_hx_name:"StringNotEquals",_hx_index:40,__enum__:"TokenType",toString:$estr}
	,Concat: {_hx_name:"Concat",_hx_index:41,__enum__:"TokenType",toString:$estr}
	,SpaceConcat: {_hx_name:"SpaceConcat",_hx_index:42,__enum__:"TokenType",toString:$estr}
	,TabConcat: {_hx_name:"TabConcat",_hx_index:43,__enum__:"TokenType",toString:$estr}
	,NewlineConcat: {_hx_name:"NewlineConcat",_hx_index:44,__enum__:"TokenType",toString:$estr}
	,Continue: {_hx_name:"Continue",_hx_index:45,__enum__:"TokenType",toString:$estr}
	,LogicalAnd: {_hx_name:"LogicalAnd",_hx_index:46,__enum__:"TokenType",toString:$estr}
	,LogicalOr: {_hx_name:"LogicalOr",_hx_index:47,__enum__:"TokenType",toString:$estr}
	,LeftBitShift: {_hx_name:"LeftBitShift",_hx_index:48,__enum__:"TokenType",toString:$estr}
	,RightBitShift: {_hx_name:"RightBitShift",_hx_index:49,__enum__:"TokenType",toString:$estr}
	,BitwiseAnd: {_hx_name:"BitwiseAnd",_hx_index:50,__enum__:"TokenType",toString:$estr}
	,BitwiseOr: {_hx_name:"BitwiseOr",_hx_index:51,__enum__:"TokenType",toString:$estr}
	,BitwiseXor: {_hx_name:"BitwiseXor",_hx_index:52,__enum__:"TokenType",toString:$estr}
	,Label: {_hx_name:"Label",_hx_index:53,__enum__:"TokenType",toString:$estr}
	,Int: {_hx_name:"Int",_hx_index:54,__enum__:"TokenType",toString:$estr}
	,HexInt: {_hx_name:"HexInt",_hx_index:55,__enum__:"TokenType",toString:$estr}
	,Digit: {_hx_name:"Digit",_hx_index:56,__enum__:"TokenType",toString:$estr}
	,HexDigit: {_hx_name:"HexDigit",_hx_index:57,__enum__:"TokenType",toString:$estr}
	,String: {_hx_name:"String",_hx_index:58,__enum__:"TokenType",toString:$estr}
	,TaggedString: {_hx_name:"TaggedString",_hx_index:59,__enum__:"TokenType",toString:$estr}
	,Exp: {_hx_name:"Exp",_hx_index:60,__enum__:"TokenType",toString:$estr}
	,Float: {_hx_name:"Float",_hx_index:61,__enum__:"TokenType",toString:$estr}
	,Ws: {_hx_name:"Ws",_hx_index:62,__enum__:"TokenType",toString:$estr}
	,LParen: {_hx_name:"LParen",_hx_index:63,__enum__:"TokenType",toString:$estr}
	,Colon: {_hx_name:"Colon",_hx_index:64,__enum__:"TokenType",toString:$estr}
	,RParen: {_hx_name:"RParen",_hx_index:65,__enum__:"TokenType",toString:$estr}
	,LBracket: {_hx_name:"LBracket",_hx_index:66,__enum__:"TokenType",toString:$estr}
	,RBracket: {_hx_name:"RBracket",_hx_index:67,__enum__:"TokenType",toString:$estr}
	,DoubleColon: {_hx_name:"DoubleColon",_hx_index:68,__enum__:"TokenType",toString:$estr}
	,Comma: {_hx_name:"Comma",_hx_index:69,__enum__:"TokenType",toString:$estr}
	,Semicolon: {_hx_name:"Semicolon",_hx_index:70,__enum__:"TokenType",toString:$estr}
	,LeftSquareBracket: {_hx_name:"LeftSquareBracket",_hx_index:71,__enum__:"TokenType",toString:$estr}
	,RightSquareBracket: {_hx_name:"RightSquareBracket",_hx_index:72,__enum__:"TokenType",toString:$estr}
	,Or: {_hx_name:"Or",_hx_index:73,__enum__:"TokenType",toString:$estr}
	,Dollar: {_hx_name:"Dollar",_hx_index:74,__enum__:"TokenType",toString:$estr}
	,Dot: {_hx_name:"Dot",_hx_index:75,__enum__:"TokenType",toString:$estr}
	,PlusPlus: {_hx_name:"PlusPlus",_hx_index:76,__enum__:"TokenType",toString:$estr}
	,MinusMinus: {_hx_name:"MinusMinus",_hx_index:77,__enum__:"TokenType",toString:$estr}
	,QuestionMark: {_hx_name:"QuestionMark",_hx_index:78,__enum__:"TokenType",toString:$estr}
	,Eof: {_hx_name:"Eof",_hx_index:79,__enum__:"TokenType",toString:$estr}
	,Comment: ($_=function(multiline) { return {_hx_index:80,multiline:multiline,__enum__:"TokenType",toString:$estr}; },$_._hx_name="Comment",$_.__params__ = ["multiline"],$_)
	,Unknown: {_hx_name:"Unknown",_hx_index:81,__enum__:"TokenType",toString:$estr}
};
TokenType.__constructs__ = [TokenType.Datablock,TokenType.Package,TokenType.Function,TokenType.If,TokenType.Else,TokenType.Switch,TokenType.Case,TokenType.Return,TokenType.Break,TokenType.New,TokenType.While,TokenType.For,TokenType.True,TokenType.False,TokenType.Default,TokenType.Plus,TokenType.Minus,TokenType.Multiply,TokenType.Divide,TokenType.Modulus,TokenType.Assign,TokenType.PlusAssign,TokenType.MinusAssign,TokenType.MultiplyAssign,TokenType.OrAssign,TokenType.AndAssign,TokenType.XorAssign,TokenType.ModulusAssign,TokenType.DivideAssign,TokenType.ShiftLeftAssign,TokenType.ShiftRightAssign,TokenType.LessThan,TokenType.GreaterThan,TokenType.LessThanEqual,TokenType.GreaterThanEqual,TokenType.Not,TokenType.NotEqual,TokenType.Equal,TokenType.Tilde,TokenType.StringEquals,TokenType.StringNotEquals,TokenType.Concat,TokenType.SpaceConcat,TokenType.TabConcat,TokenType.NewlineConcat,TokenType.Continue,TokenType.LogicalAnd,TokenType.LogicalOr,TokenType.LeftBitShift,TokenType.RightBitShift,TokenType.BitwiseAnd,TokenType.BitwiseOr,TokenType.BitwiseXor,TokenType.Label,TokenType.Int,TokenType.HexInt,TokenType.Digit,TokenType.HexDigit,TokenType.String,TokenType.TaggedString,TokenType.Exp,TokenType.Float,TokenType.Ws,TokenType.LParen,TokenType.Colon,TokenType.RParen,TokenType.LBracket,TokenType.RBracket,TokenType.DoubleColon,TokenType.Comma,TokenType.Semicolon,TokenType.LeftSquareBracket,TokenType.RightSquareBracket,TokenType.Or,TokenType.Dollar,TokenType.Dot,TokenType.PlusPlus,TokenType.MinusMinus,TokenType.QuestionMark,TokenType.Eof,TokenType.Comment,TokenType.Unknown];
class Type {
	static enumParameters(e) {
		let enm = $hxEnums[e.__enum__];
		let params = enm.__constructs__[e._hx_index].__params__;
		if(params != null) {
			let _g = [];
			let _g1 = 0;
			while(_g1 < params.length) {
				let p = params[_g1];
				++_g1;
				_g.push(e[p]);
			}
			return _g;
		} else {
			return [];
		}
	}
}
Type.__name__ = true;
class BytesExtensions {
	static strlen(b,start) {
		let slen = 0;
		while(b.b[start] != 0) {
			++start;
			++slen;
		}
		return slen;
	}
	static getBytes(s) {
		let bytes = new haxe_io_Bytes(new ArrayBuffer(s.length + 1));
		let _g = 0;
		let _g1 = s.length;
		while(_g < _g1) {
			let i = _g++;
			let v = s.charCodeAt(i);
			bytes.b[i] = v;
		}
		bytes.b[s.length] = 0;
		return bytes;
	}
	static getString(buffer,start) {
		let sbuf_b = "";
		let i = start;
		while(buffer.b[i] != 0) {
			let c = buffer.b[i];
			sbuf_b += String.fromCodePoint(c);
			++i;
		}
		return sbuf_b;
	}
}
BytesExtensions.__name__ = true;
class StringStack {
	constructor() {
		this.functionOffset = 0;
		this.startStackSize = 0;
		this.len = 0;
		this.start = 0;
		this.argc = 0;
		this.numFrames = 0;
		this.startOffsets = [];
		this.frameOffsets = [];
		this.bufferSize = 0;
		this.argBufferSize = 0;
		this.buffer = new haxe_io_Bytes(new ArrayBuffer(1024));
		this.argBuffer = new haxe_io_Bytes(new ArrayBuffer(1024));
		this.numFrames = 0;
		this.start = 0;
		this.len = 0;
		this.startStackSize = 0;
		this.functionOffset = 0;
		let _g = 0;
		while(_g < 1024) {
			let i = _g++;
			this.frameOffsets.push(0);
			this.startOffsets.push(0);
		}
		this.validateBufferSize(8092);
		this.validateArgBufferSize(2048);
	}
	validateBufferSize(size) {
		if(size > this.bufferSize) {
			this.bufferSize = size + 2048;
			let newbuf = new haxe_io_Bytes(new ArrayBuffer(this.bufferSize));
			newbuf.blit(0,this.buffer,0,this.buffer.length);
			this.buffer = newbuf;
		}
	}
	validateArgBufferSize(size) {
		if(size > this.argBufferSize) {
			this.argBufferSize = size + 2048;
			let newbuf = new haxe_io_Bytes(new ArrayBuffer(this.argBufferSize));
			newbuf.blit(0,this.argBuffer,0,this.argBuffer.length);
			this.argBuffer = newbuf;
		}
	}
	setIntValue(i) {
		this.validateBufferSize(this.start + 32);
		let s = BytesExtensions.getBytes("" + i);
		this.buffer.blit(this.start,s,0,s.length);
		this.len = s.length - 1;
	}
	setFloatValue(i) {
		this.validateBufferSize(this.start + 32);
		let s = BytesExtensions.getBytes("" + i);
		this.buffer.blit(this.start,s,0,s.length);
		this.len = s.length - 1;
	}
	clearFunctionOffset() {
		this.functionOffset = 0;
	}
	setStringValue(s) {
		if(s == null) {
			this.len = 0;
			this.buffer.b[this.start] = 0;
			return;
		}
		let sbuf = BytesExtensions.getBytes(s);
		this.len = sbuf.length - 1;
		this.validateBufferSize(this.start + this.len + 2);
		this.buffer.blit(this.start,sbuf,0,sbuf.length);
	}
	getSTValue() {
		let sbuf_b = "";
		let i = this.start;
		while(this.buffer.b[i] != 0) {
			let c = this.buffer.b[i];
			sbuf_b += String.fromCodePoint(c);
			++i;
		}
		return sbuf_b;
	}
	getIntValue() {
		let s = this.getSTValue();
		return Std.parseInt(s);
	}
	getFloatValue() {
		let s = this.getSTValue();
		return parseFloat(s);
	}
	advance() {
		this.startOffsets[this.startStackSize++] = this.start;
		this.start += this.len;
		this.len = 0;
	}
	advanceChar(c) {
		this.startOffsets[this.startStackSize++] = this.start;
		this.start += this.len;
		this.buffer.b[this.start] = c;
		this.buffer.b[this.start + 1] = 0;
		this.start += 1;
		this.len = 0;
	}
	push() {
		this.advanceChar(0);
	}
	setLen(newLen) {
		this.len = newLen;
	}
	rewind() {
		this.start = this.startOffsets[--this.startStackSize];
		this.len = BytesExtensions.strlen(this.buffer,this.start);
	}
	rewindTerminate() {
		this.buffer.b[this.start] = 0;
		this.start = this.startOffsets[--this.startStackSize];
		this.len = BytesExtensions.strlen(this.buffer,this.start);
	}
	compare() {
		let oldStart = this.start;
		this.start = this.startOffsets[--this.startStackSize];
		let ret = BytesExtensions.getString(this.buffer,this.start).toLowerCase() == BytesExtensions.getString(this.buffer,oldStart).toLowerCase();
		this.len = 0;
		this.buffer.b[this.start] = 0;
		return ret;
	}
	pushFrame() {
		this.frameOffsets[this.numFrames++] = this.startStackSize;
		this.startOffsets[this.startStackSize++] = this.start;
		this.start += 512;
		this.validateBufferSize(0);
	}
	getArgs(name) {
		let startStack = this.frameOffsets[--this.numFrames] + 1;
		let argCount = Math.min(this.startStackSize - startStack,20);
		let args = [name];
		let _g = 0;
		let _g1 = argCount;
		while(_g < _g1) {
			let i = _g++;
			args.push(BytesExtensions.getString(this.buffer,this.startOffsets[startStack + i]));
		}
		++argCount;
		this.startStackSize = startStack - 1;
		this.start = this.startOffsets[this.startStackSize];
		this.len = 0;
		return args;
	}
}
StringStack.__name__ = true;
Object.assign(StringStack.prototype, {
	__class__: StringStack
});
class Variable {
	constructor(name,vm) {
		this.internalType = -1;
		this.array = new haxe_ds_StringMap();
		this.name = name;
		this.vm = vm;
	}
	getIntValue() {
		if(this.internalType < -1) {
			return this.intValue;
		} else {
			if(Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,this.stringValue)) {
				return this.vm.simObjects.h[this.stringValue].id;
			}
			let intParse = Std.parseInt(this.stringValue);
			if(intParse == null) {
				return 0;
			} else {
				return intParse;
			}
		}
	}
	getFloatValue() {
		if(this.internalType < -1) {
			return this.floatValue;
		} else {
			if(Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,this.stringValue)) {
				return this.vm.simObjects.h[this.stringValue].id;
			}
			let floatParse = parseFloat(this.stringValue);
			if(isNaN(floatParse)) {
				return 0;
			} else {
				return floatParse;
			}
		}
	}
	getStringValue() {
		if(this.internalType == -1) {
			return this.stringValue;
		}
		if(this.internalType == -2) {
			return Std.string(this.floatValue);
		}
		if(this.internalType == -3) {
			return Std.string(this.intValue);
		} else {
			return this.stringValue;
		}
	}
	setIntValue(val) {
		if(this.internalType < -1) {
			this.intValue = val;
			this.floatValue = this.intValue;
			this.stringValue = null;
			this.internalType = -3;
		} else {
			this.intValue = val;
			this.floatValue = this.intValue;
			this.stringValue = val == null ? "null" : "" + val;
		}
	}
	setFloatValue(val) {
		if(this.internalType < -1) {
			this.floatValue = val;
			this.intValue = this.floatValue;
			this.stringValue = null;
			this.internalType = -2;
		} else {
			this.floatValue = val;
			this.intValue = this.floatValue;
			this.stringValue = val == null ? "null" : "" + val;
		}
	}
	setStringValue(val) {
		if(this.internalType < -1) {
			this.floatValue = parseFloat(val);
			this.intValue = this.floatValue;
			this.internalType = -1;
			this.stringValue = val;
		} else {
			this.floatValue = parseFloat(val);
			this.intValue = this.floatValue;
			this.stringValue = val;
		}
	}
	resolveArray(arrayIndex) {
		if(Object.prototype.hasOwnProperty.call(this.array.h,arrayIndex)) {
			return this.array.h[arrayIndex];
		} else {
			let ret = new Variable(arrayIndex,this.vm);
			this.array.h[arrayIndex] = ret;
			return ret;
		}
	}
}
$hx_exports["Variable"] = Variable;
Variable.__name__ = true;
Object.assign(Variable.prototype, {
	__class__: Variable
});
class ExprEvalState {
	constructor(vm) {
		this.globalVars = new haxe_ds_StringMap();
		this.thisObject = null;
		this.thisVariable = null;
		this.stack = [];
		this.stackVars = [];
		this.vm = vm;
	}
	setCurVarName(name) {
		if(Object.prototype.hasOwnProperty.call(this.globalVars.h,name)) {
			this.thisVariable = this.globalVars.h[name];
		} else if(this.stackVars.length > 0) {
			this.thisVariable = this.stackVars[this.stackVars.length - 1].h[name];
		}
		if(this.thisVariable == null) {
			Log.println("Warning: Undefined variable '" + name + "'");
		}
	}
	setCurVarNameCreate(name) {
		if(name.startsWith("$")) {
			if(Object.prototype.hasOwnProperty.call(this.globalVars.h,name)) {
				this.thisVariable = this.globalVars.h[name];
			} else {
				this.thisVariable = new Variable(name,this.vm);
				this.globalVars.h[name] = this.thisVariable;
			}
		} else if(this.stackVars.length > 0) {
			if(Object.prototype.hasOwnProperty.call(this.stackVars[this.stackVars.length - 1].h,name)) {
				this.thisVariable = this.stackVars[this.stackVars.length - 1].h[name];
			} else {
				this.thisVariable = new Variable(name,this.vm);
				this.stackVars[this.stackVars.length - 1].h[name] = this.thisVariable;
			}
		} else {
			this.thisVariable = null;
			Log.println("Warning: Accessing local variable '" + name + "' in global scope!");
		}
	}
	getIntVariable() {
		if(this.thisVariable != null) {
			return this.thisVariable.getIntValue();
		} else {
			return 0;
		}
	}
	getFloatVariable() {
		if(this.thisVariable != null) {
			return this.thisVariable.getFloatValue();
		} else {
			return 0;
		}
	}
	getStringVariable() {
		if(this.thisVariable != null) {
			return this.thisVariable.getStringValue();
		} else {
			return "";
		}
	}
	setIntVariable(val) {
		if(this.thisVariable != null) {
			this.thisVariable.setIntValue(val);
		}
	}
	setFloatVariable(val) {
		if(this.thisVariable != null) {
			this.thisVariable.setFloatValue(val);
		}
	}
	setStringVariable(val) {
		if(this.thisVariable != null) {
			this.thisVariable.setStringValue(val);
		}
	}
	pushFrame(fnname,namespace) {
		let f = { scopeName : fnname, scopeNamespace : namespace};
		this.stack.push(f);
		this.stackVars.push(new haxe_ds_StringMap());
	}
	popFrame() {
		this.stack.pop();
		this.stackVars.pop();
	}
}
ExprEvalState.__name__ = true;
Object.assign(ExprEvalState.prototype, {
	__class__: ExprEvalState
});
class VM {
	constructor(async) {
		if(async == null) {
			async = false;
		}
		this.currentNamespace = null;
		this.isAsync = false;
		this.schedules = [];
		this.traceOn = false;
		this.codeBlocks = [];
		this.activePackages = [];
		this.nextDatablockId = 1;
		this.nextSimId = 2000;
		this.rootGroup = new console_SimGroup();
		this.idMap = new haxe_ds_IntMap();
		this.dataBlocks = new haxe_ds_StringMap();
		this.simObjects = new haxe_ds_StringMap();
		this.taggedStrings = [];
		this.intStack = new haxe_ds_GenericStack();
		this.floatStack = new haxe_ds_GenericStack();
		this.STR = new StringStack();
		this.namespaces = [];
		this.evalState = new ExprEvalState(this);
		this.namespaces.push(new console_Namespace(null,null,null));
		console_ConsoleFunctions.install(this);
		console_MathFunctions.install(this);
		console_ConsoleObjectConstructors.install(this);
		this.rootGroup.register(this);
		this.isAsync = async;
		this.startTime = Date.now();
	}
	findNamespace(name) {
		let _g = [];
		let _g1 = 0;
		let _g2 = this.namespaces;
		while(_g1 < _g2.length) {
			let v = _g2[_g1];
			++_g1;
			if(name != null && v.name != null ? v.name.toLowerCase() == name.toLowerCase() : v.name == name) {
				_g.push(v);
			}
		}
		let nsList = _g;
		if(nsList.length == 0) {
			return null;
		}
		return nsList[0];
	}
	findFunction(namespace,name) {
		let pkgs = this.activePackages.slice();
		pkgs.reverse();
		pkgs.push(null);
		let nmcmp = namespace == null ? null : namespace.toLowerCase();
		let _g = 0;
		while(_g < pkgs.length) {
			let pkg = pkgs[_g];
			++_g;
			let _g1 = 0;
			let _g2 = this.namespaces;
			while(_g1 < _g2.length) {
				let nm = _g2[_g1];
				++_g1;
				if(nm.pkg == pkg) {
					let thisnm = nm.name == null ? null : nm.name.toLowerCase();
					if(thisnm == nmcmp) {
						let f = nm.find(name);
						if(f != null) {
							return f;
						}
					}
				}
			}
		}
		return null;
	}
	linkNamespaces(parent,child) {
		let parentNamespace = this.findNamespace(parent);
		if(parentNamespace == null) {
			parentNamespace = new console_Namespace(parent,null,null);
			this.namespaces.push(parentNamespace);
		}
		let childNamespace = this.findNamespace(child);
		if(childNamespace == null) {
			childNamespace = new console_Namespace(child,null,null);
			this.namespaces.push(childNamespace);
		}
		childNamespace.parent = parentNamespace;
	}
	activatePackage(name) {
		let lastActivePackage = this.activePackages.length == 0 ? null : this.activePackages[this.activePackages.length - 1];
		let _g = 0;
		let _g1 = this.namespaces;
		while(_g < _g1.length) {
			let namespace = _g1[_g];
			++_g;
			if(namespace.pkg == name) {
				let _g = [];
				let _g1 = 0;
				let _g2 = this.namespaces;
				while(_g1 < _g2.length) {
					let v = _g2[_g1];
					++_g1;
					if(v.name == namespace.name && v.pkg == lastActivePackage) {
						_g.push(v);
					}
				}
				let prevNamespace = _g[0];
				namespace.parent = prevNamespace;
			}
		}
		this.activePackages.push(name);
	}
	deactivatePackage(name) {
		let referencingNamespaces = [];
		let _g = 0;
		let _g1 = this.namespaces;
		while(_g < _g1.length) {
			let namespace = _g1[_g];
			++_g;
			if(namespace.parent != null) {
				if(namespace.parent.pkg == name) {
					referencingNamespaces.push(namespace);
				}
			}
			if(namespace.pkg == name) {
				namespace.parent = null;
			}
		}
		let prevPackages = this.activePackages.slice(0,this.activePackages.indexOf(name));
		prevPackages.reverse();
		prevPackages.push(null);
		HxOverrides.remove(this.activePackages,name);
		let _g2 = 0;
		while(_g2 < referencingNamespaces.length) {
			let namespace = referencingNamespaces[_g2];
			++_g2;
			let parentNamespace = null;
			let _g = 0;
			while(_g < prevPackages.length) {
				let prevPackage = prevPackages[_g];
				++_g;
				let _g1 = [];
				let _g2 = 0;
				let _g3 = this.namespaces;
				while(_g2 < _g3.length) {
					let v = _g3[_g2];
					++_g2;
					if(v.name == namespace.name && v.pkg == prevPackage) {
						_g1.push(v);
					}
				}
				let lastNamespace = _g1[0];
				if(lastNamespace != null) {
					parentNamespace = lastNamespace;
					break;
				}
			}
			namespace.parent = parentNamespace;
		}
	}
	addConsoleFunction(fnName,fnUsage,minArgs,maxArgs,fnType) {
		let emptyNamespace = this.namespaces[0];
		emptyNamespace.addFunctionFull(fnName,fnUsage,minArgs,maxArgs,fnType);
	}
	addJSFunction(func,funcName,namespace,pkg) {
		if(namespace == "") {
			namespace = null;
		}
		if(pkg == "") {
			pkg = null;
		}
		let findNamespaces = this.findNamespace(namespace);
		let nm = null;
		if(findNamespaces == null) {
			nm = new console_Namespace(namespace,null,null);
			this.namespaces.push(nm);
		} else {
			nm = findNamespaces;
		}
		nm.addFunctionFull(funcName,"",0,0,console_FunctionType.JSFunctionType(func));
	}
	addConsoleMethod(className,fnName,fnUsage,minArgs,maxArgs,fnType) {
		let findNamespaces = this.findNamespace(className);
		let namespace = null;
		if(findNamespaces == null) {
			namespace = new console_Namespace(className,null,null);
			this.namespaces.push(namespace);
		} else {
			namespace = findNamespaces;
		}
		namespace.addFunctionFull(fnName,fnUsage,minArgs,maxArgs,fnType);
	}
	findObject(name) {
		if(Object.prototype.hasOwnProperty.call(this.simObjects.h,name)) {
			return this.simObjects.h[name];
		} else if(this.idMap.h.hasOwnProperty(Std.parseInt(name))) {
			return this.idMap.h[Std.parseInt(name)];
		} else {
			return null;
		}
	}
	schedule(time,refObject,args) {
		let _gthis = this;
		if(this.isAsync) {
			let sch = null;
			sch = window.setTimeout(function() {
				_gthis.callFunction(refObject,args);
				if(_gthis.schedules.includes(sch)) {
					HxOverrides.remove(_gthis.schedules,sch);
				}
			},time);
			this.schedules.push(sch);
			return sch;
		} else {
			this.callFunction(refObject,args);
			return 0;
		}
	}
	isEventPending(eventId) {
		if(this.isAsync) {
			return this.schedules.includes(eventId);
		} else {
			return false;
		}
	}
	cancelEvent(eventId) {
		if(this.isAsync) {
			if(this.schedules.includes(eventId)) {
				window.clearTimeout(eventId);
				HxOverrides.remove(this.schedules,eventId);
			}
		}
	}
	callFunction(simObject,args) {
		if(simObject == null) {
			let func = this.findFunction(null,args[0]);
			if(func == null) {
				Log.println("" + args[0] + ": Unknown command.");
			}
			this.execute(func,args);
		} else {
			let func = this.findFunction(simObject.getClassName(),args[0]);
			if(func != null) {
				let save = this.evalState.thisObject;
				this.evalState.thisObject = simObject;
				this.execute(func,args);
				this.evalState.thisObject = save;
			}
		}
	}
	callFunc(namespaceName,funcName,funcArgs,callType) {
		if(callType == "FunctionCall") {
			let func = this.findFunction(namespaceName == "" ? null : namespaceName,funcName);
			if(func != null) {
				let args = [];
				args.push(funcName);
				args = args.concat(funcArgs);
				return this.execute(func,args);
			} else {
				Log.println("Cannot find function " + namespaceName + "::" + funcName);
			}
		} else if(callType == "MethodCall") {
			let obj = this.findObject(funcArgs[0]);
			if(obj == null) {
				Log.println("Cannot find object " + funcArgs[0]);
			} else {
				let func = this.findFunction(obj.getClassName(),funcName);
				if(func != null) {
					let args = [];
					args.push(funcName);
					args.push("" + obj.id);
					args = args.concat(funcArgs.slice(1));
					let save = this.evalState.thisObject;
					this.evalState.thisObject = obj;
					let ret = this.execute(func,args);
					this.evalState.thisObject = save;
					return ret;
				} else {
					Log.println("Cannot find function " + obj.getClassName() + "::" + funcName);
				}
			}
		} else if(callType == "ParentCall") {
			if(this.currentNamespace != null) {
				if(this.currentNamespace.parent != null) {
					let ns = this.currentNamespace.parent;
					let func = ns.find(funcName);
					if(func != null) {
						let args = [];
						if(func.namespace.name != null && func.namespace.name != "") {
							args.push(func.namespace.name);
						}
						args.push(funcName);
						args = args.concat(funcArgs);
						return this.execute(func,args);
					}
				}
			}
		}
		return "";
	}
	newObject(className,name,isDataBlock,parentName,root,props,children) {
		let currentNewObject = null;
		if(isDataBlock) {
			let db = this.dataBlocks.h[name];
			if(db != null) {
				if(db.getClassName().toLowerCase() == className.toLowerCase()) {
					Log.println("Cannot re-declare data block " + className + " with a different class.");
				}
				currentNewObject = db;
			}
		}
		if(currentNewObject == null) {
			if(!isDataBlock) {
				if(!Object.prototype.hasOwnProperty.call(console_ConsoleObjectConstructors.constructorMap.h,className)) {
					Log.println("Unable to instantantiate non con-object class " + className);
				}
				currentNewObject = console_ConsoleObjectConstructors.constructorMap.h[className]();
			} else {
				currentNewObject = new console_SimDataBlock();
				currentNewObject.className = className;
			}
			currentNewObject.assignId(isDataBlock ? this.nextDatablockId++ : this.nextSimId++);
			if(parentName != null) {
				let parent = this.simObjects.h[parentName];
				if(parent != null) {
					currentNewObject.assignFieldsFrom(parent);
				} else {
					Log.println("Parent object " + parentName + " for " + className + " does not exist.");
				}
			}
			currentNewObject.name = name;
			let fieldEntries = Object.entries(props);
			let _g = 0;
			while(_g < fieldEntries.length) {
				let entry = fieldEntries[_g];
				++_g;
				currentNewObject.setDataField(entry[0],null,entry[1]);
			}
			let _g1 = 0;
			while(_g1 < children.length) {
				let child = children[_g1];
				++_g1;
				let childObj = this.findObject(child.getStringValue());
				if(((currentNewObject) instanceof console_SimGroup) || ((currentNewObject) instanceof console_SimSet)) {
					(js_Boot.__cast(currentNewObject , console_SimSet)).addObject(childObj);
				} else {
					this.rootGroup.addObject(childObj);
				}
			}
			let added = false;
			if(!Object.prototype.hasOwnProperty.call(this.simObjects.h,currentNewObject.name)) {
				added = true;
				let this1 = this.simObjects;
				let key = currentNewObject.getName();
				this1.h[key] = currentNewObject;
			}
			this.idMap.h[currentNewObject.id] = currentNewObject;
			currentNewObject.register(this);
			let datablock = isDataBlock ? currentNewObject : null;
			if(datablock != null) {
				if(!datablock.preload()) {
					Log.println("Datablock " + datablock.getName() + " failed to preload.");
					this.idMap.remove(currentNewObject.id);
					if(added) {
						let this1 = this.simObjects;
						let key = currentNewObject.getName();
						let _this = this1;
						if(Object.prototype.hasOwnProperty.call(_this.h,key)) {
							delete(_this.h[key]);
						}
					}
				} else {
					let this1 = this.dataBlocks;
					let key = currentNewObject.getName();
					this1.h[key] = datablock;
				}
			}
			if(root) {
				this.rootGroup.addObject(currentNewObject);
			}
			let v = new Variable("%currentNewObject",this);
			v.setIntValue(currentNewObject.id);
			return v;
		}
		return null;
	}
	resolveIdent(ident) {
		let fObj = this.findObject(ident);
		if(fObj != null) {
			let fVar = new Variable(ident,this);
			fVar.setStringValue(fObj.getName());
			return fVar;
		}
		return null;
	}
	slotAssign(obj,slotName,slotArrayIdx,valueStr) {
		let simObj = this.findObject(obj.getStringValue());
		if(simObj != null) {
			simObj.setDataField(slotName,slotArrayIdx,valueStr);
		}
	}
	slotAccess(objstr,slotName,slotArrayIdx) {
		let simObj = this.findObject(objstr);
		if(simObj != null) {
			let val = simObj.getDataField(slotName,slotArrayIdx);
			let v = new Variable(slotName,this);
			v.setStringValue(val);
			return v;
		}
		return null;
	}
	dispose() {
	}
	execute(ns,args) {
		let _g = ns.type;
		if(_g._hx_index == 0) {
			let functionOffset = _g.functionOffset;
			let codeBlock = _g.codeBlock;
			if(functionOffset > 0) {
				let saveNamespace = this.currentNamespace;
				this.currentNamespace = ns.namespace;
				let res = codeBlock.exec(functionOffset,args[0],ns.namespace,args,false,ns.pkg);
				this.currentNamespace = saveNamespace;
				return res;
			} else {
				return "";
			}
		} else {
			let x = _g;
			if(ns.minArgs > 0 && args.length < ns.minArgs || ns.maxArgs > 0 && args.length > ns.maxArgs) {
				Log.println("" + ns.namespace.name + "::" + ns.functionName + " - wrong number of arguments.");
				Log.println("usage: " + ns.usage);
				return "";
			}
			switch(x._hx_index) {
			case 0:
				let functionOffset = x.functionOffset;
				let codeBlock = x.codeBlock;
				return "";
			case 1:
				let callback = x.callback;
				let saveNamespace = this.currentNamespace;
				this.currentNamespace = ns.namespace;
				let vargs = [];
				let _g1 = 0;
				while(_g1 < args.length) {
					let arg = args[_g1];
					++_g1;
					let v = new Variable("param",this);
					v.setStringValue(arg);
					vargs.push(v);
				}
				let res = callback(vargs);
				this.currentNamespace = saveNamespace;
				return res;
			case 2:
				let callback1 = x.callback;
				let saveNamespace1 = this.currentNamespace;
				this.currentNamespace = ns.namespace;
				let res1 = "" + callback1(this,this.evalState.thisObject,args);
				this.currentNamespace = saveNamespace1;
				return res1;
			case 3:
				let callback2 = x.callback;
				let saveNamespace2 = this.currentNamespace;
				this.currentNamespace = ns.namespace;
				let res2 = "" + callback2(this,this.evalState.thisObject,args);
				this.currentNamespace = saveNamespace2;
				return res2;
			case 4:
				let callback3 = x.callback;
				let saveNamespace3 = this.currentNamespace;
				this.currentNamespace = ns.namespace;
				let res3 = callback3(this,this.evalState.thisObject,args);
				this.currentNamespace = saveNamespace3;
				return res3;
			case 5:
				let callback4 = x.callback;
				let saveNamespace4 = this.currentNamespace;
				this.currentNamespace = ns.namespace;
				callback4(this,this.evalState.thisObject,args);
				this.currentNamespace = saveNamespace4;
				return "";
			case 6:
				let callback5 = x.callback;
				let saveNamespace5 = this.currentNamespace;
				this.currentNamespace = ns.namespace;
				let res4 = "" + Std.string(callback5(this,this.evalState.thisObject,args));
				this.currentNamespace = saveNamespace5;
				return res4;
			}
		}
	}
}
$hx_exports["VM"] = VM;
VM.__name__ = true;
Object.assign(VM.prototype, {
	__class__: VM
});
var console_CFFunctionType = $hxEnums["console.CFFunctionType"] = { __ename__:true,__constructs__:null
	,IntCallbackType: ($_=function(callback) { return {_hx_index:0,callback:callback,__enum__:"console.CFFunctionType",toString:$estr}; },$_._hx_name="IntCallbackType",$_.__params__ = ["callback"],$_)
	,FloatCallbackType: ($_=function(callback) { return {_hx_index:1,callback:callback,__enum__:"console.CFFunctionType",toString:$estr}; },$_._hx_name="FloatCallbackType",$_.__params__ = ["callback"],$_)
	,StringCallbackType: ($_=function(callback) { return {_hx_index:2,callback:callback,__enum__:"console.CFFunctionType",toString:$estr}; },$_._hx_name="StringCallbackType",$_.__params__ = ["callback"],$_)
	,VoidCallbackType: ($_=function(callback) { return {_hx_index:3,callback:callback,__enum__:"console.CFFunctionType",toString:$estr}; },$_._hx_name="VoidCallbackType",$_.__params__ = ["callback"],$_)
	,BoolCallbackType: ($_=function(callback) { return {_hx_index:4,callback:callback,__enum__:"console.CFFunctionType",toString:$estr}; },$_._hx_name="BoolCallbackType",$_.__params__ = ["callback"],$_)
};
console_CFFunctionType.__constructs__ = [console_CFFunctionType.IntCallbackType,console_CFFunctionType.FloatCallbackType,console_CFFunctionType.StringCallbackType,console_CFFunctionType.VoidCallbackType,console_CFFunctionType.BoolCallbackType];
class console_ConsoleFunctionMacro {
}
console_ConsoleFunctionMacro.__name__ = true;
class console_ConsoleFunctions {
	static nameToId(vm,thisObj,args) {
		let obj = vm.findObject(args[1]);
		if(obj != null) {
			return obj.id;
		}
		return -1;
	}
	static isObject(vm,thisObj,args) {
		if(args[1] == "" || args[1] == "0") {
			return false;
		}
		let obj = vm.findObject(args[1]);
		if(obj != null) {
			return true;
		}
		return false;
	}
	static cancelEvent(vm,thisObj,args) {
		vm.cancelEvent(Std.parseInt(args[1]));
	}
	static isEventPending(vm,thisObj,args) {
		return vm.isEventPending(Std.parseInt(args[1]));
	}
	static schedule(vm,thisObj,args) {
		let timeDelta = Std.parseInt(args[1]);
		let obj = vm.findObject(args[2]);
		if(obj == null) {
			if(args[2] != "0") {
				return 0;
			}
		}
		return vm.schedule(timeDelta,obj,args.slice(3));
	}
	static getSimTime(vm,thisObj,args) {
		return Date.now() - vm.startTime;
	}
	static getRealTime(vm,thisObj,args) {
		return Date.now();
	}
	static strcmp(vm,thisObj,args) {
		let a = args[1];
		let b = args[2];
		if(a.length > b.length) {
			return 1;
		} else if(a.length < b.length) {
			return -1;
		} else {
			let _g = 0;
			let _g1 = a.length;
			while(_g < _g1) {
				let c = _g++;
				if(HxOverrides.cca(a,c) > HxOverrides.cca(b,c)) {
					return 1;
				} else if(HxOverrides.cca(a,c) < HxOverrides.cca(b,c)) {
					return -1;
				}
			}
			return 0;
		}
	}
	static stricmp(vm,thisObj,args) {
		let a = args[1].toUpperCase();
		let b = args[2].toUpperCase();
		if(a.length > b.length) {
			return 1;
		} else if(a.length < b.length) {
			return -1;
		} else {
			let _g = 0;
			let _g1 = a.length;
			while(_g < _g1) {
				let c = _g++;
				if(HxOverrides.cca(a,c) > HxOverrides.cca(b,c)) {
					return 1;
				} else if(HxOverrides.cca(a,c) < HxOverrides.cca(b,c)) {
					return -1;
				}
			}
			return 0;
		}
	}
	static strlen(vm,thisObj,args) {
		return args[1].length;
	}
	static strstr(vm,thisObj,args) {
		let a = args[1];
		let b = args[2];
		return a.indexOf(b);
	}
	static strpos(vm,thisObj,args) {
		let a = args[1];
		let b = args[2];
		let c = args.length == 4 ? Std.parseInt(args[3]) : 0;
		return a.indexOf(b,c);
	}
	static ltrim(vm,thisObj,args) {
		return StringTools.ltrim(args[1]);
	}
	static rtrim(vm,thisObj,args) {
		return StringTools.rtrim(args[1]);
	}
	static trim(vm,thisObj,args) {
		return StringTools.trim(args[1]);
	}
	static stripChars(vm,thisObj,args) {
		let str = args[1];
		let _g = 0;
		let _g1 = args[2].length;
		while(_g < _g1) {
			let c = _g++;
			str = StringTools.replace(str,args[2].charAt(c),"");
		}
		return str;
	}
	static strlwr(vm,thisObj,args) {
		return args[1].toLowerCase();
	}
	static strupr(vm,thisObj,args) {
		return args[1].toUpperCase();
	}
	static strchr(vm,thisObj,args) {
		let index = args[1].indexOf(args[2]);
		if(index == -1) {
			return "";
		}
		return HxOverrides.substr(args[1],index,null);
	}
	static strreplace(vm,thisObj,args) {
		return StringTools.replace(args[1],args[2],args[3]);
	}
	static getSubStr(vm,thisObj,args) {
		let s = HxOverrides.substr(args[1],Std.parseInt(args[2]),Std.parseInt(args[3]));
		if(s != null) {
			return s;
		} else {
			return "";
		}
	}
	static getWord(vm,thisObj,args) {
		let toks = args[1].split(" ");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return "";
		}
		return toks[index];
	}
	static getWords(vm,thisObj,args) {
		let toks = args[1].split(" ");
		let index = Std.parseInt(args[2]);
		let endIndex = args.length == 4 ? Std.parseInt(args[3]) : toks.length;
		if(index >= toks.length || index < 0) {
			return "";
		}
		if(endIndex >= toks.length || endIndex < 0) {
			return "";
		}
		return toks.slice(index,endIndex).join(" ");
	}
	static setWord(vm,thisObj,args) {
		let toks = args[1].split(" ");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return args[1];
		}
		toks[index] = args[3];
		return toks.join(" ");
	}
	static removeWord(vm,thisObj,args) {
		let toks = args[1].split(" ");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return args[1];
		}
		toks.splice(index,1);
		return toks.join(" ");
	}
	static getWordCount(vm,thisObj,args) {
		return args[1].split(" ").length;
	}
	static getField(vm,thisObj,args) {
		let toks = args[1].split("\t");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return "";
		}
		return toks[index];
	}
	static getFields(vm,thisObj,args) {
		let toks = args[1].split("\t");
		let index = Std.parseInt(args[2]);
		let endIndex = args.length == 4 ? Std.parseInt(args[3]) : toks.length;
		if(index >= toks.length || index < 0) {
			return "";
		}
		if(endIndex >= toks.length || endIndex < 0) {
			return "";
		}
		return toks.slice(index,endIndex).join("\t");
	}
	static setField(vm,thisObj,args) {
		let toks = args[1].split("\t");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return args[1];
		}
		toks[index] = args[3];
		return toks.join("\t");
	}
	static removeField(vm,thisObj,args) {
		let toks = args[1].split("\t");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return args[1];
		}
		toks.splice(index,1);
		return toks.join("\t");
	}
	static getFieldCount(vm,thisObj,args) {
		return args[1].split("\t").length;
	}
	static getRecord(vm,thisObj,args) {
		let toks = args[1].split("\n");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return "";
		}
		return toks[index];
	}
	static getRecords(vm,thisObj,args) {
		let toks = args[1].split("\n");
		let index = Std.parseInt(args[2]);
		let endIndex = args.length == 4 ? Std.parseInt(args[3]) : toks.length;
		if(index >= toks.length || index < 0) {
			return "";
		}
		if(endIndex >= toks.length || endIndex < 0) {
			return "";
		}
		return toks.slice(index,endIndex).join("\n");
	}
	static setRecord(vm,thisObj,args) {
		let toks = args[1].split("\n");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return args[1];
		}
		toks[index] = args[3];
		return toks.join("\n");
	}
	static removeRecord(vm,thisObj,args) {
		let toks = args[1].split("\n");
		let index = Std.parseInt(args[2]);
		if(index >= toks.length || index < 0) {
			return args[1];
		}
		toks.splice(index,1);
		return toks.join("\n");
	}
	static getRecordCount(vm,thisObj,args) {
		return args[1].split("\n").length;
	}
	static firstWord(vm,thisObj,args) {
		let toks = args[1].split(" ");
		if(toks.length == 0) {
			return "";
		}
		return toks[0];
	}
	static restWords(vm,thisObj,args) {
		let toks = args[1].split(" ");
		if(toks.length == 0) {
			return "";
		}
		return toks.slice(1).join(" ");
	}
	static nextToken(vm,thisObj,args) {
		let toks = args[1].split(args[3]);
		if(toks.length == 0) {
			return "";
		}
		let rest = toks.slice(1).join(args[3]);
		if(vm.evalState.stack.length != 0) {
			let v = new Variable("%" + args[2],vm);
			v.setStringValue(toks[0]);
			vm.evalState.stackVars[vm.evalState.stackVars.length - 1].h["%" + args[2]] = v;
		} else {
			let v = new Variable("$" + args[2],vm);
			v.setStringValue(toks[0]);
			vm.evalState.globalVars.h["$" + args[2]] = v;
		}
		return rest;
	}
	static detag(vm,thisObj,args) {
		let ccode = HxOverrides.cca(args[1],0);
		if(ccode == null) {
			return args[1];
		}
		if(ccode == 1) {
			let findIdx = args[1].indexOf(" ");
			if(findIdx == -1) {
				return "";
			}
			let word = HxOverrides.substr(args[1],findIdx,null);
			return word;
		}
		return args[1];
	}
	static getTag(vm,thisObj,args) {
		let ccode = HxOverrides.cca(args[1],0);
		if(ccode == null) {
			return "";
		}
		if(ccode == 1) {
			let findIdx = args[1].indexOf(" ");
			if(findIdx == -1) {
				return HxOverrides.substr(args[1],1,null);
			}
			let word = HxOverrides.substr(args[1],1,findIdx);
			return word;
		}
		return "";
	}
	static activatePackage(vm,thisObj,args) {
		vm.activatePackage(args[1]);
	}
	static deactivatePackage(vm,thisObj,args) {
		vm.deactivatePackage(args[1]);
	}
	static isPackage(vm,thisObj,args) {
		let _g = 0;
		let _g1 = vm.namespaces;
		while(_g < _g1.length) {
			let nm = _g1[_g];
			++_g;
			if(nm.pkg == args[1]) {
				return true;
			}
		}
		return false;
	}
	static echo(vm,thisObj,args) {
		Log.println(args.slice(1).join(""));
	}
	static warn(vm,thisObj,args) {
		Log.println("Warning: " + args.slice(1).join(""));
	}
	static error(vm,thisObj,args) {
		Log.println("Error: " + args.slice(1).join(""));
	}
	static expandEscape(vm,thisObj,args) {
		return Scanner.escape(args[1]);
	}
	static collapseEscape(vm,thisObj,args) {
		return Scanner.unescape(args[1]);
	}
	static eval(vm,thisObj,args) {
		let compiler = new Compiler();
		try {
			let bytes = compiler.compile(args[1]);
			let code = new CodeBlock(vm,null);
			code.load(new haxe_io_BytesInput(bytes.getBytes()));
			return code.exec(0,null,null,[],false,null);
		} catch( _g ) {
			Log.println("Syntax error in input");
			return "";
		}
	}
	static eval_js(vm,thisObj,args) {
		try {
			let scanner = new Scanner(args[1]);
			let parser = new Parser(scanner.scanTokens());
			let stmts = parser.parse();
			let jsgen = new JSGenerator(stmts);
			let jsOut = jsgen.generate(false);
			return "" + Std.string(eval(jsOut));
		} catch( _g ) {
			Log.println("Syntax error in input");
			return "";
		}
	}
	static trace_function(vm,thisObj,args) {
		vm.traceOn = Std.parseInt(args[1]) > 0;
		Log.println("Console trace is " + (vm.traceOn ? "on" : "off") + ".");
	}
	static fileExt(vm,thisObj,args) {
		return haxe_io_Path.extension(args[1]);
	}
	static fileBase(vm,thisObj,args) {
		return haxe_io_Path.withoutExtension(haxe_io_Path.withoutDirectory(args[1]));
	}
	static fileName(vm,thisObj,args) {
		return haxe_io_Path.withoutDirectory(args[1]);
	}
	static filePath(vm,thisObj,args) {
		return haxe_io_Path.directory(args[1]);
	}
	static install(vm) {
		let vmObj = vm;
		vmObj.addConsoleFunction("nameToId","nameToID(object) - Returns the id of the object",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.nameToId(vm,s,arr);
		}));
		vmObj.addConsoleFunction("isObject","isObject(object) - Returns whether the object exists or not",2,2,console_FunctionType.BoolCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.isObject(vm,s,arr);
		}));
		vmObj.addConsoleFunction("cancelEvent","cancel(eventId) - Cancels a scheduled event",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_ConsoleFunctions.cancelEvent(vm,s,arr);
		}));
		vmObj.addConsoleFunction("isEventPending","isEventPending(eventId) - Returns whether the given event is pending to be completed or not",2,2,console_FunctionType.BoolCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.isEventPending(vm,s,arr);
		}));
		vmObj.addConsoleFunction("schedule","schedule(time, refobject|0, command, <arg1...argN>) - Schedules a function or method 'command' to be run after 'time' milliseconds with optional arguments and returns the event id",4,0,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.schedule(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getSimTime","getSimTime() - Returns the milliseconds since the interpreter started",1,1,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getSimTime(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getRealTime","getRealTime() - Returns the milliseconds passed since unix epoch",1,1,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getRealTime(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strcmp","strcmp(string one, string two) - Compares two strings using case-sensitive comparison.",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strcmp(vm,s,arr);
		}));
		vmObj.addConsoleFunction("stricmp","stricmp(string one, string two) - Compares two strings using case-insensitive comparison.",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.stricmp(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strlen","strlen(string) - Get the length of the given string in bytes.",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strlen(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strstr","strstr(string string, string substring) - Find the start of substring in the given string searching from left to right.",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strstr(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strpos","strpos(string hay, string needle, int offset) - Find the start of needle in haystack searching from left to right beginning at the given offset.",3,4,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strpos(vm,s,arr);
		}));
		vmObj.addConsoleFunction("ltrim","ltrim(string value) - Remove leading whitespace from the string.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.ltrim(vm,s,arr);
		}));
		vmObj.addConsoleFunction("rtrim","rtrim(string value) - Remove trailing whitespace from the string.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.rtrim(vm,s,arr);
		}));
		vmObj.addConsoleFunction("trim","trim(string value) - Remove leading and trailing whitespace from the string.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.trim(vm,s,arr);
		}));
		vmObj.addConsoleFunction("stripChars","stripChars(string value, string chars) - Remove all occurrences of characters contained in chars from str.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.stripChars(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strlwr","strlwr(string value) - Return an all lower-case version of the given string.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strlwr(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strupr","strupr(string value) - Return an all upper-case version of the given string.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strupr(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strchr","strchr(string value, string char) - Find the first occurrence of the given character in str.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strchr(vm,s,arr);
		}));
		vmObj.addConsoleFunction("strreplace","strreplace(string source, string from, string to) - Replace all occurrences of from in source with to.",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.strreplace(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getSubStr","getSubStr(string str, int start, int numChars) - Return a substring of str starting at start and continuing either through to the end of str (if numChars is -1) or for numChars characters (except if this would exceed the actual source string length)",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getSubStr(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getWord","getWord(string str, int index) - Extract the word at the given index in the whitespace-separated list in text.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getWord(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getWords","getWords(string str, int index, int endIndex = INF) = Extract a range of words from the given startIndex onwards thru endIndex.",3,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getWords(vm,s,arr);
		}));
		vmObj.addConsoleFunction("setWord","setWord(text, index, replacement) - Replace the word in text at the given index with replacement.",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.setWord(vm,s,arr);
		}));
		vmObj.addConsoleFunction("removeWord","removeWord(text, index) - Remove the word in text at the given index.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.removeWord(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getWordCount","getWordCount(string str) - Return the number of whitespace-separated words in text.",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getWordCount(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getField","getField(string str, int index) - Extract the field at the given index in the tab separated list in text.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getField(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getFields","getFields(string str, int index, int endIndex = INF) - Extract a range of fields from the given startIndex onwards thru endIndex.",3,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getFields(vm,s,arr);
		}));
		vmObj.addConsoleFunction("setField","setField(text, index, replacement) - Replace the field in text at the given index with replacement.",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.setField(vm,s,arr);
		}));
		vmObj.addConsoleFunction("removeField","removeField(text, index) - Remove the field in text at the given index.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.removeField(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getFieldCount","getFieldCount(string str) - Return the number of tab separated fields in text.",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getFieldCount(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getRecord","getRecord(string str, int index) - Extract the record at the given index in the newline-separated list in text.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getRecord(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getRecords","getRecords(string str, int index, int endIndex = INF) - Extract a range of records from the given startIndex onwards thru endIndex.",3,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getRecords(vm,s,arr);
		}));
		vmObj.addConsoleFunction("setRecord","setRecord(text, index, replacement) - Replace the record in text at the given index with replacement.",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.setRecord(vm,s,arr);
		}));
		vmObj.addConsoleFunction("removeRecord","removeRecord(text, index) - Remove the record in text at the given index.",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.removeRecord(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getRecordCount","getRecordCount(string str) - Return the number of newline-separated records in text.",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getRecordCount(vm,s,arr);
		}));
		vmObj.addConsoleFunction("firstWord","firstWord(string str) - Return the first word in text.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.firstWord(vm,s,arr);
		}));
		vmObj.addConsoleFunction("restWords","restWords(string str) - Return all but the first word in text.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.restWords(vm,s,arr);
		}));
		vmObj.addConsoleFunction("nextToken","nextToken(str, token, delim) - Tokenize a string using a set of delimiting characters.",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.nextToken(vm,s,arr);
		}));
		vmObj.addConsoleFunction("detag","detag(textTagString) - Detag a given tagged string",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.detag(vm,s,arr);
		}));
		vmObj.addConsoleFunction("getTag","getTag(textTagString) - Get the tag of a tagged string",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.getTag(vm,s,arr);
		}));
		vmObj.addConsoleFunction("activatePackage","activatePackage(package) - Activates an existing package.",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_ConsoleFunctions.activatePackage(vm,s,arr);
		}));
		vmObj.addConsoleFunction("deactivatePackage","deactivatePackage(package - Deactivates a previously activated package.",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_ConsoleFunctions.deactivatePackage(vm,s,arr);
		}));
		vmObj.addConsoleFunction("isPackage","isPackage(package) - Returns true if the package is the name of a declared package.",2,2,console_FunctionType.BoolCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.isPackage(vm,s,arr);
		}));
		vmObj.addConsoleFunction("echo","echo(value, ...) - Logs a message to the console.",2,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_ConsoleFunctions.echo(vm,s,arr);
		}));
		vmObj.addConsoleFunction("warn","warn(value, ...) - Logs a warning message to the console.",2,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_ConsoleFunctions.warn(vm,s,arr);
		}));
		vmObj.addConsoleFunction("error","error(value, ...) - Logs an error message to the console.",2,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_ConsoleFunctions.error(vm,s,arr);
		}));
		vmObj.addConsoleFunction("expandEscape","expandEscape(text) - Replace all characters in text that need to be escaped for the string to be a valid string literal with their respective escape sequences.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.expandEscape(vm,s,arr);
		}));
		vmObj.addConsoleFunction("collapseEscape","collapseEscape(text) - Replace all escape sequences in text with their respective character codes.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.collapseEscape(vm,s,arr);
		}));
		vmObj.addConsoleFunction("eval","eval(consoleString) - Evaluates the given string",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.eval(vm,s,arr);
		}));
		vmObj.addConsoleFunction("eval_js","eval_js(consoleString)",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.eval_js(vm,s,arr);
		}));
		vmObj.addConsoleFunction("trace","trace(bool) - Enable or disable tracing in the script code VM.",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_ConsoleFunctions.trace_function(vm,s,arr);
		}));
		vmObj.addConsoleFunction("fileExt","fileExt(fileName) - Get the extension of a file.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.fileExt(vm,s,arr);
		}));
		vmObj.addConsoleFunction("fileBase","fileBase(fileName) - Get the base of a file name (removes extension).",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.fileBase(vm,s,arr);
		}));
		vmObj.addConsoleFunction("fileName","fileName(fileName)- Get the file name of a file (removes extension and path).",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.fileName(vm,s,arr);
		}));
		vmObj.addConsoleFunction("filePath","filePath(fileName) - Get the path of a file (removes name and extension).",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_ConsoleFunctions.filePath(vm,s,arr);
		}));
	}
	static gatherDocs() {
		let docList = [];
		docList.push({ funcname : "nameToId", funcusage : "nameToID(object) - Returns the id of the object"});
		docList.push({ funcname : "isObject", funcusage : "isObject(object) - Returns whether the object exists or not"});
		docList.push({ funcname : "cancelEvent", funcusage : "cancel(eventId) - Cancels a scheduled event"});
		docList.push({ funcname : "isEventPending", funcusage : "isEventPending(eventId) - Returns whether the given event is pending to be completed or not"});
		docList.push({ funcname : "schedule", funcusage : "schedule(time, refobject|0, command, <arg1...argN>) - Schedules a function or method 'command' to be run after 'time' milliseconds with optional arguments and returns the event id"});
		docList.push({ funcname : "getSimTime", funcusage : "getSimTime() - Returns the milliseconds since the interpreter started"});
		docList.push({ funcname : "getRealTime", funcusage : "getRealTime() - Returns the milliseconds passed since unix epoch"});
		docList.push({ funcname : "strcmp", funcusage : "strcmp(string one, string two) - Compares two strings using case-sensitive comparison."});
		docList.push({ funcname : "stricmp", funcusage : "stricmp(string one, string two) - Compares two strings using case-insensitive comparison."});
		docList.push({ funcname : "strlen", funcusage : "strlen(string) - Get the length of the given string in bytes."});
		docList.push({ funcname : "strstr", funcusage : "strstr(string string, string substring) - Find the start of substring in the given string searching from left to right."});
		docList.push({ funcname : "strpos", funcusage : "strpos(string hay, string needle, int offset) - Find the start of needle in haystack searching from left to right beginning at the given offset."});
		docList.push({ funcname : "ltrim", funcusage : "ltrim(string value) - Remove leading whitespace from the string."});
		docList.push({ funcname : "rtrim", funcusage : "rtrim(string value) - Remove trailing whitespace from the string."});
		docList.push({ funcname : "trim", funcusage : "trim(string value) - Remove leading and trailing whitespace from the string."});
		docList.push({ funcname : "stripChars", funcusage : "stripChars(string value, string chars) - Remove all occurrences of characters contained in chars from str."});
		docList.push({ funcname : "strlwr", funcusage : "strlwr(string value) - Return an all lower-case version of the given string."});
		docList.push({ funcname : "strupr", funcusage : "strupr(string value) - Return an all upper-case version of the given string."});
		docList.push({ funcname : "strchr", funcusage : "strchr(string value, string char) - Find the first occurrence of the given character in str."});
		docList.push({ funcname : "strreplace", funcusage : "strreplace(string source, string from, string to) - Replace all occurrences of from in source with to."});
		docList.push({ funcname : "getSubStr", funcusage : "getSubStr(string str, int start, int numChars) - Return a substring of str starting at start and continuing either through to the end of str (if numChars is -1) or for numChars characters (except if this would exceed the actual source string length)"});
		docList.push({ funcname : "getWord", funcusage : "getWord(string str, int index) - Extract the word at the given index in the whitespace-separated list in text."});
		docList.push({ funcname : "getWords", funcusage : "getWords(string str, int index, int endIndex = INF) = Extract a range of words from the given startIndex onwards thru endIndex."});
		docList.push({ funcname : "setWord", funcusage : "setWord(text, index, replacement) - Replace the word in text at the given index with replacement."});
		docList.push({ funcname : "removeWord", funcusage : "removeWord(text, index) - Remove the word in text at the given index."});
		docList.push({ funcname : "getWordCount", funcusage : "getWordCount(string str) - Return the number of whitespace-separated words in text."});
		docList.push({ funcname : "getField", funcusage : "getField(string str, int index) - Extract the field at the given index in the tab separated list in text."});
		docList.push({ funcname : "getFields", funcusage : "getFields(string str, int index, int endIndex = INF) - Extract a range of fields from the given startIndex onwards thru endIndex."});
		docList.push({ funcname : "setField", funcusage : "setField(text, index, replacement) - Replace the field in text at the given index with replacement."});
		docList.push({ funcname : "removeField", funcusage : "removeField(text, index) - Remove the field in text at the given index."});
		docList.push({ funcname : "getFieldCount", funcusage : "getFieldCount(string str) - Return the number of tab separated fields in text."});
		docList.push({ funcname : "getRecord", funcusage : "getRecord(string str, int index) - Extract the record at the given index in the newline-separated list in text."});
		docList.push({ funcname : "getRecords", funcusage : "getRecords(string str, int index, int endIndex = INF) - Extract a range of records from the given startIndex onwards thru endIndex."});
		docList.push({ funcname : "setRecord", funcusage : "setRecord(text, index, replacement) - Replace the record in text at the given index with replacement."});
		docList.push({ funcname : "removeRecord", funcusage : "removeRecord(text, index) - Remove the record in text at the given index."});
		docList.push({ funcname : "getRecordCount", funcusage : "getRecordCount(string str) - Return the number of newline-separated records in text."});
		docList.push({ funcname : "firstWord", funcusage : "firstWord(string str) - Return the first word in text."});
		docList.push({ funcname : "restWords", funcusage : "restWords(string str) - Return all but the first word in text."});
		docList.push({ funcname : "nextToken", funcusage : "nextToken(str, token, delim) - Tokenize a string using a set of delimiting characters."});
		docList.push({ funcname : "detag", funcusage : "detag(textTagString) - Detag a given tagged string"});
		docList.push({ funcname : "getTag", funcusage : "getTag(textTagString) - Get the tag of a tagged string"});
		docList.push({ funcname : "activatePackage", funcusage : "activatePackage(package) - Activates an existing package."});
		docList.push({ funcname : "deactivatePackage", funcusage : "deactivatePackage(package - Deactivates a previously activated package."});
		docList.push({ funcname : "isPackage", funcusage : "isPackage(package) - Returns true if the package is the name of a declared package."});
		docList.push({ funcname : "echo", funcusage : "echo(value, ...) - Logs a message to the console."});
		docList.push({ funcname : "warn", funcusage : "warn(value, ...) - Logs a warning message to the console."});
		docList.push({ funcname : "error", funcusage : "error(value, ...) - Logs an error message to the console."});
		docList.push({ funcname : "expandEscape", funcusage : "expandEscape(text) - Replace all characters in text that need to be escaped for the string to be a valid string literal with their respective escape sequences."});
		docList.push({ funcname : "collapseEscape", funcusage : "collapseEscape(text) - Replace all escape sequences in text with their respective character codes."});
		docList.push({ funcname : "eval", funcusage : "eval(consoleString) - Evaluates the given string"});
		docList.push({ funcname : "eval_js", funcusage : "eval_js(consoleString)"});
		docList.push({ funcname : "trace", funcusage : "trace(bool) - Enable or disable tracing in the script code VM."});
		docList.push({ funcname : "fileExt", funcusage : "fileExt(fileName) - Get the extension of a file."});
		docList.push({ funcname : "fileBase", funcusage : "fileBase(fileName) - Get the base of a file name (removes extension)."});
		docList.push({ funcname : "fileName", funcusage : "fileName(fileName)- Get the file name of a file (removes extension and path)."});
		docList.push({ funcname : "filePath", funcusage : "filePath(fileName) - Get the path of a file (removes name and extension)."});
		return docList;
	}
}
console_ConsoleFunctions.__name__ = true;
class console_ConsoleObject {
	constructor() {
		if(console_ConsoleObject._hx_skip_constructor) {
			return;
		}
		this._hx_constructor();
	}
	_hx_constructor() {
		this.fields = new haxe_ds_StringMap();
		this.className = "ConsoleObject";
		this.assignClassName();
	}
	register(vm) {
		this.vm = vm;
	}
	getDataField(field,arrayIdx) {
		if(arrayIdx != null) {
			if(Object.prototype.hasOwnProperty.call(this.fields.h,field + arrayIdx)) {
				return this.fields.h[field + arrayIdx];
			} else {
				return "";
			}
		} else if(Object.prototype.hasOwnProperty.call(this.fields.h,field)) {
			return this.fields.h[field];
		} else {
			return "";
		}
	}
	assignClassName() {
		this.className = "ConsoleObject";
	}
	setDataField(field,arrayIdx,value) {
		if(arrayIdx != null) {
			this.fields.h[field + arrayIdx] = value;
		} else {
			this.fields.h[field] = value;
		}
	}
	getClassName() {
		return this.className;
	}
}
console_ConsoleObject.__name__ = true;
Object.assign(console_ConsoleObject.prototype, {
	__class__: console_ConsoleObject
});
class console_ConsoleObjectConstructorMacro {
}
console_ConsoleObjectConstructorMacro.__name__ = true;
class console_SimObject extends console_ConsoleObject {
	_hx_constructor() {
		super._hx_constructor();
	}
	findObject(name) {
		return null;
	}
	getName() {
		if(this.name != null) {
			return this.name;
		} else {
			return "" + this.id;
		}
	}
	deleteObject() {
		if(this.vm != null) {
			this.vm.idMap.remove(this.id);
			if(Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,this.name)) {
				if(this.vm.simObjects.h[this.name] == this) {
					let key = this.name;
					let _this = this.vm.simObjects;
					if(Object.prototype.hasOwnProperty.call(_this.h,key)) {
						delete(_this.h[key]);
					}
				}
			}
		}
	}
	assignId(id) {
		this.id = id;
	}
	assignFieldsFrom(obj) {
		let h = obj.fields.h;
		let field_h = h;
		let field_keys = Object.keys(h);
		let field_length = field_keys.length;
		let field_current = 0;
		while(field_current < field_length) {
			let field = field_h[field_keys[field_current++]];
			let v = obj.fields.h[field];
			this.fields.h[field] = v;
		}
	}
	processArguments(args) {
		return true;
	}
	getClassName() {
		return "SimObject";
	}
	assignClassName() {
		this.className = "SimObject";
	}
	static setName(vm,thisObj,args) {
		thisObj.name = args[2];
	}
	static getName_method(vm,thisObj,args) {
		return thisObj.getName();
	}
	static getClassName_method(vm,thisObj,args) {
		return thisObj.getClassName();
	}
	static getId(vm,thisObj,args) {
		return thisObj.id;
	}
	static getGroup(vm,thisObj,args) {
		if(thisObj.group != null) {
			return thisObj.group.id;
		} else {
			return -1;
		}
	}
	static delete(vm,thisObj,args) {
		thisObj.deleteObject();
	}
	static schedule(vm,thisObj,args) {
		let timeDelta = Std.parseInt(args[2]);
		return vm.schedule(timeDelta,thisObj,args.slice(3));
	}
	static install(vm) {
		let vmObj = vm;
		vmObj.addConsoleMethod("SimObject","setName","obj.setName(newName) - Set the global name of the object.",3,3,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimObject.setName(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimObject","getName","obj.getName() - Get the global name of the object.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_SimObject.getName_method(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimObject","getClassName","obj.getClassName() - Get the name of the engine class which the object is an instance of.",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_SimObject.getClassName_method(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimObject","getId","obj.getId() - Get the underlying unique numeric ID of the object.",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_SimObject.getId(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimObject","getGroup","obj.getGroup() - Get the group that this object is contained in.",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_SimObject.getGroup(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimObject","delete","obj.delete() - Delete and remove the object.",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimObject.delete(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimObject","schedule","object.schedule(time, command, <arg1...argN>) - Delay an invocation of a method.",4,0,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_SimObject.schedule(vm,s,arr);
		}));
	}
	static gatherDocs() {
		let docList = [];
		docList.push({ funcname : "setName", funcusage : "obj.setName(newName) - Set the global name of the object."});
		docList.push({ funcname : "getName", funcusage : "obj.getName() - Get the global name of the object."});
		docList.push({ funcname : "getClassName", funcusage : "obj.getClassName() - Get the name of the engine class which the object is an instance of."});
		docList.push({ funcname : "getId", funcusage : "obj.getId() - Get the underlying unique numeric ID of the object."});
		docList.push({ funcname : "getGroup", funcusage : "obj.getGroup() - Get the group that this object is contained in."});
		docList.push({ funcname : "delete", funcusage : "obj.delete() - Delete and remove the object."});
		docList.push({ funcname : "schedule", funcusage : "object.schedule(time, command, <arg1...argN>) - Delay an invocation of a method."});
		return { classname : "SimObject", doesextends : true, extendsclass : "ConsoleObject", classfuncs : docList};
	}
}
console_SimObject.__name__ = true;
console_SimObject.__super__ = console_ConsoleObject;
Object.assign(console_SimObject.prototype, {
	__class__: console_SimObject
});
class console_ScriptObject extends console_SimObject {
	constructor() {
		console_ConsoleObject._hx_skip_constructor = true;
		super();
		console_ConsoleObject._hx_skip_constructor = false;
		this._hx_constructor();
	}
	_hx_constructor() {
		this.scriptSuperClassName = null;
		this.scriptClassName = "ScriptObject";
		super._hx_constructor();
	}
	register(vm) {
		if(this.scriptClassName != "ScriptObject") {
			let parentNamespace = this.scriptSuperClassName == null ? "ScriptObject" : this.scriptSuperClassName;
			if(this.scriptSuperClassName != null) {
				vm.linkNamespaces("ScriptObject",parentNamespace);
			}
			vm.linkNamespaces(parentNamespace,this.scriptClassName);
		}
		super.register(vm);
	}
	getClassName() {
		return this.scriptClassName;
	}
	assignClassName() {
		return;
	}
	setDataField(field,arrayIdx,value) {
		if(field.toLowerCase() == "class") {
			this.scriptClassName = value;
		} else if(field.toLowerCase() == "superclass") {
			this.scriptSuperClassName = value;
		} else {
			super.setDataField(field,arrayIdx,value);
		}
	}
	static install(vm) {
		let vmObj = vm;
	}
	static gatherDocs() {
		let docList = [];
		return { classname : "ScriptObject", doesextends : true, extendsclass : "SimObject", classfuncs : docList};
	}
}
console_ScriptObject.__name__ = true;
console_ScriptObject.__super__ = console_SimObject;
Object.assign(console_ScriptObject.prototype, {
	__class__: console_ScriptObject
});
class console_SimDataBlock extends console_SimObject {
	constructor() {
		super();
	}
	preload() {
		return true;
	}
	getClassName() {
		return this.className;
	}
	assignClassName() {
		return;
	}
	static install(vm) {
		let vmObj = vm;
	}
	static gatherDocs() {
		let docList = [];
		return { classname : "SimDataBlock", doesextends : true, extendsclass : "SimObject", classfuncs : docList};
	}
}
console_SimDataBlock.__name__ = true;
console_SimDataBlock.__super__ = console_SimObject;
Object.assign(console_SimDataBlock.prototype, {
	__class__: console_SimDataBlock
});
class console_SimSet extends console_SimObject {
	constructor() {
		console_ConsoleObject._hx_skip_constructor = true;
		super();
		console_ConsoleObject._hx_skip_constructor = false;
		this._hx_constructor();
	}
	_hx_constructor() {
		this.objectList = [];
		super._hx_constructor();
	}
	addObject(obj) {
		if(!this.objectList.includes(obj)) {
			this.objectList.push(obj);
		}
	}
	removeObject(obj) {
		HxOverrides.remove(this.objectList,obj);
	}
	getClassName() {
		return "SimSet";
	}
	assignClassName() {
		this.className = "SimSet";
	}
	static listObjects(vm,thisObj,args) {
		let _g = 0;
		let _g1 = thisObj.objectList;
		while(_g < _g1.length) {
			let obj = _g1[_g];
			++_g;
			let isSet = (((obj) instanceof console_SimSet) ? obj : null) != null;
			let name = obj.name;
			if(name != null) {
				Log.println("\t" + obj.id + ",\"" + name + "\": " + obj.getClassName() + " " + (isSet ? "(g)" : ""));
			} else {
				Log.println("\t" + obj.id + ": " + obj.getClassName() + " " + (isSet ? "(g)" : ""));
			}
		}
	}
	static add(vm,thisObj,args) {
		let _g = 2;
		let _g1 = args.length;
		while(_g < _g1) {
			let i = _g++;
			let addObj = thisObj.vm.findObject(args[i]);
			if(addObj != null) {
				thisObj.addObject(addObj);
			} else {
				Log.println("Set::add: Object " + args[i] + " does not exist.");
			}
		}
	}
	static remove(vm,thisObj,args) {
		let _g = 2;
		let _g1 = args.length;
		while(_g < _g1) {
			let i = _g++;
			let addObj = thisObj.vm.findObject(args[i]);
			if(addObj != null) {
				thisObj.removeObject(addObj);
			} else {
				Log.println("Set::remove: Object " + args[i] + " does not exist.");
			}
		}
	}
	static clear(vm,thisObj,args) {
		let _g = 0;
		let _g1 = thisObj.objectList;
		while(_g < _g1.length) {
			let obj = _g1[_g];
			++_g;
			thisObj.removeObject(obj);
		}
	}
	static getCount(vm,thisObj,args) {
		return thisObj.objectList.length;
	}
	static getObject(vm,thisObj,args) {
		let index = Std.parseInt(args[2]);
		if(index < 0 || index >= thisObj.objectList.length) {
			Log.println("Set::getObject: index out of range.");
			return -1;
		}
		return thisObj.objectList[index].id;
	}
	static isMember(vm,thisObj,args) {
		let findObj = thisObj.vm.findObject(args[2]);
		if(findObj == null) {
			Log.println("Set::isMember: " + args[2] + " is not an object.");
			return false;
		}
		return thisObj.objectList.includes(findObj);
	}
	static bringToFront(vm,thisObj,args) {
		let findObj = thisObj.vm.findObject(args[2]);
		if(findObj == null) {
			return;
		}
		HxOverrides.remove(thisObj.objectList,findObj);
		thisObj.objectList.splice(0,0,findObj);
	}
	static pushToBack(vm,thisObj,args) {
		let findObj = thisObj.vm.findObject(args[2]);
		if(findObj == null) {
			return;
		}
		HxOverrides.remove(thisObj.objectList,findObj);
		thisObj.objectList.push(findObj);
	}
	static install(vm) {
		let vmObj = vm;
		vmObj.addConsoleMethod("SimSet","listObjects","set.listObjects() - Dump a list of all objects contained in the set to the console.",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimSet.listObjects(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","add","set.add(obj1,...) - Add the given objects to the set.",3,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimSet.add(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","remove","set.remove(obj1,...) - Remove the given objects from the set.",3,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimSet.remove(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","clear","set.clear() - Remove all objects from the set.",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimSet.clear(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","getCount","set.getCount() - Get the number of objects contained in the set.",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_SimSet.getCount(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","getObject","set.getObject(objIndex) - Get the object at the given index.",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {
			return console_SimSet.getObject(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","isMember","set.isMember(object) - Test whether the given object belongs to the set.",3,3,console_FunctionType.BoolCallbackType(function(vm,s,arr) {
			return console_SimSet.isMember(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","bringToFront","set.bringToFront(object)",3,3,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimSet.bringToFront(vm,s,arr);
		}));
		vmObj.addConsoleMethod("SimSet","pushToBack","set.pushToBack(object) - Make the given object the last object in the set.",3,3,console_FunctionType.VoidCallbackType(function(vm,s,arr) {
			console_SimSet.pushToBack(vm,s,arr);
		}));
	}
	static gatherDocs() {
		let docList = [];
		docList.push({ funcname : "listObjects", funcusage : "set.listObjects() - Dump a list of all objects contained in the set to the console."});
		docList.push({ funcname : "add", funcusage : "set.add(obj1,...) - Add the given objects to the set."});
		docList.push({ funcname : "remove", funcusage : "set.remove(obj1,...) - Remove the given objects from the set."});
		docList.push({ funcname : "clear", funcusage : "set.clear() - Remove all objects from the set."});
		docList.push({ funcname : "getCount", funcusage : "set.getCount() - Get the number of objects contained in the set."});
		docList.push({ funcname : "getObject", funcusage : "set.getObject(objIndex) - Get the object at the given index."});
		docList.push({ funcname : "isMember", funcusage : "set.isMember(object) - Test whether the given object belongs to the set."});
		docList.push({ funcname : "bringToFront", funcusage : "set.bringToFront(object)"});
		docList.push({ funcname : "pushToBack", funcusage : "set.pushToBack(object) - Make the given object the last object in the set."});
		return { classname : "SimSet", doesextends : true, extendsclass : "SimObject", classfuncs : docList};
	}
}
console_SimSet.__name__ = true;
console_SimSet.__super__ = console_SimObject;
Object.assign(console_SimSet.prototype, {
	__class__: console_SimSet
});
class console_SimGroup extends console_SimSet {
	constructor() {
		super();
	}
	addObject(obj) {
		if(obj.group != this) {
			if(obj.group != null) {
				obj.group.removeObject(obj);
			}
			obj.group = this;
			super.addObject(obj);
		}
	}
	removeObject(obj) {
		if(obj.group == this) {
			obj.group = null;
			super.removeObject(obj);
		}
	}
	getClassName() {
		return "SimGroup";
	}
	assignClassName() {
		this.className = "SimGroup";
	}
	static install(vm) {
		let vmObj = vm;
	}
	static gatherDocs() {
		let docList = [];
		return { classname : "SimGroup", doesextends : true, extendsclass : "SimSet", classfuncs : docList};
	}
}
console_SimGroup.__name__ = true;
console_SimGroup.__super__ = console_SimSet;
Object.assign(console_SimGroup.prototype, {
	__class__: console_SimGroup
});
class console_ConsoleObjectConstructors {
	static install(vm) {
		let vmObj = vm;
		console_SimObject.install(vmObj);
		console_ScriptObject.install(vmObj);
		console_SimDataBlock.install(vmObj);
		console_SimSet.install(vmObj);
		console_SimGroup.install(vmObj);
		vmObj.linkNamespaces("SimObject","ScriptObject");
		vmObj.linkNamespaces("SimObject","SimDataBlock");
		vmObj.linkNamespaces("SimObject","SimSet");
		vmObj.linkNamespaces("SimSet","SimGroup");
	}
	static gatherDocs() {
		let doclist = [];
		doclist.push(console_SimObject.gatherDocs());
		doclist.push(console_ScriptObject.gatherDocs());
		doclist.push(console_SimDataBlock.gatherDocs());
		doclist.push(console_SimSet.gatherDocs());
		doclist.push(console_SimGroup.gatherDocs());
		return doclist;
	}
}
console_ConsoleObjectConstructors.__name__ = true;
class console_ConsoleObjectMacro {
}
console_ConsoleObjectMacro.__name__ = true;
class console_MathFunctions {
	static solveLinear(a,b) {
		if(a == 0) {
			return { roots : []};
		}
		return { roots : [-b / a]};
	}
	static solveQuadratic(a,b,c) {
		if(a == 0) {
			return console_MathFunctions.solveLinear(b,c);
		}
		let discriminant = b * b - 4 * a * c;
		if(discriminant < 0) {
			return { roots : []};
		} else if(discriminant == 0) {
			return { roots : [-b / (2 * a)]};
		} else {
			let sqrtDiscriminant = Math.sqrt(discriminant);
			let den = 2 * a;
			return { roots : [(-b + sqrtDiscriminant) / den,(-b - sqrtDiscriminant) / den]};
		}
	}
	static solveCubic(a,b,c,d) {
		if(a == 0) {
			return console_MathFunctions.solveQuadratic(b,c,d);
		}
		let A = b / a;
		let B = c / a;
		let C = d / a;
		let A2 = A * A;
		let A3 = A2 * A;
		let p = 0.33333333333333331 * (-0.33333333333333331 * A2 + B);
		let q = 0.5 * (0.07407407407407407 * A3 - 0.33333333333333331 * A * B + C);
		let p3 = p * p * p;
		let q2 = q * q;
		let D = q2 + p3;
		let num = 0;
		let roots = [];
		if(D == 0) {
			if(q == 0) {
				roots.push(0);
				num = 1;
			} else {
				let u = Math.pow(-q,0.33333333333333331);
				roots.push(2 * u);
				roots.push(-u);
				num = 2;
			}
		} else if(D < 0) {
			let phi = 0.33333333333333331 * Math.acos(-q / Math.sqrt(-p3));
			let t = 2 * Math.sqrt(-p);
			roots.push(t * Math.cos(phi));
			roots.push(-t * Math.cos(phi + Math.PI / 3));
			roots.push(-t * Math.cos(phi - Math.PI / 3));
			num = 3;
		} else {
			let sqrtD = Math.sqrt(D);
			let u = Math.pow(sqrtD - q,0.33333333333333331);
			let v = -Math.pow(sqrtD + q,0.33333333333333331);
			roots.push(u + v);
			num = 1;
		}
		let _g = 0;
		let _g1 = num;
		while(_g < _g1) {
			let i = _g++;
			roots[i] -= A / 3;
		}
		roots.sort(function(a,b) {
			if(a > 0) {
				return 1;
			} else if(a < 0) {
				return -1;
			} else {
				return 0;
			}
		});
		return { roots : roots};
	}
	static solveQuartic(a,b,c,d,e) {
		if(a == 0) {
			return console_MathFunctions.solveCubic(b,c,d,e);
		}
		let A = b / a;
		let B = c / a;
		let C = d / a;
		let D = e / a;
		let A2 = A * A;
		let A3 = A2 * A;
		let A4 = A2 * A2;
		let sqrtA = Math.sqrt(A);
		let aCubed = A3 * A;
		let bSqrt = B * B;
		let cQuad = C * C;
		let dQuad = D * D;
		let p = -0.375 * A2 + B;
		let q = 0.125 * A3 - 0.5 * A * B + C;
		let r = -0.01171875 * A4 + 0.0625 * A2 * B - 0.25 * A * C + D;
		let p3 = p * p * p;
		let q2 = q * q;
		let D1 = q2 + p3;
		let num = 0;
		let roots = [];
		if(r == 0) {
			let cbs = console_MathFunctions.solveCubic(1,0,p,q);
			roots = cbs.roots;
			roots.push(0);
		} else {
			let q2 = q * q;
			a = 1;
			b = -0.5 * p;
			c = -r;
			d = 0.5 * r * p - 0.125 * q2;
			let cbs = console_MathFunctions.solveCubic(a,b,c,d);
			let z = cbs.roots[0];
			let u = z * z - r;
			let v = 2 * z - p;
			if(u > 0) {
				u = Math.sqrt(u);
			} else {
				return { roots : []};
			}
			if(v > 0) {
				v = Math.sqrt(v);
			} else {
				return { roots : []};
			}
			a = 1;
			b = v;
			c = z - u;
			let qr1 = console_MathFunctions.solveQuadratic(a,b,c);
			num = qr1.roots.length;
			a = 1;
			b = -v;
			c = z + u;
			let qr2 = console_MathFunctions.solveQuadratic(a,b,c);
			num += qr2.roots.length;
			roots = qr1.roots.concat(qr2.roots);
		}
		let _g = 0;
		let _g1 = num;
		while(_g < _g1) {
			let i = _g++;
			roots[i] -= A / 4;
		}
		roots.sort(function(a,b) {
			if(a > 0) {
				return 1;
			} else if(a < 0) {
				return -1;
			} else {
				return 0;
			}
		});
		return { roots : roots};
	}
	static mSolveQuadratic(vm,thisObj,args) {
		let a = parseFloat(args[1]);
		let b = parseFloat(args[2]);
		let c = parseFloat(args[3]);
		let roots = console_MathFunctions.solveQuadratic(a,b,c);
		return roots.roots.join(" ");
	}
	static mSolveCubic(vm,thisObj,args) {
		let a = parseFloat(args[1]);
		let b = parseFloat(args[2]);
		let c = parseFloat(args[3]);
		let d = parseFloat(args[4]);
		let roots = console_MathFunctions.solveCubic(a,b,c,d);
		return roots.roots.join(" ");
	}
	static mSolveQuartic(vm,thisObj,args) {
		let a = parseFloat(args[1]);
		let b = parseFloat(args[2]);
		let c = parseFloat(args[3]);
		let d = parseFloat(args[4]);
		let e = parseFloat(args[5]);
		let roots = console_MathFunctions.solveQuartic(a,b,c,d,e);
		return roots.roots.join(" ");
	}
	static mFloor(vm,thisObj,args) {
		return Math.floor(parseFloat(args[1]));
	}
	static mCeil(vm,thisObj,args) {
		return Math.ceil(parseFloat(args[1]));
	}
	static mAbs(vm,thisObj,args) {
		return Math.abs(parseFloat(args[1]));
	}
	static mSqrt(vm,thisObj,args) {
		return Math.sqrt(parseFloat(args[1]));
	}
	static mPow(vm,thisObj,args) {
		return Math.pow(parseFloat(args[1]),parseFloat(args[2]));
	}
	static mLog(vm,thisObj,args) {
		return Math.log(parseFloat(args[1]));
	}
	static mSin(vm,thisObj,args) {
		return Math.sin(parseFloat(args[1]));
	}
	static mCos(vm,thisObj,args) {
		return Math.cos(parseFloat(args[1]));
	}
	static mTan(vm,thisObj,args) {
		return Math.tan(parseFloat(args[1]));
	}
	static mAsin(vm,thisObj,args) {
		return Math.asin(parseFloat(args[1]));
	}
	static mAcos(vm,thisObj,args) {
		return Math.acos(parseFloat(args[1]));
	}
	static mAtan(vm,thisObj,args) {
		return Math.atan2(parseFloat(args[1]),parseFloat(args[2]));
	}
	static mRadToDeg(vm,thisObj,args) {
		return parseFloat(args[1]) * 180 / Math.PI;
	}
	static mDegToRad(vm,thisObj,args) {
		return parseFloat(args[1]) * Math.PI / 180;
	}
	static install(vm) {
		let vmObj = vm;
		vmObj.addConsoleFunction("mSolveQuadratic","mSolveQuadratic(float a, float b, float c) - Solve a quadratic equation (2nd degree polynomial) of form a*x^2 + b*x + c = 0.",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mSolveQuadratic(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mSolveCubic","mSolveCubic(float a, float b, float c, float d) - Solve a cubic equation (3rd degree polynomial) of form a*x^3 + b*x^2 + c*x + d = 0.",5,5,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mSolveCubic(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mSolveQuartic","mSolveQuartic(float a, float b, float c, float d, float e) - Solve a quartic equation (4th degree polynomial) of form a*x^4 + b*x^3 + c*x^2 + d*x + e = 0.",6,6,console_FunctionType.StringCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mSolveQuartic(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mFloor","mFloor(float v) - Round v down to the nearest whole number.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mFloor(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mCeil","mCeil(float v) - Round v up to the nearest whole number.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mCeil(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mAbs","mAbs(float v) - Returns the absolute value of the argument.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mAbs(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mSqrt","mSqrt(float v) - Returns the square root of the argument.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mSqrt(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mPow","mPow(float b, float p) - Returns the b raised to the pth power.",3,3,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mPow(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mLog","mLog(float v) - Returns the natural logarithm of the argument.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mLog(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mSin","mSin(float th) - Returns the sine of th, which is in radians.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mSin(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mCos","mCos(float th) - Returns the cosine of th, which is in radians.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mCos(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mTan","mTan(float th) - Returns the tangent of th, which is in radians.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mTan(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mAsin","mAsin(float th) - Returns the arc-sine of th, which is in radians.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mAsin(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mAcos","mAcos(float th) - Returns the arc-cosine of th, which is in radians.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mAcos(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mAtan","mAtan(float rise, float run) - Returns the slope in radians (the arc-tangent) of a line with the given rise and run.",3,3,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mAtan(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mRadToDeg","mRadToDeg(float radians) - Converts a measure in radians to degrees.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mRadToDeg(vm,s,arr);
		}));
		vmObj.addConsoleFunction("mDegToRad","mDegToRad(float degrees) - Convert a measure in degrees to radians.",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {
			return console_MathFunctions.mDegToRad(vm,s,arr);
		}));
	}
	static gatherDocs() {
		let docList = [];
		docList.push({ funcname : "mSolveQuadratic", funcusage : "mSolveQuadratic(float a, float b, float c) - Solve a quadratic equation (2nd degree polynomial) of form a*x^2 + b*x + c = 0."});
		docList.push({ funcname : "mSolveCubic", funcusage : "mSolveCubic(float a, float b, float c, float d) - Solve a cubic equation (3rd degree polynomial) of form a*x^3 + b*x^2 + c*x + d = 0."});
		docList.push({ funcname : "mSolveQuartic", funcusage : "mSolveQuartic(float a, float b, float c, float d, float e) - Solve a quartic equation (4th degree polynomial) of form a*x^4 + b*x^3 + c*x^2 + d*x + e = 0."});
		docList.push({ funcname : "mFloor", funcusage : "mFloor(float v) - Round v down to the nearest whole number."});
		docList.push({ funcname : "mCeil", funcusage : "mCeil(float v) - Round v up to the nearest whole number."});
		docList.push({ funcname : "mAbs", funcusage : "mAbs(float v) - Returns the absolute value of the argument."});
		docList.push({ funcname : "mSqrt", funcusage : "mSqrt(float v) - Returns the square root of the argument."});
		docList.push({ funcname : "mPow", funcusage : "mPow(float b, float p) - Returns the b raised to the pth power."});
		docList.push({ funcname : "mLog", funcusage : "mLog(float v) - Returns the natural logarithm of the argument."});
		docList.push({ funcname : "mSin", funcusage : "mSin(float th) - Returns the sine of th, which is in radians."});
		docList.push({ funcname : "mCos", funcusage : "mCos(float th) - Returns the cosine of th, which is in radians."});
		docList.push({ funcname : "mTan", funcusage : "mTan(float th) - Returns the tangent of th, which is in radians."});
		docList.push({ funcname : "mAsin", funcusage : "mAsin(float th) - Returns the arc-sine of th, which is in radians."});
		docList.push({ funcname : "mAcos", funcusage : "mAcos(float th) - Returns the arc-cosine of th, which is in radians."});
		docList.push({ funcname : "mAtan", funcusage : "mAtan(float rise, float run) - Returns the slope in radians (the arc-tangent) of a line with the given rise and run."});
		docList.push({ funcname : "mRadToDeg", funcusage : "mRadToDeg(float radians) - Converts a measure in radians to degrees."});
		docList.push({ funcname : "mDegToRad", funcusage : "mDegToRad(float degrees) - Convert a measure in degrees to radians."});
		return docList;
	}
}
console_MathFunctions.__name__ = true;
var console_FunctionType = $hxEnums["console.FunctionType"] = { __ename__:true,__constructs__:null
	,ScriptFunctionType: ($_=function(functionOffset,codeBlock) { return {_hx_index:0,functionOffset:functionOffset,codeBlock:codeBlock,__enum__:"console.FunctionType",toString:$estr}; },$_._hx_name="ScriptFunctionType",$_.__params__ = ["functionOffset","codeBlock"],$_)
	,JSFunctionType: ($_=function(callback) { return {_hx_index:1,callback:callback,__enum__:"console.FunctionType",toString:$estr}; },$_._hx_name="JSFunctionType",$_.__params__ = ["callback"],$_)
	,IntCallbackType: ($_=function(callback) { return {_hx_index:2,callback:callback,__enum__:"console.FunctionType",toString:$estr}; },$_._hx_name="IntCallbackType",$_.__params__ = ["callback"],$_)
	,FloatCallbackType: ($_=function(callback) { return {_hx_index:3,callback:callback,__enum__:"console.FunctionType",toString:$estr}; },$_._hx_name="FloatCallbackType",$_.__params__ = ["callback"],$_)
	,StringCallbackType: ($_=function(callback) { return {_hx_index:4,callback:callback,__enum__:"console.FunctionType",toString:$estr}; },$_._hx_name="StringCallbackType",$_.__params__ = ["callback"],$_)
	,VoidCallbackType: ($_=function(callback) { return {_hx_index:5,callback:callback,__enum__:"console.FunctionType",toString:$estr}; },$_._hx_name="VoidCallbackType",$_.__params__ = ["callback"],$_)
	,BoolCallbackType: ($_=function(callback) { return {_hx_index:6,callback:callback,__enum__:"console.FunctionType",toString:$estr}; },$_._hx_name="BoolCallbackType",$_.__params__ = ["callback"],$_)
};
console_FunctionType.__constructs__ = [console_FunctionType.ScriptFunctionType,console_FunctionType.JSFunctionType,console_FunctionType.IntCallbackType,console_FunctionType.FloatCallbackType,console_FunctionType.StringCallbackType,console_FunctionType.VoidCallbackType,console_FunctionType.BoolCallbackType];
class console_NamespaceEntry {
	constructor(ns,fname,ftype,minArgs,maxArgs,usage,pkg) {
		this.namespace = ns;
		this.functionName = fname;
		this.type = ftype;
		this.minArgs = minArgs;
		this.maxArgs = maxArgs;
		this.usage = usage;
		this.pkg = pkg;
	}
}
console_NamespaceEntry.__name__ = true;
Object.assign(console_NamespaceEntry.prototype, {
	__class__: console_NamespaceEntry
});
class console_Namespace {
	constructor(name,pkg,parent) {
		this.name = name;
		this.pkg = pkg;
		this.parent = parent;
		this.entries = [];
	}
	addFunction(name,functionOffset,codeblock) {
		let ent = new console_NamespaceEntry(this,name,console_FunctionType.ScriptFunctionType(functionOffset,codeblock),0,0,"",null);
		this.entries.push(ent);
	}
	addFunctionFull(name,usage,minArgs,maxArgs,ftype) {
		let ent = new console_NamespaceEntry(this,name,ftype,minArgs,maxArgs,usage,null);
		this.entries.push(ent);
	}
	find(functionName) {
		let _g = 0;
		let _g1 = this.entries;
		while(_g < _g1.length) {
			let entry = _g1[_g];
			++_g;
			if(entry.functionName.toLowerCase() == functionName.toLowerCase()) {
				return entry;
			}
		}
		if(this.parent != null) {
			return this.parent.find(functionName);
		}
		return null;
	}
}
console_Namespace.__name__ = true;
Object.assign(console_Namespace.prototype, {
	__class__: console_Namespace
});
var expr_TypeReq = $hxEnums["expr.TypeReq"] = { __ename__:true,__constructs__:null
	,ReqNone: {_hx_name:"ReqNone",_hx_index:0,__enum__:"expr.TypeReq",toString:$estr}
	,ReqInt: {_hx_name:"ReqInt",_hx_index:1,__enum__:"expr.TypeReq",toString:$estr}
	,ReqFloat: {_hx_name:"ReqFloat",_hx_index:2,__enum__:"expr.TypeReq",toString:$estr}
	,ReqString: {_hx_name:"ReqString",_hx_index:3,__enum__:"expr.TypeReq",toString:$estr}
};
expr_TypeReq.__constructs__ = [expr_TypeReq.ReqNone,expr_TypeReq.ReqInt,expr_TypeReq.ReqFloat,expr_TypeReq.ReqString];
class expr_Stmt {
	constructor(lineNo) {
		if(expr_Stmt._hx_skip_constructor) {
			return;
		}
		this._hx_constructor(lineNo);
	}
	_hx_constructor(lineNo) {
		this.lineNo = lineNo;
	}
	print(indent,isStmt) {
		throw new haxe_Exception("print not implemented");
	}
	printIndent(indent) {
		let i = 0;
		let out_b = "";
		while(i < indent) {
			out_b += "    ";
			++i;
		}
		return out_b;
	}
	precompileStmt(compiler,loopCount) {
		return 0;
	}
	compileStmt(compiler,context) {
		return 0;
	}
	addBreakCount(compiler) {
		if(compiler.inFunction) {
			compiler.breakLineCount++;
		}
	}
	visitStmt(optimizerPass) {
		optimizerPass.visitStmt(this);
	}
	addBreakLine(ip,compiler,context) {
		if(compiler.inFunction) {
			let line = compiler.breakLineCount * 2;
			compiler.breakLineCount++;
			if(context.lineBreakPairs.length != 0) {
				context.lineBreakPairs[line] = this.lineNo;
				context.lineBreakPairs[line + 1] = ip;
			}
		}
	}
	static precompileBlock(compiler,stmts,loopCount) {
		expr_Stmt.recursion++;
		let result = new Array(stmts.length);
		let _g = 0;
		let _g1 = stmts.length;
		while(_g < _g1) {
			let i = _g++;
			result[i] = stmts[i].precompileStmt(compiler,loopCount);
		}
		let ans = result;
		expr_Stmt.recursion--;
		let sn = 0;
		let _g2 = 0;
		while(_g2 < ans.length) {
			let s = ans[_g2];
			++_g2;
			sn += s;
		}
		return sn;
	}
	static compileBlock(compiler,context,stmts) {
		expr_Stmt.recursion++;
		let _g = 0;
		while(_g < stmts.length) {
			let s = stmts[_g];
			++_g;
			context.ip = s.compileStmt(compiler,context);
		}
		expr_Stmt.recursion--;
		return context.ip;
	}
	static visitBlock(optimizerPass,stmts) {
		let _g = 0;
		while(_g < stmts.length) {
			let s = stmts[_g];
			++_g;
			s.visitStmt(optimizerPass);
		}
	}
	static printBlock(stmt,indent) {
		let sbuf_b = "";
		let _g = 0;
		while(_g < stmt.length) {
			let s = stmt[_g];
			++_g;
			sbuf_b += Std.string(s.print(indent,true));
		}
		return sbuf_b;
	}
}
expr_Stmt.__name__ = true;
Object.assign(expr_Stmt.prototype, {
	__class__: expr_Stmt
});
class expr_BreakStmt extends expr_Stmt {
	constructor(lineNo) {
		super(lineNo);
	}
	print(indent,isStmt) {
		return this.printIndent(indent) + "break;\n";
	}
	precompileStmt(compiler,loopCount) {
		if(loopCount > 0) {
			this.addBreakCount(compiler);
			return 2;
		}
		console.log("src/expr/Expr.hx:125:","Warning: break outside of loop.");
		return 0;
	}
	compileStmt(compiler,context) {
		if(context.breakPoint > 0) {
			this.addBreakLine(context.ip,compiler,context);
			context.codeStream[context.ip++] = 12;
			context.codeStream[context.ip++] = context.breakPoint;
		}
		return context.ip;
	}
	visitStmt(optimizerPass) {
		optimizerPass.visitBreakStmt(this);
	}
}
expr_BreakStmt.__name__ = true;
expr_BreakStmt.__super__ = expr_Stmt;
Object.assign(expr_BreakStmt.prototype, {
	__class__: expr_BreakStmt
});
class expr_ContinueStmt extends expr_Stmt {
	constructor(lineNo) {
		super(lineNo);
	}
	print(indent,isStmt) {
		return this.printIndent(indent) + "continue;\n";
	}
	precompileStmt(compiler,loopCount) {
		if(loopCount > 0) {
			this.addBreakCount(compiler);
			return 2;
		}
		console.log("src/expr/Expr.hx:160:","Warning: continue outside of loop.");
		return 0;
	}
	compileStmt(compiler,context) {
		if(context.continuePoint > 0) {
			this.addBreakLine(context.ip,compiler,context);
			context.codeStream[context.ip++] = 12;
			context.codeStream[context.ip++] = context.continuePoint;
		}
		return context.ip;
	}
	visitStmt(optimizerPass) {
		optimizerPass.visitContinueStmt(this);
	}
}
expr_ContinueStmt.__name__ = true;
expr_ContinueStmt.__super__ = expr_Stmt;
Object.assign(expr_ContinueStmt.prototype, {
	__class__: expr_ContinueStmt
});
class expr_Expr extends expr_Stmt {
	_hx_constructor(lineNo) {
		super._hx_constructor(lineNo);
	}
	print(indent,isStmt) {
		throw new haxe_Exception("print not implemented");
	}
	precompileStmt(compiler,loopCount) {
		this.addBreakCount(compiler);
		return this.precompile(compiler,expr_TypeReq.ReqNone);
	}
	compileStmt(compiler,context) {
		this.addBreakLine(context.ip,compiler,context);
		return this.compile(compiler,context,expr_TypeReq.ReqNone);
	}
	precompile(compiler,typeReq) {
		return 0;
	}
	compile(compiler,context,typeReq) {
		return 0;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqNone;
	}
	visitStmt(optimizerPass) {
		optimizerPass.visitExpr(this);
	}
	static conversionOp(src,dest) {
		switch(src._hx_index) {
		case 1:
			switch(dest._hx_index) {
			case 0:
				return 64;
			case 2:
				return 62;
			case 3:
				return 63;
			default:
				return 83;
			}
			break;
		case 2:
			switch(dest._hx_index) {
			case 0:
				return 61;
			case 1:
				return 59;
			case 3:
				return 60;
			default:
				return 83;
			}
			break;
		case 3:
			switch(dest._hx_index) {
			case 0:
				return 58;
			case 1:
				return 56;
			case 2:
				return 57;
			default:
				return 83;
			}
			break;
		default:
			return 83;
		}
	}
}
expr_Expr.__name__ = true;
expr_Expr.__super__ = expr_Stmt;
Object.assign(expr_Expr.prototype, {
	__class__: expr_Expr
});
class expr_ParenthesisExpr extends expr_Expr {
	constructor(expr) {
		super(expr.lineNo);
		this.expr = expr;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + "(" + this.expr.print(indent,false) + ")" + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		let size = this.expr.precompile(compiler,typeReq);
		return size;
	}
	compile(compiler,context,typeReq) {
		let size = this.expr.compile(compiler,context,typeReq);
		context.ip = size;
		return size;
	}
	getPrefferredType() {
		return this.expr.getPrefferredType();
	}
	visitStmt(optimizerPass) {
		this.expr.visitStmt(optimizerPass);
		optimizerPass.visitParenthesisExpr(this);
	}
}
expr_ParenthesisExpr.__name__ = true;
expr_ParenthesisExpr.__super__ = expr_Expr;
Object.assign(expr_ParenthesisExpr.prototype, {
	__class__: expr_ParenthesisExpr
});
class expr_ReturnStmt extends expr_Stmt {
	constructor(lineNo,expr) {
		super(lineNo);
		this.expr = expr;
	}
	print(indent,isStmt) {
		return this.printIndent(indent) + ("return" + (this.expr == null ? "" : " " + this.expr.print(indent,false)) + ";\n");
	}
	precompileStmt(compiler,loopCount) {
		this.addBreakCount(compiler);
		if(this.expr == null) {
			return 1;
		} else {
			return 1 + this.expr.precompile(compiler,expr_TypeReq.ReqString);
		}
	}
	compileStmt(compiler,context) {
		this.addBreakLine(context.ip,compiler,context);
		if(this.expr == null) {
			context.codeStream[context.ip++] = 13;
		} else {
			context.ip = this.expr.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 13;
		}
		return context.ip;
	}
	visitStmt(optimizerPass) {
		if(this.expr != null) {
			this.expr.visitStmt(optimizerPass);
		}
		optimizerPass.visitReturnStmt(this);
	}
}
expr_ReturnStmt.__name__ = true;
expr_ReturnStmt.__super__ = expr_Stmt;
Object.assign(expr_ReturnStmt.prototype, {
	__class__: expr_ReturnStmt
});
class expr_IfStmt extends expr_Stmt {
	constructor(lineNo,condition,body,elseBlock) {
		super(lineNo);
		this.condition = condition;
		this.body = body;
		this.elseBlock = elseBlock;
	}
	print(indent,isStmt) {
		let ifPart = this.printIndent(indent) + ("if (" + this.condition.print(indent,false) + ")");
		if(this.ifStmtList) {
			ifPart += " {\n";
		} else {
			ifPart += "\n";
		}
		let bodyPart = expr_Stmt.printBlock(this.body,indent + 1) + (this.body.length > 1 ? this.printIndent(indent) + "}" : "");
		if(this.elseBlock != null || this.elseStmtList) {
			if(this.ifStmtList) {
				bodyPart += " ";
			}
			bodyPart += this.printIndent(indent) + "else";
			if(this.elseStmtList) {
				bodyPart += " {\n";
			} else {
				bodyPart += "\n";
			}
			if(this.elseBlock != null) {
				let elsePart = expr_Stmt.printBlock(this.elseBlock,indent + 1) + (this.elseBlock.length > 1 ? this.printIndent(indent) + "}\n" : "");
				bodyPart += elsePart;
			}
		} else if(this.elseStmtList) {
			bodyPart += "\n";
		}
		return ifPart + bodyPart;
	}
	precompileStmt(compiler,loopCount) {
		let exprSize = 0;
		this.addBreakCount(compiler);
		if(this.condition.getPrefferredType() == expr_TypeReq.ReqInt) {
			exprSize += this.condition.precompile(compiler,expr_TypeReq.ReqInt);
			this.integer = true;
		} else {
			exprSize += this.condition.precompile(compiler,expr_TypeReq.ReqFloat);
			this.integer = false;
		}
		let ifSize = expr_Stmt.precompileBlock(compiler,this.body,loopCount);
		if(this.elseBlock == null) {
			this.endifOffset = exprSize + 2 + ifSize;
		} else {
			this.elseOffset = exprSize + 2 + ifSize + 2;
			let elseSize = expr_Stmt.precompileBlock(compiler,this.elseBlock,loopCount);
			this.endifOffset = this.elseOffset + elseSize;
		}
		return this.endifOffset;
	}
	compileStmt(compiler,context) {
		let start = context.ip;
		this.addBreakLine(start,compiler,context);
		context.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);
		context.codeStream[context.ip++] = this.integer ? 7 : 6;
		if(this.elseBlock != null) {
			context.codeStream[context.ip++] = start + this.elseOffset;
			context.ip = expr_Stmt.compileBlock(compiler,context,this.body);
			context.codeStream[context.ip++] = 12;
			context.codeStream[context.ip++] = start + this.endifOffset;
			context.ip = expr_Stmt.compileBlock(compiler,context,this.elseBlock);
		} else {
			context.codeStream[context.ip++] = start + this.endifOffset;
			context.ip = expr_Stmt.compileBlock(compiler,context,this.body);
		}
		return context.ip;
	}
	visitStmt(optimizerPass) {
		this.condition.visitStmt(optimizerPass);
		expr_Stmt.visitBlock(optimizerPass,this.body);
		if(this.elseBlock != null) {
			expr_Stmt.visitBlock(optimizerPass,this.elseBlock);
		}
		optimizerPass.visitIfStmt(this);
	}
}
expr_IfStmt.__name__ = true;
expr_IfStmt.__super__ = expr_Stmt;
Object.assign(expr_IfStmt.prototype, {
	__class__: expr_IfStmt
});
class expr_LoopStmt extends expr_Stmt {
	constructor(lineNo,condition,init,end,body) {
		expr_Stmt._hx_skip_constructor = true;
		super();
		expr_Stmt._hx_skip_constructor = false;
		this._hx_constructor(lineNo,condition,init,end,body);
	}
	_hx_constructor(lineNo,condition,init,end,body) {
		this.isStatementList = false;
		this.isForLoop = false;
		super._hx_constructor(lineNo);
		this.condition = condition;
		this.init = init;
		this.end = end;
		this.body = body;
	}
	print(indent,isStmt) {
		if(this.isForLoop) {
			let sbuf_b = "";
			sbuf_b += Std.string(this.printIndent(indent));
			sbuf_b += Std.string("for (" + this.init.print(indent,false) + "; " + this.condition.print(indent,false) + "; " + this.end.print(indent,false) + ")");
			if(this.isStatementList) {
				sbuf_b += " {\n";
			} else {
				sbuf_b += "\n";
			}
			let bodyPart = expr_Stmt.printBlock(this.body,indent + 1) + (this.body.length > 1 ? this.printIndent(indent) + "}\n" : "");
			sbuf_b += bodyPart == null ? "null" : "" + bodyPart;
			return sbuf_b;
		} else {
			let sbuf_b = "";
			sbuf_b += Std.string(this.printIndent(indent));
			sbuf_b += Std.string("while (" + this.condition.print(indent,false) + ")");
			if(this.isStatementList) {
				sbuf_b += " {\n";
			} else {
				sbuf_b += "\n";
			}
			let bodyPart = expr_Stmt.printBlock(this.body,indent + 1) + (this.body.length > 1 ? this.printIndent(indent) + "}\n" : "");
			sbuf_b += bodyPart == null ? "null" : "" + bodyPart;
			return sbuf_b;
		}
	}
	precompileStmt(compiler,loopCount) {
		let initSize = 0;
		this.addBreakCount(compiler);
		if(this.init != null) {
			initSize = this.init.precompile(compiler,expr_TypeReq.ReqNone);
		}
		let testSize = 0;
		if(this.condition.getPrefferredType() == expr_TypeReq.ReqInt) {
			this.integer = true;
			testSize = this.condition.precompile(compiler,expr_TypeReq.ReqInt);
		} else {
			this.integer = false;
			testSize = this.condition.precompile(compiler,expr_TypeReq.ReqFloat);
		}
		let blockSize = expr_Stmt.precompileBlock(compiler,this.body,loopCount + 1);
		let endLoopSize = 0;
		if(this.end != null) {
			endLoopSize = this.end.precompile(compiler,expr_TypeReq.ReqNone);
		}
		this.loopBlockStartOffset = initSize + testSize + 2;
		this.continueOffset = this.loopBlockStartOffset + blockSize;
		this.breakOffset = this.continueOffset + endLoopSize + testSize + 2;
		return this.breakOffset;
	}
	compileStmt(compiler,context) {
		this.addBreakLine(context.ip,compiler,context);
		let start = context.ip;
		if(this.init != null) {
			context.ip = this.init.compile(compiler,context,expr_TypeReq.ReqNone);
		}
		context.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);
		context.codeStream[context.ip++] = this.integer ? 7 : 6;
		context.codeStream[context.ip++] = start + this.breakOffset;
		let cbreak = context.breakPoint;
		let ccontinue = context.continuePoint;
		context.breakPoint = start + this.breakOffset;
		context.continuePoint = start + this.continueOffset;
		context.ip = expr_Stmt.compileBlock(compiler,context,this.body);
		context.breakPoint = cbreak;
		context.continuePoint = ccontinue;
		if(this.end != null) {
			context.ip = this.end.compile(compiler,context,expr_TypeReq.ReqNone);
		}
		context.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);
		context.codeStream[context.ip++] = this.integer ? 9 : 8;
		context.codeStream[context.ip++] = start + this.loopBlockStartOffset;
		return context.ip;
	}
	visitStmt(optimizerPass) {
		this.condition.visitStmt(optimizerPass);
		if(this.init != null) {
			this.init.visitStmt(optimizerPass);
		}
		expr_Stmt.visitBlock(optimizerPass,this.body);
		if(this.end != null) {
			this.end.visitStmt(optimizerPass);
		}
		optimizerPass.visitLoopStmt(this);
	}
}
expr_LoopStmt.__name__ = true;
expr_LoopStmt.__super__ = expr_Stmt;
Object.assign(expr_LoopStmt.prototype, {
	__class__: expr_LoopStmt
});
class expr_BinaryExpr extends expr_Expr {
	constructor(lineNo) {
		expr_Stmt._hx_skip_constructor = true;
		super();
		expr_Stmt._hx_skip_constructor = false;
		this._hx_constructor(lineNo);
	}
	_hx_constructor(lineNo) {
		this.optimized = false;
		super._hx_constructor(lineNo);
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.left.print(indent,false) + " " + this.op.lexeme + " " + this.right.print(indent,false)) + (isStmt ? ";\n" : "");
	}
}
expr_BinaryExpr.__name__ = true;
expr_BinaryExpr.__super__ = expr_Expr;
Object.assign(expr_BinaryExpr.prototype, {
	__class__: expr_BinaryExpr
});
class expr_FloatBinaryExpr extends expr_BinaryExpr {
	constructor(left,right,op) {
		super(left.lineNo);
		this.left = left;
		this.right = right;
		this.op = op;
	}
	precompile(compiler,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.precompile(compiler,typeReq);
		}
		let addSize = this.left.precompile(compiler,expr_TypeReq.ReqFloat) + this.right.precompile(compiler,expr_TypeReq.ReqFloat) + 1;
		if(typeReq != expr_TypeReq.ReqFloat) {
			++addSize;
		}
		return addSize;
	}
	compile(compiler,context,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.compile(compiler,context,typeReq);
		}
		context.ip = this.right.compile(compiler,context,expr_TypeReq.ReqFloat);
		context.ip = this.left.compile(compiler,context,expr_TypeReq.ReqFloat);
		let operand;
		switch(this.op.type._hx_index) {
		case 15:
			operand = 31;
			break;
		case 16:
			operand = 32;
			break;
		case 17:
			operand = 33;
			break;
		case 18:
			operand = 34;
			break;
		default:
			operand = 83;
		}
		context.codeStream[context.ip++] = operand;
		if(typeReq != expr_TypeReq.ReqFloat) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqFloat,typeReq);
		}
		return context.ip;
	}
	visitStmt(visitor) {
		if(this.optimized) {
			this.optimizedExpr.visitStmt(visitor);
		} else {
			this.left.visitStmt(visitor);
			this.right.visitStmt(visitor);
			visitor.visitFloatBinaryExpr(this);
		}
	}
	getPrefferredType() {
		return expr_TypeReq.ReqFloat;
	}
}
expr_FloatBinaryExpr.__name__ = true;
expr_FloatBinaryExpr.__super__ = expr_BinaryExpr;
Object.assign(expr_FloatBinaryExpr.prototype, {
	__class__: expr_FloatBinaryExpr
});
class expr_IntBinaryExpr extends expr_BinaryExpr {
	constructor(left,right,op) {
		super(left.lineNo);
		this.left = left;
		this.right = right;
		this.op = op;
	}
	getSubTypeOperand() {
		this.subType = expr_TypeReq.ReqInt;
		let _g = new haxe_ds_EnumValueMap();
		_g.set(TokenType.BitwiseXor,20);
		_g.set(TokenType.Modulus,21);
		_g.set(TokenType.BitwiseAnd,22);
		_g.set(TokenType.BitwiseOr,23);
		_g.set(TokenType.LessThan,17);
		_g.set(TokenType.LessThanEqual,18);
		_g.set(TokenType.GreaterThan,15);
		_g.set(TokenType.GreaterThanEqual,16);
		_g.set(TokenType.Equal,14);
		_g.set(TokenType.NotEqual,19);
		_g.set(TokenType.LogicalOr,30);
		_g.set(TokenType.LogicalAnd,29);
		_g.set(TokenType.RightBitShift,27);
		_g.set(TokenType.LeftBitShift,28);
		let opmap = _g;
		let fltops = [TokenType.LessThan,TokenType.LessThanEqual,TokenType.GreaterThan,TokenType.GreaterThanEqual,TokenType.Equal,TokenType.NotEqual];
		this.operand = opmap.get(this.op.type);
		if(fltops.includes(this.op.type)) {
			this.subType = expr_TypeReq.ReqFloat;
		}
	}
	precompile(compiler,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.precompile(compiler,typeReq);
		}
		this.getSubTypeOperand();
		let addSize = this.left.precompile(compiler,this.subType) + this.right.precompile(compiler,this.subType) + 1;
		if(this.operand == 30 || this.operand == 29) {
			++addSize;
		}
		if(typeReq != expr_TypeReq.ReqInt) {
			++addSize;
		}
		return addSize;
	}
	compile(compiler,context,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.compile(compiler,context,typeReq);
		}
		if(this.operand == 30 || this.operand == 29) {
			context.ip = this.left.compile(compiler,context,this.subType);
			context.codeStream[context.ip++] = this.operand == 30 ? 11 : 10;
			let jmpIp = context.ip++;
			context.ip = this.right.compile(compiler,context,this.subType);
			context.codeStream[jmpIp] = context.ip;
		} else {
			context.ip = this.right.compile(compiler,context,this.subType);
			context.ip = this.left.compile(compiler,context,this.subType);
			context.codeStream[context.ip++] = this.operand;
		}
		if(typeReq != expr_TypeReq.ReqInt) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);
		}
		return context.ip;
	}
	visitStmt(visitor) {
		if(this.optimized) {
			this.optimizedExpr.visitStmt(visitor);
		} else {
			this.left.visitStmt(visitor);
			this.right.visitStmt(visitor);
			visitor.visitIntBinaryExpr(this);
		}
	}
	getPrefferredType() {
		return expr_TypeReq.ReqInt;
	}
}
expr_IntBinaryExpr.__name__ = true;
expr_IntBinaryExpr.__super__ = expr_BinaryExpr;
Object.assign(expr_IntBinaryExpr.prototype, {
	__class__: expr_IntBinaryExpr
});
class expr_StrEqExpr extends expr_BinaryExpr {
	constructor(left,right,op) {
		super(left.lineNo);
		this.left = left;
		this.right = right;
		this.op = op;
	}
	precompile(compiler,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.precompile(compiler,typeReq);
		}
		let size = this.left.precompile(compiler,expr_TypeReq.ReqString) + this.right.precompile(compiler,expr_TypeReq.ReqString) + 2;
		if(this.op.type == TokenType.StringNotEquals) {
			++size;
		}
		if(typeReq != expr_TypeReq.ReqInt) {
			++size;
		}
		return size;
	}
	compile(compiler,context,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.compile(compiler,context,typeReq);
		}
		context.ip = this.left.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 76;
		context.ip = this.right.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 79;
		if(this.op.type == TokenType.StringNotEquals) {
			context.codeStream[context.ip++] = 24;
		}
		if(typeReq != expr_TypeReq.ReqInt) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);
		}
		return context.ip;
	}
	visitStmt(visitor) {
		if(this.optimized) {
			this.optimizedExpr.visitStmt(visitor);
		} else {
			this.left.visitStmt(visitor);
			this.right.visitStmt(visitor);
			visitor.visitStrEqExpr(this);
		}
	}
	getPrefferredType() {
		return expr_TypeReq.ReqInt;
	}
}
expr_StrEqExpr.__name__ = true;
expr_StrEqExpr.__super__ = expr_BinaryExpr;
Object.assign(expr_StrEqExpr.prototype, {
	__class__: expr_StrEqExpr
});
class expr_StrCatExpr extends expr_BinaryExpr {
	constructor(left,right,op) {
		super(left.lineNo);
		this.left = left;
		this.right = right;
		this.op = op;
	}
	precompile(compiler,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.precompile(compiler,typeReq);
		}
		let addSize = this.left.precompile(compiler,expr_TypeReq.ReqString) + this.right.precompile(compiler,expr_TypeReq.ReqString) + 2;
		if(this.op.type != TokenType.Concat) {
			++addSize;
		}
		if(typeReq != expr_TypeReq.ReqString) {
			++addSize;
		}
		return addSize;
	}
	compile(compiler,context,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.compile(compiler,context,typeReq);
		}
		context.ip = this.left.compile(compiler,context,expr_TypeReq.ReqString);
		if(this.op.type == TokenType.Concat) {
			context.codeStream[context.ip++] = 73;
		} else {
			context.codeStream[context.ip++] = 74;
			let this1 = context.codeStream;
			let index = context.ip++;
			let val;
			switch(this.op.type._hx_index) {
			case 42:
				val = 32;
				break;
			case 43:
				val = 9;
				break;
			case 44:
				val = 10;
				break;
			default:
				val = 0;
			}
			this1[index] = val;
		}
		context.ip = this.right.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 77;
		switch(typeReq._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 56;
			break;
		case 2:
			context.codeStream[context.ip++] = 57;
			break;
		default:
		}
		return context.ip;
	}
	visitStmt(visitor) {
		if(this.optimized) {
			this.optimizedExpr.visitStmt(visitor);
		} else {
			this.left.visitStmt(visitor);
			this.right.visitStmt(visitor);
			visitor.visitStrCatExpr(this);
		}
	}
	getPrefferredType() {
		return expr_TypeReq.ReqString;
	}
}
expr_StrCatExpr.__name__ = true;
expr_StrCatExpr.__super__ = expr_BinaryExpr;
Object.assign(expr_StrCatExpr.prototype, {
	__class__: expr_StrCatExpr
});
class expr_CommaCatExpr extends expr_BinaryExpr {
	constructor(left,right) {
		super(left.lineNo);
		this.left = left;
		this.right = right;
	}
	print(indent,isStmt) {
		return "" + this.left.print(indent,false) + ", " + this.right.print(indent,false);
	}
	precompile(compiler,typeReq) {
		let addSize = this.left.precompile(compiler,expr_TypeReq.ReqString) + this.right.precompile(compiler,expr_TypeReq.ReqString) + 2;
		if(typeReq != expr_TypeReq.ReqString) {
			++addSize;
		}
		return addSize;
	}
	compile(compiler,context,typeReq) {
		context.ip = this.left.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 75;
		context.ip = this.right.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 77;
		if(typeReq == expr_TypeReq.ReqInt || typeReq == expr_TypeReq.ReqFloat) {
			console.log("src/expr/Expr.hx:928:","Warning: Converting comma string to number");
		}
		if(typeReq == expr_TypeReq.ReqInt) {
			context.codeStream[context.ip++] = 56;
		} else if(typeReq == expr_TypeReq.ReqFloat) {
			context.codeStream[context.ip++] = 57;
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqString;
	}
}
expr_CommaCatExpr.__name__ = true;
expr_CommaCatExpr.__super__ = expr_BinaryExpr;
Object.assign(expr_CommaCatExpr.prototype, {
	__class__: expr_CommaCatExpr
});
class expr_ConditionalExpr extends expr_Expr {
	constructor(condition,trueExpr,falseExpr) {
		super(condition.lineNo);
		this.condition = condition;
		this.trueExpr = trueExpr;
		this.falseExpr = falseExpr;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.condition.print(indent,false) + " ? " + this.trueExpr.print(indent,false) + " : " + this.falseExpr.print(indent,false) + "}") + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		let exprSize = 0;
		if(this.condition.getPrefferredType() == expr_TypeReq.ReqInt) {
			exprSize = this.condition.precompile(compiler,expr_TypeReq.ReqInt);
			this.integer = true;
		} else {
			exprSize = this.condition.precompile(compiler,expr_TypeReq.ReqFloat);
			this.integer = false;
		}
		return exprSize + this.trueExpr.precompile(compiler,typeReq) + this.falseExpr.precompile(compiler,typeReq) + 4;
	}
	compile(compiler,context,typeReq) {
		context.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);
		context.codeStream[context.ip++] = this.integer ? 7 : 6;
		let jumpElseIp = context.ip++;
		context.ip = this.trueExpr.compile(compiler,context,typeReq);
		context.codeStream[context.ip++] = 12;
		let jumpEndIp = context.ip++;
		context.codeStream[jumpElseIp] = context.ip;
		context.ip = this.falseExpr.compile(compiler,context,typeReq);
		context.codeStream[jumpEndIp] = context.ip;
		return context.ip;
	}
	getPrefferredType() {
		return this.trueExpr.getPrefferredType();
	}
	visitStmt(visitor) {
		this.condition.visitStmt(visitor);
		this.trueExpr.visitStmt(visitor);
		this.falseExpr.visitStmt(visitor);
		visitor.visitConditionalExpr(this);
	}
}
expr_ConditionalExpr.__name__ = true;
expr_ConditionalExpr.__super__ = expr_Expr;
Object.assign(expr_ConditionalExpr.prototype, {
	__class__: expr_ConditionalExpr
});
class expr_IntUnaryExpr extends expr_Expr {
	constructor(expr,op) {
		expr_Stmt._hx_skip_constructor = true;
		super();
		expr_Stmt._hx_skip_constructor = false;
		this._hx_constructor(expr,op);
	}
	_hx_constructor(expr,op) {
		this.optimized = false;
		super._hx_constructor(expr.lineNo);
		this.expr = expr;
		this.op = op;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.op.lexeme + this.expr.print(indent,false)) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.precompile(compiler,typeReq);
		}
		this.integer = true;
		let prefType = this.expr.getPrefferredType();
		if(this.op.type == TokenType.Not && prefType == expr_TypeReq.ReqFloat || prefType == expr_TypeReq.ReqString) {
			this.integer = false;
		}
		let exprSize = this.expr.precompile(compiler,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);
		if(typeReq != expr_TypeReq.ReqInt) {
			return exprSize + 2;
		} else {
			return exprSize + 1;
		}
	}
	compile(compiler,context,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.compile(compiler,context,typeReq);
		}
		context.ip = this.expr.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);
		if(this.op.type == TokenType.Not) {
			context.codeStream[context.ip++] = this.integer ? 24 : 25;
		} else if(this.op.type == TokenType.Tilde) {
			context.codeStream[context.ip++] = 26;
		}
		if(typeReq != expr_TypeReq.ReqInt) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqInt;
	}
	visitStmt(visitor) {
		if(this.optimized) {
			this.optimizedExpr.visitStmt(visitor);
		} else {
			this.expr.visitStmt(visitor);
			visitor.visitIntUnaryExpr(this);
		}
	}
}
expr_IntUnaryExpr.__name__ = true;
expr_IntUnaryExpr.__super__ = expr_Expr;
Object.assign(expr_IntUnaryExpr.prototype, {
	__class__: expr_IntUnaryExpr
});
class expr_FloatUnaryExpr extends expr_Expr {
	constructor(expr,op) {
		expr_Stmt._hx_skip_constructor = true;
		super();
		expr_Stmt._hx_skip_constructor = false;
		this._hx_constructor(expr,op);
	}
	_hx_constructor(expr,op) {
		this.optimized = false;
		super._hx_constructor(expr.lineNo);
		this.expr = expr;
		this.op = op;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.op.lexeme + this.expr.print(indent,false)) + (isStmt ? "\n;" : "");
	}
	precompile(compiler,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.precompile(compiler,typeReq);
		}
		let exprSize = this.expr.precompile(compiler,expr_TypeReq.ReqFloat);
		if(typeReq != expr_TypeReq.ReqFloat) {
			return exprSize + 2;
		} else {
			return exprSize + 1;
		}
	}
	compile(compiler,context,typeReq) {
		if(this.optimized) {
			return this.optimizedExpr.compile(compiler,context,typeReq);
		}
		context.ip = this.expr.compile(compiler,context,expr_TypeReq.ReqFloat);
		context.codeStream[context.ip++] = 35;
		if(typeReq != expr_TypeReq.ReqFloat) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqFloat,typeReq);
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqFloat;
	}
	visitStmt(visitor) {
		if(this.optimized) {
			this.optimizedExpr.visitStmt(visitor);
		} else {
			this.expr.visitStmt(visitor);
			visitor.visitFloatUnaryExpr(this);
		}
	}
}
expr_FloatUnaryExpr.__name__ = true;
expr_FloatUnaryExpr.__super__ = expr_Expr;
Object.assign(expr_FloatUnaryExpr.prototype, {
	__class__: expr_FloatUnaryExpr
});
var expr_VarType = $hxEnums["expr.VarType"] = { __ename__:true,__constructs__:null
	,Global: {_hx_name:"Global",_hx_index:0,__enum__:"expr.VarType",toString:$estr}
	,Local: {_hx_name:"Local",_hx_index:1,__enum__:"expr.VarType",toString:$estr}
};
expr_VarType.__constructs__ = [expr_VarType.Global,expr_VarType.Local];
class expr_VarExpr extends expr_Expr {
	constructor(name,arrayIndex,type) {
		super(name.line);
		this.name = name;
		this.arrayIndex = arrayIndex;
		this.type = type;
	}
	print(indent,isStmt) {
		let str = (isStmt ? this.printIndent(indent) : "") + ("" + (this.type == expr_VarType.Global ? "$" : "%") + this.name.lexeme);
		if(this.arrayIndex != null) {
			str += "[" + this.arrayIndex.print(indent,false) + "]";
		}
		return str + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		if(typeReq == expr_TypeReq.ReqNone) {
			return 0;
		}
		compiler.precompileIdent((this.type == expr_VarType.Global ? "$" : "%") + (this.name.literal == null ? "null" : Std.string(this.name.literal)));
		if(this.arrayIndex != null) {
			return this.arrayIndex.precompile(compiler,expr_TypeReq.ReqString) + 6;
		} else {
			return 3;
		}
	}
	compile(compiler,context,typeReq) {
		if(typeReq == expr_TypeReq.ReqNone) {
			return 0;
		}
		context.codeStream[context.ip++] = this.arrayIndex != null ? 69 : 36;
		context.codeStream[context.ip] = compiler.compileIdent((this.type == expr_VarType.Global ? "$" : "%") + (this.name.literal == null ? "null" : Std.string(this.name.literal)),context.ip);
		context.ip++;
		if(this.arrayIndex != null) {
			context.codeStream[context.ip++] = 73;
			context.ip = this.arrayIndex.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 77;
			context.codeStream[context.ip++] = 38;
		}
		switch(typeReq._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 40;
			break;
		case 2:
			context.codeStream[context.ip++] = 41;
			break;
		case 3:
			context.codeStream[context.ip++] = 42;
			break;
		default:
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqNone;
	}
	visitStmt(visitor) {
		if(this.arrayIndex != null) {
			this.arrayIndex.visitStmt(visitor);
		}
		visitor.visitVarExpr(this);
	}
}
expr_VarExpr.__name__ = true;
expr_VarExpr.__super__ = expr_Expr;
Object.assign(expr_VarExpr.prototype, {
	__class__: expr_VarExpr
});
class expr_IntExpr extends expr_Expr {
	constructor(lineNo,value) {
		super(lineNo);
		this.value = value;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.value) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		if(typeReq == expr_TypeReq.ReqNone) {
			return 0;
		}
		if(typeReq == expr_TypeReq.ReqString) {
			this.index = compiler.addIntString(this.value);
		} else if(typeReq == expr_TypeReq.ReqFloat) {
			this.index = compiler.addFloat(this.value);
		}
		return 2;
	}
	compile(compiler,context,typeReq) {
		switch(typeReq._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 65;
			context.codeStream[context.ip++] = this.value;
			break;
		case 2:
			context.codeStream[context.ip++] = 66;
			context.codeStream[context.ip++] = this.index;
			break;
		case 3:
			context.codeStream[context.ip++] = 68;
			context.codeStream[context.ip++] = this.index;
			break;
		default:
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqInt;
	}
	visitStmt(visitor) {
		visitor.visitIntExpr(this);
	}
}
expr_IntExpr.__name__ = true;
expr_IntExpr.__super__ = expr_Expr;
Object.assign(expr_IntExpr.prototype, {
	__class__: expr_IntExpr
});
class expr_FloatExpr extends expr_Expr {
	constructor(lineNo,value) {
		super(lineNo);
		this.value = value;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.value) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		if(typeReq == expr_TypeReq.ReqNone) {
			return 0;
		}
		if(typeReq == expr_TypeReq.ReqString) {
			this.index = compiler.addFloatString(this.value);
		} else if(typeReq == expr_TypeReq.ReqFloat) {
			this.index = compiler.addFloat(this.value);
		}
		return 2;
	}
	compile(compiler,context,typeReq) {
		switch(typeReq._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 65;
			context.codeStream[context.ip++] = this.value;
			break;
		case 2:
			context.codeStream[context.ip++] = 66;
			context.codeStream[context.ip++] = this.index;
			break;
		case 3:
			context.codeStream[context.ip++] = 68;
			context.codeStream[context.ip++] = this.index;
			break;
		default:
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqFloat;
	}
	visitStmt(visitor) {
		visitor.visitFloatExpr(this);
	}
}
expr_FloatExpr.__name__ = true;
expr_FloatExpr.__super__ = expr_Expr;
Object.assign(expr_FloatExpr.prototype, {
	__class__: expr_FloatExpr
});
class expr_StringConstExpr extends expr_Expr {
	constructor(lineNo,value,tag) {
		super(lineNo);
		this.value = value;
		this.tag = tag;
	}
	print(indent,isStmt) {
		if(this.tag) {
			return (isStmt ? this.printIndent(indent) : "") + ("'" + this.value + "'") + (isStmt ? ";\n" : "");
		}
		return (isStmt ? this.printIndent(indent) : "") + ("\"" + this.value + "\"") + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		if(typeReq == expr_TypeReq.ReqString) {
			this.index = compiler.addString(this.value,true,this.tag);
			return 2;
		} else if(typeReq == expr_TypeReq.ReqNone) {
			return 0;
		}
		this.fVal = Compiler.stringToNumber(this.value);
		if(typeReq == expr_TypeReq.ReqFloat) {
			this.index = compiler.addFloat(this.fVal);
		}
		return 2;
	}
	compile(compiler,context,typeReq) {
		switch(typeReq._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 65;
			context.codeStream[context.ip++] = this.fVal;
			break;
		case 2:
			context.codeStream[context.ip++] = 66;
			context.codeStream[context.ip++] = this.index;
			break;
		case 3:
			context.codeStream[context.ip++] = this.tag ? 67 : 68;
			context.codeStream[context.ip++] = this.index;
			break;
		default:
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqString;
	}
	visitStmt(visitor) {
		visitor.visitStringConstExpr(this);
	}
}
expr_StringConstExpr.__name__ = true;
expr_StringConstExpr.__super__ = expr_Expr;
Object.assign(expr_StringConstExpr.prototype, {
	__class__: expr_StringConstExpr
});
class expr_ConstantExpr extends expr_Expr {
	constructor(name) {
		super(name.line);
		this.name = name;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.name.lexeme) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		if(typeReq == expr_TypeReq.ReqString) {
			compiler.precompileIdent(this.name.literal);
			return 2;
		} else if(typeReq == expr_TypeReq.ReqNone) {
			return 0;
		}
		this.fVal = Compiler.stringToNumber(this.name.literal);
		if(typeReq == expr_TypeReq.ReqFloat) {
			this.index = compiler.addFloat(this.fVal);
		}
		return 2;
	}
	compile(compiler,context,typeReq) {
		switch(typeReq._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 65;
			context.codeStream[context.ip++] = this.fVal;
			break;
		case 2:
			context.codeStream[context.ip++] = 66;
			context.codeStream[context.ip++] = this.index;
			break;
		case 3:
			context.codeStream[context.ip++] = 69;
			context.codeStream[context.ip] = compiler.compileIdent(this.name.literal,context.ip);
			context.ip++;
			break;
		default:
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqString;
	}
	visitStmt(visitor) {
		visitor.visitConstantExpr(this);
	}
}
expr_ConstantExpr.__name__ = true;
expr_ConstantExpr.__super__ = expr_Expr;
Object.assign(expr_ConstantExpr.prototype, {
	__class__: expr_ConstantExpr
});
class expr_AssignExpr extends expr_Expr {
	constructor(varExpr,expr) {
		super(varExpr.lineNo);
		this.varExpr = varExpr;
		this.expr = expr;
	}
	print(indent,isStmt) {
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.varExpr.print(indent,false) + " = " + this.expr.print(indent,false)) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		this.subType = this.expr.getPrefferredType();
		if(this.subType == expr_TypeReq.ReqNone) {
			this.subType = typeReq;
		}
		if(this.subType == expr_TypeReq.ReqNone) {
			this.subType = expr_TypeReq.ReqString;
		}
		let addSize = 0;
		if(typeReq != this.subType) {
			addSize = 1;
		}
		let retSize = this.expr.precompile(compiler,this.subType);
		compiler.precompileIdent((this.varExpr.type == expr_VarType.Global ? "$" : "%") + (this.varExpr.name.literal == null ? "null" : Std.string(this.varExpr.name.literal)));
		if(this.varExpr.arrayIndex != null) {
			if(this.subType == expr_TypeReq.ReqString) {
				return this.varExpr.arrayIndex.precompile(compiler,expr_TypeReq.ReqString) + retSize + addSize + 8;
			} else {
				return this.varExpr.arrayIndex.precompile(compiler,expr_TypeReq.ReqString) + retSize + addSize + 6;
			}
		} else {
			return retSize + addSize + 3;
		}
	}
	compile(compiler,context,typeReq) {
		context.ip = this.expr.compile(compiler,context,this.subType);
		if(this.varExpr.arrayIndex != null) {
			if(this.subType == expr_TypeReq.ReqString) {
				context.codeStream[context.ip++] = 73;
			}
			context.codeStream[context.ip++] = 69;
			context.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? "$" : "%") + (this.varExpr.name.literal == null ? "null" : Std.string(this.varExpr.name.literal)),context.ip);
			context.ip++;
			context.codeStream[context.ip++] = 73;
			context.ip = this.varExpr.arrayIndex.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 77;
			context.codeStream[context.ip++] = 39;
			if(this.subType == expr_TypeReq.ReqString) {
				context.codeStream[context.ip++] = 78;
			}
		} else {
			context.codeStream[context.ip++] = 37;
			context.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? "$" : "%") + (this.varExpr.name.literal == null ? "null" : Std.string(this.varExpr.name.literal)),context.ip);
			context.ip++;
		}
		switch(this.subType._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 43;
			break;
		case 2:
			context.codeStream[context.ip++] = 44;
			break;
		case 3:
			context.codeStream[context.ip++] = 45;
			break;
		default:
		}
		if(typeReq != this.subType) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(this.subType,typeReq);
		}
		return context.ip++;
	}
	getPrefferredType() {
		return this.expr.getPrefferredType();
	}
	visitStmt(visitor) {
		this.varExpr.visitStmt(visitor);
		this.expr.visitStmt(visitor);
		visitor.visitAssignExpr(this);
	}
}
expr_AssignExpr.__name__ = true;
expr_AssignExpr.__super__ = expr_Expr;
Object.assign(expr_AssignExpr.prototype, {
	__class__: expr_AssignExpr
});
class expr_AssignOpExpr extends expr_Expr {
	constructor(varExpr,expr,op) {
		super(varExpr.lineNo);
		this.varExpr = varExpr;
		this.expr = expr;
		this.op = op;
	}
	getAssignOpTypeOp() {
		switch(this.op.type._hx_index) {
		case 21:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 31;
			break;
		case 22:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 32;
			break;
		case 23:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 33;
			break;
		case 24:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 23;
			break;
		case 25:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 22;
			break;
		case 26:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 20;
			break;
		case 27:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 21;
			break;
		case 28:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 34;
			break;
		case 29:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 28;
			break;
		case 30:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 27;
			break;
		case 76:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 31;
			this.expr = new expr_IntExpr(this.lineNo,1);
			break;
		case 77:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 32;
			this.expr = new expr_IntExpr(this.lineNo,1);
			break;
		default:
			throw new haxe_Exception("Unknown assignment expression");
		}
	}
	print(indent,isStmt) {
		if(this.op.type == TokenType.PlusPlus || this.op.type == TokenType.MinusMinus) {
			return (isStmt ? this.printIndent(indent) : "") + ("" + this.varExpr.print(indent,false) + this.op.lexeme) + (isStmt ? ";\n" : "");
		}
		return (isStmt ? this.printIndent(indent) : "") + ("" + this.varExpr.print(indent,false) + " " + this.op.lexeme + "= " + this.expr.print(indent,false)) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		this.getAssignOpTypeOp();
		compiler.precompileIdent((this.varExpr.type == expr_VarType.Global ? "$" : "%") + (this.varExpr.name.literal == null ? "null" : Std.string(this.varExpr.name.literal)));
		let size = this.expr.precompile(compiler,this.subType);
		if(typeReq != this.subType) {
			++size;
		}
		if(this.varExpr.arrayIndex == null) {
			return size + 5;
		} else {
			size += this.varExpr.arrayIndex.precompile(compiler,expr_TypeReq.ReqString);
			return size + 8;
		}
	}
	compile(compiler,context,typeReq) {
		context.ip = this.expr.compile(compiler,context,this.subType);
		if(this.varExpr.arrayIndex == null) {
			context.codeStream[context.ip++] = 37;
			context.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? "$" : "%") + (this.varExpr.name.literal == null ? "null" : Std.string(this.varExpr.name.literal)),context.ip);
			context.ip++;
		} else {
			context.codeStream[context.ip++] = 69;
			context.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? "$" : "%") + (this.varExpr.name.literal == null ? "null" : Std.string(this.varExpr.name.literal)),context.ip);
			context.ip++;
			context.codeStream[context.ip++] = 73;
			context.ip = this.varExpr.arrayIndex.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 77;
			context.codeStream[context.ip++] = 39;
		}
		context.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 41 : 40;
		context.codeStream[context.ip++] = this.operand;
		context.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 44 : 43;
		if(typeReq != this.subType) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(this.subType,typeReq);
		}
		return context.ip;
	}
	getPrefferredType() {
		this.getAssignOpTypeOp();
		return this.subType;
	}
	visitStmt(visitor) {
		this.getAssignOpTypeOp();
		this.varExpr.visitStmt(visitor);
		this.expr.visitStmt(visitor);
		visitor.visitAssignOpExpr(this);
	}
}
expr_AssignOpExpr.__name__ = true;
expr_AssignOpExpr.__super__ = expr_Expr;
Object.assign(expr_AssignOpExpr.prototype, {
	__class__: expr_AssignOpExpr
});
class expr_FuncCallExpr extends expr_Expr {
	constructor(name,namespace,args,callType) {
		super(name.line);
		this.name = name;
		this.namespace = namespace;
		this.args = args;
		this.callType = callType;
	}
	print(indent,isStmt) {
		if(this.callType == 0) {
			let str = isStmt ? this.printIndent(indent) : "";
			if(this.namespace != null) {
				str += this.namespace.lexeme + "::";
			}
			str += this.name.lexeme + "(";
			let _g = 0;
			let _g1 = this.args.length;
			while(_g < _g1) {
				let i = _g++;
				if(i > 0) {
					str += ", ";
				}
				str += this.args[i].print(indent,false);
			}
			str += ")";
			return str + (isStmt ? ";\n" : "");
		} else if(this.callType == 1) {
			let str = isStmt ? this.printIndent(indent) : "";
			str += this.args[0].print(indent,false);
			str += "." + this.name.lexeme + "(";
			let _g = 1;
			let _g1 = this.args.length;
			while(_g < _g1) {
				let i = _g++;
				if(i > 1) {
					str += ", ";
				}
				str += this.args[i].print(indent,false);
			}
			str += ")";
			return str + (isStmt ? ";\n" : "");
		} else {
			let str = isStmt ? this.printIndent(indent) : "";
			str += "Parent::";
			str += this.name.lexeme + "(";
			let _g = 0;
			let _g1 = this.args.length;
			while(_g < _g1) {
				let i = _g++;
				if(i > 0) {
					str += ", ";
				}
				str += this.args[i].print(indent,false);
			}
			str += ")";
			return str + (isStmt ? ";\n" : "");
		}
	}
	precompile(compiler,typeReq) {
		let size = 0;
		if(typeReq != expr_TypeReq.ReqString) {
			++size;
		}
		compiler.precompileIdent(this.name.literal);
		compiler.precompileIdent(this.namespace != null ? this.namespace.literal : null);
		let _g = 0;
		let _g1 = this.args.length;
		while(_g < _g1) {
			let i = _g++;
			size += this.args[i].precompile(compiler,expr_TypeReq.ReqString) + 1;
		}
		return size + 5;
	}
	compile(compiler,context,typeReq) {
		context.codeStream[context.ip++] = 81;
		let _g = 0;
		let _g1 = this.args;
		while(_g < _g1.length) {
			let expr = _g1[_g];
			++_g;
			context.ip = expr.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 80;
		}
		if(this.callType == 1 || this.callType == 2) {
			context.codeStream[context.ip++] = 71;
		} else {
			context.codeStream[context.ip++] = 70;
		}
		context.codeStream[context.ip] = compiler.compileIdent(this.name.literal,context.ip);
		context.ip++;
		context.codeStream[context.ip] = compiler.compileIdent(this.namespace != null ? this.namespace.literal : null,context.ip);
		context.ip++;
		context.codeStream[context.ip++] = this.callType;
		if(typeReq != expr_TypeReq.ReqString) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqString,typeReq);
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqString;
	}
	visitStmt(optimizerPass) {
		let _g = 0;
		let _g1 = this.args.length;
		while(_g < _g1) {
			let i = _g++;
			this.args[i].visitStmt(optimizerPass);
		}
		optimizerPass.visitFuncCallExpr(this);
	}
}
expr_FuncCallExpr.__name__ = true;
expr_FuncCallExpr.__super__ = expr_Expr;
Object.assign(expr_FuncCallExpr.prototype, {
	__class__: expr_FuncCallExpr
});
class expr_SlotAccessExpr extends expr_Expr {
	constructor(objectExpr,arrayExpr,slotName) {
		super(objectExpr.lineNo);
		this.objectExpr = objectExpr;
		this.arrayExpr = arrayExpr;
		this.slotName = slotName;
	}
	print(indent,isStmt) {
		let str = (isStmt ? this.printIndent(indent) : "") + this.objectExpr.print(indent,false) + "." + this.slotName.lexeme;
		if(this.arrayExpr != null) {
			str += "[" + this.arrayExpr.print(indent,false) + "]";
		}
		return str + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		if(typeReq == expr_TypeReq.ReqNone) {
			return 0;
		}
		let size = 0;
		compiler.precompileIdent(this.slotName.literal);
		if(this.arrayExpr != null) {
			size += 3 + this.arrayExpr.precompile(compiler,expr_TypeReq.ReqString);
		}
		size += this.objectExpr.precompile(compiler,expr_TypeReq.ReqString) + 3;
		return size + 1;
	}
	compile(compiler,context,typeReq) {
		if(typeReq == expr_TypeReq.ReqNone) {
			return context.ip;
		}
		if(this.arrayExpr != null) {
			context.ip = this.arrayExpr.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 73;
		}
		context.ip = this.objectExpr.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 46;
		context.codeStream[context.ip++] = 48;
		context.codeStream[context.ip] = compiler.compileIdent(this.slotName.literal,context.ip);
		context.ip++;
		if(this.arrayExpr != null) {
			context.codeStream[context.ip++] = 78;
			context.codeStream[context.ip++] = 49;
		}
		switch(typeReq._hx_index) {
		case 1:
			context.codeStream[context.ip++] = 50;
			break;
		case 2:
			context.codeStream[context.ip++] = 51;
			break;
		case 3:
			context.codeStream[context.ip++] = 52;
			break;
		default:
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqNone;
	}
	visitStmt(optimizerPass) {
		this.objectExpr.visitStmt(optimizerPass);
		if(this.arrayExpr != null) {
			this.arrayExpr.visitStmt(optimizerPass);
		}
		optimizerPass.visitSlotAccessExpr(this);
	}
}
expr_SlotAccessExpr.__name__ = true;
expr_SlotAccessExpr.__super__ = expr_Expr;
Object.assign(expr_SlotAccessExpr.prototype, {
	__class__: expr_SlotAccessExpr
});
class expr_SlotAssignExpr extends expr_Expr {
	constructor(objectExpr,arrayExpr,slotName,expr) {
		super(slotName.line);
		this.objectExpr = objectExpr;
		this.arrayExpr = arrayExpr;
		this.slotName = slotName;
		this.expr = expr;
	}
	print(indent,isStmt) {
		let str = (isStmt ? this.printIndent(indent) : "") + (this.objectExpr != null ? this.objectExpr.print(indent,false) + "." : "") + this.slotName.lexeme;
		if(this.arrayExpr != null) {
			str += "[" + this.arrayExpr.print(indent,false) + "]";
		}
		return str + " = " + this.expr.print(indent,false) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		let size = 0;
		if(typeReq != expr_TypeReq.ReqString) {
			++size;
		}
		compiler.precompileIdent(this.slotName.literal);
		size += this.expr.precompile(compiler,expr_TypeReq.ReqString);
		if(this.objectExpr != null) {
			size += this.objectExpr.precompile(compiler,expr_TypeReq.ReqString) + 5;
		} else {
			size += 5;
		}
		if(this.arrayExpr != null) {
			size += this.arrayExpr.precompile(compiler,expr_TypeReq.ReqString) + 3;
		}
		return size + 1;
	}
	compile(compiler,context,typeReq) {
		context.ip = this.expr.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 73;
		if(this.arrayExpr != null) {
			context.ip = this.arrayExpr.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 73;
		}
		if(this.objectExpr != null) {
			context.ip = this.objectExpr.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 46;
		} else {
			context.codeStream[context.ip++] = 47;
		}
		context.codeStream[context.ip++] = 48;
		context.codeStream[context.ip] = compiler.compileIdent(this.slotName.literal,context.ip);
		context.ip++;
		if(this.arrayExpr != null) {
			context.codeStream[context.ip++] = 78;
			context.codeStream[context.ip++] = 49;
		}
		context.codeStream[context.ip++] = 78;
		context.codeStream[context.ip++] = 55;
		if(typeReq != expr_TypeReq.ReqString) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqString,typeReq);
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqString;
	}
	visitStmt(optimizerPass) {
		if(this.objectExpr != null) {
			this.objectExpr.visitStmt(optimizerPass);
		}
		if(this.arrayExpr != null) {
			this.arrayExpr.visitStmt(optimizerPass);
		}
		this.expr.visitStmt(optimizerPass);
		optimizerPass.visitSlotAssignExpr(this);
	}
}
expr_SlotAssignExpr.__name__ = true;
expr_SlotAssignExpr.__super__ = expr_Expr;
Object.assign(expr_SlotAssignExpr.prototype, {
	__class__: expr_SlotAssignExpr
});
class expr_SlotAssignOpExpr extends expr_Expr {
	constructor(objectExpr,arrayExpr,slotName,expr,op) {
		super(objectExpr.lineNo);
		this.objectExpr = objectExpr;
		this.arrayExpr = arrayExpr;
		this.slotName = slotName;
		this.expr = expr;
		this.op = op;
	}
	getAssignOpTypeOp() {
		switch(this.op.type._hx_index) {
		case 21:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 31;
			break;
		case 22:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 32;
			break;
		case 23:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 33;
			break;
		case 24:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 23;
			break;
		case 25:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 22;
			break;
		case 26:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 20;
			break;
		case 27:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 21;
			break;
		case 28:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 34;
			break;
		case 29:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 28;
			break;
		case 30:
			this.subType = expr_TypeReq.ReqInt;
			this.operand = 27;
			break;
		case 76:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 31;
			this.expr = new expr_IntExpr(this.lineNo,1);
			break;
		case 77:
			this.subType = expr_TypeReq.ReqFloat;
			this.operand = 32;
			this.expr = new expr_IntExpr(this.lineNo,1);
			break;
		default:
			throw new haxe_Exception("Unknown assignment expression");
		}
	}
	print(indent,isStmt) {
		let str = (isStmt ? this.printIndent(indent) : "") + this.objectExpr.print(indent,false) + "." + this.slotName.lexeme;
		if(this.arrayExpr != null) {
			str += "[" + this.arrayExpr.print(indent,false) + "]";
		}
		if(this.op.type == TokenType.PlusPlus || this.op.type == TokenType.MinusMinus) {
			return str + ("" + this.op.lexeme) + (isStmt ? ";\n" : "");
		}
		return str + (" " + this.op.lexeme + "= ") + this.expr.print(indent,false) + (isStmt ? ";\n" : "");
	}
	precompile(compiler,typeReq) {
		this.getAssignOpTypeOp();
		compiler.precompileIdent(this.slotName.literal);
		let size = this.expr.precompile(compiler,this.subType);
		if(typeReq != this.subType) {
			++size;
		}
		if(this.arrayExpr != null) {
			return size + 9 + this.arrayExpr.precompile(compiler,expr_TypeReq.ReqString) + this.objectExpr.precompile(compiler,expr_TypeReq.ReqString);
		} else {
			return size + 6 + this.objectExpr.precompile(compiler,expr_TypeReq.ReqString);
		}
	}
	compile(compiler,context,typeReq) {
		context.ip = this.expr.compile(compiler,context,this.subType);
		if(this.arrayExpr != null) {
			context.ip = this.arrayExpr.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 73;
		}
		context.ip = this.objectExpr.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 46;
		context.codeStream[context.ip++] = 48;
		context.codeStream[context.ip] = compiler.compileIdent(this.slotName.literal,context.ip);
		context.ip++;
		if(this.arrayExpr != null) {
			context.codeStream[context.ip++] = 78;
			context.codeStream[context.ip++] = 49;
		}
		context.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 51 : 50;
		context.codeStream[context.ip++] = this.operand;
		context.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 54 : 53;
		if(typeReq != this.subType) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(this.subType,typeReq);
		}
		return context.ip;
	}
	getPrefferredType() {
		this.getAssignOpTypeOp();
		return this.subType;
	}
	visitStmt(optimizerPass) {
		this.getAssignOpTypeOp();
		if(this.objectExpr != null) {
			this.objectExpr.visitStmt(optimizerPass);
		}
		if(this.arrayExpr != null) {
			this.arrayExpr.visitStmt(optimizerPass);
		}
		this.expr.visitStmt(optimizerPass);
		optimizerPass.visitSlotAssignOpExpr(this);
	}
}
expr_SlotAssignOpExpr.__name__ = true;
expr_SlotAssignOpExpr.__super__ = expr_Expr;
Object.assign(expr_SlotAssignOpExpr.prototype, {
	__class__: expr_SlotAssignOpExpr
});
class expr_ObjectDeclExpr extends expr_Expr {
	constructor(className,parentObject,objectNameExpr,args,slotDecls,subObjects,structDecl) {
		expr_Stmt._hx_skip_constructor = true;
		super();
		expr_Stmt._hx_skip_constructor = false;
		this._hx_constructor(className,parentObject,objectNameExpr,args,slotDecls,subObjects,structDecl);
	}
	_hx_constructor(className,parentObject,objectNameExpr,args,slotDecls,subObjects,structDecl) {
		this.structDecl = false;
		super._hx_constructor(className.lineNo);
		this.className = className;
		this.parentObject = parentObject;
		this.objectNameExpr = objectNameExpr != null ? objectNameExpr : new expr_StringConstExpr(this.lineNo,"",false);
		this.args = args;
		this.slotDecls = slotDecls;
		this.subObjects = subObjects;
		this.structDecl = structDecl;
	}
	print(indent,isStmt) {
		let objStr = (isStmt ? this.printIndent(indent) : "") + (this.structDecl ? "datablock " : "new ");
		objStr += this.className.print(indent,false) + "(";
		if(this.objectNameExpr != null) {
			objStr += this.objectNameExpr.print(indent,false);
		}
		if(this.parentObject != null) {
			objStr += " : " + this.parentObject.lexeme;
		}
		if(this.args.length > 0) {
			objStr += ",";
			let _g = 0;
			let _g1 = this.args.length;
			while(_g < _g1) {
				let i = _g++;
				objStr += this.args[i].print(indent,false);
				if(i < this.args.length - 1) {
					objStr += ",";
				}
			}
		}
		objStr += ")";
		if(this.slotDecls.length != 0 || this.subObjects.length != 0) {
			objStr += " {\n";
		}
		let _g = 0;
		let _g1 = this.slotDecls.length;
		while(_g < _g1) {
			let i = _g++;
			objStr += this.slotDecls[i].print(indent + 1,true);
		}
		let _g2 = 0;
		let _g3 = this.subObjects.length;
		while(_g2 < _g3) {
			let i = _g2++;
			objStr += this.subObjects[i].print(indent + 1,true);
		}
		if(this.slotDecls.length != 0 || this.subObjects.length != 0) {
			objStr += this.printIndent(indent) + "}\n";
		}
		return objStr + (isStmt ? ";\n" : "");
	}
	precompileSubObject(compiler,typeReq) {
		let argSize = 0;
		compiler.precompileIdent(this.parentObject == null ? null : this.parentObject.literal);
		let _g = 0;
		let _g1 = this.args;
		while(_g < _g1.length) {
			let expr = _g1[_g];
			++_g;
			argSize += expr.precompile(compiler,expr_TypeReq.ReqString) + 1;
		}
		argSize += this.className.precompile(compiler,expr_TypeReq.ReqString) + 1;
		let nameSize = this.objectNameExpr.precompile(compiler,expr_TypeReq.ReqString);
		let slotSize = 0;
		let _g2 = 0;
		let _g3 = this.slotDecls;
		while(_g2 < _g3.length) {
			let slot = _g3[_g2];
			++_g2;
			slotSize += slot.precompile(compiler,expr_TypeReq.ReqNone);
		}
		let subObjSize = 0;
		let _g4 = 0;
		let _g5 = this.subObjects;
		while(_g4 < _g5.length) {
			let subObj = _g5[_g4];
			++_g4;
			subObjSize += subObj.precompileSubObject(compiler,expr_TypeReq.ReqNone);
		}
		this.failOffset = 10 + nameSize + argSize + slotSize + subObjSize;
		return this.failOffset;
	}
	compileSubObject(compiler,context,typeReq,root) {
		let start = context.ip;
		context.codeStream[context.ip++] = 81;
		context.ip = this.className.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 80;
		context.ip = this.objectNameExpr.compile(compiler,context,expr_TypeReq.ReqString);
		context.codeStream[context.ip++] = 80;
		let _g = 0;
		let _g1 = this.args;
		while(_g < _g1.length) {
			let expr = _g1[_g];
			++_g;
			context.ip = expr.compile(compiler,context,expr_TypeReq.ReqString);
			context.codeStream[context.ip++] = 80;
		}
		context.codeStream[context.ip++] = 1;
		context.codeStream[context.ip] = compiler.compileIdent(this.parentObject != null ? this.parentObject.literal : null,context.ip);
		context.ip++;
		context.codeStream[context.ip++] = this.structDecl ? 1 : 0;
		context.codeStream[context.ip++] = start + this.failOffset;
		let _g2 = 0;
		let _g3 = this.slotDecls;
		while(_g2 < _g3.length) {
			let slot = _g3[_g2];
			++_g2;
			context.ip = slot.compile(compiler,context,expr_TypeReq.ReqNone);
		}
		context.codeStream[context.ip++] = 4;
		context.codeStream[context.ip++] = root ? 1 : 0;
		let _g4 = 0;
		let _g5 = this.subObjects;
		while(_g4 < _g5.length) {
			let subObj = _g5[_g4];
			++_g4;
			context.ip = subObj.compileSubObject(compiler,context,expr_TypeReq.ReqNone,false);
		}
		context.codeStream[context.ip++] = 5;
		context.codeStream[context.ip++] = root || this.structDecl ? 1 : 0;
		return context.ip;
	}
	precompile(compiler,typeReq) {
		let ret = 2 + this.precompileSubObject(compiler,expr_TypeReq.ReqNone);
		if(typeReq != expr_TypeReq.ReqInt) {
			return ret + 1;
		}
		return ret;
	}
	compile(compiler,context,typeReq) {
		context.codeStream[context.ip++] = 65;
		context.codeStream[context.ip++] = 0;
		context.ip = this.compileSubObject(compiler,context,expr_TypeReq.ReqInt,true);
		if(typeReq != expr_TypeReq.ReqInt) {
			context.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);
		}
		return context.ip;
	}
	getPrefferredType() {
		return expr_TypeReq.ReqInt;
	}
	visitStmt(optimizerPass) {
		this.className.visitStmt(optimizerPass);
		this.objectNameExpr.visitStmt(optimizerPass);
		let _g = 0;
		let _g1 = this.args;
		while(_g < _g1.length) {
			let arg = _g1[_g];
			++_g;
			arg.visitStmt(optimizerPass);
		}
		let _g2 = 0;
		let _g3 = this.slotDecls;
		while(_g2 < _g3.length) {
			let slot = _g3[_g2];
			++_g2;
			slot.visitStmt(optimizerPass);
		}
		let _g4 = 0;
		let _g5 = this.subObjects;
		while(_g4 < _g5.length) {
			let subObj = _g5[_g4];
			++_g4;
			subObj.visitStmt(optimizerPass);
		}
		optimizerPass.visitObjectDeclExpr(this);
	}
}
expr_ObjectDeclExpr.__name__ = true;
expr_ObjectDeclExpr.__super__ = expr_Expr;
Object.assign(expr_ObjectDeclExpr.prototype, {
	__class__: expr_ObjectDeclExpr
});
class expr_FunctionDeclStmt extends expr_Stmt {
	constructor(functionName,args,stmts,namespace) {
		super(functionName.line);
		this.functionName = functionName;
		this.args = args;
		this.stmts = stmts;
		this.namespace = namespace;
	}
	print(indent,isStmt) {
		let fnBegin = this.printIndent(indent) + "function ";
		if(this.namespace != null) {
			fnBegin += this.namespace.lexeme + "::";
		}
		fnBegin += this.functionName.lexeme + "(";
		let _g = 0;
		let _g1 = this.args.length;
		while(_g < _g1) {
			let i = _g++;
			if(i > 0) {
				fnBegin += ", ";
			}
			fnBegin += this.args[i].print(indent,false);
		}
		fnBegin += ") {\n";
		fnBegin += expr_Stmt.printBlock(this.stmts,indent + 1);
		fnBegin += this.printIndent(indent) + "}\n";
		return fnBegin;
	}
	precompileStmt(compiler,loopCount) {
		compiler.setTable(ConstTable.StringTable,ConstTableType.Function);
		compiler.setTable(ConstTable.FloatTable,ConstTableType.Function);
		this.argc = this.args.length;
		compiler.inFunction = true;
		compiler.precompileIdent(this.functionName.literal);
		compiler.precompileIdent(this.namespace != null ? this.namespace.literal : null);
		compiler.precompileIdent(this.packageName != null ? this.packageName.literal : null);
		let subSize = expr_Stmt.precompileBlock(compiler,this.stmts,0);
		compiler.inFunction = false;
		compiler.setTable(ConstTable.StringTable,ConstTableType.Global);
		compiler.setTable(ConstTable.FloatTable,ConstTableType.Global);
		this.endOffset = this.argc + subSize + 8;
		return this.endOffset;
	}
	compileStmt(compiler,context) {
		let start = context.ip;
		context.codeStream[context.ip++] = 0;
		context.codeStream[context.ip] = compiler.compileIdent(this.functionName.literal,context.ip);
		context.ip++;
		context.codeStream[context.ip] = compiler.compileIdent(this.namespace != null ? this.namespace.literal : null,context.ip);
		context.ip++;
		context.codeStream[context.ip] = compiler.compileIdent(this.packageName != null ? this.packageName.literal : null,context.ip);
		context.ip++;
		context.codeStream[context.ip++] = this.stmts.length != 0 ? 1 : 0;
		context.codeStream[context.ip++] = start + this.endOffset;
		context.codeStream[context.ip++] = this.argc;
		let _g = 0;
		let _g1 = this.args;
		while(_g < _g1.length) {
			let arg = _g1[_g];
			++_g;
			context.codeStream[context.ip] = compiler.compileIdent((arg.type == expr_VarType.Global ? "$" : "%") + (arg.name.literal == null ? "null" : Std.string(arg.name.literal)),context.ip);
			context.ip++;
		}
		compiler.inFunction = true;
		let bp = context.breakPoint;
		let cp = context.continuePoint;
		context.breakPoint = 0;
		context.continuePoint = 0;
		context.ip = expr_Stmt.compileBlock(compiler,context,this.stmts);
		context.breakPoint = bp;
		context.continuePoint = cp;
		compiler.inFunction = false;
		context.codeStream[context.ip++] = 13;
		return context.ip;
	}
	visitStmt(optimizerPass) {
		optimizerPass.visitFunctionDeclStmt(this);
		let _g = 0;
		let _g1 = this.args;
		while(_g < _g1.length) {
			let arg = _g1[_g];
			++_g;
			arg.visitStmt(optimizerPass);
		}
		let _g2 = 0;
		let _g3 = this.stmts;
		while(_g2 < _g3.length) {
			let stmt = _g3[_g2];
			++_g2;
			stmt.visitStmt(optimizerPass);
		}
	}
}
expr_FunctionDeclStmt.__name__ = true;
expr_FunctionDeclStmt.__super__ = expr_Stmt;
Object.assign(expr_FunctionDeclStmt.prototype, {
	__class__: expr_FunctionDeclStmt
});
class haxe_IMap {
}
haxe_IMap.__name__ = true;
haxe_IMap.__isInterface__ = true;
Object.assign(haxe_IMap.prototype, {
	__class__: haxe_IMap
});
class haxe_EntryPoint {
	static processEvents() {
		while(true) {
			let f = haxe_EntryPoint.pending.shift();
			if(f == null) {
				break;
			}
			f();
		}
		let time = haxe_MainLoop.tick();
		if(!haxe_MainLoop.hasEvents() && haxe_EntryPoint.threadCount == 0) {
			return -1;
		}
		return time;
	}
	static run() {
		let nextTick = haxe_EntryPoint.processEvents();
		if(typeof(window) != "undefined") {
			let $window = window;
			let rqf = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame;
			if(rqf != null) {
				rqf(haxe_EntryPoint.run);
			} else if(nextTick >= 0) {
				setTimeout(haxe_EntryPoint.run,nextTick * 1000);
			}
		} else if(nextTick >= 0) {
			setTimeout(haxe_EntryPoint.run,nextTick * 1000);
		}
	}
}
haxe_EntryPoint.__name__ = true;
class haxe_MainEvent {
	constructor(f,p) {
		this.isBlocking = true;
		this.f = f;
		this.priority = p;
		this.nextRun = -Infinity;
	}
}
haxe_MainEvent.__name__ = true;
Object.assign(haxe_MainEvent.prototype, {
	__class__: haxe_MainEvent
});
class haxe_MainLoop {
	static hasEvents() {
		let p = haxe_MainLoop.pending;
		while(p != null) {
			if(p.isBlocking) {
				return true;
			}
			p = p.next;
		}
		return false;
	}
	static sortEvents() {
		let list = haxe_MainLoop.pending;
		if(list == null) {
			return;
		}
		let insize = 1;
		let nmerges;
		let psize = 0;
		let qsize = 0;
		let p;
		let q;
		let e;
		let tail;
		while(true) {
			p = list;
			list = null;
			tail = null;
			nmerges = 0;
			while(p != null) {
				++nmerges;
				q = p;
				psize = 0;
				let _g = 0;
				let _g1 = insize;
				while(_g < _g1) {
					let i = _g++;
					++psize;
					q = q.next;
					if(q == null) {
						break;
					}
				}
				qsize = insize;
				while(psize > 0 || qsize > 0 && q != null) {
					if(psize == 0) {
						e = q;
						q = q.next;
						--qsize;
					} else if(qsize == 0 || q == null || (p.priority > q.priority || p.priority == q.priority && p.nextRun <= q.nextRun)) {
						e = p;
						p = p.next;
						--psize;
					} else {
						e = q;
						q = q.next;
						--qsize;
					}
					if(tail != null) {
						tail.next = e;
					} else {
						list = e;
					}
					e.prev = tail;
					tail = e;
				}
				p = q;
			}
			tail.next = null;
			if(nmerges <= 1) {
				break;
			}
			insize *= 2;
		}
		list.prev = null;
		haxe_MainLoop.pending = list;
	}
	static tick() {
		haxe_MainLoop.sortEvents();
		let e = haxe_MainLoop.pending;
		let now = HxOverrides.now() / 1000;
		let wait = 1e9;
		while(e != null) {
			let next = e.next;
			let wt = e.nextRun - now;
			if(wt <= 0) {
				wait = 0;
				if(e.f != null) {
					e.f();
				}
			} else if(wait > wt) {
				wait = wt;
			}
			e = next;
		}
		return wait;
	}
}
haxe_MainLoop.__name__ = true;
class haxe_ValueException extends haxe_Exception {
	constructor(value,previous,native) {
		super(String(value),previous,native);
		this.value = value;
	}
}
haxe_ValueException.__name__ = true;
haxe_ValueException.__super__ = haxe_Exception;
Object.assign(haxe_ValueException.prototype, {
	__class__: haxe_ValueException
});
class haxe_ds_BalancedTree {
	constructor() {
	}
	set(key,value) {
		this.root = this.setLoop(key,value,this.root);
	}
	get(key) {
		let node = this.root;
		while(node != null) {
			let c = this.compare(key,node.key);
			if(c == 0) {
				return node.value;
			}
			if(c < 0) {
				node = node.left;
			} else {
				node = node.right;
			}
		}
		return null;
	}
	keys() {
		let ret = [];
		this.keysLoop(this.root,ret);
		return new haxe_iterators_ArrayIterator(ret);
	}
	setLoop(k,v,node) {
		if(node == null) {
			return new haxe_ds_TreeNode(null,k,v,null);
		}
		let c = this.compare(k,node.key);
		if(c == 0) {
			return new haxe_ds_TreeNode(node.left,k,v,node.right,node == null ? 0 : node._height);
		} else if(c < 0) {
			let nl = this.setLoop(k,v,node.left);
			return this.balance(nl,node.key,node.value,node.right);
		} else {
			let nr = this.setLoop(k,v,node.right);
			return this.balance(node.left,node.key,node.value,nr);
		}
	}
	keysLoop(node,acc) {
		if(node != null) {
			this.keysLoop(node.left,acc);
			acc.push(node.key);
			this.keysLoop(node.right,acc);
		}
	}
	balance(l,k,v,r) {
		let hl = l == null ? 0 : l._height;
		let hr = r == null ? 0 : r._height;
		if(hl > hr + 2) {
			let _this = l.left;
			let _this1 = l.right;
			if((_this == null ? 0 : _this._height) >= (_this1 == null ? 0 : _this1._height)) {
				return new haxe_ds_TreeNode(l.left,l.key,l.value,new haxe_ds_TreeNode(l.right,k,v,r));
			} else {
				return new haxe_ds_TreeNode(new haxe_ds_TreeNode(l.left,l.key,l.value,l.right.left),l.right.key,l.right.value,new haxe_ds_TreeNode(l.right.right,k,v,r));
			}
		} else if(hr > hl + 2) {
			let _this = r.right;
			let _this1 = r.left;
			if((_this == null ? 0 : _this._height) > (_this1 == null ? 0 : _this1._height)) {
				return new haxe_ds_TreeNode(new haxe_ds_TreeNode(l,k,v,r.left),r.key,r.value,r.right);
			} else {
				return new haxe_ds_TreeNode(new haxe_ds_TreeNode(l,k,v,r.left.left),r.left.key,r.left.value,new haxe_ds_TreeNode(r.left.right,r.key,r.value,r.right));
			}
		} else {
			return new haxe_ds_TreeNode(l,k,v,r,(hl > hr ? hl : hr) + 1);
		}
	}
	compare(k1,k2) {
		return Reflect.compare(k1,k2);
	}
}
haxe_ds_BalancedTree.__name__ = true;
haxe_ds_BalancedTree.__interfaces__ = [haxe_IMap];
Object.assign(haxe_ds_BalancedTree.prototype, {
	__class__: haxe_ds_BalancedTree
});
class haxe_ds_TreeNode {
	constructor(l,k,v,r,h) {
		if(h == null) {
			h = -1;
		}
		this.left = l;
		this.key = k;
		this.value = v;
		this.right = r;
		if(h == -1) {
			let tmp;
			let _this = this.left;
			let _this1 = this.right;
			if((_this == null ? 0 : _this._height) > (_this1 == null ? 0 : _this1._height)) {
				let _this = this.left;
				tmp = _this == null ? 0 : _this._height;
			} else {
				let _this = this.right;
				tmp = _this == null ? 0 : _this._height;
			}
			this._height = tmp + 1;
		} else {
			this._height = h;
		}
	}
}
haxe_ds_TreeNode.__name__ = true;
Object.assign(haxe_ds_TreeNode.prototype, {
	__class__: haxe_ds_TreeNode
});
class haxe_ds_EnumValueMap extends haxe_ds_BalancedTree {
	constructor() {
		super();
	}
	compare(k1,k2) {
		let d = k1._hx_index - k2._hx_index;
		if(d != 0) {
			return d;
		}
		let p1 = Type.enumParameters(k1);
		let p2 = Type.enumParameters(k2);
		if(p1.length == 0 && p2.length == 0) {
			return 0;
		}
		return this.compareArgs(p1,p2);
	}
	compareArgs(a1,a2) {
		let ld = a1.length - a2.length;
		if(ld != 0) {
			return ld;
		}
		let _g = 0;
		let _g1 = a1.length;
		while(_g < _g1) {
			let i = _g++;
			let d = this.compareArg(a1[i],a2[i]);
			if(d != 0) {
				return d;
			}
		}
		return 0;
	}
	compareArg(v1,v2) {
		if(Reflect.isEnumValue(v1) && Reflect.isEnumValue(v2)) {
			return this.compare(v1,v2);
		} else if(((v1) instanceof Array) && ((v2) instanceof Array)) {
			return this.compareArgs(v1,v2);
		} else {
			return Reflect.compare(v1,v2);
		}
	}
}
haxe_ds_EnumValueMap.__name__ = true;
haxe_ds_EnumValueMap.__interfaces__ = [haxe_IMap];
haxe_ds_EnumValueMap.__super__ = haxe_ds_BalancedTree;
Object.assign(haxe_ds_EnumValueMap.prototype, {
	__class__: haxe_ds_EnumValueMap
});
class haxe_ds_GenericCell {
	constructor(elt,next) {
		this.elt = elt;
		this.next = next;
	}
}
haxe_ds_GenericCell.__name__ = true;
Object.assign(haxe_ds_GenericCell.prototype, {
	__class__: haxe_ds_GenericCell
});
class haxe_ds_GenericStack {
	constructor() {
	}
}
haxe_ds_GenericStack.__name__ = true;
Object.assign(haxe_ds_GenericStack.prototype, {
	__class__: haxe_ds_GenericStack
});
class haxe_ds_IntMap {
	constructor() {
		this.h = { };
	}
	get(key) {
		return this.h[key];
	}
	remove(key) {
		if(!this.h.hasOwnProperty(key)) {
			return false;
		}
		delete(this.h[key]);
		return true;
	}
	keys() {
		let a = [];
		for( var key in this.h ) if(this.h.hasOwnProperty(key)) a.push(+key);
		return new haxe_iterators_ArrayIterator(a);
	}
	iterator() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			let i = this.it.next();
			return this.ref[i];
		}};
	}
}
haxe_ds_IntMap.__name__ = true;
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
Object.assign(haxe_ds_IntMap.prototype, {
	__class__: haxe_ds_IntMap
});
class haxe_ds_ObjectMap {
	constructor() {
		this.h = { __keys__ : { }};
	}
	set(key,value) {
		let id = key.__id__;
		if(id == null) {
			id = (key.__id__ = $global.$haxeUID++);
		}
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	get(key) {
		return this.h[key.__id__];
	}
	keys() {
		let a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) {
			a.push(this.h.__keys__[key]);
		}
		}
		return new haxe_iterators_ArrayIterator(a);
	}
}
haxe_ds_ObjectMap.__name__ = true;
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
Object.assign(haxe_ds_ObjectMap.prototype, {
	__class__: haxe_ds_ObjectMap
});
class haxe_ds_StringMap {
	constructor() {
		this.h = Object.create(null);
	}
	get(key) {
		return this.h[key];
	}
	keys() {
		return new haxe_ds__$StringMap_StringMapKeyIterator(this.h);
	}
}
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
Object.assign(haxe_ds_StringMap.prototype, {
	__class__: haxe_ds_StringMap
});
class haxe_ds__$StringMap_StringMapKeyIterator {
	constructor(h) {
		this.h = h;
		this.keys = Object.keys(h);
		this.length = this.keys.length;
		this.current = 0;
	}
	hasNext() {
		return this.current < this.length;
	}
	next() {
		return this.keys[this.current++];
	}
}
haxe_ds__$StringMap_StringMapKeyIterator.__name__ = true;
Object.assign(haxe_ds__$StringMap_StringMapKeyIterator.prototype, {
	__class__: haxe_ds__$StringMap_StringMapKeyIterator
});
class haxe_exceptions_PosException extends haxe_Exception {
	constructor(message,previous,pos) {
		super(message,previous);
		if(pos == null) {
			this.posInfos = { fileName : "(unknown)", lineNumber : 0, className : "(unknown)", methodName : "(unknown)"};
		} else {
			this.posInfos = pos;
		}
	}
	toString() {
		return "" + super.toString() + " in " + this.posInfos.className + "." + this.posInfos.methodName + " at " + this.posInfos.fileName + ":" + this.posInfos.lineNumber;
	}
}
haxe_exceptions_PosException.__name__ = true;
haxe_exceptions_PosException.__super__ = haxe_Exception;
Object.assign(haxe_exceptions_PosException.prototype, {
	__class__: haxe_exceptions_PosException
});
class haxe_exceptions_NotImplementedException extends haxe_exceptions_PosException {
	constructor(message,previous,pos) {
		if(message == null) {
			message = "Not implemented";
		}
		super(message,previous,pos);
	}
}
haxe_exceptions_NotImplementedException.__name__ = true;
haxe_exceptions_NotImplementedException.__super__ = haxe_exceptions_PosException;
Object.assign(haxe_exceptions_NotImplementedException.prototype, {
	__class__: haxe_exceptions_NotImplementedException
});
class haxe_io_Bytes {
	constructor(data) {
		this.length = data.byteLength;
		this.b = new Uint8Array(data);
		this.b.bufferValue = data;
		data.hxBytes = this;
		data.bytes = this.b;
	}
	blit(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		if(srcpos == 0 && len == src.b.byteLength) {
			this.b.set(src.b,pos);
		} else {
			this.b.set(src.b.subarray(srcpos,srcpos + len),pos);
		}
	}
	static ofData(b) {
		let hb = b.hxBytes;
		if(hb != null) {
			return hb;
		}
		return new haxe_io_Bytes(b);
	}
}
haxe_io_Bytes.__name__ = true;
Object.assign(haxe_io_Bytes.prototype, {
	__class__: haxe_io_Bytes
});
class haxe_io_BytesBuffer {
	constructor() {
		this.pos = 0;
		this.size = 0;
	}
	addByte(byte) {
		if(this.pos == this.size) {
			this.grow(1);
		}
		this.view.setUint8(this.pos++,byte);
	}
	addInt32(v) {
		if(this.pos + 4 > this.size) {
			this.grow(4);
		}
		this.view.setInt32(this.pos,v,true);
		this.pos += 4;
	}
	addDouble(v) {
		if(this.pos + 8 > this.size) {
			this.grow(8);
		}
		this.view.setFloat64(this.pos,v,true);
		this.pos += 8;
	}
	grow(delta) {
		let req = this.pos + delta;
		let nsize = this.size == 0 ? 16 : this.size;
		while(nsize < req) nsize = nsize * 3 >> 1;
		let nbuf = new ArrayBuffer(nsize);
		let nu8 = new Uint8Array(nbuf);
		if(this.size > 0) {
			nu8.set(this.u8);
		}
		this.size = nsize;
		this.buffer = nbuf;
		this.u8 = nu8;
		this.view = new DataView(this.buffer);
	}
	getBytes() {
		if(this.size == 0) {
			return new haxe_io_Bytes(new ArrayBuffer(0));
		}
		let b = new haxe_io_Bytes(this.buffer);
		b.length = this.pos;
		return b;
	}
}
haxe_io_BytesBuffer.__name__ = true;
Object.assign(haxe_io_BytesBuffer.prototype, {
	__class__: haxe_io_BytesBuffer
});
class haxe_io_Input {
	readByte() {
		throw new haxe_exceptions_NotImplementedException(null,null,{ fileName : "haxe/io/Input.hx", lineNumber : 53, className : "haxe.io.Input", methodName : "readByte"});
	}
	readDouble() {
		let i1 = this.readInt32();
		let i2 = this.readInt32();
		if(this.bigEndian) {
			return haxe_io_FPHelper.i64ToDouble(i2,i1);
		} else {
			return haxe_io_FPHelper.i64ToDouble(i1,i2);
		}
	}
	readInt32() {
		let ch1 = this.readByte();
		let ch2 = this.readByte();
		let ch3 = this.readByte();
		let ch4 = this.readByte();
		if(this.bigEndian) {
			return ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24;
		} else {
			return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
		}
	}
}
haxe_io_Input.__name__ = true;
Object.assign(haxe_io_Input.prototype, {
	__class__: haxe_io_Input
});
class haxe_io_BytesInput extends haxe_io_Input {
	constructor(b,pos,len) {
		super();
		if(pos == null) {
			pos = 0;
		}
		if(len == null) {
			len = b.length - pos;
		}
		if(pos < 0 || len < 0 || pos + len > b.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		this.b = b.b;
		this.pos = pos;
		this.len = len;
		this.totlen = len;
	}
	readByte() {
		if(this.len == 0) {
			throw haxe_Exception.thrown(new haxe_io_Eof());
		}
		this.len--;
		return this.b[this.pos++];
	}
}
haxe_io_BytesInput.__name__ = true;
haxe_io_BytesInput.__super__ = haxe_io_Input;
Object.assign(haxe_io_BytesInput.prototype, {
	__class__: haxe_io_BytesInput
});
class haxe_io_Eof {
	constructor() {
	}
	toString() {
		return "Eof";
	}
}
haxe_io_Eof.__name__ = true;
Object.assign(haxe_io_Eof.prototype, {
	__class__: haxe_io_Eof
});
var haxe_io_Error = $hxEnums["haxe.io.Error"] = { __ename__:true,__constructs__:null
	,Blocked: {_hx_name:"Blocked",_hx_index:0,__enum__:"haxe.io.Error",toString:$estr}
	,Overflow: {_hx_name:"Overflow",_hx_index:1,__enum__:"haxe.io.Error",toString:$estr}
	,OutsideBounds: {_hx_name:"OutsideBounds",_hx_index:2,__enum__:"haxe.io.Error",toString:$estr}
	,Custom: ($_=function(e) { return {_hx_index:3,e:e,__enum__:"haxe.io.Error",toString:$estr}; },$_._hx_name="Custom",$_.__params__ = ["e"],$_)
};
haxe_io_Error.__constructs__ = [haxe_io_Error.Blocked,haxe_io_Error.Overflow,haxe_io_Error.OutsideBounds,haxe_io_Error.Custom];
class haxe_io_FPHelper {
	static i64ToDouble(low,high) {
		haxe_io_FPHelper.helper.setInt32(0,low,true);
		haxe_io_FPHelper.helper.setInt32(4,high,true);
		return haxe_io_FPHelper.helper.getFloat64(0,true);
	}
}
haxe_io_FPHelper.__name__ = true;
class haxe_io_Path {
	constructor(path) {
		switch(path) {
		case ".":case "..":
			this.dir = path;
			this.file = "";
			return;
		}
		let c1 = path.lastIndexOf("/");
		let c2 = path.lastIndexOf("\\");
		if(c1 < c2) {
			this.dir = HxOverrides.substr(path,0,c2);
			path = HxOverrides.substr(path,c2 + 1,null);
			this.backslash = true;
		} else if(c2 < c1) {
			this.dir = HxOverrides.substr(path,0,c1);
			path = HxOverrides.substr(path,c1 + 1,null);
		} else {
			this.dir = null;
		}
		let cp = path.lastIndexOf(".");
		if(cp != -1) {
			this.ext = HxOverrides.substr(path,cp + 1,null);
			this.file = HxOverrides.substr(path,0,cp);
		} else {
			this.ext = null;
			this.file = path;
		}
	}
	toString() {
		return (this.dir == null ? "" : this.dir + (this.backslash ? "\\" : "/")) + this.file + (this.ext == null ? "" : "." + this.ext);
	}
	static withoutExtension(path) {
		let s = new haxe_io_Path(path);
		s.ext = null;
		return s.toString();
	}
	static withoutDirectory(path) {
		let s = new haxe_io_Path(path);
		s.dir = null;
		return s.toString();
	}
	static directory(path) {
		let s = new haxe_io_Path(path);
		if(s.dir == null) {
			return "";
		}
		return s.dir;
	}
	static extension(path) {
		let s = new haxe_io_Path(path);
		if(s.ext == null) {
			return "";
		}
		return s.ext;
	}
}
haxe_io_Path.__name__ = true;
Object.assign(haxe_io_Path.prototype, {
	__class__: haxe_io_Path
});
class haxe_iterators_ArrayIterator {
	constructor(array) {
		this.current = 0;
		this.array = array;
	}
	hasNext() {
		return this.current < this.array.length;
	}
	next() {
		return this.array[this.current++];
	}
}
haxe_iterators_ArrayIterator.__name__ = true;
Object.assign(haxe_iterators_ArrayIterator.prototype, {
	__class__: haxe_iterators_ArrayIterator
});
class haxe_macro_Error extends haxe_Exception {
	constructor(message,pos,previous) {
		super(message,previous);
		this.pos = pos;
	}
}
haxe_macro_Error.__name__ = true;
haxe_macro_Error.__super__ = haxe_Exception;
Object.assign(haxe_macro_Error.prototype, {
	__class__: haxe_macro_Error
});
class js_Boot {
	static getClass(o) {
		if(o == null) {
			return null;
		} else if(((o) instanceof Array)) {
			return Array;
		} else {
			let cl = o.__class__;
			if(cl != null) {
				return cl;
			}
			let name = js_Boot.__nativeClassName(o);
			if(name != null) {
				return js_Boot.__resolveNativeClass(name);
			}
			return null;
		}
	}
	static __string_rec(o,s) {
		if(o == null) {
			return "null";
		}
		if(s.length >= 5) {
			return "<...>";
		}
		let t = typeof(o);
		if(t == "function" && (o.__name__ || o.__ename__)) {
			t = "object";
		}
		switch(t) {
		case "function":
			return "<function>";
		case "object":
			if(o.__enum__) {
				let e = $hxEnums[o.__enum__];
				let con = e.__constructs__[o._hx_index];
				let n = con._hx_name;
				if(con.__params__) {
					s = s + "\t";
					return n + "(" + ((function($this) {
						var $r;
						let _g = [];
						{
							let _g1 = 0;
							let _g2 = con.__params__;
							while(true) {
								if(!(_g1 < _g2.length)) {
									break;
								}
								let p = _g2[_g1];
								_g1 = _g1 + 1;
								_g.push(js_Boot.__string_rec(o[p],s));
							}
						}
						$r = _g;
						return $r;
					}(this))).join(",") + ")";
				} else {
					return n;
				}
			}
			if(((o) instanceof Array)) {
				let str = "[";
				s += "\t";
				let _g = 0;
				let _g1 = o.length;
				while(_g < _g1) {
					let i = _g++;
					str += (i > 0 ? "," : "") + js_Boot.__string_rec(o[i],s);
				}
				str += "]";
				return str;
			}
			let tostr;
			try {
				tostr = o.toString;
			} catch( _g ) {
				return "???";
			}
			if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
				let s2 = o.toString();
				if(s2 != "[object Object]") {
					return s2;
				}
			}
			let str = "{\n";
			s += "\t";
			let hasp = o.hasOwnProperty != null;
			let k = null;
			for( k in o ) {
			if(hasp && !o.hasOwnProperty(k)) {
				continue;
			}
			if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
				continue;
			}
			if(str.length != 2) {
				str += ", \n";
			}
			str += s + k + " : " + js_Boot.__string_rec(o[k],s);
			}
			s = s.substring(1);
			str += "\n" + s + "}";
			return str;
		case "string":
			return o;
		default:
			return String(o);
		}
	}
	static __interfLoop(cc,cl) {
		if(cc == null) {
			return false;
		}
		if(cc == cl) {
			return true;
		}
		let intf = cc.__interfaces__;
		if(intf != null && (cc.__super__ == null || cc.__super__.__interfaces__ != intf)) {
			let _g = 0;
			let _g1 = intf.length;
			while(_g < _g1) {
				let i = _g++;
				let i1 = intf[i];
				if(i1 == cl || js_Boot.__interfLoop(i1,cl)) {
					return true;
				}
			}
		}
		return js_Boot.__interfLoop(cc.__super__,cl);
	}
	static __instanceof(o,cl) {
		if(cl == null) {
			return false;
		}
		switch(cl) {
		case Array:
			return ((o) instanceof Array);
		case Bool:
			return typeof(o) == "boolean";
		case Dynamic:
			return o != null;
		case Float:
			return typeof(o) == "number";
		case Int:
			if(typeof(o) == "number") {
				return ((o | 0) === o);
			} else {
				return false;
			}
			break;
		case String:
			return typeof(o) == "string";
		default:
			if(o != null) {
				if(typeof(cl) == "function") {
					if(js_Boot.__downcastCheck(o,cl)) {
						return true;
					}
				} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
					if(((o) instanceof cl)) {
						return true;
					}
				}
			} else {
				return false;
			}
			if(cl == Class ? o.__name__ != null : false) {
				return true;
			}
			if(cl == Enum ? o.__ename__ != null : false) {
				return true;
			}
			return o.__enum__ != null ? $hxEnums[o.__enum__] == cl : false;
		}
	}
	static __downcastCheck(o,cl) {
		if(!((o) instanceof cl)) {
			if(cl.__isInterface__) {
				return js_Boot.__interfLoop(js_Boot.getClass(o),cl);
			} else {
				return false;
			}
		} else {
			return true;
		}
	}
	static __cast(o,t) {
		if(o == null || js_Boot.__instanceof(o,t)) {
			return o;
		} else {
			throw haxe_Exception.thrown("Cannot cast " + Std.string(o) + " to " + Std.string(t));
		}
	}
	static __nativeClassName(o) {
		let name = js_Boot.__toStr.call(o).slice(8,-1);
		if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") {
			return null;
		}
		return name;
	}
	static __isNativeObj(o) {
		return js_Boot.__nativeClassName(o) != null;
	}
	static __resolveNativeClass(name) {
		return $global[name];
	}
}
js_Boot.__name__ = true;
class optimizer_ConstantFoldingPass {
	constructor() {
	}
	optimize(ast) {
		let _g = 0;
		while(_g < ast.length) {
			let stmt = ast[_g];
			++_g;
			stmt.visitStmt(this);
		}
	}
	visitStmt(stmt) {
	}
	visitBreakStmt(stmt) {
	}
	visitContinueStmt(stmt) {
	}
	visitExpr(expr) {
	}
	visitParenthesisExpr(expr) {
	}
	visitReturnStmt(stmt) {
	}
	visitIfStmt(stmt) {
	}
	visitLoopStmt(stmt) {
	}
	visitBinaryExpr(expr) {
	}
	visitFloatBinaryExpr(expr) {
		if(((expr.left) instanceof expr_ParenthesisExpr)) {
			expr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;
		}
		if(((expr.right) instanceof expr_ParenthesisExpr)) {
			expr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;
		}
		if(((expr.left) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {
			let lValue = 0;
			let rValue = 0;
			if(((expr.left) instanceof expr_IntExpr)) {
				lValue = (js_Boot.__cast(expr.left , expr_IntExpr)).value;
			} else if(((expr.left) instanceof expr_FloatExpr)) {
				lValue = (js_Boot.__cast(expr.left , expr_FloatExpr)).value;
			} else if(((expr.left) instanceof expr_StringConstExpr)) {
				lValue = Compiler.stringToNumber((js_Boot.__cast(expr.left , expr_StringConstExpr)).value);
			}
			if(((expr.right) instanceof expr_IntExpr)) {
				rValue = (js_Boot.__cast(expr.right , expr_IntExpr)).value;
			} else if(((expr.right) instanceof expr_FloatExpr)) {
				rValue = (js_Boot.__cast(expr.right , expr_FloatExpr)).value;
			} else if(((expr.right) instanceof expr_StringConstExpr)) {
				rValue = Compiler.stringToNumber((js_Boot.__cast(expr.right , expr_StringConstExpr)).value);
			}
			let result;
			switch(expr.op.type._hx_index) {
			case 15:
				result = lValue + rValue;
				break;
			case 16:
				result = lValue - rValue;
				break;
			case 17:
				result = lValue * rValue;
				break;
			case 18:
				result = lValue / rValue;
				break;
			default:
				result = 0;
			}
			expr.optimized = true;
			expr.optimizedExpr = new expr_FloatExpr(expr.lineNo,result);
		}
	}
	visitIntBinaryExpr(expr) {
		if(((expr.left) instanceof expr_ParenthesisExpr)) {
			expr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;
		}
		if(((expr.right) instanceof expr_ParenthesisExpr)) {
			expr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;
		}
		if(((expr.left) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {
			expr.getSubTypeOperand();
			if(expr.subType == expr_TypeReq.ReqFloat) {
				let lValue = 0;
				let rValue = 0;
				if(((expr.left) instanceof expr_IntExpr)) {
					lValue = (js_Boot.__cast(expr.left , expr_IntExpr)).value;
				} else if(((expr.left) instanceof expr_FloatExpr)) {
					lValue = (js_Boot.__cast(expr.left , expr_FloatExpr)).value;
				} else if(((expr.left) instanceof expr_StringConstExpr)) {
					lValue = Compiler.stringToNumber((js_Boot.__cast(expr.left , expr_StringConstExpr)).value);
				}
				if(((expr.right) instanceof expr_IntExpr)) {
					rValue = (js_Boot.__cast(expr.right , expr_IntExpr)).value;
				} else if(((expr.right) instanceof expr_FloatExpr)) {
					rValue = (js_Boot.__cast(expr.right , expr_FloatExpr)).value;
				} else if(((expr.right) instanceof expr_StringConstExpr)) {
					rValue = Compiler.stringToNumber((js_Boot.__cast(expr.right , expr_StringConstExpr)).value);
				}
				let result;
				switch(expr.op.type._hx_index) {
				case 31:
					result = lValue < rValue ? 1 : 0;
					break;
				case 32:
					result = lValue > rValue ? 1 : 0;
					break;
				case 33:
					result = lValue <= rValue ? 1 : 0;
					break;
				case 34:
					result = lValue >= rValue ? 1 : 0;
					break;
				case 36:
					result = lValue != rValue ? 1 : 0;
					break;
				case 37:
					result = lValue == rValue ? 1 : 0;
					break;
				default:
					result = 0;
				}
				expr.optimized = true;
				expr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);
				return;
			}
			if(expr.subType == expr_TypeReq.ReqInt) {
				let lValue = 0;
				let rValue = 0;
				if(((expr.left) instanceof expr_IntExpr)) {
					lValue = (js_Boot.__cast(expr.left , expr_IntExpr)).value;
				} else if(((expr.left) instanceof expr_FloatExpr)) {
					lValue = (js_Boot.__cast(expr.left , expr_FloatExpr)).value;
				} else if(((expr.left) instanceof expr_StringConstExpr)) {
					lValue = Compiler.stringToNumber((js_Boot.__cast(expr.left , expr_StringConstExpr)).value);
				}
				if(((expr.right) instanceof expr_IntExpr)) {
					rValue = (js_Boot.__cast(expr.right , expr_IntExpr)).value;
				} else if(((expr.right) instanceof expr_FloatExpr)) {
					rValue = (js_Boot.__cast(expr.right , expr_FloatExpr)).value;
				} else if(((expr.right) instanceof expr_StringConstExpr)) {
					rValue = Compiler.stringToNumber((js_Boot.__cast(expr.right , expr_StringConstExpr)).value);
				}
				let result;
				switch(expr.op.type._hx_index) {
				case 19:
					result = lValue % rValue;
					break;
				case 46:
					result = lValue > 0 && rValue > 0 ? 1 : 0;
					break;
				case 47:
					result = lValue > 0 || rValue > 0 ? 1 : 0;
					break;
				case 48:
					result = lValue << rValue;
					break;
				case 49:
					result = lValue >> rValue;
					break;
				case 50:
					result = lValue & rValue;
					break;
				case 51:
					result = lValue | rValue;
					break;
				case 52:
					result = lValue ^ rValue;
					break;
				default:
					result = 0;
				}
				expr.optimized = true;
				expr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);
				return;
			}
		}
	}
	visitStrEqExpr(expr) {
		if(((expr.left) instanceof expr_ParenthesisExpr)) {
			expr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;
		}
		if(((expr.right) instanceof expr_ParenthesisExpr)) {
			expr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;
		}
		if(((expr.left) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {
			let lValue = "";
			let rValue = "";
			if(((expr.left) instanceof expr_IntExpr)) {
				lValue = "" + (js_Boot.__cast(expr.left , expr_IntExpr)).value;
			} else if(((expr.left) instanceof expr_FloatExpr)) {
				lValue = "" + (js_Boot.__cast(expr.left , expr_FloatExpr)).value;
			} else if(((expr.left) instanceof expr_StringConstExpr)) {
				lValue = "" + (js_Boot.__cast(expr.left , expr_StringConstExpr)).value;
			}
			if(((expr.right) instanceof expr_IntExpr)) {
				rValue = "" + (js_Boot.__cast(expr.right , expr_IntExpr)).value;
			} else if(((expr.right) instanceof expr_FloatExpr)) {
				rValue = "" + (js_Boot.__cast(expr.right , expr_FloatExpr)).value;
			} else if(((expr.right) instanceof expr_StringConstExpr)) {
				rValue = (js_Boot.__cast(expr.right , expr_StringConstExpr)).value;
			}
			let result;
			switch(expr.op.type._hx_index) {
			case 39:
				result = lValue == rValue ? 1 : 0;
				break;
			case 40:
				result = lValue != rValue ? 1 : 0;
				break;
			default:
				result = 0;
			}
			expr.optimized = true;
			expr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);
		}
	}
	visitStrCatExpr(expr) {
		if(((expr.left) instanceof expr_ParenthesisExpr)) {
			expr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;
		}
		if(((expr.right) instanceof expr_ParenthesisExpr)) {
			expr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;
		}
		if(((expr.left) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.left) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {
				expr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.right) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {
				expr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {
			let lValue = "";
			let rValue = "";
			if(((expr.left) instanceof expr_IntExpr)) {
				lValue = "" + (js_Boot.__cast(expr.left , expr_IntExpr)).value;
			} else if(((expr.left) instanceof expr_FloatExpr)) {
				lValue = "" + (js_Boot.__cast(expr.left , expr_FloatExpr)).value;
			} else if(((expr.left) instanceof expr_StringConstExpr)) {
				lValue = "" + (js_Boot.__cast(expr.left , expr_StringConstExpr)).value;
			}
			if(((expr.right) instanceof expr_IntExpr)) {
				rValue = "" + (js_Boot.__cast(expr.right , expr_IntExpr)).value;
			} else if(((expr.right) instanceof expr_FloatExpr)) {
				rValue = "" + (js_Boot.__cast(expr.right , expr_FloatExpr)).value;
			} else if(((expr.right) instanceof expr_StringConstExpr)) {
				rValue = (js_Boot.__cast(expr.right , expr_StringConstExpr)).value;
			}
			let result;
			switch(expr.op.type._hx_index) {
			case 41:
				result = lValue + rValue;
				break;
			case 42:
				result = lValue + " " + rValue;
				break;
			case 43:
				result = lValue + "\t" + rValue;
				break;
			case 44:
				result = lValue + "\n" + rValue;
				break;
			default:
				result = "";
			}
			expr.optimized = true;
			expr.optimizedExpr = new expr_StringConstExpr(expr.lineNo,result,false);
		}
	}
	visitCommatCatExpr(expr) {
	}
	visitConditionalExpr(expr) {
	}
	visitIntUnaryExpr(expr) {
		if(((expr.expr) instanceof expr_ParenthesisExpr)) {
			expr.expr = (js_Boot.__cast(expr.expr , expr_ParenthesisExpr)).expr;
		}
		if(((expr.expr) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimized) {
				expr.expr = (js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.expr) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimized) {
				expr.expr = (js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.expr) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimized) {
				expr.expr = (js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.expr) instanceof expr_IntExpr) || ((expr.expr) instanceof expr_FloatExpr) || ((expr.expr) instanceof expr_StringConstExpr)) {
			let value = 0;
			if(((expr.expr) instanceof expr_IntExpr)) {
				value = (js_Boot.__cast(expr.expr , expr_IntExpr)).value;
			} else if(((expr.expr) instanceof expr_FloatExpr)) {
				value = (js_Boot.__cast(expr.expr , expr_FloatExpr)).value;
			} else if(((expr.expr) instanceof expr_StringConstExpr)) {
				value = Compiler.stringToNumber((js_Boot.__cast(expr.expr , expr_StringConstExpr)).value);
			}
			let result;
			switch(expr.op.type._hx_index) {
			case 35:
				result = value == 0 ? 1 : 0;
				break;
			case 38:
				result = ~value;
				break;
			default:
				result = 0;
			}
			expr.optimized = true;
			expr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);
		}
	}
	visitFloatUnaryExpr(expr) {
		if(((expr.expr) instanceof expr_ParenthesisExpr)) {
			expr.expr = (js_Boot.__cast(expr.expr , expr_ParenthesisExpr)).expr;
		}
		if(((expr.expr) instanceof expr_BinaryExpr)) {
			if((js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimized) {
				expr.expr = (js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimizedExpr;
			}
		}
		if(((expr.expr) instanceof expr_IntUnaryExpr)) {
			if((js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimized) {
				expr.expr = (js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.expr) instanceof expr_FloatUnaryExpr)) {
			if((js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimized) {
				expr.expr = (js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimizedExpr;
			}
		}
		if(((expr.expr) instanceof expr_IntExpr) || ((expr.expr) instanceof expr_FloatExpr) || ((expr.expr) instanceof expr_StringConstExpr)) {
			let value = 0;
			if(((expr.expr) instanceof expr_IntExpr)) {
				value = (js_Boot.__cast(expr.expr , expr_IntExpr)).value;
			} else if(((expr.expr) instanceof expr_FloatExpr)) {
				value = (js_Boot.__cast(expr.expr , expr_FloatExpr)).value;
			} else if(((expr.expr) instanceof expr_StringConstExpr)) {
				value = Compiler.stringToNumber((js_Boot.__cast(expr.expr , expr_StringConstExpr)).value);
			}
			let result = -value;
			expr.optimized = true;
			expr.optimizedExpr = new expr_FloatExpr(expr.lineNo,result);
		}
	}
	visitVarExpr(expr) {
	}
	visitIntExpr(expr) {
	}
	visitFloatExpr(expr) {
	}
	visitStringConstExpr(expr) {
	}
	visitConstantExpr(expr) {
	}
	visitAssignExpr(expr) {
	}
	visitAssignOpExpr(expr) {
	}
	visitFuncCallExpr(expr) {
	}
	visitSlotAccessExpr(expr) {
	}
	visitSlotAssignExpr(expr) {
	}
	visitSlotAssignOpExpr(expr) {
	}
	visitObjectDeclExpr(expr) {
	}
	visitFunctionDeclStmt(stmt) {
	}
	getLevel() {
		return 1;
	}
}
optimizer_ConstantFoldingPass.__name__ = true;
optimizer_ConstantFoldingPass.__interfaces__ = [IOptimizerPass];
Object.assign(optimizer_ConstantFoldingPass.prototype, {
	__class__: optimizer_ConstantFoldingPass
});
$global.$haxeUID |= 0;
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
if( String.fromCodePoint == null ) String.fromCodePoint = function(c) { return c < 0x10000 ? String.fromCharCode(c) : String.fromCharCode((c>>10)+0xD7C0)+String.fromCharCode((c&0x3FF)+0xDC00); }
{
	String.prototype.__class__ = String;
	String.__name__ = true;
	Array.__name__ = true;
	var Int = { };
	var Dynamic = { };
	var Float = Number;
	var Bool = Boolean;
	var Class = { };
	var Enum = { };
	}
$hx_exports["expr_AssignExpr"] = expr_AssignExpr;
$hx_exports["expr_AssignOpExpr"] = expr_AssignOpExpr;
$hx_exports["expr_BinaryExpr"] = expr_BinaryExpr;
$hx_exports["expr_BreakStmt"] = expr_BreakStmt;
$hx_exports["expr_CommaCatExpr"] = 	expr_CommaCatExpr;
$hx_exports["expr_ConditionalExpr"] = expr_ConditionalExpr;
$hx_exports["expr_ConstantExpr"] = expr_ConstantExpr;
$hx_exports["expr_ContinueStmt"] = expr_ContinueStmt;
$hx_exports["expr_Expr"] = expr_Expr;
$hx_exports["expr_FloatBinaryExpr"] = expr_FloatBinaryExpr;
$hx_exports["expr_FloatExpr"] = expr_FloatExpr;
$hx_exports["expr_FloatUnaryExpr"] = expr_FloatUnaryExpr;
$hx_exports["expr_FuncCallExpr"] = expr_FuncCallExpr;
$hx_exports["expr_FunctionDeclStmt"] = expr_FunctionDeclStmt;
$hx_exports["expr_IfStmt"] = expr_IfStmt;
$hx_exports["expr_IntBinaryExpr"] = expr_IntBinaryExpr;
$hx_exports["expr_IntExpr"] = expr_IntExpr;
$hx_exports["expr_IntUnaryExpr"] = expr_IntUnaryExpr;
$hx_exports["expr_LoopStmt"] = expr_LoopStmt;
$hx_exports["expr_ObjectDeclExpr"] = expr_ObjectDeclExpr;
$hx_exports["expr_ParenthesisExpr"] = expr_ParenthesisExpr;
$hx_exports["expr_ReturnStmt"] = expr_ReturnStmt;
$hx_exports["expr_SlotAccessExpr"] = expr_SlotAccessExpr;
$hx_exports["expr_SlotAssignExpr"] = expr_SlotAssignExpr;
$hx_exports["expr_SlotAssignOpExpr"] = expr_SlotAssignOpExpr;
$hx_exports["expr_Stmt"] = expr_Stmt;
$hx_exports["expr_StrCatExpr"] = expr_StrCatExpr;
$hx_exports["expr_StrEqExpr"] = expr_StrEqExpr;
$hx_exports["expr_StringConstExpr"] = expr_StringConstExpr;
$hx_exports["expr_VarExpr"] = expr_VarExpr;
haxe_ds_ObjectMap.count = 0;
js_Boot.__toStr = ({ }).toString;
VarCollector.reservedKwds = ["break","case","catch","class","const","continue","debugger","default","delete","do","else","enum","export","extends","false","finally","for","function","if","import","in","instanceof","new","null","return","super","switch","this","throw","true","try","typeof","var","void","while","with","as","implements","interface","let","package","private","protected","public","static","yield","any","boolean","constructor","declare","get","module","require","number","set","string","symbol","type","from","of"];
JSGenerator.embedLib = "";
Log.savedStr = "";
console_ConsoleObject._hx_skip_constructor = false;
console_ConsoleObjectConstructors.constructorMap = (function($this) {
	var $r;
	let _g = new haxe_ds_StringMap();
	_g.h["SimObject"] = function() {
		return new console_SimObject();
	};
	_g.h["ScriptObject"] = function() {
		return new console_ScriptObject();
	};
	_g.h["SimDataBlock"] = function() {
		return new console_SimDataBlock();
	};
	_g.h["SimSet"] = function() {
		return new console_SimSet();
	};
	_g.h["SimGroup"] = function() {
		return new console_SimGroup();
	};
	$r = _g;
	return $r;
}(this));
console_ConsoleObjectMacro.defClasses = [];
expr_Stmt._hx_skip_constructor = false;
expr_Stmt.recursion = 0;
haxe_EntryPoint.pending = [];
haxe_EntryPoint.threadCount = 0;
haxe_io_FPHelper.helper = new DataView(new ArrayBuffer(8));
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
var CodeBlock = $hx_exports["CodeBlock"];
var Compiler = $hx_exports["Compiler"];
var Disassembler = $hx_exports["Disassembler"];
var JSGenerator = $hx_exports["JSGenerator"];
var Log = $hx_exports["Log"];
var Parser = $hx_exports["Parser"];
var Scanner = $hx_exports["Scanner"];
var Variable = $hx_exports["Variable"];
var VM = $hx_exports["VM"];
var expr_AssignExpr = $hx_exports["expr_AssignExpr"]
var expr_AssignOpExpr = $hx_exports["expr_AssignOpExpr"]
var expr_BinaryExpr = $hx_exports["expr_BinaryExpr"]
var expr_BreakStmt = $hx_exports["expr_BreakStmt"]
var expr_CommaCatExpr = $hx_exports["expr_CommaCatExpr"]
var expr_ConditionalExpr = $hx_exports["expr_ConditionalExpr"]
var expr_ConstantExpr = $hx_exports["expr_ConstantExpr"]
var expr_ContinueStmt = $hx_exports["expr_ContinueStmt"]
var expr_Expr = $hx_exports["expr_Expr"]
var expr_FloatBinaryExpr = $hx_exports["expr_FloatBinaryExpr"]
var expr_FloatExpr = $hx_exports["expr_FloatExpr"]
var expr_FloatUnaryExpr = $hx_exports["expr_FloatUnaryExpr"]
var expr_FuncCallExpr = $hx_exports["expr_FuncCallExpr"]
var expr_FunctionDeclStmt = $hx_exports["expr_FunctionDeclStmt"]
var expr_IfStmt = $hx_exports["expr_IfStmt"]
var expr_IntBinaryExpr = $hx_exports["expr_IntBinaryExpr"]
var expr_IntExpr = $hx_exports["expr_IntExpr"]
var expr_IntUnaryExpr = $hx_exports["expr_IntUnaryExpr"]
var expr_LoopStmt = $hx_exports["expr_LoopStmt"]
var expr_ObjectDeclExpr = $hx_exports["expr_ObjectDeclExpr"]
var expr_ParenthesisExpr = $hx_exports["expr_ParenthesisExpr"]
var expr_ReturnStmt = $hx_exports["expr_ReturnStmt"]
var expr_SlotAccessExpr = $hx_exports["expr_SlotAccessExpr"]
var expr_SlotAssignExpr = $hx_exports["expr_SlotAssignExpr"]
var expr_SlotAssignOpExpr = $hx_exports["expr_SlotAssignOpExpr"]
var expr_Stmt = $hx_exports["expr_Stmt"]
var expr_StrCatExpr = $hx_exports["expr_StrCatExpr"]
var expr_StrEqExpr = $hx_exports["expr_StrEqExpr"]
var expr_StringConstExpr = $hx_exports["expr_StringConstExpr"]
var expr_VarExp = $hx_exports["expr_VarExpr"]