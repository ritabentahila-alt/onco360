# Gynéco — Endomètre

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations, toutes après hystérectomie : risque intermédiaire, risque intermédiaire-élevé, haut risque. Région `gyneco`, localisation `endometre`. Les volumes post-opératoires de cet onglet (`vol-gyn-postop`) et le centrage `sim-gyn-postop` servent aussi au col opéré (onglet Col utérin). Le groupe de risque se fixe selon ESGO-ESTRO-ESP (2021, mise à jour 2025 avec la FIGO 2023 et la classification moléculaire) : voir les points d'attention.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| endo-ri | Risque intermédiaire : curiethérapie vaginale | post\_op | Stade IB endométrioïde bas grade sans emboles (ou emboles focaux), IA haut grade sans emboles, IA non endométrioïde sans invasion myométriale (ESGO-ESTRO-ESP 2021) ; abstention possible avant 60 ans | 1 |
| endo-hir | Risque intermédiaire-élevé | post\_op | Stade I endométrioïde avec emboles lymphovasculaires massifs, IB haut grade, stade II endométrioïde ; curiethérapie vaginale si pN0, radiothérapie pelvienne si emboles massifs ou statut ganglionnaire inconnu (pNx) | 2 |
| endo-hr | Haut risque et stades avancés opérés | post\_op | Stade III–IVA sans résidu ; stade I–IVA non endométrioïde (séreux, cellules claires, indifférencié, carcinosarcome) ou p53 anormal avec invasion myométriale ; critères PORTEC-3 (stade I endométrioïde grade 3 avec invasion ≥ 50 % et/ou emboles, stades II–III, séreux ou cellules claires I–III) | 3 |

## Schémas et prescriptions

Six schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| endo-vbt-7x3 | endo-ri | Curiethérapie vaginale exclusive HDR 3 × 7 Gy (PORTEC-2) | curie\_hdr | essai\_phase3 | portec2 ; esgo-endo-2021 ; esgo-endo-2025 |  |
| endo-vbt-7x3-hir | endo-hir | Curiethérapie vaginale exclusive HDR 3 × 7 Gy (pN0) | curie\_hdr | essai\_phase3 | portec2 ; esgo-endo-2021 |  |
| endo-pelv-46-23 | endo-hir | Pelvis 46 Gy / 23 fx (bras RTE de PORTEC-1 et PORTEC-2) | rte\_normo | essai\_phase3 | portec1 ; portec2 |  |
| endo-portec3 | endo-hr | Pelvis 48,6 Gy / 27 fx + cisplatine, puis carboplatine-paclitaxel (PORTEC-3) | rte\_normo | essai\_phase3 | portec3 ; gog258 ; esgo-endo-2021 |  |
| endo-pelv-45-vbt-curie | endo-hr | Pelvis 45 Gy / 25 fx + curiethérapie du fond vaginal 2 × 5 Gy | rte\_plus\_curie | pratique\_institutionnelle | portec3 ; nrg-atlas-postop | Institut Curie, protocole endomètre et col post-opératoire 2021 ; fiche du service |
| endo-pelv-lao-45-curie | endo-hr | Pelvis + lombo-aortique 45 Gy / 25 fx (± boost ganglionnaire 60 Gy) | rte\_normo | pratique\_institutionnelle | nrg-atlas-postop | Institut Curie, protocole endomètre et col post-opératoire 2021 |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| endo-vbt-7x3 | Vagin supérieur (HDR, prescription à 5 mm de la muqueuse) | 21 | 3 | 7 | seul | 3 séances | PORTEC-2 ; alternative du même essai : 30 Gy en bas débit |
| endo-vbt-7x3-hir | Vagin supérieur (HDR, prescription à 5 mm de la muqueuse) | 21 | 3 | 7 | seul | 3 séances | Uniquement si pN0 et pas d'emboles massifs |
| endo-pelv-46-23 | PTV pelvien | 46 | 23 | 2 | seul | 5 fx/sem | PORTEC-1 et PORTEC-2 |
| endo-portec3 | PTV pelvien | 48.6 | 27 | 1.8 | seul | 5 fx/sem | Début 4 à 6 semaines après la chirurgie (8 au plus) ; étalement ≤ 50 jours |
| endo-portec3 | Fond vaginal (HDR, si atteinte glandulaire ou stromale du col) | 10 | 2 | 5 | sequentiel | Après la RTE | Boost de PORTEC-3 : 14 Gy EQD2, schéma recommandé 2 × 5 Gy HDR |
| endo-pelv-45-vbt-curie | PTV\_45Gy | 45 | 25 | 1.8 | seul | 5 fx/sem | Prescription à la dose médiane ou moyenne ; mode SIB si PTV\_N |
| endo-pelv-45-vbt-curie | PTV\_N60Gy (adénopathie macroscopique) | 60 | 25 | 2.4 | SIB | 5 fx/sem | Uniquement si adénopathie visible |
| endo-pelv-45-vbt-curie | Fond vaginal (HDR, prescription à 5 mm) | 10 | 2 | 5 | sequentiel | Après la RTE | 20 à 30 mm de vagin supérieur selon l'anatomie (fiche du service) |
| endo-pelv-lao-45-curie | PTV\_45Gy (pelvis + lombo-aortique) | 45 | 25 | 1.8 | seul | 5 fx/sem | Lombo-aortique si N+ lombo-aortique prouvé ou radiologique, ou atteinte iliaque commune massive |
| endo-pelv-lao-45-curie | PTV\_N60Gy (adénopathie macroscopique) | 60 | 25 | 2.4 | SIB | 5 fx/sem | Uniquement si adénopathie visible |

