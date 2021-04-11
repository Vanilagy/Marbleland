<template>
	<div class="outer notSelectable">
		<div class="wrapper" :style="wrapperStyle">
			<p @click="toggleExpand">{{ currentLabel }}</p>
			<img src="/assets/svg/expand_more_black_24dp.svg" :style="chevronStyle">
			<div v-if="expanded" style="border-top: 1px solid rgb(220, 220, 220)" class="expander">
				<p v-for="option of options" :key="option.name" @click="select(option.name)">{{ option.label }}</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { emitter } from '../ts/emitter';

export default Vue.defineComponent({
	props: {
		options: Array as PropType<{
			name: string,
			label: string
		}[]>,
		modelValue: String as PropType<string>
	},
	data() {
		return {
			expanded: false
		};
	},
	computed: {
		currentLabel(): string {
			return this.options.find(x => x.name === this.modelValue).label;
		},
		chevronStyle(): Record<string, string> {
			return {
				transform: this.expanded? 'rotate(180deg)' : ''
			};
		},
		wrapperStyle(): Record<string, string> {
			return {
				'box-shadow': this.expanded? '0px 0px 5px #00000052' : ''
			};
		}
	},
	methods: {
		toggleExpand() {
			if (this.expanded) {
				this.expanded = false;
			} else {
				emitter.emit('dropdownOpen');
				this.expanded = true;
			}
		},
		select(name: string) {
			this.$emit('update:modelValue', name);
			this.expanded = false;
		},
		close() {
			this.expanded = false;
		}
	},
	mounted() {
		emitter.on('dropdownOpen', this.close);
	},
	unmounted() {
		emitter.off('dropdownOpen', this.close);
	}
});
</script>

<style scoped>
.outer {
	width: 100%;
	position: relative;
	height: 30px;
}

.wrapper {
	position: absolute;
	top: 0;
	left: 0;
	background: rgb(240, 240, 240);
	border-radius: 5px;
	overflow: hidden;
	width: 100%;
	z-index: 1;
}

img {
	position: absolute;
	top: 0;
	right: 0;
	padding: 3px;
	opacity: 0.75;
	pointer-events: none;
}

p {
	margin: 0;
	height: 30px;
	display: flex;
	align-items: center;
	padding-left: 10px;
	cursor: pointer;
}

p:hover {
	background: rgb(220, 220, 220);
}

.expander {
	z-index: 1;
	width: 100%;
}
</style>