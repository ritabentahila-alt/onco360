# Sarcomes — Membres et tronc

Mise à jour : 2026-10-25 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `sarcome`, localisation `sarcome_membres`. Sarcomes des tissus mous des membres et de la paroi du tronc de l'adulte. Fiche du service « radiothérapie des sarcomes des membres / tissus mous ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| sm-preop | Sarcome localisé des membres ou du tronc : RT pré-opératoire | en\_place | RT indiquée si risque accru de récidive locale, en particulier si des marges étroites ou atteintes sont attendues (ASTRO 2021) ; la RT pré-opératoire suivie de la chirurgie est la séquence préférée (ESTRO 2026) | 1 |
| sm-postop | Sarcome opéré sans RT pré-opératoire : RT post-opératoire | post\_op | Fiche du service : sarcomes profonds de plus de 5 cm, grade 2–3, chirurgie R1 ou R2 | 2 |

## Schémas et prescriptions

Six schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

Revérifiés le 25/10/2026 : date\_verif = 2026-10-25 pour : sm-preop-50-25 ; sm-preop-4275-15

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| sm-preop-50-25 | sm-preop | RT pré-opératoire 50 Gy / 25 fx | rte\_normo | essai\_phase3 | ncic-sr2 ; davis2005 ; rtog0630 ; wang2011-sts ; estro-sts-2026 | Fiche du service (pré-opératoire : 50 Gy) |
| sm-preop-4275-15 | sm-preop | RT pré-opératoire 42,75 Gy / 15 fx | rte\_hypo | option | hyport-sts ; baldini2024-hypo ; estro-sts-2026 | |
| sm-postop-r0 | sm-postop | RT post-opératoire R0 : 50 Gy / 25 fx ± 10 Gy | rte\_normo | pratique\_institutionnelle | yang1998 ; ncic-sr2 | Fiche du service |
| sm-postop-r1 | sm-postop | RT post-opératoire R1 : 50 Gy puis 10 Gy puis 6 Gy (66 Gy sur la zone R1) | rte\_normo | pratique\_institutionnelle | ncic-sr2 | Fiche du service |
| sm-postop-r2 | sm-postop | RT post-opératoire R2 sans reprise possible : 50 Gy puis 20 Gy | rte\_normo | pratique\_institutionnelle | astro-sts-2021 | Fiche du service |
| sm-curie-ldr | sm-postop | Curiethérapie adjuvante bas débit 42 à 45 Gy | curie\_ldr | essai\_phase3 | pisters1996 ; abs-sts-2021 | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sm-preop-50-25 | PTV | 50 | 25 | 2 | seul | 5 fx/sem | Chirurgie après la RT |
| sm-preop-4275-15 | PTV | 42.75 | 15 | 2.85 | seul | 5 fx/sem (3 semaines) | Complications majeures de la cicatrice 31 % contre 35 % attendus (HYPORT-STS) ; ESTRO 2026 : pas en routine hors essai |
| sm-postop-r0 | PTV50 | 50 | 25 | 2 | sequentiel | 5 fx/sem | |
| sm-postop-r0 | PTV60 | 10 | 5 | 2 | sequentiel | 5 fx/sem | Seulement si sarcome à haut risque de rechute (fiche du service) |
| sm-postop-r1 | PTV50 | 50 | 25 | 2 | sequentiel | 5 fx/sem | |
| sm-postop-r1 | PTV60 | 10 | 5 | 2 | sequentiel | 5 fx/sem | |
| sm-postop-r1 | PTV66 | 6 | 3 | 2 | sequentiel | 5 fx/sem | Zone R1 ; fiche : 50 + 10 à 16 Gy ; NCIC SR2 : 66 Gy / 33 fx en post-opératoire |
| sm-postop-r2 | PTV50 | 50 | 25 | 2 | sequentiel | 5 fx/sem | |
| sm-postop-r2 | PTV reliquat | 20 | 10 | 2 | sequentiel | 5 fx/sem | Fiche : 50 + 15 à 20 Gy si reprise chirurgicale impossible |
| sm-curie-ldr | CTV lit opératoire | 45 | | | seul | 4 à 6 jours | Iridium 192, 42 à 45 Gy ; contrôle local à 5 ans 82 % contre 69 % sans curiethérapie, 89 % contre 66 % pour les hauts grades |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| sm-preop-50-25 | RT hautement conformationnelle, imagerie volumique quotidienne | Aucune | sim-sarcome-service | vol-sm-preop-service | | |
| sm-preop-4275-15 | RT hautement conformationnelle, imagerie volumique quotidienne | Aucune | sim-sarcome-service | vol-sm-preop-service | | |
| sm-postop-r0 | RT hautement conformationnelle, imagerie volumique | Aucune | sim-sarcome-service | vol-sm-postop-service | | |
| sm-postop-r1 | RT hautement conformationnelle, imagerie volumique | Aucune | sim-sarcome-service | vol-sm-postop-service | | |
| sm-postop-r2 | RT hautement conformationnelle, imagerie volumique | Aucune | sim-sarcome-service | vol-sm-postop-service | | |
| sm-curie-ldr | Implant d'iridium 192 posé pendant la chirurgie | Aucune | | vol-sm-curie | | |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Sarcome des membres ou du tronc superficiel réséqué | Curiethérapie interstitielle adjuvante bas débit (iridium 192), 42 à 45 Gy en 4 à 6 jours | Essai randomisé (Pisters 1996) ; consensus ABS 2021 | Gain de contrôle local limité aux hauts grades ; doses et fractionnements selon le site et l'intention (ABS 2021) |

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-sarcome-service | Décubitus adapté au membre atteint (dorsal, ventral, assis selon le site) | Immobilisation rigide : plaque ou coussin moulé | — | Scanner injecté recommandé (tumeur et vaisseaux adjacents) | Fusion obligatoire avec l'IRM pré-thérapeutique (GTV et œdème T2) | Marquage cutané ou repères radio-opaques sur la zone tumorale et la cicatrice de biopsie |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-sm-preop-service | GTV T | GTV | Tumeur macroscopique primaire sur le recalage IRM | Toujours | |
| vol-sm-preop-service | CTV T | CTV | GTV + 3 cm longitudinal et 1,5 cm radial (consensus RTOG) ; inclure l'œdème T2 et la cicatrice de biopsie ; adapter aux barrières anatomiques (os, compartiments musculaires, articulations) | Toujours | 3 cm / 1,5 cm |
| vol-sm-preop-service | PTV T | PTV | CTV + 0,5 cm si CBCT quotidien ; CTV + 1 cm si imagerie plus espacée | Toujours | 5 ou 10 mm |
| vol-sm-postop-service | GTV T | GTV | Tumeur primitive macroscopique avant tout traitement (IRM) | Toujours | |
| vol-sm-postop-service | CTV T 50 Gy | CTV | GTV + 3,5 cm longitudinal, 1,5 cm dans les autres directions ; inclure cicatrice, hématomes et collections ; marge longitudinale réductible près d'une articulation | Toujours | 3,5 cm / 1,5 cm |
| vol-sm-postop-service | CTV T 60 Gy | CTV | GTV + 2 cm longitudinal, 1,5 cm dans les autres directions ; mêmes adaptations | Complément | 2 cm / 1,5 cm |
| vol-sm-postop-service | CTV T 66 Gy | CTV | Zone R1 résiduelle (marge chirurgicale atteinte) | R1 | |
| vol-sm-postop-service | PTV T | PTV | CTV + 0,5 cm si CBCT quotidien ; CTV + 1 cm si imagerie plus espacée | Toujours | 5 ou 10 mm |
| vol-sm-curie | CTV | CTV | Lit de résection, implant posé pendant la chirurgie | Toujours | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-sm-preop-service | oar-peau ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-oge | [Consensus RTOG, GTV et CTV pré-opératoires](https://doi.org/10.1016/j.ijrobp.2011.04.038) |
| vol-sm-postop-service | oar-peau ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-oge | |
| vol-sm-curie | oar-peau | |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ces schémas.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| sm-preop | Pré-opératoire 50 Gy contre post-opératoire 66 Gy : complications de la cicatrice 35 % contre 17 % (NCIC SR2), fibrose de grade ≥ 2 : 31,5 % contre 48,2 % ; la taille du champ prédit fibrose et raideur (Davis 2005) |
| sm-preop | IGRT et volumes réduits (RTOG 0630) : toxicité tardive de grade ≥ 2 à 2 ans 10,5 % contre 37 % dans NCIC SR2 ; 5 récidives locales, toutes dans le champ |
| sm-preop-4275-15 | Hypofractionnement pré-opératoire : pas encore un standard (Baldini 2024 ; ESTRO 2026) |
| sm-postop | RT post-opératoire : moins de récidives locales sans différence de survie, pour les hauts et les bas grades ; chez les patients à faible risque de récidive, la RT adjuvante peut ne pas être nécessaire (Yang 1998) |
| sarcome\_membres | Fiche du service : fusion IRM et scanner systématique ; CTV respectant les barrières anatomiques ; inclusion hiérarchique des CTV 50, 60 et 66 Gy |
