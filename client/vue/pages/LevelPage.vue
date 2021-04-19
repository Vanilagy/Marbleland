<template>
	<Head>
		<title v-if="levelInfo">{{ levelInfo.name }}{{ levelInfo.artist? ' by ' + levelInfo.artist : '' }} - Marbleland</title>
		<title v-else>Marbleland</title>
	</Head>
	<loader v-if="!levelInfo && !notFound"></loader>
	<p class="notFound" v-if="notFound">This level doesn't exist or has been deleted. :(</p>
	<template v-if="levelInfo" :class="{ disabled: deleting }">
		<info-banner></info-banner>
		<div class="top-part">
			<aside>
				<img :src="imageSource" class="thumbnail">
				<download-button style="margin-top: 10px" :id="levelInfo.id" mode="level" @download="levelInfo.downloads++"></download-button>
				<p class="additionalInfo">Downloads: {{ levelInfo.downloads }}<br>Added on {{ formattedDate }}</p>
				<profile-banner style="margin-top: 10px" v-if="levelInfo.addedBy" :profileInfo="levelInfo.addedBy" secondaryText="Uploader"></profile-banner>
			</aside>
			<div style="flex: 1 1 auto; min-width: 300px; max-width: 660px; margin-bottom: 10px;">
				<div class="actions">
					<img src="/assets/svg/delete_black_24dp.svg" title="Delete level" v-if="isOwnLevel" @click="deleteLevel" class="basicIcon">
					<img src="/assets/svg/edit_black_24dp.svg" title="Edit level" v-if="isOwnLevel" :class="{ disabled: editing }" @click="editing = true" class="basicIcon">
					<img src="/assets/svg/create_new_folder_black_24dp.svg" title="Add to pack" v-if="$store.state.loggedInAccount" @click="$refs.packAdder.toggle()" class="basicIcon">
					<pack-adder :levelId="levelInfo.id" class="packAdder" ref="packAdder"></pack-adder>
				</div>
				<h1>{{ levelInfo.name }}</h1>
				<h2 v-if="levelInfo.artist">By {{ levelInfo.artist }}</h2>
				<h3 v-if="levelInfo.desc">Description</h3>
				<p class="regularParagraph" v-html="description"></p>
				<h3>Details</h3>
				<div class="detail" v-for="(value, name) in levelDetails" :key="name"><b>{{ name }}</b>: {{ value }}</div>
				<h3 v-if="levelInfo.remarks || editing">Remarks</h3>
				<p class="regularParagraph" v-if="!editing && levelInfo.remarks" v-html="remarks"></p>
				<textarea v-if="editing" class="basicTextarea remarksInput" v-model.trim="levelInfo.remarks" :maxlength="$store.state.levelRemarksMaxLength"></textarea>
				<button-with-icon v-if="editing" icon="/assets/svg/check_black_24dp.svg" class="saveChangesButton" @click="submitChanges">Save changes</button-with-icon>
			</div>
		</div>
		<template v-if="levelInfo.packs.length">
			<h3>Appears in</h3>
			<panel-list mode="pack" :entries="levelInfo.packs" :defaultCount="4" noEntriesNotice="This level doesn't appear in any packs."></panel-list>
		</template>
		<h3 style="margin-bottom: 10px;">Comments ({{ levelInfo.comments.length }})</h3>
		<template v-if="$store.state.loggedInAccount">
			<textarea class="basicTextarea commentBox" placeholder="Write a public comment" v-model.trim="commentInput" maxlength="2000" :class="{ disabled: sendingComment }"></textarea>
			<button-with-icon icon="/assets/svg/comment_black_24dp.svg" class="commentButton" :class="{ disabled: !canComment || sendingComment }" @click="comment">Comment</button-with-icon>
		</template>
		<div>
			<comment-element v-for="comment of levelInfo.comments" :key="comment.id" :commentInfo="comment" @delete="deleteComment(comment.id)"></comment-element>
		</div>
	</template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CommentInfo, ExtendedLevelInfo, Modification, PackInfo } from '../../../shared/types';
