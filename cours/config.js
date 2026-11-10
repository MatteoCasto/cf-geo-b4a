/* =========================================================================
   CONFIGURATION DU COURS
   Le seul fichier à modifier pour : le titre, la version, la liste et l'ordre
   des chapitres, leurs en-têtes (chapeau, durée, objectifs…) et les libellés.

   Tout le reste en découle automatiquement : menu, pages précédente/suivante,
   plan de l'accueil, numérotation des sections, cache hors ligne.
   Le TEXTE de chaque chapitre est dans sa page, en Markdown (voir guide.html).
   ========================================================================= */
var COURSE = {
  title:    'INTERLIS',                           // nom court (menu, onglet)
  subtitle: '1 & 2 · CF-geo B4a',                 // sous le nom, dans le menu
  appName:  'Cours INTERLIS · CF-geo',            // nom de l'appli installée
  version:  '0.1.0',                          // SemVer, = tag git v0.1.0 (voir CHANGELOG.md)
  date:     '10.11.2026',
  author:   'CF-geo',
  colophon: 'Cours INTERLIS 1 & 2 · techniciennes et techniciens en géomatique',

  // Libellés des encadrés Markdown  :::retenir  :::attention  :::terrain  :::exo  :::prof
  labels: {
    retenir:   'À retenir',
    attention: 'Attention',
    terrain:   'Sur le terrain',
    exo:       'Exercice',
    prof:      'Formateur',
    solution:  'Solution',
    goals:     'Objectifs du chapitre',
  },

  /* Chapitres, dans l'ordre du menu.
     num  : '1', '2'… (chapitre numéroté) · 'A', 'B'… (annexe) · '' (accueil)
     info : cases supplémentaires de l'en-tête, ex. {'Fichiers': '.ili, .itf'}
     hidden : true → page hors menu, accessible seulement par son adresse (guide.html)
     Les champs absents ne s'affichent simplement pas. */
  chapters: [
    { file: 'index.html', num: '', title: 'Accueil' },

    { file: 'pourquoi.html', num: '1', title: 'Pourquoi INTERLIS ?',
      duration: '30 min', prereq: 'aucun', activity: 'animation, frise',
      question: "Qu'est-ce qui se perd entre deux logiciels ?",
      lead: "Quand des données passent d'un logiciel à l'autre, elles s'abîment un peu à chaque étape. INTERLIS supprime ce problème : on décrit les données une fois, puis tout le monde échange selon cette description.",
      summary: "Le jeu du téléphone entre logiciels, l'approche basée sur les modèles, la LGéo.",
      tags: ['animation', 'frise'],
      goals: [
        "Expliquer pourquoi une conversion de format fait perdre de l'information.",
        'Définir INTERLIS en une phrase : langage de description et format de transfert.',
        "Décrire l'approche basée sur les modèles : le modèle d'abord, le fichier ensuite.",
        'Citer la base légale (LGéo, OGéo) qui rend INTERLIS obligatoire.',
      ] },

    { file: 'modeliser.html', num: '2', title: 'Modéliser le territoire',
      duration: '45 min', prereq: 'Pourquoi INTERLIS ?', activity: 'croquis, exercice papier',
      question: "Qu'est-ce qu'un arbre, pour une base de données ?",
      lead: "Avant d'écrire une seule ligne d'INTERLIS, il faut décider ce qu'on garde de la réalité et comment on le décrit. C'est le travail de modélisation, et il se fait avec un crayon.",
      summary: 'Du terrain au fichier : choisir, abstraire, décrire. Classe, objet, attribut.',
      tags: ['croquis animé', 'exercice'],
      goals: [
        'Décrire les trois gestes de la modélisation : choisir, abstraire, décrire.',
        'Distinguer classe, objet et attribut sur un exemple concret.',
        'Choisir un type adapté pour un attribut (texte, nombre, énumération, coordonnée…).',
        'Modéliser sur papier une petite thématique communale.',
      ] },

    { file: 'interlis1.html', num: '3', title: 'INTERLIS 1',
      duration: '60 min', prereq: 'Modéliser le territoire', activity: 'éditeur de surfaces, ITF annoté',
      info: { 'Fichiers': '.ili, .itf' },
      question: 'Comment une ligne de chiffres devient-elle un arbre ?',
      lead: "La première version du langage : des tables, des types simples, des géométries, et un fichier de transfert en lignes de texte, l'ITF. C'est toujours le format de la mensuration officielle dans la plupart des cantons.",
      summary: 'TABLE, types de base, SURFACE ou AREA, et le fichier ITF ligne par ligne.',
      tags: ['éditeur de surfaces', 'ITF annoté'],
      goals: [
        "Lire la structure d'un modèle INTERLIS 1 : TRANSFER, MODEL, DOMAIN, TOPIC, TABLE.",
        'Utiliser les types de base : texte, énumération, plage numérique, coordonnée, relation.',
        'Expliquer la différence entre SURFACE et AREA.',
        "Lire un fichier ITF ligne par ligne, à l'aide du modèle.",
      ] },

    { file: 'mo-itf.html', num: '4', title: 'La MO en INTERLIS 1',
      prereq: 'INTERLIS 1', activity: 'lecteur ITF, QGIS',
      info: { 'Fichiers': '.itf', 'Logiciel': 'QGIS' },
      question: 'Que contient vraiment un fichier de la mensuration officielle ?',
      lead: "Le modèle de la mensuration officielle DM.01-AV-CH est écrit en INTERLIS 1. On lit un extrait réaliste du thème Biens-fonds, ligne par ligne, avec le vrai modèle, puis on l'ouvre dans QGIS.",
      summary: 'DM.01-AV-CH, le thème Biens-fonds, un ITF décodé ligne par ligne, ouverture dans QGIS.',
      tags: ['lecteur ITF', 'QGIS'],
      goals: [
        'Situer DM.01-AV-CH et ses thèmes, et le passage au DMAV.',
        "Distinguer immeuble et bien-fonds, et suivre une référence d'une table à l'autre dans un fichier ITF.",
        "Expliquer comment une AREA est transférée : des lignes sans propriétaire et un point de référence par surface.",
        "Ouvrir un ITF dans QGIS et dire ce qu'on voit, et ce qu'on ne voit pas, sans le modèle.",
      ] },

    { file: 'interlis2.html', num: '5', title: 'INTERLIS 2',
      duration: '60 min', prereq: 'INTERLIS 1', activity: 'banc des cardinalités',
      info: { 'Fichiers': '.ili, .xtf' },
      question: 'Comment dire « chaque arbre a exactement une espèce » ?',
      lead: "INTERLIS 2 passe des tables aux classes. On gagne l'héritage, les structures, les associations avec des cardinalités précises, et un fichier de transfert en XML, le XTF, qui porte le nom de chaque attribut.",
      summary: 'Classes, héritage, structures, associations et cardinalités, fichier XTF.',
      tags: ['modèle ↔ XTF', 'cardinalités'],
      goals: [
        'Traduire une table INTERLIS 1 en classe INTERLIS 2.',
        "Utiliser l'héritage (`ABSTRACT`, `EXTENDS`) et les structures (`STRUCTURE`, `BAG OF`).",
        'Lire et écrire une association avec ses cardinalités.',
        'Retrouver chaque élément du modèle dans un fichier XTF, en version 2.3 comme en 2.4.',
      ] },

    { file: 'importer.html', num: '6', title: 'Importer et étendre',
      prereq: 'INTERLIS 2', activity: 'lecture côte à côte',
      info: { 'Mots-clés': 'IMPORTS, EXTENDS' },
      question: 'Faut-il tout réécrire à chaque nouveau modèle ?',
      lead: "Personne n'écrit un modèle à partir de rien. On importe les coordonnées, les unités et les codes officiels de la Confédération, et on étend le modèle du canton au lieu d'en écrire un autre à côté.",
      summary: 'Modèles de base de la Confédération, IMPORTS, extension d\'un modèle cantonal par une commune.',
      tags: ['modèles de base', 'extension'],
      goals: [
        "Utiliser un domaine d'un modèle de base avec `IMPORTS` (GeometryCHLV95_V1, CHAdminCodes_V1, Units).",
        'Étendre un thème et une classe existants (`TOPIC … EXTENDS`, `CLASS … (EXTENDED)`).',
        "Dire ce qu'une extension a le droit de faire : ajouter ou resserrer, jamais retirer ni élargir.",
        'Expliquer pourquoi le canton peut lire les données de toutes ses communes avec son seul modèle.',
      ] },

    { file: 'contraintes.html', num: '7', title: 'Le modèle qui dit non',
      prereq: 'Importer et étendre', activity: 'banc des contraintes',
      info: { 'Mots-clés': 'UNIQUE, MANDATORY CONSTRAINT' },
      question: "Comment écrire « un arbre mort doit avoir une date d'abattage » ?",
      lead: "Un type contrôle une valeur à la fois. Certaines règles portent sur plusieurs attributs ou sur plusieurs objets. On les écrit dans le modèle sous forme de contraintes : ilivalidator les vérifie ensuite tout seul, à chaque livraison.",
      summary: 'Unicité, contraintes obligatoires, exigence d\'existence. Traduire « si… alors… » en INTERLIS.',
      tags: ['banc des contraintes'],
      goals: [
        'Distinguer ce que contrôle un type et ce que contrôle une contrainte.',
        'Écrire une unicité sur un ou plusieurs attributs (`UNIQUE`).',
        "Traduire une règle « si… alors… » en `MANDATORY CONSTRAINT` (`NOT (…) OR …`, `DEFINED`).",
        'Reconnaître un message de contrainte dans un rapport ilivalidator.',
      ] },

    { file: 'atelier.html', num: '8', title: 'Atelier .ili',
      duration: '45 min', prereq: 'INTERLIS 2', activity: 'éditeur en direct',
      info: { 'Travail': 'seul ou à deux' },
      question: 'Livrable : un modèle sans erreur, téléchargé en .ili.',
      lead: "À vous d'écrire. L'éditeur ci-dessous comprend une partie d'INTERLIS 2.3. À chaque frappe, il vérifie votre modèle et redessine le diagramme de classes.",
      summary: 'Écrire un modèle et voir le diagramme UML se dessiner en direct. Quatre défis.',
      tags: ['éditeur en direct'],
      goals: [
        'Écrire des classes, des attributs et des types en INTERLIS 2.',
        "Corriger un modèle à partir d'un message d'erreur.",
        'Relier un texte .ili à son diagramme UML.',
      ] },

    { file: 'controler.html', num: '9', title: 'Contrôler les données',
      duration: '45 min', prereq: 'INTERLIS 2', activity: 'chasse aux erreurs',
      info: { 'Outil réel': 'ilivalidator' },
      question: 'Pourquoi le canton refuse-t-il ma livraison ?',
      lead: "Un fichier XTF peut s'ouvrir sans problème et être faux quand même. Le modèle permet de le vérifier automatiquement, avant que les erreurs n'arrivent dans la base du canton.",
      summary: 'Bien formé n\'est pas valide. Un banc de contrôle façon ilivalidator.',
      tags: ['chasse aux erreurs'],
      goals: [
        "Distinguer un fichier bien formé d'un fichier valide.",
        'Reconnaître les erreurs typiques : valeur hors plage, énumération, obligatoire, unicité, référence, coordonnées.',
        'Lire un rapport de contrôle et corriger un fichier XTF.',
      ] },

    { file: 'outils.html', num: '10', title: 'Outils et pratique',
      duration: '30 min', prereq: 'INTERLIS 2, Contrôler les données', activity: 'chaîne animée',
      info: { 'Logiciels': 'Java, QGIS' },
      question: 'Quel outil pour quelle tâche ?',
      lead: "INTERLIS n'est utile que si des outils savent le lire. En Suisse, une petite famille d'outils libres couvre toute la chaîne : du modèle à la base de données, puis de la base au fichier contrôlé et livré.",
      summary: 'ili2c, ili2db, QGIS Model Baker, ilivalidator, dépôts de modèles, MO et DMAV.',
      tags: ['chaîne animée'],
      goals: [
        'Placer ili2c, ili2db, Model Baker et ilivalidator dans la chaîne de travail.',
        'Lancer les commandes de base (compiler, importer, exporter, contrôler).',
        'Expliquer le rôle des dépôts de modèles.',
        'Situer DM.01-AV-CH, DMAV et les modèles de géodonnées minimaux.',
      ] },

    { file: 'quiz.html', num: '11', title: 'Quiz final',
      duration: '20 min', activity: 'auto-évaluation',
      question: 'Dix questions, correction immédiate.',
      lead: "Dix questions sur l'essentiel du cours. Chaque réponse est corrigée tout de suite, avec une explication et un lien vers le chapitre à revoir.",
      summary: "Dix questions pour vérifier l'essentiel, avec correction immédiate.",
      tags: ['auto-évaluation'] },

    { file: 'aide-memoire.html', num: 'A', title: 'Aide-mémoire',
      activity: 'fiche à imprimer',
      lead: "L'essentiel du cours sur deux pages : syntaxe, fichiers de transfert, cardinalités, commandes et vocabulaire français-allemand. Imprimez avec Ctrl+P : le menu et les boutons disparaissent." },

    // page non référencée : accessible uniquement par son adresse …/guide.html
    { file: 'guide.html', num: 'B', title: 'Guide de rédaction', hidden: true,
      activity: 'pour les auteurs',
      lead: "Comment écrire et modifier ce support : où est quoi, la syntaxe Markdown des pages, et les composants disponibles avec leur rendu." },
  ],
};
