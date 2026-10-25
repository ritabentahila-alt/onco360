#!/usr/bin/env python3
"""Conversion des onglets du document « Onco360 — Module Radiothérapie » (exports Markdown)
vers les JSON de public/donnees-rt/ et le rapport docs/radiotherapie/rapport-import.txt.
Usage : python3 convert.py <dossier_exports_md> <listes_DIAG.json> <dossier_sortie>"""
import json, os, re, sys, glob, collections, unicodedata, datetime

SRC, DIAGF, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
VERSION = "2026-10-25"
rapport = collections.defaultdict(list)

def warn(cat, msg): rapport[cat].append(msg)

# ---------------------------------------------------------------- lecture Markdown
def unesc(s):
    s = re.sub(r'\\([\\`*_{}\[\]()#+\-.!|<>~=])', r'\1', s)
    return s.strip()

def split_row(line):
    line = line.strip()
    if line.startswith('|'): line = line[1:]
    if line.endswith('|') and not line.endswith('\\|'): line = line[:-1]
    cells, cur, i = [], '', 0
    while i < len(line):
        c = line[i]
        if c == '\\' and i + 1 < len(line):
            cur += line[i:i+2]; i += 2; continue
        if c == '|':
            cells.append(cur); cur = ''
        else: cur += c
        i += 1
    cells.append(cur)
    return [unesc(c) for c in cells]

MOIS = {m: i+1 for i, m in enumerate(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])}
def parse_date(s):
    s = s.strip()
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})', s)
    if m: return m.group(0)
    m = re.match(r'([A-Z][a-z]{2}) (\d{1,2}), (\d{4})', s)
    if m: return '%s-%02d-%02d' % (m.group(3), MOIS[m.group(1)], int(m.group(2)))
    return None

def parse_md(path):
    """Renvoie {titre, date_maj, sections:[{titre, blocs:[('table', titre, suite, header, rows) | ('p', texte)]}]}"""
    L = open(path, encoding='utf-8').read().split('\n')
    doc = {'titre': L[0].lstrip('# ').strip(), 'date_maj': None, 'sections': []}
    sec = None; i = 1; pending = None
    while i < len(L):
        l = L[i]
        if l.startswith('Mise à jour'):
            doc['date_maj'] = parse_date(l.split(':', 1)[1]); i += 1; continue
        if l.startswith('## '):
            sec = {'titre': l[3:].strip(), 'blocs': []}; doc['sections'].append(sec); i += 1; continue
        m = re.match(r'\*\*(Tableau[^*]*?|OAR [^*]*?)\*\*\s*(.*)$', l)
        if m and not l.startswith('**Tableaux'):
            t = m.group(1).strip(); reste = m.group(2).strip()
            # le tableau suit
            j = i + 1
            while j < len(L) and not L[j].startswith('|'):
                if L[j].strip(): break
                j += 1
            if j < len(L) and L[j].startswith('|'):
                header = [h.strip() for h in split_row(L[j])]
                rows = []; k = j + 2
                while k < len(L) and L[k].startswith('|'):
                    rows.append(split_row(L[k])); k += 1
                suite = reste.startswith('(suite')
                if sec is None: sec = {'titre': '', 'blocs': []}; doc['sections'].append(sec)
                sec['blocs'].append(('table', t, suite, header, rows, reste))
                i = k; continue
        if l.strip() and sec is not None and not l.startswith('|'):
            sec['blocs'].append(('p', l.strip()))
        i += 1
    return doc

def tables(doc, nom):
    """Toutes les lignes (dict) des tableaux de ce titre, suites comprises, dans l'ordre."""
    out = []
    for s in doc['sections']:
        for b in s['blocs']:
            if b[0] == 'table' and b[1] == nom:
                h = b[3]
                for r in b[4]:
                    if len(r) != len(h):
                        warn('Lignes mal formées', f"{doc['titre']} / {nom} : {len(r)} cellules pour {len(h)} colonnes : {r[:2]}")
                        r = (r + [''] * len(h))[:len(h)]
                    out.append(dict(zip(h, r)))
    return out

def vide(v): return v is None or v.strip() in ('', '—', '-')
def clean(d):
    """Retire les champs vides (règle : champ vide = absent)."""
    return {k: v for k, v in d.items() if not (isinstance(v, str) and vide(v)) and v != [] and v is not None and v != {}}

def liste(v):
    if vide(v): return []
    return [x.strip() for x in v.split(';') if x.strip()]

def nombre(v, champ, ctx, entier=False):
    if vide(v): return None
    s = v.replace(',', '.').replace(' ', '').replace(' ', '')
    try:
        f = float(s)
        if entier:
            if f != int(f): warn('Nombres', f'{ctx} : {champ} = « {v} » non entier'); return f
            return int(f)
        return int(f) if f == int(f) else f
    except ValueError:
        warn('Nombres', f'{ctx} : {champ} = « {v} » n’est pas un nombre (gardé en texte)')
        return v

# ---------------------------------------------------------------- référentiel
REGIONS = [('uro','Uro'),('gyneco','Gynéco'),('digestif','Digestif'),('orl','ORL'),('thorax','Thorax'),('sein','Sein'),
           ('snc','SNC'),('os_palliatif','Os et palliatif'),('sarcome','Sarcomes'),('peau','Peau'),('autres','Autres')]
