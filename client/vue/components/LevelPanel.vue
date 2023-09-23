<template>
	<div class="levelPanelWrapper">
		<div class="panel notSelectable" @click="clicked" :style="{ outline: selectedLevels?.includes(levelInfo.id)? '3px solid #64b8e9' : '' }">
			<a :href="selectedLevels? undefined : `/level/${levelInfo.id}`" @click.prevent=""><img :src="imageSource" @error="imageLoadError" v-if="imageShown" class="mainImage"></a>
			<div class="bottom">
				<div class="name">{{levelInfo.name}}</div>
				<div class="artist" :class="{missingArtist: !levelInfo.artist}">{{levelInfo.artist? levelInfo.artist : 'Missing artist'}}</div>
			</div>
			<div class="actions" :style="actionsStyle" v-if="!selectedLevels">
				<img src="/assets/svg/west_black_24dp.svg" v-if="actions && actions.swapLeft" title="Swap to the left" @click.stop="actions.swapLeft(levelInfo)" class="basicIcon">
				<img src="/assets/svg/east_black_24dp.svg" v-if="actions && actions.swapRight" title="Swap to the right" @click.stop="actions.swapRight(levelInfo)" class="basicIcon">
				<img src="/assets/svg/remove_circle_outline_black_24dp.svg" v-if="actions && actions.removeFromPack" title="Remove level from this pack" @click.stop="actions.removeFromPack(levelInfo)" class="basicIcon">
				<img src="/assets/svg/create_new_folder_black_24dp.svg" v-if="actions && actions.addToPack" title="Add level to pack" @click.stop="$refs.packAdder.show()" class="basicIcon">
				<img src="/assets/svg/download_black_24dp.svg" title="Download level" @click.stop="download" class="basicIcon">
			</div>
		</div>
		<pack-adder :levelId="levelInfo.id" class="packAdder" ref="packAdder"></pack-adder>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { LevelInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import PackAdder from './PackAdder.vue';

/** Specifies options actions a level panel can display. */
export interface LevelPanelActions {
	removeFromPack?: (info: LevelInfo) => void,
	addToPack?: boolean,
	swapLeft?: (info: LevelInfo) => void,
	swapRight?: (info: LevelInfo) => void
}

export default defineComponent({
	props: {
		levelInfo: Object as PropType<LevelInfo>,
		actions: Object as PropType<LevelPanelActions>,
		selectedLevels: Array as PropType<number[]>
	},
	data() {
		return {
			imageShown: true
		};
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelInfo.id}/image`;
		},
		actionsStyle(): Record<string, string> {
			return {
				display: (!Util.deviceSupportsHover())? 'block' : '' // Make sure to alawys show the actions if there's no hovering on the device
			};
		}
	},
	methods: {
		clicked(): void {
			if (this.selectedLevels) {
				// Toggle the presence of this level in the list
				if (this.selectedLevels.includes(this.levelInfo.id)) {
					this.selectedLevels.splice(this.selectedLevels.indexOf(this.levelInfo.id), 1);
				} else {
					this.selectedLevels.push(this.levelInfo.id);
				}

				return;
			}

			this.$router.push({ name: 'Level', params: { id: this.levelInfo.id } });
		},
		imageLoadError() {
			this.imageShown = false;
		},
		download() {
			window.location.href = window.location.origin + `/api/level/${this.levelInfo.id}/zip`;
		}
	},
	components: {
		PackAdder
	}
});
</script>

<style scoped>
.levelPanelWrapper {
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
	.levelPanelWrapper {
		width: calc(100% / 3);
	}
}

@media (max-width: 792px) {
	.levelPanelWrapper {
		width: calc(100% / 2);
	}
}

@media (max-width: 540px) {
	.levelPanelWrapper {
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

.artist {
	font-size: 12px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 20px);
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

.missingArtist {
	font-style: italic;
	opacity: 0.5;
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

.packAdder {
	position: absolute;
	top: 30px;
	right: 0px;
	z-index: 1;
}
</style>