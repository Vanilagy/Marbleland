<template>
	<search-bar></search-bar>
	<level-list :levels="filteredLevels" :noLevelsNotice="noLevelsNotice" :defaultCount="24" ref="levelList"></level-list>
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
	name: 'search',
	data() {
		return {
			searchState: this.$store.state.searchState,
			searchBar: this.$store.state.searchState.searchBar,
			filteredLevels: null as LevelInfo[]
		};
	},
	components: {
		SearchBar,
		LevelList
	},
	mounted() {
		if (this.loaded) this.updateFilteredLevels();
		else Search.loadLevels();
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
		updateFilteredLevels() {
			this.filteredLevels = Search.filter();
		}
	},
	watch: {
		searchBar: {
			handler(newState, old) {
				if (this.loaded) this.updateFilteredLevels();
			},
			deep: true
		},
		levelsVersion() {
			this.updateFilteredLevels();
		}
	}
});
</script>

<style scoped>

</style>