<template>
	<Head>
		<title>Upload levels - Marbleland</title>
		<meta name="og:title" content="Upload levels">
	</Head>
	<template v-if="$store.state.loggedInAccount && !$store.state.loggedInAccount.isSuspended">
		<h1>Upload levels</h1>
		<p class="learnMore" @click="$router.push('/about-upload')">Learn more</p>
		<p class="contentGuidelines" @click="$router.push('/content-guidelines')">Content guidelines</p>
		<a href="/about-upload" @click.prevent=""></a> <!-- Let's hope Google will accept this xD -->
		<a href="/content-guidelines" @click.prevent=""></a> <!-- Let's hope Google will accept this xD -->	
		<div v-if="!$store.state.acknowledgedGuidelines">
			<p class="acceptContentGuidelinesNotice">
				In order to upload levels, you must first read and accept the <span @click="$router.push('/content-guidelines')">content guidelines</span>.
			</p>
		</div>
		<template v-else>
			<div class="uploadButtons">
				<button-with-icon icon="/assets/svg/file_upload_black_24dp.svg" class="button" @click="selectFile" :class="{ disabled: uploading }">Select .zip</button-with-icon>
				<button-with-icon icon="/assets/svg/file_upload_black_24dp.svg" class="button" @click="selectFolder" :class="{ disabled: uploading }">Select folder</button-with-icon>
			</div>
			<div v-if="!uploading" class="dropArea" @drop.prevent="dropFile" @dragover.prevent="" @dragenter="dragEntered = true" @dragleave="dragEntered = false" :style="{ 'borderColor': dragEntered? 'var(--text-color)' : '' }">
				<img src="/assets/svg/download_black_24dp.svg" class="basicIcon">
				<p>Or drop files here</p>
			</div>
		</template>
		<progress-bar class="progressBar" :loaded="uploadLoaded" :total="uploadTotal" :state="uploadState" v-if="uploading" :class="{ disabled: successResponse }"></progress-bar>
		<div v-if="problems.length > 0" class="problemContainer">
			<h3>There are problems with your levels that prevent them from being uploaded:</h3>
			<p v-for="problem of problems" :key="problem">- {{ problem }}</p>
		</div>
		<div v-else-if="successResponse" class="successContainer" :class="{ disabled: submitting }">
			<hr>

			<div v-if="successResponse.warnings.length > 0" style="margin-bottom: 30px;">
				<h3>Please consider the following before submitting:</h3>
				<p v-for="warning of successResponse.warnings" :key="warning" class="warning">- {{ warning }}</p>
			</div>
			<div class="levelSelector">
				<p v-show="successResponse.missions.length > 1">{{ currentIndex + 1 }} / {{ successResponse.missions.length }}</p>
				<p>{{ successResponse.missions[currentIndex].name }}</p>
				<p>{{ successResponse.missions[currentIndex].misFilePath }}</p>
				<img :src="`/api/level/upload-image?uploadId=${encodeURIComponent(successResponse.uploadId)}&missionId=${currentIndex}`">
				<img src="/assets/svg/chevron_left_black_24dp.svg" class="basicIcon" title="Cycle to previous level" v-if="successResponse.missions.length > 1" @click="currentIndex = (currentIndex - 1 + successResponse.missions.length) % successResponse.missions.length">
				<img src="/assets/svg/chevron_right_black_24dp.svg" class="basicIcon" title="Cycle to next level" v-if="successResponse.missions.length > 1" @click="currentIndex = (currentIndex + 1) % successResponse.missions.length">
			</div>
			<h3>If you want to, add a few additional remarks describing this level ({{ successResponse.missions[currentIndex].name }}) and its creation before submitting it:</h3>
			<textarea class="remarks basicTextarea" :placeholder="`Additional remarks on ${successResponse.missions[currentIndex].name}`" :maxlength="$store.state.levelRemarksMaxLength" v-model.trim="remarks[currentIndex]"></textarea>

			<hr>

			<h3>Optionally, choose the packs you want to add the uploaded {{ successResponse.missions.length > 1 ? 'levels' : 'level' }} to:</h3>
			<panel-list mode="pack" :entries="successResponse.packs" :defaultCount="4" noEntriesNotice="" :selectedPacks="selectedPacks" v-if="successResponse.packs.length > 0"></panel-list>

			<input type="checkbox" id="createPackCheckbox" class="basicCheckbox" v-model="createNewPack"><label for="createPackCheckbox" class="notSelectable">Create new pack</label>
			<input type="text" placeholder="Pack name" :maxlength="$store.state.packNameMaxLength" v-model.trim="newPackName" class="basicTextInput newPackName" v-if="createNewPack">
			<textarea class="basicTextarea newPackDescription" placeholder="Pack description" :maxlength="$store.state.packDescriptionMaxLength" v-model.trim="newPackDescription" v-if="createNewPack"></textarea>

			<hr>

			<button-with-icon icon="/assets/svg/check_black_24dp.svg" class="button" @click="submit" :class="{ disabled: createNewPack && !(newPackName && newPackDescription) }">{{ successResponse.missions.length > 1? `Submit all ${successResponse.missions.length} levels` : "Submit level" }}</button-with-icon>
		</div>
	</template>
	<p v-else-if="$store.state.loggedInAccount && $store.state.loggedInAccount.isSuspended" class="suspendedMessage">Your account has been suspended and cannot upload any levels.</p>
	<p v-else class="notSignedIn">You need to be signed in to upload a level.</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import ProgressBar from '../components/ProgressBar.vue';
