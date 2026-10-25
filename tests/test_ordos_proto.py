import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 25/10/2026 (demandes de Dr Bentahila) : « Ligne créée » revient après chaque action (fiche, ordonnances, heure) ; ordonnances du protocole avec le
# bilan biologique (initial à la création de la ligne, intercure ensuite ; chimio ou immuno) ; une ordonnance par case cochée (impression de toutes,
# chacune sur sa page, ou une par une) ; nouvelle ligne : liste filtrée sur la localisation du dossier. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
U = f'http://localhost:{PORT}/v2.html'
X = json.loads(json.dumps(S)); B = {p['id']: p for k in X if k.startswith(E+'protocoles/') for p in json.loads(X[k]['data'])}
CAPE, FIEV = 'Chimio – Capécitabine : mains-pieds et diarrhée', 'Chimio – Fièvre sous chimiothérapie : conduite à tenir'
# ordonnance liée au protocole dans la bibliothèque (nouvelle ligne) et dans la copie des lignes existantes
for k in [k for k in X if k.startswith(E+'protocoles/')]:
    L0 = json.loads(X[k]['data'])
    for p0 in L0:
        if p0['id'] == 'maj|mfolfox6-eviq-': p0['ordos'] = [CAPE]
    X[k]['data'] = json.dumps(L0)
for pid in ('PTA2', 'PTESS'):
    ls = json.loads(X[E+'patients/'+pid]['lignesJson']); ls[0]['pr']['ordos'] = [CAPE]; X[E+'patients/'+pid]['lignesJson'] = json.dumps(ls)
