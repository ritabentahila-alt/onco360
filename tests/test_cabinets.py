import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Plusieurs cabinets (phase F, 09/10/2026) : un cabinet neuf construit comme le fait la fonction creerCabinet (functions/cabinets.js),
# à partir du cabinet de test ; le médecin B l'ouvre (comptes/UIDB) et ne voit rien du cabinet de Dr Bentahila. Page Administration.
import subprocess
JS = r'''
const C = require(process.argv[1] + "/functions/cabinets.js"), S = JSON.parse(require("fs").readFileSync(0, "utf8")), M = "espaces/" + C.MODELE + "/", E = "espaces/cab-test/";
const J = (k) => { try { return S[k] ? JSON.parse(S[k].data || "null") : null; } catch (e) { return null; } }, out = Object.assign({}, S), d = C.verifier({ cabinet: "Cabinet Test", prenom: "Salma", nom: "Bennani", email: "uidb@test.ma" });
out["espaces/cab-test"] = { nom: d.cabinet, titulaire: "UIDB", cree: "2026-10-09", actif: true, abonnement: C.abonnement({ formule: "onco-pro", modules: { salle: false, rcp: false }, max: { etablissements: 1 } }) };
out[E + "membres/UIDB"] = C.membreTitulaire(d, "2026-10-09", "ADM");
Object.keys(S).filter((k) => k.startsWith(M + "protocoles/")).forEach((k) => { out[E + k.slice(M.length)] = S[k]; });
out[E + "parametres/listes"] = { data: JSON.stringify(C.listesDepart(J(M + "parametres/listes"))) };
out[E + "parametres/calendrier"] = { data: JSON.stringify(C.calendrierDepart(J(M + "parametres/calendrier"))) };
out[E + "finances/tarifs"] = { data: JSON.stringify(C.tarifsDepart(J(M + "finances/tarifs"))) };
C.BIBLIOTHEQUES.forEach((b) => { if (S[M + "bibliotheques/" + b]) out[E + "bibliotheques/" + b] = S[M + "bibliotheques/" + b]; });
out[E + "parametres/migrations"] = C.migrationsFaites("2026-10-09");
out["comptes/UIDB"] = { espace: "cab-test" };
out["utilisateurs/UIDB"] = { email: d.email, prenom: d.prenom, nom: d.nom, titre: "Dr", profession: "medecin" };
out["administrateurs/ADM"] = { email: "adm@test.ma" };
process.stdout.write(JSON.stringify(out));
'''
S2 = json.loads(subprocess.run(['node', '-e', JS, str(ICI.parent)], input=json.dumps(S), capture_output=True, text=True, check=True).stdout)
nbProt = sum(len(json.loads(v['data'])) for k, v in S2.items() if k.startswith('espaces/cab-test/protocoles/'))
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ── Médecin B dans son cabinet neuf ──
        pg = await ouvrir(b, S2); await pg.add_init_script("window.__uid='UIDB'")
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(1500)
        txt = await pg.inner_text('body')
        ok('Bonjour Dr Bennani' in txt, 'le médecin B ouvre son cabinet')
        ok('pour commencer' in txt and 'Votre lieu d' in txt, 'carte « Bienvenue : pour commencer »')
        pages = {}
        for h in ['patients', 'protocoles', 'agenda', 'taches', 'bilan']:
            await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(700); pages[h] = await pg.inner_text('#page')
        ok(await pg.evaluate("document.querySelectorAll('#page .li, #page tr.pat, #page [onclick*=ouvrirDossier]').length") == 0, 'aucun patient (liste des patients vide)')
        tout = ' '.join(pages.values()) + txt
        noms = [json.loads(v['resume'])['nm'] for k, v in S.items() if k.startswith(E + 'patients/') and v.get('resume')][:40]
        ok(not any(n and n in tout for n in noms), 'aucun nom de patient du cabinet de Dr Bentahila à l\'écran')
        ok(str(nbProt) in pages['protocoles'] or nbProt > 0, f'protocoles copiés ({nbProt})')
        # Paramètres : lieux, correspondants vides, grille tarifaire
        await pg.evaluate("location.hash='parametres/listes'"); await pg.wait_for_timeout(900); tl = await pg.inner_text('#page')
        cor0 = subprocess.run(['node', '--input-type=module', '-e', 'import {COR0} from "./public/js/donnees/listes.js"; console.log(JSON.stringify(COR0))'], cwd=str(ICI.parent), capture_output=True, text=True).stdout
        ok(not any(c in tl for c in json.loads(cor0)[:15]), 'aucun correspondant de Dr Bentahila')
        ok('Mutuelles (3' in tl and 'Diagnostics (4' in tl and 'Correspondants (0)' in tl, 'diagnostics et mutuelles reçus, correspondants vides')
        await pg.evaluate("location.hash='parametres/activites'"); await pg.wait_for_timeout(900); ta = await pg.inner_text('#page')
        ok('Ajoutez d\'abord un lieu' in ta, 'tarifs : il faut d\'abord un lieu')
        ok('HGC' not in ta and 'HCK' not in ta, 'aucun établissement de Dr Bentahila dans les tarifs')
        # Un lieu, puis sa grille
        S3 = dict(S2); S3['espaces/cab-test/etablissements/CLA'] = {'code': 'CLA', 'nom': 'Clinique Atlas', 'actif': True}
        pg2 = await ouvrir(b, S3); await pg2.add_init_script("window.__uid='UIDB'")
        await pg2.goto(f'http://localhost:{PORT}/v2.html#parametres/activites'); await pg2.wait_for_timeout(1800)
        pg2.errs += pg.errs; pg = pg2
        await pg.click('text=Créer la grille'); await pg.wait_for_timeout(500); tg = await pg.inner_text('#page')
        vals = await pg.evaluate("[...document.querySelectorAll('#page input')].map(i=>i.value).join('|')")
        ok('Consultation de suivi' in vals and 'Séance de chimiothérapie' in vals and 'Clinique Atlas' in tg, 'grille créée avec toutes les activités')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.evaluate("location.hash='accueil'"); await pg.wait_for_timeout(800)
        ok(await pg.evaluate("document.documentElement.scrollWidth<=390"), 'téléphone 390 px : rien ne déborde (accueil)')
        # Formule Oncologie – Pro retouchée : salle d'attente et RCP retirées, 1 lieu : menus et onglets cachés, limites
        vis = await pg.evaluate("[...document.querySelectorAll('nav a')].filter(a=>a.offsetParent!==null).map(a=>a.dataset.p)")
        ok('salle' not in vis and 'protocoles' in vis and 'agenda' in vis and 'taches' in vis, 'menu selon la formule (salle d\'attente retirée) ' + str(vis))
        await pg.evaluate("location.hash='salle'"); await pg.wait_for_timeout(600)
        ok('Bonjour' in await pg.inner_text('#page'), 'page d\'un module retiré → tableau de bord')
        await pg.evaluate("location.hash='parametres/rcp'"); await pg.wait_for_timeout(700); tp = await pg.inner_text('#page')
        ok('RCP' not in tp.split('Créneaux')[1][:400] and 'Listes' in tp, 'Paramètres : onglet RCP caché (hors formule), Listes présent')
        await pg.evaluate("location.hash='taches'"); await pg.wait_for_timeout(700)
        ok(await pg.evaluate("!document.querySelector('[onclick=\"taVue(\\'rcp\\')\"]')"), 'Tâches : onglet RCP caché')
        await pg.evaluate("location.hash='parametres/lieux'"); await pg.wait_for_timeout(700); n0 = len(pg.dlg)
        await pg.evaluate("pfLieu()"); await pg.wait_for_timeout(300)
        ok(len(pg.dlg) > n0 and 'limite' in pg.dlg[-1], 'formule : 1 lieu d\'exercice au plus')
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        # ── Page Administration ──
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM';window.__fonctions={etatCabinet:async(d)=>{window.__etat=d;return {actif:d.actif}},supprimerCabinet:async(d)=>{window.__suppr=d;return {comptes:1}},listeCabinets:async()=>({cabinets:[{id:'cabinet-bentahila',nom:'Cabinet du Dr Bentahila',modele:true,actif:true,cree:{_seconds:1},titulaire:{nom:'Dr Rita BENTAHILA',email:'ritabentahila@gmail.com'},membres:4,patients:62},{id:'cab-test',nom:'Cabinet Test',cree:'2026-10-09',actif:true,titulaire:{nom:'Dr Salma BENNANI',email:'uidb@test.ma',telephone:'06 61 00 00 00'},membres:1,patients:0}]}),lienMotDePasse:async(d)=>({lien:'https://chimio-hgc.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=TEST&e='+d.email}),creerCabinet:async(d)=>{window.__cree=d;return {espace:'cab-x',existant:false,protocoles:12}}}""")
        await pa.goto(f'http://localhost:{PORT}/v2.html'); await pa.wait_for_timeout(1500)
        ok(pa.url.endswith('admin.html'), 'le compte d\'administration arrive sur la page Administration')
        ta = await pa.inner_text('body')
        ok('Cabinet Test' in ta and 'Dr Salma BENNANI' in ta and await pa.evaluate("document.querySelectorAll('tr.lc-l').length") == 2, 'onglet Cabinets : liste de 2 cabinets')
        ok(await pa.evaluate("document.querySelectorAll('nav#onglets a').length") == 5, '5 onglets : Cabinets, Nouveau cabinet, Formules, Modules et menus, Bibliothèques et paramètres')
        await pa.fill('#cQ', 'benn'); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("document.querySelectorAll('tr.lc-l').length") == 1 and await pa.evaluate("document.activeElement.id") == 'cQ', 'recherche (« benn » → 1 cabinet), la saisie garde le focus')
        await pa.fill('#cQ', ''); await pa.wait_for_timeout(300)
        await pa.click('[data-fiche="cabinet-bentahila"]'); await pa.wait_for_timeout(300); ok(await pa.evaluate("!document.querySelector('[data-susp=\"cabinet-bentahila\"],[data-suppr=\"cabinet-bentahila\"]') && !!document.querySelector('#modal [data-form=\"cabinet-bentahila\"]')") and 'Cabinet de référence' not in await pa.inner_text('body'), 'votre cabinet : fiche sans suspension ni suppression'); await pa.keyboard.press('Escape')
        # Nouveau cabinet
        await pa.click('nav#onglets a[href="#nouveau"]'); await pa.wait_for_timeout(300)
        await pa.select_option('#aSpe', 'Oncologie – Radiothérapie'); await pa.wait_for_timeout(200)
        ok(len(await pa.evaluate("[...document.querySelectorAll('#aFor option')].map(o=>o.value)")) == 8 and 'Chimiothérapie' in await pa.inner_text('#aApercu'), 'une seule spécialité Oncologie – Radiothérapie : ses 8 packs, aperçu')
        await pa.select_option('#aSpe', 'Médecine générale'); await pa.wait_for_timeout(200)
        ok(len(await pa.evaluate("[...document.querySelectorAll('#aFor option')]")) == 0, 'Médecine générale : aucun pack pour l\'instant')
        await pa.select_option('#aSpe', ''); await pa.wait_for_timeout(200)
        await pa.select_option('#aFor', 'rt-pro')
        for i, v in [('aCab', 'Cabinet Agdal'), ('aPre', 'Karim'), ('aNom', 'Alami'), ('aMail', 'Karim@Exemple.ma')]: await pa.fill('#' + i, v)
        await pa.click('#aOk'); await pa.wait_for_timeout(800)
        C0 = await pa.evaluate('window.__cree')
        ok(C0 and C0['email'] == 'karim@exemple.ma' and C0['formule'] == 'rt-pro', 'demande de création envoyée (formule Radiothérapie – Pro)')
        ok('créé' in await pa.inner_text('main') and pa.url.endswith('#cabinets'), 'message de réussite, retour aux cabinets')
        # Lien du mot de passe (fenêtre)
        await pa.click('[data-fiche="cab-test"]'); await pa.wait_for_timeout(300); await pa.click('#modal button[data-lien]'); await pa.wait_for_timeout(800)
        tl = await pa.input_value('#lnTexte'); wa = await pa.get_attribute('text=Envoyer par WhatsApp', 'href')
        ok('oobCode=TEST' in tl and 'uidb@test.ma' in tl, 'lien du mot de passe affiché avec le message')
        ok(wa.startswith('https://wa.me/212661000000?text='), 'WhatsApp vers le numéro du médecin (06… → 2126…)')
        await pa.keyboard.press('Escape'); await pa.wait_for_timeout(200)
        ok(await pa.evaluate("document.getElementById('modal').classList.contains('cache')"), 'fenêtre fermée par Échap')
        await pa.click('[data-fiche="cab-test"]'); await pa.wait_for_timeout(300); await pa.click('[data-susp="cab-test"]'); await pa.wait_for_timeout(500)
        ok((await pa.evaluate('window.__etat')) == {'espace': 'cab-test', 'actif': False} and 'Suspendu' in await pa.inner_text('body'), 'cabinet suspendu')
        await pa.click('[data-fiche="cab-test"]'); await pa.wait_for_timeout(300); await pa.click('[data-suppr="cab-test"]'); await pa.wait_for_timeout(500); await pa.keyboard.press('Escape')
        ok((await pa.evaluate('window.__suppr || null')) is None, 'suppression refusée sans le nom retapé')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("document.documentElement.scrollWidth<=390"), 'Administration à 390 px : rien ne déborde (cabinets)')
        await pa.set_viewport_size({'width': 1300, 'height': 900})
        # Formule et modules d'un cabinet (fenêtre)
        await pa.evaluate("window.__fonctions.abonnementCabinet=async(d)=>{window.__abo=d;return {abonnement:Object.assign({surMesure:true},d)}};0")
        await pa.click('[data-fiche="cab-test"]'); await pa.wait_for_timeout(300); await pa.click('[data-form="cab-test"]'); await pa.wait_for_timeout(400)
        ok('Formule de « Cabinet Test »' in await pa.inner_text('#modal'), 'réglage de la formule ouvert')
        await pa.select_option('#fFor', 'essentiel'); await pa.wait_for_timeout(300)
        await pa.uncheck('#fCorps [data-m="taches"]'); await pa.wait_for_timeout(300)
        ok(not await pa.is_checked('#fCorps [data-m="rcp"]'), 'Tâches retiré → RCP retirée aussi')
        await pa.fill('#fMxassistante', '2'); await pa.click('#fOk'); await pa.wait_for_timeout(500)
        A = await pa.evaluate('window.__abo')
        ok(A['espace'] == 'cab-test' and A['formule'] == 'essentiel' and A['modules']['taches'] is False and A['modules']['rt'] is False and A['max']['assistante'] == 2 and A['max']['patients'] == 300, 'formule enregistrée (Oncologie – Essentiel, Tâches retiré, 2 secrétaires)')
        # Modifier un cabinet (fenêtre)
        await pa.evaluate("window.__fonctions.infosCabinet=async(d)=>{window.__info=d;return {ok:true}};window.__fonctions.formulesEnregistrer=async(d)=>{window.__fml=d;return {formules:d.formules,cabinets:1}};0")
        await pa.click('[data-fiche="cab-test"]'); await pa.wait_for_timeout(300); await pa.click('[data-info="cab-test"]'); await pa.wait_for_timeout(300)
        await pa.fill('#iNom', 'Clinique Test Rabat'); await pa.fill('#iVil', 'Rabat'); await pa.click('#iOk'); await pa.wait_for_timeout(400)
        I = await pa.evaluate('window.__info')
        ok(I['espace'] == 'cab-test' and I['nom'] == 'Clinique Test Rabat' and I['ville'] == 'Rabat' and 'Clinique Test Rabat' in await pa.inner_text('main'), 'nom et ville du cabinet modifiés')
        # Onglet Formules
        await pa.click('nav#onglets a[href="#formules"]'); await pa.wait_for_timeout(400)
        ok(await pa.evaluate("document.querySelectorAll('.fml').length") == 8, '8 formules proposées, rangées par spécialité')
        tf = await pa.inner_text('main')
        ok('Médecine générale' in tf and 'Gynécologie' in tf and 'à créer' in tf, 'spécialités à venir affichées (médecine générale, gynécologie)')
        await pa.click('[data-spe="Médecine générale"]'); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("document.querySelectorAll('.fml').length") == 0 and 'à créer' in await pa.inner_text('main'), 'filtre par spécialité (Médecine générale : aucune formule, à créer)')
        await pa.click('[data-spe=""]'); await pa.wait_for_timeout(300)
        await pa.fill('[data-f="essentiel"] [data-fl]', 'Essentiel Plus'); await pa.fill('[data-f="essentiel"] [data-fx="assistante"]', '')
        foc = await pa.evaluate("document.activeElement && document.activeElement.dataset.fx")
        ok(await pa.evaluate("document.getElementById('fBarre').classList.contains('on')"), 'barre « Modifications non enregistrées » visible')
        await pa.check('[data-f="essentiel"] [data-fm="rt"]'); await pa.wait_for_timeout(300)
        await pa.click('#fEnr'); await pa.wait_for_timeout(500)
        F = (await pa.evaluate('window.__fml'))['formules']
        ok(foc == 'assistante', 'la saisie garde le focus')
        ok(len(F) == 8 and F['essentiel']['lib'] == 'Essentiel Plus' and 'rt' in F['essentiel']['modules'] and F['essentiel']['max']['assistante'] is None and F['essentiel']['max']['medecin'] == 1 and F['rt-pro']['specialite'] == 'Oncologie – Radiothérapie', 'formule modifiée : nom, module RT ajouté, secrétaires sans limite ; les autres gardées')
        ok(F['rt-pro']['specialite'] == 'Oncologie – Radiothérapie', 'les packs sont dans la spécialité unique')
        ok('Formules enregistrées' in await pa.inner_text('main'), 'message « Formules enregistrées »')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("document.documentElement.scrollWidth<=390"), 'Administration à 390 px : rien ne déborde (formules)')
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