import DownloadButton from '../components/DownloadButton.vue';
import ProfileBanner from '../components/ProfileBanner.vue';
import InfoBanner from '../components/InfoBanner.vue';
import PackAdder from '../components/PackAdder.vue';
import PanelList from '../components/PanelList.vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import CommentElement from '../components/CommentElement.vue';
import Loader from '../components/Loader.vue';
import { Util } from '../../ts/util';
import { Search } from '../../ts/search';
import { emitter } from '../../ts/emitter';
import { Head } from '@vueuse/head';
import { db } from '../../../server/ts/globals';
import { MissionDoc, Mission } from '../../../server/ts/mission';

export default defineComponent({
	components: {
		DownloadButton,
		ProfileBanner,
		InfoBanner,
		PackAdder,
		PanelList,
		ButtonWithIcon,
		CommentElement,
		Loader,
		Head
	},
	data() {
		return {
			levelInfo: null as ExtendedLevelInfo,
			editing: false,
			/** Is true when we're currently waiting for the server to delete this level. */
			deleting: false,
			commentInput: '',
			sendingComment: false,
			notFound: false
		};
	},
	async mounted() {
		// Load all the level info
		let id = Number(this.$route.params.id);
		let response = await fetch(`/api/level/${id}/extended-info`);

		if (response.status === 404) {
			this.notFound = true;
			return;
		}

		let levelInfo = await response.json() as ExtendedLevelInfo;
		this.levelInfo = levelInfo;

		// Incase the level search doesn't include this level yet, make it refresh
		Search.checkForRefresh(this.levelInfo.id);
		emitter.on('packUpdate', this.updatePacks);
	},
	async serverPrefetch() {
		let doc = await db.missions.findOne({ _id: Number(this.$route.params.id) }) as MissionDoc;
		if (!doc) {
			this.notFound = true;
			return;
		}
		
		let mission = Mission.fromDoc(doc);
		this.levelInfo = await mission.createExtendedLevelInfo();
	},
	unmounted() {
		emitter.off('packUpdate', this.updatePacks);
	},
	computed: {
		imageSource(): string {
			return `/api/level/${this.levelInfo.id}/image`;
		},
		/** Construct an object of metadata about this level. */
		levelDetails(): Record<string, number | string> {
			let result: Record<string, number | string> = {};

			result["Modification"] = this.prettyModification(this.levelInfo.modification);
			result["Game type"] = this.levelInfo.gameType === 'single'? 'Single-player' : 'Multiplayer';
			if (this.levelInfo.gameMode) result["Game mode"] = this.levelInfo.gameMode.split(' ').map(x => Util.splitWords(x).join(' ')).join(', ');
			result["Gem count"] = this.levelInfo.gems;
			result["Has Easter Egg"] = this.levelInfo.hasEasterEgg? 'Yes' : 'No';

			if (this.levelInfo.qualifyingTime) result["Qualifying time"] = Util.secondsToTimeString(Number(this.levelInfo.qualifyingTime) / 1000);
			if (this.levelInfo.goldTime) result[this.levelInfo.modification === Modification.Platinum? "Platinum time" : "Gold time"] = Util.secondsToTimeString(Number(this.levelInfo.goldTime) / 1000);
			if (this.levelInfo.platinumTime) result["Platinum time"] = Util.secondsToTimeString(Number(this.levelInfo.platinumTime) / 1000);
			if (this.levelInfo.ultimateTime) result["Ultimate time"] = Util.secondsToTimeString(Number(this.levelInfo.ultimateTime) / 1000);
			if (this.levelInfo.awesomeTime) result["Awesome time"] = "🤔";

			return result;
		},
		formattedDate(): string {
			return Util.formatDate(new Date(this.levelInfo.addedAt));
		},
		isOwnLevel(): boolean {
			return !!this.$store.state.loggedInAccount && this.levelInfo.addedBy?.id === this.$store.state.loggedInAccount?.id;
		},
		canComment(): boolean {
			return !!this.commentInput;
		},
		description(): string {
			return Util.linkify(this.levelInfo.desc);
		},
		remarks(): string {
			return Util.linkify(this.levelInfo.remarks);
		}
	},
	methods: {
		/** Turns the modification value into a pretty string. */
		prettyModification(mod: Modification) {
			switch (mod) {
				case Modification.Gold: return 'Gold';
				case Modification.Platinum: return 'Platinum';
				case Modification.Fubar: return 'Fubar';
				case Modification.Ultra: return 'Ultra';
				case Modification.PlatinumQuest: return 'PlatinumQuest';
			}
		},
		async updatePacks() {
			let response = await fetch(`/api/level/${this.levelInfo.id}/packs`);
			let json = await response.json() as PackInfo[];
			
			this.levelInfo.packs = json;
		},
		submitChanges() {
			this.editing = false;

			// Submit the changes to the server
			let token = localStorage.getItem('token');
			fetch(`/api/level/${this.levelInfo.id}/edit`, {
				method: 'PATCH',
				body: JSON.stringify({
					remarks: this.levelInfo.remarks
				}),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});
		},
		async deleteLevel() {
			if (!confirm("Are you sure you want to delete this level? This will also remove it from all packs that currently contain it.")) return;

			this.deleting = true;

			// Do the level delete API call
			let token = localStorage.getItem('token');
			let response = await fetch(`/api/level/${this.levelInfo.id}/delete`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				// Remove the level from all own packs
				for (let pack of this.$store.state.ownPacks) {
					pack.levelIds = pack.levelIds.filter(x => x !== this.levelInfo.id);
				}

				Search.checkForRefresh(-1); // Same hack as the one we use in Pack.vue
				emitter.emit('packView', -1); // Reload all packs

				this.$store.state.nextInfoBannerMessage = `Level "${this.levelInfo.name}" has been deleted successfully.`;
				this.$router.push({ name: 'Profile', params: { id: this.$store.state.loggedInAccount.id } });
			} else {
				this.deleting = false;
				alert("Something went wrong.");
			}
		},
		/** Add a comment to the level. */
		async comment() {
			this.sendingComment = true;

			// Send the comment to the server
			let token = localStorage.getItem('token');
			let response = await fetch(`/api/level/${this.levelInfo.id}/comment`, {
				method: 'POST',
				body: JSON.stringify({
					content: this.commentInput
				}),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});
			let json = await response.json() as CommentInfo[];

			// Reload all of the comments
			this.levelInfo.comments = json;
			this.commentInput = '';
			this.sendingComment = false;
		},
		async deleteComment(commentId: number) {
			if (!confirm("Are you sure you want to delete this comment?")) return;

			let token = localStorage.getItem('token');
			let response = await fetch(`/api/comment/${commentId}/delete`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			let json = await response.json();

			// Reload all of the comments
			this.levelInfo.comments = json;
		}
	}
});
</script>

<style scoped>
.top-part {
	display: flex;
	flex-wrap: wrap-reverse;
}

aside {
	width: 300px;
	margin-right: 40px;
}

@media (max-width: 669px) {
	aside {
		width: 100%;
		margin-right: 0px;
	}
}

.thumbnail {
	width: 100%;
	height: 200px;
	object-fit: cover;
	border-radius: 5px;
	overflow: hidden;
	display: block;
}

.additionalInfo {
	margin: 0;
	margin-top: 5px;
	opacity: 0.75;
	font-size: 14px;
}

h1 {
	margin: 0;
	font-weight: normal;
	font-size: 32px;
	margin-bottom: -5px;
}

h2 {
	margin: 0;
	font-weight: normal;
	font-size: 18px;
}

h3 {
	margin: 0;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 25px;
}

.regularParagraph {
	margin: 0;
}

.detail {
	font-size: 13px;
}

.actions {
	float: right;
	margin-top: -5px;
	position: relative;
}

.actions img {
	opacity: 0.5;
	padding: 5px;
	cursor: pointer;
}

.actions img:hover {
	opacity: 0.75;
}

.packAdder {
	position: absolute;
	top: 30px;
	right: 0px;
	z-index: 1;
}

.remarksInput {
	width: 100%;
	height: 200px;
	margin-bottom: 10px;
}

.saveChangesButton {
	width: 200px;
}

.commentBox {
	width: 100%;
}

.commentButton {
	width: 200px;
	margin-top: 10px;
	margin-bottom: 20px;
}

.notFound {
	text-align: center;
	margin-top: 50px;
}
</style>