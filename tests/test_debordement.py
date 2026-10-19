import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Q8 (12/10/2026) : aucune page ne dépasse de l'écran (défilement horizontal), sur 5 largeurs (téléphone 390 px → grand écran 1440 px).
# Le débordement de Paramètres › Types de consultation (3.13) n'avait été vu qu'après coup : ce test le voit tout de suite.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3 and json.loads(v.get('lignesJson') or '[]')][0]
PAGES = ['accueil', 'agenda', 'salle', 'patients', 'dossier/' + pid, 'taches', 'rcp', 'protocoles', 'bilan', 'profil'] + ['parametres/' + r for r in
  ['lieux', 'accueil', 'rcp', 'impression', 'fiche', 'consultation', 'types', 'listes', 'horaires', 'fermetures', 'couleurs', 'whatsapp', 'alertes', 'bibliotheques', 'vigilances', 'documents', 'taches', 'activites']]
QUI = "(()=>{const W=document.documentElement.clientWidth;const clip=(e)=>{for(let p=e.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll'||o==='hidden')return true}return false};return [...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>W+1&&!clip(e)).slice(0,2).map(e=>e.tagName+'.'+e.className)})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (390, 768, 1024, 1300, 1440):
            pg = await ouvrir(b, S, w=w); mauvais = []
            for h in PAGES:
                await pg.goto(f'http://localhost:{PORT}/v2.html#' + h); await pg.wait_for_timeout(1200)
                if await pg.evaluate("document.documentElement.scrollWidth") > w: mauvais.append((h, await pg.evaluate(QUI)))
            ok(not mauvais, f'{w} px : aucune des {len(PAGES)} pages ne dépasse', mauvais)
            ok(not pg.errs, f'{w} px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
