# Sein — Carcinome in situ

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `sein`, localisation `sein_ccis`. Indications du référentiel Sénorif 2021-2022. Centrage et volumes : onglet « Sein — Carcinome infiltrant ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| ccis-bcs | CCIS après chirurgie conservatrice à berges saines | post\_op | RT du sein entier en standard, dans les 12 semaines après la chirurgie. Surimpression : marge < 2 mm unifocale sans microcalcification résiduelle et sans reprise possible ; en option si âge < 50 ans, nécrose étendue, haut grade nucléaire | 1 |
| ccis-paget | Maladie de Paget isolée | post\_op | À considérer comme un CCIS de haut grade : RT du sein après chirurgie possible | 2 |

## Schémas et prescriptions

Cinq schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| ccis-50-25 | ccis-bcs | Sein 50 Gy / 25 fx | rte\_normo | essai\_phase3 | big307 ; senorif-2021 | Sénorif 2021-2022 (standard) |
| ccis-50-25-boost | ccis-bcs | Sein 50 Gy / 25 fx puis surimpression 16 Gy / 8 fx | rte\_normo | essai\_phase3 | big307 ; senorif-2021 | Sénorif 2021-2022 (10 à 16 Gy) |
| ccis-425-16-boost | ccis-bcs | Sein 42,5 Gy / 16 fx ± surimpression 16 Gy / 8 fx | rte\_hypo | essai\_phase3 | big307 |  |
| ccis-40-15 | ccis-bcs | Sein 40,05 Gy / 15 fx ± surimpression | rte\_hypo | essai\_phase3 | dbcg-hypo ; senorif-2021 | Sénorif 2021-2022 (option) |
| ccis-paget-50-25 | ccis-paget | Sein 50 Gy / 25 fx | rte\_normo | recommandation | senorif-2021 | Sénorif 2021-2022 |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ccis-50-25 | PTV sein | 50 | 25 | 2 | seul | 5 fx/sem | Sans surimpression si aucun facteur |
| ccis-50-25-boost | PTV sein | 50 | 25 | 2 | sequentiel | 5 fx/sem | Premier temps |
| ccis-50-25-boost | PTV lit tumoral | 16 | 8 | 2 | sequentiel | 5 fx/sem | Sénorif : 10 à 16 Gy en fractions de 2 Gy ; BIG 3-07 : 16 Gy / 8 fx |
| ccis-425-16-boost | PTV sein | 42.5 | 16 | 2.656 | sequentiel | 5 fx/sem | Bras hypofractionné de BIG 3-07 ; Sénorif écrit « 42 Gy en 16 fractions » (écart E66) |
| ccis-425-16-boost | PTV lit tumoral | 16 | 8 | 2 | sequentiel | 5 fx/sem | Si surimpression indiquée |
| ccis-40-15 | PTV sein | 40.05 | 15 | 2.67 | seul | 5 fx/sem | DBCG HYPO : induration et récidive locorégionale non augmentées, CCIS inclus |
| ccis-paget-50-25 | PTV sein | 50 | 25 | 2 | seul | 5 fx/sem | Comme un CCIS de haut grade |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| ccis-50-25 | RT conformationnelle 3D | Aucune | sim-sein | vol-sein | ct-sein-senorif ; ct-thorax-quantec |  |
| ccis-50-25-boost | RT 3D puis surimpression | Aucune | sim-sein | vol-sein | ct-sein-senorif ; ct-thorax-quantec |  |
| ccis-425-16-boost | RT 3D puis surimpression | Aucune | sim-sein | vol-sein | ct-sein-senorif |  |
| ccis-40-15 | RT 3D | Aucune | sim-sein | vol-sein | ct-sein-ff-15fx ; ct-sein-senorif | PTV : V95 % > 95 %, V105 % < 5 %, V107 % < 2 %, Dmax < 110 % (FAST-Forward) |
| ccis-paget-50-25 | RT 3D | Aucune | sim-sein | vol-sein | ct-sein-senorif ; ct-thorax-quantec |  |

## Curiethérapie

Hors essai, l'irradiation partielle du sein n'est pas recommandée pour le CCIS (Sénorif).

## Centrage

Fiche `sim-sein` (onglet « Sein — Carcinome infiltrant »).

## Contourage

Volumes `vol-sein` (onglet « Sein — Carcinome infiltrant »).

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans cet onglet.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| ccis-bcs | Surimpression : 97,1 % sans récidive locale à 5 ans contre 92,7 % sans surimpression (HR 0,47), au prix de plus de douleurs et d'induration (BIG 3-07) |
| ccis-bcs | Omission de la RT seulement dans des études prospectives contrôlées ou en cas de contre-indication (Sénorif) |
| sein\_ccis | Pas de RT après mastectomie totale, sauf berges atteintes ; pas de RT pour le carcinome lobulaire in situ classique, sauf forme pléomorphe ou avec nécrose (Sénorif) |
| ccis-40-15 | Sénorif 2021 classe l'hypofractionnement du CCIS en niveau de preuve faible ; DBCG HYPO (2020) incluait des CCIS et BIG 3-07 (2022) a testé 42,5 Gy / 16 fx |
