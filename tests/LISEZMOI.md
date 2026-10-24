# Tests d'Onco360

Faux Firebase en mémoire (`mockfb/`) + navigateur automatisé (Playwright, Python). Aucune donnée patient n'est stockée ici.

## Préparer (une fois)
```
python3 -m venv tests/.venv && tests/.venv/bin/pip install playwright && tests/.venv/bin/python -m playwright install chromium   # déjà fait sur le Mac (11/10/2026)
node tests/mkfictif.mjs   # refait tests/seed-fictif.json et tests/bilan_ref_fictif.txt (jeu fictif, dans le dépôt)
```
**Jeu de test (S7, 24/10/2026)** : `tests/seed-fictif.json`, entièrement fictif (80 « PATIENT TEST n » de janvier à octobre 2026 dans trois lieux
fictifs, tarifs de même forme que ceux du cabinet, cases « Payé » à l'ancien format, séances J8, radiothérapies terminées ; protocoles de la copie
du 18/10 sans patient), construit par `tests/mkfictif.mjs` à partir de `functions/demo.js`. Bilan 2026 de référence : `bilan_ref_fictif.txt`
(363 734 DH). Tous les tests le lisent ; aucun ne lit plus la copie réelle.
Ancienne copie réelle (`node tests/mkseed.mjs …` → `tests/seed.json`, jamais dans le dépôt, bilan 352 317 DH) : seulement avec `ONCO360_SEED=reel`,
et elle sert à `outils/noms-reels.py` (aucun de ses noms dans les fichiers du dépôt).

## Lancer
```
node tests/moteur/test-bilan.mjs  # calcul du bilan sans navigateur (référence, hôpital par date, cases « Payé »)
node tests/moteur/test-salle.mjs  # salle d'attente sans navigateur : lignes du jour (rendez-vous, séances de chimio), onglets, période, recherche, tri
node tests/moteur/test-recus.mjs  # reçus numérotés : R-AAAA-NNNN, duplicata, nouveau numéro et numéros annulés
python tests/test_agenda.py       # agenda (étape 21) : vue Jour sur téléphone, durée par type, glisser-déposer, médecin du rendez-vous, heure des séances de chimio / du scanner
python tests/test_salle.py        # salle d'attente : médecin, secrétaire, infirmière, chimio, Patient suivant, messages, heure du Maroc, téléphone, onglet d'ouverture, reçus
python tests/test_bilan.py        # bilan de l'année du jeu fictif (bilan_ref_fictif.txt) + aucune erreur JavaScript
python tests/test_cures.py        # J1 / J8, paramètres par séance, report des doses, fiche chimio
python tests/test_seances.py      # report de J8, molécules ajoutées / retirées à J8
python tests/test_protocoles.py   # menus en cascade, fenêtre « Venu »
python tests/test_fiche.py        # fiche patient réglable : ordre, champ retiré gardé, champs ajoutés, impression, Administration
python tests/test_reglage.py      # réglage du cabinet : fonctions retirées cachées page par page, sans réglage tout est là
python tests/test_bibliotheque.py # bibliothèque de référence ouverte par l'administration, création d'une secrétaire (serveur)
python tests/test_demo.py         # cabinet de démonstration (8 patients fictifs), Administration (démo, référence)
python tests/test_comptable.py    # rôle Comptable : relevé sans diagnostic, même bilan, aucun dossier
python tests/test_audit.py        # journal d'audit (titulaire, filtres, export, secrétaire sans accès)
python tests/test_cabinets.py     # cabinet neuf (rien de Dr Bentahila), premier démarrage, page Administration
python tests/test_menu.py         # menu repliable (choix gardé, téléphone), onglets des Paramètres sur une ligne qui défile
```
Un petit serveur local (port 8767) sert `public/`. Les dates sont figées au 06/10/2026 dans `base.py` (`ouvrir(..., t=...)`).

## Règles de sécurité (émulateur Firestore)
`tests/regles/` : tests des règles (`firestore.rules`) sur l'émulateur Firebase, sans toucher à la vraie base.
Java 21 nécessaire (Temurin, installé le 08/10/2026).
```
cd tests/regles && npm install      # une fois
npm test                            # lance l'émulateur, les cas de test, puis l'arrête
```
`test-bilan.mjs` : changement d'hôpital d'un dossier et historique `hopHist`.
`test-comptable.mjs` : rôle Comptable (aucun dossier, paiements et versements seulement).
`test-audit.mjs` : journal d'audit (lecture par le titulaire seul, aucune écriture).
`test-cabinets.mjs` : étanchéité entre cabinets, compte d'administration, `comptes/{uid}`.
`test-taches.mjs` : tâches (lecture, création, statut, commentaires, réattribution, suppression, usurpations).
