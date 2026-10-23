import * as path from 'path';
import express from 'express';
import * as fs from 'node:fs/promises';
import * as http from 'node:http';
import type { EnvironmentModuleNode, ViteDevServer } from 'vite';
import { renderToString } from 'vue/server-renderer';
import type { SSRHeadPayload } from '@unhead/vue/server';
import serialize from 'serialize-javascript';
import { Util } from './util';
import { authorize, getSignInInfo, setTokenCookie } from './account';
import { SERVER_DIR } from './paths';
export const app = express();

let viteDevServer: ViteDevServer = null;
let devHttpServer: http.Server = null;

export const setViteDevServer = (server: ViteDevServer, httpServer: http.Server) => {
	viteDevServer = server;
	devHttpServer = httpServer;
};

export const startHTTPServer = (port: number, host: string | null) => {
	app.set('trust proxy', 1);

	if (import.meta.env.DEV) {
		app.use(viteDevServer.middlewares);
	} else {
		app.use(express.static(path.join(SERVER_DIR, '../dist'), {
			index: false,
			setHeaders(res) {
				res.set('Cache-Control', 'public, max-age=604800');
			}
		}));
	}

	app.get('/{*splat}', async (req, res, next) => {
		if (!req.path.includes('.')) {
			let html = await generateHTML(req, res);

			res.set('Content-Type', 'text/html');
			res.set('Cache-Control', 'no-cache, no-store');
			res.send(html);
		} else {
			next();
		}
	});

	// In dev, the HTTP server also carries Vite's HMR WebSocket, so it was created before Vite
	let httpServer = import.meta.env.DEV ? devHttpServer : http.createServer();
	httpServer.on('request', app);
	httpServer.listen(port, host ?? undefined, () => {
		console.log(`Started HTTP server on ${host ?? '*'}:${port}.`);
	});
};

export const generateHTML = async (req: express.Request, res: express.Response) => {
	let template: string;
	let createApp: typeof import('../../shared/app').createApp;
	let devStyles = '';

	if (import.meta.env.DEV) {
		let appPath = path.join(SERVER_DIR, '../shared/app.ts');
		template = await fs.readFile(path.join(SERVER_DIR, '../client/index.html'), 'utf-8');
		template = await viteDevServer.transformIndexHtml(req.url, template);
		({ createApp } = await viteDevServer.ssrLoadModule(appPath));

		// In dev, Vite injects component CSS through JS, which would leave the server-rendered page unstyled until all
		// modules have loaded. So inline all of the app's CSS in evaluation order, like the prod build's stylesheet has it.
		// Vite's client adopts these tags by their data-vite-dev-id and keeps them hot-reloaded.
		let cssModules: EnvironmentModuleNode[] = [];
		let visited = new Set<EnvironmentModuleNode>();
		const collectCss = (mod: EnvironmentModuleNode) => {
			if (visited.has(mod)) return;
			visited.add(mod);

			for (let imported of mod.importedModules) collectCss(imported);
			if (/\.css($|\?)/.test(mod.url)) cssModules.push(mod);
		};
		collectCss(viteDevServer.environments.ssr.moduleGraph.getModuleById(appPath)!);

		for (let mod of cssModules) {
			let directUrl = mod.url.includes('?') ? mod.url.replace('?', '?direct&') : mod.url + '?direct';
			let { code } = await viteDevServer.transformRequest(directUrl);
			devStyles += `<style type="text/css" data-vite-dev-id="${mod.id}">${code}</style>`;
		}
	} else {
		template = await fs.readFile(path.join(SERVER_DIR, '../dist/index.html'), 'utf-8');
		({ createApp } = await import('../../shared/app'));
	}

	let { app, router, head, store } = createApp();

	router.push(req.url);
	await router.isReady();

	if (/homeViewPref=all(;|$)/.test(req.headers.cookie ?? '')) {
		store.state.homeViewPref = 'all';
	}

	let { doc: accountDoc, token } = await authorize(req);
	if (accountDoc) {
		let signInInfo = await getSignInInfo(accountDoc);
		store.state.loggedInAccount = signInInfo.profile;
		store.state.ownPacks = signInInfo.packs;
		store.state.acknowledgedGuidelines = signInInfo.acknowledgedGuidelines;
		store.state.curatorVotes = signInInfo.curatorVotes ?? null;
		setTokenCookie(res, token); // Update its expiration date
	}

	let rendered = await renderToString(app);
	let { headTags } = head.render() as SSRHeadPayload;

	template = Util.replaceMultiple(template, {
		'<!-- ssr head -->': headTags + devStyles,
		'<!-- ssr state -->': `<script>window.INITIAL_STATE = ${serialize(store.state)};</script>`,
		'<!-- ssr body -->': rendered
	});

	return template;
};