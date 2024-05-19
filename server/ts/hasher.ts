import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { Scanner, Parser, IASTVisitor, expr_AssignExpr, expr_AssignOpExpr, expr_BinaryExpr, expr_BreakStmt, expr_CommaCatExpr, expr_ConditionalExpr, expr_ConstantExpr, expr_ContinueStmt, expr_Expr, expr_FloatBinaryExpr, expr_FloatExpr, expr_FloatUnaryExpr, expr_FuncCallExpr, expr_FunctionDeclStmt, expr_IfStmt, expr_IntBinaryExpr, expr_IntExpr, expr_IntUnaryExpr, expr_LoopStmt, expr_ObjectDeclExpr, expr_ParenthesisExpr, expr_ReturnStmt, expr_SlotAccessExpr, expr_SlotAssignExpr, expr_SlotAssignOpExpr, expr_Stmt, expr_StrCatExpr, expr_StrEqExpr, expr_StringConstExpr, expr_VarExpr } from '../lib/hxTorquescript';
import { Mission, MissionDoc } from './mission';

export class MissionHasher {
    public static async hashMission(mission?: Mission, misContents?: string) {
        let missionText = mission !== null ? (await fs.readFile(path.join(mission.baseDirectory, mission.relativePath))).toString() : misContents;

        let x = new Scanner(missionText);
        let tokens = x.scanTokens();

        let p = new Parser(tokens);
        let stmts = p.parse();

        // hash the AST
        let hash = crypto.createHash('sha256').update(stmts.map((x) => this.hashStmt(x)).join('')).digest('base64');
        return hash;
    }

