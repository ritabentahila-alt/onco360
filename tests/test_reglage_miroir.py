import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Réglage du cabinet en miroir (20/10/2026, demande de Dr Bentahila) : Administration › fiche d'un cabinet › « Réglage du cabinet » montre ce
# que l'équipe voit, avec ce que le médecin a changé lui-même (tableau de bord : parametres/accueil ; fiche et formulaire :
# parametres/formulaires ; fiche de la spécialité copiée dans le cabinet) ; enregistrer écrit au même endroit que le médecin. Onglets des
# Paramètres par famille, à jour (Affichage du dossier, Export des données ; plus d'« Accès »). Fonctions serveur simulées, cabinet fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2 = json.loads(json.dumps(S)); S2['administrateurs/ADM'] = {'email': 'adm@test.ma'}
LIRE = {'ficheSpe': {'libs': {'mut': 'Organisme'}}, 'consultSpe': {}, 'accueil': {'ordre': ['afaire', 'jour'], 'cartes': {'stats': False}},
        'formulaires': {'fiche': {'ajouts': [{'id': 'xpropre1', 'lib': 'Champ du médecin', 'type': 'texte', 'partie': 'clinique'}]},
                        'consultation': {'typesForm': {'Fin de RT': 'rt'}}},
        # cas signalé le 20/10 : la liste des types du cabinet (Paramètres › Types de consultation), un type renommé par le médecin, son formulaire
        'typesConsult': [{'k': 'suivi', 'nom': 'Consultation de suivi'}, {'k': 'rtf', 'nom': 'Fin de RT', 'anciens': ['Consultation de fin de radiothérapie']}], 'acts': [['echo', 'Échographie']]}
