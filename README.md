# Flowspace / LumenOS

Application web de productivité avec un tableau de bord personnalisable, des tâches, des notes et des ambiances sonores pour accompagner les sessions de travail. Le dépôt conserve le nom `flowspace` ; le produit est présenté sous le nom **LumenOS**.

[Découvrir l’application](https://lumen-mauve-five.vercel.app/)

## Fonctionnalités

- Tableau de bord personnalisable : widgets, thèmes, opacité et images.
- Gestion de tâches et prise de notes.
- Sessions de concentration avec une progression représentée par des cristaux.
- Sons d’ambiance synthétisés avec la Web Audio API.
- Application installable sous forme de PWA.

## Technologies et architecture

- HTML, CSS et JavaScript avec React 18 et ReactDOM chargés depuis un CDN.
- GSAP pour les animations.
- Supabase pour l’authentification et les données.
- esbuild pour précompiler le JSX avant le déploiement.
- Manifest et service worker pour la PWA.

L’application principale se trouve dans `index.html` à la racine. `build.mjs` précompile les blocs JSX et génère `dist/` ; ce dossier est un artefact de build. Le dossier `app-vite/` contient une amorce de migration et n’est pas le point d’entrée de l’application actuelle.

## Lancement local

Prérequis : Node.js et npm. Depuis la racine du dépôt :

```bash
npm ci
npm start
```

Ouvrir l’adresse affichée par le serveur local. Les fonctionnalités connectées dépendent de la configuration Supabase du projet et de ses règles d’accès.

## Build et aperçu

```bash
npm run build
npx serve dist
```

Le build génère la version précompilée dans `dist/`. Vérifier cette version dans le navigateur avant un déploiement. Les dépendances chargées depuis des CDN nécessitent un accès réseau lors du premier chargement.

## Repères dans le dépôt

| Fichier ou dossier | Rôle |
| --- | --- |
| `index.html` | Interface et logique de l’application principale |
| `build.mjs` | Précompilation du JSX et copie des ressources vers `dist/` |
| `manifest.json`, `sw.js` | Installation et cache de la PWA |
| `assets/`, `icons/` | Ressources visuelles et icônes |
| `vercel.json` | Configuration du déploiement et des en-têtes |

## État du projet

Projet en évolution. L’architecture reste concentrée dans un fichier principal ; une modularisation constitue une piste d’amélioration. Le `package.json` à la racine fournit les commandes de lancement et de build, sans commande de test automatisé.