REG_NOM = dict(REGIONS)
LOCS = {
 'uro': ['prostate','vessie','seminome','penis'],
 'gyneco': ['col','endometre','vagin','vulve'],
 'digestif': ['oesophage','estomac','pancreas','foie','rectum','canal_anal'],
 'orl': ['cavite_buccale','oropharynx','larynx','hypopharynx','cavum','sinus','glandes_salivaires','orl_palliatif'],
 'thorax': ['poumon','mesotheliome','thymome'],
 'sein': ['sein','sein_ccis'],
 'snc': ['glioblastome','gliome','metastases_cerebrales','meningiome','schwannome','hypophyse','craniopharyngiome','neurocytome','ependymome','medulloblastome'],
 'os_palliatif': ['metastases_osseuses','sbrt_os','surrenale','reirradiation'],
 'sarcome': ['sarcome_membres','sarcome_retroperitoine','chordome'],
 'peau': ['peau_carcinome','merkel','melanome'],
 'autres': ['melanome_uveal'],
}
LOC_REGION = {l: r for r, ls in LOCS.items() for l in ls}
FRAC = {'rte_normo':'Normofractionné','rte_hypo':'Hypofractionné','sbrt':'Stéréotaxie','curie_hdr':'Curiethérapie',
        'curie_pdr':'Curiethérapie','curie_ldr':'Curiethérapie','rte_plus_curie':'RTE + curiethérapie'}
E_CONTEXTE = {'en_place','post_op','rattrapage','metastatique','oligometastatique','palliatif','reirradiation'}
E_PREUVE = {'essai_phase3','recommandation','pratique_institutionnelle','option'}
E_MODE = {'SIB','sequentiel','seul'}
E_VOL = {'GTV','CTV','ITV','PTV','PRV','structure'}
PSEUDO_OAR = {'cible-ctv': 'Cible (CTV)', 'cible-ptv': 'Cible (PTV)'}
E_ESSAI = {'essai','recommandation','atlas','protocole_institutionnel'}
ALIAS_OAR = {'oar-anus': 'oar-canal-anal'}

docs = {}
for f in sorted(glob.glob(os.path.join(SRC, '*.md'))):
    d = parse_md(f); docs[d['titre']] = d

spec = next(d for t, d in docs.items() if t.startswith('Onco360'))
# noms des localisations : index des onglets (colonne Onglet, Fichier JSON)
loc_nom = {}
for s in spec['sections']:
    if s['titre'] == 'Index des onglets de contenu':
        pass
idx_txt = open(next(f for f in glob.glob(os.path.join(SRC, '*.md')) if os.path.basename(f).startswith('Onco360')), encoding='utf-8').read()
for m in re.finditer(r'^\| ([^|]+?) — ([^|]+?) \| `([a-z_]+)\.json` \|', idx_txt, re.M):
    if m.group(1) != 'Bibliothèque': loc_nom[m.group(3)] = m.group(2).strip()

# ---------------------------------------------------------------- bibliothèques
lib_oar = next(d for t, d in docs.items() if t.startswith('Bibliothèque — Organes'))
lib_ct = next(d for t, d in docs.items() if t.startswith('Bibliothèque — Contraintes'))
lib_es = next(d for t, d in docs.items() if t.startswith('Bibliothèque — Essais'))

OAR = collections.OrderedDict()
for s in lib_oar['sections']:
    for b in s['blocs']:
        if b[0] != 'table' or b[3][:3] != ['id', 'nom', 'nom_tg263']: continue
        h = b[3]
        for r in b[4]:
            d = dict(zip(h, (r + [''] * len(h))[:len(h)]))
            if d['id'] in ALIAS_OAR:
                warn('OAR fusionnés', f"{d['id']} fusionné sous {ALIAS_OAR[d['id']]} (définition : « {d['definition'][:80]}… »)"); continue
            if d['id'] in OAR: warn('Identifiants en double', f"OAR {d['id']}")
            d.setdefault('region', 'pelvis')
            if vide(d.get('region', '')): d['region'] = 'pelvis'
            OAR[d['id']] = clean({k: d.get(k, '') for k in ['id', 'nom', 'nom_tg263', 'definition', 'source', 'region']})

JEUX = collections.OrderedDict()
for d in tables(lib_ct, 'Tableau Jeux de contraintes'):
    if d['id'] in JEUX: warn('Identifiants en double', f"jeu de contraintes {d['id']}")
    if d['verification'] not in ('verifie', 'service'):
        warn('Jeux refusés', f"{d['id']} : verification = {d['verification']}"); continue
    JEUX[d['id']] = clean({k: d[k] for k in ['id', 'titre', 'fractionnement', 'source', 'verification']}); JEUX[d['id']]['lignes'] = []
nb_lignes = 0
for d in tables(lib_ct, 'Tableau Lignes de contraintes'):
    j = JEUX.get(d['contraintes_id'])
    if j is None: warn('Références introuvables', f"ligne de contrainte → jeu {d['contraintes_id']} inconnu"); continue
    oars = liste(d['oar_id']) or ['']
    for o in oars:
        o = ALIAS_OAR.get(o, o)
        if o and o not in OAR and o not in PSEUDO_OAR: warn('Références introuvables', f"jeu {j['id']} → OAR {o} inconnu")
        j['lignes'].append(clean({'oar_id': o, 'indicateur': d['indicateur'], 'ideal': d['ideal'], 'limitant': d['limitant'], 'note': d['note']}))
        nb_lignes += 1
