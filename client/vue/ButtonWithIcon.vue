<template>
	<div @click="$emit('clicked')" class="mainButton">
		<img src="/assets/svg/download_black_24dp.svg" style="margin-right: 10px;">
		<span><slot></slot></span>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
export default Vue.defineComponent({
	props: {
		icon: String as PropType<string>
	},
	emits: ['clicked']
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
</style>