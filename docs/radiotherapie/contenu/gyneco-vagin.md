# Gynéco — Vagin

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Cancer primitif du vagin (sans atteinte du col ni de la vulve). Tumeur rare : pas d'essai randomisé, les schémas viennent de l'expérience de Gustave Roussy (IGR), du protocole Curie col et vagin et de la fiche du service ; le concept de volumes de curiethérapie est celui du GEC-ESTRO (ACROP 2020). Région `gyneco`, localisation `vagin`.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| vagin-local | Stade I limité et superficiel : curiethérapie exclusive | en\_place | Petite tumeur T1 superficielle (FIGO I : paroi vaginale) ; traitement conservateur ; curage pelvien à discuter (6 à 14 % de pN+ au stade I) | 1 |
| vagin-lacc | Stades I à IVA ou N+ : radio(chimio)thérapie + curiethérapie | en\_place | Stade I non éligible à la curiethérapie seule, stades II à IVA, atteinte ganglionnaire ; carcinome épidermoïde surtout (80 à 85 %) | 2 |

## Schémas et prescriptions

Deux schémas. Tous : statut = `valide`, date\_verif = 2026-10-23. La dose de curiethérapie n'a pas de valeur publiée de référence : elle se décide sur la planification guidée par l'image (le module affiche « dose à définir sur la dosimétrie »).

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| vagin-curie-excl | vagin-local | Curiethérapie exclusive endocavitaire ± interstitielle | curie\_pdr | pratique\_institutionnelle | gec-estro-vagin ; abs-vagin | Gustave Roussy (C. Chargari, cancers primitifs du vagin) |
| vagin-rch-curie | vagin-lacc | Pelvis 45 Gy / 25 fx (± boost ganglionnaire 60 Gy) + curiethérapie | rte\_plus\_curie | pratique\_institutionnelle | gec-estro-vagin ; abs-vagin ; embrace2 | Gustave Roussy ; Institut Curie, protocole col et vagin 2021 ; fiche du service |

**Tableau Prescriptions** (rattaché au schéma par `schema_id` ; dose de curiethérapie vide = à définir sur la dosimétrie)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| vagin-curie-excl | CTV de curiethérapie (GTV + 1 cm) | 60 |  |  | seul | Débit pulsé ou bas débit | Série IGR de traitement conservateur (jeunes patientes) : 60 Gy dans le GTV + 1 cm |
| vagin-rch-curie | PTV1 (tumeur + vagin + aires ganglionnaires) | 45 | 25 | 1.8 | SIB | 5 fx/sem | Cisplatine 40 mg/m² hebdomadaire selon RCP |
| vagin-rch-curie | PTV\_N60 (adénopathie) | 60 | 25 | 2.4 | SIB | 5 fx/sem | IGR : boost ganglionnaire de 60 Gy, intégré ou séquentiel |
| vagin-rch-curie | CTV-HR de curiethérapie |  |  |  | sequentiel | Après la RTE | Endocavitaire, interstitielle si épaisseur résiduelle > 5 mm (ABS) ; série IGR : 60 Gy au CTV (tumeur + 10–20 mm) ; si curiethérapie impossible : boost externe sur GTV\_T + 1 cm (PTV3 de la fiche) |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| vagin-curie-excl | Curiethérapie guidée par l'IRM (gel vaginal) | Aucune | sim-col-curie | vol-vagin-curie |  |  |
| vagin-rch-curie | VMAT, CBCT quotidien avec recalage osseux ; curiethérapie guidée par l'IRM | Cisplatine 40 mg/m² hebdomadaire (pas de niveau de preuve, décision en RCP) | sim-vagin | vol-vagin | ct-gyn-curie-rte | PTV : D95 > 95 %, D2 < 107 % ; PTV\_N : D98 > 90 % |

## Curiethérapie

