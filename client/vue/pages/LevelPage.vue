<template :key="$route.path">
	<Head v-if="levelInfo">
		<title v-if="levelInfo">{{ title }} - Marbleland</title>
		<meta name="description" :content="levelInfo.desc">
		<meta name="og:title" :content="title">
		<meta name="og:description" :content="levelInfo.desc">
		<meta name="og:image" :content="ORIGIN + `/api/level/${levelInfo.id}/image?version=${levelInfo.currentVersion ?? 1}`">
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
					<download-button style="flex: 1 1 auto; margin-right: 10px" :id="levelInfo.id" :version="isLatestVersion ? undefined : viewedVersion" mode="level" @download="incrementDownloads">Download level{{ isLatestVersion ? '' : ` (v${viewedVersion})` }}</download-button>
					<love-button style="flex: 0 1 auto" :levelOrPackInfo="levelInfo"></love-button>
				</div>
				<div v-if="isLatestVersion && levelInfo.playInfo.length > 0" class="buttonContainer">
					<play-button :playInfo="levelInfo.playInfo" style="flex: 1 1 auto;" :id="levelInfo.id" mode="level" @download="incrementDownloads">Play level</play-button>
				</div>
				<p class="additionalInfo">
					Downloads: {{ levelInfo.downloads }}<br>
					Loves: {{ levelInfo.lovedCount }}<br>
					Added {{ formatDate(levelInfo.addedAt) }}
					<template v-if="levelInfo.editedAt"><br>Last edited {{ formatDate(levelInfo.editedAt) }}</template>
					<template v-if="viewedVersion > 1"><br>v{{ viewedVersion }} added {{ formatDate(viewedAddedAt) }}</template>
					<span v-if="levelInfo.missesDependencies" style="color: #ff5c7b;"><br>Misses dependencies</span>
					<span v-if="viewedContent.hasCustomCode" style="color: orange"><br>Has custom code</span>
				</p>
				<div v-if="isCurator" class="curationPanel">
					<h3 @click="curatorDetailsModal.show();" class="curatorScore">Curator score</h3>

					<div class="voteContainer">
						<button-with-icon icon="/assets/svg/expand_more_black_24dp.svg" noMargin class="voteBtn up" :class="{ active: levelInfo.yourVote === true, disabled: isOwnLevel }" @click="submitVote(true)" title="This level demonstrates creative effort."></button-with-icon>
						<span class="score" :class="{ positive: (levelInfo.curationScore || 0) > 0, negative: (levelInfo.curationScore || 0) < 0 }">
							{{ levelInfo.curationScore || 0 }}
						</span>
						<button-with-icon icon="/assets/svg/expand_more_black_24dp.svg" noMargin class="voteBtn down" :class="{ active: levelInfo.yourVote === false, disabled: isOwnLevel }"  @click="submitVote(false)" title="This level does not demonstrate creative effort."></button-with-icon>
					</div>

					<p class="aboutCuratorScore" @click="$router.push('/about-curator-scores')">About curator scores</p>
				</div>
				<profile-banner style="margin-top: 10px" v-if="levelInfo.addedBy" :profileInfo="levelInfo.addedBy" secondaryText="Uploader"></profile-banner>
			</aside>
			<div style="flex: 1 1 0px; min-width: 300px; max-width: 660px; margin-bottom: 10px;">
				<div class="actions">
					<img v-if="levelInfo.leaderboardInfo.length > 0" :src="showLBs ? '/assets/svg/info_24dp_FILL0_wght400_GRAD0_opsz24 (1).svg' : '/assets/svg/bar_chart_24dp.svg'" :title="showLBs ? 'Show level info' : 'Show leaderboards'" @click="toggleLBs" class="basicIcon">
					<img src="/assets/svg/delete_black_24dp.svg" title="Delete level" v-if="hasOwnershipPermissions" :class="{ disabled: !isLatestVersion }" @click="showDeleteConfirmation" class="basicIcon">
					<img src="/assets/svg/file_upload_black_24dp.svg" title="Update level" v-if="hasOwnershipPermissions" :class="{ disabled: !isLatestVersion }" @click="updateLevel" class="basicIcon">
					<img src="/assets/svg/edit_black_24dp.svg" title="Edit level" v-if="hasOwnershipPermissions" :class="{ disabled: editing || !isLatestVersion }" @click="editing = true" class="basicIcon">
					<img src="/assets/svg/create_new_folder_black_24dp.svg" title="Add to pack" v-if="$store.state.loggedInAccount && !$store.state.loggedInAccount.isSuspended" :class="{ disabled: !isLatestVersion }" @click="packAdder.show()" class="basicIcon">
					<pack-adder :levelId="levelInfo.id" class="packAdder" ref="packAdder"></pack-adder>
				</div>
				<template v-if="!editing">
					<h1>{{ viewedContent.name }}<span v-if="hasMultipleVersions" class="versionBadge notSelectable" :class="{ outdated: !isLatestVersion }" title="This level has multiple versions">
						<span class="versionChevron" :class="{ inactive: viewedVersion === 1 }" title="View previous version" @click="cycleVersion(-1)">‹</span>
						<span>v{{ viewedVersion }}</span>
						<span class="versionChevron" :class="{ inactive: isLatestVersion }" title="View next version" @click="cycleVersion(1)">›</span>
					</span></h1>
					<h2 v-if="viewedContent.artist">by {{ viewedContent.artist }}</h2>
					<template v-if="!showLBs">
						<h3 v-if="viewedContent.desc">Description</h3>
						<p class="regularParagraph description" v-html="description"></p>
						<h3>Details</h3>
						<div class="detail" v-for="(value, name) in levelDetails" :key="name"><b>{{ name }}</b>: {{ value }}</div>
						<h3 v-if="levelInfo.remarks">Remarks</h3>
						<p class="regularParagraph remarks" v-if="levelInfo.remarks" v-html="remarks"></p>
						<h3 v-if="viewedChangelog">Changes from v{{ viewedVersion - 1 }}</h3>
						<p class="regularParagraph remarks" v-if="viewedChangelog" v-html="linkifiedChangelog"></p>
					</template>
					<template v-if="showLBs">
						<h3>Leaderboards</h3>
						<div class="lbButtonContainer">
							<div class="lbButton notSelectable" v-for="lb in levelInfo.leaderboardInfo" :key="lb.id" :class="{ selected: lb === currentLBs}" @click="setLeaderboards(lb)">{{ lb.name }}</div>
						</div>
						<level-leaderboards :scores="currentLeaderboardScores" :status="lbStatusMessage"/>
					</template>
				</template>
				<div v-show="editing" :class="{ disabled: submittingEdit }">
					<h1>Edit metadata</h1>

					<h3>Mission info</h3>
					<div ref="editor" class="missionInfoEditor"></div>
					<p class="missionInfoProblems">{{ missionInfoCodeProblems }}</p>

					<h3>Remarks</h3>
					<textarea class="basicTextarea" v-model.trim="editedRemarks" :maxlength="LEVEL_REMARKS_MAX_LENGTH"></textarea>

					<div class="editingButtons">
						<button-with-icon icon="/assets/svg/check_black_24dp.svg" @click="submitChanges" :class="{ disabled: missionInfoCodeProblems }">Save changes</button-with-icon>
						<button-with-icon icon="/assets/svg/close_black_24dp.svg" @click="cancelEditing">Cancel</button-with-icon>
					</div>
				</div>
			</div>
		</div>
		<img v-if="levelInfo.hasPrevImage && !prevImageHidden" :src="`/api/level/${levelInfo.id}/prev-image?version=${viewedVersion}`" class="previewImage" @error="prevImageHidden = true">
		<template v-if="levelInfo.packs.length">
			<h3>Appears in</h3>
			<panel-list mode="pack" :entries="levelInfo.packs" :defaultCount="4" noEntriesNotice="This level doesn't appear in any packs."></panel-list>
		</template>
		<h3 style="margin-bottom: 10px;">Comments ({{ levelInfo.comments.length }})</h3>
		<template v-if="$store.state.loggedInAccount && !$store.state.loggedInAccount.isSuspended">
			<textarea class="basicTextarea commentBox" placeholder="Write a public comment" v-model.trim="commentInput" :maxlength="COMMENT_MAX_LENGTH" :class="{ disabled: sendingComment }"></textarea>
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
		<Modal ref="curatorDetailsModal">
			<h2 style="text-align: center; margin-bottom: 5px;">Curator Votes</h2>
			<hr style="margin-bottom: 0px;"/>
			<div class="voteDetailsList">
				<div>
					<h3 class="voteHeader up">Upvoted by:</h3>
					<profile-banner v-for="curator in upvoters" :key="curator.id" :profileInfo="curator"style="margin-bottom: 10px"></profile-banner>
				</div>
				<div>
					<h3 class="voteHeader down">Downvoted by:</h3>
					<profile-banner v-for="curator in downvoters" :key="curator.id" :profileInfo="curator"style="margin-bottom: 10px"></profile-banner>
				</div>
			</div>
			<hr />
			<div style="display: flex; justify-content: flex-end;">
				<ButtonWithIcon @click="curatorDetailsModal.hide()">Close</ButtonWithIcon>
			</div>
		</Modal>
	</template>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, onServerPrefetch, onUnmounted, ref, useTemplateRef, watch, type WatchHandle } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CommentInfo, ExtendedLevelInfo, LevelContentInfo, ReducedLeaderboardDefinition, LeaderboardScore, Modification, PackInfo, ProfileInfo } from '../../../shared/types';
