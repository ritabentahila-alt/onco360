# Table unique des contraintes (donnees-rt/contraintes.json, format 2), refaite le 25/10/2026 à la demande de Dr Bentahila :
# « pour chaque OAR, une contrainte en normofractionné, en hypofractionné et en stéréotaxie (selon le nombre de fractions), liée au schéma si
# l'OAR est contouré ; sauf essai particulier : ses contraintes, et la base pour les OAR qu'il ne cite pas ».
# Sources, dans l'ordre : 1. RecoRad 2025 (Noël et al., Cancer/Radiothérapie 2026;30:104833, recopié dans docs/radiotherapie/recorad-2025.tsv) ;
# 2. harmonisation stéréotaxie Gustave Roussy 2018 (igr-stereo-2018.tsv) pour la stéréotaxie hors RecoRad ; 3. pour un OAR contouré sans valeur
# dans les deux, l'ancien jeu (Curie, Gustave Roussy, QUANTEC) qui le cite. Jeux d'essais et de curiethérapie gardés tels quels (exceptions).
# Une ligne de base : { id, oar_id (OAR ou paire), regime normo|hypo|stereo, fx?, dpf?, loc? [localisations], indicateur, ideal, limitant, note, source }.
# Lancer : python3 docs/radiotherapie/construction/contraintes.py
import json, pathlib, re, collections

ICI = pathlib.Path(__file__).resolve().parents[3]
DR = ICI / "public" / "donnees-rt"
DOC = ICI / "docs" / "radiotherapie"

SRC_R25 = "RecoRad 2025"
SRC_IGR = "Gustave Roussy, stéréotaxie 2018"

