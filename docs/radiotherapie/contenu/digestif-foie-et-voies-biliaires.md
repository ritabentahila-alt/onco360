# Digestif — Foie et voies biliaires

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Cinq situations. Région `digestif`, localisation `foie`. Carcinome hépatocellulaire (CHC), métastases hépatiques, cholangiocarcinome et cancer de la vésicule.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| foie-chc | CHC non éligible aux traitements locaux standard : stéréotaxie | en\_place | CHC non résécable, non transplantable, non accessible à l'ablation ou à la chimio-embolisation ; Child-Pugh A (B : voir points d'attention) ; au moins 700 cc de foie sain | 1 |
| foie-chc-tvp | CHC avec invasion vasculaire macroscopique | en\_place | Thrombose tumorale portale ou cave, maladie limitée au foie | 2 |
| foie-meta | Métastases hépatiques : stéréotaxie | oligometastatique | 1 à 3 métastases de moins de 6 cm, primitif contrôlé | 3 |
| foie-cca-adj | Cholangiocarcinome extrahépatique ou vésicule opéré : RCT adjuvante | post\_op | pT2–4, N+ ou R1, M0 (SWOG S0809) | 4 |
| foie-cca-ihc | Cholangiocarcinome intrahépatique non résécable | en\_place | Après chimiothérapie systémique, maladie limitée au foie | 5 |

## Schémas et prescriptions

Huit schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| foie-chc-45-3 | foie-chc | SBRT 45 Gy / 3 fx | sbrt | pratique\_institutionnelle | durand-labrunie ; astro-foie | Gustave Roussy, stéréotaxie hépatique 2016 (3 × 15 Gy) |
| foie-chc-40-5 | foie-chc | SBRT 40 Gy / 5 fx (5 × 6,5 à 5 × 9 Gy selon le foie sain et les OAR) | sbrt | essai\_phase3 | rtog1112 ; rtog1112-igrt ; bujold ; astro-foie | Gustave Roussy, stéréotaxie hépatique 2016 (5 fractions) |
| foie-50-10 | foie-chc | RT stéréotaxique 50 Gy / 10 fx (proximité des OAR) | sbrt | pratique\_institutionnelle | astro-foie | Gustave Roussy, stéréotaxie hépatique 2016 (10 × 5 Gy) |
| foie-tvp-tace-45 | foie-chc-tvp | Chimio-embolisation + RT 45 Gy (2,5 à 3 Gy par fraction) | rte\_hypo | option | yoon ; astro-foie |  |
| foie-meta-45-3 | foie-meta | SBRT 45 Gy / 3 fx | sbrt | pratique\_institutionnelle | sabrcomet ; sabrcomet5 | Gustave Roussy, stéréotaxie hépatique 2016 (3 × 15 Gy) |
| foie-meta-60-3 | foie-meta | SBRT 60 Gy / 3 fx | sbrt | option | rusthoven |  |
| foie-cca-s0809 | foie-cca-adj | RCT adjuvante 45 Gy (aires) + complément jusqu'à 54 Gy (lit tumoral) + capécitabine | rte\_normo | option | s0809 ; bilcap ; astro-foie |  |
| foie-cca-675-15 | foie-cca-ihc | RT hypofractionnée 67,5 Gy / 15 fx | rte\_hypo | option | hong-protons ; tao ; astro-foie |  |

**Tableau Prescriptions**

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| foie-chc-45-3 | PTV | 45 | 3 | 15 | seul |  | Contrôle local à 18 mois 98 % (phase 2 française) |
| foie-chc-40-5 | PTV | 40 | 5 | 8 | seul |  | Gustave Roussy : 5 × 9, 8, 7 ou 6,5 Gy, prescription sur l'isodose 82 %. RTOG 1112 : 27,5 à 50 Gy / 5 fx |
| foie-50-10 | PTV | 50 | 10 | 5 | seul | 5 fx/sem | Lésion proche du tube digestif ou du hile |
| foie-tvp-tace-45 | PTV (tumeur + thrombus) | 45 | 18 | 2.5 | seul | 5 fx/sem | RT dans les 3 semaines après la 1re chimio-embolisation ; jusqu'à 3 Gy par fraction |
| foie-meta-45-3 | PTV | 45 | 3 | 15 | seul |  |  |
| foie-meta-60-3 | PTV | 60 | 3 | 20 | seul |  | Contrôle local à 2 ans 92 % (100 % si ≤ 3 cm) |
| foie-cca-s0809 | PTV aires ganglionnaires régionales | 45 | 25 | 1.8 | seul | 5 fx/sem |  |
| foie-cca-s0809 | PTV lit tumoral | 9 | 5 | 1.8 | sequentiel | 5 fx/sem | Total 54 Gy ; l'essai autorisait jusqu'à 59,4 Gy |
| foie-cca-675-15 | PTV | 67.5 | 15 | 4.5 | seul | 5 fx/sem | Dose maximale de l'essai (protons) ; viser une BED10 > 80,5 Gy (Tao) |

