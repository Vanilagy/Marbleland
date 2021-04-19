<template>
	<h1>Welcome to Marbleland</h1>
	<h2>A custom level sharing platform for Marble Blast</h2>
	<div class="actions">
		<home-action v-for="action of actions" :key="action.name" :icon="action.icon" :name="action.name" :description="action.description" :path="action.path"></home-action>		
	</div>
	<h3>Latest levels</h3>
	<panel-list :defaultCount="8" :entries="homeInfo && homeInfo.latestLevels" noEntriesNotice="There are no latest levels." mode="level"></panel-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { HomeInfo } from '../../../shared/types';
import HomeAction from '../components/HomeAction.vue';
import PanelList from '../components/PanelList.vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	data() {
		return {
			actions: [{
				icon: '/assets/svg/search_black_24dp.svg',
				name: 'Search',
				description: 'Find custom levels and download them.',
				path: '/search'
			}, {
				icon: '/assets/svg/folder_black_24dp.svg',
				name: 'Packs',
				description: 'Get multiple levels at once with packs.',
				path: '/packs'
			}, {
				icon: '/assets/svg/file_upload_black_24dp.svg',
				name: 'Upload',
				description: 'Upload and share your own levels.',
				path: '/upload'
			}, {
				icon: '/assets/svg/code_black_24dp.svg',
				name: 'API',
				description: 'Access every functionality using code.',
				path: 'https://github.com/Vanilagy/Marbleland/blob/main/docs/api.md'
			}],
			homeInfo: null as HomeInfo
		};
	},
	components: {
		HomeAction,
		PanelList,
		Head
	},
	async mounted() {
		let response = await fetch('/api/home/info');
		let json = await response.json() as HomeInfo;

		this.homeInfo = json;
	}
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 30px 0px;
	margin-bottom: 0px;
}

h2 {
	text-align: center;
	margin: 0;
	font-weight: normal;
	font-size: 18px;
	margin-bottom: 40px;
}

.actions {
	display: flex;
	margin: -5px;
	justify-content: center;
	margin-bottom: 20px;
	flex-wrap: wrap;
}

.actions > div {
	margin: 5px;
}

h3 {
	margin: 0;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 25px;
}
</style>