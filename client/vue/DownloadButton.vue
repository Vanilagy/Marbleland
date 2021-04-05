<template>
	<div @click="$emit('clicked')">
		<img src="/assets/svg/download_black_24dp.svg">
		<span>Download Level</span>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.defineComponent({
	
});
</script>

<style scoped>
div {
	width: 100%;
	background:  rgb(240, 240, 240);
	display: flex;
	justify-content: center;
	align-items: center;
	height: 40px;
	border-radius: 5px;
	overflow: hidden;
	cursor: pointer;
	border: 2px solid transparent;
	box-sizing: border-box;
}

div:hover {
	border: 2px solid rgb(220, 220, 220);
}

div:active {
	background: rgb(220, 220, 220);
}

div > img {
	opacity: 0.75;
	display: block;
	margin-right: 10px;
}

div > span {
	display: block;
	font-size: 18px;
	padding-right: 10px;
}
</style>