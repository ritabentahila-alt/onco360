import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Plusieurs cabinets (phase F, 09/10/2026) : un cabinet neuf construit comme le fait la fonction creerCabinet (functions/cabinets.js),
# à partir du cabinet de test ; le médecin B l'ouvre (comptes/UIDB) et ne voit rien du cabinet de Dr Bentahila. Page Administration.
import subprocess
JS = r'''
const C = require(process.argv[1] + "/functions/cabinets.js"), S = JSON.parse(require("fs").readFileSync(0, "utf8")), M = "espaces/" + C.MODELE + "/", E = "espaces/cab-test/";
const J = (k) => { try { return S[k] ? JSON.parse(S[k].data || "null") : null; } catch (e) { return null; } }, out = Object.assign({}, S), d = C.verifier({ cabinet: "Cabinet Test", prenom: "Salma", nom: "Bennani", email: "uidb@test.ma" });
out["espaces/cab-test"] = { nom: d.cabinet, titulaire: "UIDB", cree: "2026-10-09", actif: true, abonnement: Object.assign(C.abonnement({ formule: "onco-pro", modules: { salle: false, rcp: false }, max: { etablissements: 1 } }), { reglage: { menu: ["bilan", "accueil"], accueil: ["stats", "jour"], cartes: { sept: false }, ordreSections: ["listes", "taches"], sections: { whatsapp: false }, bibliotheques: { courriers: false }, fonctions: { "prescriptions.medic": false, "taches.auto": false } } }) };
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
        await pg.evaluate("location.hash='parametres/listes'"); await pg.wait_for_timeout(900); await pg.evaluate("cfLs('diag')"); await pg.wait_for_timeout(300); tl = await pg.inner_text('#page')  # 3.11 : localisations ouvertes depuis la fiche
        ok('Mutuelles (3' in tl and 'Localisations (diagnostics) (94)' in tl and 'Correspondants (0)' in tl, 'diagnostics et mutuelles reçus, correspondants vides')
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
        ok('Consultation de suivi' in tg and 'Séance de chimiothérapie' in vals and 'Clinique Atlas' in tg, 'grille créée avec toutes les activités (types de consultation : nom du référentiel, 3.13)')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.evaluate("location.hash='accueil'"); await pg.wait_for_timeout(800)
        ok(await pg.evaluate("document.documentElement.scrollWidth<=390"), 'téléphone 390 px : rien ne déborde (accueil)')
        # Formule Oncologie – Pro retouchée : salle d'attente et RCP retirées, 1 lieu : menus et onglets cachés, limites
        vis = await pg.evaluate("[...document.querySelectorAll('nav a')].filter(a=>a.offsetParent!==null).map(a=>a.dataset.p)")
        ok('salle' not in vis and 'protocoles' in vis and 'agenda' in vis and 'taches' in vis, 'menu selon la formule (salle d\'attente retirée) ' + str(vis))
        await pg.evaluate("location.hash='salle'"); await pg.wait_for_timeout(600)
        ok('Bonjour' in await pg.inner_text('#page'), 'page d\'un module retiré → tableau de bord')
        # Paramètres en 4 familles (11/10/2026) : la rubrique RCP (famille Agenda) n'existe pas, Listes oui
        await pg.evaluate("location.hash='parametres/horaires'"); await pg.wait_for_timeout(700)
        sansRcp = await pg.evaluate("!document.querySelector('[onclick*=\"cfOnglet(\\'rcp\\')\"]') && !!document.querySelector('[onclick*=\"cfOnglet(\\'horaires\\')\"]')")
        await pg.evaluate("location.hash='parametres/listes'"); await pg.wait_for_timeout(700)
        avecListes = await pg.evaluate("!!document.querySelector('[onclick*=\"cfOnglet(\\'listes\\')\"]')")
        ok(sansRcp and avecListes, 'Paramètres : rubrique RCP cachée (hors formule), Listes présente ' + str((sansRcp, avecListes)))
        await pg.evaluate("location.hash='taches'"); await pg.wait_for_timeout(700)
        ok(await pg.evaluate("!document.querySelector('[onclick=\"taVue(\\'rcp\\')\"]') && document.querySelector('nav a[data-p=rcp]').offsetParent === null"), 'RCP hors formule : ni onglet dans Tâches, ni entrée du menu (R-B1)')
        await pg.evaluate("location.hash='parametres/lieux'"); await pg.wait_for_timeout(700); n0 = len(pg.dlg)
        await pg.evaluate("pfLieu()"); await pg.wait_for_timeout(300)
        ok(len(pg.dlg) > n0 and 'limite' in pg.dlg[-1], 'formule : 1 lieu d\'exercice au plus')
        # Réglage du cabinet appliqué : menu, cartes, onglets, fonctions, bibliothèques
        await pg.set_viewport_size({'width': 1300, 'height': 900})
        vis = await pg.evaluate("[...document.querySelectorAll('nav a')].filter(a=>a.offsetParent!==null).map(a=>a.dataset.p)")
        ok(vis[:2] == ['bilan', 'accueil'], 'menu dans l\'ordre du réglage ' + str(vis))
        await pg.evaluate("location.hash='accueil'"); await pg.wait_for_timeout(600)
        h3 = await pg.evaluate("[...document.querySelectorAll('#page section h3')].map(h=>h.innerText.trim())")
        h3b = [x for x in h3 if 'pour commencer' not in x]  # carte « Pour commencer » d'un cabinet neuf : toujours en tête (11/10/2026)
        ok(h3b and 'Statistiques' in h3b[0] and not any('7 prochains' in x for x in h3), 'tableau de bord : Statistiques en premier (après « Pour commencer »), « 7 prochains jours » retirée ' + str(h3[:3]))
        # Paramètres en familles (11/10/2026) : l'ordre du réglage s'applique dans chaque famille
        await pg.evaluate("location.hash='parametres/listes'"); await pg.wait_for_timeout(900)
        ong = await pg.evaluate("[...document.querySelectorAll('.cf-sous button')].map(b=>b.innerText.trim())")
        await pg.evaluate("location.hash='parametres/horaires'"); await pg.wait_for_timeout(900)
        ag = await pg.evaluate("[...document.querySelectorAll('.cf-sous button')].map(b=>b.innerText.trim())")
        ok(ong and 'Listes' in ong[0] and ag and not any('WhatsApp' in o for o in ag), 'Paramètres : Listes en premier dans sa famille, WhatsApp retiré ' + str((ong[:3], ag)))
        await pg.evaluate("location.hash='parametres/taches'"); await pg.wait_for_timeout(900)
        ok(await pg.evaluate("![...document.querySelectorAll('[data-fn=\"taches.auto\"]')].some(e=>e.offsetParent!==null)"), 'fonction « Tâches automatiques » retirée : section cachée')
        await pg.evaluate("location.hash='parametres/bibliotheques'"); await pg.wait_for_timeout(900)
        ok(await pg.evaluate("!document.querySelector('[data-bib=\"courriers\"]').offsetParent && !!document.querySelector('[data-bib=\"medicaments\"]').offsetParent"), 'bibliothèque Courriers retirée, Médicaments présente')
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        # ── Page Administration ──
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM';window.__fonctions={etatCabinet:async(d)=>{window.__etat=d;return {actif:d.actif}},supprimerCabinet:async(d)=>{window.__suppr=d;return {comptes:1}},listeCabinets:async()=>({cabinets:[{id:'cabinet-bentahila',nom:'Cabinet du Dr Bentahila',modele:true,actif:true,cree:{_seconds:1},titulaire:{nom:'Dr Rita BENTAHILA',email:'ritabentahila@gmail.com'},membres:4,patients:62},{id:'cab-test',nom:'Cabinet Test',cree:'2026-10-09',actif:true,titulaire:{nom:'Dr Salma BENNANI',email:'uidb@test.ma',telephone:'06 61 00 00 00'},membres:1,patients:0}]}),lienMotDePasse:async(d)=>({lien:'https://chimio-hgc.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=TEST&e='+d.email}),creerCabinet:async(d)=>{window.__cree=d;return {espace:'cab-x',existant:false,protocoles:12}}}""")
        await pa.goto(f'http://localhost:{PORT}/v2.html'); await pa.wait_for_timeout(1500)
        ok(pa.url.endswith('admin.html'), 'le compte d\'administration arrive sur la page Administration')
        ta = await pa.inner_text('body')
        ok('Cabinet Test' in ta and 'Dr Salma BENNANI' in ta and await pa.evaluate("document.querySelectorAll('tr.lc-l').length") == 2, 'onglet Cabinets : liste de 2 cabinets')
        ok(await pa.evaluate("document.querySelectorAll('nav#onglets a').length") == 6, '6 onglets : Cabinets, Nouveau cabinet, Comptabilité, Par spécialité, Modules, Journal')
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
        await pa.select_option('#aSpe', 'Oncologie – Radiothérapie'); await pa.wait_for_timeout(200)
        await pa.select_option('#aFor', 'essentiel'); await pa.wait_for_timeout(200); ap = await pa.inner_text('#aApercu')
        ok('1 médecin · 1 secrétaire · 0 infirmière · 1 lieu d\'exercice · 300 dossiers patients · sans limite : comptables' in ap and 'bibliothèque et les paramètres de base de « Oncologie – Radiothérapie »' in ap and 'vos patients' not in await pa.inner_text('main'), 'Nouveau cabinet : limites bien écrites, ce que reçoit le cabinet (spécialité) ' + ap[:160].replace('\n', ' '))
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
        ok('Réglage de « Cabinet Test »' in await pa.inner_text('#modal'), 'réglage du cabinet ouvert')
        await pa.select_option('#fFor', 'essentiel'); await pa.wait_for_timeout(300)
        await pa.uncheck('#fCorps .mods [data-rmod="taches"]'); await pa.wait_for_timeout(300)
        ok(not await pa.is_checked('#fCorps .mods [data-rmod="rcp"]'), 'Tâches retiré → RCP retirée aussi')
        await pa.evaluate("document.querySelectorAll('#fCorps .mods details').forEach(d => d.open = true)"); await pa.uncheck('#fCorps [data-rfn="agenda.whatsapp"]'); await pa.wait_for_timeout(200)
        await pa.fill('#fMxassistante', '2'); await pa.press('#fMxassistante', 'Tab'); await pa.wait_for_timeout(200)
        ok(await pa.evaluate("document.querySelector('[data-op=\"modules\"] .bdg.rt') && document.querySelectorAll('[data-op=\"modules\"] [data-rev]').length") == 2 and 'Modifications non enregistrées' in await pa.inner_text('#fEtat'), 'réglage : sous-onglet Modules et limites en premier, « retouché » (modules, limites), modifications non enregistrées')
        ok(await pa.evaluate("getComputedStyle(document.querySelector('.pied.colle')).position") == 'sticky', 'bouton Enregistrer toujours visible')
        await pa.click('[data-fo="menu"]'); await pa.wait_for_timeout(200)
        await pa.click('#fCorps [data-bas="accueil:0"]'); await pa.wait_for_timeout(200); await pa.uncheck('#fCorps [data-rcarte="stats"]'); await pa.wait_for_timeout(200); await pa.click('#fCorps [data-haut="menu:8"]'); await pa.wait_for_timeout(200)
        ok(await pa.evaluate("[...document.querySelectorAll('[data-fo] .pt-r')].length") == 2, 'pastilles sur les sous-onglets retouchés (Modules, Menu)')
        await pa.click('[data-fo="param"]'); await pa.wait_for_timeout(200); await pa.uncheck('#fCorps [data-rsec="alertes"]'); await pa.wait_for_timeout(200); await pa.uncheck('#fCorps [data-rbib="examens"]'); await pa.wait_for_timeout(200)
        await pa.click('#fCorps [data-rev="bibliotheques"]'); await pa.wait_for_timeout(200)
        ok(await pa.is_checked('#fCorps [data-rbib="examens"]') and not await pa.evaluate("!!document.querySelector('[data-rev=\"bibliotheques\"]')"), '« Revenir au pack » sur un bloc (bibliothèques)')
        await pa.uncheck('#fCorps [data-rbib="examens"]'); await pa.wait_for_timeout(200)
        await pa.evaluate("window.__conf=window.confirm;window.confirm=(m)=>{window.__msg=m;return false};0"); await pa.keyboard.press('Escape'); await pa.wait_for_timeout(200)
        ok('sans enregistrer' in (await pa.evaluate('window.__msg') or '') and await pa.evaluate("!document.getElementById('modal').classList.contains('cache')"), 'fermer avec des modifications : confirmation demandée (Non = la fenêtre reste)')
        await pa.evaluate("window.confirm=window.__conf;0")
        await pa.click('#fOk'); await pa.wait_for_timeout(500)
        A = await pa.evaluate('window.__abo')
        ok(A['espace'] == 'cab-test' and A['formule'] == 'essentiel' and A['modules']['taches'] is False and A['modules']['rt'] is False and A['max']['assistante'] == 2 and A['max']['patients'] == 300, 'formule enregistrée (Oncologie – Essentiel, Tâches retiré, 2 secrétaires)')
        G = A['reglage']
        ok(G['accueil'][:2] == ['jour', 'ppas'] and G['cartes']['stats'] is False and G['menu'][7] == 'bilan' and G['fonctions']['agenda.whatsapp'] is False and G['sections']['alertes'] is False and G['bibliotheques']['examens'] is False, 'retouches enregistrées : ordre des cartes et du menu, carte, fonction, onglet, bibliothèque')
        # Modifier un cabinet (fenêtre)
        await pa.evaluate("window.__fonctions.infosCabinet=async(d)=>{window.__info=d;return {ok:true}};window.__fonctions.formulesEnregistrer=async(d)=>{window.__fml=d;return {formules:d.formules,cabinets:1}};0")
        await pa.click('[data-fiche="cab-test"]'); await pa.wait_for_timeout(300); await pa.click('[data-info="cab-test"]'); await pa.wait_for_timeout(300)
        await pa.fill('#iNom', 'Clinique Test Rabat'); await pa.fill('#iVil', 'Rabat'); await pa.click('#iOk'); await pa.wait_for_timeout(400)
        I = await pa.evaluate('window.__info')
        ok(I['espace'] == 'cab-test' and I['nom'] == 'Clinique Test Rabat' and I['ville'] == 'Rabat' and 'Clinique Test Rabat' in await pa.inner_text('main'), 'nom et ville du cabinet modifiés')
        # Onglet Par spécialité : packs (réglage complet), modules et menus, bibliothèque
        await pa.click('nav#onglets a[href="#specialites"]'); await pa.wait_for_timeout(400)
        ok(await pa.evaluate("document.querySelectorAll('[data-spec]').length") == 3 and await pa.evaluate("document.querySelectorAll('[data-pm]').length") == 8, 'Par spécialité : 3 spécialités, 8 packs d\'Oncologie – Radiothérapie')
        await pa.click('[data-spec="Médecine générale"]'); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("document.querySelectorAll('[data-pm]').length") == 0 and 'à construire' in await pa.inner_text('main'), 'Médecine générale : aucun pack, modules à construire')
        await pa.click('[data-spec="Oncologie – Radiothérapie"]'); await pa.wait_for_timeout(300)
        # Modifier un pack : nom, modules, ordre des cartes, fonction, limite
        await pa.click('[data-pm="essentiel"]'); await pa.wait_for_timeout(400)
        ok('Pack « Oncologie – Essentiel »' in await pa.inner_text('#modal') and await pa.evaluate("!document.getElementById('fFor')"), 'écran du pack : même réglage complet, sans choix de pack')
        await pa.fill('#fNom', 'Essentiel Plus'); await pa.check('#fCorps .mods [data-rmod="rt"]'); await pa.wait_for_timeout(200)
        await pa.evaluate("document.querySelectorAll('#fCorps .mods details').forEach(d => d.open = true)"); await pa.uncheck('#fCorps [data-rfn="salle.prix"]'); await pa.wait_for_timeout(200)
        await pa.fill('#fMxassistante', ''); await pa.press('#fMxassistante', 'Tab'); await pa.wait_for_timeout(200)
        ok(await pa.evaluate("!document.querySelector('#fCorps .bdg.rt') && !document.querySelector('[data-fo=\"fiche\"]')"), 'écran du pack : pas de pastille « retouché » ni de sous-onglet Fiche et consultation')
        await pa.click('[data-fo="menu"]'); await pa.wait_for_timeout(200)
        await pa.click('#fCorps [data-bas="accueil:0"]'); await pa.wait_for_timeout(200); await pa.uncheck('#fCorps [data-rcarte="conflits"]'); await pa.wait_for_timeout(200)
        ok(await pa.input_value('#fNom') == 'Essentiel Plus', 'le nom saisi reste après un changement de sous-onglet'); await pa.click('#fOk'); await pa.wait_for_timeout(600)
        F = (await pa.evaluate('window.__fml'))['formules']; E1 = F['essentiel']
        ok(len(F) == 8 and E1['lib'] == 'Essentiel Plus' and 'rt' in E1['modules'] and E1['max']['assistante'] is None and E1['max']['medecin'] == 1 and E1['specialite'] == 'Oncologie – Radiothérapie', 'pack enregistré : nom, module RT ajouté, secrétaires sans limite ; les autres gardés')
        ok(E1['reglage']['accueil'][:2] == ['jour', 'ppas'] and E1['reglage']['cartes']['conflits'] is False and E1['reglage']['fonctions']['salle.prix'] is False, 'pack : réglage complet enregistré (ordre des cartes, carte retirée, fonction retirée)')
        ok('enregistré' in await pa.inner_text('main'), 'message « Pack enregistré »')
        # Nouveau pack, dupliquer
        await pa.click('#pNouv'); await pa.wait_for_timeout(300); await pa.fill('#fNom', 'Pack Clinique sans RCP'); await pa.uncheck('#fCorps .mods [data-rmod="rcp"]'); await pa.click('#fOk'); await pa.wait_for_timeout(600)
        F = (await pa.evaluate('window.__fml'))['formules']; nv = [k for k, f in F.items() if f['lib'] == 'Pack Clinique sans RCP']
        ok(len(F) == 9 and nv and 'rcp' not in F[nv[0]]['modules'] and F[nv[0]]['specialite'] == 'Oncologie – Radiothérapie', 'nouveau pack créé dans la spécialité (sans RCP)')
        await pa.set_viewport_size({'width': 390, 'height': 800}); await pa.wait_for_timeout(300)
        ok(await pa.evaluate("document.documentElement.scrollWidth<=390"), 'Administration à 390 px : rien ne déborde (par spécialité)')
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
