# Bibliothèque — Contraintes dosimétriques

Mise à jour : Oct 24, 2026

## Jeux de contraintes — prostate

Jeux publiés et sourcés (Curie, Gustave Roussy, GEC-ESTRO, EMBRACE II, ABS, QUANTEC, ESTRO ACROP, Neo-AEGIS, consensus UK, RTOG 0933, HyTEC). Les tableurs du service sans source ont été retirés, sauf celui du canal anal, gardé comme pratique du service (`verification` = `service`) faute de jeu publié. Une contrainte dépend du fractionnement : l'app affiche toujours le jeu lié au schéma, jamais un autre.

**Tableau Jeux de contraintes**

| id | titre | fractionnement | source | verification |
| --- | --- | --- | --- | --- |
| ct-pro-2gy-curie | Prostate en place, 2 Gy/fx | 2 Gy/fx (74–80 Gy) | Institut Curie 2021 | verifie |
| ct-pro-25gy-28fx-curie | Prostate en place, 2,5 Gy/fx | 70 Gy en 28 fx | Institut Curie 2021 (rectum et vessie extrapolés par équivalence de BED, α/β = 3 et 4) | verifie |
| ct-pro-3gy-20fx-curie | Prostate en place, 3 Gy/fx | 60 Gy en 20 fx | Institut Curie 2021 | verifie |
| ct-pro-sbrt5-curie | SBRT prostate | 36,25 Gy en 5 fx | Institut Curie 2021 (SBRT) | verifie |
| ct-loge-66-33-curie | Loge prostatique | 66 Gy en 33 fx | Institut Curie 2021 (choix de service, un peu plus strict que prostate en place ; pas de D5% car dose modérée) | verifie |
| ct-curie-ldr-gec | Curiethérapie LDR iode 125 exclusive | 145 Gy (monothérapie uniquement, pas le boost) | GEC-ESTRO ACROP 2022, tableau 1 | verifie |
| ct-curie-hdr15-gec | Boost HDR 15 Gy | 15 Gy en 1 fx après RTE | GEC-ESTRO ACROP 2022, tableau 2 | verifie |
| ct-curie-hdr-eqd2-gec | Boost HDR après RTE, objectifs en EQD2 cumulée | RTE 25 × 2 Gy + HDR 15 Gy × 1, α/β = 1,5 (base de calcul du tableau) | GEC-ESTRO ACROP 2022, tableau 2 | verifie |

**Tableau Jeux de contraintes** (suite — pelvis : vessie, gynéco, rectum, canal anal)

| id | titre | fractionnement | source | verification |
| --- | --- | --- | --- | --- |
| ct-quantec-grele | Intestin grêle (QUANTEC) | Fractionnement classique | QUANTEC 2010 (Kavanagh) | verifie |
| ct-col-embrace2-rte | Col en place, RTE | 45 Gy / 25 fx, adénopathies 55–57,5 Gy en SIB | EMBRACE II, tableau 9.4 | verifie |
| ct-col-embrace2-curie | Col, curiethérapie guidée par l'image (EQD2 RTE + curiethérapie) | 45 Gy / 25 fx + HDR ou PDR | EMBRACE II, tableaux 10.1 et 10.2 | verifie |
| ct-col-abs-hdr | Col, curiethérapie HDR (ABS) | 45 Gy + 5 × 5,5–6 Gy | ABS 2012 | verifie |
| ct-gyn-curie-rte | Gynéco Curie (col en place, col opéré, endomètre, vagin, vulve) | 45 Gy / 25 fx ± SIB | Institut Curie 2021 (protocoles col-vagin, endomètre-col post-opératoire, vulve) | verifie |
| ct-service-anal | Canal anal, tableur du service | 59,4 Gy / 33 fx + pelvis 36 Gy / 20 fx | Tableur du service « Canal anal » (pratique du service) | service |

**Tableau Lignes de contraintes**

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-pro-2gy-curie | oar-rectum | D5% |  | ≤ 80 Gy |  |
| ct-pro-2gy-curie | oar-rectum | D20% | ≤ 65 Gy | ≤ 70 Gy |  |
| ct-pro-2gy-curie | oar-rectum | D30% | ≤ 60 Gy | ≤ 65 Gy |  |
| ct-pro-2gy-curie | oar-rectum | D55% | ≤ 50 Gy |  |  |
| ct-pro-2gy-curie | oar-vessie | D5% | ≤ 75 Gy | ≤ 80 Gy |  |
| ct-pro-2gy-curie | oar-vessie | D25% | ≤ 65 Gy | ≤ 70 Gy |  |
| ct-pro-2gy-curie | oar-vessie | D55% | ≤ 50 Gy | ≤ 55 Gy |  |
| ct-pro-2gy-curie | oar-grele | Dmoy | ≤ 30 Gy |  |  |
| ct-pro-2gy-curie | oar-grele | V45Gy | ≤ 200 cm³ | ≤ 300 cm³ | Jusqu'à 350 cm³ si irradiation lombo-aortique |
| ct-pro-2gy-curie | oar-tete-femorale-d ; oar-tete-femorale-g | D5% |  | ≤ 55 Gy | Chaque tête |
| ct-pro-2gy-curie | oar-sigmoide |  | Aussi bas que possible | Comme le rectum |  |
| ct-pro-25gy-28fx-curie | oar-rectum | D5% |  | ≤ 70 Gy |  |
| ct-pro-25gy-28fx-curie | oar-rectum | D20% | ≤ 59 Gy | ≤ 63 Gy |  |
| ct-pro-25gy-28fx-curie | oar-rectum | D30% | ≤ 55 Gy | ≤ 59 Gy |  |
| ct-pro-25gy-28fx-curie | oar-rectum | D55% | ≤ 46 Gy |  |  |
| ct-pro-25gy-28fx-curie | oar-vessie | D5% | ≤ 68 Gy | ≤ 73 Gy |  |
| ct-pro-25gy-28fx-curie | oar-vessie | D25% | ≤ 60 Gy | ≤ 64 Gy |  |
| ct-pro-25gy-28fx-curie | oar-vessie | D55% | ≤ 46 Gy | ≤ 51 Gy |  |
| ct-pro-25gy-28fx-curie | oar-grele | Dmoy | ≤ 30 Gy |  |  |
| ct-pro-25gy-28fx-curie | oar-grele | V45Gy | ≤ 200 cm³ | ≤ 300 cm³ | Jusqu'à 350 cm³ si irradiation lombo-aortique |
| ct-pro-25gy-28fx-curie | oar-tete-femorale-d ; oar-tete-femorale-g | D5% |  | ≤ 55 Gy |  |
| ct-pro-25gy-28fx-curie | oar-sigmoide |  | Aussi bas que possible | Comme le rectum |  |
| ct-pro-3gy-20fx-curie | oar-rectum | V60Gy |  | ≤ 5 % |  |
| ct-pro-3gy-20fx-curie | oar-rectum | V57Gy | ≤ 10 % | ≤ 20 % |  |
| ct-pro-3gy-20fx-curie | oar-rectum | V50Gy | ≤ 25 % | ≤ 35 % |  |
| ct-pro-3gy-20fx-curie | oar-rectum | V40Gy | ≤ 45 % | ≤ 55 % |  |
| ct-pro-3gy-20fx-curie | oar-vessie | V60Gy |  | ≤ 5 % |  |
| ct-pro-3gy-20fx-curie | oar-vessie | V50Gy | ≤ 5 % | ≤ 15 % |  |
| ct-pro-3gy-20fx-curie | oar-vessie | V40Gy | ≤ 35 % | ≤ 45 % |  |
| ct-pro-3gy-20fx-curie | oar-tete-femorale-d ; oar-tete-femorale-g | D5% |  | ≤ 55 Gy |  |
| ct-pro-3gy-20fx-curie | oar-sigmoide |  | Aussi bas que possible | Comme le rectum |  |
| ct-pro-3gy-20fx-curie | oar-grele | Recouvrement PTV / grêle |  | Aucun |  |
| ct-pro-sbrt5-curie | oar-rectum | D50% |  | < 18,1 Gy |  |
| ct-pro-sbrt5-curie | oar-rectum | D20% |  | < 29 Gy |  |
| ct-pro-sbrt5-curie | oar-rectum | D10% |  | < 32,6 Gy |  |
| ct-pro-sbrt5-curie | oar-rectum | D2cc |  | < 36 Gy |  |
| ct-pro-sbrt5-curie | oar-rectum | D1cc | < 36 Gy |  |  |
| ct-pro-sbrt5-curie | oar-rectum | Dmax | < 38 Gy |  |  |
| ct-pro-sbrt5-curie | oar-vessie | D40% |  | < 18,1 Gy |  |
| ct-pro-sbrt5-curie | oar-vessie | D10cc |  | < 37 Gy |  |
| ct-pro-sbrt5-curie | oar-vessie | D5cc | < 37 Gy |  |  |
| ct-pro-sbrt5-curie | oar-vessie | D1cc | < 38 Gy |  |  |
| ct-pro-sbrt5-curie | oar-vessie | Dmax | < 41,8 Gy |  |  |
| ct-pro-sbrt5-curie | oar-tete-femorale-d ; oar-tete-femorale-g | D5% | < 14,5 Gy |  |  |
| ct-pro-sbrt5-curie | oar-grele | D5cc | < 18,1 Gy |  | Sigmoïde inclus |
| ct-pro-sbrt5-curie | oar-grele | D1cc | < 30 Gy |  |  |
| ct-pro-sbrt5-curie | oar-bulbe | D50% | < 29,5 Gy |  |  |
| ct-pro-sbrt5-curie | oar-uretre | D50% | ≤ 42 Gy |  | Dmax du plan en dehors de l'urètre (optimal) |
| ct-loge-66-33-curie | oar-rectum | D20% | ≤ 65 Gy | ≤ 70 Gy | Pas de contrainte D5% (dose modérée) |
| ct-loge-66-33-curie | oar-rectum | D30% | ≤ 60 Gy | ≤ 65 Gy |  |
| ct-loge-66-33-curie | oar-rectum | D55% | ≤ 50 Gy |  |  |
| ct-loge-66-33-curie | oar-vessie | D25% | ≤ 65 Gy | ≤ 70 Gy |  |
| ct-loge-66-33-curie | oar-vessie | D55% | ≤ 50 Gy | ≤ 55 Gy |  |
| ct-loge-66-33-curie | oar-grele | Dmoy | ≤ 30 Gy |  |  |
| ct-loge-66-33-curie | oar-grele | V45Gy | ≤ 200 cm³ | ≤ 300 cm³ | Jusqu'à 350 cm³ si irradiation lombo-aortique |
| ct-loge-66-33-curie | oar-sigmoide |  | Aussi bas que possible | Comme le rectum |  |
| ct-loge-66-33-curie | oar-tete-femorale-d ; oar-tete-femorale-g | D5% |  | ≤ 55 Gy |  |
| ct-curie-ldr-gec | oar-rectum | D2cc |  | ≤ 145 Gy | Monothérapie 145 Gy uniquement |
| ct-curie-ldr-gec | oar-rectum | D0.1cc |  | < 200 Gy | Monothérapie 145 Gy uniquement |
| ct-curie-ldr-gec | oar-uretre | D10 |  | < 150 % de la dose prescrite |  |
| ct-curie-ldr-gec | oar-uretre | D30 |  | < 130 % de la dose prescrite |  |
| ct-curie-ldr-gec | oar-uretre | D0.1cc |  |  | À rapporter, sans seuil |
| ct-curie-hdr15-gec | oar-rectum | D2cc |  | ≤ 10 Gy |  |
| ct-curie-hdr15-gec | oar-uretre | D10 |  | ≤ 17 Gy |  |
| ct-curie-hdr15-gec | oar-uretre | D30 |  | ≤ 15 Gy |  |
| ct-curie-hdr-eqd2-gec | cible-ctv | D90 |  | > 121 Gy EQD2 | Cumul RTE 25 × 2 Gy + HDR 15 Gy |
| ct-curie-hdr-eqd2-gec | oar-rectum | D2cc |  | ≤ 75 Gy EQD2 | Cumul RTE + HDR |
| ct-curie-hdr-eqd2-gec | oar-uretre | D10 |  | ≤ 120 Gy EQD2 | Cumul RTE + HDR |
| ct-curie-hdr-eqd2-gec | oar-uretre | D30 |  | ≤ 105 Gy EQD2 | Cumul RTE + HDR |

