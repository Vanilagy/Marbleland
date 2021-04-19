<template>
	<Head>
		<title>Sign in - Marbleland</title>
		<meta name="og:title" content="Sign in - Marbleland">
	</Head>
	<sign-in-or-up-component type="signIn"></sign-in-or-up-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SignInOrUpComponent from '../components/SignInOrUpComponent.vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	components: {
		SignInOrUpComponent,
		Head
	}
});
</script>