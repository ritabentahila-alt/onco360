# Digestif — Rectum

Mise à jour : 2026-10-23 · Statut de l'onglet : `valide`

## Situations cliniques

Trois situations : adénocarcinome du rectum localement avancé (traitement néoadjuvant), rectum à haut risque IRM (traitement néoadjuvant total), rectum opéré sans radiothérapie préalable. Région `digestif`, localisation `rectum`. La fiche du service oppose deux logiques : RAPIDO quand le risque métastatique domine, PRODIGE 23 quand le contrôle local domine.

**Tableau Situations**

| id | titre | contexte | criteres | ordre |
| --- | --- | --- | --- | --- |
| rec-neoadj | Rectum localement avancé : radiothérapie préopératoire | en\_place | cT3–T4 ou N+, M0, résécable ; ou résécable avec besoin de réduire le risque de récidive locale (5 × 5 Gy) | 1 |
| rec-hr-tnt | Rectum à haut risque : traitement néoadjuvant total | en\_place | Au moins un critère IRM : cT4a ou cT4b, invasion vasculaire extramurale (EMVI), cN2, fascia mésorectal envahi ou menacé, adénopathie latérale (RAPIDO) ; ou cT3–T4 M0 chez un patient de 18 à 75 ans en bon état général (PRODIGE 23) | 2 |
| rec-postop | Rectum opéré d'emblée, sans radiothérapie préopératoire | post\_op | pT3–T4 ou pN+ ; situation devenue rare : la RCT préopératoire fait mieux | 3 |

## Schémas et prescriptions

Huit schémas. Tous : statut = `valide`, date\_verif = 2026-10-23.

**Tableau Schémas**

