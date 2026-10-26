import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 26/10/2026 (demandes de Dr Bentahila) : un champ relié à une liste prédéfinie (mutuelle, correspondant…) propose la liste dès 2 lettres (rien
# au clic sur un champ vide), filtrée à chaque lettre, flèches et Entrée, saisie libre gardée. NAVIGATEUR=webkit pour Safari. Cabinet fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
import unicodedata
NAV = os.environ.get('NAVIGATEUR', 'chromium')
SUG = "[...document.querySelectorAll('.lst-sug button')].map(b => b.textContent)"
async def main():
    async with async_playwright() as p:
        b = await getattr(p, NAV).launch()
        for w in (1440, 390):
            print('Largeur', w)
            pg = await ouvrir(b, w=w, h=900); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
            await ev(f"modifierIdentite('{pid}', 'id')"); await pg.wait_for_timeout(800)
            sel = "#fenetre input[list=lMut], #fenetre input[data-liste=lMut], :is(#panneauCorps,#page) input[list=lMut]"
            n = await ev(f"document.querySelectorAll('{sel}').length")
            ok(n >= 1, 'formulaire : champ Mutuelle relié à la liste', n)
            if not n: await pg.close(); continue
            loc = pg.locator(sel).first
            await loc.fill(''); await pg.keyboard.press('Escape'); await ev("document.activeElement && document.activeElement.blur()"); await pg.wait_for_timeout(300)
            await loc.click(); await pg.wait_for_timeout(400)
            ok(await ev(SUG) == [], 'clic sur le champ vide : rien ne s\'ouvre')
            L = await ev("[...document.getElementById('lMut').options].map(o => o.value)")
            mot = L[1][:3]
            await pg.keyboard.type(mot[0]); await pg.wait_for_timeout(300)
            ok(await ev(SUG) == [], 'une lettre : rien')
            await pg.keyboard.type(mot[1:]); await pg.wait_for_timeout(300)
            ok(await ev("(() => { const s = document.querySelector('.lst-sug').getBoundingClientRect(); return s.left >= 0 && s.right <= innerWidth + 1; })()"), 'dès 2 lettres : la liste s\'ouvre, dans l\'écran')
            L2 = await ev(SUG)
            sa = lambda t: unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().lower()
            ok(L2 and all(sa(mot) in sa(t) for t in L2) and len(L2) <= len(L), 'frappe : liste filtrée', (mot, L2[:5]))
            await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
            v = await loc.input_value()
            ok(v in L2 and not await ev("!!document.querySelector('.lst-sug')"), 'flèche + Entrée : valeur choisie, liste fermée', v)
            await loc.fill('Mutuelle libre XYZ'); await pg.wait_for_timeout(200)
            ok(await loc.input_value() == 'Mutuelle libre XYZ' and not await ev("!!document.querySelector('.lst-sug')"), 'saisie libre gardée (aucune proposition)')
            await loc.fill(''); await loc.click(); await pg.keyboard.type(mot[:2]); await pg.wait_for_timeout(300)
            await ev("document.querySelector('.lst-sug button') && document.querySelector('.lst-sug button').click()"); await pg.wait_for_timeout(300)
            ok(await loc.input_value() != '', 'clic sur une proposition : valeur choisie')
            ok(await ev("document.documentElement.scrollWidth") <= w, 'rien ne déborde')
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
