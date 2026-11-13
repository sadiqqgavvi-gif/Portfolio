// Removes the previous production build from the repository root before a new one is written.
// Only build output is touched: hashed bundles in assets/ and the copies of app/public/.
import { rmSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const targets = ['assets', 'index.html', ...readdirSync(join(root, 'app/public'))];
for (const name of targets) rmSync(join(root, name), { recursive: true, force: true });
