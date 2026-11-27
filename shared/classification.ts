import { MissionElementScriptObject } from "../server/ts/mis_parser";
import { GameType, Modification } from "./types";

// Classification logic is shared because it's also needed client-side during level editing, for example

export const GAME_TYPE_STRINGS = new Map([
	["singleplayer", GameType.SinglePlayer],
	["multiplayer", GameType.Multiplayer]
]);

/** Try to guess the game type of this mission. */
export const guessGameType = (missionInfo: MissionElementScriptObject, relativePath: string, dependencies: string[]) => {
	let i = missionInfo;

	const explicitGameType = GAME_TYPE_STRINGS.get(i.gametype?.toLowerCase() ?? '');
	if (explicitGameType) return explicitGameType;

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

export const MODIFICATION_STRINGS = new Map([
	["gold", Modification.Gold],
	["platinum", Modification.Platinum],
	["ultra", Modification.Ultra],
	["platinumquest", Modification.PlatinumQuest]
]);

/** Try to guess the modification (game) this mission was made for / is compatible with. */
export const guessModification = (missionInfo: MissionElementScriptObject, hasEasterEgg: boolean, dependencies: string[]) => {
	const index = {
		[Modification.Gold]: 0,
		[Modification.Platinum]: 1,
		[Modification.Ultra]: 1,
		[Modification.PlatinumQuest]: 2
	};

	let i = missionInfo;

	const explicitModification = MODIFICATION_STRINGS.get(i.game?.toLowerCase() ?? '') ?? MODIFICATION_STRINGS.get(i.modification?.toLowerCase() ?? '');
	if (explicitModification) return explicitModification;

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
		if (dependency.startsWith('mbu_')) pickHigher(Modification.Ultra);
	}

	return result;
};