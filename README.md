# cf-geo-b4a

Support de cours géomatique (module B4a). **État : gabarit de démonstration.** Le contenu des chapitres est indicatif et sera entièrement revu ; la structure, elle, est générique.

- En ligne : <https://matteocasto.github.io/cf-geo-b4a/> (installable comme application, utilisable hors ligne)
- En local : double-cliquer sur [`cours/index.html`](cours/index.html), sans serveur ni installation.

## Où est quoi

| Fichier | Contenu | Qui le modifie |
|---|---|---|
| [`cours/config.js`](cours/config.js) | Titre, version, **liste et ordre des chapitres**, en-têtes (chapeau, durée, objectifs…), libellés | Auteurs |
| `cours/*.html` | Le **texte** de chaque chapitre, en **Markdown**, et ses éventuels composants interactifs | Auteurs |
| [`cours/modele.html`](cours/modele.html) | Page vide à copier pour créer un chapitre | — |
| [`cours/guide.html`](cours/guide.html) | Guide de rédaction : syntaxe, composants, conventions (avec rendu) | — |
| [`cours/style.css`](cours/style.css) | Couleurs, polices, mise en page | Rarement |
| [`cours/app.js`](cours/app.js) | Moteur : menu, en-têtes, Markdown, quiz, numérotation, thème, appli hors ligne | Rarement |
| [`cours/annotations.js`](cours/annotations.js) | Annotations personnelles, export / import JSON | Rarement |
| [`cours/sw.js`](cours/sw.js), [`manifest.webmanifest`](cours/manifest.webmanifest), `icons/` | Application installable / hors ligne | Jamais |

Tout ce qui est commun est **généré** à partir de `config.js` : menu, en-tête et objectifs de chaque chapitre, numérotation des sections (1.1, 1.2…), liens précédent / suivant, plan de l'accueil, liste des fichiers mis en cache hors ligne. Une page de chapitre ne contient que son texte.

## Créer ou modifier un chapitre

1. Copier `cours/modele.html` sous un nouveau nom.
2. Ajouter le chapitre dans `chapters` de `cours/config.js` (l'ordre de la liste est l'ordre du menu).
3. Écrire le texte en Markdown dans la page. Syntaxe complète, avec rendu : [`guide.html`](cours/guide.html).

```markdown
## Une section                 ← numérotée automatiquement

Un paragraphe avec du **gras** et du `code`.

:::retenir
L'essentiel.
:::

:::exo 10 min
La consigne.

??? Solution
La solution.
???
:::
```

Encadrés disponibles : `:::retenir`, `:::attention`, `:::terrain`, `:::exo`, `:::info Titre libre`, `:::carte Titre`. Aussi : listes, tableaux `| … |`, formules `$$ … $$`, blocs de code avec bouton Copier, images.

Après modification : vérifier dans le navigateur, puis `git commit` et `git push`. Le site en ligne se met à jour automatiquement (GitHub Actions, [`.github/workflows/pages.yml`](.github/workflows/pages.yml)).

## Annotations

Chacun (élève ou formateur) peut annoter n'importe quel bloc : menu *Mode annotation* (ou touche `N`), survoler un bloc, cliquer sur **+**. Types : Note, Question, À corriger, Idée.

- Enregistrement automatique dans le navigateur ; rien n'est envoyé sur un serveur.
- Menu *Annotations* : liste de toutes les annotations, **export** en fichier JSON, **import** (fusion : la version la plus récente de chaque annotation gagne). Sert à sauvegarder, changer de poste, ou distribuer les annotations du formateur à la classe.
- Si le passage annoté est réécrit, l'annotation n'est pas perdue : elle apparaît en bas de page sous « Annotations non rattachées ».
- Le stockage dépend de l'adresse : site en ligne et fichier local ne partagent pas leurs annotations (l'export / import fait le pont).

Format du fichier (`format: "cf-geo-annotations"`) :

```json
{ "format": "cf-geo-annotations", "version": 1, "exported": "2026-11-10T18:30:00.000Z", "author": "M. Casto",
  "annotations": [
    { "id": "amwavs3rm7y9i", "page": "nivellement.html", "anchor": "m71b88", "section": "3.1",
      "excerpt": "Le niveau est posé entre deux mires…", "type": "q", "text": "Pourquoi lit-on la mire arrière en premier ?",
      "author": "Léa", "created": "2026-11-10T18:02:00.000Z", "updated": "2026-11-10T18:02:00.000Z" } ] }
```

## Application hors ligne

Le site en ligne s'installe comme une application (bouton « Installer l'appli » dans le menu sur Edge / Chrome ; menu du navigateur sur Android ; Partager → « Sur l'écran d'accueil » sur iPhone / iPad) et fonctionne ensuite sans connexion. Chaque déploiement porte un numéro de version : les applis installées se mettent à jour à la connexion suivante.

## Pistes

- Export Word / PDF au gabarit CF-geo à partir des mêmes contenus (déjà réalisé pour le cours INTERLIS, réutilisable).
