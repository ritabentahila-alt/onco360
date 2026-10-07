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
```
Un petit serveur local (port 8767) sert `public/`. Les dates sont figées au 06/10/2026 dans `base.py` (`ouvrir(..., t=...)`).
