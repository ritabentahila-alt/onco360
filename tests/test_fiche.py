import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Fiche patient réglable (étape 16, 10/10/2026) : fiche de la spécialité (espaces/{e}.ficheSpe, la même pour tous les packs) +
# retouches du cabinet ; ordre, champ retiré (valeur gardée), nom affiché, champs ajoutés (saisie, affichage, en-tête, impression
# sur la fiche chimio) ; sans réglage, la fiche d'oncologie est inchangée ; Administration : fiche de la spécialité, pas de fiche
# dans un pack, retouches d'un cabinet.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
GS = {'id': 'xgs001', 'lib': 'Groupe sanguin', 'type': 'choix', 'choix': ['A+', 'O+', 'B-'], 'partie': 'clinique', 'imprimer': True, 'entete': True}
MT = {'id': 'xmt001', 'lib': 'Médecin traitant', 'type': 'texte', 'choix': [], 'partie': 'identite', 'imprimer': True, 'entete': False}
S2 = dict(S); e = dict(S2[E[:-1]])
e['abonnement'] = {'formule': 'complet', 'modules': {k: True for k in ['chimio', 'rt', 'agenda', 'salle', 'taches', 'rcp', 'prescriptions', 'documents', 'gagenda', 'listes', 'bilan']}, 'max': {},
  'reglage': {'fiche': {'ajouts': [MT]}}} # retouche du cabinet : un champ en plus
