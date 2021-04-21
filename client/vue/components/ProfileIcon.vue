<template>
	<div class="notSelectable">
		<img :src="iconSrc" @click="expanded = !expanded" :class="{ containsAvatar: $store.state.loggedInAccount && $store.state.loggedInAccount.hasAvatar, basicIcon: !($store.state.loggedInAccount && $store.state.loggedInAccount.hasAvatar) }">
		<div v-if="expanded" class="options">
			<p v-for="option of options" :key="option.label" @click="expanded = false, option.onClick()">{{ option.label }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
	data() {
		return {
			expanded: false
		};
	},
	computed: {
		iconSrc(): string {
			let acc = this.$store.state.loggedInAccount;
			if (!acc || !acc.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg";
			return `/api/account/${acc.id}/avatar?v=${this.$store.state.avatarVersion}&size=64`;
		},
		/** Generates a list of options (actions, technically, idk what I was thinking with this nomenclature) that are accessible through the dropdown. */
		options(): { label: string, onClick: () => void }[] {
			let self = this;
			// The theming option is shown always
			let themeOption = {
				label: 'Toggle theme',
				onClick: self.toggleColorTheme
			};

			// Show different options based on the logged-in state
			if (this.$store.state.loggedInAccount === null) {
				return [{
					label: 'Sign in',
					onClick() {
						self.$router.push('/sign-in');
					}
				}, {
					label: 'Sign up',
					onClick() {
						self.$router.push('/sign-up');
					}
				}, themeOption];
			} else {
				return [{
					label: 'View profile',
					onClick() {
						self.$router.push({ name: 'Profile', params: { id: self.$store.state.loggedInAccount.id } });
					}
				}, {
					label: 'Change password',
					onClick() {
						self.$router.push('/change-password');
					}
				}, {
					label: 'Sign out',
					onClick() {
						// Sign out the account
						let token = localStorage.getItem('token');
						fetch('/api/account/sign-out', { // Don't await this boy for more instant feedback
							method: 'POST',
							headers: {
								'Authorization': `Bearer ${token}`
							}
						});
						localStorage.removeItem('token');
						self.$store.state.loggedInAccount = null;
					}
				}, themeOption];
			}
		}
	},
	methods: {
		toggleColorTheme() {
			// Toggle the theme by adding/removing a class on the root (<html>) element
			if (document.documentElement.classList.contains('dark')) {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('colorTheme', 'light');
			} else {
				document.documentElement.classList.add('dark');
				localStorage.setItem('colorTheme', 'dark');
			}
		}
	}
});
</script>

<style scoped>
img {
	opacity: 0.75;
	width: 32px;
	cursor: pointer;
	border-radius: 1000px;
	overflow: hidden;
	box-sizing: border-box;
	transition: box-shadow 0.15s;
}
img.containsAvatar {
	border: 2px solid var(--background-2);
	opacity: 1;
}

img:hover {
	box-shadow: 0px 0px 5px #0000009f;
}

.options {
	position: absolute;
	top: 30px;
	right: 0px;
	background: var(--background-1);
	border-radius: 5px;
	overflow: hidden;
	box-shadow: 0px 0px 5px #00000052;
	width: 150px;
	z-index: 1;
}

.options > p {
	margin: 0;
	padding: 5px;
	padding-left: 10px;
	cursor: pointer;
}

.options > p:hover {
	background: var(--background-2);
}
</style>