import { LevelInfo, HomeInfo } from "../../../shared/types";
import { LEVEL_FILTER_THRESHOLD } from "../../../shared/constants";
import { db } from "../globals";
import { MissionDoc, Mission } from "../mission";
import { app } from "../server";

export const initHomeApi = () => {
	// Send info necessary for the home page
	app.get('/api/home/info', async (req, res) => {
		// Get a list of the newest levels
		let missionDocs = await db.missions.find({ curationScore: { $gte: LEVEL_FILTER_THRESHOLD } }) as MissionDoc[];
		missionDocs.sort((a, b) => b.addedAt - a.addedAt);
		missionDocs = missionDocs.slice(0, 12); // 12 because 12 = lcm(1, 2, 3, 4) so it looks good on all screen sizes

		let filteredLevels: LevelInfo[] = [];
		for (let missionDoc of missionDocs) {
			let mission = Mission.fromDoc(missionDoc);
			filteredLevels.push(mission.createLevelInfo());
		}

		let allDocs = await db.missions.find({}) as MissionDoc[];
		allDocs.sort((a, b) => b.addedAt - a.addedAt);
		allDocs = allDocs.slice(0, 12);

		let allLevels: LevelInfo[] = [];
		for (let missionDoc of allDocs) {
			let mission = Mission.fromDoc(missionDoc);
			allLevels.push(mission.createLevelInfo());
		}

		let result: HomeInfo = { allLevels, filteredLevels };

		res.send(result);
	});
};