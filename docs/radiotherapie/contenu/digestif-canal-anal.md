# Digestif — Canal anal

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Carcinome épidermoïde du canal anal, traité par radiochimiothérapie exclusive. Deux situations selon l'extension. Région `digestif`, localisation `canal_anal`.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| anal-precoce | Tumeur limitée T1–T2 N0 | en\_place | Carcinome épidermoïde T1 ou T2 N0 M0 | 1 |
| anal-avance | Tumeur localement avancée T3–T4 ou N+ | en\_place | T3–T4 ou atteinte ganglionnaire, M0 ; ACCORD 03 : tumeur ≥ 4 cm, ou < 4 cm et N1–N3 | 2 |

## Schémas et prescriptions

Six schémas. Tous : statut = `valide`, date\_verif = 2026-10-23. Le schéma du service (45 Gy puis complément jusqu'à 59,4 Gy) correspond au bras de référence d'ACCORD 03 (45 Gy + 15 Gy) ; l'escalade du complément à 20–25 Gy n'apporte rien.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| anal-service-avance | anal-avance | RCT 45 Gy / 25 fx puis complément jusqu'à 59,4 Gy (33 fx) | rte\_normo | essai\_phase3 | accord03 ; rtog9811 ; act2 | Fiche du service |
| anal-service-t1n0 | anal-precoce | RCT 45 Gy / 25 fx puis complément jusqu'à 59,4 Gy, sans aires ganglionnaires si T1 N0 | rte\_normo | pratique\_institutionnelle | accord03 ; agitg-atlas | Fiche du service |
| anal-act2-504 | anal-avance | RCT 50,4 Gy / 28 fx + 5FU-mitomycine (ACT II) | rte\_normo | essai\_phase3 | act2 |  |
| anal-agitg-54-30 | anal-avance | IMRT avec boost intégré : 54 Gy / 30 fx sur la maladie macroscopique, 45 Gy sur les aires électives | rte\_normo | recommandation | agitg-atlas ; rtog0529 |  |
| anal-rtog0529-t2n0 | anal-precoce | IMRT dose-painting T2 N0 : 50,4 Gy tumeur / 42 Gy électif en 28 fx (RTOG 0529) | rte\_normo | option | rtog0529 |  |
| anal-rtog0529-t34 | anal-avance | IMRT dose-painting T3–T4 ou N+ : 54 Gy tumeur, 50,4–54 Gy adénopathies, 45 Gy électif en 30 fx (RTOG 0529) | rte\_normo | option | rtog0529 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| anal-service-avance | PTV BR (canal anal, fosses ischio-rectales, aires ganglionnaires) | 45 | 25 | 1.8 | sequentiel | 5 fx/sem | 5FU + mitomycine |
| anal-service-avance | PTV HR (tumeur et adénopathies) | 14.4 | 8 | 1.8 | sequentiel | 5 fx/sem | Complément après 45 Gy : total 59,4 Gy en 33 fx. ACCORD 03 : 45 Gy + 15 Gy (bras de référence) |
| anal-service-t1n0 | PTV BR (canal anal, fosses ischio-rectales ; pas d'aires ganglionnaires) | 45 | 25 | 1.8 | sequentiel | 5 fx/sem | Tumeur de la jonction ano-rectale : ajouter le mésorectum |
| anal-service-t1n0 | PTV HR (tumeur) | 14.4 | 8 | 1.8 | sequentiel | 5 fx/sem | Total 59,4 Gy |
| anal-act2-504 | PTV (tumeur primitive) | 50.4 | 28 | 1.8 | seul | 5 fx/sem | Dose reçue par les aires ganglionnaires électives selon le protocole ACT II (non détaillée ici) |
| anal-agitg-54-30 | PTV maladie macroscopique (tumeur + adénopathies) | 54 | 30 | 1.8 | SIB | 5 fx/sem | Avec chimiothérapie |
| anal-agitg-54-30 | PTV électif (aires ganglionnaires) | 45 | 30 | 1.5 | SIB | 5 fx/sem |  |
| anal-rtog0529-t2n0 | PTV tumeur | 50.4 | 28 | 1.8 | SIB | 5 fx/sem | 5FU + mitomycine J1 et J29 |
| anal-rtog0529-t2n0 | PTV électif | 42 | 28 | 1.5 | SIB | 5 fx/sem |  |
| anal-rtog0529-t34 | PTV tumeur | 54 | 30 | 1.8 | SIB | 5 fx/sem | 5FU + mitomycine J1 et J29 |
| anal-rtog0529-t34 | PTV\_N adénopathie > 3 cm | 54 | 30 | 1.8 | SIB | 5 fx/sem |  |
| anal-rtog0529-t34 | PTV\_N adénopathie ≤ 3 cm | 50.4 | 30 | 1.68 | SIB | 5 fx/sem |  |
| anal-rtog0529-t34 | PTV électif | 45 | 30 | 1.5 | SIB | 5 fx/sem |  |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| anal-service-avance | IMRT ou VMAT, IGRT quotidienne | 5FU + mitomycine, voir « Traitement systémique associé » | sim-anal | vol-anal | ct-service-anal ; ct-quantec-grele |  |
| anal-service-t1n0 | IMRT ou VMAT, IGRT quotidienne | 5FU + mitomycine | sim-anal | vol-anal | ct-service-anal ; ct-quantec-grele | Comme anal-service-avance |
| anal-act2-504 | Selon le protocole de l'essai | 5FU + mitomycine 12 mg/m² | sim-anal | vol-anal-agitg | ct-service-anal ; ct-quantec-grele |  |
| anal-agitg-54-30 | IMRT, IGRT quotidienne | 5FU + mitomycine | sim-anal | vol-anal-agitg | ct-service-anal ; ct-quantec-grele |  |
| anal-rtog0529-t2n0 | IMRT dose-painting, contrôle qualité avant traitement | 5FU + mitomycine J1 et J29 | sim-anal | vol-anal-agitg | ct-service-anal ; ct-quantec-grele | Isodose de prescription sur au moins 90 % du PTV tumeur, 85 % du PTV électif (RTOG 0529) |
| anal-rtog0529-t34 | IMRT dose-painting, contrôle qualité avant traitement | 5FU + mitomycine J1 et J29 | sim-anal | vol-anal-agitg | ct-service-anal ; ct-quantec-grele | Isodose de prescription sur au moins 90 % des PTV tumeur et adénopathies, 85 % du PTV électif (RTOG 0529) |

Aucun jeu publié propre au canal anal : le tableau de contraintes de RTOG 0529 n'est pas dans le texte accessible. Tous les schémas sont donc liés au tableur du service « Canal anal » (`verification` = `service`), puis au jeu QUANTEC grêle. Le tableur prévoit 36 Gy / 20 fx sur le pelvis, la fiche 45 Gy / 25 fx (écart E36) : seules ses contraintes sont reprises.

## Curiethérapie

Pas de curiethérapie du canal anal dans le référentiel. Afficher « Pas de curiethérapie pour cette localisation » dans l'onglet Curiethérapie.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-anal | Décubitus dorsal | Immobilisation pelvienne standard | Vessie mi-pleine (reproductibilité) ; rectum le plus vide possible, sans lavement traumatique | Injecté (repérage vasculaire) ; inclure les aines | IRM pelvienne pré-thérapeutique T2 sagittale + axiale oblique : fusion obligatoire ; TEP-TDM pour les ganglions | Fil plombé sur la marge anale (impératif) ; marqueurs vaginal, prostatique ou des fosses ischio-rectales si atteinte |

## Contourage

Deux jeux : celui de la fiche du service (CTV haut risque et bas risque) et celui de l'atlas AGITG, utilisé par les schémas à boost intégré. Le volume tumoral de référence est le volume initial, avant tout traitement.

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-anal | GTV\_T | GTV | Tumeur primitive (IRM + examen clinique + endoscopie), volume initial | Toujours |  |
| vol-anal | GTV\_N# | GTV | Adénopathies visibles (IRM ± TEP), une structure par ganglion | Si adénopathie |  |
| vol-anal | CTV\_T\_HR (59,4 Gy) | CTV | GTV\_T + 1 cm en latéral et en antéro-postérieur, 1,5 cm en cranio-caudal ; canal anal en totalité. Si atteinte : cloison recto-vaginale → toute la paroi vaginale postérieure ; prostate ou vésicules séminales → en totalité ; fosse ischio-rectale → fosse entière ; marge anale cutanée → 2,5 cm de peau ; abcès drainé → lit de l'abcès et trajet de drainage | Toujours | 1 cm (1,5 cm cranio-caudal) |
| vol-anal | CTV\_N\_HR | CTV | GTV\_N + 0,5 cm, toujours inclus dans le CTV\_N\_BR | Si adénopathie | 5 mm |
| vol-anal | CTV\_T\_BR (45 Gy) | CTV | Canal anal entier (de la marge anale à la jonction ano-rectale) + fosses ischio-rectales entières des deux côtés + cloison recto-vaginale ou prostate en regard du GTV ; sans CTV\_T\_HR : cloison recto-vaginale + moitié interne des fosses ischio-rectales ; rectum seulement si atteinte rectale documentée ; doit contenir le CTV\_T\_HR | Toujours |  |
| vol-anal | CTV\_N\_BR (45 Gy) | CTV | Iliaques internes, iliaques externes, inguinaux des deux côtés, présacrés du promontoire au coccyx ; doit contenir le CTV\_N\_HR | T2 et plus ou N+ (fiche : « > T2 N0 », voir écart E37) ; T1 N0 : pas d'aires ganglionnaires, sauf tumeur de la jonction ano-rectale (mésorectum) |  |
| vol-anal | PTV\_HR | PTV | (CTV\_T\_HR + CTV\_N\_HR) + 5 mm | Toujours | 5 mm |
| vol-anal | PTV\_BR | PTV | (CTV\_T\_BR + 5 mm) + (CTV\_N\_BR + 7 mm) ; rester à distance de la peau (fiche : « < 5 mm de la surface cutanée ») sauf atteinte cutanée, avec ajustement manuel vulve, marge anale, périnée | Toujours | 5 mm (T), 7 mm (N) |
| vol-anal-agitg | GTV | GTV | Tumeur primitive et adénopathies | Toujours |  |
| vol-anal-agitg | CTV primitif | CTV | GTV tumoral + 20 mm en respectant les barrières anatomiques | Toujours | 20 mm |
| vol-anal-agitg | CTV ganglionnaire | CTV | Adénopathie + 10 à 20 mm | Si adénopathie | 10 à 20 mm |
| vol-anal-agitg | CTV électif | CTV | Aires ganglionnaires (vaisseaux + 7 mm) : toutes, à tous les stades ; on peut exclure les inguinaux et le haut pelvis seulement pour certains T1 N0 | Toujours | 7 mm |
| vol-anal-agitg | PTV | PTV | CTV + 5 à 10 mm | Toujours | 5 à 10 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-anal | oar-vessie ; oar-grele (fiche : grêle + côlon jusqu'à 1 cm au-dessus du PTV HR) ; oar-sigmoide ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-queue-cheval ; oar-oge ; oar-vulve (si atteinte ou proximité) ; oar-moelle-osseuse ; oar-plis-inguinaux | AGITG 2012 ; RTOG 2009, CTV ano-rectaux |
| vol-anal-agitg | oar-vessie ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-oge ; oar-moelle-osseuse | AGITG 2012 |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | essai\_ids | note |
| --- | --- | --- | --- |
| Tous stades | 5FU 1000 mg/m²/j J1–J4 et J29–J32 + mitomycine C 12 mg/m² J1 | act2 ; rtog9811 | Standard. ACT II : réponse complète à 26 semaines identique avec le cisplatine (90,5 % vs 89,6 %) mais 5FU-mitomycine reste la référence ; pas de bénéfice d'un traitement d'entretien |
| Tous stades | Pas de chimiothérapie d'induction | rtog9811 ; accord03 | RTOG 98-11 : induction + 5FU-cisplatine inférieure (SSM à 5 ans 57,8 % vs 67,8 %, SG 70,7 % vs 78,3 %) ; ACCORD 03 : pas de gain de survie sans colostomie |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| canal\_anal | Pas de chimiothérapie d'induction ni de complément à haute dose (20–25 Gy) : aucun bénéfice dans ACCORD 03 |
| canal\_anal | IMRT dose-painting : moins de toxicité hématologique G2+, digestive G3+ et cutanée G3+ qu'avec la technique de RTOG 98-11 ; 81 % des plans ont dû être refaits au contrôle qualité (RTOG 0529) : faire relire les contours |
| canal\_anal | La fiche du service liste le canal anal parmi les OAR à contourer : c'est une cible ici (copie de la fiche rectum) |
| canal\_anal | Le tableur du service prévoit 36 Gy / 20 fx sur le pelvis, la fiche 45 Gy / 25 fx (écart E36) ; la fiche est retenue (ACCORD 03, AGITG : 45 Gy électif) |
| canal\_anal | Vérifier que le CTV HR est inclus dans le CTV BR ; iliaques communes non incluses en routine sauf N+ latéral |
