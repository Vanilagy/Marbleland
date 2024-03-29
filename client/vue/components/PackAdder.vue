<template>
	<div class="outer notSelectable" v-if="shown">
		<p v-if="packs.length === 0" class="noPacks">You haven't created any packs that you could add this level to.</p>
		<template v-else>
			<div v-for="pack of packs" :key="pack.id" class="row" :title="rowTitle(pack.id)" @click="selectPack(pack.id)">
				<p :style="{ 'font-weight': contains(pack.id)? 'bold' : '' }">{{ pack.name }}</p>
				<p class="removeFromPack" v-if="contains(pack.id)">Click to remove from pack</p>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { SignInInfo } from '../../../shared/types';
import { emitter } from '../../ts/emitter';
export default defineComponent({
	props: {
		levelId: Number as PropType<number>
	},
	data() {
		return {
			shown: false
		};
	},
	computed: {
		packs(): SignInInfo["packs"] {
			return this.$store.state.ownPacks;
		}
	},
	methods: {
		contains(packId: number) {
			return this.$store.state.ownPacks.some(x => x.id === packId && x.levelIds.includes(this.levelId));
		},
		rowTitle(packId: number) {
			let contains = this.contains(packId);
			let pack = this.packs.find(x => x.id === packId);
			return (!contains)? `Add level to pack "${pack.name}"` : `Remove level from pack "${pack.name}"`;
		},
		async selectPack(packId: number) {
			let contains = this.contains(packId); // See if the selected pack already contains the level
			let pack = this.packs.find(x => x.id === packId); // Find the selected pack

			if (contains) {
				// Remove the level
				let levelIndex = pack.levelIds.indexOf(this.levelId);
				if (levelIndex !== -1) pack.levelIds.splice(levelIndex, 1);
			} else {
				// Add the level
				pack.levelIds.push(this.levelId);
			}

			this.shown = false;

			// Sync the changes with the server
			await fetch(`/api/pack/${packId}/set-levels`, {
				method: 'POST',
				body: JSON.stringify(pack.levelIds),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			// Emit the update
			emitter.emit('packUpdate', {
				id: packId,
				levelIds: pack.levelIds
			});
		},
		show() {
			this.shown = true;
		},
		mouseUpListener() {
			if (this.shown) setTimeout(() => this.shown = false);
		}
	},
	mounted() {
		window.addEventListener('mouseup', this.mouseUpListener);
	},
	activated() {
		window.addEventListener('mouseup', this.mouseUpListener);
	},
	deactivated() {
		window.removeEventListener('mouseup', this.mouseUpListener);
	},
	unmounted() {
		window.removeEventListener('mouseup', this.mouseUpListener);
	}
});
</script>

<style scoped>
.outer {
	background: var(--background-1);
	border-radius: 5px;
	width: 200px;
	box-shadow: 0px 0px 5px #00000052;
	max-height: 200px;
	overflow: auto;
}

.noPacks {
	padding: 5px;
	font-size: 12px;
}

.row {
	padding-left: 10px;
	display: flex;
	justify-content: center;
	flex-direction: column;
	height: 40px;
	cursor: pointer;
}

.row:hover {
	background: var(--background-2);
}

.row p {
	margin: 0;
	line-height: 16px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding-right: 5px;
}

.removeFromPack {
	font-size: 12px;
}
</style>