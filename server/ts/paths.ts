import * as path from 'path';

// In dev, this module runs straight from server/ts, while in prod, it's bundled into server/server_bundle.js
export const SERVER_DIR = import.meta.env.DEV ? path.join(import.meta.dirname, '..') : import.meta.dirname;
