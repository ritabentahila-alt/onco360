import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Factures (18.4, 10/10/2026) : Mon entreprise, facture à chaque paiement, avoir, facture A4 (HT, TVA 20 %, TTC, en lettres), liste, export
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
ED = "{raison:'Onco360 SARL',forme:'SARL',ice:'001234567000089',if:'4455',rc:'Casablanca 123',patente:'778',adresse:'1 bd Anfa',ville:'Casablanca',tel:'0522',email:'f@onco360.ma',rib:'011 780 0000',banque:'BMCE',mentions:'Merci',tva:20}"
F1 = "{id:'fa1',numero:'F-2026-0001',type:'facture',annee:2026,rang:1,d:'2026-10-02',espace:'cab-a',cabinet:'Cabinet Alpha',client:{raison:'SARL Alpha',ice:'001112223334445',adresse:'Rabat'},editeur:" + ED + ",lignes:[{lib:'Abonnement Onco360 – Oncologie – Pro – 1 mois',du:'2026-09-20',au:'2026-10-20',ttc:1190,ht:991.67,tva:198.33,taux:20}],ttc:1190,ht:991.67,tva:198.33,taux:20,paiement:{id:'p1',d:'2026-10-02',moyen:'virement',ref:'VIR1'},ref:'',le:'2026-10-02T10:00:00Z'}"
AV1 = F1.replace("id:'fa1',numero:'F-2026-0001',type:'facture'", "id:'av1',numero:'AV-2026-0001',type:'avoir'").replace("ref:'',le", "ref:'F-2026-0001',le")
CABS = "[{id:'cab-a',nom:'Cabinet Alpha',cree:'2026-09-01',actif:true,titulaire:{nom:'Dr A',email:'a@a.ma'},membres:1,patients:5,abonnement:{formule:'onco-pro'},facturation:{mode:'mensuel',echeance:'2026-10-20',paiements:[{id:'p1',d:'2026-10-02',m:1190,periode:'mois',moyen:'virement',apres:'2026-10-20',facture:'F-2026-0001',factureId:'fa1'},{id:'p0',d:'2026-09-02',m:1190,periode:'mois',moyen:'virement',apres:'2026-09-20'}]}}]"
INIT = "window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__ed=null;window.__fonctions={listeCabinets:async()=>({cabinets:" + CABS + ",editeur:window.__ed,factures:[" + AV1 + "," + F1 + "]}),editeurEnregistrer:async(x)=>{window.__ed=x.editeur;return {editeur:x.editeur,manque:[]}},facturationCabinet:async(x)=>{window.__fact=x;const nv=Object.assign({}," + F1 + ",{id:'fa2',numero:'F-2026-0002'});const f=" + CABS + "[0].facturation;if(x.action==='paiement')f.paiements.push({id:'p9',d:x.paiement.d,m:Number(x.paiement.m),periode:'mois',moyen:'virement',apres:'2026-11-20',facture:'F-2026-0002',factureId:'fa2'});return {facturation:f,actif:true,factures:x.action==='paiement'||x.action==='facturer'?[nv]:[]}}};"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S); await pa.add_init_script(INIT); await pa.set_viewport_size({'width': 1300, 'height': 900})
        await pa.goto(f'http://localhost:{PORT}/admin.html#compta'); await pa.wait_for_timeout(1500)
        ok('complétez Mon entreprise' in await pa.inner_text('#page'), 'Comptabilité : « Mon entreprise » à compléter avant les factures')
        await pa.click('.avert [data-editeur]'); await pa.wait_for_timeout(300)
        for k, v in [('raison', 'Onco360 SARL'), ('ice', '001234567000089'), ('if', '4455'), ('adresse', '1 bd Anfa'), ('ville', 'Casablanca')]: await pa.fill('#ed_' + k, v)
        await pa.click('#edOk'); await pa.wait_for_timeout(500)
        ok((await pa.evaluate('window.__ed'))['ice'] == '001234567000089' and 'les factures peuvent être créées' in await pa.inner_text('body') and 'complétez Mon entreprise' not in await pa.inner_text('#page'), 'Mon entreprise enregistré (mentions obligatoires)')
        await pa.select_option('#cpPer', 'tout'); await pa.wait_for_timeout(300); t = await pa.inner_text('#page')
        ok('F-2026-0001' in t and 'AV-2026-0001' in t and 'annule F-2026-0001' in t and 'TTC 0,00 DH' in t, 'liste des factures : facture et avoir (total TTC net : 0)')
        await pa.click('[data-vfac="fa1"]'); await pa.wait_for_timeout(400)
        h = await pa.evaluate("window.__win[window.__win.length-1].w.document._h")
        ok('FACTURE' in h and 'N° F-2026-0001' in h and '991,67 DH' in h and '198,33 DH' in h and '1 190,00 DH' in h and 'mille cent quatre-vingt-dix dirhams' in h and 'ICE 001234567000089' in h and 'ICE 001112223334445' in h and 'Payée le 02/10/2026 par virement' in h, 'facture A4 : HT, TVA 20 %, TTC, montant en lettres, ICE éditrice et client, payée le')
        await pa.click('[data-vfac="av1"]'); await pa.wait_for_timeout(300)
        h = await pa.evaluate("window.__win[window.__win.length-1].w.document._h"); ok('AVOIR' in h and 'Annule la facture F-2026-0001' in h and '− 1 190,00 DH' in h, 'avoir A4 (annule la facture)')
        async with pa.expect_download() as dl: await pa.click('#faExp')
        txt = open(await (await dl.value).path(), encoding='utf-8-sig').read()
        ok(txt.startswith('Numéro;Type;Date;Client') and '"F-2026-0001";"Facture"' in txt and '"-1190,00"' in txt, 'export des factures (avoir en négatif)')
        # Fiche du cabinet : facture d'un paiement, « Créer la facture », nouveau paiement → facture
        await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(300); await pa.click('[data-fiche="cab-a"]'); await pa.wait_for_timeout(300)
        await pa.evaluate("document.querySelector('#modal details.paie').open=true")
        ok(await pa.evaluate("!!document.querySelector('#modal [data-vfac=\"fa1\"]') && !!document.querySelector('#modal [data-facturer=\"cab-a:p0\"]')"), 'paiements : lien vers la facture ; « Créer la facture » pour un ancien paiement')
        await pa.click('#modal [data-facturer="cab-a:p0"]'); await pa.wait_for_timeout(500)
        ok((await pa.evaluate('window.__fact')) == {'espace': 'cab-a', 'action': 'facturer', 'id': 'p0'}, 'ancien paiement facturé')
        await pa.click('#modal [data-paye="cab-a"]'); await pa.wait_for_timeout(300); await pa.click('#pOk'); await pa.wait_for_timeout(600)
        ok('Facture F-2026-0002 créée' in await pa.inner_text('body'), 'nouveau paiement : facture créée (message)')
        ok(not pa.errs, 'aucune erreur JavaScript ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
