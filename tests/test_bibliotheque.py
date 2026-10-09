import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Bibliothèques de référence par spécialité (10/10/2026) : la bibliothèque Oncologie – Radiothérapie ouverte par l'administration
# dans Onco360 (protocoles et paramètres seulement, listes de départ figées), onglet Bibliothèques de l'Administration ;
# création d'une secrétaire par le titulaire (fonction creerMembre) et lien du mot de passe.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
CAB = E; B = 'espaces/bib-oncologie/'
S2 = dict(S)
S2['espaces/bib-oncologie'] = {'nom': 'Bibliothèque Oncologie – Radiothérapie', 'bibliotheque': True, 'titulaire': 'ADM', 'actif': True, 'abonnement': {'formule': 'bibliotheque', 'modules': {'chimio': True, 'rt': True, 'prescriptions': True, 'listes': True, 'taches': True, 'rcp': True, 'gagenda': True}, 'max': {}}}
S2[B + 'membres/ADM'] = {'role': 'medecin', 'nom': 'Administration Onco360', 'actif': True, 'tousEtablissements': True, 'etablissements': [], 'droits': {'ecrireConsultations': True, 'traitements': 'modifier', 'radiotherapie': 'modifier', 'finances': True, 'parametres': True}}
for k, v in S.items():
    if k.startswith(CAB + 'protocoles/') or k in (CAB + 'parametres/listes', CAB + 'parametres/calendrier'): S2[B + k[len(CAB):]] = v
