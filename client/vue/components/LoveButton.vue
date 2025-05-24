<template>
	<button-with-icon :title="title" ref="button" class="button" :icon="icon" noMargin @click="toggle"></button-with-icon>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ExtendedLevelInfo, ExtendedPackInfo } from '../../../shared/types';
import ButtonWithIcon from './ButtonWithIcon.vue';

export default defineComponent({
	components: {
		ButtonWithIcon
	},
	props: {
		levelOrPackInfo: Object as PropType<ExtendedLevelInfo | ExtendedPackInfo>
	},
	data() {
		return {
			icon: "/assets/svg/favorite_border_black_24dp.svg",
			filterOverride: ''
		};
	},
	mounted() {
		this.updateStyle(false);
	},
	computed: {
		title(): string {
			return this.enabled? 'Unlove 😭': 'Love';
		},
		enabled(): boolean {
			return this.levelOrPackInfo.lovedByYou;
		},
		apiBase(): string {
			if ((this.levelOrPackInfo as ExtendedPackInfo).levels) return '/api/pack'; // Check if it's a pack info
			else return '/api/level';
		}
	},
	watch: {
		enabled() {
			this.updateStyle();
		}
	},
	methods: {
		updateStyle(animate = true) {
			let img = (this.$refs.button as any).$refs.icon as HTMLImageElement;

			if (this.enabled) {
				this.icon = "/assets/svg/favorite_black_24dp.svg";
				img.style.filter = 'invert(27%) sepia(89%) saturate(6366%) hue-rotate(327deg) brightness(107%) contrast(122%)'; // From https://codepen.io/sosuke/pen/Pjoqqp

				if (!animate) return;

				img.style.animation = '';
				img.clientWidth;
				img.style.animation = 'love-animation 1s cubic-bezier(0.22, 1, 0.36, 1)';
			} else {
				this.icon = "/assets/svg/favorite_border_black_24dp.svg";
				img.style.filter = '';
			}
		},
		toggle() {
			if (!this.$store.state.loggedInAccount) {
				// Prompt the user to sign in
				this.$router.push('/sign-in');
				return;
			}

			if (this.$store.state.loggedInAccount.isSuspended) {
				alert("You can't love levels. You're suspended!");
				return;
			}

			if (this.enabled) {
				this.levelOrPackInfo.lovedByYou = false;
				this.levelOrPackInfo.lovedCount--;

				fetch(`${this.apiBase}/${this.levelOrPackInfo.id}/unlove`, {
					method: 'PATCH'
				});
			} else {
				this.levelOrPackInfo.lovedByYou = true;
				this.levelOrPackInfo.lovedCount++;

				fetch(`${this.apiBase}/${this.levelOrPackInfo.id}/love`, {
					method: 'PATCH'
				});
			}
		}
	}
});
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