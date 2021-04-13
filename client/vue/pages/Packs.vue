<template>
	<button-with-icon icon="/assets/svg/create_new_folder_black_24dp.svg" class="createPackButton" @click="createPack" v-if="$store.state.loggedInAccount">Create new pack</button-with-icon>
	<search-bar :config="searchBarConfig" placeholder="Search for packs"></search-bar>
	<panel-list :entries="filteredPacks" :defaultCount="24" mode="pack" :noEntriesNotice="noEntriesNotice"></panel-list>
</template>

<script lang="ts">
import Vue from 'vue';
import ButtonWithIcon from '../ButtonWithIcon.vue';
import SearchBar from '../SearchBar.vue';
import PanelList from '../PanelList.vue';
import { PackInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import { emitter } from '../../ts/emitter';

interface PackInfoWrapper {
	info: PackInfo,
	searchString: string,
	sortName: string,
	sortCreator: string
}

export default Vue.defineComponent({
	name: 'packs',
	components: {
		ButtonWithIcon,
		SearchBar,
		PanelList
	},
	data() {
		return {
			searchBarConfig: {
				query: '',
				filterShown: false,
				filter: {
					sort: {
						label: 'Sort by',
						value: 'name',
						options: [
							{ name: 'name', label: "Pack name"},
							{ name: 'creator', label: 'Pack creator'},
							{ name: 'date', label: 'Date created'},
							{ name: 'levelCount', label: 'Level count'}
						]
					}
				}
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
			let response = await fetch('/api/pack/list');
			let json = await response.json() as PackInfo[];

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

			let sortingFunction: (a: PackInfoWrapper, b: PackInfoWrapper) => number;
			switch (this.searchBarConfig.filter.sort.value) {
				case 'name': sortingFunction = (a, b) => cmpStr(a.sortName, b.sortName); break;
				case 'creator': sortingFunction = (a, b) => cmpStr(a.sortCreator, b.sortCreator); break;
				case 'date': sortingFunction = (a, b) => a.info.createdAt - b.info.createdAt; break;
				case 'levelCount': sortingFunction = (a, b) => a.info.levelIds.length - b.info.levelIds.length; break;
			}

			result.sort(sortingFunction);

			this.filteredPacks = result.map(x => x.info);
		},
		checkReload(newPackId: number) {
			if (!this.packs.some(x => x.info.id === newPackId)) this.fetch();
		}
	},
	computed: {
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