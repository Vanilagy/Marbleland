<template :key="$route.path">
	<Head v-if="packInfo">
		<title v-if="packInfo">{{ title }} - Marbleland</title>
		<meta name="description" :content="packInfo.description">
		<meta name="og:title" :content="title">
		<meta name="og:description" :content="packInfo.description">
		<meta name="og:image" :content="ORIGIN + `/api/pack/${packInfo.id}/image`">
		<meta name="twitter:card" content="summary_large_image">
	</Head>
	<loader v-if="!packInfo && !notFound"></loader>
	<p class="notFound" v-if="notFound">This pack doesn't exist or has been deleted. :(</p>
	<info-banner v-if="packInfo"></info-banner>
	<div v-if="packInfo" class="outer" :class="{ disabled: deleting }">
		<div style="display: flex; flex-wrap: wrap;">
			<div style="flex: 1 1 0px; min-width: 300px; max-width: 700px;">
				<h1 v-if="!editing">{{ packInfo.name }}</h1>
				<input v-else class="basicTextInput nameInput" placeholder="Name" v-model.trim="packInfo.name" :maxlength="PACK_NAME_MAX_LENGTH">
				<profile-banner :profileInfo="packInfo.createdBy" :secondaryText="createdText" class="profileBanner"></profile-banner>
				<h3>Description</h3>
				<p v-if="!editing" class="regularParagraph description" v-html="description"></p>
				<textarea v-else class="basicTextarea descriptionInput" placeholder="Description" v-model.trim="packInfo.description" :maxlength="PACK_DESCRIPTION_MAX_LENGTH"></textarea>
				<button-with-icon v-if="editing" icon="/assets/svg/check_black_24dp.svg" class="saveChangesButton" :class="{ disabled: !canSubmitChanges }" @click="submitChanges">Save changes</button-with-icon>
			</div>
			<div class="topRight">
				<div class="actions" v-if="hasOwnershipPermissions">
					<img src="/assets/svg/delete_black_24dp.svg" title="Delete pack" @click="deletePack" class="basicIcon">
					<img src="/assets/svg/edit_black_24dp.svg" title="Edit pack" @click="editing = true" :class="{ disabled: editing }" class="basicIcon">
				</div>
				<div class="buttonContainer">
					<download-button style="flex: 1 1 auto; margin-right: 10px" :id="packInfo.id" mode="pack" @download="incrementDownloads">Download pack</download-button>
					<love-button style="flex: 0 1 auto" :levelOrPackInfo="packInfo"></love-button>
				</div>
				<p class="additionalInfo">Downloads: {{ packInfo.downloads }}<br>Loves: {{ packInfo.lovedCount }}</p>
			</div>
		</div>
		<h3>Included levels ({{ packInfo.levels.length }})</h3>
		<panel-list mode="level" :entries="packInfo.levels" :defaultCount="24" :levelPanelActions="levelPanelActions" noEntriesNotice="This pack contains no levels." noShrink></panel-list>
		<p v-if="hasOwnershipPermissions && packInfo.levels.length === 0" class="howToAdd">Add levels to this pack by searching for the levels you want to add and then adding them from there.</p>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onServerPrefetch, onUnmounted, ref, watch, type WatchHandle } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExtendedPackInfo, LevelInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import ProfileBanner from '../components/ProfileBanner.vue';
import DownloadButton from '../components/DownloadButton.vue';
import PanelList from '../components/PanelList.vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import InfoBanner from '../components/InfoBanner.vue';
import Loader from '../components/Loader.vue';
import LoveButton from '../components/LoveButton.vue';
import { LevelPanelActions } from '../components/LevelPanel.vue';
import { useStore } from '../../ts/store';
import { Head } from '@unhead/vue/components';
import { ORIGIN, PACK_DESCRIPTION_MAX_LENGTH, PACK_NAME_MAX_LENGTH } from '../../../shared/constants';
import { db } from '../../../server/ts/globals';
import { getExtendedPackInfo, PackDoc } from '../../../server/ts/pack';

const store = useStore();
const route = useRoute();
const router = useRouter();

const packInfo = ref<ExtendedPackInfo>(null);
const editing = ref(false);
const deleting = ref(false);
const notFound = ref(false);
let hasDownloaded = false;
let stopWatchingPackLevels: WatchHandle = null;

onMounted(async () => {
	if (store.state.packPreload) {
		packInfo.value = store.state.packPreload;
		store.state.packPreload = null;
	} else {
		// Load all necessary info
		let response = await fetch(`/api/pack/${route.params.id}/info`);

		if (response.status === 404) {
			notFound.value = true;
			return;
		}

		let json = await response.json() as ExtendedPackInfo;
		packInfo.value = json;
	}

	store.state.viewedPackId = packInfo.value.id; // Trigger a possible update in pack search

	// Created only now that the pack is loaded, so it's not bound to the component and has to be stopped manually
	stopWatchingPackLevels = watch(() => store.state.packLevelIds[packInfo.value.id], levelIds => {
		// Refresh the level list
		packInfo.value.levels = packInfo.value.levels.filter(x => levelIds.includes(x.id));
	});
});
onServerPrefetch(async () => {
	let doc = await db.packs.findOneAsync({ _id: Number(route.params.id) }) as PackDoc;
	if (!doc) {
		notFound.value = true;
		return;
	}

	packInfo.value = await getExtendedPackInfo(doc, store.state.loggedInAccount?.id);
	store.state.packPreload = packInfo.value;
});
onUnmounted(() => {
	stopWatchingPackLevels?.(); // Never started if the pack doesn't exist
});

