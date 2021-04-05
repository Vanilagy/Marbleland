<template>
	<div class="outer" @click="clicked">
		<img :src="imageSource">
		<div class="bottom">
			<div class="name">{{levelInfo.name}}</div>
			<div class="artist">{{levelInfo.name}}</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { LevelInfo } from '../../shared/types';
import { store } from '../ts/store';

export default Vue.defineComponent({
	props: {
		levelInfo: {
			type: Object as PropType<LevelInfo>,
			required: true
		}
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelInfo.id}/image`;
		}
	},
	methods: {
		clicked(): void {
			store.state.currentLevelInfo = this.levelInfo;
			this.$router.push({ name: 'Level', params: { id: this.levelInfo.id } });
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