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
        k0 = await p0.evaluate("[...document.querySelectorAll('#fenetre .form > [data-champ]')].filter(e=>e.style.display!=='none').map(e=>e.dataset.champ)")
        ok(k0[:4] == ['nom', 'prenom', 'ddn', 'sexe'] and 'ald' in k0 and not any(k.startswith('x') for k in k0), 'sans réglage : fiche inchangée (ordre d\'aujourd\'hui, ALD présent, aucun champ ajouté)')
        # Avec réglage
        pg = await ouvrir(b, S2); await pg.goto(f'http://localhost:{PORT}/v2.html#patients'); await pg.wait_for_timeout(2000)
        await pg.evaluate("nouveauPatient()"); await pg.wait_for_timeout(400)
        k1 = await pg.evaluate("[...document.querySelectorAll('#fenetre .form > [data-champ]')].filter(e=>e.style.display!=='none').map(e=>e.dataset.champ)")
        ok(k1[0] == 'mut' and 'ald' not in k1 and 'xgs001' in k1 and 'xmt001' in k1, 'Nouveau patient : Mutuelle en premier, ALD retiré, champ de la spécialité + champ du cabinet ' + str(k1[:4]))
        ok(await pg.evaluate("document.querySelector('#fenetre [data-champ=\"tel\"] label').textContent") == 'Téléphone portable', 'nom affiché réglé par la spécialité : « Téléphone portable »')
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
        ok('Pénicilline' in await pg.inner_text('#page .champs') and await pg.evaluate("!document.querySelector('#page .champs [data-champ=\"tel2\"]') && !!document.querySelector('#page .champs [data-champ=\"tel\"]')"), 'en-tête réglé champ par champ : Allergies ajoutées, 2e téléphone retiré (Téléphone gardé)')
        await pg.evaluate(f"afficherPatient('{pid}')"); await pg.wait_for_timeout(400); ta = await pg.inner_text('#fenetre')
        ok('Groupe sanguin' in ta and 'Médecin traitant' in ta, 'Afficher : champs ajoutés')
        await pg.evaluate("fermerFenetre()")
        # Fiche chimio imprimée
        await pg.evaluate("window.__win=[]"); await pg.evaluate(f"chFiche('{pid}', 0, 0)"); await pg.wait_for_timeout(700); bt = True
        hh = await pg.evaluate("(window.__win||[]).map(w=>w.w.document._h).join('')")
        ok(bt is not None and 'Groupe sanguin : A+' in hh, 'fiche chimio imprimée : « Groupe sanguin : A+ » sous l\'identité')
        ok(not pg.errs and not p0.errs, 'aucune erreur JavaScript ' + str((pg.errs + p0.errs)[:2]))
        # Administration : fiche de la spécialité (Par spécialité › Bibliothèque et paramètres)
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__fonctions={listeCabinets:async()=>({cabinets:[{id:'cab-t',nom:'Cabinet T',cree:'2026-10-09',actif:true,titulaire:{nom:'Dr T',email:'t@t.ma'},membres:1,patients:0,abonnement:{formule:'essentiel',reglage:{fiche:{ajouts:[{id:'xmt001',lib:'Médecin traitant',type:'texte'}]}}}}],specialites:{'Oncologie – Radiothérapie':{fiche:{ajouts:[{id:'xgs001',lib:'Groupe sanguin',type:'choix',choix:['A+']}],champs:{ald:false}}}}}),formulesEnregistrer:async(d)=>{window.__fml=d;return {formules:d.formules,cabinets:0}},ficheSpecialite:async(d)=>{window.__fspe=d;return {fiche:d.fiche,cabinets:3}},abonnementCabinet:async(d)=>{window.__abo=d;return {abonnement:d}}};""")
        await pa.goto(f'http://localhost:{PORT}/admin.html#specialites'); await pa.wait_for_timeout(1500)
        await pa.click('[data-pm="essentiel"]'); await pa.wait_for_timeout(400)
        ok(await pa.evaluate("!document.querySelector('#fCorps .fiche-b')"), 'un pack n\'a plus de fiche patient (elle est commune à la spécialité)')
        await pa.click('#fOk'); await pa.wait_for_timeout(600)
        ok('fiche' not in ((await pa.evaluate('window.__fml'))['formules']['essentiel'].get('reglage') or {}), 'pack enregistré sans fiche')
        await pa.click('[data-sous="biblio"]'); await pa.wait_for_timeout(300)
        ok('Fiche patient' in await pa.inner_text('#page') and '1 ajouté' in await pa.inner_text('#page'), 'Bibliothèque et paramètres : carte « Fiche patient » de la spécialité')
        await pa.click('[data-fsouvrir="fiche"]'); await pa.wait_for_timeout(300)
        await pa.click('#chNouv'); await pa.wait_for_timeout(200); await pa.fill('#chLib', 'Statut'); await pa.select_option('#chType', 'choix'); await pa.fill('#chChoix', 'Nouveau cas\nAncien cas'); await pa.check('#chImp'); await pa.click('#chOk'); await pa.wait_for_timeout(300)
        await pa.click('#fsCorps [data-fh="21"]'); await pa.wait_for_timeout(200); await pa.uncheck('#fsCorps [data-rch="email"]')
        await pa.uncheck('#fsCorps [data-ren="mut"]'); await pa.check('#fsCorps [data-ren="atcdMed"]')
        ok(await pa.evaluate("!document.querySelector('#fsCorps [data-ren=\"nom\"]') && document.querySelectorAll('#fsCorps [data-ren]').length == 20"), 'case « en-tête » sur chaque champ (sauf nom et prénom : toujours le nom du dossier)')
        await pa.click('#fsCorps [data-chl="atcdFam"]'); await pa.wait_for_timeout(200); await pa.fill('#chNomA', 'Antécédents familiaux et héréditaires'); await pa.click('#chLOk'); await pa.wait_for_timeout(200)
        ok('nom d\'origine : Antécédents familiaux' in await pa.inner_text('#fsCorps'), 'champ existant renommé (nom d\'origine rappelé)')
        await pa.click('#fsOk'); await pa.wait_for_timeout(600)
        F = await pa.evaluate('window.__fspe'); FI = F['fiche']; aj = FI['ajouts']
        ok(F['specialite'] == 'Oncologie – Radiothérapie' and len(aj) == 2 and aj[1]['lib'] == 'Statut' and aj[1]['choix'] == ['Nouveau cas', 'Ancien cas'] and aj[1]['imprimer'] and FI['ordre'][20] == aj[1]['id'] and FI['champs']['email'] is False and FI['champs']['ald'] is False and FI['libs']['atcdFam'] == 'Antécédents familiaux et héréditaires' and 'cabinet' not in aj[0] and FI['entetes']['mut'] is False and FI['entetes']['atcdMed'] is True and FI['entetes']['diag'] is True, 'fiche de la spécialité enregistrée : « Statut » ajouté et monté, E-mail retiré, ALD toujours retiré, antécédents familiaux renommés')
        ok('3 cabinet(s) mis à jour' in await pa.inner_text('body'), 'message : cabinets de la spécialité mis à jour')
        # Retouches d'un cabinet : seules les différences avec la fiche de la spécialité sont enregistrées
        await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(400)
        await pa.click('[data-fiche="cab-t"]'); await pa.wait_for_timeout(300); await pa.click('[data-form="cab-t"]'); await pa.wait_for_timeout(400)
        await pa.click('[data-fo="fiche"]'); await pa.wait_for_timeout(200)
        t = await pa.inner_text('#fCorps .fiche-b')
        ok('Statut' in t and 'Médecin traitant' in t and 'ajouté pour ce cabinet' in t and await pa.evaluate("!document.querySelector('#fCorps [data-chs=\"xgs001\"]') && !!document.querySelector('#fCorps [data-chs=\"xmt001\"]')"), 'réglage du cabinet : champs de la spécialité (non supprimables ici) + champ propre au cabinet')
        await pa.check('#fCorps [data-rch="ald"]'); await pa.click('#fOk'); await pa.wait_for_timeout(600)
        G = (await pa.evaluate('window.__abo'))['reglage']['fiche']
        ok(G.get('champs') == {'ald': True} and [a['id'] for a in G['ajouts']] == ['xmt001'] and 'ordre' not in G and 'libs' not in G, 'retouches du cabinet = différences seulement (ALD remis, son champ) ' + str(G)[:120])
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
