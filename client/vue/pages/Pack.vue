<template>
	<loader v-if="!packInfo"></loader>
	<info-banner v-if="packInfo"></info-banner>
	<div v-if="packInfo" class="outer" :class="{ disabled: deleting }">
		<div style="display: flex; flex-wrap: wrap;">
			<div style="flex: 1 1 auto; min-width: 300px;">
				<h1 v-if="!editing">{{ packInfo.name }}</h1>
				<input v-else class="basicTextInput nameInput" placeholder="Name" v-model.trim="packInfo.name" :maxlength="$store.state.packNameMaxLength">
				<profile-banner :profileInfo="packInfo.createdBy" :secondaryText="createdText" class="profileBanner"></profile-banner>
				<h3>Description</h3>
				<p v-if="!editing" class="regularParagraph">{{ packInfo.description }}</p>
				<textarea v-else class="basicTextarea descriptionInput" placeholder="Description" v-model.trim="packInfo.description" :maxlength="$store.state.packDescriptionMaxLength"></textarea>
				<button-with-icon v-if="editing" icon="/assets/svg/check_black_24dp.svg" class="saveChangesButton" :class="{ disabled: !canSubmitChanges }" @click="submitChanges">Save changes</button-with-icon>
			</div>
			<div class="topRight">
				<div class="actions" v-if="isOwnPack">
					<img src="/assets/svg/delete_black_24dp.svg" title="Delete pack" @click="deletePack">
					<img src="/assets/svg/edit_black_24dp.svg" title="Edit pack" @click="editing = true" :class="{ disabled: editing }">
				</div>
				<download-button :id="packInfo.id" mode="pack" @download="packInfo.downloads++"></download-button>
				<p class="additionalInfo">Downloads: {{ packInfo.downloads }}</p>
			</div>
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
import ButtonWithIcon from '../ButtonWithIcon.vue';
import InfoBanner from '../InfoBanner.vue';
import Loader from '../Loader.vue';
import { LevelPanelActions } from '../LevelPanel.vue';
import { emitter } from '../../ts/emitter';

export default Vue.defineComponent({
	data() {
		return {
			packInfo: null as ExtendedPackInfo,
			editing: false,
			deleting: false
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
			return this.packInfo && this.packInfo.createdBy.id === this.$store.state.loggedInAccount?.id;
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
		},
		canSubmitChanges(): boolean {
			return !!(this.packInfo.name && this.packInfo.description);
		}
	},
	methods: {
		onPackUpdate(updateInfo: { id: number, levelIds?: number[] }) {
			if (this.packInfo.id !== updateInfo.id) return;

			if (updateInfo.levelIds) {
				this.packInfo.levels = this.packInfo.levels.filter(x => updateInfo.levelIds.includes(x.id));
			}
		},
		async submitChanges() {
			this.editing = false;
			let ownPack = this.$store.state.ownPacks.find(x => x.id === this.packInfo.id);
			ownPack.name = this.packInfo.name;

			let token = localStorage.getItem('token');
			await fetch(`/api/pack/${this.packInfo.id}/edit`, {
				method: 'POST',
				body: JSON.stringify({
					name: this.packInfo.name,
					description: this.packInfo.description
				}),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});

			emitter.emit('packView', -1); // Hack: Pretend that we're viewing a pack with an ID that for sure won't exist, forcing the pack list to re-fetch
		},
		async deletePack() {
			if (!confirm(`Are you sure you want to delete your pack "${this.packInfo.name}"?`)) return;

			this.deleting = true;

			let token = localStorage.getItem('token');
			let response = await fetch(`/api/pack/${this.packInfo.id}/delete`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				this.$store.state.ownPacks = this.$store.state.ownPacks.filter(x => x.id !== this.packInfo.id);
				emitter.emit('packView', -1); // Same hack as above
				this.$store.state.nextInfoBannerMessage = `Pack "${this.packInfo.name}" has been deleted successfully.`;
				this.$router.push({ name: 'Profile', params: { id: this.$store.state.loggedInAccount.id } });
			} else {
				this.deleting = false;
				alert("Something went wrong.");
			}
		}
	},
	components: {
		ProfileBanner,
		DownloadButton,
		PanelList,
		ButtonWithIcon,
		InfoBanner,
		Loader
	},
	watch: {
		isOwnPack() {
			if (!this.isOwnPack) this.editing = false;
		}
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

.topRight {
	width: 300px;
}

@media (max-width: 629px) {
	.topRight {
		width: 100%;
	}
}

.howToAdd {
	font-weight: bold;
	margin: 0;
	font-size: 14px;
	text-align: center;
}

.profileBanner {
	width: 300px;
}

.actions {
	text-align: right;
	margin-top: -5px;
}

.actions img {
	opacity: 0.5;
	padding: 5px;
	cursor: pointer;
}

.actions img:hover {
	opacity: 0.75;
}

.nameInput, .descriptionInput {
	width: 500px;
	margin-bottom: 10px;
}

.saveChangesButton {
	width: 200px;
}

.additionalInfo {
	margin: 0;
	margin-top: 5px;
	opacity: 0.75;
	font-size: 14px;
}
</style>