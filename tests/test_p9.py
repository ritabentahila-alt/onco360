import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# P9 (18/10/2026) : bibliothèque commune vue d'un cabinet déjà créé (cab-test, construit comme creerCabinet) : bandeau des mises à jour,
# écran de choix (prendre, garder le mien, ajouter), ordonnance type ajoutée, « Signaler une erreur », exports. Le serveur est simulé
# (window.__fonctions) : sa logique est testée par functions/test-reference.js.
import subprocess
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
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
bib = lambda fs: {p['id']: p for k in fs if k.startswith('espaces/cab-test/protocoles/') for p in json.loads(fs[k]['data'] or '[]')}
B0 = bib(S2); ids = sorted(B0); A_ = B0[ids[0]]
REF_A = json.loads(json.dumps(A_)); REF_A['c'] = (REF_A.get('c') or 21) + 7; REF_A['dr'].append({'id': 'zz', 'p': 'POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj.', 'u': 'mg', 'd': 5, 'j': [1]})
NOUV = {'id': 'ref|nouveau-test', 'nom': 'Protocole nouveau de la référence', 'c': 21, 'st': 'ok', 'dr': [{'id': 'd0', 'p': 'CISPLATINE', 'u': 'mg/m²', 'd': 75, 'j': [1]}], 'ind': [['Sein', 'Sein', 'Métastatique', '']]}
REF_C = json.loads(json.dumps(B0[ids[1]])); REF_C['nom'] = REF_C['nom'] + ' (renommé dans la référence)'
DIFF = {'version': 2, 'vue': 0, 'versions': [{'n': 2, 'le': '2026-10-18T10:00:00Z', 'notes': 'v2 : test de la diffusion'}],
  'items': [{'id': A_['id'], 'type': 'different', 'ref': REF_A, 'cab': A_, 'e': 'eA', 'resume': {'ajoutees': ['POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj. — 5 mg — J1'], 'retirees': [], 'nom': None, 'cycle': [A_.get('c') or 21, REF_A['c']]}},
            {'id': NOUV['id'], 'type': 'nouveau', 'ref': NOUV, 'e': 'eN'},
            {'id': REF_C['id'], 'type': 'different', 'ref': REF_C, 'cab': B0[ids[1]], 'e': 'eC', 'resume': {'ajoutees': [], 'retirees': [], 'nom': [B0[ids[1]]['nom'], REF_C['nom']], 'cycle': None}}],
  'ordos': [{'id': 'o:Chimio : Test référence', 'type': 'nouveau', 'ref': {'nom': 'Chimio : Test référence', 'items': [{'nom': 'CHEMOSET (ondansétron) 8 mg', 'poso': '1 comprimé'}]}, 'e': 'eO'}]}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.add_init_script("window.__uid='UIDB';window.__sig=[];window.__fonctions={referenceDiff:async()=>(" + json.dumps(DIFF) + "),signalerErreur:async(d)=>{window.__sig.push(d);return {ok:true}}}")
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(3500)
        t = await pg.inner_text('#page')
        ok('Bibliothèque de référence (version 2)' in t and '1 protocole nouveau' in t and '2 différents du vôtre' in t and 'v2 : test de la diffusion' in t, 'bandeau : version, nouveaux, différents, journal des changements', t[:400])
        ok(await ev("[...document.querySelectorAll('.pr-act .mpts .cache button')].map(b => b.textContent).join('|')") == 'Réinitialiser|Excel|Livret PDF', 'Réinitialiser, Excel et Livret PDF sous « ⋯ » (26/10/2026)')
        await ev("prMaj()"); await pg.wait_for_timeout(600)
        tf = await pg.inner_text('#fenetreCorps')
        ok('+ POLARAMINE' in tf and 'cycle' in tf and 'nouveau' in tf and 'Chimio : Test référence' in tf, 'écran : différences ligne par ligne, nouveau, ordonnance type', tf[:400])
        await ev("prMajChoix(0,'prendre',false)"); await pg.wait_for_timeout(1500)
        fs = await ev("window.__fs"); B = bib(fs)
        ok(B[A_['id']]['c'] == REF_A['c'] and any(d['p'].startswith('POLARAMINE') for d in B[A_['id']]['dr']) and (B[A_['id']].get('valide') or {}).get('reference'), '« Prendre la version de la référence » : protocole remplacé, trace « copié de la référence »')
        await ev("prMajChoix(0,'prendre',false)"); await pg.wait_for_timeout(1500)
        fs = await ev("window.__fs"); B = bib(fs)
        ok(NOUV['id'] in B, '« Ajouter » : protocole nouveau ajouté à la bibliothèque du cabinet')
        await ev("prMajChoix(0,'garder',false)"); await pg.wait_for_timeout(1200)
        fs = await ev("window.__fs"); B = bib(fs); ref = fs.get('espaces/cab-test/parametres/reference') or {}
        ok(B[ids[1]]['nom'] == B0[ids[1]]['nom'] and (ref.get('refus') or {}).get(REF_C['id']) == 'eC', '« Garder le mien » : rien changé, refus noté avec l\'empreinte (plus reproposé)', ref)
        await ev("prMajChoix('o0','prendre',true)"); await pg.wait_for_timeout(1500)
        fs = await ev("window.__fs"); O = json.loads((fs.get('espaces/cab-test/bibliotheques/ordostypes') or {}).get('data') or '[]')
        ok(any(o['nom'] == 'Chimio : Test référence' for o in O) and (fs.get('espaces/cab-test/parametres/reference') or {}).get('vue') == 2, 'ordonnance type ajoutée ; tout choisi : version 2 notée comme vue')
        t = await pg.inner_text('#page')
        ok('Bibliothèque de référence (version 2)' not in t, 'bandeau retiré une fois tout choisi')
        await ev(f"prOuvrir('{ids[2]}')"); await pg.wait_for_timeout(600); await ev(f"prSignaler('{ids[2]}')"); await pg.wait_for_timeout(400)
        await pg.fill('#sgT', 'Dose à vérifier'); await ev("document.getElementById('sgOk').click()"); await pg.wait_for_timeout(800)
        sig = await ev("window.__sig")
        ok(sig and sig[0]['texte'] == 'Dose à vérifier' and sig[0]['protocole']['id'] == ids[2] and sig[0]['espace'] == 'cab-test', '« Signaler une erreur » : envoyé à l\'administration (protocole, cabinet, texte)', sig)
        async with pg.expect_download() as dl:
            await ev("fermerFenetre();prExporter('xlsx')")
        ok((await dl.value).suggested_filename.startswith('Onco360_protocoles_'), 'export Excel de la bibliothèque téléchargé')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # cabinet du Dr Bentahila : jamais de bandeau (c'est la source)
        pg = await ouvrir(b, S); await pg.add_init_script("window.__fonctions={referenceDiff:async()=>(" + json.dumps(DIFF) + ")}")
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(3000)
        ok('Bibliothèque de référence (version' not in await pg.inner_text('#page'), 'cabinet du Dr Bentahila : pas de bandeau (sa bibliothèque est la source)')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