AIDE = [clean({'source_contient': d['source_contient'], 'ideal': d['ideal'], 'limitant': d['limitant']}) for d in tables(lib_ct, 'Tableau Aide des colonnes')]
for j in JEUX.values():
    if not j.get('lignes'): warn('Jeux sans ligne', j['id'])

ESSAIS = collections.OrderedDict()
for d in tables(lib_es, 'Tableau Essais'):
    if d['id'] in ESSAIS: warn('Identifiants en double', f"essai {d['id']}")
    if d['type'] not in E_ESSAI: warn('Valeurs hors liste', f"essai {d['id']} : type {d['type']}")
    e = {k: d[k] for k in ['id', 'acronyme', 'type', 'revue', 'annee', 'pmid', 'doi', 'population', 'bras', 'resultat']}
    if re.search(r'\[.+\]\(', e['doi'] or ''): warn('Valeurs hors liste', f"essai {d['id']} : doi en lien Markdown")
    for k in ('pmid', 'doi', 'annee'):
        vals = [x.strip() for x in re.split(r'\s;\s', e[k] or '') if x.strip()]
        if len(vals) > 1:
            e[k] = vals[0]; e[k + '_suite'] = vals[1:]
            warn('Essais à plusieurs publications', f"{d['id']} : {k} = {' ; '.join(vals)} → {k} = {vals[0]}, {k}_suite = {vals[1:]}")
    if not vide(e['annee']): e['annee'] = nombre(e['annee'], 'annee', 'essai ' + d['id'], True)
    if '_suite' in ''.join(e) and 'annee_suite' in e: e['annee_suite'] = [nombre(a, 'annee', d['id'], True) for a in e['annee_suite']]
    if not vide(e['pmid']) and not re.fullmatch(r'\d+', e['pmid']): warn('Valeurs hors liste', f"essai {d['id']} : pmid « {e['pmid']} »")
    ESSAIS[d['id']] = clean(e)

# ---------------------------------------------------------------- localisations
META = [r'^(Un|Une|Deux|Trois|Quatre|Cinq|Six|Sept|Huit|Neuf|Dix|Onze|Douze|Treize|Quatorze|Quinze|Seize|Dix-[a-z]+|Vingt[a-z -]*|Trente[a-z -]*|\d+) (situations?|schémas?)\b',
        r'Région `', r'^Tous : statut', r'tableaux? ci-dessus', r'cette section', r'règle dans la spécification',
        r'^Pas de curiethérapie', r'^Pas de fiche de centrage', r'^Afficher «', r'^Fiches? `', r'^Fiches? communes', r'^Volumes `',
        r'^Mêmes? centrage', r'^Fractionnement classique : fiche', r'^Radiochirurgie : fiche', r'^`protocole` =', r'^Hors essai, l']
def phrases(p):
    return [x for x in re.split(r'(?<=[.!?])\s+(?=[A-ZÉÈÀÂÎÔÛÇ«`*])', p) if x.strip()]
def texte_utile(p):
    garde = [ph for ph in phrases(p) if not any(re.search(m, ph) for m in META)]
    t = ' '.join(garde).strip()
    t = re.sub(r'le module affiche aussi : « (.+?) »', r'\1', t)
    t = t.replace('Équivalences à afficher pour la HDR', 'Équivalences pour la HDR')
    return t if len(t) > 3 else ''

META += [r'\(onglet ', r'onglet «', r'Ce tableau alimente', r'cet onglet', r'^Le col opéré utilise `', r'^\w+ jeux de volumes',
         r'^Le calcul BED / EQD2 du module', r'^Volumes de l.ESTRO-EANO 2024 pour']

RE_ECART = [(re.compile(r'\s*\((?:voir |cf\. )?écarts? E\d+(?:\s*(?:,|et)\s*E\d+)*\)'), ''),
            (re.compile(r'\s*[:;,]\s*écarts? E\d+(?:\s*(?:,|et)\s*E\d+)*'), ''),
            (re.compile(r'\s*\(écarts? E\d+[^)]*\)'), ''),
            (re.compile(r',\s*voir écarts? E\d+(?:\s*à\s*E\d+)?'), '')]
def sans_ecart(x, ctx):
    if isinstance(x, str):
        y = x
        for r, s in RE_ECART: y = r.sub(s, y)
        if y != x: warn('Renvois au journal des écarts retirés du texte affiché', f'{ctx} : « …{x[max(0, x.find("cart E")-40):x.find("cart E")+12]}… »')
        if re.search(r'écarts? E\d', y): warn('Renvois au journal des écarts restants', f'{ctx} : {y[:120]}')
        return y
    if isinstance(x, list): return [sans_ecart(v, ctx) for v in x]
    if isinstance(x, dict): return {k: (v if k in ('id', 'cible') else sans_ecart(v, ctx + '/' + k)) for k, v in x.items()}
    return x

