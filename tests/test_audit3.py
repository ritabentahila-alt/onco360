import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Audit n° 3, ordre 1 (13/10/2026) : à l'ouverture par un médecin, une fois par bibliothèque : 6 protocoles critiques corrigés,
# PORTEC-3 phase 2 créé, 10 protocoles supprimés ; fenêtre récapitulative ; rien refait à l'ouverture suivante.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S = json.loads(json.dumps(S)); [S[E + 'parametres/migrations'].pop(k, None) for k in ('audit3a', 'audit3b', 'audit3c', 'audit3d', 'audit3e', 'audit3f', 'audit3g')]
bib = lambda fs: {p['id']: p for k in fs if k.startswith(E + 'protocoles/') for p in json.loads(fs[k]['data'] or '[]')}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(4000)
        fs = await ev("window.__fs"); B = bib(fs)
        ok(len(B) == 368, '316 − 10 supprimés + 1 créé (PORTEC-3) + 2 créés en P4 (PRODIGE 23, KEYNOTE-A18) + 59 en P7 = 368 protocoles', len(B))
        ok(B['todo|paclitaxel-pembrolizumab']['c'] == 84 and B['todo|paclitaxel-pembrolizumab'].get('st') == 'ok', 'KEYNOTE-355 : cycle de 84 jours, toujours « Validé »')
        v = B['todo|bep'].get('valide') or {}
        ok(v.get('par') and not v.get('retro') and v.get('version') == B['todo|bep'].get('version') and B['todo|bep'].get('version', 0) >= 2, 'BEP : version +1, validé (trace habituelle, sans mention)', (B['todo|bep'].get('version'), v))
        ok('audit3|portec3-phase2' in B and B['audit3|portec3-phase2'].get('st') == 'ok', 'PORTEC-3 phase 2 créé et validé')
        ok('sein|ibrance' not in B and 'todo|cisplatine-trastuzumab-pertuzumab' not in B, 'doublon et JACOB supprimés')
        sup = json.loads((fs.get(E + 'parametres/protocolesSupprimes') or {}).get('data') or '[]')
        ok('sein|ibrance' in sup and len([x for x in sup if x in ('todo|nivolumab-adjuvant', 'todo|bep')]) == 1, 'supprimés notés dans protocolesSupprimes', sup[-10:])
        ok((fs.get(E + 'parametres/migrations') or {}).get('audit3c'), 'fait une fois (parametres/migrations.audit3c)')
        t = await ev("(document.getElementById('fenetreCorps')||{}).innerText||''")
        ok('corrigée' not in t, 'aucune fenêtre (décision de Dr Bentahila : modifications faites sans fenêtre)', t[:200])
        O = json.loads((fs.get(E + 'bibliotheques/ordostypes') or {}).get('data') or '[]'); noms = [o['nom'] for o in O]
        ok(len([n for n in noms if n.startswith('Chimio')]) == 14 and not any('Sortie' in n for n in noms), '14 ordonnances « Chimio … », jamais « Sortie »', [n for n in noms if n.startswith('Chimio')])
        ok('Chimiothérapie très émétisante (cisplatine, AC…)' not in noms and 'Syndrome pieds-mains' not in noms and 'Diarrhée' in noms, 'anciennes renommées, les autres gardées', len(noms))
        c = next(o for o in O if o['nom'] == 'Chimio : carboplatine, Enhertu, Trodelvy')
        ok('CHEMOSET' in c['items'][0]['nom'] and not any('EMEND' in i['nom'] for i in c['items']), 'carboplatine, Enhertu, Trodelvy : CHEMOSET, pas d\'EMEND')
        ok((fs.get(E + 'parametres/migrations') or {}).get('audit3d'), 'ordonnances : fait une fois (audit3d)')
        # P4 : ordres 2 et 3, seuils du jour, ordonnances liées
        ok((fs.get(E + 'parametres/migrations') or {}).get('audit3e'), 'P4 : fait une fois (audit3e)')
        ia = next((p for p in B.values() if 'InterAACT' in p['nom']), None)
        ok(ia and any('POLARAMINE' in d['p'] for d in ia['dr']) and ia.get('seuils') and ia.get('ordos') == ['Chimio : carboplatine, Enhertu, Trodelvy'], 'InterAACT : POLARAMINE, seuils du jour, ordonnance liée', ia and (ia.get('ordos'), ia.get('seuils')))
        ff = [p for p in B.values() if ('FOLFOX' in p['nom'] or 'FOLFIRI' in p['nom']) and 'FOLFIRINOX' not in p['nom'] and 'FOLFOXIRI' not in p['nom']]
        reste = [d for p in ff for d in p['dr'] if 'NIVESTIM' in d['p']]
        ok(ff and len(reste) <= 2, 'NIVESTIM systématique retiré des FOLFOX / FOLFIRI (restent : mFOLFOX6 + pembrolizumab, structuré « si G-CSF décidé », et PRODIGE 5, non traité par l\'audit)', [d.get('pos') for d in reste])
        ok(any('PRODIGE 23' in p['nom'] for p in B.values()) and any('KEYNOTE-A18 – phase 2' in p['nom'] for p in B.values()), 'PRODIGE 23 et KEYNOTE-A18 phase 2 créés')
        await ev(f"prOuvrir('{ia['id']}')"); await pg.wait_for_timeout(700)
        tf = await pg.inner_text('#fenetreCorps')
        ok('Risque émétique' in tf and 'Ordonnances liées' in tf and 'Seuils du jour' in tf and 'Calculé : Modéré haut' in tf, 'fiche du protocole : risque émétique (calculé), ordonnances liées, seuils du jour', tf[:200])
        await ev("fermerFenetre()")
        n = await ev("parseInt(document.querySelector('#prL .mesures').textContent)")  # 26/10/2026 : cartes par pages, total affiché
        ok(n == 368, 'page Protocoles à jour (368)', n)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # deuxième ouverture : rien refait, pas de fenêtre
        pg = await ouvrir(b, fs); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#protocoles'); await pg.wait_for_timeout(3500)
        fs2 = await ev("window.__fs")
        ok(len(bib(fs2)) == 368 and bib(fs2)['todo|bep']['version'] == B['todo|bep']['version'] and fs2[E + 'bibliotheques/ordostypes']['data'] == fs[E + 'bibliotheques/ordostypes']['data'], 'deuxième ouverture : rien refait (protocoles, ordonnances)')
        t = await ev("(document.getElementById('fenetreCorps')||{}).innerText||''")
        ok('corrigée' not in t, 'pas de fenêtre la deuxième fois')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
