import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Journal de l'Administration (17.5, 10/10/2026) : onglet Journal (période, cabinet, type, recherche, export), bouton Journal de la fiche
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
L = """[{id:'1',le:'2026-10-06T09:30:00Z',type:'suspension',espace:'cab-e',cabinet:'Cabinet Epsilon',txt:'Suspendu automatiquement : échéance du 2026-08-22 non payée depuis 45 jours',parEmail:'Onco360 (automatique)'},
{id:'2',le:'2026-10-05T15:10:00Z',type:'abonnement',espace:'cab-a',cabinet:'Cabinet Alpha',txt:'Paiement de 1190 DH (1 mois) : échéance au 2026-11-15',parEmail:'admin@onco360.ma'},
{id:'3',le:'2026-10-04T08:00:00Z',type:'creation',espace:'cab-a',cabinet:'Cabinet Alpha',txt:'Cabinet créé pour Karim Alami (k@a.ma) · pack Oncologie – Pro · Essai gratuit',parEmail:'admin@onco360.ma'},
{id:'4',le:'2026-10-03T11:00:00Z',type:'packs',espace:'',cabinet:'',txt:'Packs enregistrés (Oncologie – Essentiel, …)',parEmail:'admin@onco360.ma'}]"""
INIT = "window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__nj=0;window.__fonctions={listeCabinets:async()=>({cabinets:[{id:'cab-a',nom:'Cabinet Alpha',cree:'2026-10-04',actif:true,titulaire:{nom:'Dr A',email:'a@a.ma'},membres:1,patients:1,abonnement:{formule:'onco-pro'}}]}),journalAdmin:async(x)=>{window.__nj++;window.__jq=x;return {lignes:" + L + "}},etatCabinet:async(x)=>({actif:x.actif})};"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S); await pa.add_init_script(INIT); await pa.set_viewport_size({'width': 1300, 'height': 900})
        await pa.goto(f'http://localhost:{PORT}/admin.html#journal'); await pa.wait_for_timeout(1500)
        t = await pa.inner_text('#page')
        ok('Journal de l\'Administration' in t and '4 actions' in t and 'Onco360 (automatique)' in t and 'Suspension' in t, 'onglet Journal : 4 actions, suspension automatique signalée')
        ok((await pa.evaluate('window.__jq')).get('du') == '2026-09-07', 'période par défaut : 30 derniers jours (du 07/09/2026)')
        await pa.select_option('#jType', 'abonnement'); await pa.wait_for_timeout(200)
        ok('1 action sur 4' in await pa.inner_text('#page') and 'Paiement de 1190 DH' in await pa.inner_text('#page'), 'filtre par type (Abonnement)')
        await pa.select_option('#jType', ''); await pa.select_option('#jCab', 'cab-a'); await pa.wait_for_timeout(200)
        ok('2 actions sur 4' in await pa.inner_text('#page'), 'filtre par cabinet (Alpha : création, paiement)')
        await pa.select_option('#jCab', ''); await pa.fill('#jQ', 'karim'); await pa.wait_for_timeout(200)
        ok('1 action sur 4' in await pa.inner_text('#page'), 'recherche (« karim »)')
        await pa.fill('#jQ', '')
        async with pa.expect_download() as dl: await pa.click('#jExp')
        f = await (await dl.value).path(); txt = open(f, encoding='utf-8-sig').read()
        ok(txt.startswith('Date;Heure;Action;Cabinet;Détail;Par') and txt.count('\n') == 4 and 'Cabinet Epsilon' in txt, 'export pour Excel (4 lignes)')
        await pa.select_option('#jPer', 'tout'); await pa.wait_for_timeout(400)
        ok(await pa.evaluate('window.__jq') == {} and await pa.evaluate('window.__nj') == 2, 'période « Tout » : journal relu sans limite de date')
        # Depuis la fiche d'un cabinet
        await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(400); await pa.click('[data-fiche="cab-a"]'); await pa.wait_for_timeout(300)
        await pa.click('#modal [data-jcab="cab-a"]'); await pa.wait_for_timeout(600)
        ok(pa.url.endswith('#journal') and await pa.input_value('#jCab') == 'cab-a' and '2 actions sur 4' in await pa.inner_text('#page'), 'bouton « Journal » de la fiche : journal de ce cabinet')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("document.documentElement.scrollWidth<=390"), 'à 390 px : rien ne déborde')
        ok(not pa.errs, 'aucune erreur JavaScript ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
