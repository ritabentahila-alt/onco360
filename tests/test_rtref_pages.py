import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, RT6 (25/10/2026) : sous-pages du référentiel de radiothérapie (radiotherapie.js) : onglets Référentiel · Organes à risque · Contraintes ·
# Essais · Calcul BED / EQD2 ; OAR (recherche, région, « Utilisé dans n schémas ») ; Contraintes (choix du jeu, même tableau que la fiche, Copier) ;
# Essais (tri, recherche, « Cité par n schémas ») ; calcul BED / EQD2 : cas de contrôle de la spécification (1,8 Gy × 25 puis 9 Gy × 2) retrouvé à
# l'écran, α/β, EQDx et N modifiables, saisie invalide, « Tout effacer », Entrée ; lien « EQD2 » d'une ligne de prescription ; 1 440 et 390 px.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
DEBORDE = "document.documentElement.scrollWidth > window.innerWidth + 1"
RES = "[...document.querySelectorAll('.rtr-cres tbody td:not(:last-child)')].map(t => t.textContent)"
async def aller(pg, h, t=2200):
    await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(t)
async def controle(pg, w):
    ev = pg.evaluate
    await aller(pg, 'radiotherapie/calcul')
    await pg.fill('.rtr-calc [data-c="d"]', '1,8'); await pg.fill('.rtr-calc [data-c="n"]', '25'); await pg.wait_for_timeout(100)
    await pg.click('.rtr-calc .rtr-aj'); await pg.wait_for_timeout(200)
    await pg.locator('.rtr-calc [data-c="d"]').nth(1).fill('9,0'); await pg.locator('.rtr-calc [data-c="n"]').nth(1).fill('2'); await pg.wait_for_timeout(150)
    r = await ev(RES)
    ok(r == ['96,4', '86,4', '72,7', '225,0', '144,0', '87,3', '3,00', '2,92', '2,74'], f'{w} px : cas de contrôle à l\'écran (EQD2 96,4 · 86,4 · 72,7 ; BED 225,0 · 144,0 · 87,3 ; 3,00 · 2,92 · 2,74)', r)
    ok((await ev("document.getElementById('rtrCtot').textContent")).replace('\xa0', ' ') == 'Total : 27 fractions · 63,0 Gy', f'{w} px : « Total : 27 fractions · 63,0 Gy »')
    ok(not await ev(DEBORDE), f'{w} px : calcul sans débordement')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.add_init_script("window.__copie=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:(t)=>{window.__copie.push(t);return Promise.resolve();}}});")
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(3000)
        ong = await ev("[...document.querySelectorAll('.rtr-sous button')].map(b => b.textContent)")
        ok(ong == ['Référentiel', 'Organes à risque', 'Contraintes', 'Essais', 'Calcul BED / EQD2'], 'onglets en haut de la page Radiothérapie', ong)
        # Organes à risque
        await pg.click('.rtr-sous button:has-text("Organes à risque")'); await pg.wait_for_timeout(2000)
        ok(await ev("location.hash") == '#radiotherapie/oar' and await ev("document.querySelectorAll('.rtr-ot tbody tr').length") == 117 and await ev("[...document.querySelectorAll('.rtr-ot th')].map(t => t.textContent)") == ['Nom', 'TG-263', 'Définition'], 'Organes à risque : #radiotherapie/oar, 117 organes, colonnes Nom, TG-263, Définition (plus de Source)')
        ok(await ev("getComputedStyle(document.querySelector('.rtr-def2')).webkitLineClamp") == '3', 'carte : définition sur trois lignes (26/10/2026)')
        await pg.fill('#rtrOq', 'rectum'); await pg.wait_for_timeout(200)
        n1 = await ev("document.querySelectorAll('.rtr-ot tbody tr').length")
        await pg.fill('#rtrOq', ''); await pg.select_option('#rtrOr', 'pelvis'); await pg.wait_for_timeout(200)
        n2 = await ev("document.querySelectorAll('.rtr-ot tbody tr').length")
        ok(1 <= n1 <= 5 and 10 < n2 < 117, 'recherche (« rectum ») et menu Région (pelvis)', [n1, n2])
        await pg.click('.rtr-ot tbody tr:has-text("Rectum") >> nth=0'); await pg.wait_for_timeout(3000)
        t = await ev("document.querySelector('.rtr-det').innerText")
        ok('Utilisé dans' in t and int(t.split('Utilisé dans ')[1].split(' ')[0]) > 10 and await ev("document.querySelector('.rtr-ot tr.ouv .rtr-def2') && getComputedStyle(document.querySelector('.rtr-ot tr.ouv .rtr-def2')).webkitLineClamp") in ('none', 'unset'), 'un clic déplie la définition et « Utilisé dans n schémas » (tous les schémas)', t[:160])
        # Contraintes
        await pg.click('.rtr-sous button:has-text("Contraintes")'); await pg.wait_for_timeout(2500)
        th = await ev("[...document.querySelectorAll('.rtr-ctr thead th')].map(t => t.textContent)")
        ok(th == ['Organe', 'Normofractionné', 'Hypofractionné', 'Stéréotaxie'] and await ev("document.querySelectorAll('.rtr-ctr > tbody > tr').length") > 80 and not await ev("!!document.getElementById('rtrJs')"), 'Contraintes : tous les organes, une ligne chacun, colonnes Normofractionné, Hypofractionné, Stéréotaxie (plus de jeux)', th)
        t = await ev("document.querySelector('.rtr-ctr tbody tr:has(b)').innerText")
        await pg.fill('#rtrJq', 'moelle épinière'); await pg.wait_for_timeout(400)
        t = await ev("document.querySelector('.rtr-ctr tbody tr').innerText")
        ok('Moelle épinière' in t and '1 séance' in t and '5 séances' in t, 'recherche (« moelle épinière ») : contraintes par nombre de séances en stéréotaxie', t[:200])
        await pg.click('.rtr-ctr tbody tr >> nth=0'); await pg.wait_for_timeout(300)
        ok(await ev("document.querySelectorAll('.rtr-ctr .rtr-det input[data-ctf=indicateur]').length") > 3, 'un clic ouvre la liste complète, modifiable pour le cabinet')
        await pg.fill('.rtr-ctr .rtr-det input[data-ctf=limitant] >> nth=0', '≤ 44 Gy (cabinet)'); await pg.click('.rtr-ctr .rtr-det .bt.plein'); await pg.wait_for_timeout(1200)
        d = await ev("window.__fs['espaces/cabinet-bentahila/referentielRT/_contraintes'] || null")
        ok(d and d['majPar'] == 'UIDRITA' and any(l['limitant'] == '≤ 44 Gy (cabinet)' for l in d['lignes']) and '≤ 44 Gy (cabinet)' in await ev("document.querySelector('.rtr-ctr').innerText"), 'enregistré pour le cabinet (referentielRT/_contraintes) et affiché', d and len(d['lignes']))
        ok(await ev("document.querySelectorAll('.rtr-ctr ~ details.rtr-e, details.rtr-e').length") >= 10, 'en bas : contraintes propres aux essais et à la curiethérapie')
        # Essais
        await pg.click('.rtr-sous button:has-text("Essais")'); await pg.wait_for_timeout(2000)
        ok(await ev("document.querySelectorAll('.rtr-et2 tbody tr').length") == 300 and '452 essais' in await ev("document.querySelector('#rtrEl .rtr-nb').textContent"), 'Essais : 452 références (300 affichées, la suite en affinant)')
        await pg.click('.rtr-tri:has-text("Année")'); await pg.wait_for_timeout(300)
        an = await ev("[...document.querySelectorAll('.rtr-et2 tbody td[data-l=\"Année\"]')].slice(0, 5).map(t => Number(t.textContent))")
        ok(an == sorted(an, reverse=True) and an[0] >= 2025, 'tri par année (les plus récents d\'abord)', an)
        await pg.fill('#rtrEq', 'chhip'); await pg.wait_for_timeout(300)
        await pg.click('.rtr-et2 tbody tr >> nth=0'); await pg.wait_for_timeout(300)
        t = await ev("document.querySelector('.rtr-det').innerText")
        ok('Cité par' in t and '60 Gy / 20 fx' in t and 'PubMed 27339115' in t, 'recherche « chhip », détail : résultat, PubMed, « Cité par n schémas »', t[:200])
        # Calcul BED / EQD2
        await controle(pg, 1440)
        await pg.fill('.rtr-calc [data-c="x"]', '3'); await pg.wait_for_timeout(100)
        ok((await ev(RES))[1] == '72,0', 'EQD en 3 Gy/fx (α/β 3) : 72,0', await ev(RES))
        await pg.fill('.rtr-calc [data-c="ab"] >> nth=1', '2'); await pg.wait_for_timeout(100)
        ok((await ev(RES))[4] == '184,5', 'en-tête α/β modifiable (2 Gy : BED 85,5 + 99,0 = 184,5)', await ev(RES))
        await ev("document.querySelector('.rtr-cdet').open = true"); await pg.wait_for_timeout(100)
        ok(await ev("document.getElementById('rtrDd0_0').textContent") == '99,0' and await ev("document.getElementById('rtrDd1_0').textContent") == '126,0', 'détail par traitement : 99,0 et 126,0 (α/β 1,5)')
        await pg.locator('.rtr-calc [data-c="d"]').nth(1).fill('abc'); await pg.wait_for_timeout(100)
        ok(await ev("document.querySelectorAll('.rtr-calc [data-c=\"d\"]')[1].classList.contains('err')") and (await ev(RES))[3] == '99,0', 'valeur non numérique : champ en erreur, sa ligne ne compte pas', await ev(RES))
        await pg.select_option('.rtr-calc select[data-c=org]', 'Moelle épinière'); await pg.wait_for_timeout(200)
        ok(await ev("document.querySelector('[data-c=ab][data-i=\"3\"]').value") == '2' and await ev("document.querySelector('.rtr-cres tbody td:last-child').textContent") != '—', 'colonne organe : moelle épinière → α/β 2, calculé (26/10/2026)')
        await pg.click('.rtr-calc a:has-text("Tout effacer")'); await pg.wait_for_timeout(200)
        ok(await ev(RES) == ['—'] * 9 and await ev("document.querySelectorAll('.rtr-calc [data-c=\"d\"]').length") == 1 and await ev("document.querySelector('[data-c=\"x\"]').value") == '2,0', '« Tout effacer » : une ligne vide, valeurs par défaut, « — » partout')
        await pg.click('.rtr-calc [data-c="d"]'); await pg.keyboard.type('2'); await pg.keyboard.press('Enter')
        ok(await ev("document.activeElement.dataset.c") == 'n', 'Entrée passe au champ suivant')
        # Lien « EQD2 » d'une ligne de prescription
        await aller(pg, 'radiotherapie/s/pro-fav-60-20/prescription')
        await pg.click('.rtr-oc a.rtr-eqd'); await pg.wait_for_timeout(2000)
        ok(await ev("location.hash") == '#radiotherapie/calcul/3/20' and await ev("[document.querySelector('[data-c=\"d\"]').value, document.querySelector('[data-c=\"n\"]').value]") == ['3', '20'] and (await ev(RES))[:3] == ['77,1', '72,0', '65,0'], '« EQD2 » d\'une ligne : calcul prérempli (3 Gy × 20 : 77,1 · 72,0 · 65,0)', await ev(RES))
        await aller(pg, 'radiotherapie/s/pro-boost-ldr/prescription')
        ok(await ev("document.querySelectorAll('.rtr-eqd.off').length") == 1 and 'non applicable' in await ev("document.querySelector('.rtr-eqd.off').title"), 'ligne LDR : « EQD2 » grisé, « Calcul non applicable : PDR, LDR ou dose à définir »')
        await pg.click('.rtr-imp'); await pg.wait_for_timeout(300); await pg.click('#fenetre .bt.plein'); await pg.wait_for_timeout(900)
        ok('rtr-eqd' not in await ev("window.__win[window.__win.length - 1].w.document._h"), 'impression : sans lien « EQD2 »')
        ok(not pg.errs, 'aucune erreur JavaScript (1 440 px)', pg.errs[:2]); await pg.close()
        # Téléphone
        pg = await ouvrir(b, S, w=390, h=800); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(2500)
        for h in ['oar', 'contraintes', 'essais']:
            await aller(pg, 'radiotherapie/' + h)
            ok(not await ev(DEBORDE), f'390 px : {h} sans débordement')
        await controle(pg, 390)
        ok(await ev("[...document.querySelectorAll('.rtr-calc .sm')].some(e => e.offsetParent !== null)") and await ev("document.querySelector('.rtr-calc [data-c=\"d\"]').getAttribute('inputmode')") == 'decimal', '390 px : libellés raccourcis (EQD, Dose/fx), clavier numérique')
        ok(not pg.errs, '390 px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
