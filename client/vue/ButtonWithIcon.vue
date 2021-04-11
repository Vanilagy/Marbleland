<template>
	<div class="mainButton notSelectable">
		<img :src="icon" style="margin-right: 10px;">
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
	border-radius: 5px;
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