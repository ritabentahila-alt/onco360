import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, RT3 (25/10/2026) : page Référentiel du menu « Radiothérapie » (radiotherapie.js) : sans recherche, Consultés récemment, Favoris puis tous les
# schémas (étape A du 25/10/2026 : plus de sommaire ; fiche en pleine page, « Retour à la liste ») ;
# recherche (↑ ↓ Entrée Échap, surlignage), menus Région › Localisation › Situation › Fractionnement (nombres, cascade), liste (intertitres,
# critères de la situation), aucun résultat (« Chercher sans »), fiche à droite dès 1 280 px, page entière avec Retour en dessous, téléphone
# (bouton Filtres), badge « Modifié pour le cabinet », réglages personnels (rtFavoris, rtRecents). Jeu fictif + contenu de référence.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2 = json.loads(json.dumps(S))
S2[E + 'referentielRT/pro-fav-42-7'] = {'schema': {'id': 'pro-fav-42-7', 'situation_id': 'pro-ep-fav', 'titre': '42,7 Gy / 7 fx (version du cabinet)', 'type': 'rte_hypo', 'preuve': 'essai_phase3', 'essai_ids': [], 'prescriptions': [{'volume': 'PTV_PRO', 'dose_Gy': 42.7, 'fractions': 7, 'dose_fx_Gy': 6.1, 'mode': 'seul', 'rythme': '3 fx/sem'}]}, 'localisation_id': 'prostate', 'origine': 'cabinet', 'base': '2026-10-01', 'majPar': 'UIDRITA', 'majParNom': 'Dr Médecin Test'}
TXT = "document.getElementById('page').innerText"
NB = "parseInt(document.querySelector('#rtrListe .rtr-nb').textContent)"
LIGNES = "[...document.querySelectorAll('#rtrListe > .pgrille > .rtr-l')].map(e => e.querySelector('b').innerText)"
DEBORDE = "document.documentElement.scrollWidth > window.innerWidth + 1"
COUPE = "[...document.querySelectorAll('.rtr-l1 b, .rtr-t h2')].filter(b => b.scrollWidth > b.clientWidth + 1).length"
async def menu(pg, k, v):
    await pg.select_option('#rtr_' + k, v); await pg.wait_for_timeout(250)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(3000)
        # Accueil
        t = await ev(TXT)
        ok('Tous les schémas' in t and 'Sommaire' not in t and 'Favoris' not in t and 'Consultés récemment' not in t, 'premier usage : tous les schémas, sans sommaire (ni Favoris ni Récents)')
        r0 = [await ev(NB), len(await ev(LIGNES)), await ev("document.querySelectorAll('.rtr-it').length"), await ev("[...document.querySelectorAll('#rtrListe .pages button')].map(b => b.textContent)")]
        ok(await ev(NB) == 295 and len(await ev(LIGNES)) == 12 and await ev("[...document.querySelectorAll('#rtrListe .pages button')].map(b => b.textContent).includes('25')"), 'liste complète : 295 schémas en cartes, 12 par page (25 pages)', r0)
        ok(await ev("document.activeElement && document.activeElement.id") == 'rtrQ', 'ordinateur : le curseur est dans la recherche du module')
        ok(not await ev(DEBORDE), '1 440 px : accueil sans débordement')
        # Recherche, surlignage, clavier
        await pg.fill('#rtrQ', 'prostate 60'); await pg.wait_for_timeout(300)
        L = await ev(LIGNES)
        ok(len(L) >= 2 and '60 Gy / 20 fx' in L, '« prostate 60 » : 60 Gy / 20 fx dans la liste', L)
        ok(await ev("document.querySelectorAll('#rtrListe mark').length") > 0 and (await ev("document.querySelector('.rtr-nb').textContent")).endswith('schémas'), 'termes surlignés, compteur « n schémas »')
        ms = await ev("(() => { const q = document.getElementById('rtrQ'), t = performance.now(); q.value = 'sein hypo'; q.dispatchEvent(new Event('input')); document.body.offsetHeight; return performance.now() - t; })()")
        ok(ms < 100, f'résultats affichés en moins de 100 ms ({ms:.0f} ms)')
        await pg.fill('#rtrQ', 'prostate 60'); await pg.wait_for_timeout(300)
        await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(200)
        sel = await ev("document.querySelector('.rtr-l.sel b').innerText")
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500)
        h = await ev("location.hash")
        ok(h.startswith('#radiotherapie/s/') and h.endswith('/prescription') and sel in await ev("document.querySelector('.rtr-t h2').innerText"), '↓ ↓ Entrée : le 2e schéma s\'ouvre (#radiotherapie/s/…/prescription)', [h, sel])
        ok(await ev("document.getElementById('rtr').classList.contains('seule')") and not await ev("!!document.getElementById('rtrListe')") and await ev("!!document.querySelector('.rtr-ret')"), '1 440 px : fiche en pleine page, « Retour à la liste »')
        r = await ev("document.querySelector('.rtr-res').textContent")
        ok('Gy' in r and 'Validé' in r and 'Vérifié le' in r, 'en-tête : résumé de prescription, Validé, Vérifié le', r)
        # Retour à la liste : même recherche ; un autre schéma
        await pg.click('.rtr-ret'); await pg.wait_for_timeout(1200)
        ok(await ev("location.hash") == '#radiotherapie' and await ev("document.getElementById('rtrQ').value") == 'prostate 60' and await ev(LIGNES) == L, '« Retour à la liste » : la même recherche, la même liste')
        await pg.click('#rtrListe > .pgrille > .rtr-l >> nth=0'); await pg.wait_for_timeout(1200)
        rec = await ev("(window.__fs['utilisateurs/UIDRITA'] || {}).rtRecents || []")
        ok(len(rec) == 2, 'consultés récemment : 2 schémas notés (utilisateurs/{uid}.rtRecents)', rec)
        # Étoile, favoris
        await pg.click('.rtr-t .rtr-et'); await pg.wait_for_timeout(400)
        fav = await ev("(window.__fs['utilisateurs/UIDRITA'] || {}).rtFavoris || []")
        ok(len(fav) == 1 and fav[0] == rec[0], 'étoile de la fiche : favori enregistré (rtFavoris)', fav)
        await ev("location.hash='radiotherapie'"); await pg.wait_for_timeout(800)
        await pg.click('#rtrQ'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        t = await ev(TXT)
        ok(await ev("document.getElementById('rtrQ').value") == '' and 'Favoris' in t and 'Consultés récemment' in t, 'Échap vide la recherche ; accueil : Favoris et Consultés récemment')
        await pg.click('.rtr-bloc:has(h3:has-text("Favoris")) .rtr-l'); await pg.wait_for_timeout(1200)
        ok(await ev("location.hash") == '#radiotherapie/s/' + fav[0] + '/prescription', 'un favori s\'ouvre en un clic depuis l\'accueil')
        await ev("location.hash='radiotherapie'"); await pg.wait_for_timeout(800)
        # Menus en cascade
        await menu(pg, 'reg', 'uro')
        ok(all(x.endswith(')') for x in await ev("[...document.querySelectorAll('#rtr_loc option')].slice(1).map(o => o.textContent)")) and await ev("document.querySelectorAll('#rtr_loc option').length") == 5, 'Région Uro : 4 localisations proposées, avec leur nombre de schémas')
        ok(await ev("[...document.querySelectorAll('#rtr_sit option')].slice(1).map(o => o.value).every(v => v.startsWith('ctx:'))"), 'Situation sans localisation : les contextes (En place, Rattrapage…)')
        await menu(pg, 'loc', 'prostate')
        ok(await ev("document.querySelectorAll('#rtr_sit optgroup').length") >= 3 and await ev(NB) == 27, 'Prostate : 27 schémas ; situations groupées par contexte')
        await menu(pg, 'sit', 'pro-ep-fav')
        ok(await ev("!!document.querySelector('.rtr-crit')") and 'Faible' in await ev("document.querySelector('.rtr-crit').innerText"), 'situation choisie : ses critères au-dessus de la liste')
        await menu(pg, 'frac', 'Hypofractionné')
        L2 = await ev(LIGNES)
        ok(len(L2) >= 2 and await ev("[...document.querySelectorAll('#rtrListe .rtr-ty')].every(e => e.textContent === 'Hypofractionné')"), 'Fractionnement : Hypofractionné seulement', L2)
        ok('Modifié' in await ev(TXT) and '42,7 Gy / 7 fx (version du cabinet)' in L2, 'schéma modifié pour le cabinet : sa version, badge orange')
        await menu(pg, 'reg', 'gyneco'); await pg.wait_for_timeout(200)
        ok(await ev("[document.getElementById('rtr_loc').value, document.getElementById('rtr_sit').value]") == ['', ''], 'changer de région vide Localisation et Situation, plus valables')
        await pg.click('.rtr-mz .bt.gris'); await pg.wait_for_timeout(300)
        t = await ev(TXT)
        ok('Tous les schémas' in t and t.index('Consultés récemment') < t.index('Favoris') < t.index('Tous les schémas') and await ev(NB) == 295, '« Effacer » : retour à la liste générale, Consultés récemment en tête')
        await menu(pg, 'frac', 'Curiethérapie')
        ok(await ev("document.querySelectorAll('.rtr-it').length") > 3, 'Fractionnement « Curiethérapie » : un intertitre par localisation')
        # Aucun résultat
        await pg.click('.rtr-mz .bt.gris'); await pg.fill('#rtrQ', 'prostate zzz'); await pg.wait_for_timeout(300)
        ok('Aucun schéma ne correspond' in await ev(TXT) and 'Chercher sans « zzz »' in await ev(TXT), 'aucun résultat : « Chercher sans « zzz » »')
        await pg.click('button:has-text("Chercher sans")'); await pg.wait_for_timeout(300)
        ok(await ev("document.getElementById('rtrQ').value") == 'prostate' and await ev(NB) == 27, '« Chercher sans » : la recherche reprend sans le mot')
        # Fil d'Ariane
        await pg.click('#rtrListe .rtr-l >> nth=0'); await pg.wait_for_timeout(1200)
        await pg.click('.rtr-ar a >> nth=1'); await pg.wait_for_timeout(800)
        ok(await ev("location.hash") == '#radiotherapie' and await ev("document.getElementById('rtr_loc').value") == 'prostate', 'fil d\'Ariane : « Prostate » règle les menus de la liste')
        ok(not await ev(DEBORDE) and not await ev(COUPE), '1 440 px : liste sans débordement, aucun titre coupé')
        ok(not pg.errs, 'aucune erreur JavaScript (1 440 px)', pg.errs[:2]); await pg.close()
        # 1 280 et 1 200 px : fiche en pleine page, Retour retrouve la liste
        for w in [1280, 1200]:
            pg = await ouvrir(b, S2, w=w); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(2500)
            await pg.fill('#rtrQ', 'col curie'); await pg.wait_for_timeout(300); n = len(await ev(LIGNES))
            await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500)
            ok(not await ev("!!document.getElementById('rtrListe')") and await ev("!!document.querySelector('.rtr-ret')"), f'{w} px : fiche en pleine page')
            ok(not await ev(DEBORDE) and not await ev(COUPE), f'{w} px : sans débordement, titres entiers')
            await pg.click('.rtr-ret'); await pg.wait_for_timeout(1200)
            ok(await ev("document.getElementById('rtrQ').value") == 'col curie' and len(await ev(LIGNES)) == n, f'{w} px : Retour retrouve la même liste')
            ok(not pg.errs, f'{w} px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Téléphone (390 px)
        pg = await ouvrir(b, S2, w=390, h=800); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(2500)
        await pg.wait_for_selector('.rtr-mz', state='attached', timeout=15000)  # Safari, suite complète : page parfois plus lente
        ok(not await ev(DEBORDE), '390 px : accueil sans débordement')
        ok(await ev("document.querySelector('.rtr-mz').offsetParent === null") and await ev("document.querySelector('.rtr-ftr').offsetHeight") >= 44, '390 px : menus repliés derrière « Filtres » (44 px)')
        await pg.click('.rtr-ftr'); await pg.wait_for_timeout(300); await menu(pg, 'reg', 'sein')
        ok(await ev("document.querySelector('.rtr-ftr .n').textContent") == '1' and not await ev(DEBORDE), '390 px : « Filtres 1 » après un choix, sans débordement')
        await pg.fill('#rtrQ', 'boost'); await pg.wait_for_timeout(300)
        ok(len(await ev(LIGNES)) > 0 and not await ev(DEBORDE) and not await ev(COUPE), '390 px : liste sans débordement, titres entiers')
        await pg.click('#rtrListe .rtr-l >> nth=0'); await pg.wait_for_timeout(1500)
        ok(await ev("!!document.querySelector('.rtr-ret')") and not await ev(DEBORDE) and not await ev(COUPE), '390 px : fiche en page entière, Retour, sans débordement')
        ok(await ev("[...document.querySelectorAll('.rtr-et')].every(e => e.offsetWidth >= 44 && e.offsetHeight >= 44)"), '390 px : étoile de 44 px au toucher')
        ok(not pg.errs, '390 px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Secrétaire avec « voir » : tout est lisible
        S3 = json.loads(json.dumps(S2)); S3[E + 'membres/UIDSECV'] = {'role': 'assistante', 'actif': True, 'nom': 'SECRETAIRE Test', 'tousEtablissements': True, 'etablissements': [], 'droits': {'identite': True, 'referentielRT': 'voir'}}
        pg = await ouvrir(b, S3); await pg.add_init_script("window.__uid='UIDSECV'"); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(2500)
        await pg.fill('#rtrQ', 'prostate'); await pg.wait_for_timeout(300)
        ok(await ev(NB) == 27 and 'Modifié' in await ev(TXT), 'secrétaire « voir » : liste et version du cabinet lisibles')
        ok(not pg.errs, 'secrétaire : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
