# Audit des accès de la secrétaire (10/10/2026)

Test fait dans Onco360 avec un compte secrétaire de test (rôle « Assistante / secrétaire », droits par défaut du rôle,
rattachée au seul **HCK**), sur une copie du cabinet. Ce que l'écran permet a été comparé aux règles de sécurité du
serveur (`firestore.rules`, `storage.rules`). Aucune erreur JavaScript.

Attention : chaque membre a sa propre grille (Profil & Paramètres › Accès). Si la grille de votre secrétaire a été retouchée,
elle peut avoir moins de droits que ce qui suit.

## 1. Ce qu'elle peut faire

| Page | Ce qu'elle peut faire | Ce qu'elle ne peut pas faire |
|---|---|---|
| Tableau de bord | Voir les rendez-vous, cures et radiothérapies des 7 prochains jours **de ses lieux** ; boutons WhatsApp ; conflits avec les absences ; statistiques | — |
| Agenda | Voir (ses lieux), créer, modifier, déplacer un rendez-vous ; Venu / Non venu (avec le prix) | Annuler un statut posé par le médecin |
| Salle d'attente | Tout : mettre en salle, démarrer, valider (= Venu), absent, prix payé d'avance, commentaire, colonnes | — |
| Patients | Liste des patients de ses lieux ; créer un patient | Supprimer un patient ; changer l'hôpital d'un patient |
| Dossier – en-tête | Modifier l'identité et la fiche (poids, taille, diagnostic, allergies, antécédents, mutuelle, correspondant…) ; + Tâche ; + Rendez-vous | Modifier le **résumé du patient** (lecture seule) |
| Dossier – Consultation | Lire, créer et modifier toutes les consultations | Supprimer une consultation créée par le médecin |
| Prescriptions (Médic., Ordo. type, Analyses, Examens compl., Courriers) | Préparer, modifier, renouveler, imprimer, supprimer une ordonnance ; ajouter les éléments **des listes** ; ligne libre (sauf Médic.) | Modifier les bibliothèques : ajouter un médicament à la liste, créer une ordonnance type, un modèle de courrier, mettre en favori |
| Doc. | Remettre une fiche au patient | Ajouter une fiche à la documentation |
| + RCP | Inscrire, modifier, cocher « Fait » ; désinscrire ce qu'elle a inscrit | Désinscrire une inscription du médecin |
| Chimiothérapie | Voir lignes, cures et doses ; **déplacer / reporter une cure** | Modifier doses, protocoles, molécules |
| Radiothérapie | Voir la carte ; pli confidentiel, compte rendu de fin, rendez-vous RT (ouvrir, modifier, imprimer) | Modifier la radiothérapie (scanner, contourage, dosimétrie, fin) |
| Documents | Voir, déposer, renommer ; supprimer ce qu'elle a déposé | Supprimer un document déposé par le médecin |
| Prix | Voir le prix des consultations validées et de la consultation de chimio, fixer le prix au « Venu » | Voir honoraires, tarifs, bilan |
| Tâches | Créer ; voir celles qu'elle a créées ou qu'on lui a confiées ; commenter, réattribuer ; onglet RCP | Voir les tâches des autres |
| Protocoles | Consulter | Modifier |
| Paramètres | **Tout voir en lecture seule** (12 onglets) ; relier **son** Google Agenda et choisir ce qui y apparaît | Modifier quoi que ce soit d'autre |
| Profil & Paramètres | Ses informations (photo, téléphone, mot de passe) | Accès de l'équipe, abonnement, factures |
| Bilan, Journal d'audit | — | Aucun accès |

## 2. Problèmes trouvés

| # | Où | Problème |
|---|---|---|
| S1 | Médic. | Pas de « Ligne libre » dans la fenêtre Médicaments, et pas de « Nouveau médicament » pour elle : un médicament absent de la liste ne peut être ajouté qu'à la main sur la feuille. C'est ce que vous avez vu. |
| S2 | Documents | Avec les droits par défaut, « Ajouter un document » marche dans le test. Si elle ne peut pas déposer chez vous : vérifier dans Profil & Paramètres › Accès que la case **Documents** est cochée pour elle, et me dire le message affiché. |
| S3 | Paramètres › Lieux d'exercice | Elle voit les 3 lieux du Dr Bentahila (CIOC, HCK, HGC) au lieu du sien seulement (HCK). |
| S4 | Paramètres › WhatsApp | L'exemple affiché prend le CIOC (pas son lieu) ; elle ne peut pas régler le bouton vert alors que c'est elle qui envoie les messages. |
| S5 | Paramètres › Fermetures et congés | Elle voit les absences du cabinet, sans choix du médecin, et ne peut pas en saisir. |
| S6 | Paramètres › Créneaux et horaires | Elle voit bien seulement HCK, mais sans choix du médecin. |
| S7 | Profil | Champs de médecin inutiles pour elle : titre Dr / Pr, spécialité, INPE, signature. |
| S8 | Paramètres | 12 onglets en lecture seule ; plusieurs ne la concernent pas. |

