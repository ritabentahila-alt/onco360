# Onco360 – feuille de route

Document de suivi du projet, tenu à jour à chaque étape. **Une étape = une fenêtre (conversation)**.
Au début de chaque fenêtre, Claude lit ce fichier. À la fin, il coche ce qui est fait, note les décisions et ajoute une
ligne au journal (en bas).

## Comment on travaille
- Une seule étape à la fois, dans l'ordre ci-dessous. Une nouvelle fenêtre pour chaque étape.
- Avant toute mise en ligne : test dans le navigateur, bilan 2026 inchangé (352 317 DH au 06/10/2026), écran de téléphone
  (390 px, rien ne déborde). Claude demande l'accord avant de mettre en ligne.
- Les idées qui arrivent en cours de route vont dans « Idées en attente » (en bas), pour ne pas les perdre sans
  changer d'étape.

---

## Déjà fait (jusqu'au 06/10/2026)
- [x] Onco360 complet (phases A à D) et bascule : Onco360 est l'application de référence, l'ancienne est en lecture seule.
- [x] Sauvegardes :
  - sauvegarde Firebase chaque soir (14 semaines) ;
  - restauration à la minute près sur 7 jours (activée le 06/10) ;
  - copie lisible dans le Drive : code prêt (`apps-script/onco360-sauvegarde.gs`), installation facultative.
- [x] Google Agenda **par personne** : Profil › Google Agenda › « Lier mon Google Agenda ». Chaque membre a un agenda
      « Onco360 » dans son propre compte Google, avec ses patients selon ses droits. Relié pour Dr Bentahila le 06/10.
- [x] Ancien agenda (script Google, ex-« Chimio HGC ») arrêté et supprimé par Dr Bentahila le 06/10.

---

## Étape 1 – Remodelage du dossier patient (document « gesticab explication », reçu le 06/10/2026)
But : un dossier patient à onglets, avec un vrai journal de consultations et des ordonnances comme dans GestiCab
(médicaments, examens complémentaires, ordonnances types, courriers, analyses), imprimables en A5 ou A4.
L'étape est longue : elle est découpée en **sous-étapes, une fenêtre chacune**, dans l'ordre. Un seul « moteur »
d'ordonnance est construit en 1C, puis réutilisé tel quel en 1E pour les quatre autres familles.

**1.0 – Préparation**
- [x] Historique des versions (git) **dans le dossier du projet** (fait le 07/10) : première version enregistrée = point de
      retour avant le remodelage. Exclus de l'historique : données de test des patients (`tests/seed.json`), sauvegardes
      JSON, `node_modules`, journaux. Le dossier git vide ouvert par erreur sur tout le dossier personnel (`~/.git`)
      a été supprimé par Dr Bentahila le 07/10.
- [x] Réponses de Dr Bentahila aux questions ci-dessous (toutes réglées le 07/10).

