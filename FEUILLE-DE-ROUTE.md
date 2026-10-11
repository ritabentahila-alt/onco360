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
- Déjà décidé dans les audits (annotations) : fiche tumeur proposée dans le paramétrage, chaque cabinet libre de l'afficher et de
  la mettre en tête du dossier, listes types dans la spécialité Oncologie, appliquées aux cabinets actifs (3.1) ; modèle de
  consultation par le formulaire réglable, sans nouveau code (3.4) ; « Séances réalisées » de radiothérapie = calcul de calendrier,
  gardé (c'est au physicien de tenir le carnet), **pas de journal des séances** ; confirmation avant de retirer une ligne de
  l'ordonnance (3.9) ; durée par type de consultation, réglage commun médecin / secrétaire (fait, AG2).

## Questions en attente (Claude les rappelle en début de session)
1. **Historique GitHub** : les 57 dossiers de l'ancienne application restent dans l'historique du dépôt (privé). Le nettoyer
   (réécriture de l'historique, toutes les sessions arrêtées pendant ce temps) ? Recommandé : oui (0.3).
2. **Tâches automatiques** de contourage / dosimétrie après la date de 1re séance : continuer, marquées « EN RETARD » ? (2.5)
3. **Document « Rendez-vous » de radiothérapie** : titre « Calendrier théorique », état « Prévu » (plus de « Terminé » inventé) ? (2.5)
4. **Supprimer un patient** → **archiver** (caché, restaurable) ; suppression définitive encore possible pour le titulaire seul,
   depuis les archives ? (3.3)
5. **Notes de la secrétaire** dans le journal des consultations : même journal, ou type « Note administrative » à part ? (3.4)
6. **Documents Word / Excel déposés** : garder aussi l'original à côté du PDF ? (3.9)
7. **Médecine générale et Gynécologie** (aucun pack) : les geler, cachées de l'administration, code gardé ? (phase 6)
8. **Google Agenda** : par défaut, initiales ou n° de dossier à la place du nom, sans diagnostic ni téléphone ; chaque cabinet
   peut remettre le nom ? (1.4)
9. **Déconnexion automatique** après combien de minutes sans activité (proposé : 30 min ; 8 h pour l'écran de la salle
   d'attente) ? (1.2)
10. Seuils proposés en plus (confirmation, jamais bloquants) : taille < 120 ou > 220 cm (taille saisie en mètres), surface < 1,2 ou
    > 2,6 m², créatinine hors 3-30 mg/L (25-265 µmol/L), poids qui varie de plus de 10 % depuis la cure précédente. D'accord ? (2.3)
11. Mesurer la hauteur des en-têtes du papier (ordonnance A5, A4, documents) pour régler les marges (Paramètres › Impression).

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
- [ ] **0.2 Copie lisible de tout Onco360, chaque nuit** (condition de Dr Bentahila) : le script `apps-script/onco360-sauvegarde.gs`
      est prêt mais **jamais installé** (aucun fichier `Onco360_…` dans le Drive). Dr Bentahila le colle dans le projet Apps Script
      « Chimio HGC » et lance `installerSauvegardeOnco360` (5 min, Claude guide pas à pas) ; Claude vérifie la 1re copie
      (`Drive › Sauvegardes › Onco360`) : tous les dossiers, consultations, finances, réglages, au format JSON lisible par n'importe
      quel logiciel. Le script ne copie que le cabinet du Dr Bentahila (le sien), pas les autres cabinets ; il doit aussi ne plus
      emporter les profils des autres cabinets (`utilisateurs`) → limiter aux membres de son cabinet. Les fichiers déposés (PDF) ne
      sont pas dans cette copie → 1.6.
- [ ] **0.3 Historique GitHub nettoyé** (question 1) : retirer `public/ancienne-app.html` de tout l'historique (`git filter-repo`),
      pousser, demander à GitHub de purger ses copies en cache ; toutes les sessions arrêtées pendant l'opération, puis repartent
      d'un dépôt neuf. La copie privée (0.1) reste sur le Mac.
- [ ] **0.4 Comptes protégés** (par Dr Bentahila, Claude guide) : double authentification sur le compte Google propriétaire du
      projet Firebase (ritabentahila@gmail.com) et sur le compte d'administration (gbentahila@hotmail.fr : son compte Google /
      Microsoft) ; la double authentification **dans Onco360** (médecins, administration) vient en 1.2.
- [ ] **0.5 Fiche d'incident et gel** : Claude rédige la fiche (page en ligne sans connexion depuis le 06/10 au plus tard, date
      exacte d'après l'historique des déploiements Firebase ; 57 patients ; ce qui était visible ; retirée le 11/10 ; dépôt GitHub
      public moins d'une demi-heure le 10/10) pour le juriste (information de la CNDP et des patients : décision du juriste).
      **Plus de création de cabinet réel** avant l'avis juridique (6.1) ; le cabinet de démonstration reste permis.

## Phase 1 – Sécurité (premier audit, constats « élevé » et « moyen »)

- [ ] **1.1 Injections de code** : photo du patient (`v2.js` 57 `bulle`), photo de profil et signature échappées et limitées à
      `data:image/jpeg|png` ; nettoyeur HTML (`nettoyer`, ordonnances.js 586) appliqué aussi **à l'affichage** des ordonnances,
      courriers et documents de radiothérapie (ordonnances.js 687, documents.js 158) ; règles : format des photos et taille du HTML
      ; **politique CSP** dans `firebase.json` (scripts du site, de gstatic et de la connexion Google seulement). Tests : règles
      (photo `javascript:` refusée), navigateur (ordonnance piégée affichée sans exécuter de code).
- [ ] **1.2 Sessions et comptes** (question 9) : déconnexion après inactivité (réglable) ; double authentification pour les
      médecins et l'administration (Identity Platform, code par application d'authentification ; à essayer d'abord sur le cabinet
      de démonstration) ; « Lien du mot de passe » réservé aux comptes jamais connectés, avec message au titulaire ; e-mail de la
      propriétaire dans les règles (`firestore.rules` 9) remplacé par la collection `administrateurs` ; profils des autres cabinets
      fermés (règles 27-34).
- [ ] **1.3 Droits imposés par le serveur** (étape 9 S2) : chaque droit de la grille vérifié dans les règles, pas seulement caché à
      l'écran (consultations : droit `consultations` ; documents ; finances) ; fiches de membres écrites par le serveur seul (règle
      93) ; modules et limites (dossiers, lieux) imposés par les règles ; historique (`fil`) d'une tâche non réécrivable (règle 185) ;
      type des fichiers déposés contrôlé (`storage.rules`) ; correction en masse des **diagnostics** réservée au médecin
      (`corrigerListes`), ancienne valeur gardée dans le journal ; secrétaire (droit « planning ») limitée au **poids de la séance du
      jour** dans `planningJson`. Limite connue à écrire dans le dossier de cession : le dossier patient se lit en entier dans le
      périmètre (Firestore ne filtre pas les champs). Un test de règles par droit (`tests/regles`).
