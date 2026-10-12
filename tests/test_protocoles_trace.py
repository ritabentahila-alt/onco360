import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Étape 2.4 (12/10/2026) : protocoles — marquage unique des protocoles sans statut, version et validation tracées, source,
# enregistrement sans écraser un collègue, options (dose maximale…), « non validé » non prescriptible, suppression dans la fiche.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
blocs = sorted(k for k in S if k.startswith(E + 'protocoles/'))
B0 = blocs[0]; L0 = json.loads(S[B0]['data']); P1, P2 = L0[0]['id'], L0[1]['id']
S2 = json.loads(json.dumps(S)); L2 = json.loads(S2[B0]['data']); L2[1].pop('st', None); L2[1].pop('valide', None); S2[B0]['data'] = json.dumps(L2)
bib = lambda fs: {p['id']: p for k in fs if k.startswith(E + 'protocoles/') for p in json.loads(fs[k]['data'] or '[]')}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(3500)
        B = bib(await ev("window.__fs"))
        ok(B[P2].get('st') == 'ok' and (B[P2].get('valide') or {}).get('retro'), 'protocole sans statut marqué « Validé avant le 12/10/2026 », une fois', B[P2].get('valide'))
        ok(B[P1].get('st') == 'ok' and len(B) == 316, 'les autres inchangés, aucun protocole perdu', len(B))
        # un collègue modifie P2 dans le même bloc pendant que le médecin modifie P1
        await ev(f"""(()=>{{const k='{B0}', l=JSON.parse(window.__fs[k].data); l.find(p=>p.id==='{P2}').r='modifié par un collègue'; window.__fs[k]=Object.assign({{}},window.__fs[k],{{data:JSON.stringify(l)}});}})()""")
        await ev(f"prOuvrir('{P1}')"); await pg.wait_for_timeout(600)
        await ev("prProp('src','ESMO 2023')"); await ev("edSet(0,'max','2000')"); await ev("document.getElementById('fOk').click()"); await pg.wait_for_timeout(1500)
        B = bib(await ev("window.__fs"))
        ok(B[P2].get('r') == 'modifié par un collègue', 'modification du collègue sur un autre protocole du même bloc gardée', B[P2].get('r'))
        v = B[P1].get('valide') or {}
        ok(B[P1].get('version', 0) >= 2 and v.get('par') and not v.get('retro') and v.get('version') == B[P1]['version'], 'version augmentée, validation tracée (qui, quand, version)', (B[P1].get('version'), v))
        ok(B[P1].get('src') == 'ESMO 2023' and B[P1]['dr'][0].get('max') == 2000, 'source et dose maximale enregistrées', (B[P1].get('src'), B[P1]['dr'][0].get('max')))
        await ev(f"prOuvrir('{P1}')"); await pg.wait_for_timeout(600)
        t = await pg.inner_text('#fenetreCorps')
        ok('Validé par' in t and 'version' in t and 'Supprimer le protocole' in t, 'fiche : trace de validation et « Supprimer le protocole »', t[:300])
        await ev("prProp('st','todo')"); await ev("document.getElementById('fOk').click()"); await pg.wait_for_timeout(1500)
        B = bib(await ev("window.__fs"))
        ok(B[P1].get('st') == 'todo' and 'valide' not in B[P1], 'repassé « Non validé » : trace de validation retirée', B[P1].get('st'))
        await ev("location.hash='protocoles'"); await pg.wait_for_timeout(900)
        ok(not await ev("!!document.querySelector('#prL .mini.rouge')"), 'liste : plus de croix rouge sur chaque ligne')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