import DownloadButton from '../components/DownloadButton.vue';
import PlayButton from '../components/PlayButton.vue';
import ProfileBanner from '../components/ProfileBanner.vue';
import InfoBanner from '../components/InfoBanner.vue';
import PackAdder from '../components/PackAdder.vue';
import PanelList from '../components/PanelList.vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import CommentElement from '../components/CommentElement.vue';
import LoveButton from '../components/LoveButton.vue';
import Loader from '../components/Loader.vue';
import LevelLeaderboards from '../components/LevelLeaderboards.vue';
import { Util } from '../../ts/util';
import { Search } from '../../ts/search';
import { useStore } from '../../ts/store';
import { Head } from '@unhead/vue/components';
import { db } from '../../../server/ts/globals';
import { MissionDoc, Mission } from '../../../server/ts/mission';
import { ORIGIN, MUTABLE_MISSION_INFO_FIELDS, COMMENT_MAX_LENGTH, LEVEL_REMARKS_MAX_LENGTH } from '../../../shared/constants';
import type { CodeJar } from "codejar";
import { guessGameType, guessModification } from "../../../shared/classification";
import Modal from '../components/Modal.vue';

const COUNT_DOWN_MODES = ['collection', 'elimination', 'gemMadness', 'ghosts', 'hunt', 'king', 'mega', 'party', 'props', 'seek', 'snowball', 'snowballsOnly', 'spooky', 'steal', 'tag', 'training'];

