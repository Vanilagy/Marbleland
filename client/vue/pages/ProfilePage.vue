<template :key="$route.path">
	<Head v-if="profileInfo">
		<title>{{ profileInfo.username }} - Marbleland</title>
		<meta name="description" :content="profileInfo.bio">
		<meta name="og:title" :content="profileInfo.username">
		<meta name="og:description" :content="profileInfo.bio">
		<meta name="og:image" :content="origin + `/api/account/${profileInfo.id}/avatar`">
	</Head>
	<loader v-if="!profileInfo && !notFound"></loader>
	<p class="notFound" v-if="notFound">This user does not exist. :(</p>
	<div v-if="profileInfo">
		<info-banner></info-banner>
		<p v-if="shouldSetAvatar" class="noAvatarNotice">❗ You should set your profile avatar. Do so by clicking the avatar icon. ❗</p>
		<div class="avatar">
			<div class="setAvatar" v-if="hasOwnershipPermissions" title="Upload new avatar" @click="chooseAvatar">
				<img src="/assets/svg/file_upload_white_24dp.svg">
			</div>
			<img :src="avatarSrc" :class="{ basicIcon: !profileInfo.hasAvatar }">
		</div>
		<h1>{{ profileInfo.username }}</h1>
		<p class="moderatorBadge" v-if="profileInfo.isModerator">Moderator</p>
		<template v-if="!editingBio || !hasOwnershipPermissions">
			<p class="bio" :class="{ emptyBio: !profileInfo.bio }" v-html="bio"></p>
			<div class="bioActions" v-if="hasOwnershipPermissions">
				<img src="/assets/svg/edit_note_black_24dp.svg" class="editBio basicIcon" title="Edit bio" @click="editingBio = true">
				<template v-if="!isOwnProfile && !profileInfo.isModerator">
					<img v-if="!profileInfo.isSuspended" src="/assets/svg/gavel_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" class="suspendIcon basicIcon" title="Suspend account" @click="showSuspendConfirmation">
					<img v-else src="/assets/svg/healing_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" class="unsuspendIcon basicIcon" title="Unsuspend account" @click="unsuspendAccount">
				</template>
			</div>
		</template>
		<template v-else>
			<textarea class="bioTextarea basicTextarea" placeholder="Tell us a little bit about yourself" maxlength="1000" v-model.trim="profileInfo.bio"></textarea>
			<button-with-icon icon="/assets/svg/check_black_24dp.svg" class="saveBio" @click="saveBio">Save bio</button-with-icon>
		</template>
		<p class="stats">
			Level downloads: <strong>{{ levelDownloads }}</strong><br>
			Level loves: <strong>{{ levelLoves }}</strong><br>
			Pack downloads: <strong>{{ packDownloads }}</strong><br>
			Pack loves: <strong>{{ packLoves }}</strong>
		</p>
		<template v-if="profileInfo.isSuspended">
			<div class="suspendedBanner">
				<h2>This account has been suspended</h2>
				<p v-if="profileInfo.suspensionReason"><strong>Reason:</strong> {{ profileInfo.suspensionReason }}</p>
				<p>This user's content is no longer available.</p>
				<p class="snarkMessage">Don't be like this user.</p>
			</div>
		</template>
		<template v-else>
			<h3>Uploaded levels ({{ profileInfo.uploadedLevels.length }})</h3>
			<panel-list mode="level" :entries="profileInfo.uploadedLevels" :defaultCount="4" noEntriesNotice="This user has yet to upload any levels."></panel-list>
			<h3>Created packs ({{ profileInfo.createdPacks.length }})</h3>
			<panel-list mode="pack" :entries="profileInfo.createdPacks" :defaultCount="4" noEntriesNotice="This user has yet to create any packs."></panel-list>
		</template>
		
	</div>

	<Modal ref="suspendConfirmationModal">
		<h2 class="suspendModalHeading">CAUTION: You're about to suspend "{{ profileInfo?.username }}"</h2>
		<hr />
		<div class="suspendModalBody">
			<p>Account suspension will permanently:</p>
			<ul>
				<li><strong>Delete all levels</strong> uploaded by this user</li>
				<li><strong>Delete all packs</strong> created by this user</li>
				<li><strong>Delete all comments</strong> posted by this user</li>
				<li><strong>Block all future actions</strong> from this account</li>
			</ul>
			<p><strong>This action cannot be undone.</strong> The content will be permanently lost.</p>

			<p>Suspension reason (will be displayed publicly):</p>
			<textarea class="basicTextarea suspensionReasonTextarea" v-model="suspensionReason" placeholder="Concisely describe why this account has been suspended..." maxlength="500" rows="3"></textarea>

			<div class="suspendModalCheckboxContainer">
				<input type="checkbox" id="suspendAcknowledgement" class="basicCheckbox" v-model="acknowledgedSuspensionConsequences">
				<label for="suspendAcknowledgement" class="notSelectable">
					<em>I understand the consequences of account suspension</em>
				</label>
			</div>

			<div v-if="acknowledgedSuspensionConsequences" class="usernameConfirmation">
				<p>Please type the username "<strong>{{ profileInfo?.username }}</strong>" to confirm:</p>
				<input type="text" class="basicTextInput" v-model="usernameConfirmation" :placeholder="profileInfo?.username">
			</div>
		</div>
		<hr />
		<div class="suspendModalButtons">
			<ButtonWithIcon v-if="canSuspend" class="suspendAccountButton" @click="suspendAccount">
				Suspend Account
			</ButtonWithIcon>
			<ButtonWithIcon @click="closeSuspendConfirmationModal">
				Cancel
			</ButtonWithIcon>
		</div>
	</Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ExtendedProfileInfo } from '../../../shared/types';
