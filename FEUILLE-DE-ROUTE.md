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

## Questions et rappels pour Dr Bentahila (Claude les rappelle en début de session)
- [ ] **Mesurer la hauteur des en-têtes du papier** (réglable soi-même depuis le 08/10 : Paramètres › Impression) (ordonnance A5, ordonnance A4, papier A4 des documents) et la largeur
      des marges souhaitées, pour régler exactement les marges d'impression. Réglage provisoire du 07/10 : A5 haut 45 mm /
      côtés 28 mm ; ordonnance A4 haut 60 mm / côtés 35 mm ; documents A4 (pli, compte rendu, rendez-vous) haut 45 mm /
      côtés 35 mm ; bas 18 à 22 mm.

- [x] Java 21 installé le 08/10 : les règles de sécurité se testent sur l'émulateur (`tests/regles`).

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

## Organisation d'Onco360 depuis le 10/10/2026 (décidé par Dr Bentahila) : qui gère quoi
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

**1A – Onglets du dossier** (fait, testé et mis en ligne le 07/10)
Disposition décidée par Dr Bentahila le 07/10, de haut en bas :
- [x] En haut, inchangés : identité + résumé du patient, rendez-vous à venir.
- [x] En dessous, **un seul cadre** avec 4 onglets : **Consultation · Chimiothérapie · Radiothérapie · Documents** (avec
      leur nombre), **pictogrammes au trait** (pas d'émoticônes).
- [x] Tout en bas, **dans un autre cadre** : « Consultations et hospitalisations » (rendez-vous passés, venu / non venu,
      prix à encaisser), gardé tel qu'aujourd'hui, en dehors des onglets.
- [x] Chimiothérapie = carte chimio actuelle ; Radiothérapie = carte RT actuelle, **avec ses boutons pli confidentiel,
      compte rendu de fin et rendez-vous Excel** (c'est de là qu'on les génère, décision du 07/10).
- [x] Documents : pour l'instant un message. **Décision du 07/10 : rien n'ira dans cet onglet** (voir 1A bis).
- [x] Le dossier **s'ouvre toujours sur Consultation** ; un clic sur un onglet affiche sa carte ; l'onglet reste affiché
      après un enregistrement, et on revient sur Consultation en rouvrant le dossier. Sans l'onglet Consultation
      (infirmière), le premier onglet permis s'ouvre.
- [x] Onglets montrés selon les droits (testé) : médecin 4 onglets ; secrétaire Consultation, Radiothérapie, Documents ;
      **infirmière (décision du 07/10) : Consultation en lecture, Chimiothérapie ouverte en premier, Radiothérapie en
      lecture pour tous ses patients** (tableau de bord et agenda inchangés : radiothérapie des patients sous chimio).
      Les onglets Consultation et Chimiothérapie sont toujours présents (message « aucune… » s'ils sont vides).
- [x] Téléphone 390 px : les 4 onglets tiennent sur la largeur (pictogramme au-dessus du nom), rien ne déborde.
- [x] Bilan 2026 inchangé : 352 317 DH. Aucune erreur dans la console.
- [x] Mise en ligne (accord de Dr Bentahila le 07/10).

Test : Playwright n'est pas installé sur ce Mac ; testé dans le navigateur intégré avec le faux Firebase, sur une copie
du site dans un dossier temporaire (macOS empêche le serveur de test de lire le Bureau).

**1A bis – Documents de radiothérapie dans une fenêtre** (fait, testé et mis en ligne le 07/10 ; décision du 07/10, remplace l'ancienne idée de
« copies dans l'onglet Documents », abandonnée)
Décision : **rien ne va dans un onglet Documents**. Les ordonnances et courriers restent derrière leur petite flèche
(antécédents, 1D / 1E). Le pli confidentiel, le compte rendu de fin et les rendez-vous de radiothérapie restent dans la carte
de leur radiothérapie :
- [x] Clic sur « Pli confidentiel » (ou « Compte rendu de fin », « Rendez-vous ») → une **fenêtre s'ouvre avec le document**
      rempli depuis le dossier ; le médecin le **modifie**, peut l'**imprimer**, et l'**enregistre**.
- [x] Le document enregistré **reste attaché à sa radiothérapie** : un nouveau clic sur le même bouton rouvre **la version
      modifiée et enregistrée** (pas un nouveau document).
- [ ] Même fonctionnement pour les courriers (1E).
- [x] Réponses de Dr Bentahila (07/10) :
  - **Pli confidentiel et compte rendu de fin : fenêtre seulement**, plus de fichier Word. La mise en page de ses modèles
    Word (`modeles/`) est recréée dans Onco360 (texte modifiable, impression A4, papier à en-tête).
  - **Rendez-vous de radiothérapie : tableau des séances dans la fenêtre** (modifiable, imprimable, enregistré), plus
    d'Excel.
  - **Médecin et secrétaire** peuvent modifier et enregistrer ces documents.
  - **L'onglet Documents est gardé** pour y **déposer des fichiers venus d'ailleurs** (PDF, photos : anapath, imagerie,
    bilans) → étape à part (Firebase Storage, taille limitée, suppression par le médecin, sauvegarde des fichiers à prévoir).
  - [x] **Fait le 08/10** (testé, pas encore en ligne) : onglet Documents = dépôt de fichiers (PDF, Word, JPEG, PNG… 25 Mo
    au plus) avec **titre, date du document et type** ; liste du plus récent au plus ancien, **recherche** (titre, type, nom
    du fichier) et **filtre par type** ; Ouvrir, Télécharger, Modifier (titre, date, type), Supprimer (médecin : tous ;
    secrétaire : ceux qu'elle a déposés) ; infirmière : pas d'onglet (droit « documents »). **Types modifiables par le
    médecin** dans Configuration › Documents (ajouter, renommer, ordre, retirer ; un document garde son type). Cloud Storage
    activé le 08/10 (europe-west1, bucket `chimio-hgc.firebasestorage.app`, corbeille de 7 jours), règles `storage.rules`
    (membre actif, droit « documents », périmètre), fiches `fichiers/{id}`. **Les fichiers ne sont pas dans les sauvegardes
    quotidiennes de la base** (à prévoir : copie du stockage).
  - [x] **Bouton « Doc. »** (08/10, testé, pas encore en ligne) à côté de Courriers : documentation du cabinet à remettre
    aux patients (PDF) ; les 2 régimes de radiothérapie pelvienne y sont passés (retirés de Courriers). Recherche, filtre
    par catégorie, tri (favoris puis A → Z, plus récents, par catégorie), ⭐ ; **le médecin** ajoute (+ PDF, titre,
    catégorie), modifie, supprime ; secrétaire : ouvrir et remettre. « Remettre » ouvre le PDF et note une ligne « Doc. »
    dans la consultation du jour (badge « remis le … ») ; petite flèche = ce qui a déjà été remis au patient.
    `bibliotheques/documentation`, PDF dans Cloud Storage `espaces/{e}/documentation/…` (storage.rules).
  - [x] **Ligne libre avec suggestions** (08/10, toutes les fenêtres de prescription) : en tapant « NF », la liste propose
    NFS – plaquettes (médicaments avec leur posologie ; un bilan choisi est développé) ; sinon le texte tapé reste.
- [x] Données : `documentsRT/{patient}_{radiothérapie}_{pli|cr|rdv}` (une version par radiothérapie et par type : html,
      date, auteur) ; règle : droit « documents » (médecin, secrétaire) dans le périmètre. Patient supprimé ou changé
      d'hôpital : ses documents suivent.
- [x] Fenêtre : feuille A4 (zone « En-tête du papier » en haut, comme l'ordonnance), texte modifiable (gras, souligné),
      **Fermer · Enregistrer · Enregistrer + Imprimer** ; « Repartir du dossier » sur une version enregistrée (document neuf
      avec les informations actuelles). Bouton coché en vert dans la carte quand le document est enregistré (date et auteur
      au survol).
- [x] **Pli confidentiel** : les 3 pages du modèle (lettre, compte rendu médical, ordonnance médicale), « À REMPLIR »
      surligné si une information manque, saut de page à l'impression. **Compte rendu de fin** : les 6 rubriques et le
      tableau du modèle, « à compléter par le médecin » en gris. **Rendez-vous** : dates de début et de fin, patient,
      médecin, tableau des séances (date, durée, activité, ressource, état), cases modifiables.
- [x] Signature : « Dr NOM Prénom » + spécialité du médecin (celui de la secrétaire si c'est elle : la spécialité du
      titulaire est enregistrée dans `parametres/medecinTitulaire` à sa prochaine ouverture d'Onco360).
- [x] Code Word / Excel retiré (`documents.js` réécrit) ; les modèles Word restent dans `modeles/` comme référence.
- [x] Tests : pli (modifié, enregistré, imprimé, rouvert avec la modification), compte rendu, rendez-vous (case modifiée
      et enregistrée), secrétaire (signature de son médecin), infirmière (aucun bouton), téléphone 390 px, bilan 352 317 DH.
- [x] Mise en ligne le 07/10 (site + règle `documentsRT`).
- [x] Marges encore resserrées et haut agrandi le 07/10 (voir « Questions et rappels » en haut : mesurer les en-têtes).
- [x] **Marges d'impression élargies (07/10, le texte collait aux côtés)**, sur chaque page : ordonnances A5 36 mm (haut) /
      22 mm (côtés) / 18 mm (bas), ordonnances A4 48 / 28 / 22 mm, documents RT A4 34 / 28 / 22 mm ; aperçu à l'écran
      ajusté. Vérifié en PDF (Chrome). La fiche chimio (A4 paysage) garde ses marges.

**1B – Consultations (journal médical)** (fait, testé et mis en ligne le 07/10)
- [x] Menu des consultations : **RCP** ajouté le 07/10.
- [x] « Nouvelle consultation » : **menu déroulant** (Consultation de suivi, d'annonce, de chimiothérapie…) **et titre à
      remplir** (ex. « J1C1 FOLFOX »), date du jour (modifiable), note ; nom de la personne qui l'a créée. Affiché :
      « Consultation de chimiothérapie · J1C1 FOLFOX » (retouche du 07/10). Créée **à la main** par le médecin ou la secrétaire : marquer un rendez-vous « Venu » ne crée rien.
- [x] À l'intérieur : ligne **Note** (texte libre, à la place de « Motif Cs »), avec le nom de son auteur à droite.
- [ ] Chaque prescription faite ajoute une ligne : « Médic. — Amlodipine 5 mg », « Analyses — NFS Urée Créatinine »,
      « Examens compl. — … », « Ordo type — … », « Courrier — … ». Clic sur la ligne = revoir le document.
      → l'affichage des lignes est prêt (champ `lignes`) ; elles seront ajoutées par les ordonnances (1C à 1E).
- [x] Consultations **pliables** (date + titre + auteur), la plus récente ouverte ; un clic plie / déplie.
- [x] Barre de 5 boutons **indépendante des consultations, en bas de l'onglet** (retouche du 07/10) : **Médic. ▾ ·
      Examens compl. ▾ · Ordo. type ▾ · Analyses ▾ · Courriers ▾** (pictogrammes). Une ordonnance faite depuis cette barre
      s'ajoutera **en ligne dans la consultation du jour** (« Médic. — … »). Pour l'instant « bientôt disponible »
      (construits en 1C à 1E).
- [x] **Modifier** (titre, date, note) : médecin et secrétaire ; **Supprimer** : médecin seulement (avec confirmation).
- [x] Données : collection `consultations` (une fiche par consultation, avec le patient et son établissement ; pas une
      sous-collection, pour que la copie Drive la sauvegarde aussi). Règles de sécurité : **lecture par tous les membres**
      (dans leur périmètre ; l'infirmière lit), écriture avec le nouveau droit **« Journal des consultations et
      ordonnances : créer, modifier »** (oui par défaut médecin et secrétaire, non infirmière), suppression par un médecin.
      Patient supprimé → ses consultations aussi ; hôpital du patient changé → ses consultations suivent.
- [x] **Secrétaire : onglet Chimiothérapie en lecture** (décision du 07/10) : droit « Chimiothérapie » passé de « Non
      visible » à « Voir » par défaut, et pour les secrétaires existantes (mise à niveau faite une fois, à l'ouverture
      d'Onco360 par Dr Bentahila). Son Google Agenda recevra aussi les cures (comme l'agenda d'Onco360).
- [x] Infirmière (confirmé le 07/10) : rendez-vous de radiothérapie seulement des patients sous radio-chimiothérapie
      concomitante ; dans le dossier, toutes les prescriptions de chimio et de radiothérapie en lecture.
- [x] Tests : médecin (créer, plier, modifier, supprimer, relecture à la réouverture), secrétaire (créer, modifier, pas
      supprimer, chimio en lecture), infirmière (lecture seule), téléphone 390 px, bilan 352 317 DH, règles de sécurité
      compilées, aucune erreur.
- [x] Mise en ligne le 07/10 : site **et règles de sécurité** (accord de Dr Bentahila). Ensuite, **Dr Bentahila ouvre
      Onco360 en premier** (mise à niveau des droits de l'équipe) avant que la secrétaire écrive une consultation.

**1C – Médicaments et ordonnance** (le moteur commun) (fait et testé le 07/10, pas encore en ligne)
- [x] **Décidé le 07/10** : si l'on fait une ordonnance sans consultation à la date du jour, Onco360 crée automatiquement
      une consultation du jour qui ne contient que l'ordonnance (ligne « Médic. — … »).
- [x] Liste des médicaments reçue le 07/10 (`Ordonnances_Chimio.xlsx`, 225 lignes) → nettoyée dans
      `listes/Medicaments_Onco360.xlsx` : **147 lignes** (doublons fusionnés ; quand un même médicament avait des
      posologies vraiment différentes, elles sont gardées comme variantes), posologies rédigées en clair (« 1 comprimé
      matin et soir (soit 2 comprimés par jour) »), **colonne « Classe thérapeutique »** (vérifiée sur les sites marocains
      medicament.ma / annuaire-gratuit.ma / med.ma pour les noms incertains), colonne « Remarque » (ce qui a changé).
- [x] Lignes en jaune relues et corrigées par Dr Bentahila le 07/10 (quelques lignes supprimées) ; colonne « Remarque »
      retirée.
- [x] **30 médicaments d'oncologie ajoutés** (en vert dans le fichier) : chimiothérapies orales (capécitabine, témozolomide
      adjuvant, vinorelbine orale, cyclophosphamide métronomique), hormonothérapies (anastrozole, exémestane, fulvestrant,
      goséréline 3,6, triptoréline 3 mg, cyprotérone), thérapies ciblées (palbociclib, ribociclib, abémaciclib, olaparib,
      imatinib, osimertinib), soins de support (pegfilgrastim, dénosumab 120 / 60, acide zolédronique, énoxaparine,
      dexaméthasone, olanzapine, lévétiracétam, lévothyroxine, anétholtrithione, Biafine, fentanyl patch).
      Présence au Maroc vérifiée pour NEULASTIM, XGEVA, PROLIA, NAVELBINE orale, FASLODEX, ARIMIDEX, ANDROCUR, LEVOTHYROX.
      → **162 médicaments**. Les posologies dépendant de la surface corporelle gardent des « … » à remplir sur l'ordonnance.
- [x] Fichier validé par Dr Bentahila le 07/10 (+ KEYTRUDA et PEMORIAL (pembrolizumab) ajoutés par elle, + IMFINZI
      (durvalumab) ajouté par Claude, DECAPEPTYL en intramusculaire, TEGUMA 1 comprimé le matin 7 jours) : **165 médicaments**.
- [x] Liste de tous les médicaments du cabinet (bouton **Médic.**) : **Recherche** (nom, posologie ou classe, sans accents) ;
      colonnes Médicament (+ classe), Posologie ; **+** ajouter à l'ordonnance, **✎** modifier, **✕** supprimer ;
      « Nouveau médicament ».
- [x] Nouveau / modifier : Nom + Posologie + Classe (facultatif) → Valider / Annuler ; doublon (même nom et posologie) refusé.
- [x] **Double-clic** (ou bouton +) → le médicament passe dans l'ordonnance en préparation (retirer ✕, monter ↑, descendre ↓).
- [x] **Afficher l'ordonnance** / **Annuler** ; ordonnance vierge (lignes vides) si aucun médicament choisi.
- [x] Feuille de l'ordonnance : date du jour à droite ; « Mme / M. NOM Prénom » ; médicaments **numérotés** (1/ nom souligné
      en gras, posologie dessous) ; « Cachet et signature du médecin : Dr NOM Prénom » ; **toute la feuille reste
      modifiable** (gras, souligné, taille du texte A− / A+). Le haut est laissé libre (papier à en-tête), zone « En-tête du
      papier » visible à l'écran seulement.
- [x] **Édition A5 / A4** (le dernier choix est retenu sur l'ordinateur) ; **Valider** · **Valider + Imprimer** ·
      **Fermer**. Signée au nom du médecin connecté, ou de **son médecin** (titulaire) si c'est la secrétaire.
- [x] Enregistrée en ligne **« Médic. — … »** (noms des médicaments) dans la consultation du jour ; s'il n'y en a pas,
      consultation « Ordonnance » créée automatiquement. Clic sur la ligne = revoir, modifier ou réimprimer l'ordonnance
      (lecture seule pour l'infirmière). Le texte enregistré est nettoyé (pas de code).
- [x] Liste de départ = `public/js/donnees/medicaments.js` (165) ; la 1re modification l'enregistre dans
      `bibliotheques/medicaments` (règle : lue par les membres, modifiée avec le droit d'écrire les consultations).
- [x] Tests : médecin (liste, recherche par classe, double-clic, ordre, A4, Valider + Imprimer, 2e ordonnance le même jour,
      réouverture et modification, ajout / modification / doublon / suppression d'un médicament), secrétaire (signature
      « Dr BENTAHILA Rita »), infirmière (lecture seule, sans barre), téléphone 390 px, bilan 352 317 DH, règles compilées.
- [x] Mise en ligne le 07/10 (site + règle `bibliotheques`).
- [x] **Décidé le 07/10** : les ordonnances **ne vont pas dans l'onglet Documents** et ne génèrent aucun fichier (pas de
      Word / PDF gardé) : elles sont seulement enregistrées dans la consultation, et on les retrouve par l'historique des
      prescriptions (1D : voir, réimprimer, renouveler), pour ne pas surcharger. Courriers : pareil (confirmé le 07/10).
- [ ] Plus tard (si plusieurs médecins dans un cabinet) : choisir le médecin signataire dans la fenêtre de l'ordonnance.

**1D – Antécédents des prescriptions** (petite flèche) (fait, testé et mis en ligne le 07/10)
- [x] Fenêtre « Antécédents — Médicaments — patient » : dates à gauche (la plus récente en haut, « modifiée le … » si
      besoin), ordonnance au centre (telle qu'enregistrée, A5 ou A4), à droite **Imprimer · Supprimer · Modifier ·
      Renouveler · Fermer** (« Modifier » ajouté le 07/10 à la demande de Dr Bentahila).
- [x] **Modifier** = la même ordonnance **à sa date de prescription** (corrigé le 07/10 : la date du jour, c'est
      « Renouveler ») ; une fois enregistrée, elle **change aussi dans sa consultation** (liste : « modifiée le … »).
- [x] **Modifier rouvre la liste des médicaments** (retouche du 07/10) avec ceux déjà sur l'ordonnance (posologies relues sur
      la feuille, corrections à la main comprises) : ajouter, retirer, réordonner, puis « Afficher l'ordonnance » (même date,
      même signataire, même format). Une ordonnance écrite à la main (sans médicament de la liste) s'ouvre telle quelle.
- [x] **Renouveler** = nouvelle ordonnance du jour, même contenu, signée par le médecin du jour, mêmes options (A5/A4,
      Valider, Valider + Imprimer, Fermer) ; enregistrée dans la consultation du jour (créée si besoin).
- [x] **Supprimer** (médecin et secrétaire, avec confirmation ; décision du 07/10) : l'ordonnance disparaît aussi de sa consultation ; une
      consultation « Ordonnance » créée automatiquement et devenue vide est supprimée.
- [x] Un clic sur la ligne « Médic. » d'une consultation ouvre cette fenêtre, sur cette ordonnance.
- [x] Droits : secrétaire = tous les boutons ; infirmière = lecture seule (Fermer). Règle : la secrétaire peut supprimer
      une consultation « Ordonnance » créée automatiquement une fois vidée ; les autres consultations, le médecin seul.
- [x] Fenêtre prévue pour toutes les familles (examens, ordonnances types, analyses, courriers : 1E).
- [x] Tests : modifier (date du jour, consultation d'origine mise à jour), renouveler (nouvelle consultation du jour,
      signature), supprimer (consultation vide retirée), impression A4, clic depuis la consultation, 3 rôles, 390 px,
      bilan 352 317 DH.
- [x] Mise en ligne le 07/10 (site + règles de sécurité).

**1E – Les quatre autres familles (même système, modèles créés par Dr Bentahila)**
- [ ] **Règle (07/10) : tout ce qui est fait pour Médic. vaut pour Ordo. type et Analyses** (et les autres familles) :
      liste avec recherche + / ✎ / ✕, double-clic, ordonnance A5/A4 modifiable, consultation du jour, antécédents
      (Imprimer · Supprimer · Modifier = liste rouverte à la date de prescription · Renouveler · Fermer).
- [x] **Examens compl.** (fait, relu par Dr Bentahila et mis en ligne le 07/10) : fichier
      `Examens_Complementaires_Oncologie.xlsx` (42 examens) rangé → **55 examens** (`public/js/donnees/examens.js` ;
      relecture : `listes/Examens_Onco360.xlsx`). Mammographie corrigée, nasofibroscopie / panendoscopie séparées,
      précautions des endoscopies (« à jeun 6 heures »…), ajouts validés (TDM thoracique / abdomino-pelvienne, uro-TDM,
      IRM prostatique / rectale / ORL, radiographies, panoramique dentaire, ostéodensitométrie, rectosigmoïdoscopie,
      audiogramme, cytoponction, ponction pleurale). **Pas de bilans d'imagerie** (décision du Dr).
  - Même fenêtre que les Analyses (code commun, `FAMS` dans ordonnances.js, `lb: null` pour les examens) : une ligne par
    examen, précautions entre parenthèses, « Nouvel examen » (nom, catégorie, précautions), ✎ ✕ ⭐, antécédents ;
    liste `bibliotheques/examens`.
  - Ordonnance d'analyses et d'examens (décision du 07/10) : titre « Prière de bien vouloir faire : », **sans
    renseignements cliniques** ; un bilan s'imprime **sans son titre** (« ASAT, ALAT, GGT… »).
  - Corrigé au passage : dans la liste des analyses en ligne, des éléments de bilans étaient coupés à la virgule dans une
    parenthèse (« DFG (clairance de la créatinine » / « CKD-EPI) ») : recollés dans analyses.js et à la lecture des listes.
- [x] **Ordonnances types** (fait, testé et mis en ligne le 07/10) : fichier de Dr Bentahila
      (`Ordonnances_Par_Type_Complete.xlsx`, 15 types) repris, harmonisé avec la liste des médicaments, corrigé et complété
      → **26 ordonnances types, 94 lignes** (`public/js/donnees/ordostypes.js`, relecture : `listes/Ordonnances_types_Onco360.xlsx`,
      colonne « Ce que j'ai changé », nouveaux types en vert). Corrections : TEGUMA retiré du syndrome pieds-mains
      (antifongique), MOTILIUM / NAUSELIUM (même molécule), FEMARA et TAMOXIFÈNE séparés, « Douleurs & Neuropathies »
      séparé en 4 (paliers 1-2, tramadol LP, morphine + FORLAX, neuropathiques), un seul alpha-bloquant (UROREC 8 mg),
      VESICA → VECA, lignes « A / B » séparées. Ajouts : constipation, chimiothérapie très émétisante, éruption acnéiforme
      anti-EGFR, prémédication pémétrexed, mycose génitale, soins gynécologiques (RT pelvienne), antibiothérapie orale.
  - Bouton **Ordo. type** : liste des ordonnances types (recherche par nom ou médicament) ; **un clic** sur une ordonnance
    type met tous ses médicaments dans l'ordonnance en bas ; chaque médicament : **✎ modifier** (nom, posologie), ↑ ↓,
    **✕ retirer** ; « Ajouter un médicament de la liste » (recherche) et « Ligne libre » ; puis **Afficher l'ordonnance**
    (A5/A4, Valider, Valider + Imprimer). Ligne « Ordo. type — Diarrhée : … » dans la consultation du jour.
  - **Nouvelle ordonnance type / ✎ modifier / ✕ supprimer** (nom + médicaments) ; liste du cabinet dans
    `bibliotheques/ordostypes` (règle existante : droit d'écrire les consultations).
  - Antécédents (petite flèche) : Modifier rouvre la fenêtre des ordonnances types avec les médicaments de l'ordonnance.
  - ✎ sur chaque médicament ajouté aussi dans la fenêtre Médic.
  - Tests : utilisation, modification, retrait, recherche, ligne libre, impression, consultation, création / modification /
    doublon / suppression d'un type, antécédents, secrétaire (signature), 390 px, bilan 352 317 DH.
  - [x] Relu et corrigé par Dr Bentahila dans `listes/Ordonnances_types_Onco360.xlsx` (07/10) : sa version (26 types,
        90 lignes) est la liste de départ et a remplacé une fois la liste du cabinet (migration `ordostypesExcel1`, à la
        1re ouverture d'Onco360 par la titulaire). Modifier l'Excel ne met PAS Onco360 à jour : corriger dans Onco360
        (✎ / ✕ / Nouvelle ordonnance type), ou envoyer l'Excel à Claude pour une nouvelle reprise.
  - [x] **Favoris ⭐** (07/10) sur les médicaments et les ordonnances types : en tête de liste, pour tout le cabinet ;
        l'étoile est gardée quand on modifie. À reprendre pour Analyses et Examens compl. (1E).
  - [x] Mise en ligne le 07/10.
- [x] **Courriers** (fait, testé et mis en ligne le 07/10) : modèles du fichier de Dr Bentahila `COURRIERS.docx`
      (ajoutés directement, sans relecture commune, à sa demande) : **Demande d'ALD, Certificat d'arrêt de travail,
      Certificat médical, Courrier médical, Pli confidentiel, Compte rendu médical** (`public/js/donnees/courriers.js` ;
      liste du cabinet `bibliotheques/courriers` [{ id, nom, html, fav }]).
  - Bouton **Courriers** : liste des modèles (recherche, ⭐, ✎, ✕, « Nouveau modèle ») ; clic = feuille A4 modifiable
    remplie pour le patient : {patient} (Mme NOM Prénom), {age}, {naissance}, {diagnostic}, {mutuelle}, {etablissement}
    (« l'Hôpital… », « du Centre… »), {lieu}, {ville} (Casablanca), {date}, {medecin} ; « (e) » accordé avec le sexe ;
    zones jaunes « À compléter » (un clic les sélectionne ; surlignage non imprimé ; avertissement s'il en reste) ;
    champ vide du dossier → zone à compléter. Valider / Valider + Imprimer → ligne « Courriers — Demande d'ALD » dans la
    consultation du jour ; antécédents (Imprimer, Supprimer, Modifier, Renouveler = date et médecin du jour).
  - Éditeur de modèle : nom, feuille modifiable, G / S / alignements, boutons « Insérer » pour chaque champ et pour une
    zone à compléter.
  - **Fiches patient en PDF** (pas de données du patient, prêtes à imprimer) : régime pendant une radiothérapie pelvienne,
    **français** et **darija** (écrit de droite à gauche), `public/documents/` ; source : `listes/regimes_pdf.py`.
    Darija mis au pluriel de politesse (le texte s'adressait à une femme, or les patients de RT prostatique sont des
    hommes) ; petites corrections (« فcase », « L'عدس »…).
- [x] **Analyses** (fait, testé et mis en ligne le 07/10) : fichier de Dr Bentahila
      (`Prescriptions_Biologiques_Oncologie.xlsx` : 40 bilans, 66 analyses) rangé → **34 bilans dont 7 bilans généraux,
      94 analyses** (`public/js/donnees/analyses.js` ; relecture : `listes/Analyses_Onco360.xlsx`, colonne « Ce que j'ai
      changé », nouveautés en vert). Doublons retirés (IHC, NGS, HRD, PD-L1, biopsie liquide), tests de génétique et de
      biologie moléculaire passés en analyses, bilan de coagulation créé, marqueurs tumoraux par organe et « avant
      5-FU / capécitabine » ajoutés, bilan immunothérapie intercure complété (à valider).
  - Bouton **Analyses** : liste des bilans (« Bilan général » indiqué) puis des analyses, recherche (nom d'abord, puis
    contenu) ; clic sur une analyse = 1 ligne ; sur un bilan = 1 ligne « Bilan … : analyses » ; sur un **bilan général** =
    une ligne par bilan qu'il contient ; pas de doublon. ✎ / ↑ ↓ / ✕, « Ajouter une analyse ou un bilan », ligne libre.
  - Ordonnance : « Prière de faire pratiquer : », lignes « • … », « Renseignements cliniques : » (diagnostic du dossier),
    signature ; A5/A4 ; ligne « Analyses — Bilan … : NFS ; … » dans la consultation du jour ; antécédents (Modifier rouvre
    la fenêtre des analyses).
  - **Nouveau bilan** (analyses et/ou bilans : avec des bilans, il devient général), **Nouvelle analyse** (nom,
    catégorie), ✎, ✕, **favoris ⭐** ; listes du cabinet `bibliotheques/analyses` et `bibliotheques/bilans`.
  - Tests : bilan général, doublon, ajout, retrait, impression, consultation, création d'un bilan, favori, nouvelle
    analyse, antécédents, 390 px, bilan 352 317 DH.
  - [x] Relu et corrigé par Dr Bentahila (07/10) : bilans chimio / immuno / abiratérone / curiethérapie / PAC écrits avec
        leurs analyses (au lieu des bilans inclus), immunothérapie intercure = NFS seule, « IHC » → « Immunohistochimie » ;
        sa version est la liste de départ (aucune liste du cabinet n'existait encore).
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
- [x] Dossier : boutons **« Afficher »** (toute la fiche en lecture) et **« Modifier »** (ex-« Modifier l'identité »). Résumé du
      patient **enregistré tout seul** (1 s après la frappe, en quittant la case) ; on ne quitte pas la page tant qu'il n'est pas
      enregistré (sinon on reste sur le dossier avec un message), et le navigateur prévient à la fermeture. Mis en ligne le 07/10.
- [x] Dossier : allergies, antécédents médicaux et familiaux, mode de vie ne s'affichent plus (seulement dans Modifier
      l'identité). Nouveau champ **« Traitement en cours »** sous Mode de vie (création et modification ; `clinique.traitCours`).
      Mis en ligne le 07/10.
- [x] Rendez-vous à venir : **toutes** les séances de chimio prévues (J1, J8, J15…) de toutes les cures jusqu'à la dernière
      (avant : seulement la cure en cours) ; les dates suivent le protocole. Mis en ligne le 07/10.
- [x] Rendez-vous de chimio validés comme les autres (07/10) : bouton **« Venu »** (droit finances) dans Rendez-vous à venir
      et dans Consultations et hospitalisations (jours de chimio reçus depuis le 07/10 : « À valider ») → fenêtre de prix,
      **J1 = tarif consultation chimio (250 DH), J8 / J15… = 0**, modifiable ; « Annuler le statut ». La date ne se change que
      dans le protocole. Case « Consultation encaissée » retirée de la fenêtre de cure. Données : `consJ` { jour: montant } par
      cure dans les montants ; `cons` (bilan) = total payé, bilan inchangé (352 317 DH). Mis en ligne le 07/10.
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
- [x] Abandonnés le 06/10 (décision de Dr Bentahila) : « Marquer administrée » (**repris le 08/10**, étape 11), commande pharmacie J−1, relevé mensuel.
  La ligne « Marquer « Administrée » » a été retirée de la grille des droits (la règle `administrations` reste, inutilisée).

## Étape 4 – Plusieurs cabinets (phase F) : vendre Onco360
Décisions déjà prises :
- un médecin crée son compte avec un **code d'activation** vendu par Dr Bentahila ;
- un nouveau cabinet reçoit une **copie de la bibliothèque de protocoles** ;
- l'éditrice n'a **aucun accès aux patients** des autres cabinets ;
- chaque médecin relie son Google Agenda (c'est déjà en place).

- **F1 – Plusieurs cabinets**
  - [x] **Liste de ce que reçoit un nouveau cabinet (décidé le 09/10)** : les **protocoles**, les **jours fériés**, la liste
        des **diagnostics**, les bibliothèques **médicaments**, **ordonnances types**, **analyses** et **courriers**, les **tarifs
        de radiothérapie** (actes RT, VMAT), la possibilité de **relier son propre Google Agenda**. **Pas** : les
        correspondants, les tarifs (consultations, séances), les établissements, les patients et leurs dossiers, le profil
        de Dr Bentahila, son bilan.
        Note : ajouter un confrère par Paramètres › Accès le ferait entrer dans **le cabinet de Dr Bentahila** (il verrait
        ses patients) : un autre cabinet se crée à part.
  - **Décidé le 09/10** : cabinets créés depuis un **compte d'administration séparé** (pas le compte de Dr Bentahila) ;
    mutuelles reçues ; autres réglages = valeurs de départ ; documentation patients = fiches de départ seules.
  - [x] **Création d'un cabinet (09/10, fait, testé et mis en ligne)** : page `admin.html` (compte de la collection
        `administrateurs`) → fonction `creerCabinet` : compte du médecin, cabinet `cab-…`, titulaire (tous les droits),
        copie de ce qui est décidé (`functions/cabinets.js`), e-mail pour choisir le mot de passe. Liste des cabinets
        (`listeCabinets` : titulaire, membres, nombre de dossiers ; aucune donnée médicale), « Renvoyer l'e-mail ».
        Code d'activation (inscription par le médecin lui-même) : plus tard, avec les abonnements.
  - [x] Onco360 ouvre le cabinet de la personne connectée : `comptes/{uid}` = { espace }, écrit par le serveur seulement
        (`creerCabinet`, et `compteMembre` à chaque fiche de membre écrite ; profil de départ du membre ajouté). Sans fiche :
        cabinet-bentahila (membres actuels).
  - [x] Règles : chaque cabinet fermé aux autres ; le compte de Dr Bentahila n'a plus de pouvoir d'administratrice que
        dans son cabinet ; le compte d'administration n'ouvre aucun cabinet. 27 tests (`test-cabinets.mjs`), 143/143.
  - [x] Mise en ligne le 09/10 (règles, fonctions compteMembre / creerCabinet / listeCabinets, site v2.js?v=20261009p).
  - [ ] **À faire par Dr Bentahila avant le premier cabinet** : créer le compte d'administration (Firebase › Authentication)
        et sa fiche `administrateurs/{UID}` (2e document de la collection existante).
  - [x] Administration (09/10, en ligne) : « Lien du mot de passe » (message prêt à copier ou à envoyer par WhatsApp, fonction
        `lienMotDePasse`, titulaires des cabinets neufs seulement) ; liste des cabinets réécrite (cabinet de référence inclus,
        comptages séparés, journaux) ; **Suspendre / Réactiver** (`etatCabinet` : `espaces/{e}.actif = false` → règles Firestore et
        Storage : plus personne n'entre, message « accès suspendu », rien d'effacé) ; **Supprimer** (`supprimerCabinet` : cabinet
        suspendu + nom retapé ; base, fichiers, comptes des membres et liaisons Google Agenda effacés). Jamais le cabinet de Dr
        Bentahila. Règles 155/155.
  - [ ] Page « Administration » : codes d'activation, abonnements (avec les licences ci-dessous).
  - [x] **Modules par cabinet (fait le 09/10, en ligne)** : `public/js/donnees/modules.js` (11 modules, 3 formules : Essentiel
        (chimio, sans RT ni RCP ; 1 médecin, 1 secrétaire, 0 infirmière, 1 lieu, 500 dossiers), Radiothérapie (sans chimio, mêmes
        limites), Complet (tout ; 3 / 3 / 3, lieux et dossiers sans limite)) ; `espaces/{e}.abonnement` écrit par
        `abonnementCabinet` (page Administration › « Formule et modules », aussi pour le cabinet de Dr Bentahila) ; formule choisie
        à la création. Sans abonnement : tout, sans limite (cabinet de Dr Bentahila aujourd'hui). Module retiré : `body.sans-<module>`
        cache `[data-mod]` (menu, boutons, onglets), page → tableau de bord, droits chimio / RT / documents coupés à l'écran,
        écoutes en direct non lancées ; Google Agenda refusé par `agendaLier`. Limites : membres (écran + `compteMembre` qui
        désactive un compte en trop, « Hors formule »), lieux et dossiers (écran). Le cabinet de Dr Bentahila s'affiche comme un
        cabinet normal « Actif » (suspension et suppression toujours refusées par le serveur, par sécurité).
        À faire plus tard : limites des dossiers et des lieux aussi imposées par le serveur ; modules imposés par les règles.
  - [ ] ~~Modules par cabinet (demandé le 09/10)~~ : le compte d'administration choisit pour chaque cabinet ce à quoi il a
        droit : secrétaire, infirmière, chimiothérapie (protocoles), radiothérapie, agenda, tâches, bibliothèques, salle
        d'attente, RCP, Google Agenda, listes (sauf correspondants), bilan… Un module non attribué est absent pour tout le
        cabinet. **Décidé le 09/10** : formules toutes prêtes (ex. Essentiel, Complet) puis retouches module par module ;
        **nombre maximum** de comptes par rôle (médecins, secrétaires, infirmières) ; module retiré = **caché, données gardées**
        (il revient tel quel si on le remet).
  - Note (09/10) : la collection `administrateurs` contient déjà le compte de Dr Bentahila (06/10) : on la garde ; le compte
    d'administration séparé y est ajouté comme un 2e document (ID = son UID).
  - [ ] **Gestion des licences (« Super Admin », demandé le 08/10)** : activer / désactiver l'accès d'un cabinet ou d'une
        clinique en un clic, clé de licence, date d'échéance de l'abonnement (accès bloqué ou en lecture seule après).
  - [ ] **Quotas selon la formule** (08/10) : ex. **Standard** = 1 établissement, 500 patients au maximum ; **Premium** =
        établissements et patients illimités. Limites imposées aussi par les règles du serveur. Formules et prix à décider.
  - [x] Retirer ce qui est propre à Dr Bentahila (09/10) : son e-mail (titulaire) et son INPE par défaut (Profil), son nom
        (bilan, exemple WhatsApp), « Hôpital Cheikh Khalifa » (exemple WhatsApp), ses correspondants de départ (COR0 : son
        cabinet seulement), « Casablanca » du pli (ville du lieu d'exercice, nouveau champ « Ville » ; Casablanca si vide).
        Grille tarifaire d'un premier lieu : toutes les activités à 0 (plus de copie de HGC). Restent dans le code sans effet
        pour un autre cabinet : repli « HGC » des tarifs (moteur du bilan, inchangé) ; COR0 à retirer du code en F2.
  - [x] Premier démarrage guidé (09/10) : carte « Bienvenue dans Onco360 : pour commencer » sur le tableau de bord du médecin
        (profil / INPE, lieu d'exercice, tarifs ; équipe et Google Agenda facultatifs) tant que les 3 premiers ne sont pas faits.
  - [x] Tests d'étanchéité (09/10) : règles (27 cas) ; navigateur `tests/test_cabinets.py` (cabinet neuf : aucun patient ni
        correspondant ni établissement de Dr Bentahila, 316 protocoles, listes, grille, 390 px ; page Administration) ;
        `node functions/test-cabinets.js` (17 cas). Bilan de Dr Bentahila inchangé (352 317 DH).
  - [ ] Après mise en ligne : créer un **cabinet d'essai** (adresse e-mail à soi), s'y connecter, vérifier, puis le premier
        vrai cabinet.
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
  - [ ] Un guide PDF illustré, et une aide dans l'application. → détaillé à l'étape 12 (C2, C3 : guides par rôle).

---

## Étape 5 – Tâches de l'équipe (demandé le 07/10/2026)
But : rappels, demandes et suivis entre le médecin, la secrétaire et l'infirmière (relancer un laboratoire, certificat
demandé, rendez-vous déplacé, question d'un patient…), chacun avec un responsable et un historique.
Découpé en **sous-étapes, une fenêtre chacune** : T1 à T5 (T6 facultatif).

**Décisions de Dr Bentahila (07/10)**
- Page **« Tâches »** dans le menu, entre Patients et Protocoles. Bouton **« + Tâche »** dans le dossier, à côté de
  Afficher / Modifier (patient déjà choisi). **Les tâches d'un patient ne s'affichent pas dans son dossier.**
- Une tâche : titre (obligatoire), description, échéance (date, heure facultative), Urgent, patient (facultatif),
  **pour qui (obligatoire)**, de la part de (le compte connecté), statut À faire / En cours / Terminée.
- Types rapides : **Rappel perso, Examens à voir, Courriers à faire, Rendez-vous ajouté/déplacé, Question patient, Question,
  Autre** (un clic préremplit le titre).
- Qui voit quoi : **tous les médecins voient toutes les tâches** ; la secrétaire et l'infirmière voient celles **pour elles**
  et celles **qu'elles ont créées** (pour savoir quand elles sont terminées).
- Modifier, réattribuer : la personne qui l'a créée, la personne responsable, le médecin. Supprimer : **la personne qui l'a
  créée, toujours, même terminée (changé le 08/10)** ; le médecin, la tâche d'un autre si elle n'est pas terminée.
- Historique de chaque tâche (créée, réattribuée, statut, terminée par qui et quand), jamais effacé.
- « Filtrer par agenda » = **par échéance** (en retard, aujourd'hui, cette semaine).
- Bloc « Mes tâches » du tableau de bord : **dans la partie « 7 prochains jours » et « Conflits »** (T4).

**T1 – Les bases** (fait, testé et mis en ligne le 08/10)
- [x] « Tâches » dans le menu (pictogramme liste cochée) ; onglets **Mes tâches** / **Toutes les tâches** (avec leur nombre).
- [x] Fenêtre « Nouvelle tâche » / « Modifier » : types rapides, titre, description, pour qui, échéance + heure, Urgent,
      patient (recherche par nom, ✕ pour le retirer).
- [x] Liste : urgentes et en retard en tête (trait rouge), « Aujourd'hui » en orange, puis par échéance ; statut changé
      directement dans la liste ; tâches terminées rangées à part (« Afficher les tâches terminées », barrées, « Terminée
      par X le … à … »).
- [x] Fiche d'une tâche (clic) : détails, statut, **historique**, Modifier, Supprimer (selon les droits). Clic sur le patient
      = son dossier.
- [x] Bouton « + Tâche » dans le dossier.
- [x] Règles de sécurité `taches` (lecture, création, modification, suppression comme décidé ; historique qui ne fait que
      grandir). Vérifiées par Firebase (compilation), puis sur l'émulateur en T3 (40 cas).
- [x] Tests (faux Firebase, 3 comptes : médecin, secrétaire, infirmière) : création, réattribution, statuts, suppression,
      droits de chacun, téléphone 390 px, bilan 2026 inchangé (352 317 DH), aucune erreur dans la console.
- [x] Mise en ligne (site + règles) par Dr Bentahila le 08/10.

**T2 – Filtres** (fait, testé et mis en ligne le 08/10)
- [x] Barre de filtres au-dessus de la liste (les deux onglets) : **recherche** (titre, description, patient, personnes,
      type), **statut** (À faire et en cours · À faire · En cours · Terminées · Tous), **échéance** (En retard · Aujourd'hui ·
      Cette semaine, retards compris, jusqu'au dimanche · Sans échéance), **type**.
- [x] Onglet « Toutes les tâches » : **responsable** ; médecin : Toute l'équipe, Pour les médecins / secrétaires /
      infirmières, pour chaque membre, Demandées par moi ; secrétaire et infirmière : Pour moi, Demandées par moi.
- [x] Nombre de tâches affichées, « (filtrées) », bouton « Effacer les filtres » ; filtres gardés après un changement de
      statut ou une modification ; trait rouge des urgentes gardé quand elles sont « En cours ».
- [x] Tests (médecin, secrétaire, 390 px, bilan 352 317 DH, aucune erreur).
- [x] Mise en ligne par Dr Bentahila le 08/10.

**T3 – Commentaires et réattribution** (fait et testé le 08/10, pas encore en ligne)
- [x] Fiche d'une tâche : **« Fil de la tâche »** dans l'ordre (le plus récent en bas) : événements en petit (créée, statut,
      réattribuée, modifiée), **commentaires en bulles** (nom, date et heure ; les siens à droite, en bleu clair).
- [x] Case « Écrire un commentaire » + **Envoyer** (ou Cmd + Entrée) : tous ceux qui voient la tâche peuvent commenter,
      même terminée.
- [x] **Réattribuer depuis la fiche** (menu « Pour » + bouton Réattribuer) : l'auteur, le responsable, le médecin. Si la
      personne ne verra plus la tâche (ni auteur ni médecin), elle est prévenue et la tâche quitte sa liste.
- [x] Liste : nombre de commentaires (pictogramme bulle). Fiche relue à l'ouverture (commentaires des collègues).
- [x] Règles : chaque entrée du fil est **signée par la personne connectée** (impossible d'écrire au nom d'un collègue).
- [x] **Tests des règles sur l'émulateur Firebase** (Java 21 installé le 08/10) : `cd tests/regles && npm test`,
      40 cas (lecture, création, statut, commentaires, réattribution, suppression, usurpations) : 40 réussis.
- [x] Tests dans le navigateur (médecin, secrétaire, infirmière, 390 px, bilan 352 317 DH, aucune erreur).
- [x] Mise en ligne : avec T4 (règles puis site).

**T4 – Temps réel et notifications** (fait, testé et mis en ligne le 08/10)
- [x] **Écoute en direct** ouverte dès l'ouverture d'Onco360 : listes, nombres des onglets et fiche ouverte se mettent à jour
      sans recharger (la fiche n'est pas redessinée pendant qu'on écrit un commentaire).
- [x] **Messages à l'écran** (en haut à droite ; en bas sur téléphone ; 12 s ; clic = ouvre la tâche) quand un collègue
      agit sur une tâche dont on est l'auteur ou le responsable : « Nouvelle tâche de… », « … vous a confié… », « … a
      commenté… », « … a terminé… », autres modifications. Rien pour ses propres actions, rien si la fiche est déjà ouverte.
- [x] **Non lues** : badge « Nouveau » (liste, tableau de bord), lues à l'ouverture de la fiche ; gardées dans le profil
      (`utilisateurs/{uid}.tachesVu`), donc les mêmes sur tous les appareils.
- [x] **Pastille** orange à côté de « Tâches » dans le menu (et sur le bouton du menu au téléphone) = non lues + mes tâches en
      retard ; titre de l'onglet du navigateur « (2) Onco360 » = non lues.
- [x] **Tableau de bord** : carte « Mes tâches » entre « Les 7 prochains jours » et « Conflits » : mes tâches en retard,
      urgentes, nouvelles ou à faire dans les 7 jours (6 au plus) + « Du nouveau sur vos demandes » + « Voir mes tâches ».
- [x] **Suppression par l'auteur même terminée** (demande du 08/10), avec avertissement ; règles et tests mis à jour.
- [x] Tests : règles sur l'émulateur 44/44 ; navigateur avec deux onglets en même temps (médecin + secrétaire) : messages,
      fiche mise à jour en direct, nouvelle tâche, pastilles, lu / non lu ; téléphone 390 px ; bilan 352 317 DH ; aucune
      erreur.
- [x] Mise en ligne le 08/10. À la première ouverture, les tâches déjà créées par un collègue apparaissent
      « Nouveau » (jamais ouvertes) : un clic suffit.

**T5 – Finition** (fait, testé et mis en ligne le 08/10)
- [x] **Nom du patient à jour** : la tâche affiche le nom actuel du dossier (s'il a été corrigé depuis), dans la liste, la
      fiche, le tableau de bord et la recherche.
- [x] **Membre limité à un établissement** : patient hors de son périmètre (ou dossier supprimé) = nom sans lien, et dans
      la fiche « dossier non accessible » ; patient de son établissement = lien vers le dossier (testé : secrétaire HGC).
- [x] **Responsable qui n'a plus accès** (désactivé ou retiré de l'équipe) : badge « À réattribuer », message dans la fiche,
      son nom gardé dans le menu « Pour » ; s'il a été retiré, statut et commentaire bloqués avec un message clair (les
      règles refuseraient) jusqu'à la réattribution.
- [x] **Guide d'utilisation** : `guide/taches.md` (créer, retrouver, suivre, être prévenu, qui peut faire quoi, cas
      particuliers), base du guide complet (F3).
- [x] Tests : médecin, secrétaire limitée à l'HGC, responsable désactivée / retirée, bilan 352 317 DH, aucune erreur.
- [x] Mise en ligne le 08/10 (règles, fonctions, site, par Claude avec l'accord de Dr Bentahila).

**T6 – Échéances dans Google Agenda** (décidé, fait et testé le 08/10, pas encore en ligne ; les notifications sur le
téléphone quand Onco360 est fermé restent pour plus tard)
Décisions de Dr Bentahila (08/10) : seulement dans l'agenda « Onco360 » du **responsable** (pas de l'auteur ; le médecin ne
reçoit pas les tâches qu'il a demandées) ; **sans heure = journée entière** ; **aucun rappel Google** ; **en retard =
reportée chaque jour sur aujourd'hui** avec « EN RETARD ».
- [x] Tâches avec échéance, non terminées : journée entière (sans heure) ou 15 min à l'heure prévue ; titre « Tâche – titre
      (patient) », « URGENT – … », « EN RETARD – … » ; couleur graphite, rouge si urgente ou en retard ; ne bloque pas le
      créneau ; aucun rappel ; description : texte, « Demandée par… », lien vers les tâches.
- [x] Terminée → retirée ; réattribuée → retirée de l'ancien responsable, ajoutée au nouveau ; titre, échéance, patient
      modifiés → mis à jour ; commentaires seuls → rien. En retard : déplacée chaque nuit (3 h 30) sur le jour même.
- [x] Serveur : `agendaTache` (nouvelle fonction, à chaque écriture d'une tâche) ; tâches ajoutées à la remise à plat
      (liaison, « Mettre à jour », nuit) ; nom actuel du patient lu dans son dossier. Profil › Google Agenda : texte complété.
- [x] Tests de la logique sur un faux Google Agenda : `node functions/test-logique.js` (32/32, dont 15 pour les tâches).
- [x] Mise en ligne des fonctions par Dr Bentahila le 08/10 (`agendaTache` créée).
- [ ] Vérifier dans le Google Agenda d'un responsable relié (créer une tâche avec échéance, la terminer).

**Couleurs dans Google Agenda** (demandé et décidé le 08/10 : couleurs **modifiables**, par défaut comme le tableau ;
fait, testé et mis en ligne le 08/10)
- [x] Configuration › **Google Agenda** : nuancier des 11 couleurs Google (+ « couleur de l'agenda ») pour : consultation
      d'annonce (Flamant), suivi / contrôle (Paon), en cours de radiothérapie (Lavande), hospitalisation (Myrtille), autres
      consultations (Paon), chimiothérapie (Basilic), radiothérapie (Raisin), dosimétrie à valider (Mandarine), absences et
      congés (Banane), tâches (Graphite), tâches urgentes ou en retard (Tomate). Droit « paramètres ».
- [x] Enregistré dans `parametres/couleursAgenda` (seulement ce qui diffère) ; nouvelle fonction `agendaCouleurs` : tous les
      agendas reliés sont repeints ; couleur appliquée aussi à chaque mise à jour et chaque nuit.
- [x] Tests logique 40/40 (catégorie de chaque événement, couleurs par défaut et du cabinet, repeint, retour à la couleur de
      l'agenda) ; navigateur (390 px, bilan 352 317 DH, aucune erreur).

---

**Suite des tâches et page « Paramètres »** (demandé le 08/10 ; sous-étapes P1 à P4, une fenêtre chacune)
Décisions de Dr Bentahila (08/10) :
- Types de tâches **modifiables par le médecin** (liste de base = celle de T1) ; type fixe **« Radiothérapie »** pour les
  tâches automatiques, non supprimable.
- **Configuration et Paramètres fusionnés** en une seule page « Paramètres », avec l'onglet « Activités et
  rémunérations » dedans. Lieux d'exercice et accès de l'équipe **restent dans le Profil**.
- Réglages ajoutés à Paramètres : **mise en page d'impression** (en-têtes et marges A5 / A4 / documents), **listes**
  (diagnostics, mutuelles, correspondants), **délais des alertes**, **bibliothèques des prescriptions**, **délai du bouton
  WhatsApp vert**, **tâches automatiques** (activer / désactiver chacune, responsable). Pas encore tranché : types de
  consultation et types d'absence modifiables.
- Google Agenda : **chacun choisit pour son agenda** ce qui y apparaît (cases à cocher par type de rendez-vous et par type
  de tâche), au-dessus des couleurs.
- Tâches automatiques **pour le médecin titulaire**, type « Radiothérapie » : **dosimétrie à valider** (créée le jour du
  scanner, échéance = 1re séance si renseignée) ; **fin de radiothérapie à valider** (créée le lendemain de la fin prévue,
  échéance ce jour-là) ; terminées toutes seules quand c'est validé dans le dossier.
- **Les tâches d'un patient s'affichent dans « Rendez-vous à venir » de son dossier** (même liste ; titre à renommer, par
  exemple « Rendez-vous et tâches à venir » ; bouton « + Tâche » à côté de « Ajouter un rendez-vous ») : remplace la
  décision du 07/10 (« tâches absentes du dossier »). La dosimétrie n'est pas retirée de partout (à préciser en P4).

**P1 – Description visible et types de tâches modifiables** (fait et testé le 08/10, pas encore en ligne)
- [x] Liste des tâches : la **description** s'affiche directement (2 lignes au plus) sous le type, le patient et l'échéance ;
      1 ligne dans la carte « Mes tâches » du tableau de bord.
- [x] Configuration › **Tâches** : types renommés, ajoutés (+ Ajouter un type), retirés, réordonnés (↑ ↓), « Rétablir les
      valeurs par défaut » ; « Radiothérapie » affiché fixe, à la fin ; doublons refusés. Lecture seule sans le droit
      « paramètres ». Données : `parametres/typesTaches` = { data: JSON [noms] }. Une tâche garde son type si on le renomme.
- [x] Tests : médecin (renommer, ajouter, retirer, doublon refusé, boutons de la fenêtre Nouvelle tâche), secrétaire (lecture
      seule), 390 px, bilan 352 317 DH, aucune erreur.
- [x] Mise en ligne (site).
**P2 – Page « Paramètres » unique** (fait et testé le 08/10, pas encore en ligne)
- [x] **Une seule entrée « Paramètres »** dans le menu (visible par toute l'équipe ; « Configuration » retirée, l'ancienne
      adresse `#configuration` renvoie vers `#parametres`). Onglets : Créneaux & horaires · Fermetures, congés & jours fériés ·
      WhatsApp · Google Agenda · Documents · Tâches · **Impression** · **Alertes** · **Activités et rémunérations** (droit
      « finances » : ancienne page Paramètres, son propre bouton Enregistrer). L'onglet choisi reste après un rechargement
      (`#parametres/impression`…). Modification : droit « paramètres » (lecture seule sinon), comme avant.
- [x] **Impression** : marges en mm (haut = place de l'en-tête du papier, côtés, bas) pour les ordonnances A5, les
      ordonnances A4 et les documents A4 (pli, CR, rendez-vous RT) ; utilisées à l'impression et dans l'aperçu à l'écran
      (zone « En-tête du papier »). Par défaut : 45/28/18, 60/35/22, 45/35/22 mm (les réglages d'avant).
- [x] **Alertes** : cure annoncée N jours avant (3 par défaut), traitement terminé signalé N jours (30 par défaut).
- [x] **WhatsApp** : délai du bouton vert réglable (par défaut 1 à 2 jours avant = 24 à 48 h) ; textes mis à jour.
- [x] Données : `parametres/reglages` = { data: JSON { impression, whatsapp, alertes } } (seulement ce qui a changé), lu au
      démarrage ; module `js/app/reglages.js`.
- [x] Tests : médecin (9 onglets, enregistrement, marges à l'impression et à l'écran, textes WhatsApp), secrétaire (8 onglets,
      sans Activités, lecture seule), 390 px, bilan 352 317 DH, aucune erreur.
- [x] Mise en ligne (site).
- Note pour la salle d'attente (SA2) : un nouvel onglet de Paramètres s'ajoute dans `ONGLETS()` de `configuration.js`
  (plus de barre d'onglets écrite en dur).
**P2 bis – Listes et bibliothèques dans Paramètres** (fait et testé le 08/10, pas encore en ligne)
- [x] Paramètres › **Listes** : diagnostics (40), mutuelles, correspondants : corriger un nom, retirer, ajouter, rechercher ;
      nombre de dossiers qui utilisent chaque nom ; doublons refusés ; « Rétablir les valeurs par défaut » = listes de départ.
      Corriger ou retirer un nom ne modifie pas les dossiers. Données : `parametres/listes` = { diag, mut, cor, complet: true }
      (listes entières ; l'ancien format « ajouts aux listes de départ » reste lu tant que rien n'est modifié).
- [x] Paramètres › **Bibliothèques** : Médicaments, Ordonnances types, Analyses et bilans, Examens complémentaires, Modèles de
      courriers (avec leur nombre). Chaque carte ouvre la fenêtre habituelle en **gestion de la liste** (titre « liste du
      cabinet », sans patient ni ordonnance) : recherche, + Nouveau, ✎, ✕, favori ; un clic sur une ligne ouvre sa fiche. Médecin
      seulement ; lecture seule pour les autres.
- [x] Tests : listes (correction, ajout, doublon, fiche patient qui propose la nouvelle liste), 5 bibliothèques (ouverture,
      modification, retour à la liste), **prescriptions depuis le dossier inchangées** (même après la gestion dans Paramètres),
      secrétaire en lecture seule, 390 px, bilan 352 317 DH, aucune erreur.
- [x] Mise en ligne (site).
**P2 ter – Listes reliées aux dossiers** (demandé le 08/10 ; fait et testé le 08/10, pas encore en ligne)
- [x] **Nom corrigé dans Paramètres › Listes → corrigé dans tous les dossiers** qui l'utilisent (mutuelle, correspondant,
      diagnostic), après confirmation (« 17 dossiers seront corrigés aussi ») ; une ligne « Liste corrigée (Paramètres) » dans
      l'historique de chaque dossier. Un nom retiré ne change pas les dossiers.
- [x] **Nom nouveau tapé dans une fiche patient → ajouté à la liste**, à la création comme à la modification, mutuelle,
      correspondant **et diagnostic** (avant : mutuelle et correspondant, et seulement avec le droit « paramètres ») ; pour tout
      membre qui crée ou modifie une fiche. Règle `parametres/listes` ouverte aux droits identité / fiche patient / créer un
      patient ; autres paramètres : droit « paramètres » seulement. Tests des règles : `tests/regles/test-parametres.mjs` (8 cas).
- Bibliothèques des prescriptions : **déjà une seule liste** (dossier et Paramètres modifient la même) ; la « Ligne libre »
  d'une ordonnance et le ✎ d'une ligne de l'ordonnance en préparation ne touchent pas la liste (voulu). **Question à Dr
  Bentahila** : ajouter une case « Ajouter à la liste du cabinet » sur la ligne libre ?
**P3 – Google Agenda : ce que chacun y voit** (fait et testé le 08/10, pas encore en ligne)
- [x] Paramètres › Google Agenda, en haut : **« Votre Google Agenda : ce qui y apparaît »**, réglage **personnel** (chacun pour
      son agenda, enregistré tout de suite, même sans le droit « paramètres ») : cases par type de consultation (annonce, suivi,
      contrôle, en cours de RT, hospitalisation **+ chaque activité des Paramètres**, ex. 2nd avis), cures J1 / séances J8-J15,
      scanner / 1re séance / fin / dosimétrie, **chaque type de tâche** (liste de Paramètres › Tâches, « Radiothérapie », sans
      type), absences (médecin). Un nouveau type apparaît tout seul, coché.
- [x] Données : `utilisateurs/{uid}.agendaFiltre` = { exclus: [clés] } ; serveur : `cleFiltre` / `filtrer` (logique.js) dans
      la remise à plat et chaque mise à jour ; nouvelle fonction `agendaFiltre` (case changée → agenda de la personne refait).
- [x] Tests : logique (clé de chaque événement, filtres) ; navigateur (cases, nouveau type de tâche, 390 px, bilan 352 317 DH).
- [x] Mise en ligne : règles, **fonctions**, site. (08/10 : fonctions et site mis en ligne par Dr Bentahila ; avertissement
      « extensions » sans conséquence ; **la mise à jour Google Agenda échouait** → corrigé ci-dessous, à remettre en ligne.)
**P3 bis – Tout Google Agenda dans Paramètres ; Profil réduit** (demandé et fait le 08/10, pas encore en ligne)
- [x] **Panne de synchronisation corrigée** : Google refusait un événement (« Invalid start time ») et toute la mise à jour
      échouait. Heures remises au format HH:MM (« 9:30 », « 13h00 », « 08:30:00 »), dates mal écrites écartées, et un
      événement refusé est mis de côté (journal du serveur) sans bloquer les autres. Tests logique : 60/60.
- [x] Paramètres › **Google Agenda** : 1re case **« Mon Google Agenda »** (liaison, mise à jour, délier ; venu du Profil), puis
      « ce qui y apparaît », puis les couleurs. Message adapté pour qui n'a pas le droit « paramètres ».
- [x] Paramètres › **Lieux d'exercice** et **Accès** (médecin titulaire) : venus du Profil, mêmes fenêtres, la page reste sur
      Paramètres après un enregistrement. 13 onglets.
- [x] **Profil = Mes informations seulement**, sans onglets. Anciens liens (agenda, fiche chimio, guide) mis à jour.
- [x] Tests : médecin (13 onglets, lieu modifié, accès), secrétaire (sans Accès, relie son agenda), 390 px, bilan 352 317 DH.
- [x] Mise en ligne : **fonctions** (correction de la panne) et site.
**P4 – Tâches automatiques et tâches dans le dossier** (décidé et fait le 08/10, pas encore en ligne)
Décisions (08/10) : événements des tâches automatiques du médecin = **dernière cure d'un protocole, rendez-vous « Non venu »,
nouveau patient, N mois après la fin d'une radiothérapie, veille d'une cure J1** ; la dosimétrie reste ailleurs (programme du
jour, agenda, Google Agenda) mais **dans le dossier sous forme de tâche**.
- [x] **Serveur** : `tachesAutoPatient` (chaque écriture d'un dossier) et `tachesAutoNuit` (3 h) créent les tâches dues
      (auteur « Onco360 (automatique) », identifiant fixe par règle / patient / occurrence, **une seule fois** : registre
      `tachesAuto/{id}`, invisible du navigateur) et terminent toutes seules « Valider la dosimétrie » (dosimétrie validée) et
      « Valider la fin de radiothérapie » (RT clôturée). Logique pure `tachesAutoPatient` (logique.js), 13 tests.
- [x] **Règles fixes** (type « Radiothérapie », pour le médecin titulaire par défaut) : dosimétrie à valider (créée le jour du
      scanner, échéance = 1re séance) ; fin de radiothérapie à valider (créée le lendemain de la fin prévue, jours ouvrés et
      fériés comme l'écran).
- [x] Paramètres › Tâches › **Tâches automatiques** : chaque règle activable / désactivable, titre, type, responsable (médecin
      titulaire ou un membre), délai (jours ; mois après la fin de RT) ; « + Ajouter une tâche automatique » (5 événements) ;
      date « depuis » posée à l'activation (pas de rattrapage du passé). `parametres/tachesAuto` (droit « paramètres »).
- [x] Fiche d'une tâche automatique de RT : bouton **« Valider la dosimétrie » / « Valider la fin de radiothérapie »** (ouvre
      le dossier et la fenêtre habituelle).
- [x] Dossier : carte **« Rendez-vous et tâches à venir »** : tâches ouvertes du patient dans la même liste (date d'échéance,
      rouge si en retard, « Ouvrir »), ligne « Dosimétrie à valider » remplacée par la tâche, bouton **« + Tâche »** à côté de
      « Ajouter un rendez-vous » ; liste rafraîchie après une tâche créée ou modifiée depuis le dossier. (Remplace la décision
      du 07/10 « tâches absentes du dossier ».)
- [x] Tests : logique 73/73, règles 85/85, navigateur (tâche automatique simulée : dossier, message, bouton Valider ; réglages ;
      secrétaire en lecture seule ; 390 px ; bilan 352 317 DH ; aucune erreur).
- [x] **Dosimétrie à valider = une tâche seulement** (demandé le 08/10 : « c'est une tâche pour le médecin, pas un rendez-vous ») :
      retirée de l'agenda Onco360, des 7 prochains jours, du programme du jour, de Google Agenda (case et couleur retirées ;
      le serveur l'ignore aussi dans les résumés anciens). Reste : la tâche, l'étape « Valider » de la carte radiothérapie, et
      l'alerte de la cloche (voir question ci-dessous).
- [x] Discordances corrigées : la tâche « Valider la dosimétrie » n'est créée qu'entre le scanner et la 1re séance (comme
      l'écran ; sinon des tâches pour d'anciennes RT jamais validées dans Onco360) ; responsable des 2 tâches fixes = un
      médecin (lui seul valide). Sur les données du 06/10, la mise en ligne ne créerait qu'une tâche (une fin de RT dépassée).
- [x] **Déroulé de la radiothérapie avec contourage** (demandé le 09/10) : Scanner → **Contourage** → Dosimétrie → 1re séance.
      Carte radiothérapie du dossier : « Contourage à valider — du (scanner) au (1re séance) » + bouton **Valider le
      contourage** (date, case de vérification) ; « Contourage validé — date » + annuler (pas si la dosimétrie est validée) ;
      « Dosimétrie (après le contourage) », puis « Dosimétrie à valider — du (contourage) au (1re séance) » ; la dosimétrie ne
      se valide qu'après le contourage. Données : `rtsJson` r.cont / contPar / contLe (moteur rt.js `contourage`).
- [x] Tâches automatiques : nouvelle tâche fixe **« Valider le contourage »** (type Radiothérapie, du scanner à la 1re séance,
      médecin) ; **« Valider la dosimétrie »** créée seulement à la validation du contourage, jusqu'à la 1re séance ; ajoutées
      à Paramètres › Tâches › Tâches automatiques. **Valider la tâche = valider dans le dossier** : bouton « Valider… » de la
      fiche, ou statut « Terminée » → même fenêtre de validation (sans quitter la page), et le serveur termine la tâche ; valider
      dans le dossier termine la tâche. Tests logique 79/79 ; mise en ligne : une seule tâche créée (données du 06/10).
- [x] Google Agenda (09/10) : « Valider le contourage » et « Valider la dosimétrie » en **bandeau sur toute la période** (du
      scanner, resp. de la validation du contourage, jusqu'à la 1re séance) au lieu du seul jour de la 1re séance ; champ
      `debut` des tâches (complété par le serveur pour les tâches déjà créées) ; liste des tâches : « Du 08/10 au 19/10/2026 ».
      Tests logique 85/85. À remettre en ligne : fonctions et site.
- [x] Correction (09/10) : « Valider la dosimétrie » apparaissait en même temps que « Valider le contourage » : créée par la
      version précédente des fonctions (dosimétrie dès le scanner). Le serveur retire maintenant une tâche de dosimétrie
      ouverte tant que le contourage n'est pas validé (si personne n'y a touché) et efface son registre : elle est recréée à
      la validation du contourage. Une tâche existante n'est jamais écrasée. Tests logique 81/81. À remettre en ligne
      (fonctions).
- [x] Page Tâches : filtre **Lieu d'exercice** (09/10, à côté de « Tous les types ») : Tous les lieux, chaque établissement du
      membre (et ceux de ses tâches), « Sans patient » ; lieu = celui du dossier du patient aujourd'hui (s'il a changé
      d'établissement), sinon celui noté dans la tâche. Testé (médecin, secrétaire HGC, 390 px).
- [x] **Décidé le 09/10 : on ne retire rien de la cloche.** Question : retirer de la cloche les alertes qui doublent une tâche automatique active (dosimétrie à
      valider, fin de radiothérapie dépassée, dernière cure si la règle est activée) ?
- [x] Mise en ligne : règles, **fonctions** (2 nouvelles), site. Puis vérifier sur un vrai dossier (dosimétrie en attente).

---

# Demandes du 08/10/2026 (étapes 6 à 13)
Liste complète donnée par Dr Bentahila le 08/10, à faire **au fur et à mesure, une sous-étape par fenêtre**. Chaque étape
commence par ses questions « À décider » (Claude les pose avant d'écrire le code).

## Ordre proposé (à valider par Dr Bentahila ; elle peut le changer à tout moment)
1. Terminer l'en cours : Tâches T1 à T5 faites le 08/10 (T6 facultatif, plus tard).
2. **Étape 6 – Salle d'attente** (usage quotidien, le plus utile tout de suite).
3. **Étape 7 – RCP** (fait le 09/10, pas encore en ligne).
4. **Étape 8 – Numéro de dossier et recherche des patients**.
5. **Étape 9 – Sécurité et conformité** (journal d'audit, rôles, mode démo) : indispensable avant de vendre.
6. **Étape 10 – Mode hors-ligne**.
7. **Étape 11 – Soins infirmiers, pharmacie, alertes**.
8. **Étape 4 – Plusieurs cabinets** (complétée ci-dessus : licences, quotas).
9. **Étape 12 – Dossier de cession, démo et guides**.
10. **Étape 13 – Interopérabilité** (la plus lourde, en dernier).
- **Étape 15 – Bilan : virements et chèques reçus des cliniques** (fait et testé le 09/10, pas encore en ligne).

**Décidé le 08/10 : vendre des deux façons.** (a) **abonnements** (phase F, étape 4 : chaque cabinet paie, code
d'activation) ; (b) **cession** du logiciel à un éditeur ou une ESN (prix visé 120 000 à 180 000 DH, étape 12). Les
clients abonnés augmentent la valeur de la cession.

## Étape 6 – Salle d'attente (cabinet / clinique)
But : suivre en temps réel le passage des patients le jour J, de l'arrivée à la fin de la consultation.
Nouvelle page **« Salle d'attente »** dans le menu, **entre Agenda et Patients**.

**Décisions de Dr Bentahila (08/10)**
- Statuts : Prévu → **En salle d'attente** → **En consultation** → **Vu** (= « Venu », fenêtre de prix, bilan inchangé) ;
  **Absent** = « Non venu ». « En salle » et « En consultation » sont notés à côté du statut (le statut reste « Prévu »
  jusqu'à « Vu » : bilan, agenda et Google Agenda inchangés).
- **Mettre en salle** : médecin, secrétaire, infirmière. **Démarrer la consultation** : médecin et secrétaire (pas
  l'infirmière). **Terminer / Valider** : médecin et secrétaire, **la fenêtre de prix s'ouvre pour les deux**. La secrétaire
  n'annule pas un statut posé par le médecin (règle actuelle).
- **Tous les types de consultation** sont dans la salle d'attente (annonce, suivi, contrôle, en cours de radiothérapie,
  séance de chimiothérapie, activités des Paramètres) : le médecin voit le patient en consultation pour valider sa séance.
- Colonnes : heure du RDV, nom et prénom, **type**, **motif de consultation** (texte), heure d'arrivée, temps d'attente
  (orange à **20 min**, rouge à **45 min**, modifiables dans Configuration), **prix** (prix validé quand le patient est vu,
  sinon prix de base prévu) avec **total en bas**. Pas de badge « nouveau patient » (il se lit dans le motif).
- Ordre de « En salle d'attente » **au choix dans Configuration** : par heure de rendez-vous (urgences en tête, sans
  rendez-vous à leur heure d'arrivée) ou par ordre d'arrivée.
- **Clic sur le nom** = ouvre le dossier **sans changer le statut** (médecin et secrétaire).
- Patient **en consultation** : dans son dossier, **deux bulles flottantes en bas à gauche** (suivent la page) :
  **Valider** (→ Vu, fenêtre de prix) et **Retour en salle** (revient en salle d'attente sans valider).
- **« + Arrivée sans rendez-vous »** : choisir un patient connu + motif, ou créer un nouveau patient (fenêtre du dossier)
  + motif ; crée un rendez-vous du jour à l'heure actuelle, déjà « En salle d'attente » (case Urgence).
- **Prix** : la secrétaire voit le **prix de base** de chaque consultation (brut, sans rétrocession ni impôt) et les
  **prix validés** (c'est elle qui fait payer le patient) ; elle **ne voit aucun acte de radiothérapie ni honoraire**
  (la consultation « en cours de radiothérapie » est à 0 DH : l'acte RT est payé à part ; les honoraires de séance de
  chimiothérapie sont validés avec la cure, pas avec le rendez-vous, et ne lui sont pas montrés). L'infirmière n'a pas la colonne
  prix. La secrétaire enregistre le prix par une **fonction serveur** limitée aux consultations du jour de son centre
  (elle n'a toujours pas le droit « finances »).
- **Total en bas** (journée, établissement choisi) : « Encaissé (vus) : X DH » et « Prévu (restant) : Y DH », sans les absents.
- **Séance de chimiothérapie** : « Valider » valide **seulement la consultation** (prix de la consultation de chimio, J1
  seulement, J8… = 0). La **cure** est validée par le médecin dans le dossier, avant de valider la consultation. La
  secrétaire peut « Valider la consultation de séance de chimiothérapie », jamais la cure.
- Paramètres : les deux lignes existent déjà (« Séance de chimiothérapie », « Consultation de chimiothérapie ») ; valeurs
  voulues : séance **500 DH brut, rétrocession 0 %, impôt 10 %** ; consultation de chimio **250 DH brut, 0 %, 0 %, J1
  seulement**. À vérifier dans Paramètres (Dr Bentahila) ; si un chiffre change, mettre la date d'effet du jour pour ne pas
  modifier le bilan passé.
- **Absent** : médecin et secrétaire (pas l'infirmière).

**Décisions de Dr Bentahila (08/10, après SA1)**
- **Bandeau des jours** en haut : la semaine sur une ligne, flèches jour précédent / suivant, calendrier, « Aujourd'hui ».
- **Absent** ouvre une fenêtre : **reporter** le rendez-vous (nouvelle date et heure) ou **ne pas reporter**.
- **Secrétaire : fenêtre de prix comme le médecin** (prix prédéfini, 0 si le patient ne paie pas) ; elle peut **changer un prix
  déjà validé par le médecin**.
- Séance de chimio manquée : **proposition de Claude à valider** (voir SA1 bis).

**SA1 – Page, statuts, temps réel, bulles du dossier**
- [x] Page « Salle d'attente » (menu, entre Agenda et Patients), **filtre par établissement** (la secrétaire ne voit que
      son centre), date du jour ; **4 onglets** avec leur nombre : À venir · En salle d'attente · Vus · Absents.
- [x] Pastilles de couleur au trait : Prévu, En retard, En salle (orange 20 min, rouge 45 min), En consultation, Vu, Absent.
- [x] **Poinçonnage** : heure d'arrivée et auteur (« Arrivé à 14 h 22 »), heure de début et de fin de consultation.
- [x] Colonnes (sauf prix, en SA2) ; motif saisi dans la fenêtre du rendez-vous et modifiable depuis la salle d'attente.
- [x] Actions : Mettre en salle, Démarrer la consultation (ouvre le dossier), Valider, Absent, Annuler ; clic sur le nom.
      Consultation de chimio validée par le médecin seulement (droit « finances ») jusqu'à la fonction serveur de SA2.
- [x] Bulles flottantes Valider / Retour en salle dans le dossier (Valider ramène à la salle d'attente).
- [x] Séances de chimio du jour (cures J1, J8…) dans la liste.
- [x] Mise à jour **en temps réel** sur tous les écrans du cabinet (collection `salle`, nouvelles règles : 22 tests).
- [x] Tests : 3 rôles, 2 établissements, 390 px, bilan 352 317 DH. Guide `guide/salle-attente.md`.

**SA1 bis – Jours, absences, prix (08/10)**
- [x] Bandeau de la semaine (nombre de patients par jour), flèches, calendrier, « Aujourd'hui ». Jours passés : onglet
      « À valider », validation et absence seulement ; jours à venir : consultation et motif seulement.
- [x] Absent (salle d'attente et « Non venu » du dossier) : fenêtre « Reporter le rendez-vous » (prochain jour ouvert proposé,
      horaires de l'établissement, jours fériés et absences vérifiés) ou « Ne pas reporter ». Le rendez-vous manqué reste
      « Non venu » ; le report est un nouveau rendez-vous « Reporté (initialement le …) ».
- [x] Colonne **prix** (prévu au tarif / validé) et **total** (« Encaissé (vus) », « Prévu (restant) », sans les absents) ;
      crayon pour changer le prix d'une consultation vue.
- [x] Secrétaire : fenêtre de prix (consultations et consultation de chimio), « Modifier le prix » dans le dossier, par la
      fonction serveur **prixConsultation** (elle n'a toujours pas le droit « finances ») ; tarifs des consultations lisibles
      par l'équipe (`parametres/tarifsConsultations`, sans rétrocession, impôt, séance ni radiothérapie, publiés par le médecin).
      Le médecin relit les montants avant chaque écriture (un prix changé par la secrétaire n'est pas écrasé).
- [x] **Séance de chimio manquée** (décision du 08/10 : la secrétaire peut aussi, selon les consignes du médecin) : « Absent »
      ouvre la fenêtre « Reporter » du dossier (raison « Patient absent », « cette date seulement » ou « recalculer toute la
      suite ») ou « Absent, sans reporter ». La date change dans le protocole (salle d'attente, agenda, Google Agenda suivent) ;
      la séance reste dans « Absents » du jour avec « Reportée au … ». Secrétaire : droit « planning » (activé une fois par
      la migration `secretairePlanning`) ; elle n'écrit que `planningJson`, l'historique du report y est gardé (`rep`, `srep`).

**SA1 ter – Colonnes, commentaire, prix bruts, payé automatique (demandes du 08/10 après la mise en ligne)**
- [x] À venir : les séances de chimio en tête (même sans heure) ; plus de statut « En retard » (heure du rendez-vous et
      d'arrivée seulement).
- [x] Colonnes **Civilité** (M. / Mme), **Correspondant**, **Mutuelle** (nom court, complet au survol), **Commentaire** du jour
      (médecin, secrétaire, infirmière ; règle : commentaire seul permis à tout membre du périmètre, 3 tests) ; bouton
      **Colonnes** : chacun choisit ses colonnes (`utilisateurs/{uid}.salleCachees`, gardé sur tous ses appareils).
- [x] Prix affichés en **brut** : les prix repris de l'ancienne application (ex. HCK 225 DH net) s'affichent 250 DH
      (`encaissements` : `b`, reconstruits une fois par la migration `encaissementsBrutV1`) ; bilan inchangé. La secrétaire ne
      modifie pas ces anciens prix (serveur).
- [x] « Non venu » sans report : sort des rendez-vous à venir, apparaît dans « Consultations et hospitalisations » en
      « Non venu · 0 DH » ; consultation en cours de RT validée : « Venu · 0 DH ».
- [x] Paramètres : case **« Payé auto. »** par activité et par établissement (entre Net et En vigueur depuis, décochée par
      défaut) : cochée, les actes validés à partir de ce jour comptent « Payé (auto.) » dans le bilan ; décochée, le médecin
      coche « Payé » lui-même. Les actes plus anciens ne changent pas.

- [x] Onglets sur toute la largeur (ordinateur et téléphone, largeurs égales) ; titres des colonnes dans un bandeau.

**SA1 quater – Repris de GestiCab (choix du 08/10)**
- [x] Filtre **Matinée / Après-midi / Toute la journée** (avant / après 13 h ; sans heure : toujours affiché).
- [x] **N° d'ordre de passage** (0001, 0002…) donné à l'arrivée, par jour et par établissement ; colonne « N° ».
- [x] Temps de **présence** (arrivée → fin) ajouté dans « Vus » (attente, consultation, présence) ; pas de colonne « temps avant
      prise en charge » (= l'attente, déjà affichée).
- [x] **Lignes colorées** selon le statut : bleu en salle, orange en consultation, vert vu, rose absent.
- [x] **« Dossier ouvert par »** : collègues qui ont le dossier ouvert (sous le nom dans la salle d'attente, bandeau en haut du
      dossier) ; collection `presence/{uid}` (chacun écrit le sien, renouvelé chaque minute, oublié après 3 min ; 4 tests).
- [x] **Tri** heure du rendez-vous / heure d'arrivée / alphabétique (réglage personnel `salleTri`) et **recherche** dans la liste.
- [x] **Imprimer la liste du jour** (A4 paysage, par statut, colonnes affichées, jour / établissement / période / recherche).
- Non retenus : panneau patient à droite, post-it patient, confirmation du rendez-vous, compteurs.

**SA1 quinquies – Retouches du 08/10 (après mise en ligne)**
- [x] **Prix payé d'avance** : crayon du prix aussi dans « À venir » / « En salle » (secrétaire et médecin) ; gardé dans la
      salle d'attente (`salle.prix`, règle : droit encaissements ou finances, 3 tests) et proposé dans la fenêtre de prix à la
      validation (rendez-vous et consultation de chimio).
- [x] Type en libellés courts (Suivi, Annonce, Contrôle, RT hebdo, Séance chimio ; activités sans « Consultation de »),
      badges de Type et pastilles de Statut centrés dans leur colonne, motif coupé proprement.
- [x] Validation d'une **cure J1 ou d'une séance J8…** dans le dossier : la fenêtre de prix de la consultation de chimio s'ouvre
      ensuite (sauf si déjà fixé) ; « Venu » d'un rendez-vous : fenêtre de prix pour le médecin et la secrétaire, même sans
      tarifs publiés.
- [x] **Anciennes séances de chimio** validées dans le dossier (avant la salle d'attente) : « Vu » (cure reçue un jour passé,
      ou consultation de chimio déjà payée) ; plus « À valider ».

**SA2 – Sans rendez-vous, prix et total, Configuration**
- [ ] « + Arrivée sans rendez-vous » (patient connu ou nouveau patient, motif, urgence).
- [x] Colonne **prix** et **total** ; fenêtre de prix pour la secrétaire : faits en SA1 bis.
- [x] Paramètres › Alertes : **seuils d'attente** de la salle d'attente (orange, rouge ; `parametres/reglages.salle`, défaut
      20 et 45 min). Ordre de la liste : tri personnel (fait en SA1 quater).
- [x] Corrigé : commentaire refusé sur une consultation vue sans document de salle d'attente (étape vide toujours écrite ;
      test de règle) ; stylo du commentaire centré ; anciens prix v1 d'une consultation faite dans un autre établissement
      (ex. HCK 225 → 250 DH) : brut cherché dans tous les établissements (migration `encaissementsBrutV1b`).

**SA3 – Dans l'agenda et le tableau de bord** (fait le 08/10, appelé « SA2 » par Dr Bentahila)
- [x] Statut et temps d'attente (« En salle · 12 min », « En consultation · 5 min », chimio « Vu 10:42 ») dans l'**Agenda**
      (vues Jour et Liste) et dans « Aujourd'hui » du tableau de bord, mis à jour en direct (`badgeSalle`, salle.js).
- Annulé (08/10) : message WhatsApp de consignes d'arrivée.

## Étape 7 – RCP (réunion de concertation pluridisciplinaire) (fait et testé le 09/10, pas encore en ligne)
**Demande de Dr Bentahila (09/10)** : dates de RCP dans les Paramètres ; bouton « + RCP » à côté de Doc. (inscription à la
prochaine RCP, fenêtre avec la question et la date d'inscription) ; onglet « RCP » dans Tâches à côté de « Toutes les tâches »
(calendrier des semaines, période choisie, dossiers inscrits avec la question et une case Fait) ; dossier ouvert depuis la
liste : décision saisie en nouvelle consultation « RCP », bulles Valider (coche Fait, retour à la liste) et Fermer.
**Choix faits par Claude (à confirmer)** : une seule RCP pour le cabinet (pas par établissement) ; un dossier reste « à faire »
tant que la case Fait n'est pas cochée (alerte « RCP passée sans case Fait ») ; inscrire, cocher et écrire la décision =
médecin et secrétaire (droit « Journal des consultations ») ; infirmière : lecture seule ; désinscrire = médecin ou qui a
inscrit.
- [x] **Paramètres › RCP** : jours de la semaine, heure, lieu ; dates ajoutées (RCP exceptionnelles) et dates annulées ; pas
      de RCP un jour férié (sauf date ajoutée) ; aperçu des 10 prochaines RCP. `parametres/rcp`.
- [x] Dossier : bouton **« + RCP »** dans la barre des prescriptions, après Doc. → fenêtre : date de RCP (prochaine proposée,
      menu des 12 suivantes ou autre date), date d'inscription (du jour, modifiable), question posée ; inscriptions déjà
      faites du patient (Modifier, Désinscrire). Flèche ▾ = toutes les RCP du patient (avec la décision).
- [x] Inscriptions non faites visibles dans « Rendez-vous et tâches à venir » (en rouge « décision à saisir » après la date).
- [x] **Tâches › onglet RCP** (`#taches/rcp`) : calendrier du mois (une ligne par semaine ; clic sur « S42 » = la semaine, sur un
      jour = ce jour ; jours de RCP encadrés, nombre de dossiers en pastille orange / verte (tous faits) / rouge (passée non
      faite)) ; période Du / Au, « Prochaine RCP », « Cette semaine », « Ce mois » ; Tous / À faire / Faits ; liste par date de
      RCP : patient (âge, diagnostic), question, décision, inscrit le / par, case **Fait** ; ✎ / ✕ ; **Imprimer** (fiche A4
      paysage pour la réunion, colonne Décision). Alerte « N dossiers de RCP passées sans case Fait » → les afficher.
- [x] Clic sur le patient → dossier avec **bulles** en bas à droite : **Décision RCP** (nouvelle consultation type « RCP », note
      « Question : … / Décision : » pré-remplie ; ensuite « Modifier la décision »), **Valider** (coche Fait, retour à la liste),
      **Fermer** (retour à la liste). La décision est recopiée dans la liste et sur la fiche imprimée.
- [x] Règles `rcp` (26 tests, total 116/116 sur l'émulateur).
- [x] Tests navigateur : médecin (paramètres, inscription, liste, décision, Valider, Fermer, case Fait, alerte, impression),
      secrétaire (inscrit, coche), infirmière (lecture seule, bulle Fermer seule), téléphone 390 px, bilan 352 317 DH.
- [x] Mise en ligne (règles + site), après accord. (09/10 : tout est en ligne, confirmé par Dr Bentahila.)
- Plus tard si besoin : RCP dans Google Agenda, une RCP par établissement.

## Étape 8 – Numéro de dossier et recherche des patients (fait, testé et mis en ligne le 09/10)
**Décidé le 09/10** : « AAAAMM + numéro dans l'ordre d'inscription » : **202610001** = 1er patient inscrit en octobre 2026,
le numéro **repart à 001 chaque mois** (4 chiffres au-delà de 999), **un seul compteur pour le cabinet** (le filtre par hôpital
se fait dans la recherche), les patients existants numérotés selon leur vraie date d'inscription (pour ceux venus de l'ancienne
application : la date de leur création là-bas, pas le 06/10).
- [x] Numéro attribué **par le serveur** à la création (fonction `numeroDossier`, transaction sur `compteurs/dossiers` : jamais de
      doublon, même si deux personnes créent un patient en même temps), écrit dans `identite.numero`, jamais changé (gardé par
      Modifier, les saisies de chimio, `separer`). Affiché en haut du dossier (« Dossier n° … »), dans la liste des patients,
      dans le choix du patient d'un rendez-vous et sur la fiche chimio. **Pas encore sur le pli / compte rendu** (documents.js).
- [x] Numéros donnés **une fois** aux patients existants à la 1re ouverture d'Onco360 par le médecin titulaire (fonction
      `numerosManquants`, dans l'ordre d'inscription). Test sur les 62 dossiers : 202609001 → 202609061, puis 202610001.
- [x] **Recherche** par nom, prénom, date de naissance (JJ/MM/AAAA) ou **numéro** (page Patients et choix du patient d'un
      rendez-vous) ; **filtre par hôpital** dans la page Patients (si la personne voit plusieurs établissements).
- [x] Tests : logique `node functions/test-numeros.js` (10 cas), navigateur (numérotation, recherche, filtre, création,
      numéro conservé), 390 px, bilan 352 317 DH.

## Étape 9 – Sécurité et conformité (obligatoire pour vendre)
**S1 – Journal d'audit (traçabilité)** (fait, testé et mis en ligne le 09/10)
**Décidé le 09/10** : modifications, suppressions et **ouvertures de dossier** (pas les impressions ni les connexions) ; pour une
modification, **la partie touchée** (Rendez-vous, Chimiothérapie…), jamais les valeurs ; lu par le **titulaire seul** ; **tout est
gardé** pour l'instant (durée à fixer avec le juriste).
- [x] Journal **infalsifiable** : fonction `auditEcriture` (déclencheur « avec identité » sur `espaces/{e}/{collection}/{document}` :
      la personne réellement connectée, impossible à falsifier ; écriture d'une fonction serveur = « Onco360 (serveur) pour X »),
      lignes dans `audit/{e}/lignes/{événement}` (une seule ligne même si l'événement est rejoué). Ouvertures : signal « Dossier
      ouvert par » (`presence`) qui change de dossier, ou le même après 30 min. Logique `functions/audit.js` (25 tests). Règles :
      lecture par le titulaire (cabinet non suspendu), **aucune écriture** depuis le navigateur, même pas le titulaire (12 tests,
      total 167/167). Journal effacé avec le cabinet (`supprimerCabinet`).
- [x] Page **Paramètres › Journal d'audit** (titulaire) : période (7 derniers jours par défaut), filtres personne / action / partie /
      patient, nombre de lignes par action, lien vers le dossier (« Dossier supprimé » sinon), **export Excel** ; bouton **Journal**
      dans le dossier (titulaire) = journal de ce patient sur 1 an. `public/js/app/audit.js`. Tests navigateur 12/12.
- [x] Mise en ligne le 09/10 (fonction `auditEcriture`, règles, site) : le journal note depuis ce jour.
- [ ] Durée de conservation à décider (avec le juriste). Volume à surveiller (une ligne par écriture et par ouverture).
**S2 – Rôles et droits affinés**
- [x] Nouveau rôle **Comptable** (09/10, fait, testé et mis en ligne). **Décidé** : patients en nom + n° de dossier (aucun
      diagnostic) ; il **pointe les paiements** et saisit les versements, sans toucher aux tarifs ; relevé préparé quand un médecin
      ouvre Onco360 ou enregistre un dossier, **date affichée**. Relevé financier `comptabilite/releve_0…n` + `meta` (bilan.js
      `publierReleve`, 3 s après l'ouverture, 2 min après un enregistrement ; réécrit seulement s'il a changé). Règles : le
      périmètre lui est fermé (`dansPerimetre`), ni présence ni historique, écrit seulement `finances/paiements|versements`
      (15 tests, total 182/182). Écran : Bilan et Profil seulement, aucun lien vers un dossier ; même bilan que le médecin
      (352 317 DH, tous les indicateurs identiques ; `tests/test_comptable.py` 13/13). Paramètres › Accès : rôle « Comptable »
      (tout le cabinet), limite « Comptables » dans les formules.
      Limite : relevé à jour au dernier passage d'un médecin (un prix fixé par la secrétaire apparaît au suivant).
- [ ] Infirmière : constantes et administrations (voir étape 11) ; médecin : accès complet. Vérifier que chaque droit de la
      grille est aussi imposé par les **règles du serveur** (pas seulement masqué à l'écran).
- [ ] Rôle **Pharmacien** si l'étape 11 (PUI) est faite.
**S3 – Mode démo (anonymisation)**
- [ ] Bouton **« Mode démo »** (médecin) : noms, prénoms, téléphones, dates de naissance, photos **remplacés à l'écran**
      par des faux (« Patient Test 12 ») ; rien n'est modifié dans la base ; bandeau « MODE DÉMO » ; impressions bloquées
      ou anonymisées.
- [x] **Cabinet de démonstration** (décidé le 09/10 à la place du bouton, fait et testé) : page Administration › Cabinets ›
      « Créer le cabinet de démonstration » (fonction `creerCabinetDemo`, `cab-demonstration`, `demo: true`, formule Complète,
      compte de démonstration à l'e-mail choisi, par défaut ritabentahila+demo@gmail.com), clinique fictive DEMO et ses tarifs,
      **8 patients fictifs** PATIENT TEST 1 à 8 (`functions/demo.js` : chimios en cours, RT en cours / contourage à valider,
      rendez-vous du jour et à venir, consultations), badge « Démonstration », « **Réinitialiser la démo** » (`demoReinitialiser` :
      tout refait aux dates du jour). Dans Onco360 : « Cabinet de démonstration (patients fictifs) » sous le nom. Tests : moteur 9/9
      (`node functions/test-demo.js`), navigateur 14/14 (`tests/test_demo.py`).
- [ ] Bouton « Mode démo » (anonymisation à l'écran d'un vrai cabinet) : plus tard si besoin.
- [x] **Bibliothèque de référence** (demandé le 09/10 ; remplacée le 10/10 par les bibliothèques par spécialité, voir plus bas) : ce que reçoit un cabinet neuf vient d'une **copie mise de côté**
      (`plateforme/reference`, serveur seulement, déjà nettoyée : ni correspondants, ni tarifs, ni absences), prise dans le cabinet
      de Dr Bentahila à la 1re création puis seulement quand l'administration clique « Mettre à jour depuis le cabinet du Dr
      Bentahila » (onglet « Bibliothèque de référence », `referenceMaj`). Les modifications d'un médecin restent dans son cabinet.

## Étape 10 – Mode hors-ligne (application installable)
- [ ] Onco360 **installable** sur ordinateur, tablette et téléphone (icône, plein écran).
- [ ] En cas de coupure de réseau : **consultation des fiches patients déjà ouvertes et du planning du jour** ; les
      modifications faites hors ligne sont envoyées au retour du réseau (ou interdites hors ligne : à décider).
- [ ] Bandeau « Hors ligne » visible ; données gardées sur l'appareil effacées à la déconnexion (appareils partagés).
- [ ] Tests : couper le réseau, recharger, relire un dossier et l'agenda ; bilan 352 317 DH.

## Étape 11 – Soins infirmiers, pharmacie, alertes
**« Marquer administrée » est repris (décision du 08/10)**, après son abandon du 06/10 : c'est la validation de la
pose des poches ci-dessous (I1). La règle `administrations` existe encore (inutilisée) ; la ligne du droit est à remettre
dans Profil › Accès › Droits.
**I1 – Mode tablette pour les salles de soins**
- [ ] Écran épuré pour tablette (iPad / Android), pour l'infirmière au chevet du patient en cours de chimiothérapie :
      patients du jour, cure et molécules à administrer.
- [ ] Valider la **pose de chaque poche** (heure, par qui), la **voie d'abord** (chambre implantable / PAC, voie
      périphérique, PICC line…), les constantes, et saisir en temps réel la **tolérance et les effets indésirables**.
- [ ] Ce qui est saisi apparaît dans le dossier (onglet Chimiothérapie, cure concernée).
**I2 – Circuit de la pharmacie (PUI)**
- [ ] Validation de la prescription par le **pharmacien** → **préparation** (poche) → **libération** → **administration**
      par l'infirmière ; chaque étape datée avec son auteur ; statut visible par le médecin.
- [ ] À décider : utile seulement pour les cliniques avec pharmacie ; option activable par cabinet.
**I3 – Alertes urgentes sur le téléphone (notifications)**
- [ ] Alerte instantanée sur le téléphone de l'oncologue, même Onco360 fermé : effet indésirable grave saisi par
      l'infirmière, neutropénie fébrile signalée, **bilan biologique anormal avant cure** (seuils à définir : PNN, plaquettes,
      créatinine…).
- [ ] Même système que T6 (Tâches) : à construire une seule fois.

## 10/10/2026 – Bibliothèques gérées par l'administration, comptes de l'équipe
- [x] **Bibliothèques par spécialité** : espaces sans patient `espaces/bib-oncologie` (puis `bib-generaliste`, `bib-gynecologie`),
      ouverts par l'administration (`bibliothequeOuvrir`, page Onco360 `v2.html?espace=bib-…` : Protocoles et Paramètres ›
      Fermetures (fériés), Listes, Bibliothèques (dont la **documentation**, gérée sans patient), Activités (tarifs RT) ; menu réduit,
      « Retour à l'Administration »). Oncologie – Radiothérapie créée depuis la copie du 09/10 ; à la 1re ouverture, les listes
      encore « de départ » (médicaments, analyses, courriers, documentation…) y sont **figées** (enregistrées telles quelles). Un
      cabinet neuf reçoit la copie de la bibliothèque de **la spécialité de sa formule** (documents PDF recopiés). Le bouton « Mettre
      à jour depuis le cabinet du Dr Bentahila » est retiré. Tests : `tests/test_bibliotheque.py` 19/19, `node functions/test-cabinets.js` 42/42.
- [x] **Comptes de l'équipe** : la création de comptes depuis le navigateur est fermée dans Firebase (erreur
      « auth/admin-restricted-operation » en voulant créer une secrétaire) → fonction serveur `creerMembre` (titulaire, limite de la
      formule vérifiée par le serveur, droits nettoyés), e-mail de Firebase + **« Lien du mot de passe »** dans Paramètres › Accès
      (`lienMembre`, message prêt pour WhatsApp). Page Administration : **équipe** de chaque cabinet (noms, rôles, e-mails ; aucune
      donnée médicale), comptables comptés.
- [x] **Paramètres de base par spécialité** (10/10) : dans la bibliothèque de référence (`PARAMS_SPE` de cabinets.js, nettoyés par
      `parametreDepart`), repris une fois du cabinet du Dr Bentahila (`parametresImportes`), modifiables dans la bibliothèque
      (Paramètres : tous les onglets sauf Lieux, Accès, Journal ; Google Agenda : couleurs seulement), copiés aux cabinets neufs.
- [x] **Modules et menus par spécialité** (10/10) : `MODULE_FAMILLE` (Protocoles / chimio et radiothérapie : Oncologie –
      Radiothérapie ; les autres : toutes spécialités), `MODULE_MENU`, `MODULES_PREVUS` (Traitements et stocks, Matériel et
      consommables : médecine générale) ; onglet « Modules et menus » ; formules : seulement les modules de leur spécialité.
- [ ] Bibliothèque et paramètres Médecine générale / Gynécologie, et leurs modules (Traitements et stocks, Matériel et
      consommables…) : à décider et construire (étape 14).
- [ ] Plus tard si besoin : renommer un menu ou changer son ordre depuis l'Administration (aujourd'hui : dans le code).

## Étape 14 – Autres spécialités (demandé le 09/10/2026) : nouveaux modules et leurs formules
Onco360 s'ouvrira avec le temps à d'autres médecins : **médecine générale**, **gynécologie**, puis d'autres spécialités. Pour
chacune : des **modules propres** (créés au fur et à mesure) et des **formules propres**, rangées par spécialité dans la page
Administration (onglet Formules : déjà par spécialité depuis le 09/10 ; « Médecine générale » et « Gynécologie » y figurent, sans
formule tant que leurs modules n'existent pas).
- Formules par spécialité, chacune avec tous ses niveaux (ex. Essentiel / Pro / Clinique) : oncologue médical, radiothérapeute,
  oncologue-radiothérapeute (faites le 09/10), généraliste, gynécologue (à faire avec leurs modules).
- [ ] Médecine générale : à décider avec Dr Bentahila (ex. consultation de médecine générale, vaccinations, certificats,
      suivi des maladies chroniques, courbes de croissance…), puis modules + formules.
- [ ] Gynécologie : à décider (ex. suivi de grossesse, échographies, dépistage, contraception…), puis modules + formules.
- Avant le 1er module d'une autre spécialité : donner une formule au cabinet de Dr Bentahila (ex. Onco-radiothérapie – Clinique),
  sinon il reçoit tous les modules (cabinet sans abonnement = tout). Avec un abonnement, un module absent = non attribué (09/10).
- Technique : un module = une clé dans `public/js/donnees/modules.js` et `functions/cabinets.js` (MODULES), ses écrans marqués
  `data-mod`, sa page dans `PAGE_MODULE` (v2.js) ; « Ajouter les formules proposées par Onco360 » (onglet Formules) ajoute les
  nouvelles formules sans toucher à celles déjà modifiées. Le nom « Onco360 » sera peut-être à revoir pour les autres spécialités.

## Étape 15 – Module Bilan : virements et chèques reçus des cliniques et hôpitaux (demandé le 09/10/2026 ; fait et testé le 09/10, pas encore en ligne)
But : dans la page **Bilan**, un endroit pour noter **chaque règlement reçu d'une clinique** (virement ou chèque) avec sa
**date de réception**, pour la comptabilité de fin d'année. **Ne compte pas dans le bilan** : le bilan, c'est déjà l'activité
elle-même (sinon tout serait compté deux fois). À ne pas confondre avec « **Versements autres** » (KL, `finances/versements`),
qui, eux, **s'ajoutent** au CA du bilan. Module « Bilan » : s'applique à tous les cabinets qui ont ce module.

**Décidé par Dr Bentahila (09/10)** : cliniques seulement (ni espèces, ni mutuelles, ni patients) ; pas de photo du chèque ou de
l'avis de virement ; liste à part, sans lien avec le pointage « Payé » des actes ; le comptable **lit** seulement ; cadre placé
**sous « Versements autres »**.
- [x] Cadre **« Règlements reçus des cliniques »** sous « Versements autres », avec la mention « non comptés dans le bilan ».
- [x] Une ligne = un règlement : **date de réception**, **clinique** (lieux d'exercice du cabinet), **mode** (virement / chèque),
      **montant**, **n° du chèque ou référence du virement**, **banque**, **période ou actes concernés**, **encaissé le** (banque ;
      vide = « Pas encore »), **note**. Contrôles : date, clinique, montant obligatoires ; encaissement pas avant la réception.
- [x] Ajouter (« + Nouveau règlement reçu »), modifier ✎, supprimer ✕ ; liste du plus récent au plus ancien. Filtres : la
      **période et l'établissement du haut de la page** (date de réception), plus **mode** et **encaissement** (encaissés / pas
      encore).
- [x] **Totaux** : total reçu, par clinique (virements, chèques, total) et **par mois de réception** (si la période couvre
      plusieurs mois). Pour information à côté de chaque clinique : actes de la même période dans le bilan (NET, dont payé, dont à
      recevoir), sans rien changer au bilan.
- [x] **Exports** : feuille « Règlements reçus » dans l'Excel du bilan, tableau à la fin du PDF (indicateurs du bilan inchangés).
- [x] Qui : médecin (droit « finances ») ajoute, modifie, supprime ; **comptable : lecture seule** (aucun bouton) ; secrétaire et
      infirmière : rien (pas de page Bilan).
- [x] Données : `finances/reglements` = { data: JSON [{ id, d, hop, mode vir|chq, m, ref, banque, per, enc, note, par, parNom,
      le }] } (comme les versements ; liste relue juste avant chaque enregistrement). **Règles inchangées** : la règle existante
      donne déjà l'écriture au droit « finances » et ne laisse au comptable que paiements et versements. 4 tests de règles ajoutés
      (`test-comptable.mjs`). Journal d'audit et sauvegarde Drive : automatiques (collection `finances`).
- [x] Tests : règles (toutes réussies, 19/19 pour le comptable) ; navigateur avec le faux Firebase : ajout, contrôles, modification,
      suppression, filtres mode / encaissement / clinique / période, PDF, Excel sans erreur, comptable en lecture seule, téléphone
      390 px sans débordement, **bilan 2026 inchangé (352 317 DH)**, aucune erreur dans la console.
- [x] **Retouches du 09/10** (demandées par Dr Bentahila) : cadre renommé « **Règlements reçus des cliniques et hôpitaux** » ;
      colonnes « Actes de la période / dont payé / dont à recevoir » retirées (les cliniques paient en vrac de temps en temps) ;
      **virement = reçu directement** : pas de date d'encaissement (champ affiché pour un chèque seulement, colonne « Chèque encaissé
      le », « — » pour un virement, compté encaissé) ; corrigé : un règlement hors de la période affichée (ex. virement du 05/05
      avec la page sur le mois en cours) était enregistré mais invisible → période élargie à son année, filtres remis, message.
      Page Bilan : « KL » retiré de « Versements autres » (propre au Dr Bentahila ; ses anciens libellés « Versement KL » restent) ;
      ligne « Consultations : chimio · annonce · suivi · contrôle » (détail du total des consultations par type) retirée de l'écran.
- [ ] Mise en ligne (site seulement : `firebase deploy --only hosting`), avec l'accord de Dr Bentahila.

## Étape 12 – Dossier de cession, démonstration et guides
But : un acheteur (éditeur, ESN, clinique) reprend Onco360 **sans avoir besoin d'appeler Dr Bentahila**.
**C1 – Vérification complète du dossier de l'application**
- [ ] Relecture de tout le projet : fichiers inutiles ou anciens, aucune clé secrète ni donnée patient dans le code,
      cohérence des règles de sécurité, liste de ce qui reste propre à Dr Bentahila. Rapport écrit.
**C2 – Tutoriel d'installation sur un nouveau compte Firebase** (nouveau médecin ou acheteur)
- [ ] Pas à pas, **en moins de 30 minutes** : créer le projet Firebase, activer l'authentification, Firestore, l'offre
      Blaze, les sauvegardes ; copier la configuration ; déployer site, règles et fonctions ; Google Agenda (client OAuth,
      secret) ; créer le premier compte médecin ; vérifications. Testé pour de vrai sur un projet Firebase vierge.
**C3 – Tutoriel complet des fonctionnalités** = guides par rôle (remplace F3) :
- [ ] **Guide Médecin**, **Guide Infirmière**, **Guide Secrétariat** (PDF illustrés de captures d'écran faites sur le
      cabinet de démonstration) + aide dans l'application.
**C4 – Documentation technique**
- [ ] **Architecture technique** (site, Firebase, fonctions serveur, Google Agenda, sauvegardes).
- [ ] **Schéma de la base de données** (collections, champs, liens) en image + description.
- [ ] **Règles de sécurité** commentées (qui lit / écrit quoi).
- [ ] **Fonctions serveur et scripts** (Apps Script de sauvegarde, construire.mjs, tests) expliqués.
- [ ] **Cahier de recette** : liste de toutes les fonctionnalités avec le scénario de test et le résultat attendu.
**C5 – Jeu de démonstration**
- [ ] 5 à 10 **faux patients** (Patient Test 1, 2…) avec historique de cures, radiothérapies, consultations,
      ordonnances, bilans, agenda rempli, salle d'attente, tâches ; **chargé en un clic** dans un cabinet de démonstration.
- [ ] **Scénario de démo de 15 min** (connexion médecin → dossier → protocole → validation infirmière → agenda → bilan).
- [ ] **Plaquette commerciale** de 2 à 3 pages (positionnement, fonctionnalités clés, valeur pour une clinique).
**C6 – Dossier juridique** (modèles rédigés par Claude, **à faire relire par un juriste** avant usage)
- [ ] Note de conformité **CNDP / loi 09-08** (mesures intégrées : droits d'accès, traçabilité, chiffrement, sauvegardes ;
      options d'hébergement : Firebase Belgique, cloud marocain, serveur local).
- [ ] **Accord de confidentialité (NDA)** à signer avant d'envoyer le code ou de donner l'accès.
- [ ] **Contrat de cession** : clause de **non-réplication** (pas de logiciel concurrent avec le même code), **assistance
      après cession** de 30 à 60 jours (2 à 4 h par semaine).
- [ ] **Auteur du code : Dr Rita Bentahila** (développé avec Claude, d'abord depuis le compte de Hamza Benzekri, puis
      repris par elle sur son compte) : à écrire dans le contrat de cession.
**C7 – Paquet de cession** : dossier `Onco360_Package_Cession/` sur le Mac, puis `.zip` remis à la signature :
```
Onco360_Package_Cession/
├── 01_Code_Source/            (public/, functions/, firestore.rules, firebase.json, apps-script/, tests/ sans données,
│                                .env.example sans vraies clés, README.md technique ; sans node_modules ni sauvegardes)
├── 02_Documentation_Technique/ Architecture_Technique.pdf, Schema_Base_de_Donnees.pdf, Regles_Securite_Firebase.txt,
│                                Procedures_Deploiement.md, Cahier_de_Recette.pdf
├── 03_Dossier_Commercial_et_Demo/ Plaquette_Commerciale_Onco360.pdf, Scenario_Demo_15min.pdf, Dataset_Demo.json
├── 04_Guides_Utilisateurs/    Manuel_Medecin.pdf, Manuel_Infirmier.pdf, Manuel_Secretaire.pdf
└── 05_Legal_et_Conformite/    Checklist_Conformite_CNDP.pdf, Modele_NDA.pdf, Modele_Contrat_Cession.pdf
```
- [ ] Adapté à Onco360 : pas de `npm run dev` ni de `.next/` (site sans compilation) ; le README explique Firebase et le
      serveur de test local. Historique git fourni ou non : à décider.

## Étape 13 – Interopérabilité (connexion aux autres logiciels)
- [ ] **HL7 / FHIR** (normes d'échange de données de santé) : export des comptes rendus et du résumé patient vers le
      dossier informatisé d'une clinique ; import des résultats d'un laboratoire. À faire avec un premier client réel
      (chaque laboratoire / clinique a son propre système).
- [ ] **Imagerie (DICOM)** : au minimum, **liens** vers les clichés (scanner, IRM) ou la console de radiothérapie dans le
      dossier ; plus tard, visionneuse intégrée.

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
| 07/10/2026 | 1A – Onglets | Infirmière : Consultation (lecture), Chimiothérapie ouverte en premier, Radiothérapie (lecture). Testé (3 rôles, bilan 352 317 DH). Mis en ligne. |
| 07/10/2026 | 1B – Consultations | Journal des consultations (créer, plier, modifier, supprimer), barre des 5 prescriptions (à venir), nouveau droit d'écriture, secrétaire : chimio en lecture. Testé (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 07/10/2026 | 1B – Consultations | Mis en ligne (site + règles de sécurité). |
| 07/10/2026 | 1B – Consultations | Retouches : menu déroulant + titre libre (ex. J1C1 FOLFOX) ; barre des prescriptions indépendante, en bas de l'onglet. Testé (ordinateur, 390 px). Mis en ligne. |
| 07/10/2026 | 1C – Médicaments | Liste des médicaments nettoyée (225 → 147 lignes, posologies en clair, classe thérapeutique, 21 lignes à vérifier en jaune). Décidé : ordonnance sans consultation du jour → consultation créée automatiquement. |
| 07/10/2026 | 1C – Médicaments | Corrections de Dr Bentahila reprises, remarques retirées, 30 médicaments d'oncologie ajoutés (en vert) : 162 médicaments, à valider. |
| 07/10/2026 | 1C – Médicaments et ordonnance | Liste des médicaments (165, recherche, + / ✎ / ✕, double-clic), ordonnance A5/A4 modifiable, Valider / Valider + Imprimer, ligne « Médic. » dans la consultation du jour (créée si besoin). Testé (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 07/10/2026 | 1C – Médicaments et ordonnance | Mis en ligne. Décidé : les ordonnances ne vont pas dans Documents (enregistrées dans la consultation seulement, historique en 1D). |
| 07/10/2026 | 1A bis – Documents | Décidé : rien dans l'onglet Documents ; ordonnances et courriers derrière leur petite flèche ; pli, CR de fin et rendez-vous RT ouverts dans une fenêtre, modifiés, imprimés, enregistrés et rouverts depuis la carte radiothérapie. Questions posées. |
| 07/10/2026 | 1A bis – Documents | Réponses : fenêtre seulement (plus de Word ni d'Excel), médecin et secrétaire modifient, onglet Documents gardé pour déposer des fichiers (étape à part). |
| 07/10/2026 | 1D – Antécédents | Fenêtre des antécédents (Imprimer, Supprimer, Modifier à la date du jour, Renouveler, Fermer), ouverte aussi par la ligne « Médic. ». Testé (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 07/10/2026 | 1D – Antécédents | Retouches : Modifier garde la date de prescription, la secrétaire peut supprimer. Testé, mis en ligne (site + règles). |
| 07/10/2026 | 1D – Antécédents | Modifier rouvre la liste des médicaments avec ceux de l'ordonnance (même date). « RCP » ajouté au menu des consultations. Règle : même système pour Ordo. type et Analyses. Testé (bilan 352 317 DH). Mis en ligne. |
| 07/10/2026 | 1A bis – Documents | Pli, CR de fin et rendez-vous RT dans une fenêtre (A4 modifiable, Enregistrer / + Imprimer, version rouverte), plus de Word ni d'Excel. Testé (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 07/10/2026 | 1A bis – Documents | Mis en ligne (site + règle documentsRT). Marges d'impression élargies sur les côtés pour toutes les ordonnances (A5, A4) et les documents A4. |
| 07/10/2026 | Impression | Côtés encore resserrés et place de l'en-tête agrandie (A5 45/28 mm, A4 60/35 mm, documents 45/35 mm), mis en ligne. Rappel ajouté : mesurer les en-têtes du papier. |
| 07/10/2026 | 1E – Ordonnances types | Ordo. type : 26 ordonnances types (fichier du Dr corrigé et complété), clic = médicaments dans l'ordonnance, ✎ / ✕ / ajout, création / modification / suppression des types. Testé (bilan 352 317 DH). Pas encore en ligne. |
| 07/10/2026 | 1E – Ordonnances types | Mis en ligne. |
| 07/10/2026 | 2 – Retouches | Rendez-vous de chimio : « Venu » + fenêtre de prix (J1 250 DH, J8/J15 0), case « Consultation encaissée » retirée ; mis en ligne. |
| 07/10/2026 | 2 – Retouches | Rendez-vous à venir : toutes les séances de chimio de toutes les cures prévues ; mis en ligne. |
| 07/10/2026 | 2 – Retouches | Antécédents / mode de vie / allergies masqués dans le dossier ; champ « Traitement en cours » ajouté ; mis en ligne. |
| 07/10/2026 | 1B – Consultations | Consultations toutes fermées à l'ouverture du dossier ; liste dans une zone qui défile (environ 10 consultations visibles, position gardée en pliant / dépliant). Testé avec 30 consultations (ordinateur, 390 px, bilan 352 317 DH), mis en ligne. |
| 07/10/2026 | Retouches | Rendez-vous à venir : liste qui défile (5 visibles). Ordonnances types : version Excel du Dr installée. Favoris ⭐ (médicaments, ordonnances types). Testé (390 px, bilan 352 317 DH), mis en ligne. |
| 07/10/2026 | 2 – Retouches | Boutons Afficher / Modifier ; résumé du patient enregistré automatiquement, page non quittable avant enregistrement ; mis en ligne. |
| 07/10/2026 | 1E – Analyses | Analyses : 34 bilans (7 généraux) et 94 analyses (fichier du Dr rangé), clic = lignes dans l'ordonnance, ordonnance « Prière de faire pratiquer », création / modification / favoris. Testé (390 px, bilan 352 317 DH). Pas encore en ligne. |
| 07/10/2026 | 1E – Analyses | Version corrigée par Dr Bentahila reprise ; mis en ligne. |
| 07/10/2026 | 1E – Examens compl. | Examens compl. : 55 examens et 7 bilans d'imagerie (fichier du Dr rangé, ajouts à valider), même fenêtre que les analyses. Testé (390 px, bilan 352 317 DH). En attente de relecture, pas encore en ligne. |
| 07/10/2026 | 1E – Examens compl. (mise en ligne) | Relecture du Dr : examens validés, pas de bilans d'imagerie ; ordonnances d'analyses et d'examens « Prière de bien vouloir faire », sans renseignements cliniques ni titre de bilan ; éléments de bilans coupés dans les parenthèses recollés. Testé (390 px, bilan 352 317 DH), en ligne. |
| 07/10/2026 | 1E – Courriers | 6 modèles de courriers du Dr (ALD, arrêt de travail, certificat, courrier, pli confidentiel, compte rendu) remplis pour le patient, zones à compléter, éditeur de modèles ; régimes de RT pelvienne en PDF (français, darija de droite à gauche). Testé (3 rôles, 390 px, bilan 352 317 DH), en ligne. |
| 07/10/2026 | Droits de la secrétaire | Supprime les consultations qu'elle a créées (le médecin : toutes) ; n'annule pas un statut « Venu / Non venu » posé par le médecin (statut noté avec son auteur `sp`, anciens statuts = médecin) ; Créneaux & horaires limités à son centre (membre limité à certains établissements) ; ne crée, ne modifie, ne supprime ni ne met en favori aucun élément des listes (Médic., Examens compl., Ordo. type, Analyses, Courriers), elle s'en sert pour prescrire. Règles : `bibliotheques` écrites par le médecin, consultations supprimées par le médecin ou leur auteur. Testé (2 rôles, 390 px, bilan 352 317 DH), en ligne. |
| 07/10/2026 | 5 – Tâches (plan) | Plan du module Tâches (T1 à T6) proposé et décidé : qui voit, modifie, supprime ; types rapides ; « + Tâche » dans le dossier ; tâches absentes du dossier. |
| 08/10/2026 | 5 – T1 Tâches | Page Tâches (Mes tâches / Toutes les tâches), création, modification, réattribution, statuts, historique, suppression, « + Tâche » dans le dossier, règles `taches`. Testé (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | Plan | Demandes du 08/10 rangées : étapes 6 (salle d'attente), 7 (RCP), 8 (numéro de dossier, recherche), 9 (audit, rôles, mode démo), 10 (hors-ligne), 11 (tablette infirmière, pharmacie, alertes), 12 (téléconsultation), 13 (cession, tutoriels, démo, juridique), 14 (HL7/FHIR, DICOM) ; licences et quotas ajoutés à l'étape 4 ; ordre proposé. |
| 08/10/2026 | Plan | Retirés : téléconsultation, écran TV et QR code de la salle d'attente, « Prévenir d'un retard ». « Marquer administrée » repris (étape 11). Vente : abonnements **et** cession. Auteur du code : Dr Rita Bentahila. Étapes renumérotées (6 à 13). |
| 08/10/2026 | 5 – T1 Tâches | Mis en ligne (site + règles) par Dr Bentahila. |
| 08/10/2026 | 5 – T2 Tâches | Filtres : recherche, responsable (médecins / secrétaires / infirmières / membre / demandées par moi), statut, échéance (retard, aujourd'hui, semaine, sans), type ; effacer les filtres. Testé (médecin, secrétaire, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – T2 Tâches | Mis en ligne par Dr Bentahila. |
| 08/10/2026 | 5 – T3 Tâches | Fil de la tâche (événements + commentaires en bulles), commenter, réattribuer depuis la fiche, nombre de commentaires dans la liste ; règles : fil signé par la personne connectée. Tests des règles sur l'émulateur (`tests/regles`, 40/40). Testé (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – T4 Tâches | Temps réel (écoute en direct), messages à l'écran, non lues (profil), pastilles menu + titre de l'onglet, carte « Mes tâches » du tableau de bord ; l'auteur peut supprimer sa tâche même terminée. Règles 44/44 sur l'émulateur. Testé (2 onglets médecin + secrétaire, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – T5 Tâches | Finition : nom du patient à jour, patient hors périmètre sans lien, responsable sans accès « À réattribuer » (statut / commentaire bloqués s'il est retiré), guide `guide/taches.md`. Testé (médecin, secrétaire HGC, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – T6 Tâches | Échéances dans le Google Agenda du responsable (journée entière ou 15 min, sans rappel, « EN RETARD » reportée chaque jour, retirée une fois terminée, suit les réattributions) : fonction `agendaTache` + remise à plat. Tests logique 32/32. Pas encore en ligne. |
| 08/10/2026 | Google Agenda – couleurs | Couleurs par type d'événement modifiables (Configuration › Google Agenda), par défaut : annonce Flamant, suivi Paon, RT en cours Lavande, hospitalisation Myrtille, chimio Basilic, RT Raisin, dosimétrie Mandarine, absences Banane, tâches Graphite / Tomate. Fonction `agendaCouleurs`. Tests 40/40. Mis en ligne (règles, fonctions, site). |
| 08/10/2026 | 6 – Salle d'attente | Décisions prises (statuts, qui fait quoi, tous les types de consultation, motif, prix et total, bulles Valider / Retour dans le dossier, arrivée sans rendez-vous, ordre au choix) ; étape découpée en SA1, SA2, SA3. |
| 08/10/2026 | 6 – Salle d'attente | Décisions sur les prix (secrétaire : consultations seulement, fonction serveur), total encaissé / prévu, séance de chimio = consultation seulement (cure validée dans le dossier), Absent : médecin et secrétaire. Prêt pour SA1. |
| 08/10/2026 | 6 – SA1 Salle d'attente | Page Salle d'attente (rendez-vous de consultation et séances de chimio du jour, 4 onglets, Mettre en salle / Démarrer / Valider / Absent / Annuler / Retour, motif, retard et temps d'attente), temps réel (collection `salle`), bulles Valider / Retour dans le dossier, motif dans la fenêtre du rendez-vous. Règles 66/66 sur l'émulateur. Testé (médecin, secrétaire HGC, infirmière HGC, chimio J15, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 6 – SA1 bis Salle d'attente | Bandeau de la semaine (flèches, calendrier), jours passés / à venir ; Absent → fenêtre de report du rendez-vous ; colonne prix et total ; secrétaire : fenêtre de prix et modification d'un prix validé (fonction serveur prixConsultation, tarifs des consultations publiés). Tests logique 52/52, règles 66/66, navigateur (médecin, secrétaire, chimio, 390 px, bilan 352 317 DH). Report d'une séance de chimio manquée : proposition à valider. Pas encore en ligne. |
| 08/10/2026 | Documents du dossier | Onglet Documents : dépôt de fichiers (PDF, Word, photos…) avec titre, date et type, liste récente d'abord, recherche et filtre par type, ouvrir / télécharger / modifier / supprimer ; types de documents dans Configuration › Documents ; Cloud Storage activé (Europe) et règles publiées. Testé (médecin, secrétaire, infirmière, 390 px, bilan 352 317 DH). Pas encore en ligne (avec la salle d'attente, après accord). |
| 08/10/2026 | Doc. et ligne libre | Bouton « Doc. » (documentation PDF du cabinet à remettre aux patients, régimes déplacés de Courriers, recherche, catégories, tri, remis noté dans la consultation, médecin seul gère) ; ligne libre avec suggestions de la liste. Testé (médecin, secrétaire, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | Mise en ligne commune | Documents du dossier, bouton Doc., ligne libre avec suggestions et Salle d'attente mis en ligne (règles Firestore et stockage, fonction prixConsultation, site v2.js?v=20261008m), sur l'accord de Dr Bentahila. |
| 08/10/2026 | 6 – SA1 et SA1 bis Salle d'attente | Mis en ligne (règles, fonction prixConsultation, site v2.js?v=20261008m), avec l'onglet Documents de l'autre session. À faire par Dr Bentahila : ouvrir Onco360 une fois avec son compte (publie les tarifs des consultations pour la secrétaire). |
| 08/10/2026 | 2 – Retouches | Dossier : « Rendez-vous à venir » déplacé juste au-dessus de « Consultations et hospitalisations » ; bouton « + Rendez-vous » à côté d'Afficher / Modifier / + Tâche ; mis en ligne (v2.js?v=20261008r). |
| 08/10/2026 | 6 – SA1 ter Salle d'attente | Chimio en tête d'À venir, plus de « En retard », colonnes civilité / correspondant / mutuelle / commentaire et choix des colonnes, prix bruts (anciens prix HCK), Non venu à 0 DH dans le dossier, case « Payé auto. » des Paramètres (bilan). Règles 69/69, logique 52/52, navigateur (médecin, infirmière, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 6 – SA1 ter Salle d'attente | Séance de chimio manquée : report depuis la salle d'attente (médecin et secrétaire, planning seul pour elle), onglets sur toute la largeur, bandeau des titres. Navigateur (secrétaire, médecin, 390 px, bilan de référence inchangé). Pas encore en ligne. |
| 08/10/2026 | 6 – SA1 quater Salle d'attente | Repris de GestiCab : Matinée / Après-midi / Journée, n° d'ordre de passage, temps de présence, lignes colorées, « Dossier ouvert par », tri et recherche, impression de la liste. Règles 73/73, navigateur (390 px, bilan de référence inchangé). |
| 08/10/2026 | 6 – SA1 ter et quater Salle d'attente | Mis en ligne (règles salle + presence, fonction prixConsultation, site v2.js?v=20261008s). Les changements non enregistrés d'une autre session (bouton « + Rendez-vous », rendez-vous à venir déplacés dans le dossier) sont partis avec. |
| 08/10/2026 | 5 – P1 Tâches | Plan P1 à P4 décidé (types de tâches modifiables, Paramètres unique, Google Agenda par personne, tâches automatiques de radiothérapie, tâches dans « Rendez-vous à venir »). P1 fait : description visible dans la liste, Configuration › Tâches (types modifiables, « Radiothérapie » fixe). Testé (2 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – P2 Paramètres | Configuration et Paramètres fusionnés en une page « Paramètres » (9 onglets ; Activités et rémunérations avec le droit finances) ; nouveaux onglets Impression (marges) et Alertes (délais), délai du bouton WhatsApp vert ; `parametres/reglages`. Testé (2 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – P2 bis Paramètres | Onglets Listes (diagnostics, mutuelles, correspondants modifiables, nombre de dossiers) et Bibliothèques (les 5 listes de prescriptions en gestion, sans patient). Testé (2 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – P2 ter / P3 | Listes reliées aux dossiers (correction propagée aux dossiers, nouveaux noms dont diagnostics ajoutés par toute l'équipe ; règle `parametres/listes`, 8 tests) ; Google Agenda : chacun coche ce qui va dans son agenda (types de consultation, activités, cures / séances, RT, types de tâches) ; fonction `agendaFiltre`. Testé (règles 81/81, logique, navigateur 2 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 5 – P3 bis | Panne Google Agenda (« Invalid start time ») corrigée : heures normalisées, dates invalides écartées, événement refusé mis de côté sans bloquer (tests 60/60). Google Agenda, Lieux d'exercice et Accès déplacés du Profil vers Paramètres (13 onglets), Profil = informations seulement. Testé (2 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | 2 – Retouches | Fiche patient : « 2e téléphone » (après Téléphone), « Adresse » et « E-mail » (après Mutuelle), dans Nouveau patient, Modifier et Afficher ; 2e téléphone aussi dans le dossier ; mis en ligne (v2.js?v=20261008s). |
| 08/10/2026 | 5 – P4 Tâches | Tâches automatiques : 2 fixes (dosimétrie, fin de RT ; terminées toutes seules) + règles du médecin (dernière cure, non venu, nouveau patient, N mois après la RT, veille J1), activables, responsable et délai réglables ; fonctions `tachesAutoPatient` / `tachesAutoNuit` ; tâches du patient dans « Rendez-vous et tâches à venir » (+ Tâche). Tests logique 73/73, règles 85/85, navigateur, bilan 352 317 DH. Pas encore en ligne. |
| 08/10/2026 | 5 – P4 | Dosimétrie à valider : une tâche seulement (retirée de l'agenda, des 7 jours, du programme du jour, de Google Agenda). Tâche créée seulement du scanner à la 1re séance ; responsable des tâches fixes = médecin. Tests logique 75/75, bilan 352 317 DH. Pas encore en ligne. |
| 08/10/2026 | 6 – Salle d'attente (retouches + SA3) | Prix payé d'avance, libellés courts et centrés, fenêtre de prix après validation de cure / séance, anciennes chimio « Vu », statut de salle d'attente dans l'Agenda (Jour, Liste) et le tableau de bord. Règles 88/88, navigateur (secrétaire, médecin, bilan de référence inchangé). |
| 08/10/2026 | 6 – Salle d'attente (corrections) | Commentaire sur une consultation vue, stylo centré, anciens prix HCK en brut, seuils d'attente dans Paramètres › Alertes. Règles 90/90, navigateur, bilan de référence inchangé. |
| 08/10/2026 | 2 – Retouches (téléphone) | Pastille de la salle d'attente renommée (.pst) : elle déformait la ligne de dose de la radiothérapie, la chimio arrêtée et le statut des tâches ; boutons Afficher / Modifier / Tâche / RDV alignés ; consultations passées : libellé non recouvert par les badges. 390 px vérifié, bilan de référence inchangé. |
| 09/10/2026 | 7 – RCP | Paramètres › RCP (jours, heure, lieu, dates ajoutées / annulées), bouton « + RCP » du dossier (question, date d'inscription, prochaine RCP), onglet RCP des Tâches (calendrier des semaines, période, case Fait, impression), bulles Décision RCP / Valider / Fermer dans le dossier, inscriptions dans « Rendez-vous et tâches à venir ». Règles 116/116, navigateur (3 rôles, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 09/10/2026 | 5 – P4 Radiothérapie | Contourage ajouté au déroulé (scanner → contourage → dosimétrie → 1re séance) : étape et validation dans le dossier, tâche automatique « Valider le contourage », « Valider la dosimétrie » créée après le contourage, valider la tâche = valider dans le dossier. Tests logique 79/79, navigateur (dossier et tâche), bilan 352 317 DH. Pas encore en ligne. |
| 09/10/2026 | 8 – Numéro de dossier | AAAAMM + rang dans le mois (serveur, sans doublon), patients existants numérotés une fois, recherche par numéro / naissance, filtre par hôpital ; mis en ligne (fonctions + site v2.js?v=20261009n). |
| 09/10/2026 | 4 – F1 Plusieurs cabinets | Liste de ce que reçoit un cabinet neuf décidée ; compte d'administration séparé, page Administration (création d'un cabinet, liste sans données médicales) ; cabinet de la personne connectée (`comptes/{uid}`) ; règles : cabinets étanches, plus de pouvoir d'administratrice hors de son cabinet ; premier démarrage guidé ; ce qui était propre à Dr Bentahila retiré (ville du lieu sur le pli). Tests règles 143/143, cabinets 17/17, navigateur 18/18, bilan 352 317 DH. Mis en ligne (règles, 3 fonctions, site v2.js?v=20261009p). Modules par cabinet décidés (formules + retouches, nombre max de comptes par rôle, module retiré = caché) : prochaine session. (`test_cures` / `test_seances` échouaient déjà avant : à mettre à jour.) |
| 09/10/2026 | 4 – F1 compte d'administration | Compte d'administration = gbentahila@hotmail.fr (fiche `administrateurs/{UID}` ajoutée par Dr Bentahila ; sa propre fiche retirée : son cabinet n'en dépend pas, ses pouvoirs viennent de son e-mail). Règles : `administrateurs` et `utilisateurs` (profils) fermés au compte d'administration (tenus par Dr Bentahila seule). Règles 149/149, mises en ligne. |
| 09/10/2026 | 4 – F1 Administration | 1er cabinet créé par Dr Bentahila (Dr Gorbin) ; e-mail du mot de passe classé en indésirables → bouton « Lien du mot de passe » (WhatsApp). Liste des cabinets bloquée sur « Chargement… » → fonction réécrite. Suspendre / Réactiver / Supprimer un cabinet. Règles 155/155, navigateur, bilan 352 317 DH. Mis en ligne (fonctions, règles Firestore et Storage, site). |
| 09/10/2026 | 4 – F1 Administration | Liste des cabinets bloquée : la date de création du cabinet de référence est une date Firebase (pas un texte) → l'affichage plantait. Corrigé (serveur + page, test avec ce cas) et mis en ligne ; vérifié en direct : 4 cabinets listés (Dr Gorbin, Dr Zizi, référence, test-b1). |
| 09/10/2026 | 4 – F1 Modules par cabinet | Formules (Essentiel, Radiothérapie, Complet) + retouches module par module + maximums (médecins, secrétaires, infirmières, lieux, dossiers) depuis la page Administration ; modules retirés cachés (données gardées) ; cabinet de Dr Bentahila affiché comme cabinet normal. Tests cabinets 27/27, navigateur 33/33, bilan 352 317 DH. Mis en ligne (fonctions, site v2.js?v=20261009q). |
| 09/10/2026 | 4 – F1 Administration | Formules modifiables par l'administration (nom, modules, maximums ; nouvelle formule ; suppression si aucun cabinet ne l'utilise) : `plateforme/formules` (serveur seulement), fonction `formulesEnregistrer` (cabinets sans retouche mis à jour) ; « Modifier » un cabinet (nom, ville, adresse, téléphone, nom et téléphone du titulaire : `infosCabinet`). Maximum vide = sans limite, chiffre = bloqué, 0 = aucun. Tests cabinets 32/32, navigateur 38/38. Mis en ligne. |
| 09/10/2026 | 4 – F1 Administration | 8 formules proposées par spécialité (Oncologie : Essentiel / Pro / Clinique ; Radiothérapie : Essentiel / Pro / Centre ; Onco-radiothérapie : Pro / Clinique), spécialité modifiable ; page Administration refaite : onglets Cabinets (chiffres, recherche, filtres statut / spécialité, cartes) / Nouveau cabinet (spécialité → formule, aperçu) / Formules (par spécialité, barre d'enregistrement) ; réglages dans une fenêtre. Étape 14 ajoutée (autres spécialités). Tests 33/33, navigateur 44/44, bilan 352 317 DH. Mis en ligne. |
| 09/10/2026 | 9 – S1 Journal d'audit | Décidé : modifications, suppressions, ouvertures ; partie touchée sans valeurs ; titulaire seul ; tout gardé. Fonction `auditEcriture` (identité réelle, infalsifiable), `audit/{e}/lignes`, page Paramètres › Journal d'audit (filtres, export Excel), bouton Journal du dossier. Corrigé : lien direct vers un onglet du titulaire (Accès, Journal) qui retombait sur le 1er onglet. Règles 167/167, logique 25/25, navigateur 12/12 + 44/44, bilan 352 317 DH. Code sur GitHub (dépôt privé ritabentahila-alt/onco360). Pas encore en ligne. |
| 09/10/2026 | 9 – S1 en ligne, S2 Comptable | Journal d'audit mis en ligne. Rôle Comptable : relevé financier préparé par le médecin (nom + n° de dossier, actes, montants, sans diagnostic), pointage des paiements et versements, aucun dossier ouvert (règles), Bilan et Profil seulement. Règles 182/182, navigateur 13/13, bilan identique 352 317 DH. Pas encore en ligne. |
| 09/10/2026 | 9 – S2 en ligne, S3 Démo, référence | Comptable mis en ligne. Bibliothèque de référence mise de côté (plateforme/reference, mise à jour à la demande, onglet de l'Administration). Cabinet de démonstration : 8 patients fictifs, réinitialisable, badge. Tests démo 9/9 + 14/14, cabinets 44/44, comptable 13/13, bilan 352 317 DH. Mis en ligne (fonctions, site). |
| 10/10/2026 | Organisation, bibliothèques, équipe | Le cabinet du Dr Bentahila devient un cabinet comme les autres ; tout se gère depuis l'administration. Bibliothèques de référence par spécialité (Oncologie – Radiothérapie en place), modifiées depuis l'administration avec les écrans d'Onco360, listes de départ figées, copiées aux nouveaux cabinets selon la spécialité. Création des comptes de l'équipe par le serveur (Firebase refusait la création depuis le navigateur) + lien du mot de passe ; équipe visible dans l'Administration. Vocabulaire fixé (cabinet, équipe, module, formule, bibliothèque). Tests 19/19, 42/42, autres inchangés, bilan 352 317 DH. |
| 10/10/2026 | Paramètres et menus par spécialité | Paramètres de base mis de côté dans la bibliothèque Oncologie – Radiothérapie (repris une fois du cabinet du Dr Bentahila, nettoyés : ni correspondants, ni prix des consultations, ni absences, ni lieu de RCP), modifiables depuis l'Administration, copiés aux nouveaux cabinets. Onglet « Modules et menus » (modules communs, propres à une spécialité, prévus pour la médecine générale). Tests 21/21, 48/48, 44/44, bilan 352 317 DH. Mis en ligne. |
| 09/10/2026 | 5 – Tâches RT | Tâches contourage / dosimétrie en bandeau sur toute la période dans Google Agenda (champ `debut`), « Du … au … » dans la liste. Tests 85/85. Pas encore en ligne. |
| 09/10/2026 | Plan – Bilan | Demande notée : étape 15, « Règlements reçus » (virements et chèques des cliniques, date de réception) dans la page Bilan, hors bilan, pour la comptabilité ; questions à valider au début de l'étape. |
| 09/10/2026 | 15 – Bilan, règlements reçus | Cadre « Règlements reçus des cliniques » sous « Versements autres » (virements et chèques, date de réception, référence, banque, période concernée, encaissé le, note), hors bilan ; totaux par clinique et par mois, rappel des actes de la période pour information ; Excel et PDF ; comptable en lecture seule. `finances/reglements`, règles inchangées (+4 tests). Bilan 352 317 DH, 390 px, aucune erreur. Pas encore en ligne. |
| 09/10/2026 | 15 – Retouches | « Règlements reçus des cliniques et hôpitaux » ; sans les actes de la période ; virement sans date d'encaissement ; règlement hors période (05/05) désormais montré (période élargie) ; « KL » et ligne du détail des consultations retirés de la page Bilan. Bilan 352 317 DH, aucune erreur. Pas encore en ligne. |
