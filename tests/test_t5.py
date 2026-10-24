import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# T5 (24/10/2026, audit n° 11 U23, U24) : salle d'attente, le nom du patient n'est jamais coupé ; tableau de bord, « Aujourd'hui » : consultations et
# chimiothérapie avant la radiothérapie (dépliée). Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k0 in [k0 for k0 in S2 if k0.startswith(E + 'patients/') and k0.split('/')[-1] not in PIDS]: del S2[k0]
T = '2026-10-06'; P = PIDS[1]; d = S2[E + 'patients/' + P]
d['identite'] = dict(d['identite'], nom='PATIENT AVEC UN NOM DE FAMILLE TRÈS LONG')
d['rdvsJson'] = json.dumps([{'id': 'rL', 'type': 'Suivi', 'd': T, 'h': '10:00', 'st': 'prevu', 'mo': 'Motif assez long pour remplir sa colonne entière'}])
S2[E + 'salle/' + T + '_' + P + '_r-rL'] = {'jour': T, 'patientId': P, 'etablissementId': d.get('etablissementId', 'DEMO'), 'cle': 'r-rL', 'etat': 'salle', 'arr': 1791277200000, 'majPar': 'SEC'}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (1280, 1440):
            pg = await ouvrir(b, S2, w=w, h=800, t=T + 'T10:00:00Z'); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(3000); await ev("window.saOnglet('salle')"); await pg.wait_for_timeout(400)
            r = await ev("(()=>{const a=[...document.querySelectorAll('#saL .lien-nm')].find(a=>/TRÈS LONG/.test(a.textContent));if(!a)return null;const nm=a.closest('.nm'), cs=getComputedStyle(nm);return [cs.whiteSpace!=='nowrap' && cs.textOverflow!=='ellipsis', nm.scrollWidth<=nm.clientWidth+1, a.textContent]})()")
            ok(r and r[0] and r[1], f'{w} px : nom du patient entier, sans « … »', r)
            await pg.close()
        pg = await ouvrir(b, S2, w=1280, h=800, t=T + 'T10:00:00Z'); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3000)
        cats = await ev("[...document.querySelectorAll('section.jour .cat .tc')].map(e=>e.textContent.replace(/\\d+$/,'').trim())")
        ok(cats and cats[0] in ('Consultations', 'Chimiothérapie') and (('Radiothérapie' not in cats) or cats.index('Radiothérapie') == len(cats) - 1), "tableau de bord « Aujourd'hui » : consultations et chimio d'abord, radiothérapie ensuite", cats)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\nTest T5 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
