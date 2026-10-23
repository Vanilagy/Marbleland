<template>
	<Head>
		<title>Sign in - Marbleland</title>
		<meta name="og:title" content="Sign in">
	</Head>
	<sign-in-or-up-component type="signIn"></sign-in-or-up-component>
</template>

<script lang="ts" setup>
import SignInOrUpComponent from '../components/SignInOrUpComponent.vue';
import { Head } from '@unhead/vue/components';
</script>