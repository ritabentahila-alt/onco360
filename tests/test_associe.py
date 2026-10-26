import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 24-25/10/2026 (signalé par Dr Bentahila) : une ligne « Paclitaxel + Carboplatine hebdomadaire – fractionné » cochée « Traitement associé »
# (reprise de l'ancienne application) : C1 J1 validée, consultation à 250 DH → ni la séance ni la consultation dans le bilan, bandeau
# « Chimio Cundefined/undefined ». Maintenant : comptées, bandeau « Chimio C2/6 », « Modifier le prix » pour le médecin. Patient fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
X = json.loads(json.dumps(S)); B = {p['id']: p for k in X if k.startswith(E+'protocoles/') for p in json.loads(X[k]['data'])}
pr = B['poumon|Paclitaxel - Carboplatine hebdomdaire']
d = X[E+'patients/PTA2']; d['lignesJson'] = json.dumps([{'id':'LZ','protoId':pr['id'],'pr':pr,'assoc':1,'j1':'2026-10-06','poids':'70','creat':'8','crU':'mgL','cures':[{},{},{},{},{},{}]}]); d['planningJson']='{}'
U = f'http://localhost:{PORT}/v2.html'
async def ca(pg):
    await pg.evaluate("location.hash='bilan'"); await pg.wait_for_timeout(2500); await pg.select_option('#biPer','annee'); await pg.wait_for_timeout(600)
    t = (await pg.evaluate("[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent)"))[0]
    return int(''.join(c for c in t if c.isdigit()))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await ouvrir(b, X); ev = pg.evaluate
        ok(pr.get('assoc') == 1, 'jeu de test : protocole encore coché « Traitement associé » (comme les lignes déjà prescrites)')
        await pg.goto(U+'#accueil'); await pg.wait_for_timeout(2500)
        avant = await ca(pg)
        await ev("location.hash='dossier/PTA2'"); await pg.wait_for_timeout(2500)
        tx = await ev("document.body.textContent"); ok('Chimio · ligne' in tx and 'Associé · ligne' not in tx, 'nom de la ligne : « Chimio · ligne 1 » (pas « Associé »)')
        await ev("chOuvrir('PTA2',0,0,1)"); await pg.wait_for_timeout(1200); await ev("chValiderJ1('PTA2',0,0)"); await pg.wait_for_timeout(2500)
        # 26/10/2026 (demande de Dr Bentahila) : valider la cure ne valide qu'elle ; la consultation (et sa fenêtre de prix) se valide à part
        ok(not await ev("!!document.getElementById('pvM')"), 'cure validée : pas de fenêtre de prix de la consultation (26/10/2026)')
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)
        lid = json.loads(X[E + 'patients/PTA2']['lignesJson'])[0]['id']
        await ev("location.hash='accueil'"); await pg.wait_for_timeout(800)
        ok(await ca(pg) - avant == 450, 'bilan : la séance seule (450 DH net), sans la consultation', await ca(pg) - avant)
        await ev("location.hash='dossier/PTA2'"); await pg.wait_for_timeout(2500)
        await ev(f"chVenuChimio('PTA2','{lid}',1,1)"); await pg.wait_for_timeout(1200)
        ok(await ev("(document.getElementById('pvM')||{}).value") == '250', 'consultation validée à part (« Consultation : venu ») : 250 DH proposés (tarif de la consultation de chimio)')
        await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        await ev("location.hash='accueil'"); await pg.wait_for_timeout(800); await ev("location.hash='dossier/PTA2'"); await pg.wait_for_timeout(2500)
        bd = await ev("(document.querySelector('.bn-bd')||{}).innerText||''")
        ok('C2/6' in bd and 'undefined' not in bd, 'bandeau : « Chimio C2/6 »', bd)
        t = await ev("document.body.textContent")
        ok('Modifier le prix' in t and 'Annuler le statut' in t, 'médecin : « Modifier le prix » et « Annuler le statut » sur la consultation validée')
        apres = await ca(pg)
        ok(apres - avant == 450 + 250, f'bilan (CA net) : séance (500 DH − 10 % = 450) et consultation (250 DH) comptées ({avant} → {apres})', apres - avant)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(1500)
        ok(await ev("document.documentElement.scrollWidth") <= 390, 'téléphone (390 px) : rien ne déborde')
        await b.close()
    print(f'\nTest traitement associé : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
