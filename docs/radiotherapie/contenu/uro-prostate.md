# Uro — Prostate

Mise à jour : Oct 22, 2026 · Statut de l'onglet : `v`alide

## Situations cliniques

Neuf situations couvrent la prostate : six sur prostate en place, une après prostatectomie, une récidive ganglionnaire, une métastatique. Région `uro`, localisation `prostate`.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| pro-ep-fav | En place — risque faible ou intermédiaire favorable (N0 M0) | en\_place | Faible : cT1–T2a et ISUP 1 et PSA < 10 ng/ml. Intermédiaire favorable : un seul facteur intermédiaire (cT2b–c ou ISUP 2–3 ou PSA 10–20), ISUP ≤ 2, moins de 50 % de biopsies systématiques positives | 1 |
| pro-ep-def-sans-pelvis | En place — intermédiaire défavorable ou haut risque, sans irradiation pelvienne (N0 M0) | en\_place | Intermédiaire défavorable : ≥ 2 facteurs intermédiaires et/ou ISUP 3 et/ou ≥ 50 % de biopsies positives. Haut risque : ≥ cT3a et/ou ISUP 4–5 et/ou PSA > 20. Risque ganglionnaire (Roach) < 15 % | 2 |
| pro-ep-def-pelvis | En place — intermédiaire défavorable ou haut risque, avec irradiation pelvienne (N0 M0) | en\_place | Mêmes groupes de risque, risque ganglionnaire (Roach) ≥ 15 % | 3 |
| pro-ep-n1 | En place — atteinte ganglionnaire pelvienne (cN1 M0) | en\_place | Adénopathie(s) pelvienne(s) visible(s) au scanner, à l'IRM ou au TEP | 4 |
| pro-ep-boost-curie | En place — boost par curiethérapie (N0 M0) | en\_place | Intermédiaire défavorable ou haut risque, N0, faisabilité technique confirmée par le curiethérapeute. Non applicable aux N1 | 5 |
| pro-ep-curie-mono | En place — curiethérapie exclusive (N0 M0) | en\_place | Risque faible et intermédiaire favorable sélectionné ; bonne fonction urinaire ; espérance de vie > 10 ans ; RTUP antérieure non contre-indiquée (délai 3–6 mois) | 6 |
| pro-postop | Après prostatectomie — rattrapage précoce ou adjuvant | rattrapage | Rattrapage : PSA détectable ou en hausse après prostatectomie (≥ 0,1–0,2 ng/ml), N0 ou Nx. Adjuvant : facteurs pathologiques de haut risque (pT3, R1), en discussion au cas par cas | 7 |
| pro-recidive-gg | Récidive ganglionnaire pelvienne (N1) ou lombo-aortique (M1a), tumeur primitive contrôlée | oligometastatique | Primitif déjà traité et contrôlé, adénopathie(s) en récidive, pas d'autre métastase | 8 |
| pro-m1-faible-volume | Métastatique d'emblée, faible volume — radiothérapie de la prostate | metastatique | Cancer métastatique hormonosensible de novo, faible volume métastatique, sous hormonothérapie | 9 |

Calcul du risque ganglionnaire (formule de Roach, utilisée par Curie) : risque ggR (%) = 2/3 × PSA + 10 × (score de Gleason − 6). Pour ISUP 2, Curie conseille d'affiner avec les nomogrammes de Kattan (MSKCC) ou de Briganti.

## Schémas et prescriptions

