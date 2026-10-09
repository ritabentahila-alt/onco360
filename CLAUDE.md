# Onco360 (ex-Chimio HGC) – notes pour Claude Code

**Au début de chaque session : lire `FEUILLE-DE-ROUTE.md`** (étapes en cours, décisions, journal) et la mettre à jour
à la fin (cocher, décisions, une ligne au journal). Une étape = une session.

Application web de suivi oncologique (chimiothérapie, radiothérapie, rendez-vous, honoraires) du **Dr Rita Bentahila**,
oncologue-radiothérapeute à Casablanca. Code écrit par Dr Rita Bentahila avec Claude (d'abord depuis le compte de Hamza Benzekri, puis depuis le sien). Interface et code **en français**.

- En ligne : https://chimio-hgc.web.app (Firebase Hosting, projet `chimio-hgc`)
- Bascule faite le **06/10/2026** : Onco360 (`public/v2.html`) est l'application de référence.
- Ancienne application (v1) : `public/ancienne-app.html`, **consultation seule** (règles Firestore : aucune écriture v1).
  `public/app.html` ne fait plus que rediriger vers `v2.html`.

## Déploiement
```
firebase deploy --only hosting            # site
firebase deploy --only firestore:rules    # règles de sécurité
```
Après déploiement : recharger sans cache (Cmd + Maj + R). Les `.js` sont servis en `no-cache` (firebase.json) et v2.html charge `v2.js?v=…` : changer ce numéro si un navigateur garde l'ancienne version. Si erreur 401 : `firebase login --reauth`.
`firebase.json` contient `"site": "chimio-hgc"` (nécessaire avec firebase-tools 15).

## Structure (`public/`)
| Fichier | Rôle |
|---|---|
| `index.html` | connexion Firebase Auth → `v2.html` |
| `v2.html` | Onco360 : structure, CSS complet, symboles SVG, logo |
| `js/config.js` | initialisation Firebase (clé web publique, normal) |
| `js/app/v2.js` | chargement, tableau de bord, patients, dossier, identité, RDV (prix « Venu »), radiothérapie (dosimétrie, documents), WhatsApp, routage, droits |
| `js/app/chimio.js` | lignes de chimio, cures en fenêtre (J1/J8/J15), doses, molécules, report, nouvelle ligne (menus en cascade), création patient |
| `js/app/fiche.js` | fiche chimio A4 paysage (logo de l'établissement) |
| `js/app/documents.js` | documents RT dans une fenêtre (07/10/2026, plus de Word ni d'Excel) : pli confidentiel (3 pages), CR de fin, rendez-vous ; feuille A4 modifiable, imprimée, enregistrée dans `documentsRT` ; mise en page reprise des modèles Word (`modeles/`, référence) |
| `js/app/consultations.js` | onglet Consultation du dossier : journal des consultations, barre des prescriptions |
| `js/app/ordonnances.js` | boutons Médic., Ordo. type, Analyses, Examens compl. et Courriers (modèles remplis pour le patient, fiches PDF `documents/`) : bibliothèques du cabinet (médicaments, ordonnances types ; recherche, + / ✎ / ✕), ordonnance en préparation (✎ / ↑ ↓ / ✕, ajout, ligne libre), ordonnance A5/A4 modifiable, impression, antécédents ; listes de départ : `js/donnees/medicaments.js`, `js/donnees/ordostypes.js`, `js/donnees/analyses.js`, `js/donnees/examens.js` |
| `js/app/taches.js` | page Tâches (menu, entre Patients et Protocoles) : Mes tâches / Toutes les tâches, filtres (recherche, responsable, statut, échéance, type), nouvelle tâche (aussi « + Tâche » du dossier), description visible, types du cabinet (`parametres/typesTaches`, Configuration › Tâches ; « Radiothérapie » fixe), statuts, fiche avec fil (historique + commentaires), réattribuer, modifier / supprimer ; temps réel (`demarrerTaches`, écoute `onSnapshot` lancée au démarrage), messages à l'écran, non lues, pastilles `nbTaches` / `nbTachesB`, carte « Mes tâches » du tableau de bord (`blocAccueil`) |
| `js/app/salle.js` | page Salle d'attente (menu, entre Agenda et Patients, SA1 08/10/2026) : rendez-vous de consultation et séances de chimio du jour, onglets À venir / En salle / Vus / Absents, Mettre en salle, Démarrer, Valider (= « Venu » : `statutRdv` / `chVenuChimio`), Absent, Annuler, motif ; temps réel (`demarrerSalle`, écoute lancée au démarrage, dossier relu après l'écriture d'un collègue), pastille `nbSalle`, bulles Valider / Retour en salle dans le dossier (`bullesDossier`), bandeau de la semaine (jour affiché `JOUR`), colonne prix et total, colonnes au choix (`utilisateurs/{uid}.salleCachees`), commentaire du jour (`com`) ; Absent → fenêtre de report (`absentRdv`, v2.js) ; guide `guide/salle-attente.md` |
| `js/app/agenda.js` | agenda Liste/Jour/Semaine/Mois, filtre par établissement |
| `js/app/configuration.js` | page **Paramètres** (menu ; `#configuration` y renvoie, 08/10/2026) : onglets `ONGLETS()` = horaires (par établissement), absences, fériés, WhatsApp, couleurs Google Agenda (`parametres/couleursAgenda`), types de documents, types de tâches, listes (diagnostics, mutuelles, correspondants : `parametres/listes` { diag, mut, cor, complet } ; nom corrigé → corrigé dans les dossiers ; nom nouveau d'une fiche patient → ajouté, `enrichirListes`, règle ouverte aux droits identité / fiche / créer), Google Agenda personnel (`utilisateurs/{uid}.agendaFiltre`, cases par catégorie) + couleurs, bibliothèques (fenêtres de prescription en gestion : `gererListe` d'ordonnances.js), impression, alertes, Activités et rémunérations (parametres.js, droit finances) |
| `js/app/reglages.js` | réglages simples `parametres/reglages` (marges d'impression A5 / A4 / documents, délai du bouton WhatsApp vert, délais des alertes) : `reglages()`, `margesMm()`, variables CSS de l'aperçu |
| `js/app/profil.js` | page Profil = informations de la personne (photo, INPE, signature, mot de passe) ; fournit à Paramètres (`htmlOngletProfil`) les onglets Lieux d'exercice (logos), Google Agenda (« Mon Google Agenda » : lier, mettre à jour, délier) et Accès (droits de l'équipe, titulaire) |
| `js/app/protocoles.js` | bibliothèque de 316+ protocoles |
| `js/app/parametres.js` | onglet « Activités et rémunérations » de la page Paramètres : tarifs par établissement (dates d'effet), activités, actes RT, VMAT |
| `js/app/bilan.js` | bilan financier, exports Excel/PDF |
| `js/moteur/*.js` | **calculs purs, sans DOM ni Firebase** (doses, dates de cures, RT, finances, bilan, résumé, agenda) |
| `js/donnees/conversion.js` | `separer` / `fusionner` : dossier médical ↔ montants (les montants ne sont jamais dans le dossier patient) |
| `js/donnees/listes.js` | DIAG, MUT0, COR0, ACTES_RT, DICT (molécules), FERIES0 |
| `js/donnees/migration.js` | conversion v1 → v2 (`idsParDefaut` encore utilisé par v2.js) ; `bascule.js`, `conversion-v2.html`, `import.html`, `test-droits.html` : retirés du site le 06/10/2026, rangés dans `archives/` (non publié) |
| `guide/` (hors `public/`) | guides d'utilisation par module (`taches.md`), base du guide complet (F3) |
| `historique.html` | historique de l'ancienne application (lien depuis `ancienne-app.html`, lecture seule) : à retirer avec elle (phase F2) |

## Données (Firestore)
Tout Onco360 est sous `espaces/cabinet-bentahila/` :
- `patients/{id}` : `identite`, `clinique`, `lignesJson`, `planningJson`, `rdvsJson`, `rtsJson`, `etablissementId`, `resume`, `version` (+1 à chaque écriture, imposé par les règles), `maj`, `majPar`
- `patientsFinances/{id}` : `montantsJson` (rdv, cures, rt) – droit « finances » uniquement
- `finances/tarifs|paiements|versements`, `parametres/calendrier|listes|activites|whatsapp|protocolesSupprimes`
- `protocoles/lib_0…lib_10, lib_perso` (`data` = tableau JSON), `etablissements/{code}`, `membres/{uid}` (rôle, droits), `historique`
- `consultations/{id}` : journal du dossier (onglet Consultation, `js/app/consultations.js`) = `patientId`, `etablissementId`,
  `d`, `titre`, `note`, `lignes` [{t, lib, par}], `o`, `creePar(Nom)`, `majPar(Nom)` ; lu par tous les membres, écrit avec
  le droit `ecrireConsultations`, supprimé par le médecin (toutes) ou par son auteur (secrétaire)
  ; une ligne = une ordonnance { id, t: medic|exam|ordo|analyse|courrier, d, lib, par, med (signataire), html, format A5|A4,
  taille }, ajoutée à la consultation du jour (créée « Ordonnance » si besoin) par `enregistrerPrescription`
- `bibliotheques/medicaments` : `data` = JSON [{ id, nom, poso, classe }] (absent = liste de départ `donnees/medicaments.js`) ;
  `bibliotheques/ordostypes` : `data` = JSON [{ id, nom, items: [{ nom, poso }] }] (absent = `donnees/ordostypes.js`) ;
  `bibliotheques/analyses` [{ id, nom, cat, fav }] et `bibliotheques/bilans` [{ id, nom, items: [noms d'analyses ou de bilans], fav }]
  (absents = `donnees/analyses.js`) ; `bibliotheques/examens` [{ id, nom, cat, note }]
  (absent = `donnees/examens.js` ; pas de bilans d'imagerie) ; `bibliotheques/courriers` [{ id, nom, html, fav }] (absent = `donnees/courriers.js` :
  modèles avec champs {patient} {age} {date}… et zones `<mark class="or-ac">` à compléter) ; `fav` = favori ⭐ (en tête de liste) sur toutes ces listes ;
  lu par les membres, écrit par le **médecin** seulement (07/10/2026 : la secrétaire s'en sert sans les modifier)
- `documentsRT/{patient}_{rt}_{pli|cr|rdv}` : `html` du document enregistré (une version par radiothérapie et par type),
  `patientId`, `etablissementId`, `rtId`, `type`, `majLe`, `majPar(Nom)` ; droit `documents` (médecin, secrétaire)
- `fichiers/{id}` : documents déposés (onglet Documents, `js/app/fichiers.js`, 08/10/2026) = `patientId`, `etablissementId`,
  `titre`, `d` (date du document), `type`, `nom`, `taille`, `mime`, `chemin` (Cloud Storage
  `espaces/{e}/patients/{p}/fichiers/{id}/{nom}`, règles `storage.rules`, 25 Mo), `creePar(Nom)`, `majPar(Nom)` ; droit
  `documents` ; supprimés par le médecin ou leur auteur. Types : `parametres/typesDocuments` (Configuration › Documents).
  Le stockage n'est pas dans les sauvegardes de la base.
- `bibliotheques/documentation` : documentation à remettre aux patients (bouton « Doc. », `js/app/documentation.js`,
  08/10/2026) = JSON [{ id, titre, cat, nom, taille, chemin (Cloud Storage `espaces/{e}/documentation/{id}/{nom}`) ou url
  (fiche de départ du site, `donnees/documentation.js`), fav, le, par }] ; géré par le médecin ; « Remettre » = ligne
  { t: "doc", lib, docId } dans la consultation du jour.
- `taches/{id}` : `titre`, `desc`, `type`, `urgent`, `ech` (date), `h`, `patientId`, `patientNom`, `etablissementId`, `pour` /
  `pourNom` (responsable), `de` / `deNom` (auteur), `qui` = [auteur, responsable], `statut` afaire|encours|fait, `faitPar(Nom)`,
  `faitLe`, `fil` [{ le, par, parNom, txt, c }] (historique et commentaires `c: true` ; une entrée par modification, ajoutée
  par `arrayUnion`, signée par la personne connectée : règle) ; lues par
  tous les médecins, sinon par l'auteur et le responsable ; modifiées par eux ; supprimées par l'auteur (toujours) ou par
  un médecin (non terminées). Affichées dans le dossier (« Rendez-vous et tâches à venir », `tachesDuPatient`, 08/10/2026).
  Tâches automatiques : `de` = "onco360", `auto` { regle, ev, cle, rt } ; règles `parametres/tachesAuto` { regles } (Paramètres ›
  Tâches) ; créées par les fonctions `tachesAutoPatient` / `tachesAutoNuit` (logique.js `tachesAutoPatient`), une fois
  (registre `tachesAuto/{id}`, sans règle = invisible du navigateur). Lues : `utilisateurs/{uid}.tachesVu` { idTâche: longueur du fil }.
- `salle/{AAAA-MM-JJ_patient_clé}` (salle d'attente, 08/10/2026) : `jour`, `patientId`, `etablissementId`, `cle` (`r-RDV` ou
  `c-LIGNE-CURE-JOUR`), `etat` "" | salle | consult | vu | absent, `motif` (chimio ; celui d'un rendez-vous est `mo` dans
  `rdvsJson`), `arr` / `deb` / `fin` (ms) + `…Par` / `…Nom`, `sp`, `majPar`. Le rendez-vous reste « prevu » jusqu'à Vu (bilan
  inchangé) ; Vu / Absent restent dans `rdvsJson` et sont recopiés ici. Règles : lu et écrit dans le périmètre ; état "" ou
  salle par tout membre, le reste avec le droit `rendezvous` (`tests/regles/test-salle.mjs`).
- Prix fixé par la secrétaire (sans droit « finances ») : fonction serveur `prixConsultation` (functions/index.js, logique
  `appliquerPrix` dans logique.js) = un prix de consultation (rendez-vous « Venu » ou consultation d'un jour de chimio) écrit dans
  `patientsFinances` et `encaissements`. Tarifs lisibles par l'équipe : `parametres/tarifsConsultations` (brut seul, sans séance
  ni RT), publiés par le médecin (`publierTarifsC`, v2.js). `majMontants` relit toujours les montants avant d'écrire.
- `encaissements` : un prix repris de la v1 porte `v1: true` et, s'il vaut le net du tarif, `b` = brut affiché (HCK 225 → 250 DH).
- Bilan « payé » : `finances/paiements` (coché à la main) + « Payé auto. » des Paramètres (`payeAuto` = date de l'activité dans
  `finances/tarifs` : actes de ce type et de cet établissement à partir de cette date comptés payés ; bilan.js `paiementsEffectifs`).
- `presence/{uid}` (« Dossier ouvert par », salle.js `presenceDossier`) : { patientId, nom, role, le }, écrit par la personne
  elle-même à chaque ouverture de dossier (route) et chaque minute ; lu par les membres ; considéré fermé après 3 min.
  Réglages personnels de la salle d'attente dans `utilisateurs/{uid}` : `salleCachees` (colonnes), `salleTri`.
  Salle : `prix` = prix payé d'avance (proposé dans la fenêtre de prix, `prixPrevu`) ; `ordre` = n° de passage ; `com`.
  `badgeSalle(pid, "r-RDV" | "chimio")` : statut du jour affiché dans l'Agenda et le tableau de bord (mis à jour en direct).
- Report de chimio avec le seul droit « planning » (secrétaire, depuis le 08/10/2026) : `sauverLignes` n'écrit que `planningJson` ;
  l'historique du report y est gardé (`planning[ligne][n].rep`, `.srep[j]`), ajouté par `fusionner`, repris dans `lignesJson` au
  prochain enregistrement du médecin.
- `utilisateurs/{uid}` : profil (nom, INPE, signature, photo)
Ancienne application : collections racine `patients`, `protocoles`, `finances`, `parametres` (lecture seule).

## Règles métier importantes
- Doses : Mosteller, Cockcroft-Gault (mg/L ou µmol/L), Calvert (clairance plafonnée à 125). Un % ou une dose modifiés
  un jour s'appliquent à la molécule à partir de ce jour (jours suivants + toutes les cures suivantes).
- Poids / créatinine / % saisis par séance (cure pour J1, `c.sea[j]` pour J8…), repris ensuite.
- Molécules ajoutées/retirées : `L.mods = [{k, j?, op:"add"|"del"}]` (à partir de la cure k, jour j).
- Honoraires de séance de chimio : tarif des Paramètres (500 DH brut par jour validé : J1 et J8 = 2 × 500 DH).
  Pas de saisie manuelle par séance dans l'interface (voulu, ne pas en ajouter ; `chHon` n'est relié à aucun bouton).
- Radiothérapie (09/10/2026) : déroulé scanner (`scan`) → contourage (`cont`, `contPar`, `contLe` : `contRT`) → dosimétrie (`dosi` :
  `dosiRT`, seulement après le contourage) → 1re séance (`deb`) → fin (`fin` : `terminerRT`) ; tâches automatiques fixes « Valider
  le contourage » (scanner → 1re séance), « Valider la dosimétrie » (contourage validé → 1re séance), « Valider la fin de
  radiothérapie » ; valider la tâche = valider dans le dossier (même fenêtre, `taValiderAuto`).
- Bilan : doit rester identique au dirham près (référence : année 2026 = 352 317 DH au 06/10/2026).
- Droits : `medecin` / `infirmiere` / `assistante`, grille par membre ; un membre ne modifie pas ses propres droits.
  Droits ajoutés le 06/10/2026 (DROITS_ROLE et `droitsEffectifs` dans profil.js : un droit absent de la grille d'un membre
  prend la valeur par défaut de son rôle ; `migrations()` dans v2.js l'écrit dans les fiches des membres, une fois, par le titulaire) :
  `fichePatient` (poids, taille, diagnostic, allergies, antécédents ; règle : `clinique` sans toucher à `clinique.notes`),
  `consultations` (voir consultations et hospitalisations), `documents` (pli, CR, rendez-vous Excel), `encaissements`
  (collection `encaissements/{patient}` = prix des consultations validées + consultation de chimio cochée, écrite par
  `majMontants` / `ecrireEncaissements` dans chimio.js, sans honoraires ni RT), `radiotherapie: "chimio"` (voir la RT
  seulement des patients sous chimio en même temps). Secrétaire : fiche, documents, encaissements. Infirmière : pas de
  consultations, RT « chimio », pas de documents. Secrétaire : n'annule pas un statut de rendez-vous posé par le médecin
  (`sp` = auteur du statut), ne voit que les horaires de son centre (Configuration). Le filtrage des rendez-vous est fait à l'écran et dans Google Agenda
  (`functions/logique.js` `permis`), pas par les règles (le dossier patient reste lisible en entier par le serveur).

## Sauvegardes
- **Firestore natif (offre Blaze)** : sauvegarde quotidienne de TOUTE la base (v1 + Onco360) depuis le 03/10/2026,
  conservée 14 semaines (`firebase firestore:backups:list`), vers 21 h–22 h UTC, région europe-west1.
  Protection contre la suppression de la base activée. Restauration = vers une NOUVELLE base (`firestore:databases:restore`).
  Restauration à la minute près (PITR) : activée le 06/10/2026, 7 jours glissants.
- Copies lisibles dans le Drive (Google Apps Script du compte de Dr Bentahila, projet « Chimio HGC », Drive > Sauvegardes) :
- Ancienne application : `sauvegardeFirebase` (fichier « Firebase », copie : `apps-script/firebase-v7-deja-installe.gs`),
  vers 2 h 30 → `Sauvegardes/Firebase/ChimioHGC_Firebase_AAAA-MM-JJ.json`.
- Onco360 : `apps-script/onco360-sauvegarde.gs` (fichier « Onco360 », lancer `installerSauvegardeOnco360` une fois),
  vers 3 h → `Sauvegardes/Onco360/Onco360_AAAA-MM-JJ.json` = `{ compte, documents: { "chemin/complet": champs } }`
  (espace entier, collections trouvées automatiquement, + `utilisateurs`, `administrateurs`). 30 derniers + le 1er du mois.
  E-mail en cas d'échec. Pas encore d'outil de restauration.

## Google Agenda (sens unique Onco360 → Google)
- **Par personne** : Paramètres › Google Agenda › « Mon Google Agenda » › « Lier mon Google Agenda » (Profil jusqu'au 08/10/2026) (fenêtre Google, droit
  `calendar.app.created` : Onco360 ne voit que l'agenda « Onco360 » qu'il crée). Fonctions serveur `functions/` (région
  europe-west1) : `agendaLier` / `agendaMaj` / `agendaDelier` (appelées par profil.js), `agendaPatient` (à chaque écriture
  d'un dossier), `agendaAbsences` (titulaire), `agendaMembre` (droits modifiés), `agendaNuit` (3 h 30). Événements =
  `resume.ag` filtrés par périmètre (établissements) et droits (chimio / RT) du membre ; identifiant Google = sha1 de la clé
  `k` ; le passé n'est jamais effacé. Heures normalisées (`heure`), dates invalides écartées, un événement refusé par Google
  (400) est mis de côté sans bloquer la mise à jour (08/10/2026, panne « Invalid start time »). Tâches (08/10/2026) : `agendaTache` (écriture d'une tâche) et remise à plat ajoutent
  l'échéance des tâches non terminées dans l'agenda du **responsable** seulement (`evtsTaches` : groupe `tache-ID`, journée
  entière ou 15 min, aucun rappel, couleur 8 / 11, « EN RETARD » reportée chaque nuit sur le jour même, retirée une fois terminée).
  Couleurs (08/10/2026) : `categorie` / `colorer` (logique.js) donnent à chaque événement la couleur de sa catégorie
  (`parametres/couleursAgenda`, sinon `COULEURS0`, mêmes valeurs dans configuration.js) ; `agendaCouleurs` repeint tout.
  Ce que chacun voit (P3, 08/10/2026) : `utilisateurs/{uid}.agendaFiltre.exclus` (clés `cleFiltre` : rdv:annonce, rdv:act:<activité>,
  chimio:cure / seance, rt:scan|deb|fin|dosi, abs, tache:<type>) ; `agendaFiltre` refait l'agenda de la personne. Jetons : `agendaJetons/{uid}` (aucune règle = invisible du navigateur) ; état :
  `utilisateurs/{uid}.agendaGoogle`. Logique pure : `functions/logique.js`, tests : `node functions/test-logique.js`.
  Prérequis : API Google Calendar activée, écran de consentement « Onco360 » publié, client OAuth Web (ID dans
  `public/js/config.js` GOOGLE_CLIENT_ID et `functions/.env` ; secret : `firebase functions:secrets:set GOOGLE_CLIENT_SECRET`).
- **Ancien (script Google du titulaire)** : `apps-script/onco360-agenda.gs`, agenda « Chimio HGC » (à renommer « Onco360 »),
  toutes les 10 min, état dans `parametres/agendaGoogle`. À arrêter (`arreterAgendaAppsScript`) quand le Dr a relié son agenda.

## Phase F : plusieurs cabinets (décidé le 06/10/2026, but : vendre Onco360 avec un guide complet)
Choix de Dr Bentahila : inscription par **code d'activation** (vendu par elle) ; nouveau cabinet = **copie de sa bibliothèque
de protocoles** ; l'éditrice n'a **aucun accès aux patients** des autres cabinets (règles serveur). Chaque médecin relie son
Google Agenda (déjà en place, par personne).
- F1 : inscription avec code + création automatique du cabinet ; ESPACE dynamique (cabinet de la personne connectée) ;
  page Administration (codes, cabinets, abonnements, sans données médicales) ; retirer tout ce qui est propre au Dr
  Bentahila (INPE et nom par défaut sur la fiche, HGC/HCK par défaut dans tarifs.js / rdv.js / parametres.js) ; premier
  démarrage guidé ; tests d'étanchéité entre cabinets (bilan Bentahila inchangé : 352 317 DH).
  **À valider avec elle d'abord : la liste exacte de ce que reçoit un nouveau cabinet** (ex. PAS sa liste de correspondants).
- F2 : nom de domaine, retirer ancienne app et outils de conversion de la version client, CGU + politique de confidentialité
  (aussi pour la vérification Google), suivi des abonnements. Point juridique signalé : données de santé, loi 09-08 / CNDP,
  hébergement hors Maroc.
- F3 : guide complet (PDF illustré + aide intégrée). Puis suite de la phase E (vue infirmière, pharmacie J−1, relevé mensuel).

## Tests
`tests/` : faux Firebase (`mockfb/`) + Playwright (Python). Voir `tests/LISEZMOI.md`.
Aucune donnée patient n'est dans le code ; le jeu de test se construit depuis une sauvegarde JSON (Drive).
Règles de sécurité : `cd tests/regles && npm test` (émulateur Firestore, Java 21 ; `npm install --cache` vers un dossier
temporaire si le cache npm du Mac refuse) — à relancer avant chaque mise en ligne des règles ; ajouter des cas pour chaque nouvelle règle.

## Méthode de travail souhaitée
- Réponses en français, directes ; l'utilisateur n'est pas développeur : commandes Terminal prêtes à copier.
- Toujours tester (navigateur + bilan) avant livraison ; vérifier mobile (largeur 390 px sans débordement).
- Design : Arial, fond #F5F7FB, couleur principale #3563B0, cartes blanches arrondies, page 1240 px.

## À faire
Voir `FEUILLE-DE-ROUTE.md`. Annulés le 06/10/2026 : assistant IA, rappels WhatsApp automatiques, commande pharmacie J−1,
relevé mensuel. « Marquer administrée » (vue infirmière) : repris le 08/10 (étape 11). Demandes du 08/10 = étapes 6 à 13
de la feuille de route (salle d'attente, RCP, numéro de dossier, audit / mode démo, hors-ligne, soins infirmiers et
pharmacie, dossier de cession, HL7/FHIR). Pas de téléconsultation. Vente : abonnements et cession.
