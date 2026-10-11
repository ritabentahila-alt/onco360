# Onco360 – feuille de route (plan unique, refait le 11/10/2026)

**Un seul plan** : ce fichier. Il remplace l'ancienne feuille de route (archivée en entier :
`archives/FEUILLE-DE-ROUTE-jusqu-au-2026-10-11.md`), les plans des audits (`AUDIT-EXTERNE-2.md`, `AUDIT-*.md`, `PLAN-*.md`,
gardés comme analyses) et les « Idées en attente ». Le journal des sessions est dans `JOURNAL.md`.

Sources du plan : les deux audits externes du dossier Drive « Audit » (« Audit pour vendre » du 10/10 : sécurité, conformité,
vente ; « Audit numéro 2 » du 11/10 : Modules, Fichiers et code, Fonctions, Essais et mesures, Design), relus point par point
contre le code du 11/10 (beaucoup de constats étaient déjà réglés : voir « Déjà fait »), et tout ce qui restait ouvert dans
l'ancienne feuille de route.

## Comment on travaille
- **Une étape = une session**, dans l'ordre des phases. Au début : lire ce fichier ; à la fin : cocher, noter les décisions,
  une ligne dans `JOURNAL.md`.
- Plusieurs sessions en parallèle : chacune annonce son étape ici (« en cours : session X ») et n'écrit que ses fichiers.
- Avant toute mise en ligne : tests (moteur, règles, navigateur), téléphone 390 px sans débordement, accord de Dr Bentahila.
  Bilan figé (352 317 DH) vérifié seulement si `bilan.js` ou les calculs changent.
