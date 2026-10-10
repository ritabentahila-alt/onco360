import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Comptabilité de l'Administration (18.2) et finitions (18.1), 10/10/2026 (date des tests : 06/10/2026)
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
CABS = """[
{id:'cabinet-bentahila',nom:'Cabinet du Dr Bentahila',modele:true,actif:true,cree:'2026-10-01',titulaire:{nom:'Dr R',email:'r@b.ma'},membres:4,patients:62},
{id:'cab-a',nom:'Cabinet Alpha',cree:'2026-09-01',actif:true,titulaire:{nom:'Dr A',email:'a@a.ma'},membres:1,patients:5,abonnement:{formule:'onco-pro'},facturation:{mode:'mensuel',prix:900,echeance:'2026-10-20',client:{raison:'SARL Alpha',ice:'001234567000089'},paiements:[{id:'p1',d:'2026-10-02',m:900,periode:'mois',moyen:'virement',ref:'VIR1',apres:'2026-10-20'},{id:'p0',d:'2026-09-02',m:900,periode:'mois',moyen:'virement',apres:'2026-09-20'}]}},
{id:'cab-b',nom:'Cabinet Beta',cree:'2026-03-01',actif:true,titulaire:{nom:'Dr B',email:'b@b.ma'},membres:1,patients:5,abonnement:{formule:'complet'},facturation:{mode:'annuel',echeance:'2027-03-01',paiements:[{id:'p2',d:'2026-03-01',m:29900,periode:'an',moyen:'cheque',ref:'CHQ 77',apres:'2027-03-01'}]}},
{id:'cab-c',nom:'Cabinet Gamma',cree:'2026-09-25',actif:true,titulaire:{nom:'Dr C',email:'c@c.ma'},membres:1,patients:0,abonnement:{formule:'onco-pro'},facturation:{mode:'essai',essaiFin:'2026-10-25',paiements:[]}},
{id:'cab-d',nom:'Cabinet Delta',cree:'2026-07-01',actif:true,titulaire:{nom:'Dr D',email:'d@d.ma'},membres:1,patients:3,abonnement:{formule:'onco-pro'},facturation:{mode:'mensuel',echeance:'2026-09-01',paiements:[]}}]"""
ARCH = "[{id:'cab-e',nom:'Cabinet Epsilon',supprimeLe:'2026-08-01',facturation:{mode:'mensuel',supprime:true,paiements:[{id:'p3',d:'2026-05-10',m:690,periode:'mois',moyen:'especes',apres:'2026-06-10'}]}}]"
INIT = "window.__uid='ADM';window.__ra=null;window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__nl=0;window.__fonctions={listeCabinets:async()=>{window.__nl++;return {cabinets:" + CABS + ",archives:" + ARCH + ",reglagesAbo:window.__ra&&Object.assign({},window.__ra.reglages,{delai:Number(window.__ra.reglages.delai)}),lu:new Date().toISOString()}},reglagesAbonnements:async(x)=>{window.__ra=x;return {reglages:Object.assign({suspension:'demander',delai:30,rappel:15,essai:30},x.reglages,{delai:Number(x.reglages.delai)})}},facturationCabinet:async(x)=>{window.__fact=x;return {facturation:{mode:'mensuel',echeance:'2026-10-20',client:x.client,paiements:[]},actif:true}}};"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S); await pa.add_init_script(INIT); await pa.set_viewport_size({'width': 1300, 'height': 900})
        await pa.goto(f'http://localhost:{PORT}/admin.html#compta'); await pa.wait_for_timeout(1500)
        t = (await pa.inner_text('.tuiles')).replace('\n', ' ')
        ok('900 DH Encaissé ce mois' in t and '32 390 DH Encaissé en 2026' in t, 'encaissé ce mois (900) et cette année (32 390, cabinet supprimé compris) · ' + t[:90])
        ok('900 DH À encaisser (30 j)' in t and '60 j : 1 800 DH' in t and '90 j : 2 700 DH' in t, 'à encaisser 30 / 60 / 90 jours (mensuel ; annuel hors fenêtre)')
        ok('2 380 DH Impayés · 1 cabinet' in t and 'Fins d\'essai (30 j)' in t and '1 190 DH si tous' in t, 'impayés (2 mois × 1 190) et fins d\'essai')
        await pa.select_option('#cpPer', 'tout'); await pa.wait_for_timeout(200)
        ok('32 390 DH · 4 paiements' in await pa.inner_text('#page') and 'Cabinet Epsilon (supprimé)' in await pa.inner_text('#page') and 'SARL Alpha' in await pa.inner_text('#page'), 'encaissements : tous les paiements, cabinet supprimé gardé, raison sociale')
        ok('Chèque' in await pa.inner_text('.rg') and 'Onco-radiothérapie – Clinique' in await pa.inner_text('.rg'), 'répartition par pack et par moyen')
        await pa.select_option('#cpMoy', 'cheque'); await pa.wait_for_timeout(200)
        ok('29 900 DH · 1 paiement' in await pa.inner_text('#page'), 'filtre moyen (chèque)')
        await pa.select_option('#cpMoy', '')
        async with pa.expect_download() as dl: await pa.click('#cpExp')
        txt = open(await (await dl.value).path(), encoding='utf-8-sig').read()
        ok(txt.startswith('Date;Cabinet;Raison sociale;ICE') and '"001234567000089"' in txt and '"32390";Total' in txt and txt.count('\n') == 5, 'export pour le comptable (ICE, total)')
        await pa.select_option('#cpPer', 'perso'); await pa.wait_for_timeout(200); await pa.fill('#cpDu', '2026-09-01'); await pa.press('#cpDu', 'Tab'); await pa.fill('#cpAu', '2026-09-30'); await pa.press('#cpAu', 'Tab'); await pa.wait_for_timeout(300)
        ok('900 DH · 1 paiement' in await pa.inner_text('#page'), 'période personnalisée (septembre)')
        ok(await pa.evaluate("document.querySelectorAll('.evo-b').length") == 12, 'évolution sur 12 mois')
        await pa.click('[data-vf="cab-d"]'); await pa.wait_for_timeout(300)
        ok('Cabinet Delta' in await pa.inner_text('#modal'), 'impayé : clic = fiche du cabinet'); await pa.keyboard.press('Escape')
        # 18.1 : Actualiser, coordonnées de facturation, démonstration dans Nouveau cabinet
        await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(300)
        ok('Chiffres lus à' in await pa.inner_text('#page') and not await pa.evaluate("!!document.querySelector('#page #dCree')"), 'Cabinets : heure de lecture ; plus de carte démonstration dans la liste')
        bd = await pa.inner_text('.avert.rouge-a')
        ok('1 cabinet en retard de plus de 30 jours' in bd and 'Cabinet Delta' in bd and 'à vous de décider' in bd, 'réglage « me demander » : bandeau des cabinets à suspendre (rien n\'est suspendu tout seul)')
        await pa.click('.avert.rouge-a [data-reg-abo]'); await pa.wait_for_timeout(300)
        ok(await pa.is_checked('input[name="raSusp"][value="demander"]'), 'réglages : « Me demander » par défaut')
        await pa.fill('#raDel', '45'); await pa.click('#raOk'); await pa.wait_for_timeout(500)
        ok((await pa.evaluate('window.__ra'))['reglages'] == {'suspension': 'demander', 'delai': '45', 'rappel': '15', 'essai': '30'} and not await pa.evaluate("!!document.querySelector('.avert.rouge-a')"), 'délai porté à 45 jours : Delta (35 j) n\'est plus à décider')
        await pa.click('[data-actu]'); await pa.wait_for_timeout(700)
        ok(await pa.evaluate('window.__nl') == 2, '« Actualiser » relit les cabinets')
        await pa.evaluate("location.hash='compta'"); await pa.wait_for_timeout(300)
        ok('Onco360 vous demande' in await pa.inner_text('#page') and 'après 45 jours' in await pa.inner_text('#page'), 'Comptabilité : rappel des réglages de suspension')
        await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(300)
        await pa.click('[data-fiche="cab-a"]'); await pa.wait_for_timeout(300)
        ok('Facturé à : SARL Alpha · ICE 001234567000089' in await pa.inner_text('#modal'), 'fiche : coordonnées de facturation affichées')
        await pa.click('[data-client="cab-a"]'); await pa.wait_for_timeout(300); await pa.fill('#clAdr', '12 rue X, Rabat'); await pa.click('#clOk'); await pa.wait_for_timeout(500)
        F = await pa.evaluate('window.__fact'); ok(F['action'] == 'client' and F['client']['adresse'] == '12 rue X, Rabat' and F['client']['ice'] == '001234567000089', 'coordonnées de facturation enregistrées')
        await pa.keyboard.press('Escape'); await pa.evaluate("location.hash='nouveau'"); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("!!document.querySelector('#dCree')"), 'Nouveau cabinet : carte « Cabinet de démonstration »')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.evaluate("location.hash='compta'"); await pa.wait_for_timeout(400)
        ok(await pa.evaluate("document.documentElement.scrollWidth<=390"), 'Comptabilité à 390 px : rien ne déborde')
        ok(not pa.errs, 'aucune erreur JavaScript ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
