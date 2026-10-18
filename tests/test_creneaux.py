import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-A3 (18/10/2026, demande du 17/10) : les créneaux déjà pris par la consultation d'une séance de chimio ou par une étape de radiothérapie
# avec heure sont comptés partout où l'on place une consultation ; sans heure : listées dans la fenêtre ; créneau pris = un clic
# d'avertissement, jamais bloqué. Patients fictifs seulement (functions/demo.js).
import datetime
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
P2, P4, P7 = PIDS[1], PIDS[3], PIDS[6]
def ouvre(d):
    return datetime.date.fromisoformat(d).weekday() < 5
def addj(d, n): return (datetime.date.fromisoformat(d) + datetime.timedelta(days=n)).isoformat()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(4000)
        async def ag(pid): return json.loads((await ev(f"window.__fs['{E}patients/{pid}'].resume") or '{}')).get('ag', [])
        async def fin(ms=1500):
            await pg.wait_for_timeout(ms)
            if await ev("!!document.getElementById('hNon')"): await pg.click('#hNon'); await pg.wait_for_timeout(400)
            if await ev("!!(document.getElementById('fenetreCorps') && /Plus tard/.test(document.getElementById('fenetreCorps').innerText))"):
                await ev("[...document.querySelectorAll('#fenetreCorps button')].find(b => /Plus tard/.test(b.textContent)).click()"); await pg.wait_for_timeout(400)
        lid2 = json.loads(await ev(f"window.__fs['{E}patients/{P2}'].lignesJson"))[0]['id']
        # Date de travail : la C5 du patient fictif 2, déplacée un jour ouvré libre, avec la consultation de chimio à 10:00
        await ev(f"chModifierRdvChimio('{P2}', '{lid2}', 5, 1)"); await pg.wait_for_timeout(500)
        d5 = await ev("document.getElementById('mD').value"); d = addj(d5, 1)
        while not ouvre(d): d = addj(d, 1)
        await pg.fill('#mD', d); await ev("document.getElementById('mD').dispatchEvent(new Event('input'))"); await pg.fill('#mH', '10:00')
        await ev("(document.querySelector('input[name=dS][value=seule]')||{click(){}}).click()"); await pg.click('#fOk'); await fin()
        c5 = next((e for e in await ag(P2) if e['k'] == f'{P2}|c|0|5'), None)
        ok(c5 and c5['d'] == d and c5.get('h') == '10:00', 'jeu : consultation de la C5 le ' + d + ' à 10:00', c5)
        # 1. Nouveau rendez-vous ce jour-là : 10:00 affiché pris, avec ce qui le prend
        rid7 = json.loads(await ev(f"window.__fs['{E}patients/{P7}'].rdvsJson"))[0]['id']
        await ev(f"ouvrirRdv('{P7}', null, {{ d: '{d}' }})"); await pg.wait_for_timeout(600)
        if not await ev("!!document.getElementById('fCr')"): ok(False, 'fenêtre « Nouveau rendez-vous » ouverte')
        await pg.fill('#fD', d); await ev("document.getElementById('fD').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(300)
        pris = await ev("[...document.querySelectorAll('#fCr .cr.pris')].map(e => e.dataset.h + ' ' + e.title)")
        ok(any(x.startswith('10:00') and 'C5 J1 (consultation de chimio)' in x for x in pris), 'créneau de 10:00 marqué pris par « C5 J1 (consultation de chimio) »', pris)
        # 2. Le choisir : un seul avertissement, puis l'enregistrement passe sans deuxième question
        n0 = len(pg.dlg)
        await ev("document.querySelector('#fCr .cr.pris[data-h=\"10:00\"]').click()"); await pg.wait_for_timeout(300)
        ok(len(pg.dlg) == n0 + 1 and 'Créneau déjà pris' in pg.dlg[-1] and 'garder quand même' in pg.dlg[-1].lower(), 'clic sur un créneau pris : « Créneau déjà pris … Garder quand même ? »', pg.dlg[n0:])
        ok(await ev("document.getElementById('fH').value") == '10:00', 'créneau pris accepté : l\'heure est posée (rien n\'est bloqué)')
        await pg.click('#fOk'); await fin()
        ok(len([m for m in pg.dlg[n0:] if 'Créneau déjà pris' in m]) == 1, 'un seul avertissement en tout (pas de 2e question à l\'enregistrement)', pg.dlg[n0:])
        r7 = json.loads(await ev(f"window.__fs['{E}patients/{P7}'].rdvsJson"))
        nouv = [r for r in r7 if r['d'] == d and r.get('h') == '10:00']
        ok(nouv, 'rendez-vous enregistré à 10:00 malgré le créneau pris (double rendez-vous possible, après avertissement)', r7[-1])
        # 3. Refuser l'avertissement : rien n'est enregistré
        await ev("window.__confirm = window.confirm; window.confirm = () => false")
        await ev(f"ouvrirRdv('{P7}', null, {{ d: '{d}' }})"); await pg.wait_for_timeout(500); await pg.fill('#fD', d); await pg.fill('#fH', '10:05')
        await pg.click('#fOk'); await pg.wait_for_timeout(800)
        r7b = json.loads(await ev(f"window.__fs['{E}patients/{P7}'].rdvsJson"))
        ok(len(r7b) == len(r7) and await ev("!!document.getElementById('fOk')"), 'avertissement refusé : rien d\'enregistré, la fenêtre reste ouverte', len(r7b))
        await ev("window.confirm = window.__confirm; fermerFenetre()")
        # 4. Consultation de chimio placée sur un rendez-vous déjà pris (heure de la C6 à 10:00 le même jour) : avertissement
        await ev(f"chModifierRdvChimio('{P2}', '{lid2}', 6, 1)"); await pg.wait_for_timeout(500)
        await pg.fill('#mD', d); await ev("document.getElementById('mD').dispatchEvent(new Event('input'))"); await pg.fill('#mH', '10:15')
        await ev("(document.querySelector('input[name=dS][value=seule]')||{click(){}}).click()")
        n1 = len(pg.dlg); await pg.click('#fOk'); await fin()
        ok(any('Créneau déjà pris' in m and 'Consultation' in m for m in pg.dlg[n1:]), 'heure de la consultation d\'une séance sur un rendez-vous : avertissement (rendez-vous de 10:00)', pg.dlg[n1:])
        # 5. Consultation de chimio sans heure ce jour-là : listée, sans prendre de créneau
        await ev(f"chModifierRdvChimio('{P2}', '{lid2}', 6, 1)"); await pg.wait_for_timeout(500); await pg.fill('#mH', ''); await pg.click('#fOk'); await fin()
        await ev(f"ouvrirRdv('{P7}', null, {{ d: '{d}' }})"); await pg.wait_for_timeout(500); await pg.fill('#fD', d); await ev("document.getElementById('fD').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(300)
        t = await ev("document.getElementById('fCr').innerText")
        ok('Déjà ce jour-là, sans heure' in t and 'C6 J1 (consultation de chimio)' in t, 'consultation de chimio sans heure : « Déjà ce jour-là, sans heure : C6 J1 … »', t[-200:])
        await ev("fermerFenetre()")
        # 6. Étape de radiothérapie avec heure : le créneau est pris
        rt = json.loads(await ev(f"window.__fs['{E}patients/{P4}'].rtsJson"))[0]
        await ev(f"modifierEtapeRT('{P4}', '{rt['id']}', 'deb')"); await pg.wait_for_timeout(500)
        dr = await ev("document.getElementById('eD').value")
        await pg.fill('#eH', '14:00'); await pg.click('#fOk'); await fin()
        await ev(f"ouvrirRdv('{P7}', null, {{ d: '{dr}' }})"); await pg.wait_for_timeout(500); await pg.fill('#fD', dr); await ev("document.getElementById('fD').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(300)
        pris = await ev("[...document.querySelectorAll('#fCr .cr.pris')].map(e => e.dataset.h + ' ' + e.title)")
        ok(any(x.startswith('14:00') and '1re séance de radiothérapie' in x for x in pris), '1re séance de RT à 14:00 (' + dr + ') : créneau pris', pris)
        await ev("fermerFenetre()")
        # 7. Report après « Non venu » sur un créneau pris : avertissement
        await ev(f"statutRdv('{P7}', '{rid7}', 'absent')"); await pg.wait_for_timeout(600)
        if await ev("!!document.getElementById('abD')"):
            n2 = len(pg.dlg); await pg.fill('#abD', d); await pg.fill('#abH', '10:00'); await pg.click('#fOk'); await fin()
            ok(any('Créneau déjà pris' in m for m in pg.dlg[n2:]), 'report après « Non venu » sur 10:00 : avertissement « Créneau déjà pris »', pg.dlg[n2:])
        else: ok(False, 'fenêtre « Absent » ouverte')
        # 8. Téléphone : la fenêtre du rendez-vous ne déborde pas
        await pg.set_viewport_size({'width': 390, 'height': 800})
        await ev(f"ouvrirRdv('{P7}', null, {{ d: '{d}' }})"); await pg.wait_for_timeout(500); await pg.fill('#fD', d); await ev("document.getElementById('fD').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(300)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : fenêtre du rendez-vous sans débordement')
        await ev("fermerFenetre()")
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