- Mise en ligne depuis une copie propre du dernier enregistrement (pour ne pas publier le travail en cours d'une autre session).
- Code enregistré et poussé sur GitHub à la fin de chaque étape testée.
- Ce qui arrive en cours de route va dans « À placer » (en bas), sans changer d'étape.

## Règles à ne pas changer
- Honoraires de séance de chimio : tarif des Paramètres, 500 DH brut par jour validé (J1 et J8 = 2 × 500 DH), sans saisie manuelle.
- Le bilan doit rester identique au dirham près (sauf correction voulue, annoncée).
- Aucune donnée réelle de patient dans le code, le site, les tests ou GitHub.
- Une dose affichée pour un acte validé ne change plus jamais après coup (à partir de l'étape 2.2).

---

## Décisions de Dr Bentahila du 11/10/2026 (réponses aux audits)
- **Ancienne application retirée du site** : oui, à condition de pouvoir récupérer un jour **tous ses dossiers patients, à un
  instant donné, dans un format lisible hors de Firebase** (revente, autre plateforme) : obligatoire → étapes 0.2 et 1.6.
  Fait le 11/10 (0.1) : ses données restent dans la base.
- **Cures déjà validées** : les figer une fois, telles qu'elles s'affichent aujourd'hui (2.2).
- **Seuils** : confirmation si poids < 30 ou > 200 kg ; si clairance < 30 ou > 200 ml/min ; **dose vide = validation refusée** (2.3).
- **Bilan sanguin avant une cure : simple rappel**, jamais bloquant (2.6).
- **Mise en forme automatique du code : au dossier de cession** (7.2), pas avant.
- **Historique GitHub nettoyé** : oui (fait le 11/10, 0.3).
- **Pas de déconnexion automatique, jamais. Pas de double authentification** (médecins, administration).
- **Google Agenda inchangé** : le nom du patient reste affiché comme aujourd'hui.
- **« Supprimer le patient » reste une suppression** (pas d'archivage).
- **Allergies** : bandeau rouge seulement si une allergie est **cochée « oui »** (« aucune » ou vide : rien en rouge).
- **Tâches de contourage / dosimétrie** : continuent après la date de 1re séance, marquées « EN RETARD ».
- **Document « Rendez-vous » de radiothérapie** : titre « Calendrier théorique », état « Prévu ».
- **Notes de la secrétaire** : dans le même journal des consultations.
- **Documents déposés : tout en PDF** (pas d'original gardé).
- **Médecine générale gardée** (Dr Bentahila va créer un cabinet pour une consœur, en plus de ce qui existe) ; **Gynécologie gelée**.
- **Seuils supplémentaires acceptés** : taille 120-220 cm, surface 1,2-2,6 m², créatinine 3-30 mg/L (25-265 µmol/L), poids qui
  varie de plus de 10 % depuis la cure précédente (confirmation).
- **Radiothérapie** : confirmation si dose par fraction **> 22 Gy** ou dose totale > 80 Gy. Onco360 ne remplace pas ARIA
  (dosimétrie, séances validées par les manipulateurs) : il **rappelle** au médecin le contourage et la dosimétrie à valider,
  montre **où en est le patient** dans ses séances (calcul de calendrier) et **produit automatiquement** le compte rendu de fin,
  le calendrier des rendez-vous et le pli confidentiel. Pas d'organes à risque, pas de journal des séances.
- **Formulaires de consultation** « Oncologie » et « RT hebdomadaire » **proposés**, mais chaque cabinet peut tout décocher et ne
  garder que titre, date et note. **Note signée sans verrou** : on peut toujours la réécrire ; elle affiche « modifiée le … et le
  … », sans garder les anciennes versions.
- Déjà décidé dans les audits (annotations) : fiche tumeur proposée dans le paramétrage, chaque cabinet libre de l'afficher et de
  la mettre en tête du dossier, listes types dans la spécialité Oncologie, appliquées aux cabinets actifs (3.1) ; modèle de
  consultation par le formulaire réglable, sans nouveau code (3.4) ; « Séances réalisées » de radiothérapie = calcul de calendrier,
  gardé (c'est au physicien de tenir le carnet), **pas de journal des séances** ; confirmation avant de retirer une ligne de
  l'ordonnance (3.9) ; durée par type de consultation, réglage commun médecin / secrétaire (fait, AG2).

## Questions en attente (Claude les rappelle en début de session)
1. **Par Dr Bentahila** : mesurer la hauteur des en-têtes du papier (ordonnance A5, A4, documents) pour régler les marges
   (Paramètres › Impression).
2. **Par Dr Bentahila** : demander à GitHub de purger ses copies en cache (formulaire du support) ; regarder GitHub › Insights ›
   Traffic › « Git clones » (gardé 14 jours seulement) pour savoir si le dépôt a été copié pendant qu'il était public (10/10 au
   soir, et 11/10).
4. Seuils des alertes cliniques du tableau de bord (2.6) : perte de poids (5 % ? 10 %), PNN, plaquettes.

---

## Déjà fait au 11/10/2026 (détail : archives et JOURNAL.md)
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

---

# LE PLAN : 8 phases

| Phase | But | Étapes | Critère de fin |
|---|---|---|---|
| **0** Urgences | Fuite fermée, copie lisible, comptes protégés | 0.1 à 0.5 | Aucune donnée réelle en ligne ni sur GitHub ; copie lisible chaque nuit ; double authentification |
| **1** Sécurité | Fermer les failles du premier audit | 1.1 à 1.7 | Chaque faille couverte par un test (règles ou navigateur) |
| **2** Sécurité clinique | Doses et radiothérapie sûres | 2.1 à 2.6 | Les 11 essais de l'audit n° 2 ne reproduisent plus les défauts ; moteur testé à chaque mise en ligne |
| **3** Métier | Dossier oncologique, radiothérapie, chimio, infirmière, prescriptions | 3.1 à 3.10 | Patients filtrables par localisation et stade ; compte rendu de fin sans « à compléter » |
| **4** Design | Les corrections restantes de l'onglet Design | 4.1 à 4.3 | Contrastes et zones tactiles conformes ; plus de boîtes grises |
| **5** Code et exploitation | Code propre, sauvegardes, montée en charge, recette | 5.1 à 5.6 | Tests en une commande ; 5 000 dossiers fluides ; restauration testée |
| **6** Conformité et vente | Juriste, société, projet neutre, test d'intrusion | 6.1 à 6.6 | Autorisations déposées ; test d'intrusion sans faille élevée |
| **7** Cession | Dossier de cession, guides, démonstration | 7.1 à 7.4 | Un tiers installe et comprend Onco360 sans appeler Dr Bentahila |

Les phases 0 à 2 passent avant tout le reste. La phase 6 (juriste) se lance **en même temps** que la phase 1 : ses délais sont
longs et ne dépendent pas du code.

---

## Phase 0 – Urgences (cette semaine)

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
- [ ] **0.5 Fiche d'incident et gel** : Claude rédige la fiche (page en ligne sans connexion depuis le 06/10 au plus tard, date
      exacte d'après l'historique des déploiements Firebase ; 57 patients ; ce qui était visible ; retirée le 11/10 ; dépôt GitHub
      public moins d'une demi-heure le 10/10, **et de nouveau le 11/10** ; copies du dépôt d'après GitHub › Traffic, question 2)
      pour le juriste (information de la CNDP et des patients : décision du juriste).
      **Plus de création de cabinet réel** avant l'avis juridique (6.1) ; le cabinet de démonstration reste permis.

- [ ] **0.6 Jeu de test fictif, avant tout nouveau test** (avancé depuis 2.1 : chaque test écrit sur la sauvegarde réelle risque
      d'y laisser un nom, comme `test_agenda.py` le 11/10) : jeu construit par `functions/demo.js` pour tous les tests du
      navigateur (`tests/base.py`, `tests/mkseed.mjs`) ; `functions/test-demo.js` et les tests de calcul qui plantent sans
      `seed.json` rendus autonomes ; contrôle automatique : aucun nom du jeu réel dans `tests/`, `functions/`, `public/`.

## Phase 1 – Sécurité (premier audit, constats « élevé » et « moyen »)

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
- [ ] **1.2 Comptes** (pas de déconnexion automatique ni de double authentification : décision) : « Lien du mot de passe » réservé aux comptes jamais connectés, avec message au titulaire ; e-mail de la
      propriétaire dans les règles (`firestore.rules` 9) remplacé par la collection `administrateurs` ; profils des autres cabinets
      fermés (règles 27-34).
- [ ] **1.3 Droits imposés par le serveur** (étape 9 S2) : chaque droit de la grille vérifié dans les règles, pas seulement caché à
      l'écran (consultations : droit `consultations` ; documents ; finances) ; fiches de membres écrites par le serveur seul (règle
      93) ; modules et limites (dossiers, lieux) imposés par les règles ; historique (`fil`) d'une tâche non réécrivable (règle 185) ;
      type des fichiers déposés contrôlé (`storage.rules`) ; correction en masse des **diagnostics** réservée au médecin
      (`corrigerListes`), ancienne valeur gardée dans le journal ; secrétaire (droit « planning ») limitée au **poids de la séance du
      jour** dans `planningJson`. Limite connue à écrire dans le dossier de cession : le dossier patient se lit en entier dans le
      périmètre (Firestore ne filtre pas les champs). Un test de règles par droit (`tests/regles`).
- [x] ~~1.4 Google Agenda discret~~ : non retenu, Google Agenda reste comme aujourd'hui (décision du 11/10).
- [ ] **1.5 Bibliothèques et dépendances** : SheetJS 0.18.5 → 0.20.3 ; jszip, html2canvas, mammoth, SheetJS **copiées dans le site**
      (`public/vendor/`) ; SDK Firebase 10.12.2 → version actuelle (essai complet avant) ; `npm audit fix` des fonctions ;
      **contrôle avant mise en ligne** (`outils/avant-mise-en-ligne.sh` : aucun nom, téléphone, date de naissance ni `nomF` dans
      `public/`, tests lancés) ; espace d'essai « test-b1 » et ses comptes retirés de Firebase (avec l'accord de Dr Bentahila) ; **typage** léger du moteur de calcul et des fonctions serveur (commentaires JSDoc vérifiés
      par `tsc --checkJs`, sans changer le code).
- [ ] **1.6 Export complet et sauvegarde des fichiers** (condition de Dr Bentahila, réversibilité demandée par tout acheteur) :
      bouton **« Exporter tout le cabinet »** (titulaire, Paramètres › Cabinet ; aussi depuis l'administration pour un cabinet
      client à sa demande) = fonction serveur qui prépare un ZIP : JSON de toutes les collections du cabinet, tableau des patients
      (CSV, ouvrable dans Excel), tous les fichiers déposés (PDF) et la documentation ; lien de téléchargement valable 1 heure ;
      noté au journal d'audit. **Copie des fichiers déposés** chaque nuit vers un second emplacement (Cloud Storage, autre
      région, conservation 30 jours). **Restauration testée** une fois sur un projet vierge, mode d'emploi écrit (« Outil de
      restauration » des idées en attente).
