# SNC — Adénome hypophysaire

Mise à jour : 2026-10-24 · Statut de l'onglet : `valide`

## Situations cliniques

Deux situations. Région `snc`, localisation `hypophyse`.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| hyp-nf | Adénome non sécrétant résiduel ou récidivant | post\_op | Résidu évolutif ou récidive après chirurgie, y compris adénome volumineux ou invasif | 1 |
| hyp-secretant | Adénome sécrétant non contrôlé | post\_op | Adénome à GH, ACTH ou prolactine non contrôlé après chirurgie | 2 |

## Schémas et prescriptions

Trois schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| hyp-fsrt-45-25 | hyp-nf | RT stéréotaxique fractionnée 45 Gy / 25 fx | rte\_normo | option | minniti2015 ; minniti2006 |  |
| hyp-srs-15-1 | hyp-nf | Radiochirurgie 15 Gy en 1 séance | sbrt | recommandation | isrs-hypophyse ; hytec-optique |  |
| hyp-sec-fsrt-45-25 | hyp-secretant | RT stéréotaxique fractionnée 45 Gy / 25 fx | rte\_normo | option | minniti2006 ; isrs-hypophyse-secretant |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| hyp-fsrt-45-25 | PTV | 45 | 25 | 1.8 | seul | 5 fx/sem | Contrôle local 97 % à 5 ans, 91 % à 10 ans |
| hyp-srs-15-1 | PTV (dose marginale) | 15 | 1 | 15 | seul | 1 séance | Dose médiane des études (5 à 35 Gy) ; contrôle local 94 % à 5 ans, 83 % à 10 ans |
| hyp-sec-fsrt-45-25 | PTV | 45 | 25 | 1.8 | seul | 5 fx/sem | Hormones normalisées chez plus d'un tiers des adénomes à GH et à prolactine |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| hyp-fsrt-45-25 | RT stéréotaxique conformationnelle ou IMRT, IGRT quotidienne | Aucune | sim-crane | vol-hyp | ct-crane-igr ; ct-crane-quantec |  |
| hyp-srs-15-1 | Radiochirurgie, IGRT stéréotaxique | Aucune | sim-crane-srs | vol-hyp | ct-srs-igr-1fx ; ct-srs-hytec | Dose prescrite en périphérie de l'adénome |
| hyp-sec-fsrt-45-25 | RT stéréotaxique conformationnelle ou IMRT, IGRT quotidienne | Traitement médical antisécrétoire selon l'endocrinologue | sim-crane | vol-hyp | ct-crane-igr ; ct-crane-quantec |  |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

Fractionnement classique : fiche `sim-crane` (onglet « SNC — Glioblastome »). Radiochirurgie : fiche `sim-crane-srs` (onglet « SNC — Métastases cérébrales »).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-hyp | GTV | GTV | Adénome résiduel ou récidivant en T1 gadolinium, IRM fusionnée au scanner | Toujours |  |
| vol-hyp | CTV | CTV | CTV = GTV (tumeur bénigne) | Toujours | 0 mm |
| vol-hyp | PTV | PTV | CTV + marge de la technique : 1 mm en radiochirurgie (comme vol-crane-srs) ; selon la contention et l'IGRT en fractionné | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-hyp | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g ; oar-bandelettes-optiques ; oar-hypothalamus ; oar-tronc-cerebral ; oar-hippocampes ; oar-cochlee-d ; oar-cochlee-g ; oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-encephale-sain ; oar-nerfs-craniens (sinus caverneux) | [atlas EPTN 2018](https://doi.org/10.1016/j.radonc.2017.12.013) |

## Traitement systémique associé

Pas de chimiothérapie. Adénome sécrétant : traitement médical antisécrétoire poursuivi selon l'endocrinologue.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| hypophyse | Hypopituitarisme : 21 % après radiochirurgie, 40 % à 5 ans et 72 % à 10 ans après 45 Gy ; bilan endocrinien régulier |
| hyp-srs-15-1 | Voies optiques en 1 fraction : Dmax 10 Gy recommandé, 12 Gy pour un risque < 1 % (HyTEC) |
| hyp-nf | Stéréotaxie hypofractionnée : dose médiane 21 Gy en 3 à 5 fractions, contrôle à 5 ans 97 %, recul encore court (ISRS 2020) |
| hyp-secretant | Radiochirurgie des adénomes sécrétants : contrôle tumoral 92–97 %, rémission endocrinienne 28–48 % (ISRS 2021) |
