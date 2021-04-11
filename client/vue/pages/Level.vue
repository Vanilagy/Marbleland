<template>
	<template v-if="levelInfo">
		<info-banner v-if="creationBannerShown">Level submitted successfully!</info-banner>
		<div class="top-part">
			<aside>
				<img :src="imageSource" class="thumbnail">
				<download-button style="margin-top: 10px" :levelId="levelInfo.id"></download-button>
				<p class="addedDate">Added on {{ formattedDate }}</p>
				<profile-banner style="margin-top: 10px" v-if="levelInfo.addedBy" :profileInfo="levelInfo.addedBy" secondaryText="Uploader"></profile-banner>
			</aside>
			<div>
				<h1>{{ levelInfo.name }}</h1>
				<h2 v-if="levelInfo.artist">By {{ levelInfo.artist }}</h2>
				<h3>Description</h3>
				<p class="regularParagraph">{{ levelInfo.desc }}</p>
				<h3>Details</h3>
				<div class="detail" v-for="(value, name) in levelDetails" :key="name"><b>{{ name }}</b>: {{ value }}</div>
				<h3>Remarks</h3>
				<p class="regularParagraph" v-if="levelInfo.remarks">{{ levelInfo.remarks }}</p>
			</div>
		</div>
	</template>
</template>

<script lang="ts">
import Vue from 'vue'
import { ExtendedLevelInfo, Modification } from '../../../shared/types';
import DownloadButton from '../DownloadButton.vue';
import ProfileBanner from '../ProfileBanner.vue';
import InfoBanner from '../InfoBanner.vue';
import { Util } from '../../ts/util';
import { Search } from '../../ts/search';

export default Vue.defineComponent({
	components: {
		DownloadButton,
		ProfileBanner,
		InfoBanner
	},
	data() {
		return {
			levelInfo: null as ExtendedLevelInfo,
			creationBannerShown: false
		};
	},
	async created() {
		if (this.$store.state.showLevelCreated) {
			this.creationBannerShown = true;
			this.$store.state.showLevelCreated = false;
		}

		let id = Number(this.$route.params.id);
		let response = await fetch(`/api/level/${id}/extended-info`);
		let levelInfo = await response.json() as ExtendedLevelInfo;

		this.levelInfo = levelInfo;

		Search.checkForRefresh(this.levelInfo.id);
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelInfo.id}/image`;
		},
		levelDetails(): Record<string, number | string> {
			let result: Record<string, number | string> = {};

			result["Modification"] = this.prettyModification(this.levelInfo.modification);
			result["Game type"] = this.levelInfo.gameType === 'single'? 'Single-player' : 'Multiplayer';
			if (this.levelInfo.gameMode) result["Game mode"] = this.levelInfo.gameMode.split(' ').map(x => Util.splitWords(x).join(' ')).join(', ');
			result["Gem count"] = this.levelInfo.gems;
			result["Has Easter Egg"] = this.levelInfo.hasEasterEgg? 'Yes' : 'No';

			if (this.levelInfo.qualifyingTime) result["Qualifying time"] = Util.secondsToTimeString(Number(this.levelInfo.qualifyingTime) / 1000);
			if (this.levelInfo.goldTime) result[this.levelInfo.modification === Modification.Platinum? "Platinum time" : "Gold time"] = Util.secondsToTimeString(Number(this.levelInfo.goldTime) / 1000);
			if (this.levelInfo.platinumTime) result["Platinum time"] = Util.secondsToTimeString(Number(this.levelInfo.platinumTime) / 1000);
			if (this.levelInfo.ultimateTime) result["Ultimate time"] = Util.secondsToTimeString(Number(this.levelInfo.ultimateTime) / 1000);
			if (this.levelInfo.awesomeTime) result["Awesome time"] = "🤔";

			return result;
		},
		formattedDate(): string {
			return Util.formatDate(new Date(this.levelInfo.addedAt));
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

aside {
	width: 300px;
	margin-right: 40px;
}

.thumbnail {
	width: 300px;
	height: 200px;
	object-fit: cover;
	border-radius: 5px;
	overflow: hidden;
	display: block;
}

.addedDate {
	margin: 0;
	margin-top: 5px;
	opacity: 0.75;
	font-size: 14px;
}

h1 {
	margin: 0;
	font-weight: normal;
	font-size: 32px;
	margin-bottom: -5px;
}

h2 {
	margin: 0;
	font-weight: normal;
	font-size: 18px;
}

h3 {
	margin: 0;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 25px;
}

.regularParagraph {
	margin: 0;
}

.detail {
	font-size: 13px;
}
</style>