<template>
	<Head>
		<title>Content guidelines - Marbleland</title>
		<meta name="og:title" content="Content guidelines">
	</Head>
	<h1>Content guidelines</h1>
	
	<h3>Guidelines</h3>
	<p>When uploading your levels to Marbleland, you'll have to follow these guidelines:</p>
	<ul>
		<li><b>Respectful content:</b> Your levels may not contain discriminatory or sexual content.</li>
		<li><b>No duplicates:</b> You may not submit levels that are identical or near-identical to a level already on Marbleland or an original Marble Blast level. Instead, you should upload unique content. If your level is a derivative of someone else's level, credit them as the main artist.</li>
		<li><b>Attribution:</b> You are allowed to upload other people's levels if they haven't been uploaded yet. In fact, this is encouraged as it grows the archive. However, you cannot take any credit for the level. Additionally, if the level's original author doesn't want their level to be on Marbleland, then the level must be deleted.</li>
		<li><b>No spam:</b> Your levels may not contain spammy, excessively long or short, or unrelated titles and descriptions. Additionally, your level design shouldn't rely solely on a high quantity of randomly-arranged objects.</li>
		<li><b>No malicious content:</b> Your levels may not intentionally lag, vandalize or tamper with the game or computer of players.</li>
	</ul>

	<h3>Enforcement</h3>
	<p>If a level doesn't follow these guidelines, <b>it will be deleted</b>. Regular and repeat offenses will lead to <b>account deletion</b>. These guidelines are judged and enforced by the moderators and they will use their discretion and common sense when handling edge cases.</p>

	<h3>Level quality</h3>
	<p>Beyond what is stated above, there is no guideline on the quality of your levels. Measuring quality is subjective and Marbleland wants to be an inviting platform for all level creators, beginner to expert. That being said, we encourage you to put love into your levels to ensure they provide a fun and enjoyable experience for others.</p>

	<div class="buttonArea" v-if="$store.state.loggedInAccount && !$store.state.acknowledgedGuidelines">
		<div :class="{ 'disabled': progress < 1 || processing }">
			<ButtonWithIcon class="acknowledgeButton" icon="/assets/svg/check_black_24dp.svg" @click="acknowledgeGuidelines">
				I have read and will follow the guidelines
			</ButtonWithIcon>

			<ProgressBar v-if="progress < 1" state="neutral" :loaded="progress" :total="1" class="progressBar" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Head } from '@vueuse/head';
import ButtonWithIcon from '../components/ButtonWithIcon.vue';
import ProgressBar from '../components/ProgressBar.vue';

export default defineComponent({
	components: {
		Head,
		ButtonWithIcon,
		ProgressBar
	},
	data() {
		return {
			progress: 0,
			timeoutId: -1,
			processing: false
		};
	},
	mounted() {
		const start = performance.now();

		this.timeoutId = setInterval(() => {
			this.progress = Math.min((performance.now() - start) / 60000, 1);
		}, 1000/60) as unknown as number;
	},
	unmounted() {
		clearInterval(this.timeoutId);
	},
	methods: {
		async acknowledgeGuidelines() {
			this.processing = true;

			try {
				await fetch(`/api/account/acknowledge-guidelines`, {
					method: 'POST'
				});

				this.$store.state.acknowledgedGuidelines = true;
				this.$router.push({ name: 'Upload' });
			} catch (e) {
				console.error(e);
				alert("Something went wrong, try again.");
			} finally {
				this.processing = false;
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

.buttonArea {
	display: flex;
	justify-content: center;
	margin-top: 50px;
}

.acknowledgeButton:hover {
	border-color: #10b981 !important;
}

.progressBar {
	margin-top: 10px;
}
</style>