# Gynéco — Col utérin

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations : col en place traité par radiochimiothérapie exclusive et curiethérapie, col opéré (radiothérapie adjuvante), palliatif. Région `gyneco`, localisation `col`. Le col opéré utilise les volumes post-opératoires définis dans l'onglet Endomètre (`vol-gyn-postop`).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| col-lacc | Col en place : radiochimiothérapie exclusive + curiethérapie | en\_place | FIGO 2018 IB3, IIA2, IIB à IVA, tout stade avec adénopathie pelvienne ou lombo-aortique (IIIC), stade précoce non opérable ; IVB limité aux adénopathies lombo-aortiques sous L1–L2 (EMBRACE) ; carcinome épidermoïde, adénocarcinome ou adénosquameux ; bilan IRM pelvienne + TEP-TDM | 1 |
| col-postop | Col opéré (hystérectomie radicale) : radiothérapie adjuvante | post\_op | Facteurs de Sedlis (au moins 2 parmi invasion stromale > 1/3, emboles lymphovasculaires, taille tumorale) → RT seule ; facteurs de Peters (ganglion envahi, marge atteinte, paramètre envahi) → radiochimiothérapie | 2 |
| col-pall | Palliatif pelvien (saignement, douleur) | palliatif | Patiente non éligible à un traitement curatif (stade ou état général) | 3 |

## Schémas et prescriptions