SEC_TEXTES = {'Curiethérapie': 'curietherapie', 'Curiethérapie prostate': 'curietherapie', 'Centrage': 'centrage',
              'Contourage': 'contourage', 'Traitement systémique associé': 'systemique', 'Hormonothérapie associée': 'systemique'}

SIMS, VOLS, SCHEMAS, SITUS = {}, {}, {}, {}
locs = {}
for t, d in docs.items():
    if t.startswith(('Onco360', 'Bibliothèque', 'Journal')): continue
    full = ' '.join(b[1] for s in d['sections'] for b in s['blocs'] if b[0] == 'p')
    m = re.search(r'Région `([a-z_]+)`, localisation `([a-z_]+)`', full.replace('\\_', '_'))
    if not m: warn('Onglets non reconnus', t); continue
    reg, lid = m.group(1), m.group(2)
    if LOC_REGION.get(lid) != reg: warn('Onglets non reconnus', f'{t} : région {reg} / localisation {lid} hors liste')
    m2 = re.search(r'date_verif`? = `?(\d{4}-\d{2}-\d{2})', full.replace('\\_', '_'))
    date_verif = m2.group(1) if m2 else None
    # schémas revérifiés après la date de l'onglet : « date_verif = AAAA-MM-JJ pour : id ; id »
    reverif = {i.strip(): m3.group(1) for m3 in re.finditer(r'date_verif`? = `?(\d{4}-\d{2}-\d{2})`? pour : ([a-z0-9 ;-]+)', full.replace('\\_', '_')) for i in m3.group(2).split(';') if i.strip()}
    if not date_verif: warn('Dates', f'{t} : date_verif introuvable')
    loc = {'id': lid, 'region_id': reg, 'nom': loc_nom.get(lid, t.split(' — ', 1)[-1]), 'date_maj': d['date_maj'] or date_verif,
           'onglet': t, 'situations': [], 'schemas': [], 'simulations': [], 'volumes': [], 'curie_indications': [],
           'systemique': [], 'hormonotherapie': [], 'points_attention': [], 'textes': {}, '_date_verif': date_verif}
    # textes
    for s in d['sections']:
        k = SEC_TEXTES.get(s['titre'])
        if not k: continue
        for b in s['blocs']:
            if b[0] == 'p':
                u = texte_utile(b[1])
                if u: loc['textes'].setdefault(k, []).append(u)
    # situations
    for r in tables(d, 'Tableau Situations'):
        st = clean({'id': r['id'], 'localisation_id': lid, 'titre': r['titre'], 'contexte': r['contexte'], 'criteres': r['criteres'],
                    'ordre': nombre(r['ordre'], 'ordre', r['id'], True)})
        if r['contexte'] not in E_CONTEXTE: warn('Valeurs hors liste', f"situation {r['id']} : contexte {r['contexte']}")
        if r['id'] in SITUS: warn('Identifiants en double', f"situation {r['id']}")
        SITUS[r['id']] = st; loc['situations'].append(st)
    # schémas
    sch = collections.OrderedDict()
    for r in tables(d, 'Tableau Schémas'):
        if r['id'] in SCHEMAS or r['id'] in sch: warn('Identifiants en double', f"schéma {r['id']}")
        if r['type'] not in FRAC: warn('Valeurs hors liste', f"schéma {r['id']} : type {r['type']}")
        if r['preuve'] not in E_PREUVE: warn('Valeurs hors liste', f"schéma {r['id']} : preuve {r['preuve']}")
        sch[r['id']] = {'id': r['id'], 'situation_id': r['situation_id'], 'titre': r['titre'], 'type': r['type'], 'preuve': r['preuve'],
                        'essai_ids': liste(r['essai_ids']), 'source_institutionnelle': r['source_institutionnelle'], 'prescriptions': []}
    for r in tables(d, 'Tableau Prescriptions'):
        s = sch.get(r['schema_id'])
        if s is None: warn('Références introuvables', f"{t} : prescription → schéma {r['schema_id']} inconnu"); continue
        ctx = f"schéma {r['schema_id']} / {r['volume']}"
        if not vide(r['mode']) and r['mode'] not in E_MODE: warn('Valeurs hors liste', f"{ctx} : mode {r['mode']}")
        p = clean({'volume': r['volume'], 'dose_Gy': nombre(r['dose_Gy'], 'dose_Gy', ctx), 'fractions': nombre(r['fractions'], 'fractions', ctx, True),
                   'dose_fx_Gy': nombre(r['dose_fx_Gy'], 'dose_fx_Gy', ctx), 'mode': r['mode'], 'rythme': r['rythme'], 'note': r['note']})
        # contrôle arithmétique dose = fractions × dose par fraction
        if all(isinstance(p.get(k), (int, float)) for k in ('dose_Gy', 'fractions', 'dose_fx_Gy')):
            if abs(p['fractions'] * p['dose_fx_Gy'] - p['dose_Gy']) > 0.06 * max(1, p['fractions'] / 10):
                warn('Contrôle dose = séances × dose par séance', f"{ctx} : {p['fractions']} × {p['dose_fx_Gy']} = {round(p['fractions']*p['dose_fx_Gy'],3)} ≠ {p['dose_Gy']}")
        s['prescriptions'].append(p)
    for r in tables(d, 'Tableau Schémas — liens'):
        s = sch.get(r['id'])
        if s is None: warn('Références introuvables', f"{t} : liens → schéma {r['id']} inconnu"); continue
        s.update({'technique': r['technique'], 'systemique': r['systemique'], 'simulation_id': r['simulation_id'],
                  'volumes_id': r['volumes_id'], 'contraintes_ids': liste(r['contraintes_id']), 'couverture': r['couverture']})
    for sid, s in sch.items():
        if not s['prescriptions']: warn('Schémas sans prescription', sid)
        if 'technique' not in s: warn('Schémas sans ligne de liens', sid)
        st = SITUS.get(s['situation_id'])
        if st is None or st['localisation_id'] != lid: warn('Références introuvables', f"schéma {sid} → situation {s['situation_id']}")
        s['date_verif'] = reverif.get(sid, date_verif)
        s['ind'] = [REG_NOM[reg], loc['nom'], st['titre'] if st else '', FRAC.get(s['type'], s['type'])]
        SCHEMAS[sid] = s; s['_loc'] = lid
        loc['schemas'].append(s)
    # simulations
    for r in tables(d, 'Tableau Simulation'):
        if r['id'] in SIMS: warn('Identifiants en double', f"simulation {r['id']}")
        SIMS[r['id']] = clean({k: r[k] for k in ['id', 'position', 'contention', 'preparation', 'scanner', 'imagerie', 'reperes']}); SIMS[r['id']]['_loc'] = lid
    # volumes
    vols = collections.OrderedDict()
    for r in tables(d, 'Tableau Volumes'):
        v = vols.setdefault(r['volumes_id'], {'id': r['volumes_id'], 'cibles': []})
        if r['type'] not in E_VOL: warn('Valeurs hors liste', f"volumes {r['volumes_id']} / {r['nom']} : type {r['type']}")
        v['cibles'].append(clean({k: r[k] for k in ['nom', 'type', 'definition', 'quand', 'marge']}))
    for r in tables(d, 'Tableau Volumes — OAR et atlas'):
        v = vols.setdefault(r['volumes_id'], {'id': r['volumes_id'], 'cibles': []})
        v['_oar_brut'] = r['oar_ids']
        at = []
        for it in liste(r['atlas']):
            if re.match(r'écarts? E\d', it): warn('Renvois au journal des écarts retirés du texte affiché', f"volumes {r['volumes_id']} : atlas « {it} » retiré"); continue
            m = re.fullmatch(r'\[(.+?)\]\(<?(\S+?)>?\)', it)
            at.append({'nom': m.group(1), 'url': m.group(2)} if m else {'nom': it})
        v['atlas'] = at
    for vid, v in vols.items():
        if vid in VOLS: warn('Identifiants en double', f"volumes {vid}")
        v['_loc'] = lid; VOLS[vid] = v
    # curiethérapie, systémique, hormonothérapie, points
    for r in tables(d, 'Tableau Curiethérapie — indications'):
        loc['curie_indications'].append(clean({k: r[k] for k in ['indication', 'modalite', 'niveau_preuve', 'note']}))
    for r in tables(d, 'Tableau Traitement systémique'):
        x = {'situation': r['situation'], 'traitement': r['traitement']}
        if 'protocole' in r: x['protocole'] = r['protocole'] if r['protocole'].strip() else ''
        if r['situation'] in SITUS: x['situation_id'] = r['situation']
        x['essai_ids'] = liste(r['essai_ids']); x['note'] = r['note']
        c = clean(x)
        if r.get('protocole', '').strip() == '—': c['protocole'] = '—'
        loc['systemique'].append(c)
    for r in tables(d, 'Tableau Hormonothérapie'):
        x = {'situation': r['situation'], 'hormonotherapie': r['hormonotherapie'], 'essai_ids': liste(r['essai_ids']), 'note': r['note']}
        if r['situation'] in SITUS: x['situation_id'] = r['situation']
        loc['hormonotherapie'].append(clean(x))
    for r in tables(d, "Tableau Points d'attention"):
        loc['points_attention'].append({'cible': r['cible'], 'point': r['point']})
    locs[lid] = loc

