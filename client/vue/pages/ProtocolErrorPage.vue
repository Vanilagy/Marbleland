<template>
	<Head>
		<title>Protocol Error - Marbleland</title>
		<meta name="og:title" content="Protocol Error">
	</Head>
    <div v-if="$route.params.id !== 'pq'">
        <h1>Unsupported Protocol</h1>
        <p>
            Your computer/device does not support the necessary protocol required for launching the game to play the specified level.
        </p>
    </div>
    <div v-if="$route.params.id === 'pq'">
        <h1>Unable to launch PlatinumQuest</h1>
        <p>
            Your computer or device does not support the required protocol required for launching PlatinumQuest to play the specified level. Support for launching PlatinumQuest is only available on Windows. 
        </p>
        <p>
            If you are using Windows, kindly download the PlatinumQuest launcher from <a href="https://marbleblast.com/index.php/downloads/pq">here</a>. During installation, grant the required permissions for registry modifications to enable the necessary protocol. Alternatively, navigate to the launcher settings tab and select the option to re-register the protocol for a smooth experience.
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Head } from '@vueuse/head';

export default defineComponent({
    components: {
        Head
    },
});
</script>

<style scoped>
h1 {
    text-align: center;
    margin: 30px 0px;
}
</style>