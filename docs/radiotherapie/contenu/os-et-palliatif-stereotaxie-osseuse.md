# Os et palliatif — Stéréotaxie osseuse

Mise à jour : 2026-10-25 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations. Région `os_palliatif`, localisation `sbrt_os`. Fiche du service « stéréotaxie osseuse vertébrale » et tableurs du service. Définitions de l'oligométastase : consensus ESTRO-EORTC (Guckenberger 2020).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| sr-rachis | Métastase vertébrale, première irradiation | oligometastatique | Décision en RCP sur scanner et IRM. OMS < 2, espérance de vie > 3 mois, chirurgie ou cimentoplastie non retenues. Oligométastatique (< 5 métastases), douleur persistante après RT conformationnelle, plasmocytome rachidien unique, tumeur rachidienne rare. Lésion < 5 cm ; 1 ou 2 vertèbres contiguës, ou 3 sites séparés par au moins 2 vertèbres saines ; épidurite ≤ 25 % du canal et à 5 mm ou plus de la moelle. Contre-indications : compression médullaire non opérée, instabilité rachidienne, atteinte majeure des parties molles, progression dans le champ moins de 3 mois après une RT, RT métabolique de moins d'un mois | 1 |
| sr-reirr | Métastase vertébrale déjà irradiée | reirradiation | Mêmes critères ; cumul des doses et des fractionnements antérieurs à prendre en compte (fiche du service) | 2 |
| sr-os | Métastase osseuse hors rachis (bassin) | oligometastatique | Lésion osseuse oligométastatique accessible à la stéréotaxie, par exemple pubis (tableur du service) | 3 |

## Schémas et prescriptions

Sept schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

