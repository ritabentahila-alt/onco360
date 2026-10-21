import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-A4 (18/10/2026, demande du 17/10) : salle d'attente à jour sur tous les postes : dossiers modifiés sur un autre poste écoutés en direct
# (rendez-vous pris, nouveau patient), rien d'appliqué pendant une fenêtre ou une saisie (fait juste après), bouton « Actualiser » (« à jour à
# … », onglet et défilement gardés), relecture toute seule chaque minute. Patients fictifs seulement ; « un autre poste » = écriture directe
# dans le faux Firebase.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
T0 = "2026-10-06T10:00:00Z"  # S1 (21/10/2026) : heure universelle ; le Maroc est à GMT, Onco360 affiche donc 10 h 00 quel que soit le fuseau de l'ordinateur
P3, P7 = PIDS[2], PIDS[6]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2, t=T0); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(4500)
        texte = lambda: ev("document.getElementById('saL') ? document.getElementById('saL').innerText : ''")
        # Un autre poste ajoute un rendez-vous aujourd'hui au patient fictif 7 (version + 1, maj = maintenant)
        async def autre_poste(pid, rdv):
            await ev(f"""(() => {{ const k = '{E}patients/{pid}', d = window.__fs[k], l = JSON.parse(d.rdvsJson || '[]'); l.push({json.dumps(rdv)});
                window.__fs[k] = Object.assign({{}}, d, {{ rdvsJson: JSON.stringify(l), version: (d.version || 1) + 1, maj: new Date().toISOString(), majPar: 'AUTRE' }}); }})()""")
        avant = await texte()
        ok('PATIENT TEST 7' not in avant, 'au départ : le patient fictif 7 n\'est pas dans la salle du jour')
        await autre_poste(P7, {'id': 'rAutre1', 'type': 'Suivi', 'd': '2026-10-06', 'h': '16:30', 'n': '', 'st': 'prevu', 'du': 30})
        await pg.wait_for_timeout(3000)
        ok('PATIENT TEST 7' in await texte(), 'rendez-vous pris sur un autre poste : visible dans la salle sans recharger', (await texte())[:200])
        # Nouveau patient créé sur un autre poste, avec un rendez-vous aujourd'hui
        nouveau = {'etablissementId': 'DEMO', 'identite': {'nom': 'PATIENT TEST 9', 'nomF': 'PATIENT TEST 9', 'prenom': '', 'sexe': 'F'}, 'clinique': {}, 'lignesJson': '[]', 'planningJson': '{}',
                   'rdvsJson': json.dumps([{'id': 'rN', 'type': 'Annonce', 'd': '2026-10-06', 'h': '17:00', 'n': '', 'st': 'prevu', 'du': 45}]), 'rtsJson': '[]', 'version': 1, 'majPar': 'AUTRE'}
        await ev(f"window.__fs['{E}patients/PNOUV'] = Object.assign({json.dumps(nouveau)}, {{ maj: new Date().toISOString() }})")
        await pg.wait_for_timeout(3000)
        ok('PATIENT TEST 9' in await texte(), 'nouveau patient créé ailleurs : visible dans la salle et dans la liste', (await texte())[:200])
        ok(await ev("!!document.getElementById('nbSalle')"), 'pastille de la salle présente')
        # Fenêtre ouverte : rien n'est appliqué ; appliqué juste après la fermeture
        await ev(f"ouvrirRdv('{P3}', null, {{ d: '2026-10-06' }})"); await pg.wait_for_timeout(500)
        await autre_poste(P3, {'id': 'rAutre2', 'type': 'Contrôle', 'd': '2026-10-06', 'h': '18:00', 'n': '', 'st': 'prevu', 'du': 30})
        await pg.wait_for_timeout(3000)
        enattente = await ev("document.getElementById('fenetre').classList.contains('cache') === false")
        ok(enattente, 'fenêtre de rendez-vous toujours ouverte (rien n\'est redessiné pendant la saisie)')
        ok('18:00' not in await texte(), 'pendant la fenêtre : le changement venu d\'ailleurs attend (protection « Ce dossier vient d\'être modifié »)')
        await ev("fermerFenetre()"); await pg.wait_for_timeout(3000)
        ok('18:00' in await texte(), 'fenêtre fermée : le changement venu d\'ailleurs est appliqué juste après', (await texte())[-300:])
        # Bouton « Actualiser » : « à jour à … », onglet gardé
        ok(await ev("!!document.getElementById('saAct')"), 'bouton « Actualiser » dans l\'en-tête de la salle')
        await ev("[...document.querySelectorAll('#saO [role=tab], #saO button')].find(b => /Vus/.test(b.textContent)).click()"); await pg.wait_for_timeout(500)
        onglet = await ev("([...document.querySelectorAll('#saO [aria-selected=true], #saO .on, #saO .actif')].map(b => b.textContent)[0]) || ''")
        await ev("saActualiser()"); await pg.wait_for_timeout(1500)
        aj = await ev("document.getElementById('saAjour').textContent")
        ok(aj.startswith('à jour à') and ' h ' in aj, '« Actualiser » : « à jour à 10 h 00 » affiché', aj)
        onglet2 = await ev("([...document.querySelectorAll('#saO [aria-selected=true], #saO .on, #saO .actif')].map(b => b.textContent)[0]) || ''")
        ok(onglet and onglet == onglet2 and 'Vus' in onglet2, 'onglet « Vus » gardé après l\'actualisation', (onglet, onglet2))
        # Toute seule chaque minute : l'heure avance de 70 s → nouvelle relecture
        await pg.clock.set_fixed_time("2026-10-06T10:01:10Z"); await pg.wait_for_timeout(11500)
        aj2 = await ev("document.getElementById('saAjour').textContent")
        ok(aj2 != aj and '10 h 01' in aj2, 'relecture toute seule après une minute (« à jour à 10 h 01 »)', (aj, aj2))
        # … mais pas pendant une saisie (recherche en cours) : faite après
        await pg.focus('#saQ'); await pg.clock.set_fixed_time("2026-10-06T10:02:20Z"); await pg.wait_for_timeout(11500)
        aj3 = await ev("document.getElementById('saAjour').textContent")
        ok(aj3 == aj2, 'pendant une saisie : pas de relecture', (aj2, aj3))
        await ev("document.activeElement.blur()"); await pg.wait_for_timeout(11500)
        ok('10 h 02' in await ev("document.getElementById('saAjour').textContent"), 'saisie finie : relecture faite juste après')
        # Tableau de bord ouvert : redessiné quand un dossier change ailleurs, défilement gardé
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(2500)
        await ev("document.getElementById('page').firstElementChild.setAttribute('data-test', '1')")
        await autre_poste(P7, {'id': 'rAutre3', 'type': 'Suivi', 'd': '2026-10-07', 'h': '09:00', 'n': '', 'st': 'prevu', 'du': 30})
        await pg.wait_for_timeout(3000)
        ok(not await ev("!!document.querySelector('#page [data-test]')"), 'tableau de bord redessiné après un changement venu d\'ailleurs')
        # Dossier ouvert pendant qu'un collègue le modifie : redessiné, message « Dossier mis à jour »
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P7}'); await pg.wait_for_timeout(2500)
        await autre_poste(P7, {'id': 'rAutre4', 'type': 'Contrôle', 'd': '2026-10-09', 'h': '11:00', 'n': '', 'st': 'prevu', 'du': 30})
        await pg.wait_for_timeout(3000)
        ok('Dossier mis à jour' in await ev("document.getElementById('toast').textContent") and '09/10' in await ev("document.getElementById('page').innerText"), 'dossier ouvert : redessiné avec le rendez-vous ajouté ailleurs, message « Dossier mis à jour »')
        # Téléphone
        await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.wait_for_timeout(2000)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : salle sans débordement avec le bouton « Actualiser »')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
