<template>
	<div v-if="shown">
		<p>{{ content }}</p>
		<img src="/assets/svg/close_black_24dp.svg" @click="shown = false">
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useStore } from '../../ts/store';

const store = useStore();

const shown = ref(false);
const content = ref('');

onMounted(() => {
	// If the store contains information about the next message to display, display it and then reset the store. Otherwise don't show.
	if (store.state.nextInfoBannerMessage) {
		content.value = store.state.nextInfoBannerMessage;
		store.state.nextInfoBannerMessage = null;
		shown.value = true;
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