**Tableau Lignes de contraintes** (suite — jeux publiés du pelvis)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-quantec-grele | oar-grele | V15Gy (anses contourées une à une) |  | < 120 cm³ | Toxicité aiguë G3+ |
| ct-quantec-grele | oar-grele | V45Gy (cavité péritonéale entière) |  | < 195 cm³ | Selon la méthode de contourage |
| ct-col-embrace2-rte | cible-ptv | PTV45 : V95% |  | > 95 % |  |
| ct-col-embrace2-rte | cible-ptv | PTV45 : Dmax |  | < 107 % | Sans boost ganglionnaire |
| ct-col-embrace2-rte | cible-ctv | ITV45 : Dmin |  | > 95 % |  |
| ct-col-embrace2-rte | cible-ptv | PTV-N : D98% |  | > 90 % de la dose ganglionnaire |  |
| ct-col-embrace2-rte | cible-ptv | PTV-N : Dmax |  | < 107 % de la dose ganglionnaire |  |
| ct-col-embrace2-rte | cible-ctv | CTV-N : D98% |  | > 100 % de la dose ganglionnaire |  |
| ct-col-embrace2-rte | cible-ctv | CTV-N : D50% | > 102 % |  |  |
| ct-col-embrace2-rte | oar-help-ctvhr10 | Dmax | < 103 % |  |  |
| ct-col-embrace2-rte | oar-grele | Dmax |  | < 105 % (47,3 Gy) | Sans boost ganglionnaire |
| ct-col-embrace2-rte | oar-grele | V40Gy | < 100 cm³ |  | Sans boost ganglionnaire |
| ct-col-embrace2-rte | oar-grele | V30Gy | < 350 cm³ |  | Sans boost ganglionnaire |
| ct-col-embrace2-rte | oar-grele | V40Gy | < 250 cm³ |  | Boost ganglionnaire ou lombo-aortique |
| ct-col-embrace2-rte | oar-grele | V30Gy | < 500 cm³ |  | Boost ganglionnaire ou lombo-aortique |
| ct-col-embrace2-rte | oar-grele | Dmax | < 57,5 Gy |  | Boost ganglionnaire ou lombo-aortique |
| ct-col-embrace2-rte | oar-sigmoide | Dmax |  | < 105 % (47,3 Gy) | Sans boost ganglionnaire |
| ct-col-embrace2-rte | oar-sigmoide | Dmax | < 57,5 Gy |  | Avec boost |
| ct-col-embrace2-rte | oar-vessie | Dmax |  | < 105 % (47,3 Gy) | Sans boost ganglionnaire |
| ct-col-embrace2-rte | oar-vessie | V40Gy | < 75 % |  |  |
| ct-col-embrace2-rte | oar-vessie | V30Gy | < 85 % |  |  |
| ct-col-embrace2-rte | oar-vessie | Dmax | < 57,5 Gy |  | Avec boost |
| ct-col-embrace2-rte | oar-rectum | Dmax |  | < 105 % (47,3 Gy) | Sans boost ganglionnaire |
| ct-col-embrace2-rte | oar-rectum | V40Gy | < 85 % |  |  |
| ct-col-embrace2-rte | oar-rectum | V30Gy | < 95 % |  |  |
| ct-col-embrace2-rte | oar-rectum | Dmax | < 57,5 Gy |  | Avec boost |
| ct-col-embrace2-rte | oar-moelle | Dmax |  | < 48 Gy |  |
| ct-col-embrace2-rte | oar-tete-femorale-d | Dmax |  | < 50 Gy |  |
| ct-col-embrace2-rte | oar-tete-femorale-g | Dmax |  | < 50 Gy |  |
| ct-col-embrace2-rte | oar-rein-d | Dmoy | < 10 Gy | < 15 Gy |  |
| ct-col-embrace2-rte | oar-rein-g | Dmoy | < 10 Gy | < 15 Gy |  |
| ct-col-embrace2-rte | oar-corps | Dmax |  | < 107 % | Sans boost ganglionnaire |
| ct-col-embrace2-rte | oar-vagin | D(PIBS − 2 cm) | < 5 Gy |  | Vagin non envahi |
| ct-col-embrace2-rte | oar-ovaire-d | Dose | < 5–8 Gy |  | Optionnel |
| ct-col-embrace2-rte | oar-ovaire-g | Dose | < 5–8 Gy |  | Optionnel |
| ct-col-embrace2-rte | oar-duodenum | V55Gy | < 15 cm³ |  | Optionnel |
| ct-col-embrace2-curie | cible-ctv | CTV-HR : D90 (EQD2₁₀) | 90 à 95 Gy | > 85 Gy | EQD2 cumulée RTE 45 Gy / 25 fx + curiethérapie |
| ct-col-embrace2-curie | cible-ctv | CTV-HR : D98 | > 75 Gy |  |  |
| ct-col-embrace2-curie | cible-ctv | GTV-res : D98 | > 95 Gy | > 90 Gy |  |
| ct-col-embrace2-curie | cible-ctv | CTV-IR : D98 | > 60 Gy |  |  |
| ct-col-embrace2-curie | cible-ctv | Point A | > 65 Gy |  | Garde-fou contre une dose trop faible sur un petit volume |
| ct-col-embrace2-curie | oar-vessie | D2cm³ (EQD2₃) | < 80 Gy | < 90 Gy |  |
| ct-col-embrace2-curie | oar-rectum | D2cm³ (EQD2₃) | < 65 Gy | < 75 Gy |  |
| ct-col-embrace2-curie | oar-point-rv | Dose au point (EQD2₃) | < 65 Gy | < 75 Gy | Priorité de la désescalade vaginale |
| ct-col-embrace2-curie | oar-sigmoide | D2cm³ (EQD2₃) | < 70 Gy | < 75 Gy | Valable si les anses sont peu mobiles |
| ct-col-embrace2-curie | oar-grele | D2cm³ (EQD2₃) | < 70 Gy | < 75 Gy | Valable si les anses sont peu mobiles |
| ct-col-embrace2-curie | oar-vagin | Points latéraux à 5 mm (EQD2₃) | < 85 Gy |  | Tableau 10.2 |
| ct-col-embrace2-curie | oar-vagin | TRAK vaginal / TRAK total | < 30–40 % |  | Tableau 10.2 |
| ct-col-abs-hdr | cible-ctv | CTV-HR : D90 (EQD2₁₀) | ≥ 80 Gy si réponse complète ou résidu < 4 cm ; 85–90 Gy si résidu > 4 cm |  |  |
| ct-col-abs-hdr | oar-rectum | D2cm³ (EQD2₃) |  | 70–75 Gy |  |
| ct-col-abs-hdr | oar-sigmoide | D2cm³ (EQD2₃) |  | 70–75 Gy |  |
| ct-col-abs-hdr | oar-vessie | D2cm³ (EQD2₃) |  | ≤ 90 Gy |  |
| ct-gyn-curie-rte | cible-ptv | PTV45 : D95% |  | > 95 % |  |
| ct-gyn-curie-rte | cible-ptv | PTV45 : D2% |  | < 107 % | Sans boost ganglionnaire ; déviation acceptable < 110 % |
| ct-gyn-curie-rte | cible-ctv | ITV45 (col), ITV\_T (col opéré, endomètre), CTV\_T (vulve) : D98% |  | > 95 % |  |
| ct-gyn-curie-rte | cible-ptv | PTV\_Tboost (vulve) : D95% / D2% |  | > 95 % / < 107 % |  |
| ct-gyn-curie-rte | cible-ptv | PTV\_N : D98% |  | > 90 % de la dose ganglionnaire |  |
| ct-gyn-curie-rte | cible-ptv | PTV\_N : D2% |  | < 107 % de la dose ganglionnaire |  |
| ct-gyn-curie-rte | cible-ctv | CTV\_N : D98% |  | > 98 % de la dose ganglionnaire |  |
| ct-gyn-curie-rte | oar-help-ctvhr10 | D2% | < 103 % |  | Col en place |
| ct-gyn-curie-rte | oar-corps | V43Gy / volume du PTV45 | < 1,1 (idéalement 1,05) |  |  |
| ct-gyn-curie-rte | oar-corps | V43Gy | < 2200 cm³ |  |  |
| ct-gyn-curie-rte | oar-grele | V40Gy | < 100 cm³ |  | Sans boost ganglionnaire |
| ct-gyn-curie-rte | oar-grele | V30Gy | < 350 cm³ |  | Sans boost ganglionnaire |
| ct-gyn-curie-rte | oar-grele | D2% | < 105 % (47,3 Gy) |  | Sans boost ganglionnaire |
| ct-gyn-curie-rte | oar-grele | V40Gy | < 250 cm³ |  | Boost ganglionnaire ou lombo-aortique |
| ct-gyn-curie-rte | oar-grele | V30Gy | < 500 cm³ |  | Boost ganglionnaire ou lombo-aortique |
| ct-gyn-curie-rte | oar-grele | D2% | < 57,5 Gy |  | Boost ganglionnaire ou lombo-aortique |
| ct-gyn-curie-rte | oar-sigmoide | D2% | < 105 % (47,3 Gy) sans boost ; < 57,5 Gy avec boost |  |  |
| ct-gyn-curie-rte | oar-vessie | D2% | < 105 % (47,3 Gy) sans boost ; < 57,5 Gy avec boost |  |  |
| ct-gyn-curie-rte | oar-vessie | V40Gy | < 75 % (idéalement < 40 %) |  |  |
| ct-gyn-curie-rte | oar-vessie | V30Gy | < 85 % |  |  |
| ct-gyn-curie-rte | oar-rectum | D2% | < 105 % (47,3 Gy) sans boost ; < 57,5 Gy avec boost |  |  |
| ct-gyn-curie-rte | oar-rectum | V40Gy | < 85 % (idéalement < 40 %) |  |  |
| ct-gyn-curie-rte | oar-rectum | V30Gy | < 95 % |  |  |
| ct-gyn-curie-rte | oar-vulve | Dose | Aussi basse que possible |  | Vulve traitée par irradiation ganglionnaire seule |
| ct-gyn-curie-rte | oar-queue-cheval | D2% |  | < 48 Gy |  |
| ct-gyn-curie-rte | oar-plexus-sacre | D2% |  | < 60 Gy |  |
| ct-gyn-curie-rte | oar-canal-medullaire | D2% |  | < 48 Gy |  |
| ct-gyn-curie-rte | oar-tete-femorale-d | D2% | < 50 Gy |  |  |
| ct-gyn-curie-rte | oar-tete-femorale-g | D2% | < 50 Gy |  |  |
| ct-gyn-curie-rte | oar-moelle-osseuse | V10Gy | < 90 % |  |  |
| ct-gyn-curie-rte | oar-moelle-osseuse | V20Gy | < 80 % |  |  |
| ct-gyn-curie-rte | oar-rein-d | Dmoy | < 10 Gy |  | Déviation acceptable < 15 Gy |
| ct-gyn-curie-rte | oar-rein-g | Dmoy | < 10 Gy |  | Déviation acceptable < 15 Gy |
| ct-gyn-curie-rte | oar-duodenum | V55Gy | < 15 cm³ |  |  |

