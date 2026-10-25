# Digestif — Pancréas

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `digestif`, localisation `pancreas`. Adénocarcinome canalaire. En localement avancé, la radiothérapie améliore le contrôle local sans gain de survie (LAP07, CONKO-007).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| panc-la | Localement avancé contrôlé après chimiothérapie d'induction | en\_place | Non résécable, sans progression après 4 mois de chimiothérapie (LAP07) | 1 |
| panc-neoadj | Résécable ou limite : traitement néoadjuvant | en\_place | Résécable ou limite (borderline), opérable | 2 |
| panc-adj | Tête du pancréas opérée : RCT adjuvante | post\_op | Résection à visée curative, sans progression après chimiothérapie adjuvante. Bénéfice limité aux N0 (RTOG 0848) | 3 |

## Schémas et prescriptions

Cinq schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| panc-lap07-54-30 | panc-la | RCT 54 Gy / 30 fx + capécitabine (LAP07) | rte\_normo | essai\_phase3 | lap07 ; conko007 | Fiche du service |
| panc-sbrt-33-5 | panc-la | SBRT 33 Gy / 5 fx | sbrt | option | herman ; a021501 ; hytec-pancreas |  |
| panc-smart-50-5 | panc-la | SBRT adaptative guidée par IRM 50 Gy / 5 fx | sbrt | option | smart-pancreas |  |
| panc-preopanc-36-15 | panc-neoadj | RCT néoadjuvante 36 Gy / 15 fx + gemcitabine (PREOPANC) | rte\_hypo | essai\_phase3 | preopanc ; preopanc-lt ; preopanc2 |  |
| panc-adj-504-28 | panc-adj | RCT adjuvante 50,4 Gy / 28 fx + capécitabine ou 5FU (RTOG 0848) | rte\_normo | essai\_phase3 | rtog0848 |  |

**Tableau Prescriptions**

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| panc-lap07-54-30 | PTV | 54 | 30 | 1.8 | seul | 5 fx/sem | Moins de progression locale (32 % vs 46 %), pas de gain de survie |
| panc-sbrt-33-5 | PTV | 33 | 5 | 6.6 | seul | 5 fx | Après gemcitabine (Herman) ; 33 à 40 Gy / 5 fx dans A021501 |
| panc-smart-50-5 | PTV | 50 | 5 | 10 | seul | 5 fx | Replanification à chaque séance sur IRM-linac |
| panc-preopanc-36-15 | PTV | 36 | 15 | 2.4 | seul | 5 fx/sem | Pendant le 2e cycle de gemcitabine |
| panc-adj-504-28 | PTV (lit opératoire, anastomose pancréato-jéjunale, ganglions régionaux) | 50.4 | 28 | 1.8 | seul | 5 fx/sem | Après 6 cycles de chimiothérapie |

