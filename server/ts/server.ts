import * as path from 'path';
import * as express from 'express';
import * as fs from 'fs-extra';
import { createApp } from '../../shared/app';
import { renderToString } from '@vue/server-renderer';
import { renderHeadToString } from '@vueuse/head';
import serialize from 'serialize-javascript';
import { Util } from './util';
import { authorize, getSignInInfo, setTokenCookie } from './account';
export const app = express();

export const startHTTPServer = (port: number) => {
	app.set('trust proxy', true);

	app.use(express.static(path.join(__dirname, '../dist'), {
		index: false,
		setHeaders(res) {
			res.set('Cache-Control', 'public, max-age=604800');
		}
	}));

	app.get('*', async (req, res, next) => {
		if (!req.url.includes('.')) {
			let html = await generateHTML(req, res);
			
			res.set('Content-Type', 'text/html');
			res.set('Cache-Control', 'no-cache, no-store');
			res.send(html);
		} else {
			next();
		}
	});

	app.listen(port, () => {
		console.log(`Started HTTP server on port ${port}.`);
	});
};

export const generateHTML = async (req: express.Request, res: express.Response) => {
	let template = (await fs.readFile(path.join(__dirname, '../dist/index.html'))).toString();
	let { app, router, head, store } = createApp();

	router.push(req.url);
	await router.isReady();

	let { doc: accountDoc, token } = await authorize(req);
	if (accountDoc) {
		let signInInfo = await getSignInInfo(accountDoc);
		store.state.loggedInAccount = signInInfo.profile;
		store.state.ownPacks = signInInfo.packs;
		store.state.acknowledgedGuidelines = signInInfo.acknowledgedGuidelines;
		setTokenCookie(res, token); // Update its expiration date
	}

	let rendered = await renderToString(app);
	let { headTags } = renderHeadToString(head);

	template = Util.replaceMultiple(template, {
		'<!-- ssr head -->': headTags,
		'<!-- ssr state -->': `<script>window.INITIAL_STATE = ${serialize(store.state)};</script>`,
		'<!-- ssr body -->': rendered
	});

	return template;
};