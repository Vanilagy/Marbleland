import http from 'node:http';
import path from 'node:path';
import { createServer } from 'vite';

if (process.argv[2] === 'worker') {
	// Just using Vite here to run TypeScript directly
	const vite = await createServer({
		server: {
			middlewareMode: true,
			ws: false,
			watch: null
		},
		appType: 'custom'
	});

	await vite.ssrLoadModule(path.join(import.meta.dirname, 'server/ts/index.ts'));
} else {
	const httpServer = http.createServer();
	const vite = await createServer({
		server: {
			middlewareMode: true,
			ws: { server: httpServer } // Serve HMR over the app's own port
		},
		appType: 'custom'
	});

	const { setViteDevServer } = await vite.ssrLoadModule(path.join(import.meta.dirname, 'server/ts/server.ts'));
	setViteDevServer(vite, httpServer);
	await vite.ssrLoadModule(path.join(import.meta.dirname, 'server/ts/index.ts'));
}
