<template :key="$route.path">
	<Head v-if="packInfo">
		<title v-if="packInfo">{{ title }} - Marbleland</title>
		<meta name="description" :content="packInfo.description">
		<meta name="og:title" :content="title">
		<meta name="og:description" :content="packInfo.description">
		<meta name="og:image" :content="origin + `/api/pack/${packInfo.id}/image`">
		<meta name="twitter:card" content="summary_large_image">
	</Head>
	<loader v-if="!packInfo && !notFound"></loader>
	<p class="notFound" v-if="notFound">This pack doesn't exist or has been deleted. :(</p>
	<info-banner v-if="packInfo"></info-banner>
	<div v-if="packInfo" class="outer" :class="{ disabled: deleting }">
		<div style="display: flex; flex-wrap: wrap;">
			<div style="flex: 1 1 auto; min-width: 300px; max-width: 700px;">
				<h1 v-if="!editing">{{ packInfo.name }}</h1>
				<input v-else class="basicTextInput nameInput" placeholder="Name" v-model.trim="packInfo.name" :maxlength="$store.state.packNameMaxLength">
				<profile-banner :profileInfo="packInfo.createdBy" :secondaryText="createdText" class="profileBanner"></profile-banner>
				<h3>Description</h3>
				<p v-if="!editing" class="regularParagraph description" v-html="description"></p>
				<textarea v-else class="basicTextarea descriptionInput" placeholder="Description" v-model.trim="packInfo.description" :maxlength="$store.state.packDescriptionMaxLength"></textarea>
				<button-with-icon v-if="editing" icon="/assets/svg/check_black_24dp.svg" class="saveChangesButton" :class="{ disabled: !canSubmitChanges }" @click="submitChanges">Save changes</button-with-icon>
			</div>
			<div class="topRight">
				<div class="actions" v-if="hasOwnershipPermissions">
					<img src="/assets/svg/delete_black_24dp.svg" title="Delete pack" @click="deletePack" class="basicIcon">
					<img src="/assets/svg/edit_black_24dp.svg" title="Edit pack" @click="editing = true" :class="{ disabled: editing }" class="basicIcon">
				</div>
				<download-button :id="packInfo.id" mode="pack" @download="packInfo.downloads++">Download pack</download-button>
				<p class="additionalInfo">Downloads: {{ packInfo.downloads }}</p>
			</div>
		</div>
		<h3>Included levels ({{ packInfo.levels.length }})</h3>
		<panel-list mode="level" :entries="packInfo.levels" :defaultCount="24" :levelPanelActions="levelPanelActions" noEntriesNotice="This pack contains no levels." noShrink></panel-list>
		<p v-if="hasOwnershipPermissions && packInfo.levels.length === 0" class="howToAdd">Add levels to this pack by searching for the levels you want to add and then adding them from there.</p>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ExtendedPackInfo, LevelInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import ProfileBanner from '../components/ProfileBanner.vue';
import DownloadButton from '../components/DownloadButton.vue';
import PanelList from '../components/PanelList.vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import InfoBanner from '../components/InfoBanner.vue';
import Loader from '../components/Loader.vue';
import { LevelPanelActions } from '../components/LevelPanel.vue';
import { emitter } from '../../ts/emitter';
import { Head } from '@vueuse/head';
import { ORIGIN } from '../../../shared/constants';
import { db } from '../../../server/ts/globals';
import { getExtendedPackInfo, PackDoc } from '../../../server/ts/pack';

