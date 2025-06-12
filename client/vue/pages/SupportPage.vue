<template>
	<Head>
		<title>Support - Marbleland</title>
		<meta name="og:title" content="Support">
	</Head>
	<h1>Support</h1>
	<p>
		Need help with something? Marbleland doesn't have any crazy support infrastructure, but you can join the Marble Blast Community on Discord here:
		<br>
		<br>
		<a href="https://discord.gg/q4JdnRbVhF">https://discord.gg/q4JdnRbVhF</a>
		<br>
		<br>
		Tag user <code>@vanilagy</code>, the admin of this site, for help.
	</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	components: {
		Head
	}
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 30px 0px;
}
</style>