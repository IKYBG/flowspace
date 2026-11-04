import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const nativeDeps = join(projectRoot, '.local-deps', `${process.platform}-${process.arch}`);
export const esbuildVersion = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8')).devDependencies.esbuild;

export async function loadEsbuild() {
  const candidates = [createRequire(import.meta.url), createRequire(join(nativeDeps, 'package.json'))];
  for (const require of candidates) {
    try {
      const builder = require('esbuild');
      if (builder.version !== esbuildVersion) continue;
      builder.transformSync('const ready = true;', { loader: 'js' });
      return builder;
    } catch {
      // Une copie Windows peut contenir le bon wrapper JS et le mauvais binaire.
    }
  }
  throw new Error('esbuild natif indisponible. Lance npm ci pour une nouvelle installation, ou npm run setup:native pour conserver les dépendances de l’autre OS.');
}
