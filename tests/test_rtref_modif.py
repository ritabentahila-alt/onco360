import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, RT5 (25/10/2026) : modification du référentiel de radiothérapie pour le cabinet (radiotherapie.js) : modifier sur place, contrôles pendant
# la saisie, champ changé surligné, « Quitter sans enregistrer ? », enregistrement en transaction (collègue entre-temps : rien d'écrasé), voir la
# référence (différences), revenir à la référence (10 s pour annuler), dupliquer, nouveau schéma, droits : médecin « modifier » / « voir »,
# secrétaire et infirmière « voir » (aucun bouton de modification), téléphone. Jeu fictif ; espaces/{e}/referentielRT dans le faux Firebase.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
K = E + 'referentielRT/'
DOC = lambda i: f"window.__fs['{K}{i}'] || null"
MSG = "document.getElementById('rtrBmsg').textContent"
async def fiche(pg, i, o='prescription', uid=None):
    await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie/s/{i}/{o}'); await pg.wait_for_timeout(2500)
async def menu3(pg, txt):
    await pg.click('.rtr-act details.rtr-pts3 > summary'); await pg.wait_for_timeout(150)
    if not await pg.evaluate("document.querySelector('.rtr-act details.rtr-pts3').open"): print('    (menu ⋯ fermé :', await pg.evaluate("[location.hash, document.activeElement && document.activeElement.outerHTML.slice(0, 80), !!document.querySelector('.or-dlg'), !!document.querySelector('#fenetre:not(.cache)')]"), ')')
    await pg.click(f'.rtr-act .m3-l button:has-text("{txt}")', timeout=5000); await pg.wait_for_timeout(400)
async def reponse(pg, txt):
    await pg.click(f'.or-dlg button:has-text("{txt}")'); await pg.wait_for_timeout(500)
