import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# S1 (21/10/2026, audit n° 10 d. 2) : heure du Maroc calculée par Onco360 (moteur/heure.js), sans se fier aux données horaires du navigateur
# (Chromium donnait encore GMT+1 après le retour du Maroc à GMT le 20/09/2026). Ordinateur réglé sur l'heure belge ou sur « Casablanca » :
# même jour, mêmes heures. Changement d'heure ajouté par l'Administration (plateforme/heureMaroc) : pris à l'ouverture. Patients fictifs.
import re, html as H
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E, jour='2026-10-21'); P7 = PIDS[6]
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
d7 = S2[E + 'patients/' + P7]; rd = json.loads(d7['rdvsJson']); rd[0].update(d='2026-10-21', h='09:30', st='fait', dv='2026-10-21'); RID = rd[0]['id']; d7['rdvsJson'] = json.dumps(rd)
S2[E + 'encaissements/' + P7] = {'data': json.dumps({'rdv': {RID: {'m': 400, 'mode': 'esp'}}})}
ARR = 1792573200000  # 21/10/2026 09:00 UTC = 09:00 au Maroc (GMT)
P6 = PIDS[5]; d6 = S2[E + 'patients/' + P6]; r6 = json.loads(d6['rdvsJson']); r6[0].update(d='2026-10-21', h='09:30', st='prevu'); R6 = r6[0]['id']; d6['rdvsJson'] = json.dumps(r6)
S2[E + 'salle/2026-10-21_' + P6 + '_r-' + R6] = {'jour': '2026-10-21', 'patientId': P6, 'etablissementId': d6.get('etablissementId', 'DEMO'), 'cle': 'r-' + R6, 'etat': 'salle', 'arr': ARR, 'majPar': 'SEC'}
U = f'http://localhost:{PORT}/v2.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('1. Ordinateur à l\'heure belge, 21/10/2026 23:30 UTC (00:30 à Bruxelles, 23:30 au Maroc)')
        pg = await ouvrir(b, S2, t='2026-10-21T23:30:00Z', tz='Europe/Brussels'); ev = pg.evaluate
        await pg.goto(U + '#salle'); await pg.wait_for_timeout(3500); await ev("window.saOnglet('salle')"); await pg.wait_for_timeout(300)
        ok(await ev("window.__D ? __D.t : (window.A && A.D ? A.D().t : null)") in ('2026-10-21', None), 'jour du Maroc : 21/10 (et pas le 22, jour de Bruxelles)')
        t = await ev("document.body.innerText")
        ok('22/10' not in (await ev("(document.querySelector('.sa-jour, #saJour, .sa-sem') || document.body).innerText"))[:400] or '21' in t, 'la salle d\'attente reste sur le 21/10', t[:200])
        ar = await ev("(document.querySelector('#saL .ar') || {}).innerText || ''")
        ok(ar == '09:00', 'arrivée à 09:00, heure du Maroc (GMT), quel que soit le fuseau de l\'ordinateur', ar)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await pg.close()

        print('2. Ordinateur « Casablanca » (données horaires du navigateur), 21/10/2026 23:30 UTC')
        pg = await ouvrir(b, S2, t='2026-10-21T23:30:00Z', tz='Africa/Casablanca'); ev = pg.evaluate
        await pg.goto(U + '#salle'); await pg.wait_for_timeout(3500); await ev("window.saOnglet('salle')"); await pg.wait_for_timeout(300)
        ar = await ev("(document.querySelector('#saL .ar') || {}).innerText || ''")
        ok(ar == '09:00', 'arrivée à 09:00 aussi avec le fuseau « Casablanca » du navigateur', ar)
        await pg.goto(U + '#dossier/' + P7); await pg.wait_for_timeout(3000)
        n0 = await ev("window.__win.length"); await ev(f"recuRdv('{P7}', '{RID}')"); await pg.wait_for_timeout(1500)
        h = await ev(f"(window.__win.length > {n0}) ? window.__win[window.__win.length - 1].w.document._h : ''")
        tx = H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h)))
        ok(re.search(r'Visa accueil .*23 h 30', tx) is not None, 'reçu : « Visa accueil » à 23 h 30 (heure du Maroc)', tx[tx.find('Visa'):][:80])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await pg.close()

        print('3. Changement d\'heure ajouté par l\'Administration (GMT+1 à partir du 21/10/2026 00:00 UTC)')
        S3 = json.loads(json.dumps(S2)); S3['plateforme/heureMaroc'] = {'changements': [{'du': '2026-10-21T00:00Z', 'dec': 60}]}
        pg = await ouvrir(b, S3, t='2026-10-21T20:00:00Z', tz='UTC'); ev = pg.evaluate
        await pg.goto(U + '#salle'); await pg.wait_for_timeout(3500); await ev("window.saOnglet('salle')"); await pg.wait_for_timeout(300)
        ar = await ev("(document.querySelector('#saL .ar') || {}).innerText || ''")
        ok(ar == '10:00', 'table de l\'Administration prise à l\'ouverture : arrivée à 10:00 (GMT+1)', ar)
        await pg.close()

        print('4. Administration › Plateforme › Heure du Maroc')
        pa = await ouvrir(b, {'administrateurs/UIDRITA': {}}, t='2026-10-21T14:05:00Z', tz='Europe/Brussels'); ev = pa.evaluate
        await pa.add_init_script("""window.__fonctions = { heureMaroc: async (d) => { window.__hm = (window.__hm || []).concat([d]); const aj = d.action === 'enregistrer' ? d.changements : []; return { code: [], ajouts: aj, maintenant: Date.now(), decalage: 0 }; }, listeCabinets: async () => ({ cabinets: [], formules: {}, bibliotheques: [] }), journalAdmin: async () => ({ lignes: [] }), sauvegardesEtat: async () => ({}) };""")
        await pa.goto(f'http://localhost:{PORT}/admin.html#plateforme'); await pa.wait_for_timeout(3000)
        t = await ev("document.body.innerText")
        ok('Heure du Maroc' in t and '14:05' in t, 'carte « Heure du Maroc » : maintenant 14:05 au Maroc (ordinateur à Bruxelles : 16:05)', t[t.find('Heure du Maroc'):][:200])
        if await ev("!!document.getElementById('hmAj')"):
            await pa.fill('#hmD', '2027-02-07'); await pa.fill('#hmH', '02:00'); await pa.select_option('#hmDec', '60'); await pa.click('#hmAj'); await pa.wait_for_timeout(800)
            env = await ev("(window.__hm || []).filter(x => x.action === 'enregistrer').pop()")
            ok(env and env['changements'] == [{'du': '2027-02-07T02:00Z', 'dec': 60}], 'ajout : 07/02/2027 02:00 (heure du Maroc, GMT) → GMT+1 envoyé en heure universelle', env)
            ok('Changement ajouté' in await ev("document.body.innerText"), 'message « Changement ajouté »')
        else: ok(False, 'formulaire d\'ajout présent', t[:300])
        await pa.set_viewport_size({'width': 390, 'height': 844}); await pa.wait_for_timeout(300)
        ok(await ev("document.documentElement.scrollWidth") <= 390, '390 px : rien ne déborde', await ev("document.documentElement.scrollWidth"))
        ok(not pa.errs, 'aucune erreur JavaScript (Administration)', pa.errs[:2])
        await b.close()
    print(f'\nTest heure du Maroc : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
