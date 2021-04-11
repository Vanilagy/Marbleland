<template>
	<template v-if="$store.state.loggedInAccount">
		<h1>Upload a level</h1>
		<button-with-icon icon="/assets/svg/file_upload_black_24dp.svg" class="button" @click="select" :class="{ disabled: uploading }">Select .zip to upload</button-with-icon>
		<progress-bar class="progressBar" :loaded="uploadLoaded" :total="uploadTotal" :state="uploadState" v-if="uploading" :class="{ disabled: successResponse }"></progress-bar>
		<div v-if="problems.length > 0" class="problemContainer">
			<h3>There are problems with your level that prevent it from being uploaded.</h3>
			<p v-for="problem of problems" :key="problem">- {{ problem }}</p>
		</div>
		<div v-else-if="successResponse" class="successContainer" :class="{ disabled: submitting }">
			<h3>Your level has been processed successfully! If you want to, add a few additional remarks describing the level and its creation before submitting it.</h3>
			<textarea class="remarks" placeholder="Additional remarks" maxlength="10000" v-model.trim="remarks"></textarea>
			<button-with-icon icon="/assets/svg/check_black_24dp.svg" class="button" @click="submit">Submit level</button-with-icon>
		</div>
	</template>
	<p v-else class="notSignedIn">You need to be signed in to upload a level.</p>
</template>

<script lang="ts">
import Vue from 'vue';
import ButtonWithIcon from '../ButtonWithIcon.vue';
import ProgressBar from '../ProgressBar.vue';

export default Vue.defineComponent({
	components: {
		ButtonWithIcon,
		ProgressBar
	},
	data() {
		return {
			uploading: false,
			uploadLoaded: 0,
			uploadTotal: 1,
			uploadState: 'neutral',
			problems: [] as string[],
			successResponse: null as {
				uploadId?: string
			},
			remarks: '',
			submitting: false
		};
	},
	methods: {
		select() {
			let fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept', 'application/zip');
			fileInput.click();

			fileInput.addEventListener('change', async () => {
				let file = fileInput.files[0];
				if (!file) return;

				let token = localStorage.getItem('token');
				let request = new XMLHttpRequest();
				request.open('POST', '/api/level/upload', true);
				request.setRequestHeader('Content-Type', 'application/octet-stream');
				request.setRequestHeader('Authorization', `Bearer ${token}`);

				request.upload.onprogress = (ev) => {
					this.uploadLoaded = ev.loaded;
					this.uploadTotal = ev.total;
				};
				request.onloadend = () => {
					let json = JSON.parse(request.responseText) as {
						status: 'error' | 'success',
						problems?: string[],
						uploadId?: string
					};

					if (json.status === 'error') {
						this.problems = json.problems;
						this.uploadState = 'negative';
					} else if (json.status === 'success') {
						this.successResponse = json;
						this.uploadState = 'positive';
					}
				};

				request.send(file);
				this.resetUpload();
				this.uploading = true;
				this.problems = [];
				this.uploadState = 'neutral';
			});
		},
		resetUpload() {
			this.uploadLoaded = 0;
			this.uploadTotal = 1;
		},
		async submit() {
			this.submitting = true;

			let token = localStorage.getItem('token');
			let response = await fetch(`/api/level/submit`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					uploadId: this.successResponse.uploadId,
					remarks: this.remarks
				})
			});

			if (response.ok) {
				let json = await response.json() as {
					levelId: number
				};
				this.$store.state.showLevelCreated = true;
				this.$router.push({ name: 'Level', params: { id: json.levelId } });
			} else {
				alert("There was an error submitting your level. This is either because of a bug or because you waited too long to submit after initially uploading your .zip. If you want to try again, refresh this page.");
			}
		}
	}
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 30px 0px;
}

.button {
	width: 200px;
	margin: auto;
	border-radius: 5px;
	margin-top: 30px;
}

.notSignedIn {
	margin: 5px;
	margin-bottom: 15px;
	width: 100%;
	text-align: center;
	font-size: 14px;
}

.progressBar {
	width: 300px;
	margin: auto;
	margin-top: 10px;
}

h3 {
	margin: 0;
	font-size: 14px;
	font-weight: bold;
}

.problemContainer {
	margin-top: 20px;
}

.problemContainer > p {
	margin: 0;
	font-size: 13px;
	color: crimson;
}

.successContainer {
	margin-top: 20px;
}

.remarks {
	display: block;
	width: 100%;
	height: 200px;
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

.remarks:focus {
	outline: none;
	border: 2px solid rgb(220, 220, 220);
}
</style>