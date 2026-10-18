# Onco360 – feuille de route (plan refait le 13/10/2026)

**Un seul plan** : ce fichier. En haut, **ce qui reste à faire** (nouveau plan, d'après l'audit n° 3 et tout ce qui restait
ouvert) ; en bas, **tout ce qui est fait**, gardé tel quel. Version précédente entière : `archives/FEUILLE-DE-ROUTE-jusqu-au-2026-10-13.md`
(avant : `archives/FEUILLE-DE-ROUTE-jusqu-au-2026-10-11.md`). Journal des sessions : `JOURNAL.md`.

Sources : les trois audits du dossier Drive « Audit » : « Audit pour vendre » (10/10), « Audit numéro 2 » (11/10) et
**« Audit n° 3 – Chimiothérapie et bibliothèque de protocoles » (12/10)** avec son classeur **« Protocoles-chimio-Onco360-a-faire.xlsx »**
(un protocole par ligne : 316 existants + 123 à créer ; copie dans `archives/audit-3/`, avec le texte de l'audit et les annotations de
Dr Bentahila).

## Comment on travaille
- **Une étape = une session**, dans l'ordre. Au début : lire ce fichier ; à la fin : cocher, noter les décisions, une ligne dans `JOURNAL.md`.
- Plusieurs sessions en parallèle : chacune annonce son étape ici (« en cours : session X ») et n'écrit que ses fichiers.
- Avant toute mise en ligne : `bash outils/avant-mise-en-ligne.sh --navigateur` (+ `--regles` si les règles changent), téléphone
  390 px sans débordement, accord de Dr Bentahila ; mise en ligne depuis une copie propre du dernier enregistrement.
- Un bug signalé = un test qui le reproduit (Q1) ; check-list d'impact à chaque nouvelle notion (Q4) ; une seule source par notion (Q5) ;
  après chaque mise en ligne, 3 vérifications pour Dr Bentahila (« ouvrez X, cliquez Y, vous devez voir Z ») (Q9).
- Code enregistré et poussé sur GitHub à la fin de chaque étape testée. Ce qui arrive en cours de route va dans « À placer ».

## Règles à ne pas changer
- Honoraires de séance de chimio : tarif des Paramètres, 500 DH brut par jour validé (J1 et J8 = 2 × 500 DH), sans saisie manuelle.
- Le bilan doit rester identique au dirham près (sauf correction voulue, annoncée). Bilan figé (352 317 DH) vérifié seulement si
  `bilan.js` ou les calculs changent.
- Aucune donnée réelle de patient dans le code, le site, les tests ou GitHub.
- Une dose affichée pour un acte validé ne change plus jamais après coup ; une cure validée est verrouillée (2.2, 2.2 bis).
- **Les lignes déjà prescrites gardent leur copie du protocole** : corriger, fusionner ou supprimer un protocole de la bibliothèque ne
  change aucune cure en cours ni passée.
- **Rien n'est bloquant en chimiothérapie** (sauf une dose impossible à calculer) : seuils, vigilances, ordonnances = fenêtre « Valider
  quand même ? », sans motif à saisir ; pas de contrôle automatique des prémédications.

---

## Décisions de Dr Bentahila du 13/10/2026 (annotations de l'audit n° 3)
- **EMEND trop cher pour les patients** : remplacé par **CHEMOSET (ondansétron)** dans les ordonnances « Chimio : carboplatine, Enhertu,
  Trodelvy » et « Chimio : cisplatine sur plusieurs jours » ; EMEND gardé surtout pour le très émétisant (cisplatine sur 1 jour, AC).
  Conséquence sur le Solumedrol de J1 : voir les réponses du 13/10 (1).
