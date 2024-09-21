import { Mission } from "../server/ts/mission"

export enum GameType {
	SinglePlayer = "single",
	Multiplayer = "multi"
}

export enum Modification {
	Gold = "gold",
	Platinum = "platinum",
	Fubar = "fubar",
	Ultra = "ultra",
	PlatinumQuest = "platinumquest"
}

export type DataDefinition<T extends string> = {
	id: string,
	name: string,
	datablockCompatibility: Mission['datablockCompatibility'],
} & { [K in T]: string };

export type GameDefinition = DataDefinition<"playUrl">;
export type LeaderboardDefinition = DataDefinition<'queryUrl'>;

export interface LeaderboardScore {
	username: string,
	score: number,
	score_type: 'time' | 'score',
	placement: number
}

/** Contains metadata about a level. */
export interface LevelInfo {
	id: number,
	baseName: string,
	gameType: GameType,
	modification: Modification,
	name: string,
	artist: string,
	desc: string,
	addedAt: number,
	gameMode: string,
	editedAt: number,

	qualifyingTime: number,
	goldTime: number,
	platinumTime: number,
	ultimateTime: number,
	awesomeTime: number,

	qualifyingScore: number,
	goldScore: number,
	platinumScore: number,
	ultimateScore: number,
	awesomeScore: number,

	gems: number,
	hasEasterEgg: boolean,

	downloads: number,
	lovedCount: number,
	
	hasCustomCode: boolean,
	datablockCompatibility: Mission['datablockCompatibility']
}

/** Contains metadata about a level, as well as additional data to display on the Level page. */
export interface ExtendedLevelInfo extends LevelInfo {
	addedBy: ProfileInfo,
	remarks: string,
	packs: PackInfo[],
	comments: CommentInfo[],
	missesDependencies: boolean,
	lovedByYou: boolean,
	hasPrevImage: boolean,
	missionInfo: Record<string, string>,
	dependencies: string[],
	playInfo: GameDefinition[],
	leaderboardInfo: LeaderboardDefinition[]
}

/** Contains metadata about a profile. */
export interface ProfileInfo {
	id: number,
	username: string,
	hasAvatar: boolean,
	isModerator: boolean
}

/** Contains metadata about a profile, as well as additional data to display on the Profile page. */
export interface ExtendedProfileInfo extends ProfileInfo {
	bio: string,
	uploadedLevels: LevelInfo[],
	createdPacks: PackInfo[]
}

/** Contains data that is remembered by the client upon login. */
export interface SignInInfo {
	profile: ProfileInfo,
	/** A list of all packs belonging to that user. */
	packs: {
		id: number,
		name: string,
		levelIds: number[]
	}[],
	/** Whether the user has acknowledged the content guidelines. */	
	acknowledgedGuidelines: boolean
}

/** Contains metadata about a pack. */
export interface PackInfo {
	id: number,
	name: string,
	createdBy: ProfileInfo,
	createdAt: number,
	levelIds: number[],
	downloads: number,
	lovedCount: number
}

/** Contains metadata about a pack, as well as additional data to display on the Pack page. */
export interface ExtendedPackInfo {
	id: number,
	name: string,
	description: string,
	createdBy: ProfileInfo,
	createdAt: number,
	levels: LevelInfo[],
	downloads: number,
	lovedCount: number,
	lovedByYou: boolean
}

/** Describes a comment. */
export interface CommentInfo {
	id: number,
	author: ProfileInfo,
	time: number,
	content: string
}

/** Describes the data displayed on the Home page. */
export interface HomeInfo {
	latestLevels: LevelInfo[]
}