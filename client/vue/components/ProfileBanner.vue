<template>
	<div class="profileBanner notSelectable" @click="clicked">
		<a :href="`/profile/${profileInfo.id}`" @click.prevent=""><img :src="avatarSrc" :class="{ basicIcon: !profileInfo.hasAvatar }"></a>
		<div>
			<p class="username">{{ profileInfo.username }}</p>
			<p class="secondaryText">{{ secondaryText }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ProfileInfo } from '../../../shared/types';

const props = defineProps<{
	profileInfo?: ProfileInfo,
	secondaryText?: string
}>();

const router = useRouter();

const avatarSrc = computed(() => {
	if (!props.profileInfo.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg";
	return `/api/account/${props.profileInfo.id}/avatar?size=64`;
});

const clicked = () => {
	router.push({ name: 'Profile', params: { id: props.profileInfo.id } });
};
</script>

<style scoped>
.profileBanner {
	display: flex;
	align-items: center;
	cursor: pointer;
	border-radius: 5px;
}

.profileBanner img {
	width: 32px;
	height: 32px;
	border-radius: 1000px;
}

.profileBanner:hover img {
	box-shadow: 0px 0px 5px #0000008e;
}

.profileBanner:hover .username {
	text-decoration: underline;
}

.profileBanner p {
	margin: 0;
	margin-left: 10px;
	line-height: 16px;
}

.username {
	font-weight: bold;
	font-size: 16px;
}

.secondaryText {
	font-size: 13px;
	opacity: 0.75;
}
</style>