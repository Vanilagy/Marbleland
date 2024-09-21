<template>
	<Head>
		<title>About level uploading - Marbleland</title>
		<meta name="og:title" content="About level uploading">
	</Head>
	<h1>About level uploading</h1>
	
	<h3>How to upload levels</h3>
	<p>
		Marbleland allows you to upload a single level or multiple at once (batch upload). You'll need to upload a .zip archive that contains everything custom you made for your level that isn't already included in the base game (PlatinumQuest). More specifically, it needs to have the following files: For each level, please include the level itself (in form of a .mis mission file), an image thumbnail for it and all the required custom interiors (.difs) you made for it. Should you have used custom textures, skies, shapes or sounds, you'll need to include those as well. You can throw all these files into a .zip archive without any required directory structure - Marbleland will figure it out automatically.
	</p>
	<p>
		Levels you upload must follow our <span @click="$router.push('/content-guidelines')" class="contentGuidelinesLink">content guidelines</span>.
	</p>

	<h3>Understanding the process</h3>
	<p>
		It can be important to understand how the upload process works to make sure you'll be able to upload your own levels without any complications.
	</p>
	<p>
		There are two main problems level uploads pose: Firstly, people structure their level folders differently and Marbleland doesn't want to impose any hard restrictions on how a .zip must look like, yet it still has to be able to figure out what files go where. Secondly, it has to make sure that only levels (and nothing else) are uploaded to the site, because it isn't meant to be a generic file hosting service. Marbleland therefore employs the following algorithm for making sense of the .zips you upload:
	</p>
	<p>
		As a first step, the .zip you upload is "flattened" on the server. This means that the entire directory structure is removed and you're left with a single root directory containing all of the files. Then, starting from every .mis file, Marbleland scans your levels for all necessary dependencies (for example, your .dif files) and stores them. Note that due to this process, files that aren't a requirement of your level (such as a README) won't be included in the final level bundle - Marbleland only stores exactly what is needed for your level. At the very end of the process, all of your levels' assets are placed into <i>normalized folder structures</i> - that is, one that can easily be merged with the PQ data folder to complete installation.
	</p>

	<h3>Potential upload errors</h3>
	<p>Sometimes, the .zip you uploaded might still have problems and Marbleland will tell you what it didn't like. Here's an explanation of a few of these:</p>
	<ul>
		<li><b>"Duplicate: This mission has already been uploaded":</b> An identical .mis file to the one you uploaded is already in the level database. We want to make sure Marbleland stays as free of duplicates as we can.</li>
		<li><b>"The level is missing an image thumbnail":</b> All levels uploaded must contain a thumbnail to accompany it.</li>
		<li><b>"The dependency X could not be uniquely resolved to a file in the archive":</b> Remember that "flattening" step from earlier? Because of this step, file names are the only differentiating factor between files and sometimes, this can lead to Marbleland being unsure about which files belong to what. Assume your level includes an interior that uses the texture "wood", but your .zip file includes both "wood.jpg" and "wood.png". Marbleland can't guess which one you meant and therefore complains about it.</li>
		<li><b>"Missing dependency: X is required by Y but couldn't be found":</b> This simply means that one of your levels requires assets that you forgot to include in your .zip. Say your .mis file uses the interior "myinterior.dif", but you didn't include that .dif with your .zip - then you're missing a dependency.</li>
	</ul>

	<h3>Controlling level classification</h3>
	<p>
		Marbleland tries its best to guess a level's modification (the game it's meant to run in) and type (singleplayer/multiplayer) by looking at the mission and the assets it uses. However, sometimes it will get it wrong. You can therefore precisely control this classification by setting specific fields in your level's MissionInfo:<br><br>
		Set the <b>game</b> or <b>modification</b> field to one of <b>gold</b>, <b>platinum</b>, <b>fubar</b>, <b>ultra</b> or <b>platinumquest</b> to set the level's modification.<br>
		Set the <b>gameType</b> field to either <b>singleplayer</b> or <b>multiplayer</b> to set the level's game type.
	</p>

	<h3>Manually defining dependencies</h3>
	<p>
		Marbleland will typically properly detect all level dependencies automatically. However, in niche use cases where Marbleland cannot detect a dependency, you can manually tell it about it by using a <code>// @include &lt;file path&gt;</code> directive in the top level of the .mis file. Here's an example:
	</p>
	<div style="display: block;">
		<code style="padding: 3px; background: rgba(0, 0, 0, 0.15); border-radius: 5px;">
			// @include "~/data/shapes/abc/myshape.dts"
		</code>
	</div>
	<p>
		This will tell it that your archive contains a file "myshape.dts" which you want to be put into the "shapes/abc" directory.
	</p>

	<h3>Additional notes</h3>
	<p>
		The hard size cap for the .zips you upload is 100 MB (we think this will be more than enough). All of this goes without saying that we still ask you to use the level upload system responsibly and for Marble Blast-related content only.
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