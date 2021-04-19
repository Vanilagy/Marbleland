import App from '../client/vue/App.vue';
import * as vue from 'vue';
import { store } from '../client/ts/store';
import { createNewRouter } from '../client/ts/router';
import { createHead } from '@vueuse/head';

const isServer = typeof window === 'undefined';

export const createApp = () => {
	let app = isServer? vue.createSSRApp(App as any) : vue.createApp(App as any);
	let router = createNewRouter();
	let head = createHead();

	app.use(store);
	app.use(router);
	app.use(head);

	return { app, router, head };
};