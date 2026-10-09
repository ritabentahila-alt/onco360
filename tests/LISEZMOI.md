# Tests d'Onco360

Faux Firebase en mémoire (`mockfb/`) + navigateur automatisé (Playwright, Python). Aucune donnée patient n'est stockée ici.

## Préparer (une fois)
```
pip install playwright && python -m playwright install chromium
node tests/mkseed.mjs 2026-10-06 ~/Downloads/ChimioHGC_Firebase_2026-10-06.json   # crée tests/seed.json (NE PAS partager)
```
La sauvegarde JSON se trouve dans le Drive (sauvegarde quotidienne de l'ancienne application).
Le seed simule l'état d'Onco360 converti depuis cette sauvegarde ; le bilan de référence est écrit dans `bilan_ref.txt`.

## Lancer
```
python tests/test_bilan.py        # bilan de l'année (352 317 DH au 06/10/2026) + aucune erreur JavaScript
python tests/test_cures.py        # J1 / J8, paramètres par séance, report des doses, fiche chimio
python tests/test_seances.py      # report de J8, molécules ajoutées / retirées à J8
python tests/test_protocoles.py   # menus en cascade, fenêtre « Venu »
python tests/test_bibliotheque.py # bibliothèque de référence ouverte par l'administration, création d'une secrétaire (serveur)
python tests/test_demo.py         # cabinet de démonstration (8 patients fictifs), Administration (démo, référence)
python tests/test_comptable.py    # rôle Comptable : relevé sans diagnostic, même bilan, aucun dossier
python tests/test_audit.py        # journal d'audit (titulaire, filtres, export, secrétaire sans accès)
python tests/test_cabinets.py     # cabinet neuf (rien de Dr Bentahila), premier démarrage, page Administration
```
Un petit serveur local (port 8767) sert `public/`. Les dates sont figées au 06/10/2026 dans `base.py` (`ouvrir(..., t=...)`).

## Règles de sécurité (émulateur Firestore)
`tests/regles/` : tests des règles (`firestore.rules`) sur l'émulateur Firebase, sans toucher à la vraie base.
Java 21 nécessaire (Temurin, installé le 08/10/2026).
```
cd tests/regles && npm install      # une fois
npm test                            # lance l'émulateur, les cas de test, puis l'arrête
```
`test-comptable.mjs` : rôle Comptable (aucun dossier, paiements et versements seulement).
`test-audit.mjs` : journal d'audit (lecture par le titulaire seul, aucune écriture).
`test-cabinets.mjs` : étanchéité entre cabinets, compte d'administration, `comptes/{uid}`.
`test-taches.mjs` : tâches (lecture, création, statut, commentaires, réattribution, suppression, usurpations).