ORGANE = {
  "Encéphale": "oar-encephale", "Encéphale − PTV": "oar-encephale-sain", "Tronc cérébral": "oar-tronc-cerebral", "Cochlée": "oar-cochlees",
  "Œil": "oar-yeux", "Globe oculaire": ("oar-yeux", "globe"), "Cornée": "oar-cornees", "Rétine / macula": "oar-retines", "Cristallin": "oar-cristallins",
  "Hippocampes": "oar-hippocampes", "Glande lacrymale": "oar-glandes-lacrymales", "Chiasma optique": "oar-chiasma", "Nerf optique": "oar-nerfs-optiques",
  "Parotide": "oar-parotides", "Hypophyse": "oar-hypophyse", "Cuir chevelu": "oar-cuir-chevelu", "Canal médullaire": "oar-canal-medullaire",
  "Mandibule": "oar-mandibule", "Plexus brachial": "oar-plexus-brachiaux", "Artère carotide": "oar-carotides", "Œsophage cervical": "oar-oesophage-cervical",
  "Larynx": "oar-larynx", "Lèvres": "oar-levres", "Cavité orale": "oar-cavite-orale", "Canal parotidien intraglandulaire": ("oar-canal-parotidien", "intraglandulaire"),
  "Canal parotidien total": ("oar-canal-parotidien", "total"), "Muscles constricteurs du pharynx": "oar-constricteurs", "Glande sous-mandibulaire": "oar-glandes-sous-max",
  "Lobe temporal": "oar-lobes-temporaux", "Articulation temporo-mandibulaire": "oar-atm", "Thyroïde": "oar-thyroide", "Paroi thoracique": "oar-paroi-thoracique",
  "Œsophage": "oar-oesophage", "Gros vaisseaux": "oar-gros-vaisseaux", "Gros vaisseaux (aorte)": ("oar-gros-vaisseaux", "aorte"), "Cœur": "oar-coeur",
  "Poumons − PTV": ("oar-poumons", "poumons − PTV"), "Poumons − ITV": ("oar-poumons", "poumons − ITV"), "Poumons": "oar-poumons",
  "Poumon unique (après pneumonectomie)": ("oar-poumons", "poumon unique, après pneumonectomie"),
  "Arbre bronchique proximal et trachée": ["oar-arbre-bronchique", "oar-trachee"], "Arbre bronchique proximal": "oar-arbre-bronchique", "Trachée": "oar-trachee",
  "Peau": "oar-peau", "Peau (5 mm sous la surface)": ("oar-peau", "5 mm sous la surface"), "Peau (contour externe − 3 mm)": ("oar-peau", "contour externe − 3 mm"),
  "Sein controlatéral": "oar-sein-controlateral", "Artère interventriculaire antérieure": "oar-iva", "Ventricule gauche": "oar-ventricule-gauche",
  "Tête humérale": "oar-tete-humerale", "Foie": "oar-foie", "Foie sain (non cirrhotique)": ("oar-foie", "foie sain non cirrhotique"),
  "Foie (non cirrhotique)": ("oar-foie", "foie non cirrhotique"), "Foie sain (Child-Pugh A)": ("oar-foie", "foie sain, Child-Pugh A"),
  "Foie sain (Child-Pugh B7)": ("oar-foie", "foie sain, Child-Pugh B7"), "Foie − CTV": ("oar-foie", "foie − CTV"),
  "Poumon homolatéral": "oar-poumon-homolateral", "Poumon controlatéral": "oar-poumon-controlateral",
  "Moelle épinière": "oar-moelle", "Moelle épinière haute": ("oar-moelle", "moelle haute"), "Moelle épinière (rachis)": ("oar-moelle", "stéréotaxie rachidienne"),
  "PRV moelle (rachis)": ("oar-moelle", "PRV, stéréotaxie rachidienne"),
  "Reins": "oar-reins", "Reins (droit et gauche ensemble)": "oar-reins", "Rein unique": ("oar-reins", "rein unique"), "Rein controlatéral": ("oar-reins", "rein controlatéral"),
  "Rein homolatéral − ITV": ("oar-reins", "rein homolatéral − ITV"), "Hile rénal / tronc vasculaire": "oar-hile-renal", "Pancréas": "oar-pancreas",
  "Intestin grêle": "oar-grele", "Intestin": "oar-grele", "Côlon": "oar-colon", "Rate": "oar-rate", "Duodénum": "oar-duodenum",
  "Duodénum / cavité péritonéale": ("oar-duodenum", "duodénum et cavité péritonéale"), "Estomac": "oar-estomac", "Voie biliaire principale": "oar-voie-biliaire",
  "Vessie": "oar-vessie", "Rectum": "oar-rectum", "Têtes fémorales": "oar-tetes-femorales", "Queue de cheval": "oar-queue-cheval", "Bulbe pénien": "oar-bulbe",
  "Urètre": "oar-uretre", "Sigmoïde": "oar-sigmoide", "Moelle osseuse": "oar-moelle-osseuse", "Moelle osseuse hématopoïétique": ("oar-moelle-osseuse", "hématopoïétique"),
  "Os pelviens": "oar-os-pelviens", "Vulve": "oar-vulve", "Organes génitaux masculins": "oar-oge", "Testicule controlatéral": "oar-testicule-controlateral",
  "Plexus sacré": "oar-plexus-sacre",
}

TABLE_LOC = {
  "T1": ["glioblastome", "gliome", "metastases_cerebrales", "meningiome", "schwannome", "hypophyse", "craniopharyngiome", "neurocytome", "ependymome", "medulloblastome"],
  "T2": ["cavite_buccale", "oropharynx", "larynx", "hypopharynx", "cavum", "sinus", "glandes_salivaires", "orl_palliatif"],
  "T3": ["poumon", "mesotheliome", "thymome"], "T4": ["sein", "sein_ccis"], "T5": ["oesophage", "estomac"], "T6": ["foie"], "T7": ["pancreas"],
  "T8": ["surrenale"], "T9": ["prostate"], "T10": ["col", "endometre", "vagin", "vulve"], "T11": ["vessie"], "T12": ["rectum"], "T13": ["canal_anal"], "T14": ["seminome"],
}
TABLE_NOM = {"T1": "encéphale", "T2": "ORL", "T3": "poumon", "T4": "sein", "T5": "œsophage", "T6": "foie", "T7": "pancréas", "T8": "rein", "T9": "prostate",
  "T10": "gynécologie", "T11": "vessie", "T12": "rectum", "T13": "canal anal", "T14": "testicule"}

