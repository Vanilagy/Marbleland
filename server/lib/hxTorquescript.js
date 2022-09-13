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
JSGenerator.embedLib = "var $hx_exports = typeof exports != \"undefined\" ? exports : typeof window != \"undefined\" ? window : typeof self != \"undefined\" ? self : this;\n(function ($global) { \"use strict\";\nvar $estr = function() { return js_Boot.__string_rec(this,\'\'); },$hxEnums = $hxEnums || {},$_;\nclass CodeBlock {\n\tconstructor(vm,fileName) {\n\t\tthis.addedFunctions = false;\n\t\tthis.resolveFuncMap = new haxe_ds_IntMap();\n\t\tthis.resolveFuncId = 0;\n\t\tthis.identMapSize = 1;\n\t\tlet _g = new haxe_ds_IntMap();\n\t\t_g.h[0] = null;\n\t\tthis.identMap = _g;\n\t\tthis.opCodeLookup = new haxe_ds_IntMap();\n\t\tthis.lineBreakPairs = [];\n\t\tthis.codeStream = [];\n\t\tthis.functionFloatTable = [];\n\t\tthis.globalFloatTable = [];\n\t\tthis.vm = vm;\n\t\tthis.fileName = fileName;\n\t\tlet _g1 = new haxe_ds_IntMap();\n\t\t_g1.h[0] = \"FuncDecl\";\n\t\t_g1.h[1] = \"CreateObject\";\n\t\t_g1.h[2] = \"CreateDataBlock\";\n\t\t_g1.h[3] = \"NameObject\";\n\t\t_g1.h[4] = \"AddObject\";\n\t\t_g1.h[5] = \"EndObject\";\n\t\t_g1.h[6] = \"JmpIffNot\";\n\t\t_g1.h[7] = \"JmpIfNot\";\n\t\t_g1.h[8] = \"JmpIff\";\n\t\t_g1.h[9] = \"JmpIf\";\n\t\t_g1.h[10] = \"JmpIfNotNP\";\n\t\t_g1.h[11] = \"JmpIfNP\";\n\t\t_g1.h[12] = \"Jmp\";\n\t\t_g1.h[13] = \"Return\";\n\t\t_g1.h[14] = \"CmpEQ\";\n\t\t_g1.h[15] = \"CmpGT\";\n\t\t_g1.h[16] = \"CmpGE\";\n\t\t_g1.h[17] = \"CmpLT\";\n\t\t_g1.h[18] = \"CmpLE\";\n\t\t_g1.h[19] = \"CmpNE\";\n\t\t_g1.h[20] = \"Xor\";\n\t\t_g1.h[21] = \"Mod\";\n\t\t_g1.h[22] = \"BitAnd\";\n\t\t_g1.h[23] = \"BitOr\";\n\t\t_g1.h[24] = \"Not\";\n\t\t_g1.h[25] = \"NotF\";\n\t\t_g1.h[26] = \"OnesComplement\";\n\t\t_g1.h[27] = \"Shr\";\n\t\t_g1.h[28] = \"Shl\";\n\t\t_g1.h[29] = \"And\";\n\t\t_g1.h[30] = \"Or\";\n\t\t_g1.h[31] = \"Add\";\n\t\t_g1.h[32] = \"Sub\";\n\t\t_g1.h[33] = \"Mul\";\n\t\t_g1.h[34] = \"Div\";\n\t\t_g1.h[35] = \"Neg\";\n\t\t_g1.h[36] = \"SetCurVar\";\n\t\t_g1.h[37] = \"SetCurVarCreate\";\n\t\t_g1.h[38] = \"SetCurVarArray\";\n\t\t_g1.h[39] = \"SetCurVarArrayCreate\";\n\t\t_g1.h[40] = \"LoadVarUInt\";\n\t\t_g1.h[41] = \"LoadVarFlt\";\n\t\t_g1.h[42] = \"LoadVarStr\";\n\t\t_g1.h[43] = \"SaveVarUInt\";\n\t\t_g1.h[44] = \"SaveVarFlt\";\n\t\t_g1.h[45] = \"SaveVarStr\";\n\t\t_g1.h[46] = \"SetCurObject\";\n\t\t_g1.h[47] = \"SetCurObjectNew\";\n\t\t_g1.h[48] = \"SetCurField\";\n\t\t_g1.h[49] = \"SetCurFieldArray\";\n\t\t_g1.h[50] = \"LoadFieldUInt\";\n\t\t_g1.h[51] = \"LoadFieldFlt\";\n\t\t_g1.h[52] = \"LoadFieldStr\";\n\t\t_g1.h[53] = \"SaveFieldUInt\";\n\t\t_g1.h[54] = \"SaveFieldFlt\";\n\t\t_g1.h[55] = \"SaveFieldStr\";\n\t\t_g1.h[56] = \"StrToUInt\";\n\t\t_g1.h[57] = \"StrToFlt\";\n\t\t_g1.h[58] = \"StrToNone\";\n\t\t_g1.h[59] = \"FltToUInt\";\n\t\t_g1.h[60] = \"FltToStr\";\n\t\t_g1.h[61] = \"FltToNone\";\n\t\t_g1.h[62] = \"UIntToFlt\";\n\t\t_g1.h[63] = \"UIntToStr\";\n\t\t_g1.h[64] = \"UIntToNone\";\n\t\t_g1.h[65] = \"LoadImmedUInt\";\n\t\t_g1.h[66] = \"LoadImmedFlt\";\n\t\t_g1.h[67] = \"TagToStr\";\n\t\t_g1.h[68] = \"LoadImmedStr\";\n\t\t_g1.h[69] = \"LoadImmedIdent\";\n\t\t_g1.h[70] = \"CallFuncResolve\";\n\t\t_g1.h[71] = \"CallFunc\";\n\t\t_g1.h[72] = \"ProcessArgs\";\n\t\t_g1.h[73] = \"AdvanceStr\";\n\t\t_g1.h[74] = \"AdvanceStrAppendChar\";\n\t\t_g1.h[75] = \"AdvanceStrComma\";\n\t\t_g1.h[76] = \"AdvanceStrNul\";\n\t\t_g1.h[77] = \"RewindStr\";\n\t\t_g1.h[78] = \"TerminateRewindStr\";\n\t\t_g1.h[79] = \"CompareStr\";\n\t\t_g1.h[80] = \"Push\";\n\t\t_g1.h[81] = \"PushFrame\";\n\t\t_g1.h[82] = \"Break\";\n\t\t_g1.h[83] = \"Invalid\";\n\t\tthis.opCodeLookup = _g1;\n\t}\n\tloadFromData(bytes) {\n\t\tthis.load(new haxe_io_BytesInput(bytes.getBytes()));\n\t}\n\tload(inData) {\n\t\tthis.dsoVersion = inData.readInt32();\n\t\tif(this.dsoVersion != 33) {\n\t\t\tthrow new haxe_Exception(\"Incorrect DSO version: \" + this.dsoVersion);\n\t\t}\n\t\tlet stSize = inData.readInt32();\n\t\tthis.globalStringTable = \"\";\n\t\tlet _g = 0;\n\t\tlet _g1 = stSize;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet tmp = this;\n\t\t\tlet tmp1 = tmp.globalStringTable;\n\t\t\tlet code = inData.readByte();\n\t\t\ttmp.globalStringTable = tmp1 + String.fromCodePoint(code);\n\t\t}\n\t\tlet size = inData.readInt32();\n\t\tlet _g2 = 0;\n\t\tlet _g3 = size;\n\t\twhile(_g2 < _g3) {\n\t\t\tlet i = _g2++;\n\t\t\tthis.globalFloatTable.push(inData.readDouble());\n\t\t}\n\t\tlet stSize1 = inData.readInt32();\n\t\tthis.functionStringTable = \"\";\n\t\tlet _g4 = 0;\n\t\tlet _g5 = stSize1;\n\t\twhile(_g4 < _g5) {\n\t\t\tlet i = _g4++;\n\t\t\tlet tmp = this;\n\t\t\tlet tmp1 = tmp.functionStringTable;\n\t\t\tlet code = inData.readByte();\n\t\t\ttmp.functionStringTable = tmp1 + String.fromCodePoint(code);\n\t\t}\n\t\tsize = inData.readInt32();\n\t\tlet _g6 = 0;\n\t\tlet _g7 = size;\n\t\twhile(_g6 < _g7) {\n\t\t\tlet i = _g6++;\n\t\t\tthis.functionFloatTable.push(inData.readDouble());\n\t\t}\n\t\tlet codeSize = inData.readInt32();\n\t\tlet lineBreakPairCount = inData.readInt32();\n\t\tlet _g8 = 0;\n\t\tlet _g9 = codeSize;\n\t\twhile(_g8 < _g9) {\n\t\t\tlet i = _g8++;\n\t\t\tlet curByte = inData.readByte();\n\t\t\tif(curByte == 255) {\n\t\t\t\tthis.codeStream.push(inData.readInt32());\n\t\t\t} else {\n\t\t\t\tthis.codeStream.push(curByte);\n\t\t\t}\n\t\t}\n\t\tlet _g10 = 0;\n\t\tlet _g11 = lineBreakPairCount * 2;\n\t\twhile(_g10 < _g11) {\n\t\t\tlet i = _g10++;\n\t\t\tthis.lineBreakPairs.push(inData.readInt32());\n\t\t}\n\t\tlet identTable = new IdentTable();\n\t\tidentTable.read(inData);\n\t\tlet map = identTable.identMap;\n\t\tlet _g12_map = map;\n\t\tlet _g12_keys = map.keys();\n\t\twhile(_g12_keys.hasNext()) {\n\t\t\tlet key = _g12_keys.next();\n\t\t\tlet _g13_value = _g12_map.get(key);\n\t\t\tlet _g13_key = key;\n\t\t\tlet ident = _g13_key;\n\t\t\tlet offsets = _g13_value;\n\t\t\tlet identStr = this.getStringTableValue(this.globalStringTable,ident);\n\t\t\tlet identId = this.identMapSize;\n\t\t\tlet _g = 0;\n\t\t\twhile(_g < offsets.length) {\n\t\t\t\tlet offset = offsets[_g];\n\t\t\t\t++_g;\n\t\t\t\tthis.codeStream[offset] = this.identMapSize;\n\t\t\t}\n\t\t\tthis.identMap.h[identId] = identStr;\n\t\t\tthis.identMapSize++;\n\t\t}\n\t}\n\tgetStringTableValue(table,offset) {\n\t\treturn HxOverrides.substr(table,offset,table.indexOf(\"\\x00\",offset) - offset);\n\t}\n\texec(ip,functionName,namespace,fnArgs,noCalls,packageName) {\n\t\tlet currentStringTable = null;\n\t\tlet currentFloatTable = null;\n\t\tthis.vm.STR.clearFunctionOffset();\n\t\tlet thisFunctionName = null;\n\t\tlet argc = fnArgs.length;\n\t\tif(fnArgs.length != 0) {\n\t\t\tlet fnArgc = this.codeStream[ip + 5];\n\t\t\tthisFunctionName = this.identMap.h[this.codeStream[ip]];\n\t\t\targc = Math.min(fnArgs.length - 1,fnArgc);\n\t\t\tif(this.vm.traceOn) {\n\t\t\t\tLog.print(\"Entering \");\n\t\t\t\tif(packageName != null) {\n\t\t\t\t\tLog.print(\"[\" + packageName + \"] \");\n\t\t\t\t}\n\t\t\t\tif(namespace != null && namespace.name != null) {\n\t\t\t\t\tLog.print(\"\" + namespace.name + \"::\" + thisFunctionName + \"(\");\n\t\t\t\t} else {\n\t\t\t\t\tLog.print(\"\" + thisFunctionName + \"(\");\n\t\t\t\t}\n\t\t\t\tlet _g = 0;\n\t\t\t\tlet _g1 = argc;\n\t\t\t\twhile(_g < _g1) {\n\t\t\t\t\tlet i = _g++;\n\t\t\t\t\tLog.print(\"\" + fnArgs[i]);\n\t\t\t\t\tif(i != argc - 1) {\n\t\t\t\t\t\tLog.print(\", \");\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tLog.println(\")\");\n\t\t\t}\n\t\t\tthis.vm.evalState.pushFrame(thisFunctionName,namespace);\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = argc;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tlet varName = this.identMap.h[this.codeStream[ip + 6 + i]];\n\t\t\t\tthis.vm.evalState.setCurVarNameCreate(varName);\n\t\t\t\tthis.vm.evalState.setStringVariable(fnArgs[i + 1]);\n\t\t\t}\n\t\t\tip += 6 + fnArgc;\n\t\t\tcurrentFloatTable = this.functionFloatTable;\n\t\t\tcurrentStringTable = this.functionStringTable;\n\t\t} else {\n\t\t\tcurrentFloatTable = this.globalFloatTable;\n\t\t\tcurrentStringTable = this.globalStringTable;\n\t\t}\n\t\tlet curField = null;\n\t\tlet curFieldArrayIndex = null;\n\t\tlet currentNewObject = null;\n\t\tlet curObject = null;\n\t\tlet objParent = null;\n\t\tlet breakContinue = false;\n\t\tlet breakContinueIns = 83;\n\t\tlet failJump = 0;\n\t\tlet callArgs = [];\n\t\tlet saveObj = null;\n\t\t_hx_loop3: while(true) {\n\t\t\tlet instruction = !breakContinue ? this.codeStream[ip++] : breakContinueIns;\n\t\t\tif(breakContinue) {\n\t\t\t\tbreakContinue = false;\n\t\t\t}\n\t\t\tswitch(instruction) {\n\t\t\tcase 0:\n\t\t\t\tif(!noCalls) {\n\t\t\t\t\tlet fnName = this.identMap.h[this.codeStream[ip]];\n\t\t\t\t\tlet fnNamespace = this.identMap.h[this.codeStream[ip + 1]];\n\t\t\t\t\tlet pkg = this.identMap.h[this.codeStream[ip + 2]];\n\t\t\t\t\tlet hasBody = this.codeStream[ip + 3] == 1;\n\t\t\t\t\tlet nmspc = null;\n\t\t\t\t\tlet _g = 0;\n\t\t\t\t\tlet _g1 = this.vm.namespaces;\n\t\t\t\t\twhile(_g < _g1.length) {\n\t\t\t\t\t\tlet n = _g1[_g];\n\t\t\t\t\t\t++_g;\n\t\t\t\t\t\tif(n.name == fnNamespace && n.pkg == pkg) {\n\t\t\t\t\t\t\tnmspc = n;\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tif(nmspc == null) {\n\t\t\t\t\t\tnmspc = new console_Namespace(fnNamespace,pkg,null);\n\t\t\t\t\t\tthis.vm.namespaces.push(nmspc);\n\t\t\t\t\t}\n\t\t\t\t\tnmspc.addFunction(fnName,hasBody ? ip : 0,this);\n\t\t\t\t\tthis.addedFunctions = true;\n\t\t\t\t}\n\t\t\t\tip = this.codeStream[ip + 4];\n\t\t\t\tbreak;\n\t\t\tcase 1:\n\t\t\t\tif(noCalls) {\n\t\t\t\t\tip = failJump;\n\t\t\t\t}\n\t\t\t\tobjParent = this.identMap.h[this.codeStream[ip]];\n\t\t\t\tlet datablock = this.codeStream[ip + 1] == 1;\n\t\t\t\tfailJump = this.codeStream[ip + 2];\n\t\t\t\tcallArgs = this.vm.STR.getArgs(\"\");\n\t\t\t\tcurrentNewObject = null;\n\t\t\t\tif(datablock) {\n\t\t\t\t\tlet db = this.vm.dataBlocks.h[callArgs[2]];\n\t\t\t\t\tif(db != null) {\n\t\t\t\t\t\tif(db.getClassName().toLowerCase() == callArgs[1].toLowerCase()) {\n\t\t\t\t\t\t\tLog.println(\"Cannot re-declare data block \" + callArgs[1] + \" with a different class.\");\n\t\t\t\t\t\t\tip = failJump;\n\t\t\t\t\t\t\tcontinue;\n\t\t\t\t\t\t}\n\t\t\t\t\t\tcurrentNewObject = db;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tif(currentNewObject == null) {\n\t\t\t\t\tif(!datablock) {\n\t\t\t\t\t\tif(!Object.prototype.hasOwnProperty.call(console_ConsoleObjectConstructors.constructorMap.h,callArgs[1])) {\n\t\t\t\t\t\t\tLog.println(\"Unable to instantantiate non con-object class \" + callArgs[1]);\n\t\t\t\t\t\t\tip = failJump;\n\t\t\t\t\t\t\tcontinue;\n\t\t\t\t\t\t}\n\t\t\t\t\t\tcurrentNewObject = console_ConsoleObjectConstructors.constructorMap.h[callArgs[1]]();\n\t\t\t\t\t} else {\n\t\t\t\t\t\tcurrentNewObject = new console_SimDataBlock();\n\t\t\t\t\t\tcurrentNewObject.className = callArgs[1];\n\t\t\t\t\t}\n\t\t\t\t\tcurrentNewObject.assignId(datablock ? this.vm.nextDatablockId++ : this.vm.nextSimId++);\n\t\t\t\t\tif(objParent != null) {\n\t\t\t\t\t\tlet parent = this.vm.simObjects.h[objParent];\n\t\t\t\t\t\tif(parent != null) {\n\t\t\t\t\t\t\tcurrentNewObject.assignFieldsFrom(parent);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tLog.println(\"Parent object \" + objParent + \" for \" + callArgs[1] + \" does not exist.\");\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tif(callArgs.length > 2) {\n\t\t\t\t\t\tcurrentNewObject.name = callArgs[2];\n\t\t\t\t\t}\n\t\t\t\t\tif(callArgs.length > 3) {\n\t\t\t\t\t\tif(!currentNewObject.processArguments(callArgs.slice(3))) {\n\t\t\t\t\t\t\tcurrentNewObject = null;\n\t\t\t\t\t\t\tip = failJump;\n\t\t\t\t\t\t\tcontinue;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tip += 3;\n\t\t\t\tbreak;\n\t\t\tcase 2:\n\t\t\t\tbreak;\n\t\t\tcase 3:\n\t\t\t\tbreak;\n\t\t\tcase 4:\n\t\t\t\tlet root = this.codeStream[ip++] == 1;\n\t\t\t\tlet added = false;\n\t\t\t\tif(!Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,currentNewObject.name)) {\n\t\t\t\t\tadded = true;\n\t\t\t\t\tlet this1 = this.vm.simObjects;\n\t\t\t\t\tlet key = currentNewObject.getName();\n\t\t\t\t\tthis1.h[key] = currentNewObject;\n\t\t\t\t}\n\t\t\t\tthis.vm.idMap.h[currentNewObject.id] = currentNewObject;\n\t\t\t\tcurrentNewObject.register(this.vm);\n\t\t\t\tlet datablock1 = ((currentNewObject) instanceof console_SimDataBlock) ? currentNewObject : null;\n\t\t\t\tif(datablock1 != null) {\n\t\t\t\t\tif(!datablock1.preload()) {\n\t\t\t\t\t\tLog.println(\"Datablock \" + datablock1.getName() + \" failed to preload.\");\n\t\t\t\t\t\tip = failJump;\n\t\t\t\t\t\tthis.vm.idMap.remove(currentNewObject.id);\n\t\t\t\t\t\tif(added) {\n\t\t\t\t\t\t\tlet this1 = this.vm.simObjects;\n\t\t\t\t\t\t\tlet key = currentNewObject.getName();\n\t\t\t\t\t\t\tlet _this = this1;\n\t\t\t\t\t\t\tif(Object.prototype.hasOwnProperty.call(_this.h,key)) {\n\t\t\t\t\t\t\t\tdelete(_this.h[key]);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\tcontinue;\n\t\t\t\t\t} else {\n\t\t\t\t\t\tlet this1 = this.vm.dataBlocks;\n\t\t\t\t\t\tlet key = currentNewObject.getName();\n\t\t\t\t\t\tthis1.h[key] = datablock1;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\tlet groupAddId = _this.head == null ? null : _this.head.elt;\n\t\t\t\tif(!root || currentNewObject.group == null) {\n\t\t\t\t\tif(root) {\n\t\t\t\t\t\tthis.vm.rootGroup.addObject(currentNewObject);\n\t\t\t\t\t} else if(this.vm.idMap.h[groupAddId] != null) {\n\t\t\t\t\t\tif(((currentNewObject) instanceof console_SimGroup) || ((currentNewObject) instanceof console_SimSet)) {\n\t\t\t\t\t\t\t(js_Boot.__cast(this.vm.idMap.h[groupAddId] , console_SimSet)).addObject(currentNewObject);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tthis.vm.rootGroup.addObject(currentNewObject);\n\t\t\t\t\t\t}\n\t\t\t\t\t} else {\n\t\t\t\t\t\tthis.vm.rootGroup.addObject(currentNewObject);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tif(root) {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\tlet k = _this.head;\n\t\t\t\t\tif(k != null) {\n\t\t\t\t\t\t_this.head = k.next;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tlet _this1 = this.vm.intStack;\n\t\t\t\t_this1.head = new haxe_ds_GenericCell(currentNewObject.id,_this1.head);\n\t\t\t\tbreak;\n\t\t\tcase 5:\n\t\t\t\tlet root1 = this.codeStream[ip++] > 0;\n\t\t\t\tif(!root1) {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\tlet k = _this.head;\n\t\t\t\t\tif(k != null) {\n\t\t\t\t\t\t_this.head = k.next;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 6:\n\t\t\t\tlet _this2 = this.vm.floatStack;\n\t\t\t\tlet k = _this2.head;\n\t\t\t\tlet tmp;\n\t\t\t\tif(k == null) {\n\t\t\t\t\ttmp = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this2.head = k.next;\n\t\t\t\t\ttmp = k.elt;\n\t\t\t\t}\n\t\t\t\tif(tmp > 0) {\n\t\t\t\t\t++ip;\n\t\t\t\t} else {\n\t\t\t\t\tip = this.codeStream[ip];\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 7:\n\t\t\t\tlet _this3 = this.vm.intStack;\n\t\t\t\tlet k1 = _this3.head;\n\t\t\t\tlet tmp1;\n\t\t\t\tif(k1 == null) {\n\t\t\t\t\ttmp1 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this3.head = k1.next;\n\t\t\t\t\ttmp1 = k1.elt;\n\t\t\t\t}\n\t\t\t\tif(tmp1 > 0) {\n\t\t\t\t\t++ip;\n\t\t\t\t} else {\n\t\t\t\t\tip = this.codeStream[ip];\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 8:\n\t\t\t\tlet _this4 = this.vm.floatStack;\n\t\t\t\tlet k2 = _this4.head;\n\t\t\t\tlet tmp2;\n\t\t\t\tif(k2 == null) {\n\t\t\t\t\ttmp2 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this4.head = k2.next;\n\t\t\t\t\ttmp2 = k2.elt;\n\t\t\t\t}\n\t\t\t\tif(tmp2 <= 0) {\n\t\t\t\t\t++ip;\n\t\t\t\t} else {\n\t\t\t\t\tip = this.codeStream[ip];\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 9:\n\t\t\t\tlet _this5 = this.vm.intStack;\n\t\t\t\tlet k3 = _this5.head;\n\t\t\t\tlet tmp3;\n\t\t\t\tif(k3 == null) {\n\t\t\t\t\ttmp3 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this5.head = k3.next;\n\t\t\t\t\ttmp3 = k3.elt;\n\t\t\t\t}\n\t\t\t\tif(tmp3 <= 0) {\n\t\t\t\t\t++ip;\n\t\t\t\t} else {\n\t\t\t\t\tip = this.codeStream[ip];\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 10:\n\t\t\t\tlet _this6 = this.vm.intStack;\n\t\t\t\tif((_this6.head == null ? null : _this6.head.elt) > 0) {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\tlet k = _this.head;\n\t\t\t\t\tif(k != null) {\n\t\t\t\t\t\t_this.head = k.next;\n\t\t\t\t\t}\n\t\t\t\t\t++ip;\n\t\t\t\t} else {\n\t\t\t\t\tip = this.codeStream[ip];\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 11:\n\t\t\t\tlet _this7 = this.vm.intStack;\n\t\t\t\tif((_this7.head == null ? null : _this7.head.elt) <= 0) {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\tlet k = _this.head;\n\t\t\t\t\tif(k != null) {\n\t\t\t\t\t\t_this.head = k.next;\n\t\t\t\t\t}\n\t\t\t\t\t++ip;\n\t\t\t\t} else {\n\t\t\t\t\tip = this.codeStream[ip];\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 12:\n\t\t\t\tip = this.codeStream[ip];\n\t\t\t\tbreak;\n\t\t\tcase 13:\n\t\t\t\tbreak _hx_loop3;\n\t\t\tcase 14:\n\t\t\t\tlet _this8 = this.vm.intStack;\n\t\t\t\tlet _this9 = this.vm.floatStack;\n\t\t\t\tlet k4 = _this9.head;\n\t\t\t\tlet item;\n\t\t\t\tif(k4 == null) {\n\t\t\t\t\titem = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this9.head = k4.next;\n\t\t\t\t\titem = k4.elt;\n\t\t\t\t}\n\t\t\t\tlet _this10 = this.vm.floatStack;\n\t\t\t\tlet k5 = _this10.head;\n\t\t\t\tlet item1;\n\t\t\t\tif(k5 == null) {\n\t\t\t\t\titem1 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this10.head = k5.next;\n\t\t\t\t\titem1 = k5.elt;\n\t\t\t\t}\n\t\t\t\t_this8.head = new haxe_ds_GenericCell(item == item1 ? 1 : 0,_this8.head);\n\t\t\t\tbreak;\n\t\t\tcase 15:\n\t\t\t\tlet _this11 = this.vm.intStack;\n\t\t\t\tlet _this12 = this.vm.floatStack;\n\t\t\t\tlet k6 = _this12.head;\n\t\t\t\tlet item2;\n\t\t\t\tif(k6 == null) {\n\t\t\t\t\titem2 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this12.head = k6.next;\n\t\t\t\t\titem2 = k6.elt;\n\t\t\t\t}\n\t\t\t\tlet _this13 = this.vm.floatStack;\n\t\t\t\tlet k7 = _this13.head;\n\t\t\t\tlet item3;\n\t\t\t\tif(k7 == null) {\n\t\t\t\t\titem3 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this13.head = k7.next;\n\t\t\t\t\titem3 = k7.elt;\n\t\t\t\t}\n\t\t\t\t_this11.head = new haxe_ds_GenericCell(item2 > item3 ? 1 : 0,_this11.head);\n\t\t\t\tbreak;\n\t\t\tcase 16:\n\t\t\t\tlet _this14 = this.vm.intStack;\n\t\t\t\tlet _this15 = this.vm.floatStack;\n\t\t\t\tlet k8 = _this15.head;\n\t\t\t\tlet item4;\n\t\t\t\tif(k8 == null) {\n\t\t\t\t\titem4 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this15.head = k8.next;\n\t\t\t\t\titem4 = k8.elt;\n\t\t\t\t}\n\t\t\t\tlet _this16 = this.vm.floatStack;\n\t\t\t\tlet k9 = _this16.head;\n\t\t\t\tlet item5;\n\t\t\t\tif(k9 == null) {\n\t\t\t\t\titem5 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this16.head = k9.next;\n\t\t\t\t\titem5 = k9.elt;\n\t\t\t\t}\n\t\t\t\t_this14.head = new haxe_ds_GenericCell(item4 >= item5 ? 1 : 0,_this14.head);\n\t\t\t\tbreak;\n\t\t\tcase 17:\n\t\t\t\tlet _this17 = this.vm.intStack;\n\t\t\t\tlet _this18 = this.vm.floatStack;\n\t\t\t\tlet k10 = _this18.head;\n\t\t\t\tlet item6;\n\t\t\t\tif(k10 == null) {\n\t\t\t\t\titem6 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this18.head = k10.next;\n\t\t\t\t\titem6 = k10.elt;\n\t\t\t\t}\n\t\t\t\tlet _this19 = this.vm.floatStack;\n\t\t\t\tlet k11 = _this19.head;\n\t\t\t\tlet item7;\n\t\t\t\tif(k11 == null) {\n\t\t\t\t\titem7 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this19.head = k11.next;\n\t\t\t\t\titem7 = k11.elt;\n\t\t\t\t}\n\t\t\t\t_this17.head = new haxe_ds_GenericCell(item6 < item7 ? 1 : 0,_this17.head);\n\t\t\t\tbreak;\n\t\t\tcase 18:\n\t\t\t\tlet _this20 = this.vm.intStack;\n\t\t\t\tlet _this21 = this.vm.floatStack;\n\t\t\t\tlet k12 = _this21.head;\n\t\t\t\tlet item8;\n\t\t\t\tif(k12 == null) {\n\t\t\t\t\titem8 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this21.head = k12.next;\n\t\t\t\t\titem8 = k12.elt;\n\t\t\t\t}\n\t\t\t\tlet _this22 = this.vm.floatStack;\n\t\t\t\tlet k13 = _this22.head;\n\t\t\t\tlet item9;\n\t\t\t\tif(k13 == null) {\n\t\t\t\t\titem9 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this22.head = k13.next;\n\t\t\t\t\titem9 = k13.elt;\n\t\t\t\t}\n\t\t\t\t_this20.head = new haxe_ds_GenericCell(item8 <= item9 ? 1 : 0,_this20.head);\n\t\t\t\tbreak;\n\t\t\tcase 19:\n\t\t\t\tlet _this23 = this.vm.intStack;\n\t\t\t\tlet _this24 = this.vm.floatStack;\n\t\t\t\tlet k14 = _this24.head;\n\t\t\t\tlet item10;\n\t\t\t\tif(k14 == null) {\n\t\t\t\t\titem10 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this24.head = k14.next;\n\t\t\t\t\titem10 = k14.elt;\n\t\t\t\t}\n\t\t\t\tlet _this25 = this.vm.floatStack;\n\t\t\t\tlet k15 = _this25.head;\n\t\t\t\tlet item11;\n\t\t\t\tif(k15 == null) {\n\t\t\t\t\titem11 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this25.head = k15.next;\n\t\t\t\t\titem11 = k15.elt;\n\t\t\t\t}\n\t\t\t\t_this23.head = new haxe_ds_GenericCell(item10 != item11 ? 1 : 0,_this23.head);\n\t\t\t\tbreak;\n\t\t\tcase 20:\n\t\t\t\tlet _this26 = this.vm.intStack;\n\t\t\t\tlet _this27 = this.vm.intStack;\n\t\t\t\tlet k16 = _this27.head;\n\t\t\t\tlet item12;\n\t\t\t\tif(k16 == null) {\n\t\t\t\t\titem12 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this27.head = k16.next;\n\t\t\t\t\titem12 = k16.elt;\n\t\t\t\t}\n\t\t\t\tlet _this28 = this.vm.intStack;\n\t\t\t\tlet k17 = _this28.head;\n\t\t\t\tlet item13;\n\t\t\t\tif(k17 == null) {\n\t\t\t\t\titem13 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this28.head = k17.next;\n\t\t\t\t\titem13 = k17.elt;\n\t\t\t\t}\n\t\t\t\t_this26.head = new haxe_ds_GenericCell(item12 ^ item13,_this26.head);\n\t\t\t\tbreak;\n\t\t\tcase 21:\n\t\t\t\tlet _this29 = this.vm.intStack;\n\t\t\t\tlet _this30 = this.vm.intStack;\n\t\t\t\tlet k18 = _this30.head;\n\t\t\t\tlet item14;\n\t\t\t\tif(k18 == null) {\n\t\t\t\t\titem14 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this30.head = k18.next;\n\t\t\t\t\titem14 = k18.elt;\n\t\t\t\t}\n\t\t\t\tlet _this31 = this.vm.intStack;\n\t\t\t\tlet k19 = _this31.head;\n\t\t\t\tlet item15;\n\t\t\t\tif(k19 == null) {\n\t\t\t\t\titem15 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this31.head = k19.next;\n\t\t\t\t\titem15 = k19.elt;\n\t\t\t\t}\n\t\t\t\t_this29.head = new haxe_ds_GenericCell(item14 % item15,_this29.head);\n\t\t\t\tbreak;\n\t\t\tcase 22:\n\t\t\t\tlet _this32 = this.vm.intStack;\n\t\t\t\tlet _this33 = this.vm.intStack;\n\t\t\t\tlet k20 = _this33.head;\n\t\t\t\tlet item16;\n\t\t\t\tif(k20 == null) {\n\t\t\t\t\titem16 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this33.head = k20.next;\n\t\t\t\t\titem16 = k20.elt;\n\t\t\t\t}\n\t\t\t\tlet _this34 = this.vm.intStack;\n\t\t\t\tlet k21 = _this34.head;\n\t\t\t\tlet item17;\n\t\t\t\tif(k21 == null) {\n\t\t\t\t\titem17 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this34.head = k21.next;\n\t\t\t\t\titem17 = k21.elt;\n\t\t\t\t}\n\t\t\t\t_this32.head = new haxe_ds_GenericCell(item16 & item17,_this32.head);\n\t\t\t\tbreak;\n\t\t\tcase 23:\n\t\t\t\tlet _this35 = this.vm.intStack;\n\t\t\t\tlet _this36 = this.vm.intStack;\n\t\t\t\tlet k22 = _this36.head;\n\t\t\t\tlet item18;\n\t\t\t\tif(k22 == null) {\n\t\t\t\t\titem18 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this36.head = k22.next;\n\t\t\t\t\titem18 = k22.elt;\n\t\t\t\t}\n\t\t\t\tlet _this37 = this.vm.intStack;\n\t\t\t\tlet k23 = _this37.head;\n\t\t\t\tlet item19;\n\t\t\t\tif(k23 == null) {\n\t\t\t\t\titem19 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this37.head = k23.next;\n\t\t\t\t\titem19 = k23.elt;\n\t\t\t\t}\n\t\t\t\t_this35.head = new haxe_ds_GenericCell(item18 | item19,_this35.head);\n\t\t\t\tbreak;\n\t\t\tcase 24:\n\t\t\t\tlet _this38 = this.vm.intStack;\n\t\t\t\tlet _this39 = this.vm.intStack;\n\t\t\t\tlet k24 = _this39.head;\n\t\t\t\tlet item20;\n\t\t\t\tif(k24 == null) {\n\t\t\t\t\titem20 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this39.head = k24.next;\n\t\t\t\t\titem20 = k24.elt;\n\t\t\t\t}\n\t\t\t\t_this38.head = new haxe_ds_GenericCell(item20 > 0 ? 0 : 1,_this38.head);\n\t\t\t\tbreak;\n\t\t\tcase 25:\n\t\t\t\tlet _this40 = this.vm.intStack;\n\t\t\t\tlet _this41 = this.vm.floatStack;\n\t\t\t\tlet k25 = _this41.head;\n\t\t\t\tlet item21;\n\t\t\t\tif(k25 == null) {\n\t\t\t\t\titem21 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this41.head = k25.next;\n\t\t\t\t\titem21 = k25.elt;\n\t\t\t\t}\n\t\t\t\t_this40.head = new haxe_ds_GenericCell(item21 > 0 ? 0 : 1,_this40.head);\n\t\t\t\tbreak;\n\t\t\tcase 26:\n\t\t\t\tlet _this42 = this.vm.intStack;\n\t\t\t\tlet _this43 = this.vm.intStack;\n\t\t\t\tlet k26 = _this43.head;\n\t\t\t\tlet item22;\n\t\t\t\tif(k26 == null) {\n\t\t\t\t\titem22 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this43.head = k26.next;\n\t\t\t\t\titem22 = k26.elt;\n\t\t\t\t}\n\t\t\t\t_this42.head = new haxe_ds_GenericCell(~item22,_this42.head);\n\t\t\t\tbreak;\n\t\t\tcase 27:\n\t\t\t\tlet _this44 = this.vm.intStack;\n\t\t\t\tlet _this45 = this.vm.intStack;\n\t\t\t\tlet k27 = _this45.head;\n\t\t\t\tlet item23;\n\t\t\t\tif(k27 == null) {\n\t\t\t\t\titem23 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this45.head = k27.next;\n\t\t\t\t\titem23 = k27.elt;\n\t\t\t\t}\n\t\t\t\tlet _this46 = this.vm.intStack;\n\t\t\t\tlet k28 = _this46.head;\n\t\t\t\tlet item24;\n\t\t\t\tif(k28 == null) {\n\t\t\t\t\titem24 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this46.head = k28.next;\n\t\t\t\t\titem24 = k28.elt;\n\t\t\t\t}\n\t\t\t\t_this44.head = new haxe_ds_GenericCell(item23 >> item24,_this44.head);\n\t\t\t\tbreak;\n\t\t\tcase 28:\n\t\t\t\tlet _this47 = this.vm.intStack;\n\t\t\t\tlet _this48 = this.vm.intStack;\n\t\t\t\tlet k29 = _this48.head;\n\t\t\t\tlet item25;\n\t\t\t\tif(k29 == null) {\n\t\t\t\t\titem25 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this48.head = k29.next;\n\t\t\t\t\titem25 = k29.elt;\n\t\t\t\t}\n\t\t\t\tlet _this49 = this.vm.intStack;\n\t\t\t\tlet k30 = _this49.head;\n\t\t\t\tlet item26;\n\t\t\t\tif(k30 == null) {\n\t\t\t\t\titem26 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this49.head = k30.next;\n\t\t\t\t\titem26 = k30.elt;\n\t\t\t\t}\n\t\t\t\t_this47.head = new haxe_ds_GenericCell(item25 << item26,_this47.head);\n\t\t\t\tbreak;\n\t\t\tcase 29:\n\t\t\t\tlet _this50 = this.vm.intStack;\n\t\t\t\tlet item27;\n\t\t\t\tlet _this51 = this.vm.intStack;\n\t\t\t\tlet k31 = _this51.head;\n\t\t\t\tlet item28;\n\t\t\t\tif(k31 == null) {\n\t\t\t\t\titem28 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this51.head = k31.next;\n\t\t\t\t\titem28 = k31.elt;\n\t\t\t\t}\n\t\t\t\tif(item28 > 0) {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\tlet k = _this.head;\n\t\t\t\t\tlet item;\n\t\t\t\t\tif(k == null) {\n\t\t\t\t\t\titem = null;\n\t\t\t\t\t} else {\n\t\t\t\t\t\t_this.head = k.next;\n\t\t\t\t\t\titem = k.elt;\n\t\t\t\t\t}\n\t\t\t\t\titem27 = item > 0;\n\t\t\t\t} else {\n\t\t\t\t\titem27 = false;\n\t\t\t\t}\n\t\t\t\t_this50.head = new haxe_ds_GenericCell(item27 ? 1 : 0,_this50.head);\n\t\t\t\tbreak;\n\t\t\tcase 30:\n\t\t\t\tlet _this52 = this.vm.intStack;\n\t\t\t\tlet item29;\n\t\t\t\tlet _this53 = this.vm.intStack;\n\t\t\t\tlet k32 = _this53.head;\n\t\t\t\tlet item30;\n\t\t\t\tif(k32 == null) {\n\t\t\t\t\titem30 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this53.head = k32.next;\n\t\t\t\t\titem30 = k32.elt;\n\t\t\t\t}\n\t\t\t\tif(item30 <= 0) {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\tlet k = _this.head;\n\t\t\t\t\tlet item;\n\t\t\t\t\tif(k == null) {\n\t\t\t\t\t\titem = null;\n\t\t\t\t\t} else {\n\t\t\t\t\t\t_this.head = k.next;\n\t\t\t\t\t\titem = k.elt;\n\t\t\t\t\t}\n\t\t\t\t\titem29 = item > 0;\n\t\t\t\t} else {\n\t\t\t\t\titem29 = true;\n\t\t\t\t}\n\t\t\t\t_this52.head = new haxe_ds_GenericCell(item29 ? 1 : 0,_this52.head);\n\t\t\t\tbreak;\n\t\t\tcase 31:\n\t\t\t\tlet _this54 = this.vm.floatStack;\n\t\t\t\tlet _this55 = this.vm.floatStack;\n\t\t\t\tlet k33 = _this55.head;\n\t\t\t\tlet item31;\n\t\t\t\tif(k33 == null) {\n\t\t\t\t\titem31 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this55.head = k33.next;\n\t\t\t\t\titem31 = k33.elt;\n\t\t\t\t}\n\t\t\t\tlet _this56 = this.vm.floatStack;\n\t\t\t\tlet k34 = _this56.head;\n\t\t\t\tlet item32;\n\t\t\t\tif(k34 == null) {\n\t\t\t\t\titem32 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this56.head = k34.next;\n\t\t\t\t\titem32 = k34.elt;\n\t\t\t\t}\n\t\t\t\t_this54.head = new haxe_ds_GenericCell(item31 + item32,_this54.head);\n\t\t\t\tbreak;\n\t\t\tcase 32:\n\t\t\t\tlet _this57 = this.vm.floatStack;\n\t\t\t\tlet _this58 = this.vm.floatStack;\n\t\t\t\tlet k35 = _this58.head;\n\t\t\t\tlet item33;\n\t\t\t\tif(k35 == null) {\n\t\t\t\t\titem33 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this58.head = k35.next;\n\t\t\t\t\titem33 = k35.elt;\n\t\t\t\t}\n\t\t\t\tlet _this59 = this.vm.floatStack;\n\t\t\t\tlet k36 = _this59.head;\n\t\t\t\tlet item34;\n\t\t\t\tif(k36 == null) {\n\t\t\t\t\titem34 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this59.head = k36.next;\n\t\t\t\t\titem34 = k36.elt;\n\t\t\t\t}\n\t\t\t\t_this57.head = new haxe_ds_GenericCell(item33 - item34,_this57.head);\n\t\t\t\tbreak;\n\t\t\tcase 33:\n\t\t\t\tlet _this60 = this.vm.floatStack;\n\t\t\t\tlet _this61 = this.vm.floatStack;\n\t\t\t\tlet k37 = _this61.head;\n\t\t\t\tlet item35;\n\t\t\t\tif(k37 == null) {\n\t\t\t\t\titem35 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this61.head = k37.next;\n\t\t\t\t\titem35 = k37.elt;\n\t\t\t\t}\n\t\t\t\tlet _this62 = this.vm.floatStack;\n\t\t\t\tlet k38 = _this62.head;\n\t\t\t\tlet item36;\n\t\t\t\tif(k38 == null) {\n\t\t\t\t\titem36 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this62.head = k38.next;\n\t\t\t\t\titem36 = k38.elt;\n\t\t\t\t}\n\t\t\t\t_this60.head = new haxe_ds_GenericCell(item35 * item36,_this60.head);\n\t\t\t\tbreak;\n\t\t\tcase 34:\n\t\t\t\tlet _this63 = this.vm.floatStack;\n\t\t\t\tlet _this64 = this.vm.floatStack;\n\t\t\t\tlet k39 = _this64.head;\n\t\t\t\tlet item37;\n\t\t\t\tif(k39 == null) {\n\t\t\t\t\titem37 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this64.head = k39.next;\n\t\t\t\t\titem37 = k39.elt;\n\t\t\t\t}\n\t\t\t\tlet _this65 = this.vm.floatStack;\n\t\t\t\tlet k40 = _this65.head;\n\t\t\t\tlet item38;\n\t\t\t\tif(k40 == null) {\n\t\t\t\t\titem38 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this65.head = k40.next;\n\t\t\t\t\titem38 = k40.elt;\n\t\t\t\t}\n\t\t\t\t_this63.head = new haxe_ds_GenericCell(item37 / item38,_this63.head);\n\t\t\t\tbreak;\n\t\t\tcase 35:\n\t\t\t\tlet _this66 = this.vm.floatStack;\n\t\t\t\tlet _this67 = this.vm.floatStack;\n\t\t\t\tlet k41 = _this67.head;\n\t\t\t\tlet item39;\n\t\t\t\tif(k41 == null) {\n\t\t\t\t\titem39 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this67.head = k41.next;\n\t\t\t\t\titem39 = k41.elt;\n\t\t\t\t}\n\t\t\t\t_this66.head = new haxe_ds_GenericCell(-item39,_this66.head);\n\t\t\t\tbreak;\n\t\t\tcase 36:\n\t\t\t\tlet varName = this.identMap.h[this.codeStream[ip++]];\n\t\t\t\tthis.vm.evalState.setCurVarName(varName);\n\t\t\t\tbreak;\n\t\t\tcase 37:\n\t\t\t\tlet varName1 = this.identMap.h[this.codeStream[ip++]];\n\t\t\t\tthis.vm.evalState.setCurVarNameCreate(varName1);\n\t\t\t\tbreak;\n\t\t\tcase 38:\n\t\t\t\tlet varName2 = this.vm.STR.getSTValue();\n\t\t\t\tthis.vm.evalState.setCurVarName(varName2);\n\t\t\t\tbreak;\n\t\t\tcase 39:\n\t\t\t\tlet varName3 = this.vm.STR.getSTValue();\n\t\t\t\tthis.vm.evalState.setCurVarNameCreate(varName3);\n\t\t\t\tbreak;\n\t\t\tcase 40:\n\t\t\t\tlet _this68 = this.vm.intStack;\n\t\t\t\t_this68.head = new haxe_ds_GenericCell(this.vm.evalState.getIntVariable(),_this68.head);\n\t\t\t\tbreak;\n\t\t\tcase 41:\n\t\t\t\tlet _this69 = this.vm.floatStack;\n\t\t\t\t_this69.head = new haxe_ds_GenericCell(this.vm.evalState.getFloatVariable(),_this69.head);\n\t\t\t\tbreak;\n\t\t\tcase 42:\n\t\t\t\tthis.vm.STR.setStringValue(this.vm.evalState.getStringVariable());\n\t\t\t\tbreak;\n\t\t\tcase 43:\n\t\t\t\tlet _this70 = this.vm.intStack;\n\t\t\t\tthis.vm.evalState.setIntVariable(_this70.head == null ? null : _this70.head.elt);\n\t\t\t\tbreak;\n\t\t\tcase 44:\n\t\t\t\tlet _this71 = this.vm.floatStack;\n\t\t\t\tthis.vm.evalState.setFloatVariable(_this71.head == null ? null : _this71.head.elt);\n\t\t\t\tbreak;\n\t\t\tcase 45:\n\t\t\t\tthis.vm.evalState.setStringVariable(this.vm.STR.getSTValue());\n\t\t\t\tbreak;\n\t\t\tcase 46:\n\t\t\t\tlet this1 = this.vm.simObjects;\n\t\t\t\tlet key = this.vm.STR.getSTValue();\n\t\t\t\tcurObject = this1.h[key];\n\t\t\t\tif(curObject == null) {\n\t\t\t\t\tlet this1 = this.vm.idMap;\n\t\t\t\t\tlet key = Std.parseInt(this.vm.STR.getSTValue());\n\t\t\t\t\tcurObject = this1.h[key];\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 47:\n\t\t\t\tcurObject = currentNewObject;\n\t\t\t\tbreak;\n\t\t\tcase 48:\n\t\t\t\tcurField = this.identMap.h[this.codeStream[ip++]];\n\t\t\t\tcurFieldArrayIndex = null;\n\t\t\t\tbreak;\n\t\t\tcase 49:\n\t\t\t\tcurFieldArrayIndex = this.vm.STR.getSTValue();\n\t\t\t\tbreak;\n\t\t\tcase 50:\n\t\t\t\tif(curObject != null) {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\t_this.head = new haxe_ds_GenericCell(parseFloat(curObject.getDataField(curField,curFieldArrayIndex)),_this.head);\n\t\t\t\t} else {\n\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\t_this.head = new haxe_ds_GenericCell(0,_this.head);\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 51:\n\t\t\t\tif(curObject != null) {\n\t\t\t\t\tlet _this = this.vm.floatStack;\n\t\t\t\t\t_this.head = new haxe_ds_GenericCell(parseFloat(curObject.getDataField(curField,curFieldArrayIndex)),_this.head);\n\t\t\t\t} else {\n\t\t\t\t\tlet _this = this.vm.floatStack;\n\t\t\t\t\t_this.head = new haxe_ds_GenericCell(0,_this.head);\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 52:\n\t\t\t\tif(curObject != null) {\n\t\t\t\t\tthis.vm.STR.setStringValue(curObject.getDataField(curField,curFieldArrayIndex));\n\t\t\t\t} else {\n\t\t\t\t\tthis.vm.STR.setStringValue(\"\");\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 53:\n\t\t\t\tlet _this72 = this.vm.intStack;\n\t\t\t\tthis.vm.STR.setIntValue(_this72.head == null ? null : _this72.head.elt);\n\t\t\t\tif(curObject != null) {\n\t\t\t\t\tcurObject.setDataField(curField,curFieldArrayIndex,this.vm.STR.getSTValue());\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 54:\n\t\t\t\tlet _this73 = this.vm.floatStack;\n\t\t\t\tthis.vm.STR.setFloatValue(_this73.head == null ? null : _this73.head.elt);\n\t\t\t\tif(curObject != null) {\n\t\t\t\t\tcurObject.setDataField(curField,curFieldArrayIndex,this.vm.STR.getSTValue());\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 55:\n\t\t\t\tif(curObject != null) {\n\t\t\t\t\tcurObject.setDataField(curField,curFieldArrayIndex,this.vm.STR.getSTValue());\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 56:\n\t\t\t\tlet _this74 = this.vm.intStack;\n\t\t\t\t_this74.head = new haxe_ds_GenericCell(this.vm.STR.getIntValue(),_this74.head);\n\t\t\t\tbreak;\n\t\t\tcase 57:\n\t\t\t\tlet _this75 = this.vm.floatStack;\n\t\t\t\t_this75.head = new haxe_ds_GenericCell(this.vm.STR.getFloatValue(),_this75.head);\n\t\t\t\tbreak;\n\t\t\tcase 58:\n\t\t\t\tbreak;\n\t\t\tcase 59:\n\t\t\t\tlet _this76 = this.vm.intStack;\n\t\t\t\tlet _this77 = this.vm.floatStack;\n\t\t\t\tlet k42 = _this77.head;\n\t\t\t\tlet item40;\n\t\t\t\tif(k42 == null) {\n\t\t\t\t\titem40 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this77.head = k42.next;\n\t\t\t\t\titem40 = k42.elt;\n\t\t\t\t}\n\t\t\t\t_this76.head = new haxe_ds_GenericCell(item40,_this76.head);\n\t\t\t\tbreak;\n\t\t\tcase 60:\n\t\t\t\tlet _this78 = this.vm.floatStack;\n\t\t\t\tlet k43 = _this78.head;\n\t\t\t\tlet tmp4;\n\t\t\t\tif(k43 == null) {\n\t\t\t\t\ttmp4 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this78.head = k43.next;\n\t\t\t\t\ttmp4 = k43.elt;\n\t\t\t\t}\n\t\t\t\tthis.vm.STR.setFloatValue(tmp4);\n\t\t\t\tbreak;\n\t\t\tcase 61:\n\t\t\t\tlet _this79 = this.vm.floatStack;\n\t\t\t\tlet k44 = _this79.head;\n\t\t\t\tif(k44 != null) {\n\t\t\t\t\t_this79.head = k44.next;\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 62:\n\t\t\t\tlet _this80 = this.vm.floatStack;\n\t\t\t\tlet _this81 = this.vm.intStack;\n\t\t\t\tlet k45 = _this81.head;\n\t\t\t\tlet item41;\n\t\t\t\tif(k45 == null) {\n\t\t\t\t\titem41 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this81.head = k45.next;\n\t\t\t\t\titem41 = k45.elt;\n\t\t\t\t}\n\t\t\t\t_this80.head = new haxe_ds_GenericCell(item41,_this80.head);\n\t\t\t\tbreak;\n\t\t\tcase 63:\n\t\t\t\tlet _this82 = this.vm.intStack;\n\t\t\t\tlet k46 = _this82.head;\n\t\t\t\tlet tmp5;\n\t\t\t\tif(k46 == null) {\n\t\t\t\t\ttmp5 = null;\n\t\t\t\t} else {\n\t\t\t\t\t_this82.head = k46.next;\n\t\t\t\t\ttmp5 = k46.elt;\n\t\t\t\t}\n\t\t\t\tthis.vm.STR.setIntValue(tmp5);\n\t\t\t\tbreak;\n\t\t\tcase 64:\n\t\t\t\tlet _this83 = this.vm.intStack;\n\t\t\t\tlet k47 = _this83.head;\n\t\t\t\tif(k47 != null) {\n\t\t\t\t\t_this83.head = k47.next;\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 65:\n\t\t\t\tlet _this84 = this.vm.intStack;\n\t\t\t\t_this84.head = new haxe_ds_GenericCell(this.codeStream[ip++],_this84.head);\n\t\t\t\tbreak;\n\t\t\tcase 66:\n\t\t\t\tlet _this85 = this.vm.floatStack;\n\t\t\t\t_this85.head = new haxe_ds_GenericCell(currentFloatTable[this.codeStream[ip++]],_this85.head);\n\t\t\t\tbreak;\n\t\t\tcase 67:\n\t\t\t\tthis.codeStream[ip - 1] = 68;\n\t\t\t\tif(HxOverrides.cca(this.getStringTableValue(currentStringTable,this.codeStream[ip]),0) != 1) {\n\t\t\t\t\tlet id = this.vm.taggedStrings.length;\n\t\t\t\t\tthis.vm.taggedStrings.push(this.getStringTableValue(currentStringTable,this.codeStream[ip]));\n\t\t\t\t\tlet idStr = \"\" + id;\n\t\t\t\t\tlet before = currentStringTable.substring(0,this.codeStream[ip]);\n\t\t\t\t\tlet after = currentStringTable.substring(this.codeStream[ip] + 8);\n\t\t\t\t\tlet insert = StringTools.rpad(\"\\x01\" + idStr,\"\\x00\",7);\n\t\t\t\t\tcurrentStringTable = before + insert + after;\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 68:\n\t\t\t\tthis.vm.STR.setStringValue(this.getStringTableValue(currentStringTable,this.codeStream[ip++]));\n\t\t\t\tbreak;\n\t\t\tcase 69:\n\t\t\t\tthis.vm.STR.setStringValue(this.identMap.h[this.codeStream[ip++]]);\n\t\t\t\tbreak;\n\t\t\tcase 70:\n\t\t\t\tlet fnNamespace = this.identMap.h[this.codeStream[ip + 1]];\n\t\t\t\tlet fnName = this.identMap.h[this.codeStream[ip]];\n\t\t\t\tlet nsEntry = this.vm.findFunction(fnNamespace,fnName);\n\t\t\t\tif(nsEntry == null) {\n\t\t\t\t\tip += 3;\n\t\t\t\t\tLog.println(\"Unable to find function \" + fnNamespace + \"::\" + fnName);\n\t\t\t\t\tthis.vm.STR.getArgs(fnName);\n\t\t\t\t\tcontinue;\n\t\t\t\t}\n\t\t\t\tthis.codeStream[ip - 1] = 71;\n\t\t\t\tthis.codeStream[ip + 1] = this.resolveFuncId;\n\t\t\t\tthis.resolveFuncMap.h[this.resolveFuncId] = nsEntry;\n\t\t\t\tthis.resolveFuncId++;\n\t\t\t\t--ip;\n\t\t\t\tcontinue;\n\t\t\tcase 71:\n\t\t\t\tlet fnName1 = this.identMap.h[this.codeStream[ip]];\n\t\t\t\tlet callType = this.codeStream[ip + 2];\n\t\t\t\tip += 3;\n\t\t\t\tcallArgs = this.vm.STR.getArgs(fnName1);\n\t\t\t\tlet nsEntry1 = null;\n\t\t\t\tlet ns = null;\n\t\t\t\tif(callType == 0) {\n\t\t\t\t\tnsEntry1 = this.resolveFuncMap.h[this.codeStream[ip - 2]];\n\t\t\t\t} else if(callType == 1) {\n\t\t\t\t\tsaveObj = this.vm.evalState.thisObject;\n\t\t\t\t\tthis.vm.evalState.thisObject = this.vm.simObjects.h[callArgs[1]];\n\t\t\t\t\tif(this.vm.evalState.thisObject == null) {\n\t\t\t\t\t\tthis.vm.evalState.thisObject = this.vm.idMap.h[Std.parseInt(callArgs[1])];\n\t\t\t\t\t}\n\t\t\t\t\tif(this.vm.evalState.thisObject == null) {\n\t\t\t\t\t\tLog.println(\"Unable to find object \" + callArgs[1] + \" attempting to call function \" + fnName1);\n\t\t\t\t\t\tcontinue;\n\t\t\t\t\t}\n\t\t\t\t\tnsEntry1 = this.vm.findFunction(this.vm.evalState.thisObject.getClassName(),fnName1);\n\t\t\t\t\tns = nsEntry1 != null ? nsEntry1.namespace : null;\n\t\t\t\t} else if(namespace != null) {\n\t\t\t\t\tns = namespace.parent;\n\t\t\t\t\tif(ns != null) {\n\t\t\t\t\t\tnsEntry1 = ns.find(fnName1);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tnsEntry1 = null;\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tns = null;\n\t\t\t\t\tnsEntry1 = null;\n\t\t\t\t}\n\t\t\t\tif(nsEntry1 == null || noCalls) {\n\t\t\t\t\tif(!noCalls) {\n\t\t\t\t\t\tLog.println(\"Unable to find function \" + fnName1);\n\t\t\t\t\t}\n\t\t\t\t\tthis.vm.STR.setStringValue(\"\");\n\t\t\t\t}\n\t\t\t\tlet _g = nsEntry1.type;\n\t\t\t\tif(_g._hx_index == 0) {\n\t\t\t\t\tlet functionOffset = _g.functionOffset;\n\t\t\t\t\tlet codeBlock = _g.codeBlock;\n\t\t\t\t\tif(functionOffset != 0) {\n\t\t\t\t\t\tcodeBlock.exec(functionOffset,fnName1,nsEntry1.namespace,callArgs,false,nsEntry1.pkg);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tthis.vm.STR.setStringValue(\"\");\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tlet x = _g;\n\t\t\t\t\tif(nsEntry1.minArgs > 0 && callArgs.length < nsEntry1.minArgs || nsEntry1.maxArgs > 0 && callArgs.length > nsEntry1.maxArgs) {\n\t\t\t\t\t\tLog.println(\"Invalid argument count for function \" + fnName1);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tswitch(x._hx_index) {\n\t\t\t\t\t\tcase 0:\n\t\t\t\t\t\t\tlet _g1 = x.functionOffset;\n\t\t\t\t\t\t\tlet _g2 = x.codeBlock;\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\tcase 1:\n\t\t\t\t\t\t\tlet callback = x.callback;\n\t\t\t\t\t\t\tlet vargs = [];\n\t\t\t\t\t\t\tlet _g3 = 0;\n\t\t\t\t\t\t\twhile(_g3 < callArgs.length) {\n\t\t\t\t\t\t\t\tlet arg = callArgs[_g3];\n\t\t\t\t\t\t\t\t++_g3;\n\t\t\t\t\t\t\t\tlet v = new Variable(\"param\",this.vm);\n\t\t\t\t\t\t\t\tv.setStringValue(arg);\n\t\t\t\t\t\t\t\tvargs.push(v);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tlet ret = callback(vargs);\n\t\t\t\t\t\t\tif(this.codeStream[ip] == 56) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(Std.parseInt(ret),_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 57) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.floatStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(parseFloat(ret),_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 58) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tthis.vm.STR.setStringValue(ret);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\tcase 2:\n\t\t\t\t\t\t\tlet callback1 = x.callback;\n\t\t\t\t\t\t\tlet ret1 = callback1(this.vm,this.vm.evalState.thisObject,callArgs);\n\t\t\t\t\t\t\tif(this.codeStream[ip] == 56) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(ret1,_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 57) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.floatStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(ret1,_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 58) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tthis.vm.STR.setIntValue(ret1);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\tcase 3:\n\t\t\t\t\t\t\tlet callback2 = x.callback;\n\t\t\t\t\t\t\tlet ret2 = callback2(this.vm,this.vm.evalState.thisObject,callArgs);\n\t\t\t\t\t\t\tif(this.codeStream[ip] == 56) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(ret2,_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 57) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.floatStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(ret2,_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 58) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tthis.vm.STR.setFloatValue(ret2);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\tcase 4:\n\t\t\t\t\t\t\tlet callback3 = x.callback;\n\t\t\t\t\t\t\tlet ret3 = callback3(this.vm,this.vm.evalState.thisObject,callArgs);\n\t\t\t\t\t\t\tif(ret3 != this.vm.STR.getSTValue()) {\n\t\t\t\t\t\t\t\tthis.vm.STR.setStringValue(ret3);\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tthis.vm.STR.setLen(ret3.length);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\tcase 5:\n\t\t\t\t\t\t\tlet callback4 = x.callback;\n\t\t\t\t\t\t\tcallback4(this.vm,this.vm.evalState.thisObject,callArgs);\n\t\t\t\t\t\t\tif(this.codeStream[ip] != 58) {\n\t\t\t\t\t\t\t\tLog.println(\"Call to \" + fnName1 + \" uses result of void function call\");\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tthis.vm.STR.setStringValue(\"\");\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\tcase 6:\n\t\t\t\t\t\t\tlet callback5 = x.callback;\n\t\t\t\t\t\t\tlet ret4 = callback5(this.vm,this.vm.evalState.thisObject,callArgs);\n\t\t\t\t\t\t\tif(this.codeStream[ip] == 56) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.intStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(ret4,_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 57) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t\tlet _this = this.vm.floatStack;\n\t\t\t\t\t\t\t\t_this.head = new haxe_ds_GenericCell(ret4,_this.head);\n\t\t\t\t\t\t\t} else if(this.codeStream[ip] == 58) {\n\t\t\t\t\t\t\t\t++ip;\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tthis.vm.STR.setIntValue(ret4);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tif(callType == 1) {\n\t\t\t\t\t\tthis.vm.evalState.thisObject = saveObj;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 72:\n\t\t\t\tbreak;\n\t\t\tcase 73:\n\t\t\t\tthis.vm.STR.advance();\n\t\t\t\tbreak;\n\t\t\tcase 74:\n\t\t\t\tthis.vm.STR.advanceChar(this.codeStream[ip++]);\n\t\t\t\tbreak;\n\t\t\tcase 75:\n\t\t\t\tthis.vm.STR.advanceChar(HxOverrides.cca(\"_\",0));\n\t\t\t\tbreak;\n\t\t\tcase 76:\n\t\t\t\tthis.vm.STR.advanceChar(0);\n\t\t\t\tbreak;\n\t\t\tcase 77:\n\t\t\t\tthis.vm.STR.rewind();\n\t\t\t\tbreak;\n\t\t\tcase 78:\n\t\t\t\tthis.vm.STR.rewindTerminate();\n\t\t\t\tbreak;\n\t\t\tcase 79:\n\t\t\t\tlet _this86 = this.vm.intStack;\n\t\t\t\t_this86.head = new haxe_ds_GenericCell(this.vm.STR.compare() ? 1 : 0,_this86.head);\n\t\t\t\tbreak;\n\t\t\tcase 80:\n\t\t\t\tthis.vm.STR.push();\n\t\t\t\tbreak;\n\t\t\tcase 81:\n\t\t\t\tthis.vm.STR.pushFrame();\n\t\t\t\tbreak;\n\t\t\tcase 82:\n\t\t\t\tbreakContinue = true;\n\t\t\t\tbreakContinueIns = instruction;\n\t\t\t\tbreak;\n\t\t\tcase 83:\n\t\t\t\tbreak _hx_loop3;\n\t\t\t}\n\t\t}\n\t\tif(fnArgs.length != 0) {\n\t\t\tthis.vm.evalState.popFrame();\n\t\t\tif(this.vm.traceOn) {\n\t\t\t\tLog.print(\"Leaving \");\n\t\t\t\tif(packageName != null) {\n\t\t\t\t\tLog.print(\"[\" + packageName + \"] \");\n\t\t\t\t}\n\t\t\t\tif(namespace != null && namespace.name != null) {\n\t\t\t\t\tLog.println(\"\" + namespace.name + \"::\" + thisFunctionName + \"() - return \" + this.vm.STR.getSTValue());\n\t\t\t\t} else {\n\t\t\t\t\tLog.println(\"\" + thisFunctionName + \"() - return \" + this.vm.STR.getSTValue());\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn this.vm.STR.getSTValue();\n\t}\n}\n$hx_exports[\"CodeBlock\"] = CodeBlock;\nCodeBlock.__name__ = true;\nObject.assign(CodeBlock.prototype, {\n\t__class__: CodeBlock\n});\nvar ConstTable = $hxEnums[\"ConstTable\"] = { __ename__:true,__constructs__:null\n\t,StringTable: {_hx_name:\"StringTable\",_hx_index:0,__enum__:\"ConstTable\",toString:$estr}\n\t,FloatTable: {_hx_name:\"FloatTable\",_hx_index:1,__enum__:\"ConstTable\",toString:$estr}\n};\nConstTable.__constructs__ = [ConstTable.StringTable,ConstTable.FloatTable];\nvar ConstTableType = $hxEnums[\"ConstTableType\"] = { __ename__:true,__constructs__:null\n\t,Global: {_hx_name:\"Global\",_hx_index:0,__enum__:\"ConstTableType\",toString:$estr}\n\t,Function: {_hx_name:\"Function\",_hx_index:1,__enum__:\"ConstTableType\",toString:$estr}\n};\nConstTableType.__constructs__ = [ConstTableType.Global,ConstTableType.Function];\nclass StringTableEntry {\n\tconstructor(s,start,len,tag) {\n\t\tthis.string = s;\n\t\tthis.start = start;\n\t\tthis.len = len;\n\t\tthis.tag = tag;\n\t}\n}\nStringTableEntry.__name__ = true;\nObject.assign(StringTableEntry.prototype, {\n\t__class__: StringTableEntry\n});\nclass StringTable {\n\tconstructor() {\n\t\tthis.stringToIndex = new haxe_ds_StringMap();\n\t\tthis.entries = [];\n\t\tthis.totalLen = 0;\n\t}\n\tadd(str,caseSens,tag) {\n\t\tif(Object.prototype.hasOwnProperty.call(this.stringToIndex.h,caseSens ? str : str.toLowerCase())) {\n\t\t\treturn this.stringToIndex.h[caseSens ? str : str.toLowerCase()];\n\t\t}\n\t\tlet len = str.length + 1;\n\t\tif(tag && len < 7) {\n\t\t\tlen = 7;\n\t\t}\n\t\tlet addEntry = new StringTableEntry(str,this.totalLen,len,tag);\n\t\tthis.entries.push(addEntry);\n\t\tthis.totalLen += len;\n\t\tthis.stringToIndex.h[caseSens ? str : str.toLowerCase()] = addEntry.start;\n\t\treturn addEntry.start;\n\t}\n\twrite(bytesData) {\n\t\tbytesData.addInt32(this.totalLen);\n\t\tlet _g = 0;\n\t\tlet _g1 = this.entries;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet entry = _g1[_g];\n\t\t\t++_g;\n\t\t\tlet _g2 = 0;\n\t\t\tlet _g3 = entry.string.length;\n\t\t\twhile(_g2 < _g3) {\n\t\t\t\tlet c = _g2++;\n\t\t\t\tbytesData.addByte(HxOverrides.cca(entry.string,c));\n\t\t\t}\n\t\t\tbytesData.addByte(0);\n\t\t\tif(entry.len > entry.string.length) {\n\t\t\t\tlet _g = 0;\n\t\t\t\tlet _g1 = entry.len - entry.string.length - 1;\n\t\t\t\twhile(_g < _g1) {\n\t\t\t\t\tlet i = _g++;\n\t\t\t\t\tbytesData.addByte(0);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\tread(bytesInput) {\n\t\tthis.totalLen = bytesInput.readInt32();\n\t\tlet currentStr = \"\";\n\t\tlet curStrLen = 0;\n\t\tlet curStrStart = 0;\n\t\tlet _g = 0;\n\t\tlet _g1 = this.totalLen;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet c = bytesInput.readByte();\n\t\t\tif(c == 0) {\n\t\t\t\tlet entry = new StringTableEntry(currentStr,curStrStart,curStrLen + 1,false);\n\t\t\t\tcurStrLen = 0;\n\t\t\t\tcurrentStr = \"\";\n\t\t\t\tcurStrStart = i + 1;\n\t\t\t\tthis.entries.push(entry);\n\t\t\t} else {\n\t\t\t\tcurrentStr += String.fromCodePoint(c);\n\t\t\t\t++curStrLen;\n\t\t\t}\n\t\t}\n\t}\n}\nStringTable.__name__ = true;\nObject.assign(StringTable.prototype, {\n\t__class__: StringTable\n});\nclass IdentTable {\n\tconstructor() {\n\t\tthis.ipToIdentMap = new haxe_ds_IntMap();\n\t\tthis.identMap = new haxe_ds_IntMap();\n\t}\n\tadd(compiler,ste,ip) {\n\t\tlet index = compiler.globalStringTable.add(ste,false,false);\n\t\tif(this.identMap.h.hasOwnProperty(index)) {\n\t\t\tthis.identMap.h[index].push(ip);\n\t\t} else {\n\t\t\tthis.identMap.h[index] = [ip];\n\t\t}\n\t\tthis.ipToIdentMap.h[ip] = ste;\n\t}\n\twrite(bytesData) {\n\t\tlet count = 0;\n\t\tlet kv = this.identMap.iterator();\n\t\twhile(kv.hasNext()) {\n\t\t\tlet kv1 = kv.next();\n\t\t\t++count;\n\t\t}\n\t\tbytesData.addInt32(count);\n\t\tlet map = this.identMap;\n\t\tlet kv_map = map;\n\t\tlet kv_keys = map.keys();\n\t\twhile(kv_keys.hasNext()) {\n\t\t\tlet key = kv_keys.next();\n\t\t\tlet kv_value = kv_map.get(key);\n\t\t\tlet kv_key = key;\n\t\t\tbytesData.addInt32(kv_key);\n\t\t\tbytesData.addInt32(kv_value.length);\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = kv_value;\n\t\t\twhile(_g < _g1.length) {\n\t\t\t\tlet i = _g1[_g];\n\t\t\t\t++_g;\n\t\t\t\tbytesData.addInt32(i);\n\t\t\t}\n\t\t}\n\t}\n\tread(bytesInput) {\n\t\tlet count = bytesInput.readInt32();\n\t\tlet _g = 0;\n\t\tlet _g1 = count;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet key = bytesInput.readInt32();\n\t\t\tlet len = bytesInput.readInt32();\n\t\t\tlet arr = [];\n\t\t\tlet _g1 = 0;\n\t\t\tlet _g2 = len;\n\t\t\twhile(_g1 < _g2) {\n\t\t\t\tlet j = _g1++;\n\t\t\t\tarr.push(bytesInput.readInt32());\n\t\t\t}\n\t\t\tthis.identMap.h[key] = arr;\n\t\t}\n\t}\n}\nIdentTable.__name__ = true;\nObject.assign(IdentTable.prototype, {\n\t__class__: IdentTable\n});\nclass Compiler {\n\tconstructor() {\n\t\tthis.functionStringTable = new StringTable();\n\t\tthis.globalStringTable = new StringTable();\n\t\tthis.functionFloatTable = [];\n\t\tthis.globalFloatTable = [];\n\t\tthis.dsoVersion = 33;\n\t\tthis.inFunction = false;\n\t\tthis.breakLineCount = 0;\n\t\tthis.currentFloatTable = this.globalFloatTable;\n\t\tthis.currentStringTable = this.globalStringTable;\n\t\tthis.identTable = new IdentTable();\n\t}\n\tprecompileIdent(ident) {\n\t\tif(ident != null) {\n\t\t\tthis.globalStringTable.add(ident,false,false);\n\t\t}\n\t}\n\tcompileIdent(ident,ip) {\n\t\tif(ident != null) {\n\t\t\tthis.identTable.add(this,ident,ip);\n\t\t}\n\t\treturn 0;\n\t}\n\taddIntString(value) {\n\t\treturn this.currentStringTable.add(\"\" + value,true,false);\n\t}\n\taddFloatString(value) {\n\t\treturn this.currentStringTable.add(\"\" + value,true,false);\n\t}\n\taddFloat(value) {\n\t\tif(this.currentFloatTable.includes(value)) {\n\t\t\treturn this.currentFloatTable.indexOf(value);\n\t\t} else {\n\t\t\tthis.currentFloatTable.push(value);\n\t\t\treturn this.currentFloatTable.length - 1;\n\t\t}\n\t}\n\taddString(value,caseSens,tag) {\n\t\treturn this.currentStringTable.add(value,caseSens,tag);\n\t}\n\tsetTable(target,prop) {\n\t\tswitch(target._hx_index) {\n\t\tcase 0:\n\t\t\tswitch(prop._hx_index) {\n\t\t\tcase 0:\n\t\t\t\tthis.currentStringTable = this.globalStringTable;\n\t\t\t\tbreak;\n\t\t\tcase 1:\n\t\t\t\tthis.currentStringTable = this.functionStringTable;\n\t\t\t\tbreak;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tswitch(prop._hx_index) {\n\t\t\tcase 0:\n\t\t\t\tthis.currentFloatTable = this.globalFloatTable;\n\t\t\t\tbreak;\n\t\t\tcase 1:\n\t\t\t\tthis.currentFloatTable = this.functionFloatTable;\n\t\t\t\tbreak;\n\t\t\t}\n\t\t\tbreak;\n\t\t}\n\t}\n\tcompile(code,optimizationLevel) {\n\t\tif(optimizationLevel == null) {\n\t\t\toptimizationLevel = 3;\n\t\t}\n\t\tlet statementList = null;\n\t\tlet scanner = new Scanner(code);\n\t\tlet toks = scanner.scanTokens();\n\t\tlet parser = new Parser(toks);\n\t\tstatementList = parser.parse();\n\t\tlet optimizer = new Optimizer(statementList);\n\t\toptimizer.optimize(optimizationLevel);\n\t\tstatementList = optimizer.getAST();\n\t\tlet outData = new haxe_io_BytesBuffer();\n\t\toutData.addInt32(this.dsoVersion);\n\t\tthis.globalFloatTable = [];\n\t\tthis.globalStringTable = new StringTable();\n\t\tthis.functionFloatTable = [];\n\t\tthis.functionStringTable = new StringTable();\n\t\tthis.identTable = new IdentTable();\n\t\tthis.currentStringTable = this.globalStringTable;\n\t\tthis.currentFloatTable = this.globalFloatTable;\n\t\tthis.inFunction = false;\n\t\tthis.breakLineCount = 0;\n\t\tlet codeSize = 1;\n\t\tif(statementList.length != 0) {\n\t\t\tcodeSize = expr_Stmt.precompileBlock(this,statementList,0) + 1;\n\t\t}\n\t\tlet lineBreakPairCount = this.breakLineCount * 2;\n\t\tlet context = new CompileContext(codeSize,lineBreakPairCount);\n\t\tcontext.breakPoint = 0;\n\t\tcontext.continuePoint = 0;\n\t\tcontext.ip = 0;\n\t\tthis.globalStringTable.write(outData);\n\t\toutData.addInt32(this.globalFloatTable.length);\n\t\tlet _g = 0;\n\t\tlet _g1 = this.globalFloatTable;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet f = _g1[_g];\n\t\t\t++_g;\n\t\t\toutData.addDouble(f);\n\t\t}\n\t\tthis.functionStringTable.write(outData);\n\t\toutData.addInt32(this.functionFloatTable.length);\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.functionFloatTable;\n\t\twhile(_g2 < _g3.length) {\n\t\t\tlet f = _g3[_g2];\n\t\t\t++_g2;\n\t\t\toutData.addDouble(f);\n\t\t}\n\t\tthis.breakLineCount = 0;\n\t\tlet lastIp = 0;\n\t\tif(statementList.length != 0) {\n\t\t\tlastIp = expr_Stmt.compileBlock(this,context,statementList);\n\t\t}\n\t\tif(lastIp != codeSize - 1) {\n\t\t\tthrow new haxe_Exception(\"Precompile size mismatch\");\n\t\t}\n\t\tcontext.codeStream[lastIp++] = 13;\n\t\tlet totSize = codeSize + this.breakLineCount * 2;\n\t\toutData.addInt32(codeSize);\n\t\toutData.addInt32(this.breakLineCount);\n\t\tlet _g4 = 0;\n\t\tlet _g5 = codeSize;\n\t\twhile(_g4 < _g5) {\n\t\t\tlet i = _g4++;\n\t\t\tif(context.codeStream[i] < 255) {\n\t\t\t\toutData.addByte(context.codeStream[i]);\n\t\t\t} else {\n\t\t\t\toutData.addByte(255);\n\t\t\t\toutData.addInt32(context.codeStream[i]);\n\t\t\t}\n\t\t}\n\t\tlet _g6 = 0;\n\t\tlet _g7 = context.lineBreakPairs;\n\t\twhile(_g6 < _g7.length) {\n\t\t\tlet ibyte = _g7[_g6];\n\t\t\t++_g6;\n\t\t\toutData.addInt32(ibyte);\n\t\t}\n\t\tthis.identTable.write(outData);\n\t\treturn outData;\n\t}\n\tstatic stringToNumber(value) {\n\t\tif(value == \"true\") {\n\t\t\treturn 1;\n\t\t}\n\t\tif(value == \"false\") {\n\t\t\treturn 0;\n\t\t}\n\t\tlet val = parseFloat(value);\n\t\tif(isNaN(val)) {\n\t\t\treturn 0;\n\t\t}\n\t\treturn val;\n\t}\n}\n$hx_exports[\"Compiler\"] = Compiler;\nCompiler.__name__ = true;\nObject.assign(Compiler.prototype, {\n\t__class__: Compiler\n});\nclass CompileContext {\n\tconstructor(codeSize,lineBreakPairSize) {\n\t\tlet this1 = new Array(codeSize);\n\t\tthis.codeStream = this1;\n\t\tlet this2 = new Array(lineBreakPairSize);\n\t\tthis.lineBreakPairs = this2;\n\t\tthis.codeSize = codeSize;\n\t\tthis.lineBreakPairSize = lineBreakPairSize;\n\t}\n}\nCompileContext.__name__ = true;\nObject.assign(CompileContext.prototype, {\n\t__class__: CompileContext\n});\nvar LineType = $hxEnums[\"LineType\"] = { __ename__:true,__constructs__:null\n\t,GlobalStringTable: {_hx_name:\"GlobalStringTable\",_hx_index:0,__enum__:\"LineType\",toString:$estr}\n\t,GlobalFloatTable: {_hx_name:\"GlobalFloatTable\",_hx_index:1,__enum__:\"LineType\",toString:$estr}\n\t,FunctionStringTable: {_hx_name:\"FunctionStringTable\",_hx_index:2,__enum__:\"LineType\",toString:$estr}\n\t,FunctionFloatTable: {_hx_name:\"FunctionFloatTable\",_hx_index:3,__enum__:\"LineType\",toString:$estr}\n\t,IdentTable: {_hx_name:\"IdentTable\",_hx_index:4,__enum__:\"LineType\",toString:$estr}\n\t,Code: {_hx_name:\"Code\",_hx_index:5,__enum__:\"LineType\",toString:$estr}\n};\nLineType.__constructs__ = [LineType.GlobalStringTable,LineType.GlobalFloatTable,LineType.FunctionStringTable,LineType.FunctionFloatTable,LineType.IdentTable,LineType.Code];\nvar DisassemblyVerbosity = $hxEnums[\"DisassemblyVerbosity\"] = { __ename__:true,__constructs__:null\n\t,Code: {_hx_name:\"Code\",_hx_index:0,__enum__:\"DisassemblyVerbosity\",toString:$estr}\n\t,Args: {_hx_name:\"Args\",_hx_index:1,__enum__:\"DisassemblyVerbosity\",toString:$estr}\n\t,ConstTables: {_hx_name:\"ConstTables\",_hx_index:2,__enum__:\"DisassemblyVerbosity\",toString:$estr}\n\t,ConstTableReferences: {_hx_name:\"ConstTableReferences\",_hx_index:3,__enum__:\"DisassemblyVerbosity\",toString:$estr}\n};\nDisassemblyVerbosity.__constructs__ = [DisassemblyVerbosity.Code,DisassemblyVerbosity.Args,DisassemblyVerbosity.ConstTables,DisassemblyVerbosity.ConstTableReferences];\nclass DissassemblyData {\n}\nDissassemblyData.__name__ = true;\nclass DisassemblyReference extends DissassemblyData {\n\tconstructor(referencesWhat,referenceIndex) {\n\t\tsuper();\n\t\tthis.referencesWhat = referencesWhat;\n\t\tthis.referenceIndex = referenceIndex;\n\t}\n}\nDisassemblyReference.__name__ = true;\nDisassemblyReference.__super__ = DissassemblyData;\nObject.assign(DisassemblyReference.prototype, {\n\t__class__: DisassemblyReference\n});\nclass DisassemblyConst extends DissassemblyData {\n\tconstructor(value) {\n\t\tsuper();\n\t\tthis.value = value;\n\t}\n}\nDisassemblyConst.__name__ = true;\nDisassemblyConst.__super__ = DissassemblyData;\nObject.assign(DisassemblyConst.prototype, {\n\t__class__: DisassemblyConst\n});\nclass Disassembler {\n\tconstructor() {\n\t\tthis.opCodeLookup = new haxe_ds_IntMap();\n\t\tthis.identMapSize = 1;\n\t\tlet _g = new haxe_ds_IntMap();\n\t\t_g.h[0] = null;\n\t\tthis.identMap = _g;\n\t\tthis.inFunction = false;\n\t\tthis.lineBreakPairs = [];\n\t\tthis.codeStream = [];\n\t\tthis.dsoVersion = 33;\n\t\tthis.identTable = new IdentTable();\n\t\tthis.functionFloatTable = [];\n\t\tthis.globalFloatTable = [];\n\t\tlet _g1 = new haxe_ds_IntMap();\n\t\t_g1.h[0] = \"FuncDecl\";\n\t\t_g1.h[1] = \"CreateObject\";\n\t\t_g1.h[2] = \"CreateDataBlock\";\n\t\t_g1.h[3] = \"NameObject\";\n\t\t_g1.h[4] = \"AddObject\";\n\t\t_g1.h[5] = \"EndObject\";\n\t\t_g1.h[6] = \"JmpIffNot\";\n\t\t_g1.h[7] = \"JmpIfNot\";\n\t\t_g1.h[8] = \"JmpIff\";\n\t\t_g1.h[9] = \"JmpIf\";\n\t\t_g1.h[10] = \"JmpIfNotNP\";\n\t\t_g1.h[11] = \"JmpIfNP\";\n\t\t_g1.h[12] = \"Jmp\";\n\t\t_g1.h[13] = \"Return\";\n\t\t_g1.h[14] = \"CmpEQ\";\n\t\t_g1.h[15] = \"CmpGT\";\n\t\t_g1.h[16] = \"CmpGE\";\n\t\t_g1.h[17] = \"CmpLT\";\n\t\t_g1.h[18] = \"CmpLE\";\n\t\t_g1.h[19] = \"CmpNE\";\n\t\t_g1.h[20] = \"Xor\";\n\t\t_g1.h[21] = \"Mod\";\n\t\t_g1.h[22] = \"BitAnd\";\n\t\t_g1.h[23] = \"BitOr\";\n\t\t_g1.h[24] = \"Not\";\n\t\t_g1.h[25] = \"NotF\";\n\t\t_g1.h[26] = \"OnesComplement\";\n\t\t_g1.h[27] = \"Shr\";\n\t\t_g1.h[28] = \"Shl\";\n\t\t_g1.h[29] = \"And\";\n\t\t_g1.h[30] = \"Or\";\n\t\t_g1.h[31] = \"Add\";\n\t\t_g1.h[32] = \"Sub\";\n\t\t_g1.h[33] = \"Mul\";\n\t\t_g1.h[34] = \"Div\";\n\t\t_g1.h[35] = \"Neg\";\n\t\t_g1.h[36] = \"SetCurVar\";\n\t\t_g1.h[37] = \"SetCurVarCreate\";\n\t\t_g1.h[38] = \"SetCurVarArray\";\n\t\t_g1.h[39] = \"SetCurVarArrayCreate\";\n\t\t_g1.h[40] = \"LoadVarUInt\";\n\t\t_g1.h[41] = \"LoadVarFlt\";\n\t\t_g1.h[42] = \"LoadVarStr\";\n\t\t_g1.h[43] = \"SaveVarUInt\";\n\t\t_g1.h[44] = \"SaveVarFlt\";\n\t\t_g1.h[45] = \"SaveVarStr\";\n\t\t_g1.h[46] = \"SetCurObject\";\n\t\t_g1.h[47] = \"SetCurObjectNew\";\n\t\t_g1.h[48] = \"SetCurField\";\n\t\t_g1.h[49] = \"SetCurFieldArray\";\n\t\t_g1.h[50] = \"LoadFieldUInt\";\n\t\t_g1.h[51] = \"LoadFieldFlt\";\n\t\t_g1.h[52] = \"LoadFieldStr\";\n\t\t_g1.h[53] = \"SaveFieldUInt\";\n\t\t_g1.h[54] = \"SaveFieldFlt\";\n\t\t_g1.h[55] = \"SaveFieldStr\";\n\t\t_g1.h[56] = \"StrToUInt\";\n\t\t_g1.h[57] = \"StrToFlt\";\n\t\t_g1.h[58] = \"StrToNone\";\n\t\t_g1.h[59] = \"FltToUInt\";\n\t\t_g1.h[60] = \"FltToStr\";\n\t\t_g1.h[61] = \"FltToNone\";\n\t\t_g1.h[62] = \"UIntToFlt\";\n\t\t_g1.h[63] = \"UIntToStr\";\n\t\t_g1.h[64] = \"UIntToNone\";\n\t\t_g1.h[65] = \"LoadImmedUInt\";\n\t\t_g1.h[66] = \"LoadImmedFlt\";\n\t\t_g1.h[67] = \"TagToStr\";\n\t\t_g1.h[68] = \"LoadImmedStr\";\n\t\t_g1.h[69] = \"LoadImmedIdent\";\n\t\t_g1.h[70] = \"CallFuncResolve\";\n\t\t_g1.h[71] = \"CallFunc\";\n\t\t_g1.h[72] = \"ProcessArgs\";\n\t\t_g1.h[73] = \"AdvanceStr\";\n\t\t_g1.h[74] = \"AdvanceStrAppendChar\";\n\t\t_g1.h[75] = \"AdvanceStrComma\";\n\t\t_g1.h[76] = \"AdvanceStrNul\";\n\t\t_g1.h[77] = \"RewindStr\";\n\t\t_g1.h[78] = \"TerminateRewindStr\";\n\t\t_g1.h[79] = \"CompareStr\";\n\t\t_g1.h[80] = \"Push\";\n\t\t_g1.h[81] = \"PushFrame\";\n\t\t_g1.h[82] = \"Break\";\n\t\t_g1.h[83] = \"Invalid\";\n\t\tthis.opCodeLookup = _g1;\n\t}\n\tloadFromBytes(bytes) {\n\t\tthis.load(new haxe_io_BytesInput(haxe_io_Bytes.ofData(bytes)));\n\t}\n\tload(inData) {\n\t\tthis.dsoVersion = inData.readInt32();\n\t\tif(this.dsoVersion != 33) {\n\t\t\tthrow new haxe_Exception(\"Incorrect DSO version: \" + this.dsoVersion);\n\t\t}\n\t\tlet stSize = inData.readInt32();\n\t\tthis.globalStringTable = \"\";\n\t\tlet _g = 0;\n\t\tlet _g1 = stSize;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet tmp = this;\n\t\t\tlet tmp1 = tmp.globalStringTable;\n\t\t\tlet code = inData.readByte();\n\t\t\ttmp.globalStringTable = tmp1 + String.fromCodePoint(code);\n\t\t}\n\t\tlet size = inData.readInt32();\n\t\tlet _g2 = 0;\n\t\tlet _g3 = size;\n\t\twhile(_g2 < _g3) {\n\t\t\tlet i = _g2++;\n\t\t\tthis.globalFloatTable.push(inData.readDouble());\n\t\t}\n\t\tlet stSize1 = inData.readInt32();\n\t\tthis.functionStringTable = \"\";\n\t\tlet _g4 = 0;\n\t\tlet _g5 = stSize1;\n\t\twhile(_g4 < _g5) {\n\t\t\tlet i = _g4++;\n\t\t\tlet tmp = this;\n\t\t\tlet tmp1 = tmp.functionStringTable;\n\t\t\tlet code = inData.readByte();\n\t\t\ttmp.functionStringTable = tmp1 + String.fromCodePoint(code);\n\t\t}\n\t\tsize = inData.readInt32();\n\t\tlet _g6 = 0;\n\t\tlet _g7 = size;\n\t\twhile(_g6 < _g7) {\n\t\t\tlet i = _g6++;\n\t\t\tthis.functionFloatTable.push(inData.readDouble());\n\t\t}\n\t\tlet codeSize = inData.readInt32();\n\t\tlet lineBreakPairCount = inData.readInt32();\n\t\tlet _g8 = 0;\n\t\tlet _g9 = codeSize;\n\t\twhile(_g8 < _g9) {\n\t\t\tlet i = _g8++;\n\t\t\tlet curByte = inData.readByte();\n\t\t\tif(curByte == 255) {\n\t\t\t\tthis.codeStream.push(inData.readInt32());\n\t\t\t} else {\n\t\t\t\tthis.codeStream.push(curByte);\n\t\t\t}\n\t\t}\n\t\tlet _g10 = 0;\n\t\tlet _g11 = lineBreakPairCount * 2;\n\t\twhile(_g10 < _g11) {\n\t\t\tlet i = _g10++;\n\t\t\tthis.lineBreakPairs.push(inData.readInt32());\n\t\t}\n\t\tthis.identTable.read(inData);\n\t\tlet map = this.identTable.identMap;\n\t\tlet _g12_map = map;\n\t\tlet _g12_keys = map.keys();\n\t\twhile(_g12_keys.hasNext()) {\n\t\t\tlet key = _g12_keys.next();\n\t\t\tlet _g13_value = _g12_map.get(key);\n\t\t\tlet _g13_key = key;\n\t\t\tlet ident = _g13_key;\n\t\t\tlet offsets = _g13_value;\n\t\t\tlet identStr = this.getStringTableValue(this.globalStringTable,ident);\n\t\t\tlet identId = this.identMapSize;\n\t\t\tlet _g = 0;\n\t\t\twhile(_g < offsets.length) {\n\t\t\t\tlet offset = offsets[_g];\n\t\t\t\t++_g;\n\t\t\t\tthis.codeStream[offset] = this.identMapSize;\n\t\t\t}\n\t\t\tthis.identMap.h[identId] = identStr;\n\t\t\tthis.identMapSize++;\n\t\t}\n\t}\n\tgetStringTableValue(table,offset) {\n\t\treturn HxOverrides.substr(table,offset,table.indexOf(\"\\x00\",offset) - offset);\n\t}\n\tgetStringTableValueFromRef(table,ref) {\n\t\tlet zeroCount = 0;\n\t\tlet str = new StringBuf();\n\t\tlet _g = 0;\n\t\tlet _g1 = table.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tif(HxOverrides.cca(table,i) == 0) {\n\t\t\t\tif(zeroCount == ref) {\n\t\t\t\t\treturn str.b;\n\t\t\t\t}\n\t\t\t\tstr = new StringBuf();\n\t\t\t\t++zeroCount;\n\t\t\t} else {\n\t\t\t\tstr.b += Std.string(table.charAt(i));\n\t\t\t}\n\t\t}\n\t\treturn \"\";\n\t}\n\tnormalizeSTE(steType,index) {\n\t\tlet zeroCount = 0;\n\t\tif(steType == LineType.GlobalStringTable) {\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = this.globalStringTable.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tif(HxOverrides.cca(this.globalStringTable,i) == 0) {\n\t\t\t\t\t++zeroCount;\n\t\t\t\t}\n\t\t\t\tif(i == index) {\n\t\t\t\t\treturn zeroCount;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tif(steType == LineType.FunctionStringTable) {\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = this.functionStringTable.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tif(HxOverrides.cca(this.functionStringTable,i) == 0) {\n\t\t\t\t\t++zeroCount;\n\t\t\t\t}\n\t\t\t\tif(i == index) {\n\t\t\t\t\treturn zeroCount;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn -1;\n\t}\n\tdisassembleCode() {\n\t\tlet ip = 0;\n\t\tlet lines = [];\n\t\tlet endFuncIp = -1;\n\t\twhile(ip != this.codeStream.length) {\n\t\t\tif(ip == endFuncIp) {\n\t\t\t\tthis.inFunction = false;\n\t\t\t}\n\t\t\tlet instruction = this.codeStream[ip++];\n\t\t\tswitch(instruction) {\n\t\t\tcase 0:\n\t\t\t\tlet fnName = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);\n\t\t\t\tlet fnNamespace = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 1]);\n\t\t\t\tlet fnPackage = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 2]);\n\t\t\t\tlet hasBody = new DisassemblyConst(this.codeStream[ip + 3]);\n\t\t\t\tlet fnEndOffset = new DisassemblyReference(LineType.Code,this.codeStream[ip + 4]);\n\t\t\t\tendFuncIp = this.codeStream[ip + 4];\n\t\t\t\tlet fnArgc = new DisassemblyConst(this.codeStream[ip + 5]);\n\t\t\t\tlet fnArgs = [];\n\t\t\t\tlet _g = 0;\n\t\t\t\tlet _g1 = fnArgc.value;\n\t\t\t\twhile(_g < _g1) {\n\t\t\t\t\tlet i = _g++;\n\t\t\t\t\tfnArgs.push(new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 6 + i]));\n\t\t\t\t}\n\t\t\t\tthis.inFunction = true;\n\t\t\t\tlet line = { type : LineType.Code, opCode : 0, args : [fnName,fnNamespace,fnPackage,hasBody,fnEndOffset,fnArgc].concat(fnArgs), lineNo : ip};\n\t\t\t\tip += 6 + fnArgc.value;\n\t\t\t\tlines.push(line);\n\t\t\t\tbreak;\n\t\t\tcase 1:\n\t\t\t\tlet objParent = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);\n\t\t\t\tlet datablock = new DisassemblyConst(this.codeStream[ip + 1]);\n\t\t\t\tlet failJump = new DisassemblyReference(LineType.Code,this.codeStream[ip + 2]);\n\t\t\t\tlet line1 = { type : LineType.Code, opCode : 1, args : [objParent,datablock,failJump], lineNo : ip};\n\t\t\t\tip += 3;\n\t\t\t\tlines.push(line1);\n\t\t\t\tbreak;\n\t\t\tcase 2:case 3:\n\t\t\t\tlet line2 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line2);\n\t\t\t\tbreak;\n\t\t\tcase 4:case 5:\n\t\t\t\tlet root = new DisassemblyConst(this.codeStream[ip]);\n\t\t\t\tlet line3 = { type : LineType.Code, opCode : instruction, args : [root], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line3);\n\t\t\t\tbreak;\n\t\t\tcase 6:case 7:case 8:case 9:case 10:case 11:case 12:\n\t\t\t\tlet jump = new DisassemblyReference(LineType.Code,this.codeStream[ip]);\n\t\t\t\tlet line4 = { type : LineType.Code, opCode : instruction, args : [jump], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line4);\n\t\t\t\tbreak;\n\t\t\tcase 13:\n\t\t\t\tlet line5 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line5);\n\t\t\t\tbreak;\n\t\t\tcase 14:case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 29:case 30:case 31:case 32:case 33:case 34:case 35:\n\t\t\t\tlet line6 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line6);\n\t\t\t\tbreak;\n\t\t\tcase 36:case 37:\n\t\t\t\tlet varIdx = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);\n\t\t\t\tlet line7 = { type : LineType.Code, opCode : instruction, args : [varIdx], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line7);\n\t\t\t\tbreak;\n\t\t\tcase 38:case 39:\n\t\t\t\tlet line8 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line8);\n\t\t\t\tbreak;\n\t\t\tcase 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:\n\t\t\t\tlet line9 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line9);\n\t\t\t\tbreak;\n\t\t\tcase 48:\n\t\t\t\tlet fieldIdx = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);\n\t\t\t\tlet line10 = { type : LineType.Code, opCode : instruction, args : [fieldIdx], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line10);\n\t\t\t\tbreak;\n\t\t\tcase 49:\n\t\t\t\tlet line11 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line11);\n\t\t\t\tbreak;\n\t\t\tcase 50:case 51:case 52:case 53:case 54:case 55:\n\t\t\t\tlet line12 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line12);\n\t\t\t\tbreak;\n\t\t\tcase 56:case 57:case 58:case 59:case 60:case 61:case 62:case 63:case 64:\n\t\t\t\tlet line13 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line13);\n\t\t\t\tbreak;\n\t\t\tcase 65:\n\t\t\t\tlet immed = new DisassemblyConst(this.codeStream[ip]);\n\t\t\t\tlet line14 = { type : LineType.Code, opCode : instruction, args : [immed], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line14);\n\t\t\t\tbreak;\n\t\t\tcase 66:\n\t\t\t\tlet immed1 = new DisassemblyReference(this.inFunction ? LineType.FunctionFloatTable : LineType.GlobalFloatTable,this.codeStream[ip]);\n\t\t\t\tlet line15 = { type : LineType.Code, opCode : instruction, args : [immed1], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line15);\n\t\t\t\tbreak;\n\t\t\tcase 67:case 68:\n\t\t\t\tlet ref = new DisassemblyReference(this.inFunction ? LineType.FunctionStringTable : LineType.GlobalStringTable,this.normalizeSTE(this.inFunction ? LineType.FunctionStringTable : LineType.GlobalStringTable,this.codeStream[ip]));\n\t\t\t\tlet line16 = { type : LineType.Code, opCode : instruction, args : [ref], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line16);\n\t\t\t\tbreak;\n\t\t\tcase 69:\n\t\t\t\tlet ref1 = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);\n\t\t\t\tlet line17 = { type : LineType.Code, opCode : instruction, args : [ref1], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line17);\n\t\t\t\tbreak;\n\t\t\tcase 70:case 71:\n\t\t\t\tlet fnName1 = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip]);\n\t\t\t\tlet fnNamespace1 = new DisassemblyReference(LineType.IdentTable,this.codeStream[ip + 1]);\n\t\t\t\tlet callType = new DisassemblyConst(this.codeStream[ip + 2]);\n\t\t\t\tlet line18 = { type : LineType.Code, opCode : instruction, args : [fnName1,fnNamespace1,callType], lineNo : ip};\n\t\t\t\tip += 3;\n\t\t\t\tlines.push(line18);\n\t\t\t\tbreak;\n\t\t\tcase 74:\n\t\t\t\tlet char = new DisassemblyConst(this.codeStream[ip]);\n\t\t\t\tlet line19 = { type : LineType.Code, opCode : instruction, args : [char], lineNo : ip};\n\t\t\t\t++ip;\n\t\t\t\tlines.push(line19);\n\t\t\t\tbreak;\n\t\t\tcase 72:case 73:case 75:case 76:case 77:case 78:case 79:\n\t\t\t\tlet line20 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line20);\n\t\t\t\tbreak;\n\t\t\tcase 80:case 81:case 82:case 83:\n\t\t\t\tlet line21 = { type : LineType.Code, opCode : instruction, args : [], lineNo : ip};\n\t\t\t\tlines.push(line21);\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t\tlet totalDism = [];\n\t\tlet zeroCount = 0;\n\t\tlet str = new StringBuf();\n\t\tlet _g = 0;\n\t\tlet _g1 = this.globalStringTable.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tif(HxOverrides.cca(this.globalStringTable,i) == 0) {\n\t\t\t\ttotalDism.push({ type : LineType.GlobalStringTable, lineNo : zeroCount, opCode : 0, args : [new DisassemblyConst(str.b)]});\n\t\t\t\tstr = new StringBuf();\n\t\t\t\t++zeroCount;\n\t\t\t} else {\n\t\t\t\tstr.b += Std.string(this.globalStringTable.charAt(i));\n\t\t\t}\n\t\t}\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.globalFloatTable.length;\n\t\twhile(_g2 < _g3) {\n\t\t\tlet i = _g2++;\n\t\t\ttotalDism.push({ type : LineType.GlobalFloatTable, lineNo : i, opCode : 0, args : [new DisassemblyConst(this.globalFloatTable[i])]});\n\t\t}\n\t\tlet zeroCount1 = 0;\n\t\tlet str1 = new StringBuf();\n\t\tlet _g4 = 0;\n\t\tlet _g5 = this.functionStringTable.length;\n\t\twhile(_g4 < _g5) {\n\t\t\tlet i = _g4++;\n\t\t\tif(HxOverrides.cca(this.functionStringTable,i) == 0) {\n\t\t\t\ttotalDism.push({ type : LineType.FunctionStringTable, lineNo : zeroCount1, opCode : 0, args : [new DisassemblyConst(str1.b)]});\n\t\t\t\tstr1 = new StringBuf();\n\t\t\t\t++zeroCount1;\n\t\t\t} else {\n\t\t\t\tstr1.b += Std.string(this.functionStringTable.charAt(i));\n\t\t\t}\n\t\t}\n\t\tlet _g6 = 0;\n\t\tlet _g7 = this.functionFloatTable.length;\n\t\twhile(_g6 < _g7) {\n\t\t\tlet i = _g6++;\n\t\t\ttotalDism.push({ type : LineType.FunctionFloatTable, lineNo : i, opCode : 0, args : [new DisassemblyConst(this.functionFloatTable[i])]});\n\t\t}\n\t\tlet map = this.identMap;\n\t\tlet _g8_map = map;\n\t\tlet _g8_keys = map.keys();\n\t\twhile(_g8_keys.hasNext()) {\n\t\t\tlet key = _g8_keys.next();\n\t\t\tlet _g9_value = _g8_map.get(key);\n\t\t\tlet _g9_key = key;\n\t\t\tlet identIdx = _g9_key;\n\t\t\tlet ident = _g9_value;\n\t\t\ttotalDism.push({ type : LineType.IdentTable, lineNo : identIdx, opCode : 0, args : [new DisassemblyConst(ident)]});\n\t\t}\n\t\ttotalDism = totalDism.concat(lines);\n\t\treturn totalDism;\n\t}\n\twriteDisassembly(lines,outputVerbosity) {\n\t\tlet output_b = \"\";\n\t\tlet _g = 0;\n\t\twhile(_g < lines.length) {\n\t\t\tlet line = lines[_g];\n\t\t\t++_g;\n\t\t\tswitch(line.type._hx_index) {\n\t\t\tcase 0:\n\t\t\t\tlet strData = line.args[0];\n\t\t\t\tif((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {\n\t\t\t\t\toutput_b += Std.string(\"GlobalStringTable::\" + StringTools.lpad(\"\" + line.lineNo,\"0\",5) + \": \" + strData.value + \"\\n\");\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 1:\n\t\t\t\tlet strData1 = line.args[0];\n\t\t\t\tif((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {\n\t\t\t\t\toutput_b += Std.string(\"GlobalFloatTable::\" + StringTools.lpad(\"\" + line.lineNo,\"0\",5) + \": \" + strData1.value + \"\\n\");\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 2:\n\t\t\t\tlet strData2 = line.args[0];\n\t\t\t\tif((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {\n\t\t\t\t\toutput_b += Std.string(\"FunctionStringTable::\" + StringTools.lpad(\"\" + line.lineNo,\"0\",5) + \": \" + strData2.value + \"\\n\");\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 3:\n\t\t\t\tlet strData3 = line.args[0];\n\t\t\t\tif((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {\n\t\t\t\t\toutput_b += Std.string(\"FunctionFloatTable::\" + StringTools.lpad(\"\" + line.lineNo,\"0\",5) + \": \" + strData3.value + \"\\n\");\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 4:\n\t\t\t\tlet strData4 = line.args[0];\n\t\t\t\tif((outputVerbosity & 1 << DisassemblyVerbosity.ConstTables._hx_index) != 0) {\n\t\t\t\t\toutput_b += Std.string(\"IdentTable::\" + StringTools.lpad(\"\" + line.lineNo,\"0\",5) + \": \" + strData4.value + \"\\n\");\n\t\t\t\t}\n\t\t\t\tbreak;\n\t\t\tcase 5:\n\t\t\t\tlet args = \"\";\n\t\t\t\tif((outputVerbosity & 1 << DisassemblyVerbosity.Args._hx_index) != 0) {\n\t\t\t\t\tlet _g = 0;\n\t\t\t\t\tlet _g1 = line.args;\n\t\t\t\t\twhile(_g < _g1.length) {\n\t\t\t\t\t\tlet arg = _g1[_g];\n\t\t\t\t\t\t++_g;\n\t\t\t\t\t\tif(((arg) instanceof DisassemblyReference)) {\n\t\t\t\t\t\t\tlet ref = arg;\n\t\t\t\t\t\t\tlet refStr;\n\t\t\t\t\t\t\tswitch(ref.referencesWhat._hx_index) {\n\t\t\t\t\t\t\tcase 0:\n\t\t\t\t\t\t\t\trefStr = \"GlobalStringTable::\" + StringTools.lpad(\"\" + ref.referenceIndex,\"0\",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? \"<-\\\"\" + this.getStringTableValueFromRef(this.globalStringTable,ref.referenceIndex) + \"\\\"\" : \"\");\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\tcase 1:\n\t\t\t\t\t\t\t\trefStr = \"GlobalFloatTable::\" + StringTools.lpad(\"\" + ref.referenceIndex,\"0\",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? \"<-\\\"\" + this.globalFloatTable[ref.referenceIndex] + \"\\\"\" : \"\");\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\tcase 2:\n\t\t\t\t\t\t\t\trefStr = \"FunctionStringTable::\" + StringTools.lpad(\"\" + ref.referenceIndex,\"0\",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? \"<-\\\"\" + this.getStringTableValueFromRef(this.functionStringTable,ref.referenceIndex) + \"\\\"\" : \"\");\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\tcase 3:\n\t\t\t\t\t\t\t\trefStr = \"FunctionFloatTable::\" + StringTools.lpad(\"\" + ref.referenceIndex,\"0\",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? \"<-\\\"\" + this.functionFloatTable[ref.referenceIndex] + \"\\\"\" : \"\");\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\tcase 4:\n\t\t\t\t\t\t\t\trefStr = \"IdentTable::\" + StringTools.lpad(\"\" + ref.referenceIndex,\"0\",5) + ((outputVerbosity & 1 << DisassemblyVerbosity.ConstTableReferences._hx_index) != 0 ? \"<-\\\"\" + this.identMap.h[ref.referenceIndex] + \"\\\"\" : \"\");\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\tcase 5:\n\t\t\t\t\t\t\t\trefStr = \"Code::\" + StringTools.lpad(\"\" + ref.referenceIndex,\"0\",5);\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\targs += refStr + \" \";\n\t\t\t\t\t\t} else if(((arg) instanceof DisassemblyConst)) {\n\t\t\t\t\t\t\tlet c = arg;\n\t\t\t\t\t\t\targs += \"\" + c.value + \" \";\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\toutput_b += Std.string(\"Code::\" + StringTools.lpad(\"\" + line.lineNo,\"0\",5) + \": \" + this.opCodeLookup.h[line.opCode] + \" \" + args + \"\\n\");\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t\treturn output_b;\n\t}\n}\n$hx_exports[\"Disassembler\"] = Disassembler;\nDisassembler.__name__ = true;\nObject.assign(Disassembler.prototype, {\n\t__class__: Disassembler\n});\nclass HxOverrides {\n\tstatic cca(s,index) {\n\t\tlet x = s.charCodeAt(index);\n\t\tif(x != x) {\n\t\t\treturn undefined;\n\t\t}\n\t\treturn x;\n\t}\n\tstatic substr(s,pos,len) {\n\t\tif(len == null) {\n\t\t\tlen = s.length;\n\t\t} else if(len < 0) {\n\t\t\tif(pos == 0) {\n\t\t\t\tlen = s.length + len;\n\t\t\t} else {\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t}\n\t\treturn s.substr(pos,len);\n\t}\n\tstatic remove(a,obj) {\n\t\tlet i = a.indexOf(obj);\n\t\tif(i == -1) {\n\t\t\treturn false;\n\t\t}\n\t\ta.splice(i,1);\n\t\treturn true;\n\t}\n\tstatic now() {\n\t\treturn Date.now();\n\t}\n}\nHxOverrides.__name__ = true;\nclass IASTVisitor {\n}\nIASTVisitor.__name__ = true;\nIASTVisitor.__isInterface__ = true;\nObject.assign(IASTVisitor.prototype, {\n\t__class__: IASTVisitor\n});\nclass IOptimizerPass {\n}\nIOptimizerPass.__name__ = true;\nIOptimizerPass.__isInterface__ = true;\nIOptimizerPass.__interfaces__ = [IASTVisitor];\nObject.assign(IOptimizerPass.prototype, {\n\t__class__: IOptimizerPass\n});\nclass VarCollector {\n\tconstructor() {\n\t\tthis.currentFunction = null;\n\t\tthis.localVars = new haxe_ds_ObjectMap();\n\t\tthis.globalVars = [];\n\t}\n\tvisitStmt(stmt) {\n\t}\n\tvisitBreakStmt(stmt) {\n\t}\n\tvisitContinueStmt(stmt) {\n\t}\n\tvisitExpr(expr) {\n\t}\n\tvisitParenthesisExpr(expr) {\n\t}\n\tvisitReturnStmt(stmt) {\n\t}\n\tvisitIfStmt(stmt) {\n\t}\n\tvisitLoopStmt(stmt) {\n\t}\n\tvisitBinaryExpr(expr) {\n\t}\n\tvisitFloatBinaryExpr(expr) {\n\t}\n\tvisitIntBinaryExpr(expr) {\n\t}\n\tvisitStrEqExpr(expr) {\n\t}\n\tvisitStrCatExpr(expr) {\n\t}\n\tvisitCommatCatExpr(expr) {\n\t}\n\tvisitConditionalExpr(expr) {\n\t}\n\tvisitIntUnaryExpr(expr) {\n\t}\n\tvisitFloatUnaryExpr(expr) {\n\t}\n\tvisitVarExpr(expr) {\n\t\tif(expr.type == expr_VarType.Global) {\n\t\t\tlet n = VarCollector.mangleName(expr.name.literal);\n\t\t\tif(!this.globalVars.includes(n)) {\n\t\t\t\tthis.globalVars.push(n);\n\t\t\t}\n\t\t} else if(expr.type == expr_VarType.Local) {\n\t\t\tif(this.localVars.h.__keys__[this.currentFunction.__id__] != null) {\n\t\t\t\tlet n = VarCollector.mangleName(expr.name.literal);\n\t\t\t\tif(!this.localVars.h[this.currentFunction.__id__].includes(n)) {\n\t\t\t\t\tthis.localVars.h[this.currentFunction.__id__].push(n);\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tlet this1 = this.localVars;\n\t\t\t\tlet k = this.currentFunction;\n\t\t\t\tlet v = [VarCollector.mangleName(expr.name.literal)];\n\t\t\t\tthis1.set(k,v);\n\t\t\t}\n\t\t}\n\t}\n\tvisitIntExpr(expr) {\n\t}\n\tvisitFloatExpr(expr) {\n\t}\n\tvisitStringConstExpr(expr) {\n\t}\n\tvisitConstantExpr(expr) {\n\t}\n\tvisitAssignExpr(expr) {\n\t}\n\tvisitAssignOpExpr(expr) {\n\t}\n\tvisitFuncCallExpr(expr) {\n\t}\n\tvisitSlotAccessExpr(expr) {\n\t}\n\tvisitSlotAssignExpr(expr) {\n\t}\n\tvisitSlotAssignOpExpr(expr) {\n\t}\n\tvisitObjectDeclExpr(expr) {\n\t}\n\tvisitFunctionDeclStmt(stmt) {\n\t\tthis.currentFunction = stmt;\n\t}\n\tstatic mangleName(name) {\n\t\tlet ret = name;\n\t\tlet _g = 0;\n\t\tlet _g1 = VarCollector.reservedKwds;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet res = _g1[_g];\n\t\t\t++_g;\n\t\t\tif(ret == res) {\n\t\t\t\tret = StringTools.replace(ret,res,\"_\" + res);\n\t\t\t}\n\t\t}\n\t\tret = StringTools.replace(ret,\"::\",\"_\");\n\t\treturn ret;\n\t}\n}\nVarCollector.__name__ = true;\nVarCollector.__interfaces__ = [IASTVisitor];\nObject.assign(VarCollector.prototype, {\n\t__class__: VarCollector\n});\nclass JSGenerator {\n\tconstructor(stmts) {\n\t\tthis.inFunction = false;\n\t\tthis.varCollector = new VarCollector();\n\t\tthis.builder = new StringBuf();\n\t\tthis.indent = 0;\n\t\tthis.stmts = stmts;\n\t}\n\tgenerate(embedLibrary) {\n\t\tif(embedLibrary == null) {\n\t\t\tembedLibrary = true;\n\t\t}\n\t\tif(embedLibrary) {\n\t\t\tlet lib = JSGenerator.bootstrapEmbed();\n\t\t\tthis.builder.b += lib == null ? \"null\" : \"\" + lib;\n\t\t\tlet _this = this.builder;\n\t\t\tlet x = this.println(\"const __vm = new VM();\");\n\t\t\t_this.b += Std.string(x);\n\t\t}\n\t\tlet _g = 0;\n\t\tlet _g1 = this.stmts;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet stmt = _g1[_g];\n\t\t\t++_g;\n\t\t\tstmt.visitStmt(this.varCollector);\n\t\t\tif(this.varCollector.currentFunction != null) {\n\t\t\t\tthis.varCollector.currentFunction = null;\n\t\t\t}\n\t\t}\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.varCollector.globalVars;\n\t\twhile(_g2 < _g3.length) {\n\t\t\tlet global = _g3[_g2];\n\t\t\t++_g2;\n\t\t\tthis.builder.b += Std.string(\"const global_\" + global + \" = new Variable(\\\"$\" + \"global_\" + global + \"\\\", __vm);\\n\");\n\t\t}\n\t\tlet _g4 = 0;\n\t\tlet _g5 = this.stmts;\n\t\twhile(_g4 < _g5.length) {\n\t\t\tlet stmt = _g5[_g4];\n\t\t\t++_g4;\n\t\t\tlet _this = this.builder;\n\t\t\tlet x = this.printStmt(stmt);\n\t\t\t_this.b += Std.string(x);\n\t\t}\n\t\treturn this.builder.b;\n\t}\n\tprintStmt(stmt) {\n\t\tif(((stmt) instanceof expr_BreakStmt)) {\n\t\t\treturn this.println(\"break;\");\n\t\t} else if(((stmt) instanceof expr_ContinueStmt)) {\n\t\t\treturn this.println(\"continue;\");\n\t\t} else if((((stmt) instanceof expr_Expr) ? stmt : null) != null) {\n\t\t\treturn this.println(this.printExpr(stmt,expr_TypeReq.ReqNone) + \";\");\n\t\t} else if(((stmt) instanceof expr_ReturnStmt)) {\n\t\t\treturn this.printReturnStmt(stmt);\n\t\t} else if(((stmt) instanceof expr_IfStmt)) {\n\t\t\treturn this.printIfStmt(stmt);\n\t\t} else if(((stmt) instanceof expr_LoopStmt)) {\n\t\t\treturn this.printLoopStmt(stmt);\n\t\t} else if(((stmt) instanceof expr_FunctionDeclStmt)) {\n\t\t\treturn this.printFunctionDeclStmt(stmt);\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tprintReturnStmt(returnStmt) {\n\t\tif(returnStmt.expr != null) {\n\t\t\tlet expr = this.printExpr(returnStmt.expr,expr_TypeReq.ReqString);\n\t\t\tif(this.inFunction) {\n\t\t\t\treturn this.println(\"return \" + expr + \";\");\n\t\t\t} else {\n\t\t\t\treturn this.println(expr + \";\");\n\t\t\t}\n\t\t} else if(this.inFunction) {\n\t\t\treturn this.println(\"return;\");\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tprintIfStmt(ifStmt) {\n\t\tlet ret = \"\";\n\t\tret += this.println(\"if (\" + (ifStmt.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(ifStmt.condition,expr_TypeReq.ReqInt) : this.printExpr(ifStmt.condition,expr_TypeReq.ReqFloat)) + \") {\");\n\t\tthis.indent++;\n\t\tlet _g = 0;\n\t\tlet _g1 = ifStmt.body;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet stmt = _g1[_g];\n\t\t\t++_g;\n\t\t\tret += this.printStmt(stmt);\n\t\t}\n\t\tthis.indent--;\n\t\tif(ifStmt.elseBlock != null) {\n\t\t\tret += this.println(\"} else {\");\n\t\t\tthis.indent++;\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = ifStmt.elseBlock;\n\t\t\twhile(_g < _g1.length) {\n\t\t\t\tlet stmt = _g1[_g];\n\t\t\t\t++_g;\n\t\t\t\tret += this.printStmt(stmt);\n\t\t\t}\n\t\t\tthis.indent--;\n\t\t}\n\t\tret += this.println(\"}\");\n\t\treturn ret;\n\t}\n\tprintLoopStmt(loopStmt) {\n\t\tlet ret = \"\";\n\t\tlet isForLoop = loopStmt.init != null || loopStmt.end != null;\n\t\tif(isForLoop) {\n\t\t\tret += this.println(\"for (\" + (loopStmt.init != null ? this.printExpr(loopStmt.init,expr_TypeReq.ReqNone) : \"\") + \";\" + (loopStmt.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(loopStmt.condition,expr_TypeReq.ReqInt) : this.printExpr(loopStmt.condition,expr_TypeReq.ReqFloat)) + \";\" + (loopStmt.end != null ? this.printExpr(loopStmt.end,expr_TypeReq.ReqNone) : \"\") + \") {\");\n\t\t} else {\n\t\t\tif(loopStmt.init != null) {\n\t\t\t\tret += this.println(this.printExpr(loopStmt.init,expr_TypeReq.ReqNone) + \";\");\n\t\t\t}\n\t\t\tret += this.println(\"while (\" + (loopStmt.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(loopStmt.condition,expr_TypeReq.ReqInt) : this.printExpr(loopStmt.condition,expr_TypeReq.ReqFloat)) + \") {\");\n\t\t}\n\t\tthis.indent++;\n\t\tlet _g = 0;\n\t\tlet _g1 = loopStmt.body;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet stmt = _g1[_g];\n\t\t\t++_g;\n\t\t\tret += this.printStmt(stmt);\n\t\t}\n\t\tif(!isForLoop) {\n\t\t\tif(loopStmt.end != null) {\n\t\t\t\tret += this.println(this.printExpr(loopStmt.end,expr_TypeReq.ReqNone) + \";\");\n\t\t\t}\n\t\t}\n\t\tthis.indent--;\n\t\tret += this.println(\"}\");\n\t\treturn ret;\n\t}\n\tprintFunctionDeclStmt(functionDeclStmt) {\n\t\tlet fnameStr = \"\" + (functionDeclStmt.namespace != null ? js_Boot.__cast(functionDeclStmt.namespace.literal , String) : \"\") + \"_\" + (functionDeclStmt.functionName.literal == null ? \"null\" : Std.string(functionDeclStmt.functionName.literal)) + \"_\" + (functionDeclStmt.packageName != null ? js_Boot.__cast(functionDeclStmt.packageName.literal , String) : \"\");\n\t\tlet declStr = this.println(\"function \" + fnameStr + \"(args) {\");\n\t\tthis.indent++;\n\t\tlet bodyStr = \"\";\n\t\tlet addedVars = [];\n\t\tlet _g = 0;\n\t\tlet _g1 = functionDeclStmt.args.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet param = functionDeclStmt.args[i];\n\t\t\tlet vname = VarCollector.mangleName(param.name.literal);\n\t\t\tbodyStr += this.println(\"let \" + vname + \" = args[\" + (i + 1) + \"];\");\n\t\t\taddedVars.push(vname);\n\t\t}\n\t\tif(this.varCollector.localVars.h.__keys__[functionDeclStmt.__id__] != null) {\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = this.varCollector.localVars.h[functionDeclStmt.__id__];\n\t\t\twhile(_g < _g1.length) {\n\t\t\t\tlet localVar = _g1[_g];\n\t\t\t\t++_g;\n\t\t\t\tif(!addedVars.includes(localVar)) {\n\t\t\t\t\tbodyStr += this.println(\"const \" + localVar + \" = new Variable(\\\"%\" + localVar + \"\\\", __vm);\");\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tthis.inFunction = true;\n\t\tlet _g2 = 0;\n\t\tlet _g3 = functionDeclStmt.stmts;\n\t\twhile(_g2 < _g3.length) {\n\t\t\tlet stmt = _g3[_g2];\n\t\t\t++_g2;\n\t\t\tbodyStr += this.printStmt(stmt);\n\t\t}\n\t\tthis.inFunction = false;\n\t\tthis.indent--;\n\t\tdeclStr += bodyStr + this.println(\"}\");\n\t\tdeclStr += this.println(\"__vm.addJSFunction(\" + fnameStr + \",\'\" + (functionDeclStmt.functionName.literal == null ? \"null\" : Std.string(functionDeclStmt.functionName.literal)) + \"\',\'\" + (functionDeclStmt.namespace != null ? js_Boot.__cast(functionDeclStmt.namespace.literal , String) : \"\") + \"\', \'\" + (functionDeclStmt.packageName != null ? js_Boot.__cast(functionDeclStmt.packageName.literal , String) : \"\") + \"\');\");\n\t\treturn declStr;\n\t}\n\tprintExpr(expr,type) {\n\t\tif(((expr) instanceof expr_ParenthesisExpr)) {\n\t\t\treturn this.printParenthesisExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_ConditionalExpr)) {\n\t\t\treturn this.printConditionalExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_StrEqExpr)) {\n\t\t\treturn this.printStrEqExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_StrCatExpr)) {\n\t\t\treturn this.printStrCatExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_CommaCatExpr)) {\n\t\t\treturn this.printCommaCatExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_IntBinaryExpr)) {\n\t\t\treturn this.printIntBinaryExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_FloatBinaryExpr)) {\n\t\t\treturn this.printFloatBinaryExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_IntUnaryExpr)) {\n\t\t\treturn this.printIntUnaryExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_FloatUnaryExpr)) {\n\t\t\treturn this.printFloatUnaryExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_VarExpr)) {\n\t\t\treturn this.printVarExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_IntExpr)) {\n\t\t\treturn this.printIntExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_FloatExpr)) {\n\t\t\treturn this.printFloatExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_StringConstExpr)) {\n\t\t\treturn this.printStringConstExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_ConstantExpr)) {\n\t\t\treturn this.printConstantExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_AssignExpr)) {\n\t\t\treturn this.printAssignExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_AssignOpExpr)) {\n\t\t\treturn this.printAssignOpExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_FuncCallExpr)) {\n\t\t\treturn this.printFuncCallExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_SlotAccessExpr)) {\n\t\t\treturn this.printSlotAccessExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_SlotAssignExpr)) {\n\t\t\treturn this.printSlotAssignExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_SlotAssignOpExpr)) {\n\t\t\treturn this.printSlotAssignOpExpr(expr,type);\n\t\t} else if(((expr) instanceof expr_ObjectDeclExpr)) {\n\t\t\treturn this.printObjectDeclExpr(expr,type);\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tprintParenthesisExpr(parenthesisExpr,type) {\n\t\treturn \"(\" + this.printExpr(parenthesisExpr.expr,type) + \")\";\n\t}\n\tprintConditionalExpr(conditionalExpr,type) {\n\t\treturn (conditionalExpr.condition.getPrefferredType() == expr_TypeReq.ReqInt ? this.printExpr(conditionalExpr.condition,expr_TypeReq.ReqInt) : this.printExpr(conditionalExpr.condition,expr_TypeReq.ReqFloat)) + \" ? \" + this.printExpr(conditionalExpr.trueExpr,type) + \" : \" + this.printExpr(conditionalExpr.falseExpr,type);\n\t}\n\tprintStrEqExpr(strEqExpr,type) {\n\t\treturn this.conversionOp(expr_TypeReq.ReqInt,type,this.printExpr(strEqExpr.left,expr_TypeReq.ReqString) + (strEqExpr.op.type == TokenType.StringEquals ? \" == \" : \" != \") + this.printExpr(strEqExpr.right,expr_TypeReq.ReqString));\n\t}\n\tprintStrCatExpr(strCatExpr,type) {\n\t\tlet catExpr;\n\t\tswitch(strCatExpr.op.type._hx_index) {\n\t\tcase 41:\n\t\t\tcatExpr = \"\";\n\t\t\tbreak;\n\t\tcase 42:\n\t\t\tcatExpr = \"\' \' + \";\n\t\t\tbreak;\n\t\tcase 43:\n\t\t\tcatExpr = \"\'\\\\t\' + \";\n\t\t\tbreak;\n\t\tcase 44:\n\t\t\tcatExpr = \"\'\\\\n\' + \";\n\t\t\tbreak;\n\t\tdefault:\n\t\t\tcatExpr = \"\";\n\t\t}\n\t\treturn this.conversionOp(expr_TypeReq.ReqString,type,this.printExpr(strCatExpr.left,expr_TypeReq.ReqString) + \" + \" + catExpr + this.printExpr(strCatExpr.right,expr_TypeReq.ReqString));\n\t}\n\tprintCommaCatExpr(commaCatExpr,type) {\n\t\treturn this.conversionOp(expr_TypeReq.ReqString,type,this.printExpr(commaCatExpr.left,expr_TypeReq.ReqString) + \" + \'_\' + \" + this.printExpr(commaCatExpr.right,expr_TypeReq.ReqString));\n\t}\n\tprintIntBinaryExpr(intBinaryExpr,type) {\n\t\tintBinaryExpr.getSubTypeOperand();\n\t\treturn this.conversionOp(expr_TypeReq.ReqInt,type,this.printExpr(intBinaryExpr.left,intBinaryExpr.subType) + \" \" + intBinaryExpr.op.lexeme + \" \" + this.printExpr(intBinaryExpr.right,intBinaryExpr.subType));\n\t}\n\tprintFloatBinaryExpr(floatBinaryExpr,type) {\n\t\treturn this.conversionOp(expr_TypeReq.ReqFloat,type,this.printExpr(floatBinaryExpr.left,expr_TypeReq.ReqFloat) + \" \" + floatBinaryExpr.op.lexeme + \" \" + this.printExpr(floatBinaryExpr.right,expr_TypeReq.ReqFloat));\n\t}\n\tprintIntUnaryExpr(intUnaryExpr,type) {\n\t\tlet prefType = intUnaryExpr.expr.getPrefferredType();\n\t\tswitch(intUnaryExpr.op.type._hx_index) {\n\t\tcase 35:\n\t\t\treturn this.conversionOp(expr_TypeReq.ReqInt,type,\"!\" + (prefType == expr_TypeReq.ReqInt ? this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqInt) : this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqFloat)));\n\t\tcase 38:\n\t\t\treturn this.conversionOp(expr_TypeReq.ReqInt,type,\"~\" + (prefType == expr_TypeReq.ReqInt ? this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqInt) : this.printExpr(intUnaryExpr.expr,expr_TypeReq.ReqFloat)));\n\t\tdefault:\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tprintFloatUnaryExpr(floatUnaryExpr,type) {\n\t\treturn this.conversionOp(expr_TypeReq.ReqFloat,type,\"-\" + this.printExpr(floatUnaryExpr.expr,expr_TypeReq.ReqFloat));\n\t}\n\tprintVarExpr(varExpr,type) {\n\t\tswitch(varExpr.type._hx_index) {\n\t\tcase 0:\n\t\t\tif(varExpr.arrayIndex == null) {\n\t\t\t\tswitch(type._hx_index) {\n\t\t\t\tcase 0:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal);\n\t\t\t\tcase 1:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal) + \".getIntValue()\";\n\t\t\t\tcase 2:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal) + \".getFloatValue()\";\n\t\t\t\tcase 3:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal) + \".getStringValue()\";\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tswitch(type._hx_index) {\n\t\t\t\tcase 0:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal) + \"[\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \"]\";\n\t\t\t\tcase 1:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal) + \".resolveArray(\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \").getIntValue()\";\n\t\t\t\tcase 2:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal) + \".resolveArray(\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \").getFloatValue()\";\n\t\t\t\tcase 3:\n\t\t\t\t\treturn \"global_\" + VarCollector.mangleName(varExpr.name.literal) + \".resolveArray(\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \").getStringValue()\";\n\t\t\t\t}\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tif(varExpr.arrayIndex == null) {\n\t\t\t\tswitch(type._hx_index) {\n\t\t\t\tcase 0:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal);\n\t\t\t\tcase 1:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal) + \".getIntValue()\";\n\t\t\t\tcase 2:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal) + \".getFloatValue()\";\n\t\t\t\tcase 3:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal) + \".getStringValue()\";\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tswitch(type._hx_index) {\n\t\t\t\tcase 0:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal) + \".resolveArray(\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \")\";\n\t\t\t\tcase 1:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal) + \".resolveArray(\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \").getIntValue()\";\n\t\t\t\tcase 2:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal) + \".resolveArray(\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \").getFloatValue()\";\n\t\t\t\tcase 3:\n\t\t\t\t\treturn VarCollector.mangleName(varExpr.name.literal) + \".resolveArray(\" + this.printExpr(varExpr.arrayIndex,expr_TypeReq.ReqString) + \").getStringValue()\";\n\t\t\t\t}\n\t\t\t}\n\t\t\tbreak;\n\t\t}\n\t}\n\tprintIntExpr(intExpr,type) {\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\treturn \"\" + intExpr.value;\n\t\tcase 1:\n\t\t\treturn \"\" + intExpr.value;\n\t\tcase 2:\n\t\t\treturn \"\" + intExpr.value;\n\t\tcase 3:\n\t\t\treturn \"\'\" + intExpr.value + \"\'\";\n\t\t}\n\t}\n\tprintFloatExpr(floatExpr,type) {\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\treturn \"\" + floatExpr.value;\n\t\tcase 1:\n\t\t\treturn \"\" + (floatExpr.value | 0);\n\t\tcase 2:\n\t\t\treturn \"\" + floatExpr.value;\n\t\tcase 3:\n\t\t\treturn \"\'\" + floatExpr.value + \"\'\";\n\t\t}\n\t}\n\tprintStringConstExpr(stringConstExpr,type) {\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\treturn \"\'\" + stringConstExpr.value + \"\'\";\n\t\tcase 1:\n\t\t\tlet intValue = Std.parseInt(stringConstExpr.value);\n\t\t\tif(intValue == null) {\n\t\t\t\treturn \"0\";\n\t\t\t}\n\t\t\treturn \"\" + intValue;\n\t\tcase 2:\n\t\t\tlet floatValue = parseFloat(stringConstExpr.value);\n\t\t\tif(isNaN(floatValue)) {\n\t\t\t\treturn \"0\";\n\t\t\t}\n\t\t\treturn \"\" + floatValue;\n\t\tcase 3:\n\t\t\treturn \"\'\" + Scanner.escape(stringConstExpr.value) + \"\'\";\n\t\t}\n\t}\n\tprintConstantExpr(constantExpr,type) {\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\treturn \"__vm.resolveIdent(\'\" + (constantExpr.name.literal == null ? \"null\" : Std.string(constantExpr.name.literal)) + \"\')\";\n\t\tcase 1:\n\t\t\treturn \"\" + (Compiler.stringToNumber(constantExpr.name.literal) | 0);\n\t\tcase 2:\n\t\t\treturn \"\" + Compiler.stringToNumber(constantExpr.name.literal);\n\t\tcase 3:\n\t\t\treturn \"\'\" + Scanner.escape(constantExpr.name.literal) + \"\'\";\n\t\t}\n\t}\n\tprintAssignExpr(assignExpr,type) {\n\t\tlet varStr;\n\t\tswitch(assignExpr.varExpr.type._hx_index) {\n\t\tcase 0:\n\t\t\tvarStr = assignExpr.varExpr.arrayIndex == null ? \"global_\" + VarCollector.mangleName(assignExpr.varExpr.name.literal) + \".\" : \"global_\" + VarCollector.mangleName(assignExpr.varExpr.name.literal) + \".resolveArray(\" + this.printExpr(assignExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + \").\";\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tvarStr = assignExpr.varExpr.arrayIndex == null ? VarCollector.mangleName(assignExpr.varExpr.name.literal) + \".\" : VarCollector.mangleName(assignExpr.varExpr.name.literal) + \".resolveArray(\" + this.printExpr(assignExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + \").\";\n\t\t\tbreak;\n\t\t}\n\t\tlet varStr1;\n\t\tswitch(assignExpr.expr.getPrefferredType()._hx_index) {\n\t\tcase 0:\n\t\t\tvarStr1 = \"setStringValue(\" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqString) + \")\";\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tvarStr1 = \"setIntValue(\" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqInt) + \")\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tvarStr1 = \"setFloatValue(\" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqFloat) + \")\";\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tvarStr1 = \"setStringValue(\" + this.printExpr(assignExpr.expr,expr_TypeReq.ReqString) + \")\";\n\t\t\tbreak;\n\t\t}\n\t\tvarStr += varStr1;\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\tbreak;\n\t\tcase 1:case 2:case 3:\n\t\t\tvarStr = \"(() => {\" + varStr + \"; return \" + this.printVarExpr(assignExpr.varExpr,type) + \"; })()\";\n\t\t\tbreak;\n\t\t}\n\t\treturn varStr;\n\t}\n\tprintAssignOpExpr(assignOpExpr,type) {\n\t\tassignOpExpr.getAssignOpTypeOp();\n\t\tlet assignValue = this.printVarExpr(assignOpExpr.varExpr,assignOpExpr.subType) + \" \" + HxOverrides.substr(assignOpExpr.op.lexeme,0,assignOpExpr.op.lexeme.length - 1) + \" \" + this.printExpr(assignOpExpr.expr,assignOpExpr.subType);\n\t\tlet varStr;\n\t\tswitch(assignOpExpr.varExpr.type._hx_index) {\n\t\tcase 0:\n\t\t\tvarStr = assignOpExpr.varExpr.arrayIndex == null ? \"global_\" + VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + \".\" : \"global_\" + VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + \".resolveArray(\" + this.printExpr(assignOpExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + \").\";\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tvarStr = assignOpExpr.varExpr.arrayIndex == null ? VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + \".\" : VarCollector.mangleName(assignOpExpr.varExpr.name.literal) + \".resolveArray(\" + this.printExpr(assignOpExpr.varExpr.arrayIndex,expr_TypeReq.ReqString) + \").\";\n\t\t\tbreak;\n\t\t}\n\t\tlet varStr1;\n\t\tswitch(assignOpExpr.expr.getPrefferredType()._hx_index) {\n\t\tcase 1:\n\t\t\tvarStr1 = \"setIntValue(\" + assignValue + \")\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tvarStr1 = \"setFloatValue(\" + assignValue + \")\";\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tvarStr1 = \"setStringValue(\" + assignValue + \")\";\n\t\t\tbreak;\n\t\tdefault:\n\t\t\treturn \"\";\n\t\t}\n\t\tvarStr += varStr1;\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\tbreak;\n\t\tcase 1:case 2:case 3:\n\t\t\tvarStr = \"(() => {\" + varStr + \"; return \" + this.printVarExpr(assignOpExpr.varExpr,type) + \"; })()\";\n\t\t\tbreak;\n\t\t}\n\t\treturn varStr;\n\t}\n\tprintFuncCallExpr(funcCallExpr,type) {\n\t\tlet _gthis = this;\n\t\tlet _this = funcCallExpr.args;\n\t\tlet result = new Array(_this.length);\n\t\tlet _g = 0;\n\t\tlet _g1 = _this.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tresult[i] = _gthis.printExpr(_this[i],expr_TypeReq.ReqString);\n\t\t}\n\t\tlet paramStr = \"[\" + result.join(\", \") + \"]\";\n\t\tlet callTypeStr;\n\t\tswitch(funcCallExpr.callType) {\n\t\tcase 0:\n\t\t\tcallTypeStr = \"FunctionCall\";\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tcallTypeStr = \"MethodCall\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcallTypeStr = \"ParentCall\";\n\t\t\tbreak;\n\t\t}\n\t\tif(funcCallExpr.name.literal == \"eval\") {\n\t\t\tfuncCallExpr.name.literal = \"eval_js\";\n\t\t}\n\t\tlet callStr = \"__vm.callFunc(\" + (funcCallExpr.namespace != null ? \"\'\" + (funcCallExpr.namespace.literal == null ? \"null\" : Std.string(funcCallExpr.namespace.literal)) + \"\'\" : \"\'\'\") + \", \'\" + (funcCallExpr.name.literal == null ? \"null\" : Std.string(funcCallExpr.name.literal)) + \"\', \" + paramStr + \", \'\" + callTypeStr + \"\')\";\n\t\tswitch(type._hx_index) {\n\t\tcase 0:case 3:\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tcallStr = \"parseInt(\" + callStr + \")\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcallStr = \"parseFloat(\" + callStr + \")\";\n\t\t\tbreak;\n\t\t}\n\t\treturn callStr;\n\t}\n\tprintSlotAccessExpr(slotAccessExpr,type) {\n\t\tlet objStr = this.printExpr(slotAccessExpr.objectExpr,expr_TypeReq.ReqString);\n\t\tlet slotStr = \"__vm.slotAccess(\" + objStr + \", \'\" + (slotAccessExpr.slotName.literal == null ? \"null\" : Std.string(slotAccessExpr.slotName.literal)) + \"\', \" + (slotAccessExpr.arrayExpr != null ? this.printExpr(slotAccessExpr.arrayExpr,expr_TypeReq.ReqString) : \"null\") + \")\";\n\t\tlet retStr = slotStr;\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tretStr += \".getIntValue()\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tretStr += \".getFloatValue()\";\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tretStr += \".getStringValue()\";\n\t\t\tbreak;\n\t\t}\n\t\treturn retStr;\n\t}\n\tprintSlotAssignExpr(slotAssignExpr,type) {\n\t\tlet objStr = this.printExpr(slotAssignExpr.objectExpr,expr_TypeReq.ReqNone);\n\t\tlet slotStr = \"\'\" + (slotAssignExpr.slotName.literal == null ? \"null\" : Std.string(slotAssignExpr.slotName.literal)) + \"\'\";\n\t\tlet slotArrayStr = slotAssignExpr.arrayExpr != null ? this.printExpr(slotAssignExpr.arrayExpr,expr_TypeReq.ReqString) : \"null\";\n\t\tlet valueStr = this.printExpr(slotAssignExpr.expr,expr_TypeReq.ReqString);\n\t\tlet assignStr = \"__vm.slotAssign(\" + objStr + \", \" + slotStr + \", \" + slotArrayStr + \", \" + valueStr + \")\";\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tassignStr = \"parseInt(\" + assignStr + \")\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tassignStr = \"parseFloat(\" + assignStr + \")\";\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tassignStr = \"String(\" + assignStr + \")\";\n\t\t\tbreak;\n\t\t}\n\t\treturn assignStr;\n\t}\n\tprintSlotAssignOpExpr(slotAssignOpExpr,type) {\n\t\tslotAssignOpExpr.getAssignOpTypeOp();\n\t\tlet objAccessStr = this.printExpr(slotAssignOpExpr.objectExpr,expr_TypeReq.ReqString);\n\t\tlet objStr = this.printExpr(slotAssignOpExpr.objectExpr,expr_TypeReq.ReqNone);\n\t\tlet slotStr = \"\'\" + (slotAssignOpExpr.slotName.literal == null ? \"null\" : Std.string(slotAssignOpExpr.slotName.literal)) + \"\'\";\n\t\tlet slotArrayStr = slotAssignOpExpr.arrayExpr != null ? this.printExpr(slotAssignOpExpr.arrayExpr,expr_TypeReq.ReqString) : \"\";\n\t\tlet slotRetrieveStr = \"__vm.slotAccess(\" + objAccessStr + \", \'\" + (slotAssignOpExpr.slotName.literal == null ? \"null\" : Std.string(slotAssignOpExpr.slotName.literal)) + \"\', \" + (slotAssignOpExpr.arrayExpr != null ? this.printExpr(slotAssignOpExpr.arrayExpr,expr_TypeReq.ReqString) : \"null\") + \")\";\n\t\tlet valueStr = slotRetrieveStr + \".\";\n\t\tlet valueStr1;\n\t\tswitch(slotAssignOpExpr.subType._hx_index) {\n\t\tcase 0:case 3:\n\t\t\tvalueStr1 = \"getStringValue() \";\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tvalueStr1 = \"getIntValue() \";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tvalueStr1 = \"getFloatValue() \";\n\t\t\tbreak;\n\t\t}\n\t\tlet valueStr2 = valueStr + valueStr1;\n\t\tvalueStr2 += HxOverrides.substr(slotAssignOpExpr.op.lexeme,0,slotAssignOpExpr.op.lexeme.length - 1) + \" \" + this.printExpr(slotAssignOpExpr.expr,slotAssignOpExpr.subType);\n\t\tlet assignStr = \"__vm.slotAssign(\" + objStr + \", \" + slotStr + \", \" + slotArrayStr + \", \" + valueStr2 + \")\";\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tassignStr = \"parseInt(\" + assignStr + \")\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tassignStr = \"parseFloat(\" + assignStr + \")\";\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tassignStr = \"String(\" + assignStr + \")\";\n\t\t\tbreak;\n\t\t}\n\t\treturn assignStr;\n\t}\n\tprintObjectDeclExpr(objDeclExpr,type,root) {\n\t\tif(root == null) {\n\t\t\troot = true;\n\t\t}\n\t\tlet retExpr = \"__vm.newObject(\" + this.printExpr(objDeclExpr.className,expr_TypeReq.ReqString) + \", \" + this.printExpr(objDeclExpr.objectNameExpr,expr_TypeReq.ReqString) + \", \" + (objDeclExpr.structDecl == null ? \"null\" : \"\" + objDeclExpr.structDecl) + \", \" + (objDeclExpr.parentObject != null ? \"\'\" + (objDeclExpr.parentObject.literal == null ? \"null\" : Std.string(objDeclExpr.parentObject.literal)) + \"\'\" : null) + \", \" + (root == null ? \"null\" : \"\" + root) + \", \";\n\t\tif(objDeclExpr.slotDecls.length != 0) {\n\t\t\tretExpr += \"{\\n\";\n\t\t\tthis.indent++;\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = objDeclExpr.slotDecls.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tlet slotdecl = objDeclExpr.slotDecls[i];\n\t\t\t\tlet slotStr = slotdecl.slotName.literal;\n\t\t\t\tif(slotdecl.arrayExpr != null) {\n\t\t\t\t\tslotStr += \".resolveArray(\" + this.printExpr(slotdecl.arrayExpr,expr_TypeReq.ReqString) + \")\";\n\t\t\t\t}\n\t\t\t\tslotStr += \": \" + this.printExpr(slotdecl.expr,expr_TypeReq.ReqNone);\n\t\t\t\tretExpr += this.println(slotStr + (i < objDeclExpr.slotDecls.length - 1 ? \",\" : \"\"));\n\t\t\t}\n\t\t\tthis.indent--;\n\t\t\tlet _g2 = 0;\n\t\t\tlet _g3 = this.indent;\n\t\t\twhile(_g2 < _g3) {\n\t\t\t\tlet i = _g2++;\n\t\t\t\tretExpr += \"\\t\";\n\t\t\t}\n\t\t\tretExpr += this.print(\"}, \");\n\t\t} else {\n\t\t\tretExpr += \"{}, \";\n\t\t}\n\t\tif(objDeclExpr.subObjects.length != 0) {\n\t\t\tretExpr += \"[\\n\";\n\t\t\tthis.indent++;\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = objDeclExpr.subObjects.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tlet subObj = objDeclExpr.subObjects[i];\n\t\t\t\tretExpr += this.println(this.printObjectDeclExpr(subObj,expr_TypeReq.ReqNone,false) + (i < objDeclExpr.subObjects.length - 1 ? \",\" : \"\"));\n\t\t\t}\n\t\t\tthis.indent--;\n\t\t\tlet _g2 = 0;\n\t\t\tlet _g3 = this.indent;\n\t\t\twhile(_g2 < _g3) {\n\t\t\t\tlet i = _g2++;\n\t\t\t\tretExpr += \"\\t\";\n\t\t\t}\n\t\t\tretExpr += this.print(\"])\");\n\t\t} else {\n\t\t\tretExpr += \"[])\";\n\t\t}\n\t\tlet retExpr1;\n\t\tswitch(type._hx_index) {\n\t\tcase 0:\n\t\t\tretExpr1 = \"\";\n\t\t\tbreak;\n\t\tcase 1:\n\t\t\tretExpr1 = \".getIntValue()\";\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tretExpr1 = \".getFloatValue()\";\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tretExpr1 = \".getStringValue()\";\n\t\t\tbreak;\n\t\t}\n\t\tretExpr += retExpr1;\n\t\treturn retExpr;\n\t}\n\tconversionOp(src,dest,exprStr) {\n\t\tswitch(src._hx_index) {\n\t\tcase 1:\n\t\t\tswitch(dest._hx_index) {\n\t\t\tcase 0:\n\t\t\t\treturn \"(() => { \" + exprStr + \"; return 0; })()\";\n\t\t\tcase 2:\n\t\t\t\treturn exprStr;\n\t\t\tcase 3:\n\t\t\t\treturn \"String(\" + exprStr + \")\";\n\t\t\tdefault:\n\t\t\t\treturn exprStr;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tswitch(dest._hx_index) {\n\t\t\tcase 0:\n\t\t\t\treturn \"(() => { \" + exprStr + \"; return 0.0; })()\";\n\t\t\tcase 1:\n\t\t\t\treturn \"Math.round(\" + exprStr + \")\";\n\t\t\tcase 3:\n\t\t\t\treturn \"String(\" + exprStr + \")\";\n\t\t\tdefault:\n\t\t\t\treturn exprStr;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tswitch(dest._hx_index) {\n\t\t\tcase 0:\n\t\t\t\treturn \"(() => { \" + exprStr + \"; return \\\"\\\"; })()\";\n\t\t\tcase 1:\n\t\t\t\treturn \"parseInt(\" + exprStr + \")\";\n\t\t\tcase 2:\n\t\t\t\treturn \"parseFloat(\" + exprStr + \")\";\n\t\t\tdefault:\n\t\t\t\treturn exprStr;\n\t\t\t}\n\t\t\tbreak;\n\t\tdefault:\n\t\t\treturn exprStr;\n\t\t}\n\t}\n\tprint(str) {\n\t\treturn str;\n\t}\n\tprintln(str) {\n\t\tlet indentStr = \"\";\n\t\tlet _g = 0;\n\t\tlet _g1 = this.indent;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tindentStr += \"    \";\n\t\t}\n\t\treturn indentStr + str + \"\\n\";\n\t}\n\tstatic bootstrapEmbed() {\n\t\treturn StringTools.replace(JSGenerator.embedLib,\"__\" + \"EMBED_LIB\" + \"__\",Scanner.escape(JSGenerator.embedLib)) + \"\\n\";\n\t}\n}\n$hx_exports[\"JSGenerator\"] = JSGenerator;\nJSGenerator.__name__ = true;\nObject.assign(JSGenerator.prototype, {\n\t__class__: JSGenerator\n});\nclass Log {\n\tstatic outputFunction(text,newline) {\n\t\tif(newline) {\n\t\t\tconsole.log(Log.savedStr + text);\n\t\t\tLog.savedStr = \"\";\n\t\t} else {\n\t\t\tLog.savedStr += text;\n\t\t}\n\t}\n\tstatic println(text) {\n\t\tLog.outputFunction(text,true);\n\t}\n\tstatic print(text) {\n\t\tLog.outputFunction(text,false);\n\t}\n\tstatic setOutputFunction(func) {\n\t\tLog.outputFunction = func;\n\t}\n}\n$hx_exports[\"Log\"] = Log;\nLog.__name__ = true;\nMath.__name__ = true;\nclass Optimizer {\n\tconstructor(ast) {\n\t\tthis.ast = ast;\n\t\tthis.optimizerPasses = [new optimizer_ConstantFoldingPass()];\n\t}\n\toptimize(level) {\n\t\tlet _g = 0;\n\t\tlet _g1 = this.optimizerPasses;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet pass = _g1[_g];\n\t\t\t++_g;\n\t\t\tif(pass.getLevel() <= level) {\n\t\t\t\tpass.optimize(this.ast);\n\t\t\t}\n\t\t}\n\t}\n\tgetAST() {\n\t\treturn this.ast;\n\t}\n}\nOptimizer.__name__ = true;\nObject.assign(Optimizer.prototype, {\n\t__class__: Optimizer\n});\nclass Parser {\n\tconstructor(tokens) {\n\t\tthis.syntaxErrors = [];\n\t\tthis.panicMode = false;\n\t\tthis.current = 0;\n\t\tthis.tokens = [];\n\t\tthis.comments = [];\n\t\tthis.positionStack = new haxe_ds_GenericStack();\n\t\tlet _g = 0;\n\t\twhile(_g < tokens.length) {\n\t\t\tlet token = tokens[_g];\n\t\t\t++_g;\n\t\t\tlet _g1 = token.type;\n\t\t\tif(_g1._hx_index == 80) {\n\t\t\t\tlet multiline = _g1.multiline;\n\t\t\t\tthis.comments.push(token);\n\t\t\t} else {\n\t\t\t\tthis.tokens.push(token);\n\t\t\t}\n\t\t}\n\t}\n\tparse() {\n\t\treturn this.start();\n\t}\n\tstart() {\n\t\tlet decls = [];\n\t\tlet d = this.decl();\n\t\twhile(d[0] != null) {\n\t\t\tdecls = decls.concat(d);\n\t\t\td = this.decl();\n\t\t}\n\t\tlet _g = 0;\n\t\tlet _g1 = this.syntaxErrors;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet err = _g1[_g];\n\t\t\t++_g;\n\t\t\tLog.println(err.toString());\n\t\t}\n\t\tif(this.syntaxErrors.length != 0) {\n\t\t\tthrow new haxe_Exception(\"Syntax errors while parsing\");\n\t\t}\n\t\treturn decls;\n\t}\n\tdecl() {\n\t\ttry {\n\t\t\tlet pkfuncs = this.packageDecl();\n\t\t\tlet d = null;\n\t\t\tif(pkfuncs == null) {\n\t\t\t\td = this.functionDecl();\n\t\t\t\tif(d == null) {\n\t\t\t\t\td = this.stmt();\n\t\t\t\t}\n\t\t\t}\n\t\t\tif(pkfuncs != null) {\n\t\t\t\tlet result = new Array(pkfuncs.length);\n\t\t\t\tlet _g = 0;\n\t\t\t\tlet _g1 = pkfuncs.length;\n\t\t\t\twhile(_g < _g1) {\n\t\t\t\t\tlet i = _g++;\n\t\t\t\t\tresult[i] = pkfuncs[i];\n\t\t\t\t}\n\t\t\t\treturn result;\n\t\t\t} else {\n\t\t\t\treturn [d];\n\t\t\t}\n\t\t} catch( _g ) {\n\t\t\tlet _g1 = haxe_Exception.caught(_g);\n\t\t\tif(((_g1) instanceof SyntaxError)) {\n\t\t\t\tlet err = _g1;\n\t\t\t\tif(!this.panicMode) {\n\t\t\t\t\tthis.syntaxErrors.push(err);\n\t\t\t\t\tthis.panicMode = true;\n\t\t\t\t}\n\t\t\t\twhile(!this.match([TokenType.Semicolon,TokenType.Eof]) && !this.isAtEnd()) this.advance();\n\t\t\t\tthis.advance();\n\t\t\t\tthis.panicMode = false;\n\t\t\t\treturn this.decl();\n\t\t\t} else {\n\t\t\t\tthrow _g;\n\t\t\t}\n\t\t}\n\t}\n\tpackageDecl() {\n\t\tif(this.match([TokenType.Package])) {\n\t\t\tthis.advance();\n\t\t\tlet name = this.consume(TokenType.Label,\"Expected package name\");\n\t\t\tthis.consume(TokenType.LBracket,\"Expected \'{\' before package name\");\n\t\t\tlet decls = [];\n\t\t\tlet d = this.functionDecl();\n\t\t\td.packageName = name;\n\t\t\tif(d == null) {\n\t\t\t\tthrow new SyntaxError(\"Expected function declaration\",this.tokens[this.current - 1]);\n\t\t\t}\n\t\t\twhile(d != null) {\n\t\t\t\tdecls.push(d);\n\t\t\t\td = this.functionDecl();\n\t\t\t\tif(d != null) {\n\t\t\t\t\td.packageName = name;\n\t\t\t\t}\n\t\t\t}\n\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after package functions\");\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after package block\");\n\t\t\treturn decls;\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tfunctionDecl() {\n\t\tif(this.match([TokenType.Function])) {\n\t\t\tthis.advance();\n\t\t\tlet fnname = this.consume(TokenType.Label,\"Expected function name\");\n\t\t\tlet parentname = null;\n\t\t\tlet parameters = [];\n\t\t\tif(this.match([TokenType.DoubleColon])) {\n\t\t\t\tthis.advance();\n\t\t\t\tlet temp = this.consume(TokenType.Label,\"Expected function name\");\n\t\t\t\tparentname = fnname;\n\t\t\t\tfnname = temp;\n\t\t\t}\n\t\t\tthis.consume(TokenType.LParen,\"Expected \'(\' after function name\");\n\t\t\tlet vardecl = this.variable();\n\t\t\twhile(vardecl != null) {\n\t\t\t\tparameters.push(vardecl);\n\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\tvardecl = this.variable();\n\t\t\t\t\tif(vardecl == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected variable declaration\",this.tokens[this.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tvardecl = null;\n\t\t\t\t}\n\t\t\t}\n\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after function parameters\");\n\t\t\tthis.consume(TokenType.LBracket,\"Expected \'{\' before function body\");\n\t\t\tlet body = this.statementList();\n\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after function body\");\n\t\t\treturn new expr_FunctionDeclStmt(fnname,parameters,body,parentname);\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tstatementList() {\n\t\tlet stmts = [];\n\t\ttry {\n\t\t\tlet s = this.stmt();\n\t\t\twhile(s != null) {\n\t\t\t\tstmts.push(s);\n\t\t\t\ts = this.stmt();\n\t\t\t}\n\t\t} catch( _g ) {\n\t\t\tlet _g1 = haxe_Exception.caught(_g);\n\t\t\tif(((_g1) instanceof SyntaxError)) {\n\t\t\t\tlet err = _g1;\n\t\t\t\tif(!this.panicMode) {\n\t\t\t\t\tthis.syntaxErrors.push(err);\n\t\t\t\t\tthis.panicMode = true;\n\t\t\t\t}\n\t\t\t\twhile(!this.match([TokenType.Semicolon,TokenType.Eof]) && !this.isAtEnd()) this.advance();\n\t\t\t\tthis.advance();\n\t\t\t\tthis.panicMode = false;\n\t\t\t\treturn stmts.concat(this.statementList());\n\t\t\t} else {\n\t\t\t\tthrow _g;\n\t\t\t}\n\t\t}\n\t\treturn stmts;\n\t}\n\tvariable() {\n\t\tlet varName = \"\";\n\t\tlet varType;\n\t\tlet varStart = [TokenType.Label,TokenType.Package,TokenType.Return,TokenType.Break,TokenType.Continue,TokenType.While,TokenType.False,TokenType.True,TokenType.Function,TokenType.Else,TokenType.If,TokenType.Datablock,TokenType.Case,TokenType.SpaceConcat,TokenType.TabConcat,TokenType.NewlineConcat,TokenType.Default,TokenType.New];\n\t\tlet varMid = [TokenType.DoubleColon];\n\t\tlet varEnd = [TokenType.Label,TokenType.Package,TokenType.Default,TokenType.Return,TokenType.Break,TokenType.Continue,TokenType.While,TokenType.False,TokenType.True,TokenType.Function,TokenType.Else,TokenType.If,TokenType.New,TokenType.Int,TokenType.Datablock,TokenType.Case];\n\t\tif(this.match([TokenType.Dollar,TokenType.Modulus])) {\n\t\t\tlet typetok = this.advance();\n\t\t\tswitch(typetok.type._hx_index) {\n\t\t\tcase 19:\n\t\t\t\tvarType = expr_VarType.Local;\n\t\t\t\tbreak;\n\t\t\tcase 74:\n\t\t\t\tvarType = expr_VarType.Global;\n\t\t\t\tbreak;\n\t\t\tdefault:\n\t\t\t\tthrow new SyntaxError(\"Unexpected token \" + Std.string(typetok.type),typetok);\n\t\t\t}\n\t\t\tif(this.match(varStart)) {\n\t\t\t\tvarName = this.advance().literal;\n\t\t\t\twhile(this.match(varMid)) {\n\t\t\t\t\tlet tok = this.advance();\n\t\t\t\t\tvarName += tok.type._hx_index == 68 ? \"::\" : tok.literal;\n\t\t\t\t\twhile(this.match(varEnd)) {\n\t\t\t\t\t\tlet tmp = this.advance().literal;\n\t\t\t\t\t\tvarName += tmp == null ? \"null\" : Std.string(tmp);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tlet retexpr = new expr_VarExpr(new Token(TokenType.Label,varName,varName,typetok.line,typetok.position),null,varType);\n\t\t\t\treturn retexpr;\n\t\t\t} else {\n\t\t\t\tthrow new SyntaxError(\"Expected variable name\",this.tokens[this.current - 1]);\n\t\t\t}\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tstmt() {\n\t\tlet e = this.breakStmt();\n\t\tif(e == null) {\n\t\t\te = this.returnStmt();\n\t\t}\n\t\tif(e == null) {\n\t\t\te = this.continueStmt();\n\t\t}\n\t\tif(e == null) {\n\t\t\te = this.expressionStmt();\n\t\t}\n\t\tif(e == null) {\n\t\t\te = this.switchStmt();\n\t\t}\n\t\tif(e == null) {\n\t\t\te = this.datablockStmt();\n\t\t}\n\t\tif(e == null) {\n\t\t\te = this.forStmt();\n\t\t}\n\t\tif(e == null) {\n\t\t\te = this.whileStmt();\n\t\t}\n\t\tif(e == null) {\n\t\t\te = this.ifStmt();\n\t\t}\n\t\treturn e;\n\t}\n\treturnStmt() {\n\t\tif(this.match([TokenType.Return])) {\n\t\t\tlet line = this.peek().line;\n\t\t\tthis.advance();\n\t\t\tif(this.match([TokenType.Semicolon])) {\n\t\t\t\tthis.advance();\n\t\t\t\treturn new expr_ReturnStmt(line,null);\n\t\t\t} else {\n\t\t\t\tlet expr = this.expression();\n\t\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after return expression\");\n\t\t\t\treturn new expr_ReturnStmt(line,expr);\n\t\t\t}\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tcontinueStmt() {\n\t\tif(this.match([TokenType.Continue])) {\n\t\t\tlet line = this.peek().line;\n\t\t\tthis.advance();\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after continue\");\n\t\t\treturn new expr_ContinueStmt(line);\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tbreakStmt() {\n\t\tif(this.match([TokenType.Break])) {\n\t\t\tlet line = this.peek().line;\n\t\t\tthis.advance();\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after break\");\n\t\t\treturn new expr_BreakStmt(line);\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tswitchStmt() {\n\t\tif(this.match([TokenType.Switch])) {\n\t\t\tlet switchLine = this.peek().line;\n\t\t\tthis.advance();\n\t\t\tlet isStringSwitch = false;\n\t\t\tif(this.match([TokenType.Dollar])) {\n\t\t\t\tthis.advance();\n\t\t\t\tisStringSwitch = true;\n\t\t\t}\n\t\t\tthis.consume(TokenType.LParen,\"Expected \'(\' after switch\");\n\t\t\tlet expr = this.expression();\n\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after switch expression\");\n\t\t\tthis.consume(TokenType.LBracket,\"Expected \'{\' before switch body\");\n\t\t\tlet cases = this.caseBlock();\n\t\t\tif(cases == null) {\n\t\t\t\tthrow new SyntaxError(\"Expected switch cases\",this.tokens[this.current - 1]);\n\t\t\t}\n\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after switch body\");\n\t\t\tlet generateCaseCheckExpr = function(caseData) {\n\t\t\t\tlet checkExpr = null;\n\t\t\t\tif(isStringSwitch) {\n\t\t\t\t\tcheckExpr = new expr_StrEqExpr(expr,caseData.conditions[0],new Token(TokenType.StringEquals,\"$=\",\"$=\",0,0));\n\t\t\t\t\tcaseData.conditions.shift();\n\t\t\t\t\twhile(caseData.conditions.length > 0) checkExpr = new expr_IntBinaryExpr(checkExpr,new expr_StrEqExpr(expr,caseData.conditions.shift(),new Token(TokenType.StringEquals,\"$=\",\"$=\",0,0)),new Token(TokenType.LogicalOr,\"||\",\"||\",0,0));\n\t\t\t\t\treturn checkExpr;\n\t\t\t\t} else {\n\t\t\t\t\tcheckExpr = new expr_IntBinaryExpr(expr,caseData.conditions[0],new Token(TokenType.Equal,\"==\",\"==\",0,0));\n\t\t\t\t\tcaseData.conditions.shift();\n\t\t\t\t\twhile(caseData.conditions.length > 0) checkExpr = new expr_IntBinaryExpr(checkExpr,new expr_IntBinaryExpr(expr,caseData.conditions.shift(),new Token(TokenType.Equal,\"==\",\"==\",0,0)),new Token(TokenType.LogicalOr,\"||\",\"||\",0,0));\n\t\t\t\t\treturn checkExpr;\n\t\t\t\t}\n\t\t\t};\n\t\t\tlet ifStmt = new expr_IfStmt(switchLine,generateCaseCheckExpr(cases),cases.stmts,null);\n\t\t\tif(cases.next == null) {\n\t\t\t\tif(cases.defaultStmts != null) {\n\t\t\t\t\tif(cases.defaultStmts.length != 0) {\n\t\t\t\t\t\tifStmt.elseBlock = cases.defaultStmts;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tlet itrIf = ifStmt;\n\t\t\t\twhile(cases.next != null) {\n\t\t\t\t\tlet cond = generateCaseCheckExpr(cases.next);\n\t\t\t\t\titrIf.elseBlock = [new expr_IfStmt(cond.lineNo,cond,cases.next.stmts,null)];\n\t\t\t\t\titrIf = itrIf.elseBlock[0];\n\t\t\t\t\tcases = cases.next;\n\t\t\t\t\tif(cases.defaultStmts != null) {\n\t\t\t\t\t\titrIf.elseBlock = cases.defaultStmts;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn ifStmt;\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tcaseBlock() {\n\t\tif(this.match([TokenType.Case])) {\n\t\t\tthis.advance();\n\t\t\tlet caseExprs = [];\n\t\t\tlet caseExpr = this.expression();\n\t\t\twhile(caseExpr != null) {\n\t\t\t\tcaseExprs.push(caseExpr);\n\t\t\t\tif(this.match([TokenType.Or])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\tcaseExpr = this.expression();\n\t\t\t\t} else {\n\t\t\t\t\tbreak;\n\t\t\t\t}\n\t\t\t}\n\t\t\tthis.consume(TokenType.Colon,\"Expected \':\' after case expression\");\n\t\t\tlet stmtList = this.statementList();\n\t\t\tlet nextCase = this.caseBlock();\n\t\t\tif(nextCase == null) {\n\t\t\t\tlet defExprs = null;\n\t\t\t\tif(this.match([TokenType.Default])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\tthis.consume(TokenType.Colon,\"Expected \':\' after default\");\n\t\t\t\t\tdefExprs = this.statementList();\n\t\t\t\t}\n\t\t\t\treturn { conditions : caseExprs, stmts : stmtList, defaultStmts : defExprs, next : null};\n\t\t\t} else {\n\t\t\t\treturn { conditions : caseExprs, stmts : stmtList, defaultStmts : null, next : nextCase};\n\t\t\t}\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tdatablockStmt() {\n\t\tif(this.match([TokenType.Datablock])) {\n\t\t\tthis.advance();\n\t\t\tlet className = this.consume(TokenType.Label,\"Expected identifier after datablock\");\n\t\t\tthis.consume(TokenType.LParen,\"Expected \'(\' after datablock name\");\n\t\t\tlet name = this.consume(TokenType.Label,\"Expected identifier after datablock name\");\n\t\t\tlet parentName = null;\n\t\t\tif(this.match([TokenType.Colon])) {\n\t\t\t\tthis.advance();\n\t\t\t\tparentName = this.consume(TokenType.Label,\"Expected identifier after datablock name\");\n\t\t\t}\n\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after datablock name\");\n\t\t\tthis.consume(TokenType.LBracket,\"Expected \'{\' before datablock body\");\n\t\t\tlet slots = [];\n\t\t\tlet slot = this.slotAssign();\n\t\t\tif(slot == null) {\n\t\t\t\tthrow new SyntaxError(\"Expected slot assignment\",this.tokens[this.current - 1]);\n\t\t\t}\n\t\t\twhile(slot != null) {\n\t\t\t\tslots.push(slot);\n\t\t\t\tslot = this.slotAssign();\n\t\t\t}\n\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after datablock body\");\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after datablock body\");\n\t\t\tlet dbdecl = new expr_ObjectDeclExpr(new expr_ConstantExpr(className),parentName,new expr_ConstantExpr(name),[],slots,[],true);\n\t\t\tdbdecl.structDecl = true;\n\t\t\treturn dbdecl;\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tslotAssign() {\n\t\tif(this.match([TokenType.Label])) {\n\t\t\tlet slotName = this.consume(TokenType.Label,\"Expected identifier after slot assignment\");\n\t\t\tlet arrayIdx = null;\n\t\t\tif(this.match([TokenType.LeftSquareBracket])) {\n\t\t\t\tthis.advance();\n\t\t\t\tarrayIdx = null;\n\t\t\t\tlet arrayExpr = this.expression();\n\t\t\t\tif(arrayExpr == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected expression after \'[\'\",this.tokens[this.current - 1]);\n\t\t\t\t}\n\t\t\t\twhile(arrayExpr != null) {\n\t\t\t\t\tif(arrayIdx == null) {\n\t\t\t\t\t\tarrayIdx = arrayExpr;\n\t\t\t\t\t} else {\n\t\t\t\t\t\tarrayIdx = new expr_CommaCatExpr(arrayIdx,arrayExpr);\n\t\t\t\t\t}\n\t\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\t\tthis.advance();\n\t\t\t\t\t\tarrayExpr = this.expression();\n\t\t\t\t\t} else {\n\t\t\t\t\t\tbreak;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tthis.consume(TokenType.RightSquareBracket,\"Expected \']\' after array index\");\n\t\t\t}\n\t\t\tthis.consume(TokenType.Assign,\"Expected \'=\' after slot assignment\");\n\t\t\tlet slotExpr = this.expression();\n\t\t\tif(slotExpr == null) {\n\t\t\t\tthrow new SyntaxError(\"Expected expression after \'=\'\",this.tokens[this.current - 1]);\n\t\t\t}\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after slot assignment\");\n\t\t\treturn new expr_SlotAssignExpr(null,arrayIdx,slotName,slotExpr);\n\t\t} else if(this.match([TokenType.Datablock])) {\n\t\t\tlet slotName = this.advance();\n\t\t\tthis.consume(TokenType.Assign,\"Expected \'=\' after slot assignment\");\n\t\t\tlet slotExpr = this.expression();\n\t\t\tif(slotExpr == null) {\n\t\t\t\tthrow new SyntaxError(\"Expected expression after \'=\'\",this.tokens[this.current - 1]);\n\t\t\t}\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after slot assignment\");\n\t\t\treturn new expr_SlotAssignExpr(null,null,slotName,slotExpr);\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tforStmt() {\n\t\tif(this.match([TokenType.For])) {\n\t\t\tlet forLine = this.peek().line;\n\t\t\tthis.advance();\n\t\t\tthis.consume(TokenType.LParen,\"Expected \'(\' after \'for\'\");\n\t\t\tlet initExpr = this.expression();\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after initializer in for loop\");\n\t\t\tlet condExpr = this.expression();\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after condition in for loop\");\n\t\t\tlet iterExpr = this.expression();\n\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after iteration in for loop\");\n\t\t\tlet body = [];\n\t\t\tlet islist = false;\n\t\t\tif(this.match([TokenType.LBracket])) {\n\t\t\t\tthis.advance();\n\t\t\t\tbody = this.statementList();\n\t\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after for loop body\");\n\t\t\t\tislist = true;\n\t\t\t} else {\n\t\t\t\tbody = [this.stmt()];\n\t\t\t}\n\t\t\tlet loopstmt = new expr_LoopStmt(forLine,condExpr,initExpr,iterExpr,body);\n\t\t\tloopstmt.isForLoop = true;\n\t\t\tloopstmt.isStatementList = islist;\n\t\t\treturn loopstmt;\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\twhileStmt() {\n\t\tif(this.match([TokenType.While])) {\n\t\t\tlet whileLine = this.peek().line;\n\t\t\tthis.advance();\n\t\t\tthis.consume(TokenType.LParen,\"Expected \'(\' after \'while\'\");\n\t\t\tlet condExpr = this.expression();\n\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after condition in while loop\");\n\t\t\tlet body = [];\n\t\t\tlet islist = false;\n\t\t\tif(this.match([TokenType.LBracket])) {\n\t\t\t\tthis.advance();\n\t\t\t\tbody = this.statementList();\n\t\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after for loop body\");\n\t\t\t\tislist = true;\n\t\t\t} else {\n\t\t\t\tbody = [this.stmt()];\n\t\t\t}\n\t\t\tlet loopstmt = new expr_LoopStmt(whileLine,condExpr,null,null,body);\n\t\t\tloopstmt.isStatementList = islist;\n\t\t\treturn loopstmt;\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tifStmt() {\n\t\tif(this.match([TokenType.If])) {\n\t\t\tlet ifLine = this.peek().line;\n\t\t\tthis.advance();\n\t\t\tthis.consume(TokenType.LParen,\"Expected \'(\' after \'if\'\");\n\t\t\tlet condExpr = this.expression();\n\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after condition in if statement\");\n\t\t\tlet bodylist = false;\n\t\t\tlet elselist = false;\n\t\t\tlet body = [];\n\t\t\tif(this.match([TokenType.LBracket])) {\n\t\t\t\tthis.advance();\n\t\t\t\tbody = this.statementList();\n\t\t\t\tbodylist = true;\n\t\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after if statement body\");\n\t\t\t} else {\n\t\t\t\tbody = [this.stmt()];\n\t\t\t}\n\t\t\tlet elseBody = null;\n\t\t\tif(this.match([TokenType.Else])) {\n\t\t\t\tthis.advance();\n\t\t\t\tif(this.match([TokenType.LBracket])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\telseBody = this.statementList();\n\t\t\t\t\tif(elseBody.length == 0) {\n\t\t\t\t\t\telseBody = null;\n\t\t\t\t\t}\n\t\t\t\t\telselist = true;\n\t\t\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\' after else statement body\");\n\t\t\t\t} else {\n\t\t\t\t\telseBody = [this.stmt()];\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn new expr_IfStmt(ifLine,condExpr,body,elseBody);\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\texpressionStmt() {\n\t\tlet exprstmt = this.stmtExpr();\n\t\tif(exprstmt != null) {\n\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after expression statement\");\n\t\t}\n\t\treturn exprstmt;\n\t}\n\tstmtExpr() {\n\t\tlet curPos = this.current;\n\t\tlet expr = this.expression();\n\t\tif(expr != null) {\n\t\t\tif(this.match([TokenType.Dot])) {\n\t\t\t\tconsole.log(\"src/Parser.hx:611:\",\"HERE!!!\");\n\t\t\t\tthis.advance();\n\t\t\t\tlet labelAccess = this.consume(TokenType.Label,\"Expected label after expression\");\n\t\t\t\tlet arrAccess = null;\n\t\t\t\tif(this.match([TokenType.LeftSquareBracket])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\tarrAccess = null;\n\t\t\t\t\tlet arrExpr = this.expression();\n\t\t\t\t\tif(arrExpr == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after \'[\'\",this.tokens[this.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\twhile(arrExpr != null) {\n\t\t\t\t\t\tif(arrAccess == null) {\n\t\t\t\t\t\t\tarrAccess = arrExpr;\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tarrAccess = new expr_CommaCatExpr(arrAccess,arrExpr);\n\t\t\t\t\t\t}\n\t\t\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\t\t\tthis.advance();\n\t\t\t\t\t\t\tarrExpr = this.expression();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tthis.consume(TokenType.RightSquareBracket,\"Expected \']\' after array index\");\n\t\t\t\t}\n\t\t\t\tlet nextTok = this.advance();\n\t\t\t\tswitch(nextTok.type._hx_index) {\n\t\t\t\tcase 20:\n\t\t\t\t\tlet rexpr = this.expression();\n\t\t\t\t\treturn new expr_SlotAssignExpr(expr,arrAccess,labelAccess,rexpr);\n\t\t\t\tcase 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:\n\t\t\t\t\tlet rexpr1 = this.expression();\n\t\t\t\t\treturn new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,rexpr1,nextTok);\n\t\t\t\tcase 63:\n\t\t\t\t\tif(arrAccess == null) {\n\t\t\t\t\t\tlet funcexprs = [expr];\n\t\t\t\t\t\tlet funcexpr = this.expression();\n\t\t\t\t\t\twhile(funcexpr != null) {\n\t\t\t\t\t\t\tfuncexprs.push(funcexpr);\n\t\t\t\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t\tthis.advance();\n\t\t\t\t\t\t\t\tfuncexpr = this.expression();\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\tthis.consume(TokenType.RParen,\"Expected \')\' after function call arguments\");\n\t\t\t\t\t\treturn new expr_FuncCallExpr(labelAccess,null,funcexprs,1);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tthrow new SyntaxError(\"Cannot call array methods with a dot notation accessor\",this.tokens[this.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\t\t\t\tcase 76:case 77:\n\t\t\t\t\treturn new expr_ParenthesisExpr(new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,null,nextTok));\n\t\t\t\tdefault:\n\t\t\t\t\tthis.current = curPos;\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t} else if(((expr) instanceof expr_VarExpr)) {\n\t\t\t\tlet varExpr = expr;\n\t\t\t\tlet arrAccess = null;\n\t\t\t\tif(this.match([TokenType.LeftSquareBracket])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\tarrAccess = [];\n\t\t\t\t\tlet arrExpr = this.expression();\n\t\t\t\t\tif(arrExpr == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after \'[\'\",this.tokens[this.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\twhile(arrExpr != null) {\n\t\t\t\t\t\tarrAccess.push(arrExpr);\n\t\t\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\t\t\tthis.advance();\n\t\t\t\t\t\t\tarrExpr = this.expression();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tthis.consume(TokenType.RightSquareBracket,\"Expected \']\' after array index\");\n\t\t\t\t}\n\t\t\t\tlet nextTok = this.advance();\n\t\t\t\tswitch(nextTok.type._hx_index) {\n\t\t\t\tcase 20:\n\t\t\t\t\tlet rexpr = this.expression();\n\t\t\t\t\treturn new expr_AssignExpr(varExpr,rexpr);\n\t\t\t\tcase 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:\n\t\t\t\t\tlet rexpr1 = this.expression();\n\t\t\t\t\treturn new expr_AssignOpExpr(varExpr,rexpr1,nextTok);\n\t\t\t\tcase 76:case 77:\n\t\t\t\t\treturn new expr_ParenthesisExpr(new expr_AssignOpExpr(varExpr,null,nextTok));\n\t\t\t\tdefault:\n\t\t\t\t\tthis.current = curPos;\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn expr;\n\t\t\t}\n\t\t} else {\n\t\t\tlet varExpr = this.variable();\n\t\t\tif(varExpr != null) {\n\t\t\t\tlet arrAccess = null;\n\t\t\t\tif(this.match([TokenType.LeftSquareBracket])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\tarrAccess = [];\n\t\t\t\t\tlet arrExpr = this.expression();\n\t\t\t\t\tif(arrExpr == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after \'[\'\",this.tokens[this.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\twhile(arrExpr != null) {\n\t\t\t\t\t\tarrAccess.push(arrExpr);\n\t\t\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\t\t\tthis.advance();\n\t\t\t\t\t\t\tarrExpr = this.expression();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tthis.consume(TokenType.RightSquareBracket,\"Expected \']\' after array index\");\n\t\t\t\t}\n\t\t\t\tlet nextTok = this.advance();\n\t\t\t\tswitch(nextTok.type._hx_index) {\n\t\t\t\tcase 20:\n\t\t\t\t\tlet rexpr = this.expression();\n\t\t\t\t\treturn new expr_AssignExpr(varExpr,rexpr);\n\t\t\t\tcase 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:\n\t\t\t\t\tlet rexpr1 = this.expression();\n\t\t\t\t\treturn new expr_AssignOpExpr(varExpr,rexpr1,nextTok);\n\t\t\t\tcase 76:case 77:\n\t\t\t\t\treturn new expr_ParenthesisExpr(new expr_AssignOpExpr(varExpr,null,nextTok));\n\t\t\t\tdefault:\n\t\t\t\t\tthis.current = curPos;\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tlet objD = this.objectDecl();\n\t\t\t\tif(objD != null) {\n\t\t\t\t\treturn objD;\n\t\t\t\t} else if(this.match([TokenType.Label])) {\n\t\t\t\t\tlet funcname = this.consume(TokenType.Label,\"Expected any expression statement\");\n\t\t\t\t\tlet parentname = null;\n\t\t\t\t\tif(this.match([TokenType.DoubleColon])) {\n\t\t\t\t\t\tlet temp = this.consume(TokenType.Label,\"Expected function name\");\n\t\t\t\t\t\tparentname = funcname;\n\t\t\t\t\t\tfuncname = temp;\n\t\t\t\t\t}\n\t\t\t\t\tthis.consume(TokenType.LParen,\"Expected parenthesis after function name\");\n\t\t\t\t\tlet funcexprs = [];\n\t\t\t\t\tlet funcexpr = this.expression();\n\t\t\t\t\twhile(funcexpr != null) {\n\t\t\t\t\t\tfuncexprs.push(funcexpr);\n\t\t\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\t\t\tthis.advance();\n\t\t\t\t\t\t\tfuncexpr = this.expression();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tthis.consume(TokenType.RParen,\"Expected \')\' after function parameters\");\n\t\t\t\t\treturn new expr_FuncCallExpr(funcname,parentname,funcexprs,(js_Boot.__cast(parentname.literal , String)).toLowerCase() == \"parent\" ? 2 : 0);\n\t\t\t\t} else {\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\tobjectDecl() {\n\t\tif(this.match([TokenType.New])) {\n\t\t\tthis.advance();\n\t\t\tlet classNameExpr = null;\n\t\t\tif(this.match([TokenType.LParen])) {\n\t\t\t\tthis.advance();\n\t\t\t\tclassNameExpr = new expr_ParenthesisExpr(this.expression());\n\t\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after class name\");\n\t\t\t} else {\n\t\t\t\tclassNameExpr = new expr_ConstantExpr(this.consume(TokenType.Label,\"Expected class name\"));\n\t\t\t}\n\t\t\tthis.consume(TokenType.LParen,\"Expected \'(\' after class name\");\n\t\t\tlet objNameExpr = null;\n\t\t\tlet parentObj = null;\n\t\t\tlet objArgs = [];\n\t\t\tif(!this.match([TokenType.RParen])) {\n\t\t\t\tobjNameExpr = this.expression();\n\t\t\t\tif(this.match([TokenType.Colon])) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t\tparentObj = this.consume(TokenType.Label,\"Expected parent object name\");\n\t\t\t\t}\n\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\tobjArgs = [];\n\t\t\t\t\tlet objArg = this.expression();\n\t\t\t\t\twhile(objArg != null) {\n\t\t\t\t\t\tobjArgs.push(objArg);\n\t\t\t\t\t\tif(this.match([TokenType.Comma])) {\n\t\t\t\t\t\t\tthis.advance();\n\t\t\t\t\t\t\tobjArg = this.expression();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tthis.consumeSynchronize(TokenType.RParen,\"Expected \')\' after object parameters\");\n\t\t\t} else {\n\t\t\t\tthis.advance();\n\t\t\t}\n\t\t\tif(this.match([TokenType.LBracket])) {\n\t\t\t\tthis.advance();\n\t\t\t\tlet slotAssigns = [];\n\t\t\t\tlet sa = this.slotAssign();\n\t\t\t\twhile(sa != null) {\n\t\t\t\t\tslotAssigns.push(sa);\n\t\t\t\t\tsa = this.slotAssign();\n\t\t\t\t}\n\t\t\t\tlet subObjects = [];\n\t\t\t\tlet so = this.objectDecl();\n\t\t\t\tif(so != null) {\n\t\t\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after object declaration\");\n\t\t\t\t}\n\t\t\t\twhile(so != null) {\n\t\t\t\t\tsubObjects.push(so);\n\t\t\t\t\tso = this.objectDecl();\n\t\t\t\t\tif(so != null) {\n\t\t\t\t\t\tthis.consume(TokenType.Semicolon,\"Expected \';\' after object declaration\");\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tthis.consumeSynchronize(TokenType.RBracket,\"Expected \'}\'\");\n\t\t\t\treturn new expr_ObjectDeclExpr(classNameExpr,parentObj,objNameExpr,objArgs,slotAssigns,subObjects,false);\n\t\t\t} else {\n\t\t\t\treturn new expr_ObjectDeclExpr(classNameExpr,parentObj,objNameExpr,objArgs,[],[],false);\n\t\t\t}\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\texpression() {\n\t\tlet chainExpr = null;\n\t\tlet ternaryExp = null;\n\t\tlet _gthis = this;\n\t\tlet primaryExpr = function() {\n\t\t\tif(_gthis.match([TokenType.LParen])) {\n\t\t\t\t_gthis.advance();\n\t\t\t\tlet subexpr = _gthis.expression();\n\t\t\t\t_gthis.consume(TokenType.RParen,\"Expected \')\' after expression\");\n\t\t\t\treturn new expr_ParenthesisExpr(subexpr);\n\t\t\t} else if(_gthis.match([TokenType.Minus])) {\n\t\t\t\tlet tok = _gthis.advance();\n\t\t\t\tlet subexpr = chainExpr();\n\t\t\t\tif(((subexpr) instanceof expr_IntBinaryExpr) || ((subexpr) instanceof expr_FloatBinaryExpr)) {\n\t\t\t\t\tlet bexpr = js_Boot.__cast(subexpr , expr_BinaryExpr);\n\t\t\t\t\tbexpr.left = new expr_FloatUnaryExpr(bexpr.left,tok);\n\t\t\t\t\treturn bexpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn new expr_FloatUnaryExpr(subexpr,tok);\n\t\t\t\t}\n\t\t\t} else if(_gthis.match([TokenType.Not,TokenType.Tilde])) {\n\t\t\t\tlet tok = _gthis.advance();\n\t\t\t\tlet subexpr = chainExpr();\n\t\t\t\tif(((subexpr) instanceof expr_IntBinaryExpr) || ((subexpr) instanceof expr_FloatBinaryExpr)) {\n\t\t\t\t\tlet bexpr = js_Boot.__cast(subexpr , expr_BinaryExpr);\n\t\t\t\t\tbexpr.left = new expr_IntUnaryExpr(bexpr.left,tok);\n\t\t\t\t\treturn bexpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn new expr_IntUnaryExpr(subexpr,tok);\n\t\t\t\t}\n\t\t\t} else if(_gthis.match([TokenType.Modulus,TokenType.Dollar])) {\n\t\t\t\tlet varExpr = _gthis.variable();\n\t\t\t\tlet varIdx = null;\n\t\t\t\tif(_gthis.match([TokenType.LeftSquareBracket])) {\n\t\t\t\t\t_gthis.advance();\n\t\t\t\t\tlet arrExpr = _gthis.expression();\n\t\t\t\t\tif(arrExpr == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected array index\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\twhile(arrExpr != null) {\n\t\t\t\t\t\tif(varIdx == null) {\n\t\t\t\t\t\t\tvarIdx = arrExpr;\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tvarIdx = new expr_CommaCatExpr(varIdx,arrExpr);\n\t\t\t\t\t\t}\n\t\t\t\t\t\tif(_gthis.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\t\tarrExpr = _gthis.expression();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\t_gthis.consume(TokenType.RightSquareBracket,\"Expected \']\' after array index\");\n\t\t\t\t}\n\t\t\t\tvarExpr.arrayIndex = varIdx;\n\t\t\t\treturn varExpr;\n\t\t\t} else if(_gthis.match([TokenType.String])) {\n\t\t\t\tlet str = _gthis.advance();\n\t\t\t\treturn new expr_StringConstExpr(str.line,str.literal,false);\n\t\t\t} else if(_gthis.match([TokenType.TaggedString])) {\n\t\t\t\tlet str = _gthis.advance();\n\t\t\t\treturn new expr_StringConstExpr(str.line,str.literal,true);\n\t\t\t} else if(_gthis.match([TokenType.Label,TokenType.Break])) {\n\t\t\t\tlet label = _gthis.advance();\n\t\t\t\treturn new expr_ConstantExpr(label);\n\t\t\t} else if(_gthis.match([TokenType.Int])) {\n\t\t\t\tlet intTok = _gthis.advance();\n\t\t\t\treturn new expr_IntExpr(intTok.line,Std.parseInt(intTok.literal));\n\t\t\t} else if(_gthis.match([TokenType.Float])) {\n\t\t\t\tlet floatTok = _gthis.advance();\n\t\t\t\treturn new expr_FloatExpr(floatTok.line,parseFloat(floatTok.literal));\n\t\t\t} else if(_gthis.match([TokenType.True])) {\n\t\t\t\tlet trueLine = _gthis.peek().line;\n\t\t\t\t_gthis.advance();\n\t\t\t\treturn new expr_IntExpr(trueLine,1);\n\t\t\t} else if(_gthis.match([TokenType.False])) {\n\t\t\t\tlet falseLine = _gthis.peek().line;\n\t\t\t\t_gthis.advance();\n\t\t\t\treturn new expr_IntExpr(falseLine,0);\n\t\t\t} else {\n\t\t\t\treturn null;\n\t\t\t}\n\t\t};\n\t\tchainExpr = function() {\n\t\t\tlet expr = primaryExpr();\n\t\t\tlet chExpr = null;\n\t\t\tif(expr != null) {\n\t\t\t\tif(_gthis.match([TokenType.Dot])) {\n\t\t\t\t\t_gthis.advance();\n\t\t\t\t\tlet labelAccess = _gthis.consume(TokenType.Label,\"Expected label after expression\");\n\t\t\t\t\tlet arrAccess = null;\n\t\t\t\t\tif(_gthis.match([TokenType.LeftSquareBracket])) {\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tarrAccess = null;\n\t\t\t\t\t\tlet arrExpr = _gthis.expression();\n\t\t\t\t\t\tif(arrExpr == null) {\n\t\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after \'[\'\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhile(arrExpr != null) {\n\t\t\t\t\t\t\tif(arrAccess == null) {\n\t\t\t\t\t\t\t\tarrAccess = arrExpr;\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tarrAccess = new expr_CommaCatExpr(arrAccess,arrExpr);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tif(_gthis.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\t\t\tarrExpr = _gthis.expression();\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\t_gthis.consume(TokenType.RightSquareBracket,\"Expected \']\' after array index\");\n\t\t\t\t\t}\n\t\t\t\t\tlet nextTok = _gthis.peek();\n\t\t\t\t\tswitch(nextTok.type._hx_index) {\n\t\t\t\t\tcase 20:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet rexpr = ternaryExp();\n\t\t\t\t\t\tchExpr = new expr_SlotAssignExpr(expr,arrAccess,labelAccess,rexpr);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet rexpr1 = ternaryExp();\n\t\t\t\t\t\tchExpr = new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,rexpr1,nextTok);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 63:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tif(arrAccess == null) {\n\t\t\t\t\t\t\tlet funcexprs = [expr];\n\t\t\t\t\t\t\tlet funcexpr = _gthis.expression();\n\t\t\t\t\t\t\twhile(funcexpr != null) {\n\t\t\t\t\t\t\t\tfuncexprs.push(funcexpr);\n\t\t\t\t\t\t\t\tif(_gthis.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\t\t\t\tfuncexpr = _gthis.expression();\n\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t_gthis.consume(TokenType.RParen,\"Expected \')\' after function call arguments\");\n\t\t\t\t\t\t\tchExpr = new expr_FuncCallExpr(labelAccess,null,funcexprs,1);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tthrow new SyntaxError(\"Cannot call array methods with a dot notation accessor\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t\t}\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 76:case 77:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tchExpr = new expr_ParenthesisExpr(new expr_SlotAssignOpExpr(expr,arrAccess,labelAccess,null,nextTok));\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tdefault:\n\t\t\t\t\t\tchExpr = new expr_SlotAccessExpr(expr,arrAccess,labelAccess);\n\t\t\t\t\t}\n\t\t\t\t} else if(((expr) instanceof expr_VarExpr)) {\n\t\t\t\t\tlet varExpr = expr;\n\t\t\t\t\tlet nextTok = _gthis.peek();\n\t\t\t\t\tswitch(nextTok.type._hx_index) {\n\t\t\t\t\tcase 20:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet rexpr = ternaryExp();\n\t\t\t\t\t\tchExpr = new expr_AssignExpr(varExpr,rexpr);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet rexpr1 = ternaryExp();\n\t\t\t\t\t\tchExpr = new expr_AssignOpExpr(varExpr,rexpr1,nextTok);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 76:case 77:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tchExpr = new expr_ParenthesisExpr(new expr_AssignOpExpr(varExpr,null,nextTok));\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tdefault:\n\t\t\t\t\t\tchExpr = varExpr;\n\t\t\t\t\t}\n\t\t\t\t} else if(((expr) instanceof expr_ConstantExpr)) {\n\t\t\t\t\tif(_gthis.match([TokenType.LParen])) {\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet fnname = (js_Boot.__cast(expr , expr_ConstantExpr)).name;\n\t\t\t\t\t\tlet fnArgs = [];\n\t\t\t\t\t\tlet fnArg = _gthis.expression();\n\t\t\t\t\t\twhile(fnArg != null) {\n\t\t\t\t\t\t\tfnArgs.push(fnArg);\n\t\t\t\t\t\t\tif(_gthis.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\t\t\tfnArg = _gthis.expression();\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\t_gthis.consume(TokenType.RParen,\"Expected \')\' after constant function arguments\");\n\t\t\t\t\t\tchExpr = new expr_FuncCallExpr(fnname,null,fnArgs,0);\n\t\t\t\t\t} else if(_gthis.match([TokenType.DoubleColon])) {\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet parentname = (js_Boot.__cast(expr , expr_ConstantExpr)).name;\n\t\t\t\t\t\tlet fnname = _gthis.consume(TokenType.Label,\"Expected a function name after \'::\'\");\n\t\t\t\t\t\t_gthis.consume(TokenType.LParen,\"Expected \'(\' after constant function name\");\n\t\t\t\t\t\tlet fnArgs = [];\n\t\t\t\t\t\tlet fnArg = _gthis.expression();\n\t\t\t\t\t\twhile(fnArg != null) {\n\t\t\t\t\t\t\tfnArgs.push(fnArg);\n\t\t\t\t\t\t\tif(_gthis.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\t\t\tfnArg = _gthis.expression();\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\t_gthis.consume(TokenType.RParen,\"Expected \')\' after constant function arguments\");\n\t\t\t\t\t\tchExpr = new expr_FuncCallExpr(fnname,parentname,fnArgs,(js_Boot.__cast(parentname.literal , String)).toLowerCase() == \"parent\" ? 2 : 0);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tchExpr = expr;\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tchExpr = expr;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tlet objD = _gthis.objectDecl();\n\t\t\t\tif(objD != null) {\n\t\t\t\t\tchExpr = objD;\n\t\t\t\t} else {\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t}\n\t\t\twhile(_gthis.match([TokenType.Dot])) {\n\t\t\t\t_gthis.advance();\n\t\t\t\tlet label = _gthis.consume(TokenType.Label,\"Expected a property name after \'.\'\");\n\t\t\t\tif(_gthis.match([TokenType.LParen])) {\n\t\t\t\t\t_gthis.advance();\n\t\t\t\t\tlet fnArgs = [chExpr];\n\t\t\t\t\tlet fnArg = _gthis.expression();\n\t\t\t\t\twhile(fnArg != null) {\n\t\t\t\t\t\tfnArgs.push(fnArg);\n\t\t\t\t\t\tif(_gthis.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\t\tfnArg = _gthis.expression();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\t_gthis.consume(TokenType.RParen,\"Expected \')\' after function arguments\");\n\t\t\t\t\tchExpr = new expr_FuncCallExpr(label,null,fnArgs,1);\n\t\t\t\t} else {\n\t\t\t\t\tlet arrAccess = null;\n\t\t\t\t\tif(_gthis.match([TokenType.LeftSquareBracket])) {\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tarrAccess = null;\n\t\t\t\t\t\tlet arrExpr = _gthis.expression();\n\t\t\t\t\t\tif(arrExpr == null) {\n\t\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after \'[\'\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t\t}\n\t\t\t\t\t\twhile(arrExpr != null) {\n\t\t\t\t\t\t\tif(arrAccess == null) {\n\t\t\t\t\t\t\t\tarrAccess = arrExpr;\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tarrAccess = new expr_CommaCatExpr(arrAccess,arrExpr);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tif(_gthis.match([TokenType.Comma])) {\n\t\t\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\t\t\tarrExpr = _gthis.expression();\n\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\t_gthis.consume(TokenType.RightSquareBracket,\"Expected \']\' after array index\");\n\t\t\t\t\t}\n\t\t\t\t\tlet nextTok = _gthis.peek();\n\t\t\t\t\tswitch(nextTok.type._hx_index) {\n\t\t\t\t\tcase 20:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet rexpr = ternaryExp();\n\t\t\t\t\t\tchExpr = new expr_SlotAssignExpr(chExpr,arrAccess,label,rexpr);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 30:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tlet rexpr1 = ternaryExp();\n\t\t\t\t\t\tchExpr = new expr_SlotAssignOpExpr(chExpr,arrAccess,label,rexpr1,nextTok);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 76:case 77:\n\t\t\t\t\t\t_gthis.advance();\n\t\t\t\t\t\tchExpr = new expr_ParenthesisExpr(new expr_SlotAssignOpExpr(chExpr,arrAccess,label,null,nextTok));\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tdefault:\n\t\t\t\t\t\tchExpr = new expr_SlotAccessExpr(chExpr,arrAccess,label);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn chExpr;\n\t\t};\n\t\tlet factorExp = function() {\n\t\t\tlet lhs = chainExpr();\n\t\t\tif(_gthis.match([TokenType.Multiply,TokenType.Divide,TokenType.Modulus])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = chainExpr();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected rhs after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = op.type != TokenType.Modulus ? new expr_FloatBinaryExpr(lhs,rhs,op) : new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.Multiply,TokenType.Divide,TokenType.Modulus])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = chainExpr();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected rhs after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = op2.type != TokenType.Modulus ? new expr_FloatBinaryExpr(rhs,rhs2,op2) : new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet termExp = function() {\n\t\t\tlet lhs = factorExp();\n\t\t\tif(_gthis.match([TokenType.Plus,TokenType.Minus])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = factorExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected expression after plus/minus operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = new expr_FloatBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.Plus,TokenType.Minus])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = factorExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after plus/minus operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = new expr_FloatBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet bitshiftExp = function() {\n\t\t\tlet lhs = termExp();\n\t\t\tif(_gthis.match([TokenType.LeftBitShift,TokenType.RightBitShift])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = termExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.LeftBitShift,TokenType.RightBitShift])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = termExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet strOpExp = function() {\n\t\t\tlet lhs = bitshiftExp();\n\t\t\tif(_gthis.match([TokenType.Concat,TokenType.TabConcat,TokenType.SpaceConcat,TokenType.NewlineConcat,TokenType.StringEquals,TokenType.StringNotEquals])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = bitshiftExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\tswitch(op.type._hx_index) {\n\t\t\t\tcase 39:case 40:\n\t\t\t\t\trhs = new expr_StrEqExpr(lhs,rhs,op);\n\t\t\t\t\tbreak;\n\t\t\t\tcase 41:case 42:case 43:case 44:\n\t\t\t\t\trhs = new expr_StrCatExpr(lhs,rhs,op);\n\t\t\t\t\tbreak;\n\t\t\t\tdefault:\n\t\t\t\t\trhs = null;\n\t\t\t\t}\n\t\t\t\twhile(_gthis.match([TokenType.Concat,TokenType.TabConcat,TokenType.SpaceConcat,TokenType.NewlineConcat,TokenType.StringEquals,TokenType.StringNotEquals])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = bitshiftExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\tswitch(op2.type._hx_index) {\n\t\t\t\t\tcase 39:case 40:\n\t\t\t\t\t\trhs = new expr_StrEqExpr(rhs,rhs2,op2);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tcase 41:case 42:case 43:case 44:\n\t\t\t\t\t\trhs = new expr_StrCatExpr(rhs,rhs2,op2);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tdefault:\n\t\t\t\t\t\trhs = null;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet relationalExp = function() {\n\t\t\tlet lhs = strOpExp();\n\t\t\tif(_gthis.match([TokenType.LessThan,TokenType.GreaterThan,TokenType.LessThanEqual,TokenType.GreaterThanEqual])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = strOpExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.LessThan,TokenType.GreaterThan,TokenType.LessThanEqual,TokenType.GreaterThanEqual])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = strOpExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet equalityExp = function() {\n\t\t\tlet lhs = relationalExp();\n\t\t\tif(_gthis.match([TokenType.Equal,TokenType.NotEqual])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = relationalExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\tswitch(op.type._hx_index) {\n\t\t\t\tcase 36:case 37:\n\t\t\t\t\trhs = new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\t\tbreak;\n\t\t\t\tdefault:\n\t\t\t\t\trhs = null;\n\t\t\t\t}\n\t\t\t\twhile(_gthis.match([TokenType.Equal,TokenType.NotEqual])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = relationalExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\tswitch(op.type._hx_index) {\n\t\t\t\t\tcase 36:case 37:\n\t\t\t\t\t\trhs = new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tdefault:\n\t\t\t\t\t\trhs = null;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet andExp = function() {\n\t\t\tlet lhs = equalityExp();\n\t\t\tif(_gthis.match([TokenType.BitwiseAnd])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = equalityExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected expression after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.BitwiseAnd])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = equalityExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet xorExp = function() {\n\t\t\tlet lhs = andExp();\n\t\t\tif(_gthis.match([TokenType.BitwiseXor])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = andExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected expression after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.BitwiseXor])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = andExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet orExp = function() {\n\t\t\tlet lhs = xorExp();\n\t\t\tif(_gthis.match([TokenType.BitwiseOr])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = xorExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected expression after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.BitwiseOr])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = xorExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected expression after bitwise operator\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tlet logicalExp = function() {\n\t\t\tlet lhs = orExp();\n\t\t\tif(_gthis.match([TokenType.LogicalAnd,TokenType.LogicalOr])) {\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet op = _gthis.advance();\n\t\t\t\tlet rhs = orExp();\n\t\t\t\tif(rhs == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\trhs = new expr_IntBinaryExpr(lhs,rhs,op);\n\t\t\t\twhile(_gthis.match([TokenType.LogicalAnd,TokenType.LogicalOr])) {\n\t\t\t\t\tlet op2 = _gthis.advance();\n\t\t\t\t\tlet rhs2 = orExp();\n\t\t\t\t\tif(rhs2 == null) {\n\t\t\t\t\t\tthrow new SyntaxError(\"Expected right hand side\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t\t}\n\t\t\t\t\trhs = new expr_IntBinaryExpr(rhs,rhs2,op2);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = rhs;\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn rhs;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\tternaryExp = function() {\n\t\t\tlet lhs = logicalExp();\n\t\t\tif(_gthis.match([TokenType.QuestionMark])) {\n\t\t\t\t_gthis.advance();\n\t\t\t\tlet lhsExpr = null;\n\t\t\t\tlet lhsAssign = false;\n\t\t\t\tif(((lhs) instanceof expr_AssignExpr) || ((lhs) instanceof expr_AssignOpExpr) || ((lhs) instanceof expr_SlotAssignExpr) || ((lhs) instanceof expr_SlotAssignOpExpr)) {\n\t\t\t\t\tlhsExpr = lhs;\n\t\t\t\t\tlhs = lhsExpr.expr;\n\t\t\t\t\tlhsAssign = true;\n\t\t\t\t}\n\t\t\t\tlet trueExpr = _gthis.expression();\n\t\t\t\tif(trueExpr == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected true expression\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\t_gthis.consume(TokenType.Colon,\"Expected : after true expression\");\n\t\t\t\tlet falseExpr = _gthis.expression();\n\t\t\t\tif(falseExpr == null) {\n\t\t\t\t\tthrow new SyntaxError(\"Expected false expression\",_gthis.tokens[_gthis.current - 1]);\n\t\t\t\t}\n\t\t\t\tif(lhsAssign) {\n\t\t\t\t\tlhsExpr.expr = new expr_ConditionalExpr(lhs,trueExpr,falseExpr);\n\t\t\t\t\treturn lhsExpr;\n\t\t\t\t} else {\n\t\t\t\t\treturn new expr_ConditionalExpr(lhs,trueExpr,falseExpr);\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn lhs;\n\t\t\t}\n\t\t};\n\t\treturn ternaryExp();\n\t}\n\tisAtEnd() {\n\t\treturn this.current >= this.tokens.length;\n\t}\n\tpeek() {\n\t\treturn this.tokens[this.current];\n\t}\n\tprevious() {\n\t\treturn this.tokens[this.current - 1];\n\t}\n\tadvance() {\n\t\tif(!this.isAtEnd()) {\n\t\t\tthis.current++;\n\t\t}\n\t\treturn this.tokens[this.current - 1];\n\t}\n\tconsume(tokenType,message) {\n\t\tif(this.check(tokenType)) {\n\t\t\tthis.advance();\n\t\t\treturn this.previous();\n\t\t}\n\t\tthrow new SyntaxError(message,this.tokens[this.current - 1]);\n\t}\n\tconsumeSynchronize(tokenType,message) {\n\t\tif(this.check(tokenType)) {\n\t\t\tthis.advance();\n\t\t\treturn this.previous();\n\t\t}\n\t\tif(!this.panicMode) {\n\t\t\tthis.syntaxErrors.push(new SyntaxError(message,this.tokens[this.current - 1]));\n\t\t\tthis.panicMode = true;\n\t\t}\n\t\twhile(!this.check(tokenType) && !this.isAtEnd()) this.advance();\n\t\tthis.advance();\n\t\tthis.panicMode = false;\n\t\treturn this.previous();\n\t}\n\tmatch(types) {\n\t\tlet _g = 0;\n\t\twhile(_g < types.length) {\n\t\t\tlet type = types[_g];\n\t\t\t++_g;\n\t\t\tif(this.check(type)) {\n\t\t\t\treturn true;\n\t\t\t}\n\t\t}\n\t\treturn false;\n\t}\n\tcheck(type) {\n\t\tif(this.isAtEnd()) {\n\t\t\treturn false;\n\t\t}\n\t\treturn this.peek().type == type;\n\t}\n\tenterScope() {\n\t\tlet _this = this.positionStack;\n\t\t_this.head = new haxe_ds_GenericCell(this.current,_this.head);\n\t}\n\texitScope() {\n\t\tlet _this = this.positionStack;\n\t\tlet k = _this.head;\n\t\tlet tmp;\n\t\tif(k == null) {\n\t\t\ttmp = null;\n\t\t} else {\n\t\t\t_this.head = k.next;\n\t\t\ttmp = k.elt;\n\t\t}\n\t\tthis.current = tmp;\n\t}\n}\n$hx_exports[\"Parser\"] = Parser;\nParser.__name__ = true;\nObject.assign(Parser.prototype, {\n\t__class__: Parser\n});\nclass Reflect {\n\tstatic compare(a,b) {\n\t\tif(a == b) {\n\t\t\treturn 0;\n\t\t} else if(a > b) {\n\t\t\treturn 1;\n\t\t} else {\n\t\t\treturn -1;\n\t\t}\n\t}\n\tstatic isEnumValue(v) {\n\t\tif(v != null) {\n\t\t\treturn v.__enum__ != null;\n\t\t} else {\n\t\t\treturn false;\n\t\t}\n\t}\n}\nReflect.__name__ = true;\nclass Scanner {\n\tconstructor(s) {\n\t\tlet _g = new haxe_ds_StringMap();\n\t\t_g.h[\"datablock\"] = TokenType.Datablock;\n\t\t_g.h[\"package\"] = TokenType.Package;\n\t\t_g.h[\"function\"] = TokenType.Function;\n\t\t_g.h[\"if\"] = TokenType.If;\n\t\t_g.h[\"else\"] = TokenType.Else;\n\t\t_g.h[\"while\"] = TokenType.While;\n\t\t_g.h[\"for\"] = TokenType.For;\n\t\t_g.h[\"break\"] = TokenType.Break;\n\t\t_g.h[\"continue\"] = TokenType.Continue;\n\t\t_g.h[\"case\"] = TokenType.Case;\n\t\t_g.h[\"switch\"] = TokenType.Switch;\n\t\t_g.h[\"return\"] = TokenType.Return;\n\t\t_g.h[\"new\"] = TokenType.New;\n\t\t_g.h[\"true\"] = TokenType.True;\n\t\t_g.h[\"false\"] = TokenType.False;\n\t\t_g.h[\"default\"] = TokenType.Default;\n\t\t_g.h[\"or\"] = TokenType.Or;\n\t\tthis.keywords = _g;\n\t\tthis.line = 1;\n\t\tthis.current = 0;\n\t\tthis.start = 0;\n\t\tthis.tokens = [];\n\t\tthis.source = s;\n\t}\n\tscanTokens() {\n\t\twhile(!this.isAtEnd()) {\n\t\t\tthis.start = this.current;\n\t\t\tthis.scanToken();\n\t\t}\n\t\treturn this.tokens;\n\t}\n\tisAtEnd() {\n\t\treturn this.current >= this.source.length;\n\t}\n\tscanToken() {\n\t\tlet c = this.advance();\n\t\tswitch(c) {\n\t\tcase 10:\n\t\t\tlet x = c;\n\t\t\tif(49 <= x && x <= 57) {\n\t\t\t\tthis.number();\n\t\t\t} else {\n\t\t\t\tthis.line++;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 9:case 13:case 32:\n\t\t\tlet x1 = c;\n\t\t\tif(49 <= x1 && x1 <= 57) {\n\t\t\t\tthis.number();\n\t\t\t} else {\n\t\t\t\tlet a = 1;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 33:\n\t\t\tif(this.match(\"=\")) {\n\t\t\t\tthis.addToken(TokenType.NotEqual);\n\t\t\t} else if(this.match(\"$\")) {\n\t\t\t\tif(this.match(\"=\")) {\n\t\t\t\t\tthis.addToken(TokenType.StringNotEquals);\n\t\t\t\t} else {\n\t\t\t\t\tthis.addToken(TokenType.Not);\n\t\t\t\t\tthis.addToken(TokenType.Dollar);\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tthis.addToken(TokenType.Not);\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 34:\n\t\t\tthis.string(34,TokenType.String);\n\t\t\tbreak;\n\t\tcase 36:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.StringEquals : TokenType.Dollar);\n\t\t\tbreak;\n\t\tcase 37:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.ModulusAssign : TokenType.Modulus);\n\t\t\tbreak;\n\t\tcase 38:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.AndAssign : this.match(\"&\") ? TokenType.LogicalAnd : TokenType.BitwiseAnd);\n\t\t\tbreak;\n\t\tcase 39:\n\t\t\tthis.string(39,TokenType.TaggedString);\n\t\t\tbreak;\n\t\tcase 40:\n\t\t\tthis.addToken(TokenType.LParen);\n\t\t\tbreak;\n\t\tcase 41:\n\t\t\tthis.addToken(TokenType.RParen);\n\t\t\tbreak;\n\t\tcase 42:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.MultiplyAssign : TokenType.Multiply);\n\t\t\tbreak;\n\t\tcase 43:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.PlusAssign : this.match(\"+\") ? TokenType.PlusPlus : TokenType.Plus);\n\t\t\tbreak;\n\t\tcase 44:\n\t\t\tthis.addToken(TokenType.Comma);\n\t\t\tbreak;\n\t\tcase 45:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.MinusAssign : this.match(\"-\") ? TokenType.MinusMinus : TokenType.Minus);\n\t\t\tbreak;\n\t\tcase 46:\n\t\t\tthis.addToken(TokenType.Dot);\n\t\t\tbreak;\n\t\tcase 47:\n\t\t\tif(this.match(\"/\")) {\n\t\t\t\tlet commentBegin = this.start;\n\t\t\t\twhile(this.peek() != 10 && !this.isAtEnd()) this.advance();\n\t\t\t\tthis.addToken(TokenType.Comment(false),this.source.substring(commentBegin + 2,this.current));\n\t\t\t} else if(this.match(\"*\")) {\n\t\t\t\tlet commentBegin = this.start;\n\t\t\t\twhile(this.peek() != 42 || this.peekNext() != 47) {\n\t\t\t\t\tif(this.isAtEnd()) {\n\t\t\t\t\t\tconsole.log(\"src/Scanner.hx:98:\",\"Unterminated comment.\");\n\t\t\t\t\t}\n\t\t\t\t\tthis.advance();\n\t\t\t\t}\n\t\t\t\tthis.addToken(TokenType.Comment(true),this.source.substring(commentBegin + 2,this.current));\n\t\t\t\tthis.advance();\n\t\t\t\tthis.advance();\n\t\t\t} else {\n\t\t\t\tthis.addToken(this.match(\"=\") ? TokenType.DivideAssign : TokenType.Divide);\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 48:\n\t\t\tif(this.match(\"x\")) {\n\t\t\t\tthis.hexNumber();\n\t\t\t} else {\n\t\t\t\tthis.number();\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 58:\n\t\t\tthis.addToken(this.match(\":\") ? TokenType.DoubleColon : TokenType.Colon);\n\t\t\tbreak;\n\t\tcase 59:\n\t\t\tthis.addToken(TokenType.Semicolon);\n\t\t\tbreak;\n\t\tcase 60:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.LessThanEqual : this.match(\"<\") ? this.match(\"=\") ? TokenType.ShiftLeftAssign : TokenType.LeftBitShift : TokenType.LessThan);\n\t\t\tbreak;\n\t\tcase 61:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.Equal : TokenType.Assign);\n\t\t\tbreak;\n\t\tcase 62:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.GreaterThanEqual : this.match(\">\") ? this.match(\"=\") ? TokenType.ShiftRightAssign : TokenType.RightBitShift : TokenType.GreaterThan);\n\t\t\tbreak;\n\t\tcase 63:\n\t\t\tthis.addToken(TokenType.QuestionMark);\n\t\t\tbreak;\n\t\tcase 64:\n\t\t\tthis.addToken(TokenType.Concat);\n\t\t\tbreak;\n\t\tcase 91:\n\t\t\tthis.addToken(TokenType.LeftSquareBracket);\n\t\t\tbreak;\n\t\tcase 93:\n\t\t\tthis.addToken(TokenType.RightSquareBracket);\n\t\t\tbreak;\n\t\tcase 94:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.XorAssign : TokenType.BitwiseXor);\n\t\t\tbreak;\n\t\tcase 123:\n\t\t\tthis.addToken(TokenType.LBracket);\n\t\t\tbreak;\n\t\tcase 124:\n\t\t\tthis.addToken(this.match(\"=\") ? TokenType.OrAssign : this.match(\"|\") ? TokenType.LogicalOr : TokenType.BitwiseOr);\n\t\t\tbreak;\n\t\tcase 125:\n\t\t\tthis.addToken(TokenType.RBracket);\n\t\t\tbreak;\n\t\tcase 126:\n\t\t\tthis.addToken(TokenType.Tilde);\n\t\t\tbreak;\n\t\tdefault:\n\t\t\tlet x2 = c;\n\t\t\tif(49 <= x2 && x2 <= 57) {\n\t\t\t\tthis.number();\n\t\t\t} else if(this.isAlpha(c)) {\n\t\t\t\tthis.identifier();\n\t\t\t} else {\n\t\t\t\tconsole.log(\"src/Scanner.hx:165:\",\"Unexpected character \" + this.line + \" - \" + c);\n\t\t\t}\n\t\t}\n\t}\n\tadvance() {\n\t\treturn this.source.charCodeAt(this.current++);\n\t}\n\tpeekPrev() {\n\t\tif(this.current == 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn this.source.charAt(this.current - 1);\n\t}\n\tpeekPrev2() {\n\t\tif(this.current <= 1) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn this.source.charAt(this.current - 2);\n\t}\n\tpeek() {\n\t\tif(this.isAtEnd()) {\n\t\t\treturn 0;\n\t\t}\n\t\treturn this.source.charCodeAt(this.current);\n\t}\n\taddToken(type,literal) {\n\t\tlet text = this.source.substring(this.start,this.current);\n\t\tthis.tokens.push(new Token(type,text,literal,this.line,this.start));\n\t}\n\tmatch(expected) {\n\t\tif(this.isAtEnd()) {\n\t\t\treturn false;\n\t\t}\n\t\tif(this.source.charAt(this.current) != expected) {\n\t\t\treturn false;\n\t\t}\n\t\tthis.current++;\n\t\treturn true;\n\t}\n\tstring(delimiter,tokenType) {\n\t\tlet doingEscapeSequence = false;\n\t\twhile(this.peek() != delimiter && !this.isAtEnd() || doingEscapeSequence) {\n\t\t\tif(this.peek() == 10) {\n\t\t\t\tthis.line++;\n\t\t\t}\n\t\t\tif(!doingEscapeSequence) {\n\t\t\t\tif(this.peek() == 92) {\n\t\t\t\t\tdoingEscapeSequence = true;\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tdoingEscapeSequence = false;\n\t\t\t}\n\t\t\tthis.advance();\n\t\t}\n\t\tif(this.isAtEnd()) {\n\t\t\tconsole.log(\"src/Scanner.hx:224:\",\"Unterminated string\");\n\t\t\treturn;\n\t\t}\n\t\tthis.advance();\n\t\tlet value = Scanner.unescape(this.source.substring(this.start + 1,this.current - 1));\n\t\tthis.addToken(tokenType,value);\n\t}\n\tisDigit(cd) {\n\t\tif(cd >= 48) {\n\t\t\treturn cd <= 57;\n\t\t} else {\n\t\t\treturn false;\n\t\t}\n\t}\n\tisAlpha(cd) {\n\t\tif(!(cd >= 97 && cd <= 122 || cd >= 65 && cd <= 90)) {\n\t\t\treturn cd == 95;\n\t\t} else {\n\t\t\treturn true;\n\t\t}\n\t}\n\tisAlphaNumeric(c) {\n\t\tif(!this.isAlpha(c)) {\n\t\t\treturn this.isDigit(c);\n\t\t} else {\n\t\t\treturn true;\n\t\t}\n\t}\n\tpeekNext() {\n\t\tif(this.current + 1 >= this.source.length) {\n\t\t\treturn 0;\n\t\t}\n\t\treturn this.source.charCodeAt(this.current + 1);\n\t}\n\thexNumber() {\n\t\twhile(true) {\n\t\t\tlet c = this.peek();\n\t\t\tif(c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {\n\t\t\t\tthis.advance();\n\t\t\t} else {\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\t\tthis.addToken(TokenType.HexInt,this.source.substring(this.start,this.current));\n\t}\n\tnumber() {\n\t\twhile(this.isDigit(this.peek())) this.advance();\n\t\tlet isFloat = false;\n\t\tif(this.peek() == 46 && this.isDigit(this.peekNext())) {\n\t\t\tisFloat = true;\n\t\t\tthis.advance();\n\t\t\twhile(this.isDigit(this.peek())) this.advance();\n\t\t\tif(this.peek() == 101 || this.peek() == 69) {\n\t\t\t\tthis.advance();\n\t\t\t\tif(this.peek() == 43 || this.peek() == 45) {\n\t\t\t\t\tthis.advance();\n\t\t\t\t}\n\t\t\t\twhile(this.isDigit(this.peek())) this.advance();\n\t\t\t}\n\t\t}\n\t\tif(this.peek() == 101 || this.peek() == 69) {\n\t\t\tisFloat = true;\n\t\t\tthis.advance();\n\t\t\tif(this.peek() == 43 || this.peek() == 45) {\n\t\t\t\tthis.advance();\n\t\t\t}\n\t\t\twhile(this.isDigit(this.peek())) this.advance();\n\t\t}\n\t\tif(isFloat) {\n\t\t\tthis.addToken(TokenType.Float,this.source.substring(this.start,this.current));\n\t\t} else {\n\t\t\tthis.addToken(TokenType.Int,this.source.substring(this.start,this.current));\n\t\t}\n\t}\n\tidentifier() {\n\t\twhile(this.isAlphaNumeric(this.peek())) this.advance();\n\t\tlet text = this.source.substring(this.start,this.current);\n\t\tif(Object.prototype.hasOwnProperty.call(this.keywords.h,text)) {\n\t\t\tthis.addToken(this.keywords.h[text],text);\n\t\t} else if(text == \"SPC\") {\n\t\t\tthis.addToken(TokenType.SpaceConcat,text);\n\t\t} else if(text == \"NL\") {\n\t\t\tthis.addToken(TokenType.NewlineConcat,text);\n\t\t} else if(text == \"TAB\") {\n\t\t\tthis.addToken(TokenType.TabConcat,text);\n\t\t} else {\n\t\t\tthis.addToken(TokenType.Label,text);\n\t\t}\n\t}\n\tstatic unescape(s) {\n\t\tlet escapeFrom = [\"\\\\t\",\"\\\\n\",\"\\\\r\",\"\\\\\\\"\",\"\\\\\'\",\"\\\\\\\\\",\"\\\\c0\",\"\\\\c1\",\"\\\\c2\",\"\\\\c3\",\"\\\\c4\",\"\\\\c5\",\"\\\\c6\",\"\\\\c7\",\"\\\\c8\",\"\\\\c9\",\"\\\\cr\",\"\\\\cp\",\"\\\\co\"];\n\t\tlet escapeTo = [\"\\t\",\"\\n\",\"\\r\",\"\\\"\",\"\'\",\"\\\\\",\"\\x01\",\"\\x02\",\"\\x03\",\"\\x04\",\"\\x05\",\"\\x06\",\"\\x07\",\"\\x0B\",\"\\x0C\",\"\\x0E\",\"\\x0F\",\"\\x10\",\"\\x11\"];\n\t\tlet _g = 0;\n\t\tlet _g1 = escapeFrom.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tif(s.includes(escapeFrom[i])) {\n\t\t\t\ts = StringTools.replace(s,escapeFrom[i],escapeTo[i]);\n\t\t\t}\n\t\t}\n\t\tif(HxOverrides.cca(s,0) == 1) {\n\t\t\ts = \"\\x02\" + s;\n\t\t}\n\t\tlet newStr = s;\n\t\twhile(newStr.indexOf(\"\\\\x\") != -1) {\n\t\t\tif(newStr.indexOf(\"\\\\x\") == newStr.length - 2) {\n\t\t\t\tbreak;\n\t\t\t}\n\t\t\tlet hexString = newStr.substring(newStr.indexOf(\"\\\\x\") + 2,newStr.indexOf(\"\\\\x\") + 4);\n\t\t\tlet intValue = Std.parseInt(\"0x\" + hexString);\n\t\t\tnewStr = newStr.substring(0,newStr.indexOf(\"\\\\x\")) + String.fromCodePoint(intValue) + newStr.substring(newStr.indexOf(\"\\\\x\") + 4);\n\t\t}\n\t\treturn newStr;\n\t}\n\tstatic escape(s) {\n\t\tlet escapeFrom = [\"\\\\\",\"\'\",\"\\\"\",\"\\x1F\",\"\\x1E\",\"\\x1D\",\"\\x1C\",\"\\x1B\",\"\\x1A\",\"\\x19\",\"\\x18\",\"\\x17\",\"\\x16\",\"\\x15\",\"\\x14\",\"\\x13\",\"\\x12\",\"\\x11\",\"\\x10\",\"\\x0F\",\"\\x0E\",\"\\r\",\"\\x0C\",\"\\x0B\",\"\\n\",\"\\t\",\"\\x08\",\"\\x07\",\"\\x06\",\"\\x05\",\"\\x04\",\"\\x03\",\"\\x02\",\"\\x01\"];\n\t\tlet escapeTo = [\"\\\\\\\\\",\"\\\\\'\",\"\\\\\\\"\",\"\\\\x1F\",\"\\\\x1E\",\"\\\\x1D\",\"\\\\x1C\",\"\\\\x1B\",\"\\\\x1A\",\"\\\\x19\",\"\\\\x18\",\"\\\\x17\",\"\\\\x16\",\"\\\\x15\",\"\\\\x14\",\"\\\\x13\",\"\\\\x12\",\"\\\\co\",\"\\\\cp\",\"\\\\cr\",\"\\\\c9\",\"\\\\r\",\"\\\\c8\",\"\\\\c7\",\"\\\\n\",\"\\\\t\",\"\\\\x08\",\"\\\\c6\",\"\\\\c5\",\"\\\\c4\",\"\\\\c3\",\"\\\\c2\",\"\\\\c1\",\"\\\\c0\"];\n\t\tlet tagged = false;\n\t\tif(HxOverrides.cca(s,0) == 2 && HxOverrides.cca(s,1) == 1) {\n\t\t\ts = HxOverrides.substr(s,1,null);\n\t\t\ttagged = true;\n\t\t}\n\t\tlet _g = 0;\n\t\tlet _g1 = escapeFrom.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\ts = StringTools.replace(s,escapeFrom[i],escapeTo[i]);\n\t\t}\n\t\tif(tagged) {\n\t\t\ts = \"\\x01\" + HxOverrides.substr(s,3,null);\n\t\t}\n\t\treturn s;\n\t}\n}\n$hx_exports[\"Scanner\"] = Scanner;\nScanner.__name__ = true;\nObject.assign(Scanner.prototype, {\n\t__class__: Scanner\n});\nclass Std {\n\tstatic string(s) {\n\t\treturn js_Boot.__string_rec(s,\"\");\n\t}\n\tstatic parseInt(x) {\n\t\tif(x != null) {\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = x.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tlet c = x.charCodeAt(i);\n\t\t\t\tif(c <= 8 || c >= 14 && c != 32 && c != 45) {\n\t\t\t\t\tlet nc = x.charCodeAt(i + 1);\n\t\t\t\t\tlet v = parseInt(x,nc == 120 || nc == 88 ? 16 : 10);\n\t\t\t\t\tif(isNaN(v)) {\n\t\t\t\t\t\treturn null;\n\t\t\t\t\t} else {\n\t\t\t\t\t\treturn v;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn null;\n\t}\n}\nStd.__name__ = true;\nclass StringBuf {\n\tconstructor() {\n\t\tthis.b = \"\";\n\t}\n}\nStringBuf.__name__ = true;\nObject.assign(StringBuf.prototype, {\n\t__class__: StringBuf\n});\nclass StringTools {\n\tstatic isSpace(s,pos) {\n\t\tlet c = HxOverrides.cca(s,pos);\n\t\tif(!(c > 8 && c < 14)) {\n\t\t\treturn c == 32;\n\t\t} else {\n\t\t\treturn true;\n\t\t}\n\t}\n\tstatic ltrim(s) {\n\t\tlet l = s.length;\n\t\tlet r = 0;\n\t\twhile(r < l && StringTools.isSpace(s,r)) ++r;\n\t\tif(r > 0) {\n\t\t\treturn HxOverrides.substr(s,r,l - r);\n\t\t} else {\n\t\t\treturn s;\n\t\t}\n\t}\n\tstatic rtrim(s) {\n\t\tlet l = s.length;\n\t\tlet r = 0;\n\t\twhile(r < l && StringTools.isSpace(s,l - r - 1)) ++r;\n\t\tif(r > 0) {\n\t\t\treturn HxOverrides.substr(s,0,l - r);\n\t\t} else {\n\t\t\treturn s;\n\t\t}\n\t}\n\tstatic trim(s) {\n\t\treturn StringTools.ltrim(StringTools.rtrim(s));\n\t}\n\tstatic lpad(s,c,l) {\n\t\tif(c.length <= 0) {\n\t\t\treturn s;\n\t\t}\n\t\tlet buf_b = \"\";\n\t\tl -= s.length;\n\t\twhile(buf_b.length < l) buf_b += c == null ? \"null\" : \"\" + c;\n\t\tbuf_b += s == null ? \"null\" : \"\" + s;\n\t\treturn buf_b;\n\t}\n\tstatic rpad(s,c,l) {\n\t\tif(c.length <= 0) {\n\t\t\treturn s;\n\t\t}\n\t\tlet buf_b = \"\";\n\t\tbuf_b += s == null ? \"null\" : \"\" + s;\n\t\twhile(buf_b.length < l) buf_b += c == null ? \"null\" : \"\" + c;\n\t\treturn buf_b;\n\t}\n\tstatic replace(s,sub,by) {\n\t\treturn s.split(sub).join(by);\n\t}\n}\nStringTools.__name__ = true;\nclass haxe_Exception extends Error {\n\tconstructor(message,previous,native) {\n\t\tsuper(message);\n\t\tthis.message = message;\n\t\tthis.__previousException = previous;\n\t\tthis.__nativeException = native != null ? native : this;\n\t}\n\ttoString() {\n\t\treturn this.get_message();\n\t}\n\tget_message() {\n\t\treturn this.message;\n\t}\n\tget_native() {\n\t\treturn this.__nativeException;\n\t}\n\tstatic caught(value) {\n\t\tif(((value) instanceof haxe_Exception)) {\n\t\t\treturn value;\n\t\t} else if(((value) instanceof Error)) {\n\t\t\treturn new haxe_Exception(value.message,null,value);\n\t\t} else {\n\t\t\treturn new haxe_ValueException(value,null,value);\n\t\t}\n\t}\n\tstatic thrown(value) {\n\t\tif(((value) instanceof haxe_Exception)) {\n\t\t\treturn value.get_native();\n\t\t} else if(((value) instanceof Error)) {\n\t\t\treturn value;\n\t\t} else {\n\t\t\tlet e = new haxe_ValueException(value);\n\t\t\treturn e;\n\t\t}\n\t}\n}\nhaxe_Exception.__name__ = true;\nhaxe_Exception.__super__ = Error;\nObject.assign(haxe_Exception.prototype, {\n\t__class__: haxe_Exception\n});\nclass SyntaxError extends haxe_Exception {\n\tconstructor(msg,token) {\n\t\tsuper(msg);\n\t\tthis.token = token;\n\t}\n\ttoString() {\n\t\tlet origmsg = super.toString();\n\t\torigmsg += \" at line \" + this.token.line + \", column \" + this.token.position + \", token: \" + this.token.lexeme;\n\t\treturn origmsg;\n\t}\n}\nSyntaxError.__name__ = true;\nSyntaxError.__super__ = haxe_Exception;\nObject.assign(SyntaxError.prototype, {\n\t__class__: SyntaxError\n});\nclass Token {\n\tconstructor(type,lexeme,literal,line,position) {\n\t\tthis.type = type;\n\t\tthis.lexeme = lexeme;\n\t\tthis.literal = literal;\n\t\tthis.line = line;\n\t\tthis.position = position;\n\t}\n}\nToken.__name__ = true;\nObject.assign(Token.prototype, {\n\t__class__: Token\n});\nvar TokenType = $hxEnums[\"TokenType\"] = { __ename__:true,__constructs__:null\n\t,Datablock: {_hx_name:\"Datablock\",_hx_index:0,__enum__:\"TokenType\",toString:$estr}\n\t,Package: {_hx_name:\"Package\",_hx_index:1,__enum__:\"TokenType\",toString:$estr}\n\t,Function: {_hx_name:\"Function\",_hx_index:2,__enum__:\"TokenType\",toString:$estr}\n\t,If: {_hx_name:\"If\",_hx_index:3,__enum__:\"TokenType\",toString:$estr}\n\t,Else: {_hx_name:\"Else\",_hx_index:4,__enum__:\"TokenType\",toString:$estr}\n\t,Switch: {_hx_name:\"Switch\",_hx_index:5,__enum__:\"TokenType\",toString:$estr}\n\t,Case: {_hx_name:\"Case\",_hx_index:6,__enum__:\"TokenType\",toString:$estr}\n\t,Return: {_hx_name:\"Return\",_hx_index:7,__enum__:\"TokenType\",toString:$estr}\n\t,Break: {_hx_name:\"Break\",_hx_index:8,__enum__:\"TokenType\",toString:$estr}\n\t,New: {_hx_name:\"New\",_hx_index:9,__enum__:\"TokenType\",toString:$estr}\n\t,While: {_hx_name:\"While\",_hx_index:10,__enum__:\"TokenType\",toString:$estr}\n\t,For: {_hx_name:\"For\",_hx_index:11,__enum__:\"TokenType\",toString:$estr}\n\t,True: {_hx_name:\"True\",_hx_index:12,__enum__:\"TokenType\",toString:$estr}\n\t,False: {_hx_name:\"False\",_hx_index:13,__enum__:\"TokenType\",toString:$estr}\n\t,Default: {_hx_name:\"Default\",_hx_index:14,__enum__:\"TokenType\",toString:$estr}\n\t,Plus: {_hx_name:\"Plus\",_hx_index:15,__enum__:\"TokenType\",toString:$estr}\n\t,Minus: {_hx_name:\"Minus\",_hx_index:16,__enum__:\"TokenType\",toString:$estr}\n\t,Multiply: {_hx_name:\"Multiply\",_hx_index:17,__enum__:\"TokenType\",toString:$estr}\n\t,Divide: {_hx_name:\"Divide\",_hx_index:18,__enum__:\"TokenType\",toString:$estr}\n\t,Modulus: {_hx_name:\"Modulus\",_hx_index:19,__enum__:\"TokenType\",toString:$estr}\n\t,Assign: {_hx_name:\"Assign\",_hx_index:20,__enum__:\"TokenType\",toString:$estr}\n\t,PlusAssign: {_hx_name:\"PlusAssign\",_hx_index:21,__enum__:\"TokenType\",toString:$estr}\n\t,MinusAssign: {_hx_name:\"MinusAssign\",_hx_index:22,__enum__:\"TokenType\",toString:$estr}\n\t,MultiplyAssign: {_hx_name:\"MultiplyAssign\",_hx_index:23,__enum__:\"TokenType\",toString:$estr}\n\t,OrAssign: {_hx_name:\"OrAssign\",_hx_index:24,__enum__:\"TokenType\",toString:$estr}\n\t,AndAssign: {_hx_name:\"AndAssign\",_hx_index:25,__enum__:\"TokenType\",toString:$estr}\n\t,XorAssign: {_hx_name:\"XorAssign\",_hx_index:26,__enum__:\"TokenType\",toString:$estr}\n\t,ModulusAssign: {_hx_name:\"ModulusAssign\",_hx_index:27,__enum__:\"TokenType\",toString:$estr}\n\t,DivideAssign: {_hx_name:\"DivideAssign\",_hx_index:28,__enum__:\"TokenType\",toString:$estr}\n\t,ShiftLeftAssign: {_hx_name:\"ShiftLeftAssign\",_hx_index:29,__enum__:\"TokenType\",toString:$estr}\n\t,ShiftRightAssign: {_hx_name:\"ShiftRightAssign\",_hx_index:30,__enum__:\"TokenType\",toString:$estr}\n\t,LessThan: {_hx_name:\"LessThan\",_hx_index:31,__enum__:\"TokenType\",toString:$estr}\n\t,GreaterThan: {_hx_name:\"GreaterThan\",_hx_index:32,__enum__:\"TokenType\",toString:$estr}\n\t,LessThanEqual: {_hx_name:\"LessThanEqual\",_hx_index:33,__enum__:\"TokenType\",toString:$estr}\n\t,GreaterThanEqual: {_hx_name:\"GreaterThanEqual\",_hx_index:34,__enum__:\"TokenType\",toString:$estr}\n\t,Not: {_hx_name:\"Not\",_hx_index:35,__enum__:\"TokenType\",toString:$estr}\n\t,NotEqual: {_hx_name:\"NotEqual\",_hx_index:36,__enum__:\"TokenType\",toString:$estr}\n\t,Equal: {_hx_name:\"Equal\",_hx_index:37,__enum__:\"TokenType\",toString:$estr}\n\t,Tilde: {_hx_name:\"Tilde\",_hx_index:38,__enum__:\"TokenType\",toString:$estr}\n\t,StringEquals: {_hx_name:\"StringEquals\",_hx_index:39,__enum__:\"TokenType\",toString:$estr}\n\t,StringNotEquals: {_hx_name:\"StringNotEquals\",_hx_index:40,__enum__:\"TokenType\",toString:$estr}\n\t,Concat: {_hx_name:\"Concat\",_hx_index:41,__enum__:\"TokenType\",toString:$estr}\n\t,SpaceConcat: {_hx_name:\"SpaceConcat\",_hx_index:42,__enum__:\"TokenType\",toString:$estr}\n\t,TabConcat: {_hx_name:\"TabConcat\",_hx_index:43,__enum__:\"TokenType\",toString:$estr}\n\t,NewlineConcat: {_hx_name:\"NewlineConcat\",_hx_index:44,__enum__:\"TokenType\",toString:$estr}\n\t,Continue: {_hx_name:\"Continue\",_hx_index:45,__enum__:\"TokenType\",toString:$estr}\n\t,LogicalAnd: {_hx_name:\"LogicalAnd\",_hx_index:46,__enum__:\"TokenType\",toString:$estr}\n\t,LogicalOr: {_hx_name:\"LogicalOr\",_hx_index:47,__enum__:\"TokenType\",toString:$estr}\n\t,LeftBitShift: {_hx_name:\"LeftBitShift\",_hx_index:48,__enum__:\"TokenType\",toString:$estr}\n\t,RightBitShift: {_hx_name:\"RightBitShift\",_hx_index:49,__enum__:\"TokenType\",toString:$estr}\n\t,BitwiseAnd: {_hx_name:\"BitwiseAnd\",_hx_index:50,__enum__:\"TokenType\",toString:$estr}\n\t,BitwiseOr: {_hx_name:\"BitwiseOr\",_hx_index:51,__enum__:\"TokenType\",toString:$estr}\n\t,BitwiseXor: {_hx_name:\"BitwiseXor\",_hx_index:52,__enum__:\"TokenType\",toString:$estr}\n\t,Label: {_hx_name:\"Label\",_hx_index:53,__enum__:\"TokenType\",toString:$estr}\n\t,Int: {_hx_name:\"Int\",_hx_index:54,__enum__:\"TokenType\",toString:$estr}\n\t,HexInt: {_hx_name:\"HexInt\",_hx_index:55,__enum__:\"TokenType\",toString:$estr}\n\t,Digit: {_hx_name:\"Digit\",_hx_index:56,__enum__:\"TokenType\",toString:$estr}\n\t,HexDigit: {_hx_name:\"HexDigit\",_hx_index:57,__enum__:\"TokenType\",toString:$estr}\n\t,String: {_hx_name:\"String\",_hx_index:58,__enum__:\"TokenType\",toString:$estr}\n\t,TaggedString: {_hx_name:\"TaggedString\",_hx_index:59,__enum__:\"TokenType\",toString:$estr}\n\t,Exp: {_hx_name:\"Exp\",_hx_index:60,__enum__:\"TokenType\",toString:$estr}\n\t,Float: {_hx_name:\"Float\",_hx_index:61,__enum__:\"TokenType\",toString:$estr}\n\t,Ws: {_hx_name:\"Ws\",_hx_index:62,__enum__:\"TokenType\",toString:$estr}\n\t,LParen: {_hx_name:\"LParen\",_hx_index:63,__enum__:\"TokenType\",toString:$estr}\n\t,Colon: {_hx_name:\"Colon\",_hx_index:64,__enum__:\"TokenType\",toString:$estr}\n\t,RParen: {_hx_name:\"RParen\",_hx_index:65,__enum__:\"TokenType\",toString:$estr}\n\t,LBracket: {_hx_name:\"LBracket\",_hx_index:66,__enum__:\"TokenType\",toString:$estr}\n\t,RBracket: {_hx_name:\"RBracket\",_hx_index:67,__enum__:\"TokenType\",toString:$estr}\n\t,DoubleColon: {_hx_name:\"DoubleColon\",_hx_index:68,__enum__:\"TokenType\",toString:$estr}\n\t,Comma: {_hx_name:\"Comma\",_hx_index:69,__enum__:\"TokenType\",toString:$estr}\n\t,Semicolon: {_hx_name:\"Semicolon\",_hx_index:70,__enum__:\"TokenType\",toString:$estr}\n\t,LeftSquareBracket: {_hx_name:\"LeftSquareBracket\",_hx_index:71,__enum__:\"TokenType\",toString:$estr}\n\t,RightSquareBracket: {_hx_name:\"RightSquareBracket\",_hx_index:72,__enum__:\"TokenType\",toString:$estr}\n\t,Or: {_hx_name:\"Or\",_hx_index:73,__enum__:\"TokenType\",toString:$estr}\n\t,Dollar: {_hx_name:\"Dollar\",_hx_index:74,__enum__:\"TokenType\",toString:$estr}\n\t,Dot: {_hx_name:\"Dot\",_hx_index:75,__enum__:\"TokenType\",toString:$estr}\n\t,PlusPlus: {_hx_name:\"PlusPlus\",_hx_index:76,__enum__:\"TokenType\",toString:$estr}\n\t,MinusMinus: {_hx_name:\"MinusMinus\",_hx_index:77,__enum__:\"TokenType\",toString:$estr}\n\t,QuestionMark: {_hx_name:\"QuestionMark\",_hx_index:78,__enum__:\"TokenType\",toString:$estr}\n\t,Eof: {_hx_name:\"Eof\",_hx_index:79,__enum__:\"TokenType\",toString:$estr}\n\t,Comment: ($_=function(multiline) { return {_hx_index:80,multiline:multiline,__enum__:\"TokenType\",toString:$estr}; },$_._hx_name=\"Comment\",$_.__params__ = [\"multiline\"],$_)\n\t,Unknown: {_hx_name:\"Unknown\",_hx_index:81,__enum__:\"TokenType\",toString:$estr}\n};\nTokenType.__constructs__ = [TokenType.Datablock,TokenType.Package,TokenType.Function,TokenType.If,TokenType.Else,TokenType.Switch,TokenType.Case,TokenType.Return,TokenType.Break,TokenType.New,TokenType.While,TokenType.For,TokenType.True,TokenType.False,TokenType.Default,TokenType.Plus,TokenType.Minus,TokenType.Multiply,TokenType.Divide,TokenType.Modulus,TokenType.Assign,TokenType.PlusAssign,TokenType.MinusAssign,TokenType.MultiplyAssign,TokenType.OrAssign,TokenType.AndAssign,TokenType.XorAssign,TokenType.ModulusAssign,TokenType.DivideAssign,TokenType.ShiftLeftAssign,TokenType.ShiftRightAssign,TokenType.LessThan,TokenType.GreaterThan,TokenType.LessThanEqual,TokenType.GreaterThanEqual,TokenType.Not,TokenType.NotEqual,TokenType.Equal,TokenType.Tilde,TokenType.StringEquals,TokenType.StringNotEquals,TokenType.Concat,TokenType.SpaceConcat,TokenType.TabConcat,TokenType.NewlineConcat,TokenType.Continue,TokenType.LogicalAnd,TokenType.LogicalOr,TokenType.LeftBitShift,TokenType.RightBitShift,TokenType.BitwiseAnd,TokenType.BitwiseOr,TokenType.BitwiseXor,TokenType.Label,TokenType.Int,TokenType.HexInt,TokenType.Digit,TokenType.HexDigit,TokenType.String,TokenType.TaggedString,TokenType.Exp,TokenType.Float,TokenType.Ws,TokenType.LParen,TokenType.Colon,TokenType.RParen,TokenType.LBracket,TokenType.RBracket,TokenType.DoubleColon,TokenType.Comma,TokenType.Semicolon,TokenType.LeftSquareBracket,TokenType.RightSquareBracket,TokenType.Or,TokenType.Dollar,TokenType.Dot,TokenType.PlusPlus,TokenType.MinusMinus,TokenType.QuestionMark,TokenType.Eof,TokenType.Comment,TokenType.Unknown];\nclass Type {\n\tstatic enumParameters(e) {\n\t\tlet enm = $hxEnums[e.__enum__];\n\t\tlet params = enm.__constructs__[e._hx_index].__params__;\n\t\tif(params != null) {\n\t\t\tlet _g = [];\n\t\t\tlet _g1 = 0;\n\t\t\twhile(_g1 < params.length) {\n\t\t\t\tlet p = params[_g1];\n\t\t\t\t++_g1;\n\t\t\t\t_g.push(e[p]);\n\t\t\t}\n\t\t\treturn _g;\n\t\t} else {\n\t\t\treturn [];\n\t\t}\n\t}\n}\nType.__name__ = true;\nclass BytesExtensions {\n\tstatic strlen(b,start) {\n\t\tlet slen = 0;\n\t\twhile(b.b[start] != 0) {\n\t\t\t++start;\n\t\t\t++slen;\n\t\t}\n\t\treturn slen;\n\t}\n\tstatic getBytes(s) {\n\t\tlet bytes = new haxe_io_Bytes(new ArrayBuffer(s.length + 1));\n\t\tlet _g = 0;\n\t\tlet _g1 = s.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet v = s.charCodeAt(i);\n\t\t\tbytes.b[i] = v;\n\t\t}\n\t\tbytes.b[s.length] = 0;\n\t\treturn bytes;\n\t}\n\tstatic getString(buffer,start) {\n\t\tlet sbuf_b = \"\";\n\t\tlet i = start;\n\t\twhile(buffer.b[i] != 0) {\n\t\t\tlet c = buffer.b[i];\n\t\t\tsbuf_b += String.fromCodePoint(c);\n\t\t\t++i;\n\t\t}\n\t\treturn sbuf_b;\n\t}\n}\nBytesExtensions.__name__ = true;\nclass StringStack {\n\tconstructor() {\n\t\tthis.functionOffset = 0;\n\t\tthis.startStackSize = 0;\n\t\tthis.len = 0;\n\t\tthis.start = 0;\n\t\tthis.argc = 0;\n\t\tthis.numFrames = 0;\n\t\tthis.startOffsets = [];\n\t\tthis.frameOffsets = [];\n\t\tthis.bufferSize = 0;\n\t\tthis.argBufferSize = 0;\n\t\tthis.buffer = new haxe_io_Bytes(new ArrayBuffer(1024));\n\t\tthis.argBuffer = new haxe_io_Bytes(new ArrayBuffer(1024));\n\t\tthis.numFrames = 0;\n\t\tthis.start = 0;\n\t\tthis.len = 0;\n\t\tthis.startStackSize = 0;\n\t\tthis.functionOffset = 0;\n\t\tlet _g = 0;\n\t\twhile(_g < 1024) {\n\t\t\tlet i = _g++;\n\t\t\tthis.frameOffsets.push(0);\n\t\t\tthis.startOffsets.push(0);\n\t\t}\n\t\tthis.validateBufferSize(8092);\n\t\tthis.validateArgBufferSize(2048);\n\t}\n\tvalidateBufferSize(size) {\n\t\tif(size > this.bufferSize) {\n\t\t\tthis.bufferSize = size + 2048;\n\t\t\tlet newbuf = new haxe_io_Bytes(new ArrayBuffer(this.bufferSize));\n\t\t\tnewbuf.blit(0,this.buffer,0,this.buffer.length);\n\t\t\tthis.buffer = newbuf;\n\t\t}\n\t}\n\tvalidateArgBufferSize(size) {\n\t\tif(size > this.argBufferSize) {\n\t\t\tthis.argBufferSize = size + 2048;\n\t\t\tlet newbuf = new haxe_io_Bytes(new ArrayBuffer(this.argBufferSize));\n\t\t\tnewbuf.blit(0,this.argBuffer,0,this.argBuffer.length);\n\t\t\tthis.argBuffer = newbuf;\n\t\t}\n\t}\n\tsetIntValue(i) {\n\t\tthis.validateBufferSize(this.start + 32);\n\t\tlet s = BytesExtensions.getBytes(\"\" + i);\n\t\tthis.buffer.blit(this.start,s,0,s.length);\n\t\tthis.len = s.length - 1;\n\t}\n\tsetFloatValue(i) {\n\t\tthis.validateBufferSize(this.start + 32);\n\t\tlet s = BytesExtensions.getBytes(\"\" + i);\n\t\tthis.buffer.blit(this.start,s,0,s.length);\n\t\tthis.len = s.length - 1;\n\t}\n\tclearFunctionOffset() {\n\t\tthis.functionOffset = 0;\n\t}\n\tsetStringValue(s) {\n\t\tif(s == null) {\n\t\t\tthis.len = 0;\n\t\t\tthis.buffer.b[this.start] = 0;\n\t\t\treturn;\n\t\t}\n\t\tlet sbuf = BytesExtensions.getBytes(s);\n\t\tthis.len = sbuf.length - 1;\n\t\tthis.validateBufferSize(this.start + this.len + 2);\n\t\tthis.buffer.blit(this.start,sbuf,0,sbuf.length);\n\t}\n\tgetSTValue() {\n\t\tlet sbuf_b = \"\";\n\t\tlet i = this.start;\n\t\twhile(this.buffer.b[i] != 0) {\n\t\t\tlet c = this.buffer.b[i];\n\t\t\tsbuf_b += String.fromCodePoint(c);\n\t\t\t++i;\n\t\t}\n\t\treturn sbuf_b;\n\t}\n\tgetIntValue() {\n\t\tlet s = this.getSTValue();\n\t\treturn Std.parseInt(s);\n\t}\n\tgetFloatValue() {\n\t\tlet s = this.getSTValue();\n\t\treturn parseFloat(s);\n\t}\n\tadvance() {\n\t\tthis.startOffsets[this.startStackSize++] = this.start;\n\t\tthis.start += this.len;\n\t\tthis.len = 0;\n\t}\n\tadvanceChar(c) {\n\t\tthis.startOffsets[this.startStackSize++] = this.start;\n\t\tthis.start += this.len;\n\t\tthis.buffer.b[this.start] = c;\n\t\tthis.buffer.b[this.start + 1] = 0;\n\t\tthis.start += 1;\n\t\tthis.len = 0;\n\t}\n\tpush() {\n\t\tthis.advanceChar(0);\n\t}\n\tsetLen(newLen) {\n\t\tthis.len = newLen;\n\t}\n\trewind() {\n\t\tthis.start = this.startOffsets[--this.startStackSize];\n\t\tthis.len = BytesExtensions.strlen(this.buffer,this.start);\n\t}\n\trewindTerminate() {\n\t\tthis.buffer.b[this.start] = 0;\n\t\tthis.start = this.startOffsets[--this.startStackSize];\n\t\tthis.len = BytesExtensions.strlen(this.buffer,this.start);\n\t}\n\tcompare() {\n\t\tlet oldStart = this.start;\n\t\tthis.start = this.startOffsets[--this.startStackSize];\n\t\tlet ret = BytesExtensions.getString(this.buffer,this.start).toLowerCase() == BytesExtensions.getString(this.buffer,oldStart).toLowerCase();\n\t\tthis.len = 0;\n\t\tthis.buffer.b[this.start] = 0;\n\t\treturn ret;\n\t}\n\tpushFrame() {\n\t\tthis.frameOffsets[this.numFrames++] = this.startStackSize;\n\t\tthis.startOffsets[this.startStackSize++] = this.start;\n\t\tthis.start += 512;\n\t\tthis.validateBufferSize(0);\n\t}\n\tgetArgs(name) {\n\t\tlet startStack = this.frameOffsets[--this.numFrames] + 1;\n\t\tlet argCount = Math.min(this.startStackSize - startStack,20);\n\t\tlet args = [name];\n\t\tlet _g = 0;\n\t\tlet _g1 = argCount;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\targs.push(BytesExtensions.getString(this.buffer,this.startOffsets[startStack + i]));\n\t\t}\n\t\t++argCount;\n\t\tthis.startStackSize = startStack - 1;\n\t\tthis.start = this.startOffsets[this.startStackSize];\n\t\tthis.len = 0;\n\t\treturn args;\n\t}\n}\nStringStack.__name__ = true;\nObject.assign(StringStack.prototype, {\n\t__class__: StringStack\n});\nclass Variable {\n\tconstructor(name,vm) {\n\t\tthis.internalType = -1;\n\t\tthis.array = new haxe_ds_StringMap();\n\t\tthis.name = name;\n\t\tthis.vm = vm;\n\t}\n\tgetIntValue() {\n\t\tif(this.internalType < -1) {\n\t\t\treturn this.intValue;\n\t\t} else {\n\t\t\tif(Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,this.stringValue)) {\n\t\t\t\treturn this.vm.simObjects.h[this.stringValue].id;\n\t\t\t}\n\t\t\tlet intParse = Std.parseInt(this.stringValue);\n\t\t\tif(intParse == null) {\n\t\t\t\treturn 0;\n\t\t\t} else {\n\t\t\t\treturn intParse;\n\t\t\t}\n\t\t}\n\t}\n\tgetFloatValue() {\n\t\tif(this.internalType < -1) {\n\t\t\treturn this.floatValue;\n\t\t} else {\n\t\t\tif(Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,this.stringValue)) {\n\t\t\t\treturn this.vm.simObjects.h[this.stringValue].id;\n\t\t\t}\n\t\t\tlet floatParse = parseFloat(this.stringValue);\n\t\t\tif(isNaN(floatParse)) {\n\t\t\t\treturn 0;\n\t\t\t} else {\n\t\t\t\treturn floatParse;\n\t\t\t}\n\t\t}\n\t}\n\tgetStringValue() {\n\t\tif(this.internalType == -1) {\n\t\t\treturn this.stringValue;\n\t\t}\n\t\tif(this.internalType == -2) {\n\t\t\treturn Std.string(this.floatValue);\n\t\t}\n\t\tif(this.internalType == -3) {\n\t\t\treturn Std.string(this.intValue);\n\t\t} else {\n\t\t\treturn this.stringValue;\n\t\t}\n\t}\n\tsetIntValue(val) {\n\t\tif(this.internalType < -1) {\n\t\t\tthis.intValue = val;\n\t\t\tthis.floatValue = this.intValue;\n\t\t\tthis.stringValue = null;\n\t\t\tthis.internalType = -3;\n\t\t} else {\n\t\t\tthis.intValue = val;\n\t\t\tthis.floatValue = this.intValue;\n\t\t\tthis.stringValue = val == null ? \"null\" : \"\" + val;\n\t\t}\n\t}\n\tsetFloatValue(val) {\n\t\tif(this.internalType < -1) {\n\t\t\tthis.floatValue = val;\n\t\t\tthis.intValue = this.floatValue;\n\t\t\tthis.stringValue = null;\n\t\t\tthis.internalType = -2;\n\t\t} else {\n\t\t\tthis.floatValue = val;\n\t\t\tthis.intValue = this.floatValue;\n\t\t\tthis.stringValue = val == null ? \"null\" : \"\" + val;\n\t\t}\n\t}\n\tsetStringValue(val) {\n\t\tif(this.internalType < -1) {\n\t\t\tthis.floatValue = parseFloat(val);\n\t\t\tthis.intValue = this.floatValue;\n\t\t\tthis.internalType = -1;\n\t\t\tthis.stringValue = val;\n\t\t} else {\n\t\t\tthis.floatValue = parseFloat(val);\n\t\t\tthis.intValue = this.floatValue;\n\t\t\tthis.stringValue = val;\n\t\t}\n\t}\n\tresolveArray(arrayIndex) {\n\t\tif(Object.prototype.hasOwnProperty.call(this.array.h,arrayIndex)) {\n\t\t\treturn this.array.h[arrayIndex];\n\t\t} else {\n\t\t\tlet ret = new Variable(arrayIndex,this.vm);\n\t\t\tthis.array.h[arrayIndex] = ret;\n\t\t\treturn ret;\n\t\t}\n\t}\n}\n$hx_exports[\"Variable\"] = Variable;\nVariable.__name__ = true;\nObject.assign(Variable.prototype, {\n\t__class__: Variable\n});\nclass ExprEvalState {\n\tconstructor(vm) {\n\t\tthis.globalVars = new haxe_ds_StringMap();\n\t\tthis.thisObject = null;\n\t\tthis.thisVariable = null;\n\t\tthis.stack = [];\n\t\tthis.stackVars = [];\n\t\tthis.vm = vm;\n\t}\n\tsetCurVarName(name) {\n\t\tif(Object.prototype.hasOwnProperty.call(this.globalVars.h,name)) {\n\t\t\tthis.thisVariable = this.globalVars.h[name];\n\t\t} else if(this.stackVars.length > 0) {\n\t\t\tthis.thisVariable = this.stackVars[this.stackVars.length - 1].h[name];\n\t\t}\n\t\tif(this.thisVariable == null) {\n\t\t\tLog.println(\"Warning: Undefined variable \'\" + name + \"\'\");\n\t\t}\n\t}\n\tsetCurVarNameCreate(name) {\n\t\tif(name.startsWith(\"$\")) {\n\t\t\tif(Object.prototype.hasOwnProperty.call(this.globalVars.h,name)) {\n\t\t\t\tthis.thisVariable = this.globalVars.h[name];\n\t\t\t} else {\n\t\t\t\tthis.thisVariable = new Variable(name,this.vm);\n\t\t\t\tthis.globalVars.h[name] = this.thisVariable;\n\t\t\t}\n\t\t} else if(this.stackVars.length > 0) {\n\t\t\tif(Object.prototype.hasOwnProperty.call(this.stackVars[this.stackVars.length - 1].h,name)) {\n\t\t\t\tthis.thisVariable = this.stackVars[this.stackVars.length - 1].h[name];\n\t\t\t} else {\n\t\t\t\tthis.thisVariable = new Variable(name,this.vm);\n\t\t\t\tthis.stackVars[this.stackVars.length - 1].h[name] = this.thisVariable;\n\t\t\t}\n\t\t} else {\n\t\t\tthis.thisVariable = null;\n\t\t\tLog.println(\"Warning: Accessing local variable \'\" + name + \"\' in global scope!\");\n\t\t}\n\t}\n\tgetIntVariable() {\n\t\tif(this.thisVariable != null) {\n\t\t\treturn this.thisVariable.getIntValue();\n\t\t} else {\n\t\t\treturn 0;\n\t\t}\n\t}\n\tgetFloatVariable() {\n\t\tif(this.thisVariable != null) {\n\t\t\treturn this.thisVariable.getFloatValue();\n\t\t} else {\n\t\t\treturn 0;\n\t\t}\n\t}\n\tgetStringVariable() {\n\t\tif(this.thisVariable != null) {\n\t\t\treturn this.thisVariable.getStringValue();\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tsetIntVariable(val) {\n\t\tif(this.thisVariable != null) {\n\t\t\tthis.thisVariable.setIntValue(val);\n\t\t}\n\t}\n\tsetFloatVariable(val) {\n\t\tif(this.thisVariable != null) {\n\t\t\tthis.thisVariable.setFloatValue(val);\n\t\t}\n\t}\n\tsetStringVariable(val) {\n\t\tif(this.thisVariable != null) {\n\t\t\tthis.thisVariable.setStringValue(val);\n\t\t}\n\t}\n\tpushFrame(fnname,namespace) {\n\t\tlet f = { scopeName : fnname, scopeNamespace : namespace};\n\t\tthis.stack.push(f);\n\t\tthis.stackVars.push(new haxe_ds_StringMap());\n\t}\n\tpopFrame() {\n\t\tthis.stack.pop();\n\t\tthis.stackVars.pop();\n\t}\n}\nExprEvalState.__name__ = true;\nObject.assign(ExprEvalState.prototype, {\n\t__class__: ExprEvalState\n});\nclass VM {\n\tconstructor(async) {\n\t\tif(async == null) {\n\t\t\tasync = false;\n\t\t}\n\t\tthis.currentNamespace = null;\n\t\tthis.isAsync = false;\n\t\tthis.schedules = [];\n\t\tthis.traceOn = false;\n\t\tthis.codeBlocks = [];\n\t\tthis.activePackages = [];\n\t\tthis.nextDatablockId = 1;\n\t\tthis.nextSimId = 2000;\n\t\tthis.rootGroup = new console_SimGroup();\n\t\tthis.idMap = new haxe_ds_IntMap();\n\t\tthis.dataBlocks = new haxe_ds_StringMap();\n\t\tthis.simObjects = new haxe_ds_StringMap();\n\t\tthis.taggedStrings = [];\n\t\tthis.intStack = new haxe_ds_GenericStack();\n\t\tthis.floatStack = new haxe_ds_GenericStack();\n\t\tthis.STR = new StringStack();\n\t\tthis.namespaces = [];\n\t\tthis.evalState = new ExprEvalState(this);\n\t\tthis.namespaces.push(new console_Namespace(null,null,null));\n\t\tconsole_ConsoleFunctions.install(this);\n\t\tconsole_MathFunctions.install(this);\n\t\tconsole_ConsoleObjectConstructors.install(this);\n\t\tthis.rootGroup.register(this);\n\t\tthis.isAsync = async;\n\t\tthis.startTime = Date.now();\n\t}\n\tfindNamespace(name) {\n\t\tlet _g = [];\n\t\tlet _g1 = 0;\n\t\tlet _g2 = this.namespaces;\n\t\twhile(_g1 < _g2.length) {\n\t\t\tlet v = _g2[_g1];\n\t\t\t++_g1;\n\t\t\tif(name != null && v.name != null ? v.name.toLowerCase() == name.toLowerCase() : v.name == name) {\n\t\t\t\t_g.push(v);\n\t\t\t}\n\t\t}\n\t\tlet nsList = _g;\n\t\tif(nsList.length == 0) {\n\t\t\treturn null;\n\t\t}\n\t\treturn nsList[0];\n\t}\n\tfindFunction(namespace,name) {\n\t\tlet pkgs = this.activePackages.slice();\n\t\tpkgs.reverse();\n\t\tpkgs.push(null);\n\t\tlet nmcmp = namespace == null ? null : namespace.toLowerCase();\n\t\tlet _g = 0;\n\t\twhile(_g < pkgs.length) {\n\t\t\tlet pkg = pkgs[_g];\n\t\t\t++_g;\n\t\t\tlet _g1 = 0;\n\t\t\tlet _g2 = this.namespaces;\n\t\t\twhile(_g1 < _g2.length) {\n\t\t\t\tlet nm = _g2[_g1];\n\t\t\t\t++_g1;\n\t\t\t\tif(nm.pkg == pkg) {\n\t\t\t\t\tlet thisnm = nm.name == null ? null : nm.name.toLowerCase();\n\t\t\t\t\tif(thisnm == nmcmp) {\n\t\t\t\t\t\tlet f = nm.find(name);\n\t\t\t\t\t\tif(f != null) {\n\t\t\t\t\t\t\treturn f;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn null;\n\t}\n\tlinkNamespaces(parent,child) {\n\t\tlet parentNamespace = this.findNamespace(parent);\n\t\tif(parentNamespace == null) {\n\t\t\tparentNamespace = new console_Namespace(parent,null,null);\n\t\t\tthis.namespaces.push(parentNamespace);\n\t\t}\n\t\tlet childNamespace = this.findNamespace(child);\n\t\tif(childNamespace == null) {\n\t\t\tchildNamespace = new console_Namespace(child,null,null);\n\t\t\tthis.namespaces.push(childNamespace);\n\t\t}\n\t\tchildNamespace.parent = parentNamespace;\n\t}\n\tactivatePackage(name) {\n\t\tlet lastActivePackage = this.activePackages.length == 0 ? null : this.activePackages[this.activePackages.length - 1];\n\t\tlet _g = 0;\n\t\tlet _g1 = this.namespaces;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet namespace = _g1[_g];\n\t\t\t++_g;\n\t\t\tif(namespace.pkg == name) {\n\t\t\t\tlet _g = [];\n\t\t\t\tlet _g1 = 0;\n\t\t\t\tlet _g2 = this.namespaces;\n\t\t\t\twhile(_g1 < _g2.length) {\n\t\t\t\t\tlet v = _g2[_g1];\n\t\t\t\t\t++_g1;\n\t\t\t\t\tif(v.name == namespace.name && v.pkg == lastActivePackage) {\n\t\t\t\t\t\t_g.push(v);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tlet prevNamespace = _g[0];\n\t\t\t\tnamespace.parent = prevNamespace;\n\t\t\t}\n\t\t}\n\t\tthis.activePackages.push(name);\n\t}\n\tdeactivatePackage(name) {\n\t\tlet referencingNamespaces = [];\n\t\tlet _g = 0;\n\t\tlet _g1 = this.namespaces;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet namespace = _g1[_g];\n\t\t\t++_g;\n\t\t\tif(namespace.parent != null) {\n\t\t\t\tif(namespace.parent.pkg == name) {\n\t\t\t\t\treferencingNamespaces.push(namespace);\n\t\t\t\t}\n\t\t\t}\n\t\t\tif(namespace.pkg == name) {\n\t\t\t\tnamespace.parent = null;\n\t\t\t}\n\t\t}\n\t\tlet prevPackages = this.activePackages.slice(0,this.activePackages.indexOf(name));\n\t\tprevPackages.reverse();\n\t\tprevPackages.push(null);\n\t\tHxOverrides.remove(this.activePackages,name);\n\t\tlet _g2 = 0;\n\t\twhile(_g2 < referencingNamespaces.length) {\n\t\t\tlet namespace = referencingNamespaces[_g2];\n\t\t\t++_g2;\n\t\t\tlet parentNamespace = null;\n\t\t\tlet _g = 0;\n\t\t\twhile(_g < prevPackages.length) {\n\t\t\t\tlet prevPackage = prevPackages[_g];\n\t\t\t\t++_g;\n\t\t\t\tlet _g1 = [];\n\t\t\t\tlet _g2 = 0;\n\t\t\t\tlet _g3 = this.namespaces;\n\t\t\t\twhile(_g2 < _g3.length) {\n\t\t\t\t\tlet v = _g3[_g2];\n\t\t\t\t\t++_g2;\n\t\t\t\t\tif(v.name == namespace.name && v.pkg == prevPackage) {\n\t\t\t\t\t\t_g1.push(v);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tlet lastNamespace = _g1[0];\n\t\t\t\tif(lastNamespace != null) {\n\t\t\t\t\tparentNamespace = lastNamespace;\n\t\t\t\t\tbreak;\n\t\t\t\t}\n\t\t\t}\n\t\t\tnamespace.parent = parentNamespace;\n\t\t}\n\t}\n\taddConsoleFunction(fnName,fnUsage,minArgs,maxArgs,fnType) {\n\t\tlet emptyNamespace = this.namespaces[0];\n\t\temptyNamespace.addFunctionFull(fnName,fnUsage,minArgs,maxArgs,fnType);\n\t}\n\taddJSFunction(func,funcName,namespace,pkg) {\n\t\tif(namespace == \"\") {\n\t\t\tnamespace = null;\n\t\t}\n\t\tif(pkg == \"\") {\n\t\t\tpkg = null;\n\t\t}\n\t\tlet findNamespaces = this.findNamespace(namespace);\n\t\tlet nm = null;\n\t\tif(findNamespaces == null) {\n\t\t\tnm = new console_Namespace(namespace,null,null);\n\t\t\tthis.namespaces.push(nm);\n\t\t} else {\n\t\t\tnm = findNamespaces;\n\t\t}\n\t\tnm.addFunctionFull(funcName,\"\",0,0,console_FunctionType.JSFunctionType(func));\n\t}\n\taddConsoleMethod(className,fnName,fnUsage,minArgs,maxArgs,fnType) {\n\t\tlet findNamespaces = this.findNamespace(className);\n\t\tlet namespace = null;\n\t\tif(findNamespaces == null) {\n\t\t\tnamespace = new console_Namespace(className,null,null);\n\t\t\tthis.namespaces.push(namespace);\n\t\t} else {\n\t\t\tnamespace = findNamespaces;\n\t\t}\n\t\tnamespace.addFunctionFull(fnName,fnUsage,minArgs,maxArgs,fnType);\n\t}\n\tfindObject(name) {\n\t\tif(Object.prototype.hasOwnProperty.call(this.simObjects.h,name)) {\n\t\t\treturn this.simObjects.h[name];\n\t\t} else if(this.idMap.h.hasOwnProperty(Std.parseInt(name))) {\n\t\t\treturn this.idMap.h[Std.parseInt(name)];\n\t\t} else {\n\t\t\treturn null;\n\t\t}\n\t}\n\tschedule(time,refObject,args) {\n\t\tlet _gthis = this;\n\t\tif(this.isAsync) {\n\t\t\tlet sch = null;\n\t\t\tsch = window.setTimeout(function() {\n\t\t\t\t_gthis.callFunction(refObject,args);\n\t\t\t\tif(_gthis.schedules.includes(sch)) {\n\t\t\t\t\tHxOverrides.remove(_gthis.schedules,sch);\n\t\t\t\t}\n\t\t\t},time);\n\t\t\tthis.schedules.push(sch);\n\t\t\treturn sch;\n\t\t} else {\n\t\t\tthis.callFunction(refObject,args);\n\t\t\treturn 0;\n\t\t}\n\t}\n\tisEventPending(eventId) {\n\t\tif(this.isAsync) {\n\t\t\treturn this.schedules.includes(eventId);\n\t\t} else {\n\t\t\treturn false;\n\t\t}\n\t}\n\tcancelEvent(eventId) {\n\t\tif(this.isAsync) {\n\t\t\tif(this.schedules.includes(eventId)) {\n\t\t\t\twindow.clearTimeout(eventId);\n\t\t\t\tHxOverrides.remove(this.schedules,eventId);\n\t\t\t}\n\t\t}\n\t}\n\tcallFunction(simObject,args) {\n\t\tif(simObject == null) {\n\t\t\tlet func = this.findFunction(null,args[0]);\n\t\t\tif(func == null) {\n\t\t\t\tLog.println(\"\" + args[0] + \": Unknown command.\");\n\t\t\t}\n\t\t\tthis.execute(func,args);\n\t\t} else {\n\t\t\tlet func = this.findFunction(simObject.getClassName(),args[0]);\n\t\t\tif(func != null) {\n\t\t\t\tlet save = this.evalState.thisObject;\n\t\t\t\tthis.evalState.thisObject = simObject;\n\t\t\t\tthis.execute(func,args);\n\t\t\t\tthis.evalState.thisObject = save;\n\t\t\t}\n\t\t}\n\t}\n\tcallFunc(namespaceName,funcName,funcArgs,callType) {\n\t\tif(callType == \"FunctionCall\") {\n\t\t\tlet func = this.findFunction(namespaceName == \"\" ? null : namespaceName,funcName);\n\t\t\tif(func != null) {\n\t\t\t\tlet args = [];\n\t\t\t\targs.push(funcName);\n\t\t\t\targs = args.concat(funcArgs);\n\t\t\t\treturn this.execute(func,args);\n\t\t\t} else {\n\t\t\t\tLog.println(\"Cannot find function \" + namespaceName + \"::\" + funcName);\n\t\t\t}\n\t\t} else if(callType == \"MethodCall\") {\n\t\t\tlet obj = this.findObject(funcArgs[0]);\n\t\t\tif(obj == null) {\n\t\t\t\tLog.println(\"Cannot find object \" + funcArgs[0]);\n\t\t\t} else {\n\t\t\t\tlet func = this.findFunction(obj.getClassName(),funcName);\n\t\t\t\tif(func != null) {\n\t\t\t\t\tlet args = [];\n\t\t\t\t\targs.push(funcName);\n\t\t\t\t\targs.push(\"\" + obj.id);\n\t\t\t\t\targs = args.concat(funcArgs.slice(1));\n\t\t\t\t\tlet save = this.evalState.thisObject;\n\t\t\t\t\tthis.evalState.thisObject = obj;\n\t\t\t\t\tlet ret = this.execute(func,args);\n\t\t\t\t\tthis.evalState.thisObject = save;\n\t\t\t\t\treturn ret;\n\t\t\t\t} else {\n\t\t\t\t\tLog.println(\"Cannot find function \" + obj.getClassName() + \"::\" + funcName);\n\t\t\t\t}\n\t\t\t}\n\t\t} else if(callType == \"ParentCall\") {\n\t\t\tif(this.currentNamespace != null) {\n\t\t\t\tif(this.currentNamespace.parent != null) {\n\t\t\t\t\tlet ns = this.currentNamespace.parent;\n\t\t\t\t\tlet func = ns.find(funcName);\n\t\t\t\t\tif(func != null) {\n\t\t\t\t\t\tlet args = [];\n\t\t\t\t\t\tif(func.namespace.name != null && func.namespace.name != \"\") {\n\t\t\t\t\t\t\targs.push(func.namespace.name);\n\t\t\t\t\t\t}\n\t\t\t\t\t\targs.push(funcName);\n\t\t\t\t\t\targs = args.concat(funcArgs);\n\t\t\t\t\t\treturn this.execute(func,args);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn \"\";\n\t}\n\tnewObject(className,name,isDataBlock,parentName,root,props,children) {\n\t\tlet currentNewObject = null;\n\t\tif(isDataBlock) {\n\t\t\tlet db = this.dataBlocks.h[name];\n\t\t\tif(db != null) {\n\t\t\t\tif(db.getClassName().toLowerCase() == className.toLowerCase()) {\n\t\t\t\t\tLog.println(\"Cannot re-declare data block \" + className + \" with a different class.\");\n\t\t\t\t}\n\t\t\t\tcurrentNewObject = db;\n\t\t\t}\n\t\t}\n\t\tif(currentNewObject == null) {\n\t\t\tif(!isDataBlock) {\n\t\t\t\tif(!Object.prototype.hasOwnProperty.call(console_ConsoleObjectConstructors.constructorMap.h,className)) {\n\t\t\t\t\tLog.println(\"Unable to instantantiate non con-object class \" + className);\n\t\t\t\t}\n\t\t\t\tcurrentNewObject = console_ConsoleObjectConstructors.constructorMap.h[className]();\n\t\t\t} else {\n\t\t\t\tcurrentNewObject = new console_SimDataBlock();\n\t\t\t\tcurrentNewObject.className = className;\n\t\t\t}\n\t\t\tcurrentNewObject.assignId(isDataBlock ? this.nextDatablockId++ : this.nextSimId++);\n\t\t\tif(parentName != null) {\n\t\t\t\tlet parent = this.simObjects.h[parentName];\n\t\t\t\tif(parent != null) {\n\t\t\t\t\tcurrentNewObject.assignFieldsFrom(parent);\n\t\t\t\t} else {\n\t\t\t\t\tLog.println(\"Parent object \" + parentName + \" for \" + className + \" does not exist.\");\n\t\t\t\t}\n\t\t\t}\n\t\t\tcurrentNewObject.name = name;\n\t\t\tlet fieldEntries = Object.entries(props);\n\t\t\tlet _g = 0;\n\t\t\twhile(_g < fieldEntries.length) {\n\t\t\t\tlet entry = fieldEntries[_g];\n\t\t\t\t++_g;\n\t\t\t\tcurrentNewObject.setDataField(entry[0],null,entry[1]);\n\t\t\t}\n\t\t\tlet _g1 = 0;\n\t\t\twhile(_g1 < children.length) {\n\t\t\t\tlet child = children[_g1];\n\t\t\t\t++_g1;\n\t\t\t\tlet childObj = this.findObject(child.getStringValue());\n\t\t\t\tif(((currentNewObject) instanceof console_SimGroup) || ((currentNewObject) instanceof console_SimSet)) {\n\t\t\t\t\t(js_Boot.__cast(currentNewObject , console_SimSet)).addObject(childObj);\n\t\t\t\t} else {\n\t\t\t\t\tthis.rootGroup.addObject(childObj);\n\t\t\t\t}\n\t\t\t}\n\t\t\tlet added = false;\n\t\t\tif(!Object.prototype.hasOwnProperty.call(this.simObjects.h,currentNewObject.name)) {\n\t\t\t\tadded = true;\n\t\t\t\tlet this1 = this.simObjects;\n\t\t\t\tlet key = currentNewObject.getName();\n\t\t\t\tthis1.h[key] = currentNewObject;\n\t\t\t}\n\t\t\tthis.idMap.h[currentNewObject.id] = currentNewObject;\n\t\t\tcurrentNewObject.register(this);\n\t\t\tlet datablock = isDataBlock ? currentNewObject : null;\n\t\t\tif(datablock != null) {\n\t\t\t\tif(!datablock.preload()) {\n\t\t\t\t\tLog.println(\"Datablock \" + datablock.getName() + \" failed to preload.\");\n\t\t\t\t\tthis.idMap.remove(currentNewObject.id);\n\t\t\t\t\tif(added) {\n\t\t\t\t\t\tlet this1 = this.simObjects;\n\t\t\t\t\t\tlet key = currentNewObject.getName();\n\t\t\t\t\t\tlet _this = this1;\n\t\t\t\t\t\tif(Object.prototype.hasOwnProperty.call(_this.h,key)) {\n\t\t\t\t\t\t\tdelete(_this.h[key]);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tlet this1 = this.dataBlocks;\n\t\t\t\t\tlet key = currentNewObject.getName();\n\t\t\t\t\tthis1.h[key] = datablock;\n\t\t\t\t}\n\t\t\t}\n\t\t\tif(root) {\n\t\t\t\tthis.rootGroup.addObject(currentNewObject);\n\t\t\t}\n\t\t\tlet v = new Variable(\"%currentNewObject\",this);\n\t\t\tv.setIntValue(currentNewObject.id);\n\t\t\treturn v;\n\t\t}\n\t\treturn null;\n\t}\n\tresolveIdent(ident) {\n\t\tlet fObj = this.findObject(ident);\n\t\tif(fObj != null) {\n\t\t\tlet fVar = new Variable(ident,this);\n\t\t\tfVar.setStringValue(fObj.getName());\n\t\t\treturn fVar;\n\t\t}\n\t\treturn null;\n\t}\n\tslotAssign(obj,slotName,slotArrayIdx,valueStr) {\n\t\tlet simObj = this.findObject(obj.getStringValue());\n\t\tif(simObj != null) {\n\t\t\tsimObj.setDataField(slotName,slotArrayIdx,valueStr);\n\t\t}\n\t}\n\tslotAccess(objstr,slotName,slotArrayIdx) {\n\t\tlet simObj = this.findObject(objstr);\n\t\tif(simObj != null) {\n\t\t\tlet val = simObj.getDataField(slotName,slotArrayIdx);\n\t\t\tlet v = new Variable(slotName,this);\n\t\t\tv.setStringValue(val);\n\t\t\treturn v;\n\t\t}\n\t\treturn null;\n\t}\n\tdispose() {\n\t}\n\texecute(ns,args) {\n\t\tlet _g = ns.type;\n\t\tif(_g._hx_index == 0) {\n\t\t\tlet functionOffset = _g.functionOffset;\n\t\t\tlet codeBlock = _g.codeBlock;\n\t\t\tif(functionOffset > 0) {\n\t\t\t\tlet saveNamespace = this.currentNamespace;\n\t\t\t\tthis.currentNamespace = ns.namespace;\n\t\t\t\tlet res = codeBlock.exec(functionOffset,args[0],ns.namespace,args,false,ns.pkg);\n\t\t\t\tthis.currentNamespace = saveNamespace;\n\t\t\t\treturn res;\n\t\t\t} else {\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t} else {\n\t\t\tlet x = _g;\n\t\t\tif(ns.minArgs > 0 && args.length < ns.minArgs || ns.maxArgs > 0 && args.length > ns.maxArgs) {\n\t\t\t\tLog.println(\"\" + ns.namespace.name + \"::\" + ns.functionName + \" - wrong number of arguments.\");\n\t\t\t\tLog.println(\"usage: \" + ns.usage);\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t\tswitch(x._hx_index) {\n\t\t\tcase 0:\n\t\t\t\tlet functionOffset = x.functionOffset;\n\t\t\t\tlet codeBlock = x.codeBlock;\n\t\t\t\treturn \"\";\n\t\t\tcase 1:\n\t\t\t\tlet callback = x.callback;\n\t\t\t\tlet saveNamespace = this.currentNamespace;\n\t\t\t\tthis.currentNamespace = ns.namespace;\n\t\t\t\tlet vargs = [];\n\t\t\t\tlet _g1 = 0;\n\t\t\t\twhile(_g1 < args.length) {\n\t\t\t\t\tlet arg = args[_g1];\n\t\t\t\t\t++_g1;\n\t\t\t\t\tlet v = new Variable(\"param\",this);\n\t\t\t\t\tv.setStringValue(arg);\n\t\t\t\t\tvargs.push(v);\n\t\t\t\t}\n\t\t\t\tlet res = callback(vargs);\n\t\t\t\tthis.currentNamespace = saveNamespace;\n\t\t\t\treturn res;\n\t\t\tcase 2:\n\t\t\t\tlet callback1 = x.callback;\n\t\t\t\tlet saveNamespace1 = this.currentNamespace;\n\t\t\t\tthis.currentNamespace = ns.namespace;\n\t\t\t\tlet res1 = \"\" + callback1(this,this.evalState.thisObject,args);\n\t\t\t\tthis.currentNamespace = saveNamespace1;\n\t\t\t\treturn res1;\n\t\t\tcase 3:\n\t\t\t\tlet callback2 = x.callback;\n\t\t\t\tlet saveNamespace2 = this.currentNamespace;\n\t\t\t\tthis.currentNamespace = ns.namespace;\n\t\t\t\tlet res2 = \"\" + callback2(this,this.evalState.thisObject,args);\n\t\t\t\tthis.currentNamespace = saveNamespace2;\n\t\t\t\treturn res2;\n\t\t\tcase 4:\n\t\t\t\tlet callback3 = x.callback;\n\t\t\t\tlet saveNamespace3 = this.currentNamespace;\n\t\t\t\tthis.currentNamespace = ns.namespace;\n\t\t\t\tlet res3 = callback3(this,this.evalState.thisObject,args);\n\t\t\t\tthis.currentNamespace = saveNamespace3;\n\t\t\t\treturn res3;\n\t\t\tcase 5:\n\t\t\t\tlet callback4 = x.callback;\n\t\t\t\tlet saveNamespace4 = this.currentNamespace;\n\t\t\t\tthis.currentNamespace = ns.namespace;\n\t\t\t\tcallback4(this,this.evalState.thisObject,args);\n\t\t\t\tthis.currentNamespace = saveNamespace4;\n\t\t\t\treturn \"\";\n\t\t\tcase 6:\n\t\t\t\tlet callback5 = x.callback;\n\t\t\t\tlet saveNamespace5 = this.currentNamespace;\n\t\t\t\tthis.currentNamespace = ns.namespace;\n\t\t\t\tlet res4 = \"\" + Std.string(callback5(this,this.evalState.thisObject,args));\n\t\t\t\tthis.currentNamespace = saveNamespace5;\n\t\t\t\treturn res4;\n\t\t\t}\n\t\t}\n\t}\n}\n$hx_exports[\"VM\"] = VM;\nVM.__name__ = true;\nObject.assign(VM.prototype, {\n\t__class__: VM\n});\nvar console_CFFunctionType = $hxEnums[\"console.CFFunctionType\"] = { __ename__:true,__constructs__:null\n\t,IntCallbackType: ($_=function(callback) { return {_hx_index:0,callback:callback,__enum__:\"console.CFFunctionType\",toString:$estr}; },$_._hx_name=\"IntCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,FloatCallbackType: ($_=function(callback) { return {_hx_index:1,callback:callback,__enum__:\"console.CFFunctionType\",toString:$estr}; },$_._hx_name=\"FloatCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,StringCallbackType: ($_=function(callback) { return {_hx_index:2,callback:callback,__enum__:\"console.CFFunctionType\",toString:$estr}; },$_._hx_name=\"StringCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,VoidCallbackType: ($_=function(callback) { return {_hx_index:3,callback:callback,__enum__:\"console.CFFunctionType\",toString:$estr}; },$_._hx_name=\"VoidCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,BoolCallbackType: ($_=function(callback) { return {_hx_index:4,callback:callback,__enum__:\"console.CFFunctionType\",toString:$estr}; },$_._hx_name=\"BoolCallbackType\",$_.__params__ = [\"callback\"],$_)\n};\nconsole_CFFunctionType.__constructs__ = [console_CFFunctionType.IntCallbackType,console_CFFunctionType.FloatCallbackType,console_CFFunctionType.StringCallbackType,console_CFFunctionType.VoidCallbackType,console_CFFunctionType.BoolCallbackType];\nclass console_ConsoleFunctionMacro {\n}\nconsole_ConsoleFunctionMacro.__name__ = true;\nclass console_ConsoleFunctions {\n\tstatic nameToId(vm,thisObj,args) {\n\t\tlet obj = vm.findObject(args[1]);\n\t\tif(obj != null) {\n\t\t\treturn obj.id;\n\t\t}\n\t\treturn -1;\n\t}\n\tstatic isObject(vm,thisObj,args) {\n\t\tif(args[1] == \"\" || args[1] == \"0\") {\n\t\t\treturn false;\n\t\t}\n\t\tlet obj = vm.findObject(args[1]);\n\t\tif(obj != null) {\n\t\t\treturn true;\n\t\t}\n\t\treturn false;\n\t}\n\tstatic cancelEvent(vm,thisObj,args) {\n\t\tvm.cancelEvent(Std.parseInt(args[1]));\n\t}\n\tstatic isEventPending(vm,thisObj,args) {\n\t\treturn vm.isEventPending(Std.parseInt(args[1]));\n\t}\n\tstatic schedule(vm,thisObj,args) {\n\t\tlet timeDelta = Std.parseInt(args[1]);\n\t\tlet obj = vm.findObject(args[2]);\n\t\tif(obj == null) {\n\t\t\tif(args[2] != \"0\") {\n\t\t\t\treturn 0;\n\t\t\t}\n\t\t}\n\t\treturn vm.schedule(timeDelta,obj,args.slice(3));\n\t}\n\tstatic getSimTime(vm,thisObj,args) {\n\t\treturn Date.now() - vm.startTime;\n\t}\n\tstatic getRealTime(vm,thisObj,args) {\n\t\treturn Date.now();\n\t}\n\tstatic strcmp(vm,thisObj,args) {\n\t\tlet a = args[1];\n\t\tlet b = args[2];\n\t\tif(a.length > b.length) {\n\t\t\treturn 1;\n\t\t} else if(a.length < b.length) {\n\t\t\treturn -1;\n\t\t} else {\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = a.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet c = _g++;\n\t\t\t\tif(HxOverrides.cca(a,c) > HxOverrides.cca(b,c)) {\n\t\t\t\t\treturn 1;\n\t\t\t\t} else if(HxOverrides.cca(a,c) < HxOverrides.cca(b,c)) {\n\t\t\t\t\treturn -1;\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn 0;\n\t\t}\n\t}\n\tstatic stricmp(vm,thisObj,args) {\n\t\tlet a = args[1].toUpperCase();\n\t\tlet b = args[2].toUpperCase();\n\t\tif(a.length > b.length) {\n\t\t\treturn 1;\n\t\t} else if(a.length < b.length) {\n\t\t\treturn -1;\n\t\t} else {\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = a.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet c = _g++;\n\t\t\t\tif(HxOverrides.cca(a,c) > HxOverrides.cca(b,c)) {\n\t\t\t\t\treturn 1;\n\t\t\t\t} else if(HxOverrides.cca(a,c) < HxOverrides.cca(b,c)) {\n\t\t\t\t\treturn -1;\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn 0;\n\t\t}\n\t}\n\tstatic strlen(vm,thisObj,args) {\n\t\treturn args[1].length;\n\t}\n\tstatic strstr(vm,thisObj,args) {\n\t\tlet a = args[1];\n\t\tlet b = args[2];\n\t\treturn a.indexOf(b);\n\t}\n\tstatic strpos(vm,thisObj,args) {\n\t\tlet a = args[1];\n\t\tlet b = args[2];\n\t\tlet c = args.length == 4 ? Std.parseInt(args[3]) : 0;\n\t\treturn a.indexOf(b,c);\n\t}\n\tstatic ltrim(vm,thisObj,args) {\n\t\treturn StringTools.ltrim(args[1]);\n\t}\n\tstatic rtrim(vm,thisObj,args) {\n\t\treturn StringTools.rtrim(args[1]);\n\t}\n\tstatic trim(vm,thisObj,args) {\n\t\treturn StringTools.trim(args[1]);\n\t}\n\tstatic stripChars(vm,thisObj,args) {\n\t\tlet str = args[1];\n\t\tlet _g = 0;\n\t\tlet _g1 = args[2].length;\n\t\twhile(_g < _g1) {\n\t\t\tlet c = _g++;\n\t\t\tstr = StringTools.replace(str,args[2].charAt(c),\"\");\n\t\t}\n\t\treturn str;\n\t}\n\tstatic strlwr(vm,thisObj,args) {\n\t\treturn args[1].toLowerCase();\n\t}\n\tstatic strupr(vm,thisObj,args) {\n\t\treturn args[1].toUpperCase();\n\t}\n\tstatic strchr(vm,thisObj,args) {\n\t\tlet index = args[1].indexOf(args[2]);\n\t\tif(index == -1) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn HxOverrides.substr(args[1],index,null);\n\t}\n\tstatic strreplace(vm,thisObj,args) {\n\t\treturn StringTools.replace(args[1],args[2],args[3]);\n\t}\n\tstatic getSubStr(vm,thisObj,args) {\n\t\tlet s = HxOverrides.substr(args[1],Std.parseInt(args[2]),Std.parseInt(args[3]));\n\t\tif(s != null) {\n\t\t\treturn s;\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tstatic getWord(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\" \");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks[index];\n\t}\n\tstatic getWords(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\" \");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tlet endIndex = args.length == 4 ? Std.parseInt(args[3]) : toks.length;\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\tif(endIndex >= toks.length || endIndex < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks.slice(index,endIndex).join(\" \");\n\t}\n\tstatic setWord(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\" \");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn args[1];\n\t\t}\n\t\ttoks[index] = args[3];\n\t\treturn toks.join(\" \");\n\t}\n\tstatic removeWord(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\" \");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn args[1];\n\t\t}\n\t\ttoks.splice(index,1);\n\t\treturn toks.join(\" \");\n\t}\n\tstatic getWordCount(vm,thisObj,args) {\n\t\treturn args[1].split(\" \").length;\n\t}\n\tstatic getField(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\t\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks[index];\n\t}\n\tstatic getFields(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\t\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tlet endIndex = args.length == 4 ? Std.parseInt(args[3]) : toks.length;\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\tif(endIndex >= toks.length || endIndex < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks.slice(index,endIndex).join(\"\\t\");\n\t}\n\tstatic setField(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\t\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn args[1];\n\t\t}\n\t\ttoks[index] = args[3];\n\t\treturn toks.join(\"\\t\");\n\t}\n\tstatic removeField(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\t\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn args[1];\n\t\t}\n\t\ttoks.splice(index,1);\n\t\treturn toks.join(\"\\t\");\n\t}\n\tstatic getFieldCount(vm,thisObj,args) {\n\t\treturn args[1].split(\"\\t\").length;\n\t}\n\tstatic getRecord(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\n\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks[index];\n\t}\n\tstatic getRecords(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\n\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tlet endIndex = args.length == 4 ? Std.parseInt(args[3]) : toks.length;\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\tif(endIndex >= toks.length || endIndex < 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks.slice(index,endIndex).join(\"\\n\");\n\t}\n\tstatic setRecord(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\n\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn args[1];\n\t\t}\n\t\ttoks[index] = args[3];\n\t\treturn toks.join(\"\\n\");\n\t}\n\tstatic removeRecord(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\"\\n\");\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index >= toks.length || index < 0) {\n\t\t\treturn args[1];\n\t\t}\n\t\ttoks.splice(index,1);\n\t\treturn toks.join(\"\\n\");\n\t}\n\tstatic getRecordCount(vm,thisObj,args) {\n\t\treturn args[1].split(\"\\n\").length;\n\t}\n\tstatic firstWord(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\" \");\n\t\tif(toks.length == 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks[0];\n\t}\n\tstatic restWords(vm,thisObj,args) {\n\t\tlet toks = args[1].split(\" \");\n\t\tif(toks.length == 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn toks.slice(1).join(\" \");\n\t}\n\tstatic nextToken(vm,thisObj,args) {\n\t\tlet toks = args[1].split(args[3]);\n\t\tif(toks.length == 0) {\n\t\t\treturn \"\";\n\t\t}\n\t\tlet rest = toks.slice(1).join(args[3]);\n\t\tif(vm.evalState.stack.length != 0) {\n\t\t\tlet v = new Variable(\"%\" + args[2],vm);\n\t\t\tv.setStringValue(toks[0]);\n\t\t\tvm.evalState.stackVars[vm.evalState.stackVars.length - 1].h[\"%\" + args[2]] = v;\n\t\t} else {\n\t\t\tlet v = new Variable(\"$\" + args[2],vm);\n\t\t\tv.setStringValue(toks[0]);\n\t\t\tvm.evalState.globalVars.h[\"$\" + args[2]] = v;\n\t\t}\n\t\treturn rest;\n\t}\n\tstatic detag(vm,thisObj,args) {\n\t\tlet ccode = HxOverrides.cca(args[1],0);\n\t\tif(ccode == null) {\n\t\t\treturn args[1];\n\t\t}\n\t\tif(ccode == 1) {\n\t\t\tlet findIdx = args[1].indexOf(\" \");\n\t\t\tif(findIdx == -1) {\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t\tlet word = HxOverrides.substr(args[1],findIdx,null);\n\t\t\treturn word;\n\t\t}\n\t\treturn args[1];\n\t}\n\tstatic getTag(vm,thisObj,args) {\n\t\tlet ccode = HxOverrides.cca(args[1],0);\n\t\tif(ccode == null) {\n\t\t\treturn \"\";\n\t\t}\n\t\tif(ccode == 1) {\n\t\t\tlet findIdx = args[1].indexOf(\" \");\n\t\t\tif(findIdx == -1) {\n\t\t\t\treturn HxOverrides.substr(args[1],1,null);\n\t\t\t}\n\t\t\tlet word = HxOverrides.substr(args[1],1,findIdx);\n\t\t\treturn word;\n\t\t}\n\t\treturn \"\";\n\t}\n\tstatic activatePackage(vm,thisObj,args) {\n\t\tvm.activatePackage(args[1]);\n\t}\n\tstatic deactivatePackage(vm,thisObj,args) {\n\t\tvm.deactivatePackage(args[1]);\n\t}\n\tstatic isPackage(vm,thisObj,args) {\n\t\tlet _g = 0;\n\t\tlet _g1 = vm.namespaces;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet nm = _g1[_g];\n\t\t\t++_g;\n\t\t\tif(nm.pkg == args[1]) {\n\t\t\t\treturn true;\n\t\t\t}\n\t\t}\n\t\treturn false;\n\t}\n\tstatic echo(vm,thisObj,args) {\n\t\tLog.println(args.slice(1).join(\"\"));\n\t}\n\tstatic warn(vm,thisObj,args) {\n\t\tLog.println(\"Warning: \" + args.slice(1).join(\"\"));\n\t}\n\tstatic error(vm,thisObj,args) {\n\t\tLog.println(\"Error: \" + args.slice(1).join(\"\"));\n\t}\n\tstatic expandEscape(vm,thisObj,args) {\n\t\treturn Scanner.escape(args[1]);\n\t}\n\tstatic collapseEscape(vm,thisObj,args) {\n\t\treturn Scanner.unescape(args[1]);\n\t}\n\tstatic eval(vm,thisObj,args) {\n\t\tlet compiler = new Compiler();\n\t\ttry {\n\t\t\tlet bytes = compiler.compile(args[1]);\n\t\t\tlet code = new CodeBlock(vm,null);\n\t\t\tcode.load(new haxe_io_BytesInput(bytes.getBytes()));\n\t\t\treturn code.exec(0,null,null,[],false,null);\n\t\t} catch( _g ) {\n\t\t\tLog.println(\"Syntax error in input\");\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tstatic eval_js(vm,thisObj,args) {\n\t\ttry {\n\t\t\tlet scanner = new Scanner(args[1]);\n\t\t\tlet parser = new Parser(scanner.scanTokens());\n\t\t\tlet stmts = parser.parse();\n\t\t\tlet jsgen = new JSGenerator(stmts);\n\t\t\tlet jsOut = jsgen.generate(false);\n\t\t\treturn \"\" + Std.string(eval(jsOut));\n\t\t} catch( _g ) {\n\t\t\tLog.println(\"Syntax error in input\");\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tstatic trace_function(vm,thisObj,args) {\n\t\tvm.traceOn = Std.parseInt(args[1]) > 0;\n\t\tLog.println(\"Console trace is \" + (vm.traceOn ? \"on\" : \"off\") + \".\");\n\t}\n\tstatic fileExt(vm,thisObj,args) {\n\t\treturn haxe_io_Path.extension(args[1]);\n\t}\n\tstatic fileBase(vm,thisObj,args) {\n\t\treturn haxe_io_Path.withoutExtension(haxe_io_Path.withoutDirectory(args[1]));\n\t}\n\tstatic fileName(vm,thisObj,args) {\n\t\treturn haxe_io_Path.withoutDirectory(args[1]);\n\t}\n\tstatic filePath(vm,thisObj,args) {\n\t\treturn haxe_io_Path.directory(args[1]);\n\t}\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t\tvmObj.addConsoleFunction(\"nameToId\",\"nameToID(object) - Returns the id of the object\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.nameToId(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"isObject\",\"isObject(object) - Returns whether the object exists or not\",2,2,console_FunctionType.BoolCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.isObject(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"cancelEvent\",\"cancel(eventId) - Cancels a scheduled event\",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_ConsoleFunctions.cancelEvent(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"isEventPending\",\"isEventPending(eventId) - Returns whether the given event is pending to be completed or not\",2,2,console_FunctionType.BoolCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.isEventPending(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"schedule\",\"schedule(time, refobject|0, command, <arg1...argN>) - Schedules a function or method \'command\' to be run after \'time\' milliseconds with optional arguments and returns the event id\",4,0,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.schedule(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getSimTime\",\"getSimTime() - Returns the milliseconds since the interpreter started\",1,1,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getSimTime(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getRealTime\",\"getRealTime() - Returns the milliseconds passed since unix epoch\",1,1,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getRealTime(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strcmp\",\"strcmp(string one, string two) - Compares two strings using case-sensitive comparison.\",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strcmp(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"stricmp\",\"stricmp(string one, string two) - Compares two strings using case-insensitive comparison.\",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.stricmp(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strlen\",\"strlen(string) - Get the length of the given string in bytes.\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strlen(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strstr\",\"strstr(string string, string substring) - Find the start of substring in the given string searching from left to right.\",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strstr(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strpos\",\"strpos(string hay, string needle, int offset) - Find the start of needle in haystack searching from left to right beginning at the given offset.\",3,4,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strpos(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"ltrim\",\"ltrim(string value) - Remove leading whitespace from the string.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.ltrim(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"rtrim\",\"rtrim(string value) - Remove trailing whitespace from the string.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.rtrim(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"trim\",\"trim(string value) - Remove leading and trailing whitespace from the string.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.trim(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"stripChars\",\"stripChars(string value, string chars) - Remove all occurrences of characters contained in chars from str.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.stripChars(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strlwr\",\"strlwr(string value) - Return an all lower-case version of the given string.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strlwr(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strupr\",\"strupr(string value) - Return an all upper-case version of the given string.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strupr(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strchr\",\"strchr(string value, string char) - Find the first occurrence of the given character in str.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strchr(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"strreplace\",\"strreplace(string source, string from, string to) - Replace all occurrences of from in source with to.\",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.strreplace(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getSubStr\",\"getSubStr(string str, int start, int numChars) - Return a substring of str starting at start and continuing either through to the end of str (if numChars is -1) or for numChars characters (except if this would exceed the actual source string length)\",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getSubStr(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getWord\",\"getWord(string str, int index) - Extract the word at the given index in the whitespace-separated list in text.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getWord(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getWords\",\"getWords(string str, int index, int endIndex = INF) = Extract a range of words from the given startIndex onwards thru endIndex.\",3,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getWords(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"setWord\",\"setWord(text, index, replacement) - Replace the word in text at the given index with replacement.\",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.setWord(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"removeWord\",\"removeWord(text, index) - Remove the word in text at the given index.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.removeWord(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getWordCount\",\"getWordCount(string str) - Return the number of whitespace-separated words in text.\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getWordCount(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getField\",\"getField(string str, int index) - Extract the field at the given index in the tab separated list in text.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getField(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getFields\",\"getFields(string str, int index, int endIndex = INF) - Extract a range of fields from the given startIndex onwards thru endIndex.\",3,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getFields(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"setField\",\"setField(text, index, replacement) - Replace the field in text at the given index with replacement.\",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.setField(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"removeField\",\"removeField(text, index) - Remove the field in text at the given index.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.removeField(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getFieldCount\",\"getFieldCount(string str) - Return the number of tab separated fields in text.\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getFieldCount(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getRecord\",\"getRecord(string str, int index) - Extract the record at the given index in the newline-separated list in text.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getRecord(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getRecords\",\"getRecords(string str, int index, int endIndex = INF) - Extract a range of records from the given startIndex onwards thru endIndex.\",3,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getRecords(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"setRecord\",\"setRecord(text, index, replacement) - Replace the record in text at the given index with replacement.\",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.setRecord(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"removeRecord\",\"removeRecord(text, index) - Remove the record in text at the given index.\",3,3,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.removeRecord(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getRecordCount\",\"getRecordCount(string str) - Return the number of newline-separated records in text.\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getRecordCount(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"firstWord\",\"firstWord(string str) - Return the first word in text.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.firstWord(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"restWords\",\"restWords(string str) - Return all but the first word in text.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.restWords(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"nextToken\",\"nextToken(str, token, delim) - Tokenize a string using a set of delimiting characters.\",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.nextToken(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"detag\",\"detag(textTagString) - Detag a given tagged string\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.detag(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"getTag\",\"getTag(textTagString) - Get the tag of a tagged string\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.getTag(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"activatePackage\",\"activatePackage(package) - Activates an existing package.\",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_ConsoleFunctions.activatePackage(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"deactivatePackage\",\"deactivatePackage(package - Deactivates a previously activated package.\",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_ConsoleFunctions.deactivatePackage(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"isPackage\",\"isPackage(package) - Returns true if the package is the name of a declared package.\",2,2,console_FunctionType.BoolCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.isPackage(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"echo\",\"echo(value, ...) - Logs a message to the console.\",2,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_ConsoleFunctions.echo(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"warn\",\"warn(value, ...) - Logs a warning message to the console.\",2,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_ConsoleFunctions.warn(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"error\",\"error(value, ...) - Logs an error message to the console.\",2,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_ConsoleFunctions.error(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"expandEscape\",\"expandEscape(text) - Replace all characters in text that need to be escaped for the string to be a valid string literal with their respective escape sequences.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.expandEscape(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"collapseEscape\",\"collapseEscape(text) - Replace all escape sequences in text with their respective character codes.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.collapseEscape(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"eval\",\"eval(consoleString) - Evaluates the given string\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.eval(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"eval_js\",\"eval_js(consoleString)\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.eval_js(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"trace\",\"trace(bool) - Enable or disable tracing in the script code VM.\",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_ConsoleFunctions.trace_function(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"fileExt\",\"fileExt(fileName) - Get the extension of a file.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.fileExt(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"fileBase\",\"fileBase(fileName) - Get the base of a file name (removes extension).\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.fileBase(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"fileName\",\"fileName(fileName)- Get the file name of a file (removes extension and path).\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.fileName(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"filePath\",\"filePath(fileName) - Get the path of a file (removes name and extension).\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_ConsoleFunctions.filePath(vm,s,arr);\n\t\t}));\n\t}\n\tstatic gatherDocs() {\n\t\tlet docList = [];\n\t\tdocList.push({ funcname : \"nameToId\", funcusage : \"nameToID(object) - Returns the id of the object\"});\n\t\tdocList.push({ funcname : \"isObject\", funcusage : \"isObject(object) - Returns whether the object exists or not\"});\n\t\tdocList.push({ funcname : \"cancelEvent\", funcusage : \"cancel(eventId) - Cancels a scheduled event\"});\n\t\tdocList.push({ funcname : \"isEventPending\", funcusage : \"isEventPending(eventId) - Returns whether the given event is pending to be completed or not\"});\n\t\tdocList.push({ funcname : \"schedule\", funcusage : \"schedule(time, refobject|0, command, <arg1...argN>) - Schedules a function or method \'command\' to be run after \'time\' milliseconds with optional arguments and returns the event id\"});\n\t\tdocList.push({ funcname : \"getSimTime\", funcusage : \"getSimTime() - Returns the milliseconds since the interpreter started\"});\n\t\tdocList.push({ funcname : \"getRealTime\", funcusage : \"getRealTime() - Returns the milliseconds passed since unix epoch\"});\n\t\tdocList.push({ funcname : \"strcmp\", funcusage : \"strcmp(string one, string two) - Compares two strings using case-sensitive comparison.\"});\n\t\tdocList.push({ funcname : \"stricmp\", funcusage : \"stricmp(string one, string two) - Compares two strings using case-insensitive comparison.\"});\n\t\tdocList.push({ funcname : \"strlen\", funcusage : \"strlen(string) - Get the length of the given string in bytes.\"});\n\t\tdocList.push({ funcname : \"strstr\", funcusage : \"strstr(string string, string substring) - Find the start of substring in the given string searching from left to right.\"});\n\t\tdocList.push({ funcname : \"strpos\", funcusage : \"strpos(string hay, string needle, int offset) - Find the start of needle in haystack searching from left to right beginning at the given offset.\"});\n\t\tdocList.push({ funcname : \"ltrim\", funcusage : \"ltrim(string value) - Remove leading whitespace from the string.\"});\n\t\tdocList.push({ funcname : \"rtrim\", funcusage : \"rtrim(string value) - Remove trailing whitespace from the string.\"});\n\t\tdocList.push({ funcname : \"trim\", funcusage : \"trim(string value) - Remove leading and trailing whitespace from the string.\"});\n\t\tdocList.push({ funcname : \"stripChars\", funcusage : \"stripChars(string value, string chars) - Remove all occurrences of characters contained in chars from str.\"});\n\t\tdocList.push({ funcname : \"strlwr\", funcusage : \"strlwr(string value) - Return an all lower-case version of the given string.\"});\n\t\tdocList.push({ funcname : \"strupr\", funcusage : \"strupr(string value) - Return an all upper-case version of the given string.\"});\n\t\tdocList.push({ funcname : \"strchr\", funcusage : \"strchr(string value, string char) - Find the first occurrence of the given character in str.\"});\n\t\tdocList.push({ funcname : \"strreplace\", funcusage : \"strreplace(string source, string from, string to) - Replace all occurrences of from in source with to.\"});\n\t\tdocList.push({ funcname : \"getSubStr\", funcusage : \"getSubStr(string str, int start, int numChars) - Return a substring of str starting at start and continuing either through to the end of str (if numChars is -1) or for numChars characters (except if this would exceed the actual source string length)\"});\n\t\tdocList.push({ funcname : \"getWord\", funcusage : \"getWord(string str, int index) - Extract the word at the given index in the whitespace-separated list in text.\"});\n\t\tdocList.push({ funcname : \"getWords\", funcusage : \"getWords(string str, int index, int endIndex = INF) = Extract a range of words from the given startIndex onwards thru endIndex.\"});\n\t\tdocList.push({ funcname : \"setWord\", funcusage : \"setWord(text, index, replacement) - Replace the word in text at the given index with replacement.\"});\n\t\tdocList.push({ funcname : \"removeWord\", funcusage : \"removeWord(text, index) - Remove the word in text at the given index.\"});\n\t\tdocList.push({ funcname : \"getWordCount\", funcusage : \"getWordCount(string str) - Return the number of whitespace-separated words in text.\"});\n\t\tdocList.push({ funcname : \"getField\", funcusage : \"getField(string str, int index) - Extract the field at the given index in the tab separated list in text.\"});\n\t\tdocList.push({ funcname : \"getFields\", funcusage : \"getFields(string str, int index, int endIndex = INF) - Extract a range of fields from the given startIndex onwards thru endIndex.\"});\n\t\tdocList.push({ funcname : \"setField\", funcusage : \"setField(text, index, replacement) - Replace the field in text at the given index with replacement.\"});\n\t\tdocList.push({ funcname : \"removeField\", funcusage : \"removeField(text, index) - Remove the field in text at the given index.\"});\n\t\tdocList.push({ funcname : \"getFieldCount\", funcusage : \"getFieldCount(string str) - Return the number of tab separated fields in text.\"});\n\t\tdocList.push({ funcname : \"getRecord\", funcusage : \"getRecord(string str, int index) - Extract the record at the given index in the newline-separated list in text.\"});\n\t\tdocList.push({ funcname : \"getRecords\", funcusage : \"getRecords(string str, int index, int endIndex = INF) - Extract a range of records from the given startIndex onwards thru endIndex.\"});\n\t\tdocList.push({ funcname : \"setRecord\", funcusage : \"setRecord(text, index, replacement) - Replace the record in text at the given index with replacement.\"});\n\t\tdocList.push({ funcname : \"removeRecord\", funcusage : \"removeRecord(text, index) - Remove the record in text at the given index.\"});\n\t\tdocList.push({ funcname : \"getRecordCount\", funcusage : \"getRecordCount(string str) - Return the number of newline-separated records in text.\"});\n\t\tdocList.push({ funcname : \"firstWord\", funcusage : \"firstWord(string str) - Return the first word in text.\"});\n\t\tdocList.push({ funcname : \"restWords\", funcusage : \"restWords(string str) - Return all but the first word in text.\"});\n\t\tdocList.push({ funcname : \"nextToken\", funcusage : \"nextToken(str, token, delim) - Tokenize a string using a set of delimiting characters.\"});\n\t\tdocList.push({ funcname : \"detag\", funcusage : \"detag(textTagString) - Detag a given tagged string\"});\n\t\tdocList.push({ funcname : \"getTag\", funcusage : \"getTag(textTagString) - Get the tag of a tagged string\"});\n\t\tdocList.push({ funcname : \"activatePackage\", funcusage : \"activatePackage(package) - Activates an existing package.\"});\n\t\tdocList.push({ funcname : \"deactivatePackage\", funcusage : \"deactivatePackage(package - Deactivates a previously activated package.\"});\n\t\tdocList.push({ funcname : \"isPackage\", funcusage : \"isPackage(package) - Returns true if the package is the name of a declared package.\"});\n\t\tdocList.push({ funcname : \"echo\", funcusage : \"echo(value, ...) - Logs a message to the console.\"});\n\t\tdocList.push({ funcname : \"warn\", funcusage : \"warn(value, ...) - Logs a warning message to the console.\"});\n\t\tdocList.push({ funcname : \"error\", funcusage : \"error(value, ...) - Logs an error message to the console.\"});\n\t\tdocList.push({ funcname : \"expandEscape\", funcusage : \"expandEscape(text) - Replace all characters in text that need to be escaped for the string to be a valid string literal with their respective escape sequences.\"});\n\t\tdocList.push({ funcname : \"collapseEscape\", funcusage : \"collapseEscape(text) - Replace all escape sequences in text with their respective character codes.\"});\n\t\tdocList.push({ funcname : \"eval\", funcusage : \"eval(consoleString) - Evaluates the given string\"});\n\t\tdocList.push({ funcname : \"eval_js\", funcusage : \"eval_js(consoleString)\"});\n\t\tdocList.push({ funcname : \"trace\", funcusage : \"trace(bool) - Enable or disable tracing in the script code VM.\"});\n\t\tdocList.push({ funcname : \"fileExt\", funcusage : \"fileExt(fileName) - Get the extension of a file.\"});\n\t\tdocList.push({ funcname : \"fileBase\", funcusage : \"fileBase(fileName) - Get the base of a file name (removes extension).\"});\n\t\tdocList.push({ funcname : \"fileName\", funcusage : \"fileName(fileName)- Get the file name of a file (removes extension and path).\"});\n\t\tdocList.push({ funcname : \"filePath\", funcusage : \"filePath(fileName) - Get the path of a file (removes name and extension).\"});\n\t\treturn docList;\n\t}\n}\nconsole_ConsoleFunctions.__name__ = true;\nclass console_ConsoleObject {\n\tconstructor() {\n\t\tif(console_ConsoleObject._hx_skip_constructor) {\n\t\t\treturn;\n\t\t}\n\t\tthis._hx_constructor();\n\t}\n\t_hx_constructor() {\n\t\tthis.fields = new haxe_ds_StringMap();\n\t\tthis.className = \"ConsoleObject\";\n\t\tthis.assignClassName();\n\t}\n\tregister(vm) {\n\t\tthis.vm = vm;\n\t}\n\tgetDataField(field,arrayIdx) {\n\t\tif(arrayIdx != null) {\n\t\t\tif(Object.prototype.hasOwnProperty.call(this.fields.h,field + arrayIdx)) {\n\t\t\t\treturn this.fields.h[field + arrayIdx];\n\t\t\t} else {\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t} else if(Object.prototype.hasOwnProperty.call(this.fields.h,field)) {\n\t\t\treturn this.fields.h[field];\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n\t}\n\tassignClassName() {\n\t\tthis.className = \"ConsoleObject\";\n\t}\n\tsetDataField(field,arrayIdx,value) {\n\t\tif(arrayIdx != null) {\n\t\t\tthis.fields.h[field + arrayIdx] = value;\n\t\t} else {\n\t\t\tthis.fields.h[field] = value;\n\t\t}\n\t}\n\tgetClassName() {\n\t\treturn this.className;\n\t}\n}\nconsole_ConsoleObject.__name__ = true;\nObject.assign(console_ConsoleObject.prototype, {\n\t__class__: console_ConsoleObject\n});\nclass console_ConsoleObjectConstructorMacro {\n}\nconsole_ConsoleObjectConstructorMacro.__name__ = true;\nclass console_SimObject extends console_ConsoleObject {\n\t_hx_constructor() {\n\t\tsuper._hx_constructor();\n\t}\n\tfindObject(name) {\n\t\treturn null;\n\t}\n\tgetName() {\n\t\tif(this.name != null) {\n\t\t\treturn this.name;\n\t\t} else {\n\t\t\treturn \"\" + this.id;\n\t\t}\n\t}\n\tdeleteObject() {\n\t\tif(this.vm != null) {\n\t\t\tthis.vm.idMap.remove(this.id);\n\t\t\tif(Object.prototype.hasOwnProperty.call(this.vm.simObjects.h,this.name)) {\n\t\t\t\tif(this.vm.simObjects.h[this.name] == this) {\n\t\t\t\t\tlet key = this.name;\n\t\t\t\t\tlet _this = this.vm.simObjects;\n\t\t\t\t\tif(Object.prototype.hasOwnProperty.call(_this.h,key)) {\n\t\t\t\t\t\tdelete(_this.h[key]);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\tassignId(id) {\n\t\tthis.id = id;\n\t}\n\tassignFieldsFrom(obj) {\n\t\tlet h = obj.fields.h;\n\t\tlet field_h = h;\n\t\tlet field_keys = Object.keys(h);\n\t\tlet field_length = field_keys.length;\n\t\tlet field_current = 0;\n\t\twhile(field_current < field_length) {\n\t\t\tlet field = field_h[field_keys[field_current++]];\n\t\t\tlet v = obj.fields.h[field];\n\t\t\tthis.fields.h[field] = v;\n\t\t}\n\t}\n\tprocessArguments(args) {\n\t\treturn true;\n\t}\n\tgetClassName() {\n\t\treturn \"SimObject\";\n\t}\n\tassignClassName() {\n\t\tthis.className = \"SimObject\";\n\t}\n\tstatic setName(vm,thisObj,args) {\n\t\tthisObj.name = args[2];\n\t}\n\tstatic getName_method(vm,thisObj,args) {\n\t\treturn thisObj.getName();\n\t}\n\tstatic getClassName_method(vm,thisObj,args) {\n\t\treturn thisObj.getClassName();\n\t}\n\tstatic getId(vm,thisObj,args) {\n\t\treturn thisObj.id;\n\t}\n\tstatic getGroup(vm,thisObj,args) {\n\t\tif(thisObj.group != null) {\n\t\t\treturn thisObj.group.id;\n\t\t} else {\n\t\t\treturn -1;\n\t\t}\n\t}\n\tstatic delete(vm,thisObj,args) {\n\t\tthisObj.deleteObject();\n\t}\n\tstatic schedule(vm,thisObj,args) {\n\t\tlet timeDelta = Std.parseInt(args[2]);\n\t\treturn vm.schedule(timeDelta,thisObj,args.slice(3));\n\t}\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t\tvmObj.addConsoleMethod(\"SimObject\",\"setName\",\"obj.setName(newName) - Set the global name of the object.\",3,3,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimObject.setName(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimObject\",\"getName\",\"obj.getName() - Get the global name of the object.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimObject.getName_method(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimObject\",\"getClassName\",\"obj.getClassName() - Get the name of the engine class which the object is an instance of.\",2,2,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimObject.getClassName_method(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimObject\",\"getId\",\"obj.getId() - Get the underlying unique numeric ID of the object.\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimObject.getId(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimObject\",\"getGroup\",\"obj.getGroup() - Get the group that this object is contained in.\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimObject.getGroup(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimObject\",\"delete\",\"obj.delete() - Delete and remove the object.\",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimObject.delete(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimObject\",\"schedule\",\"object.schedule(time, command, <arg1...argN>) - Delay an invocation of a method.\",4,0,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimObject.schedule(vm,s,arr);\n\t\t}));\n\t}\n\tstatic gatherDocs() {\n\t\tlet docList = [];\n\t\tdocList.push({ funcname : \"setName\", funcusage : \"obj.setName(newName) - Set the global name of the object.\"});\n\t\tdocList.push({ funcname : \"getName\", funcusage : \"obj.getName() - Get the global name of the object.\"});\n\t\tdocList.push({ funcname : \"getClassName\", funcusage : \"obj.getClassName() - Get the name of the engine class which the object is an instance of.\"});\n\t\tdocList.push({ funcname : \"getId\", funcusage : \"obj.getId() - Get the underlying unique numeric ID of the object.\"});\n\t\tdocList.push({ funcname : \"getGroup\", funcusage : \"obj.getGroup() - Get the group that this object is contained in.\"});\n\t\tdocList.push({ funcname : \"delete\", funcusage : \"obj.delete() - Delete and remove the object.\"});\n\t\tdocList.push({ funcname : \"schedule\", funcusage : \"object.schedule(time, command, <arg1...argN>) - Delay an invocation of a method.\"});\n\t\treturn { classname : \"SimObject\", doesextends : true, extendsclass : \"ConsoleObject\", classfuncs : docList};\n\t}\n}\nconsole_SimObject.__name__ = true;\nconsole_SimObject.__super__ = console_ConsoleObject;\nObject.assign(console_SimObject.prototype, {\n\t__class__: console_SimObject\n});\nclass console_ScriptObject extends console_SimObject {\n\tconstructor() {\n\t\tconsole_ConsoleObject._hx_skip_constructor = true;\n\t\tsuper();\n\t\tconsole_ConsoleObject._hx_skip_constructor = false;\n\t\tthis._hx_constructor();\n\t}\n\t_hx_constructor() {\n\t\tthis.scriptSuperClassName = null;\n\t\tthis.scriptClassName = \"ScriptObject\";\n\t\tsuper._hx_constructor();\n\t}\n\tregister(vm) {\n\t\tif(this.scriptClassName != \"ScriptObject\") {\n\t\t\tlet parentNamespace = this.scriptSuperClassName == null ? \"ScriptObject\" : this.scriptSuperClassName;\n\t\t\tif(this.scriptSuperClassName != null) {\n\t\t\t\tvm.linkNamespaces(\"ScriptObject\",parentNamespace);\n\t\t\t}\n\t\t\tvm.linkNamespaces(parentNamespace,this.scriptClassName);\n\t\t}\n\t\tsuper.register(vm);\n\t}\n\tgetClassName() {\n\t\treturn this.scriptClassName;\n\t}\n\tassignClassName() {\n\t\treturn;\n\t}\n\tsetDataField(field,arrayIdx,value) {\n\t\tif(field.toLowerCase() == \"class\") {\n\t\t\tthis.scriptClassName = value;\n\t\t} else if(field.toLowerCase() == \"superclass\") {\n\t\t\tthis.scriptSuperClassName = value;\n\t\t} else {\n\t\t\tsuper.setDataField(field,arrayIdx,value);\n\t\t}\n\t}\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t}\n\tstatic gatherDocs() {\n\t\tlet docList = [];\n\t\treturn { classname : \"ScriptObject\", doesextends : true, extendsclass : \"SimObject\", classfuncs : docList};\n\t}\n}\nconsole_ScriptObject.__name__ = true;\nconsole_ScriptObject.__super__ = console_SimObject;\nObject.assign(console_ScriptObject.prototype, {\n\t__class__: console_ScriptObject\n});\nclass console_SimDataBlock extends console_SimObject {\n\tconstructor() {\n\t\tsuper();\n\t}\n\tpreload() {\n\t\treturn true;\n\t}\n\tgetClassName() {\n\t\treturn this.className;\n\t}\n\tassignClassName() {\n\t\treturn;\n\t}\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t}\n\tstatic gatherDocs() {\n\t\tlet docList = [];\n\t\treturn { classname : \"SimDataBlock\", doesextends : true, extendsclass : \"SimObject\", classfuncs : docList};\n\t}\n}\nconsole_SimDataBlock.__name__ = true;\nconsole_SimDataBlock.__super__ = console_SimObject;\nObject.assign(console_SimDataBlock.prototype, {\n\t__class__: console_SimDataBlock\n});\nclass console_SimSet extends console_SimObject {\n\tconstructor() {\n\t\tconsole_ConsoleObject._hx_skip_constructor = true;\n\t\tsuper();\n\t\tconsole_ConsoleObject._hx_skip_constructor = false;\n\t\tthis._hx_constructor();\n\t}\n\t_hx_constructor() {\n\t\tthis.objectList = [];\n\t\tsuper._hx_constructor();\n\t}\n\taddObject(obj) {\n\t\tif(!this.objectList.includes(obj)) {\n\t\t\tthis.objectList.push(obj);\n\t\t}\n\t}\n\tremoveObject(obj) {\n\t\tHxOverrides.remove(this.objectList,obj);\n\t}\n\tgetClassName() {\n\t\treturn \"SimSet\";\n\t}\n\tassignClassName() {\n\t\tthis.className = \"SimSet\";\n\t}\n\tstatic listObjects(vm,thisObj,args) {\n\t\tlet _g = 0;\n\t\tlet _g1 = thisObj.objectList;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet obj = _g1[_g];\n\t\t\t++_g;\n\t\t\tlet isSet = (((obj) instanceof console_SimSet) ? obj : null) != null;\n\t\t\tlet name = obj.name;\n\t\t\tif(name != null) {\n\t\t\t\tLog.println(\"\\t\" + obj.id + \",\\\"\" + name + \"\\\": \" + obj.getClassName() + \" \" + (isSet ? \"(g)\" : \"\"));\n\t\t\t} else {\n\t\t\t\tLog.println(\"\\t\" + obj.id + \": \" + obj.getClassName() + \" \" + (isSet ? \"(g)\" : \"\"));\n\t\t\t}\n\t\t}\n\t}\n\tstatic add(vm,thisObj,args) {\n\t\tlet _g = 2;\n\t\tlet _g1 = args.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet addObj = thisObj.vm.findObject(args[i]);\n\t\t\tif(addObj != null) {\n\t\t\t\tthisObj.addObject(addObj);\n\t\t\t} else {\n\t\t\t\tLog.println(\"Set::add: Object \" + args[i] + \" does not exist.\");\n\t\t\t}\n\t\t}\n\t}\n\tstatic remove(vm,thisObj,args) {\n\t\tlet _g = 2;\n\t\tlet _g1 = args.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet addObj = thisObj.vm.findObject(args[i]);\n\t\t\tif(addObj != null) {\n\t\t\t\tthisObj.removeObject(addObj);\n\t\t\t} else {\n\t\t\t\tLog.println(\"Set::remove: Object \" + args[i] + \" does not exist.\");\n\t\t\t}\n\t\t}\n\t}\n\tstatic clear(vm,thisObj,args) {\n\t\tlet _g = 0;\n\t\tlet _g1 = thisObj.objectList;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet obj = _g1[_g];\n\t\t\t++_g;\n\t\t\tthisObj.removeObject(obj);\n\t\t}\n\t}\n\tstatic getCount(vm,thisObj,args) {\n\t\treturn thisObj.objectList.length;\n\t}\n\tstatic getObject(vm,thisObj,args) {\n\t\tlet index = Std.parseInt(args[2]);\n\t\tif(index < 0 || index >= thisObj.objectList.length) {\n\t\t\tLog.println(\"Set::getObject: index out of range.\");\n\t\t\treturn -1;\n\t\t}\n\t\treturn thisObj.objectList[index].id;\n\t}\n\tstatic isMember(vm,thisObj,args) {\n\t\tlet findObj = thisObj.vm.findObject(args[2]);\n\t\tif(findObj == null) {\n\t\t\tLog.println(\"Set::isMember: \" + args[2] + \" is not an object.\");\n\t\t\treturn false;\n\t\t}\n\t\treturn thisObj.objectList.includes(findObj);\n\t}\n\tstatic bringToFront(vm,thisObj,args) {\n\t\tlet findObj = thisObj.vm.findObject(args[2]);\n\t\tif(findObj == null) {\n\t\t\treturn;\n\t\t}\n\t\tHxOverrides.remove(thisObj.objectList,findObj);\n\t\tthisObj.objectList.splice(0,0,findObj);\n\t}\n\tstatic pushToBack(vm,thisObj,args) {\n\t\tlet findObj = thisObj.vm.findObject(args[2]);\n\t\tif(findObj == null) {\n\t\t\treturn;\n\t\t}\n\t\tHxOverrides.remove(thisObj.objectList,findObj);\n\t\tthisObj.objectList.push(findObj);\n\t}\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"listObjects\",\"set.listObjects() - Dump a list of all objects contained in the set to the console.\",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimSet.listObjects(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"add\",\"set.add(obj1,...) - Add the given objects to the set.\",3,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimSet.add(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"remove\",\"set.remove(obj1,...) - Remove the given objects from the set.\",3,0,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimSet.remove(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"clear\",\"set.clear() - Remove all objects from the set.\",2,2,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimSet.clear(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"getCount\",\"set.getCount() - Get the number of objects contained in the set.\",2,2,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimSet.getCount(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"getObject\",\"set.getObject(objIndex) - Get the object at the given index.\",3,3,console_FunctionType.IntCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimSet.getObject(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"isMember\",\"set.isMember(object) - Test whether the given object belongs to the set.\",3,3,console_FunctionType.BoolCallbackType(function(vm,s,arr) {\n\t\t\treturn console_SimSet.isMember(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"bringToFront\",\"set.bringToFront(object)\",3,3,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimSet.bringToFront(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleMethod(\"SimSet\",\"pushToBack\",\"set.pushToBack(object) - Make the given object the last object in the set.\",3,3,console_FunctionType.VoidCallbackType(function(vm,s,arr) {\n\t\t\tconsole_SimSet.pushToBack(vm,s,arr);\n\t\t}));\n\t}\n\tstatic gatherDocs() {\n\t\tlet docList = [];\n\t\tdocList.push({ funcname : \"listObjects\", funcusage : \"set.listObjects() - Dump a list of all objects contained in the set to the console.\"});\n\t\tdocList.push({ funcname : \"add\", funcusage : \"set.add(obj1,...) - Add the given objects to the set.\"});\n\t\tdocList.push({ funcname : \"remove\", funcusage : \"set.remove(obj1,...) - Remove the given objects from the set.\"});\n\t\tdocList.push({ funcname : \"clear\", funcusage : \"set.clear() - Remove all objects from the set.\"});\n\t\tdocList.push({ funcname : \"getCount\", funcusage : \"set.getCount() - Get the number of objects contained in the set.\"});\n\t\tdocList.push({ funcname : \"getObject\", funcusage : \"set.getObject(objIndex) - Get the object at the given index.\"});\n\t\tdocList.push({ funcname : \"isMember\", funcusage : \"set.isMember(object) - Test whether the given object belongs to the set.\"});\n\t\tdocList.push({ funcname : \"bringToFront\", funcusage : \"set.bringToFront(object)\"});\n\t\tdocList.push({ funcname : \"pushToBack\", funcusage : \"set.pushToBack(object) - Make the given object the last object in the set.\"});\n\t\treturn { classname : \"SimSet\", doesextends : true, extendsclass : \"SimObject\", classfuncs : docList};\n\t}\n}\nconsole_SimSet.__name__ = true;\nconsole_SimSet.__super__ = console_SimObject;\nObject.assign(console_SimSet.prototype, {\n\t__class__: console_SimSet\n});\nclass console_SimGroup extends console_SimSet {\n\tconstructor() {\n\t\tsuper();\n\t}\n\taddObject(obj) {\n\t\tif(obj.group != this) {\n\t\t\tif(obj.group != null) {\n\t\t\t\tobj.group.removeObject(obj);\n\t\t\t}\n\t\t\tobj.group = this;\n\t\t\tsuper.addObject(obj);\n\t\t}\n\t}\n\tremoveObject(obj) {\n\t\tif(obj.group == this) {\n\t\t\tobj.group = null;\n\t\t\tsuper.removeObject(obj);\n\t\t}\n\t}\n\tgetClassName() {\n\t\treturn \"SimGroup\";\n\t}\n\tassignClassName() {\n\t\tthis.className = \"SimGroup\";\n\t}\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t}\n\tstatic gatherDocs() {\n\t\tlet docList = [];\n\t\treturn { classname : \"SimGroup\", doesextends : true, extendsclass : \"SimSet\", classfuncs : docList};\n\t}\n}\nconsole_SimGroup.__name__ = true;\nconsole_SimGroup.__super__ = console_SimSet;\nObject.assign(console_SimGroup.prototype, {\n\t__class__: console_SimGroup\n});\nclass console_ConsoleObjectConstructors {\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t\tconsole_SimObject.install(vmObj);\n\t\tconsole_ScriptObject.install(vmObj);\n\t\tconsole_SimDataBlock.install(vmObj);\n\t\tconsole_SimSet.install(vmObj);\n\t\tconsole_SimGroup.install(vmObj);\n\t\tvmObj.linkNamespaces(\"SimObject\",\"ScriptObject\");\n\t\tvmObj.linkNamespaces(\"SimObject\",\"SimDataBlock\");\n\t\tvmObj.linkNamespaces(\"SimObject\",\"SimSet\");\n\t\tvmObj.linkNamespaces(\"SimSet\",\"SimGroup\");\n\t}\n\tstatic gatherDocs() {\n\t\tlet doclist = [];\n\t\tdoclist.push(console_SimObject.gatherDocs());\n\t\tdoclist.push(console_ScriptObject.gatherDocs());\n\t\tdoclist.push(console_SimDataBlock.gatherDocs());\n\t\tdoclist.push(console_SimSet.gatherDocs());\n\t\tdoclist.push(console_SimGroup.gatherDocs());\n\t\treturn doclist;\n\t}\n}\nconsole_ConsoleObjectConstructors.__name__ = true;\nclass console_ConsoleObjectMacro {\n}\nconsole_ConsoleObjectMacro.__name__ = true;\nclass console_MathFunctions {\n\tstatic solveLinear(a,b) {\n\t\tif(a == 0) {\n\t\t\treturn { roots : []};\n\t\t}\n\t\treturn { roots : [-b / a]};\n\t}\n\tstatic solveQuadratic(a,b,c) {\n\t\tif(a == 0) {\n\t\t\treturn console_MathFunctions.solveLinear(b,c);\n\t\t}\n\t\tlet discriminant = b * b - 4 * a * c;\n\t\tif(discriminant < 0) {\n\t\t\treturn { roots : []};\n\t\t} else if(discriminant == 0) {\n\t\t\treturn { roots : [-b / (2 * a)]};\n\t\t} else {\n\t\t\tlet sqrtDiscriminant = Math.sqrt(discriminant);\n\t\t\tlet den = 2 * a;\n\t\t\treturn { roots : [(-b + sqrtDiscriminant) / den,(-b - sqrtDiscriminant) / den]};\n\t\t}\n\t}\n\tstatic solveCubic(a,b,c,d) {\n\t\tif(a == 0) {\n\t\t\treturn console_MathFunctions.solveQuadratic(b,c,d);\n\t\t}\n\t\tlet A = b / a;\n\t\tlet B = c / a;\n\t\tlet C = d / a;\n\t\tlet A2 = A * A;\n\t\tlet A3 = A2 * A;\n\t\tlet p = 0.33333333333333331 * (-0.33333333333333331 * A2 + B);\n\t\tlet q = 0.5 * (0.07407407407407407 * A3 - 0.33333333333333331 * A * B + C);\n\t\tlet p3 = p * p * p;\n\t\tlet q2 = q * q;\n\t\tlet D = q2 + p3;\n\t\tlet num = 0;\n\t\tlet roots = [];\n\t\tif(D == 0) {\n\t\t\tif(q == 0) {\n\t\t\t\troots.push(0);\n\t\t\t\tnum = 1;\n\t\t\t} else {\n\t\t\t\tlet u = Math.pow(-q,0.33333333333333331);\n\t\t\t\troots.push(2 * u);\n\t\t\t\troots.push(-u);\n\t\t\t\tnum = 2;\n\t\t\t}\n\t\t} else if(D < 0) {\n\t\t\tlet phi = 0.33333333333333331 * Math.acos(-q / Math.sqrt(-p3));\n\t\t\tlet t = 2 * Math.sqrt(-p);\n\t\t\troots.push(t * Math.cos(phi));\n\t\t\troots.push(-t * Math.cos(phi + Math.PI / 3));\n\t\t\troots.push(-t * Math.cos(phi - Math.PI / 3));\n\t\t\tnum = 3;\n\t\t} else {\n\t\t\tlet sqrtD = Math.sqrt(D);\n\t\t\tlet u = Math.pow(sqrtD - q,0.33333333333333331);\n\t\t\tlet v = -Math.pow(sqrtD + q,0.33333333333333331);\n\t\t\troots.push(u + v);\n\t\t\tnum = 1;\n\t\t}\n\t\tlet _g = 0;\n\t\tlet _g1 = num;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\troots[i] -= A / 3;\n\t\t}\n\t\troots.sort(function(a,b) {\n\t\t\tif(a > 0) {\n\t\t\t\treturn 1;\n\t\t\t} else if(a < 0) {\n\t\t\t\treturn -1;\n\t\t\t} else {\n\t\t\t\treturn 0;\n\t\t\t}\n\t\t});\n\t\treturn { roots : roots};\n\t}\n\tstatic solveQuartic(a,b,c,d,e) {\n\t\tif(a == 0) {\n\t\t\treturn console_MathFunctions.solveCubic(b,c,d,e);\n\t\t}\n\t\tlet A = b / a;\n\t\tlet B = c / a;\n\t\tlet C = d / a;\n\t\tlet D = e / a;\n\t\tlet A2 = A * A;\n\t\tlet A3 = A2 * A;\n\t\tlet A4 = A2 * A2;\n\t\tlet sqrtA = Math.sqrt(A);\n\t\tlet aCubed = A3 * A;\n\t\tlet bSqrt = B * B;\n\t\tlet cQuad = C * C;\n\t\tlet dQuad = D * D;\n\t\tlet p = -0.375 * A2 + B;\n\t\tlet q = 0.125 * A3 - 0.5 * A * B + C;\n\t\tlet r = -0.01171875 * A4 + 0.0625 * A2 * B - 0.25 * A * C + D;\n\t\tlet p3 = p * p * p;\n\t\tlet q2 = q * q;\n\t\tlet D1 = q2 + p3;\n\t\tlet num = 0;\n\t\tlet roots = [];\n\t\tif(r == 0) {\n\t\t\tlet cbs = console_MathFunctions.solveCubic(1,0,p,q);\n\t\t\troots = cbs.roots;\n\t\t\troots.push(0);\n\t\t} else {\n\t\t\tlet q2 = q * q;\n\t\t\ta = 1;\n\t\t\tb = -0.5 * p;\n\t\t\tc = -r;\n\t\t\td = 0.5 * r * p - 0.125 * q2;\n\t\t\tlet cbs = console_MathFunctions.solveCubic(a,b,c,d);\n\t\t\tlet z = cbs.roots[0];\n\t\t\tlet u = z * z - r;\n\t\t\tlet v = 2 * z - p;\n\t\t\tif(u > 0) {\n\t\t\t\tu = Math.sqrt(u);\n\t\t\t} else {\n\t\t\t\treturn { roots : []};\n\t\t\t}\n\t\t\tif(v > 0) {\n\t\t\t\tv = Math.sqrt(v);\n\t\t\t} else {\n\t\t\t\treturn { roots : []};\n\t\t\t}\n\t\t\ta = 1;\n\t\t\tb = v;\n\t\t\tc = z - u;\n\t\t\tlet qr1 = console_MathFunctions.solveQuadratic(a,b,c);\n\t\t\tnum = qr1.roots.length;\n\t\t\ta = 1;\n\t\t\tb = -v;\n\t\t\tc = z + u;\n\t\t\tlet qr2 = console_MathFunctions.solveQuadratic(a,b,c);\n\t\t\tnum += qr2.roots.length;\n\t\t\troots = qr1.roots.concat(qr2.roots);\n\t\t}\n\t\tlet _g = 0;\n\t\tlet _g1 = num;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\troots[i] -= A / 4;\n\t\t}\n\t\troots.sort(function(a,b) {\n\t\t\tif(a > 0) {\n\t\t\t\treturn 1;\n\t\t\t} else if(a < 0) {\n\t\t\t\treturn -1;\n\t\t\t} else {\n\t\t\t\treturn 0;\n\t\t\t}\n\t\t});\n\t\treturn { roots : roots};\n\t}\n\tstatic mSolveQuadratic(vm,thisObj,args) {\n\t\tlet a = parseFloat(args[1]);\n\t\tlet b = parseFloat(args[2]);\n\t\tlet c = parseFloat(args[3]);\n\t\tlet roots = console_MathFunctions.solveQuadratic(a,b,c);\n\t\treturn roots.roots.join(\" \");\n\t}\n\tstatic mSolveCubic(vm,thisObj,args) {\n\t\tlet a = parseFloat(args[1]);\n\t\tlet b = parseFloat(args[2]);\n\t\tlet c = parseFloat(args[3]);\n\t\tlet d = parseFloat(args[4]);\n\t\tlet roots = console_MathFunctions.solveCubic(a,b,c,d);\n\t\treturn roots.roots.join(\" \");\n\t}\n\tstatic mSolveQuartic(vm,thisObj,args) {\n\t\tlet a = parseFloat(args[1]);\n\t\tlet b = parseFloat(args[2]);\n\t\tlet c = parseFloat(args[3]);\n\t\tlet d = parseFloat(args[4]);\n\t\tlet e = parseFloat(args[5]);\n\t\tlet roots = console_MathFunctions.solveQuartic(a,b,c,d,e);\n\t\treturn roots.roots.join(\" \");\n\t}\n\tstatic mFloor(vm,thisObj,args) {\n\t\treturn Math.floor(parseFloat(args[1]));\n\t}\n\tstatic mCeil(vm,thisObj,args) {\n\t\treturn Math.ceil(parseFloat(args[1]));\n\t}\n\tstatic mAbs(vm,thisObj,args) {\n\t\treturn Math.abs(parseFloat(args[1]));\n\t}\n\tstatic mSqrt(vm,thisObj,args) {\n\t\treturn Math.sqrt(parseFloat(args[1]));\n\t}\n\tstatic mPow(vm,thisObj,args) {\n\t\treturn Math.pow(parseFloat(args[1]),parseFloat(args[2]));\n\t}\n\tstatic mLog(vm,thisObj,args) {\n\t\treturn Math.log(parseFloat(args[1]));\n\t}\n\tstatic mSin(vm,thisObj,args) {\n\t\treturn Math.sin(parseFloat(args[1]));\n\t}\n\tstatic mCos(vm,thisObj,args) {\n\t\treturn Math.cos(parseFloat(args[1]));\n\t}\n\tstatic mTan(vm,thisObj,args) {\n\t\treturn Math.tan(parseFloat(args[1]));\n\t}\n\tstatic mAsin(vm,thisObj,args) {\n\t\treturn Math.asin(parseFloat(args[1]));\n\t}\n\tstatic mAcos(vm,thisObj,args) {\n\t\treturn Math.acos(parseFloat(args[1]));\n\t}\n\tstatic mAtan(vm,thisObj,args) {\n\t\treturn Math.atan2(parseFloat(args[1]),parseFloat(args[2]));\n\t}\n\tstatic mRadToDeg(vm,thisObj,args) {\n\t\treturn parseFloat(args[1]) * 180 / Math.PI;\n\t}\n\tstatic mDegToRad(vm,thisObj,args) {\n\t\treturn parseFloat(args[1]) * Math.PI / 180;\n\t}\n\tstatic install(vm) {\n\t\tlet vmObj = vm;\n\t\tvmObj.addConsoleFunction(\"mSolveQuadratic\",\"mSolveQuadratic(float a, float b, float c) - Solve a quadratic equation (2nd degree polynomial) of form a*x^2 + b*x + c = 0.\",4,4,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mSolveQuadratic(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mSolveCubic\",\"mSolveCubic(float a, float b, float c, float d) - Solve a cubic equation (3rd degree polynomial) of form a*x^3 + b*x^2 + c*x + d = 0.\",5,5,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mSolveCubic(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mSolveQuartic\",\"mSolveQuartic(float a, float b, float c, float d, float e) - Solve a quartic equation (4th degree polynomial) of form a*x^4 + b*x^3 + c*x^2 + d*x + e = 0.\",6,6,console_FunctionType.StringCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mSolveQuartic(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mFloor\",\"mFloor(float v) - Round v down to the nearest whole number.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mFloor(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mCeil\",\"mCeil(float v) - Round v up to the nearest whole number.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mCeil(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mAbs\",\"mAbs(float v) - Returns the absolute value of the argument.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mAbs(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mSqrt\",\"mSqrt(float v) - Returns the square root of the argument.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mSqrt(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mPow\",\"mPow(float b, float p) - Returns the b raised to the pth power.\",3,3,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mPow(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mLog\",\"mLog(float v) - Returns the natural logarithm of the argument.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mLog(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mSin\",\"mSin(float th) - Returns the sine of th, which is in radians.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mSin(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mCos\",\"mCos(float th) - Returns the cosine of th, which is in radians.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mCos(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mTan\",\"mTan(float th) - Returns the tangent of th, which is in radians.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mTan(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mAsin\",\"mAsin(float th) - Returns the arc-sine of th, which is in radians.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mAsin(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mAcos\",\"mAcos(float th) - Returns the arc-cosine of th, which is in radians.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mAcos(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mAtan\",\"mAtan(float rise, float run) - Returns the slope in radians (the arc-tangent) of a line with the given rise and run.\",3,3,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mAtan(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mRadToDeg\",\"mRadToDeg(float radians) - Converts a measure in radians to degrees.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mRadToDeg(vm,s,arr);\n\t\t}));\n\t\tvmObj.addConsoleFunction(\"mDegToRad\",\"mDegToRad(float degrees) - Convert a measure in degrees to radians.\",2,2,console_FunctionType.FloatCallbackType(function(vm,s,arr) {\n\t\t\treturn console_MathFunctions.mDegToRad(vm,s,arr);\n\t\t}));\n\t}\n\tstatic gatherDocs() {\n\t\tlet docList = [];\n\t\tdocList.push({ funcname : \"mSolveQuadratic\", funcusage : \"mSolveQuadratic(float a, float b, float c) - Solve a quadratic equation (2nd degree polynomial) of form a*x^2 + b*x + c = 0.\"});\n\t\tdocList.push({ funcname : \"mSolveCubic\", funcusage : \"mSolveCubic(float a, float b, float c, float d) - Solve a cubic equation (3rd degree polynomial) of form a*x^3 + b*x^2 + c*x + d = 0.\"});\n\t\tdocList.push({ funcname : \"mSolveQuartic\", funcusage : \"mSolveQuartic(float a, float b, float c, float d, float e) - Solve a quartic equation (4th degree polynomial) of form a*x^4 + b*x^3 + c*x^2 + d*x + e = 0.\"});\n\t\tdocList.push({ funcname : \"mFloor\", funcusage : \"mFloor(float v) - Round v down to the nearest whole number.\"});\n\t\tdocList.push({ funcname : \"mCeil\", funcusage : \"mCeil(float v) - Round v up to the nearest whole number.\"});\n\t\tdocList.push({ funcname : \"mAbs\", funcusage : \"mAbs(float v) - Returns the absolute value of the argument.\"});\n\t\tdocList.push({ funcname : \"mSqrt\", funcusage : \"mSqrt(float v) - Returns the square root of the argument.\"});\n\t\tdocList.push({ funcname : \"mPow\", funcusage : \"mPow(float b, float p) - Returns the b raised to the pth power.\"});\n\t\tdocList.push({ funcname : \"mLog\", funcusage : \"mLog(float v) - Returns the natural logarithm of the argument.\"});\n\t\tdocList.push({ funcname : \"mSin\", funcusage : \"mSin(float th) - Returns the sine of th, which is in radians.\"});\n\t\tdocList.push({ funcname : \"mCos\", funcusage : \"mCos(float th) - Returns the cosine of th, which is in radians.\"});\n\t\tdocList.push({ funcname : \"mTan\", funcusage : \"mTan(float th) - Returns the tangent of th, which is in radians.\"});\n\t\tdocList.push({ funcname : \"mAsin\", funcusage : \"mAsin(float th) - Returns the arc-sine of th, which is in radians.\"});\n\t\tdocList.push({ funcname : \"mAcos\", funcusage : \"mAcos(float th) - Returns the arc-cosine of th, which is in radians.\"});\n\t\tdocList.push({ funcname : \"mAtan\", funcusage : \"mAtan(float rise, float run) - Returns the slope in radians (the arc-tangent) of a line with the given rise and run.\"});\n\t\tdocList.push({ funcname : \"mRadToDeg\", funcusage : \"mRadToDeg(float radians) - Converts a measure in radians to degrees.\"});\n\t\tdocList.push({ funcname : \"mDegToRad\", funcusage : \"mDegToRad(float degrees) - Convert a measure in degrees to radians.\"});\n\t\treturn docList;\n\t}\n}\nconsole_MathFunctions.__name__ = true;\nvar console_FunctionType = $hxEnums[\"console.FunctionType\"] = { __ename__:true,__constructs__:null\n\t,ScriptFunctionType: ($_=function(functionOffset,codeBlock) { return {_hx_index:0,functionOffset:functionOffset,codeBlock:codeBlock,__enum__:\"console.FunctionType\",toString:$estr}; },$_._hx_name=\"ScriptFunctionType\",$_.__params__ = [\"functionOffset\",\"codeBlock\"],$_)\n\t,JSFunctionType: ($_=function(callback) { return {_hx_index:1,callback:callback,__enum__:\"console.FunctionType\",toString:$estr}; },$_._hx_name=\"JSFunctionType\",$_.__params__ = [\"callback\"],$_)\n\t,IntCallbackType: ($_=function(callback) { return {_hx_index:2,callback:callback,__enum__:\"console.FunctionType\",toString:$estr}; },$_._hx_name=\"IntCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,FloatCallbackType: ($_=function(callback) { return {_hx_index:3,callback:callback,__enum__:\"console.FunctionType\",toString:$estr}; },$_._hx_name=\"FloatCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,StringCallbackType: ($_=function(callback) { return {_hx_index:4,callback:callback,__enum__:\"console.FunctionType\",toString:$estr}; },$_._hx_name=\"StringCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,VoidCallbackType: ($_=function(callback) { return {_hx_index:5,callback:callback,__enum__:\"console.FunctionType\",toString:$estr}; },$_._hx_name=\"VoidCallbackType\",$_.__params__ = [\"callback\"],$_)\n\t,BoolCallbackType: ($_=function(callback) { return {_hx_index:6,callback:callback,__enum__:\"console.FunctionType\",toString:$estr}; },$_._hx_name=\"BoolCallbackType\",$_.__params__ = [\"callback\"],$_)\n};\nconsole_FunctionType.__constructs__ = [console_FunctionType.ScriptFunctionType,console_FunctionType.JSFunctionType,console_FunctionType.IntCallbackType,console_FunctionType.FloatCallbackType,console_FunctionType.StringCallbackType,console_FunctionType.VoidCallbackType,console_FunctionType.BoolCallbackType];\nclass console_NamespaceEntry {\n\tconstructor(ns,fname,ftype,minArgs,maxArgs,usage,pkg) {\n\t\tthis.namespace = ns;\n\t\tthis.functionName = fname;\n\t\tthis.type = ftype;\n\t\tthis.minArgs = minArgs;\n\t\tthis.maxArgs = maxArgs;\n\t\tthis.usage = usage;\n\t\tthis.pkg = pkg;\n\t}\n}\nconsole_NamespaceEntry.__name__ = true;\nObject.assign(console_NamespaceEntry.prototype, {\n\t__class__: console_NamespaceEntry\n});\nclass console_Namespace {\n\tconstructor(name,pkg,parent) {\n\t\tthis.name = name;\n\t\tthis.pkg = pkg;\n\t\tthis.parent = parent;\n\t\tthis.entries = [];\n\t}\n\taddFunction(name,functionOffset,codeblock) {\n\t\tlet ent = new console_NamespaceEntry(this,name,console_FunctionType.ScriptFunctionType(functionOffset,codeblock),0,0,\"\",null);\n\t\tthis.entries.push(ent);\n\t}\n\taddFunctionFull(name,usage,minArgs,maxArgs,ftype) {\n\t\tlet ent = new console_NamespaceEntry(this,name,ftype,minArgs,maxArgs,usage,null);\n\t\tthis.entries.push(ent);\n\t}\n\tfind(functionName) {\n\t\tlet _g = 0;\n\t\tlet _g1 = this.entries;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet entry = _g1[_g];\n\t\t\t++_g;\n\t\t\tif(entry.functionName.toLowerCase() == functionName.toLowerCase()) {\n\t\t\t\treturn entry;\n\t\t\t}\n\t\t}\n\t\tif(this.parent != null) {\n\t\t\treturn this.parent.find(functionName);\n\t\t}\n\t\treturn null;\n\t}\n}\nconsole_Namespace.__name__ = true;\nObject.assign(console_Namespace.prototype, {\n\t__class__: console_Namespace\n});\nvar expr_TypeReq = $hxEnums[\"expr.TypeReq\"] = { __ename__:true,__constructs__:null\n\t,ReqNone: {_hx_name:\"ReqNone\",_hx_index:0,__enum__:\"expr.TypeReq\",toString:$estr}\n\t,ReqInt: {_hx_name:\"ReqInt\",_hx_index:1,__enum__:\"expr.TypeReq\",toString:$estr}\n\t,ReqFloat: {_hx_name:\"ReqFloat\",_hx_index:2,__enum__:\"expr.TypeReq\",toString:$estr}\n\t,ReqString: {_hx_name:\"ReqString\",_hx_index:3,__enum__:\"expr.TypeReq\",toString:$estr}\n};\nexpr_TypeReq.__constructs__ = [expr_TypeReq.ReqNone,expr_TypeReq.ReqInt,expr_TypeReq.ReqFloat,expr_TypeReq.ReqString];\nclass expr_Stmt {\n\tconstructor(lineNo) {\n\t\tif(expr_Stmt._hx_skip_constructor) {\n\t\t\treturn;\n\t\t}\n\t\tthis._hx_constructor(lineNo);\n\t}\n\t_hx_constructor(lineNo) {\n\t\tthis.lineNo = lineNo;\n\t}\n\tprint(indent,isStmt) {\n\t\tthrow new haxe_Exception(\"print not implemented\");\n\t}\n\tprintIndent(indent) {\n\t\tlet i = 0;\n\t\tlet out_b = \"\";\n\t\twhile(i < indent) {\n\t\t\tout_b += \"    \";\n\t\t\t++i;\n\t\t}\n\t\treturn out_b;\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\treturn 0;\n\t}\n\tcompileStmt(compiler,context) {\n\t\treturn 0;\n\t}\n\taddBreakCount(compiler) {\n\t\tif(compiler.inFunction) {\n\t\t\tcompiler.breakLineCount++;\n\t\t}\n\t}\n\tvisitStmt(optimizerPass) {\n\t\toptimizerPass.visitStmt(this);\n\t}\n\taddBreakLine(ip,compiler,context) {\n\t\tif(compiler.inFunction) {\n\t\t\tlet line = compiler.breakLineCount * 2;\n\t\t\tcompiler.breakLineCount++;\n\t\t\tif(context.lineBreakPairs.length != 0) {\n\t\t\t\tcontext.lineBreakPairs[line] = this.lineNo;\n\t\t\t\tcontext.lineBreakPairs[line + 1] = ip;\n\t\t\t}\n\t\t}\n\t}\n\tstatic precompileBlock(compiler,stmts,loopCount) {\n\t\texpr_Stmt.recursion++;\n\t\tlet result = new Array(stmts.length);\n\t\tlet _g = 0;\n\t\tlet _g1 = stmts.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tresult[i] = stmts[i].precompileStmt(compiler,loopCount);\n\t\t}\n\t\tlet ans = result;\n\t\texpr_Stmt.recursion--;\n\t\tlet sn = 0;\n\t\tlet _g2 = 0;\n\t\twhile(_g2 < ans.length) {\n\t\t\tlet s = ans[_g2];\n\t\t\t++_g2;\n\t\t\tsn += s;\n\t\t}\n\t\treturn sn;\n\t}\n\tstatic compileBlock(compiler,context,stmts) {\n\t\texpr_Stmt.recursion++;\n\t\tlet _g = 0;\n\t\twhile(_g < stmts.length) {\n\t\t\tlet s = stmts[_g];\n\t\t\t++_g;\n\t\t\tcontext.ip = s.compileStmt(compiler,context);\n\t\t}\n\t\texpr_Stmt.recursion--;\n\t\treturn context.ip;\n\t}\n\tstatic visitBlock(optimizerPass,stmts) {\n\t\tlet _g = 0;\n\t\twhile(_g < stmts.length) {\n\t\t\tlet s = stmts[_g];\n\t\t\t++_g;\n\t\t\ts.visitStmt(optimizerPass);\n\t\t}\n\t}\n\tstatic printBlock(stmt,indent) {\n\t\tlet sbuf_b = \"\";\n\t\tlet _g = 0;\n\t\twhile(_g < stmt.length) {\n\t\t\tlet s = stmt[_g];\n\t\t\t++_g;\n\t\t\tsbuf_b += Std.string(s.print(indent,true));\n\t\t}\n\t\treturn sbuf_b;\n\t}\n}\nexpr_Stmt.__name__ = true;\nObject.assign(expr_Stmt.prototype, {\n\t__class__: expr_Stmt\n});\nclass expr_BreakStmt extends expr_Stmt {\n\tconstructor(lineNo) {\n\t\tsuper(lineNo);\n\t}\n\tprint(indent,isStmt) {\n\t\treturn this.printIndent(indent) + \"break;\\n\";\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\tif(loopCount > 0) {\n\t\t\tthis.addBreakCount(compiler);\n\t\t\treturn 2;\n\t\t}\n\t\tconsole.log(\"src/expr/Expr.hx:125:\",\"Warning: break outside of loop.\");\n\t\treturn 0;\n\t}\n\tcompileStmt(compiler,context) {\n\t\tif(context.breakPoint > 0) {\n\t\t\tthis.addBreakLine(context.ip,compiler,context);\n\t\t\tcontext.codeStream[context.ip++] = 12;\n\t\t\tcontext.codeStream[context.ip++] = context.breakPoint;\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\toptimizerPass.visitBreakStmt(this);\n\t}\n}\nexpr_BreakStmt.__name__ = true;\nexpr_BreakStmt.__super__ = expr_Stmt;\nObject.assign(expr_BreakStmt.prototype, {\n\t__class__: expr_BreakStmt\n});\nclass expr_ContinueStmt extends expr_Stmt {\n\tconstructor(lineNo) {\n\t\tsuper(lineNo);\n\t}\n\tprint(indent,isStmt) {\n\t\treturn this.printIndent(indent) + \"continue;\\n\";\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\tif(loopCount > 0) {\n\t\t\tthis.addBreakCount(compiler);\n\t\t\treturn 2;\n\t\t}\n\t\tconsole.log(\"src/expr/Expr.hx:160:\",\"Warning: continue outside of loop.\");\n\t\treturn 0;\n\t}\n\tcompileStmt(compiler,context) {\n\t\tif(context.continuePoint > 0) {\n\t\t\tthis.addBreakLine(context.ip,compiler,context);\n\t\t\tcontext.codeStream[context.ip++] = 12;\n\t\t\tcontext.codeStream[context.ip++] = context.continuePoint;\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\toptimizerPass.visitContinueStmt(this);\n\t}\n}\nexpr_ContinueStmt.__name__ = true;\nexpr_ContinueStmt.__super__ = expr_Stmt;\nObject.assign(expr_ContinueStmt.prototype, {\n\t__class__: expr_ContinueStmt\n});\nclass expr_Expr extends expr_Stmt {\n\t_hx_constructor(lineNo) {\n\t\tsuper._hx_constructor(lineNo);\n\t}\n\tprint(indent,isStmt) {\n\t\tthrow new haxe_Exception(\"print not implemented\");\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\tthis.addBreakCount(compiler);\n\t\treturn this.precompile(compiler,expr_TypeReq.ReqNone);\n\t}\n\tcompileStmt(compiler,context) {\n\t\tthis.addBreakLine(context.ip,compiler,context);\n\t\treturn this.compile(compiler,context,expr_TypeReq.ReqNone);\n\t}\n\tprecompile(compiler,typeReq) {\n\t\treturn 0;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\treturn 0;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqNone;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\toptimizerPass.visitExpr(this);\n\t}\n\tstatic conversionOp(src,dest) {\n\t\tswitch(src._hx_index) {\n\t\tcase 1:\n\t\t\tswitch(dest._hx_index) {\n\t\t\tcase 0:\n\t\t\t\treturn 64;\n\t\t\tcase 2:\n\t\t\t\treturn 62;\n\t\t\tcase 3:\n\t\t\t\treturn 63;\n\t\t\tdefault:\n\t\t\t\treturn 83;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tswitch(dest._hx_index) {\n\t\t\tcase 0:\n\t\t\t\treturn 61;\n\t\t\tcase 1:\n\t\t\t\treturn 59;\n\t\t\tcase 3:\n\t\t\t\treturn 60;\n\t\t\tdefault:\n\t\t\t\treturn 83;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tswitch(dest._hx_index) {\n\t\t\tcase 0:\n\t\t\t\treturn 58;\n\t\t\tcase 1:\n\t\t\t\treturn 56;\n\t\t\tcase 2:\n\t\t\t\treturn 57;\n\t\t\tdefault:\n\t\t\t\treturn 83;\n\t\t\t}\n\t\t\tbreak;\n\t\tdefault:\n\t\t\treturn 83;\n\t\t}\n\t}\n}\nexpr_Expr.__name__ = true;\nexpr_Expr.__super__ = expr_Stmt;\nObject.assign(expr_Expr.prototype, {\n\t__class__: expr_Expr\n});\nclass expr_ParenthesisExpr extends expr_Expr {\n\tconstructor(expr) {\n\t\tsuper(expr.lineNo);\n\t\tthis.expr = expr;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + \"(\" + this.expr.print(indent,false) + \")\" + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tlet size = this.expr.precompile(compiler,typeReq);\n\t\treturn size;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tlet size = this.expr.compile(compiler,context,typeReq);\n\t\tcontext.ip = size;\n\t\treturn size;\n\t}\n\tgetPrefferredType() {\n\t\treturn this.expr.getPrefferredType();\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tthis.expr.visitStmt(optimizerPass);\n\t\toptimizerPass.visitParenthesisExpr(this);\n\t}\n}\nexpr_ParenthesisExpr.__name__ = true;\nexpr_ParenthesisExpr.__super__ = expr_Expr;\nObject.assign(expr_ParenthesisExpr.prototype, {\n\t__class__: expr_ParenthesisExpr\n});\nclass expr_ReturnStmt extends expr_Stmt {\n\tconstructor(lineNo,expr) {\n\t\tsuper(lineNo);\n\t\tthis.expr = expr;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn this.printIndent(indent) + (\"return\" + (this.expr == null ? \"\" : \" \" + this.expr.print(indent,false)) + \";\\n\");\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\tthis.addBreakCount(compiler);\n\t\tif(this.expr == null) {\n\t\t\treturn 1;\n\t\t} else {\n\t\t\treturn 1 + this.expr.precompile(compiler,expr_TypeReq.ReqString);\n\t\t}\n\t}\n\tcompileStmt(compiler,context) {\n\t\tthis.addBreakLine(context.ip,compiler,context);\n\t\tif(this.expr == null) {\n\t\t\tcontext.codeStream[context.ip++] = 13;\n\t\t} else {\n\t\t\tcontext.ip = this.expr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 13;\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tif(this.expr != null) {\n\t\t\tthis.expr.visitStmt(optimizerPass);\n\t\t}\n\t\toptimizerPass.visitReturnStmt(this);\n\t}\n}\nexpr_ReturnStmt.__name__ = true;\nexpr_ReturnStmt.__super__ = expr_Stmt;\nObject.assign(expr_ReturnStmt.prototype, {\n\t__class__: expr_ReturnStmt\n});\nclass expr_IfStmt extends expr_Stmt {\n\tconstructor(lineNo,condition,body,elseBlock) {\n\t\tsuper(lineNo);\n\t\tthis.condition = condition;\n\t\tthis.body = body;\n\t\tthis.elseBlock = elseBlock;\n\t}\n\tprint(indent,isStmt) {\n\t\tlet ifPart = this.printIndent(indent) + (\"if (\" + this.condition.print(indent,false) + \")\");\n\t\tif(this.ifStmtList) {\n\t\t\tifPart += \" {\\n\";\n\t\t} else {\n\t\t\tifPart += \"\\n\";\n\t\t}\n\t\tlet bodyPart = expr_Stmt.printBlock(this.body,indent + 1) + (this.body.length > 1 ? this.printIndent(indent) + \"}\" : \"\");\n\t\tif(this.elseBlock != null || this.elseStmtList) {\n\t\t\tif(this.ifStmtList) {\n\t\t\t\tbodyPart += \" \";\n\t\t\t}\n\t\t\tbodyPart += this.printIndent(indent) + \"else\";\n\t\t\tif(this.elseStmtList) {\n\t\t\t\tbodyPart += \" {\\n\";\n\t\t\t} else {\n\t\t\t\tbodyPart += \"\\n\";\n\t\t\t}\n\t\t\tif(this.elseBlock != null) {\n\t\t\t\tlet elsePart = expr_Stmt.printBlock(this.elseBlock,indent + 1) + (this.elseBlock.length > 1 ? this.printIndent(indent) + \"}\\n\" : \"\");\n\t\t\t\tbodyPart += elsePart;\n\t\t\t}\n\t\t} else if(this.elseStmtList) {\n\t\t\tbodyPart += \"\\n\";\n\t\t}\n\t\treturn ifPart + bodyPart;\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\tlet exprSize = 0;\n\t\tthis.addBreakCount(compiler);\n\t\tif(this.condition.getPrefferredType() == expr_TypeReq.ReqInt) {\n\t\t\texprSize += this.condition.precompile(compiler,expr_TypeReq.ReqInt);\n\t\t\tthis.integer = true;\n\t\t} else {\n\t\t\texprSize += this.condition.precompile(compiler,expr_TypeReq.ReqFloat);\n\t\t\tthis.integer = false;\n\t\t}\n\t\tlet ifSize = expr_Stmt.precompileBlock(compiler,this.body,loopCount);\n\t\tif(this.elseBlock == null) {\n\t\t\tthis.endifOffset = exprSize + 2 + ifSize;\n\t\t} else {\n\t\t\tthis.elseOffset = exprSize + 2 + ifSize + 2;\n\t\t\tlet elseSize = expr_Stmt.precompileBlock(compiler,this.elseBlock,loopCount);\n\t\t\tthis.endifOffset = this.elseOffset + elseSize;\n\t\t}\n\t\treturn this.endifOffset;\n\t}\n\tcompileStmt(compiler,context) {\n\t\tlet start = context.ip;\n\t\tthis.addBreakLine(start,compiler,context);\n\t\tcontext.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);\n\t\tcontext.codeStream[context.ip++] = this.integer ? 7 : 6;\n\t\tif(this.elseBlock != null) {\n\t\t\tcontext.codeStream[context.ip++] = start + this.elseOffset;\n\t\t\tcontext.ip = expr_Stmt.compileBlock(compiler,context,this.body);\n\t\t\tcontext.codeStream[context.ip++] = 12;\n\t\t\tcontext.codeStream[context.ip++] = start + this.endifOffset;\n\t\t\tcontext.ip = expr_Stmt.compileBlock(compiler,context,this.elseBlock);\n\t\t} else {\n\t\t\tcontext.codeStream[context.ip++] = start + this.endifOffset;\n\t\t\tcontext.ip = expr_Stmt.compileBlock(compiler,context,this.body);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tthis.condition.visitStmt(optimizerPass);\n\t\texpr_Stmt.visitBlock(optimizerPass,this.body);\n\t\tif(this.elseBlock != null) {\n\t\t\texpr_Stmt.visitBlock(optimizerPass,this.elseBlock);\n\t\t}\n\t\toptimizerPass.visitIfStmt(this);\n\t}\n}\nexpr_IfStmt.__name__ = true;\nexpr_IfStmt.__super__ = expr_Stmt;\nObject.assign(expr_IfStmt.prototype, {\n\t__class__: expr_IfStmt\n});\nclass expr_LoopStmt extends expr_Stmt {\n\tconstructor(lineNo,condition,init,end,body) {\n\t\texpr_Stmt._hx_skip_constructor = true;\n\t\tsuper();\n\t\texpr_Stmt._hx_skip_constructor = false;\n\t\tthis._hx_constructor(lineNo,condition,init,end,body);\n\t}\n\t_hx_constructor(lineNo,condition,init,end,body) {\n\t\tthis.isStatementList = false;\n\t\tthis.isForLoop = false;\n\t\tsuper._hx_constructor(lineNo);\n\t\tthis.condition = condition;\n\t\tthis.init = init;\n\t\tthis.end = end;\n\t\tthis.body = body;\n\t}\n\tprint(indent,isStmt) {\n\t\tif(this.isForLoop) {\n\t\t\tlet sbuf_b = \"\";\n\t\t\tsbuf_b += Std.string(this.printIndent(indent));\n\t\t\tsbuf_b += Std.string(\"for (\" + this.init.print(indent,false) + \"; \" + this.condition.print(indent,false) + \"; \" + this.end.print(indent,false) + \")\");\n\t\t\tif(this.isStatementList) {\n\t\t\t\tsbuf_b += \" {\\n\";\n\t\t\t} else {\n\t\t\t\tsbuf_b += \"\\n\";\n\t\t\t}\n\t\t\tlet bodyPart = expr_Stmt.printBlock(this.body,indent + 1) + (this.body.length > 1 ? this.printIndent(indent) + \"}\\n\" : \"\");\n\t\t\tsbuf_b += bodyPart == null ? \"null\" : \"\" + bodyPart;\n\t\t\treturn sbuf_b;\n\t\t} else {\n\t\t\tlet sbuf_b = \"\";\n\t\t\tsbuf_b += Std.string(this.printIndent(indent));\n\t\t\tsbuf_b += Std.string(\"while (\" + this.condition.print(indent,false) + \")\");\n\t\t\tif(this.isStatementList) {\n\t\t\t\tsbuf_b += \" {\\n\";\n\t\t\t} else {\n\t\t\t\tsbuf_b += \"\\n\";\n\t\t\t}\n\t\t\tlet bodyPart = expr_Stmt.printBlock(this.body,indent + 1) + (this.body.length > 1 ? this.printIndent(indent) + \"}\\n\" : \"\");\n\t\t\tsbuf_b += bodyPart == null ? \"null\" : \"\" + bodyPart;\n\t\t\treturn sbuf_b;\n\t\t}\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\tlet initSize = 0;\n\t\tthis.addBreakCount(compiler);\n\t\tif(this.init != null) {\n\t\t\tinitSize = this.init.precompile(compiler,expr_TypeReq.ReqNone);\n\t\t}\n\t\tlet testSize = 0;\n\t\tif(this.condition.getPrefferredType() == expr_TypeReq.ReqInt) {\n\t\t\tthis.integer = true;\n\t\t\ttestSize = this.condition.precompile(compiler,expr_TypeReq.ReqInt);\n\t\t} else {\n\t\t\tthis.integer = false;\n\t\t\ttestSize = this.condition.precompile(compiler,expr_TypeReq.ReqFloat);\n\t\t}\n\t\tlet blockSize = expr_Stmt.precompileBlock(compiler,this.body,loopCount + 1);\n\t\tlet endLoopSize = 0;\n\t\tif(this.end != null) {\n\t\t\tendLoopSize = this.end.precompile(compiler,expr_TypeReq.ReqNone);\n\t\t}\n\t\tthis.loopBlockStartOffset = initSize + testSize + 2;\n\t\tthis.continueOffset = this.loopBlockStartOffset + blockSize;\n\t\tthis.breakOffset = this.continueOffset + endLoopSize + testSize + 2;\n\t\treturn this.breakOffset;\n\t}\n\tcompileStmt(compiler,context) {\n\t\tthis.addBreakLine(context.ip,compiler,context);\n\t\tlet start = context.ip;\n\t\tif(this.init != null) {\n\t\t\tcontext.ip = this.init.compile(compiler,context,expr_TypeReq.ReqNone);\n\t\t}\n\t\tcontext.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);\n\t\tcontext.codeStream[context.ip++] = this.integer ? 7 : 6;\n\t\tcontext.codeStream[context.ip++] = start + this.breakOffset;\n\t\tlet cbreak = context.breakPoint;\n\t\tlet ccontinue = context.continuePoint;\n\t\tcontext.breakPoint = start + this.breakOffset;\n\t\tcontext.continuePoint = start + this.continueOffset;\n\t\tcontext.ip = expr_Stmt.compileBlock(compiler,context,this.body);\n\t\tcontext.breakPoint = cbreak;\n\t\tcontext.continuePoint = ccontinue;\n\t\tif(this.end != null) {\n\t\t\tcontext.ip = this.end.compile(compiler,context,expr_TypeReq.ReqNone);\n\t\t}\n\t\tcontext.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);\n\t\tcontext.codeStream[context.ip++] = this.integer ? 9 : 8;\n\t\tcontext.codeStream[context.ip++] = start + this.loopBlockStartOffset;\n\t\treturn context.ip;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tthis.condition.visitStmt(optimizerPass);\n\t\tif(this.init != null) {\n\t\t\tthis.init.visitStmt(optimizerPass);\n\t\t}\n\t\texpr_Stmt.visitBlock(optimizerPass,this.body);\n\t\tif(this.end != null) {\n\t\t\tthis.end.visitStmt(optimizerPass);\n\t\t}\n\t\toptimizerPass.visitLoopStmt(this);\n\t}\n}\nexpr_LoopStmt.__name__ = true;\nexpr_LoopStmt.__super__ = expr_Stmt;\nObject.assign(expr_LoopStmt.prototype, {\n\t__class__: expr_LoopStmt\n});\nclass expr_BinaryExpr extends expr_Expr {\n\tconstructor(lineNo) {\n\t\texpr_Stmt._hx_skip_constructor = true;\n\t\tsuper();\n\t\texpr_Stmt._hx_skip_constructor = false;\n\t\tthis._hx_constructor(lineNo);\n\t}\n\t_hx_constructor(lineNo) {\n\t\tthis.optimized = false;\n\t\tsuper._hx_constructor(lineNo);\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.left.print(indent,false) + \" \" + this.op.lexeme + \" \" + this.right.print(indent,false)) + (isStmt ? \";\\n\" : \"\");\n\t}\n}\nexpr_BinaryExpr.__name__ = true;\nexpr_BinaryExpr.__super__ = expr_Expr;\nObject.assign(expr_BinaryExpr.prototype, {\n\t__class__: expr_BinaryExpr\n});\nclass expr_FloatBinaryExpr extends expr_BinaryExpr {\n\tconstructor(left,right,op) {\n\t\tsuper(left.lineNo);\n\t\tthis.left = left;\n\t\tthis.right = right;\n\t\tthis.op = op;\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.precompile(compiler,typeReq);\n\t\t}\n\t\tlet addSize = this.left.precompile(compiler,expr_TypeReq.ReqFloat) + this.right.precompile(compiler,expr_TypeReq.ReqFloat) + 1;\n\t\tif(typeReq != expr_TypeReq.ReqFloat) {\n\t\t\t++addSize;\n\t\t}\n\t\treturn addSize;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.compile(compiler,context,typeReq);\n\t\t}\n\t\tcontext.ip = this.right.compile(compiler,context,expr_TypeReq.ReqFloat);\n\t\tcontext.ip = this.left.compile(compiler,context,expr_TypeReq.ReqFloat);\n\t\tlet operand;\n\t\tswitch(this.op.type._hx_index) {\n\t\tcase 15:\n\t\t\toperand = 31;\n\t\t\tbreak;\n\t\tcase 16:\n\t\t\toperand = 32;\n\t\t\tbreak;\n\t\tcase 17:\n\t\t\toperand = 33;\n\t\t\tbreak;\n\t\tcase 18:\n\t\t\toperand = 34;\n\t\t\tbreak;\n\t\tdefault:\n\t\t\toperand = 83;\n\t\t}\n\t\tcontext.codeStream[context.ip++] = operand;\n\t\tif(typeReq != expr_TypeReq.ReqFloat) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqFloat,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(visitor) {\n\t\tif(this.optimized) {\n\t\t\tthis.optimizedExpr.visitStmt(visitor);\n\t\t} else {\n\t\t\tthis.left.visitStmt(visitor);\n\t\t\tthis.right.visitStmt(visitor);\n\t\t\tvisitor.visitFloatBinaryExpr(this);\n\t\t}\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqFloat;\n\t}\n}\nexpr_FloatBinaryExpr.__name__ = true;\nexpr_FloatBinaryExpr.__super__ = expr_BinaryExpr;\nObject.assign(expr_FloatBinaryExpr.prototype, {\n\t__class__: expr_FloatBinaryExpr\n});\nclass expr_IntBinaryExpr extends expr_BinaryExpr {\n\tconstructor(left,right,op) {\n\t\tsuper(left.lineNo);\n\t\tthis.left = left;\n\t\tthis.right = right;\n\t\tthis.op = op;\n\t}\n\tgetSubTypeOperand() {\n\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\tlet _g = new haxe_ds_EnumValueMap();\n\t\t_g.set(TokenType.BitwiseXor,20);\n\t\t_g.set(TokenType.Modulus,21);\n\t\t_g.set(TokenType.BitwiseAnd,22);\n\t\t_g.set(TokenType.BitwiseOr,23);\n\t\t_g.set(TokenType.LessThan,17);\n\t\t_g.set(TokenType.LessThanEqual,18);\n\t\t_g.set(TokenType.GreaterThan,15);\n\t\t_g.set(TokenType.GreaterThanEqual,16);\n\t\t_g.set(TokenType.Equal,14);\n\t\t_g.set(TokenType.NotEqual,19);\n\t\t_g.set(TokenType.LogicalOr,30);\n\t\t_g.set(TokenType.LogicalAnd,29);\n\t\t_g.set(TokenType.RightBitShift,27);\n\t\t_g.set(TokenType.LeftBitShift,28);\n\t\tlet opmap = _g;\n\t\tlet fltops = [TokenType.LessThan,TokenType.LessThanEqual,TokenType.GreaterThan,TokenType.GreaterThanEqual,TokenType.Equal,TokenType.NotEqual];\n\t\tthis.operand = opmap.get(this.op.type);\n\t\tif(fltops.includes(this.op.type)) {\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t}\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.precompile(compiler,typeReq);\n\t\t}\n\t\tthis.getSubTypeOperand();\n\t\tlet addSize = this.left.precompile(compiler,this.subType) + this.right.precompile(compiler,this.subType) + 1;\n\t\tif(this.operand == 30 || this.operand == 29) {\n\t\t\t++addSize;\n\t\t}\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\t++addSize;\n\t\t}\n\t\treturn addSize;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.compile(compiler,context,typeReq);\n\t\t}\n\t\tif(this.operand == 30 || this.operand == 29) {\n\t\t\tcontext.ip = this.left.compile(compiler,context,this.subType);\n\t\t\tcontext.codeStream[context.ip++] = this.operand == 30 ? 11 : 10;\n\t\t\tlet jmpIp = context.ip++;\n\t\t\tcontext.ip = this.right.compile(compiler,context,this.subType);\n\t\t\tcontext.codeStream[jmpIp] = context.ip;\n\t\t} else {\n\t\t\tcontext.ip = this.right.compile(compiler,context,this.subType);\n\t\t\tcontext.ip = this.left.compile(compiler,context,this.subType);\n\t\t\tcontext.codeStream[context.ip++] = this.operand;\n\t\t}\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(visitor) {\n\t\tif(this.optimized) {\n\t\t\tthis.optimizedExpr.visitStmt(visitor);\n\t\t} else {\n\t\t\tthis.left.visitStmt(visitor);\n\t\t\tthis.right.visitStmt(visitor);\n\t\t\tvisitor.visitIntBinaryExpr(this);\n\t\t}\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqInt;\n\t}\n}\nexpr_IntBinaryExpr.__name__ = true;\nexpr_IntBinaryExpr.__super__ = expr_BinaryExpr;\nObject.assign(expr_IntBinaryExpr.prototype, {\n\t__class__: expr_IntBinaryExpr\n});\nclass expr_StrEqExpr extends expr_BinaryExpr {\n\tconstructor(left,right,op) {\n\t\tsuper(left.lineNo);\n\t\tthis.left = left;\n\t\tthis.right = right;\n\t\tthis.op = op;\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.precompile(compiler,typeReq);\n\t\t}\n\t\tlet size = this.left.precompile(compiler,expr_TypeReq.ReqString) + this.right.precompile(compiler,expr_TypeReq.ReqString) + 2;\n\t\tif(this.op.type == TokenType.StringNotEquals) {\n\t\t\t++size;\n\t\t}\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\t++size;\n\t\t}\n\t\treturn size;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.compile(compiler,context,typeReq);\n\t\t}\n\t\tcontext.ip = this.left.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 76;\n\t\tcontext.ip = this.right.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 79;\n\t\tif(this.op.type == TokenType.StringNotEquals) {\n\t\t\tcontext.codeStream[context.ip++] = 24;\n\t\t}\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(visitor) {\n\t\tif(this.optimized) {\n\t\t\tthis.optimizedExpr.visitStmt(visitor);\n\t\t} else {\n\t\t\tthis.left.visitStmt(visitor);\n\t\t\tthis.right.visitStmt(visitor);\n\t\t\tvisitor.visitStrEqExpr(this);\n\t\t}\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqInt;\n\t}\n}\nexpr_StrEqExpr.__name__ = true;\nexpr_StrEqExpr.__super__ = expr_BinaryExpr;\nObject.assign(expr_StrEqExpr.prototype, {\n\t__class__: expr_StrEqExpr\n});\nclass expr_StrCatExpr extends expr_BinaryExpr {\n\tconstructor(left,right,op) {\n\t\tsuper(left.lineNo);\n\t\tthis.left = left;\n\t\tthis.right = right;\n\t\tthis.op = op;\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.precompile(compiler,typeReq);\n\t\t}\n\t\tlet addSize = this.left.precompile(compiler,expr_TypeReq.ReqString) + this.right.precompile(compiler,expr_TypeReq.ReqString) + 2;\n\t\tif(this.op.type != TokenType.Concat) {\n\t\t\t++addSize;\n\t\t}\n\t\tif(typeReq != expr_TypeReq.ReqString) {\n\t\t\t++addSize;\n\t\t}\n\t\treturn addSize;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.compile(compiler,context,typeReq);\n\t\t}\n\t\tcontext.ip = this.left.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tif(this.op.type == TokenType.Concat) {\n\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t} else {\n\t\t\tcontext.codeStream[context.ip++] = 74;\n\t\t\tlet this1 = context.codeStream;\n\t\t\tlet index = context.ip++;\n\t\t\tlet val;\n\t\t\tswitch(this.op.type._hx_index) {\n\t\t\tcase 42:\n\t\t\t\tval = 32;\n\t\t\t\tbreak;\n\t\t\tcase 43:\n\t\t\t\tval = 9;\n\t\t\t\tbreak;\n\t\t\tcase 44:\n\t\t\t\tval = 10;\n\t\t\t\tbreak;\n\t\t\tdefault:\n\t\t\t\tval = 0;\n\t\t\t}\n\t\t\tthis1[index] = val;\n\t\t}\n\t\tcontext.ip = this.right.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 77;\n\t\tswitch(typeReq._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 56;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 57;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\treturn context.ip;\n\t}\n\tvisitStmt(visitor) {\n\t\tif(this.optimized) {\n\t\t\tthis.optimizedExpr.visitStmt(visitor);\n\t\t} else {\n\t\t\tthis.left.visitStmt(visitor);\n\t\t\tthis.right.visitStmt(visitor);\n\t\t\tvisitor.visitStrCatExpr(this);\n\t\t}\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqString;\n\t}\n}\nexpr_StrCatExpr.__name__ = true;\nexpr_StrCatExpr.__super__ = expr_BinaryExpr;\nObject.assign(expr_StrCatExpr.prototype, {\n\t__class__: expr_StrCatExpr\n});\nclass expr_CommaCatExpr extends expr_BinaryExpr {\n\tconstructor(left,right) {\n\t\tsuper(left.lineNo);\n\t\tthis.left = left;\n\t\tthis.right = right;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn \"\" + this.left.print(indent,false) + \", \" + this.right.print(indent,false);\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tlet addSize = this.left.precompile(compiler,expr_TypeReq.ReqString) + this.right.precompile(compiler,expr_TypeReq.ReqString) + 2;\n\t\tif(typeReq != expr_TypeReq.ReqString) {\n\t\t\t++addSize;\n\t\t}\n\t\treturn addSize;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.ip = this.left.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 75;\n\t\tcontext.ip = this.right.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 77;\n\t\tif(typeReq == expr_TypeReq.ReqInt || typeReq == expr_TypeReq.ReqFloat) {\n\t\t\tconsole.log(\"src/expr/Expr.hx:928:\",\"Warning: Converting comma string to number\");\n\t\t}\n\t\tif(typeReq == expr_TypeReq.ReqInt) {\n\t\t\tcontext.codeStream[context.ip++] = 56;\n\t\t} else if(typeReq == expr_TypeReq.ReqFloat) {\n\t\t\tcontext.codeStream[context.ip++] = 57;\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqString;\n\t}\n}\nexpr_CommaCatExpr.__name__ = true;\nexpr_CommaCatExpr.__super__ = expr_BinaryExpr;\nObject.assign(expr_CommaCatExpr.prototype, {\n\t__class__: expr_CommaCatExpr\n});\nclass expr_ConditionalExpr extends expr_Expr {\n\tconstructor(condition,trueExpr,falseExpr) {\n\t\tsuper(condition.lineNo);\n\t\tthis.condition = condition;\n\t\tthis.trueExpr = trueExpr;\n\t\tthis.falseExpr = falseExpr;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.condition.print(indent,false) + \" ? \" + this.trueExpr.print(indent,false) + \" : \" + this.falseExpr.print(indent,false) + \"}\") + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tlet exprSize = 0;\n\t\tif(this.condition.getPrefferredType() == expr_TypeReq.ReqInt) {\n\t\t\texprSize = this.condition.precompile(compiler,expr_TypeReq.ReqInt);\n\t\t\tthis.integer = true;\n\t\t} else {\n\t\t\texprSize = this.condition.precompile(compiler,expr_TypeReq.ReqFloat);\n\t\t\tthis.integer = false;\n\t\t}\n\t\treturn exprSize + this.trueExpr.precompile(compiler,typeReq) + this.falseExpr.precompile(compiler,typeReq) + 4;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.ip = this.condition.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);\n\t\tcontext.codeStream[context.ip++] = this.integer ? 7 : 6;\n\t\tlet jumpElseIp = context.ip++;\n\t\tcontext.ip = this.trueExpr.compile(compiler,context,typeReq);\n\t\tcontext.codeStream[context.ip++] = 12;\n\t\tlet jumpEndIp = context.ip++;\n\t\tcontext.codeStream[jumpElseIp] = context.ip;\n\t\tcontext.ip = this.falseExpr.compile(compiler,context,typeReq);\n\t\tcontext.codeStream[jumpEndIp] = context.ip;\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn this.trueExpr.getPrefferredType();\n\t}\n\tvisitStmt(visitor) {\n\t\tthis.condition.visitStmt(visitor);\n\t\tthis.trueExpr.visitStmt(visitor);\n\t\tthis.falseExpr.visitStmt(visitor);\n\t\tvisitor.visitConditionalExpr(this);\n\t}\n}\nexpr_ConditionalExpr.__name__ = true;\nexpr_ConditionalExpr.__super__ = expr_Expr;\nObject.assign(expr_ConditionalExpr.prototype, {\n\t__class__: expr_ConditionalExpr\n});\nclass expr_IntUnaryExpr extends expr_Expr {\n\tconstructor(expr,op) {\n\t\texpr_Stmt._hx_skip_constructor = true;\n\t\tsuper();\n\t\texpr_Stmt._hx_skip_constructor = false;\n\t\tthis._hx_constructor(expr,op);\n\t}\n\t_hx_constructor(expr,op) {\n\t\tthis.optimized = false;\n\t\tsuper._hx_constructor(expr.lineNo);\n\t\tthis.expr = expr;\n\t\tthis.op = op;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.op.lexeme + this.expr.print(indent,false)) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.precompile(compiler,typeReq);\n\t\t}\n\t\tthis.integer = true;\n\t\tlet prefType = this.expr.getPrefferredType();\n\t\tif(this.op.type == TokenType.Not && prefType == expr_TypeReq.ReqFloat || prefType == expr_TypeReq.ReqString) {\n\t\t\tthis.integer = false;\n\t\t}\n\t\tlet exprSize = this.expr.precompile(compiler,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\treturn exprSize + 2;\n\t\t} else {\n\t\t\treturn exprSize + 1;\n\t\t}\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.compile(compiler,context,typeReq);\n\t\t}\n\t\tcontext.ip = this.expr.compile(compiler,context,this.integer ? expr_TypeReq.ReqInt : expr_TypeReq.ReqFloat);\n\t\tif(this.op.type == TokenType.Not) {\n\t\t\tcontext.codeStream[context.ip++] = this.integer ? 24 : 25;\n\t\t} else if(this.op.type == TokenType.Tilde) {\n\t\t\tcontext.codeStream[context.ip++] = 26;\n\t\t}\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqInt;\n\t}\n\tvisitStmt(visitor) {\n\t\tif(this.optimized) {\n\t\t\tthis.optimizedExpr.visitStmt(visitor);\n\t\t} else {\n\t\t\tthis.expr.visitStmt(visitor);\n\t\t\tvisitor.visitIntUnaryExpr(this);\n\t\t}\n\t}\n}\nexpr_IntUnaryExpr.__name__ = true;\nexpr_IntUnaryExpr.__super__ = expr_Expr;\nObject.assign(expr_IntUnaryExpr.prototype, {\n\t__class__: expr_IntUnaryExpr\n});\nclass expr_FloatUnaryExpr extends expr_Expr {\n\tconstructor(expr,op) {\n\t\texpr_Stmt._hx_skip_constructor = true;\n\t\tsuper();\n\t\texpr_Stmt._hx_skip_constructor = false;\n\t\tthis._hx_constructor(expr,op);\n\t}\n\t_hx_constructor(expr,op) {\n\t\tthis.optimized = false;\n\t\tsuper._hx_constructor(expr.lineNo);\n\t\tthis.expr = expr;\n\t\tthis.op = op;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.op.lexeme + this.expr.print(indent,false)) + (isStmt ? \"\\n;\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.precompile(compiler,typeReq);\n\t\t}\n\t\tlet exprSize = this.expr.precompile(compiler,expr_TypeReq.ReqFloat);\n\t\tif(typeReq != expr_TypeReq.ReqFloat) {\n\t\t\treturn exprSize + 2;\n\t\t} else {\n\t\t\treturn exprSize + 1;\n\t\t}\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(this.optimized) {\n\t\t\treturn this.optimizedExpr.compile(compiler,context,typeReq);\n\t\t}\n\t\tcontext.ip = this.expr.compile(compiler,context,expr_TypeReq.ReqFloat);\n\t\tcontext.codeStream[context.ip++] = 35;\n\t\tif(typeReq != expr_TypeReq.ReqFloat) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqFloat,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqFloat;\n\t}\n\tvisitStmt(visitor) {\n\t\tif(this.optimized) {\n\t\t\tthis.optimizedExpr.visitStmt(visitor);\n\t\t} else {\n\t\t\tthis.expr.visitStmt(visitor);\n\t\t\tvisitor.visitFloatUnaryExpr(this);\n\t\t}\n\t}\n}\nexpr_FloatUnaryExpr.__name__ = true;\nexpr_FloatUnaryExpr.__super__ = expr_Expr;\nObject.assign(expr_FloatUnaryExpr.prototype, {\n\t__class__: expr_FloatUnaryExpr\n});\nvar expr_VarType = $hxEnums[\"expr.VarType\"] = { __ename__:true,__constructs__:null\n\t,Global: {_hx_name:\"Global\",_hx_index:0,__enum__:\"expr.VarType\",toString:$estr}\n\t,Local: {_hx_name:\"Local\",_hx_index:1,__enum__:\"expr.VarType\",toString:$estr}\n};\nexpr_VarType.__constructs__ = [expr_VarType.Global,expr_VarType.Local];\nclass expr_VarExpr extends expr_Expr {\n\tconstructor(name,arrayIndex,type) {\n\t\tsuper(name.line);\n\t\tthis.name = name;\n\t\tthis.arrayIndex = arrayIndex;\n\t\tthis.type = type;\n\t}\n\tprint(indent,isStmt) {\n\t\tlet str = (isStmt ? this.printIndent(indent) : \"\") + (\"\" + (this.type == expr_VarType.Global ? \"$\" : \"%\") + this.name.lexeme);\n\t\tif(this.arrayIndex != null) {\n\t\t\tstr += \"[\" + this.arrayIndex.print(indent,false) + \"]\";\n\t\t}\n\t\treturn str + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn 0;\n\t\t}\n\t\tcompiler.precompileIdent((this.type == expr_VarType.Global ? \"$\" : \"%\") + (this.name.literal == null ? \"null\" : Std.string(this.name.literal)));\n\t\tif(this.arrayIndex != null) {\n\t\t\treturn this.arrayIndex.precompile(compiler,expr_TypeReq.ReqString) + 6;\n\t\t} else {\n\t\t\treturn 3;\n\t\t}\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn 0;\n\t\t}\n\t\tcontext.codeStream[context.ip++] = this.arrayIndex != null ? 69 : 36;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent((this.type == expr_VarType.Global ? \"$\" : \"%\") + (this.name.literal == null ? \"null\" : Std.string(this.name.literal)),context.ip);\n\t\tcontext.ip++;\n\t\tif(this.arrayIndex != null) {\n\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t\tcontext.ip = this.arrayIndex.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 77;\n\t\t\tcontext.codeStream[context.ip++] = 38;\n\t\t}\n\t\tswitch(typeReq._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 40;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 41;\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tcontext.codeStream[context.ip++] = 42;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqNone;\n\t}\n\tvisitStmt(visitor) {\n\t\tif(this.arrayIndex != null) {\n\t\t\tthis.arrayIndex.visitStmt(visitor);\n\t\t}\n\t\tvisitor.visitVarExpr(this);\n\t}\n}\nexpr_VarExpr.__name__ = true;\nexpr_VarExpr.__super__ = expr_Expr;\nObject.assign(expr_VarExpr.prototype, {\n\t__class__: expr_VarExpr\n});\nclass expr_IntExpr extends expr_Expr {\n\tconstructor(lineNo,value) {\n\t\tsuper(lineNo);\n\t\tthis.value = value;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.value) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn 0;\n\t\t}\n\t\tif(typeReq == expr_TypeReq.ReqString) {\n\t\t\tthis.index = compiler.addIntString(this.value);\n\t\t} else if(typeReq == expr_TypeReq.ReqFloat) {\n\t\t\tthis.index = compiler.addFloat(this.value);\n\t\t}\n\t\treturn 2;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tswitch(typeReq._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 65;\n\t\t\tcontext.codeStream[context.ip++] = this.value;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 66;\n\t\t\tcontext.codeStream[context.ip++] = this.index;\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tcontext.codeStream[context.ip++] = 68;\n\t\t\tcontext.codeStream[context.ip++] = this.index;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqInt;\n\t}\n\tvisitStmt(visitor) {\n\t\tvisitor.visitIntExpr(this);\n\t}\n}\nexpr_IntExpr.__name__ = true;\nexpr_IntExpr.__super__ = expr_Expr;\nObject.assign(expr_IntExpr.prototype, {\n\t__class__: expr_IntExpr\n});\nclass expr_FloatExpr extends expr_Expr {\n\tconstructor(lineNo,value) {\n\t\tsuper(lineNo);\n\t\tthis.value = value;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.value) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn 0;\n\t\t}\n\t\tif(typeReq == expr_TypeReq.ReqString) {\n\t\t\tthis.index = compiler.addFloatString(this.value);\n\t\t} else if(typeReq == expr_TypeReq.ReqFloat) {\n\t\t\tthis.index = compiler.addFloat(this.value);\n\t\t}\n\t\treturn 2;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tswitch(typeReq._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 65;\n\t\t\tcontext.codeStream[context.ip++] = this.value;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 66;\n\t\t\tcontext.codeStream[context.ip++] = this.index;\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tcontext.codeStream[context.ip++] = 68;\n\t\t\tcontext.codeStream[context.ip++] = this.index;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqFloat;\n\t}\n\tvisitStmt(visitor) {\n\t\tvisitor.visitFloatExpr(this);\n\t}\n}\nexpr_FloatExpr.__name__ = true;\nexpr_FloatExpr.__super__ = expr_Expr;\nObject.assign(expr_FloatExpr.prototype, {\n\t__class__: expr_FloatExpr\n});\nclass expr_StringConstExpr extends expr_Expr {\n\tconstructor(lineNo,value,tag) {\n\t\tsuper(lineNo);\n\t\tthis.value = value;\n\t\tthis.tag = tag;\n\t}\n\tprint(indent,isStmt) {\n\t\tif(this.tag) {\n\t\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\'\" + this.value + \"\'\") + (isStmt ? \";\\n\" : \"\");\n\t\t}\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\\\"\" + this.value + \"\\\"\") + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqString) {\n\t\t\tthis.index = compiler.addString(this.value,true,this.tag);\n\t\t\treturn 2;\n\t\t} else if(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn 0;\n\t\t}\n\t\tthis.fVal = Compiler.stringToNumber(this.value);\n\t\tif(typeReq == expr_TypeReq.ReqFloat) {\n\t\t\tthis.index = compiler.addFloat(this.fVal);\n\t\t}\n\t\treturn 2;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tswitch(typeReq._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 65;\n\t\t\tcontext.codeStream[context.ip++] = this.fVal;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 66;\n\t\t\tcontext.codeStream[context.ip++] = this.index;\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tcontext.codeStream[context.ip++] = this.tag ? 67 : 68;\n\t\t\tcontext.codeStream[context.ip++] = this.index;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqString;\n\t}\n\tvisitStmt(visitor) {\n\t\tvisitor.visitStringConstExpr(this);\n\t}\n}\nexpr_StringConstExpr.__name__ = true;\nexpr_StringConstExpr.__super__ = expr_Expr;\nObject.assign(expr_StringConstExpr.prototype, {\n\t__class__: expr_StringConstExpr\n});\nclass expr_ConstantExpr extends expr_Expr {\n\tconstructor(name) {\n\t\tsuper(name.line);\n\t\tthis.name = name;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.name.lexeme) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqString) {\n\t\t\tcompiler.precompileIdent(this.name.literal);\n\t\t\treturn 2;\n\t\t} else if(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn 0;\n\t\t}\n\t\tthis.fVal = Compiler.stringToNumber(this.name.literal);\n\t\tif(typeReq == expr_TypeReq.ReqFloat) {\n\t\t\tthis.index = compiler.addFloat(this.fVal);\n\t\t}\n\t\treturn 2;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tswitch(typeReq._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 65;\n\t\t\tcontext.codeStream[context.ip++] = this.fVal;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 66;\n\t\t\tcontext.codeStream[context.ip++] = this.index;\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tcontext.codeStream[context.ip++] = 69;\n\t\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.name.literal,context.ip);\n\t\t\tcontext.ip++;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqString;\n\t}\n\tvisitStmt(visitor) {\n\t\tvisitor.visitConstantExpr(this);\n\t}\n}\nexpr_ConstantExpr.__name__ = true;\nexpr_ConstantExpr.__super__ = expr_Expr;\nObject.assign(expr_ConstantExpr.prototype, {\n\t__class__: expr_ConstantExpr\n});\nclass expr_AssignExpr extends expr_Expr {\n\tconstructor(varExpr,expr) {\n\t\tsuper(varExpr.lineNo);\n\t\tthis.varExpr = varExpr;\n\t\tthis.expr = expr;\n\t}\n\tprint(indent,isStmt) {\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.varExpr.print(indent,false) + \" = \" + this.expr.print(indent,false)) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tthis.subType = this.expr.getPrefferredType();\n\t\tif(this.subType == expr_TypeReq.ReqNone) {\n\t\t\tthis.subType = typeReq;\n\t\t}\n\t\tif(this.subType == expr_TypeReq.ReqNone) {\n\t\t\tthis.subType = expr_TypeReq.ReqString;\n\t\t}\n\t\tlet addSize = 0;\n\t\tif(typeReq != this.subType) {\n\t\t\taddSize = 1;\n\t\t}\n\t\tlet retSize = this.expr.precompile(compiler,this.subType);\n\t\tcompiler.precompileIdent((this.varExpr.type == expr_VarType.Global ? \"$\" : \"%\") + (this.varExpr.name.literal == null ? \"null\" : Std.string(this.varExpr.name.literal)));\n\t\tif(this.varExpr.arrayIndex != null) {\n\t\t\tif(this.subType == expr_TypeReq.ReqString) {\n\t\t\t\treturn this.varExpr.arrayIndex.precompile(compiler,expr_TypeReq.ReqString) + retSize + addSize + 8;\n\t\t\t} else {\n\t\t\t\treturn this.varExpr.arrayIndex.precompile(compiler,expr_TypeReq.ReqString) + retSize + addSize + 6;\n\t\t\t}\n\t\t} else {\n\t\t\treturn retSize + addSize + 3;\n\t\t}\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.ip = this.expr.compile(compiler,context,this.subType);\n\t\tif(this.varExpr.arrayIndex != null) {\n\t\t\tif(this.subType == expr_TypeReq.ReqString) {\n\t\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t\t}\n\t\t\tcontext.codeStream[context.ip++] = 69;\n\t\t\tcontext.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? \"$\" : \"%\") + (this.varExpr.name.literal == null ? \"null\" : Std.string(this.varExpr.name.literal)),context.ip);\n\t\t\tcontext.ip++;\n\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t\tcontext.ip = this.varExpr.arrayIndex.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 77;\n\t\t\tcontext.codeStream[context.ip++] = 39;\n\t\t\tif(this.subType == expr_TypeReq.ReqString) {\n\t\t\t\tcontext.codeStream[context.ip++] = 78;\n\t\t\t}\n\t\t} else {\n\t\t\tcontext.codeStream[context.ip++] = 37;\n\t\t\tcontext.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? \"$\" : \"%\") + (this.varExpr.name.literal == null ? \"null\" : Std.string(this.varExpr.name.literal)),context.ip);\n\t\t\tcontext.ip++;\n\t\t}\n\t\tswitch(this.subType._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 43;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 44;\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tcontext.codeStream[context.ip++] = 45;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\tif(typeReq != this.subType) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(this.subType,typeReq);\n\t\t}\n\t\treturn context.ip++;\n\t}\n\tgetPrefferredType() {\n\t\treturn this.expr.getPrefferredType();\n\t}\n\tvisitStmt(visitor) {\n\t\tthis.varExpr.visitStmt(visitor);\n\t\tthis.expr.visitStmt(visitor);\n\t\tvisitor.visitAssignExpr(this);\n\t}\n}\nexpr_AssignExpr.__name__ = true;\nexpr_AssignExpr.__super__ = expr_Expr;\nObject.assign(expr_AssignExpr.prototype, {\n\t__class__: expr_AssignExpr\n});\nclass expr_AssignOpExpr extends expr_Expr {\n\tconstructor(varExpr,expr,op) {\n\t\tsuper(varExpr.lineNo);\n\t\tthis.varExpr = varExpr;\n\t\tthis.expr = expr;\n\t\tthis.op = op;\n\t}\n\tgetAssignOpTypeOp() {\n\t\tswitch(this.op.type._hx_index) {\n\t\tcase 21:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 31;\n\t\t\tbreak;\n\t\tcase 22:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 32;\n\t\t\tbreak;\n\t\tcase 23:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 33;\n\t\t\tbreak;\n\t\tcase 24:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 23;\n\t\t\tbreak;\n\t\tcase 25:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 22;\n\t\t\tbreak;\n\t\tcase 26:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 20;\n\t\t\tbreak;\n\t\tcase 27:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 21;\n\t\t\tbreak;\n\t\tcase 28:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 34;\n\t\t\tbreak;\n\t\tcase 29:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 28;\n\t\t\tbreak;\n\t\tcase 30:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 27;\n\t\t\tbreak;\n\t\tcase 76:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 31;\n\t\t\tthis.expr = new expr_IntExpr(this.lineNo,1);\n\t\t\tbreak;\n\t\tcase 77:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 32;\n\t\t\tthis.expr = new expr_IntExpr(this.lineNo,1);\n\t\t\tbreak;\n\t\tdefault:\n\t\t\tthrow new haxe_Exception(\"Unknown assignment expression\");\n\t\t}\n\t}\n\tprint(indent,isStmt) {\n\t\tif(this.op.type == TokenType.PlusPlus || this.op.type == TokenType.MinusMinus) {\n\t\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.varExpr.print(indent,false) + this.op.lexeme) + (isStmt ? \";\\n\" : \"\");\n\t\t}\n\t\treturn (isStmt ? this.printIndent(indent) : \"\") + (\"\" + this.varExpr.print(indent,false) + \" \" + this.op.lexeme + \"= \" + this.expr.print(indent,false)) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tthis.getAssignOpTypeOp();\n\t\tcompiler.precompileIdent((this.varExpr.type == expr_VarType.Global ? \"$\" : \"%\") + (this.varExpr.name.literal == null ? \"null\" : Std.string(this.varExpr.name.literal)));\n\t\tlet size = this.expr.precompile(compiler,this.subType);\n\t\tif(typeReq != this.subType) {\n\t\t\t++size;\n\t\t}\n\t\tif(this.varExpr.arrayIndex == null) {\n\t\t\treturn size + 5;\n\t\t} else {\n\t\t\tsize += this.varExpr.arrayIndex.precompile(compiler,expr_TypeReq.ReqString);\n\t\t\treturn size + 8;\n\t\t}\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.ip = this.expr.compile(compiler,context,this.subType);\n\t\tif(this.varExpr.arrayIndex == null) {\n\t\t\tcontext.codeStream[context.ip++] = 37;\n\t\t\tcontext.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? \"$\" : \"%\") + (this.varExpr.name.literal == null ? \"null\" : Std.string(this.varExpr.name.literal)),context.ip);\n\t\t\tcontext.ip++;\n\t\t} else {\n\t\t\tcontext.codeStream[context.ip++] = 69;\n\t\t\tcontext.codeStream[context.ip] = compiler.compileIdent((this.varExpr.type == expr_VarType.Global ? \"$\" : \"%\") + (this.varExpr.name.literal == null ? \"null\" : Std.string(this.varExpr.name.literal)),context.ip);\n\t\t\tcontext.ip++;\n\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t\tcontext.ip = this.varExpr.arrayIndex.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 77;\n\t\t\tcontext.codeStream[context.ip++] = 39;\n\t\t}\n\t\tcontext.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 41 : 40;\n\t\tcontext.codeStream[context.ip++] = this.operand;\n\t\tcontext.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 44 : 43;\n\t\tif(typeReq != this.subType) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(this.subType,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\tthis.getAssignOpTypeOp();\n\t\treturn this.subType;\n\t}\n\tvisitStmt(visitor) {\n\t\tthis.getAssignOpTypeOp();\n\t\tthis.varExpr.visitStmt(visitor);\n\t\tthis.expr.visitStmt(visitor);\n\t\tvisitor.visitAssignOpExpr(this);\n\t}\n}\nexpr_AssignOpExpr.__name__ = true;\nexpr_AssignOpExpr.__super__ = expr_Expr;\nObject.assign(expr_AssignOpExpr.prototype, {\n\t__class__: expr_AssignOpExpr\n});\nclass expr_FuncCallExpr extends expr_Expr {\n\tconstructor(name,namespace,args,callType) {\n\t\tsuper(name.line);\n\t\tthis.name = name;\n\t\tthis.namespace = namespace;\n\t\tthis.args = args;\n\t\tthis.callType = callType;\n\t}\n\tprint(indent,isStmt) {\n\t\tif(this.callType == 0) {\n\t\t\tlet str = isStmt ? this.printIndent(indent) : \"\";\n\t\t\tif(this.namespace != null) {\n\t\t\t\tstr += this.namespace.lexeme + \"::\";\n\t\t\t}\n\t\t\tstr += this.name.lexeme + \"(\";\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = this.args.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tif(i > 0) {\n\t\t\t\t\tstr += \", \";\n\t\t\t\t}\n\t\t\t\tstr += this.args[i].print(indent,false);\n\t\t\t}\n\t\t\tstr += \")\";\n\t\t\treturn str + (isStmt ? \";\\n\" : \"\");\n\t\t} else if(this.callType == 1) {\n\t\t\tlet str = isStmt ? this.printIndent(indent) : \"\";\n\t\t\tstr += this.args[0].print(indent,false);\n\t\t\tstr += \".\" + this.name.lexeme + \"(\";\n\t\t\tlet _g = 1;\n\t\t\tlet _g1 = this.args.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tif(i > 1) {\n\t\t\t\t\tstr += \", \";\n\t\t\t\t}\n\t\t\t\tstr += this.args[i].print(indent,false);\n\t\t\t}\n\t\t\tstr += \")\";\n\t\t\treturn str + (isStmt ? \";\\n\" : \"\");\n\t\t} else {\n\t\t\tlet str = isStmt ? this.printIndent(indent) : \"\";\n\t\t\tstr += \"Parent::\";\n\t\t\tstr += this.name.lexeme + \"(\";\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = this.args.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tif(i > 0) {\n\t\t\t\t\tstr += \", \";\n\t\t\t\t}\n\t\t\t\tstr += this.args[i].print(indent,false);\n\t\t\t}\n\t\t\tstr += \")\";\n\t\t\treturn str + (isStmt ? \";\\n\" : \"\");\n\t\t}\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tlet size = 0;\n\t\tif(typeReq != expr_TypeReq.ReqString) {\n\t\t\t++size;\n\t\t}\n\t\tcompiler.precompileIdent(this.name.literal);\n\t\tcompiler.precompileIdent(this.namespace != null ? this.namespace.literal : null);\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tsize += this.args[i].precompile(compiler,expr_TypeReq.ReqString) + 1;\n\t\t}\n\t\treturn size + 5;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.codeStream[context.ip++] = 81;\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet expr = _g1[_g];\n\t\t\t++_g;\n\t\t\tcontext.ip = expr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 80;\n\t\t}\n\t\tif(this.callType == 1 || this.callType == 2) {\n\t\t\tcontext.codeStream[context.ip++] = 71;\n\t\t} else {\n\t\t\tcontext.codeStream[context.ip++] = 70;\n\t\t}\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.name.literal,context.ip);\n\t\tcontext.ip++;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.namespace != null ? this.namespace.literal : null,context.ip);\n\t\tcontext.ip++;\n\t\tcontext.codeStream[context.ip++] = this.callType;\n\t\tif(typeReq != expr_TypeReq.ReqString) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqString,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqString;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tthis.args[i].visitStmt(optimizerPass);\n\t\t}\n\t\toptimizerPass.visitFuncCallExpr(this);\n\t}\n}\nexpr_FuncCallExpr.__name__ = true;\nexpr_FuncCallExpr.__super__ = expr_Expr;\nObject.assign(expr_FuncCallExpr.prototype, {\n\t__class__: expr_FuncCallExpr\n});\nclass expr_SlotAccessExpr extends expr_Expr {\n\tconstructor(objectExpr,arrayExpr,slotName) {\n\t\tsuper(objectExpr.lineNo);\n\t\tthis.objectExpr = objectExpr;\n\t\tthis.arrayExpr = arrayExpr;\n\t\tthis.slotName = slotName;\n\t}\n\tprint(indent,isStmt) {\n\t\tlet str = (isStmt ? this.printIndent(indent) : \"\") + this.objectExpr.print(indent,false) + \".\" + this.slotName.lexeme;\n\t\tif(this.arrayExpr != null) {\n\t\t\tstr += \"[\" + this.arrayExpr.print(indent,false) + \"]\";\n\t\t}\n\t\treturn str + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn 0;\n\t\t}\n\t\tlet size = 0;\n\t\tcompiler.precompileIdent(this.slotName.literal);\n\t\tif(this.arrayExpr != null) {\n\t\t\tsize += 3 + this.arrayExpr.precompile(compiler,expr_TypeReq.ReqString);\n\t\t}\n\t\tsize += this.objectExpr.precompile(compiler,expr_TypeReq.ReqString) + 3;\n\t\treturn size + 1;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tif(typeReq == expr_TypeReq.ReqNone) {\n\t\t\treturn context.ip;\n\t\t}\n\t\tif(this.arrayExpr != null) {\n\t\t\tcontext.ip = this.arrayExpr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t}\n\t\tcontext.ip = this.objectExpr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 46;\n\t\tcontext.codeStream[context.ip++] = 48;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.slotName.literal,context.ip);\n\t\tcontext.ip++;\n\t\tif(this.arrayExpr != null) {\n\t\t\tcontext.codeStream[context.ip++] = 78;\n\t\t\tcontext.codeStream[context.ip++] = 49;\n\t\t}\n\t\tswitch(typeReq._hx_index) {\n\t\tcase 1:\n\t\t\tcontext.codeStream[context.ip++] = 50;\n\t\t\tbreak;\n\t\tcase 2:\n\t\t\tcontext.codeStream[context.ip++] = 51;\n\t\t\tbreak;\n\t\tcase 3:\n\t\t\tcontext.codeStream[context.ip++] = 52;\n\t\t\tbreak;\n\t\tdefault:\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqNone;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tthis.objectExpr.visitStmt(optimizerPass);\n\t\tif(this.arrayExpr != null) {\n\t\t\tthis.arrayExpr.visitStmt(optimizerPass);\n\t\t}\n\t\toptimizerPass.visitSlotAccessExpr(this);\n\t}\n}\nexpr_SlotAccessExpr.__name__ = true;\nexpr_SlotAccessExpr.__super__ = expr_Expr;\nObject.assign(expr_SlotAccessExpr.prototype, {\n\t__class__: expr_SlotAccessExpr\n});\nclass expr_SlotAssignExpr extends expr_Expr {\n\tconstructor(objectExpr,arrayExpr,slotName,expr) {\n\t\tsuper(slotName.line);\n\t\tthis.objectExpr = objectExpr;\n\t\tthis.arrayExpr = arrayExpr;\n\t\tthis.slotName = slotName;\n\t\tthis.expr = expr;\n\t}\n\tprint(indent,isStmt) {\n\t\tlet str = (isStmt ? this.printIndent(indent) : \"\") + (this.objectExpr != null ? this.objectExpr.print(indent,false) + \".\" : \"\") + this.slotName.lexeme;\n\t\tif(this.arrayExpr != null) {\n\t\t\tstr += \"[\" + this.arrayExpr.print(indent,false) + \"]\";\n\t\t}\n\t\treturn str + \" = \" + this.expr.print(indent,false) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tlet size = 0;\n\t\tif(typeReq != expr_TypeReq.ReqString) {\n\t\t\t++size;\n\t\t}\n\t\tcompiler.precompileIdent(this.slotName.literal);\n\t\tsize += this.expr.precompile(compiler,expr_TypeReq.ReqString);\n\t\tif(this.objectExpr != null) {\n\t\t\tsize += this.objectExpr.precompile(compiler,expr_TypeReq.ReqString) + 5;\n\t\t} else {\n\t\t\tsize += 5;\n\t\t}\n\t\tif(this.arrayExpr != null) {\n\t\t\tsize += this.arrayExpr.precompile(compiler,expr_TypeReq.ReqString) + 3;\n\t\t}\n\t\treturn size + 1;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.ip = this.expr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 73;\n\t\tif(this.arrayExpr != null) {\n\t\t\tcontext.ip = this.arrayExpr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t}\n\t\tif(this.objectExpr != null) {\n\t\t\tcontext.ip = this.objectExpr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 46;\n\t\t} else {\n\t\t\tcontext.codeStream[context.ip++] = 47;\n\t\t}\n\t\tcontext.codeStream[context.ip++] = 48;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.slotName.literal,context.ip);\n\t\tcontext.ip++;\n\t\tif(this.arrayExpr != null) {\n\t\t\tcontext.codeStream[context.ip++] = 78;\n\t\t\tcontext.codeStream[context.ip++] = 49;\n\t\t}\n\t\tcontext.codeStream[context.ip++] = 78;\n\t\tcontext.codeStream[context.ip++] = 55;\n\t\tif(typeReq != expr_TypeReq.ReqString) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqString,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqString;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tif(this.objectExpr != null) {\n\t\t\tthis.objectExpr.visitStmt(optimizerPass);\n\t\t}\n\t\tif(this.arrayExpr != null) {\n\t\t\tthis.arrayExpr.visitStmt(optimizerPass);\n\t\t}\n\t\tthis.expr.visitStmt(optimizerPass);\n\t\toptimizerPass.visitSlotAssignExpr(this);\n\t}\n}\nexpr_SlotAssignExpr.__name__ = true;\nexpr_SlotAssignExpr.__super__ = expr_Expr;\nObject.assign(expr_SlotAssignExpr.prototype, {\n\t__class__: expr_SlotAssignExpr\n});\nclass expr_SlotAssignOpExpr extends expr_Expr {\n\tconstructor(objectExpr,arrayExpr,slotName,expr,op) {\n\t\tsuper(objectExpr.lineNo);\n\t\tthis.objectExpr = objectExpr;\n\t\tthis.arrayExpr = arrayExpr;\n\t\tthis.slotName = slotName;\n\t\tthis.expr = expr;\n\t\tthis.op = op;\n\t}\n\tgetAssignOpTypeOp() {\n\t\tswitch(this.op.type._hx_index) {\n\t\tcase 21:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 31;\n\t\t\tbreak;\n\t\tcase 22:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 32;\n\t\t\tbreak;\n\t\tcase 23:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 33;\n\t\t\tbreak;\n\t\tcase 24:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 23;\n\t\t\tbreak;\n\t\tcase 25:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 22;\n\t\t\tbreak;\n\t\tcase 26:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 20;\n\t\t\tbreak;\n\t\tcase 27:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 21;\n\t\t\tbreak;\n\t\tcase 28:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 34;\n\t\t\tbreak;\n\t\tcase 29:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 28;\n\t\t\tbreak;\n\t\tcase 30:\n\t\t\tthis.subType = expr_TypeReq.ReqInt;\n\t\t\tthis.operand = 27;\n\t\t\tbreak;\n\t\tcase 76:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 31;\n\t\t\tthis.expr = new expr_IntExpr(this.lineNo,1);\n\t\t\tbreak;\n\t\tcase 77:\n\t\t\tthis.subType = expr_TypeReq.ReqFloat;\n\t\t\tthis.operand = 32;\n\t\t\tthis.expr = new expr_IntExpr(this.lineNo,1);\n\t\t\tbreak;\n\t\tdefault:\n\t\t\tthrow new haxe_Exception(\"Unknown assignment expression\");\n\t\t}\n\t}\n\tprint(indent,isStmt) {\n\t\tlet str = (isStmt ? this.printIndent(indent) : \"\") + this.objectExpr.print(indent,false) + \".\" + this.slotName.lexeme;\n\t\tif(this.arrayExpr != null) {\n\t\t\tstr += \"[\" + this.arrayExpr.print(indent,false) + \"]\";\n\t\t}\n\t\tif(this.op.type == TokenType.PlusPlus || this.op.type == TokenType.MinusMinus) {\n\t\t\treturn str + (\"\" + this.op.lexeme) + (isStmt ? \";\\n\" : \"\");\n\t\t}\n\t\treturn str + (\" \" + this.op.lexeme + \"= \") + this.expr.print(indent,false) + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tthis.getAssignOpTypeOp();\n\t\tcompiler.precompileIdent(this.slotName.literal);\n\t\tlet size = this.expr.precompile(compiler,this.subType);\n\t\tif(typeReq != this.subType) {\n\t\t\t++size;\n\t\t}\n\t\tif(this.arrayExpr != null) {\n\t\t\treturn size + 9 + this.arrayExpr.precompile(compiler,expr_TypeReq.ReqString) + this.objectExpr.precompile(compiler,expr_TypeReq.ReqString);\n\t\t} else {\n\t\t\treturn size + 6 + this.objectExpr.precompile(compiler,expr_TypeReq.ReqString);\n\t\t}\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.ip = this.expr.compile(compiler,context,this.subType);\n\t\tif(this.arrayExpr != null) {\n\t\t\tcontext.ip = this.arrayExpr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 73;\n\t\t}\n\t\tcontext.ip = this.objectExpr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 46;\n\t\tcontext.codeStream[context.ip++] = 48;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.slotName.literal,context.ip);\n\t\tcontext.ip++;\n\t\tif(this.arrayExpr != null) {\n\t\t\tcontext.codeStream[context.ip++] = 78;\n\t\t\tcontext.codeStream[context.ip++] = 49;\n\t\t}\n\t\tcontext.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 51 : 50;\n\t\tcontext.codeStream[context.ip++] = this.operand;\n\t\tcontext.codeStream[context.ip++] = this.subType == expr_TypeReq.ReqFloat ? 54 : 53;\n\t\tif(typeReq != this.subType) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(this.subType,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\tthis.getAssignOpTypeOp();\n\t\treturn this.subType;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tthis.getAssignOpTypeOp();\n\t\tif(this.objectExpr != null) {\n\t\t\tthis.objectExpr.visitStmt(optimizerPass);\n\t\t}\n\t\tif(this.arrayExpr != null) {\n\t\t\tthis.arrayExpr.visitStmt(optimizerPass);\n\t\t}\n\t\tthis.expr.visitStmt(optimizerPass);\n\t\toptimizerPass.visitSlotAssignOpExpr(this);\n\t}\n}\nexpr_SlotAssignOpExpr.__name__ = true;\nexpr_SlotAssignOpExpr.__super__ = expr_Expr;\nObject.assign(expr_SlotAssignOpExpr.prototype, {\n\t__class__: expr_SlotAssignOpExpr\n});\nclass expr_ObjectDeclExpr extends expr_Expr {\n\tconstructor(className,parentObject,objectNameExpr,args,slotDecls,subObjects,structDecl) {\n\t\texpr_Stmt._hx_skip_constructor = true;\n\t\tsuper();\n\t\texpr_Stmt._hx_skip_constructor = false;\n\t\tthis._hx_constructor(className,parentObject,objectNameExpr,args,slotDecls,subObjects,structDecl);\n\t}\n\t_hx_constructor(className,parentObject,objectNameExpr,args,slotDecls,subObjects,structDecl) {\n\t\tthis.structDecl = false;\n\t\tsuper._hx_constructor(className.lineNo);\n\t\tthis.className = className;\n\t\tthis.parentObject = parentObject;\n\t\tthis.objectNameExpr = objectNameExpr != null ? objectNameExpr : new expr_StringConstExpr(this.lineNo,\"\",false);\n\t\tthis.args = args;\n\t\tthis.slotDecls = slotDecls;\n\t\tthis.subObjects = subObjects;\n\t\tthis.structDecl = structDecl;\n\t}\n\tprint(indent,isStmt) {\n\t\tlet objStr = (isStmt ? this.printIndent(indent) : \"\") + (this.structDecl ? \"datablock \" : \"new \");\n\t\tobjStr += this.className.print(indent,false) + \"(\";\n\t\tif(this.objectNameExpr != null) {\n\t\t\tobjStr += this.objectNameExpr.print(indent,false);\n\t\t}\n\t\tif(this.parentObject != null) {\n\t\t\tobjStr += \" : \" + this.parentObject.lexeme;\n\t\t}\n\t\tif(this.args.length > 0) {\n\t\t\tobjStr += \",\";\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = this.args.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tobjStr += this.args[i].print(indent,false);\n\t\t\t\tif(i < this.args.length - 1) {\n\t\t\t\t\tobjStr += \",\";\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tobjStr += \")\";\n\t\tif(this.slotDecls.length != 0 || this.subObjects.length != 0) {\n\t\t\tobjStr += \" {\\n\";\n\t\t}\n\t\tlet _g = 0;\n\t\tlet _g1 = this.slotDecls.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tobjStr += this.slotDecls[i].print(indent + 1,true);\n\t\t}\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.subObjects.length;\n\t\twhile(_g2 < _g3) {\n\t\t\tlet i = _g2++;\n\t\t\tobjStr += this.subObjects[i].print(indent + 1,true);\n\t\t}\n\t\tif(this.slotDecls.length != 0 || this.subObjects.length != 0) {\n\t\t\tobjStr += this.printIndent(indent) + \"}\\n\";\n\t\t}\n\t\treturn objStr + (isStmt ? \";\\n\" : \"\");\n\t}\n\tprecompileSubObject(compiler,typeReq) {\n\t\tlet argSize = 0;\n\t\tcompiler.precompileIdent(this.parentObject == null ? null : this.parentObject.literal);\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet expr = _g1[_g];\n\t\t\t++_g;\n\t\t\targSize += expr.precompile(compiler,expr_TypeReq.ReqString) + 1;\n\t\t}\n\t\targSize += this.className.precompile(compiler,expr_TypeReq.ReqString) + 1;\n\t\tlet nameSize = this.objectNameExpr.precompile(compiler,expr_TypeReq.ReqString);\n\t\tlet slotSize = 0;\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.slotDecls;\n\t\twhile(_g2 < _g3.length) {\n\t\t\tlet slot = _g3[_g2];\n\t\t\t++_g2;\n\t\t\tslotSize += slot.precompile(compiler,expr_TypeReq.ReqNone);\n\t\t}\n\t\tlet subObjSize = 0;\n\t\tlet _g4 = 0;\n\t\tlet _g5 = this.subObjects;\n\t\twhile(_g4 < _g5.length) {\n\t\t\tlet subObj = _g5[_g4];\n\t\t\t++_g4;\n\t\t\tsubObjSize += subObj.precompileSubObject(compiler,expr_TypeReq.ReqNone);\n\t\t}\n\t\tthis.failOffset = 10 + nameSize + argSize + slotSize + subObjSize;\n\t\treturn this.failOffset;\n\t}\n\tcompileSubObject(compiler,context,typeReq,root) {\n\t\tlet start = context.ip;\n\t\tcontext.codeStream[context.ip++] = 81;\n\t\tcontext.ip = this.className.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 80;\n\t\tcontext.ip = this.objectNameExpr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\tcontext.codeStream[context.ip++] = 80;\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet expr = _g1[_g];\n\t\t\t++_g;\n\t\t\tcontext.ip = expr.compile(compiler,context,expr_TypeReq.ReqString);\n\t\t\tcontext.codeStream[context.ip++] = 80;\n\t\t}\n\t\tcontext.codeStream[context.ip++] = 1;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.parentObject != null ? this.parentObject.literal : null,context.ip);\n\t\tcontext.ip++;\n\t\tcontext.codeStream[context.ip++] = this.structDecl ? 1 : 0;\n\t\tcontext.codeStream[context.ip++] = start + this.failOffset;\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.slotDecls;\n\t\twhile(_g2 < _g3.length) {\n\t\t\tlet slot = _g3[_g2];\n\t\t\t++_g2;\n\t\t\tcontext.ip = slot.compile(compiler,context,expr_TypeReq.ReqNone);\n\t\t}\n\t\tcontext.codeStream[context.ip++] = 4;\n\t\tcontext.codeStream[context.ip++] = root ? 1 : 0;\n\t\tlet _g4 = 0;\n\t\tlet _g5 = this.subObjects;\n\t\twhile(_g4 < _g5.length) {\n\t\t\tlet subObj = _g5[_g4];\n\t\t\t++_g4;\n\t\t\tcontext.ip = subObj.compileSubObject(compiler,context,expr_TypeReq.ReqNone,false);\n\t\t}\n\t\tcontext.codeStream[context.ip++] = 5;\n\t\tcontext.codeStream[context.ip++] = root || this.structDecl ? 1 : 0;\n\t\treturn context.ip;\n\t}\n\tprecompile(compiler,typeReq) {\n\t\tlet ret = 2 + this.precompileSubObject(compiler,expr_TypeReq.ReqNone);\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\treturn ret + 1;\n\t\t}\n\t\treturn ret;\n\t}\n\tcompile(compiler,context,typeReq) {\n\t\tcontext.codeStream[context.ip++] = 65;\n\t\tcontext.codeStream[context.ip++] = 0;\n\t\tcontext.ip = this.compileSubObject(compiler,context,expr_TypeReq.ReqInt,true);\n\t\tif(typeReq != expr_TypeReq.ReqInt) {\n\t\t\tcontext.codeStream[context.ip++] = expr_Expr.conversionOp(expr_TypeReq.ReqInt,typeReq);\n\t\t}\n\t\treturn context.ip;\n\t}\n\tgetPrefferredType() {\n\t\treturn expr_TypeReq.ReqInt;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\tthis.className.visitStmt(optimizerPass);\n\t\tthis.objectNameExpr.visitStmt(optimizerPass);\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet arg = _g1[_g];\n\t\t\t++_g;\n\t\t\targ.visitStmt(optimizerPass);\n\t\t}\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.slotDecls;\n\t\twhile(_g2 < _g3.length) {\n\t\t\tlet slot = _g3[_g2];\n\t\t\t++_g2;\n\t\t\tslot.visitStmt(optimizerPass);\n\t\t}\n\t\tlet _g4 = 0;\n\t\tlet _g5 = this.subObjects;\n\t\twhile(_g4 < _g5.length) {\n\t\t\tlet subObj = _g5[_g4];\n\t\t\t++_g4;\n\t\t\tsubObj.visitStmt(optimizerPass);\n\t\t}\n\t\toptimizerPass.visitObjectDeclExpr(this);\n\t}\n}\nexpr_ObjectDeclExpr.__name__ = true;\nexpr_ObjectDeclExpr.__super__ = expr_Expr;\nObject.assign(expr_ObjectDeclExpr.prototype, {\n\t__class__: expr_ObjectDeclExpr\n});\nclass expr_FunctionDeclStmt extends expr_Stmt {\n\tconstructor(functionName,args,stmts,namespace) {\n\t\tsuper(functionName.line);\n\t\tthis.functionName = functionName;\n\t\tthis.args = args;\n\t\tthis.stmts = stmts;\n\t\tthis.namespace = namespace;\n\t}\n\tprint(indent,isStmt) {\n\t\tlet fnBegin = this.printIndent(indent) + \"function \";\n\t\tif(this.namespace != null) {\n\t\t\tfnBegin += this.namespace.lexeme + \"::\";\n\t\t}\n\t\tfnBegin += this.functionName.lexeme + \"(\";\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tif(i > 0) {\n\t\t\t\tfnBegin += \", \";\n\t\t\t}\n\t\t\tfnBegin += this.args[i].print(indent,false);\n\t\t}\n\t\tfnBegin += \") {\\n\";\n\t\tfnBegin += expr_Stmt.printBlock(this.stmts,indent + 1);\n\t\tfnBegin += this.printIndent(indent) + \"}\\n\";\n\t\treturn fnBegin;\n\t}\n\tprecompileStmt(compiler,loopCount) {\n\t\tcompiler.setTable(ConstTable.StringTable,ConstTableType.Function);\n\t\tcompiler.setTable(ConstTable.FloatTable,ConstTableType.Function);\n\t\tthis.argc = this.args.length;\n\t\tcompiler.inFunction = true;\n\t\tcompiler.precompileIdent(this.functionName.literal);\n\t\tcompiler.precompileIdent(this.namespace != null ? this.namespace.literal : null);\n\t\tcompiler.precompileIdent(this.packageName != null ? this.packageName.literal : null);\n\t\tlet subSize = expr_Stmt.precompileBlock(compiler,this.stmts,0);\n\t\tcompiler.inFunction = false;\n\t\tcompiler.setTable(ConstTable.StringTable,ConstTableType.Global);\n\t\tcompiler.setTable(ConstTable.FloatTable,ConstTableType.Global);\n\t\tthis.endOffset = this.argc + subSize + 8;\n\t\treturn this.endOffset;\n\t}\n\tcompileStmt(compiler,context) {\n\t\tlet start = context.ip;\n\t\tcontext.codeStream[context.ip++] = 0;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.functionName.literal,context.ip);\n\t\tcontext.ip++;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.namespace != null ? this.namespace.literal : null,context.ip);\n\t\tcontext.ip++;\n\t\tcontext.codeStream[context.ip] = compiler.compileIdent(this.packageName != null ? this.packageName.literal : null,context.ip);\n\t\tcontext.ip++;\n\t\tcontext.codeStream[context.ip++] = this.stmts.length != 0 ? 1 : 0;\n\t\tcontext.codeStream[context.ip++] = start + this.endOffset;\n\t\tcontext.codeStream[context.ip++] = this.argc;\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet arg = _g1[_g];\n\t\t\t++_g;\n\t\t\tcontext.codeStream[context.ip] = compiler.compileIdent((arg.type == expr_VarType.Global ? \"$\" : \"%\") + (arg.name.literal == null ? \"null\" : Std.string(arg.name.literal)),context.ip);\n\t\t\tcontext.ip++;\n\t\t}\n\t\tcompiler.inFunction = true;\n\t\tlet bp = context.breakPoint;\n\t\tlet cp = context.continuePoint;\n\t\tcontext.breakPoint = 0;\n\t\tcontext.continuePoint = 0;\n\t\tcontext.ip = expr_Stmt.compileBlock(compiler,context,this.stmts);\n\t\tcontext.breakPoint = bp;\n\t\tcontext.continuePoint = cp;\n\t\tcompiler.inFunction = false;\n\t\tcontext.codeStream[context.ip++] = 13;\n\t\treturn context.ip;\n\t}\n\tvisitStmt(optimizerPass) {\n\t\toptimizerPass.visitFunctionDeclStmt(this);\n\t\tlet _g = 0;\n\t\tlet _g1 = this.args;\n\t\twhile(_g < _g1.length) {\n\t\t\tlet arg = _g1[_g];\n\t\t\t++_g;\n\t\t\targ.visitStmt(optimizerPass);\n\t\t}\n\t\tlet _g2 = 0;\n\t\tlet _g3 = this.stmts;\n\t\twhile(_g2 < _g3.length) {\n\t\t\tlet stmt = _g3[_g2];\n\t\t\t++_g2;\n\t\t\tstmt.visitStmt(optimizerPass);\n\t\t}\n\t}\n}\nexpr_FunctionDeclStmt.__name__ = true;\nexpr_FunctionDeclStmt.__super__ = expr_Stmt;\nObject.assign(expr_FunctionDeclStmt.prototype, {\n\t__class__: expr_FunctionDeclStmt\n});\nclass haxe_IMap {\n}\nhaxe_IMap.__name__ = true;\nhaxe_IMap.__isInterface__ = true;\nObject.assign(haxe_IMap.prototype, {\n\t__class__: haxe_IMap\n});\nclass haxe_EntryPoint {\n\tstatic processEvents() {\n\t\twhile(true) {\n\t\t\tlet f = haxe_EntryPoint.pending.shift();\n\t\t\tif(f == null) {\n\t\t\t\tbreak;\n\t\t\t}\n\t\t\tf();\n\t\t}\n\t\tlet time = haxe_MainLoop.tick();\n\t\tif(!haxe_MainLoop.hasEvents() && haxe_EntryPoint.threadCount == 0) {\n\t\t\treturn -1;\n\t\t}\n\t\treturn time;\n\t}\n\tstatic run() {\n\t\tlet nextTick = haxe_EntryPoint.processEvents();\n\t\tif(typeof(window) != \"undefined\") {\n\t\t\tlet $window = window;\n\t\t\tlet rqf = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame;\n\t\t\tif(rqf != null) {\n\t\t\t\trqf(haxe_EntryPoint.run);\n\t\t\t} else if(nextTick >= 0) {\n\t\t\t\tsetTimeout(haxe_EntryPoint.run,nextTick * 1000);\n\t\t\t}\n\t\t} else if(nextTick >= 0) {\n\t\t\tsetTimeout(haxe_EntryPoint.run,nextTick * 1000);\n\t\t}\n\t}\n}\nhaxe_EntryPoint.__name__ = true;\nclass haxe_MainEvent {\n\tconstructor(f,p) {\n\t\tthis.isBlocking = true;\n\t\tthis.f = f;\n\t\tthis.priority = p;\n\t\tthis.nextRun = -Infinity;\n\t}\n}\nhaxe_MainEvent.__name__ = true;\nObject.assign(haxe_MainEvent.prototype, {\n\t__class__: haxe_MainEvent\n});\nclass haxe_MainLoop {\n\tstatic hasEvents() {\n\t\tlet p = haxe_MainLoop.pending;\n\t\twhile(p != null) {\n\t\t\tif(p.isBlocking) {\n\t\t\t\treturn true;\n\t\t\t}\n\t\t\tp = p.next;\n\t\t}\n\t\treturn false;\n\t}\n\tstatic sortEvents() {\n\t\tlet list = haxe_MainLoop.pending;\n\t\tif(list == null) {\n\t\t\treturn;\n\t\t}\n\t\tlet insize = 1;\n\t\tlet nmerges;\n\t\tlet psize = 0;\n\t\tlet qsize = 0;\n\t\tlet p;\n\t\tlet q;\n\t\tlet e;\n\t\tlet tail;\n\t\twhile(true) {\n\t\t\tp = list;\n\t\t\tlist = null;\n\t\t\ttail = null;\n\t\t\tnmerges = 0;\n\t\t\twhile(p != null) {\n\t\t\t\t++nmerges;\n\t\t\t\tq = p;\n\t\t\t\tpsize = 0;\n\t\t\t\tlet _g = 0;\n\t\t\t\tlet _g1 = insize;\n\t\t\t\twhile(_g < _g1) {\n\t\t\t\t\tlet i = _g++;\n\t\t\t\t\t++psize;\n\t\t\t\t\tq = q.next;\n\t\t\t\t\tif(q == null) {\n\t\t\t\t\t\tbreak;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tqsize = insize;\n\t\t\t\twhile(psize > 0 || qsize > 0 && q != null) {\n\t\t\t\t\tif(psize == 0) {\n\t\t\t\t\t\te = q;\n\t\t\t\t\t\tq = q.next;\n\t\t\t\t\t\t--qsize;\n\t\t\t\t\t} else if(qsize == 0 || q == null || (p.priority > q.priority || p.priority == q.priority && p.nextRun <= q.nextRun)) {\n\t\t\t\t\t\te = p;\n\t\t\t\t\t\tp = p.next;\n\t\t\t\t\t\t--psize;\n\t\t\t\t\t} else {\n\t\t\t\t\t\te = q;\n\t\t\t\t\t\tq = q.next;\n\t\t\t\t\t\t--qsize;\n\t\t\t\t\t}\n\t\t\t\t\tif(tail != null) {\n\t\t\t\t\t\ttail.next = e;\n\t\t\t\t\t} else {\n\t\t\t\t\t\tlist = e;\n\t\t\t\t\t}\n\t\t\t\t\te.prev = tail;\n\t\t\t\t\ttail = e;\n\t\t\t\t}\n\t\t\t\tp = q;\n\t\t\t}\n\t\t\ttail.next = null;\n\t\t\tif(nmerges <= 1) {\n\t\t\t\tbreak;\n\t\t\t}\n\t\t\tinsize *= 2;\n\t\t}\n\t\tlist.prev = null;\n\t\thaxe_MainLoop.pending = list;\n\t}\n\tstatic tick() {\n\t\thaxe_MainLoop.sortEvents();\n\t\tlet e = haxe_MainLoop.pending;\n\t\tlet now = HxOverrides.now() / 1000;\n\t\tlet wait = 1e9;\n\t\twhile(e != null) {\n\t\t\tlet next = e.next;\n\t\t\tlet wt = e.nextRun - now;\n\t\t\tif(wt <= 0) {\n\t\t\t\twait = 0;\n\t\t\t\tif(e.f != null) {\n\t\t\t\t\te.f();\n\t\t\t\t}\n\t\t\t} else if(wait > wt) {\n\t\t\t\twait = wt;\n\t\t\t}\n\t\t\te = next;\n\t\t}\n\t\treturn wait;\n\t}\n}\nhaxe_MainLoop.__name__ = true;\nclass haxe_ValueException extends haxe_Exception {\n\tconstructor(value,previous,native) {\n\t\tsuper(String(value),previous,native);\n\t\tthis.value = value;\n\t}\n}\nhaxe_ValueException.__name__ = true;\nhaxe_ValueException.__super__ = haxe_Exception;\nObject.assign(haxe_ValueException.prototype, {\n\t__class__: haxe_ValueException\n});\nclass haxe_ds_BalancedTree {\n\tconstructor() {\n\t}\n\tset(key,value) {\n\t\tthis.root = this.setLoop(key,value,this.root);\n\t}\n\tget(key) {\n\t\tlet node = this.root;\n\t\twhile(node != null) {\n\t\t\tlet c = this.compare(key,node.key);\n\t\t\tif(c == 0) {\n\t\t\t\treturn node.value;\n\t\t\t}\n\t\t\tif(c < 0) {\n\t\t\t\tnode = node.left;\n\t\t\t} else {\n\t\t\t\tnode = node.right;\n\t\t\t}\n\t\t}\n\t\treturn null;\n\t}\n\tkeys() {\n\t\tlet ret = [];\n\t\tthis.keysLoop(this.root,ret);\n\t\treturn new haxe_iterators_ArrayIterator(ret);\n\t}\n\tsetLoop(k,v,node) {\n\t\tif(node == null) {\n\t\t\treturn new haxe_ds_TreeNode(null,k,v,null);\n\t\t}\n\t\tlet c = this.compare(k,node.key);\n\t\tif(c == 0) {\n\t\t\treturn new haxe_ds_TreeNode(node.left,k,v,node.right,node == null ? 0 : node._height);\n\t\t} else if(c < 0) {\n\t\t\tlet nl = this.setLoop(k,v,node.left);\n\t\t\treturn this.balance(nl,node.key,node.value,node.right);\n\t\t} else {\n\t\t\tlet nr = this.setLoop(k,v,node.right);\n\t\t\treturn this.balance(node.left,node.key,node.value,nr);\n\t\t}\n\t}\n\tkeysLoop(node,acc) {\n\t\tif(node != null) {\n\t\t\tthis.keysLoop(node.left,acc);\n\t\t\tacc.push(node.key);\n\t\t\tthis.keysLoop(node.right,acc);\n\t\t}\n\t}\n\tbalance(l,k,v,r) {\n\t\tlet hl = l == null ? 0 : l._height;\n\t\tlet hr = r == null ? 0 : r._height;\n\t\tif(hl > hr + 2) {\n\t\t\tlet _this = l.left;\n\t\t\tlet _this1 = l.right;\n\t\t\tif((_this == null ? 0 : _this._height) >= (_this1 == null ? 0 : _this1._height)) {\n\t\t\t\treturn new haxe_ds_TreeNode(l.left,l.key,l.value,new haxe_ds_TreeNode(l.right,k,v,r));\n\t\t\t} else {\n\t\t\t\treturn new haxe_ds_TreeNode(new haxe_ds_TreeNode(l.left,l.key,l.value,l.right.left),l.right.key,l.right.value,new haxe_ds_TreeNode(l.right.right,k,v,r));\n\t\t\t}\n\t\t} else if(hr > hl + 2) {\n\t\t\tlet _this = r.right;\n\t\t\tlet _this1 = r.left;\n\t\t\tif((_this == null ? 0 : _this._height) > (_this1 == null ? 0 : _this1._height)) {\n\t\t\t\treturn new haxe_ds_TreeNode(new haxe_ds_TreeNode(l,k,v,r.left),r.key,r.value,r.right);\n\t\t\t} else {\n\t\t\t\treturn new haxe_ds_TreeNode(new haxe_ds_TreeNode(l,k,v,r.left.left),r.left.key,r.left.value,new haxe_ds_TreeNode(r.left.right,r.key,r.value,r.right));\n\t\t\t}\n\t\t} else {\n\t\t\treturn new haxe_ds_TreeNode(l,k,v,r,(hl > hr ? hl : hr) + 1);\n\t\t}\n\t}\n\tcompare(k1,k2) {\n\t\treturn Reflect.compare(k1,k2);\n\t}\n}\nhaxe_ds_BalancedTree.__name__ = true;\nhaxe_ds_BalancedTree.__interfaces__ = [haxe_IMap];\nObject.assign(haxe_ds_BalancedTree.prototype, {\n\t__class__: haxe_ds_BalancedTree\n});\nclass haxe_ds_TreeNode {\n\tconstructor(l,k,v,r,h) {\n\t\tif(h == null) {\n\t\t\th = -1;\n\t\t}\n\t\tthis.left = l;\n\t\tthis.key = k;\n\t\tthis.value = v;\n\t\tthis.right = r;\n\t\tif(h == -1) {\n\t\t\tlet tmp;\n\t\t\tlet _this = this.left;\n\t\t\tlet _this1 = this.right;\n\t\t\tif((_this == null ? 0 : _this._height) > (_this1 == null ? 0 : _this1._height)) {\n\t\t\t\tlet _this = this.left;\n\t\t\t\ttmp = _this == null ? 0 : _this._height;\n\t\t\t} else {\n\t\t\t\tlet _this = this.right;\n\t\t\t\ttmp = _this == null ? 0 : _this._height;\n\t\t\t}\n\t\t\tthis._height = tmp + 1;\n\t\t} else {\n\t\t\tthis._height = h;\n\t\t}\n\t}\n}\nhaxe_ds_TreeNode.__name__ = true;\nObject.assign(haxe_ds_TreeNode.prototype, {\n\t__class__: haxe_ds_TreeNode\n});\nclass haxe_ds_EnumValueMap extends haxe_ds_BalancedTree {\n\tconstructor() {\n\t\tsuper();\n\t}\n\tcompare(k1,k2) {\n\t\tlet d = k1._hx_index - k2._hx_index;\n\t\tif(d != 0) {\n\t\t\treturn d;\n\t\t}\n\t\tlet p1 = Type.enumParameters(k1);\n\t\tlet p2 = Type.enumParameters(k2);\n\t\tif(p1.length == 0 && p2.length == 0) {\n\t\t\treturn 0;\n\t\t}\n\t\treturn this.compareArgs(p1,p2);\n\t}\n\tcompareArgs(a1,a2) {\n\t\tlet ld = a1.length - a2.length;\n\t\tif(ld != 0) {\n\t\t\treturn ld;\n\t\t}\n\t\tlet _g = 0;\n\t\tlet _g1 = a1.length;\n\t\twhile(_g < _g1) {\n\t\t\tlet i = _g++;\n\t\t\tlet d = this.compareArg(a1[i],a2[i]);\n\t\t\tif(d != 0) {\n\t\t\t\treturn d;\n\t\t\t}\n\t\t}\n\t\treturn 0;\n\t}\n\tcompareArg(v1,v2) {\n\t\tif(Reflect.isEnumValue(v1) && Reflect.isEnumValue(v2)) {\n\t\t\treturn this.compare(v1,v2);\n\t\t} else if(((v1) instanceof Array) && ((v2) instanceof Array)) {\n\t\t\treturn this.compareArgs(v1,v2);\n\t\t} else {\n\t\t\treturn Reflect.compare(v1,v2);\n\t\t}\n\t}\n}\nhaxe_ds_EnumValueMap.__name__ = true;\nhaxe_ds_EnumValueMap.__interfaces__ = [haxe_IMap];\nhaxe_ds_EnumValueMap.__super__ = haxe_ds_BalancedTree;\nObject.assign(haxe_ds_EnumValueMap.prototype, {\n\t__class__: haxe_ds_EnumValueMap\n});\nclass haxe_ds_GenericCell {\n\tconstructor(elt,next) {\n\t\tthis.elt = elt;\n\t\tthis.next = next;\n\t}\n}\nhaxe_ds_GenericCell.__name__ = true;\nObject.assign(haxe_ds_GenericCell.prototype, {\n\t__class__: haxe_ds_GenericCell\n});\nclass haxe_ds_GenericStack {\n\tconstructor() {\n\t}\n}\nhaxe_ds_GenericStack.__name__ = true;\nObject.assign(haxe_ds_GenericStack.prototype, {\n\t__class__: haxe_ds_GenericStack\n});\nclass haxe_ds_IntMap {\n\tconstructor() {\n\t\tthis.h = { };\n\t}\n\tget(key) {\n\t\treturn this.h[key];\n\t}\n\tremove(key) {\n\t\tif(!this.h.hasOwnProperty(key)) {\n\t\t\treturn false;\n\t\t}\n\t\tdelete(this.h[key]);\n\t\treturn true;\n\t}\n\tkeys() {\n\t\tlet a = [];\n\t\tfor( var key in this.h ) if(this.h.hasOwnProperty(key)) a.push(+key);\n\t\treturn new haxe_iterators_ArrayIterator(a);\n\t}\n\titerator() {\n\t\treturn { ref : this.h, it : this.keys(), hasNext : function() {\n\t\t\treturn this.it.hasNext();\n\t\t}, next : function() {\n\t\t\tlet i = this.it.next();\n\t\t\treturn this.ref[i];\n\t\t}};\n\t}\n}\nhaxe_ds_IntMap.__name__ = true;\nhaxe_ds_IntMap.__interfaces__ = [haxe_IMap];\nObject.assign(haxe_ds_IntMap.prototype, {\n\t__class__: haxe_ds_IntMap\n});\nclass haxe_ds_ObjectMap {\n\tconstructor() {\n\t\tthis.h = { __keys__ : { }};\n\t}\n\tset(key,value) {\n\t\tlet id = key.__id__;\n\t\tif(id == null) {\n\t\t\tid = (key.__id__ = $global.$haxeUID++);\n\t\t}\n\t\tthis.h[id] = value;\n\t\tthis.h.__keys__[id] = key;\n\t}\n\tget(key) {\n\t\treturn this.h[key.__id__];\n\t}\n\tkeys() {\n\t\tlet a = [];\n\t\tfor( var key in this.h.__keys__ ) {\n\t\tif(this.h.hasOwnProperty(key)) {\n\t\t\ta.push(this.h.__keys__[key]);\n\t\t}\n\t\t}\n\t\treturn new haxe_iterators_ArrayIterator(a);\n\t}\n}\nhaxe_ds_ObjectMap.__name__ = true;\nhaxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];\nObject.assign(haxe_ds_ObjectMap.prototype, {\n\t__class__: haxe_ds_ObjectMap\n});\nclass haxe_ds_StringMap {\n\tconstructor() {\n\t\tthis.h = Object.create(null);\n\t}\n\tget(key) {\n\t\treturn this.h[key];\n\t}\n\tkeys() {\n\t\treturn new haxe_ds__$StringMap_StringMapKeyIterator(this.h);\n\t}\n}\nhaxe_ds_StringMap.__name__ = true;\nhaxe_ds_StringMap.__interfaces__ = [haxe_IMap];\nObject.assign(haxe_ds_StringMap.prototype, {\n\t__class__: haxe_ds_StringMap\n});\nclass haxe_ds__$StringMap_StringMapKeyIterator {\n\tconstructor(h) {\n\t\tthis.h = h;\n\t\tthis.keys = Object.keys(h);\n\t\tthis.length = this.keys.length;\n\t\tthis.current = 0;\n\t}\n\thasNext() {\n\t\treturn this.current < this.length;\n\t}\n\tnext() {\n\t\treturn this.keys[this.current++];\n\t}\n}\nhaxe_ds__$StringMap_StringMapKeyIterator.__name__ = true;\nObject.assign(haxe_ds__$StringMap_StringMapKeyIterator.prototype, {\n\t__class__: haxe_ds__$StringMap_StringMapKeyIterator\n});\nclass haxe_exceptions_PosException extends haxe_Exception {\n\tconstructor(message,previous,pos) {\n\t\tsuper(message,previous);\n\t\tif(pos == null) {\n\t\t\tthis.posInfos = { fileName : \"(unknown)\", lineNumber : 0, className : \"(unknown)\", methodName : \"(unknown)\"};\n\t\t} else {\n\t\t\tthis.posInfos = pos;\n\t\t}\n\t}\n\ttoString() {\n\t\treturn \"\" + super.toString() + \" in \" + this.posInfos.className + \".\" + this.posInfos.methodName + \" at \" + this.posInfos.fileName + \":\" + this.posInfos.lineNumber;\n\t}\n}\nhaxe_exceptions_PosException.__name__ = true;\nhaxe_exceptions_PosException.__super__ = haxe_Exception;\nObject.assign(haxe_exceptions_PosException.prototype, {\n\t__class__: haxe_exceptions_PosException\n});\nclass haxe_exceptions_NotImplementedException extends haxe_exceptions_PosException {\n\tconstructor(message,previous,pos) {\n\t\tif(message == null) {\n\t\t\tmessage = \"Not implemented\";\n\t\t}\n\t\tsuper(message,previous,pos);\n\t}\n}\nhaxe_exceptions_NotImplementedException.__name__ = true;\nhaxe_exceptions_NotImplementedException.__super__ = haxe_exceptions_PosException;\nObject.assign(haxe_exceptions_NotImplementedException.prototype, {\n\t__class__: haxe_exceptions_NotImplementedException\n});\nclass haxe_io_Bytes {\n\tconstructor(data) {\n\t\tthis.length = data.byteLength;\n\t\tthis.b = new Uint8Array(data);\n\t\tthis.b.bufferValue = data;\n\t\tdata.hxBytes = this;\n\t\tdata.bytes = this.b;\n\t}\n\tblit(pos,src,srcpos,len) {\n\t\tif(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) {\n\t\t\tthrow haxe_Exception.thrown(haxe_io_Error.OutsideBounds);\n\t\t}\n\t\tif(srcpos == 0 && len == src.b.byteLength) {\n\t\t\tthis.b.set(src.b,pos);\n\t\t} else {\n\t\t\tthis.b.set(src.b.subarray(srcpos,srcpos + len),pos);\n\t\t}\n\t}\n\tstatic ofData(b) {\n\t\tlet hb = b.hxBytes;\n\t\tif(hb != null) {\n\t\t\treturn hb;\n\t\t}\n\t\treturn new haxe_io_Bytes(b);\n\t}\n}\nhaxe_io_Bytes.__name__ = true;\nObject.assign(haxe_io_Bytes.prototype, {\n\t__class__: haxe_io_Bytes\n});\nclass haxe_io_BytesBuffer {\n\tconstructor() {\n\t\tthis.pos = 0;\n\t\tthis.size = 0;\n\t}\n\taddByte(byte) {\n\t\tif(this.pos == this.size) {\n\t\t\tthis.grow(1);\n\t\t}\n\t\tthis.view.setUint8(this.pos++,byte);\n\t}\n\taddInt32(v) {\n\t\tif(this.pos + 4 > this.size) {\n\t\t\tthis.grow(4);\n\t\t}\n\t\tthis.view.setInt32(this.pos,v,true);\n\t\tthis.pos += 4;\n\t}\n\taddDouble(v) {\n\t\tif(this.pos + 8 > this.size) {\n\t\t\tthis.grow(8);\n\t\t}\n\t\tthis.view.setFloat64(this.pos,v,true);\n\t\tthis.pos += 8;\n\t}\n\tgrow(delta) {\n\t\tlet req = this.pos + delta;\n\t\tlet nsize = this.size == 0 ? 16 : this.size;\n\t\twhile(nsize < req) nsize = nsize * 3 >> 1;\n\t\tlet nbuf = new ArrayBuffer(nsize);\n\t\tlet nu8 = new Uint8Array(nbuf);\n\t\tif(this.size > 0) {\n\t\t\tnu8.set(this.u8);\n\t\t}\n\t\tthis.size = nsize;\n\t\tthis.buffer = nbuf;\n\t\tthis.u8 = nu8;\n\t\tthis.view = new DataView(this.buffer);\n\t}\n\tgetBytes() {\n\t\tif(this.size == 0) {\n\t\t\treturn new haxe_io_Bytes(new ArrayBuffer(0));\n\t\t}\n\t\tlet b = new haxe_io_Bytes(this.buffer);\n\t\tb.length = this.pos;\n\t\treturn b;\n\t}\n}\nhaxe_io_BytesBuffer.__name__ = true;\nObject.assign(haxe_io_BytesBuffer.prototype, {\n\t__class__: haxe_io_BytesBuffer\n});\nclass haxe_io_Input {\n\treadByte() {\n\t\tthrow new haxe_exceptions_NotImplementedException(null,null,{ fileName : \"haxe/io/Input.hx\", lineNumber : 53, className : \"haxe.io.Input\", methodName : \"readByte\"});\n\t}\n\treadDouble() {\n\t\tlet i1 = this.readInt32();\n\t\tlet i2 = this.readInt32();\n\t\tif(this.bigEndian) {\n\t\t\treturn haxe_io_FPHelper.i64ToDouble(i2,i1);\n\t\t} else {\n\t\t\treturn haxe_io_FPHelper.i64ToDouble(i1,i2);\n\t\t}\n\t}\n\treadInt32() {\n\t\tlet ch1 = this.readByte();\n\t\tlet ch2 = this.readByte();\n\t\tlet ch3 = this.readByte();\n\t\tlet ch4 = this.readByte();\n\t\tif(this.bigEndian) {\n\t\t\treturn ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24;\n\t\t} else {\n\t\t\treturn ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;\n\t\t}\n\t}\n}\nhaxe_io_Input.__name__ = true;\nObject.assign(haxe_io_Input.prototype, {\n\t__class__: haxe_io_Input\n});\nclass haxe_io_BytesInput extends haxe_io_Input {\n\tconstructor(b,pos,len) {\n\t\tsuper();\n\t\tif(pos == null) {\n\t\t\tpos = 0;\n\t\t}\n\t\tif(len == null) {\n\t\t\tlen = b.length - pos;\n\t\t}\n\t\tif(pos < 0 || len < 0 || pos + len > b.length) {\n\t\t\tthrow haxe_Exception.thrown(haxe_io_Error.OutsideBounds);\n\t\t}\n\t\tthis.b = b.b;\n\t\tthis.pos = pos;\n\t\tthis.len = len;\n\t\tthis.totlen = len;\n\t}\n\treadByte() {\n\t\tif(this.len == 0) {\n\t\t\tthrow haxe_Exception.thrown(new haxe_io_Eof());\n\t\t}\n\t\tthis.len--;\n\t\treturn this.b[this.pos++];\n\t}\n}\nhaxe_io_BytesInput.__name__ = true;\nhaxe_io_BytesInput.__super__ = haxe_io_Input;\nObject.assign(haxe_io_BytesInput.prototype, {\n\t__class__: haxe_io_BytesInput\n});\nclass haxe_io_Eof {\n\tconstructor() {\n\t}\n\ttoString() {\n\t\treturn \"Eof\";\n\t}\n}\nhaxe_io_Eof.__name__ = true;\nObject.assign(haxe_io_Eof.prototype, {\n\t__class__: haxe_io_Eof\n});\nvar haxe_io_Error = $hxEnums[\"haxe.io.Error\"] = { __ename__:true,__constructs__:null\n\t,Blocked: {_hx_name:\"Blocked\",_hx_index:0,__enum__:\"haxe.io.Error\",toString:$estr}\n\t,Overflow: {_hx_name:\"Overflow\",_hx_index:1,__enum__:\"haxe.io.Error\",toString:$estr}\n\t,OutsideBounds: {_hx_name:\"OutsideBounds\",_hx_index:2,__enum__:\"haxe.io.Error\",toString:$estr}\n\t,Custom: ($_=function(e) { return {_hx_index:3,e:e,__enum__:\"haxe.io.Error\",toString:$estr}; },$_._hx_name=\"Custom\",$_.__params__ = [\"e\"],$_)\n};\nhaxe_io_Error.__constructs__ = [haxe_io_Error.Blocked,haxe_io_Error.Overflow,haxe_io_Error.OutsideBounds,haxe_io_Error.Custom];\nclass haxe_io_FPHelper {\n\tstatic i64ToDouble(low,high) {\n\t\thaxe_io_FPHelper.helper.setInt32(0,low,true);\n\t\thaxe_io_FPHelper.helper.setInt32(4,high,true);\n\t\treturn haxe_io_FPHelper.helper.getFloat64(0,true);\n\t}\n}\nhaxe_io_FPHelper.__name__ = true;\nclass haxe_io_Path {\n\tconstructor(path) {\n\t\tswitch(path) {\n\t\tcase \".\":case \"..\":\n\t\t\tthis.dir = path;\n\t\t\tthis.file = \"\";\n\t\t\treturn;\n\t\t}\n\t\tlet c1 = path.lastIndexOf(\"/\");\n\t\tlet c2 = path.lastIndexOf(\"\\\\\");\n\t\tif(c1 < c2) {\n\t\t\tthis.dir = HxOverrides.substr(path,0,c2);\n\t\t\tpath = HxOverrides.substr(path,c2 + 1,null);\n\t\t\tthis.backslash = true;\n\t\t} else if(c2 < c1) {\n\t\t\tthis.dir = HxOverrides.substr(path,0,c1);\n\t\t\tpath = HxOverrides.substr(path,c1 + 1,null);\n\t\t} else {\n\t\t\tthis.dir = null;\n\t\t}\n\t\tlet cp = path.lastIndexOf(\".\");\n\t\tif(cp != -1) {\n\t\t\tthis.ext = HxOverrides.substr(path,cp + 1,null);\n\t\t\tthis.file = HxOverrides.substr(path,0,cp);\n\t\t} else {\n\t\t\tthis.ext = null;\n\t\t\tthis.file = path;\n\t\t}\n\t}\n\ttoString() {\n\t\treturn (this.dir == null ? \"\" : this.dir + (this.backslash ? \"\\\\\" : \"/\")) + this.file + (this.ext == null ? \"\" : \".\" + this.ext);\n\t}\n\tstatic withoutExtension(path) {\n\t\tlet s = new haxe_io_Path(path);\n\t\ts.ext = null;\n\t\treturn s.toString();\n\t}\n\tstatic withoutDirectory(path) {\n\t\tlet s = new haxe_io_Path(path);\n\t\ts.dir = null;\n\t\treturn s.toString();\n\t}\n\tstatic directory(path) {\n\t\tlet s = new haxe_io_Path(path);\n\t\tif(s.dir == null) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn s.dir;\n\t}\n\tstatic extension(path) {\n\t\tlet s = new haxe_io_Path(path);\n\t\tif(s.ext == null) {\n\t\t\treturn \"\";\n\t\t}\n\t\treturn s.ext;\n\t}\n}\nhaxe_io_Path.__name__ = true;\nObject.assign(haxe_io_Path.prototype, {\n\t__class__: haxe_io_Path\n});\nclass haxe_iterators_ArrayIterator {\n\tconstructor(array) {\n\t\tthis.current = 0;\n\t\tthis.array = array;\n\t}\n\thasNext() {\n\t\treturn this.current < this.array.length;\n\t}\n\tnext() {\n\t\treturn this.array[this.current++];\n\t}\n}\nhaxe_iterators_ArrayIterator.__name__ = true;\nObject.assign(haxe_iterators_ArrayIterator.prototype, {\n\t__class__: haxe_iterators_ArrayIterator\n});\nclass haxe_macro_Error extends haxe_Exception {\n\tconstructor(message,pos,previous) {\n\t\tsuper(message,previous);\n\t\tthis.pos = pos;\n\t}\n}\nhaxe_macro_Error.__name__ = true;\nhaxe_macro_Error.__super__ = haxe_Exception;\nObject.assign(haxe_macro_Error.prototype, {\n\t__class__: haxe_macro_Error\n});\nclass js_Boot {\n\tstatic getClass(o) {\n\t\tif(o == null) {\n\t\t\treturn null;\n\t\t} else if(((o) instanceof Array)) {\n\t\t\treturn Array;\n\t\t} else {\n\t\t\tlet cl = o.__class__;\n\t\t\tif(cl != null) {\n\t\t\t\treturn cl;\n\t\t\t}\n\t\t\tlet name = js_Boot.__nativeClassName(o);\n\t\t\tif(name != null) {\n\t\t\t\treturn js_Boot.__resolveNativeClass(name);\n\t\t\t}\n\t\t\treturn null;\n\t\t}\n\t}\n\tstatic __string_rec(o,s) {\n\t\tif(o == null) {\n\t\t\treturn \"null\";\n\t\t}\n\t\tif(s.length >= 5) {\n\t\t\treturn \"<...>\";\n\t\t}\n\t\tlet t = typeof(o);\n\t\tif(t == \"function\" && (o.__name__ || o.__ename__)) {\n\t\t\tt = \"object\";\n\t\t}\n\t\tswitch(t) {\n\t\tcase \"function\":\n\t\t\treturn \"<function>\";\n\t\tcase \"object\":\n\t\t\tif(o.__enum__) {\n\t\t\t\tlet e = $hxEnums[o.__enum__];\n\t\t\t\tlet con = e.__constructs__[o._hx_index];\n\t\t\t\tlet n = con._hx_name;\n\t\t\t\tif(con.__params__) {\n\t\t\t\t\ts = s + \"\\t\";\n\t\t\t\t\treturn n + \"(\" + ((function($this) {\n\t\t\t\t\t\tvar $r;\n\t\t\t\t\t\tlet _g = [];\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\tlet _g1 = 0;\n\t\t\t\t\t\t\tlet _g2 = con.__params__;\n\t\t\t\t\t\t\twhile(true) {\n\t\t\t\t\t\t\t\tif(!(_g1 < _g2.length)) {\n\t\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tlet p = _g2[_g1];\n\t\t\t\t\t\t\t\t_g1 = _g1 + 1;\n\t\t\t\t\t\t\t\t_g.push(js_Boot.__string_rec(o[p],s));\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\t$r = _g;\n\t\t\t\t\t\treturn $r;\n\t\t\t\t\t}(this))).join(\",\") + \")\";\n\t\t\t\t} else {\n\t\t\t\t\treturn n;\n\t\t\t\t}\n\t\t\t}\n\t\t\tif(((o) instanceof Array)) {\n\t\t\t\tlet str = \"[\";\n\t\t\t\ts += \"\\t\";\n\t\t\t\tlet _g = 0;\n\t\t\t\tlet _g1 = o.length;\n\t\t\t\twhile(_g < _g1) {\n\t\t\t\t\tlet i = _g++;\n\t\t\t\t\tstr += (i > 0 ? \",\" : \"\") + js_Boot.__string_rec(o[i],s);\n\t\t\t\t}\n\t\t\t\tstr += \"]\";\n\t\t\t\treturn str;\n\t\t\t}\n\t\t\tlet tostr;\n\t\t\ttry {\n\t\t\t\ttostr = o.toString;\n\t\t\t} catch( _g ) {\n\t\t\t\treturn \"???\";\n\t\t\t}\n\t\t\tif(tostr != null && tostr != Object.toString && typeof(tostr) == \"function\") {\n\t\t\t\tlet s2 = o.toString();\n\t\t\t\tif(s2 != \"[object Object]\") {\n\t\t\t\t\treturn s2;\n\t\t\t\t}\n\t\t\t}\n\t\t\tlet str = \"{\\n\";\n\t\t\ts += \"\\t\";\n\t\t\tlet hasp = o.hasOwnProperty != null;\n\t\t\tlet k = null;\n\t\t\tfor( k in o ) {\n\t\t\tif(hasp && !o.hasOwnProperty(k)) {\n\t\t\t\tcontinue;\n\t\t\t}\n\t\t\tif(k == \"prototype\" || k == \"__class__\" || k == \"__super__\" || k == \"__interfaces__\" || k == \"__properties__\") {\n\t\t\t\tcontinue;\n\t\t\t}\n\t\t\tif(str.length != 2) {\n\t\t\t\tstr += \", \\n\";\n\t\t\t}\n\t\t\tstr += s + k + \" : \" + js_Boot.__string_rec(o[k],s);\n\t\t\t}\n\t\t\ts = s.substring(1);\n\t\t\tstr += \"\\n\" + s + \"}\";\n\t\t\treturn str;\n\t\tcase \"string\":\n\t\t\treturn o;\n\t\tdefault:\n\t\t\treturn String(o);\n\t\t}\n\t}\n\tstatic __interfLoop(cc,cl) {\n\t\tif(cc == null) {\n\t\t\treturn false;\n\t\t}\n\t\tif(cc == cl) {\n\t\t\treturn true;\n\t\t}\n\t\tlet intf = cc.__interfaces__;\n\t\tif(intf != null && (cc.__super__ == null || cc.__super__.__interfaces__ != intf)) {\n\t\t\tlet _g = 0;\n\t\t\tlet _g1 = intf.length;\n\t\t\twhile(_g < _g1) {\n\t\t\t\tlet i = _g++;\n\t\t\t\tlet i1 = intf[i];\n\t\t\t\tif(i1 == cl || js_Boot.__interfLoop(i1,cl)) {\n\t\t\t\t\treturn true;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn js_Boot.__interfLoop(cc.__super__,cl);\n\t}\n\tstatic __instanceof(o,cl) {\n\t\tif(cl == null) {\n\t\t\treturn false;\n\t\t}\n\t\tswitch(cl) {\n\t\tcase Array:\n\t\t\treturn ((o) instanceof Array);\n\t\tcase Bool:\n\t\t\treturn typeof(o) == \"boolean\";\n\t\tcase Dynamic:\n\t\t\treturn o != null;\n\t\tcase Float:\n\t\t\treturn typeof(o) == \"number\";\n\t\tcase Int:\n\t\t\tif(typeof(o) == \"number\") {\n\t\t\t\treturn ((o | 0) === o);\n\t\t\t} else {\n\t\t\t\treturn false;\n\t\t\t}\n\t\t\tbreak;\n\t\tcase String:\n\t\t\treturn typeof(o) == \"string\";\n\t\tdefault:\n\t\t\tif(o != null) {\n\t\t\t\tif(typeof(cl) == \"function\") {\n\t\t\t\t\tif(js_Boot.__downcastCheck(o,cl)) {\n\t\t\t\t\t\treturn true;\n\t\t\t\t\t}\n\t\t\t\t} else if(typeof(cl) == \"object\" && js_Boot.__isNativeObj(cl)) {\n\t\t\t\t\tif(((o) instanceof cl)) {\n\t\t\t\t\t\treturn true;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\treturn false;\n\t\t\t}\n\t\t\tif(cl == Class ? o.__name__ != null : false) {\n\t\t\t\treturn true;\n\t\t\t}\n\t\t\tif(cl == Enum ? o.__ename__ != null : false) {\n\t\t\t\treturn true;\n\t\t\t}\n\t\t\treturn o.__enum__ != null ? $hxEnums[o.__enum__] == cl : false;\n\t\t}\n\t}\n\tstatic __downcastCheck(o,cl) {\n\t\tif(!((o) instanceof cl)) {\n\t\t\tif(cl.__isInterface__) {\n\t\t\t\treturn js_Boot.__interfLoop(js_Boot.getClass(o),cl);\n\t\t\t} else {\n\t\t\t\treturn false;\n\t\t\t}\n\t\t} else {\n\t\t\treturn true;\n\t\t}\n\t}\n\tstatic __cast(o,t) {\n\t\tif(o == null || js_Boot.__instanceof(o,t)) {\n\t\t\treturn o;\n\t\t} else {\n\t\t\tthrow haxe_Exception.thrown(\"Cannot cast \" + Std.string(o) + \" to \" + Std.string(t));\n\t\t}\n\t}\n\tstatic __nativeClassName(o) {\n\t\tlet name = js_Boot.__toStr.call(o).slice(8,-1);\n\t\tif(name == \"Object\" || name == \"Function\" || name == \"Math\" || name == \"JSON\") {\n\t\t\treturn null;\n\t\t}\n\t\treturn name;\n\t}\n\tstatic __isNativeObj(o) {\n\t\treturn js_Boot.__nativeClassName(o) != null;\n\t}\n\tstatic __resolveNativeClass(name) {\n\t\treturn $global[name];\n\t}\n}\njs_Boot.__name__ = true;\nclass optimizer_ConstantFoldingPass {\n\tconstructor() {\n\t}\n\toptimize(ast) {\n\t\tlet _g = 0;\n\t\twhile(_g < ast.length) {\n\t\t\tlet stmt = ast[_g];\n\t\t\t++_g;\n\t\t\tstmt.visitStmt(this);\n\t\t}\n\t}\n\tvisitStmt(stmt) {\n\t}\n\tvisitBreakStmt(stmt) {\n\t}\n\tvisitContinueStmt(stmt) {\n\t}\n\tvisitExpr(expr) {\n\t}\n\tvisitParenthesisExpr(expr) {\n\t}\n\tvisitReturnStmt(stmt) {\n\t}\n\tvisitIfStmt(stmt) {\n\t}\n\tvisitLoopStmt(stmt) {\n\t}\n\tvisitBinaryExpr(expr) {\n\t}\n\tvisitFloatBinaryExpr(expr) {\n\t\tif(((expr.left) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.right) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.left) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {\n\t\t\tlet lValue = 0;\n\t\t\tlet rValue = 0;\n\t\t\tif(((expr.left) instanceof expr_IntExpr)) {\n\t\t\t\tlValue = (js_Boot.__cast(expr.left , expr_IntExpr)).value;\n\t\t\t} else if(((expr.left) instanceof expr_FloatExpr)) {\n\t\t\t\tlValue = (js_Boot.__cast(expr.left , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.left) instanceof expr_StringConstExpr)) {\n\t\t\t\tlValue = Compiler.stringToNumber((js_Boot.__cast(expr.left , expr_StringConstExpr)).value);\n\t\t\t}\n\t\t\tif(((expr.right) instanceof expr_IntExpr)) {\n\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_IntExpr)).value;\n\t\t\t} else if(((expr.right) instanceof expr_FloatExpr)) {\n\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.right) instanceof expr_StringConstExpr)) {\n\t\t\t\trValue = Compiler.stringToNumber((js_Boot.__cast(expr.right , expr_StringConstExpr)).value);\n\t\t\t}\n\t\t\tlet result;\n\t\t\tswitch(expr.op.type._hx_index) {\n\t\t\tcase 15:\n\t\t\t\tresult = lValue + rValue;\n\t\t\t\tbreak;\n\t\t\tcase 16:\n\t\t\t\tresult = lValue - rValue;\n\t\t\t\tbreak;\n\t\t\tcase 17:\n\t\t\t\tresult = lValue * rValue;\n\t\t\t\tbreak;\n\t\t\tcase 18:\n\t\t\t\tresult = lValue / rValue;\n\t\t\t\tbreak;\n\t\t\tdefault:\n\t\t\t\tresult = 0;\n\t\t\t}\n\t\t\texpr.optimized = true;\n\t\t\texpr.optimizedExpr = new expr_FloatExpr(expr.lineNo,result);\n\t\t}\n\t}\n\tvisitIntBinaryExpr(expr) {\n\t\tif(((expr.left) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.right) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.left) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {\n\t\t\texpr.getSubTypeOperand();\n\t\t\tif(expr.subType == expr_TypeReq.ReqFloat) {\n\t\t\t\tlet lValue = 0;\n\t\t\t\tlet rValue = 0;\n\t\t\t\tif(((expr.left) instanceof expr_IntExpr)) {\n\t\t\t\t\tlValue = (js_Boot.__cast(expr.left , expr_IntExpr)).value;\n\t\t\t\t} else if(((expr.left) instanceof expr_FloatExpr)) {\n\t\t\t\t\tlValue = (js_Boot.__cast(expr.left , expr_FloatExpr)).value;\n\t\t\t\t} else if(((expr.left) instanceof expr_StringConstExpr)) {\n\t\t\t\t\tlValue = Compiler.stringToNumber((js_Boot.__cast(expr.left , expr_StringConstExpr)).value);\n\t\t\t\t}\n\t\t\t\tif(((expr.right) instanceof expr_IntExpr)) {\n\t\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_IntExpr)).value;\n\t\t\t\t} else if(((expr.right) instanceof expr_FloatExpr)) {\n\t\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_FloatExpr)).value;\n\t\t\t\t} else if(((expr.right) instanceof expr_StringConstExpr)) {\n\t\t\t\t\trValue = Compiler.stringToNumber((js_Boot.__cast(expr.right , expr_StringConstExpr)).value);\n\t\t\t\t}\n\t\t\t\tlet result;\n\t\t\t\tswitch(expr.op.type._hx_index) {\n\t\t\t\tcase 31:\n\t\t\t\t\tresult = lValue < rValue ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 32:\n\t\t\t\t\tresult = lValue > rValue ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 33:\n\t\t\t\t\tresult = lValue <= rValue ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 34:\n\t\t\t\t\tresult = lValue >= rValue ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 36:\n\t\t\t\t\tresult = lValue != rValue ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 37:\n\t\t\t\t\tresult = lValue == rValue ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tdefault:\n\t\t\t\t\tresult = 0;\n\t\t\t\t}\n\t\t\t\texpr.optimized = true;\n\t\t\t\texpr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tif(expr.subType == expr_TypeReq.ReqInt) {\n\t\t\t\tlet lValue = 0;\n\t\t\t\tlet rValue = 0;\n\t\t\t\tif(((expr.left) instanceof expr_IntExpr)) {\n\t\t\t\t\tlValue = (js_Boot.__cast(expr.left , expr_IntExpr)).value;\n\t\t\t\t} else if(((expr.left) instanceof expr_FloatExpr)) {\n\t\t\t\t\tlValue = (js_Boot.__cast(expr.left , expr_FloatExpr)).value;\n\t\t\t\t} else if(((expr.left) instanceof expr_StringConstExpr)) {\n\t\t\t\t\tlValue = Compiler.stringToNumber((js_Boot.__cast(expr.left , expr_StringConstExpr)).value);\n\t\t\t\t}\n\t\t\t\tif(((expr.right) instanceof expr_IntExpr)) {\n\t\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_IntExpr)).value;\n\t\t\t\t} else if(((expr.right) instanceof expr_FloatExpr)) {\n\t\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_FloatExpr)).value;\n\t\t\t\t} else if(((expr.right) instanceof expr_StringConstExpr)) {\n\t\t\t\t\trValue = Compiler.stringToNumber((js_Boot.__cast(expr.right , expr_StringConstExpr)).value);\n\t\t\t\t}\n\t\t\t\tlet result;\n\t\t\t\tswitch(expr.op.type._hx_index) {\n\t\t\t\tcase 19:\n\t\t\t\t\tresult = lValue % rValue;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 46:\n\t\t\t\t\tresult = lValue > 0 && rValue > 0 ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 47:\n\t\t\t\t\tresult = lValue > 0 || rValue > 0 ? 1 : 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 48:\n\t\t\t\t\tresult = lValue << rValue;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 49:\n\t\t\t\t\tresult = lValue >> rValue;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 50:\n\t\t\t\t\tresult = lValue & rValue;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 51:\n\t\t\t\t\tresult = lValue | rValue;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 52:\n\t\t\t\t\tresult = lValue ^ rValue;\n\t\t\t\t\tbreak;\n\t\t\t\tdefault:\n\t\t\t\t\tresult = 0;\n\t\t\t\t}\n\t\t\t\texpr.optimized = true;\n\t\t\t\texpr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);\n\t\t\t\treturn;\n\t\t\t}\n\t\t}\n\t}\n\tvisitStrEqExpr(expr) {\n\t\tif(((expr.left) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.right) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.left) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {\n\t\t\tlet lValue = \"\";\n\t\t\tlet rValue = \"\";\n\t\t\tif(((expr.left) instanceof expr_IntExpr)) {\n\t\t\t\tlValue = \"\" + (js_Boot.__cast(expr.left , expr_IntExpr)).value;\n\t\t\t} else if(((expr.left) instanceof expr_FloatExpr)) {\n\t\t\t\tlValue = \"\" + (js_Boot.__cast(expr.left , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.left) instanceof expr_StringConstExpr)) {\n\t\t\t\tlValue = \"\" + (js_Boot.__cast(expr.left , expr_StringConstExpr)).value;\n\t\t\t}\n\t\t\tif(((expr.right) instanceof expr_IntExpr)) {\n\t\t\t\trValue = \"\" + (js_Boot.__cast(expr.right , expr_IntExpr)).value;\n\t\t\t} else if(((expr.right) instanceof expr_FloatExpr)) {\n\t\t\t\trValue = \"\" + (js_Boot.__cast(expr.right , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.right) instanceof expr_StringConstExpr)) {\n\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_StringConstExpr)).value;\n\t\t\t}\n\t\t\tlet result;\n\t\t\tswitch(expr.op.type._hx_index) {\n\t\t\tcase 39:\n\t\t\t\tresult = lValue == rValue ? 1 : 0;\n\t\t\t\tbreak;\n\t\t\tcase 40:\n\t\t\t\tresult = lValue != rValue ? 1 : 0;\n\t\t\t\tbreak;\n\t\t\tdefault:\n\t\t\t\tresult = 0;\n\t\t\t}\n\t\t\texpr.optimized = true;\n\t\t\texpr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);\n\t\t}\n\t}\n\tvisitStrCatExpr(expr) {\n\t\tif(((expr.left) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.right) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.left) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.left) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.left = (js_Boot.__cast(expr.left , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.right) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.right = (js_Boot.__cast(expr.right , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif((((expr.left) instanceof expr_IntExpr) || ((expr.left) instanceof expr_FloatExpr) || ((expr.left) instanceof expr_StringConstExpr)) && (((expr.right) instanceof expr_IntExpr) || ((expr.right) instanceof expr_FloatExpr) || ((expr.right) instanceof expr_StringConstExpr))) {\n\t\t\tlet lValue = \"\";\n\t\t\tlet rValue = \"\";\n\t\t\tif(((expr.left) instanceof expr_IntExpr)) {\n\t\t\t\tlValue = \"\" + (js_Boot.__cast(expr.left , expr_IntExpr)).value;\n\t\t\t} else if(((expr.left) instanceof expr_FloatExpr)) {\n\t\t\t\tlValue = \"\" + (js_Boot.__cast(expr.left , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.left) instanceof expr_StringConstExpr)) {\n\t\t\t\tlValue = \"\" + (js_Boot.__cast(expr.left , expr_StringConstExpr)).value;\n\t\t\t}\n\t\t\tif(((expr.right) instanceof expr_IntExpr)) {\n\t\t\t\trValue = \"\" + (js_Boot.__cast(expr.right , expr_IntExpr)).value;\n\t\t\t} else if(((expr.right) instanceof expr_FloatExpr)) {\n\t\t\t\trValue = \"\" + (js_Boot.__cast(expr.right , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.right) instanceof expr_StringConstExpr)) {\n\t\t\t\trValue = (js_Boot.__cast(expr.right , expr_StringConstExpr)).value;\n\t\t\t}\n\t\t\tlet result;\n\t\t\tswitch(expr.op.type._hx_index) {\n\t\t\tcase 41:\n\t\t\t\tresult = lValue + rValue;\n\t\t\t\tbreak;\n\t\t\tcase 42:\n\t\t\t\tresult = lValue + \" \" + rValue;\n\t\t\t\tbreak;\n\t\t\tcase 43:\n\t\t\t\tresult = lValue + \"\\t\" + rValue;\n\t\t\t\tbreak;\n\t\t\tcase 44:\n\t\t\t\tresult = lValue + \"\\n\" + rValue;\n\t\t\t\tbreak;\n\t\t\tdefault:\n\t\t\t\tresult = \"\";\n\t\t\t}\n\t\t\texpr.optimized = true;\n\t\t\texpr.optimizedExpr = new expr_StringConstExpr(expr.lineNo,result,false);\n\t\t}\n\t}\n\tvisitCommatCatExpr(expr) {\n\t}\n\tvisitConditionalExpr(expr) {\n\t}\n\tvisitIntUnaryExpr(expr) {\n\t\tif(((expr.expr) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.expr) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.expr) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.expr) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.expr) instanceof expr_IntExpr) || ((expr.expr) instanceof expr_FloatExpr) || ((expr.expr) instanceof expr_StringConstExpr)) {\n\t\t\tlet value = 0;\n\t\t\tif(((expr.expr) instanceof expr_IntExpr)) {\n\t\t\t\tvalue = (js_Boot.__cast(expr.expr , expr_IntExpr)).value;\n\t\t\t} else if(((expr.expr) instanceof expr_FloatExpr)) {\n\t\t\t\tvalue = (js_Boot.__cast(expr.expr , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.expr) instanceof expr_StringConstExpr)) {\n\t\t\t\tvalue = Compiler.stringToNumber((js_Boot.__cast(expr.expr , expr_StringConstExpr)).value);\n\t\t\t}\n\t\t\tlet result;\n\t\t\tswitch(expr.op.type._hx_index) {\n\t\t\tcase 35:\n\t\t\t\tresult = value == 0 ? 1 : 0;\n\t\t\t\tbreak;\n\t\t\tcase 38:\n\t\t\t\tresult = ~value;\n\t\t\t\tbreak;\n\t\t\tdefault:\n\t\t\t\tresult = 0;\n\t\t\t}\n\t\t\texpr.optimized = true;\n\t\t\texpr.optimizedExpr = new expr_IntExpr(expr.lineNo,result);\n\t\t}\n\t}\n\tvisitFloatUnaryExpr(expr) {\n\t\tif(((expr.expr) instanceof expr_ParenthesisExpr)) {\n\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_ParenthesisExpr)).expr;\n\t\t}\n\t\tif(((expr.expr) instanceof expr_BinaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimized) {\n\t\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_BinaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.expr) instanceof expr_IntUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimized) {\n\t\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_IntUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.expr) instanceof expr_FloatUnaryExpr)) {\n\t\t\tif((js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimized) {\n\t\t\t\texpr.expr = (js_Boot.__cast(expr.expr , expr_FloatUnaryExpr)).optimizedExpr;\n\t\t\t}\n\t\t}\n\t\tif(((expr.expr) instanceof expr_IntExpr) || ((expr.expr) instanceof expr_FloatExpr) || ((expr.expr) instanceof expr_StringConstExpr)) {\n\t\t\tlet value = 0;\n\t\t\tif(((expr.expr) instanceof expr_IntExpr)) {\n\t\t\t\tvalue = (js_Boot.__cast(expr.expr , expr_IntExpr)).value;\n\t\t\t} else if(((expr.expr) instanceof expr_FloatExpr)) {\n\t\t\t\tvalue = (js_Boot.__cast(expr.expr , expr_FloatExpr)).value;\n\t\t\t} else if(((expr.expr) instanceof expr_StringConstExpr)) {\n\t\t\t\tvalue = Compiler.stringToNumber((js_Boot.__cast(expr.expr , expr_StringConstExpr)).value);\n\t\t\t}\n\t\t\tlet result = -value;\n\t\t\texpr.optimized = true;\n\t\t\texpr.optimizedExpr = new expr_FloatExpr(expr.lineNo,result);\n\t\t}\n\t}\n\tvisitVarExpr(expr) {\n\t}\n\tvisitIntExpr(expr) {\n\t}\n\tvisitFloatExpr(expr) {\n\t}\n\tvisitStringConstExpr(expr) {\n\t}\n\tvisitConstantExpr(expr) {\n\t}\n\tvisitAssignExpr(expr) {\n\t}\n\tvisitAssignOpExpr(expr) {\n\t}\n\tvisitFuncCallExpr(expr) {\n\t}\n\tvisitSlotAccessExpr(expr) {\n\t}\n\tvisitSlotAssignExpr(expr) {\n\t}\n\tvisitSlotAssignOpExpr(expr) {\n\t}\n\tvisitObjectDeclExpr(expr) {\n\t}\n\tvisitFunctionDeclStmt(stmt) {\n\t}\n\tgetLevel() {\n\t\treturn 1;\n\t}\n}\noptimizer_ConstantFoldingPass.__name__ = true;\noptimizer_ConstantFoldingPass.__interfaces__ = [IOptimizerPass];\nObject.assign(optimizer_ConstantFoldingPass.prototype, {\n\t__class__: optimizer_ConstantFoldingPass\n});\n$global.$haxeUID |= 0;\nif(typeof(performance) != \"undefined\" ? typeof(performance.now) == \"function\" : false) {\n\tHxOverrides.now = performance.now.bind(performance);\n}\nif( String.fromCodePoint == null ) String.fromCodePoint = function(c) { return c < 0x10000 ? String.fromCharCode(c) : String.fromCharCode((c>>10)+0xD7C0)+String.fromCharCode((c&0x3FF)+0xDC00); }\n{\n\tString.prototype.__class__ = String;\n\tString.__name__ = true;\n\tArray.__name__ = true;\n\tvar Int = { };\n\tvar Dynamic = { };\n\tvar Float = Number;\n\tvar Bool = Boolean;\n\tvar Class = { };\n\tvar Enum = { };\n}\nhaxe_ds_ObjectMap.count = 0;\njs_Boot.__toStr = ({ }).toString;\nVarCollector.reservedKwds = [\"break\",\"case\",\"catch\",\"class\",\"const\",\"continue\",\"debugger\",\"default\",\"delete\",\"do\",\"else\",\"enum\",\"export\",\"extends\",\"false\",\"finally\",\"for\",\"function\",\"if\",\"import\",\"in\",\"instanceof\",\"new\",\"null\",\"return\",\"super\",\"switch\",\"this\",\"throw\",\"true\",\"try\",\"typeof\",\"var\",\"void\",\"while\",\"with\",\"as\",\"implements\",\"interface\",\"let\",\"package\",\"private\",\"protected\",\"public\",\"static\",\"yield\",\"any\",\"boolean\",\"constructor\",\"declare\",\"get\",\"module\",\"require\",\"number\",\"set\",\"string\",\"symbol\",\"type\",\"from\",\"of\"];\nJSGenerator.embedLib = \"__EMBED_LIB__\";\nLog.savedStr = \"\";\nconsole_ConsoleObject._hx_skip_constructor = false;\nconsole_ConsoleObjectConstructors.constructorMap = (function($this) {\n\tvar $r;\n\tlet _g = new haxe_ds_StringMap();\n\t_g.h[\"SimObject\"] = function() {\n\t\treturn new console_SimObject();\n\t};\n\t_g.h[\"ScriptObject\"] = function() {\n\t\treturn new console_ScriptObject();\n\t};\n\t_g.h[\"SimDataBlock\"] = function() {\n\t\treturn new console_SimDataBlock();\n\t};\n\t_g.h[\"SimSet\"] = function() {\n\t\treturn new console_SimSet();\n\t};\n\t_g.h[\"SimGroup\"] = function() {\n\t\treturn new console_SimGroup();\n\t};\n\t$r = _g;\n\treturn $r;\n}(this));\nconsole_ConsoleObjectMacro.defClasses = [];\nexpr_Stmt._hx_skip_constructor = false;\nexpr_Stmt.recursion = 0;\nhaxe_EntryPoint.pending = [];\nhaxe_EntryPoint.threadCount = 0;\nhaxe_io_FPHelper.helper = new DataView(new ArrayBuffer(8));\n})(typeof window != \"undefined\" ? window : typeof global != \"undefined\" ? global : typeof self != \"undefined\" ? self : this);\nvar CodeBlock = $hx_exports[\"CodeBlock\"];\nvar Compiler = $hx_exports[\"Compiler\"];\nvar Disassembler = $hx_exports[\"Disassembler\"];\nvar JSGenerator = $hx_exports[\"JSGenerator\"];\nvar Log = $hx_exports[\"Log\"];\nvar Parser = $hx_exports[\"Parser\"];\nvar Scanner = $hx_exports[\"Scanner\"];\nvar Variable = $hx_exports[\"Variable\"];\nvar VM = $hx_exports[\"VM\"];\n";
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