const createdText = computed(() => {
	return `Created this pack on ${Util.formatDate(new Date(packInfo.value.createdAt))}`;
});
const hasOwnershipPermissions = computed(() => {
	return packInfo.value && (packInfo.value.createdBy.id === store.state.loggedInAccount?.id || store.state.loggedInAccount?.isModerator);
});
const levelPanelActions = computed((): LevelPanelActions => {
	if (!hasOwnershipPermissions.value) return null;

	return {
		addToPack: true,
		// Add an additional icon that allows direct removal of the level from this pack
		async removeFromPack(info: LevelInfo) {
			// Update the locally stored packs
			packInfo.value.levels = packInfo.value.levels.filter(x => x.id !== info.id);
			let ownPack = store.state.ownPacks.find(x => x.id === packInfo.value.id);
			if (ownPack) ownPack.levelIds = ownPack.levelIds.filter(x => x !== info.id);

			// Send the update request to the server
			await fetch(`/api/pack/${packInfo.value.id}/set-levels`, {
				method: 'POST',
				body: JSON.stringify(packInfo.value.levels.map(x => x.id)),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			hasDownloaded = false;

			store.state.packLevelIds[packInfo.value.id] = packInfo.value.levels.map(x => x.id);
		},
		async swapLeft(info: LevelInfo) {
			swapLevels(info.id, -1);
		},
		async swapRight(info: LevelInfo) {
			swapLevels(info.id, 1);
		}
	};
});
const canSubmitChanges = computed(() => {
	return !!(packInfo.value.name && packInfo.value.description);
});
const description = computed(() => {
	return Util.linkify(packInfo.value.description);
});
const title = computed(() => {
	return `[Pack] ${packInfo.value.name} by ${packInfo.value.createdBy.username}`;
});
const isLoggedIn = computed(() => {
	return !!store.state.loggedInAccount
});

const submitChanges = async () => {
	editing.value = false;
	// Edit the local pack values
	let ownPack = store.state.ownPacks.find(x => x.id === packInfo.value.id);
	if (ownPack) ownPack.name = packInfo.value.name;

	// Submit the changes to the server
	await fetch(`/api/pack/${packInfo.value.id}/edit`, {
		method: 'PATCH',
		body: JSON.stringify({
			name: packInfo.value.name,
			description: packInfo.value.description
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	hasDownloaded = false;

	store.state.packListVersion++; // The pack list shows the old name
};
const deletePack = async () => {
	if (!confirm(`Are you sure you want to delete your pack "${packInfo.value.name}"?`)) return;

	deleting.value = true;

	// Tell the server to delete this pack
	let response = await fetch(`/api/pack/${packInfo.value.id}/delete`, {
		method: 'DELETE'
	});

	if (response.ok) {
		// Edit local pack values
		store.state.ownPacks = store.state.ownPacks.filter(x => x.id !== packInfo.value.id);
		store.state.packListVersion++; // The pack list still contains the deleted pack
		store.state.nextInfoBannerMessage = `Pack "${packInfo.value.name}" has been deleted successfully.`;
		router.push({ name: 'Profile', params: { id: store.state.loggedInAccount.id } });
	} else {
		deleting.value = false;
		alert("Something went wrong.");
	}
};
const swapLevels = async (levelId: number, direction: -1 | 1) => {
	let index = packInfo.value.levels.findIndex(x => x.id === levelId);
	let otherIndex = index + direction;
	if (otherIndex < 0 || otherIndex >= packInfo.value.levels.length) return; // Can't swap with nothing

	// Update the locally stored packs
	let temp = packInfo.value.levels[index];
	packInfo.value.levels[index] = packInfo.value.levels[otherIndex];
	packInfo.value.levels[otherIndex] = temp;

	let ownPack = store.state.ownPacks.find(x => x.id === packInfo.value.id);
	if (ownPack) ownPack.levelIds = packInfo.value.levels.map(x => x.id);

	// Send the update request to the server
	await fetch(`/api/pack/${packInfo.value.id}/set-levels`, {
		method: 'POST',
		body: JSON.stringify(packInfo.value.levels.map(x => x.id)),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	hasDownloaded = false;

	store.state.packLevelIds[packInfo.value.id] = packInfo.value.levels.map(x => x.id);
};
const incrementDownloads = () => {
	if (hasDownloaded) return;

	// Note that the count might not always be 100% matching due to IP timeouts on the server
	packInfo.value.downloads++;
	hasDownloaded = true;
};

watch(hasOwnershipPermissions, () => {
	if (!hasOwnershipPermissions.value) editing.value = false;
});
watch(isLoggedIn, () => {
	if (packInfo.value) packInfo.value.lovedByYou = false;
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

@media (max-width: 646px) {
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
	width: 100%;
	max-width: 500px;
	margin-bottom: 10px;
}

.description {
	white-space: pre-wrap;
	overflow-wrap: break-word;
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

.buttonContainer {
	display: flex;
	width: 100%;
	margin-top: 10px;
}
</style>