# Colonne → (régime, fx, dpf)
def colonne(t, c):
  if c == "N": return ("normo", None, None)
  if c == "N33": return ("normo", 33, None)
  if c == "BID": return ("normo", 30, 1.5)
  if t == "T9" and c == "H20": return ("hypo", 20, 3)
  if c == "H20b": return ("hypo", 20, 2.625)
  m = re.fullmatch(r"H(\d+)", c)
  if m: return ("hypo", int(m.group(1)), None)
  m = re.fullmatch(r"S(\d+)", c)
  if m: return ("stereo", int(m.group(1)), None)
  raise ValueError((t, c))

# Table de référence de chaque OAR (la base) : la première qui donne une valeur pour ce régime et ce fractionnement
SNC, ORL, THX, SEIN, ABD, PEL = ["T1", "T2"], ["T2", "T1"], ["T3", "T4", "T5"], ["T4", "T3"], ["T7", "T6", "T5", "T8", "T14"], ["T12", "T13", "T11", "T10", "T9", "T14"]
TOUTES = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14"]
HOME = {
  "oar-encephale": SNC, "oar-encephale-sain": SNC, "oar-tronc-cerebral": SNC, "oar-cochlees": SNC, "oar-yeux": SNC, "oar-cornees": SNC, "oar-retines": SNC,
  "oar-cristallins": SNC, "oar-hippocampes": SNC, "oar-glandes-lacrymales": SNC, "oar-chiasma": SNC, "oar-nerfs-optiques": SNC, "oar-hypophyse": SNC,
  "oar-cuir-chevelu": SNC, "oar-canal-medullaire": ["T1", "T3", "T2", "T4", "T9"], "oar-lobes-temporaux": ORL,
  "oar-parotides": ORL, "oar-mandibule": ORL, "oar-carotides": ORL, "oar-oesophage-cervical": ORL, "oar-larynx": ORL, "oar-levres": ORL, "oar-cavite-orale": ORL,
  "oar-canal-parotidien": ORL, "oar-constricteurs": ORL, "oar-glandes-sous-max": ORL, "oar-atm": ORL, "oar-thyroide": ["T2", "T4"],
  "oar-plexus-brachiaux": THX, "oar-paroi-thoracique": THX, "oar-oesophage": THX, "oar-gros-vaisseaux": ["T3", "T7"], "oar-coeur": THX, "oar-poumons": THX,
  "oar-arbre-bronchique": THX, "oar-trachee": THX, "oar-peau": ["T3", "T8"],
  "oar-sein-controlateral": SEIN, "oar-iva": SEIN + ["T5"], "oar-ventricule-gauche": SEIN, "oar-tete-humerale": SEIN, "oar-poumon-homolateral": SEIN, "oar-poumon-controlateral": SEIN,
  "oar-foie": ["T6", "T7", "T5", "T8", "T14", "T4"], "oar-reins": ["T7", "T5", "T10", "T8", "T14"], "oar-hile-renal": ["T8"], "oar-pancreas": ["T5", "T14"],
  "oar-grele": ["T12", "T7", "T6", "T13", "T11", "T9", "T10", "T5", "T8"], "oar-colon": ["T6", "T7", "T8"], "oar-rate": ["T5"], "oar-duodenum": ["T7", "T6", "T8", "T14"],
  "oar-estomac": ["T7", "T6", "T8", "T14"], "oar-voie-biliaire": ["T6", "T7"],
  "oar-moelle": ["T4", "T5", "T7", "T10", "T8", "T14"],
  "oar-vessie": ["T12", "T13", "T10", "T11", "T9"], "oar-rectum": ["T11", "T10", "T9"], "oar-tetes-femorales": ["T12", "T13", "T10", "T11", "T9"],
  "oar-queue-cheval": ["T9"], "oar-bulbe": ["T9"], "oar-uretre": ["T9"], "oar-sigmoide": ["T12", "T13", "T10"], "oar-moelle-osseuse": ["T10", "T14"],
  "oar-os-pelviens": ["T12", "T13"], "oar-vulve": ["T12", "T13"], "oar-oge": ["T12", "T13"], "oar-testicule-controlateral": ["T14"],
}

