<template>
	<template v-if="levelInfo">
		<info-banner></info-banner>
		<div class="top-part">
			<aside>
				<img :src="imageSource" class="thumbnail">
				<download-button style="margin-top: 10px" :id="levelInfo.id" mode="level"></download-button>
				<p class="addedDate">Added on {{ formattedDate }}</p>
				<profile-banner style="margin-top: 10px" v-if="levelInfo.addedBy" :profileInfo="levelInfo.addedBy" secondaryText="Uploader"></profile-banner>
			</aside>
			<div style="flex: 1 1 auto;">
				<div class="actions">
					<img src="/assets/svg/delete_black_24dp.svg" title="Delete level" v-if="isOwnLevel">
					<img src="/assets/svg/edit_black_24dp.svg" title="Edit level" v-if="isOwnLevel">
					<img src="/assets/svg/create_new_folder_black_24dp.svg" title="Add to pack" v-if="$store.state.loggedInAccount" @click="$refs.packAdder.toggle()">
					<pack-adder :levelId="levelInfo.id" class="packAdder" ref="packAdder"></pack-adder>
				</div>
				<h1>{{ levelInfo.name }}</h1>
				<h2 v-if="levelInfo.artist">By {{ levelInfo.artist }}</h2>
				<h3 v-if="levelInfo.desc">Description</h3>
				<p class="regularParagraph">{{ levelInfo.desc }}</p>
				<h3>Details</h3>
				<div class="detail" v-for="(value, name) in levelDetails" :key="name"><b>{{ name }}</b>: {{ value }}</div>
				<h3 v-if="levelInfo.remarks">Remarks</h3>
				<p class="regularParagraph" v-if="levelInfo.remarks">{{ levelInfo.remarks }}</p>
			</div>
		</div>
		<template v-if="levelInfo.packs.length">
			<h3>Appears in</h3>
			<panel-list mode="pack" :entries="levelInfo.packs" :defaultCount="4" noEntriesNotice="This level doesn't appear in any packs."></panel-list>
		</template>
	</template>
</template>

<script lang="ts">
import Vue from 'vue'
import { ExtendedLevelInfo, Modification, PackInfo } from '../../../shared/types';
import DownloadButton from '../DownloadButton.vue';
import ProfileBanner from '../ProfileBanner.vue';
import InfoBanner from '../InfoBanner.vue';
import PackAdder from '../PackAdder.vue';
import PanelList from '../PanelList.vue';
import { Util } from '../../ts/util';
import { Search } from '../../ts/search';
import { emitter } from '../../ts/emitter';

export default Vue.defineComponent({
	components: {
		DownloadButton,
		ProfileBanner,
		InfoBanner,
		PackAdder,
		PanelList
	},
	data() {
		return {
			levelInfo: null as ExtendedLevelInfo
		};
	},
	async mounted() {
		let id = Number(this.$route.params.id);
		let response = await fetch(`/api/level/${id}/extended-info`);
		let levelInfo = await response.json() as ExtendedLevelInfo;

		this.levelInfo = levelInfo;

		Search.checkForRefresh(this.levelInfo.id);
		emitter.on('packUpdate', this.updatePacks);
	},
	unmounted() {
		emitter.off('packUpdate', this.updatePacks);
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
		},
		isOwnLevel(): boolean {
			return !!this.$store.state.loggedInAccount && this.levelInfo.addedBy?.id === this.$store.state.loggedInAccount?.id;
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
		},
		async updatePacks() {
			let response = await fetch(`/api/level/${this.levelInfo.id}/packs`);
			let json = await response.json() as PackInfo[];
			
			this.levelInfo.packs = json;
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

.actions {
	float: right;
	margin-top: -5px;
	position: relative;
}

.actions img {
	opacity: 0.5;
	padding: 5px;
	cursor: pointer;
}

.actions img:hover {
	opacity: 0.75;
}

.packAdder {
	position: absolute;
	top: 30px;
	right: 0px;
	z-index: 1;
}
</style>