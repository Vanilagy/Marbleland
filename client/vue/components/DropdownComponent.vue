<template>
	<div class="outer notSelectable">
		<div class="wrapper" :style="wrapperStyle">
			<p @click="show">{{ currentLabel }}</p>
			<img src="/assets/svg/expand_more_black_24dp.svg" :style="chevronStyle" class="basicIcon">
			<div v-if="expanded" style="border-top: 1px solid var(--background-2);" class="expander">
				<p v-for="option of options" :key="option.name" @click="select(option.name)">{{ option.label }}</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
	options?: {
		name: string,
		label: string
	}[]
}>();

const model = defineModel<string>();

const expanded = ref(false);

const currentLabel = computed(() => {
	return props.options.find(x => x.name === model.value).label;
});
const chevronStyle = computed(() => {
	return {
		transform: expanded.value? 'rotate(180deg)' : ''
	};
});
const wrapperStyle = computed(() => {
	return {
		'box-shadow': expanded.value? '0px 0px 5px #00000052' : '',
		'z-index': expanded.value? '1' : '' // Make sure to show the thing above everything else
	};
});

const show = () => {
	expanded.value = true;
};
const select = (name: string) => {
	model.value = name;
	expanded.value = false;
};
const mouseUpListener = () => {
	if (expanded.value) setTimeout(() => expanded.value = false);
};

onMounted(() => {
	window.addEventListener('mouseup', mouseUpListener);
});
onActivated(() => {
	window.addEventListener('mouseup', mouseUpListener);
});
onDeactivated(() => {
	window.removeEventListener('mouseup', mouseUpListener);
});
onUnmounted(() => {
	window.removeEventListener('mouseup', mouseUpListener);
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
	background: var(--background-1);
	border-radius: 5px;
	overflow: hidden;
	width: 100%;
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
	background: var(--background-2);
}

.expander {
	z-index: 1;
	width: 100%;
	max-height: 230px;
	overflow-y: auto;
}
</style>