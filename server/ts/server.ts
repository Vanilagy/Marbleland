import * as path from 'path';
import * as express from 'express';
import * as fs from 'fs-extra';
import { createApp } from '../../shared/app';
import { renderToString } from '@vue/server-renderer';
import { renderHeadToString } from '@vueuse/head';

export const app = express();

export const startHTTPServer = (port: number) => {
	const staticFileMiddleware = express.static(path.join(__dirname, '../client'));

	app.get('*', async (req, res, next) => {
		if (!req.url.includes('.') && req.headers.accept.includes('text/html')) {
			let html = await generateHTML(req.url);
			res.set('Content-Type', 'text/html');
			res.send(html);
		} else {
			next();
		}
	});

	app.use(staticFileMiddleware);
	//app.use(history());
	//app.use(staticFileMiddleware); // We do it twice intentionally, source: Some issue on GitHub

	app.listen(port, () => {
		console.log(`Started HTTP server on port ${port}.`);
	});
};

export const generateHTML = async (url: string) => {
	let template = (await fs.readFile(path.join(__dirname, '../client/index.html'))).toString();
	let { app, router, head } = createApp();

	router.push(url);
	await router.isReady();

	let rendered = await renderToString(app);
	let { headTags } = renderHeadToString(head);

	template = template.replace('<!-- ssr head -->', headTags);
	template = template.replace('<!-- ssr body -->', rendered);

	return template;
};