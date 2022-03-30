<template>
	<div class="wrapper" :style="{ 'box-shadow': showShadow? '' : 'none' }">
		<header>
			<img src="/assets/img/favicon.png" class="homeIcon" title="Home" @click="$router.push('/')">
			<div v-for="target of targets" :key="target.path" class="targetContainer" :title="target.label" :class="{ selected: currentPath === target.path }" @click="navigate(target.path)">
				<a :href="target.path" @click.prevent=""><img :src="target.icon" class="basicIcon"></a>
				<div class="underline"></div>
			</div>
			<profile-icon class="profileIcon"></profile-icon>
		</header>
	</div>
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
			}],
			showShadow: false,
			interval: null
		};
	},
	computed: {
		currentPath(): string {
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
	},
	mounted() {
		this.interval = setInterval(() => {
			this.showShadow = document.documentElement.scrollTop !== 0;
		}, 1000 / 30);
	},
	unmounted() {
		clearInterval(this.interval);
	}
});
</script>

<style scoped>
.wrapper {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	background: var(--background-color);
	z-index: 10000;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
	transition: box-shadow 0.15s;
}

header {
	display: flex;
	align-items: center;
	margin: auto;
	padding: 20px 0px;
	position: relative;
	max-width: 1000px;
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
	top: 7px;
	margin-top: 20px;
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
	margin-bottom: -6px;
}

.targetContainer img {
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