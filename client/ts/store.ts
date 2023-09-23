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
								{ name: 'single', label: 'Singleplayer'},
								{ name: 'multi', label: 'Multiplayer '}
							]
						},
						gameMode: {
							label: 'Game mode',
							value: 'all',
							options: [
								{ name: 'all', label: "All"},
								{ name: 'null', label: 'Normal'},
								{ name: '2d', label: '2D'},
								{ name: 'collection', label: 'Collection'},
								{ name: 'consistency', label: 'Consistency'},
								{ name: 'coop', label: 'Co-op'},
								{ name: 'elimination', label: 'Elimination'},
								{ name: 'free', label: 'Free'},
								{ name: 'gemmadness', label: 'Gem Madness'},
								{ name: 'ghosts', label: 'Ghosts'},
								{ name: 'haste', label: 'Haste'},
								{ name: 'hunt', label: 'Hunt'},
								{ name: 'king', label: 'King'},
								{ name: 'laps', label: 'Laps'},
								{ name: 'mega', label: 'Mega'},
								{ name: 'party', label: 'Party'},
								{ name: 'props', label: 'Props'},
								{ name: 'quota', label: 'Quota'},
								{ name: 'race', label: 'Race'},
								{ name: 'seek', label: 'Seek'},
								{ name: 'snowball', label: 'Snowball'},
								{ name: 'snowballsonly', label: 'Snowballs Only'},
								{ name: 'spooky', label: 'Spooky'},
								{ name: 'steal', label: 'Steal'},
								{ name: 'tag', label: 'Tag'},
								{ name: 'training', label: 'Training'}
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
							value: 'date',
							options: [
								{ name: 'name', label: "Level name"},
								{ name: 'artist', label: 'Level artist'},
								{ name: 'date', label: 'Date added'},
								{ name: 'id', label: 'Level ID'},
								{ name: 'gemCount', label: 'Gem count'},
								{ name: 'downloads', label: 'Downloads'},
								{ name: 'lovedCount', label: 'Loves'}
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
			nextInfoBannerType: null as 'success' | 'info',

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