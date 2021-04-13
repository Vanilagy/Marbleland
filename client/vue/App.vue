<template>
	<div id="center">
		<navigation-bar></navigation-bar>
		<hr>
		<router-view v-slot="{ Component }">
			<keep-alive include="search,packs">
				<component :is="Component"></component>
			</keep-alive>
		</router-view>
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
}

img {
	-moz-user-select: -moz-none;
	-khtml-user-select: none;
	-webkit-user-select: none;
	-o-user-select: none;
	user-select: none;
}

.notSelectable {
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

.disabled {
	pointer-events: none !important;
	opacity: 0.333 !important;
}

.basicTextInput {
	display: block;
	height: 40px;
	background: rgb(240, 240, 240);
	font-size: 16px;
	font-family: inherit;
	color: inherit;
	border: 2px solid transparent;
	border-radius: 5px;
	padding-left: 10px;
	box-sizing: border-box;
}

.basicTextInput:focus {
	outline: none;
	border: 2px solid rgb(220, 220, 220);
}

.basicTextarea {
	display: block;
	height: 100px;
	background: rgb(240, 240, 240);
	font-size: 16px;
	font-family: inherit;
	color: inherit;
	border: 2px solid transparent;
	border-radius: 5px;
	padding: 5px;
	padding-left: 10px;
    box-sizing: border-box;
    resize: none;
}

.basicTextarea:focus {
	outline: none;
	border: 2px solid rgb(220, 220, 220);
}
</style>