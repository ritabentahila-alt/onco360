# ORL — Cavum

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `orl`, localisation `cavum`. Carcinomes du nasopharynx. Centrage commun : onglet « ORL — Cavité buccale ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| cav-localise | Cavum T1–T2, peu ou pas d'atteinte ganglionnaire | en\_place | RT exclusive en T1–T2 N0 (annexe Gustave Roussy) ; stade II : cisplatine hebdomadaire concomitant (Chen 2011) | 1 |
| cav-avance | Cavum localement évolué (stades III–IVA) | en\_place | Chimiothérapie d'induction (gemcitabine-cisplatine ou TPF) puis RCT au cisplatine (Zhang 2019 ; Sun 2016) | 2 |

## Schémas et prescriptions

Six schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| cav-loc-70-30-igr | cav-localise | RT 70 / 60 / 54 Gy en 30 fx (SIB), T1–T2 N0 | rte\_hypo | pratique\_institutionnelle | igr-orl-rcmi | Gustave Roussy, RCMI des cancers de la tête et du cou (2017), annexe 2 |
| cav-loc-70-35-curie | cav-localise | RT 70 / 63 / 56 Gy en 35 fx (SIB) ± cisplatine | rte\_normo | pratique\_institutionnelle | chen2011-npc ; curie-vads-2021 | Institut Curie 2021 |
| cav-av-70-35-curie | cav-avance | RCT 70 / 63 / 56 Gy en 35 fx (SIB) après induction | rte\_normo | pratique\_institutionnelle | zhang2019-gp ; sun2016-tpf ; int0099 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 70-63-56 Gy » |
| cav-av-6996-33 | cav-avance | RCT 69,96 / 59,4 / 54,12 Gy en 33 fx (SIB) après induction | rte\_normo | pratique\_institutionnelle | rtog0225 ; zhang2019-gp ; sun2016-tpf | Tableur du service « ORL 69,96-59,4-54,12 Gy » |
| cav-av-70-30-igr | cav-avance | RT 70 / 60 / 54 Gy en 30 fx (SIB) | rte\_hypo | pratique\_institutionnelle | igr-orl-rcmi | Gustave Roussy, RCMI des cancers de la tête et du cou (2017) |
| cav-loc-6996-33 | cav-localise | RT 69,96 / 59,4 / 54,12 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | rtog0225 | Tableur du service « ORL 69,96-59,4-54,12 Gy » |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cav-loc-70-30-igr | PTV70 | 70 | 30 | 2.333 | SIB | 5 fx/sem (6 semaines) | GTV + 5 mm (10 mm si forme sous-muqueuse mal limitée) |
| cav-loc-70-30-igr | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Cavum entier, base du crâne et aires de drainage préférentiel |
| cav-loc-70-30-igr | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Autres aires N0 |
| cav-loc-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Prescription sur la D50 du PTV |
| cav-loc-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| cav-loc-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |
| cav-av-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Avec cisplatine 100 mg/m² toutes les 3 semaines |
| cav-av-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| cav-av-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie bilatérale |
| cav-av-6996-33 | PTV69,96 | 69.96 | 33 | 2.12 | SIB | 5 fx/sem | RTOG 0225 : 70 Gy sur T et N+, 59,4 Gy sur l'infraclinique, 33 séances |
| cav-av-6996-33 | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Haut risque |
| cav-av-6996-33 | PTV54,12 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Bas risque |
| cav-av-70-30-igr | PTV70 | 70 | 30 | 2.333 | SIB | 5 fx/sem (6 semaines) | Macroscopique T et N |
| cav-av-70-30-igr | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Haut risque |
| cav-av-70-30-igr | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Risque intermédiaire |
| cav-loc-6996-33 | PTV69,96 | 69.96 | 33 | 2.12 | SIB | 5 fx/sem | Macroscopique |
| cav-loc-6996-33 | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Haut risque |
| cav-loc-6996-33 | PTV54,12 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Bas risque |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| cav-loc-70-30-igr | RapidArc ou tomothérapie SIB | Aucune | sim-orl-igr | vol-cav-igr | ct-orl-igr | PTV70 : D95 % ≥ 66,5 Gy, D5 % ≤ 77 Gy ; PTV60 : D95 % ≥ 57 Gy ; PTV54 : D95 % ≥ 51,3 Gy |
| cav-loc-70-35-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-cav-curie | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| cav-av-70-35-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-cav-curie | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| cav-av-6996-33 | Tomothérapie ou VMAT SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-cav-igr | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| cav-av-70-30-igr | RapidArc ou tomothérapie SIB | Voir Traitement systémique | sim-orl-igr | vol-cav-igr | ct-orl-igr | PTV70 : D95 % ≥ 66,5 Gy, D5 % ≤ 77 Gy ; PTV60 : D95 % ≥ 57 Gy ; PTV54 : D95 % ≥ 51,3 Gy |
| cav-loc-6996-33 | Tomothérapie ou VMAT SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-cav-igr | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Complément ou récidive du nasopharynx | Curiethérapie endocavitaire, selon GEC-ESTRO | Recommandations GEC-ESTRO 2009 et 2024 | Indications, techniques et doses par site dans les recommandations ; réirradiation traitée au lot E |

