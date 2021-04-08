<template>
	<div v-if="profileInfo">
		<p v-if="shouldSetAvatar" class="noAvatarNotice">❗ You should set your profile avatar. Do so by clicking the avatar icon. ❗</p>
		<div class="avatar">
			<div class="setAvatar" v-if="isOwnProfile" title="Upload new avatar" @click="chooseAvatar">
				<img src="/assets/svg/file_upload_white_24dp.svg">
			</div>
			<img :src="avatarSrc">
		</div>
		<h1>{{ profileInfo.username }}</h1>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ProfileInfo } from '../../../shared/types';

export default Vue.defineComponent({
	data() {
		return {
			profileInfo: null as ProfileInfo
		};
	},
	async mounted() {
		let accountId = Number(this.$route.params.id);
		let response = await fetch(`/api/account/${accountId}/info`);
		let json = await response.json() as ProfileInfo;

		this.profileInfo = json;
	},
	computed: {
		avatarSrc(): string {
			return `/api/account/${this.profileInfo.id}/avatar?v=${this.$store.state.avatarVersion}&size=256`;
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
	}
});
</script>

<style scoped>
.avatar {
	width: 128px;
	height: 128px;
	margin: auto;
	margin-top: 20px;
	background: gray;
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
}

.setAvatar:hover {
	opacity: 1;
}

.setAvatar > img {
	width: 48px;
}
</style>