Sept schémas. Tous : statut = `valide`, date\_verif = 2026-10-23. Le traitement de référence associe 45 Gy en 25 fractions avec cisplatine hebdomadaire et une curiethérapie utéro-vaginale guidée par l'IRM ; la dose de curiethérapie est ajustée pour que le D90 du CTV-HR atteigne 90–95 Gy EQD2 (RTE incluse). Les quatre fractionnements de curiethérapie ci-dessous sont des variantes d'un même traitement, à choisir selon le débit disponible et le volume résiduel.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| col-rch-hdr-7x4 | col-lacc | RCT 45 Gy / 25 fx + curiethérapie HDR 4 × 7 Gy (EMBRACE II) | rte\_plus\_curie | recommandation | embrace2 ; embrace1 ; gec-estro-gyn1 ; gec-estro-gyn2 ; cccmac |  |
| col-rch-hdr-5x55 | col-lacc | RCT 45 Gy / 25 fx + curiethérapie HDR 5 × 5,5 Gy | rte\_plus\_curie | recommandation | abs-hdr-col ; cccmac |  |
| col-rch-hdr-5x6 | col-lacc | RCT 45 Gy / 25 fx + curiethérapie HDR 5 × 6 Gy | rte\_plus\_curie | recommandation | abs-hdr-col ; cccmac |  |
| col-rch-pdr-curie | col-lacc | RCT 45 Gy / 25 fx + curiethérapie PDR 15 Gy sur le CTV-IR | rte\_plus\_curie | pratique\_institutionnelle | embrace2 ; gec-estro-gyn2 ; cccmac | Institut Curie, protocole col et vagin 2021 |
| col-postop-45 | col-postop | Pelvis post-opératoire 45 Gy / 25 fx | rte\_normo | pratique\_institutionnelle | sedlis ; peters | Institut Curie, protocole endomètre et col post-opératoire 2021 |
| col-postop-45-vbt | col-postop | Pelvis 45 Gy / 25 fx + curiethérapie du fond vaginal 2 × 5 Gy | rte\_plus\_curie | pratique\_institutionnelle | sedlis ; peters | Institut Curie, protocole endomètre et col post-opératoire 2021 ; fiche du service |
| col-pall-rtog8502 | col-pall | Palliatif 3,7 Gy × 4 en 2 jours, jusqu'à 3 cycles (RTOG 85-02) | rte\_hypo | essai\_phase3 | rtog8502 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id` ; pour la curiethérapie PDR, `fractions` et `dose_fx_Gy` restent vides : la dose est délivrée en pulses et le calcul BED simple ne s'applique pas)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| col-rch-hdr-7x4 | PTV45 | 45 | 25 | 1.8 | SIB | 5 fx/sem | Avec cisplatine 40 mg/m² hebdomadaire |
| col-rch-hdr-7x4 | PTV\_N55 (adénopathies du petit bassin : iliaques internes, externes, obturatrices) | 55 | 25 | 2.2 | SIB | 5 fx/sem | Environ 56 Gy EQD2 + 3–4 Gy EQD2 apportés par la curiethérapie, soit environ 60 Gy EQD2 |
| col-rch-hdr-7x4 | PTV\_N57.5 (adénopathies hors petit bassin : iliaques communes, lombo-aortiques, inguinales) | 57.5 | 25 | 2.3 | SIB | 5 fx/sem | Environ 59 Gy EQD2 ; contribution de la curiethérapie négligeable |
| col-rch-hdr-7x4 | CTV-HR (curiethérapie HDR, dose au D90) | 28 | 4 | 7 | sequentiel | Semaines 6–7 | Dose nominale ; 45 Gy / 25 + 4 × 7 Gy au D90 ≈ 84 Gy EQD2₁₀ : ajuster la dose par fraction pour atteindre 90–95 Gy EQD2 |
| col-rch-hdr-5x55 | PTV45 | 45 | 25 | 1.8 | SIB | 5 fx/sem | Avec cisplatine 40 mg/m² hebdomadaire |
| col-rch-hdr-5x55 | PTV\_N55 (adénopathies du petit bassin) | 55 | 25 | 2.2 | SIB | 5 fx/sem | Si adénopathie |
| col-rch-hdr-5x55 | PTV\_N57.5 (adénopathies hors petit bassin) | 57.5 | 25 | 2.3 | SIB | 5 fx/sem | Si adénopathie |
| col-rch-hdr-5x55 | CTV-HR (curiethérapie HDR) | 27.5 | 5 | 5.5 | sequentiel | 2 fx/sem | Réponse complète ou résidu < 4 cm au moment de la curiethérapie ; total ≈ 80 Gy EQD2₁₀ |
| col-rch-hdr-5x6 | PTV45 | 45 | 25 | 1.8 | SIB | 5 fx/sem | Avec cisplatine 40 mg/m² hebdomadaire |
| col-rch-hdr-5x6 | PTV\_N55 (adénopathies du petit bassin) | 55 | 25 | 2.2 | SIB | 5 fx/sem | Si adénopathie |
| col-rch-hdr-5x6 | PTV\_N57.5 (adénopathies hors petit bassin) | 57.5 | 25 | 2.3 | SIB | 5 fx/sem | Si adénopathie |
| col-rch-hdr-5x6 | CTV-HR (curiethérapie HDR) | 30 | 5 | 6 | sequentiel | 2 fx/sem | Résidu > 4 cm ; total ≈ 84 Gy EQD2₁₀ |
| col-rch-pdr-curie | PTV45 | 45 | 25 | 1.8 | SIB | 5 fx/sem | Avec cisplatine 40 mg/m² hebdomadaire ; prescription à la dose médiane ou moyenne |
| col-rch-pdr-curie | PTV\_N55 (adénopathies ilio-obturatrices) | 55 | 25 | 2.2 | SIB | 5 fx/sem | Tient compte de la contribution de la curiethérapie aux ganglions pelviens |
| col-rch-pdr-curie | PTV\_N57.5 (adénopathies iliaques primitives et lombo-aortiques) | 57.5 | 25 | 2.3 | SIB | 5 fx/sem | Le service prescrit 60 Gy / 25 fx (2,4 Gy) aux adénopathies lombo-aortiques : environ 62 Gy EQD2, dans la fourchette 55–65 Gy EQD2 d'EMBRACE II |
| col-rch-pdr-curie | CTV-IR (curiethérapie PDR) | 15 |  |  | sequentiel | Débit pulsé | Objectif : EQD2 cumulé > 85 Gy au D90 du CTV-HR (α/β = 10, T½ = 1,5 h) |
| col-postop-45 | PTV\_45Gy | 45 | 25 | 1.8 | seul | 5 fx/sem | Cisplatine 40 mg/m² hebdomadaire si facteurs de Peters ; mode SIB si PTV\_N |
| col-postop-45 | PTV\_N60Gy (adénopathie macroscopique résiduelle) | 60 | 25 | 2.4 | SIB | 5 fx/sem | Uniquement si adénopathie visible |
| col-postop-45-vbt | PTV\_45Gy | 45 | 25 | 1.8 | seul | 5 fx/sem | Comme col-postop-45 |
| col-postop-45-vbt | Fond vaginal (curiethérapie HDR, prescription à 5 mm de la surface) | 10 | 2 | 5 | sequentiel | Après la RTE | 20 à 30 mm de vagin supérieur selon l'anatomie (fiche du service) |
| col-pall-rtog8502 | PTV (tumeur pelvienne symptomatique) | 14.8 | 4 | 3.7 | seul | 2 fx/jour pendant 2 jours | Un cycle ; répéter toutes les 2 à 4 semaines, 3 cycles au maximum (44,4 Gy en 12 fx) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas ; `contraintes_id` peut citer plusieurs jeux séparés par « ; » : jeu de RTE puis jeu de curiethérapie)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| col-rch-hdr-7x4 | VMAT ou IMRT, IGRT quotidienne (CBCT) avec recalage osseux ; curiethérapie IRM avec applicateur intracavitaire ± aiguilles interstitielles | Cisplatine 40 mg/m² hebdomadaire, voir « Traitement systémique associé » | sim-col | vol-col | ct-col-embrace2-rte ; ct-col-embrace2-curie | PTV45 : V95 % > 95 %, Dmax < 107 % ; ITV45 : Dmin > 95 % ; PTV\_N : D98 > 90 % ; CTV\_N : D98 > 100 % ; CTV-HR D90 90–95 Gy EQD2 |
| col-rch-hdr-5x55 | Comme col-rch-hdr-7x4 | Comme col-rch-hdr-7x4 | sim-col | vol-col | ct-col-embrace2-rte ; ct-col-abs-hdr | D90 ≥ 80 Gy EQD2 |
| col-rch-hdr-5x6 | Comme col-rch-hdr-7x4 | Comme col-rch-hdr-7x4 | sim-col | vol-col | ct-col-embrace2-rte ; ct-col-abs-hdr | D90 85–90 Gy EQD2 |
| col-rch-pdr-curie | VMAT, kV-CBCT quotidien avec recalage osseux ; curiethérapie PDR guidée par l'image | Cisplatine 40 mg/m² hebdomadaire | sim-col | vol-col | ct-gyn-curie-rte ; ct-col-embrace2-curie | PTV45 : D95 > 95 %, D2 < 107 % ; ITV45 : D98 > 95 % ; PTV\_N : D98 > 90 %, D2 < 107 % ; CTV\_N : D98 > 98 % |
| col-postop-45 | VMAT, kV-CBCT quotidien avec recalage osseux | Cisplatine 40 mg/m² hebdomadaire si facteurs de Peters | sim-gyn-postop | vol-gyn-postop | ct-gyn-curie-rte | PTV\_45 : D95 > 95 %, D2 < 107 % ; ITV\_T : D98 > 95 % |
| col-postop-45-vbt | Comme col-postop-45 ; cylindre vaginal HDR | Comme col-postop-45 | sim-gyn-postop | vol-gyn-postop | ct-gyn-curie-rte |  |
| col-pall-rtog8502 | RC3D ou VMAT | Aucune | sim-col | vol-col-pall |  |  |

