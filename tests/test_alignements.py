import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 26/10/2026 (demandes de Dr Bentahila) : boutons principaux à la même hauteur sur le tableau de bord, l'Agenda, les Tâches, les Protocoles et la
# Radiothérapie ; Protocoles : Réinitialiser, Excel, Livret PDF sous « ⋯ » centré sur la ligne ; Bilan : Actualiser et « ⋯ » (Excel, PDF) sur la
# ligne des filtres ; dossier : « ⋯ » de la radiothérapie centré sur Modifier / Terminé. Cabinet fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
CENTRE = "(s) => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; const r = e.getBoundingClientRect(); return r.top + r.height / 2; }"
rt = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3 and '"id"' in (v.get('rtsJson') or '')][0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b); ev = pg.evaluate
        c = {}
        for pa, s in [('', '.accueil .actions > *'), ('agenda', '#page button[onclick*="ouvrirRdv"], #page button[onclick*="nouveauRdv"], #page .bp-act > button:last-child'), ('taches', '.barre-page .bp-act .b1, .barre-page .bp-act .bt.plein'), ('protocoles', '.pr-act .b1'), ('radiotherapie', '#page .b1')]:
            await pg.goto(f'http://localhost:{PORT}/v2.html#{pa}'); await pg.wait_for_timeout(1800)
            c[pa or 'accueil'] = await ev(CENTRE, s)
        v = [x for x in c.values() if x]
        ok(len(v) == 5 and max(v) - min(v) <= 2, 'bouton principal à la même hauteur sur les cinq pages', c)
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(1800)
        ok(await ev("[...document.querySelectorAll('.pr-act .mpts .cache button')].map(b => b.textContent).join('|')") == 'Réinitialiser|Excel|Livret PDF', 'Protocoles : Réinitialiser, Excel, Livret PDF sous « ⋯ »')
        ok(abs((await ev(CENTRE, '.pr-act .mpts > button')) - (await ev(CENTRE, '.pr-act .b1'))) <= 1, 'Protocoles : « ⋯ » centré sur la ligne')
        await pg.goto(f'http://localhost:{PORT}/v2.html#bilan'); await pg.wait_for_timeout(2500)
        ok(await ev("[...document.querySelectorAll('.bi-act .mpts .cache button')].map(b => b.textContent).join('|')") == 'Excel|PDF' and not await ev("!!document.querySelector('#page > .barre-page')"), 'Bilan : Excel et PDF sous « ⋯ », plus de ligne au-dessus des filtres')
        a, s1, m3 = await ev(CENTRE, '.bi-act .bt'), await ev(CENTRE, '#biCor'), await ev(CENTRE, '.bi-act .mpts > button')
        ok(abs(a - s1) <= 2 and abs(m3 - s1) <= 2, 'Bilan : Actualiser et « ⋯ » sur la ligne des filtres', (a, s1, m3))
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{rt}'); await pg.wait_for_timeout(2500); await ev(f"ongletDossier('{rt}','rt')"); await pg.wait_for_timeout(800)
        r = await ev("(() => { const a = [...document.querySelectorAll('.actr')].find(e => e.querySelector('.mpts') && /Modifier/.test(e.textContent)); if (!a) return null; const m = a.querySelector(':scope > button').getBoundingClientRect(), p = a.querySelector('.mpts > button').getBoundingClientRect(); return [m.top + m.height / 2, p.top + p.height / 2]; })()")
        ok(r and abs(r[0] - r[1]) <= 1, 'radiothérapie du dossier : « ⋯ » centré sur Modifier', r)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Téléphone (390 px)')
        pg = await ouvrir(b, w=390, h=844); ev = pg.evaluate
        for pa in ['', 'protocoles', 'bilan']:
            await pg.goto(f'http://localhost:{PORT}/v2.html#{pa}'); await pg.wait_for_timeout(1800)
            ok(await ev("document.documentElement.scrollWidth") <= 390, (pa or 'tableau de bord') + ' : rien ne déborde')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