    static hashStmt(stmt: expr_Stmt): string {
        let funcMap = new Map<any, () => string>();
        funcMap.set(expr_BreakStmt, () => crypto.createHash('sha256').update(`break`).digest('base64'));
        funcMap.set(expr_ContinueStmt, () => crypto.createHash('sha256').update(`continue`).digest('base64'));
        funcMap.set(expr_IntExpr, () => crypto.createHash('sha256').update(`${(stmt as expr_IntExpr).value}`).digest('base64'));
        funcMap.set(expr_FloatExpr, () => crypto.createHash('sha256').update(`${(stmt as expr_FloatExpr).value}`).digest('base64'));
        funcMap.set(expr_StringConstExpr, () => crypto.createHash('sha256').update((stmt as expr_StringConstExpr).value.toLowerCase()).digest('base64'));
        funcMap.set(expr_ConstantExpr, () => crypto.createHash('sha256').update((stmt as expr_ConstantExpr).name.literal.toLowerCase()).digest('base64'));
        funcMap.set(expr_ParenthesisExpr, () => this.hashStmt((stmt as expr_ParenthesisExpr).expr));
        funcMap.set(expr_ReturnStmt, () => {
            let retExpr = (stmt as expr_ReturnStmt).expr;
            if (retExpr == null) {
                return crypto.createHash('sha256').update(`return;`).digest('base64');
            } else {
                return crypto.createHash('sha256').update(`return ${this.hashStmt(retExpr)};`).digest('base64');
            }
        });
        funcMap.set(expr_IntUnaryExpr, () => {
            let expr = (stmt as unknown as expr_IntUnaryExpr);
            return crypto.createHash('sha256').update(`${expr.op.lexeme}${this.hashStmt(expr.expr)}`).digest('base64');
        });
        funcMap.set(expr_FloatUnaryExpr, () => {
            let expr = (stmt as unknown as expr_FloatUnaryExpr);
            return crypto.createHash('sha256').update(`${expr.op.lexeme}${this.hashStmt(expr.expr)}`).digest('base64');
        });
        funcMap.set(expr_IntBinaryExpr, () => {
            let expr = (stmt as unknown as expr_IntBinaryExpr);
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.left)}${expr.op.lexeme}${this.hashStmt(expr.right)}`).digest('base64');
        });
        funcMap.set(expr_FloatBinaryExpr, () => {
            let expr = (stmt as unknown as expr_FloatBinaryExpr);
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.left)}${expr.op.lexeme}${this.hashStmt(expr.right)}`).digest('base64');
        });
        funcMap.set(expr_ConditionalExpr, () => {
            let expr = (stmt as unknown as expr_ConditionalExpr);
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.condition)} ? ${this.hashStmt(expr.trueExpr)} : ${this.hashStmt(expr.falseExpr)}`).digest('base64');
        });
        funcMap.set(expr_CommaCatExpr, () => {
            let expr = (stmt as unknown as expr_CommaCatExpr);
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.left)},${this.hashStmt(expr.right)}`).digest('base64');
        });
        funcMap.set(expr_StrCatExpr, () => {
            let expr = (stmt as unknown as expr_StrCatExpr);
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.left)}${expr.op.lexeme}${this.hashStmt(expr.right)}`).digest('base64');
        });
        funcMap.set(expr_StrEqExpr, () => {
            let expr = (stmt as unknown as expr_StrEqExpr);
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.left)}${expr.op.lexeme}${this.hashStmt(expr.right)}`).digest('base64');
        });
        funcMap.set(expr_AssignExpr, () => {
            let expr = (stmt as unknown as expr_AssignExpr);
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.varExpr)} = ${this.hashStmt(expr.expr)}`).digest('base64');
        });
        funcMap.set(expr_AssignOpExpr, () => {
            let expr = (stmt as unknown as expr_AssignOpExpr);
            expr.getAssignOpTypeOp(); // fix ++/--;
            return crypto.createHash('sha256').update(`${this.hashStmt(expr.varExpr)} ${expr.op.lexeme} ${this.hashStmt(expr.expr)}`).digest('base64');
        });
        funcMap.set(expr_VarExpr, () => {
            let expr = (stmt as unknown as expr_VarExpr);
            if (expr.arrayIndex == null) {
                return crypto.createHash('sha256').update(expr.name.lexeme.toLowerCase()).digest('base64');
            } else {
                return crypto.createHash('sha256').update(`${expr.name.lexeme.toLowerCase()}[${this.hashStmt(expr.arrayIndex)}]`).digest('base64');
            }
        });
        funcMap.set(expr_SlotAccessExpr, () => {
            let expr = (stmt as unknown as expr_SlotAccessExpr);
            let objHash = expr.objectExpr == null ? 'null' : this.hashStmt(expr.objectExpr);
            if (expr.arrayExpr == null) {
                return crypto.createHash('sha256').update(`${objHash}.${expr.slotName.lexeme.toLowerCase()}`).digest('base64');
            } else {
                return crypto.createHash('sha256').update(`${objHash}[${this.hashStmt(expr.arrayExpr)}].${expr.slotName.lexeme.toLowerCase()}`).digest('base64');
            }
        });
        funcMap.set(expr_SlotAssignExpr, () => {
            let expr = (stmt as unknown as expr_SlotAssignExpr);
            let objHash = expr.objectExpr == null ? 'null' : this.hashStmt(expr.objectExpr);
            if (expr.arrayExpr == null) {
                return crypto.createHash('sha256').update(`${objHash}.${expr.slotName.lexeme.toLowerCase()} = ${this.hashStmt(expr.expr)}`).digest('base64');
            } else {
                return crypto.createHash('sha256').update(`${objHash}[${this.hashStmt(expr.arrayExpr)}].${expr.slotName.lexeme.toLowerCase()} = ${this.hashStmt(expr.expr)}`).digest('base64');
            }
        });
        funcMap.set(expr_SlotAssignOpExpr, () => {
            let expr = (stmt as unknown as expr_SlotAssignOpExpr);
            expr.getAssignOpTypeOp(); // fix ++/--;
            let objHash = expr.objectExpr == null ? 'null' : this.hashStmt(expr.objectExpr);
            if (expr.arrayExpr == null) {
                return crypto.createHash('sha256').update(`${objHash}.${expr.slotName.lexeme.toLowerCase()} ${expr.op.lexeme} ${this.hashStmt(expr.expr)}`).digest('base64');
            } else {
                return crypto.createHash('sha256').update(`${objHash}[${this.hashStmt(expr.arrayExpr)}].${expr.slotName.lexeme.toLowerCase()} ${expr.op.lexeme} ${this.hashStmt(expr.expr)}`).digest('base64');
            }
        });
        funcMap.set(expr_IfStmt, () => {
            let ifstmt = (stmt as unknown as expr_IfStmt);
            let bodyhash = ifstmt.body.map(x => this.hashStmt(x)).join('');
            let condhash = this.hashStmt(ifstmt.condition);
            let elsehash = ifstmt.elseBlock != null ? ifstmt.elseBlock.map(x => this.hashStmt(x)).join('') : '';
            return crypto.createHash('sha256').update(`if (${condhash}) { ${bodyhash} } else { ${elsehash} }`).digest('base64');
        });
        funcMap.set(expr_LoopStmt, () => {
            let loopstmt = (stmt as unknown as expr_LoopStmt);
            let initHash = loopstmt.init != null ? this.hashStmt(loopstmt.init) : '';
            let condHash = this.hashStmt(loopstmt.condition);
            let endHash = loopstmt.end != null ? this.hashStmt(loopstmt.end) : '';
            let bodyHash = loopstmt.body.map(x => this.hashStmt(x)).join('');
            return crypto.createHash('sha256').update(`for (${initHash}; ${condHash}; ${endHash}) { ${bodyHash} }`).digest('base64');
        });
        funcMap.set(expr_FuncCallExpr, () => {
            let expr = (stmt as unknown as expr_FuncCallExpr);
            let argshash = expr.args.map(x => this.hashStmt(x)).join(',');
            if (expr.callType === 0)
                return crypto.createHash('sha256').update(`${expr.namespace != null ? expr.namespace.lexeme.toLowerCase() + '::' : ''}${expr.name.lexeme.toLowerCase()}(${argshash})`).digest('base64');
            if (expr.callType === 1)
                return crypto.createHash('sha256').update(`.${expr.name.lexeme.toLowerCase()}(${argshash})`).digest('base64');
            if (expr.callType === 2)
                return crypto.createHash('sha256').update(`Parent::${expr.name.lexeme.toLowerCase()}(${argshash})`).digest('base64');
        });
        funcMap.set(expr_FunctionDeclStmt, () => {
            let expr = (stmt as unknown as expr_FunctionDeclStmt);
            let argshash = expr.args.map(x => x.name.lexeme.toLowerCase()).join(',');
            let qualifiedName = (expr.packageName != null ? expr.packageName.lexeme.toLowerCase() : '') + '::' +
                (expr.namespace != null ? expr.namespace.lexeme.toLowerCase() : '') + '::' + expr.functionName.lexeme.toLowerCase();
            let bodyHash = expr.stmts.map(x => this.hashStmt(x)).join('');
            return crypto.createHash('sha256').update(`function ${qualifiedName}(${argshash}) { ${bodyHash} }`).digest('base64');
        });
        funcMap.set(expr_ObjectDeclExpr, () => {
            let expr = (stmt as unknown as expr_ObjectDeclExpr);
            // Check for MissionInfo, don't hash this!
            if (expr.objectNameExpr.print(0, false).toLowerCase() === 'missioninfo') return '';
            let objNameHash = this.hashStmt(expr.objectNameExpr);
            let argsHash = expr.args.map(x => this.hashStmt(x)).join(',');
            let parentObject = expr.parentObject != null ? expr.parentObject.lexeme.toLowerCase() : '';
            let classNameHash = this.hashStmt(expr.className);
            let slotHashes = expr.slotDecls.map(x => this.hashStmt(x)).sort().join(''); // Order independent
            let subObjects = expr.subObjects.map(x => this.hashStmt(x as unknown as expr_Stmt)).sort().join(''); // Order independent
            return crypto.createHash('sha256').update(`${expr.structDecl ? 'datablock' : 'new'} ${parentObject}::${classNameHash}(${objNameHash}, ${argsHash}) { ${slotHashes} ${subObjects} }`).digest('base64');
        });

        return funcMap.get(stmt.constructor)();
    }
}