# Jeux gardés tels quels : essais suivis par le schéma, curiethérapie, réirradiation
ESSAIS = {"ct-col-embrace2-rte", "ct-col-embrace2-curie", "ct-sein-ff-15fx", "ct-sein-ff-5fx", "ct-oeso-neoaegis", "ct-ha-wbrt-rtog0933", "ct-chordome-delaney",
  "ct-curie-ldr-gec", "ct-curie-hdr15-gec", "ct-curie-hdr-eqd2-gec", "ct-col-abs-hdr", "ct-penis-igr", "ct-reirr-moelle"}

def lire(fichier):
  for l in (DOC / fichier).read_text().splitlines():
    if not l.strip() or l.startswith("#"): continue
    f = (l.split("\t") + [""] * 7)[:7]
    yield f

def lignes_sources():
  L = []
  for t, org, col, ind, ide, lim, note in list(lire("recorad-2025.tsv")) + [("IGR",) + tuple(x[1:]) for x in lire("igr-stereo-2018.tsv")]:
    cible = ORGANE[org]
    cles = cible if isinstance(cible, list) else [cible]
    for c in cles:
      cle, qual = (c if isinstance(c, tuple) else (c, ""))
      reg, fx, dpf = colonne(t if t != "IGR" else "IGR", col)
      ind2 = ind + (" (" + qual + ")" if qual and qual not in ind else "")
      L.append({"t": t, "oar_id": cle, "regime": reg, "fx": fx, "dpf": dpf, "indicateur": ind2, "ideal": ide, "limitant": lim, "note": note,
                "source": SRC_IGR if t == "IGR" else SRC_R25 + " (" + TABLE_NOM[t] + ")"})
  return L

def signature(l): return (l["regime"], l["fx"], l["dpf"])
def empreinte(ls): return sorted((x["indicateur"], x["ideal"], x["limitant"]) for x in ls)

def construire():
  src = lignes_sources()
  par = collections.defaultdict(list)
  for l in src: par[(l["oar_id"], signature(l), l["t"])].append(l)
  cles = sorted({l["oar_id"] for l in src})
  base = []
  for k in cles:
    sigs = sorted({signature(l) for l in src if l["oar_id"] == k}, key=lambda s: (s[0], s[1] or 0, s[2] or 0))
    ordre = HOME.get(k, TOUTES)
    for s in sigs:
      tabs = [t for t in ordre + [t for t in TOUTES if t not in ordre] + ["IGR"] if par.get((k, s, t))]
      if s[0] == "stereo" and "IGR" in tabs and not any(t in ordre for t in tabs):
        tabs = ["IGR"] + [t for t in tabs if t != "IGR"]
      gen = tabs[0]; ref = par[(k, s, gen)]
      for l in ref: base.append(dict(l))
      for t in tabs[1:]:
        if t == "IGR" or empreinte(par[(k, s, t)]) == empreinte(ref): continue
        for l in par[(k, s, t)]: base.append(dict(l, loc=TABLE_LOC[t]))
  # moelle épinière ↔ canal médullaire : même valeur quand l'une manque pour ce régime et ce fractionnement
  for a, b in (("oar-moelle", "oar-canal-medullaire"), ("oar-canal-medullaire", "oar-moelle")):
    sa = {signature(l) for l in base if l["oar_id"] == a and not l.get("loc")}
    for l in [x for x in base if x["oar_id"] == b and not x.get("loc")]:
      if signature(l) not in sa: base.append(dict(l, oar_id=a, note=((l["note"] + " ; ") if l["note"] else "") + "valeur donnée pour le " + ("canal médullaire" if b == "oar-canal-medullaire" else "la moelle épinière")))
  return base

