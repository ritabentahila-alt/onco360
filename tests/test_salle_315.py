import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 3.15 (12/10/2026, signalé par Dr Bentahila) : a) salle d'attente : heure de la consultation des séances de chimio ; b) la consultation de
# fin de radiothérapie y apparaît comme « Fin de RT » (avant : « Contrôle ») ; c) une consultation créée d'office puis supprimée n'est plus
# recréée (avant : elle revenait à la modification suivante de la radiothérapie). Date des tests : 06/10/2026.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
T = '2026-10-06'
K1 = 'P1790510171257'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # séance de chimio C1 J15 de A1 le 09/10 (même jeu que test_salle) : heure de la consultation notée à 10:15
        A1 = 'P1790155538558'; S2 = json.loads(json.dumps(S)); L1 = json.loads(S2[E + 'patients/' + A1]['lignesJson'])[0]['id']
        S2[E + 'patients/' + A1]['heures'] = {f'{L1}|1|15': {"cons": {"h": "10:15", "du": 15, "par": "x", "parNom": "x", "le": 1}}}
        pg = await ouvrir(b, S2, t="2026-10-09T08:00:00"); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(3000)
        t = await ev("[...document.querySelectorAll('#saL .sa-l')].map(e=>e.innerText.replace(/\\n/g,' ')).filter(x=>/Séance chimio/.test(x)).join(' | ')")
        print('a) Heure de la consultation des séances de chimio')
        ok('10:15' in t, 'séance de chimio : heure de la consultation (10:15) affichée', t[:300])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        RT = {"id": "rtF", "acte": "Sein", "hop": "HGC", "scan": "2026-09-01", "deb": "2026-09-08", "fin": T, "nb": "20", "dose": "40", "ryt": "1", "nbA": 1, "cree": "2026-09-01"}
        P = S2[E + 'patients/' + K1]; P['rtsJson'] = json.dumps([RT]); P['rdvsJson'] = json.dumps([{"id": "rF1", "type": "Fin de radiothérapie", "d": T, "dO": T, "h": "11:30", "n": "", "st": "prevu", "rtfin": "rtF"}])
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(3000)
        t = await pg.inner_text('#page')
        print('b) Consultation de fin de radiothérapie')
        ok('Fin de RT' in t and '11:30' in t, 'dans la salle d\'attente : « Fin de RT » à 11:30', t[:400])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('c) Consultation créée d\'office supprimée : pas recréée')
        S3 = json.loads(json.dumps(S2)); P = S3[E + 'patients/' + K1]
        RT2 = dict(RT); RT2.pop('fin'); RT2['deb'] = '2026-10-12'; RT2['scan'] = '2026-10-01'; RT2['nb'] = '10'
        P['rtsJson'] = json.dumps([RT2]); P['rdvsJson'] = json.dumps([{"id": "rF2", "type": "Fin de radiothérapie", "d": "2026-10-23", "dO": "2026-10-23", "h": "", "n": "", "st": "prevu", "rtfin": "rtF"}])
        pg = await ouvrir(b, S3, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{K1}'); await pg.wait_for_timeout(3000)
        await ev(f"statutRdv('{K1}','rF2','supprimer')"); await pg.wait_for_timeout(1500)
        rd = json.loads((await ev("window.__fs"))[E + 'patients/' + K1]['rdvsJson'])
        ok(len(rd) == 1 and rd[0].get('st') == 'supprime', 'supprimée : gardée comme « supprimée » (invisible)', rd)
        t = await pg.inner_text('#page')
        ok('Consultation de fin de radiothérapie' not in t, 'plus affichée dans le dossier')
        await ev(f"modifierEtapeRT('{K1}','rtF','deb')"); await pg.wait_for_timeout(400); await pg.fill('#eD', '2026-10-13'); await pg.click('#fOk'); await pg.wait_for_timeout(1800)
        rd = json.loads((await ev("window.__fs"))[E + 'patients/' + K1]['rdvsJson'])
        ok(not any(r.get('rtfin') and r.get('st', 'prevu') == 'prevu' for r in rd), 'radiothérapie modifiée : la consultation de fin n\'est pas recréée', rd)
        ok('Consultation de fin de radiothérapie' not in await pg.inner_text('#page'), 'toujours absente du dossier')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
