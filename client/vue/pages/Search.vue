<template>
	<search-bar></search-bar>
	<div class="levels">
		<template v-if="!loaded">
			<level-panel-skeleton v-for="n in 24" :key="n"></level-panel-skeleton>
		</template>
		<template v-else>
			<template v-if="shownLevels.length > 0">
				<level-panel v-for="info of shownLevels" :key="info.id" :levelInfo="info"></level-panel>
			</template>
			<p v-else class="noLevelsNotice">{{ noLevelsNotice }}</p>
		</template>
	</div>
	<img src="/assets/svg/expand_more_black_24dp.svg" class="more" @click="showMore" v-if="canShowMore" title="Show more">
</template>

<script lang="ts">
import Vue from 'vue';
import SearchBar from '../SearchBar.vue';
import LevelPanel from '../LevelPanel.vue';
import LevelPanelSkeleton from '../LevelPanelSkeleton.vue';
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
		LevelPanel,
		LevelPanelSkeleton
	},
	async created() {
		if (this.loaded) this.updateFilteredLevels(false);
		else Search.loadLevels();
	},
	computed: {
		shownLevels(): LevelInfo[] {
			return this.filteredLevels.slice(0, this.searchState.shownCount);
		},
		canShowMore(): boolean {
			return this.shownLevels.length < this.filteredLevels.length;
		},
		noLevelsNotice(): string {
			return Search.levels.length? "There are no levels matching your search query." : "There are no levels to search for.";
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
		showMore() {
			this.searchState.shownCount += 24;
		},
		updateFilteredLevels(resetShownCount: boolean) {
			let filtered = Search.filter();

			if (resetShownCount) this.searchState.shownCount = 24;

			this.lastFilteredLevels = this.filteredLevels.slice();
			this.filteredLevels = filtered;
		}
	},
	watch: {
		searchBar: {
			handler(newState, old) {
				if (this.loaded) this.updateFilteredLevels(true);
			},
			deep: true
		},
		levelsVersion() {
			this.updateFilteredLevels(false);
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

.noLevelsNotice {
	margin: 5px;
	margin-bottom: 15px;
	width: 100%;
	text-align: center;
	font-size: 14px;
}
</style>