27 schémas, radiothérapie externe et curiethérapie confondues. Tous : `statut` = `valide`, `date_verif` = 2026-10-22. Les essais renvoient à l'onglet « Bibliothèque — Essais », les contraintes à « Bibliothèque — Contraintes ». Les schémas de type `curie_*` et `rte_plus_curie` apparaissent aussi dans l'onglet Curiethérapie du module.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| pro-fav-60-20 | pro-ep-fav | 60 Gy / 20 fx | rte\_hypo | essai\_phase3 | chhip ; profit | Institut Curie, prostate en place (2021) |
| pro-fav-70-28 | pro-ep-fav | 70 Gy / 28 fx (risque faible) | rte\_hypo | essai\_phase3 | rtog0415 |  |
| pro-fav-78-39 | pro-ep-fav | 78 Gy / 39 fx | rte\_normo | option | profit ; paceb | Institut Curie, prostate en place (2021) |
| pro-fav-sbrt-36 | pro-ep-fav | Stéréotaxie 36,25 Gy / 5 fx | sbrt | essai\_phase3 | paceb | Institut Curie, SBRT prostate (2021) |
| pro-fav-42-7 | pro-ep-fav | Ultra-hypofractionné 42,7 Gy / 7 fx | rte\_hypo | essai\_phase3 | hyportpc |  |
| pro-def-60-20 | pro-ep-def-sans-pelvis | 60 Gy / 20 fx (+ 1er cm des VS) | rte\_hypo | essai\_phase3 | chhip | Institut Curie, prostate en place (2021) |
| pro-def-78-39 | pro-ep-def-sans-pelvis | 78 Gy / 39 fx (80 Gy / 40 fx si T3b–T4) | rte\_normo | option |  | Institut Curie, prostate en place (2021) |
| pro-def-flame | pro-ep-def-sans-pelvis | 77 Gy / 35 fx + boost focal IRM jusqu'à 95 Gy | rte\_normo | essai\_phase3 | flame |  |
| pro-pelv-70-28 | pro-ep-def-pelvis | Prostate 70 Gy + VS 56 Gy + pelvis 50,4 Gy / 28 fx (SIB) | rte\_hypo | pratique\_institutionnelle |  | Institut Curie, prostate en place (2021) |
| pro-pelv-poprt | pro-ep-def-pelvis | Prostate 68 Gy + pelvis 50 Gy / 25 fx (SIB) | rte\_hypo | essai\_phase3 | poprt |  |
| pro-pelv-seq-78 | pro-ep-def-pelvis | Pelvis 50 Gy, VS 54 Gy, prostate 78 Gy (séquentiel) | rte\_normo | option |  | Institut Curie, prostate en place (2021) |
| pro-n1-70-28 | pro-ep-n1 | Prostate 70 + VS 56 + pelvis 50,4 + adénopathie 61,6 Gy / 28 fx (SIB) | rte\_hypo | pratique\_institutionnelle | stampede-abi | Institut Curie, prostate en place (2021) |
| pro-boost-ldr | pro-ep-boost-curie | RTE 46 Gy / 23 fx puis boost LDR iode 125 110 Gy | rte\_plus\_curie | recommandation | ascende ; gec-estro-prostate | Institut Curie, prostate en place (2021) |
| pro-boost-hdr-15 | pro-ep-boost-curie | RTE 46 Gy / 23 fx puis boost HDR 15 Gy × 1 | rte\_plus\_curie | recommandation | gec-estro-prostate |  |
| pro-boost-hdr-hoskin | pro-ep-boost-curie | RTE puis boost HDR 2 × 8,5 Gy en 24 h | rte\_plus\_curie | essai\_phase3 | hoskin-hdr |  |
| pro-ldr-145 | pro-ep-curie-mono | Curiethérapie LDR exclusive iode 125, 145 Gy | curie\_ldr | recommandation | gec-estro-prostate ; pr19 |  |
| pro-hdr-27-2 | pro-ep-curie-mono | Curiethérapie HDR exclusive 27 Gy / 2 fx | curie\_hdr | option | gec-estro-prostate ; morton-hdr |  |
| pro-postop-66-33 | pro-postop | Loge 66 Gy / 33 fx ± pelvis, adénopathie, nodule (SIB) | rte\_normo | pratique\_institutionnelle | getug-afu16 ; radicals-rt ; getug-afu17 | Institut Curie, rattrapage post-prostatectomie (2021) |
| pro-postop-52-20 | pro-postop | Loge 52,5 Gy / 20 fx | rte\_hypo | essai\_phase3 | radicals-rt |  |
| pro-postop-62-25 | pro-postop | Loge 62,5 Gy / 25 fx | rte\_hypo | essai\_phase3 | nrg-gu003 |  |
| pro-postop-spport | pro-postop | Pelvis 45 Gy / 25 fx puis loge 64,8–70,2 Gy (1,8 Gy/fx) + HT 4–6 mois | rte\_normo | essai\_phase3 | spport |  |
| pro-postop-service | pro-postop | Loge 66 Gy / 33 fx + pelvis 46 Gy / 23 fx (séquentiel) | rte\_normo | pratique\_institutionnelle |  | Fiche du service (Dr Bentahila, 2026) |
| pro-recid-46-23 | pro-recidive-gg | Pelvis 46 Gy + adénopathie 57,5 Gy / 23 fx (SIB) | rte\_normo | pratique\_institutionnelle |  | Institut Curie, prostate en place (2021) |
| pro-m1-55-20 | pro-m1-faible-volume | Prostate 55 Gy / 20 fx (quotidien) | rte\_hypo | essai\_phase3 | stampede-h |  |
| pro-m1-36-6 | pro-m1-faible-volume | Prostate 36 Gy / 6 fx (hebdomadaire) | rte\_hypo | essai\_phase3 | stampede-h |  |
| pro-m1-74-37 | pro-m1-faible-volume | Prostate 74 Gy / 37 fx (avec abiratérone) | rte\_normo | essai\_phase3 | peace1 |  |
| pro-pelv-60-54 | pro-ep-def-pelvis | Prostate 60 Gy + pelvis 54 Gy / 20 fx (SIB) | rte\_hypo | pratique\_institutionnelle | chhip ; profit | Pratique du service (Dr Bentahila) ; CHHiP et PROFIT valident la dose prostatique, pas l'irradiation pelvienne |

