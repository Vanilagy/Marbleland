<template>
	<header>
		<img src="/assets/img/favicon.png" class="homeIcon" title="Home" @click="$router.push('/')">
		<div v-for="target of targets" :key="target.path" class="targetContainer" :title="target.label" :class="{ selected: currentPath === target.path }" @click="navigate(target.path)">
			<img :src="target.icon" class="basicIcon">
			<div class="underline"></div>
		</div>
		<profile-icon class="profileIcon"></profile-icon>
	</header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProfileIcon from './ProfileIcon.vue';

export default defineComponent({
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
				path: 'https://github.com/Vanilagy/Marbleland/blob/main/docs/api.md',
				icon: '/assets/svg/code_black_24dp.svg',
				label: 'API'
			}]
		};
	},
	computed: {
		currentPath(): string {
			return '/';
			return this.$route.path;
		}
	},
	methods: {
		navigate(path: string) {
			// Go to a relative path or an absolute one, depending on the URL
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

.homeIcon {
	width: 47px;
	margin-right: 20px;
	cursor: pointer;
	transform-origin: 50% 50%;
	transition: transform 0.15s;
}

.homeIcon:hover {
	transform: scale(1.2);
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