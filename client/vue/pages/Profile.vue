<template>
	<div v-if="profileInfo">
		<h1>{{ profileInfo.username }}</h1>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ProfileInfo } from '../../../shared/types';

export default Vue.defineComponent({
	data() {
		return {
			profileInfo: null as ProfileInfo
		};
	},
	async mounted() {
		let accountId = Number(this.$route.params.id);
		let response = await fetch(`/api/account/${accountId}/info`);
		let json = await response.json() as ProfileInfo;

		this.profileInfo = json;
	}
});
</script>

<style>

</style>