import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Étape 2.2 (12/10/2026) : cure figée à sa validation ; une fois, au démarrage par le titulaire, les cures déjà validées sont figées.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
def lignes_de(seed):
    return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
L0 = lignes_de(S)
avec = [pid for pid, ls in L0.items() if any(c.get('st') == 'recue' for L in ls for c in L.get('cures', []))]
nvalid = sum(1 for ls in L0.values() for L in ls for c in L.get('cures', []) if c.get('st') == 'recue')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print(f'Figeage unique des cures déjà validées ({len(avec)} patients, {nvalid} cures validées dans le jeu de test)')
        pg = await ouvrir(b); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(9000)
        fs = await ev("window.__fs"); L1 = lignes_de(fs)
        figees = [c for ls in L1.values() for L in ls for c in L.get('cures', []) if c.get('st') == 'recue' and c.get('fige')]
        ok(len(figees) == nvalid, f'toutes les cures validées ont leur instantané ({len(figees)}/{nvalid})')
        ok(all(c['fige'].get('retro') and c['fige'].get('doses') is not None and 'taille' in c['fige'] for c in figees), 'instantané « retro » : taille, poids, doses…', figees[0]['fige'] if figees else None)
        mig = fs.get(E + 'parametres/migrations') or {}
        ok(mig.get('curesFigees') and mig.get('curesFigeesNb', 0) >= nvalid, 'figeage noté une fois (parametres/migrations)', mig)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        print("Nouvelle ouverture : rien n'est refait")
        n0 = len([k for k in fs if '/historique/' in k])
        await pg.reload(); await pg.wait_for_timeout(6000)
        fs2 = await ev("window.__fs")
        ok(len([k for k in fs2 if '/historique/' in k]) == n0, 'aucune nouvelle écriture au 2e démarrage')
        print('Validation d\'une cure depuis le dossier')
        cible = [(pid, i, k) for pid, ls in lignes_de(fs2).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and (k == 0 or L['cures'][k - 1].get('st') == 'recue')]
        pid, i, k = cible[0]
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2000)
        c = lignes_de(await ev("window.__fs"))[pid][i]['cures'][k]
        ok(c.get('st') == 'recue' and c.get('fige') and not c['fige'].get('retro') and c['fige'].get('par'), 'cure validée : instantané pris à la validation (auteur, heure)', c.get('fige'))
        ok(any(v.get('dose') is not None for v in (c.get('fige') or {}).get('doses', {}).values()), 'doses présentes dans l\'instantané', (c.get('fige') or {}).get('doses'))
        await ev(f"chRetablir('{pid}', {i}, {k})"); await pg.wait_for_timeout(300)
        await ev("document.querySelector('#fOk') && document.querySelector('#fOk').click()"); await pg.wait_for_timeout(1500)
        c2 = lignes_de(await ev("window.__fs"))[pid][i]['cures'][k]
        ok(c2.get('st', 'prevue') == 'prevue' and not c2.get('fige'), 'validation annulée (cure rétablie) : instantané retiré', c2)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