Revérifiés le 25/10/2026 : date\_verif = 2026-10-25 pour : sr-24-2 ; sr-3x8-service ; sr-3x9-service ; sr-3x10-service ; sr-1x24 ; sr-reirr-5x6 ; sr-pubis-3x9

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| sr-24-2 | sr-rachis | SBRT 24 Gy / 2 fx | sbrt | essai\_phase3 | sc24 ; hytec-moelle | Tableur du service « vertèbre stéréo 2 × 12 » |
| sr-3x8-service | sr-rachis | SBRT 3 × 8 Gy, une séance tous les 3 jours | sbrt | pratique\_institutionnelle | lai2025 ; cox2012 | Fiche du service « stéréotaxie osseuse vertébrale » |
| sr-3x9-service | sr-rachis | SBRT 3 × 9 Gy | sbrt | pratique\_institutionnelle | zelefsky2021 ; wang2012-sbrt ; cox2012 | Tableur du service « vertèbre stéréo 3 × 9 » |
| sr-3x10-service | sr-rachis | SBRT 3 × 10 Gy, une séance tous les 3 jours | sbrt | pratique\_institutionnelle | wang2012-sbrt ; cox2012 | Fiche du service « stéréotaxie osseuse vertébrale » |
| sr-1x24 | sr-rachis | SBRT 24 Gy en 1 fx | sbrt | option | sprave2018 ; sahgal2013-vcf |  |
| sr-reirr-5x6 | sr-reirr | SBRT de réirradiation 5 × 6 Gy, une séance tous les 3 jours | sbrt | pratique\_institutionnelle | garg2011 ; sahgal2012-reirr ; hytec-moelle | Fiche du service « stéréotaxie osseuse vertébrale » |
| sr-pubis-3x9 | sr-os | SBRT 3 × 9 Gy (bassin, pubis) | sbrt | pratique\_institutionnelle | zelefsky2021 ; sabrcomet ; sabrcomet5 ; guckenberger2020 | Tableur du service « pubis stéréo 3 × 9 » |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sr-24-2 | PTV | 24 | 2 | 12 | seul | 2 jours consécutifs | Réponse complète de la douleur à 3 mois 35 % contre 14 % avec 20 Gy / 5 fx (SC.24) |
| sr-3x8-service | PTV | 24 | 3 | 8 | seul | 1 séance tous les 3 jours | Phase 2 randomisée contre 16 Gy / 1 fx : progression locale à 1 an 4,9 contre 2,6 %, fracture 10,1 contre 7,9 % (Lai 2025) |
| sr-3x9-service | PTV | 27 | 3 | 9 | seul | Selon le service | Bras 3 × 9 Gy de la phase 3 de Zelefsky 2021 : rechute locale à 3 ans 22 % contre 5,8 % avec 24 Gy / 1 fx |
| sr-3x10-service | PTV | 30 | 3 | 10 | seul | 1 séance tous les 3 jours | 27 à 30 Gy en 3 fx : phase 1-2 du MD Anderson, survie sans progression à 1 an 80,5 % (Wang 2012) |
| sr-1x24 | PTV | 24 | 1 | 24 | seul | 1 séance | Réponse antalgique meilleure qu'avec 30 Gy / 10 fx à 6 mois (phase 2) ; risque de fracture vertébrale plus élevé à partir de 20 Gy par fraction |
| sr-reirr-5x6 | PTV | 30 | 5 | 6 | seul | 1 séance tous les 3 jours | 30 Gy / 5 fx en réirradiation : contrôle local à 1 an 76 % (Garg 2011) ; adapter au cumul des doses antérieures (jeu ct-reirr-moelle) |
| sr-pubis-3x9 | PTV | 27 | 3 | 9 | seul | Selon le service | Bras 3 × 9 Gy de la phase 3 de Zelefsky 2021 (lésions oligométastatiques) ; isodose d'enveloppe 80 % (33,75 Gy à l'isocentre) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| sr-24-2 | SBRT, IGRT par CBCT à chaque séance | Aucune | sim-sr-service | vol-sr-service | ct-hytec-moelle | Isodose de prescription englobant tout le PTV (Zelefsky 2021) ; couverture réduite au contact de la moelle si nécessaire pour respecter sa contrainte (consensus, Redmond 2017) |
| sr-3x8-service | SBRT, IGRT par CBCT à chaque séance | Aucune | sim-sr-service | vol-sr-service | ct-hytec-moelle | Isodose de prescription englobant tout le PTV (Zelefsky 2021) ; couverture réduite au contact de la moelle si nécessaire pour respecter sa contrainte (consensus, Redmond 2017) |
| sr-3x9-service | SBRT, IGRT par CBCT à chaque séance | Aucune | sim-sr-service | vol-sr-service | ct-hytec-moelle | Isodose de prescription englobant tout le PTV (Zelefsky 2021) ; couverture réduite au contact de la moelle si nécessaire pour respecter sa contrainte (consensus, Redmond 2017) |
| sr-3x10-service | SBRT, IGRT par CBCT à chaque séance | Aucune | sim-sr-service | vol-sr-service | ct-hytec-moelle | Isodose de prescription englobant tout le PTV (Zelefsky 2021) ; couverture réduite au contact de la moelle si nécessaire pour respecter sa contrainte (consensus, Redmond 2017) |
| sr-1x24 | SBRT, IGRT par CBCT | Aucune | sim-sr-service | vol-sr-service | ct-hytec-moelle | Isodose de prescription englobant tout le PTV (Zelefsky 2021) ; couverture réduite au contact de la moelle si nécessaire pour respecter sa contrainte (consensus, Redmond 2017) |
| sr-reirr-5x6 | SBRT, IGRT par CBCT à chaque séance | Aucune | sim-sr-service | vol-sr-service | ct-reirr-moelle ; ct-hytec-moelle | Isodose de prescription englobant tout le PTV (Zelefsky 2021) ; couverture réduite au contact de la moelle si nécessaire pour respecter sa contrainte (consensus, Redmond 2017) |
| sr-pubis-3x9 | SBRT, IGRT par CBCT à chaque séance | Aucune | sim-sr-service | vol-sr-os |  | Isodose de prescription englobant tout le PTV (Zelefsky 2021) ; couverture réduite au contact de la moelle si nécessaire pour respecter sa contrainte (consensus, Redmond 2017) |