const MISSION_INFO_REGEX = /((?:[a-zA-Z]|\$|_)(?:\w|\d|\$|_)*)( *= *)("((?:[^"\\\n]|\\.)*)")( *;)/g;

const store = useStore();
const route = useRoute();
const router = useRouter();
const topPart = useTemplateRef<HTMLDivElement>('topPart');
const editorElement = useTemplateRef<HTMLDivElement>('editor');
const packAdder = useTemplateRef<InstanceType<typeof PackAdder>>('packAdder');
const deleteConfirmationModal = useTemplateRef<InstanceType<typeof Modal>>('deleteConfirmationModal');
const curatorDetailsModal = useTemplateRef<InstanceType<typeof Modal>>('curatorDetailsModal');

const levelInfo = ref<ExtendedLevelInfo>(null);
const editing = ref(false);
const showLBs = ref(false);
const submittingEdit = ref(false);
/** Is true when we're currently waiting for the server to delete this level. */
const deleting = ref(false);
const commentInput = ref('');
const sendingComment = ref(false);
const notFound = ref(false);
const imageHidden = ref(false);
const prevImageHidden = ref(false);
/** The version number the user has cycled to, or null if they haven't cycled (meaning the current version is shown). */
const selectedVersion = ref<number>(null);
const editedRemarks = ref('');
let editedMissionInfo: Record<string, string> = null;
let missionInfoCode = '';
let codeJar: CodeJar = null;
const missionInfoCodeProblems = ref('');
let hasDownloaded = false;
const acknowledgedDeletionConsequences = ref(false);
const currentLBs = ref<ReducedLeaderboardDefinition>(null);
const currentLeaderboardScores = ref<LeaderboardScore[]>([]);
let lbUpdateToken = 0;
const lbStatusMessage = ref('');
let stopWatchingPackLevels: WatchHandle = null;