# ---------------------------------------------------------------- résolution des « Comme … » et des OAR des volumes
for vid, v in VOLS.items():
    brut = v.pop('_oar_brut', '')
    m = re.fullmatch(r'Comme (vol-[a-z0-9-]+)', brut.strip())
    if m:
        src = VOLS.get(m.group(1))
        if src is None: warn('Références introuvables', f'volumes {vid} : « {brut} »')
        else:
            v['_comme'] = m.group(1); warn('« Comme … » résolus', f"volumes {vid} : OAR et atlas recopiés de {m.group(1)}")
        continue
    ids, notes = [], {}
    for it in liste(brut):
        mm = re.fullmatch(r'(oar-[a-z0-9-]+)\s*(?:\((.*)\))?', it)
        if not mm: warn('Références introuvables', f'volumes {vid} : élément OAR « {it} »'); continue
        o = ALIAS_OAR.get(mm.group(1), mm.group(1))
        if o not in OAR: warn('Références introuvables', f'volumes {vid} → OAR {o} inconnu')
        ids.append(o)
        if mm.group(2): notes[o] = mm.group(2)
    v['oar_ids'] = ids
    if notes: v['oar_notes'] = notes
for vid, v in VOLS.items():
    if '_comme' in v:
        src = VOLS[v.pop('_comme')]
        v['oar_ids'] = list(src.get('oar_ids', []))
        if src.get('oar_notes'): v['oar_notes'] = dict(src['oar_notes'])
        if not v.get('atlas') or all(a.get('nom') in ('Fiche du service',) for a in v.get('atlas', [])):
            v['atlas'] = v.get('atlas') or list(src.get('atlas', []))
    v.setdefault('oar_ids', [])