## Curiethérapie

La curiethérapie utéro-vaginale guidée par l'image fait partie du traitement de tout col traité par radiochimiothérapie exclusive. Elle ne se remplace pas par un complément en radiothérapie externe : c'est la technique d'escalade de dose centro-pelvienne (Curie). Les quatre schémas sont dans les tableaux ci-dessus ; cette section donne ce que l'onglet « Curiethérapie » du module affiche en plus.

**Tableau Curiethérapie — indications** (affiché en tête de l'onglet Curiethérapie, filtre col)

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Tout col traité par radiochimiothérapie exclusive | Curiethérapie utéro-vaginale guidée par l'IRM après 4 à 5 semaines de RCT | Cohorte prospective multicentrique (EMBRACE-I : contrôle local 92 % à 5 ans) | Petite tumeur bien répondeuse : curiethérapie possible pendant la RTE pour raccourcir le traitement (EMBRACE II) |
| Résidu volumineux, extension paramétriale ou vaginale au moment de la curiethérapie | Applicateur intracavitaire + aiguilles interstitielles | Protocole EMBRACE II | Au moins 20 % des patientes en ont besoin ; les aiguilles portent environ 5 à 20 % du TRAK total |
| Choix du débit | HDR (4 × 7 Gy ou 5 × 5,5–6 Gy) ou PDR (15 Gy sur le CTV-IR, Curie) | Recommandations EMBRACE II et ABS 2012 ; pratique Institut Curie | Dose finale décidée sur le D90 du CTV-HR, pas sur le point A |
| Étalement | Fin de la curiethérapie avant le 50e jour (EMBRACE II), au plus tard le 55e (Curie) | Analyse rétrospective EMBRACE | Une semaine de plus équivaut à perdre environ 5 Gy sur le CTV-HR |
| Chimiothérapie et HDR | Pas de cisplatine le jour d'une fraction HDR | ABS 2012 (avis d'experts) | Donner la cure un jour de RTE |

