# Os et palliatif — Métastases osseuses

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `os_palliatif`, localisation `metastases_osseuses`. RT externe palliative conventionnelle. Stéréotaxie : onglet « Os et palliatif — Stéréotaxie osseuse » ; réirradiation : onglet « Os et palliatif — Réirradiation ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| mo-douleur | Métastase osseuse douloureuse non compliquée | palliatif | Douleur d'une ou plusieurs métastases osseuses, sans compression médullaire ni fracture à stabiliser | 1 |
| mo-compression | Compression médullaire métastatique | palliatif | Discuter d'abord la chirurgie de décompression (Patchell 2005) ; RT seule si chirurgie non indiquée ; RT post-opératoire après décompression | 2 |

## Schémas et prescriptions

Huit schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| mo-8-1 | mo-douleur | RT 8 Gy en 1 fx | rte\_hypo | essai\_phase3 | rtog9714 ; dutch-bms ; chow2012-os ; astro-os-2017 |  |
| mo-20-5 | mo-douleur | RT 20 Gy / 5 fx | rte\_hypo | essai\_phase3 | sc24 ; chow2012-os |  |
| mo-24-6 | mo-douleur | RT 24 Gy / 6 fx | rte\_hypo | essai\_phase3 | dutch-bms |  |
| mo-30-10 | mo-douleur | RT 30 Gy / 10 fx | rte\_hypo | essai\_phase3 | rtog9714 ; chow2012-os |  |
| mc-postop-30-10 | mo-compression | RT post-opératoire 30 Gy / 10 fx après décompression | rte\_hypo | essai\_phase3 | patchell2005 |  |
| mc-8-1 | mo-compression | RT 8 Gy en 1 fx | rte\_hypo | essai\_phase3 | scorad3 |  |
| mc-20-5 | mo-compression | RT 20 Gy / 5 fx | rte\_hypo | essai\_phase3 | scorad3 ; score2 |  |
| mc-30-10 | mo-compression | RT 30 Gy / 10 fx | rte\_hypo | essai\_phase3 | score2 ; patchell2005 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mo-8-1 | PTV | 8 | 1 | 8 | seul | 1 séance | Même antalgie que 30 Gy / 10 fx ou 24 Gy / 6 fx ; plus de retraitements (18 vs 9 %, RTOG 97-14 ; 25 vs 7 %, étude néerlandaise) |
| mo-20-5 | PTV | 20 | 5 | 4 | seul | 5 fx/sem | Bras de référence de SC.24 |
| mo-24-6 | PTV | 24 | 6 | 4 | seul | 4 Gy par fraction | Bras de l'étude néerlandaise ; réponse antalgique identique à 8 Gy |
| mo-30-10 | PTV | 30 | 10 | 3 | seul | 5 fx/sem | Moins de retraitements, plus de toxicité aiguë de grade 2–4 (17 vs 10 %) |
| mc-postop-30-10 | PTV | 30 | 10 | 3 | seul | 5 fx/sem | Chirurgie + RT : 84 % de patients marchant contre 57 % avec la RT seule |
| mc-8-1 | PTV | 8 | 1 | 8 | seul | 1 séance | Marche à 8 semaines 69,3 vs 72,7 % avec 20 Gy / 5 fx : non-infériorité non démontrée de justesse à 8 semaines, démontrée aux autres temps |
| mc-20-5 | PTV | 20 | 5 | 4 | seul | 5 jours consécutifs | Bras de référence de SCORAD III ; SCORE-2 : réponse motrice à 1 mois 87,2 % avec 4 Gy × 5 contre 89,6 % avec 30 Gy / 10 fx |
| mc-30-10 | PTV | 30 | 10 | 3 | seul | 5 fx/sem (2 semaines) | Survie sans progression locale à 6 mois 81,8 vs 75,2 % avec 4 Gy × 5 |

**Tableau Schémas — liens** (même `id` que le tableau Schémas ; pas de jeu de contraintes publié pour ces schémas palliatifs dans la bibliothèque)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| mo-8-1 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |
| mo-20-5 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |
| mo-24-6 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |
| mo-30-10 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |
| mc-postop-30-10 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |
| mc-8-1 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |
| mc-20-5 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |
| mc-30-10 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service |  |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-mo-service | Position reproductible ; bras au-dessus de la tête si possible pour les côtes et le rachis dorsal | Immobilisation adaptée (matelas coque si nécessaire) | — | Scanner de centrage | — | Lésions palpables cerclées ; repères plombés aux limites supérieure et inférieure d'une douleur élective à la palpation (rachis, côtes, sternum) |

## Contourage

Fiche du service « contourage des métastases osseuses ».

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-mo-service | GTV | GTV | Lésion visible au scanner avec son extension osseuse complète, l'extension aux parties molles et la composante épidurale | Toujours |  |
| vol-mo-service | CTV (rachis) | CTV | Corps vertébral atteint ; pédicules et arc postérieur s'ils sont atteints ; tout le compartiment postérieur en cas d'atteinte pédiculaire | Rachis |  |
| vol-mo-service | CTV (os long) | CTV | Totalité du segment osseux atteint ; marges longitudinales adaptées au risque fracturaire | Os long |  |
| vol-mo-service | PTV | PTV | CTV + 7 mm (protocole du service) | Toujours | 7 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-mo-service | oar-poumon-d ; oar-poumon-g ; oar-coeur ; oar-moelle ; oar-queue-cheval ; oar-rectum ; oar-vessie ; oar-rein-d ; oar-rein-g ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-oesophage ; oar-foie |  |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ces schémas.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| mo-douleur | Méta-analyse : réponse globale 60 % (fraction unique) contre 61 % (fractions multiples), réponse complète 23 contre 24 % ; risque de réirradiation 2,6 fois plus élevé après fraction unique (Chow 2012) |
| mo-douleur | La fraction unique peut être délivrée sur le rachis avec une toxicité tardive acceptable (ASTRO 2017) |
| mo-compression | Chirurgie de décompression puis RT : plus de patients marchent (84 contre 57 %) et marchent plus longtemps (médiane 122 contre 13 jours) ; 62 % des patients non ambulatoires remarchent contre 19 % (Patchell 2005) |
| metastases\_osseuses | Fiche du service : contourage des volumes et OAR sans schéma de dose ; les schémas viennent des essais cités |
