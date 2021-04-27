<template>
	<Head>
		<title>Upload level - Marbleland</title>
		<meta name="og:title" content="Upload level">
	</Head>
	<template v-if="$store.state.loggedInAccount">
		<h1>Upload a level</h1>
		<p class="learnMore" @click="$router.push('/about-upload')">Learn more</p>
		<a href="/about-upload" @click.prevent=""></a> <!-- Let's hope Google will accept this xD -->
		<button-with-icon icon="/assets/svg/file_upload_black_24dp.svg" class="button" @click="select" :class="{ disabled: uploading }">Select .zip to upload</button-with-icon>
		<progress-bar class="progressBar" :loaded="uploadLoaded" :total="uploadTotal" :state="uploadState" v-if="uploading" :class="{ disabled: successResponse }"></progress-bar>
		<div v-if="problems.length > 0" class="problemContainer">
			<h3>There are problems with your level that prevent it from being uploaded:</h3>
			<p v-for="problem of problems" :key="problem">- {{ problem }}</p>
		</div>
		<div v-else-if="successResponse" class="successContainer" :class="{ disabled: submitting }">
			<div v-if="successResponse.warnings.length > 0" style="margin-bottom: 30px;">
				<h3>Please consider the following before submitting the level:</h3>
				<p v-for="warning of successResponse.warnings" :key="warning" class="warning">- {{ warning }}</p>
			</div>
			<h3>Your level has been processed successfully! If you want to, add a few additional remarks describing the level and its creation before submitting it.</h3>
			<textarea class="remarks basicTextarea" placeholder="Additional remarks" :maxlength="$store.state.levelRemarksMaxLength" v-model.trim="remarks"></textarea>
			<button-with-icon icon="/assets/svg/check_black_24dp.svg" class="button" @click="submit">Submit level</button-with-icon>
		</div>
	</template>
	<p v-else class="notSignedIn">You need to be signed in to upload a level.</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import ProgressBar from '../components/ProgressBar.vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	components: {
		ButtonWithIcon,
		ProgressBar,
		Head
	},
	data() {
		return {
			uploading: false,
			uploadLoaded: 0,
			uploadTotal: 1,
			/** The state of the progress bar */
			uploadState: 'neutral',
			problems: [] as string[],
			successResponse: null as {
				uploadId: string,
				warnings: string[]
			},
			remarks: '',
			submitting: false
		};
	},
	methods: {
		/** Show a file dialog that allows the user to select a .zip file, then upload it to the server. */
		select() {
			let fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept', 'application/zip');
			fileInput.click();

			fileInput.addEventListener('change', async () => {
				let file = fileInput.files[0];
				if (!file) return;

				let request = new XMLHttpRequest(); // We use XMLHttpRequest here instead of fetch because it gives us access to upload progress data
				request.open('POST', '/api/level/upload', true);
				request.setRequestHeader('Content-Type', 'application/zip');
				request.withCredentials = true;

				request.upload.onprogress = (ev) => {
					this.uploadLoaded = ev.loaded;
					this.uploadTotal = ev.total;
				};
				request.onloadend = () => {
					let json = JSON.parse(request.responseText) as {
						status: 'error' | 'success',
						problems: string[],
						uploadId: string,
						warnings: string[]
					};

					if (json.status === 'error') {
						// There were problems with the upload, show them to the user
						this.problems = json.problems;
						this.uploadState = 'negative';
						this.uploading = false;
					} else if (json.status === 'success') {
						// The upload was successful
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
		/** Submits the already uploaded level. */
		async submit() {
			this.submitting = true;

			// Tell the server to submit the upload
			let response = await fetch(`/api/level/submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					uploadId: this.successResponse.uploadId,
					remarks: this.remarks
				})
			});

			if (response.ok) {
				// The level has been submitted successfully, navigate to its page
				let json = await response.json() as {
					levelId: number
				};
				this.$store.state.nextInfoBannerMessage = "Level submitted successfully!";
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
	margin-top: 10px;
	width: 100%;
	height: 200px;
}

.warning {
	margin: 0;
	font-size: 13px;
	color: goldenrod;
}

.learnMore {
	margin: auto;
    width: 100px;
	font-size: 14px;
	opacity: 0.5;
	text-align: center;
	margin-top: -30px;
	cursor: pointer;
}

.learnMore:hover {
	opacity: 1.0;
	text-decoration: underline;
}
</style>