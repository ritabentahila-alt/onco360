# SNC — Neurocytome central

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `snc`, localisation `neurocytome`. Une exérèse complète est souvent curative (Mallick 2015).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| neu-post-op | Neurocytome central après exérèse incomplète, ou récidive | post\_op | RT adjuvante : survie sans progression plus longue (Samhouri 2021) | 1 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| neu-54-30 | neu-post-op | RT 54 Gy / 30 fx | rte\_normo | option | samhouri2021 ; mallick2015 | |
| neu-service-594 | neu-post-op | RT en deux plans : 54 Gy sur les ventricules puis complément jusqu'à 59,4 Gy | rte\_normo | pratique\_institutionnelle | samhouri2021 | Tableur du service « Neurocytome 59,4 Gy » |
| neu-srs-13-1 | neu-post-op | Radiochirurgie 13 Gy en 1 séance | sbrt | option | hung2020 | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| neu-54-30 | PTV | 54 | 30 | 1.8 | seul | 5 fx/sem | Dose médiane de la série multicentrique (50 à 60 Gy) |
| neu-service-594 | PTV54 (ventricules) | 54 | 30 | 1.8 | sequentiel | 5 fx/sem | Premier plan |
| neu-service-594 | PTV59,4 (lit tumoral) | 5.4 | 3 | 1.8 | sequentiel | 5 fx/sem | Total 59,4 Gy / 33 fx |
| neu-srs-13-1 | PTV (dose marginale) | 13 | 1 | 13 | seul | 1 séance | Dose marginale médiane ; contrôle local 93 % à 5 ans, 87 % à 10 ans |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| neu-54-30 | IMRT ou VMAT, IGRT quotidienne | Aucune | sim-crane | vol-neu | ct-crane-igr ; ct-crane-quantec | |
| neu-service-594 | IMRT, deux plans, IGRT quotidienne | Aucune | sim-crane | vol-neu-service | ct-crane-igr ; ct-crane-quantec | |
| neu-srs-13-1 | Radiochirurgie, IGRT stéréotaxique | Aucune | sim-crane-srs | vol-crane-srs | ct-srs-igr-1fx ; ct-srs-hytec | Dose prescrite en périphérie du résidu |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fractionnement classique : fiche `sim-crane` (onglet « SNC — Glioblastome »). Radiochirurgie : fiche `sim-crane-srs` (onglet « SNC — Métastases cérébrales »).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-neu | GTV | GTV | Résidu et lit tumoral en T1 gadolinium | Toujours | |
| vol-neu | CTV | CTV | GTV + 5 mm (tableur du service) | Toujours | 5 mm |
| vol-neu | PTV | PTV | CTV + 3 mm (tableur du service) | Toujours | 3 mm |
| vol-neu-service | CTV54 | CTV | GTV préopératoire + 15 mm, étendu aux ventricules (tableur du service) | Toujours | 15 mm |
| vol-neu-service | CTV59,4 | CTV | GTV + 5 mm (tableur du service) | Toujours | 5 mm |
| vol-neu-service | PTV54, PTV59,4 | PTV | CTV + 3 mm (tableur du service) | Toujours | 3 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-neu | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-hypothalamus ; oar-hypophyse ; oar-hippocampes ; oar-cochlee-d ; oar-cochlee-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-moelle | [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |
| vol-neu-service | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-hypothalamus ; oar-hypophyse ; oar-hippocampes ; oar-cochlee-d ; oar-cochlee-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-moelle | [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |

## Traitement systémique associé

Pas de traitement systémique standard.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| neurocytome | RT adjuvante : survie sans progression plus longue (p = 0,004), tendance pour la survie globale (Samhouri 2021) |
| neu-srs-13-1 | Radiochirurgie : alternative pour un résidu limité, contrôle local 87 % à 10 ans (Hung 2020) |
