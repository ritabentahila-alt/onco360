# SNC — Glioblastome

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `snc`, localisation `glioblastome`. Glioblastome IDH non muté (classification OMS 2021). La réirradiation des récidives sera traitée avec le lot E.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| gbm-standard | Glioblastome opéré ou biopsié, jusqu'à 70 ans : radiochimiothérapie | post\_op | Glioblastome IDH non muté confirmé histologiquement, après exérèse maximale ou biopsie ; OMS 0–2, IK ≥ 70 (fiche du service) ; bénéfice du témozolomide démontré jusqu'à 70 ans | 1 |
| gbm-age | Sujet âgé ou fragile : radiothérapie courte | post\_op | 65 ans et plus (Perry 2017) ; ou 50 ans et plus avec IK 50–70 (Roa 2015) ; 60 ans et plus dans l'étude nordique | 2 |

## Schémas et prescriptions

Cinq schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| gbm-stupp-60-30 | gbm-standard | RT 60 Gy / 30 fx + témozolomide concomitant puis adjuvant (Stupp) | rte\_normo | essai\_phase3 | stupp2005 ; stupp2009 ; hegi2005 ; ef14 ; estro-eano-gbm-2023 ; eano-gliomes-2021 | Fiche du service « glioblastome » |
| gbm-ceteg-60-30 | gbm-standard | RT 60 Gy / 30 fx + lomustine-témozolomide (MGMT méthylé, CeTeG) | rte\_normo | option | ceteg |  |
| gbm-age-40-15 | gbm-age | RT 40 Gy / 15 fx ± témozolomide (Perry) | rte\_hypo | essai\_phase3 | perry2017 ; roa2004 |  |
| gbm-age-25-5 | gbm-age | RT 25 Gy / 5 fx (sujet fragile) | rte\_hypo | essai\_phase3 | roa2015 |  |
| gbm-age-34-10 | gbm-age | RT 34 Gy / 10 fx (étude nordique) | rte\_hypo | essai\_phase3 | nordic-malmstrom ; keime-guibert |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gbm-stupp-60-30 | PTV | 60 | 30 | 2 | seul | 5 fx/sem | Avec témozolomide 75 mg/m²/j, 7 j/7, du premier au dernier jour de RT |
| gbm-ceteg-60-30 | PTV | 60 | 30 | 2 | seul | 5 fx/sem | Essai : 59–60 Gy ; 18–70 ans, IK ≥ 70 %, MGMT méthylé |
| gbm-age-40-15 | PTV | 40 | 15 | 2.67 | seul | 5 fx/sem | Non inférieur à 60 Gy / 30 fx après 60 ans (Roa 2004) |
| gbm-age-25-5 | PTV | 25 | 5 | 5 | seul | 5 fx/sem | Non inférieur à 40 Gy / 15 fx : SG 7,9 vs 6,4 mois |
| gbm-age-34-10 | PTV | 34 | 10 | 3.4 | seul | 5 fx/sem (2 semaines) | Après 70 ans, meilleur que 60 Gy / 30 fx |

**Tableau Schémas — liens** (même `id` que le tableau Schémas ; les jeux Gustave Roussy et QUANTEC valent pour 1,8–2 Gy par fraction : pas de jeu publié pour les schémas courts)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| gbm-stupp-60-30 | IMRT ou VMAT, IGRT | Voir Traitement systémique | sim-crane | vol-gbm | ct-crane-igr ; ct-crane-quantec |  |
| gbm-ceteg-60-30 | IMRT ou VMAT, IGRT | Voir Traitement systémique | sim-crane | vol-gbm | ct-crane-igr ; ct-crane-quantec |  |
| gbm-age-40-15 | IMRT ou VMAT, IGRT | Voir Traitement systémique | sim-crane | vol-gbm |  |  |
| gbm-age-25-5 | IMRT ou VMAT, IGRT | Aucune | sim-crane | vol-gbm |  |  |
| gbm-age-34-10 | IMRT ou VMAT, IGRT | Aucune | sim-crane | vol-gbm |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-crane | Décubitus dorsal, bras le long du corps, coussin sous les genoux | Masque thermoformé 3 points | — | Non injecté, coupes jointives de 2,5 mm, crâne entier jusqu'à C3, moins de 2 semaines avant le début de la RT | IRM dosimétrique T1 3D gadolinium et T2-FLAIR, axiales strictes, fusionnées au scanner ; IRM post-opératoire précoce (48–72 h) pour le GTV ; éviter l'IRM post-opératoire tardive, qui surestime le résidu | — |

