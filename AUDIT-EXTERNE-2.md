# Onco360 – Audit externe n° 2 : plan de travail (11/10/2026)

Source : dossier Drive « Audit » (5 documents : Audit numéro 2, Modules, Fichiers et code, Fonctions, Essais et mesures), audit
fait par le Claude d'un autre compte sur la version **da85b72** du dépôt, avec 8 patients fictifs, sans données réelles.
Les annotations de Dr Bentahila dans ces documents sont reprises ici comme **décisions** (marquées « Décision RB »).

**Manque** : le document principal renvoie à un onglet « Design » (12 corrections, dont les impressions 1 à 3) qui n'est pas
dans le dossier Drive. À ajouter au dossier pour compléter le lot A3 et le lot F.

---

## 0. Ce qui est déjà réglé depuis la version auditée

La version auditée (da85b72) précède 21 enregistrements. Depuis :

| Constat de l'audit | État au 11/10/2026 |
|---|---|
| Bilan : montants en mémoire, changement d'hôpital, pointage perdu, pointages écrasés, acte sans tarif | **Corrigé** (15 bis B1-B2, en ligne) |
| Salle d'attente : en-têtes tronqués, ouverture sur un onglet vide, zones < 44 px, filtres, reçus sans numéro | **Corrigé** (SA9, en ligne) |
| Tableau de bord : trop long, carte d'abonnement, ordre réglé par l'administration, émojis | **Fait** (étape 22, pas encore en ligne) ; reste les **alertes cliniques** (seuils à choisir) |
| Agenda : séances sans heure, durée par lieu, médecin du rendez-vous, déplacer, vue Semaine sur téléphone | **Planifié** (étape 21, AG1 à AG5) ; ancien script d'agenda retiré (en cours) |
| Fiche patient réglable par chaque cabinet (Décision RB) | **Fait et en ligne** (`editeurfiche.js`, Paramètres › Cabinet, 20261011t) |
| Paramètres : trop d'onglets, « Profil & Paramètres » | **Fait et en ligne** (4 familles, « Mon compte », 20261011t) |

Vérifié dans le code actuel, **toujours présent** : CASABLANCA en dur (pli p. 2 et 3), « Casablanca » par défaut, liste des
167 correspondants dans `listes.js`, SheetJS 0.18.5 (faille connue), « Je soussignée » dans 4 courriers, protocole sans statut
= validé, prémédication reconnue par noms de marque, démonstration sans créatinine, cure non figée à la validation, tâches
automatiques de contourage / dosimétrie arrêtées à la 1re séance, suppression définitive d'un patient, photo dans le dossier,
anciens fichiers de l'ancienne application dans `public/`.

---

## 1. Vue d'ensemble : 8 lots, dans cet ordre

| Lot | But | Sessions | Critère de fin (vérifiable) |
|---|---|---|---|
| **A** Assainir | Retirer l'inutile et ce qui est propre au 1er cabinet, tests sans données réelles | 4 | Site sans erreur ; tests (doses compris) lancés sans `seed.json` ; essais 6, 7, 9, 10 non reproduits |
| **B** Sécuriser les actes | Figer ce qui est validé, refuser l'aberrant | 4 | Essais 1 à 5, 8 et 11 non reproduits |
| **C** Dossier oncologique | Fiche tumeur, allergies, statut, modèle de consultation | 3 | Liste des patients filtrable par localisation et par stade |
| **D** Radiothérapie | Volumes, rythmes, toxicités, compte rendu rempli | 3 | Compte rendu de fin d'un traitement terminé sans aucune mention « à compléter » |
| **E** Chimiothérapie | Bilan avant cure, toxicités, doses cumulées, infirmière | 4 | Une cure ne se valide plus sans bilan saisi ou dérogation tracée |
| **F** Ergonomie | Prescriptions, Paramètres, documents, bilan téléphone | 3 | Paramètres en 5 familles ; plus de croix rouge sur les lignes |
| **G** Montée en charge | Ne plus tout charger | 3 | 5 000 dossiers : une lettre dans la recherche < 0,1 s |
| **H** Geler | Ne plus étendre administration / autres spécialités | 0 | Décision notée |

