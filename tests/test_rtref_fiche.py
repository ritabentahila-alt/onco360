import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, RT4 (25/10/2026) : fiche d'un schéma du référentiel de radiothérapie (radiotherapie.js) : en-tête, six onglets (ordre fixe, vides grisés,
# nombres), dernier onglet gardé (rtOnglet, adresse), Prescription (RTE puis curiethérapie, chiffres alignés, traitement systémique, lien vers
# Protocoles), Centrage, Contourage (types, OAR, atlas), Contraintes (blocs par jeu, aide d'Idéal et de Limitant, Copier), Essais (PubMed, DOI,
# détail, Copier la référence), Points d'attention, textes écrits en entier (aucun « ? », étape A du 25/10/2026), impression A4 (sections au choix), 1 440 / 1 280 / 390 px. Jeu fictif ; un protocole
# fictif porte le nom exact cité par l'œsophage (lien direct) ; les autres noms ne sont pas dans la bibliothèque (page filtrée).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2 = json.loads(json.dumps(S)); k0 = E + 'protocoles/lib_0'; L0 = json.loads(S2[k0]['data'])
cross = dict(L0[0], id='oeso|cross-test', nom='Carboplatine-paclitaxel hebdomadaire (CROSS)', loc='Œsophage', ind=[['Digestif', 'Œsophage', 'Néoadjuvant', '']])
S2[k0] = dict(S2[k0], data=json.dumps(L0 + [cross]))
S2[E + 'referentielRT/pro-def-60-20'] = {'schema': {'id': 'pro-def-60-20', 'situation_id': 'pro-ep-def-sans-pelvis', 'titre': '60 Gy / 20 fx (version du cabinet)', 'type': 'rte_hypo', 'preuve': 'essai_phase3', 'essai_ids': ['chhip'], 'prescriptions': [{'volume': 'PTV_PRO', 'dose_Gy': 60, 'fractions': 20, 'dose_fx_Gy': 3, 'mode': 'seul', 'rythme': '5 fx/sem'}], 'contraintes_ids': [], 'date_verif': '2026-10-25'}, 'localisation_id': 'prostate', 'origine': 'cabinet', 'base': '2026-10-01', 'note': 'Notre pratique (note fictive)', 'majPar': 'UIDRITA', 'majParNom': 'Dr Médecin Test', 'majLe': '2026-10-25'}
OC = "document.querySelector('.rtr-oc').innerText"
DEBORDE = "document.documentElement.scrollWidth > window.innerWidth + 1"
COUPE = "[...document.querySelectorAll('.rtr-t h2')].filter(b => b.scrollWidth > b.clientWidth + 1).length"
async def aller(pg, h, t=1800):
    await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(t)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.add_init_script("window.__copie=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:(t)=>{window.__copie.push(t);return Promise.resolve();}}});")
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/pro-fav-60-20/prescription'); await pg.wait_for_timeout(3000)
        # En-tête et onglets
        ong = await ev("[...document.querySelectorAll('.rtr-ong button')].map(b => b.textContent.replace(/\\s*\\d+$/, ''))")
        ok(ong == ['Prescription', 'Centrage', 'Contourage', 'Contraintes', 'Essais et sources', "Points d'attention"], 'six onglets, dans l\'ordre de la chaîne de traitement', ong)
        ok((await ev("document.querySelector('.rtr-ong button:nth-child(4)').textContent")).replace('\xa0', ' ').endswith('11') and (await ev("document.querySelector('.rtr-ong button:nth-child(5)').textContent")).endswith('2'), 'nombres : « Contraintes 11 », « Essais 2 »')
        ok('60 Gy / 20 fx (3 Gy/fx)' in (await ev("document.querySelector('.rtr-res').innerText")).replace('\xa0', ' ') and await ev("!!document.querySelector('.rtr-t .rtr-imp')"), 'en-tête : résumé de prescription, étoile et Imprimer en haut à droite')
        # Prescription
        row = await ev("[...document.querySelectorAll('.rtr-tab tbody tr:first-child td')].map(t => t.innerText.trim())")
        ok(row[0].startswith('PTV_PRO') and row[1:4] == ['60', '20', '3'] and await ev("getComputedStyle(document.querySelector('.rtr-tab td.n')).textAlign") == 'right', 'Prescription : PTV_PRO 60 · 20 · 3, chiffres alignés à droite', row)
        t = await ev(OC)
        ok('Traitement systémique' in t and 'Technique' in t and 'Objectifs de couverture' in t, 'Prescription : technique, traitement systémique (hormonothérapie), couverture')
        # Dernier onglet gardé
        await pg.click('.rtr-ong button:has-text("Contraintes")'); await pg.wait_for_timeout(1500)
        ok((await ev("location.hash")).endswith('/contraintes') and (await ev("(window.__fs['utilisateurs/UIDRITA'] || {}).rtOnglet")) == 'contraintes', 'onglet Contraintes : dans l\'adresse et gardé pour la personne (rtOnglet)')
        await aller(pg, 'radiotherapie'); await pg.fill('#rtrQ', 'prostate 70'); await pg.wait_for_timeout(300); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1800)
        ok((await ev("location.hash")).endswith('/contraintes') and await ev("!!document.querySelector('.rtr-jeu')"), 'autre schéma ouvert de la liste : directement sur Contraintes (aucun clic)')
        await aller(pg, 'radiotherapie/s/pro-fav-60-20/contraintes')
        ok('Idéal' in await ev("document.querySelector('.rtr-aidec').innerText") and 'Limitant' in await ev("document.querySelector('.rtr-aidec').innerText"), 'Contraintes : aide d\'Idéal et de Limitant écrite sous le titre du jeu')
        ok(await ev("document.querySelectorAll('.rtr-ct td.o').length") >= 3 and await ev("getComputedStyle(document.querySelector('.rtr-ct td.lim')).fontWeight") in ('700', 'bold'), 'Contraintes : lignes groupées par organe, Limitant en gras')
        await pg.click('.rtr-cp'); await pg.wait_for_timeout(400)
        cp = await ev("window.__copie[window.__copie.length - 1] || ''")
        ok(cp.startswith('Prostate en place, 3 Gy/fx\t') and '\nRectum\tRectum\tV60Gy\t' in cp and 'Tableau copié' in await ev("document.body.innerText"), 'Copier : tableau en texte tabulé, « Tableau copié »', cp[:120])
        await aller(pg, 'radiotherapie/s/rec-5x5-tme/contraintes')
        ok('Aucun jeu publié pour ce fractionnement' in await ev(OC) and await ev("document.querySelector('.rtr-ong button:nth-child(4)').classList.contains('vide')"), 'sans jeu : « Aucun jeu publié pour ce fractionnement », onglet grisé (à sa place)')
        await aller(pg, 'radiotherapie/s/mu-coms-85/centrage')
        ok('Pas de fiche de centrage du service pour cette localisation' in await ev(OC), 'sans fiche de centrage : la phrase de l\'onglet')
        # RTE + curiethérapie
        await aller(pg, 'radiotherapie/s/col-rch-hdr-7x4/prescription')
        h4 = await ev("[...document.querySelectorAll('.rtr-oc h4')].map(h => h.textContent)")
        vols = await ev("[...document.querySelectorAll('.rtr-tab')].map(t => [...t.querySelectorAll('tbody tr td:first-child b')].map(b => b.textContent))")
        ok(h4[:2] == ['Radiothérapie externe', 'Curiethérapie'] and len(vols) == 2 and any('PTV_N55' in v for v in vols[0]) and all('CTV-HR' in v for v in vols[1]), 'RTE + curiethérapie : deux tableaux ; les ganglions dans la RTE, le CTV-HR en curiethérapie', vols)
        await aller(pg, 'radiotherapie/s/pro-boost-ldr/prescription')
        ok('—' in await ev("document.querySelectorAll('.rtr-tab')[1].innerText") and await ev("!!document.querySelector('.rtr-tx b')"), 'curiethérapie LDR : « — » pour les séances ; paragraphes rédigés (gras)')
        # Plus aucun « ? » : les textes sont écrits en entier
        await aller(pg, 'radiotherapie/s/pro-fav-60-20/contourage')
        ok(await ev("document.querySelectorAll('.rtr-aide, .rtr-c').length") == 0 and '…' not in await ev(OC), 'aucun « ? » ni texte coupé (« … »)')
        ok(await ev("document.querySelectorAll('.rtr-tab .badge.b-gr').length") >= 3 and await ev("document.querySelectorAll('.rtr-oar li').length") >= 5 and await ev("[...document.querySelectorAll('.rtr-l2 a')].every(a => a.target === '_blank')"), 'Contourage : types en badge neutre, organes à risque, atlas dans un nouvel onglet')
        # Essais
        await aller(pg, 'radiotherapie/s/pro-fav-60-20/essais')
        ok(await ev("document.querySelector('.rtr-ln a').href") == 'https://pubmed.ncbi.nlm.nih.gov/27339115/' and await ev("[...document.querySelectorAll('.rtr-ln a')].some(a => a.href.startsWith('https://doi.org/'))"), 'Essais : liens PubMed et DOI')
        await pg.click('.rtr-e summary >> nth=0'); await pg.wait_for_timeout(200)
        ok(await ev("document.querySelector('.rtr-e').open") and 'Population' in await ev(OC), 'un clic déplie la population et les bras')
        await pg.click('.rtr-e[open] .mini'); await pg.wait_for_timeout(300)
        ok(await ev("window.__copie[window.__copie.length - 1]") == 'CHHiP, Lancet Oncol 17:1047, 2016, PMID 27339115', '« Copier la référence » : acronyme, revue, année, PMID', await ev("window.__copie[window.__copie.length - 1]"))
        ok('Source institutionnelle' in await ev(OC) and 'Institut Curie' in await ev(OC), 'source institutionnelle sous les essais')
        # Points d'attention
        await aller(pg, 'radiotherapie/s/pro-fav-60-20/attention')
        pts = await ev("[...document.querySelectorAll('.rtr-pts li')].map(l => l.textContent)")
        ok(len(pts) > 5 and len(set(pts)) == len(pts) and any('CHHiP' in x for x in pts) and any('IGRT quotidienne' in x for x in pts), 'Points d\'attention : ceux du schéma et de la localisation, sans doublon', len(pts))
        # Version du cabinet
        await aller(pg, 'radiotherapie/s/pro-def-60-20/prescription')
        t = await ev("document.getElementById('rtrFiche').innerText")
        ok('Modifié pour le cabinet' in t and 'par Dr Médecin Test le 25/10/2026' in t and 'La référence a changé depuis' in t and 'Note du médecin' in t, 'version du cabinet : ligne « Modifié pour le cabinet », auteur, date, référence changée, note')
        # Lien vers Protocoles
        await aller(pg, 'radiotherapie/s/oeso-cross-414-23/prescription')
        hrefs = await ev("[...document.querySelectorAll('.rtr-lien')].map(a => a.getAttribute('href'))")
        ok('#protocoles/oeso%7Ccross-test' in hrefs and any(h.startswith('#protocoles/loc/') for h in hrefs), 'Protocoles : nom exact → la fiche du protocole ; sinon la page filtrée sur la localisation', hrefs)
        await pg.click('.rtr-lien[href="#protocoles/oeso%7Ccross-test"]'); await pg.wait_for_timeout(1500)
        ok(await ev("[...document.querySelectorAll('#fenetre input')].some(i => i.value === 'Carboplatine-paclitaxel hebdomadaire (CROSS)')"), '« Ouvrir dans Protocoles › » : la fiche du protocole s\'ouvre')
        await ev("window.fermerFenetre()"); await pg.go_back(); await pg.wait_for_timeout(1800)
        ok((await ev("location.hash")).endswith('oeso-cross-414-23/prescription') and await ev("!!document.querySelector('.rtr-oc .rtr-tab')"), 'Retour : la fiche, sur le même onglet')
        await pg.click('.rtr-lien[href^="#protocoles/loc/"] >> nth=0'); await pg.wait_for_timeout(1500)
        ok(await ev("[...document.querySelectorAll('#page .cascade select')].map(s => s.value).filter(Boolean).length") >= 1 and 'Protocoles' in await ev("document.getElementById('titrePage').textContent"), 'nom absent de la bibliothèque : page Protocoles filtrée sur la localisation', await ev("[...document.querySelectorAll('#page .cascade select')].map(s => s.value)"))
        # Impression
        await aller(pg, 'radiotherapie/s/pro-fav-60-20/prescription')
        await pg.click('.rtr-imp'); await pg.wait_for_timeout(400)
        ok(await ev("document.querySelectorAll('.rtr-ic input:checked').length") == 6, 'Imprimer : six sections, toutes cochées')
        await pg.uncheck('.rtr-ic input[data-s=essais]'); await pg.click('#fenetre .bt.plein'); await pg.wait_for_timeout(900)
        doc = await ev("window.__win.length ? window.__win[window.__win.length - 1].w.document._h : ''")
        ok('size:A4 portrait' in doc and '<h2>Prescription</h2>' in doc and '<h2>Contraintes</h2>' in doc and '<h2>Essais et sources</h2>' not in doc and 'Imprimé le' in doc and 'Sources : CHHiP, PROFIT' in doc and 'class="rtr-aide"' not in doc and 'Limitant</b>' in doc, 'impression A4 : sections choisies, sources et date en pied de page, textes entiers (sans « ? »)')
        await aller(pg, 'radiotherapie/s/pro-def-60-20/prescription'); await pg.click('.rtr-imp'); await pg.wait_for_timeout(300); await pg.click('#fenetre .bt.plein'); await pg.wait_for_timeout(900)
        ok('Version du cabinet, modifiée le 25/10/2026' in await ev("window.__win[window.__win.length - 1].w.document._h"), 'impression d\'une version du cabinet : « Version du cabinet, modifiée le … » en tête')
        ok(not await ev(DEBORDE) and not await ev(COUPE), '1 440 px : sans débordement, titre entier')
        ok(not pg.errs, 'aucune erreur JavaScript (1 440 px)', pg.errs[:2]); await pg.close()
        # Formule sans chimiothérapie : nom du protocole sans lien
        S3 = json.loads(json.dumps(S2)); S3.setdefault(E[:-1], {})['abonnement'] = {'formule': 'radiotherapie', 'modules': {k: k in ['rt', 'agenda', 'prescriptions', 'documents', 'gagenda', 'listes', 'bilan'] for k in ['chimio', 'rt', 'agenda', 'salle', 'taches', 'rcp', 'prescriptions', 'documents', 'gagenda', 'listes', 'bilan']}}
        pg = await ouvrir(b, S3); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/oeso-cross-414-23/prescription'); await pg.wait_for_timeout(3000)
        ok(await ev("document.querySelectorAll('.rtr-lien').length") == 0 and 'Carboplatine-paclitaxel hebdomadaire (CROSS)' in await ev(OC), 'formule sans chimio : nom du protocole sans lien')
        ok(not pg.errs, 'formule sans chimio : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # 1 280 et 390 px
        for w, h in [(1280, 900), (390, 800)]:
            pg = await ouvrir(b, S2, w=w, h=h); ev = pg.evaluate
            for o in ['prescription', 'centrage', 'contourage', 'contraintes', 'essais', 'attention']:
                await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/col-rch-hdr-7x4/{o}'); await pg.wait_for_timeout(1800)
                if await ev(DEBORDE) or await ev(COUPE): ok(False, f'{w} px : {o} déborde'); break
            else: ok(True, f'{w} px : les six onglets sans débordement ni titre coupé')
            if w == 390:
                ok(await ev("document.querySelector('.rtr-imp').offsetParent === null && document.querySelector('.rtr-pts3').offsetParent !== null"), '390 px : Imprimer passe dans ⋯')
                await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/pro-fav-60-20/contraintes'); await pg.wait_for_timeout(1800)
                ok(await ev("document.querySelector('.rtr-ct thead').offsetParent === null") and not await ev(DEBORDE), '390 px : contraintes en lignes empilées, sans défilement horizontal')
            ok(not pg.errs, f'{w} px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
