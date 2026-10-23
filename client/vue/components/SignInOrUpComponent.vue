<template>
	<div :class="{ disabled: waitingForResponse }" v-if="!$store.state.loggedInAccount">
		<h1>{{ (type === 'signUp')? 'Create an account' : 'Sign in to an account' }}</h1>
		<input type="email" :placeholder="emailPlaceholder" v-model.trim="email" @keydown.enter="submit" autofocus name="email" :autocomplete="(type === 'signIn')? 'username' : 'off'" class="basicTextInput">
		<input type="text" placeholder="Username" v-model.trim="username" v-if="type === 'signUp'" @keydown.enter="submit" :maxlength="USERNAME_MAX_LENGTH" name="username" autocomplete="off" class="basicTextInput">
		<input type="password" placeholder="Password" v-model="password" @keydown.enter="submit" :name="(type === 'signIn')? 'current-password' : 'new-password'" :autocomplete="(type === 'signIn')? 'current-password' : 'new-password'" class="basicTextInput">
		<input type="password" placeholder="Password (again)" v-model="passwordAgain" v-if="type === 'signUp'" @keydown.enter="submit" class="basicTextInput">
		<p v-for="problem of problems" :key="problem" class="problem">- {{ problem }}</p>
		<p class="problem">{{ responseError }}</p>
		<button-with-icon icon="/assets/svg/login_black_24dp.svg" class="submitButton" :class="{ disabled: !canSubmit }" @click="submit">
			{{ (type === 'signUp')? 'Create account' : 'Sign in' }}
		</button-with-icon>
		<p v-if="type === 'signUp'" class="verificationNotice">You will need to verify your email address.</p>
		<p v-if="type === 'signIn'" class="forgotPassword">
			<a href="#" @click.prevent="goToForgotPassword">Forgot password?</a>
		</p>
	</div>
	<p v-else class="alreadySignedIn">You're already signed in!</p>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SignInInfo } from '../../../shared/types';
import ButtonWithIcon from './ButtonWithIcon.vue';
import { useStore } from '../../ts/store';
import { USERNAME_MAX_LENGTH } from '../../../shared/constants';

const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const props = defineProps<{
	type?: 'signUp' | 'signIn'
}>();

const store = useStore();
const router = useRouter();

const email = ref('');
const username = ref('');
const password = ref('');
const passwordAgain = ref('');
const waitingForResponse = ref(false);
const responseError = ref('');

const filledOut = computed(() => {
	if (props.type === 'signUp') return !!(email.value && username.value && password.value && passwordAgain.value);
	else return !!(email.value && password.value);
});
/** Returns a list of problems with the current input. */
const problems = computed(() => {
	let problems: string[] = [];

	if (store.state.loggedInAccount) problems.push("You're already signed in!");

	if (props.type !== 'signUp') return problems;
	if (!filledOut.value) return problems;

	if (!emailRegEx.test(email.value)) problems.push("The email you entered isn't valid.");
	if (username.value.length < 2) problems.push("Your username is too short.");
	if (password.value.length < 8) problems.push("Your password needs to be 8 or more characters long.")
	if (password.value !== passwordAgain.value) problems.push("Passwords don't match.");

	return problems;
});
const canSubmit = computed(() => {
	return filledOut.value && problems.value.length === 0;
});
const emailPlaceholder = computed(() => {
	return (props.type === 'signUp')? 'Email' : 'Email or username';
});

const submit = async () => {
	if (!canSubmit.value) return;

	responseError.value = '';
	waitingForResponse.value = true;

	// Sign in and sign up are quite similar, so we use roughly the same code for both:

	let url = (props.type === 'signUp')?
		'/api/account/sign-up' :
		'/api/account/sign-in';
	let body = (props.type === 'signUp')?
		({
			email: email.value,
			username: username.value,
			password: password.value
		}) :
		({
			emailOrUsername: email.value,
			password: password.value
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
		router.push({
			name: 'EmailVerification',
			query: {
				email: json.requiresVerificationForEmail,
				source: props.type
			}
		});

		return;
	}

	if (json.status === 'error') {
		// There was an error, show the issue
		responseError.value = json.reason;
		waitingForResponse.value = false;
	} else {
		// User successfully signed in! Set values and route accordingly.
		store.state.loggedInAccount = json.signInInfo.profile;
		store.state.ownPacks = json.signInInfo.packs;
		store.state.acknowledgedGuidelines = json.signInInfo.acknowledgedGuidelines;
		store.state.curatorVotes = json.signInInfo.curatorVotes ?? null;
		if (props.type === 'signUp') store.state.nextInfoBannerMessage = "Account created successfully!";
		router.replace({ name: 'Profile', params: { id: json.signInInfo.profile.id } });
	}
};
const goToForgotPassword = () => {
	router.push({ name: 'ForgotPassword' });
};
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

.forgotPassword {
	margin: 15px auto 0;
	width: 300px;
	text-align: center;
	font-size: 13px;
}

.forgotPassword a {
	color: inherit;
	opacity: 0.5;
	text-decoration: none;
}

.forgotPassword a:hover {
	opacity: 1;
	text-decoration: underline;
}
</style>