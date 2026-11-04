import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { nativeDeps, esbuildVersion } from './esbuild.mjs';

mkdirSync(nativeDeps, { recursive: true });
writeFileSync(`${nativeDeps}/package.json`, JSON.stringify({
  private: true,
  description: 'Dépendances natives locales, séparées des node_modules partagés entre OS.',
  dependencies: { esbuild: esbuildVersion },
}, null, 2) + '\n');
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
  'install', '--prefix', nativeDeps, '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=30000',
], { stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
console.log(`Dépendances ${process.platform}/${process.arch} prêtes ; node_modules racine conservé.`);
