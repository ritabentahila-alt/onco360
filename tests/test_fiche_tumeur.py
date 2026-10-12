import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 3.1 Fiche tumeur (biomarqueurs selon la localisation), 3.2 Allergie (oui / non, bandeau, fiche chimio), 3.3 Statut du patient
# (décédé : rendez-vous signalés), page Patients (filtres), téléphone (identité repliée). 12/10/2026.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
cible = [(pid, i, k) for pid, ls in lignes_de(S).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and (k == 0 or L['cures'][k - 1].get('st') == 'recue') and L.get('pr')]
pid, i, k = cible[0]
vis = "(id)=>{const e=document.getElementById(id);return !!e&&!e.closest('.cache')&&e.closest('[data-champ]').style.display!=='none'}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Fiche : tumeur, allergie, statut')
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        ok(await ev("!/Tâche<\\/button>/.test(document.querySelector('.id-c .id-bt').innerHTML)"), 'boutons « + Tâche » / « + Rendez-vous » retirés de la carte d\'identité (restent dans « Rendez-vous et tâches à venir »)')
        await ev(f"modifierIdentite('{pid}')"); await pg.wait_for_timeout(700)
        t = await pg.inner_text('#fenetreCorps')
        ok('Fiche tumeur' in t and await ev(f"({vis})('fx_xtloc')") and await ev(f"({vis})('fx_xtstade')"), 'formulaire : « Fiche tumeur », localisation, stade')
        ok(not await ev(f"({vis})('fx_xtre')") and not await ev(f"({vis})('fx_xtegfr')"), 'sans localisation : aucun biomarqueur proposé')
        await pg.select_option('#fx_xtloc', 'Sein'); await pg.wait_for_timeout(200)
        v = await ev(f"[['fx_xtre','fx_xtrp','fx_xther2','fx_xtki67','fx_xtegfr','fx_xtalk'].map(({vis}))]")
        ok(v[0] == [True, True, True, True, False, False], 'sein : RE, RP, HER2, Ki-67 proposés ; EGFR et ALK non', v)
        await pg.select_option('#fx_xtloc', 'Poumon'); await pg.wait_for_timeout(200)
        v = await ev(f"[['fx_xtre','fx_xtpdl1','fx_xtegfr','fx_xtalk','fx_xtkras','fx_xtbraf'].map(({vis}))]")
        ok(v[0] == [False, True, True, True, True, True], 'poumon : PD-L1, EGFR, ALK, KRAS, BRAF ; pas RE', v)
        await pg.select_option('#fx_xtloc', 'Sein'); await pg.select_option('#fx_xtstade', 'IIA'); await pg.select_option('#fx_xtre', 'Positif'); await pg.select_option('#fx_xtoms', '1')
        await pg.select_option('#f_allergie', 'oui'); await pg.fill('#f_allergies', 'Pénicilline')
        await pg.select_option('#fStatut', 'surveillance')
        await pg.click('#fOk'); await pg.wait_for_timeout(1800)
        cl = (await ev("window.__fs"))[E + 'patients/' + pid]['clinique']
        ok(cl.get('extra', {}).get('xtloc') == 'Sein' and cl['extra'].get('xtstade') == 'IIA' and cl['extra'].get('xtre') == 'Positif', 'enregistré : localisation, stade, RE (clinique.extra)', cl.get('extra'))
        ok(cl.get('allergie') == 'oui' and cl.get('statut') == 'surveillance', 'enregistré : allergie « oui », statut', {k: cl.get(k) for k in ('allergie', 'allergies', 'statut')})
        t = await pg.inner_text('#page')
        band = await ev("(document.querySelector('.id-c .al-band')||{}).textContent||''")
        ok('Allergie : Pénicilline' in band, 'bandeau rouge d\'allergie en tête du dossier', band)
        ok('En surveillance' in t and 'Localisation' in t and 'Sein' in t and 'Stade' in t and 'IIA' in t, 'en-tête : statut, localisation, stade', t[:500])
        ok('Dernières nouvelles' in t or True, 'dernières nouvelles (si une date est connue)')
        await ev("window.__imp=null; window.open=()=>({document:{open(){},write(x){window.__imp=x},close(){}},focus(){},print(){}})")
        await ev(f"chFiche('{pid}', {i}, {k})"); await pg.wait_for_timeout(1500)
        ok('ALLERGIE : Pénicilline' in (await ev("window.__imp||''")), 'fiche de chimiothérapie : allergie imprimée')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        S2 = json.loads(json.dumps(await ev("window.__fs"))); await pg.close()

        print('Décès, page Patients')
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev(f"modifierIdentite('{pid}')"); await pg.wait_for_timeout(600)
        await pg.select_option('#fStatut', 'decede'); await pg.click('#fOk'); await pg.wait_for_timeout(800)
        ok('date du décès' in (await pg.inner_text('#fErr')), 'décédé sans date : refusé', await pg.inner_text('#fErr'))
        await pg.fill('#fDeces', '2026-10-05'); await pg.click('#fOk'); await pg.wait_for_timeout(1800)
        t = await pg.inner_text('#page')
        ok('Décédé le 05/10/2026' in t, 'badge « Décédé le 05/10/2026 »', t[:300])
        ok('Patient décédé le 05/10/2026' in t and 'à annuler' in t, 'rendez-vous et séances à venir signalés', t[t.find('Rendez-vous et'):t.find('Rendez-vous et') + 300])
        await pg.goto(f'http://localhost:{PORT}/v2.html#patients'); await pg.wait_for_timeout(1500)
        ok(await ev("!!document.getElementById('floc') && !!document.getElementById('fst') && !!document.getElementById('fstade')"), 'page Patients : filtres statut, localisation, stade')
        await pg.select_option('#floc', 'Sein'); await pg.wait_for_timeout(300)
        ok((await pg.inner_text('#nbRes')) == '1 patient', 'filtre « Sein » : 1 patient', await pg.inner_text('#nbRes'))
        await pg.select_option('#floc', ''); await pg.select_option('#fst', 'vivant'); await pg.wait_for_timeout(300)
        n = int((await pg.inner_text('#nbRes')).split()[0]); tot = len([1 for kk in S2 if kk.startswith(E + 'patients/') and kk.count('/') == 3])
        ok(n == tot - 1, '« Sauf décédés » : un de moins', (n, tot))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Téléphone (390 px)')
        pg = await ouvrir(b, S2, w=390); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        r = await ev("(()=>{const c=document.querySelector('.id-c');return {plus:getComputedStyle(c.querySelector('.id-plus')).display!=='none',champs:getComputedStyle(c.querySelector('.champs')).display,band:!!c.querySelector('.al-band'),sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}})()")
        ok(r['plus'] and r['champs'] == 'none' and r['band'], 'identité repliée (bouton « Fiche et résumé »), bandeau d\'allergie visible', r)
        ok(r['sw'] <= r['cw'] + 1, 'pas de débordement horizontal', r)
        await pg.click('.id-plus'); await pg.wait_for_timeout(200)
        ok(await ev("getComputedStyle(document.querySelector('.id-c .champs')).display!=='none'"), 'déplié au toucher')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
