<template>
	<search-bar></search-bar>
	<level-list :levels="filteredLevels" :noLevelsNotice="noLevelsNotice" :defaultCount="24" ref="levelList" @shownCountChange="storeShownCount"></level-list>
</template>

<script lang="ts">
import Vue from 'vue';
import SearchBar from '../SearchBar.vue';
import LevelList from '../LevelList.vue';
import { LevelInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import { Search } from '../../ts/search';

const levelSearchStrings = new Map<LevelInfo, string>();

export default Vue.defineComponent({
	data() {
		return {
			searchState: this.$store.state.searchState,
			searchBar: this.$store.state.searchState.searchBar,
			lastFilteredLevels: [] as LevelInfo[],
			filteredLevels: [] as LevelInfo[]
		};
	},
	components: {
		SearchBar,
		LevelList
	},
	mounted() {
		if (this.loaded) this.updateFilteredLevels(false);
		else Search.loadLevels();

		(this.$refs.levelList as any).shownCount = Number(this.$store.state.searchState.shownCount);
	},
	computed: {
		noLevelsNotice(): string {
			return Search.levels?.length? "There are no levels matching your search query." : "There are no levels to search for.";
		},
		levelsVersion(): number {
			return this.$store.state.searchState.levelsVersion;
		},
		loaded(): boolean {
			return this.levelsVersion !== 0;
		}
	},
	methods: {
		normalizeString(str: string) {
			return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '').toLowerCase();
		},
		updateFilteredLevels(resetShownCount: boolean) {
			let filtered = Search.filter();

			//if (resetShownCount) this.searchState.shownCount = 24;

			this.lastFilteredLevels = this.filteredLevels.slice();
			this.filteredLevels = filtered;
		},
		storeShownCount() {
			if (!this.$refs.levelList) return;
			
			this.$store.state.searchState.shownCount = (this.$refs.levelList as any).shownCount;
		}
	},
	watch: {
		searchBar: {
			handler(newState, old) {
				if (this.loaded) this.updateFilteredLevels(true);
			},
			deep: true
		},
		levelsVersion() {
			this.updateFilteredLevels(false);
		}
	}
});
</script>

<style scoped>

</style>