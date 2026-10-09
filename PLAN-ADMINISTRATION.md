# Onco360 – Plan de l'administration par spécialité (10/10/2026) — étape 16 de la feuille de route

Demande de Dr Bentahila (10/10/2026) : tout gérer depuis le compte d'administration, **par spécialité** :
- choisir **module par module** ce qu'a une spécialité (boutons **+** / **−**, « Ajouter un module », **flèches** pour l'ordre du menu) ;
- dans un module, choisir **fonction par fonction** ce qui est présent ;
- idem pour les **paramètres** (ajouter / retirer une section de paramétrage) et les **bibliothèques** (mettre / ne pas mettre) ;
- regrouper **Formules**, **Modules et menus**, **Bibliothèques et paramètres** dans un seul onglet **« Par spécialité »** ;
- les **cabinets en liste** (lignes), pas en cartes ;
- un onglet qui **liste les bibliothèques**.

Ce document : **1. inventaire** de tout ce qui existe aujourd'hui ; **2. organisation proposée** ; **3. ce qui se règle dans
l'administration / ce qui demande du code** ; **4. étapes** ; **5. questions à valider** avant de commencer.

---

## 1. Inventaire : tout ce qu'Onco360 sait faire aujourd'hui

### 1.1 Toujours présents (toutes spécialités, toutes formules)
| Partie | Fonctions |
|---|---|
| **Tableau de bord** | Aujourd'hui (programme du jour, statut salle d'attente) · Les 7 prochains jours (bouton WhatsApp) · Mes tâches · Conflits (rendez-vous pendant une absence / un férié) · Statistiques · « Pour commencer » (cabinet neuf) · cloche des alertes |
| **Patients** | Liste, recherche (nom, prénom, naissance, n° de dossier), filtre par hôpital · création d'un patient · n° de dossier AAAAMM + rang (serveur) |
| **Dossier patient** | Identité et fiche (Afficher / Modifier) · résumé du patient · « Rendez-vous et tâches à venir » · onglet **Consultation** (journal des consultations, nouvelle consultation, ordonnances notées) · « Dossier ouvert par » · bouton Journal (titulaire) |
| **Paramètres** | page des réglages du cabinet (sections : voir 1.3) |
| **Profil** | nom, titre, spécialité, INPE, photo, signature, téléphone, mot de passe |

### 1.2 Modules (selon la formule)
| Module | Spécialité | Ce qu'il ajoute | Fonctions à l'intérieur (candidates à « + / − ») |
|---|---|---|---|
| **Agenda / Rendez-vous** | toutes | menu Agenda | vues Liste / Jour / Semaine / Mois · filtre par établissement · rendez-vous (types, durée, motif) · Venu / Non venu / report · rappel WhatsApp · horaires grisés · absences et fériés |
| **Salle d'attente** | toutes | menu Salle d'attente | À venir / En salle / Vus / Absents · Mettre en salle, Démarrer, Valider, Absent · prix payé d'avance · n° de passage · commentaire du jour · temps d'attente (orange / rouge) · colonnes au choix · bulles dans le dossier |
| **Tâches** | toutes | menu Tâches, « + Tâche » | Mes tâches / Toutes · types de tâches · urgent, échéance · fil (historique, commentaires) · réattribuer · **tâches automatiques** · échéances dans Google Agenda |
| **RCP** | toutes (demande Tâches) | « + RCP », onglet RCP des Tâches | inscription (question, date) · calendrier des semaines · Fait / décision (consultation « RCP ») · impression de la liste |
| **Prescriptions** | toutes | boutons du dossier | Médic. · Examens compl. · Ordo. type · Analyses (et bilans) · Courriers · Doc. (documentation remise) · ordonnance A5 / A4 modifiable · impression · antécédents (▾) |
| **Documents** | toutes | onglet Documents | dépôt de fichiers (PDF, images, 25 Mo) · types de documents · pli confidentiel, compte rendu, rendez-vous RT (avec la radiothérapie) |
| **Google Agenda** | toutes | Paramètres › Google Agenda | « Lier mon Google Agenda » (par personne) · ce que chacun y voit · couleurs par catégorie |
| **Listes** | toutes | Paramètres › Listes | diagnostics · mutuelles · correspondants (propres au cabinet) |
| **Bilan** | toutes | menu Bilan | périodes, filtres · payé / à recevoir, « payé auto. » · versements · référents · RT prévisionnelles · exports Excel / PDF · relevé du comptable |
| **Chimiothérapie et protocoles** | Oncologie – Radiothérapie | menu Protocoles, onglet Chimiothérapie | lignes de traitement (menus en cascade) · cures J1 / J8 / J15 en fenêtre · doses (Mosteller, Cockcroft-Gault, Calvert) · % et doses par séance · molécules ajoutées / retirées · report · fiche chimio A4 · planning hôpital de jour · administrations (infirmière) · bibliothèque de protocoles |
| **Radiothérapie** | Oncologie – Radiothérapie | onglet Radiothérapie | prescription (acte, séances, VMAT) · scanner → contourage → dosimétrie → 1re séance → fin · consultations hebdomadaires · tâches fixes (contourage, dosimétrie, fin) · pli, compte rendu, rendez-vous · tarifs des actes RT |
| *Traitements et stocks* | *Médecine générale (prévu)* | — | à décider |
| *Matériel et consommables* | *Médecine générale (prévu)* | — | à décider |