import PanelList from '../components/PanelList.vue';
import { Head } from '@vueuse/head';
import { PackInfo } from '../../../shared/types';

export default defineComponent({
	components: {
		ButtonWithIcon,
		ProgressBar,
		PanelList,
		Head
	},
	data() {
		return {
			uploading: false,
			uploadLoaded: 0,
			uploadTotal: 1,
			/** The state of the progress bar */
			uploadState: 'neutral' as 'neutral' | 'negative' | 'positive',
			problems: [] as string[],
			successResponse: null as {
				uploadId: string,
				missions: {
					misFilePath: string,
					name: string
				}[],
				packs: PackInfo[],
				warnings: string[]
			},
			currentIndex: 0,
			remarks: [] as string[],
			selectedPacks: [] as number[],
			createNewPack: false,
			newPackName: "",
			newPackDescription: "",
			submitting: false,
			dragEntered: false
		};
	},
	methods: {
		/** Show a file dialog that allows the user to select a .zip file, then upload it to the server. */
		selectFile() {
			let fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept', 'application/zip');
			fileInput.click();

			fileInput.addEventListener('change', () => {
				let file = fileInput.files[0];
				if (file) this.uploadZipFile(file);
			});
		},
		selectFolder() {
			let fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('webkitdirectory', '');
			fileInput.click();

			fileInput.addEventListener('change', () => {
				if (fileInput.files.length > 0) {
					this.uploadFiles([...fileInput.files]);
				}
			});
		},
		uploadZipFile(file: File) {
			if (!file.name.endsWith('.zip')) {
				alert("You can only upload .zip files.");
				return;
			}

			if (file.size > 100e6) {
				alert("Your .zip is too large (max 100 MB).");
				return;
			}

			let request = new XMLHttpRequest(); // We use XMLHttpRequest here instead of fetch because it gives us access to upload progress data
			request.open('POST', '/api/level/upload', true);
			request.setRequestHeader('Content-Type', 'application/zip');
			request.withCredentials = true;
			request.send(file);

			this.handleUpload(request);
		},
		uploadFiles(files: File[]) {
			let totalSizeSum = files.reduce((sum, file) => sum + file.size, 0);
			if (totalSizeSum > 100e6) {
				alert("The total size of the files you selected is too large (max 100 MB).");
				return;
			}

			let formData = new FormData();
			for (let file of files) formData.append('files', file);

			let request = new XMLHttpRequest();
			request.open('POST', '/api/level/upload', true);
			request.withCredentials = true;
			request.send(formData);

			this.handleUpload(request);
		},
		handleUpload(request: XMLHttpRequest) {
			this.resetUpload();
			this.uploading = true;
			this.problems = [];
			this.uploadState = 'neutral';

			request.upload.onprogress = (ev) => {
				this.uploadLoaded = ev.loaded;
				this.uploadTotal = ev.total;
			};
			request.onloadend = () => {
				let json = JSON.parse(request.responseText) as {
					status: 'error' | 'success',
					problems: string[],
					uploadId: string,
					missions: {
						misFilePath: string,
						name: string
					}[],
					packs: PackInfo[],
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
					this.remarks = Array(json.missions.length).fill('');
				}
			};
		},
		resetUpload() {
			this.uploadLoaded = 0;
			this.uploadTotal = 1;
		},
		/** Submits the already uploaded level. */
		async submit() {
			if (this.successResponse.missions.length > 1 && !confirm(`Please confirm the submission of these ${this.successResponse.missions.length} levels.`)) return;

			this.submitting = true;

			// Tell the server to submit the upload
			let response = await fetch(`/api/level/submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					uploadId: this.successResponse.uploadId,
					remarks: this.remarks,
					addToPacks: this.selectedPacks,
					newPack: this.createNewPack? {
						name: this.newPackName,
						description: this.newPackDescription
					} : null
				})
			});

			if (response.ok) {
				// The levels have been submitted successfully
				let json = await response.json() as {
					levelIds: number[],
					newPackId?: number
				};
				this.$store.state.nextInfoBannerMessage = (json.levelIds.length > 1)?
					`All ${json.levelIds.length} levels submitted successfully!`
					: "Level submitted successfully!";

				// Navigate either to the level page or the profile page depending on the amount of uploaded levels
				if (json.levelIds.length > 1) this.$router.push({ name: 'Profile', params: { id: this.$store.state.loggedInAccount.id } });
				else this.$router.push({ name: 'Level', params: { id: json.levelIds[0] } });

				// Update pack stuff

				if (json.newPackId !== null) this.$store.state.ownPacks.push({
					id: json.newPackId,
					name: this.newPackName,
					levelIds: json.levelIds
				});
				 
				for (let pack of this.$store.state.ownPacks) {
					if (!this.selectedPacks.includes(pack.id)) continue;
					pack.levelIds.push(...json.levelIds);
				}
			} else {
				alert("There was an error submitting your level. This is either because of a bug or because you waited too long to submit after initially uploading your .zip. If you want to try again, refresh this page.");
			}
		},
		async dropFile(e: DragEvent) {
			this.dragEntered = false;
			let files: File[] = [];

			const readEntry = async (entry: FileSystemEntry) => {
				if (entry.isFile) {
					let file = await new Promise<File>((resolve) => {
						(entry as FileSystemFileEntry).file(resolve);
					});
					files.push(file);
				} else if (entry.isDirectory) {
					let reader = (entry as FileSystemDirectoryEntry).createReader();

					while (true) {
						let entries = await new Promise<FileSystemEntry[]>((resolve) => {
							reader.readEntries(resolve);
						});
						if (entries.length === 0) break;

						for (let entry of entries) {
							await readEntry(entry);
						}
					}
				}
			};

			for (let item of e.dataTransfer.items) {
				let entry = item.webkitGetAsEntry();
				if (!entry) continue;

				await readEntry(entry);
			}

			if (files.length === 0) return;

			if (files.length === 1 && files[0].type === 'application/zip') {
				this.uploadZipFile(files[0]);
			} else {
				this.uploadFiles(files);
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

.contentGuidelines {
	width: 150px;
	margin: auto;
	font-size: 14px;
	opacity: 0.5;
	text-align: center;
	cursor: pointer;
}

.contentGuidelines:hover {
	opacity: 1.0;
	text-decoration: underline;
}

.acceptContentGuidelinesNotice {
	text-align: center;
	margin-top: 50px;
}

.acceptContentGuidelinesNotice span {
	cursor: pointer;
	font-weight: bold;
}

.acceptContentGuidelinesNotice span:hover {
	text-decoration: underline;
}

.uploadButtons {
	display: flex;
	gap: 16px;
	justify-content: center;
}

.uploadButtons > .button {
	margin-left: 0;
	margin-right: 0;
}

.dropArea {
	margin: auto;
	width: 100%;
	max-width: 500px;
	height: 250px;
	border: 2px dashed var(--background-1);
	border-radius: 5px;
	margin-top: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

.dropArea > * {
	pointer-events: none;
}

.dropArea > p {
	margin: 0;
	margin-top: 5px;
}

.levelSelector {
	text-align: center;
	position: relative;
	margin-bottom: 20px;
}

.levelSelector > p:nth-of-type(1) {
	margin: 0;
	font-weight: normal;
	font-size: 12px;
}

.levelSelector > p:nth-of-type(2) {
	margin: 0;
	font-weight: normal;
	font-size: 32px;
	margin-bottom: -5px;
}

.levelSelector > p:nth-of-type(3) {
	margin: 0;
	font-weight: normal;
	font-size: 18px;
	margin-bottom: 10px;
}

.levelSelector > img:nth-of-type(1) {
	width: min(300px, calc(100% - 96px));
	height: 200px;
	object-fit: cover;
	border-radius: 5px;
	overflow: hidden;
	display: block;
	margin: auto;
}

.levelSelector > img:nth-of-type(2) {
	position: absolute;
	top: 50%;
	left: 0px;
	width: 48px;
	height: 48px;
	transform: translateY(-50%);
}

.levelSelector > img:nth-of-type(3) {
	position: absolute;
	top: 50%;
	right: 0px;
	width: 48px;
	height: 48px;
	transform: translateY(-50%);
}

.levelSelector > img:nth-of-type(2), .levelSelector > img:nth-of-type(3) {
	opacity: 0.5;
	cursor: pointer;
}

.levelSelector > img:nth-of-type(2):hover, .levelSelector > img:nth-of-type(3):hover {
	opacity: 0.75;
}

hr {
	margin-top: 20px;
	margin-bottom: 20px;
}

input[type="checkbox"] {
	margin-top: 10px;
}

input[type="checkbox"] + label {
	display: inline-block;
	vertical-align: top;
	margin-top: 10px;
	line-height: 28px;
	padding-left: 10px;
}

.newPackName {
	width: 100%;
	max-width: 500px;
	margin-top: 10px;
}

.newPackDescription {
	width: 100%;
	max-width: 500px;
	height: 100px;
	margin-top: 10px;
}
</style>