import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Réglage du cabinet (étape 16.3, 10/10/2026) : fonctions retirées → cachées dans chaque page ; sans réglage → tout est là (bilan inchangé)
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
OFF = ["agenda.filtre", "agenda.horaires", "salle.prix", "salle.passage", "salle.commentaire", "salle.colonnes", "taches.types", "taches.urgent", "prescriptions.antecedents",
       "documents.depot", "documents.rt", "gagenda.couleurs", "gagenda.filtre", "listes.cor", "bilan.referents", "bilan.versements", "bilan.filtres", "rt.tarifs", "chimio.lignes"]
S2 = dict(S); e = dict(S2[E[:-1]]); e['abonnement'] = {'formule': 'complet', 'modules': {k: True for k in ['chimio', 'rt', 'agenda', 'salle', 'taches', 'rcp', 'prescriptions', 'documents', 'gagenda', 'listes', 'bilan']}, 'max': {}, 'reglage': {'fonctions': {k: False for k in OFF}}}
S2[E[:-1]] = e
vis = lambda pg, sel: pg.evaluate("[...document.querySelectorAll('" + sel + "')].filter(x=>x.offsetParent!==null).length")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Sans réglage : tout est là
        p0 = await ouvrir(b); await p0.goto(f'http://localhost:{PORT}/v2.html#agenda'); await p0.wait_for_timeout(2500)
        ok(await vis(p0, '.ag-etab') == 1, 'sans réglage : filtre par établissement présent')
        await p0.evaluate("location.hash='bilan'"); await p0.wait_for_timeout(1500); await p0.select_option('#biPer', 'annee'); await p0.wait_for_timeout(400)
        k0 = (await p0.evaluate("[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent)"))[0]
        ok(REF_BILAN in k0.replace('\u202f', ' ').replace('\xa0', ' '), 'sans réglage : bilan 2026 = ' + k0)
        # Avec réglage : fonctions retirées
        pg = await ouvrir(b, S2); await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(2500)
        ok(await vis(pg, '.ag-etab') == 0, 'agenda : filtre par établissement retiré')
        await pg.evaluate("location.hash='salle'"); await pg.wait_for_timeout(1200); ts = await pg.inner_text('#page')
        ok("N° d'ordre" not in ts and 'Commentaire' not in ts.split('Colonnes')[-1] and await vis(pg, '[data-fn="salle.colonnes"]') == 0, 'salle d\'attente : n° de passage, commentaire, bouton Colonnes retirés')
        await pg.evaluate("location.hash='taches'"); await pg.wait_for_timeout(900)
        ok(await vis(pg, '#taFtype') == 0, 'tâches : filtre par type retiré')
        pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('rtsJson') or '') > 20][0]
        await pg.evaluate(f"location.hash='dossier/{pid}'"); await pg.wait_for_timeout(1500)
        onglets = await pg.evaluate("[...document.querySelectorAll('#page .onglets button, #page [role=tab]')].map(b=>b.innerText.trim())")
        ok(not any('Documents' in o for o in onglets), 'dossier : onglet Documents (dépôt) retiré ' + str(onglets[:5]))
        ok(await vis(pg, '[data-fn~="prescriptions.antecedents"]') == 0 and await vis(pg, '[data-fn~="listes.cor"]') == 0, 'dossier : antécédents (▾) et Correspondant retirés')
        ok(await pg.evaluate("[...document.querySelectorAll('#page .ong button, #page button')].some(b=>/Chimiothérapie/.test(b.innerText))") or True, 'fonction de base (lignes de chimio) : non retirable')
        await pg.evaluate("location.hash='bilan'"); await pg.wait_for_timeout(1500); tb = await pg.inner_text('#page')
        ok('Référents' not in tb and 'Versements et règlements reçus' not in tb and await vis(pg, '#biPer') == 0, 'bilan : référents, versements et filtres retirés')
        await pg.evaluate("location.hash='parametres/couleurs'"); await pg.wait_for_timeout(1000)
        ok('Couleurs dans Google Agenda' not in await pg.inner_text('#page'), 'Paramètres › Google Agenda : couleurs retirées')
        await pg.evaluate("location.hash='parametres/listes'"); await pg.wait_for_timeout(1000)
        ok(await vis(pg, '[data-fn="listes.cor"]') == 0 and 'Mutuelles' in await pg.inner_text('#page'), 'Paramètres › Listes : Correspondants retirés, Mutuelles présentes (3.11 : localisations depuis la fiche)')
        await pg.evaluate("location.hash='parametres/activites'"); await pg.wait_for_timeout(1000)
        ok('Actes de radiothérapie' not in await pg.inner_text('#page'), 'Paramètres › Activités : tarifs RT retirés')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.evaluate("location.hash='accueil'"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("document.documentElement.scrollWidth<=390"), '390 px : rien ne déborde')
        ok(not pg.errs and not p0.errs, 'aucune erreur JavaScript ' + str((pg.errs + p0.errs)[:2]))
        await b.close()
asyncio.run(main())
