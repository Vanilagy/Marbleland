<template>
	<div :class="{ disabled: waitingForResponse }" v-if="!$store.state.loggedInAccount">
		<h1>{{ (type === 'signUp')? 'Create an account' : 'Sign in to an account' }}</h1>
		<input type="email" :placeholder="emailPlaceholder" v-model.trim="email" @keydown.enter="submit" autofocus name="email" :autocomplete="(type === 'signIn')? 'username' : 'off'" class="basicTextInput">
		<input type="text" placeholder="Username" v-model.trim="username" v-if="type === 'signUp'" @keydown.enter="submit" maxlength="24" name="username" autocomplete="off" class="basicTextInput">
		<input type="password" placeholder="Password" v-model="password" @keydown.enter="submit" :name="(type === 'signIn')? 'current-password' : 'new-password'" :autocomplete="(type === 'signIn')? 'current-password' : 'new-password'" class="basicTextInput">
		<input type="password" placeholder="Password (again)" v-model="passwordAgain" v-if="type === 'signUp'" @keydown.enter="submit" class="basicTextInput">
		<p v-for="problem of problems" :key="problem" class="problem">- {{ problem }}</p>
		<p class="problem">{{ responseError }}</p>
		<button-with-icon icon="/assets/svg/login_black_24dp.svg" class="submitButton" :class="{ disabled: !canSubmit }" @click="submit">
			{{ (type === 'signUp')? 'Create account' : 'Sign in' }}
		</button-with-icon>
		<p v-if="type === 'signUp'" class="verificationNotice">You will need to verify your email address.</p>
	</div>
	<p v-else class="alreadySignedIn">You're already signed in!</p>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { SignInInfo } from '../../../shared/types';
import ButtonWithIcon from './ButtonWithIcon.vue';

const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export default defineComponent({
	props: {
		type: String as PropType<'signUp' | 'signIn'>
	},
	components: {
		ButtonWithIcon
	},
	data() {
		return {
			email: '',
			username: '',
			password: '',
			passwordAgain: '',
			waitingForResponse: false,
			responseError: ''
		};
	},
	computed: {
		filledOut(): boolean {
			if (this.type === 'signUp') return !!(this.email && this.username && this.password && this.passwordAgain);
			else return !!(this.email && this.password);
		},
		/** Returns a list of problems with the current input. */
		problems(): string[] {
			let problems: string[] = [];

			if (this.$store.state.loggedInAccount) problems.push("You're already signed in!");

			if (this.type !== 'signUp') return problems;
			if (!this.filledOut) return problems;

			if (!emailRegEx.test(this.email)) problems.push("The email you entered isn't valid.");
			if (this.username.length < 2) problems.push("Your username is too short.");
			if (this.password.length < 8) problems.push("Your password needs to be 8 or more characters long.")
			if (this.password !== this.passwordAgain) problems.push("Passwords don't match.");

			return problems;
		},
		canSubmit(): boolean {
			return this.filledOut && this.problems.length === 0;
		},
		emailPlaceholder(): string {
			return (this.type === 'signUp')? 'Email' : 'Email or username';
		}
	},
	methods: {
		async submit() {
			if (!this.canSubmit) return;

			this.responseError = '';
			this.waitingForResponse = true;

			// Sign in and sign up are quite similar, so we use roughly the same code for both:

			let url = (this.type === 'signUp')?
				'/api/account/sign-up' :
				'/api/account/sign-in';
			let body = (this.type === 'signUp')?
				({
					email: this.email,
					username: this.username,
					password: this.password
				}) :
				({
					emailOrUsername: this.email,
					password: this.password
				});
			// Send the request and wait for the response
			let response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			let json = await response.json() as {
				status: 'success' | 'error',
				reason?: string,
				token?: string,
				signInInfo?: SignInInfo,
				requiresVerificationForEmail?: string,
				message?: string
			};

			// Check if email verification is required
			if (json.requiresVerificationForEmail) {
				this.$router.push({ 
					name: 'EmailVerification', 
					query: { 
						email: json.requiresVerificationForEmail,
						source: this.type
					} 
				});

				return;
			}

			if (json.status === 'error') {
				// There was an error, show the issue
				this.responseError = json.reason;
				this.waitingForResponse = false;
			} else {
				// User successfully signed in! Set values and route accordingly.
				this.$store.state.loggedInAccount = json.signInInfo.profile;
				this.$store.state.ownPacks = json.signInInfo.packs;
				this.$store.state.acknowledgedGuidelines = json.signInInfo.acknowledgedGuidelines;
				if (this.type === 'signUp') this.$store.state.nextInfoBannerMessage = "Account created successfully!";
				this.$router.replace({ name: 'Profile', params: { id: json.signInInfo.profile.id } });
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

.verificationNotice {
	margin: 15px auto 0;
	width: 300px;
	text-align: center;
	font-size: 13px;
	opacity: 0.5;
}
</style>