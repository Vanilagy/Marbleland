<template>
	<Head>
		<title>About Curator scores - Marbleland</title>
		<meta name="og:title" content="About Curator scores">
	</Head>
	<h1>About Curator scores</h1>
	
	<p>
		Because Marbleland places very few constraints on level quality besides banning obvious "object spam" levels, Curator scores aim to separate low-effort, spammy ("sloppy") Marbleland levels from high-effort ones without banning them outright. Accounts designated as "Curator" are able to +1 or -1 a level's Curator score. Once a level falls <em>below</em> a score of -1, it is no longer considered "relevant" and can be hidden from the home page, in the level search, and by any third-party application that uses Marbleland's archive.
	</p>

	<p>
		Curators should aim to rate levels not based on their personal subjective taste in levels but based on the apparent objective effort, creativity, quality and intention visible in the level. In case an uploader uploads multiple similar levels that, when taken together, appear spammy, then it is okay to downvote all but one of these levels. Since the threshold score is below -1, two Curators are required to mark a level as irrelevant. This is so that consensus from multiple people is required to make such a decision. Levels that clearly violate the <span @click="$router.push('/content-guidelines')" class="contentGuidelinesLink">content guidelines</span> beyond just being "meh" should be deleted by moderators in addition to being downvoted by Curators.
	</p>

	<p>
		Moderators can nominate accounts as Curators (including themselves). Only Curators are able to see and affect Curator scores.
	</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Head } from '@vueuse/head';

export default defineComponent({
	components: {
		Head
	}	
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin: 30px 0px;
}

.contentGuidelinesLink {
	cursor: pointer;
	font-weight: bold;
}

.contentGuidelinesLink:hover {
	text-decoration: underline;
}
</style>