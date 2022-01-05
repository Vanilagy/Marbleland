<template>
	<Head>
		<title>Packs - Marbleland</title>
		<meta name="og:title" content="Packs">
	</Head>
	<button-with-icon icon="/assets/svg/create_new_folder_black_24dp.svg" class="createPackButton" @click="createPack" v-if="$store.state.loggedInAccount">Create new pack</button-with-icon>
	<a href="/create-pack" @click.prevent=""></a> <!-- Let's hope Google will accept this xD -->
	<search-bar :config="searchBarConfig" :placeholder="searchBarPlaceholder()"></search-bar>
	<panel-list :entries="filteredPacks" :defaultCount="24" mode="pack" :noEntriesNotice="noEntriesNotice()" showTotal></panel-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import SearchBar from '../components/SearchBar.vue';
import PanelList from '../components/PanelList.vue';
import { PackInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import { emitter } from '../../ts/emitter';
import { Head } from '@vueuse/head';

interface PackInfoWrapper {
	info: PackInfo,
	searchString: string,
	sortName: string,
	sortCreator: string
}

export default defineComponent({
	name: 'packs',
	components: {
		ButtonWithIcon,
		SearchBar,
		PanelList,
		Head
	},
	data() {
		return {
			searchBarConfig: {
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
							{ name: 'levelCount', label: 'Level count'}
						]
					}
				},
				reversed: false
			},
			packs: null as PackInfoWrapper[],
			filteredPacks: null as PackInfo[]
		};
	},
	methods: {
		createPack() {
			this.$router.push('/create-pack');
		},
		async fetch() {
			// Gets the list of all packs from the server
			let response = await fetch('/api/pack/list');
			let json = await response.json() as PackInfo[];

			// Precomputes data for faster sorting/searching later on
			this.packs = json.map(pack => {
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

			this.updateFilteredPacks();
		},
		updateFilteredPacks() {
			if (!this.packs) return;

			let words = this.searchBarConfig.query.split(' ');

			// Filter all packs that don't match the search query
			let result = this.packs.filter(wrapper => {
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
			switch (this.searchBarConfig.filter.sort.value) {
				case 'name': sortingFunction = (a, b) => cmpStr(a.sortName, b.sortName); break;
				case 'creator': sortingFunction = (a, b) => cmpStr(a.sortCreator, b.sortCreator); break;
				case 'date': sortingFunction = (a, b) => -(a.info.createdAt - b.info.createdAt); break;
				case 'levelCount': sortingFunction = (a, b) => a.info.levelIds.length - b.info.levelIds.length; break;
			}

			// Bring the packs into the right order
			result.sort(sortingFunction);
			if (this.searchBarConfig.reversed) result.reverse();

			this.filteredPacks = result.map(x => x.info);
		},
		checkReload(newPackId: number) {
			// Reload if the pack ID is not included in the current pack list
			if (!this.packs.some(x => x.info.id === newPackId)) this.fetch();
		},
		searchBarPlaceholder() {
			return `Search ${!this.packs? 'packs' : this.packs.length + ((this.packs.length === 1)? ' pack' : ' packs')} for name, creator or ID`;
		},
		noEntriesNotice(): string {
			return this.packs?.length? "There are no packs matching your search query." : "There are no packs to search for.";
		}
	},
	async mounted() {
		await this.fetch();
		emitter.on('packView', this.checkReload);
	},
	unmounted() {
		emitter.off('packView', this.checkReload);
	},
	watch: {
		searchBarConfig: {
			handler() {
				this.updateFilteredPacks();
			},
			deep: true
		}
	}
});
</script>

<style scoped>
.createPackButton {
	margin: auto;
	width: 200px;
	margin-bottom: 10px;
}
</style>