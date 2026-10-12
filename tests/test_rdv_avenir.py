import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# « Rendez-vous et tâches à venir » (12/10/2026) : « Modifier » une séance de chimio (date : cette cure seulement ou toute la suite ;
# heure de la consultation), le scanner ou la 1re séance de radiothérapie (date, heure) ; consultation de fin de radiothérapie créée à
# la fin (réelle, sinon calculée), qui suit la fin tant qu'elle n'a pas été déplacée à la main. Date des tests : 06/10/2026.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
cible = [(pid, i, k) for pid, ls in lignes_de(S).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and k >= 1 and L['cures'][k - 1].get('st') == 'recue' and len(L['cures']) > k + 1 and L.get('pr')]
pid, i, k = cible[0]
LID = lignes_de(S)[pid][i]['id']
HOP = S[E + 'patients/' + pid].get('etablissementId') or 'HGC'
RT = {"id": "rtF", "acte": "Sein", "hop": HOP, "scan": "2026-10-08", "deb": "2026-10-19", "nb": "10", "dose": "30", "ryt": "1", "nbA": 1, "cree": "2026-10-01"}
def seed(rts=None, rdvs=None):
    S2 = json.loads(json.dumps(S)); P = S2[E + 'patients/' + pid]
    if rts is not None: P['rtsJson'] = json.dumps(rts)
    if rdvs is not None: P['rdvsJson'] = json.dumps(rdvs)
    S2.pop(E + 'parametres/migrations', None); return S2
async def dossier(b, S2):
    pg = await ouvrir(b, S2); await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3000); return pg, pg.evaluate
