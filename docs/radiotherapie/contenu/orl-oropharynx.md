# ORL — Oropharynx

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `orl`, localisation `oropharynx`. Carcinomes épidermoïdes, HPV positifs ou négatifs. Centrage et volumes communs : onglet « ORL — Cavité buccale ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| oro-en-place | Oropharynx non opéré : radiochimiothérapie | en\_place | Traitement de référence des formes localement évoluées, HPV positives comprises : cisplatine (RTOG 1016, De-ESCALaTE) | 1 |
| oro-post-op | Oropharynx opéré : RT adjuvante | post\_op | Haut risque : marges positives ou rupture capsulaire → 66 Gy et cisplatine. Intermédiaire : marges < 5 mm, T3–T4, engainements → 60 Gy (fiche du service) | 2 |
| oro-curie | Base de langue : complément par curiethérapie | en\_place | Option après RT externe, avec curage si N+ (Johansson 2011) | 3 |

## Schémas et prescriptions

Huit schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| oro-70-35-curie | oro-en-place | RCT 70 / 63 / 56 Gy en 35 fx (SIB) + cisplatine | rte\_normo | pratique\_institutionnelle | mach-nc ; mach-nc-2021 ; rtog1016 ; de-escalate ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 70-63-56 Gy » |
| oro-70-35-6fx | oro-en-place | RT accélérée 70 Gy / 35 fx en 6 semaines (6 fx/sem) + cisplatine | rte\_normo | essai\_phase3 | rtog1016 ; dahanca67 ; march |  |
| oro-6996-33-service | oro-en-place | RCT 69,96 / 59,4 / 54,12 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | rtog0225 ; mach-nc | Tableur du service « ORL 69,96-59,4-54,12 Gy » |
| oro-70-30-igr | oro-en-place | RT 70 / 60 / 54 Gy en 30 fx (SIB) | rte\_hypo | pratique\_institutionnelle | igr-orl-rcmi | Gustave Roussy, RCMI des cancers de la tête et du cou (2017) |
| oro-postop-66-curie | oro-post-op | RT post-opératoire 66 / 59,4 / 54 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 66-59,4-54,12 Gy » |
| oro-postop-66-54-service | oro-post-op | RT post-opératoire 66 / 54 Gy en 33 fx (fiche du service) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » |
| oro-postop-60-54-service | oro-post-op | RT post-opératoire 60 / 54 Gy en 30 fx (risque intermédiaire) | rte\_normo | pratique\_institutionnelle | rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » ; tableur du service « ORL 60-54 Gy » |
| oro-rte-pdr-bdl | oro-curie | RT externe 40,8 Gy (1,7 Gy × 2/j) puis complément PDR 35 Gy | rte\_plus\_curie | option | johansson2011 ; kovacs2017 ; guinot2024 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id` ; pour la curiethérapie PDR, `fractions` et `dose_fx_Gy` restent vides)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| oro-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Prescription sur la D50 du PTV |
| oro-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| oro-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |
| oro-70-35-6fx | PTV70 | 70 | 35 | 2 | seul | 6 fx/sem (2 fx un jour par semaine, à 6 h d'intervalle) | Schéma des deux bras de RTOG 1016 ; les volumes prophylactiques suivent le protocole du centre |
| oro-6996-33-service | PTV69,96 | 69.96 | 33 | 2.12 | SIB | 5 fx/sem | Niveaux de dose de RTOG 0225 (70 et 59,4 Gy en 33 séances) |
| oro-6996-33-service | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Haut risque infraclinique |
| oro-6996-33-service | PTV54,12 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Bas risque |
| oro-70-30-igr | PTV70 | 70 | 30 | 2.333 | SIB | 5 fx/sem (6 semaines) | Maladie macroscopique T et N |
| oro-70-30-igr | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Oropharynx et niveaux contigus (annexe Gustave Roussy) |
| oro-70-30-igr | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Niveaux N0 non contigus |
| oro-postop-66-curie | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Seulement si R1 ou rupture capsulaire |
| oro-postop-66-curie | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Lit opératoire et niveaux N+ |
| oro-postop-66-curie | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Prophylaxie |
| oro-postop-66-54-service | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Marges positives ou rupture capsulaire |
| oro-postop-66-54-service | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Aires II–IV ± Ib (écart E63 pour la dose par fraction) |
| oro-postop-60-54-service | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Marges < 5 mm, T3–T4, engainements |
| oro-postop-60-54-service | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Aires électives |
| oro-rte-pdr-bdl | PTV (tumeur et ganglions bilatéraux) | 40.8 | 24 | 1.7 | sequentiel | 2 fx/j (2,5 semaines) | RT hyperfractionnée accélérée |
| oro-rte-pdr-bdl | CTV (implant base de langue) | 35 |  |  | sequentiel | Débit pulsé | 2 à 3 semaines après la RT externe ; contrôle local 89 % à 5 ans |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| oro-70-35-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| oro-70-35-6fx | IMRT, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie ; ct-orl-igr |  |
| oro-6996-33-service | Tomothérapie ou VMAT SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-oro-igr | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| oro-70-30-igr | RapidArc ou tomothérapie SIB | Voir Traitement systémique | sim-orl-igr | vol-oro-igr | ct-orl-igr | PTV70 : D95 % ≥ 66,5 Gy, D5 % ≤ 77 Gy ; PTV60 : D95 % ≥ 57 Gy ; PTV54 : D95 % ≥ 51,3 Gy |
| oro-postop-66-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV66 ∪ PTV59,4 : D2 % ≤ 107 % |
| oro-postop-66-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-oro-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| oro-postop-60-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Aucune | sim-orl-curie | vol-oro-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| oro-rte-pdr-bdl | RT externe puis implant interstitiel PDR | Aucune | sim-orl-curie | vol-cb-curie | ct-orl-curie |  |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Base de langue, complément après RT externe | PDR 35 Gy après 40,8 Gy hyperfractionnés | Série uniforme de 83 patients (Johansson 2011) | Contrôle local 91 %, 89 % et 85 % à 2, 5 et 10 ans |
| Base de langue ou langue évoluée inopérable | HDR 18–24 Gy en 6–8 fx après 50–60 Gy | Série de 24 patients (Santos 2017) | Contrôle local 80 % à 4 ans |
| Amygdale, voile, base de langue | Selon GEC-ESTRO | Recommandations GEC-ESTRO 2009, 2017 et 2024 | Indications et doses par site dans les recommandations |

## Centrage

Fiches `sim-orl-curie` et `sim-orl-igr` (onglet « ORL — Cavité buccale »). IRM et TEP-FDG fortement recommandées pour l'oropharynx (Gustave Roussy).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-oro-igr | CTV70 | CTV | GTV T et N + 5 mm, jusqu'à 10 mm pour les formes sous-muqueuses mal limitées | Toujours | 5 mm |
| vol-oro-igr | CTV60 (T1–T2 N0) | CTV | Oropharynx homolatéral entier (paroi pharyngée latérale et postérieure sus-hyoïdiennes, sillon amygdaloglosse, hémi-voile, espace ptérygo-mandibulaire inférieur) ; controlatéral selon la proximité de la ligne médiane ; niveaux IIA et IIB homolatéraux | T1–T2 N0 |  |
| vol-oro-igr | CTV54 (T1–T2 N0) | CTV | Niveaux homolatéraux contigus au niveau II (III, IB, VA) ; niveau II controlatéral si extension vélaire | T1–T2 N0 |  |
| vol-oro-igr | CTV60 (T3 N2a) | CTV | Oropharynx bilatéral entier, voile et espace ptérygo-mandibulaire homolatéral ; niveaux N0 contigus au niveau envahi | T3 N+ (exemple de l'annexe) |  |
| vol-oro-igr | CTV54 (T3 N2a) | CTV | Niveaux N0 non contigus au niveau envahi ; niveau IB controlatéral épargnable | T3 N+ |  |
| vol-oro-igr | PTV | PTV | CTV + 5 mm | Toujours | 5 mm |
| vol-oro-postop-service | CTV T66 | CTV | Lit tumoral (amygdale, base de langue, voile), marges positives, trajet périnerveux | Haut risque |  |
| vol-oro-postop-service | CTV T54 | CTV | Base de langue profonde, vallécules, voile du palais, paroi pharyngée postérieure haute, espace parapharyngé homolatéral, base controlatérale si proche de la ligne médiane ; bilatéral si la ligne médiane est franchie | Toujours |  |
| vol-oro-postop-service | CTV N66 | CTV | Loge ganglionnaire avec rupture capsulaire | Rupture capsulaire |  |
| vol-oro-postop-service | CTV N54 | CTV | II, III, IV, rétropharyngés ; ± IB si extension antérieure ; ± V si N2–N3 volumineux ; bilatéral si médian | Toujours |  |
| vol-oro-postop-service | CTV60 | CTV | Lit tumoral si marges < 5 mm, T3–T4 ou engainement, sans facteur de haut risque (écart E24) | Risque intermédiaire |  |
| vol-oro-postop-service | PTV66, PTV60, PTV54 | PTV | CTV + 5 mm | Toujours | 5 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-oro-igr | oar-canal-medullaire ; oar-moelle ; oar-tronc-cerebral ; oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-cavite-orale ; oar-larynx ; oar-constricteurs ; oar-thyroide ; oar-cochlee-d ; oar-cochlee-g ; oar-muscles-nuque | [Grégoire 2014](https://doi.org/10.1016/j.radonc.2013.10.010) |
| vol-oro-postop-service | oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-cavite-orale ; oar-moelle ; oar-larynx ; oar-thyroide ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-tronc-cerebral ; oar-muscles-nuque ; oar-cochlee-d ; oar-cochlee-g ; oar-plexus-brachial-d ; oar-plexus-brachial-g | [Grégoire 2014](https://doi.org/10.1016/j.radonc.2013.10.010) |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| oro-en-place | Cisplatine 100 mg/m² J1 et J22 (RTOG 1016) ou J1, J22 et J43 | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | rtog1016 ; de-escalate ; mach-nc | Reste le standard en cas de HPV positif |
| oro-en-place | Cetuximab 400 mg/m² puis 250 mg/m² par semaine | Cetuximab concomitant à la RT | bonner2006 ; rtog1016 ; de-escalate | Seulement si contre-indication au cisplatine : inférieur au cisplatine en SG et SSP chez les HPV positifs |
| oro-post-op | Cisplatine 100 mg/m² J1, J22 et J43 | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | eortc22931 ; rtog9501 ; bernier2005 | Si marges positives ou rupture capsulaire |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| oro-en-place | HPV positif : le cetuximab donne une survie inférieure au cisplatine (RTOG 1016) sans réduire la toxicité (De-ESCALaTE) ; la désescalade reste du domaine des essais |
| oro-70-35-6fx | Six fractions par semaine : meilleur contrôle locorégional que cinq (DAHANCA 6 et 7) ; le fractionnement modifié améliore la survie (méta-analyse MARCH) |
| oropharynx | Épargne parotidienne (PARSPORT) et épargne des constricteurs (DARS : Dmoy ≤ 50 Gy hors volume haute dose) recommandées |
| oro-en-place | Volumes Curie : CTV70 élargissable en base de langue ; CTV56\_T compartimental (Lapeyre 2005) ; aires ganglionnaires selon Biau 2019 |
| oropharynx | Priorités OAR de Gustave Roussy pour l'oropharynx : parotide et glande sous-mandibulaire controlatérales, ATM |
