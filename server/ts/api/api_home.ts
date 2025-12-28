import { LevelInfo, HomeInfo } from "../../../shared/types";
import { db } from "../globals";
import { MissionDoc, Mission } from "../mission";
import { app } from "../server";
import { FEATURE_SCORE_THRESHOLD } from "../../../shared/constants";

export const initHomeApi = () => {
	// Send info necessary for the home page
	app.get('/api/home/info', async (req, res) => {
		// Get a list of the newest levels
		let missionDocs = await db.missions.find({}) as MissionDoc[];
		missionDocs.sort((a, b) => b.addedAt - a.addedAt);
		missionDocs = missionDocs.slice(0, 12); // 12 because 12 = lcm(1, 2, 3, 4) so it looks good on all screen sizes

		let latestLevels: LevelInfo[] = [];
		for (let missionDoc of missionDocs) {
			let mission = Mission.fromDoc(missionDoc);
			latestLevels.push(mission.createLevelInfo());
		}

		let featuredDocs = await db.missions.find({ curationScore: { $gte: FEATURE_SCORE_THRESHOLD } }) as MissionDoc[];
		featuredDocs.sort((a, b) => b.addedAt - a.addedAt);
		featuredDocs = featuredDocs.slice(0, 12);

		let featuredLevels: LevelInfo[] = [];
		for (let missionDoc of featuredDocs) {
			let mission = Mission.fromDoc(missionDoc);
			featuredLevels.push(mission.createLevelInfo());
		}

		let result: HomeInfo = { featuredLevels, latestLevels };

		res.send(result);
	});
};