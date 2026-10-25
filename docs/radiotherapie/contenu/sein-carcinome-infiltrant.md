# Sein — Carcinome infiltrant

Mise à jour : 2026-10-25 · Statut de l'onglet : `valide`

## Situations cliniques

Sept situations. Région `sein`, localisation `sein`. Indications du référentiel Sénorif 2021-2022 (arbres 1 à 3). Mêmes indications chez l'homme (Sénorif).

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| sein-bcs | Après chirurgie conservatrice : sein entier ± surimpression | post\_op | Irradiation du sein entier en référence. Surimpression du lit si âge < 50 ans ; possible à 50 ans et plus avec au moins un facteur : grade III, emboles, triple négatif | 1 |
| sein-mastectomie | Après mastectomie : paroi thoracique | post\_op | pT3–T4 ; ou au moins deux facteurs parmi âge < 40 ans, pT2, emboles, grade III, triple négatif ; berges latérales atteintes ; pN+ | 2 |
| sein-ganglions | Irradiation des aires ganglionnaires (avec le sein ou la paroi) | post\_op | Ganglion sentinelle macrométastatique sans curage : CMI, niveaux I à IV, interpectoral. Curage pN+ : CMI et niveaux II à IV, + niveau I si envahissement > 50 % ou moins de 6 ganglions. pN0 : option CMI et niveaux III–IV si tumeur centrale ou interne avec pT3 ou au moins 2 facteurs (âge ≤ 40 ans, pT2, emboles, grade III) | 3 |
| sein-ipb | Irradiation partielle du sein | post\_op | Tous les critères : âge > 50 ans, pT1 N0, grade I–II, RH+, pas d'emboles, berges saines ; CCIS associé possible sauf grade III, nécrose ou CCIS étendu | 4 |
| sein-post-neoadj | Après chimiothérapie néoadjuvante | post\_op | Indications selon le stade clinique et radiologique initial ; ganglions irradiés si N+ initial prouvé, même ypN0. RT concomitante : capécitabine si triple négatif sans réponse complète, T-DM1 si HER2+ sans réponse complète | 5 |
| sein-en-place | Tumeur du sein non opérée : RT exclusive | en\_place | Irradiation du sein puis surimpression de la tumeur en place | 6 |
| sein-occulte | Carcinome occulte révélé par une adénopathie (cT0 N+) | post\_op | Irradiation du sein et des aires ganglionnaires | 7 |

## Schémas et prescriptions

Vingt schémas. Tous : statut = `valide`, date\_verif = 2026-10-24.

