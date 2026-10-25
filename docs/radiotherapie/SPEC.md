# Onco360 — Module Radiothérapie

25/10/2026 · Dr Rita Bentahila

## Mode d'emploi

Ce document est la source pour construire le module **Radiothérapie** d'Onco360 : un référentiel de consultation des protocoles de radiothérapie et de curiethérapie. Cet onglet dit comment le construire. Les onglets suivants contiennent le contenu médical à intégrer tel quel.

**À qui il s'adresse :** à Claude Code, qui travaille sur le dépôt `ritabentahila-alt/onco360`. Le dépôt reste la référence pour tout ce qui touche au code : `CLAUDE.md`, `FEUILLE-DE-ROUTE.md`, `JOURNAL.md`. Ce document dit quoi construire ; le dépôt dit comment Onco360 est fait. En cas de contradiction sur le code, le dépôt l'emporte, et la contradiction est signalée à Dr Bentahila avant d'aller plus loin.

**Ce qui est fourni avec ce document** (par Dr Bentahila, à déposer dans le dépôt au lot RT0) :

- `LISEZMOI.md`, à la racine du zip (ne pas le déposer) : où va chaque fichier, les étapes du lot RT0 et le message à envoyer à Claude Code pour démarrer ;
- `docs/radiotherapie/SPEC.md` : ce document, en Markdown ;
- `public/donnees-rt/` : le contenu déjà converti en JSON (un index, un fichier par localisation, les bibliothèques OAR, contraintes et essais, la correspondance avec `DIAG`) ;
- `docs/radiotherapie/rapport-import.txt` : le rapport de contrôle de la conversion ;
- `docs/radiotherapie/ecarts.md` : le journal des écarts (il n'entre pas dans l'application) ;
- `docs/radiotherapie/contenu/` : les 48 onglets de localisation et les 3 bibliothèques en Markdown, pour la lecture ; le code ne lit que les JSON ;
- `docs/radiotherapie/conversion/` : le script qui a produit les JSON, gardé pour les prochains lots ; le développeur ne le lance pas ;
- `tests/moteur/test-rtref-contenu.mjs` : le test de contenu du lot RT0, déjà écrit et vert sur les JSON fournis.

Le développeur ne recopie donc aucun tableau à la main : il charge les JSON fournis. Les tableaux des onglets de contenu restent la référence lisible par le médecin ; la section « Import des tableaux vers le JSON » dit comment ils ont été convertis.

**Règles pour le développeur :**

