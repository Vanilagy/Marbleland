<template>
	<Head>
		<title>Not found - Marbleland</title>
		<meta name="og:title" content="Not found - Marbleland">
	</Head>
	<h1>404</h1>
	<p>Page not found. Marble sad. :(</p>	
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
	margin-bottom: 10px;
}

p {
	text-align: center;
	margin: 0;
}
</style>