<template>
	<div class="packPanelWrapper">
		<div class="panel notSelectable" @click="clicked">
			<img :src="imageSource" @error="imageLoadError" v-if="imageShown" class="mainImage">
			<div class="bottom">
				<div class="name">{{packInfo.name}}</div>
				<div class="creator">
					<img :src="avatarSrc" :style="{ opacity: avatarOpacity }">
					<p>{{packInfo.createdBy.username}}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { PackInfo } from '../../shared/types';
import { Util } from '../ts/util';

export default Vue.defineComponent({
	props: {
		packInfo: Object as PropType<PackInfo>
	},
	data() {
		return {
			imageShown: true
		};
	},
	computed: {
		imageSource(): string {
			return `/api/pack/${this.packInfo.id}/image`;
		},
		avatarSrc(): string {
			if (!this.packInfo.createdBy.hasAvatar) return "/assets/svg/account_circle_black_24dp.svg";
			return `/api/account/${this.packInfo.createdBy.id}/avatar?size=32`;
		},
		avatarOpacity(): number {
			return this.packInfo.createdBy.hasAvatar? 1 : 0.75;
		},
	},
	methods: {
		clicked(): void {
			this.$router.push({ name: 'Pack', params: { id: this.packInfo.id } });
		},
		imageLoadError() {
			this.imageShown = false;
		}
	}
});
</script>

<style scoped>
.packPanelWrapper {
	position: relative;
}

.panel {
	width: 242px;
	height: 200px;
	background: rgb(240, 240, 240);
	overflow: hidden;
	border-radius: 5px;
	position: relative;
	cursor: pointer;
	transition: box-shadow 0.15s;
}

.panel:hover {
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
}

.mainImage {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.name {
	font-size: 16px;
	height: 20px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 20px);
}

.creator {
	display: flex;
	align-items: center;
}

.creator img {
	width: 14px;
	height: 14px;
	margin-right: 5px;
	border-radius: 1000px;
}

.creator p {
	font-size: 12px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
	width: calc(100% - 20px);
	flex: 1 1 auto;
	margin: 0;
}

.bottom {
	position: absolute;
	left: 0;
	bottom: 0;
	padding: 3px 9px;
	width: 100%;
	background: rgba(240, 240, 240, 0.9);
}
</style>