## Curiethérapie

Pas de curiethérapie pour cette localisation.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-sr-service | Décubitus dorsal ; décubitus ventral possible pour les tumeurs très postérieures (non compatible avec certains robots) | Rachis cervical : bras le long du corps, masque 5 points. Rachis dorso-lombaire : bras le long du corps, coussin à dépression (blue-bag) possible | — | Scanner dosimétrique sans injection (référence) ; scanner injecté recommandé | IRM T1 gadolinium et T2, coupes axiales, coronales et sagittales ; fusion scanner-IRM explicite et datée | Volumes nommés par niveau (GTV\_T8, CTV\_T8, PTV\_T8) |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-sr-service | GTV | GTV | Lyse ou condensation tumorale visible, sur la fusion scanner-IRM | Toujours |  |
| vol-sr-service | CTV | CTV | Vertèbre atteinte et expansion anatomique selon le consensus : moelle osseuse anormale et os normal adjacent ; pas d'expansion épidurale sans épidurite ; CTV circonférentiel seulement si corps, pédicules ou lames bilatéraux et épineuse sont atteints, ou si l'épidurite est circonférentielle (Cox 2012). Réirradiation : pas de standard publié | Toujours |  |
| vol-sr-service | PTV | PTV | CTV + 3 mm, ou moins selon la précision du CBCT | Toujours | 3 mm |
| vol-sr-service | PRV moelle | PRV | Moelle + 3 mm | Toujours | 3 mm |
| vol-sr-os | GTV | GTV | Lésion osseuse visible (scanner, IRM) | Toujours |  |
| vol-sr-os | PTV | PTV | Marge du service, non précisée par le tableur | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-sr-service | oar-moelle ; oar-sac-dural ; oar-queue-cheval ; oar-racines-nerveuses ; oar-plexus-brachial-d ; oar-plexus-brachial-g ; oar-oesophage ; oar-trachee ; oar-pharynx ; oar-larynx ; oar-parotide-d ; oar-parotide-g ; oar-poumons ; oar-coeur ; oar-gros-vaisseaux ; oar-rein-d ; oar-rein-g ; oar-foie ; oar-estomac ; oar-duodenum ; oar-grele ; oar-colon ; oar-pancreas ; oar-rectum ; oar-vessie ; oar-plexus-sacre ; oar-nerf-sciatique | [Cox 2012, consensus de contourage](https://doi.org/10.1016/j.ijrobp.2012.03.009) ; [Redmond 2017, post-opératoire](https://doi.org/10.1016/j.ijrobp.2016.09.014) |
| vol-sr-os | oar-rectum ; oar-anus ; oar-sigmoide ; oar-grele ; oar-vessie ; oar-vulve ; oar-tete-femorale-d ; oar-tete-femorale-g |  |

## Traitement systémique associé

Pas de traitement systémique associé à la RT dans ces schémas.

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| sr-rachis | Fracture vertébrale après SBRT : 14 % ; risque plus élevé avec 24 Gy ou plus par fraction, ostéolyse, déformation et fracture préexistante (Sahgal 2013) ; prudence au-delà de 20 Gy par fraction |
| sr-rachis | 16 ou 18 Gy en 1 fx n'ont pas fait mieux que 8 Gy en 1 fx sur la douleur à 3 mois (RTOG 0631 : 41,3 contre 60,5 %) |
| sr-rachis | SBRT après chirurgie rachidienne : CTV = étendue préopératoire de l'atteinte osseuse et épidurale et compartiments adjacents, en anneau si l'épidurite était circonférentielle, matériel exclu (Redmond 2017) |
| sbrt\_os | Oligométastases : SABR-COMET, SG à 5 ans 42,3 contre 17,7 % ; classification et nomenclature ESTRO-EORTC (Guckenberger 2020). Sites : onglets Poumon, Foie, Surrénale, Métastases cérébrales |
| sr-pubis-3x9 | Contraintes du tableur du service non reprises ; pas de jeu publié pour le bassin en 3 fractions dans la bibliothèque |
