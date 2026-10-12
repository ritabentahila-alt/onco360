import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 3.4 (12/10/2026) : formulaires de consultation proposés (oncologie, RT hebdomadaire) selon le type ; « formulaire simple » ; note signée,
# « modifiée le … » ; note du secrétariat dans le même journal.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
HOP = S[E + 'patients/' + pid].get('etablissementId') or 'HGC'
vis = "(id)=>{const e=document.getElementById(id);return !!e&&e.closest('[data-cs]').style.display!=='none'}"
cs_de = lambda fs: sorted([dict(v, id=k) for k, v in fs.items() if k.startswith(E + 'consultations/') and v.get('patientId') == pid], key=lambda c: c.get('o', 0))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Médecin : formulaire selon le type de consultation')
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(600)
        await pg.select_option('#csType', 'Consultation de suivi'); await ev("document.getElementById('csType').dispatchEvent(new Event('change'))")
        v = await ev(f"[['cx_xcspoids','cx_xcsoms','cx_xcseva','cx_xcsnau','cx_xcsnf','cx_xcscat','cx_xcsrrd'].map(({vis}))]")
        ok(v[0] == [True, True, True, True, True, True, False], 'suivi : poids, OMS, EVA, toxicités, neutropénie fébrile, conduite à tenir ; pas la RT', v)
        await pg.select_option('#csType', 'Consultation en cours de radiothérapie'); await ev("document.getElementById('csType').dispatchEvent(new Event('change'))")
        v = await ev(f"[['cx_xcsnau','cx_xcsrrd','cx_xcsrmu','cx_xcsrdy','cx_xcsrcy'].map(({vis}))]")
        ok(v[0] == [False, True, True, True, True], 'en cours de RT : radiodermite, mucite, dysphagie, cystite ; pas le formulaire d\'oncologie', v)
        await pg.select_option('#csType', "Consultation d'annonce"); await ev("document.getElementById('csType').dispatchEvent(new Event('change'))")
        ok(not await ev(f"({vis})('cx_xcsnau')") and not await ev(f"({vis})('cx_xcsrrd')"), 'annonce : titre, date et note seulement')
        await pg.select_option('#csType', 'Consultation de suivi'); await ev("document.getElementById('csType').dispatchEvent(new Event('change'))")
        await pg.select_option('#cx_xcsnau', '2'); await pg.select_option('#cx_xcsoms', '1'); await pg.fill('#csNote', 'Bonne tolérance.')
        await pg.click('#csOk'); await pg.wait_for_timeout(1500)
        c = cs_de(await ev("window.__fs"))[-1]
        ok(c.get('type') == 'Consultation de suivi' and c.get('extra', {}).get('xcsnau') == '2' and c['extra'].get('xcsoms') == '1' and not c.get('modifs'), 'enregistrée : nausées grade 2, OMS 1 ; pas de « modifiée » (auteur, le jour même)', c)
        t = await pg.inner_text('#op-co')
        ok('Nausées' in t and 'Signée le' in t and 'modifiée' not in t, 'journal : valeurs du formulaire et « Signée le … par … »', t[:400])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); S2 = json.loads(json.dumps(await ev("window.__fs"))); await pg.close()

        print('Modification un autre jour : « modifiée le … »')
        k = [kk for kk, vv in S2.items() if kk.startswith(E + 'consultations/') and vv.get('patientId') == pid][-1]
        S2[k]['o'] = S2[k].get('o', 0) - 3 * 86400000  # créée il y a 3 jours
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        cid = k.split('/')[-1]
        await ev(f"csModifier('{pid}','{cid}')"); await pg.wait_for_timeout(500); await pg.fill('#csNote', 'Bonne tolérance. Poursuite.'); await pg.click('#csOk'); await pg.wait_for_timeout(1500)
        c = (await ev("window.__fs"))[k]
        ok(len(c.get('modifs', [])) == 1, 'une modification notée (date, auteur), sans ancienne version', c.get('modifs'))
        ok('modifiée le' in await pg.inner_text('#op-co'), '« Signée le … · modifiée le … » affiché')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Secrétaire : note du secrétariat dans le même journal')
        S3 = json.loads(json.dumps(S))
        S3[E + 'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {"ecrireConsultations": True, "consultations": True, "rendezvous": True, "identite": True, "fichePatient": True}}
        S3['utilisateurs/SEC'] = {"nom": "SEC"}
        pg = await ouvrir(b, S3); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(500)
        ok(await ev("document.getElementById('csType').value") == 'Note du secrétariat' and not await ev(f"({vis})('cx_xcsnau')"), 'type « Note du secrétariat » proposé d\'office, sans formulaire médical')
        await pg.fill('#csNote', 'Patient appelé : rendez-vous confirmé.'); await pg.click('#csOk'); await pg.wait_for_timeout(1500)
        c = cs_de(await ev("window.__fs"))[-1]
        ok(c.get('type') == 'Note du secrétariat' and c.get('creePar') == 'SEC', 'enregistrée dans le journal des consultations', c)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Paramètres › Formulaire de consultation : formulaire simple')
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/consultation'); await pg.wait_for_timeout(2000)
        t = await pg.inner_text('#page')
        ok('Nausées' in t and 'Radiodermite' in t and "consultation d'oncologie" in t and 'RT hebdomadaire' in t, 'formulaires proposés listés (oncologie, RT hebdomadaire)', t[:400])
        await ev("document.getElementById('cqSimple').click()"); await pg.wait_for_timeout(300); await ev("cfEnregistrer()"); await pg.wait_for_timeout(1500)
        fo = json.loads((await ev("window.__fs")).get(E + 'parametres/formulaires', {}).get('data') or '{}').get('consultation', {})
        ok(fo.get('champs', {}).get('xcsnau') is False and fo['champs'].get('xcsrrd') is False, 'formulaire simple enregistré (champs proposés retirés)', fo)
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2000)
        await ev(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(500)
        ok(not await ev("!!document.getElementById('cx_xcsnau')") and await ev("!!document.getElementById('csNote')"), 'nouvelle consultation : type, date, titre et note seulement')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
