import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# T1 (24/10/2026, audit n° 11 U2, U4) : recherche des protocoles triée (le nom qui commence par le mot cherché d'abord), nombre de cures propre au
# protocole (« × 4 » du nom, ou réglé dans l'éditeur). Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k0 in [k0 for k0 in S2 if k0.startswith(E + 'patients/') and k0.split('/')[-1] not in PIDS]: del S2[k0]
P = PIDS[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (1440, 390):
            print(f'{w} px')
            pg = await ouvrir(b, S2, w=w, h=900 if w > 500 else 844); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P}'); await pg.wait_for_timeout(2500)
            await ev(f"chNouvelleLigne('{P}')"); await pg.wait_for_timeout(600)
            await pg.fill('#nlQ', 'EC'); await pg.wait_for_timeout(400)
            noms = await ev("[...document.querySelectorAll('#nlL .proto b')].map(b=>b.textContent)")
            ok(noms and noms[0].upper().startswith('EC') and all(n.upper().startswith('EC') for n in noms[:3]), 'Nouvelle ligne, « EC » : les EC d\'abord', noms[:5])
            await ev("nlProto('todo|ec-pembrolizumab-keynote-522-')"); await pg.wait_for_timeout(500)
            nb = await ev("[...document.querySelectorAll(':is(#panneauCorps,#fenetreCorps) .grille-nl > div')].filter(d=>/Nombre de cures/.test(d.textContent)).map(d=>d.querySelector('input').value)[0]")
            ok(nb == '4', '« … / 21 j × 4 (KEYNOTE-522) » : 4 cures proposées (avant : 6)', nb)
            ok(await ev("document.querySelectorAll('.nl-int .puce').length") == 4, 'intention dans le même écran (4 choix)')
            ok(await ev("document.documentElement.scrollWidth") <= w, 'rien ne déborde', await ev("document.documentElement.scrollWidth"))
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Page Protocoles')
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(2500)
        sel = '#prQ'
        await pg.fill(sel, 'EC'); await pg.dispatch_event(sel, 'input'); await pg.wait_for_timeout(500)
        noms = await ev("[...document.querySelectorAll('#prL .pcarte b')].map(b=>b.textContent)")
        ok(noms and noms[0].upper().startswith('EC'), 'page Protocoles, « EC » : les EC d\'abord', noms[:4])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\nTest T1 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
