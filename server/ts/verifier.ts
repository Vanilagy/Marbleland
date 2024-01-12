import * as fs from 'fs-extra';
import * as path from 'path';
import { Scanner, Parser, IASTVisitor, expr_AssignExpr, expr_AssignOpExpr, expr_BinaryExpr, expr_BreakStmt, expr_CommaCatExpr, expr_ConditionalExpr, expr_ConstantExpr, expr_ContinueStmt, expr_Expr, expr_FloatBinaryExpr, expr_FloatExpr, expr_FloatUnaryExpr, expr_FuncCallExpr, expr_FunctionDeclStmt, expr_IfStmt, expr_IntBinaryExpr, expr_IntExpr, expr_IntUnaryExpr, expr_LoopStmt, expr_ObjectDeclExpr, expr_ParenthesisExpr, expr_ReturnStmt, expr_SlotAccessExpr, expr_SlotAssignExpr, expr_SlotAssignOpExpr, expr_Stmt, expr_StrCatExpr, expr_StrEqExpr, expr_StringConstExpr, expr_VarExpr } from '../lib/hxTorquescript';
import { Mission, MissionDoc } from './mission';


class VerifierListener implements IASTVisitor {

    valid: boolean;
    malicious: boolean;

    constructor() {
        this.valid = true;
        this.malicious = false;
    }

    visitStmt(stmt: expr_Stmt): void {
    }
    visitBreakStmt(stmt: expr_BreakStmt): void {
    }
    visitContinueStmt(stmt: expr_ContinueStmt): void {
    }
    visitExpr(expr: expr_Expr): void {
    }
    visitParenthesisExpr(expr: expr_ParenthesisExpr): void {
    }
    visitReturnStmt(stmt: expr_ReturnStmt): void {
    }
    visitIfStmt(stmt: expr_IfStmt): void {
        this.valid = false;
        // console.log("If statement at: " + stmt.lineNo);
    }
    visitLoopStmt(stmt: expr_LoopStmt): void {
        this.valid = false;
        // console.log("Loop statement at: " + stmt.lineNo);
    }
    visitBinaryExpr(expr: expr_BinaryExpr): void {
    }
    visitFloatBinaryExpr(expr: expr_FloatBinaryExpr): void {
    }
    visitIntBinaryExpr(expr: expr_IntBinaryExpr): void {
    }
    visitStrEqExpr(expr: expr_StrEqExpr): void {
    }
    visitStrCatExpr(expr: expr_StrCatExpr): void {
    }
    visitCommatCatExpr(expr: expr_CommaCatExpr): void {
    }
    visitConditionalExpr(expr: expr_ConditionalExpr): void {
    }
    visitIntUnaryExpr(expr: expr_IntUnaryExpr): void {
    }
    visitFloatUnaryExpr(expr: expr_FloatUnaryExpr): void {
    }
    visitVarExpr(expr: expr_VarExpr): void {
    }
    visitIntExpr(expr: expr_IntExpr): void {
    }
    visitFloatExpr(expr: expr_FloatExpr): void {
    }
    visitStringConstExpr(expr: expr_StringConstExpr): void {
    }
    visitConstantExpr(expr: expr_ConstantExpr): void {
    }
    visitAssignExpr(expr: expr_AssignExpr): void {
        this.valid = false;
        let varName = expr.varExpr.name.lexeme.toLowerCase();
        if (varName === "$lb" || varName.startsWith("$game::") || varName.startsWith("$crc"))
            this.malicious = true;
        // console.log("Assignment Expression at " + expr.lineNo);
    }
    visitAssignOpExpr(expr: expr_AssignOpExpr): void {
        this.valid = false;
        let varName = expr.varExpr.name.lexeme.toLowerCase();
        if (varName === "$lb" || varName.startsWith("$game::") || varName.startsWith("$crc"))
            this.malicious = true;
        // console.log("Assign Op Expression at " + expr.lineNo);
    }
    visitFuncCallExpr(expr: expr_FuncCallExpr): void {
        this.valid = false;
        let fnName = expr.name.lexeme.toLowerCase();
        if (["exec", "eval", "dump", "call", "tree", "winconsole", "dbgsetparameters", "telnetsetparameters", "deletefile", "movefile", "deletevariables"].includes(fnName))
            this.malicious = true;
        // console.log("Function Call Expression at " + expr.lineNo);
    }
    visitSlotAccessExpr(expr: expr_SlotAccessExpr): void {
    }
    visitSlotAssignExpr(expr: expr_SlotAssignExpr): void {
        if (expr.objectExpr != null) { // Its not for object
            this.valid = false;
            // console.log("Slot Assignment Expression at " + expr.lineNo);
        }
    }
    visitSlotAssignOpExpr(expr: expr_SlotAssignOpExpr): void {
        if (expr.objectExpr != null) {
            this.valid = false;
            // console.log("Slot Assignment Op Expression at " + expr.lineNo);
        }
    }
    visitObjectDeclExpr(expr: expr_ObjectDeclExpr): void {
        if (expr.structDecl) {
            this.valid = false;
        }
        if (expr.objectNameExpr != null) {
            if (expr.objectNameExpr instanceof expr_StringConstExpr || expr.objectNameExpr instanceof expr_ConstantExpr) {
                // Lmao
            } else {
                this.valid = false;
                // console.log("Invalid object name at " + expr.lineNo);
            }
        }
        if (!(expr.className instanceof expr_ConstantExpr)) {
            this.valid = false;
            // console.log("Invalid object class name at " + expr.lineNo);
        }
        if (expr.parentObject != null) {
            this.valid = false;
            // console.log("Object parent at " + expr.lineNo);
        }

    }
    visitFunctionDeclStmt(stmt: expr_FunctionDeclStmt): void {
        this.valid = false;
        // console.log("Function Declaration at " + stmt.lineNo);
    }

}

