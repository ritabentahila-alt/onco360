# Audit du module Salle d'attente (10/10/2026)

Lecture complète de `public/js/app/salle.js` (532 lignes) et de ses liens (v2.js, chimio.js, agenda.js, règles `salle` /
`presence`), mesure avec un cabinet de 620 dossiers et 67 lignes dans la journée (jeu de test multiplié par 10).
Plan proposé à la fin : **à valider par Dr Bentahila** avant de commencer.

## 1. Bugs trouvés

| # | Problème | Conséquence quand la salle est pleine | Gravité |
|---|---|---|---|
| B1 | Chaque écriture **remplace toute la ligne** (`setDoc` sans fusion, depuis la copie de l'écran) | La secrétaire écrit un commentaire pendant que le médecin clique « Démarrer » : l'une des deux actions efface l'autre (commentaire perdu, ou patient renvoyé « En salle ») | Haute |
| B2 | **N° d'ordre** calculé sur l'écran (dernier n° + 1) | Deux personnes mettent en salle en même temps : deux patients ont le même numéro | Moyenne |
| B3 | Heures d'arrivée / début / fin prises sur **l'horloge de l'ordinateur** | Un ordinateur en retard de 10 min fausse l'attente vue par tous (attentes négatives ramenées à 0, ou gonflées) | Moyenne |
| B4 | La page garde **la date d'ouverture** | Écran laissé ouvert la nuit : le matin, la salle montre encore la veille (et l'écoute en direct suit la veille) | Moyenne |
| B5 | Badges « En salle · 12 min » de l'Agenda et du tableau de bord : **un calcul complet par badge** | 0,7 s de blocage à chaque affichage de l'Agenda ou du tableau de bord (67 badges) ; davantage sur un ordinateur ancien | Moyenne |
| B6 | La liste entière est **redessinée** à chaque action d'un collègue, toutes les 30 s, et chaque minute pour « Ouvert par » | Un clic peut tomber au moment du redessin et être perdu ; le défilement horizontal revient au début | Moyenne |
| B7 | Patient avec un rendez-vous **et** une séance de chimio le même jour = deux lignes | Il faut le « mettre en salle » deux fois ; il reçoit deux numéros | Faible |
| B8 | Séance de chimio reportée (dans « Absents ») : libellé long « Séance de chimiothérapie » | Colonne Type qui déborde (les autres lignes disent « Séance chimio ») | Faible |
| B9 | Impression : prix vide si les prix du patient ne sont pas encore chargés | Liste imprimée incomplète | Faible |
| B10 | Tri « urgent en tête » prévu mais aucune case Urgent n'existe encore | Sans effet (attend l'arrivée sans rendez-vous) | — |

Vérifié sans problème : droits (médecin, secrétaire, infirmière), règles de sécurité (90 tests), prix et Encaisser, report des
chimio, jours passés et à venir, téléphone 390 px, impression.

## 2. Ce qui manque pour 20 à 30 patients dans la journée

- **Lecture rapide** : une ligne fait 60 à 90 px (nom sur 2 lignes, badges, « Ouvert par ») : 30 patients = 2 à 3 écrans à faire
  défiler, et les titres de colonnes disparaissent en descendant.
- **Le médecin enchaîne** : aujourd'hui il revient à la salle, cherche le prochain, clique « Démarrer ». Un bouton
  « Patient suivant » ferait tout en un clic.
- **Prévenir** : rien n'avertit le médecin qu'un patient vient d'arriver, ni qu'une attente vient de passer au rouge.
- **Ordre de passage** : impossible de faire passer un patient avant un autre (urgence, patient fatigué, chimio qui attend).
- **Arrivée sans rendez-vous** (urgence, passage) : toujours à faire (prévu en SA2).
- **Fin de journée** : un patient resté « En salle » ou « En consultation » le soir n'est signalé nulle part ; il réapparaît
  seulement en « Non validé » si on revient sur ce jour.
- **Recherche** : par nom seulement (pas par n° de dossier ni téléphone).
- **Indicateurs** : attente moyenne et attente la plus longue du jour.
- **Plusieurs médecins** (vente à des cabinets de groupe) : pas de colonne ni de filtre « Praticien ».
- **Tests** : aucun test automatique de la salle d'attente dans le dépôt (seulement des scripts temporaires).

## 3. Plan proposé (une sous-étape par session)

**SA4 – Fiabilité (bugs B1 à B4, B8, B9)**
- Écrire seulement les champs modifiés (fusion), jamais toute la ligne : plus aucune action d'un collègue effacée.
- N° d'ordre sans doublon : compteur du jour par établissement, en transaction.
- Heures prises au serveur (heure de Firebase), affichées avec l'écart d'horloge corrigé.
- Passage de minuit : la salle passe toute seule au nouveau jour.
- Libellé court des séances reportées ; impression qui attend les prix.
- Tests des règles mis à jour.

**SA5 – Rapidité (B5, B6)**
- Lignes du jour calculées une fois et gardées tant que rien ne change (badges : 0,7 s → quelques millisecondes).
- Toutes les 30 s : seules les minutes d'attente changent (plus de redessin complet) ; « Ouvert par » mis à jour à part.
- Mise à jour ligne par ligne quand un collègue agit (le clic en cours et le défilement ne bougent plus).

**SA6 – Salle pleine (confort)**
1. Affichage **compact** (une ligne par patient) au choix, et **titres + onglets fixés** en haut pendant le défilement.
2. Bouton **« Patient suivant »** (médecin) : premier de la file → « En consultation » et ouverture du dossier.
3. **Un patient = une arrivée** : rendez-vous et séance de chimio du même jour mis en salle ensemble, un seul n°.
4. **Arrivée sans rendez-vous** (patient connu ou nouveau, motif, case **Urgent** en tête de file).
5. **Ordre de la file modifiable** (flèches monter / descendre).
6. **Messages à l'écran** : « Patient arrivé » (pour le médecin) et « Attente au rouge » (pour la secrétaire), réglables.
7. **Recherche** par nom, n° de dossier ou téléphone.
8. **Fin de journée** : bouton « Clôturer la journée » (liste des patients restés en salle, en consultation ou non validés)
   et alerte dans la cloche le lendemain s'il en reste.
9. **Attente moyenne / la plus longue** du jour, en tête de l'onglet « En salle ».
10. (Plus tard, avec les cabinets de groupe) colonne et filtre **Praticien**.

**SA7 – Tests automatiques**
- `tests/test_salle.py` dans le dépôt : parcours médecin / secrétaire / infirmière, prix, report, deux écrans en même temps.
- Calculs de la salle (lignes du jour, tri, période) déplacés dans `js/moteur/` et testés sans navigateur.

Ordre conseillé : **SA4 → SA5 → SA6 (points 1 à 4 d'abord) → SA7**. SA4 et SA5 ne changent rien à l'écran (sauf le libellé
B8) ; SA6 se choisit point par point.
