# ORL — Sinus et cavités nasales

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `orl`, localisation `sinus`. Carcinomes et adénocarcinomes des sinus de la face et des cavités nasales. Centrage et volumes communs : onglet « ORL — Cavité buccale ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| sin-post-op | Sinus ou cavités nasales opérés : RT adjuvante | post\_op | Curie : template « ORL post-op sinus » ; volumes de l'ethmoïde opéré selon Guillemin 2021 | 1 |
| sin-en-place | Tumeur non résécable : RT exclusive ± chimiothérapie | en\_place | Protocole Curie de tumeur en place (tous sites des VADS) | 2 |

## Schémas et prescriptions

Quatre schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| sin-postop-66-curie | sin-post-op | RT post-opératoire 66 / 59,4 / 54 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | guillemin2021 ; curie-vads-2021 | Institut Curie 2021 |
| sin-postop-60-54-service | sin-post-op | RT post-opératoire 60 / 54 Gy en 30 fx | rte\_normo | pratique\_institutionnelle | guillemin2021 | Tableur du service « ORL 60-54 Gy » |
| sin-70-35-curie | sin-en-place | RT exclusive 70 / 63 / 56 Gy en 35 fx (SIB) | rte\_normo | pratique\_institutionnelle | curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 70-63-56 Gy » |
| sin-70-30-igr | sin-en-place | RT 70 / 60 / 54 Gy en 30 fx (SIB) | rte\_hypo | pratique\_institutionnelle | igr-orl-rcmi | Gustave Roussy, RCMI des cancers de la tête et du cou (2017) |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sin-postop-66-curie | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Seulement si R1 ou rupture capsulaire |
| sin-postop-66-curie | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Lit opératoire |
| sin-postop-66-curie | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Prophylaxie |
| sin-postop-60-54-service | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Lit opératoire |
| sin-postop-60-54-service | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Volumes électifs |
| sin-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Prescription sur la D50 du PTV |
| sin-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| sin-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |
| sin-70-30-igr | PTV70 | 70 | 30 | 2.333 | SIB | 5 fx/sem (6 semaines) | Macroscopique |
| sin-70-30-igr | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Haut risque |
| sin-70-30-igr | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Risque intermédiaire |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| sin-postop-66-curie | VMAT SIB, CBCT quotidien | Aucune | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV66 ∪ PTV59,4 : D2 % ≤ 107 % |
| sin-postop-60-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Aucune | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| sin-70-35-curie | VMAT SIB, CBCT quotidien | Aucune | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| sin-70-30-igr | RapidArc ou tomothérapie SIB | Aucune | sim-orl-igr | vol-orl-igr | ct-orl-igr | PTV70 : D95 % ≥ 66,5 Gy, D5 % ≤ 77 Gy ; PTV60 : D95 % ≥ 57 Gy ; PTV54 : D95 % ≥ 51,3 Gy |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Sinus de la face | Selon GEC-ESTRO | Recommandations GEC-ESTRO 2009 | Le site figure parmi les localisations classiques de la curiethérapie ORL ; doses dans les recommandations |

## Centrage

Fiches `sim-orl-curie` et `sim-orl-igr` (onglet « ORL — Cavité buccale »). Gustave Roussy : masque stéréotaxique 3 points possible, en particulier pour l'adénocarcinome des sinus. Curie : templates « ORL post-op sinus » et « ORL cavum/sinus » (OAR de la base du crâne et de l'orbite).

## Contourage

Volumes `vol-orl-curie-postop` (CTV54\_T de l'ethmoïde selon Guillemin 2021), `vol-orl-curie-en-place` et `vol-orl-igr` (onglet « ORL — Cavité buccale »).

## Traitement systémique associé

Pas de traitement systémique standard défini par les sources de cet onglet.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| sinus | Les priorités OAR peuvent changer pour le contenu orbitaire, surtout en irradiation ethmoïdale (Gustave Roussy) |
| ct-orl-curie | Œil : Dmoy ≤ 5 Gy hors tumeur des sinus ; pour les sinus, Dmoy ≤ 35 Gy et D0,035cc ≤ 50 Gy (Curie) |
| sinus | Proposition de délinéation des CTV post-opératoires des cancers de l'ethmoïde : Guillemin 2021 |
