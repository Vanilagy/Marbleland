<template>
	<div class="outer">
		<template v-if="!levels">
			<level-panel-skeleton v-for="n in defaultCount" :key="n" style="margin: 5px;"></level-panel-skeleton>
		</template>
		<template v-else>
			<template v-if="shownLevels.length > 0">
				<level-panel v-for="info of shownLevels" :key="info.id" :levelInfo="info" :options="passedLevelPanelOptions" class="levelPanel"></level-panel>
			</template>
			<p v-else class="noLevelsNotice">{{ noLevelsNotice }}</p>
			<img src="/assets/svg/expand_more_black_24dp.svg" class="more" @click="showMore" v-if="canShowMore" title="Show more">
		</template>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { LevelInfo } from '../../shared/types';
import { store } from '../ts/store';
import LevelPanel, { LevelPanelOptions } from './LevelPanel.vue';
import LevelPanelSkeleton from './LevelPanelSkeleton.vue';

export default Vue.defineComponent({
	props: {
		levels: Array as PropType<LevelInfo[]>,
		noLevelsNotice: String as PropType<string>,
		defaultCount: Number as PropType<number>,
		levelPanelOptions: Object as PropType<LevelPanelOptions>
	},
	data() {
		return {
			shownCount: this.defaultCount
		};
	},
	computed: {
		shownLevels(): LevelInfo[] {
			return this.levels.slice(0, this.shownCount);
		},
		canShowMore(): boolean {
			return this.shownLevels.length < this.levels.length;
		},
		passedLevelPanelOptions(): LevelPanelOptions {
			if (this.levelPanelOptions) return this.levelPanelOptions;
			if (this.$store.state.loggedInAccount) return { addToPack: true };
			return null;
		}
	},
	components: {
		LevelPanel,
		LevelPanelSkeleton
	},
	methods: {
		showMore() {
			this.shownCount += 24;
		}
	},
	watch: {
		levels() {
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

.levelPanel {
	margin: 5px;
}

.noLevelsNotice {
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