- [ ] **1.7 Données propres au premier cabinet** (audit n° 2, Fichiers et code) : `COR0` (167 correspondants) écrit une fois dans
      `parametres/listes.cor` du cabinet Bentahila par `migrations()`, puis retiré du code ; « CASABLANCA » → ville du lieu
      (documents.js 75, 80) ; ville par défaut « Casablanca » → « À REMPLIR » surligné (documents.js 66, 133 ; ordonnances.js 479) ;
      **civilité du médecin** dans le profil (Dr homme / femme) → « soussigné(e) » (courriers.js 24, 30, 34 ; ordonnances.js 500),
      « Absent(e) » (v2.js) ; repli « HGC » des tarifs retiré (moteur/tarifs.js 18, parametres.js 89, v2.js 277 : acte « sans
      tarif » signalé ; bilan revérifié) ; « CNSS (AMO) » ajoutée aux mutuelles de départ (loi 54-23) ; fenêtres Analyses / Examens :
      « Aucune analyse choisie » au lieu de « Aucun médicament choisi » ; démonstration avec créatinine (`functions/demo.js` 26).

## Phase 2 – Sécurité clinique (doses, radiothérapie, protocoles)

- [ ] **2.1 Tests des doses qui vérifient vraiment** (après 0.6, avant toute modification du calcul) : `test_cures.py` et
      `test_seances.py` tournent mais ne contrôlent rien (11 affichages, 0 vérification) → vraies vérifications ;
      **`tests/moteur/test-doses.mjs`** : Mosteller, Cockcroft-Gault (mg/L, µmol/L),
      Calvert plafonné à 125, % reconduits, molécules ajoutées / retirées, J8 / J15, reports, cas limites, et les essais 1 à 4 et 11
      de l'audit (ils échouent avant 2.2-2.3, passent après) ; `tests/tout.sh` lance tout (moteur, serveur, règles, navigateur).
