import { LevelInfo } from "../../shared/types";
import { store } from "./store";
import { Util } from "./util";

interface LevelInfoWrapper {
	info: LevelInfo;
	searchString: string;
	sortName: string;
	sortArtist: string;
}

export abstract class Search {
	static levels: LevelInfo[];
	static wrappers: LevelInfoWrapper[];

	static async loadLevels() {
		if (this.levels) return;

		let response = await fetch('/api/list');
		let levelList = await response.json() as LevelInfo[];

		this.levels = levelList;
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
	}

	static filter() {
		let searchState = store.state.searchState;
		let normalizedQuery = Util.normalizeString(searchState.searchBar.query);
		let filter = searchState.searchBar.filter;

		let words = normalizedQuery.split(' ');
		let filtered = this.wrappers.filter(x => {
			if (!searchState.searchBar.filterShown) return true;

			let matchCount = 0;
			for (let i = 0; i < words.length; i++) {
				let word = words[i];
				if (x.searchString.includes(word)) matchCount++;
				else break;
			}
			if (matchCount < words.length) return false;

			let info = x.info;

			if (filter.modification.value !== 'all' && info.modification !== filter.modification.value) return false;
			if (filter.gameType.value !== 'all' && info.gameType !== filter.gameType.value) return false;
			if (filter.hasGems.value !== 'all' && info.gems > 0 !== (filter.hasGems.value === 'yes')) return false;
			if (filter.hasGems.value !== 'all' && info.hasEasterEgg !== (filter.hasGems.value === 'yes')) return false;

			return true;
		});

		const cmpStr = (a: string, b: string) => {
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		};

		let sortingFunction: (a: LevelInfoWrapper, b: LevelInfoWrapper) => number;
		switch (filter.sort.value) {
			case 'name': sortingFunction = (a, b) => cmpStr(a.sortName, b.sortName); break;
			case 'artist': sortingFunction = (a, b) => cmpStr(a.sortArtist, b.sortArtist); break;
			case 'date': throw new Error("Not yet implemeneted!"); break;
			case 'id': sortingFunction = (a, b) => a.info.id - b.info.id; break;
			case 'gemCount': sortingFunction = (a, b) => a.info.gems - b.info.gems; break;
		}

		filtered.sort(sortingFunction);

		return filtered.map(x => x.info);
	}
}