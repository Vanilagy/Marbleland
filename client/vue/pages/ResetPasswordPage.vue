<template>
	<Head>
		<title>Reset Password - Marbleland</title>
	</Head>
	<div :class="{ disabled: waitingForResponse }" v-if="!$store.state.loggedInAccount">
		<h1>Set new password</h1>
		<p class="description">Enter your new password below.</p>
		<input type="password" placeholder="New password" v-model="password" @keydown.enter="submit" autofocus name="new-password" autocomplete="new-password" class="basicTextInput">
		<input type="password" placeholder="New password (again)" v-model="passwordAgain" @keydown.enter="submit" name="new-password" autocomplete="new-password" class="basicTextInput">
		<p v-for="problem of problems" :key="problem" class="problem">- {{ problem }}</p>
		<p class="problem">{{ responseError }}</p>
		<button-with-icon icon="/assets/svg/edit_black_24dp.svg" class="submitButton" :class="{ disabled: !canSubmit }" @click="submit">
			Set new password
		</button-with-icon>
		<p class="backToSignIn">
			<router-link to="/sign-in">Back to sign in</router-link>
		</p>
	</div>
	<p v-else class="alreadySignedIn">You're already signed in!</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SignInInfo } from '../../../shared/types';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	components: {
		ButtonWithIcon,
		Head
	},
	data() {
		return {
			password: '',
			passwordAgain: '',
			waitingForResponse: false,
			responseError: '',
			token: ''
		};
	},
	computed: {
		filledOut(): boolean {
			return !!(this.password && this.passwordAgain);
		},
		problems(): string[] {
			let problems: string[] = [];

			if (!this.filledOut) return problems;

			if (this.password.length < 8) problems.push("Your password needs to be 8 or more characters long.");
			if (this.password !== this.passwordAgain) problems.push("Passwords don't match.");

			return problems;
		},
		canSubmit(): boolean {
			return this.filledOut && this.problems.length === 0 && !this.waitingForResponse;
		}
	},
	mounted() {
		// Get token from URL query parameter
		this.token = this.$route.query.token as string;
		if (!this.token) {
			this.responseError = 'Invalid reset link. Please request a new password reset.';
		}
	},
	methods: {
		async submit() {
			if (!this.canSubmit || !this.token) return;

			this.responseError = '';
			this.waitingForResponse = true;

			try {
				const response = await fetch('/api/account/reset-password', {
					method: 'POST',
					body: JSON.stringify({
						token: this.token,
						password: this.password
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const json = await response.json() as {
					status: 'success' | 'error',
					reason?: string,
					token?: string,
					signInInfo?: SignInInfo
				};

				if (json.status === 'error') {
					this.responseError = json.reason;
					this.waitingForResponse = false;
				} else {
					// Password reset successful, user is now signed in
					this.$store.state.loggedInAccount = json.signInInfo.profile;
					this.$store.state.ownPacks = json.signInInfo.packs;
					this.$store.state.acknowledgedGuidelines = json.signInInfo.acknowledgedGuidelines;
					this.$store.state.nextInfoBannerMessage = "Password reset successfully!";
					this.$router.replace({ name: 'Profile', params: { id: json.signInInfo.profile.id } });
				}
			} catch (error) {
				this.responseError = 'Network error. Please try again.';
				this.waitingForResponse = false;
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

.description {
	text-align: center;
	margin: 0 auto 30px;
	width: 300px;
	font-size: 14px;
	opacity: 0.8;
}

input {
	width: 300px;
	margin: auto;
	margin-bottom: 10px;
}

.submitButton {
	width: 200px;
	margin: auto;
	border-radius: 5px;
	margin-top: 30px;
}

.problem {
	margin: 0;
	font-size: 13px;
	color: crimson;
	width: 300px;
	margin: auto;
}

.alreadySignedIn {
	margin: 5px;
	margin-bottom: 15px;
	width: 100%;
	text-align: center;
	font-size: 14px;
}

.backToSignIn {
	margin: 15px auto 0;
	width: 300px;
	text-align: center;
	font-size: 13px;
}

.backToSignIn a {
	color: inherit;
	opacity: 0.5;
	text-decoration: none;
}

.backToSignIn a:hover {
	opacity: 1;
	text-decoration: underline;
}
</style>