import { createApp } from '../../shared/app';
import { SignInInfo } from '../../shared/types';
import { store } from './store';

let { app, router } = createApp();
app.use(router).use(store);
if ((window as any)["INITIAL_STATE"]) store.replaceState((window as any)["INITIAL_STATE"]);

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