### 1.3 Sections de paramétrage (page Paramètres)
| Section | Partagée par la spécialité ? | Contenu |
|---|---|---|
| Créneaux & horaires | oui | plages par jour (et par établissement : propre au cabinet) |
| Fermetures, congés & jours fériés | fériés : oui · absences : non | jours fériés, absences du médecin |
| Lieux d'exercice | **non** (propre au cabinet) | établissements, logos, ville |
| Accès | **non** | équipe, droits, lien du mot de passe |
| Journal d'audit | **non** | qui a fait quoi (titulaire) |
| WhatsApp | oui | messages de rappel par type |
| Google Agenda | couleurs : oui · liaison : non | couleurs, liaison personnelle |
| Documents | oui | types de documents |
| Tâches | oui (responsables → titulaire) | types de tâches, tâches automatiques |
| RCP | jours, heure : oui · lieu, dates : non | jours de RCP, heure, lieu, dates ajoutées / annulées |
| Listes | diagnostics, mutuelles : oui · correspondants : **non** | listes des fiches patients |
| Bibliothèques | oui | gestion des listes de prescription et de la documentation |
| Impression | oui | marges A5 / A4 / documents |
| Alertes | oui | délais des alertes, WhatsApp, salle d'attente |
| Activités et rémunérations | tarifs RT : oui · prix des consultations : **non** | tarifs par établissement, actes RT, VMAT |

### 1.4 Bibliothèques (copiées dans chaque cabinet neuf)
Protocoles de chimiothérapie · Médicaments · Ordonnances types · Analyses · Bilans biologiques · Examens complémentaires ·
Courriers · Documentation (Doc.) · Diagnostics · Mutuelles. (Correspondants : jamais.)

### 1.5 Équipe, rôles, droits
Rôles : **médecin**, **secrétaire**, **infirmière**, **comptable** (bilan seulement). Grille de droits par membre : identité, fiche
patient, rendez-vous, voir les consultations, écrire consultations et ordonnances, documents, planning de l'hôpital de jour,
chimiothérapie (non visible / voir / modifier), radiothérapie (non visible / patients sous chimio / tous / modifier), prix à
encaisser, créer / supprimer un patient, finances, paramètres. Comptes créés par le titulaire (serveur), lien du mot de passe.

### 1.6 Transversal (pas des modules : toujours là, ou techniques)
Plusieurs cabinets étanches · formules et limites · suspension / suppression · cabinet de démonstration · journal d'audit
infalsifiable · numéro de dossier · sauvegardes (Firebase chaque nuit, Drive) · Google Agenda par personne · WhatsApp ·
alertes · impression A4 / A5 · téléphone (390 px).

### 1.7 Administration aujourd'hui (onglets)
Cabinets (cartes) · Nouveau cabinet · Formules · Modules et menus (lecture) · Bibliothèques et paramètres (ouvrir la bibliothèque
de la spécialité dans Onco360).

