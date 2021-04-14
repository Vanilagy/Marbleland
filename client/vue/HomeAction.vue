<template>
	<div class="homeAction" @click="navigate">
		<img :src="icon">
		<h2>{{ name }}</h2>
		<p>{{ description }}</p>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
export default Vue.defineComponent({
	props: {
		icon: String as PropType<string>,
		name: String as PropType<string>,
		description: String as PropType<string>,
		path: String as PropType<string>
	},
	methods: {
		navigate() {
			if (this.path.startsWith('/')) this.$router.push(this.path);
			else location.href = this.path;
		}
	}
});
</script>

<style scoped>
.homeAction {
	width: 200px;
	height: 200px;
	min-width: 200px;
	background: rgb(240, 240, 240);
	border-radius: 5px;
	position: relative;
	cursor: pointer;
	transition: box-shadow 0.15s, transform 0.15s;
}

.homeAction:hover {
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
	transform: translate(0px, 5px);
}

.homeAction > img {
	position: absolute;
	width: 50px;
	opacity: 0.75;
	top: 50px;
	left: 50%;
	transform: translate(-50%, -50%);
}

.homeAction > h2 {
	text-align: center;
	width: 100%;
	font-weight: normal;
	position: absolute;
	margin: 0;
	top: 70px;
	left: 0
}

.homeAction > p {
	width: 100%;
	padding: 12px;
	position: absolute;
	left: 0;
	top: 110px;
	margin: 0;
	text-align: center;
	box-sizing: border-box;
}
</style>