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

export type DataDefinitionBase = {
	id: string,
	name: string,
	datablockCompatibilities: Mission['datablockCompatibility'][],
	customCodeAllowed: boolean
};

export type GameDefinition = DataDefinitionBase & { playUrl: string };
export type LeaderboardDefinition = DataDefinitionBase & { queryUrl: string };
export type ReducedLeaderboardDefinition = Pick<LeaderboardDefinition, 'id' | 'name'>;

export interface LeaderboardScore {
	username: string,
	score: number,
	score_type: 'time' | 'score',
	placement: number
}

/** Contains the content-derived metadata of a level, i.e. everything that is determined purely by the level's files and therefore varies between versions of a level. Does not include any of the level's identity or social data. */
export interface LevelContentInfo {
	baseName: string,
	gameType: GameType,
	modification: Modification,
	name: string,
	artist: string,
	desc: string,
	gameMode: string,

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

	hasCustomCode: boolean,
	datablockCompatibility: Mission['datablockCompatibility']
}

/** Contains metadata about a level: the content of its current version, plus its identity and social data. */
export interface LevelInfo extends LevelContentInfo {
	id: number,
	addedAt: number,
	editedAt: number,

	downloads: number,
	lovedCount: number,

	curationScore: number,
	/** The version number of the level's current (latest) version. A level that has never been updated is at version 1. */
	currentVersion: number
}

/** Contains the metadata of a single level version (as opposed to its content). */
export interface VersionMetadata {
	/** When this version was added. */
	addedAt: number,
	/** The changes made in this version compared to the previous one. */
	changelog: string
}

/** Contains voter info for display in a modal. */
export interface CuratorVoteInfo {
    profile: ProfileInfo,
    vote: boolean
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
	leaderboardInfo: ReducedLeaderboardDefinition[],
	curatorVotes: CuratorVoteInfo[],
	yourVote: boolean,
	/** The content of every superseded version of this level, ordered from oldest to newest. previousVersions[n] contains the content of version n+1 of the level (versions are 1-indexed). The content of the current version is given by the level info itself. Empty for levels that have never been updated. */
	previousVersions: LevelContentInfo[],
	/** The metadata of every version of this level except the first, with the same length as previousVersions but conceptually offset by one: versionMetadata[n] describes version n+2 of the level, meaning the last entry describes the current version. The first version has no metadata; it was added at addedAt and has no changelog. */
	versionMetadata: VersionMetadata[]
}

/** Contains metadata about a profile. */
export interface ProfileInfo {
	id: number,
	username: string,
	hasAvatar: boolean,
	isModerator: boolean,
	isCurator: boolean,
	isSuspended?: boolean,
	suspensionReason?: string,
	levelCount: number
}

/** Contains metadata about a profile, as well as additional data to display on the Profile page. */
export interface ExtendedProfileInfo extends ProfileInfo {
	bio: string,
	uploadedLevels: LevelInfo[],
	favoriteLevels: LevelInfo[],
	createdPacks: PackInfo[],
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
	allLevels: LevelInfo[]
	filteredLevels: LevelInfo[]
}