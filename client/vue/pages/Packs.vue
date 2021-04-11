<template>
	<button-with-icon icon="/assets/svg/create_new_folder_black_24dp.svg" class="createPackButton" @click="createPack">Create new pack</button-with-icon>
</template>

<script lang="ts">
import Vue from 'vue';
import ButtonWithIcon from '../ButtonWithIcon.vue';

export default Vue.defineComponent({
	components: {
		ButtonWithIcon
	},
	methods: {
		createPack() {
			this.$router.push('/create-pack');
		}
	}
});
</script>

<style scoped>
.createPackButton {
	margin: auto;
	width: 200px;
}
</style>