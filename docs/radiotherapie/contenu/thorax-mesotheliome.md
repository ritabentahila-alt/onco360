# Thorax — Mésothéliome

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `thorax`, localisation `mesotheliome`. Mésothéliome pleural.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| meso-pd | Après chirurgie épargnant le poumon : RT hémithoracique | post\_op | Mésothéliome non métastatique après pleurectomie-décortication ou chirurgie non radicale, et chimiothérapie | 1 |
| meso-preop | Avant pneumonectomie extrapleurale (SMART) | en\_place | cT1–3 N0 M0 résécable, pneumonectomie extrapleurale programmée dans la semaine | 2 |
| meso-pall | Palliatif : douleur | palliatif | Douleur liée à une masse pleurale ou pariétale | 3 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| meso-hemi-50-25 | meso-pd | RT hémithoracique 50 Gy / 25 fx + SIB 60 Gy sur le résidu | rte\_normo | essai\_phase3 | trovo ; gomez-meso | Gustave Roussy, fiche dosimétrique mésothéliome post-opératoire |
| meso-smart-25-5 | meso-preop | RT hémithoracique 25 Gy / 5 fx + boost concomitant 30 Gy, puis pneumonectomie extrapleurale | rte\_hypo | option | cho-smart | Gustave Roussy, fiche dosimétrique mésothéliome pré-opératoire 5 × 5 Gy |
| meso-pall-20-5 | meso-pall | RT antalgique 20 Gy / 5 fx | rte\_hypo | option | systems ; gomez-meso |  |

**Tableau Prescriptions**

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| meso-hemi-50-25 | PTV hémithorax (cavité pleurale homolatérale) | 50 | 25 | 2 | seul | 5 fx/sem |  |
| meso-hemi-50-25 | PTV résidu macroscopique | 60 | 25 | 2.4 | SIB | 5 fx/sem | SG à 2 ans 58 % vs 28 % (Trovo) |
| meso-smart-25-5 | PTV hémithorax | 25 | 5 | 5 | seul | 5 fx/sem, 1 semaine | Pneumonectomie extrapleurale dans la semaine suivante |
| meso-smart-25-5 | PTV zones à risque | 30 | 5 | 6 | SIB | 5 fx/sem | Boost concomitant de 5 Gy (Cho 2014) |
| meso-pall-20-5 | Masse douloureuse | 20 | 5 | 4 | seul | 5 fx/sem | Douleur améliorée chez 47 % des patients évaluables |

**Tableau Schémas — liens**

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| meso-hemi-50-25 | IMRT ou VMAT, IGRT quotidienne | Chimiothérapie avant la RT | sim-meso | vol-meso-hemi | ct-meso-igr-postop |  |
| meso-smart-25-5 | IMRT | Aucune avant la chirurgie | sim-meso | vol-meso-hemi | ct-meso-igr-preop-5x5 |  |
| meso-pall-20-5 | RT 3D | Aucune | sim-meso | vol-meso-pall |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-meso | Décubitus dorsal, bras au-dessus de la tête | Contention thoracique | — | Injecté | TEP-TDM du bilan | — |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-meso-hemi | GTV | GTV | Résidu tumoral macroscopique | Si résidu |  |
| vol-meso-hemi | CTV hémithorax | CTV | Cavité pleurale homolatérale entière, trajet de thoracotomie, stations médiastinales envahies ou ouvertes par la chirurgie | Toujours |  |
| vol-meso-pall | PTV | PTV | Masse responsable de la douleur, marge selon la technique | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-meso-hemi | oar-poumon-d ; oar-poumon-g ; oar-poumons ; oar-foie ; oar-coeur ; oar-moelle ; oar-oesophage ; oar-rein-d ; oar-rein-g ; oar-estomac | Consensus NCI/IASLC 2019 |
| vol-meso-pall | oar-moelle ; oar-poumons | — |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| meso-pd | Chimiothérapie avant la RT (Trovo) | — | trovo | Protocole choisi en RCP ; la RT suit la chirurgie et la chimiothérapie |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| mesotheliome | Pas d'irradiation prophylactique des orifices de ponction ou de drainage : SMART et PIT ne montrent aucun bénéfice (écart E41) |
| mesotheliome | RT hémithoracique après pneumonectomie extrapleurale non recommandée en routine (SAKK 17/04) |
| meso-hemi-50-25 | Toxicité non négligeable : 9 pneumopathies G2+, dont 1 G5 (Trovo). Respecter strictement les contraintes du poumon restant |
| meso-smart-25-5 | Seulement si la pneumonectomie extrapleurale est programmée dans les 7 jours : jamais en RT seule |
