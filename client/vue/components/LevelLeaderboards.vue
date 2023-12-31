<template>
    <table>
    	<thead>
    		<tr>
    			<th>#</th>
    			<th>Name</th>
    			<th>Score</th>
    		</tr>
    	</thead>
    	<tbody v-if="leaderboardsView.length !== 0">
			<tr v-for="record of leaderboardsView">
				<td>{{ record.rank }}</td>
				<td>{{ record.name }}</td>
				<td>{{ record.score }}</td>
			</tr>
    	</tbody>
		<tbody v-if="leaderboardsView.length === 0">
			<tr>
				<td colspan="3">No scores yet</td>
			</tr>
		</tbody>
    </table>
    <div class="buttonContainer" v-if="leaderboardsView.length !== 0">
        <button-with-icon :title="previous" ref="button" class="button" :icon="previousIcon" noMargin @click="page = Math.max(0, page - 1)" :style="{visibility: page === 0 ? 'hidden' : ''}"></button-with-icon>
        <span style="margin: auto;">Page {{ page + 1 }}/{{ Math.ceil(scores.length / scoresPerPage) }}</span>
        <button-with-icon :title="next" ref="button" class="button" :icon="nextIcon" noMargin @click="page = Math.min(Math.ceil(scores.length / scoresPerPage) - 1, page + 1)" :style="{visibility: page === Math.ceil(scores.length / scoresPerPage) - 1 ? 'hidden' : ''}"></button-with-icon>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ButtonWithIcon from './ButtonWithIcon.vue';
import { LeaderboardDefinition, LeaderboardScore } from '../../../shared/types';
import { Util } from '../../ts/util';

export default defineComponent({
    components: {
        ButtonWithIcon
	},
	props: {
		scores: Array as PropType<LeaderboardScore[]>
	},
    data() {
        return {
            next: "Next",
            previous: "Previous",
            nextIcon: "/assets/svg/navigate_next_black_24dp.svg",
			previousIcon: "/assets/svg/navigate_before_black_24dp.svg",
			page: 0,
			scoresPerPage: 10
        };
	},
	computed: {
		leaderboardsView() {
			return this.scores.slice(this.page * this.scoresPerPage, (this.page + 1) * this.scoresPerPage).map((record, i) => {
				return {
					rank: record.placement,
					name: record.username,
					score: record.score_type === "time" ? Util.secondsToTimeString(record.score / 1000) : `${record.score}`
				}
			});
		}
	}
});
</script>

<style scoped>
table {
    width: 100%;
    background: var(--background-1);
    border-radius: 5px;
	table-layout: fixed;
}
thead {
    background: var(--background-2);
}
thead tr th:first-child {
	width: 10%;
}
thead tr th:last-child {
	width: 20%;
}
tbody tr:nth-child(even) {
    background: var(--background-2);
}
tbody tr td:first-child {
    text-align: center;
}
tbody tr td:last-child {
	text-align: center;
}
.buttonContainer {
	display: flex;
	width: 100%;
	margin-top: 10px;
    justify-content: space-between;
}
.buttonContainer > div {
    width: 40px;
}
</style>