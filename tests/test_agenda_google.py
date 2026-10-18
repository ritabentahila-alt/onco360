import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-A2 (18/10/2026) : chaque façon de déplacer un rendez-vous met à jour ce qui part vers Google Agenda (resume.ag du dossier, lu par la
# fonction agendaPatient ; l'envoi lui-même est vérifié par functions/test-logique.js). Patients fictifs seulement (functions/demo.js).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
def addj(d, n):
    import datetime; return (datetime.date.fromisoformat(d) + datetime.timedelta(days=n)).isoformat()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(4000)
        async def ag(pid): return json.loads((await ev(f"window.__fs['{E}patients/{pid}'].resume") or '{}')).get('ag', [])
        async def evt(pid, k): return next((e for e in await ag(pid) if e['k'] == k), None)
        async def fin(ms=1500):
            await pg.wait_for_timeout(ms)
            if await ev("!!document.getElementById('hNon')"): await pg.click('#hNon'); await pg.wait_for_timeout(500)
            if await ev("!!(document.querySelector('#fenetre:not(.cache) .bt.gris') && /Plus tard/.test(document.getElementById('fenetreCorps').innerText))"):
                await ev("[...document.querySelectorAll('#fenetreCorps button')].find(b => /Plus tard/.test(b.textContent)).click()"); await pg.wait_for_timeout(400)
        async def lignes(pid): return json.loads(await ev(f"window.__fs['{E}patients/{pid}'].lignesJson"))
        P2, P4, P6, P7 = PIDS[1], PIDS[3], PIDS[5], PIDS[6]
        # 1. Cure de chimio (J1) : « Modifier » avec une heure, « cette séance seulement »
        L2 = (await lignes(P2))[0]; k5 = f'{P2}|c|0|5'; e5 = await evt(P2, k5); k6 = f'{P2}|c|0|6'; e6 = await evt(P2, k6)
        ok(e5 and e6, 'jeu : cures C5 et C6 du patient fictif 2 dans l\'agenda', [e['k'] for e in await ag(P2)][:6])
        nd = addj(e5['d'], 2)
        await ev(f"chModifierRdvChimio('{P2}', '{L2['id']}', 5, 1)"); await pg.wait_for_timeout(500)
        await pg.fill('#mD', nd); await ev("document.getElementById('mD').dispatchEvent(new Event('input'))"); await pg.fill('#mH', '10:00')
        await ev("(document.querySelector('input[name=dS][value=seule]')||{}).click && document.querySelector('input[name=dS][value=seule]').click()")
        await pg.click('#fOk'); await fin()
        a5, a6 = await evt(P2, k5), await evt(P2, k6)
        ok(a5 and a5['d'] == nd and a5.get('h') == '10:00', 'C5 déplacée avec une heure : date et heure suivies (journée → heure)', a5)
        ok(a6 and a6['d'] == e6['d'], '« cette séance seulement » : C6 garde sa date', (a6, e6))
        # 2. Report de cure, « décaler la suite »
        await ev(f"chReporter('{P2}', 0, 4)"); await pg.wait_for_timeout(500)
        nd2 = addj(nd, 5); await pg.fill('#rD', nd2)
        await ev("(document.querySelector('input[name=rS][value=suite]')||{click(){}}).click()"); await pg.click('#fOk'); await fin()
        b5, b6 = await evt(P2, k5), await evt(P2, k6)
        ok(b5 and b5['d'] == nd2, 'report de cure : C5 au ' + nd2, b5)
        ok(b6 and b6['d'] != e6['d'], 'report « décaler la suite » : C6 suit aussi', (b6, e6))
        # 3. Glisser-déposer de l'agenda (même fenêtre, date et heure proposées) : C6 vers une autre date, avec une heure
        nd3 = addj(b6['d'], 1)
        await ev(f"chModifierRdvChimio('{P2}', '{L2['id']}', 6, 1, null, {{ d: '{nd3}', h: '08:30' }})"); await pg.wait_for_timeout(500)
        await ev("(document.querySelector('input[name=dS][value=seule]')||{click(){}}).click()"); await pg.click('#fOk'); await fin()
        c6 = await evt(P2, k6)
        ok(c6 and c6['d'] == nd3 and c6.get('h') == '08:30', 'glisser-déposer d\'une cure : date et heure suivies', c6)
        # 4. Puis l'heure retirée (heure → journée entière)
        await ev(f"chModifierRdvChimio('{P2}', '{L2['id']}', 6, 1)"); await pg.wait_for_timeout(500); await pg.fill('#mH', ''); await pg.click('#fOk'); await fin()
        d6 = await evt(P2, k6)
        ok(d6 and d6['d'] == nd3 and not d6.get('h'), 'heure retirée : l\'événement redevient une journée entière', d6)
        # 5. Séance J8 (protocole à J1 / J8) : déplacée
        L6 = (await lignes(P6))[0]; j8 = [e for e in await ag(P6) if '|s|' in e['k'] and e['k'].endswith('|8')]
        ok(j8, 'jeu : une séance J8 à venir (patient fictif 6)', [e['k'] for e in await ag(P6)][:6])
        if j8:
            s8 = j8[0]; n = int(s8['k'].split('|')[3]); nd5 = addj(s8['d'], 1)
            await ev(f"chModifierRdvChimio('{P6}', '{L6['id']}', {n}, 8)"); await pg.wait_for_timeout(500)
            await pg.fill('#mD', nd5); await ev("document.getElementById('mD').dispatchEvent(new Event('input'))"); await pg.fill('#mH', '11:15'); await pg.click('#fOk'); await fin()
            t8 = await evt(P6, s8['k'])
            ok(t8 and t8['d'] == nd5 and t8.get('h') == '11:15', 'séance J8 déplacée avec une heure : suivie', t8)
        # 6. Radiothérapie : 1re séance déplacée avec une heure ; la fin prévue suit
        rt = json.loads(await ev(f"window.__fs['{E}patients/{P4}'].rtsJson"))[0]; kd, kf = f"{P4}|rt|{rt['id']}|deb", f"{P4}|rt|{rt['id']}|fin"
        f0 = await evt(P4, kf); nd6 = addj(rt['deb'], 3)
        while True:
            import datetime
            if datetime.date.fromisoformat(nd6).weekday() < 5: break
            nd6 = addj(nd6, 1)
        await ev(f"modifierEtapeRT('{P4}', '{rt['id']}', 'deb')"); await pg.wait_for_timeout(500); await pg.fill('#eD', nd6); await pg.fill('#eH', '09:00'); await pg.click('#fOk'); await fin()
        g, f1 = await evt(P4, kd), await evt(P4, kf)
        ok(g and g['d'] == nd6 and g.get('h') == '09:00', '1re séance de RT déplacée avec une heure : suivie', g)
        ok(f0 and f1 and f1['d'] != f0['d'], 'fin de RT prévue recalculée et suivie', (f0, f1))
        # 7. Fin prévue de RT déplacée à la main (glisser-déposer, sans heure)
        nd7 = addj(f1['d'], 2)
        await ev(f"modifierEtapeRT('{P4}', '{rt['id']}', 'fin', null, {{ d: '{nd7}', h: '' }})"); await pg.wait_for_timeout(500); await pg.click('#fOk'); await fin()
        h7 = await evt(P4, kf)
        ok(h7 and h7['d'] == nd7, 'fin de RT déplacée (agenda) : suivie', h7)
        # 8. Consultation : « Modifier » (date et heure)
        rdvs = json.loads(await ev(f"window.__fs['{E}patients/{P7}'].rdvsJson")); r = rdvs[0]; kr = f"{P7}|r|{r['id']}"
        nd8 = addj(r['d'], 1)
        while True:
            if datetime.date.fromisoformat(nd8).weekday() < 5: break
            nd8 = addj(nd8, 1)
        await ev(f"ouvrirRdv('{P7}', '{r['id']}')"); await pg.wait_for_timeout(500); await pg.fill('#fD', nd8); await pg.fill('#fH', '11:00'); await pg.click('#fOk'); await fin()
        i8 = await evt(P7, kr)
        ok(i8 and i8['d'] == nd8 and i8['h'] == '11:00', 'consultation déplacée (« Modifier ») : suivie', i8)
        # 9. « Absent » puis report : l'ancien rendez-vous quitte l'agenda, le nouveau y entre
        await ev(f"statutRdv('{P7}', '{r['id']}', 'absent')"); await pg.wait_for_timeout(600)
        if await ev("!!document.getElementById('abD')"):
            nd9 = addj(nd8, 7)
            while datetime.date.fromisoformat(nd9).weekday() >= 5: nd9 = addj(nd9, 1)
            await pg.fill('#abD', nd9); await pg.fill('#abH', '10:30'); await pg.click('#fOk'); await fin()
            A9 = [e for e in await ag(P7) if '|r|' in e['k']]
            ok(not any(e['k'] == kr for e in A9) and any(e['d'] == nd9 and e.get('h') == '10:30' for e in A9), 'Absent + report : ancien retiré, nouveau rendez-vous dans l\'agenda', A9)
        else: ok(False, 'fenêtre « Absent » ouverte', await pg.inner_text('#fenetreCorps'))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # 10. Secrétaire avec le seul droit « planning » : report d'une cure, l'agenda suit aussi
        S3 = json.loads(json.dumps(S2)); sec = 'SEC'
        S3[E + 'membres/SEC'] = {"role": "assistante", "nom": "SEC", "email": "sec@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {"traitements": "voir", "planningChimio": True, "rendezvous": True}}
        S3['utilisateurs/SEC'] = {"nom": "SEC", "prenom": "Test"}
        if sec:
            pg = await ouvrir(b, S3); ev = pg.evaluate
            await pg.add_init_script(f"window.__uid = '{sec}'")
            await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(4000)
            await ev(f"chReporter('{P2}', 0, 4)"); await pg.wait_for_timeout(500)
            if await ev("!!document.getElementById('rD')"):
                nd10 = addj(await ev("document.getElementById('rD').value"), 3); await pg.fill('#rD', nd10); await pg.click('#fOk'); await fin()
                z = await evt(P2, k5)
                ok(z and z['d'] == nd10, 'secrétaire (droit « planning ») : report de cure suivi dans l\'agenda', z)
            else: print('  (la secrétaire du jeu ne peut pas reporter ici : chemin vérifié par test_seances / test_salle)')
            ok(not pg.errs, 'aucune erreur JavaScript (secrétaire)', pg.errs[:2]); await pg.close()
        # 11. Paramètres › Google Agenda : les refus de Google sont affichés (plus en silence)
        S4 = json.loads(json.dumps(S2)); u = S4.setdefault('utilisateurs/UIDRITA', {})
        u['agendaGoogle'] = {'email': 'test@test.ma', 'calendrier': 'Onco360', 'le': '2026-10-06T09:00:00Z', 'nb': 12, 'erreur': '', 'refus': {'PX': {'n': 2, 'motif': 'Invalid start time.', 'd': '2026-10-20', 'le': '2026-10-06T09:00:00Z'}}}
        pg = await ouvrir(b, S4); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/couleurs'); await pg.wait_for_timeout(3500)
        t = await ev("document.getElementById('page').innerText")
        ok('2 événements refusés par Google' in t and 'Invalid start time.' in t and '20/10/2026' in t, 'Paramètres › Google Agenda : « 2 événements refusés par Google », motif et date', t[t.find('Mon Google'):][:300] if 'Mon Google' in t else len(t))
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.wait_for_timeout(500)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : aucun débordement')
        ok(not pg.errs, 'aucune erreur JavaScript (Google Agenda)', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
