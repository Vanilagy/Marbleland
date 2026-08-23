<template>
	<div class="levelPanelWrapper">
		<div class="panel notSelectable" @click="clicked">
			<a :href="`/level/${levelInfo.id}`" @click.prevent=""><img :src="imageSource" @error="imageLoadError" v-if="imageShown" class="mainImage"></a>
			<div class="bottom">
				<div class="info">
					<div class="name">{{ levelInfo.name }}</div>
					<div class="artist" :class="{missingArtist: !levelInfo.artist}">
						{{ levelInfo.artist ? levelInfo.artist : 'Missing artist' }}
					</div>
				</div>
				<div class="scoreArea" v-if="isCurator">
					<div class="score" :class="{ positive: (levelInfo.curationScore || 0) > 0, negative: (levelInfo.curationScore || 0) < 0 }">{{ levelInfo.curationScore || 0 }}</div>
					<div class="voteChevrons">
						<span class="voteChevron up" :class="{ active: yourVote === true }" title="This level demonstrates creative effort." @click.stop="submitVote(true)"><img src="/assets/svg/expand_more_black_24dp.svg" class="basicIcon"></span>
						<span class="voteChevron down" :class="{ active: yourVote === false }" title="This level does not demonstrate creative effort." @click.stop="submitVote(false)"><img src="/assets/svg/expand_more_black_24dp.svg" class="basicIcon"></span>
					</div>
				</div>
			</div>
			<div class="actions" :style="actionsStyle">
				<img src="/assets/svg/west_black_24dp.svg" v-if="actions && actions.swapLeft" title="Swap to the left" @click.stop="actions.swapLeft(levelInfo)" class="basicIcon">
				<img src="/assets/svg/east_black_24dp.svg" v-if="actions && actions.swapRight" title="Swap to the right" @click.stop="actions.swapRight(levelInfo)" class="basicIcon">
				<img src="/assets/svg/remove_circle_outline_black_24dp.svg" v-if="actions && actions.removeFromPack" title="Remove level from this pack" @click.stop="actions.removeFromPack(levelInfo)" class="basicIcon">
				<img src="/assets/svg/create_new_folder_black_24dp.svg" v-if="actions && actions.addToPack" title="Add level to pack" @click.stop="$refs.packAdder.show()" class="basicIcon">
				<img src="/assets/svg/download_black_24dp.svg" title="Download level" @click.stop="download" class="basicIcon">
			</div>
		</div>
		<pack-adder :levelId="levelInfo.id" class="packAdder" ref="packAdder"></pack-adder>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { LevelInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import PackAdder from './PackAdder.vue';

/** Specifies options actions a level panel can display. */
export interface LevelPanelActions {
	removeFromPack?: (info: LevelInfo) => void,
	addToPack?: boolean,
	swapLeft?: (info: LevelInfo) => void,
	swapRight?: (info: LevelInfo) => void
}

export default defineComponent({
	props: {
		levelInfo: Object as PropType<LevelInfo>,
		actions: Object as PropType<LevelPanelActions>
	},
	data() {
		return {
			imageShown: true
		};
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelInfo.id}/image?version=${this.levelInfo.currentVersion ?? 1}`;
		},
		actionsStyle(): Record<string, string> {
			return {
				display: (!Util.deviceSupportsHover())? 'block' : '' // Make sure to alawys show the actions if there's no hovering on the device
			};
		},
		isCurator(): boolean {
			return !!this.$store.state.loggedInAccount?.isCurator;
		},
		yourVote(): boolean {
			return this.$store.state.curatorVotes?.[this.levelInfo.id] ?? null;
		}
	},
	methods: {
		clicked(): void {
			this.$router.push({ name: 'Level', params: { id: this.levelInfo.id } });
		},
		imageLoadError() {
			this.imageShown = false;
		},
		download() {
			window.location.href = window.location.origin + `/api/level/${this.levelInfo.id}/zip`;
		},
		/** Casts or removes a curator vote on this level, mirroring the voting behavior on the level page. */
		async submitVote(voteType: boolean) {
			if (!this.isCurator) return;

			const getScoreVal = (vote: boolean): number => {
				if (vote === true) return 1;
				if (vote === false) return -1;
				return 0;
			};
			const setStoredVote = (vote: boolean) => {
				if (!this.$store.state.curatorVotes) this.$store.state.curatorVotes = {};
				if (vote === null) delete this.$store.state.curatorVotes[this.levelInfo.id];
				else this.$store.state.curatorVotes[this.levelInfo.id] = vote;
			};

			let oldVote = this.yourVote;
			let newVote = (oldVote === voteType)? null : voteType;
			let diff = getScoreVal(newVote) - getScoreVal(oldVote);

			// Optimistic UI
			setStoredVote(newVote);
			this.levelInfo.curationScore = (this.levelInfo.curationScore || 0) + diff;

			try {
				let response = await fetch(`/api/level/${this.levelInfo.id}/curate-vote`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ vote: newVote })
				});

				if (!response.ok) {
					let text = await response.text();
					alert("Failed to submit vote: " + text);
					throw new Error("Vote failed");
				}
			} catch (e) {
				// Revert to old state
				setStoredVote(oldVote);
				this.levelInfo.curationScore = (this.levelInfo.curationScore || 0) - diff;
			}
		}
	},
	components: {
		PackAdder
	}
});
</script>

<style scoped>
.levelPanelWrapper {
	position: relative;
	box-sizing: border-box;
	padding: 5px;
	width: calc(100% / 4);
}

.panel {
	height: 200px;
	background: var(--background-1);
	overflow: hidden;
	border-radius: 5px;
	position: relative;
	cursor: pointer;
	transition: box-shadow 0.15s;
}

@media (max-width: 1045px) {
	.levelPanelWrapper {
		width: calc(100% / 3);
	}
}

@media (max-width: 792px) {
	.levelPanelWrapper {
		width: calc(100% / 2);
	}
}

@media (max-width: 540px) {
	.levelPanelWrapper {
		width: calc(100% / 1);
	}
}

.panel:hover {
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
}

.panel:hover .actions {
	display: block;
}

.mainImage {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.name {
	font-size: 16px;
	height: 24px;
	margin-bottom: -4px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 20px);
}

.artist {
	font-size: 12px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 20px);
}

.bottom {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	padding: 3px 9px;
	background: var(--level-panel-bottom-background);
	box-sizing: border-box;
}

.info {
	flex: 1 1 auto;
	min-width: 0;
}

.scoreArea {
	flex: 0 0 auto;
	margin-left: 8px;
	margin-top: -3px;
	margin-bottom: -3px;
	display: flex;
	align-items: center;
	gap: 3px;
}

.voteChevrons {
	display: flex;
	flex-direction: column;
}

.score {
	white-space: nowrap;
	font-weight: 600;
	opacity: 1;
	line-height: 1.1;
}

.voteChevron {
	display: block;
	border-radius: 50%;
	line-height: 0;
	cursor: pointer;
	opacity: 0.5;
}

.voteChevron:hover {
	opacity: 0.75;
}

.voteChevron img {
	width: 14px;
	height: 14px;
	display: block;
}

.voteChevron.up img {
	transform: rotate(180deg);
}

.voteChevron.active {
	opacity: 1;
}

.voteChevron.up.active {
	background: #4caf50;
}

.voteChevron.down.active {
	background: #f44336;
}

.voteChevron.active img {
	filter: invert(1);
	opacity: 1;
}

.score.positive {
    color: #4caf50;
}
.score.negative {
    color: #f44336;
}

.missingArtist {
	font-style: italic;
	opacity: 0.5;
}

.actions {
	position: absolute;
	top: 0px;
	right: 0px;
	background: var(--level-panel-bottom-background);
	border-bottom-left-radius: 5px;
	display: none;
}

.actions img {
	cursor: pointer;
	padding: 5px;
	vertical-align: top;
	opacity: 0.5 !important;
	width: 20px;
}

.actions img:hover {
	opacity: 0.75 !important;
}

.packAdder {
	position: absolute;
	top: 30px;
	right: 0px;
	z-index: 1;
}
</style>