- **Titres des ordonnances types** : jamais « Sortie » dans le titre (« Chimio : … ») ; les vrais titres sont ceux du détail de l'audit.
- **Fiche de prescription (le protocole)** = ce qui est fait au service les jours de chimio (chimio, prémédication injectable,
  hydratation), le retrait du diffuseur et le **NIVESTIM** (pris en charge seulement s'il y figure) ; ce que le patient prend chez lui
  (EMEND, SOLUPRED, olanzapine, acide folique, B12, lopéramide) = **ordonnance à part**, remise avec la fiche envoyée à la prise en
  charge (environ une semaine avant C1J1), puis à chaque cure.
- **NIVESTIM structuré dans le protocole** : 30 ou 48 MU **choisi en voyant le poids du patient**, de quel J à quel J, combien
  d'injections selon la chimio ; prophylaxie systématique retirée des 11 FOLFOX / FOLFIRI.
- **Ordonnances liées au protocole** : un bouton « Ordonnances » à côté de « Valider » / « Reporter », ordonnances pré-cochées d'après le
  risque émétique et les molécules, modifiables ; aussi dès la prescription (C1) ; gardées dans l'historique (consultation du jour si elle
  existe, sinon comme aujourd'hui) : rien d'autre ne change.
- **Seuils particuliers du jour** : valeurs facultatives saisies par le médecin ; hors seuil → la fenêtre d'avertissement qui existe déjà.
  Tant que l'éditeur n'a pas de case « Seuils », ils vont dans les remarques / vigilances.
- **Pas de relecture par un deuxième oncologue avant de valider** (pas le temps) : protocoles « Validé » sans mention (réponses, 2).
- **Retirer toute mention d'eviQ et de « HGC »** ; source d'origine (essai, publication) à la place.

## Décisions de Dr Bentahila du 11/10/2026 (réponses aux audits 1 et 2, toujours valables)
- Ancienne application retirée et supprimée ; tous les dossiers doivent rester récupérables hors de Firebase (export complet : fait).
- Cures déjà validées figées une fois (fait). Seuils de saisie (poids, taille, surface, créatinine, clairance, écart de poids > 10 %) :
  confirmation ; dose vide = validation refusée (fait). Bilan sanguin avant une cure : simple rappel, jamais bloquant.
- Mise en forme automatique du code : au dossier de cession (7.2). **Pas de déconnexion automatique, jamais. Pas de double authentification.**
- Google Agenda inchangé (nom du patient affiché). Administration : garde son accès aux profils des autres cabinets et la création de cabinets.
- « Supprimer le patient » reste une suppression. Allergie : bandeau rouge seulement si « oui ». Notes de la secrétaire dans le journal des
  consultations. Documents déposés : tout en PDF. Médecine générale gardée, Gynécologie gelée.
- Radiothérapie : Onco360 ne remplace pas ARIA ; confirmation > 22 Gy par fraction ou > 80 Gy ; pas d'organes à risque ni de journal des séances.
- Formulaires de consultation proposés, décochables ; note signée sans verrou (« modifiée le … »).

## Décisions de Dr Bentahila du 13/10/2026 (après la mise en ligne de P1a)
- **Pas de fenêtre** pour les corrections de l'audit : elle fait confiance, les modifications sont faites directement (notées au journal).
- **La bibliothèque de son cabinet est la référence** (aucun autre médecin n'a de compte). Le 18/10 : on corrige tout dans son
  cabinet, puis on recopie une fois sa bibliothèque dans la référence que reçoivent les nouveaux cabinets (étape P11).

## Réponses de Dr Bentahila du 13/10/2026 (questions de l'audit n° 3)
1. **Solumedrol de J1** : **80 mg** pour carboplatine / Enhertu / Trodelvy et le cisplatine hebdomadaire + RT (pas d'EMEND, pas de baisse) ;
   **50 mg par jour** pour le cisplatine sur plusieurs jours ; **60 mg** seulement pour le cisplatine sur 1 jour et l'AC (EMEND gardé).
   S'applique aux 12 protocoles existants que le classeur baissait à 60 mg ([108], [150], [152], [160], [183], [187], [193], [198], [199],
   [288], [303], [310] : ils gardent 80 mg) et aux 12 protocoles à créer avec carboplatine (80 mg au lieu de 60). Pas de case « EMEND
   prescrit » (non demandée).
2. **Statut** : les protocoles corrigés restent « Validé », **sans aucune mention** (trace habituelle seulement : version, auteur, date).
   Protocoles créés : « Validé » eux aussi, sans mention (compris ainsi ; à corriger si Dr Bentahila voulait autre chose).
3. **Créer** les priorités 2 et 3 maintenant (59 protocoles, dont les versions hebdomadaires) ; priorité 4 (64) plus tard.
4. **Appliquer** à son cabinet d'abord, puis à la bibliothèque de référence d'oncologie.
5. **NIVESTIM** : 30 MU jusqu'à 70 kg, 48 MU au-dessus, proposé d'après le poids de la séance, modifiable.
6. **« HGC »** retiré des noms, « variante locale, dérivée de … » dans la source. Protocoles sans essai de référence ([4], [124], [59], [251],
   indication de [238]) : **gardés tels quels, sans aucune mention** (surtout pas « hors référentiel »).
7. **Consultation de J8 / J15** : pas de prix ; la fenêtre de prix reste pré-remplie à 0 DH (comme aujourd'hui).
8. **OEDES = oméprazole** : c'est donc le protocole [211] qui se trompe (furosémide) → nom du furosémide corrigé dans [211]. « Bicarbonate
   14 ‰ 500 mg » de [211] = **500 ml**.
9. **Double contrôle avant préparation** : personne ne le ferait → **non retenu**.
10. « Je soussignée » : réglé (Mon compte › « Accord dans les documents », un choix par médecin ; sans choix, le texte des modèles reste
    tel quel, « Je soussignée » pour Dr Bentahila).
11. **3.17 WhatsApp envoyé tout seul** et **3.18 impression au bon format** : **annulés**.

## Questions en attente (Claude les rappelle en début de session)
1. Mesurer la hauteur des en-têtes du papier (ordonnance A5, A4, documents) pour régler les marges (Paramètres › Impression).
2. GitHub : demander la purge des copies en cache ; regarder Insights › Traffic › « Git clones » (copies du dépôt quand il était public).

---

# LE PLAN (ce qui reste, dans l'ordre)

| Phase | But | Étapes |
|---|---|---|
| **P** Protocoles de chimiothérapie | Bibliothèque juste et complète, ordonnances liées, hebdomadaire, bibliothèque commune (audit n° 3) | P0 à P11 |
| **Q** Qualité | Jeu de test fictif, contrôles automatiques, erreurs en ligne | Q-a à Q-f |
| **M** Métier restant | Infirmière, dossier stable | 3.8, 4.4 |
| **D** Design | Toucher, contraste, fenêtres Onco360 | 4.1, 4.2 |
| **E** Code et exploitation | Code propre, montée en charge, recette, hors ligne | 5.1 à 5.6 |
| **C** Conformité et vente | Juriste, dispositif médical, société, test d'intrusion | 0.5, 6.1 à 6.6 |
| **V** Cession | Dossier de cession, guides, démonstration | 7.1 à 7.4 |

La phase P passe avant tout le reste (6 protocoles peuvent produire une prescription fausse aujourd'hui). La phase C (juriste) se lance
en parallèle : ses délais ne dépendent pas du code.

**Ce que dit l'audit n° 3, en bref** : les doses des molécules sont justes dans l'immense majorité des 316 protocoles ; ce qui est en
retard, c'est autour : antiémétiques, prémédications, hydratation, G-CSF. Classeur : **113 à garder, 184 à ajuster** (la chimio est juste,
on corrige les à-côtés), **9 à modifier** (la chimio elle-même change), **10 à supprimer** (doublons, sans référence), **123 à créer**.
Problèmes qui se répètent (à corriger par blocs, pas 316 fois à la main) : mention eviQ (73), anti-NK1 / olanzapine absents (85),
hydratation du cisplatine en remarque seulement (57), G-CSF en texte sans dose ni durée (65), phase retardée du cisplatine non couverte
(50), paclitaxel sans anti-H1 (27), surprophylaxie d'un schéma à faible risque (21), « SOLUMEDROL » sans DCI (191), source vide (316).
Les 4 essais de l'audit 2 passent ; deux défauts restent (P0).

## Phase P – Protocoles de chimiothérapie (audit n° 3)

**Principe** : Dr Bentahila n'a pas le temps de saisir 439 lignes à la main. Claude transforme le classeur en corrections structurées,
et Onco360 les montre **protocole par protocole, avant / après**, à appliquer d'un clic. Le même écran servira ensuite à envoyer les mises
à jour de la bibliothèque aux autres cabinets (P9).

**Cette semaine (forfait presque épuisé, décidé le 13/10)** : on fait **seulement ce qui est dangereux ou attendu à chaque cure**, sans
l'écran P1 (repoussé à la semaine suivante) : (1) **P0 réduit** : correspondance classeur ↔ vraie bibliothèque pour les 16 protocoles
concernés + les 2 défauts de l'audit 2 ; (2) **les 6 protocoles critiques corrigés et les 10 suppressions**, appliqués une seule fois au
démarrage par un médecin (comme `marquerProtocoles`), avec une fenêtre récapitulative ; (3) **P2 : les 14 ordonnances types**. Le reste de P
(écran, ordres 2-3, création, bouton Ordonnances) reprend ensuite dans l'ordre.

- [ ] **P0 Préparer, sans rien changer en ligne** : (1) lire la **vraie bibliothèque** du cabinet et la bibliothèque de référence
      (lecture seule) et faire correspondre les 316 lignes du classeur aux protocoles réels (l'audit a travaillé sur une bibliothèque
      reconstituée) : rapport « trouvés / introuvables / modifiés par Dr Bentahila depuis » ; (2) **classeur → fichier de corrections**
      (`outils/audit3/corrections.json` : ajouter / modifier / retirer une ligne, remarque, indication, nom, source ; ordre 1-2-3) et
      contrôle automatique : aucune dose de chimio changée hors des 9 « À modifier » ; (3) **deux défauts restants de l'audit 2** :
      fenêtre « carboplatine contre-indiqué » affichée deux fois (créatinine 70 mg/L) ; créatinine aberrante (0,7 mg/L) signalée à la
      validation mais pas à la saisie. Tests d'abord (Q1).
- [x] **P1a Ordre 1 appliqué sans l'écran** (13/10/2026, testé, **en ligne : 20261013a** ; accord de Dr Bentahila sur les favoris retirés et le Solumedrol 80 mg du paclitaxel-carboplatine hebdo) : `public/js/moteur/audit3.js` (calcul pur, d'après la
      **vraie bibliothèque** du 13/10, qui diffère de celle de l'audit : BEP déjà à 30 000 UI en texte, MAP déjà avec un sauvetage chiffré,
      « HGC » déjà retiré des noms) + `appliquerAudit3` (protocoles.js), une fois par bibliothèque à l'ouverture par un médecin
      (`parametres/migrations.audit3a` ; son cabinet, puis la bibliothèque de référence quand l'Administration l'ouvre), fenêtre récapitulative.
      **Corrigés** : [89] renommé « Paclitaxel 90 J1-J8-J15 / 28 j + Pembrolizumab 200 / 21 j », cycle 84 j, POLARAMINE ; [197] hydratation +
      protocole lié **« PORTEC-3 – phase 2 : Carboplatine AUC 5 + Paclitaxel 175 / 21 j × 4 »** créé (Solumedrol 80 mg) ; [253] bléomycine
      30 mg (30 000 UI) en dose fixe, Solumedrol 50 mg/j, hydratation 500 ml, NIVESTIM J7 → J11 ; [273] ONSET + Solumedrol 60 mg, hydratation,
      rangé aussi en CBPC ; [14] Solumedrol 50 mg J1-J3, hydratation 500 ml ; [217] Solumedrol 50 mg/j, hydratation, hyperhydratation
      alcaline J22 / J29 (seuil 0,1 µmol/L, celui du sauvetage déjà écrit), NIVESTIM J4 → J8. **Supprimés** (indications, remarques et
      étoile reprises par le protocole gardé) : les 7 doublons et paliers + JACOB, carboplatine-bévacizumab (sein), ribociclib seul.
      Chaque correction n'est faite que si le protocole est encore tel qu'avant (rien deux fois). Lignes NIVESTIM : jamais un jour de
      séance (`nd`) ; le choix 30 / 48 MU d'après le poids viendra en P3. Aucun patient n'avait de ligne sur ces 16 protocoles (et chaque
      ligne garde sa copie). Tests : `tests/moteur/test-audit3.mjs` 42/42 (dans `avant-mise-en-ligne.sh`), `tests/test_audit3.py` 13/13,
      `test_protocoles_trace` 10/10.
- [ ] **P1 Écran « Corrections proposées »** (l'ordre 1 est fait en P1a) : Protocoles › « Corrections proposées » (médecin) : liste des protocoles touchés,
      ligne par ligne (ajouté en vert, retiré en rouge, changé en orange), Appliquer / Ignorer / Garder les deux, « tout appliquer » par
      ordre ; chaque application dans la transaction de 2.4 (version +1, auteur, « audit n° 3 »), version précédente gardée (annuler).
      (Fait en P1a :) **ordre 1** : les **6 critiques** — [89] KEYNOTE-355 (cycle 84 j, paclitaxel J1-J8-J15 / 28 j, pembrolizumab / 21 j),
      [197] PORTEC-3 (+ protocole lié « phase 2 » carboplatine AUC 5 + paclitaxel 175 × 4), [253] BEP (bléomycine 30 000 UI J1-J8-J15
      chiffrée), [273] EP (antiémétiques, hydratation, rangé aussi en CBPC), [14] pémétrexed-cisplatine (corticoïde, hydratation), [217]
      MAP (sauvetage folinique chiffré, hyperhydratation alcaline) — et les **10 suppressions** (indications d'abord reportées dans le
      protocole gardé : [117]→[260], [300]→[82], [306]→[101], [34]→[35], [27]→[24], [41] et [39]→[40] ; [125] JACOB négatif ; [28] sans
      référence ; [38] ribociclib seul).
- [x] **P2 Ordonnances types de chimiothérapie** (13/10/2026, testé, en ligne : 20261013b) : `ORDOS_AUDIT3` / `appliquerOrdosAudit3`
      (donnees/ordostypes.js), une fois dans la liste du cabinet (`ordosAudit3` d'ordonnances.js, `parametres/migrations.audit3b`) et dans la
      liste de départ : 5 renommées (« Chimiothérapie très émétisante » → « Chimio : risque émétique élevé (cisplatine, dacarbazine) »,
      « Pré-chimiothérapie antiémétique » → « … modéré (oxaliplatine, irinotécan…) », pémétrexed, capécitabine, anti-EGFR (contenu gardé))
      et 9 ajoutées ; texte de l'audit revu par Dr Bentahila (CHEMOSET dans carboplatine / Enhertu / Trodelvy et cisplatine sur plusieurs
      jours). « Sous Nivestim : douleurs osseuses et NFS » : texte non donné par l'audit, écrit par Claude (paracétamol 1 g ; NFS avant la
      cure suivante) → à relire par Dr Bentahila. OEDES = oméprazole : rien à changer dans « Dysphagie et reflux ». Plus de fenêtre
      récapitulative pour l'audit n° 3 (décision du 13/10). Test : `tests/test_audit3.py` 17/17.
- [ ] ~~P2 (plan)~~ **Ordonnances types de chimiothérapie** : les 14 de l'audit (titres « Chimio : … » sans « Sortie »), texte exact de l'audit,
      CHEMOSET à la place d'EMEND dans les deux ordonnances décidées ; 5 existantes modifiées / renommées, 9 nouvelles
      (dont « Fièvre sous chimiothérapie : conduite à tenir », « Prémédication docétaxel prostate », « Antiémétique avant une
      chimiothérapie orale ») ; dans son cabinet, la bibliothèque de référence et la liste de départ (`donnees/ordostypes.js`) ; OEDES
      (oméprazole) : bon dans l'ordonnance « Dysphagie et reflux ».
- [x] **Palier 3** (18/10/2026, testé, en ligne : 20261018a) : [211] « AI 3 jours » : « OEDES (furosémide) » → « FUROSÉMIDE (Lasilix) »
      (OEDES = oméprazole), « BICARBONATE 14 ‰ 500 mg » → « BICARBONATE DE SODIUM 14 ‰ », 500 ml (texte) ; **« HGC » retiré des remarques**
      des 16 protocoles qui en avaient (« protocole HGC conservé » → « protocole local conservé », « Protocole HGC (fractionné) » →
      « Variante locale (fractionnée) », « votre fiche HGC » → « votre fiche ») ; ordonnance **« Chimiothérapie antiémétique »** (ancienne
      « Pré-chimiothérapie antiémétique » renommée par Dr Bentahila, restée à côté de la nouvelle) **retirée**, son étoile reportée sur
      « Chimio : risque émétique modéré ». Drapeaux `audit3c` (protocoles) et `audit3d` (ordonnances) : le calcul de l'audit est relancé
      une fois, ce qui est déjà fait n'est pas refait. Tests : test-audit3 48/48, test_audit3 17/17.
- [x] **P3 Éditeur de protocole et calculs (partie faite le 18/10/2026, testé, en ligne : 20261018b)** : moteur `public/js/moteur/seuils.js` :
      **risque émétique** calculé (MASCC/ESMO 2023 : molécule la plus émétisante, AC = élevé, carboplatine AUC ≥ 5 / Enhertu / Trodelvy =
      modéré haut, tout per os = oral) ou choisi par le médecin (`re`) ; **seuils du jour** : séances hebdomadaires (J8, J15… ou cycle de
      7 jours) PNN ≥ 1,0 et plaquettes ≥ 75 G/L (`alertesBio(b, { hebdo })`), gemcitabine J8 / J15 (75 % / non faite), trabectédine, docétaxel
      (transaminases + PAL), cabazitaxel ; **PAL et CPK** dans le bilan du jour ; **cumuls** bléomycine (en mg, seuil 400 mg = 400 000 UI)
      et cisplatine (300 mg/m²) ; **NIVESTIM 30 / 48 MU** proposé d'après le poids (`texteNiv`, séance et fiche) ; option **« C1→n »**
      (`cmax`, cures 1 à n) ; paracétamol et mannitol comptés comme prémédication. Éditeur : risque émétique, **ordonnances liées**,
      **seuils du jour** (champs `re`, `ordos`, `seuils`) ; encart « Vigilance » de la séance : risque, ordonnances liées, seuils du
      protocole. **Pas fait** : protocole lié comme champ (les phases suivantes sont des protocoles à part, cités dans les remarques) ;
      case « EMEND prescrit » (non retenue). Tests : `test-seuils.mjs` 22/22, test-vigilance 60/60, test-doses 79/79.
- [x] **P4 Ordres 2 et 3 appliqués (18/10/2026, testé ; en ligne : 20261018b)** : `outils/audit3/convertir-p4.mjs` lit le classeur
      (`archives/audit-3/`) → `public/js/donnees/audit3p4.js` (248 protocoles, 398 consignes : ajouter / retirer une ligne, NIVESTIM,
      Solumedrol, remarques, noms, indications, localisation) ; `moteur/audit3p4.js` les vérifie sur chaque protocole réel et les applique
      une fois à l'ouverture par un médecin (`appliquerP4`, drapeau `audit3e`, sans fenêtre). Solumedrol baissé seulement avec une
      ordonnance EMEND (élevé, AC) ; jamais « Hors référentiel » ; remarques « Ordonnance de sortie … » remplacées par le champ
      « Ordonnances liées » ; créés : **« mFOLFIRINOX rectum J1-J15 / 28 j × 6 (PRODIGE 23) »** (irinotécan 180, l'original n'est plus
      rangé en rectum) et **« KEYNOTE-A18 – phase 2 : Pembrolizumab 400 mg / 6 semaines × 15 »**. Essai sur la vraie bibliothèque du 18/10 :
      aucune dose ni aucun jour de séance d'anticancéreux changé ; consignes laissées de côté = déjà faites (indications reprises en P1a,
      Solumedrol J2 / J16 absent du TPF modifié). PRODIGE 5 (FOLFOX + RT) garde son NIVESTIM (le classeur n'en parle pas). Tests :
      `test-audit3p4.mjs` 24/24 (vraie bibliothèque, `tests/moteur/donnees/bibliotheque-2026-10-18.json`), `test_audit3.py` 22/22.
- [x] **Demandes du 18/10/2026 (testé ; version 20261018d)** : **fiche de chimiothérapie** (va à l'administration et aux mutuelles) :
      plus de « Remarques » (le rythme reste dans « Observations »), plus de n° de dossier (celui de l'hôpital est différent), NIVESTIM
      « 30 MU » ou « 48 MU » sans le détail du poids (`texteNiv(…, true)`, colonnes Posologie et Dose) ; **acide folinique** : vérifié sur
      les sources (400 mg/m² FOLFOX / FOLFIRI, 200 mg/m² FLOT / FOLFOXIRI / FOLFOX4, 50 mg eviQ = folinate de calcium racémique ;
      lévofolinate à moitié dose) → nommé « ACIDE FOLINIQUE racémique (folinate de calcium) » ; **Solumedrol en mg/kg** → dose fixe selon
      la règle du 13/10 : EC 60 mg, CAP fractionné 50 mg/j (`correctionsP5b`, une fois, `audit3g`) ; **Vigilance des molécules**
      (Paramètres) : seuils de l'audit ajoutés à 12 familles et 4 familles nouvelles (trabectédine, topotécan, trastuzumab déruxtécan,
      enfortumab), dans la liste de départ et une fois dans la liste du cabinet, ses notes gardées (`vigilancesAudit3`, `audit3f`).
      Tests : test-audit3p4 40/40, test-seuils 24/24, test_cures, test_vigilance, test_audit3.
- [ ] ~~P3 (plan)~~ **Éditeur de protocole et calculs** (avant d'appliquer le reste, pour que tout aille dans les bonnes cases) : champs
      **Risque émétique** (proposé d'après la molécule la plus émétisante, AC = élevé, MASCC/ESMO 2023 ; modifiable), **Ordonnances liées**
      (choisies dans la bibliothèque, proposées d'après le risque et les molécules), **Seuils du jour** (valeurs par protocole reprises dans
      la fenêtre de validation existante), **option « cycles 1 à n »** (en plus de « C1 seule » / « sauf C1 » : CheckMate 9LA, POSEIDON),
      **protocole lié** (phase suivante, ex. PORTEC-3, KEYNOTE-A18), **ligne NIVESTIM structurée** (30 / 48 MU proposé d'après le poids
      de la séance, J début → J fin, nombre d'injections ; imprimée sur la fiche de chimio pour la prise en charge), case **« EMEND
      prescrit »** : non retenue ; Solumedrol selon les réponses du 13/10 (1). Moteur : **cumuls bléomycine** (400 000 UI) et cisplatine visibles à chaque cure (vigilance.js,
      à côté des anthracyclines et de l'oxaliplatine) ; **PAL et CPK** dans le bilan du jour (docétaxel, trabectédine) ; seuils
      **hebdomadaires** (J8, J15… : PNN ≥ 1,0 G/L, plaquettes ≥ 75 G/L) et **gemcitabine J8 / J15** (100 % / 75 % / non faite) ;
      trabectédine, méthotrexate (DFG ≥ 60, 3e secteur), pémétrexed (DFG ≥ 45). Tests du moteur.
- [ ] ~~P4 (plan)~~ **Ordres 2 et 3 appliqués** (114 + 70 « À ajuster », 3 « À modifier » : [105] mFOLFIRINOX rectum 180 mg/m², [192] KEYNOTE-A18
      + protocole lié, [251]) par l'écran P1, dans les nouveaux champs : sétron + Solumedrol de J1 (80 / 60 / 50 mg selon les réponses du 13/10), POLARAMINE
      (paclitaxel, cétuximab, cabazitaxel), **hydratation du cisplatine en lignes** (NaCl, KCl, MgSO4 ± mannitol), **NIVESTIM structuré**
      (54 protocoles) et retiré des 11 FOLFOX / FOLFIRI, atropine (irinotécan), surprophylaxie allégée (21 schémas à risque faible : un seul
      antiémétique), médicaments pris à domicile sortis du protocole vers l'ordonnance, seuils du jour, ordonnances liées.
- [x] **P5 Bibliothèque propre (18/10/2026, testé ; avec P4, même passage unique `audit3e` ; en ligne : 20261018b)** : **source** de chaque
      protocole = essai de référence du classeur (306 ; variantes locales : « Variante locale de … ») ; **« SOLUMEDROL » →
      « SOLUMEDROL (méthylprednisolone) »** (186 lignes ; les autres produits étaient déjà écrits par leur DCI) ; **localisation de la fiche**
      (`dos` / `loc`, ancien rangement à deux niveaux, imprimé en bas de la fiche de chimio) = 1re indication de l'arborescence (qui était
      déjà à un seul niveau) ; eviQ : plus aucune mention après P4 ; « HGC » : retiré au palier 3. PRODIGE 5 : NIVESTIM retiré (demande du
      18/10). **Pas fait (à décider par Dr Bentahila)** : acide folinique racémique ou lévofolinate (« ACIDE FOLINIQUE (LV) » 400 / 200 /
      50 mg) ; Solumedrol en mg/kg (EC, CAP fractionné). Tests : test-audit3p4 29/29.
- [x] **P6 Bouton « Ordonnances » (18/10/2026, testé ; en ligne : 20261018b)** : dans la séance, à côté de Reporter / Valider (droit
      d'écrire les consultations) : fenêtre « Ordonnances du protocole » (`orProtocole`, ordonnances.js) avec les ordonnances liées cochées,
      « Chimio – Fièvre sous chimiothérapie » cochée à la 1re cure d'une chimiothérapie IV, les autres ordonnances « Chimio » à cocher ;
      « Préparer l'ordonnance » réunit leurs médicaments dans la fenêtre d'ordonnance habituelle (modifiable, A5 / A4, Valider / Valider +
      Imprimer, consultation du jour). Une ligne prescrite avant le 18/10 garde sa copie du protocole : ordonnances liées et seuils pris dans
      la bibliothèque (`champsBib`). Pas de bouton à la création de la ligne : la C1 se prépare depuis sa séance. Test :
      `tests/test_ordonnances_protocole.py` 7/7.
- [ ] ~~P5 (plan)~~ **Bibliothèque propre** : **DCI à côté de la marque** (191 « SOLUMEDROL » seuls ; acide folinique : racémique ou lévofolinate ;
      Solumedrol en mg/kg harmonisé) ; **eviQ retiré** (noms, 73 remarques) ; **« HGC » retiré** des noms ; **Source remplie** pour les
      316 (colonne du classeur ; variantes locales : « variante locale, dérivée de … ») ; protocoles sans essai gardés **sans mention** ;
      [211] : furosémide nommé correctement (OEDES = oméprazole), bicarbonate en ml ; **classement à un seul niveau** (Poumon / Poumon-thorax, Digestif / Côlon-rectum / Estomac fusionnés ; [310]
      rangé en endomètre et col ; [7], [123], [273] rangés aussi là où ils servent) ; indications complétées (colonne « Aussi rangé dans »).
- [ ] ~~P6 (plan)~~ **Bouton « Ordonnances »** : à côté de « Valider » / « Reporter » dans la séance, les ordonnances liées au protocole **cochées**
      (risque émétique, molécules) ; le médecin décoche, modifie le texte, ajoute, imprime (A5 / A4, en-tête et signataire de 3.9) ;
      valider sans imprimer reste possible. **À la création de la ligne** : ordonnance de C1 imprimée avec la fiche de prescription envoyée à
      la prise en charge ; « Fièvre sous chimiothérapie » proposée à la 1re cure IV ; à chaque cure : ordonnance de la cure + prémédication
      de la veille de la cure suivante (docétaxel, pémétrexed). Gardées dans l'historique (`enregistrerPrescription` : consultation du
      jour, créée « Ordonnance » si besoin, comme aujourd'hui).
- [x] **P7 Protocoles à créer (18/10/2026, testé ; même passage unique `audit3e` ; en ligne : 20261018b)** : les **59 protocoles** des
      priorités 2 et 3 du classeur (les 11 « priorité 1 » de l'audit : AC, AC dose dense, TC, TCH, TCHP, cisplatine 100 J1-J22-J43 + RT ORL et
      nasopharynx, géfitinib, afatinib, cabazitaxel + prednisone + G-CSF, bicalutamide ; puis 48 dont les versions hebdomadaires) lus par
      `outils/audit3/convertir-p4.mjs` (`P7` de `donnees/audit3p4.js` : lignes, rythme, remarques, branches + « Aussi rangé dans », seuils,
      ordonnances liées, source), créés « Validé » sans mention, jamais en double d'un protocole du même nom (`creesP7`). Solumedrol :
      80 mg pour carboplatine / Enhertu / Trodelvy, 50 mg/j cisplatine sur plusieurs jours, 60 mg avec EMEND. Pegfilgrastim : 6 mg à J2
      (le classeur y avait la posologie du Nivestim). Priorité 4 (64 : lymphomes, trophoblastique…) : plus tard. Tests : test-audit3p4
      37/37 (59 créés, AC, TCH, cisplatine ORL, AC dose dense, pegfilgrastim), test_audit3 22/22 (368 protocoles sur le jeu de test).
- [ ] ~~P7 (plan)~~ **Protocoles à créer** (« Validé », sans mention ; priorités 2 et 3 = 59 maintenant) : les **11 de priorité 1** (AC, AC dose dense, TC, TCH, TCHP,
      cisplatine 100 mg/m² J1-J22-J43 + RT en ORL et en nasopharynx, géfitinib, afatinib, cabazitaxel + prednisone + G-CSF, bicalutamide
      autour de l'agoniste), puis les **48 de priorité 3** (dont les **versions hebdomadaires** : MITO-7, JGOG 3016 / ICON8, AURELIA,
      INTERLACE, Belani, KEYNOTE-407, docétaxel 35 hebdo, APT, nab-paclitaxel hebdo, anthracyclines hebdo, ERBITAX, irinotécan 125 ;
      poumon, sein, côlon, prostate, sarcomes, peau) ; les 64 de priorité 4 plus tard. Écrits en entier dans le classeur
      (lignes, seuils, ordonnances, source) : importés par l'écran P1.
- [x] **P8 Hebdomadaire de bout en bout (18/10/2026)** : vérifié sans code nouveau : seuils des séances hebdomadaires (P3 : PNN ≥ 1,0,
      plaquettes ≥ 75, gemcitabine J8 / J15), report d'une seule séance (« cette date seulement », déjà là), heure de consultation et de
      séance chaque semaine (3.7 bis), bouton « Ordonnances » dans chaque séance (P6), consultation de J8 / J15 pré-remplie à 0 DH (décision).
- [ ] ~~P8 (plan)~~ **Hebdomadaire de bout en bout** : pas de prix pour la consultation de J8 / J15 (fenêtre pré-remplie à 0 DH, inchangée) ; vérifier sur un protocole hebdomadaire : seuils du jour à chaque injection (P3), report d'une seule séance
      (« cette date seulement », existe), rendez-vous et heure chaque semaine (3.7 bis), ordonnance par séance (P6).
- [ ] **P9 Bibliothèque commune à tous les cabinets** : l'Administration **publie une version** de la référence (numéro, date, journal des
      changements lisible : « v4 : anti-NK1 ajouté ») ; le serveur compare cabinet par cabinet (nouveaux, modifiés dans la référence,
      modifiés par le cabinet, supprimés) ; chaque cabinet voit « 14 protocoles mis à jour » et **le même écran que P1** (accepter, refuser,
      garder les deux) ; un protocole modifié par le cabinet n'est jamais écrasé sans son accord ; même chose pour les ordonnances types et
      les listes ; chaque diffusion tracée (qui, quand, quelle version, acceptée par qui) ; **export PDF** (livret par localisation) et
      **Excel** de la bibliothèque ; bouton « Signaler une erreur » qui remonte à l'Administration.
- [x] **P10 (18/10/2026, testé ; version 20261018e)** : moteur `public/js/moteur/p10.js` (test-p10 19/19). **i) Interactions** (fenêtre de
      validation et encart Vigilance, d'après les traitements en cours / antécédents de la fiche et les ordonnances liées) : aprépitant (EMEND)
      + AVK ou contraception hormonale ; TKI (erlotinib, géfitinib, pazopanib, capécitabine…) + IPP / anti-H2 (dont OEDES) ; TKI + inducteurs
      (rifampicine, carbamazépine, phénytoïne, millepertuis) ou inhibiteurs du CYP3A4 ; méthotrexate + AINS / IPP / cotrimoxazole ; QT (ribociclib,
      vandétanib, nilotinib… + sétron ou autre médicament du QT) ; 5-FU + phénytoïne. **j) Foie** (bilirubine, ASAT / ALAT du bilan du jour) :
      vinca-alcaloïdes, étoposide, gemcitabine, capécitabine, TKI, cyclophosphamide / ifosfamide (en plus des règles déjà en place).
      **k) Arrondi au flacon** : dose arrondie au plus petit flacon proposée sous la dose calculée si l'écart reste < 5 % (lien qui l'applique ;
      séance non validée) ; tailles des flacons réglables (Paramètres › Bibliothèques › Vigilance des molécules › « Flacons », `parametres/flacons`,
      départ `FLACONS0`). **n) Pharmacie** : bouton « Pharmacie » de la salle d'attente : séances de chimiothérapie d'un jour (lendemain par
      défaut), par établissement : patient, protocole, cure, anticancéreux, dose, flacons ; imprimable (`saPharmacie`, `chDosesSeance`).
      Test : `tests/test_p10.py` 7/7.
- [x] **P11 (18/10/2026, testé ; fonction `referenceDepuisCabinet` + Administration, en ligne : 20261018c)** : Administration › Bibliothèques ›
      carte « Oncologie – Radiothérapie » › **« Recopier depuis le cabinet Bentahila »** (confirmation) : protocoles, médicaments, ordonnances
      types, analyses, bilans, examens, courriers (étoiles retirées, trace « Copié de la bibliothèque de référence le … »), paramètres de base
      nettoyés (`parametreDepart`), tarifs de radiothérapie → `espaces/bib-oncologie` ; jamais patients, correspondants, prix, lieux, équipe,
      documentation ; noté au journal de l'Administration ; les cabinets neufs reçoivent cette copie (déjà en place : `sourceBib`), avec les
      migrations de l'audit n° 3 notées comme faites (`MIGRATIONS` de cabinets.js). **À faire par Dr Bentahila** : ouvrir une fois Onco360
      (sa bibliothèque se corrige), puis cliquer le bouton dans l'Administration.
- [ ] ~~P11 (plan)~~ **La bibliothèque du cabinet Bentahila devient la référence** (décision du 18/10/2026) : quand les étapes P4 à P7 sont finies,
      une fonction de l'Administration **recopie une fois** la bibliothèque du cabinet Bentahila (protocoles, ordonnances types,
      médicaments, analyses, examens, courriers, documentation, paramètres de base ; jamais patients, correspondants, prix, lieux, équipe ;
      étoiles retirées) dans la bibliothèque de référence `bib-oncologie`, que reçoit chaque nouveau cabinet (déjà en place : `creerEspace`
      → `sourceBib`). Ensuite la bibliothèque du cabinet Bentahila est la sienne (ses modifications ne changent plus la référence) ; la
      référence se modifie depuis l'Administration (« Ouvrir et modifier »), et P9 enverra ses mises à jour aux cabinets déjà créés.
      Bouton « Recopier depuis le cabinet Bentahila » gardé pour le refaire si elle le demande. Aucun autre médecin n'a de compte : rien
      ne presse avant la création du premier cabinet.

## Phase Q – Qualité (en continu, et ces étapes)
- [ ] **Q-a Jeu de test fictif** (ancienne 0.6, à faire tôt : chaque test écrit sur la sauvegarde réelle risque d'y laisser un nom) :
      jeu construit par `functions/demo.js` pour tous les tests du navigateur (`tests/base.py`, `tests/mkseed.mjs`) ; tests de calcul qui
      plantent sans `seed.json` rendus autonomes ; contrôle automatique : aucun nom du jeu réel dans `tests/`, `functions/`, `public/`.
      Bibliothèque de protocoles fictive pour les tests de P (Q10 : jeu rafraîchi depuis une sauvegarde récente anonymisée).
- [ ] **Q-b ESLint** (Q3 bis : variable inconnue, fonction absente, double déclaration) dans `avant-mise-en-ligne.sh`.
- [ ] **Q-c Journal des erreurs en ligne** (Q6) : erreurs JavaScript des utilisateurs notées (sans données patient), visibles dans
      l'Administration.
- [ ] **Q-d Contrôle des dossiers au chargement** (Q7) : champs mal rangés, rendez-vous orphelins, dates impossibles → réparés ou
      signalés ; test « aller-retour » (un enregistrement ne perd aucun champ).
- [ ] **Q-e CSP appliquée pour de bon** (reportée de 1.5 ; en observation depuis le 11/10).
- [ ] **Q-f `tests/test_cabinets.py`** : 2 vérifications en échec depuis le 11/10 (« Statistiques en premier », « Listes en premier ») :
      l'ordre des cartes et des rubriques réglé par l'Administration est-il encore respecté ?

## Phase M – Métier restant
- [ ] **3.8 Écran de l'infirmière** (tablette) : patients du jour, cure et molécules ; **plan de soins ordonné** tiré du protocole
      (prémédication 30 min avant, ordre des poches, débits, rinçages) ; pose de chaque poche (heure, par qui), voie d'abord (PAC,
      périphérique, PICC), constantes, tolérance, effets indésirables ; visible dans l'onglet
      Chimiothérapie ; règle `administrations` déjà écrite ; droit « administrer » remis dans Accès.
- [ ] **4.4 Dossier stable, comme GestiCab** : en-tête compact (1-2 lignes), dossier à hauteur d'écran sur ordinateur (≥ 1280 px : onglets à
      gauche, Rendez-vous / tâches et Documents à droite, chaque zone défile seule), barre des prescriptions fixe en bas, consultations en
      lignes compactes ; téléphone inchangé.
