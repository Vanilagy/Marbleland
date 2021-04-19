<template>
	<Head>
		<title>Search - Marbleland</title>
	</Head>
	<search-bar :config="$store.state.searchState.searchBar" placeholder="Search for levels"></search-bar>
	<panel-list mode="level" :entries="filteredLevels" :noEntriesNotice="noLevelsNotice" :defaultCount="24" ref="levelList"></panel-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBar, { SearchBarConfig } from '../components/SearchBar.vue';
import PanelList from '../components/PanelList.vue';
import { LevelInfo } from '../../../shared/types';
import { Search } from '../../ts/search';
import { Head } from '@vueuse/head';

export default defineComponent({
	name: 'search',
	data() {
		return {
			searchState: this.$store.state.searchState,
			filteredLevels: null as LevelInfo[]
		};
	},
	components: {
		SearchBar,
		PanelList,
		Head
	},
	mounted() {
		if (this.loaded) this.updateFilteredLevels();
		else Search.loadLevels(); // Cause a server fetch if levels haven't been loaded yet
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