- [ ] **2.2 Cure figée à sa validation** (décision : oui) : à la validation de J1 et de chaque séance (chimio.js 352, 426), `fige` =
      { le, par, poids, taille, surface, créatinine + unité, âge, clairance, AUC, doses [{ molécule, dose calculée, %, dose
      retenue, unité }], protocole du jour } ; une cure validée s'affiche et s'imprime depuis `fige` ; « Annuler la validation »
      efface `fige` (tracé). **Une fois** (`migrations()`) : toutes les cures et séances déjà validées figées telles qu'elles
      s'affichent ce jour-là, marquées « figée le … d'après le dossier ». Journal d'audit : ancienne et nouvelle valeur pour les
      doses et les prescriptions (`functions/audit.js`). Bilan inchangé (test).
- [ ] **2.3 Bornes et prémédication** (décisions : poids 30-200 kg, clairance 30-200 ml/min, dose vide refusée ; taille 120-220 cm, surface 1,2-2,6 m², créatinine 3-30 mg/L, écart de poids > 10 %) :
      confirmation au-delà des bornes ; **validation refusée** si la dose d'une molécule est vide ou nulle, ou carboplatine sans
      créatinine ; unité de la créatinine affichée à la saisie ; poids saisi par la secrétaire qui s'écarte de plus de 10 % →
      alerte au médecin (cloche, bloc « À valider »). Prémédication reconnue par **classe** dans le dictionnaire des molécules
      (`DICT`, 83 entrées : antiémétiques, corticoïdes, antihistaminiques, atropine, facteurs de croissance, EPO, acide
      zolédronique, dénosumab ; DCI et marques) à la place de `RE_PREMED` (moteur/doses.js 5) et de la liste de protocoles.js.
