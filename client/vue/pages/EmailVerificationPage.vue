<template>
	<Head>
		<title>Verify your email - Marbleland</title>
		<meta name="og:title" content="Verify Your Email">
	</Head>
	<div class="email-verification-page">
		<h1>Verify your email</h1>
		<div class="verification-message">
			<p v-if="isFromSignIn">
				Your account still requires email verification before you can sign in. We've sent a verification email to <strong>{{ email }}</strong>.
			</p>
			<p v-else>
				Thank you for creating your Marbleland account! We've sent a verification email to <strong>{{ email }}</strong>.
			</p>
			<p>Please check your email and click the verification link to {{ isFromSignIn ? 'complete verification' : 'complete your registration' }}.</p>
		</div>
		<div class="help-section">
			<p>Didn't receive the email?</p>
			<p v-if="isFromSignIn">
				Try <router-link to="/sign-in">signing in again</router-link> to receive another verification email.
			</p>
			<p v-else>
				Simply <router-link to="/sign-up">register again</router-link> with the same email address to receive a new verification email.
			</p>
			<p>Need help? <router-link to="/support">Reach out to support.</router-link></p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	components: {
		Head
	},
	data() {
		return {
			email: this.$route.query.email as string || '',
			source: this.$route.query.source as string || ''
		};
	},
	computed: {
		isFromSignIn(): boolean {
			return this.source === 'signIn';
		}
	}
});
</script>

<style scoped>
.email-verification-page {
	max-width: 500px;
	margin: 0 auto;
	text-align: center;
}

h1 {
	text-align: center;
	margin: 30px 0px;
}

.verification-message {
	background: var(--background-1);
	border: 1px solid var(--background-2);
	border-radius: 8px;
	padding: 24px;
	margin: 24px 0;
}

.help-section {
	margin-top: 32px;
	padding-top: 32px;
	border-top: 1px solid var(--background-2);
}
</style>