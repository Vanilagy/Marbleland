<template>
	<div class="search-bar">
		<img src="/assets/svg/search_black_24dp.svg">
		<input type="text" placeholder="Search for level" v-model="$store.state.searchState.query" @focus="focused = true" @blur="focused = false">
		<img src="/assets/svg/tune_black_24dp.svg" title="Filter" @click="$store.state.searchState.filterShown = !$store.state.searchState.filterShown" class="toggle-filter">
		<div class="search-bar-border" :class="{ active: focused }"></div>
	</div>
	<div v-if="$store.state.searchState.filterShown" class="filter">
		<div class="labeled-dropdown" v-for="(config, key) in $store.state.searchState.filter" :key="key">
			<p>{{ config.label }}</p>
			<dropdown-component v-model="config.value" :options="config.options"></dropdown-component>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { store } from '../ts/store';
import DropdownComponent from './DropdownComponent.vue';

export default Vue.defineComponent({
	data() {
		return {
			focused: false,
			filterShown: false,
			shit: 'a',
			options: [{
				name: 'a',
				label: 'A'
			}, {
				name: 'b',
				label: 'B'
			}, {
				name: 'c',
				label: 'C'
			}]
		};
	},
	computed: {
		styleObject(): object {
			return {
				'background': this.focused? 'red' : ''
			};
		}
	},
	components: {
		DropdownComponent
	}
});
</script>

<style>
.search-bar {
	width: 100%;
	height: 40px;
	background: rgb(240, 240, 240);
	border-radius: 5px;
	overflow: hidden;
	display: flex;
	flex-direction: row;
	position: relative;
}

.search-bar > img {
	height: 24px;
	padding: 8px;
	opacity: 0.75;
	display: block;
}

.search-bar > input {
	flex: 1 1 auto;
	background: transparent;
	border: none;
	font-size: 16px;
	font-family: inherit;
	color: inherit;
}

.search-bar > input:focus {
	outline: none;
}

.search-bar-border {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 5px;
	box-sizing: border-box;
	border: 2px solid transparent;
	pointer-events: none;
}

.search-bar-border.active {
	border: 2px solid rgb(220, 220, 220);
}

.toggle-filter {
	cursor: pointer;
	opacity: 0.25 !important;
}

.toggle-filter:hover {
	opacity: 0.75 !important;
}

.filter {
	margin: -5px;
	margin-top: 5px;
	width: 100%;
	display: flex;
}

.labeled-dropdown {
	width: 20%;
	margin: 5px;
}

.labeled-dropdown > p {
	margin: 0;
	font-size: 14px;
}
</style>