import InfoBanner from '../components/InfoBanner.vue';
import PanelList from '../components/PanelList.vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import PackPanel from '../components/PackPanel.vue';
import Loader from '../components/Loader.vue';
import Modal from '../components/Modal.vue';
import { Util } from '../../ts/util';
import { Head } from '@vueuse/head';
import { db } from '../../../server/ts/globals';
import { AccountDoc, getExtendedProfileInfo } from '../../../server/ts/account';
import { ORIGIN } from '../../../shared/constants';

export default defineComponent({
	data() {
		return {
			profileInfo: null as ExtendedProfileInfo,
			editingBio: false,
			notFound: false,
			acknowledgedSuspensionConsequences: false,
			usernameConfirmation: '',
			suspensionReason: ''
		};
	},
	async mounted() {
		if (this.$store.state.profilePreload) {
			this.profileInfo = this.$store.state.profilePreload;
			this.$store.state.profilePreload = null;
		} else {
			// Load the profile info
			let accountId = Number(this.$route.params.id);
			let response = await fetch(`/api/account/${accountId}/info`);

			if (response.status === 404) {
				this.notFound = true;
				return;
			}

			let json = await response.json() as ExtendedProfileInfo;
			this.profileInfo = json;
		}
	},
	async serverPrefetch() {
		let doc = await db.accounts.findOne({ _id: Number(this.$route.params.id) }) as AccountDoc;
		if (!doc) {
			this.notFound = true;
			return;
		}

		this.profileInfo = await getExtendedProfileInfo(doc);
		this.$store.state.profilePreload = this.profileInfo;
	},
	computed: {
		avatarSrc(): string {
			if (!this.profileInfo.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg"; // Default to the icon if no avatar has been set
			return `/api/account/${this.profileInfo.id}/avatar?v=${this.$store.state.avatarVersion}&size=256`;
		},
		shouldSetAvatar(): boolean {
			return this.profileInfo.id === this.$store.state.loggedInAccount?.id && !this.profileInfo.hasAvatar;
		},
		hasOwnershipPermissions(): boolean {
			return this.profileInfo.id === this.$store.state.loggedInAccount?.id || this.$store.state.loggedInAccount?.isModerator;
		},
		bio(): string {
			return Util.linkify(this.profileInfo.bio) || "This user hasn't set a bio.";
		},
		origin(): string {
			return ORIGIN;
		},
		levelDownloads(): number {
			return this.profileInfo.uploadedLevels.reduce((a, b) => a + b.downloads, 0);
		},
		levelLoves(): number {
			return this.profileInfo.uploadedLevels.reduce((a, b) => a + b.lovedCount, 0);
		},
		packDownloads(): number {
			return this.profileInfo.createdPacks.reduce((a, b) => a + b.downloads, 0);
		},
		packLoves(): number {
			return this.profileInfo.createdPacks.reduce((a, b) => a + b.lovedCount, 0);
		},
		isOwnProfile(): boolean {
			return this.profileInfo?.id === this.$store.state.loggedInAccount?.id;
		},
		canSuspend(): boolean {
			return this.acknowledgedSuspensionConsequences && 
			       this.usernameConfirmation === this.profileInfo?.username &&
			       this.suspensionReason.trim().length > 0;
		}
	},
	methods: {
		/** Pops up a file selection dialog to allow the user to upload a new avatar image. */
		chooseAvatar() {
			let fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept', 'image/*'); // Allow only images
			fileInput.click();

			fileInput.addEventListener('change', async () => {
				let file = fileInput.files[0];
				if (!file) return;

				// Upload the new image to the server
				let response = await fetch(`/api/account/${this.profileInfo.id}/set-avatar`, {
					method: 'POST',
					body: file,
					headers: {
						'Content-Type': 'application/octet-stream'
					}
				});

				if (response.ok) {
					this.profileInfo.hasAvatar = true;
					this.$store.state.loggedInAccount.hasAvatar = true;
					this.$store.state.avatarVersion++; // to cause image update
				} else {
					alert("Something went wrong.");
				}
			});
		},
		saveBio() {
			this.editingBio = false;

			// Send the new bio to the server
			fetch(`/api/account/${this.profileInfo.id}/set-bio`, {
				method: 'POST',
				body: this.profileInfo.bio ?? '',
				headers: {
					'Content-Type': 'text/plain'
				}
			});
		},
		showSuspendConfirmation() {
			this.acknowledgedSuspensionConsequences = false;
			this.usernameConfirmation = '';
			this.suspensionReason = '';
			(this.$refs.suspendConfirmationModal as any).show();
		},
		closeSuspendConfirmationModal() {
			(this.$refs.suspendConfirmationModal as any).hide();
		},
		async suspendAccount() {
			this.closeSuspendConfirmationModal();

			let response = await fetch(`/api/account/${this.profileInfo.id}/suspend`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					reason: this.suspensionReason.trim()
				})
			});

			if (response.ok) {
				alert(`Account "${this.profileInfo.username}" has been suspended successfully.`);
				// Reload the page to fetch updated content
				window.location.reload();
			} else {
				alert("Something went wrong while suspending the account.");
			}
		},
		async unsuspendAccount() {
			if (!confirm(`Are you sure you want to unsuspend "${this.profileInfo.username}"? This will not restore any content that got deleted during suspension.`)) return;

			let response = await fetch(`/api/account/${this.profileInfo.id}/unsuspend`, {
				method: 'POST'
			});

			if (response.ok) {
				alert(`Account "${this.profileInfo.username}" has been unsuspended successfully.`);
				// Reload the page to fetch updated content
				window.location.reload();
			} else {
				alert("Something went wrong while unsuspending the account.");
			}
		}
	},
	components: {
		InfoBanner,
		PanelList,
		ButtonWithIcon,
		PackPanel,
		Loader,
		Head,
		Modal
	}
});
</script>

<style scoped>
.avatar {
	width: 128px;
	height: 128px;
	margin: auto;
	margin-top: 20px;
	border-radius: 1000px;
	overflow: hidden;
	position: relative;
	box-shadow: 0px 0px 10px #00000052;
}

.avatar > img {
	width: 101%;
	height: 101%;
	object-fit: cover;
}

.noAvatarNotice {
	font-size: 16px;
	color: orangered;
	text-align: center;
	font-weight: bold;
}

h1 {
	text-align: center;
	margin: 0;
	margin-top: 10px;
}

.setAvatar {
	opacity: 0;
	cursor: pointer;
	background: rgb(0, 0, 0, 0.4);
	transition: opacity 0.15s;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 10000px;
	z-index: 1;
}

.setAvatar:hover {
	opacity: 1;
}

.setAvatar > img {
	width: 48px;
}

.bio {
	font-size: 14px;
	text-align: center;
	margin: 0;
	margin: auto;
	max-width: 500px;
	white-space: pre-wrap;
	overflow-wrap: break-word;
}

.emptyBio {
	opacity: 0.5;
	font-style: italic;
}

.bioActions {
	display: flex;
	justify-content: center;
	gap: 10px;
	margin-top: 5px;
}

.editBio, .suspendIcon, .unsuspendIcon {
	opacity: 0.25 !important;
	cursor: pointer;
}

.editBio:hover, .suspendIcon:hover, .unsuspendIcon:hover {
	opacity: 0.75 !important;
}

.suspendIcon {
	filter: hue-rotate(320deg) saturate(2);
}

.unsuspendIcon {
	filter: hue-rotate(120deg) saturate(1.5);
}

.bioTextarea {
	width: 100%;
	max-width: 500px;
	height: 200px;
	margin: auto;
	margin-top: 10px;
}

.saveBio {
	width: 200px;
	margin: auto;
	border-radius: 5px;
	margin-top: 10px;
}

h3 {
	margin: 0;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 25px;
}

.notFound {
	text-align: center;
	margin-top: 50px;
}

.moderatorBadge {
	width: 85px;
    margin: 5px auto;
    text-align: center;
    background: #3c68e6;
    font-size: 10px;
    color: white;
    text-transform: uppercase;
    border-radius: 5px;
    font-weight: bold;
    padding: 1px;
}

.stats {
	font-size: 11px;
	width: 130px;
	margin: auto;
	margin-top: 20px;
	opacity: 0.75;
}

.stats strong {
	float: right;
}

.suspendedBanner {
	text-align: center;
	background: rgba(220, 20, 60, 0.1);
	border: 2px solid rgba(220, 20, 60, 0.3);
	border-radius: 10px;
	padding: 20px;
	margin: 20px 0;
}

.suspendedBanner h2 {
	color: crimson;
	margin: 0 0 10px 0;
}

.suspendedBanner p {
	margin: 0;
	opacity: 0.8;
}

.snarkMessage {
	font-style: italic;
	opacity: 0.6 !important;
	font-size: 14px;
	margin-top: 8px !important;
}

.suspensionReasonTextarea {
	width: 100%;
	box-sizing: border-box;
}


.suspendModalHeading {
	text-align: center;
	color: crimson;
	margin: 0;
	margin-bottom: 10px;
	font-weight: normal;
	font-size: 18px;
}

.suspendModalBody {
	font-size: 14px;
	margin-bottom: 10px;
}

.suspendModalCheckboxContainer {
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 15px 0;
}

.usernameConfirmation {
	margin-top: 15px;
}

.usernameConfirmation p {
	margin-bottom: 5px;
}

.usernameConfirmation input {
	width: 100%;
}

.suspendModalButtons {
	display: flex;
	gap: 10px;
}

.suspendAccountButton {
	background: crimson !important;
	color: white !important;
}

.suspendAccountButton:hover {
	border-color: rgb(218, 76, 105) !important;
}

.suspendAccountButton:active {
	background: rgb(218, 76, 105) !important;
}
</style>