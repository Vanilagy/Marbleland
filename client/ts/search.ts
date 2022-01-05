import { LevelInfo } from "../../shared/types";
import { store } from "./store";
import { Util } from "./util";

interface LevelInfoWrapper {
	info: LevelInfo;
	searchString: string;
	sortName: string;
	sortArtist: string;
}

/** Helper class that handles level search. The reason this was extracted from SearchPage.vue is because of the large amount of levels, performance is crucial and doing everything through Proxies really hinders that. */
export abstract class Search {
	static levels: LevelInfo[];
	static wrappers: LevelInfoWrapper[];

	/** Asks the server for a list of all levels. */
	static async loadLevels(reload = false) {
		if (this.levels && !reload) return;

		let response = await fetch('/api/level/list');
		let levelList = await response.json() as LevelInfo[];

		this.levels = levelList;
		// Do some precomputation for faster sorting/searching later on
		this.wrappers = levelList.map(level => {
			let searchString = [level.id, level.name, level.artist, level.baseName].filter(x => x).join(' ');
			searchString = Util.normalizeString(searchString);

			let sortName = Util.normalizeString(level.name ?? '').trim();
			let sortArtist = Util.normalizeString(level.artist ?? '').trim();

			return {
				info: level,
				searchString,
				sortName,
				sortArtist
			};
		});

		store.state.searchState.levelsVersion++; // Increase the version to tell the search page to update
	}

	/** Returns a list of filtered levels based on the current search bar state. */
	static filter() {
		let searchState = store.state.searchState;
		let normalizedQuery = Util.normalizeString(searchState.searchBar.query);
		let filter = searchState.searchBar.filter;

		let words = normalizedQuery.split(' ');
		let filtered = this.wrappers.filter(x => {
			// Check if it matches the search query
			let matchCount = 0;
			for (let i = 0; i < words.length; i++) {
				let word = words[i];
				if (x.searchString.includes(word)) matchCount++;
				else break;
			}
			if (matchCount < words.length) return false;

			let info = x.info;

			// Apply additional filtering
			if (filter.modification.value !== 'all' && info.modification !== filter.modification.value) return false;
			if (filter.gameType.value !== 'all' && info.gameType !== filter.gameType.value) return false;
			if (filter.hasGems.value !== 'all' && (info.gems > 0) !== (filter.hasGems.value === 'yes')) return false;
			if (filter.hasEasterEgg.value !== 'all' && info.hasEasterEgg !== (filter.hasEasterEgg.value === 'yes')) return false;
			outer:
			if (filter.gameMode.value !== 'all') {
				if (filter.gameMode.value === 'null' && !info.gameMode) break outer;
				if (!info.gameMode?.includes(filter.gameMode.value)) return false;
			}

			return true;
		});

		const cmpStr = (a: string, b: string) => {
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		};

		// Determine the correct sorting function to use
		let sortingFunction: (a: LevelInfoWrapper, b: LevelInfoWrapper) => number;
		switch (filter.sort.value) {
			case 'name': sortingFunction = (a, b) => cmpStr(a.sortName, b.sortName); break;
			case 'artist': sortingFunction = (a, b) => cmpStr(a.sortArtist, b.sortArtist); break;
			case 'date': sortingFunction = (a, b) => -(a.info.addedAt - b.info.addedAt); break;
			case 'id': sortingFunction = (a, b) => a.info.id - b.info.id; break;
			case 'gemCount': sortingFunction = (a, b) => a.info.gems - b.info.gems; break;
		}

		// Bring the levels into the right order
		filtered.sort(sortingFunction);
		if (searchState.searchBar.reversed) filtered.reverse();

		return filtered.map(x => x.info);
	}

	/** Checks if the stored level list includes `id`. If not, causes a server resync. */
	static checkForRefresh(id: number) {
		if (!this.levels) return false;

		if (!this.levels.some(x => x.id === id)) {
			this.loadLevels(true);
		}
	}
}