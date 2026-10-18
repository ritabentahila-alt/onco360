import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# R-A1 (audit n° 7, point 1, 18/10/2026) : une lecture en échec d'une bibliothèque du cabinet n'est jamais prise pour une liste absente.
# Avant : la liste de départ était affichée, puis enregistrée à la place de celle du cabinet au premier clic (2 médicaments → 165).
# Données fictives seulement.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
B = E + 'bibliotheques/'
MED = [{'id': 'm1', 'nom': 'FICTIVOL 5 mg', 'poso': '1 cp le matin', 'classe': ''}, {'id': 'm2', 'nom': 'TESTOMYCINE 1 g', 'poso': '1 cp matin et soir', 'classe': ''}]
OT = [{'id': 't1', 'nom': 'Ordonnance fictive A', 'items': [{'nom': 'FICTIVOL 5 mg', 'poso': '1 cp'}]}, {'id': 't2', 'nom': 'Ordonnance fictive B', 'items': [{'nom': 'TESTOMYCINE 1 g', 'poso': '1 cp'}]}]
AN = [{'id': 'a1', 'nom': 'Analyse fictive', 'cat': 'Biochimie'}]
EX = [{'id': 'e1', 'nom': 'Examen fictif', 'cat': 'Imagerie', 'note': ''}]
CO = [{'id': 'c1', 'nom': 'Courrier fictif', 'html': '<p>Courrier fictif</p>'}]
DO = [{'id': 'd1', 'titre': 'Fiche fictive', 'cat': 'Divers', 'url': 'documents/x.pdf', 'nom': 'x.pdf', 'taille': 1, 'le': '2026-10-07'}]
def jeu(**k):
    S2 = json.loads(json.dumps(S))
    for n, L in [('medicaments', MED), ('ordostypes', OT), ('analyses', AN), ('examens', EX), ('courriers', CO), ('documentation', DO)]: S2[B + n] = {'data': json.dumps(L), 'majPar': 'test'}
    S2[E + 'parametres/migrations'] = dict(S2.get(E + 'parametres/migrations') or {}, ordostypesExcel1='2026-10-07')  # comme le cabinet réel
    S2.update(k.get('plus', {}))
    return S2