**Tableau Schémas — liens**

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| panc-lap07-54-30 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-panc | vol-panc-crt | ct-abdo-acrop-crt |  |
| panc-sbrt-33-5 | SBRT, 4D ou blocage respiratoire, IGRT sur repères | Voir Traitement systémique | sim-panc | vol-panc-sbrt | ct-sbrt-abdo-5fx |  |
| panc-smart-50-5 | IRM-linac, adaptation quotidienne | Voir Traitement systémique | sim-panc | vol-panc-sbrt | ct-sbrt-abdo-5fx |  |
| panc-preopanc-36-15 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-panc | vol-panc-crt | ct-abdo-acrop-crt |  |
| panc-adj-504-28 | IMRT ou VMAT, IGRT quotidienne | Voir Traitement systémique | sim-panc | vol-panc-adj | ct-abdo-acrop-crt |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-panc | Décubitus dorsal, bras au-dessus de la tête | Matelas ou cale genoux | À jeun ; même préparation au scanner et à chaque séance | Injecté, phase pancréatique. Gating si l'apnée est tenue (fiche : au moins 45 s), sinon scanner 4D | Scanner, IRM et TEP du bilan, fusion obligatoire | OAR sur le scanner moyen ; GTV sur chaque phase du 4D |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-panc-crt | GTV | GTV | Tumeur primitive et ganglions radiologiquement augmentés, sur le scanner en phase pancréatique | Toujours |  |
| vol-panc-crt | CTV | CTV | Pas d'irradiation ganglionnaire élective en localement avancé. Tumeur > 3 cm : pas de CTV spécifique ; plus petite : discuter une marge | Selon la taille |  |
| vol-panc-crt | ITV | ITV | Réunion des GTV sur les phases du 4D | Scanner 4D |  |
| vol-panc-crt | PTV | PTV | ITV + 5 à 10 mm selon la mise en place du centre ; gating : GTV + 5 mm (fiche). Sans 4D : GTV + 1,5 cm en radial et au moins 2 cm en cranio-caudal | Toujours | 5–10 mm |
| vol-panc-sbrt | GTV | GTV | Tumeur primitive | Toujours |  |
| vol-panc-sbrt | ITV | ITV | Réunion des GTV sur le cycle respiratoire, pas de CTV | Respiration libre |  |
| vol-panc-sbrt | PTV | PTV | ITV + 0 à 5 mm selon les mesures du centre | Toujours | 0–5 mm |
| vol-panc-adj | CTV | CTV | Lit tumoral post-opératoire, anastomose pancréato-jéjunale, ganglions régionaux | Toujours |  |
| vol-panc-adj | PTV | PTV | CTV + marge selon le mouvement et l'IGRT | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-panc-crt | oar-duodenum ; oar-estomac ; oar-grele ; oar-colon ; oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle | ESTRO ACROP pancréas 2021 ; ESTRO ACROP aires ganglionnaires digestives hautes 2021 |
| vol-panc-sbrt | oar-duodenum ; oar-estomac ; oar-grele ; oar-colon ; oar-voie-biliaire ; oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle ; oar-gros-vaisseaux | ESTRO ACROP pancréas 2021 |
| vol-panc-adj | oar-duodenum ; oar-estomac ; oar-grele ; oar-foie ; oar-rein-d ; oar-rein-g ; oar-moelle | ESTRO ACROP pancréas 2021 |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| panc-la | Capécitabine pendant la RT (54 Gy) | Capécitabine concomitante à la RT (pancréas) | lap07 | Après 4 mois de chimiothérapie d'induction |
| panc-la | Gemcitabine avant la SBRT | Gemcitabine (pancréas) | herman |  |
| panc-neoadj | Gemcitabine : 3 cycles, le 2e avec la RT ; puis 4 cycles adjuvants | Gemcitabine concomitante à la RT (PREOPANC) | preopanc | FOLFIRINOX néoadjuvant : même survie (PREOPANC-2) |
| panc-neoadj | FOLFIRINOX néoadjuvant sans RT | FOLFIRINOX (pancréas) | preopanc2 ; a021501 | Alternative de même efficacité |
| panc-adj | Capécitabine ou 5FU en perfusion continue pendant la RT | Capécitabine concomitante à la RT (pancréas) | rtog0848 | Après 6 cycles de gemcitabine |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| pancreas | Localement avancé : la RCT diminue la progression locale mais pas la mortalité (LAP07, CONKO-007) |
| panc-lap07-54-30 | 54 Gy en 30 fractions de 1,8 Gy, 5 par semaine (écart E44 : la fiche écrit « 54 Gy en 5 fractions de 1,8 Gy/semaine ») |
| panc-sbrt-33-5 | Limite (borderline) : SBRT après mFOLFIRINOX moins bonne que mFOLFIRINOX seul dans A021501 (phase 2) |
| panc-smart-50-5 | Prudence si chirurgie après SMART, surtout avec résection vasculaire (2 décès postopératoires possiblement liés) |
| panc-adj | RTOG 0848 : pas de gain de survie globale ; gain de survie chez les N0 seulement |
| pancreas | Douleur : la SBRT soulage 85 % des patients (revue, doses médianes 28 Gy en 1 à 6 fx) |
