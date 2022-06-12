<template>
	<div>
		<div class="wrapper">
			<div class="progress" :style="{ width: widthStyle, background: color }"></div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
	props: {
		loaded: Number as PropType<number>,
		total: Number as PropType<number>,
		state: String as PropType<'neutral' | 'negative' | 'positive'>
	},
	computed: {
		/** Computes the width of the progress bar */
		widthStyle(): string {
			if (this.total === 0) return '100%'; // I mean... if there are 0 things to load, then we're already done, that's why 100%.
			let completion = this.loaded / this.total;
			return (completion * 100) + '%';
		},
		color(): string {
			if (this.state === 'neutral') return 'var(--text-color)';
			if (this.state === 'negative') return 'crimson';
			return 'lightgreen';
		}
	}
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