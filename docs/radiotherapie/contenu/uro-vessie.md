# Uro — Vessie

Mise à jour : 2026-10-22 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations : préservation vésicale N0, préservation vésicale avec atteinte ganglionnaire pelvienne, palliatif. Région `uro`, localisation `vessie`.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| ves-tmt | Préservation vésicale (traitement trimodal), cT2–T4a N0 M0 | en\_place | Carcinome urothélial infiltrant le muscle ; résection endoscopique (RTUV) la plus complète possible avant la RT ; patient non candidat à la cystectomie ou la refusant | 1 |
| ves-n1 | Préservation vésicale avec atteinte ganglionnaire pelvienne (cN1 M0) | en\_place | Adénopathie(s) pelvienne(s) au scanner, à l'IRM ou au TEP | 2 |
| ves-pall | Palliatif (hématurie, symptômes vésicaux) | palliatif | Patient non éligible à un traitement curatif (stade ou comorbidités) | 3 |

## Schémas et prescriptions

Cinq schémas. Tous : statut = valide, date\_verif = 2026-10-22. 55 Gy / 20 fx est le standard depuis la méta-analyse BC2001 + BCON (non inférieur à 64 Gy / 32 fx et meilleur contrôle locorégional invasif). Le schéma du service (pelvis 45 Gy puis boost) est gardé pour la situation cN1 : BC2001 n'irradiait pas le pelvis.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| ves-55-20 | ves-tmt | Vessie 55 Gy / 20 fx | rte\_hypo | essai\_phase3 | choudhury ; bc2001 |  |
| ves-64-32 | ves-tmt | Vessie 64 Gy / 32 fx | rte\_normo | essai\_phase3 | bc2001 ; choudhury |  |
| ves-pelv-65 | ves-n1 | Pelvis 45 Gy / 25 fx puis boost vessie et adénopathies 20 Gy / 10 fx (65 Gy) | rte\_normo | pratique\_institutionnelle |  | Fiche du service (Dr Bentahila) ; BC2001, cité par la fiche, ne traitait que la vessie |
| ves-pall-21-3 | ves-pall | Palliatif 21 Gy / 3 fx | rte\_hypo | essai\_phase3 | ba09 |  |
| ves-pall-35-10 | ves-pall | Palliatif 35 Gy / 10 fx | rte\_hypo | essai\_phase3 | ba09 |  |

**Tableau Prescriptions** (rattaché au schéma par schema\_id ; plusieurs lignes par schéma)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ves-55-20 | PTV\_VESSIE | 55 | 20 | 2.75 | seul | 5 fx/sem | Avec chimiothérapie concomitante si possible (BC2001) |
| ves-64-32 | PTV\_VESSIE | 64 | 32 | 2 | seul | 5 fx/sem |  |
| ves-pelv-65 | PTV1 (vessie + aires ganglionnaires) | 45 | 25 | 1.8 | sequentiel | 5 fx/sem |  |
| ves-pelv-65 | PTV2 (vessie + adénopathies résiduelles) | 20 | 10 | 2 | sequentiel | 5 fx/sem | Boost après les 45 Gy du PTV1 ; total sur la vessie 65 Gy (la fiche écrit 66 Gy : écart E26) |
| ves-pall-21-3 | PTV\_VESSIE | 21 | 3 | 7 | seul | 3 fx en 1 semaine | MRC BA09 |
| ves-pall-35-10 | PTV\_VESSIE | 35 | 10 | 3.5 | seul | 5 fx/sem | MRC BA09 |

**Tableau Schémas — liens** (même id que le tableau Schémas ; une cellule contraintes\_id vide = afficher « Contraintes à compléter »)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| ves-55-20 | VMAT, IGRT CBCT quotidien (remplissage vésical vérifié) | 5FU + mitomycine C (BC2001), voir « Traitement systémique associé » | sim-ves | vol-ves |  |  |
| ves-64-32 | VMAT, IGRT CBCT quotidien | Comme ves-55-20 | sim-ves | vol-ves | ct-quantec-grele |  |
| ves-pelv-65 | VMAT, IGRT ; scanner de centrage non injecté (fiche) | Chimiothérapie concomitante selon le protocole en vigueur (fiche) | sim-ves | vol-ves-service | ct-quantec-grele |  |
| ves-pall-21-3 | RC3D ou VMAT | Aucune | sim-ves | vol-ves-pall |  |  |
| ves-pall-35-10 | RC3D ou VMAT | Aucune | sim-ves | vol-ves-pall |  |  |

