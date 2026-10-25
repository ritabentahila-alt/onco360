# SNC — Craniopharyngiome

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `snc`, localisation `craniopharyngiome`. Adulte uniquement (pédiatrie hors du module).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| crp-post-op | Craniopharyngiome après chirurgie limitée, ou récidive | post\_op | Chirurgie limitée suivie de RT : contrôle local à 10 ans 77–100 % ; RT au diagnostic ou à la progression : survies comparables (Iannalfi 2013) | 1 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-24. Dose recommandée 50 à 54 Gy en fractionnement classique (Iannalfi 2013).

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| crp-54-30 | crp-post-op | RT 54 Gy / 30 fx | rte\_normo | recommandation | iannalfi2013 ; kamogawa2022 | Tableur du service « Craniopharyngiome 54 Gy » |
| crp-504-28 | crp-post-op | RT 50,4 Gy / 28 fx | rte\_normo | recommandation | iannalfi2013 |  |
| crp-srs-12-1 | crp-post-op | Radiochirurgie 12 Gy (12 à 15 Gy) d'un petit résidu éloigné des voies optiques | sbrt | option | kamogawa2022 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| crp-54-30 | PTV | 54 | 30 | 1.8 | seul | 5 fx/sem | Borne haute de la dose recommandée |
| crp-504-28 | PTV | 50.4 | 28 | 1.8 | seul | 5 fx/sem |  |
| crp-srs-12-1 | PTV (isodose 50 %, Gamma Knife) | 12 | 1 | 12 | seul | 1 séance | 12 à 15 Gy ; choix selon la distance aux nerfs optiques et au chiasma |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| crp-54-30 | IMRT ou RT stéréotaxique, IGRT quotidienne | Aucune | sim-crane | vol-crp | ct-crane-igr ; ct-crane-quantec |  |
| crp-504-28 | IMRT ou RT stéréotaxique, IGRT quotidienne | Aucune | sim-crane | vol-crp | ct-crane-igr ; ct-crane-quantec |  |
| crp-srs-12-1 | Radiochirurgie, IGRT stéréotaxique | Aucune | sim-crane-srs | vol-crane-srs | ct-srs-igr-1fx ; ct-srs-hytec | Dose prescrite en périphérie du résidu |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fractionnement classique : fiche `sim-crane` (onglet « SNC — Glioblastome »). Radiochirurgie : fiche `sim-crane-srs` (onglet « SNC — Métastases cérébrales »).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-crp | GTV | GTV | Partie solide rehaussée en T1 gadolinium et kyste (tableur du service) | Toujours |  |
| vol-crp | CTV | CTV | GTV + 7 mm (tableur du service) | Toujours | 7 mm |
| vol-crp | PTV | PTV | CTV + 3 mm (tableur du service) | Toujours | 3 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-crp | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-bandelettes-optiques ; oar-hypothalamus ; oar-hypophyse ; oar-tronc-cerebral ; oar-hippocampes ; oar-cochlee-d ; oar-cochlee-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-encephale-sain ; oar-moelle | [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |

## Traitement systémique associé

Pas de traitement systémique standard.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| craniopharyngiome | Toxicité tardive moindre avec chirurgie limitée et RT qu'avec chirurgie radicale (Iannalfi 2013) |
| crp-srs-12-1 | Radiochirurgie ou stéréotaxie en 3 fractions (19,5–24 Gy) si le résidu est loin des voies optiques ; sinon 54 Gy / 30 fx (Kamogawa 2022) |
