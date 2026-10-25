# Os et palliatif — Réirradiation

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Six situations. Région `os_palliatif`, localisation `reirradiation`. Réirradiation en territoire déjà irradié, par localisation. SBRT de réirradiation du rachis : onglet « Os et palliatif — Stéréotaxie osseuse ».

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| re-orl-postop | Récidive ORL opérée : réirradiation post-opératoire | reirradiation | Récidive ou second primitif en territoire irradié, chirurgie de rattrapage macroscopiquement complète, pas de séquelle majeure de la première RT, bon état général, pas de métastase (GETTEC-GORTEC) | 1 |
| re-orl-exclusif | Récidive ORL non résécable | reirradiation | Carcinome épidermoïde récidivant ou second primitif en territoire irradié, non résécable (RTOG 9610, RTOG 9911) | 2 |
| re-gbm | Glioblastome en récidive | reirradiation | Progression à 6 mois ou plus de la fin de la radiochimiothérapie (RTOG 1205) | 3 |
| re-sein | Récidive mammaire homolatérale après traitement conservateur | reirradiation | Récidive unifocale de moins de 3 cm, plus d'un an après chirurgie conservatrice et RT du sein, seconde tumorectomie à berges saines, N0 clinique (RTOG 1014) | 4 |
| re-rectum | Récidive pelvienne d'un cancer du rectum déjà irradié | reirradiation | Récidive pelvienne prouvée, sans maladie extrapelvienne ni atteinte osseuse ; RT pelvienne antérieure ≤ 55 Gy ; Karnofsky ≥ 60 (Valentini 2006) | 5 |
| re-os | Métastase osseuse douloureuse déjà irradiée | reirradiation | Douleur d'au moins 2 points (Brief Pain Inventory) sur une métastase osseuse déjà irradiée (SC.20) | 6 |

## Schémas et prescriptions

