import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# R-A6 (18/10/2026) : Administration › Par spécialité › Bibliothèque et paramètres : « Modèle repris le … ; N différences depuis », aperçu
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
MOCK = """window.__uid='ADM';window.__appels=[];window.__fonctions={
 listeCabinets:async()=>({cabinets:[{id:'cabinet-bentahila',nom:'Cabinet modèle (test)',modele:true,actif:true,cree:'2026-10-01',abonnement:{formule:'complet',modules:{}},titulaire:{nom:'Dr Modèle',email:'m@test.ma'},membres:1,patients:0},
   {id:'cab-test',nom:'Cabinet Test',cree:'2026-10-09',actif:true,abonnement:{formule:'complet',modules:{}},titulaire:{nom:'Dr Test',email:'t@test.ma'},membres:1,patients:0}],archives:[]}),
 modeleReprendre:async(d)=>{window.__appels.push(['reprendre',d]);return {specialite:'Oncologie – Radiothérapie',repris:{le:'2026-10-18T10:00:00Z'},diffs:%s,n:3}},
 modeleAppliquer:async(d)=>{window.__appels.push(['appliquer',d]);return {espace:d.espace,diffs:%s.filter(x=>d.parties.indexOf(x.k)>=0),n:3,ecrit:!!d.confirmer}}};""" % (json.dumps(DIFFS), json.dumps(DIFFS))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S2); ev = pa.evaluate; await pa.add_init_script(MOCK)
        await pa.goto(f'http://localhost:{PORT}/admin.html#specialites'); await pa.wait_for_timeout(1500)
        await ev("(document.querySelector('[data-sous=biblio]')||{click(){}}).click()"); await pa.wait_for_timeout(1200)
        t = await pa.inner_text('body')
        ok('Modèle de la spécialité' in t and 'Cabinet modèle (test)' in t, 'Par spécialité › Bibliothèque et paramètres : carte « Modèle de la spécialité »', t[:200])
        ok('Modèle repris le 18/10/2026 ; 3 différences depuis.' in await ev("document.getElementById('modEtat').textContent"), '« Modèle repris le 18/10/2026 ; 3 différences depuis. »', await ev("document.getElementById('modEtat').textContent"))
        await ev("document.getElementById('modVoir').click()"); await pa.wait_for_timeout(800)
        m = await pa.inner_text('#modal')
        ok('Fiche patient' in m and '2 ajoutés (Score G8, Score)' in m and 'aucune différence' in m, 'aperçu : une ligne par partie, avec le détail', m[:300])
        await ev("document.getElementById('modOk').click()"); await pa.wait_for_timeout(800)
        ap = await ev("window.__appels")
        ok(['reprendre', {'confirmer': True}] in ap and ap[-1] == ['reprendre', {}], '« Reprendre comme modèle » : appel avec confirmer, puis l\'état du modèle relu', ap[-3:])
        ok('repris du cabinet modèle (3 différences)' in await pa.inner_text('body'), 'message « Modèle … repris du cabinet modèle (3 différences) »')
        # Fiche d'un cabinet : « Appliquer le modèle »
        await pa.goto(f'http://localhost:{PORT}/admin.html#cabinets'); await pa.wait_for_timeout(1200)
        await ev("document.querySelector('tr.lc-l[data-fiche=\"cabinet-bentahila\"]').click()"); await pa.wait_for_timeout(500)
        ok(not await ev("!!document.querySelector('#modal [data-modele]')"), 'cabinet modèle : pas de bouton « Appliquer le modèle »')
        await ev("document.getElementById('mX').click()"); await pa.wait_for_timeout(300)
        await ev("document.querySelector('tr.lc-l[data-fiche=\"cab-test\"]').click()"); await pa.wait_for_timeout(500)
        ok(await ev("!!document.querySelector('#modal [data-modele=\"cab-test\"]')"), 'autre cabinet : bouton « Appliquer le modèle »')
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
