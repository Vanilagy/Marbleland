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
		<panel-list mode="level" :entries="packInfo.levels" :defaultCount="24" :levelPanelActions="levelPanelActions" noEntriesNotice="This pack contains no levels."></panel-list>
		<p v-if="isOwnPack && packInfo.levels.length === 0" class="howToAdd">Add levels to this pack by searching for the levels you want to add and then adding them from there.</p>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ExtendedPackInfo, LevelInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import ProfileBanner from '../ProfileBanner.vue';
import DownloadButton from '../DownloadButton.vue';
import PanelList from '../PanelList.vue';
import { LevelPanelActions } from '../LevelPanel.vue';
import { emitter } from '../../ts/emitter';

export default Vue.defineComponent({
	data() {
		return {
			packInfo: null as ExtendedPackInfo
		};
	},
	async mounted() {
		let response = await fetch(`/api/pack/${this.$route.params.id}/info`);
		let json = await response.json() as ExtendedPackInfo;

		this.packInfo = json;

		emitter.emit('packView', this.packInfo.id);
		emitter.on('packUpdate', this.onPackUpdate);
	},
	unmounted() {
		emitter.off('packUpdate', this.onPackUpdate);
	},
	computed: {
		createdText(): string {
			return `Created this pack on ${Util.formatDate(new Date(this.packInfo.createdAt))}`;
		},
		isOwnPack(): boolean {
			return this.packInfo.createdBy.id === this.$store.state.loggedInAccount?.id;
		},
		levelPanelActions(): LevelPanelActions {
			let self = this;

			if (!this.isOwnPack) return null;

			return {
				addToPack: true,
				async removeFromPack(info: LevelInfo) {
					self.packInfo.levels = self.packInfo.levels.filter(x => x.id !== info.id);
					let ownPack = self.$store.state.ownPacks.find(x => x.id === self.packInfo.id);
					ownPack.levelIds = ownPack.levelIds.filter(x => x !== info.id);

					let token = localStorage.getItem('token');
					await fetch(`/api/pack/${self.packInfo.id}/set-levels`, {
						method: 'POST',
						body: JSON.stringify(self.packInfo.levels.map(x => x.id)),
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`
						}
					});

					emitter.emit('packUpdate', {
						id: self.packInfo.id,
						levelIds: ownPack.levelIds
					});
				}
			};
		}
	},
	methods: {
		onPackUpdate(updateInfo: { id: number, levelIds?: number[] }) {
			if (this.packInfo.id !== updateInfo.id) return;

			if (updateInfo.levelIds) {
				this.packInfo.levels = this.packInfo.levels.filter(x => updateInfo.levelIds.includes(x.id));
			}
		}
	},
	components: {
		ProfileBanner,
		DownloadButton,
		PanelList
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