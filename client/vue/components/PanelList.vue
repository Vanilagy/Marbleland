<template>
	<div class="outer">
		<template v-if="!entries">
			<panel-skeleton v-for="n in defaultCount" :key="n"></panel-skeleton>
		</template>
		<template v-else>
			<template v-if="shownEntries.length > 0">
				<template v-if="mode === 'level'">
					<level-panel v-for="info of shownEntries" :key="info.id" :levelInfo="info" :actions="passedLevelPanelActions" class="entryPanel"></level-panel>
				</template>
				<template v-else>
					<pack-panel v-for="info of shownEntries" :key="info.id" :packInfo="info" class="entryPanel"></pack-panel>
				</template>
			</template>
			<p v-else class="noEntriesNotice">{{ noEntriesNotice }}</p>
			<img src="/assets/svg/expand_more_black_24dp.svg" class="more basicIcon" @click="showMore" v-if="canShowMore" title="Show more">
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { LevelInfo, PackInfo } from '../../../shared/types';
import LevelPanel, { LevelPanelActions } from './LevelPanel.vue';
import PanelSkeleton from './PanelSkeleton.vue';
import PackPanel from './PackPanel.vue';

export default defineComponent({
	props: {
		mode: String as PropType<'level' | 'pack'>,
		entries: Array as PropType<LevelInfo[] | PackInfo[]>,
		noEntriesNotice: String as PropType<string>,
		defaultCount: Number as PropType<number>,
		/** Object of additional actions to pass down to the individual level panels */
		levelPanelActions: Object as PropType<LevelPanelActions>
	},
	data() {
		return {
			shownCount: this.defaultCount
		};
	},
	computed: {
		shownEntries(): (LevelInfo[] | PackInfo[]) {
			return this.entries.slice(0, this.shownCount);
		},
		canShowMore(): boolean {
			return this.shownEntries.length < this.entries.length;
		},
		/** Acts as a proxy that applies a default value. */
		passedLevelPanelActions(): LevelPanelActions {
			if (this.levelPanelActions) return this.levelPanelActions;
			if (this.$store.state.loggedInAccount) return { addToPack: true };
			return null;
		}
	},
	components: {
		LevelPanel,
		PanelSkeleton,
		PackPanel
	},
	methods: {
		showMore() {
			this.shownCount += 24;
		}
	},
	watch: {
		entries() {
			// Whenever the entry array changes, reset the shown count back to its default
			this.shownCount = this.defaultCount;
		}
	}
});
</script>

<style scoped>
.outer {
	display: flex;
	margin: -5px;
	margin-top: 5px;
	flex-wrap: wrap;
}

.noEntriesNotice {
	margin: 5px;
	margin-bottom: 15px;
	width: 100%;
	text-align: center;
	font-size: 14px;
}

.more {
	display: block;
	margin: auto;
	width: 48px;
	opacity: 0.25;
	cursor: pointer;
}

.more:hover {
	opacity: 0.75;
}
</style>