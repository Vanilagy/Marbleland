import { LevelInfo, HomeInfo } from "../../../shared/types";
import { LEVEL_FILTER_THRESHOLD } from "../../../shared/constants";
import { db } from "../globals";
import { MissionDoc, Mission } from "../mission";
import { app } from "../server";

export const initHomeApi = () => {
	// Send info necessary for the home page
	app.get('/api/home/info', async (req, res) => {
		// Get all missions and sort by newest
		let allDocs = await db.missions.find({}) as MissionDoc[];
		allDocs.sort((a, b) => b.addedAt - a.addedAt);

		// Filter and slice curated levels
		const filteredDocs = allDocs
			.filter(doc => Mission.fromDoc(doc).calculateCurationScore() >= LEVEL_FILTER_THRESHOLD)
			.slice(0, 12);

		// Convert to LevelInfo arrays
		const filteredLevels: LevelInfo[] = filteredDocs.map(doc => 
			Mission.fromDoc(doc).createLevelInfo()
		);

		const allLevels: LevelInfo[] = allDocs
			.slice(0, 12)
			.map(doc => Mission.fromDoc(doc).createLevelInfo());

		const result: HomeInfo = { allLevels, filteredLevels };
		res.send(result);
	});
};
