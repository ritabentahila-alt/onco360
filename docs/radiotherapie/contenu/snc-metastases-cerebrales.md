# SNC — Métastases cérébrales

Mise à jour : 2026-10-25 · Statut de l'onglet : `valide`

## Situations cliniques

Quatre situations. Région `snc`, localisation `metastases_cerebrales`. La stéréotaxie suit la procédure de l'Institut Curie (métastases cérébrales, 2021). L'irradiation prophylactique du CBPC est dans l'onglet « Thorax — Poumon ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| meta-en-place | Métastases en place : stéréotaxie | metastatique | Primitif contrôlé, histologie confirmée ; 5 lésions au plus (plus sur avis médical) ; PTV < 40 mm ; IK > 70 %, espérance de vie > 6 mois ; ni hydrocéphalie ni effet de masse (Curie, ANOCEF 2018). Lésion ≥ 30 mm : discuter la chirurgie première | 1 |
| meta-cavite | Métastase opérée : stéréotaxie de la cavité | post\_op | Après exérèse, stéréotaxie systématique ; PTV < 50 mm (Curie) | 2 |
| meta-itc | Encéphale in toto | metastatique | Métastases non accessibles à la stéréotaxie ; épargne hippocampique si aucune métastase dans la zone d'évitement (NRG CC001) | 3 |
| meta-reirr | Réirradiation stéréotaxique | metastatique | Récidive après encéphale in toto ou après une stéréotaxie du même site ; toujours en 3 ou 5 séances ; exérèse première à privilégier si faisable (Curie) | 4 |

## Schémas et prescriptions

