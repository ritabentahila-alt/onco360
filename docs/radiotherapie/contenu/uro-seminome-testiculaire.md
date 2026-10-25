# Uro — Séminome testiculaire

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `uro`, localisation `seminome`. Séminome après orchidectomie.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| se-st1 | Séminome stade I : RT adjuvante | post\_op | Après orchidectomie, sans chirurgie inguino-scrotale homolatérale préalable (critère de TE10) ; option parmi les stratégies adjuvantes discutées en RCP | 1 |
| se-st2 | Séminome stade IIA ou IIB | post\_op | Atteinte ganglionnaire rétropéritonéale (IIA, IIB) | 2 |

## Schémas et prescriptions

Quatre schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| se-20-10 | se-st1 | Para-aortique 20 Gy / 10 fx | rte\_normo | essai\_phase3 | te18 ; te10 |  |
| se-30-15 | se-st1 | Para-aortique 30 Gy / 15 fx | rte\_normo | essai\_phase3 | te18 ; te10 |  |
| se-iia-30 | se-st2 | Stade IIA : 30 Gy | rte\_normo | option | classen2003 |  |
| se-iib-36 | se-st2 | Stade IIB : 36 Gy | rte\_normo | option | classen2003 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| se-20-10 | PTV para-aortique | 20 | 10 | 2 | seul | 2 semaines | Rechutes 11 contre 10 avec 30 Gy (HR 1,11) ; moins de fatigue (5 contre 20 %) |
| se-30-15 | PTV para-aortique | 30 | 15 | 2 | seul | 3 semaines | Ancien standard de TE18 et TE10 |
| se-iia-30 | PTV | 30 |  |  | seul | Selon le protocole | Survie sans rechute à 6 ans 95,3 % |
| se-iib-36 | PTV | 36 |  |  | seul | Selon le protocole | Survie sans rechute à 6 ans 88,9 % |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| se-20-10 | RT externe | Aucune |  | vol-seminome |  |  |
| se-30-15 | RT externe | Aucune |  | vol-seminome |  |  |
| se-iia-30 | RT externe | Aucune |  | vol-seminome |  |  |
| se-iib-36 | RT externe | Aucune |  | vol-seminome |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Pas de fiche de centrage du service pour cette localisation.

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-seminome | CTV para-aortique | CTV | Ganglions para-aortiques (bande para-aortique) | Stade I |  |
| vol-seminome | CTV iliaque homolatéral | CTV | Ganglions iliaques homolatéraux, ajoutés au para-aortique (champ « dog-leg ») | Selon l'indication |  |
| vol-seminome | GTV ganglionnaire | GTV | Adénopathies rétropéritonéales | Stade II |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-seminome | oar-reins ; oar-rein-d ; oar-rein-g ; oar-grele ; oar-moelle ; oar-foie ; oar-estomac ; oar-duodenum |  |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ces schémas.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| se-st1 | Para-aortique seul contre para-aortique et iliaque homolatéral (30 Gy / 15 fx) : survie sans rechute à 3 ans 96 contre 96,6 % ; l'IC à 95 % exclut une différence de rechutes pelviennes de plus de 4 % (TE10) |
| se-st2 | Toxicité aiguë maximale : nausées de grade 3 chez 8 % (IIA) ; nausées et diarrhée de grade 3 chez 10 % (IIB) (Classen 2003) |
