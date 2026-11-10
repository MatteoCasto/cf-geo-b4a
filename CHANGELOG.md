# Changelog

Toutes les modifications notables du support de cours. Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), numérotation [SemVer](https://semver.org/lang/fr/) (règles dans le README). Chaque version porte un tag git `vX.Y.Z`. Dès la version 1.0.0 (premier jour de cours), la syntaxe des pages reste rétrocompatible.

## [Non publié]

### Ajouté
- Tests statiques `node tests/check.mjs` : pages de `config.js`, JavaScript inline, encadrés `:::` et `???`, liens internes, numérotation, absence de données internes.
- Chapitre 5 **Importer et étendre** : modèles de base de la Confédération (`IMPORTS`), extension d'un modèle cantonal par une commune (`TOPIC … EXTENDS`, `CLASS … (EXTENDED)`), lecture polymorphique (composant « Un fichier, deux lectures »).
- Chapitre 6 **Le modèle qui dit non** : `UNIQUE` sur plusieurs attributs, `MANDATORY CONSTRAINT` (traduire « si… alors… »), `EXISTENCE CONSTRAINT`, banc des contraintes interactif.

- Chapitre 4 **La MO en INTERLIS 1** : DM.01-AV-CH et ses thèmes, extrait du thème Biens-fonds, lecteur ITF ↔ plan (décodage de chaque ligne avec le modèle, lecture pas à pas, téléchargement de l'ITF fictif), ouverture dans QGIS par glisser-déposer.
- Outil `node tests/renumber-figures.mjs` : renumérote les « Fig. N.x » selon config.js ; les tests vérifient la cohérence et refusent les renvois « chapitre N » (on cite le titre).
- Chapitre INTERLIS 2 : section « Le même arbre en XTF 2.4 » (XTF 2.3 et 2.4 côte à côte, tableau des différences).
- Aide-mémoire : cartes « XTF 2.4 », « Importer et étendre », « Contraintes ».

### Modifié
- Mise à jour 2025-2026 : frise (INTERLIS 2.4 / eCH-0031 en 2017, révision 2024 ; DMAV en vigueur au 1.1.2024, délai transitoire au 31.12.2027), tableau des modèles du chapitre Outils, notes formateur.
- Renumérotation des chapitres ; les renvois entre chapitres et les prérequis citent désormais le titre du chapitre, plus son numéro.

## [0.1.0] – 2026-11-10

Première version numérotée.

Le cours porte désormais sur **INTERLIS** (et plus sur la géomatique en général). Le contenu du premier jet INTERLIS (`C:\00_COURS_INTERLIS`, premier jet du 30.09.2026) est migré dans le format de ce dépôt : en-têtes dans `config.js`, texte en Markdown dans les pages.

### Ajouté
- Chapitres INTERLIS : 1 Pourquoi INTERLIS ?, 2 Modéliser le territoire, 3 INTERLIS 1, 4 INTERLIS 2, 5 Atelier .ili, 6 Contrôler les données, 7 Outils et pratique, 8 Quiz final ; annexe A Aide-mémoire. Composants interactifs repris à l'identique (jeu du téléphone, frise, croquis, éditeur SURFACE/AREA, ITF annoté, banc des cardinalités, atelier avec diagramme UML, chasse aux erreurs, chaîne d'outils).
- Nouveaux blocs de syntaxe (aucune syntaxe existante modifiée) :
  - encadré `:::prof` (note formateur), affiché seulement avec le bouton « Notes formateur » du menu, jamais imprimé ;
  - coloration des blocs de code `ili`, `ili1`, `itf`, `xtf` (et `<?xml … ?>`) ;
  - mots reliés entre blocs de code : `data-links` et `data-group` sur `<script type="text/x-code">` ;
  - `config.js` : champ `info` (cases libres de l'en-tête de chapitre) et champ `hidden` (page hors menu) ;
  - quiz : champ facultatif `code` (extrait affiché sous la question).
- Marqueurs SVG partagés pour les diagrammes UML (`#tri`, `#dia`, `#arr-acc`).

### Modifié
- Titre, manifeste de l'application et accueil : « Cours INTERLIS ».
- Le guide de rédaction est conservé, mais **retiré du menu** (accessible par son adresse `guide.html` uniquement). Ses exemples utilisent maintenant INTERLIS et il documente les nouveaux blocs.
- Mise en page en une colonne pour l'atelier et le banc de contrôle (la colonne de contenu fait 880 px).

### Supprimé
- Chapitres de démonstration en géomatique : systèmes de référence, GNSS, nivellement, LiDAR, analyse spatiale.

## Avant 0.1.0

- Gabarit de démonstration (géomatique), non numéroté : moteur Markdown, menu généré, annotations exportables, application hors ligne.

[Non publié]: https://github.com/MatteoCasto/cf-geo-b4a/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/MatteoCasto/cf-geo-b4a/releases/tag/v0.1.0