pid = next(k.split('/')[-1] for k in S if k.startswith(E + 'patients/'))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, jeu()); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        avant = await ev("JSON.stringify(Object.fromEntries(Object.entries(window.__fs).filter(([k]) => k.indexOf('/bibliotheques/') > 0)))")
        corps = lambda: pg.inner_text('#fenetreCorps')
        # 1. Ouverture d'une liste dont la lecture échoue : message, aucune liste de départ affichée
        for n, js in [('medicaments', f"ordMedicaments('{pid}')"), ('ordostypes', f"ordTypes('{pid}')"), ('analyses', f"ordAnalyses('{pid}', 'analyse')"), ('examens', f"ordAnalyses('{pid}', 'exam')"), ('courriers', f"ordCourriers('{pid}')"), ('documentation', f"ordDocumentation('{pid}')")]:
            await ev(f"window.__panne = ['bibliotheques/{n}']"); await ev(js); await pg.wait_for_timeout(700)
            t = await corps()
            if n == 'ordostypes' and 'illisible' not in t:  # déjà lue sans panne au démarrage : la liste du cabinet gardée en mémoire (normal)
                ok('Ordonnance fictive A' in t and 'Chimio' not in t, 'ordostypes : déjà lue au démarrage → la liste du cabinet (en mémoire), jamais celle de départ', len(t))
            else: ok('illisible' in t and 'Chargement' not in t, f'{n} : lecture en échec → « Liste du cabinet illisible, réessayez »', len(t))
            await ev("window.__panne = []; fermerFenetre()")
        # 2. Liste lue, puis panne au moment de la modification (étoile) : rien n'est écrit
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(700)
        t = await corps(); ok('FICTIVOL' in t and 'TESTOMYCINE' in t, 'sans panne : les 2 médicaments du cabinet', len(t))
        await ev("window.__panne = ['bibliotheques/medicaments']"); await ev("mdFavori('m1')"); await pg.wait_for_timeout(700)
        toast = await ev("(document.getElementById('toast')||{}).textContent||''")
        ok('illisible' in toast, 'étoile pendant la panne : message « illisible »', toast)
        await ev("window.__panne = ['bibliotheques/ordostypes']"); await ev("window.orMajTypes((L) => L.push({ id: 'tx', nom: 'X', items: [] })).catch(() => {})"); await pg.wait_for_timeout(500)
        await ev("window.__panne = []; fermerFenetre()")
        apres = await ev("JSON.stringify(Object.fromEntries(Object.entries(window.__fs).filter(([k]) => k.indexOf('/bibliotheques/') > 0)))")
        ok(apres == avant, 'aucune bibliothèque du cabinet réécrite pendant les pannes', [k for k in json.loads(apres) if json.loads(apres)[k] != json.loads(avant).get(k)])
        # 3. Sans panne, l'étoile marche et garde la liste du cabinet
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(700); await ev("mdFavori('m1')"); await pg.wait_for_timeout(700)
        L = json.loads((await ev(f"window.__fs['{B}medicaments']"))['data'])
        ok(len(L) == 2 and next(m for m in L if m['id'] == 'm1').get('fav'), 'sans panne : étoile enregistrée, toujours 2 médicaments', len(L))
        await ev("fermerFenetre()")
        # 4. Liste enregistrée mais illisible (JSON abîmé) : message, rien d'écrit
        await ev(f"window.__fs['{B}examens'] = {{ data: '[{{pas du json' }}"); await ev(f"ordAnalyses('{pid}', 'exam')"); await pg.wait_for_timeout(700)
        ok('illisible' in await corps(), 'liste abîmée : « illisible », pas de liste de départ')
        ok((await ev(f"window.__fs['{B}examens'].data")) == '[{pas du json', 'liste abîmée : laissée telle quelle (aucune écriture)')
        await ev("fermerFenetre()")
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # 5. Liste jamais enregistrée (cabinet qui n'a rien modifié) : la liste de départ, comme avant
        S3 = jeu(); del S3[B + 'medicaments']
        pg = await ouvrir(b, S3); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(700)
        n = await ev("document.querySelectorAll('#fenetreCorps [onclick*=mdFavori]').length")
        ok(n > 50, 'liste absente : la liste de départ est proposée (normal)', n)
        await ev("fermerFenetre()"); await pg.close()
        # 6. Registre des migrations illisible au démarrage : la mise à niveau des ordonnances types n'écrase pas la liste du cabinet
        mig = dict(S.get(E + 'parametres/migrations') or {}); mig.pop('ordostypesExcel1', None)
        pg = await ouvrir(b, jeu(plus={E + 'parametres/migrations': mig})); ev = pg.evaluate
        await pg.add_init_script("window.__panne = ['parametres/migrations']")
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(5000)
        L = json.loads((await ev(f"window.__fs['{B}ordostypes']"))['data'])
        ok([o['nom'] for o in L] == ['Ordonnance fictive A', 'Ordonnance fictive B'], 'registre des migrations illisible : ordonnances types du cabinet gardées', [o['nom'] for o in L][:5])
        await ev("window.__panne = ['parametres/migrations', 'bibliotheques/']"); await ev(f"ordTypes('{pid}')"); await pg.wait_for_timeout(700)
        t = await pg.inner_text('#fenetreCorps')
        ok('illisible' in t or ('Ordonnance fictive A' in t and 'Chimio' not in t), 'ordonnances types : panne → message, ou la liste du cabinet déjà en mémoire', len(t))
        await ev("window.__panne = []; fermerFenetre()")
        ok(not pg.errs, 'aucune erreur JavaScript (démarrage avec registre illisible)', pg.errs[:2])
        await pg.close()
        # 7. Même registre lisible, migration pas encore faite : elle tourne (contrôle que le test 6 voit bien la différence)
        pg = await ouvrir(b, jeu(plus={E + 'parametres/migrations': mig})); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(5000)
        fait = (await ev(f"window.__fs['{E}parametres/migrations']") or {}).get('ordostypesExcel1')
        ok(bool(fait), 'registre lisible : la mise à niveau notée faite (comportement inchangé)', fait)
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
