import { LevelInfo, PackInfo } from "../../shared/types";
import { AccountDoc, getProfileInfo } from "./account";
import { db } from "./globals";
import { Mission, MissionDoc } from "./mission";

export interface PackDoc {
	_id: number,
	name: string,
	description: string,
	createdAt: number,
	createdBy: number,
	levels: number[]
}

export const getPackInfo = async (doc: PackDoc): Promise<PackInfo> => {
	let accountDoc = await db.accounts.findOne({ _id: doc.createdBy }) as AccountDoc;
	let levelInfos: LevelInfo[] = [];

	for (let levelId of doc.levels) {
		let missionDoc = await db.missions.findOne({ _id: levelId }) as MissionDoc;
		if (!missionDoc) continue;
		let mission = Mission.fromDoc(missionDoc);
		levelInfos.push(mission.createLevelInfo());
	}

	return {
		id: doc._id,
		name: doc.name,
		description: doc.description,
		createdBy: await getProfileInfo(accountDoc),
		createdAt: doc.createdAt,
		levels: levelInfos
	};
};