**Tableau Lignes de contraintes** (suite — tableur du service, canal anal)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-service-anal | cible-ptv | PTV36 et PTV60 : D98% / D95% | D98 ≥ 95 % | D95 ≥ 95 % |  |
| ct-service-anal | cible-ptv | PTV36 et PTV60 : Dmax / D2% | Dmax < 107 % | D2 < 107 % |  |
| ct-service-anal | cible-ptv | PTV36 et PTV60 : D50% | = dose prescrite |  |  |
| ct-service-anal | oar-tete-femorale-d | V50 | ≤ 10 % |  |  |
| ct-service-anal | oar-tete-femorale-g | V50 | ≤ 10 % |  |  |
| ct-service-anal | oar-sigmoide | Dmax / D2% | Dmax < 55 Gy | D2% = dose prescrite |  |
| ct-service-anal | oar-sigmoide | V40 | ≤ 40 % | ≤ 60 % |  |
| ct-service-anal | oar-grele | V15 / V30 / V45 / V50 | ≤ 830 / < 500 / ≤ 150 / ≤ 35 cm³ |  |  |
| ct-service-anal | oar-vessie | D2% | = dose prescrite |  |  |
| ct-service-anal | oar-vessie | V40 | ≤ 40 % | ≤ 60 % |  |
| ct-service-anal | oar-moelle-osseuse | V10 / V20 / V25 | ≤ 90 % / ≤ 80 % / ≤ 70 % |  | Priorité à la couverture du PTV |
| ct-service-anal | oar-greffon-renal | Dmoy / V20 | Dmoy < 16,2 Gy ; V20 < 30 % |  |  |
| ct-service-anal | oar-oge | Dmoy / V30 | Dmoy < 30 Gy ; V30 < 35 % |  | Priorité à la couverture du PTV |
| ct-service-anal | oar-plis-inguinaux | Dmoy | < 30 Gy |  | Priorité à la couverture du PTV |
| ct-service-anal | oar-queue-cheval | Dmax | < 54 Gy |  |  |

