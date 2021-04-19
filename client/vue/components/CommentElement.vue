<template>
	<div class="commentElement">
		<profile-banner :profileInfo="commentInfo.author" :secondaryText="sentDate" class="profileBanner"></profile-banner>
		<p v-html="content"></p>
		<img src="/assets/svg/delete_black_24dp.svg" class="delete basicIcon" title="Delete this comment" v-if="isOwnComment" :style="{ display: deleteDisplayStyle }" @click="$emit('delete')">
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CommentInfo } from '../../../shared/types';
import { Util } from '../../ts/util';
import ProfileBanner from './ProfileBanner.vue';

export default defineComponent({
	props: {
		commentInfo: Object as PropType<CommentInfo>
	},
	computed: {
		/** Formats the date the comment was sent. */
		sentDate(): string {
			let date = new Date(this.commentInfo.time);
			let hours = ('00' + date.getHours()).slice(-2);
			let minutes = ('00' + date.getMinutes()).slice(-2);

			return `on ${Util.formatDate(date)} at ${hours}:${minutes}`;
		},
		isOwnComment(): boolean {
			return this.commentInfo.author.id === this.$store.state.loggedInAccount?.id;
		},
		deleteDisplayStyle(): string {
			return Util.deviceSupportsHover()? '' : 'block';
		},
		content(): string {
			return Util.linkify(this.commentInfo.content);
		}
	},
	components: {
		ProfileBanner
	}
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