def completer(base, ancien):
  # OAR contourés sans aucune valeur de base dans le régime du schéma : ancien jeu (Curie, Gustave Roussy, QUANTEC) qui le cite
  OAR = json.loads((DR / "oar.json").read_text())
  cle = {o["id"]: o.get("somme") or o.get("paire") or o["id"] for o in OAR["oar"]}
  jeux = {j["id"]: j for j in ancien["jeux"]}
  idx = json.loads((DR / "index.json").read_text())
  manques = collections.defaultdict(set)
  ajout = []
  for loc in idx["localisations"]:
    d = json.loads((DR / (loc["id"] + ".json")).read_text())
    vol = {v["id"]: v for v in d.get("volumes", [])}
    for s in d["schemas"]:
      reg = {"rte_normo": "normo", "rte_plus_curie": "normo", "rte_hypo": "hypo", "sbrt": "stereo"}.get(s.get("type"))
      if not reg: continue
      for o in (vol.get(s.get("volumes_id")) or {}).get("oar_ids", []):
        k = cle.get(o, o)
        if any(l["oar_id"] == k and l["regime"] == reg for l in base): continue
        manques[(k, reg)].add(loc["id"])
        for jid in s.get("contraintes_ids", []):
          if jid in ESSAIS or jid not in jeux: continue
          for l in jeux[jid]["lignes"]:
            if cle.get(l["oar_id"], l["oar_id"]) == k:
              ajout.append({"oar_id": k, "regime": reg, "fx": None, "dpf": None, "indicateur": l.get("indicateur", ""), "ideal": l.get("ideal", ""),
                            "limitant": l.get("limitant", ""), "note": l.get("note", ""), "source": jeux[jid]["source"], "_jeu": jid, "_loc": loc["id"]})
  return manques, ajout

ALIAS = {"oar-ailes-iliaques": "oar-os-pelviens", "oar-bandelettes-optiques": "oar-chiasma", "oar-sigmoide": "oar-colon", "oar-oreilles-internes": "oar-cochlees",
  "oar-zone-evitement-hippocampique": "oar-hippocampes"}
FX_JEU = {"ct-pou-sbrt-curie-3fx": [3], "ct-pou-sbrt-curie-4fx": [4], "ct-pou-sbrt-curie-5-8fx": [5, 8], "ct-pou-sbrt-igr-3fx": [3], "ct-pou-sbrt-igr-5plus": [5, 8, 10],
  "ct-foie-sbrt-igr-3fx": [3], "ct-foie-sbrt-igr-5fx": [5], "ct-foie-sbrt-igr-10fx": [10], "ct-srs-curie-1fx": [1], "ct-srs-curie-3fx": [3], "ct-srs-curie-5fx": [5],
  "ct-srs-igr-1fx": [1], "ct-srs-igr-3fx": [3], "ct-srs-igr-5fx": [5], "ct-sbrt-abdo-5fx": [5], "ct-surrenale-igr-5fx": [5], "ct-pro-sbrt5-curie": [5]}
NOMS = {}

def nom(k):
  if not NOMS:
    O = json.loads((DR / "oar.json").read_text())
    NOMS.update({o["id"]: o["nom"] for o in O["oar"]}); NOMS.update({p["id"]: p["nom"] for p in O["paires"]})
  return NOMS.get(k, k)

def complements():
  L = []
  for l in (pathlib.Path(__file__).parent / "complements.tsv").read_text().splitlines():
    if not l.strip() or l.startswith("#"): continue
    k, reg, fx, ind, ide, lim, note, src = (l.split("\t") + [""] * 8)[:8]
    L.append({"oar_id": k, "regime": reg, "fx": int(fx) if fx else None, "dpf": None, "indicateur": ind, "ideal": ide, "limitant": lim, "note": note, "source": src})
  return L

