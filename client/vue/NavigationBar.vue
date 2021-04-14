<template>
	<header>
		<h1 @click="$router.push('/')">CLA</h1>
		<div v-for="target of targets" :key="target.path" class="targetContainer" :title="target.label" :class="{ selected: currentPath === target.path }" @click="navigate(target.path)">
			<img :src="target.icon" class="basicIcon">
			<div class="underline" :title="currentRoute"></div>
		</div>
		<profile-icon class="profileIcon"></profile-icon>
	</header>
</template>

<script lang="ts">
import Vue from 'vue'
import ProfileIcon from './ProfileIcon.vue';

export default Vue.defineComponent({
	data() {
		return {
			targets: [{
				path: '/search',
				icon: '/assets/svg/search_black_24dp.svg',
				label: 'Search'
			}, {
				path: '/packs',
				icon: '/assets/svg/folder_black_24dp.svg',
				label: 'Packs'
			}, {
				path: '/upload',
				icon: '/assets/svg/file_upload_black_24dp.svg',
				label: 'Upload'
			}, {
				path: 'https://github.com/Vanilagy/CLA',
				icon: '/assets/svg/code_black_24dp.svg',
				label: 'API'
			}]
		};
	},
	computed: {
		currentPath(): string {
			return this.$route.path;
		}
	},
	methods: {
		navigate(path: string) {
			if (path.startsWith('/')) this.$router.push(path);
			else location.href = path;
		}
	},
	components: {
		ProfileIcon
	}
});
</script>

<style scoped>
header {
	display: flex;
	align-items: center;
	margin: 20px 0px;
	position: relative;
}

h1 {
	margin: 0;
	margin-right: 50px;
	cursor: pointer;
}

.profileIcon {
	position: absolute;
	top: 8px;
	right: 0;
}

.targetContainer {
	display: flex;
	flex-direction: column;
	width: 40px;
	align-items: center;
	margin-top: 7px;
	cursor: pointer;
	margin-right: 10px;
}

.targetContainer > img {
	width: 32px;
}

.underline {
	margin-top: 5px;
	width: 100%;
	border-radius: 3px;
    height: 3px;
    background: transparent;
}

.targetContainer:hover .underline {
	background: var(--background-2);
}

.targetContainer.selected .underline {
	background: #73abff;
}
</style>