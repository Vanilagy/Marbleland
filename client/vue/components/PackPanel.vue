<template>
	<div class="packPanelWrapper">
		<div class="panel notSelectable" @click="clicked" :style="{ outline: selectedPacks?.includes(packInfo.id)? '3px solid #64b8e9' : '' }">
			<a :href="selectedPacks? undefined : `/pack/${packInfo.id}`" @click.prevent=""><img :src="imageSource" @error="imageLoadError" v-if="imageShown" class="mainImage"></a>
			<div class="bottom">
				<div class="name">{{packInfo.name}}</div>
				<div class="creator">
					<img :src="avatarSrc" :style="{ opacity: avatarOpacity }">
					<p>{{ packInfo.createdBy.username }}</p>
				</div>
				<div class="levelCount">{{ packInfo.levelIds.length }} levels</div>
			</div>
			<div class="actions" :style="actionsStyle" v-if="!selectedPacks">
				<img src="/assets/svg/download_black_24dp.svg" title="Download pack" @click.stop="download" class="basicIcon">
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { PackInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import { useStore } from '../../ts/store';

const props = defineProps<{
	packInfo?: PackInfo,
	selectedPacks?: number[]
}>();

const store = useStore();
const router = useRouter();

const imageShown = ref(true);
const imageVersion = ref(0);

const imageSource = computed(() => {
	return `/api/pack/${props.packInfo.id}/image?version=${imageVersion.value}`;
});
const avatarSrc = computed(() => {
	if (!props.packInfo.createdBy.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg";
	return `/api/account/${props.packInfo.createdBy.id}/avatar?size=32`;
});
const avatarOpacity = computed(() => {
	return props.packInfo.createdBy.hasAvatar? 1 : 0.75;
});
const actionsStyle = computed(() => {
	return {
		display: (!Util.deviceSupportsHover())? 'block' : '' // Make sure to alawys show the actions if there's no hovering on the device
	};
});

const clicked = () => {
	if (props.selectedPacks) {
		// Toggle the presence of this pack in the list
		if (props.selectedPacks.includes(props.packInfo.id)) {
			props.selectedPacks.splice(props.selectedPacks.indexOf(props.packInfo.id), 1);
		} else {
			props.selectedPacks.push(props.packInfo.id);
		}

		return;
	}

	router.push({ name: 'Pack', params: { id: props.packInfo.id } });
};
const imageLoadError = () => {
	imageShown.value = false;
};
const download = () => {
	window.location.href = window.location.origin + `/api/pack/${props.packInfo.id}/zip`;
};

// When this pack's levels change somewhere, its thumbnail does too
watch(() => store.state.packLevelIds[props.packInfo.id], levelIds => {
	imageVersion.value++;
	props.packInfo.levelIds = levelIds;
});
</script>

<style scoped>
.packPanelWrapper {
	position: relative;
	box-sizing: border-box;
	padding: 5px;
	width: calc(100% / 4);
}

.panel {
	height: 200px;
	background: var(--background-1);
	overflow: hidden;
	border-radius: 5px;
	position: relative;
	cursor: pointer;
	transition: box-shadow 0.15s;
}

@media (max-width: 1045px) {
	.packPanelWrapper {
		width: calc(100% / 3);
	}
}

@media (max-width: 792px) {
	.packPanelWrapper {
		width: calc(100% / 2);
	}
}

@media (max-width: 540px) {
	.packPanelWrapper {
		width: calc(100% / 1);
	}
}

.panel:hover {
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
}

.panel:hover .actions {
	display: block;
}

.mainImage {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.name {
	font-size: 16px;
	height: 24px;
	margin-bottom: -4px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 20px);
}

.creator {
	display: flex;
	align-items: center;
}

.creator img {
	width: 14px;
	height: 14px;
	margin-right: 5px;
	border-radius: 1000px;
}

.creator p {
	font-size: 12px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
	width: calc(100% - 20px);
	flex: 1 1 auto;
	margin: 0;
}

.bottom {
	position: absolute;
	left: 0;
	bottom: 0;
	padding: 3px 9px;
	width: 100%;
	background: var(--level-panel-bottom-background);
	box-sizing: border-box;
}

.actions {
	position: absolute;
	top: 0px;
	right: 0px;
	background: var(--level-panel-bottom-background);
	border-bottom-left-radius: 5px;
	display: none;
}

.actions img {
	cursor: pointer;
	padding: 5px;
	vertical-align: top;
	opacity: 0.5 !important;
	width: 20px;
}

.actions img:hover {
	opacity: 0.75 !important;
}

.levelCount {
	position: absolute;
	bottom: 3px;
	right: 8px;
	font-size: 12px;
}
</style>