<template>
	<div style="position: relative; border-radius: 5px; overflow: hidden;" class="notSelectable">
		<button-with-icon icon="/assets/svg/download_black_24dp.svg" @click="download('platinumquest')" style="border-radius: 0px;"><slot></slot></button-with-icon>
		<img src="/assets/svg/expand_more_black_24dp.svg" class="expandMore basicIcon" :style="{ transform: chevronTransform }" @click="expanded = !expanded">
		<div v-if="expanded">
			<p v-for="assumption of assuming" :key="assumption.name" @click="download(assumption.name)" v-html="assumption.label"></p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ButtonWithIcon from './ButtonWithIcon.vue';

export default defineComponent({
	props: {
		mode: String as PropType<'level' | 'pack' | 'multipleLevels'>,
		id: Number as PropType<number>
	},
	data() {
		return {
			expanded: false,
			assuming: [{
				name: 'platinumquest',
				label: 'Assuming I have PQ <span style="opacity: 0.5;">(default)</span>'
			}, {
				name: 'gold',
				label: 'Assuming I have MBG'
			}, {
				name: 'none',
				label: 'Including all assets'
			}]
		};
	},
	computed: {
		chevronTransform(): string {
			return this.expanded? 'rotate(180deg)' : '';
		}
	},
	methods: {
		/** Start downloading the .zip with the correct assumption parameter */
		download(assumption: string) {
			if (this.mode !== 'multipleLevels') window.location.href = window.location.origin + 
				((this.mode === 'level')? `/api/level/${this.id}/zip?assuming=${assumption}`
				: `/api/pack/${this.id}/zip?assuming=${assumption}`);

			this.$emit('download', assumption);
		}
	},
	components: {
		ButtonWithIcon
	}
});
</script>

<style scoped>
img {
	opacity: 0.75;
	display: block;
}

.expandMore {
	position: absolute;
	right: 0px;
	top: 0px;
	opacity: 0.25 !important;
	cursor: pointer;
	padding: 8px;
}

.expandMore:hover {
	opacity: 0.75 !important;
}

p {
	width: 100%;
	background: var(--background-1);
	display: flex;
	padding-left: 10px;
	align-items: center;
	height: 30px;
	cursor: pointer;
	border: 2px solid transparent;
	box-sizing: border-box;
	margin: 0;
	white-space: pre;
}

p:hover {
	border: 2px solid var(--background-2);
}

p:active {
	background: var(--background-2);
}
</style>