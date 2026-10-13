import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Audit n° 3, ordre 1 (13/10/2026) : à l'ouverture par un médecin, une fois par bibliothèque : 6 protocoles critiques corrigés,
# PORTEC-3 phase 2 créé, 10 protocoles supprimés ; fenêtre récapitulative ; rien refait à l'ouverture suivante.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S = json.loads(json.dumps(S)); S[E + 'parametres/migrations'].pop('audit3a', None); S[E + 'parametres/migrations'].pop('audit3b', None)
bib = lambda fs: {p['id']: p for k in fs if k.startswith(E + 'protocoles/') for p in json.loads(fs[k]['data'] or '[]')}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(4000)
        fs = await ev("window.__fs"); B = bib(fs)
        ok(len(B) == 307, '316 − 10 supprimés + 1 créé = 307 protocoles', len(B))
        ok(B['todo|paclitaxel-pembrolizumab']['c'] == 84 and B['todo|paclitaxel-pembrolizumab'].get('st') == 'ok', 'KEYNOTE-355 : cycle de 84 jours, toujours « Validé »')
        v = B['todo|bep'].get('valide') or {}
        ok(v.get('par') and not v.get('retro') and v.get('version') == B['todo|bep'].get('version') and B['todo|bep'].get('version', 0) >= 2, 'BEP : version +1, validé (trace habituelle, sans mention)', (B['todo|bep'].get('version'), v))
        ok('audit3|portec3-phase2' in B and B['audit3|portec3-phase2'].get('st') == 'ok', 'PORTEC-3 phase 2 créé et validé')
        ok('sein|ibrance' not in B and 'todo|cisplatine-trastuzumab-pertuzumab' not in B, 'doublon et JACOB supprimés')
        sup = json.loads((fs.get(E + 'parametres/protocolesSupprimes') or {}).get('data') or '[]')
        ok('sein|ibrance' in sup and len([x for x in sup if x in ('todo|nivolumab-adjuvant', 'todo|bep')]) == 1, 'supprimés notés dans protocolesSupprimes', sup[-10:])
        ok((fs.get(E + 'parametres/migrations') or {}).get('audit3a'), 'fait une fois (parametres/migrations.audit3a)')
        t = await ev("(document.getElementById('fenetreCorps')||{}).innerText||''")
        ok('corrigée' not in t, 'aucune fenêtre (décision de Dr Bentahila : modifications faites sans fenêtre)', t[:200])
        O = json.loads((fs.get(E + 'bibliotheques/ordostypes') or {}).get('data') or '[]'); noms = [o['nom'] for o in O]
        ok(len([n for n in noms if n.startswith('Chimio')]) == 14 and not any('Sortie' in n for n in noms), '14 ordonnances « Chimio … », jamais « Sortie »', [n for n in noms if n.startswith('Chimio')])
        ok('Chimiothérapie très émétisante (cisplatine, AC…)' not in noms and 'Syndrome pieds-mains' not in noms and 'Diarrhée' in noms, 'anciennes renommées, les autres gardées', len(noms))
        c = next(o for o in O if o['nom'] == 'Chimio : carboplatine, Enhertu, Trodelvy')
        ok('CHEMOSET' in c['items'][0]['nom'] and not any('EMEND' in i['nom'] for i in c['items']), 'carboplatine, Enhertu, Trodelvy : CHEMOSET, pas d\'EMEND')
        ok((fs.get(E + 'parametres/migrations') or {}).get('audit3b'), 'ordonnances : fait une fois (audit3b)')
        n = await ev("document.querySelectorAll('#prL .proto').length")
        ok(n == 307, 'page Protocoles à jour (307)', n)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # deuxième ouverture : rien refait, pas de fenêtre
        pg = await ouvrir(b, fs); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(3500)
        fs2 = await ev("window.__fs")
        ok(len(bib(fs2)) == 307 and bib(fs2)['todo|bep']['version'] == B['todo|bep']['version'] and fs2[E + 'bibliotheques/ordostypes']['data'] == fs[E + 'bibliotheques/ordostypes']['data'], 'deuxième ouverture : rien refait (protocoles, ordonnances)')
        t = await ev("(document.getElementById('fenetreCorps')||{}).innerText||''")
        ok('corrigée' not in t, 'pas de fenêtre la deuxième fois')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
