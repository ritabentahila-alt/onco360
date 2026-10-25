# Digestif — Œsophage

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `digestif`, localisation `oesophage`. Les cancers de la jonction œsogastrique sont traités ici.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| oeso-neoadj | Résécable : radiochimiothérapie préopératoire (CROSS) | en\_place | Tumeur résécable de l'œsophage ou de la jonction, patient opérable. Épidermoïde : indication principale. Adénocarcinome : FLOT périopératoire supérieur à CROSS (ESOPEC) | 1 |
| oeso-excl | Radiochimiothérapie exclusive | en\_place | Épidermoïde (alternative à la chirurgie), patient inopérable, tumeur non résécable, œsophage cervical | 2 |
| oeso-pall | Palliatif : dysphagie ou saignement | palliatif | Cancer incurable ou patient non éligible à un traitement curatif | 3 |

## Schémas et prescriptions

Sept schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| oeso-cross-414-23 | oeso-neoadj | RCT 41,4 Gy / 23 fx + carboplatine-paclitaxel, puis chirurgie (CROSS) | rte\_normo | essai\_phase3 | cross ; cross-lt ; cross-10 ; neoaegis ; esopec ; cm577 ; sano |  |
| oeso-rct-50-25 | oeso-excl | RCT exclusive 50 Gy / 25 fx + FOLFOX ou 5FU-cisplatine | rte\_normo | essai\_phase3 | prodige5 ; rtog8501 ; rtog8501-lt ; ffcd9102 ; recorad-oeso ; xu-60-50 ; xu-60-50-lt |  |
| oeso-rct-504-28 | oeso-excl | RCT exclusive 50,4 Gy / 28 fx | rte\_normo | essai\_phase3 | int0123 ; artdeco |  |
| oeso-rct-40-10-service | oeso-excl | RCT exclusive 40 Gy / 20 fx (ganglions) puis complément 10 Gy / 5 fx (tumeur) | rte\_normo | pratique\_institutionnelle | concorde ; boustani-2022 ; recorad-oeso | Fiche du service « protocole CONCORDE » |
| oeso-curie-12-1 | oeso-pall | Curiethérapie endoluminale HDR 12 Gy en 1 fraction | curie\_hdr | essai\_phase3 | homs ; abs-oeso |  |
| oeso-pall-20-5 | oeso-pall | RT externe palliative 20 Gy / 5 fx | rte\_hypo | essai\_phase3 | rocs |  |
| oeso-pall-30-10 | oeso-pall | RT externe palliative 30 Gy / 10 fx | rte\_hypo | essai\_phase3 | rocs |  |

**Tableau Prescriptions**

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| oeso-cross-414-23 | PTV | 41.4 | 23 | 1.8 | seul | 5 fx/sem | Chirurgie 3 à 10 semaines après (Neo-AEGIS) |
| oeso-rct-50-25 | PTV | 50 | 25 | 2 | seul | 5 fx/sem | Dose de PRODIGE 5 et de la SFRO. Pas d'escalade au-delà de 50 Gy |
| oeso-rct-504-28 | PTV | 50.4 | 28 | 1.8 | seul | 5 fx/sem | Bras standard d'INT 0123 et d'ARTDECO |
| oeso-rct-40-10-service | PTV prophylactique (tumeur + ganglions à risque) | 40 | 20 | 2 | seul | 5 fx/sem | Fiche du service |
| oeso-rct-40-10-service | PTV boost (tumeur + ganglions envahis) | 10 | 5 | 2 | sequentiel | 5 fx/sem | Total 50 Gy / 25 fx sur la tumeur |
| oeso-curie-12-1 | Lumière œsophagienne (applicateur endoluminal) | 12 | 1 | 12 | seul | 1 séance | Dose à 1 cm de la source (ABS) |
| oeso-pall-20-5 | PTV tumeur | 20 | 5 | 4 | seul | 5 fx/sem | Après prothèse : seulement si risque hémorragique (ROCS) |
| oeso-pall-30-10 | PTV tumeur | 30 | 10 | 3 | seul | 5 fx/sem | Même indication que 20 Gy / 5 fx |

**Tableau Schémas — liens**

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| oeso-cross-414-23 | IMRT ou VMAT ; CBCT obligatoire (Neo-AEGIS) | Voir Traitement systémique | sim-oeso | vol-oeso-cross | ct-oeso-neoaegis |  |
| oeso-rct-50-25 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-oeso | vol-oeso-excl | ct-thorax-quantec |  |
| oeso-rct-504-28 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-oeso | vol-oeso-excl | ct-thorax-quantec |  |
| oeso-rct-40-10-service | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-oeso | vol-oeso-excl | ct-thorax-quantec |  |
| oeso-curie-12-1 | Applicateur endoluminal HDR | Aucune | sim-oeso-curie | vol-oeso-curie |  |  |
| oeso-pall-20-5 | RT 3D | Aucune | sim-oeso | vol-oeso-pall |  |  |
| oeso-pall-30-10 | RT 3D | Aucune | sim-oeso | vol-oeso-pall |  |  |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Dysphagie d'un cancer inopérable | HDR 12 Gy en 1 fraction | Essai de phase 3 (Homs) | Soulagement plus lent mais plus durable que la prothèse, moins de complications |
| Palliatif après 30 Gy de RT externe | HDR 10 à 14 Gy en 1 ou 2 fractions | Recommandation ABS 1997 | Pas pendant la chimiothérapie |
| Palliatif sans RT externe (espérance de vie < 3 mois) | HDR 15 à 20 Gy en 2 à 4 fractions | Recommandation ABS 1997 |  |

