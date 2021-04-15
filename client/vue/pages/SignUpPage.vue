<template>
	<sign-in-or-up-component type="signUp"></sign-in-or-up-component>
</template>

<script lang="ts">
import Vue from 'vue';
import SignInOrUpComponent from '../components/SignInOrUpComponent.vue';

export default Vue.defineComponent({
	components: {
		SignInOrUpComponent
	}
});
</script>