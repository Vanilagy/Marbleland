<template>
	<div v-if="profileInfo">
		<info-banner></info-banner>
		<p v-if="shouldSetAvatar" class="noAvatarNotice">❗ You should set your profile avatar. Do so by clicking the avatar icon. ❗</p>
		<div class="avatar">
			<div class="setAvatar" v-if="isOwnProfile" title="Upload new avatar" @click="chooseAvatar">
				<img src="/assets/svg/file_upload_white_24dp.svg">
			</div>
			<img :src="avatarSrc" :style="{ opacity: avatarOpacity }">
		</div>
		<h1>{{ profileInfo.username }}</h1>
		<template v-if="!editingBio || !isOwnProfile">
			<p class="bio" :class="{ emptyBio: !profileInfo.bio }">{{ bio }}</p>
			<img src="/assets/svg/edit_note_black_24dp.svg" class="editBio" title="Edit bio" v-if="isOwnProfile" @click="editingBio = true">
		</template>
		<template v-else>
			<textarea class="bioTextarea" placeholder="Tell us a little bit about yourself" maxlength="1000" v-model.trim="profileInfo.bio"></textarea>
			<button-with-icon icon="/assets/svg/check_black_24dp.svg" class="saveBio" @click="saveBio">Save bio</button-with-icon>
		</template>
		<h3>Uploaded levels</h3>
		<panel-list mode="level" :entries="profileInfo.uploadedLevels" :defaultCount="4" noEntriesNotice="This user has yet to upload any levels."></panel-list>
		<h3>Created packs</h3>
		<panel-list mode="pack" :entries="profileInfo.createdPacks" :defaultCount="4" noEntriesNotice="This user has yet to create any packs."></panel-list>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ExtendedProfileInfo } from '../../../shared/types';
import InfoBanner from '../InfoBanner.vue';
import PanelList from '../PanelList.vue';
import ButtonWithIcon from '../ButtonWithIcon.vue';
import PackPanel from '../PackPanel.vue';

export default Vue.defineComponent({
	data() {
		return {
			profileInfo: null as ExtendedProfileInfo,
			editingBio: false
		};
	},
	async mounted() {
		let accountId = Number(this.$route.params.id);
		let response = await fetch(`/api/account/${accountId}/info`);
		let json = await response.json() as ExtendedProfileInfo;

		this.profileInfo = json;
	},
	computed: {
		avatarSrc(): string {
			if (!this.profileInfo.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg";
			return `/api/account/${this.profileInfo.id}/avatar?v=${this.$store.state.avatarVersion}&size=256`;
		},
		avatarOpacity(): number {
			return this.profileInfo.hasAvatar? 1 : 0.75;
		},
		shouldSetAvatar(): boolean {
			return this.isOwnProfile && !this.profileInfo.hasAvatar;
		},
		isOwnProfile(): boolean {
			return this.profileInfo.id === this.$store.state.loggedInAccount?.id
		},
		bio(): string {
			return this.profileInfo.bio || "This user hasn't set a bio.";
		}
	},
	methods: {
		chooseAvatar() {
			let fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept', 'image/*');
			fileInput.click();

			fileInput.addEventListener('change', async () => {
				let file = fileInput.files[0];
				if (!file) return;

				let token = localStorage.getItem('token');
				let response = await fetch(`/api/account/${this.profileInfo.id}/set-avatar`, {
					method: 'POST',
					body: file,
					headers: {
						'Content-Type': 'application/octet-stream',
						'Authorization': `Bearer ${token}`
					}
				});

				if (response.ok) {
					this.$store.state.avatarVersion++;
					this.profileInfo.hasAvatar = true;
					this.$store.state.loggedInAccount.hasAvatar = true;
				} else {
					alert("Something went wrong.");
				}
			});
		},
		saveBio() {
			this.editingBio = false;

			let token = localStorage.getItem('token');
			fetch(`/api/account/${this.profileInfo.bio}/set-bio`, {
				method: 'POST',
				body: this.profileInfo.bio ?? '',
				headers: {
					'Content-Type': 'text/plain',
					'Authorization': `Bearer ${token}`
				}
			});
		}
	},
	components: {
		InfoBanner,
		PanelList,
		ButtonWithIcon,
		PackPanel
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
	width: 500px;
	white-space: pre-wrap;
}

.emptyBio {
	opacity: 0.5;
	font-style: italic;
}

.editBio {
	opacity: 0.25;
	cursor: pointer;
	display: block;
	margin: auto;
}

.editBio:hover {
	opacity: 0.75;
}

.bioTextarea {
	display: block;
	width: 500px;
	height: 200px;
	margin: auto;
	background: rgb(240, 240, 240);
	font-size: 16px;
	font-family: inherit;
	color: inherit;
	border: 2px solid transparent;
	border-radius: 5px;
	padding: 5px;
    box-sizing: border-box;
    resize: none;
	margin-top: 10px;
}

.bioTextarea:focus {
	outline: none;
	border: 2px solid rgb(220, 220, 220);
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
</style>