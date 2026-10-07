# Archives (non publiées sur le site)

Outils de la migration, retirés du site le 06/10/2026 : ils ne servaient plus. Gardés ici pour mémoire.
Le dossier `archives/` n'est pas mis en ligne : seul `public/` l'est.

| Fichier | Ancien rôle | Pourquoi il ne sert plus |
|---|---|---|
| `import.html` + `js/import-core.js` | Transfert du tableur Google (Apps Script) vers l'ancienne application Firebase | Ancienne application en lecture seule : les règles de sécurité refusent toute écriture. |
| `conversion-v2.html` + `js/donnees/bascule.js` | Conversion finale ancienne application → Onco360 | Bascule faite le 06/10/2026 ; la page était verrouillée. |
| `test-droits.html` | Test des droits médecin / infirmière / assistante dans un espace d'essai « test-b1 » | Outil de développement. Pourra resservir (étape 3 : accès, phase F : étanchéité) après adaptation : `import` relatifs à corriger (`./js/…` → `../public/js/…`) et à lancer en local. |

Pour remettre une page en ligne : la replacer dans `public/` (avec ses scripts), puis `firebase deploy --only hosting`.
