import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Tableau de bord (audit externe, 11/10/2026) : deux colonnes sur grand écran (programme du jour à gauche), bloc « À valider /
# À faire » selon le rôle, pictogrammes au trait (aucun émoji), abonnement en bandeau pendant l'essai, organisation du cabinet
# (parametres/accueil), une colonne sur tablette et téléphone.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
SH = pathlib.Path(os.environ.get('CAPTURES', '/tmp'))
U = f'http://localhost:{PORT}/v2.html#accueil'
EMOJI = r"/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.getElementById('page').innerText)"
S3 = json.loads(json.dumps(S))
for u, r in [('SEC', 'assistante'), ('INF', 'infirmiere')]:
    S3[E+'membres/'+u] = {"role": r, "nom": u, "email": u.lower()+"@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {}}
    S3['utilisateurs/'+u] = {"nom": u, "prenom": "Test"}
def abo(etat, jours, fin): return "window.__fonctions={monAbonnement:async()=>({suivi:true,pack:'Oncologie – Pro',mode:'essai',periode:'mois',prixPack:{mois:1190,an:11900},etat:{etat:'" + etat + "',jours:" + str(jours) + ",fin:'" + fin + "'},essaiFin:'" + fin + "',paiements:[],demandes:[],factures:[]})};"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # Médecin, 1440 px
        pg = await ouvrir(b, S3, w=1440); await pg.goto(U); await pg.wait_for_timeout(2500)
        r = await pg.evaluate("""(()=>{const g=document.querySelector('.tb-grille');if(!g)return null;const c=[...g.querySelectorAll(':scope>.tb-col')];
          return {cols:getComputedStyle(g).gridTemplateColumns.split(' ').length,gauche:[...c[0].querySelectorAll(':scope>.tb-c>section')].map(s=>s.className),droite:[...c[1].querySelectorAll(':scope>.tb-c>section')].map(s=>s.className),h:document.documentElement.scrollHeight}})()""")
        ok(r and r['cols'] == 2 and r['gauche'][0].startswith('jour') and any('afaire' in x for x in r['droite']), f'1440 px : deux colonnes, programme du jour à gauche, « À valider » à droite ({r})')
        t = await pg.inner_text('#page')
        ok('À valider par le médecin' in t, 'médecin : bloc « À valider par le médecin »')
        ok(not await pg.evaluate(EMOJI), 'aucun émoji sur le tableau de bord (pictogrammes au trait)')
        ok('Bonjour' in t and '👋' not in t, '« Bonjour » sans main')
        ok(not await pg.evaluate("/Séance \\d+ \\/ \\d+(?! prévue)/.test(document.getElementById('page').innerText)"), 'radiothérapie : « Séance n / N prévue » (calcul de calendrier), jamais présenté comme fait')
        ok(await pg.evaluate("[...document.querySelectorAll('.sept .evi svg')].length>0 || !document.querySelector('.sept .ev')"), '7 prochains jours : pictogrammes au trait')
        ok(not await pg.evaluate("[...document.querySelectorAll('#blocTaches .ta-mini b')].some(b=>/^Valider (le contourage|la dosimétrie|la fin)/.test(b.textContent))"), 'Mes tâches : contourage / dosimétrie / fin de RT laissés au bloc « À valider »')
        await pg.screenshot(path=str(SH / 'accueil-1440.png'), full_page=True)
        print('   hauteur à 1440 px :', r and r['h'], 'px (avant : 2 693 px d\'après l\'audit)')
        # 1100 px et 390 px : une colonne, programme du jour avant « À valider »
        for w in (1100, 390):
            await pg.set_viewport_size({'width': w, 'height': 900}); await pg.wait_for_timeout(400)
            o = await pg.evaluate("(()=>{const j=document.querySelector('section.jour').getBoundingClientRect(),a=document.querySelector('section.afaire').getBoundingClientRect();return {j:j.top,a:a.top,jl:j.left,al:a.left,sw:document.documentElement.scrollWidth,iw:innerWidth}})()")
            ok(o['j'] < o['a'] and abs(o['jl'] - o['al']) < 2 and o['sw'] <= o['iw'], f'{w} px : une colonne, programme du jour d\'abord, rien ne déborde ({o})')
        await pg.screenshot(path=str(SH / 'accueil-390.png'), full_page=True)
        ok(not pg.errs, 'médecin : aucune erreur JavaScript ' + str(pg.errs[:2]))
        # Secrétaire
        ps = await ouvrir(b, S3, w=1440); await ps.add_init_script("window.__uid='SEC'"); await ps.goto(U); await ps.wait_for_timeout(2500)
        t = await ps.inner_text('#page')
        ok('À faire par la secrétaire' in t and 'À valider par le médecin' not in t, 'secrétaire : bloc « À faire par la secrétaire »')
        ok(not await ps.evaluate("[...document.querySelectorAll('#page section h3')].some(h=>h.textContent.trim().startsWith('Rappels WhatsApp'))"), 'secrétaire : rappels dans « À faire » (plus de carte séparée)')
        ok(not await ps.evaluate(EMOJI) and not ps.errs, 'secrétaire : aucun émoji, aucune erreur ' + str(ps.errs[:2]))
        await ps.screenshot(path=str(SH / 'accueil-secretaire.png'), full_page=True)
        # Infirmière
        pi = await ouvrir(b, S3, w=1440); await pi.add_init_script("window.__uid='INF'"); await pi.goto(U); await pi.wait_for_timeout(2500)
        ok('À faire par l\'infirmière' in await pi.inner_text('#page') and not pi.errs, 'infirmière : bloc « À faire par l\'infirmière » ' + str(pi.errs[:2]))
        # Organisation du cabinet (Paramètres › Cabinet › Tableau de bord) : parametres/accueil
        S4 = json.loads(json.dumps(S3)); S4[E+'parametres/accueil'] = {"data": json.dumps({"cartes": {"sept": False}, "col": {"stats": "d"}})}
        pc = await ouvrir(b, S4, w=1440); await pc.goto(U); await pc.wait_for_timeout(2500)
        r = await pc.evaluate("(()=>{const c=[...document.querySelectorAll('.tb-grille>.tb-col')];return {sept:!!document.querySelector('section.sept'),stats:!!c[1]&&!!c[1].querySelector('.kpi')}})()")
        ok(not r['sept'] and r['stats'], f'réglage du cabinet : « 7 prochains jours » retiré, statistiques dans la colonne de droite ({r})')
        await pc.evaluate("window.majAccueilCab(null)"); await pc.wait_for_timeout(300)
        ok(await pc.evaluate("!!document.querySelector('section.sept')"), 'window.majAccueilCab : la page se refait tout de suite')
        # Abonnement : essai à 20 jours = bandeau ; 5 derniers jours = carte dans la colonne de droite (après le programme du jour)
        pa = await ouvrir(b, S3, w=1440); await pa.add_init_script(abo('essai', 20, '2026-10-26')); await pa.goto(U); await pa.wait_for_timeout(2500)
        ok(await pa.evaluate("!!document.querySelector('.abo-band') && !document.querySelector('.abo-c')"), 'essai (20 jours) : bandeau d\'une ligne, pas de grande carte')
        pb = await ouvrir(b, S3, w=1440); await pb.add_init_script(abo('essai', 5, '2026-10-11')); await pb.goto(U); await pb.wait_for_timeout(2500)
        ok(await pb.evaluate("!!document.querySelector('.tb-col #accAbo .abo-c')"), 'essai (5 derniers jours) : carte en haut de la colonne de droite')
        await pb.set_viewport_size({'width': 390, 'height': 900}); await pb.wait_for_timeout(400)
        ok(await pb.evaluate("document.querySelector('section.jour').getBoundingClientRect().top < document.querySelector('.abo-c').getBoundingClientRect().top"), 'téléphone : la carte d\'abonnement vient après le programme du jour')
        pr = await ouvrir(b, S3, w=1440); await pr.add_init_script(abo('retard', 0, '2026-09-30')); await pr.goto(U); await pr.wait_for_timeout(2500)
        ok(await pr.evaluate("!!document.querySelector('#accAbo .abo-c.rouge')"), 'retard : carte rouge (colonne de droite)')
        await b.close()
asyncio.run(main())
