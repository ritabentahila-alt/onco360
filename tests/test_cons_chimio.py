import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# 26/10/2026 (demande de Dr Bentahila) : la consultation d'un jour de chimiothérapie reçu reste dans « Rendez-vous et tâches à venir » tant
# qu'elle n'est pas validée (« Consultation : venu ») ; elle passe dans l'historique à sa validation, plus à celle de la cure. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
JOUR = '2026-10-20'
S2, PIDS = avec_demo(S, E, JOUR)
AV = "[...document.querySelectorAll('#rdvListe .rc')].filter(c => /consultation/.test(c.innerText) && /À valider/.test(c.innerText))"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2, t=JOUR + 'T10:00:00'); ev = pg.evaluate
        P = oc = None
        for pid in PIDS:
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2200)
            so = await ev("[...document.querySelectorAll('#rdvListe .rc')].filter(c => /20\\/10/.test(c.innerText) && /Séance chimio/.test(c.innerText) && !/en retard/.test(c.innerText)).map(c => [...c.querySelectorAll('button')].map(b => b.getAttribute('onclick') || '').find(o => o.startsWith('chOuvrir'))).filter(Boolean)[0] || ''")
            if not so: continue
            a0 = so[so.index('(') + 1:so.rindex(')')].replace("'", '').split(',')
            await ev(so); await pg.wait_for_timeout(1200)
            await ev(f"chValiderJ1('{pid}', {a0[1]}, {a0[2]})"); await pg.wait_for_timeout(2500)
            await ev("fermerFenetre(); fermerFenetre()"); await ev(f"ouvrirDossier('{pid}')"); await pg.wait_for_timeout(1800)
            await ev(f"voirAvTout('{pid}')"); await pg.wait_for_timeout(300)
            o = await ev(AV + ".map(c => [...c.querySelectorAll('button')].map(b => b.getAttribute('onclick') || '').find(o => o.startsWith('chVenuChimio'))).filter(Boolean)[0] || ''")
            if o: P, oc = pid, o; break
        ok(bool(P), 'cure validée, consultation non validée : reste dans « Rendez-vous et tâches à venir », « À valider », bouton « Consultation : venu »', oc)
        if P:
            a = oc[oc.index('(') + 1:oc.rindex(')')].replace("'", '').split(',')
            k = a[1] + '|' + a[2] + '|' + a[3]
            ok(k not in await ev("[...document.querySelectorAll('.rl-liste:not(#rdvListe) button')].map(b => b.getAttribute('onclick') || '').join(' ')"), 'pas encore dans l\'historique', k)
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); s3 = await ev('window.__fs'); await pg.close()
            print('Consultation validée (prix noté)')
            s3[E + 'encaissements/' + P] = {'etablissementId': S2[E + 'patients/' + P].get('etablissementId', ''), 'data': json.dumps({'cons': {k: {'d': JOUR, 'm': 300, 'mode': 'esp', 'lib': 'Consultation'}}})}
            pg = await ouvrir(b, s3, t=JOUR + 'T10:00:00'); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P}'); await pg.wait_for_timeout(2500)
            await ev(f"voirAvTout('{P}')"); await ev(f"typeof voirPaTout === 'function' && voirPaTout('{P}')"); await pg.wait_for_timeout(400)
            av = await ev("[...document.querySelectorAll('#rdvListe button')].map(b => b.getAttribute('onclick') || '').join(' ')")
            pa = await ev("[...document.querySelectorAll('.rl-liste:not(#rdvListe) button')].map(b => b.getAttribute('onclick') || '').join(' ')")
            ok(("'%s'," % a[1]) + a[2] + ',' + a[3] not in av.replace("'" + P + "','", "'"), 'validée : plus dans « à venir »', av[:300])
            ok(a[1] in pa and 'chAnnulerVenuChimio' in pa, 'validée : dans l\'historique des rendez-vous (« Annuler le statut »)', pa[:300])
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
