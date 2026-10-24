import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# T2 (24/10/2026, audit n° 11 U8, U10, U13, décision 53) : « Ouvrir » va au jour à faire d'une cure en plusieurs jours ; « Cures à valider » du
# tableau de bord ouvre la cure ; report un samedi / un férié : avertissement d'un clic ; téléphone : barre de validation fixée en bas. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k0 in [k0 for k0 in S2 if k0.startswith(E + 'patients/') and k0.split('/')[-1] not in PIDS]: del S2[k0]
P = PIDS[1]; d = S2[E + 'patients/' + P]
PR = {'id': 'zt2', 'nom': 'PROTOCOLE TEST J1-J8', 'c': 21, 'st': 'ok', 'dr': [{'id': 'g', 'p': 'GEMCITABINE', 'd': 1000, 'u': 'mg/m²', 'j': [1, 8]}]}
d['lignesJson'] = json.dumps([{'id': 'LT2', 'protoId': 'zt2', 'pr': PR, 'j1': '2026-09-29', 'poids': '70', 'creat': '', 'crU': 'mgL', 'cures': [{'st': 'recue', 'reelle': '2026-09-29'}, {}, {}]}])
T = '2026-10-06T10:00:00Z'  # mardi : J8 de la C1 (prévue le 06/10) à faire aujourd'hui
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2, t=T); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3000)
        oc = await ev(f"[...document.querySelectorAll('.af-l')].map(e=>e.getAttribute('onclick')||'').find(o=>o.indexOf('{P}')>=0 && o.indexOf('chOuvrir')>=0)")
        ok(oc and 'chOuvrir' in oc and ',0,0,8)' in oc, '« Cures à valider » : le clic ouvre la cure C1, J8 (et plus seulement le dossier)', oc)
        if oc: await ev(oc); await pg.wait_for_timeout(1800)
        t = await ev("(document.querySelector(':is(#panneauCorps,#fenetreCorps):not(:empty)')||{}).innerText||''")
        ok('J8' in t[:200] and 'Valider' in t, 'la séance J8 s\'ouvre, prête à valider', t[:200])
        await ev("chFermerCure()"); await pg.wait_for_timeout(500)
        await ev(f"chOuvrir('{P}', 0, 0)"); await pg.wait_for_timeout(1500)
        t = await ev("(document.querySelector(':is(#panneauCorps,#fenetreCorps):not(:empty)')||{}).innerText||''")
        ok('J8' in t[:200], '« Ouvrir » de la cure en plusieurs jours : directement le jour à faire (J8)', t[:200])
        await ev("chFermerCure()"); await pg.wait_for_timeout(500)
        print('Report')
        await ev(f"chOuvrir('{P}', 0, 1, 1)"); await pg.wait_for_timeout(1200)
        await ev(f"chReporter('{P}', 0, 1)"); await pg.wait_for_timeout(800)
        await pg.fill('#rD', '2026-10-24'); n0 = len(pg.dlg)
        await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        ok(any('samedi' in m and 'Reporter quand même' in m for m in pg.dlg[n0:]), 'report un samedi : « Reporter quand même ? » (un clic)', pg.dlg[n0:])
        c2 = json.loads((await ev("window.__fs"))[E + 'patients/' + P]['lignesJson'])[0]['cures'][1]
        ok(c2.get('fixe') == '2026-10-24' or c2.get('rep'), 'accepté : la cure est reportée (rien de bloqué)', c2)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Téléphone (390 px)')
        pt = await ouvrir(b, S2, w=390, h=844, t=T); ev = pt.evaluate
        await pt.goto(f'http://localhost:{PORT}/v2.html#dossier/{P}'); await pt.wait_for_timeout(2500)
        await ev(f"chOuvrir('{P}', 0, 0, 8)"); await pt.wait_for_timeout(1500)
        y = await ev("(()=>{const v=document.querySelector('.valj');return v?v.getBoundingClientRect().bottom:9999})()")
        ok(y <= 844, 'barre « Valider » visible en bas de l\'écran sans faire défiler', y)
        ok(await ev("document.documentElement.scrollWidth") <= 390, 'rien ne déborde')
        ok(not pt.errs, 'aucune erreur JavaScript', pt.errs[:2])
        await b.close()
    print(f'\nTest T2 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
