# Onco360 (ex-Chimio HGC) – notes pour Claude Code

**Au début de chaque session : lire `FEUILLE-DE-ROUTE.md`** (plan **refait le 20/10/2026** d'après les audits n° 10 et 11 et les réponses de Dr Bentahila, copie dans `archives/audits-10-11/` : phases S (soins et sécurité, cette semaine), T (tous les jours, audit 11), L (avant le 1er cabinet ami), D / E (design, code, charge), C (conformité, plus tard), V (vente et cession, en avance) ; questions en attente, décisions du 20/10 une par ligne, liste cumulée des refus ; **audit n° 9 non fait** (décision du 20/10) ; en bas, l'ancien plan du 13/10 et du 18/10 (phase R faite, sauf R-F1 → S8) et tout le fait, gardés tels quels)
et la mettre à jour à la fin (cocher, décisions) ; une ligne dans `JOURNAL.md`. Une étape = une session. L'ancienne feuille de
route (jusqu'au 11/10/2026, tout le détail des étapes 1 à 23) est dans `archives/FEUILLE-DE-ROUTE-jusqu-au-2026-10-11.md`.

Application web de suivi oncologique (chimiothérapie, radiothérapie, rendez-vous, honoraires) du **Dr Rita Bentahila**,
oncologue-radiothérapeute à Casablanca. **Dr Rita Bentahila est la seule autrice** du code et du contenu, écrits avec Claude (au début depuis le compte Claude de Hamza Benzekri, qu'il lui a seulement prêté : il n'a rien écrit ; puis depuis le sien). Interface et code **en français**.

- En ligne : https://chimio-hgc.web.app (Firebase Hosting, projet `chimio-hgc`)
- Bascule faite le **06/10/2026** : Onco360 (`public/v2.html`) est l'application de référence.
- Ancienne application (v1) : **retirée du site le 11/10/2026** (elle contenait les dossiers réels de 57 patients, lisibles sans
  connexion). `app.html`, `ancienne-app.html`, `historique.html` redirigent vers `v2.html` (`firebase.json`). Ses données restent
  dans la base (collections racine, lecture seule) ; copie privée des fichiers hors du dépôt : `Desktop/ONCO360/archives-privees-onco360/`.

## Déploiement
Avant toute mise en ligne : `bash outils/avant-mise-en-ligne.sh --navigateur` (parcours dans Chrome et Safari / WebKit, débordements ; ajouter `--regles` si les règles changent ; vérifie aussi les commentaires qui avalent du code, `outils/commentaires.py`) ; mettre en ligne depuis une
copie propre du dernier enregistrement (`git worktree`), pour ne pas publier le travail en cours d'une autre session.
```
firebase deploy --only hosting            # site
firebase deploy --only firestore:rules    # règles de sécurité
```
Après déploiement : recharger sans cache (Cmd + Maj + R). Les `.js` sont servis en `no-cache` (firebase.json) et v2.html charge `v2.js?v=…` : changer ce numéro si un navigateur garde l'ancienne version. Si erreur 401 : `firebase login --reauth`.
`firebase.json` contient `"site": "chimio-hgc"` (nécessaire avec firebase-tools 15).

## Structure (`public/`)
| Fichier | Rôle |
|---|---|
| `index.html` | connexion Firebase Auth → `v2.html` (compte d'administration → `admin.html`) |
| `admin.html` + `js/app/admin.js` | Administration : onglets Cabinets (liste, fiche, réglage du cabinet, équipe, démo, suspendre…), Nouveau cabinet, Par spécialité (packs avec réglage complet `editeurReglage` ; **Modèle des cabinets neufs** (20/10/2026, `htmlModeleSpe`) : 1. copier le cabinet du Dr Bentahila = protocoles + réglages en une action (`modeleReprendre`), ensuite plus aucun lien ; 2. ajuster = « Ouvrir le modèle » : Onco360 avec la même page Paramètres qu'un médecin (fiche et formulaire enregistrés par `ficheSpecialite({ espace })`, `formSpecialite` ; `HORS_BIB` = lieux, accès, journal, export) ; 3. ce que reçoivent les cabinets), Modules (tous les modules, `MODULES_BASE` / MODULES / MODULES_PREVUS, lecture seule), Journal (actions de l'administration) ; **Sauvegardes** (lot R-F, 20/10/2026 : copie des fichiers, export de la semaine des cabinets, « Récupérer des données d'un cabinet » par n° de dossier, sans nom, source « base restaurée à côté » ; alerte en haut de Cabinets ; bouton « Récupérer des données » de la fiche) |
| `v2.html` | Onco360 : structure, CSS complet, symboles SVG, logo |
| `js/config.js` | initialisation Firebase (clé web publique, normal) |
| `js/app/radiotherapie.js` | menu « Radiothérapie » = référentiel de radiothérapie (phase RTR ; RT3 du 25/10/2026 : recherche du module, menus Région › Localisation › Situation › Fractionnement, liste, accueil Favoris / Consultés récemment / Sommaire, fiche à droite dès 1 280 px ; RT4 : fiche à six onglets (`RENDUS`, `rtOnglet`), Copier, impression A4 `rtrImprimerOk`, lien `#protocoles/<id>` ou `#protocoles/loc/<localisation>` (`idProtocole` de protocoles.js), test `tests/test_rtref_fiche.py` ; état de session `RF` ; calculs `js/moteur/rtref.js`, test `node tests/moteur/test-rtref.mjs` ; réglages `utilisateurs/{uid}.rtFavoris` / `.rtRecents` ; CSS « Lot RTR » ; test `tests/test_rtref.py`) ; visible avec le module `rt`, la fonction `rt.referentiel` et le droit à niveaux `referentielRT` (`voitRefRT` / `modifRefRT` de v2.js, `API.voitRefRT()`) ; changements du cabinet `espaces/{e}/referentielRT/{schemaId}` (règles `rtRefVoir` / `rtRefModif`, `tests/regles/test-rtref.mjs`) ; test `tests/test_rtref_menu.py` |
| `donnees-rt/` | référentiel de radiothérapie (phase RTR, RT0 du 25/10/2026) : JSON de référence, jamais modifiés par l'application (index, 48 localisations, OAR, contraintes, essais, `diag-localisation.json`) ; servis en `no-cache` ; contrôle `node tests/moteur/test-rtref-contenu.mjs` ; spécification, fiches lisibles, écarts et script de conversion dans `docs/radiotherapie/` (hors du site) |
| `vendor/` | bibliothèques externes copiées dans le site (jszip, html2canvas, mammoth, SheetJS 0.20.3 ; `vendor/LISEZMOI.md`) |
| `js/app/v2.js` | chargement, tableau de bord, patients, dossier, identité, RDV (prix « Venu »), radiothérapie (dosimétrie, documents), WhatsApp, routage, droits ; **dossier (lot R-G, 19/10/2026)** : `pageDossier` = `.dos` à cinq zones `[data-zone]` (bandeau, patient, travail, documents, barre) redessinées une à une + panneau `panneau(html)` / `fermerPanneau` (chimio, RT ; sans grille : `fenetre(…, "large")`) ; CSS « Lot R-G » de v2.html (`@container dos`) ; guide `guide/dossier-patient.md` |
| `js/app/chimio.js` | lignes de chimio, cures en fenêtre (J1/J8/J15), doses, molécules, report, nouvelle ligne (menus en cascade), création patient |
| `js/moteur/vigilance.js` + `js/app/vigilances.js` | vigilance par molécule (12/10/2026) : `vigilances(ctx)` (fenêtre à la validation, `verifierValidation` de chimio.js, liste gardée dans `fige.vig`), `cumuls` (anthracyclines en équivalent doxorubicine, oxaliplatine), `EXAMENS` du bilan du jour élargi (`fige.bio` : bili, asat, alat, mg, ca, tsh, fevg, ta, prot), `historique` (séances validées du patient), notes « À vérifier » `parametres/vigilances` (Paramètres › Vigilance des molécules, départ `VIG0`) ; tests `node tests/moteur/test-vigilance.mjs`, `tests/test_vigilance.py` |
| `js/app/fiche.js` | fiche chimio A4 paysage (logo de l'établissement) |
| `js/app/documents.js` | documents RT dans une fenêtre (07/10/2026, plus de Word ni d'Excel) : pli confidentiel (3 pages), CR de fin, rendez-vous ; feuille A4 modifiable, imprimée, enregistrée dans `documentsRT` ; mise en page reprise des modèles Word (`modeles/`, référence) |
| `js/app/consultations.js` | onglet Consultation du dossier : journal des consultations, barre des prescriptions |
| `js/app/ordonnances.js` | boutons Médic., Ordo. type, Analyses, Examens compl. et Courriers (modèles remplis pour le patient, fiches PDF `documents/`) : bibliothèques du cabinet (médicaments, ordonnances types ; recherche, + / ✎ / ✕), ordonnance en préparation (✎ / ↑ ↓ / ✕, ajout, ligne libre), ordonnance A5/A4 modifiable, impression, antécédents ; listes de départ : `js/donnees/medicaments.js`, `js/donnees/ordostypes.js`, `js/donnees/analyses.js`, `js/donnees/examens.js` ; **lot R-E (19/10/2026)** : zones « À compléter » (« … », « [durée à compléter] »), doublons, allergie par familles, `question()` (petite fenêtre par-dessus), vérification unique `verifications` avant l'impression, `mesurer` / plusieurs pages, chimio orale « mg/m² », antécédents (versions, Annuler l'ordonnance, Duplicata, recherche) ; calculs `js/moteur/ordonnance.js` ; mise à jour sans écrasement `js/moteur/bibmaj.js` + `js/donnees/majbib.js` (`majBibliotheques`, `parametres/migrations.bibE3`) ; fiches de départ ajoutées = identifiant fixe, ne jamais retirer ni déplacer une ligne d'une liste de départ ; **ordonnances du protocole (25/10/2026)** `orProtocole` : bilan biologique (initial / intercure, chimio / immuno), une ordonnance par case cochée (`imprimerPlusieurs` ou une par une `PC_DOCS`) ; guide `guide/ordonnances.md` |
| `js/app/taches.js` | page Tâches (menu, entre Patients et Protocoles) : Mes tâches / Toutes les tâches, filtres (recherche, responsable, statut, échéance, type), nouvelle tâche (aussi « + Tâche » du dossier), description visible, types du cabinet (`parametres/typesTaches`, Configuration › Tâches ; « Radiothérapie » fixe), statuts, fiche avec fil (historique + commentaires), réattribuer, modifier / supprimer ; temps réel (`demarrerTaches`, écoute `onSnapshot` lancée au démarrage), messages à l'écran, non lues, pastilles `nbTaches` / `nbTachesB`, carte « Mes tâches » du tableau de bord (`blocAccueil`) |
| `js/app/salle.js` | page Salle d'attente (menu, entre Agenda et Patients, SA1 08/10/2026) : rendez-vous de consultation et séances de chimio du jour, onglets À venir / En salle / Vus / Absents, Mettre en salle, Démarrer, Valider (= « Venu » : `statutRdv` / `chVenuChimio`), Absent, Annuler, motif ; temps réel (`demarrerSalle`, écoute lancée au démarrage, dossier relu après l'écriture d'un collègue), pastille `nbSalle`, bulles Valider / Retour en salle dans le dossier (`bullesDossier`), bandeau de la semaine (jour affiché `JOUR`), colonne prix et total, colonnes au choix (`utilisateurs/{uid}.salleCachees`), commentaire du jour (`com`) ; Absent → fenêtre de report (`absentRdv`, v2.js) ; guide `guide/salle-attente.md` |
| `js/app/fichepatient.js` | Fiche patient réglable (3.11, 12/10/2026) : un seul moteur pour Nouveau patient, Modifier, Afficher et l'en-tête du dossier (`htmlFormulaire` / `lireFormulaire` / `htmlLectureFiche` / `htmlEnteteFiche`, d'après `champsDe` de catalogue.js : type, nom, partie, ordre, liste, unité, imprimé, en-tête de chaque champ) ; éditeur commun `editeurfiche.js` (✎ = tout le champ ; `ouvrirListe` → Paramètres › Dossier patient › Listes) ; 20/10/2026 : une partie à la fois (`htmlFormulaire(x, { sec })`, `modifierIdentite(id, sec)` : Nouveau patient et « Modifier » du bandeau = identité ; « Modifier » de chaque partie de la colonne Patient) |
| `js/app/audit.js` | Journal d'audit (onglet Paramètres du titulaire) : période, filtres, export Excel ; `auditPatient(id)` |
| `js/app/rcp.js` | RCP (étape 7, 09/10/2026) : dates (`parametres/rcp`, Paramètres › RCP : jours de la semaine, heure, lieu, dates ajoutées / annulées, pas de RCP un jour férié), bouton « + RCP » de la barre des prescriptions (inscription à la prochaine date, question, date d'inscription ; ▾ = RCP du patient), onglet « RCP » de la page Tâches (`#taches/rcp` : calendrier des semaines, période, Tous / À faire / Faits, case Fait, impression), dossier ouvert depuis la liste = bulles Décision RCP (consultation type « RCP » pré-remplie, `nouvelleConsultation` de consultations.js) · Valider (case Fait, retour à la liste) · Fermer ; inscriptions non faites dans « Rendez-vous et tâches à venir » ; écoute en direct (`demarrerRcp`) |
| `js/app/agenda.js` | agenda Liste/Jour/Semaine/Mois, filtre par établissement ; étape 21 (11/10/2026) : vue Jour à l'ouverture sur téléphone, hauteur = durée (`dureeDe`), glisser-déposer d'un rendez-vous (`glisser` → v2.js `deplacerRdv` : confirmation, `rep`), filtre « Médecin » (≥ 2 médecins, `AG.med`), heure facultative des séances de chimio et du scanner (`fenetreHeure`, `heureSeance` de chimio.js, `heureRT` de v2.js) ; test `tests/test_agenda.py` |
| `js/app/configuration.js` | page **Paramètres** (menu ; `#configuration` y renvoie, 08/10/2026 ; familles `FAMILLES` : Cabinet, Dossier patient (3.11 : fiche, consultation, listes), Agenda et rappels, Bibliothèques, Finances) : onglets `ONGLETS()` = horaires (par établissement), absences, fériés, WhatsApp, couleurs Google Agenda (`parametres/couleursAgenda`), types de documents, types de tâches, listes (diagnostics, mutuelles, correspondants : `parametres/listes` { diag, mut, cor, complet } ; nom corrigé → corrigé dans les dossiers ; nom nouveau d'une fiche patient → ajouté, `enrichirListes`, règle ouverte aux droits identité / fiche / créer), Google Agenda personnel (`utilisateurs/{uid}.agendaFiltre`, cases par catégorie) + couleurs, bibliothèques (fenêtres de prescription en gestion : `gererListe` d'ordonnances.js), impression, alertes, Activités et rémunérations (parametres.js, droit finances) |
| `js/app/recuperation.js` | Paramètres › Cabinet › Export des données, suite (lot R-F, 20/10/2026, titulaire) : « Export automatique de la semaine » (fonction `exportAuto` : réglage, Google Drive relié par GIS `drive.file`, maintenant, télécharger), « Récupérer des données » (fonction `recuperation` : base à une heure donnée, exports, copie d'avant une récupération, fichier d'export ouvert dans le navigateur ; dossier, document du cabinet, tout le cabinet ; aperçu puis récupérer), « En cas de problème » ; `appelLong` (délai 30 min, aussi pour `cfExporter`) ; CSS « Lot R-F » de v2.html ; test `tests/test_recuperation.py` |
| `js/app/reglages.js` | réglages simples `parametres/reglages` (marges d'impression A5 / A4 / documents, délai du bouton WhatsApp vert, délais des alertes) : `reglages()`, `margesMm()`, variables CSS de l'aperçu |
| `js/app/profil.js` | page **Profil & Paramètres** (18.5) : onglets Informations (photo, INPE, signature, mot de passe), Accès (droits de l'équipe, titulaire), Abonnement et Factures (titulaire, `js/app/abonnement.js` : fonctions `monAbonnement` / `demandeAbonnement`, carte du tableau de bord) ; fournit à Paramètres (`htmlOngletProfil`) les onglets Lieux d'exercice et Google Agenda |
| `js/app/protocoles.js` | bibliothèque de 316+ protocoles |
| `js/app/parametres.js` | onglet « Activités et rémunérations » de la page Paramètres : tarifs par établissement (dates d'effet), activités, actes RT, VMAT |
| `js/app/bilan.js` | bilan financier, exports Excel/PDF |
| `js/moteur/*.js` | **calculs purs, sans DOM ni Firebase** (doses, dates de cures, RT, finances, bilan, résumé, agenda, salle d'attente `salle.js` : lignes du jour, tri, période, recherche, testé par `node tests/moteur/test-salle.mjs` et `tests/test_salle.py`) |
| `js/donnees/conversion.js` | `separer` / `fusionner` : dossier médical ↔ montants (les montants ne sont jamais dans le dossier patient) |
| `js/donnees/listes.js` | DIAG, MUT0, COR0, ACTES_RT, DICT (molécules), FERIES0 |
| `js/donnees/migration.js` | conversion v1 → v2 (`idsParDefaut` encore utilisé par v2.js) ; `bascule.js`, `conversion-v2.html`, `import.html`, `test-droits.html` : retirés du site le 06/10/2026, rangés dans `archives/` (non publié) |
| `guide/` (hors `public/`) | guides d'utilisation par module (`taches.md`), base du guide complet (F3) |

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
  taille }, ajoutée à la consultation du jour (créée « Ordonnance » si besoin) par `enregistrerPrescription` ; R-E7 (19/10/2026) : `items`
  [{ nom, poso }], `parUid`, `modifPar(Uid)`, `versions` [{ le, par, d, lib, html, format, taille, med }] (20 dernières), `annulee` { le, par, parNom }
  (anciennes seulement : depuis le 24/10/2026 une ordonnance se **supprime** de nouveau, `supprimerPrescription`)
- `bibliotheques/medicaments` : `data` = JSON [{ id, nom, poso, classe }] (absent = liste de départ `donnees/medicaments.js`) ;
  `bibliotheques/ordostypes` : `data` = JSON [{ id, nom, items: [{ nom, poso }] }] (absent = `donnees/ordostypes.js`) ;
  `bibliotheques/analyses` [{ id, nom, cat, fav }] et `bibliotheques/bilans` [{ id, nom, items: [noms d'analyses ou de bilans], fav }]
  (absents = `donnees/analyses.js`) ; `bibliotheques/examens` [{ id, nom, cat, note }]
  (absent = `donnees/examens.js` ; pas de bilans d'imagerie) ; `bibliotheques/courriers` [{ id, nom, html, fav }] (absent = `donnees/courriers.js` :
  modèles avec champs {patient} {age} {date}… et zones `<mark class="or-ac">` à compléter) ; `fav` = favori ⭐ (en tête de liste) sur toutes ces listes ;
  lu par les membres, écrit par le **médecin** seulement (07/10/2026 : la secrétaire s'en sert sans les modifier ; du 10/10 au 19/10/2026 elle
  ajoutait un médicament : retiré par R-E5) ; `retires` = identifiants retirés par le cabinet (R-E4 : jamais remis par une mise à jour)
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
- `rcp/{id}` (09/10/2026) : `patientId`, `patientNom`, `etablissementId`, `d` (date de la RCP), `q` (question), `ins` (date
  d'inscription), `fait`, `faitLe`, `faitPar(Nom)`, `decision` (id de la consultation « RCP »), `decisionTxt`, `o`, `creePar(Nom)`,
  `majPar(Nom)` ; lu par les membres (périmètre), écrit avec `ecrireConsultations`, retiré par le médecin ou son auteur
  (`tests/regles/test-rcp.mjs`). Dates : `parametres/rcp` { data: JSON { jours, heure, lieu, plus, annulees } }.
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
- Règlements reçus des cliniques et hôpitaux (étape 15, 09/10/2026) : `finances/reglements` { data: JSON [{ id, d (réception), hop, mode vir|chq,
  m, ref, banque, per, enc (chèque encaissé le ; vide pour un virement), note, par, parNom, le }] } ; cadre unique « Versements et règlements reçus » avec les autres versements (`finances/versements`, comptés) (bilan.js `htmlRecus`),
  **jamais comptés dans le bilan** ; écrits par le droit « finances », lus par le comptable (règle : il n'écrit que paiements / versements).
- Caisse (19.5, 10/10/2026) : lieu « payé au cabinet » = `etablissements/{code}.paiement = "cabinet"` (Lieux d'exercice) ; mode de paiement
  `mode` esp|carte|chq|np|ae (ae = « à encaisser » : venu validé par le médecin, `encaisseIci()` faux ; la secrétaire encaisse depuis
  Salle d'attente › Vus, bouton Encaisser `saEncaisser`) dans `patientsFinances.rdv[rid].mode` / `cures[L][n].consModeJ[j]` et `encaissements` (serveur : `appliquerPrix`
  q.mode) ; 9e colonne de `evtsFin` ; bilan.js `paiementsEffectifs` : lieu au cabinet + mode noté → payé si encaissé (pas « np »), sinon règle
  d'avant ; reçu A5 `imprimerRecu` (v2.js), `recuRdv` / `recuCons`.
- « Payé auto. » : case retirée le 10/10/2026 ; `payeAuto` des tarifs encore appliqué aux actes **avant le 12/10/2026** (`FIN_PAYE_AUTO`, bilan.js).
- Bilan (15 bis B1-B2, 10/10/2026) : acte = 11 colonnes (`evtsFin` : …, mode, identifiant `s|ligne|cure|jour`, `cc|…`, `r|rdv`, `rt|…`, sans tarif 0/1) ;
  case « Payé » = `patient#identifiant` (`clePaye` ; ancienne `cleAncienne` reprise par `migrerPaiements`) ; `finances/paiements` et
  `versements` (avec `id`) relus avant chaque écriture ; page recalculée à chaque ouverture ; `patients/{id}.hopHist` [{ hop, avant }] noté à
  chaque changement d'hôpital (`hopAu` : acte daté avant = ancien hôpital ; règle : droit « tous les établissements »).
  Tests sans navigateur : `node tests/moteur/test-bilan.mjs` (référence `tests/bilan_ref.txt`).
- **Lot D (audit n° 6, 20/10/2026)** : consultation de chimio = un acte par jour payé (`evtsFin`, identifiant `cc|ligne|cure` pour le 1er jour payé,
  `cc|ligne|cure|jour` ensuite ; `consJours` dans moteur/finances.js) ; cases « Payé » rangées par année `finances/paiements_AAAA` (+ ancien
  `finances/paiements` encore lu ; moteur/bilan.js `repartirPaiements`, `placePaiements` alerte à 70 %) ; taux commun de la RT `finances/tarifs.tauxRT`
  { retro, impot } (sans ligne « Radiothérapie » du lieu ; absent = « sans tarif ») ; explications du Bilan derrière un « ? » (`aidesCartes`) ;
  `majMontants`, cases, versements, règlements en transaction ; `patientsFinances` lus dans le périmètre (règle). Guide `guide/bilan.md`.
  Relevé du comptable aussi préparé la nuit par le serveur (`releveNuit`, functions/releve.js ; calcul du site recopié dans functions/site/moteur
  et site/donnees au déploiement, vérifié par `node functions/test-releve.js`).
- Bilan « payé » : `finances/paiements` (coché à la main) + « Payé auto. » des Paramètres (`payeAuto` = date de l'activité dans
  `finances/tarifs` : actes de ce type et de cet établissement à partir de cette date comptés payés ; bilan.js `paiementsEffectifs`).
- `presence/{uid}` (« Dossier ouvert par », salle.js `presenceDossier`) : { patientId, nom, role, le }, écrit par la personne
  elle-même à chaque ouverture de dossier (route) et chaque minute ; lu par les membres ; considéré fermé après 3 min.
  Réglages personnels de la salle d'attente dans `utilisateurs/{uid}` : `salleCachees` (colonnes), `salleTri`.
  Salle : `prix` = prix payé d'avance (proposé dans la fenêtre de prix, `prixPrevu`) ; `ordre` = n° de passage ; `com`.
  `badgeSalle(pid, "r-RDV" | "chimio")` : statut du jour affiché dans l'Agenda et le tableau de bord (mis à jour en direct).
  SA4 (10/10/2026) : `ecrire` = transaction (relit la ligne ; `opts.attendu` = étapes permises, sinon refus ; `opts.ordre` = n°
  tiré de `salleOrdre/{jour_établissement}` { n, jour, etablissementId, majPar }, qui ne fait que monter) ; heures = `maintenant()`
  (horloge corrigée par l'écho serveur `noterEcart`) affichées à l'heure du Maroc (`hm`, Africa/Casablanca) ; `nouveauJour` recharge
  à minuit. SA5 : `lignes(jours)` gardées en mémoire (`CACHE`, empreinte = `GEN` des documents + versions des dossiers) ;
  `poser` met la liste à jour ligne par ligne (`data-k`), `majMinutes` / `majPresence` / `majBulles` sans redessiner.
  SA6 (11/10/2026) : `.sa-haut` collant (onglets, `#saInd` attente moyenne, titres `#saE` synchronisés au défilement de `#saDef`) ;
  `salleCompact` ; `saSuivant` (`fileSalle`) ; `suivre` (autres lignes du même patient) ; `rang` (ordre manuel, `cleNum`) ;
  `message` (« arrivé » médecin, « rouge » secrétaire ; `reglages.salle.notifArrivee / notifRouge`) ; `saCloturer` +
  `rdvAbsentDirect` (v2.js) + alerte `nonCloturees` (v2.js).
  SA8a (11/10/2026) : `actionsDe(l)` = { prin (bouton), menu (⋯, `saMenu`, clic droit) } ; colonnes `att` / `pres` (hh:mm) ; pastille
  `.rd` ; largeurs `utilisateurs/{uid}.salleLargeurs` (`gabarit`, poignée `.sa-poi`) ; semaine repliée (`localStorage`
  `onco360.salleSemaine`) ; compact toujours.
  SA9 (audit externe, 11/10/2026) : colonnes cachées par défaut `CACHEES0` (cor, com) si aucun choix personnel ; bulle `.sa-cm` ;
  onglet d'ouverture `ongletOuverture` (moteur/salle.js ; `AUTO` / `PRET` / `PREC`) ; téléphone : bouton Filtres (`saFiltres`,
  `.sa-pg.ouv`), zones ≥ 44 px.
- **Reçus numérotés (SA9c, 11/10/2026)** : `recus/{patient}_{clé}` (clé `r-RDV` | `c-LIGNE-CURE-JOUR`) = { numero R-AAAA-NNNN, n,
  annee, patientId, patientNom, etablissementId, cle, d, lib, m, mode, imp, par(Nom), dernier(Par/Nom), le, annules [{ numero, m,
  mode, le, par }] } ; compteur `recusCompteur/{AAAA}` { n, majPar } (+1, même transaction, règle) ; v2.js `numeroterRecu` dans
  `imprimerRecu` (o.cle) ; logique `js/moteur/recus.js` ; droits « finances » / « encaissements » (pas le comptable), jamais supprimés.
  Tests : `tests/regles/test-recus.mjs`, `node tests/moteur/test-recus.mjs`.
- Poids validé par la secrétaire (droit « planning » seul, 10/10/2026) : séance prévue du jour, `planning[ligne][n].poids` / `.spoids[j]` /
  `.pv[j]` { nom, par, le }, ajouté par `fusionner`, repris dans `lignesJson` au prochain enregistrement du médecin (`poidsSecretaire`, chimio.js).
- Report de chimio avec le seul droit « planning » (secrétaire, depuis le 08/10/2026) : `sauverLignes` n'écrit que `planningJson` ;
  l'historique du report y est gardé (`planning[ligne][n].rep`, `.srep[j]`), ajouté par `fusionner`, repris dans `lignesJson` au
  prochain enregistrement du médecin.
- Agenda (étape 21, 11/10/2026) : rendez-vous `du` (durée en min, notée à l'enregistrement ; sinon `parametres/calendrier.durees`
  { "s:Annonce" | "a:<activité>": min } = Paramètres › Horaires › « Durée par type de consultation », tous les lieux ; sinon `duree` du lieu
  = pas des créneaux) (moteur/rdv.js `cleRdv` / `dureeRdv`, configuration.js `dureeDe` / `dureeType`) ; `med` (uid du médecin, sans = titulaire,
  `D.medecins` chargé par `chargerMedecins`, `multiMed` / `medRdv`) ; créneaux et doubles réservations par médecin à partir de 2 médecins ;
  heure facultative d'une séance de chimio `planning[ligne][n].hr` (J1) / `.shr[j]` = { h, du } (avec les dates : droit « planning »,
  `separer` / `fusionner` ↔ `c.hr`, `c.sea[j].hr`) et du scanner de centrage `rts[].scanH` { h, du } (droit RT « modifier »).
- **Fiche tumeur, allergie, statut (3.1 à 3.3, 3.1 bis, 12/10/2026)** : localisation = `clinique.diag` (« Localisation » en oncologie, `DIAG` 94 types),
  précision `diagP` (champ du catalogue, après le stade) ; parties de la fiche `sectionChamp` / `repartirFiche` (id, med, tum) ; listes `parametres/listes`
  { diag, stade, grade, mut, cor } ; `diagnosticComplet` / `tumeurDe` (moteur/statut.js) pour les documents ; champs `TUMEUR` (catalogue.js, ids `xt…`, `clinique.extra`, biomarqueurs à condition
  `si.diag` (`FAMILLES_DIAG`) / `champPropose`, ajoutés quand `ficheSpe._onco` : v2.js, cabinet avec module chimio ou RT) ; `clinique.allergie` "" | oui | non (bandeau
  `.al-band` seulement si « oui »), `clinique.statut` traitement | surveillance | perdu | decede + `decesLe` ; logique `public/js/moteur/statut.js`
  (`dernieresNouvelles`, `allergieDans`) ; décédé : rappels, alertes et tâches automatiques (logique.js) coupés ; `reglages.impression.agePoids`.
- **Consultations (3.4, 12/10/2026)** : champs proposés `CONSULT_ONCO` (catalogue.js, `cs` onco | rt, `formConsult(type)`, `champConsultPropose`) ajoutés
  quand `consultSpe._onco` ; `consultations/{c}.modifs` [{ le, par, parNom }] (« modifiée le … ») ; type « Note du secrétariat ».
- **Lignes et modèles (12/10/2026)** : `lignes[].intent` neo | adj | meta | conc + `rang` (ligne métastatique n°) ; `libIntention` (chimio.js) ; `reglages.auto`
  { rtHebdo, rtFin } (Paramètres › Rendez-vous automatiques) ; `reglages.impression` { age, poids, allergie } ; modèles des documents RT : `donnees/modelesrt.js`
  (MODELES_RT0, CHAMPS_RT, remplirModele), modifiés dans `bibliotheques/courriers` (entrées `rt: "pli"|"cr"|"rdv"`, ids rt-…), lus par `modeleRT` (ordonnances.js).
- **Ordonnances : en-tête et signataire (3.9, 12/10/2026)** : `reglages.impression.entete` papier | genere (+ eLogo, eNom, eSpe, eInpe, eLieu ; plus de
  signature scannée depuis R-E5 (19/10/2026) : case eSig, champ du profil et images retirés, `effacerSignature` de v2.js ;
  marge du haut réduite `margesMm`) ; ordonnances.js `cadre(pid, uid)` (aperçu `.or-apercu`, impression `imprimer(w, html, format, taille, { pid, uid })`),
  « Signée par » (`orSignataire`, `O.medUid`, ligne `medUid`) ; carte de chaque médecin `signataires/{uid}` { nom, titre, specialite, inpe, genre,
  idFiscal, tp, ice } (v2.js `publierCarte` / `chargerSignataires`, `API.signataires()` ; règle : lue par l'équipe sauf comptable, écrite par le médecin lui-même).
- **Agenda (3.16)** : `agEv` = Fermer · Ouvrir le dossier · Modifier / décaler (`agModifier` → `ouvrirRdv`, `chModifierRdvChimio(…, apres, pre)`,
  `modifierEtapeRT(id, rid, z scan|deb|fin, apres, pre)`) ; fin prévue : `rts[].finPrev` + `finH` { h, du } ; glisser vers un autre jour = même fenêtre.
- **Types de consultation (3.13, 12/10/2026)** : `parametres/typesConsult` { data: JSON [{ k, nom, rdv, anciens }] } (Paramètres › Dossier patient ›
  Types de consultation ; logique `public/js/moteur/typesconsult.js` : `referentiel` (liste de départ = types de base `STD` + activités des tarifs +
  types du journal), `typesPourRdv`, `cleDeRdv`, `cleDuree`, `nomActuel`, `renommer`) ; `D.typesC` / `API.typesC()` / `window.majTypesC` (v2.js) ;
  noms posés dans `libRdv` par `nommerTypes` (rdv.js) ; durée → `calendrier.durees[cleDuree(k)]`, formulaire → `consultation.typesForm[nom]`,
  créé d'office → `reglages.auto` (`AUTO`), prix → `finances/tarifs` (lignes « non facturé ici » `_v` jamais enregistrées, parametres.js
  `lignesGrille`) ; WhatsApp `CAT_WA` et Google Agenda `categoriesAgenda` (configuration.js) tirés du référentiel ; événements de rendez-vous
  avec `tk` (moteur/agenda.js) lu par `categorie` / `cleFiltre` (logique.js).
- **Rendez-vous à venir (3.7 ter, 12/10/2026)** : consultation de fin de radiothérapie = rendez-vous `type: "Fin de radiothérapie"` (`T_RTF`, rdv.js ; prix
  0 modifiable) avec `rtfin` (id de la RT) et `dO` (date d'origine : suit la fin tant que `d === dO`), `consultFinRT` (moteur/rt.js, appelé par
  `sauverRT` et une fois par `migrations()`, `parametres/migrations.consultFinRT`) ; heure de la 1re séance `rts[].debH` { h, du } (`modifierEtapeRT`,
  `API.heureRT(pid, rid, hr, z)`) ; résumé `r.rt[]` = { d, lib, rt, z scan|deb|fin, h }.
- **Radiothérapie (3.5, 3.6, 12/10/2026)** : `rts[].vol` [{ nom, dose, nb, ty p|seq|int }], `nb` = séances, `ryt` 1 | 2 | bid | hebdo | jours (+ `jours`
  [1…5]) ; `joursSeances` (moteur/rt.js = functions/logique.js, `tests/moteur/test-rt.mjs`) ; compte rendu de fin rempli (documents.js `prochainRdv`,
  `bilanControle`).
- **Heures de la séance de chimio (3.7 bis, 12/10/2026)** : `patients/{id}.heures` { "ligne|cure|jour": { cons: { h, du 15, par, parNom, le } | null
  (consultation, médecin / secrétaire), seance: { h, du, par, parNom, le } | null (hôpital de jour, infirmière) } } ; `fusionner` → `hr` (séance,
  marquée `_h`, avant l'ancienne heure du planning AG5), `hcm` (consultation choisie), `hc` (consultation affichée : choisie, sinon 15 min
  avant la séance, `consultationDe` de moteur/heures.js) ; `separer` ne recopie jamais `_h`, `hc`, `hcm`. chimio.js `heureSeance(x, lid, n, j,
  { cons } | { seance })`, `fenetreHeureSeance`, `chHeure` (cure), `chModifierRdvChimio` (« Modifier » de « Rendez-vous et tâches à venir » : date + heure ;
  plus de fenêtre après la validation, 3.7 ter) ; agenda.js
  `evtsChimio` (médecin : consultation ; infirmière : séance + consultation du médecin) ; résumé / Google Agenda : `hc` seulement. Règle :
  `champsDe` (planning, traitements « modifier », ou « administrer » → `heures`).
- Numéro de dossier (étape 8, 09/10/2026) : `identite.numero` = AAAAMM + rang d'inscription dans le mois (`functions/numeros.js`),
  attribué par les fonctions serveur `numeroDossier` (à la création, appelée par `attribuerNumero` de v2.js) et `numerosManquants`
  (dossiers sans numéro, une fois, par le titulaire dans `migrations()`), transaction sur `compteurs/dossiers` { "AAAAMM": n }
  (aucune règle : serveur seulement). Jamais modifié ; `numDossier(x)` pour l'afficher ; recherche et filtre par hôpital (page Patients).
- Tableau de bord (étape 22, 11/10/2026) : `parametres/accueil` { data: JSON { ordre, cartes, col g|d|l } } (Paramètres › Cabinet ›
  Tableau de bord) par-dessus `reglage.accueil` / `.cartes` de l'administration (`accueilEffectif`, `COLONNES0` de catalogue.js ;
  `lireAccueilCab` / `window.majAccueilCab` dans v2.js) ; deux colonnes à partir de 1280 px (`.tb-grille`, ordre gardé sur téléphone
  par `order`) ; carte `afaire` = `blocAFaire` (À valider par le médecin / À faire par la secrétaire / par l'infirmière) ;
  abonnement : bandeau (`.abo-band`), carte dans `#accAbo` les 7 derniers jours et en retard. Test : `tests/test_accueil.py`.
- **Lot C (19/10/2026, audit n° 4)** : médecin du patient `identite.med` (fichepatient.js `htmlMedecin`, v2.js `medPatient` / `medPourPatient`) ;
  médecin d'une ligne `lignes[].med`, d'une RT `rts[].med` ; lieu facultatif d'un rendez-vous `rdvs[].lieu` (RT : `hop`) ; événements du résumé `m`
  (ligne / RT, sinon patient) ; `permis` (logique.js) filtre aussi séances et RT par médecin. Rappels WhatsApp envoyés : `rappels/{patient}`
  { patientId, etablissementId, l: { "AAAA-MM-JJ|cat": { le, par, nom } }, majPar, maj } (règle, `tests/regles/test-rappels.mjs`), plus dans le dossier.
  Messages WhatsApp `WA_FR` + `WA_AR` (configuration.js, `{jour_ar}` `{heure_ar}`, `messageAvecArabe`). Patients à reprogrammer : `moteur/reprogrammer.js`.
  Agenda : `Actualiser` (`API.relireModifies`), chaque minute, `CACHE` des événements. Consultations hebdomadaires de RT aussi un jour férié (`datesRtc`).
- `utilisateurs/{uid}` : profil (nom, INPE, photo ; `formatOrdo` A5 | A4 retenu pour les ordonnances, R-E7)
- Rappels WhatsApp envoyés (19.4) : `patients/{id}.rappels` { "AAAA-MM-JJ|catégorie": { le, par, nom } } (catégorie `confirm` = confirmation
  après la prise du rendez-vous), écrit avec le droit `rendezvous` (règle), plus de 7 jours retirés ; v2.js `noterRappel`, `rappelsAEnvoyer`,
  carte « rappels » du tableau de bord ; créneaux du jour `creneaux` / `rdvsDuJour` (fenêtre du rendez-vous).
- CIN (19.3, 10/10/2026) : `identite.cin`, champ de base `cin` du catalogue FICHE (après `diag`, en tête par défaut, {cin} des courriers) ;
  `ordreAvecNouveaux` (catalogue.js) place un champ nouveau du catalogue après son prédécesseur dans une fiche déjà réglée.
- Listes corrigées (Paramètres › Listes) : fonction serveur `corrigerListes` (tous les dossiers du cabinet ; logique `renomsValides` /
  `corrigerDossier` de cabinets.js). Lieux : la secrétaire (`secretariat`) complète adresse / tel / ville de ses lieux (`pfLieuSec`, règle).
- **Abonnements (17.4, 10/10/2026)** : `facturation/{e}` (racine, serveur seulement, aucune règle) = { mode essai|mensuel|annuel|gratuit, prix
  (vide = prix du pack), essaiFin, echeance, paiements [{ id, d, m, periode, moyen, ref, avant, apres }], journal, suspenduPour } ; fonctions
  `facturationCabinet` (admin) et `abonnementsNuit` (4 h : suspension 30 j après l'échéance, jamais cabinet-bentahila / démo / gratuit) ;
  prix des packs `prix { mois, an }` (`PRIX0`) ; logique `functions/facturation.js` = `public/js/donnees/facturation.js` (même code, test).
  `client` { raison, ice, if, adresse, email } (coordonnées de facturation, 18.1) ; cabinet supprimé : fiche gardée (`supprime`, `cabinetNom`),
  renvoyée dans `archives` par `listeCabinets` ; onglet **Comptabilité** de admin.js (18.2 : `attendus`, `impaye`, export comptable).
  Réglages (18.3) : `plateforme/abonnements` { suspension demander|auto|jamais (défaut : demander), delai, rappel, essai } (`reglagesAbo`,
  fonction `reglagesAbonnements`) ; `abonnementsNuit` ne suspend qu'en « auto » ; `facturation.jamaisSuspendre`. Prix TTC (TVA 20 %).
  Factures (18.4) : `factures/{id}` (serveur seulement) { numero F-AAAA-NNNN | AV-AAAA-NNNN, type, d, espace, client, editeur, lignes, ht, tva,
  ttc, paiement, ref } créées par `facturer` (functions/index.js) à chaque paiement (avoir au retrait), compteur `compteurs/factures` ;
  `plateforme/editeur` (Mon entreprise, `editeurEnregistrer`) ; mise en page `public/js/donnees/factures.js` (`htmlFacture`, `montantEnLettres`).
  Relances (18.6) : `facturation.relances` [{ le, par, canal whatsapp|email|telephone|autre, type retard|renouveler|essai }] (action `relance`) ;
  modèles `plateforme/abonnements.modeles` (`MODELES_RELANCE0`, `remplirRelance`) ; Comptabilité › Relances (admin.js `htmlRelances`, `ouvrirRelance`).
- **Journal de l'Administration (17.5)** : `journalAdmin/{id}` (racine, serveur seulement) = { le, par, parEmail, type, espace, cabinet, txt },
  écrit par `jAdmin` dans chaque fonction d'administration (et `abonnementsNuit`), lu par la fonction `journalAdmin` (onglet Journal de admin.js).
- **Journal d'audit (09/10/2026)** : `audit/{e}/lignes/{idÉvénement}` = { type creation|modification|suppression|ouverture, col, lib,
  docId, element, quoi [parties touchées, sans valeurs], patientId, patientNom, par, parNom, parRole, via onco360|serveur, pour, le },
  écrit par la fonction `auditEcriture` seulement (identité réelle ; logique `functions/audit.js`) ; lu par le titulaire
  (Paramètres › Journal d'audit, `js/app/audit.js` ; bouton « Journal » du dossier = `auditPatient`).
- **Plusieurs cabinets (09/10/2026)** : `comptes/{uid}` = { espace (principal), espaces [tous ses cabinets, 19.2 du 10/10/2026] }
  (v2.js `cabinetsDe`, menu « Cabinet » `menuCabinets`, choix dans localStorage `onco360.cabinet.{uid}` ; absent = cabinet-bentahila),
  écrit par le serveur seulement (`creerCabinet`, `creerMembre` avec `autreCabinet` confirmé, `compteMembre` à chaque fiche de membre
  écrite ou retirée ; logique `espacesCompte` / `compteModifie` de cabinets.js). `lienMembre` refusé pour un compte de plusieurs cabinets. Cabinets
  neufs `espaces/cab-…` créés par le compte d'administration (collection `administrateurs`, page `admin.html` / `js/app/admin.js`,
  fonctions `creerCabinet` / `listeCabinets`) ; copie de ce que reçoit un cabinet neuf : `functions/cabinets.js` (protocoles,
  fériés, diagnostics, mutuelles, bibliothèques de prescription, tarifs RT ; pas de correspondants, établissements, autres tarifs,
  patients, profil, bilan) ; `functions/listes-depart.json` = copie de DIAG / MUT0 (vérifiée par `node functions/test-cabinets.js`).
  Règles : `adminIci()` = pouvoirs de `proprietaire()` dans cabinet-bentahila seulement ; l'administration n'ouvre aucun cabinet
  (`tests/regles/test-cabinets.mjs`). Premier démarrage : carte `premiersPas()` du tableau de bord. `A.ESPACE` est un accesseur.
  Formules et modules (09/10/2026) : `public/js/donnees/modules.js` (= `functions/cabinets.js` MODULES / FORMULES) ; `espaces/{e}.abonnement`
  { formule, surMesure, modules, max } écrit par `abonnementCabinet` ; `D.abo` / `module(k)` (v2.js, `A.module`) ; module retiré =
  `body.sans-<k>` cache `[data-mod~=k]`, `PAGE_MODULE` renvoie au tableau de bord ; suspendre / supprimer : `etatCabinet` /
  `supprimerCabinet` (`espaces/{e}.actif = false` → règles `cabinetActif()`) ; lien du mot de passe : `lienMotDePasse`.
  Bibliothèques de référence par spécialité (10/10/2026) : espaces sans patient `espaces/bib-oncologie|bib-generaliste|bib-gynecologie`
  (`bibliotheque: true`, `BIBS` de cabinets.js = `BIBLIOTHEQUES_SPE` de modules.js), ouverts par l'administration (`bibliothequeOuvrir`,
  `v2.html?espace=bib-…`, `D.bib` : Protocoles + Paramètres seulement, listes de départ figées par `figerListes` / `figerDocumentation`) ;
  `creerEspace` copie la bibliothèque de la spécialité de la formule (`sourceBib`, PDF recopiés) ; `plateforme/reference` = ancienne copie
  (09/10), source de bib-oncologie. `compteMembre` ignore les bibliothèques. Paramètres de base de la spécialité (`PARAMS_SPE`,
  `parametreDepart`) dans la bibliothèque, copiés aux cabinets neufs. Modules par spécialité : `MODULE_FAMILLE`, `MODULE_MENU`,
  `MODULES_PREVUS` (modules.js), onglet « Modules et menus » de l'Administration.
  Réglage du cabinet (10/10/2026) : `espaces/{e}.abonnement.reglage` { menu, accueil, cartes, ordreSections, sections, bibliotheques,
  fonctions } ; catalogue `public/js/donnees/catalogue.js` (MENU, FONCTIONS, FONCTIONS_RELIEES, CARTES, SECTIONS, BIBLIOTHEQUES,
  `reglageEffectif`, `styleRetraits`) ; dans Onco360 `D.reg` (menu réordonné, cartes de `pageAccueil` via `carte(k, …)`, onglets de
  `ONGLETS()`, éléments `[data-fn~="module.fonction"]` / `[data-bib~="…"]` cachés, `A.fn(k)` / `fnOn(k)` dans le code) ; FONCTIONS : 3e élément
  true = fonction de base (toujours présente) ; serveur : `contexteAuto` (taches.auto, rt.taches), `fonctionPresente` (taches.gagenda).
  Fiche patient réglable (10/10/2026) : **fiche de la spécialité** (la même pour tous les packs) `plateforme/specialites` { idSpécialité: { nom, fiche } },
  réglée dans Administration › Par spécialité › Bibliothèque et paramètres, recopiée dans `espaces/{e}.ficheSpe` de chaque cabinet de la spécialité
  (fonction `ficheSpecialite`, aussi à la création) ; fiche = { ordre, champs, libs (nom affiché d'un champ existant), entetes (en tête du dossier, champ par champ ; départ `ENTETE0`), ajouts [{ id x…, lib, type,
  choix, partie, imprimer, entete }] } ; retouches du cabinet `reglage.fiche` (différences seulement, `ficheRetouches`) ; pas de fiche dans un pack ;
  catalogue `FICHE` / `ficheEffective(retouches, ficheSpe)` / `libChamp` (catalogue.js, fonctions communes `formEffectif` / `formRetouches` / `libDe`) ;
  **Formulaire de consultation (16.7)** : même système ; 3.12 (12/10/2026) : `formulaires` [{ id, nom, champs }] et `typesForm` { type: id }
  (`formulairesDe`, `formDuType`, `champDuType` de catalogue.js ; sans réglage : onco / rt / simple d'après `cs` et `formConsult`) ; (`CONSULT`, `consultEffective`, `TYPES_CHAMP_CS` : + texte long, section, unité ;
  `choixs.type` = liste des types de consultation), spécialité `plateforme/specialites[id].consultation` → `espaces/{e}.consultSpe`,
  retouches `reglage.consultation`, valeurs `consultations/{c}.extra` (consultations.js `formulaire`, `htmlExtra`) ; `js/app/fichepatient.js` (3.11 : formulaires rendus depuis `champsDe`) ; valeurs `identite.extra` / `clinique.extra` ; réglage 3.11 :
  `types` (TYPES_CHAMP + `ouinonp` = oui / non + précision : texte dans la clé, oui / non dans `drapeau(clé)`, allergie : `allergie`), `sections`
  (id | med | tum, partie affichée), `imprimes`, `unites`, `choixs` d'un champ d'origine devenu liste ; `FIXES` (type fixe + raison), `LISTES_CAB`.
  Enregistrer la chimio (`sauverLignes`) ne reconstruit plus `clinique` (perte de données corrigée le 12/10/2026 ; `cliniqueRemise` répare `_autres`). Comptes de l'équipe : `creerMembre` / `lienMembre` (serveur ;
  la création de comptes depuis le navigateur est fermée dans Firebase). Cabinet de
  démonstration : `cab-demonstration` (`demo: true`), `creerCabinetDemo` / `demoReinitialiser`, patients fictifs `functions/demo.js`.
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
- Bilan : `tests/test_bilan.py` compare au chiffre du jeu de test **fictif** figé (S7, 24/10/2026 : `tests/seed-fictif.json` de `tests/mkfictif.mjs`, 363 734 DH,
  `tests/bilan_ref_fictif.txt` ; l'ancienne copie réelle, 352 317 DH, seulement avec `ONCO360_SEED=reel`), pas au cabinet en ligne ; décidé le 10/10/2026 : ne plus le vérifier à chaque étape, seulement si bilan.js ou les calculs changent.
- Droits : `medecin` / `infirmiere` / `assistante` / `comptable` (09/10/2026 : bilan et pointage des paiements sur le relevé
  `comptabilite/releve_*` préparé par le médecin, `publierReleve` de bilan.js ; aucun dossier : règles `comptable()` / `dansPerimetre`), grille par membre ; un membre ne modifie pas ses propres droits.
  Droits ajoutés le 06/10/2026 (DROITS_ROLE et `droitsEffectifs` dans profil.js : un droit absent de la grille d'un membre
  prend la valeur par défaut de son rôle ; `migrations()` dans v2.js l'écrit dans les fiches des membres, une fois, par le titulaire) :
  `fichePatient` (poids, taille, diagnostic, allergies, antécédents ; règle : `clinique` sans toucher à `clinique.notes`),
  `secretariat` (10/10/2026, étape 19 : absences, fériés, horaires de ses lieux, messages WhatsApp, RCP, listes, types de tâches
  et de documents, impression, alertes ; règle `parametres/{calendrier, listes, typesTaches, typesDocuments, reglages, whatsapp, rcp}` ;
  `ONGLETS_SEC` de configuration.js),
  `consultations` (voir consultations et hospitalisations), `documents` (pli, CR, rendez-vous Excel), `encaissements`
  (collection `encaissements/{patient}` = prix des consultations validées + consultation de chimio cochée, écrite par
  `majMontants` / `ecrireEncaissements` dans chimio.js, sans honoraires ni RT), `radiotherapie: "chimio"` (voir la RT
  seulement des patients sous chimio en même temps). Secrétaire : fiche, documents, encaissements. Infirmière : pas de
  consultations, RT « chimio », pas de documents. Secrétaire : n'annule pas un statut de rendez-vous posé par le médecin
  (`sp` = auteur du statut), ne voit que les horaires de son centre (Configuration). Le filtrage des rendez-vous est fait à l'écran et dans Google Agenda
  (`functions/logique.js` `permis`), pas par les règles (le dossier patient reste lisible en entier par le serveur).

## Sauvegardes
**Mode d'emploi pour récupérer ses données : `outils/RESTAURER.md`** (Administration, dernier recours) et **`guide/en-cas-de-probleme.md`**
(cabinet, aussi dans Onco360 : Paramètres › Cabinet › Export des données › « En cas de problème »).
- **Lot R-F (audit n° 8, 20/10/2026)** : fonctions serveur dans `functions/sauvegardes.js` (branchées en fin d'index.js) ; logique pure `restauration.js`,
  `drive.js`, `sauvegarde.js`, `exportation.js`. **Récupérer** (`recuperation`, titulaire ou Administration sans nom) un dossier (patient + patientsFinances,
  encaissements, rappels, et consultations, documentsRT, fichiers, rcp, taches, salle, recus, administrations par patientId), un document du cabinet
  (`COLS_DOCUMENT`) ou tout le cabinet, depuis la base à une heure donnée (PITR, `readTime`, 7 jours), un export (`exports/…/donnees.json.gz`), la copie
  d'avant une récupération (`espaces/{e}/recuperations/{ms}.json.gz`), un fichier de l'ordinateur ou une base restaurée à côté (Administration) ;
  créé depuis = gardé ; reçus / administrations existants, membres, compteurs, journal jamais remplacés ; PDF repris de la copie de secours ;
  commande `outils/recuperer.mjs` (même code). **Export de la semaine** `exportsHebdo` (dimanche 1 h 30) : `exports/auto-{ms}/` (dernier ZIP, données 14
  semaines) + Google Drive du cabinet (`driveJetons/{e}`, réglage `exportsAuto/{e}`, serveur seul ; prérequis : API Drive activée, `drive.file` à l'écran
  de consentement). Export au fil de l'eau, ancien retiré après, vraies extensions, `comptes` (emails) dans l'export. Copie des fichiers : résultat
  `plateforme/sauvegardeFichiers`, garde-fou (> 20 et > 10 % disparus : rien retiré), alerte (`sauvegardesEtat`, Administration › Sauvegardes).
  `restaurer-export.mjs` : cible non vide refusée (`--vider`), `--comptes` (même uid). Copie Drive Apps Script **v11** au format de l'export.
  Tests : `cd tests/regles && npm run export` (73), `node functions/test-restauration.js`, `test-drive.js`, `tests/moteur/test-copie-drive.mjs`.
- **Export complet d'un cabinet (1.6, 11/10/2026)** : Paramètres › Cabinet › Export des données (médecin titulaire) → fonction
  `exporterCabinet` (2 Go, 9 min) : ZIP dans `espaces/{e}/exports/{ms}/Onco360_export_AAAA-MM-JJ.zip` (lu par le titulaire seul :
  storage.rules ; l'export précédent est effacé) = `LISEZMOI.txt`, `patients.csv` (BOM, « ; »), `donnees/onco360.json` { application,
  format 1, espace, date, cabinet, collections, utilisateurs, journalAudit, dates { "col/doc" | "@cabinet" | "@audit/id": [chemins des
  dates Firestore] }, zip { chemin du stockage: chemin dans le ZIP } }, `fichiers/<n° nom>/<date titre>.pdf`, `documentation/` ; noté dans
  `historique`. Logique `functions/exportation.js` (test-exportation.js) ; restauration `outils/restaurer-export.mjs` (dates remises,
  chemins adaptés au cabinet cible) ; test de bout en bout `cd tests/regles && npm run export` (émulateurs auth, firestore, storage,
  functions ; `functions/.secret.local` factice, non versionné).
- **Copie de secours des fichiers (1.6)** : `fichiersNuit` (2 h 15) / `fichiersSauvegarder` (administration) recopient `espaces/**`
  (sauf `exports/`) dans le bucket `<projet>-sauvegarde-fichiers` (EUROPE-WEST4, versions gardées 30 jours, jamais public, créé la
  1re nuit) ; logique `functions/sauvegarde.js` (test-sauvegarde.js).
- **Code** : dépôt GitHub **privé** `ritabentahila-alt/onco360` (SSH), poussé à la fin de chaque étape testée (jamais `tests/seed.json`).
- **Firestore natif (offre Blaze)** : sauvegarde quotidienne de TOUTE la base (v1 + Onco360) depuis le 03/10/2026,
  conservée 14 semaines (`firebase firestore:backups:list`), vers 21 h–22 h UTC, région europe-west1.
  Protection contre la suppression de la base activée. Restauration = vers une NOUVELLE base (`firestore:databases:restore`).
  Restauration à la minute près (PITR) : activée le 06/10/2026, 7 jours glissants.
- Copies lisibles dans le Drive (Google Apps Script du compte de Dr Bentahila, projet « Chimio HGC », Drive > Sauvegardes) :
- Ancienne application : sauvegarde arrêtée et supprimée le 11/10/2026 (ancienne application effacée).
- Onco360 : `apps-script/onco360-sauvegarde.gs` **v11 au format de l'export (20/10/2026, à coller ; v10 autonome avant)**, seul fichier du projet Apps Script « Chimio HGC » (rangé dans
  Drive › Application Chimio HGC), installé le 11/10/2026, vers 3 h → `Application Chimio HGC/Sauvegardes/Onco360/Onco360_AAAA-MM-JJ.json`
  = `{ compte, documents: { "chemin/complet": champs } }` (cabinet Bentahila entier, collections trouvées automatiquement, + profils des
  membres). 30 derniers + le 1er du mois. E-mail en cas d'échec.

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
  Couleurs personnelles (10/10/2026) : `utilisateurs/{uid}.agendaCouleurs` (membres sans droit « paramètres »), avant celles du cabinet.
  Plusieurs cabinets (19.2) : un seul agenda par personne pour tous ses cabinets (`cabinetsAgenda`, nom du cabinet ajouté au titre),
  `agendaJetons/{uid}.espaces` ; filtre par cabinet `agendaFiltre.cabinets[e].exclus` (sinon `agendaFiltre.exclus`).
  Ce que chacun voit (P3, 08/10/2026) : `utilisateurs/{uid}.agendaFiltre.exclus` (clés `cleFiltre` : rdv:annonce, rdv:act:<activité>,
  chimio:cure / seance, rt:scan|deb|fin|dosi, abs, tache:<type>) ; `agendaFiltre` refait l'agenda de la personne. Jetons : `agendaJetons/{uid}` (aucune règle = invisible du navigateur) ; état :
  `utilisateurs/{uid}.agendaGoogle`. Logique pure : `functions/logique.js`, tests : `node functions/test-logique.js`.
  Prérequis : API Google Calendar activée, écran de consentement « Onco360 » publié, client OAuth Web (ID dans
  `public/js/config.js` GOOGLE_CLIENT_ID et `functions/.env` ; secret : `firebase functions:secrets:set GOOGLE_CLIENT_SECRET`).
- **Ancien (script Google du titulaire)** : arrêté le 06/10, `apps-script/onco360-agenda.gs` et la carte « Ancienne synchronisation »
  retirés le 11/10/2026 (`parametres/agendaGoogle` n'est plus lu).
- Étape 21 (11/10/2026) : événements de rendez-vous avec `dur` (durée notée) et `m` (médecin) ; `permis(m, ev, r, qui)` : l'agenda d'un
  médecin ne reçoit que ses rendez-vous (sans `m` = titulaire) ; séances de chimio / scanner avec heure → `h` + `dur`.

## Phase F : plusieurs cabinets (décidé le 06/10/2026, but : vendre Onco360 avec un guide complet)
Choix de Dr Bentahila : inscription par **code d'activation** (vendu par elle) ; nouveau cabinet = **copie de sa bibliothèque
de protocoles** ; l'éditrice n'a **aucun accès aux patients** des autres cabinets (règles serveur). Chaque médecin relie son
Google Agenda (déjà en place, par personne).
- F1 : inscription avec code + création automatique du cabinet ; ESPACE dynamique (cabinet de la personne connectée) ;
  page Administration (codes, cabinets, abonnements, sans données médicales) ; retirer tout ce qui est propre au Dr
  Bentahila (INPE et nom par défaut sur la fiche, HGC/HCK par défaut dans tarifs.js / rdv.js / parametres.js) ; premier
  démarrage guidé ; tests d'étanchéité entre cabinets (bilan Bentahila inchangé : 352 317 DH).
  **À valider avec elle d'abord : la liste exacte de ce que reçoit un nouveau cabinet** (ex. PAS sa liste de correspondants).
- F2 : nom de domaine, ~~retirer ancienne app~~ (fait le 11/10), CGU + politique de confidentialité
  (aussi pour la vérification Google), suivi des abonnements. Point juridique signalé : données de santé, loi 09-08 / CNDP,
  hébergement hors Maroc.
- F3 : guide complet (PDF illustré + aide intégrée). Puis suite de la phase E (vue infirmière, pharmacie J−1, relevé mensuel).

## Tests
`tests/` : faux Firebase (`mockfb/`) + Playwright (Python). Voir `tests/LISEZMOI.md`.
Aucune donnée patient n'est dans le code ; jeu de test fictif `tests/seed-fictif.json` (S7, refait par `node tests/mkfictif.mjs`) ; contrôle
`outils/noms-reels.py` (aucun nom de la copie réelle locale `tests/seed.json` dans le dépôt) et ESLint (`outils/eslint`) dans `avant-mise-en-ligne.sh`.
Règles de sécurité : `cd tests/regles && npm test` (émulateur Firestore, Java 21 ; `npm install --cache` vers un dossier
temporaire si le cache npm du Mac refuse) — à relancer avant chaque mise en ligne des règles ; ajouter des cas pour chaque nouvelle règle.

## Méthode de travail souhaitée
- Réponses en français, directes ; l'utilisateur n'est pas développeur : commandes Terminal prêtes à copier.
- Toujours tester (navigateur + bilan) avant livraison ; vérifier mobile (largeur 390 px sans débordement).
- **Vérifier tout ce qu'un changement touche (consigne du 17/10/2026)** : avant de livrer, vérifier que le changement ne touche que ce qui est visé. S'il
  touche autre chose (paramétrage, agenda, salle d'attente, Google Agenda, tableau de bord, bilan, droits, impression, tâches automatiques, Administration…),
  vérifier que tout cela marche encore, **avec un test**. Toujours sur ordinateur et sur téléphone (390 px). Les modules s'imbriquent : un même fait (un
  rendez-vous déplacé, une séance validée, un poids saisi) doit être juste partout où il apparaît. Liste de contrôle (carte des liens) : `FEUILLE-DE-ROUTE.md`,
  « Comment on travaille ». Ne jamais bloquer un médecin (un clic, aucun motif) ; rien ne disparaît quand une disposition change.
- 4.3 (12/10/2026) : 8 tailles de texte `--t1`…`--t8` (v2.html et admin.html), couleurs en variables (`:root`), icônes dessinées `ic(…)` (pas d'émoji
  à l'écran ; `icones()` de v2.js pour un texte déjà échappé), recherche en pilule `#trQ` (`rechercheTete`). Jamais de « // commentaire » au milieu
  d'une ligne de code (`outils/commentaires.py`).
- Design : Arial, fond #F1F5FB (#F5F7FB avant le 11/10), couleur principale #3563B0, cartes blanches arrondies, page pleine largeur (du menu au bord droit, 11/10/2026 ; avant : 1240 px).
  Étape 20 (design, 11/10/2026, `FEUILLE-DE-ROUTE.md`) : menu repliable (`body.menu-replie`, `--menu` 76 px, bouton `btReplier`,
  `localStorage` `onco360.menuReplie`) ; barres d'onglets longues = `ag-vues defile` (une ligne qui défile, flèches ajoutées par v2.js).

## À faire
Voir `FEUILLE-DE-ROUTE.md` (plan unique du 11/10/2026, d'après les deux audits externes du Drive › Audit). Annulés le 06/10/2026 : assistant IA, rappels WhatsApp automatiques, commande pharmacie J−1,
relevé mensuel. « Marquer administrée » (vue infirmière) : repris le 08/10 (étape 11). Demandes du 08/10 = étapes 6 à 13
de la feuille de route (salle d'attente, RCP, numéro de dossier, audit / mode démo, hors-ligne, soins infirmiers et
pharmacie, dossier de cession, HL7/FHIR). Pas de téléconsultation. Vente : abonnements et cession.
