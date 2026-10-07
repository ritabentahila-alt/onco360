# Onco360 (ex-Chimio HGC) – notes pour Claude Code

**Au début de chaque session : lire `FEUILLE-DE-ROUTE.md`** (étapes en cours, décisions, journal) et la mettre à jour
à la fin (cocher, décisions, une ligne au journal). Une étape = une session.

Application web de suivi oncologique (chimiothérapie, radiothérapie, rendez-vous, honoraires) du **Dr Rita Bentahila**,
oncologue-radiothérapeute à Casablanca. Développée par Hamza Benzekri. Interface et code **en français**.

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
| `js/app/ordonnances.js` | bouton Médic. : bibliothèque des médicaments (recherche, + / ✎ / ✕), ordonnance A5/A4 modifiable, impression ; liste de départ : `js/donnees/medicaments.js` |
| `js/app/agenda.js` | agenda Liste/Jour/Semaine/Mois, filtre par établissement |
| `js/app/configuration.js` | horaires (par établissement), absences, fériés, messages WhatsApp |
| `js/app/profil.js` | profil, photo, lieux d'exercice (logos), accès et droits de l'équipe |
| `js/app/protocoles.js` | bibliothèque de 316+ protocoles |
| `js/app/parametres.js` | tarifs par établissement (dates d'effet), activités, actes RT, VMAT |
| `js/app/bilan.js` | bilan financier, exports Excel/PDF |
| `js/moteur/*.js` | **calculs purs, sans DOM ni Firebase** (doses, dates de cures, RT, finances, bilan, résumé, agenda) |
| `js/donnees/conversion.js` | `separer` / `fusionner` : dossier médical ↔ montants (les montants ne sont jamais dans le dossier patient) |
| `js/donnees/listes.js` | DIAG, MUT0, COR0, ACTES_RT, DICT (molécules), FERIES0 |
| `js/donnees/migration.js` | conversion v1 → v2 (`idsParDefaut` encore utilisé par v2.js) ; `bascule.js`, `conversion-v2.html`, `import.html`, `test-droits.html` : retirés du site le 06/10/2026, rangés dans `archives/` (non publié) |
| `historique.html` | historique de l'ancienne application (lien depuis `ancienne-app.html`, lecture seule) : à retirer avec elle (phase F2) |

## Données (Firestore)
Tout Onco360 est sous `espaces/cabinet-bentahila/` :
- `patients/{id}` : `identite`, `clinique`, `lignesJson`, `planningJson`, `rdvsJson`, `rtsJson`, `etablissementId`, `resume`, `version` (+1 à chaque écriture, imposé par les règles), `maj`, `majPar`
- `patientsFinances/{id}` : `montantsJson` (rdv, cures, rt) – droit « finances » uniquement
- `finances/tarifs|paiements|versements`, `parametres/calendrier|listes|activites|whatsapp|protocolesSupprimes`
- `protocoles/lib_0…lib_10, lib_perso` (`data` = tableau JSON), `etablissements/{code}`, `membres/{uid}` (rôle, droits), `historique`
- `consultations/{id}` : journal du dossier (onglet Consultation, `js/app/consultations.js`) = `patientId`, `etablissementId`,
  `d`, `titre`, `note`, `lignes` [{t, lib, par}], `o`, `creePar(Nom)`, `majPar(Nom)` ; lu par tous les membres, écrit avec
  le droit `ecrireConsultations`, supprimé par un médecin
  ; une ligne = une ordonnance { id, t: medic|exam|ordo|analyse|courrier, d, lib, par, med (signataire), html, format A5|A4,
  taille }, ajoutée à la consultation du jour (créée « Ordonnance » si besoin) par `enregistrerPrescription`
- `bibliotheques/medicaments` : `data` = JSON [{ id, nom, poso, classe }] (absent = liste de départ `donnees/medicaments.js`) ;
  lu par les membres, écrit avec `ecrireConsultations`
- `documentsRT/{patient}_{rt}_{pli|cr|rdv}` : `html` du document enregistré (une version par radiothérapie et par type),
  `patientId`, `etablissementId`, `rtId`, `type`, `majLe`, `majPar(Nom)` ; droit `documents` (médecin, secrétaire)
- `utilisateurs/{uid}` : profil (nom, INPE, signature, photo)
Ancienne application : collections racine `patients`, `protocoles`, `finances`, `parametres` (lecture seule).

## Règles métier importantes
- Doses : Mosteller, Cockcroft-Gault (mg/L ou µmol/L), Calvert (clairance plafonnée à 125). Un % ou une dose modifiés
  un jour s'appliquent à la molécule à partir de ce jour (jours suivants + toutes les cures suivantes).
- Poids / créatinine / % saisis par séance (cure pour J1, `c.sea[j]` pour J8…), repris ensuite.
- Molécules ajoutées/retirées : `L.mods = [{k, j?, op:"add"|"del"}]` (à partir de la cure k, jour j).
- Honoraires de séance de chimio : tarif des Paramètres (500 DH brut par jour validé : J1 et J8 = 2 × 500 DH).
  Pas de saisie manuelle par séance dans l'interface (voulu, ne pas en ajouter ; `chHon` n'est relié à aucun bouton).
