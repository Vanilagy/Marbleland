<template>
	<div class="levelPanelWrapper">
		<div class="panel notSelectable" @click="clicked">
			<img :src="imageSource" @error="imageLoadError" v-if="imageShown" class="mainImage">
			<div class="bottom">
				<div class="name">{{levelInfo.name}}</div>
				<div class="artist" :class="{missingArtist: !levelInfo.artist}">{{levelInfo.artist? levelInfo.artist : 'Missing artist'}}</div>
			</div>
			<div class="actions" :style="actionsStyle">
				<img src="/assets/svg/remove_circle_outline_black_24dp.svg" v-if="actions?.removeFromPack" title="Remove level from this pack" @click.stop="actions.removeFromPack(levelInfo)">
				<img src="/assets/svg/create_new_folder_black_24dp.svg" v-if="actions?.addToPack" title="Add level to pack" @click.stop="$refs.packAdder.toggle()">
				<img src="/assets/svg/download_black_24dp.svg" title="Download level" @click.stop="download">
			</div>
		</div>
		<pack-adder :levelId="levelInfo.id" class="packAdder" ref="packAdder"></pack-adder>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { LevelInfo } from '../../shared/types';
import { Util } from '../ts/util';
import PackAdder from './PackAdder.vue';

export interface LevelPanelActions {
	removeFromPack?: (info: LevelInfo) => void,
	addToPack?: boolean
}

export default Vue.defineComponent({
	props: {
		levelInfo: Object as PropType<LevelInfo>,
		actions: Object as PropType<LevelPanelActions>
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
}

.panel {
	width: 242px;
	height: 200px;
	background: rgb(240, 240, 240);
	overflow: hidden;
	border-radius: 5px;
	position: relative;
	cursor: pointer;
	transition: box-shadow 0.15s;
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
	background: rgba(240, 240, 240, 0.9);
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
	background: rgba(240, 240, 240, 0.9);
	border-bottom-left-radius: 5px;
	display: none;
}

.actions img {
	cursor: pointer;
	padding: 5px;
	vertical-align: top;
	opacity: 0.5;
	width: 20px;
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