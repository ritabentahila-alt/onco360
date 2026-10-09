import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Fiche patient réglable (étape 16, 10/10/2026) : ordre, champ retiré (valeur gardée), champs ajoutés (saisie, affichage, en-tête,
# impression sur la fiche chimio) ; sans réglage, la fiche d'oncologie est inchangée ; écran du pack dans l'Administration.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
GS = {'id': 'xgs001', 'lib': 'Groupe sanguin', 'type': 'choix', 'choix': ['A+', 'O+', 'B-'], 'partie': 'clinique', 'imprimer': True, 'entete': True}
MT = {'id': 'xmt001', 'lib': 'Médecin traitant', 'type': 'texte', 'choix': [], 'partie': 'identite', 'imprimer': True, 'entete': False}
S2 = dict(S); e = dict(S2[E[:-1]])
e['abonnement'] = {'formule': 'complet', 'modules': {k: True for k in ['chimio', 'rt', 'agenda', 'salle', 'taches', 'rcp', 'prescriptions', 'documents', 'gagenda', 'listes', 'bilan']}, 'max': {},
  'reglage': {'fiche': {'ordre': ['mut', 'nom', 'prenom'], 'champs': {'ald': False}, 'ajouts': [GS, MT]}}}
S2[E[:-1]] = e
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('lignesJson') or '') > 50][0]
P0 = dict(S2[E + 'patients/' + pid]); I0 = dict(P0['identite']); I0['ald'] = 'Oui'; P0['identite'] = I0; S2[E + 'patients/' + pid] = P0
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Sans réglage : fiche d'oncologie inchangée
        p0 = await ouvrir(b); await p0.goto(f'http://localhost:{PORT}/v2.html#patients'); await p0.wait_for_timeout(2000)
        await p0.evaluate("nouveauPatient()"); await p0.wait_for_timeout(400)
        k0 = await p0.evaluate("[...document.querySelectorAll('#fenetre .form > [data-champ]')].filter(e=>e.style.display!=='none').map(e=>e.dataset.champ)")
        ok(k0[:4] == ['nom', 'prenom', 'ddn', 'sexe'] and 'ald' in k0 and not any(k.startswith('x') for k in k0), 'sans réglage : fiche inchangée (ordre d\'aujourd\'hui, ALD présent, aucun champ ajouté)')
        # Avec réglage
        pg = await ouvrir(b, S2); await pg.goto(f'http://localhost:{PORT}/v2.html#patients'); await pg.wait_for_timeout(2000)
        await pg.evaluate("nouveauPatient()"); await pg.wait_for_timeout(400)
        k1 = await pg.evaluate("[...document.querySelectorAll('#fenetre .form > [data-champ]')].filter(e=>e.style.display!=='none').map(e=>e.dataset.champ)")
        ok(k1[0] == 'mut' and 'ald' not in k1 and 'xgs001' in k1 and 'xmt001' in k1, 'Nouveau patient : Mutuelle en premier, ALD retiré, 2 champs ajoutés ' + str(k1[:4]))
        await pg.fill('#pNom', 'Fiche'); await pg.fill('#pPre', 'Essai'); await pg.select_option('#fx_xgs001', 'O+'); await pg.fill('#fx_xmt001', 'Dr Alami')
        await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        fs = await pg.evaluate("window.__fs"); np = [v for k, v in fs.items() if k.startswith(E + 'patients/') and (v.get('identite') or {}).get('nomF') == 'FICHE']
        ok(np and np[0]['identite'].get('extra', {}).get('xmt001') == 'Dr Alami' and np[0]['clinique'].get('extra', {}).get('xgs001') == 'O+', 'création : champs ajoutés enregistrés (identité et fiche clinique)')
        # Modifier un patient existant : ALD caché mais gardé
        await pg.evaluate(f"location.hash='dossier/{pid}'"); await pg.wait_for_timeout(1500)
        await pg.evaluate(f"modifierIdentite('{pid}')"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("document.querySelector('#fenetre [data-champ=\"ald\"]').style.display") == 'none', 'Modifier : ALD caché')
        await pg.select_option('#fx_xgs001', 'A+'); await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        d = await pg.evaluate(f"window.__fs['{E}patients/{pid}']")
        ok(d['clinique'].get('extra', {}).get('xgs001') == 'A+' and d['identite'].get('ald') == 'Oui', 'Modifier : Groupe sanguin enregistré, ALD caché mais gardé (Oui)')
        await pg.evaluate(f"location.hash='patients'"); await pg.wait_for_timeout(300); await pg.evaluate(f"location.hash='dossier/{pid}'"); await pg.wait_for_timeout(1500)
        ok('Groupe sanguin' in await pg.inner_text('#page .champs') and 'A+' in await pg.inner_text('#page .champs'), 'en-tête du dossier : Groupe sanguin = A+')
        await pg.evaluate(f"afficherPatient('{pid}')"); await pg.wait_for_timeout(400); ta = await pg.inner_text('#fenetre')
        ok('Groupe sanguin' in ta and 'Médecin traitant' in ta, 'Afficher : champs ajoutés')
        await pg.evaluate("fermerFenetre()")
        # Fiche chimio imprimée
        await pg.evaluate("window.__win=[]"); await pg.evaluate(f"chFiche('{pid}', 0, 0)"); await pg.wait_for_timeout(700); bt = True
        hh = await pg.evaluate("(window.__win||[]).map(w=>w.w.document._h).join('')")
        ok(bt is not None and 'Groupe sanguin : A+' in hh, 'fiche chimio imprimée : « Groupe sanguin : A+ » sous l\'identité')
        ok(not pg.errs and not p0.errs, 'aucune erreur JavaScript ' + str((pg.errs + p0.errs)[:2]))
        # Administration : champ ajouté dans un pack
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__fonctions={listeCabinets:async()=>({cabinets:[]}),formulesEnregistrer:async(d)=>{window.__fml=d;return {formules:d.formules,cabinets:0}}};""")
        await pa.goto(f'http://localhost:{PORT}/admin.html#specialites'); await pa.wait_for_timeout(1500)
        await pa.click('[data-pm="essentiel"]'); await pa.wait_for_timeout(400)
        await pa.click('#chNouv'); await pa.wait_for_timeout(200); await pa.fill('#chLib', 'Statut'); await pa.select_option('#chType', 'choix'); await pa.fill('#chChoix', 'Nouveau cas\nAncien cas'); await pa.check('#chImp'); await pa.click('#chOk'); await pa.wait_for_timeout(300)
        await pa.click('#fCorps [data-haut="fiche:20"]'); await pa.wait_for_timeout(200); await pa.uncheck('#fCorps [data-rch="email"]')
        await pa.click('#fOk'); await pa.wait_for_timeout(600)
        FI = (await pa.evaluate('window.__fml'))['formules']['essentiel']['reglage']['fiche']; aj = FI['ajouts']
        ok(len(aj) == 1 and aj[0]['lib'] == 'Statut' and aj[0]['type'] == 'choix' and aj[0]['choix'] == ['Nouveau cas', 'Ancien cas'] and aj[0]['imprimer'] and FI['ordre'][19] == aj[0]['id'] and FI['champs']['email'] is False, 'Administration › pack : champ « Statut » ajouté (liste de choix, imprimé), monté d\'un cran, E-mail retiré')
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
