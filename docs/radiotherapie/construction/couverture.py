# Objectifs de couverture en lignes (26/10/2026, demande de Dr Bentahila : tableau « Volume · Indicateur · Idéal · Limitant · Note » au-dessus de
# celui des organes) : schema.couverture (texte) → schema.couverture_lignes [{ volume, indicateur, ideal, limitant, note }], sources retirées.
# Lancer : python3 docs/radiotherapie/construction/couverture.py [ecrire]
import json, pathlib, re, sys
DR = pathlib.Path(__file__).resolve().parents[3] / "public" / "donnees-rt"
SRC = re.compile(r"^(Tableur du service|Gustave Roussy|Institut Curie|Curie|Fiche du service|Fiche dosimétrique[^:]*|Service)\s*:\s*", re.I)
VOL = re.compile(r"^((?:GTV|CTV|PTV|ITV|IGTV)[\w.,\-–+/]*(?:\s*(?:\d+(?:[,.]\d+)?\s*Gy))?(?:\s*∪\s*(?:GTV|CTV|PTV|ITV)[\w.,\-–+/]*)*)\s*:?\s*(.*)$")
OP = re.compile(r"(≥|≤|≈|<|>|=)")
def morceaux(t):
  t = SRC.sub("", t.strip())
  t = re.sub(r"\s*\((?:RTOG|EORTC|ESTRO|Curie|IGR|Gustave Roussy)[^)]*\)\s*$", "", t)
  parts = [p.strip() for p in re.split(r"\s*;\s*", t) if p.strip()]
  out = []
  for p in parts:
    p = SRC.sub("", p)
    sous = [x.strip() for x in re.split(r",\s+(?=[A-Za-zÀ-ÿ]*\d*\s*%?\s*(?:≥|≤|≈|<|>))", p)]
    out += [x for x in sous if x]
  return out
def ligne(p, vol_prec):
  m = VOL.match(p)
  vol, reste = (m.group(1), m.group(2)) if m else ("", p)
  if not vol:
    mm = re.search(r"\b(?:du|des|le|les)\s+(PTV|CTV|GTV)[\w\-]*", p)
    vol = mm.group(0).split()[-1] if mm else vol_prec
  i = OP.search(reste)
  if not vol and re.match(r"^[DV]\d", reste): vol = "CTV-HR" if "EQD2" in reste else "PTV"
  if not i:
    d = re.match(r"^([DV][\d,.]+\s*%?)\s+(\d.*)$", reste)
    if d: return {"volume": vol or "", "indicateur": d.group(1).strip(), "ideal": "", "limitant": d.group(2), "note": ""}
    return {"volume": vol or "", "indicateur": reste[:1].upper() + reste[1:], "ideal": "", "limitant": "", "note": ""}
  ind, val = reste[:i.start()].strip(), reste[i.start():].strip()
  par = re.match(r"^(.*?)\s*\((.+)\)\s*$", val)
  return {"volume": vol or "", "indicateur": ind, "ideal": "", "limitant": (par.group(1) if par else val).strip(), "note": par.group(2) if par else ""}
def convertir(t):
  L, v = [], ""
  for p in morceaux(t):
    x = ligne(p, v); v = x["volume"] or v; L.append(x)
  return L
if __name__ == "__main__":
  n = 0
  for f in sorted(DR.glob("*.json")):
    d = json.loads(f.read_text())
    if not isinstance(d, dict) or "schemas" not in d: continue
    ch = False
    for s in d["schemas"]:
      if s.get("couverture") and "couverture_lignes" not in s:
        s["couverture_lignes"] = convertir(s["couverture"]); ch = True; n += 1
        if sys.argv[1:] != ["ecrire"]:
          print(s["id"], "|", s["couverture"]); [print("    ", x) for x in s["couverture_lignes"]]
    if ch and sys.argv[1:] == ["ecrire"]: f.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
  print(n, "schémas")
