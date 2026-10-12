import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Étapes 2.3 et 2.6 (12/10/2026) : contrôle avant validation d'une cure (doses manquantes refusées, valeurs hors seuils confirmées)
# et bilan biologique du jour (facultatif, gardé avec la cure figée).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
cible = [(pid, i, k) for pid, ls in lignes_de(S).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and (k == 0 or L['cures'][k - 1].get('st') == 'recue') and L.get('pr')]
pid, i, k = cible[0]
def seed(f):
    S2 = json.loads(json.dumps(S)); ls = json.loads(S2[E + 'patients/' + pid]['lignesJson']); f(ls[i]); S2[E + 'patients/' + pid]['lignesJson'] = json.dumps(ls); return S2
async def valider(b, S2, pnn=None):
    pg = await ouvrir(b, S2); ev = pg.evaluate
    await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
    await ev(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1200)
    if pnn: await pg.fill('#bPnn', pnn)
    await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2000)
    c = lignes_de(await ev("window.__fs"))[pid][i]['cures'][k]
    return pg, c
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Poids de 640 kg')
        pg, c = await valider(b, seed(lambda L: L['cures'][k].update(poids='640')))
        ok(any('poids de 640' in d and 'Valider quand même' in d for d in pg.dlg), 'confirmation demandée (poids, surface, variation)', pg.dlg)
        ok(c.get('st') == 'recue' and c['fige']['poids'] == 640, 'après confirmation : cure validée et figée avec ce poids', c.get('fige', {}).get('poids'))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Carboplatine sans créatinine')
        def carbo(L):
            L['pr']['dr'].append({'id': 'zcb', 'p': 'CARBOPLATINE', 'd': 5, 'u': 'AUC', 'j': [1]}); L['creat'] = ''
            for c0 in L['cures']: c0.pop('creat', None)
        pg, c = await valider(b, seed(carbo))
        ok(any('Validation impossible' in d and 'CARBOPLATINE' in d for d in pg.dlg), 'validation refusée, avec la raison', pg.dlg)
        ok(c.get('st', 'prevue') == 'prevue' and not c.get('fige'), 'la cure reste à valider')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Bilan du jour : PNN à 900')
        pg, c = await valider(b, S, pnn='900')
        ok(any('PNN à 900' in d for d in pg.dlg), 'message « PNN à 900 /mm³ (moins de 1500) »', pg.dlg)
        ok(c.get('st') == 'recue' and (c.get('fige') or {}).get('bio') == {'pnn': 900}, 'bilan gardé avec la cure figée', (c.get('fige') or {}).get('bio'))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Cure normale, sans bilan')
        pg, c = await valider(b, S)
        ok(not pg.dlg and c.get('st') == 'recue' and 'bio' not in c.get('fige', {}), 'validée sans aucune question', pg.dlg)
        await pg.close()
        print('Poids saisi par la secrétaire : écart de plus de 10 %')
        S3 = json.loads(json.dumps(S))
        S3[E+'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {"planningChimio": True, "traitements": "voir"}}
        S3['utilisateurs/SEC'] = {"nom": "SEC", "prenom": "Test"}
        pg = await ouvrir(b, S3); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev(f"chChamp('{pid}', {i}, {k}, 'poids', '25')"); await pg.wait_for_timeout(1500)
        ok(any('hors de 30 à 200 kg' in d and 'Confirmer ce poids' in d for d in pg.dlg), 'confirmation demandée à la secrétaire (25 kg)', pg.dlg)
        pl = json.loads((await ev("window.__fs"))[E + 'patients/' + pid].get('planningJson') or '{}')
        ok(any(str(o.get('poids')) == '25' for L in pl.values() for o in L.values()), 'après confirmation : poids gardé dans le planning (le médecin le revoit à la validation)', pl)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
