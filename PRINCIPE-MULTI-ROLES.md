# Principe : un seul document, trois usages

Chaque chapitre du cours est **une seule page HTML** qui sert à trois choses :

| Usage | Pour qui, quand | Ce qu'on voit |
|---|---|---|
| **Lecture** (par défaut) | l'élève devant son écran, en classe ou chez lui | tout : texte, composants interactifs, compléments « Théorie + » |
| **Diaporama** | la personne qui enseigne, au beamer | une diapositive à la fois, au format 16:9, comme PowerPoint ; les compléments « Théorie + » sont **cachés** |
| **Version étendue** (imprimée ou PDF) | l'élève qui veut un support papier, la littérature de cours | tout le texte, compléments compris ; chaque animation est remplacée par sa **version figée** |

On n'administre donc **qu'un seul format** : ce qu'on corrige dans la page est corrigé partout, à l'écran, au beamer et sur papier.

## Pourquoi

- Deux supports (des diapos d'un côté, un polycopié de l'autre) finissent toujours par se contredire.
- Une diapo doit rester courte ; un support de cours doit être complet. Au lieu de choisir, on écrit les deux **au même endroit** : le court est visible partout, le complément seulement à la lecture et à l'impression.
- Une animation ne s'imprime pas. Comme le texte alternatif derrière une image sur un site web, chaque animation a une **version figée** : un tableau, une liste, une image qui dit la même chose sur papier.

## Règles de rédaction

1. **Une section = une diapo, le plus souvent possible.** Chaque titre `##` commence une diapositive. Si la section est trop longue, on la coupe par une ligne `---` (nouvelle diapo, même section) ou on déplace le détail dans un bloc « Théorie + ».
2. **Sur la diapo, l'essentiel** : une idée, une figure, un encadré « À retenir ». Les explications longues, les exemples supplémentaires, les références vont dans `:::plus`.
3. **Chaque composant interactif a une version figée** (`:::fige`), placée juste après lui, et il est marqué « écran seulement » (`ecran`). Sans version figée, le composant est imprimé tel quel, dans son état initial.
4. Le contenu « Théorie + » reste du cours à part entière : à jour (état 2025-2026), relu, et sans renvoi numéroté (on cite le titre du chapitre).

## Briques (nouveaux blocs, aucune syntaxe existante ne change)

```markdown
## Une section          ← commence une diapositive

Le texte vu partout.

---                     ← nouvelle diapositive dans la même section

:::plus Pour aller plus loin
Visible à la lecture et à l'impression, caché en diaporama.
:::

:::fige
La version figée d'une animation : visible seulement à l'impression.
:::
```

En HTML (composants) : `class="ecran"` (pas imprimé), `class="plus"` (caché en diaporama), `class="fige"` (imprimé seulement).

## Fonctions

- **Diaporama** : bouton dans le menu ou touche `D`. Flèches, espace, Page suivante / précédente pour changer de diapo ; à la fin d'un chapitre, on enchaîne sur le suivant. `Échap` revient à la lecture. Une diapo trop longue est réduite pour tenir à l'écran.
- **Imprimer les diapos** : depuis le diaporama, imprimer donne une diapo par page, en paysage.
- **Version étendue** : chaque chapitre a un bouton « Version étendue (PDF) ». Il ouvre l'impression du navigateur ; choisir « Enregistrer au format PDF » pour obtenir le fichier.

## Limites assumées

- Le PDF est produit par le navigateur (le site reste statique, sans serveur ni outil de conversion).
- La version figée est écrite à la main : c'est un petit travail de plus par composant, mais c'est le prix d'un support papier lisible.
- Les chapitres existants seront découpés en diapos progressivement ; en attendant, une section trop longue est simplement réduite à l'écran.

## État de la mise en place

- **Moteur** (`app.js`, `style.css`) : diaporama, blocs `---`, `:::plus`, `:::fige`, classes `ecran` / `plus` / `fige`, boutons « Diaporama » et « Version étendue (PDF) » dans l'en-tête de chaque chapitre, impression des diapos.
- **Chapitre modèle** : [Pourquoi INTERLIS ?](cours/pourquoi.html) applique le principe en entier (coupures `---`, un bloc Théorie +, version figée de ses trois composants).
- **Tests** : `node tests/check.mjs` connaît les nouveaux blocs ; `node tests/render.mjs` ouvre chaque page aussi en diaporama et liste les diapos encore trop longues.
- **À faire, chapitre par chapitre** : découper les sections trop longues, déplacer le détail dans `:::plus`, écrire les versions figées des composants interactifs (voir `TODO.txt`).

## Rétrocompatibilité

Les pages actuelles restent valables sans modification : sans `---`, `:::plus` ni `:::fige`, une page s'affiche en lecture comme avant, et le diaporama coupe simplement à chaque `##`. Les annotations personnelles (JSON) restent rattachées aux mêmes blocs.
