# Sarcomes — Chordome

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `sarcome`, localisation `chordome`. Chordome du sacrum et du rachis mobile de l'adulte ; chordome de la base du crâne non traité dans cet onglet.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| ch-rachis | Chordome du sacrum ou du rachis mobile : RT de haute dose | post\_op | Prise en charge en centre expert, après chirurgie ou à la place de la chirurgie pour une tumeur non réséquée (consensus de Stacchiotti 2015 ; Kabolizadeh 2017) ; les marges saines sont rares dans le rachis (DeLaney 2009) | 1 |

## Schémas et prescriptions

Deux schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| ch-service-704-56 | ch-rachis | Tomothérapie 70,4 / 56 Gy en 32 fx (SIB) | rte\_normo | pratique\_institutionnelle | stacchiotti2015 | Tableur du service « chordome sacrum » |
| ch-delaney-774 | ch-rachis | Photons-protons 50,4 puis 70,2 puis 77,4 Gy (RBE) en fractions de 1,8 Gy | rte\_normo | option | delaney2009 ; delaney2014 ; kabolizadeh2017 | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ch-service-704-56 | PTVHR | 70.4 | 32 | 2.2 | SIB | 5 fx/sem | Haut risque |
| ch-service-704-56 | PTVBR | 56 | 32 | 1.75 | SIB | 5 fx/sem | Bas risque ; le tableur écrit « 1,7 Gy/j » (écart E76) |
| ch-delaney-774 | Maladie infraclinique | 50.4 | 28 | 1.8 | sequentiel | 1 fx/j | Gy RBE |
| ch-delaney-774 | Lit tumoral (maladie microscopique) | 19.8 | 11 | 1.8 | sequentiel | 1 fx/j | Cumul 70,2 Gy RBE |
| ch-delaney-774 | Maladie macroscopique | 7.2 | 4 | 1.8 | sequentiel | 1 fx/j | Cumul 77,4 Gy RBE ; contrôle local à 5 ans 85,4 % en RT exclusive (Kabolizadeh 2017) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| ch-service-704-56 | Tomothérapie | Aucune | | vol-ch-service | ct-chordome-delaney | |
| ch-delaney-774 | Protonthérapie ou association photons-protons | Aucune | | vol-ch-delaney | ct-chordome-delaney | |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Pas de fiche de centrage du service pour cette localisation.

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-ch-service | CTVHR | CTV | Volume à haut risque, défini par le médecin | Toujours | |
| vol-ch-service | PTVHR | PTV | CTVHR + 5 mm | Toujours | 5 mm |
| vol-ch-service | CTVBR | CTV | Volume à bas risque, défini par le médecin | Toujours | |
| vol-ch-service | PTVBR | PTV | CTVBR + 5 mm | Toujours | 5 mm |
| vol-ch-delaney | Maladie infraclinique | CTV | Volume infraclinique (50,4 Gy RBE) | Toujours | |
| vol-ch-delaney | Lit tumoral | CTV | Maladie microscopique du lit tumoral (70,2 Gy RBE) | Après chirurgie | |
| vol-ch-delaney | Maladie macroscopique | GTV | Tumeur macroscopique (77,4 Gy RBE) | Tumeur en place ou reliquat | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-ch-service | oar-tete-femorale-d ; oar-tete-femorale-g ; oar-vessie ; oar-rectum ; oar-canal-anal ; oar-bulbe ; oar-queue-cheval ; oar-moelle ; oar-oge ; oar-grele ; oar-plexus-sacre | |
| vol-ch-delaney | oar-moelle ; oar-queue-cheval ; oar-plexus-sacre ; oar-rectum ; oar-vessie ; oar-grele | |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ces schémas.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| ch-rachis | Récidive locale 11 % pour les tumeurs primitives contre 50 % pour les récidives (DeLaney 2014) : traiter dès la première prise en charge |
| ch-delaney-774 | Neuropathies sacrées après 76,6 à 77,4 Gy RBE, aucune toxicité neurologique tardive jusqu'à 72 Gy RBE ; morbidité tardive de grade 3–4 à 8 ans 13 % (DeLaney 2014) |
| ch-service-704-56 | Contraintes du tableur du service non reprises (écart E77) ; moelle selon DeLaney |
