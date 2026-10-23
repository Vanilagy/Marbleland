<template>
	<button-with-icon :title="title" ref="button" class="button" :icon="icon" noMargin @click="toggle"></button-with-icon>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ExtendedLevelInfo, ExtendedPackInfo } from '../../../shared/types';
import ButtonWithIcon from './ButtonWithIcon.vue';
import { useStore } from '../../ts/store';

const props = defineProps<{
	levelOrPackInfo?: ExtendedLevelInfo | ExtendedPackInfo
}>();

const store = useStore();
const router = useRouter();
const button = useTemplateRef<InstanceType<typeof ButtonWithIcon>>('button');

const icon = ref("/assets/svg/favorite_border_black_24dp.svg");

onMounted(() => {
	updateStyle(false);
});

const title = computed(() => {
	return enabled.value? 'Unlove 😭': 'Love';
});
const enabled = computed(() => {
	return props.levelOrPackInfo.lovedByYou;
});
const apiBase = computed(() => {
	if ((props.levelOrPackInfo as ExtendedPackInfo).levels) return '/api/pack'; // Check if it's a pack info
	else return '/api/level';
});

watch(enabled, () => {
	updateStyle();
});

const updateStyle = (animate = true) => {
	let img = button.value.iconElement;

	if (enabled.value) {
		icon.value = "/assets/svg/favorite_black_24dp.svg";
		img.style.filter = 'invert(27%) sepia(89%) saturate(6366%) hue-rotate(327deg) brightness(107%) contrast(122%)'; // From https://codepen.io/sosuke/pen/Pjoqqp

		if (!animate) return;

		img.style.animation = '';
		img.clientWidth;
		img.style.animation = 'love-animation 1s cubic-bezier(0.22, 1, 0.36, 1)';
	} else {
		icon.value = "/assets/svg/favorite_border_black_24dp.svg";
		img.style.filter = '';
	}
};
const toggle = () => {
	if (!store.state.loggedInAccount) {
		// Prompt the user to sign in
		router.push('/sign-in');
		return;
	}

	if (store.state.loggedInAccount.isSuspended) {
		alert("You can't love levels. You're suspended!");
		return;
	}

	if (enabled.value) {
		props.levelOrPackInfo.lovedByYou = false;
		props.levelOrPackInfo.lovedCount--;

		fetch(`${apiBase.value}/${props.levelOrPackInfo.id}/unlove`, {
			method: 'PATCH'
		});
	} else {
		props.levelOrPackInfo.lovedByYou = true;
		props.levelOrPackInfo.lovedCount++;

		fetch(`${apiBase.value}/${props.levelOrPackInfo.id}/love`, {
			method: 'PATCH'
		});
	}
};
</script>

<style scoped>
.button {
	width: 40px;
}
</style>

<style>
@keyframes love-animation {
	from { transform-origin: 50% 50%; transform: scale(2); }
	to { transform-origin: 50% 50%; transform: scale(1); }
}
</style>