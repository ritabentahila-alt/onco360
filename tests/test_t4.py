import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# T4 (24/10/2026, audit n° 11 U20, U21, U22), revu par le lot A (25/10/2026, demande de Dr Bentahila) : « Rendez-vous et tâches à venir » =
# 3 cartes puis « Voir plus » ; élément de chimio : « Consultation : venu » et « Séance » (ouvre la cure) sous « ⋯ » ; téléphone : bloc patient
# en haut, barre d'actions derrière « + Prescrire ». Patients fictifs.
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
        n = await ev("document.querySelectorAll('#rdvListe .rc').length"); bt = await ev("(document.querySelector('#rdvListe .rc-plus')||{}).textContent||''")
        ok(n == 3 and bt.startswith('Voir plus ('), '3 cartes, puis « Voir plus (n) » (lot A, avant : 5)', (n, bt))
        await ev(f"voirAvTout('{P}')"); await pg.wait_for_timeout(500)
        n2 = await ev("document.querySelectorAll('#rdvListe .rc').length")
        ok(n2 > 5 and 'Voir moins' in await ev("(document.querySelector('#rdvListe .rc-plus')||{}).textContent||''"), '« Voir plus » : toute la liste (rien ne disparaît)', n2)
        t = await ev("(()=>{const c=[...document.querySelectorAll('#rdvListe .rc')].find(e=>/EC \\(/.test(e.innerText)||/EC/.test(e.querySelector('.rc-2')?.textContent||''));return c?[...c.querySelectorAll('.mpts .cache button')].map(b=>b.textContent).join('|'):''})()")
        ok('Consultation : venu' in t and 'Séance' in t, 'élément de chimio : « Consultation : venu » et « Séance » sous « ⋯ »', t)
        oc = await ev("[...document.querySelectorAll('#rdvListe button')].map(b=>b.getAttribute('onclick')||'').find(o=>o.startsWith('chOuvrir'))")
        await ev(oc); await pg.wait_for_timeout(1500)
        ok('C3' in await ev("(document.querySelector(':is(#panneauCorps,#fenetreCorps):not(:empty)')||{}).innerText||''"), '« Séance » ouvre la cure', oc)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Téléphone (390 px)')
        pt = await ouvrir(b, S2, w=390, h=844); ev = pt.evaluate
        await pt.goto(f'http://localhost:{PORT}/v2.html#dossier/{P}'); await pt.wait_for_timeout(3000)
        h = await ev("document.querySelector('[data-zone=bandeau]').getBoundingClientRect().height")
        ok(h < 230 and not await ev("!!document.querySelector('.dos-ban .bn2')"), 'bloc patient compact en haut (lot A)', h)
        ok(await ev("getComputedStyle(document.querySelector('.br-g')).display") == 'none' and await ev("!!document.querySelector('.dos-fab').getClientRects().length"), 'barre d\'actions derrière « + Prescrire » (lot A §11)')
        await ev("dosPrescrire()"); await pt.wait_for_timeout(200)
        await ev("document.querySelector('.br-g .pr .fl').click()"); await pt.wait_for_timeout(600)
        vis = await ev("(()=>{const m=[...document.querySelectorAll('.menu-fl, .fl-menu, .pr-menu, .menu, [role=menu]')].find(e=>e.offsetParent&&e.getBoundingClientRect().height>20);return m?Math.round(m.getBoundingClientRect().height):0})()")
        ok(vis > 20 or await ev("!document.getElementById('fenetre').classList.contains('cache')"), 'le menu ▾ d\'un bouton s\'ouvre en entier (pas coupé par la barre qui défile)', vis)
        ok(await ev("document.documentElement.scrollWidth") <= 390, 'rien ne déborde')
        ok(not pt.errs, 'aucune erreur JavaScript', pt.errs[:2])
        await b.close()
    print(f'\nTest T4 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