**Volumes de curiethérapie (GEC-ESTRO, EMBRACE II) :** GTV-res = tumeur résiduelle visible en T2 au moment de la curiethérapie ; CTV-HR = GTV-res + totalité du col + extensions résiduelles (zones grises paramétriales ou vaginales) ; CTV-IR = CTV-HR + marge couvrant l'extension tumorale initiale (5 à 15 mm selon la réponse). Contourage sur l'IRM T2 avec applicateur en place (coupes para-axiales, vérifiées en sagittal et coronal), après examen gynécologique par le médecin qui contoure, avec le schéma clinique et l'IRM du diagnostic. Pas de marge PTV en curiethérapie ; une marge seulement le long de la sonde intra-utérine est admise pour les incertitudes de reconstruction.

**Objectifs de dose :** jeu `ct-col-embrace2-curie` (EQD2 cumulée RTE + curiethérapie, α/β = 10 pour les cibles, 3 pour les OAR, T½ = 1,5 h). Pour l'HDR ABS : jeu `ct-col-abs-hdr`. L'EQD2 se calcule fraction par fraction sur le D90 et les D2cm³ réels, puis s'ajoute à l'EQD2 de la RTE (45 Gy / 25 fx = 44,25 Gy EQD2₁₀). Le calcul BED / EQD2 du module le fait pour l'HDR.

**Désescalade de la dose vaginale (EMBRACE II, tableau 10.2) :** point recto-vaginal ICRU < 65 Gy EQD2 (priorité) ; rapport TRAK vaginal / TRAK total < 30–40 % ; points vaginaux latéraux à 5 mm < 85 Gy EQD2 ; isodose 140 % le plus possible dans l'applicateur.

**Mise en place :** applicateur sous anesthésie, tamponnement vaginal ; vessie : vidange puis instillation d'un volume fixe de sérum en HDR, sonde ouverte en PDR ; IRM (ou à défaut scanner) avec applicateur pour chaque implantation ; dosimétrie avant chaque fraction.

**PDR :** Curie prescrit 15 Gy sur le CTV-IR en débit pulsé (la durée et la dose des pulses ne sont pas précisées dans le protocole). Le calcul d'EQD2 utilise le modèle linéaire-quadratique à réparation incomplète (T½ = 1,5 h) : les tableurs IGR et ICM du service le font ; le module n'en propose pas, il affiche « calcul PDR : utiliser l'outil dédié ».

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-col | Décubitus dorsal | Cale genoux + cale pieds, immobilisation pelvienne | Rectum vide (Normacol la veille et le jour même ; diamètre antéro-postérieur ≤ 5 cm, sinon évacuer le gaz ou refaire un Normacol) ; vessie confortable : 2 à 3 verres d'eau dans l'heure qui précède | Injecté (temps vasculaire) sauf contre-indication ; coupes ≤ 3 mm ; de L2–L3 + 5 cm (pelvis) ou des coupoles + 5 cm (lombo-aortique) jusqu'aux ischions + 15 cm ; scanner vessie pleine + vessie vide utile pour un ITV individualisé | IRM pelvienne T2 axiale et sagittale de moins d'un mois, fusion sur le bassin osseux ; TEP-TDM si N+ | Fil plombé dans le fond vaginal (fiche du service) ; tatouages, tatouage supplémentaire en L2 si lombo-aortique |
| sim-col-curie | Décubitus dorsal, jambes en étriers pour la pose | Applicateur utéro-vaginal fixé par tamponnement vaginal | Anesthésie ; sonde urinaire (HDR : vidange puis volume fixe de sérum ; PDR : sonde ouverte) ; rectum vide | IRM T2 avec applicateur (ou scanner) à chaque implantation | IRM du diagnostic et schéma clinique initial disponibles au contourage | Reconstruction de l'applicateur sur l'IRM |

Pour tout centrage RTE, le module affiche aussi : « vérifier dès le début de la RTE que la curiethérapie est programmée, avec un étalement total ≤ 50 jours ».

## Contourage