**1A – Onglets du dossier** (fait et testé le 07/10, pas encore en ligne)
Disposition décidée par Dr Bentahila le 07/10, de haut en bas :
- [x] En haut, inchangés : identité + résumé du patient, rendez-vous à venir.
- [x] En dessous, **un seul cadre** avec 4 onglets : **Consultation · Chimiothérapie · Radiothérapie · Documents** (avec
      leur nombre), **pictogrammes au trait** (pas d'émoticônes).
- [x] Tout en bas, **dans un autre cadre** : « Consultations et hospitalisations » (rendez-vous passés, venu / non venu,
      prix à encaisser), gardé tel qu'aujourd'hui, en dehors des onglets.
- [x] Chimiothérapie = carte chimio actuelle ; Radiothérapie = carte RT actuelle, **avec ses boutons pli confidentiel,
      compte rendu de fin et rendez-vous Excel** (c'est de là qu'on les génère, décision du 07/10).
- [x] Documents : pour l'instant un message ; les documents générés s'y **enregistreront** (étape 1A bis).
- [x] Le dossier **s'ouvre toujours sur Consultation** ; un clic sur un onglet affiche sa carte ; l'onglet reste affiché
      après un enregistrement, et on revient sur Consultation en rouvrant le dossier. Sans l'onglet Consultation
      (infirmière), le premier onglet permis s'ouvre.
- [x] Onglets montrés selon les droits (testé : médecin 4 onglets ; secrétaire Consultation, Radiothérapie, Documents ;
      infirmière Chimiothérapie seule).
- [x] Téléphone 390 px : les 4 onglets tiennent sur la largeur (pictogramme au-dessus du nom), rien ne déborde.
- [x] Bilan 2026 inchangé : 352 317 DH. Aucune erreur dans la console.
- [ ] Mise en ligne (avec l'accord de Dr Bentahila).

Test : Playwright n'est pas installé sur ce Mac ; testé dans le navigateur intégré avec le faux Firebase, sur une copie
du site dans un dossier temporaire (macOS empêche le serveur de test de lire le Bureau).

**1A bis – Copies des documents dans l'onglet Documents** (demandé le 06/10 : « le logiciel garde des copies »)
Proposition, à valider avec Dr Bentahila :
- [ ] **Stockage des fichiers** dans Firebase Storage (`espaces/{e}/patients/{p}/documents/…`), avec une fiche Firestore par
      document (type, nom, date, auteur, établissement). Règles de sécurité = périmètre + droit « documents » ; l'infirmière
      ne voit que les fiches chimio.
- [ ] **Copie automatique** à chaque génération : pli, compte rendu de fin, rendez-vous Excel, ordonnances, et fiche chimio
      (instantané exact de la fiche imprimée, réimprimable à l'identique).
- [ ] **« Ajouter la version complétée »** : le .docx retouché dans Word, gardé à côté de l'original.
- [ ] **Ajout libre** : PDF ou photo prise au téléphone (anapath, imagerie, bilans…), taille limitée.
- [ ] **Suppression** réservée au médecin, avec une corbeille.
- [ ] **Sauvegarde** : la sauvegarde Firebase du soir ne copie pas les fichiers. Activer la suppression douce et les versions
      du stockage.

**1B – Consultations (journal médical)**
- [ ] « Nouvelle consultation » : titre à remplir, date du jour, nom de la personne qui l'a créée. Créée **à la main** par le
      médecin ou la secrétaire : marquer un rendez-vous « Venu » ne crée rien (décision du 07/10).
- [ ] À l'intérieur : ligne **Note** (texte libre, à la place de « Motif Cs »).
- [ ] Chaque prescription faite ajoute une ligne : « Médic. — Amlodipine 5 mg », « Analyses — NFS Urée Créatinine »,
      « Examens compl. — … », « Ordo type — … », « Courrier — … ». Clic sur la ligne = revoir le document.
- [ ] Consultations **pliables** (date + titre), la plus récente ouverte.
- [ ] Sous la consultation, barre de 5 boutons : **Médic. ▾ · Examens compl. ▾ · Ordo type ▾ · Analyses ▾ · Courriers ▾**
      (le bouton = nouvelle prescription ; la petite flèche = antécédents).
- [ ] Données : une fiche par consultation (nouvelle collection). Règles de sécurité : lire = droit « Voir les
      consultations » ; écrire = médecin **et secrétaire** (décision du 07/10 : la secrétaire voit, écrit, imprime et
      renouvelle les ordonnances). Nouveau droit « Écrire les consultations et ordonnances » dans la grille (oui par défaut
      pour médecin et secrétaire, non pour l'infirmière).

**1C – Médicaments et ordonnance** (le moteur commun)
- [ ] Liste de tous les médicaments du cabinet : **Recherche** ; colonnes Médicament, Posologie ; **+** ajouter,
      **✎** modifier, **✕** supprimer.
- [ ] « + » : Nom du médicament (ex. ABIRATERONE 250 mg) + Posologie (ex. 4 comprimés par jour le matin pendant 1 mois)
      → Valider / Annuler.
- [ ] **Double-clic** sur un médicament → il passe dans l'ordonnance en préparation (retirer, monter, descendre).
- [ ] Boutons **Afficher l'ordonnance** / **Annuler** ; ordonnance vierge à remplir à la main si aucun médicament choisi.
- [ ] Fenêtre de l'ordonnance : date du jour à droite ; Civilité Nom Prénom ; médicaments **numérotés** (1/ nom souligné,
      posologie dessous) ; « Cachet et signature du médecin : Dr Nom Prénom » ; texte **encore modifiable**.
- [ ] Choix **A5 / A4** ; **Valider** (enregistre) · **Valider + Imprimer** · **Fermer**. Tout à la date du jour, signé
      au nom du médecin connecté, ou de **son médecin** si c'est la secrétaire qui la fait (question 6), enregistré dans
      la consultation du jour.
- [ ] **Import de la liste de médicaments en Excel**, fournie par Dr Bentahila (export GestiCab).

**1D – Antécédents des prescriptions** (petite flèche)
- [ ] Fenêtre : dates à gauche, ordonnance à droite ; à droite **Imprimer · Supprimer · Renouveler · Fermer**.
- [ ] Renouveler = la même ordonnance à la date du jour, avec les mêmes options (A5/A4, Valider, Valider + Imprimer, Fermer).

**1E – Les quatre autres familles (même système, modèles créés par Dr Bentahila)**
- [ ] **Examens compl.** : liste de modèles (Nouveau +, Modifier ✎, Supprimer ✕), recherche, double-clic → petit cadre où
      se compose l'ordonnance → Afficher l'ordonnance / Fermer → ordonnance modifiable, A5/A4, Valider / Valider + Imprimer / Fermer.
- [ ] **Ordonnances types**.
- [ ] **Courriers** : Dr Bentahila crée elle-même ses modèles (Nouveau / Modifier / Supprimer). Champs remplis
      automatiquement : **nom, âge, diagnostic, date, « à Casablanca »** (pas le correspondant). Premiers modèles à
      rédiger **ensemble** : **demande d'ALD**, **courrier**, **certificat** ; d'autres ensuite.
- [ ] **Analyses** : analyses simples (ex. NFS) et **bilans types** qui en regroupent plusieurs (ex. Bilan chimio = NFS,
      Urée, Créatinine). **Import de la liste des analyses et bilans en Excel**, fournie par Dr Bentahila.
- [ ] Antécédents (petite flèche) pour chacune, comme en 1D.

**1F – Finition**
- [ ] Tests : navigateur, 3 rôles, téléphone 390 px, bilan 2026 inchangé (352 317 DH) ; mise en ligne avec accord.
- [ ] Mise à jour de `CLAUDE.md` ; ajouter les bibliothèques (médicaments, modèles) à la liste « ce que reçoit un nouveau
      cabinet » de l'étape 4 (à décider avec Dr Bentahila).

**Questions à trancher avant 1B / 1C**
1. ~~En-tête de l'ordonnance~~ **Réponse (06/10) : papier à en-tête déjà imprimé.** Ni logo ni signature dans aucun document
   (déjà appliqué au pli, au compte rendu, aux rendez-vous Excel et à la fiche chimio). Prévoir une marge en haut.
2. ~~Consultation créée quand un rendez-vous est « Venu » ?~~ **Réponse (07/10) : non.** Le médecin ou la secrétaire crée
   la consultation (= une note dans le dossier).
3. ~~Secrétaire et consultations ?~~ **Réponse (07/10) : voir oui, écrire oui** (et imprimer, renouveler).
4. ~~Champs automatiques des courriers ?~~ **Réponse (07/10) : nom, âge, diagnostic, date, « à Casablanca » : oui ;
   correspondant : non.** Modèles faits ensemble (ALD, courrier, certificat), et Dr Bentahila peut en créer d'autres.
5. ~~Liste de médicaments ?~~ **Réponse (07/10) : Dr Bentahila fournira un Excel des médicaments et un Excel des
   analyses / bilans.**
6. ~~Nom sur une ordonnance faite par la secrétaire ?~~ **Réponse (07/10) : le nom de son médecin** (le titulaire du
   cabinet auquel elle appartient), avec « saisie par [secrétaire] » gardé dans l'historique, invisible sur l'impression.
   S'il y a plusieurs médecins dans le cabinet : le médecin est choisi dans la fenêtre de l'ordonnance (titulaire par défaut).

## Étape 2 – Retouches au fil de l'eau
Ce que Dr Bentahila remarque en utilisant Onco360 au quotidien.
- [x] « Dosimétrie à valider » : période du scanner (inclus) à la 1re séance (incluse), jusqu'à la validation par le médecin
      (dossier, tableau de bord, agenda, Google Agenda). Sans 1re séance : du scanner à aujourd'hui. Fait, testé et mis en ligne le 06/10.
- [x] Bouton WhatsApp : seulement le logo (sans le mot « WhatsApp »), partout. Mis en ligne le 06/10, puis les scripts du site ne sont plus gardés en cache (les mises à jour s'affichent tout de suite).
- [x] Pli confidentiel et compte rendu de fin de RT : Onco360 remplit les modèles Word de Dr Bentahila (`modeles/`, étiquettes `{{…}}`,
      `{{SPECIALITE}}` ajoutée, `{{MEDECIN}}` = « Dr NOM Prénom », établissement en nom complet, « au sein de l’établissement … »). **Ni logo ni signature** dans aucun document
      (pli, CR, rendez-vous Excel, fiche chimio) : impression sur papier à en-tête. Mis en ligne le 06/10.
- [x] Pli confidentiel : « Radiothérapie {acte} + VMAT » sous TRAITEMENT PROPOSÉ (page 1), dans « nécessitant un traitement par… »
      (page 2) et dans l'ordonnance (page 3) :
      « Radiothérapie {acte} + VMAT » (VMAT si coché). Consultations et hospitalisations
      sans émoticônes. Allergies : plus affichées dans le dossier (seulement dans Modifier l'identité). WhatsApp signé « Dr NOM »
      (médecin connecté, sinon titulaire). Mis en ligne le 06/10.
- [x] 🎉 retiré (jours fériés : pictogramme drapeau), le 07/10.
- [x] Émoticônes remplacées par des pictogrammes au trait (07/10) : ✈️ absence (avion), ⚠️ (triangle d'alerte), ⏳ à recevoir
      (sablier), 💬 WhatsApp (logo au trait), 📅 autre rendez-vous (agenda) ; Google Agenda : « Absence : motif ». Mis en ligne le 07/10.
- [x] Remplacés aussi le 07/10 (pictogrammes au trait ou pastilles de couleur) : ⬇️ Excel/PDF, 🔄, 🏦, ✅, 🕐, 🟢, 🟠, 🟡, ⛔,
      🗑, ⭐, 🏥, ➕ ➖. Mis en ligne.
- [x] 💾 Enregistrer (disquette) et 🖨️ Fiche chimio (imprimante) remplacés le 07/10, mis en ligne.
- [ ] Encore en suspens : 💉 ☢️ 🩺 👋.
- [x] Fenêtre d'une cure : tableau des séances (J1, J8, J15…) au lieu des tuiles, avec Ouvrir / Valider / Reporter / Annuler
      (ou Annuler la validation / Rétablir) ; date prévue modifiable dans le tableau ; cartes sur téléphone. Nouveau : **annuler une
      séance J8/J15** (motif), retirée de l'agenda, du tableau de bord et de Google Agenda, non facturée. Consultation encaissée : case
      blanche, montant modifiable, **« Encaissée à » J1 / J8 / … / autre date** (vu par la secrétaire). Mis en ligne le 06/10.
- [x] Photo du patient (facultative) : clic sur la bulle des initiales en haut du dossier → choix du fichier (ou photo au
      téléphone) ; s'il y a déjà une photo : Changer / Retirer. Droit « Identité ». Elle remplace la bulle (dossier, liste des
      patients, choix du patient d'un rendez-vous). Gardée dans `identite.photo` (~10 Ko). Mis en ligne le 06/10.
- [x] Fiche chimio : « Médecin prescripteur » = « Dr NOM Prénom » + INPE du Profil du médecin (imprimée par l'équipe :
      ceux du médecin titulaire, `parametres/medecinTitulaire`). Plus d'INPE ni de nom écrits dans le code. Mis en ligne le 06/10.
- [ ] (à remplir au fur et à mesure)
- Petits défauts déjà repérés :
  - [x] message périmé de l'Agenda (« synchronisation… phase D ») : déjà remplacé lors du Google Agenda, vérifié en ligne le 06/10 ;
  - [x] anciens outils retirés du site le 06/10 (import, conversion, test des droits) → dossier `archives/` ; `historique.html` gardé (sert à l'ancienne application, à retirer avec elle en F2) ;
  - [x] onglet « Assistant IA » retiré du menu le 06/10 (l'assistant IA est annulé) ;
  - [x] page de secours (si Onco360 ne démarre pas) : boutons « Recharger » et « Se déconnecter » qui marchent (corrigé, testé et mis en ligne le 06/10) ;
  - [x] garder un historique des versions du code (git), pour pouvoir revenir en arrière (fait le 07/10, étape 1.0).

## Étape 3 – Accès et vues de la secrétaire et de l'infirmière
- [x] Droits demandés le 06/10 (mis en ligne le 06/10 ; **à essayer avec le compte de la secrétaire** : modifier un poids, voir un prix) :
  - **Secrétaire** :
    - modifie la fiche du patient (poids, taille, diagnostic, allergies, antécédents ; pas le résumé médical) ;
    - voit et télécharge les documents (pli confidentiel, compte rendu, rendez-vous Excel) ;
    - voit le prix des consultations validées par le médecin et la consultation de chimio cochée (250 DH), pour faire payer.
  - **Infirmière** :
    - ne voit que les rendez-vous de chimio, et la radiothérapie des patients sous chimio en même temps ;
    - ne télécharge pas les documents.
  - Nouvelles lignes dans Profil › Accès › Droits : Fiche du patient, Voir les consultations, Documents, Prix à encaisser,
    Radiothérapie « Voir : patients sous chimio ». La pastille « modifié » de la grille a été retirée.
- [x] Abandonnés le 06/10 (décision de Dr Bentahila) : « Marquer administrée », commande pharmacie J−1, relevé mensuel.
  La ligne « Marquer « Administrée » » a été retirée de la grille des droits (la règle `administrations` reste, inutilisée).

## Étape 4 – Plusieurs cabinets (phase F) : vendre Onco360
Décisions déjà prises :
- un médecin crée son compte avec un **code d'activation** vendu par Dr Bentahila ;
- un nouveau cabinet reçoit une **copie de la bibliothèque de protocoles** ;
- l'éditrice n'a **aucun accès aux patients** des autres cabinets ;
- chaque médecin relie son Google Agenda (c'est déjà en place).

- **F1 – Plusieurs cabinets**
  - [ ] **D'abord : établir ensemble la liste exacte de ce que reçoit un nouveau cabinet.** Par exemple : les protocoles,
        les jours fériés marocains, la liste des diagnostics… mais **pas** la liste des correspondants de Dr Bentahila.
  - [ ] Inscription avec code, et création automatique du cabinet.
  - [ ] Onco360 ouvre le cabinet de la personne connectée (aujourd'hui, « cabinet-bentahila » est écrit dans le code).
  - [ ] Page « Administration » réservée à l'éditrice : codes, cabinets, abonnements, sans aucune donnée médicale.
  - [ ] Retirer ce qui est propre à Dr Bentahila :
    - son INPE et son nom par défaut sur la fiche chimio ;
    - HGC et HCK comme établissements et tarifs par défaut.
  - [ ] Premier démarrage guidé : lieu d'exercice, tarifs.
  - [ ] Tests d'étanchéité : un cabinet ne voit rien d'un autre. Le bilan de Dr Bentahila reste inchangé.
- **F2 – Rendre Onco360 vendable**
  - [ ] Un nom de domaine (par exemple onco360.ma) à la place de chimio-hgc.web.app.
  - [ ] Retirer de la version client l'ancienne application (`ancienne-app.html`, `historique.html`, `app.html`, `js/pont.js`, `js/shim.js`, `js/ajustements.js`) ; outils de conversion déjà retirés le 06/10.
  - [ ] Nettoyer l'espace d'essai « test-b1 » et ses comptes de test dans Firebase (créés par l'ancien test des droits).
  - [ ] Conditions d'utilisation et politique de confidentialité (Google les demande aussi pour retirer l'avertissement
        « application non validée »).
  - [ ] Suivi des abonnements : date de fin, rappel.
  - [ ] **Point juridique, à voir avec un juriste avant le premier client** : données de santé, loi 09-08 / CNDP,
        hébergement des données en Belgique.
- **F3 – Le guide complet**
  - [ ] Un guide PDF illustré, et une aide dans l'application.

---

## Idées en attente (à placer dans une étape)
- Outil de restauration d'une sauvegarde.

- Annulés le 06/10 (décision de Dr Bentahila) : rappels WhatsApp automatiques, assistant IA.

## Règles à ne pas changer
- Honoraires de séance de chimio : tarif des Paramètres, 500 DH brut par jour validé (J1 et J8 = 2 × 500 DH), sans saisie
  manuelle.
- Le bilan doit rester identique au dirham près.

---

## Journal
| Date | Étape | Ce qui a été fait |
|---|---|---|
| 06/10/2026 | Vérification | Lecture complète d'Onco360 : complet pour les phases A à D, petits défauts listés à l'étape 2. |
| 06/10/2026 | 0 – Sauvegardes | Sauvegarde Firebase quotidienne vérifiée (déjà active), restauration à la minute près activée, script de copie Drive prêt. |
| 06/10/2026 | 1 – Google Agenda | Google Agenda par personne : 7 fonctions serveur, onglet Profil › Google Agenda. En ligne, relié pour Dr Bentahila. |
| 06/10/2026 | Plan | Feuille de route créée : étapes 1 à 4 (document, retouches, accès secrétaire/infirmière, plusieurs cabinets). |
| 06/10/2026 | 2 – Retouches | Page de secours : vraie déconnexion (même si Onco360 n'a pas pu se charger), fin de la déconnexion sur la page de connexion. |
| 06/10/2026 | 2 – Retouches | Message Agenda vérifié (déjà corrigé) ; import, conversion-v2 et test-droits retirés du site (→ archives/) ; historique.html gardé pour l'ancienne application. |
| 06/10/2026 | 2 – Retouches | Onglet « Assistant IA » retiré du menu (et son message « bientôt ») ; usage de l'assistant noté pour plus tard. |
| 06/10/2026 | 3 – Accès | Nouveaux droits secrétaire / infirmière (fiche, documents, prix à encaisser, consultations, RT si chimio), règles de sécurité et Google Agenda adaptés. Testé (3 rôles, bilan 352 317 DH, téléphone). |
| 06/10/2026 | 3 – Accès | Mis en ligne : règles de sécurité, serveur Google Agenda, Onco360. Pastille « modifié » retirée ; « Marquer administrée », pharmacie J−1 et relevé mensuel abandonnés. |
| 06/10/2026 | 1 – Plan | Document « gesticab explication » lu : étape 1 découpée en 1.0 (git), 1A (onglets), 1B (consultations), 1C (médicaments + ordonnance), 1D (antécédents), 1E (examens, ordo types, courriers, analyses), 1F (tests, mise en ligne) ; 5 questions à trancher. |
| 06/10/2026 | 2 – Retouches | Dosimétrie à valider = période scanner → 1re séance tant que non validée ; résumés des dossiers concernés recalculés une fois (Google Agenda). Bilan 352 317 DH inchangé. |
| 06/10/2026 | 2 – Retouches | Bouton WhatsApp réduit au logo (tableau de bord, 7 jours, dossier), mis en ligne. |
| 06/10/2026 | 2 – Retouches | Site : scripts plus gardés en cache (mises à jour immédiates). Feuille de route : WhatsApp automatique et assistant IA annulés, ancien agenda arrêté. |
| 06/10/2026 | 2 – Retouches | Pli confidentiel et CR de fin de RT générés à partir des modèles Word de Dr Bentahila (repli sur l'ancienne mise en page si modèle absent). |
| 06/10/2026 | 2 – Retouches | Photo du patient (création / modification), affichée à la place des initiales. Fiche chimio : médecin et INPE du Profil. Ni logo ni signature dans les documents. |
| 06/10/2026 | 2 – Retouches | Fenêtre de cure en tableau (actions par séance, cartes sur téléphone), annulation d'une séance J8/J15, jour d'encaissement de la consultation. Bilan inchangé. |
| 06/10/2026 | 2 – Retouches | Mis en ligne : fenêtre de cure en tableau, pli page 3 « Radiothérapie … », sans 💰, allergies masquées dans le dossier, WhatsApp signé « Dr NOM ». |
| 06/10/2026 | 2 – Retouches | Pli page 2 : « nécessitant un traitement par Radiothérapie … », mis en ligne. |
| 07/10/2026 | 2 – Retouches | Mis en ligne : pictogrammes au trait (absence, alerte, à recevoir, WhatsApp, autre rendez-vous), pli « Radiothérapie … » sous TRAITEMENT PROPOSÉ, Google Agenda « Absence : motif ». |
| 07/10/2026 | 2 – Retouches | Émoticônes remplacées par des pictogrammes (téléchargement, actualiser, banque, validé, prévu, statuts en pastilles, arrêt, corbeille, favoris, hôpital, + / −), mis en ligne. |
| 07/10/2026 | 2 – Retouches | 💾 et 🖨️ remplacés par des pictogrammes, mis en ligne. |
| 07/10/2026 | 1 – Plan | Disposition du dossier décidée : identité + rendez-vous à venir en haut ; dessous, un seul cadre à 4 onglets (Consultation, Chimiothérapie, Radiothérapie, Documents) ; « Consultations et hospitalisations » gardé dans un cadre à part, tout en bas. |
| 07/10/2026 | 1 – Plan | Réponses : « Venu » ne crée pas de consultation ; secrétaire voit et écrit consultations et ordonnances ; courriers avec nom, âge, diagnostic, date, « à Casablanca » (modèles ALD, courrier, certificat à faire ensemble) ; Excel des médicaments et des analyses/bilans à venir. Reste la question 6 (nom sur l'ordonnance faite par la secrétaire). |
| 07/10/2026 | 1 – Plan | Question 6 tranchée : une ordonnance faite par la secrétaire porte le nom de son médecin. Toutes les questions de l'étape 1 sont réglées. |
| 07/10/2026 | 1.0 – Préparation | Historique des versions (git) créé dans le dossier du projet, première version enregistrée (sans données patient). |
| 07/10/2026 | 1A – Onglets | Code écrit (un cadre à 4 onglets, documents RT déplacés dans « Documents », consultations et hospitalisations à part). **Pas testé, pas en ligne** : Terminal bloqué par la sécurité de l'application. |
| 07/10/2026 | 1A – Onglets | Retouches demandées : pictogrammes au lieu des émoticônes, boutons pli / CR / rendez-vous remis dans la carte radiothérapie, ouverture sur Consultation, onglets tenant sur un téléphone. Testé (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