for sid, s in SCHEMAS.items():
    for k in ('technique', 'systemique', 'couverture'):
        m = re.fullmatch(r'Comme ([a-z0-9-]+)', (s.get(k) or '').strip())
        if m and m.group(1) in SCHEMAS:
            s[k] = SCHEMAS[m.group(1)].get(k, ''); warn('« Comme … » résolus', f"schéma {sid} : {k} recopié de {m.group(1)}")
            m2 = re.fullmatch(r'Comme ([a-z0-9-]+)', (s.get(k) or '').strip())
            if m2 and m2.group(1) in SCHEMAS: s[k] = SCHEMAS[m2.group(1)].get(k, '')

# ---------------------------------------------------------------- contrôles de références
for sid, s in SCHEMAS.items():
    for e in s['essai_ids']:
        if e not in ESSAIS: warn('Références introuvables', f'schéma {sid} → essai {e}')
    if not vide(s.get('simulation_id', '')) and s['simulation_id'] not in SIMS: warn('Références introuvables', f"schéma {sid} → simulation {s['simulation_id']}")
    if not vide(s.get('volumes_id', '')) and s['volumes_id'] not in VOLS: warn('Références introuvables', f"schéma {sid} → volumes {s['volumes_id']}")
    for c in s.get('contraintes_ids', []):
        if c not in JEUX: warn('Références introuvables', f'schéma {sid} → contraintes {c}')
    if vide(s.get('simulation_id', '')): warn('Schémas sans fiche de centrage', sid)
    if not s.get('contraintes_ids'): warn('Schémas sans jeu de contraintes (« Aucun jeu publié pour ce fractionnement »)', sid)
for lid, loc in locs.items():
    for x in loc['systemique'] + loc['hormonotherapie']:
        for e in x.get('essai_ids', []):
            if e not in ESSAIS: warn('Références introuvables', f'{lid} systémique → essai {e}')

# points d'attention : rattachement
for lid, loc in locs.items():
    for p in loc['points_attention']:
        c = p['cible']
        if c == lid: p['portee'] = 'localisation'
        elif c in SCHEMAS: p['portee'] = 'schema'
        elif c in SITUS: p['portee'] = 'situation'
        elif c in VOLS: p['portee'] = 'volumes'
        elif c in JEUX: p['portee'] = 'contraintes'
        elif c in SIMS: p['portee'] = 'simulation'
        else: p['portee'] = 'localisation'; warn("Points d'attention : cible non reconnue (affichés sur toute la localisation)", f'{lid} : « {c} »')
    for s in loc['schemas']:
        cibles = {s['id'], s['situation_id'], s.get('volumes_id'), s.get('simulation_id'), *s.get('contraintes_ids', [])}
        s['points_attention'] = [p['point'] for p in loc['points_attention'] if p['portee'] != 'localisation' and p['cible'] in cibles]

# ---------------------------------------------------------------- sortie
os.makedirs(OUT, exist_ok=True)
def ecrire(nom, obj):
    with open(os.path.join(OUT, nom), 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1); f.write('\n')

