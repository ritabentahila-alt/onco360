# Peau — Carcinome de Merkel

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `peau`, localisation `merkel`. Recommandations allemandes S2k 2023 (Vordermark) et RECORAD (Hennequin 2022).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| mk-lit | Carcinome de Merkel opéré : lit tumoral | post\_op | RT adjuvante du lit tumoral même après résection complète, pour tous les patients (S2k 2023) | 1 |
| mk-gg | Aires ganglionnaires | post\_op | Sentinelle négative mais risque élevé (tumeur > 2 cm, drainage incertain en tête et cou) ; sentinelle positive (alternative au curage) ; atteinte clinique (seule ou après curage si rupture capsulaire) | 2 |
| mk-macro | Tumeur macroscopique ou inopérable | en\_place | RT exclusive à visée curative possible | 3 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| mk-lit-50-25 | mk-lit | Lit tumoral 50 Gy / 25 fx | rte\_normo | recommandation | vordermark2023-merkel ; hennequin2022 | |
| mk-gg-50 | mk-gg | Aires ganglionnaires infracliniques 50 à 56 Gy | rte\_normo | essai\_phase3 | jouary2012 ; vordermark2023-merkel | |
| mk-macro-56 | mk-macro | Maladie macroscopique, 56 Gy ou plus | rte\_normo | recommandation | vordermark2023-merkel | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mk-lit-50-25 | PTV lit tumoral | 50 | 25 | 2 | seul | 1 fx/j | Marge de 3 cm autour du lit et de la cicatrice ; bolus |
| mk-gg-50 | PTV ganglionnaire | 50 | | | seul | Selon le centre | 50 à 56 Gy (S2k 2023) |
| mk-macro-56 | PTV macroscopique | 56 | | | seul | Selon le centre | 56 Gy ou plus (S2k 2023) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| mk-lit-50-25 | RT externe avec bolus | Aucune | sim-merkel | vol-merkel | | Dose à la peau assurée (bolus) |
| mk-gg-50 | RT externe | Aucune | sim-merkel | vol-merkel | | |
| mk-macro-56 | RT externe | Selon RCP | sim-merkel | vol-merkel | | |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-merkel | Selon le site | — | Bolus pour assurer la dose à la peau | Scanner de planification | — | — |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-merkel | CTV lit tumoral | CTV | Lit tumoral et cicatrice + 3 cm (S2k 2023 ; Danemark 1 à 2 cm, NCCN 5 cm) | Toujours | 3 cm |
| vol-merkel | CTV ganglionnaire | CTV | Aire de drainage ganglionnaire concernée (sentinelle) | Selon l'indication | |
| vol-merkel | GTV | GTV | Tumeur ou adénopathie macroscopique | Maladie macroscopique | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-merkel | oar-peau ; oar-parotide-d ; oar-parotide-g ; oar-cristallin-d ; oar-cristallin-g | |

## Traitement systémique associé

Pas de traitement systémique concomitant défini ; maladie métastatique : immunothérapie anti-PD-1 ou anti-PD-L1, la RT s'intégrant au cas par cas (S2k 2023).

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| mk-gg | Essai randomisé (stade I) : la RT ganglionnaire prophylactique réduit les récidives régionales (0 % contre 16,7 %) sans gain de survie ; essai antérieur à la sentinelle (Jouary 2012) |
| mk-lit | Tête et cou, tumeurs de moins de 1 cm : 26 % de récidives sans RT contre 0 % avec RT (étude appariée citée par S2k 2023) |
| mk-macro | RT exclusive des stades I–II : doses médianes 55 Gy (local) et 65 Gy (local et régional), rechutes 25 et 21 % |
