import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot C (25/10/2026, demande de Dr Bentahila) : rôle « Médecin remplaçant ». Paramètres › Accès : droits et établissements du titulaire (lecture
# seule), durée de l'accès (sans limite ou période) ; le remplaçant agit comme un médecin, mais au nom du titulaire (consultation signée du nom
# du titulaire, médecin par défaut = titulaire) ; hors de sa période : message clair à l'ouverture. Fonctions serveur simulées, cabinet fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
JOUR = 86400000
T0 = 1791280800000  # 2026-10-06T10:00:00Z (horloge des tests)
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
TIT = S[E + 'membres/UIDRITA']
def jeu(deb=0, fin=0, du='', au='', actif=True):
    s = json.loads(json.dumps(S))
    s[E + 'membres/UREM'] = {'role': 'remplacant', 'nom': 'Dr Ali REMPLA', 'email': 'rem@test.ma', 'actif': actif, 'remplace': 'UIDRITA',
        'tousEtablissements': TIT.get('tousEtablissements', True), 'etablissements': TIT.get('etablissements', []), 'droits': dict(TIT.get('droits', {})),
        'remplaceDu': du, 'remplaceAu': au, 'remplaceDebMs': deb, 'remplaceFinMs': fin}
    s['utilisateurs/UREM'] = {'email': 'rem@test.ma', 'nom': 'REMPLA', 'prenom': 'Ali', 'titre': 'Dr'}
    return s
MENU = "[...document.querySelectorAll('nav a[data-p]')].filter(a => a.offsetParent !== null).map(a => a.dataset.p)"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Titulaire : Paramètres › Accès › Ajouter un accès › Médecin remplaçant')
        pg = await ouvrir(b, jeu()); ev = pg.evaluate
        await pg.add_init_script("""window.__fonctions={creerMembre:async(d)=>{window.__cm=d;return {uid:'UNEW',existant:false}},lienMembre:async(d)=>({lien:'https://x/?oobCode=REM'})};""")
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/acces'); await pg.wait_for_timeout(2500)
        tl = await pg.inner_text('#page')
        ok('Dr Ali REMPLA' in tl and 'Médecin remplaçant' in tl and 'Sans limite' in tl, 'liste des accès : rôle « Médecin remplaçant », durée « Sans limite »', tl[:300])
        await pg.click('text=Ajouter un accès'); await pg.wait_for_timeout(400)
        ok(await ev("[...document.querySelectorAll('#mRole option')].some(o => o.value === 'remplacant' && /remplaçant/i.test(o.textContent))"), 'rôle « Médecin remplaçant » proposé')
        await pg.fill('#mPre', 'Nadia'); await pg.fill('#mNom', 'Sefrioui'); await pg.fill('#mMail', 'Nadia@Ex.ma')
        await pg.select_option('#mRole', 'remplacant'); await pg.wait_for_timeout(400)
        f = await pg.inner_text('#fenetre')
        ok('ceux du médecin titulaire' in f and 'Durée de l\'accès' in f and 'au nom du titulaire' in f, 'établissements et droits du titulaire, durée de l\'accès, « au nom du titulaire »', f[:500])
        ok(await ev("[...document.querySelectorAll('#fenetre [data-d]')].length > 0 && [...document.querySelectorAll('#fenetre [data-d]')].every(c => c.disabled)") and not await ev("!!document.getElementById('mTous')"), 'grille des droits en lecture seule ; pas de choix des établissements')
        ok(await ev("document.getElementById('mDurS').checked && document.getElementById('mPer').style.display === 'none'"), 'par défaut : sans limite')
        await pg.check('#mDurP'); await ev("document.getElementById('mDurP').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(200)
        ok(await ev("document.getElementById('mPer').style.display !== 'none'"), '« Pour une période » : dates affichées')
        await pg.fill('#mDu', '2026-11-10'); await pg.fill('#mAu', '2026-11-01'); await pg.click('#fOk'); await pg.wait_for_timeout(600)
        ok(not await ev('window.__cm'), 'fin avant le début : refusé, rien envoyé au serveur')
        await pg.fill('#mAu', '2026-11-20'); await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        cm = await ev('window.__cm') or {}
        ok(cm.get('role') == 'remplacant' and cm.get('remplaceDu') == '2026-11-10' and cm.get('remplaceAu') == '2026-11-20' and cm.get('droits', {}).get('finances') == TIT['droits'].get('finances') and cm.get('droits', {}).get('traitements') == 'modifier', 'envoyé au serveur : rôle, période, droits du titulaire', cm)
        ok(not pg.errs, 'aucune erreur JavaScript (Accès)', pg.errs[:2]); await pg.close()

        print('Remplaçant sans limite : agit comme le médecin, au nom du titulaire')
        pg = await ouvrir(b, jeu()); ev = pg.evaluate; await pg.add_init_script("window.__uid='UREM';")
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(2500)
        m = await ev(MENU)
        ok(all(k in m for k in ['agenda', 'salle', 'patients', 'taches', 'protocoles']) and 'parametres' not in m, 'menu d\'un médecin (Agenda, Salle, Patients, Tâches, Protocoles)', m)
        nm = await pg.inner_text('#nomMenu')
        ok('REMPLA' in nm.upper(), 'son nom en bas du menu (c\'est lui qui est connecté)', nm)
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2000)
        await ev(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(600)
        await pg.fill('#csNote', 'Vu en remplacement.'); await pg.click('#csOk'); await pg.wait_for_timeout(1500)
        fs = await ev('window.__fs')
        c = sorted([v for k, v in fs.items() if k.startswith(E + 'consultations/') and v.get('patientId') == pid and v.get('note') == 'Vu en remplacement.'], key=lambda c: c.get('o', 0))
        c = c[-1] if c else {}
        ok(c.get('creePar') == 'UREM' and 'TEST' in (c.get('creeParNom') or '').upper() and 'REMPLA' not in (c.get('creeParNom') or '').upper() and 'remplaçant' not in (c.get('creeParNom') or '').lower(), 'consultation : identifiant du remplaçant (journal), signée au nom du titulaire, sans mention « remplaçant »', {k: c.get(k) for k in ['creePar', 'creeParNom', 'majParNom']})
        t = await pg.inner_text('#op-co')
        ok('REMPLA' not in t.upper(), 'journal des consultations : le nom du remplaçant n\'apparaît pas', t[:300])
        await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(1500)
        ok(not pg.errs, 'aucune erreur JavaScript (remplaçant)', pg.errs[:2]); await pg.close()

        print('Remplaçant hors de sa période')
        pg = await ouvrir(b, jeu(T0 - 20 * JOUR, T0 - 2 * JOUR, '2026-09-16', '2026-10-04')); ev = pg.evaluate; await pg.add_init_script("window.__uid='UREM';")
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(2500)
        t = await pg.inner_text('#page')
        ok('remplacement s\'est terminé le 04/10/2026' in t and 'prolonger' in t, 'période finie : « Votre remplacement s\'est terminé le 04/10/2026 »', t[:200]); await pg.close()
        pg = await ouvrir(b, jeu(T0 + 2 * JOUR, T0 + 9 * JOUR, '2026-10-08', '2026-10-15')); ev = pg.evaluate; await pg.add_init_script("window.__uid='UREM';")
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(2500)
        t = await pg.inner_text('#page')
        ok('commence le 08/10/2026' in t, 'pas encore commencée : « Votre accès de médecin remplaçant commence le 08/10/2026 »', t[:200]); await pg.close()
        pg = await ouvrir(b, jeu(T0 - 2 * JOUR, T0 + 5 * JOUR, '2026-10-04', '2026-10-11')); ev = pg.evaluate; await pg.add_init_script("window.__uid='UREM';")
        await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(2500)
        ok('agenda' in await ev(MENU) and not pg.errs, 'pendant la période : Onco360 s\'ouvre', pg.errs[:2]); await pg.close()

        print('Téléphone (390 px)')
        pg = await ouvrir(b, jeu(), w=390, h=844); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/acces'); await pg.wait_for_timeout(2500)
        await pg.click('text=Ajouter un accès'); await pg.wait_for_timeout(400); await pg.select_option('#mRole', 'remplacant'); await pg.wait_for_timeout(300)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'fenêtre du remplaçant sans débordement', await ev("document.documentElement.scrollWidth"))
        ok(not pg.errs, 'aucune erreur JavaScript (téléphone)', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
