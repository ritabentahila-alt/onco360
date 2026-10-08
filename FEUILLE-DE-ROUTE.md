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
- [ ] **Mesurer la hauteur des en-têtes du papier** (ordonnance A5, ordonnance A4, papier A4 des documents) et la largeur
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
  - [ ] **D'abord : établir ensemble la liste exacte de ce que reçoit un nouveau cabinet.** Par exemple : les protocoles,
        les jours fériés marocains, la liste des diagnostics… mais **pas** la liste des correspondants de Dr Bentahila.
  - [ ] Inscription avec code, et création automatique du cabinet.
  - [ ] Onco360 ouvre le cabinet de la personne connectée (aujourd'hui, « cabinet-bentahila » est écrit dans le code).
  - [ ] Page « Administration » réservée à l'éditrice : codes, cabinets, abonnements, sans aucune donnée médicale.
  - [ ] **Gestion des licences (« Super Admin », demandé le 08/10)** : activer / désactiver l'accès d'un cabinet ou d'une
        clinique en un clic, clé de licence, date d'échéance de l'abonnement (accès bloqué ou en lecture seule après).
  - [ ] **Quotas selon la formule** (08/10) : ex. **Standard** = 1 établissement, 500 patients au maximum ; **Premium** =
        établissements et patients illimités. Limites imposées aussi par les règles du serveur. Formules et prix à décider.
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

# Demandes du 08/10/2026 (étapes 6 à 13)
Liste complète donnée par Dr Bentahila le 08/10, à faire **au fur et à mesure, une sous-étape par fenêtre**. Chaque étape
commence par ses questions « À décider » (Claude les pose avant d'écrire le code).

## Ordre proposé (à valider par Dr Bentahila ; elle peut le changer à tout moment)
1. Terminer l'en cours : Tâches T1 à T5 faites le 08/10 (T6 facultatif, plus tard).
2. **Étape 6 – Salle d'attente** (usage quotidien, le plus utile tout de suite).
3. **Étape 7 – RCP**.
4. **Étape 8 – Numéro de dossier et recherche des patients**.
5. **Étape 9 – Sécurité et conformité** (journal d'audit, rôles, mode démo) : indispensable avant de vendre.
6. **Étape 10 – Mode hors-ligne**.
7. **Étape 11 – Soins infirmiers, pharmacie, alertes**.
8. **Étape 4 – Plusieurs cabinets** (complétée ci-dessus : licences, quotas).
9. **Étape 12 – Dossier de cession, démo et guides**.
10. **Étape 13 – Interopérabilité** (la plus lourde, en dernier).

**Décidé le 08/10 : vendre des deux façons.** (a) **abonnements** (phase F, étape 4 : chaque cabinet paie, code
d'activation) ; (b) **cession** du logiciel à un éditeur ou une ESN (prix visé 120 000 à 180 000 DH, étape 12). Les
clients abonnés augmentent la valeur de la cession.

## Étape 6 – Salle d'attente (cabinet / clinique)
But : suivre en temps réel le passage des patients le jour J, de l'arrivée à la fin de la consultation.
Nouvelle page **« Salle d'attente »** dans le menu, **entre Agenda et Patients**.

**À décider au début de l'étape**
- Lien avec les statuts actuels des rendez-vous (Prévu, Venu, Non venu, Reporté) : proposition = on ajoute deux statuts
  intermédiaires **En salle d'attente** et **En consultation** ; **Terminé = « Venu »** (même fenêtre de prix, bilan
  inchangé) ; **Absent = « Non venu »**.
- Qui fait quoi : la secrétaire « Met en salle » ; le médecin « Démarre la consultation » ; qui passe à « Terminé » ?
- Patients sans rendez-vous (urgence, passage) : les ajouter directement en salle d'attente ?
- Séances de chimio et de radiothérapie : dans la salle d'attente aussi, ou seulement les consultations ?

**SA1 – Page et statuts**
- [ ] Page « Salle d'attente », **filtre par établissement** (la secrétaire ne voit que son centre), date du jour.
- [ ] **3 onglets** (avec leur nombre) : **À venir** (rendez-vous du jour pas encore arrivés) · **En salle d'attente**
      (la secrétaire a cliqué « Mettre en salle ») · **Vus** (le médecin a ouvert le dossier et validé : « Venu » / Terminé).
- [ ] Statuts : ⚪ Prévu → 🔵 En salle d'attente → 🟢 En consultation → Terminé (ou 🔴 Absent / Non honoré) — en pastilles
      de couleur au trait, pas d'émoticônes.
- [ ] **Poinçonnage** : l'heure exacte d'arrivée est notée au clic « Mettre en salle » (« Arrivé à 14 h 22 »), avec qui l'a fait.
- [ ] Colonnes : **heure du RDV**, **nom et prénom**, **motif** avec **badges de couleur** (nouveau patient, urgence, type
      de consultation, chimio / RT), **heure d'arrivée**, **temps d'attente** (compteur « En attente depuis 12 min »,
      orange puis rouge au-delà d'un seuil à choisir).
- [ ] Actions rapides : **Mettre en salle**, **Démarrer la consultation** (statut « En consultation » + ouvre le dossier),
      **Terminer** (= Venu, fenêtre de prix), **Absent**, **Annuler** (retour au statut précédent).
- [ ] Mise à jour **en temps réel** (sans recharger) sur tous les écrans du cabinet.
- [ ] Données : statut, heure d'arrivée, heure de début / fin et auteur gardés dans le rendez-vous (`rdvsJson`) ;
      règles de sécurité inchangées si possible. Statistiques plus tard (temps d'attente moyen).
- [ ] Tests : 3 rôles, 2 établissements, 390 px, bilan 352 317 DH.

**SA2 – Dans l'agenda et le tableau de bord**
- [ ] Le temps d'attente et le statut s'affichent aussi dans l'**Agenda** (vue Jour / Liste) et dans « Aujourd'hui » du
      tableau de bord, pour que le médecin voie d'un coup d'œil qui attend depuis combien de temps.
- [ ] **Consignes d'arrivée** (« Veuillez patienter dans votre véhicule… ») : message WhatsApp prêt, modèles dans
      Configuration › Messages.

## Étape 7 – RCP (réunion de concertation pluridisciplinaire)
**À décider** : une RCP par établissement ou une seule pour le cabinet ? Jour fixe (ex. chaque mardi) ou dates saisies
une par une ? Après le jour J : le dossier sort de la liste tout seul, ou reste « décision à saisir » tant que la décision
n'est pas écrite ? Que noter à l'inscription (question posée, documents à présenter) ?
- [ ] **Configuration › Dates de RCP** : jour de la semaine et heure (récurrence) et/ou dates une par une, par
      établissement ; dates annulées (fériés, absences).
- [ ] Dossier patient : bouton **« Inscrire en RCP »** → inscrit automatiquement à la **prochaine date de RCP** (date
      modifiable), avec la question posée ; visible dans le dossier **jusqu'au jour J** ; « Désinscrire ».
- [ ] **Liste des dossiers inscrits** : onglet **RCP** dans la page Salle d'attente (ou page à part, à décider), groupés par
      date de RCP, avec la question posée ; clic = dossier.
- [ ] Après la RCP : « Saisir la décision » → consultation de type **RCP** (déjà dans le menu des consultations) avec la
      décision ; le dossier sort de la liste.
- [ ] Fiche RCP imprimable (liste des dossiers du jour, pour la réunion) — à confirmer.
- [ ] Tests, 390 px, bilan 352 317 DH.

## Étape 8 – Numéro de dossier et recherche des patients
**À décider** : format exact. Proposition « **AAAAMM + numéro** » : 202610**001** = 1er patient créé en octobre 2026.
Le numéro repart-il à 001 chaque mois ? Un numéro par hôpital (préfixe HGC-, HCK-…) ou un seul compteur pour le cabinet ?
Les patients déjà enregistrés reçoivent un numéro selon leur date de création ?
- [ ] Numéro de dossier attribué automatiquement à la création (sans doublon, même si deux personnes créent un patient en
      même temps), jamais changé ; affiché en haut du dossier, dans la liste, sur la fiche chimio et les documents.
- [ ] Numéros donnés une fois aux patients existants.
- [ ] **Recherche** des patients par **nom, prénom, date de naissance, numéro de dossier** (dans la page Patients et la
      recherche rapide) ; filtre **par hôpital / établissement**.
- [ ] Tests, 390 px, bilan 352 317 DH.

## Étape 9 – Sécurité et conformité (obligatoire pour vendre)
**S1 – Journal d'audit (traçabilité)**
- [ ] Journal **infalsifiable** : qui a **consulté, modifié ou supprimé** quelle donnée, et quand. Les écritures sont notées
      par le serveur (fonctions Firebase déclenchées à chaque écriture : impossible à contourner) ; les **ouvertures de
      dossier** sont notées par l'application. Règles : on peut **ajouter** une ligne, jamais la modifier ni l'effacer.
- [ ] Page « Journal d'audit » (médecin titulaire seulement) : filtres par personne, patient, date, action ; export.
- [ ] Durée de conservation à décider (avec le juriste). Volume et coût à surveiller (une ligne par ouverture de dossier).
**S2 – Rôles et droits affinés**
- [ ] Nouveau rôle **Comptable** : volet financier seulement (bilan, encaissements, tarifs), aucune donnée médicale.
- [ ] Infirmière : constantes et administrations (voir étape 11) ; médecin : accès complet. Vérifier que chaque droit de la
      grille est aussi imposé par les **règles du serveur** (pas seulement masqué à l'écran).
- [ ] Rôle **Pharmacien** si l'étape 11 (PUI) est faite.
**S3 – Mode démo (anonymisation)**
- [ ] Bouton **« Mode démo »** (médecin) : noms, prénoms, téléphones, dates de naissance, photos **remplacés à l'écran**
      par des faux (« Patient Test 12 ») ; rien n'est modifié dans la base ; bandeau « MODE DÉMO » ; impressions bloquées
      ou anonymisées.
- [ ] Mieux encore pour les démonstrations : un **cabinet de démonstration** séparé rempli de faux patients (étape 12).

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
| 08/10/2026 | Documents du dossier | Onglet Documents : dépôt de fichiers (PDF, Word, photos…) avec titre, date et type, liste récente d'abord, recherche et filtre par type, ouvrir / télécharger / modifier / supprimer ; types de documents dans Configuration › Documents ; Cloud Storage activé (Europe) et règles publiées. Testé (médecin, secrétaire, infirmière, 390 px, bilan 352 317 DH). Pas encore en ligne (avec la salle d'attente, après accord). |
| 08/10/2026 | Doc. et ligne libre | Bouton « Doc. » (documentation PDF du cabinet à remettre aux patients, régimes déplacés de Courriers, recherche, catégories, tri, remis noté dans la consultation, médecin seul gère) ; ligne libre avec suggestions de la liste. Testé (médecin, secrétaire, 390 px, bilan 352 317 DH). Pas encore en ligne. |
| 08/10/2026 | Mise en ligne commune | Documents du dossier, bouton Doc., ligne libre avec suggestions et Salle d'attente mis en ligne (règles Firestore et stockage, fonction prixConsultation, site v2.js?v=20261008m), sur l'accord de Dr Bentahila. |