Ordre recommandé : **A → B → C → D → E**, F intercalé quand une session est courte, G avant de vendre à un groupe (à 620
dossiers, l'application reste rapide). L'étape 9 (sécurité et conformité, premier audit) reste prioritaire si un point y est
encore ouvert.

---

## 2. Lot A – Assainir (sans changer le fonctionnement)

### A1 – Fichiers inutiles (1 session, avec A3)
- Supprimer du site : `ancienne-app.html` (454 ko, dossiers réels), `historique.html`, `js/pont.js`, `js/shim.js`,
  `js/ajustements.js`, `logo.png`, `modeles/cr-fin-rt.docx`, `modeles/pli-confidentiel.docx` (copies de `modeles/`).
- `app.html` → remplacé par une redirection dans `firebase.json` (`/app.html` → `/v2.html`, anciens favoris).
- Hors site : `construire.mjs` (écraserait le renvoi) ; `.claude/launch.json` → `.gitignore`.
- Retouches : règle d'en-tête `modeles/**` de `firebase.json` ; `PROPRIETAIRE` de `config.js` (vérifier qu'il ne sert plus) ;
  commentaire de `index.html` ; CLAUDE.md (lignes sur l'ancienne application) ; `modeles/LISEZMOI.md` (cite `remplirModele`,
  disparue).
- Règles `firestore.rules` des anciennes collections (lignes 11-22) : **gardées** tant que l'ancienne base n'est pas archivée.
- Ranger hors du code : `archives/`, `listes/` (dossier `sources/`), `apps-script/firebase-v7-deja-installe.gs` (après en
  avoir extrait les 4 fonctions reprises par `onco360-sauvegarde.gs`).
- Test : parcours complet médecin / secrétaire / infirmière / administration, zéro erreur, zéro requête en échec.
- **Question 1** : on retire l'ancienne application du site maintenant ? (ses données restent dans la base et les sauvegardes).

### A2 – Correspondants hors du code (1 session, avec A4)
- `COR0` (167 correspondants, 124 médecins nommés) sort de `public/js/donnees/listes.js` : écrit une fois dans
  `parametres/listes.cor` du cabinet Bentahila (par `migrations()`, titulaire), puis retiré du code ; cabinet neuf = liste vide
  (déjà le cas côté serveur).
- `functions/test-logique.js` : nom d'un vrai patient remplacé par un nom fictif.

### A3 – Traces du premier cabinet (avec A1)
| Trace | Correction |
|---|---|
| « CASABLANCA, le … » en dur (`documents.js` 75 et 80) | Ville du lieu, comme la page 1 |
| Ville « Casablanca » par défaut (`documents.js` 66, 133 ; `ordonnances.js` 479) | Ville du lieu, sinon « À REMPLIR » surligné |
| « Je soussignée » (`courriers.js` 24, 30, 34 ; `ordonnances.js` 500) ; badge « Absente » (`v2.js`) | Champ **civilité du médecin** (Dr homme / femme) dans le profil → « soussigné(e) », « Absent(e) » accordés |
| Hôpital « HGC » en repli (`moteur/tarifs.js` 18, `parametres.js` 89, `v2.js` 277) | Aucun repli : acte signalé « sans tarif » (déjà affiché par le bilan) — **bilan à revérifier** |
| Mutuelles sans la CNSS-AMO (loi 54-23, début 2027) | Ajouter « CNSS (AMO) » aux listes de départ (`listes.js` + `functions/listes-depart.json`, test de cohérence) |
| Fenêtres Analyses / Examens : « Aucun médicament choisi » | Libellé selon la famille (« Aucune analyse choisie »…) |
| Dates d'histoire (« 2026-10-07 », `FIN_PAYE_AUTO`) | Commentées ; `FIN_PAYE_AUTO` retiré au lot F |

### A4 – Bibliothèques externes
- SheetJS 0.18.5 (faille CVE-2023-30533) → **0.20.3**, et les 4 bibliothèques (jszip, html2canvas, mammoth, SheetJS) copiées
  **dans le site** (`public/vendor/`) au lieu d'être chargées depuis un serveur tiers : plus de panne extérieure.
- Firebase 10.12.2 et la connexion Google restent chargés de l'extérieur (normal).

### A5 – Tests autonomes, doses comprises (1 session) — **à faire avant le lot B**
- Jeu de test fictif construit par `functions/demo.js` (8 patients) à la place de `tests/seed.json` pour tous les tests
  navigateur (`tests/base.py`, `tests/mkseed.mjs`) ; `functions/test-demo.js` rendu autonome.
