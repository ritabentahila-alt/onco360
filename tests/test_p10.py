import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# P10 (audit n° 3, 18/10/2026) : interactions, arrondi au flacon dans la séance, flacons dans Paramètres, liste de la pharmacie.
import re
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
cible = [(pid, i, k) for pid, ls in lignes_de(S).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and (k == 0 or L['cures'][k - 1].get('st') == 'recue') and L.get('pr') and not L.get('arret')]
pid, i, k = cible[0]
S2 = json.loads(json.dumps(S))
ls = json.loads(S2[E + 'patients/' + pid]['lignesJson']); mol = [d['p'] for d in ls[i]['pr']['dr'] if d.get('u') in ('mg/m²', 'AUC', 'mg/kg')][0]
# flacons de 3 mg pour la 1re molécule calculée : une dose arrondie est presque toujours proposée (écart < 5 %)
S2[E + 'parametres/flacons'] = {'data': json.dumps({mol.split(' ')[0].upper(): [3]})}
# traitement en cours : AVK ; ordonnance liée avec EMEND sur le protocole de la ligne (copie de la ligne)
ls[i]['pr']['ordos'] = ['Chimio : risque émétique élevé (cisplatine, dacarbazine)']; S2[E + 'patients/' + pid]['lignesJson'] = json.dumps(ls)
cl = dict(S2[E + 'patients/' + pid].get('clinique') or {}); cl['traitCours'] = 'Previscan 20 mg le soir'; S2[E + 'patients/' + pid]['clinique'] = cl
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        await ev(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1500)
        t = await pg.inner_text('#fenetreCorps')
        ok('INR' in t, 'encart Vigilance : interaction aprépitant (EMEND) + AVK signalée', t[-500:])
        lien = await ev("[...document.querySelectorAll('#fenetreCorps a.lien')].map(a=>a.textContent).find(s=>/flacons de 3 mg/.test(s))||''")
        ok(lien.startswith('≈ '), 'dose arrondie au flacon proposée à côté de la dose calculée', lien)
        dj = re.search(r'(\d{2})/(\d{2})/(\d{4})', t)
        await ev("[...document.querySelectorAll('#fenetreCorps a.lien')].find(a=>/flacons de 3 mg/.test(a.textContent)).click()"); await pg.wait_for_timeout(1200)
        v = await ev("[...document.querySelectorAll('#fenetreCorps input.saisi')].map(i=>i.value)")
        ok(v and v[0] == lien.split(' ')[1], 'un clic applique la dose arrondie (case jaune = dose saisie)', (v, lien))
        ok(not pg.errs, 'aucune erreur JavaScript (séance)', pg.errs[:2])
        # Paramètres › Vigilance des molécules : carte des flacons
        await ev("location.hash='parametres/vigilances'"); await pg.wait_for_timeout(1500)
        tp = await pg.inner_text('#page')
        ok('Flacons (arrondi de la dose)' in tp and 'Enregistrer les flacons' in tp, 'Paramètres : carte « Flacons (arrondi de la dose) »')
        # Salle d'attente › Pharmacie : séances du jour de la cure
        await ev("location.hash='salle'"); await pg.wait_for_timeout(1800)
        jour = f"{dj.group(3)}-{dj.group(2)}-{dj.group(1)}" if dj else ''
        await ev(f"saPharmacie('{jour}')"); await pg.wait_for_timeout(1500)
        tf = await pg.inner_text('#fenetreCorps')
        ok('Pharmacie – séances du' in tf and ' mg' in tf and 'Flacons' in tf, 'Pharmacie : séances du jour, anticancéreux, doses et flacons', tf[:400])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
