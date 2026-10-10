import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Abonnements (17.4) et liste des cabinets (17.3), 10/10/2026 : tuiles (revenu, essai, à renouveler, retard), tri, filtre, fiche
# (abonnement, paiements, activité, actions regroupées), paiement, réglage de l'abonnement, prix des packs, nouveau cabinet.
import datetime
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
J = datetime.date(2026, 10, 6); d = lambda n: (J + datetime.timedelta(days=n)).isoformat()
CABS = f"""[
{{id:'cabinet-bentahila',nom:'Cabinet du Dr Bentahila',modele:true,actif:true,cree:'2026-10-01',titulaire:{{nom:'Dr Rita BENTAHILA',email:'r@b.ma'}},membres:4,patients:62,activite:{{derniere:new Date().toISOString(),par:'Dr Rita BENTAHILA',n30:420}}}},
{{id:'cab-a',nom:'Cabinet Alpha',cree:'2026-10-02',actif:true,titulaire:{{nom:'Dr A',email:'a@a.ma'}},membres:2,patients:10,abonnement:{{formule:'onco-pro'}},facturation:{{mode:'mensuel',echeance:'{d(40)}',paiements:[]}},activite:{{derniere:new Date(Date.now()-3*864e5).toISOString(),par:'Dr A',n30:12}}}},
{{id:'cab-b',nom:'Cabinet Beta',cree:'2026-10-03',actif:true,titulaire:{{nom:'Dr B',email:'b@b.ma'}},membres:1,patients:3,abonnement:{{formule:'complet'}},facturation:{{mode:'annuel',echeance:'{d(10)}',paiements:[]}}}},
{{id:'cab-c',nom:'Cabinet Gamma',cree:'2026-10-04',actif:true,titulaire:{{nom:'Dr C',email:'c@c.ma'}},membres:1,patients:0,abonnement:{{formule:'essentiel'}},facturation:{{mode:'essai',essaiFin:'{d(20)}',paiements:[]}}}},
{{id:'cab-d',nom:'Cabinet Delta',cree:'2026-10-05',actif:true,titulaire:{{nom:'Dr D',email:'d@d.ma'}},membres:1,patients:7,abonnement:{{formule:'onco-pro'}},facturation:{{mode:'mensuel',prix:900,echeance:'{d(-12)}',paiements:[]}}}},
{{id:'cab-e',nom:'Cabinet Epsilon',cree:'2026-10-06',actif:false,suspenduAuto:true,titulaire:{{nom:'Dr E',email:'e@e.ma'}},membres:1,patients:4,abonnement:{{formule:'onco-pro'}},facturation:{{mode:'mensuel',echeance:'{d(-45)}',suspenduPour:'{d(-45)}',paiements:[]}}}},
{{id:'cab-f',nom:'Cabinet Ami',cree:'2026-10-07',actif:true,titulaire:{{nom:'Dr F',email:'f@f.ma'}},membres:1,patients:2,abonnement:{{formule:'complet'}},facturation:{{mode:'gratuit',paiements:[]}}}}]"""
INIT = "window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__fonctions={listeCabinets:async()=>({cabinets:" + CABS + "}),facturationCabinet:async(x)=>{window.__fact=x;const f={mode:'mensuel',echeance:'" + d(60) + "',paiements:[{id:'p1',d:'" + J.isoformat() + "',m:1190,periode:'mois',moyen:'virement',apres:'" + d(60) + "'}],journal:[{le:new Date().toISOString(),txt:'Paiement'}]};return {facturation:x.action==='paiement'?f:Object.assign({paiements:[],journal:[]},x.reglage||{}),actif:true}},creerCabinet:async(x)=>{window.__cree=x;return {espace:'cab-x',existant:true,protocoles:3}},formulesEnregistrer:async(x)=>{window.__fml=x;return {formules:x.formules,cabinets:0}}};"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pa = await ouvrir(b, S); await pa.add_init_script(INIT); await pa.set_viewport_size({'width': 1300, 'height': 900})
        await pa.goto(f'http://localhost:{PORT}/admin.html#cabinets'); await pa.wait_for_timeout(1500)
        t = await pa.inner_text('.tuiles')
        # revenu : Alpha 1 190 + Beta 29 900/12 = 2 492 + Delta 900 = 4 582 DH (essai, gratuit, suspendu, votre cabinet : 0)
        ok('4 582 DH' in t and 'Revenu mensuel (TTC)' in t, 'revenu mensuel = abonnements payants des cabinets actifs (annuel au 1/12) ' + t.replace('\n', ' ')[:120])
        n = lambda f: pa.evaluate(f"document.querySelector('[data-paie=\"{f}\"] b').textContent")
        ok(await n('essai') == '1' and await n('renouveler') == '1' and await n('retard') == '2', 'tuiles : 1 en essai, 1 à renouveler, 2 en retard')
        row = lambda k: pa.inner_text(f'[data-fiche="{k}"]')
        ok('Essai : 20 j restants' in await row('cab-c') and 'À renouveler (10 j)' in await row('cab-b') and 'Retard de 12 j' in await row('cab-d') and 'Gratuit' in await row('cab-f') and 'Votre cabinet' in await row('cabinet-bentahila') and 'retard de paiement' in await row('cab-e'), 'colonne Abonnement : essai, à renouveler, retard, gratuit, votre cabinet ; suspendu pour retard')
        ok('il y a 3 j' in await row('cab-a') and "aujourd'hui" in await row('cabinet-bentahila'), 'colonne Activité (dernière action)')
        await pa.click('[data-paie="retard"]'); await pa.wait_for_timeout(200)
        ok(await pa.evaluate("[...document.querySelectorAll('[data-fiche]')].map(e=>e.dataset.fiche)") == ['cab-e', 'cab-d'] or sorted(await pa.evaluate("[...document.querySelectorAll('[data-fiche]')].map(e=>e.dataset.fiche)")) == ['cab-d', 'cab-e'], 'clic sur « En retard » : les 2 cabinets en retard')
        await pa.click('.tuile[data-paie="tous"]'); await pa.wait_for_timeout(200)
        ok(await pa.evaluate("document.querySelectorAll('[data-fiche]').length") == 7, 'clic sur la tuile « Cabinets » : tous les cabinets de nouveau')
        await pa.fill('#cQ', 'introuvable'); await pa.wait_for_timeout(200); await pa.click('.liste-c, section.carte button.lien[data-paie="tous"]') if False else None
        await pa.click('section.carte button.lien[data-paie="tous"]'); await pa.wait_for_timeout(200)
        ok(await pa.evaluate("document.querySelectorAll('[data-fiche]').length") == 7 and await pa.input_value('#cQ') == '', 'liste vide : « Effacer les filtres »')
        await pa.click('[data-tri="dossiers"]'); await pa.wait_for_timeout(200)
        ok((await pa.evaluate("[...document.querySelectorAll('[data-fiche]')].map(e=>e.dataset.fiche)"))[0] == 'cabinet-bentahila', 'tri par dossiers (décroissant)')
        await pa.click('[data-tri="nom"]'); await pa.wait_for_timeout(200)
        ok((await pa.evaluate("[...document.querySelectorAll('[data-fiche]')].map(e=>e.dataset.fiche)"))[:2] == ['cab-a', 'cab-f'], 'tri par nom (Alpha, Ami…)')
        # Fiche : abonnement, actions regroupées
        await pa.click('[data-fiche="cab-d"]'); await pa.wait_for_timeout(300); f = await pa.inner_text('#modal')
        ok('900 DH par mois' in f and 'prix du pack : 1 190 DH' in f and "Onco360 vous demande s'il faut le suspendre" in f and 'Zone sensible' in f and 'Accès du médecin' in f, 'fiche : abonnement (prix remisé ; retard : Onco360 vous demandera, réglage par défaut), actions regroupées')
        await pa.click('[data-paye="cab-d"]'); await pa.wait_for_timeout(300)
        ok(await pa.input_value('#pM') == '900' and 'Nouvelle échéance' in await pa.inner_text('#pAp'), 'paiement : montant proposé (prix du cabinet), nouvelle échéance affichée')
        await pa.fill('#pRef', 'VIR-123'); await pa.click('#pOk'); await pa.wait_for_timeout(500)
        F = await pa.evaluate('window.__fact')
        ok(F['action'] == 'paiement' and F['espace'] == 'cab-d' and F['paiement']['m'] == '900' and F['paiement']['ref'] == 'VIR-123' and F['paiement']['periode'] == 'mois', 'paiement envoyé (montant, période, référence)')
        ok('Paiements (1)' in await pa.inner_text('#modal') and 'Paiement de 900 DH enregistré' in await pa.inner_text('body'), 'fiche rouverte : paiement listé, message flottant')
        ok(await pa.evaluate("getComputedStyle(document.querySelector('.ok.bandeau')).position") == 'fixed', 'message toujours visible (flottant)')
        await pa.keyboard.press('Escape')
        # Réglage de l'abonnement : gratuit sans limite
        await pa.click('[data-fiche="cab-c"]'); await pa.wait_for_timeout(300); await pa.click('[data-abo="cab-c"]'); await pa.wait_for_timeout(300)
        await pa.select_option('#abMode', 'gratuit'); await pa.fill('#abNote', 'Ami'); await pa.check('#abJam'); await pa.click('#abOk'); await pa.wait_for_timeout(500)
        F = await pa.evaluate('window.__fact')
        ok(F['action'] == 'regler' and F['reglage']['mode'] == 'gratuit' and F['reglage']['note'] == 'Ami' and F['reglage']['jamaisSuspendre'] is True, 'abonnement réglé : gratuit sans limite (note), jamais suspendu automatiquement')
        await pa.keyboard.press('Escape')
        # Nouveau cabinet : prix du pack et formule de paiement
        await pa.evaluate("location.hash='nouveau'"); await pa.wait_for_timeout(300)
        ok('1 190 DH par mois ou 11 900 DH par an (TTC' in await pa.inner_text('#aApercu'), 'nouveau cabinet : prix du pack affiché (TTC)')
        await pa.select_option('#aFact', 'gratuit')
        for i, v in [('aCab', 'Cabinet Test'), ('aNom', 'Test'), ('aMail', 't@t.ma')]: await pa.fill('#' + i, v)
        await pa.click('#aOk'); await pa.wait_for_timeout(700)
        ok((await pa.evaluate('window.__cree'))['modeFacturation'] == 'gratuit', 'nouveau cabinet : formule de paiement envoyée (gratuit)')
        # Prix d'un pack
        await pa.evaluate("location.hash='specialites'"); await pa.wait_for_timeout(400)
        ok('690 DH' in await pa.inner_text('#page') and '29 900 DH' in await pa.inner_text('#page'), 'packs : colonne Prix (690 DH/mois … 29 900 DH/an)')
        await pa.click('[data-pm="essentiel"]'); await pa.wait_for_timeout(300); await pa.fill('#fPxmois', '590'); await pa.click('#fOk'); await pa.wait_for_timeout(500)
        ok((await pa.evaluate('window.__fml'))['formules']['essentiel']['prix'] == {'mois': 590, 'an': 6900}, 'prix d\'un pack modifié (590 DH/mois)')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.evaluate("location.hash='cabinets'"); await pa.wait_for_timeout(400)
        ok(await pa.evaluate("document.documentElement.scrollWidth<=390"), 'à 390 px : rien ne déborde')
        ok(not pa.errs, 'aucune erreur JavaScript ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
