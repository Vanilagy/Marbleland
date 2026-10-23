<template>
	<Head>
		<title>Forgot Password - Marbleland</title>
	</Head>
	<div :class="{ disabled: waitingForResponse }" v-if="!$store.state.loggedInAccount">
		<h1>Reset your password</h1>
		<p class="description">Enter your email address and we'll send you a link to reset your password.</p>
		<input type="email" placeholder="Email" v-model.trim="email" @keydown.enter="submit" autofocus name="email" autocomplete="username" class="basicTextInput">
		<p class="problem">{{ responseError }}</p>
		<p v-if="successMessage" class="success">{{ successMessage }}</p>
		<button-with-icon icon="/assets/svg/send_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" class="submitButton" :class="{ disabled: !canSubmit }" @click="submit">
			Send reset link
		</button-with-icon>
		<p class="backToSignIn">
			<router-link to="/sign-in">Back to sign in</router-link>
		</p>
	</div>
	<p v-else class="alreadySignedIn">You're already signed in!</p>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import { Head } from '@unhead/vue/components';

const emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const email = ref('');
const waitingForResponse = ref(false);
const responseError = ref('');
const successMessage = ref('');

const canSubmit = computed(() => {
	return !!email.value && emailRegEx.test(email.value) && !waitingForResponse.value;
});

const submit = async () => {
	if (!canSubmit.value) return;

	responseError.value = '';
	successMessage.value = '';
	waitingForResponse.value = true;

	try {
		const response = await fetch('/api/account/forgot-password', {
			method: 'POST',
			body: JSON.stringify({ email: email.value }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const json = await response.json() as {
			status: 'success' | 'error',
			reason?: string,
			message?: string
		};

		if (json.status === 'error') {
			responseError.value = json.reason;
		} else {
			successMessage.value = json.message;
			email.value = ''; // Clear the form
		}
	} catch (error) {
		responseError.value = 'Network error. Please try again.';
	}

	waitingForResponse.value = false;
};
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

.success {
	margin: 0;
	font-size: 13px;
	color: lime;
	width: 300px;
	margin: auto;
	text-align: center;
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