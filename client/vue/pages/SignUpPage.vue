<template>
	<sign-in-or-up-component type="signUp"></sign-in-or-up-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SignInOrUpComponent from '../components/SignInOrUpComponent.vue';

export default defineComponent({
	components: {
		SignInOrUpComponent
	}
});
</script>