**Tableau Curiethérapie — indications** (affiché en tête de l'onglet Curiethérapie, filtre vagin)

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Petite tumeur T1 superficielle | Curiethérapie exclusive | Séries rétrospectives (IGR) | Traitement conservateur |
| Stades I à IVA après RTE | Curiethérapie endocavitaire ± interstitielle | Séries rétrospectives (IGR) ; concept GEC-ESTRO ACROP 2020 | Contrôle local 80 à 90 %, survie à 5 ans 40 à 70 % ; facteurs pronostiques : stade, taille > 4 cm, réponse à la RTE |
| Épaisseur tumorale > 5 mm | Interstitielle | ABS 2012 (consensus) | Endocavitaire seule si ≤ 5 mm |
| Jeune patiente (adénocarcinome à cellules claires, exposition au DES) | Curage pelvien + transposition ovarienne + curiethérapie endocavitaire ± interstitielle, 60 Gy dans le GTV + 1 cm | Série IGR (61 patientes) | Survie spécifique à 5 ans 79 % |

**Volumes de curiethérapie (GEC-ESTRO ACROP 2020) :** GTV-T res = tumeur résiduelle au moment de la curiethérapie ; CTV-T HR = GTV-T res + zones grises et paroi vaginale atteinte ; CTV-T IR = extension tumorale initiale. Examen gynécologique et IRM avec gel vaginal, schéma clinique standardisé du vagin. Contraintes D2cm³ rectum, vessie, grêle, sigmoïde utilisées pour optimiser la curiethérapie (fiche du service) ; pas de valeur publiée propre au vagin dans nos sources.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-vagin | Décubitus dorsal | Cale genoux + cale pieds, immobilisation pelvienne | Rectum vide (Normacol), vessie confortable ; scanner vessie pleine puis vessie vide pour l'ITV (fiche du service) | Injecté sauf contre-indication ; coupes ≤ 3 mm ; jusqu'aux ischions + 15 cm (+ inguinaux si tiers inférieur) | IRM pelvienne avec gel vaginal ; TEP-TDM ; empreinte vaginale | Marqueur de la limite inférieure de la tumeur |

La curiethérapie utilise la fiche `sim-col-curie` (onglet Col utérin).

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-vagin | GTV\_T | GTV | Tumeur visible (examen clinique, IRM) | Toujours |  |
| vol-vagin | GTV\_N# | GTV | Adénopathie identifiée (imagerie ou cytologie) | Si adénopathie |  |
| vol-vagin | CTV\_T | CTV | GTV + 2 cm, vagin en totalité, paravagin ; col utérin et paramètres si lésion du tiers supérieur, ± utérus entier (IGR). Fiche du service : vagin entier + col + paramètres ; utérus entier si tumeur des deux tiers supérieurs | Toujours | 2 cm autour du GTV |
| vol-vagin | ITV\_T | ITV | Union du CTV\_T sur le scanner vessie pleine et sur le scanner vessie vide (fiche) | Toujours |  |
| vol-vagin | CTV\_N | CTV | Iliaques internes, externes, présacrés, ilio-obturateurs ; iliaques primitives si N+ ou atteinte du tiers supérieur (IGR) ; inguinaux si tiers inférieur ; fiche : vaisseaux + 5 mm, sans os ni tube digestif | Toujours | 5 mm autour des vaisseaux |
| vol-vagin | PTV1 | PTV | (GTV\_T + CTV\_T) + 1 cm, réuni avec CTV\_N + 5 mm (fiche) | Toujours | 1 cm (T), 5 mm (N) |
| vol-vagin | PTV2 | PTV | GTV\_N inguinal + 1 cm (fiche) | Si adénopathie inguinale | 1 cm |
| vol-vagin | PTV3 | PTV | GTV\_T + 1 cm si curiethérapie impossible, ou GTV\_N iliaque + 1 cm (fiche) | Selon indication | 1 cm |
| vol-vagin-curie | CTV de curiethérapie | CTV | GTV + 1 cm (curiethérapie exclusive, IGR) | Toujours | 1 cm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-vagin | oar-grele (fiche : sac péritonéal jusqu'à 4 cm au-dessus de la dernière coupe du PTV1) ; oar-sigmoide (fiche : du début de la boucle sigmoïde à la jonction recto-sigmoïdienne) ; oar-rectum (fiche : du canal anal à la boucle sigmoïde) ; oar-canal-anal ; oar-vessie ; oar-tete-femorale-d ; oar-tete-femorale-g (fiche : jusqu'au petit trochanter inclus) ; oar-aile-iliaque-d ; oar-aile-iliaque-g (fiche : crêtes iliaques jusqu'à l'acétabulum) ; oar-moelle-osseuse ; oar-vulve | GEC-ESTRO ACROP 2020 (curiethérapie) ; RTOG 2012, OAR du pelvis |
| vol-vagin-curie | oar-rectum ; oar-vessie ; oar-uretre ; oar-sigmoide | GEC-ESTRO ACROP 2020 |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | essai\_ids | note |
| --- | --- | --- | --- |
| Stades I à IVA, N+ | Cisplatine 40 mg/m² hebdomadaire pendant la RTE | embrace2 | Pas de niveau de preuve propre au vagin (IGR) ; décision en RCP selon les comorbidités |
| Curiethérapie exclusive | Aucun |  |  |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| vagin | Drainage : deux tiers supérieurs → iliaques ; tiers inférieur → iliaques internes et inguinaux ; cloison postérieure → ganglions sacrés. Adapter le CTV\_N au siège |
| vagin | La fiche du service ne donne pas de dose pour PTV2 et PTV3 (écart E34) : référence IGR = 60 Gy sur les adénopathies |
| vagin | Données rétrospectives seulement ; vérifier l'absence d'atteinte du col et de la vulve (sinon traiter comme un col ou une vulve) et d'hystérectomie pour cancer dans les 5 ans |
| vagin-rch-curie | Vérifier dès le début de la RTE que la curiethérapie est programmée ; examen sous anesthésie et IRM avec gel avant la curiethérapie |
