import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Cabinet de démonstration (étape 9 S3, 09/10/2026) : construit comme le fait creerCabinetDemo (functions/demo.js), ouvert par le
# compte de démonstration : tableau de bord, patients, dossiers, agenda, bilan sans erreur ; page Administration (création, réinitialisation,
# bibliothèque de référence).
import subprocess
JS = r'''
const C = require(process.argv[1] + "/functions/cabinets.js"), Dm = require(process.argv[1] + "/functions/demo.js"), S = JSON.parse(require("fs").readFileSync(0, "utf8"));
const M = "espaces/" + C.MODELE + "/", E = "espaces/cab-demonstration/", out = {}, jour = "2026-10-06";
const J = (k) => { try { return S[k] ? JSON.parse(S[k].data || "null") : null; } catch (e) { return null; } };
const d = C.verifier({ cabinet: "Cabinet de démonstration", prenom: "Démo", nom: "ONCO360", email: "uiddemo@test.ma" });
out["espaces/cab-demonstration"] = { nom: d.cabinet, titulaire: "UIDDEMO", cree: jour, actif: true, demo: true, abonnement: C.abonnement({ formule: "complet" }) };
out[E + "membres/UIDDEMO"] = C.membreTitulaire(d, jour, "ADM");
const protos = [];
Object.keys(S).filter((k) => k.startsWith(M + "protocoles/")).forEach((k) => { out[E + k.slice(M.length)] = S[k]; protos.push(...JSON.parse(S[k].data)); });
out[E + "parametres/listes"] = { data: JSON.stringify(C.listesDepart(J(M + "parametres/listes"))) };
out[E + "parametres/calendrier"] = { data: JSON.stringify(C.calendrierDepart(J(M + "parametres/calendrier"))) };
const T = C.tarifsDepart(J(M + "finances/tarifs"));
out[E + "finances/tarifs"] = { data: JSON.stringify(Dm.tarifsDemo(T)) };
out[E + "parametres/migrations"] = C.migrationsFaites(jour);
out[E + "etablissements/DEMO"] = Dm.ETAB;
const P = Dm.patientsDemo(protos, T.actesRT, jour);
P.forEach((p) => { out[E + "patients/" + p.id] = p.data; });
Dm.consultationsDemo(P, jour, "UIDDEMO").forEach((c, i) => { out[E + "consultations/demo" + (i + 1)] = c; });
out["comptes/UIDDEMO"] = { espace: "cab-demonstration" };
out["utilisateurs/UIDDEMO"] = { email: d.email, prenom: "Démo", nom: "ONCO360", titre: "Dr", profession: "medecin", inpe: "000000000", specialite: "Oncologue-radiothérapeute (démonstration)" };
process.stdout.write(JSON.stringify(Object.assign({}, S, out)));
'''
S2 = json.loads(subprocess.run(['node', '-e', JS, str(ICI.parent)], input=json.dumps(S), capture_output=True, text=True, check=True).stdout)
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await ouvrir(b, S2); await pg.add_init_script("window.__uid='UIDDEMO'")
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(2500)
        t = await pg.inner_text('body')
        ok('Cabinet de démonstration (patients fictifs)' in t, 'mention « Cabinet de démonstration » dans le menu')
        ok('PATIENT TEST' in t and 'pour commencer' not in t, 'tableau de bord : patients fictifs du jour, pas de « pour commencer »')
        await pg.evaluate("location.hash='patients'"); await pg.wait_for_timeout(800); tp = await pg.inner_text('#page')
        ok(all(('PATIENT TEST ' + str(i)) in tp for i in range(1, 9)), 'les 8 patients dans la liste')
        reels = [json.loads(v.get('resume') or '{}').get('nm') for k, v in S.items() if k.startswith(E + 'patients/')][:30]
        ok(not any(n and n in tp for n in reels), 'aucun vrai patient')
        ids = [k.split('/')[-1] for k in S2 if k.startswith('espaces/cab-demonstration/patients/')]
        vus = 0
        for pid in ids:
            await pg.evaluate(f"location.hash='dossier/{pid}'"); await pg.wait_for_timeout(700)
            if 'PATIENT TEST' in await pg.inner_text('#page'): vus += 1
        ok(vus == 8, 'les 8 dossiers s\'ouvrent (' + str(vus) + ')')
        for h in ['agenda', 'salle', 'taches', 'protocoles']:
            await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(600)
        await pg.evaluate("location.hash='bilan'"); await pg.wait_for_timeout(1200)
        await pg.select_option('#biPer', 'annee'); await pg.wait_for_timeout(400)
        k = await pg.evaluate("[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent)")
        ok(k and 'DH' in k[0] and not k[0].startswith('0 '), 'bilan de démonstration : ' + (k[0] if k else '?'))
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.evaluate("location.hash='accueil'"); await pg.wait_for_timeout(600)
        ok(await pg.evaluate("document.documentElement.scrollWidth<=390"), '390 px : rien ne déborde')
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        # Administration : création, réinitialisation, bibliothèque de référence
        pa = await ouvrir(b, S2); await pa.add_init_script("""window.__uid='ADM';window.__fs['administrateurs/ADM']={email:'a@b.ma'};window.__L=[{id:'cabinet-bentahila',nom:'Cabinet Dr Bentahila',modele:true,actif:true,cree:'2026-10-04',titulaire:{nom:'Dr Bentahila',email:'r@b.ma'},membres:3,patients:62}];
window.__fonctions={listeCabinets:async()=>({cabinets:window.__L,bibliotheques:[{id:'bib-oncologie',lib:'Oncologie – Radiothérapie',specialites:['Oncologie médicale'],existe:true,nb:{protocoles:316}}]}),creerCabinetDemo:async(d)=>{window.__dm=d;window.__L.push({id:'cab-demonstration',nom:'Cabinet de démonstration',demo:true,actif:true,cree:'2026-10-06',titulaire:{nom:'Dr Démo ONCO360',email:d.email},membres:1,patients:8,abonnement:{formule:'complet'}});return {patients:8,protocoles:12}},demoReinitialiser:async()=>{window.__ri=1;return {patients:8,jour:'2026-10-06'}},referenceMaj:async()=>{window.__ref={le:'2026-10-06T10:00:00Z',nb:{protocoles:316,medicaments:120}};return {reference:window.__ref}}};""")
        await pa.goto(f'http://localhost:{PORT}/admin.html'); await pa.wait_for_timeout(1500)
        await pa.evaluate("window.prompt=(m,d)=>d")  # e-mail proposé par défaut
        await pa.click('#dCree'); await pa.wait_for_timeout(800)
        ok((await pa.evaluate('window.__dm && window.__dm.email')) == 'ritabentahila+demo@gmail.com' and 'Démonstration' in await pa.inner_text('main'), 'cabinet de démonstration créé et listé (badge Démonstration)')
        ok(await pa.evaluate("!document.getElementById('dCree')"), 'bouton de création retiré une fois la démo créée')
        await pa.click('[data-reinit]'); await pa.wait_for_timeout(500)
        ok(await pa.evaluate('window.__ri') == 1 and 'réinitialisée' in await pa.inner_text('main'), 'démonstration réinitialisée')
        await pa.click('nav#onglets a[href="#reference"]'); await pa.wait_for_timeout(400)
        ok('Oncologie – Radiothérapie' in await pa.inner_text('main') and '316' in await pa.inner_text('main'), 'onglet Bibliothèques (Oncologie – Radiothérapie : 316 protocoles)')
        ok(not pa.errs, 'aucune erreur JavaScript (Administration) ' + str(pa.errs[:2]))
        await b.close()
asyncio.run(main())
