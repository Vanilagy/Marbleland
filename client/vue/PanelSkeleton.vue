<template>
	<div class="panelSkeleton">
		<div class="inner"></div>
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

.panelSkeleton {
	height: 200px;
	box-sizing: border-box;
	padding: 5px;
	width: calc(100% / 4);
}

.inner {
	height: 100%;
	background: rgb(240, 240, 240);
	overflow: hidden;
	border-radius: 5px;
	animation: pulse 1.5s infinite ease;
}

@media (max-width: 1045px) {
	.panelSkeleton {
		width: calc(100% / 3);
	}
}

@media (max-width: 792px) {
	.panelSkeleton {
		width: calc(100% / 2);
	}
}

@media (max-width: 540px) {
	.panelSkeleton {
		width: calc(100% / 1);
	}
}
</style>