- [ ] **2.4 Protocoles tracés** : **un document par protocole** (fin des blocs `lib_0…10` qui s'écrasent quand deux protocoles du
      même bloc sont modifiés) ; version (+1 à chaque modification), validé par, le, **source** (référentiel, article) ;
      modification d'un protocole validé → « à valider » ; une fois : protocoles sans statut marqués « Validé (avant le
      12/10/2026) », puis absence de statut = non validé (protocoles.js `valide`) ; modification réservée aux **médecins** (règle
      232) ; éditeur : dose maximale, arrondi, « tous les n cycles », « C1 seule » (déjà calculés par le moteur) ; croix de
      suppression déplacée dans l'éditeur, avec confirmation. Bibliothèques de référence par spécialité suivent le même format.
- [ ] **2.5 Radiothérapie contrôlée** (décisions du 11/10) : fenêtre de prescription : dose par fraction > 22 Gy ou totale > 80 Gy →
      confirmation ; 1re séance avant le scanner ou fin avant le début → refusé ; dose, fractions ou technique modifiées après la
      dosimétrie validée → « la dosimétrie devra être revalidée », validation retirée (gardée dans l'historique), tâche recréée ; tâches de contourage / dosimétrie maintenues après la date de 1re
      séance, « EN RETARD » (`functions/logique.js` 155-156) ;
      radiothérapie commencée sans contourage ou dosimétrie validés : étapes toujours affichées, en rouge, dans « À valider » ;
      libellé « Séances prévues à ce jour » partout ; document Rendez-vous « Calendrier théorique » ; plus d'impression des
      mentions « à compléter » / « À REMPLIR » : avertissement avant d'imprimer, comme les courriers ; ligne de signature du
      compte rendu gardée avec son texte (pas seule en page 2).
- [ ] **2.6 Rappel du bilan avant cure** (décision : simple rappel) : à la validation d'une cure, « Bilan biologique vu ? » avec
      saisie facultative (PNN, plaquettes, hémoglobine, créatinine) gardée dans `fige` ; sous des seuils (proposés : PNN < 1 500,
      plaquettes < 100 000) → message, jamais de blocage. Avec les **alertes cliniques** du tableau de bord (perte de poids > 5 %
      / 10 % depuis le début de la ligne, clairance basse avant carboplatine / cisplatine) : seuils à choisir par Dr Bentahila.

## Phase 3 – Métier (dossier oncologique, radiothérapie, chimiothérapie, prescriptions)

- [ ] **3.1 Fiche tumeur** (décision) : champs « choix » ajoutés au catalogue `FICHE` (localisation, côté, histologie, grade,
      cTNM / pTNM, stade, date du diagnostic, biomarqueurs RE, RP, HER2, Ki-67, PD-L1, EGFR, ALK, KRAS, BRAF, MSI, état général
      OMS 0-4) ; listes types dans la fiche de la spécialité Oncologie (`plateforme/specialites`) recopiées aux cabinets actifs
      (`ficheSpecialite`) ; chaque cabinet les affiche ou non, en tête du dossier ou non ; filtres de la page Patients par
      localisation et stade.
- [ ] **3.2 Allergies** (décision) : champ « Allergie connue : oui / non » + détail ; **seulement si « oui »** : bandeau rouge
      discret et permanent en tête du dossier (style `.allergie` existant), sur la fiche de
      chimiothérapie (avec le % de réduction) et sur les ordonnances ; alerte simple dans la fenêtre de prescription si le
      médicament contient le mot de l'allergie. Ordonnance : âge et poids du patient (au choix du cabinet).
- [ ] **3.3 Statut du patient** : en traitement, en surveillance, perdu de vue, décédé (+ date) ; date des dernières nouvelles
      (calculée) ; filtre ; décédé → plus de rappels, tâches automatiques ni alertes, rendez-vous futurs signalés ; « Supprimer »
      reste une suppression (décision) ; boutons « + Tâche » / « + Rendez-vous » en double retirés ; téléphone : identité
      repliée, onglets cliniques plus haut.
- [ ] **3.4 Consultations** (décisions) : formulaires **proposés**, que chaque cabinet peut entièrement décocher (titre, date et
      note seulement) : « Consultation d'oncologie » (poids, OMS, douleur EVA, toxicités
      gradées CTCAE : nausées, vomissements, diarrhée, mucite, neuropathie, asthénie, neutropénie fébrile ; conduite à tenir) et
      « RT hebdomadaire » (radiodermite, mucite, dysphagie, diarrhée, cystite, asthénie) dans la spécialité Oncologie, recopiés aux
      cabinets actifs ; note **signée** mais toujours modifiable : « signée le … par … · modifiée le … et le … », sans anciennes
      versions ; notes de la secrétaire dans le même journal.