export class MissionVerifier {
    public static async verifyNoCustomCode(mission?: Mission, misContents?: string) {
        let missionText = mission !== null ? (await fs.readFile(path.join(mission.baseDirectory, mission.relativePath))).toString() : misContents;

        try {
            let x = new Scanner(missionText);
            let tokens = x.scanTokens();

            let p = new Parser(tokens);
            let stmts = p.parse();

            // Check the AST
            let verifier = new VerifierListener();
            for (let stmt of stmts) {
                stmt.visitStmt(verifier);
            }

            let beginpos = missionText.indexOf("//--- OBJECT WRITE BEGIN ---");
            let endpos = missionText.indexOf("//--- OBJECT WRITE END ---");

            if (beginpos == -1 || endpos == -1 || beginpos > endpos) {
                verifier.valid = false;
            }

            if (verifier.valid) {
                let substr = missionText.substring(beginpos, endpos);
                let subtoks = new Scanner(substr).scanTokens();
                let subp = new Parser(subtoks);
                let substmts = subp.parse();

                if (substmts.length != 1) {
                    verifier.valid = false;
                } else {
                    if (substmts[0] instanceof expr_ObjectDeclExpr) {
                        let mg: expr_ObjectDeclExpr = substmts[0] as unknown as expr_ObjectDeclExpr;
                    
                        if (mg.objectNameExpr instanceof expr_StringConstExpr) {
                            let svalexpr = mg.objectNameExpr as expr_StringConstExpr;
                            if (svalexpr.value != "MissionGroup") {
                                verifier.valid = false;
                            }
                        }
                        if (mg.objectNameExpr instanceof expr_ConstantExpr) {
                            let svalexpr = mg.objectNameExpr as expr_ConstantExpr;
                            if (svalexpr.name.lexeme != "MissionGroup") {
                                verifier.valid = false;
                            }
                        }
                    } else {
                        verifier.valid = false;
                    }
                }
            }

            return {
                valid: verifier.valid,
                malicious: verifier.malicious
            };
        } catch (e) {
            return {
                valid: false,
                malicious: false
            };// Yeah no-
        }
    }
}