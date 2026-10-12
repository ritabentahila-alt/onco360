# Audit n° 3 – Chimiothérapie et bibliothèque de protocoles

Oct 12, 2026 ·

## Synthèse

Les doses des molécules sont justes dans l'immense majorité des 316 protocoles ; ce qui est en retard, c'est tout ce qui les entoure : antiémétiques, prémédications, hydratation, G-CSF. Aucun des 97 protocoles qui en relèvent ne contient d'anti-NK1, alors que MASCC/ESMO 2023 le recommande. 6 protocoles sont à corriger avant tout usage, 130 ont un écart important, 108 n'ont aucun écart détecté.

La méthylprednisolone (Solumedrol) et le Nivestim sont des choix marocains : ils ne sont pas comptés comme erreurs, seules leurs doses et leurs durées sont vérifiées. Le détail est dans le classeur Excel joint, en un seul onglet : un protocole par ligne (les 316 existants et les 123 à créer), avec la décision (garder, ajuster, modifier, supprimer, créer), l'ordre de passage, les lignes exactes à saisir, les seuils du jour et l'ordonnance de sortie à imprimer. Pour toute les ordonnance type, si tu vois - sortie dans le titre ne le mets pas, dans leur detail sur ce document je t’ai mis les vrais titre.

Les 10 actions, dans l'ordre :

Corriger les 6 protocoles critiques : KEYNOTE-355 \[89\] (cycle faux), PORTEC-3 \[197\] (2e phase absente), BEP \[253\] (bléomycine sans dose), EP \[273\] (aucun antiémétique), pémétrexed-cisplatine HGC \[14\] (aucun corticoïde), MAP \[217\] (sauvetage par acide folinique non chiffré).

Créer des blocs de prémédication réutilisables pour ce qui est fait au service (sétron, Solumedrol, Polaramine, hydratation du cisplatine, atropine) et relier à chaque protocole son ordonnance de sortie pour ce qui est pris à domicile (EMEND, Solupred, olanzapine, acide folique) : une correction faite une fois s'applique partout.

Donner à chaque protocole un risque émétique et y relier ses ordonnances, imprimables d'un bouton à côté de « Valider » ou reporter dès la prescription ; rien n'est bloqué, le médecin garde la main.

Structurer la ligne Nivestim dans le protocole (30 ou 48 MU selon le poids (a choisir en voyant le poid du patient), de quel J à quel J et combien d'injections selon la chimiothérapie), puisqu'elle doit figurer sur la fiche envoyée à la prise en charge ; retirer la prophylaxie systématique des 11 protocoles FOLFOX et FOLFIRI.

Ajouter les protocoles manquants courants (11 en priorité 1 : AC, AC dose dense, TC, TCH, TCHP, cisplatine 100 mg/m² + RT en ORL et nasopharynx…) et les versions hebdomadaires.

Remplir le champ « Source » (vide pour les 316) avec l'essai de référence ; retirer la mention eviQ (4 noms, 75 remarques) et indiquer à la place la source d'origine. Enlever toute mention de HGC.

Écrire la DCI à côté de la marque (191 protocoles ont « SOLUMEDROL » seul) et fusionner les vrais doublons (5 groupes et les 3 palbociclib ; 4 groupes signalés sont à garder : mêmes doses, contexte différent).

Bibliothèque commune : une fonction « envoyer la mise à jour aux cabinets », un numéro de version, un journal des changements, un export PDF et Excel.

Parcours : capacité de l'hôpital de jour, double contrôle avant préparation, plan de soins infirmier ordonné, ordonnances de sortie tirées du protocole, toxicités notées à chaque cure.

Hebdomadaire de bout en bout : bilan avant chaque injection, report d'une seule séance, montant et prise en charge par séance (J8 et J15 sont aujourd'hui à 0 DH par défaut).

## Ce qui est corrigé depuis l'audit 2

Les quatre essais de l'audit 2 passent sur la version du 12/10 (440507b), rejoués ce soir avec les patients fictifs ; les tests du moteur passent tous.

| Essai | Résultat le 12/10 |
| :-: | :-: |
| Cure validée modifiable | Corrigé : une cure validée s'ouvre en lecture seule (0 champ actif) et ses doses sont figées |
| Validation sans créatinine (carboplatine) | Corrigé : refus « créatinine manquante, dose impossible à calculer », la cure reste « prévue » |
| Créatinine aberrante (0,7 mg/L, DFG 823 ml/min) | Signalée à la validation (« bonne unité ? »), pas à la saisie ; le carboplatine reste plafonné à 750 mg (Calvert, 125 ml/min) |
| Créatinine à 70 mg/L (DFG 8 ml/min) | Alerte « carboplatine contre-indiqué », mais la même fenêtre s'affiche deux fois |
| Tests du moteur | Doses 79/79, vigilance 60/60, radiothérapie 19/19, heures 18/18, statuts 25/25 |

Ce qui reste est voulu : les alertes passent par des fenêtres « Valider quand même ? » qu'on ferme d'un clic, sans motif à saisir ; le médecin garde la main et il est prévenu. Les règles de vigilance (interactions, prémédications) sont en remarques dans le protocole, sans contrôle automatique des prémédications.

## La bibliothèque en chiffres

Un protocole sur trois (97 sur 316) devrait contenir un anti-NK1(trop chere pour les patients donc mik mak fait pour certains protocoles voit explication plus bas) ; l'aprépitant (Emend) et l'olanzapine sont pourtant disponibles au Maroc. Le risque émétique est celui de l'agent le plus émétisant, l'association anthracycline + cyclophosphamide comptant comme élevée.

bibliothèque reconstituée (316 protocoles) · classement MASCC/ESMO 2023 appliqué par script

Par gravité : 6 protocoles critiques, 130 importants, 72 à améliorer, 108 sans écart détecté. Le rangement mélange deux niveaux : « Poumon » (20) à côté de « Poumon / thorax » (25), « Colon – rectum » (11) et « Estomac » (3) à côté de « Digestif » (64) ; le protocole \[310\] n'a ni localisation ni indication. Le champ « Source » existe dans l'éditeur mais n'est rempli pour aucun protocole.

## Problèmes transversaux de la bibliothèque

La plupart des écarts se répètent d'un protocole à l'autre : ils se corrigent une fois, par des blocs réutilisables, et non 316 fois à la main.

