import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Formulaire de consultation réglable (16.7, 10/10/2026) : formulaire de la spécialité (espaces/{e}.consultSpe, le même pour tous les
# packs) + retouches du cabinet ; sans réglage, la fenêtre d'aujourd'hui ; Administration : formulaire de la spécialité, retouches.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
SEC = {'id': 'xsec01', 'lib': 'Mesures et constantes', 'type': 'section'}
PDS = {'id': 'xpds01', 'lib': 'Poids', 'type': 'nombre', 'unite': 'kg'}
OBS = {'id': 'xobs01', 'lib': 'Observance', 'type': 'textelong'}
GLY = {'id': 'xgly01', 'lib': 'Glycémie', 'type': 'nombre', 'unite': 'g/l'}
S2 = dict(S); e = dict(S2[E[:-1]])
e['consultSpe'] = {'ordre': ['d', 'type', 'xsec01', 'xpds01', 'xobs01', 'note'], 'champs': {'titre': False}, 'libs': {'note': 'Conclusion'}, 'choixs': {'type': ['Première consultation', 'Suivi']}, 'ajouts': [SEC, PDS, OBS]}
e['abonnement'] = dict(e.get('abonnement') or {'formule': 'complet'}); e['abonnement']['reglage'] = {'consultation': {'ajouts': [GLY]}}
S2[E[:-1]] = e
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('lignesJson') or '') > 50][0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Sans réglage : la fenêtre d'aujourd'hui
        p0 = await ouvrir(b); await p0.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await p0.wait_for_timeout(2500)
        await p0.evaluate(f"csNouvelle('{pid}')"); await p0.wait_for_timeout(400)
        ids = await p0.evaluate("[...document.querySelectorAll('#fenetre .form input,#fenetre .form select,#fenetre .form textarea')].map(e=>e.id)")
        ty = await p0.evaluate("[...document.querySelectorAll('#csType option')].map(o=>o.textContent)")
        # 3.4 (12/10/2026) : cabinet d'oncologie : formulaires proposés (champs cx_xcs…) entre le titre et la note ; 8 types (« Note du secrétariat »)
        base = [i for i in ids if not i.startswith('cx_xcs')]
        ok(base == ['csType', 'csDate', 'csTitre', 'csNote'] and any(i.startswith('cx_xcs') for i in ids) and all(x in ty for x in ['Consultation de suivi', 'RCP', 'Note du secrétariat', 'Consultation de fin de radiothérapie']), 'sans réglage : Consultation, Date, Titre, formulaires proposés, Note ; types du référentiel (3.13) ' + str((base, ty)))
        await p0.select_option('#csType', 'Consultation de suivi'); await p0.fill('#csTitre', 'J1C1'); await p0.fill('#csNote', 'RAS'); await p0.click('#csOk'); await p0.wait_for_timeout(1000)
        fs = await p0.evaluate("window.__fs"); c0 = [v for k, v in fs.items() if '/consultations/' in k and v.get('titre') == 'J1C1']
        ok(c0 and c0[0]['note'] == 'RAS' and 'extra' not in c0[0], 'sans réglage : consultation enregistrée comme avant (sans « extra »)')
        # Avec le formulaire de la spécialité + retouche du cabinet
        pg = await ouvrir(b, S2); await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await pg.evaluate(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(400)
        ids = await pg.evaluate("[...document.querySelectorAll('#fenetre .form input,#fenetre .form select,#fenetre .form textarea')].map(e=>e.id)")
        ok([i for i in ids if not i.startswith('cx_xcs')] == ['csType', 'csDate', 'csNote', 'cx_xpds01', 'cx_xobs01', 'cx_xgly01'], 'champs communs d\'abord (lot D, 25/10/2026 : Consultation, Date, Titre, Note), Titre retiré, puis l\'ordre de la spécialité, champ du cabinet à la fin ' + str(ids))
        t = await pg.inner_text('#fenetre')
        ok('Mesures et constantes' in t and 'Poids (kg)' in t and 'Conclusion' in t and 'Glycémie (g/l)' in t, 'section, unité, « Note » renommée « Conclusion »')
        ty = await pg.evaluate("[...document.querySelectorAll('#csType option')].map(o=>o.textContent)")
        ok('Première consultation' in ty and 'Suivi' in ty, 'types de consultation de la spécialité repris dans le référentiel (3.13) ' + str(ty))
        await pg.select_option('#csType', 'Suivi'); await pg.fill('#cx_xpds01', '72,5'); await pg.fill('#cx_xobs01', 'Bonne\nprise régulière'); await pg.fill('#cx_xgly01', '1.1'); await pg.fill('#csNote', 'Poursuite'); await pg.click('#csOk'); await pg.wait_for_timeout(1000)
        fs = await pg.evaluate("window.__fs"); c1 = [(k, v) for k, v in fs.items() if '/consultations/' in k and v.get('note') == 'Poursuite']
        ok(c1 and c1[0][1]['extra'] == {'xpds01': '72.5', 'xobs01': 'Bonne\nprise régulière', 'xgly01': '1.1'} and c1[0][1]['type'] == 'Suivi' and c1[0][1]['titre'] == '', 'valeurs enregistrées dans « extra » ' + str(c1 and c1[0][1].get('extra')))
        await pg.evaluate(f"ongletDossier('{pid}','co')"); await pg.wait_for_timeout(500)
        t = await pg.inner_text('#csListe')
        ok('Mesures et constantes' in t and '72.5 kg' in t and 'Glycémie' in t and 'Conclusion' in t, 'consultation dépliée : section, Poids 72.5 kg, Glycémie, Conclusion')
        # Décision de RCP : type « RCP » gardé même absent de la liste
        await pg.evaluate(f"import('./js/app/consultations.js').then(m=>m.nouvelleConsultation('{pid}',{{type:'RCP',titre:'Décision',note:'Décision : '}}))"); await pg.wait_for_timeout(500)
        ok(await pg.evaluate("document.getElementById('csType').value") == 'RCP' and await pg.evaluate("!!document.getElementById('csTitre')"), 'décision de RCP : type « RCP » et titre gardés même retirés du formulaire')
        await pg.evaluate("fermerFenetre()")
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.evaluate(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(400)
        ok(await pg.evaluate("document.documentElement.scrollWidth<=390"), 'fenêtre à 390 px : rien ne déborde')
        ok(not pg.errs and not p0.errs, 'aucune erreur JavaScript ' + str((pg.errs + p0.errs)[:2]))
        # Administration
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__fonctions={listeCabinets:async()=>({cabinets:[{id:'cab-t',nom:'Cabinet T',cree:'2026-10-09',actif:true,titulaire:{nom:'Dr T',email:'t@t.ma'},membres:1,patients:0,abonnement:{formule:'essentiel'}}],specialites:{'Oncologie – Radiothérapie':{consultation:{ajouts:[{id:'xsec01',lib:'Mesures',type:'section'}]}}}}),ficheSpecialite:async(d)=>{window.__fspe=d;return {fiche:d.fiche,cabinets:2}},abonnementCabinet:async(d)=>{window.__abo=d;return {abonnement:d}},reglageCabinetLire:async()=>({ficheSpe:{},consultSpe:{ajouts:[{id:'xsec01',lib:'Mesures',type:'section'}]},accueil:null,formulaires:null})};""")
        await pa.goto(f'http://localhost:{PORT}/admin.html#specialites'); await pa.wait_for_timeout(1500)
        # 20/10/2026 : le formulaire de la spécialité se règle dans le modèle ouvert dans Onco360 (test_modele_parametres.py)
        # Réglage d'un cabinet : deux éditeurs dans la même fenêtre
        await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(400)
        await pa.click('[data-fiche="cab-t"]'); await pa.wait_for_timeout(300); await pa.click('[data-form="cab-t"]'); await pa.wait_for_timeout(900)
        await pa.click('[data-fo="fiche"]'); await pa.wait_for_timeout(200)
        await pa.click('#cqNouv'); await pa.wait_for_timeout(200); await pa.fill('#cqLib', 'Pieds'); await pa.select_option('#cqType', 'textelong'); await pa.click('#cqOk'); await pa.wait_for_timeout(200)
        await pa.click('#chNouv'); await pa.wait_for_timeout(200); await pa.fill('#chLib', 'Groupe sanguin'); await pa.click('#chOk'); await pa.wait_for_timeout(200)
        await pa.click('#fOk'); await pa.wait_for_timeout(600)
        W = await pa.evaluate('window.__abo'); G = (W.get('cab') or {}).get('formulaires') or {} # 20/10/2026 : en miroir, dans les Paramètres du cabinet
        ok([a['lib'] for a in G['consultation']['ajouts']] == ['Pieds'] and G['consultation']['ajouts'][0]['type'] == 'textelong' and [a['lib'] for a in G['fiche']['ajouts']] == ['Groupe sanguin'] and 'choixs' not in G['consultation'] and 'consultation' not in W['reglage'], 'cabinet : retouches de la consultation et de la fiche, chacune à sa place, dans ses Paramètres ' + str(G.get('consultation'))[:100])
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