## Centrage

Fiches `sim-orl-curie` et `sim-orl-igr` (onglet « ORL — Cavité buccale »). Curie : template « ORL cavum/sinus » avec les OAR de la base du crâne. IRM et TEP-FDG fortement recommandées (Gustave Roussy).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-cav-curie | GTV\_T, GTV\_N | GTV | Comme `vol-orl-curie-en-place` (scanner injecté, IRM, TEP-FDG, endoscopie) | Toujours |  |
| vol-cav-curie | CTV70 | CTV | GTV + 5 mm, réduit à l'air et aux barrières non envahies | Toujours | 5 mm |
| vol-cav-curie | CTV63 | CTV | Optionnel : niveaux ganglionnaires N+ entiers | Option, si N+ |  |
| vol-cav-curie | CTV56 | CTV | CTV56\_T selon le guide international de Lee 2018 ; CTV56\_N selon Biau 2019 et Grégoire 2014 | Toujours |  |
| vol-cav-curie | PTV70, PTV63, PTV56 | PTV | CTV + 3 mm, moins 2 mm sous le contour externe | Toujours | 3 mm |
| vol-cav-curie | PRV | PRV | Canal médullaire, tronc cérébral, chiasma et nerfs optiques + 3 mm | Toujours | 3 mm |
| vol-cav-igr | CTV70 | CTV | GTV + 5 mm dans tous les plans, jusqu'à 10 mm pour les formes sous-muqueuses mal limitées | Toujours | 5 mm |
| vol-cav-igr | CTV60 | CTV | Cavum entier, base du crâne, moitié inférieure du sinus sphénoïdal, tiers à moitié antérieure du clivus, fosses ptérygo-maxillaires, rétropharyngés bilatéraux jusqu'au disque C2-C3, tiers postérieur des fosses nasales et des sinus maxillaires ; aires N0 de drainage préférentiel | Toujours |  |
| vol-cav-igr | CTV54 | CTV | Aires ganglionnaires N0 en dehors du drainage préférentiel | Toujours |  |
| vol-cav-igr | PTV | PTV | CTV + 5 mm, réductible au contact du tronc cérébral ou du chiasma | Toujours | 5 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-cav-curie | oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-cavite-orale ; oar-larynx ; oar-constricteurs ; oar-oesophage ; oar-canal-medullaire ; oar-tronc-cerebral ; oar-cervelet ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-oreille-interne-d ; oar-oreille-interne-g ; oar-thyroide ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-cristallin-d ; oar-cristallin-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-lobe-temporal-d ; oar-lobe-temporal-g ; oar-lobe-frontal ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-hypophyse | [Lee 2018, CTV du nasopharynx](https://doi.org/10.1016/j.radonc.2017.10.032) ; [Brouwer 2015](https://doi.org/10.1016/j.radonc.2015.07.041) |
| vol-cav-igr | oar-moelle ; oar-canal-medullaire ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-lobe-temporal-d ; oar-lobe-temporal-g ; oar-lobe-frontal ; oar-fosse-posterieure ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-hypophyse ; oar-cochlee-d ; oar-cochlee-g ; oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-cavite-orale ; oar-larynx ; oar-constricteurs ; oar-thyroide | [Lee 2018](https://doi.org/10.1016/j.radonc.2017.10.032) |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| cav-localise | Cisplatine 30 mg/m² par semaine pendant la RT | Cisplatine hebdomadaire 30 mg/m² concomitant (cavum) | chen2011-npc | Stade II : SG à 5 ans 94,5 contre 85,8 % |
| cav-avance | Gemcitabine 1 g/m² J1 et J8 + cisplatine 80 mg/m² J1, toutes les 3 semaines, 3 cycles | Gemcitabine–cisplatine d'induction (cavum) | zhang2019-gp | Survie sans récidive à 3 ans 85,3 contre 76,5 % ; SG 94,6 contre 90,3 % |
| cav-avance | Docétaxel 60 mg/m² J1 + cisplatine 60 mg/m² J1 + 5-FU 600 mg/m²/j J1–J5, toutes les 3 semaines, 3 cycles | TPF d'induction (cavum) | sun2016-tpf | Survie sans échec à 3 ans 80 contre 72 % |
| cav-avance | Cisplatine 100 mg/m² toutes les 3 semaines, 3 cycles pendant la RT | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | int0099 ; sun2016-tpf ; zhang2019-gp | Base de la RCT après induction |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| cav-avance | La chimiothérapie adjuvante cisplatine–5-FU après RCT n'améliore pas la survie sans échec (Chen 2012) |
| cavum | Priorités de dose et critères d'acceptation des plans : guide international de Lee 2019 |
| cavum | Cavum opéré (rare) : 66 Gy sur le lit haut risque, 60 Gy sur la base du crâne, 54 Gy sur les rétropharyngés et II–V bilatéraux (fiche du service) |
| cavum | Indication type de l'IMRT ; RTOG 0225 : contrôle locorégional 90 %, xérostomie de grade 2 à 1 an 13,5 % |
