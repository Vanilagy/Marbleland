<template>
	<div>
		<div class="wrapper">
			<div class="progress" :style="{ width: widthStyle, background: color }"></div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
export default Vue.defineComponent({
	props: {
		loaded: Number as PropType<number>,
		total: Number as PropType<number>,
		state: String as PropType<'neutral' | 'negative' | 'position'>
	},
	computed: {
		widthStyle(): string {
			if (this.total === 0) return '100%';
			let completion = this.loaded / this.total;
			return (completion * 100) + '%';
		},
		color(): string {
			if (this.state === 'neutral') return 'rgb(220, 220, 220)';
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
	background: rgb(240, 240, 240);
}

.progress {
	height: 100%;
	width: 33%;
	background: rgb(220, 220, 220);
}
</style>