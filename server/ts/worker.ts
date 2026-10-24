import { MisParser } from './mis_parser';
import * as hxDif from '../lib/hxDif';
import * as hxDts from '../lib/hxDts';

export interface WorkerRequest {
	id: number,
	command: keyof WorkerCommands,
	args: unknown[]
}

export type WorkerMessage = { ready: true } | { id: number, result: unknown } | { id: number, error: string };

// Everything returned from here crosses the process boundary
export const workerCommands = {
	processMis: (text: string) => {
		let parser = new MisParser(text);

		return {
			misFile: parser.parse(),
			hash: parser.hash(),
			containsCustomCode: parser.containsCustomCode()
		};
	},
	processDif: (buffer: ArrayBuffer) => {
		let dif = hxDif.Dif.LoadFromArrayBuffer(buffer);
		let materials = new Set<string>();
		let usedMaterials = new Set<string>(); // The ones actually referenced by a surface

		for (let interior of dif.interiors.concat(dif.subObjects)) {
			let usedIndices = new Set(interior.surfaces.map(x => x.textureIndex));

			for (let [i, material] of interior.materialList.entries()) {
				materials.add(material);
				if (usedIndices.has(i)) usedMaterials.add(material);
			}
		}

		return {
			materials: [...materials],
			usedMaterials: [...usedMaterials]
		};
	},
	processDts: (buffer: ArrayBuffer) => {
		let dtsFile = new hxDts.DtsFile();
		dtsFile.read(buffer);

		return { materialNames: dtsFile.matNames };
	}
};

export type WorkerCommands = typeof workerCommands;

export const runWorker = () => {
	process.on('disconnect', () => process.exit());

	process.on('message', (request: WorkerRequest) => {
		let response: WorkerMessage;
		try {
			let command = workerCommands[request.command] as (...args: unknown[]) => unknown;
			response = {
				id: request.id,
				result: command(...request.args)
			};
		} catch (e) {
			response = {
				id: request.id,
				error: e instanceof Error ? e.message : String(e)
			};
		}

		process.send(response);
	});

	process.send({ ready: true } satisfies WorkerMessage);
};
