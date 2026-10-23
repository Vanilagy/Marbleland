<template>
	<div class="mainButton notSelectable">
		<img ref="iconElement" :src="icon" :style="{ 'margin-right': noMargin? '' : '10px' }" class="basicIcon">
		<span><slot></slot></span>
	</div>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue';

defineProps<{
	icon?: string,
	noMargin?: boolean
}>();

const iconElement = useTemplateRef<HTMLImageElement>('iconElement');

defineExpose({ iconElement });
</script>

<style scoped>
.mainButton {
	width: 100%;
	background: var(--background-1);
	display: flex;
	justify-content: center;
	align-items: center;
	height: 40px;
	cursor: pointer;
	box-sizing: border-box;
	border-radius: 5px;
	padding: 0 16px;
	white-space: nowrap;
}

.mainButton:hover {
	border: 2px solid var(--background-2);
}

.mainButton:active {
	background:var(--background-2);
}

img {
	opacity: 0.75;
	display: block;
}
</style>