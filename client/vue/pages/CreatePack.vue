<template>
	<template v-if="$store.state.loggedInAccount">
		<h1>Create new level pack</h1>
		<div :class="{ disabled: creating }">
			<input type="text" placeholder="Name" maxlength="256" v-model.trim="name">
			<textarea class="description" placeholder="Description" maxlength="1000" v-model.trim="description"></textarea>
			<p class="note"><b>Note:</b> You can add levels to this pack once you've created it.</p>
			<button-with-icon icon="/assets/svg/create_new_folder_black_24dp.svg" class="createButton" @click="create">Create</button-with-icon>
		</div>
	</template>
	<p v-else class="notSignedIn">You need to be signed in to create a level pack.</p>
</template>

<script lang="ts">
import Vue from 'vue';
import ButtonWithIcon from '../ButtonWithIcon.vue';

export default Vue.defineComponent({
	components: {
		ButtonWithIcon
	},
	data() {
		return {
			name: '',
			description: '',
			creating: false
		};
	},
	computed: {
		canCreate(): boolean {
			return !!(this.name && this.description);
		}
	},
	methods: {
		async create() {
			if (!this.canCreate) return;

			this.creating = true;

			let token = localStorage.getItem('token');
			let response = await fetch('/api/pack/create', {
				method: 'POST',
				body: JSON.stringify({
					name: this.name,
					description: this.description
				}),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				let json = await response.json() as { packId: number };
				this.$router.push({ name: 'Pack', params: { id: json.packId } });
			} else {
				this.creating = false;
				alert("Something went wrong.");
			}
		}
	}
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 30px 0px;
}

input {
	display: block;
	width: 500px;
	height: 40px;
	margin: auto;
	background: rgb(240, 240, 240);
	font-size: 16px;
	font-family: inherit;
	color: inherit;
	border: 2px solid transparent;
	border-radius: 5px;
	padding-left: 10px;
	margin-bottom: 10px;
	box-sizing: border-box;
}

input:focus {
	outline: none;
	border: 2px solid rgb(220, 220, 220);
}

.description {
	display: block;
	width: 500px;
	height: 100px;
	margin: auto;
	background: rgb(240, 240, 240);
	font-size: 16px;
	font-family: inherit;
	color: inherit;
	border: 2px solid transparent;
	border-radius: 5px;
	padding: 5px;
	padding-left: 10px;
    box-sizing: border-box;
    resize: none;
	margin-top: 10px;
}

.description:focus {
	outline: none;
	border: 2px solid rgb(220, 220, 220);
}

.createButton {
	width: 200px;
	margin: auto;
	margin-top: 30px;
}

.note {
	margin: 0;
	margin-top: 10px;
	font-size: 14px;
	text-align: center;
}

.notSignedIn {
	margin: 5px;
	margin-bottom: 15px;
	width: 100%;
	text-align: center;
	font-size: 14px;
}
</style>