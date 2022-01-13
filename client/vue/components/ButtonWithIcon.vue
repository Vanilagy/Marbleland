<template>
	<div class="mainButton notSelectable">
		<img ref="icon" :src="icon" :style="{ 'margin-right': noMargin? '' : '10px' }" class="basicIcon">
		<span><slot></slot></span>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
	props: {
		icon: String as PropType<string>,
		noMargin: Boolean as PropType<boolean>
	},
	emits: ['clicked']
});
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
	border: 2px solid transparent;
	box-sizing: border-box;
	border-radius: 5px;
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