- [ ] **3.5 Radiothérapie : volumes et rythmes** (rappel : Onco360 n'est pas ARIA) : volumes [{ nom, dose, fractions, dose par
      fraction }] ; petit « + » pour ajouter un complément séquentiel ou intégré ; pas d'organes à risque ; radiothérapies existantes = un volume (rien à ressaisir) ; rythmes : quotidien, un jour sur
      deux, deux par jour, un par semaine, jours choisis ; `finRT` en double (moteur/rt.js, functions/logique.js) : test de cohérence.
- [ ] **3.6 Radiothérapie : compte rendu de fin rempli** (décision) : le modèle actuel est gardé ; Onco360 remplit ce qu'il sait :
      **volumes et doses** (3.5) ; **dates** (fin renseignée, sinon fin calculée) ; **prochain rendez-vous** (s'il est pris dans
      « + Rendez-vous ») ; **bilan de contrôle** (s'il y a une ordonnance d'examens ou d'analyses à la dernière consultation) ; le
      reste (toxicité maximale, rendez-vous et bilan absents) **est rempli par le médecin** ; localisation, histologie et
      interruptions ne sont pas remplies. À l'impression : aucune mention « à compléter » imprimée (avertissement avant, comme les
      courriers). Formulaire « RT hebdomadaire » proposé (3.4), sans tableau des toxicités.
- [ ] **3.7 Chimiothérapie : suivi et ergonomie** : doses cumulées par molécule (mg/m², plafonds : doxorubicine 450-550,
      épirubicine 900, bléomycine 400 UI ; alerte) ; intention de la ligne (néoadjuvante, adjuvante, métastatique, concomitante,
      palliative) et réponse (complète, partielle, stable, progression) ; doses visibles dès la ligne de cure ; plus de fenêtre
      intermédiaire pour une cure d'un seul jour ; un bouton principal par cure + menu ⋯ (« Arrêter la ligne », « Supprimer »,
      « Annuler » dans le menu) ; en-tête de ligne en double retiré ; téléphone : table des cures en cartes, « % dose » et « Dose
      retenue » visibles.
- [ ] **3.8 Écran de l'infirmière** (ancienne étape 11 I1) : tablette, patients du jour, cure et molécules ; pose de chaque poche
      (heure, par qui), voie d'abord (PAC, périphérique, PICC), constantes, tolérance, effets indésirables ; visible dans l'onglet
      Chimiothérapie ; règle `administrations` déjà écrite ; droit « administrer » remis dans Accès.
- [ ] **3.9 Prescriptions et documents** (décisions ; documents déposés : tout en PDF, inchangé) : confirmation avant de retirer une ligne de l'ordonnance en
      préparation ; ⭐ ✎ ✕ seulement en mode « Gérer la liste » ; doublon refusé dans toutes les familles ; **en-tête et pied
      générés** au choix du cabinet (logo du lieu, nom, INPE, signature scannée ; ou papier à en-tête) ; choix du médecin signataire
      quand le cabinet a plusieurs médecins.
- [ ] **3.10 Paramètres, fin** : onglet WhatsApp replié par message (4 001 px) ; explications longues → bulle « ? » ; croix rouges des
      listes dans un menu ⋯ avec confirmation ; `pageConfiguration` (30 427 caractères) découpée par famille.

