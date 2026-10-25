# Thorax — Poumon

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Six situations. Région `thorax`, localisation `poumon`. La stéréotaxie couvre la tumeur primitive et la métastase pulmonaire (protocole Institut Curie).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| pou-cbnpc-iii | CBNPC stade III non résécable : radiochimiothérapie | en\_place | Stade III non résécable, PS 0–1. Bilan : TEP-TDM et IRM cérébrale | 1 |
| pou-cbnpc-postop | CBNPC opéré : radiothérapie post-opératoire | post\_op | Résection R1–R2, ou pN2 discuté en RCP. Pas d'indication en standard après résection complète pN2 (Lung ART) | 2 |
| pou-sbrt | Stéréotaxie pulmonaire : CBNPC stade I ou métastase | en\_place | CBNPC T1–T2a N0 inopérable ou refusant la chirurgie ; nodule évolutif hypermétabolique sans histologie ; métastase pulmonaire (≤ 5 métastases dans ≤ 3 organes). PTV de 1 à 5 cm (Curie) | 3 |
| pou-cbpc-limite | CBPC limité : radiochimiothérapie | en\_place | Maladie limitée à un hémithorax, irradiable en un champ ; PS 0–2 | 4 |
| pou-cbpc-etendu | CBPC étendu répondeur : radiothérapie thoracique | metastatique | Réponse à la chimiothérapie de première ligne | 5 |
| pou-pall | Palliatif thoracique | palliatif | Symptômes thoraciques (toux, hémoptysie, douleur, dyspnée) chez un patient non curable | 6 |

## Schémas et prescriptions