**Tableau Aide des colonnes** (texte du « ? » placé à côté des en-têtes Idéal et Limitant ; la première ligne dont le texte `source_contient` figure dans la source du jeu s'applique, sinon la ligne `defaut`)

| source\_contient | ideal | limitant |
| --- | --- | --- |
| métastases cérébrales | À minimiser ; ne bloque pas la validation du plan. | Contrainte limitante : plan non validé au-delà. |
| RTOG 0933 | Valeur du protocole. | Déviation acceptable du protocole. |
| HyTEC | Objectif recommandé. | Seuil associé au risque indiqué en note. |
| EMBRACE II | Contrainte souple, sans base clinique directe, atteinte chez 70 à 80 % des patientes. | À ne pas dépasser sauf avis médical. |
| Institut Curie | Valeur recommandée. Peut être dépassée sur accord médical, la couverture des cibles restant prioritaire. | Valeur acceptable. |
| Gustave Roussy | Valeur recommandée. | Valeur acceptable. |
| Hanna 2018 | Valeur optimale. | Valeur obligatoire. |
| Neo-AEGIS | Objectif optimal. | À ne pas dépasser sauf avis médical. |
| defaut | À atteindre si possible. | À ne pas dépasser sauf avis médical. |
| Tableur du service | Objectif du service. | Valeur acceptable pour le service. |
| FAST-Forward | — | Contrainte de dose du protocole de l'essai. |
| Sénorif | Objectif du référentiel régional. | — |

**Tableau Jeux de contraintes** (suite — lot C thorax et digestif haut)

| id | titre | fractionnement | source | verification |
| --- | --- | --- | --- | --- |
| ct-thorax-quantec | Thorax, fractionnement classique | 1,8–2 Gy/fx (poumon, œsophage) | QUANTEC 2010 (Marks, Werner-Wasik, Kirkpatrick) ; RTOG 0617 | verifie |
| ct-oeso-neoaegis | Œsophage préopératoire (CROSS) | 41,4 Gy / 23 fx | Protocole Neo-AEGIS (BMC Cancer 2017) | verifie |
| ct-pou-sbrt-curie-3fx | SBRT pulmonaire, 3 fractions | 3 fx (45 et 54 Gy) | Institut Curie, SBRT d'un nodule pulmonaire, version du 05/12/2021 (KEYNOTE-867, RTOG 0813, Ma 2019, HyTEC 2021) | verifie |
| ct-pou-sbrt-curie-4fx | SBRT pulmonaire, 4 fractions | 4 fx (48 Gy) | Institut Curie, SBRT d'un nodule pulmonaire, version du 05/12/2021 | verifie |
| ct-pou-sbrt-curie-5-8fx | SBRT pulmonaire, 5 ou 8 fractions | 5 fx (50 Gy) ou 8 fx (60 Gy) | Institut Curie, SBRT d'un nodule pulmonaire, version du 05/12/2021 (RTOG 0813, Manyam 2020, SABR UK v6.1) | verifie |
| ct-pou-sbrt-igr-3fx | SBRT pulmonaire, 3 × 18 Gy | 54 Gy / 3 fx | Gustave Roussy, protocole SBRT pulmonaire RLS-PTC-007 (2016) | verifie |
| ct-pou-sbrt-igr-5plus | SBRT pulmonaire, 5 séances ou plus | 5 à 10 fx | Gustave Roussy, protocole SBRT pulmonaire RLS-PTC-007 (2016) | verifie |
| ct-meso-igr-postop | Mésothéliome, RT hémithoracique post-opératoire | Fractionnement classique | Gustave Roussy, fiche dosimétrique mésothéliome post-opératoire | verifie |
| ct-meso-igr-preop-5x5 | Mésothéliome, RT pré-opératoire 5 × 5 Gy | 25 Gy / 5 fx | Gustave Roussy, fiche dosimétrique mésothéliome pré-opératoire | verifie |
| ct-abdo-acrop-crt | Abdomen, radiochimiothérapie classique | 1,8–2 Gy/fx (45–54 Gy) | ESTRO ACROP pancréas 2021, tableau 4a (d'après QUANTEC, RTOG 0848, SCALOP-2, NCCN) | verifie |
| ct-sbrt-abdo-5fx | SBRT abdominale, 5 fractions | 5 fx | Consensus UK SABR (Hanna 2018), repris par l'ESTRO ACROP pancréas 2021 | verifie |
| ct-foie-sbrt-igr-3fx | SBRT hépatique, 3 fractions | 3 × 15 Gy | Gustave Roussy, stéréotaxie hépatique v1 (2016) | verifie |
| ct-foie-sbrt-igr-5fx | SBRT hépatique, 5 fractions | 5 × 6,5 à 5 × 9 Gy | Gustave Roussy, stéréotaxie hépatique v1 (2016), d'après RTOG 0438 | verifie |
| ct-foie-sbrt-igr-10fx | RT stéréotaxique hépatique, 10 fractions ou plus | 10 × 5 Gy | Gustave Roussy, stéréotaxie hépatique v1 (2016), d'après RTOG 0438 | verifie |

**Tableau Lignes de contraintes** (suite — lot C)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-thorax-quantec | oar-poumons | V20Gy |  | ≤ 30–35 % | Pneumopathie ≤ 20 % (CBNPC) |
| ct-thorax-quantec | oar-poumons | Dmoy |  | ≤ 20–23 Gy | Pneumopathie ≤ 20 % (CBNPC) |
| ct-thorax-quantec | oar-oesophage | Dmoy | < 34 Gy |  | Recommandation de RTOG 0617 ; pas de point chaud au-delà de la dose prescrite |
| ct-thorax-quantec | oar-moelle | Dmax |  | < 54 Gy | Myélopathie < 1 % à 54 Gy, < 10 % à 61 Gy |
| ct-thorax-quantec | oar-coeur | V5Gy et V30Gy | Aussi bas que possible |  | Prédictifs de la survie (RTOG 0617) |
| ct-oeso-neoaegis | oar-poumons | V20Gy | < 25 % |  | Objectif « si possible » |
| ct-oeso-neoaegis | oar-coeur | V40Gy | < 30 % |  | Objectif optimal |
| ct-oeso-neoaegis | oar-coeur | V25Gy | < 50 % |  | Objectif optimal |
| ct-oeso-neoaegis | oar-foie | V30Gy |  | < 30 % |  |
| ct-oeso-neoaegis | oar-moelle | D0,03cc |  | ≤ 45 Gy |  |
| ct-oeso-neoaegis | oar-moelle | D1cc du PRV moelle |  | < 40 Gy | Point maximal toléré jusqu'à 45 Gy si le PTV touche le PRV |
| ct-pou-sbrt-curie-3fx | oar-poumons | Dmoy (poumons − (i)GTV) | ≤ 8 Gy | ≤ 8 Gy | HyTEC 2021 : pas de déviation acceptable |
| ct-pou-sbrt-curie-3fx | oar-poumons | V20Gy (poumons − (i)GTV) | < 10 % | < 10 % | HyTEC 2021 : pas de déviation acceptable |
| ct-pou-sbrt-curie-3fx | oar-paroi-thoracique | D30cc | < 30 Gy |  | Ma 2019 ; vaut pour tous les fractionnements |
| ct-pou-sbrt-curie-3fx | oar-canal-medullaire | D1,2cc (canal + 5 mm) | < 13 Gy | < 13,7 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-canal-medullaire | D0,03cc (canal + 5 mm) | < 22,5 Gy | < 23,6 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-plexus-brachial-d ; oar-plexus-brachial-g | D3cc (plexus + 5 mm) | < 22 Gy | < 23,1 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-plexus-brachial-d ; oar-plexus-brachial-g | D0,03cc (plexus + 5 mm) | < 26 Gy | < 27,3 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-arbre-bronchique | D5cc | < 25,8 Gy | < 27,1 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-arbre-bronchique | D0,03cc | < 30 Gy | < 31,5 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-coeur | D15cc | < 24 Gy | < 25,2 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-coeur | D0,03cc | < 30 Gy | < 31,5 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-gros-vaisseaux | D10cc | < 39 Gy | < 41 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-gros-vaisseaux | D0,03cc | < 45 Gy | < 47,3 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-cotes | D5cc | < 40 Gy | < 42 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-cotes | D0,03cc | < 50 Gy | < 52,5 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-oesophage | D5cc | < 17,7 Gy | < 18,6 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-oesophage | D0,03cc | < 27 Gy | < 28,4 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-estomac | D10cc | < 22,5 Gy | < 23,6 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-estomac | D0,03cc | < 30 Gy | < 31,5 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-duodenum | D10cc | < 15 Gy | < 15,8 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-duodenum | D0,03cc | < 24 Gy | < 25,2 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-grele ; oar-colon | D20cc | < 24 Gy | < 25,2 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-grele ; oar-colon | D0,03cc | < 34,5 Gy | < 36,2 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-peau | D10cc | < 31 Gy | < 32,6 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-peau | D0,03cc | < 33 Gy | < 34,7 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-poumons | D15 % (poumons − (i)GTV) | < 20 Gy | < 22 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-poumons | D37 % (poumons − (i)GTV) | < 11 Gy | < 12,1 Gy |  |
| ct-pou-sbrt-curie-3fx | oar-poumons | Volume poumon sain − volume de l'isodose 11,4 Gy | > 1000 cc |  |  |
| ct-pou-sbrt-curie-3fx | oar-poumons | Volume poumon sain − volume de l'isodose 10,5 Gy | > 1500 cc |  |  |
| ct-pou-sbrt-curie-3fx | oar-reins | Volume reins − volume de l'isodose 15 Gy | > 200 cc |  |  |
| ct-pou-sbrt-curie-3fx | oar-foie | Volume foie − volume de l'isodose 17,1 Gy | > 700 cc |  |  |
| ct-pou-sbrt-curie-4fx | oar-poumons | Dmoy (poumons − (i)GTV) | ≤ 8 Gy | ≤ 8 Gy | HyTEC 2021 : pas de déviation acceptable |
| ct-pou-sbrt-curie-4fx | oar-poumons | V20Gy (poumons − (i)GTV) | < 10 % | < 10 % | HyTEC 2021 : pas de déviation acceptable |
| ct-pou-sbrt-curie-4fx | oar-paroi-thoracique | D30cc | < 30 Gy |  | Ma 2019 ; vaut pour tous les fractionnements |
| ct-pou-sbrt-curie-4fx | oar-canal-medullaire | D1,2cc (canal + 5 mm) | < 14,4 Gy | < 15,1 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-canal-medullaire | D0,35cc (canal + 5 mm) | < 20 Gy | < 21 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-canal-medullaire | D0,03cc (canal + 5 mm) | < 25,2 Gy | < 26,5 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-plexus-brachial-d ; oar-plexus-brachial-g | D3cc (plexus + 5 mm) | < 24,8 Gy | < 26 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-plexus-brachial-d ; oar-plexus-brachial-g | D0,03cc (plexus + 5 mm) | < 29,6 Gy | < 31,1 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-arbre-bronchique | D5cc | < 28 Gy | < 29,4 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-arbre-bronchique | D0,03cc | < 34 Gy | < 35,7 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-coeur | D15cc | < 28 Gy | < 29,4 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-coeur | D0,03cc | < 34 Gy | < 35,7 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-gros-vaisseaux | D10cc | < 43 Gy | < 45,2 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-gros-vaisseaux | D0,03cc | < 49 Gy | < 51,5 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-cotes | D5cc | < 43 Gy | < 45,2 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-cotes | D0,03cc | < 54 Gy | < 56,7 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-oesophage | D5cc | < 20 Gy | < 21 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-oesophage | D0,03cc | < 30 Gy | < 31,5 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-estomac | D10cc | < 25 Gy | < 26,3 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-estomac | D0,03cc | < 33,2 Gy | < 34,9 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-duodenum | D5cc | < 16,8 Gy | < 17,6 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-duodenum | D0,03cc | < 26,4 Gy | < 27,7 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-grele ; oar-colon | D20cc | < 26,4 Gy | < 27,7 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-grele ; oar-colon | D0,03cc | < 36 Gy | < 37,8 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-peau | D10cc | < 33,6 Gy | < 35,3 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-peau | D0,03cc | < 36 Gy | < 37,8 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-poumons | D37 % (poumons − (i)GTV) | < 12,4 Gy | < 13,7 Gy |  |
| ct-pou-sbrt-curie-4fx | oar-poumons | Volume poumon sain − volume de l'isodose 12,4 Gy | > 1000 cc |  |  |
| ct-pou-sbrt-curie-4fx | oar-poumons | Volume poumon sain − volume de l'isodose 11,6 Gy | > 1500 cc |  |  |
| ct-pou-sbrt-curie-4fx | oar-reins | Volume reins − volume de l'isodose 16,8 Gy | > 200 cc |  |  |
| ct-pou-sbrt-curie-4fx | oar-foie | Volume foie − volume de l'isodose 19,2 Gy | > 700 cc |  |  |
| ct-pou-sbrt-curie-5-8fx | oar-poumons | Dmoy (poumons − (i)GTV) | ≤ 8 Gy | ≤ 8 Gy | HyTEC 2021 : pas de déviation acceptable |
| ct-pou-sbrt-curie-5-8fx | oar-poumons | V20Gy (poumons − (i)GTV) | < 10 % | < 10 % | HyTEC 2021 : pas de déviation acceptable |
| ct-pou-sbrt-curie-5-8fx | oar-paroi-thoracique | D30cc | < 30 Gy |  | Ma 2019 ; vaut pour tous les fractionnements |
| ct-pou-sbrt-curie-5-8fx | oar-canal-medullaire | D1,2cc (canal + 5 mm) | < 15,6 Gy | < 16,4 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-canal-medullaire | D0,35cc (canal + 5 mm) | < 22 Gy | < 23,1 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-canal-medullaire | D0,03cc (canal + 5 mm) | < 28 Gy | < 29,4 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-plexus-brachial-d ; oar-plexus-brachial-g | D3cc (plexus + 5 mm) | < 30 Gy | < 31,5 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-plexus-brachial-d ; oar-plexus-brachial-g | D0,03cc (plexus + 5 mm) | < 32 Gy | < 33,6 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-arbre-bronchique | D5cc | < 32 Gy | < 33,6 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-arbre-bronchique | D0,03cc | < 40 Gy | < 42 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-arbre-bronchique | D4cc (lésion centrale) | < 18 Gy |  | RTOG 0813 |
| ct-pou-sbrt-curie-5-8fx | oar-arbre-bronchique | D0,33cc (lésion centrale) | < 47,1 Gy |  | Manyam 2020 |
| ct-pou-sbrt-curie-5-8fx | oar-arbre-bronchique | D0,03cc (lésion centrale) | < 50 Gy |  | Manyam 2020 |
| ct-pou-sbrt-curie-5-8fx | oar-coeur | D15cc | < 32 Gy | < 33,6 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-coeur | D0,03cc | < 38 Gy | < 39,9 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-coeur | D0,5cc (8 fractions) | < 50 Gy | < 60 Gy | SABR UK v6.1 |
| ct-pou-sbrt-curie-5-8fx | oar-gros-vaisseaux | D10cc | < 47 Gy | < 49,4 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-gros-vaisseaux | D0,03cc | < 53 Gy | < 55,7 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-cotes | D5cc | < 45 Gy | < 47,3 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-cotes | D0,03cc | < 57 Gy | < 59,9 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-oesophage | D5cc | < 27,5 Gy | < 28,9 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-oesophage | D0,03cc | < 35 Gy | < 36,8 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-estomac | D5cc | < 26,5 Gy | < 27,8 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-estomac | D0,05cc | < 35 Gy | < 36,8 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-duodenum | D5cc | < 18,3 Gy | < 19,2 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-duodenum | D0,05cc | < 30 Gy | < 31,5 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-grele ; oar-colon | D20cc | < 28,5 Gy | < 29,9 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-grele ; oar-colon | D0,03cc | < 40 Gy | < 42 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-peau | D10cc | < 36,5 Gy | < 38,3 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-peau | D0,03cc | < 38,5 Gy | < 40,4 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-poumons | D37 % (poumons − (i)GTV) | < 13,5 Gy | < 14,9 Gy |  |
| ct-pou-sbrt-curie-5-8fx | oar-poumons | Volume poumon sain − volume de l'isodose 13,5 Gy | > 1000 cc |  |  |
| ct-pou-sbrt-curie-5-8fx | oar-poumons | Volume poumon sain − volume de l'isodose 12,5 Gy | > 1500 cc |  |  |
| ct-pou-sbrt-curie-5-8fx | oar-reins | Volume reins − volume de l'isodose 18 Gy | > 200 cc |  |  |
| ct-pou-sbrt-curie-5-8fx | oar-foie | Volume foie − volume de l'isodose 21 Gy | > 700 cc |  |  |
| ct-pou-sbrt-igr-3fx | oar-moelle | Dose maximale | ≤ 18 Gy | ≤ 22 Gy | Volume non précisé dans le protocole |
| ct-pou-sbrt-igr-3fx | oar-poumons | V20Gy (poumons − GTV) | ≤ 4 % | < 10 % | Idéal : Barriger ; limitant : RTOG ; ROSEL 4–10 % selon la taille |
| ct-pou-sbrt-igr-3fx | oar-poumons | Dmoy (poumons − GTV) | ≤ 4 Gy |  | Barriger |
| ct-pou-sbrt-igr-3fx | oar-oesophage | Dose maximale | ≤ 24 Gy | ≤ 27 Gy |  |
| ct-pou-sbrt-igr-3fx | oar-plexus-brachial-d ; oar-plexus-brachial-g | Dose maximale | ≤ 24 Gy | ≤ 26 Gy |  |
| ct-pou-sbrt-igr-3fx | oar-coeur | Dose maximale | ≤ 24 Gy |  |  |
| ct-pou-sbrt-igr-3fx | oar-arbre-bronchique | Dose maximale (bronche souche) | ≤ 30 Gy | ≤ 32 Gy |  |
| ct-pou-sbrt-igr-3fx | oar-paroi-thoracique | V30Gy (paroi homolatérale) | < 30 cc | < 35 cc |  |
| ct-pou-sbrt-igr-5plus | oar-moelle | Dose maximale | ≤ 25 Gy | ≤ 28 Gy | Volume non précisé dans le protocole |
| ct-pou-sbrt-igr-5plus | oar-oesophage | Dose maximale | ≤ 27 Gy | ≤ 28,5 Gy |  |
| ct-pou-sbrt-igr-5plus | oar-plexus-brachial-d ; oar-plexus-brachial-g | Dose maximale | ≤ 27 Gy | ≤ 29 Gy |  |
| ct-pou-sbrt-igr-5plus | oar-arbre-bronchique | Dose maximale (bronche souche) | ≤ 32 Gy | ≤ 35 Gy |  |
| ct-pou-sbrt-igr-5plus | oar-paroi-thoracique | V30Gy (paroi homolatérale) | < 30 cc | < 35 cc |  |
| ct-pou-sbrt-igr-5plus | oar-poumons | V20Gy (poumons − GTV) |  | < 10 % | RTOG |
| ct-meso-igr-postop | oar-poumons | V20Gy (poumon controlatéral ; poumons − PTV) | ≤ 7 % | ≤ 10 % |  |
| ct-meso-igr-postop | oar-poumons | V10Gy (poumon controlatéral) |  | ≤ 55 % |  |
| ct-meso-igr-postop | oar-poumons | V5Gy (poumon controlatéral) |  | ≤ 75 % |  |
| ct-meso-igr-postop | oar-poumons | Dmoy (poumon controlatéral) | < 8,5 Gy | < 9,5 Gy |  |
| ct-meso-igr-postop | oar-foie | V30Gy | ≤ 30 % | ≤ 45 % |  |
| ct-meso-igr-postop | oar-foie | Dmoy |  | < 31 Gy |  |
| ct-meso-igr-postop | oar-coeur | V30Gy |  | ≤ 50 % |  |
| ct-meso-igr-postop | oar-coeur | V45Gy |  | ≤ 30 % |  |
| ct-meso-igr-postop | oar-coeur | V50Gy |  | ≤ 20 % |  |
| ct-meso-igr-postop | oar-moelle | D2 % |  | ≤ 45 Gy |  |
| ct-meso-igr-postop | oar-moelle | Dmax |  | ≤ 50 Gy |  |
| ct-meso-igr-postop | oar-oesophage | V55Gy |  | ≤ 30 % |  |
| ct-meso-igr-postop | oar-oesophage | Dmoy | ≤ 28 Gy | ≤ 34 Gy |  |
| ct-meso-igr-postop | oar-rein-d ; oar-rein-g | Dmoy (rein controlatéral) |  | ≤ 8 Gy |  |
| ct-meso-igr-postop | oar-rein-d ; oar-rein-g | D2 % (rein controlatéral) | ≤ 10 Gy | ≤ 12 Gy |  |
| ct-meso-igr-preop-5x5 | oar-poumons | V12,5Gy (poumon controlatéral) | ≤ 7 % | ≤ 10 % |  |
| ct-meso-igr-preop-5x5 | oar-poumons | V7Gy (poumon controlatéral) |  | ≤ 20 % |  |
| ct-meso-igr-preop-5x5 | oar-poumons | V3Gy (poumon controlatéral) |  | ≤ 55 % |  |
| ct-meso-igr-preop-5x5 | oar-poumons | Dmoy (poumon controlatéral) |  | < 3,5 Gy |  |
| ct-meso-igr-preop-5x5 | oar-foie | V17Gy (tumeur droite) |  | ≤ 60 % |  |
| ct-meso-igr-preop-5x5 | oar-foie | V8Gy (tumeur gauche) |  | ≤ 30 % |  |
| ct-meso-igr-preop-5x5 | oar-coeur | V15Gy (tumeur droite) |  | ≤ 40 % |  |
| ct-meso-igr-preop-5x5 | oar-coeur | V18Gy (tumeur gauche) |  | ≤ 70 % |  |
| ct-meso-igr-preop-5x5 | oar-moelle | Dmax du PRV moelle |  | ≤ 22 Gy |  |
| ct-meso-igr-preop-5x5 | oar-oesophage | Dmax |  | ≤ 30 Gy |  |
| ct-meso-igr-preop-5x5 | oar-oesophage | Dmoy |  | ≤ 17 Gy |  |
| ct-meso-igr-preop-5x5 | oar-reins | V7Gy |  | ≤ 33 % |  |
| ct-meso-igr-preop-5x5 | oar-rein-d ; oar-rein-g | Dmoy |  | ≤ 5 Gy | Au moins un des deux reins sous 5 Gy |
| ct-abdo-acrop-crt | oar-duodenum | Dmax |  | ≤ 55 Gy |  |
| ct-abdo-acrop-crt | oar-duodenum | Dose circonférentielle |  | ≤ 50 Gy | RTOG 0936 et 1102 |
| ct-abdo-acrop-crt | oar-duodenum | V50Gy | ≤ 10 cc |  |  |
| ct-abdo-acrop-crt | oar-duodenum | V50Gy |  | ≤ 10 % |  |
| ct-abdo-acrop-crt | oar-duodenum | V45Gy |  | ≤ 15 % |  |
| ct-abdo-acrop-crt | oar-estomac | Dmax |  | ≤ 55 Gy |  |
| ct-abdo-acrop-crt | oar-estomac | V45Gy | ≤ 75 cc |  |  |
| ct-abdo-acrop-crt | oar-estomac | V50Gy |  | ≤ 10 % |  |
| ct-abdo-acrop-crt | oar-estomac | V45Gy |  | ≤ 15 % |  |
| ct-abdo-acrop-crt | oar-grele | Dmax |  | ≤ 55 Gy |  |
| ct-abdo-acrop-crt | oar-grele | V50Gy | ≤ 10 cc |  |  |
| ct-abdo-acrop-crt | oar-grele | V15Gy | ≤ 120 cc |  |  |
| ct-abdo-acrop-crt | oar-grele | V50Gy |  | ≤ 10 % |  |
| ct-abdo-acrop-crt | oar-grele | V45Gy |  | ≤ 15 % |  |
| ct-abdo-acrop-crt | oar-foie | Dmoy |  | ≤ 25 Gy |  |
| ct-abdo-acrop-crt | oar-reins | Dmoy |  | ≤ 18 Gy | Reins additionnés |
| ct-abdo-acrop-crt | oar-reins | V20Gy |  | ≤ 32 % | Reins additionnés |
| ct-abdo-acrop-crt | oar-moelle | D0,1cc |  | ≤ 45 Gy |  |
| ct-sbrt-abdo-5fx | oar-duodenum | Dmax (0,5 cc) |  | < 35 Gy |  |
| ct-sbrt-abdo-5fx | oar-duodenum | D1cc | < 33 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-duodenum | D5cc | < 25 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-duodenum | D9cc | < 15 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-duodenum | D10cc |  | < 25 Gy |  |
| ct-sbrt-abdo-5fx | oar-estomac | Dmax (0,5 cc) | < 33 Gy | < 35 Gy |  |
| ct-sbrt-abdo-5fx | oar-estomac | D5cc | < 25 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-estomac | D10cc |  | < 25 Gy |  |
| ct-sbrt-abdo-5fx | oar-estomac | D50cc | < 12 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-grele | Dmax (0,5 cc) | < 30 Gy | < 35 Gy |  |
| ct-sbrt-abdo-5fx | oar-grele | D5cc | < 25 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-grele | D10cc |  | < 25 Gy |  |
| ct-sbrt-abdo-5fx | oar-voie-biliaire | Dmax (0,5 cc) | < 50 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-oesophage | Dmax (0,5 cc) | < 32 Gy | < 34 Gy |  |
| ct-sbrt-abdo-5fx | oar-colon | Dmax (0,5 cc) |  | < 32 Gy |  |
| ct-sbrt-abdo-5fx | oar-rectum | Dmax (0,5 cc) |  | < 32 Gy |  |
| ct-sbrt-abdo-5fx | oar-foie | D70 % (foie − GTV) | < 10 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-foie | Dmoy (foie − GTV) | < 13 Gy | < 15,2 Gy |  |
| ct-sbrt-abdo-5fx | oar-reins | Dmoy (chaque rein et les deux) | < 10 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-rein-d ; oar-rein-g | D10 % (rein unique, ou un rein > 10 Gy de moyenne) | < 10 Gy |  |  |
| ct-sbrt-abdo-5fx | oar-rein-d ; oar-rein-g | D45 % (rein unique, ou un rein > 10 Gy de moyenne) |  | < 10 Gy |  |
| ct-foie-sbrt-igr-3fx | oar-foie | Volume de foie sain (foie − PTV) |  | ≥ 800 cc |  |
| ct-foie-sbrt-igr-3fx | oar-foie | V15Gy (foie sain) |  | < 50 % |  |
| ct-foie-sbrt-igr-3fx | oar-foie | V21Gy (foie sain) |  | < 33 % |  |
| ct-foie-sbrt-igr-3fx | oar-foie | Foie sain − V17Gy |  | > 700 cc |  |
| ct-foie-sbrt-igr-3fx | oar-rein-d ; oar-rein-g | V15Gy (rein homolatéral) |  | < 66 % |  |
| ct-foie-sbrt-igr-3fx | oar-rein-d ; oar-rein-g | V10Gy (rein homolatéral) |  | < 50 % |  |
| ct-foie-sbrt-igr-3fx | oar-rein-d ; oar-rein-g | V18Gy (hile rénal) |  | < 66 % |  |
| ct-foie-sbrt-igr-3fx | oar-reins | V10Gy |  | < 50 % |  |
| ct-foie-sbrt-igr-3fx | oar-reins | Volume total − V15Gy |  | > 200 cc |  |
| ct-foie-sbrt-igr-3fx | oar-canal-medullaire | V16Gy |  | < 1,2 cc |  |
| ct-foie-sbrt-igr-3fx | oar-canal-medullaire | V18Gy |  | < 0,25 cc |  |
| ct-foie-sbrt-igr-3fx | oar-canal-medullaire | Dmax |  | < 22 Gy |  |
| ct-foie-sbrt-igr-3fx | oar-grele | V16Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-grele | V27Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-colon | V20Gy |  | < 20 cc |  |
| ct-foie-sbrt-igr-3fx | oar-colon | V30Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-3fx | oar-estomac | V19Gy |  | < 10 cc |  |
| ct-foie-sbrt-igr-3fx | oar-estomac | V21Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-estomac | V25Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-duodenum | V15Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-duodenum | V24Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-coeur | V24Gy |  | < 15 cc |  |
| ct-foie-sbrt-igr-3fx | oar-coeur | D2 % (Dmax) |  | < 30 Gy |  |
| ct-foie-sbrt-igr-3fx | oar-oesophage | V15Gy |  | < 10 cc |  |
| ct-foie-sbrt-igr-3fx | oar-oesophage | V21Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-oesophage | V25Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-3fx | oar-poumons | V5Gy (poumons − PTV) |  | < 50 % |  |
| ct-foie-sbrt-igr-3fx | oar-poumons | V10Gy (poumons − PTV) |  | < 30 % |  |
| ct-foie-sbrt-igr-3fx | oar-poumons | Volume total − V11Gy |  | ≥ 1500 cc |  |
| ct-foie-sbrt-igr-3fx | oar-cotes | V37Gy (chaque côte) |  | < 0,035 cc |  |
| ct-foie-sbrt-igr-3fx | oar-cotes | V29Gy (chaque côte) |  | < 1 cc |  |
| ct-foie-sbrt-igr-3fx | oar-cotes | V22Gy (chaque côte) |  | < 10 cc |  |
| ct-foie-sbrt-igr-5fx | oar-foie | Foie sain − V21Gy |  | ≥ 700 cc |  |
| ct-foie-sbrt-igr-5fx | oar-foie | V28Gy (foie sain) |  | < 33 % |  |
| ct-foie-sbrt-igr-5fx | oar-foie | V20Gy (foie sain) |  | < 50 % |  |
| ct-foie-sbrt-igr-5fx | oar-rein-d ; oar-rein-g | V15Gy (rein unique fonctionnel ou créatinine > 2 mg/dl) |  | < 50 % |  |
| ct-foie-sbrt-igr-5fx | oar-reins | Volume total − V18Gy |  | > 200 cc | Deux reins fonctionnels |
| ct-foie-sbrt-igr-5fx | oar-reins | V15Gy |  | < 50 % | Deux reins fonctionnels |
| ct-foie-sbrt-igr-5fx | oar-rein-d ; oar-rein-g | V23Gy (hile rénal) |  | < 66 % |  |
| ct-foie-sbrt-igr-5fx | oar-canal-medullaire | V22,5Gy |  | < 0,25 cc |  |
| ct-foie-sbrt-igr-5fx | oar-canal-medullaire | Dmax |  | < 30 Gy |  |
| ct-foie-sbrt-igr-5fx | oar-duodenum | V32Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-duodenum | V18Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-grele | V35Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-grele | V21Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-colon | V38Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-colon | V30Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-5fx | oar-colon | V25Gy |  | < 20 cc |  |
| ct-foie-sbrt-igr-5fx | oar-estomac | V30Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-estomac | V28Gy |  | < 10 cc |  |
| ct-foie-sbrt-igr-5fx | oar-oesophage | V20Gy |  | < 10 cc |  |
| ct-foie-sbrt-igr-5fx | oar-oesophage | V27,5Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-oesophage | V30Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-5fx | oar-coeur | V32Gy |  | < 15 cc |  |
| ct-foie-sbrt-igr-5fx | oar-coeur | V40Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-5fx | oar-poumons | V13,5Gy (poumons − PTV) |  | < 1000 cc |  |
| ct-foie-sbrt-igr-5fx | oar-poumons | Volume total − V12,5Gy |  | > 1500 cc |  |
| ct-foie-sbrt-igr-5fx | oar-cotes | V30Gy (chaque côte) |  | < 10 cc |  |
| ct-foie-sbrt-igr-5fx | oar-cotes | V35Gy (chaque côte) |  | < 1 cc |  |
| ct-foie-sbrt-igr-5fx | oar-cotes | V43Gy (chaque côte) |  | < 0,035 cc |  |
| ct-foie-sbrt-igr-10fx | oar-foie | Foie sain − V21Gy |  | ≥ 800 cc |  |
| ct-foie-sbrt-igr-10fx | oar-foie | V27Gy (foie sain) |  | < 30 % |  |
| ct-foie-sbrt-igr-10fx | oar-foie | V24Gy (foie sain) |  | < 50 % |  |
| ct-foie-sbrt-igr-10fx | oar-rein-d ; oar-rein-g | V10Gy (rein unique fonctionnel ou créatinine > 2 mg/dl) |  | < 10 % |  |
| ct-foie-sbrt-igr-10fx | oar-reins | V20Gy |  | < 50 % | Deux reins fonctionnels |
| ct-foie-sbrt-igr-10fx | oar-canal-medullaire | Dmax |  | < 34 Gy |  |
| ct-foie-sbrt-igr-10fx | oar-estomac | V37Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-10fx | oar-duodenum | V37Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-10fx | oar-duodenum | V40Gy |  | < 0,5 cc |  |
| ct-foie-sbrt-igr-10fx | oar-grele | V37Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-10fx | oar-colon | V37Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-10fx | oar-coeur | V34Gy |  | < 15 cc |  |
| ct-foie-sbrt-igr-10fx | oar-coeur | V43Gy |  | < 1 cc |  |
| ct-foie-sbrt-igr-10fx | oar-oesophage | V21,5Gy |  | < 10 cc |  |
| ct-foie-sbrt-igr-10fx | oar-oesophage | V29,5Gy |  | < 5 cc |  |
| ct-foie-sbrt-igr-10fx | oar-oesophage | V32Gy |  | < 0,5 cc |  |

**Tableau Jeux de contraintes** (suite — lot D système nerveux central)

| id | titre | fractionnement | source | verification |
| --- | --- | --- | --- | --- |
| ct-crane-igr | Encéphale, fractionnement classique | 1,8–2 Gy/fx | Gustave Roussy, fiche dosimétrique encéphale (version du 31/01/2018) | verifie |
| ct-crane-quantec | Encéphale, voies optiques, tronc, cochlées, moelle, hippocampes | ≤ 2 Gy/fx | QUANTEC 2010 (Lawrence, Mayo, Bhandare, Kirkpatrick) ; Gondi 2013 pour les hippocampes | verifie |
| ct-ha-wbrt-rtog0933 | Encéphale in toto avec épargne hippocampique | 30 Gy / 10 fx | RTOG 0933, critères de conformité dosimétrique (tableau 1 de Pokhrel 2015) | verifie |
| ct-srs-curie-1fx | Stéréotaxie intracrânienne, 1 fraction | 1 fx (15 à 24 Gy) | Institut Curie, stéréotaxie des métastases cérébrales (version de travail du 05/12/2021), d'après l'AAPM | verifie |
| ct-srs-curie-3fx | Stéréotaxie intracrânienne, 3 fractions | 3 fx (24 à 27 Gy) | Institut Curie, stéréotaxie des métastases cérébrales (version de travail du 05/12/2021), d'après l'AAPM | verifie |
| ct-srs-curie-5fx | Stéréotaxie intracrânienne, 5 fractions | 5 fx (25 à 30 Gy) | Institut Curie, stéréotaxie des métastases cérébrales (version de travail du 05/12/2021), d'après l'AAPM | verifie |
| ct-srs-igr-1fx | Stéréotaxie intracrânienne, 1 séance | 1 fx | Gustave Roussy, fiches dosimétriques de neuro-stéréotaxie v1 (19/04/2016) | verifie |
| ct-srs-igr-3fx | Stéréotaxie intracrânienne, 3 séances | 3 fx | Gustave Roussy, fiches dosimétriques de neuro-stéréotaxie v1 (19/04/2016) | verifie |
| ct-srs-igr-5fx | Stéréotaxie intracrânienne, 5 séances | 5 fx | Gustave Roussy, fiches dosimétriques de neuro-stéréotaxie v1 (19/04/2016) | verifie |
| ct-srs-hytec | Stéréotaxie intracrânienne : encéphale et voies optiques | 1, 3 ou 5 fx | HyTEC 2021 (Milano : encéphale ; voies optiques) | verifie |

**Tableau Lignes de contraintes** (suite — lot D, fractionnement classique)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-crane-igr | oar-tronc-cerebral | Dmax | ≤ 54 Gy (milieu du tronc) | ≤ 60 Gy (bord du volume cible) | ≤ 48 Gy au bord opposé |
| ct-crane-igr | oar-chiasma | Dmax | ≤ 50 Gy | ≤ 54 Gy si proche du volume cible |  |
| ct-crane-igr | oar-nerf-optique-d ; oar-nerf-optique-g | Dmax | ≤ 50 Gy | ≤ 54 Gy si proche du volume cible |  |
| ct-crane-igr | oar-oeil-d ; oar-oeil-g | Dmax / Dmoy | Dmax ≤ 45 Gy ; Dmoy ≤ 30 Gy |  |  |
| ct-crane-igr | oar-cochlee-d ; oar-cochlee-g | Dmoy | ≤ 35 Gy | ≤ 45 Gy si proche du volume cible | Cochlées et oreilles internes |
| ct-crane-igr | oar-moelle | Dmax | ≤ 45 Gy | ≤ 50 Gy en cervical |  |
| ct-crane-igr | oar-hypophyse | Dmoy | ≤ 45 Gy |  |  |
| ct-crane-igr | oar-cristallin-d ; oar-cristallin-g | Dmax | ≤ 10 Gy |  |  |
| ct-crane-quantec | oar-encephale-sain | Nécrose radique (BED, fractions < 2,5 Gy) | BED < 120 Gy (risque 5 %) | BED < 150 Gy (risque 10 %) | Au-delà de 2,5 Gy par fraction, risque imprévisible |
| ct-crane-quantec | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | Dmax |  | ≤ 60 Gy | Risque nettement accru au-delà de 60 Gy (≈ 1,8 Gy/fx) |
| ct-crane-quantec | oar-tronc-cerebral | Dmax | Tronc entier ≤ 54 Gy | 1 à 10 cm³ ≤ 59 Gy | Risque nettement accru au-delà de 64 Gy |
| ct-crane-quantec | oar-cochlee-d ; oar-cochlee-g | Dmoy | ≤ 35 Gy | ≤ 45 Gy | Aussi basse que possible ; limiter strictement avec le cisplatine |
| ct-crane-quantec | oar-moelle | Dmax | ≤ 54 Gy (myélopathie < 1 %) |  | < 10 % à 61 Gy |
| ct-crane-quantec | oar-hippocampes | D40 % (EQD2, α/β = 2 Gy) | ≤ 7,3 Gy |  | Au-delà, déficit du rappel différé (Gondi 2013) ; sans dégrader le PTV |
| ct-ha-wbrt-rtog0933 | oar-hippocampes | D100 % | ≤ 9 Gy | ≤ 10 Gy | Hippocampes réunis en une structure |
| ct-ha-wbrt-rtog0933 | oar-hippocampes | Dmax | ≤ 16 Gy | ≤ 17 Gy |  |
| ct-ha-wbrt-rtog0933 | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | Dmax | < 37,5 Gy |  |  |

**Tableau Lignes de contraintes** (suite — lot D, stéréotaxie ; « V8Gy < 0,2 cm³ » = moins de 0,2 cm³ reçoit 8 Gy ou plus ; contraintes sans PRV)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-srs-curie-1fx | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | V8Gy / D0,035cm³ |  | V8 < 0,2 cm³ ; D0,035 cm³ < 10 Gy |  |
| ct-srs-curie-1fx | oar-cochlee-d ; oar-cochlee-g | D0,035cm³ |  | < 9 Gy | Risque discutable pour la cochlée homolatérale si l'audition controlatérale est bonne |
| ct-srs-curie-1fx | oar-tronc-cerebral | V10Gy / D0,035cm³ |  | V10 < 1 cm³ ; D0,035 cm³ < 15 Gy |  |
| ct-srs-curie-1fx | oar-canal-medullaire | V8Gy / V10Gy / D0,035cm³ |  | V8 < 0,25 cm³ ; V10 < 0,35 cm³ ; D0,035 cm³ < 14 Gy |  |
| ct-srs-curie-1fx | oar-nerfs-craniens | V10Gy / D0,035cm³ |  | V10 < 0,2 cm³ ; D0,035 cm³ < 12 Gy | Hors nerfs optiques, si concernés |
| ct-srs-curie-1fx | oar-encephale-sain | V12Gy / V10Gy / V8Gy |  | V12 < 8,4 cm³ ; V10 < 10,4 cm³ ; V8 < 12,4 cm³ |  |
| ct-srs-curie-1fx | oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-hippocampe-d ; oar-hippocampe-g ; oar-hypophyse | Dose | Aussi basse que possible |  | Pas une limite de validation du plan (Curie) |
| ct-srs-curie-3fx | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | V15Gy / D0,035cm³ |  | V15 < 0,2 cm³ ; D0,035 cm³ < 17,4 Gy |  |
| ct-srs-curie-3fx | oar-cochlee-d ; oar-cochlee-g | D0,035cm³ |  | < 17,1 Gy | Risque discutable pour la cochlée homolatérale si l'audition controlatérale est bonne |
| ct-srs-curie-3fx | oar-tronc-cerebral | V18Gy / D0,035cm³ |  | V18 < 1 cm³ ; D0,035 cm³ < 23,1 Gy |  |
| ct-srs-curie-3fx | oar-canal-medullaire | V18Gy / D0,035cm³ |  | V18 < 0,25 cm³ ; D0,035 cm³ < 22 Gy |  |
| ct-srs-curie-3fx | oar-nerfs-craniens | V20Gy / D0,035cm³ |  | V20 < 0,2 cm³ ; D0,035 cm³ < 22 Gy | Hors nerfs optiques, si concernés |
| ct-srs-curie-3fx | oar-encephale-sain | Post-opératoire : V24Gy |  | < 16,8 cm³ |  |
| ct-srs-curie-3fx | oar-encephale-sain | Tumeur en place : V19,6Gy − GTV / V23,1Gy − GTV |  | < 10 cm³ ; < 7 cm³ |  |
| ct-srs-curie-3fx | oar-encephale-sain | Réirradiation : recoupe V18Gy actuel × V12Gy (1re SRS) ou × V21Gy (1re SRT en 3 fx) |  | < 10 cm³ | Volume d'encéphale sain recevant les deux doses |
| ct-srs-curie-3fx | oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-hippocampe-d ; oar-hippocampe-g ; oar-hypophyse | Dose | Aussi basse que possible |  | Pas une limite de validation du plan (Curie) |
| ct-srs-curie-5fx | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | V23Gy / D0,035cm³ |  | V23 < 0,2 cm³ ; D0,035 cm³ < 25 Gy |  |
| ct-srs-curie-5fx | oar-cochlee-d ; oar-cochlee-g | D0,035cm³ |  | < 25 Gy | Risque discutable pour la cochlée homolatérale si l'audition controlatérale est bonne |
| ct-srs-curie-5fx | oar-tronc-cerebral | V23Gy / D0,035cm³ |  | V23 < 1 cm³ ; D0,035 cm³ < 31 Gy |  |
| ct-srs-curie-5fx | oar-canal-medullaire | V22,5Gy / D0,035cm³ |  | V22,5 < 0,25 cm³ ; D0,035 cm³ < 30 Gy |  |
| ct-srs-curie-5fx | oar-nerfs-craniens | V28Gy / D0,035cm³ |  | V28 < 0,2 cm³ ; D0,035 cm³ < 30 Gy | Hors nerfs optiques, si concernés |
| ct-srs-curie-5fx | oar-encephale-sain | V28,8Gy / V20Gy |  | V28,8 < 7 cm³ ; V20 < 20 cm³ |  |
| ct-srs-curie-5fx | oar-encephale-sain | Réirradiation : recoupe V22,5Gy actuel × V12Gy (1re SRS) ou × V21Gy (1re SRT en 3 fx) |  | < 10 cm³ | Volume d'encéphale sain recevant les deux doses |
| ct-srs-curie-5fx | oar-oeil-d ; oar-oeil-g ; oar-cristallin-d ; oar-cristallin-g ; oar-hippocampe-d ; oar-hippocampe-g ; oar-hypophyse | Dose | Aussi basse que possible |  | Pas une limite de validation du plan (Curie) |
| ct-srs-igr-1fx | oar-tronc-cerebral | D0,035cm³ / V10Gy |  | D0,035 cm³ ≤ 15 Gy ; V10 ≤ 0,5 cm³ |  |
| ct-srs-igr-1fx | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | D0,035cm³ / V8Gy |  | D0,035 cm³ ≤ 10 Gy ; V8 ≤ 0,2 cm³ | Voies optiques |
| ct-srs-igr-1fx | oar-cochlee-d ; oar-cochlee-g | D0,035cm³ |  | ≤ 9 Gy |  |
| ct-srs-igr-1fx | oar-cristallin-d ; oar-cristallin-g | D0,035cm³ |  | ≤ 3 Gy |  |
| ct-srs-igr-1fx | oar-moelle | D0,035cm³ / V10Gy |  | D0,035 cm³ ≤ 14 Gy ; V10 ≤ 0,35 cm³ |  |
| ct-srs-igr-1fx | oar-encephale-sain | V12Gy (encéphale moins PTV) |  | ≤ 5 à 7,5 cm³ |  |
| ct-srs-igr-1fx | oar-peau | D0,035cm³ / V23Gy |  | D0,035 cm³ ≤ 26 Gy ; V23 ≤ 10 cm³ |  |
| ct-srs-igr-3fx | oar-tronc-cerebral | D0,035cm³ / V18Gy |  | D0,035 cm³ ≤ 23,1 Gy ; V18 ≤ 0,5 cm³ |  |
| ct-srs-igr-3fx | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | D0,035cm³ / V15,3Gy |  | D0,035 cm³ ≤ 17,4 Gy ; V15,3 ≤ 0,2 cm³ | Voies optiques |
| ct-srs-igr-3fx | oar-cochlee-d ; oar-cochlee-g | D0,035cm³ |  | ≤ 17,1 Gy |  |
| ct-srs-igr-3fx | oar-cristallin-d ; oar-cristallin-g | D0,035cm³ |  | ≤ 7 Gy |  |
| ct-srs-igr-3fx | oar-moelle | D0,035cm³ / V18Gy |  | D0,035 cm³ ≤ 21,9 Gy ; V18 ≤ 0,35 cm³ |  |
| ct-srs-igr-3fx | oar-encephale-sain | V12Gy (encéphale moins PTV) |  | ≤ 21 cm³ |  |
| ct-srs-igr-3fx | oar-peau | D0,035cm³ / V30Gy |  | D0,035 cm³ ≤ 33 Gy ; V30 ≤ 10 cm³ |  |
| ct-srs-igr-5fx | oar-tronc-cerebral | D0,035cm³ / V23Gy |  | D0,035 cm³ ≤ 31 Gy ; V23 ≤ 0,5 cm³ |  |
| ct-srs-igr-5fx | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | D0,035cm³ / V23Gy |  | D0,035 cm³ ≤ 25 Gy ; V23 ≤ 0,2 cm³ | Voies optiques |
| ct-srs-igr-5fx | oar-cochlee-d ; oar-cochlee-g | D0,035cm³ |  | ≤ 25 Gy |  |
| ct-srs-igr-5fx | oar-cristallin-d ; oar-cristallin-g | D0,035cm³ |  | ≤ 7 Gy |  |
| ct-srs-igr-5fx | oar-moelle | D0,035cm³ / V23Gy |  | D0,035 cm³ ≤ 30 Gy ; V23 ≤ 0,35 cm³ |  |
| ct-srs-igr-5fx | oar-peau | D0,035cm³ / V36,5Gy |  | D0,035 cm³ ≤ 39,5 Gy ; V36,5 ≤ 10 cm³ |  |
| ct-srs-hytec | oar-encephale | V12Gy en 1 fx (cible comprise) | < 5 cm³ (radionécrose symptomatique ≈ 10 %) | < 10 cm³ (≈ 15 %) | Au-delà de 15 cm³ : ≈ 20 % |
| ct-srs-hytec | oar-encephale | V20Gy en 3 fx ou V24Gy en 5 fx (cible comprise) | < 20 cm³ |  | Nécrose ou œdème < 10 % ; nécrose opérée < 4 % |
| ct-srs-hytec | oar-chiasma ; oar-nerf-optique-d ; oar-nerf-optique-g | Dmax (point) | 1 fx : ≤ 10 Gy | 1 fx 12 Gy ; 3 fx 20 Gy ; 5 fx 25 Gy | Neuropathie < 1 % sans irradiation antérieure ; risque × 10 après RT antérieure |

**Tableau Jeux de contraintes** (suite — lot B tête et cou, sein)

| id | titre | fractionnement | source | verification |
| --- | --- | --- | --- | --- |
| ct-orl-curie | VADS, tumeur en place ou opérée | 33 fx (66 / 59,4 / 54 Gy) ou 35 fx (70 / 63 / 56 Gy) | Institut Curie 2021, protocoles RT des VADS (tumeur en place et opérée) | verifie |
| ct-orl-igr | Tête et cou, RCMI | 30–33 fx (70 / 60 / 54 Gy) | Gustave Roussy, RCMI des cancers de la tête et du cou, RLS-PTC-002-V02 (2017) | verifie |
| ct-sein-ff-15fx | Sein ou paroi, 40 Gy / 15 fx | 40 Gy / 15 fx | FAST-Forward (Brunt 2020), bras contrôle | verifie |
| ct-sein-ff-5fx | Sein ou paroi, 26 Gy / 5 fx | 26 ou 27 Gy / 5 fx | FAST-Forward (Brunt 2020), bras à 5 fractions | verifie |
| ct-sein-senorif | Sein, objectifs du référentiel régional | Tous fractionnements | Sénorif 2021-2022 (renvoie à RECORAD 2021 pour les autres OAR) ; Darby 2013 | verifie |

**Tableau Jeux de contraintes** (suite — lot E os, stéréotaxie, surrénale, réirradiation)

| id | titre | fractionnement | source | verification |
| --- | --- | --- | --- | --- |
| ct-hytec-moelle | SBRT : moelle épinière, première irradiation | 1 à 5 fx | HyTEC 2021 (Sahgal : moelle) | verifie |
| ct-reirr-moelle | Réirradiation : moelle épinière (doses cumulées) | Tous fractionnements | HyTEC 2021 (Sahgal : moelle) ; Sahgal 2012 ; Nieder 2006 | verifie |
| ct-surrenale-igr-5fx | SBRT de la surrénale, 5 × 9 Gy | 5 fx | Gustave Roussy, fiche de dosimétrie « stéréo surrénale 5 × 9 Gy » | verifie |

**Tableau Jeux de contraintes** (suite — lot F sarcomes, chordome, pénis)

| id | titre | fractionnement | source | verification |
| --- | --- | --- | --- | --- |
| ct-sarcome-rp-igr | Sarcome rétropéritonéal, RT pré-opératoire | Non précisé par la fiche | Gustave Roussy, fiche de dosimétrie « sarcomes rétropéritonéaux » (2017) | verifie |
| ct-chordome-delaney | Rachis et sacrum, photons-protons de haute dose | 1,8 Gy RBE par fraction | DeLaney 2009 (protocole de phase 2) | verifie |
| ct-penis-igr | Curiethérapie du gland, débit pulsé | Débit pulsé | Gustave Roussy (Achkar 2025) | verifie |

**Tableau Lignes de contraintes** (suite — lot B)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-orl-curie | oar-parotide-d ; oar-parotide-g | Dmoy | ≤ 24–26 Gy |  | En cas de chevauchement avec un PTV : appliquer à l'OAR moins le PTV |
| ct-orl-curie | oar-glande-sous-max-d ; oar-glande-sous-max-g | Dmoy | ≤ 40 Gy |  | OAR moins PTV si chevauchement |
| ct-orl-curie | oar-larynx | Dmoy | ≤ 40–45 Gy |  | Du cricoïde à la margelle ; OAR moins PTV si chevauchement |
| ct-orl-curie | oar-cavite-orale | Dmoy | ≤ 30–40 Gy |  | Langue, palais mou et plancher ; OAR moins PTV si chevauchement |
| ct-orl-curie | oar-canal-medullaire | D0,035cc sur le PRV (+ 3 mm) | ≤ 45 Gy | 50 Gy | 50 Gy sur avis médical selon la situation clinique ; prioritaire sur la couverture |
| ct-orl-curie | oar-tronc-cerebral | D0,035cc sur le PRV (+ 3 mm) | ≤ 54 Gy | 64 Gy | 64 Gy sur avis médical ; prioritaire sur la couverture |
| ct-orl-curie | oar-atm-d ; oar-atm-g | D0,035cc | ≤ 65 Gy |  |  |
| ct-orl-curie | oar-oreille-interne-d ; oar-oreille-interne-g | Dmoy | ≤ 45 Gy |  |  |
| ct-orl-curie | oar-oreille-interne-d ; oar-oreille-interne-g | D0,035cc | ≤ 60 Gy |  |  |
| ct-orl-curie | oar-mandibule | D0,035cc | ≤ 70 Gy |  | Limiter le volume recevant plus de 60 Gy |
| ct-orl-curie | oar-constricteurs | Dmoy | ≤ 45–50 Gy |  | OAR moins PTV si chevauchement |
| ct-orl-curie | oar-cristallin-d ; oar-cristallin-g | D0,035cc | ≤ 10 Gy |  |  |
| ct-orl-curie | oar-oeil-d ; oar-oeil-g | Dmoy (hors tumeur des sinus) | ≤ 5 Gy |  |  |
| ct-orl-curie | oar-oeil-d ; oar-oeil-g | Dmoy (tumeur des sinus) | ≤ 35 Gy |  | Lecture du tableau Curie : deuxième valeur de la ligne Œil |
| ct-orl-curie | oar-oeil-d ; oar-oeil-g | D0,035cc (tumeur des sinus) | ≤ 50 Gy |  | Idem |
| ct-orl-curie | oar-oesophage | Dmoy | ≤ 40 Gy |  | Bouche œsophagienne et œsophage cervical ; OAR moins PTV si chevauchement |
| ct-orl-curie | oar-glande-lacrymale-d ; oar-glande-lacrymale-g | Dmoy | ≤ 35 Gy |  |  |
| ct-orl-curie | oar-nerf-optique-d ; oar-nerf-optique-g | D0,035cc sur le PRV (+ 3 mm) | ≤ 54 Gy |  | PRV du nerf homolatéral facultatif si la tumeur est au contact |
| ct-orl-curie | oar-chiasma | D0,035cc sur le PRV (+ 3 mm) | ≤ 54 Gy |  |  |
| ct-orl-curie | oar-plexus-brachial-d ; oar-plexus-brachial-g | D0,035cc | ≤ 54–60 Gy |  | Davantage sur avis médical si l'irradiation n'est pas circonférentielle |
| ct-orl-curie | oar-cervelet ; oar-encephale | D2cc | ≤ 60 Gy |  | Cervelet et cerveau |
| ct-orl-curie | oar-thyroide | Dmoy | ≤ 50 Gy |  | OAR moins PTV si chevauchement |
| ct-orl-curie | oar-levres | Dmoy | ≤ 30 Gy |  | OAR moins PTV si chevauchement |
| ct-orl-igr | oar-canal-medullaire | Dmax | < 50 Gy |  | PRV moelle 5 mm ; contourage sur repères osseux |
| ct-orl-igr | oar-canal-medullaire | D0,5cc | ≤ 48 Gy |  |  |
| ct-orl-igr | oar-tronc-cerebral | Dmax | < 50 Gy |  | PRV 3 mm |
| ct-orl-igr | oar-tronc-cerebral | D0,5cc | ≤ 54 Gy |  |  |
| ct-orl-igr | oar-chiasma | Dmax | < 54 Gy |  | PRV voies optiques 2 mm |
| ct-orl-igr | oar-chiasma | D5% | ≤ 54 Gy |  |  |
| ct-orl-igr | oar-nerf-optique-d ; oar-nerf-optique-g | D5% (nerf homolatéral) | ≤ 54 Gy |  |  |
| ct-orl-igr | oar-nerf-optique-d ; oar-nerf-optique-g | D5% (nerf controlatéral) | ≤ 50 Gy |  |  |
| ct-orl-igr | oar-lobe-frontal ; oar-lobe-temporal-d ; oar-lobe-temporal-g | Dmax | < 65 Gy |  |  |
| ct-orl-igr | oar-lobe-frontal ; oar-lobe-temporal-d ; oar-lobe-temporal-g | D0,5cc | < 60 Gy |  |  |
| ct-orl-igr | oar-fosse-posterieure | Dmoy | ≤ 20 Gy |  |  |
| ct-orl-igr | oar-cristallin-d ; oar-cristallin-g | Dose | Au cas par cas |  |  |
| ct-orl-igr | oar-oeil-d ; oar-oeil-g | D5% | ≤ 45 Gy |  | Œil homolatéral : sauf extension antérieure |
| ct-orl-igr | oar-hypophyse | D5% | ≤ 60 Gy |  |  |
| ct-orl-igr | oar-cochlee-d ; oar-cochlee-g | Dmoy | ≤ 45 Gy |  | Contourage sur repères osseux |
| ct-orl-igr | oar-parotide-d ; oar-parotide-g | D50% | ≤ 30 Gy |  | Homolatérale et controlatérale |
| ct-orl-igr | oar-parotide-d ; oar-parotide-g | Dmoy | ≤ 26 Gy |  |  |
| ct-orl-igr | oar-glande-sous-max-d ; oar-glande-sous-max-g | D50% | ≤ 30 Gy |  | Glande controlatérale seulement |
| ct-orl-igr | oar-glande-sous-max-d ; oar-glande-sous-max-g | Dmoy | ≤ 26 Gy |  | Glande controlatérale seulement |
| ct-orl-igr | oar-atm-d ; oar-atm-g | D5% | ≤ 70 Gy |  |  |
| ct-orl-igr | oar-mandibule | D5% | ≤ 70 Gy |  |  |
| ct-orl-igr | oar-levres | Dmoy | ≤ 20 Gy |  |  |
| ct-orl-igr | oar-cavite-orale | Dmoy (bouche hors PTV) | ≤ 45 Gy |  |  |
| ct-orl-igr | oar-larynx | Dmoy (larynx sain) | ≤ 25 Gy |  |  |
| ct-orl-igr | oar-constricteurs | Dmoy | ≤ 50 Gy |  |  |
| ct-orl-igr | oar-thyroide | Dmoy | ≤ 50 Gy |  |  |
| ct-orl-igr | oar-muscles-nuque | Dmax | ≤ 60 Gy |  |  |
| ct-orl-igr | oar-muscles-nuque | Dmoy | ≤ 45 Gy |  |  |
| ct-sein-ff-15fx | oar-poumon-homolateral | V12Gy |  | < 15 % |  |
| ct-sein-ff-15fx | oar-coeur | V2Gy |  | < 30 % |  |
| ct-sein-ff-15fx | oar-coeur | V10Gy |  | < 5 % |  |
| ct-sein-ff-5fx | oar-poumon-homolateral | V8Gy |  | < 15 % |  |
| ct-sein-ff-5fx | oar-coeur | V1,5Gy |  | < 30 % |  |
| ct-sein-ff-5fx | oar-coeur | V7Gy |  | < 5 % |  |
| ct-sein-senorif | oar-coeur | Dmoy | < 5 Gy |  | Le plus bas possible : + 7,4 % d'événements coronariens par gray (Darby 2013) |
| ct-sein-senorif | oar-sein-controlateral | Dmoy | Le plus bas possible |  | Surtout avant 40 ans ou en cas de prédisposition génétique ; à évaluer systématiquement en RCMI |

**Tableau Lignes de contraintes** (suite — lot E ; Gy₂/₂ = EQD2 avec α/β = 2 Gy)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-hytec-moelle | oar-moelle | Dmax (point) |  | 1 fx : 12,4–14,0 Gy ; 2 fx : 17,0 Gy ; 3 fx : 20,3 Gy ; 4 fx : 23,0 Gy ; 5 fx : 25,3 Gy | Risque estimé de myélopathie radique de 1 à 5 % ; première irradiation |
| ct-reirr-moelle | oar-sac-dural | Dmax (point) cumulée, EQD2 |  | ≤ 70 Gy₂/₂ | Réirradiation en SBRT (HyTEC ; Sahgal 2012) |
| ct-reirr-moelle | oar-sac-dural | Dmax (point) de la SBRT de réirradiation, EQD2 | 20–25 Gy₂/₂ | ≤ 25 Gy₂/₂ |  |
| ct-reirr-moelle | oar-sac-dural | Dmax de la SBRT / Dmax cumulée (EQD2) |  | ≤ 0,5 |  |
| ct-reirr-moelle | oar-sac-dural | Intervalle entre les deux irradiations |  | ≥ 5 mois |  |
| ct-reirr-moelle | oar-moelle ; oar-canal-medullaire | BED cumulée (α/β = 2 Gy cervical et thoracique, 4 Gy lombaire) | ≤ 120 Gy₂ | ≤ 135,5 Gy₂ | Si intervalle ≥ 6 mois et chaque cure ≤ 98 Gy₂ ; aucune myélopathie rapportée jusqu'à 120 Gy₂ (Nieder 2006) |
| ct-surrenale-igr-5fx | oar-foie | V20Gy |  | < 50 % |  |
| ct-surrenale-igr-5fx | oar-foie | V28Gy |  | ≤ 33 % |  |
| ct-surrenale-igr-5fx | oar-foie | Vtotal − V21Gy |  | > 700 cm³ | Volume de foie recevant moins de 21 Gy |
| ct-surrenale-igr-5fx | oar-estomac | V28Gy |  | ≤ 10 cm³ |  |
| ct-surrenale-igr-5fx | oar-estomac | V30Gy |  | ≤ 0,5 cm³ |  |
| ct-surrenale-igr-5fx | oar-duodenum | V18Gy |  | ≤ 5 cm³ |  |
| ct-surrenale-igr-5fx | oar-duodenum | V32Gy |  | ≤ 0,5 cm³ |  |
| ct-surrenale-igr-5fx | oar-grele | V21Gy |  | ≤ 5 cm³ |  |
| ct-surrenale-igr-5fx | oar-grele | V35Gy |  | ≤ 0,5 cm³ |  |
| ct-surrenale-igr-5fx | oar-reins | Vtotal − V18Gy |  | > 200 cm³ | Volume rénal recevant moins de 18 Gy |
| ct-surrenale-igr-5fx | oar-reins | V23Gy |  | ≤ 66 % |  |
| ct-surrenale-igr-5fx | oar-reins | V10Gy |  | ≤ 50 % |  |
| ct-surrenale-igr-5fx | oar-rein-d ; oar-rein-g | V15Gy (rein homolatéral) |  | ≤ 66 % |  |
| ct-surrenale-igr-5fx | oar-rein-d ; oar-rein-g | V10Gy (rein homolatéral) |  | ≤ 50 % |  |
| ct-surrenale-igr-5fx | oar-moelle | D0,5cm³ |  | ≤ 25 Gy |  |
| ct-surrenale-igr-5fx | oar-moelle | Dmax |  | ≤ 28 Gy |  |
| ct-surrenale-igr-5fx | oar-colon | V25Gy |  | ≤ 20 cm³ |  |
| ct-surrenale-igr-5fx | oar-colon | D0,5cm³ |  | ≤ 38 Gy |  |
| ct-surrenale-igr-5fx | oar-paroi-thoracique | D30cm³ |  | ≤ 30–35 Gy |  |
| ct-surrenale-igr-5fx | oar-paroi-thoracique | D0,035cm³ |  | ≤ 43 Gy |  |

**Tableau Lignes de contraintes** (suite — lot F)

| contraintes\_id | oar\_id | indicateur | ideal | limitant | note |
| --- | --- | --- | --- | --- | --- |
| ct-sarcome-rp-igr | oar-rein-d ; oar-rein-g | Dmoy du rein restant (un seul rein fonctionnel prévu) |  | ≤ 8 Gy |  |
| ct-sarcome-rp-igr | oar-rein-d ; oar-rein-g | D2% du rein restant (un seul rein fonctionnel prévu) |  | ≤ 10–12 Gy |  |
| ct-sarcome-rp-igr | oar-reins | D2% (deux reins conservés) |  | ≤ 20 Gy |  |
| ct-sarcome-rp-igr | oar-moelle | D2% |  | ≤ 45 Gy |  |
| ct-sarcome-rp-igr | oar-moelle | Dmax |  | ≤ 50 Gy |  |
| ct-sarcome-rp-igr | oar-grele | D50% (cavité intestinale moins PTV) |  | ≤ 25 Gy |  |
| ct-sarcome-rp-igr | oar-grele | V45Gy (cavité intestinale moins PTV) |  | ≤ 195 cm³ |  |
| ct-sarcome-rp-igr | oar-grele | D2% (cavité intestinale moins PTV) |  | ≤ 50 Gy |  |
| ct-sarcome-rp-igr | oar-estomac ; oar-duodenum | D2% |  | ≤ 45 Gy |  |
| ct-sarcome-rp-igr | oar-estomac ; oar-duodenum | Dmax |  | ≤ 54 Gy |  |
| ct-sarcome-rp-igr | oar-foie | Dmoy |  | ≤ 26 Gy |  |
| ct-sarcome-rp-igr | oar-foie | V30Gy |  | ≤ 50 % |  |
| ct-sarcome-rp-igr | oar-rectum | V40Gy |  | ≤ 60 % |  |
| ct-sarcome-rp-igr | oar-rectum | V50Gy |  | ≤ 50 % |  |
| ct-sarcome-rp-igr | oar-vessie | V45Gy |  | ≤ 35 % |  |
| ct-chordome-delaney | oar-moelle | Dose à la surface de la moelle |  | ≤ 63 Gy RBE | Aucune myélopathie dans l'essai |
| ct-chordome-delaney | oar-moelle | Dose au centre de la moelle |  | ≤ 54 Gy RBE |  |
| ct-penis-igr | oar-uretre | D0,1cm³ de l'urètre distal | < 82 Gy |  | Seuil associé à moins de sténoses méatiques (HR 0,12) |
| ct-penis-igr | oar-uretre | D0,2cm³ de l'urètre distal | < 79 Gy |  | HR 0,19 |

Conventions : `oar_id` = `cible-ptv` ou `cible-ctv` pour un objectif de couverture de la cible ; plusieurs indicateurs dans une même cellule sont séparés par « ; » et se lisent dans l'ordre avec les seuils de la cellule voisine ; pour les tableurs du service, la colonne `limitant` reprend la colonne « ACCEPTABLE » du tableur.

Objectifs de couverture des cibles de curiethérapie (CTV V100, D90, V150) : dans le champ `couverture` des schémas, onglet « Uro — Prostate ».
