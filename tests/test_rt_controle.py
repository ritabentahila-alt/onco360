import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Étape 2.5 (12/10/2026) : radiothérapie contrôlée — prescription (dates, > 22 Gy / fraction, > 80 Gy), dosimétrie à revalider si la
# prescription change, étapes non validées gardées en rouge après la 1re séance, « Séances prévues à ce jour », calendrier théorique,
# mentions à compléter signalées avant l'impression. Date des tests : 06/10/2026 (base.py).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('lignesJson') or '') > 50][0]
def seed(rt):
    S2 = json.loads(json.dumps(S)); S2[E + 'patients/' + pid]['rtsJson'] = json.dumps([rt]); return S2
RT = {"id": "rtT", "acte": "Sein", "hop": S[E + 'patients/' + pid].get('etablissementId') or 'HGC', "scan": "2026-09-01", "cont": "2026-09-03", "dosi": "2026-09-08", "dosiPar": "Dr Test", "deb": "2026-09-15", "nb": "25", "dose": "50", "ryt": "1", "nbA": 1, "cree": "2026-09-01"}
rts = lambda fs: json.loads(fs[E + 'patients/' + pid].get('rtsJson') or '[]')
async def ouvrir_rt(b, rt):
    pg = await ouvrir(b, seed(rt)); ev = pg.evaluate
    await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
    return pg, ev
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Prescription')
        pg, ev = await ouvrir_rt(b, RT)
        await ev("ouvrirRT('%s','rtT')" % pid); await pg.wait_for_timeout(500)
        await pg.fill('#rDeb', '2026-08-20'); await pg.click('#fOk'); await pg.wait_for_timeout(500)
        ok('avant le scanner' in await pg.inner_text('#fErr'), '1re séance avant le scanner : refusé', await pg.inner_text('#fErr'))
        await pg.fill('#rDeb', '2026-09-15'); await pg.fill('#rDose', '500'); await pg.fill('#rNb', '5'); await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        ok(any('Plus de 22 Gy par fraction' in d and 'Plus de 80 Gy' in d for d in pg.dlg), '500 Gy en 5 : confirmation (> 22 Gy / fraction, > 80 Gy)', pg.dlg)
        r = rts(await ev("window.__fs"))[0]
        ok(any('dosimétrie devra être revalidée' in d for d in pg.dlg) and 'dosi' not in r and len(r.get('dosiHist', [])) == 1 and r.get('dosiN') == 1, 'prescription changée après la dosimétrie : à revalider, ancienne validation gardée', {k: r.get(k) for k in ('dosi', 'dosiN', 'dosiHist')})
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Changement sans effet sur la dose (note seulement) : dosimétrie gardée')
        pg, ev = await ouvrir_rt(b, RT)
        await ev("ouvrirRT('%s','rtT')" % pid); await pg.wait_for_timeout(500); await pg.fill('#rNote', 'note'); await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        ok(rts(await ev("window.__fs"))[0].get('dosi') == '2026-09-08' and not pg.dlg, 'dosimétrie toujours validée, aucune question', pg.dlg); await pg.close()
        print('Radiothérapie commencée sans validation')
        rt2 = dict(RT); [rt2.pop(k) for k in ('cont', 'dosi', 'dosiPar')]
        pg, ev = await ouvrir_rt(b, rt2)
        await ev("ongletDossier('%s','rt')" % pid); await pg.wait_for_timeout(800)
        if not await ev("!!document.querySelector('.rt.on')"): await ev("rtTog('%s','rtT')" % pid); await pg.wait_for_timeout(800)
        await ev("ongletDossier('%s','rt')" % pid); await pg.wait_for_timeout(800)
        t = await pg.inner_text('#page')
        ok('Contourage à valider — radiothérapie commencée sans validation' in t, 'étape « Contourage à valider » gardée, en rouge, après la 1re séance', t[t.find('Scanner'):t.find('Scanner') + 200])
        ok('Séances prévues à ce jour' in t and 'Séances réalisées' not in t, '« Séances prévues à ce jour » (plus « réalisées »)')
        await ev("location.hash='#accueil'"); await pg.wait_for_timeout(1500)
        ok('COMMENCÉE SANS VALIDATION' in await pg.inner_text('#page'), 'tableau de bord : « À valider » le signale')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Documents')
        pg, ev = await ouvrir_rt(b, RT)
        await ev("docRT('%s','rtT','rdv')" % pid); await pg.wait_for_timeout(1500)
        t = await ev("document.getElementById('dcPage').innerText")
        ok('Rendez-vous du patient' in t and 'Terminé' not in t and 'Prévu' in t and 'Dates des séances intermédiaires' in t, 'rendez-vous (R-B4 : calendrier de fin de RT, ancien « Calendrier théorique ») : état « Prévu » tant que la fin n\'est pas validée, dates calculées', t[:200])
        await ev("dcFermer()"); await pg.wait_for_timeout(600)
        await ev("docRT('%s','rtT','cr')" % pid); await pg.wait_for_timeout(1500); n0 = len(pg.dlg)
        await ev("dcEnregistrer(true)"); await pg.wait_for_timeout(1500)
        ok(any('à compléter' in d and "ne s'imprimeront pas" in d for d in pg.dlg[n0:]), "compte rendu : mentions à compléter signalées avant l'impression", pg.dlg[n0:])
        w = await ev("window.__win.length ? window.__win[window.__win.length-1].w.document._h : ''")
        ok('.dc .dc-ar,.dc .dc-af{display:none}' in w, "ces mentions ne s'impriment pas")
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
