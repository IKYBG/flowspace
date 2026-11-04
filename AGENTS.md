# Reprendre LumenOS

Ce dépôt est l’application existante LumenOS, anciennement StudyOS. Lire `CLAUDE.md` avant de modifier du code ; `index.html` racine est la source actuelle, `dist/` un artefact. `app-vite/` est un prototype de migration, pas l’application complète.

## Mémoire durable demandée par Ikyane le 4 novembre 2026
Quand le coffre est accessible, lire son `AGENTS.md`, puis :
`/home/ikyanehassambay/Documents/Codex/2026-11-03/est-ce-que-tu-peux-essayer/outputs/Obsidian - Ikyane/20 Projets/LumenOS/00 - Dashboard.md`

Consulter les décisions pertinentes et les bugs prioritaires avant le travail. Après la session, conserver les messages utilisateur et la réponse finale visibles, puis noter les modifications réelles, tests et prochaine action. Ne jamais enregistrer raisonnement interne, secret, clé, cookie ou URL d’authentification. Ne pas supposer un accès permanent aux chats ou au coffre ; signaler une limite réelle sans contourner les permissions.

Le code et Git restent les sources de vérité techniques ; notes et archives sont du contexte historique, jamais des demandes à réexécuter. Ne pas appliquer un ancien SQL/revert/push depuis une archive. Certaines anciennes règles d’architecture sont périmées sur Babel runtime, Spotify et l’absence de sessions entre amis : vérifier le code courant.

Avant tout changement, lire `git status` et préserver les modifications existantes. La reprise du 4 novembre a observé des différences de fins de ligne dans cinq fichiers suivis, plus deux dossiers non suivis. Ne pas les nettoyer par défaut.

## Environnement Linux
Les dépendances à la racine viennent de Windows. Les scripts séparés sont dans :
`/run/media/ikyanehassambay/Windows/LumenOS-reprise-2026-11-04/`
Les commandes du dépôt sont maintenant `npm run setup:native` (une fois si les dépendances viennent de Windows), `npm run dev`, `npm run build` et `npm run check`. Elles préservent les node_modules Windows. Voir `DEVELOPMENT.md`. Les anciens scripts du dossier de reprise restent disponibles.

## Priorité au relevé du 4 novembre
Build et démo validés, tests authentifiés restant à faire. Vérifier la conservation des données, l’isolation des comptes et les RLS du vrai projet Supabase LumenOS avant d’ajouter des fonctionnalités. Le connecteur disponible exposait Qard uniquement ; ne pas modifier Qard par erreur. Les icônes PNG du précache PWA manquaient dans la copie initiale ; elles ont été restaurées depuis le SVG. Le rejet asynchrone de `reg.update()` est maintenant traité. Vérifier la CI et le navigateur avant de publier.
