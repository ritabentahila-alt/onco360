import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot R-F (audit n° 8, 20/10/2026) : écrans de la sauvegarde et de la récupération, fonctions serveur simulées (le serveur lui-même :
# tests/emulateur/test-export.mjs, « cd tests/regles && npm run export »). Données fictives seulement.
#   • Paramètres › Cabinet › Export des données (médecin titulaire) : export de la semaine (réglage, maintenant, télécharger, Google Drive),
#     « Récupérer des données » (base à une heure donnée, export, fichier de l'ordinateur ; dossier, document, tout le cabinet ; aperçu, récupérer),
#     « En cas de problème » ; secrétaire : rien ; téléphone 390 px sans débordement.
#   • Administration › Sauvegardes : copie des fichiers (alerte, nuits, lancer), export de la semaine des cabinets, récupération par numéro de
#     dossier (aucun nom), mode d'emploi ; alerte en haut de l'onglet Cabinets ; bouton « Récupérer des données » dans la fiche d'un cabinet.
import io, zipfile
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2 = json.loads(json.dumps(S))
S2[E+'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {"secretariat": True}}
S2['utilisateurs/SEC'] = {"nom": "SEC", "prenom": "Test"}
S2['administrateurs/ADM'] = {'email': 'adm@test.ma'}
PARCOL = {"patients": {"lib": "Dossier (identité, fiche, chimiothérapie, radiothérapie, rendez-vous)", "remettre": 1, "effaces": 1, "modifies": 0, "identiques": 0, "crees": 0, "gardes": 0},
          "consultations": {"lib": "Consultations et ordonnances", "remettre": 2, "effaces": 2, "modifies": 0, "identiques": 0, "crees": 1, "gardes": 0}}
MOCK = """window.__appels=[];window.__fonctions={
 exporterCabinet:async(d)=>{window.__appels.push(['export',d]);const c='espaces/'+d.espace+'/exports/1/Onco360_export_2026-10-11.zip';window.__st[c]={blob:new Blob(['PK-test'],{type:'application/zip'}),meta:{}};return {chemin:c,taille:4096,patients:62,fichiers:3,documentation:2,manquants:0}},
 exportAuto:async(d)=>{window.__appels.push(['auto',d]);const c='espaces/cabinet-bentahila/exports/auto-1/Onco360_export_semaine_2026-10-04.zip';window.__st[c]={blob:new Blob(['PK-auto'],{type:'application/zip'}),meta:{}};
   const fait=d.action==='maintenant'||window.__fait;if(fait)window.__fait=true;
   return {actif:d.action==='regler'?d.actif:true,garder:d.action==='regler'?d.garder:12,drive:null,dernier:fait?{le:'2026-10-04T00:30:00Z',ok:true,taille:3e6,patients:62,chemin:c}:null,historique:[]}},
 recuperation:async(d)=>{window.__appels.push(['recup',JSON.parse(JSON.stringify(d))]);
   if(d.action==='sources')return {instant:{de:'2026-09-29T10:10:00Z',a:'2026-10-06T09:59:00Z'},exports:[{chemin:'espaces/'+d.espace+'/exports/auto-1/donnees.json.gz',le:'2026-10-04T00:31:00Z',sorte:'auto'},{chemin:'espaces/'+d.espace+'/exports/2/donnees.json.gz',le:'2026-10-01T09:00:00Z',sorte:'manuel'}]};
   if(d.action==='liste')return {patients:window.__uid==='ADM'?[{id:'PX1',numero:'202610001',existe:false},{id:'PX2',numero:'202610002',existe:true}]:[{id:'PX1',nom:'ALPHA Fictif',numero:'202610001',ddn:'1960-01-01',existe:false},{id:'PX2',nom:'BETA Fictive',numero:'202610002',ddn:'',existe:true}],documents:[{col:'parametres',id:'listes',lib:'Paramètres › listes'}]};
   const cible=d.quoi.patient?(window.__uid==='ADM'?'dossier n° 202610001':'dossier ALPHA Fictif n° 202610001'):d.quoi.doc?'Paramètres › listes':'tout le cabinet';
   return {cible,source:'la base telle qu\\'elle était le 06/10/2026 à 09:00',parCol:%s,resume:'…',n:3,crees:1,gardes:0,absent:false,ecrit:!!d.confirmer,copie:'espaces/x/recuperations/1.json.gz',pdf:{remis:1,introuvables:0}}},
 sauvegardesEtat:async()=>({fichiers:{dernier:{le:'2026-10-03T01:15:00Z',copies:3,retires:0,erreurs:0},nuits:[{le:'2026-10-03T01:15:00Z',copies:3,retires:0,erreurs:0},{le:'2026-10-02T01:15:00Z',copies:0,retires:0,erreurs:0,garde:{n:40,total:100}}],alerte:'aucune copie des fichiers depuis 3 jours (dernière : 2026-10-03).'},
   cabinets:[{espace:'cab-test',nom:'Cabinet Test',actif:true,garder:12,dernier:{le:'2026-10-04T00:30:00Z',ok:true,taille:2e6,patients:5,drive:{ok:true}},drive:{email:'x@test.ma'},alerte:''},{espace:'cab-b',nom:'Cabinet B',actif:true,garder:12,dernier:null,drive:null,alerte:'aucun export de la semaine encore fait'}]}),
 fichiersSauvegarder:async()=>{window.__appels.push(['copie']);return {copies:2,retires:0,erreurs:0}},
 listeCabinets:async()=>({cabinets:[{id:'cab-test',nom:'Cabinet Test',cree:'2026-10-09',actif:true,abonnement:{formule:'complet',modules:{}},titulaire:{nom:'Dr Test',email:'t@test.ma'},membres:1,patients:5},{id:'cab-b',nom:'Cabinet B',cree:'2026-10-09',actif:true,abonnement:{formule:'complet',modules:{}},titulaire:{nom:'Dr B',email:'b@test.ma'},membres:1,patients:0}],archives:[]}),
 journalAdmin:async()=>({lignes:[]})};""" % json.dumps(PARCOL)
# Export fictif au format d'Onco360 (fichier de l'ordinateur)
J = {"application": "Onco360", "format": 1, "espace": "cabinet-bentahila", "collections": {"patients": {"PF1": {"identite": dict(numero="202609009", nomF="GAMMA", prenom="Fictif")}, "PF2": {"identite": dict(numero="202609010", nomF="DELTA", prenom="Fictive")}},
     "consultations": {"CF1": {"patientId": "PF1", "note": "RAS"}, "CF2": {"patientId": "PF2", "note": "autre"}}, "parametres": {"listes": {"data": "{}"}}, "membres": {"X": {"role": "medecin"}}}, "dates": {}}
zb = io.BytesIO(); z = zipfile.ZipFile(zb, 'w'); z.writestr('donnees/onco360.json', json.dumps(J)); z.writestr('LISEZMOI.txt', 'test'); z.close()
ZIP = str(ICI.parent / 'tests' / '_export_fictif_test.zip'); open(ZIP, 'wb').write(zb.getvalue())
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Médecin titulaire : Paramètres › Cabinet › Export des données')
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.add_init_script(MOCK)
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/export'); await pg.wait_for_timeout(2500)
        t = await pg.inner_text('#page')
        ok('Exporter tout le cabinet' in t and 'Export automatique de la semaine' in t and 'Récupérer des données' in t and 'En cas de problème' in t, 'quatre parties : export, export de la semaine, récupérer, en cas de problème', t[:300])
        ok('premier export dimanche prochain' in t and 'Pas encore de Google Drive relié' in t, 'export de la semaine : activé, Drive pas encore relié', t[t.find('Export automatique'):][:400])
        await pg.click('#cfExp'); await pg.wait_for_timeout(1200)
        ok(['export', {'espace': 'cabinet-bentahila'}] in await ev('window.__appels') and len(pg.dl) == 1, 'export complet toujours là (téléchargé)')
        await pg.select_option('#rcGarder', '26'); await pg.wait_for_timeout(800)
        ok(['auto', {'espace': 'cabinet-bentahila', 'action': 'regler', 'actif': True, 'garder': 26}] in await ev('window.__appels'), 'réglage : 26 semaines gardées dans le Drive', (await ev('window.__appels'))[-2:])
        await pg.click('#rcMaint'); await pg.wait_for_timeout(1000)
        t = await pg.inner_text('#rcAuto')
        ok('Dernier export' in t and '62 dossier(s)' in t, '« Faire l\'export maintenant » : dernier export affiché', t[:300])
        await pg.click('#rcTel'); await pg.wait_for_timeout(1000)
        ok(len(pg.dl) == 2 and pg.dl[1].suggested_filename == 'Onco360_export_semaine_2026-10-04.zip', 'dernier export de la semaine téléchargé', [d.suggested_filename for d in pg.dl])
        # Récupérer : base à une heure donnée, un dossier
        ok(await ev("document.querySelector('[name=rcSrc][value=instant]').checked") and (await ev("document.getElementById('rcLe').value")) == await ev("(()=>{const d=new Date(Date.now()-3600000),z=(n)=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+'T'+z(d.getHours())+':'+z(d.getMinutes())})()"), 'source par défaut : la base une heure avant (heure locale du navigateur)', await ev("(document.getElementById('rcLe')||{}).value"))
        await pg.click('#rcLire'); await pg.wait_for_timeout(800)
        ap = await ev('window.__appels'); dern = ap[-1][1]
        ok(dern['action'] == 'liste' and dern['source']['type'] == 'instant' and dern['source']['le'].startswith('2026-10-06T'), 'lecture de la source « base à une heure donnée »', dern)
        t = await pg.inner_text('#rcCorps')
        ok('ALPHA Fictif' in t and 'effacé' in t and 'BETA Fictive' in t, 'liste des dossiers de la source, effacé repéré', t[:400])
        await pg.fill('#rcQ', 'alpha'); await pg.wait_for_timeout(300)
        t = await pg.inner_text('#rcPats'); ok('ALPHA' in t and 'BETA' not in t, 'recherche par nom', t)
        await pg.check('[name=rcPid][value=PX1]'); await pg.click('#rcVoir'); await pg.wait_for_timeout(800)
        t = await pg.inner_text('#rcCorps')
        ok('Aperçu : dossier ALPHA Fictif n° 202610001' in t and 'Consultations et ordonnances' in t and 'Récupérer (3 éléments)' in t, 'aperçu : tableau par partie, bouton « Récupérer (3 éléments) »', t[t.find('Aperçu'):][:400])
        await pg.click('#rcOk'); await pg.wait_for_timeout(1200)
        ap = await ev('window.__appels'); app_ = [a for a in ap if a[0] == 'recup' and a[1].get('action') == 'appliquer']
        ok(len(app_) == 1 and app_[0][1]['confirmer'] is True and app_[0][1]['quoi'] == {'patient': 'PX1'}, 'confirmation demandée, puis récupération du bon dossier', app_)
        ok(any('Récupérer dossier ALPHA Fictif' in d for d in pg.dlg), 'fenêtre de confirmation avec le nom du dossier', pg.dlg[-1:])
        t = await pg.inner_text('#rcCorps')
        ok('Fait : dossier ALPHA Fictif' in t and 'Copie faite avant la récupération' in t and 'Recharger Onco360' in t, 'résultat : fait, comment revenir en arrière, recharger', t[-400:])
        # Un export gardé dans Onco360 ; un document du cabinet ; tout le cabinet (avertissement)
        await pg.check('[name=rcSrc][value=export]'); await pg.wait_for_timeout(300)
        o = await ev("[...document.querySelectorAll('#rcEx option')].map(o=>o.textContent)")
        ok(any('Export de la semaine du 04/10/2026' in x for x in o) and any('Export complet du 01/10/2026' in x for x in o), 'exports proposés (semaine, complet)', o)
        await pg.select_option('#rcEx', index=1); await pg.wait_for_timeout(300); await pg.click('#rcLire'); await pg.wait_for_timeout(600)
        ok((await ev('window.__appels'))[-1][1]['source'] == {'type': 'stockage', 'chemin': 'espaces/cabinet-bentahila/exports/auto-1/donnees.json.gz', 'le': '2026-10-04T00:31:00Z'}, 'source : l\'export choisi')
        await ev("document.querySelectorAll('#rcCorps .puce')[1].click()"); await pg.wait_for_timeout(300)
        await pg.select_option('#rcDoc', 'parametres/listes'); await pg.wait_for_timeout(300); await pg.click('#rcVoir'); await pg.wait_for_timeout(600)
        ok((await ev('window.__appels'))[-1][1]['quoi'] == {'doc': ['parametres', 'listes']} and 'Aperçu : Paramètres › listes' in await pg.inner_text('#rcCorps'), 'un document du cabinet (liste)')
        await ev("document.querySelectorAll('#rcCorps .puce')[2].click()"); await pg.wait_for_timeout(300)
        t = await pg.inner_text('#rcCorps'); ok('Tout le cabinet revient comme dans la source' in t and 'l\'équipe et ses droits ne changent pas' in t, 'tout le cabinet : avertissement')
        # Fichier d'export de l'ordinateur : ouvert dans le navigateur, seul le dossier choisi est envoyé
        await pg.check('[name=rcSrc][value=fichier]'); await pg.wait_for_timeout(300)
        await pg.set_input_files('#rcFic', ZIP); await pg.wait_for_timeout(1500)
        ok('2 dossier(s)' in await pg.inner_text('#rcCorps'), 'fichier ouvert : 2 dossiers', await pg.inner_text('#rcCorps'))
        n0 = len(await ev('window.__appels')); await pg.click('#rcLire'); await pg.wait_for_timeout(500)
        ok(len(await ev('window.__appels')) == n0 and 'GAMMA Fictif' in await pg.inner_text('#rcCorps'), 'liste faite dans le navigateur (rien envoyé)')
        await pg.check('[name=rcPid][value=PF1]'); await pg.click('#rcVoir'); await pg.wait_for_timeout(600)
        s = (await ev('window.__appels'))[-1][1]['source']
        ok(s['type'] == 'fichier' and sorted(s['pieces'].keys()) == ['consultations/CF1', 'patients/PF1'], 'seul le dossier choisi est envoyé (pas le fichier entier, ni l\'équipe)', s.get('pieces', {}).keys())
        await pg.click('summary:has-text("En cas de problème")'); await pg.wait_for_timeout(200)
        t = await pg.inner_text('#rcAide'); ok('Notez l\'heure exacte' in t and 'Ne réparez rien à la main' in t and 'numéro de dossier' in t, '« En cas de problème » : heure exacte, ne rien réparer à la main, qui appeler', t[:200])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs); await pg.close()
        print('Téléphone (390 px)')
        pg = await ouvrir(b, S2, w=390, h=844); ev = pg.evaluate; await pg.add_init_script(MOCK)
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/export'); await pg.wait_for_timeout(2500)
        await pg.click('#rcLire'); await pg.wait_for_timeout(600); await pg.check('[name=rcPid][value=PX1]'); await pg.click('#rcVoir'); await pg.wait_for_timeout(600)
        dep = await ev("[...document.querySelectorAll('#rcAuto *, #rcRecup *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>window.innerWidth+1&&!e.closest('.tableau')}).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right)).slice(0,5)")
        ok(not dep and await ev('document.documentElement.scrollWidth') <= 391, 'rien ne dépasse à 390 px (tableau défilant à part)', dep)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs); await pg.close()
        print('Secrétaire')
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'"); await pg.add_init_script(MOCK)
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/export'); await pg.wait_for_timeout(2500)
        ok(not await ev("!!document.getElementById('rcAuto')") and not await ev("!!document.getElementById('rcRecup')"), 'ni export de la semaine ni récupération pour la secrétaire')
        ok(not [a for a in await ev('window.__appels') if a[0] in ('recup', 'auto')], 'aucun appel au serveur')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs); await pg.close()
        print('Administration')
        pa = await ouvrir(b, S2); ev = pa.evaluate; await pa.add_init_script("window.__uid='ADM'"); await pa.add_init_script(MOCK)
        await pa.goto(f'http://localhost:{PORT}/admin.html#cabinets'); await pa.wait_for_timeout(1800)
        t = await pa.inner_text('#page')
        ok('Sauvegardes :' in t and 'aucune copie des fichiers depuis 3 jours' in t and '1 cabinet avec un export de la semaine à vérifier' in t, 'alerte des sauvegardes en haut de l\'onglet Cabinets', t[:300])
        ok('Sauvegardes' in await pa.inner_text('#onglets'), 'onglet « Sauvegardes »')
        await ev("document.querySelector('tr.lc-l[data-fiche=\"cab-test\"]').click()"); await pa.wait_for_timeout(500)
        await ev("document.querySelector('#modal [data-recup=\"cab-test\"]').click()"); await pa.wait_for_timeout(1200)
        ok((await ev('location.hash')) == '#sauvegardes' and (await ev("document.getElementById('rcCab').value")) == 'cab-test', 'fiche du cabinet › « Récupérer des données » : onglet Sauvegardes, cabinet choisi')
        t = await pa.inner_text('#page')
        ok('Copie de secours des fichiers' in t and 'aucune copie des fichiers depuis 3 jours' in t and 'Dernières nuits (2)' in t, 'copie des fichiers : alerte, nuits', t[:400])
        ok('Cabinet B' in t and 'aucun export de la semaine encore fait' in t and 'relié' in t, 'export de la semaine des cabinets (Drive, à vérifier)', t[t.find('Export de la semaine des cabinets'):][:400])
        await pa.click('#svCopier'); await pa.wait_for_timeout(800)
        ok(['copie'] in await ev('window.__appels'), '« Lancer la copie maintenant »')
        await pa.check('[name=rcS][value=base]'); await pa.wait_for_timeout(300)
        ok((await ev("document.getElementById('rcBase').value")) == 'onco360-restauree', 'source : base restaurée à côté (nom proposé)')
        await pa.click('#rcLire'); await pa.wait_for_timeout(700)
        ok((await ev('window.__appels'))[-1][1]['source'] == {'type': 'base', 'nom': 'onco360-restauree'}, 'lecture de la base restaurée', (await ev('window.__appels'))[-1])
        t = await pa.inner_text('#rcA'); ok('202610001' in t and 'effacé' in t and 'ALPHA' not in t, 'numéros de dossier seulement (aucun nom)', t[-300:])
        await pa.fill('#rcNum', '202610001'); await ev("document.getElementById('rcNum').dispatchEvent(new Event('change'))"); await pa.click('#rcVoir'); await pa.wait_for_timeout(700)
        ok((await ev('window.__appels'))[-1][1]['quoi'] == {'patient': 'PX1'} and 'Aperçu : dossier n° 202610001' in await pa.inner_text('#rcA'), 'aperçu par numéro de dossier')
        await pa.click('#rcOk'); await pa.wait_for_timeout(900)
        a = [x for x in await ev('window.__appels') if x[0] == 'recup' and x[1].get('action') == 'appliquer']
        ok(len(a) == 1 and a[0][1]['espace'] == 'cab-test' and a[0][1]['confirmer'] and 'Prévenez le cabinet' in await pa.inner_text('#rcA'), 'récupération dans le bon cabinet, message', a)
        await pa.click('summary:has-text("Mode d\'emploi de l\'administration")'); await pa.wait_for_timeout(200)
        t = await pa.inner_text('#page'); ok('firestore:databases:restore' in t and 'restaurer-export.mjs' in t and 'numéro de dossier' in t, 'mode d\'emploi de l\'administration (base restaurée, cabinet perdu)')
        ok(not pa.errs, 'aucune erreur JavaScript', pa.errs); await pa.close()
        await b.close()
    pathlib.Path(ZIP).unlink(missing_ok=True)
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
