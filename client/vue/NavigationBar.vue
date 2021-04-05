<template>
	<header>
		<h1>CLA</h1>
		<div>Search</div>
		<div>Upload</div>
		<div>Packs</div>
		<div>About</div>
	</header>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.defineComponent({

});
</script>

<style scoped>
header {
	display: flex;
	align-items: center;
	margin: 20px 0px;
}

h1 {
	margin: 0;
}

header > * {
	margin-right: 20px;
}
</style>