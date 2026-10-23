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

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import { Head } from '@unhead/vue/components';
import { useStore } from '../../ts/store';

const props = defineProps<{
	type?: 'signUp' | 'signIn'
}>();

const store = useStore();
const router = useRouter();

const currentPassword = ref('');
const newPassword = ref('');
const newPasswordAgain = ref('');
const waitingForResponse = ref(false);

const filledOut = computed(() => {
	return !!(currentPassword.value && newPassword.value && newPasswordAgain.value);
});
/** Returns a list of problems with the current input. */
const problems = computed(() => {
	let problems: string[] = [];

	if (!filledOut.value) return problems;

	if (newPassword.value.length < 8) problems.push("Your password needs to be 8 or more characters long.")
	if (newPassword.value !== newPasswordAgain.value) problems.push("Passwords don't match.");

	return problems;
});
const canSubmit = computed(() => {
	return filledOut.value && problems.value.length === 0;
});

const submit = async () => {
	if (!canSubmit.value) return;

	waitingForResponse.value = true;

	// Send the request and wait for the response
	let response = await fetch('/api/account/change-password', {
		method: 'POST',
		body: JSON.stringify({
			currentPassword: currentPassword.value,
			newPassword: newPassword.value
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		alert("Something went wrong.");
		waitingForResponse.value = false;
	} else {
		if (props.type === 'signUp') store.state.nextInfoBannerMessage = "Password changed successfully!";
		router.replace({ name: 'Profile', params: { id: store.state.loggedInAccount.id } });
	}
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