MOCK = """window.__uid='ADM';window.__appels=[];window.__fonctions={
 listeCabinets:async()=>({cabinets:[{id:'cab-t',nom:'Cabinet T',cree:'2026-10-09',actif:true,titulaire:{nom:'Dr T',email:'t@t.ma'},membres:1,patients:0,abonnement:{formule:'complet',modules:{chimio:true,rt:true,agenda:true,salle:true,taches:true,rcp:true,prescriptions:true,documents:true,gagenda:true,listes:true,bilan:true},max:{}}}],archives:[]}),
 reglageCabinetLire:async(d)=>{window.__appels.push(['lire',d]);return %s},
 abonnementCabinet:async(d)=>{window.__appels.push(['ecrire',d]);return {abonnement:{formule:d.formule,modules:d.modules,max:d.max,reglage:d.reglage}}}};""" % json.dumps(LIRE)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S2); ev = pa.evaluate; await pa.add_init_script(MOCK)
        ouvrirR = lambda: ev("document.querySelector('tr.lc-l[data-fiche=\"cab-t\"]').click()")
        await pa.goto(f'http://localhost:{PORT}/admin.html#cabinets'); await pa.wait_for_timeout(1500)
        await ouvrirR(); await pa.wait_for_timeout(400); await ev("document.querySelector('#modal [data-form=\"cab-t\"]').click()"); await pa.wait_for_timeout(800)
        ok((await ev("window.__appels"))[0] == ['lire', {'espace': 'cab-t'}], 'le réglage du cabinet est lu à l\'ouverture (reglageCabinetLire)')
        ok('Tel que l\'équipe le voit aujourd\'hui' in await pa.inner_text('#modal'), 'intro : « Tel que l\'équipe le voit aujourd\'hui »')
        # Tableau de bord : l'ordre choisi par le médecin (À valider / À faire avant Aujourd'hui), sa carte retirée
        await ev("document.querySelector('#fCorps [data-fo=\"menu\"]').click()"); await pa.wait_for_timeout(300)
        cartes = await ev("[...document.querySelectorAll('#fCorps [data-op=\"menu\"] .rg-b')[1].querySelectorAll('.rg-l')].map(l=>[l.querySelector('.rg-t').textContent, l.querySelector('input').checked])")
        noms = [c[0] for c in cartes]
        ok(noms.index('À valider / À faire (selon le rôle)') < noms.index("Aujourd'hui"), 'tableau de bord : « À valider / À faire » avant « Aujourd\'hui », comme le médecin l\'a mis', noms)
        ok(dict(cartes).get('Statistiques' if 'Statistiques' in dict(cartes) else [n for n in noms if 'tat' in n.lower()][0]) is False, 'carte retirée par le médecin : décochée', cartes)
        # Paramètres : par famille, à jour
        await ev("document.querySelector('#fCorps [data-fo=\"param\"]').click()"); await pa.wait_for_timeout(300)
        tp = await pa.inner_text('#fCorps [data-op="param"]')
        fam = await ev("[...document.querySelectorAll('#fCorps .rg-fam')].map(x=>x.textContent)")
        ok(fam == ['Cabinet', 'Dossier patient', 'Agenda et rappels', 'Bibliothèques', 'Finances'], 'onglets des Paramètres rangés par famille, comme dans Onco360', fam)
        ok('Affichage du dossier' in tp and 'Export des données' in tp and 'Accès (équipe)' not in tp and 'Listes' in tp and 'Listes de la fiche' not in tp, 'onglets à jour : Affichage du dossier, Export des données, Listes (lot D) ; plus d\'« Accès »')
        o0 = await ev("[...document.querySelectorAll('#fCorps [data-op=\"param\"] .rg-l .rg-t')].map(x=>x.textContent)")
        await ev("document.querySelector('#fCorps [data-sb=\"fiche\"]').click()"); await pa.wait_for_timeout(300)
        o1 = await ev("[...document.querySelectorAll('#fCorps [data-op=\"param\"] .rg-l .rg-t')].map(x=>x.textContent)")
        ok(o1.index('Formulaire de consultation') < o1.index('Fiche patient') and o1.index('Fiche patient') < o1.index('Types de consultation'), '↓ déplace dans la famille (Fiche patient après Formulaire de consultation)', o1)
        await ev("document.querySelector('#fCorps [data-sh=\"fiche\"]').click()"); await pa.wait_for_timeout(300)
        # Fiche patient : celle du cabinet (nom « Organisme » de la spécialité copiée chez lui, champ ajouté par le médecin)
        await ev("document.querySelector('#fCorps [data-fo=\"fiche\"]').click()"); await pa.wait_for_timeout(300)
        tf = await pa.inner_text('#fCorps [data-op="fiche"]')
        ok('Organisme' in tf and 'Champ du médecin' in tf, 'fiche patient du cabinet : « Organisme », « Champ du médecin » (ajouté par lui)')
        v = await ev("(()=>{const s=document.querySelector('#fCorps [data-cqt=\"Fin de RT\"]');return s?s.options[s.selectedIndex].textContent:null})()")
        ty = await ev("[...document.querySelectorAll('#fCorps [data-cqt]')].map(s=>s.dataset.cqt)")
        ok(v == 'RT hebdomadaire', '« Fin de RT » (renommé par le médecin) : formulaire « RT hebdomadaire », comme dans son cabinet (cas signalé le 20/10)', v)
        ok('Consultation de fin de traitement' not in ty and 'Consultation de fin de radiothérapie' not in ty and 'Consultation de suivi' in ty, 'types = ceux de ses Paramètres (pas l\'ancienne liste fixe, pas l\'ancien nom)', ty)
        # Enregistrer sans rien changer : rien n'est écrit dans ses Paramètres
        await ev("document.getElementById('fOk').click()"); await pa.wait_for_timeout(800)
        w = [a for a in await ev("window.__appels") if a[0] == 'ecrire'][-1][1]
        ok(w.get('cab') == {}, 'enregistrer sans changement : ni tableau de bord ni fiche réécrits chez lui', w.get('cab'))
        ok(not (w['reglage'].get('accueil') or [None])[0] == 'afaire', 'son tableau de bord n\'est pas recopié dans le réglage de l\'administration', w['reglage'].get('accueil'))
        # Changer en miroir : une carte déplacée et un champ décoché
        await ouvrirR(); await pa.wait_for_timeout(400); await ev("document.querySelector('#modal [data-form=\"cab-t\"]').click()"); await pa.wait_for_timeout(800)
        await ev("document.querySelector('#fCorps [data-fo=\"menu\"]').click()"); await pa.wait_for_timeout(300)
        n0 = await ev("[...document.querySelectorAll('#fCorps [data-op=\"menu\"] .rg-b')[1].querySelectorAll('.rg-t')].map(x=>x.textContent)")
        await ev("document.querySelector('#fCorps [data-bas=\"accueil:0\"]').click()"); await pa.wait_for_timeout(300)
        await ev("document.querySelector('#fCorps [data-fo=\"fiche\"]').click()"); await pa.wait_for_timeout(300)
        await ev("(()=>{const i=document.querySelector('#fCorps [data-op=\"fiche\"] [data-rch=\"email\"]');i.checked=false;i.dispatchEvent(new Event('change',{bubbles:true}))})()"); await pa.wait_for_timeout(300)
        await ev("document.getElementById('fOk').click()"); await pa.wait_for_timeout(800)
        w = [a for a in await ev("window.__appels") if a[0] == 'ecrire'][-1][1]; cab = w.get('cab') or {}
        lib = {'ppas': 'Pour commencer (cabinet neuf)', 'afaire': 'À valider / À faire (selon le rôle)'}
        oa = (cab.get('accueil') or {}).get('ordre', [])
        ok(len(oa) > 2 and [lib.get(k, k) for k in oa[:2]] == [n0[1], n0[0]] and (cab.get('accueil') or {}).get('cartes', {}).get('stats') is False, 'tableau de bord écrit dans ses Paramètres (ordre changé, sa carte retirée gardée)', cab.get('accueil'))
        fo = (cab.get('formulaires') or {}).get('fiche') or {}
        ok(fo.get('champs', {}).get('email') is False and [a['id'] for a in fo.get('ajouts', [])] == ['xpropre1'], 'fiche écrite dans ses Paramètres : E-mail retiré, son champ gardé', fo)
        ok('changés dans ses Paramètres' in await pa.inner_text('body'), 'message : changés dans ses Paramètres')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await ouvrirR(); await pa.wait_for_timeout(400); await ev("document.querySelector('#modal [data-form=\"cab-t\"]').click()"); await pa.wait_for_timeout(800)
        await ev("document.querySelector('#fCorps [data-fo=\"param\"]').click()"); await pa.wait_for_timeout(300)
        ok(await ev("document.querySelector('#modal .boite').scrollWidth <= document.querySelector('#modal .boite').clientWidth + 2 && document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : sans débordement')
        ok(not pa.errs, 'aucune erreur JavaScript', pa.errs[:2]); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