- **Nouveau `tests/moteur/test-doses.mjs`** (sans navigateur) : Mosteller, Cockcroft-Gault (mg/L et µmol/L), Calvert plafonné
  à 125, % reconduits, molécules ajoutées / retirées, prémédication non réduite, essais 1 à 4 et 11 de l'audit écrits comme
  tests (ils échouent avant le lot B, passent après).
- `tests/test_cures.py` et `tests/test_seances.py` : réparés le 11/10 (autre session) ; à faire passer sur le jeu fictif.
- Un seul lancement : `tests/tout.sh` (moteur, serveur, règles, navigateur) ; le bilan figé (352 317 DH) reste à part.
- Démonstration : créatinine ajoutée dans `functions/demo.js` (ses patients sous carboplatine n'ont pas de dose).

### A6 – Code mort et fonctions communes (1 session)
- Retirer : `chValiderSeance`, `chHon`, `nlChoix`, `pfOnglet`, `prChoix`, `__v2pret`, les 17 variables inutiles, les 5 éléments
  exportés jamais importés, 15 styles inutilisés **sauf `.allergie`** (resservira au lot C2).
- Fonctions recopiées regroupées dans `js/moteur/outils.js` : `esc` (5 copies, c'est elle qui protège des injections),
  `sansAcc` (7), `dfr` (5 variantes), ajout de jours (3), impression (9 fichiers).
- Logiques en double site / serveur sans contrôle (`consJours`, `finRT`, `COULEURS0`, `REGLES_FIXES`) : test de cohérence,
  comme pour la facturation et les modules.
- Écritures qui s'écrasent (17 endroits sans relecture) : passer en transaction au moins les **protocoles** (`lib_0…10` :
  deux protocoles du même bloc modifiés en même temps → le second efface le premier), les **réglages** et les **listes**.
- ESLint installé (contrôle seulement, aucun changement de forme).
- **Question 2** : la mise en forme automatique (Prettier) triple le nombre de lignes (8 146 → 27 950). Je propose de la
  faire **au dossier de cession (étape 12)**, pas maintenant : le code compact est plus rapide à relire pour Claude à chaque
  session, et elle bloquerait les sessions en parallèle (toutes leurs modifications en conflit).

### A7 – Feuille de route allégée
- `FEUILLE-DE-ROUTE.md` (207 ko, relue à chaque session) coupée en deux : feuille de route (à faire, décisions) et
  `JOURNAL.md` + `archives/etapes-faites.md`. Chaque session lit moins.

---

## 3. Lot B – Sécuriser les actes (le plus important pour la sécurité des patients)

### B1 – Figer la cure à sa validation (1 session)
Aujourd'hui « Valider » (`chimio.js` 352 et 426) note la date (`reelle`, `valLe`) ; les doses sont recalculées à chaque
affichage : changer la taille fait passer l'épirubicine d'une cure validée de 153 à 162 mg (essai 1).
- À la validation de J1 et de chaque séance J8 / J15 : enregistrer `fige` = { le, par, poids, taille, surface, créatinine +
  unité, âge, clairance, AUC, doses [{ molécule, dose calculée, %, dose retenue, unité }], protocole du jour }.
- Une cure ou une séance validée s'affiche et s'imprime **depuis `fige`** ; modifier le poids ou la taille ne touche que les
  cures non validées.
- « Annuler la validation » efface `fige` (tracé dans le journal du dossier).
- Le journal d'audit garde l'ancienne et la nouvelle dose (avant / après) pour les doses et les prescriptions.
- Le bilan n'est pas touché (honoraires = jours validés × tarif daté, déjà figés par 15 bis).
- **Question 3** : cures déjà validées avant ce changement → les figer **une fois** telles qu'elles s'affichent aujourd'hui
  (marquées « figée le 12/10/2026 d'après le dossier ») ? C'est la seule façon de les protéger, mais si une taille a déjà été
  modifiée, l'ancienne dose réelle est perdue.

### B2 – Bornes de plausibilité (avec B1)
Saisie hors bornes → **message et confirmation** (pas de refus, sauf dose vide) :
| Donnée | Confirmation demandée si… |
|---|---|
| Poids | < 30 kg ou > 200 kg, ou variation > 10 % depuis la cure précédente |
| Taille | < 120 cm ou > 220 cm, ou différente de la taille précédente (adulte) |
| Créatinine | mg/L : < 3 ou > 30 ; µmol/L : < 25 ou > 265 |
| Clairance calculée | < 30 ou > 200 ml/min (au-delà de 125 : déjà plafonnée pour Calvert) |
| Surface corporelle | < 1,2 ou > 2,6 m² |
| Dose d'une molécule | vide ou 0 → **validation refusée** (sauf molécule retirée) ; carboplatine sans créatinine → refusé |
- **Question 4** : ces seuils vous conviennent ? (réglables plus tard dans Paramètres › Alertes si besoin).

### B3 – Prémédication reconnue par la molécule (avec B2)
`RE_PREMED` (`moteur/doses.js` 5) reconnaît surtout des noms de marque : « ONSET » reste à 8 mg mais « ONDANSETRON » passe à
6 mg à 80 % (essai 11). Remplacé par une classe dans le dictionnaire des molécules (`DICT`, 83 entrées) : antiémétiques
(ondansétron, granisétron, palonosétron, aprépitant), corticoïdes (méthylprednisolone, dexaméthasone), antihistaminiques,
atropine, facteurs de croissance, EPO, acide zolédronique, dénosumab… marques et DCI. Même liste pour `molecules()` de
`protocoles.js`. Test : essai 11 dans `test-doses.mjs`.

### B4 – Radiothérapie : prescription contrôlée (1 session)
- Fenêtre de prescription : dose par fraction > 8 Gy ou dose totale > 80 Gy → confirmation ; 1re séance avant le scanner, fin
  avant le début → refusé.
- **Dose, fractions ou technique modifiées après la dosimétrie validée** → message « la dosimétrie devra être revalidée »,
  validation retirée (gardée dans l'historique), tâche « Valider la dosimétrie » recréée (essai 5).
- Radiothérapie commencée sans contourage ou dosimétrie validés : les étapes restent affichées, en rouge « commencée sans
  validation » (essai 8) ; dans le bloc « À valider » du tableau de bord.
- Tâches automatiques (`functions/logique.js` 155-156) : aujourd'hui arrêtées à la 1re séance. **Question 5** : les garder
  jusqu'à la validation, marquées « EN RETARD » ?

### B5 – Documents de radiothérapie honnêtes (avec B4)
- « Séances réalisées » : **Décision RB** = on garde le calcul de calendrier (c'est au physicien de tenir le carnet ; pas de
  journal des séances). Libellé « Séances prévues à ce jour : 11 / 25 » partout (dossier et tableau de bord), comme déjà fait au
  tableau de bord.
- Document « Rendez-vous » d'une radiothérapie clôturée en retard : titre « Calendrier théorique », colonne État « Prévu »
  (plus de « Terminé » inventé), mention « dates ajustées » imprimée (essai 7). **Question 6** : d'accord ?
- Pli et compte rendu : avant l'impression, « Il reste 4 mentions à compléter : imprimer quand même ? » (essai 9).

### B6 – Protocoles : validation tracée (1 session)
- Un protocole sans statut compte comme validé (`protocoles.js`, `valide = st === "ok" || !st`). Une fois : les protocoles
  sans statut reçoivent « Validé » explicitement (« validé avant le 12/10/2026 »), puis l'absence de statut = **non validé**.
- Validation tracée : qui, quand, version (n° qui augmente à chaque modification), source (référentiel, article).
  Toute modification d'un protocole validé le repasse « à valider ».
- Éditeur : dose maximale, arrondi, « tous les n cycles », « C1 seule » (le moteur sait déjà les appliquer).
- Croix rouge de chaque ligne → dans l'éditeur du protocole, avec confirmation.

---

## 4. Lot C – Dossier oncologique

S'appuie sur la fiche réglable par chaque cabinet (`editeurfiche.js`, en ligne le 11/10 — Décision RB).

### C1 – Fiche tumeur (1 session)
**Décision RB** : proposée dans le paramétrage, chaque cabinet libre de la mettre ou non et de la mettre en tête du dossier ;
listes typiques créées dans la **spécialité Oncologie** et **appliquées aux cabinets actifs**.
- Champs ajoutés au catalogue `FICHE` (types « choix » pour pouvoir trier et compter) : localisation (liste des diagnostics),
  côté, histologie (liste par localisation), grade, cTNM / pTNM, stade, date du diagnostic, biomarqueurs (RE, RP, HER2, Ki-67,
  PD-L1, EGFR, ALK, KRAS, BRAF, MSI…), état général OMS 0-4.
- Fiche de la spécialité Oncologie (`plateforme/specialites`) puis `ficheSpecialite` vers tous les cabinets actifs de la
  spécialité (fonction existante).
- Page Patients : filtres par localisation et par stade (critère de fin du lot).

### C2 – Allergies en alerte (avec C1)
- Bandeau rouge discret et permanent en tête du dossier dès qu'une allergie est notée (style `.allergie` existant).
- Reprise sur la fiche de chimiothérapie imprimée (avec le % de réduction), et alerte simple dans la fenêtre de prescription si
  le médicament contient le mot de l'allergie.

### C3 – Statut du patient et archivage (1 session)
- Statut saisi : en traitement, en surveillance, perdu de vue, décédé (+ date) ; date des dernières nouvelles (calculée :
  dernière consultation ou dernier acte). Filtre dans la liste. Décédé → plus de rappels WhatsApp, de tâches automatiques ni
  d'alertes ; rendez-vous futurs signalés.
- « Supprimer le patient » → **Archiver** (caché, retrouvable dans « Archivés », restaurable). **Question 7** : la suppression
  définitive reste-t-elle possible (titulaire seulement, depuis les archives) ?
- Boutons « + Tâche » et « + Rendez-vous » en double : un seul exemplaire. Téléphone : identité repliée, onglets plus haut.

### C4 – Modèle de consultation d'oncologie (avec C3)
**Décision RB** : par le formulaire réglable, sans nouveau code. Dans la spécialité Oncologie, appliqué aux cabinets actifs :
- type « Consultation » : poids, OMS, douleur (EVA 0-10), toxicités gradées (CTCAE : nausées, vomissements, diarrhée, mucite,
  neuropathie, asthénie, neutropénie fébrile…), conduite à tenir ;
- type « RT hebdomadaire » (resservira au lot D3) : radiodermite, mucite, dysphagie, diarrhée, cystite, asthénie (grades 0-4).
- Note signée : bouton « Signer » (la note est verrouillée ; une modification ultérieure crée une version, l'ancienne est
  gardée). **Question 8** : la secrétaire garde-t-elle le même journal, ou un type « Note administrative » à part ?

---

## 5. Lot D – Radiothérapie (sans journal des séances : Décision RB)

### D1 – Prescription par volume (1 session)
Volumes [{ nom (PTV sein, boost lit tumoral…), dose totale, fractions, dose par fraction }], complément séquentiel ou intégré ;
dose totale et nombre de séances calculés. Les radiothérapies existantes deviennent un volume unique (rien à ressaisir).
Organes à risque : note libre.

### D2 – Rythmes libres (avec D1)
Quotidien, un jour sur deux, **deux séances par jour**, **une par semaine**, **jours choisis** (ex. lundi-mercredi-vendredi).
`finRT` est en double (`moteur/rt.js` et `functions/logique.js`) : test de cohérence obligatoire (A6).

### D3 – Toxicités hebdomadaires (1 session)
Consultation hebdomadaire créée avec le formulaire « RT hebdomadaire » (C4) ; tableau des toxicités semaine par semaine dans la
carte de la radiothérapie.

### D4 – Compte rendu de fin rempli (1 session)
Localisation et histologie (C1), volumes et doses (D1), dates de début et de fin réelles, interruptions, toxicités maximales par
grade (D3), prochain rendez-vous (agenda), bilan de contrôle (choix). Critère : aucune mention « à compléter » pour un traitement
terminé.

---

## 6. Lot E – Chimiothérapie complétée

### E1 – Bilan avant cure (1 session)
À la validation : PNN, plaquettes, hémoglobine, créatinine (bilirubine / transaminases si le protocole le demande). Sous les
seuils (par défaut PNN < 1 500/mm³, plaquettes < 100 000/mm³) → choix maintenir / réduire / reporter, dérogation tracée.
Rejoint les **alertes cliniques** du tableau de bord (étape 22, seuils à choisir).
**Question 9** : bilan **obligatoire** pour valider, ou simple rappel ?

### E2 – Doses cumulées (avec E1, après B1)
Somme des doses figées par molécule, en mg/m² ; alerte aux plafonds usuels (doxorubicine 450-550, épirubicine 900, bléomycine
400 UI, oxaliplatine : neurotoxicité). Plafonds dans le dictionnaire des molécules (B3).

### E3 – Intention et réponse (1 session)
Ligne : intention (néoadjuvante, adjuvante, métastatique, concomitante à la radiothérapie, palliative) ; réponse évaluée en cours
et en fin de ligne (complète, partielle, stable, progression, non évaluable). Toxicités par cure depuis la consultation (C4).

### E4 – Écran de l'infirmière (étape 11, 1 session)
Poches posées, heure de début et de fin, voie, tolérance, incidents ; règle `administrations` déjà écrite. Bloc « À faire par
l'infirmière » du tableau de bord relié.

### E5 – Ergonomie de la chimio (avec E3)
Protocole d'un seul jour : plus de fenêtre « cure » intermédiaire ; « Arrêter la ligne » et « Supprimer » rangés dans un menu ⋯ ;
fiche imprimée avec allergies et % de réduction (C2).

---

## 7. Lot F – Ergonomie (à intercaler)

### F1 – Prescriptions
- **Décision RB** : confirmation avant de supprimer une ligne de l'ordonnance en préparation.
- Gestion des listes séparée de la prescription : ⭐ ✎ ✕ seulement en mode « Gérer la liste » (une croix rouge efface aujourd'hui
  un élément pour tout le cabinet) ; doublon refusé dans toutes les familles.
- Ordonnance enregistrée réaffichée : nettoyage du HTML (balises et attributs permis seulement), protection contre l'injection.
- En-tête et pied **générés** au choix du cabinet (Paramètres › Impression : « papier à en-tête » ou « en-tête Onco360 » avec le
  logo du lieu et la signature scannée, déjà enregistrés mais jamais imprimés).

### F2 – Documents déposés
- **Sauvegarde des fichiers** (Cloud Storage n'est pas dans la sauvegarde de la base) : copie chaque nuit vers un second
  emplacement, avec conservation. À installer avec vous (commande Terminal prête).
- Conversion en PDF : **Décision RB du 11/10** (tout en PDF) maintenue. **Question 10** : garder aussi l'original Word / Excel
  (texte sélectionnable) à côté du PDF ?

### F3 – Paramètres (familles et « Mon compte » : faits et en ligne le 11/10, 20261011t)
- WhatsApp (4 001 px) : un message replié par catégorie.
- Explications longues remplacées par une bulle « ? » ; croix rouges des listes dans un menu ⋯ avec confirmation.
- `pageConfiguration` (30 427 caractères) découpée par famille.

### F4 – Bilan et divers
- Bilan sur téléphone : filtres repliés (comme la salle d'attente).
- « Payé auto. » : convertir une fois les actes d'avant le 12/10/2026 en pointages explicites, puis retirer `FIN_PAYE_AUTO`
  (bilan identique au dirham près, test).
- Champs de fichier (photo, signature) stylés.

---

## 8. Lot G – Montée en charge (avant de vendre à un groupe)
Mesures de l'audit (minimums, sans réseau) : 1 000 dossiers sans gêne ; 5 000 : 0,5 s par lettre tapée ; 20 000 : ~3 s.
- G1 : liste des patients par pages (50, puis « Afficher plus ») ; recherche sur un index léger.
- G2 : photo du patient sortie du dossier (Cloud Storage) : elle n'est plus téléchargée pour tous les patients.
- G3 : index léger des patients (nom, n°, diagnostic, statut, lieu, prochains actes) ; dossier complet chargé seulement à
  l'ouverture ; agenda et alertes depuis l'index. Puis mode hors ligne (étape 10).

## 9. Lot H – Geler
- Administration, abonnements, relances : **plus d'ajout** avant d'avoir fini B à E (19 % du code, au service de la vente).
- **Question 11** : geler Médecine générale et Gynécologie (aucun pack, 2 modules « prévus ») : les cacher de l'administration
  sans retirer le code ?

---

## 10. Questions à trancher par Dr Bentahila
1. Retirer l'ancienne application du site maintenant (données gardées en base et en sauvegarde) ?
2. Mise en forme automatique du code : au dossier de cession (recommandé) ou maintenant ?
3. Cures déjà validées : les figer une fois telles qu'elles s'affichent aujourd'hui ?
4. Seuils de plausibilité (B2) : d'accord ?
5. Tâches de contourage / dosimétrie après la 1re séance : continuer « EN RETARD » ?
6. Document « Rendez-vous » de RT : « Calendrier théorique », état « Prévu » ?
7. Patient archivé : suppression définitive encore possible pour le titulaire ?
8. Notes de la secrétaire : même journal ou type « Note administrative » ?
9. Bilan sanguin avant cure : obligatoire ou rappel ?
10. Documents Word / Excel : garder l'original à côté du PDF ?
11. Geler Médecine générale et Gynécologie ?
12. Ajouter l'onglet « Design » de l'audit au dossier Drive.
