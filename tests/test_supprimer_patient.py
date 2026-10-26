import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 26/10/2026 (demande de Dr Bentahila) : « Supprimer le patient » dans le « ⋯ » de l'en-tête du dossier, sous « Journal », avec confirmation ;
# droit « supprimerPatient ». Cabinet fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
MENU = "[...document.querySelectorAll('.bp-l1 .mpts button')].map(b => b.textContent).filter(t => t !== '⋯')"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Médecin titulaire')
        pg = await ouvrir(b); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        m = await ev(MENU)
        ok(m[:2] == ['Journal', 'Supprimer le patient'], '« ⋯ » de l\'en-tête : Journal, puis Supprimer le patient', m)
        await ev("window.__c = []; window.confirm = (t) => { window.__c.push(t); return false; }")
        await ev(f"dosSupprimer('{pid}')"); await pg.wait_for_timeout(800)
        c = [t for t in await ev('window.__c') if t]
        ok(len(c) == 1 and 'Supprimer définitivement' in c[0] and 'récupérer pendant 7 jours' in c[0], 'message de confirmation (récupérable 7 jours)', c)
        ok((E + 'patients/' + pid) in await ev('window.__fs') and 'dossier/' in await ev('location.hash'), 'Annuler : rien n\'est supprimé')
        await ev("window.__c = []; window.confirm = (t) => { window.__c.push(t); return true; }")
        await ev(f"dosSupprimer('{pid}')"); await pg.wait_for_timeout(2500)
        fs = await ev('window.__fs')
        c = [t for t in await ev('window.__c') if t]; h = await ev('location.hash')
        ok(len(c) == 2 and (E + 'patients/' + pid) not in fs and h == '#patients', 'confirmé : dossier supprimé, retour à la liste des patients', (c, (E + 'patients/' + pid) in fs, h, pg.errs[:2]))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Membre sans le droit « Supprimer un patient »')
        s = json.loads(json.dumps(S)); s[E + 'membres/SEC'] = {'role': 'assistante', 'nom': 'SEC Test', 'email': 'sec@test.ma', 'actif': True, 'tousEtablissements': True, 'etablissements': [],
            'droits': {'identite': True, 'fichePatient': True, 'rendezvous': True, 'consultations': True, 'supprimerPatient': False}}
        s['utilisateurs/SEC'] = {'nom': 'SEC Test'}
        pg = await ouvrir(b, s); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC';")
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        ok('Supprimer le patient' not in await ev(MENU), 'pas de « Supprimer le patient »')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Téléphone (390 px)')
        pg = await ouvrir(b, w=390, h=844); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev("document.querySelector('.bp-l1 .mpts summary, .bp-l1 .mpts button')?.click()"); await pg.wait_for_timeout(300)
        ok(await ev("document.documentElement.scrollWidth") <= 390 and 'Supprimer le patient' in await ev(MENU), 'menu ouvert sans débordement')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
