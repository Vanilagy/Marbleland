<template>
	<div class="search-bar" :class="{ active: focused }">
		<img src="/assets/svg/search_black_24dp.svg">
		<input type="text" placeholder="Search for level" v-model="searchQuery" @focus="focused = true" @blur="focused = false">
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.defineComponent({
	data() {
		return {
			searchQuery: '',
			focused: false
		};
	},
	watch: {
		searchQuery() {
			this.$emit('queryChange', this.searchQuery);
		}
	},
	computed: {
		styleObject(): object {
			return {
				'background': this.focused? 'red' : ''
			};
		}
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
	box-sizing: border-box;
	border: 2px solid transparent;
}

.search-bar.active {
	border: 2px solid rgb(220, 220, 220);
}

.search-bar > img {
	height: 24px;
	padding: 8px;
	opacity: 0.75;
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
</style>