<template>
	<div :class="{ disabled: waitingForResponse }" v-if="!$store.state.loggedInAccount">
		<h1>{{ (type === 'signUp')? 'Create an account' : 'Sign in to an account' }}</h1>
		<input type="email" :placeholder="emailPlaceholder" v-model.trim="email" @keydown.enter="submit" autofocus name="email" :autocomplete="(type === 'signIn')? 'username' : 'off'">
		<input type="text" placeholder="Username" v-model.trim="username" v-if="type === 'signUp'" @keydown.enter="submit" maxlength="24" name="username" autocomplete="off">
		<input type="password" placeholder="Password" v-model="password" @keydown.enter="submit" :name="(type === 'signIn')? 'current-password' : 'new-password'" :autocomplete="(type === 'signIn')? 'current-password' : 'off'">
		<input type="password" placeholder="Password (again)" v-model="passwordAgain" v-if="type === 'signUp'" @keydown.enter="submit">
		<p v-for="problem of problems" :key="problem" class="problem">- {{ problem }}</p>
		<p class="problem">{{ responseError }}</p>
		<button-with-icon icon="/assets/svg/login_black_24dp.svg" class="submitButton" :class="{ disabled: !canSubmit }" @click="submit">
			{{ (type === 'signUp')? 'Create account' : 'Sign in' }}
		</button-with-icon>
	</div>
	<p v-else class="alreadySignedIn">You're already signed in!</p>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ProfileInfo, SignInInfo } from '../../shared/types';
import ButtonWithIcon from './ButtonWithIcon.vue';

const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export default Vue.defineComponent({
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
		problems(): string[] {
			let problems: string[] = [];

			if (this.$store.state.loggedInAccount) problems.push("You're already signed in!");

			if (this.type !== 'signUp') return problems;
			if (!this.filledOut) return problems;

			if (!emailRegEx.test(this.email)) problems.push("The email you entered isn't valid.");
			if (this.username.length < 2) problems.push("Your username is too short.");
			if (this.password.length < 8) problems.push("Your password needs to be 8 characters long or more.")
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

			let url = (this.type === 'signUp')?
				`/api/account/register?email=${encodeURIComponent(this.email)}&username=${encodeURIComponent(this.username)}&password=${this.password}` :
				`/api/account/sign-in?email_or_username=${encodeURIComponent(this.email)}&password=${this.password}`;
			let response = await fetch(url);

			let json = await response.json() as {
				status: 'success' | 'error',
				reason?: string,
				token?: string,
				signInInfo?: SignInInfo
			};

			if (json.status === 'error') {
				this.responseError = json.reason;
				this.waitingForResponse = false;
			} else {
				localStorage.setItem('token', json.token);
				this.$store.state.loggedInAccount = json.signInInfo.profile;
				this.$store.state.ownPacks = json.signInInfo.packs;
				if (this.type === 'signUp') this.$store.state.nextInfoBannerMessage = "Account created successfully!";
				this.$router.push({ name: 'Profile', params: { id: json.signInInfo.profile.id } });
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
	display: block;
	width: 300px;
	height: 40px;
	margin: auto;
	background: rgb(240, 240, 240);
	font-size: 16px;
	font-family: inherit;
	color: inherit;
	border: 2px solid transparent;
	border-radius: 5px;
	padding-left: 10px;
	margin-bottom: 10px;
	box-sizing: border-box;
}

input:focus {
	outline: none;
	border: 2px solid rgb(220, 220, 220);
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
</style>