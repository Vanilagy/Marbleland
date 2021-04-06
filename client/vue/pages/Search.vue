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

const levelSearchStrings = new Map<LevelInfo, string>();

export default Vue.defineComponent({
	data() {
		return {
			searchState: this.$store.state.searchState,
			lastFilteredLevels: [] as LevelInfo[]
		};
	},
	components: {
		SearchBar,
		LevelPanel
	},
	async created() {
		if (!this.searchState.levels) {
			let response = await fetch('/api/list');
			let levelList = await response.json() as LevelInfo[];

			this.searchState.levels = levelList;

			for (let level of this.searchState.levels) {
				let searchString = [level.id, level.name, level.artist, level.baseName].filter(x => x).join(' ');
				searchString = this.normalizeString(searchString);
				levelSearchStrings.set(level, searchString);
			}

			this.searchState.ready = true;
		}
	},
	computed: {
		filteredLevels(): LevelInfo[] {
			let { levels, query, ready } = this.searchState;
			if (!ready) return [];

			let words = this.normalizedQuery.split(' ');
			return levels.filter(x => words.filter(y => levelSearchStrings.get(x).includes(y)).length === words.length);
		},
		shownLevels(): LevelInfo[] {
			return this.filteredLevels.slice(0, this.searchState.shownCount);
		},
		normalizedQuery(): string {
			return this.normalizeString(this.searchState.query);
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
		}
	},
	watch: {
		filteredLevels() {
			let equal = Util.arraysEqualShallow(this.lastFilteredLevels, this.filteredLevels);
			if (!equal) this.searchState.shownCount = 24;
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