# Animations d’interface — 7 novembre 2026

La référence choisie par Ikyane est la réception d’invitation, l’arrivée des participants et la salle d’attente de session partagée. Leurs mouvements restent la référence visuelle : petite translation, échelle proche de 1, flou bref, rebond souple et retour au calme.

| Usage | Traitement |
|---|---|
| Notifications, en-tête, zones de la barre de session | 400 ms, courbe `--fs-motion-spring` |
| Panneaux texte, catalogue de widgets, profil, amis, boutique, démo et recadrage | 600 ms, même courbe |
| Sortie des notifications | 220 ms, courbe de décélération ; respecte le retrait du composant à 340 ms |
| Mobile | Translation réduite à 12 px et flou réduit à 3 px |
| Mouvements réduits, réglage de l’app ou préférence système | Apparition immédiate et lisible, sans déplacement |

Les nouveaux mouvements de surface libèrent `filter` et `transform` après l’entrée : ils ne doivent pas déplacer le repère des éléments fixes internes. La barre de guidage conserve son centrage propre à chaque largeur d’écran. Les effets artistiques des cristaux, la progression des minuteurs et les signaux fonctionnels restent distincts des transitions de panneaux.

La barre de session reste visible si GSAP ne charge pas. Son entrée JavaScript respecte désormais aussi la préférence de mouvement réduit.

## Validation

Build et contrôles du dépôt ; composants réels dans un banc isolé avec participants synthétiques : invitation → invité → réduction/réouverture, arrivée côté hôte, barre de session, notification et catalogue, largeurs 320/390/1280 px. Vérification complémentaire du guidage, texte, boutique et démonstration. Tests avec préférence système de mouvement réduit et sans GSAP. Ces contrôles portent sur l’interface ; ils ne certifient pas les échanges Realtime entre deux comptes.

## Revenir en arrière

Un seul commit contient cette harmonisation. Le tag `lumenos-before-motion-2026-11-07` désigne la version précédente. Pour annuler sur une branche partagée, utiliser `git revert` sur le commit d’harmonisation, puis pousser le commit d’annulation. Garder le cache PWA croissant lors du retour : passer à `lumenos-v35` plutôt que réutiliser une ancienne version. Ne pas utiliser de reset forcé ni écraser les modifications locales.

Le disque Windows était monté en lecture seule pendant ce travail. La copie Linux utilisée est indiquée dans le bilan de livraison et les notes Obsidian ; les fichiers de travail Windows ont été préservés.
