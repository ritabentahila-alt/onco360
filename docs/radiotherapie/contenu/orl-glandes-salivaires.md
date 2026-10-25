# ORL — Glandes salivaires

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `orl`, localisation `glandes_salivaires`. Carcinomes de la parotide et de la glande sous-mandibulaire. Centrage et volumes communs : onglet « ORL — Cavité buccale ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| gs-post-op | Glande salivaire opérée : RT adjuvante | post\_op | T3–T4, exérèse incomplète ou marges proches, envahissement osseux, engainements, pN+ (Terhaard 2005) | 1 |
| gs-en-place | Tumeur non résécable : RT exclusive | en\_place | Au moins 66 Gy (Terhaard 2005) | 2 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| gs-postop-66-curie | gs-post-op | RT post-opératoire 66 / 59,4 / 54 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | terhaard2005 ; piram2019 ; fredericmoreau2019 ; curie-vads-2021 | Institut Curie 2021 |
| gs-postop-60-54-service | gs-post-op | RT post-opératoire 60 / 54 Gy en 30 fx | rte\_normo | pratique\_institutionnelle | terhaard2005 | Tableur du service « ORL 60-54 Gy » |
| gs-70-35-curie | gs-en-place | RT exclusive 70 / 63 / 56 Gy en 35 fx (SIB) | rte\_normo | pratique\_institutionnelle | terhaard2005 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 70-63-56 Gy » |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gs-postop-66-curie | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Seulement si R1 ou rupture capsulaire |
| gs-postop-66-curie | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Lit opératoire |
| gs-postop-66-curie | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Prophylaxie ; cou électif selon l'histologie et le stade |
| gs-postop-60-54-service | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Au moins 60 Gy en post-opératoire (Terhaard 2005) |
| gs-postop-60-54-service | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Volumes électifs ; dose médiane de l'irradiation élective du cou dans la série : 50 Gy |
| gs-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Contrôle local à 5 ans 50 % avec 66–70 Gy en RT exclusive |
| gs-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| gs-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| gs-postop-66-curie | VMAT SIB, CBCT quotidien | Aucune | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV66 ∪ PTV59,4 : D2 % ≤ 107 % |
| gs-postop-60-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Aucune | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| gs-70-35-curie | VMAT SIB, CBCT quotidien | Aucune | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fiche `sim-orl-curie` (onglet « ORL — Cavité buccale »).

## Contourage

Volumes `vol-orl-curie-postop` et `vol-orl-curie-en-place` (onglet « ORL — Cavité buccale »). CTV de la tumeur primitive et choix des aires ganglionnaires : Piram 2019 (parotide) et Frédéric-Moreau 2019 (glande sous-mandibulaire), références du protocole Curie.

## Traitement systémique associé

Pas de traitement systémique standard défini par les sources de cet onglet.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| gs-post-op | La RT post-opératoire améliore le contrôle local à 10 ans : T3–T4 84 contre 18 %, exérèse incomplète 82 contre 44 %, marges proches 95 contre 55 %, envahissement osseux 86 contre 54 %, engainements 88 contre 60 % (Terhaard 2005) |
| glandes\_salivaires | Le type histologique aide à estimer le risque ganglionnaire et l'indication d'une irradiation élective du cou (Terhaard 2005) |
