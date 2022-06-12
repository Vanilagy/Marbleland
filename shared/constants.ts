export const ORIGIN = 'https://marbleland.vani.ga';

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