ORDRE_SCH = {'essai_phase3': 0, 'recommandation': 1, 'pratique_institutionnelle': 2, 'option': 3}
index = {'version': VERSION, 'regions': [], 'localisations': [], 'situations': [], 'schemas': []}
ordre_loc = 0
for ri, (rid, rnom) in enumerate(REGIONS, 1):
    index['regions'].append({'id': rid, 'nom': rnom, 'ordre': ri})
    for lid in LOCS[rid]:
        ordre_loc += 1
        loc = locs.get(lid)
        if loc is None: warn('Localisations absentes', lid); continue
        loc['ordre'] = ordre_loc
        sch_out = []
        for s in loc['schemas']:
            o = {k: s.get(k) for k in ['id', 'situation_id', 'titre', 'type', 'preuve', 'essai_ids', 'source_institutionnelle', 'prescriptions',
                                       'technique', 'systemique', 'simulation_id', 'volumes_id', 'contraintes_ids', 'couverture', 'points_attention', 'date_verif', 'ind']}
            o = clean(o); o.setdefault('contraintes_ids', []); o.setdefault('essai_ids', []); o.setdefault('points_attention', [])
            o['ind'] = s['ind']
            sch_out.append(o)
            index['schemas'].append(clean({'id': s['id'], 'localisation_id': lid, 'situation_id': s['situation_id'], 'titre': s['titre'],
                'type': s['type'], 'preuve': s['preuve'], 'essais': [ESSAIS[e]['acronyme'] for e in s['essai_ids'] if e in ESSAIS and ESSAIS[e].get('acronyme')],
                'source_institutionnelle': s.get('source_institutionnelle', ''),
                'doses': [clean({k: p.get(k) for k in ('volume', 'dose_Gy', 'fractions', 'dose_fx_Gy')}) for p in s['prescriptions']],
                'ind': s['ind']}))
        # objets partagés : on recopie dans le fichier tout ce que ses schémas citent
        sim_ids = [x['id'] for x in SIMS.values() if x['_loc'] == lid]
        vol_ids = [x['id'] for x in VOLS.values() if x['_loc'] == lid]
        for s in loc['schemas']:
            if s.get('simulation_id') in SIMS and s['simulation_id'] not in sim_ids: sim_ids.append(s['simulation_id'])
            if s.get('volumes_id') in VOLS and s['volumes_id'] not in vol_ids: vol_ids.append(s['volumes_id'])
        sims = [{k: v for k, v in SIMS[i].items() if k != '_loc'} for i in sim_ids]
        vols = [{k: v for k, v in VOLS[i].items() if k != '_loc'} for i in vol_ids]
        for i in sim_ids:
            if SIMS[i]['_loc'] != lid: warn('Objets partagés recopiés', f'{lid}.json reçoit la simulation {i} (définie dans {SIMS[i]["_loc"]})')
        for i in vol_ids:
            if VOLS[i]['_loc'] != lid: warn('Objets partagés recopiés', f'{lid}.json reçoit les volumes {i} (définis dans {VOLS[i]["_loc"]})')
        fichier = {'version': VERSION, 'id': lid, 'region_id': loc['region_id'], 'nom': loc['nom'], 'ordre': loc['ordre'], 'date_maj': loc['date_maj'],
                   'situations': loc['situations'], 'schemas': sch_out, 'simulations': sims, 'volumes': vols,
                   'curie_indications': loc['curie_indications'], 'systemique': loc['systemique'], 'hormonotherapie': loc['hormonotherapie'],
                   'points_attention': loc['points_attention'], 'textes': loc['textes']}
        fichier = sans_ecart(fichier, lid)
        ecrire(f'{lid}.json', fichier)
        index['localisations'].append({'id': lid, 'nom': loc['nom'], 'region_id': rid, 'ordre': loc['ordre'], 'date_maj': loc['date_maj'],
                                       'nb_schemas': len(sch_out), 'curietherapie': bool(loc['curie_indications']) or any(s['type'].startswith('curie') or s['type'] == 'rte_plus_curie' for s in loc['schemas'])})
        index['situations'] += [{k: v for k, v in st.items()} for st in loc['situations']]
ecrire('index.json', index)
ecrire('oar.json', sans_ecart({'version': VERSION, 'oar': list(OAR.values())}, 'oar'))
ecrire('contraintes.json', sans_ecart({'version': VERSION, 'jeux': list(JEUX.values()), 'aide_colonnes': AIDE}, 'contraintes'))
ecrire('essais.json', sans_ecart({'version': VERSION, 'essais': list(ESSAIS.values())}, 'essais'))

# ---------------------------------------------------------------- diag-localisation
DIAG = json.load(open(DIAGF, encoding='utf-8'))
DMAP = {
 "Cancer du sein RH+ / HER2−": "sein", "Cancer du sein HER2+": "sein", "Cancer du sein triple négatif": "sein", "Cancer du sein": "sein",
 "Carcinome canalaire in situ du sein": "sein_ccis", "Cancer du sein chez l’homme": "sein",
 "Cancer de l’œsophage": "oesophage", "Cancer de la jonction œso-gastrique": "oesophage", "Cancer de l’estomac": "estomac",
 "Cancer du rectum": "rectum", "Cancer du canal anal": "canal_anal", "Cancer du pancréas": "pancreas",
 "Carcinome hépatocellulaire": "foie", "Cancer des voies biliaires": "foie", "Cancer de la vésicule biliaire": "foie", "Métastases hépatiques": "foie",
 "Cancer du poumon non à petites cellules – adénocarcinome": "poumon", "Cancer du poumon non à petites cellules – épidermoïde": "poumon",
 "Cancer du poumon": "poumon", "Cancer du poumon à petites cellules": "poumon", "Mésothéliome": "mesotheliome", "Thymome / carcinome thymique": "thymome",
 "Cancer de la cavité buccale": "cavite_buccale", "Cancer de la langue": "cavite_buccale", "Cancer de l’oropharynx": "oropharynx",
 "Cancer de l’hypopharynx": "hypopharynx", "Cancer du larynx": "larynx", "Cancer du nasopharynx": "cavum",
 "Cancer des fosses nasales et des sinus": "sinus", "Cancer des glandes salivaires": "glandes_salivaires",
 "Corticosurrénalome": None,
 "Cancer du col de l’utérus": "col", "Cancer de l’endomètre": "endometre", "Cancer de la vulve": "vulve", "Cancer du vagin": "vagin",
 "Cancer de la prostate": "prostate", "Cancer de la vessie / voies urinaires": "vessie", "Tumeur germinale du testicule": "seminome", "Cancer du pénis": "penis",
 "Mélanome": "melanome", "Mélanome de l’uvée": "melanome_uveal", "Carcinome basocellulaire": "peau_carcinome", "Carcinome épidermoïde cutané": "peau_carcinome",
 "Carcinome de Merkel": "merkel", "Sarcome des tissus mous": "sarcome_membres", "Sarcome": "sarcome_membres",
 "Tumeur cérébrale (gliome)": "gliome", "Glioblastome": "glioblastome", "Gliome de bas grade": "gliome", "Méningiome": "meningiome",
 "Médulloblastome": "medulloblastome", "Métastases cérébrales": "metastases_cerebrales", "Métastases osseuses": "metastases_osseuses",
}
dl = {}
for lab in DIAG:
    v = DMAP.get(lab)
    if v: dl[lab] = v
