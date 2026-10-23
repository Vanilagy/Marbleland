import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const STUB_PREFIX = '\0server-stub:';

export default defineConfig(({ isSsrBuild }) => ({
	root: 'client',
	plugins: [
		vue(),
		{
			name: 'stub-server-imports',
			enforce: 'pre',
			async resolveId(source, importer, options) {
				if (options.ssr || !/\/server\/ts\//.test(source)) return null;

				let resolved = await this.resolve(source, importer, { skipSelf: true });
				return STUB_PREFIX + resolved!.id;
			},
			load(id) {
				if (!id.startsWith(STUB_PREFIX)) return null;

				let source = fs.readFileSync(id.slice(STUB_PREFIX.length), 'utf-8');
				let names = new Set(
					[...source.matchAll(/^export (?:async )?(?:const|let|var|function|class|enum|interface|type) (\w+)/gm)]
						.map(match => match[1])
				);

				return [...names].map(name => `export const ${name} = undefined;`).join('\n');
			}
		}
	],
	build: isSsrBuild ? {
		outDir: '../server',
		emptyOutDir: false,
		copyPublicDir: false,
		rolldownOptions: {
			input: path.join(import.meta.dirname, 'server/ts/index.ts'),
			checks: { eval: false }, // Cuz of hxTorquescript
			output: {
				entryFileNames: 'server_bundle.js',
				codeSplitting: false
			}
		}
	} : {
		outDir: '../dist',
		emptyOutDir: true,
		assetsDir: 'bundle',
		rolldownOptions: {
			output: { codeSplitting: false }
		}
	}
}));
