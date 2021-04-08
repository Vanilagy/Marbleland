import { response } from 'express';
import * as Vue from 'vue';
import { ProfileInfo } from '../../shared/types';
import App from '../vue/App.vue';
import router from './router';
import { store } from './store';

Vue.createApp(App as any).use(router).use(store).mount('#app');

const checkLoginToken = async () => {
	let token = localStorage.getItem('token');
	if (!token) return;

	let response = await fetch(`/api/account/check-token?token=${token}`);
	if (!response.ok) {
		localStorage.removeItem('token');
	} else {
		let json = await response.json() as { profileInfo: ProfileInfo };
		store.state.loggedInAccount = json.profileInfo;
	}
};
checkLoginToken();