## Phase 4 – Design (corrections restantes de l'onglet Design)
Déjà faits : 6 (salle, agenda), 8 (tableau de bord), 10 (Paramètres), 11 en partie (salle). Les corrections 1 à 5 et 7 sont dans
les étapes 1.7, 2.5, 3.2 et 3.7.
- [ ] **4.1 Toucher et contraste** : zones de 44 px sur écran tactile (dossier 35 / 42 trop petites, protocoles 27 / 30) ; badges vert
      et orange contrastés (3,77 et 3,51 → 4,5) ; filtres repliés derrière un bouton sur téléphone (bilan, protocoles) ; téléphone
      du patient en lien Onco360 (plus de lien bleu souligné) ; champs de fichier habillés ; ~40 libellés reliés à leur champ.
- [ ] **4.2 Fenêtres Onco360 à la place des boîtes grises** : les 123 `alert` / `confirm` / `prompt` remplacés par une fenêtre
      commune (`A.confirmer`, `A.message`), en commençant par les suppressions.
- [ ] **4.3 Un seul langage visuel** : 8 tailles de police au lieu de 24 ; les 180 couleurs écrites en dur → variables ; un seul jeu
      d'icônes ; page d'administration au même style qu'Onco360 ; barre du haut (recherche en pilule, cloche et avatar, ancienne 20.5).

## Phase 5 – Code et exploitation
- [ ] **5.1 Code mort et fonctions communes** : retirer `chValiderSeance`, `chHon`, `nlChoix`, `pfOnglet`, `prChoix`, `__v2pret`,
      17 variables inutiles, 5 exports jamais importés, 15 styles inutilisés (sauf `.allergie`) ; `esc` (5 copies), `sansAcc` (7),
      `dfr` (5), ajout de jours (3), impression (9 fichiers) regroupés dans `js/moteur/outils.js` ; tests de cohérence site / serveur
      (`consJours`, `finRT`, `COULEURS0`, `REGLES_FIXES`) ; ESLint (contrôle seulement) ; `modeles/LISEZMOI.md` corrigé ;
      `archives/` et `listes/` rangés hors du code.
- [ ] **5.2 Écritures qui s'écrasent** : les 17 écritures d'un bloc sans relecture (réglages, listes, pointages…) en transaction.
- [ ] **5.3 Montée en charge** (avant de vendre à un groupe ; à 620 dossiers tout reste rapide) : photo du patient dans Cloud Storage
      (plus dans le dossier) ; index léger des patients (nom, n°, diagnostic, statut, lieu, prochains actes) ; liste par pages
      (50, « Afficher plus ») ; dossier complet chargé à l'ouverture ; agenda et alertes depuis l'index ; traitements de nuit par
      cabinet (`tachesAutoNuit`, `agendaNuit`). Objectif : 5 000 dossiers, une lettre dans la recherche < 0,1 s.
- [ ] **5.4 Restes de l'ancienne application** : « Payé auto. » des actes d'avant le 12/10/2026 converti en pointages explicites,
      puis `FIN_PAYE_AUTO` retiré (bilan identique) ; `rdvMigre`, `brutV1`, branches v1, `migrerV1`, `tableDepuisV1`,
      `texteTotaux` retirés ; `migrations()` vidé de ce qui est fait ; règles des anciennes collections retirées une fois la base v1
      exportée (JSON du 06/10 + export Firestore gardé).
- [ ] **5.5 Recette et mise en ligne** : projet Firebase de recette ; script unique qui lance les tests puis met en ligne site, règles
      et fonctions ensemble ; supervision des erreurs (journal des erreurs du navigateur et du serveur) ; journaux de l'hébergement
      (Cloud Logging).
- [ ] **5.6 Application installable et hors ligne** (ancienne étape 10) : icône, plein écran ; lecture des dossiers déjà ouverts et
      du planning du jour sans réseau ; bandeau « Hors ligne » ; données effacées à la déconnexion.

