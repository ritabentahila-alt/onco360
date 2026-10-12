import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 12/10/2026 (3.11) : la fiche n'est plus abîmée par l'enregistrement de la chimiothérapie (avant : champs ajoutés de l'identité perdus,
# allergie / statut / champs ajoutés de la fiche médicale rangés dans clinique._autres) ; les fiches déjà abîmées sont réparées une fois.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
L0 = lignes_de(S); pid = [p for p, ls in L0.items() if ls][0]; autre = [p for p in L0 if p != pid][0]
S2 = json.loads(json.dumps(S))
P = S2[E + 'patients/' + pid]
P['identite'] = dict(P.get('identite') or {}, extra={'xgs001': 'O+'})
P['clinique'] = dict(P.get('clinique') or {}, allergie='oui', allergies='Iode', extra={'xthisto': 'Adénocarcinome'})
Q = S2[E + 'patients/' + autre]  # fiche abîmée (avant la correction)
Q['clinique'] = dict({k: v for k, v in (Q.get('clinique') or {}).items() if k not in ('extra', 'allergie', 'statut')}, _autres={'extra': {'xthisto': 'Carcinome épidermoïde'}, 'allergie': 'non'})
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Fiche abîmée : réparée au chargement (titulaire)')
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        q = (await ev("window.__fs"))[E + 'patients/' + autre]['clinique']
        ok('_autres' not in q and q.get('extra', {}).get('xthisto') == 'Carcinome épidermoïde' and q.get('allergie') == 'non', 'clinique._autres remis à sa place (extra, allergie)', q)
        print('Nouvelle ligne de chimiothérapie : la fiche est gardée')
        await ev(f"chNouvelleLigne('{pid}')"); await pg.wait_for_timeout(600)
        await ev(await ev("document.querySelector('#nlL [onclick^=\"nlProto\"]').getAttribute('onclick')")); await pg.wait_for_timeout(400)
        await pg.click('#itP [data-k=adj]'); await pg.click('#fOk'); await pg.wait_for_timeout(400)
        for _ in range(2):
            await ev("document.querySelectorAll('#fenetreCorps input.req').forEach(i=>{if(!i.value){i.value=i.type==='date'?'2026-10-12':'10';i.dispatchEvent(new Event('change'))}})"); await pg.wait_for_timeout(300)
        await pg.click('#fOk'); await pg.wait_for_timeout(2000)
        d = (await ev("window.__fs"))[E + 'patients/' + pid]
        ok(len(lignes_de({E + 'patients/' + pid: d})[pid]) == len(L0[pid]) + 1, 'ligne créée')
        ok(d['identite'].get('extra', {}).get('xgs001') == 'O+', 'identité : champ ajouté gardé (groupe sanguin)', d['identite'])
        ok(d['clinique'].get('allergie') == 'oui' and d['clinique'].get('allergies') == 'Iode' and d['clinique'].get('extra', {}).get('xthisto') == 'Adénocarcinome' and '_autres' not in d['clinique'], 'fiche médicale : allergie et fiche tumeur gardées, rien dans _autres', d['clinique'])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
