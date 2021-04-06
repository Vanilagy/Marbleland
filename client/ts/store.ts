import { createStore } from "vuex";
import { LevelInfo } from "../../shared/types";

export const store = createStore({
	state: {
		currentLevelInfo: null as LevelInfo,
		searchState: {
			levels: null as LevelInfo[],
			query: '',
			levelSearchStrings: new Map<LevelInfo, string>(),
			ready: false,
			shownCount: 24,
			filterShown: false,
			filter: {
				modification: {
					label: 'Modification',
					value: 'all',
					options: [
						{ name: 'all', label: 'All'},
						{ name: 'gold', label: 'Gold'},
						{ name: 'platinum', label: 'Platinum'},
						{ name: 'fubar', label: 'Fubar'},
						{ name: 'ultra', label: 'Ultra'},
						{ name: 'platinumquest', label: 'PlatinumQuest'}
					]
				},
				gameType: {
					label: 'Game type',
					value: 'all',
					options: [
						{ name: 'all', label: 'All'},
						{ name: 'singlePlayer', label: 'Single-player'},
						{ name: 'multiplayer', label: 'Multiplayer '}
					]
				},
				hasGems: {
					label: 'Has gems',
					value: 'all',
					options: [
						{ name: 'all', label: "Don't care"},
						{ name: 'yes', label: 'Yes'},
						{ name: 'no', label: 'No'}
					]
				},
				hasEasterEgg: {
					label: 'Has Easter Egg',
					value: 'all',
					options: [
						{ name: 'all', label: "Don't care"},
						{ name: 'yes', label: 'Yes'},
						{ name: 'no', label: 'No'}
					]
				},
				sort: {
					label: 'Sort by',
					value: 'name',
					options: [
						{ name: 'name', label: "Level name"},
						{ name: 'artist', label: 'Level artist'},
						{ name: 'id', label: 'Level ID'},
						{ name: 'gemCount', label: 'Gem count'}
					]
				},
			}
		}
	}
});

export type StoreType = typeof store;