## 3. Le point à décider : « ses médecins »

Aujourd'hui, Onco360 n'a **pas de notion de médecin à l'intérieur d'un cabinet** : horaires, absences, messages WhatsApp,
types de documents et de tâches, RCP, listes, bibliothèques, impression et alertes appartiennent **au cabinet**, donc au
médecin titulaire. Les rendez-vous ne sont pas rattachés à un médecin. Et un compte secrétaire n'ouvre **qu'un seul
cabinet**.

Pour qu'elle choisisse un médecin dans un menu déroulant, il faut d'abord choisir l'une de ces deux organisations :
- **A. Plusieurs médecins dans le même cabinet** : horaires, absences, etc. par médecin ; chaque rendez-vous rattaché à un
  médecin ; agenda filtrable par médecin.
- **B. Une secrétaire pour plusieurs cabinets** (chaque médecin a son propre cabinet Onco360) : un compte secrétaire relié à
  plusieurs cabinets, avec un menu « Cabinet du Dr … » pour passer de l'un à l'autre.

## 4. Décisions (10/10/2026) et suite

- Organisation retenue : **B, une secrétaire pour plusieurs cabinets** (étape 19.2, à faire).
- Médicament absent : ligne libre dans Médic. **et** ajout à la liste par la secrétaire.
- Elle modifie : fermetures et congés, créneaux et horaires de ses lieux, listes, types de tâches et de documents, bouton
  WhatsApp vert. Le reste en lecture seule.

**Fait le 10/10 (19.1)** : S1, S3, S4, S7, et le nouveau droit « Paramètres du secrétariat » (grille Accès, oui par défaut pour
la secrétaire). S2 : à vérifier chez vous (case Documents de sa grille). S5 / S6 : chaque médecin aura ses réglages dans son
cabinet ; le menu « Cabinet du Dr … » (19.2) servira de choix du médecin. S8 : reste à voir après 19.2.

**Complété le 10/10** : elle modifie aussi les jours fériés, les messages WhatsApp, tout l'onglet RCP, l'impression, les alertes et
le temps d'attente de la salle ; elle valide le poids de la séance de chimio prévue du jour. Google Agenda : choix par médecin
avec 19.2.

**19.2 fait le 10/10** : une secrétaire peut travailler pour plusieurs cabinets (menu « Cabinet » sous le logo, qui sert de choix du
médecin pour tous les paramètres) ; un seul Google Agenda pour tous ses cabinets, avec ses cases par cabinet et ses propres couleurs.

---

# Audit n° 2 : tout ce qui concerne la secrétaire (10/10/2026, après 19.1 et 19.2)

Parcours refait en secrétaire (compte limité à HCK, puis compte de deux cabinets) : tableau de bord, agenda, nouveau rendez-vous,
salle d'attente, nouveau patient, dossier (consultation, prescriptions, documents, chimio, radiothérapie, RCP), tâches, cloche,
Paramètres, Profil, menu « Cabinet », téléphone 390 px. Aucune erreur JavaScript. Ce qui a été fait aujourd'hui fonctionne.

## A. À corriger

| # | Où | Problème | Correction proposée |
|---|---|---|---|
| A1 | Paramètres › Listes | Une secrétaire limitée à un lieu qui corrige un nom (ex. un correspondant) ne corrige que les dossiers de son lieu : les autres gardent l'ancien nom. | Correction des dossiers faite par le serveur, pour tout le cabinet. |
| A2 | Cloche | Ses alertes sont celles du médecin (cure non validée, dosimétrie à valider, dernière cure…) : elle ne peut rien en faire. | Alertes selon le rôle (voir C9). |
| A3 | Tableau de bord | « Bonjour Secretaire » : le nom de famille au lieu du prénom. | « Bonjour Salma » pour qui n'est pas médecin. |
| A4 | Paramètres › Lieux d'exercice | Lecture seule, alors que c'est elle qui connaît l'adresse et le téléphone du lieu (repris dans les messages WhatsApp, {adresse}). | Elle complète l'adresse et le téléphone de son lieu (pas le nom ni le code). |
| A5 | Nouveau patient | Pas de champ CIN ni de numéro d'affiliation à la mutuelle, utiles pour les prises en charge. | Deux champs de base dans la fiche patient (réglables comme les autres). |

