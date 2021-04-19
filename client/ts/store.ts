import { createStore } from "vuex";
import { ExtendedLevelInfo, ExtendedPackInfo, ExtendedProfileInfo, ProfileInfo, SignInInfo } from "../../shared/types";

export const createNewStore = () => {
	return createStore({
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
			/** Stores the profile info of the own, currently logged-in account. */
			loggedInAccount: null as ProfileInfo,
			/** Stoers a list of all own packs. */
			ownPacks: null as SignInInfo["packs"],
			/** Used to update images accordingly. */
			avatarVersion: 0,
			/** Used to trigger banner messages. */
			nextInfoBannerMessage: null as string,
			levelRemarksMaxLength: 10000,
			packNameMaxLength: 64,
			packDescriptionMaxLength: 1000,

			// SSR stuff:
			levelPreload: null as ExtendedLevelInfo,
			packPreload: null as ExtendedPackInfo,
			profilePreload: null as ExtendedProfileInfo
		}
	});
};

// Create a default store that will be used client-side
export const store = createNewStore();
export type StoreType = typeof store;