## Phase D – Design
- [ ] **4.1 Toucher et contraste** : zones de 44 px (dossier, protocoles), badges vert et orange contrastés (→ 4,5), filtres repliés sur
      téléphone (bilan, protocoles), téléphone du patient en lien Onco360, champs de fichier habillés, ~40 libellés reliés à leur champ.
- [ ] **4.2 Fenêtres Onco360 à la place des boîtes grises** : les `alert` / `confirm` / `prompt` (123 au 11/10) remplacés par une fenêtre
      commune, en commençant par les suppressions et les fenêtres de validation de la chimio.

## Phase E – Code et exploitation
- [ ] **5.1 Code mort et fonctions communes** : `chValiderSeance`, `chHon`, `nlChoix`, `pfOnglet`, `prChoix`, `__v2pret`, variables et
      exports inutiles, styles inutilisés ; `esc`, `sansAcc`, `dfr`, ajout de jours, impression regroupés dans `moteur/outils.js` ; tests de
      cohérence site / serveur (`consJours`, `finRT`, `COULEURS0`, `REGLES_FIXES`) ; `configuration.js` découpé par famille (avec ESLint) ;
      `archives/` et `listes/` rangés hors du code.
- [ ] **5.2 Écritures qui s'écrasent** : les écritures d'un bloc sans relecture (réglages, listes, pointages…) en transaction.
- [ ] **5.3 Montée en charge** (avant un groupe) : photo du patient dans Cloud Storage, index léger des patients, liste par pages, dossier
      complet chargé à l'ouverture, agenda et alertes depuis l'index, traitements de nuit par cabinet. Objectif : 5 000 dossiers.