## Contourage

Volumes de l'ESTRO-EANO 2023 : un seul CTV, fondé sur la cavité et la prise de contraste. La fiche du service ajoutait 20 mm et l'hypersignal FLAIR (écarts E23 et E52).

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-gbm | GTV | GTV | Cavité opératoire et prise de contraste résiduelle en T1 gadolinium sur l'IRM post-opératoire ; hypersignal FLAIR non inclus | Toujours |  |
| vol-gbm | CTV | CTV | GTV + 15 mm isotrope, un seul CTV sans réduction de champ ; exclure l'os, les ventricules et la faux, réduire aux barrières anatomiques, adapter aux méninges au contact | Toujours | 15 mm |
| vol-gbm | PTV | PTV | CTV + 3 mm au plus avec IGRT, selon le système de contention (ESTRO-EANO) ; fiche du service : 3 mm | Toujours | 3 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-gbm | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes ; oar-hypophyse ; oar-hypothalamus ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-cavite-orale ; oar-parotide-d ; oar-parotide-g ; oar-moelle | [ESTRO-EANO 2023, glioblastome](https://doi.org/10.1016/j.radonc.2023.109663) ; [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) ; [mise à jour EPTN 2021](https://doi.org/10.1016/j.radonc.2021.05.013) |

## Traitement systémique associé

`protocole` = nom du protocole à relier dans la bibliothèque Protocoles (règle dans la spécification).

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| gbm-standard | Témozolomide 75 mg/m²/j, 7 j/7 pendant la RT, puis 6 cycles de 150–200 mg/m² J1–J5 tous les 28 jours | Témozolomide concomitant puis adjuvant (Stupp) | stupp2005 ; stupp2009 ; hegi2005 | SG médiane 14,6 vs 12,1 mois ; bénéfice surtout si MGMT méthylé |
| gbm-standard | TTFields (au moins 18 h/j) avec le témozolomide d'entretien, après la radiochimiothérapie | Témozolomide adjuvant (Stupp) | ef14 | SG 20,9 vs 16,0 mois |
| gbm-standard | Lomustine 100 mg/m² J1 + témozolomide 100–200 mg/m² J2–J6, cycles de 6 semaines, jusqu'à 6 cycles, avec la RT | Lomustine-témozolomide (CeTeG) | ceteg | MGMT méthylé, 18–70 ans : SG 48,1 vs 31,4 mois (petit effectif) |
| gbm-age | Témozolomide concomitant puis adjuvant avec 40 Gy / 15 fx | Témozolomide avec RT courte (Perry) | perry2017 | SG 9,3 vs 7,6 mois ; MGMT méthylé 13,5 vs 7,7 mois |
| gbm-age | Témozolomide seul si MGMT méthylé et RT non retenue : 200 mg/m² J1–J5 tous les 28 jours (6 cycles), ou 100 mg/m² une semaine sur deux | Témozolomide seul (sujet âgé) | nordic-malmstrom ; noa08 | Non inférieur à la RT (NOA-08) ; meilleure efficacité si MGMT méthylé |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| glioblastome | Bévacizumab en première ligne : pas de gain de survie globale (RTOG 0825 : 15,7 vs 16,1 mois ; AVAglio) |
| vol-gbm | Un seul CTV de 15 mm, sans réduction de champ (ESTRO-EANO). Les protocoles NRG utilisent deux CTV : CTV\_4600 sur l'hypersignal T2-FLAIR, CTV\_6000 sur la cavité et la prise de contraste (Kruser 2019) |
| vol-gbm | Hippocampes : D40 % ≤ 7,3 Gy en EQD2 si possible sans dégrader le PTV (Gondi 2013) |
| gbm-age | Après 70 ans, 60 Gy / 30 fx fait moins bien que 34 Gy / 10 fx ou le témozolomide seul (étude nordique) |
| gbm-age | Même après 70 ans (IK ≥ 70), la RT (50 Gy en fractions de 1,8 Gy) allonge la survie par rapport aux soins de support : 29,1 vs 16,9 semaines (ANOCEF) |
| gbm-standard | Statut MGMT à demander : il prédit le bénéfice du témozolomide (Hegi 2005) et oriente vers CeTeG |
