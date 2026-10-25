# Thorax — Thymome

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `thorax`, localisation `thymome`. Thymomes et carcinomes thymiques. Doses : synthèse des recommandations internationales (NCCN, ESMO, GOECP/SEOR, ARS, Ontario) par Katano 2026.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| th-postop | Tumeur épithéliale thymique opérée : RT post-opératoire | post\_op | PORT si résection R1 ou R2, stade III–IV, ou stade II à haut risque (B2–B3, invasion transcapsulaire) ; carcinome thymique au-delà du stade I ; pas de PORT pour le stade I R0 | 1 |
| th-exclusif | Tumeur non résécable : RT exclusive | en\_place | RT exclusive, le plus souvent avec chimiothérapie concomitante | 2 |

## Schémas et prescriptions

Quatre schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| th-r0-50 | th-postop | PORT R0 : 50 Gy / 25 fx | rte\_normo | recommandation | katano2026-thymome ; esmo-thymus-2015 |  |
| th-r1-54 | th-postop | PORT R1 : 54 Gy / 27 fx | rte\_normo | recommandation | katano2026-thymome ; esmo-thymus-2015 |  |
| th-r2-60 | th-postop | PORT R2 : 60 Gy / 30 fx | rte\_normo | recommandation | katano2026-thymome ; esmo-thymus-2015 |  |
| th-excl-66 | th-exclusif | RT exclusive 60 à 66 Gy en fractions de 2 Gy | rte\_normo | recommandation | katano2026-thymome ; esmo-thymus-2015 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| th-r0-50 | PTV | 50 | 25 | 2 | seul | 5 fx/sem | Recommandations : 45 à 50 Gy, 1,8 à 2 Gy par fraction |
| th-r1-54 | PTV | 54 | 27 | 2 | seul | 5 fx/sem | Recommandations : 50 à 54 Gy |
| th-r2-60 | PTV | 60 | 30 | 2 | seul | 5 fx/sem | ESMO : 60 Gy avec une surimpression d'environ 10 Gy sur le macroscopique |
| th-excl-66 | PTV | 66 | 33 | 2 | seul | 5 fx/sem | ESMO : 60 à 66 Gy ; Ontario : 60 Gy en 30 à 33 fractions |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| th-r0-50 | RT conformationnelle moderne (RCMI) | Aucune |  | vol-thymome | ct-thorax-quantec |  |
| th-r1-54 | RT conformationnelle moderne (RCMI) | Aucune |  | vol-thymome | ct-thorax-quantec |  |
| th-r2-60 | RT conformationnelle moderne (RCMI) | Selon RCP |  | vol-thymome | ct-thorax-quantec |  |
| th-excl-66 | RT conformationnelle moderne (RCMI) | Voir Traitement systémique |  | vol-thymome | ct-thorax-quantec |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Pas de fiche de centrage du service pour cette localisation. Définitions et compte rendu : ITMIG (Gomez 2011).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-thymome | GTV | GTV | Reliquat macroscopique ou tumeur en place | R2 ou RT exclusive |  |
| vol-thymome | CTV | CTV | Lit tumoral ; pas d'irradiation ganglionnaire élective | Toujours |  |
| vol-thymome | PTV | PTV | CTV + marge du centre | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-thymome | oar-poumons ; oar-coeur ; oar-oesophage ; oar-moelle ; oar-gros-vaisseaux ; oar-arbre-bronchique |  |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| th-exclusif | Étoposide et cisplatine concomitants à la RCMI | Étoposide–cisplatine concomitant (tumeurs épithéliales thymiques) | katano2026-thymome | Phase 2 (Fan) : réponse objective 85,7 %, SG à 5 ans 56,2 % |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| th-postop | Stade II R0 : bénéfice de la PORT discuté (méta-analyses discordantes) ; l'essai français RADIORYTHMIC compare PORT et surveillance dans les stades IIb–III R0 |
| th-postop | Méta-analyse de 31 études : PORT associée à une meilleure SG (HR 0,73) après résection complète, bénéfice net pour les stades III–IV et le carcinome thymique |
| thymome | SBRT réservée aux récidives limitées ou aux métastases pleurales, avec les contraintes thoraciques de la SBRT pulmonaire |
