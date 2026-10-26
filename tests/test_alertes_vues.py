import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-B2 (19/10/2026, demande du 17/10) : alertes cliniques du tableau de bord validées « Vu » : elles disparaissent, ne reviennent pas
# (sauf nouvelle valeur), « Alertes vues (n) » pour les revoir et les remettre ; rangées par médecin (utilisateurs/{uid}.alertesVues).
# Patient fictif : perte de poids de 14 % depuis le début de la ligne.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E); P1 = PIDS[0]
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]  # patients fictifs seulement
L = json.loads(S2[E + 'patients/' + P1]['lignesJson']); L[0]['cures'][0]['poids'] = '70'; L[0]['cures'][1]['poids'] = '60'; S2[E + 'patients/' + P1]['lignesJson'] = json.dumps(L)
S2.setdefault('utilisateurs/UIDRITA', {})['alertesVues'] = {'avieille': '2026-06-01'}  # plus de 90 jours : effacée à la prochaine écriture
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3500)
        alerte = "[...document.querySelectorAll('.af-l')].filter(l => /Perte de poids de 14 %/.test(l.innerText))"
        ok(await ev(alerte + ".length") == 1, 'tableau de bord : alerte « Perte de poids de 14 % » du patient fictif 1')
        ok(await ev(alerte + "[0].querySelector('.af-vu') !== null"), 'bouton « Vu » (coche) sur la ligne')
        n0 = await ev("location.hash")
        await ev(alerte + "[0].querySelector('.af-vu').click()"); await pg.wait_for_timeout(1200)
        ok(await ev("location.hash") == n0, '« Vu » n\'ouvre pas le dossier')
        ok(await ev(alerte + ".length") == 0, 'alerte vue : elle disparaît')
        vues = (await ev("window.__fs['utilisateurs/UIDRITA']") or {}).get('alertesVues', {})
        ok(len(vues) == 1 and list(vues.values())[0] == '2026-10-06' and 'avieille' not in vues, 'rangée dans la fiche du médecin, datée ; vue de plus de 90 jours effacée', vues)
        ok(await ev("[...document.querySelectorAll('button.af-vues')].some(b => b.textContent.includes('1 alerte vue'))"), 'pastille « 1 alerte vue » (26/10/2026)')
        # Rechargement (nouvelle page, avec ce qui a été enregistré) : toujours cachée
        fs = await ev("window.__fs"); await pg.close()
        pg = await ouvrir(b, fs); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3500)
        ok(await ev(alerte + ".length") == 0, 'après rechargement : l\'alerte ne revient pas')
        # Revoir et remettre
        await ev("document.querySelector('button.af-vues').click()"); await pg.wait_for_timeout(500)
        t = await pg.inner_text('#fenetreCorps')
        ok('Perte de poids de 14 %' in t and 'Remettre' in t, 'fenêtre « Alertes vues » : l\'alerte et « Remettre »', t[:200])
        await ev("[...document.querySelectorAll('#fenetreCorps button')].find(b => b.textContent === 'Remettre').click()"); await pg.wait_for_timeout(1200)
        ok(await ev(alerte + ".length") == 1, '« Remettre » : l\'alerte revient dans le tableau de bord')
        ok(not ((await ev("window.__fs['utilisateurs/UIDRITA']") or {}).get('alertesVues') or {}), 'et quitte la liste des vues')
        # Vue, puis nouvelle valeur (poids de la séance du jour, C3, à 59 kg ; une cure validée, elle, est figée) : nouvelle alerte
        await ev(alerte + "[0].querySelector('.af-vu').click()"); await pg.wait_for_timeout(1000)
        await ev(f"""(() => {{ const k = '{E}patients/{P1}', d = window.__fs[k], l = JSON.parse(d.lignesJson); l[0].cures[2].poids = '59'; window.__fs[k] = Object.assign({{}}, d, {{ lignesJson: JSON.stringify(l), version: (d.version || 1) + 1, maj: new Date().toISOString(), majPar: 'AUTRE' }}); }})()""")
        await pg.wait_for_timeout(3500)
        ok(await ev("[...document.querySelectorAll('.af-l')].some(l => /Perte de poids de 16 %/.test(l.innerText))"), 'nouvelle valeur (59 kg) : nouvelle alerte « 16 % »')
        # Un autre médecin ne partage pas les alertes vues
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.wait_for_timeout(600)
        ok(await ev("document.documentElement.scrollWidth <= 392") and await ev("(" + alerte.replace('14', '16') + "[0]||document.body).querySelector('.af-vu') ? (" + alerte.replace('14', '16') + "[0].querySelector('.af-vu').getBoundingClientRect().width >= 44) : false"), 'téléphone (390 px) : sans débordement, bouton « Vu » de 44 px')
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
