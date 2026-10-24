import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# T4 (24/10/2026, audit n° 11 U20, U21, U22) : « Rendez-vous et tâches à venir » = 5 prochains puis « Voir tout » ; élément de chimio :
# « Consultation : venu » et « Séance » (ouvre la cure) ; téléphone : bandeau réduit, barre d'actions sur une ligne qui défile. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k0 in [k0 for k0 in S2 if k0.startswith(E + 'patients/') and k0.split('/')[-1] not in PIDS]: del S2[k0]
P = PIDS[0]; d = S2[E + 'patients/' + P]
d['rdvsJson'] = json.dumps([{'id': 'rv%d' % n, 'type': 'Suivi', 'd': '2026-10-%02d' % (10 + n), 'h': '10:00', 'st': 'prevu'} for n in range(7)])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P}'); await pg.wait_for_timeout(3000)
        n = await ev("document.querySelectorAll('#rdvListe .rdv').length"); bt = await ev("(document.querySelector('#rdvListe .lien')||{}).textContent||''")
        ok(n == 5 and bt.startswith('Voir tout ('), '5 prochains, puis « Voir tout (n) »', (n, bt))
        await ev(f"voirAvTout('{P}')"); await pg.wait_for_timeout(500)
        n2 = await ev("document.querySelectorAll('#rdvListe .rdv').length")
        ok(n2 > 5 and 'Voir les 5 prochains' in await ev("(document.querySelector('#rdvListe .lien')||{}).textContent||''"), '« Voir tout » : toute la liste (rien ne disparaît)', n2)
        t = await ev("[...document.querySelectorAll('#rdvListe .rdv')].map(e=>e.innerText.replace(/\\n/g,' ')).find(t=>/EC \\(/.test(t))||''")
        ok('Consultation : venu' in t and 'Séance' in t, 'élément de chimio : « Consultation : venu » et « Séance »', t)
        oc = await ev("[...document.querySelectorAll('#rdvListe button')].map(b=>b.getAttribute('onclick')||'').find(o=>o.startsWith('chOuvrir'))")
        await ev(oc); await pg.wait_for_timeout(1500)
        ok('C3' in await ev("(document.querySelector(':is(#panneauCorps,#fenetreCorps):not(:empty)')||{}).innerText||''"), '« Séance » ouvre la cure', oc)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Téléphone (390 px)')
        pt = await ouvrir(b, S2, w=390, h=844); ev = pt.evaluate
        await pt.goto(f'http://localhost:{PORT}/v2.html#dossier/{P}'); await pt.wait_for_timeout(3000)
        h = await ev("document.querySelector('[data-zone=bandeau]').getBoundingClientRect().height")
        ok(h < 230 and await ev("getComputedStyle(document.querySelector('.dos-ban .bn2')).display") == 'none', 'bandeau réduit (champs de la ligne 2 dans « Afficher »)', h)
        bar = await ev("(()=>{const r=document.querySelector('.dos-barre').getBoundingClientRect(), g=document.querySelector('.br-g');return [r.height, g.scrollWidth > g.clientWidth, g.getBoundingClientRect().left >= 0, document.querySelector('.br-g .pr').getBoundingClientRect().left >= 0]})()")
        ok(bar[0] <= 70 and bar[1] and bar[3], 'barre d\'une ligne qui défile de côté, le 1er bouton visible', bar)
        await ev("document.querySelector('.br-g .pr .fl').click()"); await pt.wait_for_timeout(600)
        vis = await ev("(()=>{const m=[...document.querySelectorAll('.menu-fl, .fl-menu, .pr-menu, .menu, [role=menu]')].find(e=>e.offsetParent&&e.getBoundingClientRect().height>20);return m?Math.round(m.getBoundingClientRect().height):0})()")
        ok(vis > 20 or await ev("!document.getElementById('fenetre').classList.contains('cache')"), 'le menu ▾ d\'un bouton s\'ouvre en entier (pas coupé par la barre qui défile)', vis)
        ok(await ev("document.documentElement.scrollWidth") <= 390, 'rien ne déborde')
        ok(not pt.errs, 'aucune erreur JavaScript', pt.errs[:2])
        await b.close()
    print(f'\nTest T4 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
