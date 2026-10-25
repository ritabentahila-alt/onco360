# ORL — Larynx

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `orl`, localisation `larynx`. Carcinomes épidermoïdes. Centrage et volumes communs : onglet « ORL — Cavité buccale ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| lar-glotte-precoce | Glotte T1–T2 N0 : RT exclusive | en\_place | T1 N0 (Yamazaki 2006) ou T2 N0 (RTOG 9512) ; irradiation ganglionnaire souvent inutile (fiche du service) | 1 |
| lar-preservation | Larynx localement évolué : préservation laryngée | en\_place | Tumeur relevant d'une laryngectomie totale, patient candidat à la préservation : RCT au cisplatine (RTOG 91-11) ou chimiothérapie d'induction TPF puis RT chez les répondeurs (GORTEC 2000-01) | 2 |
| lar-post-op | Larynx opéré : RT adjuvante | post\_op | Haut risque : marges positives ou rupture capsulaire → 66 Gy et cisplatine. Intermédiaire → 60 Gy (fiche du service) | 3 |

## Schémas et prescriptions

Dix schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| lar-t1-5625-25 | lar-glotte-precoce | RT 56,25 Gy / 25 fx (2,25 Gy), T1 limité aux deux tiers de la corde | rte\_hypo | essai\_phase3 | yamazaki2006 |  |
| lar-t1-63-28 | lar-glotte-precoce | RT 63 Gy / 28 fx (2,25 Gy), T1 au-delà des deux tiers de la corde | rte\_hypo | essai\_phase3 | yamazaki2006 |  |
| lar-t2-70-35 | lar-glotte-precoce | RT 70 Gy / 35 fx, T2 glottique | rte\_normo | essai\_phase3 | rtog9512 |  |
| lar-rct-70-35-curie | lar-preservation | RCT 70 / 63 / 56 Gy en 35 fx (SIB) + cisplatine | rte\_normo | pratique\_institutionnelle | rtog9111 ; rtog9111-lt ; mach-nc ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 70-63-56 Gy » |
| lar-induction-rt | lar-preservation | TPF × 3 puis RT 70 / 63 / 56 Gy en 35 fx chez les répondeurs | rte\_normo | essai\_phase3 | gortec2000-01 ; rtog9111-lt ; curie-vads-2021 | Institut Curie 2021 pour la RT |
| lar-6996-33-service | lar-preservation | RCT 69,96 / 59,4 / 54,12 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | rtog0225 ; rtog9111 | Tableur du service « ORL 69,96-59,4-54,12 Gy » |
| lar-70-30-igr | lar-preservation | RT 70 / 60 / 54 Gy en 30 fx (SIB) | rte\_hypo | pratique\_institutionnelle | igr-orl-rcmi | Gustave Roussy, RCMI des cancers de la tête et du cou (2017) |
| lar-postop-66-curie | lar-post-op | RT post-opératoire 66 / 59,4 / 54 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 66-59,4-54,12 Gy » |
| lar-postop-66-54-service | lar-post-op | RT post-opératoire 66 / 54 Gy en 33 fx (fiche du service) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » |
| lar-postop-60-54-service | lar-post-op | RT post-opératoire 60 / 54 Gy en 30 fx (risque intermédiaire) | rte\_normo | pratique\_institutionnelle | rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » ; tableur du service « ORL 60-54 Gy » |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lar-t1-5625-25 | PTV | 56.25 | 25 | 2.25 | seul | 5 fx/sem (5 semaines) | Contrôle local à 5 ans 92 % avec 2,25 Gy contre 77 % avec 2 Gy |
| lar-t1-63-28 | PTV | 63 | 28 | 2.25 | seul | 5 fx/sem (5,6 semaines) | Même essai |
| lar-t2-70-35 | PTV | 70 | 35 | 2 | seul | 5 fx/sem | Bras standard de RTOG 9512 |
| lar-rct-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Prescription sur la D50 du PTV |
| lar-rct-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| lar-rct-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |
| lar-induction-rt | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Après 3 cycles de TPF, si réponse ; sinon laryngectomie totale puis RT |
| lar-induction-rt | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel |
| lar-induction-rt | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |
| lar-6996-33-service | PTV69,96 | 69.96 | 33 | 2.12 | SIB | 5 fx/sem | Macroscopique |
| lar-6996-33-service | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Haut risque |
| lar-6996-33-service | PTV54,12 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Bas risque |
| lar-70-30-igr | PTV70 | 70 | 30 | 2.333 | SIB | 5 fx/sem (6 semaines) | Macroscopique |
| lar-70-30-igr | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Haut risque |
| lar-70-30-igr | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Risque intermédiaire |
| lar-postop-66-curie | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Seulement si R1 ou rupture capsulaire |
| lar-postop-66-curie | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Lit opératoire et niveaux N+ |
| lar-postop-66-curie | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Prophylaxie |
| lar-postop-66-54-service | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Marges positives ou rupture capsulaire |
| lar-postop-66-54-service | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Aires électives (écart E63) |
| lar-postop-60-54-service | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Facteurs intermédiaires |
| lar-postop-60-54-service | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Aires électives |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| lar-t1-5625-25 | RT conformationnelle ou IMRT, IGRT | Aucune | sim-orl-curie | vol-lar-precoce | ct-orl-curie |  |
| lar-t1-63-28 | RT conformationnelle ou IMRT, IGRT | Aucune | sim-orl-curie | vol-lar-precoce | ct-orl-curie |  |
| lar-t2-70-35 | RT conformationnelle ou IMRT, IGRT | Aucune | sim-orl-curie | vol-lar-precoce | ct-orl-curie |  |
| lar-rct-70-35-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| lar-induction-rt | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| lar-6996-33-service | Tomothérapie ou VMAT SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-orl-igr | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| lar-70-30-igr | RapidArc ou tomothérapie SIB | Voir Traitement systémique | sim-orl-igr | vol-orl-igr | ct-orl-igr | PTV70 : D95 % ≥ 66,5 Gy, D5 % ≤ 77 Gy ; PTV60 : D95 % ≥ 57 Gy ; PTV54 : D95 % ≥ 51,3 Gy |
| lar-postop-66-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV66 ∪ PTV59,4 : D2 % ≤ 107 % |
| lar-postop-66-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-lar-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| lar-postop-60-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Aucune | sim-orl-curie | vol-lar-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fiches `sim-orl-curie` et `sim-orl-igr` (onglet « ORL — Cavité buccale »). Patient laryngectomisé : retrait de la canule possible, pas obligatoire ; canule de trachéotomie gardée si le larynx est en place (Curie).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-lar-precoce | GTV | GTV | Tumeur glottique, d'après la laryngoscopie et le scanner | Toujours |  |
| vol-lar-precoce | CTV | CTV | GTV et marges de Grégoire 2018 (CTV-P1 et CTV-P2), adaptées au cartilage et à l'air ; sans aire ganglionnaire en T1–T2 N0 le plus souvent (fiche du service) | Toujours |  |
| vol-lar-precoce | PTV | PTV | CTV + 3 mm, moins 2 mm sous le contour externe (Curie) | Toujours | 3 mm |
| vol-lar-postop-service | CTV T66 | CTV | Lit tumoral chirurgical et zones de marge positive | Haut risque |  |
| vol-lar-postop-service | CTV T54 (sus-glotte) | CTV | Espace pré-épiglottique, espace paraglottique, base de langue inférieure, vallécules, replis ary-épiglottiques, hypopharynx supérieur | Sus-glotte |  |
| vol-lar-postop-service | CTV T54 (glotte) | CTV | Espace paraglottique, sous-glotte, cartilage thyroïde adjacent, cricoïde supérieur | Glotte |  |
| vol-lar-postop-service | CTV N66 | CTV | Loge ganglionnaire avec rupture capsulaire | Rupture capsulaire |  |
| vol-lar-postop-service | CTV N54 | CTV | Sus-glotte : II, III, IV, ± VI si extension inférieure, souvent bilatéral. Glotte : II, III, IV, ± VI si extension sous-glottique. Sous-glotte : VI et IV bilatéraux | Toujours |  |
| vol-lar-postop-service | CTV60 | CTV | Lit tumoral si facteurs intermédiaires, sans facteur de haut risque (écart E24) | Risque intermédiaire |  |
| vol-lar-postop-service | PTV66, PTV60, PTV54 | PTV | CTV + 5 mm | Toujours | 5 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-lar-precoce | oar-canal-medullaire ; oar-thyroide ; oar-constricteurs ; oar-oesophage ; oar-plexus-brachial-d ; oar-plexus-brachial-g | [Grégoire 2018, CTV-P](https://doi.org/10.1016/j.radonc.2017.10.016) |
| vol-lar-postop-service | oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-cavite-orale ; oar-moelle ; oar-thyroide ; oar-mandibule ; oar-tronc-cerebral ; oar-muscles-nuque ; oar-plexus-brachial-d ; oar-plexus-brachial-g | [Grégoire 2014](https://doi.org/10.1016/j.radonc.2013.10.010) ; [Lapeyre 2010, larynx et hypopharynx](<https://doi.org/10.1016/S1278-3218(10)70007-X>) |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| lar-preservation | Cisplatine concomitant à la RT | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | rtog9111 ; rtog9111-lt | Larynx intact à 2 ans 88 % contre 75 % (induction) et 70 % (RT seule) |
| lar-preservation | TPF d'induction × 3 (docétaxel, cisplatine, 5-FU), puis RT si réponse | TPF d'induction (docétaxel–cisplatine–5-FU) | gortec2000-01 | Préservation laryngée à 3 ans 70,3 % contre 57,5 % avec PF |
| lar-post-op | Cisplatine 100 mg/m² J1, J22 et J43 | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | eortc22931 ; rtog9501 ; bernier2005 | Si marges positives ou rupture capsulaire |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| lar-glotte-precoce | 2,25 Gy par fraction : meilleur contrôle local que 2 Gy (92 contre 77 % à 5 ans, Yamazaki 2006) |
| lar-t2-70-35 | L'hyperfractionnement (79,2 Gy / 66 fx, 2 fx/j) n'a pas amélioré significativement le contrôle local en T2 (RTOG 9512) ; T2a et T2b ont un pronostic différent |
| lar-preservation | À 10 ans, induction PF et RCT donnent la même survie sans laryngectomie ; la RCT contrôle mieux la tumeur et préserve plus souvent le larynx, mais les décès non liés au cancer sont plus fréquents (RTOG 91-11, Forastiere 2013) |
| larynx | Six fractions par semaine : voix préservée plus souvent (80 contre 68 %, DAHANCA 6 et 7) |
