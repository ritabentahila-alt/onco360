# SNC — Schwannome vestibulaire

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `snc`, localisation `schwannome`. Petite tumeur : surveillance ou radiochirurgie ; grosse tumeur : chirurgie de décompression, puis RT fractionnée ou radiochirurgie si besoin (EANO 2020).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| sch-traitement | Schwannome vestibulaire à traiter | en\_place | Tumeur évolutive ou symptomatique, ou résidu évolutif après chirurgie ; diagnostic sur l'IRM, histologie pas toujours nécessaire (EANO 2020) | 1 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-24. Contrôle tumoral, fonction faciale, trigéminale et auditive comparables entre radiochirurgie et RT fractionnée (ISRS, 6 études non randomisées).

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| sch-srs-12-1 | sch-traitement | Radiochirurgie 12 Gy en 1 séance (dose marginale 12 à 14 Gy) | sbrt | recommandation | isrs-schwannome ; quantec-cochlee ; eano-schwannome-2020 |  |
| sch-fsrt-576-32 | sch-traitement | RT stéréotaxique fractionnée 57,6 Gy / 32 fx | rte\_normo | option | combs2005 ; isrs-schwannome |  |
| sch-hfsrt-25-5 | sch-traitement | Stéréotaxie hypofractionnée 25 Gy / 5 fx | sbrt | option | meijer2003 ; quantec-cochlee |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sch-srs-12-1 | PTV (dose marginale) | 12 | 1 | 12 | seul | 1 séance | 12 à 14 Gy : contrôle à 5 ans 90–99 %, audition préservée 41–79 % (ISRS) |
| sch-fsrt-576-32 | PTV | 57.6 | 32 | 1.8 | seul | 5 fx/sem | Contrôle local 93 % à 5 ans ; audition utile préservée 94 % (98 % hors NF2) |
| sch-hfsrt-25-5 | PTV (isodose 80 %) | 25 | 5 | 5 | seul | 1 semaine | Contrôle à 5 ans 94 % ; trijumeau mieux préservé qu'en dose unique (98 vs 92 %) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| sch-srs-12-1 | Radiochirurgie (Gamma Knife ou accélérateur), IGRT stéréotaxique | Aucune | sim-crane-srs | vol-sch | ct-srs-igr-1fx ; ct-srs-hytec | Dose prescrite en périphérie de la tumeur |
| sch-fsrt-576-32 | RT stéréotaxique conformationnelle ou IMRT, IGRT quotidienne | Aucune | sim-crane | vol-sch | ct-crane-igr ; ct-crane-quantec |  |
| sch-hfsrt-25-5 | Stéréotaxie, IGRT à chaque séance | Aucune | sim-crane-srs | vol-sch | ct-srs-igr-5fx ; ct-srs-hytec | Dose prescrite à l'isodose 80 % |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fractionnement classique : fiche `sim-crane` (onglet « SNC — Glioblastome »). Radiochirurgie et stéréotaxie hypofractionnée : fiche `sim-crane-srs` (onglet « SNC — Métastases cérébrales »).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-sch | GTV | GTV | Schwannome rehaussé en T1 gadolinium 3D, portion intracanalaire comprise, IRM fusionnée au scanner | Toujours |  |
| vol-sch | CTV | CTV | CTV = GTV (tumeur bénigne) | Toujours | 0 mm |
| vol-sch | PTV | PTV | CTV + marge de la plateforme : 1 mm en stéréotaxie avec IGRT (comme vol-crane-srs) | Toujours | 1 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-sch | oar-cochlee-d ; oar-cochlee-g ; oar-tronc-cerebral ; oar-nerfs-craniens (nerfs facial et trijumeau) ; oar-encephale-sain ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-hippocampes | [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) ; [QUANTEC cochlée](https://doi.org/10.1016/j.ijrobp.2009.04.096) |

## Traitement systémique associé

Pas de traitement médical, sauf le bévacizumab dans la neurofibromatose de type 2 (EANO 2020).

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| sch-srs-12-1 | Audition : dose prescrite limitée à 12–14 Gy ; au-delà de 14 Gy, l'audition utile chute nettement (QUANTEC) |
| sch-fsrt-576-32 | Cochlée en fractionnement classique : dose moyenne ≤ 45 Gy, ≤ 35 Gy par prudence, aussi basse que possible (QUANTEC) |
| sch-hfsrt-25-5 | QUANTEC propose 21 à 30 Gy en fractions de 3 à 7 Gy sur 3 à 10 jours (données limitées) |
| schwannome | Neurofibromatose de type 2 : audition moins bien préservée après radiochirurgie ou RT fractionnée |
