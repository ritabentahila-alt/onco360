import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# S5 (21/10/2026, audit n° 10 d. 47, 48) : interactions ajoutées (vinca + azolés, taxanes / irinotécan + CYP3A4, tamoxifène + CYP2D6,
# pémétrexed + AINS sous 80 ml/min, 5-FU + brivudine) et réglables dans Paramètres › Vigilance des molécules ; topotécan, acide zolédronique et
# trabectédine au rein ; épirubicine à 0,8. Patients fictifs (functions/demo.js).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
S2, PIDS = avec_demo(S, E)
for k0 in [k0 for k0 in S2 if k0.startswith(E + 'patients/') and k0.split('/')[-1] not in PIDS]: del S2[k0]
def lignes_de(seed): return {k0.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k0, v in seed.items() if k0.startswith(E + 'patients/')}
cible = [(p, i, k) for p, ls in lignes_de(S2).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and (k == 0 or L['cures'][k - 1].get('st') == 'recue') and L.get('pr') and not L.get('arret')]
pid, i, k = cible[0]
def seed(f, trait):
    X = json.loads(json.dumps(S2)); d = X[E + 'patients/' + pid]; ls = json.loads(d['lignesJson']); f(ls[i]); d['lignesJson'] = json.dumps(ls)
    d['clinique'] = dict(d.get('clinique') or {}, traitCours=trait); return X
def vinca(L): L['pr']['dr'].append({'id': 'zvc', 'p': 'VINCRISTINE', 'd': 1.4, 'u': 'mg/m²', 'j': [1]})
async def ouvrir_cure(b, X, w=1440):
    pg = await ouvrir(b, X, w=w, h=900 if w > 500 else 844); await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
    await pg.evaluate(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1500); return pg
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('1. Vincristine et NOCAND (fluconazole) dans les traitements en cours')
        pg = await ouvrir_cure(b, seed(vinca, 'NOCAND 50 mg le matin')); ev = pg.evaluate
        t = await ev("(document.querySelector(':is(#panneauCorps,#fenetreCorps):not(:empty)') || document.body).innerText")
        ok('VINCRISTINE et nocand' in t and 'neuropathie' in t, 'encart Vigilance de la séance : interaction vinca + azolé', t[t.find('Interaction'):][:200])
        await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2000)
        ok(any('VINCRISTINE et nocand' in d and 'Valider quand même' in d for d in pg.dlg), 'à la validation : dans la fenêtre « Valider quand même ? » (rien de bloqué)', pg.dlg)
        c = lignes_de(await ev("window.__fs"))[pid][i]['cures'][k]
        ok(c.get('st') == 'recue', 'après « Valider quand même » : cure validée')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('2. Paramètres › Vigilance des molécules › Interactions')
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/vigilances'); await pg.wait_for_timeout(2500)
        t = await ev("(document.getElementById('vgInter') || {}).innerText || ''")
        ok('Interactions' in t and await ev("document.querySelectorAll('#vgInter .cf-auto').length") == 5, 'section « Interactions » avec les 5 interactions de départ', t[:200])
        await ev("viAj()"); await pg.wait_for_timeout(300)
        n = await ev("document.querySelectorAll('#vgInter .cf-auto').length") - 1
        await pg.fill(f'#viA{n}', 'GEMCITABINE'); await pg.dispatch_event(f'#viA{n}', 'change')
        await pg.fill(f'#viB{n}', 'WARFARINE'); await pg.dispatch_event(f'#viB{n}', 'change')
        await pg.fill(f'#viM{n}', 'INR à surveiller (note du cabinet).'); await pg.dispatch_event(f'#viM{n}', 'change')
        await ev("viSup(0)"); await pg.wait_for_timeout(300)
        await ev("viEnregistrer()"); await pg.wait_for_timeout(1500)
        d = (await ev("window.__fs")).get(E + 'parametres/interactions') or {}
        L = json.loads(d.get('data') or '[]')
        ok(any(x['a'] == 'GEMCITABINE' and x['b'] == 'WARFARINE' for x in L) and len(L) == 5 and d.get('retires') == ['i-vinca-azoles'], 'enregistrée (parametres/interactions) ; interaction retirée notée dans « retires »', d)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('3. L\'interaction retirée ne revient pas ; celle du cabinet sert dans la séance')
        X = seed(vinca, 'NOCAND, WARFARINE'); X[E + 'parametres/interactions'] = d
        def gem(L): vinca(L); L['pr']['dr'].append({'id': 'zgm', 'p': 'GEMCITABINE', 'd': 1000, 'u': 'mg/m²', 'j': [1]})
        X2 = json.loads(json.dumps(X)); dd = X2[E + 'patients/' + pid]; ls = json.loads(dd['lignesJson']); ls[i]['pr']['dr'].append({'id': 'zgm', 'p': 'GEMCITABINE', 'd': 1000, 'u': 'mg/m²', 'j': [1]}); dd['lignesJson'] = json.dumps(ls)
        pg = await ouvrir_cure(b, X2); ev = pg.evaluate
        t = await ev("(document.querySelector(':is(#panneauCorps,#fenetreCorps):not(:empty)') || document.body).innerText")
        ok('INR à surveiller (note du cabinet)' in t and 'VINCRISTINE et nocand' not in t, 'interaction du cabinet affichée ; celle retirée non', t[t.find('Interaction'):][:300])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('4. Téléphone (390 px)')
        pg = await ouvrir(b, S2, w=390, h=844); await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/vigilances'); await pg.wait_for_timeout(2500)
        ok(await pg.evaluate("document.documentElement.scrollWidth") <= 390, 'Paramètres › Vigilance : rien ne déborde', await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.close()
        await b.close()
    print(f'\nTest S5 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
