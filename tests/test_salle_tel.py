import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# 21/10/2026 (signalé par Dr Bentahila) : sur téléphone, l'onglet « En salle » de la salle d'attente ne montrait que son nombre (la règle
# « .o-barre .sm » du dossier, lot G, cachait aussi son libellé court). Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k0 in [k0 for k0 in S2 if k0.startswith(E + 'patients/') and k0.split('/')[-1] not in PIDS]: del S2[k0]
T = '2026-10-06'
for n, P in enumerate(PIDS[:2]):
    d = S2[E + 'patients/' + P]; d['rdvsJson'] = json.dumps([{'id': 'r' + str(n), 'type': 'Suivi', 'd': T, 'h': '1%d:00' % n, 'st': 'prevu'}])
    S2[E + 'salle/' + T + '_' + P + '_r-r' + str(n)] = {'jour': T, 'patientId': P, 'etablissementId': d.get('etablissementId', 'DEMO'), 'cle': 'r-r' + str(n), 'etat': 'salle', 'arr': 1791277200000, 'majPar': 'SEC'}
lib = "[...document.querySelectorAll('#saO button')].map(b => b.innerText.replace(/\\s+/g, ' ').trim())"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2, w=390, h=844, t=T + "T10:00:00Z"); await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(3500)
        L = await pg.evaluate(lib)
        ok(L == ['À venir 0', 'En salle 2', 'Vus 0', 'Absents 0'] or (len(L) == 4 and L[1] == 'En salle 2'), '390 px : « En salle 2 » (avant : « 2 » seul)', L)
        ok(await pg.evaluate("document.documentElement.scrollWidth") <= 390, '390 px : rien ne déborde')
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{PIDS[0]}'); await pg.wait_for_timeout(2500)
        o = await pg.evaluate("[...document.querySelectorAll('.dos-trav .o-barre [role=tab]')].map(b => b.innerText.replace(/\\s+/g, ' ').trim())")
        ok(o and all(len(x) <= 14 for x in o), 'dossier sur téléphone : onglets toujours en libellé court', o)
        await pg.close()
        pd = await ouvrir(b, S2, t=T + "T10:00:00Z"); await pd.goto(f'http://localhost:{PORT}/v2.html#salle'); await pd.wait_for_timeout(3500)
        L = await pd.evaluate(lib)
        ok(len(L) == 4 and L[1] == "En salle d'attente 2", "ordinateur : « En salle d'attente » (inchangé)", L)
        await pd.goto(f'http://localhost:{PORT}/v2.html#dossier/{PIDS[0]}'); await pd.wait_for_timeout(2500)
        o = await pd.evaluate("[...document.querySelectorAll('.dos-trav .o-barre [role=tab] .sm')].filter(e => getComputedStyle(e).display !== 'none').length")
        ok(o == 0, 'dossier sur ordinateur : libellés courts toujours cachés', o)
        await b.close()
    print(f'\nTest salle sur téléphone : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
