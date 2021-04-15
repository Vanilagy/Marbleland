import * as Vue from 'vue';
import { SignInInfo } from '../../shared/types';
import App from '../vue/App.vue';
import router from './router';
import { store } from './store';

let app = Vue.createApp(App as any).use(router).use(store);

/** Checks the login token and gets sign-in data if available. */
const checkLoginToken = async () => {
	let token = localStorage.getItem('token');
	if (token) {
		// A token has been stored, let's check if it's still valid and get the sign-in data
		let response = await fetch(`/api/account/check-token`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		
		if (!response.ok) {
			// The token isn't valid anymore, remove it
			localStorage.removeItem('token');
		} else {
			// The token was valid, store the sign-in data
			let json = await response.json() as SignInInfo;
			store.state.loggedInAccount = json.profile;
			store.state.ownPacks = json.packs;
		}
	}

	// Finally, show the app
	app.mount('#app');
};
checkLoginToken(); // Do this *before* we even mount the app