- [ ] **5.4 Restes de l'ancienne application** : « Payé auto. » d'avant le 12/10/2026 converti en pointages (bilan identique), puis
      `FIN_PAYE_AUTO`, `rdvMigre`, `brutV1`, branches v1, `migrerV1`, `tableDepuisV1`, `texteTotaux` retirés ; `migrations()` allégé.
- [ ] **5.5 Recette et mise en ligne** : projet Firebase de recette ; script unique (tests puis site, règles et fonctions ensemble) ;
      supervision ; SDK Firebase du site 10.12.2 → version actuelle et `firebase-admin` 13 → 14 (reportés de 1.5).
- [ ] **5.6 Application installable et hors ligne** : icône, plein écran ; dossiers déjà ouverts et planning du jour sans réseau ; bandeau
      « Hors ligne » ; données effacées à la déconnexion.

## Phase C – Conformité et vente (avec un juriste ; en parallèle)
- [ ] **0.5 Fiche d'incident et gel** : fiche pour le juriste (ancienne application en ligne sans connexion jusqu'au 11/10, 57 patients ;
      dépôt GitHub public le 10/10 et le 11/10 ; copies d'après GitHub › Traffic, question 2). **Plus de création de cabinet réel** avant
      l'avis juridique (le cabinet de démonstration reste permis).
- [ ] **6.1 Juriste** : CNDP (F-113 données de santé, F-118 transfert), contrat de sous-traitance, conditions d'utilisation, politique de
      confidentialité (aussi pour Google), durées de conservation, incident (0.5).
- [ ] **6.2 Qualification** : Onco360 est-il un dispositif médical (loi 84-12 ; en Europe, calcul de doses de cytostatiques = classe III) ?
      Positionnement « aide au calcul, sous la responsabilité du médecin ».
- [ ] **6.3 Contenus** : sources de chaque protocole et retrait d'eviQ (faits en P5) ; vérifier qu'aucun élément de Tbibclic ni de GestiCab
      n'est repris à l'identique. Relecture de la bibliothèque à deux : non retenue par Dr Bentahila (13/10) ; un acheteur pourra la demander.
- [ ] **6.4 Société et droits** : société éditrice ; Dr Rita Bentahila seule autrice (Hamza Benzekri a seulement prêté son compte Claude au
      début : attestation possible) ; statut du code écrit avec une IA.
- [ ] **6.5 Projet neutre** : organisation Google Cloud et projet Firebase au nom de la société, nom de domaine (onco360.ma), variante
      hébergée au Maroc si besoin (loi 05-20).
- [ ] **6.6 Test d'intrusion** par un prestataire externe.

## Phase V – Dossier de cession
- [ ] **7.1 Installation sur un projet vierge en moins de 30 minutes** (README, `.env.example`, architecture, schéma de la base, règles
      commentées, fonctions et scripts).
- [ ] **7.2 Code lisible** : Prettier en une fois ; découpage de `v2.js`, `pageConfiguration`, `pageDossier`, `editeurReglage` sous les tests ;
      typage JSDoc du moteur.
- [ ] **7.3 Guides et démonstration** : guides Médecin, Secrétariat, Infirmière (cabinet de démonstration), cahier de recette, démonstration
      de 15 min, plaquette.
- [ ] **7.4 Dossier de vente** : preuves d'usage, dossier clinique (règles de calcul, protocoles et sources, tests du moteur), rapport de
      test d'intrusion, registre des incidents, note de conformité, NDA, contrat de cession, chaîne de droits.

## Gelé, plus tard, annulé
- **Gelé** : Gynécologie (aucun pack). **Médecine générale gardée** : pack et bibliothèque quand Dr Bentahila le demande.
- **Plus tard, si un client le demande** : circuit de la pharmacie (PUI), fiche de fabrication et rôle Pharmacien ; alertes sur le
  téléphone Onco360 fermé ; « Mode démo » sur un vrai cabinet ; HL7 / FHIR, laboratoire, imagerie, import du relevé de l'accélérateur ;
  codes d'activation ; renommer un menu depuis l'administration ; « + Arrivée sans rendez-vous » et filtre Praticien de la salle d'attente.
- **Annulé** (13/10) : 3.17 WhatsApp envoyé tout seul ; 3.18 format du papier choisi tout seul ; double contrôle avant préparation ;
  case « EMEND prescrit » ; mention « hors référentiel ».
- **Non retenu** (11/10) : déconnexion automatique, double authentification, Google Agenda anonymisé, archivage des patients, original
  Word / Excel gardé, organes à risque, tableau des toxicités de radiothérapie. (Avant) : pointer en lot dans le Bilan ; journal des séances
  de radiothérapie ; alerte de poids de la secrétaire (19.6) ; assistant IA. (13/10) : relecture de la bibliothèque par un 2e oncologue ;
  motif à saisir pour « Valider quand même » ; contrôle automatique des prémédications.

## À placer
- (vide)

---

# DÉJÀ FAIT (gardé tel quel)

## État au 11/10/2026
Onco360 en ligne depuis le 06/10 (https://chimio-hgc.web.app, version 20261011t) : dossier à onglets, consultations, six familles
de prescription, documents de radiothérapie, documents déposés (tout en PDF), tâches et tâches automatiques, salle d'attente
(SA1 à SA9 : transactions, reçus numérotés), RCP, numéro de dossier, journal d'audit, rôle comptable, cabinet de démonstration,
plusieurs cabinets, administration (cabinets, formules, packs par spécialité, abonnements, factures, relances, comptabilité,
journal), bibliothèques de référence par spécialité, fiche patient et formulaire de consultation réglables (par l'administration
et par chaque cabinet), secrétariat (étape 19 : droits, plusieurs cabinets, caisse, reçus), Bilan (15 bis : recalcul, hôpital
des actes gardé, pointages par identifiant, trimestres, relevé PDF), agenda (AG1-AG5 : vue Jour sur téléphone, durée par type,
glisser-déposer, médecin du rendez-vous, heure facultative des séances), tableau de bord en deux colonnes avec « À valider »,
design (menu repliable, pleine largeur, relief, Paramètres en 4 familles, « Mon compte »), Google Agenda par personne.

**Constats des audits déjà réglés** (ne pas refaire) : 4 défauts du Bilan ; salle d'attente (onglet d'ouverture, colonnes, 44 px,
reçus) ; tableau de bord (deux colonnes, abonnement en bandeau, émojis) ; agenda (vue Jour, médecin, durée, glisser) ; Paramètres
(familles, « Mon compte ») ; fiche réglable par le cabinet ; tests `test_cures` / `test_seances` réparés ; ancien script d'agenda
retiré ; nom de patient réel retiré de `functions/test-logique.js` ; **ancienne application retirée du site (0.1)**.

**Toujours vrai dans le code (vérifié le 11/10)** : liste des 167 correspondants dans `listes.js` ; « CASABLANCA » en dur
(pli p. 2-3) ; « Je soussignée » (4 courriers) ; repli « HGC » des tarifs ; SheetJS 0.18.5 (faille) ; photo du patient insérée
sans échappement ; HTML des ordonnances non nettoyé à l'affichage ; pas de politique CSP ; aucune déconnexion automatique ;
e-mail de la propriétaire dans les règles ; diagnostic et téléphone envoyés dans Google Agenda ; cure non figée ; aucune borne de
saisie ; prémédication reconnue par noms de marque ; protocole sans statut = validé ; protocoles enregistrés par blocs qui
s'écrasent ; radiothérapie modifiable après la dosimétrie validée ; « Terminé » inventé dans le document Rendez-vous ; pas de
fiche tumeur, de statut du patient, d'archivage ; photo dans le dossier ; tous les dossiers chargés ; 123 boîtes grises du
navigateur ; tests du navigateur liés à une sauvegarde réelle ; aucun test des doses ; copie lisible d'Onco360 dans le Drive
jamais installée.

## Étapes faites (détail)

### Phase 0 – Urgences
- [x] **0.1 Ancienne application retirée du site** (11/10, en ligne) : `ancienne-app.html` (dossiers réels de 57 patients lisibles
      sans connexion), `historique.html`, `app.html`, `js/pont.js`, `js/shim.js`, `js/ajustements.js`, `logo.png`,
      `public/modeles/*.docx` (copies), `construire.mjs` ; redirections 301 vers v2.html (`firebase.json`) ; `PROPRIETAIRE` retiré
      de `config.js`. Vérifié : aucune donnée servie. Données v1 intactes dans la base (collections racine, lecture seule) et dans
      les copies JSON du Drive jusqu'au 06/10 (date de la bascule, plus rien n'y change) ; copie privée des fichiers hors du dépôt :
      `Desktop/ONCO360/archives-privees-onco360/`.
- [x] **0.2 Copie lisible de tout Onco360, chaque nuit** (installée par Dr Bentahila le 11/10 ; 1re copie `Onco360_2026-10-11.json`, 945 Ko, dans Drive › Sauvegardes › Onco360 ; ensuite chaque nuit vers 3 h) (condition de Dr Bentahila) : le script `apps-script/onco360-sauvegarde.gs`
      est prêt mais **jamais installé** (aucun fichier `Onco360_…` dans le Drive). Dr Bentahila le colle dans le projet Apps Script
      « Chimio HGC » et lance `installerSauvegardeOnco360` (5 min, Claude guide pas à pas) ; Claude vérifie la 1re copie
      (`Drive › Sauvegardes › Onco360`) : tous les dossiers, consultations, finances, réglages, au format JSON lisible par n'importe
      quel logiciel. Le script ne copie que le cabinet du Dr Bentahila (le sien), pas les autres cabinets ; il doit aussi ne plus
      emporter les profils des autres cabinets (`utilisateurs`) → limiter aux membres de son cabinet. Les fichiers déposés (PDF) ne
      sont pas dans cette copie → 1.6.
- [x] **0.3 Historique GitHub nettoyé** (11/10) : noms de vrais patients retirés des tests (`functions/test-logique.js` →
      « PATIENT TEST » ; `tests/test_agenda.py` → nom lu dans le jeu de test), `.claude/launch.json` sorti du dépôt ; puis
      `git filter-repo` sur une copie : `public/ancienne-app.html` retiré de tout l'historique, les deux noms remplacés dans tous
      les commits ; vérifié (aucun des 57 dossiers, aucun nom complet ; restent deux homonymes qui ne sont pas des dossiers :
      le nom de Hamza Benzekri dans la documentation (compte Claude prêté) et un médecin correspondant de `COR0`, retiré en 1.7) ; envoyé sur GitHub. Reste à Dr Bentahila :
      purge du cache GitHub et vérification des copies (question 2).
