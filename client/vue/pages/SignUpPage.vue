<template>
	<Head>
		<title>Sign up - Marbleland</title>
		<meta name="og:title" content="Sign up">
	</Head>
	<sign-in-or-up-component type="signUp"></sign-in-or-up-component>
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