onMounted(async () => {
	if (store.state.levelPreload) {
		levelInfo.value = store.state.levelPreload;
		store.state.levelPreload = null;
	} else {
		// Load all the level info
		let id = Number(route.params.id);
		let response = await fetch(`/api/level/${id}/extended-info`);

		if (response.status === 404) {
			notFound.value = true;
			return;
		}

		let json = await response.json() as ExtendedLevelInfo;
		levelInfo.value = json;
	}
	if (store.state.leaderboardsPreload) {
		currentLeaderboardScores.value = store.state.leaderboardsPreload;
		currentLBs.value = levelInfo.value.leaderboardInfo[0] ?? null;
		store.state.leaderboardsPreload = null;
	} else {
		if (levelInfo.value.leaderboardInfo.length > 0) {
			await setLeaderboards(levelInfo.value.leaderboardInfo[0]);
		}
	}

	// Incase the level search doesn't include this level yet, make it refresh
	Search.checkForRefresh(levelInfo.value.id);

	// Any pack changing might change which packs this level appears in. Created only now that the level is loaded, so it's
	// not bound to the component and has to be stopped manually.
	stopWatchingPackLevels = watch(() => store.state.packLevelIds, updatePacks, { deep: true });

	setMissionInfoCode();
	editedRemarks.value = levelInfo.value.remarks;

	// CodeJar touches the DOM on import, so it can only be loaded here on the client
	const { CodeJar } = await import('codejar');

	// Do nextTick because the ref will only be there once the DOM populates
	nextTick(() => {
		if (!editorElement.value) return;

		// Create the small code editor for MissionInfo
		let jar = CodeJar(editorElement.value, editor => {
			let code = editor.innerHTML;

			// Perform primitive syntax highlighting
			MISSION_INFO_REGEX.lastIndex = 0;
			let highlightedHtml = code.replace(MISSION_INFO_REGEX, `<span style="color: #4d9fd1;">$1</span>$2<span style="color: #ff8d00;">$3</span>$5`);

			editor.innerHTML = highlightedHtml;
		});

		codeJar = jar;
		jar.updateCode(missionInfoCode);
		jar.onUpdate(code => onMissionInfoCodeChange(code));
	});
});
onBeforeUnmount(() => {
	codeJar?.destroy();
});
onServerPrefetch(async () => {
	let doc = await db.missions.findOneAsync({ _id: Number(route.params.id) }) as MissionDoc;
	if (!doc) {
		notFound.value = true;
		return;
	}

	let mission = Mission.fromDoc(doc);
	levelInfo.value = await mission.createExtendedLevelInfo(store.state.loggedInAccount?.id);

	store.state.levelPreload = levelInfo.value;
});
onUnmounted(() => {
	stopWatchingPackLevels?.(); // Never started if the level doesn't exist
});

