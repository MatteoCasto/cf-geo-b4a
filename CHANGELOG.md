# Changelog

Toutes les modifications notables du support de cours. Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), numérotation [SemVer](https://semver.org/lang/fr/) (règles dans le README). Chaque version porte un tag git `vX.Y.Z`. Dès la version 1.0.0 (premier jour de cours), la syntaxe des pages reste rétrocompatible.

## [Non publié]

### Ajouté
- Principe « un document, trois usages » (lecture, diaporama, version étendue imprimée) : `PRINCIPE-MULTI-ROLES.md`.
- **Diaporama** : bouton dans le menu et dans l'en-tête de chaque chapitre, touche `D`. Une diapositive 16:9 par section `##`, mise à l'échelle de l'écran, réduite automatiquement si elle est trop longue. Flèches, espace, Page précédente / suivante ; enchaîne sur le chapitre suivant ou précédent ; `Échap` revient à la lecture, à l'endroit de la diapo. Adresse directe d'une diapo : `page.html#diapo-3`. Barre discrète en bas à droite (précédente, suivante, imprimer les diapos, quitter).
- **Version étendue (PDF)** : bouton dans l'en-tête de chaque chapitre ; ouvre l'impression (« Enregistrer au format PDF »), avec un nom de fichier parlant. Les solutions des exercices sont imprimées ouvertes.
- **Imprimer les diapos** (depuis le diaporama) : une diapo par page, en paysage 16:9, sans les compléments « Théorie + ».
- Nouveaux blocs de syntaxe (aucune syntaxe existante modifiée) :
  - `---` (ligne seule) : nouvelle diapositive dans la même section ;
  - encadré `:::plus [titre]` « Théorie + » : visible à la lecture et à l'impression, caché en diaporama ;
  - encadré `:::fige` : version figée d'une animation, visible seulement à l'impression ;
  - classes HTML `ecran` (pas imprimé), `plus` et `fige` pour les composants.
- Chapitre Pourquoi INTERLIS ? : premier chapitre au format complet (coupures de diapos, Théorie + « Les géodonnées de base et leurs modèles », versions figées du jeu du téléphone, du schéma « un modèle, quatre produits » et de la frise).
- Guide de rédaction : section « Un document, trois usages » avec démo ; `modele.html` montre `:::plus`.
- Tests : `check.mjs` connaît `:::plus` et `:::fige` et refuse `---` dans un encadré ; `render.mjs` ouvre aussi chaque page en diaporama et liste les diapos trop longues.

### Modifié
- README : version à jour, libellé « Au bureau », navigation au clavier et menu redimensionnable. TODO : points classés (à faire, en cours, fait, abandonné).

## [0.2.0] – 2026-11-12

### Ajouté
- Menu de gauche redimensionnable : poignée au bord droit (glisser, double-clic pour la largeur par défaut, flèches au clavier). La largeur est mémorisée dans le navigateur. Écrans larges seulement.
- Numéro de version du cours affiché à côté du titre, en haut du menu (tiré de `config.js`).

### Modifié
- Encadrés `:::terrain` : libellé « Sur le terrain » remplacé par « Au bureau » (`config.js`). La syntaxe `:::terrain` ne change pas.
- Titres (accueil, chapitres, sections, menu) dans la même police que le texte, IBM Plex Sans ; la police Archivo n'est plus chargée.

### Supprimé
- Mention « vu » à côté des chapitres déjà ouverts dans le menu.
- Mode « Notes formateur » : bouton du menu, encadrés `:::prof` de toutes les pages, libellé dans `config.js`, style, documentation. Les tests refusent désormais `:::prof`.

## [0.1.2] – 2026-11-10

### Supprimé
- Durées des chapitres (en-tête, plan de l'accueil) et durée totale de l'accueil : données internes. Les tests refusent désormais le champ `duration` dans `config.js`.

## [0.1.1] – 2026-11-10

### Ajouté
- Test de rendu `node tests/render.mjs` : chaque page est ouverte dans Edge ou Chrome sans fenêtre, toute erreur JavaScript fait échouer le test.
- Quiz : six questions de plus (MO en ITF, XTF 2.4, IMPORTS, extension, contrainte, QGIS), seize au total.
- Encadrés « Sur le terrain » complétés (MO) dans Modéliser, INTERLIS 1 et Contrôler.
- Tests statiques `node tests/check.mjs` : pages de `config.js`, JavaScript inline, encadrés `:::` et `???`, liens internes, numérotation, absence de données internes.
- Chapitre 5 **Importer et étendre** : modèles de base de la Confédération (`IMPORTS`), extension d'un modèle cantonal par une commune (`TOPIC … EXTENDS`, `CLASS … (EXTENDED)`), lecture polymorphique (composant « Un fichier, deux lectures »).
- Chapitre 6 **Le modèle qui dit non** : `UNIQUE` sur plusieurs attributs, `MANDATORY CONSTRAINT` (traduire « si… alors… »), `EXISTENCE CONSTRAINT`, banc des contraintes interactif.

- Chapitre 4 **La MO en INTERLIS 1** : DM.01-AV-CH et ses thèmes, extrait du thème Biens-fonds, lecteur ITF ↔ plan (décodage de chaque ligne avec le modèle, lecture pas à pas, téléchargement de l'ITF fictif), ouverture dans QGIS par glisser-déposer.
- Chapitre 9 **Lire un modèle existant** : méthode en cinq questions avec lecteur qui surligne le modèle, diagramme de solution repliable, où trouver les modèles officiels, travail de groupe sur un modèle de géodonnées minimal fédéral.
- Outil `node tests/renumber-figures.mjs` : renumérote les « Fig. N.x » selon config.js ; les tests vérifient la cohérence et refusent les renvois « chapitre N » (on cite le titre).
- Chapitre INTERLIS 2 : section « Le même arbre en XTF 2.4 » (XTF 2.3 et 2.4 côte à côte, tableau des différences).
- Aide-mémoire : cartes « XTF 2.4 », « Importer et étendre », « Contraintes ».

### Modifié
- Le bloc « Objectifs du chapitre » (cases à cocher) n'est plus affiché en tête des chapitres ; le champ `goals` de `config.js` reste, comme référence pour les auteurs.
- Chapitre Outils : visualiser un XTF dans QGIS par glisser-déposer (fichier d'exemple téléchargeable) ; QGIS Model Baker n'est plus qu'évoqué.
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

[Non publié]: https://github.com/MatteoCasto/cf-geo-b4a/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/MatteoCasto/cf-geo-b4a/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/MatteoCasto/cf-geo-b4a/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MatteoCasto/cf-geo-b4a/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MatteoCasto/cf-geo-b4a/releases/tag/v0.1.0
