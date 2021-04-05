<template>
	<search-bar @queryChange="onQueryChange" ref="cuck"></search-bar>
	<div class="levels">
		<level-panel v-for="info of shownLevels" :key="info.id" :levelInfo="info"></level-panel>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import SearchBar from '../SearchBar.vue';
import LevelPanel from '../LevelPanel.vue';
import { LevelInfo } from '../../../shared/types';

export default Vue.defineComponent({
	components: {
		SearchBar,
		LevelPanel
	},
	data() {
		return {
			levelList: null as LevelInfo[],
			shownLevels: [] as LevelInfo[]
		};
	},
	async created() {
		let response = await fetch('/api/list');
		let levelList = await response.json();

		this.levelList = levelList;

		this.onQueryChange("");
	},
	methods: {
		onQueryChange(query: string) {
			this.shownLevels = this.levelList.filter(x => x.name.toLowerCase().includes(query.toLowerCase())).slice(0, 50);
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
</style>