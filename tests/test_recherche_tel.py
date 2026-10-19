import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-B3 (19/10/2026, demande du 17/10) : sur téléphone, loupe ronde juste à gauche de la cloche (zone ≥ 44 px) ; au toucher, la recherche
# s'ouvre sur toute la largeur sous la barre, clavier ouvert, même recherche (nom, n° de dossier, téléphone) ; × ou Échap la ferment ; cachée
# pour le comptable ; ordinateur : la pilule d'aujourd'hui. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
R = lambda sel: f"(() => {{ const e = document.querySelector('{sel}'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), getComputedStyle(e).display]; }})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2, w=390, h=800); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3500)
        lo, cl, pil = await ev(R('#trLoupe')), await ev(R('#cloche')), await ev(R('#trPil'))
        ok(lo and lo[4] != 'none' and lo[2] >= 44 and lo[3] >= 44, 'téléphone : loupe ronde visible, 44 px', lo)
        ok(lo and cl and lo[0] + lo[2] <= cl[0] and cl[0] - (lo[0] + lo[2]) <= 16 and abs(lo[1] - cl[1]) <= 2 and lo[2] == cl[2], 'loupe juste à gauche de la cloche, même taille', (lo, cl))
        ok(pil[4] == 'none', 'la pilule de l\'ordinateur reste cachée', pil)
        await pg.tap('#trLoupe') if False else await pg.click('#trLoupe'); await pg.wait_for_timeout(300)
        pil = await ev(R('#trPil'))
        ok(pil[4] == 'flex' and pil[0] >= 8 and pil[0] + pil[2] <= 382 and pil[2] >= 340, 'au toucher : recherche ouverte sur toute la largeur, sous la barre', pil)
        ok(await ev("document.activeElement.id") == 'trQ' and await ev("document.getElementById('trLoupe').getAttribute('aria-expanded')") == 'true', 'champ actif (clavier ouvert)')
        await pg.type('#trQ', 'patient test 3'); await pg.wait_for_timeout(400)
        res = await ev("[...document.querySelectorAll('#trRes [data-id]')].map(b => b.innerText.split('\\n')[0])")
        ok(res == ['PATIENT TEST 3'], 'même recherche : « patient test 3 » → PATIENT TEST 3', res)
        dessus = await ev("(() => { const b = document.querySelector('#trRes [data-id]').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!e.closest('#trRes'); })()")
        ok(dessus, 'résultats au-dessus du contenu de la page')
        ok(await ev("document.documentElement.scrollWidth <= 392"), '390 px : aucun débordement (recherche ouverte)')
        await ev("document.querySelector('#trRes [data-id]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))"); await pg.wait_for_timeout(1200)
        ok((await ev("location.hash")).startswith('#dossier/') and not await ev("document.getElementById('tete').classList.contains('rech-ouv')"), 'résultat touché : dossier ouvert, recherche refermée')
        # N° de dossier et téléphone
        await pg.click('#trLoupe'); await pg.wait_for_timeout(200); await pg.type('#trQ', '0600000005'); await pg.wait_for_timeout(300)
        ok(await ev("[...document.querySelectorAll('#trRes [data-id]')].map(b => b.innerText.split('\\n')[0])") == ['PATIENT TEST 5'], 'recherche par téléphone (0600000005)')
        await pg.click('#trX'); await pg.wait_for_timeout(200)
        ok(not await ev("document.getElementById('tete').classList.contains('rech-ouv')") and await ev("document.getElementById('trQ').value") == '' and (await ev(R('#trPil')))[4] == 'none', '× : recherche fermée et vidée')
        await pg.click('#trLoupe'); await pg.wait_for_timeout(200); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        ok(not await ev("document.getElementById('tete').classList.contains('rech-ouv')"), 'Échap : recherche fermée')
        ok(not pg.errs, 'aucune erreur JavaScript (téléphone)', pg.errs[:2]); await pg.close()
        # Ordinateur : la pilule, pas de loupe
        pg = await ouvrir(b, S2, w=1440, h=900); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3000)
        ok((await ev(R('#trLoupe')))[4] == 'none' and (await ev(R('#trPil')))[4] == 'flex' and (await ev(R('#trX')))[4] == 'none', 'ordinateur : pilule de recherche, ni loupe ni ×')
        await pg.close()
        # Comptable : ni pilule ni loupe
        S3 = json.loads(json.dumps(S2)); S3[E + 'membres/CPT'] = {'role': 'comptable', 'nom': 'CPT', 'actif': True, 'tousEtablissements': True, 'etablissements': [], 'droits': {}}; S3['utilisateurs/CPT'] = {'nom': 'CPT'}
        pg = await ouvrir(b, S3, w=390, h=800); ev = pg.evaluate; await pg.add_init_script("window.__uid='CPT'")
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(3000)
        ok((await ev(R('#trLoupe')))[4] == 'none', 'comptable : pas de loupe', await ev(R('#trLoupe')))
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
