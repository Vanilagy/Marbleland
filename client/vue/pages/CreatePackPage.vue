<template>
	<Head>
		<title>Create pack - Marbleland</title>
		<meta name="og:title" content="Create pack">
	</Head>
	<template v-if="$store.state.loggedInAccount && !$store.state.loggedInAccount.isSuspended && $store.state.loggedInAccount.levelCount > 0">
		<h1>Create new level pack</h1>
		<div :class="{ disabled: creating }">
			<input type="text" placeholder="Name" :maxlength="$store.state.packNameMaxLength" v-model.trim="name" class="basicTextInput">
			<textarea class="description basicTextarea" placeholder="Description" :maxlength="$store.state.packDescriptionMaxLength" v-model.trim="description"></textarea>
			<p class="note"><b>Note:</b> You can add levels to this pack once you've created it.</p>
			<button-with-icon icon="/assets/svg/create_new_folder_black_24dp.svg" class="createButton" @click="create" :class="{ disabled: !canCreate }">Create</button-with-icon>
		</div>
	</template>
	<p v-else-if="$store.state.loggedInAccount && $store.state.loggedInAccount.isSuspended" class="suspendedMessage">Your account has been suspended and cannot create level packs.</p>
	<p v-else-if="$store.state.loggedInAccount && $store.state.loggedInAccount.levelCount === 0" class="noLevelsMessage">You need to create at least one level before you can create a pack.</p>
	<p v-else class="notSignedIn">You need to be signed in to create a level pack.</p>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import { Head } from '@unhead/vue/components';
import { useStore } from '../../ts/store';

const store = useStore();
const router = useRouter();

const name = ref('');
const description = ref('');
const creating = ref(false);

const canCreate = computed(() => {
	return !!(name.value && description.value);
});

const create = async () => {
	if (!canCreate.value) return;

	creating.value = true;

	// Send a pack create API call
	let response = await fetch('/api/pack/create', {
		method: 'POST',
		body: JSON.stringify({
			name: name.value,
			description: description.value
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (response.ok) {
		// Navigate to the freshly created pack with a little banner notice
		let json = await response.json() as { packId: number };
		store.state.nextInfoBannerMessage = "Pack created successfully!";
		router.push({ name: 'Pack', params: { id: json.packId } });
		store.state.ownPacks.push({
			id: json.packId,
			name: name.value,
			levelIds: []
		});
	} else {
		creating.value = false;
		alert("Something went wrong.");
	}
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 30px 0px;
}

input {
	width: 100%;
	max-width: 500px;
	margin: auto;
}

.description {
	width: 100%;
	max-width: 500px;
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