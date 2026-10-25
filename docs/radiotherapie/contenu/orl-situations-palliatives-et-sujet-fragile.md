# ORL — Situations palliatives et sujet fragile

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `orl`, localisation `orl_palliatif`. Carcinomes épidermoïdes des VADS. La réirradiation sera traitée avec le lot E.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| pal-fragile | Patient âgé ou fragile : protocole dégradé | palliatif | Patient ne supportant pas un traitement continu de 7 semaines (Curie, annexe B) | 1 |
| pal-incurable | Cancer incurable : RT palliative | palliatif | Maladie incurable, état général altéré (QUAD SHOT : 20 patients sur 30 en OMS 2–3) | 2 |

## Schémas et prescriptions

Six schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| pal-split-70 | pal-fragile | Split course 70 Gy / 35 fx sans changer volumes ni dose | rte\_normo | pratique\_institutionnelle | curie-vads-2021 | Institut Curie 2021, annexe B |
| pal-split-55 | pal-fragile | Split course 55 Gy (30 Gy / 10 fx puis 25 Gy / 10 fx) sur le macroscopique | rte\_hypo | pratique\_institutionnelle | curie-vads-2021 | Institut Curie 2021, annexe B |
| pal-quadshot | pal-incurable | QUAD SHOT : 14 Gy / 4 fx en 2 jours, 3 cycles | rte\_hypo | option | corry2005 |  |
| pal-hypo-30-5 | pal-incurable | 30 Gy / 5 fx (2 fx/sem) ± complément 6 Gy | rte\_hypo | option | porceddu2007 |  |
| pal-30-10 | pal-incurable | 30 Gy / 10 fx | rte\_hypo | pratique\_institutionnelle | curie-vads-2021 | Institut Curie 2021, annexe B |
| pal-8-1 | pal-incurable | 8 Gy / 1 fx | rte\_hypo | pratique\_institutionnelle | curie-vads-2021 | Institut Curie 2021, annexe B |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pal-split-70 | PTV70 | 70 | 35 | 2 | SIB | 10 fx, 2 sem de repos, 10 fx, 2 sem de repos, 15 fx | Volumes et prescription identiques au schéma 70 / 63 / 56 Gy |
| pal-split-70 | PTV63 | 63 | 35 | 1.8 | SIB | Même étalement | Optionnel |
| pal-split-70 | PTV56 | 56 | 35 | 1.6 | SIB | Même étalement | Prophylaxie |
| pal-split-55 | PTV55 (ex-PTV70) | 30 | 10 | 3 | sequentiel | 5 fx/sem | Pas de prophylaxie : macroscopique seulement |
| pal-split-55 | PTV55 (ex-PTV70) | 25 | 10 | 2.5 | sequentiel | 5 fx/sem, après 2 sem de repos | Total 55 Gy |
| pal-quadshot | PTV (tumeur et adénopathies) | 42 | 12 | 3.5 | seul | 2 fx/j à 6 h d'intervalle, 2 jours ; cycle répété à 4 semaines (3 cycles) | 14 Gy par cycle ; cycles 2 et 3 seulement sans progression ; réponse objective 53 % |
| pal-hypo-30-5 | PTV | 30 | 5 | 6 | sequentiel | 2 fx/sem, au moins 3 jours d'intervalle | Réponse objective 80 % |
| pal-hypo-30-5 | PTV (maladie ≤ 3 cm) | 6 | 1 | 6 | sequentiel | 1 fx | Complément si petit volume et patient apte |
| pal-30-10 | PTV | 30 | 10 | 3 | seul | 5 fx/sem | Exemple de schéma palliatif (Curie) |
| pal-8-1 | PTV | 8 | 1 | 8 | seul | 1 fx | Exemple de schéma palliatif (Curie) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| pal-split-70 | VMAT SIB, CBCT quotidien | Aucune | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % |
| pal-split-55 | VMAT ou RT conformationnelle | Aucune | sim-orl-curie | vol-orl-pal |  |  |
| pal-quadshot | RT conformationnelle ou VMAT | Aucune | sim-orl-curie | vol-orl-pal |  |  |
| pal-hypo-30-5 | RT conformationnelle ou VMAT | Aucune | sim-orl-curie | vol-orl-pal |  |  |
| pal-30-10 | RT conformationnelle ou VMAT | Aucune | sim-orl-curie | vol-orl-pal |  |  |
| pal-8-1 | RT conformationnelle | Aucune | sim-orl-curie | vol-orl-pal |  |  |

## Curiethérapie

Pas de curiethérapie dans cet onglet ; curiethérapie palliative des récidives : lot E.

## Centrage

Fiche `sim-orl-curie` (onglet « ORL — Cavité buccale »).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-orl-pal | GTV | GTV | Tumeur et adénopathies macroscopiques | Toujours |  |
| vol-orl-pal | PTV | PTV | Volume macroscopique sans prophylaxie ganglionnaire (Curie, annexe B) ; marges du centre | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-orl-pal | oar-canal-medullaire ; oar-tronc-cerebral ; oar-parotide-d ; oar-parotide-g ; oar-cavite-orale ; oar-larynx |  |

## Traitement systémique associé

Pas de traitement systémique associé dans ces schémas.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| pal-incurable | Survie courte : médiane 5,7 mois (QUAD SHOT) et 6,1 mois (Hypo Trial) ; amélioration de la qualité de vie chez 44 % et 62 % des patients évaluables |
| pal-incurable | Pas de jeu de contraintes publié pour ces schémas courts |
