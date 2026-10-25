# Gynéco — Vulve

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations : vulve opérée (radiothérapie adjuvante) et vulve localement avancée non résécable (radiochimiothérapie exclusive). Région `gyneco`, localisation `vulve`. Contourage selon le consensus international de Gaffney 2016, repris par le protocole Curie.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| vulve-postop | Vulve opérée : radiothérapie adjuvante | post\_op | Lit opératoire : marge proche (< 5 mm) ou atteinte (R1). Aires ganglionnaires : plus d'un ganglion envahi et/ou rupture capsulaire ; à discuter si une seule macrométastase après curage complet | 1 |
| vulve-excl | Vulve localement avancée non résécable : radiochimiothérapie exclusive | en\_place | T3–T4 non résécables par vulvectomie radicale, ou exérèse mutilante (anus, urètre, vessie) | 2 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| vulve-postop-45-56 | vulve-postop | Post-opératoire 45 Gy / 25 fx ± boost intégré 56 Gy | rte\_normo | pratique\_institutionnelle | gog37 ; gaffney-vulve | Institut Curie, protocole vulve 2021 |
| vulve-excl-curie | vulve-excl | RCT 45 Gy / 25 fx + adénopathies 60 Gy + boost tumoral ≥ 60 Gy EQD2 | rte\_plus\_curie | pratique\_institutionnelle | gaffney-vulve ; gog205 | Institut Curie, protocole vulve 2021 |
| vulve-gog205 | vulve-excl | RCT 57,6 Gy / 32 fx + cisplatine hebdomadaire (GOG 205) | rte\_normo | option | gog205 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id` ; dose vide = à définir pour atteindre l'objectif indiqué)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| vulve-postop-45-56 | PTV\_45Gy (vulve ± aires ganglionnaires) | 45 | 25 | 1.8 | SIB | 5 fx/sem | Curie : 45 à 50 Gy en fractionnement standard ; prescription à la dose médiane ou moyenne |
| vulve-postop-45-56 | PTV\_N56Gy (aires ganglionnaires initialement envahies) | 56 | 25 | 2.24 | SIB | 5 fx/sem | Boost à discuter |
| vulve-postop-45-56 | PTV\_T56Gy (lit opératoire en marge proche < 5 mm) | 56 | 25 | 2.24 | SIB | 5 fx/sem | Marge positive (R1) : discuter plutôt un boost en curiethérapie |
| vulve-excl-curie | PTV\_45Gy | 45 | 25 | 1.8 | SIB | 5 fx/sem | Avec cisplatine 40 mg/m² hebdomadaire |
| vulve-excl-curie | PTV\_N60Gy (adénopathie en place) | 60 | 25 | 2.4 | SIB | 5 fx/sem | Adénopathie : au moins 60 Gy EQD2 |
| vulve-excl-curie | PTV\_Tboost (tumeur) |  |  |  | sequentiel | SIB ou séquentiel | Objectif : dose totale ≥ 60 Gy EQD2 sur la tumeur, idéalement par curiethérapie |
| vulve-gog205 | PTV tumeur vulvaire | 57.6 | 32 | 1.8 | seul | 5 fx/sem | Puis exérèse du résidu, ou biopsie si réponse clinique complète ; prise en charge ganglionnaire standardisée mais hors objectif de l'essai (phase 2) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| vulve-postop-45-56 | VMAT, kV-CBCT quotidien avec recalage osseux | Cisplatine 40 mg/m² hebdomadaire possible | sim-vulve | vol-vulve | ct-gyn-curie-rte | PTV45 : D95 > 95 %, D2 < 107 % ; CTV\_T : D98 > 95 % ; PTV\_N : D98 > 90 %, D2 < 107 % ; CTV\_N : D98 > 98 % |
| vulve-excl-curie | VMAT, kV-CBCT quotidien ; curiethérapie interstitielle pour le boost si possible | Cisplatine 40 mg/m² hebdomadaire | sim-vulve | vol-vulve | ct-gyn-curie-rte | PTV\_Tboost : D95 > 95 %, D2 < 107 % |
| vulve-gog205 | IMRT ou RC3D | Cisplatine 40 mg/m² hebdomadaire | sim-vulve | vol-vulve |  |  |

Le jeu Curie est établi pour 45 Gy / 25 fx : il n'est pas lié au schéma 57,6 Gy / 32 fx.

## Curiethérapie

**Tableau Curiethérapie — indications** (affiché en tête de l'onglet Curiethérapie, filtre vulve)

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Traitement exclusif | Boost tumoral par curiethérapie interstitielle pour une dose totale ≥ 60 Gy EQD2 | Pratique Institut Curie | À défaut, boost externe intégré ou séquentiel |
| Post-opératoire, marge positive (R1) | Boost du lit opératoire en curiethérapie | Pratique Institut Curie | À discuter |
| Post-opératoire, sans indication ganglionnaire | Curiethérapie exclusive du lit opératoire, 60 Gy | Option du protocole Curie |  |

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-vulve | Décubitus dorsal, position « grenouille » si la patiente y parvient | Sinon cale genoux + cale pieds | Rectum vide (Normacol), vessie confortable ; consignes plus souples en post-opératoire sans atteinte vaginale (pas de volume centro-pelvien) | Injecté (temps vasculaire) sauf contre-indication ; de L2–L3 + 5 cm (pelvis) ou des coupoles + 5 cm (lombo-aortique) jusqu'aux ischions + 20 cm | IRM T2 axiale et sagittale de moins d'un mois, fusion sur la vulve ; TEP-TDM si N+, fusion sur le bassin osseux | Fils métalliques sur les cicatrices en post-opératoire |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-vulve | GTV\_T | GTV | Tumeur vulvaire (examen clinique + IRM). Fiche du service en post-opératoire : zone de marge insuffisante ou atteinte | Exclusif, ou résidu |  |
| vol-vulve | GTV\_N# | GTV | Adénopathie, une structure par ganglion | Si adénopathie |  |
| vol-vulve | CTV\_T (post-opératoire) | CTV | Vulve en totalité ; exclure les plis cutanés des cuisses et des fesses non envahis. Fiche du service : grandes et petites lèvres + tiers inférieur du vagin | Post-opératoire |  |
| vol-vulve | CTV\_T56Gy | CTV | Lit opératoire en marge proche | Marge < 5 mm |  |
| vol-vulve | CTV\_Tboost (exclusif) | CTV | Vulve en totalité ; au moins 1 cm au-delà du GTV s'il dépasse la vulve ; 1 à 3 cm de vagin non atteint ; GTV + au moins 2 cm sur le canal anal, le rectum, la vessie ou l'urètre envahis ; lésion clitoridienne : ligament suspenseur du clitoris ; exclure les plis cutanés non envahis | Exclusif |  |
| vol-vulve | CTV\_E | CTV | Aire inguinale homolatérale toujours ; bilatérale sauf tumeur < 2 cm bien latéralisée (au cas par cas) ; N0 : iliaques jusqu'à la bifurcation iliaque commune ; ganglions pelviens suspects : limite supérieure adaptée. Lésion clitoridienne : drainage iliaque direct possible. Fiche du service : inguinaux, iliaques externes, ilio-obturateurs + 5 mm, sans os ni tube digestif | Exclusif ; post-opératoire si indication ganglionnaire |  |
| vol-vulve | CTV\_N# | CTV | GTV\_N# + 3 mm ; CTV\_N56Gy = aire ganglionnaire initialement envahie en post-opératoire | Si adénopathie | 3 mm |
| vol-vulve | CTV\_45Gy | ITV | CTV\_E + CTV\_T | Toujours |  |
| vol-vulve | PTV\_45Gy | PTV | CTV\_45Gy + 5 mm isotrope. Fiche du service : PTV1 = (CTV\_T + GTV\_T) + 1 cm, réuni avec CTV\_N + 5 mm | Toujours | 5 mm |
| vol-vulve | PTV\_N# | PTV | CTV\_N# + 5 mm isotrope | Si adénopathie | 5 mm |
| vol-vulve | PTV\_Tboost | PTV | CTV\_Tboost + 5 mm isotrope. Fiche du service : PTV2 = GTV\_T + 1 cm | Exclusif | 5 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-vulve | oar-vessie ; oar-rectum ; oar-canal-anal (fiche) ; oar-sigmoide ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-moelle-osseuse ; oar-aile-iliaque-d (fiche) ; oar-aile-iliaque-g (fiche) ; oar-vulve (si irradiation ganglionnaire seule) ; oar-ovaire-d (si non ménopausée) ; oar-ovaire-g (si non ménopausée) ; oar-uterus (si préservation de la fertilité) ; oar-queue-cheval (si boost ganglionnaire pelvien) ; oar-plexus-sacre (si boost ganglionnaire pelvien) ; oar-rein-d (si lombo-aortique) ; oar-rein-g (si lombo-aortique) ; oar-foie (si lombo-aortique) ; oar-moelle (si lombo-aortique) ; oar-duodenum (si lombo-aortique au-dessus de L1) ; oar-corps | Gaffney 2016 (consensus vulve) ; RTOG 2012, OAR du pelvis |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | essai\_ids | note |
| --- | --- | --- | --- |
| Vulve localement avancée (exclusif) | Cisplatine 40 mg/m² hebdomadaire pendant la RT | gog205 | Réponse clinique complète 64 % ; réponse histologique complète chez 78 % des répondeuses cliniques biopsiées |
| Vulve opérée | Cisplatine 40 mg/m² hebdomadaire possible (Curie) | gaffney-vulve | Selon RCP |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| vulve | GOG 37 : après vulvectomie et curage inguinal N+, la RT inguinale et pelvienne (45–50 Gy) fait mieux que le curage pelvien (survie à 2 ans 68 % vs 54 %), surtout si adénopathie fixée ou ulcérée ou au moins 2 ganglions envahis |
| vulve | CBCT quotidien avec recalage osseux ; toute la vulve visible sur le CBCT ; la vulve doit rester dans le CTV\_T, les vaisseaux dans le CTV\_E, à défaut dans le PTV\_45Gy (Curie) |
| vulve | La fiche du service ne donne pas de dose pour le PTV2 (écart E34) : référence Curie = 56 Gy (marge proche, aires envahies) en post-opératoire, ≥ 60 Gy EQD2 en exclusif |
| vulve-gog205 | Essai de phase 2 (58 patientes) : 31 % n'ont pas terminé le traitement (refus, toxicité, décès) |
