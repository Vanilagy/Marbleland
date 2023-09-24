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

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { PackInfo } from '../../../shared/types';
import { emitter } from '../../ts/emitter';
import { Util } from '../../ts/util';

export default defineComponent({
	props: {
		packInfo: Object as PropType<PackInfo>,
		selectedPacks: Array as PropType<number[]>
	},
	data() {
		return {
			imageShown: true,
			imageVersion: 0,
			selected: false
		};
	},
	computed: {
		imageSource(): string {
			return `/api/pack/${this.packInfo.id}/image?version=${this.imageVersion}`;
		},
		avatarSrc(): string {
			if (!this.packInfo.createdBy.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg";
			return `/api/account/${this.packInfo.createdBy.id}/avatar?size=32`;
		},
		avatarOpacity(): number {
			return this.packInfo.createdBy.hasAvatar? 1 : 0.75;
		},
		actionsStyle(): Record<string, string> {
			return {
				display: (!Util.deviceSupportsHover())? 'block' : '' // Make sure to alawys show the actions if there's no hovering on the device
			};
		}
	},
	methods: {
		clicked(): void {
			if (this.selectedPacks) {
				// Toggle the presence of this pack in the list
				if (this.selectedPacks.includes(this.packInfo.id)) {
					this.selectedPacks.splice(this.selectedPacks.indexOf(this.packInfo.id), 1);
				} else {
					this.selectedPacks.push(this.packInfo.id);
				}

				return;
			}

			this.$router.push({ name: 'Pack', params: { id: this.packInfo.id } });
		},
		imageLoadError() {
			this.imageShown = false;
		},
		download() {
			window.location.href = window.location.origin + `/api/pack/${this.packInfo.id}/zip`;
		},
		onPackUpdate(updateInfo: { id: number, levelIds?: number[] }) {
			if (updateInfo.id !== this.packInfo.id) return; // Check if the update is about us

			if (updateInfo.levelIds) {
				this.imageVersion++;
				this.packInfo.levelIds = updateInfo.levelIds;
			}
		}
	},
	mounted() {
		// Listen for any pack updates to then change accordingly
		emitter.on('packUpdate', this.onPackUpdate);
	},
	unmounted() {
		emitter.off('packUpdate', this.onPackUpdate);
	}
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