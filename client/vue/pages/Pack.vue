<template>
	<div v-if="packInfo" class="outer">
		<h1>{{ packInfo.name }}</h1>
		<profile-banner :profileInfo="packInfo.createdBy" :secondaryText="createdText"></profile-banner>
		<h3>Description</h3>
		<p class="regularParagraph">{{ packInfo.description }}</p>
		<div class="downloadButton">
			<download-button :id="packInfo.id" mode="pack"></download-button>
		</div>
		<h3>Included levels ({{ packInfo.levels.length }})</h3>
		<level-list :levels="packInfo.levels" :defaultCount="24" :levelPanelOptions="levelPanelOptions" noLevelsNotice="This pack contains no levels."></level-list>
		<p v-if="isOwnPack && packInfo.levels.length === 0" class="howToAdd">Add levels to this pack by searching for the levels you want to add and then adding them from there.</p>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { LevelInfo, PackInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import ProfileBanner from '../ProfileBanner.vue';
import DownloadButton from '../DownloadButton.vue';
import LevelList from '../LevelList.vue';
import { LevelPanelOptions } from '../LevelPanel.vue';

export default Vue.defineComponent({
	data() {
		return {
			packInfo: null as PackInfo
		};
	},
	async mounted() {
		let response = await fetch(`/api/pack/${this.$route.params.id}/info`);
		let json = await response.json() as PackInfo;

		this.packInfo = json;
	},
	computed: {
		createdText(): string {
			return `Created this pack on ${Util.formatDate(new Date(this.packInfo.createdAt))}`;
		},
		isOwnPack(): boolean {
			return this.packInfo.createdBy.id === this.$store.state.loggedInAccount?.id;
		},
		levelPanelOptions(): LevelPanelOptions {
			let self = this;

			if (!this.isOwnPack) return null;

			return {
				removeFromPack(info: LevelInfo) {
					self.packInfo.levels = self.packInfo.levels.filter(x => x.id !== info.id);
					self.$store.state.ownPacks = self.$store.state.ownPacks.filter(x => x.id !== info.id);

					let token = localStorage.getItem('token');
					fetch(`/api/pack/${self.packInfo.id}/set-levels`, {
						method: 'POST',
						body: JSON.stringify(self.packInfo.levels.map(x => x.id)),
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`
						}
					});
				}
			};
		}
	},
	components: {
		ProfileBanner,
		DownloadButton,
		LevelList
	}
});
</script>

<style scoped>
.outer {
	position: relative;
}

h1 {
	margin: 0;
	font-weight: normal;
	font-size: 32px;
	margin-bottom: 10px;
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

.downloadButton {
	width: 300px;
	position: absolute;
	top: 0;
	right: 0;
}

.howToAdd {
	font-weight: bold;
	margin: 0;
	font-size: 14px;
	text-align: center;
}
</style>