import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const source = require.resolve('zxing-wasm/reader/zxing_reader.wasm');
const target = join(process.cwd(), 'public', 'vendor', 'zxing_reader.wasm');

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