Aucun jeu de contraintes vessie publié dans nos sources : seul le jeu intestin grêle QUANTEC (fractionnement classique) est lié. Les contraintes hypofractionnées (55 Gy / 20 fx) restent à compléter par le médecin.

## Curiethérapie

Pas de curiethérapie vésicale dans le référentiel (aucune source fournie ni recommandation retenue). Afficher « Pas de curiethérapie pour cette localisation » dans l'onglet Curiethérapie.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-ves | Décubitus dorsal | Positionnement reproductible, repères cutanés stables | Vessie partiellement remplie, consignes mictionnelles expliquées au patient ; rectum le plus vide possible (suppositoire de glycérine le matin du scanner) | Non injecté (fiche du service) | Cartographie de la RTUV, scanner, IRM ou TEP du bilan pour la tumeur et les ganglions |  |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-ves | GTV\_T | GTV | Tumeur vésicale visible (scanner, IRM) et site de résection d'après le compte rendu de RTUV | Si visible |  |
| vol-ves | CTV\_VESSIE | CTV | Vessie entière (paroi externe) + extension extravésicale visible | Toujours |  |
| vol-ves | PTV\_VESSIE | PTV | CTV\_VESSIE + marge | Toujours | Fiche du service : 1 cm, 2 cm vers le haut ; marge de BC2001 non relevée dans le résumé (à confirmer) |
| vol-ves-service | CTV\_T | CTV | Vessie en totalité | Toujours |  |
| vol-ves-service | CTV\_N | CTV | Obturatrices, iliaques internes et externes droites et gauches, présacrées | Toujours |  |
| vol-ves-service | PTVT1 | PTV | CTV\_T + 1 cm dans toutes les directions sauf 2 cm vers la tête | Toujours | 1 cm (2 cm crânial) |
| vol-ves-service | PTVN1 | PTV | CTV\_N + 5 mm | Toujours | 5 mm |
| vol-ves-service | PTVN2 | PTV | GTV\_N + 5 mm | Ganglion résiduel | 5 mm |
| vol-ves-pall | CTV | CTV | Vessie (ou tumeur vésicale) | Toujours |  |
| vol-ves-pall | PTV | PTV | CTV + marge selon l'IGRT | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-ves | oar-rectum (de la jonction ano-rectale à la charnière recto-sigmoïdienne, fiche) ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-queue-cheval ; oar-oge | RTOG 2012, OAR du pelvis |
| vol-ves-service | Comme vol-ves | Fiche du service |
| vol-ves-pall | oar-rectum ; oar-grele | RTOG 2012, OAR du pelvis |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | essai\_ids | note |
| --- | --- | --- | --- |
| Préservation vésicale | 5FU 500 mg/m²/j pendant les fractions 1 à 5 et 16 à 20 + mitomycine C 12 mg/m² à J1 | bc2001 | Survie sans maladie locorégionale à 2 ans : RCT 67 %, RT seule 54 % ; pas d'augmentation significative de la toxicité |
| Palliatif | Aucun | ba09 |  |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| vessie | 55 Gy / 20 fx est non inférieur à 64 Gy / 32 fx et meilleur pour le contrôle locorégional invasif (HR 0,71), toxicité identique (méta-analyse BC2001 + BCON) |
| vessie | Remplissage vésical reproductible chaque jour ; vérifier vessie et grêle sur le CBCT (fiche) |
| vessie | Volume réduit (dose pleine sur la tumeur, 80 % sur le reste de la vessie) : pas de réduction de la toxicité démontrée dans BC2001 ; la vessie entière reste la référence |
| ves-pelv-65 | Total 65 Gy (45 + 20), pas 66 Gy ; irradiation pelvienne propre au service, gardée pour les cN1 |
| ves-pelv-65 | Bien distinguer PTV ganglionnaire prophylactique et PTV ganglionnaire boosté (fiche) |
| vessie | IHF2SQ (deux séances par jour, sujets de plus de 75 ans, groupe 2 de Balducci) : cité par la fiche sans dose ni source pour la vessie ; le schéma IHF2SQ publié est un schéma ORL palliatif. Non intégré (écart E27) ; le médecin peut l'ajouter avec sa source |
| ves-pall | MRC BA09 : 21 Gy / 3 fx aussi efficace que 35 Gy / 10 fx sur les symptômes à 3 mois (64 % vs 71 %, différence non significative) |
