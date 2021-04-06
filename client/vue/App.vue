<template>
	<div id="center">
		<navigation-bar></navigation-bar>
		<hr>
		<router-view></router-view>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import NavigationBar from './NavigationBar.vue';
export default Vue.defineComponent({
	components: { NavigationBar },
});
</script>

<style scoped>
hr {
	border: none;
	height: 1px;
	width: 100%;
	background: rgb(220, 220, 220);
	margin: 0;
	margin-bottom: 10px;
}
</style>

<style>
body, html {
	margin: 0;
	font-family: 'Titillium Web', sans-serif;
	color: rgb(64, 64, 64);
	margin-bottom: 10px;
}

* {
	-webkit-user-drag: none;
	-moz-user-drag: none;
	-moz-user-select: -moz-none;
	-khtml-user-select: none;
	-webkit-user-select: none;
	-o-user-select: none;
	user-select: none;
}

#center {
	margin: auto;
	max-width: 1000px;
}
</style>