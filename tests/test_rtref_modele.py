import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, RT7 (25/10/2026) : le référentiel de radiothérapie dans « Ajuster le modèle » (v2.html?espace=bib-oncologie, compte d'administration) :
# menu Protocoles, Radiothérapie et Paramètres seulement ; la page s'ouvre (PAGES_BIB) ; l'administration modifie un schéma du modèle comme un médecin
# dans son cabinet (espaces/bib-oncologie/referentielRT) ; les fiches reçues du modèle (origine « modele ») n'ont pas le badge « Modifié pour le
# cabinet ». Copie vers le modèle et vers un cabinet neuf : tests/emulateur/test-modele.mjs (fonctions serveur).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
CAB = E; B = 'espaces/bib-oncologie/'
S2 = dict(S)
S2['espaces/bib-oncologie'] = {'nom': 'Bibliothèque Oncologie – Radiothérapie', 'bibliotheque': True, 'titulaire': 'ADM', 'actif': True,
  'abonnement': {'formule': 'bibliotheque', 'modules': {'chimio': True, 'rt': True, 'prescriptions': True, 'listes': True, 'taches': True, 'rcp': True, 'gagenda': True}, 'max': {}}}
S2[B + 'membres/ADM'] = {'role': 'medecin', 'nom': 'Administration Onco360', 'actif': True, 'tousEtablissements': True, 'etablissements': [], 'droits': {'ecrireConsultations': True, 'traitements': 'modifier', 'radiotherapie': 'modifier', 'finances': True, 'parametres': True, 'referentielRT': 'modifier'}}
for k, v in S.items():
    if k.startswith(CAB + 'protocoles/') or k in (CAB + 'parametres/listes', CAB + 'parametres/calendrier'): S2[B + k[len(CAB):]] = v
S2[B + 'finances/tarifs'] = {'data': json.dumps({'repli': '', 'etablissements': {}, 'actesRT': [], 'vmat': 10000})}
S2[B + 'referentielRT/pro-def-60-20'] = {'schema': {'id': 'pro-def-60-20', 'situation_id': 'pro-ep-def-sans-pelvis', 'titre': '60 Gy / 20 fx (reçu du cabinet modèle, test)', 'type': 'rte_hypo', 'preuve': 'essai_phase3', 'essai_ids': ['chhip'], 'prescriptions': [{'volume': 'PTV_PRO', 'dose_Gy': 60, 'fractions': 20, 'dose_fx_Gy': 3}]}, 'localisation_id': 'prostate', 'origine': 'modele', 'base': '2026-10-22', 'majPar': 'MED', 'majParNom': 'Dr Modèle', 'majLe': '2026-10-25T09:00:00Z'}
S2['administrateurs/ADM'] = {'email': 'adm@test.ma'}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.add_init_script("window.__uid='ADM';")
        await pg.goto(f'http://localhost:{PORT}/v2.html?espace=bib-oncologie#radiotherapie'); await pg.wait_for_timeout(3500)
        m = await ev("[...document.querySelectorAll('nav a[data-p]')].filter(a => a.offsetParent !== null).map(a => a.dataset.p)")
        ok(sorted(m) == ['protocoles', 'radiotherapie'] and await ev("!!document.getElementById('btParam') && document.getElementById('btParam').offsetParent !== null"), 'modèle ouvert : menu Protocoles, Radiothérapie ; Paramètres par la roue du haut (lot B)', m)
        ok(await ev("document.getElementById('titrePage').textContent") == 'Radiothérapie' and await ev("document.querySelectorAll('#rtrListe > .rtr-l').length") >= 295, 'la page Radiothérapie s\'ouvre dans le modèle (PAGES_BIB)')
        await pg.fill('#rtrQ', 'reçu du cabinet modèle'); await pg.wait_for_timeout(300)
        ok(await ev("document.querySelectorAll('#rtrListe .rtr-l').length") == 1 and 'Modifié pour le cabinet' not in await ev("document.getElementById('rtrListe').innerText"), 'fiche reçue du modèle (origine « modele ») : sa version, sans badge « Modifié pour le cabinet »')
        await ev("location.hash='radiotherapie/s/pro-fav-60-20/prescription'"); await pg.wait_for_timeout(2000)
        ok(await ev("!!document.querySelector('.rtr-mbt')"), 'l\'administration a « Modifier pour le cabinet » dans le modèle')
        await pg.click('.rtr-mbt'); await pg.wait_for_timeout(300)
        await pg.fill('[data-p="prescriptions.0.rythme"]', '4 fx/sem (modèle)'); await pg.click('#rtrEnr'); await pg.wait_for_timeout(1500)
        d = await ev(f"window.__fs['{B}referentielRT/pro-fav-60-20'] || null")
        ok(d and d['origine'] == 'cabinet' and d['majPar'] == 'ADM' and d['schema']['prescriptions'][0]['rythme'] == '4 fx/sem (modèle)' and not await ev(f"!!window.__fs['{E}referentielRT/pro-fav-60-20']"), 'enregistré dans le modèle (espaces/bib-oncologie/referentielRT), pas dans un cabinet', d and {k: d[k] for k in d if k != 'schema'})
        await ev("location.hash='patients'"); await pg.wait_for_timeout(800)
        ok(await ev("location.hash") != '#patients' or 'Protocoles' in await ev("document.getElementById('titrePage').textContent"), 'modèle : les pages des patients restent fermées')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
