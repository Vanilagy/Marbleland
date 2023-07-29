<template :key="$route.path">
	<Head v-if="levelInfo">
		<title v-if="levelInfo">{{ title }} - Marbleland</title>
		<meta name="description" :content="levelInfo.desc">
		<meta name="og:title" :content="title">
		<meta name="og:description" :content="levelInfo.desc">
		<meta name="og:image" :content="origin + `/api/level/${levelInfo.id}/image`">
		<meta name="twitter:card" content="summary_large_image">
		<link rel="preload" href="/assets/svg/favorite_black_24dp.svg" as="image">
	</Head>
	<loader v-if="!levelInfo && !notFound"></loader>
	<p class="notFound" v-if="notFound">This level doesn't exist or has been deleted. :(</p>
	<template v-if="levelInfo" :class="{ disabled: deleting }">
		<info-banner></info-banner>
		<div class="top-part" ref="topPart">
			<aside>
				<img v-if="!imageHidden" :src="imageSource" class="thumbnail" @error="imageHidden = true">
				<div class="buttonContainer">
					<download-button style="flex: 1 1 auto; margin-right: 10px" :id="levelInfo.id" mode="level" @download="incrementDownloads">Download level</download-button>
					<love-button style="flex: 0 1 auto" :levelOrPackInfo="levelInfo"></love-button>
				</div>
				<p class="additionalInfo">
					Downloads: {{ levelInfo.downloads }}<br>
					Loves: {{ levelInfo.lovedCount }}<br>
					Added {{ formatDate(levelInfo.addedAt) }}
					<template v-if="levelInfo.editedAt"><br>Edited {{ formatDate(levelInfo.editedAt) }}</template>
					<span v-if="levelInfo.missesDependencies" style="color: #ff5c7b;"><br>Misses dependencies</span>
					<span v-if="levelInfo.hasCustomCode" style="color: orange"><br>Has custom code</span>
				</p>
				<profile-banner style="margin-top: 10px" v-if="levelInfo.addedBy" :profileInfo="levelInfo.addedBy" secondaryText="Uploader"></profile-banner>
			</aside>
			<div style="flex: 1 1 0px; min-width: 300px; max-width: 660px; margin-bottom: 10px;">
				<div class="actions">
					<img src="/assets/svg/delete_black_24dp.svg" title="Delete level" v-if="hasOwnershipPermissions" @click="showDeleteConfirmation" class="basicIcon">
					<img src="/assets/svg/file_upload_black_24dp.svg" title="Update level" v-if="hasOwnershipPermissions" @click="deleteLevel" class="basicIcon">
					<img src="/assets/svg/edit_black_24dp.svg" title="Edit level" v-if="hasOwnershipPermissions" :class="{ disabled: editing }" @click="editing = true" class="basicIcon">
					<img src="/assets/svg/create_new_folder_black_24dp.svg" title="Add to pack" v-if="$store.state.loggedInAccount" @click="$refs.packAdder.show()" class="basicIcon">
					<pack-adder :levelId="levelInfo.id" class="packAdder" ref="packAdder"></pack-adder>
				</div>
				<template v-if="!editing">
					<h1>{{ levelInfo.name }}</h1>
					<h2 v-if="levelInfo.artist">by {{ levelInfo.artist }}</h2>
					<h3 v-if="levelInfo.desc">Description</h3>
					<p class="regularParagraph description" v-html="description"></p>
					<h3>Details</h3>
					<div class="detail" v-for="(value, name) in levelDetails" :key="name"><b>{{ name }}</b>: {{ value }}</div>
					<h3 v-if="levelInfo.remarks">Remarks</h3>
					<p class="regularParagraph remarks" v-if="levelInfo.remarks" v-html="remarks"></p>
				</template>
				<div v-show="editing" :class="{ disabled: submittingEdit }">
					<h1>Edit metadata</h1>

					<h3>Mission info</h3>
					<div ref="editor" class="missionInfoEditor"></div>
					<p class="missionInfoProblems">{{ missionInfoCodeProblems }}</p>

					<h3>Remarks</h3>
					<textarea class="basicTextarea" v-model.trim="editedRemarks" :maxlength="$store.state.levelRemarksMaxLength"></textarea>

					<div class="editingButtons">
						<button-with-icon icon="/assets/svg/check_black_24dp.svg" @click="submitChanges" :class="{ disabled: missionInfoCodeProblems }">Save changes</button-with-icon>
						<button-with-icon icon="/assets/svg/close_black_24dp.svg" @click="cancelEditing">Cancel</button-with-icon>
					</div>
				</div>
			</div>
		</div>
		<img v-if="levelInfo.hasPrevImage" :src="`/api/level/${levelInfo.id}/prev-image`" class="previewImage">
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

		<Modal ref="deleteConfirmationModal">
			<h2 class="deleteModalHeading">CAUTION: You're about to delete "{{ levelInfo.name }}"</h2>
			<hr />
			<div class="deleteModalBody">
				<p>In the interest of data integrity, <em>we strongly advise against deleting levels</em>. Deleting this level will permanently:</p>
				<ul>
					<li>
						<strong>Invalidate all links</strong> on the Internet referencing this level
					</li>
					<li>
						<strong>Disrupt leaderboard activity</strong> for this level and potentially invalidate all scores or replays
					</li>
					<li>
						<strong>Remove this level from every pack</strong> that purposefully included it
					</li>
					<li>
						<strong>Discard this level's statistics</strong>, including all <strong>{{ levelInfo.downloads }}</strong> downloads and <strong>{{ levelInfo.lovedCount }}</strong> loves
					</li>
				</ul>
				<p>Should you have a newer version of this level that you want to replace it with, use the update feature instead.</p>

				<div class="deleteModalCheckboxContainer">
					<input type="checkbox" id="deleteModelAcknowledgement" class="basicCheckbox" v-model="acknowledgedDeletionConsequences"><label for="deleteModelAcknowledgement" class="notSelectable">
						<em>I understand the consequences of level deletion</em>
					</label>
				</div>
			</div>
			<hr />
			<div class="deleteModalButtons">
				<ButtonWithIcon v-if="acknowledgedDeletionConsequences" class="deleteLevelButton" @click="deleteLevel">
					Delete level
				</ButtonWithIcon>
				<ButtonWithIcon @click="closeDeleteConfirmationModal">
					Cancel
				</ButtonWithIcon>
			</div>
		</Modal>
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
import LoveButton from '../components/LoveButton.vue';
import Loader from '../components/Loader.vue';
import { Util } from '../../ts/util';
import { Search } from '../../ts/search';
import { emitter } from '../../ts/emitter';
import { Head } from '@vueuse/head';
import { db } from '../../../server/ts/globals';
import { MissionDoc, Mission } from '../../../server/ts/mission';
import { ORIGIN, MUTABLE_MISSION_INFO_FIELDS } from '../../../shared/constants';
import { CodeJar } from "codejar";
import { guessGameType, guessModification } from "../../../shared/classification";
import Modal from '../components/Modal.vue';

