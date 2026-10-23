<template>
	<div class="outer">
		<template v-if="!entries">
			<panel-skeleton v-for="n in defaultCount" :key="n"></panel-skeleton>
		</template>
		<template v-else>
			<template v-if="entries.length > 0">
				<p class="entryCount" v-if="showTotal">Total: {{ entries.length }}</p>
				<template v-if="mode === 'level'">
					<level-panel v-for="info of shownEntries" :key="info.id" :levelInfo="info as LevelInfo" :actions="passedLevelPanelActions" class="entryPanel"></level-panel>
				</template>
				<template v-else>
					<pack-panel v-for="info of shownEntries" :key="info.id" :packInfo="info as PackInfo" class="entryPanel" :selectedPacks="selectedPacks"></pack-panel>
				</template>
			</template>
			<p v-else class="noEntriesNotice">{{ noEntriesNotice }}</p>
			<img src="/assets/svg/expand_more_black_24dp.svg" class="more basicIcon" @click="showMore" v-if="canShowMore" title="Show more">
		</template>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { LevelInfo, PackInfo } from '../../../shared/types';
import LevelPanel, { LevelPanelActions } from './LevelPanel.vue';
import PanelSkeleton from './PanelSkeleton.vue';
import PackPanel from './PackPanel.vue';
import { useStore } from '../../ts/store';

const props = defineProps<{
	mode?: 'level' | 'pack',
	entries?: LevelInfo[] | PackInfo[],
	noEntriesNotice?: string,
	defaultCount?: number,
	/** Object of additional actions to pass down to the individual level panels */
	levelPanelActions?: LevelPanelActions,
	showTotal?: boolean,
	noShrink?: boolean,
	selectedPacks?: number[]
}>();

const store = useStore();

const shownCount = ref(props.defaultCount);

onMounted(() => {
	maybeShowAll();
});

const shownEntries = computed(() => {
	return props.entries.slice(0, shownCount.value);
});
const canShowMore = computed(() => {
	return shownEntries.value.length < props.entries.length;
});
/** Acts as a proxy that applies a default value. */
const passedLevelPanelActions = computed((): LevelPanelActions => {
	if (props.levelPanelActions) return props.levelPanelActions;
	if (store.state.loggedInAccount) return { addToPack: true };
	return null;
});

const showMore = () => {
	shownCount.value += 24;
	maybeShowAll();
};
/** If there is at most one row of levels still not shown, show them. */
const maybeShowAll = () => {
	if (props.entries && shownCount.value > 4 && props.entries.length - shownCount.value <= 4) {
		shownCount.value = props.entries.length;
	}
};

watch(() => props.entries, () => {
	// Whenever the entry array changes, reset the shown count back to its default
	if (!props.noShrink) shownCount.value = props.defaultCount;
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

.entryCount {
	width: 100%;
	text-align: center;
	font-size: 12px;
	opacity: 0.5;
	margin: 0;
}

.more {
	display: block;
	margin: auto;
	width: 48px;
	opacity: 0.25 !important;
	cursor: pointer;
}

.more:hover {
	opacity: 0.75 !important;
}
</style>