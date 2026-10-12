import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 4.3 (12/10/2026) : recherche de patient en pilule dans la barre du haut (nom, n° de dossier, téléphone ; ↑ ↓ Entrée ; clic).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
I = S[E + 'patients/' + pid]['identite']; mot = (I.get('nomF') or I.get('nom') or '').split()[0][:4].lower()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S, w=1300); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(2500)
        ok(await pg.is_visible('#trQ'), 'pilule de recherche visible sur ordinateur')
        await pg.fill('#trQ', mot); await pg.wait_for_timeout(200)
        n = await ev("document.querySelectorAll('#trRes [data-id]').length")
        ok(n >= 1 and await ev(f"[...document.querySelectorAll('#trRes [data-id]')].some(b=>b.dataset.id==='{pid}')"), 'résultats : le patient cherché', n)
        await ev(f"(()=>{{const b=[...document.querySelectorAll('#trRes [data-id]')].find(b=>b.dataset.id==='{pid}');b.dispatchEvent(new MouseEvent('mousedown',{{bubbles:true}}))}})()"); await pg.wait_for_timeout(800)
        ok((await ev("location.hash")).endswith(pid) and await ev("document.getElementById('trQ').value") == '', 'clic : dossier ouvert, recherche vidée')
        await pg.fill('#trQ', 'zzzzqq'); await pg.wait_for_timeout(200)
        ok('Aucun patient' in await pg.inner_text('#trRes'), 'aucun résultat : « Aucun patient »')
        await pg.press('#trQ', 'Escape'); ok(await ev("document.getElementById('trRes').classList.contains('cache')"), 'Échap : liste fermée')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        pg = await ouvrir(b, S, w=390)
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(2000)
        ok(not await pg.is_visible('#trQ') and await pg.evaluate("document.documentElement.scrollWidth") <= 390, 'téléphone : pilule cachée (page Patients), rien ne déborde')
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