doc = lambda fs: fs[E + 'patients/' + pid]
async def dates_cures(ev):
    return await ev(f"(async()=>{{const m=await import('./js/moteur/doses.js');const c=await import('./js/donnees/conversion.js');const d=window.__fs['{E}patients/{pid}'];const P=c.fusionner('{pid}',d,null);return null}})()")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Séance de chimio : date (toute la suite / cette cure seulement) et heure')
        for choix, lib in (('suite', 'toute la suite'), ('seule', 'cette date seulement')):
            pg, ev = await dossier(b, seed())
            await ev(f"chModifierRdvChimio('{pid}','{LID}',{k + 1},1)"); await pg.wait_for_timeout(600)
            d0 = await ev("document.getElementById('mD').value")
            y, m, dd = map(int, d0.split('-')); import datetime; d1 = (datetime.date(y, m, dd) + datetime.timedelta(days=7)).isoformat()
            await pg.fill('#mD', d1); await pg.wait_for_timeout(100)
            ok(await ev("!document.getElementById('mSz').classList.contains('cache')"), lib + ' : la question « La date change » apparaît')
            await ev(f"document.querySelector('input[name=dS][value={choix}]').checked=true"); await pg.fill('#mH', '11:15'); await pg.click('#fOk'); await pg.wait_for_timeout(2000)
            fs = await ev("window.__fs"); L = json.loads(doc(fs)['lignesJson'])[i]; pl = json.loads(doc(fs).get('planningJson') or '{}').get(LID, {})
            fixe = (L['cures'][k].get('fixe') or (pl.get(str(k + 1)) or {}).get('fixe'))
            suiv = L['cures'][k + 1].get('fixe') or (pl.get(str(k + 2)) or {}).get('fixe')
            ok(fixe == d1, lib + ' : cure C' + str(k + 1) + ' au ' + d1, (fixe, L['cures'][k]))
            ok((suiv is None) if choix == 'suite' else bool(suiv), lib + (' : les cures suivantes suivent (recalculées)' if choix == 'suite' else ' : la cure suivante garde sa date'), suiv)
            H = doc(fs).get('heures') or {}
            ok((H.get(f'{LID}|{k + 1}|1') or {}).get('cons', {}).get('h') == '11:15', lib + ' : heure de la consultation notée', H)
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Consultation de fin de radiothérapie')
        pg, ev = await dossier(b, seed([RT], []))
        await pg.wait_for_timeout(1500)
        rd = json.loads(doc(await ev("window.__fs")).get('rdvsJson') or '[]'); f = [r for r in rd if r.get('rtfin') == 'rtF']
        ok(len(f) == 1 and f[0]['type'] == 'Fin de radiothérapie' and f[0]['d'] == '2026-10-30' and f[0]['dO'] == '2026-10-30', 'créée une fois (titulaire) à la fin calculée : 30/10/2026', f)
        await ev("location.hash='#patients'"); await pg.wait_for_timeout(500); await ev(f"location.hash='#dossier/{pid}'"); await pg.wait_for_timeout(1500)
        t = await ev("[...document.querySelectorAll('#rdvListe .rdv')].map(e=>e.innerText.replace(/\\n/g,' ')).join(' | ')")
        ok('Consultation de fin de radiothérapie' in t and 'Fin de radiothérapie prévue' in t, '« Rendez-vous et tâches à venir » : fin de radiothérapie prévue ET consultation de fin, toutes les deux', t[:500])
        print('1re séance de radiothérapie : date et heure')
        await ev(f"modifierEtapeRT('{pid}','rtF','deb')"); await pg.wait_for_timeout(500)
        await pg.fill('#eD', '2026-10-26'); await pg.fill('#eH', '08:30'); await pg.click('#fOk'); await pg.wait_for_timeout(1800)
        fs = await ev("window.__fs"); r = json.loads(doc(fs)['rtsJson'])[0]; rd = json.loads(doc(fs)['rdvsJson']); f = [z for z in rd if z.get('rtfin') == 'rtF'][0]
        ok(r['deb'] == '2026-10-26' and r.get('debH', {}).get('h') == '08:30', '1re séance au 26/10 à 08:30', r)
        ok(f['d'] == f['dO'] and f['d'] > '2026-10-30', 'la consultation de fin suit la nouvelle fin (' + f['d'] + ')', f)
        t = await ev("[...document.querySelectorAll('#rdvListe .rdv')].map(e=>e.innerText.replace(/\\n/g,' ')).join(' | ')")
        ok('08:30' in t, 'heure de la 1re séance affichée', t[:400])
        await ev(f"modifierEtapeRT('{pid}','rtF','deb')"); await pg.wait_for_timeout(400); await pg.fill('#eD', '2026-10-05'); await pg.click('#fOk'); await pg.wait_for_timeout(500)
        ok('avant le scanner' in await pg.inner_text('#fErr'), '1re séance avant le scanner : refusée')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); S3 = json.loads(json.dumps(await ev("window.__fs"))); await pg.close()

        print('Consultation déplacée à la main : ne suit plus la fin')
        P3 = S3[E + 'patients/' + pid]; rd = json.loads(P3['rdvsJson']); [z.update(d='2026-11-20') for z in rd if z.get('rtfin') == 'rtF']; P3['rdvsJson'] = json.dumps(rd)
        pg = await ouvrir(b, S3); ev = pg.evaluate; await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev(f"modifierEtapeRT('{pid}','rtF','deb')"); await pg.wait_for_timeout(400); await pg.fill('#eD', '2026-10-21'); await pg.click('#fOk'); await pg.wait_for_timeout(1800)
        f = [z for z in json.loads(doc(await ev("window.__fs"))['rdvsJson']) if z.get('rtfin') == 'rtF']
        ok(len(f) == 1 and f[0]['d'] == '2026-11-20', 'reste au 20/11 (déplacée à la main)', f)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('1re séance déplacée avec une fin saisie à la main : la fin est décalée d\'autant')
        pg, ev = await dossier(b, seed([dict(RT, finPrev='2026-11-02')], []))
        await ev(f"modifierEtapeRT('{pid}','rtF','deb')"); await pg.wait_for_timeout(400); await pg.fill('#eD', '2026-10-26'); await pg.click('#fOk'); await pg.wait_for_timeout(1800)
        r = json.loads(doc(await ev("window.__fs"))['rtsJson'])[0]
        ok(r['deb'] == '2026-10-26' and r['finPrev'] == '2026-11-09', 'début 26/10, fin saisie 02/11 → 09/11', r)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