- [ ] **1.4 Google Agenda discret** (question 8) : par défaut initiales ou n° de dossier, sans diagnostic ni téléphone
      (`functions/logique.js`, `moteur/agenda.js`) ; réglage par cabinet (Paramètres › Google Agenda) ; agendas refaits
      (`agendaNuit`). Le passé déjà écrit est refait aussi.
- [ ] **1.5 Bibliothèques et dépendances** : SheetJS 0.18.5 → 0.20.3 ; jszip, html2canvas, mammoth, SheetJS **copiées dans le site**
      (`public/vendor/`) ; SDK Firebase 10.12.2 → version actuelle (essai complet avant) ; `npm audit fix` des fonctions ;
      **contrôle avant mise en ligne** (`outils/avant-mise-en-ligne.sh` : aucun nom, téléphone, date de naissance ni `nomF` dans
      `public/`, tests lancés) ; espace d'essai « test-b1 » et ses comptes retirés de Firebase (avec l'accord de Dr Bentahila).
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

- [ ] **2.1 Tests autonomes, doses comprises** (avant toute modification du calcul) : jeu fictif construit par `functions/demo.js`
      (8 patients) pour tous les tests du navigateur à la place de `tests/seed.json` (`tests/base.py`, `tests/mkseed.mjs`) ;
      `functions/test-demo.js` sans `seed.json` ; **`tests/moteur/test-doses.mjs`** : Mosteller, Cockcroft-Gault (mg/L, µmol/L),
      Calvert plafonné à 125, % reconduits, molécules ajoutées / retirées, J8 / J15, reports, cas limites, et les essais 1 à 4 et 11
      de l'audit (ils échouent avant 2.2-2.3, passent après) ; `tests/tout.sh` lance tout (moteur, serveur, règles, navigateur).
- [ ] **2.2 Cure figée à sa validation** (décision : oui) : à la validation de J1 et de chaque séance (chimio.js 352, 426), `fige` =
      { le, par, poids, taille, surface, créatinine + unité, âge, clairance, AUC, doses [{ molécule, dose calculée, %, dose
      retenue, unité }], protocole du jour } ; une cure validée s'affiche et s'imprime depuis `fige` ; « Annuler la validation »
      efface `fige` (tracé). **Une fois** (`migrations()`) : toutes les cures et séances déjà validées figées telles qu'elles
      s'affichent ce jour-là, marquées « figée le … d'après le dossier ». Journal d'audit : ancienne et nouvelle valeur pour les
      doses et les prescriptions (`functions/audit.js`). Bilan inchangé (test).
