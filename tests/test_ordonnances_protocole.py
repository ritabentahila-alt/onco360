import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot G (19/10/2026) : sur ordinateur, la cure s'ouvre dans le panneau (#panneauCorps) ; une petite fenêtre (#fenetreCorps) passe devant
# P6 (audit n° 3, 18/10/2026) : bouton « Ordonnances » de la séance de chimiothérapie : ordonnances liées au protocole cochées,
# « Fièvre sous chimiothérapie » à la 1re cure, ordonnance réunie, modifiable, enregistrée dans la consultation du jour.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
cible = [(pid, i) for pid, ls in lignes_de(S).items() for i, L in enumerate(ls) if L.get('pr') and L.get('protoId')]
pid, i = cible[0]
S2 = json.loads(json.dumps(S))
# le protocole de la ligne (bibliothèque) reçoit deux ordonnances liées ; la copie de la ligne n'en a pas (ligne prescrite avant le 18/10)
pr = json.loads(S2[E + 'patients/' + pid]['lignesJson'])[i]['protoId']
for k in [k for k in S2 if k.startswith(E + 'protocoles/')]:
    L = json.loads(S2[k]['data'] or '[]')
    for p in L:
        if p['id'] == pr: p['ordos'] = ['Chimio : risque émétique modéré (oxaliplatine, irinotécan…)', 'Chimio – Capécitabine : mains-pieds et diarrhée']; p['seuils'] = ['Séances hebdomadaires (J8, J15…) : PNN ≥ 1,0 G/L et plaquettes ≥ 75 G/L']
    S2[k] = dict(S2[k], data=json.dumps(L))
S2[E + 'parametres/migrations'] = dict(S2.get(E + 'parametres/migrations') or {}, audit3b=None, audit3d=None)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        await ev(f"chOuvrir('{pid}', {i}, 0, 1)"); await pg.wait_for_timeout(1200)
        t = await pg.inner_text(':is(#fenetreCorps,#panneauCorps):not(:empty)')
        ok('Ordonnances' in t and 'Ordonnances liées' in t and 'Seuils du jour' in t, 'séance : bouton « Ordonnances », ordonnances liées et seuils du protocole (repris de la bibliothèque)', t[-400:])
        await ev(f"chOrdos('{pid}', {i}, 0, 1)"); await pg.wait_for_timeout(1500)
        t = await pg.inner_text(':is(#fenetreCorps,#panneauCorps):not(:empty)')
        coche = await ev("[...document.querySelectorAll('[data-ot]:checked')].map(i=>i.parentNode.querySelector('b').textContent)")
        ok('Ordonnances du protocole' in t and 'Chimio : risque émétique modéré (oxaliplatine, irinotécan…)' in coche and 'Chimio – Capécitabine : mains-pieds et diarrhée' in coche, 'les deux ordonnances liées sont cochées', coche)
        ok('Chimio – Fièvre sous chimiothérapie : conduite à tenir' in coche, '1re cure : « Fièvre sous chimiothérapie » cochée aussi', coche)
        ok('Autres ordonnances de chimiothérapie' in t, 'les autres ordonnances « Chimio » proposées (décochées)')
        await ev("document.querySelector('[data-ot]:checked').click()"); await ev("document.getElementById('orPcOk').click()"); await pg.wait_for_timeout(1200)
        page = await ev("(document.getElementById('orPage')||{}).innerText||''")
        ok('CRÈME À L\'URÉE' in page and 'NFS + CRP' in page and 'CHEMOSET' not in page, 'une ordonnance décochée n\'y est pas ; les autres médicaments réunis, modifiables', page[:300])
        await ev("document.getElementById('orOk').click()"); await pg.wait_for_timeout(1800)
        fs = await ev("window.__fs")
        cs = [v for k, v in fs.items() if k.startswith(E + 'consultations/') and v.get('patientId') == pid and any(l.get('t') == 'ordo' and 'Capécitabine' in (l.get('lib') or '') for l in v.get('lignes', []))]
        ok(cs, 'ordonnance enregistrée dans la consultation du jour', [k for k in fs if k.startswith(E + 'consultations/')][-3:])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
