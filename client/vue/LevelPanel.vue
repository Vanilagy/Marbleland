<template>
	<div class="outer" @click="clicked">
		<img :src="imageSource" @error="imageLoadError" v-if="imageShown">
		<div class="bottom">
			<div class="name">{{levelInfo.name}}</div>
			<div class="artist" :class="{missingArtist: !levelInfo.artist}">{{levelInfo.artist? levelInfo.artist : 'Missing artist'}}</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { LevelInfo } from '../../shared/types';

export default Vue.defineComponent({
	props: {
		levelInfo: {
			type: Object as PropType<LevelInfo>,
			required: true
		}
	},
	data() {
		return {
			imageShown: true
		};
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelInfo.id}/image`;
		}
	},
	methods: {
		clicked(): void {
			this.$router.push({ name: 'Level', params: { id: this.levelInfo.id } });
		},
		imageLoadError() {
			this.imageShown = false;
		}
	}
});
</script>

<style scoped>
.outer {
	width: 242px;
	height: 200px;
	background: rgb(240, 240, 240);
	overflow: hidden;
	border-radius: 5px;
	position: relative;
	cursor: pointer;
	transition: box-shadow 0.15s;
}

.outer:hover {
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
}

img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.name {
	font-size: 16px;
	height: 20px;
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
}

.missingArtist {
	font-style: italic;
	opacity: 0.5;
}
</style>