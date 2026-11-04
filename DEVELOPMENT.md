# Développer LumenOS

L’application existante se trouve dans `index.html` à la racine. Le dossier `app-vite/` reste un prototype ; `dist/` est généré. Node.js 22 ou plus récent et Git sont nécessaires.

## Première installation

Sur un nouveau clone :

```sh
npm ci
```

Si les `node_modules` viennent d’un autre OS, les conserver et installer seulement les dépendances natives de la machine :

```sh
npm run setup:native
```

Cette commande installe esbuild 0.28.1 dans `.local-deps/<os>-<architecture>/`, ignoré par Git. Le build utilise d’abord les dépendances compatibles de la racine, puis ce dossier. Les installations Windows et Linux peuvent ainsi coexister.

## Travailler

```sh
npm run dev
```

Ouvrir http://127.0.0.1:4179. Le serveur construit la version utilisée en production et reconstruit après une modification des sources ou des assets. Recharger le navigateur une fois le message « Build prêt » affiché. Il n’y a pas de hot reload. Choisir un autre port si nécessaire : `npm run dev -- --port 4180`.

Pour vérifier un build sans surveiller les fichiers :

```sh
npm run build
npm run check
npm run preview
```

`check` compile la syntaxe des scripts produits, vérifie les fichiers du précache et du manifest PWA ainsi que la présence des protections Vercel. Cela ne valide pas l’authentification, les politiques RLS ou la sauvegarde des données.

`npm run check:services` vérifie en lecture la disponibilité HTTP du service Auth Supabase référencé par le front. Ce contrôle utilise uniquement la clé publique existante, sans l’afficher ; il ne lit pas les lignes des tables. La tâche GitHub existante utilise le même contrôle pour éviter de surveiller un ancien projet.

## Avant un push

1. Lire `AGENTS.md`, le contexte Obsidian accessible, puis `git status`.
2. Modifier la source, jamais `dist/`. Conserver l’ordre et les globals des blocs JSX ; pas d’IIFE ni de renommage global.
3. Si un asset mis en cache change, incrémenter `CACHE_NAME` dans `sw.js`.
4. Exécuter build, check, puis vérifier le parcours touché dans le navigateur et les erreurs console.
5. Examiner `git diff` et sélectionner explicitement les fichiers du sujet.
6. Faire un commit par sujet, puis `git push origin main`.

**Le push sur `main` déclenche la production Vercel.** La CI vérifie build et assets à chaque push/PR ; elle ne remplace pas le test du comportement. Ne pas pousser une fonctionnalité dont la vérification échoue.

La copie récupérée sur Windows comportait déjà des écarts de fins de ligne et des dossiers non suivis. Ne pas utiliser `git add .` ou `git reset --hard` pour les faire disparaître.

## GitHub sur cette machine

La reprise du 4 novembre 2026 a vérifié une clé SSH existante pour `IKYBG` et configuré uniquement l’URL de push locale du dépôt : `git@github.com:IKYBG/flowspace.git`. L’URL de lecture reste HTTPS. Les clés ne font pas partie du projet et ne doivent jamais être commitées ou placées dans Obsidian.

Sur une autre machine, utiliser sa propre authentification GitHub. Test sans publication : `git push --dry-run origin HEAD:refs/heads/main`.

## Données et services

Le front référence le projet Supabase LumenOS `pzbnwyqatgajoodwbjcw`. La clé publique côté client ne donne pas l’accès d’administration. Ne jamais mettre un secret serveur dans le HTML ou dans le coffre Obsidian. Le connecteur Supabase disponible lors de la reprise ne montrait que Qard : il reste à ouvrir le bon compte/projet pour vérifier schéma, RLS et fonctions serveur. Ne pas modifier Qard pour débloquer LumenOS.

Les essais locaux utilisent la base référencée par le front : toute modification avec un vrai compte peut donc être persistée. Employer des comptes de test pour les scénarios de synchronisation ; aucune création ou suppression automatique de données n’est effectuée par les commandes dev/build/check.

## Retour arrière

Les sauvegardes locales initiales se trouvent dans le dossier voisin `LumenOS-reprise-2026-11-04/sauvegarde/` (bundle Git et fichiers courants). Restaurer dans un dossier distinct et comparer. Pour annuler un changement déjà publié, préparer et vérifier un commit de retour arrière ciblé ; ne pas réinitialiser de force une branche partagée.
