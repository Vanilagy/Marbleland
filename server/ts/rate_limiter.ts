import express from 'express';

export const MINUTE = 1000 * 60;
export const HOUR = MINUTE * 60;

const windows = new Map<string, { timestamps: number[], interval: number }>();

// Make sure the map doesn't grow forever
setInterval(() => {
	let now = Date.now();
	for (let [key, window] of windows) {
		if (window.timestamps.every(x => now - x >= window.interval)) windows.delete(key);
	}
}, 10 * MINUTE);

/** Allows an action identified by `key` at most `count` times per `interval` milliseconds. Returns false and responds with
 * 429 Too Many Requests if the limit has been reached. */
export const rateLimitRequest = (res: express.Response, key: string, count: number, interval: number) => {
	let now = Date.now();
	let timestamps = (windows.get(key)?.timestamps ?? []).filter(x => now - x < interval);

	if (timestamps.length >= count) {
		windows.set(key, {
			timestamps,
			interval
		});

		res.set('Retry-After', Math.ceil((timestamps[0] + interval - now) / 1000).toString());
		res.status(429).send({
			status: 'error',
			reason: 'Too many requests. Please try again later.'
		});
		return false;
	}

	timestamps.push(now);
	windows.set(key, {
		timestamps,
		interval
	});

	return true;
};
