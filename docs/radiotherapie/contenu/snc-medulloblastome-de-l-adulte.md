# SNC — Médulloblastome de l'adulte

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `snc`, localisation `medulloblastome`. Patients post-pubères et adultes (recommandations EANO-EURACAN 2019) ; pédiatrie exclue.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| md-nonmeta | Médulloblastome de l'adulte non métastatique opéré | post\_op | Bilan d'extension par IRM de l'encéphale et du rachis et cytologie du LCR ; prise en charge multidisciplinaire (EANO-EURACAN 2019) | 1 |

## Schémas et prescriptions

Un schéma. Statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| md-csi-352-552 | md-nonmeta | Irradiation craniospinale 35,2 Gy puis fosse postérieure jusqu'à 55,2 Gy | rte\_normo | option | hit2000-adultes ; noa07 ; eano-medullo-2019 | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| md-csi-352-552 | PTV craniospinal | 35.2 | | | sequentiel | Selon le protocole HIT 2000 | Adultes de 21 ans ou plus suivis dans HIT 2000 |
| md-csi-352-552 | PTV fosse postérieure | 20 | | | sequentiel | Selon le protocole HIT 2000 | Cumul 55,2 Gy ; survie sans événement à 4 ans 68 %, SG 89 % |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| md-csi-352-552 | Irradiation craniospinale | Voir Traitement systémique | | vol-medullo | | |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Pas de fiche de centrage du service pour l'irradiation craniospinale.

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-medullo | CTV craniospinal | CTV | Encéphale et espaces sous-arachnoïdiens du canal rachidien | Toujours | |
| vol-medullo | CTV fosse postérieure | CTV | Fosse postérieure | Complément | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-medullo | oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-thyroide ; oar-coeur ; oar-poumons ; oar-oesophage ; oar-reins ; oar-foie | |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| md-nonmeta | Vincristine pendant l'irradiation craniospinale, puis 8 cycles de cisplatine, lomustine et vincristine | Vincristine concomitante puis cisplatine–lomustine–vincristine (NOA-07) | noa07 | Survie sans événement à 3 ans 66,6 % ; 4 cycles réalisables chez 70 % ; toxicité hématologique et polyneuropathie fréquentes |
| md-nonmeta | Chimiothérapie d'entretien lomustine, vincristine et cisplatine après la RT | Lomustine–vincristine–cisplatine en entretien (HIT 2000) | hit2000-adultes | Neuropathie périphérique 74 % et toxicité hématologique 55 % : plus fréquentes que chez l'enfant |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| md-nonmeta | Chez l'adulte, localisation latérale des formes desmoplasiques et statut du résidu inconnu sont des facteurs pronostiques défavorables ; l'absence de résidu post-opératoire est associée à moins de rechutes (HIT 2000) |
| md-nonmeta | NOA-07 : réductions de dose fréquentes pendant les 4 premiers cycles ; surveillance rapprochée |
