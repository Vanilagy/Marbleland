<template>
	<sign-in-or-up-component type="signIn"></sign-in-or-up-component>
</template>

<script lang="ts">
import Vue from 'vue';
import SignInOrUpComponent from '../SignInOrUpComponent.vue';

export default Vue.defineComponent({
	components: {
		SignInOrUpComponent
	}
});
</script>