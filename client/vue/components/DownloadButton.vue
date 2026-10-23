<template>
	<div style="position: relative; border-radius: 5px; overflow: hidden;" class="notSelectable">
		<button-with-icon icon="/assets/svg/download_black_24dp.svg" @click="download('platinumquest', version)" style="border-radius: 0px;"><slot></slot></button-with-icon>
		<img src="/assets/svg/expand_more_black_24dp.svg" class="expandMore basicIcon" :style="{ transform: chevronTransform }" @click="expanded = !expanded">
		<div v-if="expanded">
			<p v-for="assumption of assuming" :key="assumption.name" @click="download(assumption.name, version)" v-html="assumption.label"></p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import ButtonWithIcon from './ButtonWithIcon.vue';

const props = defineProps<{
	mode?: 'level' | 'pack' | 'multipleLevels',
	id?: number,
	version?: number
}>();

const emit = defineEmits<{
	download: [assumption: string]
}>();

const expanded = ref(false);
const assuming = [{
	name: 'platinumquest',
	label: 'Assuming I have PQ <span style="opacity: 0.5;">(default)</span>'
}, {
	name: 'gold',
	label: 'Assuming I have MBG'
}, {
	name: 'none',
	label: 'Including all assets'
}];

const chevronTransform = computed(() => {
	return expanded.value? 'rotate(180deg)' : '';
});

/** Start downloading the .zip with the correct assumption parameter and version */
const download = (assumption: string, version?: number) => {
	if (props.mode !== 'multipleLevels') {
		let url = ((props.mode === 'level') ? `/api/level/${props.id}/zip?assuming=${assumption}` : `/api/pack/${props.id}/zip?assuming=${assumption}`);
		if(version !== undefined)
			url += `&version=${version}`;
		window.location.href = window.location.origin + url;
	}
	emit('download', assumption);
};
</script>

<style scoped>
img {
	opacity: 0.75;
	display: block;
}

.expandMore {
	position: absolute;
	right: 0px;
	top: 0px;
	opacity: 0.25 !important;
	cursor: pointer;
	padding: 8px;
}

.expandMore:hover {
	opacity: 0.75 !important;
}

p {
	width: 100%;
	background: var(--background-1);
	display: flex;
	padding-left: 10px;
	align-items: center;
	height: 30px;
	cursor: pointer;
	border: 2px solid transparent;
	box-sizing: border-box;
	margin: 0;
	white-space: pre;
}

p:hover {
	border: 2px solid var(--background-2);
}

p:active {
	background: var(--background-2);
}
</style>