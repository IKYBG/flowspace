/* ══ PRÉCOMPILATION DU JSX ═════════════════════════════════════════════════
   Ce que ce script résout : l'application servait 1,7 Mo de JSX transpilé
   DANS LE NAVIGATEUR, à chaque ouverture, par Babel Standalone — lui-même un
   téléchargement de ~2,5 Mo. Mesuré avant : 892 ms au premier pixel en
   localhost, machine de bureau, cache chaud. Sur un téléphone en 4G, c'est
   plusieurs secondes d'écran vide au seul moment où l'utilisateur n'a aucune
   raison d'attendre — il n'a encore rien investi.

   Pourquoi PAS une réécriture en modules (le dossier app-vite) : ce squelette
   compte 112 lignes contre 31 644 ici. Porter l'application entière vers des
   imports ES demanderait de démêler 29 blocs qui se partagent l'état par des
   globals (window.X) et dépendent de leur ordre d'exécution. Des semaines de
   risque de régression, pour exactement le même gain de vitesse.

   Ce script fait donc le strict nécessaire : il transpile chaque bloc AU MÊME
   ENDROIT, dans le MÊME ORDRE, et retire Babel du navigateur. Aucun module,
   aucun bundle, aucune dépendance nouvelle entre blocs — la sémantique de
   l'application est rigoureusement identique. C'est aussi ce qui rend la
   migration réversible : supprimer ce fichier et servir index.html remet
   l'ancien fonctionnement.                                                  */

import { transformSync } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';

const SORTIE = 'dist';
const src = readFileSync('index.html', 'utf8');

let nbBlocs = 0, avant = 0, apres = 0;

/* Chaque bloc est transpilé isolément — exactement ce que faisait Babel
   Standalone au runtime. Les réglages reproduisent le preset "react"
   classique (React.createElement), puisque React est un global UMD et non un
   import : passer au runtime automatique casserait tout. */
let out = src.replace(
  /<script\s+type="text\/babel"[^>]*>([\s\S]*?)<\/script>/g,
  (_bloc, code) => {
    nbBlocs++;
    avant += code.length;
    const { code: js } = transformSync(code, {
      loader: 'jsx',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      /* Cible moderne : on ne veut PAS qu'esbuild réécrive autre chose que le
         JSX. Toute transformation supplémentaire serait un changement de
         comportement non demandé. */
      target: 'es2020',
      /* SURTOUT PAS de format: 'iife'. esbuild envelopperait alors chaque bloc
         dans une fonction, et toute déclaration top-level cesserait d'être
         globale. Or c'est précisément ainsi que les 29 blocs se parlent :
         `function Shell(...)` déclaré dans l'un est visible dans les suivants.
         Les envelopper casse ce contrat en silence — l'application démarre,
         puis un composant manque au moment où on l'ouvre. Aucun format : la
         sortie reste du script de haut niveau, exactement comme l'entrée. */
      minify: false,
    });
    apres += js.length;
    return `<script>\n${js}</script>`;
  }
);

if (nbBlocs === 0) {
  console.error('ARRÊT : aucun bloc text/babel trouvé — index.html a changé de forme.');
  process.exit(1);
}

/* Babel n'a plus rien à faire dans le navigateur. C'est le gain le plus
   important du script : le fichier lui-même pèse plus que tout le code de
   l'application. */
const avecBabel = out.length;
out = out.replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^"]*"[^>]*><\/script>/g, '');
/* Le PRELOAD aussi, et c'est le plus important des deux : un preload est une
   requête haute priorité, donc c'était 2,5 Mo réclamés avant tout le reste,
   en concurrence avec le HTML lui-même — pour un fichier devenu inutile.
   Oublier cette ligne annulait la quasi-totalité du gain. */
out = out.replace(/\s*<link[^>]*@babel\/standalone[^>]*>/g, '');
/* On teste l'URL, pas le mot : « Babel » peut légitimement subsister dans un
   garde-fou de détection de CDN. Ce qui compte est qu'aucun TÉLÉCHARGEMENT ne
   reste — c'est ça, le coût. */
const babelRetire = out.length < avecBabel && !/babel\/standalone/i.test(out);

/* Le garde-fou qui affiche une erreur si un CDN tombe cible aussi Babel :
   sans cette ligne, l'application croirait Babel manquant et refuserait de
   démarrer alors qu'elle n'en a plus besoin. */
out = out.replace(/window\.Babel/g, '(window.Babel || true)');

/* force + maxRetries : sous Windows, un serveur de préversion qui sert dist/
   garde un verrou sur les fichiers, et un rmSync nu échoue en ENOTEMPTY au
   milieu du build. On réessaie au lieu de casser. */
if (existsSync(SORTIE)) rmSync(SORTIE, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 });
mkdirSync(SORTIE, { recursive: true });
writeFileSync(`${SORTIE}/index.html`, out);

for (const actif of ['manifest.json', 'sw.js', 'logo.png', 'bg.png', 'bg2.png', 'icons', 'assets']) {
  if (existsSync(actif)) cpSync(actif, `${SORTIE}/${actif}`, { recursive: true });
}

const ko = n => (n / 1024).toFixed(0) + ' Ko';
console.log(`blocs transpilés   : ${nbBlocs}`);
console.log(`JSX source         : ${ko(avant)}`);
console.log(`JS produit         : ${ko(apres)}`);
console.log(`Babel retiré       : ${babelRetire ? 'oui (~2,5 Mo de moins à télécharger)' : 'NON — À VÉRIFIER'}`);
console.log(`index.html final   : ${ko(out.length)} (source ${ko(src.length)})`);