| id | situation\_id | titre | type | preuve | essai\_ids | source\_institutionnelle |
| --- | --- | --- | --- | --- | --- | --- |
| rec-cap50 | rec-neoadj | RCT 45 Gy pelvis + boost intégré tumoral 50 Gy en 25 fx + capécitabine (CAP 50) | rte\_normo | essai\_phase3 | accord12 ; prodige23 | Fiche du service (schéma CAP 50) |
| rec-504-28 | rec-neoadj | RCT 50,4 Gy / 28 fx + 5FU ou capécitabine | rte\_normo | essai\_phase3 | cao-aro-94 ; rapido |  |
| rec-5x5-tme | rec-neoadj | 5 × 5 Gy puis chirurgie dans la semaine | rte\_hypo | essai\_phase3 | dutch-tme ; stockholm3 |  |
| rec-5x5-delai | rec-neoadj | 5 × 5 Gy puis chirurgie après 4 à 8 semaines | rte\_hypo | essai\_phase3 | stockholm3 |  |
| rec-rapido | rec-hr-tnt | 5 × 5 Gy puis CAPOX × 6 ou FOLFOX4 × 9, puis exérèse du mésorectum (RAPIDO) | rte\_hypo | essai\_phase3 | rapido | Fiche du service |
| rec-prodige23 | rec-hr-tnt | FOLFIRINOX × 6 puis RCT 50 Gy / 25 fx + capécitabine, chirurgie, chimiothérapie adjuvante (PRODIGE 23) | rte\_normo | essai\_phase3 | prodige23 | Fiche du service |
| rec-postop-558 | rec-postop | RCT post-opératoire 50,4 Gy / 28 fx + complément 5,4 Gy | rte\_normo | essai\_phase3 | cao-aro-94 |  |
| rec-cap45 | rec-neoadj | RCT 45 Gy / 25 fx + capécitabine (bras Cap 45 d'ACCORD 12) | rte\_normo | essai\_phase3 | accord12 |  |

**Tableau Prescriptions** (rattaché au schéma par `schema_id`)

| schema\_id | volume | dose\_Gy | fractions | dose\_fx\_Gy | mode | rythme | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| rec-cap50 | PTV pelvis | 45 | 25 | 1.8 | SIB | 5 fx/sem | Avec capécitabine 800 mg/m² × 2/j, 5 jours sur 7 |
| rec-cap50 | PTV boost tumoral (GTV\_T + 1 cm) | 50 | 25 | 2 | SIB | 5 fx/sem | ACCORD 12 et PRODIGE 23 délivrent 50 Gy en 25 fx ; la fiche du service le fait en boost intégré ; chirurgie 6 à 8 semaines après la RCT |
| rec-504-28 | PTV pelvis | 50.4 | 28 | 1.8 | seul | 5 fx/sem | CAO/ARO/AIO-94 : 5FU 1000 mg/m²/j en 120 h aux semaines 1 et 5, chirurgie 6 semaines après ; bras standard de RAPIDO : 50,4 Gy / 28 fx ou 50 Gy / 25 fx avec capécitabine 825 mg/m² × 2/j |
| rec-5x5-tme | PTV pelvis | 25 | 5 | 5 | seul | 5 jours consécutifs | Chirurgie dans la semaine qui suit |
| rec-5x5-delai | PTV pelvis | 25 | 5 | 5 | seul | 5 jours consécutifs | Chirurgie 4 à 8 semaines après |
| rec-rapido | PTV pelvis | 25 | 5 | 5 | seul | En 8 jours au plus | Sans chimiothérapie concomitante ; chimiothérapie de consolidation 1 à 2 semaines après (fiche) |
| rec-prodige23 | PTV pelvis | 45 | 25 | 1.8 | SIB | 5 fx/sem | Après FOLFIRINOX × 6 ; capécitabine 800 mg/m² × 2/j, 5 jours sur 7 |
| rec-prodige23 | PTV boost tumoral (GTV\_T + 1 cm) | 50 | 25 | 2 | SIB | 5 fx/sem | PRODIGE 23 : 50 Gy en 5 semaines ; boost intégré selon la fiche du service |
| rec-postop-558 | PTV pelvis | 50.4 | 28 | 1.8 | sequentiel | 5 fx/sem | Avec 5FU (CAO/ARO/AIO-94) |
| rec-postop-558 | PTV complément (lit tumoral) | 5.4 | 3 | 1.8 | sequentiel | 5 fx/sem | Total 55,8 Gy |
| rec-cap45 | PTV pelvis | 45 | 25 | 1.8 | seul | 5 fx/sem | Capécitabine 800 mg/m² × 2/j, 5 jours sur 7 |

**Tableau Schémas — liens** (même `id` que le tableau Schémas)

| id | technique | systemique | simulation\_id | volumes\_id | contraintes\_id | couverture |
| --- | --- | --- | --- | --- | --- | --- |
| rec-cap50 | IMRT ou VMAT, IGRT quotidienne | Capécitabine 800 mg/m² × 2/j les jours de RT | sim-rec | vol-rec | ct-quantec-grele |  |
| rec-504-28 | IMRT, VMAT ou RC3D, IGRT | 5FU continu ou capécitabine | sim-rec | vol-rec |  |  |
| rec-5x5-tme | IMRT ou VMAT, IGRT | Aucune | sim-rec | vol-rec |  |  |
| rec-5x5-delai | IMRT ou VMAT, IGRT | Aucune | sim-rec | vol-rec |  | Comme rec-5x5-tme |
| rec-rapido | IMRT ou VMAT, IGRT | CAPOX × 6 ou FOLFOX4 × 9 après la RT | sim-rec | vol-rec |  | Comme rec-5x5-tme |
| rec-prodige23 | IMRT ou VMAT, IGRT quotidienne | FOLFIRINOX × 6 avant ; capécitabine pendant ; 3 mois après la chirurgie | sim-rec | vol-rec | ct-quantec-grele | Comme rec-cap50 |
| rec-postop-558 | IMRT ou RC3D | 5FU | sim-rec | vol-rec |  |  |
| rec-cap45 | IMRT ou VMAT, IGRT | Capécitabine | sim-rec | vol-rec |  |  |

Pas de jeu de contraintes publié propre au rectum dans nos sources : les schémas en fractionnement classique sont liés au jeu QUANTEC grêle ; les schémas 5 × 5 Gy n'ont pas de jeu publié.

## Curiethérapie

Pas de curiethérapie rectale dans le référentiel. Afficher « Pas de curiethérapie pour cette localisation » dans l'onglet Curiethérapie.

## Centrage

**Tableau Simulation**

| id | position | contention | preparation | scanner | imagerie | reperes |
| --- | --- | --- | --- | --- | --- | --- |
| sim-rec | Décubitus dorsal | Immobilisation pelvienne standard | Vessie mi-pleine (reproductibilité) ; rectum le plus vide possible, sans lavement traumatique | Injecté (repérage vasculaire, limites mésorectales) | IRM pelvienne pré-thérapeutique T2 sagittale et axiale oblique dans l'axe du rectum : fusion obligatoire ; TEP-TDM si disponible | Repère plombé sur la marge anale (impératif) |

## Contourage

**Tableau Volumes**

| volumes\_id | nom | type | definition | quand | marge |
| --- | --- | --- | --- | --- | --- |
| vol-rec | GTV\_T | GTV | Tumeur primitive : IRM pré-thérapeutique (référence), toucher rectal, endoscopie ; tout le rectum sur la hauteur de l'atteinte ; ne pas extrapoler au-delà de l'atteinte visible | Toujours |  |
| vol-rec | GTV\_N# | GTV | Adénopathie (IRM : taille, morphologie ; ± TEP), une structure par ganglion | Si adénopathie |  |
| vol-rec | CTV\_T | CTV | GTV\_T + mésorectum en totalité. Arrière : face antérieure du sacrum. Avant : prostate et vésicules séminales, ou utérus et vagin, puis face postérieure de la vessie. Latéral : releveurs en bas, paroi pelvienne en haut. Bas : résection antérieure prévue et tumeur du tiers moyen (bord inférieur > 2 cm de la ligne pectinée) → jonction ano-rectale ; tiers inférieur ≤ 1 cm des releveurs → tout le canal anal ; > 1 cm → moitié supérieure du canal anal (releveurs, canal anal et sphincters inclus) ; amputation abdomino-périnéale prévue → fosses ischio-rectales entières jusqu'à la marge anale | Toujours |  |
| vol-rec | CTV\_N | CTV | Présacrés, iliaques internes, obturateurs ; iliaques externes si extension antérieure ou adénopathie latérale ; iliaques communes non systématiques. Limite supérieure : bifurcation de l'artère rectale supérieure (injection de qualité) sinon interligne S2–S3 ; en général 3 à 5 cm au-dessus du GTV, jamais moins de 2 cm ; hors N+ massif, pas jusqu'au promontoire | Toujours |  |
| vol-rec | PTV pelvis | PTV | CTV\_T + CTV\_N + 5 mm | Toujours | 5 mm |
| vol-rec | PTV boost tumoral | PTV | GTV\_T + 1 cm (mésorectum adjacent inclus), en respectant canal anal et vessie | CAP 50, PRODIGE 23 | 1 cm |

**Tableau Volumes — OAR et atlas**

| volumes\_id | oar\_ids | atlas |
| --- | --- | --- |
| vol-rec | oar-vessie ; oar-canal-anal ; oar-grele (fiche : cavité abdominale antérieure jusqu'à 1 cm au-dessus du PTV) ; oar-tete-femorale-d ; oar-tete-femorale-g ; oar-queue-cheval ; oar-sigmoide ; oar-oge ; oar-moelle-osseuse | Valentini 2016 (consensus international) ; RTOG 2009, CTV ano-rectaux ; RTOG 2012, OAR du pelvis |

## Traitement systémique associé

**Tableau Traitement systémique**

| situation | traitement | essai\_ids | note |
| --- | --- | --- | --- |
| RCT longue | Capécitabine 800 mg/m² × 2/j, 5 jours sur 7 pendant la RT | accord12 ; prodige23 | Pas d'oxaliplatine concomitant : plus de toxicité G3–4 (25 % vs 1 %) sans gain de réponse (ACCORD 12) |
| RCT longue (CAO/ARO/AIO-94) | 5FU 1000 mg/m²/j en perfusion de 120 h aux semaines 1 et 5, puis 4 cycles de 5FU 500 mg/m²/j × 5 un mois après la chirurgie | cao-aro-94 | Récidive locale à 5 ans 6 % (préopératoire) vs 13 % (post-opératoire), toxicité moindre |
| RAPIDO | Après 5 × 5 Gy : CAPOX × 6 (capécitabine 1000 mg/m² × 2/j J1–J14 + oxaliplatine 130 mg/m² J1, toutes les 3 semaines) ou FOLFOX4 × 9 (toutes les 2 semaines), puis chirurgie ; pas de chimiothérapie adjuvante | rapido | Échec lié à la maladie à 3 ans 23,7 % vs 30,4 % (HR 0,75) |
| PRODIGE 23 | FOLFIRINOX × 6 (oxaliplatine 85, irinotécan 180, acide folinique 400, 5FU 2400 mg/m² en 46 h, toutes les 2 semaines), puis RCT capécitabine, chirurgie, puis 3 mois de mFOLFOX6 ou de capécitabine | prodige23 | Survie sans maladie à 3 ans 76 % vs 69 % (HR 0,69) |
| 5 × 5 Gy suivi de chirurgie | Aucun | dutch-tme ; stockholm3 |  |

## Points d'attention

**Tableau Points d'attention**

| cible | point |
| --- | --- |
| rectum | Fusion IRM–scanner indispensable ; vérifier que le mésorectum est entier dans le CTV et que la limite supérieure n'est pas inutilement haute |
| rectum | Adapter la limite inférieure à la distance de la ligne pectinée et à la chirurgie prévue ; prudence sur le canal anal et les fosses ischio-anales (toxicité) |
| rec-hr-tnt | Choix (fiche du service) : RAPIDO si le risque métastatique domine (CRM < 1 mm, T4, N2, EMVI+) ; PRODIGE 23 si le contrôle local domine (tumeur basse ou volumineuse, besoin de boost, préservation sphinctérienne, patient jeune en bon état général) |
| rec-prodige23 | La fiche du service indique « FOLFOX ou CAPOX » en adjuvant ; PRODIGE 23 donnait mFOLFOX6 ou capécitabine pendant 3 mois (écart E35) |
| rec-5x5-delai | Stockholm III : récidive locale non inférieure avec le délai ; moins de complications post-opératoires ; toxicité radio-induite aiguë 7 % avec délai contre < 1 % sans délai |
| rec-5x5-tme | Dutch TME : récidive locale à 2 ans 2,4 % vs 8,2 % sans RT, sans gain de survie |
| rec-rapido | Diarrhée G3+ pendant le traitement préopératoire 18 % (vs 9 % dans le bras standard) |