Dix-huit schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| pou-rct-60-30 | pou-cbnpc-iii | RCT 60 Gy / 30 fx puis durvalumab (RTOG 0617, PACIFIC) | rte\_normo | essai\_phase3 | rtog0617 ; rtog0617lt ; pacific ; pacific5y |  |
| pou-rct-66-33 | pou-cbnpc-iii | RCT 66 Gy / 33 fx puis durvalumab | rte\_normo | essai\_phase3 | proclaim ; pacific | Fiche du service |
| pou-port-54-27 | pou-cbnpc-postop | RT médiastinale post-opératoire 54 Gy / 27 fx (Lung ART) | rte\_normo | essai\_phase3 | lungart ; portc |  |
| pou-sbrt-54-3 | pou-sbrt | SBRT 54 Gy / 3 fx (tumeur primitive périphérique) | sbrt | essai\_phase3 | rtog0236 ; rtog0236lt ; chisel | Institut Curie, SBRT d'un nodule pulmonaire |
| pou-sbrt-45-3 | pou-sbrt | SBRT 45 Gy / 3 fx (périphérique) | sbrt | recommandation | acrop-sbrt-poumon | Institut Curie, SBRT d'un nodule pulmonaire |
| pou-sbrt-48-4 | pou-sbrt | SBRT 48 Gy / 4 fx (périphérique) | sbrt | recommandation | acrop-sbrt-poumon ; chisel | Institut Curie, SBRT d'un nodule pulmonaire |
| pou-sbrt-50-5 | pou-sbrt | SBRT 50 Gy / 5 fx (pariétal ou central à plus de 1 cm des OAR) | sbrt | pratique\_institutionnelle | rtog0813 ; lenglet | Institut Curie, SBRT d'un nodule pulmonaire |
| pou-sbrt-60-8 | pou-sbrt | SBRT 60 Gy / 8 fx (central à 1 cm ou moins, ultracentral) | sbrt | pratique\_institutionnelle | lenglet ; hilus | Institut Curie, SBRT d'un nodule pulmonaire |
| pou-sbrt-55-5-igr | pou-sbrt | SBRT 55 Gy / 5 fx (contact costal ou T2 N0) | sbrt | pratique\_institutionnelle |  | Gustave Roussy, protocole SBRT pulmonaire 2016 |
| pou-sbrt-50-10-igr | pou-sbrt | SBRT 50 Gy / 10 fx (au contact de l'arbre bronchique proximal ou de l'œsophage) | sbrt | pratique\_institutionnelle | hilus | Gustave Roussy, protocole SBRT pulmonaire 2016 |
| pou-cbpc-45-30 | pou-cbpc-limite | RCT 45 Gy / 30 fx bifractionnés puis durvalumab | rte\_normo | essai\_phase3 | turrisi ; convert ; adriatic |  |
| pou-cbpc-66-33 | pou-cbpc-limite | RCT 66 Gy / 33 fx monofractionnés | rte\_normo | essai\_phase3 | convert ; adriatic |  |
| pou-cbpc-70-35 | pou-cbpc-limite | RCT 70 Gy / 35 fx monofractionnés | rte\_normo | essai\_phase3 | calgb30610 |  |
| pou-cbpc-60-40 | pou-cbpc-limite | RCT 60 Gy / 40 fx bifractionnés | rte\_normo | option | gronberg |  |
| pou-ipc-25-10 | pou-cbpc-limite | Irradiation cérébrale prophylactique 25 Gy / 10 fx | rte\_normo | essai\_phase3 | pci9901 ; auperin ; takahashi |  |
| pou-cbpc-et-30-10 | pou-cbpc-etendu | RT thoracique de consolidation 30 Gy / 10 fx (CREST) | rte\_hypo | essai\_phase3 | crest |  |
| pou-pall-17-2 | pou-pall | RT palliative 17 Gy / 2 fx (J1, J8) | rte\_hypo | essai\_phase3 | mrc-pall ; astro-pall-poumon |  |
| pou-pall-10-1 | pou-pall | RT palliative 10 Gy / 1 fx (mauvais état général) | rte\_hypo | essai\_phase3 | mrc-pall |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pou-rct-60-30 | PTV (tumeur + adénopathies) | 60 | 30 | 2 | seul | 5 fx/sem | 74 Gy fait moins bien que 60 Gy (RTOG 0617) |
| pou-rct-66-33 | PTV (tumeur + adénopathies) | 66 | 33 | 2 | seul | 5 fx/sem | Dans l'intervalle 60–66 Gy de PROCLAIM ; dose de la fiche du service |
| pou-port-54-27 | PTV médiastinal | 54 | 27 | 2 | seul | 5 fx/sem | Lung ART autorisait aussi 54 Gy / 30 fx |
| pou-sbrt-54-3 | PTV | 54 | 3 | 18 | seul | Tous les 2 jours | Tumeur primitive seulement, pas pour une métastase (Curie) |
| pou-sbrt-45-3 | PTV | 45 | 3 | 15 | seul | Tous les 2 jours | Périphérique non pariétal |
| pou-sbrt-48-4 | PTV | 48 | 4 | 12 | seul | Tous les 2 jours | Périphérique ; dose ESTRO du contact pariétal |
| pou-sbrt-50-5 | PTV | 50 | 5 | 10 | seul | Tous les 2 jours | Pariétal (préféré à 4 × 12 Gy par Curie) ; central à plus de 1 cm des OAR |
| pou-sbrt-60-8 | PTV | 60 | 8 | 7.5 | seul | Tous les 2 jours | Central à 1 cm ou moins des OAR ; ultracentral au contact du cœur ou des gros vaisseaux |
| pou-sbrt-55-5-igr | PTV | 55 | 5 | 11 | seul | Intervalle 40 à 96 h | T1 N0 au contact des côtes ou T2 N0 ; calcul de type B |
| pou-sbrt-50-10-igr | PTV | 50 | 10 | 5 | seul | 5 fx/sem | Lésion jouxtant l'arbre bronchique proximal ou l'œsophage |
| pou-cbpc-45-30 | PTV (tumeur + adénopathies) | 45 | 30 | 1.5 | seul | 2 fx/j, 5 j/sem (19 jours) | Débute avec le 1er cycle (Turrisi) ou au jour 22 (CONVERT) |
| pou-cbpc-66-33 | PTV (tumeur + adénopathies) | 66 | 33 | 2 | seul | 5 fx/sem | Bras quotidien de CONVERT : pas supérieur au bifractionné |
| pou-cbpc-70-35 | PTV (tumeur + adénopathies) | 70 | 35 | 2 | seul | 5 fx/sem | CALGB 30610 : pas supérieur à 45 Gy bifractionnés |
| pou-cbpc-60-40 | PTV (tumeur + adénopathies) | 60 | 40 | 1.5 | seul | 2 fx/j, 10 fx/sem | Phase 2 : SG à 2 ans 74 % vs 48 % |
| pou-ipc-25-10 | Encéphale | 25 | 10 | 2.5 | seul | 5 fx/sem | Après réponse. 36 Gy : pas moins de métastases et survie plus basse (PCI 99-01) |
| pou-cbpc-et-30-10 | PTV thoracique résiduel | 30 | 10 | 3 | seul | 5 fx/sem | Après réponse à la chimiothérapie |
| pou-pall-17-2 | Tumeur symptomatique | 17 | 2 | 8.5 | seul | J1 et J8 | Plus de dysphagie qu'avec 10 Gy / 1 fx |
| pou-pall-10-1 | Tumeur symptomatique | 10 | 1 | 10 | seul | 1 séance | Palliation équivalente à 17 Gy / 2 fx |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| pou-rct-60-30 | IMRT ou VMAT, 4D ou blocage respiratoire, IGRT quotidienne | Voir Traitement systémique | sim-pou | vol-pou-rct | ct-thorax-quantec | RTOG 0617 : 99 % du PTV ≥ 93 % de la dose |
| pou-rct-66-33 | IMRT ou VMAT, 4D ou gating, IGRT quotidienne | Voir Traitement systémique | sim-pou | vol-pou-rct | ct-thorax-quantec |  |
| pou-port-54-27 | RT 3D ou IMRT | Aucun pendant la RT | sim-pou | vol-pou-port | ct-thorax-quantec |  |
| pou-sbrt-54-3 | VMAT, inspiration bloquée ou 4D, CBCT avant et pendant la séance | Aucune | sim-pou-sbrt | vol-pou-sbrt | ct-pou-sbrt-curie-3fx | (i)GTV : D98 % ≥ 100 % (souple : ≥ 110 %), D0,035 cc entre 118 et 143 %. PTV : D90 % ≥ 99 % (souple : D95 % ≥ 95 %). PTVéval (PTV moins les OAR) : D95 % ≥ 100 % (souple : D98 % ≥ 100 %). Aucune dose > 105 % hors du PTV. R100 % entre 1 et 1,2 ; R50 % et D2cm selon le volume du PTV (protocole Curie) |
| pou-sbrt-45-3 | VMAT, inspiration bloquée ou 4D, CBCT avant et pendant la séance | Aucune | sim-pou-sbrt | vol-pou-sbrt | ct-pou-sbrt-curie-3fx | Comme pou-sbrt-54-3 |
| pou-sbrt-48-4 | VMAT, inspiration bloquée ou 4D, CBCT avant et pendant la séance | Aucune | sim-pou-sbrt | vol-pou-sbrt | ct-pou-sbrt-curie-4fx | Comme pou-sbrt-54-3 |
| pou-sbrt-50-5 | VMAT, inspiration bloquée ou 4D, CBCT avant et pendant la séance | Aucune | sim-pou-sbrt | vol-pou-sbrt | ct-pou-sbrt-curie-5-8fx | Comme pou-sbrt-54-3 |
| pou-sbrt-60-8 | VMAT, inspiration bloquée ou 4D, CBCT avant et pendant la séance | Aucune | sim-pou-sbrt | vol-pou-sbrt | ct-pou-sbrt-curie-5-8fx | Comme pou-sbrt-54-3 |
| pou-sbrt-55-5-igr | Faisceaux conformationnels ou VMAT, scanner 4D, CBCT quotidien | Aucune | sim-pou-sbrt-igr | vol-pou-sbrt-igr | ct-pou-sbrt-igr-5plus | 95 % du PTV à la dose prescrite, 99 % à 90 % ; Dmax 110–140 % |
| pou-sbrt-50-10-igr | Faisceaux conformationnels ou VMAT, scanner 4D, CBCT quotidien | Aucune | sim-pou-sbrt-igr | vol-pou-sbrt-igr | ct-pou-sbrt-igr-5plus | Comme pou-sbrt-55-5-igr |
| pou-cbpc-45-30 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-pou | vol-pou-cbpc | ct-thorax-quantec |  |
| pou-cbpc-66-33 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-pou | vol-pou-cbpc | ct-thorax-quantec |  |
| pou-cbpc-70-35 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-pou | vol-pou-cbpc | ct-thorax-quantec |  |
| pou-cbpc-60-40 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-pou | vol-pou-cbpc | ct-thorax-quantec |  |
| pou-ipc-25-10 | RT 3D ou VMAT, masque thermoformé | Aucune | sim-ipc | vol-ipc |  |  |
| pou-cbpc-et-30-10 | RT 3D ou IMRT | Chimio-immunothérapie selon RCP | sim-pou | vol-pou-cbpc |  |  |
| pou-pall-17-2 | RT 3D | Aucune | sim-pou | vol-pou-pall |  |  |
| pou-pall-10-1 | RT 3D | Aucune | sim-pou | vol-pou-pall |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-pou | Décubitus dorsal, bras au-dessus de la tête | Contention thoracique | Entraînement respiratoire | Injecté sauf contre-indication. Gating si l'apnée est tenue (fiche : au moins 45 s), sinon scanner 4D | Fusion TEP-TDM du bilan | OAR sur le scanner moyen (average) ; GTV sur chaque phase du 4D |
| sim-pou-sbrt | Décubitus dorsal, bras au-dessus de la tête | Contention ORFIT + matelas sous vide ou masque | Apprentissage du spiromètre ou de la respiration régulière (J1) | Non injecté, poumons entiers. Lobe inférieur, ultracentral, paracardiaque : inspiration bloquée (spirométrie). Lobe supérieur ou moyen : scanner 4D, 10 phases + average + MIP | IRM rachidienne (T2) si GTV à moins de 1 cm du canal | Amplitude du GTV > 5 mm au 4D : refaire en inspiration bloquée |
| sim-pou-sbrt-igr | Décubitus dorsal, bras relevés | Contention thoracique + matelas | — | Scanner 4D non injecté (8 phases, coupes 2 mm) + scanner injecté en respiration libre | — | Pas de fiduciaire si scanner 4D |
| sim-ipc | Décubitus dorsal | Masque thermoformé | — | Scanner cérébral | — | — |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-pou-rct | GTV\_T | GTV | Tumeur visible en fenêtres parenchymateuse et médiastinale, avec la TEP-TDM | Toujours |  |
| vol-pou-rct | GTV\_N | GTV | Adénopathies hypermétaboliques, ou petit axe > 1 cm, ou prouvées (EBUS). Pas d'irradiation ganglionnaire prophylactique | Si N+ |  |
| vol-pou-rct | IGTV | ITV | Réunion des GTV sur toutes les phases du 4D, transférée sur l'average | Si scanner 4D |  |
| vol-pou-rct | CTV\_T | CTV | GTV\_T ou IGTV + 5 à 8 mm, corrigé au contact des OAR. 95 % de l'extension microscopique : 8 mm (adénocarcinome), 6 mm (épidermoïde) | Toujours | 5–8 mm |
| vol-pou-rct | CTV\_N | CTV | GTV\_N + 3 mm si l'adénopathie fait moins de 20 mm ; marge plus large au-delà (fiche : 8 mm) | Si N+ | 3 mm |
| vol-pou-rct | PTV | PTV | CTV\_T + CTV\_N + 5 mm (fiche). RTOG 0617 : 5 à 15 mm selon le 4D et l'IGRT | Toujours | 5 mm |
| vol-pou-port | CTV médiastinal | CTV | Stations envahies (compte rendu histologique) + moignon bronchique + stations adjacentes. 1–2R → 1–2R, 4R, 7, 10R ; 1–2L → 1–2L, 4L, 7, 10L ; 3 droite → 3, 4R, 7, 10R ; 3 gauche → 3, 4L, 7, 10L ; 4R → 2R, 4R, 7, 10R ; 4L → 2L, 4L, 7, 10L ; 5 ou 6 → 2L, 4L, 5, 6, 7 ; 7 droite → 4R, 7 ; 7 gauche → 4L, 5, 6, 7 ; 8 droite → 4R, 7, 8 ; 8 gauche → 4L, 5, 6, 7, 8 | Toujours |  |
| vol-pou-port | CTV pariétal | CTV | Lit tumoral au contact pariétal (pT3 pariétal) ou zone de résection incomplète (R1–R2) | Si pT3 pariétal ou R1–R2 |  |
| vol-pou-port | PTV | PTV | CTV + 5 mm (fiche) | Toujours | 5 mm |
| vol-pou-sbrt | GTV | GTV | Lésion en fenêtre parenchymateuse (−600 / +1600 UH), verre dépoli suspect adjacent inclus | Inspiration bloquée |  |
| vol-pou-sbrt | iGTV | ITV | Réunion des GTV des 10 phases, ou contour sur le MIP vérifié en ciné ; transféré sur l'average | Respiration libre (4D) |  |
| vol-pou-sbrt | PTV | PTV | (i)GTV + 5 mm isotrope. Pas de CTV | Toujours | 5 mm |
| vol-pou-sbrt | PTVéval | PTV | PTV moins les OAR (ou PRV) | Toujours |  |
| vol-pou-sbrt-igr | ITV | ITV | GTV = CTV, contouré sur le MIP et vérifié sur chaque phase | Scanner 4D |  |
| vol-pou-sbrt-igr | PTV | PTV | ITV + 4 mm. Sans 4D : GTV + 5 mm en antéro-postérieur et latéral, 9 mm en cranio-caudal | Toujours | 4 mm |
| vol-pou-cbpc | GTV\_T | GTV | Tumeur après chimiothérapie si la RT débute après elle | Toujours |  |
| vol-pou-cbpc | GTV\_N | GTV | Adénopathies envahies avant chimiothérapie (TDM et TEP initiales) | Si N+ |  |
| vol-pou-cbpc | PTV | PTV | CTV + 5 mm (fiche) ; marges CTV comme vol-pou-rct | Toujours | 5 mm |
| vol-ipc | CTV | CTV | Encéphale entier | Toujours |  |
| vol-pou-pall | PTV | PTV | Tumeur et adénopathies responsables des symptômes, marge selon la technique | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-pou-rct | oar-poumons ; oar-coeur ; oar-oesophage ; oar-moelle ; oar-canal-medullaire ; oar-thyroide ; oar-paroi-thoracique ; oar-plexus-brachial-d (selon localisation) ; oar-plexus-brachial-g (selon localisation) ; oar-foie (selon localisation) | ESTRO ACROP CBNPC 2018 ; atlas OAR thoraciques RTOG (Kong 2011) |
| vol-pou-port | oar-poumons ; oar-coeur ; oar-oesophage ; oar-moelle | ESTRO ACROP CBNPC 2018 |
| vol-pou-sbrt | oar-poumons ; oar-poumon-d ; oar-poumon-g ; oar-oesophage ; oar-coeur ; oar-canal-medullaire ; oar-moelle (si GTV à moins de 1 cm, sur IRM T2) ; oar-trachee ; oar-gros-vaisseaux ; oar-arbre-bronchique ; oar-paroi-thoracique ; oar-cotes ; oar-plexus-brachial-d (si GTV à moins de 1 cm) ; oar-plexus-brachial-g (si GTV à moins de 1 cm) ; oar-peau ; oar-foie ; oar-estomac (si à moins de 1 cm) | Atlas OAR thoraciques RTOG (Kong 2011) |
| vol-pou-sbrt-igr | oar-canal-medullaire ; oar-oesophage ; oar-plexus-brachial-d (si apical) ; oar-plexus-brachial-g (si apical) ; oar-coeur ; oar-trachee ; oar-arbre-bronchique ; oar-poumon-d ; oar-poumon-g ; oar-paroi-thoracique ; oar-gros-vaisseaux (si juxta-aortique) | Atlas RTOG |
| vol-pou-cbpc | oar-poumons ; oar-coeur ; oar-oesophage ; oar-moelle | ESTRO ACROP CBPC 2020 |
| vol-ipc | — | — |
| vol-pou-pall | oar-moelle ; oar-poumons ; oar-oesophage | — |

