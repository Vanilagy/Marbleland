<template>
	<Head>
		<title>Search - Marbleland</title>
		<meta name="og:title" content="Search">
	</Head>
	<search-bar :config="$store.state.searchState.searchBar" :placeholder="searchBarPlaceholder()"></search-bar>
	<download-button @download="downloadAll" mode="multipleLevels" class="downloadButton" v-if="filteredLevels && filteredLevels.length">Download all matching levels</download-button>
	<panel-list mode="level" :entries="filteredLevels" :noEntriesNotice="noLevelsNotice()" :defaultCount="24" ref="levelList" showTotal></panel-list>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import PanelList from '../components/PanelList.vue';
import DownloadButton from '../components/DownloadButton.vue';
import { LevelInfo } from '../../../shared/types';
import { Search } from '../../ts/search';
import { Head } from '@unhead/vue/components';
import { useStore } from '../../ts/store';

defineOptions({ name: 'search' });

const store = useStore();

const searchState = store.state.searchState;
const filteredLevels = ref<LevelInfo[]>(null);

onMounted(() => {
	if (loaded.value) updateFilteredLevels();
	else Search.loadLevels(); // Cause a server fetch if levels haven't been loaded yet
});

const levelsVersion = computed(() => {
	return store.state.searchState.levelsVersion;
});
const loaded = computed(() => {
	return levelsVersion.value !== 0;
});
const searchBar = computed(() => {
	return searchState.searchBar;
});

const updateFilteredLevels = () => {
	filteredLevels.value = Search.filter();
};
const searchBarPlaceholder = () => {
	return `Search ${!loaded.value? 'levels' : Search.levels.length + ((Search.levels.length === 1)? ' level' : ' levels')} for name, artist, file name or ID`;
};
const noLevelsNotice = () => {
	return Search.levels?.length? "There are no levels matching your search query." : "There are no levels to search for.";
};
const downloadAll = (assumption: string) => {
	if (filteredLevels.value.length >= 100) {
		if (!confirm(`You're about to download ${filteredLevels.value.length} levels. Are you sure?`)) return;
	}

	let form = document.createElement('form');
	form.method = 'POST';
	form.action = window.location.origin + `/api/level/zip?assuming=${assumption}`;

	let input = document.createElement('input');
	input.name = 'ids';
	input.value = filteredLevels.value.map(x => x.id).join(',');
	form.appendChild(input);
	form.style.display = 'none';

	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

watch(searchBar, () => {
	if (loaded.value) updateFilteredLevels();
}, { deep: true });
watch(levelsVersion, () => {
	updateFilteredLevels();
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