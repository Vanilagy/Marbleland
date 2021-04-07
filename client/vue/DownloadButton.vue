<template>
	<div style="position: relative; border-radius: 5px; overflow: hidden;">
		<div @click="download('platinumquest')" class="mainButton">
			<img src="/assets/svg/download_black_24dp.svg" style="margin-right: 10px;">
			<span>Download Level</span>
		</div>
		<img src="/assets/svg/expand_more_black_24dp.svg" class="expandMore" :style="{ transform: chevronTransform }" @click="expanded = !expanded">
		<div v-if="expanded">
			<p v-for="assumption of assuming" :key="assumption.name" @click="download(assumption.name)" v-html="assumption.label"></p>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
export default Vue.defineComponent({
	props: {
		levelId: Number as PropType<number>
	},
	data() {
		return {
			expanded: false,
			assuming: [{
				name: 'platinumquest',
				label: 'Assuming I have PQ <span style="opacity: 0.5;">(default)</span>'
			}, {
				name: 'gold',
				label: 'Assuming I have MBG'
			}, {
				name: 'none',
				label: 'Including all assets'
			}]
		};
	},
	computed: {
		chevronTransform(): string {
			return this.expanded? 'rotate(180deg)' : '';
		}
	},
	methods: {
		download(assumption: string) {
			window.location.href = window.location.origin + `/api/level/${this.levelId}/zip?assuming=${assumption}`;
		}
	}
});
</script>

<style scoped>
.mainButton {
	width: 100%;
	background:  rgb(240, 240, 240);
	display: flex;
	justify-content: center;
	align-items: center;
	height: 40px;
	cursor: pointer;
	border: 2px solid transparent;
	box-sizing: border-box;
}

.mainButton:hover {
	border: 2px solid rgb(220, 220, 220);
}

.mainButton:active {
	background: rgb(220, 220, 220);
}

img {
	opacity: 0.75;
	display: block;
}

.mainButton > span {
	display: block;
	font-size: 18px;
	padding-right: 10px;
}

.expandMore {
	position: absolute;
	right: 0px;
	top: 0px;
	opacity: 0.25;
	cursor: pointer;
	padding: 8px;
}

.expandMore:hover {
	opacity: 0.75;
}

p {
	width: 100%;
	background:  rgb(240, 240, 240);
	display: flex;
	padding-left: 10px;
	align-items: center;
	height: 30px;
	cursor: pointer;
	border: 2px solid transparent;
	box-sizing: border-box;
	margin: 0;
	white-space: pre;
}

p:hover {
	border: 2px solid rgb(220, 220, 220);
}

p:active {
	background: rgb(220, 220, 220);
}
</style>