Dix schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| re-orl-postop-60-30 | re-orl-postop | RT post-opératoire 60 Gy / 30 fx + 5-FU et hydroxyurée | rte\_normo | essai\_phase3 | janot2008-reirr ; decrevoisier2001 |  |
| re-orl-rtog9610 | re-orl-exclusif | RT 60 Gy / 40 fx (1,5 Gy × 2/j) en 4 cycles + 5-FU et hydroxyurée | rte\_normo | option | rtog9610 |  |
| re-orl-rtog9911 | re-orl-exclusif | RT 60 Gy / 40 fx (1,5 Gy × 2/j) une semaine sur deux + cisplatine et paclitaxel | rte\_normo | option | rtog9911 |  |
| re-orl-rcmi-60 | re-orl-exclusif | RCMI 60 Gy / 30 fx ± chimiothérapie | rte\_normo | option | miri-ward2018 ; lee2007-reirr ; decrevoisier1998 ; vargo2018 |  |
| re-gbm-35-10 | re-gbm | RT 35 Gy / 10 fx + bévacizumab | rte\_hypo | option | rtog1205 ; fogh2010 |  |
| re-sein-45-30 | re-sein | Irradiation partielle du sein 45 Gy / 30 fx (1,5 Gy × 2/j) | rte\_normo | option | rtog1014 |  |
| re-rectum-30-108 | re-rectum | RT 30 Gy / 25 fx puis complément 10,8 Gy / 9 fx (1,2 Gy × 2/j) + 5-FU continu | rte\_normo | option | valentini2006 ; guren2014 |  |
| re-os-8-1 | re-os | RT 8 Gy en 1 fx | rte\_hypo | essai\_phase3 | sc20 |  |
| re-os-20-5 | re-os | RT 20 Gy / 5 fx | rte\_hypo | essai\_phase3 | sc20 ; tsang2015 |  |
| re-os-20-8 | re-os | RT 20 Gy / 8 fx | rte\_hypo | essai\_phase3 | sc20 ; tsang2015 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| re-orl-postop-60-30 | PTV | 60 | 30 | 2 | seul | Étalée sur 11 semaines (cycles) | Survie sans maladie améliorée (HR 1,68), SG non différente ; toxicité tardive de grade 3–4 à 2 ans 39 contre 10 % |
| re-orl-rtog9610 | PTV | 60 | 40 | 1.5 | seul | 4 cycles d'une semaine : 1,5 Gy × 2/j pendant 5 jours | SG à 2 ans 15,2 % ; toxicité aiguë de grade 5 : 7,6 % |
| re-orl-rtog9911 | PTV | 60 | 40 | 1.5 | seul | 1,5 Gy × 2/j pendant 5 jours, toutes les 2 semaines, 4 cycles | SG à 2 ans 25,9 % ; 8 % de décès liés au traitement |
| re-orl-rcmi-60 | PTV | 60 | 30 | 2 | seul | 5 fx/sem | MIRI : dose médiane 60 Gy, chimiothérapie chez 76 %, toxicité tardive de grade ≥ 3 à 2 ans 14,2 % ; Gustave Roussy : 2 Gy par jour |
| re-gbm-35-10 | PTV | 35 | 10 | 3.5 | seul | 10 séances | SSP médiane 7,1 contre 3,8 mois avec le bévacizumab seul ; SG 10,1 contre 9,7 mois |
| re-sein-45-30 | PTV | 45 | 30 | 1.5 | seul | 1,5 Gy × 2/j, 30 séances en 15 jours | Récidive dans le sein à 5 ans 5 % ; mastectomie 10 % ; toxicité tardive de grade 3 : 7 % |
| re-rectum-30-108 | PTV2 | 30 | 25 | 1.2 | sequentiel | 1,2 Gy × 2/j, au moins 6 h d'intervalle | GTV + 4 cm |
| re-rectum-30-108 | PTV1 | 10.8 | 9 | 1.2 | sequentiel | 1,2 Gy × 2/j, au moins 6 h d'intervalle | GTV + 2 cm ; 40,8 Gy au total ; chirurgie 6 à 8 semaines après la fin |
| re-os-8-1 | PTV | 8 | 1 | 8 | seul | 1 séance | Réponse globale à 2 mois (intention de traiter) 28 % contre 32 % avec 20 Gy : non inférieur ; moins de perte d'appétit et de diarrhée |
| re-os-20-5 | PTV | 20 | 5 | 4 | seul | 5 séances | Bras « 20 Gy en fractions multiples » de SC.20 |
| re-os-20-8 | PTV | 20 | 8 | 2.5 | seul | 8 séances | Bras « 20 Gy en fractions multiples » de SC.20 |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| re-orl-postop-60-30 | RT externe, RCMI de préférence | Voir Traitement systémique | sim-orl-curie | vol-re-orl | ct-reirr-moelle |  |
| re-orl-rtog9610 | RT externe (protocole de l'essai) | Voir Traitement systémique | sim-orl-curie | vol-re-orl | ct-reirr-moelle |  |
| re-orl-rtog9911 | RT externe (protocole de l'essai) | Voir Traitement systémique | sim-orl-curie | vol-re-orl | ct-reirr-moelle |  |
| re-orl-rcmi-60 | RCMI | Selon RCP | sim-orl-curie | vol-re-orl | ct-reirr-moelle |  |
| re-gbm-35-10 | RT conformationnelle ou stéréotaxie fractionnée | Voir Traitement systémique | sim-crane | vol-re-gbm |  |  |
| re-sein-45-30 | RT conformationnelle 3D | Aucune | sim-sein | vol-re-sein |  |  |
| re-rectum-30-108 | RT externe | Voir Traitement systémique | sim-rec | vol-re-rectum |  |  |
| re-os-8-1 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service | ct-reirr-moelle |  |
| re-os-20-5 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service | ct-reirr-moelle |  |
| re-os-20-8 | RT conformationnelle 3D | Aucune | sim-mo-service | vol-mo-service | ct-reirr-moelle |  |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Récidive mammaire homolatérale après tumorectomie de rattrapage | Curiethérapie interstitielle multicathéters, bas débit, débit pulsé ou haut débit | Étude multicentrique du groupe sein du GEC-ESTRO (Hannoun-Levi 2013) | Seconde récidive locale 5,6 % à 5 ans et 7,2 % à 10 ans ; complications de grade 3–4 : 11 % ; résultat esthétique bon ou excellent : 85 % |

## Centrage

Fiches `sim-orl-curie` (onglet « ORL — Cavité buccale »), `sim-crane` (onglet « SNC — Glioblastome »), `sim-sein` (onglet « Sein — Carcinome infiltrant »), `sim-rec` (onglet « Digestif — Rectum ») et `sim-mo-service` (onglet « Os et palliatif — Métastases osseuses »).

## Contourage

Métastases osseuses : volumes `vol-mo-service` (onglet « Os et palliatif — Métastases osseuses »).

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-re-orl | GTV | GTV | Récidive ou second primitif macroscopique | Réirradiation exclusive |  |
| vol-re-orl | CTV | CTV | Lit de résection de la récidive | Post-opératoire |  |
| vol-re-orl | PTV | PTV | Volume à limiter : le volume de la réirradiation est le seul facteur associé au risque de décès en analyse multivariée (de Crevoisier 1998) ; marge du centre | Toujours |  |
| vol-re-gbm | GTV | GTV | Récidive visible en IRM | Toujours |  |
| vol-re-gbm | PTV | PTV | GTV + marge du centre ; un petit GTV est associé à une meilleure survie (Fogh 2010) | Toujours |  |
| vol-re-sein | CTV | CTV | Lit de la seconde tumorectomie (irradiation partielle du sein) | Toujours |  |
| vol-re-sein | PTV | PTV | CTV + marge du centre | Toujours |  |
| vol-re-rectum | GTV | GTV | Récidive pelvienne | Toujours |  |
| vol-re-rectum | PTV2 | PTV | GTV + 4 cm | Premier temps (30 Gy) | 4 cm |
| vol-re-rectum | PTV1 | PTV | GTV + 2 cm | Complément (10,8 Gy) | 2 cm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-re-orl | oar-canal-medullaire ; oar-tronc-cerebral ; oar-carotide-d ; oar-carotide-g ; oar-mandibule ; oar-larynx ; oar-constricteurs ; oar-cavite-orale ; oar-parotide-d ; oar-parotide-g |  |
| vol-re-gbm | oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-encephale |  |
| vol-re-sein | oar-coeur ; oar-poumon-homolateral ; oar-sein-controlateral ; oar-peau |  |
| vol-re-rectum | oar-grele ; oar-vessie ; oar-colon ; oar-tete-femorale-d ; oar-tete-femorale-g |  |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| re-orl-postop | 5-fluorouracil et hydroxyurée concomitants à la RT | 5-FU + hydroxyurée concomitants (réirradiation ORL) | janot2008-reirr ; decrevoisier2001 | Doses selon le protocole de l'essai |
| re-orl-exclusif | 5-FU 300 mg/m² en bolus IV et hydroxyurée 1,5 g per os à chaque cycle de RT (4 cycles) | 5-FU + hydroxyurée concomitants (réirradiation ORL) | rtog9610 | Schéma re-orl-rtog9610 |
| re-orl-exclusif | Cisplatine 15 mg/m² IV J1–J5 et paclitaxel 20 mg/m² IV J1–J5, toutes les 2 semaines, 4 cycles | Cisplatine–paclitaxel concomitants (RTOG 9911) | rtog9911 | Schéma re-orl-rtog9911 |
| re-gbm | Bévacizumab 10 mg/kg IV toutes les 2 semaines, concomitant à la RT, jusqu'à progression | Bévacizumab (glioblastome en récidive) | rtog1205 | SSP à 6 mois 54,3 contre 29,1 % |
| re-rectum | 5-FU en perfusion continue 225 mg/m²/j, 7 j/7 pendant la RT ; raltitrexed adjuvant 3 mg/m² toutes les 3 semaines, 5 cycles | 5-FU continu concomitant à la RT (rectum) | valentini2006 | Chirurgie 6 à 8 semaines après la radiochimiothérapie |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| reirradiation | Classification et compte rendu des réirradiations : consensus ESTRO-EORTC (Andratschke 2022). Type 1 : recouvrement avec un volume déjà irradié ; type 2 : pas de recouvrement, mais toxicité cumulée possible |
| reirradiation | ORL, MIRI : classe I (plus de 2 ans depuis la première RT et tumeur réséquée) SG à 2 ans 61,9 % ; classe II (plus de 2 ans et non réséquée, ou 2 ans ou moins sans sonde d'alimentation ni trachéotomie) 40,0 % ; classe III 16,8 % (Ward 2018) |
| re-orl-exclusif | Survie meilleure si la réirradiation commence plus d'un an après la première RT : médiane 9,8 contre 5,8 mois (RTOG 9610) |
| re-orl-exclusif | SBRT de réirradiation ORL : survie comparable à la RCMI pour les petits volumes traités à 35 Gy ou plus ; moins de toxicité aiguë de grade ≥ 4 (0,5 contre 5,1 %) (Vargo 2018) |
| re-orl-exclusif | RCMI : contrôle locorégional à 2 ans 52 % contre 20 % sans RCMI (Lee 2007) ; 5 décès par hémorragie carotidienne dans la série de Gustave Roussy (de Crevoisier 1998) et 2 dans RTOG 9911 |
| re-gbm | Stéréotaxie hypofractionnée, médiane 35 Gy en fractions de 3,5 Gy : survie médiane 11 mois ; âge jeune et petit GTV associés à une meilleure survie (Fogh 2010) |
| re-sein | RTOG 1014 : conservation du sein chez 90 % des patientes ; survie sans métastase et SG à 5 ans 95 % |
| re-rectum | Revue : 30 à 40 Gy sur le GTV avec 2 à 4 cm de marge ; hyperfractionnement (1,2 à 1,5 Gy × 2/j) préférable quand une résection est possible (Guren 2014) |
| re-rectum | Survie à 5 ans 39,3 %, 66,8 % après résection R0 (Valentini 2006) |
| re-os | SC.20 en per-protocole : réponse 45 contre 51 %, non-infériorité non démontrée ; fractures pathologiques 7 contre 5 %, non significatif |
| ct-reirr-moelle | Doses cumulées en EQD2 ou en BED avec α/β = 2 Gy pour la moelle (Sahgal, HyTEC) ; Nieder 2006 prend 2 Gy pour la moelle cervicale et thoracique, 4 Gy pour la moelle lombaire |