**Tableau Schémas — liens** (même `id` que le tableau Schémas ; `contraintes_id` vide = afficher « Contraintes à compléter »)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| endo-vbt-7x3 | Cylindre vaginal HDR, dosimétrie sur scanner | Aucune | sim-gyn-vbt | vol-gyn-vbt |  |  |
| endo-vbt-7x3-hir | Cylindre vaginal HDR | Aucune | sim-gyn-vbt | vol-gyn-vbt |  |  |
| endo-pelv-46-23 | VMAT ou IMRT, IGRT quotidienne | Aucune | sim-gyn-postop | vol-gyn-postop |  |  |
| endo-portec3 | VMAT ou IMRT, IGRT quotidienne | Cisplatine 50 mg/m² semaines 1 et 4, puis 4 cures de carboplatine AUC 5 + paclitaxel 175 mg/m² toutes les 3 semaines | sim-gyn-postop | vol-gyn-postop |  |  |
| endo-pelv-45-vbt-curie | VMAT, kV-CBCT quotidien avec recalage osseux ; cylindre vaginal HDR | Cisplatine 40 mg/m² hebdomadaire possible (Curie) | sim-gyn-postop | vol-gyn-postop | ct-gyn-curie-rte | PTV\_45 : D95 > 95 %, D2 < 107 % ; ITV\_T : D98 > 95 % ; PTV\_N : D98 > 90 %, D2 < 107 % ; CTV\_N : D98 > 98 % |
| endo-pelv-lao-45-curie | VMAT, kV-CBCT quotidien + image kV/kV pour le rachis lombaire | Selon RCP | sim-gyn-postop | vol-gyn-postop | ct-gyn-curie-rte | Comme endo-pelv-45-vbt-curie |

Les jeux de contraintes Curie sont établis pour 45 Gy / 25 fx : ils ne sont pas liés aux schémas 46 Gy / 23 fx et 48,6 Gy / 27 fx, qui restent « Contraintes à compléter ».

## Curiethérapie

La curiethérapie du fond vaginal se fait seule (risque intermédiaire, intermédiaire-élevé pN0) ou en complément de la radiothérapie pelvienne (atteinte du col, stades II–III, marge vaginale). Les schémas sont dans les tableaux ci-dessus ; cette section donne ce que l'onglet « Curiethérapie » du module affiche en plus.

