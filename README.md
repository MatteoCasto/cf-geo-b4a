# Cours INTERLIS · CF-geo B4a

Support de cours **INTERLIS 1 & 2** pour les futurs techniciens et techniciennes en géomatique.
Une suite de chapitres, un aide-mémoire, un fil rouge : l'inventaire des arbres de Montavaux (commune fictive).

- **En ligne** : <https://matteocasto.github.io/cf-geo-b4a/>
- **En local** : ouvrir [`cours/index.html`](cours/index.html) dans le navigateur
- **Version** : 0.2.0 (celle de `config.js`) · historique dans [`CHANGELOG.md`](CHANGELOG.md)

## Modifier le cours

| Pour… | Modifier |
|---|---|
| le texte d'un chapitre | `cours/<chapitre>.html`, en Markdown |
| titre, chapeau, prérequis, ordre des chapitres, version | [`cours/config.js`](cours/config.js) |
| ajouter un chapitre | copier [`cours/modele.html`](cours/modele.html), puis l'ajouter dans `config.js` |

Menu, en-têtes, numérotation et liens précédent / suivant sont générés automatiquement.

La syntaxe complète, avec le rendu de chaque bloc, est dans le **guide de rédaction** :
[`cours/guide.html`](cours/guide.html) (hors menu, accessible par son adresse uniquement).

```markdown
## Une section

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

Encadrés : `retenir`, `attention`, `terrain` (libellé « Au bureau »), `exo`, `info`, `carte`.
Code coloré : `ili`, `ili1`, `itf`, `xtf`, `sh`, `sql`, `json`…

## Publier

1. Vérifier la page dans le navigateur, puis lancer les tests : `node tests/check.mjs` (Node 18+, aucune installation), puis `node tests/render.mjs` (rendu de chaque page dans Edge ou Chrome, ignoré si aucun navigateur). Après un ajout ou un déplacement de chapitre : `node tests/renumber-figures.mjs`.
2. `git pull`, puis `git commit` et `git push` sur `main`.
3. Le site se met à jour tout seul (GitHub Actions).

Pour une nouvelle version : mettre à jour `version` et `date` dans `config.js`, compléter `CHANGELOG.md`,
puis `git tag -a v0.1.1 -m "…"` et `git push origin v0.1.1`.

| Version | Quand |
|---|---|
| correctif (0.1.**1**) | coquille, correction d'exercice ou de style |
| mineure (0.**2**.0) | nouveau contenu, nouveau chapitre, nouveau bloc de syntaxe |
| majeure (**1**.0.0) | premier jour de cours ; ensuite la syntaxe reste rétrocompatible |

## Un document, trois usages

Chaque page sert à la **lecture**, au **diaporama** (beamer) et à la **version étendue** imprimée :
voir [`PRINCIPE-MULTI-ROLES.md`](PRINCIPE-MULTI-ROLES.md).

## Fonctions du support

- **Annotations** : touche `N`, puis `+` sur un bloc. Stockées dans le navigateur, exportables / importables en JSON (menu *Annotations*).
- **Hors ligne** : le site s'installe comme une application et fonctionne ensuite sans connexion.
- **Projection** : touche `P` agrandit le texte pour le beamer.
- **Navigation** : flèches `←` `→` pour le chapitre précédent / suivant ; menu de gauche redimensionnable (poignée au bord droit, largeur mémorisée).

## Fichiers techniques

À ne modifier que rarement : [`app.js`](cours/app.js) (moteur), [`style.css`](cours/style.css) (mise en page),
[`annotations.js`](cours/annotations.js), [`sw.js`](cours/sw.js) et [`manifest.webmanifest`](cours/manifest.webmanifest) (application hors ligne).