def membre(role, niv):
    return {'role': role, 'actif': True, 'nom': role.upper() + ' Test', 'tousEtablissements': True, 'etablissements': [], 'droits': {'identite': True, 'referentielRT': niv}}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S); ev = pg.evaluate
        await fiche(pg, 'pro-fav-60-20')
        ok(await ev("!!document.querySelector('.rtr-mbt')") and await ev("document.querySelectorAll('#page .bt.plein').length") == 0, 'lecture : « Modifier pour le cabinet » (bouton clair), aucun bouton plein', await ev("[!!document.querySelector('.rtr-mbt'), [...document.querySelectorAll('#page .bt.plein')].map(b => b.outerHTML.slice(0, 80))]"))
        await pg.click('.rtr-mbt'); await pg.wait_for_timeout(400)
        ok(await ev("!!document.querySelector('[data-p=\"titre\"]')") and await ev("document.querySelectorAll('.rtr-ong button').length") == 6 and await ev(MSG) == 'Aucun changement' and await ev("document.getElementById('rtrEnr').disabled"), 'modification sur place : titre en champ, mêmes onglets, barre du bas « Aucun changement »')
        await pg.fill('[data-p="prescriptions.0.dose_fx_Gy"]', '2,9'); await pg.wait_for_timeout(150)
        ok('Dose par séance différente' in await ev("document.querySelector('[data-err=\"prescriptions.0\"]').textContent") and await ev("document.getElementById('rtrEnr').disabled") and await ev("document.querySelectorAll('.rtr-err:not([hidden])').length") == 1, 'contrôle sous la ligne pendant la saisie ; « Enregistrer » inactif, avec la raison', await ev(MSG))
        await pg.fill('[data-p="prescriptions.0.dose_fx_Gy"]', '0'); await pg.wait_for_timeout(150)
        ok('supérieur à 0' in await ev("document.querySelector('[data-err=\"prescriptions.0\"]').textContent"), 'nombre nul refusé')
        await pg.fill('[data-p="prescriptions.0.dose_fx_Gy"]', '3'); await pg.fill('[data-p="prescriptions.0.rythme"]', '4 fx/sem'); await pg.fill('[data-p="note"]', 'Notre pratique (note fictive)'); await pg.wait_for_timeout(150)
        ok(await ev(MSG) == '2 changements' and not await ev("document.getElementById('rtrEnr').disabled") and await ev("document.querySelector('[data-p=\"prescriptions.0.rythme\"]').classList.contains('mod')") and not await ev("document.querySelector('[data-p=\"prescriptions.0.volume\"]').classList.contains('mod')"), '« 2 changements » ; champ changé surligné, les autres non', await ev(MSG))
        # Changer d'onglet pendant la modification : la saisie reste
        await pg.click('.rtr-ong button:has-text("Contraintes")'); await pg.wait_for_timeout(300)
        ok(await ev("document.querySelectorAll('.rtr-ctedit input[data-p$=\".limitant\"]').length") > 10 and await ev(MSG) == '2 changements', 'onglet Contraintes en modification : la table, chaque valeur modifiable ; la saisie est gardée')
        ok(await ev("!!document.querySelector('.rtr-oc [data-p=\"couverture\"]') && document.querySelector('.rtr-oc .rtr-lab').contains(document.querySelector('[data-p=\"couverture\"]'))"), 'onglet Contraintes en modification : les objectifs de couverture en premier')
        await pg.click('.rtr-ong button:has-text("Prescription")'); await pg.wait_for_timeout(300)
        ok(not await ev("!!document.querySelector('.rtr-oc [data-p=\"couverture\"]')"), 'onglet Prescription en modification : plus de champ des objectifs de couverture')
        # Quitter sans enregistrer
        await pg.click('nav a[data-p="patients"]'); await pg.wait_for_timeout(500)
        ok(await ev("!!document.querySelector('.or-dlg')") and 'Quitter sans enregistrer' in await ev("document.querySelector('.or-dlg').innerText"), 'changer de page : « Quitter sans enregistrer ? »')
        await reponse(pg, 'Rester')
        ok((await ev("location.hash")).startswith('#radiotherapie') and await ev("document.querySelector('[data-p=\"prescriptions.0.rythme\"]').value") == '4 fx/sem', '« Rester » : la saisie est conservée')
        # Enregistrer
        await pg.click('#rtrEnr'); await pg.wait_for_timeout(1500)
        d = await ev(DOC('pro-fav-60-20'))
        ok(d and d['origine'] == 'cabinet' and d['majPar'] == 'UIDRITA' and d['base'] == '2026-10-22' and d['schema']['prescriptions'][0]['rythme'] == '4 fx/sem' and d['schema']['prescriptions'][0]['dose_fx_Gy'] == 3 and d['note'] == 'Notre pratique (note fictive)' and d['schema']['ind'][1] == 'Prostate', 'enregistré : schéma complet, origine cabinet, base = date de la référence, auteur, note', d and {k: d[k] for k in d if k != 'schema'})
        t = await ev("document.getElementById('rtrFiche').innerText")
        ok('Enregistré pour le cabinet' in await ev("document.body.innerText") and 'Modifié pour le cabinet' in t and '4 fx/sem' in t and not await ev("!!document.getElementById('rtrEnr')"), 'après l\'enregistrement : « Enregistré pour le cabinet », la ligne « Modifié pour le cabinet », retour en lecture')
        # Voir la référence
        await menu3(pg, 'Voir la référence')
        ok(await ev("document.querySelectorAll('.rtr-cmp tr.diff').length") == 2 and 'Version du cabinet' in await ev("document.getElementById('fenetre').innerText"), 'Voir la référence : deux colonnes, 2 différences surlignées (prescription, note)', await ev("document.querySelectorAll('.rtr-cmp tr.diff').length"))
        await ev("window.fermerFenetre()")
        # Collègue entre-temps : rien n'est écrasé
        await pg.click('.rtr-mbt'); await pg.wait_for_timeout(300); await pg.fill('[data-p="technique"]', 'Changement de moi'); await pg.wait_for_timeout(100)
        await ev(f"window.__fs['{K}pro-fav-60-20'] = Object.assign({{}}, window.__fs['{K}pro-fav-60-20'], {{ majPar: 'UIDAUTRE', majParNom: 'Dr Collègue', majLe: '2026-10-25T11:00:00Z', note: 'Changement du collègue' }})")
        await pg.click('#rtrEnr'); await pg.wait_for_timeout(1500)
        d = await ev(DOC('pro-fav-60-20'))
        ok(d['majPar'] == 'UIDAUTRE' and d['note'] == 'Changement du collègue' and 'rien n\'a été écrasé' in await ev("document.body.innerText") and not await ev("!!document.getElementById('rtrEnr')"), 'modifiée par un collègue entre-temps : rien n\'est écrasé, la fiche est rechargée avec un message')
        # Revenir à la référence : annuler pendant 10 s, puis pour de bon
        await fiche(pg, 'pro-fav-60-20')
        await menu3(pg, 'Revenir à la référence')
        ok('seront supprimées pour tout le cabinet' in await ev("document.querySelector('.or-dlg').innerText"), 'Revenir à la référence : la confirmation dit ce qui sera perdu')
        await reponse(pg, 'Revenir à la référence')
        ok('5 fx/sem' in await ev("document.getElementById('rtrFiche').innerText") and await ev("!!document.querySelector('.rtr-annul')") and await ev(DOC('pro-fav-60-20')), 'la référence s\'affiche, « Annuler » proposé ; rien n\'est encore supprimé')
        await pg.click('.rtr-annul button'); await pg.wait_for_timeout(800)
        ok('Modifié pour le cabinet' in await ev("document.getElementById('rtrFiche').innerText") and await ev(DOC('pro-fav-60-20')), '« Annuler » : la version du cabinet revient')
        await menu3(pg, 'Revenir à la référence'); await reponse(pg, 'Revenir à la référence'); await pg.wait_for_timeout(10800)
        ok(await ev(DOC('pro-fav-60-20')) is None and not await ev("!!document.querySelector('.rtr-annul')"), 'après 10 secondes : la fiche du cabinet est supprimée')
        # Dupliquer
        await fiche(pg, 'pro-fav-60-20'); await menu3(pg, 'Dupliquer'); await pg.wait_for_timeout(1200)
        ok(await ev("location.hash") == '#radiotherapie/nouveau' and await ev("document.activeElement.dataset.p") == 'titre' and await ev("document.activeElement.value") == 'Copie de 60 Gy / 20 fx', 'Dupliquer : la copie en modification, « Copie de … » sélectionné')
        await pg.fill('[data-p="titre"]', '60 Gy / 20 fx (copie fictive)'); await pg.click('#rtrEnr'); await pg.wait_for_timeout(2000)
        cle = await ev(f"Object.keys(window.__fs).find(k => k.startsWith('{K}cab-'))")
        d = await ev(f"window.__fs['{cle}']") if cle else None
        ok(d and d['nouveau'] and d['copie_de'] == 'pro-fav-60-20' and d['schema']['preuve'] == 'pratique_du_cabinet' and (await ev("location.hash")).startswith('#radiotherapie/s/cab-'), 'copie enregistrée : cab-…, nouveau, copie_de, preuve « Pratique du cabinet »', d and {k: d[k] for k in d if k != 'schema'})
        await ev("location.hash='radiotherapie'"); await pg.wait_for_timeout(600); await pg.fill('#rtrQ', 'copie fictive'); await pg.wait_for_timeout(300)
        ok(await ev("[...document.querySelectorAll('#rtrListe .rtr-l b')].map(b => b.innerText)") == ['60 Gy / 20 fx (copie fictive)'], 'la copie est dans la liste')
        # Nouveau schéma
        await pg.click('.rtr-mz .bt.gris'); await pg.select_option('#rtr_loc', 'prostate'); await pg.wait_for_timeout(200); await pg.select_option('#rtr_sit', 'pro-ep-fav'); await pg.wait_for_timeout(200)
        await pg.click('.rtr-nouv'); await pg.wait_for_timeout(300)
        ok(await ev("[document.getElementById('rtrNL').value, document.getElementById('rtrNS').value]") == ['prostate', 'pro-ep-fav'], '« + Nouveau schéma » : localisation et situation des menus')
        await pg.click('#fenetre .bt.plein'); await pg.wait_for_timeout(1500)
        ok(await ev("document.getElementById('rtrEnr').disabled") and 'titre' in await ev(MSG), 'nouveau schéma : titre obligatoire', await ev(MSG))
        await pg.fill('[data-p="titre"]', 'Schéma fictif 62 Gy / 20 fx'); await pg.fill('[data-p="prescriptions.0.volume"]', 'PTV_PRO'); await pg.fill('[data-p="prescriptions.0.dose_Gy"]', '62'); await pg.fill('[data-p="prescriptions.0.fractions"]', '20'); await pg.fill('[data-p="prescriptions.0.dose_fx_Gy"]', '3,1')
        await pg.click('.rtr-aj'); await pg.wait_for_timeout(200)
        ok(await ev("document.querySelectorAll('[data-p$=\".volume\"]').length") == 2, '« + Ajouter une ligne »')
        await pg.evaluate("document.querySelectorAll('.rtr-edt details.m3')[1].open = true"); await pg.wait_for_timeout(150); await pg.click('.rtr-edt details.m3[open] .m3-l button'); await pg.wait_for_timeout(200)
        ok(await ev("document.querySelectorAll('[data-p$=\".volume\"]').length") == 1, 'une ligne se supprime par son ⋯')
        await pg.click('#rtrEnr'); await pg.wait_for_timeout(2000)
        n = await ev(f"Object.keys(window.__fs).filter(k => k.startsWith('{K}cab-')).map(k => window.__fs[k].schema.titre)")
        ok('Schéma fictif 62 Gy / 20 fx' in n and 'Schéma fictif 62 Gy / 20 fx' in await ev("document.getElementById('rtrFiche').innerText"), 'nouveau schéma enregistré et ouvert', n)
        ok(not pg.errs, 'aucune erreur JavaScript (médecin)', pg.errs[:2]); await pg.close()
        # Droits : médecin « voir », secrétaire et infirmière « voir » : tout lisible, aucun bouton de modification
        S2 = json.loads(json.dumps(S)); S2[K + 'pro-fav-60-20'] = {'schema': {'id': 'pro-fav-60-20', 'situation_id': 'pro-ep-fav', 'titre': '60 Gy / 20 fx (cabinet)', 'type': 'rte_hypo', 'preuve': 'essai_phase3', 'essai_ids': ['chhip'], 'prescriptions': [{'volume': 'PTV_PRO', 'dose_Gy': 60, 'fractions': 20, 'dose_fx_Gy': 3}], 'contraintes_ids': []}, 'localisation_id': 'prostate', 'origine': 'cabinet', 'base': '2026-10-22', 'majPar': 'UIDRITA', 'majParNom': 'Dr Médecin Test', 'majLe': '2026-10-25T09:00:00Z'}
        for uid, role, lib in [('UIDMEDV', 'medecin', 'médecin « voir »'), ('UIDSECV', 'assistante', 'secrétaire « voir »'), ('UIDINFV', 'infirmiere', 'infirmière « voir »')]:
            S3 = json.loads(json.dumps(S2)); S3[E + 'membres/' + uid] = membre(role, 'voir')
            pg = await ouvrir(b, S3); await pg.add_init_script(f"window.__uid='{uid}'"); ev = pg.evaluate
            await fiche(pg, 'pro-fav-60-20')
            ok('60 Gy / 20 fx (cabinet)' in await ev("document.getElementById('rtrFiche').innerText") and await ev("!document.querySelector('.rtr-mbt') && !document.querySelector('.rtr-nouv') && ![...document.querySelectorAll('.rtr-act .m3-l button')].some(b => /Dupliquer|Revenir|Modifier/.test(b.textContent))"), lib + ' : fiche lisible, aucun bouton Modifier, Dupliquer, Revenir, Nouveau')
            ok(await ev("[...document.querySelectorAll('.rtr-act .m3-l button')].some(b => /Voir la référence/.test(b.textContent))"), lib + ' : « Voir la référence » possible')
            ok(not pg.errs, lib + ' : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Téléphone : modification sans débordement, Modifier dans ⋯
        pg = await ouvrir(b, S, w=390, h=800); ev = pg.evaluate
        await fiche(pg, 'col-rch-hdr-7x4')
        await menu3(pg, 'Modifier pour le cabinet')
        ok(await ev("!!document.getElementById('rtrEnr')") and await ev("document.documentElement.scrollWidth <= innerWidth + 1"), '390 px : Modifier dans ⋯ ; modification sans débordement')
        ok(await ev("document.getElementById('rtrEnr').getBoundingClientRect().bottom <= innerHeight"), '390 px : barre du bas visible')
        ok(not pg.errs, '390 px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