for lab in DMAP:
    if lab not in DIAG: warn('diag-localisation', f'libellé absent de DIAG : {lab}')
ecrire('diag-localisation.json', {'version': VERSION, 'correspondances': dl})

# ---------------------------------------------------------------- rapport
nb_sch = len(SCHEMAS); nb_sit = len(SITUS)
lignes = []
A = lignes.append
A('Rapport de conversion — référentiel de radiothérapie Onco360')
A(f'Version du contenu : {VERSION} · généré le {datetime.date.today().isoformat()}')
A('Source : document Claude « Onco360 — Module Radiothérapie (spécification + référentiel) », exporté onglet par onglet en Markdown.')
A('')
A('== Comptes ==')
A(f'Régions : {len(REGIONS)} · localisations : {len(locs)} · situations : {nb_sit} · schémas : {nb_sch}')
A(f"Prescriptions : {sum(len(s['prescriptions']) for s in SCHEMAS.values())} · fiches de centrage : {len(SIMS)} · jeux de volumes : {len(VOLS)}")
A(f'OAR : {len(OAR)} · jeux de contraintes : {len(JEUX)} ({sum(1 for j in JEUX.values() if j["verification"]=="verifie")} publiés, {sum(1 for j in JEUX.values() if j["verification"]=="service")} du service) · lignes de contraintes : {nb_lignes}')
A(f"Essais et références : {len(ESSAIS)} (dont {sum(1 for e in ESSAIS.values() if e.get('pmid'))} avec PMID) · aide des colonnes : {len(AIDE)} lignes")
A(f"Curiethérapie : {sum(1 for s in SCHEMAS.values() if s['type'].startswith('curie') or s['type']=='rte_plus_curie')} schémas, {sum(len(l['curie_indications']) for l in locs.values())} lignes d'indications dans {sum(1 for l in locs.values() if l['curie_indications'])} localisations")
A(f"Traitement systémique : {sum(len(l['systemique']) for l in locs.values())} lignes · hormonothérapie : {sum(len(l['hormonotherapie']) for l in locs.values())} lignes")
A(f"Points d'attention : {sum(len(l['points_attention']) for l in locs.values())} · diag-localisation : {len(dl)} libellés de DIAG sur {len(DIAG)} rattachés")
A('')
A('== Par localisation ==')
for r in index['localisations']:
    l = locs[r['id']]
    A(f"{r['ordre']:>2}. {r['id']:<24} {len(l['situations']):>2} situations  {r['nb_schemas']:>2} schémas  mise à jour {r['date_maj']}  ({l['onglet']})")
A('')
A('== Lignes de traitement systémique : rattachement au protocole ==')
A('Aucune ligne ne porte de protocole_id : la bibliothèque Protocoles est dans Firestore (cabinet du Dr Bentahila), pas dans le dépôt.')
A('Le module cherche donc le protocole par le nom exact « protocole », puis ouvre la page Protocoles filtrée sur la localisation (spécification, Fiche d’un schéma, Lien vers Protocoles).')
sans = [(lid, x) for lid, l in locs.items() for x in l['systemique'] if 'protocole' not in x]
avec = [(lid, x) for lid, l in locs.items() for x in l['systemique'] if 'protocole' in x]
A(f'{len(avec)} lignes avec un nom de protocole, {len(sans)} lignes sans nom (onglets du lot pelvis : lien vers la page Protocoles filtrée).')
for lid, x in avec: A(f"  {lid} · {x.get('protocole')}")
A('Sans nom de protocole :')
for lid, x in sans: A(f"  {lid} · {x['traitement'][:110]}")
A('')
ok_cats = {'Renvois au journal des écarts retirés du texte affiché', 'Essais à plusieurs publications', '« Comme … » résolus', 'Objets partagés recopiés', 'OAR fusionnés', 'Schémas sans jeu de contraintes (« Aucun jeu publié pour ce fractionnement »)', 'Schémas sans fiche de centrage'}
bloquants = [c for c in rapport if c not in ok_cats]
A('== Contrôles bloquants ==')
if not bloquants: A('Aucun : identifiants uniques, toutes les références (essais, OAR, jeux, volumes, centrages, situations) trouvées, valeurs dans les listes autorisées.')
for c in bloquants:
    A(f'-- {c} ({len(rapport[c])})')
    for m in rapport[c]: A('  ' + m)
A('')
A('== Informations (non bloquantes) ==')
for c in [c for c in rapport if c in ok_cats]:
    A(f'-- {c} ({len(rapport[c])})')
    for m in rapport[c]: A('  ' + m)
open(os.path.join(OUT, 'rapport-import.txt'), 'w', encoding='utf-8').write('\n'.join(lignes) + '\n')
print('\n'.join(lignes[:30]))
print('bloquants:', {c: len(rapport[c]) for c in bloquants})
