import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# RTR, RT8 (25/10/2026) : lien « Référentiel › » de l'onglet Radiothérapie du dossier : ouvre le référentiel filtré sur la localisation du dossier
# (clinique.diag traduit par donnees-rt/diag-localisation.json ; sans correspondance : l'accueil du module) ; Retour : le dossier ; lien absent sans
# le droit referentielRT, sans la fonction rt.referentiel ; le module n'écrit rien dans le dossier. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
PID = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and (v.get('clinique') or {}).get('diag') == 'Cancer de la prostate'][0]
CORR = json.load(open(ICI.parent / 'public' / 'donnees-rt' / 'diag-localisation.json'))['correspondances']
SANS = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and (v.get('clinique') or {}).get('diag') and (v.get('clinique') or {}).get('diag') not in CORR]
async def onglet_rt(pg, pid):
    await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2800)
    await pg.evaluate("ongletDossier('%s','rt')" % pid); await pg.wait_for_timeout(800)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S); ev = pg.evaluate
        await onglet_rt(pg, PID)
        avant = await ev(f"JSON.stringify(window.__fs['{E}patients/{PID}'])")
        ok(await ev("!!document.querySelector('a.rtr-lien[href^=\"#radiotherapie/diag/\"]')"), 'onglet Radiothérapie du dossier : lien « Référentiel › »')
        await pg.click('a.rtr-lien[href^="#radiotherapie/diag/"]'); await pg.wait_for_timeout(2500)
        ok(await ev("location.hash") == '#radiotherapie' and await ev("[document.getElementById('rtr_reg').value, document.getElementById('rtr_loc').value]") == ['uro', 'prostate'] and await ev("document.querySelectorAll('#rtrListe .rtr-l').length") == 27, 'le référentiel s\'ouvre filtré sur la localisation du dossier (Prostate, 27 schémas)')
        await pg.go_back(); await pg.wait_for_timeout(2500)
        ok((await ev("location.hash")).startswith('#dossier/' + PID), 'Retour : le dossier', await ev("location.hash"))
        ok(await ev(f"JSON.stringify(window.__fs['{E}patients/{PID}'])") == avant, 'le module n\'a rien écrit dans le dossier')
        if SANS:
            await onglet_rt(pg, SANS[0]); await pg.click('a.rtr-lien[href^="#radiotherapie/diag/"]'); await pg.wait_for_timeout(2500)
            ok('Sommaire' in await ev("document.getElementById('page').innerText"), 'diagnostic sans correspondance dans le référentiel : l\'accueil du module')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Sans le droit, sans la fonction : pas de lien
        S2 = json.loads(json.dumps(S)); S2[E + 'membres/UIDSEC'] = {'role': 'assistante', 'actif': True, 'nom': 'SECRETAIRE Test', 'tousEtablissements': True, 'etablissements': [], 'droits': {'identite': True, 'fichePatient': True, 'rendezvous': True, 'radiotherapie': 'voir'}}
        pg = await ouvrir(b, S2); await pg.add_init_script("window.__uid='UIDSEC'"); ev = pg.evaluate
        await onglet_rt(pg, PID)
        ok(await ev("!document.querySelector('a.rtr-lien[href^=\"#radiotherapie/diag/\"]')"), 'secrétaire sans le droit referentielRT : pas de lien')
        ok(not pg.errs, 'secrétaire : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        S3 = json.loads(json.dumps(S)); a = S3.setdefault(E[:-1], {}).setdefault('abonnement', {}); a['formule'] = 'complet'; a.setdefault('reglage', {})['fonctions'] = {'rt.referentiel': False}
        pg = await ouvrir(b, S3); ev = pg.evaluate
        await onglet_rt(pg, PID)
        ok(await ev("!document.querySelector('a.rtr-lien[href^=\"#radiotherapie/diag/\"]')"), 'fonction rt.referentiel coupée : pas de lien')
        ok(not pg.errs, 'fonction coupée : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Téléphone
        pg = await ouvrir(b, S, w=390, h=800); ev = pg.evaluate
        await onglet_rt(pg, PID)
        ok(await ev("!!document.querySelector('a.rtr-lien[href^=\"#radiotherapie/diag/\"]')") and await ev("document.documentElement.scrollWidth <= innerWidth + 1"), '390 px : lien présent, sans débordement')
        ok(not pg.errs, '390 px : aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
