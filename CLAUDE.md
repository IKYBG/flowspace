# LumenOS — CLAUDE.md

## Vue produit
LumenOS (repo « flowspace », déployé sur lumenos.vercel.app) est un SaaS gratuit : un dashboard de productivité entièrement personnalisable — widget « Sons de focus » (ambiances sonores synthétisées : pluie, océan, forêt, espace…), horloge, thèmes, opacité, image/gif, plus tâches et notes. Mécanique cœur : une session de travail **forge un cristal** ; le but est d'accumuler des cristaux pour faire grandir et « flexer » son **île de cristal**. Échelle actuelle : early stage, un seul fichier applicatif.

## Hors scope
- Pas d'offre payante pour l'instant (gratuit d'abord).
- Pas de collaboration multi-utilisateurs ni d'espaces d'équipe.
- Pas d'app mobile native — c'est une PWA installable.
- Pas de backend custom : Supabase reste la seule couche données/auth.

## Stack technique non négociable
- Front : **un seul fichier `index.html`** (~31k lignes). React 18.3.1 + ReactDOM en UMD (unpkg), GSAP, supabase-js — tous via CDN.
- **Build de précompilation (depuis 2026-08-07)** : `node build.mjs` transpile le JSX des 29 blocs `text/babel` avec esbuild et écrit `dist/`. Babel Standalone n'est plus chargé par le navigateur. Vercel exécute ce build (`buildCommand`, `outputDirectory: dist`). Mesuré : premier pixel 892 ms → 88 ms, DOM complet 2401 ms → 202 ms.
  - On développe TOUJOURS dans `index.html` à la racine, en JSX, exactement comme avant. Le build ne change ni la structure des blocs, ni leur ordre, ni le partage d'état par globals.
  - `dist/` est un artefact, jamais commité, jamais édité à la main.
  - **Ne jamais ajouter `format: 'iife'` dans `build.mjs`** : cela enfermerait chaque bloc dans une fonction et les déclarations top-level cesseraient d'être globales — les blocs ne se verraient plus. L'app démarre quand même, puis un composant manque à l'ouverture d'un écran.
- Backend : Supabase (auth + données). Sons d'ambiance : synthétisés à la volée via la Web Audio API (aucun fichier, aucun réseau, offline) — plus d'intégration Spotify.
- Déploiement : Vercel depuis la racine du repo. PWA : `manifest.json` + `sw.js`.
- Migration vers un vrai bundler prévue un jour → ne pas écrire de code qui la rende plus difficile (scopes nets, pas de dépendances cachées entre blocs).

## Structure clé
- `index.html` — TOUTE l'app (styles, composants React, logique Supabase, moteur de sons Web Audio). Seul fichier servi par Vercel.
- `sw.js` — service worker PWA (cache `lumenos-vN`).
- `vercel.json` — en-têtes de sécurité + CSP (allowlist des domaines externes).
- `manifest.json`, `icons/`, `assets/`, `logo.png`, `bg.png` — PWA et médias.
- Détails architecture & pièges : @.claude/rules/architecture.md

## Commandes
- `npx serve .` — sert l'app en local depuis la racine (JSX transpilé à la volée : pratique pour développer, mais ce n'est PAS ce qui part en prod).
- `node build.mjs` — précompile vers `dist/`. À lancer avant de mesurer une performance ou de vérifier ce que verra un utilisateur.
- `node generate-icons.js` — régénère les icônes PWA.
- `git push` — ⚠️ DÉPLOIE EN PROD instantanément sur lumenos.vercel.app (pas de staging).

## Règles absolues — ne jamais violer
- Ne jamais commit ni push sans demande explicite de ma part (push = prod live immédiat).
- Ne jamais mettre une clé Supabase `service_role` ou un secret serveur dans `index.html` — seule la clé `anon` publique est autorisée côté client.
- Ne jamais retirer ni affaiblir le CSP / les en-têtes de `vercel.json`.
- Toujours ajouter un nouveau domaine d'API à `connect-src` (vercel.json) avant de l'appeler, sinon il est bloqué.
- Toujours incrémenter `CACHE_NAME` (`lumenos-vN`) dans `sw.js` quand un asset mis en cache change.
- Ne jamais utiliser `import`/ESM dans les blocs `text/babel` (Babel Standalone ne bundle pas — voir @.claude/rules/architecture.md).

## Conventions de code
- Toute modif applicative se fait dans `index.html` à la racine — jamais ailleurs.
- UI en français (`lang="fr"`), orthotypographie soignée : accents obligatoires partout (« Tâches », « Étape », « Durée », « Aperçu »…), jamais de chaîne UI sans accent.
- Glossaire tranché : « Dashboard » et « widget » sont des anglicismes assumés ; tout le reste en français (« Réinitialiser » pas "Reset"). Les noms de thèmes/cristaux sont des noms propres (anglais autorisé).
- Icônes : jamais de glyphe de police (◷ ✓ ✎…) ni d'emoji dans l'UI — utiliser `FsWidgetIcon` (set SVG maison, grille 24, trait 1.9) et `FsCrystalMark` (cristal de récompense) exposés sur `window`.
- Respecter le style local : alias privés préfixés (`_fsSb`, `_uS3`, `_uEff6`) déjà présents — réutiliser le même motif dans le scope concerné.
- Couleurs : utiliser les variables CSS `--mineral-*` / `--theme-*` du `:root` comme source de vérité ; ne pas hardcoder de hex ailleurs.

## Contexte de travail actuel
- 2026-06-13 : un dossier `flowspace-main/` dupliqué (clone complet du projet) a été supprimé. Il n'existe désormais qu'un seul `index.html` (racine) — c'est lui qui part en prod.

## Changelog
- 2026-06-13 : création du CLAUDE.md + fichier de règles d'architecture ; nettoyage du dossier dupliqué.
