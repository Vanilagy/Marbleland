<template>
	<Head>
		<title>Create pack - Marbleland</title>
		<meta name="og:title" content="Create pack - Marbleland">
	</Head>
	<template v-if="$store.state.loggedInAccount">
		<h1>Create new level pack</h1>
		<div :class="{ disabled: creating }">
			<input type="text" placeholder="Name" :maxlength="$store.state.packNameMaxLength" v-model.trim="name" class="basicTextInput">
			<textarea class="description basicTextarea" placeholder="Description" :maxlength="$store.state.packDescriptionMaxLength" v-model.trim="description"></textarea>
			<p class="note"><b>Note:</b> You can add levels to this pack once you've created it.</p>
			<button-with-icon icon="/assets/svg/create_new_folder_black_24dp.svg" class="createButton" @click="create" :class="{ disabled: !canCreate }">Create</button-with-icon>
		</div>
	</template>
	<p v-else class="notSignedIn">You need to be signed in to create a level pack.</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	components: {
		ButtonWithIcon,
		Head
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

			// Send a pack create API call
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
				// Navigate to the freshly created pack with a little banner notice
				let json = await response.json() as { packId: number };
				this.$store.state.nextInfoBannerMessage = "Pack created successfully!";
				this.$router.push({ name: 'Pack', params: { id: json.packId } });
				this.$store.state.ownPacks.push({
					id: json.packId,
					name: this.name,
					levelIds: []
				});
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
	width: 500px;
	margin: auto;
}

.description {
	width: 500px;
	height: 100px;
	margin: auto;
	margin-top: 10px;
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