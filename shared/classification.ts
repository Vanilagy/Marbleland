import { MissionElementScriptObject } from "../server/ts/io/mis_parser";
import { GameType, Modification } from "./types";

// Classification logic is shared because it's also needed client-side during level editing, for example

/** Try to guess the game type of this mission. */
export const guessGameType = (missionInfo: MissionElementScriptObject, relativePath: string, dependencies: string[]) => {
	let i = missionInfo;

	if (i.gametype) return (i.gametype.toLowerCase() === 'singleplayer')? GameType.SinglePlayer : GameType.Multiplayer; // Explicitly set in the .mis
	if (relativePath.startsWith('multiplayer/')) return GameType.Multiplayer;

	// "Telltale" multiplayer stuff
	if (i.score0 || i.score1 ||
		i.goldscore0 || i.goldscore1 ||
		i.platinumscore0 || i.platinumscore1 ||
		i.ultimatescore0 || i.ultimatescore1 ||
		i.awesomescore0 || i.awesomescore1)
		return GameType.Multiplayer;

	for (let dependency of dependencies) {
		if (dependency.startsWith('multiplayer/interiors')) return GameType.Multiplayer;
	}

	return GameType.SinglePlayer;
};

/** Try to guess the modification (game) this mission was made for / is compatible with. */
export const guessModification = (missionInfo: MissionElementScriptObject, hasEasterEgg: boolean, dependencies: string[]) => {
	const index = {
		[Modification.Gold]: 0,
		[Modification.Platinum]: 1,
		[Modification.Fubar]: 1,
		[Modification.Ultra]: 1,
		[Modification.PlatinumQuest]: 2
	};
	const stringMap = {
		"gold": Modification.Gold,
		"platinum": Modification.Platinum,
		"fubar": Modification.Fubar,
		"ultra": Modification.Ultra,
		"platinumquest": Modification.PlatinumQuest
	};

	let i = missionInfo;

	if (i.game && !i.game.toLowerCase().startsWith('custom')) return stringMap[i.game.toLowerCase() as keyof typeof stringMap];
	if (i.modification) return stringMap[i.modification.toLowerCase() as keyof typeof stringMap];

	let result = Modification.Gold;

	const pickHigher = (mod: Modification) => {
		if (index[mod] > index[result]) result = mod;
	};

	if (i.platinumtime) pickHigher(Modification.PlatinumQuest); // Added in PQ
	if (i.awesometime) pickHigher(Modification.PlatinumQuest);
	if (i.awesomescore) pickHigher(Modification.PlatinumQuest);
	if (i.awesomescore0 || i.awesomescore1) pickHigher(Modification.PlatinumQuest);

	if (i.ultimatetime) pickHigher(Modification.Platinum);
	if (i.ultimatescore) pickHigher(Modification.Platinum);
	if (i.score0 || i.score1) pickHigher(Modification.Platinum);
	if (i.platinumscore0 || i.platinumscore1) pickHigher(Modification.Platinum);
	if (i.ultimatescore0 || i.ultimatescore1) pickHigher(Modification.Platinum);
	if (hasEasterEgg) pickHigher(Modification.Platinum);

	for (let dependency of dependencies) {
		if (dependency.startsWith('pq_')) pickHigher(Modification.PlatinumQuest);
		if (dependency.startsWith('interiors_pq')) pickHigher(Modification.PlatinumQuest);
		if (dependency.startsWith('lbinteriors_pq')) pickHigher(Modification.PlatinumQuest);
		if (dependency.startsWith('mbp_')) pickHigher(Modification.Platinum);
		if (dependency.startsWith('interiors_mbp')) pickHigher(Modification.Platinum);
		if (dependency.startsWith('lbinteriors_mbp')) pickHigher(Modification.Platinum);
		if (dependency.startsWith('fubargame')) pickHigher(Modification.Fubar);
		if (dependency.startsWith('mbu_')) pickHigher(Modification.Ultra);
	}

	return result;
};