Deux jeux de volumes : col en place (EMBRACE II, adapté par Curie et par la fiche du service) et palliatif. Le col opéré utilise `vol-gyn-postop` (onglet Endomètre). Les adénopathies sont contourées et numérotées une par une ; chaque niveau de dose a son nom (GTV\_N55, GTV\_N57.5).

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-col | GTV\_T | GTV | Tumeur primitive sur l'IRM T2 du diagnostic (GTV-T init) | Optionnel (aide au CTV) |  |
| vol-col | GTV\_N# | GTV | Chaque adénopathie pathologique (contour externe + extension extracapsulaire visible), contourée sur l'IRM, le TEP servant de guide ; une structure par ganglion, numérotée | Si adénopathie |  |
| vol-col | CTV\_HR | CTV | GTV\_T + reste du col non envahi (CTV-T HR init) | Toujours |  |
| vol-col | CTV\_LR | CTV | Col + utérus entier + paramètres bilatéraux (sans les aires ganglionnaires) + vagin : au moins le tiers supérieur si non envahi, sinon jusqu'à 2 cm sous la limite inférieure de l'atteinte ; trompes, mésorectum si envahis | Toujours |  |
| vol-col | ITV\_T | ITV | CTV\_LR + 10 mm en antéro-postérieur, 10 mm en cranio-caudal, 5 mm en latéral ; pas de marge vers le bas le long du vagin ; exclure muscles et os ; + 5 mm autour du corps utérin s'il est envahi ; ou ITV individualisé (fusion vessie pleine / vessie vide), minimum 5 mm en AP et CC | Toujours | 10 mm AP et CC, 5 mm latéral |
| vol-col | CTV\_E (faible risque) | CTV | « Petit pelvis » : iliaques internes, externes, obturatrices, présacrées ; vaisseaux + au moins 7 mm de tissu périvasculaire, lymphocèles et clips inclus. Fiche du service : présacrés = bande de 1 cm de S2 au promontoire | Tumeur ≤ 4 cm ET stade IA/IB1/IIA1 ET N0 ET carcinome épidermoïde ET pas d'envahissement utérin | 7 mm autour des vaisseaux |
| vol-col | CTV\_E (risque intermédiaire) | CTV | « Grand pelvis » : petit pelvis + iliaques communes jusqu'à la bifurcation aortique ; + inguinaux si atteinte du tiers inférieur du vagin ; + espace mésorectal si adénopathie mésorectale ou maladie locale avancée | Ni faible ni haut risque | 7 mm autour des vaisseaux |
| vol-col | CTV\_E (haut risque) | CTV | « Grand pelvis + lombo-aortique » : limite supérieure au minimum aux veines rénales (souvent L2), et au moins 3 cm au-dessus de l'adénopathie lombo-aortique la plus haute | Au moins 1 adénopathie iliaque commune ou plus haute, OU au moins 3 adénopathies pathologiques | 7 mm autour des vaisseaux |
| vol-col | CTV\_N# | CTV | GTV\_N# + 0 à 3 mm (EMBRACE II ; Curie : 3 mm), sans os ni muscle ; un CTV par ganglion, jamais regroupés | Si adénopathie | 0 à 3 mm |
| vol-col | ITV45 (CTV\_45Gy) | ITV | ITV\_T + CTV\_E (+ CTV\_N) | Toujours |  |
| vol-col | PTV45 | PTV | ITV45 + 5 mm isotrope, + tous les PTV\_N | Toujours | 5 mm |
| vol-col | PTV\_N# | PTV | CTV\_N# + 5 mm isotrope ; 10 mm localement si le PTV\_N sort du PTV45 | Si adénopathie | 5 mm |
| vol-col-pall | CTV | CTV | Tumeur pelvienne symptomatique (col, extensions) | Toujours |  |
| vol-col-pall | PTV | PTV | CTV + marge selon l'IGRT | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-col | oar-vessie ; oar-rectum (fiche : de la marge anale à la charnière recto-sigmoïdienne) ; oar-sigmoide ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-moelle-osseuse ; oar-vulve ; oar-vagin ; oar-help-ctvhr10 ; oar-corps ; oar-queue-cheval (si boost ganglionnaire) ; oar-plexus-sacre (si boost ganglionnaire) ; oar-rein-d (si lombo-aortique) ; oar-rein-g (si lombo-aortique) ; oar-foie (si lombo-aortique) ; oar-moelle (si lombo-aortique) ; oar-duodenum (si lombo-aortique au-dessus de L1) ; oar-ovaire-d (si transposition) ; oar-ovaire-g (si transposition) | Protocole EMBRACE II (annexes de contourage) ; Lim 2011 ; RTOG 2012, OAR du pelvis |
| vol-col-pall | oar-vessie ; oar-rectum ; oar-grele | RTOG 2012, OAR du pelvis |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | essai\_ids | note |
| --- | --- | --- | --- |
| Col en place (RCT) | Cisplatine 40 mg/m² hebdomadaire pendant la RTE (5 à 6 cures) | cccmac ; embrace1 | Méta-analyse : + 6 % de survie à 5 ans (HR 0,81) |
| Col en place à haut risque (IB2–IIB N+ ou III–IVA, FIGO 2014) | Pembrolizumab 200 mg toutes les 3 semaines × 5 pendant la RCT, puis 400 mg toutes les 6 semaines × 15 | keynote-a18 | SSP HR 0,70 ; survie globale améliorée à la 2e analyse intermédiaire |
| Col en place (option) | Induction carboplatine AUC 2 + paclitaxel 80 mg/m² hebdomadaires × 6, puis RCT | interlace | SSP à 5 ans 72 % vs 64 % ; SG 80 % vs 72 % ; plus de toxicité G3+ (59 % vs 48 %) |
| Col opéré, facteurs de Peters | Chimiothérapie concomitante à base de cisplatine (Peters : cisplatine 70 mg/m² + 5FU 1000 mg/m²/j × 4 j toutes les 3 semaines, 4 cures dont 2 pendant la RT ; Curie : cisplatine 40 mg/m² hebdomadaire) | peters | SG à 4 ans 81 % vs 71 % |
| Palliatif | Aucun | rtog8502 |  |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| col | Étalement total (RTE + curiethérapie) ≤ 50 jours (EMBRACE II), 55 jours au plus (Curie) ; une semaine de plus équivaut à environ 5 Gy de moins sur le CTV-HR |
| col | CBCT quotidien avec recalage sur le bassin osseux ; ne pas recaler sur l'utérus (on sortirait les ganglions) ; l'utérus doit rester dans l'ITV\_T, à défaut dans le PTV45 ; nouvelle simulation à discuter si les volumes sortent des PTV après 3 séances (Curie) |
| col | Irradiation lombo-aortique : image kV/kV quotidienne en plus du CBCT pour vérifier le rachis lombaire ; décalage > 5 mm entre pelvis et lombo-aortique = repositionner (Curie) |
| col | Help contour CTV-HR + 10 mm : Dmax < 103 % de 45 Gy, pour éviter les points chauds de RTE là où la curiethérapie délivre déjà une forte dose |
| col | Sous-dosage toléré de 10 % (40 Gy) dans l'utérus non envahi ; la curiethérapie y ajoute plus de 5 à 10 Gy (EMBRACE II) |
| col-lacc | Contourer toutes les adénopathies pathologiques, une par une (EMBRACE II). Curie ne contoure pas celles situées à moins de 1 cm du CTV-HR, couvertes par la curiethérapie |
| col-lacc | Dose ganglionnaire : 55 Gy dans le petit bassin (+ 3–4 Gy EQD2 de curiethérapie), 57,5 Gy hors petit bassin ; viser 55–65 Gy EQD2 au total. Contribution mesurée de la curiethérapie : environ 5 Gy EQD2 aux iliaques internes, externes et obturatrices, 2,5 Gy aux iliaques communes (Bacorro 2017) |
| col-lacc | Le service prescrit 60 Gy / 25 fx (2,4 Gy) aux adénopathies lombo-aortiques (tableur « GYNECO 45Gy + BOOST ») : EQD2 ≈ 62 Gy, dans la fourchette d'EMBRACE II ; Curie et EMBRACE II prescrivent 57,5 Gy |
| col-lacc | PTV\_N = CTV\_N + 5 mm. Le protocole Curie col écrit « GTV\_N + 5 mm » (coquille : le protocole Curie endomètre et EMBRACE II écrivent CTV\_N + 5 mm) ; la fiche du service fait CTV\_N = GTV\_N + 5 mm puis PTV\_N = CTV\_N sans marge (écart E28) |
| col-lacc | Vagin non envahi : D(PIBS − 2 cm) < 5 Gy en RTE (EMBRACE II) |
| col-postop | Indication de radiochimiothérapie si facteurs de Peters ; RT seule si facteurs de Sedlis sans facteur de Peters |
| col-pall-rtog8502 | Aucune toxicité tardive sous 30 Gy (moins de 3 cycles) ; 6 % de toxicité tardive grade 3+ au total ; repos de 2 ou 4 semaines équivalent |