**Tableau Prescriptions** (rattaché au schéma par `schema_id` ; plusieurs lignes par schéma ; pour la curiethérapie LDR, `fractions` et `dose_fx_Gy` restent vides : un implant permanent)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pro-fav-60-20 | PTV\_PRO | 60 | 20 | 3 | seul | 5 fx/sem | Inclure le 1er cm des VS si lésion index IRM ou biopsies positives à la base |
| pro-fav-70-28 | PTV\_PRO | 70 | 28 | 2.5 | seul | 5 fx/sem |  |
| pro-fav-78-39 | PTV\_PRO | 78 | 39 | 2 | seul | 5 fx/sem | Curie : option si anticoagulants ; 76 Gy / 38 fx en rattrapage après Ablatherm |
| pro-fav-sbrt-36 | PTV | 36.25 | 5 | 7.25 | seul | 1 jour sur 2 (Curie) ; sur 1 ou 2 semaines (PACE-B) | Objectif CTV D95% ≥ 40 Gy (Curie) |
| pro-fav-42-7 | PTV\_PRO | 42.7 | 7 | 6.1 | seul | 3 fx/sem, 2,5 semaines | Sans hormonothérapie dans l'essai |
| pro-def-60-20 | PTV\_PRO | 60 | 20 | 3 | seul | 5 fx/sem | CTV\_PRO inclut le 1er cm des VS (VS non envahies, pas de pelvis) |
| pro-def-78-39 | PTV\_PRO | 78 | 39 | 2 | seul | 5 fx/sem | 80 Gy / 40 fx si T3b–T4 (Curie) |
| pro-def-flame | PTV\_PRO | 77 | 35 | 2.2 | SIB | 5 fx/sem |  |
| pro-def-flame | Boost lésion IRM | 95 | 35 | 2.71 | SIB | 5 fx/sem | Dose maximale visée (« jusqu'à ») ; contraintes OAR prioritaires sur le boost |
| pro-pelv-70-28 | PTV\_PRO | 70 | 28 | 2.5 | SIB | 5 fx/sem |  |
| pro-pelv-70-28 | PTV\_VS | 56 | 28 | 2 | SIB | 5 fx/sem | VS in toto |
| pro-pelv-70-28 | PTV\_PELV | 50.4 | 28 | 1.8 | SIB | 5 fx/sem |  |
| pro-pelv-poprt | PTV prostate | 68 | 25 | 2.72 | SIB | 5 fx/sem |  |
| pro-pelv-poprt | PTV pelvis | 50 | 25 | 2 | SIB | 5 fx/sem | Iliaques communes incluses |
| pro-pelv-seq-78 | PTV\_PELV | 50 | 25 | 2 | sequentiel | 5 fx/sem | Tableur du service : 46 Gy / 23 fx |
| pro-pelv-seq-78 | PTV\_VS | 54 | 27 | 2 | sequentiel | 5 fx/sem |  |
| pro-pelv-seq-78 | PTV\_PRO | 78 | 39 | 2 | sequentiel | 5 fx/sem | 80 Gy / 40 fx si T3b–T4 (Curie) |
| pro-n1-70-28 | PTV\_PRO | 70 | 28 | 2.5 | SIB | 5 fx/sem |  |
| pro-n1-70-28 | PTV\_VS | 56 | 28 | 2 | SIB | 5 fx/sem |  |
| pro-n1-70-28 | PTV\_PELV | 50.4 | 28 | 1.8 | SIB | 5 fx/sem | Limite supérieure ≥ 1 cm au-dessus de l'adénopathie |
| pro-n1-70-28 | PTV\_ADP | 61.6 | 28 | 2.2 | SIB | 5 fx/sem | Pas de boost si adénopathie < 5 mm ou disparue sous hormonothérapie (Curie) |
| pro-boost-ldr | PTV\_PRO + PTV\_VS + PTV\_PELV | 46 | 23 | 2 | sequentiel | 5 fx/sem | Pelvis selon l'indication ; ASCENDE-RT : pelvis 46 Gy + HT 12 mois |
| pro-boost-ldr | CTV prostate (implant) | 110 |  |  | sequentiel | implant permanent | GEC-ESTRO : 110 Gy plutôt que les 115 Gy d'ASCENDE-RT (risque de sténose urétrale) |
| pro-boost-hdr-15 | PTV RTE | 46 | 23 | 2 | sequentiel | 5 fx/sem | GEC-ESTRO : 45–50 Gy avant le boost |
| pro-boost-hdr-15 | CTV prostate (HDR) | 15 | 1 | 15 | sequentiel | 1 séance |  |
| pro-boost-hdr-hoskin | PTV RTE | 35.75 | 13 | 2.75 | sequentiel | 5 fx/sem | Dose du bras combiné reprise par GEC-ESTRO ACROP 2022 (35,7 Gy / 13 fx + 17 Gy / 2 fx) |
| pro-boost-hdr-hoskin | CTV prostate (HDR) | 17 | 2 | 8.5 | sequentiel | 2 fractions en 24 h |  |
| pro-ldr-145 | CTV prostate (implant) | 145 |  |  | seul | implant permanent | PR19 : 144 Gy |
| pro-hdr-27-2 | CTV prostate (HDR) | 27 | 2 | 13.5 | seul | 2 séances à 1 semaine d'intervalle | GEC-ESTRO : 26–27 Gy en 2 fx ; 19 Gy × 1 non recommandé |
| pro-postop-66-33 | PTV\_LOGE | 66 | 33 | 2 | SIB | 5 fx/sem |  |
| pro-postop-66-33 | PTV\_PELV | 54.45 | 33 | 1.65 | SIB | 5 fx/sem | Si irradiation pelvienne |
| pro-postop-66-33 | PTV\_ADP | 62.7 | 33 | 1.9 | SIB | 5 fx/sem | Si adénopathie visible |
| pro-postop-66-33 | PTV\_NODULE | 70.95 | 33 | 2.15 | SIB | 5 fx/sem | Si récidive locale visible à l'IRM |
| pro-postop-52-20 | PTV\_LOGE | 52.5 | 20 | 2.625 | seul | 5 fx/sem |  |
| pro-postop-62-25 | PTV\_LOGE | 62.5 | 25 | 2.5 | seul | 5 fx/sem |  |
| pro-postop-spport | PTV pelvis | 45 | 25 | 1.8 | sequentiel | 5 fx/sem |  |
| pro-postop-spport | PTV loge | 64.8 | 36 | 1.8 | sequentiel | 5 fx/sem | Total loge 64,8 à 70,2 Gy (36 à 39 fx) |
| pro-postop-service | PTV\_LOGE | 66 | 33 | 2 | sequentiel | 5 fx/sem |  |
| pro-postop-service | PTV\_PELV | 46 | 23 | 2 | sequentiel | 5 fx/sem |  |
| pro-recid-46-23 | PTV\_PELV | 46 | 23 | 2 | SIB | 5 fx/sem | ± lombo-aortique |
| pro-recid-46-23 | PTV\_ADP | 57.5 | 23 | 2.5 | SIB | 5 fx/sem |  |
| pro-m1-55-20 | PTV prostate | 55 | 20 | 2.75 | seul | 5 fx/sem |  |
| pro-m1-36-6 | PTV prostate | 36 | 6 | 6 | seul | 1 fx/sem |  |
| pro-m1-74-37 | PTV prostate | 74 | 37 | 2 | seul | 5 fx/sem |  |
| pro-pelv-60-54 | PTV\_PRO | 60 | 20 | 3 | SIB | 5 fx/sem |  |
| pro-pelv-60-54 | PTV\_PELV | 54 | 20 | 2.7 | SIB | 5 fx/sem | Pratique du service |

**Tableau Schémas — liens** (même `id` que le tableau Schémas ; `systemique` renvoie à la section « Hormonothérapie associée » ; une cellule `contraintes_id` vide = aucun jeu publié dans nos sources, afficher « Aucun jeu publié pour ce fractionnement »)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| pro-fav-60-20 | VMAT, IGRT kV-CBCT quotidien | Faible : aucune. Intermédiaire favorable : aucune, option 4–6 mois | sim-pro-ep | vol-pro-ep | ct-pro-3gy-20fx-curie | CTV D98% ≥ 58,8 Gy ; PTV D95% ≥ 57 Gy ; D1cc ≤ 107 % |
| pro-fav-70-28 | VMAT, IGRT kV-CBCT quotidien | Aucune (risque faible) | sim-pro-ep | vol-pro-ep | ct-pro-25gy-28fx-curie | CTV D98% ≥ 68,6 Gy ; PTV D95% ≥ 66,5 Gy ; D1cc ≤ 107 % |
| pro-fav-78-39 | VMAT, IGRT kV-CBCT quotidien | Comme pro-fav-60-20 | sim-pro-ep | vol-pro-ep | ct-pro-2gy-curie | CTV D98% ≥ 76,4 Gy ; PTV D95% ≥ 74,1 Gy ; D1cc ≤ 107 % ; option 76 Gy / 38 fx : CTV D98% ≥ 74,5 Gy, PTV D95% ≥ 72,2 Gy |
| pro-fav-sbrt-36 | VMAT, 3 grains d'or intraprostatiques, CBCT avant chaque arc ou kV-kV intrafraction | Aucune (sauf ISUP 3 retenu au cas par cas) | sim-pro-sbrt | vol-pro-sbrt | ct-pro-sbrt5-curie | PTV D98% ≥ 34,4 Gy ; PTV D95% ≥ 36,25 Gy ; PTV D2% ≤ 43,5 Gy ; Dmax ≤ 45,3 Gy (acceptable ≤ 48 Gy) ; CTV D99% ≥ 36,25 Gy ; CTV D95% ≥ 40 Gy (acceptable D90% ≥ 40 Gy) |
| pro-fav-42-7 | IMRT/VMAT, IGRT | Aucune (essai sans HT) | sim-pro-ep | vol-pro-ep |  |  |
| pro-def-60-20 | VMAT, IGRT kV-CBCT quotidien | Int. défavorable : 4–6 mois. Haut risque : 18 à 36 mois | sim-pro-ep | vol-pro-ep | ct-pro-3gy-20fx-curie | CTV D98% ≥ 58,8 Gy ; PTV D95% ≥ 57 Gy ; D1cc ≤ 107 % |
| pro-def-78-39 | VMAT, IGRT kV-CBCT quotidien | Comme pro-def-60-20 | sim-pro-ep | vol-pro-ep | ct-pro-2gy-curie | CTV D98% ≥ 76,4 Gy ; PTV D95% ≥ 74,1 Gy (80 Gy : 78,4 / 76 Gy) ; D1cc ≤ 107 % |
| pro-def-flame | IMRT/VMAT, IRM multiparamétrique pour définir la lésion, IGRT | Selon le groupe de risque | sim-pro-ep | vol-pro-ep |  |  |
| pro-pelv-70-28 | VMAT, IGRT kV-CBCT quotidien centré sur PTV\_PRO, contrôle visuel PTV\_PELV | Int. défavorable : 4–6 mois. Haut risque : 18 à 36 mois ; très haut risque : HT 3 ans + abiratérone 2 ans | sim-pro-ep | vol-pro-ep | ct-pro-25gy-28fx-curie | PRO : CTV D98% ≥ 68,6 / PTV D95% ≥ 66,5 Gy ; VS : 54,9 / 53,2 Gy ; PELV : 49,4 / 47,9 Gy ; D1cc ≤ 107 % |
| pro-pelv-poprt | IMRT, IGRT | HT ≥ 2 ans (essai) | sim-pro-ep | vol-pro-ep |  |  |
| pro-pelv-seq-78 | VMAT, IGRT kV-CBCT quotidien | Comme pro-pelv-70-28 | sim-pro-ep | vol-pro-ep | ct-pro-2gy-curie | PRO 78 : 76,4 / 74,1 Gy ; VS 54 : 52,9 / 51,3 Gy ; PELV 50 : 49 / 47,5 Gy ; D1cc ≤ 107 % |
| pro-n1-70-28 | VMAT, IGRT kV-CBCT quotidien | HT 24–36 mois (Curie) ; avec abiratérone : HT 3 ans + abiratérone 2 ans (STAMPEDE) | sim-pro-ep | vol-pro-ep | ct-pro-25gy-28fx-curie | PRO 68,6 / 66,5 ; VS 54,9 / 53,2 ; PELV 49,4 / 47,9 ; ADP : CTV D98% ≥ 60,4 / PTV D95% ≥ 58,5 Gy |
| pro-boost-ldr | RTE VMAT puis implant permanent iode 125 sous échographie endorectale | Même réflexion que sans boost (ASCENDE-RT : 12 mois) | sim-pro-ep | vol-pro-curie |  | RTE : CTV\_46 D98% ≥ 45,1 / PTV\_46 D95% ≥ 43,7 Gy |
| pro-boost-hdr-15 | RTE VMAT puis implant temporaire HDR (iridium 192) | Même réflexion que sans boost | sim-pro-ep | vol-pro-curie | ct-curie-hdr15-gec | CTV V100 > 95 % ; D90 > 15 Gy ; V150 ≤ 40 % |
| pro-boost-hdr-hoskin | RTE puis implant temporaire HDR | Selon le groupe de risque | sim-pro-ep | vol-pro-curie |  |  |
| pro-ldr-145 | Implant permanent iode 125 sous échographie endorectale ; dosimétrie scanner post-implant (J1, J2 ou 2–6 semaines, coupes ≤ 3 mm) | Aucune | sim-pro-curie | vol-pro-curie | ct-curie-ldr-gec | CTV V100 ≥ 95 % ; D90 > 145 Gy ; V150 ≤ 60 % |
| pro-hdr-27-2 | Implant temporaire HDR iridium 192 | Aucune | sim-pro-curie | vol-pro-curie |  | CTV D90 ≥ 100 % ; V100 > 95 % ; V150 ≤ 40 % |
| pro-postop-66-33 | VMAT, IGRT kV-CBCT quotidien centré sur la loge | Voir « Hormonothérapie associée » (post-op) | sim-pro-loge | vol-pro-loge | ct-loge-66-33-curie | LOGE : CTV D98% ≥ 64,7 / PTV D95% ≥ 62,7 Gy ; PELV : 53,4 / 51,7 ; ADP : 61,4 / 59,6 ; NODULE : 69,5 / 67,4 Gy ; D1cc ≤ 107 % |
| pro-postop-52-20 | IGRT | Selon risque | sim-pro-loge | vol-pro-loge |  |  |
| pro-postop-62-25 | IGRT | Selon risque | sim-pro-loge | vol-pro-loge |  |  |
| pro-postop-spport | IGRT | HT 4–6 mois | sim-pro-loge | vol-pro-loge |  |  |
| pro-postop-service | IGRT | Selon risque | sim-pro-loge | vol-pro-loge-service | ct-loge-66-33-curie |  |
| pro-recid-46-23 | VMAT, IGRT kV-CBCT quotidien centré sur PTV\_PELV | Selon contexte | sim-pro-recid | vol-pro-recid |  | PELV : CTV D98% ≥ 45,1 / PTV D95% ≥ 43,7 Gy ; ADP : 56,3 / 54,6 Gy |
| pro-m1-55-20 | IGRT | HT à vie ± traitement systémique | sim-pro-ep | vol-pro-ep |  |  |
| pro-m1-36-6 | IGRT | HT à vie ± traitement systémique | sim-pro-ep | vol-pro-ep |  |  |
| pro-m1-74-37 | IGRT | HT + abiratérone (PEACE-1) | sim-pro-ep | vol-pro-ep | ct-pro-2gy-curie |  |
| pro-pelv-60-54 | VMAT, IGRT kV-CBCT quotidien | Comme pro-pelv-70-28 | sim-pro-ep | vol-pro-ep |  | PRO : CTV D98% ≥ 58,8 Gy ; PTV D95% ≥ 57 Gy (Curie) |

## Curiethérapie prostate

La référence est la recommandation GEC-ESTRO ACROP 2022 : LDR exclusive 145 Gy, boost LDR 110 Gy, HDR exclusive 26–27 Gy en 2 fractions (schéma cité, mais pas encore de recommandation de prescription fondée sur les preuves), boost HDR 15 Gy en 1 fraction après 45–50 Gy. Ces quatre schémas sont dans les tableaux ci-dessus ; cette section donne ce que la fiche affiche en plus, dans l'onglet « Curiethérapie » du module.

**Tableau Curiethérapie — indications** (affiché en tête de l'onglet Curiethérapie, filtre prostate)

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Risque faible et intermédiaire favorable sélectionné | LDR ou HDR exclusive | LDR : grade B, niveau 2b ; HDR fractionnée : grade B, niveau 2a | Bonne fonction urinaire, espérance de vie > 10 ans, pas de métastase |
| Intermédiaire défavorable et haut risque | RTE 45–50 Gy + boost LDR ou HDR, avec hormonothérapie comme en RTE seule | Grade A, niveau 1a (boost) | Le boost améliore le contrôle du PSA par rapport à la RTE seule (ASCENDE-RT, Hoskin) |
| T3 | Boost envisageable en association avec la RTE | Grade B, niveau 2b | CTV étendu à l'extension extracapsulaire et/ou aux VS envahies |
| Volume prostatique > 60 ml | Possible si pas d'interférence de l'arche pubienne | Grade B, niveau 2b | Les anciennes limites étaient 50–60 ml |
| RTUP ou HoLEP antérieure | Pas une contre-indication | Grade B, niveau 2b | Délai habituel de 3 à 6 mois après le geste |
| Calcifications étendues | HDR préférée | Grade B, niveau 2b |  |
| Curiethérapie focale, boost focal, rattrapage après RT | Uniquement dans un essai | Grade C, niveau 4 | Séries de rattrapage : HDR 19 Gy / 1 fx à 42 Gy / 6 fx ; LDR 144–145 Gy |

**Définitions de volume (vol-pro-curie) :** CTV = capsule prostatique pour une tumeur intracapsulaire ; pour une tumeur localement avancée, CTV étendu à l'extension extracapsulaire et/ou aux VS envahies. GTV optionnel (boost focal, en essai). Marge PTV de 3 à 5 mm possible, limitée en arrière par le rectum et en haut par le col vésical (grade D, niveau 5).

**Contrôle qualité LDR :** dosimétrie scanner post-implant à J1, J2 ou entre 2 et 6 semaines, coupes ≤ 3 mm ; rapporter D90, V100, V150 de la prostate et D2cc du rectum.

**Équivalences à afficher pour la HDR :** les objectifs généraux sont donnés en EQD2 cumulée, calculée pour RTE 25 × 2 Gy + HDR 15 Gy (α/β = 1,5) ; ils ne s'appliquent pas tels quels à une HDR exclusive ni à un autre schéma de boost (CTV D90 > 121 Gy EQD2 ; rectum D2cc ≤ 75 Gy EQD2 ; urètre D10 ≤ 120 Gy et D30 ≤ 105 Gy EQD2) ; pour le schéma 15 Gy × 1, les valeurs physiques sont dans le jeu `ct-curie-hdr15-gec`. Le calcul BED / EQD2 du module permet de convertir.

**PDR :** utilisée pour la prostate dans peu de centres ; aucune dose recommandée dans GEC-ESTRO ACROP 2022, pas de schéma dans le référentiel.

## Centrage

Cinq fiches de centrage couvrent tous les schémas prostate ; la préparation rectum vide et vessie semi-pleine est commune à toutes, sauf la récidive ganglionnaire après irradiation de la prostate (vessie vide).

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-pro-ep | Décubitus dorsal | Mousse sous les genoux (immobilisation pelvienne standard) | Rectum vide : lavement Normacol la veille et le matin ; rectum ≤ 5 cm en antéro-postérieur en regard de la prostate, sinon évacuation des gaz par sonde et nouveau Normacol. Vessie semi-pleine « confortable » : uriner 30 à 45 min avant, puis boire 3 à 4 verres d'eau sans retourner aux toilettes | Avec et sans injection iodée, temps vasculaire. Limites : de L2-L3 + 5 cm (ou coupoles + 5 cm si lombo-aortique) jusqu'aux ischions − 5 cm ; vessie et rectum en totalité | IRM pelvienne pré-thérapeutique en fusion recommandée (T2 sagittal et axial oblique) |  |
| sim-pro-sbrt | Décubitus dorsal, bras relevés sur la poitrine | Matelas sous vide au niveau du bassin, cale-genoux, cale-pieds | Identique à sim-pro-ep (Normacol veille et matin, vessie semi-pleine) | Avec et sans injection, temps vésical (opacification de la vessie), coupes de 1 mm. Limites : pieds des sacro-iliaques + 5 cm jusqu'aux ischions − 5 cm | IRM prostatique de fusion après le scanner : T2, coupes axiales jointives de 2 mm, sans injection, même préparation | 3 grains d'or intraprostatiques posés ≥ 7 jours avant le scanner (fortement recommandés ; leur contre-indication n'interdit pas la SBRT) |
| sim-pro-loge | Décubitus dorsal | Mousse sous les genoux | Identique à sim-pro-ep | Avec et sans injection, temps vasculaire, mêmes limites que sim-pro-ep | IRM post-opératoire (± pré-opératoire) en fusion utile ; TEP si réalisé | Clips chirurgicaux de prostatectomie à identifier |
| sim-pro-recid | Décubitus dorsal | Mousse sous les genoux | Rectum vide ; **vessie vide** si la prostate ou la loge a déjà été irradiée | Avec et sans injection, temps vasculaire ; limite supérieure coupoles + 5 cm si lombo-aortique | Récupérer les anciens plans en DICOM pour fusion (ou DRR si DICOM indisponible) |  |
| sim-pro-curie | Selon technique d'implantation (bloc opératoire) |  |  | Planification par échographie endorectale ; LDR : scanner de dosimétrie post-implant (coupes ≤ 3 mm) | IRM utile pour le CTV |  |

Pour tout scanner injecté (Curie) : accord médical ; contre-indications = allergie (possible après prémédication si déjà bien tolérée) et clairance de la créatinine < 50 ml/min ; hydratation 1,5 à 2 litres après ; biguanides arrêtés 48 h après l'injection, reprise après contrôle de la clairance.

## Contourage

Cinq jeux de volumes. Les marges PTV de référence sont celles de Curie (5 mm prostate, 8 mm VS, pelvis, adénopathies et loge) ; ESTRO-ACROP demande au minimum 5 mm pour la loge. Variante de la fiche prostate du service : adénopathie + 5 mm, VS + 7 mm, pelvis + 7 mm (écart E03). Les OAR renvoient à l'onglet « Bibliothèque — OAR ».

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-pro-ep | CTV\_PRO | CTV | Prostate in toto + éventuelle extension extracapsulaire et/ou zone d'infiltration d'une VS. Ajouter le 1er cm des VS : risque faible ou intermédiaire favorable avec lésion index IRM ou biopsies positives à la base ; ou intermédiaire défavorable / haut risque sans VS envahie et sans pelvis (schéma 60 Gy / 20 fx) | Toujours (sauf récidive ganglionnaire isolée) |  |
| vol-pro-ep | CTV\_VS | CTV | Vésicules séminales in toto | Intermédiaire défavorable / haut risque avec VS envahie et/ou irradiation pelvienne (schéma 70 Gy / 28 fx). Pas de CTV\_VS si risque faible ou intermédiaire favorable, ni avec le schéma 60 Gy / 20 fx |  |
| vol-pro-ep | CTV\_PELV | CTV | Aires obturatrices, iliaques internes, externes, primitives et présacrées. Atlas NRG 2021 : début à la bifurcation aortique ou à la confluence cave (en général L4-L5) ; 5 à 7 mm autour des vaisseaux iliaques (jusqu'à 10 mm en avant si indiqué) ; exclure os, intestin, vessie, muscle ; couvrir l'espace entre psoas et vertèbre ; présacrés jusqu'au bas de S3 ; en arrière jusqu'au bord antérieur du piriforme ; iliaques externes arrêtées quand les vaisseaux passent en dehors du bord médial de l'acétabulum ; obturateurs 1 à 2 cm de large, arrêtés à la jonction VS-prostate | Risque ganglionnaire ≥ 15 % ou N1 ; si N1, limite supérieure ≥ 1 cm au-dessus de CTV\_ADP |  |
| vol-pro-ep | CTV\_ADP | CTV | Adénopathie(s) pelvienne(s) macroscopique(s) visible(s) au scanner, à l'IRM ou au TEP ; le volume après hormonothérapie sert au boost (NRG) | N1 ; pas de boost si < 5 mm ou disparue sous hormonothérapie (Curie) |  |
| vol-pro-ep | GTV\_IRM | GTV | Lésion visible à l'IRM multiparamétrique | Schéma pro-def-flame uniquement |  |
| vol-pro-ep | PTV\_PRO | PTV | CTV\_PRO + marge |  | 5 mm |
| vol-pro-ep | PTV\_VS | PTV | CTV\_VS + marge |  | 8 mm |
| vol-pro-ep | PTV\_PELV | PTV | CTV\_PELV + marge |  | 8 mm |
| vol-pro-ep | PTV\_ADP | PTV | CTV\_ADP + marge |  | 8 mm |
| vol-pro-sbrt | CTV | CTV | Prostate entière ± 1er cm des VS (risque faible avec lésion IRM ou biopsies à la base, ou risque intermédiaire). Jamais les VS entières ni les ganglions : si nécessaires, pas de SBRT. Fusion IRM T2 (les grains d'or aident) | Toujours |  |
| vol-pro-sbrt | PTV | PTV | CTV + marge |  | 5 mm ; 3 mm en arrière seulement si contrôle intrafraction ; 5 mm partout si les 3 grains ne sont pas correctement implantés |
| vol-pro-sbrt | Grain1, Grain2, Grain3 et Grain#+2mm | structure | Chaque grain d'or contouré et numéroté, plus une expansion 3D de 2 mm (sert au repositionnement) | Toujours si grains | 2 mm |
| vol-pro-loge | CTV\_LOGE | CTV | ESTRO-ACROP 2023. Inférieure : 8 à 12 mm sous l'anastomose vésico-urétrale (coupe sous la dernière coupe avec urine) ; si non visible, coupe juste au-dessus du bulbe pénien. Antérieure : en haut 1 à 2 cm de paroi vésicale postérieure (jusqu'à la paroi postérieure seulement si IGRT quotidienne reproductible) ; en bas bord postérieur du pubis sur la moitié aux deux tiers de la symphyse, sans monter au sommet. Postérieure : paroi antérieure du rectum (fascia mésorectal au niveau du lit des VS) ; inclure les angles antéro-latéraux du rectum. Latérale : bords internes des obturateurs internes, puis des releveurs en bas. Supérieure : pont de 3 à 5 mm ; base des VS (tiers inférieur, jusqu'aux canaux déférents sectionnés) sans envahissement des VS ; tout le lit des VS si pT3b. Inclure les clips de prostatectomie (ESTRO-ACROP) ; exclure ceux du curage (fiche du service) | Toujours |  |
| vol-pro-loge | CTV\_NODULE | CTV | Nodule de récidive visible à l'IRM (fusion) | Récidive locale visible |  |
| vol-pro-loge | CTV\_ADP | CTV | Adénopathie(s) visible(s) | N1 |  |
| vol-pro-loge | CTV\_PELV | CTV | Comme vol-pro-ep (atlas NRG 2021, scénario post-opératoire : obturateurs arrêtés vers la mi-hauteur de la loge) | Requis si pN+ ou N1 à la récidive ; pN0/Nx : décision au cas par cas (délai chirurgie-récidive, temps de doublement du PSA, PSA, imagerie, curage < 4 ganglions par côté, nomogrammes) |  |
| vol-pro-loge | PTV\_LOGE | PTV | CTV\_LOGE + marge |  | 8 mm (Curie) ; minimum 5 mm (ESTRO-ACROP) |
| vol-pro-loge | PTV\_NODULE | PTV | CTV\_NODULE + marge |  | 5 mm |
| vol-pro-loge | PTV\_ADP | PTV | CTV\_ADP + marge |  | 8 mm |
| vol-pro-loge | PTV\_PELV | PTV | CTV\_PELV + marge |  | 8 mm |
| vol-pro-recid | CTV\_PELV | CTV | Aires obturatrices, iliaques internes, externes, primitives, présacrées ± lombo-aortiques ; limite supérieure ≥ 1 cm au-dessus de CTV\_ADP ; limite inférieure évitant le recoupement avec l'irradiation antérieure | Toujours |  |
| vol-pro-recid | CTV\_ADP | CTV | Adénopathie(s) en récidive | Toujours |  |
| vol-pro-recid | PTV\_PELV | PTV | CTV\_PELV + marge |  | 8 mm |
| vol-pro-recid | PTV\_ADP | PTV | CTV\_ADP + marge |  | 8 mm |
| vol-pro-curie | CTV | CTV | Capsule prostatique (tumeur intracapsulaire) ; étendu à l'extension extracapsulaire et/ou aux VS envahies si localement avancé | Toujours |  |
| vol-pro-curie | GTV | GTV | Lésion cible d'un boost focal | En essai seulement |  |
| vol-pro-curie | PTV | PTV | CTV + marge, limitée en arrière (rectum) et en haut (col vésical) | Optionnel | 3 à 5 mm |

**Tableau Volumes** (suite — loge, fiche du service, utilisée par pro-postop-service)

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-pro-loge-service | CTV\_LOGE | CTV | Fiche du service. Inférieure : anastomose visible, contourer sur la coupe suivant la dernière coupe avec urine, puis 5 mm en dessous ; anastomose non visible, 0,5 à 1 cm au-dessus du bulbe. Supérieure : V1 = 2,5 à 3 cm les plus caudaux de la symphyse (≥ 2/3) ; V2 = 1,5 à 2 cm en arrière de la vessie au-dessus de V1 ; hauteur totale ≈ 3 cm. Latérale : bords médiaux des releveurs et des obturateurs internes. Antérieure : V1 bord postérieur de la symphyse ; V2 paroi postérieure de la vessie, extension latérale jusqu'à 1,5 cm. Postérieure : mur antérieur du rectum sans dépasser le fascia du mésorectum. Inclure les clips de prostatectomie, pas ceux du curage ; VS résiduelles si atteinte initiale ou anomalie à l'imagerie ; volume attendu 60 à 120 cm³ | Toujours |  |
| vol-pro-loge-service | CTV\_N | CTV | Obturateurs, iliaques internes, externes, primitives, présacrées | Selon la fiche : risque ganglionnaire ≥ 15 % (voir écart E11) |  |
| vol-pro-loge-service | PTV\_LOGE | PTV | CTV\_LOGE + marge, adaptée près du rectum, de la vessie et de la peau |  | 10 mm |
| vol-pro-loge-service | PTV\_N | PTV | CTV\_N + marge |  | 7 mm |

**Tableau Volumes — OAR et atlas** (suite)

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-pro-loge-service | oar-vessie ; oar-rectum ; oar-sigmoide ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-bulbe (facultatif) ; oar-rein-d (si lombo-aortique) ; oar-rein-g (si lombo-aortique) ; oar-foie (si lombo-aortique) ; oar-canal-medullaire (si lombo-aortique) | Fiche du service ; écarts E07 à E11 |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-pro-ep | oar-vessie ; oar-rectum ; oar-sigmoide ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-bulbe (facultatif) ; oar-rein-d (si lombo-aortique) ; oar-rein-g (si lombo-aortique) ; oar-foie (si lombo-aortique) ; oar-canal-medullaire (si lombo-aortique) | [NRG 2021, aires ganglionnaires prostate](https://doi.org/10.1016/j.ijrobp.2020.08.034) ; [RTOG 2012, OAR du pelvis](https://doi.org/10.1016/j.ijrobp.2012.01.023) |
| vol-pro-sbrt | oar-uretre (facultatif) ; oar-rectum ; oar-vessie ; oar-grele (sigmoïde inclus) ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-bulbe (facultatif) | [RTOG 2012, OAR du pelvis](https://doi.org/10.1016/j.ijrobp.2012.01.023) |
| vol-pro-loge | oar-vessie ; oar-rectum ; oar-sigmoide ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-bulbe (facultatif) ; oar-rein-d (si lombo-aortique) ; oar-rein-g (si lombo-aortique) ; oar-foie (si lombo-aortique) ; oar-canal-medullaire (si lombo-aortique) | [ESTRO-ACROP 2023, loge](https://doi.org/10.1016/j.ctro.2023.100638) ; [NRG 2021](https://doi.org/10.1016/j.ijrobp.2020.08.034) ; [RTOG 2012](https://doi.org/10.1016/j.ijrobp.2012.01.023) |
| vol-pro-recid | oar-vessie ; oar-rectum ; oar-sigmoide ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-bulbe (facultatif) ; oar-rein-d (si lombo-aortique) ; oar-rein-g (si lombo-aortique) ; oar-foie (si lombo-aortique) ; oar-canal-medullaire (si lombo-aortique) | [NRG 2021](https://doi.org/10.1016/j.ijrobp.2020.08.034) |
| vol-pro-curie | oar-uretre (urètre prostatique) ; oar-rectum (paroi antérieure) | [GEC-ESTRO ACROP 2022](https://doi.org/10.1016/j.radonc.2021.12.047) |

Visualisation des contours de référence : [eContour](https://econtour.org) (compte gratuit), conseillé par la fiche OAR du service.

## Hormonothérapie associée

La durée d'hormonothérapie dépend du groupe de risque, pas du fractionnement : de rien (risque faible) à 3 ans avec abiratérone (très haut risque ou N1). Ce tableau alimente le champ `systemique` et s'affiche dans l'onglet Prescription de chaque fiche.

**Tableau Hormonothérapie**

| situation | hormonotherapie | essai\_ids | note |
| --- | --- | --- | --- |
| Risque faible | Aucune | rtog9408 | Pas de bénéfice de l'HT courte chez les risques faibles (analyse post hoc) |
| Intermédiaire favorable | Aucune ; option 4–6 mois (Curie) | profit ; paceb | PROFIT et PACE-B interdisaient l'HT |
| Intermédiaire défavorable | 4–6 mois, débutée avant la RT | rtog9408 ; dart | RTOG 94-08 : 4 mois dont 2 avant la RT ; DART 01/05 : pas de bénéfice d'une HT longue chez les intermédiaires |
| Haut risque | 18 mois minimum, jusqu'à 24–36 mois selon le nombre de facteurs (Curie) ; si seul facteur = T3a IRM modéré non palpable : 4–6 mois (Curie) | pcs4 ; eortc22961 | 36 mois ne sont pas supérieurs à 18 mois (PCS IV) ; 6 mois inférieurs à 3 ans (EORTC 22961) |
| Très haut risque N0 (≥ 2 critères parmi T3–T4, Gleason 8–10, PSA ≥ 40) | HT 3 ans + abiratérone 1 000 mg/j + prednisolone 5 mg/j pendant 2 ans | stampede-abi | Survie sans métastase à 6 ans 82 % vs 69 % |
| N1 | HT longue 24–36 mois (Curie) ; avec abiratérone : HT 3 ans + abiratérone 2 ans (STAMPEDE) | stampede-abi | STAMPEDE incluait les N+ |
| Boost par curiethérapie | Même réflexion que sans boost | ascende ; gec-estro-prostate | ASCENDE-RT : 12 mois pour tous |
| Curiethérapie exclusive, SBRT | Aucune | paceb ; gec-estro-prostate | Sauf SBRT retenue pour ISUP 3 (Curie) |
| Post-prostatectomie, rattrapage | 6 mois (agoniste LH-RH) ; 24 mois si risque élevé et bonne tolérance attendue ; alternative : bicalutamide 150 mg/j 24 mois | getug-afu16 ; spport ; radicals-hd-6 ; radicals-hd-24 ; rtog9601 | GETUG-AFU 16 et SPPORT : bénéfice de 4–6 mois. RADICALS-HD : 6 mois sans bénéfice sur la survie sans métastase vs rien ; 24 mois meilleurs que 6 mois |
| Métastatique d'emblée | HT à vie + abiratérone ± docétaxel (selon oncologue) | peace1 ; stampede-h | PEACE-1 : la RT prostatique améliore la survie sans progression radiologique chez les faibles volumes sous abiratérone |

Si Onco360 contient déjà des protocoles d'hormonothérapie (Décapeptyl, abiratérone + Solupred) dans le menu Protocoles, afficher un lien vers eux depuis cette section.

## Points d'attention

Ces points alimentent le champ `points_attention[]` ; `cible` = un `schema_id`, un `situation_id` ou `prostate` (affiché sur toutes les fiches prostate).

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| prostate | IGRT quotidienne (kV-CBCT) : moins de toxicité rectale et meilleur intervalle sans progression biochimique (analyse post hoc) qu'un contrôle hebdomadaire ; critère principal non significatif et survie globale moins bonne dans le bras quotidien, sans lien établi avec la RT (essai de Crevoisier 2018) |
| prostate | Fusion IRM indispensable pour délimiter prostate et vésicules séminales |
| prostate | Patient obstructif : résection ou adénomectomie première possible ; délai de cicatrisation d'au moins 3 mois avant la RT (Curie) |
| prostate | Formules de Roach : effraction capsulaire (%) = 1,5 × PSA + 10 × (Gleason − 3) ; infiltration des VS (%) = PSA + 10 × (Gleason − 6) ; atteinte ganglionnaire (%) = 2/3 × PSA + 10 × (Gleason − 6) |
| pro-fav-60-20 | CHHiP : 57 Gy / 19 fx n'a pas démontré sa non-infériorité ; ne pas l'utiliser comme alternative à 60 Gy / 20 fx |
| prostate | HYPRO (64,6 Gy / 19 fx, 3 fx/sem) n'est pas supérieur au schéma standard : pas un standard |
| pro-fav-sbrt-36 | Toxicité génito-urinaire tardive de grade ≥ 2 plus fréquente qu'en RT standard (26,9 % vs 18,3 % à 5 ans, PACE-B) |
| pro-fav-sbrt-36 | Critères Curie : IPSS < 15, âge > 70 ans et espérance de vie > 10 ans ; ISUP 3 au cas par cas sans indication pelvienne ; pas de SBRT si le PTV touche l'intestin grêle |
| pro-fav-sbrt-36 | Rythme Curie : 1 jour sur 2 ; jusqu'à 3 jours consécutifs, jamais 4 ; au plus 4 séances par semaine ; interruption ≤ 2 jours (3 avec le week-end) |
| pro-fav-sbrt-36 | Repositionnement sur les 3 grains (chacun dans son volume Grain+2mm) ; décalage > 3 mm : nouveau CBCT ; rotation > 1° : appel de la physique |
| pro-def-flame | Le boost focal est limité par les contraintes des OAR, qui restent prioritaires |
| pro-boost-ldr | Toxicité urinaire de grade 3 plus fréquente après boost LDR (18,4 % vs 5,2 % à 5 ans, ASCENDE-RT) |
| pro-ep-curie-mono | HDR en fraction unique de 19 Gy : contrôle local insuffisant (essai Sunnybrook, PR19), non recommandé hors essai |
| pro-postop | Rattrapage précoce (PSA ≥ 0,1–0,2 ng/ml) préféré à la RT adjuvante systématique : contrôle comparable, moins de toxicité urinaire et érectile (RADICALS-RT, GETUG-AFU 17, RAVES) |
| pro-postop | Identifier les clips de prostatectomie (à inclure) et ceux du curage (à exclure du CTV\_LOGE) |
| pro-recidive-gg | Vessie vide au scanner et pendant le traitement si la prostate ou la loge a déjà été irradiée (Curie) |
| pro-m1-faible-volume | STAMPEDE : pas de bénéfice de survie chez les patients non sélectionnés ; l'indication vise le faible volume métastatique |
