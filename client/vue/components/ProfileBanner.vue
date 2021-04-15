<template>
	<div class="profileBanner notSelectable" @click="clicked">
		<img :src="avatarSrc" :class="{ basicIcon: !profileInfo.hasAvatar }">
		<div>
			<p class="username">{{ profileInfo.username }}</p>
			<p class="secondaryText">{{ secondaryText }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ProfileInfo } from '../../../shared/types';
export default Vue.defineComponent({
	props: {
		profileInfo: Object as PropType<ProfileInfo>,
		secondaryText: String as PropType<string>
	},
	computed: {
		avatarSrc(): string {
			if (!this.profileInfo.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg";
			return `/api/account/${this.profileInfo.id}/avatar?size=64`;
		}
	},
	methods: {
		clicked() {
			this.$router.push({ name: 'Profile', params: { id: this.profileInfo.id } });
		}
	}
});
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