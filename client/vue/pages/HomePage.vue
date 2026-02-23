<template>
	<h1>Welcome to Marbleland</h1>
	<h2>The custom level sharing platform for Marble Blast</h2>
	<div class="actions">
		<home-action v-for="action of actions" :key="action.name" :icon="action.icon" :name="action.name" :description="action.description" :path="action.path"></home-action>		
	</div>

	<div class="view-header">
		<h3>Latest levels</h3>

		<div class="view-controls">
			<span class="view-label">View:</span>
			<dropdown-component class="view-selector" :options="viewOptions" v-model="currentView" @update:modelValue="saveViewPref"/>
		</div>
	</div>
	<panel-list :defaultCount="12" :entries="currentLevelList" noEntriesNotice="There are no latest levels." mode="level"></panel-list>

	<h1>Level installation guide</h1>
	<p>
		Every Marble Blast game has a "data" folder that contains all the levels, images, sounds and so on - this is also where you'll have to install custom levels. Levels downloaded from Marbleland come in a folder structure compatible with that of Marble Blast's "data" folder. Extract the downloaded .zip and drag all of its contents into your game's data folder (merging the two folders). If it asks you to replace any files, replace them.<br><br>
		The location of this data folder depends on how you installed the game, but it's usually found in these places:<br><br>
	</p>
	<b>On Windows:</b>
	<ul>
		<li><b>MBG:</b> %LocalAppData%\VirtualStore\Program Files (x86)\Marble Blast Gold\marble\data</li>
		<li><b>PQ:</b> %AppData%\PlatinumQuest\platinum\data</li>
	</ul>
	<b>On Mac:</b>
	<ul>
		<li><b>MBG:</b> /Applications/MarbleBlast Gold/MarbleBlastGold.app/marble/data (show package contents)</li>
		<li><b>PQ:</b> /Applications/PlatinumQuest.app/platinum/data (show package contents)</li>
	</ul>
	<div class="footer-container">
		<div class="version" @click="showVersionHistory">
			Marbleland v1.11.0
		</div>
		<router-link to="/support" class="support-button">Support</router-link>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { HomeInfo, LevelInfo } from '../../../shared/types';
import DropdownComponent from '../components/DropdownComponent.vue';
import HomeAction from '../components/HomeAction.vue';
import PanelList from '../components/PanelList.vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	data() {
		return {
			currentView: 'relevant',
            viewOptions: [
				{ name: 'relevant', label: 'Relevant' },
				{ name: 'all', label: 'All' },
            ],
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
		Head,
		DropdownComponent
	},
	computed: {
        currentLevelList(): LevelInfo[] {
            if (!this.homeInfo) return [];
			return this.currentView === 'relevant' ? this.homeInfo.filteredLevels : this.homeInfo.allLevels;
        },
    },
	async mounted() {
		this.currentView = localStorage.getItem('homeViewPref') || 'relevant';

		let response = await fetch('/api/home/info');
		let json = await response.json() as HomeInfo;

		this.homeInfo = json;
	},
	methods: {
		saveViewPref(newVal: string) {
            localStorage.setItem('homeViewPref', newVal);
        },
		showVersionHistory() {
			location.href = 'https://github.com/Vanilagy/Marbleland/blob/main/version_history.md';
		}
	}
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 20px 0px;
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

.footer-container {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 30px;
	margin-top: 30px;
}

.version {
	font-size: 12px;
	opacity: 0.333;
	cursor: pointer;
}

.version:hover {
	opacity: 1.0;
	text-decoration: underline;
}

.support-button {
	font-size: 12px;
	opacity: 0.333;
	text-decoration: none;
	color: inherit;
}

.support-button:hover {
	opacity: 1.0;
	text-decoration: underline;
}

li {
	overflow-wrap: break-word;
}

.view-header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-top: 25px;
}

.view-controls {
	display: flex;
	align-items: center;
	gap: 8px;
}

.view-label {
	font-size: 13px;
	text-transform: uppercase;
	font-weight: bold;
	opacity: 0.7;
}

.view-selector {
	display: inline-flex;
	min-width: 100px;
	margin-bottom: 2px;
}
</style>