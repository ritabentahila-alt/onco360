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
