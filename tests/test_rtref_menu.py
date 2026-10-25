import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, RT1 (25/10/2026) : menu « Radiothérapie » (référentiel de radiothérapie) juste sous « Protocoles » ; visible avec le module rt, la fonction
# rt.referentiel et le droit referentielRT « voir » ou « modifier » (médecin : « modifier » par défaut ; secrétaire, infirmière : « aucun » ; comptable :
# jamais) ; adresse #radiotherapie refusée sinon (tableau de bord) ; menu déjà réglé : inséré après Protocoles ; formule sans chimio : visible.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
MENU = "[...document.querySelectorAll('nav a')].filter(a => a.offsetParent !== null).map(a => a.dataset.p)"
def jeu(f=None):
    s = json.loads(json.dumps(S)); f and f(s); return s
def membre(role, droits):
    return {'role': role, 'actif': True, 'nom': role.upper() + ' Test', 'tousEtablissements': True, 'etablissements': [], 'droits': droits}
def abo(s, cle, val):
    a = s.setdefault(E[:-1], {}).setdefault('abonnement', {}); a.setdefault('formule', 'complet')
    if cle == 'modules': a.setdefault('modules', {}).update(val)
    else: a.setdefault('reglage', {}).setdefault(cle, {}).update(val) if isinstance(val, dict) else a.setdefault('reglage', {}).__setitem__(cle, val)
MODS = ['chimio', 'rt', 'agenda', 'salle', 'taches', 'rcp', 'prescriptions', 'documents', 'gagenda', 'listes', 'bilan']
# Modules d'une formule : ceux de la liste, les autres retirés (abonnementEffectif)
def formule(s, nom, mods):
    s.setdefault(E[:-1], {})['abonnement'] = {'formule': nom, 'modules': {k: k in mods for k in MODS}}
