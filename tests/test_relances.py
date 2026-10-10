import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Relances (18.6, 10/10/2026) : liste (retard, échéance proche, fin d'essai), message prêt, WhatsApp / e-mail / téléphone, relance notée,
# modèles des messages. Date des tests : 06/10/2026.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
CABS = """[
{id:'cabinet-bentahila',nom:'Cabinet du Dr Bentahila',modele:true,actif:true,cree:'2026-10-01',titulaire:{nom:'Dr R',email:'r@b.ma'},membres:4,patients:62},
{id:'cab-a',nom:'Cabinet Alpha',cree:'2026-09-01',actif:true,titulaire:{nom:'Dr Alami',email:'a@a.ma',telephone:'0661 11 22 33'},membres:1,patients:5,abonnement:{formule:'onco-pro'},facturation:{mode:'mensuel',echeance:'2026-10-20',paiements:[],relances:[{id:'r1',le:'2026-10-01T09:00:00Z',canal:'email',type:'renouveler'}]}},
{id:'cab-c',nom:'Cabinet Gamma',cree:'2026-09-25',actif:true,titulaire:{nom:'Dr C',email:'c@c.ma'},membres:1,patients:0,abonnement:{formule:'essentiel'},facturation:{mode:'essai',essaiFin:'2026-10-12',paiements:[]}},
{id:'cab-d',nom:'Cabinet Delta',cree:'2026-07-01',actif:true,titulaire:{nom:'Dr Dahbi',email:'d@d.ma',telephone:'0662000000'},membres:1,patients:3,abonnement:{formule:'onco-pro'},facturation:{mode:'mensuel',echeance:'2026-09-01',paiements:[]}},
{id:'cab-f',nom:'Cabinet Ami',cree:'2026-10-01',actif:true,titulaire:{nom:'Dr F',email:'f@f.ma'},membres:1,patients:1,abonnement:{formule:'complet'},facturation:{mode:'gratuit',paiements:[]}}]"""
INIT = "window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__fonctions={listeCabinets:async()=>({cabinets:" + CABS + ",editeur:{raison:'Onco360 SARL',rib:'011 780 0000'}}),facturationCabinet:async(x)=>{window.__rel=x;const f=Object.assign({}," + CABS + ".find(c=>c.id===x.espace).facturation);f.relances=(f.relances||[]).concat([{le:new Date().toISOString(),canal:x.canal,type:x.type}]);return {facturation:f,actif:true}},reglagesAbonnements:async(x)=>{window.__ra=x;return {reglages:x.reglages}}};"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S); await pa.add_init_script(INIT); await pa.set_viewport_size({'width': 1300, 'height': 900})
        await pa.goto(f'http://localhost:{PORT}/admin.html#compta'); await pa.wait_for_timeout(1500)
        rows = await pa.evaluate("[...document.querySelectorAll('[data-rel]')].map(b=>b.dataset.rel)")
        ok(rows == ['cab-d', 'cab-a', 'cab-c'], 'relances : retard (Delta), échéance proche (Alpha), fin d\'essai (Gamma) ; ni gratuit ni votre cabinet ' + str(rows))
        t = await pa.inner_text('#page'); ok('06/10/2026 par E-mail' not in t and '01/10/2026 par E-mail' in t and 'jamais' in t, 'dernière relance affichée (Alpha : 01/10 par e-mail ; les autres : jamais)')
        await pa.click('[data-rel="cab-d"]'); await pa.wait_for_timeout(300)
        m = await pa.input_value('#rlTxt')
        ok('Bonjour Dr Dahbi' in m and '01/09/2026' in m and '35 jours de retard' in m and '2 380 DH' in m and 'RIB 011 780 0000' in m and 'Onco360 SARL' in m, 'message prêt : médecin, échéance, retard, montant dû, RIB')
        await pa.click('#rlWa'); await pa.wait_for_timeout(500)
        u = await pa.evaluate("window.__win[window.__win.length-1].u")
        ok(u.startswith('https://wa.me/212662000000?text=') and 'Dahbi' in u, 'WhatsApp ouvert avec le numéro (+212) et le message')
        ok(await pa.evaluate('window.__rel') == {'espace': 'cab-d', 'action': 'relance', 'canal': 'whatsapp', 'type': 'retard'}, 'relance notée (WhatsApp, retard)')
        await pa.keyboard.press('Escape'); await pa.wait_for_timeout(200)
        await pa.evaluate("location.hash='compta'"); await pa.wait_for_timeout(300)
        await pa.click('[data-rel="cab-c"]'); await pa.wait_for_timeout(300)
        ok('essai gratuit' in await pa.input_value('#rlTxt') and await pa.evaluate("document.getElementById('rlWa').disabled"), 'fin d\'essai : message d\'essai ; pas de WhatsApp sans téléphone')
        await pa.click('#rlTel'); await pa.wait_for_timeout(400)
        ok((await pa.evaluate('window.__rel'))['canal'] == 'telephone', 'relance par téléphone notée')
        await pa.keyboard.press('Escape'); await pa.evaluate("location.hash='compta'"); await pa.wait_for_timeout(300)
        await pa.click('[data-modeles]'); await pa.wait_for_timeout(300)
        await pa.fill('#md_retard', 'Bonjour {medecin}, merci de régler {montant}.'); await pa.click('#mdOk'); await pa.wait_for_timeout(400)
        ok((await pa.evaluate('window.__ra'))['reglages']['modeles']['retard'] == 'Bonjour {medecin}, merci de régler {montant}.', 'modèle de message enregistré')
        await pa.click('[data-rel="cab-d"]'); await pa.wait_for_timeout(300)
        ok(await pa.input_value('#rlTxt') == 'Bonjour Dr Dahbi, merci de régler 2 380 DH.', 'le nouveau modèle sert à la relance suivante')
        await pa.keyboard.press('Escape'); await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(300); await pa.click('[data-fiche="cab-a"]'); await pa.wait_for_timeout(300)
        ok('Dernière relance : 01/10/2026 par E-mail' in await pa.inner_text('#modal') and await pa.evaluate("!!document.querySelector('#modal [data-rel=\"cab-a\"]')"), 'fiche du cabinet : dernière relance et « Relancer »')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.keyboard.press('Escape'); await pa.evaluate("location.hash='compta'"); await pa.wait_for_timeout(400)
        ok(await pa.evaluate("document.documentElement.scrollWidth<=390"), 'à 390 px : rien ne déborde')
        ok(not pa.errs, 'aucune erreur JavaScript ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