## B. À améliorer (confort)

| # | Où | Proposition |
|---|---|---|
| B1 | Nouveau rendez-vous | Montrer les **créneaux libres** du jour choisi (horaires du lieu, durée, rendez-vous déjà pris) : un clic sur un créneau remplit l'heure. |
| B2 | Nouveau rendez-vous | Prévenir d'une **double réservation** (un autre patient à la même heure). |
| B3 | Nouveau rendez-vous | Bouton « Nouveau patient » dans la fenêtre (aujourd'hui : « créez d'abord son dossier »), puis retour au rendez-vous. |
| B4 | Après un rendez-vous | Proposer d'**envoyer la confirmation par WhatsApp** tout de suite. |
| B5 | Rappels WhatsApp | Marquer le rappel **envoyé** (« ✓ envoyé par Salma à 10 h ») ; carte « Rappels à envoyer » (demain, après-demain) avec ceux déjà faits. |
| B6 | Documents | Déposer **plusieurs fichiers d'un coup** (aujourd'hui un par un). |
| B7 | Page d'accueil | Ouvrir Onco360 sur la page choisie par chacun (ex. Salle d'attente ou Agenda pour la secrétaire). |

## C. À ajouter

| # | Sujet | Proposition |
|---|---|---|
| C1 | Caisse | **Mode de paiement** à la validation (espèces, carte, chèque, virement, mutuelle / tiers payant). |
| C2 | Caisse | **Reçu / note d'honoraires** imprimable pour le patient (nom du médecin, INPE, acte, montant, date, mode). |
| C3 | Caisse | **Caisse du jour** : total par mode de paiement, liste des encaissements, impression pour la remise au médecin ; « reste à payer » d'un patient. |
| C4 | Sécurité médicale | Poids validé par la secrétaire très différent du précédent (seuil à choisir, ex. 5 %) : alerte et tâche au médecin pour vérifier les doses. |
| C5 | Sécurité médicale | Ordonnance, courrier ou certificat **préparé par la secrétaire** : marqué « préparé par … », avec une tâche « à signer » pour le médecin (ou validation avant impression : à choisir). |
| C6 | Plusieurs cabinets | Pastilles **par cabinet** dans le menu « Cabinet » (tâches, salle d'attente) pour voir qu'il se passe quelque chose chez l'autre médecin. |
| C7 | Plusieurs cabinets | Vue **« Tous mes cabinets »** pour la journée : rendez-vous et salle d'attente des deux médecins sur une seule page. |
| C8 | Guide | **Guide de la secrétaire** (à intégrer au guide complet, étape 12 / F3). |
| C9 | Cloche | Alertes de la secrétaire : rappels WhatsApp à envoyer, patient sans téléphone avec un rendez-vous, rendez-vous pendant une absence, consultation « Venu » sans prix, document de radiothérapie à préparer. |

## Plan proposé (une session chacune)

| Étape | Contenu | Pourquoi d'abord |
|---|---|---|
| **19.3 Corrections** | A1 à A5 | petites, sans décision |
| **19.4 Agenda du secrétariat** | B1 à B5, B7 | ce qu'elle fait le plus souvent |
| **19.5 Caisse** | C1 à C3 | argent encaissé au cabinet, traçable |
| **19.6 Sécurité médicale et alertes** | C4, C5, C9 (et A2) | le médecin garde la main sur ce que prépare la secrétaire |
| **19.7 Plusieurs cabinets, confort** | C6, C7, B6 | utile dès qu'une secrétaire a deux médecins |
| (avec l'étape 12) | C8 guide de la secrétaire | quand les écrans sont stables |

Questions à trancher avant 19.5 et 19.6 :
1. Modes de paiement à proposer, et faut-il un numéro sur chaque reçu ?
2. Seuil d'alerte pour le poids (5 % ?).
3. Ce que prépare la secrétaire (ordonnance, certificat) : simple marque + tâche au médecin, ou impression bloquée tant que le médecin n'a pas validé ?
4. Page d'accueil de la secrétaire par défaut : Salle d'attente, Agenda ou Tableau de bord ?
