import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# S3 (21/10/2026, audit n° 2 et 10 d. 1, 45) : une seule fenêtre de la fonction rénale (à la saisie de la créatinine, pas répétée à la
# validation pour la même créatinine) ; créatinine aberrante (0,7 mg/L) signalée dès la saisie ; créatinine sous 7 mg/L avant un carboplatine :
# avertissement d'un clic, dose inchangée. Patients fictifs (functions/demo.js).
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
def seed(f):
    X = json.loads(json.dumps(S2)); ls = json.loads(X[E + 'patients/' + pid]['lignesJson']); f(ls[i]); X[E + 'patients/' + pid]['lignesJson'] = json.dumps(ls); return X
def carbo(L):
    L['pr']['dr'] = [d for d in L['pr']['dr'] if 'CARBO' not in d['p'].upper()] + [{'id': 'zcb', 'p': 'CARBOPLATINE', 'd': 5, 'u': 'AUC', 'j': [1]}]; L['crU'] = 'mgL'
async def ouvrir_cure(b, X):
    pg = await ouvrir(b, X); await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
    await pg.evaluate(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1200); return pg
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('1. Créatinine à 70 mg/L avec un carboplatine (DFG très bas)')
        pg = await ouvrir_cure(b, seed(carbo)); ev = pg.evaluate
        await ev(f"chChamp('{pid}', {i}, {k}, 'creat', '70', 1)"); await pg.wait_for_timeout(2000)
        rein = [d for d in pg.dlg if 'carboplatine avec une clairance' in d]
        ok(len(rein) == 1 and 'contre-indiqué' in rein[0], 'à la saisie : une fenêtre « carboplatine … contre-indiqué »', pg.dlg)
        n0 = len(pg.dlg); await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2000)
        ok(not any('carboplatine avec une clairance' in d for d in pg.dlg[n0:]), 'à la validation : pas remontrée (une seule fenêtre en tout)', pg.dlg[n0:])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('2. Créatinine aberrante 0,7 mg/L')
        pg = await ouvrir_cure(b, seed(carbo)); ev = pg.evaluate
        await ev(f"chChamp('{pid}', {i}, {k}, 'creat', '0,7', 1)"); await pg.wait_for_timeout(2000)
        ok(any('créatinine de 0.7 mg/L' in d and 'bonne unité' in d for d in pg.dlg), 'signalée dès la saisie (« bonne unité ? »)', pg.dlg)
        n0 = len(pg.dlg); await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2000)
        ok(not any('bonne unité' in d for d in pg.dlg[n0:]), 'pas répétée à la validation', pg.dlg[n0:])
        await pg.close()
        print('3. Créatinine reprise sans saisie : signalée à la validation (rien n\'a été montré avant)')
        def carbo_bas(L): carbo(L); L['creat'] = '0.7'; [c.pop('creat', None) for c in L['cures']]
        pg = await ouvrir_cure(b, seed(carbo_bas)); ev = pg.evaluate
        await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2000)
        ok(any('bonne unité' in d for d in pg.dlg), 'fenêtre de validation avec la créatinine hors des bornes', pg.dlg)
        await pg.close()
        print('4. Créatinine 4 mg/L avant un carboplatine (sujet âgé, dénutri)')
        pg = await ouvrir_cure(b, seed(carbo)); ev = pg.evaluate
        await ev(f"chChamp('{pid}', {i}, {k}, 'creat', '4', 1)"); await pg.wait_for_timeout(2000)
        ok(any('sous 7 mg/L' in d and 'plancher de 7 mg/L' in d and 'au lieu de' in d for d in pg.dlg), 'avertissement à la saisie, avec la dose qu\'on aurait avec 7 mg/L', pg.dlg)
        c = lignes_de(await ev("window.__fs"))[pid][i]['cures'][k]
        ok(c.get('creat') == '4', 'la créatinine saisie est gardée (rien de bloqué ni changé)', c.get('creat'))
        await pg.close()
        await b.close()
    print(f'\nTest S3 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
