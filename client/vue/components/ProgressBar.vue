<template>
	<div>
		<div class="wrapper">
			<div class="progress" :style="{ width: widthStyle, background: color }"></div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
	loaded?: number,
	total?: number,
	state?: 'neutral' | 'negative' | 'positive'
}>();

/** Computes the width of the progress bar */
const widthStyle = computed(() => {
	if (props.total === 0) return '100%'; // I mean... if there are 0 things to load, then we're already done, that's why 100%.
	let completion = props.loaded / props.total;
	return (completion * 100) + '%';
});
const color = computed(() => {
	if (props.state === 'neutral') return 'var(--text-color)';
	if (props.state === 'negative') return 'crimson';
	return 'lightgreen';
});
</script>

<style scoped>
.wrapper {
	height: 10px;
	border-radius: 5px;
	overflow: hidden;
	background: var(--background-2);
}

.progress {
	height: 100%;
	width: 33%;
	background: var(--text-color);
}
</style>