import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-B4 (19/10/2026, demande du 17/10) : calendrier de fin de radiothérapie (mise en page de l'export de l'accélérateur, sans nom d'appareil) :
# « Rendez-vous du patient », bande des dates, patient / ID / oncologue, tableau à 6 colonnes, 1re « Mise en place RA » 15 min, dernière
# « Fin de traitement RA », autres 20 min, heure de la 1re séance, « Terminé » pour une séance passée (26/10/2026 ; avant : seulement après la fin validée), une seule page A4 (5, 25, 33,
# 39 séances, 2 séances par jour). Patients fictifs seulement.
import re
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E); P4 = PIDS[3]
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
S2[E + 'patients/' + P4]['identite'] = dict(S2[E + 'patients/' + P4]['identite'], numero='202610004')
def avec_rt(**o):
    S3 = json.loads(json.dumps(S2)); d = S3[E + 'patients/' + P4]; rts = json.loads(d['rtsJson']); rts[0].update(o); d['rtsJson'] = json.dumps(rts); return S3, rts[0]['id']
async def calendrier(b, cas, **o):
    S3, rid = avec_rt(**o)
    pg = await ouvrir(b, S3); ev = pg.evaluate
    await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P4}'); await pg.wait_for_timeout(3000)
    await ev(f"docRT('{P4}', '{rid}', 'rdv')"); await pg.wait_for_timeout(1500)
    L = await ev("[...document.querySelectorAll('#dcPage .dc-rdv tr')].slice(1).map(tr => [...tr.children].map(td => td.innerText.trim()))")
    t = await ev("document.getElementById('dcPage').innerText")
    await ev("dcEnregistrer(true)"); await pg.wait_for_timeout(1500)
    html = await ev("(window.__win[window.__win.length - 1] || { w: { document: { _h: '' } } }).w.document._h")
    errs = pg.errs[:]; await pg.close()
    pages = 0
    if html and os.environ.get('NAVIGATEUR') == 'webkit': pages = 1  # PDF : Chrome seulement (outil de test) ; le nombre de pages est vérifié sous Chrome
    elif html:
        pp = await b.new_page(); await pp.set_content(html); await pp.wait_for_timeout(300)
        pdf = await pp.pdf(prefer_css_page_size=True); pages = len(re.findall(rb'/Type\s*/Page[^s]', pdf)); await pp.close()
    return L, t, pages, errs
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # 1. RT en cours, 25 séances, heure de la 1re séance 08:30
        L, t, pages, errs = await calendrier(b, '25', nb='25', ryt='1', deb='2026-09-01', debH={'h': '08:30', 'du': 20}, fin=None, finPrev=None)
        ok(t.startswith('Rendez-vous du patient') and 'Date de début : 01/09/2026' in t and 'Date de fin :' in t, 'titre « Rendez-vous du patient », bande des dates', t[:200])
        ok('Patient : PATIENT TEST 4' in t and 'ID patient : 202610004' in t and 'Oncologue : Dr' in t, 'patient, ID (n° de dossier), oncologue', t[:300])
        ok(len(L) == 25 and all(len(r) == 6 for r in L), '25 lignes de 6 colonnes', len(L))
        ok(L[0][3] == 'Mise en place RA' and L[0][2] == '15' and L[-1][3] == 'Fin de traitement RA' and all(r[3] == 'Traitement journalier RA' and r[2] == '20' for r in L[1:-1]), 'activités et durées (15 puis 20 min)', [L[0], L[-1]])
        ok(all(r[1] == '08:30' for r in L), 'heure de la 1re séance sur chaque ligne', L[0])
        ok(not any('HAL' in r[4] for r in L) and L[0][4] and not L[0][4].startswith('Dr'), 'ressource : le médecin (NOM Prénom), sans appareil', L[0][4])
        # 26/10/2026 (demande de Dr Bentahila) : séance passée = « Terminé » même si la fin n'est pas validée ; aujourd'hui (06/10) et après = « Prévu »
        iso = lambda s: s[6:] + s[3:5] + s[:2]
        ok(all(r[5] == ('Terminé' if iso(r[0]) < '20261006' else 'Prévu') for r in L) and any(r[5] == 'Terminé' for r in L), 'RT en cours : séances passées « Terminé », les autres « Prévu »', [(r[0], r[5]) for r in L][:3])
        ok("établies d'après le calendrier" not in t, 'plus de ligne du bas (T6, 24/10/2026, décision 14 : retirée)')
        ok(pages == 1, '25 séances : une seule page A4', pages)
        ok(not errs, 'aucune erreur JavaScript', errs[:2])
        # 2. Fin validée : « Terminé » ; fin = fin validée
        L, t, pages, errs = await calendrier(b, 'fin', nb='25', ryt='1', deb='2026-08-03', debH=None, fin='2026-09-08')
        ok(all(r[5] == 'Terminé' for r in L) and 'Date de fin : 08/09/2026' in t and L[-1][0] == '08/09/2026', 'fin validée : « Terminé », dernière ligne à la date de fin', [L[-1], t[:120]])
        ok(all(r[1] == '' for r in L), 'heure non notée : colonne vide')
        # 3. Fin validée mais séances réparties jusqu'à aujourd'hui seulement : jamais « Terminé » pour une date à venir
        L, t, pages, errs = await calendrier(b, 'avenir', nb='5', ryt='1', deb='2026-10-05', fin='2026-10-09')
        ok(all(r[5] == ('Terminé' if r[0] <= '06/10/2026' else 'Prévu') for r in L if r[0][3:5] == '10'), 'date à venir : « Prévu », même si la fin est notée', L)
        ok(len(L) == 5 and pages == 1, '5 séances : une page', (len(L), pages))
        # 4. Longs traitements et 2 séances par jour : une seule page A4
        for nb, ryt in [('33', '1'), ('39', '1'), ('60', 'bid')]:
            L, t, pages, errs = await calendrier(b, nb, nb=nb, ryt=ryt, deb='2026-08-03', fin=None, finPrev=None)
            ok(len(L) == int(nb) and pages == 1, nb + ' séances' + (' (2 par jour)' if ryt == 'bid' else '') + ' : ' + str(len(L)) + ' lignes, une seule page A4', (len(L), pages))
        # 5. Paramètres › Bibliothèques › Courriers : ancien calendrier modifié par le cabinet : gardé, le nouveau proposé
        S4 = json.loads(json.dumps(S2)); S4[E + 'bibliotheques/courriers'] = {'data': json.dumps([{'id': 'rt-rdv', 'rt': 'rdv', 'nom': 'Calendrier des séances de radiothérapie', 'html': '<p class="dc-titre">Calendrier théorique des séances</p><p>{tableau_seances}</p>'}])}
        pg = await ouvrir(b, S4); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/bibliotheques'); await pg.wait_for_timeout(1500)
        await ev("cfBib('courriers')"); await pg.wait_for_timeout(1200); await ev("crFiche('rt-rdv')"); await pg.wait_for_timeout(600)
        t = await pg.inner_text('#fenetreCorps')
        ok('Calendrier théorique' in await ev("document.getElementById('crPage').innerText") and 'Un nouveau modèle existe' in t, 'Paramètres : ancien modèle du cabinet gardé, le nouveau proposé', t[:200])
        await ev("window.confirm = () => true; crOrigine()"); await pg.wait_for_timeout(300)
        ok((await ev("document.getElementById('crNom').value")) == 'Calendrier de fin de radiothérapie' and 'Rendez-vous du patient' in await ev("document.getElementById('crPage').innerText"), '« Remettre le texte d\'origine » : nouveau modèle et nouveau nom')
        await ev("crValider()"); await pg.wait_for_timeout(1200)
        L = json.loads((await ev(f"window.__fs['{E}bibliotheques/courriers']"))['data']); m = next(z for z in L if z['id'] == 'rt-rdv')
        ok(m['nom'] == 'Calendrier de fin de radiothérapie' and '{id_patient}' in m['html'], 'Valider : le cabinet a le nouveau calendrier (nom et modèle)', m['nom'])
        ok(not pg.errs, 'aucune erreur JavaScript (Paramètres)', pg.errs[:2]); await pg.close()
        # 6. Téléphone : la fenêtre du document ne déborde pas
        S3, rid = avec_rt(nb='25', deb='2026-09-01')
        pg = await ouvrir(b, S3, w=390, h=800); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P4}'); await pg.wait_for_timeout(3000)
        await ev(f"docRT('{P4}', '{rid}', 'rdv')"); await pg.wait_for_timeout(1500)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : fenêtre du calendrier sans débordement de la page')
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