---

## 2. Organisation proposée

### 2.1 Les onglets de l'administration
1. **Cabinets** : **liste** (une ligne par cabinet : nom, ville, médecin, spécialité, formule, statut, équipe, dossiers, créé le),
   recherche et filtres en haut ; un clic sur la ligne ouvre la **fiche du cabinet** (fenêtre : informations, équipe, formule et
   modules, mot de passe, suspendre / supprimer). « + Nouveau cabinet » en haut de la liste (plus d'onglet à part).
2. **Par spécialité** (regroupe Formules, Modules et menus, Bibliothèques et paramètres) : à gauche la liste des spécialités
   (Oncologie – Radiothérapie, Médecine générale, Gynécologie, « + Nouvelle spécialité ») ; à droite, pour la spécialité choisie,
   4 sous-onglets :
   - **Menu et modules** : la liste ordonnée des modules de la spécialité ; pour chacun **↑ ↓** (ordre du menu), **−** (retirer),
     un **interrupteur par fonction** (ex. Tâches : ☑ tâches automatiques, ☑ commentaires ; Salle d'attente : ☐ prix payé
     d'avance) ; en bas **« + Ajouter un module »** (les modules disponibles du catalogue, communs ou d'une autre spécialité).
   - **Paramètres** : la liste des sections de paramétrage de la spécialité (**+ / −**, et dans une section ce qui est inclus) ;
     bouton « Ouvrir et modifier les valeurs » (écrans d'Onco360, comme aujourd'hui).
   - **Bibliothèques** : la liste des bibliothèques de la spécialité (**+ / −** : ex. pas de Protocoles en médecine générale),
     avec le nombre d'éléments et « Ouvrir et modifier ».
   - **Formules** : les formules de la spécialité (Essentiel, Pro, Clinique…), chacune = une **partie** des modules et fonctions de
     la spécialité + les maximums ; + / − / ↑ ↓ ; « + Nouvelle formule ».
3. **Bibliothèques** : la **liste de toutes les bibliothèques** de toutes les spécialités (une ligne par bibliothèque : spécialité,
   type, nombre d'éléments, dernière modification, « Ouvrir »), avec recherche.
4. **Démonstration** (ou dans Cabinets) : le cabinet de démonstration, réinitialiser.

### 2.2 Comment Onco360 l'applique dans chaque cabinet
Un cabinet a une **spécialité** et une **formule**. À l'ouverture, Onco360 lit :
- le **menu** de la spécialité (ordre des modules) ∩ les modules de la formule ∩ les retouches du cabinet (« sur mesure ») ;
- les **fonctions** activées de chaque module (ex. sans « tâches automatiques », la section disparaît des Paramètres et le serveur
  ne crée plus ces tâches pour ce cabinet) ;
- les **sections de paramétrage** et les **bibliothèques** de la spécialité (les autres sont cachées).
Une fonction retirée est **cachée, ses données gardées** (comme pour les modules).

### 2.3 Où c'est rangé (technique)
- **Catalogue** (dans le code, `public/js/donnees/catalogue.js` + copie serveur) : tous les modules, leurs fonctions, les sections
  de paramétrage, les types de bibliothèques, avec leur nom et leur description. C'est la liste de ce qui **existe**.
- **Spécialités** (`plateforme/specialites/{id}`, modifié par l'administration) : nom, menu ordonné [{ module, fonctions }],
  sections de paramétrage, bibliothèques, formules. C'est ce qui est **choisi**.
- **Cabinet** (`espaces/{e}.abonnement`) : spécialité, formule, retouches.
- Les valeurs des paramètres et le contenu des bibliothèques restent dans l'espace de la bibliothèque de la spécialité
  (`espaces/bib-…`), comme aujourd'hui.

---

## 3. Ce qui se règle dans l'administration / ce qui demande du code
| Dans l'administration (vous, sans moi) | Avec moi (code, puis mise en ligne pour tous) |
|---|---|
| ajouter / retirer un module **du catalogue** dans une spécialité, son ordre dans le menu | **créer un nouveau module** (ex. Traitements et stocks) : ses écrans, ses calculs |
| activer / désactiver une **fonction existante** d'un module | **créer une nouvelle fonction** ou modifier une fonction (ex. « modifie Tâches ») : s'applique à tous les cabinets qui l'ont |
| sections de paramétrage et bibliothèques d'une spécialité ; leurs valeurs et leur contenu | une **nouvelle section** de paramétrage ou un **nouveau type** de bibliothèque |
| formules, limites, cabinets, équipe (vue), suspension | |
| créer une spécialité (à partir d'une autre, ou vide) | les modules propres à cette spécialité |

« Ajouter un module » propose donc les modules **qui existent** ; un module « prévu » apparaît grisé tant qu'il n'est pas construit.

---

## 4. Étapes proposées (une par session, chacune testée et mise en ligne)
1. **Catalogue** : lister dans le code chaque module, ses fonctions (les « candidates » du tableau 1.2), les sections de
   paramétrage, les bibliothèques ; spécialité « Oncologie – Radiothérapie » créée à partir de l'existant (rien ne change pour les
   cabinets actuels).
2. **Onglet « Par spécialité »** : menu et modules (+ / − / ↑ ↓, fonctions), paramètres, bibliothèques, formules (regroupés).
3. **Onco360 applique la spécialité** : ordre du menu, fonctions cachées (écran et serveur : tâches automatiques, Google Agenda…),
   sections et bibliothèques de la spécialité ; tests sur les cabinets existants (bilan inchangé).
4. **Cabinets en liste** + fiche du cabinet en fenêtre ; **onglet Bibliothèques** (liste de toutes les bibliothèques).
5. **Nouvelle spécialité** (copie d'une autre ou vide) ; Médecine générale et Gynécologie créées vides, prêtes pour leurs modules
   (étape 14).

---

## 5. Décisions du 10/10/2026 (Dr Bentahila)
1. **Une seule spécialité « Oncologie – Radiothérapie »** (oncologie médicale, radiothérapie et onco-radiothérapie sont des
   **packs** de cette spécialité).
2. Les fonctions de la partie 1.2 conviennent. **Le tableau de bord aussi est réglable** : chaque carte (Aujourd'hui, 7 prochains
   jours, Mes tâches, Conflits, Statistiques…) peut être montée, descendue, mise ou retirée.
3. **Tout est réglable cabinet par cabinet** : ordre du menu, modules, fonctions, cartes du tableau de bord, sections de
   paramétrage, bibliothèques, limites. La spécialité propose des **packs** (ex. « pack avec tout », « pack sans … ») qui servent
   de **point de départ** ; on applique un pack à un cabinet, puis on le retouche à volonté (le cabinet devient « sur mesure »).
4. Liste des cabinets : nom, ville, médecin, spécialité, pack (formule), statut, équipe, nombre de dossiers, date de création.

Conséquence sur le modèle (§ 2.3) : un **réglage complet** (menu ordonné, modules, fonctions, cartes du tableau de bord, sections,
bibliothèques, maximums) a la même forme pour un **pack** et pour un **cabinet** ; appliquer un pack = copier son réglage dans le
cabinet ; l'écran « Réglage du cabinet » est le même que l'écran « Pack » (+ / − / ↑ ↓ partout).

## 5 bis. Questions posées le 10/10/2026 (réponses ci-dessus)
1. **Spécialités** : une seule spécialité « Oncologie – Radiothérapie » (avec, à l'intérieur, les formules Oncologie médicale,
   Radiothérapie, Onco-radiothérapie à plusieurs niveaux), ou trois spécialités séparées qui partagent la même bibliothèque ?
2. **Fonctions activables** : la liste des « candidates » du tableau 1.2 vous convient-elle ? (à retirer / ajouter)
3. **Ordre du menu** : réglé par spécialité (tous les cabinets de la spécialité ont le même ordre), ou aussi par cabinet ?
4. **Liste des cabinets** : colonnes souhaitées (proposées : nom, ville, médecin, spécialité, formule, statut, équipe, dossiers,
   créé le).
