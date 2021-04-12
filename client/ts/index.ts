import * as Vue from 'vue';
import { ProfileInfo, SignInInfo } from '../../shared/types';
import App from '../vue/App.vue';
import router from './router';
import { store } from './store';

let app = Vue.createApp(App as any).use(router).use(store);

const checkLoginToken = async () => {
	let token = localStorage.getItem('token');
	if (token) {
		let response = await fetch(`/api/account/check-token`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		if (!response.ok) {
			localStorage.removeItem('token');
		} else {
			let json = await response.json() as SignInInfo;
			store.state.loggedInAccount = json.profile;
			store.state.ownPacks = json.packs;
		}
	}

	app.mount('#app');
};
checkLoginToken();