e['ficheSpe'] = {'ordre': ['mut', 'nom', 'prenom'], 'champs': {'ald': False}, 'libs': {'tel': 'Téléphone portable'}, 'entetes': {'allergies': True, 'tel2': False}, 'ajouts': [GS]} # fiche de la spécialité
S2[E[:-1]] = e
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('lignesJson') or '') > 50][0]
P0 = dict(S2[E + 'patients/' + pid]); I0 = dict(P0['identite']); I0['ald'] = 'Oui'; I0['tel2'] = '0600000002'; P0['identite'] = I0; C0 = dict(P0.get('clinique') or {}); C0['allergies'] = 'Pénicilline'; P0['clinique'] = C0; S2[E + 'patients/' + pid] = P0
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Sans réglage : fiche d'oncologie inchangée
        p0 = await ouvrir(b); await p0.goto(f'http://localhost:{PORT}/v2.html#patients'); await p0.wait_for_timeout(2000)
        await p0.evaluate("nouveauPatient()"); await p0.wait_for_timeout(400)
        k0 = await p0.evaluate("[...document.querySelectorAll('#fenetre .form[data-sec] > [data-champ]')].filter(e=>e.style.display!=='none').map(e=>e.dataset.champ)") # 3.1 bis : fiche en parties
        # 3.1 (12/10/2026) : la fiche tumeur (champs xt…) est ajoutée d'office aux cabinets d'oncologie ; aucun autre champ ajouté
        # 20/10/2026 : Nouveau patient = Identité et administratif seulement (informations médicales et fiche tumeur : dans le dossier)
        ok(k0[:4] == ['nom', 'prenom', 'ddn', 'sexe'] and 'ald' in k0 and not any(k.startswith('x') for k in k0) and not any(k in k0 for k in ('taille', 'poids', 'diag', 'allergies')), 'sans réglage : Nouveau patient = Identité et administratif seulement (ordre d\'aujourd\'hui, ALD présent, aucun champ médical ni de la fiche tumeur) ' + str(k0))
        ok(await p0.evaluate("[...document.querySelectorAll('#fenetre .fp-sec')].map(h=>h.textContent).join()") == 'Identité et administratif', 'Nouveau patient : une seule partie, « Identité et administratif »')
        # Avec réglage
        pg = await ouvrir(b, S2); await pg.goto(f'http://localhost:{PORT}/v2.html#patients'); await pg.wait_for_timeout(2000)
        await pg.evaluate("nouveauPatient()"); await pg.wait_for_timeout(400)
        k1 = await pg.evaluate("[...document.querySelectorAll('#fenetre .form > [data-champ]')].filter(e=>e.style.display!=='none').map(e=>e.dataset.champ)")
        ok(k1[0] == 'mut' and 'ald' not in k1 and 'xgs001' not in k1 and 'xmt001' in k1, 'Nouveau patient : Mutuelle en premier, ALD retiré, champ du cabinet (identité) ; Groupe sanguin (informations médicales) non demandé ' + str(k1[:4]))
        ok(await pg.evaluate("document.querySelector('#fenetre [data-champ=\"tel\"] label').textContent") == 'Téléphone portable', 'nom affiché réglé par la spécialité : « Téléphone portable »')
        await pg.fill('#fNomF', 'Fiche'); await pg.fill('#fPrenom', 'Essai'); await pg.fill('#fx_xmt001', 'Dr Alami')
        await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        fs = await pg.evaluate("window.__fs"); np = [v for k, v in fs.items() if k.startswith(E + 'patients/') and (v.get('identite') or {}).get('nomF') == 'FICHE']
        ok(np and np[0]['identite'].get('extra', {}).get('xmt001') == 'Dr Alami' and not (np[0].get('clinique') or {}).get('extra'), 'création : champ ajouté de l\'identité enregistré')
        # Modifier un patient existant : ALD caché mais gardé
        await pg.evaluate(f"location.hash='dossier/{pid}'"); await pg.wait_for_timeout(1500)
        await pg.evaluate(f"modifierIdentite('{pid}')"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("!document.querySelector('#fenetre [data-champ=\"ald\"]')"), 'Modifier : ALD retiré (non affiché)')
        ok(await pg.evaluate("!document.getElementById('fx_xgs001') && !document.getElementById('fPoids') && !!document.getElementById('fx_xmt001')"), 'Modifier (bandeau) : identité seulement, pas le Groupe sanguin ni le poids')
        await pg.evaluate("fermerFenetre()"); await pg.evaluate(f"modifierIdentite('{pid}','med')"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("!!document.getElementById('fx_xgs001') && !document.getElementById('fNomF') && !document.getElementById('fx_xmt001')"), 'Modifier des Informations médicales : cette partie seulement')
        await pg.select_option('#fx_xgs001', 'A+'); await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        d = await pg.evaluate(f"window.__fs['{E}patients/{pid}']")
        ok(d['clinique'].get('extra', {}).get('xgs001') == 'A+' and d['identite'].get('ald') == 'Oui', 'Modifier : Groupe sanguin enregistré, ALD caché mais gardé (Oui)')
        await pg.evaluate(f"location.hash='patients'"); await pg.wait_for_timeout(300); await pg.evaluate(f"location.hash='dossier/{pid}'"); await pg.wait_for_timeout(1500)
        # lot A (25/10/2026) : plus de bandeau ni de réglage « en-tête » : le champ ajouté dans sa partie, l'allergie dans le bloc patient
        ok(await pg.evaluate("(() => { const z = document.querySelector('.dos-pat details[data-p=med] [data-champ=xgs001]'); return !!z && /Groupe sanguin/.test(z.textContent) && /A\\+/.test(z.textContent); })()"), 'dossier : Groupe sanguin = A+ dans Informations médicales')
        ok('Pénicilline' in await pg.inner_text('#page .dos-ban'), 'bloc patient : allergie (« oui » déduit du texte)')
        await pg.evaluate(f"afficherPatient('{pid}')"); await pg.wait_for_timeout(400); ta = await pg.inner_text('#fenetre')
        ok('Groupe sanguin' in ta and 'Médecin traitant' in ta, 'Afficher : champs ajoutés')
        await pg.evaluate("fermerFenetre()")
        # Fiche chimio imprimée
        await pg.evaluate("window.__win=[]"); await pg.evaluate(f"chFiche('{pid}', 0, 0)"); await pg.wait_for_timeout(700); bt = True
        hh = await pg.evaluate("(window.__win||[]).map(w=>w.w.document._h).join('')")
        ok(bt is not None and 'Groupe sanguin : A+' in hh, 'fiche chimio imprimée : « Groupe sanguin : A+ » sous l\'identité')
        ok(not pg.errs and not p0.errs, 'aucune erreur JavaScript ' + str((pg.errs + p0.errs)[:2]))
        # Administration : fiche de la spécialité (Par spécialité › Bibliothèque et paramètres)
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__fonctions={listeCabinets:async()=>({cabinets:[{id:'cab-t',nom:'Cabinet T',cree:'2026-10-09',actif:true,titulaire:{nom:'Dr T',email:'t@t.ma'},membres:1,patients:0,abonnement:{formule:'essentiel'}}],specialites:{'Oncologie – Radiothérapie':{fiche:{ajouts:[{id:'xgs001',lib:'Groupe sanguin',type:'choix',choix:['A+']}],champs:{ald:false}}}}}),formulesEnregistrer:async(d)=>{window.__fml=d;return {formules:d.formules,cabinets:0}},ficheSpecialite:async(d)=>{window.__fspe=d;return {fiche:d.fiche,cabinets:3}},abonnementCabinet:async(d)=>{window.__abo=d;return {abonnement:d}},reglageCabinetLire:async()=>({ficheSpe:{ajouts:[{id:'xgs001',lib:'Groupe sanguin',type:'choix',choix:['A+']}],champs:{ald:false}},consultSpe:{},accueil:null,formulaires:{fiche:{ajouts:[{id:'xmt001',lib:'Médecin traitant',type:'texte'}]}}})};""")
        await pa.goto(f'http://localhost:{PORT}/admin.html#specialites'); await pa.wait_for_timeout(1500)
        await pa.click('[data-pm="essentiel"]'); await pa.wait_for_timeout(400)
        ok(await pa.evaluate("!document.querySelector('#fCorps .fiche-b')"), 'un pack n\'a plus de fiche patient (elle est commune à la spécialité)')
        await pa.click('#fOk'); await pa.wait_for_timeout(600)
        ok('fiche' not in ((await pa.evaluate('window.__fml'))['formules']['essentiel'].get('reglage') or {}), 'pack enregistré sans fiche')
        # 20/10/2026 : la fiche de la spécialité se règle dans le modèle ouvert dans Onco360 (test_modele_parametres.py)
        # Réglage d'un cabinet en miroir (20/10/2026) : la fiche telle que l'équipe la voit (champ ajouté par le médecin) ; seules les différences
        # avec la fiche de la spécialité copiée chez lui, écrites dans ses Paramètres (parametres/formulaires)
        await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(400)
        await pa.click('[data-fiche="cab-t"]'); await pa.wait_for_timeout(300); await pa.click('[data-form="cab-t"]'); await pa.wait_for_timeout(900)
        await pa.click('[data-fo="fiche"]'); await pa.wait_for_timeout(200)
        t = await pa.inner_text('#fCorps .fiche-b')
        ok('Médecin traitant' in t and 'propre au cabinet' in t and await pa.evaluate("!document.querySelector('#fCorps [data-chs=\"xgs001\"]') && !!document.querySelector('#fCorps [data-chs=\"xmt001\"]')"), 'réglage du cabinet : champs de la spécialité (non supprimables ici) + champ propre au cabinet')
        await pa.check('#fCorps [data-rch="ald"]'); await pa.click('#fOk'); await pa.wait_for_timeout(600)
        W = await pa.evaluate('window.__abo'); G = ((W.get('cab') or {}).get('formulaires') or {}).get('fiche') or {}
        ok(G.get('champs') == {'ald': True} and [a['id'] for a in G['ajouts']] == ['xmt001'] and 'ordre' not in G and 'libs' not in G and 'fiche' not in W['reglage'], 'retouches du cabinet = différences seulement (ALD remis, son champ), dans ses Paramètres ' + str(G)[:120])
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