## Traitement systémique associé

`protocole` = nom du protocole à relier dans la bibliothèque Protocoles (règle dans la spécification).

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| pou-cbnpc-iii | Carboplatine AUC 2 + paclitaxel 45 mg/m² hebdomadaires pendant la RT | Carboplatine-paclitaxel hebdomadaire concomitant à la RT (poumon) | rtog0617 | Consolidation de RTOG 0617 remplacée aujourd'hui par le durvalumab |
| pou-cbnpc-iii | Cisplatine-étoposide concomitant | Cisplatine-étoposide concomitant à la RT (poumon) | proclaim | Bras standard de PROCLAIM |
| pou-cbnpc-iii | Cisplatine 75 mg/m² + pémétrexed 500 mg/m² toutes les 3 semaines × 3 | Cisplatine-pémétrexed concomitant à la RT (poumon) | proclaim | Non épidermoïde seulement ; moins de toxicité G3–4 |
| pou-cbnpc-iii | Durvalumab 12 mois après la RCT | Durvalumab consolidation (poumon) | pacific ; pacific5y | Début 1 à 42 jours après la RCT ; PACIFIC : 10 mg/kg toutes les 2 semaines |
| pou-cbpc-limite | Cisplatine-étoposide, 4 cycles, RT dès le cycle 1 ou 2 | Cisplatine-étoposide (CBPC) | turrisi ; convert | Carboplatine possible (Grønberg) |
| pou-cbpc-limite | Durvalumab 1500 mg toutes les 4 semaines, jusqu'à 24 mois | Durvalumab consolidation (CBPC limité) | adriatic | Après RCT sans progression |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| poumon | Pas d'irradiation ganglionnaire prophylactique en RCT exclusive. Seuls la tumeur et les ganglions pathologiques sont traités |
| vol-pou-rct | La marge CTV s'ajoute toujours, même en 4D ou en gating. ITV = réunion des CTV sur le cycle respiratoire (écart E40) |
| pou-rct-60-30 | 74 Gy fait moins bien que 60 Gy : SG médiane 20,3 vs 28,7 mois. Le V5 et le V30 du cœur prédisent la survie (RTOG 0617) |
| pou-cbnpc-postop | PORT non recommandée en standard après résection complète pN2. Lung ART : survie sans maladie 47 % vs 44 % (NS), plus de toxicité cardiopulmonaire (11 % vs 5 %) |
| pou-sbrt | 54 Gy / 3 fx : tumeur primitive seulement, jamais pour une métastase (Curie) |
| pou-sbrt | Ultracentral au contact de l'arbre bronchique proximal, de l'œsophage ou du plexus : pas de SBRT à Curie (RT hypofractionnée). 7 × 8 Gy à proscrire à moins de 1 cm des bronches souches et de la trachée (HILUS : 10 décès) |
| pou-sbrt | Lésion centrale = PTV à moins de 2 cm de toute structure sensible (définition IASLC retenue par Curie). Ultracentrale = PTV au contact de l'arbre bronchique proximal, du cœur, des vaisseaux pulmonaires ou de l'œsophage |
| pou-sbrt | Séances tous les 2 jours (voire 3). CBCT avant le premier arc et entre les arcs ; écart os / tissu mou > 1 cm : appeler médecin et physicien |
| pou-sbrt | Patient opérable : SBRT non inférieure à la lobectomie dans STARS révisé (bras unique, comparaison appariée). Décision en RCP |
| pou-sbrt | Métastases : SABR-COMET (phase 2) améliore la survie (5 ans 42 % vs 18 %) au prix de 4,5 % de décès liés au traitement |
| pou-sbrt | 34 Gy / 1 fx (RTOG 0915, phase 2) : non retenu par Curie ni Gustave Roussy |
| pou-sbrt | Surveillance : TDM à 3, 6 et 12 mois, puis tous les 6 mois pendant 3 ans, puis annuelle (Curie) |
| pou-sbrt-55-5-igr | Le protocole Gustave Roussy donne deux couvertures du PTV (90 % ou 95 % à la dose prescrite) : retenir 95 % (fiche dosimétrique, écart E51) |
| pou-cbpc-limite | 45 Gy bifractionnés reste le standard. 66 Gy / 33 fx et 70 Gy / 35 fx ne font pas mieux (CONVERT, CALGB 30610) |
| pou-ipc-25-10 | IPC 25 Gy / 10 fx après réponse (CBPC limité). CBPC étendu : IPC non indispensable si surveillance IRM (Takahashi) |
| pou-cbpc-etendu | CREST a été mené avant l'immunothérapie : discuter la RT thoracique en RCP |
| pou-pall | Stade III non curable, PS 0–2 : RT modérément hypofractionnée avec un doublet de platine (ASTRO). Stade IV : pas de RCT concomitante en routine |
