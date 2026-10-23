<template>
	<div class="commentElement">
		<profile-banner :profileInfo="commentInfo.author" :secondaryText="sentDate" class="profileBanner"></profile-banner>
		<p v-html="content"></p>
		<img src="/assets/svg/delete_black_24dp.svg" class="delete basicIcon" title="Delete this comment" v-if="hasOwnershipPermissions" :style="{ display: deleteDisplayStyle }" @click="$emit('delete')">
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CommentInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import { useStore } from '../../ts/store';
import ProfileBanner from './ProfileBanner.vue';

const props = defineProps<{
	commentInfo?: CommentInfo
}>();

defineEmits<{
	delete: []
}>();

const store = useStore();

/** Formats the date the comment was sent. */
const sentDate = computed(() => {
	let date = new Date(props.commentInfo.time);
	let hours = ('00' + date.getHours()).slice(-2);
	let minutes = ('00' + date.getMinutes()).slice(-2);

	return `on ${Util.formatDate(date)} at ${hours}:${minutes}`;
});
const hasOwnershipPermissions = computed(() => {
	return props.commentInfo.author.id === store.state.loggedInAccount?.id || store.state.loggedInAccount?.isModerator;
});
const deleteDisplayStyle = computed(() => {
	return Util.deviceSupportsHover()? '' : 'block';
});
const content = computed(() => {
	return Util.linkify(props.commentInfo.content);
});
</script>

<style scoped>
.commentElement {
	margin-bottom: 20px;
	position: relative;
}

.profileBanner {
	width: 300px;
}

p {
	margin: 0;
	margin-top: 5px;
	white-space: pre-wrap;
	overflow-wrap: break-word;
}

.delete {
	position: absolute;
	top: 0px;
	right: 0px;
	padding: 5px;
	opacity: 0.25 !important;
	cursor: pointer;
	display: none;
}

.delete:hover {
	opacity: 0.75 !important;
}

.commentElement:hover .delete {
	display: block;
}
</style>