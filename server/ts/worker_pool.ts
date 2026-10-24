import { ChildProcess, spawn } from 'node:child_process';
import { workerCommands, WorkerCommands, WorkerMessage, WorkerRequest } from './worker';

const POOL_SIZE = 4;
const HEAP_LIMIT_MB = 1024;
const STARTUP_CRASH_RESPAWN_DELAY = 1000; // In milliseconds
const JOB_TIMEOUT = 1000; // In milliseconds

type WorkerClient = {
	[K in keyof WorkerCommands]: (...args: Parameters<WorkerCommands[K]>) => Promise<ReturnType<WorkerCommands[K]>>
};

interface Job {
	id: number,
	command: keyof WorkerCommands,
	args: unknown[],
	resolve: (result: unknown) => void,
	reject: (error: Error) => void
}

interface WorkerProcess {
	child: ChildProcess,
	ready: boolean,
	job: Job | null,
	timeoutTimer: NodeJS.Timeout | null
}

const processes = new Set<WorkerProcess>();
const queue: Job[] = [];
let nextJobId = 0;

export const workers = Object.fromEntries(Object.keys(workerCommands).map(command => [
	command,
	(...args: unknown[]) => new Promise((resolve, reject) => {
		queue.push({
			id: nextJobId++,
			command: command as keyof WorkerCommands,
			args,
			resolve,
			reject
		});
		dispatch();
	})
])) as WorkerClient;

export const startWorkerPool = () => {
	for (let i = 0; i < POOL_SIZE; i++) spawnProcess();
};

const spawnProcess = () => {
	// The server bundle doubles as the worker, it just gets started in a different mode
	let child = spawn(process.execPath, [`--max-old-space-size=${HEAP_LIMIT_MB}`, process.argv[1], 'worker'], {
		serialization: 'advanced',
		// stderr matters
		stdio: ['ignore', 'ignore', 'inherit', 'ipc']
	});
	let workerProcess: WorkerProcess = {
		child,
		ready: false,
		job: null,
		timeoutTimer: null
	};
	processes.add(workerProcess);

	child.on('message', (message: WorkerMessage) => {
		if ('ready' in message) {
			workerProcess.ready = true;
			dispatch();
			return;
		}

		if (workerProcess.job?.id !== message.id) return;

		let job = workerProcess.job;
		clearTimeout(workerProcess.timeoutTimer);
		workerProcess.job = null;

		if ('error' in message) job.reject(new Error(message.error));
		else job.resolve(message.result);

		dispatch();
	});

	child.on('error', e => console.error('Worker process error:', e));

	child.on('exit', (code, signal) => {
		processes.delete(workerProcess);

		if (workerProcess.job) {
			clearTimeout(workerProcess.timeoutTimer);
			workerProcess.job.reject(new Error(`Worker process died while running ${workerProcess.job.command} (exit code ${code}, signal ${signal}), likely out of memory.`));
		}

		// Don't hammer the system if processes die before they even get going
		if (workerProcess.ready) spawnProcess();
		else setTimeout(spawnProcess, STARTUP_CRASH_RESPAWN_DELAY);
	});
};

const dispatch = () => {
	for (let workerProcess of processes) {
		if (queue.length === 0) return;
		if (!workerProcess.ready || workerProcess.job) continue;

		let job = queue.shift();
		workerProcess.job = job;

		workerProcess.timeoutTimer = setTimeout(() => {
			processes.delete(workerProcess);
			workerProcess.job = null;
			job.reject(new Error(`Worker job ${job.command} timed out after ${JOB_TIMEOUT} ms.`));
			workerProcess.child.kill('SIGKILL');
		}, JOB_TIMEOUT);

		let request: WorkerRequest = {
			id: job.id,
			command: job.command,
			args: job.args
		};
		workerProcess.child.send(request);
	}
};
