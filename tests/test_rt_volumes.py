import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 3.5 Radiothérapie : volumes (principal, complément séquentiel, complément intégré) et rythmes ; 3.6 compte rendu de fin rempli
# (volumes et doses, dates, prochain rendez-vous, bilan de contrôle de la dernière consultation). 12/10/2026 (date des tests : 06/10).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and len(v.get('lignesJson') or '') > 50][0]
HOP = S[E + 'patients/' + pid].get('etablissementId') or 'HGC'
def seed(rts, rdvs=None, consult=None):
    S2 = json.loads(json.dumps(S)); S2[E + 'patients/' + pid]['rtsJson'] = json.dumps(rts)
    if rdvs is not None: S2[E + 'patients/' + pid]['rdvsJson'] = json.dumps(rdvs)
    if consult: S2[E + 'consultations/cT1'] = consult
    return S2
rts = lambda fs: json.loads(fs[E + 'patients/' + pid].get('rtsJson') or '[]')
async def dossier(b, S2):
    pg = await ouvrir(b, S2); await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500); return pg, pg.evaluate
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Nouvelle prescription : volumes et rythme')
        pg, ev = await dossier(b, seed([]))
        await ev(f"ouvrirRT('{pid}')"); await pg.wait_for_timeout(500)
        await ev("(()=>{const s=document.getElementById('rActe');s.value=s.options[1].value})()")
        await pg.fill('#rvM0', 'Sein gauche'); await pg.fill('#rDose', '50'); await pg.fill('#rNb', '25')
        await ev("rtVolAj('seq')"); await pg.fill('#rvM1', 'Lit tumoral'); await pg.fill('#rvD1', '16'); await pg.fill('#rvN1', '8')
        await ev("rtVolAj('int')"); await pg.fill('#rvM2', 'Ganglions'); await pg.fill('#rvD2', '55')
        t = await pg.inner_text('#rDpf')
        ok('Sein gauche : 50 Gy en 25 fractions (2 Gy par fraction)' in t and 'Complément séquentiel – Lit tumoral : 16 Gy en 8 fractions' in t and 'Complément intégré – Ganglions : 55 Gy en 25 fractions (2,2 Gy par fraction)' in t and '33 séances' in t, 'volumes et doses par fraction affichés ; 33 séances (l\'intégré partage les séances)', t)
        ok(await ev("document.getElementById('rvN2').disabled"), 'complément intégré : fractions = celles du volume principal')
        await pg.select_option('#rRyt', 'jours'); await pg.wait_for_timeout(100)
        ok(await ev("!document.getElementById('rJoursZ').classList.contains('cache')"), 'rythme « jours choisis » : cases des jours affichées')
        await pg.select_option('#rRyt', 'bid'); await pg.fill('#rDeb', '2026-10-12'); await pg.wait_for_timeout(100)
        ok('mardi 3 novembre 2026' in (await pg.inner_text('#rFinCalc')).lower(), '2 séances par jour : 33 fractions en 17 jours ouvrés → 03/11', await pg.inner_text('#rFinCalc'))
        await pg.select_option('#rRyt', '1'); await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        r = rts(await ev("window.__fs"))[0]
        ok(len(r.get('vol', [])) == 3 and r['nb'] == '33' and r['dose'] == '50' and r['vol'][1]['ty'] == 'seq' and r['vol'][2]['ty'] == 'int' and 'nb' not in r['vol'][2], 'enregistré : 3 volumes, 33 séances, dose du volume principal', r)
        await ev(f"ongletDossier('{pid}','rt')"); await pg.wait_for_timeout(500)
        t = await pg.inner_text('#op-rt')
        ok('Complément séquentiel – Lit tumoral' in t and '33 séances' in t, 'carte de radiothérapie : volumes et séances', t[:400])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Prescription d\'avant (dose et fractions) : un volume, rien à ressaisir')
        old = {"id": "rtA", "acte": "Sein", "hop": HOP, "deb": "2026-09-01", "nb": "25", "dose": "50", "ryt": "1", "nbA": 1, "cree": "2026-08-01"}
        pg, ev = await dossier(b, seed([old]))
        await ev(f"ouvrirRT('{pid}','rtA')"); await pg.wait_for_timeout(500)
        ok(await ev("document.getElementById('rDose').value") == '50' and await ev("document.getElementById('rNb').value") == '25' and not await ev("!!document.getElementById('rvD1')"), 'formulaire : volume principal 50 Gy / 25, aucun complément')
        await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        r = rts(await ev("window.__fs"))[0]
        ok('vol' not in r and r['nb'] == '25', 'enregistrée telle quelle (pas de volume ajouté)', r)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Compte rendu de fin rempli (3.6)')
        rt = {"id": "rtC", "acte": "Sein", "hop": HOP, "scan": "2026-08-01", "cont": "2026-08-03", "dosi": "2026-08-05", "deb": "2026-08-10", "fin": "2026-09-25", "nb": "33", "dose": "50", "ryt": "1", "nbA": 1, "intent": "curative",
              "vol": [{"nom": "Sein gauche", "dose": "50", "nb": "25", "ty": "p"}, {"nom": "Lit tumoral", "dose": "16", "nb": "8", "ty": "seq"}], "cree": "2026-07-20"}
        rdvs = [{"id": "rC", "type": "Consultation de contrôle", "d": "2026-11-20", "h": "10:00", "st": "prevu"}, {"id": "rH", "type": "En cours de RT", "d": "2026-10-20", "st": "prevu", "rtc": "rtC"}]
        cs = {"patientId": pid, "etablissementId": HOP, "d": "2026-10-02", "titre": "Consultation", "note": "", "o": 1, "lignes": [{"id": "l1", "t": "analyse", "d": "2026-10-02", "lib": "NFS, ionogramme"}, {"id": "l2", "t": "exam", "d": "2026-10-02", "lib": "Mammographie bilatérale"}], "creePar": "x", "majPar": "x"}
        pg, ev = await dossier(b, seed([rt], rdvs, cs))
        await ev(f"docRT('{pid}','rtC','cr')"); await pg.wait_for_timeout(1800)
        t = await ev("(document.getElementById('dcPage')||{}).innerText||''")
        ok('Volumes et doses' in t and 'Sein gauche : 50 Gy en 25 fractions' in t and 'Complément séquentiel – Lit tumoral : 16 Gy en 8 fractions' in t, 'volumes et doses remplis', t[t.find('3.'):t.find('3.') + 300])
        ok('Date de fin : 25/09/2026' in t and 'Date de début : 10/08/2026' in t, 'dates de début et de fin', t[t.find('4.'):t.find('4.') + 120])
        ok('20/11/2026 à 10:00 – Consultation de contrôle' in t, 'prochain rendez-vous (pas la consultation hebdomadaire)', t[t.find('6.'):t.find('6.') + 250])
        ok('NFS, ionogramme ; Mammographie bilatérale (prescrit le 02/10/2026)' in t, 'bilan de contrôle : analyses et examens de la dernière consultation', t[t.find('6.'):t.find('6.') + 300])
        ok('Toxicités observées : à compléter par le médecin' in t.replace('\n', ' '), 'toxicités : à compléter par le médecin (jamais imprimé)')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
