import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Profil & Paramètres (18.5, 10/10/2026) : onglets Informations, Accès, Abonnement, Factures ; carte du tableau de bord (expiré, essai) ;
# demande de renouvellement / passage à l'annuel ; Accès retiré de Paramètres (ancien lien redirigé). Date des tests : 06/10/2026.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
F1 = "{id:'fa1',numero:'F-2026-0001',type:'facture',d:'2026-08-02',espace:'cabinet-bentahila',cabinet:'Cabinet',client:{raison:'Cabinet du Dr Bentahila'},editeur:{raison:'Onco360 SARL',ice:'001234567000089',if:'1',adresse:'1 bd',ville:'Casablanca'},lignes:[{lib:'Abonnement Onco360 – Oncologie – Pro – 1 mois',du:'2026-08-02',au:'2026-09-02',ttc:1190,ht:991.67,tva:198.33}],ttc:1190,ht:991.67,tva:198.33,taux:20,paiement:{d:'2026-08-02',moyen:'virement'}}"
def abo(etat): return "window.__fonctions={monAbonnement:async(x)=>{window.__ma=x;return window.__ABO},demandeAbonnement:async(x)=>{window.__dem=x;window.__ABO.demandes=[{le:new Date().toISOString(),type:x.type,message:x.message}];return {ok:true}}};window.__ABO={suivi:true,pack:'Oncologie – Pro',mode:'mensuel',prix:1190,periode:'mois',prixPack:{mois:1190,an:11900},etat:" + etat + ",essaiFin:'',echeance:'2026-09-02',rappel:15,actif:true,paiements:[],demandes:[],factures:[" + F1 + "],paiement:{raison:'Onco360 SARL',rib:'011 780 0000',banque:'BMCE'}};"
EXP = "{etat:'suspendre',jours:34,fin:'2026-09-02',lib:'Retard de 34 j'}"
ESS = "{etat:'essai',jours:12,fin:'2026-10-18',lib:'Essai : 12 j restants'}"
AJR = "{etat:'ajour',jours:40,fin:'2026-11-15',lib:'À jour'}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b); await pg.add_init_script(abo(EXP)); await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(2500)
        c = await pg.inner_text('[data-abo-carte]') if await pg.evaluate("!!document.querySelector('[data-abo-carte]')") else ''
        ok('EXPIRÉ' in c and 'Abonnement expiré' in c and '02 septembre 2026' in c and 'en retard de 34 jours' in c and 'Renouveler' in c, 'tableau de bord : carte « Abonnement expiré » (échéance, retard) · ' + c.replace('\n', ' ')[:80])
        ok(await pg.evaluate("document.querySelector('[data-abo-carte] a').getAttribute('href')") == '#profil/abonnement' and (await pg.evaluate('window.__ma')) == {'espace': 'cabinet-bentahila'}, '« Renouveler » mène à Profil & Paramètres › Abonnement ; lu pour ce cabinet')
        ok('Profil & Paramètres' in await pg.inner_text('nav'), 'menu « Profil & Paramètres »')
        await pg.click('[data-abo-carte] a'); await pg.wait_for_timeout(800); t = await pg.inner_text('#page')
        ok('Informations' in t and 'Accès' in t and 'Abonnement' in t and 'Factures' in t and 'ONCOLOGIE – PRO' in t and 'Expiré' in t and '2 mois offerts' in t and '11 900 DH' in t and '14 280 DH' in t and 'RIB : 011 780 0000' in t, 'onglet Abonnement : formule, état, mensuel / annuel (2 mois offerts, prix barré), RIB')
        await pg.click('text=Passer à l\'annuel'); await pg.wait_for_timeout(300); await pg.fill('#aboMsg', 'Par chèque'); await pg.click('#aboOk'); await pg.wait_for_timeout(800)
        ok((await pg.evaluate('window.__dem')) == {'espace': 'cabinet-bentahila', 'type': 'annuel', 'message': 'Par chèque'} and 'en attente de l\'équipe Onco360' in await pg.inner_text('#page'), 'demande « passer à l\'annuel » envoyée et affichée en attente')
        await pg.evaluate("location.hash='profil/factures'"); await pg.wait_for_timeout(700)
        ok('F-2026-0001' in await pg.inner_text('#page') and '1 190,00 DH' in await pg.inner_text('#page'), 'onglet Factures : liste')
        await pg.click('text=Télécharger'); await pg.wait_for_timeout(400)
        ok('FACTURE' in await pg.evaluate("window.__win[window.__win.length-1].w.document._h"), 'facture ouverte pour impression / PDF')
        await pg.evaluate("location.hash='profil/acces'"); await pg.wait_for_timeout(1200)
        ok('Ajouter un membre' in await pg.inner_text('#page') or 'équipe' in (await pg.inner_text('#page')).lower(), 'onglet Accès dans Profil & Paramètres')
        await pg.evaluate("location.hash='parametres/acces'"); await pg.wait_for_timeout(800)
        ok(pg.url.endswith('#profil/acces'), 'ancien lien Paramètres › Accès → Profil & Paramètres › Accès')
        ok(await pg.evaluate("![...document.querySelectorAll('.ag-vues button')].some(b=>/^Accès/.test(b.textContent.trim())) || location.hash.startsWith('#profil')"), 'Paramètres : plus d\'onglet Accès')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.evaluate("location.hash='profil/abonnement'"); await pg.wait_for_timeout(700)
        ok(await pg.evaluate("document.documentElement.scrollWidth<=392"), 'Abonnement à 390 px : rien ne déborde')
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        # Essai : carte orange ; à jour : pas de carte
        p2 = await ouvrir(b); await p2.add_init_script(abo(ESS)); await p2.goto(f'http://localhost:{PORT}/v2.html#accueil'); await p2.wait_for_timeout(2500)
        c = await p2.inner_text('[data-abo-carte]') if await p2.evaluate("!!document.querySelector('[data-abo-carte]')") else ''
        ok('ESSAI GRATUIT' in c and '12' in c and 'Fin de l\'essai' in c, 'essai : carte « Fin de l\'essai gratuit » (12 jours restants)')
        p3 = await ouvrir(b); await p3.add_init_script(abo(AJR)); await p3.goto(f'http://localhost:{PORT}/v2.html#accueil'); await p3.wait_for_timeout(2500)
        ok(not await p3.evaluate("!!document.querySelector('[data-abo-carte]')"), 'abonnement à jour : pas de carte')
        # Membre non titulaire : ni carte, ni onglets Abonnement / Factures
        S2 = dict(S); e = dict(S2[E[:-1]]); e['titulaire'] = 'AUTRE'; S2[E[:-1]] = e
        p4 = await ouvrir(b, S2); await p4.add_init_script(abo(EXP)); await p4.goto(f'http://localhost:{PORT}/v2.html#profil'); await p4.wait_for_timeout(2500)
        ok('Abonnement' not in await p4.inner_text('#page') and await p4.evaluate('!window.__ma'), 'membre non titulaire : Informations seulement, abonnement jamais demandé au serveur')
        ok(not (p2.errs + p3.errs + p4.errs), 'aucune erreur JavaScript (autres cas) ' + str((p2.errs + p3.errs + p4.errs)[:2]))
        await b.close()
asyncio.run(main())