def assembler():
  ancien = json.loads((DR / "contraintes.json").read_text())
  if "base" in ancien: ancien = json.loads((DOC / "construction" / "contraintes-2026-10-24.json").read_text())
  base = construire() + complements()
  # anciens jeux (Curie, Gustave Roussy, QUANTEC) pour un OAR contouré encore sans valeur dans le régime du schéma
  manques, ajout = completer(base, ancien)
  vus = set()
  for a in ajout:
    if a["regime"] == "hypo": continue
    fxs = FX_JEU.get(a["_jeu"], [None]) if a["regime"] == "stereo" else [None]
    if a["regime"] == "stereo" and a["_jeu"] not in FX_JEU: continue
    if a["regime"] == "normo" and a["_jeu"] in FX_JEU: continue
    for fx in fxs:
      cle = (a["oar_id"], a["regime"], fx, a["indicateur"], a["ideal"], a["limitant"])
      if cle in vus: continue
      vus.add(cle)
      base.append({k: v for k, v in dict(a, fx=fx).items() if not k.startswith("_")})
  # alias : même valeur qu'un organe voisin quand rien n'est publié pour ce régime
  for a, b in ALIAS.items():
    regs = {l["regime"] for l in base if l["oar_id"] == a}
    for l in [x for x in base if x["oar_id"] == b and x["regime"] not in regs]:
      base.append(dict(l, oar_id=a, note=((l["note"] + " ; ") if l["note"] else "") + "même valeur que : " + nom(b)))
  out = []
  ids = set()
  for l in base:
    x = {"oar_id": l["oar_id"], "regime": l["regime"]}
    if l.get("fx"): x["fx"] = l["fx"]
    if l.get("dpf"): x["dpf"] = l["dpf"]
    if l.get("loc"): x["loc"] = l["loc"]
    for k in ("indicateur", "ideal", "limitant", "note", "source"):
      if l.get(k): x[k] = l[k]
    h = __import__("hashlib").sha1(json.dumps(x, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:8]
    if h in ids: continue
    ids.add(h); x = {"id": "cb-" + h, **x}; out.append(x)
  essais = [j for j in ancien["jeux"] if j["id"] in ESSAIS]
  return ancien, out, essais, manques

def ecrire():
  ancien, base, essais, manques = assembler()
  sauve = DOC / "construction" / "contraintes-2026-10-24.json"
  if not sauve.exists(): sauve.write_text(json.dumps(ancien, ensure_ascii=False, indent=1) + "\n")
  aide = [a for a in ancien.get("aide_colonnes", []) if any(a["source_contient"] in (j.get("source") or "") for j in essais) or a["source_contient"] == "defaut"]
  sortie = {"version": "2026-10-25", "format": 2,
    "note": "Base : une contrainte par OAR et par régime (normofractionné, hypofractionné, stéréotaxie selon le nombre de fractions), d'après RecoRad 2025 ; précisions par localisation (loc) ; jeux des essais et de la curiethérapie gardés (essais).",
    "aide": {"ideal": "Objectif optimal : à atteindre si possible, sans bloquer la validation du plan.", "limitant": "Contrainte à ne pas dépasser (ou valeur acceptable), sauf avis médical."},
    "base": base, "essais": essais, "aide_colonnes": aide}
  (DR / "contraintes.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=1) + "\n")
  # schémas : seuls les jeux d'essais, de curiethérapie et de réirradiation restent liés
  n = 0
  for f in sorted(DR.glob("*.json")):
    d = json.loads(f.read_text())
    if not isinstance(d, dict) or "schemas" not in d: continue
    ch = False
    for s in d["schemas"]:
      ids = s.get("contraintes_ids") or []
      gard = [i for i in ids if i in ESSAIS]
      if gard != ids: s["contraintes_ids"] = gard; ch = True; n += 1
    if ch: f.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
  idx = json.loads((DR / "index.json").read_text())
  for s in idx.get("schemas", []):
    if "contraintes_ids" in s: s["contraintes_ids"] = [i for i in s["contraintes_ids"] if i in ESSAIS]
  print(len(base), "lignes de base,", len(essais), "jeux d'essais ;", n, "schémas mis à jour")

if __name__ == "__main__" and __import__("sys").argv[1:] == ["ecrire"]:
  ecrire(); raise SystemExit

if __name__ == "__main__":
  ancien = json.loads((DR / "contraintes.json").read_text())
  base = construire()
  manques, ajout = completer(base, ancien)
  print(len(base), "lignes de base ;", len({l["oar_id"] for l in base}), "OAR")
  print("régimes :", collections.Counter(l["regime"] for l in base), "; par localisation :", sum(1 for l in base if l.get("loc")))
  print("manques (OAR, régime) :", len(manques))
  for (k, r), locs in sorted(manques.items()): print("  ", k, r, sorted(locs)[:6], "→ ancien jeu :", sorted({(a["_jeu"]) for a in ajout if a["oar_id"] == k and a["regime"] == r}))
