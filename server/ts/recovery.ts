// This file contains some to recover state after a data loss that occurred in September 2023.

import { PackDoc } from "./pack";
import fs from 'fs-extra';
import path from 'path';
import { db } from "./globals";
import { MissionDoc } from "./mission";

interface RecoveryState {
    missionIdToOldUploaderId: Record<string, number | undefined>,
    oldUsernameToOldAccountId: Record<string, number>,
    newAccountIdToOldAccountId: Record<string, number>,
    orphanedPacks: PackDoc[]
}

export let recoveryState: RecoveryState;
let recoveryStatePath = path.join(__dirname, 'storage', 'recovery_state.json');

if (fs.existsSync(recoveryStatePath)) {
    recoveryState = JSON.parse(fs.readFileSync(recoveryStatePath).toString());
}

export const tryAssociatingOldUserData = async (newUsername: string, newAccountId: number) => {
    if (!recoveryState) return;

    let oldAccountId = recoveryState.oldUsernameToOldAccountId[newUsername];
    if (oldAccountId !== undefined) {
        await associateNewAccountIdWithOldAccountId(newAccountId, oldAccountId);
    }
};

export const associateNewAccountIdWithOldAccountId = async (newAccountId: number, oldAccountId: number) => {
    recoveryState.newAccountIdToOldAccountId[newAccountId] = oldAccountId;

    let missionIds = Object.entries(recoveryState.missionIdToOldUploaderId).filter(x => x[1] === oldAccountId).map(x => +x[0]);
    for (let missionId of missionIds) {
        let doc = await db.missions.findOne({ _id: missionId }) as MissionDoc;
        if (doc.addedBy != undefined) continue;

        doc.addedBy = newAccountId;
        await db.missions.update({ _id: doc._id }, doc);
    }

    let packDocs = recoveryState.orphanedPacks.filter(x => x.createdBy === oldAccountId);
    for (let doc of packDocs) {
        doc.createdBy = newAccountId;
        await db.packs.insert(doc);
        recoveryState.orphanedPacks.splice(recoveryState.orphanedPacks.indexOf(doc), 1);
    }

    await fs.writeFile(recoveryStatePath, JSON.stringify(recoveryState, null, 4));
};