- [x] ~~0.4 Double authentification~~ : non retenue (décision du 11/10).
- [x] **0.7 Supprimer complètement l'ancienne application** (terminée le 11/10 : collections racine effacées par Dr Bentahila dans la console ; `roles` n'existait pas ; Onco360 vérifié intact) (demandé le 11/10 ; Onco360 ne lit plus rien de la v1 : vérifié dans le code).
      **Fait le 11/10** : décision de Dr Bentahila = **aucune archive** (tout est dans Onco360 depuis la bascule du 06/10, bilan
      identique ; les sauvegardes Firebase gardent la v1 encore 14 semaines) ; Drive vidé par elle (« Application Chimio HGC » =
      Sauvegardes + projet Apps Script) ; copie privée du Mac à la Corbeille ; script de copie v10 autonome installé, anciens fichiers
      et déclencheurs Apps Script supprimés ; **règles v1 retirées et en ligne** (`tests/regles/test-v1.mjs`). **Reste** : effacement
      des collections racine par Dr Bentahila (commande donnée le 11/10). Plan initial :
      (1) **une archive finale** de toute la v1 (exigence de Dr Bentahila : dossiers toujours récupérables) = le JSON du 06/10
      (restauré depuis la corbeille du Drive ; la v1 n'a plus changé depuis), rangé dans Drive › Application Chimio HGC › Archives ;
      (2) contrôle sans afficher de nom : chaque patient de la v1 existe dans Onco360 (comparaison de la copie Onco360 du jour et de
      l'archive) ; (3) collections racine `patients`, `protocoles`, `parametres`, `finances`, `roles`, `historique` effacées de
      Firestore **par Dr Bentahila** (commande donnée ; les sauvegardes Firebase les gardent encore 14 semaines) ; (4) règles v1 et
      `proprietaire()` retirées de `firestore.rules` (tests des règles) ; (5) Apps Script : script de copie Onco360 rendu autonome
      (v10, sans les fichiers « Code » et « Firebase »), puis anciens fichiers, déclencheurs et ancienne application Apps Script
      supprimés ; (6) Drive : `ChimioHGC_patients`, `Archives` (fiches PDF), « Refonte – données de référence » et copie privée du
      Mac supprimés (contenus dans l'archive finale). Le code « v1 » restant dans Onco360 concerne des montants **déjà dans
      Onco360** (prix repris, « Payé auto. ») : il part en 5.4, pas ici.


### Phase 1 – Sécurité

- [x] **1.1 Injections de code** (11/10, testé, en ligne : version 20261011u) : `srcImage` (moteur/outils.js) : photo du patient, photo de
      profil, signature et logos acceptés seulement en image base64 ou fichier Firebase Storage (v2.js `bulle`, avatar ; profil.js ;
      fiche.js) ; nettoyeur HTML (`nettoyer`) appliqué aussi **à l'affichage** : fenêtre de l'ordonnance / du courrier, aperçu et
      impression des antécédents, documents de radiothérapie enregistrés, et toutes les lectures de HTML enregistré (l'aperçu des
      antécédents exécutait encore une image piégée : corrigé) ; **politique CSP** dans `firebase.json`, d'abord en observation
      (« Report-Only ») : l'application entière l'a passée appliquée pour de bon dans les tests (médecin, secrétaire) → la passer en
      application réelle après une journée en ligne sans alerte (1.5). Contrôle des formats dans les règles Firestore non retenu
      (regex sur des images de 300 Ko : coûteux ; l'affichage est protégé). Test : `tests/test_securite.py` (10/10 : photo,
      signature et courrier piégés, CSP appliquée, contrôle qu'un script d'un autre site est refusé). Aussi : `test_menu` (28/28,
      4 familles) et `test_profil_abo` (« Mon compte ») mis à jour.
- [x] **1.2 Comptes** (11/10, en ligne) : « Lien du mot de passe » de l'administration (`lienMotDePasse`) réservé à un compte
      **jamais utilisé** (premier mot de passe d'un cabinet neuf) ; sinon refus expliqué (« Mot de passe oublié ? » de la page de
      connexion, e-mail à l'adresse du médecin) et noté au journal de l'administration. **Décisions de Dr Bentahila** : pas de
      déconnexion automatique ni de double authentification ; **l'accès de l'administration aux profils des autres cabinets et la
      création de cabinets restent tels quels** (e-mail propriétaire des règles gardé : le remplacer par la collection
      `administrateurs` donnerait au compte d'administration les pouvoirs du cabinet Bentahila).
- [x] **1.3 Droits imposés par le serveur** (11/10, testé, en ligne : version 20261011v, règles, stockage, corrigerListes) : fiches de membres **créées par le serveur
      seulement** (`creerMembre`) ; le titulaire modifie ou retire les fiches existantes (jamais la sienne) ; **historique d'une tâche
      jamais réécrit** (le début du fil doit rester identique) ; **modules retirés fermés à l'écriture** (`moduleOn` : salle
      d'attente, RCP, tâches, documents déposés et documents de radiothérapie ; cabinet sans abonnement = tout) ; **fichiers déposés :
      PDF seulement** (`storage.rules`, envoi toujours en `application/pdf`) ; **diagnostics corrigés dans les dossiers par un médecin
      seulement** (`corrigerListes` ; Paramètres › Listes : diagnostics en lecture pour la secrétaire ; ancienne → nouvelle valeur
      dans le journal du serveur). Tests : `tests/regles/test-droits.mjs` (13), `test-cabinets` adapté, 11 suites / 283 cas ;
      `tests/test_securite.py` 16/16 ; réglage, fiche, salle, menu. **Non faits, par choix** : consultations lisibles par tout le
      périmètre (décision du 07/10 : l'infirmière lit le journal) ; dossier patient lu en entier dans le périmètre (Firestore ne filtre
      pas les champs ; limite à écrire au dossier de cession) ; poids du jour seul pour la secrétaire (planning en texte JSON, illisible
      par les règles : risque couvert par 2.2 cure figée et 2.3 alerte d'écart de poids) ; limites de dossiers et de lieux de la
      formule (les règles ne savent pas compter : écran + serveur à la création, à revoir avec la montée en charge 5.3).
- [x] ~~1.4 Google Agenda discret~~ : non retenu, Google Agenda reste comme aujourd'hui (décision du 11/10).
- [x] **1.5 Bibliothèques et contrôle avant mise en ligne** (11/10, en ligne : version 20261011w) : jszip 3.10.1, html2canvas 1.4.1,
      mammoth 1.6.0 et **SheetJS 0.20.3** (faille CVE-2023-30533 de la 0.18.5 corrigée) **copiés dans le site** (`public/vendor/`,
      empreintes officielles vérifiées, `LISEZMOI.md` : versions, sources, licences) ; plus aucun script de cdnjs, retiré de la
      politique CSP ; **`outils/avant-mise-en-ligne.sh`** (syntaxe de tout le code, aucune donnée réelle : fiche patient, IMP1,
      téléphone, ancienne application ; tests serveur et moteur ; `--regles` pour l'émulateur) : à lancer avant chaque mise en
      ligne (il aurait bloqué l'erreur de syntaxe faite pendant cette étape). Test : `tests/test_securite.py` 20/20.
      **Reportés** : SDK Firebase du site 10.12.2 → version actuelle et `firebase-admin` 13 → 14 du serveur (8 failles « moyennes »,
      toutes du composant `uuid`, non utilisé ainsi par Onco360) : mise à jour majeure, avec remise en ligne de toutes les
      fonctions → **5.5** (recette) ; CSP appliquée pour de bon (aujourd'hui en observation) : à la mise en ligne suivante, si
      Dr Bentahila n'a rien remarqué d'anormal ; typage JSDoc du moteur → **7.2** (avec la mise en forme) ; espace d'essai « test-b1 »
      supprimé par Dr Bentahila le 11/10 (aucun compte « test-b1 » dans Authentication ; `+medecintest` inutilisé depuis le 04/10, à elle de voir).
- [x] **1.6 Export complet et sauvegarde des fichiers** (11/10, en ligne : version 20261011x, fonctions exporterCabinet, fichiersNuit, fichiersSauvegarder) : **Paramètres › Cabinet › Export des
      données** (médecin titulaire seul ; l'administration n'y a pas accès, aucun accès aux patients) → fonction `exporterCabinet` :
      ZIP = tableau des patients (Excel), toutes les données (JSON), PDF déposés, documentation, journal d'audit, notice ; noté au
      journal. **Restauration** `outils/restaurer-export.mjs` (dates et chemins remis exactement) ; **copie de secours des fichiers**
      chaque nuit (`fichiersNuit`, second emplacement aux Pays-Bas, fichier supprimé gardé 30 jours) ; mode d'emploi
      `outils/RESTAURER.md`. **Essayé de bout en bout sur les émulateurs** (`npm run export`, 19/19 : refus de la secrétaire,
      contenu, PDF identiques, introuvable signalé, journal, ancien export effacé, **restauration dans un cabinet vide = données
      identiques**, copie des fichiers). Tests : test-exportation (10), test-sauvegarde (5), test_export.py (7) ; contrôle complet
      `avant-mise-en-ligne.sh --regles` au vert. À vérifier après la 1re nuit en ligne : création du second emplacement (journal de
      `fichiersNuit`).
- [x] **1.7 Données propres au premier cabinet** (11/10, en ligne le 12/10 : version 20261012a et toutes les fonctions) : « CASABLANCA » du pli → **ville du lieu**
      (3 pages ; vide = « À REMPLIR ») ; plus de « Casablanca » par défaut (pli, courriers : « À compléter ») ; **accord selon le médecin**
      (Mon compte › « Accord dans les documents » : soussignée / soussigné, Absente / Absent ; sans choix : le texte reste tel quel,
      « Absent(e) ») : pli, courriers, badge d'absence (`accordMedecin`, `absentMedecin` de moteur/outils.js) ; **repli « HGC »** gardé
      pour le cabinet d'origine seulement (son bilan ne bouge pas : test du bilan figé réussi), plus jamais pour un autre cabinet
      (tarifs, rendez-vous, grille d'un nouveau lieu) ; **« CNSS — AMO »** dans les mutuelles de départ (site et serveur) ; fenêtres
      « Aucune analyse choisie » / « Aucun examen choisi » ; démonstration avec créatinine. Tests : `tests/test_cabinet_neutre.py` 18/18,
      fiche, profil, démo, cabinets (adapté aux 4 familles). Liste des 167 correspondants : écrite en entier dans les listes du cabinet
      d'origine à l'ouverture d'Onco360 par Dr Bentahila (12/10, `listesCompletes`), puis **`COR0` retiré du code** (12/10, pas encore en
      ligne ; elle reste dans l'historique Git, privé : purge possible si demandé). **À faire par Dr Bentahila** : Mon compte ›
      « Accord dans les documents » › « Je soussignée ».


### Phase 2 – Sécurité clinique

- [x] **2.1 Tests des doses qui vérifient vraiment** (12/10) : **`tests/moteur/test-doses.mjs`** (patients et protocoles fictifs écrits
      dans le test, valeurs calculées à la main) : Mosteller, Cockcroft-Gault mg/L et µmol/L (homme, femme), Calvert plafonné à 125,
      mg/m², mg/kg, dose fixe, dose de charge C1, dose maximale, pas de dose sans surface ; ligne EC : dates, % reconduit, réduction
      globale (prémédication épargnée), poids repris, dose saisie reconduite ; carboplatine sans créatinine = pas de dose ; J1 / J8
      (poids et % de J8 reconduits, date de J8) ; molécules ajoutées / retirées, « tous les n cycles », C1 seule ; cure figée.
      36 vérifications justes du premier coup ; les échecs restants étaient les défauts de l'audit (figeage → 2.2, prémédication en
      DCI → 2.3). `test_cures.py` / `test_seances.py` : tournent sans erreur (affichages) ; leurs calculs sont désormais vérifiés ici.
      Le jeu de test fictif du navigateur (0.6) reste à faire.
- [x] **2.2 Cure figée à sa validation** (12/10, en ligne le 12/10 : version 20261012b) : à la validation de J1 (`chValiderJ1`) et de chaque
      séance (`majSeance`), instantané `fige` = { taille, âge, poids, créatinine, surface, clairance, doses de chaque produit pour les
      jours de la séance (dose, dose calculée, %), le, par, parNom } (`instantane`, moteur/doses.js) ; une séance validée s'affiche et
      s'imprime depuis cet instantané (`etatLigne`) ; « Rétablir » / annuler la validation retire l'instantané. **Une fois**, au
      démarrage par le titulaire (`figerCuresValidees`, `parametres/migrations.curesFigees`) : cures et séances déjà validées figées
      telles qu'elles s'affichent ce jour-là (`retro: true`). Tests : test-doses (essai 1 de l'audit, carboplatine, J8, annulation),
      `tests/test_figer.py` 9/9 (12 cures du jeu de test figées une fois, rien refait au 2e démarrage, validation et annulation à
      l'écran), cures, séances, démo, accueil. Non fait : valeurs avant / après dans le journal d'audit (le figeage empêche déjà tout
      changement silencieux d'une dose donnée).
- [x] **2.2 bis Séance validée verrouillée** (12/10, demande de Dr Bentahila, testé) : une cure ou une séance validée ne se modifie plus
      (champs désactivés, ajout / retrait de molécule masqués, refus côté code `seanceValidee` / `MSG_VERROU`) ; lien « annuler la
      validation » aussi pour J1 ; le moteur ne reconduit aux cures suivantes que les valeurs figées (`pc` de l'instantané), jamais une
      modification faite après la validation (défaut constaté par Dr Bentahila : une dose changée sur une cure validée passait aux
      suivantes). Bilan biologique du jour **sous les paramètres** (poids, créatinine, clairance, surface), avant « Molécules » ; gardé en
      brouillon si la fenêtre se redessine ; **affiché sur la cure validée** (repères en rouge) pour suivre l'évolution. Tests :
      test-doses 65/65, test_validation 22/22, test_figer, test_accueil.
- [x] **2.3 Bornes et prémédication** (12/10, en ligne le 12/10 : version 20261012b) : **prémédication reconnue par la DCI comme par la marque**
      (`PREMED` de moteur/doses.js : antiémétiques, corticoïdes, antihistaminiques, anti-H2 / IPP, atropine, facteurs de croissance,
      EPO, acide zolédronique, dénosumab ; même liste pour la liste des molécules des protocoles ; jours de séance inchangés) ;
      **contrôle avant validation** (`controleSeance`, `verifierValidation` de chimio.js) : dose d'un anticancéreux **impossible à
      calculer** (vide : sans surface, sans poids, carboplatine sans créatinine) → **validation refusée** avec la raison ; une dose à 0
      **voulue** (0 mg/m² au protocole, 0 % décidé) reste permise (constaté sur le jeu de test : FOLFOX sans bolus, trastuzumab à 0 % en
      C1) ; valeurs hors des seuils (poids 30-200 kg, taille 120-220 cm, surface 1,2-2,6 m², créatinine 3-30 mg/L ou 25-265 µmol/L,
      clairance 30-200 ml/min, poids qui varie de plus de 10 % depuis la séance précédente) → confirmation ; **poids saisi** (médecin
      ou secrétaire) hors seuils ou qui varie de plus de 10 % → confirmation à la saisie. Essai sur les 64 séances du jeu de test :
      aucune alerte, aucun refus. Tests : test-doses 57/57 (essais 2 à 4 et 11 de l'audit), `tests/test_validation.py` 13/13.
- [x] **2.3 bis Doses trop fortes, créatinine avant chaque carboplatine, bouton Retour** (12/10, demandes de Dr Bentahila, en ligne
      20261012d) : % tapé au-dessus de 100 % (par molécule ou global) ou dose saisie au-dessus de 110 % de la dose calculée →
      confirmation à la saisie ; à la validation, toute dose au-dessus de 110 % de la dose du protocole est signalée (`REPERES.doseMax`) ;
      **carboplatine** : créatinine du jour non saisie (reprise d'une séance précédente) → rappel « le DFG doit être vérifié avant
      chaque cure » (pas pour C1 J1, qui a la créatinine de la ligne ; sans aucune créatinine : validation refusée, déjà en place) ;
      « ‹ Retour à la cure » en bas de la fenêtre, à côté de Reporter / Valider (et seul en bas pour une séance validée). Jeu de test :
      5 carboplatines validés sans créatinine du jour et 2 doses de trastuzumab au-dessus de la dose calculée (dose de charge en C2)
      seraient signalés. Tests : test-doses 71/71, test_validation 25/25.
- [x] **2.3 ter Fonction rénale pour toutes les molécules** (12/10, repères transmis par Dr Bentahila, en ligne : 20261012e) : **créatinine et DFG
      (Cockcroft-Gault) dans le bloc « Bilan biologique du jour »** pour tous les protocoles (facultatifs, sauf carboplatine où la
      créatinine sert au calcul ; ils ont quitté la rangée poids / surface) ; DFG en rouge et repère écrit sous le bloc ; affichés aussi
      sur la séance validée (instantané). Table `REINS` (moteur/doses.js) : cisplatine (< 45 / 45-59), carboplatine (< 30), méthotrexate
      (< 60), capécitabine (< 30 / 30-50 → 75 %), pémétrexed (< 45), fludarabine et cladribine (< 30 / < 70 → 25-50 %), ifosfamide (< 60,
      MESNA), cyclophosphamide (< 30), oxaliplatine (< 30), étoposide (< 15 / 15-50 → 75 %), bléomycine (< 50), lénalidomide (< 30 /
      30-50) ; noms reconnus avec ou sans accents ni marque. **Fenêtre** pour ces molécules seulement : à la saisie de la créatinine
      et à la validation ; pour les autres molécules, créatinine et DFG facultatifs, **sans fenêtre** (bornes de saisie de la créatinine
      et de la clairance aussi limitées à ces molécules). Seuil d'ifosfamide (< 60) confirmé par Dr Bentahila le 12/10. Tests : test-doses 79/79, test_validation 31/31.
- [x] **2.3 quater Vigilance par molécule** (12/10, demande de Dr Bentahila : « tout d'un coup », fenêtre de confirmation si quelque chose
      cloche ; en ligne : 20261012f) : moteur `public/js/moteur/vigilance.js` (test-vigilance 58/58, test_vigilance 21/21). **Fenêtre à la
      validation** (même fenêtre que les repères, partie « Vigilance par molécule » ; liste gardée dans `fige.vig`) : 1er traitement
      (hépatite B, vaccins vivants, grossesse 12-50 ans) ; **dose cumulée** anthracyclines en équivalent doxorubicine (épirubicine × 0,5,
      Caelyx non compté ; alerte à 80 % puis 100 % de 450 mg/m²) et oxaliplatine (850 mg/m²) ; FEVG (1re anthracycline, anti-HER2 :
      non notée ou > 3 mois, < 50 %, baisse ≥ 10 points) ; 5-FU / capécitabine (uracilémie à la 1re dose, AVK → INR) ; foie (docétaxel,
      paclitaxel, anthracyclines, irinotécan, immunothérapie) ; TSH (immunothérapie, iTK anti-angiogéniques : hors 0,3-5, non notée ou
      > 6 semaines) ; **iTK : DFG à contrôler** si la créatinine du jour n'est pas saisie ; TA ≥ 160/100 et protéinurie (anti-VEGF :
      non notées, ≥ 2 g/24 h ou ++, chirurgie à la 1re dose) ; magnésium (anti-EGFR, cisplatine), RAS (1re dose d'anti-EGFR) ; calcémie
      et bilan dentaire (acide zolédronique, dénosumab) ; pémétrexed (vitamines à la 1re dose, B12 toutes les 3 cures, AINS si
      clairance < 80) ; CDK4/6 (NFS J15 en C1-C2, ECG ribociclib) ; irinotécan (lopéramide) ; bléomycine (EFR) ; vincristine > 2 mg ;
      **radiothérapie en cours** (gemcitabine, 5-FU / capécitabine, cisplatine, cétuximab, témozolomide, mitomycine : une fois par
      radiothérapie). **Bilan du jour élargi** (facultatif) : bilirubine (unité de la créatinine), ASAT, ALAT, magnésium, calcémie
      (mmol/L ou mg/L), TSH, FEVG, TA, protéinurie ; proposés selon les molécules, les autres derrière « + autres examens » ; en
      rouge hors normes sur la séance validée. **Encart « Vigilance »** de la séance : dose cumulée, produits vésicants, notes « À
      vérifier » (Paramètres › Listes et bibliothèques › **Vigilance des molécules**, `parametres/vigilances`, liste de départ `VIG0`
      de 21 familles, modifiable par le médecin), vigilances confirmées. Vincristine plafonnée à 2 mg quand le protocole n'a pas de
      plafond (calcul). Fiche de chimiothérapie : mention « vésicant ». Essai sur le jeu de test : 12 fenêtres sur 18 séances (9 = FEVG
      non notée sous Herceptin, s'arrête dès qu'une FEVG est notée).
- [x] **2.4 Protocoles tracés** (12/10, en ligne le 12/10 : version 20261012b) : **plus d'écrasement** : chaque enregistrement relit son bloc
      (`lib_…`) dans une transaction et n'y remplace que son protocole (ajout, modification, suppression) — choisi à la place d'« un
      document par protocole » (même protection, sans déplacer les 316 protocoles) ; **version** (+1 quand le contenu change), auteur et
      date de modification ; **validation tracée** (`valide` { par, parNom, le, version }, affichée dans la fiche et au survol du badge),
      retirée si le protocole repasse « Non validé » ; **source** (référentiel, article) ; **sans statut = non validé**
      (`protocoleValide` de moteur/doses.js) après un marquage unique « Validé avant le 12/10/2026 » des protocoles sans statut
      (`marquerProtocoles`, au démarrage par un médecin, aussi dans les bibliothèques de référence) ; **modification réservée aux
      médecins** (règle `protocoles` ; tests des règles 11 suites + 2 cas) ; éditeur : **dose maximale, arrondi, « tous les n cycles »,
      « C1 seule », « sauf C1 »** (colonne Options, aussi pour le protocole d'une ligne) ; croix de suppression retirée de la liste,
      « Supprimer le protocole » dans la fiche. Tests : `tests/test_protocoles_trace.py` 9/9, `test_protocoles.py` sans erreur.
      Reste (hors code) : relecture de la bibliothèque à deux et sources de chaque protocole (6.3).
- [x] **2.5 Radiothérapie contrôlée** (12/10, en ligne le 12/10 : version 20261012b) : fenêtre de prescription : 1re séance avant le scanner ou fin
      avant la 1re séance → **refusé** ; dose par fraction **> 22 Gy** ou totale **> 80 Gy** → confirmation ; **dose, fractions, rythme ou
      technique changés après la dosimétrie validée** → « la dosimétrie devra être revalidée » : validation retirée, gardée dans
      `dosiHist` (qui, quand, ancienne → nouvelle prescription), `dosiN` +1 ; un changement sans effet sur la dose (note…) ne touche à
      rien ; **tâches « Valider le contourage / la dosimétrie » maintenues après la 1re séance** (échéance passée : « EN RETARD ») et
      **nouvelle tâche** de dosimétrie après un changement de prescription (`cleDosi`, functions/logique.js) ; **étapes non validées
      gardées en rouge** après la 1re séance (« radiothérapie commencée sans validation », moteur/rt.js `periodeRT` → `retard`) et
      signalées dans « À valider » du tableau de bord ; **« Séances prévues à ce jour »** (calcul de calendrier, bulle : séances
      réelles dans ARIA) ; document Rendez-vous = **« Calendrier théorique des séances »**, état « Prévu », mention « dates calculées /
      ajustées » imprimée ; pli et compte rendu : **mentions « À REMPLIR » / « à compléter » signalées avant l'impression et jamais
      imprimées** ; ligne de signature gardée avec son texte. Tests : `tests/test_rt_controle.py` 13/13, test-logique 98 (2 anciens
      cas adaptés à la décision), accueil, agenda.
- [x] **2.6 Rappel du bilan et alertes cliniques** (12/10, en ligne : version 20261012b) : zone de validation : « Bilan biologique du jour (facultatif) » en
      **G/L** (une valeur en /mm³ est convertie) : PNN, plaquettes, hémoglobine, gardés dans l'instantané (`fige.bio`). **Repères de
      Dr Bentahila (12/10), de simples notifications, le médecin garde la main** : PNN ≥ 1,5 G/L, plaquettes ≥ 100 G/L, hémoglobine
      ≥ 8 g/dL ; perte de poids > 10 % depuis le début de la ligne ; **cisplatine** : DFG ≥ 60 ml/min, 45-59 = zone d'adaptation
      (prudence, réduction possible à 50-70 %), < 45 = contre-indication habituelle, créatinine non saisie signalée (créatinine et
      clairance désormais affichées aussi pour les protocoles avec cisplatine) ; **carboplatine** : < 30 ml/min = contre-indiqué ou
      réévaluation stricte du rapport bénéfice / risque avec réduction massive ; **Calvert** plafonné à 125 ml/min (rappelé sous la
      clairance quand elle dépasse 125). Message à la validation (`verifierValidation`) et groupe **« Alertes cliniques »** du bloc
      « À valider par le médecin » (`alertesCliniques` de v2.js : lignes en cours, cure des 7 prochains jours, dernier bilan). Moteur :
      `REPERES`, `reperesClairance`, `poidsDebut` (moteur/doses.js), `SEUILS_BIO`, `alertesBio` (chimio.js). Jeu de test : 4 pertes de
      poids > 10 % réelles signalées, aucun refus. Tests : test-doses 63/63, test_validation 15/15, test_accueil 20/20.


### Phase 3 – Métier

- [x] **3.1 Fiche tumeur** (12/10, en ligne : 20261012h) : `TUMEUR` (public/js/donnees/catalogue.js, 19 champs, valeurs dans
      `clinique.extra`) : localisation (28 choix), côté, histologie, grade, cTNM, pTNM, stade (0 à IVC, localisé, localement avancé,
      métastatique), date du diagnostic, biomarqueurs, état général OMS 0-4. **Biomarqueurs proposés selon la localisation** (demande de
      Dr Bentahila, `si.xtloc`, `champPropose`) : sein → RE, RP, HER2, Ki-67, PD-L1 ; poumon → PD-L1, EGFR, ALK, KRAS, BRAF ; côlon-rectum →
      HER2, KRAS, BRAF, MSI ; estomac / œsophage → HER2, MSI, PD-L1 ; endomètre → RE, RP, MSI ; mélanome → BRAF, PD-L1 ; etc. ; « Autre » et
      « Primitif inconnu » : tous ; recalculés au choix de la localisation (`ficheSi`). Ajoutés d'office aux cabinets d'oncologie /
      radiothérapie (module chimio ou RT, ou sans formule ; `_onco` de v2.js → `formEffectif`), titre « Fiche tumeur » dans le formulaire ;
      chaque cabinet les retire ou les met en tête (Paramètres › Cabinet › Fiche patient) ; en tête par défaut : localisation, stade, OMS.
      Page Patients : filtres par localisation et par stade (proposés s'il y a des valeurs). Écart avec le plan : listes dans le code
      (catalogue) plutôt que dans `plateforme/specialites` (rien à faire par l'administration ; pas de copie vers les cabinets).
- [x] **3.1 bis Fiche patient sans doublon, en trois parties** (12/10, demandes de Dr Bentahila ; en ligne : 20261012k) : **Diagnostic =
      Localisation** (le champ « Localisation » de la fiche tumeur est retiré ; `diag` s'appelle « Localisation » en oncologie, valeurs
      « Cancer du … » reprises par les comptes rendus) ; liste des localisations complétée : **94 types de cancer** (larynx, oropharynx,
      hypopharynx, cavité buccale, glandes salivaires, thymome, GIST, sarcomes, SNC, hématologie…, anciennes gardées ; `DIAG_AJOUTS_1012`
      ajoutées une fois aux listes déjà réglées, `migrations()`) ; **Précision du diagnostic** (`diagP`, champ à part du catalogue) placée
      après le stade (ex. « métastases ovariennes et péritonéales ») ; **stades** : in situ, localisé, localement avancé, oligométastatique,
      métastatique, récidives (plus de I à IV) ; ordre de la fiche tumeur : localisation, côté, stade, précision, histologie, biomarqueurs,
      grade, cTNM, pTNM, date du diagnostic, OMS ; biomarqueurs selon les familles reconnues dans le diagnostic (`FAMILLES_DIAG`) ;
      **Paramètres › Listes** : « Localisations (diagnostics) », « Stades », « Grades » (médecin). **Allergie** : « Allergie connue » puis
      « Laquelle ? » seulement si « Oui » (« Non » efface le détail). **Fiche en trois parties** : Identité (nom → e-mail), Informations
      médicales (taille, poids, allergie → traitement en cours, champs ajoutés), Fiche tumeur (`repartirFiche` : Modifier, Nouveau patient,
      Afficher ; ordre et champs réglables par cabinet). **Comptes rendus remplis** : diagnostic complet (`diagnosticComplet` : localisation,
      côté, histologie, stade, précision) dans le pli confidentiel, la fiche de chimiothérapie et les courriers ({diagnostic}, et nouveaux
      champs {localisation} {histologie} {stade} {precision} {oms}) ; compte rendu de fin : diagnostic, OMS, localisation (+ côté).
      Ordonnances : **âge et poids réglés séparément** (Paramètres › Impression).
- [x] **3.2 Allergies** (12/10, en ligne : 20261012h) : « Allergie connue : — / Non / Oui » (`clinique.allergie`) avant le détail
      (`clinique.allergies`) ; **seulement si « oui »** : bandeau rouge discret et permanent en tête du dossier (`.al-band`, visible même
      identité repliée sur téléphone), « ALLERGIE : … » sur la fiche de chimiothérapie et sous le nom du patient sur les ordonnances ;
      détail noté sans oui / non : rappel orange discret. Alerte simple (confirmation) dans la fenêtre de prescription si un mot de
      l'allergie (4 lettres et plus) est dans le nom du médicament ou de l'ordonnance type (`allergieDans`, moteur/statut.js), et dans la
      fenêtre de validation d'une chimio (vigilance.js). Ordonnances : âge et poids sous le nom, au choix du cabinet (Paramètres ›
      Impression › Ordonnances, `reglages.impression.agePoids`).
- [x] **3.3 Statut du patient** (12/10, en ligne : 20261012h) : `clinique.statut` (en traitement, en surveillance, perdu de vue, décédé)
      + `clinique.decesLe` (obligatoire pour « décédé ») dans la fiche (Modifier) ; badge dans le dossier et la liste ; **dernières
      nouvelles** calculées (consultations, rendez-vous venus, cures et séances reçues, radiothérapie, décès ; `dernieresNouvelles`) ;
      page Patients : filtre par statut, dont « Sauf décédés ». Décédé : plus de rappels WhatsApp ni d'alertes cliniques, plus de tâches
      automatiques (serveur, logique.js) ; rendez-vous, séances et tâches encore prévus signalés dans la carte « Rendez-vous et tâches à
      venir ». « Supprimer » reste une suppression. Boutons « + Tâche » / « + Rendez-vous » retirés de la carte d'identité (gardés dans
      la carte des rendez-vous). Téléphone : fiche et résumé repliés (bouton « Fiche et résumé »), les onglets remontent.
- [x] **3.4 Consultations** (12/10 ; en ligne : 20261012n) : formulaires **proposés** aux cabinets d'oncologie (`CONSULT_ONCO` du catalogue, ajoutés
      d'office comme la fiche tumeur, réglables dans Paramètres › Cabinet › Formulaire de consultation et dans l'Administration) : **Consultation
      d'oncologie** (`cs: onco` : poids, OMS, douleur EVA, toxicités CTCAE 0-4 : nausées, vomissements, diarrhée, mucite, neuropathie,
      asthénie ; neutropénie fébrile ; conduite à tenir) et **RT hebdomadaire** (`cs: rt` : radiodermite, mucite, dysphagie, diarrhée,
      cystite, asthénie) ; le formulaire suit le **type de consultation** (`formConsult` : « en cours de radiothérapie » → RT ; annonce, RCP,
      note du secrétariat → titre, date, note ; les autres → oncologie) ; bouton **« Formulaire simple »** (type, date, titre, note) / « Tout
      proposer ». **Note signée** sans verrou : « Signée le … par … · modifiée le … et le … » (`modifs`, une par jour et par personne, pas
      l'auteur le jour même, sans anciennes versions). **Notes de la secrétaire** dans le même journal (type « Note du secrétariat » proposé
      d'office). Test : test_consultations34 16/16.
- [x] **3.5 Radiothérapie : volumes et rythmes** (12/10, en ligne : 20261012h) : `r.vol` [{ nom, dose, nb, ty p|seq|int }] : volume
      principal, « + Complément séquentiel » (à la suite, ses fractions s'ajoutent) ou « + Complément intégré » (mêmes séances) ;
      `r.nb` = séances (principal + séquentiels), `r.dose` = dose du principal ; radiothérapies d'avant = un volume (rien à ressaisir, rien
      réécrit) ; pas d'organes à risque. Confirmation > 22 Gy par fraction (chaque volume) ou > 80 Gy (principal + séquentiels, ou
      intégré). **Rythmes** : quotidien, 1 jour sur 2, 2 séances par jour, 1 par semaine (jour de la 1re séance, ou jour ouvré suivant
      s'il est férié), jours choisis (`r.jours`) ; un seul calcul `joursSeances` (moteur/rt.js : fin, séances faites et restantes, calendrier,
      durée du pli) et sa copie serveur (functions/logique.js) ; **test de cohérence** `tests/moteur/test-rt.mjs` (280 prescriptions). Carte
      RT : volumes, séances, rythme. Dosimétrie à revalider si volumes, rythme ou jours changent.
- [x] **3.6 Radiothérapie : compte rendu de fin rempli** (12/10, en ligne : 20261012h) : modèle gardé ; rempli : volumes et doses (3.5),
      nombre de séances et rythme, dates (fin renseignée, sinon calculée), **prochain rendez-vous** (premier rendez-vous prévu après la fin,
      hors consultations hebdomadaires de RT), **bilan de contrôle** (analyses et examens de la dernière consultation, « prescrit le … ») ;
      toxicités, rendez-vous et bilan absents : « à compléter par le médecin » (jamais imprimé, avertissement avant) ; localisation,
      histologie, interruptions non remplies (remplis depuis 3.1 bis : diagnostic complet, localisation et côté). Formulaire « RT
      hebdomadaire » : avec 3.4. Rythmes (3.5) : tous pris en compte pour la fin théorique, jamais de séance le samedi, le dimanche ni un
      jour férié (vérifié par test-rt.mjs).
- [x] **3.7 Chimiothérapie : suivi et ergonomie** (12/10, terminé ; en ligne : 20261012m) : doses cumulées (2.3 quater) ; intention de la ligne
      (ci-dessous) ; **cure d'un seul jour ouverte directement** sur la séance (plus de tableau des jours ; « Fermer ») ; **heure de la
      consultation à côté de la date prévue** (tableau des cures de la ligne et en-tête de la séance, 🩺) ; **un bouton principal par cure**
      (« Valider » pour une cure à faire, sinon « Ouvrir ») **+ menu ⋯** (reporter, annuler, rétablir / annuler la validation ; dans la ligne :
      « Arrêter la ligne », « Supprimer la ligne ») ; **titre « Ligne n — protocole » en double retiré** ; téléphone : cartes. **Non retenus**
      (décision de Dr Bentahila) : doses visibles dès la ligne de cure (tableau trop chargé), réponse au traitement.
- [x] **3.7 (partie) Intention de la ligne et affichage** (12/10, demandes de Dr Bentahila ; en ligne : 20261012l) : à la création d'une ligne,
      après le choix du protocole, **fenêtre « Intention de la ligne »** : néoadjuvante, adjuvante, métastatique (+ **n° de ligne** : 1re, 2e…,
      proposé = la suivante ; palliative = métastatique), concomitante (avec la radiothérapie) ; « Passer » possible ; `L.intent` / `L.rang` ;
      bouton « Intention » dans la ligne pour la changer. **En-tête de ligne** : « ▸ [Métastatique · 2e ligne] Protocole | C2/6 | Prochaine… »
      (plus de « Protocole : », date de début une seule fois). **Téléphone** : cures de la ligne et doses de la séance en cartes (« % dose » et
      « Dose retenue » visibles). Pas de doses dans la ligne (décision : tableau trop chargé).
- [x] **Paramétrage de la fiche à jour** (12/10, demande de Dr Bentahila ; en ligne : 20261012m) : éditeur de la fiche patient (Paramètres ›
      Cabinet › Fiche patient, et le même dans l'Administration : fiche de la spécialité, réglage d'un cabinet) **en trois parties**
      (Identité, Informations médicales, Fiche tumeur), dans l'ordre réel, ↑ ↓ dans la partie ; plus de « nom d'origine » ni « ajouté » ;
      **champs de la fiche tumeur renommables et listes modifiables** (✎ ; stade et grade : Paramètres › Listes) par le cabinet
      (`libs` / `choixs` des champs de la spécialité, `formRetouches`) ; nouveau champ : partie Identité, Informations médicales ou **Fiche
      tumeur** (`tumeur: true`, gardé par le serveur `ficheNettoyee`) ; Administration : fiche tumeur dans la fiche de la spécialité
      d'oncologie (`avecOnco`) ; une fiche de spécialité enregistrée garde les conditions des biomarqueurs (définition du catalogue).
- [x] **Autres demandes du 12/10** (en ligne : 20261012l) : **allergie sur les ordonnances à cocher** (Paramètres › Impression, comme l'âge et
      le poids) ; **État général (OMS) dans les informations médicales**, avant la taille et le poids ; localisations **sans « (sous-type à
      préciser) »** (Cancer du sein, Cancer du poumon, Sarcome ; renommées une fois dans la liste du cabinet et dans les dossiers,
      `DIAG_RENOMS_1012`, `migrations()` + `corrigerListes`) ; **Paramètres › Agenda et rappels › Rendez-vous automatiques** : consultations
      hebdomadaires de RT et consultation de fin de RT décochables (`reglages.auto`) ; **Google Agenda** : case « Consultation de fin de
      radiothérapie » (`rdv:rtfin`) ; **pli confidentiel** : renseignements cliniques = résumé du patient (sinon diagnostic complet), « À REMPLIR
      : résumé du patient (dossier) » sinon ; **modèles des documents de radiothérapie modifiables** (pli, compte rendu de fin, calendrier
      des séances) dans Bibliothèques › Courriers (badge « radiothérapie », champs {…} propres à chaque document, « ↺ » = modèle d'origine ;
      `donnees/modelesrt.js`, `modeleRT`, ids rt-pli / rt-cr / rt-rdv).
- [x] **3.7 bis Heures de la séance de chimio** (12/10, décision de Dr Bentahila ; en ligne : 20261012g) : **deux créneaux** par séance
      (moteur `public/js/moteur/heures.js`, champ `heures` du dossier { "ligne|cure|jour": { cons, seance } }) : **consultation de séance**
      (médecin ou secrétaire : fenêtre « Prochaine séance de chimiothérapie » ouverte à la validation d'une cure ou d'une séance, avant la
      fenêtre de prix ; bouton 🩺 du tableau de la cure ; clic dans l'Agenda) et **séance à l'hôpital de jour** (infirmière : heure et
      durée, depuis son planning ou la cure ; heure proposée = juste après la consultation). **Planning du médecin** (et Google Agenda) :
      la consultation seulement (15 min), **jamais la durée de la chimio** ; **planning de l'infirmière** : sa séance (heure et durée) et la
      consultation choisie par le médecin (non déplaçable par elle). Sans heure du médecin, la consultation se place d'elle-même 15 min
      avant la séance de l'infirmière et la suit (calculée à la lecture, `consultationDe`) ; l'infirmière n'écrase jamais l'heure du
      médecin. Les anciennes heures du planning (AG5) valent séance. Règle : champ `heures` écrit avec le droit planning, traitements
      « modifier » ou « administrer » (infirmière), sans toucher aux dates ; `champsAutorises` réécrit pour lire la fiche du membre une
      seule fois (le serveur limite le nombre d'expressions par écriture ; droit absent = non). Tests : test-heures 18/18,
      test_heure_chimio 20/20, test_agenda 56/56 (adapté), règles 11 suites (test-droits 20 : infirmière permise sur l'heure, refusée sur le
      planning et les lignes).
- [x] **3.7 ter Rendez-vous et tâches à venir : heures et « Modifier »** (12/10, demande de Dr Bentahila ; en ligne : 20261012i) : **plus de
      fenêtre « Prochaine séance » après la validation** (une fenêtre de trop) ; l'heure de consultation se règle depuis le tableau de la
      cure (🩺) ou le bouton **« Modifier »** de « Rendez-vous et tâches à venir » (`chModifierRdvChimio`) : date (droit traitements ou
      planning ; date changée → « cette date seulement » ou « recalculer toute la suite », comme dans la cure) et heure de la consultation ;
      l'infirmière y note sa séance (heure, durée). Heure affichée dans la liste. **Radiothérapie** : scanner et 1re séance modifiables
      (date + heure facultative `scanH` / `debH`, `modifierEtapeRT` ; heure aussi depuis l'Agenda et dans Google Agenda). **Consultation de
      fin de radiothérapie** (`T_RTF` « Fin de radiothérapie », rendez-vous `rtfin` = id de la RT, moteur/rt.js `consultFinRT`) : créée à la
      fin réelle, sinon calculée (si elle est à venir), à chaque enregistrement de la RT et une fois pour les RT en cours (migrations) ;
      suit la fin tant qu'elle n'a pas été déplacée à la main (`d === dO`) ; déplaçable librement comme toute consultation (pas de
      question de décalage) ; **affichée avec la fin de radiothérapie prévue (ou réelle)**, les deux (précision de Dr Bentahila : la
      consultation n'est pas la fin) ; prix proposé 0 DH, modifiable à « Venu ». **1re séance déplacée = début de la radiothérapie déplacé
      dans la prescription** : fin calculée, consultations hebdomadaires et consultation de fin (non déplacée à la main) suivent ; une fin
      saisie à la main est décalée d'autant ; l'heure ne change rien d'autre (en ligne : 20261012j).
      Tests : test_rdv_avenir 21/21, test_heure_chimio 22/22.
- [x] **3.9 Prescriptions et documents** (décisions ; documents déposés : tout en PDF, inchangé) : confirmation avant de retirer une ligne de l'ordonnance en
      préparation ; ⭐ ✎ ✕ seulement en mode « Gérer la liste » ; doublon refusé dans toutes les familles ; **en-tête et pied
      générés** au choix du cabinet (logo du lieu, nom, INPE, signature scannée ; ou papier à en-tête) ; choix du médecin signataire
      quand le cabinet a plusieurs médecins.
      **Fait le 12/10/2026 (20261012s), selon les choix de Dr Bentahila** : pas de confirmation pour retirer une ligne, pas de refus des
      doublons ; ⭐ ✎ ✕ : déjà réservés au médecin (rien à changer) ; Paramètres › Impression › « En-tête des ordonnances et courriers » :
      papier à en-tête (comme avant) ou en-tête et pied imprimés (logo du lieu, nom, spécialité, INPE du signataire ; lieu, adresse,
      téléphone en pied ; signature scannée), avec aperçu dans la fenêtre de l'ordonnance (non enregistré dans le texte) ; « Signée par »
      quand le cabinet a plusieurs médecins (`medUid` sur la ligne) ; carte de chaque médecin `signataires/{uid}` publiée par lui-même
      (règle + `tests/regles/test-signataires.mjs`). Test : `tests/test_ordo_entete.py`.
- [x] **3.10 Paramètres, fin** : onglet WhatsApp replié par message (4 001 px) ; explications longues → bulle « ? » ; croix rouges des
      listes dans un menu ⋯ avec confirmation ; `pageConfiguration` (30 427 caractères) découpée par famille.
      **Fait le 12/10/2026 (20261012t)** : WhatsApp replié (déjà le 11/10) ; explication de plus de 140 caractères → bulle « ? » à côté du
      titre ; retrait d'un élément d'une liste : menu ⋯ puis confirmation ; « Pas des créneaux » retiré de Horaires (durée de chaque type
      dans Types de consultation ; créneaux proposés de la durée du type). **Pas fait, volontairement** : découper `configuration.js` par
      famille (aucun effet visible, risque de casse) : à faire quand ESLint (Q3 bis) vérifiera chaque nom après le découpage.

- [x] **3.11 Dossier patient entièrement réglable** (fait le 12/10/2026, version 20261012p ; voir « Fait » ci-dessous) :
      **Organisation des Paramètres** : une famille « **Dossier patient** » réunit Fiche patient, Formulaires de consultation, Types de
      consultation (3.13) et les listes qui restent (mutuelles, correspondants) ; « Cabinet » garde lieux, tableau de bord, impression,
      journal d'audit, export. Même éditeur dans l'Administration (fiche de la spécialité, réglage d'un cabinet).
      **Listes rangées dans leur champ** : Localisation (94 choix), Stade (8), Grade (6) deviennent des champs « liste de choix » dont la
      liste se règle dans le champ lui-même (✎ → « x choix ») ; retirées de Paramètres › Listes (reprise une fois des listes déjà réglées
      par le cabinet ; un nom corrigé reste corrigé dans les dossiers, comme aujourd'hui).
      **Chaque champ dit ce qu'il est et tout se modifie** (nom, type, liste, partie, imprimé, en-tête, présent, ordre), pour les champs
      d'origine comme pour les champs ajoutés : types texte, texte long, nombre (+ unité), date, liste de choix, oui / non, **oui / non +
      précision** (case à remplir si « oui ») ; exemples : Précision = texte, Antécédents médicaux / familiaux, Mode de vie, Traitement en
      cours = texte long (ou oui / non + précision au choix du cabinet), Allergie = oui / non + « laquelle ». Limites signalées pour les
      champs dont dépendent les calculs (nom, prénom, date de naissance, sexe, taille, poids : type fixe, « utilisé pour les doses »).
      **Fait (12/10/2026)** : famille « Dossier patient » (Fiche patient, Formulaire de consultation, Listes de la fiche) ; « Bibliothèques »
      pour le reste ; ✎ sur chaque champ = nom, type (fixe : raison affichée), liste, unité, partie, imprimé, en-tête ; Localisation /
      Stade / Grade / Mutuelle / Correspondant : « Modifier la liste (N choix) » ouvre la liste du cabinet avec « Retour à la fiche
      patient » (gardée dans Listes, car un nom corrigé y est corrigé dans tous les dossiers) ; Nouveau patient, Modifier, Afficher et
      l'en-tête du dossier rendus par un seul moteur (fichepatient.js) ; Administration : même éditeur, le serveur garde types / parties /
      impression / unités. **Mieux que prévu** : un champ retiré n'est plus dans le formulaire (avant : caché) ; un ancien texte
      d'allergie sans « oui / non » donne « oui » (« Aucune » donne « non ») ; **correction d'une perte de données** : enregistrer la
      chimiothérapie effaçait les champs ajoutés de l'identité et rangeait allergie / statut / fiche tumeur dans `clinique._autres` ;
      corrigé, et les fiches abîmées sont réparées au chargement (titulaire) ; les champs ajoutés de l'identité déjà effacés ne se
      retrouvent que dans une sauvegarde (PITR 7 jours, sauvegarde quotidienne). Test : `tests/test_fiche_donnees.py`.
- [x] **3.12 Formulaires de consultation par type** (fait le 12/10/2026, version 20261012q) : l'éditeur montre **un formulaire par type de formulaire** (Consultation
      d'oncologie, RT hebdomadaire, Simple, + « Nouveau formulaire ») et, pour chaque type de consultation, le formulaire qu'il utilise
      (choisi dans 3.13) ; chaque champ entièrement modifiable comme la fiche patient (3.11) ; un formulaire se duplique pour en faire un
      autre. Remplace la règle fixe `formConsult` (« en cours de radiothérapie » → RT, annonce / RCP / secrétariat → simple, sinon oncologie).
      **Fait** : Paramètres › Dossier patient › Formulaire de consultation = un onglet par formulaire (Consultation d'oncologie, RT
      hebdomadaire, Simple, « + Nouveau formulaire ») avec nom, Dupliquer, Supprimer ; champs communs (type, date, titre, note) puis ceux du
      formulaire (Retirer = de ce formulaire seulement ; « + Ajouter un champ d'un autre formulaire ») ; en bas, le formulaire de chaque type
      de consultation (règle d'avant = valeurs de départ ; « Tous les types : formulaire Simple »). **Mieux que prévu** : un champ peut être
      dans plusieurs formulaires (ex. « Nausées » en oncologie et dans un formulaire « Toxicités ») et garde les mêmes valeurs, comparables
      d'une consultation à l'autre ; une valeur déjà saisie reste affichée même si le type change. Le choix du formulaire par type passera
      dans le référentiel des types (3.13). Même éditeur dans l'Administration (le serveur garde `formulaires` / `typesForm`).
- [x] **3.13 Référentiel unique des types de consultation** (fait le 12/10/2026, version 20261012r) (idée de Dr Bentahila, complétée) : aujourd'hui trois listes séparées (types
      de rendez-vous, activités de chaque établissement, types du journal des consultations). Une seule liste « Types de consultation »
      (Dossier patient, 3.11) : nom, **durée** (remplace « Durée par type de consultation »), **pris en rendez-vous** oui / non (non : chimio,
      RT hebdomadaire, fin de RT, créées d'office), **formulaire** (3.12). Activités et rémunérations affiche chaque type pour chaque
      hôpital (prix vide = non facturé là, ex. pas de consultation de chimio à HCK) ; la prise de rendez-vous ne propose que les types
      « pris en rendez-vous », le journal des consultations tous ; un type ajouté apparaît partout, un type renommé est corrigé partout
      (rendez-vous existants compris). Reprise une fois des activités et des prix actuels, **bilan vérifié avant et après** (test_bilan).
      **Fait** : Paramètres › Dossier patient › **Types de consultation** (`parametres/typesConsult`, moteur `typesconsult.js`) : nom,
      pris en rendez-vous, durée, formulaire, créé d'office (consultations hebdomadaires et de fin de radiothérapie : l'ancienne rubrique
      « Rendez-vous créés automatiquement » y est intégrée, l'ancienne adresse y mène). **Tout est relié** à cette liste : prise de
      rendez-vous, journal des consultations, durée (agenda, créneaux), formulaire de chaque type (les deux écrans modifient le même
      réglage), messages WhatsApp (un message par type, fin de radiothérapie comprise), Google Agenda (« ce qui y apparaît » : un choix
      par type, et la couleur ne dépend plus du nom : clé `tk` dans chaque événement), Activités et rémunérations (chaque type dans chaque
      lieu, « non facturé ici » sans prix), noms affichés partout (bilan compris). Renommer : l'ancien nom est gardé (`anciens`) et les
      rendez-vous et consultations déjà enregistrés s'affichent sous le nouveau nom, sans réécrire les dossiers ni changer leur auteur.
      Rien à reprendre : la liste de départ est construite depuis les activités et les types d'avant ; durées, formulaires, créés
      d'office et prix restent à leur place (bilan inchangé). Choix fait : un type est proposé dans tous les lieux (sans prix = non
      facturé ici) ; la secrétaire règle les durées. Limite : un type ajouté renommé change la case Google Agenda personnelle de ce type
      (à recocher). Test : `tests/test_types_consult.py`, `node tests/moteur/test-typesconsult.mjs`.
- [x] **3.14 Chimiothérapie : « Ouvrir » d'abord, « Valider » depuis la séance** (corrections demandées le 12/10, après 3.7 ; fait, en ligne : 20261012o) : bouton
      principal **« Ouvrir »** partout (cure de la ligne, jour de la cure) ; « Valider », « Reporter », « Annuler » dans le menu ⋯. Cure
      d'un seul jour : « Ouvrir » affiche directement la séance (un seul bouton « Fermer », le doublon retiré) ; cure de plusieurs jours :
      « Ouvrir » affiche les jours (J1, J8…), chaque jour avec « Ouvrir » (⋯ : Valider, Reporter, Annuler) ; on vérifie le protocole, on
      remplit le poids, la créatinine, le bilan, puis on valide depuis la séance ouverte.


### Phase 3 (suite) et Phase 4 – Design
- [x] **3.15 Corrections signalées le 12/10/2026** (faites le 12/10/2026, 20261012t ; test `tests/test_salle_315.py`) :
      a) ~~Salle d'attente : l'heure des consultations de chimio ne s'affiche pas~~ : la ligne prend l'heure de la consultation (`hc`) ;
      b) ~~la consultation de fin de radiothérapie n'apparaît pas~~ : elle y était, mais sous le nom « Contrôle » ; affichée « Fin de RT » ;
      c) ~~une consultation de contrôle réapparaît après suppression~~ : c'était la consultation de fin de RT (créée d'office), recréée à
         chaque modification de la radiothérapie ; une consultation créée d'office supprimée reste notée « supprimée » (`st: "supprime"`,
         invisible partout) et n'est plus recréée (de même pour les consultations hebdomadaires de RT) ;
      d) ~~Chimio › Nouvelle ligne et Protocoles : choisir un « Type de cancer » faisait « recharger » la page~~ : corrigé le 12/10/2026
         (20261012p) : plantage de **Safari** (« un problème récurrent est survenu », Firefox sans souci) quand un menu déroulant est
         retiré pendant son propre « change » ; la mise à jour se fait maintenant juste après (menu fermé), et seuls les menus et la
         liste changent (plus toute la fenêtre / la page).
- [x] **3.16 Agenda : un clic sur un rendez-vous = Fermer · Ouvrir le dossier · Modifier / décaler** (fait le 12/10/2026, 20261012s ; décisions : consultation = elle seule ; fin de RT prévue = surtout l'heure, une autre date devient la fin prévue et la consultation de fin suit ; glisser vers un autre jour = la même fenêtre) (demande du 12/10/2026, plan) :
      aujourd'hui, une séance de chimio ou un rendez-vous de radiothérapie ouvre directement la fenêtre de l'heure ; désormais la même
      fenêtre pour tout (consultation, séance de chimio, scanner, 1re séance, fin de radiothérapie prévue, consultations en cours et de fin
      de radiothérapie). « Modifier / décaler » : heure seule → enregistrée sans question ; **date changée → question** sur ce qui suit :
      chimio = « cette cure seulement » ou « décaler aussi les cures suivantes » (même règle que « Modifier » du dossier, 3.7 ter) ;
      1re séance de RT = toute la radiothérapie suit (fin prévue, consultations hebdomadaires, consultation de fin) ; fin de RT prévue =
      la consultation de fin suit (si elle n'a pas été déplacée à la main) ; consultation prévue = « elle seule » ou « aussi les
      consultations prévues après » (même écart). Glisser-déposer (21) : même question quand le jour change.
- [x] **3.13 bis Types de consultation : colonnes plus claires** (fait le 12/10/2026, 20261012s : « Comment il est prévu », « Créneau du lieu (30 min) », « Utilisé par » dans Formulaire de consultation, bulles « ? ») (questions de Dr Bentahila du 12/10/2026, plan) :
      a) « Rendez-vous » → **« Comment il est prévu »** : *À la main* (proposé à la prise de rendez-vous), *D'office* (consultation de
      chimiothérapie avec la cure, consultations en cours / fin de radiothérapie avec la RT), *À la main et d'office*, *Sans rendez-vous*
      (journal seulement : RCP, note du secrétariat) ; tous sont des rendez-vous dans l'agenda, la colonne dit seulement d'où ils viennent ;
      b) Durée « pas du lieu » → **« Créneau du lieu (30 min) »** avec la valeur réelle (pas des créneaux réglé dans Horaires) ;
      c) Formulaire : retirer « Formulaire de chaque type » du bas de Formulaire de consultation (doublon) ; à la place, sur chaque onglet de
      formulaire, « Utilisé par : … » avec un lien vers Types de consultation ;
      d) « Créé d'office » fusionné dans a) ; une infobulle (?) sur chaque en-tête de colonne.
- [x] **4.3 Un seul langage visuel** : 8 tailles de police au lieu de 24 ; les 180 couleurs écrites en dur → variables ; un seul jeu
      d'icônes ; page d'administration au même style qu'Onco360 ; barre du haut (recherche en pilule, cloche et avatar, ancienne 20.5).
      **Fait le 12/10/2026 (20261012t)** : 8 tailles de texte (`--t1` 11 px … `--t8` 26 px ; 253 remplacements ; gardées : avatars, flèches,
      grands chiffres) ; couleurs en dur 257 → 74 (variables, quasi-doublons fusionnés, fonds verts « fait » gardés) ; icônes dessinées à la
      place des émojis à l'écran (Google Agenda garde ses émojis) ; Administration avec les variables et tailles d'Onco360 ; recherche de
      patient en pilule dans la barre du haut (nom, n° de dossier, téléphone ; ordinateur et tablette). Tests `test_recherche_tete.py`,
      `test_debordement.py` (28 pages × 5 largeurs).


---

## Annexe – Organisation d'Onco360 (décidé par Dr Bentahila le 10/10/2026) : qui gère quoi
**Tout se gère depuis le compte d'administration** (gbentahila@hotmail.fr, page `admin.html`). Le **cabinet du Dr Bentahila est un
cabinet comme les autres** : ce qu'elle y fait ne change rien pour les autres cabinets ni pour ce que reçoivent les nouveaux.
Vocabulaire (le même partout, dans l'application, la feuille de route et les guides) :
- **Cabinet** : l'espace d'un médecin titulaire et de son équipe (ses patients, ses réglages, sa copie des bibliothèques).
- **Équipe** : les comptes d'un cabinet (médecins, secrétaires, infirmières, comptables), créés par le **titulaire** dans
  Paramètres › Accès (compte créé par le serveur ; mot de passe choisi par la personne avec l'e-mail de Firebase, souvent dans
  les indésirables, ou avec le **lien du mot de passe** que le titulaire lui envoie par WhatsApp). Limites selon la formule.
- **Module** : une partie de l'application (Chimiothérapie, Radiothérapie, Agenda, Salle d'attente, Tâches, RCP, Prescriptions,
  Documents, Google Agenda, Listes, Bilan…). **Le code est le même pour tous** : une modification d'un module (ex. « modifie le
  module Bilan ») s'applique, dès sa mise en ligne, à **tous les cabinets actifs** qui ont ce module dans leur formule.
- **Formule** : ce à quoi un cabinet a droit (modules + nombre maximum de comptes, lieux, dossiers), par spécialité ; réglée par
  l'administration (onglet Formules, et « Formule et modules » de chaque cabinet).
- **Bibliothèque de référence** : par spécialité (aujourd'hui **Oncologie – Radiothérapie** ; plus tard Médecine générale,
  Gynécologie…), ce que reçoit **un nouveau cabinet** : protocoles de chimiothérapie, médicaments (Médic.), examens complémentaires,
  ordonnances types, analyses et bilans, courriers, documentation (Doc.), diagnostics et mutuelles, jours fériés, tarifs de
  radiothérapie. **Mise de côté** : modifiée **seulement depuis l'administration** (onglet Bibliothèques › « Ouvrir et modifier »,
  avec les écrans habituels d'Onco360 : ajouter, modifier, supprimer). Chaque cabinet reçoit **sa copie** à la création, puis la
  modifie comme il veut (ça ne change que son cabinet). Les cabinets déjà créés ne reçoivent pas les modifications ultérieures.
  Les **paramètres de base** de la spécialité y sont aussi (depuis le 10/10) : créneaux et horaires, jours fériés, messages
  WhatsApp, couleurs de Google Agenda, types de documents et de tâches, tâches automatiques (confiées au titulaire), jours et heure
  de RCP, diagnostics et mutuelles, marges d'impression, alertes, tarifs de radiothérapie. **Jamais** : correspondants, prix des
  consultations, absences, lieux d'exercice, équipe, patients. Repris **une fois** du cabinet du Dr Bentahila le 10/10, puis
  indépendants de son cabinet.
- **Menu par spécialité** : toujours présents pour toutes les spécialités (selon la formule) : Tableau de bord, Agenda /
  Rendez-vous, Salle d'attente, Patients, Tâches, Paramètres, Bilan, Profil ; propres à une spécialité : **Protocoles** et
  Radiothérapie (Oncologie – Radiothérapie) ; plus tard pour la médecine générale par exemple **Traitements et stocks**, **Matériel
  et consommables**… Onglet **« Modules et menus »** de l'Administration : chaque module, sa spécialité, ce qu'il ajoute au menu,
  ses formules, le nombre de cabinets qui l'ont.
- **Une modification d'un module** (ex. « modifie le module Tâches ») se répercute sur **tous les cabinets actifs qui l'ont**,
  dès la mise en ligne (un seul code pour tous).
- **Cabinet de démonstration** : patients fictifs, pour les démonstrations et les guides.
