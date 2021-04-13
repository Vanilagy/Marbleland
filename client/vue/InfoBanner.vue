<template>
	<div v-if="shown">
		<p>{{ content }}</p>
		<img src="/assets/svg/close_black_24dp.svg" @click="shown = false">
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
export default Vue.defineComponent({
	data() {
		return {
			shown: false,
			content: ''
		}
	},
	mounted() {
		if (this.$store.state.nextInfoBannerMessage) {
			this.content = this.$store.state.nextInfoBannerMessage;
			this.$store.state.nextInfoBannerMessage = null;
			this.shown = true;
		}
	}
});
</script>

<style scoped>
div {
	height: 40px;
	background: palegreen;
	border-radius: 5px;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 10px;
}

p {
	margin: 0;
	font-size: 14px;
}

img {
	position: absolute;
	opacity: 0.25;
	cursor: pointer;
	top: 5px;
    right: 5px;
    width: 16px;
}

img:hover {
	opacity: 0.75;
}
</style>