Vingt schémas. Tous : statut = `valide`, date\_verif = 2026-10-24. Curie choisit le plus petit nombre de fractions et la plus forte dose par fraction compatibles avec les contraintes des OAR.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| meta-srs-20-1 | meta-en-place | Radiochirurgie 20 Gy en 1 fraction (PTV ≤ 20 mm) | sbrt | pratique\_institutionnelle | n0574 ; jrosg99-1 ; chang2009 ; hytec-encephale ; astro-mc-2022 ; eano-esmo-mc-2021 | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| meta-srs-rtog9005 | meta-en-place | Radiochirurgie 24, 18 ou 15 Gy selon le diamètre (RTOG 90-05) | sbrt | option | rtog9005 ; kirkpatrick-marges |  |
| meta-srs-jlgk | meta-en-place | Radiochirurgie de 5 à 10 métastases : 22 ou 20 Gy selon le volume (JLGK0901) | sbrt | option | jlgk0901 |  |
| meta-srt-27-3 | meta-en-place | Stéréotaxie 27 Gy / 3 fx (3 × 9 Gy) | sbrt | pratique\_institutionnelle | minniti2016 ; hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| meta-srt-24-3 | meta-en-place | Stéréotaxie 24 Gy / 3 fx (3 × 8 Gy) | sbrt | pratique\_institutionnelle | hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| meta-srt-30-5 | meta-en-place | Stéréotaxie 30 Gy / 5 fx (5 × 6 Gy) | sbrt | pratique\_institutionnelle | hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| meta-srt-25-5 | meta-en-place | Stéréotaxie 25 Gy / 5 fx (5 × 5 Gy) | sbrt | pratique\_institutionnelle | hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| meta-srt-service-33-3 | meta-en-place | 33 Gy à l'isocentre en 3 fx, 23,1 Gy sur le PTV (isodose 70 %) | sbrt | pratique\_institutionnelle | lucia2019 | Fiche du service « stéréotaxie cérébrale » |
| cav-27-3 | meta-cavite | Cavité 27 Gy / 3 fx (3 × 9 Gy) | sbrt | pratique\_institutionnelle | mdacc-cavite ; n107c ; soliman-cavite | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| cav-24-3 | meta-cavite | Cavité 24 Gy / 3 fx (3 × 8 Gy) | sbrt | pratique\_institutionnelle | mdacc-cavite ; soliman-cavite | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| cav-30-5 | meta-cavite | Cavité 30 Gy / 5 fx (5 × 6 Gy) | sbrt | pratique\_institutionnelle | mdacc-cavite ; soliman-cavite | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| cav-25-5 | meta-cavite | Cavité 25 Gy / 5 fx (5 × 5 Gy) | sbrt | pratique\_institutionnelle | mdacc-cavite ; soliman-cavite | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| cav-service-33-3 | meta-cavite | Cavité 33 Gy à l'isocentre en 3 fx, 23,1 Gy sur le PTV (isodose 70 %) | sbrt | pratique\_institutionnelle | lucia2019 | Fiche du service « stéréotaxie cérébrale » |
| itc-30-10 | meta-itc | Encéphale in toto 30 Gy / 10 fx | rte\_hypo | essai\_phase3 | eortc22952 ; jrosg99-1 ; n107c | Fiche du service « encéphale in toto » |
| itc-20-5 | meta-itc | Encéphale in toto 20 Gy / 5 fx | rte\_hypo | essai\_phase3 | quartz | Fiche du service « encéphale in toto » |
| itc-ha-30-10 | meta-itc | Encéphale in toto 30 Gy / 10 fx avec épargne hippocampique, mémantine | rte\_hypo | essai\_phase3 | nrg-cc001 ; rtog0933 ; rtog0614 ; gondi-ha-2010 | Tableur du service « Épargne hippocampique » |
| reirr-27-3 | meta-reirr | Réirradiation 27 Gy / 3 fx, après encéphale in toto seulement | sbrt | pratique\_institutionnelle | hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| reirr-24-3 | meta-reirr | Réirradiation 24 Gy / 3 fx | sbrt | pratique\_institutionnelle | hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| reirr-30-5 | meta-reirr | Réirradiation 30 Gy / 5 fx | sbrt | pratique\_institutionnelle | hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |
| reirr-25-5 | meta-reirr | Réirradiation 25 Gy / 5 fx | sbrt | pratique\_institutionnelle | hytec-encephale | Institut Curie, stéréotaxie des métastases cérébrales 2021 |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| meta-srs-20-1 | PTV ≤ 20 mm | 20 | 1 | 20 | seul | 1 séance | GTV à plus de 5 mm du tronc et du chiasma, hors zone critique (Curie) |
| meta-srs-rtog9005 | Lésion ≤ 20 mm | 24 | 1 | 24 | seul | 1 séance | Doses maximales tolérées, en périphérie de la lésion |
| meta-srs-rtog9005 | Lésion de 21 à 30 mm | 18 | 1 | 18 | seul | 1 séance |  |
| meta-srs-rtog9005 | Lésion de 31 à 40 mm | 15 | 1 | 15 | seul | 1 séance |  |
| meta-srs-jlgk | Lésion < 4 mL | 22 | 1 | 22 | seul | 1 séance | En périphérie ; plus grosse lésion < 10 mL et < 3 cm, volume total ≤ 15 mL |
| meta-srs-jlgk | Lésion de 4 à 10 mL | 20 | 1 | 20 | seul | 1 séance |  |
| meta-srt-27-3 | PTV < 41 mm | 27 | 3 | 9 | seul | 3 séances/sem (J1, J3, J5) | Lésion du tronc : pas de dose unique, 3 × 8 ou 5 × 5 Gy (Curie) |
| meta-srt-24-3 | PTV < 41 mm | 24 | 3 | 8 | seul | 3 séances/sem (J1, J3, J5) | Schéma du tronc cérébral en 3 fractions (Curie) |
| meta-srt-30-5 | PTV < 41 mm | 30 | 5 | 6 | seul | 3 séances/sem |  |
| meta-srt-25-5 | PTV < 41 mm | 25 | 5 | 5 | seul | 3 séances/sem | Schéma du tronc cérébral en 5 fractions (Curie) |
| meta-srt-service-33-3 | PTV (isodose 70 %) | 23.1 | 3 | 7.7 | seul | J1, J3, J5 | 11 Gy par séance à l'isocentre (33 Gy) |
| cav-27-3 | PTV cavité < 41 mm | 27 | 3 | 9 | seul | 3 séances/sem (J1, J3, J5) | Pas de dose unique en post-opératoire (Curie) |
| cav-24-3 | PTV cavité < 41 mm | 24 | 3 | 8 | seul | 3 séances/sem (J1, J3, J5) |  |
| cav-30-5 | PTV cavité < 50 mm | 30 | 5 | 6 | seul | 3 séances/sem | Seuls 5 × 6 et 5 × 5 Gy si le PTV mesure 41 à 49 mm |
| cav-25-5 | PTV cavité < 50 mm | 25 | 5 | 5 | seul | 3 séances/sem |  |
| cav-service-33-3 | PTV cavité (isodose 70 %) | 23.1 | 3 | 7.7 | seul | J1, J3, J5 | 11 Gy par séance à l'isocentre (33 Gy) |
| itc-30-10 | PTV encéphale | 30 | 10 | 3 | seul | 5 fx/sem | Bon état général, survie attendue prolongée (fiche du service) |
| itc-20-5 | PTV encéphale | 20 | 5 | 4 | seul | 5 fx/sem | Altération de l'état général (fiche du service) |
| itc-ha-30-10 | PTV encéphale moins zone d'évitement | 30 | 10 | 3 | seul | 5 fx/sem | Mémantine pendant et après la RT |
| reirr-27-3 | PTV < 31 mm | 27 | 3 | 9 | seul | 3 séances/sem (J1, J3, J5) | Seulement après encéphale in toto, pas après stéréotaxie |
| reirr-24-3 | PTV < 31 mm | 24 | 3 | 8 | seul | 3 séances/sem (J1, J3, J5) | Après encéphale in toto ou après stéréotaxie |
| reirr-30-5 | PTV < 40 mm (en place) ou < 50 mm (opéré) | 30 | 5 | 6 | seul | 3 séances/sem |  |
| reirr-25-5 | PTV < 40 mm (en place) ou < 50 mm (opéré) | 25 | 5 | 5 | seul | 3 séances/sem |  |

