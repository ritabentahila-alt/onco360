import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, suite (25/10/2026, demandes de Dr Bentahila) : modification ligne par ligne pour le cabinet. Centrage (rubriques et ligne ajoutée),
# contourage (lignes des volumes, organe à risque ajouté depuis la liste des organes, plus de modèle à choisir), contraintes du schéma (une valeur
# modifiée, une ligne ajoutée ; « Revenir aux contraintes de la base »), organe à risque modifié et ajouté (page Organes à risque,
# referentielRT/_oar) ; téléphone sans débordement. Jeu fictif ; espaces/{e}/referentielRT dans le faux Firebase.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
K = E + 'referentielRT/'
DOC = lambda i: f"window.__fs['{K}{i}'] || null"
MSG = "document.getElementById('rtrBmsg').textContent"
async def onglet(pg, nom):
    await pg.click(f'.rtr-ong button:has-text("{nom}")'); await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/pro-fav-60-20/prescription'); await pg.wait_for_timeout(2500)
        await pg.click('.rtr-mbt'); await pg.wait_for_timeout(300)
        # Centrage
        await onglet(pg, 'Centrage')
        ok(await ev("document.querySelectorAll('.rtr-oc textarea[data-p^=\"sim.\"]').length") == 6 and not await ev("!!document.querySelector('.rtr-oc select[data-p=simulation_id]')"), 'Centrage : six rubriques modifiables, plus de fiche à choisir')
        await pg.fill('[data-p="sim.contention"]', 'Contention du cabinet (test)'); await pg.click('.rtr-oc .rtr-aj'); await pg.wait_for_timeout(200)
        await pg.fill('[data-p="sim.autres.0.lib"]', 'Vessie'); await pg.fill('[data-p="sim.autres.0.val"]', 'Pleine (500 ml 1 h avant)')
        # Contourage
        await onglet(pg, 'Contourage')
        n0 = await ev("document.querySelectorAll('.rtr-oc input[data-p$=\".nom\"]').length")
        ok(n0 >= 2 and not await ev("!!document.querySelector('.rtr-oc select[data-p=volumes_id]')"), 'Contourage : lignes des volumes modifiables, plus de modèle à choisir', n0)
        await pg.fill('[data-p="vol.0.marge"]', '6 mm (cabinet)'); await pg.click('.rtr-oc .rtr-aj'); await pg.wait_for_timeout(200)
        ok(await ev("document.querySelectorAll('.rtr-oc input[data-p$=\".nom\"]').length") == n0 + 1, 'Ajouter une ligne de volume')
        await pg.fill(f'[data-p="vol.{n0}.nom"]', 'CTV_TEST')
        no = await ev("document.querySelectorAll('.rtr-oare li').length")
        await pg.select_option('.rtr-oc select.rtr-in', 'oar-rate'); await pg.wait_for_timeout(300)
        ok(await ev("document.querySelectorAll('.rtr-oare li').length") == no + 1 and 'Rate' in await ev("document.querySelector('.rtr-oare').innerText"), 'organe à risque ajouté depuis la liste des organes (Rate)')
        # Contraintes du schéma
        await onglet(pg, 'Contraintes')
        nl = await ev("document.querySelectorAll('.rtr-ctedit tbody tr').length")
        ok(nl > 10 and await ev("[...document.querySelectorAll('.rtr-ctedit select[data-p$=\".oar_id\"]')].some(s => s.value === 'oar-rate')"), 'Contraintes : la table du schéma, l\'organe ajouté au contourage y figure', nl)
        await pg.fill('[data-p="ct.0.limitant"]', '< 49 % (cabinet)'); await pg.wait_for_timeout(100)
        await pg.click('.rtr-oc .rtr-aj'); await pg.wait_for_timeout(200)
        await pg.fill(f'[data-p="ct.{nl}.indicateur"]', 'Dmax test'); await pg.fill(f'[data-p="ct.{nl}.limitant"]', '< 1 Gy')
        ok('Revenir aux contraintes de la base' in await ev("document.querySelector('.rtr-oc').innerText"), '« Revenir aux contraintes de la base » proposé')
        await pg.click('#rtrEnr'); await pg.wait_for_timeout(1500)
        d = await ev(DOC('pro-fav-60-20'))
        s2 = (d or {}).get('schema', {})
        ok(d and s2.get('simulation', {}).get('contention') == 'Contention du cabinet (test)' and s2['simulation']['autres'][0]['lib'] == 'Vessie', 'enregistré : centrage du cabinet', s2.get('simulation'))
        ok(d and s2.get('volumes', {}).get('cibles', [{}])[0].get('marge') == '6 mm (cabinet)' and 'oar-rate' in s2['volumes']['oar_ids'] and s2['volumes']['cibles'][-1]['nom'] == 'CTV_TEST', 'enregistré : contourage du cabinet', s2.get('volumes'))
        ok(d and s2.get('contraintes', [{}])[0].get('limitant') == '< 49 % (cabinet)' and s2['contraintes'][-1]['indicateur'] == 'Dmax test', 'enregistré : contraintes du schéma', (s2.get('contraintes') or [])[:1])
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/pro-fav-60-20/contraintes'); await pg.wait_for_timeout(2500)
        t = await ev("document.querySelector('.rtr-oc').innerText")
        ok('< 49 % (cabinet)' in t and 'Dmax test' in t and 'Pratique du cabinet' in t, 'la fiche affiche la table du cabinet')
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/pro-fav-60-20/centrage'); await pg.wait_for_timeout(1500)
        ok('Pleine (500 ml 1 h avant)' in await ev("document.querySelector('.rtr-oc').innerText"), 'la fiche affiche la ligne de centrage ajoutée')
        # Revenir aux contraintes de la base
        await pg.click('.rtr-mbt'); await pg.wait_for_timeout(300); await onglet(pg, 'Contraintes')
        await pg.click('.rtr-oc a:has-text("Revenir aux contraintes de la base")'); await pg.wait_for_timeout(300)
        await pg.click('#rtrEnr'); await pg.wait_for_timeout(1500)
        await pg.click('.rtr-ong button:has-text("Contraintes")'); await pg.wait_for_timeout(400)
        ok('contraintes' not in ((await ev(DOC('pro-fav-60-20'))) or {}).get('schema', {}) and 'RecoRad 2025' in await ev("document.querySelector('.rtr-oc').innerText"), 'revenu aux contraintes de la base')
        # Organe à risque
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/oar'); await pg.wait_for_timeout(2000)
        await pg.fill('#rtrOq', 'rate'); await pg.wait_for_timeout(200)
        await pg.click('.rtr-ot tbody tr[data-oar="oar-rate"]'); await pg.wait_for_timeout(2500)
        await pg.click('.rtr-det .mini:has-text("Modifier")'); await pg.wait_for_timeout(300)
        await pg.fill('#rtrOd', 'Rate entière, définition du cabinet (test).'); await pg.click('#fenetre .bt.plein'); await pg.wait_for_timeout(1200)
        d = await ev(DOC('_oar'))
        ok(d and d['oar']['oar-rate']['definition'] == 'Rate entière, définition du cabinet (test).' and d['majPar'] == 'UIDRITA' and 'définition du cabinet' in await ev("document.querySelector('.rtr-ot').innerText"), 'organe modifié pour le cabinet (referentielRT/_oar), affiché avec « Cabinet »')
        await pg.fill('#rtrOq', ''); await pg.click('.rtr-ohaut .mini'); await pg.wait_for_timeout(300)
        await pg.fill('#rtrOn', 'Organe test du cabinet'); await pg.fill('#rtrOt', 'Test_Cab'); await pg.fill('#rtrOd', 'Définition test'); await pg.click('#fenetre .bt.plein'); await pg.wait_for_timeout(1200)
        d = await ev(DOC('_oar'))
        ok(d and any(x['nom'] == 'Organe test du cabinet' for x in d['ajouts']) and await ev("document.querySelectorAll('.rtr-ot tbody tr').length") == 118, 'organe ajouté par le cabinet (118 organes)')
        ok(not await ev("!!window.__fs['" + K + "_oar'].schema"), 'les bibliothèques du cabinet ne sont pas prises pour un schéma')
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(2500)
        ok(await ev("document.querySelectorAll('#rtrListe > .rtr-l').length") >= 295 and not pg.errs, 'la liste des schémas reste entière, aucune erreur JavaScript', pg.errs[:2])
        await pg.close()
        # Téléphone
        pg = await ouvrir(b, S, w=390, h=800); ev = pg.evaluate
        for h in ['s/pro-fav-60-20/contraintes', 'oar', 'contraintes']:
            await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/{h}'); await pg.wait_for_timeout(2500)
            ok(await ev("document.documentElement.scrollWidth <= innerWidth + 1"), f'390 px : {h} sans débordement')
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/pro-fav-60-20/contourage'); await pg.wait_for_timeout(2500)
        await ev("rtrModifier()"); await pg.wait_for_timeout(400)
        for o in ['Centrage', 'Contourage', 'Contraintes']:
            await pg.click(f'.rtr-ong button:has-text("{o}")'); await pg.wait_for_timeout(300)
            ok(await ev("document.documentElement.scrollWidth <= innerWidth + 1"), f'390 px : modification de {o} sans débordement')
        ok(not pg.errs, '390 px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
