import { createStore } from "vuex";
import { ProfileInfo } from "../../shared/types";

export const store = createStore({
	state: {
		searchState: {
			searchBar: {
				query: '',
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
							{ name: 'single', label: 'Single-player'},
							{ name: 'multi', label: 'Multiplayer '}
						]
					},
					hasGems: {
						label: 'Has gems',
						value: 'all',
						options: [
							{ name: 'all', label: "Don't care"},
							{ name: 'no', label: 'No'},
							{ name: 'yes', label: 'Yes'}
						]
					},
					hasEasterEgg: {
						label: 'Has Easter Egg',
						value: 'all',
						options: [
							{ name: 'all', label: "Don't care"},
							{ name: 'no', label: 'No'},
							{ name: 'yes', label: 'Yes'}
						]
					},
					sort: {
						label: 'Sort by',
						value: 'name',
						options: [
							{ name: 'name', label: "Level name"},
							{ name: 'artist', label: 'Level artist'},
							{ name: 'date', label: 'Date added'},
							{ name: 'id', label: 'Level ID'},
							{ name: 'gemCount', label: 'Gem count'},
						]
					}
				}
			},
			levelsVersion: 0
		},
		loggedInAccount: null as ProfileInfo,
		avatarVersion: 0,
		showLevelCreated: false,
		showAccountCreated: false
	}
});

export type StoreType = typeof store;