# SNC — Gliomes de grade 2 et 3

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `snc`, localisation `gliome`. Gliomes diffus IDH mutés de l'adulte (classification OMS 2021) ; le glioblastome IDH non muté a son propre onglet.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| gli-g2 | Gliome IDH muté de grade 2 à haut risque : radiothérapie | post\_op | Astrocytome ou oligodendrogliome IDH muté de grade 2 ; moins de 40 ans après exérèse incomplète ou biopsie, ou 40 ans et plus (critères RTOG 9802) | 1 |
| gli-oligo-g3 | Oligodendrogliome IDH muté et codélété 1p/19q, grade 3 | post\_op | Oligodendrogliome anaplasique codélété 1p/19q | 2 |
| gli-astro-g3 | Astrocytome IDH muté de grade 3 (non codélété) | post\_op | Gliome anaplasique non codélété 1p/19q (population de CATNON) | 3 |

## Schémas et prescriptions

Quatre schémas. Tous : statut = `valide`, date\_verif = 2026-10-24. Doses de l'ESTRO-EANO 2024 : 50,4 Gy / 28 fx en grade 2, 59,4 Gy / 33 fx en grade 3, IMRT préférée.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| gli-g2-504-28 | gli-g2 | RT 50,4 Gy / 28 fx | rte\_normo | recommandation | estro-eano-idh-2024 ; eortc22033 ; ncctg-lgg ; eortc22844 | Tableur du service « Gliome grade 2 » |
| gli-g2-54-30 | gli-g2 | RT 54 Gy / 30 fx puis PCV | rte\_normo | essai\_phase3 | eortc22845 ; rtog9802 |  |
| gli-oligo-594-33 | gli-oligo-g3 | RT 59,4 Gy / 33 fx + PCV | rte\_normo | essai\_phase3 | eortc26951 ; rtog9402 ; estro-eano-idh-2024 | Tableur du service « Gliome grade 3 » |
| gli-astro-594-33 | gli-astro-g3 | RT 59,4 Gy / 33 fx puis témozolomide adjuvant (CATNON) | rte\_normo | essai\_phase3 | catnon2017 ; catnon2021 ; estro-eano-idh-2024 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gli-g2-504-28 | PTV | 50.4 | 28 | 1.8 | seul | 5 fx/sem | 45 et 59,4 Gy ne diffèrent pas (EORTC 22844) ; 64,8 Gy n'apporte rien (NCCTG) |
| gli-g2-54-30 | PTV | 54 | 30 | 1.8 | seul | 5 fx/sem | Dose de l'EORTC 22845 ; puis 6 cycles de PCV (RTOG 9802) |
| gli-oligo-594-33 | PTV | 59.4 | 33 | 1.8 | seul | 5 fx/sem | PCV après la RT (EORTC 26951) ou avant (RTOG 9402) |
| gli-astro-594-33 | PTV | 59.4 | 33 | 1.8 | seul | 5 fx/sem | Puis 12 cycles de témozolomide |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| gli-g2-504-28 | IMRT ou VMAT, IGRT | Selon la situation, voir Traitement systémique | sim-crane | vol-gliome-g2 | ct-crane-igr ; ct-crane-quantec |  |
| gli-g2-54-30 | IMRT ou VMAT, IGRT | PCV après la RT | sim-crane | vol-gliome-g2 | ct-crane-igr ; ct-crane-quantec |  |
| gli-oligo-594-33 | IMRT ou VMAT, IGRT | PCV | sim-crane | vol-gliome-g3 | ct-crane-igr ; ct-crane-quantec |  |
| gli-astro-594-33 | IMRT ou VMAT, IGRT | Témozolomide adjuvant | sim-crane | vol-gliome-g3 | ct-crane-igr ; ct-crane-quantec |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Même centrage que le glioblastome : fiche `sim-crane` (onglet « SNC — Glioblastome »).

## Contourage

Volumes de l'ESTRO-EANO 2024 pour les gliomes IDH mutés. Les tableurs du service prévoyaient 5 mm en grade 2 et 20 mm en grade 3 (écart E59).

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-gliome-g2 | GTV | GTV | Cavité opératoire et tumeur résiduelle, anomalies T2/FLAIR incluses ; prise de contraste incluse si elle traduit un résidu | Toujours |  |
| vol-gliome-g2 | CTV | CTV | GTV + 10 mm | Toujours | 10 mm |
| vol-gliome-g2 | PTV | PTV | CTV + 3 mm au plus avec IGRT (ESTRO-EANO 2023) ; tableurs du service : 3 mm | Toujours | 3 mm |
| vol-gliome-g3 | GTV | GTV | Cavité opératoire et tumeur résiduelle, anomalies T2/FLAIR incluses sauf les zones d'œdème ; prise de contraste incluse si elle traduit un résidu | Toujours |  |
| vol-gliome-g3 | CTV | CTV | GTV + 15 mm | Toujours | 15 mm |
| vol-gliome-g3 | PTV | PTV | Comme vol-gliome-g2 | Toujours | 3 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-gliome-g2 | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes ; oar-hypophyse ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-cavite-orale ; oar-parotide-d ; oar-parotide-g ; oar-moelle | [ESTRO-EANO 2024, gliomes IDH mutés](https://doi.org/10.1016/j.radonc.2024.110594) ; [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |
| vol-gliome-g3 | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes ; oar-hypophyse ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-cavite-orale ; oar-parotide-d ; oar-parotide-g ; oar-moelle | [ESTRO-EANO 2024, gliomes IDH mutés](https://doi.org/10.1016/j.radonc.2024.110594) ; [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| gli-g2 | PCV (procarbazine, lomustine, vincristine), 6 cycles après la RT | PCV | rtog9802 | SG médiane 13,3 vs 7,8 ans |
| gli-g2 | Vorasidenib 40 mg/j, cycles de 28 jours, si résidu ou récidive après chirurgie seule | Vorasidenib | indigo | SSP 27,7 vs 11,1 mois ; retarde le traitement suivant (RT, chimiothérapie) |
| gli-oligo-g3 | PCV, 6 cycles après la RT (EORTC 26951) ou avant la RT (RTOG 9402) | PCV | eortc26951 ; rtog9402 | Codélétés : SG 14,7 vs 7,3 ans (RTOG 9402) |
| gli-astro-g3 | Témozolomide 150–200 mg/m² J1–J5, 12 cycles de 4 semaines après la RT | Témozolomide adjuvant (CATNON) | catnon2017 ; catnon2021 | SG à 5 ans 55,9 vs 44,1 % ; pas de bénéfice du témozolomide concomitant |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| gli-g2 | RT précoce : SSP 5,3 vs 3,4 ans, sans gain de survie globale (EORTC 22845). La RT peut être différée chez un patient en bon état, surveillé de près |
| gli-g2 | Témozolomide seul au lieu de la RT : SSP 39 vs 46 mois, différence non significative (EORTC 22033) |
| gli-g2 | Pas d'escalade de dose : 45 et 59,4 Gy identiques (EORTC 22844) ; 64,8 Gy donne un peu plus de radionécroses (NCCTG) |
| gli-astro-g3 | Bénéfice du témozolomide adjuvant lié à la mutation IDH1/2 (CATNON, 2e analyse) |
| gliome | Hippocampes : D40 % ≤ 7,3 Gy en EQD2 si possible (Gondi 2013, tumeurs bénignes ou de bas grade) |
