# Sarcomes — Rétropéritoine

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Une situation. Région `sarcome`, localisation `sarcome_retroperitoine`. Sarcome rétropéritonéal primitif de l'adulte. Fiche de dosimétrie Gustave Roussy « sarcomes rétropéritonéaux » (2017).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| srp-preop | Sarcome rétropéritonéal primitif localisé opérable | en\_place | RT pré-opératoire non standard : à discuter en RCP de sarcome (Baldini 2015) ; STRASS n'a pas montré de gain de survie sans récidive abdominale | 1 |

## Schémas et prescriptions

Un schéma. Statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| srp-504-28 | srp-preop | RT pré-opératoire 50,4 Gy / 28 fx | rte\_normo | essai\_phase3 | strass ; baldini2015-rps ; baldini2015-contours ; igr-sarcome-rp | Gustave Roussy, fiche « sarcomes rétropéritonéaux » (2017) |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| srp-504-28 | PTV | 50.4 | 28 | 1.8 | seul | 5 fx/sem | Chirurgie 4 à 8 semaines après la RT (Baldini 2015) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| srp-504-28 | RT conformationnelle 3D ou RCMI (STRASS) | Aucune | sim-srp | vol-srp | ct-sarcome-rp-igr | Gustave Roussy : PTV D95 % ≈ 95 % de la dose prescrite ; rapporter D50 %, Dmoy, D2 %, D98 % du PTV et D95 %, Dmoy du GTV |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-srp | Décubitus dorsal, bras au-dessus de la tête | — | Opacification digestive orale | Scanner de planification ; scanner 4D pour le mouvement interne (ITV) | — | — |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-srp | GTV | GTV | Tumeur rétropéritonéale | Toujours | |
| vol-srp | CTV (ou ITV si scanner 4D) | CTV | GTV + 1,5 cm, réduit à 0 mm dans l'os, 5 mm dans la cavité péritonéale et les cavités aériques, 0 mm aux interfaces rénale et hépatique si le mouvement interne est pris en compte, 3 mm sous la peau ; expansion complète dans les muscles rétropéritonéaux | Toujours | 1,5 cm |
| vol-srp | PTV | PTV | CTV ou ITV + marge selon l'IGRT | Toujours | |
| vol-srp | CTV à haut risque | CTV | Zone à risque de marge atteinte (paroi abdominale postérieure, espace para- et prévertébral, gros vaisseaux) : surimpression non recommandée hors essai | Non | |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-srp | oar-grele ; oar-colon ; oar-estomac ; oar-duodenum ; oar-reins ; oar-rein-d ; oar-rein-g ; oar-foie ; oar-moelle ; oar-rectum ; oar-vessie | [Consensus de contourage, Baldini 2015](https://doi.org/10.1016/j.ijrobp.2015.04.039) |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ce schéma.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| srp-preop | STRASS : survie sans récidive abdominale médiane 4,5 ans avec RT contre 5,0 ans sans (HR 1,01) ; lymphopénie de grade 3–4 : 77 % ; événements graves 24 % contre 10 % |
| srp-preop | Accord de contourage élevé pour le GTV et le CTV, plus faible pour le CTV à haut risque et le duodénum (Baldini 2015) |
| ct-sarcome-rp-igr | Reins : contraintes différentes selon qu'un seul rein fonctionnel est prévu après la chirurgie ou que les deux sont conservés |
