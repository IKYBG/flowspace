import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { projectRoot } from './esbuild.mjs';

// Lire la configuration publique déjà livrée au navigateur évite de surveiller
// un ancien projet après une migration. Ne jamais afficher la valeur de la clé.
const source = readFileSync(join(projectRoot, 'index.html'), 'utf8');
const literal = name => source.match(new RegExp(`const\\s+${name}\\s*=\\s*(['"])(.*?)\\1`))?.[2];
const url = literal('SUPABASE_URL');
const key = literal('SUPABASE_ANON_KEY');
if (!url || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) || !key) throw new Error('Configuration publique Supabase introuvable ou URL inattendue.');
if (!key.startsWith('sb_publishable_')) {
  let role;
  try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch {}
  if (role !== 'anon') throw new Error('Le contrôle réseau accepte uniquement une clé publique publishable ou anon.');
}
try {
  const response = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key }, signal: AbortSignal.timeout(15000) });
  await response.body?.cancel();
  if (!response.ok) throw new Error(`Service Auth Supabase : HTTP ${response.status}. Un refus d’accès n’est pas un succès.`);
  console.log(`Service Auth Supabase ${new URL(url).hostname.split('.')[0]} : HTTP ${response.status}.`);
  console.log('Disponibilité HTTP du service Auth seulement : comptes, données privées et RLS non testés.');
} catch (error) {
  console.error(error.name === 'TimeoutError' ? 'Service Auth Supabase : délai de 15 secondes dépassé.' : error.message);
  process.exitCode = 1;
}
