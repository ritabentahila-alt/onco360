# Uro — Pénis

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `uro`, localisation `penis`. Carcinome épidermoïde du gland : curiethérapie conservatrice (consensus ABS-GEC-ESTRO 2013 ; expérience de Gustave Roussy).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| pn-gland | Carcinome épidermoïde du gland T1, T2 ou T3 sélectionné | en\_place | Curiethérapie interstitielle recommandée en traitement initial (ABS-GEC-ESTRO 2013) ; posthectomie avant l'implant (Gustave Roussy) | 1 |

## Schémas et prescriptions

Deux schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| pn-ldr-60 | pn-gland | Curiethérapie interstitielle bas débit ou débit pulsé 60 Gy | curie\_ldr | recommandation | abs-gec-estro-penis-2013 ; crook2005-penis |  |
| pn-pdr-igr | pn-gland | Curiethérapie débit pulsé guidée par scanner, 60 Gy (Gustave Roussy) | curie\_pdr | pratique\_institutionnelle | achkar2025-penis | Gustave Roussy, unité de curiethérapie |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pn-ldr-60 | CTV | 60 |  |  | seul | Débit moyen 65 cGy/h, durée moyenne 98,8 h | Débit pulsé 50 à 61,2 cGy/h sans correction de la dose totale (Crook 2005) |
| pn-pdr-igr | CTV | 60 |  |  | seul | Médiane 150 pulses | Dose médiane 60 Gy (37 à 65 Gy) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| pn-ldr-60 | Implant d'iridium 192 : 2 ou 3 plans parallèles d'aiguilles sur gabarit acrylique (médiane 6 aiguilles, espacement moyen 13,5 mm) | Aucune |  | vol-penis |  |  |
| pn-pdr-igr | Implant interstitiel, dosimétrie sur scanner | Aucune |  | vol-penis | ct-penis-igr |  |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Carcinome invasif du gland T1, T2 et T3 sélectionnés | Interstitielle, iridium 192 bas débit, débit pulsé ou haut débit | Consensus ABS-GEC-ESTRO 2013 | Conservation du pénis 70 % à 10 ans ; dose et fractionnement optimaux du haut débit encore en développement |

## Centrage

Pas de fiche de centrage du service pour cette localisation.

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-penis | CTV | CTV | Tumeur du gland, après posthectomie | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-penis | oar-uretre |  |

## Traitement systémique associé

Pas de traitement systémique associé à la curiethérapie.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| pn-ldr-60 | Conservation du pénis à 5 ans 86,5 % ; nécrose des tissus mous 16 %, sténose urétrale 12 % ; échecs locaux tous rattrapés par la chirurgie (Crook 2005) |
| pn-pdr-igr | Gustave Roussy (65 patients) : rechute locale 18,4 %, survie sans maladie à 3 ans 74,4 % ; sténose méatique de grade 2 : 21,5 %, liée à la dose à l'urètre distal |
| penis | Complications principales : sténose du méat et ulcération des tissus mous ; ulcération persistante traitable notamment par oxygénothérapie hyperbare (ABS-GEC-ESTRO 2013) |
