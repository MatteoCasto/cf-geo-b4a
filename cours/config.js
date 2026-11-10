/* =========================================================================
   CONFIGURATION DU COURS
   Le seul fichier à modifier pour : le titre, la version, la liste et l'ordre
   des chapitres, leurs en-têtes (chapeau, durée, objectifs…) et les libellés.

   Tout le reste en découle automatiquement : menu, pages précédente/suivante,
   plan de l'accueil, numérotation des sections, cache hors ligne.
   Le TEXTE de chaque chapitre est dans sa page, en Markdown (voir guide.html).
   ========================================================================= */
var COURSE = {
  title:    'Géomatique',                       // nom court (menu, onglet)
  subtitle: 'CF-geo · gabarit B4a',             // sous le nom, dans le menu
  appName:  'Cours de géomatique · CF-geo',     // nom de l'appli installée
  version:  '0.0',
  date:     '10.11.2026',
  author:   'CF-geo',
  colophon: 'Support de cours géomatique · gabarit de démonstration',

  // Libellés des encadrés Markdown  :::retenir  :::attention  :::terrain  :::exo
  labels: {
    retenir:   'À retenir',
    attention: 'Attention',
    terrain:   'Sur le terrain',
    exo:       'Exercice',
    solution:  'Solution',
    goals:     'Objectifs du chapitre',
  },

  /* Chapitres, dans l'ordre du menu.
     num  : '1', '2'… (chapitre numéroté) · 'A', 'B'… (annexe) · '' (accueil)
     Les champs absents ne s'affichent simplement pas. */
  chapters: [
    { file: 'index.html', num: '', title: 'Accueil' },

    { file: 'referentiels.html', num: '1', title: 'Systèmes de référence',
      duration: '30 min', prereq: 'aucun', activity: 'carte, calculateur',
      question: 'Comment savoir dans quel cadre est une coordonnée ?',
      lead: "Un même point de Suisse possède deux jeux de coordonnées planes : celles du cadre MN03 et celles du cadre MN95. Savoir les reconnaître évite des décalages de plusieurs kilomètres.",
      summary: 'MN03 et MN95 : deux cadres, deux jeux de coordonnées. Cliquer sur la carte, convertir.',
      tags: ['carte cliquable', 'calculateur'],
      goals: [
        "Distinguer une coordonnée MN03 d'une coordonnée MN95 au premier coup d'œil.",
        "Passer approximativement de l'une à l'autre et connaître la limite de cette approximation.",
        "Nommer l'outil officiel pour une transformation rigoureuse.",
      ] },

    { file: 'gnss.html', num: '2', title: 'Positionnement GNSS',
      duration: '30 min', prereq: 'chapitre 1', activity: 'simulation',
      question: "Pourquoi la mesure est-elle moins bonne au pied d'un bâtiment ?",
      lead: "Un récepteur GNSS calcule sa position à partir des signaux de plusieurs satellites. Le nombre de satellites compte, mais leur répartition dans le ciel compte tout autant.",
      summary: "Ciel de satellites, masque d'élévation, obstacles et PDOP en direct.",
      tags: ['simulation'],
      goals: [
        'Expliquer pourquoi il faut au moins quatre satellites.',
        'Lire un ciel de satellites (skyplot) : azimut, élévation.',
        "Relier masque d'élévation, obstacles et PDOP.",
      ] },

    { file: 'nivellement.html', num: '3', title: 'Nivellement',
      duration: '45 min', prereq: 'aucun', activity: 'carnet calculé, exercice',
      question: 'Comment savoir si un cheminement est juste ?',
      lead: "Le niveau ne mesure pas d'altitude : il mesure des différences de hauteur entre deux mires. En enchaînant les stations depuis un repère connu, on transporte l'altitude de proche en proche.",
      summary: "Lectures arrière, lectures avant, altitudes et fermeture d'un cheminement.",
      tags: ['carnet calculé', 'exercice'],
      goals: [
        "Calculer une dénivelée à partir d'une lecture arrière et d'une lecture avant.",
        'Tenir un carnet de nivellement et calculer les altitudes.',
        "Calculer l'écart de fermeture et le répartir simplement.",
      ] },

    { file: 'lidar.html', num: '4', title: 'LiDAR et modèles de terrain',
      duration: '30 min', prereq: 'chapitre 1', activity: 'graphique filtrable',
      question: 'Comment connaître le terrain sous une forêt ?',
      lead: "Un scanner laser aéroporté produit des millions de points. Une fois classés, ils donnent deux surfaces très différentes : le terrain nu (MNT) et la surface avec tout ce qui la recouvre (MNS).",
      summary: 'Un profil de nuage de points, ses classes, le MNT, le MNS et la hauteur de végétation.',
      tags: ['graphique filtrable'],
      goals: [
        "Citer les principales classes d'un nuage de points.",
        'Distinguer MNT, MNS et MNS normalisé.',
        'Expliquer pourquoi le MNT est interpolé sous un bâtiment.',
      ] },

    { file: 'analyse.html', num: '5', title: 'Analyse spatiale',
      duration: '45 min', prereq: 'bases de SIG', activity: 'outil SIG, code lié',
      question: 'Comment traduire une question en opération spatiale ?',
      lead: "Une question simple, « quels bâtiments sont à moins de 30 m du ruisseau ? », se traduit en une opération SIG, une requête SQL ou quelques lignes de Python.",
      summary: 'Une zone tampon autour d\'un ruisseau, et la même requête en SQL et en Python.',
      tags: ['outil SIG', 'code lié'],
      goals: [
        'Définir une zone tampon et une sélection par distance.',
        'Lire une requête PostGIS simple avec ST_DWithin.',
        'Reconnaître la même opération en Python (GeoPandas).',
      ] },

    { file: 'quiz.html', num: '6', title: 'Quiz final',
      duration: '15 min', activity: 'auto-évaluation',
      question: 'Une question par thème, correction immédiate.',
      lead: "Six questions, une par thème. La correction s'affiche dès que vous répondez, avec un lien vers le chapitre à revoir.",
      summary: 'Six questions sur les cinq thèmes, avec correction immédiate.',
      tags: ['auto-évaluation'] },

    { file: 'aide-memoire.html', num: 'A', title: 'Aide-mémoire',
      activity: 'fiche à imprimer',
      lead: "L'essentiel de chaque chapitre sur une page. Imprimez avec Ctrl+P : le menu et les boutons disparaissent." },

    { file: 'guide.html', num: 'B', title: 'Guide de rédaction',
      activity: 'pour les auteurs',
      lead: "Comment écrire et modifier ce support : où est quoi, la syntaxe Markdown des pages, et les composants disponibles avec leur rendu." },
  ],
};
