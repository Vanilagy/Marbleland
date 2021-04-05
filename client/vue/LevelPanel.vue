<template>
	<div class="outer">
		<img :src="imageSource">
		<div class="bottom">
			<div class="name">{{levelEntry.name}}</div>
			<div class="artist">{{levelEntry.artist}}</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { LevelEntry } from './App.vue';

export default Vue.defineComponent({
	props: {
		levelEntry: {
			type: Object as PropType<LevelEntry>
		}
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelEntry.id}/image`;
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
}

.artist {
	font-size: 12px;
}

.bottom {
	position: absolute;
	left: 0;
	bottom: 0;
	padding: 3px 10px;
	width: 100%;
	background: rgba(240, 240, 240, 0.9);
}
</style>