S2[B + 'finances/tarifs'] = {'data': json.dumps({'repli': '', 'etablissements': {}, 'actesRT': [{'nom': 'Sein', 'prix': 15000}], 'vmat': 10000})}
S2[B + 'bibliotheques/ordostypes'] = {'data': '[]'}
S2['administrateurs/ADM'] = {'email': 'adm@test.ma'}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await ouvrir(b, S2); await pg.add_init_script("window.__uid='ADM'")
        await pg.goto(f'http://localhost:{PORT}/v2.html?espace=bib-oncologie#accueil'); await pg.wait_for_timeout(3000)
        ok(pg.url.endswith('#accueil') and 'Protocoles' in await pg.inner_text('#titrePage'), 'la bibliothèque s\'ouvre sur les Protocoles (pas de tableau de bord)')
        vis = await pg.evaluate("[...document.querySelectorAll('nav a')].filter(a=>a.offsetParent!==null).map(a=>a.dataset.p||a.id)")
        ok(vis == ['protocoles', 'parametres', 'lienAdmin'], 'menu : Protocoles, Paramètres, Retour à l\'Administration ' + str(vis))
        ok('ce que reçoivent les nouveaux cabinets' in await pg.inner_text('body'), 'bandeau « ce que reçoivent les nouveaux cabinets »')
        fs = await pg.evaluate("window.__fs")
        fig = [k.split('/')[-1] for k in fs if k.startswith(B + 'bibliotheques/')]
        ok(set(fig) >= {'medicaments', 'analyses', 'bilans', 'examens', 'courriers', 'documentation'} and json.loads(fs[B + 'bibliotheques/medicaments']['data']), 'listes de départ figées dans la bibliothèque : ' + ', '.join(sorted(fig)))
        ok(fs[B + 'bibliotheques/ordostypes']['data'] == '[]', 'une liste déjà enregistrée n\'est pas écrasée')
        ok(not any(k.startswith(CAB + 'bibliotheques/') and k not in S for k in fs), 'rien d\'écrit dans le cabinet du Dr Bentahila')
        await pg.evaluate("location.hash='parametres/bibliotheques'"); await pg.wait_for_timeout(1000); tp = await pg.inner_text('#page')
        ok('Documentation' in tp and 'Médicaments' in tp, 'Paramètres › Bibliothèques : médicaments… et documentation')
        ong = await pg.evaluate("[...document.querySelectorAll('.ag-vues button')].map(b=>b.innerText.trim())")
        ok(len(ong) == 12 and not any(x in ' '.join(ong) for x in ['Lieux', 'Accès', 'Journal']) and any('Tâches' in o for o in ong) and any('RCP' in o for o in ong), 'Paramètres : tous les paramètres de base (12 onglets), sans lieux, accès ni journal ' + str(len(ong)))
        await pg.evaluate("location.hash='parametres/couleurs'"); await pg.wait_for_timeout(800)
        ok('Lier mon Google Agenda' not in await pg.inner_text('#page') and 'Couleurs' in await pg.inner_text('#page'), 'Google Agenda : les couleurs, sans liaison personnelle')
        await pg.evaluate("location.hash='parametres/bibliotheques'"); await pg.wait_for_timeout(800)
        await pg.click('text=Fiches PDF à remettre'); await pg.wait_for_timeout(800); tw = await pg.inner_text('#fenetre')
        ok('à remettre aux patients' in tw and 'Ajouter un PDF' in tw and 'Remettre' not in tw.replace('à remettre', ''), 'documentation gérée sans patient (ajouter, sans « Remettre »)')
        await pg.evaluate("fermerFenetre()")
        for h in ['patients', 'agenda', 'bilan', 'taches', 'dossier/x']:
            await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(300)
        ok('Protocoles' in await pg.inner_text('#titrePage'), 'patients, agenda, bilan, tâches, dossier → Protocoles')
        await pg.evaluate("location.hash='protocoles'"); await pg.wait_for_timeout(800)
        ok('316' in await pg.inner_text('#page') or await pg.evaluate("document.querySelectorAll('#page .proto, #page tr').length") > 50, 'les 316 protocoles sont là')
        ok(not pg.errs, 'aucune erreur JavaScript (bibliothèque) ' + str(pg.errs[:2]))
        # Administration : onglet Bibliothèques
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM2';window.__fs['administrateurs/ADM2']={email:'a@b.ma'};window.__fonctions={listeCabinets:async()=>({cabinets:[],bibliotheques:[{id:'bib-oncologie',lib:'Oncologie – Radiothérapie',specialites:['Oncologie médicale','Radiothérapie','Oncologie-radiothérapie'],existe:true,nb:{protocoles:316,ordostypes:26,medicaments:120}},{id:'bib-generaliste',lib:'Médecine générale',specialites:['Médecine générale'],existe:false},{id:'bib-gynecologie',lib:'Gynécologie',specialites:['Gynécologie'],existe:false}]}),bibliothequeOuvrir:async(d)=>{window.__bo=d;return {espace:d.bib}}};""")
        await pa.goto(f'http://localhost:{PORT}/admin.html#reference'); await pa.wait_for_timeout(1500)
        ta = await pa.inner_text('main')
        ok('Oncologie – Radiothérapie' in ta and 'Médecine générale' in ta and 'Gynécologie' in ta and '316' in ta and 'En place' in ta and 'À créer' in ta, 'onglet Bibliothèques : une par spécialité, compteurs')
        await pa.click('nav#onglets a[href="#specialites"]'); await pa.wait_for_timeout(400); await pa.click('[data-sous="modules"]'); await pa.wait_for_timeout(300); tm = await pa.inner_text('main')
        ok('Modules communs' in tm and 'Chimiothérapie et protocoles' in tm.split('Propres à')[1] and 'Chimiothérapie et protocoles' not in tm.split('Modules communs')[1].split('Propres à')[0], 'Par spécialité › Modules et menus : communs, propres à l\'oncologie (Protocoles)')
        await pa.click('nav#onglets a[href="#reference"]'); await pa.wait_for_timeout(400)
        await pa.click('[data-bib="bib-oncologie"]'); await pa.wait_for_timeout(1200)
        ok((await pa.evaluate('window.__bo && window.__bo.bib')) == 'bib-oncologie' or 'espace=bib-oncologie' in pa.url, '« Ouvrir et modifier » ouvre la bibliothèque dans Onco360')
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        # Titulaire : création d'une secrétaire par le serveur, lien du mot de passe
        pt = await ouvrir(b, S2); await pt.add_init_script("""window.__fonctions={creerMembre:async(d)=>{window.__cm=d;window.__fs['espaces/cabinet-bentahila/membres/UNEW']={role:d.role,nom:d.prenom+' '+d.nom.toUpperCase(),email:d.email,actif:true,tousEtablissements:d.tousEtablissements,etablissements:d.etablissements,droits:d.droits};return {uid:'UNEW',existant:false}},lienMembre:async(d)=>({lien:'https://x/__/auth/action?mode=resetPassword&oobCode=SEC',email:'sara@ex.ma'})};""")
        await pt.goto(f'http://localhost:{PORT}/v2.html#parametres/acces'); await pt.wait_for_timeout(2500)
        await pt.click('text=Ajouter un accès'); await pt.wait_for_timeout(400)
        await pt.fill('#mPre', 'Sara'); await pt.fill('#mNom', 'Amrani'); await pt.fill('#mMail', 'Sara@Ex.ma'); await pt.fill('#mTel', '0661000000')
        await pt.select_option('#mRole', 'assistante'); await pt.wait_for_timeout(300)
        await pt.check('#mTous'); await pt.click('#fOk'); await pt.wait_for_timeout(1200)
        cm = await pt.evaluate('window.__cm')
        ok(cm and cm['email'] == 'sara@ex.ma' and cm['role'] == 'assistante' and cm['espace'] == 'cabinet-bentahila', 'secrétaire créée par le serveur (plus d\'erreur « admin-restricted-operation »)')
        tw = await pt.inner_text('#fenetre')
        ok('Mot de passe de' in tw and 'Préparer le lien' in tw, 'fenêtre du mot de passe proposée aussitôt')
        await pt.click('#lmFaire'); await pt.wait_for_timeout(600)
        ok('oobCode=SEC' in await pt.input_value('#lmTxt') and await pt.get_attribute('text=Envoyer par WhatsApp', 'href'), 'lien prêt à copier ou à envoyer par WhatsApp')
        ok(not pt.errs, 'aucune erreur JavaScript (Accès) ' + str(pt.errs[:2]))
        await b.close()
asyncio.run(main())
