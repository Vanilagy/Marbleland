<template>
	<header>
		<h1>CLA</h1>
		<div><router-link to="/">Search</router-link></div>
		<div><router-link to="/upload">Upload</router-link></div>
		<div>Packs</div>
		<div>About</div>
		<profile-icon class="profileIcon"></profile-icon>
	</header>
</template>

<script lang="ts">
import Vue from 'vue'
import ProfileIcon from './ProfileIcon.vue';

export default Vue.defineComponent({
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
}

header > * {
	margin-right: 20px;
}

.profileIcon {
	position: absolute;
	top: 8px;
	right: 0;
}
</style>