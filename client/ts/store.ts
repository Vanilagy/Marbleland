import { createStore } from "vuex";
import { ProfileInfo, SignInInfo } from "../../shared/types";

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
				},
				reversed: false
			},
			levelsVersion: 0
		},
		loggedInAccount: null as ProfileInfo,
		ownPacks: null as SignInInfo["packs"],
		avatarVersion: 0,
		nextInfoBannerMessage: null as string,
		levelRemarksMaxLength: 10000,
		packNameMaxLength: 64,
		packDescriptionMaxLength: 1000
	}
});

export type StoreType = typeof store;