**Tableau Schémas — liens**

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| foie-chc-45-3 | SBRT, 4D ou blocage, CBCT ; repères radio-opaques recommandés | Aucune | sim-foie-sbrt | vol-foie-sbrt | ct-foie-sbrt-igr-3fx | Gustave Roussy : rapporter D2 %, D50 %, D98 %, D99 % du PTV et l'indice d'homogénéité |
| foie-chc-40-5 | SBRT, 4D ou blocage, CBCT ; repères radio-opaques recommandés | Voir Traitement systémique | sim-foie-sbrt | vol-foie-sbrt | ct-foie-sbrt-igr-5fx | Comme foie-chc-45-3 |
| foie-50-10 | SBRT, 4D ou blocage, CBCT | Aucune | sim-foie-sbrt | vol-foie-sbrt | ct-foie-sbrt-igr-10fx | Comme foie-chc-45-3 |
| foie-tvp-tace-45 | RT 3D ou IMRT | Chimio-embolisation toutes les 6 semaines | sim-foie | vol-foie-tvp |  |  |
| foie-meta-45-3 | SBRT, 4D ou blocage, CBCT | Selon le primitif | sim-foie-sbrt | vol-foie-sbrt | ct-foie-sbrt-igr-3fx | Comme foie-chc-45-3 |
| foie-meta-60-3 | SBRT, 4D ou blocage, CBCT | Selon le primitif | sim-foie-sbrt | vol-foie-sbrt |  |  |
| foie-cca-s0809 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-foie | vol-foie-cca-adj | ct-abdo-acrop-crt |  |
| foie-cca-675-15 | IMRT ou VMAT (ou protons), IGRT quotidienne | Selon RCP | sim-foie | vol-foie-cca-ihc |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-foie-sbrt | Décubitus dorsal, bras au-dessus de la tête | Contention corps entier | À jeun | Scanner 4D ou en inspiration bloquée, injection multiphasique | IRM hépatique et scanner multiphasique du bilan, fusion | Repères radio-opaques (fiduciaires, clips, prothèse biliaire) : jamais d'écart > 5 mm, contre 3 % > 10 mm sur les tissus mous (RTOG 1112) |
| sim-foie | Décubitus dorsal, bras au-dessus de la tête | Matelas ou cale genoux | À jeun | Injecté ; 4D si mobilité | Imagerie du bilan, comptes rendus opératoire et histologique | Clips chirurgicaux |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-foie-sbrt | GTV | GTV | Lésion visible en IRM et scanner multiphasique (temps artériel et portal) | Toujours |  |
| vol-foie-sbrt | ITV | ITV | Réunion des GTV sur le cycle respiratoire | Respiration libre (4D) |  |
| vol-foie-sbrt | PTV | PTV | ITV (ou GTV en inspiration bloquée) + marge selon le contrôle du mouvement et l'IGRT | Toujours |  |
| vol-foie-tvp | GTV | GTV | Tumeur et thrombus tumoral vasculaire | Toujours |  |
| vol-foie-tvp | PTV | PTV | GTV + marge selon le mouvement et l'IGRT | Toujours |  |
| vol-foie-cca-adj | CTV aires | CTV | Aires ganglionnaires régionales | Toujours |  |
| vol-foie-cca-adj | CTV lit tumoral | CTV | Lit tumoral | Toujours |  |
| vol-foie-cca-adj | PTV | PTV | CTV + marge selon le mouvement et l'IGRT | Toujours |  |
| vol-foie-cca-ihc | GTV | GTV | Tumeur visible | Toujours |  |
| vol-foie-cca-ihc | PTV | PTV | GTV ou ITV + marge selon la technique | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-foie-sbrt | oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle ; oar-canal-medullaire ; oar-grele ; oar-duodenum ; oar-colon ; oar-estomac ; oar-coeur ; oar-oesophage ; oar-poumons ; oar-cotes ; oar-voie-biliaire ; oar-gros-vaisseaux | — |
| vol-foie-tvp | oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle ; oar-duodenum ; oar-estomac | — |
| vol-foie-cca-adj | oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle ; oar-duodenum ; oar-estomac ; oar-grele | ESTRO ACROP aires ganglionnaires digestives hautes 2021 |
| vol-foie-cca-ihc | oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle ; oar-duodenum ; oar-estomac ; oar-grele ; oar-colon | — |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| foie-chc | Sorafénib après la SBRT (RTOG 1112) | Sorafénib (CHC) | rtog1112 | Essai arrêté tôt : le traitement systémique de première ligne a changé |
| foie-cca-adj | Gemcitabine 1000 mg/m² J1, J8 + capécitabine 1500 mg/m²/j J1–J14, toutes les 3 semaines × 4, puis capécitabine 1330 mg/m²/j pendant la RT | Gemcitabine-capécitabine puis capécitabine concomitante à la RT (voies biliaires) | s0809 |  |
| foie-cca-adj | Capécitabine adjuvante sans RT | Capécitabine adjuvante (voies biliaires) | bilcap | Alternative de référence après résection |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| foie | Foie sain (foie moins GTV), dose moyenne : < 13 Gy (CHC, 3 fx), < 18 Gy (CHC, 6 fx), < 15 Gy (métastases, 3 fx), < 20 Gy (métastases, 6 fx). Au moins 700 cc ≤ 15 Gy en 3 à 5 fx (QUANTEC) |
| foie | Child-Pugh B : dose moyenne au foie sain < 6 Gy en 4 à 6 Gy par fraction (QUANTEC) |
| foie | Fractionnement classique : dose moyenne au foie sain < 28 Gy (CHC) ou < 32 Gy (métastases) en 2 Gy (QUANTEC) |
| foie-chc-40-5 | RTOG 1112 : SBRT avant sorafénib, SG médiane 15,8 vs 12,3 mois (HR 0,77, NS ; 0,72 après ajustement) et SSP 9,2 vs 5,5 mois |
| foie-chc-tvp | Chimio-embolisation + RT : SG 55 vs 43 semaines contre sorafénib (Yoon, essai randomisé monocentrique) |
| foie-cca-ihc | Cholangiocarcinome intrahépatique : la dose compte. BED10 > 80,5 Gy : SG à 3 ans 73 % vs 38 % (Tao) |
| foie-meta | Oligométastases : décision en RCP, toutes les lésions traitables (SABR-COMET) |
