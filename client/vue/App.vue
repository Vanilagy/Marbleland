<template>
	<div id="center" v-if="levelList">
		<search-bar @queryChange="onQueryChange" ref="cuck"></search-bar>
		<div class="levels">
			<level-panel v-for="entry of shownLevels" :key="entry.id" :levelEntry="entry"></level-panel>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import SearchBar from './SearchBar.vue';
import LevelPanel from './LevelPanel.vue';

export interface LevelEntry {
	id: number,
	baseName: string,
	gameType: boolean,
	modification: boolean, 
	name: string,
	artist: string,
	desc: string,
	qualifyingTime: number,
	goldTime: number,
	platinumTime: number,
	ultimateTime: number,
	awesomeTime: number,
	gems: number,
	hasEasterEgg: boolean
}

export default Vue.defineComponent({
	components: {
		SearchBar,
		LevelPanel
	},
	data() {
		return {
			levelList: null as LevelEntry[],
			shownLevels: [] as LevelEntry[]
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

<style>
body, html {
	margin: 0;
	margin-top: 10px;
	font-family: 'Titillium Web', sans-serif;
	color: rgb(64, 64, 64);
}

* {
	-webkit-user-drag: none;
	-moz-user-drag: none;
	-moz-user-select: -moz-none;
	-khtml-user-select: none;
	-webkit-user-select: none;
	-o-user-select: none;
	user-select: none;
}
</style>

<style scoped>
#center {
	margin: auto;
	max-width: 1000px;
}

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