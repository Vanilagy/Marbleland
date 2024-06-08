<template>
	<div class="container">
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
			<tbody v-if="status !== ''">
				<tr>
					<td colspan="3">{{ status }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ButtonWithIcon from './ButtonWithIcon.vue';
import { LeaderboardScore } from '../../../shared/types';
import { Util } from '../../ts/util';

export default defineComponent({
    components: {
        ButtonWithIcon
	},
	props: {
		scores: Array as PropType<LeaderboardScore[]>,
		status: String as PropType<string>
	},
    data() {
        return {
            next: "Next",
            previous: "Previous",
            nextIcon: "/assets/svg/navigate_next_black_24dp.svg",
			previousIcon: "/assets/svg/navigate_before_black_24dp.svg",
        };
	},
	computed: {
		leaderboardsView(): { rank: number, name: string, score: string }[] {
			return this.scores.map((record, i) => {
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
.container {
	height: 400px;
	overflow-y: auto;
}
table {
    width: 100%;
    background: var(--background-1);
    border-radius: 5px;
	table-layout: fixed;
}
thead {
    background: var(--background-2);
	position: sticky;
	top: 0px;
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
</style>