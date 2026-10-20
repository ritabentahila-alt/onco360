# Onco360 – feuille de route (plan refait le 20/10/2026 d'après les audits n° 10 et 11)

**Un seul plan** : ce fichier. En haut, **le plan du 20/10/2026** (ce qui reste, dans l'ordre) avec les réponses de Dr Bentahila aux audits
n° 10 et 11 ; en bas, **l'ancien plan (13/10 et 18/10) et tout ce qui est fait**, gardés tels quels (rien n'est retiré : chaque étape non
faite de l'ancien plan a sa place dans le nouveau, voir « Correspondance »). Copie entière d'avant ce changement :
`archives/FEUILLE-DE-ROUTE-jusqu-au-2026-10-20.md` (avant : `…-jusqu-au-2026-10-13.md`, `…-jusqu-au-2026-10-11.md`). Journal : `JOURNAL.md`.

Sources du 20/10 : **« Audit n° 10 – Bilan d'Onco360 et décisions à prendre »** (62 décisions numérotées « d. 1 » à « d. 62 ») et **« Audit n° 11 –
facilité d'utilisation »** (questions U1 à U24, V1 à V7, O1 à O6), avec les réponses de Dr Bentahila. Copie dans `archives/audits-10-11/` (`.docx`
d'origine et texte lisible `audit-10-avec-reponses.md`, `audit-11-avec-reponses.md` : **relire la partie de l'audit au début de chaque étape**,
le détail, les chiffres et les noms de protocoles y sont). Aucune donnée réelle (jeu fictif).
Sources plus anciennes : audits n° 1 à 3 (Drive › Audit, `archives/audit-3/`), audits n° 4 à 8 (`archives/audits-4-a-8/`).
**Audit n° 9 (radiothérapie, 19/10) : pas fait, décision du 20/10** (« on ne fait pas l'audit n° 9 » ; lots RT-1 à RT-6 refusés, d. 4 et 5).

## Comment on travaille
- **Vérifier tout ce qu'un changement touche (consigne du 17/10/2026)** : avant de livrer, vérifier que le changement ne touche que ce qui
  est visé. S'il touche autre chose (paramétrage, agenda, salle d'attente, Google Agenda, tableau de bord, bilan, droits, impression, tâches
  automatiques, Administration…), vérifier que tout cela marche encore, **avec un test**. Toujours sur ordinateur **et** sur téléphone
  (390 px). Les modules doivent s'imbriquer : un même fait (rendez-vous déplacé, séance validée, poids saisi) est juste **partout** où il
  apparaît. Liste de contrôle (carte des liens, § 1 de l'audit du 17/10) :
  - *Un rendez-vous* (créé, déplacé, reporté, annulé, Venu, Non venu) → dossier (à venir, passé), agenda (toutes les vues, glisser-déposer),
    salle d'attente, tableau de bord, créneaux et chevauchements, Google Agenda de chaque personne concernée, WhatsApp (confirmation,
    rappels), prix et bilan, tâches automatiques.
  - *Une séance ou une cure de chimio* (date, heure, report, validation, poids) → cure et jour, fiche chimio, agenda, salle, Google Agenda,
    consultations de chimio et créneaux, honoraires et bilan, alertes cliniques, poids de la fiche, planning de l'infirmière.
  - *Une radiothérapie* (prescription, étapes, fin) → consultations hebdomadaires et de fin, tâches fixes, agenda, Google Agenda, documents
    de RT, bilan (lieu de la RT), droit « radiothérapie : chimio ».
  - *La fiche patient* → bandeau et colonne Patient du dossier, Modifier, Afficher, Nouveau patient, impressions (âge, poids, allergie),
    champs des courriers, export, fiche de la spécialité dans l'Administration.
  - *Un paramètre ou une bibliothèque du cabinet* → les écrans qui le lisent, la secrétaire (droit « secrétariat »), le modèle de la
    spécialité dans l'Administration, les cabinets neufs, l'export.
  - *Un protocole de la bibliothèque* (20/10) → fiche de chimio, séances créées (agenda, salle, créneaux), vigilance, ordonnances liées, modèle
    des cabinets neufs, **patients déjà sous ce protocole** (leur ligne garde sa copie : à vérifier à la main et à signaler).
  - *Les droits ou une règle Firestore* → `tests/regles` (`npm test`), chaque rôle (médecin, secrétaire, infirmière, comptable), Google
    Agenda (fonction `permis`).
- **Une étape = une session**, dans l'ordre. Au début : lire ce fichier (et la partie de l'audit de l'étape) ; à la fin : cocher, noter les
  décisions, une ligne dans `JOURNAL.md`.
- Plusieurs sessions en parallèle : chacune annonce son étape ici (« en cours : session X ») et n'écrit que ses fichiers.
- Avant toute mise en ligne : `bash outils/avant-mise-en-ligne.sh --navigateur` (+ `--regles` si les règles changent), téléphone
  390 px sans débordement, accord de Dr Bentahila ; mise en ligne depuis une copie propre du dernier enregistrement.
  **(20/10, d. 6) Contrôle complet à chaque mise en ligne, même quand c'est pressé** : trois mises en ligne du 20/10 (20261020e WhatsApp,
  20261020i rapprochement retiré, réglage en miroir) sont parties sans lui. Si Dr Bentahila demande d'aller vite : le dire, lancer le contrôle
  en arrière-plan, et ne mettre en ligne qu'une fois bon. Un contrôle arrêté = pas de mise en ligne.
- **(20/10, d. 8) Aucun test laissé rouge** : un test qui échoue est réparé dans la session, ou retiré avec la raison écrite ici. Un test
  toujours rouge n'alerte plus personne.
- Un bug signalé = un test qui le reproduit (Q1) ; check-list d'impact à chaque nouvelle notion (Q4) ; une seule source par notion (Q5) ;
  après chaque mise en ligne, 3 vérifications pour Dr Bentahila (« ouvrez X, cliquez Y, vous devez voir Z ») (Q9).
- Code enregistré et poussé sur GitHub à la fin de chaque étape testée. Ce qui arrive en cours de route va dans « À placer ».
- **Ce qui est refusé n'est jamais reproposé** (liste cumulée en bas du plan, « Refusé – ne pas reproposer »).

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
- (17/10) **Ne jamais bloquer un médecin** : avertissements d'un clic, aucun motif obligatoire, partout (pas seulement en chimio).
- (17/10) **Rien ne disparaît** : quand une disposition change, chaque bouton, onglet, champ et fenêtre d'aujourd'hui reste accessible ;
  seule sa place change. Thème Onco360 actuel (variables de v2.html, Arial, composants existants) : aucune nouvelle couleur, aucun nouveau
  style de bouton.
- (17/10) Bilan : une correction voulue est **chiffrée avant et après sur le jeu de référence (352 317 DH)** et annoncée avant la mise en ligne.
  (20/10, d. 7 : le jeu de référence devient un **jeu fictif figé** ; le chiffre de référence sera celui de ce jeu, étape S7.)
- (17/10) Les photos envoyées par le cabinet (ticket d'encaissement, calendrier de radiothérapie ARIA) montrent de vrais patients : **seule
  leur mise en page est reprise**, jamais dans le dépôt.
- (17/10) Les particularités marocaines (CNSS, mutuelles, Solumedrol, Nivestim, arabe classique…) **ne sont pas des erreurs**.
- (20/10) **La bibliothèque du cabinet Bentahila est la référence** : chaque défaut part dans chaque cabinet neuf ; on corrige d'abord chez
  elle, puis on recopie le modèle (Administration › Par spécialité › Modèle des cabinets neufs, étape 1).
- (20/10) Le poste de travail principal est **l'ordinateur** (O2 : Dr Bentahila et sa secrétaire) : les étapes « téléphone » passent après.

## Questions et vérifications en attente (Claude les rappelle en début de session)
**À vérifier par Dr Bentahila, sans rien coder** (audit 10, « À reprendre ») :
- [ ] Comparer l'heure d'arrivée affichée en salle d'attente avec l'heure de son téléphone (heure du Maroc, étape S1).
- [ ] Mercredi 21/10 au matin : le premier relevé du comptable préparé la nuit (2 h 45) est-il là ?
- [ ] Lundi 26/10 : le premier export de la semaine (dimanche 25/10, 1 h 30) est-il dans Paramètres › Export des données et dans son Drive ?

**Questions** :
1. (11/10, toujours ouverte ; **bloque T6**) Mesurer la hauteur des en-têtes du papier (ordonnance A5, A4, documents) pour régler les marges
   (Paramètres › Impression).
2. (11/10, toujours ouverte) GitHub : demander la purge des copies en cache ; regarder Insights › Traffic › « Git clones ».
3. (20/10, d. 36 : **réponse de Dr Bentahila à confirmer**) Elle pensait que seul Firebase nomme l'administrateur. **Vérifié dans les règles le
   20/10** : son compte de tous les jours (ritabentahila@gmail.com) peut écrire la liste des administrateurs depuis le navigateur
   (`firestore.rules`, `match /administrateurs/{uid}` : `allow write: if proprietaire()`, et `proprietaire()` = cette adresse). Le compte
   d'administration a bien son autre adresse et son autre mot de passe, mais quelqu'un qui volerait le mot de passe de tous les jours (session
   restée ouverte sur un poste de clinique) pourrait **se nommer administrateur lui-même**. La correction (L6 a) ne change rien pour elle :
   elle continue de nommer l'administrateur dans la console Firebase. **Conseil : oui.** À confirmer d'un mot au début de L6.
4. (20/10, d. 15) Le reçu : Dr Bentahila demande de retirer la phrase, absente du reçu de Cheikh Khalifa qu'elle a envoyé (d'après son souvenir ;
   la photo n'est jamais dans le dépôt). Compris ainsi : retirer la mention « Acte exonéré de TVA » et la phrase « à valider par le comptable du
   cabinet » (étape T6). **À confirmer avec la photo au début de T6** (elle la remontre ; on compare mention par mention).
5. (20/10, O4) Prix des packs : « mettre plutôt les mêmes prix que GestiCab ou DabaDoc, prix marocains » (étape L10 : relevé des prix, puis
   proposition).

Questions répondues le 20/10 : question 6 du 17/10 (d. 12 : chaque autre cabinet reçoit **tout le modèle, sauf les correspondants et les tarifs
des consultations** — c'est déjà le réglage par défaut d'« Appliquer le modèle », rien à coder) ; question 8 du 17/10 (d. 13 : reçu imprimé sans
numéro = une ligne au journal du cabinet, **déjà fait** en R-B5) ; NOCAND = fluconazole (d. 3 : **juste**, confirmé par Dr Bentahila).

## Réponses à deux questions de Dr Bentahila (20/10)
**« L'export est trop cher : comment baisser le coût ? l'enlever ? le proposer seulement au cabinet du Dr Bentahila ? »**
Le chiffre de l'audit est un maximum : environ **1,6 dollar par mois pour un cabinet de 1 000 dossiers** (environ 16 DH, à comparer aux packs
de 690 à 2 990 DH), parce que chaque ZIP de la semaine renvoie **tous** les PDF déjà envoyés. Conseil : **ne pas l'enlever** (c'est la seule
copie hors du projet Firebase : si le projet était perdu, sauvegardes et copie des fichiers partiraient avec lui), mais **n'envoyer chaque
semaine que les données et les PDF nouveaux** (étape L8) : le coût tombe à quelques centimes par cabinet. Il reste réglable par cabinet
(case « actif », déjà là) : un cabinet client peut l'arrêter s'il fait ses propres copies. Le garder pour son seul cabinet ferait perdre aux
cabinets clients la protection décidée le 17/10.

**« Si je change un jour pour un hébergement au Maroc (Maroc Telecom…), comment ça se passe, il faut tout changer ? »**
Pas tout. Ce qui reste : les calculs (`public/js/moteur/` : doses, cures, bilan, RT…), les écrans, l'impression, les bibliothèques, le contenu.
Ce qui change : tout ce que Google fournit aujourd'hui : la connexion (Firebase Auth), la base (Firestore), les fichiers (Cloud Storage), les
fonctions du serveur et leurs horaires de nuit, et surtout **les règles de sécurité**, qui deviennent du code sur le serveur. Ce sont des
semaines de sessions, puis une recopie des données (l'export complet sert déjà à cela). Deux conseils :
1. **Préparer sans rien déménager** : rassembler tous les appels à Firebase dans un seul fichier « accès aux données » (étape 5.8). Le jour où
   l'on change, on ne réécrit que ce fichier et le serveur, pas les 15 000 lignes des écrans. Cela sert aussi la cession (un acheteur peut
   vouloir son propre hébergement).
2. **Vérifier avant que ce soit obligatoire** : la loi 09-08 permet en principe un hébergement à l'étranger avec une autorisation de la CNDP ;
   la loi 05-20 et les groupes de cliniques peuvent pousser vers le Maroc. Une seule question à un juriste (question 2 de sa fiche, audit 10)
   évite peut-être des semaines de travail. (Ce n'est pas un avis juridique : Claude n'est pas juriste.)

---

# LE PLAN DU 20/10/2026 (ce qui reste, dans l'ordre)

| Phase | But | Étapes | Quand |
|---|---|---|---|
| **S** Soins et sécurité | Doses, bibliothèque, heure, tests, exercice de récupération | S1 à S8 | cette semaine (court, avant tout le reste) |
| **T** Tous les jours | Facilité d'utilisation (audit 11) et impressions (audit 10) | T1 à T7 | ensuite (ordinateur d'abord) |
| **L** Lancement | Ce qu'il faut avant le premier cabinet ami : erreurs, import, guide, Administration, sécurité, coûts | L1 à L11 | avant le 1er cabinet ami |
| **D / E** Design, code, charge | Accessibilité, fenêtres Onco360, vitesse, 5 000 dossiers, code | 4.1, 4.2, 5.1 à 5.8 | ensuite |
| **C** Conformité | Juriste, société, projet et domaine, hébergement | 0.5, 6.1 à 6.6 | plus tard (décidé le 20/10) ; société, projet et domaine avant le 1er client **payant** |
| **V** Vente et cession | Abonnement d'abord, preuves d'usage, dossier de cession préparé en avance | V-a à V-d, 7.1 à 7.4 | en avance, sans projet de vente immédiat |

**Premier cabinet** (d. 16, 17, 20, O1) : le gel 0.5 est **levé pour des confrères amis qui testent** (pilote gratuit d'un mois, peut-être gratuit
pour toujours, un point chaque semaine) ; juriste **après** l'essai chez 2 ou 3 médecins. **Date pas fixée** : Dr Bentahila pense devoir d'abord
passer à un hébergeur marocain et demander l'autorisation de la CNDP (O1 ; voir la réponse ci-dessus : à faire confirmer avant de déménager).
Avant le **premier client payant** : société éditrice, projet Firebase et nom de domaine à son nom (d. 18).

