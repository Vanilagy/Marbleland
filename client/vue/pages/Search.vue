<template>
	<search-bar></search-bar>
	<div class="levels">
		<level-panel v-for="info of shownLevels" :key="info.id" :levelInfo="info"></level-panel>
	</div>
	<img src="/assets/svg/expand_more_black_24dp.svg" class="more" @click="showMore" v-if="canShowMore" title="Show more">
</template>

<script lang="ts">
import Vue from 'vue';
import SearchBar from '../SearchBar.vue';
import LevelPanel from '../LevelPanel.vue';
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
		LevelPanel
	},
	async created() {
		await Search.loadLevels();
		this.updateFilteredLevels();
	},
	computed: {
		shownLevels(): LevelInfo[] {
			return this.filteredLevels.slice(0, this.searchState.shownCount);
		},
		canShowMore(): boolean {
			return this.shownLevels.length < this.filteredLevels.length;
		}
	},
	methods: {
		normalizeString(str: string) {
			return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '').toLowerCase();
		},
		showMore() {
			this.searchState.shownCount += 24;
		},
		updateFilteredLevels() {
			let filtered = Search.filter();

			this.searchState.shownCount = 24;

			this.lastFilteredLevels = this.filteredLevels.slice();
			this.filteredLevels = filtered;
		}
	},
	watch: {
		searchBar: {
			handler(newState, old) {
				this.updateFilteredLevels();
			},
			deep: true
		}
	}
});
</script>

<style scoped>
.levels {
	display: flex;
	margin: -5px;
	margin-top: 5px;
	flex-wrap: wrap;
}

.levels > div {
	margin: 5px;
}

.more {
	display: block;
	margin: auto;
	width: 48px;
	opacity: 0.25;
	cursor: pointer;
}

.more:hover {
	opacity: 0.75;
}
</style>