const imageSource = computed(() => {
	return `/api/level/${levelInfo.value.id}/image?version=${viewedVersion.value}`;
});
/** The version number currently being viewed. */
const viewedVersion = computed(() => {
	return selectedVersion.value ?? levelInfo.value.currentVersion ?? 1;
});
/** The content of the version currently being viewed. The level info itself doubles as the current version's content. */
const viewedContent = computed((): LevelContentInfo => {
	if (isLatestVersion.value) return levelInfo.value;
	return levelInfo.value.previousVersions[viewedVersion.value - 1] ?? levelInfo.value;
});
/** When the currently viewed version was added. */
const viewedAddedAt = computed(() => {
	// versionMetadata[n] describes version n+2; the first version was added at the level's addedAt
	return levelInfo.value.versionMetadata?.[viewedVersion.value - 2]?.addedAt ?? levelInfo.value.addedAt;
});
/** The changelog of the currently viewed version. Empty for the first version. */
const viewedChangelog = computed(() => {
	return levelInfo.value.versionMetadata?.[viewedVersion.value - 2]?.changelog ?? '';
});
const isLatestVersion = computed(() => {
	return viewedVersion.value === (levelInfo.value.currentVersion ?? 1);
});
const hasMultipleVersions = computed(() => {
	return (levelInfo.value.previousVersions?.length ?? 0) > 0;
});
/** Construct an object of metadata about the currently viewed version of this level. */
const levelDetails = computed(() => {
	let result: Record<string, number | string> = {};
	let info = viewedContent.value;

	result["Modification"] = prettyModification(info.modification);
	result["Game type"] = info.gameType === 'single'? 'Singleplayer' : 'Multiplayer';
	if (info.gameMode && info.gameMode !== 'null')
		result["Game mode"] = info.gameMode.split(' ').filter(x => x !== 'null').map(x => Util.splitWords(x).join(' ')).join(', ');
	result["Gem count"] = info.gems;
	result["Has Easter Egg"] = info.hasEasterEgg? 'Yes' : 'No';

	let timeName = info.gameMode?.split(' ').some(x => COUNT_DOWN_MODES.includes(x))? 'Time' : 'Qualifying time';

	if (info.qualifyingTime) result[timeName] = Util.secondsToTimeString(Number(info.qualifyingTime) / 1000);
	if (info.goldTime) result[info.modification === Modification.Platinum? "Platinum time" : "Gold time"] = Util.secondsToTimeString(Number(info.goldTime) / 1000);
	if (info.platinumTime) result["Platinum time"] = Util.secondsToTimeString(Number(info.platinumTime) / 1000);
	if (info.ultimateTime) result["Ultimate time"] = Util.secondsToTimeString(Number(info.ultimateTime) / 1000);
	if (info.awesomeTime) result["Awesome time"] = "🤔";

	if (info.qualifyingScore) result["Par score"] = info.qualifyingScore;
	if (info.goldScore) result["Gold score"] = info.goldScore;
	if (info.platinumScore) result["Platinum score"] = info.platinumScore;
	if (info.ultimateScore) result["Ultimate score"] = info.ultimateScore;
	if (info.awesomeScore) result["Awesome score"] = "🤔";

	return result;
});
const hasOwnershipPermissions = computed(() => {
	return !!store.state.loggedInAccount && (levelInfo.value.addedBy?.id === store.state.loggedInAccount?.id || store.state.loggedInAccount.isModerator);
});
const canComment = computed(() => {
	return !!commentInput.value;
});
const description = computed(() => {
	return Util.linkify(viewedContent.value.desc);
});
const remarks = computed(() => {
	return Util.linkify(levelInfo.value.remarks);
});
const linkifiedChangelog = computed(() => {
	return Util.linkify(viewedChangelog.value);
});
const title = computed(() => {
	return levelInfo.value.name + (levelInfo.value.artist? ' by ' + levelInfo.value.artist : '');
});
const isLoggedIn = computed(() => {
	return !!store.state.loggedInAccount
});
const isCurator = computed(() => {
	const acc = store.state.loggedInAccount;
	return !!acc && acc.isCurator;
});
const isOwnLevel = computed(() => {
	const acc = store.state.loggedInAccount;
	return !!acc && levelInfo.value.addedBy?.id === acc.id;
});
const upvoters = computed((): ProfileInfo[] => {
	return (levelInfo.value.curatorVotes || []).filter(v => v.vote === true).map(v => v.profile);
});
const downvoters = computed((): ProfileInfo[] => {
	return (levelInfo.value.curatorVotes || []).filter(v => v.vote === false).map(v => v.profile);
});