**Tableau Curiethérapie — indications** (affiché en tête de l'onglet Curiethérapie, filtre endomètre)

| indication | modalite | niveau\_preuve | note |
| --- | --- | --- | --- |
| Risque intermédiaire et intermédiaire-élevé pN0 | Curiethérapie vaginale exclusive HDR 3 × 7 Gy | Essai de phase 3 (PORTEC-2) | Récidive vaginale à 5 ans 1,8 % contre 1,6 % avec la RTE, beaucoup moins de toxicité digestive |
| Atteinte glandulaire ou stromale du col après RTE pelvienne | Complément 2 × 5 Gy HDR | Protocole PORTEC-3 | 14 Gy EQD2 |
| Après RTE pelvienne 45 Gy (Curie) | Complément 2 × 5 Gy HDR systématique | Pratique Institut Curie | La fiche du service le réserve aux stades II–III et aux marges R1 |

**Technique :** cylindre vaginal du plus grand diamètre toléré ; prescription à 5 mm de la muqueuse ; longueur traitée 20 à 30 mm de vagin supérieur après RTE (fiche du service). Pas de PTV.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-gyn-postop | Décubitus dorsal | Cale genoux + cale pieds, immobilisation pelvienne | Rectum vide (Normacol ; diamètre antéro-postérieur ≤ 5 cm) ; vessie confortable : 2 à 3 verres d'eau dans l'heure qui précède ; reproductibilité vessie et rectum à vérifier | Injecté (temps vasculaire) sauf contre-indication ; coupes ≤ 3 mm ; de L2–L3 + 5 cm (pelvis) ou des coupoles + 5 cm (lombo-aortique) jusqu'aux ischions + 15 cm | TEP-TDM du bilan si N+, fusion sur le bassin osseux | Fil plombé dans le fond vaginal si la cicatrisation est acquise (fiche du service) |
| sim-gyn-vbt | Décubitus dorsal ou position gynécologique | Cylindre vaginal fixé | Vessie et rectum vides | Scanner avec cylindre en place | — | Contrôle de la position du cylindre à chaque séance |

## Contourage

Deux jeux de volumes : pelvis post-opératoire (Curie, fiche du service, atlas NRG/RTOG 2021) et curiethérapie vaginale. Pas de GTV\_T après chirurgie, sauf résidu.

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-gyn-postop | GTV\_N# | GTV | Adénopathie visible ou prouvée, une structure par ganglion, nommée par son niveau de dose (GTV\_N60Gy) | Si adénopathie |  |
| vol-gyn-postop | CTV\_T | CTV | 3 à 4 cm supérieurs du vagin + cicatrice + 0,5 à 2 cm au-dessus selon la position du grêle + paravagin jusqu'à la paroi pelvienne, sans les aires ganglionnaires ; exclure les anses grêles. Fiche du service : limite inférieure à 1 cm au-dessus du bord inférieur des trous obturateurs ou 3 cm sous le marqueur vaginal (la plus basse), marge de 5 mm dans le paravagin au niveau du haut des têtes fémorales ; adapter à la longueur résiduelle du vagin | Toujours |  |
| vol-gyn-postop | ITV\_T | ITV | CTV\_T + 5 mm isotrope sans autre imagerie, ou ITV individualisé si plusieurs imageries post-opératoires | Toujours | 5 mm |
| vol-gyn-postop | CTV\_E | CTV | Marges anatomiques autour des vaisseaux. Toujours : iliaques internes, externes, obturatrices (fiche : + 15 mm distaux des iliaques communes). Iliaques communes entières : col atteint ; endomètre si N+ prouvé ou si risque intermédiaire-élevé ou haut sans curage pelvien. Présacrés : N+, col ou paramètres atteints, ligaments utéro-sacrés atteints (fiche : jusqu'à S2–S3). Inguinaux : tiers inférieur du vagin atteint ou adénopathie inguinale. Lombo-aortiques : N+ lombo-aortique prouvé ou radiologique, atteinte iliaque commune massive (fiche : jusqu'à D12–L1, au moins 2 cm au-dessus de l'adénopathie la plus haute). Lymphocèles si pN+ | Toujours |  |
| vol-gyn-postop | CTV\_N# | CTV | GTV\_N# + 3 mm | Si adénopathie | 3 mm |
| vol-gyn-postop | CTV\_45Gy | ITV | CTV\_E + ITV\_T | Toujours |  |
| vol-gyn-postop | PTV\_45Gy | PTV | CTV\_45Gy + 5 mm isotrope + tous les PTV\_N. Fiche du service : PTV-T = CTV-T + 1 cm, PTV-N = CTV-N + 0,5 cm (même résultat) | Toujours | 5 mm |
| vol-gyn-postop | PTV\_N# | PTV | CTV\_N# + 5 mm isotrope | Si adénopathie | 5 mm |
| vol-gyn-vbt | CTV vaginal | CTV | Muqueuse du vagin supérieur sur la longueur traitée ; dose prescrite à 5 mm de profondeur | Toujours |  |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-gyn-postop | oar-vessie ; oar-rectum ; oar-sigmoide ; oar-grele ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-moelle-osseuse ; oar-vulve ; oar-aile-iliaque-d (fiche) ; oar-aile-iliaque-g (fiche) ; oar-corps ; oar-queue-cheval (si boost ganglionnaire) ; oar-plexus-sacre (si boost ganglionnaire) ; oar-rein-d (si lombo-aortique) ; oar-rein-g (si lombo-aortique) ; oar-foie (si lombo-aortique) ; oar-moelle (si lombo-aortique) ; oar-duodenum (si lombo-aortique au-dessus de L1) ; oar-ovaire-d (si transposition) ; oar-ovaire-g (si transposition) | NRG/RTOG 2021, CTV post-opératoire ; RTOG 2012, OAR du pelvis |
| vol-gyn-vbt | oar-vessie ; oar-rectum ; oar-sigmoide | — |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | essai\_ids | note |
| --- | --- | --- | --- |
| Haut risque (PORTEC-3) | Cisplatine 50 mg/m² aux semaines 1 et 4 de la RTE, puis 4 cures de carboplatine AUC 5 + paclitaxel 175 mg/m² toutes les 3 semaines | portec3 | Survie globale et sans récidive améliorées, surtout stade III et carcinome séreux ; neuropathie G2+ persistante 6 % |
| Stade III–IVA | Chimiothérapie seule (6 cures) ou radiochimiothérapie | gog258 | Survie sans récidive identique ; la RT diminue les récidives vaginales (2 % vs 7 %) et ganglionnaires (11 % vs 20 %) |
| Pelvis 45 Gy (Curie) | Cisplatine 40 mg/m² hebdomadaire possible | esgo-endo-2021 | Selon RCP |
| Risque intermédiaire et intermédiaire-élevé | Aucun en standard | portec2 |  |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| endometre | Groupes ESGO-ESTRO-ESP 2021 (classification moléculaire inconnue) : faible = IA endométrioïde bas grade sans emboles ou emboles focaux ; intermédiaire = IB endométrioïde bas grade sans emboles massifs, IA haut grade sans emboles massifs, IA non endométrioïde sans invasion myométriale ; intermédiaire-élevé = stade I endométrioïde avec emboles massifs, IB haut grade, stade II ; haut = III–IVA sans résidu, I–IVA non endométrioïde avec invasion myométriale. Mise à jour 2025 : FIGO 2023 et profil moléculaire (POLE muté = risque abaissé, p53 anormal avec invasion myométriale = haut risque) |
| endometre | Vérifier le groupe de risque dans la recommandation ESGO-ESTRO-ESP en vigueur avant de choisir un schéma : ce tableau en est un résumé |
| endo-ri | Curiethérapie vaginale seule ; abstention possible avant 60 ans (PORTEC-1 : pas de RT avant 60 ans ni pour les grade 2 à invasion superficielle) |
| endo-hir | Radiothérapie pelvienne plutôt que curiethérapie seule si emboles massifs ou absence de stadification ganglionnaire (pNx) |
| endo-portec3 | Ne pas confondre 48,6 Gy / 27 fx (dose pelvienne de PORTEC-3) avec un boost ganglionnaire : la fiche du service écrit « boost intégré 48,6 Gy en 27 fractions pour les adénopathies macroscopiques » (écart E33) ; Curie booste les adénopathies à 60 Gy / 25 fx en SIB |
| endometre | CBCT quotidien avec recalage osseux : le fond vaginal doit rester dans l'ITV\_T, les vaisseaux dans le CTV\_E, à défaut dans le PTV\_45Gy ; tout le vagin visible sur le CBCT (Curie) |
| endo-pelv-lao-45-curie | Lombo-aortique : image kV/kV quotidienne en plus du CBCT ; décalage > 5 mm entre pelvis et lombo-aortique = repositionner ; pas de traitement sur Halcyon (Curie) |
| endometre | PORTEC-2 : récidive pelvienne isolée 1,5 % après curiethérapie contre 0,5 % après RTE (non significatif) ; toxicité digestive aiguë de grade 1–2 en fin de traitement nettement moindre (12,6 % vs 53,8 %) |