| Problème | Protocoles | Ce que demandent les recommandations ou le RCP | Correction |
| :-: | :-: | :-: | :-: |
| Anti-NK1 absent | 97 (63 élevés, 34 modérés hauts) | Cisplatine et AC : anti-NK1 + sétron + corticoïde + olanzapine 5 mg ; carboplatine AUC ≥ 5, T-DXd, sacituzumab : anti-NK1 + sétron + corticoïde (MASCC/ESMO 2023) | Sétron et Solumedrol IV dans le protocole ; EMEND, Solupred et olanzapine sur l'ordonnance de sortie du niveau. Encore une fois trop chere, donc retirer de certaines ordo type;  |
| Phase retardée du cisplatine non couverte | 51 | Corticoïde + olanzapine J2-J4 ; cisplatine sur plusieurs jours : jusqu'à 2 jours après la dernière dose | Sur l'ordonnance « risque émétique élevé » |
| Paclitaxel sans anti-H1 | 28 sur 29 | Corticoïde + anti-H1 avant chaque perfusion | Bloc taxane |
| Docétaxel : corticoïde le seul jour de la perfusion | 6, plus \[241\] (prostate) | Corticoïde per os 3 jours, de la veille au lendemain ; prostate : H-12, H-3, H-1 | Ordonnance de prémédication à domicile |
| Cétuximab sans anti-H1 | 9 sur 9 | Anti-H1 + corticoïde au moins 1 h avant chaque perfusion | Bloc anti-EGFR |
| Cabazitaxel sans anti-H1 | 2 sur 2 | Anti-H1 + corticoïde avant chaque perfusion | Bloc taxane |
| Pémétrexed | 2 sans corticoïde (\[14\], \[18\]), 11 avec corticoïde J1 seul | Dexaméthasone 4 mg × 2/j de J-1 à J+1 ; acide folique dès J-7, vitamine B12 à J-7 puis toutes les 9 semaines | Ordonnance « Prémédication pémétrexed » (aujourd'hui en remarque) |
| Irinotécan | 9 sur 13 sans atropine, 8 sans lopéramide noté | Atropine si syndrome cholinergique ; lopéramide remis dès J1 | Bloc irinotécan + ordonnance de sortie |
| Hydratation du cisplatine | 58 : 53 en remarque seulement, 5 sans rien | NaCl 0,9 % avant et après, KCl, MgSO4 ± mannitol | Bloc hydratation en lignes, sur la fiche de l'infirmière |
| G-CSF | 65 en texte sans dose ni durée ; 18 en une seule injection J4/J18 ; 11 en prophylaxie primaire sur FOLFOX ou FOLFIRI | Prophylaxie primaire si risque de neutropénie fébrile ≥ 20 % ; filgrastim 5 µg/kg/j jusqu'à récupération ou pegfilgrastim 6 mg une fois (ASCO 2015) | Ligne Nivestim structurée dans le protocole : 30 ou 48 MU selon le poids, de quel J à quel J et nombre d'injections selon la chimiothérapie |
| Surprophylaxie | 21 à risque faible ou minimal | Un seul antiémétique ; corticoïde limité (diabète, pancréas, immunothérapie) | Alléger |
| Doses absentes (texte libre) | Bléomycine \[253\], sauvetage folinique \[217\] | Bléomycine 30 000 UI J1-J8-J15, cumul ≤ 400 000 UI ; sauvetage chiffré et guidé par la méthotrexémie | Lignes chiffrées + cumul dans le moteur |
| Libellés | 191 protocoles avec « SOLUMEDROL » sans DCI ; acide folinique en 50 mg fixe, 200 ou 400 mg/m² sans préciser racémique ou lévofolinate ; Solumedrol en mg/kg dans 2 protocoles | DCI obligatoire à côté de la marque | DCI + forme dans chaque ligne |
| Doublons | 9 groupes (18 protocoles) ; palbociclib 75, 100 et 125 mg en 3 protocoles | Un schéma, plusieurs indications ; paliers de dose dans le protocole | Fusionner |
| Classement | \[310\] sans localisation ; \[7\], \[123\], \[273\] rangés sous une seule localisation alors qu'ils servent ailleurs | Une arborescence à un seul niveau de groupes | Ranger et compléter les indications |

Corticoïdes : à dose égale d'effet, dexaméthasone 12 mg correspond à environ 64 mg de méthylprednisolone, 8 mg à 43 mg, 20 mg à 107 mg. Avec l'aprépitant, le RCP d'Emend demande de réduire la méthylprednisolone IV d'environ 25 % (per os : 50 %) ; le bloc doit le faire tout seul. (je saisp as quoi faire avec ca parce que j’ai moi meme modifié les ordo en changeant emend par chemoset car emend trop chere, donc si claude qui a fait ce document a baisé la dose de cortico peut etre la remonté ? voila les 2 ordo type ou j’ai rempla

Mention eviQ (4 noms, 75 remarques) : la retirer et indiquer à la place l'essai ou la publication d'origine, déjà notés pour chaque protocole dans le classeur.

## Protocoles à corriger en premier

Six protocoles peuvent produire une prescription fausse telle quelle ; les autres de cette liste s'écartent de leur essai ou n'en ont pas. Les numéros sont ceux du classeur.

| N° | Protocole | Gravité | Problème | Correction | Référence |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 89 | Paclitaxel 90 hebdo + pembrolizumab | Critique | Paclitaxel J1-J8-J15 tous les 21 jours, donc chaque semaine sans repos : +33 % de dose | J1-J8-J15 / 28 j, pembrolizumab 200 mg / 3 semaines suivi à part | KEYNOTE-355 |
| 197 | Cisplatine 50 + RT, puis carboplatine-paclitaxel | Critique | Les 4 cycles carboplatine AUC 5 + paclitaxel 175 ne sont pas saisis | Ajouter la 2e phase ou un protocole lié | PORTEC-3 |
| 253 | BEP | Critique | Bléomycine en texte, sans dose ni cumul | Bléomycine 30 000 UI J1-J8-J15 + cumul | Williams 1987 |
| 273 | EP cisplatine 75 + étoposide | Critique | Aucun antiémétique ni corticoïde | Bloc « élevé » + hydratation ; ranger aussi en CBPC | INT 0096 (EP) |
| 14 | Pémétrexed + cisplatine 25 J1-J3 + pembrolizumab | Critique | Aucun corticoïde : ni prévention du rash du pémétrexed ni antiémétique du cisplatine | Bloc pémétrexed + bloc cisplatine sur plusieurs jours | Variante de KEYNOTE-189 |
| 217 | MAP (méthotrexate 12 g/m²) | Critique | Sauvetage par acide folinique en texte, sans dose ni horaire | Sauvetage chiffré à partir de H24, guidé par la méthotrexémie ; hyperhydratation alcaline en lignes | EURAMOS-1 |
| 125 | Cisplatine + capécitabine + trastuzumab + pertuzumab | Important | Essai négatif : le pertuzumab n'apporte rien | Retirer ; garder ToGA \[126\] et KEYNOTE-811 \[127\] | JACOB |
| 4 | mFOLFOX6 + trastuzumab (côlon HER2+) | Important | Aucun essai de phase III | Tucatinib + trastuzumab ou T-DXd selon accès | MOUNTAINEER ; DESTINY-CRC02 |
| 124 | FOLFIRI + trastuzumab (estomac) | Important | Aucun essai de référence | Marquer « hors référentiel » ou retirer | ToGA |
| 28 | Carboplatine hebdo + bévacizumab (sein) | Important | Aucune référence | Retirer ou marquer « hors référentiel » | E2100 (avec paclitaxel) |
| 59 | Docétaxel + trastuzumab × 4 en adjuvant | Important | Ni anthracycline ni carboplatine : pas de schéma de référence | TCH (à ajouter) ou paclitaxel hebdo + trastuzumab \[60\] | BCIRG 006 ; APT |
| 105 | mFOLFIRINOX sans bolus | Important | Indiqué en rectum avec l'irinotécan 150 mg/m² de PRODIGE 24 | Version rectum à 180 mg/m² | PRODIGE 23 |
| 238 | Darolutamide | Important | Indiqué en métastatique résistant à la castration, hors AMM | Retirer cette indication | ARAMIS ; ARASENS |
| 251 | Cisplatine + étoposide hebdomadaires | Important | Étoposide 100 mg/m² chaque semaine : schéma non référencé | Revoir la source ou retirer | – |
| 214 | Trabéctédine | Important | Solumedrol 80 mg alors que le RCP demande l'équivalent de 20 mg de dexaméthasone | Méthylprednisolone 100 mg | RCP Yondelis |
| 211 | AI sur 3 jours (HGC) | Important | « Bicarbonate 14 ‰ 500 mg » : unité probablement en ml | Corriger l'unité | – |
| 135 | CAPOX + zolbétuximab | Important | Pas d'anti-NK1 alors que le RCP l'impose avant chaque perfusion | Sétron dans le protocole ; EMEND sur l'ordonnance de sortie | GLOW ; RCP Vyloy |
| 84 | Sacituzumab | Important | Prémédication en remarque seulement ; pas d'anti-NK1 | Paracétamol + anti-H1 en lignes ; EMEND sur l'ordonnance « carboplatine, Enhertu, Trodelvy » | ASCENT ; RCP Trodelvy |
| 247, 248 | Cabazitaxel | Important | Pas d'anti-H1 ; G-CSF « selon prescription » | Bloc taxane ; G-CSF à discuter d'emblée | CARD ; RCP Jevtana |
| 310 | Paclitaxel + carboplatine + pembrolizumab | Important | Ni localisation ni indication : invisible dans l'arborescence | Ranger en endomètre et col | NRG-GY018 ; KEYNOTE-826 |

Les variantes « HGC » (cisplatine fractionné J1-J3, carboplatine AUC 2 hebdomadaire, TPF tous les 14 jours…) ne sont pas des erreurs, mais elles n'ont pas d'essai de référence : les marquer « variante locale » avec l'essai dont elles dérivent, ce qui aide aussi pour les dossiers de prise en charge. D’ailleurs eneleve toute mention de HGC.

## Protocoles manquants et versions hebdomadaires

La bibliothèque couvre bien les thérapies ciblées récentes, mais il lui manque des schémas de base : pas d'AC, pas de TC, pas de TCH, pas de cisplatine 100 mg/m² + RT en ORL. Ces ajouts ont été vérifiés un par un contre la bibliothèque. Le classeur les contient sous deux formes : 123 protocoles à créer, écrits en entier avec leur essai (décision « À créer »), et les indications à ajouter aux protocoles existants.

| Localisation | À ajouter en premier | Essai de référence |
| :-: | :-: | :-: |
| Sein | AC 60/600 toutes les 3 semaines × 4 | NSABP B-15 ; B-31 |
| Sein | AC dose dense 60/600 toutes les 2 semaines + G-CSF | CALGB 9741 |
| Sein | TC : docétaxel 75 + cyclophosphamide 600 / 21 j × 4 à 6 | US Oncology 9735 |
| Sein HER2+ | TCH : docétaxel 75 + carboplatine AUC 6 + trastuzumab × 6 | BCIRG 006 |
| Sein HER2+ | TCHP (TCH + pertuzumab) × 6 | TRAIN-2 ; TRYPHAENA |
| ORL | Cisplatine 100 mg/m² J1-J22-J43 + RT (définitive ou postopératoire) | RTOG 9501 / EORTC 22931 ; RTOG 0129 |
| Nasopharynx | Cisplatine 100 mg/m² J1-J22-J43 + RT | Intergroup 0099 |
| Poumon EGFR | Géfitinib 250 mg/j, afatinib 40 mg/j | IPASS ; LUX-Lung 7 |
| Poumon CBPC | EP cisplatine 75 + étoposide 100 J1-J3 : existe \[273\] mais rangé en prostate | Turrisi 1999 ; CONVERT |
| Prostate | Cabazitaxel 25 mg/m² + prednisone + G-CSF | TROPIC ; CARD |
| Prostate | Bicalutamide 50 mg/j autour de la 1re injection d'agoniste (effet flare) | Schéma usuel (EAU) |
| Primitif inconnu | Carboplatine-paclitaxel, cisplatine-gemcitabine : indications à ajouter | ESMO 2023 (CUP) |

S'y ajoutent les 10 blocs de traitements associés de la partie précédente. Les priorités 2 et 3 concernent surtout le poumon (14), le sein (12), le côlon (5), la prostate, les sarcomes, la peau (carcinome épidermoïde, basocellulaire, Merkel) et la maladie trophoblastique, absente aujourd'hui (méthotrexate, actinomycine D, EMA-CO). Les lymphomes ne sont listés qu'en priorité 3, au cas où le cabinet les prend en charge.

### Versions hebdomadaires

Pour chaque schéma toutes les 3 semaines qui a une version hebdomadaire publiée, le classeur donne la version à créer, écrite en entier, ou la référence à ajouter au protocole qui existe déjà. Les plus utiles :

| Localisation | Schéma hebdomadaire | Référence | Dans la bibliothèque |
| :-: | :-: | :-: | :-: |
| Ovaire | Carboplatine AUC 2 + paclitaxel 60 chaque semaine × 18 | MITO-7 | Proche de la variante locale \[24\] |
| Ovaire | Paclitaxel 80 J1-J8-J15 + carboplatine AUC 6 J1 / 21 j | JGOG 3016 ; ICON8 | Proche de \[303\] (sein) |
| Ovaire | Paclitaxel 80 hebdo + bévacizumab 10 mg/kg / 14 j | AURELIA | Paclitaxel seul \[31\] |
| Col | Carboplatine AUC 2 + paclitaxel 80 hebdo × 6, puis radiochimiothérapie | INTERLACE | Proche de \[24\] |
| Poumon | Carboplatine AUC 6 J1 + paclitaxel 100 J1-J8-J15 / 28 j | Belani 2008 | Absent |
| Poumon | Carboplatine AUC 6 + nab-paclitaxel 100 J1-J8-J15 / 21 j (± pembrolizumab) | KEYNOTE-407 | Absent |
| Poumon, sein | Docétaxel 35 mg/m² J1-J8-J15 / 28 j | Schuette 2005 ; Burstein 2000 | Absent |
| Sein | Paclitaxel 80 + trastuzumab 4 puis 2 mg/kg chaque semaine | APT | \[60\] avec trastuzumab / 21 j |
| Sein | Nab-paclitaxel 100-125 J1-J8-J15 / 28 j | CA024 | Absent (\[49\] est / 21 j) |
| Sein | Épirubicine 25-30 ou doxorubicine 20 mg/m² chaque semaine | Twelves ; Gasparini | Absent |
| ORL | Paclitaxel 80 + cétuximab chaque semaine | ERBITAX | Absent |
| Côlon | Irinotécan 125 mg/m² J1-J8-J15-J22 / 42 j | Rothenberg 1996 | Absent |

L'hebdomadaire demande au logiciel plus que des lignes : un bilan et un feu vert avant chaque injection, le report d'une seule semaine sans décaler toute la ligne, un rendez-vous et une place au fauteuil chaque semaine, un montant et une prise en charge par séance. Aujourd'hui la consultation de J8 et J15 est à 0 DH par défaut ; il faut un montant par jour et par protocole, réglable par le cabinet.

## Prêt à copier-coller

Tout ce qui suit respecte la règle du cabinet. La fiche de prescription (le protocole) contient ce qui est fait au service les jours de chimiothérapie (la chimiothérapie, la prémédication injectable du jour, l'hydratation), le retrait du diffuseur et le Nivestim : la fiche part à la prise en charge, et le Nivestim n'est pris en charge avec la chimiothérapie que s'il y figure. Ce que le patient prend chez lui (EMEND 1 h avant, SOLUPRED les jours suivants, olanzapine, acide folique, vitamine B12, lopéramide) est sur une ordonnance à part, remise avec la fiche quand elle part à la prise en charge (environ une semaine avant la C1J1), puis à chaque cure. Les lignes sont écrites dans les colonnes de l'éditeur (Produit, Dose, Unité, Jours, Libellé jour, Précision, Voie, Soluté + volume, Durée, Options). Le classeur reprend tout cela protocole par protocole, dans son onglet unique : les lignes dans la colonne « À saisir dans le protocole », l'ordonnance dans la colonne voisine, le texte des ordonnances en bas du tableau. Les doses sont celles des essais et des RCP, adaptées au Solumedrol et au Solupred ; elles restent à relire avant de passer un protocole en « Validé ». (Dr Bentahila : non pas le temps pas besoin de relire pour valider)

### Blocs de prémédication

Pour chaque situation : ce qui se colle dans le protocole, puis ce qui part sur l'ordonnance de sortie.

Risque émétique élevé : cisplatine sur 1 jour, dacarbazine (exemple J1)

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |

Ordonnance « Chimio: risque émétique élevé (cisplatine, dacarbazine) » : EMEND 125 mg 1 h avant la chimiothérapie (J1) puis 80 mg le matin à J2 et J3 ; SOLUPRED 60 mg le matin de J2 à J4 ; olanzapine 5 mg le soir de J1 à J4.

Pour un cisplatine à J22 ou J43 : les mêmes lignes à J22 ou J43, la même ordonnance remise ce jour-là.

AC : anthracycline + cyclophosphamide

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |

Ordonnance « Chimio : AC (anthracycline + cyclophosphamide) » : EMEND 125 mg puis 80 mg à J2 et J3 ; olanzapine 5 mg le soir de J1 à J4. Pas de corticoïde après J1 (MASCC/ESMO 2023).

Carboplatine AUC ≥ 5, Enhertu, Trodelvy

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |

Ordonnance « Chimio – Sortie : carboplatine, Enhertu, Trodelvy » : EMEND 125 mg puis 80 mg à J2 et J3. Rien d'autre en systématique après J1.

Cisplatine sur plusieurs jours (exemple J1 à J5 : BEP, EP, VIP)

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1,2,3,4,5 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 40 | mg (dose fixe) | 1,2,3,4,5 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |

Ordonnance « Chimio – Sortie : cisplatine sur plusieurs jours (BEP, EP, VIP…) » : EMEND 125 mg à J1 puis 80 mg chaque matin jusqu'à 2 jours après le dernier cisplatine ; SOLUPRED 60 mg les 2 jours qui suivent ; olanzapine 5 mg le soir jusqu'à 2 jours après.

Cisplatine hebdomadaire + radiothérapie (exemple J1, J8…)

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |

Chaque semaine, l'ordonnance « Chimio – Sortie : carboplatine, Enhertu, Trodelvy » (même contenu : EMEND 125 mg puis 80 mg les 2 jours suivants).

Paclitaxel (à chaque jour de paclitaxel)

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj. | 5 | mg (dose fixe) | 1 | 30 min avant la perfusion | IV lente |  |  |
| SOLUMEDROL (méthylprednisolone) inj. | 80 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |

SOLUMEDROL 80 mg en hebdomadaire, 100 mg pour 175 mg/m² toutes les 3 semaines ; −25 % les jours d'EMEND.

Docétaxel ≥ 60 mg/m²

Rien de plus dans le protocole que le Solumedrol IV de J1 prévu par le bloc antiémétique. Ordonnance « Chimio – Prémédication docétaxel (à prendre à domicile) » : SOLUPRED 60 mg matin et soir la veille, le jour (le soir seulement si Solumedrol IV le matin) et le lendemain. Prostate : ordonnance « Chimio – Prémédication docétaxel prostate (à prendre à domicile) » (SOLUPRED 60 mg la veille au soir et le matin de la perfusion ; le Solumedrol IV 1 h avant est fait au service). La prise de la veille part avec la fiche de prescription pour la C1, puis avec la cure précédente.

Cétuximab (à chaque jour de cétuximab)

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj. | 5 | mg (dose fixe) | 1 | 1 h avant le cétuximab | IV lente |  |  |
| SOLUMEDROL (méthylprednisolone) inj. | 40 | mg (dose fixe) | 1 | 1 h avant le cétuximab | IV | NaCl 0,9 % 50 ml | 15 min |

Ordonnance « Chimio – Anti-EGFR : peau (cétuximab, panitumumab) ».

Pémétrexed

Rien de plus dans le protocole que le Solumedrol IV de J1 quand le bloc antiémétique le prévoit. Ordonnance « Chimio – Prémédication pémétrexed (ALIMTA) » : acide folique dès J-7, vitamine B12 à J-7 puis toutes les 9 semaines, SOLUPRED 20 mg matin et soir la veille, le jour et le lendemain.

Irinotécan

| Produit | Dose | Unité | Jours | Précision | Voie |
| :-: | :-: | :-: | :-: | :-: | :-: |
| ATROPINE 0,25 mg/1 ml inj. | 0,25 mg SC si syndrome cholinergique (sueurs, crampes, diarrhée précoce, larmoiement) | texte libre | 1 | SC |  |

Ordonnance « Chimio – Irinotécan : diarrhée retardée » (lopéramide), remise à chaque cure.

Hydratation du cisplatine (dose ≥ 50 mg/m² ; 500 ml en dessous)

| Produit | Dose | Unité | Jours | Précision | Voie |
| :-: | :-: | :-: | :-: | :-: | :-: |
| HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 1000 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1 | en 1 h, avant le cisplatine | IV |
| HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 1000 ml | texte libre | 1 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |

Mannitol 10 % 250 ml facultatif ; diurèse surveillée.

G-CSF (Nivestim)

Le Nivestim reste dans le protocole, sur une seule ligne structurée : début 24 à 72 h après la fin de la chimiothérapie (J+2 d'une perfusion courte, lendemain du retrait d'un diffuseur), 5 injections, arrêt au moins 24 h avant la chimiothérapie suivante. Exemple pour une chimiothérapie à J1 :

| Produit | Dose | Unité | Jours | Libellé jour | Précision | Voie |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| NIVESTIM (filgrastim) 30 MU/0,5 ml | 1 injection SC par jour : 30 MU, 48 MU si poids \> 70 kg | texte libre | 3,4,5,6,7 | J3 → J7 : 5 injections | à domicile (infirmière), dès 24 h après la fin de la chimiothérapie | SC |

Selon la chimiothérapie : J1 → J3 à J7 ; diffuseur de 5-FU retiré à J3 (FOLFIRINOX, FOLFOXIRI) → J4 à J8, et J18 à J22 après la cure de J15 ; J1-J3 (carboplatine-étoposide) → J5 à J9 ; J1-J5 (BEP, VIP, topotécan) → J7 à J11 ; J1-J8 (gemcitabine) → J10 à J14 ; dose dense toutes les 2 semaines → J3 à J9 (7 injections). Le classeur donne les jours exacts des 54 protocoles qui ont une ligne Nivestim. Dans les 11 FOLFOX et FOLFIRI, la retirer (pas de prophylaxie primaire : risque de neutropénie fébrile \< 10 %). L'ordonnance « Chimio – Sous Nivestim : douleurs osseuses et NFS » ne porte que le paracétamol des douleurs osseuses et la NFS.

Équivalences retenues : dexaméthasone 8 mg ≈ Solupred 50 à 60 mg (3 comprimés de 20 mg retenus) ≈ Solumedrol 40 mg. Avec l'EMEND, le Solumedrol IV de J1 est baissé d'environ 25 % (RCP Emend) : 80 mg devient 60 mg, 120 mg devient 90 mg.

### Seuils du jour

Par défaut, les seuils de l'application : PNN ≥ 1,5 G/L et plaquettes ≥ 100 G/L. Le classeur ajoute à chaque protocole, existant ou à créer, ses seuils particuliers (colonne « Seuils particuliers du jour»), le medecin rempli (optionnelle) les valeurs et si pas bien ben ca suit ce qu’on a deja fait cest a dire fenetre pour prevenir comme c’est deja le cas voici des seuil particulier supplémentaire a mettre par exemple :

| Molécule ou situation | Seuil particulier |
| :-: | :-: |
| Hebdomadaire (J8, J15…) | PNN ≥ 1,0 G/L et plaquettes ≥ 75 G/L |
| Gemcitabine J8/J15 | PNN ≥ 1,0 et plaquettes ≥ 100 → 100 % ; PNN 0,5-1,0 ou plaquettes 50-100 → 75 % ; en dessous, séance non faite |
| Cisplatine | DFG ≥ 60 ml/min (45-59 : réduire ou carboplatine) ; magnésémie et audition avant chaque cure |
| Carboplatine | créatinine du jour obligatoire (Calvert, clairance plafonnée à 125 ml/min) |
| Docétaxel | bilirubine ≤ normale ; ne pas faire si ASAT/ALAT \> 1,5 × N avec PAL \> 2,5 × N |
| Paclitaxel | bilirubine ≤ 1,5 × N ; neuropathie de grade ≥ 2 → réduire |
| Irinotécan | bilirubine ≤ 1,5 × N ; pas de diarrhée en cours ; génotype UGT1A1\*28 si toxicité |
| Pémétrexed | DFG ≥ 45 ml/min |
| Capécitabine | DFG 30-50 ml/min → 75 % ; \< 30 contre-indiquée ; uracilémie (DPD) avant la 1re cure |
| Anthracycline | FEVG ≥ 50 % ; cumul doxorubicine ≤ 450 mg/m² (épirubicine ≤ 900) |
| Trastuzumab | FEVG ≥ 50 % (échographie tous les 3 mois) ; arrêt si baisse ≥ 10 points sous 50 % |
| Anti-VEGF | TA \< 160/100 ; protéinurie \< 2 g/24 h (bandelette \< 2+) ; pas de chirurgie \< 28 jours |
| Anti-EGFR | magnésémie ; éruption de grade 3 → report |
| Immunothérapie | TSH, transaminases, créatinine, glycémie avant chaque cure ; toxicité immunologique de grade ≥ 2 → suspendre |
| Trabéctédine | PNN ≥ 1,5, plaquettes ≥ 100, bilirubine ≤ N, PAL ≤ 2,5 × N, ASAT/ALAT ≤ 2,5 × N, CPK ≤ 2,5 × N |
| Méthotrexate | DFG ≥ 60 ml/min ; pas d'épanchement (3e secteur) |

Tant que l'éditeur n'a pas de case « Seuils », la ligne se colle dans les remarques/vigilences.

### Les 6 protocoles critiques, ligne par ligne

\[89\] Paclitaxel 90 hebdo + Pembrolizumab 200 / 21 j (KEYNOTE-355)

MODIFIER : Cycle : 84 jours (= 3 × 28 = 4 × 21) ; Rythme : « Paclitaxel J1-J8-J15 de chaque période de 28 jours ; pembrolizumab toutes les 3 semaines »

MODIFIER : SOLUMEDROL, ONSET et POLARAMINE : jours 1,8,15,29,36,43,57,64,71 (les jours du paclitaxel)

| Action | Produit | Dose | Unité | Jours | Précision | Voie | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Modifier (remplace PACLITAXEL J1,8,15) | PACLITAXEL | 90 | mg/m² | 1,8,15,29,36,43,57,64,71 | IV | 1 h |  |
| Modifier (remplace pembrolizumab J1) | KEYTRUDA / PEMORIAL (pembrolizumab) | 200 | mg (dose fixe) | 1,22,43,64 | IV | 30 min |  |
| Ajouter | POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj. | 5 | mg (dose fixe) | 1,8,15,29,36,43,57,64,71 | 30 min avant la perfusion | IV lente |  |

\[197\] Cisplatine 50 J1-J22 + Radiothérapie (PORTEC-3), puis Carboplatine + Paclitaxel × 4

PROTOCOLE LIÉ à créer : Nom « PORTEC-3 – phase 2 : Carboplatine AUC 5 + Paclitaxel 175 / 21 j × 4 », cycle 21, à démarrer 3 semaines après la fin de la RT

| Action | Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Ajouter (protocole lié) | ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| Ajouter (protocole lié) (dose réduite de 25 % pour l'aprépitant) | SOLUMEDROL (méthylprednisolone) inj. | 80 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| Ajouter (protocole lié) | POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj. | 5 | mg (dose fixe) | 1 | 30 min avant la perfusion | IV lente |  |  |
| Ajouter (protocole lié) | PACLITAXEL | 175 | mg/m² | 1 | IV | NaCl 0,9 % 500 ml, filtre 0,22 µm | 3 h |  |
| Ajouter (protocole lié) | CARBOPLATINE | 5 | AUC (carboplatine) | 1 | IV | G5 % 250 ml | 30-60 min |  |
| Ajouter | HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 1000 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1,22 | en 1 h, avant le cisplatine | IV |  |  |
| Ajouter | HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 1000 ml | texte libre | 1,22 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |  |  |

Ordonnance(s) de sortie : « Chimio – Sortie : risque émétique élevé (cisplatine, dacarbazine) » ; « Chimio – Sortie : carboplatine, Enhertu, Trodelvy (pour le protocole lié) ».

\[253\] BEP / 21 j

REMARQUE à ajouter : Bléomycine : cumul maximal 400 000 UI (400 mg) ; DLCO avant le C1 ; arrêt si toux, crépitants ou baisse de la DLCO

| Action | Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Remplacer (remplace la ligne « BLÉOMYCINE » en texte libre) | BLÉOMYCINE | 30 | mg (dose fixe) | 1,8,15 | 30 mg = 30 000 UI | IV | NaCl 0,9 % 100 ml | 15 min |
| Ajouter | HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 500 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1,2,3,4,5 | en 1 h, avant le cisplatine | IV |  |  |
| Ajouter | HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 500 ml | texte libre | 1,2,3,4,5 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |  |  |
| Remplacer (remplace la ligne « NIVESTIM 30 MU (filgrastim) » sans dose ni durée) | NIVESTIM (filgrastim) 30 MU/0,5 ml | 1 injection SC par jour : 30 MU, 48 MU si poids \> 70 kg | texte libre | 7,8,9,10,11 | J7 → J11 : 5 injections ; à domicile (infirmière), dès 24 h après la fin de la chimiothérapie ; si G-CSF décidé | SC |  |  |

Ordonnance(s) de sortie : « Chimio : cisplatine sur plusieurs jours (BEP, EP, VIP…) » ; « Chimio – Sous Nivestim : douleurs osseuses et NFS (si G-CSF décidé) ».

\[273\] EP 21 jours (Cisplatine 75 + Étoposide 100 J1-J3)

INDICATION à ajouter : Poumon / thorax \> CBPC \> Maladie limitée

INDICATION à ajouter : Poumon / thorax \> CBPC \> Maladie étendue

| Action | Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Ajouter | ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| Ajouter | SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| Ajouter | HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 1000 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1 | en 1 h, avant le cisplatine | IV |  |  |
| Ajouter | HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 1000 ml | texte libre | 1 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |  |  |

Ordonnance(s) de sortie : « Chimio – Sortie : risque émétique élevé (cisplatine, dacarbazine) ».

\[14\] Pémétrexed + Cisplatine 25 J1-J3 + Pembrolizumab – fractionné (HGC)

REMARQUE à ajouter : Pémétrexed : corticoïde la veille (J-1) matin et soir à domicile, sur l'ordonnance « Chimio – Prémédication pémétrexed (ALIMTA) »

| Action | Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Ajouter | SOLUMEDROL (méthylprednisolone) inj. | 40 | mg (dose fixe) | 1,2,3 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| Ajouter | HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 500 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1,2,3 | en 1 h, avant le cisplatine | IV |  |  |
| Ajouter | HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 500 ml | texte libre | 1,2,3 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |  |  |

Ordonnance(s) de sortie : « Chimio – Sortie : cisplatine sur plusieurs jours (BEP, EP, VIP…) » ; « Chimio – Prémédication pémétrexed (ALIMTA) ».

\[217\] MAP (EURAMOS) : Cisplatine + Doxorubicine J1-J2, Méthotrexate HD J22 et J29 / 35 j

REMARQUE à ajouter : Méthotrexatémie à H24, H48, H72 ; glucarpidase si élimination retardée ; pas d'AINS, d'IPP ni de cotrimoxazole

| Action | Produit | Dose | Unité | Jours | Libellé jour | Précision | Voie |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Remplacer (remplace la ligne en texte libre) | ACIDE FOLINIQUE (folinate de calcium) – sauvetage | 15 mg/m² IV puis per os toutes les 6 h, de H24 jusqu'à méthotrexatémie \< 0,2 µmol/L (au moins 10 prises) | texte libre | 23,30 | H24 après chaque méthotrexate | IV / per os |  |
| Ajouter | HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 1000 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1,2 | en 1 h, avant le cisplatine | IV |  |
| Ajouter | HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 1000 ml | texte libre | 1,2 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |  |
| Ajouter | HYPERHYDRATATION ALCALINE | 3 L/m²/24 h (G5 % + bicarbonate de sodium + KCl), de H-12 jusqu'à méthotrexatémie \< 0,2 µmol/L ; pH urinaire \> 7 | texte libre | 22,29 | IV |  |  |
| Remplacer (remplace la ligne « NIVESTIM 30 MU (filgrastim) » sans dose ni durée) | NIVESTIM (filgrastim) 30 MU/0,5 ml | 1 injection SC par jour : 30 MU, 48 MU si poids \> 70 kg | texte libre | 4,5,6,7,8 | J4 → J8 : 5 injections | à domicile (infirmière), dès 24 h après la fin de la chimiothérapie ; si G-CSF décidé | SC |

Ordonnance(s) de sortie : « Chimio – Sortie : cisplatine sur plusieurs jours (BEP, EP, VIP…) » ; « Chimio – Sous Nivestim : douleurs osseuses et NFS (si G-CSF décidé) ».

### Les 11 protocoles à créer en priorité

Les 112 autres (priorités 2 et 3, dont les versions hebdomadaires) sont dans le classeur (décision « À créer »), écrits de la même façon.

Géfitinib 250 mg/j

Branche : Poumon / thorax \> CBNPC \> Métastatique \> EGFR muté

Cycle : 28 jours ; rythme : 1 prise par jour en continu

Remarques : Bilan hépatique mensuel / Éviter les IPP (absorption) ; si nécessaires, prendre le géfitinib 2 h avant

Seuils du jour : seuils normaux

Source : IPASS ; risque émétique : Oral faible

Ordonnance(s) de sortie : aucune

| Produit | Dose | Unité | Jours | Libellé jour | Précision | Voie | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| IRESSA (géfitinib) 250 mg cp | 250 | mg (dose fixe) | 1 | J1 → J28 (continu) | Per os | 28 jours |  |

Afatinib 40 mg/j

Branche : Poumon / thorax \> CBNPC \> Métastatique \> EGFR muté

Cycle : 28 jours ; rythme : 1 prise par jour en continu, à jeun

Remarques : Paliers : 40 → 30 → 20 mg / Diarrhée et paronychie : lopéramide et soins dès J1

Seuils du jour : seuils normaux

Source : LUX-Lung 7 ; risque émétique : Oral faible

Ordonnance(s) de sortie : aucune

| Produit | Dose | Unité | Jours | Libellé jour | Précision | Voie | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| GIOTRIF (afatinib) 40 mg cp | 40 | mg (dose fixe) | 1 | J1 → J28 (continu) | 1 h avant ou 3 h après un repas | Per os | 28 jours |
| LOPERIUM (lopéramide) 2 mg | dès la 1re selle liquide | texte libre | 1 | Per os |  |  |  |

TCH : Docétaxel 75 + Carboplatine AUC 6 + Trastuzumab / 21 j × 6

Branche : Sein \> Sein \> Localisé – adjuvant \> HER2+ ; Sein \> Sein \> Localisé – néoadjuvant \> HER2+

Cycle : 21 jours ; rythme : J1, tous les 21 jours × 6, puis trastuzumab seul jusqu'à 1 an

Remarques : Trastuzumab au total 1 an (18 administrations) / FEVG tous les 3 mois / G-CSF selon le risque (âge, comorbidités)

Seuils du jour : seuils normaux, plus : Carboplatine : créatinine du jour obligatoire (Calvert, clairance plafonnée à 125 ml/min) ; Docétaxel : bilirubine ≤ normale ; ne pas faire si ASAT/ALAT \> 1,5 × N avec PAL \> 2,5 × N ; Trastuzumab : FEVG ≥ 50 % (échographie tous les 3 mois) ; arrêt si baisse ≥ 10 points sous 50 %

Source : BCIRG 006 (Slamon 2011) ; risque émétique : Modéré haut (carboplatine AUC 6)

Ordonnance(s) de sortie : « Chimio – Sortie : carboplatine, Enhertu, Trodelvy » ; « Chimio – Prémédication docétaxel (à prendre à domicile) »

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| HERCEPTIN (trastuzumab) | 8/6 | mg/kg charge C1 / suite | 1 | IV | NaCl 0,9 % 250 ml | 90 min (C1) puis 30 min |  |
| DOCÉTAXEL | 75 | mg/m² | 1 | IV | NaCl 0,9 % 250 ml | 1 h |  |
| CARBOPLATINE | 6 | AUC (carboplatine) | 1 | IV | G5 % 250 ml | 30-60 min |  |

AC 60/600 / 21 j × 4

Branche : Sein \> Sein \> Localisé – adjuvant \> RH+ / HER2− – chimiothérapie ; Sein \> Sein \> Localisé – adjuvant \> Triple négatif ; Sein \> Sein \> Localisé – néoadjuvant \> RH+ / HER2− ; Sein \> Sein \> Localisé – néoadjuvant \> Triple négatif ; Sein \> Sein \> Localisé – adjuvant \> HER2+ ; Sein \> Sein \> Localisé – néoadjuvant \> HER2+

Cycle : 21 jours ; rythme : J1, tous les 21 jours × 4, puis taxane

Remarques : FEVG avant la 1re cure / Suivi par paclitaxel hebdomadaire × 12 ou docétaxel × 4 / G-CSF en prophylaxie secondaire si neutropénie fébrile

Seuils du jour : seuils normaux, plus : Anthracycline : FEVG ≥ 50 % ; cumul doxorubicine ≤ 450 mg/m² (épirubicine ≤ 900)

Source : NSABP B-15 ; NSABP B-31 ; risque émétique : Élevé (AC)

Ordonnance(s) de sortie : « Chimio – Sortie : AC (anthracycline + cyclophosphamide) »

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| DOXORUBICINE | 60 | mg/m² | 1 | IV | NaCl 0,9 % 100 ml | 15 min |  |
| CYCLOPHOSPHAMIDE (Endoxan) | 600 | mg/m² | 1 | IV | NaCl 0,9 % 250 ml | 30 min |  |

AC dose dense 60/600 / 14 j × 4 + G-CSF

Branche : Sein \> Sein \> Localisé – adjuvant \> RH+ / HER2− – chimiothérapie ; Sein \> Sein \> Localisé – adjuvant \> Triple négatif ; Sein \> Sein \> Localisé – néoadjuvant \> RH+ / HER2− ; Sein \> Sein \> Localisé – néoadjuvant \> Triple négatif

Cycle : 14 jours ; rythme : J1, tous les 14 jours × 4, G-CSF à chaque cure, puis paclitaxel 175 dose dense ou hebdomadaire

Remarques : G-CSF obligatoire (dose dense) / FEVG avant la 1re cure

Seuils du jour : seuils normaux, plus : Anthracycline : FEVG ≥ 50 % ; cumul doxorubicine ≤ 450 mg/m² (épirubicine ≤ 900)

Source : CALGB 9741 (Citron 2003) ; risque émétique : Élevé (AC)

Ordonnance(s) de sortie : « Chimio – Sortie : AC (anthracycline + cyclophosphamide) » ; « Chimio – Sous Nivestim : douleurs osseuses et NFS »

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| DOXORUBICINE | 60 | mg/m² | 1 | IV | NaCl 0,9 % 100 ml | 15 min |  |
| CYCLOPHOSPHAMIDE (Endoxan) | 600 | mg/m² | 1 | IV | NaCl 0,9 % 250 ml | 30 min |  |
| NIVESTIM (filgrastim) 30 MU/0,5 ml | 1 injection SC par jour : 30 MU, 48 MU si poids \> 70 kg | texte libre | 3,4,5,6,7,8,9 | J3 → J9 : 7 injections ; à domicile (infirmière), dès 24 h après la fin de la chimiothérapie | SC |  |  |

TC : Docétaxel 75 + Cyclophosphamide 600 / 21 j × 4 à 6

Branche : Sein \> Sein \> Localisé – adjuvant \> RH+ / HER2− – chimiothérapie ; Sein \> Sein \> Localisé – adjuvant \> Triple négatif

Cycle : 21 jours ; rythme : J1, tous les 21 jours × 4 (à 6)

Remarques : Risque de neutropénie fébrile 10-20 % : G-CSF recommandé (âge \> 65 ans, comorbidités) / Prémédication docétaxel : SOLUPRED la veille, le jour et le lendemain (ordonnance de sortie)

Seuils du jour : seuils normaux, plus : Docétaxel : bilirubine ≤ normale ; ne pas faire si ASAT/ALAT \> 1,5 × N avec PAL \> 2,5 × N

Source : US Oncology 9735 (Jones 2009) ; risque émétique : Modéré

Ordonnance(s) de sortie : « Chimio – Sortie : risque émétique modéré (oxaliplatine, irinotécan…) » ; « Chimio – Prémédication docétaxel (à prendre à domicile) » ; « Chimio – Sous Nivestim : douleurs osseuses et NFS »

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| DOCÉTAXEL | 75 | mg/m² | 1 | IV | NaCl 0,9 % 250 ml | 1 h |  |
| CYCLOPHOSPHAMIDE (Endoxan) | 600 | mg/m² | 1 | IV | NaCl 0,9 % 250 ml | 30 min |  |
| NIVESTIM (filgrastim) 30 MU/0,5 ml | 1 injection SC par jour : 30 MU, 48 MU si poids \> 70 kg | texte libre | 3,4,5,6,7 | J3 → J7 : 5 injections ; à domicile (infirmière), dès 24 h après la fin de la chimiothérapie | SC |  |  |

TCHP : Docétaxel 75 + Carboplatine AUC 6 + Trastuzumab + Pertuzumab / 21 j × 6

Branche : Sein \> Sein \> Localisé – néoadjuvant \> HER2+ ; Sein \> Sein \> Localisé – adjuvant \> HER2+

Cycle : 21 jours ; rythme : J1, tous les 21 jours × 6, puis trastuzumab ± pertuzumab jusqu'à 1 an

Remarques : Diarrhée fréquente : lopéramide sur l'ordonnance de sortie / FEVG tous les 3 mois / Surveillance 60 min après pertuzumab et trastuzumab à C1, 30 min ensuite

Seuils du jour : seuils normaux, plus : Carboplatine : créatinine du jour obligatoire (Calvert, clairance plafonnée à 125 ml/min) ; Docétaxel : bilirubine ≤ normale ; ne pas faire si ASAT/ALAT \> 1,5 × N avec PAL \> 2,5 × N ; Trastuzumab : FEVG ≥ 50 % (échographie tous les 3 mois) ; arrêt si baisse ≥ 10 points sous 50 %

Source : TRAIN-2 ; TRYPHAENA ; risque émétique : Modéré haut (carboplatine AUC 6)

Ordonnance(s) de sortie : « Chimio – Sortie : carboplatine, Enhertu, Trodelvy » ; « Chimio – Prémédication docétaxel (à prendre à domicile) » ; « Chimio – Sous Nivestim : douleurs osseuses et NFS »

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| PERJETA (pertuzumab) | 840/420 | mg charge C1 / suite | 1 | IV | NaCl 0,9 % 250 ml | 60 min (C1) puis 30 min |  |
| HERCEPTIN (trastuzumab) | 8/6 | mg/kg charge C1 / suite | 1 | IV | NaCl 0,9 % 250 ml | 90 min (C1) puis 30 min |  |
| DOCÉTAXEL | 75 | mg/m² | 1 | IV | NaCl 0,9 % 250 ml | 1 h |  |
| CARBOPLATINE | 6 | AUC (carboplatine) | 1 | IV | G5 % 250 ml | 30-60 min |  |
| NIVESTIM (filgrastim) 30 MU/0,5 ml | 1 injection SC par jour : 30 MU, 48 MU si poids \> 70 kg | texte libre | 3,4,5,6,7 | J3 → J7 : 5 injections ; à domicile (infirmière), dès 24 h après la fin de la chimiothérapie | SC |  |  |

Bicalutamide 50 mg/j autour de la 1re injection d'agoniste LHRH (effet flare)

Branche : Traitements associés \> Castration \> Agonistes / antagonistes LHRH ; Urologie \> Prostate \> Métastatique hormonosensible

Cycle : 0 (sans cures répétées) ; rythme : 1 cp par jour, de 7 jours avant à 21 jours après la 1re injection

Remarques : Inutile avec le dégarélix

Seuils du jour : seuils normaux

Source : EAU (schéma usuel) ; risque émétique : Oral faible

Ordonnance(s) de sortie : aucune

| Produit | Dose | Unité | Jours | Libellé jour | Précision | Voie | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| BICALUTAMIDE 50 mg cp | 50 | mg (dose fixe) | 1 | J-7 → J+21 de l'agoniste | 1 cp par jour | Per os | 4 semaines |

Cisplatine 100 mg/m² J1-J22-J43 + Radiothérapie (nasopharynx)

Branche : Tête et cou \> Nasopharynx \> Radiochimiothérapie

Cycle : 0 (sans cures répétées) ; rythme : J1, J22, J43 pendant la radiothérapie, puis PF adjuvant × 3 si prévu

Remarques : Induction GP ou TPF possible avant (\[286\], \[175\])

Seuils du jour : seuils normaux, plus : Cisplatine : DFG ≥ 60 ml/min (45-59 : réduire ou carboplatine) ; magnésémie et audition avant chaque cure

Source : Intergroup 0099 (Al-Sarraf 1998) ; risque émétique : Élevé (cisplatine)

Ordonnance(s) de sortie : « Chimio – Sortie : risque émétique élevé (cisplatine, dacarbazine) »

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1,22,43 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1,22,43 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 1000 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1,22,43 | en 1 h, avant le cisplatine | IV |  |  |
| HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 1000 ml | texte libre | 1,22,43 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |  |  |
| CISPLATINE | 100 | mg/m² | 1,22,43 | IV | NaCl 0,9 % 500 ml | 1 h |  |

Cisplatine 100 mg/m² J1-J22-J43 + Radiothérapie

Branche : Tête et cou \> VADS \> Localement avancé – radiochimiothérapie ; Tête et cou \> VADS \> Postopératoire – radiochimiothérapie (branche à créer)

Cycle : 0 (sans cures répétées) ; rythme : J1, J22, J43 pendant la radiothérapie (3 cures)

Remarques : Dose cumulée ≥ 200 mg/m² : objectif minimal / Audiogramme initial ; créatinine et magnésémie avant chaque cure

Seuils du jour : seuils normaux, plus : Cisplatine : DFG ≥ 60 ml/min (45-59 : réduire ou carboplatine) ; magnésémie et audition avant chaque cure

Source : RTOG 9501 / EORTC 22931 (postopératoire) ; RTOG 0129 ; risque émétique : Élevé (cisplatine)

Ordonnance(s) de sortie : « Chimio – Sortie : risque émétique élevé (cisplatine, dacarbazine) »

| Produit | Dose | Unité | Jours | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1,22,43 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| SOLUMEDROL (méthylprednisolone) inj. | 60 | mg (dose fixe) | 1,22,43 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |
| HYDRATATION AVANT CISPLATINE : NaCl 0,9 % | 1000 ml + KCl 1,5 g + MgSO4 2 g | texte libre | 1,22,43 | en 1 h, avant le cisplatine | IV |  |  |
| HYDRATATION APRÈS CISPLATINE : NaCl 0,9 % | 1000 ml | texte libre | 1,22,43 | en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h | IV |  |  |
| MANNITOL 10 % | 250 ml | texte libre | 1,22,43 | avec le cisplatine (facultatif) | IV |  |  |
| CISPLATINE | 100 | mg/m² | 1,22,43 | IV | NaCl 0,9 % 500 ml | 1 h |  |

Cabazitaxel 25 mg/m² / 21 j + Prednisone 10 mg/j + G-CSF

Branche : Urologie \> Prostate \> Métastatique résistant à la castration

Cycle : 21 jours ; rythme : J1, tous les 21 jours (jusqu'à 10 cycles) ; prednisone en continu

Remarques : G-CSF en prophylaxie primaire (CARD) / Diarrhée : lopéramide / Palier : 20 mg/m² (\[247\])

Seuils du jour : seuils normaux, plus : Cabazitaxel : bilirubine ≤ normale ; PNN ≥ 1,5 G/L

Source : TROPIC ; CARD ; risque émétique : Faible

Ordonnance(s) de sortie : « Chimio – Sous Nivestim : douleurs osseuses et NFS »

| Produit | Dose | Unité | Jours | Libellé jour | Précision | Voie | Soluté + volume | Durée |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj. | 5 | mg (dose fixe) | 1 | 30 min avant la perfusion | IV lente |  |  |  |
| SOLUMEDROL (méthylprednisolone) inj. | 40 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |  |
| ONSET (ondansétron) 8 mg/4 ml inj. | 8 | mg (dose fixe) | 1 | 30 min avant la chimiothérapie | IV | NaCl 0,9 % 50 ml | 15 min |  |
| CABAZITAXEL (Jevtana) | 25 | mg/m² | 1 | IV | NaCl 0,9 % 250 ml, filtre | 1 h |  |  |
| PREDNISONE 5 mg | 10 | mg (dose fixe) | 1 | J1 → continu | 5 mg matin et soir | Per os |  |  |
| NIVESTIM (filgrastim) 30 MU/0,5 ml | 1 injection SC par jour : 30 MU, 48 MU si poids \> 70 kg | texte libre | 3,4,5,6,7 | J3 → J7 : 5 injections | à domicile (infirmière), dès 24 h après la fin de la chimiothérapie | SC |  |  |

### Ordonnances de sortie

La liste de départ du dépôt compte 26 ordonnances types ; 5 concernent la chimiothérapie, et aucune n'est reliée à un protocole. Avec la règle du cabinet, ce sont elles qui portent tout ce que le patient prend chez lui : la 1re est remise avec la fiche de prescription quand elle part à la prise en charge, puis une à chaque cure. Voici la nouvelle version, à saisir dans Paramètres \> Bibliothèques \> Ordonnances types (le préfixe « Chimio – » les regroupe en tête de liste). Si le cabinet a déjà modifié les siennes, partir de sa liste.

| Nouveau nom | Ancien nom | Statut | À imprimer quand |
| :-: | :-: | :-: | :-: |
| Chimio : risque émétique élevé (cisplatine, dacarbazine) | Chimiothérapie très émétisante (cisplatine, AC…) | Modifiée et renommée | le protocole contient du cisplatine (1 jour) ou de la dacarbazine |
| Chimio : AC (anthracycline + cyclophosphamide) | – | Nouvelle | le protocole associe doxorubicine ou épirubicine et cyclophosphamide (pas de corticoïde après J1 : MASCC/ESMO 2023) |
| Chimio : carboplatine, Enhertu, Trodelvy | – | Nouvelle | carboplatine AUC ≥ 5, trastuzumab déruxtécan ou sacituzumab ; aussi le cisplatine hebdomadaire + RT |
| Chimio : cisplatine sur plusieurs jours (BEP, EP, VIP…) | – | Nouvelle | cisplatine 2 jours de suite ou plus dans la cure |
| Chimio : risque émétique modéré (oxaliplatine, irinotécan…) | Pré-chimiothérapie antiémétique | Modifiée et renommée | risque émétique modéré (MASCC/ESMO 2023 : pas de corticoïde systématique après J1 ; SOLUPRED seulement si nausées retardées à la cure précédente) |
| Chimio docétaxel (à prendre à domicile) | – | Nouvelle | le protocole contient du docétaxel ≥ 60 mg/m² : remise avec la fiche de prescription pour la C1, puis avec la cure précédente (la prise commence la veille) |
| Chimio – Prémédication pémétrexed (ALIMTA) | Prémédication pémétrexed (ALIMTA) | Modifiée | le protocole contient du pémétrexed |
| Chimio – Irinotécan : diarrhée retardée | – | Nouvelle | le protocole contient de l'irinotécan |
| Chimio – Sous Nivestim : douleurs osseuses et NFS | – | Nouvelle | le protocole contient une ligne NIVESTIM (le Nivestim lui-même est sur la fiche de prescription, pour la prise en charge avec la chimiothérapie) |
| Chimio – Capécitabine : mains-pieds et diarrhée | Syndrome pieds-mains | Modifiée et renommée | le protocole contient de la capécitabine (ou du 5-FU en continu) |
| Chimio – Anti-EGFR : peau (cétuximab, panitumumab) | Éruption acnéiforme (anti-EGFR) | Renommée | le protocole contient du cétuximab ou du panitumumab (contenu inchangé) |
| Chimio – Fièvre sous chimiothérapie : conduite à tenir | – | Nouvelle | toute chimiothérapie IV (à joindre à la 1re cure) |
| Chimio – Prémédication docétaxel prostate (à prendre à domicile) | – | Nouvelle | docétaxel dans le cancer de la prostate (RCP : corticoïde 12 h, 3 h et 1 h avant la perfusion ; la prednisone du traitement continue) |
| Chimio – Antiémétique avant une chimiothérapie orale | – | Nouvelle | une chimiothérapie orale émétisante (lomustine, procarbazine, témozolomide) est prise à domicile dans un protocole qui comporte aussi des perfusions (ex. PCV) |

A savoir que l’emend est tres chere au maroc donc c’est difficile pour les patient de le payer donc on va faire plutot avec chemoset et possibiltié emend surtout pour tres emetique

Texte exact (médicament : posologie) :

Chimio : risque émétique élevé (cisplatine, dacarbazine)

EMEND (aprépitant) 125 mg / 80 mg, boîte de 3 gélules : 1 gélule de 125 mg 1 heure avant la chimiothérapie (J1), puis 1 gélule de 80 mg le matin à J2 et à J3

SOLUPRED (prednisolone) 20 mg : 3 comprimés le matin (soit 60 mg par jour) à J2, J3 et J4

OLANZAPINE (ZYPREXA) 5 mg : 1 comprimé le soir, de J1 à J4 (somnolence : ne pas conduire)

CLOPRAME (métoclopramide) 10 mg : 1 comprimé en cas de nausées, maximum 3 comprimés par jour, pendant 5 jours au maximum

FORLAX (macrogol) 10 g : 1 sachet le matin de J1 à J5 (prévention de la constipation due aux antiémétiques)

Chimio : AC (anthracycline + cyclophosphamide)

EMEND (aprépitant) 125 mg / 80 mg, boîte de 3 gélules : 1 gélule de 125 mg 1 heure avant la chimiothérapie (J1), puis 1 gélule de 80 mg le matin à J2 et à J3

OLANZAPINE (ZYPREXA) 5 mg : 1 comprimé le soir, de J1 à J4 (somnolence : ne pas conduire)

CLOPRAME (métoclopramide) 10 mg : 1 comprimé en cas de nausées, maximum 3 comprimés par jour, pendant 5 jours au maximum

Chimio : carboplatine, Enhertu, Trodelvy

CHEMOSET (ondansétron) 8 mg : 1 comprimé matin et soir en cas de nausées, à J2 et J3 (maximum 2 comprimés par jour)

CLOPRAME (métoclopramide) 10 mg : 1 comprimé en cas de nausées, maximum 3 comprimés par jour, pendant 5 jours au maximum

Chimio : cisplatine sur plusieurs jours (BEP, EP, VIP…)

CHEMOSET (ondansétron) 8 mg : 1 comprimé matin et soir en cas de nausées, à J2 et J3 (maximum 2 comprimés par jour)

SOLUPRED (prednisolone) 20 mg : 3 comprimés le matin les 2 jours qui suivent le dernier jour de cisplatine

OLANZAPINE (ZYPREXA) 5 mg : 1 comprimé le soir, de J1 jusqu'à 2 jours après le dernier jour de cisplatine

CLOPRAME (métoclopramide) 10 mg : 1 comprimé en cas de nausées, maximum 3 comprimés par jour

Chimio : risque émétique modéré (oxaliplatine, irinotécan…)

CHEMOSET (ondansétron) 8 mg : 1 comprimé matin et soir en cas de nausées, à J2 et J3 (maximum 2 comprimés par jour)

NAUSELIUM (dompéridone) sirop : 1 cuillère-mesure 3 fois par jour, 15 minutes avant les repas, en cas de nausées

Chimio – Prémédication docétaxel (à prendre à domicile)

SOLUPRED (prednisolone) 20 mg : 3 comprimés matin et soir la veille, le jour (le soir seulement si corticoïde IV le matin) et le lendemain de la perfusion

Chimio – Prémédication pémétrexed (ALIMTA)

YOFOLVIT (acide folique) : 1 comprimé par jour, à commencer 7 jours avant la 1re cure et à poursuivre jusqu'à 3 semaines après la dernière cure

VITAMINE B12 1 000 µg, solution injectable : 1 injection intramusculaire 1 semaine avant la 1re cure, puis toutes les 9 semaines

SOLUPRED (prednisolone) 20 mg : 1 comprimé matin et soir la veille, le jour et le lendemain de chaque cure

Chimio – Irinotécan : diarrhée retardée

LOPERIUM (lopéramide) 2 mg : 2 gélules dès la 1re selle liquide, puis 1 gélule toutes les 2 heures (toutes les 4 heures la nuit), jusqu'à 12 heures sans selle liquide ; ne pas dépasser 48 heures : au-delà, appeler le service

SMECTA (diosmectite) 3 g : 1 sachet 3 fois par jour en cas de diarrhée, à 2 heures d'écart des autres médicaments

Solution de réhydratation orale : Boire au moins 2 litres par jour pendant la diarrhée ; appeler si fièvre ≥ 38,3 °C ou diarrhée avec vomissements

Chimio – Capécitabine : mains-pieds et diarrhée

CRÈME À L'URÉE 10 % : 1 application matin et soir sur la paume des mains et la plante des pieds, dès J1 et pendant tout le traitement

DEXERYL : 1 application matin et soir en couche fine

LOPERIUM (lopéramide) 2 mg : 2 gélules à la 1re selle liquide puis 1 après chaque selle liquide, maximum 8 par jour ; arrêter la capécitabine et appeler si plus de 4 selles par jour

Chimio – Fièvre sous chimiothérapie : conduite à tenir

Température : Prendre la température en cas de frissons ou de malaise ; si ≥ 38,3 °C une fois ou ≥ 38 °C pendant 1 heure : NFS en urgence et appeler la secrétaire ou le médecin

NFS + CRP : En urgence si fièvre, à apporter ou à envoyer à la secrétaire ou le médecin

Chimio – Prémédication docétaxel prostate (à prendre à domicile)

SOLUPRED (prednisolone) 20 mg : 3 comprimés la veille au soir (12 heures avant la chimiothérapie) et 3 comprimés le matin de la chimiothérapie (3 heures avant)

Chimio – Antiémétique avant une chimiothérapie orale

CHEMOSET (ondansétron) 8 mg : 1 comprimé 1 heure avant chaque prise de la chimiothérapie orale, les jours de traitement

CLOPRAME (métoclopramide) 10 mg : 1 comprimé en cas de nausées, maximum 3 comprimés par jour, pendant 5 jours au maximum

La fonction à ajouter, en quatre points :

Dans la fiche du protocole, une case « Ordonnances » a coté de valider ou reporter: les ordonnances types liées pre selectionné , préremplies d'après le risque émétique et les molécules ; le médecin la modifie à volonté.

À côté de « Valider », un bouton « Ordonnances à imprimer » : il ouvre ces ordonnances cochées; le médecin décoche, modifie ou ajoute, puis imprime. Rien n'est bloqué : valider sans imprimer reste possible.

À la création de la ligne, le même bouton imprime l'ordonnance de la C1 avec la fiche de prescription qui part à la prise en charge ; à chaque cure ensuite, l'ordonnance de la cure et la prémédication de la veille de la suivante.

Chaque ordonnance imprimée est gardée dans l'historique du patient, reliée à la consultation si elle est la, sinon sans consultation (bref rien ne change).

Le reste ne change pas : les règles de vigilance (interactions, prémédications) sont en remarques dans le protocole, et une biologie hors seuil (PNN \< 1 G/L…) prévient le médecin par « Valider quand même ? », sans motif à saisir. Le médecin garde la main et il est prévenu ; il n'y a aucun blocage ni contrôle des prémédications à ajouter.

OEDES est l'oméprazole dans l'ordonnance « Dysphagie et reflux » mais le furosémide dans le protocole \[211\] : l'un des deux est faux, à vérifier.

## Le parcours, de la décision au rendez-vous et au suivi

Le logiciel calcule bien les doses ; ce qui manque est autour : personne ne revérifie, rien ne prépare, et le suivi entre deux cures n'est pas relié à la cure.

parcours de chimiothérapie · 12 étapes · état au 12/10/2026 (code 440507b)

| Étape | Aujourd'hui | À ajouter |
| :-: | :-: | :-: |
| 1\. Décision et intention | Module RCP ; intention (curative, palliative) et rang de ligne notés | Relier la fiche RCP à la ligne prescrite ; reprendre stade, biomarqueurs (HER2, RAS, PD-L1, MMR, EGFR, ALK…) et état général (OMS, G8 après 70 ans) au moment du choix |
| 2\. Choix du protocole | 117 branches, recherche, favoris, statut validé avec version | Filtres par biomarqueur et par ligne ; risque émétique, risque de neutropénie fébrile, durée au fauteuil et source affichés |
| 3\. Calcul des doses | Surface, Calvert plafonné à 125 ml/min, mg/kg, vincristine 2 mg, % de dose, alerte au-delà de 110 % | Arrondis par flacon (dose banding) ; doses cumulées visibles à chaque cure (bléomycine, anthracyclines, oxaliplatine) ; ajustement hépatique ; paliers de réduction par protocole |
| 4\. Feu vert du jour | Bilan facultatif ; repères PNN ≥ 1,5 G/L, plaquettes ≥ 100 G/L, Hb ≥ 8 g/dL ; créatinine exigée pour le carboplatine | Seuils par protocole (hebdomadaire, gemcitabine, immunothérapie) ; bilirubine et transaminases (docétaxel), magnésémie (anti-EGFR), protéinurie et tension (anti-VEGF), TSH (immunothérapie) ; questionnaire infirmier du jour |
| 5\. Double contrôle | Le médecin valide seul | Deuxième vérification indépendante des doses, du poids et de la surface avant préparation, tracée (pharmacien ou infirmière, normes ASCO/ONS) |
| 6\. Rendez-vous | Agenda des séances J1, J8, J15 ; report motivé ; « décaler la suite » ; heure et durée notées par l'infirmière | Capacité de l'hôpital de jour (fauteuils, lits, horaires) ; durée de séance calculée depuis le protocole ; rappels SMS ou WhatsApp ; bilan programmé la veille ; évaluation planifiée tous les 2 ou 3 cycles ; alerte si l'accord de prise en charge expire avant la cure |
| 7\. Préparation | Rien | Fiche de fabrication (dose, solvant, volume, poche, stabilité, étiquette) ; lien avec la pharmacie de la clinique |
| 8\. Administration | Fiche chimio imprimée ; heure et durée de la séance | Plan de soins ordonné (prémédication 30 min avant, ordre des poches, débits, rinçages, surveillance) ; lots et péremption ; conduite à tenir en cas d'hypersensibilité ou d'extravasation |
| 9\. Sortie | Ordonnances types séparées du protocole | Ordonnances de sortie générées depuis le protocole (EMEND, antiémétiques J2-J4, corticoïde de la veille de la cure suivante, lopéramide) ; fiche patient par protocole ; numéro d'urgence |
| 10\. Suivi entre les cures | 6 toxicités CTCAE dans le formulaire de consultation | Toxicités notées par cure et par molécule (main-pied, peau, hypersensibilité, immunologiques, cœur, audition…) ; réduction proposée selon le protocole ; appel infirmier entre J+3 et J+7 |
| 11\. Évaluation et fin de ligne | Arrêt de ligne avec date et motif | Imagerie planifiée, réponse notée (RECIST), compte rendu de fin de ligne avec dose-intensité reçue |
| 12\. Facturation | Consultation de J1 facturée, J8-J15 à 0 DH par défaut, reçus | Montant par jour et par protocole ; suivi des accords de prise en charge (organisme, cures couvertes, échéance) |

Règle du cabinet : la fiche de prescription (le protocole) contient ce qui est fait au service les jours de chimiothérapie, plus le Nivestim, qui n'est pris en charge avec la chimiothérapie que s'il y figure. Ce que le patient prend chez lui (EMEND, Solupred des jours suivants, olanzapine, prémédication de la veille du docétaxel et du pémétrexed) est sur une ordonnance à part. La fiche part à la prise en charge environ une semaine avant la C1J1 : l'ordonnance de la C1 est remise en même temps, puis celle de chaque cure.

## Une bibliothèque commune à tous les médecins

Aujourd'hui, la bibliothèque commune est une copie faite à la création du cabinet ; ensuite chaque cabinet vit seul. Pas de mise à jour des cabinets existants : un cabinet déjà créé ne reçoit pas les corrections suivantes. Pour une bibliothèque commune, il faut une fonction « envoyer la mise à jour aux cabinets », qui n'existe pas encore.

| Ce qui existe | Ce qui manque |
| :-: | :-: |
| Une bibliothèque de référence par spécialité (« bib-oncologie »), créée à partir de la copie du cabinet du Dr Bentahila du 09/10, modifiable par l'administration | Un comité de relecture (deux médecins) avant toute diffusion |
| Copie à la création d'un cabinet : protocoles, ordonnances types, listes, paramètres | La diffusion des corrections aux cabinets déjà créés |
| Numéro de version et trace de validation par protocole | Un journal des changements lisible (« v4 : anti-NK1 ajouté ») |
| Les patients déjà traités gardent leur copie figée | Un export PDF (livret par localisation) et Excel de la bibliothèque |
| – | Un bouton « Signaler une erreur » qui remonte à la référence |

La fonction « envoyer la mise à jour aux cabinets », telle qu'elle devrait marcher :

L'administration publie une version de la référence (numéro, date, liste des changements).

Le serveur compare, cabinet par cabinet : protocoles nouveaux, modifiés dans la référence, modifiés par le cabinet, supprimés.

Chaque cabinet voit une notification (« 14 protocoles mis à jour »), puis un écran qui montre ligne par ligne l'ancien et le nouveau, avec trois choix par protocole : accepter, refuser, garder les deux.

Un protocole modifié par le cabinet n'est jamais écrasé sans son accord ; un protocole accepté reste « à valider » jusqu'à ce qu'un médecin du cabinet le valide.

Les cures déjà prescrites ne changent pas (copie figée, déjà en place).

Même mécanisme pour les ordonnances types et les listes ; chaque diffusion est tracée (qui, quand, quelle version, acceptée par qui).

Avant de partager : remplir la source de chaque protocole, retirer la mention eviQ, écrire les DCI, et faire valider la bibliothèque par un deuxième oncologue.

## Ce qui ferait d'Onco360 le meilleur logiciel pour un oncologue

Au-delà du parcours, ce sont les alertes, les ordonnances liées et le suivi qui distinguent un bon logiciel de chimiothérapie d'un tableau de doses.

| Domaine | À ajouter | Ce que ça évite |
| :-: | :-: | :-: |
| Ordonnances | À côté de « Valider », un bouton « Ordonnances à imprimer » : les ordonnances liées au protocole, cochées et prêtes à imprimer dès la prescription (remises avec la fiche envoyée à la prise en charge), puis à chaque cure ; le médecin modifie ce qu'il veut, rien n'est bloqué | EMEND, Solupred ou prémédication de la veille oubliés à la sortie |
| Interactions | Aprépitant et corticoïdes, AVK, contraceptifs ; TKI et IPP ou inducteurs (rifampicine, carbamazépine) ; méthotrexate et AINS, IPP, cotrimoxazole ; allongement du QT (sétrons + TKI) | Sous- ou surdosages silencieux |
| Foie | Tableau d'adaptation à la bilirubine et aux transaminases par molécule (docétaxel, paclitaxel, irinotécan, anthracyclines, TKI) | Docétaxel fait avec une bilirubine élevée |
| Doses | Cumul visible à chaque cure (anthracyclines, bléomycine, oxaliplatine, cisplatine), plafonds (actinomycine 2 mg, mitomycine 20 mg), arrondi au flacon, paliers de réduction proposés selon la toxicité | Dépassement de cumul, gaspillage de flacons |
| Biomarqueurs | Fiche moléculaire du patient (HER2, RH, PD-L1, MMR, RAS/BRAF, EGFR, ALK, ROS1, BRCA, CLDN18.2…) qui filtre les protocoles et signale les incohérences, sans bloquer | Anti-EGFR chez un RAS muté, immunothérapie hors indication |
| Avant la 1re cure | Liste à cocher : sérologies VHB/VHC/VIH, uracilémie, FEVG, audiogramme, état dentaire avant dénosumab ou zolédronate, test de grossesse, préservation de la fertilité avant 40 ans, G8 après 70 ans, consentement signé | Oublis le jour de la C1 |
| Patient | Fiche d'information par protocole (effets, conseils, numéro d'urgence) en français et en arabe ; rappel SMS ou WhatsApp à J-2 avec le bilan et la prémédication de la veille | Patient venu sans bilan ou sans corticoïde |
| Suivi | Toxicités CTCAE par cure et par molécule, appel infirmier J+3/J+7, questionnaire patient sur téléphone, courbes poids et marqueurs (CA 15-3, ACE, PSA) sur la frise des cures | Toxicité découverte trop tard, réduction oubliée |
| Fin de ligne | Réponse RECIST, dose-intensité reçue, compte rendu de fin de traitement et plan de surveillance, courrier automatique au médecin traitant | Dossiers incomplets, suivi perdu |
| Organisation | Capacité de l'hôpital de jour, liste du lendemain pour la pharmacie de la clinique (molécules, doses, flacons), suivi des accords de prise en charge (organisme, cures couvertes, échéance) | Fauteuils saturés, cure annulée faute d'accord |
| Pilotage | Statistiques : cures par mois et par protocole, taux de reports et de neutropénies fébriles, délais décision-C1, dose-intensité médiane | Décisions à l'aveugle |
| Éditeur | Option « cycles 1 à n » (pas seulement « C1 seule » ou « sauf C1 »), champs « risque émétique », « seuils », « ordonnances de sortie », « source » | Protocoles découpés en deux (CheckMate 9LA, POSEIDON) |

## Ordre de travail proposé

Les corrections de contenu peuvent commencer tout de suite, à la main dans l'éditeur ; les fonctions viennent ensuite.

Exporter la bibliothèque réelle du cabinet et refaire tourner les contrôles dessus (les scripts sont prêts), pour partir des vrais protocoles et non de la reconstitution.

Corriger les 6 protocoles critiques (partie « Prêt à copier-coller »).

Saisir les 14 ordonnances types de chimiothérapie révisées.

Appliquer le classeur dans l'ordre de sa colonne « Ordre » (1, puis 2, puis 3), en cochant « Fait » au fur et à mesure.

Créer les 11 protocoles de priorité 1, puis les 48 de priorité 2 (dont les versions hebdomadaires), en « Non validé ».

Faire relire chaque protocole par un deuxième oncologue avant de le passer en « Validé ».

Développement, dans cet ordre : champs risque émétique, seuils, « cycles 1 à n » ; bouton « Ordonnances à imprimer » à côté de « Valider » (ordonnances liées au protocole, imprimables dès la prescription) ; montant par séance pour l'hebdomadaire.

Bibliothèque commune : versions publiées, « envoyer la mise à jour aux cabinets », export PDF et Excel.

Parcours : double contrôle, plan de soins infirmier, capacité de l'hôpital de jour, toxicités par cure, suivi des prises en charge.

## Sources

Code audité : dépôt ritabentahila-alt/onco360, commit 440507b du 12/10/2026 ; bibliothèque reconstituée depuis le code de l'application d'origine ; essais rejoués sur patients fictifs.

[Herrstedt et al., 2023 MASCC and ESMO guideline update for the prevention of chemotherapy- and radiotherapy-induced nausea and vomiting, ESMO Open 2024](https://doi.org/10.1016/j.esmoop.2023.102195) (texte intégral via PubMed Central)

[Jordan et al., Emetic risk classification and evaluation of the emetogenicity of antineoplastic agents – updated MASCC/ESMO consensus, Support Care Cancer 2023](https://doi.org/10.1007/s00520-023-08220-5)

[Detlefsen et al., DANGER-emesis : NEPA hebdomadaire pendant cisplatine + radiothérapie, Support Care Cancer 2025](https://doi.org/10.1007/s00520-025-09573-9)

[RCP EMEND 125 mg (interaction avec la méthylprednisolone et la dexaméthasone)](https://www.medicines.org.uk/emc/product/8227/smpc)

[Notice VYLOY (zolbétuximab) : prémédication antiémétique et doses](https://www.drugs.com/dosage/vyloy.html)

[Notice JEVTANA (cabazitaxel) : prémédication et G-CSF](https://www.drugs.com/pro/jevtana.html)

Recommandations citées sans réouverture ce jour : ASCO 2015 sur les facteurs de croissance ([Smith, JCO 2015](https://doi.org/10.1200/JCO.2015.62.3488)), ASCO 2020 sur les antiémétiques ([Hesketh, JCO 2020](https://doi.org/10.1200/JCO.20.01296)), RCP du paclitaxel, du docétaxel, du pémétrexed, du cétuximab et de la trabéctédine.

Essais de référence : un par protocole, colonne « Source » du classeur.
