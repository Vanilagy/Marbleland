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

	qualifyingTime: number,
	goldTime: number,
	platinumTime: number,
	ultimateTime: number,
	awesomeTime: number,
	gems: number,
	hasEasterEgg: boolean
}

export interface ExtendedLevelInfo extends LevelInfo {
	addedBy: ProfileInfo,
	remarks: string,
	packs: PackInfo[],
	comments: CommentInfo[],
	downloads: number
}

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

export interface ProfileInfo {
	id: number,
	username: string,
	hasAvatar: boolean
}

export interface ExtendedProfileInfo extends ProfileInfo {
	bio: string,
	uploadedLevels: LevelInfo[],
	createdPacks: PackInfo[]
}

export interface SignInInfo {
	profile: ProfileInfo,
	packs: {
		id: number,
		name: string,
		levelIds: number[]
	}[]
}

export interface PackInfo {
	id: number,
	name: string,
	createdBy: ProfileInfo,
	createdAt: number,
	levelIds: number[]
}

export interface ExtendedPackInfo {
	id: number,
	name: string,
	description: string,
	createdBy: ProfileInfo,
	createdAt: number,
	levels: LevelInfo[],
	downloads: number
}

export interface CommentInfo {
	id: number,
	author: ProfileInfo,
	time: number,
	content: string
}