<template>
	<div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.defineComponent({
	
});
</script>

<style scoped>
@keyframes pulse {
	0% {background: rgb(240, 240, 240);}
	50% {background: rgb(250, 250, 250);}
	100% {background: rgb(240, 240, 240);}
}

div {
	width: 242px;
	height: 200px;
	background: rgb(240, 240, 240);
	overflow: hidden;
	border-radius: 5px;
	position: relative;
	animation: pulse 1.5s infinite ease;
}
</style>