<template>
	<Head>
		<title>Marbleland</title>
		<meta name="description" content="Marbleland is a custom level sharing platform for Marble Blast on which you can find, download, upload and share levels and level packs.">
		<meta name="og:title" content="Marbleland">
		<meta name="og:site_name" content="Marbleland">
		<meta name="og:type" content="website">
		<meta name="og:url" :content="origin + $route.path">
		<meta name="og:description" content="Marbleland is a custom level sharing platform for Marble Blast on which you can find, download, upload and share levels and level packs.">
		<meta name="og:image" :content="origin + '/assets/img/favicon.png'">
	</Head>
	<navigation-bar></navigation-bar>
	<div id="center">
		<router-view v-slot="{ Component }">
			<!-- Keep these two alive to keep search state. Needs a bit of hackery due to an SSR bug. -->
			<keep-alive v-if="isBrowser" include="search,packs">
				<component :is="Component"></component>
			</keep-alive>
			<component v-else :is="Component"></component>
		</router-view>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavigationBar from './components/NavigationBar.vue';
import { Head } from '@vueuse/head';
import { ORIGIN } from '../../shared/constants';

export default defineComponent({
	components: {
		NavigationBar,
		Head
	},
	computed: {
		origin(): string {
			return ORIGIN;
		},
		isBrowser(): boolean {
			return typeof window !== 'undefined';
		}
	}
});
</script>

<style>
:root {
	--background-color: white;
	--text-color: rgb(64, 64, 64);
	--background-1: rgb(240, 240, 240);
	--background-2: rgb(220, 220, 220);
	--level-panel-bottom-background: rgba(240, 240, 240, 0.9);
	--panel-skeleton-animation-background: rgb(250, 250, 250);
}

:root.dark {
	color-scheme: dark;
	--background-color: rgb(35, 35, 35);
	--text-color: rgb(255, 255, 255);
	--background-1: rgb(49, 49, 49);
	--background-2: rgb(65, 65, 65);
	--level-panel-bottom-background: rgba(49, 49, 49, 0.9);
	--panel-skeleton-animation-background: rgb(40, 40, 40);
}

hr {
	border: none;
	height: 1px;
	width: 100%;
	background: var(--background-2);
	margin: 0;
	margin-bottom: 10px;
}

.basicIcon {
	opacity: 0.75;
}

:root.dark .basicIcon {
	opacity: 1;
	filter: invert(1);
}

html {
	background: var(--background-color);
}

body, html {
	margin: 0;
	font-family: 'Nunito Sans', sans-serif;
	color: var(--text-color);
}

body {
	margin: 0px 15px;
	margin-bottom: 20px;
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
	padding-top: 97px;
}

.disabled {
	pointer-events: none !important;
	opacity: 0.333 !important;
}

.basicTextInput {
	display: block;
	height: 40px;
	background: var(--background-1);
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
	border: 2px solid var(--background-2);
}

.basicTextarea {
	display: block;
	height: 100px;
	background: var(--background-1);
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
	border: 2px solid var(--background-2);
}

a {
	color: #00a1ff;
	text-decoration: none;
}

a:hover {
	text-decoration: underline;
}

a:visited {
	color: #00a1ff;
}

.basicCheckbox {
	width: 28px;
	height: 28px;
	appearance: none;
	background: var(--background-1);
	border-radius: 5px;
	border: 2px solid transparent;
	margin: 0;
	cursor: pointer;
	vertical-align: top;
}

.basicCheckbox + label {
	cursor: pointer;
}

.basicCheckbox:hover {
	border: 2px solid var(--background-2);
}

.basicCheckbox:active {
	background: var(--background-2);
}

.basicCheckbox:focus {
	outline: none;
}

.basicCheckbox:checked::after {
	content: "";
	/* webpackIgnore: true */
	background-image: url("/assets/svg/check_black_24dp.svg");
	background-size: 24px 24px;
	width: 24px;
	height: 24px;
	display: block;
	opacity: 0.75;
}

:root.dark .basicCheckbox:checked::after {
	opacity: 1;
	filter: invert(1);
}
</style>