Revérifiés le 25/10/2026 : date\_verif = 2026-10-25 pour : sein-gg-40-15 ; sein-40-15-boost16

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| sein-40-15 | sein-bcs | Sein 40,05 Gy / 15 fx | rte\_hypo | essai\_phase3 | startb ; fastforward ; senorif-2021 | Sénorif 2021-2022 ; tableur du service « SEIN HYPOG 40,05 Gy » |
| sein-40-15-boost16 | sein-bcs | Sein 40,05 Gy / 15 fx puis surimpression séquentielle 16 Gy / 8 fx ou 10 Gy / 5 fx | rte\_hypo | essai\_phase3 | startb ; import-high ; eortc22881 ; senorif-2021 | Sénorif 2021-2022 ; tableur du service « SEIN HYPOG 40,05 Gy + boost séquentiel 16 Gy » |
| sein-425-16 | sein-bcs | Sein 42,5 Gy / 16 fx | rte\_hypo | essai\_phase3 | whelan2010 |  |
| sein-26-5 | sein-bcs | Sein 26 Gy / 5 fx en 1 semaine (FAST-Forward) | rte\_hypo | essai\_phase3 | fastforward ; senorif-2021 | Sénorif 2021-2022 (option) |
| sein-26-5-boost-service | sein-bcs | Sein 26 Gy / 5 fx puis surimpression 13,35 Gy / 5 fx | rte\_hypo | pratique\_institutionnelle | fastforward ; senorif-2021 | Tableur du service « SEIN FASTFORWARD 26 Gy + boost séquentiel 13,35 Gy » |
| sein-285-5-hebdo | sein-bcs | Sein 28,5 Gy / 5 fx, une séance par semaine (FAST) | rte\_hypo | essai\_phase3 | fast ; senorif-2021 | Sénorif 2021-2022 (option) |
| sein-50-25 | sein-bcs | Sein 50 Gy / 25 fx ± surimpression 16 Gy / 8 fx | rte\_normo | essai\_phase3 | eortc22881 ; ebctcg2011 ; senorif-2021 | Sénorif 2021-2022 |
| sein-sib-504-644 | sein-bcs | Sein 50,4 Gy / 28 fx avec surimpression intégrée 64,4 Gy | rte\_normo | essai\_phase3 | imrt-mc2 ; imrt-mc2-5ans ; senorif-2021 | Sénorif 2021-2022 (option) |
| sein-sib-import-high | sein-bcs | Sein 36 Gy, sein partiel 40 Gy, lit 48 Gy en 15 fx (SIB) | rte\_hypo | essai\_phase3 | import-high |  |
| sein-paroi-40-15 | sein-mastectomie | Paroi 40,05 Gy / 15 fx | rte\_hypo | essai\_phase3 | fastforward ; ebctcg2014 ; senorif-2021 | Sénorif 2021-2022 (recommandé, sauf chimiothérapie concomitante) |
| sein-paroi-50-25 | sein-mastectomie | Paroi 50 Gy / 25 fx | rte\_normo | essai\_phase3 | ebctcg2014 ; senorif-2021 | Sénorif 2021-2022 (recommandé si reconstruction avant la RT) |
| sein-gg-50-25 | sein-ganglions | Sein ou paroi et aires ganglionnaires 50 Gy / 25 fx | rte\_normo | essai\_phase3 | eortc22922 ; ma20 ; amaros ; amaros-10ans ; senorif-2021 | Sénorif 2021-2022 (standard) |
| sein-gg-40-15 | sein-ganglions | Sein ou paroi et aires ganglionnaires 40,05 Gy / 15 fx ± surimpression 16 Gy / 8 fx ou 10 Gy / 5 fx | rte\_hypo | essai\_phase3 | hypog01 ; wang2019 ; estro-acrop-sein-2022 ; senorif-2021 | Tableur du service « SEIN HYPOG 40,05 Gy + GG 40,05 Gy + boost séquentiel » |
| sein-ipb-40-15 | sein-ipb | Sein partiel 40 Gy / 15 fx (IMPORT LOW) | rte\_hypo | essai\_phase3 | import-low ; senorif-2021 | Sénorif 2021-2022 |
| sein-ipb-30-5 | sein-ipb | Sein partiel 30 Gy / 5 fx en IMRT (Florence) | rte\_hypo | essai\_phase3 | florence ; florence-10ans |  |
| sein-ipb-hdr-32 | sein-ipb | Curiethérapie interstitielle HDR 32 Gy / 8 fx (ou 30,1 Gy / 7 fx) en 5 jours | curie\_hdr | essai\_phase3 | gec-estro-ipb ; gec-estro-ipb-10ans ; senorif-2021 | Sénorif 2021-2022 |
| sein-ipb-pdr-50 | sein-ipb | Curiethérapie interstitielle PDR 50 Gy en 5 jours | curie\_pdr | essai\_phase3 | gec-estro-ipb ; gec-estro-ipb-10ans ; senorif-2021 | Sénorif 2021-2022 |
| sein-pna-50-25 | sein-post-neoadj | Sein ou paroi ± ganglions 50 Gy / 25 fx avec capécitabine ou T-DM1 | rte\_normo | recommandation | woodward2017 ; katherine ; senorif-2021 | Sénorif 2021-2022 |
| sein-en-place-50-boost | sein-en-place | Sein 50 Gy / 25 fx puis surimpression de la tumeur 20 à 26 Gy | rte\_normo | recommandation | senorif-2021 | Sénorif 2021-2022 |
| sein-occulte-50 | sein-occulte | Sein 50 à 54 Gy et aires ganglionnaires 50 Gy, fractionnement classique | rte\_normo | recommandation | senorif-2021 | Sénorif 2021-2022 |