**Tableau Schémas — liens** (même `id` que le tableau Schémas ; pas de jeu publié pour l'encéphale in toto sans épargne hippocampique)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| meta-srs-20-1 | Arcs dynamiques conformationnels ou VMAT non coplanaires (3 à 5 arcs), mono-isocentre si 2 à 4 lésions proches ; IGRT stéréotaxique à chaque séance | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-1fx ; ct-srs-hytec | PTV : V100 % ≥ 99 %, D50 % ≥ 115 %, Dmax 125–140 % de la dose prescrite ; CTV : D95 % ≥ 112 % (Curie) |
| meta-srs-rtog9005 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-1fx ; ct-srs-hytec | Dose prescrite en périphérie de la lésion |
| meta-srs-jlgk | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-1fx ; ct-srs-hytec | Dose prescrite en périphérie de la lésion |
| meta-srt-27-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-3fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| meta-srt-24-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-3fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| meta-srt-30-5 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-5fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| meta-srt-25-5 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-5fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| meta-srt-service-33-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-3fx ; ct-srs-hytec | PTV couvert par l'isodose 70 % |
| cav-27-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-meta-cavite | ct-srs-curie-3fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| cav-24-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-meta-cavite | ct-srs-curie-3fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| cav-30-5 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-meta-cavite | ct-srs-curie-5fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| cav-25-5 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-meta-cavite | ct-srs-curie-5fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| cav-service-33-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-meta-cavite | ct-srs-curie-3fx ; ct-srs-hytec | PTV couvert par l'isodose 70 % |
| itc-30-10 | RC3D ou VMAT, IGRT | Selon le primitif | sim-crane-itc | vol-meta-itc |  |  |
| itc-20-5 | RC3D ou VMAT, IGRT | Selon le primitif | sim-crane-itc | vol-meta-itc |  |  |
| itc-ha-30-10 | IMRT ou VMAT, IGRT quotidienne | Mémantine, voir Traitement systémique | sim-crane-itc | vol-meta-haitc | ct-ha-wbrt-rtog0933 | PTV : D2 % ≤ 37,5 Gy (40 Gy accepté), D98 % ≥ 25 Gy, V30 Gy ≥ 90 % (RTOG 0933) |
| reirr-27-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-3fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| reirr-24-3 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-3fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| reirr-30-5 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-5fx ; ct-srs-hytec | Comme meta-srs-20-1 |
| reirr-25-5 | Comme meta-srs-20-1 | Selon le primitif | sim-crane-srs | vol-crane-srs | ct-srs-curie-5fx ; ct-srs-hytec | Comme meta-srs-20-1 |

Indices de qualité en stéréotaxie (Curie) : indice de conformité RTOG entre 0,9 et 2 (déviation majeure au-delà), indice de gradient entre 3 et 6, indice d'homogénéité (Dmax / dose prescrite) ≥ 1,25.

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-crane-srs | Décubitus dorsal, tête en position neutre, bras le long du corps, coussin sous les genoux | Masque thermoformé 5 points ou cadre stéréotaxique (fiche du service) ; Curie : masque bivalve sans cadre, moulé sur une cale retirée avant l'acquisition | — | Coupes axiales millimétriques. Curie : non injecté, de 1 cm au-dessus du vertex jusqu'à T1 ; fiche du service : injecté | IRM de planification T1 sans injection (saignement récent), T1 gadolinium 3D (contourage) et perfusion (référence du suivi), jusqu'à C3–C4, fusionnée au scanner. Première séance dans les 14 jours suivant l'IRM, 16 au plus (Curie) | Plan de référence pointe du nez–tragus, perpendiculaire à la table (Curie) |
| sim-crane-itc | Décubitus dorsal | Masque thermoplastique | — | Injecté recommandé (fiche du service) | IRM fusionnée si disponible ; épargne hippocampique : hippocampes contourés sur l'IRM T1 fusionnée (RTOG 0933) | — |

## Contourage

Stéréotaxie selon Curie. La fiche du service prévoyait un PTV de 3 mm et une cavité sans marge (écarts E54 et E56).

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-crane-srs | GTV | GTV | Prise de contraste nodulaire en T1 gadolinium 3D, zoom maximal ; œdème FLAIR exclu ; composante hémorragique limitée incluse si le PTV reste compatible (Curie) | Toujours |  |
| vol-crane-srs | CTV | CTV | CTV = GTV | Toujours | 0 mm |
| vol-crane-srs | PTV | PTV | CTV + 1 mm isotrope (Curie, masque et Novalis) ; plus petit diamètre du PTV d'au moins 8 mm, sinon marge augmentée ; à adapter à la plateforme | Toujours | 1 mm |
| vol-meta-cavite | CTV | CTV | Lit opératoire (paroi externe de la cavité) + 1 mm isotrope + toute prise de contraste résiduelle ; ni œdème ni voie d'abord. Contact méningé initial : + 5 mm le long de la dure-mère ; contact d'un sinus veineux : + 1 à 5 mm le long du sinus (Curie) | Toujours | 1 mm |
| vol-meta-cavite | PTV | PTV | CTV + 1 mm isotrope (Curie) | Toujours | 1 mm |
| vol-meta-itc | CTV | CTV | Encéphale en totalité, de l'apex crânien au trou occipital (jonction crâne–C1, ou dernière coupe du cervelet) (fiche du service) | Toujours |  |
| vol-meta-itc | PTV | PTV | CTV + 5 mm (fiche du service) | Toujours | 5 mm |
| vol-meta-haitc | CTV | CTV | Encéphale en totalité, comme vol-meta-itc | Toujours |  |
| vol-meta-haitc | PTV | PTV | Encéphale moins la zone d'évitement hippocampique (hippocampes + 5 mm), sans autre marge (RTOG 0933) | Toujours | 0 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-crane-srs | oar-encephale-sain ; oar-encephale ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-bandelettes-optiques ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampe-d ; oar-hippocampe-g ; oar-hypophyse ; oar-canal-medullaire ; oar-nerfs-craniens (si concernés) ; oar-parotide-d ; oar-parotide-g | Procédure Curie (modèle « Volumes Stéréotaxie intracrânienne ») ; [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |
| vol-meta-cavite | oar-encephale-sain ; oar-encephale ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampe-d ; oar-hippocampe-g ; oar-hypophyse ; oar-canal-medullaire ; oar-nerfs-craniens (si concernés) | [Consensus cavité (Soliman 2018)](https://doi.org/10.1016/j.ijrobp.2017.09.047) |
| vol-meta-itc | oar-nerf-optique-d ; oar-nerf-optique-g ; oar-chiasma ; oar-cristallin-d ; oar-cristallin-g ; oar-oeil-d ; oar-oeil-g ; oar-tronc-cerebral ; oar-cervelet ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes (si contraintes) | Fiche du service (atlas RTOG, RECORAD) |
| vol-meta-haitc | oar-hippocampes ; oar-zone-evitement-hippocampique ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-cristallin-d ; oar-cristallin-g ; oar-oeil-d ; oar-oeil-g ; oar-tronc-cerebral ; oar-cochlee-d ; oar-cochlee-g | [Gondi 2010](https://doi.org/10.1016/j.ijrobp.2010.01.039) ; [NRG CC001](https://doi.org/10.1200/JCO.19.02767) |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| meta-itc | Mémantine 20 mg/j, débutée avec l'encéphale in toto, pendant 24 semaines | Mémantine (encéphale in toto) | rtog0614 ; nrg-cc001 | Retarde le déclin cognitif (HR 0,78) |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| meta-en-place | Les contraintes des OAR priment sur le choix de la dose et du fractionnement (Curie) |
| meta-en-place | Dose unique si PTV ≤ 20 mm, GTV à plus de 5 mm du tronc et du chiasma, hors zone critique ; sinon 3 ou 5 fractions (Curie) |
| meta-en-place | PTV de 50 mm ou plus : pas de stéréotaxie, RCMI (Curie) |
| meta-en-place | Radiochirurgie seule plutôt qu'avec l'encéphale in toto : déclin cognitif à 3 mois 63,5 vs 91,7 %, sans perte de survie (N0574) |
| meta-en-place | Lésion de plus de 2 cm : 27 Gy / 3 fx donne moins de radionécroses (9 vs 18 % à 1 an) et un meilleur contrôle que la dose unique (Minniti 2016) |
| meta-srt-service-33-3 | Dose inhomogène (11 Gy à l'isocentre, isodose 70 % sur le PTV) : meilleur contrôle local et moins de radionécroses qu'une dose homogène (Lucia 2019) |
| vol-crane-srs | Marge de 3 mm au lieu de 1 mm : pas de meilleur contrôle, plus de radionécroses (Kirkpatrick 2015) |
| meta-cavite | Stéréotaxie de la cavité : 72 vs 43 % sans récidive locale à 12 mois par rapport à la surveillance (MD Anderson) ; cognition mieux préservée qu'avec l'encéphale in toto (N107C) |
| vol-meta-cavite | Le consensus de 2018 inclut le trajet chirurgical entier et 5 à 10 mm le long de la dure-mère sous le volet ; Curie n'inclut pas la voie d'abord (Soliman 2018) |
| meta-itc | Épargne hippocampique avec mémantine : moins de déclin cognitif (HR 0,74), survie et contrôle intracrânien identiques (NRG CC001) |
| meta-itc | CBNPC non accessible à la stéréotaxie : 20 Gy / 5 fx n'allonge pas la survie par rapport aux soins de support (QUARTZ) |
| meta-itc | Après chirurgie ou radiochirurgie de 1 à 3 métastases, l'encéphale in toto réduit les récidives cérébrales sans allonger la durée d'autonomie (EORTC 22952) |
| meta-reirr | Nommer la lésion réirradiée avec le suffixe « bis » (PTV1bis) ; contrainte de recoupe avec la première irradiation (jeux Curie 3 et 5 fx) |
| sim-crane-srs | Contrôle Exactrac 6D table à 0° puis avant chaque arc ; décalage > 2 mm ou > 2° : replacer le patient ; traiter si < 0,5 mm et < 1° (Curie) |
| meta-en-place | Suivi : IRM à 3 mois, puis tous les 3 mois pendant au moins 2 ans (Curie) ; pronostic selon le score DS-GPA de l'histologie |
| meta-en-place | Respecter les délais entre RT et traitements systémiques (ANOCEF 2018) ; vigilance avec gemcitabine, anthracyclines et actinomycine D (Curie) |
