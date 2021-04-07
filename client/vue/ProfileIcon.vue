<template>
	<div>
		<img src="/assets/svg/account_circle_black_24dp.svg" @click="expanded = !expanded">
		<div v-if="expanded" class="options">
			<p v-for="option of options" :key="option.label" @click="expanded = false, option.onClick()">{{ option.label }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.defineComponent({
	data() {
		return {
			expanded: false
		};
	},
	computed: {
		options(): { label: string, onClick: () => void }[] {
			let self = this;

			if (this.$store.state.loggedInAccountId === null) return [{
				label: 'Sign in',
				onClick() {
					self.$router.push('/sign-in');
				}
			}, {
				label: 'Sign up',
				onClick() {
					self.$router.push('/sign-up');
				}
			}]; else return [{
				label: 'View profile',
				onClick() {
					self.$router.push({ name: 'Profile', params: { id: self.$store.state.loggedInAccountId } });
				}
			}, {
				label: 'Sign out',
				onClick() {
					fetch(`/api/account/sign-out?token=${localStorage.getItem('token')}`);
					localStorage.removeItem('token');
					self.$store.state.loggedInAccountId = null;
				}
			}];
		}
	}
});
</script>

<style scoped>
img {
	opacity: 0.75;
	width: 30px;
	cursor: pointer;
}

.options {
	position: absolute;
	top: 30px;
	right: 0px;
	background: rgb(240, 240, 240);
	border-radius: 5px;
	overflow: hidden;
	box-shadow: 0px 0px 5px #00000052;
	width: 120px;
	z-index: 1;
}

.options > p {
	margin: 0;
	padding: 5px;
	padding-left: 8px;
	cursor: pointer;
}

.options > p:hover {
	background: rgb(220, 220, 220);
}
</style>