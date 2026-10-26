import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Retouches du 26/10/2026, 2e série (demandes de Dr Bentahila) : Agenda et Salle d'attente au modèle du lot E (boutons b1 / b2 / b3, ✕ et Échap des
# fenêtres, Actualiser et « + Nouveau rendez-vous » alignés sur la ligne des vues / du jour) ; informations médicales dans l'ordre réglé de la fiche ;
# formulaires ouverts : OMS seul, Taille et Poids, Antécédents familiaux et Traitements en cours, cTNM et pTNM, ALD et Correspondant, Mutuelle et
# E-mail côte à côte, Adresse sur toute la ligne. (Document « Rendez-vous » : séances passées « Terminé », test_calendrier_rt.) Jeu fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
pid = [k.split('/')[-1] for k in S if k.startswith(E + 'patients/') and k.count('/') == 3][0]
MILIEU = "(s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.top + r.height / 2); }"
HAUT = "(k) => { const e = document.querySelector('.form[data-sec] [data-champ=' + k + ']'); return e ? Math.round(e.getBoundingClientRect().top) : null; }"
LARG = "(k) => { const e = document.querySelector('.form[data-sec] [data-champ=' + k + ']'); return e ? Math.round(e.getBoundingClientRect().width) : null; }"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (1440, 1280):
            print('Agenda (' + str(w) + ' px)')
            pg = await ouvrir(b, w=w); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(2500)
            m = await ev("[" + ",".join("(" + MILIEU + ")('" + s + "')" for s in ['.ag-vues', '#agAct', '.ag-nouv', '.ag-nav .b2']) + "]")
            ok(None not in m and max(m) - min(m) <= 2, 'Actualiser et « + Nouveau rendez-vous » alignés sur la ligne Liste · Jour · Semaine · Mois · date', m)
            ok(await ev("!!document.getElementById('agAjour') && getComputedStyle(document.getElementById('agAjour')).position === 'absolute'"), '« à jour à … » sous Actualiser sans le décaler')
            ok(await ev("document.querySelectorAll('.ag-barre .b1').length") == 1 and await ev("document.querySelectorAll('.ag-barre .bt').length") == 0, 'un seul bouton principal (b1), plus d\'anciennes classes « bt » dans la barre')
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Agenda : fenêtre d\'un rendez-vous')
        pg = await ouvrir(b, w=1440); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(2500)
        await ev("agVue('liste')"); await pg.wait_for_timeout(600)
        if await ev("!!document.querySelector('.ev')"):
            await ev("document.querySelector('.ev').click()"); await pg.wait_for_timeout(400)
            ok(await ev("!!document.querySelector('#fenetre:not(.cache) .fen-x')") and await ev("document.querySelectorAll('#fenetreCorps .boutons .b1').length") == 1, 'fenêtre : ✕ en haut à droite, un seul bouton principal')
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
            ok(await ev("document.getElementById('fenetre').classList.contains('cache')"), 'Échap ferme la fenêtre')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        for w in (1440, 390):
            print('Salle d\'attente (' + str(w) + ' px)')
            pg = await ouvrir(b, w=w, h=900 if w > 500 else 844); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(2500)
            if w > 500:
                m = await ev("[" + ",".join("(" + MILIEU + ")('" + s + "')" for s in ['#saJtxt', '.sa-cal', '#saAct', '#saPlus > summary']) + "]")
                ok(None not in m and max(m) - min(m) <= 2, 'Actualiser et « ⋯ » alignés sur la ligne du jour', m)
            ok(await ev("document.querySelectorAll('.sa-l1 .bt').length") == 0, 'barre du jour : plus d\'anciennes classes « bt »')
            ok(await ev("document.documentElement.scrollWidth <= innerWidth + 1"), 'rien ne déborde')
            await ev("saColonnes()"); await pg.wait_for_timeout(400)
            ok(await ev("!!document.querySelector('#fenetre:not(.cache) .fen-x')") and await ev("document.querySelectorAll('#fenetreCorps .boutons .b1').length") == 1, 'fenêtre Colonnes : ✕, un seul bouton principal')
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
            ok(await ev("document.getElementById('fenetre').classList.contains('cache')"), 'Échap ferme la fenêtre')
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Dossier : ordre réglé et formulaires')
        pg = await ouvrir(b, w=1440); ev = pg.evaluate
        await pg.add_init_script("try{localStorage.setItem('onco360.dossierParties',JSON.stringify({med:true}))}catch(e){}")
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3000)
        o = await ev("[...document.querySelectorAll('.dp[data-p=med] .dp-f > *')].map(e => e.dataset.champ || e.dataset.im)")
        cf = await ev("(async () => { const m = await import('./js/app/fichepatient.js'); return m.champsFiche().filter(c => c.present && c.section === 'med').map(c => c.k); })()")
        ok([k for k in o if k in cf] == [k for k in cf if k in o] and len(o) >= 5, 'informations médicales de la colonne dans l\'ordre réglé de la fiche', [o, cf])
        ok(o.index('xtoms') < o.index('atcdMed') if 'xtoms' in o and 'atcdMed' in o else True, 'OMS avant les antécédents (ordre de départ)', o)
        await ev(f"dosRubrique('{pid}','med')"); await pg.wait_for_timeout(700)
        h = lambda k: ev("(" + HAUT + ")('" + k + "')"); l = lambda k: ev("(" + LARG + ")('" + k + "')")
        ok(await h('taille') == await h('poids') and await h('taille') is not None, 'Taille et Poids sur la même ligne')
        ok(await h('atcdFam') == await h('traitCours') and await h('atcdFam') is not None, 'Antécédents familiaux et Traitements en cours sur la même ligne')
        ok((await l('xtoms') or 0) > 1.6 * (await l('taille') or 1), 'OMS seul sur sa ligne', [await l('xtoms'), await l('taille')])
        await ev(f"dosRubrique('{pid}','tum')"); await pg.wait_for_timeout(700)
        ok(await h('xtctnm') == await h('xtptnm') and await h('xtctnm') is not None, 'cTNM et pTNM sur la même ligne', [await h('xtctnm'), await h('xtptnm'), await ev("[...document.querySelectorAll('.form[data-sec] [data-champ]')].map(e=>e.dataset.champ+':'+e.className).join(' ')")])
        await ev(f"dosRubrique('{pid}','id')"); await pg.wait_for_timeout(700)
        ok(await h('ald') == await h('cor') and await h('ald') is not None, 'ALD et Correspondant sur la même ligne', [await h('ald'), await h('cor')])
        ok(await h('mut') == await h('email') and await h('mut') is not None, 'Mutuelle et E-mail sur la même ligne', [await h('mut'), await h('email')])
        ok((await l('adresse') or 0) > 1.6 * (await l('mut') or 1), 'Adresse sur toute la ligne')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
