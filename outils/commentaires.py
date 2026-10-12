#!/usr/bin/env python3
# Onco360 – Q3 (12/10/2026) : cherche les commentaires « // … » écrits au milieu d'une ligne de code et suivis de code qu'ils avalent
# (erreur faite plusieurs fois : le reste de la ligne ne s'exécute plus, souvent sans erreur visible). Affiche les lignes suspectes.
import re, sys, pathlib
CODE = re.compile(r"(\); |\} else |; (const|let|if|await|return|window\.)[ (]|=> |\.[a-zA-Z]+\(|Object\.assign\(|\b[a-zA-Z_$][\w.]* = [^;]*[^ ;];|'<[a-z]|\+ \"|\" \+ )")
def debut_commentaire(l):
    q = None; i = 0
    while i < len(l) - 1:
        c = l[i]
        if q:
            if c == "\\": i += 2; continue
            if c == q: q = None
        elif c in "\"'`": q = c
        elif c == "/" and l[i + 1] == "/" and (i == 0 or l[i - 1] not in ":\\"): return i
        elif c == "/" and l[i + 1] not in "/*" and re.search(r"[=(,:!&|?]\s*$", l[:i]):  # expression régulière /…/ : sautée
            j = l.find("/", i + 1)
            while j > 0 and l[j - 1] == "\\": j = l.find("/", j + 1)
            if j > 0: i = j + 1; continue
        i += 1
    return -1
n = 0
for racine in sys.argv[1:]:
    for f in sorted(pathlib.Path(racine).rglob("*.js")) if pathlib.Path(racine).is_dir() else [pathlib.Path(racine)]:
        if "vendor" in f.parts or "node_modules" in f.parts or f.name.endswith(".min.js"): continue
        for k, l in enumerate(f.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            if l.strip().startswith("//") or "//" not in l: continue
            i = debut_commentaire(l)
            if i > 0 and l[:i].strip() and CODE.search(l[i + 2:]): print(f"{f}:{k}: {l.strip()[:140]}"); n += 1
sys.exit(1 if n else 0)
