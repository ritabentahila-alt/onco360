import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Étape 1.7 (11/10/2026) : plus rien de propre au cabinet d'origine dans les documents — ville du lieu (plus de « CASABLANCA »),
# « soussigné(e) » selon le profil du médecin, libellés des fenêtres Analyses / Examens.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
pid, rid = [(k.split('/')[-1], json.loads(v['rtsJson'])[0]['id']) for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('rtsJson') or '') > 20 and json.loads(v['rtsJson'])][0]
etab = S[E + 'patients/' + pid].get('etablissementId')
def seed(genre, ville):
    S2 = json.loads(json.dumps(S))
    for k in [k for k in S2 if k.startswith('utilisateurs/')]: S2[k] = dict(S2[k], genre=genre)
    for k in [k for k in S2 if k.startswith(E + 'etablissements/')]: S2[k] = dict(S2[k], ville=ville)
    return S2
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for genre, ville, attendu in [('m', 'Rabat', 'Je soussigné,'), ('f', '', 'Je soussignée,')]:
            print(f'Médecin « {genre} », ville du lieu « {ville or "(vide)"} »')
            pg = await ouvrir(b, seed(genre, ville)); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
            await ev(f"docRT('{pid}','{rid}','pli')"); await pg.wait_for_timeout(1500)
            h = await ev("(document.getElementById('dcPage')||{}).innerText||''")
            ok(h and 'CASABLANCA' not in h.upper() or (ville == '' and 'Casablanca' not in h), 'pli : plus de « Casablanca » écrit en dur', h[:120])
            ok((ville and h.count('RABAT, le') >= 2 and 'Rabat, le' in h) or (not ville and 'À REMPLIR' in h), 'pli : ville du lieu sur les 3 pages' if ville else 'pli : ville vide → « À REMPLIR »', h[:200])
            ok(attendu in h, 'pli : « ' + attendu + ' »', h[h.find('soussign') - 5:h.find('soussign') + 15])
            await ev("window.dcFermer && dcFermer()"); await pg.wait_for_timeout(800)
            await ev(f"ordCourriers('{pid}')"); await pg.wait_for_timeout(1200)
            ids = await ev("[...document.querySelectorAll('[onclick^=\"crUtiliser\"]')].map(e=>e.getAttribute('onclick').match(/'([^']+)'/)[1])")
            textes = []
            for i in ids[:6]:
                await ev(f"crUtiliser('{i}')"); await pg.wait_for_timeout(500)
                textes.append(await ev("(document.getElementById('orPage')||{}).innerText||''"))
                await ev(f"ordCourriers('{pid}')"); await pg.wait_for_timeout(500)
            avec = [t for t in textes if 'soussign' in t]
            bon = (lambda t: 'soussignée' in t) if genre == 'f' else (lambda t: 'soussigné' in t and 'soussignée' not in t)
            ok(avec and all(bon(t) for t in avec), f'courriers : « Je soussigné{"e" if genre == "f" else ""} » ({len(avec)} modèle(s))', [t[t.find('soussign') - 3:t.find('soussign') + 12] for t in avec])
            ok(all('Casablanca' not in t for t in textes) if not ville else True, 'courriers : pas de « Casablanca » par défaut')
            await ev("fermerFenetre()"); await ev(f"ordAnalyses('{pid}')"); await pg.wait_for_timeout(1000)
            t = await ev("(document.getElementById('mdOrdo')||{}).innerText||''")
            ok('Aucune analyse choisie' in t, 'fenêtre Analyses : « Aucune analyse choisie »', t)
            await ev("fermerFenetre()"); await ev(f"ordExamens('{pid}')"); await pg.wait_for_timeout(1000)
            t = await ev("(document.getElementById('mdOrdo')||{}).innerText||''")
            ok('Aucun examen choisi' in t, 'fenêtre Examens : « Aucun examen choisi »', t)
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Profil : réglage de l\'accord')
        pg = await ouvrir(b, seed('', 'Rabat')); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#profil'); await pg.wait_for_timeout(2000)
        ok(await ev("!!document.getElementById('pfGenre')"), 'champ « Accord dans les documents » dans le profil du médecin')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