- Bilan : doit rester identique au dirham près (référence : année 2026 = 352 317 DH au 06/10/2026).
- Droits : `medecin` / `infirmiere` / `assistante`, grille par membre ; un membre ne modifie pas ses propres droits.
  Droits ajoutés le 06/10/2026 (DROITS_ROLE et `droitsEffectifs` dans profil.js : un droit absent de la grille d'un membre
  prend la valeur par défaut de son rôle ; `migrations()` dans v2.js l'écrit dans les fiches des membres, une fois, par le titulaire) :
  `fichePatient` (poids, taille, diagnostic, allergies, antécédents ; règle : `clinique` sans toucher à `clinique.notes`),
  `consultations` (voir consultations et hospitalisations), `documents` (pli, CR, rendez-vous Excel), `encaissements`
  (collection `encaissements/{patient}` = prix des consultations validées + consultation de chimio cochée, écrite par
  `majMontants` / `ecrireEncaissements` dans chimio.js, sans honoraires ni RT), `radiotherapie: "chimio"` (voir la RT
  seulement des patients sous chimio en même temps). Secrétaire : fiche, documents, encaissements. Infirmière : pas de
  consultations, RT « chimio », pas de documents. Le filtrage des rendez-vous est fait à l'écran et dans Google Agenda
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
- **Par personne (en cours de mise en place)** : Profil › Google Agenda › « Lier mon Google Agenda » (fenêtre Google, droit
  `calendar.app.created` : Onco360 ne voit que l'agenda « Onco360 » qu'il crée). Fonctions serveur `functions/` (région
  europe-west1) : `agendaLier` / `agendaMaj` / `agendaDelier` (appelées par profil.js), `agendaPatient` (à chaque écriture
  d'un dossier), `agendaAbsences` (titulaire), `agendaMembre` (droits modifiés), `agendaNuit` (3 h 30). Événements =
  `resume.ag` filtrés par périmètre (établissements) et droits (chimio / RT) du membre ; identifiant Google = sha1 de la clé
  `k` ; le passé n'est jamais effacé. Jetons : `agendaJetons/{uid}` (aucune règle = invisible du navigateur) ; état :
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

## Méthode de travail souhaitée
- Réponses en français, directes ; l'utilisateur n'est pas développeur : commandes Terminal prêtes à copier.
- Toujours tester (navigateur + bilan) avant livraison ; vérifier mobile (largeur 390 px sans débordement).
- Design : Arial, fond #F5F7FB, couleur principale #3563B0, cartes blanches arrondies, page 1240 px.

## À faire
Voir `FEUILLE-DE-ROUTE.md`. Annulés le 06/10/2026 : assistant IA, rappels WhatsApp automatiques, vue infirmière « Marquer administrée »,
commande pharmacie J−1, relevé mensuel.