1. Ne rien inventer ni compléter : chaque dose, marge, contrainte ou référence affichée vient des JSON fournis.
2. Ne corriger aucun chiffre médical, même s'il paraît faux : le signaler à Dr Bentahila.
3. Garder les noms de champs des JSON à l'identique (section « Modèle de données »).
4. Ne casser aucun module existant (Protocoles, dossier, agenda, salle d'attente, bilan, Administration). Le module n'écrit rien dans les dossiers patients. Le contenu de référence n'est jamais écrasé : les modifications du médecin sont enregistrées à part, par cabinet.
5. Suivre la méthode du dépôt : une étape = une session ; tests sur le jeu fictif ; téléphone 390 px ; `bash outils/avant-mise-en-ligne.sh --navigateur` (et `--regles` dès que les règles changent) ; aucune mise en ligne sans l'accord de Dr Bentahila.

**Livraison par lots :** le contenu grossit localisation par localisation. Chaque localisation porte sa date de mise à jour (`date_maj`). À chaque nouvelle version, Dr Bentahila fournit de nouveaux JSON ; le développeur remplace les fichiers de `public/donnees-rt/` et relance les tests de contenu.

**Hors périmètre :** la prescription de radiothérapie liée à un patient (onglet Radiothérapie du dossier, déjà en place), la facturation et les rétrocessions. Ce module est un guide de consultation ; il ne crée aucune ordonnance et ne remplit aucune prescription.

## Plan d'exécution pour Claude Code

**Avant la première ligne de code**, ajouter dans `FEUILLE-DE-ROUTE.md` une phase « RTR — Référentiel de radiothérapie » (lots RT0 à RT8 ci-dessous) et, dans les décisions, cette ligne :

> Module « Référentiel de radiothérapie », décidé par Dr Bentahila en octobre 2026 : guide de consultation (schémas, centrage, contourage, organes à risque, contraintes, essais, calcul BED / EQD2), spécification dans `docs/radiotherapie/SPEC.md`. Il n'écrit rien dans les dossiers et ne revient sur aucun refus de la feuille de route : pas d'organes à risque, de toxicités ni de journal des séances dans la prescription d'un patient, pas de mention « hors référentiel ».

Puis un lot par session, dans l'ordre. Chaque lot se termine par ses tests au vert, la feuille de route cochée et une ligne dans `JOURNAL.md`.

| Lot | Contenu | Fichiers touchés | Terminé quand |
| --- | --- | --- | --- |
| RT0 Préparer | Déposer les fichiers fournis ; écrire la phase et la décision dans la feuille de route ; test de contenu : chaque JSON se lit, identifiants uniques, chaque `essai_ids`, `oar_ids`, `contraintes_ids`, `volumes_id`, `simulation_id` renvoie à un objet existant | `docs/radiotherapie/`, `public/donnees-rt/`, `firebase.json` (en-têtes `no-cache` de `/donnees-rt/**`), `tests/moteur/test-rtref-contenu.mjs` | Test de contenu (fourni) vert et ajouté à la liste des tests moteur de outils/avant-mise-en-ligne.sh ; rien de visible dans Onco360 |
| RT1 Socle | Droit `referentielRT`, fonction `rt.referentiel`, entrée de menu, route, règles Firestore | `js/app/profil.js`, `js/donnees/catalogue.js`, `js/app/v2.js`, `firestore.rules`, `tests/regles/test-rtref.mjs` | `cd tests/regles && npm test` vert, chaque rôle testé ; menu visible seulement avec le module `rt`, la fonction et le droit |
| RT2 Moteur | Calculs purs : chargement et fusion référence + cabinet, recherche (synonymes, doses), tri, mise en forme des doses, BED / EQD2 | `js/moteur/rtref.js`, `tests/moteur/test-rtref.mjs` | Tests verts, dont le cas de contrôle du calcul BED / EQD2 |
| RT3 Référentiel | Page d'accueil du module, recherche, menus, liste, favoris, récents | `js/app/radiotherapie.js`, CSS « Lot RTR » de `v2.html`, `tests/test_rtref.py` | Parcours joués à 1 440, 1 280 et 390 px, sans débordement |
| RT4 Fiche | Fiche et ses onglets, copier, lien Protocoles, impression | `js/app/radiotherapie.js`, `js/app/protocoles.js` (route `#protocoles/<id>`), `v2.html` (icône `i-copier`) | Fiche lisible aux trois largeurs ; impression A4 vérifiée |
| RT5 Modification | Modification pour le cabinet, comparaison, revenir à la référence, dupliquer, nouveau schéma | `js/app/radiotherapie.js`, `js/moteur/rtref.js`, `firestore.rules` et tests | Règles et parcours verts pour médecin, secrétaire, infirmière, comptable |
| RT6 Sous-pages | Organes à risque, Contraintes, Essais, Calcul BED / EQD2 | `js/app/radiotherapie.js` | Cas de contrôle retrouvé à l'écran ; trois largeurs |
| RT7 Modèle | Copie vers le modèle des cabinets neufs et vers chaque cabinet neuf ; page du module dans « Ajuster le modèle » | `functions/index.js` (`modeleReprendre`, `creerEspace`), `functions/cabinets.js` (droits de l'administration dans une bibliothèque), `js/app/v2.js` (`PAGES_BIB`) | `node functions/test-cabinets.js` vert ; cabinet de démonstration recréé et vérifié |
| RT8 Dossier et mise en ligne | Lien « Référentiel › » depuis l'onglet Radiothérapie du dossier ; contrôle complet ; mise en ligne avec l'accord de Dr Bentahila | `js/app/v2.js`, `public/donnees-rt/diag-localisation.json` (fourni) | `avant-mise-en-ligne.sh --navigateur --regles` vert |

**Ce qu'un changement de ce module touche** (à vérifier, avec un test, à chaque lot concerné) : menu et routage pour chaque rôle et chaque formule, dont une formule « Radiothérapie » sans module chimio ; droits dans Paramètres › Accès ; règles Firestore ; page Protocoles (lien entrant) ; Administration › Par spécialité › Modèle des cabinets neufs ; création d'un cabinet neuf ; export et sauvegardes du cabinet ; journal d'audit ; téléphone 390 px.

## Emplacement dans Onco360

**Menu.** Nouvelle entrée `["radiotherapie", "Radiothérapie", "rt"]` dans `MENU` de `catalogue.js`, juste après `protocoles`. Elle dépend du module `rt` (déjà existant) et non d'un nouveau module : aucune clé de module n'est créée. Ne pas utiliser `radiotherapie` comme clé de module : ce nom est déjà celui d'une formule et d'un droit.

**Fonction.** Ajouter `["referentiel", "Référentiel de radiothérapie"]` à `FONCTIONS.rt` de `catalogue.js` (fonction facultative, pas de base) et `"rt.referentiel"` à `FONCTIONS_RELIEES`. L'Administration peut ainsi l'activer ou la couper par pack, comme les autres fonctions. Elle est active par défaut dans les cinq formules qui ont le module `rt` : `radiotherapie`, `rt-pro`, `rt-centre`, `oncort-pro`, `complet`. Le cabinet du Dr Bentahila, sans abonnement, l'a d'office.

**Route.** Page `radiotherapie` dans `PAGES` de `v2.js`, avec `PAGE_MODULE.radiotherapie = "rt"`. `route()` refuse la page, comme pour `chimio.protocoles`, si la fonction `rt.referentiel` est coupée ou si le droit `referentielRT` vaut « aucun ». Adresses : `#radiotherapie` (accueil et liste), `#radiotherapie/s/<schemaId>/<onglet>` (fiche), `#radiotherapie/oar`, `#radiotherapie/contraintes`, `#radiotherapie/essais`, `#radiotherapie/calcul`. La recherche et les menus ne vont pas dans l'adresse : ils restent en mémoire dans le module, comme les filtres de la page Protocoles (`CF`).

**Sous-pages** (onglets en haut de la page Radiothérapie, composant `ag-vues defile`) : Référentiel · Organes à risque · Contraintes · Essais · Calcul BED / EQD2. La curiethérapie n'a pas de sous-page : elle se filtre par le menu Fractionnement et par l'entrée « Curiethérapie » du sommaire.

**Droit `referentielRT`.** Ajouter à `DROITS_ROLE` de `profil.js` un droit à niveaux (`aucun` / `voir` / `modifier`, comme `traitements`) : médecin `modifier` ; secrétaire, infirmière et comptable `aucun`. Libellé dans `LIB_DROITS` : « Référentiel de radiothérapie ». Le médecin titulaire le règle pour chaque membre dans Paramètres › Accès, comme les autres droits. `migrations()` de `v2.js` l'écrit une fois dans les fiches des membres existants, comme pour les droits ajoutés le 06/10/2026.

| Rôle | Voir le module | Modifier pour le cabinet, dupliquer, créer, revenir à la référence |
| --- | --- | --- |
| Médecin | Oui (`modifier` par défaut) | Oui avec le droit `modifier` ; non avec `voir` |
| Secrétaire | Seulement si le titulaire règle `voir` | Non |
| Infirmière | Seulement si le titulaire règle `voir` | Non |
| Comptable | Non | Non |
| Compte d'administration | Dans `espaces/bib-oncologie` seulement (« Ajuster le modèle ») ; il n'ouvre aucun cabinet | Oui, dans le modèle |

Sans le droit `modifier`, aucun bouton « Modifier », « Dupliquer », « Nouveau schéma » ni « Revenir à la référence » ne s'affiche (pas de bouton grisé), et toute écriture est refusée par les règles.

**Règles Firestore** (dans `match /espaces/{e}`, avec les fonctions déjà présentes ; les règles n'ont pas d'opérateur ternaire) :

```
function rtRefVoir() { return estMembre() && moduleOn('rt') && (m().droits.get('referentielRT', 'aucun') in ['voir', 'modifier'] || (m().role == 'medecin' && !('referentielRT' in m().droits))); }
function rtRefModif() { return estMembre() && moduleOn('rt') && m().role == 'medecin' && m().droits.get('referentielRT', 'modifier') == 'modifier'; }
match /referentielRT/{s} {
  allow read: if rtRefVoir();
  allow create, update: if rtRefModif() && request.resource.data.majPar == request.auth.uid;
  allow delete: if rtRefModif();
}
```

Ajouter les cas à `tests/regles/test-rtref.mjs` : chaque rôle, droit `voir` et `modifier`, module `rt` coupé, cabinet suspendu, autre cabinet.

## Modèle de données

Deux couches, comme les bibliothèques de prescription d'Onco360 (liste de départ dans le site, changements du cabinet dans Firestore) :

1. **La référence** : fichiers JSON statiques dans `public/donnees-rt/`, fournis avec ce document, jamais modifiés par l'application.
2. **Les changements du cabinet** : `espaces/{e}/referentielRT/{schemaId}` dans Firestore, une fiche par schéma modifié ou créé.

**Fichiers de la référence** (`public/donnees-rt/`, servis en `no-cache` par `firebase.json`) :

| Fichier | Contient | Chargé |
| --- | --- | --- |
| `index.json` | `version` (date du contenu), régions, localisations (id, nom, région, ordre, `date_maj`), et pour chaque schéma le résumé utile à la recherche et à la liste : id, localisation, situation, titre, type, preuve, acronymes d'essais, doses et séances | À l'ouverture du module, une fois par session |
| `<localisation_id>.json` (48 fichiers) | Situations, schémas, simulations, volumes, curiethérapie, traitement systémique, points d'attention | À l'ouverture d'une fiche de cette localisation, puis gardé en mémoire |
| `oar.json` | Définitions de contourage des OAR | À la première fiche ou à la sous-page Organes à risque |
| `contraintes.json` | Jeux de contraintes et `aide_colonnes` | Idem |
| `essais.json` | Essais et références | Idem |
| `diag-localisation.json` | Correspondance entre la liste des diagnostics (`DIAG` de `listes.js`) et les `localisation_id` | Au lien « Référentiel › » du dossier |

Le journal des écarts n'est pas dans l'application : il reste dans ce document et dans `docs/radiotherapie/`.

**Objets et champs :**

| Objet | Champs | Valeurs autorisées / remarques |
| --- | --- | --- |
| Region | id, nom, ordre | Uro, Gynéco, Digestif, ORL, Thorax, Sein, SNC, Os et palliatif, Sarcomes, Peau, Autres |
| Localisation | id, region\_id, nom, ordre, date\_maj | Date de la dernière mise à jour de l'onglet |
| Situation | id, localisation\_id, titre, contexte, criteres, ordre | contexte : en\_place, post\_op, rattrapage, metastatique, oligometastatique, palliatif, reirradiation |
| Schema | id, situation\_id, titre, type, preuve, essai\_ids\[\], source\_institutionnelle, prescriptions\[\], technique, systemique, simulation\_id, volumes\_id, contraintes\_ids\[\], couverture, points\_attention\[\], date\_verif | type : rte\_normo, rte\_hypo, sbrt, curie\_ldr, curie\_hdr, curie\_pdr, rte\_plus\_curie · preuve : essai\_phase3, recommandation, pratique\_institutionnelle, option ; pratique\_du\_cabinet pour un schéma créé par le cabinet · tout schéma de la référence est validé : pas de champ statut |
| Prescription (dans Schema) | volume, dose\_Gy, fractions, dose\_fx\_Gy, mode, rythme, note | mode : SIB, sequentiel, seul · rythme : texte libre (« 5 fx/sem ») · dose\_Gy, fractions ou dose\_fx\_Gy absents pour une curiethérapie LDR ou PDR ou une dose à définir |
| Simulation | id, position, contention, preparation, scanner, imagerie, reperes | Texte court par champ |
| Volumes | id, cibles\[\], oar\_ids\[\], atlas\[\] | Cible : nom, type (GTV, CTV, ITV, PTV), definition, quand, marge · atlas : { nom, url } |
| OAR | id, nom, nom\_tg263, definition, source, region | nom\_tg263 = nomenclature AAPM TG-263 |
| JeuContraintes | id, titre, fractionnement, source, verification, lignes\[\] | verification : verifie ou service · Ligne : oar\_id, indicateur, ideal, limitant, note |
| Essai | id, acronyme, type, revue, annee, pmid, doi, population, bras, resultat | Lien PubMed = `https://pubmed.ncbi.nlm.nih.gov/<pmid>/`, DOI = `https://doi.org/<doi>` |
| Systemique (dans le fichier de la localisation) | situation, traitement, protocole, protocole\_id, essai\_ids, note | protocole = nom exact du protocole dans la bibliothèque Protocoles ; protocole\_id = son identifiant quand il est connu à la conversion, sinon absent (le module cherche alors par le nom) |

**Changements du cabinet** (`espaces/{e}/referentielRT/{schemaId}`) :

| Champ | Contenu |
| --- | --- |
| schema | Le Schema complet, même structure que la référence |
| localisation\_id | Pour l'afficher au bon endroit sans charger tous les fichiers |
| nouveau | true pour un schéma créé ou dupliqué par le cabinet (identifiant `cab-…`) ; absent pour une modification d'un schéma de la référence |
| origine | `cabinet` (modifié dans ce cabinet) ou `modele` (reçu du modèle des cabinets neufs) |
| copie\_de | Identifiant du schéma dupliqué, s'il y a lieu |
| base | `date_maj` de la localisation de référence au moment de la modification |
| note | Note du médecin |
| majPar, majParNom, majLe | Auteur et date de la dernière modification (`majPar` = la personne connectée, imposé par la règle) |

Affichage : la fiche du cabinet, si elle existe, remplace la référence ; sinon la référence. Le badge « Modifié pour le cabinet » ne s'affiche que pour `origine: "cabinet"`. « Revenir à la référence » supprime la fiche du cabinet. Si `date_maj` de la localisation est postérieure à `base`, la fiche affiche « La référence a changé depuis » et le lien vers la comparaison ; rien n'est fusionné automatiquement.

**Réglages personnels** (dans `utilisateurs/{uid}`, comme les réglages de la salle d'attente) : `rtFavoris` (liste d'identifiants de schémas), `rtRecents` (les 8 derniers ouverts), `rtOnglet` (dernier onglet de fiche ouvert). Les étoiles de la page Protocoles, elles, restent communes au cabinet : ne pas les mélanger.

**Modèle des cabinets neufs** (même mécanisme que les protocoles de chimiothérapie) :

| Étape | Où | Ce qui se passe |
| --- | --- | --- |
| 1. Copier | Administration › Par spécialité › Modèle des cabinets neufs › « Copier depuis le cabinet du Dr Bentahila » (`modeleReprendre`) | Les fiches `referentielRT` de `cabinet-bentahila` sont recopiées dans `espaces/bib-oncologie/referentielRT`, avec `origine: "modele"` ; la copie est notée au journal de l'Administration (`jAdmin` : date, nombre de schémas) |
| 2. Ajuster (facultatif) | « Ouvrir le modèle » (`v2.html?espace=bib-oncologie`) | La page Radiothérapie y est ouverte (`PAGES_BIB`) ; le compte d'administration y modifie le modèle comme un médecin dans son cabinet (ajouter `referentielRT: "modifier"` à ses droits dans une bibliothèque, `functions/cabinets.js`) |
| 3. Cabinet neuf | `creerEspace` | Les fiches de `bib-oncologie/referentielRT` sont copiées dans le cabinet neuf, avec `origine: "modele"` ; ensuite plus aucun lien |
| Plus tard | — | Mises à jour proposées aux cabinets existants, comme les différences de protocoles (`functions/reference.js`) : hors de ce plan |

« Ce que reçoivent les cabinets » (Administration) cite le référentiel de radiothérapie et le nombre de schémas modifiés du modèle.

**Nombres et formats.** Les doses sont des nombres dans les JSON (60, 1.8) et s'affichent à la française (« 1,8 Gy »). Un champ vide est absent du JSON, jamais « n/a ».

**Exemple d'un schéma :**

```json
{
  "id": "pro-fav-60-20",
  "situation_id": "pro-ep-fav",
  "titre": "60 Gy / 20 fx",
  "type": "rte_hypo",
  "preuve": "essai_phase3",
  "essai_ids": ["chhip", "profit"],
  "source_institutionnelle": "Institut Curie, prostate en place (2021)",
  "prescriptions": [
    { "volume": "PTV_PRO", "dose_Gy": 60, "fractions": 20, "dose_fx_Gy": 3, "mode": "seul", "rythme": "5 fx/sem",
      "note": "Inclure le 1er cm des VS si lésion index IRM ou biopsies positives à la base" }
  ],
  "technique": "VMAT, IGRT kV-CBCT quotidien",
  "systemique": "Faible : aucune. Intermédiaire favorable : aucune, option 4–6 mois",
  "simulation_id": "sim-pro-ep",
  "volumes_id": "vol-pro-ep",
  "contraintes_ids": ["ct-pro-3gy-20fx-curie"],
  "couverture": "CTV D98% ≥ 58,8 Gy ; PTV D95% ≥ 57 Gy ; D1cc ≤ 107 %",
  "points_attention": ["CHHiP : 57 Gy / 19 fx n'a pas démontré sa non-infériorité ; ne pas l'utiliser comme alternative à 60 Gy / 20 fx"],
  "date_verif": "2026-10-22",
  "ind": ["Uro", "Prostate", "En place — risque faible ou intermédiaire favorable (N0 M0)", "Hypofractionné"]
}
```

Les valeurs exactes de chaque schéma sont celles des JSON fournis ; cet exemple ne montre que la forme.

## Écrans et affichage

Le module se lit plus qu'il ne se remplit. Il sert à trois moments de la journée du radiothérapeute : choisir un schéma (consultation, RCP), contourer, valider une dosimétrie. Chaque écran sert l'un d'eux : l'information utile d'abord, le moins de gestes possible, aucune action dangereuse à portée de clic.

Les maquettes du module (canvas « Onco360 — Module Radiothérapie (maquettes) ») datent d'avant cette révision. Là où elles diffèrent (bandeau d'avertissement, filtres en pastilles, sous-page Curiethérapie), ce texte fait foi.

### 0. Reprendre l'existant d'Onco360

**Règle : aucun deuxième design system.** Le module n'ajoute ni couleur, ni taille de police, ni rayon, ni ombre qui n'existe déjà dans `v2.html`. Couleurs : les variables de `:root` (`--prim`, `--prim-f`, `--prim-c`, `--prim-cc`, `--encre`, `--titre`, `--doux`, `--trait`, `--fond`, `--carte`, `--vert`, `--vert-c`, `--vert-t`, `--orange`, `--orange-c`, `--orange-t`, `--rouge`, `--rouge-c`, `--gris-c`) ; tailles de texte `--t1` à `--t8` ; rayons `--r-l`, `--r-m`, `--r-s` ; ombre `--ombre`. Aucune valeur de couleur écrite en dur. Le CSS propre au module va dans une partie « Lot RTR » de `v2.html`, comme les lots précédents.

| Besoin du module | À réutiliser dans le dépôt | Où il sert déjà |
| --- | --- | --- |
| Cadre de page | Menu latéral, en-tête (`titrePage`), recherche du haut `#trQ` (patients, inchangée) | Toutes les pages |
| Organisation du code | Un fichier `js/app/radiotherapie.js` avec `installer(api)` et `pageRadiotherapie(arg)`, branché dans `v2.js` comme `protocoles.js` ; calculs purs dans `js/moteur/rtref.js` | `protocoles.js`, `moteur/recherche.js` |
| Menus en cascade | `menusCascade` et `valeursCascade` de `chimio.js` : chaque schéma porte un `ind` = \[région, localisation, situation, fractionnement\] pour réutiliser ce composant tel quel | Page Protocoles, « Nouvelle ligne chimio » |
| Tri des résultats | `trierRecherche` de `moteur/recherche.js` ; accents retirés comme `sa()` / `sansAcc` | Page Protocoles |
| Liste, en-tête de page, cartes | `section.accueil`, `.carte`, `.mesures`, `.sous`, `.vide-c` | Protocoles, tableau de bord |
| Boutons | `.bt plein` (un seul par écran, en modification), `.bt clair`, `.bt gris`, `.bt petit`, `.bt rouge`, `.mini` | Partout |
| Badges | `.badge b-ch` (Validé, avec l'icône `check`), `.badge b-or` (Modifié pour le cabinet) ; contraste d'au moins 4,5 pour 1 (variables `--vert-t`, `--orange-t`) | Protocoles |
| Onglets | `ag-vues defile` (une ligne qui défile, flèches ajoutées par `v2.js`) | Agenda, Paramètres |
| Menu ⋯ | `menuPts` / `ouvrirPts` | Lignes du dossier, salle d'attente |
| Fenêtres | `fenetre(html)` pour un formulaire ; `question(html, boutons)` de `ordonnances.js` pour une confirmation (l'exporter dans l'`API` ; l'étape 4.2 de la feuille de route n'est pas faite) | Ordonnances |
| Messages brefs | `toast(texte)` (3,8 s) | Partout |
| Icônes | `ic(nom)` : `etoile`, `imprimer`, `crayon`, `plus`, `loupe`, `croix`, `retour`, `telecharger`, `radiation`, `check` ; ajouter un symbole `i-copier` dans `v2.html`, au même trait ; aucun émoji | Partout |
| Impression | Fonction d'impression commune ; mise en page de la fiche de chimiothérapie (`fiche.js`) comme modèle | Fiche de chimio |
| Échappement | `esc` de l'`API` pour tout texte affiché | Partout |

Aucune `alert()`, `confirm()` ni `prompt()` dans le module.

### 1. Parcours et principes

| Moment | Ce que le médecin cherche | Chemin visé |
| --- | --- | --- |
| Consultation, RCP | Le schéma d'une situation et son essai | Menu › Radiothérapie, taper « prostate 60 », Entrée : la fiche est ouverte. Un favori : un clic depuis l'accueil du module |
| Contourage | Volumes, marges, OAR à contourer | Fiche › Contourage ; la fiche se rouvre sur le dernier onglet choisi |
| Validation de la dosimétrie | Les contraintes du fractionnement | Fiche › Contraintes : un tableau lisible à côté du logiciel de dosimétrie |
| Prise en charge, courrier | La référence à citer | Fiche › Essais et sources › « Copier la référence » |
| Réirradiation | L'EQD2 d'un traitement passé | Fiche › Prescription › « EQD2 » : calcul prérempli |

**Principes :**

1. Lecture d'abord : en lecture, aucun bouton plein. Le seul bouton principal du module est « Enregistrer pour le cabinet », en modification.
2. Ordre de lecture fixe : dose, volume, séances, rythme, puis le reste.
3. Même chose, même place : les actions de la fiche sont toujours en haut à droite, dans le même ordre ; les onglets gardent leur ordre, même vides.
4. Aucun mode d'emploi à l'écran : pas de phrase d'aide permanente ; une explication passe sous « ? ».
5. La couleur porte un sens : `--prim` pour l'action et la sélection, orange pour « Modifié pour le cabinet », rouge seulement pour supprimer ou revenir à la référence. Aucun chiffre médical en couleur.
6. Gestes sûrs : ce qui efface est dans ⋯, en dernier, avec une confirmation qui dit ce qui sera perdu.
7. Rien de décoratif : ni dégradé, ni effet de verre, ni animation, en dehors de ce qu'Onco360 fait déjà.

### 2. Page Référentiel

**Disposition sur ordinateur.** En haut de la page, le champ de recherche du module sur toute la largeur, fixé au défilement (distinct de la recherche de patients de la barre du haut). Dessous, une ligne : les quatre menus (Région, Localisation, Situation, Fractionnement), « Effacer » dès qu'un filtre est posé, et à droite « + Nouveau schéma » (`.bt clair`, droit `modifier`). Dessous, la liste. À partir de 1 280 px, la page passe sur deux colonnes : la liste à gauche (environ 40 %), la fiche du schéma choisi à droite ; chaque colonne défile seule, la liste garde sa position. Le panneau du dossier (`panneau()`) ne sert pas ici : il ne marche que dans le dossier.

**Accueil du module** (recherche vide, menus sur « Toutes ») : pas la liste des 300 schémas, mais trois blocs sur une colonne.

- **Favoris** : les schémas étoilés par la personne connectée (`utilisateurs/{uid}.rtFavoris`). Absent tant qu'il n'y en a aucun.
- **Consultés récemment** : les 8 derniers schémas ouverts par la personne (`rtRecents`). Absent au premier usage.
- **Sommaire** : les 48 localisations, groupées par région, en colonnes, chacune avec son nombre de schémas ; un clic règle Région et Localisation. En tête du sommaire, « Curiethérapie (n) » règle le menu Fractionnement.

**Autre entrée.** Dans l'onglet Radiothérapie du dossier patient, un lien « Référentiel › » ouvre le module filtré sur la localisation du dossier (`clinique.diag`, traduit par `diag-localisation.json`). Sans correspondance, le module s'ouvre sur son accueil. Le module ne lit rien d'autre du dossier et n'y écrit rien. Le lien n'apparaît qu'avec le droit `referentielRT` et la fonction `rt.referentiel`.

- **Recherche libre** : un seul champ, résultats dès 2 caractères, sans tenir compte des accents ni des majuscules. Elle porte sur le titre du schéma, la région, la localisation, la situation (titre, critères, contexte), le type, les doses et séances des prescriptions, les acronymes d'essais et les sources institutionnelles (tout est dans `index.json`). Plusieurs mots se cumulent (« prostate hypofrac », « col curiethérapie »).
- **Synonymes** : hypo, hypofrac → Hypofractionné ; normo → Normofractionné ; stéréo, SBRT, SABR → Stéréotaxie ; curie, HDR, PDR, LDR → Curiethérapie ; post-op, postopératoire, adjuvant → Post-opératoire ; RCT → radiochimiothérapie.
- **Doses** : « 45 Gy » ou « 45Gy » trouve tout schéma dont une ligne de prescription vaut 45 Gy ; « 5 fx » trouve le nombre de séances ; un nombre seul cherche aussi dans les titres.
- **Clavier (ordinateur)** : le curseur est dans la recherche du module à l'ouverture ; ↓ et ↑ parcourent les résultats, Entrée ouvre, Échap vide la recherche.
- **Menus en cascade** : Région → Localisation → Situation → Fractionnement, par `menusCascade`. Chaque menu ne propose que les valeurs qui ont au moins un schéma compte tenu des menus précédents et de la recherche, avec le nombre de schémas entre parenthèses. Par défaut : « Toutes ». Changer un menu vide ceux qui suivent s'ils ne sont plus valables.
- **Menu Situation** : avant le choix d'une localisation, il propose les contextes (En place, Post-opératoire, Rattrapage, Métastatique, Oligométastatique, Palliatif, Réirradiation) ; ensuite, les situations de la localisation, groupées par contexte.
- **Menu Fractionnement** : Normofractionné (`rte_normo`), Hypofractionné (`rte_hypo`), Stéréotaxie (`sbrt`), Curiethérapie (`curie_hdr`, `curie_pdr`, `curie_ldr`), RTE + curiethérapie (`rte_plus_curie`).
- **Résultats en liste**, pas en cartes : une ligne par schéma, deux lignes de texte au plus. Ligne 1 : le titre (« RCT 45 Gy / 25 fx + curiethérapie HDR 4 × 7 Gy ») et l'étoile à droite. Ligne 2, en petit (`.mesures`) : localisation › situation · acronymes des essais (3 au plus, puis « +n ») · type en texte gris (« Hypofractionné ») · badge orange « Modifié pour le cabinet » s'il y a lieu. Le badge « Validé » n'est pas répété sur chaque ligne : tout schéma visible est validé, et le badge figure dans l'en-tête de la fiche.
- **Tri** : région, localisation, ordre de la situation, puis niveau de preuve (règle 2 des Règles d'affichage) ; avec une recherche, `trierRecherche` d'abord. Un intertitre par localisation quand la liste en couvre plusieurs, fixé en haut pendant le défilement. Compteur « n schémas » au-dessus ; termes recherchés surlignés.
- **Situation choisie** : ses `criteres` s'affichent sur une ligne au-dessus de la liste (suite sous « ? »).
- Recherche et menus restent en mémoire pendant la session : Retour depuis une fiche retrouve la même liste.

### 3. Fiche d'un schéma

**En-tête**, fixé en haut de la fiche, trois lignes au plus :

- Ligne 1 : fil d'Ariane (Uro › Prostate › Risque faible et intermédiaire favorable) ; chaque segment règle les menus de la liste.
- Ligne 2 : le titre ; à droite, dans cet ordre : étoile, Imprimer, « Modifier pour le cabinet » (`.bt clair`, droit `modifier`), ⋯.
- Ligne 3 : le résumé de prescription en texte courant, « 60 Gy / 20 fx (3 Gy/fx) · PTV\_PRO · 5 fx/sem », puis les badges Validé et preuve, et en gris « Vérifié le 24/10/2026 ». Plusieurs volumes : le volume de plus haute dose, puis « + 2 volumes ».
- Menu ⋯ : Dupliquer ; Voir la référence et Revenir à la référence, seulement si le schéma est modifié pour le cabinet, ce dernier en rouge et en dernier.
- Schéma modifié : une ligne sous l'en-tête, pas un bandeau : badge orange « Modifié pour le cabinet » · « par Dr X le JJ/MM/AAAA » · lien « Voir la référence ». Si la référence a changé depuis (`date_maj` > `base`), la même ligne ajoute « La référence a changé depuis » et un lien vers la comparaison. Rien n'est fusionné automatiquement.

**Onglets** (`ag-vues defile`) : Prescription · Centrage · Contourage · Contraintes · Essais et sources · Points d'attention. C'est l'ordre de la chaîne de traitement ; il ne change jamais. Le nombre d'éléments suit le nom quand il aide (« Contraintes 15 », « Essais 3 »). Un onglet sans contenu reste à sa place, en gris, et affiche la phrase de l'onglet de contenu (« Pas de fiche de centrage du service pour cette localisation »). L'onglet ouvert est gardé d'un schéma à l'autre pour la personne (`rtOnglet`), car on valide souvent plusieurs dosimétries de suite ; il figure dans l'adresse (`#radiotherapie/s/<schemaId>/contraintes`).

**Tableaux**, dans tous les onglets :

- chiffres alignés à droite, à chasse fixe (`font-variant-numeric: tabular-nums`) ; l'unité dans l'en-tête quand la colonne n'en a qu'une ;
- en-tête du tableau fixé pendant le défilement ;
- une cellule affiche une phrase courte, la suite sous « ? » (Règles d'affichage) ;
- valeur vide : « — », avec la note sous « ? » (dose à définir, PDR, LDR).

**Prescription** : le tableau Volume · Dose totale · Séances · Dose par séance · Mode · Rythme. Les lignes d'un même SIB sont regroupées ; en séquentiel, elles suivent l'ordre des phases. Un schéma RTE + curiethérapie a deux tableaux, « Radiothérapie externe » puis « Curiethérapie ». En bout de ligne, un lien discret « EQD2 » ouvre la calculatrice préremplie avec la dose par séance et le nombre de séances (absent quand la ligne n'a pas de dose). Puis le traitement systémique associé, une ligne par traitement ; puis les objectifs de couverture ; puis la note du médecin, s'il y en a une.

**Centrage** : la fiche de simulation en libellés et valeurs, une ligne chacun : Position, Contention, Préparation, Scanner, Imagerie, Repères.

**Contourage** : le tableau des volumes, Nom · Type · Définition · Quand · Marge ; le type (GTV, CTV, ITV, PTV) en badge neutre, la marge en évidence. Puis « Organes à risque à contourer » : liste compacte, nom français et nom TG-263 ; « ? » donne la définition de la bibliothèque. Les atlas sont des liens qui s'ouvrent dans un nouvel onglet.

**Contraintes**, l'écran de la validation de dosimétrie :

- un bloc par jeu, avec son titre, son fractionnement et sa source au-dessus ; s'il y a plusieurs jeux, leurs noms servent de raccourcis en haut de l'onglet (RTE, puis curiethérapie) ;
- lignes groupées par OAR : le nom de l'OAR une fois (français, puis TG-263 en petit), puis ses indicateurs ;
- colonnes Indicateur · Idéal · Limitant · Note ; « ? » à côté d'Idéal et de Limitant (`aide_colonnes`) ; Limitant en gras, sans couleur ;
- un bouton « Copier » par jeu copie le tableau en texte tabulé (`navigator.clipboard.writeText`), à coller dans un courrier ou une demande au physicien ; `toast("Tableau copié")` ;
- sans jeu lié : « Aucun jeu publié pour ce fractionnement ».

**Essais et sources** : une liste, pas des cartes. Une ligne par essai : acronyme, revue et année, résultat principal en une phrase ; à droite, liens PubMed et DOI. Un clic déplie la population et les bras. « Copier la référence » copie l'acronyme, la revue, l'année et le PMID. Puis la source institutionnelle, avec le nom du centre et l'année du document.

**Points d'attention** : liste à puces, sans encadré.

**Lien vers Protocoles.** Chaque ligne du traitement systémique affiche « Ouvrir dans Protocoles › », qui ouvre `#protocoles/<id>` : route à ajouter à la page Protocoles (aujourd'hui sans argument), qui ouvre la fiche du protocole (`prOuvrir(id)`). Le protocole est cherché dans la bibliothèque du cabinet par `protocole_id`, puis par le nom exact `protocole`. Introuvable, ou `protocole` vaut « — » (protocole choisi en RCP) : le lien ouvre la page Protocoles filtrée sur la localisation. Cabinet sans module chimio ou sans la fonction `chimio.protocoles` : le nom du protocole s'affiche sans lien. Retour ramène à la fiche, sur le même onglet.

### 4. Modification pour le cabinet (médecin, droit `modifier`)

- « Modifier pour le cabinet » passe la fiche en modification sur place : même en-tête, mêmes onglets, des champs à la place des valeurs. Pas de formulaire à part.
- Une barre fixée en bas, comme celle du jour de cure, porte « Annuler » à gauche et « Enregistrer pour le cabinet » (`.bt plein`) à droite, avec le nombre de champs modifiés.
- Un champ modifié garde un fond `--prim-c` jusqu'à l'enregistrement.
- « + Ajouter une ligne » sous chaque tableau ; une ligne se supprime par son ⋯.
- Les contrôles s'affichent sous le champ, pendant la saisie, jamais dans une fenêtre : dose par séance différente de dose totale / séances (écart toléré 0,01 Gy) ; nombre nul ou négatif. « Enregistrer » reste inactif tant qu'un contrôle échoue, et dit pourquoi au survol et au toucher.
- Quitter avec des changements non enregistrés : `question("Quitter sans enregistrer ?", [Rester, Quitter])`.
- Après l'enregistrement : `toast("Enregistré pour le cabinet")`, et la ligne « Modifié pour le cabinet » apparaît sous l'en-tête. L'écriture relit la fiche dans une transaction : si un collègue l'a changée entre-temps, rien n'est écrasé et la fiche se recharge avec un message.
- Voir la référence : deux colonnes, Référence et Version du cabinet, différences surlignées ; sur téléphone, un sélecteur Référence / Version du cabinet.
- Revenir à la référence : `question()` dit ce qui sera perdu (« Les modifications du JJ/MM/AAAA seront supprimées pour tout le cabinet ») ; bouton `.bt rouge` « Revenir à la référence ». Puis un `toast` avec « Annuler » pendant 10 secondes ; la fiche du cabinet n'est supprimée qu'après.
- Dupliquer ouvre la copie en modification (identifiant `cab-…`, `nouveau: true`, `copie_de`), avec le titre « Copie de … » sélectionné ; preuve `pratique_du_cabinet`.
- « + Nouveau schéma » ouvre le même écran vide, avec la région, la localisation et la situation des menus.
- Champ « Note du médecin » en bas de l'onglet Prescription.

### 5. Sous-pages Organes à risque, Contraintes, Essais

- **Organes à risque** : recherche et menu Région ; tableau Nom · TG-263 · Définition (une phrase, suite sous « ? ») · Source. Un clic déplie le détail, avec « Utilisé dans n schémas ».
- **Contraintes** : un menu de choix du jeu, avec recherche, groupé par région (ex. « Prostate — 3 Gy/fx, 20 séances — Curie ») ; puis le même tableau que dans la fiche, par la même fonction.
- **Essais** : tableau triable (acronyme, année, localisation, revue) avec recherche ; un clic déplie le détail, avec la liste des schémas qui le citent.

### 6. Calcul BED / EQD2

Un seul écran, lu de haut en bas : ce que l'on saisit, puis le résultat, juste dessous. Tout se recalcule pendant la frappe, sans bouton « Calculer ». Pas de clavier dessiné à l'écran : le clavier numérique de l'appareil. Les calculs se font en pleine précision ; seul l'affichage est arrondi.

**Disposition**

1. **Traitements.** Une ligne par traitement ou par phase : deux champs côte à côte, « Dose par fraction (Gy) » et « Fractions », puis la dose totale calculée en gris (« = 45,0 Gy »). L'écran s'ouvre sur une seule ligne. « + Ajouter un traitement » en ajoute une (réirradiation, complément, curiethérapie) ; dès deux lignes, chacune a une croix pour la retirer.
2. **Total**, sur une ligne sous les traitements : « Total : 27 fractions · 63,0 Gy », seulement s'il y a au moins deux lignes.
3. **Résultat**, un seul tableau, une colonne par α/β. Les en-têtes valent 1,5, 3 et 10 Gy par défaut ; un clic sur un en-tête le rend modifiable. Trois lignes, dans cet ordre :
   - **EQD2**, la ligne principale, en gras et en plus grand. Son libellé porte le champ de la dose de référence : « EQD en \[2,0\] Gy/fx » ; changer 2,0 donne l'EQDx.
   - **BED**, la somme des BED de toutes les lignes.
   - **Dose par fraction en \[25\] fractions**, avec le nombre de fractions modifiable dans le libellé.
4. **Détail par traitement**, replié et proposé seulement s'il y a au moins deux lignes : la BED de chaque ligne, pour chaque α/β.
5. Sous le résultat : « Modèle linéaire-quadratique, sans correction de temps. Indicatif. », puis le lien « Tout effacer ».

Sans saisie valable, le tableau de résultat affiche « — » dans chaque case. Sur téléphone, la même disposition tient dans la largeur, sans défilement de la page : les deux champs restent côte à côte, les libellés du résultat se raccourcissent (« EQD2 », « BED », « Dose/fx en 25 fx »).

**Calculs** (i = ligne de traitement)

- Dose totale de la ligne : n·d, en 1 décimale.
- BED de la ligne : n·d·(1 + d / (α/β)) ; BED du résultat : la somme des lignes, en 1 décimale.
- EQDx = BED / (1 + x / (α/β)), en 1 décimale ; x = 2,0 par défaut.
- Dose par fraction en N fractions qui donne la même BED : d\_N = \[ −α/β + √((α/β)² + 4·(α/β)·BED / N) \] / 2, en 2 décimales ; N = 25 par défaut.

```latex
BED_i = n_i d_i \left(1 + \frac{d_i}{\alpha/\beta}\right) \qquad BED = \sum_i BED_i \qquad EQD_x = \frac{BED}{1 + \frac{x}{\alpha/\beta}} \qquad d_N = \frac{-\alpha/\beta + \sqrt{(\alpha/\beta)^2 + 4\,(\alpha/\beta)\,BED/N}}{2}
```

**Cas de contrôle**, à reproduire avant livraison (écart toléré 0,1 en dernière décimale) : 1,8 Gy × 25 puis 9,0 Gy × 2, α/β = 1,5 / 3 / 10.

| Résultat | α/β 1,5 | α/β 3 | α/β 10 |
| --- | --- | --- | --- |
| EQD2 | 96,4 | 86,4 | 72,7 |
| BED (27 fx, 63,0 Gy) | 225,0 | 144,0 | 87,3 |
| Dose par fraction en 25 fx | 3,00 | 2,92 | 2,74 |
| Détail : BED de 1,8 Gy × 25 | 99,0 | 72,0 | 53,1 |
| Détail : BED de 9,0 Gy × 2 | 126,0 | 72,0 | 34,2 |

**Saisie**

- Virgule ou point acceptés ; sur téléphone, clavier numérique (`inputmode="decimal"`).
- Entrée passe au champ suivant : dose, fractions, puis la ligne suivante.
- Une valeur nulle, négative ou non numérique met le champ en erreur ; sa ligne ne compte pas.
- Ouvert depuis une fiche (lien « EQD2 »), la première ligne reprend la dose par séance et le nombre de séances de la ligne de prescription.
- « Tout effacer » revient à une ligne vide et aux valeurs par défaut (α/β, 2,0 Gy/fx, 25 fractions).

### 7. Ordinateur, tablette, téléphone

Seuils d'Onco360 : 640, 900 et 1 280 px.

| Largeur | Liste | Fiche | À retenir |
| --- | --- | --- | --- |
| 1 280 px et plus | Colonne de gauche, environ 40 % | Colonne de droite | Clavier complet |
| 900 à 1 279 px | Pleine largeur | Page entière (`#radiotherapie/s/…`), Retour en haut à gauche ; la liste retrouve sa position | Zones tactiles de 44 px |
| Moins de 900 px | Recherche fixée en haut ; un bouton « Filtres (n) » ouvre les quatre menus, comme le bouton Filtres de la salle d'attente (`saFiltres`) | Page entière ; en-tête réduit au titre et au résumé ; étoile et ⋯ seuls en haut (Imprimer et Modifier passent dans ⋯) ; onglets sur une ligne qui défile, fixée | Sous 640 px, tableaux en lignes empilées : une contrainte = OAR et indicateur sur une ligne, Idéal et Limitant dessous ; jamais de défilement horizontal de la page ; « ? » s'ouvre au toucher |

### 8. États de l'écran

| État | Ce qui s'affiche |
| --- | --- |
| Chargement | Six lignes grises à la place des résultats, sans roue qui tourne ; rien ne se décale à l'arrivée des résultats |
| Aucun résultat | « Aucun schéma ne correspond », le mot qui bloque avec « Chercher sans "…" », et « Effacer les filtres » |
| Localisation sans contenu | Grisée dans le menu : « En cours de rédaction » |
| Réseau coupé | Onco360 ne garde pas de copie hors ligne : ce qui est déjà chargé reste lisible ; un fichier ou un enregistrement impossible donne un `toast` « Pas de connexion : réessayez » et la saisie est conservée |
| Erreur de chargement | « Le référentiel n'a pas pu être chargé » et « Réessayer » |
| Erreur d'enregistrement | La barre du bas reste ; le message s'affiche au-dessus ; la saisie est conservée ; « Réessayer » |
| Enregistré, copié | `toast` |
| Droit `voir` ou membre sans droit `modifier` | Aucun bouton de modification, pas même grisé |

### 9. Impression et formats

- **Imprimer la fiche** : une `fenetre()` propose les sections à cocher (Prescription, Centrage, Contourage, Contraintes, Essais, Points d'attention), toutes cochées. A4 portrait, par la fonction d'impression commune : en-tête Onco360 et nom du médecin, sections à la suite, sources en pied de page, date d'impression. Une version modifiée imprime en tête « Version du cabinet, modifiée le JJ/MM/AAAA ».
- **Affichage des doses** : « 60 Gy / 20 fx (3 Gy/fx) » ; virgule décimale ; Gy, %, cm³ avec une espace insécable avant l'unité.

### 10. Critères d'acceptation

Le développeur les mesure avant de livrer, avec le jeu fictif.

1. Depuis l'accueil du module, un favori s'ouvre en un clic ; un schéma cherché, en deux mots et Entrée.
2. De la fiche ouverte au tableau des contraintes : un clic, aucun si Contraintes était le dernier onglet ouvert.
3. À 390, 900, 1 280 et 1 440 px : aucun défilement horizontal de la page, aucun titre de schéma coupé dans la liste (`tests/test_debordement.py` étendu au module).
4. Contraste du texte et des badges d'au moins 4,5 pour 1 ; zones tactiles d'au moins 44 px au toucher.
5. Aucun `alert`, `confirm` ni `prompt` ; aucune couleur écrite en dur ; aucune icône hors du jeu de `v2.html` ; ESLint sans nouvelle erreur.
6. Résultats affichés en moins de 100 ms après la frappe, sur les 300 schémas.
7. Tout se fait au clavier, avec un contour visible.
8. Une formule « Radiothérapie » sans module chimio : module complet, noms des protocoles sans lien.
9. Secrétaire avec le droit `voir` : tout lisible, aucun bouton de modification, écriture refusée par les règles.

## Règles d'affichage

Chaque chiffre affiché doit pouvoir être rattaché à sa source en un clic, et l'utilisateur doit toujours savoir s'il lit la référence ou la version de son cabinet.

**Badges :**

| Badge | Valeurs affichées | Classe |
| --- | --- | --- |
| Statut | Validé (en-tête de la fiche seulement) | `.badge b-ch` |
| Preuve | Essai de phase 3 · Recommandation · Pratique institutionnelle (nom du centre) · Option · Pratique du cabinet | Neutre, sans couleur |
| Modification | Modifié pour le cabinet | `.badge b-or` |

**Règles :**

1. Tout schéma de la référence est validé ; il n'y a ni brouillon ni écart dans l'application.
2. Dans une situation, les schémas s'affichent dans l'ordre : preuve de phase 3, recommandation, pratique institutionnelle, option, pratique du cabinet ; à preuve égale, dans l'ordre du fichier.
3. Un essai cité sur une fiche ouvre sa ligne dans l'onglet Essais et sources ; une pratique institutionnelle affiche le nom du centre et l'année du document.
4. Les contraintes « idéales » et « limitantes » sont dans deux colonnes distinctes ; une cellule vide reste vide.
5. L'application ne calcule aucune dose de prescription. Seuls calculs autorisés : la calculatrice BED / EQD2 et le contrôle dose / séance à l'enregistrement.
6. Chaque fiche affiche « Vérifié le JJ/MM/AAAA » (champ `date_verif`).
7. Le texte des champs est affiché tel quel (pas de reformulation, pas de traduction).
8. Textes longs : une cellule ou une ligne affiche au plus une phrase courte (environ 90 caractères). La suite passe sous un « ? » (info-bulle au survol, panneau au toucher). Une explication fixe (définition d'Idéal et de Limitant, PTVéval, EQD2…) est un « ? » à côté de l'en-tête concerné, jamais un paragraphe.
9. Seul le contenu sourcé est publié : aucune mention « Source non vérifiée » ni « non lié à ce schéma ». Un jeu, un schéma ou une ligne sans source n'apparaît pas.
10. Pas de bandeau d'avertissement permanent en haut du module.
11. Jamais la mention « hors référentiel », ni ici ni dans le dossier (refus de la feuille de route).

## Index des onglets de contenu

Une localisation est livrée (prostate, curiethérapie comprise) ; les bibliothèques grossiront à chaque lot. Le développeur importe chaque onglet dans le fichier JSON indiqué.

| Onglet | Fichier JSON | Statut | Contenu |
| --- | --- | --- | --- |
| Uro — Prostate | `prostate.json` | Validé | 9 situations, 27 schémas (dont 5 avec curiethérapie), centrage, volumes, hormonothérapie, points d'attention |
| Uro — Vessie | `vessie.json` | Validé | 3 situations, 5 schémas, centrage, volumes, traitement systémique ; pas de curiethérapie |
| Uro — Séminome testiculaire | `seminome.json` | Validé | 2 situations, 4 schémas (stade I : 20 Gy / 10 fx ou 30 Gy / 15 fx para-aortique, TE18 et TE10 ; stade IIA 30 Gy et IIB 36 Gy) ; pas de curiethérapie |
| Uro — Pénis | `penis.json` | Validé | 1 situation, 2 schémas (curiethérapie interstitielle 60 Gy bas débit ou débit pulsé, consensus ABS-GEC-ESTRO ; débit pulsé guidé par scanner, Gustave Roussy) ; contraintes de l'urètre distal Gustave Roussy |
| Gynéco — Col utérin | `col.json` | Validé | 3 situations, 7 schémas (5 avec curiethérapie : HDR 4 × 7, 5 × 5,5 et 5 × 6 Gy, PDR Curie, fond vaginal), centrage RTE et curiethérapie, volumes EMBRACE II |
| Gynéco — Endomètre | `endometre.json` | Validé | 3 situations, 6 schémas (3 avec curiethérapie vaginale) ; volumes et centrage post-opératoires partagés avec le col opéré |
| Gynéco — Vagin | `vagin.json` | Validé | 2 situations, 2 schémas (curiethérapie exclusive ; RTE + curiethérapie, dose de curiethérapie à définir sur la dosimétrie) |
| Gynéco — Vulve | `vulve.json` | Validé | 2 situations, 3 schémas (post-opératoire, exclusif Curie, GOG 205) |
| Digestif — Rectum | `rectum.json` | Validé | 3 situations, 8 schémas (RCT, 5 × 5 Gy, RAPIDO, PRODIGE 23, post-opératoire) ; pas de curiethérapie |
| Digestif — Canal anal | `canal_anal.json` | Validé | 2 situations, 6 schémas (service, ACT II, AGITG, RTOG 0529) ; contraintes du tableur du service (seul jeu disponible) ; pas de curiethérapie |
| ORL — Cavité buccale | `cavite_buccale.json` | Validé | 3 situations, 9 schémas (post-opératoire Curie et service, RT exclusive Curie, service et Gustave Roussy, curiethérapie PDR et HDR) ; centrage et volumes ORL communs |
| ORL — Oropharynx | `oropharynx.json` | Validé | 3 situations, 8 schémas (RCT Curie, RTOG 1016, service, Gustave Roussy, post-opératoire, complément PDR de la base de langue) |
| ORL — Larynx | `larynx.json` | Validé | 3 situations, 10 schémas (glotte T1 à 2,25 Gy, T2, préservation laryngée par RCT ou TPF, post-opératoire) |
| ORL — Hypopharynx | `hypopharynx.json` | Validé | 2 situations, 7 schémas (RCT, induction TPF, post-opératoire) |
| ORL — Cavum | `cavum.json` | Validé | 2 situations, 6 schémas (Curie, Gustave Roussy, RTOG 0225) ; induction gemcitabine-cisplatine ou TPF |
| ORL — Sinus et cavités nasales | `sinus.json` | Validé | 2 situations, 4 schémas (post-opératoire Curie et service, RT exclusive) |
| ORL — Glandes salivaires | `glandes_salivaires.json` | Validé | 2 situations, 3 schémas (post-opératoire, RT exclusive) |
| ORL — Situations palliatives | `orl_palliatif.json` | Validé | 2 situations, 6 schémas (split course Curie, QUAD SHOT, Hypo Trial, 30 Gy / 10 fx, 8 Gy) |
| Thorax — Poumon | `poumon.json` | Validé | 6 situations, 18 schémas : RCT 60 Gy + durvalumab, RT post-opératoire, SBRT (Curie et Gustave Roussy), CBPC limité et étendu, IPC, palliatif |
| Thorax — Mésothéliome | `mesotheliome.json` | Validé | 3 situations, 3 schémas (hémithorax après chirurgie épargnant le poumon, SMART, palliatif) |
| Thorax — Thymome | `thymome.json` | Validé | 2 situations, 4 schémas (RT post-opératoire R0 50 Gy, R1 54 Gy, R2 60 Gy ; RT exclusive 60 à 66 Gy avec étoposide-cisplatine) ; pas de curiethérapie |
| Sein — Carcinome infiltrant | `sein.json` | Validé | 7 situations, 20 schémas (40 Gy / 15 fx, 26 Gy / 5 fx, 50 Gy / 25 fx, surimpressions séquentielles et intégrées, paroi, ganglions, irradiation partielle externe et curiethérapie GEC-ESTRO) |
| Sein — Carcinome in situ | `sein_ccis.json` | Validé | 2 situations, 5 schémas (50 Gy, 42,5 Gy ou 40 Gy, ± surimpression) |
| Digestif — Œsophage | `oesophage.json` | Validé | 3 situations, 7 schémas (CROSS, RCT exclusive 50 Gy, schéma du service, curiethérapie HDR palliative, RT palliative) |
| Digestif — Estomac | `estomac.json` | Validé | 2 situations, 3 schémas (INT-0116, RT hémostatique) ; pas de curiethérapie |
| Digestif — Pancréas | `pancreas.json` | Validé | 3 situations, 5 schémas (LAP07, SBRT, SMART, PREOPANC, RTOG 0848) ; pas de curiethérapie |
| Digestif — Foie et voies biliaires | `foie.json` | Validé | 5 situations, 8 schémas (SBRT du CHC, thrombose porte, métastases, voies biliaires) ; pas de curiethérapie |
| SNC — Glioblastome | `glioblastome.json` | Validé | 2 situations, 5 schémas (Stupp, CeTeG, 40 Gy / 15 fx, 25 Gy / 5 fx, 34 Gy / 10 fx) ; centrage crâne commun aux tumeurs cérébrales |
| SNC — Gliomes de grade 2 et 3 | `gliome.json` | Validé | 3 situations, 4 schémas (grade 2 à 50,4 ou 54 Gy, grade 3 à 59,4 Gy avec PCV ou témozolomide) |
| SNC — Métastases cérébrales | `metastases_cerebrales.json` | Validé | 4 situations, 20 schémas : radiochirurgie et stéréotaxie Curie, RTOG 90-05, JLGK0901, cavité, encéphale in toto avec ou sans épargne hippocampique, réirradiation ; centrage et volumes de stéréotaxie communs |
| SNC — Méningiome | `meningiome.json` | Validé | 3 situations, 7 schémas (grade 1, risque intermédiaire et haut risque RTOG 0539, EORTC 22042, radiochirurgie, schémas du service) |
| SNC — Schwannome vestibulaire | `schwannome.json` | Validé | 1 situation, 3 schémas (radiochirurgie 12 Gy, 57,6 Gy / 32 fx, 25 Gy / 5 fx) |
| SNC — Adénome hypophysaire | `hypophyse.json` | Validé | 2 situations, 3 schémas (45 Gy / 25 fx, radiochirurgie 15 Gy) |
| SNC — Craniopharyngiome | `craniopharyngiome.json` | Validé | 1 situation, 3 schémas (54 et 50,4 Gy, radiochirurgie) |
| SNC — Neurocytome central | `neurocytome.json` | Validé | 1 situation, 3 schémas (54 Gy, schéma du service 54 puis 59,4 Gy, radiochirurgie) |
| SNC — Épendymome de l'adulte | `ependymome.json` | Validé | 1 situation, 2 schémas (grade 2 : 54 Gy, grade 3 : 59,4 Gy, EANO 2018 et KROG 18-06) ; épendymome spinal en point d'attention |
| SNC — Médulloblastome de l'adulte | `medulloblastome.json` | Validé | 1 situation, 1 schéma (craniospinale 35,2 Gy puis fosse postérieure jusqu'à 55,2 Gy, HIT 2000) ; chimiothérapie NOA-07 et HIT 2000 |
| Os et palliatif — Métastases osseuses | `metastases_osseuses.json` | Validé | 2 situations, 8 schémas (8 Gy, 20 Gy / 5 fx, 24 Gy / 6 fx, 30 Gy / 10 fx ; compression médullaire : chirurgie puis RT, SCORAD III, SCORE-2) ; pas de curiethérapie |
| Os et palliatif — Stéréotaxie osseuse | `sbrt_os.json` | Validé | 3 situations, 7 schémas (SC.24 24 Gy / 2 fx, 3 × 8 Gy, 3 × 9 Gy et 3 × 10 Gy, 24 Gy / 1 fx, réirradiation 5 × 6 Gy, bassin 3 × 9 Gy) ; moelle : seuils HyTEC |
| Os et palliatif — Surrénale | `surrenale.json` | Validé | 1 situation, 3 schémas (Gustave Roussy 5 × 9 Gy, service 45 Gy / 5 fx, 60 Gy / 8 fx) |
| Os et palliatif — Réirradiation | `reirradiation.json` | Validé | 6 situations, 10 schémas (ORL post-opératoire et exclusive, glioblastome, sein, rectum, os) ; curiethérapie des récidives mammaires ; cumul de dose à la moelle |
| Sarcomes — Membres et tronc | `sarcome_membres.json` | Validé | 2 situations, 6 schémas (pré-opératoire 50 Gy / 25 fx et 42,75 Gy / 15 fx, post-opératoire R0, R1 et R2 de la fiche du service, curiethérapie adjuvante bas débit 42 à 45 Gy) |
| Sarcomes — Rétropéritoine | `sarcome_retroperitoine.json` | Validé | 1 situation, 1 schéma (RT pré-opératoire 50,4 Gy / 28 fx, Gustave Roussy, STRASS) ; contraintes Gustave Roussy ; pas de curiethérapie |
| Sarcomes — Chordome | `chordome.json` | Validé | 1 situation, 2 schémas (tableur du service 70,4 / 56 Gy en 32 fx, photons-protons jusqu'à 77,4 Gy RBE de DeLaney) ; contraintes de la moelle de DeLaney |
| Peau — Carcinomes basocellulaires et épidermoïdes | `peau_carcinome.json` | Validé | 2 situations, 5 schémas (RT exclusive 60 à 70 Gy ou 48 Gy / 12 fx, post-opératoire 60 Gy / 30 fx TROG 05.01, curiethérapie de contact haut débit 40 et 30 Gy / 10 fx) |
| Peau — Carcinome de Merkel | `merkel.json` | Validé | 3 situations, 3 schémas (lit tumoral 50 Gy / 25 fx, aires ganglionnaires 50 à 56 Gy, maladie macroscopique 56 Gy ou plus) ; pas de curiethérapie |
| Peau — Mélanome | `melanome.json` | Validé | 1 situation, 1 schéma (48 Gy / 20 fx après curage ganglionnaire, TROG 02.01) ; pas de curiethérapie |
| Autres — Mélanome uvéal | `melanome_uveal.json` | Validé | 1 situation, 2 schémas (plaque épisclérale d'iode 125 : 85 Gy à l'apex COMS, environ 63 Gy) |
| Bibliothèque — OAR | `oar.json` | Vérifié littérature | 13 OAR du pelvis, 6 complétés et 16 ajoutés par le lot pelvis, 18 ajoutés par le lot C (thorax, abdomen), 28 par le lot D (SNC), 16 par le lot B (tête et cou, sein), 7 par le lot E (rachis, carotides, pancréas, pharynx, nerf sciatique), aucun ajout au lot F ; « définition usuelle » signalée quand la source n'en donne pas |
| Bibliothèque — Contraintes | `contraintes.json` | Vérifié littérature | 48 jeux publiés : prostate Curie et GEC-ESTRO ; col EMBRACE II et ABS ; gynéco Curie ; grêle, thorax et encéphale QUANTEC ; SBRT poumon Curie et Gustave Roussy ; mésothéliome et SBRT foie Gustave Roussy ; œsophage Neo-AEGIS ; abdomen ESTRO ACROP ; SBRT abdominale 5 fx (consensus UK) ; encéphale et neuro-stéréotaxie Gustave Roussy, stéréotaxie intracrânienne Curie, HyTEC, épargne hippocampique RTOG 0933 ; tête et cou Curie et Gustave Roussy ; sein FAST-Forward (15 et 5 fx) et Sénorif ; moelle HyTEC (SBRT et réirradiation) ; SBRT de la surrénale Gustave Roussy ; sarcome rétropéritonéal et curiethérapie du pénis Gustave Roussy ; moelle en photons-protons de haute dose (DeLaney). Un seul tableur du service gardé (canal anal, faute de jeu publié) |
| Bibliothèque — Essais | `essais.json` | Vérifié PubMed | 437 références (5 ajoutées le 2026-10-25 pour la stéréotaxie vertébrale) + procédures et référentiels institutionnels (Curie, Gustave Roussy, ONCORIF, Sénorif) |
| Journal des écarts | `ecarts.json` | Tranché | 77 écarts, tous tranchés (les derniers par Dr Bentahila le 2026-10-25) ; statut modifiable par le médecin |

## Méthode de vérification du contenu

Aucune valeur n'entre dans le référentiel sans source ouverte et lue ; les fiches existantes du service servent de point de départ, jamais de preuve.

1. **Extraction :** fiches Word du service, tableurs de contraintes, procédures Curie, référentiels fournis (Gustave Roussy, EMBRACE II, ONCORIF, Sénorif…).
2. **Confrontation :** chaque dose, fractionnement et population vérifiés sur l'essai pivot dans PubMed (résumé ou texte intégral) ; marges et limites sur l'atlas international le plus récent ; contraintes sur leur source publiée.
3. **Hiérarchie quand les sources divergent :** essai de phase 3 → recommandation internationale ou atlas (ESTRO, ACROP, NRG, RTOG, GEC-ESTRO) → procédure institutionnelle (Curie, Gustave Roussy) → fiche du service. Les variantes institutionnelles sont gardées et étiquetées, pas effacées. Les protocoles de l'Institut Curie et de Gustave Roussy sont acceptés tels quels (validés par ces institutions), sauf coquille évidente.
4. **Journal des écarts :** toute différence entre une fiche et la référence y est inscrite avec sa source et sa gravité.
5. **Contre-vérification :** un second passage indépendant recontrôle chaque chiffre contre sa source avant de passer l'onglet en « Validé ».
6. **Validation :** pas de relecture médicale systématique. Les écarts sont tranchés selon la hiérarchie ci-dessus et l'onglet passe en « Validé » ; le Dr Bentahila modifie ensuite dans son compte ce qu'elle veut, et ses choix deviennent le modèle de la plateforme (section « Modèle plateforme »).

Un chiffre qu'on n'a pas pu lire dans la source est marqué « à confirmer » dans sa cellule (ex. dose RTE du bras combiné de l'essai Hoskin).

## Import des tableaux vers le JSON

Chaque tableau d'un onglet de contenu porte un titre en gras ; ce titre dit où va chaque ligne. Les champs non listés dans « Modèle de données » ci-dessus sont ajoutés tels quels à l'objet.

| Titre du tableau | Destination JSON | Règle d'import |
| --- | --- | --- |
| Tableau Situations | `situations[]` du fichier de la localisation | Une ligne = une situation ; `localisation_id` = nom du fichier |
| Tableau Schémas | `schemas[]` | Une ligne = un schéma ; `essai_ids` coupé sur « ; » |
| Tableau Schémas — liens | Fusionné dans `schemas[]` par `id` | Ajoute `technique`, `systemique`, `simulation_id`, `volumes_id`, `contraintes_id`, `couverture` ; `contraintes_id` vide = afficher « Aucun jeu publié pour ce fractionnement » |
| Tableau Prescriptions | `schemas[].prescriptions[]` par `schema_id` | Plusieurs lignes par schéma, dans l'ordre du tableau ; nombres décimaux avec un point |
| Tableau Curiethérapie — indications | `curie_indications[]` du fichier de la localisation | Affiché en tête de l'onglet Curiethérapie du module, filtré par localisation |
| Tableau Simulation | `simulations[]` | Une ligne = une fiche de centrage |
| Tableau Volumes | `volumes[]` groupés par `volumes_id` | Chaque groupe devient `{ id, cibles: [...] }` |
| Tableau Volumes — OAR et atlas | `volumes[].oar_ids`, `volumes[].atlas` | `oar_ids` coupé sur « ; » ; le texte entre parenthèses devient `note` ; liens Markdown → `{ nom, url }` |
| Tableau Hormonothérapie | `hormonotherapie[]` du fichier de la localisation | Affiché dans l'onglet Prescription des fiches de la localisation |
| Tableau Points d'attention | `points_attention[]` | `cible` = `schema_id`, `situation_id` ou nom de la localisation (alors affiché sur toutes ses fiches) |
| Tableau OAR | `oar.json` | Ajouter `region` = `pelvis` pour tous les OAR de cet onglet |
| Tableau Jeux de contraintes | `contraintes.json` | Champ `verification` : `verifie` (jeu publié) ou `service` (tableur du service, source affichée telle quelle, sans badge) ; l'import refuse `a_verifier` |
| Tableau Lignes de contraintes | `contraintes.json`, `lignes[]` par `contraintes_id` | `oar_id` à plusieurs valeurs = une ligne par OAR ; indicateurs groupés (« V15Gy / V30Gy ») laissés tels quels dans `indicateur` |
| Tableau Essais | `essais.json` | Champ `type` : `essai`, `recommandation`, `atlas`, `protocole_institutionnel` |
| Tableau Écarts | `ecarts.json` | La colonne Statut (menu déroulant) donne `statut` : Ouvert → `ouvert`, Corrigé → `corrige`, Maintenu → `maintenu` |

**Règles ajoutées par le lot pelvis (s'appliquent à tous les onglets)**

- Fichier : `<localisation_id>.json`. Identifiants des localisations : `prostate`, `vessie`, `seminome`, `penis` (région `uro`) ; `col`, `endometre`, `vagin`, `vulve` (région `gyneco`) ; `poumon`, `mesotheliome`, `thymome` (région `thorax`) ; `oesophage`, `estomac`, `pancreas`, `foie`, `rectum`, `canal_anal` (région `digestif`) ; `glioblastome`, `gliome`, `metastases_cerebrales`, `meningiome`, `schwannome`, `hypophyse`, `craniopharyngiome`, `neurocytome`, `ependymome`, `medulloblastome` (région `snc`) ; `cavite_buccale`, `oropharynx`, `larynx`, `hypopharynx`, `cavum`, `sinus`, `glandes_salivaires`, `orl_palliatif` (région `orl`) ; `sein`, `sein_ccis` (région `sein`) ; `metastases_osseuses`, `sbrt_os`, `surrenale`, `reirradiation` (région `os_palliatif`) ; `sarcome_membres`, `sarcome_retroperitoine`, `chordome` (région `sarcome`) ; `peau_carcinome`, `merkel`, `melanome` (région `peau`) ; `melanome_uveal` (région `autres`).
- Un tableau dont le titre est suivi de « (suite …) » s'ajoute à la suite du tableau de même titre (même destination JSON). Exemple : « Tableau Essais (suite — pelvis) » complète `essais.json`.
- « Tableau Traitement systémique » (colonnes situation, traitement, protocole, essai\_ids, note) → `systemique[]` du fichier de la localisation, affiché dans l'onglet Prescription comme l'hormonothérapie de la prostate. `protocole` = nom du protocole dans la bibliothèque Protocoles ; colonne absente dans les onglets du lot pelvis.
- `contraintes_id` peut citer plusieurs jeux séparés par « ; » → `contraintes_ids[]` dans l'ordre (RTE puis curiethérapie). L'onglet Contraintes affiche un bloc par jeu.
- Les identifiants `volumes_id`, `simulation_id` et `contraintes_id` sont uniques dans tout le référentiel : un schéma peut citer un jeu de volumes ou une fiche de centrage défini dans un autre onglet (col opéré → `vol-gyn-postop` et `sim-gyn-postop` de l'onglet Endomètre ; vagin → `sim-col-curie` de l'onglet Col). L'import construit un index global et refuse un identifiant en double.
- Prescription : `dose_Gy`, `fractions` ou `dose_fx_Gy` peuvent être vides (curiethérapie LDR ou PDR, dose à fixer sur la dosimétrie). Afficher « — », la note, et désactiver le calcul BED / EQD2 pour cette ligne (« Calcul non applicable : PDR, LDR ou dose à définir »).
- `contraintes_id` vide : l'onglet Contraintes affiche « Aucun jeu publié pour ce fractionnement » (ex. rectum 5 × 5 Gy, palliatifs). L'import refuse un jeu `a_verifier`.
- Localisation sans curiethérapie (pas de « Tableau Curiethérapie — indications ») : l'onglet Curiethérapie affiche « Pas de curiethérapie pour cette localisation ».
- Colonne `type` d'un volume : `GTV`, `CTV`, `ITV`, `PTV` ; une réunion de volumes avant marge PTV (ITV45, CTV\_45Gy) est typée `ITV`.
- Lien Protocoles : l'import cherche chaque ligne de `systemique[]` dans la bibliothèque Protocoles du compte, par le nom `protocole`, sinon par les molécules citées dans `traitement` (lot pelvis), et enregistre `protocole_ref`. Une ligne sans correspondance part dans le rapport d'import « Systémiques sans protocole » : l'admin la rattache ou crée le protocole avant publication. `protocole` = « — » : lien vers la bibliothèque filtrée sur la localisation.
- OAR des lots B, C, D et E : colonne `region` (`orl`, `sein`, `thorax`, `abdomen`, `snc`, `rachis`, `pelvis`) → filtre par région de la page Organes à risque.
- « Tableau Aide des colonnes » (bibliothèque Contraintes) → `aide_colonnes[]` de `contraintes.json`. Pour un jeu, la première ligne dont `source_contient` figure dans sa `source` donne le texte des « ? » d'Idéal et de Limitant ; sinon la ligne `defaut`.

**Règles de conversion du 24/10/2026** (elles complètent ou remplacent les règles ci-dessus ; la conversion est faite par Dr Bentahila avant la livraison, le développeur ne la refait pas) :

- Le Tableau Écarts n'est pas converti pour l'application : le journal des écarts reste dans ce document et dans `docs/radiotherapie/`.
- Aucun champ `statut` dans les schémas : seuls des schémas validés sont convertis.
- `contraintes_id` devient toujours une liste `contraintes_ids[]`, même pour un seul jeu.
- Chaque ligne de `systemique[]` garde `protocole`, le nom exact du protocole dans la bibliothèque, et reçoit `protocole_id` quand l'identifiant est connu à la conversion. Cette règle remplace celle de `protocole_ref` ci-dessus : le rattachement se fait dans le module, à l'affichage (section « Fiche d'un schéma », lien vers Protocoles). Les lignes sans correspondance connue sont listées dans `rapport-import.txt`.
- Chaque schéma reçoit `ind` = \[région, localisation, situation, fractionnement\] (libellés affichés), pour `menusCascade`.
- `index.json` reprend, pour chaque schéma, ce qu'il faut pour la recherche, la liste et le sommaire, sans charger les fichiers de localisation.
- `diag-localisation.json` : chaque libellé de `DIAG` (`listes.js`) qui correspond à une localisation du référentiel, avec son `localisation_id` ; les autres sont absents.
- `textes` (fichier de localisation) : les paragraphes rédigés des sections Curiethérapie, Centrage, Contourage et Traitement systémique de l'onglet, rangés sous `curietherapie`, `centrage`, `contourage` et `systemique`, dans l'ordre de l'onglet. Chacun s'affiche sous le tableau de l'onglet de fiche correspondant (Traitement systémique : onglet Prescription). Mise en forme limitée à `**gras**`, `` `identifiant` `` et `[lien](url)` : échapper le HTML, puis convertir ces trois formes et rien d'autre.
- `points_attention[]` du fichier : chaque point porte `portee` (`localisation`, `situation`, `schema`, `volumes`, `contraintes`, `simulation`). Ceux de portée `localisation` s'affichent sur toutes les fiches de la localisation ; les autres sont déjà recopiés, texte seul, dans `schemas[].points_attention[]` des schémas concernés. La fiche affiche les deux, sans doublon.
- Un jeu de volumes ou une fiche de centrage cité depuis un autre onglet est recopié dans chaque fichier qui l'utilise (copies identiques, vérifiées par le test de contenu) : une fiche ne charge qu'un fichier de localisation. Les « Comme vol-… » et « Comme \<schéma> » sont déjà résolus.
- `volumes[].oar_notes` = { oar\_id : note } pour le texte entre parenthèses de la liste d'OAR ; `atlas[]` = { nom, url }, `url` absente pour une fiche du service.
- Types de volume : en plus de GTV, CTV, ITV et PTV, `PRV` et `structure` (repères, grains fiduciaires), affichés en badge neutre comme les autres.
- Lignes de contraintes : `oar_id` peut valoir `cible-ctv` ou `cible-ptv`, un objectif sur la cible, affiché « Cible (CTV) » ou « Cible (PTV) ». Une ligne peut n'avoir que `note` (« À rapporter, sans seuil ») ou pas d'`indicateur` : cellule vide.
- `oar-anus` est fusionné dans `oar-canal-anal`.
- Essai à plusieurs publications : `pmid`, `doi` et `annee` gardent la première ; les suivantes sont dans `pmid_suite[]`, `doi_suite[]` et `annee_suite[]`, en liens supplémentaires sur la ligne de l'essai.
- `systemique[]` : `situation_id` est présent quand la colonne situation désigne une situation de la localisation ; sinon `situation` est un texte affiché tel quel. Cette livraison ne contient aucun `protocole_id` (les identifiants des protocoles du cabinet ne sont pas connus à la conversion) : le module rattache par le nom exact `protocole`, sinon ouvre Protocoles filtré sur la localisation, comme pour « — » ; sans `protocole`, pas de lien.
- `index.json` : chaque localisation porte aussi `nb_schemas` et `curietherapie` (vrai si l'onglet a des indications ou des schémas de curiethérapie) ; chaque schéma, `essais` (acronymes) et `doses` (volume, dose, fractions, dose par fraction).

## Journal des modifications du document

Le développeur lit ce journal en premier : il dit quels onglets ré-importer depuis la dernière version intégrée.

| Date | Onglet | Changement |
| --- | --- | --- |
| 2026-10-22 | Uro — Prostate, Contraintes, Essais, OAR, Écarts | Corrections après contre-vérification indépendante (22 points) : boost LDR sans jeu de contraintes (le jeu GEC-ESTRO vaut pour la monothérapie), jeu HDR en EQD2 limité au boost après 25 × 2 Gy, tableurs du service retranscrits colonne par colonne, volumes de la fiche loge du service ajoutés (vol-pro-loge-service), niveaux de preuve curiethérapie, durées d'HT avec abiratérone, libellés des résultats d'essais |
| 2026-10-22 | Spécification du module | Création : emplacement, droits, modèle de données, écrans, règles d'affichage, import |
| 2026-10-22 | Uro — Prostate | Création : radiothérapie externe et curiethérapie |
| 2026-10-22 | Bibliothèques OAR, Contraintes, Essais | Création, contenu prostate et pelvis |
| 2026-10-22 | Journal des écarts | Création, 25 écarts |
| 2026-10-23 | Gynéco — Col utérin, Endomètre, Vagin, Vulve ; Digestif — Rectum, Canal anal | Création (lot A pelvis) : 32 schémas, curiethérapie gynécologique (HDR, PDR, fond vaginal), volumes EMBRACE II, Curie, Gustave Roussy, atlas et fiches du service |
| 2026-10-23 | Bibliothèques OAR, Contraintes, Essais ; Journal des écarts | Lot pelvis : 16 OAR ajoutés, 6 complétés ; 5 jeux publiés et 6 tableurs ; 43 références (vessie comprise) ; écarts E26 à E38, E22 et E25 tranchés |
| 2026-10-23 | Onglets Poumon, Mésothéliome, Œsophage, Estomac, Pancréas, Foie et voies biliaires ; bibliothèques ; écrans | Lot C : 22 situations, 44 schémas, 18 OAR, 14 jeux de contraintes publiés, 115 références, écarts E39 à E51. Écrans : bandeau permanent supprimé ; recherche libre et menus en cascade, résultats en liste ; textes longs sous « ? » ; 10 tableurs sans source retirés (rectum et canal anal reliés à QUANTEC grêle, 5 × 5 Gy sans jeu) ; lien obligatoire vers Protocoles pour chaque traitement systémique |
| 2026-10-24 | Onglets SNC (Glioblastome, Gliomes de grade 2 et 3, Métastases cérébrales, Méningiome, Schwannome vestibulaire, Adénome hypophysaire, Craniopharyngiome, Neurocytome central) ; Canal anal ; bibliothèques ; journal des écarts | Lot D : 17 situations, 49 schémas, 28 OAR, 10 jeux de contraintes publiés (Gustave Roussy, QUANTEC, Curie, HyTEC, RTOG 0933), 82 références, écarts E52 à E62 ; E20 et E23 tranchés. Canal anal : contraintes du tableur du service reliées aux 6 schémas (seul jeu disponible, validé par le médecin) |
| 2026-10-24 | Onglets ORL (Cavité buccale, Oropharynx, Larynx, Hypopharynx, Cavum, Sinus et cavités nasales, Glandes salivaires, Situations palliatives) et Sein (Carcinome infiltrant, Carcinome in situ) ; bibliothèques ; journal des écarts | Lot B : 28 situations, 79 schémas, 16 OAR, 5 jeux de contraintes publiés (Curie et Gustave Roussy tête et cou, FAST-Forward 15 et 5 fx, Sénorif), 84 références, écarts E63 à E70 ; E24 tranché. Contraintes des tableurs ORL, cavum et sein non reprises (écart E70) |
| 2026-10-24 | Onglets Os et palliatif (Métastases osseuses, Stéréotaxie osseuse, Surrénale, Réirradiation) ; bibliothèques ; journal des écarts | Lot E : 12 situations, 31 schémas, 7 OAR, 3 jeux de contraintes (HyTEC moelle en SBRT et en réirradiation, Gustave Roussy surrénale 5 × 9 Gy), 39 références dont 38 vérifiées sur PubMed, écarts E71 à E74. Contraintes des tableurs de stéréotaxie non reprises (écart E74) |
| 2026-10-24 | Onglets Sarcomes (Membres et tronc, Rétropéritoine, Chordome), Thorax — Thymome, SNC (Épendymome, Médulloblastome de l'adulte), Peau (Carcinomes, Merkel, Mélanome), Uro (Séminome, Pénis), Autres — Mélanome uvéal ; bibliothèques ; journal des écarts | Lot F : 18 situations, 33 schémas, aucun OAR ajouté, 3 jeux de contraintes (Gustave Roussy sarcome rétropéritonéal et curiethérapie du pénis, moelle de DeLaney), 49 références dont 48 vérifiées sur PubMed, écarts E75 à E77. Contraintes du tableur chordome non reprises (écart E77) |
| 2026-10-24 | Section « Écrans et affichage » (revue UI et UX) | Composants d'Onco360 à réutiliser, sans second design system ; accueil du module (favoris, récents, sommaire) ; fiche dans le panneau de droite ; onglet mémorisé ; contraintes groupées par OAR, avec copie ; modification sur place ; états de l'écran ; critères d'acceptation. Sous-page Curiethérapie retirée : filtre Fractionnement et entrée du sommaire |
| 2026-10-24 | Calcul BED / EQD2 | Calculateur sur le modèle de l'EQD Calculator du médecin : plusieurs lignes, trois α/β modifiables, somme des BED, dose équivalente en x Gy/fx, dose par fraction équivalente en N fractions ; cas de contrôle chiffré |
| 2026-10-24 | Spécification : alignement sur le dépôt onco360 | Audit du dépôt (commit 200e71c) : données sous espaces/{e}/referentielRT, référence en JSON dans public/donnees-rt, fonction rt.referentiel du module rt, droit referentielRT, règles Firestore, modèle des cabinets neufs par bib-oncologie, composants existants nommés, page à deux colonnes, seuils 640 / 900 / 1 280 px, écarts et brouillons retirés de l'application, « Modifié pour le cabinet », plan d'exécution RT0 à RT8 |
| 2026-10-23 | Spécification du module | Index des onglets ; règles d'import du lot pelvis (tableaux « suite », plusieurs jeux de contraintes, identifiants partagés entre onglets, prescriptions sans dose, traitement systémique, jeux à vérifier liés) ; affichage des onglets Prescription et Contraintes |
| 2026-10-24 | Mode d'emploi ; Plan d'exécution (RT0) ; Modèle de données (exemple) ; Règles de conversion du 24/10/2026 | Livraison en zip : JSON, SPEC.md, rapport d'import, journal des écarts, onglets en Markdown, test de contenu fourni ; forme des JSON livrés précisée (textes, portée des points d'attention, objets partagés recopiés, oar\_notes, PRV et structure, cible-ctv / cible-ptv, essais à plusieurs publications, pas de protocole\_id) ; exemple aligné sur prostate.json |
| 2026-10-25 | Écarts ouverts tranchés par Dr Bentahila ; Sein — Carcinome infiltrant, SNC — Métastases cérébrales, Os et palliatif — Stéréotaxie osseuse, Sarcomes — Membres et tronc ; bibliothèque Essais ; auteur du document | Schémas retirés : meta-srs-service (E55), sein-gg-26-5-service (E65), sr-5x6-service, sr-6x6-service et sr-1x15-service (E71, sans source publiée) ; surimpression de sein-gg-40-15 à 16 Gy / 8 fx ou 10 Gy / 5 fx (E64, Sénorif), option 10 Gy / 5 fx ajoutée aussi à sein-40-15-boost16 ; une seule règle de couverture en stéréotaxie vertébrale (E73) ; marge longitudinale du CTV préopératoire des sarcomes à 3 cm (E75, consensus RTOG) ; 5 références ajoutées (Lai 2025, Wang 2012, Zelefsky 2021, Garg 2011, consensus post-opératoire 2017) ; E16 et E68 non intégrés ; E17, E19, E21 notés corrigés ; 295 schémas |

## Lots à venir

Six lots suivent la prostate (A et C faits) ; chacun ajoute un onglet par localisation et complète les trois bibliothèques. Pédiatrie et lymphomes sont exclus du périmètre.

| Lot | Localisations | Curiethérapie incluse | Sources déjà fournies |
| --- | --- | --- | --- |
| A — Pelvis | Col utérin, endomètre et col opéré, vagin, vulve, rectum, canal anal, vessie — fait le 2026-10-23 | Utéro-vaginale (EMBRACE II), fond vaginal | Fiches du service ; protocole EMBRACE II ; PORTEC-3 ; Curie col-vagin, endomètre, vulve ; Gustave Roussy vagin et PDR gynéco ; tableurs gynéco, rectum, canal anal |
| B — Sein et ORL | Cavité buccale, oropharynx, larynx, hypopharynx, cavum, sinus et cavités nasales, glandes salivaires, situations palliatives ORL ; sein infiltrant et carcinome in situ — fait le 2026-10-24 (réirradiation ORL au lot E) | Langue mobile et base de langue (PDR, HDR) ; irradiation partielle du sein (GEC-ESTRO) | Sénorif 2021-2022 ; tableurs sein (40,05 Gy, FAST-Forward) ; Curie ORL ; référentiel ORL RCMI ; tableurs ORL et cavum |
| C — Thorax et digestif haut | Poumon (dont stéréotaxie), mésothéliome, œsophage, estomac, pancréas, foie et voies biliaires — fait le 2026-10-23 (surrénale déplacée au lot E, thymome au lot F) | Si indiquée | ONCORIF ; référentiels SBRT poumon (Curie, Gustave Roussy) ; Gustave Roussy foie et mésothéliome ; tableurs œsophage (CROSS), pancréas, foie, stéréo abdominale |
| D — Système nerveux central | Glioblastome, gliomes de grade 2 et 3, métastases cérébrales (radiochirurgie, cavité, encéphale in toto avec épargne hippocampique, réirradiation), méningiome, schwannome vestibulaire, adénome hypophysaire, craniopharyngiome, neurocytome — fait le 2026-10-24 (épendymome et médulloblastome de l'adulte déplacés au lot F) | Non | Fiches du service ; procédure Curie métastases cérébrales ; Gustave Roussy encéphale et neuro-stéréotaxie ; tableurs crâniens du service |
| E — Os, palliatif, stéréotaxie | Métastases osseuses, stéréotaxie vertébrale et osseuse, oligométastases, surrénale, réirradiation (ORL, glioblastome, sein, rectum, os) — fait le 2026-10-24 | Récidive mammaire (curiethérapie multicathéters, GEC-ESTRO) | Fiches du service (stéréotaxie osseuse vertébrale, contourage des métastases osseuses) ; tableurs vertèbre, pubis et surrénale stéréo ; Gustave Roussy stéréotaxie surrénale |
| F — Sarcomes et autres | Sarcomes des membres et rétropéritonéaux, chordome, thymome, peau (carcinomes, Merkel, mélanome), épendymome et médulloblastome de l'adulte, séminome, pénis, mélanome uvéal — fait le 2026-10-24 | Sarcomes des membres (bas débit), peau (contact haut débit), pénis (bas débit et débit pulsé), mélanome uvéal (plaque d'iode 125) | Fiche sarcome du service ; Gustave Roussy sarcomes rétropéritonéaux (2017) et curiethérapie du pénis ; tableur chordome du service |
