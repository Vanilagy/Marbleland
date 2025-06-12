<template>
	<Head>
		<title>Change password - Marbleland</title>
		<meta name="og:title" content="Change password">
	</Head>
	<div :class="{ disabled: waitingForResponse }" v-if="$store.state.loggedInAccount">
		<h1>Change your password</h1>
		<input type="password" placeholder="Current password" v-model="currentPassword" @keydown.enter="submit" name="current-password" autocomplete="current-password" class="basicTextInput">
		<input type="password" placeholder="New password" v-model="newPassword" name="new-password" autocomplete="new-password" @keydown.enter="submit" class="basicTextInput">
		<input type="password" placeholder="New password (again)" v-model="newPasswordAgain" @keydown.enter="submit" class="basicTextInput">
		<p v-for="problem of problems" :key="problem" class="problem">- {{ problem }}</p>
		<button-with-icon icon="/assets/svg/edit_black_24dp.svg" class="submitButton" :class="{ disabled: !canSubmit }" @click="submit">
			Change password
		</button-with-icon>
	</div>
	<p v-else class="notSignedIn">You're not signed in.</p>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	props: {
		type: String as PropType<'signUp' | 'signIn'>
	},
	components: {
		ButtonWithIcon,
		Head
	},
	data() {
		return {
			currentPassword: '',
			newPassword: '',
			newPasswordAgain: '',
			waitingForResponse: false
		};
	},
	computed: {
		filledOut(): boolean {
			return !!(this.currentPassword && this.newPassword && this.newPasswordAgain);
		},
		/** Returns a list of problems with the current input. */
		problems(): string[] {
			let problems: string[] = [];

			if (!this.filledOut) return problems;

			if (this.newPassword.length < 8) problems.push("Your password needs to be 8 or more characters long.")
			if (this.newPassword !== this.newPasswordAgain) problems.push("Passwords don't match.");

			return problems;
		},
		canSubmit(): boolean {
			return this.filledOut && this.problems.length === 0;
		}
	},
	methods: {
		async submit() {
			if (!this.canSubmit) return;

			this.waitingForResponse = true;

			// Send the request and wait for the response
			let response = await fetch('/api/account/change-password', {
				method: 'POST',
				body: JSON.stringify({
					currentPassword: this.currentPassword,
					newPassword: this.newPassword
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				alert("Something went wrong.");
				this.waitingForResponse = false;
			} else {
				if (this.type === 'signUp') this.$store.state.nextInfoBannerMessage = "Password changed successfully!";
				this.$router.replace({ name: 'Profile', params: { id: this.$store.state.loggedInAccount.id } });
			}
		}
	}
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 30px 0px;
}

input {
	width: 300px;
	margin: auto;
	margin-bottom: 10px;
}

.problem {
	margin: 0;
	font-size: 13px;
	color: crimson;
	width: 300px;
	margin: auto;
}

.submitButton {
	width: 200px;
	margin: auto;
	border-radius: 5px;
	margin-top: 30px;
}

.notSignedIn {
	margin: 5px;
	margin-bottom: 15px;
	width: 100%;
	text-align: center;
	font-size: 14px;
}
</style>