**Tableau Prescriptions** (rattaché au schéma par `schema_id` ; pour la curiethérapie PDR, `fractions` et `dose_fx_Gy` restent vides)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sein-40-15 | PTV sein | 40.05 | 15 | 2.67 | seul | 5 fx/sem (3 semaines) | START B : récidive locorégionale à 10 ans 4,3 % contre 5,5 % avec 50 Gy ; moins d'effets tardifs |
| sein-40-15-boost16 | PTV sein | 40.05 | 15 | 2.67 | sequentiel | 5 fx/sem | Premier temps |
| sein-40-15-boost16 | PTV lit tumoral | 16 | 8 | 2 | sequentiel | 5 fx/sem | Surimpression de référence normofractionnée (Sénorif) ; bras contrôle d'IMPORT HIGH ; option : 10 Gy / 5 fx de 2 Gy |
| sein-425-16 | PTV sein | 42.5 | 16 | 2.656 | seul | 5 fx/sem (22 jours) | Récidive locale à 10 ans 6,2 % contre 6,7 % avec 50 Gy |
| sein-26-5 | PTV sein | 26 | 5 | 5.2 | seul | 5 fx/sem (1 semaine) | Sein seul, sans aires ganglionnaires ; récidive à 5 ans 1,4 % contre 2,1 % avec 40 Gy |
| sein-26-5-boost-service | PTV sein | 26 | 5 | 5.2 | sequentiel | 5 fx/sem | Premier temps |
| sein-26-5-boost-service | PTV lit tumoral | 13.35 | 5 | 2.67 | sequentiel | 5 fx/sem | Surimpression hypofractionnée : option de niveau de preuve très faible (Sénorif) ; FAST-Forward autorisait 10 ou 16 Gy en fractions de 2 Gy |
| sein-285-5-hebdo | PTV sein | 28.5 | 5 | 5.7 | seul | 1 fx/sem (5 semaines) | Femmes de 50 ans et plus, pT1–2 pN0 ; effets tardifs proches de 50 Gy / 25 fx |
| sein-50-25 | PTV sein | 50 | 25 | 2 | sequentiel | 5 fx/sem | Référence normofractionnée |
| sein-50-25 | PTV lit tumoral | 16 | 8 | 2 | sequentiel | 5 fx/sem | Si indiquée ; récidive à 20 ans 12,0 % contre 16,4 % sans surimpression (EORTC 22881) |
| sein-sib-504-644 | PTV sein | 50.4 | 28 | 1.8 | SIB | 5 fx/sem (5,5 semaines) | Sénorif : 63 à 64,4 Gy sur le lit en 28 fx |
| sein-sib-504-644 | PTV lit tumoral | 64.4 | 28 | 2.3 | SIB | 5 fx/sem | Contrôle local non inférieur à 5 ans |
| sein-sib-import-high | PTV sein | 36 | 15 | 2.4 | SIB | 5 fx/sem | Sein entier |
| sein-sib-import-high | PTV sein partiel | 40 | 15 | 2.67 | SIB | 5 fx/sem | Quadrant du lit tumoral |
| sein-sib-import-high | PTV lit tumoral | 48 | 15 | 3.2 | SIB | 5 fx/sem | 48 Gy non inférieur à 40 Gy + 16 Gy séquentiel ; 53 Gy non retenu |
| sein-paroi-40-15 | PTV paroi | 40.05 | 15 | 2.67 | seul | 5 fx/sem | Hypofractionnement modéré recommandé sauf chimiothérapie concomitante |
| sein-paroi-50-25 | PTV paroi | 50 | 25 | 2 | seul | 5 fx/sem | Option ; recommandé en cas de reconstruction avant la RT (modulation d'intensité favorisée) |
| sein-gg-50-25 | PTV sein ou paroi | 50 | 25 | 2 | seul | 5 fx/sem | Tous les volumes à la même dose et au même fractionnement |
| sein-gg-50-25 | PTV ganglionnaires | 50 | 25 | 2 | seul | 5 fx/sem | Surimpression du lit possible après conservation |
| sein-gg-40-15 | PTV sein ou paroi | 40.05 | 15 | 2.67 | sequentiel | 5 fx/sem | HypoG-01 : 40 Gy / 15 fx non inférieur à 50 Gy / 25 fx pour le lymphœdème |
| sein-gg-40-15 | PTV ganglionnaires | 40.05 | 15 | 2.67 | sequentiel | 5 fx/sem | Même fractionnement que le sein ou la paroi |
| sein-gg-40-15 | PTV lit tumoral | 16 | 8 | 2 | sequentiel | 5 fx/sem | Si indiquée ; surimpression de référence normofractionnée (Sénorif) ; option : 10 Gy / 5 fx de 2 Gy |
| sein-ipb-40-15 | PTV sein partiel | 40 | 15 | 2.67 | seul | 5 fx/sem | Faisceaux tangentiels raccourcis ; récidive locale à 5 ans 0,5 % contre 1,1 % (sein entier) |
| sein-ipb-30-5 | PTV lit tumoral | 30 | 5 | 6 | seul | 5 fx/sem (1 fx/j) | Récidive à 10 ans faible, non différente du sein entier |
| sein-ipb-hdr-32 | CTV (implant multicathéter) | 32 | 8 | 4 | seul | 2 fx/j, 5 jours | Variante 30,1 Gy / 7 fx (4,3 Gy) ; récidive locale à 10 ans 3,51 % contre 1,58 % (sein entier) |
| sein-ipb-pdr-50 | CTV (implant multicathéter) | 50 |  |  | seul | Débit pulsé, 5 jours | Même essai |
| sein-pna-50-25 | PTV sein ou paroi ± ganglions | 50 | 25 | 2 | seul | 5 fx/sem | Normofractionné en cas de chimiothérapie concomitante (Sénorif, arbre 2) |
| sein-en-place-50-boost | PTV sein | 50 | 25 | 2 | sequentiel | 5 fx/sem | Premier temps |
| sein-en-place-50-boost | PTV tumeur | 20 | 10 | 2 | sequentiel | 5 fx/sem | 20 à 26 Gy selon la tumeur |
| sein-occulte-50 | PTV sein | 50 | 25 | 2 | seul | 5 fx/sem | 50 à 54 Gy |
| sein-occulte-50 | PTV ganglionnaires | 50 | 25 | 2 | seul | 5 fx/sem | Fractionnement classique |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| sein-40-15 | RT conformationnelle 3D, tangentielles ; inspiration bloquée à gauche | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-ff-15fx ; ct-sein-senorif | PTV : V95 % > 95 %, V105 % < 5 %, V107 % < 2 %, Dmax < 110 % (FAST-Forward) |
| sein-40-15-boost16 | RT 3D puis surimpression en photons ou électrons | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-ff-15fx ; ct-sein-senorif | Comme sein-40-15 pour le premier temps |
| sein-425-16 | RT conformationnelle 3D | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-senorif |  |
| sein-26-5 | RT 3D, imagerie de vérification à chaque séance | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-ff-5fx ; ct-sein-senorif | PTV : V95 % > 95 %, V105 % < 5 %, V107 % < 2 %, Dmax < 110 % |
| sein-26-5-boost-service | RT 3D, imagerie à chaque séance, puis surimpression | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-ff-5fx ; ct-sein-senorif | Comme sein-26-5 pour le premier temps |
| sein-285-5-hebdo | RT 3D | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-senorif |  |
| sein-50-25 | RT conformationnelle 3D | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-senorif ; ct-thorax-quantec |  |
| sein-sib-504-644 | IMRT avec surimpression intégrée | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-senorif ; ct-thorax-quantec |  |
| sein-sib-import-high | RT 3D ou IMRT avec surimpression intégrée | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-senorif |  |
| sein-paroi-40-15 | RT 3D ; IMRT si reconstruction | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-ff-15fx ; ct-sein-senorif | PTV : V95 % > 95 %, V105 % < 5 %, V107 % < 2 %, Dmax < 110 % |
| sein-paroi-50-25 | RT 3D ; IMRT favorisée si reconstruction | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-senorif ; ct-thorax-quantec |  |
| sein-gg-50-25 | RT 3D ; IMRT si contraintes non tenues ; inspiration bloquée à gauche et si CMI | Voir Traitement systémique | sim-sein | vol-sein-gg | ct-sein-senorif ; ct-thorax-quantec |  |
| sein-gg-40-15 | RT 3D ou IMRT ; inspiration bloquée à gauche et si CMI | Voir Traitement systémique | sim-sein | vol-sein-gg | ct-sein-senorif |  |
| sein-ipb-40-15 | IMRT direct (field-in-field), tangentielles raccourcies | Voir Traitement systémique | sim-sein | vol-sein-ipb | ct-sein-senorif |  |
| sein-ipb-30-5 | IMRT | Voir Traitement systémique | sim-sein | vol-sein-ipb | ct-sein-senorif |  |
| sein-ipb-hdr-32 | Curiethérapie interstitielle multicathéter | Voir Traitement systémique |  | vol-sein-curie |  |  |
| sein-ipb-pdr-50 | Curiethérapie interstitielle multicathéter | Voir Traitement systémique |  | vol-sein-curie |  |  |
| sein-pna-50-25 | RT 3D ou IMRT | Voir Traitement systémique | sim-sein | vol-sein-gg | ct-sein-senorif ; ct-thorax-quantec |  |
| sein-en-place-50-boost | RT 3D puis surimpression | Voir Traitement systémique | sim-sein | vol-sein | ct-sein-senorif ; ct-thorax-quantec |  |
| sein-occulte-50 | RT 3D ou IMRT | Voir Traitement systémique | sim-sein | vol-sein-gg | ct-sein-senorif ; ct-thorax-quantec |  |

## Curiethérapie

**Tableau Curiethérapie — indications**

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Irradiation partielle du sein, faible risque | HDR 32 Gy / 8 fx ou 30,1 Gy / 7 fx, ou PDR 50 Gy, en 5 jours | Essai de phase 3 GEC-ESTRO (Strnad 2016, 2023) | Récidive locale à 10 ans 3,51 % contre 1,58 % avec le sein entier ; moins de fibrose sévère |
| Seconde conservation après récidive, dans un essai | Curiethérapie interstitielle (GEC-ESTRO) | Niveau de preuve faible (Sénorif) | Réirradiation traitée au lot E |

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-sein | Décubitus dorsal (référence) ; décubitus latéral isocentrique possible pour le sein seul (Sénorif) | — | Inspiration bloquée recommandée à gauche et en cas d'irradiation de la CMI, sauf sein seul en décubitus latéral (Sénorif) | Scanner 3D, coupes de 5 mm au plus, sein entier et OAR contourés (FAST-Forward) | Lit tumoral : examen clinique préopératoire, mammographie, échographie, IRM, compte rendu opératoire, clips et anatomopathologie (Sénorif) | Clips en titane ou grains d'or sur les parois de la cavité, fortement recommandés (FAST-Forward, IMPORT LOW) |

## Contourage

Contourage des OAR : RECORAD 2021 (Sénorif).

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-sein | CTV sein | CTV | Glande mammaire entière avec ses prolongements axillaires (Sénorif) : tissus mous de 5 mm sous la peau jusqu'au fascia profond, sans muscle ni grill costal (FAST-Forward) ; recommandations ESTRO 2016 | Après conservation |  |
| vol-sein | CTV paroi | CTV | Lambeaux cutanés, tissu sous-cutané et cicatrice, jusqu'au fascia profond, sans muscle ni côtes (FAST-Forward ; Sénorif) ; avec prothèse : ESTRO-ACROP 2019 | Après mastectomie |  |
| vol-sein | CTV lit tumoral | CTV | Lit tumoral d'après les clips, l'imagerie préopératoire, le compte rendu opératoire et l'anatomopathologie (taille, berges) | Si surimpression |  |
| vol-sein | PTV | PTV | CTV + 10 mm en général (positionnement, œdème, respiration ; FAST-Forward) | Toujours | 10 mm |
| vol-sein-gg | CTV sein ou paroi | CTV | Comme `vol-sein` | Toujours |  |
| vol-sein-gg | CTVn niveaux I à IV et interpectoral | CTV | Selon l'indication (situation `sein-ganglions`) ; le niveau II est toujours irradié avec le niveau interpectoral (Rotter) ; délinéation ESTRO 2016 | Selon l'indication |  |
| vol-sein-gg | CTVn CMI | CTV | Chaîne mammaire interne, délinéation ESTRO 2016 | Selon l'indication |  |
| vol-sein-gg | PTV | PTV | Marges du centre | Toujours |  |
| vol-sein-ipb | CTV sein partiel | CTV | Lit tumoral repéré par clips (sinon échographie, IRM ou scanner) et marge de tissu sain ; faisceaux tangentiels raccourcis mais pas rétrécis (IMPORT LOW) | Toujours |  |
| vol-sein-ipb | PTV | PTV | Selon le protocole de l'essai suivi (IMPORT LOW ou Florence) | Toujours |  |
| vol-sein-curie | CTV (implant) | CTV | Lit tumoral et marge, implant multicathéter selon le protocole GEC-ESTRO | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-sein | oar-coeur ; oar-poumon-homolateral ; oar-sein-controlateral | [ESTRO 2016](https://doi.org/10.1016/j.radonc.2015.12.027) ; [ESTRO-ACROP 2019, reconstruction par prothèse](https://doi.org/10.1016/j.radonc.2019.04.010) |
| vol-sein-gg | oar-coeur ; oar-poumon-homolateral ; oar-poumons ; oar-sein-controlateral ; oar-plexus-brachial-d ; oar-plexus-brachial-g ; oar-moelle ; oar-oesophage ; oar-thyroide | [ESTRO 2016](https://doi.org/10.1016/j.radonc.2015.12.027) |
| vol-sein-ipb | oar-coeur ; oar-poumon-homolateral ; oar-sein-controlateral |  |
| vol-sein-curie | oar-peau ; oar-cotes |  |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | protocole | essai\_ids | note |
| --- | --- | --- | --- | --- |
| sein-bcs | Inhibiteur de l'aromatase : peut commencer pendant la RT. Tamoxifène : après la fin de la RT | Hormonothérapie adjuvante | senorif-2021 | Valable pour toutes les situations ; décision d'association en RCP |
| sein-bcs | Trastuzumab : la RT est faite pendant le trastuzumab | Trastuzumab adjuvant | senorif-2021 | HER2+ |
| sein-post-neoadj | Capécitabine 825 mg/m² deux fois par jour, 5 jours sur 7, pendant la RT | Capécitabine concomitante à la RT (sein) | woodward2017 ; senorif-2021 | Triple négatif sans réponse complète ; capécitabine adjuvante : CREATE-X |
| sein-post-neoadj | T-DM1 : la RT peut être faite pendant le traitement | Trastuzumab emtansine (T-DM1) adjuvant | katherine ; senorif-2021 | HER2+ sans réponse complète |
| sein-post-neoadj | Capécitabine adjuvante après la RT | Capécitabine adjuvante (CREATE-X) | create-x | Survie sans maladie à 5 ans 74,1 contre 67,6 % |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| ct-sein-senorif | Le risque d'événement coronarien augmente de 7,4 % par gray de dose moyenne au cœur, sans seuil (Darby 2013) : objectif Dmoy < 5 Gy (Sénorif) |
| sein | RCMI recommandée pour les irradiations bilatérales, les pectus excavatum et les irradiations ganglionnaires complexes ; évaluer alors la dose au sein controlatéral, surtout chez la femme jeune ou en cas de prédisposition génétique (Sénorif) |
| sein-bcs | La RT après conservation réduit le risque de récidive à 10 ans de 35,0 à 19,3 % et la mortalité par cancer à 15 ans de 25,2 à 21,4 % (EBCTCG 2011) |
| sein-bcs | Femme de 65 ans et plus, RH+, N0, tumeur ≤ 3 cm, sous hormonothérapie : l'omission de la RT augmente la récidive locale à 10 ans (9,5 contre 0,9 %) sans changer la survie (PRIME II) ; à 70 ans et plus, résultats proches (CALGB 9343) |
| sein-ganglions | RT axillaire contre curage après ganglion sentinelle positif : récidive axillaire à 10 ans 1,82 contre 0,93 %, sans différence de survie, moins de lymphœdème (AMAROS) |
| sein-ganglions | Irradiation de la CMI et de la sus-claviculaire médiale : SG à 10 ans 82,3 contre 80,7 % (EORTC 22922) ; irradiation ganglionnaire : survie sans maladie 82,0 contre 77,0 % (MA.20) |
| sein-gg-40-15 | Paroi et ganglions en 43,5 Gy / 15 fx : récidive locorégionale à 5 ans 8,3 contre 8,1 % avec 50 Gy (Wang 2019) |
| sein-26-5 | FAST-Forward : 27 Gy / 5 fx donne plus d'effets tardifs que 40 Gy ; 26 Gy est le schéma retenu |
| sein | Cancer du sein métastatique d'emblée bien contrôlé : RT de la maladie locorégionale macroscopique initiale, avec ou sans chirurgie ; pas de CMI sauf atteinte initiale (Sénorif) |
| sein-mastectomie | Reconstruction mammaire : Sénorif 2021 recommande le normofractionnement ; le consensus ESTRO-ACROP 2022 admet l'hypofractionnement modéré pour le sein, la paroi (avec ou sans reconstruction) et les ganglions, et 5 fractions pour le sein ou la paroi sans reconstruction ni ganglions |
| sein | Inversion de séquence (RT préopératoire) : hors protocole de recherche, données insuffisantes (Sénorif) |
