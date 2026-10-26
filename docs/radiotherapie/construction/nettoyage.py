# Nettoyage du 26/10/2026 (demande de Dr Bentahila) : plus de source institutionnelle ni de commentaire dans les fiches. Retire le champ
# source_institutionnelle, les textes rédigés (textes), les mentions « (Curie) », « (fiche du service) »… ; « Curie : » au milieu d'un texte devient
# « autre approche : » (les deux façons de faire restent) ; Normacol → Zetalax. Ce qui est retiré est gardé dans construction/retire-2026-10-26.json.
# Lancer : python3 docs/radiotherapie/construction/nettoyage.py [ecrire]
import json, pathlib, re, sys
DR = pathlib.Path(__file__).resolve().parents[3] / "public" / "donnees-rt"
SAUVE = pathlib.Path(__file__).parent / "retire-2026-10-26.json"
INST = r"(?:Institut Curie|Curie|Gustave Roussy|IGR|fiche du service|Fiche du service|tableur du service|Tableur du service|protocole du service|fiche OAR du service|Fiche OAR du service|protocole Curie|référentiel Gustave Roussy|annexe Gustave Roussy|jeux Curie[^,;)]*|tableurs? du service)"
REGLES = [
  (re.compile(r"\s*\(coquille[^)]*\)"), ""),
  (re.compile(r"\s*\((?:%s)(?:,\s*(?:annexe [A-Z]|masque et Novalis))?\)" % INST), ""),
  (re.compile(r"\((?:%s)\s*;\s*" % INST), "("),
  (re.compile(r"\((?:%s),\s*" % INST), "("),
  (re.compile(r",\s*(?:%s)\)" % INST), ")"),
  (re.compile(r"\s+par (?:%s)\s+ni\s+(?:%s)" % (INST, INST)), ""),
  (re.compile(r"\s+(?:retenue|préféré[e]?|recommandée?) par (?:%s)" % INST), ""),
  (re.compile(r"\s+par (?:%s)(?=[)\s,;.])" % INST), ""),
  (re.compile(r";\s*(?:%s)\s*:\s*" % INST), " ; autre approche : "),
  (re.compile(r"^(?:%s)\s*:\s*" % INST), ""),
  (re.compile(r"\.\s*(?:%s)\s*:\s*" % INST), ". Autre approche : "),
  (re.compile(r"(?<=[\w)])\s+(?:%s)\s*:\s*(?=\w)" % INST), " : "),
  (re.compile(r"Normacol"), "Zetalax"),
  (re.compile(r"\s{2,}"), " "),
  (re.compile(r"\s+([,.)])"), r"\1"),
]
def propre(t):
  a = t
  for r, b in REGLES: t = r.sub(b, t)
  t = t.strip()
  return t[:1].upper() + t[1:] if t and a[:1].isupper() else t
def walk(x, chemin, chg):
  if isinstance(x, dict):
    for k in list(x):
      if k in ("source_institutionnelle", "textes"): chg.append((chemin + "." + k, x.pop(k), None)); continue
      v = x[k]
      if isinstance(v, str):
        n = propre(v)
        if n != v: chg.append((chemin + "." + k, v, n)); x[k] = n
      else: walk(v, chemin + "." + k, chg)
  elif isinstance(x, list):
    for i, v in enumerate(x):
      if isinstance(v, str):
        n = propre(v)
        if n != v: chg.append((chemin + "[" + str(i) + "]", v, n)); x[i] = n
      else: walk(v, chemin + "[" + str(i) + "]", chg)
if __name__ == "__main__":
  tout, n = {}, 0
  for f in sorted(DR.glob("*.json")):
    if f.name in ("essais.json", "contraintes.json", "oar.json", "index.json", "diag-localisation.json", "protocoles-chimio.json"): continue
    d = json.loads(f.read_text()); chg = []; walk(d, f.stem, chg)
    if chg:
      tout[f.name] = chg; n += len(chg)
      if sys.argv[1:] == ["ecrire"]: f.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
  if sys.argv[1:] == ["ecrire"]: SAUVE.write_text(json.dumps(tout, ensure_ascii=False, indent=1) + "\n")
  else:
    for f, chg in tout.items():
      for c, a, b in chg:
        if b is not None and not c.endswith(("source_institutionnelle",)): print(c, "\n   AVANT :", str(a)[:240], "\n   APRÈS :", str(b)[:240])
  print(n, "changements")
