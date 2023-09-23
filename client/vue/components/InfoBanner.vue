<template>
	<div v-if="shown" :class="{ info: type === 'info' }">
		<p>{{ content }}</p>
		<img src="/assets/svg/close_black_24dp.svg" @click="shown = false">
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
	data() {
		return {
			shown: false,
			content: '',
			type: 'success' as 'success' | 'info'
		}
	},
	mounted() {
		// If the store contains information about the next message to display, display it and then reset the store. Otherwise don't show.
		if (this.$store.state.nextInfoBannerMessage) {
			this.content = this.$store.state.nextInfoBannerMessage;
			this.type = this.$store.state.nextInfoBannerType;

			this.$store.state.nextInfoBannerMessage = null;
			this.$store.state.nextInfoBannerType = null;

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
	color: rgb(64, 64, 64);
}
div.info {
	background: #7fb2ff;
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