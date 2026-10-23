<template>
	<Head>
		<title>Packs - Marbleland</title>
		<meta name="og:title" content="Packs">
	</Head>
	<search-bar :config="searchBarConfig" :placeholder="searchBarPlaceholder()"></search-bar>
	<button-with-icon icon="/assets/svg/create_new_folder_black_24dp.svg" class="createPackButton" @click="createPack" v-if="$store.state.loggedInAccount">Create new pack</button-with-icon>
	<a href="/create-pack" @click.prevent=""></a> <!-- Let's hope Google will accept this xD -->
	<panel-list :entries="filteredPacks" :defaultCount="24" mode="pack" :noEntriesNotice="noEntriesNotice()" showTotal></panel-list>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import SearchBar from '../components/SearchBar.vue';
import PanelList from '../components/PanelList.vue';
import { PackInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import { useStore } from '../../ts/store';
import { Head } from '@unhead/vue/components';

interface PackInfoWrapper {
	info: PackInfo,
	searchString: string,
	sortName: string,
	sortCreator: string
}

defineOptions({ name: 'packs' });

const store = useStore();
const router = useRouter();

const searchBarConfig = reactive({
	query: '',
	filterShown: false,
	filter: {
		sort: {
			label: 'Sort by',
			value: 'date',
			options: [
				{ name: 'name', label: "Pack name"},
				{ name: 'creator', label: 'Pack creator'},
				{ name: 'date', label: 'Date created'},
				{ name: 'levelCount', label: 'Level count'},
				{ name: 'downloads', label: 'Downloads'},
				{ name: 'lovedCount', label: 'Loves'}
			]
		}
	},
	reversed: false
});
const packs = ref<PackInfoWrapper[]>(null);
const filteredPacks = ref<PackInfo[]>(null);

const createPack = () => {
	router.push('/create-pack');
};
const fetchPacks = async () => {
	// Gets the list of all packs from the server
	let response = await fetch('/api/pack/list');
	let json = await response.json() as PackInfo[];

	// Precomputes data for faster sorting/searching later on
	packs.value = json.map(pack => {
		let searchString = [pack.id, pack.name, pack.createdBy.username].filter(x => x).join(' ');
		searchString = Util.normalizeString(searchString);

		let sortName = Util.normalizeString(pack.name).trim();
		let sortCreator = Util.normalizeString(pack.createdBy.username).trim();

		return {
			info: pack,
			searchString,
			sortName,
			sortCreator
		};
	});

	updateFilteredPacks();
};
const updateFilteredPacks = () => {
	if (!packs.value) return;

	let words = searchBarConfig.query.split(' ');

	// Filter all packs that don't match the search query
	let result = packs.value.filter(wrapper => {
		let matchCount = 0;
		for (let i = 0; i < words.length; i++) {
			let word = words[i];
			if (wrapper.searchString.includes(word)) matchCount++;
			else break;
		}
		if (matchCount < words.length) return false;

		return true;
	});

	const cmpStr = (a: string, b: string) => {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	};

	// Determine the correct sorting function to use
	let sortingFunction: (a: PackInfoWrapper, b: PackInfoWrapper) => number;
	switch (searchBarConfig.filter.sort.value) {
		case 'name': sortingFunction = (a, b) => cmpStr(a.sortName, b.sortName); break;
		case 'creator': sortingFunction = (a, b) => cmpStr(a.sortCreator, b.sortCreator); break;
		case 'date': sortingFunction = (a, b) => -(a.info.createdAt - b.info.createdAt); break;
		case 'levelCount': sortingFunction = (a, b) => a.info.levelIds.length - b.info.levelIds.length; break;
		case 'downloads': sortingFunction = (a, b) => -(a.info.downloads - b.info.downloads); break;
		case 'lovedCount': sortingFunction = (a, b) => -(a.info.lovedCount - b.info.lovedCount); break;
	}

	// Bring the packs into the right order
	result.sort(sortingFunction);
	if (searchBarConfig.reversed) result.reverse();

	filteredPacks.value = result.map(x => x.info);
};
const searchBarPlaceholder = () => {
	return `Search ${!packs.value? 'packs' : packs.value.length + ((packs.value.length === 1)? ' pack' : ' packs')} for name, creator or ID`;
};
const noEntriesNotice = () => {
	return packs.value?.length? "There are no packs matching your search query." : "There are no packs to search for.";
};

onMounted(() => {
	fetchPacks();
});

watch(searchBarConfig, () => {
	updateFilteredPacks();
});
watch(() => store.state.packListVersion, () => {
	fetchPacks();
});
watch(() => store.state.viewedPackId, viewedPackId => {
	// Reload if the pack isn't in the list. While the list is still loading, the fetch in flight will include it anyway.
	if (packs.value && !packs.value.some(x => x.info.id === viewedPackId)) fetchPacks();
});
</script>

<style scoped>
.createPackButton {
	margin: auto;
	width: 200px;
	margin-top: 10px;
}
</style>