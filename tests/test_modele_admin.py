import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# R-A6 (18/10/2026, écran refait le 20/10/2026 : « Modèle des cabinets neufs » en trois étapes) : Administration › Par spécialité : « Modèle repris le … ; N différences depuis », aperçu
# partie par partie, « Reprendre comme modèle » ; fiche d'un cabinet : « Appliquer le modèle » (parties cochées, aperçu, Appliquer). Fonctions
# serveur simulées (le serveur lui-même : tests/emulateur/test-modele.mjs). Cabinets fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2 = json.loads(json.dumps(S)); S2['administrateurs/ADM'] = {'email': 'adm@test.ma'}
DIFFS = [{'k': 'fiche', 'lib': 'Fiche patient', 'n': 2, 'resume': '2 ajoutés (Score G8, Score)'}, {'k': 'consultation', 'lib': 'Formulaires de consultation (et formulaire de chaque type)', 'n': 1, 'resume': '1 changé (RCP)'},
         {'k': 'typesConsult', 'lib': 'Types de consultation', 'n': 0, 'resume': 'aucune différence'}]
MOCK = """window.__uid='ADM';window.__appels=[];window.__nListe=0;window.__fonctions={
 ficheSpecialite:async(d)=>{window.__appels.push(['ficheSpe',d]);return {cabinets:1,fiche:d.fiche}},
 listeCabinets:async()=>({specialites:{'Oncologie – Radiothérapie':{fiche:{types:{ald:'textelong'},sections:{cin:'med'},libs:{mut:'Organisme'}},consultation:{formulaires:[{id:'frcp',nom:'RCP',champs:['type','d','titre','note']}],typesForm:{RCP:'frcp'}}}},
   bibliotheques:[{id:'bib-oncologie',lib:'Oncologie – Radiothérapie',specialites:['Oncologie – Radiothérapie'],existe:true,nb:{protocoles:316,medicaments:120},version:2,versions:[{n:2,le:'2026-10-18T10:00:00Z',notes:'Essai'}]}],__n:++window.__nListe,cabinets:[{id:'cabinet-bentahila',nom:'Cabinet modèle (test)',modele:true,actif:true,cree:'2026-10-01',abonnement:{formule:'complet',modules:{}},titulaire:{nom:'Dr Modèle',email:'m@test.ma'},membres:1,patients:0},
   {id:'cab-test',nom:'Cabinet Test',cree:'2026-10-09',actif:true,abonnement:{formule:'complet',modules:{}},titulaire:{nom:'Dr Test',email:'t@test.ma'},membres:1,patients:0}],archives:[]}),
 modeleReprendre:async(d)=>{window.__appels.push(['reprendre',d]);return {specialite:'Oncologie – Radiothérapie',repris:{le:'2026-10-18T10:00:00Z'},diffs:%s,n:3}},
 modeleEcart:async(d)=>{window.__appels.push(['ecart',d]);return {espace:d.espace,nom:d.espace==='cab-test'?'Cabinet Test':'Cabinet modèle (test)',specialite:'Oncologie – Radiothérapie',modele:d.espace==='cabinet-bentahila',repris:{le:'2026-10-18T10:00:00Z'},n:d.espace==='cab-test'?3:0,
   parties:[{k:'fiche',lib:'Fiche patient',n:2,le:'2026-10-15T09:00:00Z',plus:['Champ propre au cabinet'],moins:[],change:['Mutuelle (nom affiché)']},{k:'bibliotheques',lib:'Bibliothèques de prescription et modèles de documents de radiothérapie',n:1,le:'',plus:['PROPRE AU CABINET X'],moins:[],change:[]},{k:'reglage',lib:'Réglage du cabinet',n:0,le:'',plus:[],moins:[],change:[]}]}},
 modeleAppliquer:async(d)=>{window.__appels.push(['appliquer',d]);return {espace:d.espace,diffs:%s.filter(x=>d.parties.indexOf(x.k)>=0),n:3,ecrit:!!d.confirmer}}};""" % (json.dumps(DIFFS), json.dumps(DIFFS))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S2); ev = pa.evaluate; await pa.add_init_script(MOCK)
        await pa.goto(f'http://localhost:{PORT}/admin.html#specialites'); await pa.wait_for_timeout(1500)
        await ev("(document.querySelector('[data-sous=biblio]')||{click(){}}).click()"); await pa.wait_for_timeout(1200)
        t = await pa.inner_text('body')
        ok('Modèle des cabinets neufs' in t and 'Copier le cabinet du Dr Bentahila dans le modèle' in t and 'Ajuster le modèle' in t and 'Ce que reçoivent les cabinets' in t, 'trois étapes : copier, ajuster, ce que reçoivent les cabinets', t[:300])
        ok('Ensuite le modèle et son cabinet sont indépendants' in t and 'ne touche jamais son cabinet' in t, '« indépendants » dit en clair')
        ok(not await ev("!!document.querySelector('[data-copie]')") and await ev("document.querySelectorAll('[data-publier]').length") == 1, 'un seul bouton de copie (plus de « Recopier depuis le cabinet Bentahila » à part) ; « Publier une version » dans l\'étape 3')
        ok('316 protocoles de chimiothérapie' in t and 'Ouvrir le modèle' in t and 'la même page Paramètres qu\'un médecin' in t and await ev("document.querySelectorAll('[data-fsouvrir]').length") == 0, 'étape 2 : un seul bouton « Ouvrir le modèle » (même page Paramètres qu\'un médecin), plus d\'éditeurs à part')
        ok('Dernière copie : le 18/10/2026. 3 différences' in await ev("document.getElementById('modEtat').textContent"), '« Dernière copie : le 18/10/2026. 3 différences… »', await ev("document.getElementById('modEtat').textContent"))
        # 20/10/2026 : fiche et formulaire du modèle : dans le modèle ouvert dans Onco360 (test_modele_parametres.py)
        await ev("document.getElementById('modVoir').click()"); await pa.wait_for_timeout(800)
        m = await pa.inner_text('#modal')
        ok('Fiche patient' in m and '2 ajoutés (Score G8, Score)' in m and 'aucune différence' in m, 'aperçu : une ligne par partie, avec le détail', m[:300])
        ok('Son cabinet n\'est pas touché' in m and 'Copier dans le modèle' in m, 'fenêtre : « Copier dans le modèle », son cabinet n\'est pas touché')
        n0 = await ev("window.__nListe")
        await ev("document.getElementById('modOk').click()"); await pa.wait_for_timeout(800)
        ap = await ev("window.__appels")
        ok(['reprendre', {'confirmer': True}] in ap and ap[-1] == ['reprendre', {}], '« Copier dans le modèle » : appel avec confirmer, puis l\'état du modèle relu', ap[-3:])
        ok(await ev("window.__nListe") > n0, 'après la copie, le modèle est relu (fiche et formulaire à jour à l\'écran)')
        ok('Cabinet du Dr Bentahila copié dans le modèle' in await pa.inner_text('body') and 'ne dépend plus de son cabinet' in await pa.inner_text('body'), 'message « copié dans le modèle… ne dépend plus de son cabinet »')
        # Fiche d'un cabinet : « Appliquer le modèle »
        await pa.goto(f'http://localhost:{PORT}/admin.html#cabinets'); await pa.wait_for_timeout(1200)
        await ev("document.querySelector('tr.lc-l[data-fiche=\"cabinet-bentahila\"]').click()"); await pa.wait_for_timeout(500)
        ok(not await ev("!!document.querySelector('#modal [data-modele]')"), 'cabinet modèle : pas de bouton « Appliquer le modèle »')
        ok('Différences avec le modèle' in await ev("document.querySelector('#modal [data-ecart=\"cabinet-bentahila\"]').textContent"), 'cabinet du Dr Bentahila : bouton « Différences avec le modèle »')
        await ev("document.querySelector('#modal [data-ecart]').click()"); await pa.wait_for_timeout(700)
        ok('Aucun écart' in await pa.inner_text('#modal') and 'depuis la dernière copie' in await pa.inner_text('#modal'), 'cabinet du Dr Bentahila sans écart : « Aucun écart », « depuis la dernière copie »')
        await ev("document.getElementById('mX').click()"); await pa.wait_for_timeout(300)
        await ev("document.querySelector('tr.lc-l[data-fiche=\"cab-test\"]').click()"); await pa.wait_for_timeout(500)
        ok(await ev("!!document.querySelector('#modal [data-modele=\"cab-test\"]')"), 'autre cabinet : bouton « Appliquer le modèle »')
        # Écart au modèle (lecture seule)
        ok(await ev("!!document.querySelector('#modal [data-ecart=\"cab-test\"]')"), 'bouton « Écart au modèle » dans la fiche du cabinet')
        await ev("document.querySelector('#modal [data-ecart]').click()"); await pa.wait_for_timeout(700)
        m = await pa.inner_text('#modal')
        ok('Écart au modèle – Cabinet Test' in m and 'Ajouté par le cabinet : Champ propre au cabinet' in m and 'Modifié : Mutuelle (nom affiché)' in m and 'modifié le 15/10/2026' in m, 'écart : partie par partie, ajouté / modifié, date de modification', m[:400])
        ok('comme le modèle' in m and 'aucune donnée patient' in m, '« comme le modèle » pour une partie sans écart ; « aucune donnée patient » rappelé')
        ok((await ev("window.__appels"))[-1] == ['ecart', {'espace': 'cab-test'}], 'appel modeleEcart pour cab-test, sans rien écrire (aucun « confirmer »)')
        await ev("document.getElementById('ecNon').click()"); await pa.wait_for_timeout(300)
        await ev("document.querySelector('tr.lc-l[data-fiche=\"cab-test\"]').click()"); await pa.wait_for_timeout(500)
        await ev("document.querySelector('#modal [data-modele]').click()"); await pa.wait_for_timeout(500)
        cases = await ev("[...document.querySelectorAll('[data-mp]')].map(i => [i.dataset.mp, i.checked])")
        ok(len(cases) == 6 and all(c for _, c in cases), '6 parties, toutes cochées', cases)
        ok('Correspondants · Tarifs des consultations : jamais dans le modèle' in await pa.inner_text('#modal'), 'correspondants et tarifs : indiqués « jamais dans le modèle »')
        await ev("document.querySelector('[data-mp=reglage]').click(); document.getElementById('mpVoir').click()"); await pa.wait_for_timeout(800)
        ap = await ev("window.__appels")
        ok(ap[-1][0] == 'appliquer' and 'reglage' not in ap[-1][1]['parties'] and not ap[-1][1].get('confirmer'), 'aperçu demandé pour les parties cochées seulement (sans le réglage)', ap[-1])
        ok('Fiche patient' in await pa.inner_text('#mpRes'), 'aperçu affiché')
        await ev("document.getElementById('mpOk').click()"); await pa.wait_for_timeout(800)
        ap = await ev("window.__appels")
        ok(ap[-1][1].get('confirmer') is True and ap[-1][1]['espace'] == 'cab-test', '« Appliquer » : appel avec confirmer pour cab-test', ap[-1])
        ok('Modèle appliqué à « Cabinet Test »' in await pa.inner_text('body'), 'message « Modèle appliqué à « Cabinet Test » »')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.goto(f'http://localhost:{PORT}/admin.html#specialites'); await pa.wait_for_timeout(1200)
        await ev("(document.querySelector('[data-sous=biblio]')||{click(){}}).click()"); await pa.wait_for_timeout(800)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : sans débordement')
        ok(not pa.errs, 'aucune erreur JavaScript', pa.errs[:2]); await pa.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
