# Audit des écrans de l'Administration (10/10/2026)

Écrans revus, sur ordinateur (1300 px) et sur téléphone (390 px) :
- Cabinets (liste, fiche d'un cabinet, Modifier, Réglage du cabinet) ;
- Nouveau cabinet ;
- Par spécialité (Packs, fenêtre d'un pack, Bibliothèque et paramètres, Fiche patient, Formulaire de consultation) ;
- Modules.

Aucune erreur JavaScript. L'ensemble fonctionne, mais plusieurs textes sont périmés et la fenêtre de réglage est devenue trop longue.

## A. À corriger (erreurs, incohérences)

| # | Écran | Problème | Correction proposée |
|---|---|---|---|
| A1 | Cabinets | Votre cabinet affiche « Spécialité : — » et « Tout compris (sans formule) ». Il n'est pas compté dans Oncologie – Radiothérapie (3 cabinets au lieu de 4). | Le rattacher à Oncologie – Radiothérapie (pack « Onco-radiothérapie – Clinique », sans limite). |
| A2 | Nouveau cabinet | Le texte est écrit de votre point de vue de médecin (« vos patients, vos correspondants, votre profil »). Il parle de « la bibliothèque de protocoles » au lieu de la bibliothèque de la spécialité. Il renvoie à « sa carte » au lieu de « sa fiche ». | Réécrire le texte : ce que reçoit le cabinet = bibliothèque et paramètres de sa spécialité, fiche patient, formulaire de consultation. |
| A3 | Nouveau cabinet | Le choix « Spécialité : Toutes » ne sert à rien. | Choisir d'abord la spécialité, puis le pack. Afficher ensuite un résumé : modules, limites, ce qui est reçu. |
| A4 | Packs | Les limites sont mal accordées (« 1 médecins, 0 infirmières, 1 lieux »). Une limite absente n'apparaît pas du tout. | « 1 médecin · 0 infirmière · 1 lieu · patients sans limite ». |
| A5 | Packs | Les boutons rouges « Supprimer » passent à la ligne : les lignes n'ont pas la même hauteur. | Boutons sur une seule ligne ; « Supprimer » en petit lien rouge. |
| A6 | Fiche d'un cabinet | Le badge « Actif » touche la croix de fermeture. | Décaler le badge sous le nom. |
| A7 | Bibliothèque | Le mot « départ » sur les chiffres est incompréhensible. | Écrire « liste d'Onco360 » ou le nombre réel d'éléments. |
| A8 | Formulaire de consultation, fiche patient | Sur deux colonnes, l'ordre se lit mal (Consultation à gauche, Date, Titre, Note à droite). La liste des 7 types prend 6 lignes. | Une seule colonne dans l'ordre réel ; types résumés (« 7 types ») et visibles avec ✎. |
| A9 | Téléphone | L'onglet « Modules » est caché à droite, rien n'indique qu'on peut faire défiler. | Onglets qui passent à la ligne, ou menu déroulant sur téléphone. |

## B. À améliorer (confort d'utilisation)

| # | Écran | Proposition |
|---|---|---|
| B1 | Réglage du cabinet et d'un pack | La fenêtre est très longue : menu, cartes, onglets, bibliothèques, fiche, consultation, modules, limites. La découper en sous-onglets : **Modules et limites · Menu et tableau de bord · Paramètres et bibliothèques · Fiche et consultation**. |
| B2 | Réglage | Les « Modules et fonctions », le plus important, sont tout en bas. Les mettre en premier. |
| B3 | Réglage | Le bouton « Enregistrer » n'apparaît qu'en bas. Le garder toujours visible, avec « Modifications non enregistrées » et une confirmation si l'on ferme sans enregistrer. |
| B4 | Réglage du cabinet | Montrer ce qui est **retouché par rapport au pack**, avec une pastille « retouché » par bloc et « Revenir au pack » bloc par bloc. |
| B5 | Liste des cabinets | Trier par colonne. Ajouter les colonnes « Dernière activité » et « Fin d'abonnement » (voir C1). |
| B6 | Fiche d'un cabinet | Regrouper les actions : **Gérer** (Modifier, Réglage) · **Accès** (Lien du mot de passe, Renvoyer l'e-mail) · **Zone sensible** (Suspendre, Supprimer), à part et en rouge. |
| B7 | Bibliothèque et paramètres | « Ouvrir et modifier » quitte l'Administration sans prévenir. Prévenir, et ajouter un bouton « Retour à l'Administration ». Montrer aussi le résumé des paramètres de base (horaires, fériés, WhatsApp, tâches automatiques, RCP…), pas seulement les bibliothèques. |
| B8 | Messages | Après une fenêtre, le message « Enregistré » s'affiche en haut de la page, parfois hors de vue. Afficher plutôt un message flottant. |
| B9 | Modules | L'onglet est en lecture seule. Proposer de rattacher un module à une spécialité depuis cet onglet, ce qui prépare la 16.5. Séparer « Protocoles » de « Chimiothérapie » si vous le souhaitez. |

## C. À ajouter (pour vendre et suivre les abonnements)

| # | Proposition |
|---|---|
| C1 | **Abonnements** : prix de chaque pack (mensuel / annuel), début, échéance, état (payé, en retard, essai), date du dernier paiement, rappel avant échéance, suspension proposée après un retard. |
| C2 | **Tableau de bord de l'Administration** : chiffre d'affaires du mois, cabinets à renouveler, cabinets en retard, cabinets inactifs depuis 30 jours, nouveaux cabinets. |
| C3 | **Activité de chaque cabinet**, sans données médicales : dernière connexion, nombre de dossiers et de consultations du mois, comptes de l'équipe. |
| C4 | **Journal de l'Administration** : qui a créé, réglé, suspendu ou supprimé quel cabinet, et quand. |
| C5 | **Nouvelle spécialité** (16.5 déjà prévue) : copie ou vide, avec sa bibliothèque, ses packs, sa fiche et sa consultation. |

## Plan proposé

| Étape | Contenu | Durée | Décision à prendre avant |
|---|---|---|---|
| **17.1 Corrections** ✅ fait le 10/10 | A1 à A9 | 1 session | aucune |
| **17.2 Fenêtre de réglage** ✅ fait le 10/10 | B1 à B4 : sous-onglets, modules en premier, Enregistrer toujours visible, pastilles « retouché » | 1 session | aucune |
| **17.3 Cabinets** ✅ fait le 10/10 | B5, B6, B8, C3 : tri, actions regroupées, message flottant, activité de chaque cabinet | 1 session | aucune |
| **17.4 Abonnements** ✅ fait le 10/10 | C1, C2 : prix, échéances, paiements, tableau de bord | 1 à 2 sessions | prix des packs ; mensuel et / ou annuel ; essai gratuit (durée) ; délai avant suspension |
| **17.5 Journal de l'Administration** | C4 | ½ session | aucune |
| **16.5 Nouvelle spécialité** | C5, B7, B9 | 1 session | copie d'une spécialité ou vide |

Ordre conseillé : 17.1, puis 17.2, qui rendent l'outil plus sûr à utiliser tout de suite. Puis 17.4, nécessaire avant de vendre, et enfin 16.5.
