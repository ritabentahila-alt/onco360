import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# Audit n° 10, S2 (21/10/2026) : à l'ouverture par un médecin, une fois par bibliothèque (après l'audit n° 3, P4, P5b) : anticorps prescrit
# deux fois le même jour corrigé, KEYNOTE-A18 phase 2 validé, létrozole et fulvestrant séparés ; ligne en cours sous un protocole corrigé :
# une tâche « à vérifier » pour le médecin, la ligne garde sa copie ; noté au journal ; rien refait à l'ouverture suivante. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
[S2[E + 'parametres/migrations'].pop(k, None) for k in ('audit3a', 'audit3b', 'audit3c', 'audit3d', 'audit3e', 'audit3f', 'audit3g', 'audit10a', 'audit10b')]
bib = lambda fs: {p['id']: p for k in fs if k.startswith(E + 'protocoles/') for p in json.loads(fs[k]['data'] or '[]')}
B0 = bib(S2); FH = B0['colon|FOLFOX herceptine']
# PATIENT TEST 1 : une ligne mFOLFOX6 + Herceptin en cours (C1 reçue, C2 prévue), avec sa copie du protocole d'avant
P1 = PIDS[0]; d1 = S2[E + 'patients/' + P1]
L = [{'id': 'LFH', 'protoId': 'colon|FOLFOX herceptine', 'pr': FH, 'j1': '2026-09-22', 'poids': '70', 'creat': '', 'crU': 'mgL', 'cures': [{'n': 1, 'd': '2026-09-22', 'st': 'recue'}, {'n': 2, 'd': '2026-10-20', 'st': 'prevue'}]}]
d1['lignesJson'] = json.dumps(L)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(6000)
        fs = await ev("window.__fs"); B = bib(fs)
        ok((fs.get(E + 'parametres/migrations') or {}).get('audit10a'), 'fait une fois (parametres/migrations.audit10a)')
        fh = B['colon|FOLFOX herceptine']; tr = [d for d in fh['dr'] if 'HERCEPTIN' in d['p'].upper()]
        ok(len(tr) == 3 and any(d.get('c1s') and d['d'] == 6 and d['j'] == [1] for d in tr) and any(d.get('nc1') and d['d'] == 4 for d in tr) and not any(29 in d['j'] for d in tr), 'mFOLFOX6 + Herceptin : charge C1 J1, 4 mg/kg ensuite, plus de J29', tr)
        ok(fh.get('version', 1) >= 2 and (fh.get('valide') or {}).get('par'), 'version +1, trace habituelle (auteur, date)')
        ok(B['audit3|keynote-a18-phase2'].get('st') == 'ok', 'KEYNOTE-A18 – phase 2 « Validé »')
        ok(B['sein|ibrance zometa']['nom'].startswith('Létrozole') and 'audit10|fulvestrant-palbociclib-zometa' in B, 'létrozole et fulvestrant séparés')
        ok(len(B) == 369, '368 + 1 protocole créé = 369', len(B))
        T = [v for k, v in fs.items() if k.startswith(E + 'taches/')]
        t = [x for x in T if x.get('patientId') == P1]
        ok(len(t) == 1 and 'Vérifier la ligne de chimio' in t[0]['titre'] and 'mFOLFOX6' in t[0]['desc'] and t[0]['pour'] == t[0]['de'], 'tâche « Vérifier la ligne de chimio » pour le médecin, sur PATIENT TEST 1', t)
        autres = [x for x in T if x.get('patientId') != P1 and 'Vérifier la ligne' in x.get('titre', '')]
        ok(all(json.loads(fs[E + 'patients/' + x['patientId']]['lignesJson']) and any(l['protoId'] in ('colon|FOLFOX herceptine', 'todo|folfiri-trastuzumab', 'audit3|n042', 'audit3|n057', 'audit3|n056', 'audit3|n022', 'audit3|n036', 'sein|ibrance zometa') for l in json.loads(fs[E + 'patients/' + x['patientId']]['lignesJson'])) for x in autres), 'autres tâches : seulement des patients sous un protocole corrigé', [(x['patientNom'], x['desc'][:80]) for x in autres])
        pat = json.loads(fs[E + 'patients/' + P1]['lignesJson'])
        ok(any(d.get('u') == 'mg/kg_c1' for d in pat[0]['pr']['dr']), 'la ligne prescrite garde sa copie du protocole (rien changé tout seul)')
        H = [v for k, v in fs.items() if k.startswith(E + 'historique/')]
        ok(any('Audit n° 10' in json.dumps(h, ensure_ascii=False) for h in H), 'noté au journal du cabinet')
        t2 = await ev("(document.getElementById('fenetreCorps')||{}).innerText||''")
        ok('Audit' not in t2, 'aucune fenêtre (décision du 13/10)', t2[:200])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        # ouverture suivante : rien refait
        pg2 = await ouvrir(b, fs); await pg2.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg2.wait_for_timeout(5000)
        fs2 = await pg2.evaluate("window.__fs")
        ok(bib(fs2)['colon|FOLFOX herceptine'].get('version') == fh.get('version') and len([k for k in fs2 if k.startswith(E + 'taches/')]) == len([k for k in fs if k.startswith(E + 'taches/')]), 'ouverture suivante : rien refait, aucune tâche de plus')
        await b.close()
    print(f'\nTest audit n° 10 (S2) : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
