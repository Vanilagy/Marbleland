<template>
	<template v-if="levelInfo">
		<div class="top-part">
			<div>
				<h1>{{ levelInfo.name }}</h1>
				<h2 v-if="levelInfo.artist">By {{ levelInfo.artist }}</h2>
				<p class="labeledValue"><b>Description</b><br>{{ levelInfo.desc }}</p>
				<div class="detail" v-for="(value, name) in levelDetails" :key="name"><b>{{ name }}</b>: {{ value }}</div>
			</div>
			<aside>
				<img :src="imageSource" class="thumbnail">
				<download-button style="margin-top: 10px" :levelId="levelInfo.id"></download-button>
			</aside>
		</div>
		<p v-if="levelInfo.remarks" class="labeledValue"><b>Remarks</b><br>{{ levelInfo.remarks }}</p>
	</template>
</template>

<script lang="ts">
import Vue from 'vue'
import { LevelInfo, Modification } from '../../../shared/types';
import DownloadButton from '../DownloadButton.vue';
import { Util } from '../../ts/util';

export default Vue.defineComponent({
	components: {
		DownloadButton
	},
	data() {
		return {
			levelInfo: null as LevelInfo
		};
	},
	async created() {
		if (this.$store.state.currentLevelInfo) {
			this.levelInfo = this.$store.state.currentLevelInfo;
		} else {
			let id = Number(this.$route.params.id);
			let response = await fetch(`/api/level/${id}/info`);
			let levelInfo = await response.json() as LevelInfo;

			this.levelInfo = levelInfo;
		}
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelInfo.id}/image`;
		},
		levelDetails(): Record<string, number | string> {
			let result: Record<string, number | string> = {
				"Game type": this.levelInfo.gameType === 'single'? 'Single-player' : 'Multiplayer',
				"Modification": this.prettyModification(this.levelInfo.modification),
				"Gem count": this.levelInfo.gems,
				"Has Easter Egg": this.levelInfo.hasEasterEgg? 'Yes' : 'No'
			};

			if (this.levelInfo.qualifyingTime) result["Qualifying time"] = Util.secondsToTimeString(Number(this.levelInfo.qualifyingTime) / 1000);
			if (this.levelInfo.goldTime) result[this.levelInfo.modification === Modification.Platinum? "Platinum time" : "Gold time"] = Util.secondsToTimeString(Number(this.levelInfo.goldTime) / 1000);
			if (this.levelInfo.platinumTime) result["Platinum time"] = Util.secondsToTimeString(Number(this.levelInfo.platinumTime) / 1000);
			if (this.levelInfo.ultimateTime) result["Ultimate time"] = Util.secondsToTimeString(Number(this.levelInfo.ultimateTime) / 1000);
			if (this.levelInfo.awesomeTime) result["Awesome time"] = "🤔";

			return result;
		}
	},
	methods: {
		prettyModification(mod: Modification) {
			switch (mod) {
				case Modification.Gold: return 'Gold';
				case Modification.Platinum: return 'Platinum';
				case Modification.Fubar: return 'Fubar';
				case Modification.Ultra: return 'Ultra';
				case Modification.PlatinumQuest: return 'PlatinumQuest';
			}
		}
	}
});
</script>

<style scoped>
.top-part {
	display: flex;
}

.top-part .thumbnail {
	width: 300px;
	height: 200px;
	object-fit: cover;
	border-radius: 5px;
	overflow: hidden;
	display: block;
}

.top-part > div {
	flex: 1 1 auto;
}

.top-part > aside {
	display: flex;
	flex-direction: column;
}

.top-part h1 {
	margin: 0;
	font-weight: normal;
	font-size: 32px;
}

.top-part h2 {
	margin: 0;
	font-weight: normal;
	font-size: 18px;
}

.labeledValue {
	margin: 0;
	margin-top: 30px;
	margin-bottom: 30px;
}

.detail {
	font-size: 13px;
}

</style>