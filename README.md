# cf-geo-b4a

Support de cours géomatique (module B4a). **État : gabarit de démonstration**, préparé pour la séance de brainstorming du 10.11.2026.

Le contenu des chapitres est indicatif. Le but est de montrer les formes de pages possibles, pas de fixer le programme.

## Ouvrir le cours

Double-cliquer sur [`cours/index.html`](cours/index.html). Pas de serveur ni d'installation : un navigateur récent suffit (les polices viennent de Google Fonts ; hors ligne, des polices système les remplacent).

En ligne : <https://matteocasto.github.io/cf-geo-b4a/>

## Publication (GitHub Pages)

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publie le dossier `cours/` à chaque push sur `main` qui modifie `cours/` (ou à la main depuis l'onglet *Actions* → *Run workflow*).

Réglage à faire une seule fois sur GitHub : *Settings* → *Pages* → *Build and deployment* → *Source* : **GitHub Actions**.

## Contenu

| Page | Thème (exemple) | Forme démontrée |
|---|---|---|
| `index.html` | Accueil | Animation, cartouche, plan, questions de brainstorming |
| `referentiels.html` | MN03 / MN95 | Carte cliquable + calculateur |
| `gnss.html` | GNSS | Simulation (skyplot, masque, PDOP calculé) |
| `nivellement.html` | Nivellement | Carnet de terrain qui se calcule (fermeture, compensation) |
| `lidar.html` | LiDAR, MNT / MNS | Graphique filtrable avec curseur |
| `analyse.html` | Zone tampon | Outil SIG + code SQL / Python qui suit le réglage |
| `quiz.html` | Tous | Quiz corrigé, score mémorisé |
| `aide-memoire.html` | Tous | Fiche A4 imprimable |
| `composants.html` | — | Catalogue des blocs avec leur HTML à copier |

Fonctions communes (dans `app.js`) : table des chapitres, thème clair / sombre, mode projection (touche `P`), notes formateur masquables, objectifs cochables, navigation au clavier (`←` `→`), blocs de code colorés avec bouton « Copier », mise en page d'impression.

## Ajouter un chapitre

1. Copier une page existante (par ex. `nivellement.html`) et la renommer.
2. Ajouter une ligne dans `CHAPTERS` en haut de [`cours/app.js`](cours/app.js).
3. Assembler les blocs de [`composants.html`](cours/composants.html).

## Pistes

- Export Word / PDF au gabarit CF-geo à partir des mêmes contenus (déjà réalisé pour le cours INTERLIS, réutilisable).
