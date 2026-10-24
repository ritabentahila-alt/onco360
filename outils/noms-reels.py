# S7 (24/10/2026, audit n° 10 d. 7) : aucun nom de vrai patient dans les fichiers du dépôt (code, tests, guides, captures de texte).
# Les noms sont pris dans tests/seed.json (copie réelle, jamais dans le dépôt) s'il est sur l'ordinateur ; rien n'est affiché du nom, seulement
# le fichier et l'identifiant du dossier. python3 outils/noms-reels.py → aucune sortie si tout va bien.
import json, os, re, subprocess, sys, unicodedata
ICI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SEED = os.path.join(ICI, 'tests', 'seed.json')
if not os.path.exists(SEED): sys.exit(0)
plat = lambda t: re.sub(r'\s+', ' ', unicodedata.normalize('NFD', t or '').encode('ascii', 'ignore').decode().upper()).strip()
S = json.load(open(SEED)); noms = {}
for k, v in S.items():
    if '/patients/' not in k or not isinstance(v, dict): continue
    i = v.get('identite') or {}
    for n in {i.get('nomF'), ((i.get('nom') or '') + ' ' + (i.get('prenom') or '')), ((i.get('prenom') or '') + ' ' + (i.get('nom') or ''))}:
        n = plat(n)
        if len(n) >= 6 and ' ' in n and not re.match(r'(PATIENT TEST|SANS NOM)', n): noms[n] = k.split('/')[-1]
fichiers = subprocess.run(['git', 'ls-files'], cwd=ICI, capture_output=True, text=True).stdout.split('\n')
for f in fichiers:
    if not f or f.endswith(('seed.json', 'bilan_ref.txt')) or f.startswith('public/vendor/'): continue
    try: t = plat(open(os.path.join(ICI, f), encoding='utf-8').read())
    except Exception: continue
    for n, pid in noms.items():
        if n in t: print(f + ' : nom du dossier ' + pid)
