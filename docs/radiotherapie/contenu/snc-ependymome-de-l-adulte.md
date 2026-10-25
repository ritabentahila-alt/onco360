# SNC — Épendymome de l'adulte

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `snc`, localisation `ependymome`. Épendymomes de l'adulte (recommandations EANO 2018) ; pédiatrie exclue. Centrage : fiche `sim-crane` (onglet « SNC — Glioblastome »).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| ep-intracranien | Épendymome intracrânien opéré | post\_op | RT pour l'épendymome anaplasique (grade 3) et pour le grade 2 incomplètement réséqué (EANO 2018) | 1 |

## Schémas et prescriptions

Deux schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| ep-g2-54 | ep-intracranien | Grade 2 : 54 Gy sur le lit tumoral | rte\_normo | option | eano-ependymome-2018 ; wee2020-ependymome | |
| ep-g3-594 | ep-intracranien | Grade 3 : 59,4 Gy sur le lit tumoral | rte\_normo | option | eano-ependymome-2018 ; wee2020-ependymome | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ep-g2-54 | PTV lit tumoral | 54 | | | seul | Selon le centre | Dose médiane de la série coréenne multicentrique (172 adultes) |
| ep-g3-594 | PTV lit tumoral | 59.4 | | | seul | Selon le centre | Dose médiane de la même série |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| ep-g2-54 | RT conformationnelle | Aucune | sim-crane | vol-ependymome | ct-crane-igr ; ct-crane-quantec | |
| ep-g3-594 | RT conformationnelle | Aucune | sim-crane | vol-ependymome | ct-crane-igr ; ct-crane-quantec | |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fiche `sim-crane` (onglet « SNC — Glioblastome »). Bilan par IRM craniospinale (EANO 2018).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-ependymome | GTV | GTV | Lit tumoral et reliquat sur l'IRM post-opératoire | Toujours | |
| vol-ependymome | PTV | PTV | Marges du centre | Toujours | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-ependymome | oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-cochlee-d ; oar-cochlee-g ; oar-encephale ; oar-moelle | |

## Traitement systémique associé

Pas de traitement systémique associé à la RT ; chimiothérapie réservée aux récidives sans option locale (EANO 2018).

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| ep-intracranien | RT post-opératoire : meilleurs contrôle local, survie sans progression et SG en analyse multivariée ; pour le grade 2, meilleurs contrôle local et survie sans progression (KROG 18-06) |
| ependymome | Épendymome spinal : la résection complète est le traitement principal, RT réservée aux résections incomplètes (EANO 2018) |
| ependymome | 9 sous-groupes moléculaires selon le compartiment et l'âge, aux pronostics distincts (EANO 2018) |
