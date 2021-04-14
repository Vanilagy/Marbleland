<template>
	<div class="search-bar notSelectable">
		<img src="/assets/svg/search_black_24dp.svg" class="basicIcon">
		<input type="text" :placeholder="placeholder" v-model="config.query" @focus="focused = true" @blur="focused = false">
		<img src="/assets/svg/tune_black_24dp.svg" @click="config.filterShown = !config.filterShown" class="toggle-filter basicIcon" :title="config.filterShown? 'Hide filter' : 'Show filter'">
		<div class="search-bar-border" :class="{ active: focused }"></div>
	</div>
	<div v-if="config.filterShown" class="filter">
		<div class="labeled-dropdown" v-for="(config, key) in config.filter" :key="key">
			<p>{{ config.label }}</p>
			<dropdown-component v-model="config.value" :options="config.options"></dropdown-component>
		</div>
		<div class="reverseButton" title="Reverse order" :class="{ pressed: config.reversed }" @click="config.reversed = !config.reversed">
			<img src="/assets/svg/import_export_black_24dp.svg" class="basicIcon">
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { store } from '../ts/store';
import DropdownComponent from './DropdownComponent.vue';

export interface SearchBarConfig {
	query: string,
	filterShown: boolean,
	filter: Record<string, {
		label: string,
		value: string,
		options: {
			name: string,
			label: string
		}[]
	}>,
	reversed: boolean
}

export default Vue.defineComponent({
	props: {
		config: Object as PropType<SearchBarConfig>,
		placeholder: String as PropType<string>
	},
	data() {
		return {
			focused: false
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
	background: var(--background-1);
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
	border: 2px solid var(--background-2);
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
	display: flex;
	flex-wrap: wrap;
}

.labeled-dropdown {
	width: 20%;
	margin: 5px;
	flex: 1 1 0;
	min-width: 180px;
}

.labeled-dropdown > p {
	margin: 0;
	font-size: 14px;
}

.reverseButton {
	padding: 3px;
	background: var(--background-1);
	border-radius: 5px;
	margin: 5px;
	margin-top: 26px;
	cursor: pointer;
}

.reverseButton img {
	vertical-align: top;
	opacity: 0.25 !important;
}

.reverseButton.pressed img {
	opacity: 0.75 !important;
}

.reverseButton:hover {
	background: var(--background-2);
}
</style>