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

<script lang="ts" setup>
import { computed } from 'vue';
import { LeaderboardScore } from '../../../shared/types';
import { Util } from '../../ts/util';

const props = defineProps<{
	scores?: LeaderboardScore[],
	status?: string
}>();

const leaderboardsView = computed(() => {
	return props.scores.map((record, i) => {
		return {
			rank: record.placement,
			name: record.username,
			score: record.score_type === "time" ? Util.secondsToTimeString(record.score / 1000) : `${record.score}`
		}
	});
});
</script>

<style scoped>
.container {
	max-height: 400px;
	border-radius: 5px;
	overflow-y: auto;
}
table {
    width: 100%;
    background: var(--background-1);
	table-layout: fixed;
	border-collapse: collapse;
}
thead {
    background: var(--background-2);
	position: sticky;
	top: 0px;
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);
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