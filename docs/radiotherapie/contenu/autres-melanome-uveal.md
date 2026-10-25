# Autres — Mélanome uvéal

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `autres`, localisation `melanome_uveal`. Curiethérapie par plaque épisclérale (recommandations ABS 2014, essai COMS) ; rétinoblastome exclu (pédiatrie).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| mu-plaque | Mélanome de l'iris, du corps ciliaire ou de la choroïde | en\_place | La plupart des mélanomes uvéaux sont accessibles à la plaque, avec des restrictions selon la taille et la position ; contre-indications : extension orbitaire macroscopique, œil aveugle douloureux, absence de perception lumineuse ; traitement en centre spécialisé (ABS 2014) | 1 |

## Schémas et prescriptions

Deux schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| mu-coms-85 | mu-plaque | Plaque d'iode 125, 85 Gy à l'apex | curie\_ldr | essai\_phase3 | coms-12ans ; saconn2010 ; abs-uvee-2014 ; vonk2015 ; berry2013 | |
| mu-63 | mu-plaque | Plaque d'iode 125, environ 63 Gy à l'apex | curie\_ldr | option | saconn2010 | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mu-coms-85 | Apex tumoral | 85 | | | seul | Débit 60 à 105 cGy/h (ABS) ; environ 7 jours | Dose de prescription de COMS |
| mu-63 | Apex tumoral | 63 | | | seul | Débit médian 63,5 cGy/h | 56 à 69 Gy dans la série ; objectif : meilleur résultat visuel |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| mu-coms-85 | Plaque épisclérale COMS chargée en grains d'iode 125 ; pose par un chirurgien formé | Aucune | | vol-uvee | | Volume englobant l'apex et 2 mm autour de la base |
| mu-63 | Plaque épisclérale COMS chargée en grains d'iode 125 | Aucune | | vol-uvee | | Prescription à l'apex |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Mélanome de l'iris, du corps ciliaire ou de la choroïde | Curiethérapie par plaque épisclérale (iode 125) | Essai randomisé COMS (plaque contre énucléation) ; recommandations ABS 2014 | Assurance qualité, fabrication des plaques et dosimétrie selon les recommandations AAPM-ABS 2012 |

## Centrage

Pas de fiche de centrage du service pour cette localisation.

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-uvee | GTV | GTV | Tumeur (base et hauteur) | Toujours | |
| vol-uvee | Volume de prescription | CTV | Volume englobant l'apex et 2 mm autour de la base tumorale (Berry 2013) | Toujours | 2 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-uvee | oar-nerf-optique-d ; oar-nerf-optique-g ; oar-cristallin-d ; oar-cristallin-g ; oar-retine-d ; oar-retine-g | |

## Traitement systémique associé

Pas de traitement systémique associé à la curiethérapie.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| mu-coms-85 | COMS : mortalité toutes causes à 12 ans 43 % (plaque) contre 41 % (énucléation) ; décès par métastase confirmée 21 contre 17 % : pas de différence de survie |
| mu-coms-85 | Pour les tumeurs de moins de 5 mm de haut, prescrire à l'apex diminue la dose à toutes les structures sensibles sans perte de contrôle local ; contrôle local à 5 ans 95,3 % (Vonk 2015) |
| mu-plaque | Toxicités après plaque (85 Gy en 7 jours) : rétinopathie 37,8 %, neuropathie optique 14,6 %, cataracte 31,7 % (Berry 2013) |
