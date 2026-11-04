import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve, join, sep, extname } from 'node:path';
import { projectRoot } from './esbuild.mjs';

const preview = process.argv.includes('--preview');
const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const port = Number(portArg >= 0 ? args[portArg + 1] : process.env.PORT || 4179);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Port invalide.');
const root = resolve(projectRoot, 'dist');
let building = false, queued = false, debounce;
const build = () => new Promise((done, reject) => {
  const child = spawn(process.execPath, ['build.mjs'], { cwd: projectRoot, stdio: 'inherit' });
  child.once('error', reject);
  child.once('exit', code => code === 0 ? done() : reject(new Error(`Build échoué (${code}).`)));
});
if (!preview) await build();
if (!existsSync(join(root, 'index.html'))) throw new Error('Build absent : lance npm run build.');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  let relative;
  try { relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const filename = resolve(root, '.' + (relative === '/' ? '/index.html' : relative));
  if (!filename.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    if (!(await stat(filename)).isFile()) { res.writeHead(404).end(); return; }
    const body = await readFile(filename);
    res.writeHead(200, { 'Content-Type': types[extname(filename)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 503).end(); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} occupé. Utilise npm run dev -- --port ${port + 1}.` : error.message); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`LumenOS ${preview ? 'preview' : 'dev'} : http://127.0.0.1:${port}${preview ? '' : ' — reconstruction automatique ; recharge le navigateur après modification.'}`));
const watchers = [];
if (!preview) {
  const rebuild = () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      if (building) { queued = true; return; }
      building = true;
      try { await build(); console.log('Build prêt — recharge le navigateur.'); }
      catch (error) { console.error(error.message); }
      finally { building = false; if (queued) { queued = false; rebuild(); } }
    }, 250);
  };
  // Surveiller le dossier parent : les éditeurs remplacent souvent le fichier
  // par renommage atomique, ce qui détacherait un watch posé sur son ancien inode.
  const sources = new Set(['index.html', 'sw.js', 'manifest.json', 'build.mjs', 'package.json', 'logo.png', 'bg.png', 'bg2.png']);
  watchers.push(watch(projectRoot, (_event, file) => { if (sources.has(String(file))) rebuild(); }));
  for (const name of ['assets', 'icons', 'scripts']) {
    const target = join(projectRoot, name);
    if (existsSync(target)) watchers.push(watch(target, { recursive: true }, rebuild));
  }
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  clearTimeout(debounce); watchers.forEach(w => w.close()); server.close(() => process.exit(0));
});