### Correspondance avec l'ancien plan (13/10 et 18/10, gardé en bas)
| Ancienne étape | Devient |
|---|---|
| R-A1 à R-G (sauf R-F1) | faites (détail en bas) |
| R-F1 exercice chronométré | **S8** (d. 9) |
| P0 (2 défauts de l'audit 2) | **S3** (d. 1) ; correspondance classeur ↔ bibliothèque : faite en pratique par P1a et P4 (vraie bibliothèque du 13 et du 18/10) |
| P1 écran « Corrections proposées » | **abandonné** (d. 10 : appliqué sans fenêtre le 13/10, ordres 1 à 3 faits) |
| Q-a jeu fictif, Q-b ESLint, Q-f test_cabinets | **S7** (d. 7, 8) |
| Q-c journal des erreurs | **L1** (d. 21) |
| Q-d contrôle des dossiers au chargement | **L5** |
| Q-e CSP appliquée | **L7** (d. 43) |
| 3.8 écran de l'infirmière | **abandonné** (d. 11 ; « Marquer administrée » reste) |
| 4.4 dossier stable | **fait** : remplacé par le lot R-G (19/10) |
| 4.1 toucher et contraste | **4.1** (d. 54, contenu de l'audit 10) |
| 4.2 fenêtres Onco360 | **4.2** (152 fenêtres grises au 20/10) |
| 5.1, 5.2, 5.4, 5.5, 5.6 | inchangées (phase E) ; 5.3 complétée (d. 23 à 25 : photos et nuit passent en L4) |
| 0.5, 6.1 à 6.6 | phase C, **plus tard** (d. 16, 17, 62, O1) |
| 7.1 à 7.4 | phase V, **préparées en avance** (d. 61) |
| À placer : test_comptable | **S7** ; heure du Maroc : **S1** (la note de l'ancien « À placer » croyait l'inverse : c'est le serveur à jour qui a raison) |

## Phase S – Soins et sécurité (cette semaine)
- [ ] **S1 Heure du Maroc** (d. 2 ; audit 10, « À reprendre » et « Méthode › Heure »). Le Maroc est à **GMT depuis le 20/09/2026** (décret
      n° 2.26.530) ; les navigateurs et Node pas à jour (données horaires 2025b) donnent encore GMT+1 pour `Africa/Casablanca` : arrivée et attente en
      salle, « à jour à », Visa accueil du reçu, créneau « maintenant », changement de jour (`nouveauJour` à 23 h au lieu de minuit) faux d'une heure.
      Rendez-vous et Google Agenda non touchés. **Réponse de Dr Bentahila : oui, mais suivre les changements d'heure marocains (plusieurs dans
      l'année).** Solution : Onco360 ne demande plus l'heure du Maroc à l'ordinateur ; il la calcule **lui-même** depuis l'heure universelle
      corrigée (`maintenant()`, écart serveur) et une **table des changements d'heure du Maroc** : liste de périodes { du, au, décalage } (GMT par
      défaut ; GMT+1 ou autre pendant une période décidée par le gouvernement), **une seule source** dans le moteur (`public/js/moteur/heure.js`,
      recopiée dans `functions/site/` comme les autres, vérifiée par test), complétée sans programmer par l'Administration (petit écran « Heure
      du Maroc » : ajouter une période ; `plateforme/heureMaroc`, lu au démarrage, la table du code sert si la lecture échoue). Remplacer
      partout `timeZone: "Africa/Casablanca"` / `heureMaroc` / `hm` (salle.js, v2.js, recus, documents, serveur : exports, relevé, tâches de nuit).
      Tests : heure d'arrivée, attente, Visa accueil, « maintenant » des créneaux, passage à minuit, une période GMT+1 ajoutée (ex. Ramadan),
      serveur (`functions/test-*.js`). Corriger la note « Heure du Maroc » de l'ancien « À placer ».
- [ ] **S2 Bibliothèque : le danger** (d. 26, 27, 29 ; audit 10, « Bibliothèque › À corriger tout de suite »). (1) Les **5 protocoles où un anticorps
      est prescrit deux fois le même jour** : mFOLFOX6 + Herceptin, FOLFIRI + Trastuzumab 6 puis 4 mg/kg, Paclitaxel 80 + Trastuzumab hebdomadaires,
      Paclitaxel 80 + Cétuximab hebdomadaires (ERBITAX), TPEx : dose de charge à **C1 J1 seulement** (6 mg/kg trastuzumab, 4 mg/kg trastuzumab
      hebdo, 400 mg/m² cétuximab), puis la dose d'entretien à chaque injection ; plus de ligne à J29 hors du cycle ; « C1 seule » / « sauf C1 » mis
      dans les champs que le calcul lit (option `cmax` / C1, P3), pas en remarque ; retrait du diffuseur une seule fois. Vérifier sur la **vraie
      bibliothèque** du cabinet (lecture seule d'abord : elle a pu changer depuis le 18/10). (2) **Patients déjà sous ces 5 protocoles** : leur
      ligne garde sa copie → liste (numéro de dossier, ligne, cures à venir) montrée à Dr Bentahila, qui corrige à la main ; rien n'est changé
      tout seul dans une ligne prescrite. (3) « KEYNOTE-A18 – phase 2 » passé « Validé » (d. 27). (4) « Letrozole 2,5mg ou Fulvesteant +
      Palbociclib 125mg (Ibrance) + Zometa » séparé en deux protocoles (létrozole ; fulvestrant), « Fulvestrant » bien écrit (d. 29). Une fois,
      à l'ouverture par un médecin (comme `appliquerP4`, drapeau dans `parametres/migrations`), chez elle puis dans le modèle. Vérifier : fiche de
      chimio (page 2 de mFOLFOX6 + Herceptin), séances créées (plus de « C3 J29 » dans l'agenda, la salle, les créneaux), test-audit3p4.
- [ ] **S3 P0 et doses** (d. 1, 44, 45). (1) Fenêtre « carboplatine contre-indiqué » affichée **deux fois** (créatinine 70 mg/L) : une seule. (2)
      Créatinine aberrante (0,7 mg/L) signalée **dès la saisie**, pas seulement à la validation (confirmation « bonne unité ? » existante). (3)
      **Décimales** (d. 44) : 0,1 mg pour vincristine d'EMA-CO, trabectédine, dactinomycine, lurbinectédine, vinblastine (VeIP) ; le moteur applique
      les décimales réglées sur la ligne **aussi aux doses en mg/kg** (aujourd'hui seulement mg/m² : défaut du moteur). (4) **Créatinine sous
      7 mg/L avant un carboplatine** (d. 45) : avertissement d'un clic (« clairance sans doute surestimée ; avec 7 mg/L : … mg »), **sans changer le
      calcul**. Tests d'abord : test-doses (79), test-vigilance ; cas de l'audit (femme de 80 ans, 45 kg, créatinine 4 mg/L).
- [ ] **S4 Bibliothèque : harmonisation** (d. 28, 30 à 34 ; audit 10, « À harmoniser » et « Médicaments »). Chaque changement vérifié sur la
      source du protocole (**recherche en ligne dans la session**, source notée dans le journal de la session) :
      (1) **5-FU en diffuseur** : partout la **dose totale du diffuseur** dans la ligne, la dose par jour en remarque (11 protocoles : TPF, EXTREME,
      KEYNOTE-048…). (2) **Solumedrol de J1 avec le carboplatine : 80 mg** (règle du 13/10), sauf les protocoles hebdomadaires (21 protocoles, dont
      MITO-7 et KEYNOTE-355). (3) **Acide folinique** (« oui si c'est la référence, vérifie ») : la dose de **l'essai de référence** de chaque
      protocole — 400 mg/m² pour mFOLFOX6, FOLFIRI, LV5FU2 simplifié ; 200 mg/m² là où l'essai le dit (FOLFOX4, FLOT, FOLFOXIRI) ; les 14 protocoles
      à 50 mg fixe (pratique eviQ) passent à la dose de leur référence. (4) **Vinorelbine** de « Cisplatine 20 + Vinorelbine 15 hebdomadaire + RT » :
      la dose de l'essai cité (15 ou 10 mg/m², vérifiée en ligne, le nom corrigé si c'est 10). (5) **Immunothérapies** : durée maximale **selon
      l'indication** écrite en remarque (ex. pembrolizumab 2 ans en métastatique, 1 an en adjuvant), rien de bloqué (36 protocoles sur 58).
      (6) **ZOMETA** : créatinine avant chaque perfusion, dose selon la clairance, bilan dentaire, calcium et vitamine D (comme XGEVA) ;
      **NAUSELIUM** : durée maximale de la dompéridone (7 jours, EMA 2014) ; selon les recommandations. Même passage unique qu'en S2 ; puis
      modèle recopié (étape 1 de l'Administration, à faire par Dr Bentahila). Tests : test-audit3p4, test_audit3.
- [ ] **S5 Vigilance et interactions** (d. 47, 48 ; audit 10, « Seuils, vigilances et interactions »). (1) Interactions ajoutées : vinca-alcaloïdes +
      azolés ; taxanes et irinotécan + inhibiteurs ou inducteurs du CYP3A4 ; tamoxifène + paroxétine, fluoxétine, bupropion ; pémétrexed + AINS si
      clairance < 80 ml/min ; 5-FU ou capécitabine + brivudine (contre-indication absolue). (2) Rein : topotécan (dose réduite sous 40 ml/min) et
      acide zolédronique (sorti des prémédications). (3) Trabectédine : albumine ≥ 25 g/L et clairance ≥ 30 ml/min. (4) **« Aussi dans le
      paramétrage »** (réponse de Dr Bentahila) : les interactions deviennent une liste du cabinet modifiable dans Paramètres › Bibliothèques ›
      Vigilance des molécules (« Interactions » : médicament A, médicament B, message, gravité), liste de départ dans le code (`moteur/p10.js` lit la
      liste du cabinet, sinon celle de départ ; `parametres/interactions`, médecin seulement, règle et test), mise à jour sans écrasement (comme
      `bibmaj.js`). (5) **Épirubicine à 0,8 doxorubicine** (« oui selon la recommandation internationale » : Feijen 2019, repris par les
      recommandations de cardio-oncologie de l'ESC 2022 — à vérifier dans la session) et ajout des autres anthracyclines du même tableau
      (daunorubicine, idarubicine, mitoxantrone) à la dose cumulée. Les interactions restent lues dans le texte libre de la fiche (d. 46 : **pas**
      de liste à choisir). Tests : test-p10, test-vigilance, test_p10.
- [ ] **S6 Contrôle automatique de la bibliothèque** (d. 35) : le contrôle de l'audit 10 (même molécule deux fois le même jour, dose hors des bornes
      usuelles, ligne au-delà du cycle, protocole sans statut « Validé », source vide, doublon de nom, hormonothérapies incompatibles ensemble)
      écrit une fois dans le moteur (`moteur/controleProto.js`, test) et lancé **à chaque enregistrement d'un protocole** et **avant chaque copie
      vers le modèle** (Administration, étape 1) : avertissement d'un clic (« 2 points à vérifier : … — Enregistrer quand même »), jamais bloquant.
- [ ] **S7 Tests fiables** (d. 7, 8 ; ancien Q-a, Q-b, Q-f ; audit 10, « Code et tests pour la cession »). (1) **Jeu fictif pour tous les tests**
      (`functions/demo.js` étendu : patients, cures, RT, rendez-vous, montants, sur 3 ans ; `tests/base.py`, `tests/mkseed.mjs`) : plus aucun test ne
      lit `tests/seed.json` ; test-bilan, test-salle, test-releve et les 71 tests du navigateur passent sur une copie propre du dépôt. **Nouveau
      chiffre de référence du bilan** = celui du jeu fictif figé (noté ici et dans CLAUDE.md ; l'ancien 352 317 DH gardé pour mémoire). Contrôle
      automatique : aucun nom du jeu réel dans `tests/`, `functions/`, `public/`. (2) **Tests rouges** : test_comptable (6 échecs : le réglage du
      pack du jeu de test retire `bilan.comptable` ; revoir le test, pas l'application), test_cabinets (2 depuis le 11/10 : « Statistiques en
      premier », « Listes en premier »), test-demo (plante quand la bibliothèque n'a pas un protocole attendu, `functions/demo.js` ligne 24 : le
      cabinet de démonstration plante de la même façon → le corriger aussi). (3) **ESLint** (variables inconnues, doubles déclarations ; il passe
      déjà) dans `avant-mise-en-ligne.sh`. (4) Le contrôle complet tourne sur une copie propre sans `seed.json`.
- [ ] **S8 Exercice de récupération chronométré** (d. 9 ; ancien R-F1) : dans le **cabinet de démonstration**, un dossier effacé exprès, que
      **Dr Bentahila récupère seule** (Paramètres › Cabinet › Export des données › Récupérer des données, ou mode d'emploi
      `guide/en-cas-de-probleme.md`), en moins d'une heure ; Claude ne fait que chronométrer et noter ce qui bloque. Résultat dans le registre des
      exercices (`outils/RESTAURER.md` § 8) ; ce qui a gêné corrigé dans le mode d'emploi.

## Phase T – Tous les jours (audit 11, facilité d'utilisation ; impressions de l'audit 10)
Ce qui ne change pas (décisions du 12/10 et du 17/10) : « Ouvrir » reste le bouton principal de chaque cure ; Valider, Reporter, Annuler restent
dans ⋯ ; Afficher, Journal, Modifier restent visibles ; aucune consultation créée d'office ; rien n'est créé tout seul.
- [ ] **T1 Prescrire une ligne de chimio** (U2, U3, U4, U7 ; audit 11, « Prescrire »). (1) **Recherche** : les protocoles dont le nom **commence**
      par le mot cherché passent en premier (« EC » : EC d'abord, puis le reste ; même tri dans la page Protocoles et dans « Nouvelle ligne »).
      (2) **Intention** (néoadjuvante, adjuvante…) choisie **dans le même écran** que le nombre de cures et la date (plus de fenêtre à part ; la
      fenêtre « Avant la ligne » pour les mesures manquantes reste). (3) **Nombre de cures propre à chaque protocole** (« selon les
      recommandations ») : champ du protocole (éditeur), pré-rempli d'après le nom (« × 4 ») ou la référence, rempli pour la bibliothèque par
      Claude d'après les sources (S4 en même temps si possible) ; sans valeur : 6 comme aujourd'hui ; toujours modifiable. (4) **Après « Créer la
      ligne »** : une petite fenêtre propose la suite (fiche de chimio pour la prise en charge, ordonnances du protocole `orProtocole`, heure de C1
      `fenetreHeureSeance`), chaque bouton facultatif, « Plus tard » ferme. **Pas** de liste filtrée par localisation (U1 : non, la localisation
      n'est pas toujours remplie) ; **pas** de dose en mg avant la création (U5 : non) ; **tableau d'édition gardé tel quel** (U6 : non).
- [ ] **T2 Valider une cure, reporter** (U8, U13, d. 53, U10). (1) **« Ouvrir » va directement au jour à faire** (aujourd'hui ou en retard) pour une
      cure en plusieurs jours (J1, J15) ; le tableau des jours reste à un clic. (2) **« Cures à valider »** du tableau de bord ouvre **directement
      la cure à valider** (2 gestes au lieu de 4 ; d. 53). (3) **Report** (U13) : nouvelle date comparée aux fériés, au week-end et aux absences du
      médecin → avertissement d'un clic, rien de bloqué (`chReporter`, même contrôle que les rendez-vous). (4) Téléphone (U10, après le reste,
      O2 = ordinateur) : la même barre fixée en bas que sur ordinateur (date, Ordonnances, Reporter, Valider). **Pas** de rappel des doses à côté
      de Valider (U9 : non) ; **pas** de cures reçues repliées (U11 : non) ; **pas** de deux groupes aujourd'hui / en retard (U12 : non).
- [ ] **T3 Rendez-vous** (U14, U17). (1) Sous la date : boutons **« dans 1 sem. · 2 sem. · 1 mois · 3 mois · 6 mois »** (date calculée, puis
      contrôles habituels : férié, absence, horaires). (2) Avant toute recherche, la liste des patients montre **les patients vus aujourd'hui en
      tête** (à 5 000 dossiers : seulement eux et les résultats de la recherche, avec 5.3). **Pas** de « Prochains créneaux libres » (U15 : non),
      « Déjà ce jour-là, sans heure » gardé tel quel (U16 : non), **pas** de bouton « Prochain RDV » dans la salle (U18 : non).
- [ ] **T4 Dossier patient** (U20, U21, U22). (1) « Rendez-vous et tâches à venir » : **les 5 prochains**, puis « Voir tout » (rien ne disparaît).
      (2) Sur un élément de chimio de la colonne Patient : **« Consultation : venu »** à la place de « Venu », et à côté un bouton **« Séance »** qui
      ouvre la cure. (3) Téléphone (après le reste) : **ce qui était décidé le 17/10** et ne se voit pas : bandeau réduit (nom, âge, allergie), barre
      d'actions **d'une ligne qui défile de côté** (aujourd'hui 3 lignes, 138 px) ; rien de plus. Le dossier s'ouvre toujours comme aujourd'hui
      (U19 : non).
- [ ] **T5 Salle d'attente et tableau de bord** (U23, U24). (1) Salle : le **nom du patient n'est jamais coupé** (sur deux lignes s'il le faut) ; la
      mutuelle et le motif cèdent la place. (2) Tableau de bord, carte « Aujourd'hui » : **consultations et chimio d'abord, puis la radiothérapie**,
      **sans la plier** (réponse de Dr Bentahila : « sans plier la radiothérapie »).
- [ ] **T6 Impressions** (d. 14, 15, 49, 50, 51, 52 ; audit 10, « Tout ce qui s'imprime » ; **question 1 avant**). (1) **Fiche de chimio** (A4
      paysage, `fiche.js`) : nom du patient et titres des colonnes **répétés en haut de chaque page**. (2) **Reçu toujours sur une seule feuille A5**
      même avec toutes les mentions (« réduire la police ou autre ») : taille du texte et espacements réduits jusqu'à tenir, mesuré comme les
      ordonnances (`mesurer`), jamais de passage en A4. (3) **Jamais « À compléter » imprimé** (certificats, courriers après « Imprimer quand
      même ») : la zone imprimée vide, comme les documents de RT ; téléphone du pied sur une ligne. (4) **Ordonnance A5** : marges latérales à
      **15 mm** avec l'en-tête généré (aujourd'hui 28 mm), après la mesure du papier à en-tête (question 1). (5) **Calendrier de fin de RT** : la
      ligne du bas « Dates des séances intermédiaires établies d'après le calendrier… » **retirée** (d. 14 : « juste pour envoyer à la CNSS pour
      fermer le dossier » ; `documents.js`, `note_calendrier`). (6) **Reçu** (d. 15, question 4) : mention « Acte exonéré de TVA » et phrase « à valider
      par le comptable du cabinet » retirées (case `rTva` de Paramètres › Impression, `htmlRecu` de v2.js) ; plus d'étape « faire valider par le
      comptable ». Tests : PDF comptés (pages), test_recu, test_calendrier_rt, test_ordonnances_e.
- [ ] **T7 Messages en arabe** (d. 56 ; audit 10, « Messages en arabe ») : les 3 retouches de la séance de chimio (« آخر تحاليل الدم », « الأدوية التي
      وُصفت لكم قبل الحصة », « مشكلة … قبل الحضور ») dans `WA_AR` et, une fois, dans les messages du cabinet qui ont encore le texte de départ ;
      **avertissement dans Paramètres › WhatsApp** quand le français d'un message a changé sans l'arabe (« le français a changé, l'arabe n'est
      plus sa traduction »).

## Phase L – Lancement : avant le premier cabinet ami
- [ ] **L1 Journal des erreurs en ligne** (d. 21 ; ancien Q-c) + **page « État de la plateforme »** (d. 41). Erreurs JavaScript des utilisateurs
      notées **sans donnée patient** (message, fichier, ligne, page, version, rôle, cabinet ; jamais un nom ni un contenu), regroupées, limitées par
      jour ; Administration › État de la plateforme : dernière nuit de chaque traitement (tâches automatiques, Google Agenda, relevé du comptable,
      copie des fichiers, exports), échecs, dernier export de chaque cabinet, refus de Google Agenda, erreurs du jour.
- [ ] **L2 Import des patients par fichier Excel** (d. 19) : Paramètres › Cabinet › « Importer des patients » (titulaire) : modèle Excel à
      télécharger (identité, CIN, téléphone, mutuelle, diagnostic, n° de dossier d'origine), aperçu ligne par ligne (erreurs, doublons de nom +
      naissance), import, compte rendu ; n° de dossier Onco360 attribué comme d'habitude, ancien numéro gardé dans la fiche. SheetJS déjà dans
      `vendor/`. Test sur un fichier fictif.
- [ ] **L3 Guide de démarrage** (d. 22) : 2 pages pour le médecin, 2 pour la secrétaire, illustrées avec le **cabinet de démonstration** (jamais un
      vrai patient) ; dans `guide/` et dans Onco360 (aide).
- [ ] **L4 Photos à part et nuit par cabinet** (d. 23, 24 ; partie de 5.3). (1) **Photos des patients dans Cloud Storage** (environ 50 Ko chacune,
      chargées aujourd'hui à chaque ouverture) : lues seulement à l'ouverture du dossier ; reprise des photos existantes une fois ; export et
      récupération à jour. (2) **Traitements de nuit un cabinet à la fois** (tâches automatiques, Google Agenda, relevé, exports), dossiers lus par
      paquets de quelques centaines ; un cabinet en échec n'arrête pas les autres (noté dans L1).
- [ ] **L5 Contrôle des dossiers au chargement** (ancien Q-d) : champs mal rangés, rendez-vous orphelins, dates impossibles → réparés ou signalés ;
      test « aller-retour » : un dossier enregistré puis relu ne perd aucun champ.
- [ ] **L6 Administration et sécurité entre cabinets** (d. 36, 38, 39, 40, 42 ; audit 10, « Administration » et « Sécurité entre cabinets »).
      (a) **Si d. 36 confirmé** (question 3) : la liste des administrateurs n'est plus écrite depuis le navigateur (console seulement) ; le compte
      de tous les jours ne lit plus que les profils **de son équipe** (aujourd'hui : profil de tout utilisateur, de tout cabinet : INPE, IF, TP,
      ICE) ; identité reconnue par l'**identifiant du compte**, plus par l'adresse e-mail (`proprietaire()`). Tests de règles. (b) Le titulaire est
      **prévenu** (tableau de bord et journal de son cabinet) chaque fois que l'Administration écrit chez lui (d. 38). (c) **Cabinet suspendu =
      lecture seule et export permis** (d. 39). (d) **Suppression d'un cabinet** : export final remis au médecin, puis **30 jours** avant
      l'effacement (annulable pendant ce temps) (d. 40). (e) **Ajout d'un membre** : messages neutres (ne plus dire qu'une adresse est celle d'un
      administrateur, d'un titulaire ou d'un membre d'un autre cabinet) ; la personne déjà inscrite ailleurs **accepte l'invitation** avant d'entrer
      (d. 42). (f) Fiche de chaque cabinet : **état du démarrage** (profil, lieu, tarifs, équipe, Google Agenda, export), sans donnée médicale.
      **Pas** de double vérification sur le compte d'administration (d. 37 : non).
- [ ] **L7 Sécurité du site** (d. 43, 57, 59 ; ancien Q-e). (1) **CSP appliquée** (en observation depuis le 11/10 ; code écrit dans les pages
      retiré ou permis par empreinte) + **politique des permissions** (caméra, micro… refusés). (2) **mammoth 1.11.0** (faille CVE-2025-11849
      corrigée) dans `vendor/`. (3) Clé web de Firebase **limitée à l'adresse du site** dans la console Google (fait par Dr Bentahila, Claude donne
      les clics). (4) Case **« Poste partagé »** à la connexion (d. 57 : oui, rare) : session fermée avec le navigateur, sur ce poste seulement ;
      sans la case, rien ne change (jamais de déconnexion automatique). **Pas** de mots de passe de 10 caractères ni de protection contre la
      recherche des adresses (d. 58 : non).
- [ ] **L8 Coûts** (d. 60 ; réponse ci-dessus). (1) **Export de la semaine qui n'envoie que le nouveau** : données (petites) chaque semaine, PDF
      seulement ceux ajoutés depuis le dernier export réussi (le Drive garde les anciens ; liste des fichiers déjà envoyés dans `exportsAuto/{e}`) ;
      récupération et restauration toujours possibles depuis le Drive (test). (2) **Alerte de budget Google** (par exemple 20 dollars par mois,
      console Google Cloud : Claude donne les clics). (3) Regarder dans la console : images des fonctions (Artifact Registry), journaux.
- [ ] **L9 Registre d'usage** (V5) : chaque mois, par cabinet, **sans aucune donnée de patient** : cabinet actif, nombre de dossiers, de cures
      validées, de consultations, de membres ; écrit par le serveur (`plateforme/usage/{AAAA-MM}`), lu par l'Administration ; dès le 1er cabinet ami.
- [ ] **L10 Prix des packs au prix marocain** (O4). Relevé des prix publics de GestiCab, DabaDoc et autres logiciels médicaux marocains (recherche
      en ligne, sources notées), proposition de nouveaux prix à Dr Bentahila, puis `PRIX0` (`functions/facturation.js` = `public/js/donnees/
      facturation.js`) et fiches des packs. Pilote gratuit (d. 20) : mode « gratuit » de la facturation (déjà là).
- [ ] **L11 Répétition générale chronométrée** (audit 10, « Plan d'action ») dans le cabinet de démonstration : création du cabinet, import d'un
      fichier fictif (L2), premier patient, cure validée, reçu, export, récupération (S8) ; puis le « jour J » écrit pas à pas pour le pilote
      (1 h en visio : modèle recopié juste avant, carte « Bienvenue », export vers son Drive, messages WhatsApp, marges, patient d'essai créé puis
      supprimé) et la première semaine (journal des erreurs lu chaque jour, « Écart au modèle », premier export vérifié, un point).

## Phase D / E – Design, code, montée en charge (ensuite)
- [ ] **4.1 Accessibilité** (d. 54 ; audit 10, « Accessibilité et confort »), sans changer la disposition : **contrastes** (pastille orange de la
      cloche, badges verts des protocoles et de la salle comme R-C6, gris clair des cartes, dates passées de la RCP → 4,5 pour 1) ; **étiquettes**
      des champs (horaires des Paramètres, filtres du Bilan, menus en cascade des Protocoles, filtre de Patients) ; **zones de 44 px** sur téléphone
      (dossier, RCP) ; **lignes cliquables utilisables au clavier** (tableau de bord, agenda, Protocoles) ; contour visible au clavier dans la salle.
      Test axe-core dans le contrôle. (Ancienne 4.1 : téléphone du patient en lien, champs de fichier habillés, filtres repliés sur téléphone.)
- [ ] **4.2 Fenêtres Onco360 à la place des boîtes grises** : 152 au 20/10 (45 alertes, 103 confirmations, 4 saisies ; 47 dans l'Administration,
      dont la suppression d'un cabinet par une saisie grise) ; par lots : chimio et vigilance d'abord (« Valider quand même ? »), rendez-vous (hors
      horaires, férié, absence), Administration, le reste. Une fenêtre commune (déjà : `question()` d'ordonnances.js) ; plus aucune nouvelle boîte
      grise (vérifié par le contrôle : compte qui ne doit pas monter).
- [ ] **5.7 Code en un seul fichier gardé en cache** (d. 55 ; audit 10, « Vitesse de chargement ») : 65 fichiers revérifiés à chaque ouverture
      (« no-cache ») → un fichier construit à la mise en ligne, dont le nom change à chaque version, gardé en cache jusqu'à la suivante ; ouverture
      suivante sous la seconde même en 4G lente ; **plus de numéro de version `v2.js?v=…` à changer à la main**. Le code source reste en fichiers
      séparés (tests inchangés).
- [ ] **5.3 Montée en charge** (d. 25, avant qu'un cabinet dépasse 1 500 dossiers ; photos et nuit : L4) : index léger des patients (nom, n° de
      dossier, statut, diagnostic, prochain rendez-vous) dans des documents à part ; liste des patients par pages, recherche dans l'index ; dossier
      complet chargé à son ouverture ; salle, agenda, tableau de bord : seulement les résumés de la période affichée ; liste de « Nouveau
      rendez-vous » sur recherche ; cases « Payé » par mois au-delà de 70 % ; bilan lu depuis l'index (R-D4) ; **test de charge** dans le contrôle
      (5 000 dossiers fictifs dans l'émulateur, ouverture en moins de 5 s).
- [ ] **5.1 Code mort et fonctions communes** (14 fonctions globales et 10 exports jamais appelés, dont `chHon`, `chValiderSeance`, `migrerV1`) :
      voir l'ancienne 5.1 en bas.
- [ ] **5.2 Écritures qui s'écrasent** : réglages et listes encore écrits sans relecture → transaction (voir l'ancienne 5.2).
- [ ] **5.4 Restes de l'ancienne application** (dont l'impôt de 10 % des hospitalisations v1 laissé par R-D3) : voir l'ancienne 5.4.
- [ ] **5.5 Recette et mise en ligne** : projet Firebase de recette ; script unique ; SDK Firebase du site 10.12.2 → version actuelle ; App Check.
- [ ] **5.6 Application installable et hors ligne** (voir l'ancienne 5.6).
- [ ] **5.8 (nouveau, proposé par Claude le 20/10) Accès aux données en un seul endroit** : tous les appels à Firebase (lectures, écritures,
      écoutes, fichiers, fonctions) rassemblés dans un fichier (`js/app/acces.js`), les écrans ne parlent plus qu'à lui. Prépare un hébergement au
      Maroc (réponse ci-dessus) et la cession ; sous les tests, par morceaux (un module à la fois), aucun changement visible.

## Phase C – Conformité (plus tard, décidé le 20/10/2026)
- [ ] **0.5 Fiche d'incident** (ancienne application lisible sans connexion jusqu'au 11/10, 57 patients ; dépôt public les 10 et 11/10 ; question 2) :
      à rédiger avec le juriste. **Gel levé pour des confrères amis qui testent** (d. 16) ; cabinet de démonstration toujours permis.
- [ ] **6.1 Juriste** : **après l'essai chez 2 ou 3 médecins** (d. 17), avec la fiche prête de l'audit 10 (« Fiche pour le juriste », 11 questions) ;
      la question 2 (hébergement en Belgique, ou au Maroc ?) **à poser avant de décider un déménagement** (O1). Autorisation CNDP de son propre
      cabinet (d. 62) : plus tard.
- [ ] **6.2 Qualification** (dispositif médical, loi 84-12 ; question 7 de la fiche).
- [ ] **6.3 Contenus** (voir l'ancienne 6.3).
- [ ] **6.4 Société** (d. 18 : avant le 1er client payant) ; la chaîne des droits (autrice, compte Claude prêté au début, code écrit avec une IA,
      preuve de date) **n'est pas préparée avec le juriste** (V7 : non).
- [ ] **6.5 Projet neutre** (d. 18) : projet Firebase et nom de domaine au nom de la société (l'adresse chimio-hgc.web.app porte le nom de l'hôpital ;
      le lien du premier mot de passe y renvoie) ; vérification de l'application par Google (Agenda, Drive) avec la politique de confidentialité ;
      hébergement au Maroc si le juriste le demande (5.8 d'abord).
- [ ] **6.6 Test d'intrusion** par un prestataire externe.

## Phase V – Vente et cession (préparées en avance, d. 61 : « pour l'instant pas de projet de vendre »)
- [x] **V-a Cible** (V1, V2, 20/10) : d'abord les oncologues et radiothérapeutes en cabinet, **en abonnement** ; les groupes de cliniques (Akdital,
      Oncorad…) seulement après quelques cabinets payants, cadre légal en place. Rien à coder.
- [x] **V-b Indépendance** (V3, 20/10) : **aucun financement ni parrainage d'un laboratoire pharmaceutique**. Rien à coder.
- [x] **V-c Éditeur marocain** (V4, 20/10) : Dr Bentahila préfère **une vente** à une licence avec pourcentage. Rien à coder.
- [ ] **V-d Qui vend et répond au support** (V6 : oui ; O5 : « il faudrait que j'embauche quelqu'un ») : avant le 1er client payant, contrat écrit
      avec la société, sans droit sur le logiciel sauf accord écrit.
- Ordre de préparation de la cession (d. 61) : jeu fictif (S7) → **7.1** README et installation sur un projet vierge en moins de 30 min → **7.2**
  mise en forme automatique en une fois (697 lignes de plus de 300 caractères) puis découpage de `v2.js` et `configuration.js` → **7.4** rapport de
  couverture joint au dossier ; **7.3** guides (le guide de démarrage L3 en est le début). Licences : jszip choisi en MIT par écrit. Détail des
  anciennes 7.1 à 7.4 en bas.

## Plus tard, sur demande
- Export de la semaine vers un autre support que Google Drive (OneDrive, Dropbox) : à la demande d'un cabinet client.
- Audits d'autres écrans (Paramètres, Bilan, ordonnances, radiothérapie, poste de l'infirmière) et d'autres appareils (Safari, tablette) : « oui,
  plus tard » (O6).
- Priorité 4 des protocoles (64 : lymphomes, trophoblastique…) : plus tard (13/10).
- Gelé, plus tard si un client le demande : voir « Gelé, plus tard, annulé » de l'ancien plan en bas (Gynécologie, pharmacie, HL7 / FHIR…).

## Refusé – ne pas reproposer (liste cumulée)
- **20/10/2026 (audits 10 et 11)** : tout l'**audit n° 9** (radiothérapie : lot RT-1 « séances reçues, motif d'arrêt, compteur, 1re séance un jour
  férié » (d. 4), lots RT-2 à RT-6, bibliothèque de contraintes de dose (d. 5)) ; écran « Corrections proposées » P1 (d. 10) ; écran de
  l'infirmière 3.8 (d. 11) ; ligne de protection du calendrier de fin de RT (d. 14 : retirée) ; validation du reçu par le comptable (d. 15) ;
  juriste cette semaine (d. 17 : après les essais) ; double vérification du compte d'administration (d. 37) ; traitements en cours choisis dans
  une liste (d. 46) ; mots de passe de 10 caractères et protection contre la recherche des adresses (d. 58) ; autorisation CNDP vérifiée
  maintenant (d. 62 : plus tard) ; liste de protocoles filtrée par la localisation (U1) ; dose en mg avant de créer la ligne (U5) ; résumé à la
  place du tableau d'édition des molécules (U6) ; rappel des doses à côté de Valider (U9) ; cures reçues repliées (U11) ; « Cures à valider » en
  deux groupes (U12) ; « Prochains créneaux libres » (U15) ; nombre au lieu de la liste « Déjà ce jour-là, sans heure » (U16) ; bouton « Prochain
  RDV » de la salle (U18) ; onglet d'ouverture du dossier selon le jour (U19) ; radiothérapie repliée sur le tableau de bord (U24) ; licence avec
  pourcentage plutôt que vente (V4) ; chaîne des droits préparée avec le juriste (V7).
- **19/10** : « Prescrire chimio / RT » dans la barre du bas du dossier (rendus à leurs onglets).
- **18 au 20/10** : rapprochement des règlements (les cliniques paient des mois après l'acte) ; alerte à chaque export.
- **17/10** : déplacement automatique des consultations de RT un jour férié ; calendrier imprimable de chimio ; fauteuils / hôpital de jour ;
  toute la « caisse » (caisse du jour, clôture, registre, impayés, total du jour) ; avertissement « stupéfiant » ; remplacement de COTIPRED ;
  NIVESTIM / NEUPOGEN alignés ; bilans intercure enrichis ; double vérification à la connexion ; code-barres sur le reçu ; passage automatique
  en A4 ; menu « … » pour Afficher, Journal, Modifier ; consultation créée d'office.
- **13/10** : relecture par un deuxième oncologue ; double contrôle avant préparation ; WhatsApp envoyé tout seul (3.17) ; format du papier
  choisi tout seul (3.18) ; case « EMEND prescrit » ; mention « hors référentiel » ; fenêtre pour les corrections de l'audit ; motif pour
  « Valider quand même » ; contrôle automatique des prémédications.
- **12/10** : « Valider » sorti du menu ⋯ de la cure (« Ouvrir » reste le bouton principal).
- **11/10** : déconnexion automatique ; double authentification ; Google Agenda sans nom ; archivage des patients ; original Word ou Excel
  gardé ; organes à risque ; tableau des toxicités de RT ; journal des séances de RT (ARIA fait foi). (Avant) : pointer en lot dans le Bilan ;
  alerte de poids de la secrétaire (19.6) ; assistant IA ; rappels WhatsApp automatiques ; commande pharmacie J−1 ; relevé mensuel ;
  téléconsultation.

## Décisions de Dr Bentahila du 20/10/2026 (audits n° 10 et 11), une par ligne
| N° | Proposition (résumé) | Réponse | Étape |
|---|---|---|---|
| d. 1 | P0 : deux défauts de l'audit 2 | oui | S3 |
| d. 2 | Heure du Maroc calculée par Onco360 | oui, **en suivant les changements d'heure marocains** | S1 |
| d. 3 | NOCAND = fluconazole | oui (juste) | — |
| d. 4 | Audit 9, lot RT-1 | **non** (audit 9 pas fait) | refusé |
| d. 5 | Contraintes de dose (audit 9) | non | refusé |
| d. 6 | Contrôle complet avant chaque mise en ligne | oui | Comment on travaille |
| d. 7 | Tests sur jeu fictif seulement | oui | S7 |
| d. 8 | Réparer les tests rouges | oui | S7 |
| d. 9 | Exercice R-F1 | oui | S8 |
| d. 10 | Abandonner P1 | oui | abandonné |
| d. 11 | Abandonner 3.8 | oui | abandonné |
| d. 12 | Question 6 : tout le modèle sauf correspondants et tarifs | oui | déjà le réglage |
| d. 13 | Question 8 : ligne au journal | oui | déjà fait |
| d. 14 | Garder la ligne du calendrier de fin de RT | **non, l'enlever** (c'est pour la CNSS) | T6 |
| d. 15 | Faire valider le reçu par le comptable | **enlever la phrase** (absente du reçu de Cheikh Khalifa) | T6, question 4 |
| d. 16 | Aucun cabinet réel avant le juriste | **non** (des amis pour tester) | phase C |
| d. 17 | Juriste cette semaine | **non, après l'essai chez 2 ou 3 médecins** | 6.1 |
| d. 18 | Société, projet, domaine avant le 1er client | oui | 6.4, 6.5 |
| d. 19 | Import Excel | oui | L2 |
| d. 20 | Pilote gratuit d'un mois | oui, **voire gratuit tout le temps** | L10, L11 |
| d. 21 | Journal des erreurs | oui | L1 |
| d. 22 | Guide de démarrage | oui | L3 |
| d. 23 | Photos à part | oui | L4 |
| d. 24 | Nuit cabinet par cabinet | oui | L4 |
| d. 25 | 5.3 avant 1 500 dossiers | oui | 5.3 |
| d. 26 | 5 protocoles à anticorps en double | oui | S2 |
| d. 27 | KEYNOTE-A18 phase 2 validé | oui | S2 |
| d. 28 | 5-FU : dose totale du diffuseur | oui | S4 |
| d. 29 | Létrozole / fulvestrant séparés | oui | S2 |
| d. 30 | Solumedrol 80 mg avec le carboplatine | oui | S4 |
| d. 31 | Acide folinique 400 mg/m² | **oui si c'est la référence (vérifier en ligne)** | S4 |
| d. 32 | Vinorelbine 15 ou 10 | **vérifier en ligne** | S4 |
| d. 33 | Durée maximale des immunothérapies | oui, **selon l'indication** | S4 |
| d. 34 | ZOMETA, NAUSELIUM | oui, **selon les recommandations** | S4 |
| d. 35 | Contrôle automatique de la bibliothèque | oui | S6 |
| d. 36 | Liste des administrateurs : console seulement | **question** (voir question 3) | L6 a |
| d. 37 | Double vérification du compte d'administration | non | refusé |
| d. 38 | Titulaire prévenu des écritures de l'Administration | oui | L6 b |
| d. 39 | Cabinet suspendu en lecture seule | oui | L6 c |
| d. 40 | Suppression : export + 30 jours | oui | L6 d |
| d. 41 | État de la plateforme | oui | L1 |
| d. 42 | Ajout d'un membre neutre + invitation | oui | L6 e |
| d. 43 | CSP appliquée + permissions | oui | L7 |
| d. 44 | Décimales (5 lignes, mg/kg) | oui | S3 |
| d. 45 | Créatinine < 7 mg/L avant carboplatine | oui | S3 |
| d. 46 | Traitements en cours choisis dans une liste | non | refusé |
| d. 47 | Interactions manquantes | oui, **aussi dans le paramétrage** | S5 |
| d. 48 | Épirubicine 0,8 | oui, **selon la recommandation internationale** | S5 |
| d. 49 | Fiche de chimio : en-tête répété | oui | T6 |
| d. 50 | Reçu sur une seule feuille A5 | oui, **réduire la police si besoin** | T6 |
| d. 51 | Jamais « À compléter » imprimé | oui | T6 |
| d. 52 | Marges A5 à 15 mm | oui (après la mesure du papier) | T6 |
| d. 53 | « Cures à valider » ouvre la cure | oui | T2 |
| d. 54 | Étape 4.1 maintenant | oui | 4.1 |
| d. 55 | Code en un seul fichier en cache | oui | 5.7 |
| d. 56 | Arabe : 3 retouches + avertissement | oui | T7 |
| d. 57 | Case « poste partagé » | oui (rare) | L7 |
| d. 58 | Mots de passe 10 caractères | non | refusé |
| d. 59 | mammoth 1.11, clé web limitée | oui | L7 |
| d. 60 | Alerte de budget, export du nouveau seulement | oui (+ question sur le coût, réponse ci-dessus) | L8 |
| d. 61 | Préparer la cession dans l'ordre | oui, **en avance, pas de projet de vente pour l'instant** | phase V |
| d. 62 | Autorisation CNDP de son cabinet maintenant | **plus tard** | 6.1 |
| U1 | Liste filtrée par localisation | non (localisation pas toujours remplie) | refusé |
| U2 | Nom qui commence par le mot cherché en premier | oui | T1 |
| U3 | Intention dans le même écran | oui | T1 |
| U4 | Nombre de cures par protocole | oui, **selon les recommandations** | T1 |
| U5 | Dose en mg avant de créer la ligne | non | refusé |
| U6 | Résumé à la place du tableau d'édition | non | refusé |
| U7 | Suite proposée après « Créer la ligne » | oui | T1 |
| U8 | « Ouvrir » va au jour à faire | oui | T2 |
| U9 | Doses rappelées à côté de Valider | non | refusé |
| U10 | Barre fixée en bas sur téléphone | oui (après, O2) | T2 |
| U11 | Cures reçues repliées | non | refusé |
| U12 | « Cures à valider » en deux groupes | non | refusé |
| U13 | Report : férié, week-end, absences | oui | T2 |
| U14 | Boutons « dans 1 sem. … 6 mois » | oui | T3 |
| U15 | Prochains créneaux libres | non | refusé |
| U16 | Nombre au lieu de la liste sans heure | non | refusé |
| U17 | Patients vus aujourd'hui en tête | oui | T3 |
| U18 | « Prochain RDV » dans la salle | non | refusé |
| U19 | Onglet d'ouverture selon le jour | non | refusé |
| U20 | 5 prochains puis « Voir tout » | oui | T4 |
| U21 | « Consultation : venu » + « Séance » | oui | T4 |
| U22 | Téléphone : ce qui était décidé le 17/10 | oui (après, O2) | T4 |
| U23 | Nom jamais coupé en salle | oui | T5 |
| U24 | Consultations et chimio d'abord | oui, **sans plier la radiothérapie** | T5 |
| V1 | Cabinets en abonnement d'abord | oui | V-a |
| V2 | Groupes de cliniques après | oui | V-a |
| V3 | Aucun laboratoire | oui | V-b |
| V4 | Licence ou vente avec un éditeur | **vente** | V-c |
| V5 | Registre d'usage mensuel | oui | L9 |
| V6 | Qui vend et répond au support | oui | V-d |
| V7 | Chaîne des droits avec le juriste | non | refusé |
| O1 | Cabinets amis : combien, quand | plus tard : hébergeur marocain puis CNDP d'abord (d'après elle) | phase C |
| O2 | Ordinateur, téléphone ou tablette | **ordinateur** | téléphone après |
| O3 | Geste qui fait perdre le plus de temps | « je ne vois pas » | — |
| O4 | Prix des packs | **prix marocains** (GestiCab, DabaDoc) | L10 |
| O5 | Qui vend, qui répond | il faudrait embaucher | V-d |
| O6 | Autres audits | oui, plus tard | Plus tard |

---

# ANCIEN PLAN ET TOUT CE QUI EST FAIT (gardé tel quel)

Tout ce qui suit est la feuille de route d'avant le 20/10/2026, sans rien retirer (les parties « Comment on travaille » et « Règles à ne pas
changer » sont remontées en haut, complétées). Introduction d'origine :

**Un seul plan** : ce fichier. En haut, **ce qui reste à faire** (nouveau plan, d'après l'audit n° 3 et tout ce qui restait
ouvert) ; en bas, **tout ce qui est fait**, gardé tel quel. Version précédente entière : `archives/FEUILLE-DE-ROUTE-jusqu-au-2026-10-13.md`
(avant : `archives/FEUILLE-DE-ROUTE-jusqu-au-2026-10-11.md`). Journal des sessions : `JOURNAL.md`.

Sources : les trois audits du dossier Drive « Audit » : « Audit pour vendre » (10/10), « Audit numéro 2 » (11/10) et
**« Audit n° 3 – Chimiothérapie et bibliothèque de protocoles » (12/10)** avec son classeur **« Protocoles-chimio-Onco360-a-faire.xlsx »**
(un protocole par ligne : 316 existants + 123 à créer ; copie dans `archives/audit-3/`, avec le texte de l'audit et les annotations de
Dr Bentahila).
**Audits n° 4 à 8 et demandes du cabinet du 17/10/2026** (document unique « Onco360 – Tout ce qu'il reste à faire … pour Claude », fait avec
un autre compte Claude, reçu le 18/10) : **phase R** ci-dessous. Copie entière (aucune donnée réelle) : `archives/audits-4-a-8/`
(`audits-4-a-8-et-demandes-du-17-10.md` = texte lisible avec ses tableaux, à relire au début de chaque lot R ; `.docx` = original). Les
« § » de la phase R renvoient aux parties de ce document.

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

## Décisions de Dr Bentahila du 17/10/2026 (audits n° 4 à 8 et demandes du 17/10 ; détail : `archives/audits-4-a-8/`)
Statuts du document : DEMANDÉ / VALIDÉ / DÉCIDÉ = à coder comme écrit ; MODIFIÉ = coder la version modifiée ; **REFUSÉ = ne pas faire et ne
pas le reproposer** ; NON CONTESTÉ = à faire, **en le signalant dans le compte rendu de la session** ; PRIORITÉ BASSE = sans urgence ;
À CONFIRMER / OUVERT = poser la question avant de coder (questions ci-dessous) ; DÉJÀ FAIT / INCHANGÉ = rien à coder.
- **Médecin du patient** (audit 4, réponse 1, DÉCIDÉ) : chaque patient a **un seul médecin** (champ « Médecin » de la fiche ; « médecin du
  patient » = « médecin référent », un seul champ). Médecin qui crée le dossier = lui par défaut ; secrétaire = elle choisit (pré-rempli dans
  un cabinet d'un seul médecin) ; modifiable. Il devient le médecin par défaut des rendez-vous, lignes de chimio, radiothérapies et
  consultations automatiques, **à la place du titulaire** (`medRdv` : `r.med || titulaireUid()`). Anciens rendez-vous et dossiers sans
  médecin : restent au titulaire. (Le titulaire = propriétaire du cabinet, qui porte l'abonnement : export, journal d'audit, accès.)
- **Lieu de chaque événement** (audit 4, d. 4, MODIFIÉ) : lieu de la RT pré-rempli avec celui du patient, modifiable dans la prescription
  (vu au cabinet et traité en clinique, ou d'une clinique à l'autre) ; il sert aux étapes, consultations automatiques, filtre de l'agenda,
  `{lieu}` du WhatsApp ; le bilan compte la RT là où elle a eu lieu (`moteur/finances.js` lit déjà `r.hop`). Lieu facultatif sur un
  rendez-vous (défaut : celui du patient).
- Consultation hebdomadaire de RT un jour férié (audit 4, d. 6, MODIFIÉ) : **pas de déplacement automatique** ; créée quand même, badge
  « Férié », listée dans « Rendez-vous à décaler » ; déplacée ou annulée à la main.
- **WhatsApp** (audit 4, d. 14, MODIFIÉ) : chaque message = **français puis arabe classique** (pas de darija), à la suite ; pas de choix de
  langue par patient ; messages de départ écrits dans les deux langues. Pas de WhatsApp envoyé tout seul (annulé le 13/10).
- Calendrier de RT : remplacé par le **calendrier de fin de radiothérapie** (17/10, R-B4). Calendrier imprimable de chimio : **refusé**.
- Agenda pas à jour en direct entre deux postes (audit 4, d. 1, MODIFIÉ le 17/10) : remplacé par R-A4 (ne plus attendre 5.3).
- Jours d'hospitalisation : **les fériés comptent** (inchangé, ne pas toucher `moteur/rdv.js`). « 1 jour sur 2 » : calcul inchangé, l'aide dit
  que « Jours choisis » donne un rythme fixe. RT arrondie au dirham, autres actes au centime : inchangé. Délai par défaut de la consultation
  de suivi après une RT ou une ligne de chimio (audit 4, d. 18) : déjà prévu dans le paramétrage. Toujours valables : pas de journal des
  séances de RT (ARIA fait foi), **pas de séance le samedi**, fenêtres d'avertissement sans motif, un seul clic.
- **Paiement** (audit 6) : le patient paie au moment de la consultation, presque toujours en espèces, ou ne paie pas (**0 DH**) ; aucun
  paiement différé ; la secrétaire encaisse **après** le « Venu » du médecin, jamais en même temps ; consultation de chimio : seul le J1 est
  payé, J8 / J15 à 0 DH par défaut, modifiable, et un montant saisi compte dans le bilan **à sa date**.
- **Identifiants du reçu** (audit 6, réponses 3 et 4, DÉCIDÉ) : mentions d'après l'article 145 du CGI (à faire valider par le comptable du
  cabinet ; réserve écrite dans le code et l'aide) : déjà imprimés (n° continu, date, patient, acte, montant en chiffres et en lettres, mode,
  médecin, ville) + **spécialité, adresse professionnelle, IF, TP, ICE, INPE**, « Acte exonéré de TVA » si le comptable confirme ; pas de
  registre du commerce. IF, TP, ICE saisis **dans le profil de chaque médecin** (à côté de l'INPE, publiés dans `signataires/{uid}`) ; adresse
  et téléphone = lieu d'exercice ; Paramètres › Impression = seulement les cases « imprimer sur le reçu » ; identifiant vide non imprimé,
  rien ne bloque. Pas de code-barres. Pas de reçu pour une hospitalisation ni dans un lieu payé par l'établissement.
- **Bibliothèques** (audit 7) : une mise à jour envoyée par l'Administration **n'écrase jamais** ce qu'un médecin a modifié ; elle ajoute ce
  qui manque (et que le médecin n'a pas créé entre-temps) ; un élément supprimé par le médecin n'est pas reproposé (liste des refus) ;
  identifiant stable par élément. Même mécanisme, construit une fois, pour la reprise des réglages (R-A6).
- **Secrétaire** (audit 7, d. 17, MODIFIÉ) : voit et prescrit, **ne modifie ni ne supprime rien dans aucune bibliothèque** (ajout de
  médicament : question 1) ; elle fait, modifie, supprime les ordonnances au nom du médecin (d. 26 : droits actuels gardés).
- **Signature scannée** (audit 7, d. 25) : retirée complètement (impression et case `eSig`). Stupéfiants : ni marque ni avertissement
  (l'ordonnance d'Onco360 est un double lisible ; l'ordonnance sécurisée est faite à la main) ; « Douleurs – palier 3 » gardée.
  COTIPRED gardé (+ SOLUPRED 20 mg). Perfusions (IMFINZI, KEYTRUDA, PEMORIAL, ZOMETA) gardées dans la liste (prise en charge). A5 : **jamais de
  passage automatique en A4**.
- **Sauvegardes** (audit 8) : récupérer un dossier effacé **en une heure**, par quelqu'un qui n'est pas développeur ; export automatique
  **hebdomadaire dans le Drive du titulaire**, proposé aux cabinets clients sur le support de leur choix (réglé par cabinet) ; mode d'emploi
  écrit ; **pas de double vérification à la connexion**.
- Réglages repris par l'Administration (R-A6, DÉCIDÉ par Claude, choix laissé) : **à la demande, par un bouton**, jamais en continu (un essai
  dans le cabinet Bentahila ne part pas aussitôt dans le modèle) ; « Modèle repris le JJ/MM ; N différences depuis ».
- Calendrier de fin de RT (R-B4, DÉCIDÉ par Claude) : ligne en bas en petit « Dates des séances intermédiaires établies d'après le
  calendrier ; début, fin et nombre de séances conformes au dossier. » (les dates intermédiaires sont reconstituées : protège le médecin).
- Disposition du dossier (audit 5, revue sur maquettes les 13 et 17/10) : même disposition pour tous les rôles (seuls les droits changent ce
  qu'on voit) ; **aucune consultation créée d'office** ; déroulé de la chimio inchangé ; Afficher, Journal, Modifier restent visibles (pas de
  menu « … ») ; **téléphone : disposition d'aujourd'hui gardée** (seuls changent bandeau réduit, barre du bas, parties dépliables, loupe).
- **Refusés le 17/10 (ne pas reproposer)** : déplacement automatique des consultations de RT un jour férié ; calendrier imprimable de
  chimio ; fauteuils / hôpital de jour (Onco360 = aide au médecin) ; toute la « caisse » : caisse du jour par mode / lieu / personne, clôture
  du jour avec écart, date et auteur de l'encaissement, registre des reçus, liste des impayés, total du jour par mode en salle ; avertissement
  « stupéfiant » ; remplacement de COTIPRED ; NIVESTIM / NEUPOGEN alignés ; bilans intercure enrichis (chaque analyse est payée par le
  patient) ; double vérification à la connexion ; code-barres sur le reçu ; passage automatique en A4.

## Anciennes questions en attente (reprises en haut le 20/10/2026 ; 6 et 8 répondues le 20/10 : d. 12, d. 13)
1. Mesurer la hauteur des en-têtes du papier (ordonnance A5, A4, documents) pour régler les marges (Paramètres › Impression).
2. GitHub : demander la purge des copies en cache ; regarder Insights › Traffic › « Git clones » (copies du dépôt quand il était public).

**Questions des audits 4 à 8 (§ 10) : à poser au début de la session du lot qu'elles bloquent, pas avant.** En attendant : ce qui suit.
| N° | Lot | Question | En attendant |
|---|---|---|---|
| ~~1~~ | R-E (audit 7) | **Répondu le 19/10** : la secrétaire n'ajoute rien non plus (aucune modification, ajout compris ; elle garde la ligne libre) | fait (R-E5) |
| ~~2~~ | R-E (audit 7) | **Répondu le 19/10** : effacer les images de signature et retirer le champ « Signature (image scannée) » du profil | fait (R-E5) |
| ~~3~~ | R-F (audit 8) | **Répondu le 20/10** : pas d'alerte à chaque export complet | rien codé |
| ~~4~~ | R-F (audit 8) | **Répondu le 20/10** : durées de conservation inchangées (à revoir avec le juriste, loi 09-08 ; nouvel export de la semaine : 14 semaines dans Onco360, 12 par défaut dans le Drive) | rien changé |
| ~~5~~ | R-F (audit 8) | **Répondu le 20/10** : n'importe qui, depuis son compte (titulaire : bouton) et l'Administration ; deux modes d'emploi | fait |
| 6 | R-A6 | Pour chaque autre cabinet, quelles parties du modèle reprendre ? | Correspondants et tarifs des consultations décochés ; le reste coché par l'Administration, cabinet par cabinet |
| ~~7~~ | R-D (audit 6, d. 3) | **Répondu le 20/10** : taux commun réglable dans Paramètres (pré-rempli 60 % / 10 %), la ligne « Radiothérapie » du lieu passe avant | fait (R-D3) |
| 8 | R-D / R-B5 (audit 6, d. 18) | Reçu imprimé sans numéro (enregistrement du numéro en échec) : une ligne au journal du cabinet suffit-elle ? | Faire la ligne au journal |

---

# ANCIEN PLAN du 13/10 et du 18/10/2026 (remplacé le 20/10/2026 par le plan du haut ; gardé tel quel, voir « Correspondance »)

| Phase | But | Étapes |
|---|---|---|
| **R** Retours du 17/10 et audits 4 à 8 | Corrections et ajouts demandés le 17/10 ; rendez-vous, dossier, finances, ordonnances, sauvegardes | R-A1 à R-G |
| **P** Protocoles de chimiothérapie | Bibliothèque juste et complète, ordonnances liées, hebdomadaire, bibliothèque commune (audit n° 3) | P0 à P11 |
| **Q** Qualité | Jeu de test fictif, contrôles automatiques, erreurs en ligne | Q-a à Q-f |
| **M** Métier restant | Infirmière, dossier stable | 3.8, 4.4 |
| **D** Design | Toucher, contraste, fenêtres Onco360 | 4.1, 4.2 |
| **E** Code et exploitation | Code propre, montée en charge, recette, hors ligne | 5.1 à 5.6 |
| **C** Conformité et vente | Juriste, dispositif médical, société, test d'intrusion | 0.5, 6.1 à 6.6 |
| **V** Cession | Dossier de cession, guides, démonstration | 7.1 à 7.4 |

La phase P passe avant tout le reste (6 protocoles peuvent produire une prescription fausse aujourd'hui). La phase C (juriste) se lance
en parallèle : ses délais ne dépendent pas du code.
**18/10/2026** : les 6 protocoles dangereux sont corrigés depuis P1a et P2 à P11 sont faits ; il reste de P seulement **P0** (dont 2 défauts
de l'audit 2) et **P1** (écran « Corrections proposées »). L'audit du 17/10 propose de faire **la phase R d'abord, dans l'ordre A1 → G** ; P0
et P1 se placent quand Dr Bentahila le décide (P0 est court : à proposer juste après R-A1).

**Ce que dit l'audit n° 3, en bref** : les doses des molécules sont justes dans l'immense majorité des 316 protocoles ; ce qui est en
retard, c'est autour : antiémétiques, prémédications, hydratation, G-CSF. Classeur : **113 à garder, 184 à ajuster** (la chimio est juste,
on corrige les à-côtés), **9 à modifier** (la chimio elle-même change), **10 à supprimer** (doublons, sans référence), **123 à créer**.
Problèmes qui se répètent (à corriger par blocs, pas 316 fois à la main) : mention eviQ (73), anti-NK1 / olanzapine absents (85),
hydratation du cisplatine en remarque seulement (57), G-CSF en texte sans dose ni durée (65), phase retardée du cisplatine non couverte
(50), paclitaxel sans anti-H1 (27), surprophylaxie d'un schéma à faible risque (21), « SOLUMEDROL » sans DCI (191), source vide (316).
Les 4 essais de l'audit 2 passent ; deux défauts restent (P0).

## Phase R – Retours du 17/10 et audits n° 4 à 8 (inscrite le 18/10/2026)

**Source** : `archives/audits-4-a-8/audits-4-a-8-et-demandes-du-17-10.md` (relire le § du lot au début de sa session : tout le détail, les
numéros de ligne et les constats y sont). Numéros de ligne de l'audit : § 3-4 au commit 645df32, § 5-9 au commit 1ad3bde (13/10) ; le code a
changé depuis (P3 à P11, 18/10) : **chercher par nom de fonction**. Une étape = une session, mise en ligne seule. **Test écrit avant chaque
correction** (Q1) ; `bash outils/avant-mise-en-ligne.sh --navigateur` (+ `--regles`) ; la liste de contrôle « Vérifier tout ce qu'un
changement touche » (en haut) à chaque lot ; dans le compte rendu, signaler ce qui était « NON CONTESTÉ ».
**État vérifié le 18/10** : rien des audits 4 à 8 n'est fait (`lireListe` avale toujours l'erreur de lecture, case `eSig` et règle
`|| b == 'medicaments'` toujours là, pas de `poidsActuel`). **Déjà fait en partie depuis l'audit** : P11 (`referenceDepuisCabinet` : recopie
des protocoles, bibliothèques de prescription, courriers dont modèles RT, paramètres de base, tarifs RT du cabinet Bentahila vers
`bib-oncologie`, sans aperçu ni copie de l'état précédent) et P9 (mises à jour proposées aux cabinets pour les **protocoles et ordonnances
types**, refus gardés) : R-A6 et R-E4 partent de là, sans les refaire.

**Lot A – Corrections urgentes**
- [x] **(18/10/2026, testé ; contrôle complet bon, Chrome et Safari ; en ligne : 20261018g, accord de Dr Bentahila)** `listeDe` / `erreurListe` / `charge` (ordonnances.js,
      documentation.js : lecture en échec ou liste abîmée = « Liste du cabinet illisible, réessayez », modification en transaction) ; registre des
      migrations illisible = rien refait (v2.js, sinon `remplacerOrdosTypes` écrasait les ordonnances types) ; vigilances et protocoles supprimés
      protégés ; modèle RT illisible signalé (documents.js) ; test `tests/test_bibliotheques_panne.py` 18/18 (ajouté à `avant-mise-en-ligne.sh`),
      panne simulée `window.__panne` (mockfb). 13/10 : rien d'écrasé (renommage de Dr Bentahila retrouvé le 18/10) ; 18/10 : à vérifier par elle.
      **R-A1 Bibliothèques du cabinet qui peuvent être écrasées** (audit 7, point 1, NON CONTESTÉ : **le défaut le plus grave des
      audits**, à faire en premier ; § 8) : `lireListe` / `modifierListe` (ordonnances.js) prennent la liste de départ quand la lecture
      échoue, puis l'enregistrent à la place de celle du cabinet (essai : 2 médicaments du cabinet remplacés par 165 après un clic sur
      l'étoile). Distinguer **document absent** (liste de départ, normal) et **lecture en échec** (message « Liste du cabinet illisible,
      réessayez », **aucune écriture**) ; modification dans une **transaction** ; les six bibliothèques. Vérifier que les mises à jour
      `appliquerOrdosAudit3` (P2), `ordosAudit3`, palier 3 (`audit3d`), `remplacerOrdosTypes` (migration `ordostypesExcel1`) et
      `vigilancesAudit3` n'ont pas pu remplacer une liste de cabinet après une lecture en échec. Test qui simule la panne d'abord.
- [x] **(18/10/2026, testé ; en ligne : 20261018h, site et fonctions)** Cause confirmée : modification par PATCH, que Google fusionne (ancienne « date » +
      nouvelle « dateTime » → 400 refusé en silence) ; **modification = remplacement entier (PUT)**, aussi pour un identifiant repris (409) ;
      faux Google de `test-logique.js` rendu fidèle (fusion, null, refus d'un début mixte, PUT) : 104 vérifications ; refus notés par personne
      (`agendaGoogle.refus` { groupe: { n, motif, d, le } }, `refusDe` d'index.js) et affichés dans Paramètres › Google Agenda ; tous les chemins
      vérifiés sur patients fictifs (`tests/test_agenda_google.py` 20/20 : cure avec / sans heure, seule / la suite, report, glisser, J8, 1re
      séance et fin de RT, consultation, Absent + report, secrétaire « planning ») ; jeu fictif réutilisable `tests/demo_seed.py`.
      **R-A2 Google Agenda : séances de chimio et étapes de RT déplacées qui ne bougent pas** (DEMANDÉ, § 3.1). Cause probable : un
      déplacement fait passer l'événement de « journée entière » (`start.date`) à « avec heure » (`start.dateTime`) ou l'inverse ; le PATCH
      garde les deux, Google refuse (400) et `appliquer` (functions/logique.js) le met de côté **en silence**. (1) Test d'abord
      (`functions/test-logique.js`, faux Google) : journée entière déplacée avec une heure, et l'inverse — il doit échouer avant la
      correction. (2) Corriger dans `corps` : champs de l'autre forme à `null` (`start.date` / `end.date`, ou `dateTime` / `timeZone`), ou
      PUT au lieu de PATCH. (3) Ne plus avaler un refus : nombre de refus et dernier motif dans `utilisateurs/{uid}.agendaGoogle`, affichés
      dans Paramètres › Google Agenda (« 2 événements refusés par Google »). (4) **Un test par chemin de déplacement** : `chModifierRdvChimio`
      (J1, J8 / J15, « cette séance seulement » et « décaler la suite », `majSeance`), report de cure, glisser-déposer de l'agenda,
      `modifierEtapeRT` (scanner, 1re séance, fin prévue) et les consultations hebdomadaires / de fin qui suivent, `deplacerRdv`, report
      après « Non venu », hospitalisation, échéance d'une tâche, absences, secrétaire avec le seul droit « planning ». (5) Si le test ne
      reproduit pas : `firebase functions:log --only agendaPatient` le jour d'un déplacement et `utilisateurs/{uid}.agendaGoogle.erreur`,
      **sans rien écrire dans la base en ligne**. Vérifier aussi : couleurs, filtre de chacun, `permis` (agenda d'un médecin), passé jamais
      effacé, plusieurs cabinets ; tous les autres types de rendez-vous.
- [x] **(18/10/2026, testé ; en ligne : 20261018h)** `public/js/moteur/creneaux.js` (`occupations`, `chevauche`, `texteConflit` ; test-creneaux 12/12) :
      rendez-vous, consultations des séances de chimio (événements « c » / « s » du résumé, heure choisie ou placée d'après la séance, 15 min),
      étapes de RT avec heure ; sans heure : « Déjà ce jour-là, sans heure : … » ; v2.js `occupDuJour` / `accepterConflit` (« Créneau déjà pris
      le … par : … Garder quand même ? », un clic, `API.conflitAccepte`) dans Nouveau rendez-vous / Modifier (créneau pris cliquable, un seul
      avertissement), glisser-déposer, report après « Non venu », heure de la consultation d'une séance (chimio.js), étape de RT ; « maintenant »
      = `heureMaroc()` (salle.js) ; `tests/test_creneaux.py` 13/13, test_agenda 57/57 (messages mis à jour).
      **R-A3 Double rendez-vous : créneaux pris par les consultations de chimio et de RT** (DEMANDÉ, § 3.2 ; reprend et élargit l'audit 4,
      d. 3 / C3, VALIDÉ). `rdvsDuJour` compte aussi la consultation de chaque séance de chimio du jour **qui a une heure** (choisie `hcm`,
      sinon placée d'après la séance `hc`) avec sa durée (`heures.cons.du`, 15 min), et les consultations de RT avec heure ; même filtre par
      médecin à partir de 2 médecins. Consultations du jour **sans heure** : pas de créneau, mais listées dans la fenêtre (« Déjà ce
      jour-là, sans heure : C3 J1 de … (consultation de chimio) »). Créneau pris affiché pris, avec ce qui le prend ; le choisir reste
      possible après **un clic** (« Créneau déjà pris par … : garder quand même ? »). Partout où l'on place une consultation : Nouveau
      rendez-vous, Modifier, report après « Non venu », glisser-déposer, heure de la consultation d'une séance de chimio, déplacement d'une
      consultation de RT. **« Maintenant » = heure du Maroc corrigée** (`maintenant()`, constat C10). Vérifier : vues Jour et Semaine,
      salle d'attente, WhatsApp de confirmation, `tests/test_agenda.py`.
- [x] **(18/10/2026, testé ; en ligne : 20261018h, site et index)** v2.js `ecouterDossiers` / `appliquerDossiers` / `rafraichirPage` : dossiers dont `maj` est
      postérieur à l'ouverture (5 min de marge), dans le périmètre (index `etablissementId` + `maj`, `firestore.indexes.json` ; aucun index en
      ligne avant) ; rien d'appliqué pendant une fenêtre, une saisie ou le résumé en cours (fait juste après ; la protection « Ce dossier vient
      d'être modifié » reste) ; nos écritures en attente ignorées ; salle (`dossiersChanges` : prix relus), tableau de bord, agenda, Patients,
      dossier ouvert (message « Dossier mis à jour ») redessinés, défilement gardé. Salle : bouton **« Actualiser »** + « à jour à 10 h 42 »
      (`actualiser` : fiches du jour, dossiers du jour, prix) et la même relecture chaque minute, suspendue pendant une fenêtre ou une saisie
      (dossiers relus seulement si l'écoute ne marche pas). Un dossier supprimé ailleurs reste visible jusqu'au rechargement. Tests :
      `tests/test_salle_direct.py` 17/17, `tests/regles/test-ecoute.mjs` 7/7 (règles inchangées), test_salle 51, test_agenda 57.
      **R-A4 Salle d'attente à jour sur tous les postes** (DEMANDÉ, § 3.3 ; remplace la « priorité basse » de l'audit 4, d. 1 / C1). Bouton
      **« Actualiser »** (icône, « à jour à 10 h 42 ») dans l'en-tête de la salle : relit les fiches du jour, les dossiers qui ont quelque
      chose aujourd'hui, leurs prix et encaissements, et redessine **sans perdre** l'onglet, le tri, le défilement ni la ligne ouverte. La
      même relecture **toute seule chaque minute**, suspendue pendant une fenêtre ouverte ou une saisie (faite juste après). **Écoute en
      direct des dossiers modifiés** (`maj` postérieur à l'ouverture, dans le périmètre : mêmes filtres d'établissement) : chaque dossier
      changé relu (doc, P, r) ; l'agenda, le tableau de bord et le dossier ouvert en profitent. Index composite (`firestore.indexes.json`) ;
      lecture de la liste vérifiée par un test de règles. Coût : une lecture par dossier modifié, jamais tout relire. Vérifier : dossier
      ouvert par deux personnes (« Ce dossier vient d'être modifié »), bulles, pastille, tableau de bord, agenda, `nouveauJour`, téléphone.
- [x] **(18/10/2026, testé ; en ligne : 20261018h)** `public/js/moteur/poids.js` (`poidsActuel`, `textePoids` ; test-poids 13/13) : le plus récent entre la fiche
      (`clinique.poids` / `clinique.poidsLe`, nouveau champ de `CLINIQUE`) et les séances saisies ou validées (jamais à venir ni annulées ; même
      jour : l'heure de validation ou de la saisie à la main départage) ; `recalculer` pose le poids actuel dans `x.P` (bandeau, impressions,
      nouveau champ {poids} des courriers « 64 kg (29/09/2026) ») ; fiche (Afficher, Modifier, en-tête) : « 75 kg (C4 J1 du 06/10/2026) » ;
      `cliniquePoids` (chimio.js) écrit `clinique.poids` et `poidsLe` sur la fiche telle qu'enregistrée, dans la même écriture que la séance
      (`sauverLignes`, poids validé par la secrétaire), seulement avec le droit d’écrire la fiche ; doses inchangées (testé). Tests : `tests/test_poids.py` (19 avec le courrier)
      17/17 ; test_fiche_tumeur corrigé (phrase d'aide derrière « ? », échec déjà là avant le 18/10).
      **R-A5 Poids de la fiche = poids de la dernière chimio** (DEMANDÉ, § 3.4). Une seule fonction **`poidsActuel(P)`** dans le moteur (Q5) :
      le plus récent entre la fiche (avec sa date) et les séances saisies ou validées (`c.poids`, `c.sea[j].poids`, planning `poids` /
      `spoids`) ; renvoie poids, date, source (« C3 J1 du 29/09 »). À la validation d'une séance qui porte un poids et au poids du jour de la
      secrétaire : écrire `clinique.poids` et `clinique.poidsLe` si la personne a le droit « fiche patient », sinon au prochain
      enregistrement de quelqu'un qui l'a ; **n'écrire que ces champs** (sans reconstruire `clinique`). Fiche, bandeau, impressions (âge,
      poids, allergie), `{poids}` des courriers : poids actuel avec sa date. **Ne change pas (test)** : doses des lignes en cours,
      avertissement d'écart > 10 % (séance précédente), alerte de perte de poids depuis le début de la ligne, bilan.
- [x] **(18/10/2026, testé ; en ligne : 20261018h, site et fonctions)** Fonctions `modeleReprendre` (aperçu partie par partie, puis reprise : copie de
      l'état précédent dans le stockage `plateforme/sauvegardes/…`, `plateforme/specialites[id]` { fiche, consultation, reglage, repris },
      `espaces/bib-…/parametres/*` et `bibliotheques/*`, journal) et `modeleAppliquer` (parties cochées, aperçu, copie `espaces/{e}/sauvegardes/…`,
      fiche et formulaire : modèle prioritaire sans rien retirer, retouches du cabinet par-dessus ; le reste : `fusionManquant`, rien d'écrasé) ;
      logique `functions/modele.js` (test-modele 20/20) ; réglages effectifs calculés avec le **même code que le site** (`functions/site/` = copie
      exacte de catalogue.js, modules.js, facturation.js, faite au `predeploy` des fonctions, vérifiée par test-modele) ; `typesConsult` ajouté à
      `PARAMS_SPE` ; cabinets neufs : réglage du pack complété par celui du modèle (`reglageNeuf`). Administration : carte « Modèle de la
      spécialité » (Par spécialité › Bibliothèque et paramètres : « Modèle repris le … ; N différences depuis », aperçu, « Reprendre comme
      modèle »), bouton « Appliquer le modèle » dans la fiche d'un cabinet (correspondants et tarifs : jamais dans le modèle). Question 6 : en
      attendant, tout coché par l'Administration. **Copie ponctuelle** (réponse à Dr Bentahila le 18/10) : rien ne part tout seul, ni de son
      cabinet vers le modèle, ni du modèle vers les cabinets. Tests : `tests/emulateur/test-modele.mjs` 29/29 (`npm run modele`, dans
      `--regles`), `tests/test_modele_admin.py` 15/15. **À faire par Dr Bentahila après la mise en ligne** : Administration › Par spécialité ›
      Bibliothèque et paramètres › « Voir les différences et reprendre ».
      **Écran refait le 20/10/2026 (« incompréhensible », Dr Bentahila)** : Par spécialité › **Modèle des cabinets neufs**, en trois étapes :
      1. « Copier le cabinet du Dr Bentahila dans le modèle » = **une seule action** (protocoles + réglages ; l'ancien bouton « Recopier depuis le
      cabinet Bentahila » à part est retiré, `referenceDepuisCabinet` reste appelable) ; une photo : ensuite **plus aucun lien** (l'enregistrement
      de la fiche / du formulaire de la spécialité ne touche plus `cabinet-bentahila`) ; anciens protocoles du modèle gardés dans la copie de
      secours ; 2. Ajuster le modèle (Ouvrir le modèle, Fiche patient, Formulaire, packs) ; 3. Ce que reçoivent les cabinets (neufs : tout ;
      déjà créés : fiche et formulaire aussitôt, protocoles par version publiée, le reste par « Appliquer le modèle »). Défauts corrigés :
      cartes Fiche / Formulaire pas relues après la copie (ancien modèle affiché) ; « Enregistrer » de Par spécialité perdait types, parties,
      impression, unités, formulaires nommés et formulaire de chaque type (`formSpecialite` de catalogue.js, même calcul que la copie).
      Tests : `test-modele.mjs` 41/41, `test_modele_admin.py` 29/29, `test-modele.js` 26/26, test_bibliotheque, test_fiche, test_cabinets,
      test_consultation_form, test_modules.
      **Suite du 20/10/2026 (« tout au même endroit, comme un paramétrage de médecin »)** : le modèle ouvert dans Onco360 a la **même page
      Paramètres qu'un médecin** (Cabinet › Tableau de bord ; Dossier patient › Fiche patient, Formulaire et Types de consultation, Listes de
      la fiche (mutuelles), Affichage du dossier), sauf lieux, journal, export, correspondants (`HORS_BIB`). Fiche et formulaire : éditeur en
      mode « spe », enregistrés par `ficheSpecialite({ espace: bib })` (modèle + fiche de la bibliothèque + cabinets déjà créés, jamais
      cabinet-bentahila) ; copiés dans `espaces/{bib}.ficheSpe / consultSpe` à chaque ouverture (`bibliothequeOuvrir`) et à chaque copie.
      Tableau de bord : `parametres/accueil` ajouté à `PARAMS_SPE` (ordre, places, cartes retirées seulement : une carte retirée par un pack
      n'est jamais remise). Administration : étape 2 = un seul bouton « Ouvrir le modèle » ; éditeurs à part retirés. Tests :
      `test_modele_parametres.py` 18/18 (nouveau, dans le contrôle), `test-modele.mjs` 47/47.
      **Réglage du cabinet en miroir (20/10/2026)** : Administration › fiche d'un cabinet › « Réglage du cabinet » montre ce que l'équipe voit (fonction
      `reglageCabinetLire` : `ficheSpe` / `consultSpe` du cabinet, `parametres/accueil`, `parametres/formulaires`) ; le tableau de bord, la fiche et le
      formulaire sont écrits au même endroit que le médecin (`abonnementCabinet` + `cab`, `accueilNettoye`) ; les champs ajoutés par l'administration
      avant (réglage `fiche`) restent, non modifiables ici. Cas signalé : « Consultation de fin de traitement » = « RT hebdomadaire ». Onglets des
      Paramètres à jour et par famille (`FAMILLES_SECTIONS` de catalogue.js, aussi pour configuration.js). Tests : `test_reglage_miroir.py` 16/16
      (dans le contrôle), `test-modele.mjs` 53/53. En ligne (4af175e).
      **R-A6 Réglages du cabinet Bentahila repris par l'Administration** (DEMANDÉ, § 3.5 ; part de P11). Aujourd'hui rien ne remonte : fiche
      patient et formulaires de consultation vivent à trois niveaux (modèle `plateforme/specialites[id].fiche` / `.consultation`, copie
      `espaces/{e}.ficheSpe` / `.consultSpe`, retouches `reglage.fiche` / `.consultation`) ; `parametres/typesConsult` n'est même pas dans
      `PARAMS_SPE`. (1) Fonction serveur réservée à l'Administration **« Reprendre les réglages d'un cabinet comme modèle »** (source
      cabinet-bentahila) : réglages **effectifs** (modèle + retouches) → modèle de la spécialité d'oncologie : fiche patient, formulaires de
      consultation et types reliés, types de consultation, paramètres de départ, bibliothèques de prescription, modèles de documents de RT,
      réglage du cabinet (menu, cartes, fonctions). Avant d'écrire : **aperçu des différences partie par partie**, **copie de l'état
      précédent** du modèle, ligne dans `journalAdmin`. À la demande (bouton), « Modèle repris le JJ/MM ; N différences depuis ». (2)
      **Jamais copiés** : patients et ce qui en dépend, équipe et comptes, lieux, correspondants, tarifs, identité et en-tête du cabinet,
      profils et signatures, abonnement, Google Agenda, horaires et absences. (3) Fonction **« Appliquer le modèle à un cabinet »** : cases
      par partie (correspondants et tarifs des consultations **décochés** par défaut ; question 6), aperçu, copie de l'état précédent du
      cabinet ; **rien de ce que le cabinet a modifié n'est écrasé, ce qui manque est ajouté** (même mécanisme que R-E4, construit une fois).
      (4) Les cabinets neufs reçoivent le modèle repris (plus la copie du 09/10). Droits inchangés : l'Administration n'ouvre aucun cabinet,
      tout passe par le serveur (comme `ficheSpecialite`). Vérifier : Administration › Par spécialité, `functions/test-cabinets.js`, cabinet
      de démonstration, retouches gardées, export.

- [x] **R-A6 bis Écart au modèle (demande du 18/10/2026 : « l'Administration voit-elle ce que chaque cabinet change ? » — non jusque-là ; testé, en ligne :
      20261019a)** : fonction `modeleEcart` (Administration seulement, lecture seule, pas notée au journal) : réglages du cabinet sous la forme du
      modèle (`reglagesDe`, même calcul que la reprise : sans patients, correspondants, tarifs) comparés au modèle de sa spécialité, partie par
      partie : « Ajouté par le cabinet », « Absent du cabinet », « Modifié », date de dernière modification connue ; libellés en clair (`ecart`
      de modele.js : « Mutuelle (nom affiché) », « 2e téléphone (présence) ») ; cabinet modèle : ce qu'il a changé depuis la dernière reprise.
      Bouton « Écart au modèle » dans la fiche de chaque cabinet. Choix faits par Claude (à revoir si besoin) : écart du cabinet Bentahila aussi ;
      consultation non notée au journal. Tests : test-modele 23/23, émulateurs 36/36, test_modele_admin 21/21.

**Lot B – Ajouts demandés le 17/10**
- [x] **(19/10/2026, testé)** `MENU` : « RCP » (module `rcp`, route `#rcp`) juste après « Tâches », pastille `nbRcp` (inscriptions sans décision) ;
      page `pageRcpMenu` (rcp.js, même contenu que l'ancien onglet) ; l'onglet quitte la page Tâches ; `#taches/rcp` et `taVue('rcp')` renvoient
      vers `#rcp`, retour du dossier (`retourListe`) aussi ; menu déjà réglé : `menuAvecNouveaux` (catalogue.js) place RCP juste après Tâches,
      le reste dans l'ordre d'avant ; module retiré : caché (`data-mod`), page → tableau de bord ; `MODULE_MENU` mis à jour ; copie du serveur
      (`functions/site/`) recopiée. `tests/test_rcp_menu.py` 14/14 ; test_cabinets et test_debordement adaptés (une entrée de menu de plus).
      **R-B1 RCP dans le menu principal, sous Tâches** (§ 4.1) : entrée « RCP » dans `MENU` (catalogue.js) juste après « Tâches », module
      `rcp`, route `#rcp`, même contenu que l'onglet (calendrier des semaines, période, Tous / À faire / Faits, case Fait, impression) ;
      l'onglet quitte la page Tâches ; `#taches/rcp` renvoie vers `#rcp` (anciens liens, `retourListe` de rcp.js). Menus déjà réordonnés
      (Administration ou cabinet) : RCP inséré juste après Tâches (comme `ordreAvecNouveaux`). Module retiré : caché (`body.sans-rcp`) ;
      `MODULE_MENU`, menu replié, téléphone ; droits inchangés. Vérifier : `tests/test_cabinets.py`, « + RCP », dossier ouvert depuis la
      liste (Décision RCP · Valider · Fermer), RCP dans « Rendez-vous et tâches à venir ».
- [x] **(19/10/2026, testé)** `public/js/moteur/alertes.js` (`cleAlerte` patient + ligne + cure + type + valeur, `vuesNettoyees` 90 jours,
      `partagerAlertes` ; test-alertes 6/6) ; bouton « Vu » (coche, 44 px sur téléphone, n'ouvre pas le dossier) sur chaque alerte clinique ;
      `utilisateurs/{uid}.alertesVues` (règle inchangée) ; « Alertes vues (n) » → fenêtre avec « Remettre » ; nouvelle valeur = nouvelle alerte
      (une cure validée reste figée : son poids changé après coup ne fait pas d'alerte). `tests/test_alertes_vues.py` 13/13 (patients fictifs).
      **R-B2 Alertes cliniques du tableau de bord qu'on peut valider** (§ 4.2) : bouton **« Vu »** (coche) sur chaque ligne du groupe
      « Alertes cliniques » (`blocAFaire`, `alertesCliniques`) ; clé = patient, ligne, cure, type et valeur (perte de poids, clairance,
      bilan) : une alerte vue ne revient pas, une nouvelle valeur / cure / bilan = nouvelle alerte ; rangé par médecin dans
      `utilisateurs/{uid}.alertesVues` { clé: date } (aucune règle à changer), entrées de plus de 90 jours effacées ; lien « Alertes vues
      (n) » pour les revoir et les remettre. Vérifier : compteur du groupe, cloche, patient décédé (toujours sans alerte), téléphone.
- [x] **(19/10/2026, testé, Chrome et Safari)** sous 768 px : loupe ronde `#trLoupe` juste à gauche de la cloche (44 px, la cloche aussi) ; au
      toucher `#tete.rech-ouv` : la pilule `#trPil` s'ouvre sur toute la largeur sous la barre, clavier ouvert, même recherche (`rechercheTete`) ;
      × (`#trX`), Échap ou un résultat la ferment ; cachée pour le comptable ; ordinateur inchangé. `tests/test_recherche_tel.py` 15/15.
      **R-B3 Recherche de patient sur téléphone** (§ 4.3) : sous 768 px, **loupe ronde juste à gauche de la cloche**, même taille (zone
      ≥ 44 px) ; au toucher, champ sur toute la largeur sous la barre, clavier ouvert, même recherche (`rechercheTete` : nom, n° de dossier,
      téléphone) ; × ou Échap ferme ; cachée pour le comptable (comme la pilule `#trPil`). Vérifier : 390 px, Safari iPhone, résultats
      au-dessus du contenu.
- [x] **(19/10/2026, testé)** modèle `rdv` (modelesrt.js) refait d'après l'export de l'accélérateur envoyé par le cabinet (photo jamais
      dans le dépôt) : « Rendez-vous du patient », bande des dates (1re séance ; fin validée, sinon fin prévue), Patient · ID patient (n° de
      dossier, champ {id_patient}) · Oncologue, tableau à 6 colonnes ; `lignesCalendrierRT` (documents.js, répartition `datesSeancesRT`
      inchangée, jusqu'à la fin validée ou prévue) : Mise en place 15 min, Traitement journalier 20 min, Fin de traitement, heure `debH`,
      ressource = médecin (pas de HAL1), « Terminé » seulement fin validée et date passée ; une page A4 (9 pt, 8 pt au-delà de 25 lignes,
      7 pt au-delà de 40, cellules sur une ligne) ; nom « Calendrier de fin de radiothérapie » ; modèle déjà modifié par le cabinet : gardé,
      message dans la fenêtre et dans Paramètres › Bibliothèques › Courriers (« Un nouveau modèle existe… » ; « Remettre le texte d'origine »
      remet aussi le nom) ; ligne du bas décidée le 18/10. `tests/test_calendrier_rt.py`
      18/18 (5, 25, 33, 39 séances, 2 par jour : une page, PDF compté) ; test_rt_controle adapté.
      **R-B4 Calendrier de fin de radiothérapie** (§ 4.4 ; remplace l'audit 4, d. 10) : à la place du « Calendrier théorique », mise en page
      de l'export ARIA envoyé (rien d'autre n'en est repris) ; sert seulement à faire valider la fin de prise en charge par les mutuelles.
      **Garder le calcul `datesSeancesRT`** (jours selon le rythme entre la 1re séance et la fin, fériés exclus, surplus retiré à intervalles
      réguliers en gardant la première et la dernière). Titre « Rendez-vous du patient » ; bande « Date de début : … – Date de fin : … »
      (fin validée, sinon prévue) ; ligne « Patient : NOM, Prénom » · « ID patient : n° de dossier » · « Oncologue : Dr NOM Prénom » ;
      tableau 6 colonnes (Date · Heure · Durée de l'activité (min) · Activité · Ressource · État du rendez-vous) : 1re ligne « Mise en place
      RA » 15 min, dernière « Fin de traitement RA », autres « Traitement journalier RA » 20 min ; heure = `debH` sur chaque ligne (vide sinon) ;
      Ressource = NOM Prénom du médecin (**pas de « HAL1 »**, pas d'appareil) ; État « Terminé » une fois la fin validée, avant « Prévu »
      (jamais « Terminé » pour une date à venir). **Une seule page A4** : 9 pt, jusqu'à 7 pt interligne serré au-delà de 40 lignes ; essais
      à 5, 25, 33, 39 séances et en 2 séances par jour. Nom « Calendrier de fin de radiothérapie » ; modèle modifiable (`bibliotheques/
      courriers`, id `rt-rdv`) ; un modèle déjà modifié par le cabinet n'est pas écrasé (le nouveau proposé à côté) ; ligne du bas décidée
      (voir Décisions). Vérifier : `documentsRT/{…}_rdv`, aperçu écran et téléphone, marges, RT en 2 séances / jour, RT sans fin validée.
- [x] **(19/10/2026, testé ; règle des reçus changée)** `htmlRecu` / `imprimerRecu` (v2.js) d'après le ticket d'encaissement envoyé (photo
      jamais dans le dépôt) : A5, une page ; lieu (en-tête imprimé) et « Date : » ; « REÇU » encadré ; tableau N° de reçu (duplicata, remplace),
      Patient (n° de dossier), Médecin de l'acte (`o.med` = médecin du rendez-vous, sinon titulaire ; sa carte `signataires/{uid}`, spécialité en
      italique), Prestation et date, Encaissement (« 400,00 DH », en lettres, mode) ; « Visa accueil » (qui imprime, heure du Maroc) ; mentions
      (spécialité, adresse du lieu, IF, TP, ICE, INPE ; « Acte exonéré de TVA » décoché par défaut ; réserve du CGI écrite) ; « Cachet et
      signature » ; pas de code-barres. **IF, TP, ICE** dans Mon compte (`idFiscal`, `tp`, `ice`, publiés sur la carte) ; Paramètres › Impression :
      « Reçus : mentions imprimées » (`rSpe` … `rTva`). **Prix changé après un reçu** : note dans la fenêtre de prix, avertissement d'un clic,
      historique `recus/{…}.prix` [{ le, par, parNom, avant, apres }] (règle : une entrée de plus, signée ; 6 cas dans test-recus.mjs).
      **Reçu sans numéro** : « sans numéro » imprimé et ligne « Reçu imprimé SANS NUMÉRO » au journal (question 8, en attendant). Tests :
      `tests/test_recu.py` 23/23, test_salle adapté (51/51), règles 0 échec.
      **R-B5 Reçu : nouvelle mise en page + lot F1 de l'audit 6** (§ 4.5 et § 7 ; d. 9, 10, 11 ; question 8). **A5 portrait, une page**,
      même cadre que les ordonnances (en-tête généré et pied, C6) : en haut à gauche le nom du lieu ou du cabinet, à droite « Date :
      JJ/MM/AAAA » ; au centre, encadré, « REÇU » ; tableau encadré libellé / valeur : N° de reçu (R-AAAA-NNNN, « DUPLICATA » ou « remplace
      le n° … » comme aujourd'hui), Patient (NOM Prénom, n° de dossier), Médecin (Dr NOM Prénom, spécialité dessous en italique), Prestation
      (l'acte, ex. « Consultation d'oncologie médicale », et sa date), Encaissement (« 400,00 DH », en lettres, mode « Espèces ») ; en bas à
      droite, petit cadre « Visa accueil » (qui a encaissé, heure) ; sous le tableau les mentions obligatoires (voir Décisions) puis
      « Cachet et signature ». **IF, TP, ICE dans le profil du médecin** (Profil › Informations, publiés dans `signataires/{uid}`), cases
      « imprimer sur le reçu » dans Paramètres › Impression (spécialité, INPE, IF, TP, ICE, exonération de TVA). **Prix changé après un
      reçu** (A4, d. 11) : avertissement « Un reçu n° … a été remis pour 400 DH », sans blocage, et **historique des montants** (avant,
      après, par qui, quand). Reçu imprimé sans numéro : ligne au journal du cabinet (question 8). Bilan inchangé. Vérifier : numérotation
      (`recus/`, transaction), duplicata, reçu annulé, `recuRdv` / `recuCons`, Encaisser de la salle, téléphone, marges A5.

**Lot C – Audit n° 4 : rendez-vous de chimiothérapie et de radiothérapie** (§ 5 ; C1 → R-A4, C3 → R-A3, d. 10 → R-B4)
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** v2.js `absentRdv` : le report recopie médecin (`medRdv`), durée (`dureeDe`) et lieu, puis
      `proposerConfirmation(…, "Rendez-vous reporté")` ; moteur/rt.js `regenRtc` refait (signature « v3 ») : consultation hebdomadaire créée **aussi
      un jour férié** (badge « Férié » du dossier, « Rendez-vous à décaler »), identifiants gardés (`datesRtc`), médecin et lieu de la RT ; reprise
      unique des RT en cours (`migrations`, `parametres/migrations.rtcFeries`) ; « Patients à reprogrammer » (`moteur/reprogrammer.js` +
      `patientsAReprogrammer` de v2.js, carte « À faire par la secrétaire » ; fiches de la salle des 30 derniers jours lues une fois :
      `chargerJoursPasses` de salle.js) ; aide des rythmes sous « Rythme » (prescription de RT). Tests : test-rt 25, test-reprogrammer 11, test_lot_c.
      **R-C1 Report après « Non venu » et RT un jour férié** : le rendez-vous de report recopie **le médecin et la durée** du rendez-vous
      d'origine, avec les mêmes contrôles (chevauchement) et la même proposition de confirmation WhatsApp que « Nouveau rendez-vous » (C2,
      d. 2) ; **consultation hebdomadaire de RT un jour férié** créée quand même avec le badge « Férié » et listée dans « Rendez-vous à
      décaler » (d. 6 ; aujourd'hui `moteur/rt.js` ne la crée pas : test) ; **« Patients à reprogrammer »** pour la secrétaire :
      consultations non venues sans nouveau rendez-vous, séances « absent, sans reporter » (d. 22) ; aide : « Jours choisis » donne un
      rythme fixe, « 1 jour sur 2 » alterne sur les jours ouvrés (d. 20, calcul inchangé).
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** agenda.js `evtsDossier` dans un `try / catch` par dossier ; un dossier mal formé n'empêche plus Onco360
      de s'ouvrir (`recalculer` : affiché sans ses traitements, `x.illisible`) ; moteur/agenda.js `chimioAVenir` : J8 / J15 passé « en retard » tant
      que la cure a commencé et que le traitement n'est pas allé plus loin ; ligne arrêtée : cures faites et passées gardées (`garde`), à venir
      écartées ; icône à la place de l'émoji (fenêtre « Déplacer ») ; `prixRdv` / `tarH` retirés de moteur/rdv.js. Tests : test-agenda-c 11, test_lot_c.
      **R-C2 Agenda protégé et passé gardé** : un `try / catch` par dossier dans le calcul des cures de la page Agenda (comme la salle), ligne
      fautive notée dans la console (C5, d. 8) ; **J8 / J15 passé sans validation** gardé dans « Rendez-vous et tâches à venir » avec « en
      retard », comme le J1 (d. 12, `moteur/agenda.js`) ; **ligne arrêtée** : n'écarter que les cures à venir, garder les passées ; ligne
      supprimée : tout disparaît, passé compris (d. 13) ; émoji de la fenêtre « Déplacer le rendez-vous ? » remplacé (règle 4.3) ; `prixRdv`
      et `tarH` (moteur/rdv.js, « HGC » en dur, plus appelés) supprimés (C8, avec 5.1).
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** médecin du patient `identite.med` (fichepatient.js `htmlMedecin`, champ fixe montré à partir de 2
      médecins ; création : le médecin qui crée, un seul médecin d'office, la secrétaire choisit ; Afficher) ; v2.js `medPatient` / `medPourPatient` :
      médecin proposé des nouveaux rendez-vous, des lignes de chimio (`L.med`, chimio.js) et des RT (`r.med`, champ « Médecin » de la prescription) ;
      consultations hebdomadaires et de fin : médecin et lieu de la RT ; événements `m` (moteur/agenda.js : ligne ou RT, sinon patient) ; Google
      Agenda : `permis` (functions/logique.js) applique le médecin aux séances et aux RT aussi (**fonctions à mettre en ligne**) ; créneaux par
      médecin de la ligne / de la RT ; lieu facultatif d'un rendez-vous `r.lieu` (fenêtre du rendez-vous, horaires et créneaux du lieu) ; filtres
      « Établissement » et « Médecin » de l'agenda par événement ; `{lieu}` du WhatsApp = lieu de la RT ou du rendez-vous (`lieuWA`). Salle d'attente,
      prix et bilan des rendez-vous : lieu du patient (inchangé) ; bilan de la RT : `r.hop` (déjà). Bilan inchangé (test-bilan 22/22).
      **R-C3 Médecin du patient, puis médecin et lieu de chaque événement** (réponse 1, d. 4, d. 5 ; voir Décisions) : champ « Médecin » de la
      fiche (création par un médecin / par la secrétaire, modifiable ; anciens dossiers au titulaire) ; un médecin par événement (ligne de
      chimio, RT, consultations automatiques), utilisé par le filtre « Médecin » et Google Agenda, défaut = médecin du patient, sinon le
      médecin connecté ; **lieu de la RT** pré-rempli et modifiable dans la prescription (étapes, consultations automatiques, filtre de
      l'agenda, `{lieu}` WhatsApp, bilan par `r.hop`) ; lieu facultatif sur un rendez-vous. Constats : filtre de l'agenda et lieu du WhatsApp
      pris sur le patient (agenda.js, v2.js), ligne sans médecin (`functions/logique.js`). Bilan : chiffré avant / après (identique tant
      qu'aucun lieu n'est changé).
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** `sauverRT` : sans le droit « rendez-vous », la signature `_sc` n'est pas enregistrée et un message
      dit « Consultations de radiothérapie non mises à jour » ; rappels WhatsApp dans `rappels/{patient}` { patientId, etablissementId, l, majPar,
      maj } (écoute `ecouterRappels`, `RAP`, anciens `rappels` du dossier encore lus), règle (lecture dans le périmètre, écriture « rendezvous »
      signée) et `tests/regles/test-rappels.mjs` 18/18 ; faux Firebase : `setDoc` avec fusion en profondeur (comme Firestore). **Règles à mettre en ligne.**
      **R-C4 RT sans droit « rendez-vous » et rappels à part** : n'enregistrer la signature de la RT que si ses rendez-vous ont été écrits, et
      afficher « consultations non mises à jour » (C4, d. 7, `moteur/rt.js`) ; **rappels WhatsApp dans une petite collection à part**
      (comme `salle/`), avec sa règle et son test (C7, d. 16 : aujourd'hui chaque rappel réécrit le dossier, version + 1).
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** configuration.js `WA_FR` + `WA_AR` (arabe classique, mois en usage au Maroc, noms propres isolés)
      → `WA0` ; `{jour_ar}` `{heure_ar}` ; message modifié par le cabinet sans arabe : l'arabe de départ ajouté à l'envoi (`messageAvecArabe`, dit
      dans Paramètres › WhatsApp) ; confirmation d'un clic avec « Plus tard » après un report ou un changement de date : rendez-vous modifié,
      cure (date, report), séance (date, report, « Modifier »), scanner et 1re séance (`confirmerApres`).
      **R-C5 WhatsApp français + arabe classique et confirmations après report** : chaque message = français puis arabe classique, messages
      de départ (Paramètres › WhatsApp) dans les deux langues (d. 14) ; confirmation d'un clic, avec « Plus tard », après un report ou un
      changement de date (cure, séance, étape de RT) (d. 15).
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** `--vert-t` #17693A, `--orange-t` #8F5600, heures `--doux` ; fait = couleur pleine + coche ;
      grille `max(380px, 100vh − 300px)` ; en-tête « 1 consult. · 3 chimio » ; vues Semaine et Mois : puce « N séances de chimio » → vue Jour ; une
      séance ou consultation avec heure est déjà placée dans la grille (AG5).
      **R-C6 Lisibilité de l'agenda** (d. 9, VALIDÉ) : contrastes ≥ 4,5:1 — heures de la grille `#9AA3B5` → `--doux #64708A` ; séance de
      chimio `#1F8A4C` sur `#DFF3E6` → `#17693A` ; jour férié `#B86E00` sur `#FDEFD6` → `#8F5600` ; rendez-vous fait (opacité 0,6) →
      couleur pleine et une coche ; hauteur de la grille à la taille de l'écran ; « 5 consult. · 8 chimio » dans l'en-tête des jours ; séances
      sans heure : une puce « 8 séances de chimio » qui ouvre la vue Jour ; dès que l'heure de la séance (infirmière) ou de la consultation de
      chimio (médecin, secrétaire) est notée, la consultation se place dans la grille.
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** bouton « Actualiser » + « à jour à 8 h 00 » (agenda.js `actualiser`) : relit les dossiers modifiés depuis
      la dernière relecture (`API.relireModifies`, même requête que l'écoute) ; chaque minute toute seule (relecture seulement si l'écoute ne marche
      pas), suspendue pendant une fenêtre, une saisie, le panneau ou un glisser-déposer ; vue, date, filtres et défilement de la grille gardés (aussi
      après l'écoute et après une modification).
      **R-C8 Agenda à jour sur tous les postes, comme la salle d'attente** (DEMANDÉ le 19/10/2026 par Dr Bentahila) : bouton **« Actualiser »**
      (icône, « à jour à 10 h 42 ») dans l'en-tête de l'agenda, qui relit les rendez-vous, les séances de chimio et les étapes de RT de la
      période affichée et redessine **sans perdre** la vue (Liste / Jour / Semaine / Mois), la date, les filtres (établissement, médecin) ni le
      défilement ; la même relecture **toute seule chaque minute**, suspendue pendant une fenêtre, une saisie ou un glisser-déposer (faite juste
      après). Part de R-A4 : l'écoute des dossiers modifiés (`ecouterDossiers`) redessine déjà l'agenda ouvert ; ajouter le bouton, « à jour à »,
      la relecture chaque minute (filet si l'écoute s'arrête) et l'ordre gardé ; mêmes règles (coût : relire seulement si l'écoute ne marche pas,
      le bouton relit tout). Vérifier : vues Jour et Semaine, glisser-déposer pendant une actualisation, salle d'attente, tableau de bord,
      téléphone (390 px), Safari ; `tests/test_agenda.py`.
- [x] **(19/10/2026, testé ; en ligne : 20261020c)** (fait avec le lot, sans attendre 5.3) événements de chaque dossier gardés en mémoire (`CACHE`, clé = dossier tel
      qu'il est + période + filtres) : la page et « RDV à venir » ne recalculent plus toutes les cures.
      **R-C7 Calcul de l'agenda gardé en mémoire** (C6 : toutes les lignes recalculées deux fois à chaque affichage), avec l'étape 5.3.

- [x] **(20/10/2026, testé ; en ligne : 20261020c ; demande de Dr Bentahila)** Médecin du patient dans la **ligne 1 du bandeau** du dossier (« 72 ans ·
      Homme · Dossier n° … · Dr NOM », à partir de 2 médecins ; case « Médecin du patient » de Paramètres › Dossier patient › bandeau, `ENTETE_CALC._med`,
      cochée par défaut) ; **filtre « Médecin » dans la salle d'attente** (à côté des établissements, à partir de 2 médecins, comme l'agenda) : un
      médecin voit d'abord ses patients et peut choisir un confrère ou « Tous les médecins » pour l'aider ; secrétaire et infirmière : tous par défaut.
      Rappel des réponses : patient créé par un médecin = à lui ; par la secrétaire d'un cabinet de plusieurs médecins = elle choisit. test_lot_c 63/63.

- [x] **(20/10/2026, testé ; en ligne : 20261020e ; demande de Dr Bentahila)** Messages WhatsApp : **les messages réglés par Dr Bentahila dans son cabinet sont la
      référence** (« Bonjour {nom} », « votre consultation », bilan sanguin récent…) : messages de départ `WA_FR` = ses textes, `WA_AR` = leur
      traduction fidèle en arabe classique (« مرحبا {nom}، … »), arabe placé **avant la signature** ; ses messages enregistrés (français seul)
      reçoivent une fois leur arabe (`migrations.waBilingue`, modifiable dans Paramètres › WhatsApp). Cabinets neufs : ces messages. Modèle
      d'oncologie de l'Administration (`bib-oncologie`, copie du 09/10) : à reprendre depuis son cabinet (bouton « Reprendre », R-A6).

**Lot D – Audit n° 6 : finances** (§ 7 ; lot F1 → R-B5 ; l'ancien lot « Caisse » est supprimé)
**Fait le 20/10/2026 (R-D1 à R-D4 en une session, demande de Dr Bentahila ; testé ; en ligne : 20261020h, site, règles et toutes les fonctions dont
la nouvelle `releveNuit`, depuis une copie propre de ee513c3, contrôle complet bon avant, accord de Dr Bentahila)** ;
réponse à la question 7 (20/10) : taux commun réglable, pré-rempli 60 % / 10 %. Bilan de référence **inchangé : 352 317 DH avant et après** (ses
consultations de chimio sont toutes au J1) ; en ligne, seules changent de date (et de mode) les consultations payées un J8 / J15. Tests :
test-bilan 42/42 (moteur), test_finances_d 16/16, test_comptable 13/13, règles (reçus 32, bilan 15, comptable 21), test-cabinets ; guide `guide/bilan.md`.
- [x] **(20/10/2026, testé)** `evtsFin` (moteur/finances.js) : un acte « cchimio » par jour payé (montant > 0, ou ancien format au tarif), à sa date
      (J1 = séance, J8… = séance validée sinon prévue ; ancien « jour : autre » = sa date), avec son mode ; identifiant « cc|ligne|cure » pour le
      1er jour payé (case « Payé » reprise), « cc|ligne|cure|jour » ensuite ; libellé « Consultation chimio J8 – … » ; `consJours` = une seule source
      (moteur/finances.js, reprise par chimio.js).
      **R-D1 (F2) Consultation de chimio jour par jour** (C1, d. 1, VALIDÉ) : un acte par jour, à sa date, avec son mode (aujourd'hui un seul
      acte daté du J1, un seul mode : `moteur/finances.js`) ; J8 / J15 à 0 DH par défaut, modifiable, un montant saisi compte à sa date ;
      cases « Payé » déjà cochées reprises sur le J1. **Le bilan change** : chiffre avant / après sur le jeu de référence, annoncé avant la
      mise en ligne.
- [x] **Retiré le 20/10/2026 à la demande de Dr Bentahila** (les cliniques paient des mois après l'acte, le temps que la sécurité sociale les
      règle : un rapprochement mois par mois n'a pas de sens ; et « payé au cabinet » ne concerne que les consultations, pas les séances, RT ni
      hospitalisations). Explications du Bilan derrière un « ? » à côté du titre (v2.js `aidesCartes`, aussi page Bilan). Avant :
      bilan.js `rapprochement` / `htmlRappro` (cadre « Rapprochement des règlements », `#biRap`, après les versements et
      règlements ; feuille « Rapprochement » de l'export Excel) : par clinique (lieux non « payé au cabinet ») et par mois de la période : actes du
      mois (NET, dont à recevoir), cochés « Payé » ce mois-là (date du clic), reçus ce mois-là, écart = reçu − coché ; lecture seule. **Relevé du
      comptable préparé la nuit par le serveur (A7)** : fait le même jour (demande de Dr Bentahila) : fonction `releveNuit` (2 h 45, heure du Maroc ;
      functions/releve.js, `concerne` = cabinet actif avec un comptable actif, des tarifs et la fonction `bilan.comptable`, ni bibliothèque ni démonstration),
      même calcul (copie du site dans functions/site/moteur et site/donnees, firebase.json predeploy), même format et même signature que le navigateur
      (rien de réécrit si rien n'a changé) ; test-releve 24/24 (bilan du comptable = 352 317 DH).
      Corrigé en passant : relevé du comptable repoussé de 3 s à 2 min quand un dossier était réparé au démarrage (minuteur de l'ouverture à part).
      **R-D2 (F3) Rapprochement** : règlements par clinique et par mois (A5, d. 14) = indicateur en lecture seule : reçu, coché « Payé », dû,
      écart (pas de pointage en lot) ; relevé du comptable préparé la nuit par le serveur (A7, d. 15, plus tard). Bilan inchangé.
- [x] **(20/10/2026, testé)** `majMontants` (chimio.js) = transaction qui écrit montants **et** prix à encaisser ; cases « Payé » (`majCase`),
      versements et règlements (`sauverListe`) en transaction ; règles : `patientsFinances` lus dans le périmètre (bilan et `migrations()` demandent la
      liste par établissement ; comptable : aucun), montants et prix à encaisser suivent le patient qui change d'établissement (fonction
      `agendaPatient`) ; reçu : nouveau numéro = anciens annulés gardés (`hasAll`) + le numéro remplacé, son montant, signé (`annuleVerifie`) ; taux de
      RT : `tauxRT` (finances/tarifs.tauxRT, Paramètres › Activités › Actes de radiothérapie), écrit une fois à 60 % / 10 % (`migrations.tauxRT`),
      cabinets neufs : celui de la référence (`tarifsDepart`) ; sans ligne du lieu ni taux commun = « sans tarif » ; `tauxTxt` sans 10 % caché.
      **Non fait : impôt de 10 % par défaut des hospitalisations reprises de la v1 (C9), laissé à l'étape 5.4** comme prévu.
      **R-D3 (F4) Robustesse** : transactions pour montants, cases « Payé », versements et règlements (C2, C3, C4 : `majMontants`, bilan.js ;
      d. 2, **PRIORITÉ BASSE**, avec 5.2) ; règles : montants lisibles **avec** la limite d'établissement, reçu annulé vérifié (C8, d. 17),
      avec leurs tests ; taux de RT sans valeur cachée (C5 : 60 % / 10 % pris en silence quand un lieu n'a pas de taux de RT ; question 7, ne
      rien changer avant la réponse ; le bilan ne change que pour un lieu sans taux) ; impôt de 10 % par défaut pour la v1 (C9, avec 5.4).
- [x] **(20/10/2026, testé)** `finances/paiements_AAAA` (année de l'acte) + ancien `finances/paiements` (cases dont l'acte est introuvable, encore
      lues) : moteur/bilan.js `docPaiements`, `fusionnerPaiements`, `repartirPaiements` (rangement à l'ouverture du bilan par le médecin, transaction ;
      rien de perdu ni de dédoublé), `placePaiements` (alerte en haut du bilan à 70 % de 1 Mo) ; finances/ lu en une fois (`lireFinances`) ; règle : le
      comptable écrit aussi `paiements_AAAA`. **Bilan lu depuis l'index : avec l'étape 5.3** (l'index des patients n'existe pas encore).
      **R-D4 (F5) Montée en charge** : cases « Payé » découpées par année (limite de 1 Mo d'un document, alerte à 70 %), bilan lu depuis
      l'index (d. 16, avec 5.3). Bilan inchangé.

**Lot E – Audit n° 7 : ordonnances et bibliothèques de prescription** (§ 8 ; point 1 → R-A1 ; questions 1 et 2 au début du lot)
**Fait le 19/10/2026 (R-E1 à R-E7 en une session, demande de Dr Bentahila ; testé ; en ligne : 20261019h, site, règles, fonctions referenceDiff et modeleAppliquer, accord de Dr Bentahila)** : moteur `public/js/moteur/ordonnance.js` (zones
`marquerZones`, doublons, familles d'allergie `FAMILLES_ALLERGIE` / `alertesAllergie`, pages `paginer`, chimio orale `doseOrale` ; test-ordonnance 28/28) et
`public/js/moteur/bibmaj.js` (`fusionnerListe`, `fusionnerOrdos`, `ajouterManquantes`, `retiresEntre` ; test-bibmaj 21/21) ; corrections de départ décrites
dans `public/js/donnees/majbib.js` (écrit d'après la liste d'avant : « avant » → fiche de départ) ; `tests/test_ordonnances_e.py` 46/46 (médecin, secrétaire,
390 px) ; guide `guide/ordonnances.md` ; contrôle complet bon (Chrome et Safari, règles). Réponses aux questions 1 et 2 (19/10) : secrétaire sans aucun ajout ; images de signature effacées et champ retiré.
- [x] **(19/10/2026, testé)** `contenu` / `contenuAnalyses` : « … » et « [durée à compléter] » = `mark.or-ac` (un clic sélectionne la zone) ;
      durées dans `medicaments.js` / `ordostypes.js` (stupéfiants 28 jours, TRAMAL LP 1 mois, OEDES, MAGMINE, BACTRIM FORTE 3 mois ; durée à compléter
      sur 23 fiches et 4 lignes d'ordonnances types : traitements pris chaque jour sans fin écrite — choix de Claude, l'audit en comptait 9 / 12 sans
      les nommer) ; doublons à l'ajout (`sansDoublons` : « Garder une seule ligne » / « Garder les deux ») ; `question()` = petite fenêtre par-dessus
      l'ordonnance ; `verifications` + `orValider` : une fenêtre « Avant d'imprimer » (zones, doublons, allergie, plusieurs pages) Corriger / Réduire le
      texte / … quand même (fenêtre d'impression ouverte pendant le clic). Défaut ancien corrigé : la classe `or-pat2` (âge, poids, allergie) était
      retirée par `nettoyer`.
      **R-E1 Zones « À compléter », durées, doublons, vérification unique** : chaque « … » des 8 fiches (ALER-Z, CAPÉCITABINE ×2, COTIPRED,
      DEXAMÉTHASONE œdème, LOVENOX, NAVELBINE, TEMODAL adjuvant) devient une **zone jaune « À compléter »** (mécanisme `mark.or-ac` des
      courriers) (d. 2) ; durées par défaut (d. 3) : **stupéfiants 28 jours, TRAMAL LP 1 mois, OEDES 3 mois, BACTRIM FORTE 3 mois, MAGMINE
      3 mois** ; toutes les autres lignes sans durée (9 fiches, 12 lignes d'ordonnances types) : zone « durée à compléter » ; **doublons** à
      l'ajout d'une 2e ordonnance type (CHEMOSET, COTIPRED, PARACÉTAMOL : « … est déjà dans l'ordonnance : garder les deux / une seule
      ligne », avertissement) (d. 16) ; **une seule fenêtre « Corriger / Imprimer quand même »** avant l'impression qui regroupe zones
      restantes, doublons, allergie, ordonnance sur 2 pages (pas de contrôle des stupéfiants) (d. 28 ; aujourd'hui `orValider` ne vérifie que
      les courriers).
- [x] **(19/10/2026, testé)** `mesurer` (cadre caché à la taille réelle, mm, mêmes styles `cssImpression`), `paginer` ; aperçu : `data-coupe`
      « fin de la page 1 » (trait pointillé, jamais enregistré) ; impression > 1 page : `.pgp` par page, patient et date en haut des suivantes, « page 1 / 2 »,
      un médicament jamais coupé, signature avec le dernier ; une page : comme avant ; courriers : inchangés.
      **R-E2 Impression sur plusieurs pages** (d. 24, DÉCIDÉ ; jamais de passage automatique en A4) : dans l'aperçu, trait pointillé « fin de la
      page 1 » à la hauteur exacte ; à la validation, si > 1 page : « L'ordonnance tient sur 2 pages : réduire le texte / imprimer quand
      même » (dans la fenêtre unique) ; à l'impression : nom du patient et date en haut de chaque page, « page 1 / 2 » en bas, signature
      toujours avec le dernier médicament, médicament jamais coupé. Cas d'essai (A5, marges par défaut) : Rectite radique et proctologie,
      Syndrome pieds-mains, Soins de bouche, Radiodermite et soins cutanés, Bilan chimiothérapie – bilan initial, Bilan immunothérapie –
      bilan initial.
- [x] **(19/10/2026, testé)** tout le d. 4 à 23 (180 médicaments ; 5 sérologies ajoutées à la liste des analyses pour harmoniser les 14
      éléments de bilans ; précaution sur les **7** scanners iodés : les 5 « injectée », l'angio-TDM et l'uro-TDM) ; NOCAND = **fluconazole** (antifongique azolé :
      déduit de la posologie 50 mg / 7 jours, **à vérifier par Dr Bentahila**) ; MOSCONTIN 10 mg dans l'ordonnance type palier 3.
      **R-E3 Corrections de la liste de départ**, appliquées aux cabinets par la mise à jour sans écrasement (R-E4) : une fiche par dosage
      (MOSCONTIN LP 10/30/60/100, DUROGESIC 12/25/50, LEVOTHYROX 25/50/100 ; d. 4) ; + SOLUPRED (prednisolone) 20 mg, COTIPRED gardé (d. 6) ;
      TAVANIC 500 mg une fois par jour, OFLOCET 200 mg matin et soir, durées gardées (d. 8) ; EFFIPRED en deux fiches (prostate
      hormonosensible 5 mg / j ; résistant à la castration 5 mg matin et soir) (d. 9) ; PRIMPERAN, CLOPRAME : 5 jours au plus, 3 × 10 mg / j
      au plus (EMA 2013) (d. 10) ; fiche LOPERIUM « diarrhée retardée de l'irinotécan » (2 gélules dès la 1re selle liquide, puis 1 toutes
      les 2 h, la nuit 2 toutes les 4 h, jusqu'à 12 h après la dernière selle liquide, 48 h au plus, au-delà urgence), fiche ordinaire
      gardée (d. 11) ; XGEVA et PROLIA : « bilan dentaire avant la 1re injection » + « calcium 500 mg et vitamine D 400 UI / j, sauf
      hypercalcémie » ; ARANESP : « si Hb < 10 g/dl sous chimiothérapie ; réduire ou suspendre au-dessus de 12 g/dl » (d. 12) ; ajouter
      NAUSELIUM (dompéridone) sirop, VITAMINE B12 1 000 µg injectable, SYSMETIX, lavements de sucralfate, crème à l'urée 10 à 30 % (d. 14) ;
      NOCAND 50 mg complété (DCI, classe), titre « Douleurs – palier 1 » (d. 15) ; « Bilan lipidique » remplacé par ses 4 analyses dans les
      deux bilans initiaux (chimio, immunothérapie) (d. 19) ; 14 éléments de bilans harmonisés sur les noms de la liste des analyses (TSH /
      TSH us, ionogramme…) (d. 21) ; « Protéinurie des 24 h » en Biochimie (d. 22) ; précaution sur les 5 scanners injectés : « créatininémie
      récente ; signaler une allergie à l'iode ou un traitement par metformine » (d. 23).
- [x] **(19/10/2026, testé ; fonctions `referenceDiff`, `modeleAppliquer` à mettre en ligne)** identifiants fixes des fiches ajoutées
      (4e élément de `MEDICAMENTS0`, 3e de `ANALYSES0` ; rien retiré ni déplacé) ; `modifierListe` note les éléments retirés dans `retires` (doc de la
      bibliothèque) ; `majBibliotheques` (une fois, `parametres/migrations.bibE3`, médecin) porte `majbib.js` dans le cabinet sans écraser ; `ajouterOrdosManquants`
      remplace `remplacerOrdosTypes` ; P9 : `differencesListe` (functions/reference.js, test-reference 16/16), page Protocoles « Voir et choisir » avec
      Médicaments, Analyses, Bilans, Examens, Courriers (Ajouter / Ne pas ajouter, Prendre / Garder le mien, « Tout ajouter ») ; `modeleAppliquer` (R-A6)
      respecte `retires`.
      **R-E4 Mises à jour des bibliothèques par l'Administration** (d. 18, VALIDÉ ; part de P9, qui le fait déjà pour protocoles et
      ordonnances types) : étendre à médicaments, analyses, bilans, examens, courriers ; chaque élément de départ reconnu par un
      **identifiant stable** (pas sa position) ; éléments supprimés par le médecin gardés comme refusés (jamais reproposés) ; **remplacer
      `remplacerOrdosTypes`** (écrase tout : ordonnances et étoiles du cabinet perdues) par cette fusion ; lecture corrigée de R-A1 ; même
      mécanisme que R-A6.
- [x] **(19/10/2026, testé ; règle changée)** case `eSig`, impression et champ du profil retirés ; `effacerSignature` (v2.js : `signature` retirée de
      `utilisateurs/{uid}` à la connexion) et carte `signataires/{uid}` réécrite sans elle ; règle `bibliotheques` : médecin seulement (test-parametres) ;
      `ajouteMedic` = médecin.
      **R-E5 Signature scannée retirée et droits de la secrétaire** : plus d'impression de la signature scannée ni de case `eSig`
      (configuration.js, `cadre` / `imprimer` d'ordonnances.js, reglages.js) (d. 25 ; question 2) ; secrétaire : aucune modification de
      bibliothèque (règle `bibliotheques` : retirer `|| b == 'medicaments'`, bouton `ajouteMedic`), tests de règles (d. 17 ; question 1).
- [x] **(19/10/2026, testé)** `okAllergie` (ajout de la liste, ordonnance type, suggestion, ligne libre, modification, nouveau médicament) +
      bandeau `#orAl` au-dessus de l'ordonnance affichée (renouvellement, modification compris) + fenêtre avant l'impression ; familles complétées
      (pristinamycine, sulfadiazine, BETADINE pour l'iode, CEDOL / CETRA…), allergie croisée « à vérifier » (pénicillines ↔ céphalosporines, AINS ↔
      aspirine), classe de la bibliothèque lue (ARCOXIA) ; mots de l'allergie gardés pour le reste.
      **R-E6 Allergie vérifiée sur toutes les lignes** (d. 27, MODIFIÉ) : à l'affichage de l'ordonnance (liste, ordonnance type, ligne libre,
      suggestion, modification, renouvellement, nouveau médicament), avec la **table des familles** (§ 8 « Familles d'allergie », à
      compléter avec les noms de la bibliothèque) : pénicillines ; céphalosporines (croisée possible : « à vérifier ») ; sulfamides ;
      quinolones ; AINS ; aspirine ; produits de contraste iodés (examens « injectée ») ; morphiniques. Avertissement d'un clic, jamais
      bloquant (aujourd'hui `allergieDans` compare des mots, ligne libre et nouveau médicament non vérifiés).
- [x] **(19/10/2026, testé)** `versions` (20 dernières) dans la ligne modifiée, menu « Version » des antécédents ; « Annuler l'ordonnance » =
      `annulee` { le, par, parNom } (barrée, plus comptée ni réimprimable ; la consultation « Ordonnance » n'est plus supprimée) ; `auJour(html, signer, x)`
      refait `.or-pat2` ; `items` enregistrés, `par` / `parUid` / `modifPar` pris du compte (`nomCompte`, v2.js, aussi pour le journal), format A5 / A4
      dans `utilisateurs/{uid}.formatOrdo` ; ajouts : chimio orale calculée (bouton « mg/m² » : capécitabine, vinorelbine, témozolomide), ordonnances du
      protocole (P6, déjà là), recherche par médicament (antécédents, plus de 3 ordonnances), Duplicata ; identifiant de ligne avec une part aléatoire.
      **R-E7 Traçabilité, petits correctifs, ajouts** : ancienne version gardée à chaque modification, ordonnance « annulée » au lieu
      d'effacée, comme les reçus (d. 29 : `enregistrerPrescription`, `supprimerPrescription`) ; « Renouveler » refait la ligne âge, poids,
      allergie depuis le dossier (d. 30, `auJour`) ; liste des médicaments enregistrée avec la page, auteur pris du compte et non de l'écran
      (`par` = texte du menu), format A5 / A4 retenu par navigateur (d. 31) ; puis ajouts (d. 32) : chimio orale calculée, ordonnances du
      protocole (en grande partie fait par P6), recherche par médicament, duplicata.

**Lot F – Audit n° 8 : sauvegarde et restauration** (§ 9 ; questions 3, 4, 5 répondues le 20/10/2026)
**Fait le 20/10/2026 (R-F2 à R-F7 en une session, demande de Dr Bentahila ; testé, contrôle complet bon (120, Chrome et Safari, règles, émulateurs) ; en ligne : 20261020d, site et fonctions, accord de Dr Bentahila ; API Google Drive activée et copie de nuit v11 collée par elle)**. Réponses du 20/10 : (3) **pas d'alerte**
à chaque export complet ; (4) durées de conservation **inchangées** ; (5) **n'importe qui peut restaurer, depuis son compte** (médecin titulaire :
bouton dans Paramètres) **et l'Administration** (onglet Sauvegardes) → deux modes d'emploi : `guide/en-cas-de-probleme.md` (cabinet, aussi dans
Onco360) et `outils/RESTAURER.md` (Administration et dernier recours). Exercice R-F1 : **reporté** (« pas maintenant »).
Logique pure : `functions/restauration.js` (test-restauration 27), `drive.js` (test-drive 11), `sauvegarde.js` (garde-fou, alerte : test-sauvegarde 14),
`exportation.js` (extensions, téléphone : test-exportation 15) ; fonctions serveur `functions/sauvegardes.js` (branchées en fin d'index.js : exporterCabinet,
exportsHebdo, exportAuto, recuperation, fichiersNuit, fichiersSauvegarder, sauvegardesEtat) ; écran du cabinet `public/js/app/recuperation.js` (onglet
« Export des données » de configuration.js, CSS « Lot R-F » de v2.html) ; Administration : onglet **Sauvegardes** d'admin.js. Tests : émulateurs
`cd tests/regles && npm run export` **73/73** (dont le retour à une heure donnée), `tests/test_recuperation.py` 41/41, `tests/moteur/test-copie-drive.mjs` 9/9 ;
test_export corrigé (explications derrière « ? » depuis le 19/10 : il échouait déjà, il n'était pas dans le contrôle complet ; il y est, avec test_recuperation).
**À faire avant la mise en ligne (une fois)** : activer l'API Google Drive dans le projet et ajouter l'autorisation `drive.file` à l'écran de consentement
« Onco360 » (`outils/RESTAURER.md` § 7) ; après : coller la copie Drive v11 dans Apps Script et lancer `installerSauvegardeOnco360` ; Dr Bentahila relie
son Google Drive (Paramètres › Cabinet › Export des données).
- [ ] **R-F1 Exercice chronométré** (rien à coder, d. 8) : `firebase firestore:backups:list --project chimio-hgc`, restaurer la base de la
      veille dans une base à côté, noter le temps. **Reporté le 20/10/2026** (Dr Bentahila : « pas maintenant ») ; marche à suivre et registre des
      exercices : `outils/RESTAURER.md` § 3 et § 8 (la récupération depuis la base à côté se fait maintenant par l'onglet Sauvegardes).
- [x] **(20/10/2026, testé)** Bouton « Récupérer des données » : Paramètres › Cabinet › Export des données (titulaire) et Administration › Sauvegardes
      (numéros de dossier et nombres seulement, jamais un nom ni un contenu ; source en plus : base restaurée à côté) ; fonction `recuperation`
      (sources, liste, aperçu, appliquer). Sources : **la base à une heure donnée** (retour à la minute près de Firestore, 7 jours : lecture
      `readTime`), exports gardés dans Onco360 (`donnees.json.gz` à côté de chaque ZIP ; exports de la semaine 14 semaines), copie faite avant une
      récupération (= annuler), fichier d'export de l'ordinateur (ouvert dans le navigateur, seul le dossier choisi est envoyé). Quoi : un dossier
      (patient, montants, encaissements, rappels, consultations, documents de RT, documents déposés, RCP, tâches, salle, reçus, administrations),
      un document du cabinet (bibliothèques, paramètres, protocoles, finances, lieux, relevés, cartes des médecins), tout le cabinet (R-F7). Règles :
      effacé → remis, modifié → remis comme avant, **créé depuis → gardé**, reçu existant et administration notée jamais remplacés, jamais l'équipe, les
      compteurs, le journal, le registre des tâches automatiques ; état d'avant copié (`espaces/{e}/recuperations/{ms}.json.gz`) ; version du dossier
      au-dessus de l'actuelle ; PDF repris de la copie de secours des fichiers ; journal du cabinet (+ journal de l'Administration). Commande de
      secours `outils/recuperer.mjs` (même code). Délai mesuré sur les émulateurs : moins d'une minute.
      **R-F2 Récupérer un seul dossier ou document en moins d'une heure** (d. 1, priorité du lot) : patient, consultations, montants, reçus,
      fiches de fichiers, ou un document de bibliothèque, depuis un export ou une base restaurée ; utilisable par quelqu'un qui n'est pas
      développeur (commande prête à copier, mieux : bouton dans l'Administration).
- [x] **(20/10/2026, testé)** `outils/restaurer-export.mjs` : cabinet cible non vide **refusé** (rien écrit ; message vers recuperer.mjs) ; `--vider`
      (copie du cabinet dans `avant-restauration-<cabinet>-<date>.json`, puis vidé, exports et copies de récupération gardés) ; `--comptes` (compte
      absent recréé avec **le même uid** et la même adresse, `comptes/{uid}`, lien de mot de passe affiché ; l'export contient maintenant `comptes`
      { uid: { email, espaces } }) ; accepte ZIP, `donnees.json(.gz)` et copie Drive v11 ; vrais types des fichiers. Modes d'emploi : `outils/RESTAURER.md`
      refait (cas → partie, base à côté, commandes, prérequis `npm install` dans functions et `gcloud auth application-default login`, filets, mise en
      place, **registre des exercices**, ce qui a vraiment été essayé : « tous ont été essayés » retiré) ; `guide/en-cas-de-probleme.md` + même texte
      dans Onco360 (« En cas de problème »).
      **R-F3 Restauration sûre et mode d'emploi** : cabinet cible non vide **refusé par défaut** (option explicite pour le vider ; essai :
      restaurer par-dessus fait revenir en arrière ce qui a été modifié) ; comptes recréés **avec leurs identifiants** (`firebase
      auth:export` / `auth:import`, ou recréer chaque compte manquant avec le même uid et écrire `comptes/{uid}`) (d. 9) ; mode d'emploi
      (d. 4) : `outils/RESTAURER.md` + version lisible pour le cabinet : page « En cas de problème » (noter l'heure exacte de l'erreur, ne
      rien réparer à la main, quel cas renvoie à quelle partie, qui appeler), cas d'un seul dossier, registre des exercices, `npm install`
      dans `functions/`, retirer « tous ont été essayés » (seule la restauration de l'export l'a été).
- [x] **(20/10/2026, testé ; Drive à essayer en vrai à la mise en ligne)** `exportsHebdo` (dimanche 1 h 30, tous les cabinets sauf bibliothèques,
      démonstration, suspendus, arrêtés) : export complet `espaces/{e}/exports/auto-{ms}/` (le dernier ZIP gardé ; données 14 semaines) puis dépôt dans le
      **Google Drive du cabinet** s'il est relié (autorisation `drive.file`, envoi par morceaux de 8 Mo, dossier « Onco360 – exports du cabinet », les plus
      anciens retirés au-delà de 4 à 52 semaines, 12 par défaut) ; réglage par cabinet `exportsAuto/{e}` { actif, garder, dernier, historique } et jetons
      `driveJetons/{e}` (serveur seul) ; fonction `exportAuto` (état, régler, relier / délier le Drive, maintenant) ; écran « Export automatique de la
      semaine » (titulaire). Autres supports (OneDrive, Dropbox) : à la demande d'un cabinet (À placer).
      **R-F4 Export automatique hebdomadaire hors du projet Firebase** (d. 2, 3) : dans le Drive du titulaire, chaque semaine ; pour les
      cabinets clients, support au choix (leur Drive ou autre), réglé par cabinet. (Les sauvegardes Firebase et la copie des fichiers sont
      dans le même projet : une suppression du projet les emporte au bout de 30 jours.)
- [x] **(20/10/2026, testé)** Résultat de chaque nuit dans `plateforme/sauvegardeFichiers` { dernier, nuits (30) } (date, copiés, retirés, erreurs et
      motifs, durée, total, échec) ; garde-fou `planCopie` : plus de 20 fichiers et plus de 10 % de la copie disparus d'un coup → rien retiré ; garde-fou,
      erreurs et échec au journal de l'Administration ; alerte (`alerteCopie` : erreurs, garde-fou, aucun passage depuis 48 h) en rouge dans l'onglet
      Sauvegardes et en haut de l'onglet Cabinets (avec les exports de la semaine en échec ou absents depuis 8 jours) ; fonction `sauvegardesEtat`.
      **R-F5 Copie des fichiers surveillée** (d. 10) : résultat de chaque nuit (date, copiés, erreurs) dans un document lu par
      l'Administration ; alerte en cas d'erreurs ou sans passage depuis 48 h ; garde-fou : ne rien retirer de la copie si une grande part
      disparaît d'un coup (`sauvegarderFichiers`, `planCopie`).
- [x] **(20/10/2026, testé)** ZIP écrit au fil de l'eau (`generateNodeStream`, fichiers lus un par un à leur tour : 800 Mo écrits avec 109 Mo de mémoire) ;
      nouvel export enregistré **avant** de retirer l'ancien ; vraies extensions (`extension`, `typeDe` ; restauration avec le vrai type) ; téléphone
      `="06…"` dans patients.csv ; délai du navigateur porté à 30 min (`appelLong` ; avant : 60 s). Copie Drive **v11** (`apps-script/onco360-sauvegarde.gs`) :
      format de l'export (dates gardées, références et données binaires notées, journal d'audit inclus), limite de 6 min surveillée (journal d'audit coupé
      et signalé, ou sauvegarde annulée), relue par `restaurer-export.mjs` / `recuperer.mjs` (test-copie-drive 9/9). **À coller dans Apps Script.**
      **R-F6 Export au fil de l'eau et copie Drive v11** (d. 11, 12) : ZIP écrit au fil de l'eau (aujourd'hui tout en mémoire, 2 Go : échec
      estimé vers 1 Go de documents) ; enregistrer le nouvel export **avant** d'effacer l'ancien ; vraies extensions (pas tout en « .pdf » :
      `cheminFichier`, `restaurer-export.mjs`) ; téléphone en texte (Excel retire le 0 initial : colonne texte ou .xlsx) ; copie Drive
      **v11** au format de l'export (types des dates gardés, références, journal d'audit inclus, limite de 6 min surveillée), réimportable
      par le même script de restauration.
- [x] **(20/10/2026, testé)** « Tout le cabinet » du même bouton (titulaire ou Administration), depuis la base à une heure donnée, un export ou une
      base restaurée à côté ; même code que R-F2 ; `recuperer.mjs --tout`.
      **R-F7 « Recopier un cabinet » depuis une base restaurée** (d. 13 ; erreur qui abîme beaucoup de dossiers), après R-F2, même code.

**Lot G – Audit n° 5 : disposition du dossier patient** (§ 6 ; **remplace l'étape 4.4** de la phase M ; maquettes revues les 13 et 17/10)
**Fait le 19/10/2026 (R-G a à e en une session, demande de Dr Bentahila ; testé, contrôle complet bon (Chrome et Safari) ; en ligne : 20261019c, site et fonctions, accord de Dr Bentahila)** : `pageDossier` (v2.js) = `.dos` à cinq
zones `[data-zone]` (bandeau, patient, travail, documents, barre) + panneau `#panneau` ; CSS « Lot R-G » de v2.html (`@container dos`, `100dvh`,
`--tete-h`) ; redessin zone par zone (défilement de chaque zone, de la page et curseur gardés ; visionneuse rechargée seulement si `sigVisionneuse`
change). Bandeau : `ficheP.htmlBandeau` / `ligne1` (fichepatient.js), `ENTETE_CALC` / `ENTETE_CALC0` (catalogue.js : `_chimio`, `_rt`, `_sc`,
`_locst` dans `entetes`), libellés courts `courts` (fiche ; serveur `ficheNettoyee`), départ `COURTS0` (Tél., Mut., Lieu…) ; **la case garde le nom
« en-tête »** (demande du 19/10 : « personnalisable via la case en-tête »), bloc « En-tête du dossier (bandeau) » avec aperçu et avertissement dans
l'éditeur ; flèche `dosMenu` (localStorage `onco360.menuReplieDossier`, `menuDossier` dans `route`) ; photo `dosPhoto` ; nom, âge, allergie dans
la barre du haut (téléphone). Barre : `boutonsPrescription` (consultations.js, compteur `prescriptions.compteur`, fonction facultative),
`bullesDossier` (salle.js : « Valider : venu » / « Fermer ») et `bulleRcp` (rcp.js) posés dans `#barreDroite` ; présence dans `#presSlot`.
Colonne Patient : résumé (hauteur qui suit le texte), prochain rendez-vous, `<details class="dp">` (avenir, passe, id, med, tum ; `partiesLecture`),
« Tout déplier », état gardé (localStorage `onco360.dossierParties`), départ `reglages().dossier.parties`. Consultations : lignes de 28 px
(`ouvertes`, `OUVS`), dernière dépliée, **note dépliée en entier** (demande du 19/10 : plus de limite de 420 px), « Tout déplier », « Notes
seulement », Imprimer (`csImprimer`), 10 dernières puis « Afficher les plus anciennes » sous 940 px. Panneau : `panneau(html)` / `fermerPanneau`
(v2.js ; « Quitter sans enregistrer ? »), `fermerFenetre` ferme d'abord la petite fenêtre ; `#fenetre` placé avant `#zone` (identifiants `fOk`,
`fErr` de la petite fenêtre trouvés d'abord) ; chimio.js (`ouvrirCure`, `dessinerNL`, `chProto`, `rafraichir`, `chFermerCure`) et `ouvrirRT` ;
sans grille : fenêtre large d'avant. Visionneuse : `htmlVisionneuse` (fichiers.js : Documents (n), Agrandir deux tiers `visionneuseGrande`,
menu ⋯ avec plein écran, nouvelle fenêtre, télécharger, modifier, supprimer). Paramètres › Dossier patient › **Affichage du dossier**
(`affichage` de configuration.js ; secrétaire aussi) ; Paramètres › Impression : `fenRappel` (allergie et poids en haut de la fenêtre
d'ordonnance). Guide : `guide/dossier-patient.md`. Tests : `tests/test_dossier_disposition.py` (59), `tests/test_dossier_boutons.py`
(référence `dossier_boutons_ref.json` prise **avant** le lot : aucune action perdue, rôle par rôle) ; test_fiche, test_fiche_tumeur, test_salle
adaptés. Choix faits par Claude : statut « En traitement » / « En surveillance » gardé dans la ligne 1 (gris ; décédé, perdu de vue en couleur) car il
n'est pas un champ de la fiche (sinon il disparaissait) ; **19/10, demande de Dr Bentahila** : « Prescrire chimio / RT » retirés de la barre (« Nouvelle ligne » et « + Prescription » restent dans leurs
onglets, comme « Nouvelle consultation ») ; barre et onglets du centre **sur une ligne, sans défiler** (libellés courts par requêtes de conteneur
`dos` / `trav` ; « Agrandir » en icône ; mesuré de 1 366 à 1 920 px, RCP comprise ; 1 280 menu ouvert avec une RCP : 2 lignes ; téléphone : 2 à
3 lignes, tout visible) ; pas de menu « … » ni de
« Plus » (décisions du 17/10), malgré les maquettes.
Cible sur ordinateur : un écran qui ne bouge pas (aujourd'hui à 1440 × 900 : 2 240 px de haut, 545 px d'en-tête avant les onglets, barre
des prescriptions à 1 385 px) — **bandeau** collé en haut (2 lignes, ~90 px), **colonne Patient** à gauche (300 px), **centre Travail**
(onglets d'aujourd'hui), **colonne Documents** à droite (visionneuse), **barre d'actions** collée en bas ; chaque colonne défile seule.
Selon la largeur de la zone de contenu (requêtes de conteneur ; ouvrir / replier le menu la change) : ≥ 1 280 px 3 colonnes (Travail
≥ 520 px, Documents ~40 % du reste entre 420 et 760 px) ; 940 à 1 279 px 2 colonnes (Travail · droite à onglets « Patient » / « Documents ») ;
< 940 px une colonne comme aujourd'hui ; hauteur < 640 px : page qui défile, bandeau collé. Détail des zones, des notes, des paramètres
et du code : § 6 de l'audit.
**19/10/2026, retours de Dr Bentahila après la mise en ligne (testé, contrôle complet bon : 98, Chrome et Safari ; en ligne : 20261019e, site seul, accord de Dr Bentahila)** : barre centrée ; en consultation (salle) : seulement
le temps (« 12 min », détail au survol), « Valider », « Fermer », tout sur une ligne ; bouton du menu retiré du bandeau (celui du menu replie
pour le dossier seulement) ; « Agrandir » avec sa propre icône ; visionneuse : zoom Page entière / Largeur / 100 % / − / + (PDF : `#zoom=` du
lecteur du navigateur ; image : taille calculée) ; **compactage « comme GestiCab »** : explications (classe `aide`) cachées dans le dossier et
le panneau, « ? » (`voirAides`, `body.voir-aides`) ; panneau : champs de 32 px, plusieurs par ligne, boutons (`.boutons`, `.valj`) fixés en bas ;
séance : poids, surface, %, créatinine, DFG et bilan dans une grille (`.par-j`, `bilanJour({ inline })`), vigilance en une ligne (`details.vig-b`,
ouverte d'office si alerte forte ou interaction), « Molécules » sur une ligne ; onglet Chimiothérapie : une ligne par cure (`t-lig`, poids · Cl · SC
dans une colonne) ; note ouverte : « signée le … », Modifier, Supprimer sur la ligne de titre (`cs-h`, `cs-act`), note sans cadre, ordonnances sur
une ligne ; RT : 4 colonnes (`rt-f`). Mesuré à 1440 : séance 990 → 640 px, RT 1 190 → 640 px (écran : 638). **Puis (19/10, autres retours, testé)** : onglets du centre centrés (téléphone et ordinateur ; téléphone : nombre à côté du nom) ; RT : la dernière
prescription ouverte, les autres pliées sur leur ligne de titre (+ Modifier, Terminé / Rouvrir), prescription enregistrée ouverte (`RTO`), champ
« Résumé clinique / notes » retiré (note existante gardée : `note: $("rNote") ? … : R.note`) ; notes : bande bleu clair date · type · titre ·
ordonnances · initiales (plus le début de la note), dépliée = texte dessous sans cadre, sans ligne vide, ordonnances une ligne par sorte ; visionneuse :
`#view=Fit` / `#view=FitH` / `#zoom=N` (Chrome ; Safari : son zoom) ; défilement gardé quand une note longue se déplie. Puis : note dépliée sur toute la largeur ; tableau de bord : explications des cartes dans un rond « ? » (`aidesCartes`, v2.js) ; en ligne 20261019g (avec les retours (2)). Tests : test_dossier_disposition 76 ;
test_cures, test_seances, test_validation, test_vigilance (panneau), test_consultations34 ajoutés au contrôle avant mise en ligne.
- [x] **R-G a (4.4 a) Bandeau et barre d'actions**, à toutes les largeurs. Bandeau ligne 1 : flèche qui replie le menu pour le dossier
      seulement (localStorage), photo 40 px agrandie au clic, NOM Prénom, âge, sexe, n° de dossier, allergie en rouge si « oui », statut
      décédé / perdu de vue, « Chimio C3/6 », « RT en cours », « Dossier ouvert par … » ; à droite Afficher, Journal, Modifier. Ligne 2 en
      petit : seulement les champs cochés « Dans le bandeau » (`fiche.entetes`, `ENTETE0`), poids = poids actuel daté (R-A5). Barre : Prescrire
      chimio, Prescrire RT, Médic., Ordo. type, Analyses, Examens compl., Courriers, Doc. (avec sous chacun le nombre d'ordonnances faites),
      + RCP, + Rendez-vous, + Tâche ; à droite « Valider : venu » / « Fermer » (depuis la salle) ou Décision RCP · Valider · Fermer (depuis
      les RCP) : **les bulles flottantes passent dans la barre** (`bullesDossier`, `bulleRcp`). Téléphone : bandeau réduit (nom, âge,
      allergie), barre collée en bas qui défile de côté (icône + libellé court, aucun bouton derrière « Plus »). Réglage de la fiche : « en
      tête du dossier » → **« Dans le bandeau »** (aperçu, avertissement au-delà d'une ligne, libellé court facultatif « Corresp. »,
      « Mut. », valeurs calculées à cocher : poids actuel, SC, « localisation et stade » ; ligne 1 : « Chimio en cours », « RT en cours »
      cochés par défaut), aussi dans Administration › Par spécialité.
- [x] **R-G b (4.4 b) Grille à colonnes** : `.dos` à cinq enfants dans l'ordre du téléphone (bandeau, patient, travail, documents, barre),
      `grid-template-areas` au-delà de 940 puis 1 280 px (`container-type: inline-size` sur `#page`, `@container`) ; hauteur `100dvh`,
      colonnes `overflow-y: auto`, `min-height: 0`, `overscroll-behavior: contain` ; barre = case de la grille (pas `position: fixed` ;
      `sticky` en bas sur téléphone) ; hauteurs internes retirées (`.cs-liste` 545 px, `limiterHauteur('rdvListe', 5)`, `.o-pan.defile`) ;
      sous 940 px : 10 dernières consultations puis « Afficher les plus anciennes ». **Redessin d'abord** : `pageDossier` (appelé 52 fois)
      note et remet le défilement de chaque zone `[data-zone]` et le curseur (second temps, avec 7.2 : zones redessinées seules dans
      `app/dossier.js`). Accessibilité : sections avec `aria-label`, zones qui défilent atteignables au clavier (`tabindex="0"`).
- [x] **R-G c (4.4 c) Contenu des colonnes** : colonne Patient = résumé (modifiable sur place, hauteur qui suit le texte) et prochain
      rendez-vous toujours visibles, puis parties dépliables avec compteur (Rendez-vous et tâches à venir ; Consultations et hospitalisations ;
      Identité et administratif ; Informations médicales ; Fiche tumeur ; une partie dépliée montre tous ses champs, même éditeur), « Tout
      déplier », parties ouvertes gardées pour chacun ; **notes de consultation** : fermée = une ligne de 28 px (date · type court · début
      de la note en gris · nombre d'ordonnances · initiales), ouverte = pleine largeur sans colonne de libellés, auteur une fois sur le titre,
      « Signée le … », Modifier, Supprimer ; à l'ouverture seule la dernière consultation est dépliée ; « + Nouvelle consultation » en tête,
      « Notes seulement », « Tout déplier », Imprimer, « Agrandir ».
- [x] **R-G e (4.4 e) Panneau de chimio et de RT, visionneuse** (après R-G b) : nouvelle ligne, cure, jour, protocole, prescription de RT
      s'ouvrent dans un **panneau** à la place du centre et de la colonne de droite (~1 000 px), bandeau, colonne Patient et barre visibles ;
      contenu et étapes inchangés (cure → jour → valider) ; `panneau(html)` jumeau de `fenetre(html, "large")`, identifiants propres à chaque
      conteneur (`fOk`, `fErr`…) ; écrans déplacés un par un ; ordonnances et courriers restent une fenêtre par-dessus (on retrouve la cure
      telle quelle) ; petites actions en petite fenêtre comme aujourd'hui ; « Quitter sans enregistrer ? » sans blocage. Visionneuse
      (`afficherVue` de fichiers.js) à droite, ouverte sur le document le plus récent, menu « Documents (n) » (liste par date, type en
      étiquette, recherche, menu « Type »), Agrandir (deux tiers), Plein écran / Nouvelle fenêtre / Télécharger ; sans document « Déposer un
      document » ; l'onglet Documents du centre reste. Case de Paramètres › Impression : allergie et poids rappelés dans l'en-tête de la
      fenêtre d'ordonnance.
- [x] **R-G d (4.4 d) Réglages et finitions** : onglet **Paramètres › Dossier patient › Affichage du dossier** (pour le cabinet : parties
      dépliées par défaut, titulaire ou secrétaire ; pour moi : taille de la visionneuse, « Rétablir » les largeurs) — rangé dans
      `parametres/reglages` (clé `dossier`, `REGLAGES0`) et `utilisateurs/{uid}.dossier`, aucune règle à changer ; Administration › fonctions :
      les fonctions « prescriptions » cachent les boutons de la barre, compteur sous les boutons = fonction facultative ; Agrandir, flèche du
      menu, tablette, Safari. **Tests écrits d'abord** (pour tout le lot) : à 1440 × 900 la page ne défile pas, la barre est visible, chaque
      colonne défile ; enregistrer une note ou un rendez-vous ne déplace pas les autres colonnes ; à 390 px rien ne change ; débordements
      (28 pages × 5 largeurs) ; `NAVIGATEUR=webkit` ; **liste des boutons du dossier comparée avant / après, rôle par rôle (aucun absent)** ;
      bilan inchangé.
- [x] **(20/10/2026, demande de Dr Bentahila, testé ; en ligne : 20261020j, site seul)** Fiche du patient **modifiée une partie à la fois** : Nouveau patient
      (Patients, tableau de bord, nouveau rendez-vous de l'agenda ou de la salle d'attente : même fenêtre) et « Modifier » du bandeau (aussi celui
      d'« Afficher ») = **Identité et administratif** seulement ; **Informations médicales** et **Fiche tumeur** : chacune par le « Modifier » de sa
      partie dans la colonne Patient (fenêtre de cette partie seule). Statut du patient (décès) avec les Informations médicales ; « Supprimer le
      patient » avec l'identité ; une partie non montrée n'est ni lue ni réécrite (poids et sa date compris). `htmlFormulaire(x, { sec })`,
      `partiesPresentes` (fichepatient.js), `modifierIdentite(id, sec)` (v2.js). Bouton « Modifier » d'une partie selon le droit (identité ; fiche
      médicale ou traitements). Test `tests/test_fiche_parties.py` (30/30, 1440 et 390 px) ; test_fiche, test_fiche_tumeur, test_poids,
      test_editeur_fiche, test_intention adaptés (une partie à la fois).
- [x] **(20/10/2026, demande de Dr Bentahila, testé ; en ligne : 20261020k, site seul)** Dossier › **Consultations et hospitalisations** : Annuler le statut, Reçu,
      Modifier le prix, Modifier, Supprimer rangés sous un bouton **« ⋯ »** par ligne (`menuPts` / `ouvrirPts` de v2.js, même fenêtre flottante que
      la salle d'attente `.sa-menu` ; boutons gardés cachés dans la ligne, rien ne disparaît) ; restent visibles les actions à faire : Venu, Non venu,
      Encaisser, Fixer le prix. « Rendez-vous et tâches à venir » inchangé. Test `tests/test_dossier_menu_pts.py` (12/12, 1440 et 390 px).

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
- [x] **Demandes du 18/10/2026 (testé, en ligne : 20261018e)** : **fiche de chimiothérapie** (va à l'administration et aux mutuelles) :
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
- [x] **P9 Bibliothèque commune (18/10/2026, testé, en ligne : 20261018f + fonctions referencePublier, referenceDiff, signalerErreur)** :
      Administration › Bibliothèques › carte Oncologie › **« Publier une version »** (journal des changements écrit par l'administration,
      numéro de version ; historique affiché) ; dans chaque **cabinet déjà créé** (jamais celui du Dr Bentahila, qui est la source), page
      Protocoles : bandeau « Bibliothèque de référence (version N) : X nouveaux, Y différents du vôtre, Z ordonnances types » + journal ;
      « Voir et choisir » : différences ligne par ligne (lignes ajoutées / retirées, nom, cycle), pour chaque protocole **Prendre la version
      de la référence / Garder les deux / Garder le mien** (nouveau : Ajouter / Ne pas ajouter) ; jamais d'écrasement sans accord ; « Garder
      le mien » noté avec l'empreinte de la version refusée (`parametres/reference.refus`), reproposé seulement si la référence change encore ;
      protocole pris = « Copié de la bibliothèque de référence le … ». Différences calculées par le serveur (`functions/reference.js`,
      test-reference 9/9 ; rien n'est écrit dans un cabinet par le serveur). **Export** de la bibliothèque : Excel (toutes les colonnes) et
      livret PDF par localisation (page Protocoles). **« Signaler une erreur »** dans la fiche d'un protocole → journal de l'Administration.
      Test : `tests/test_p9.py` 13/13 (cabinet fictif cab-test).
- [ ] ~~P9 (plan)~~ **Bibliothèque commune à tous les cabinets** : l'Administration **publie une version** de la référence (numéro, date, journal des
      changements lisible : « v4 : anti-NK1 ajouté ») ; le serveur compare cabinet par cabinet (nouveaux, modifiés dans la référence,
      modifiés par le cabinet, supprimés) ; chaque cabinet voit « 14 protocoles mis à jour » et **le même écran que P1** (accepter, refuser,
      garder les deux) ; un protocole modifié par le cabinet n'est jamais écrasé sans son accord ; même chose pour les ordonnances types et
      les listes ; chaque diffusion tracée (qui, quand, quelle version, acceptée par qui) ; **export PDF** (livret par localisation) et
      **Excel** de la bibliothèque ; bouton « Signaler une erreur » qui remonte à l'Administration.
- [x] **P10 (18/10/2026, testé, en ligne : 20261018e)** : moteur `public/js/moteur/p10.js` (test-p10 19/19). **i) Interactions** (fenêtre de
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
      lignes compactes ; téléphone inchangé. **→ Remplacée par le lot R-G** (audit n° 5, maquettes revues les 13 et 17/10 : bandeau,
      colonnes Patient / Travail / Documents, barre d'actions, panneau de chimio et de RT).
## Phase D – Design
- [ ] **4.1 Toucher et contraste** : zones de 44 px (dossier, protocoles), badges vert et orange contrastés (→ 4,5), filtres repliés sur
      téléphone (bilan, protocoles), téléphone du patient en lien Onco360, champs de fichier habillés, ~40 libellés reliés à leur champ.
      (Contrastes de l'agenda : R-C6 ; loupe de recherche sur téléphone : R-B3.)
- [ ] **4.2 Fenêtres Onco360 à la place des boîtes grises** : les `alert` / `confirm` / `prompt` (123 au 11/10) remplacés par une fenêtre
      commune, en commençant par les suppressions et les fenêtres de validation de la chimio.

## Phase E – Code et exploitation
- [ ] **5.1 Code mort et fonctions communes** : `chValiderSeance`, `chHon`, `nlChoix`, `pfOnglet`, `prChoix`, `__v2pret`, variables et
      exports inutiles, styles inutilisés ; `esc`, `sansAcc`, `dfr`, ajout de jours, impression regroupés dans `moteur/outils.js` ; tests de
      cohérence site / serveur (`consJours`, `finRT`, `COULEURS0`, `REGLES_FIXES`) ; `configuration.js` découpé par famille (avec ESLint) ;
      `archives/` et `listes/` rangés hors du code. (+ `prixRdv` et `tarH` de moteur/rdv.js : R-C2.)
- [ ] **5.2 Écritures qui s'écrasent** : les écritures d'un bloc sans relecture (réglages, listes, pointages…) en transaction. (Bibliothèques :
      R-A1, à faire en premier ; montants, cases « Payé », versements, règlements : R-D3.)
- [ ] **5.3 Montée en charge** (avant un groupe) : photo du patient dans Cloud Storage, index léger des patients, liste par pages, dossier
      complet chargé à l'ouverture, agenda et alertes depuis l'index, traitements de nuit par cabinet. Objectif : 5 000 dossiers.
      (Avec R-C7 calcul de l'agenda gardé en mémoire et R-D4 cases « Payé » par année ; l'écoute des dossiers modifiés est faite en R-A4.)
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
  motif à saisir pour « Valider quand même » ; contrôle automatique des prémédications. (17/10, audits 4 à 8) : voir « Refusés le 17/10 »
  dans les décisions du 17/10 (caisse, hôpital de jour, calendrier de chimio, stupéfiant, COTIPRED remplacé, filgrastims, bilans intercure,
  double vérification, code-barres, A4 automatique, RT déplacée un jour férié).

## À placer
- `tests/test_comptable.py` : 6 vérifications en échec, déjà avant le 18/10 (vérifié le 19/10 sur les versions 20261018g et 20261019a) : le relevé
  du comptable n'est préparé que si la fonction « bilan.comptable » est active, et le réglage du pack du jeu de test la retire ; revoir le test
  (ou le réglage du jeu de test), pas l'application.
- (20/10, R-F4) Export de la semaine sur un autre support que Google Drive (OneDrive, Dropbox, disque réseau) : à faire quand un cabinet client le
  demande (chaque service demande sa propre autorisation et son propre envoi ; aujourd'hui : Google Drive, ou gardé dans Onco360 à télécharger).
- (20/10, R-F) Heure du Maroc : Node 24 (ICU 78.3, tzdata 2026c) donne `Africa/Casablanca` = UTC+0 en octobre 2026 ; Chrome, Safari et le Mac donnent UTC+1. À vérifier (changement d’heure légal ou erreur de tzdata) avant
  de se fier à une heure calculée côté serveur (`heureMaroc` du serveur, affichage des heures d'export dans l'historique).

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