- [ ] **2.3 Bornes et prémédication** (décisions : poids 30-200 kg, clairance 30-200 ml/min, dose vide refusée ; question 10) :
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
- [ ] **2.5 Radiothérapie contrôlée** (questions 2, 3) : fenêtre de prescription : dose par fraction > 8 Gy ou totale > 80 Gy →
      confirmation ; 1re séance avant le scanner ou fin avant le début → refusé ; dose, fractions ou technique modifiées après la
      dosimétrie validée → « la dosimétrie devra être revalidée », validation retirée (gardée dans l'historique), tâche recréée ;
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
- [ ] **3.2 Allergies** : bandeau rouge discret et permanent en tête du dossier (style `.allergie` existant), sur la fiche de
      chimiothérapie (avec le % de réduction) et sur les ordonnances ; alerte simple dans la fenêtre de prescription si le
      médicament contient le mot de l'allergie. Ordonnance : âge et poids du patient (au choix du cabinet).
- [ ] **3.3 Statut du patient et archivage** (question 4) : en traitement, en surveillance, perdu de vue, décédé (+ date) ; date des
      dernières nouvelles (calculée) ; filtre ; décédé → plus de rappels, tâches automatiques ni alertes, rendez-vous futurs
      signalés ; « Supprimer » → « Archiver » ; boutons « + Tâche » / « + Rendez-vous » en double retirés ; téléphone : identité
      repliée, onglets cliniques plus haut.
- [ ] **3.4 Consultations** (décision ; question 5) : formulaire « Consultation d'oncologie » (poids, OMS, douleur EVA, toxicités
      gradées CTCAE : nausées, vomissements, diarrhée, mucite, neuropathie, asthénie, neutropénie fébrile ; conduite à tenir) et
      « RT hebdomadaire » (radiodermite, mucite, dysphagie, diarrhée, cystite, asthénie) dans la spécialité Oncologie, recopiés aux
      cabinets actifs ; note **signée** (verrouillée ; une modification crée une version, l'ancienne gardée).
- [ ] **3.5 Radiothérapie : volumes et rythmes** : volumes [{ nom, dose, fractions, dose par fraction }], complément séquentiel ou
      intégré, organes à risque en note ; radiothérapies existantes = un volume (rien à ressaisir) ; rythmes : quotidien, un jour sur
      deux, deux par jour, un par semaine, jours choisis ; `finRT` en double (moteur/rt.js, functions/logique.js) : test de cohérence.
- [ ] **3.6 Radiothérapie : toxicités et compte rendu** : tableau des toxicités semaine par semaine (consultations « RT
      hebdomadaire ») ; compte rendu de fin rempli (localisation et histologie, volumes et doses, dates réelles, interruptions,
      toxicité maximale par grade, prochain rendez-vous, bilan de contrôle) : plus aucune mention « à compléter ».
- [ ] **3.7 Chimiothérapie : suivi et ergonomie** : doses cumulées par molécule (mg/m², plafonds : doxorubicine 450-550,
      épirubicine 900, bléomycine 400 UI ; alerte) ; intention de la ligne (néoadjuvante, adjuvante, métastatique, concomitante,
      palliative) et réponse (complète, partielle, stable, progression) ; doses visibles dès la ligne de cure ; plus de fenêtre
      intermédiaire pour une cure d'un seul jour ; un bouton principal par cure + menu ⋯ (« Arrêter la ligne », « Supprimer »,
      « Annuler » dans le menu) ; en-tête de ligne en double retiré ; téléphone : table des cures en cartes, « % dose » et « Dose
      retenue » visibles.
- [ ] **3.8 Écran de l'infirmière** (ancienne étape 11 I1) : tablette, patients du jour, cure et molécules ; pose de chaque poche
      (heure, par qui), voie d'abord (PAC, périphérique, PICC), constantes, tolérance, effets indésirables ; visible dans l'onglet
      Chimiothérapie ; règle `administrations` déjà écrite ; droit « administrer » remis dans Accès.
- [ ] **3.9 Prescriptions et documents** (décision ; question 6) : confirmation avant de retirer une ligne de l'ordonnance en
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
- [ ] **6.4 Société et droits** : société éditrice (compatible avec l'exercice médical) ; cessions de droits signées par toute
      personne ayant contribué (dont Hamza Benzekri) ; statut du code écrit avec une IA.
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
- **Gelé** (question 7) : Médecine générale et Gynécologie (aucun pack ; modules « Traitements et stocks », « Matériel et
  consommables ») ; aucun ajout à l'administration, aux abonnements ni aux relances avant la fin de la phase 3.
- **Plus tard, si un client le demande** : circuit de la pharmacie (PUI) et rôle Pharmacien ; alertes sur le téléphone même Onco360
  fermé ; bouton « Mode démo » sur un vrai cabinet ; interopérabilité HL7 / FHIR, laboratoire, imagerie (liens DICOM) — en
  commençant par l'import du relevé des séances de l'accélérateur ; codes d'activation ; renommer un menu depuis l'administration ;
  « + Arrivée sans rendez-vous » et filtre Praticien de la salle d'attente.
- **Non retenu** : pointer en lot dans le Bilan ; journal des séances de radiothérapie saisi à la main ; alerte de poids de la
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

