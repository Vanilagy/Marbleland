<template>
	<div style="position: relative; border-radius: 5px; overflow: hidden;" class="notSelectable">
		<button-with-icon icon="/assets/svg/play_circle.svg" @click="play(playInfo[0].id)" style="border-radius: 0px; background-color: var(--play-color);"><slot></slot></button-with-icon>
		<img src="/assets/svg/expand_more_black_24dp.svg" class="expandMore basicIcon" :style="{ transform: chevronTransform }" @click="expanded = !expanded">
		<div v-if="expanded">
			<p v-for="game of games" :key="game.name" @click="play(game.name)" v-html="game.label" style="background-color: var(--play-color);"></p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ButtonWithIcon from './ButtonWithIcon.vue';
import { GameDefinition } from '../../../shared/types';

export default defineComponent({
	props: {
		id: Number as PropType<number>,
		playInfo: Array as PropType<GameDefinition[]>
	},
	data() {
		return {
			expanded: false,
			games: this.playInfo.map((game, index) => {
				return {
					name: game.id,
					label: index === 0 ? `Play in ${game.name} <span style="opacity: 0.5;">(default)</span>` : `Play in ${game.name}`,
				}
			})
		};
	},
	computed: {
		chevronTransform(): string {
			return this.expanded? 'rotate(180deg)' : '';
		}
	},
	methods: {
		/** Start playing the game in new window */
		play(id: string) {
			let chosen = this.playInfo.find(game => game.id === id);
			window.open(chosen.playUrl, '_blank');
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
	border: 2px solid var(--play-color-hover);
}

p:active {
	background: var(--background-2);
}
</style>