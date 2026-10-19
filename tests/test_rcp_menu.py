import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-B1 (19/10/2026, demande du 17/10) : RCP dans le menu principal, juste sous Tâches (avant : onglet de la page Tâches) ; anciens liens
# #taches/rcp renvoyés ; retour du dossier ouvert depuis la liste = page RCP ; menu déjà réglé : RCP inséré après Tâches ; module retiré :
# entrée cachée. Patients fictifs, inscription fictive.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E); P3 = PIDS[2]
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
S2[E + 'parametres/rcp'] = {'data': json.dumps({'jours': [4], 'heure': '14:00', 'lieu': 'Salle test', 'plus': [], 'annulees': []})}
S2[E + 'rcp/R1'] = {'patientId': P3, 'patientNom': 'PATIENT TEST 3', 'etablissementId': 'DEMO', 'd': '2026-10-08', 'q': 'Question fictive', 'ins': '2026-10-05', 'fait': False, 'creePar': 'UIDRITA', 'creeParNom': 'Dr Test'}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3500)
        menu = await ev("[...document.querySelectorAll('nav a')].filter(a => a.offsetParent !== null).map(a => a.dataset.p)")
        ok('rcp' in menu and menu.index('rcp') == menu.index('taches') + 1, 'menu : « RCP » juste sous « Tâches »', menu)
        ok(await ev("document.getElementById('nbRcp').textContent") == '1' and not await ev("document.getElementById('nbRcp').classList.contains('cache')"), 'pastille du menu RCP : 1 inscription sans décision')
        await ev("location.hash='rcp'"); await pg.wait_for_timeout(1500)
        t = await ev("document.getElementById('page').innerText")
        ok('RCP' in await ev("document.getElementById('titrePage').textContent") and 'PATIENT TEST 3' in t and 'Question fictive' in t, 'page RCP : liste des inscriptions (même contenu que l\'ancien onglet)', t[:300])
        ok(await ev("!!document.querySelector('nav a[data-p=rcp].actif')"), 'entrée « RCP » du menu en surbrillance')
        await ev("location.hash='taches'"); await pg.wait_for_timeout(1500)
        ok(not await ev("!!document.querySelector('[onclick=\"taVue(\\'rcp\\')\"]')"), 'page Tâches : plus d\'onglet RCP')
        await ev("location.hash='taches/rcp'"); await pg.wait_for_timeout(1500)
        ok(await ev("location.hash") == '#rcp', 'ancien lien #taches/rcp → page RCP', await ev("location.hash"))
        # Dossier ouvert depuis la liste, puis « Fermer » : retour à la page RCP
        await ev("rcpOuvrir('R1')"); await pg.wait_for_timeout(1500)
        ok((await ev("location.hash")).startswith('#dossier/'), 'dossier ouvert depuis la liste des RCP')
        await ev("rcpFermer()"); await pg.wait_for_timeout(1500)
        ok(await ev("location.hash") == '#rcp', '« Fermer » : retour à la page RCP')
        # Téléphone et menu replié
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.wait_for_timeout(500)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : page RCP sans débordement')
        await pg.set_viewport_size({'width': 1440, 'height': 900}); await ev("document.body.classList.add('menu-replie')"); await pg.wait_for_timeout(300)
        ok(await ev("document.querySelector('nav a[data-p=rcp]').offsetParent !== null"), 'menu replié : entrée RCP présente')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Menu réglé par l'Administration avant le 19/10 (sans RCP) : RCP inséré après Tâches
        S3 = json.loads(json.dumps(S2)); ed = S3.setdefault(E[:-1], {}); ab = ed.setdefault('abonnement', {}); ab.setdefault('reglage', {})['menu'] = ['patients', 'taches', 'accueil', 'agenda', 'salle', 'protocoles', 'parametres', 'bilan', 'profil']
        pg = await ouvrir(b, S3); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3500)
        menu = await ev("[...document.querySelectorAll('nav a')].filter(a => a.offsetParent !== null).map(a => a.dataset.p)")
        ok(menu[:3] == ['patients', 'taches', 'rcp'], 'menu déjà réglé : son ordre gardé, RCP juste après Tâches', menu)
        await pg.close()
        # Module RCP retiré : entrée cachée, page → tableau de bord
        S4 = json.loads(json.dumps(S2)); ed = S4.setdefault(E[:-1], {}); ed.setdefault('abonnement', {}).setdefault('modules', {})['rcp'] = False
        ed['abonnement'].setdefault('formule', 'complet')
        pg = await ouvrir(b, S4); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#rcp'); await pg.wait_for_timeout(3500)
        ok(await ev("document.querySelector('nav a[data-p=rcp]').offsetParent === null"), 'module RCP retiré : entrée du menu cachée')
        ok(await ev("location.hash") in ('#accueil', '#rcp') and 'RCP' != await ev("document.getElementById('titrePage').textContent"), 'module RCP retiré : la page RCP renvoie au tableau de bord', await ev("document.getElementById('titrePage').textContent"))
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