export default defineComponent({
	data() {
		return {
			packInfo: null as ExtendedPackInfo,
			editing: false,
			deleting: false,
			notFound: false
		};
	},
	async mounted() {
		if (this.$store.state.packPreload) {
			this.packInfo = this.$store.state.packPreload;
			this.$store.state.packPreload = null;
		} else {
			// Load all necessary info
			let response = await fetch(`/api/pack/${this.$route.params.id}/info`);

			if (response.status === 404) {
				this.notFound = true;
				return;
			}

			let json = await response.json() as ExtendedPackInfo;
			this.packInfo = json;
		}

		emitter.emit('packView', this.packInfo.id); // Trigger a possible update in pack search
		emitter.on('packUpdate', this.onPackUpdate);
	},
	async serverPrefetch() {
		let doc = await db.packs.findOne({ _id: Number(this.$route.params.id) }) as PackDoc;
		if (!doc) {
			this.notFound = true;
			return;
		}

		this.packInfo = await getExtendedPackInfo(doc);
		this.$store.state.packPreload = this.packInfo;
	},
	unmounted() {
		emitter.off('packUpdate', this.onPackUpdate);
	},
	computed: {
		createdText(): string {
			return `Created this pack on ${Util.formatDate(new Date(this.packInfo.createdAt))}`;
		},
		hasOwnershipPermissions(): boolean {
			return this.packInfo && (this.packInfo.createdBy.id === this.$store.state.loggedInAccount?.id || this.$store.state.loggedInAccount?.isModerator);
		},
		levelPanelActions(): LevelPanelActions {
			let self = this;
			if (!this.hasOwnershipPermissions) return null;

			return {
				addToPack: true,
				// Add an additional icon that allows direct removal of the level from this pack
				async removeFromPack(info: LevelInfo) {
					// Update the locally stored packs
					self.packInfo.levels = self.packInfo.levels.filter(x => x.id !== info.id);
					let ownPack = self.$store.state.ownPacks.find(x => x.id === self.packInfo.id);
					if (ownPack) ownPack.levelIds = ownPack.levelIds.filter(x => x !== info.id);

					// Send the update request to the server
					await fetch(`/api/pack/${self.packInfo.id}/set-levels`, {
						method: 'POST',
						body: JSON.stringify(self.packInfo.levels.map(x => x.id)),
						headers: {
							'Content-Type': 'application/json'
						}
					});

					emitter.emit('packUpdate', {
						id: self.packInfo.id,
						levelIds: self.packInfo.levels.map(x => x.id)
					});
				},
				async swapLeft(info: LevelInfo) {
					self.swapLevels(info.id, -1);
				},
				async swapRight(info: LevelInfo) {
					self.swapLevels(info.id, 1);
				}
			};
		},
		canSubmitChanges(): boolean {
			return !!(this.packInfo.name && this.packInfo.description);
		},
		description(): string {
			return Util.linkify(this.packInfo.description);
		},
		title(): string {
			return `[Pack] ${this.packInfo.name} by ${this.packInfo.createdBy.username}`;
		},
		origin(): string {
			return ORIGIN;
		}
	},
	methods: {
		onPackUpdate(updateInfo: { id: number, levelIds?: number[] }) {
			if (this.packInfo.id !== updateInfo.id) return;

			if (updateInfo.levelIds) {
				// Refresh the level list
				this.packInfo.levels = this.packInfo.levels.filter(x => updateInfo.levelIds.includes(x.id));
			}
		},
		async submitChanges() {
			this.editing = false;
			// Edit the local pack values
			let ownPack = this.$store.state.ownPacks.find(x => x.id === this.packInfo.id);
			if (ownPack) ownPack.name = this.packInfo.name;

			// Submit the changes to the server
			await fetch(`/api/pack/${this.packInfo.id}/edit`, {
				method: 'PATCH',
				body: JSON.stringify({
					name: this.packInfo.name,
					description: this.packInfo.description
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			emitter.emit('packView', -1); // Hack: Pretend that we're viewing a pack with an ID that for sure won't exist, forcing the pack list to re-fetch
		},
		async deletePack() {
			if (!confirm(`Are you sure you want to delete your pack "${this.packInfo.name}"?`)) return;

			this.deleting = true;

			// Tell the server to delete this pack
			let response = await fetch(`/api/pack/${this.packInfo.id}/delete`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Edit local pack values
				this.$store.state.ownPacks = this.$store.state.ownPacks.filter(x => x.id !== this.packInfo.id);
				emitter.emit('packView', -1); // Same hack as above
				this.$store.state.nextInfoBannerMessage = `Pack "${this.packInfo.name}" has been deleted successfully.`;
				this.$router.push({ name: 'Profile', params: { id: this.$store.state.loggedInAccount.id } });
			} else {
				this.deleting = false;
				alert("Something went wrong.");
			}
		},
		async swapLevels(levelId: number, direction: -1 | 1) {
			let index = this.packInfo.levels.findIndex(x => x.id === levelId);
			let otherIndex = index + direction;
			if (otherIndex < 0 || otherIndex >= this.packInfo.levels.length) return; // Can't swap with nothing

			// Update the locally stored packs
			let temp = this.packInfo.levels[index];
			this.packInfo.levels[index] = this.packInfo.levels[otherIndex];
			this.packInfo.levels[otherIndex] = temp;
			
			let ownPack = this.$store.state.ownPacks.find(x => x.id === this.packInfo.id);
			if (ownPack) ownPack.levelIds = this.packInfo.levels.map(x => x.id);

			// Send the update request to the server
			await fetch(`/api/pack/${this.packInfo.id}/set-levels`, {
				method: 'POST',
				body: JSON.stringify(this.packInfo.levels.map(x => x.id)),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			emitter.emit('packUpdate', {
				id: this.packInfo.id,
				levelIds: this.packInfo.levels.map(x => x.id)
			});
		}
	},
	components: {
		ProfileBanner,
		DownloadButton,
		PanelList,
		ButtonWithIcon,
		InfoBanner,
		Loader,
		Head
	},
	watch: {
		hasOwnershipPermissions() {
			if (!this.hasOwnershipPermissions) this.editing = false;
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
		margin-top: 10px;
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

.description {
	white-space: pre-wrap;
	word-break: break-all;
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

.notFound {
	text-align: center;
	margin-top: 50px;
}
</style>