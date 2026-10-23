import App from '../client/vue/App.vue';
import * as vue from 'vue';
import { store as defaultStore, createNewStore } from '../client/ts/store';
import { createNewRouter } from '../client/ts/router';
import { createHead as createClientHead } from '@unhead/vue/client';
import { createHead as createServerHead } from '@unhead/vue/server';

const isServer = import.meta.env.SSR;

export const createApp = () => {
	let app = isServer? vue.createSSRApp(App as any) : vue.createApp(App as any);
	let router = createNewRouter();
	let head = isServer? createServerHead({ disableDefaults: true }) : createClientHead();
	let store = isServer? createNewStore() : defaultStore;

	app.use(store);
	app.use(router);
	app.use(head);

	return { app, router, head, store };
};