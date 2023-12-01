<template>
    <table>
    	<thead>
    		<tr>
    			<th>#</th>
    			<th>Name</th>
    			<th>Score</th>
    		</tr>
    	</thead>
    	<tbody>
    		<tr>
    			<td>1</td>
    			<td>RandomityGuy</td>
    			<td>3.456</td>
    		</tr>
    		<tr>
    			<td>2</td>
    			<td>Randomity</td>
    			<td>3.567</td>
    		</tr>
    		<tr>
    			<td>3</td>
    			<td>Rando</td>
    			<td>3.789</td>
    		</tr>
    	</tbody>
    </table>
    <div class="buttonContainer">
        <button-with-icon :title="previous" ref="button" class="button" :icon="previousIcon" noMargin></button-with-icon>
        <span style="margin: auto;">Page 1/1</span>
        <button-with-icon :title="next" ref="button" class="button" :icon="nextIcon" noMargin></button-with-icon>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ButtonWithIcon from './ButtonWithIcon.vue';

export default defineComponent({
    components: {
        ButtonWithIcon
    },
    data() {
        return {
            next: "Next",
            previous: "Previous",
            nextIcon: "/assets/svg/navigate_next_black_24dp.svg",
            previousIcon: "/assets/svg/navigate_before_black_24dp.svg",
        };
    },
});
</script>

<style scoped>
table {
    width: 100%;
    background: var(--background-1);
    border-radius: 5px;
}
thead {
    background: var(--background-2);
}
tbody tr:nth-child(even) {
    background: var(--background-2);
}
tbody tr td:first-child {
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