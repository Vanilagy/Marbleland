import * as path from 'path';
import * as express from 'express';
import * as history from 'connect-history-api-fallback';
import * as bodyParser from 'body-parser';

export const app = express();

export const startHTTPServer = (port: number) => {
	const staticFileMiddleware = express.static(path.join(__dirname, '../client'));

	app.use(staticFileMiddleware);
	app.use(history());
	app.use(staticFileMiddleware); // We do it twice intentionally

	app.listen(port, () => {
		console.log(`Started HTTP server on port ${port}.`);
	});
};