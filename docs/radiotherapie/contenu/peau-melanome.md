# Peau — Mélanome

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `peau`, localisation `melanome`. RT adjuvante des aires ganglionnaires après curage. Mélanome uvéal : onglet « Autres — Mélanome uvéal ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| ml-gg | Après curage d'une rechute ganglionnaire palpable, à haut risque de nouvelle rechute dans l'aire | post\_op | Critères de l'essai ANZMTG 01.02 / TROG 02.01 (aire parotidienne et cervicale, axillaire ou inguinale ; nombre et taille des ganglions, rupture capsulaire) ; pas de gain de survie : décision en RCP | 1 |

## Schémas et prescriptions

Un schéma. Statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| ml-48-20 | ml-gg | RT adjuvante 48 Gy / 20 fx | rte\_hypo | essai\_phase3 | trog0201 ; trog0201-lt | |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ml-48-20 | PTV aire de curage | 48 | 20 | 2.4 | seul | En 30 jours au plus | Rechutes dans l'aire 21 % contre 36 % (HR 0,52) ; SG et survie sans rechute non différentes |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| ml-48-20 | RT externe | Selon RCP | | vol-melanome | | |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Pas de fiche de centrage du service pour cette localisation.

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-melanome | CTV | CTV | Aire de curage ganglionnaire (parotidienne et cervicale, axillaire ou inguinale) | Toujours | |
| vol-melanome | PTV | PTV | CTV + marge du centre | Toujours | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-melanome | oar-peau ; oar-parotide-d ; oar-parotide-g ; oar-plexus-brachial-d ; oar-plexus-brachial-g ; oar-tete-femorale-d ; oar-tete-femorale-g | |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ce schéma ; le traitement adjuvant systémique relève de la RCP.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| ml-48-20 | Effets tardifs mineurs fréquents (douleur, fibrose cutanée ou sous-cutanée) au suivi médian de 73 mois (TROG 02.01) |