## Phase 6 – Conformité et vente (avec un juriste ; à lancer dès la phase 1)
- [ ] **6.1 Juriste** : autorisation CNDP type (F-113, données de santé) pour chaque cabinet, notification de transfert (F-118 :
      base en Belgique ; comptes traités aux États-Unis par Firebase Authentication), contrat de sous-traitance, conditions
      d'utilisation, politique de confidentialité (aussi pour la validation Google), durées de conservation (dont le journal
      d'audit), incident du 10/10 (0.5).
- [ ] **6.2 Qualification** : Onco360 est-il un dispositif médical (loi 84-12 ; en Europe, calcul de doses de cytostatiques = classe
      III) ? Choisir le positionnement (« aide au calcul, sous la responsabilité du médecin »).
- [ ] **6.3 Contenus** : autorisation d'eviQ (licence non commerciale) ou source d'origine de chaque protocole ; vérifier qu'aucun
      élément de Tbibclic ni de GestiCab n'est repris à l'identique.
- [ ] **6.4 Société et droits** : société éditrice (compatible avec l'exercice médical) ; **Dr Rita Bentahila seule autrice** de
      tout le code et de tout le contenu (Hamza Benzekri a seulement prêté son compte Claude au début, sans rien écrire : une
      attestation de sa part peut être demandée par un acheteur) ; statut du code écrit avec une IA.
- [ ] **6.5 Projet neutre** : organisation Google Cloud au nom de la société, projet Firebase neutre, nom de domaine (onco360.ma),
      variante hébergée au Maroc si l'acheteur est public ou d'importance vitale (loi 05-20, décret 2-24-921).
- [ ] **6.6 Test d'intrusion** par un prestataire externe (après les phases 1 et 2).

## Phase 7 – Dossier de cession (ancienne étape 12)
- [ ] **7.1 Installation sur un projet vierge en moins de 30 minutes** (README, `.env.example`, commandes) ; architecture ; schéma
      de la base ; règles commentées ; fonctions serveur et scripts.
- [ ] **7.2 Code lisible** : mise en forme automatique (Prettier) en une seule fois (décision), découpage de `v2.js` et des trois
      grosses fonctions (`pageConfiguration`, `pageDossier`, `editeurReglage`) sous la protection des tests.
- [ ] **7.3 Guides et démonstration** : guides Médecin, Secrétariat, Infirmière (PDF illustrés sur le cabinet de démonstration, aide
      dans l'application) ; cahier de recette ; scénario de démonstration de 15 min ; plaquette de 2-3 pages.
- [ ] **7.4 Dossier de vente** : preuves d'usage (cabinets actifs, chiffres d'activité sur plusieurs mois), dossier clinique (règles
      de calcul validées, protocoles et sources, résultats des tests du moteur), rapport de test d'intrusion, registre des incidents,
      note de conformité, NDA, contrat de cession, chaîne de droits.

---

## Gelé, plus tard, annulé
- **Gelé** : Gynécologie (aucun pack). **Médecine générale gardée** (décision du 11/10 : Dr Bentahila va créer un cabinet pour une
  consœur) : son pack et sa bibliothèque à préparer quand elle le demande ; aucun ajout à l'administration, aux abonnements ni aux relances avant la fin de la phase 3.
- **Plus tard, si un client le demande** : circuit de la pharmacie (PUI) et rôle Pharmacien ; alertes sur le téléphone même Onco360
  fermé ; bouton « Mode démo » sur un vrai cabinet ; interopérabilité HL7 / FHIR, laboratoire, imagerie (liens DICOM) — en
  commençant par l'import du relevé des séances de l'accélérateur ; codes d'activation ; renommer un menu depuis l'administration ;
  « + Arrivée sans rendez-vous » et filtre Praticien de la salle d'attente.
- **Non retenu** (11/10) : déconnexion automatique, double authentification, Google Agenda anonymisé, archivage des patients,
  original Word / Excel gardé, organes à risque, tableau des toxicités de radiothérapie.
- **Non retenu** (avant) : pointer en lot dans le Bilan ; journal des séances de radiothérapie saisi à la main ; alerte de poids de la
  secrétaire au sens de 19.6 (remplacée par l'alerte d'écart > 10 % de 2.3) ; rappels WhatsApp automatiques ; assistant IA.

## À placer
- (rien pour l'instant)

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

