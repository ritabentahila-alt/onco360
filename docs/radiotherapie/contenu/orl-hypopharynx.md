# ORL — Hypopharynx

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `orl`, localisation `hypopharynx`. Carcinomes épidermoïdes. Centrage et volumes communs : onglet « ORL — Cavité buccale ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| hyp-en-place | Hypopharynx non opéré : RCT ou préservation laryngée | en\_place | Tumeur relevant d'une laryngectomie totale chez un patient candidat à la préservation : chimiothérapie d'induction puis RT chez les répondeurs (EORTC 24891, GORTEC 2000-01) ; sinon RCT au cisplatine | 1 |
| hyp-post-op | Hypopharynx opéré : RT adjuvante | post\_op | Haut risque : marges positives ou rupture capsulaire → 66 Gy et cisplatine. Intermédiaire : T3–T4, engainements, emboles → 60 Gy (fiche du service) | 2 |

## Schémas et prescriptions

Sept schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| hyp-rct-70-35-curie | hyp-en-place | RCT 70 / 63 / 56 Gy en 35 fx (SIB) + cisplatine | rte\_normo | pratique\_institutionnelle | mach-nc ; mach-nc-2021 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 70-63-56 Gy » |
| hyp-induction-rt | hyp-en-place | Induction TPF × 3 puis RT 70 / 63 / 56 Gy en 35 fx chez les répondeurs | rte\_normo | essai\_phase3 | eortc24891 ; gortec2000-01 ; curie-vads-2021 | Institut Curie 2021 pour la RT |
| hyp-6996-33-service | hyp-en-place | RCT 69,96 / 59,4 / 54,12 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | rtog0225 ; mach-nc | Tableur du service « ORL 69,96-59,4-54,12 Gy » |
| hyp-70-30-igr | hyp-en-place | RT 70 / 60 / 54 Gy en 30 fx (SIB) | rte\_hypo | pratique\_institutionnelle | igr-orl-rcmi | Gustave Roussy, RCMI des cancers de la tête et du cou (2017) |
| hyp-postop-66-curie | hyp-post-op | RT post-opératoire 66 / 59,4 / 54 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 66-59,4-54,12 Gy » |
| hyp-postop-66-54-service | hyp-post-op | RT post-opératoire 66 / 54 Gy en 33 fx (fiche du service) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » |
| hyp-postop-60-54-service | hyp-post-op | RT post-opératoire 60 / 54 Gy en 30 fx (risque intermédiaire) | rte\_normo | pratique\_institutionnelle | rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » ; tableur du service « ORL 60-54 Gy » |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| hyp-rct-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Prescription sur la D50 du PTV |
| hyp-rct-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| hyp-rct-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie, bilatérale |
| hyp-induction-rt | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Non-répondeurs : chirurgie puis RT post-opératoire |
| hyp-induction-rt | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel |
| hyp-induction-rt | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |
| hyp-6996-33-service | PTV69,96 | 69.96 | 33 | 2.12 | SIB | 5 fx/sem | Macroscopique |
| hyp-6996-33-service | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Haut risque |
| hyp-6996-33-service | PTV54,12 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Bas risque |
| hyp-70-30-igr | PTV70 | 70 | 30 | 2.333 | SIB | 5 fx/sem (6 semaines) | Macroscopique |
| hyp-70-30-igr | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Haut risque |
| hyp-70-30-igr | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Risque intermédiaire |
| hyp-postop-66-curie | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Seulement si R1 ou rupture capsulaire |
| hyp-postop-66-curie | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Lit opératoire et niveaux N+ |
| hyp-postop-66-curie | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Prophylaxie |
| hyp-postop-66-54-service | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Marges positives ou rupture capsulaire |
| hyp-postop-66-54-service | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | II–IV bilatéraux ± VI (écart E63) |
| hyp-postop-60-54-service | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | T3–T4, engainements, emboles |
| hyp-postop-60-54-service | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Aires électives |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| hyp-rct-70-35-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| hyp-induction-rt | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| hyp-6996-33-service | Tomothérapie ou VMAT SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-orl-igr | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| hyp-70-30-igr | RapidArc ou tomothérapie SIB | Voir Traitement systémique | sim-orl-igr | vol-orl-igr | ct-orl-igr | PTV70 : D95 % ≥ 66,5 Gy, D5 % ≤ 77 Gy ; PTV60 : D95 % ≥ 57 Gy ; PTV54 : D95 % ≥ 51,3 Gy |
| hyp-postop-66-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV66 ∪ PTV59,4 : D2 % ≤ 107 % |
| hyp-postop-66-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-hyp-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| hyp-postop-60-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Aucune | sim-orl-curie | vol-hyp-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fiches `sim-orl-curie` et `sim-orl-igr` (onglet « ORL — Cavité buccale »). Traction des épaules si le volume descend sous l'os hyoïde (Gustave Roussy).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-hyp-postop-service | CTV T66 | CTV | Lit du sinus piriforme, de la région rétrocricoïdienne ou de la paroi postérieure ; zones de marge positive | Haut risque |  |
| vol-hyp-postop-service | CTV T54 | CTV | Sinus piriforme controlatéral si tumeur médiane, paroi pharyngée postérieure, espace paraglottique, région rétrocricoïdienne, œsophage cervical supérieur, cartilage thyroïde adjacent ; couverture cranio-caudale large (extension sous-muqueuse fréquente) | Toujours |  |
| vol-hyp-postop-service | CTV N66 | CTV | Loge ganglionnaire avec rupture capsulaire | Rupture capsulaire |  |
| vol-hyp-postop-service | CTV N54 | CTV | II, III, IV, VI (important), ± rétropharyngés ; bilatéral presque toujours | Toujours |  |
| vol-hyp-postop-service | CTV60 | CTV | Lit tumoral si T3–T4, engainements ou emboles, sans facteur de haut risque (écart E24) | Risque intermédiaire |  |
| vol-hyp-postop-service | PTV66, PTV60, PTV54 | PTV | CTV + 5 mm | Toujours | 5 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-hyp-postop-service | oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-cavite-orale ; oar-moelle ; oar-thyroide ; oar-mandibule ; oar-tronc-cerebral ; oar-muscles-nuque ; oar-plexus-brachial-d ; oar-plexus-brachial-g | [Grégoire 2014](https://doi.org/10.1016/j.radonc.2013.10.010) ; [Lapeyre 2010](<https://doi.org/10.1016/S1278-3218(10)70007-X>) |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| hyp-en-place | TPF d'induction × 3 (docétaxel, cisplatine, 5-FU), puis RT si réponse | TPF d'induction (docétaxel–cisplatine–5-FU) | gortec2000-01 ; eortc24891 | EORTC 24891 (cisplatine–5-FU d'induction) : survie équivalente à la chirurgie, larynx fonctionnel 35 % à 5 ans |
| hyp-en-place | Cisplatine concomitant à la RT | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | mach-nc ; mach-nc-2021 | Bénéfice de la chimiothérapie concomitante (HR 0,81) |
| hyp-post-op | Cisplatine 100 mg/m² J1, J22 et J43 | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | eortc22931 ; rtog9501 ; bernier2005 | Si marges positives ou rupture capsulaire |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| hypopharynx | Drainage ganglionnaire bilatéral fréquent ; niveau VI à inclure (fiche du service) |
| hyp-en-place | TPF supérieur à PF en induction pour la réponse (80 contre 59 %) et la préservation laryngée (GORTEC 2000-01) |