const COUNT_DOWN_MODES = ['collection', 'elimination', 'gemMadness', 'ghosts', 'hunt', 'king', 'mega', 'party', 'props', 'seek', 'snowball', 'snowballsOnly', 'spooky', 'steal', 'tag', 'training'];

const MISSION_INFO_REGEX = /((?:[a-zA-Z]|\$|_)(?:\w|\d|\$|_)*)( *= *)("((?:[^"\\\n]|\\.)*)")( *;)/g;

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
		Head,
		LoveButton,
		Modal
	},
	data() {
		return {
			levelInfo: null as ExtendedLevelInfo,
			editing: false,
			submittingEdit: false,
			/** Is true when we're currently waiting for the server to delete this level. */
			deleting: false,
			commentInput: '',
			sendingComment: false,
			notFound: false,
			imageHidden: false,
			editedRemarks: '',
			editedMissionInfo: null as Record<string, string>,
			missionInfoCode: '',
			editor: null as CodeJar,
			missionInfoCodeProblems: '',
			hasDownloaded: false,
			acknowledgedDeletionConsequences: false
		};
	},
	async mounted() {
		if (this.$store.state.levelPreload) {
			this.levelInfo = this.$store.state.levelPreload;
			this.$store.state.levelPreload = null;
		} else {
			// Load all the level info
			let id = Number(this.$route.params.id);
			let response = await fetch(`/api/level/${id}/extended-info`);

			if (response.status === 404) {
				this.notFound = true;
				return;
			}

			let levelInfo = await response.json() as ExtendedLevelInfo;
			this.levelInfo = levelInfo;
		}

		// Incase the level search doesn't include this level yet, make it refresh
		Search.checkForRefresh(this.levelInfo.id);
		emitter.on('packUpdate', this.updatePacks);

		this.setMissionInfoCode();
		this.editedRemarks = this.levelInfo.remarks;

		// Do nextTick because the ref will only be there once the DOM populates
		this.$nextTick(() => {
			if (!(this.$refs as any).editor) return;

			// Create the small code editor for MissionInfo
			let jar = CodeJar((this.$refs as any).editor, editor => {
				let code = editor.innerHTML;

				// Perform primitive syntax highlighting
				MISSION_INFO_REGEX.lastIndex = 0;
				let highlightedHtml = code.replace(MISSION_INFO_REGEX, `<span style="color: #4d9fd1;">$1</span>$2<span style="color: #ff8d00;">$3</span>$5`);

				editor.innerHTML = highlightedHtml;
			});

			this.editor = jar;
			jar.updateCode(this.missionInfoCode);
			jar.onUpdate(code => this.onMissionInfoCodeChange(code));
		});
	},
	beforeUnmount() {
		this.editor?.destroy();
	},
	async serverPrefetch() {
		let doc = await db.missions.findOne({ _id: Number(this.$route.params.id) }) as MissionDoc;
		if (!doc) {
			this.notFound = true;
			return;
		}
		
		let mission = Mission.fromDoc(doc);
		this.levelInfo = await mission.createExtendedLevelInfo(this.$store.state.loggedInAccount?.id);

		this.$store.state.levelPreload = this.levelInfo;
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
			result["Game type"] = this.levelInfo.gameType === 'single'? 'Singleplayer' : 'Multiplayer';
			if (this.levelInfo.gameMode && this.levelInfo.gameMode !== 'null')
				result["Game mode"] = this.levelInfo.gameMode.split(' ').filter(x => x !== 'null').map(x => Util.splitWords(x).join(' ')).join(', ');
			result["Gem count"] = this.levelInfo.gems;
			result["Has Easter Egg"] = this.levelInfo.hasEasterEgg? 'Yes' : 'No';

			let timeName = this.levelInfo.gameMode?.split(' ').some(x => COUNT_DOWN_MODES.includes(x))? 'Time' : 'Qualifying time';

			if (this.levelInfo.qualifyingTime) result[timeName] = Util.secondsToTimeString(Number(this.levelInfo.qualifyingTime) / 1000);
			if (this.levelInfo.goldTime) result[this.levelInfo.modification === Modification.Platinum? "Platinum time" : "Gold time"] = Util.secondsToTimeString(Number(this.levelInfo.goldTime) / 1000);
			if (this.levelInfo.platinumTime) result["Platinum time"] = Util.secondsToTimeString(Number(this.levelInfo.platinumTime) / 1000);
			if (this.levelInfo.ultimateTime) result["Ultimate time"] = Util.secondsToTimeString(Number(this.levelInfo.ultimateTime) / 1000);
			if (this.levelInfo.awesomeTime) result["Awesome time"] = "🤔";

			if (this.levelInfo.qualifyingScore) result["Par score"] = this.levelInfo.qualifyingScore;
			if (this.levelInfo.goldScore) result["Gold score"] = this.levelInfo.goldScore;
			if (this.levelInfo.platinumScore) result["Platinum score"] = this.levelInfo.platinumScore;
			if (this.levelInfo.ultimateScore) result["Ultimate score"] = this.levelInfo.ultimateScore;
			if (this.levelInfo.awesomeScore) result["Awesome score"] = "🤔";

			return result;
		},
		hasOwnershipPermissions(): boolean {
			return !!this.$store.state.loggedInAccount && (this.levelInfo.addedBy?.id === this.$store.state.loggedInAccount?.id || this.$store.state.loggedInAccount.isModerator);
		},
		canComment(): boolean {
			return !!this.commentInput;
		},
		description(): string {
			return Util.linkify(this.levelInfo.desc);
		},
		remarks(): string {
			return Util.linkify(this.levelInfo.remarks);
		},
		title(): string {
			return this.levelInfo.name + (this.levelInfo.artist? ' by ' + this.levelInfo.artist : '');
		},
		origin(): string {
			return ORIGIN;
		},
		isLoggedIn(): boolean {
			return !!this.$store.state.loggedInAccount
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
		async submitChanges() {
			this.submittingEdit = true;

			// Submit the changes to the server and wait for the response
			let response = await fetch(`/api/level/${this.levelInfo.id}/edit`, {
				method: 'PATCH',
				body: JSON.stringify({
					missionInfo: this.editedMissionInfo,
					remarks: this.editedRemarks ?? null
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			this.submittingEdit = false;

			if (response.ok) {				
				let json = await response.json() as ExtendedLevelInfo;

				this.editedMissionInfo = null;
				this.editing = false;
				this.levelInfo = json; // Update level info
				this.hasDownloaded = false; // Allow the download count to increase again

				// Show a small animation
				let element = this.$refs.topPart as HTMLDivElement;;
				element.style.animation = 'none';
				element.clientWidth; // Force layout
				element.style.animation = '0.5s ease-out edit-succeed';

				document.documentElement.scrollTop = 0;
			} else {
				alert("Level edit failed. Consult an admin for details.");;
			}
		},
		cancelEditing() {
			this.editing = false;

			this.editedRemarks = this.levelInfo.remarks;
			this.missionInfoCodeProblems = '';
			this.setMissionInfoCode(); // Reset this boy
			this.editor.updateCode(this.missionInfoCode);
		},
		showDeleteConfirmation() {
			if (this.levelInfo.downloads < 5 && confirm("Are you sure you want to delete this level?")) {
				// If the level hasn't been downloaded much (and probably is new), don't go too overboard with the warnings
				this.deleteLevel();
			} else {
				this.acknowledgedDeletionConsequences = false;
				(this.$refs.deleteConfirmationModal as any).show();
			}
		},
		closeDeleteConfirmationModal() {
			(this.$refs.deleteConfirmationModal as any).hide();
		},
		async deleteLevel() {
			this.closeDeleteConfirmationModal();
			this.deleting = true;

			// Do the level delete API call
			let response = await fetch(`/api/level/${this.levelInfo.id}/delete`, {
				method: 'DELETE'
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
			let response = await fetch(`/api/level/${this.levelInfo.id}/comment`, {
				method: 'POST',
				body: JSON.stringify({
					content: this.commentInput
				}),
				headers: {
					'Content-Type': 'application/json'
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

			let response = await fetch(`/api/comment/${commentId}/delete`, {
				method: 'DELETE'
			});
			let json = await response.json();

			// Reload all of the comments
			this.levelInfo.comments = json;
		},
		/** Generates the code that represents the MissionInfo object. */
		setMissionInfoCode() {
			this.missionInfoCode = '';

			for (let key of Object.keys(this.levelInfo.missionInfo).sort()) {
				this.missionInfoCode += `${key} = ${JSON.stringify('' + this.levelInfo.missionInfo[key])};\n`;
			}
		},
		/** Verify and process the modified MissionInfo code. */
		onMissionInfoCodeChange(code: string) {
			MISSION_INFO_REGEX.lastIndex = 0;

			// We first check if the code is syntactically correct by seeing if there are any non-whitespace residuals when we strip out all regex matches:
			let withoutMatches = code.replace(MISSION_INFO_REGEX, '');
			if (withoutMatches.trim()) {
				this.missionInfoCodeProblems = `MissionInfo code has syntactical errors. It must follow the following pattern: key1 = "value1"; key2 = "value2"; ...`;
				return;
			}

			this.missionInfoCodeProblems = '';

			// Parse the code into an object
			let obj: Record<string, string> = {};
			MISSION_INFO_REGEX.lastIndex = 0;
			let match: RegExpExecArray;
			while ((match = MISSION_INFO_REGEX.exec(code)) !== null) {
				obj[match[1].toLowerCase()] = JSON.parse(match[3]);
			}

			let problems: string[] = [];
			if (!obj.name) problems.push(`MissionInfo is missing "name".`);
			if (!obj.artist) problems.push(`MissionInfo is missing "artist".`);

			// Check for changed immutable properties
			for (let key of new Set([...Object.keys(obj), ...Object.keys(this.levelInfo.missionInfo)])) {
				if (obj[key] !== this.levelInfo.missionInfo[key] && !MUTABLE_MISSION_INFO_FIELDS.includes(key)) {
					problems.push(`Property "${key}" is not allowed to change. (was: ${this.levelInfo.missionInfo[key]})`); // Yes this can print "undefined" and it's actually intended!
				}
			}

			// Test if the mission gets classified differently than before with the new MissionInfo (not allowed!)
			let fakeRelativePath = this.levelInfo.gameType === 'multi' ? 'multiplayer/' : '';
			let gameType = guessGameType(obj as any, fakeRelativePath, this.levelInfo.dependencies);
			let modification = guessModification(obj as any, this.levelInfo.hasEasterEgg, this.levelInfo.dependencies);

			if (gameType !== this.levelInfo.gameType)
				problems.push(`The changes to MissionInfo would reclassify this level to have a different game type, which is disallowed.`);
			if (modification !== this.levelInfo.modification)
				problems.push(`The changes to MissionInfo would reclassify this level to have a different modification, which is disallowed.`);

			// Display all the problems
			if (problems.length > 0) {
				this.missionInfoCodeProblems = "There are problems with your changes to MissionInfo:\n\n" + problems.map(x => '- ' + x).join('\n');
			}

			this.editedMissionInfo = obj;
		},
		formatDate(time: number) {
			let date = new Date(time);
			let hours = ('00' + date.getHours()).slice(-2);
			let minutes = ('00' + date.getMinutes()).slice(-2);

			return `on ${Util.formatDate(date)} at ${hours}:${minutes}`;
		},
		incrementDownloads() {
			if (this.hasDownloaded) return;

			// Note that the count might not always be 100% matching due to IP timeouts on the server
			this.levelInfo.downloads++;
			this.hasDownloaded = true;
		}
	},
	watch: {
		isLoggedIn() {
			if (this.levelInfo) this.levelInfo.lovedByYou = false;
		}
	}
});
</script>

<style scoped>
.top-part {
	display: flex;
	flex-wrap: wrap-reverse;
}

.top-part textarea {
	width: 100%;
}

aside {
	width: 300px;
	margin-right: 40px;
}

@media (max-width: 686px) {
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
	background: var(--background-1);
}

.previewImage {
	display: block;
	width: 100%;
	height: 200px;
	object-fit: cover;
	border-radius: 5px;
	margin-top: 20px;
	overflow: hidden;
	background: var(--background-1);
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

.description {
	white-space: pre-wrap;
	overflow-wrap: break-word;
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

.remarks {
	white-space: pre-wrap;
	overflow-wrap: break-word;
}

.editingButtons {
	display: flex;
	margin-top: 20px;
}

.editingButtons > div {
	width: 200px;
	margin-right: 10px;
}

.editingButtons > div:nth-child(2) {
	width: 120px;
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

.buttonContainer {
	display: flex;
	width: 100%;
	margin-top: 10px;
}

.missionInfoEditor {
	padding: 10px;
	font-family: monospace;
	background: var(--background-1);
	border-radius: 10px;
	font-size: 14px;
	width: 100%;
	box-sizing: border-box;
	max-height: 310px;
}

.missionInfoProblems {
	margin: 0;
	margin-top: 5px;
	font-size: 13px;
	color: crimson;
	font-weight: bold;
	white-space: pre-wrap;
}

.deleteModalHeading {
	text-align: center;
	color: crimson;
	margin-bottom: 10px;
}

.deleteModalBody {
	font-size: 14px;
	margin-bottom: 10px;
}

.deleteModalCheckboxContainer {
	display: flex;
	align-items: center;
	gap: 10px;
}

.deleteModalButtons {
	display: flex;
	gap: 10px;
}

.deleteLevelButton {
	background: crimson !important;
	color: white !important;
}
.deleteLevelButton:hover {
	border-color: rgb(218, 76, 105) !important;
}
.deleteLevelButton:active {
	background: rgb(218, 76, 105) !important;
}
</style>

<style>
@keyframes edit-succeed {
	0% { transform: scale(1.1); }
	100% { transform: scale(1.0); }
}
</style>