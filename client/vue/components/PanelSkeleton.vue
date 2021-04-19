<template>
	<div class="panelSkeleton">
		<div class="inner"></div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
	
});
</script>

<style scoped>
@keyframes pulse {
	0% {background: var(--background-1);}
	50% {background: var(--panel-skeleton-animation-background);}
	100% {background: var(--background-1);}
}

.panelSkeleton {
	height: 200px;
	box-sizing: border-box;
	padding: 5px;
	width: calc(100% / 4);
}

.inner {
	height: 100%;
	background: var(--background-1);
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