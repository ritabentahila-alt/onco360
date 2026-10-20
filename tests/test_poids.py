import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-A5 (18/10/2026, demande du 17/10) : le poids de la fiche patient = celui de la dernière séance de chimio. Poids actuel affiché (fiche,
# bandeau, ordonnance) avec sa date ; écrit dans la fiche (clinique.poids, clinique.poidsLe, rien d'autre) quand la séance est enregistrée par
# quelqu'un qui a le droit ; secrétaire (droit « planning » + « fiche patient ») aussi ; doses et autres champs de la fiche inchangés.
# Patients fictifs seulement.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
S2[E + 'parametres/reglages'] = {'data': json.dumps({'impression': {'poids': True, 'age': True}})}
P2 = PIDS[1]
S2[E + 'bibliotheques/courriers'] = {'data': json.dumps([{'id': 'cT', 'nom': 'Courrier de test', 'html': '<p>Patient {patient} ; poids {poids} ; diagnostic {diagnostic} ; mutuelle {mutuelle} ; CIN {cin} ; lieu {lieu}</p>'}])}
S2[E + 'patients/' + P2]['clinique'] = dict(S2[E + 'patients/' + P2]['clinique'], poids='78', poidsLe='2026-07-01')
S2[E + 'patients/' + P2]['identite'] = dict(S2[E + 'patients/' + P2]['identite'], prenom='Deux', nom='PATIENT TEST 2 Deux')  # « Modifier » exige un prénom
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P2}'); await pg.wait_for_timeout(3500)
        fiche = lambda: ev(f"window.__fs['{E}patients/{P2}'].clinique")
        c0 = await fiche()
        page = await ev("document.getElementById('page').innerText")
        ok('78 kg' in page, 'avant : le poids de la fiche (78 kg) dans le dossier')
        # Séance du jour (C4 J1) : poids 75 saisi puis validé
        lid = json.loads(await ev(f"window.__fs['{E}patients/{P2}'].lignesJson"))[0]['id']
        await ev(f"chOuvrir('{P2}', 0, 3, 1)"); await pg.wait_for_timeout(1200)
        await ev(f"chChamp('{P2}', 0, 3, 'poids', '75', 1)"); await pg.wait_for_timeout(1500)
        await ev(f"chValiderJ1('{P2}', 0, 3)"); await pg.wait_for_timeout(2500); await plus_tard(pg)
        L = json.loads(await ev(f"window.__fs['{E}patients/{P2}'].lignesJson"))[0]
        ok(L['cures'][3].get('st') == 'recue' and str(L['cures'][3].get('fige', {}).get('poids')) == '75', 'C4 validée, figée à 75 kg (dose calculée sur la séance, comme avant)', L['cures'][3].get('fige', {}).get('poids'))
        c1 = await fiche()
        ok(c1.get('poids') == '75' and str(c1.get('poidsLe')).startswith('2026-10-06'), 'fiche patient : poids 75 kg daté du 06/10/2026 (dernière séance)', {k: c1.get(k) for k in ('poids', 'poidsLe')})
        autres = {k: v for k, v in c0.items() if k not in ('poids', 'poidsLe')}
        ok(all(c1.get(k) == v for k, v in autres.items()) and set(c1) - set(c0) <= {'poidsLe'}, 'fiche patient : aucun autre champ touché (diagnostic, notes…)', [k for k in c1 if c1.get(k) != c0.get(k)])
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P2}'); await pg.wait_for_timeout(2000)
        page = await ev("document.getElementById('page').innerText")
        ok('75 kg (C4 J1 du 06/10/2026)' in page, 'dossier : « 75 kg (C4 J1 du 06/10/2026) »', page[:400])
        # Fiche (Afficher) et Modifier : poids actuel
        await ev(f"afficherIdentite && afficherIdentite('{P2}')") if await ev("typeof afficherIdentite === 'function'") else None
        await ev(f"modifierIdentite('{P2}','med')"); await pg.wait_for_timeout(800)
        ok(await ev("(document.getElementById('fPoids')||{}).value") == '75', '« Modifier » : poids proposé = 75 (dernière séance)', await ev("(document.getElementById('fPoids')||{}).value"))
        await ev("fermerFenetre()")
        # Ordonnance : âge et poids (réglage Impression) avec la date
        await ev(f"orProtocole('{P2}', [], {{}})"); await pg.wait_for_timeout(1200)
        await ev("(document.querySelector('[data-ot]')||{click(){}}).click()"); await ev("(document.getElementById('orPcOk')||{click(){}}).click()"); await pg.wait_for_timeout(1500)
        o = await ev("(document.getElementById('orPage')||{}).innerText||''")
        ok('75 kg (06/10/2026)' in o, 'ordonnance : « 75 kg (06/10/2026) » sous le nom du patient', o[:300])
        await ev("fermerFenetre()")
        # Courrier : {poids} rempli avec la date, et les champs voisins toujours remplis
        await ev(f"ordCourriers('{P2}')"); await pg.wait_for_timeout(1000); await ev("crUtiliser('cT')"); await pg.wait_for_timeout(1200)
        o = await ev("(document.getElementById('orPage')||{}).innerText||''")
        ok('poids 75 kg (06/10/2026)' in o, 'courrier : {poids} = « 75 kg (06/10/2026) »', o[:300])
        ok('Cancer du côlon' in o and 'CIN DEMO2' in o and 'mutuelle ' in o and 'À compléter : mutuelle' not in o and 'Clinique de démonstration' in o, 'courrier : {diagnostic}, {mutuelle}, {cin}, {lieu} toujours remplis', o[:300])
        await ev("fermerFenetre()")
        # Plus tard, poids saisi à la main dans la fiche (le 06/10 aussi) : la fiche passe devant
        await pg.clock.set_fixed_time("2026-10-06T10:30:00")  # une demi-heure après la validation
        await ev(f"modifierIdentite('{P2}','med')"); await pg.wait_for_timeout(800); await pg.fill('#fPoids', '76'); await ev("document.getElementById('fOk').click()"); await pg.wait_for_timeout(1500)
        c2 = await fiche()
        ok(c2.get('poids') == '76' and str(c2.get('poidsLe')).startswith('2026-10-06') and str(c2.get('poidsLe')) > str(c1.get('poidsLe')), 'poids changé à la main dans la fiche : 76 kg, daté d\'aujourd\'hui', {k: c2.get(k) for k in ('poids', 'poidsLe')})
        page = await ev("document.getElementById('page').innerText")
        ok('76 kg (le 06/10/2026)' in page, 'dossier après la correction à la main : « 76 kg (le 06/10/2026) » (la fiche passe devant la séance du matin)', page[:300])
        ok(not pg.errs, 'aucune erreur JavaScript (médecin)', pg.errs[:2]); await pg.close()
        # Secrétaire (droit « planning » et « fiche patient ») : poids pesé et validé, la fiche suit ; sans le droit « fiche patient » : non
        for droit_fiche in (True, False):
            S3 = json.loads(json.dumps(S2)); u = 'SEC'
            S3[E + 'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {"traitements": "voir", "planningChimio": True, "fichePatient": droit_fiche, "rendezvous": True}}
            S3['utilisateurs/SEC'] = {"nom": "SEC", "prenom": "Test"}
            pg = await ouvrir(b, S3); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P2}'); await pg.wait_for_timeout(3500)
            await ev(f"chOuvrir('{P2}', 0, 3, 1)"); await pg.wait_for_timeout(1200)
            await ev(f"chChamp('{P2}', 0, 3, 'poids', '74', 1)"); await pg.wait_for_timeout(2000)
            pl = json.loads(await ev(f"window.__fs['{E}patients/{P2}'].planningJson") or '{}')
            cs = await ev(f"window.__fs['{E}patients/{P2}'].clinique")
            ok(str(((pl.get(lid) or {}).get('4') or {}).get('poids')) == '74', ('secrétaire avec' if droit_fiche else 'secrétaire sans') + ' le droit « fiche patient » : poids de la séance validé (74 kg)', pl)
            if droit_fiche: ok(cs.get('poids') == '74' and str(cs.get('poidsLe')).startswith('2026-10-06'), 'secrétaire avec le droit « fiche patient » : la fiche suit (74 kg)', cs)
            else: ok(cs.get('poids') == '78', 'secrétaire sans le droit « fiche patient » : fiche non écrite (le médecin la mettra à jour)', cs.get('poids'))
            ok(not pg.errs, 'aucune erreur JavaScript (secrétaire)', pg.errs[:2]); await pg.close()
        # Téléphone
        pg = await ouvrir(b, S2, w=390, h=800); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P2}'); await pg.wait_for_timeout(3000)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : dossier sans débordement')
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