cs = lambda fs, pid: [l for k, v in fs.items() if k.startswith(E+'consultations/') and v.get('patientId') == pid for l in (v.get('lignes') or [])]
txt = "(document.getElementById('fenetreCorps')||{}).innerText||''"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch() if os.environ.get('NAVIGATEUR') != 'webkit' else await p.webkit.launch()
        pg = await ouvrir(b, X, w=1440); ev = pg.evaluate
        await pg.goto(U+'#dossier/PTA2'); await pg.wait_for_timeout(2500)
        print('Nouvelle ligne : liste filtrée sur la localisation')
        await ev("chNouvelleLigne('PTA2')"); await pg.wait_for_timeout(800)
        t = await ev("(document.querySelector(':is(#panneauCorps,#fenetreCorps):not(:empty)')||{}).innerText||''"); sel = await ev("[...document.querySelectorAll('.cascade select')].map(s=>s.value)")
        ok('Liste filtrée sur la localisation du dossier' in t and sel[:2] == ['Digestif', 'Côlon'], 'colorectal : « Digestif › Côlon » choisis d\'office, mention affichée', sel)
        n1 = await ev("document.querySelectorAll('#nlL .proto').length")
        await ev("nlChoixV(0,'')"); await pg.wait_for_timeout(500); n2 = await ev("document.querySelectorAll('#nlL .proto').length")
        ok(n2 > n1, f'« Tous les cancers » : toute la liste ({n1} → {n2})')
        await ev("nlProto('maj|mfolfox6-eviq-')"); await pg.wait_for_timeout(500); await ev("nlIntent('meta')"); await pg.wait_for_timeout(200)
        for _ in range(2):
            await ev("document.querySelectorAll('#fenetreCorps input.req').forEach(i=>{if(!i.value){i.value=i.type==='date'?'2026-10-12':'10';i.dispatchEvent(new Event('change'))}})"); await pg.wait_for_timeout(300)
        await pg.click('#fOk'); await pg.wait_for_timeout(2000)
        ok('Ligne créée' in await ev(txt), 'ligne créée : « et maintenant ? »')
        print('« Ligne créée » revient après chaque action')
        n0 = await ev("window.__win.length"); await pg.click('#slFiche'); await pg.wait_for_timeout(800)
        ok(await ev("window.__win.length") > n0 and 'Ligne créée' in await ev(txt) and 'Fiche de chimio (prise en charge) (fait)' in await ev(txt), 'fiche imprimée, la fenêtre reste (« fait »)')
        await pg.click('#slOrdo'); await pg.wait_for_timeout(1500); t = await ev(txt)
        ok('Biologie avant la 1re cure' in t and 'Bilan chimiothérapie – bilan initial' in t, 'ordonnances : bilan initial de chimiothérapie proposé', t[:500])
        ok(await ev("!!document.querySelector('[data-bl]:checked')") and await ev(f"[...document.querySelectorAll('[data-ot]:checked')].length") >= 2, 'bilan coché, ordonnances liées cochées (capécitabine + fièvre à la 1re cure)')
        ok('Imprimer les 3 ordonnances' in t, 'bouton « Imprimer les 3 ordonnances »', t[-300:])
        await ev("fermerFenetre()"); await pg.wait_for_timeout(500)
        ok('Ligne créée' in await ev(txt) and 'Ordonnances du protocole (fait)' in await ev(txt), 'Fermer : retour à « Ligne créée » (ordonnances « fait »)')
        await pg.click('#slOrdo'); await pg.wait_for_timeout(1500)
        n0 = await ev("window.__win.length"); await pg.click('#orPcImp'); await pg.wait_for_timeout(2500)
        h = await ev(f"(window.__win.length > {n0}) ? window.__win[window.__win.length - 1].w.document._h : ''")
        ok(h.count('class="pgo"') == 3 and 'Prière de bien vouloir faire' in h and 'LOPERIUM' in h.upper(), 'une impression, 3 ordonnances, chacune sur sa page (bilan sur la sienne)', h.count('class="pgo"'))
        L = cs(await ev("window.__fs"), 'PTA2')
        ok(len([l for l in L if l.get('t') == 'ordo']) == 2 and len([l for l in L if l.get('t') == 'analyse']) == 1, '3 ordonnances enregistrées séparément dans la consultation du jour (2 médicaments, 1 bilan)', [(l.get('t'), l.get('lib', '')[:40]) for l in L])
        await pg.wait_for_timeout(500)
        ok('Ligne créée' in await ev(txt), 'après l\'impression : retour à « Ligne créée »')
        await pg.click('#slHeure'); await pg.wait_for_timeout(800); await ev("fermerFenetre()"); await pg.wait_for_timeout(500)
        t = await ev(txt); ok('Heure de la C1 (fait)' in t and 'Fiche de chimio (prise en charge) (fait)' in t and 'Terminer' in t, 'heure : retour aussi ; les trois « fait », bouton « Terminer »')
        await pg.click('#fenetreCorps .boutons:last-child .bt.plein'); await pg.wait_for_timeout(400)
        ok(await ev("document.getElementById('fenetre').classList.contains('cache')"), '« Terminer » ferme')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Validation d\'une cure : bilan intercure, une par une')
        pg = await ouvrir(b, X, w=1440); ev = pg.evaluate
        await pg.goto(U+'#dossier/PTESS'); await pg.wait_for_timeout(2500)
        await ev("chOrdos('PTESS',0,2,1)"); await pg.wait_for_timeout(1500); t = await ev(txt)
        ok('Biologie intercure' in t and 'Bilan chimiothérapie – intercure' in t and FIEV not in t.split('Autres')[0], 'C3 : bilan intercure de chimiothérapie, pas de fièvre (seulement à la 1re cure)', t[:400])
        await pg.click('#orPcUne'); await pg.wait_for_timeout(800); t1 = await ev("(document.querySelector('#fenetreCorps h3')||{}).innerText||''")
        ok('Ordonnance 1 / 2' in t1, 'une par une : « Ordonnance 1 / 2 »', t1)
        await pg.click('#orOk'); await pg.wait_for_timeout(1500); t2 = await ev("(document.querySelector('#fenetreCorps h3')||{}).innerText||''")
        ok('Ordonnance 2 / 2' in t2 and 'Bilan chimiothérapie – intercure' in t2 and 'Prière de bien vouloir faire' in await ev("document.getElementById('orPage').innerText"), 'Valider : la suivante s\'ouvre (le bilan, ordonnance d\'analyses)', t2)
        await pg.click('#orOk'); await pg.wait_for_timeout(1500)
        L = cs(await ev("window.__fs"), 'PTESS')
        ok(await ev("document.getElementById('fenetre').classList.contains('cache')") and len(L) >= 2, 'la dernière validée : fenêtre fermée, 2 ordonnances enregistrées', len(L))
        print('Immunothérapie : bilan de l\'immunothérapie')
        X2 = json.loads(json.dumps(X)); pr = B['poumon|pembrolizumab monothérapie']
        X2[E+'patients/PTA1']['lignesJson'] = json.dumps([{'id':'LIM','protoId':pr['id'],'pr':pr,'j1':'2026-10-06','poids':'70','creat':'8','crU':'mgL','cures':[{'st':'recue','reelle':'2026-10-06'},{},{}]}])
        await pg.close(); pg = await ouvrir(b, X2, w=390, h=844); ev = pg.evaluate
        await pg.goto(U+'#dossier/PTA1'); await pg.wait_for_timeout(2500); await ev("chOrdos('PTA1',0,1,1)"); await pg.wait_for_timeout(1500); t = await ev(txt)
        ok('Bilan immunothérapie – intercure' in t.split('Autres')[0], 'pembrolizumab seul : bilan intercure de l\'immunothérapie', t[:300])
        ok(await ev("document.documentElement.scrollWidth") <= 390, 'téléphone (390 px) : rien ne déborde', await ev("document.documentElement.scrollWidth"))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\nTest ordonnances du protocole : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