/** Turns the modification value into a pretty string. */
const prettyModification = (mod: Modification) => {
	switch (mod) {
		case Modification.Gold: return 'Gold';
		case Modification.Platinum: return 'Platinum';
		case Modification.Fubar: return 'Fubar';
		case Modification.Ultra: return 'Ultra';
		case Modification.PlatinumQuest: return 'PlatinumQuest';
	}
};
const updatePacks = async () => {
	let response = await fetch(`/api/level/${levelInfo.value.id}/packs`);
	let json = await response.json() as PackInfo[];

	levelInfo.value.packs = json;
};
const submitChanges = async () => {
	submittingEdit.value = true;

	// Submit the changes to the server and wait for the response
	let response = await fetch(`/api/level/${levelInfo.value.id}/edit`, {
		method: 'PATCH',
		body: JSON.stringify({
			missionInfo: editedMissionInfo,
			remarks: editedRemarks.value ?? null
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	submittingEdit.value = false;

	if (response.ok) {
		let json = await response.json() as ExtendedLevelInfo;

		editedMissionInfo = null;
		editing.value = false;
		levelInfo.value = json; // Update level info
		hasDownloaded = false; // Allow the download count to increase again

		// Show a small animation
		let element = topPart.value;
		element.style.animation = 'none';
		element.clientWidth; // Force layout
		element.style.animation = '0.5s ease-out edit-succeed';

		document.documentElement.scrollTop = 0;
	} else {
		alert("Level edit failed. Consult an admin for details.");
	}
};
const cancelEditing = () => {
	editing.value = false;

	editedRemarks.value = levelInfo.value.remarks;
	missionInfoCodeProblems.value = '';
	setMissionInfoCode(); // Reset this boy
	codeJar.updateCode(missionInfoCode);
};
const showDeleteConfirmation = () => {
	if (levelInfo.value.downloads < 5 && confirm("Are you sure you want to delete this level?")) {
		// If the level hasn't been downloaded much (and probably is new), don't go too overboard with the warnings
		deleteLevel();
	} else {
		acknowledgedDeletionConsequences.value = false;
		deleteConfirmationModal.value.show();
	}
};
const closeDeleteConfirmationModal = () => {
	deleteConfirmationModal.value.hide();
};
const updateLevel = async () => {
	router.push({ name: 'Upload', query: { 'update-id': levelInfo.value.id } });
};
/** Cycles the viewed version by the given delta (clamped to the range of existing versions). */
const cycleVersion = (delta: number) => {
	let target = viewedVersion.value + delta;
	if (target < 1 || target > (levelInfo.value.currentVersion ?? 1)) return;

	selectedVersion.value = target;
	imageHidden.value = false;
	prevImageHidden.value = false;
};
const deleteLevel = async () => {
	closeDeleteConfirmationModal();
	deleting.value = true;

	// Do the level delete API call
	let response = await fetch(`/api/level/${levelInfo.value.id}/delete`, {
		method: 'DELETE'
	});

	if (response.ok) {
		// Remove the level from all own packs
		for (let pack of store.state.ownPacks) {
			pack.levelIds = pack.levelIds.filter(x => x !== levelInfo.value.id);
		}

		Search.checkForRefresh(-1); // Hack: Pretend that we're checking for a level with an ID that for sure won't exist, forcing the level search to re-fetch
		store.state.packListVersion++; // Reload all packs

		store.state.nextInfoBannerMessage = `Level "${levelInfo.value.name}" has been deleted successfully.`;
		router.push({ name: 'Profile', params: { id: store.state.loggedInAccount.id } });
	} else {
		deleting.value = false;
		alert("Something went wrong.");
	}
};
/** Add a comment to the level. */
const comment = async () => {
	sendingComment.value = true;

	// Send the comment to the server
	let response = await fetch(`/api/level/${levelInfo.value.id}/comment`, {
		method: 'POST',
		body: JSON.stringify({
			content: commentInput.value
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		// The comment input stays filled, so nothing typed is lost
		alert(response.status === 429 ? "You're commenting too quickly. Please try again later." : "Your comment couldn't be posted.");
		sendingComment.value = false;
		return;
	}

	let json = await response.json() as CommentInfo[];

	// Reload all of the comments
	levelInfo.value.comments = json;
	commentInput.value = '';
	sendingComment.value = false;
};
const deleteComment = async (commentId: number) => {
	if (!confirm("Are you sure you want to delete this comment?")) return;

	let response = await fetch(`/api/comment/${commentId}/delete`, {
		method: 'DELETE'
	});
	let json = await response.json();

	// Reload all of the comments
	levelInfo.value.comments = json;
};
/** Generates the code that represents the MissionInfo object. */
const setMissionInfoCode = () => {
	missionInfoCode = '';

	for (let key of Object.keys(levelInfo.value.missionInfo).sort()) {
		missionInfoCode += `${key} = ${JSON.stringify('' + levelInfo.value.missionInfo[key])};\n`;
	}
};
/** Verify and process the modified MissionInfo code. */
const onMissionInfoCodeChange = (code: string) => {
	MISSION_INFO_REGEX.lastIndex = 0;

	// We first check if the code is syntactically correct by seeing if there are any non-whitespace residuals when we strip out all regex matches:
	let withoutMatches = code.replace(MISSION_INFO_REGEX, '');
	if (withoutMatches.trim()) {
		missionInfoCodeProblems.value = `MissionInfo code has syntactical errors. It must follow the following pattern: key1 = "value1"; key2 = "value2"; ...`;
		return;
	}

	missionInfoCodeProblems.value = '';

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
	for (let key of new Set([...Object.keys(obj), ...Object.keys(levelInfo.value.missionInfo)])) {
		if (obj[key] !== levelInfo.value.missionInfo[key] && !MUTABLE_MISSION_INFO_FIELDS.includes(key)) {
			problems.push(`Property "${key}" is not allowed to change. (was: ${levelInfo.value.missionInfo[key]})`); // Yes this can print "undefined" and it's actually intended!
		}
	}

	// Test if the mission gets classified differently than before with the new MissionInfo (not allowed!)
	let fakeRelativePath = levelInfo.value.gameType === 'multi' ? 'multiplayer/' : '';
	let gameType = guessGameType(obj as any, fakeRelativePath, levelInfo.value.dependencies);
	let modification = guessModification(obj as any, levelInfo.value.hasEasterEgg, levelInfo.value.dependencies);

	if (gameType !== levelInfo.value.gameType)
		problems.push(`The changes to MissionInfo would reclassify this level to have a different game type, which is disallowed.`);
	if (modification !== levelInfo.value.modification)
		problems.push(`The changes to MissionInfo would reclassify this level to have a different modification, which is disallowed.`);

	// Display all the problems
	if (problems.length > 0) {
		missionInfoCodeProblems.value = "There are problems with your changes to MissionInfo:\n\n" + problems.map(x => '- ' + x).join('\n');
	}

	editedMissionInfo = obj;
};
const formatDate = (time: number) => {
	let date = new Date(time);
	let hours = ('00' + date.getHours()).slice(-2);
	let minutes = ('00' + date.getMinutes()).slice(-2);

	return `on ${Util.formatDate(date)} at ${hours}:${minutes}`;
};
const incrementDownloads = () => {
	if (hasDownloaded) return;

	// Note that the count might not always be 100% matching due to IP timeouts on the server
	levelInfo.value.downloads++;
	hasDownloaded = true;
};
const toggleLBs = () => {
	showLBs.value = !showLBs.value;
};
const setLeaderboards = async (lb: ReducedLeaderboardDefinition) => {
	currentLBs.value = lb;
	currentLeaderboardScores.value = [];
	lbStatusMessage.value = 'Fetching scores...';
	let nextToken = lbUpdateToken + 1;
	lbUpdateToken++;

	try {
		let resp = await fetch(`/api/level/${levelInfo.value.id}/leaderboards/${currentLBs.value.id}`);
		let jsonData = await resp.json();
		if (nextToken !== lbUpdateToken) return;
		currentLeaderboardScores.value = jsonData.scores;
		if (currentLeaderboardScores.value.length === 0) {
			lbStatusMessage.value = 'No scores yet.';
		} else {
			lbStatusMessage.value = '';
		}
	} catch (e) {
		if (nextToken !== lbUpdateToken) return;
		lbStatusMessage.value = 'An error has occurred while fetching scores.';
	}
};
const submitVote = async (voteType: boolean) => {
	if (!isCurator.value || !levelInfo.value) return;

	let getScoreVal = (vote: boolean): number => {
		if (vote === true) return 1;
		if (vote === false) return -1;
		return 0;
	};

	let oldVote = levelInfo.value.yourVote;

	let newVote = voteType;
	if (oldVote === voteType) newVote = null;

	const setStoredVote = (vote: boolean) => {
		if (!store.state.curatorVotes) store.state.curatorVotes = {};
		if (vote === null) delete store.state.curatorVotes[levelInfo.value.id];
		else store.state.curatorVotes[levelInfo.value.id] = vote;
	};

	// Optimistic UI
	let oldVal = getScoreVal(oldVote);
	let newVal = getScoreVal(newVote);
	let diff = newVal - oldVal;

	levelInfo.value = {...levelInfo.value,yourVote: newVote, curationScore: (levelInfo.value.curationScore || 0) + diff };
	setStoredVote(newVote);

	try {
		let response = await fetch(`/api/level/${levelInfo.value.id}/curate-vote`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ vote: newVote })
		});

		if (response.ok) {
		} else {
			let text = await response.text();
			alert("Failed to submit vote: " + text);
			throw new Error("Vote failed");
		}
	} catch (e) {
		// Revert to old state
		levelInfo.value = { ...levelInfo.value, yourVote: oldVote, curationScore: (levelInfo.value.curationScore || 0) - diff };
		setStoredVote(oldVote);
	}
};

watch(isLoggedIn, () => {
	if (levelInfo.value) levelInfo.value.lovedByYou = false;
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

.lbButtonContainer {
	display: flex;
	padding-left: 5px;
	gap: 10px;
	border-top-left-radius: 5px;
	width: 50%;
	padding-top: 5px;
	padding-right: 5px;
	border-top-right-radius: 5px;
}

.lbButton {
	background: var(--background-1);
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	border: 2px solid transparent;
	box-sizing: border-box;
	border-top-left-radius: 5px;
	border-top-right-radius: 5px;
	white-space: nowrap;
	padding-left: 20px;
	padding-right: 20px;
	opacity: 0.75;
}

.lbButton:hover {
	border: 2px solid var(--background-1);
	background:var(--background-2);
}

.lbButton:active {
	background:var(--background-color);
}

.lbButton.selected {
	background: var(--background-2);
	opacity: 1;
}

.lbButton.selected:hover {
	border: 2px solid transparent;
}

.curationPanel {
    border-radius: 5px;
    margin-top: 10px;
}

.voteContainer {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 15px;
	margin: 2px 0px;
	text-align: center;
}

.voteBtn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--background-1);
    transition: background 0.2s, transform 0.1s;
	padding: 0 0px;
}

.voteBtn:hover {
    border: 2px solid var(--background-2);
}

.voteBtn:active {
    background:var(--background-2);
}

/* Rotate expand_more for up arrow */
.voteBtn.up :deep(img) {
    transform: rotate(180deg);
}

/* Active States */
.voteBtn.up.active {
    background: #4caf50; /* Green for upvote */
}
.voteBtn.up.active :deep(img) {
    filter: invert(1); /* White icon */
    opacity: 1;
}

.voteBtn.down.active {
    background: #f44336; /* Red for downvote */
}
.voteBtn.down.active :deep(img) {
    filter: invert(1);
    opacity: 1;
}

.score {
    font-size: 18px;
    font-weight: bold;
    min-width: 30px;
}

.score.positive {
    color: #4caf50;
}
.score.negative {
    color: #f44336;
}

.curatorScore:hover {
	text-decoration: underline;
	cursor: pointer;
}

.aboutCuratorScore {
	font-size: 14px;
	opacity: 0.5;
	cursor: pointer;
	margin: 0;
}

.aboutCuratorScore:hover {
	opacity: 1.0;
	text-decoration: underline;
}

.voteHeader {
    margin-top: 14px;
    font-size: 14px;
}

.voteHeader.up { 
	color: #4caf50;
	margin-bottom: 10px;
}
.voteHeader.down { 
	color: #f44336; 
	margin-bottom: 10px;
}

.voteDetailsList {
	display: grid; 
	grid-template-columns: 1fr 1fr; 
	gap: 20px;
}

.versionBadge {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	background: #2196f3;
	color: white;
	font-size: 14px;
	font-weight: bold;
	line-height: 1;
	border-radius: 12px;
	padding: 4px 8px;
	margin-left: 12px;
	vertical-align: top;
	margin-top: 9px;
}

.versionBadge.outdated {
	background: #fbc02d;
	color: #333333;
}

.versionChevron {
	opacity: 0.6;
	cursor: pointer;
	font-weight: normal;
	font-size: 16px;
	/* Enlarge the clickable area without growing the badge visually */
	padding: 8px 9px;
	margin: -8px -6px;
}

.versionChevron:hover {
	opacity: 1.0;
}

.versionChevron.inactive {
	opacity: 0.2;
	cursor: default;
	pointer-events: none;
}
</style>

<style>
@keyframes edit-succeed {
	0% { transform: scale(1.1); }
	100% { transform: scale(1.0); }
}
</style>