<template>
	<Head>
		<title>Search - Marbleland</title>
		<meta name="og:title" content="Search">
	</Head>
	<search-bar :config="$store.state.searchState.searchBar" :placeholder="searchBarPlaceholder()"></search-bar>
	<download-button @download="downloadAll" mode="multipleLevels" class="downloadButton" v-if="filteredLevels && filteredLevels.length">Download all matching levels</download-button>
	<panel-list mode="level" :entries="filteredLevels" :noEntriesNotice="noLevelsNotice()" :defaultCount="24" ref="levelList" showTotal></panel-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBar, { SearchBarConfig } from '../components/SearchBar.vue';
import PanelList from '../components/PanelList.vue';
import DownloadButton from '../components/DownloadButton.vue';
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
		Head,
		DownloadButton
	},
	mounted() {
		if (this.loaded) this.updateFilteredLevels();
		else Search.loadLevels(); // Cause a server fetch if levels haven't been loaded yet
	},
	computed: {
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
		},
		searchBarPlaceholder() {
			return `Search ${!this.loaded? 'levels' : Search.levels.length + ((Search.levels.length === 1)? ' level' : ' levels')} for name, artist, file name or ID`;
		},
		noLevelsNotice(): string {
			return Search.levels?.length? "There are no levels matching your search query." : "There are no levels to search for.";
		},
		downloadAll(assumption: string) {
			if (this.filteredLevels.length >= 100) {
				if (!confirm(`You're about to download ${this.filteredLevels.length} levels. Are you sure?`)) return;
			}

			let form = document.createElement('form');
			form.method = 'POST';
			form.action = window.location.origin + `/api/level/zip?assuming=${assumption}`;

			let input = document.createElement('input');
			input.name = 'ids';
			input.value = this.filteredLevels.map(x => x.id).join(',');
			form.appendChild(input);
			form.style.display = 'none';

			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
		}
	},
	watch: {
		searchBar: {
			handler() {
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
.downloadButton {
	margin: auto;
	width: 100%;
	max-width: 380px;
	margin-top: 10px;
}
</style>