async def page(b, s, uid=None, h='accueil'):
    pg = await ouvrir(b, s)
    if uid: await pg.add_init_script("window.__uid='" + uid + "'")
    await pg.goto(f'http://localhost:{PORT}/v2.html#' + h); await pg.wait_for_timeout(3000)
    return pg
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Médecin titulaire (droit non noté = « modifier »)
        pg = await page(b, S); ev = pg.evaluate
        m = await ev(MENU)
        ok('radiotherapie' in m and m.index('radiotherapie') == m.index('protocoles') + 1, 'médecin : « Radiothérapie » juste sous « Protocoles »', m)
        ok(await ev("document.querySelector('nav a[data-p=radiotherapie] use').getAttribute('href')") == '#i-radiation', 'icône du menu : radiation (jeu de v2.html)')
        await ev("location.hash='radiotherapie'"); await pg.wait_for_timeout(1500)
        t = await ev("document.getElementById('page').innerText")
        ok(await ev("document.getElementById('titrePage').textContent") == 'Radiothérapie' and 'Tous les schémas' in t and await ev("document.querySelectorAll('#rtrListe > .rtr-l').length") == 295, 'page Radiothérapie : référentiel lu (295 schémas listés)', t[:200])
        ok(await ev("!!document.querySelector('nav a[data-p=radiotherapie].actif')"), 'entrée du menu en surbrillance')
        ok(await ev("document.querySelectorAll('#page .bt.plein').length") == 0, 'page en lecture : aucun bouton plein')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.wait_for_timeout(500)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : sans débordement')
        await pg.set_viewport_size({'width': 1440, 'height': 900}); await ev("document.body.classList.add('menu-replie')"); await pg.wait_for_timeout(300)
        ok(await ev("document.querySelector('nav a[data-p=radiotherapie]').offsetParent !== null"), 'menu replié : entrée présente')
        # Paramètres › Accès : nouveau membre, ligne « Référentiel de radiothérapie » à trois niveaux
        await ev("location.hash='profil/acces'"); await pg.wait_for_timeout(1500)
        await ev("pfMembre()"); await pg.wait_for_timeout(800)
        niv = await ev("(() => { const s = document.querySelector('select[data-d=referentielRT]'); return s ? [...s.options].map(o => o.value) : null; })()")
        ok(niv == ['aucun', 'voir', 'modifier'], 'Accès : droit « Référentiel de radiothérapie » (Non visible, Voir, Modifier)', niv)
        ok(await ev("document.querySelector('select[data-d=referentielRT]').value") == 'aucun', 'Accès : « Non visible » par défaut pour une infirmière (rôle par défaut de la fiche)')
        await ev("window.fermerFenetre()")
        ok(not pg.errs, 'aucune erreur JavaScript (médecin)', pg.errs[:2]); await pg.close()
        # Sommaire illisible : message et « Réessayer »
        pg = await ouvrir(b, S); await pg.route('**/donnees-rt/index.json', lambda r: r.fulfill(status=404, body='')); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(3000)
        ok('pas pu être chargé' in await ev("document.getElementById('page').innerText") and await ev("!!document.getElementById('rtrReessayer')"), 'référentiel introuvable : « Le référentiel n\'a pas pu être chargé » et « Réessayer »')
        await pg.close()
        # Rôles et droits
        for uid, role, droits, voit, lib in [
            ('UIDSEC', 'assistante', {'identite': True, 'rendezvous': True}, False, 'secrétaire sans droit noté (« aucun »)'),
            ('UIDSECV', 'assistante', {'identite': True, 'rendezvous': True, 'referentielRT': 'voir'}, True, 'secrétaire « voir »'),
            ('UIDINF', 'infirmiere', {'administrer': True}, False, 'infirmière sans droit noté (« aucun »)'),
            ('UIDINFV', 'infirmiere', {'administrer': True, 'referentielRT': 'voir'}, True, 'infirmière « voir »'),
            ('UIDMEDA', 'medecin', {'identite': True, 'traitements': 'modifier', 'referentielRT': 'aucun'}, False, 'médecin « aucun »'),
        ]:
            pg = await page(b, jeu(lambda s: s.__setitem__(E + 'membres/' + uid, membre(role, droits))), uid); ev = pg.evaluate
            ok(('radiotherapie' in await ev(MENU)) == voit, lib + ' : menu ' + ('visible' if voit else 'caché'), await ev(MENU))
            await ev("location.hash='radiotherapie'"); await pg.wait_for_timeout(1200)
            ok((await ev("document.getElementById('titrePage').textContent") == 'Radiothérapie') == voit, lib + ' : #radiotherapie ' + ('ouverte' if voit else 'refusée'), await ev("document.getElementById('titrePage').textContent"))
            ok(not pg.errs, lib + ' : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Comptable, même avec « voir » : jamais
        pg = await page(b, jeu(lambda s: s.__setitem__(E + 'membres/UIDCOMP', membre('comptable', {'finances': True, 'referentielRT': 'voir'}))), 'UIDCOMP'); ev = pg.evaluate
        ok(await ev(MENU) == ['bilan', 'profil'], 'comptable (« voir ») : menu Bilan et Profil seulement', await ev(MENU))
        await ev("location.hash='radiotherapie'"); await pg.wait_for_timeout(1000)
        ok('Bilan' in await ev("document.getElementById('titrePage').textContent"), 'comptable : #radiotherapie → Bilan'); await pg.close()
        # Fonction coupée, module retiré
        for f, lib in [(lambda s: abo(s, 'fonctions', {'rt.referentiel': False}), 'fonction rt.referentiel coupée'), (lambda s: formule(s, 'oncologie', [k for k in MODS if k != 'rt']), 'formule sans module rt')]:
            pg = await page(b, jeu(f), None, 'radiotherapie'); ev = pg.evaluate
            ok('radiotherapie' not in await ev(MENU), lib + ' : menu caché', await ev(MENU))
            ok(await ev("document.getElementById('titrePage').textContent") != 'Radiothérapie', lib + ' : #radiotherapie → tableau de bord', await ev("document.getElementById('titrePage').textContent"))
            ok(not pg.errs, lib + ' : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Menu réglé avant le 25/10 (sans « Radiothérapie ») : inséré juste après Protocoles, le reste dans l'ordre réglé
        pg = await page(b, jeu(lambda s: abo(s, 'menu', ['patients', 'protocoles', 'accueil', 'agenda', 'salle', 'taches', 'rcp', 'parametres', 'bilan', 'profil']))); ev = pg.evaluate
        ok((await ev(MENU))[:3] == ['patients', 'protocoles', 'radiotherapie'], 'menu déjà réglé : son ordre gardé, « Radiothérapie » après « Protocoles »', await ev(MENU)); await pg.close()
        # Formule « Radiothérapie – Essentiel » (modules.js : rt, agenda, prescriptions, documents, gagenda, listes, bilan), sans chimio
        pg = await page(b, jeu(lambda s: formule(s, 'radiotherapie', ['rt', 'agenda', 'prescriptions', 'documents', 'gagenda', 'listes', 'bilan']))); ev = pg.evaluate
        m = await ev(MENU)
        ok('protocoles' not in m and 'radiotherapie' in m, 'formule Radiothérapie (sans chimio) : « Protocoles » caché, « Radiothérapie » visible', m)
        await ev("location.hash='radiotherapie'"); await pg.wait_for_timeout(1200)
        ok('Tous les schémas' in await ev("document.getElementById('page').innerText"), 'formule Radiothérapie : page Radiothérapie ouverte')
        ok(not pg.errs, 'formule Radiothérapie : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
