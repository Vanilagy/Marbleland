import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as serveStatic from 'serve-static';
import * as finalhandler from 'finalhandler';

type RouteHandler = (parameters: Map<string, string>, urlObj: url.URL) => Promise<{
	status?: number,
	body?: string | object | fs.ReadStream,
	headers?: Record<string, string>
}>;

export const routes = new Map<string, RouteHandler | RouteHandler[]>();

export const startHTTPServer = (port: number) => {
	const serve = serveStatic(path.join(__dirname, '../client'), { index: 'index.html' });

	http.createServer(async (req, res) => {
		let urlObj = new url.URL(req.url, 'http://localhost/');
		let pathParts = urlObj.pathname.split('/');
		let routeMatch: string = null;
		let routeMatchParameters: Map<string, string> = null;

		outer:
		for (let [route] of routes) {
			let parts = route.split('/');
			if (pathParts.length !== parts.length) continue;

			let parameters = new Map<string, string>();

			for (let i = 0; i < parts.length; i++) {
				let part = parts[i];
				let pathPart = pathParts[i];

				if (part.startsWith('<') && part.endsWith('>')) {
					parameters.set(part.slice(1, -1), pathPart);
				} else if (part !== pathPart) {
					continue outer;
				}
			}

			routeMatch = route;
			routeMatchParameters = parameters;
			break;
		}

		if (routeMatch) {
			let handlers = routes.get(routeMatch) as RouteHandler[];
			if (!Array.isArray(handlers)) {
				handlers = [handlers];
			}

			try {
				let ended = false;

				for (let handler of handlers) {
					let response = await handler(routeMatchParameters, urlObj);
					if (!response) continue;
					if (!response.status) response.status = 200;
					if (!response.body) response.body = "";
					if (!response.headers) {
						response.headers = {
							'Content-Type': (() => {
								if (response.body instanceof fs.ReadStream) return 'application/octet-stream';
								else if (typeof response.body === 'object') return 'application/json';
								return 'text/plain';
							})()
						};
					}
		
					res.writeHead(response.status, response.headers);
					if (response.body instanceof fs.ReadStream) response.body.pipe(res);
					else if (typeof response.body === 'object') res.end(JSON.stringify(response.body));
					else res.end(response.body);
	
					ended = true;
					break;
				}

				if (!ended) throw new Error("Request was not replied to.");
			} catch (e) {
				console.error("Error during response: ", e);

				res.writeHead(500);
				res.end();
			}
		} else {
			serve(req, res, finalhandler(req, res) as any);
		}
	}).listen(port);

	console.log(`Started HTTP server on port ${port}.`);
};