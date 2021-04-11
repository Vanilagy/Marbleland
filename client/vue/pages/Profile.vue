<template>
	<div v-if="profileInfo">
		<info-banner v-if="creationBannerShown">Account created successfully!</info-banner>
		<p v-if="shouldSetAvatar" class="noAvatarNotice">❗ You should set your profile avatar. Do so by clicking the avatar icon. ❗</p>
		<div class="avatar">
			<div class="setAvatar" v-if="isOwnProfile" title="Upload new avatar" @click="chooseAvatar">
				<img src="/assets/svg/file_upload_white_24dp.svg">
			</div>
			<img :src="avatarSrc" :style="{ opacity: avatarOpacity }">
		</div>
		<h1>{{ profileInfo.username }}</h1>
		<h3>Uploaded levels</h3>
		<level-list :levels="profileInfo.uploadedLevels" :defaultCount="4" noLevelsNotice="This user has yet to upload any levels."></level-list>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ExtendedProfileInfo } from '../../../shared/types';
import InfoBanner from '../InfoBanner.vue';
import LevelList from '../LevelList.vue';

export default Vue.defineComponent({
	data() {
		return {
			profileInfo: null as ExtendedProfileInfo,
			creationBannerShown: false
		};
	},
	async mounted() {
		let accountId = Number(this.$route.params.id);
		let response = await fetch(`/api/account/${accountId}/info`);
		let json = await response.json() as ExtendedProfileInfo;

		this.profileInfo = json;

		if (this.$store.state.showAccountCreated) {
			this.creationBannerShown = true;
			this.$store.state.showAccountCreated = false;
		}
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
		}
	},
	components: {
		InfoBanner,
		LevelList,
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

h3 {
	margin: 0;
	font-size: 13px;
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 25px;
}
</style>