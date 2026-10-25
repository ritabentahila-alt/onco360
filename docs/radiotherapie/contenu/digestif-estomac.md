# Digestif — Estomac

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `digestif`, localisation `estomac`. Le standard est la chimiothérapie périopératoire (FLOT) : la radiothérapie n'y ajoute rien (CRITICS, TOPGEAR, ARTIST 2).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| est-adj | Opéré sans chimiothérapie périopératoire : RCT adjuvante | post\_op | Adénocarcinome gastrique ou de la jonction réséqué, pT3 ou plus et/ou N+, sans chimiothérapie périopératoire (INT-0116). Type diffus : peu de bénéfice | 1 |
| est-pall | Palliatif : saignement | palliatif | Cancer gastrique hémorragique non opérable | 2 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| est-int0116-45-25 | est-adj | RCT adjuvante 45 Gy / 25 fx + 5FU-leucovorine (INT-0116) | rte\_normo | essai\_phase3 | int0116 ; int0116-lt ; critics ; artist2 |  |
| est-pall-30-10 | est-pall | RT hémostatique 30 Gy / 10 fx | rte\_hypo | option | hemostase-estomac |  |
| est-pall-20-5 | est-pall | RT hémostatique 20 Gy / 5 fx | rte\_hypo | option | hemostase-estomac |  |

**Tableau Prescriptions**

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| est-int0116-45-25 | PTV (lit tumoral, anastomose, aires ganglionnaires) | 45 | 25 | 1.8 | seul | 5 fx/sem | SG médiane 36 vs 27 mois |
| est-pall-30-10 | PTV tumeur gastrique | 30 | 10 | 3 | seul | 5 fx/sem | Schéma le plus utilisé ; hémostase environ 80 % |
| est-pall-20-5 | PTV tumeur gastrique | 20 | 5 | 4 | seul | 5 fx/sem | Si survie attendue courte |

**Tableau Schémas — liens**

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| est-int0116-45-25 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-est | vol-est-adj | ct-abdo-acrop-crt |  |
| est-pall-30-10 | RT 3D ou VMAT | Aucune | sim-est | vol-est-pall |  |  |
| est-pall-20-5 | RT 3D ou VMAT | Aucune | sim-est | vol-est-pall |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-est | Décubitus dorsal, bras au-dessus de la tête | Matelas ou cale genoux | À jeun ; même préparation au scanner et à chaque séance | Injecté sauf contre-indication | Scanner préopératoire, comptes rendus opératoire et histologique | Clips chirurgicaux |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-est-adj | CTV | CTV | Lit tumoral, anastomose ou moignon, aires ganglionnaires de drainage selon la localisation de la tumeur (classification japonaise) | Toujours |  |
| vol-est-adj | PTV | PTV | CTV + marge selon le mouvement et l'IGRT | Toujours |  |
| vol-est-pall | PTV | PTV | Tumeur gastrique, marge selon le mouvement | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-est-adj | oar-rein-d ; oar-rein-g ; oar-foie ; oar-moelle ; oar-coeur ; oar-poumons ; oar-grele ; oar-duodenum | EORTC-ROG (Matzinger 2009) ; ESTRO ACROP aires ganglionnaires digestives hautes 2021 |
| vol-est-pall | oar-rein-d ; oar-rein-g ; oar-foie ; oar-moelle | — |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| est-adj | 5FU 425 mg/m²/j + leucovorine 20 mg/m²/j, 5 jours, avant et après la RT ; doses réduites pendant la RT | 5FU-leucovorine (INT-0116, Macdonald) | int0116 | Chimiothérapie de l'essai |
| est-adj | Chimiothérapie périopératoire FLOT : standard si la tumeur est vue avant la chirurgie | FLOT (œsogastrique) | flot4 | Après FLOT, pas de RT adjuvante (CRITICS) |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| estomac | Après chimiothérapie périopératoire, la RCT postopératoire n'apporte rien (CRITICS). La RCT préopératoire non plus (TOPGEAR) |
| estomac | Après gastrectomie D2 N+, l'ajout de la RT au SOX ne réduit pas les récidives (ARTIST 2) |
| est-adj | Indication résiduelle : patient opéré d'emblée, sans chimiothérapie périopératoire, pT3+ ou N+ |
| est-pall | Pas d'essai randomisé : 30 Gy / 10 fx et 20 Gy / 5 fx sont les schémas retenus par les revues |
