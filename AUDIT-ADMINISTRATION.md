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
| **17.5 Journal de l'Administration** ✅ fait le 10/10 | C4 | ½ session | aucune |
| **16.5 Nouvelle spécialité** | C5, B7, B9 | 1 session | copie d'une spécialité ou vide |

Ordre conseillé : 17.1, puis 17.2, qui rendent l'outil plus sûr à utiliser tout de suite. Puis 17.4, nécessaire avant de vendre, et enfin 16.5.

---

# Audit n° 2 (10/10/2026, après les étapes 17.1 à 17.5)

Tous les écrans ont été revus avec des cabinets proches de la réalité : le vôtre, celui du Dr Gorbin sans abonnement réglé, et la démonstration.

## Corrigé tout de suite

- **Tuile « Cabinets »** : un clic efface tous les filtres. Avant, après un clic sur « En essai » (0), rien ne permettait de revenir à la liste complète, sauf le menu déroulant.
- **Liste vide** : bouton « Effacer les filtres ».
- **Bandeau** pour les cabinets sans abonnement réglé (« Non suivi » : jamais suspendus, hors revenu), avec « Les afficher ».
- **Activité** : « aucune » au lieu de « — » pour un cabinet où rien n'a encore été fait.
- **Revenu mensuel** : indiqué « HT ».

## Reste à améliorer

| # | Écran | Constat | Proposition |
|---|---|---|---|
| D1 | Cabinets | La carte « Créer le cabinet de démonstration » s'intercale entre les filtres et la liste. | La déplacer dans l'onglet Nouveau cabinet. |
| D2 | Cabinets | Les chiffres (activité, abonnements) sont lus une seule fois, à l'ouverture de la page. | Bouton « Actualiser » et heure de la dernière lecture. |
| D3 | Abonnements | Le prix est hors taxes, mais rien ne précise si un paiement reçu est HT ou TTC. | Montant TTC au paiement, HT et TVA calculés (voir comptabilité). |
| D4 | Abonnements | Un paiement ne produit ni reçu ni facture. | Facture numérotée (voir E3). |
| D5 | Fiche d'un cabinet | Il n'y a pas de coordonnées de facturation (raison sociale, ICE, adresse de facturation). | Bloc « Facturation » dans « Modifier ». |
| D6 | Sécurité | Le compte d'administration ne demande que son mot de passe. | Validation en deux étapes (code par SMS ou application) et alerte à chaque connexion. |
| D7 | Modules | L'onglet est en lecture seule ; « Protocoles » fait partie de la Chimiothérapie. | Séparer Protocoles si vous le souhaitez ; rattacher un module à une spécialité depuis cet onglet (avec la 16.5). |
| D8 | Journal | Il est vide avant le 10/10/2026. | Rien à faire (normal). |

## Nouvel onglet « Comptabilité » (proposé)

| # | Contenu |
|---|---|
| E1 | **Tableau de bord** : encaissé du mois et de l'année, à encaisser (échéances des 30, 60 et 90 prochains jours), impayés, répartition par pack et par moyen de paiement, évolution mois par mois. |
| E2 | **Encaissements** : tous les paiements de tous les cabinets, filtres (période, cabinet, moyen), **export Excel pour le comptable**. |
| E3 | **Factures** : numérotation continue (ex. F-2026-0001), facture A4 avec vos mentions légales et celles du cabinet (ICE…), HT, TVA, TTC, « payée le … », avoir si un paiement est retiré, envoi par WhatsApp ou e-mail. |
| E4 | **Relances** : cabinets en retard ou à renouveler, message WhatsApp prêt à envoyer, date de la dernière relance. |
| E5 | **Paramètres de l'éditrice** : raison sociale, forme juridique, ICE, IF, RC, patente, adresse, RIB, logo, TVA (assujettie ou non, taux), mentions de bas de facture. |

**Décisions à prendre avant E3 :**
- le statut juridique de l'éditrice d'Onco360 (société, auto-entrepreneur…) ;
- assujettie à la TVA ou non ;
- les prix affichés en HT ou en TTC ;
- le préfixe des factures.

## Plan proposé

| Étape | Contenu | Décision à prendre avant |
|---|---|---|
| **18.1 Finitions** ✅ fait le 10/10 | D1, D2, D5 | aucune |
| **18.2 Comptabilité : tableau de bord et encaissements** ✅ fait le 10/10 | E1, E2 (+ export Excel) | aucune |
| **18.3 Factures** | E3, E5, D3, D4 | statut juridique, TVA, HT/TTC, préfixe |
| **18.4 Relances** | E4 | aucune |
| ~~**18.5 Sécurité du compte d'administration**~~ abandonnée (10/10) | D6 | numéro de téléphone pour le code |
| **16.5 Nouvelle spécialité** | avec D7 | copie ou vide |

## Mise à jour du plan (10/10/2026, après la 18.2)

| Étape | Contenu | État |
|---|---|---|
| 18.3 Réglages des abonnements | Suspension « me demander » (par défaut), automatique ou jamais ; délais ; cabinet exclu ; prix TTC | ✅ fait |
| 18.4 Factures | Mon entreprise (mentions légales) ; facture à chaque paiement (F-AAAA-NNNN), avoir (AV-AAAA-NNNN) ; HT / TVA 20 % / TTC ; Comptabilité › Factures | ✅ fait |
| 18.5 Profil & Paramètres (Onco360) | Onglets Informations, Accès, Abonnement (demande de renouvellement ou de passage à l'annuel), Factures | à faire |
| 18.6 Relances | Retards et échéances, message WhatsApp prêt | à faire |
| 16.5 Nouvelle spécialité | Copie ou vide | à faire |
