import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Journal d'audit (étape 9 S1, 09/10/2026) : onglet du titulaire, filtres, export, bouton « Journal » du dossier ; caché à la secrétaire.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
pats = [k.split('/')[-1] for k in S if k.startswith(E + 'patients/')][:2]
S2 = dict(S); A_ = 'audit/cabinet-bentahila/lignes/'
nm = lambda pid: (json.loads(S[E + 'patients/' + pid].get('resume') or '{}').get('nm') or 'X')
S2[A_ + 'a1'] = {'type': 'modification', 'col': 'patients', 'lib': 'Dossier patient', 'docId': pats[0], 'element': '', 'quoi': ['Rendez-vous'], 'patientId': pats[0], 'patientNom': nm(pats[0]), 'par': 'UIDSEC', 'parNom': 'Sara SECRÉTAIRE', 'parRole': 'assistante', 'via': 'onco360', 'le': '2026-10-05T09:15:00.000Z'}
S2[A_ + 'a2'] = {'type': 'ouverture', 'col': 'patients', 'lib': 'Dossier patient', 'docId': pats[1], 'element': '', 'quoi': [], 'patientId': pats[1], 'patientNom': nm(pats[1]), 'par': 'UIDRITA', 'parNom': 'Dr Bentahila', 'parRole': 'medecin', 'via': 'onco360', 'le': '2026-10-06T08:00:00.000Z'}
S2[A_ + 'a3'] = {'type': 'suppression', 'col': 'patients', 'lib': 'Dossier patient', 'docId': 'PSUPPR', 'element': '', 'quoi': [], 'patientId': 'PSUPPR', 'patientNom': 'ANCIEN Patient', 'par': 'UIDRITA', 'parNom': 'Dr Bentahila', 'parRole': 'medecin', 'via': 'onco360', 'le': '2026-10-04T08:00:00.000Z'}
S2[A_ + 'a4'] = {'type': 'creation', 'col': 'consultations', 'lib': 'Consultation', 'docId': 'C1', 'element': 'Consultation de suivi', 'quoi': [], 'patientId': pats[0], 'patientNom': nm(pats[0]), 'par': '', 'pour': 'UIDSEC', 'parNom': 'Sara SECRÉTAIRE', 'parRole': 'assistante', 'via': 'serveur', 'le': '2026-09-01T08:00:00.000Z'}
S2[E + 'membres/UIDSEC'] = {'role': 'assistante', 'actif': True, 'nom': 'Sara SECRÉTAIRE', 'tousEtablissements': True, 'etablissements': [], 'droits': {}}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await ouvrir(b, S2)
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/audit'); await pg.wait_for_timeout(2500)
        t = await pg.inner_text('#page')
        ok("Journal d'audit" in t and 'Sara SECRÉTAIRE' in t, 'onglet « Journal d\'audit » du titulaire')
        ok(await pg.evaluate("document.querySelectorAll('.au-t tr').length") == 4, '7 derniers jours : 3 lignes (la ligne du 01/09 hors période)')
        ok('Rendez-vous' in t and 'ANCIEN Patient' in t and 'Suppression' in t and 'Ouverture' in t, 'modification (partie touchée), suppression (nom gardé), ouverture')
        await pg.select_option('#auAct', 'suppression'); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("document.querySelectorAll('.au-t tr').length") == 2, 'filtre Action : suppressions')
        await pg.select_option('#auAct', ''); await pg.fill('#auDu', '2026-08-01'); await pg.dispatch_event('#auDu', 'change'); await pg.wait_for_timeout(500)
        t = await pg.inner_text('#page')
        ok(await pg.evaluate("document.querySelectorAll('.au-t tr').length") == 5 and 'Onco360 (serveur) pour Sara' in t, 'période élargie : 4 lignes, écriture du serveur pour la secrétaire')
        await pg.select_option('#auQui', 'UIDSEC'); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("document.querySelectorAll('.au-t tr').length") == 3, 'filtre Personne : la secrétaire (2 lignes)')
        async with pg.expect_download() as dl: await pg.click('#auCsv')
        d = await dl.value; txt = open(await d.path(), encoding='utf-8-sig', newline='').read()
        ok(d.suggested_filename.startswith('Journal_audit_') and txt.count('\r\n') == 2 and 'Rendez-vous' in txt, 'export Excel (en-tête + 2 lignes)')
        # Bouton « Journal » du dossier
        await pg.evaluate(f"location.hash='dossier/{pats[0]}'"); await pg.wait_for_timeout(1200)
        # Lot A (25/10/2026) : « Journal » sous le « ⋯ » à côté du nom, dans le bloc patient
        await pg.click('.bp-l1 .sa-plus'); await pg.wait_for_timeout(200); await pg.click('#ptsMenuF button:has-text("Journal")'); await pg.wait_for_timeout(1200)
        t = await pg.inner_text('#page')
        ok(pg.url.endswith('#parametres/audit') and 'Tous les patients' in t and await pg.evaluate("document.querySelectorAll('.au-t tr').length") == 3, 'Journal du dossier : 2 lignes de ce patient')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("document.documentElement.scrollWidth<=390"), '390 px : rien ne déborde')
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        # Secrétaire : ni onglet, ni bouton
        ps = await ouvrir(b, S2); await ps.add_init_script("window.__uid='UIDSEC'")
        await ps.goto(f'http://localhost:{PORT}/v2.html#parametres'); await ps.wait_for_timeout(2000)
        ok("Journal d'audit" not in await ps.inner_text('#page'), 'secrétaire : pas d\'onglet Journal d\'audit')
        await ps.evaluate(f"location.hash='dossier/{pats[0]}'"); await ps.wait_for_timeout(1200)
        ok(await ps.evaluate("![...document.querySelectorAll('#page button')].some(b=>b.innerText.trim()==='Journal')"), 'secrétaire : pas de bouton Journal dans le dossier')
        await b.close()
asyncio.run(main())
