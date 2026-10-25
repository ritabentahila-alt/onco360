# ORL — Cavité buccale

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `orl`, localisation `cavite_buccale`. Carcinomes épidermoïdes. Cet onglet porte aussi les fiches communes à tous les onglets ORL : centrage (`sim-orl-curie`, `sim-orl-igr`) et volumes (`vol-orl-curie-en-place`, `vol-orl-curie-postop`, `vol-orl-igr`).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| cb-post-op | Cavité buccale opérée : RT adjuvante | post\_op | Haut risque : R1 ou rupture capsulaire → 66 Gy et cisplatine. Risque intermédiaire : marges < 5 mm, T3–T4, engainements, emboles → 60 Gy (fiche du service ; Bernier 2005) | 1 |
| cb-en-place | Cavité buccale non opérée : RT exclusive ± chimiothérapie | en\_place | Tumeur non résécable, contre-indication ou refus de la chirurgie | 2 |
| cb-curie | T1–T2 N0 de la langue mobile ou du plancher : curiethérapie interstitielle | en\_place | Curiethérapie exclusive avec curage ganglionnaire (44,6 % d'envahissement occulte au curage, Bourgier 2005), ou complément après RT externe | 3 |

## Schémas et prescriptions

Neuf schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| cb-postop-66-curie | cb-post-op | RT post-opératoire 66 / 59,4 / 54 Gy en 33 fx (SIB) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 66-59,4-54,12 Gy » |
| cb-postop-66-54-service | cb-post-op | RT post-opératoire 66 / 54 Gy en 33 fx, deux niveaux (fiche du service) | rte\_normo | pratique\_institutionnelle | eortc22931 ; rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » |
| cb-postop-60-54-service | cb-post-op | RT post-opératoire 60 / 54 Gy en 30 fx (risque intermédiaire) | rte\_normo | pratique\_institutionnelle | rtog9501 ; bernier2005 | Fiche du service « RT ORL post-opératoire » ; tableur du service « ORL 60-54 Gy » |
| cb-70-35-curie | cb-en-place | RT exclusive 70 / 63 / 56 Gy en 35 fx (SIB) ± chimiothérapie | rte\_normo | pratique\_institutionnelle | mach-nc ; mach-nc-2021 ; bonner2006 ; curie-vads-2021 | Institut Curie 2021 ; tableur du service « ORL 70-63-56 Gy » |
| cb-6996-33-service | cb-en-place | RT exclusive 69,96 / 59,4 / 54,12 Gy en 33 fx (SIB) ± chimiothérapie | rte\_normo | pratique\_institutionnelle | rtog0225 ; mach-nc | Tableur du service « ORL 69,96-59,4-54,12 Gy » |
| cb-70-30-igr | cb-en-place | RT exclusive 70 / 60 / 54 Gy en 30 fx (SIB) | rte\_hypo | pratique\_institutionnelle | igr-orl-rcmi | Gustave Roussy, RCMI des cancers de la tête et du cou (2017) |
| cb-pdr-56 | cb-curie | Curiethérapie PDR exclusive, 56 Gy (pulses de 0,4 à 0,7 Gy/h) | curie\_pdr | option | strnad2005-pdr ; kovacs2017 ; guinot2024 |  |
| cb-hdr-54-18 | cb-curie | Curiethérapie HDR exclusive, 18 × 3 Gy (2 fx/j) | curie\_hdr | option | tucek2011 ; guinot2010 ; guinot2024 |  |
| cb-rte-hdr-boost | cb-curie | RT externe 50 Gy / 25 fx puis complément HDR 18 Gy en 6 fx | rte\_plus\_curie | option | guinot2010 ; santos2017 ; guinot2024 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id` ; pour la curiethérapie PDR, `fractions` et `dose_fx_Gy` restent vides)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cb-postop-66-curie | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | Seulement si R1 ou rupture capsulaire ; prescription sur la D50 ou la Dmoy du PTV |
| cb-postop-66-curie | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Lit opératoire et niveaux N+ |
| cb-postop-66-curie | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Curie écrit « 54 Gy (1,64 Gy/séance) » |
| cb-postop-66-54-service | PTV66 | 66 | 33 | 2 | SIB | 5 fx/sem | CTV haut risque : R1 et/ou aires N+ R+ |
| cb-postop-66-54-service | PTV54 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | La fiche écrit « 54 Gy (5 × 1,6 Gy/semaine) » : corrigé à 1,64 Gy pour 33 fx (écart E63) |
| cb-postop-60-54-service | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | Lit opératoire, risque intermédiaire |
| cb-postop-60-54-service | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | Aires électives |
| cb-70-35-curie | PTV70 | 70 | 35 | 2 | SIB | 5 fx/sem | Prescription sur la D50 du PTV |
| cb-70-35-curie | PTV63 | 63 | 35 | 1.8 | SIB | 5 fx/sem | Optionnel : niveaux N+ |
| cb-70-35-curie | PTV56 | 56 | 35 | 1.6 | SIB | 5 fx/sem | Prophylaxie |
| cb-6996-33-service | PTV69,96 | 69.96 | 33 | 2.12 | SIB | 5 fx/sem | RTOG 0225 : 70 Gy sur le macroscopique et 59,4 Gy sur l'infraclinique en 33 séances |
| cb-6996-33-service | PTV59,4 | 59.4 | 33 | 1.8 | SIB | 5 fx/sem | Haut risque infraclinique |
| cb-6996-33-service | PTV54,12 | 54.12 | 33 | 1.64 | SIB | 5 fx/sem | Bas risque |
| cb-70-30-igr | PTV70 | 70 | 30 | 2.333 | SIB | 5 fx/sem (6 semaines) | Maladie macroscopique ; Gustave Roussy admet aussi 33 fx (2,12 Gy) |
| cb-70-30-igr | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | CTV haut risque |
| cb-70-30-igr | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem | CTV risque intermédiaire |
| cb-pdr-56 | CTV (implant) | 56 |  |  | seul | Débit pulsé | Dose de référence médiane des implants seuls, le plus souvent après chirurgie minimale non mutilante ; 1 pulse par heure, 24 h/24 |
| cb-hdr-54-18 | CTV (implant) | 54 | 18 | 3 | seul | 2 fx/j | Contrôle local 85 % ; protection mandibulaire recommandée |
| cb-rte-hdr-boost | PTV (tumeur et aires ganglionnaires) | 50 | 25 | 2 | sequentiel | 5 fx/sem | RT externe première |
| cb-rte-hdr-boost | CTV (implant) | 18 | 6 | 3 | sequentiel | 2 fx/j | Dose médiane ; 18 à 24 Gy en 6 à 8 fx après 50–60 Gy pour les tumeurs évoluées (Santos 2017) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| cb-postop-66-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-postop | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % (acceptable D95 % ≥ 98 %) ; PTV66 ∪ PTV59,4 : D2 % ≤ 107 % |
| cb-postop-66-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-cb-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % de la dose prescrite |
| cb-postop-60-54-service | VMAT ou tomothérapie SIB, IGRT quotidienne | Aucune | sim-orl-curie | vol-cb-postop-service | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| cb-70-35-curie | VMAT SIB, CBCT quotidien | Voir Traitement systémique | sim-orl-curie | vol-orl-curie-en-place | ct-orl-curie | PTV : D95 % ≥ 95 % ; CTV : D98 % ≥ 98 % ; PTV70 : D2 % ≤ 107 % |
| cb-6996-33-service | Tomothérapie ou VMAT SIB, IGRT quotidienne | Voir Traitement systémique | sim-orl-curie | vol-orl-igr | ct-orl-curie ; ct-orl-igr | Tableur du service : D95 ≈ 98 %, D98 ≈ 95 %, Dmax ≈ 105 % |
| cb-70-30-igr | RapidArc ou tomothérapie SIB | Voir Traitement systémique | sim-orl-igr | vol-orl-igr | ct-orl-igr | PTV70 : D95 % ≥ 66,5 Gy, D5 % ≤ 77 Gy ; PTV60 : D95 % ≥ 57 Gy, D5 % ≤ 66 Gy ; PTV54 : D95 % ≥ 51,3 Gy, D5 % ≤ 59,4 Gy |
| cb-pdr-56 | Implant interstitiel, planification 3D sur scanner | Aucune |  | vol-cb-curie |  |  |
| cb-hdr-54-18 | Implant interstitiel (tubes plastiques), planification 3D | Aucune |  | vol-cb-curie |  |  |
| cb-rte-hdr-boost | RT externe puis implant interstitiel | Aucune | sim-orl-curie | vol-cb-curie | ct-orl-curie |  |

## Curiethérapie

Le bas débit continu (fils d'iridium) a été remplacé par le débit pulsé et le haut débit (GEC-ESTRO 2024).

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| T1–T2 N0 de la langue mobile, exclusive | PDR (56 Gy) ou HDR (18 × 3 Gy) | Séries prospectives et rétrospectives ; recommandations GEC-ESTRO | Curage ganglionnaire associé |
| T2 N0 de la langue mobile, série historique | LDR, 60 Gy à 0,5 Gy/h | Série de 279 patients (Bourgier 2005) | Contrôle local 79,1 % à 2 ans ; technique abandonnée |
| Complément après RT externe | HDR 18 Gy (6 × 3 Gy) ou PDR 24 Gy | Séries (Guinot 2010 ; Strnad 2005) | Après 50 Gy de RT externe |
| Lit opératoire du plancher buccal | HDR seule, 22,7 Gy en moyenne | Série de 44 patients (Ferenczi 2021) | Contrôle local 89 % à 5 et 10 ans |

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-cb-curie | CTV (implant) | CTV | Tumeur et marge définies sur l'examen clinique et l'imagerie ; planification 3D sur scanner avec les vecteurs en place (GEC-ESTRO) | Toujours |  |

## Centrage

Fiches communes à tous les onglets ORL.

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-orl-curie | Décubitus dorsal, bras le long du corps, nuque dégagée, épaules basses, mousse sous les genoux, plan dur (matelas fin seulement si intolérance) | Masque thermoformé 5 points et têtière 5 points ; cale-tête adapté à la courbure cervicale ; tête en légère extension, axe conduits auditifs–commissures labiales perpendiculaire à la table | Retrait des prothèses dentaires amovibles ; canule de trachéotomie gardée si non laryngectomisé ; fil de plomb sur les cicatrices et bolus sur prescription ; ne pas avaler pendant l'acquisition | Sans puis avec injection iodée (60 ml en 40 s, pause 90 s, 40 ml en 27 s), mêmes limites, coupes jointives de 2 mm, du vertex à la carène, épaules incluses ; contre-indications : allergie, clairance < 50 ml/min ; biguanides arrêtés 48 h | Fusion rigide avec l'IRM et la TEP-FDG (validée par le médecin, région centrée sur la tumeur) ; imagerie de plus d'un mois renouvelable ; post-opératoire : fusion avec l'imagerie préopératoire | Point 0 : trois points sur le masque (un médian, deux latéraux) ; points tatoués sur la fourchette sternale et l'appendice xiphoïde |
| sim-orl-igr | Décubitus dorsal, tête en extension modérée (angle de Reid 20–30°) | Masque 5 points (tête, cou, haut du thorax et épaules) ; traction des épaules si le volume descend sous l'os hyoïde ; masque stéréotaxique 3 points possible pour les sinus | — | Sans contraste pour la dosimétrie, puis avec contraste (double injection, la première au moins 5 min avant) pour le contourage ; coupes de 2 ou 3 mm selon le système ; du vertex à la carène | IRM et TEP-FDG fortement recommandées pour le cavum, l'oropharynx et les récidives | Marqueurs cutanés selon la technique |

## Contourage

Volumes communs, puis volumes propres à la cavité buccale (fiche du service). Contourage des OAR : consensus Brouwer 2015.

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-orl-curie-en-place | GTV\_T | GTV | Tumeur primitive sur le scanner injecté (seule imagerie de référence), aidé de l'IRM, de la TEP-FDG et de la description clinique (panendoscopie, photos) | Toujours |  |
| vol-orl-curie-en-place | GTV\_N | GTV | Adénopathies métastatiques regroupées. Critères scanner : petit axe > 10 mm (6–8 mm si plus de 3 ganglions contigus), forme ronde, centre nécrotique, perte du hile graisseux, effraction capsulaire | Si N+ |  |
| vol-orl-curie-en-place | CTV70 | CTV | GTV\_T + 5 mm et GTV\_N + 5 mm, réduits à l'air et aux barrières non envahies (os, fascia, muscle) ; marge plus large possible en base de langue, ou autour d'une adénopathie avec effraction ou de plus de 3 cm | Toujours | 5 mm |
| vol-orl-curie-en-place | CTV63 | CTV | Optionnel : totalité des niveaux contenant une adénopathie (ex. : adénopathie sous-digastrique → niveau IIa) ; contenu dans CTV56 | Option, si N+ |  |
| vol-orl-curie-en-place | CTV56 | CTV | CTV56\_T : extension infraclinique selon l'approche compartimentale (Lapeyre 2005 et 2010 ; Lee 2018 pour le cavum) ; GTV + 5 mm + 5 mm (Grégoire 2018) = minimum. CTV56\_N : aires à risque (sélection Biau 2019, délinéation Grégoire 2014) ; muscle envahi inclus sur toute sa hauteur | Toujours |  |
| vol-orl-curie-en-place | PTV70, PTV63, PTV56 | PTV | CTV + 3 mm, moins 2 mm sous le contour externe (pas de retrait si la peau est envahie : bolus) | Toujours | 3 mm |
| vol-orl-curie-en-place | PRV | PRV | Canal médullaire, tronc cérébral, chiasma et nerfs optiques + 3 mm ; PRV du nerf optique homolatéral facultatif si la tumeur est au contact | Toujours | 3 mm |
| vol-orl-curie-postop | CTV66 | CTV | Seulement si R1 ou N+ R+. CTV66\_T : lit où la marge est ≤ 1 mm (5–10 mm d'épaisseur). CTV66\_N : lit des adénopathies en rupture capsulaire, emplacement du GTV\_N préopératoire + 5 mm ; contenu dans CTV59,4 | R1 ou rupture capsulaire | 5 mm |
| vol-orl-curie-postop | CTV59,4 | CTV | CTV59,4\_T : lit opératoire, 10–15 mm (voire 20 mm) de tissu résiduel autour du GTV\_T préopératoire, sans l'air ; lambeau : 5–10 mm à la jonction avec les tissus natifs. CTV59,4\_N : niveaux N+ | Toujours |  |
| vol-orl-curie-postop | CTV54 | CTV | CTV54\_T : extension infraclinique au-delà du lit (approche compartimentale ; Piram 2019 et Frédéric-Moreau 2019 pour les glandes salivaires, Guillemin 2021 pour l'ethmoïde). CTV54\_N : aires au-delà des niveaux N+ selon le site, l'atteinte et le côté du curage ; extension sous-cutanée vers la cicatrice si rupture capsulaire | Toujours |  |
| vol-orl-curie-postop | PTV66, PTV59,4, PTV54 | PTV | CTV + 3 mm, moins 2 mm sous le contour externe | Toujours | 3 mm |
| vol-orl-curie-postop | PRV | PRV | Comme en place : canal médullaire, tronc cérébral, chiasma et nerfs optiques + 3 mm | Toujours | 3 mm |
| vol-orl-igr | GTV | GTV | Maladie macroscopique clinique, endoscopique et radiologique (imagerie fusionnée) ; adénopathie tumorale si plus de 1 cm de grand axe ou centre nécrotique | Toujours |  |
| vol-orl-igr | CTV70 | CTV | GTV + 5 mm en tous sens, sauf irradiation excessive d'une structure saine majeure ; jusqu'à 10 mm pour les formes sous-muqueuses mal limitées | Toujours | 5 mm |
| vol-orl-igr | CTV60 | CTV | Haut risque : zones, y compris ganglionnaires, où le risque d'extension microscopique dépasse environ 50 % | Toujours |  |
| vol-orl-igr | CTV54 | CTV | Risque intermédiaire : environ 10 à 50 % | Toujours |  |
| vol-orl-igr | PTV | PTV | CTV + 5 mm habituellement, réductible au contact du tronc cérébral ou du chiasma | Toujours | 5 mm |
| vol-orl-igr | PRV | PRV | Moelle + 5 mm, tronc cérébral + 3 mm, voies optiques + 2 mm ; peau (3 mm) contourée en tomothérapie et RapidArc | Toujours |  |
| vol-cb-postop-service | GTV | GTV | Seulement si résidu R2 ou reliquat visible : basculer vers un schéma de tumeur en place (70 Gy) | R2 |  |
| vol-cb-postop-service | CTV T66 | CTV | Lit tumoral chirurgical, marges positives ou < 1 mm, envahissement osseux, trajet périnerveux si engainement majeur | Haut risque |  |
| vol-cb-postop-service | CTV T54 | CTV | Langue mobile profonde, muscles intrinsèques adjacents, plancher buccal profond, génioglosse, bord mandibulaire interne, glande sublinguale, loge submandibulaire, gencive et trigone rétromolaire, espace masticateur antérieur, mandibule adjacente si proche ; barrières osseuses respectées sauf effraction | Toujours |  |
| vol-cb-postop-service | CTV N66 | CTV | Loge ganglionnaire avec rupture capsulaire, marge positive ou résidu | Rupture capsulaire |  |
| vol-cb-postop-service | CTV N54 | CTV | IA, IB, II, III ; ± IV si T3–T4 ; ± V si extension postérieure ; homolatéral si latéralisé, bilatéral si ligne médiane ; niveaux séparés | Toujours |  |
| vol-cb-postop-service | CTV60 | CTV | Lit tumoral quand le risque est intermédiaire (marges < 5 mm, T3–T4, engainement, emboles) sans facteur de haut risque (écart E24) | Risque intermédiaire |  |
| vol-cb-postop-service | PTV66, PTV60, PTV54 | PTV | CTV + 5 mm | Toujours | 5 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-orl-curie-en-place | oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-cavite-orale ; oar-levres ; oar-larynx ; oar-constricteurs ; oar-oesophage ; oar-canal-medullaire ; oar-tronc-cerebral ; oar-cervelet ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-oreille-interne-d ; oar-oreille-interne-g ; oar-plexus-brachial-d ; oar-plexus-brachial-g ; oar-thyroide | [Grégoire 2014, aires ganglionnaires](https://doi.org/10.1016/j.radonc.2013.10.010) ; [Grégoire 2018, CTV-P](https://doi.org/10.1016/j.radonc.2017.10.016) ; [Brouwer 2015, OAR](https://doi.org/10.1016/j.radonc.2015.07.041) |
| vol-orl-curie-postop | oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-cavite-orale ; oar-levres ; oar-larynx ; oar-constricteurs ; oar-oesophage ; oar-canal-medullaire ; oar-tronc-cerebral ; oar-cervelet ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-oreille-interne-d ; oar-oreille-interne-g ; oar-plexus-brachial-d ; oar-plexus-brachial-g ; oar-thyroide | [Grégoire 2014](https://doi.org/10.1016/j.radonc.2013.10.010) ; [Brouwer 2015](https://doi.org/10.1016/j.radonc.2015.07.041) |
| vol-orl-igr | oar-canal-medullaire ; oar-moelle ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-lobe-frontal ; oar-lobe-temporal-d ; oar-lobe-temporal-g ; oar-fosse-posterieure ; oar-cristallin-d ; oar-cristallin-g ; oar-oeil-d ; oar-oeil-g ; oar-hypophyse ; oar-cochlee-d ; oar-cochlee-g ; oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-levres ; oar-cavite-orale ; oar-larynx ; oar-constricteurs ; oar-thyroide ; oar-muscles-nuque | [Grégoire 2014](https://doi.org/10.1016/j.radonc.2013.10.010) ; [Brouwer 2015](https://doi.org/10.1016/j.radonc.2015.07.041) |
| vol-cb-postop-service | oar-parotide-d ; oar-parotide-g ; oar-glande-sous-max-d ; oar-glande-sous-max-g ; oar-constricteurs ; oar-moelle ; oar-larynx ; oar-thyroide ; oar-atm-d ; oar-atm-g ; oar-mandibule ; oar-tronc-cerebral ; oar-muscles-nuque ; oar-encephale ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-chiasma ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-plexus-brachial-d ; oar-plexus-brachial-g | [Grégoire 2014](https://doi.org/10.1016/j.radonc.2013.10.010) |
| vol-cb-curie | oar-mandibule | [GEC-ESTRO ACROP 2017](https://doi.org/10.1016/j.radonc.2016.10.008) |

## Traitement systémique associé

`protocole` = nom du protocole à relier dans la bibliothèque Protocoles (règle dans la spécification).

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| cb-post-op | Cisplatine 100 mg/m² J1, J22 et J43 de la RT | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | eortc22931 ; rtog9501 ; bernier2005 | Si R1 ou rupture capsulaire (fiche du service ; Bernier 2005) |
| cb-en-place | Cisplatine 100 mg/m² J1, J22 et J43 de la RT | Cisplatine 100 mg/m² toutes les 3 semaines, concomitant à la RT | mach-nc ; mach-nc-2021 | Chimiothérapie concomitante : HR de décès 0,81, + 6,5 % de survie à 5 ans ; bénéfice décroissant avec l'âge |
| cb-en-place | Carboplatine et 5-fluorouracil, 3 cycles de 4 jours pendant 70 Gy en 7 semaines | Carboplatine–5-FU concomitant (GORTEC 99-02) | gortec9902 | L'accélération de la RT ne remplace pas la chimiothérapie |
| cb-en-place | Cetuximab 400 mg/m² avant la RT puis 250 mg/m² par semaine | Cetuximab concomitant à la RT | bonner2006 | Si contre-indication au cisplatine ; SG améliorée par rapport à la RT seule (HR 0,74) |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| cb-post-op | Rupture capsulaire et marges atteintes sont les deux facteurs qui justifient le cisplatine concomitant (analyse EORTC 22931 et RTOG 9501, Bernier 2005) |
| cb-post-op | Résidu macroscopique (R2) : passer au schéma de tumeur en place, 70 Gy (fiche du service) |
| vol-cb-postop-service | La fiche du service mélange « CTV T54 » et « CTV T56 » et prescrit 60 Gy sans CTV60 défini : le référentiel retient CTV T54 et un CTV60 (écart E24) |
| cb-70-30-igr | Schéma Gustave Roussy à 2,33 Gy par fraction sur le macroscopique ; les essais EORTC 1219 et ARTFORCE utilisaient 70 Gy / 35 fx et 54,25 Gy (référentiel Gustave Roussy) |
| cb-curie | Le curage ganglionnaire est indispensable avec la curiethérapie exclusive : 44,6 % d'envahissement occulte (Bourgier 2005) |
| ct-orl-curie | Si un OAR chevauche un PTV, l'objectif s'applique à l'OAR moins le PTV (Curie) |
| cavite\_buccale | IMRT avec épargne parotidienne : moins de xérostomie (PARSPORT, Nutting 2011). Épargne des constricteurs (Dmoy ≤ 50 Gy hors volume haute dose) : meilleure déglutition (DARS, Nutting 2023) |
