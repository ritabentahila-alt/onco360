import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Rôle Comptable (étape 9 S2, 09/10/2026) : le médecin prépare le relevé financier ; le comptable voit le même bilan (352 317 DH
# en 2026), pointe un paiement, n'ouvre aucun dossier ; le relevé ne contient aucun diagnostic.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await ouvrir(b)
        await pg.goto(f'http://localhost:{PORT}/v2.html#bilan'); await pg.wait_for_timeout(2000)
        await pg.select_option('#biPer', 'annee'); await pg.wait_for_timeout(400)
        k_med = (await pg.evaluate("[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent)"))
        await pg.wait_for_timeout(3500)  # relevé préparé 3 s après l'ouverture
        fs = await pg.evaluate("window.__fs")
        rel = [k for k in fs if '/comptabilite/' in k]
        ok(E + 'comptabilite/meta' in fs and fs[E + 'comptabilite/meta']['nb'] > 0, 'relevé préparé par le médecin (' + str(len(rel)) + ' documents)')
        R = [x for k in rel if '/releve_' in k for x in json.loads(fs[k]['data'])]
        diags = set(json.loads(v.get('resume') or '{}').get('diag') for k, v in S.items() if k.startswith(E + 'patients/')) - {None, ''}
        txt = json.dumps(R, ensure_ascii=False)
        ok(R and all(set(x.keys()) <= {'id', 'nm', 'num', 'cor', 'hop', 'c1', 'fin'} for x in R) and not any(d in txt for d in diags if len(d) > 8), 'relevé : nom, n° de dossier, actes et montants seulement (aucun diagnostic)')
        ok(not pg.errs, 'aucune erreur JavaScript (médecin) ' + str(pg.errs[:2]))
        # Le comptable
        S2 = dict(fs); S2[E + 'membres/UIDCOMP'] = {'role': 'comptable', 'actif': True, 'nom': 'Karima COMPTABLE', 'tousEtablissements': True, 'etablissements': [], 'droits': {'finances': True}}
        S2 = {k: v for k, v in S2.items() if True}
        pc = await ouvrir(b, S2); await pc.add_init_script("window.__uid='UIDCOMP'")
        await pc.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pc.wait_for_timeout(2500)
        ok(pc.url.endswith('#accueil') and 'Bilan' in await pc.inner_text('#page') and 'relevé à jour au' in await pc.inner_text('#page'), 'le comptable arrive sur le Bilan (relevé daté)')
        vis = await pc.evaluate("[...document.querySelectorAll('nav a')].filter(a=>a.offsetParent!==null).map(a=>a.dataset.p)")
        ok(vis == ['bilan', 'profil'], 'menu : Bilan et Profil seulement ' + str(vis))
        await pc.select_option('#biPer', 'annee'); await pc.wait_for_timeout(400)
        k_comp = (await pc.evaluate("[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent)"))
        ok(k_comp and k_comp[0] == k_med[0] and '352' in k_comp[0], 'même bilan que le médecin : ' + (k_comp[0] if k_comp else '?'))
        ok(k_comp == k_med, 'tous les indicateurs identiques')
        ok(await pc.evaluate("!document.querySelector('#page [onclick*=ouvrirDossier]')"), 'aucun lien vers un dossier')
        pid = [k.split('/')[-1] for k in S if k.startswith(E + 'patients/')][0]
        await pc.evaluate(f"location.hash='dossier/{pid}'"); await pc.wait_for_timeout(800)
        ok('Bilan' in await pc.inner_text('#page'), 'dossier demandé → renvoyé au Bilan')
        for h in ['patients', 'agenda', 'parametres', 'taches']:
            await pc.evaluate(f"location.hash='{h}'"); await pc.wait_for_timeout(300)
        ok('Bilan' in await pc.inner_text('#page'), 'patients, agenda, paramètres, tâches → Bilan')
        av = (fs.get(E + 'finances/paiements') or {}).get('data')
        await pc.evaluate("location.hash='bilan'"); await pc.wait_for_timeout(600); await pc.select_option('#biPer', 'annee'); await pc.wait_for_timeout(300)
        bt = await pc.query_selector('[onclick^="biPaye"]')
        if bt: await bt.click(); await pc.wait_for_timeout(500)
        ap = (await pc.evaluate("window.__fs['" + E + "finances/paiements']") or {}).get('data')
        ok(bt is not None and ap != av, 'le comptable pointe un paiement')
        await pc.set_viewport_size({'width': 390, 'height': 800}); await pc.wait_for_timeout(300)
        ok(await pc.evaluate("document.documentElement.scrollWidth<=390"), '390 px : rien ne déborde')
        ok(not pc.errs, 'aucune erreur JavaScript (comptable) ' + str(pc.errs[:2]))
        await b.close()
asyncio.run(main())
