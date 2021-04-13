<template>
	<search-bar :config="$store.state.searchState.searchBar" placeholder="Search for levels"></search-bar>
	<panel-list mode="level" :entries="filteredLevels" :noEntriesNotice="noLevelsNotice" :defaultCount="24" ref="levelList"></panel-list>
</template>

<script lang="ts">
import Vue from 'vue';
import SearchBar, { SearchBarConfig } from '../SearchBar.vue';
import PanelList from '../PanelList.vue';
import { LevelInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import { Search } from '../../ts/search';

const levelSearchStrings = new Map<LevelInfo, string>();

export default Vue.defineComponent({
	name: 'search',
	data() {
		return {
			searchState: this.$store.state.searchState,
			filteredLevels: null as LevelInfo[]
		};
	},
	components: {
		SearchBar,
		PanelList
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
		},
		searchBar(): SearchBarConfig {
			return this.searchState.searchBar;
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