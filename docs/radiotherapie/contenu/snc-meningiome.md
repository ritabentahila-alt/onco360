# SNC — Méningiome

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations, selon le risque de l'essai RTOG 0539. Région `snc`, localisation `meningiome`. Le méningiome de bas risque (grade 1 après exérèse complète ou incomplète) relève de la surveillance.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| men-g1 | Méningiome grade 1 non opérable ou résidu évolutif | en\_place | Tumeur symptomatique ou évolutive ; une forme fortuite asymptomatique peut être surveillée (EANO 2021) | 1 |
| men-intermediaire | Risque intermédiaire : grade 2 après exérèse complète, ou grade 1 récidivant | post\_op | Grade 2 après exérèse Simpson I–III, ou grade 1 récidivant quelle que soit l'exérèse (RTOG 0539, groupe 2) | 2 |
| men-haut-risque | Haut risque : grade 3, grade 2 récidivant ou grade 2 après exérèse incomplète | post\_op | Grade 3 nouveau ou récidivant, grade 2 récidivant, grade 2 nouveau après exérèse incomplète (RTOG 0539, groupe 3) | 3 |

## Schémas et prescriptions

Sept schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| men-g1-54-30 | men-g1 | RT 54 Gy / 30 fx | rte\_normo | recommandation | eano-meningiome-2021 ; goldsmith1994 | Tableur du service « Méningiome bénin base du crâne 54 Gy » |
| men-g1-504-28 | men-g1 | RT 50,4 Gy / 28 fx | rte\_normo | pratique\_institutionnelle | eano-meningiome-2021 | Tableur du service « Méningiome 50,4 Gy » |
| men-g1-srs | men-g1 | Radiochirurgie 12 à 15 Gy en 1 séance | sbrt | recommandation | isrs-meningiome ; eano-meningiome-2021 |  |
| men-int-54-30 | men-intermediaire | RT 54 Gy / 30 fx (RTOG 0539) | rte\_normo | recommandation | rtog0539-int ; rtog0539-lt |  |
| men-int-60-30 | men-intermediaire | RT 60 Gy / 30 fx (EORTC 22042, grade 2 réséqué) | rte\_normo | option | eortc22042 |  |
| men-hr-60-54-30 | men-haut-risque | IMRT 60 Gy / 30 fx avec 54 Gy en SIB (RTOG 0539) | rte\_normo | recommandation | rtog0539-hr ; rtog0539-lt ; eano-meningiome-2021 |  |
| men-hr-service-684-38 | men-haut-risque | 59,4 Gy puis complément jusqu'à 68,4 Gy / 38 fx | rte\_normo | pratique\_institutionnelle |  | Tableur du service « Méningiome grade III 68,4 Gy » |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| men-g1-54-30 | PTV | 54 | 30 | 1.8 | seul | 5 fx/sem | Dose médiane de la série UCSF ; la dose minimale influe sur la SSP (Goldsmith 1994) |
| men-g1-504-28 | PTV | 50.4 | 28 | 1.8 | seul | 5 fx/sem | Pratique du service |
| men-g1-srs | PTV (dose marginale) | 12 | 1 | 12 | seul | 1 séance | 12 à 15 Gy selon le volume et les OAR (ISRS) |
| men-int-54-30 | PTV | 54 | 30 | 1.8 | seul | 5 fx/sem | SSP à 3 ans 93,8 %, à 10 ans 72,2 % |
| men-int-60-30 | PTV | 60 | 30 | 2 | seul | 5 fx/sem | Grade 2 après exérèse Simpson 1–3 : SSP à 3 ans 88,7 % |
| men-hr-60-54-30 | PTV60 | 60 | 30 | 2 | SIB | 5 fx/sem | SSP à 3 ans 58,8 %, à 10 ans 42,5 % |
| men-hr-60-54-30 | PTV54 | 54 | 30 | 1.8 | SIB | 5 fx/sem |  |
| men-hr-service-684-38 | PTV1 (59,4 Gy) | 59.4 | 33 | 1.8 | sequentiel | 5 fx/sem | Premier plan |
| men-hr-service-684-38 | PTV2 (complément) | 9 | 5 | 1.8 | sequentiel | 5 fx/sem | Total 68,4 Gy / 38 fx ; tableur établi pour une protonthérapie |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| men-g1-54-30 | IMRT ou VMAT, IGRT | Aucune | sim-crane | vol-men-g1 | ct-crane-igr ; ct-crane-quantec |  |
| men-g1-504-28 | IMRT ou VMAT, IGRT | Aucune | sim-crane | vol-men-g1 | ct-crane-igr ; ct-crane-quantec |  |
| men-g1-srs | Radiochirurgie, IGRT stéréotaxique | Aucune | sim-crane-srs | vol-crane-srs | ct-srs-igr-1fx ; ct-srs-hytec |  |
| men-int-54-30 | IMRT ou RC3D | Aucune | sim-crane | vol-men-int | ct-crane-igr ; ct-crane-quantec |  |
| men-int-60-30 | IMRT ou VMAT, IGRT | Aucune | sim-crane | vol-men-int | ct-crane-igr ; ct-crane-quantec |  |
| men-hr-60-54-30 | IMRT en SIB | Aucune | sim-crane | vol-men-hr | ct-crane-igr ; ct-crane-quantec |  |
| men-hr-service-684-38 | IMRT ou protonthérapie, deux plans | Aucune | sim-crane | vol-men-service-684 | ct-crane-igr ; ct-crane-quantec |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fractionnement classique : fiche `sim-crane` (onglet « SNC — Glioblastome »). Radiochirurgie : fiche `sim-crane-srs` (onglet « SNC — Métastases cérébrales »).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-men-g1 | GTV | GTV | Méningiome rehaussé en T1 gadolinium | Toujours |  |
| vol-men-g1 | CTV | CTV | GTV + 2 à 5 mm (tableur 50,4 Gy) ou 3 à 5 mm (tableur 54 Gy, écriture ambiguë : écart E60) | Toujours | 2–5 mm |
| vol-men-g1 | PTV | PTV | CTV + 3 mm (tableur 54 Gy) | Toujours | 3 mm |
| vol-men-int | GTV | GTV | Lit tumoral et toute prise de contraste nodulaire (IRM post-opératoire) | Toujours |  |
| vol-men-int | PTV | PTV | GTV + 8 à 15 mm, selon la localisation et la reproductibilité de la contention (marge totale de l'essai) | Toujours | 8–15 mm |
| vol-men-hr | GTV | GTV | Lit tumoral sur l'IRM post-opératoire, avec toute prise de contraste nodulaire (en récidive non réopérée : le site opératoire antérieur) ; os hyperostosique ou envahi inclus ; œdème et queue durale non inclus spécifiquement | Toujours |  |
| vol-men-hr | CTV60 | CTV | GTV + 10 mm | Toujours | 10 mm |
| vol-men-hr | CTV54 | CTV | GTV + 20 mm, réductible à 10 mm le long des barrières naturelles comme le crâne, sauf os hyperostosique ou envahi | Toujours | 20 mm |
| vol-men-hr | PTV60, PTV54 | PTV | CTV + 3 à 5 mm. OAR : PRV = OAR + 3 mm ; si la contrainte ne peut pas être tenue, PTV d'évaluation = intersection PTV–PRV | Toujours | 3–5 mm |
| vol-men-service-684 | GTV | GTV | Prise de contraste (gadolinium) | Toujours |  |
| vol-men-service-684 | CTV2 (68,4 Gy) | CTV | GTV + 2 mm | Toujours | 2 mm |
| vol-men-service-684 | CTV1 (59,4 Gy) | CTV | CTV2 + 2 à 10 mm | Toujours | 2–10 mm |
| vol-men-service-684 | PTV1, PTV2 | PTV | CTV + 3 mm | Toujours | 3 mm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-men-g1 | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes ; oar-hypophyse ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-cavite-orale ; oar-parotide-d ; oar-parotide-g ; oar-moelle ; oar-peau | [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |
| vol-men-int | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes ; oar-hypophyse ; oar-moelle | [RTOG 0539, risque intermédiaire](https://doi.org/10.3171/2016.11.JNS161170) |
| vol-men-hr | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes ; oar-hypophyse ; oar-moelle | [RTOG 0539, haut risque](https://doi.org/10.1016/j.ijrobp.2019.11.028) |
| vol-men-service-684 | oar-encephale-sain ; oar-tronc-cerebral ; oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-oeil-d ; oar-oeil-g ; oar-retine-d ; oar-retine-g ; oar-cristallin-d ; oar-cristallin-g ; oar-cochlee-d ; oar-cochlee-g ; oar-hippocampes ; oar-hypophyse ; oar-glande-lacrymale-d ; oar-glande-lacrymale-g ; oar-cavite-orale ; oar-parotide-d ; oar-parotide-g ; oar-moelle ; oar-peau | — |

## Traitement systémique associé

Pas de traitement systémique standard. Bévacizumab et inhibiteurs multikinases du VEGFR donnent les meilleurs résultats, modestes (EANO 2021).

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| meningiome | Grade 1 fortuit et asymptomatique, surtout chez le sujet âgé : surveillance possible (EANO 2021) |
| men-hr-60-54-30 | 92,9 % des progressions dans le PTV 54 Gy ; la queue durale n'est pas incluse spécifiquement (RTOG 0539) |
| men-hr-60-54-30 | 1 décès par nécrose à 1 an sur 53 patients ; toxicité G3+ 15,1 % à long terme (RTOG 0539) |
| men-g1-srs | Radiochirurgie recommandée pour le grade 1 (niveau II) ; contrôle local à 10 ans de 71 à 100 % (ISRS) |
| men-intermediaire | Grade 2 après exérèse complète : RT ou surveillance comparées dans ROAM/EORTC-1308 et NRG BN003 |
| men-hr-service-684-38 | Dose au-delà de 60 Gy non évaluée par RTOG 0539 ; tableur établi pour une protonthérapie (écart E61) |
