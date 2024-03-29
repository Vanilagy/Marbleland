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
			<img src="/assets/svg/edit_note_black_24dp.svg" class="editBio basicIcon" title="Edit bio" v-if="hasOwnershipPermissions" @click="editingBio = true">
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
		<h3>Uploaded levels ({{ profileInfo.uploadedLevels.length }})</h3>
		<panel-list mode="level" :entries="profileInfo.uploadedLevels" :defaultCount="4" noEntriesNotice="This user has yet to upload any levels."></panel-list>
		<h3>Created packs ({{ profileInfo.createdPacks.length }})</h3>
		<panel-list mode="pack" :entries="profileInfo.createdPacks" :defaultCount="4" noEntriesNotice="This user has yet to create any packs."></panel-list>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ExtendedProfileInfo } from '../../../shared/types';
import InfoBanner from '../components/InfoBanner.vue';
import PanelList from '../components/PanelList.vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import PackPanel from '../components/PackPanel.vue';
import Loader from '../components/Loader.vue';
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
			notFound: false
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
		}
	},
	components: {
		InfoBanner,
		PanelList,
		ButtonWithIcon,
		PackPanel,
		Loader,
		Head
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

.editBio {
	opacity: 0.25 !important;
	cursor: pointer;
	display: block;
	margin: auto;
}

.editBio:hover {
	opacity: 0.75 !important;
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
</style>