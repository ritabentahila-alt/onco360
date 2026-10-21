import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# 21/10/2026 (signalé par Dr Bentahila) : rendez-vous pris dans l'ancienne application, validé « Venu » maintenant à HCK : 250 DH proposé (brut du
# tarif), et plus 225 DH (prix v1 = net, 250 − 10 %) ; enregistré en brut comme un rendez-vous d'Onco360 (bilan : même net) ; réduction v1 gardée ;
# rendez-vous v1 déjà « Venu » : inchangé. Médecin et secrétaire. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k0 in [k0 for k0 in S2 if k0.startswith(E + 'patients/') and k0.split('/')[-1] not in PIDS]: del S2[k0]
P = PIDS[2]; d = S2[E + 'patients/' + P]; d['etablissementId'] = 'HCK'
d['rdvsJson'] = json.dumps([{'id': 'rX', 'type': 'Suivi', 'd': '2026-10-06', 'h': '10:00', 'st': 'prevu'}, {'id': 'rY', 'type': 'Annonce', 'd': '2026-10-06', 'h': '11:00', 'st': 'prevu'},
                            {'id': 'rZ', 'type': 'Suivi', 'd': '2026-10-06', 'h': '12:00', 'st': 'prevu'}, {'id': 'rW', 'type': 'Suivi', 'd': '2026-10-01', 'h': '09:00', 'st': 'fait', 'dv': '2026-10-01'}])
S2[E + 'patientsFinances/' + P] = {'etablissementId': 'HCK', 'montantsJson': json.dumps({'rdv': {'rX': {'v1': True, 'prix': 225}, 'rZ': {'v1': True, 'prix': 150}, 'rW': {'v1': True, 'prix': 225}}, 'cures': {}, 'rt': {}})}
S2[E + 'encaissements/' + P] = {'etablissementId': 'HCK', 'data': json.dumps({'rdv': {'rX': {'m': 225, 'v1': True, 'b': 250}, 'rW': {'m': 225, 'v1': True, 'b': 250}}, 'cons': {}})}
S2[E + 'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {}}
S2['utilisateurs/SEC'] = {"nom": "SEC", "prenom": "Test"}
# tarifs des consultations publiés par le médecin (brut seul : la secrétaire ne voit ni rétrocession ni impôt)
S2[E + 'parametres/tarifsConsultations'] = {'data': json.dumps({'repli': 'HGC', 'etablissements': {'HCK': {'activites': [{'type': 'suivi', 'libelle': 'Consultation de suivi', 'historique': [{'depuis': '2000-01-01', 'brut': 250}]}]}}})}
FONC = open(pathlib.Path(__file__).parent / 'test_salle.py').read().split('FONC = """')[1].split('"""')[0]
U = f'http://localhost:{PORT}/v2.html#dossier/{P}'
async def venu(pg, rid):
    await pg.evaluate(f"statutRdv('{P}', '{rid}', 'fait')"); await pg.wait_for_timeout(1500)
    return await pg.evaluate("document.getElementById('pvM') && document.getElementById('pvM').value"), await pg.evaluate("(document.getElementById('fenetreCorps')||{}).innerText||''")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('1. Médecin')
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.goto(U); await pg.wait_for_timeout(3000)
        v, t = await venu(pg, 'rX')
        ok(v == '250' and 'Tarif HCK : 250 DH' in t, 'rendez-vous repris de l\'ancienne application (prix v1 225 = net) : 250 DH proposé', (v, t[:200]))
        await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        M = json.loads((await ev("window.__fs"))[E + 'patientsFinances/' + P]['montantsJson'])['rdv']['rX']
        ok(M.get('brut') == 250 and not M.get('v1') and 'prix' not in M, 'enregistré en brut (250), plus en prix v1 (bilan : 225 net, comme avant)', M)
        v, t = await venu(pg, 'rY')
        ok(v == '250', 'rendez-vous d\'Onco360 : 250 DH (inchangé)', v); await ev("fermerFenetre()")
        v, t = await venu(pg, 'rZ')
        ok(v == '150', 'prix v1 différent du tarif (réduction à 150) : gardé', v); await ev("fermerFenetre()")
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('2. Secrétaire')
        ps = await ouvrir(b, S2); await ps.add_init_script("window.__uid='SEC';" + FONC); ev = ps.evaluate; await ps.goto(U); await ps.wait_for_timeout(3000)
        v, t = await venu(ps, 'rX')
        ok(v == '250', 'secrétaire : 250 DH proposé aussi (avant : 225, le montant net de l\'encaissement v1)', (v, t[:200]))
        await ps.click('#fOk'); await ps.wait_for_timeout(1500)
        ap = await ev("window.__appels || []")
        ok(ap and ap[-1].get('v1Prevu') and ap[-1]['montant'] == 250, 'serveur appelé avec 250 DH et « rendez-vous repris de l\'ancienne application »', ap)
        ok(not ps.errs, 'aucune erreur JavaScript', ps.errs[:2]); await ps.close()
        await b.close()
    print(f'\nTest prix v1 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
