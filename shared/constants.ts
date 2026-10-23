export const ORIGIN = 'https://marbleland.vaniverse.io';

/** Defines a list of properties of a .mis file's MissionInfo that are allowed to be edited. Generally, properties are editable iff they don't change gameplay. */
export const MUTABLE_MISSION_INFO_FIELDS = [
	'name',
	'artist',
	'desc',
	'music',
	'starthelptext',
	'persiststarthelptexttime',
	'level',
	'trivia',

	'time',
	'goldtime',
	'platinumtime',
	'ultimatetime',
	'awesometime',

	'score',
	'goldscore',
	'platinumscore',
	'ultimatescore',
	'awesomescore',

	'score0',
	'goldscore0',
	'platinumscore0',
	'ultimatescore0',
	'awesomescore0',
	'score1',
	'goldscore1',
	'platinumscore1',
	'ultimatescore1',
	'awesomescore1',

	'alarmstarttime',
	'generalhint',
	'ultimatehint',
	'awesomehint',
	'egghint',

	'menucamerafov'
];

/** Minimum curator score a level can have before considered spam */
export const LEVEL_FILTER_THRESHOLD = -1;

// Maximum lengths of user-entered text, in characters
export const USERNAME_MAX_LENGTH = 24;
export const BIO_MAX_LENGTH = 1000;
export const COMMENT_MAX_LENGTH = 2000;
export const LEVEL_REMARKS_MAX_LENGTH = 10000;
export const PACK_NAME_MAX_LENGTH = 64;
export const PACK_DESCRIPTION_MAX_LENGTH = 1000;
export const SUSPENSION_REASON_MAX_LENGTH = 500;