**Technique :** applicateur endoluminal ; dose prescrite à 1 cm du milieu de la source ou de la position d'arrêt (ABS).

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-oeso | Décubitus dorsal, bras au-dessus de la tête, cale genoux | Masque thermoformé ou matelas | Tumeur distale ou de la jonction : à jeun 2 h, puis 200 mL 30 min avant le scanner et chaque séance (Neo-AEGIS) | Injecté sauf contre-indication, cible et OAR en entier (poumons, foie, reins, estomac) ; 4D encouragé | Endoscopie, écho-endoscopie, TEP-TDM | Limites de la tumeur repérées en endoscopie ; marqueurs si disponibles |
| sim-oeso-curie | Décubitus dorsal | — | À jeun | Repérage de l'applicateur | Endoscopie | Limites de la sténose |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-oeso-cross | GTV | GTV | Tumeur primitive (toute la circonférence de l'œsophage) + ganglions envahis ; endoscopie, écho-endoscopie et TEP-TDM | Toujours |  |
| vol-oeso-cross | CTV | CTV | GTV + 0,5 cm isotrope + graisse péri-œsophagienne 3 cm au-dessus et au-dessous du GTV. Sous la jonction : tumeur seule, pas toute la circonférence gastrique. Ganglion abdominal envahi : toute la station | Toujours | 0,5 cm + 3 cm cranio-caudal |
| vol-oeso-cross | PTV | PTV | CTV + 1 cm isotrope (5 mm mouvement interne + 5 mm mise en place) | Toujours | 1 cm |
| vol-oeso-excl | GTV\_T | GTV | Tumeur avant tout traitement : endoscopie, écho-endoscopie, scanner, TEP | Toujours |  |
| vol-oeso-excl | GTV\_N | GTV | Ganglions envahis (écho-endoscopie, scanner, TEP) | Si N+ |  |
| vol-oeso-excl | CTV\_T | CTV | GTV\_T + 5 cm cranio-caudal, limité au muscle cricopharyngien et au cardia ; graisse médiastinale jusqu'aux interfaces (plèvre, vaisseaux, trachée, vertèbres, piliers) | Toujours | 5 cm cranio-caudal |
| vol-oeso-excl | CTV\_N | CTV | Stations ganglionnaires à risque d'envahissement ≥ 20 % | Toujours |  |
| vol-oeso-excl | PTV prophylactique | PTV | CTV\_T + CTV\_N + 1 cm | Toujours | 1 cm |
| vol-oeso-excl | PTV boost | PTV | GTV\_T + GTV\_N + 2 cm cranio-caudal, 1 cm radial | Schéma 40 + 10 Gy | 2 cm / 1 cm |
| vol-oeso-curie | CTV | CTV | Sténose tumorale, longueur repérée en endoscopie | Toujours |  |
| vol-oeso-pall | PTV | PTV | Tumeur responsable des symptômes, marge selon la technique | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-oeso-cross | oar-poumons ; oar-coeur ; oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle ; oar-estomac | Neo-AEGIS (protocole) ; Wu 2015 ; ESTRO ACROP aires ganglionnaires digestives hautes 2021 |
| vol-oeso-excl | oar-canal-medullaire ; oar-coeur ; oar-trachee ; oar-poumon-d ; oar-poumon-g ; oar-thyroide ; oar-plexus-brachial-d (cervical) ; oar-plexus-brachial-g (cervical) ; oar-larynx (cervical) ; oar-rein-d ; oar-rein-g ; oar-foie | Wu 2015 ; ESTRO ACROP aires ganglionnaires digestives hautes 2021 |
| vol-oeso-curie | — | — |
| vol-oeso-pall | oar-moelle ; oar-poumons ; oar-coeur | — |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| oeso-neoadj | Carboplatine AUC 2 + paclitaxel 50 mg/m² hebdomadaires × 5 (J1, J8, J15, J22, J29) | Carboplatine-paclitaxel hebdomadaire (CROSS) | cross | Pendant la RT |
| oeso-neoadj | Nivolumab adjuvant 1 an si résidu tumoral après chirurgie | Nivolumab adjuvant (œsophage) | cm577 | R0 avec réponse histologique incomplète |
| oeso-neoadj | Adénocarcinome : FLOT périopératoire à la place de CROSS | FLOT (œsogastrique) | esopec ; flot4 | SG à 3 ans 57,4 % vs 50,7 % |
| oeso-excl | FOLFOX pendant la RT | FOLFOX concomitant à la RT (œsophage) | prodige5 | Plus pratique que le 5FU-cisplatine, même efficacité |
| oeso-excl | 5FU-cisplatine pendant la RT | 5FU-cisplatine concomitant à la RT (œsophage) | rtog8501 ; prodige5 |  |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| oesophage | Pas d'escalade de dose au-delà de 50 Gy en RCT exclusive : INT 0123, ARTDECO, CONCORDE, Xu, SFRO |
| oeso-neoadj | Adénocarcinome : FLOT périopératoire supérieur à CROSS (ESOPEC). CROSS reste le standard de l'épidermoïde résécable |
| oeso-neoadj | Réponse clinique complète après CROSS : la surveillance active est non inférieure à la chirurgie à 2 ans (SANO). Décision en RCP |
| oeso-excl | Épidermoïde répondeur : la chirurgie après RCT n'améliore pas la survie et augmente la mortalité à 3 mois (FFCD 9102) |
| vol-oeso-excl | GTV\_N = ganglions envahis visibles. Les stations « à risque ≥ 20 % » relèvent du CTV\_N (écart E42) |
| oeso-pall | Après prothèse, la RT externe n'améliore ni la dysphagie ni la survie (ROCS) : la réserver au risque hémorragique |
| oeso-curie-12-1 | La curiethérapie soulage plus lentement que la prothèse mais plus durablement, avec moins d'hémorragies tardives (5 % vs 13 %) |
