import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Export complet du cabinet (étape 1.6, 11/10/2026) : Paramètres › Cabinet › Export des données (médecin titulaire seulement),
# fonction serveur exporterCabinet (simulée ici), fichier ZIP téléchargé depuis le stockage.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2 = json.loads(json.dumps(S))
S2[E+'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {"secretariat": True}}
S2['utilisateurs/SEC'] = {"nom": "SEC", "prenom": "Test"}
FONC = """window.__fonctions = { exporterCabinet: async (d) => { window.__appel = d; const c = 'espaces/' + d.espace + '/exports/1/Onco360_export_2026-10-11.zip';
  window.__st[c] = { blob: new Blob(['PK-test'], { type: 'application/zip' }), meta: {} }; return { chemin: c, taille: 4096, patients: 62, fichiers: 3, documentation: 2, manquants: 0 }; } };"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Médecin titulaire')
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.add_init_script(FONC)
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/export'); await pg.wait_for_timeout(2500)
        t = await pg.text_content('#page')  # explications derrière « ? » depuis le 19/10 (texte présent, caché)
        ok('Exporter tout le cabinet' in t and 'données de santé' in t, 'rubrique « Export des données » dans Paramètres › Cabinet', t[:200])
        await pg.click('#cfExp'); await pg.wait_for_timeout(1500)
        ok((await ev('window.__appel')) == {'espace': 'cabinet-bentahila'}, 'fonction serveur appelée pour ce cabinet', await ev('window.__appel'))
        ok(len(pg.dl) == 1 and pg.dl[0].suggested_filename == 'Onco360_export_2026-10-11.zip', 'fichier ZIP téléchargé', [d.suggested_filename for d in pg.dl])
        m = await pg.inner_text('#cfExpMsg')
        ok('62 dossier' in m and '3 document' in m and 'Téléchargements' in m, 'message : nombre de dossiers et de documents', m)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs); await pg.close()
        print('Secrétaire')
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/export'); await pg.wait_for_timeout(2500)
        ok(not await ev("!!document.getElementById('cfExp')"), 'pas d\'export pour la secrétaire')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
