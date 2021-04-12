<template>
	<div class="outer">
		<template v-if="!entries">
			<panel-skeleton v-for="n in defaultCount" :key="n" style="margin: 5px;"></panel-skeleton>
		</template>
		<template v-else>
			<template v-if="shownEntries.length > 0">
				<template v-if="mode === 'level'">
					<level-panel v-for="info of shownEntries" :key="info.id" :levelInfo="info" :options="passedLevelPanelOptions" class="entryPanel"></level-panel>
				</template>
				<template v-else>
					<pack-panel v-for="info of shownEntries" :key="info.id" :packInfo="info" class="entryPanel"></pack-panel>
				</template>
			</template>
			<p v-else class="noEntriesNotice">{{ noEntriesNotice }}</p>
			<img src="/assets/svg/expand_more_black_24dp.svg" class="more" @click="showMore" v-if="canShowMore" title="Show more">
		</template>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { LevelInfo, PackInfo } from '../../shared/types';
import { store } from '../ts/store';
import LevelPanel, { LevelPanelOptions } from './LevelPanel.vue';
import PanelSkeleton from './PanelSkeleton.vue';
import PackPanel from './PackPanel.vue';

export default Vue.defineComponent({
	props: {
		mode: String as PropType<'level' | 'pack'>,
		entries: Array as PropType<LevelInfo[] | PackInfo[]>,
		noEntriesNotice: String as PropType<string>,
		defaultCount: Number as PropType<number>,
		levelPanelOptions: Object as PropType<LevelPanelOptions>
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
		passedLevelPanelOptions(): LevelPanelOptions {
			if (this.levelPanelOptions) return this.levelPanelOptions;
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

.entryPanel {
	margin: 5px;
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