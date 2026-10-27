import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 27/10/2026 : habillage de Dr Bentahila : polices, menu et barre blancs, fond et couleur d'action gardés, contraste ≥ 4,5, aucun débordement
# à 390, 900, 1 280 et 1 600 px sur les pages principales. Cabinet fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
CONTRASTE = """(() => { const rgb = (c) => (c.match(/[\\d.]+/g) || []).map(Number); const lum = (c) => { const [r, g, b] = rgb(c).slice(0, 3).map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const fond = (e) => { for (let p = e; p; p = p.parentElement) { const c = getComputedStyle(p).backgroundColor, a = rgb(c); if (a.length && (a.length < 4 || a[3] > .9)) return c; if (getComputedStyle(p).backgroundImage !== 'none') return null; } return 'rgb(255,255,255)'; };
  const r = []; document.querySelectorAll('body *').forEach((e) => { if (!e.offsetParent || !e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return; if (e.closest('svg,.cache,[disabled],option,.hors')) return;
    const st = getComputedStyle(e); if (st.visibility === 'hidden' || +st.opacity < 1) return; const f = fond(e); if (!f) return; const a = lum(st.color), b = lum(f), k = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    if (k < 4.5) r.push(e.tagName + '.' + e.className + ' ' + k.toFixed(2) + ' « ' + e.textContent.trim().slice(0, 25) + ' »'); }); return [...new Set(r)].slice(0, 8); })()"""
DEBORDE = "(()=>{const W=document.documentElement.clientWidth;const clip=(e)=>{for(let p=e.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll'||o==='hidden')return true}return false};return [...document.querySelectorAll('#page *')].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>W+1&&!clip(e)).length})()"
PAGES = ['', 'agenda', 'salle', 'patients', 'taches', 'rcp', 'protocoles', 'radiotherapie', 'radiotherapie/oar', 'bilan', 'parametres/horaires']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(3000)
        r = await ev("[getComputedStyle(document.body).fontFamily, getComputedStyle(document.body).backgroundColor, getComputedStyle(document.getElementById('menu')).backgroundColor, getComputedStyle(document.getElementById('tete')).backgroundColor, getComputedStyle(document.querySelector('.b1')).backgroundColor, document.fonts.check('700 16px Montserrat'), document.fonts.check('16px Roboto')]")
        ok(r[0].startswith('Roboto') and r[1] == 'rgb(241, 245, 251)' and r[2] == r[3] == 'rgb(255, 255, 255)' and r[4] == 'rgb(53, 99, 176)', 'Roboto, fond #F1F5FB, menu et barre blancs, action #3563B0', r)
        await pg.close()
        for w in (390, 900, 1280, 1600):
            pg = await ouvrir(b, w=w, h=900); ev = pg.evaluate; mauvais, deb = {}, []
            for pa in PAGES:
                await pg.goto(f'http://localhost:{PORT}/v2.html#{pa}'); await pg.wait_for_timeout(2200)
                c = await ev(CONTRASTE)
                if c: mauvais[pa or 'accueil'] = c
                if await ev(DEBORDE): deb.append(pa or 'accueil')
            ok(not deb, f'{w} px : aucun débordement', deb)
            ok(not mauvais, f'{w} px : contraste d\'au moins 4,5 pour 1', mauvais)
            ok(not pg.errs, f'{w} px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
