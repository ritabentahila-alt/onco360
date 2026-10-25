import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot D (25/10/2026, demande de Dr Bentahila) : lignes des bibliothèques du dossier (Modifier / Supprimer sous « ⋯ », « + » d'Analyses et
# d'Examens compl.) ; Paramètres › Bibliothèques inchangé ; police de l'ordonnance (sélection ou tout le corps, gardée à l'impression) ;
# formulaire de consultation : Consultation, Date, Titre, Note d'abord ; RCP et Note du secrétariat sans durée ; Bibliothèques › Listes.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
VIS = "(e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)

        # 1. Médic. : ⋯ = Modifier, Supprimer ; « + » visible ; pas de crayon ni de croix hors du menu
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(1200)
        r = await ev(f"(() => {{ const v = {VIS}; const tr = document.querySelector('#mdListe tr.m'); if (!tr) return null; const d = tr.querySelector('details.bib-pts'); return [!!d, d ? [...d.querySelectorAll('.m3-l button')].map(b => b.textContent.trim()) : [], [...tr.querySelectorAll('td.act > .ico')].filter(v).map(b => b.getAttribute('title'))]; }})()")
        ok(r and r[0] and r[1] == ['Modifier', 'Supprimer de la liste'], 'Médic. : Modifier et Supprimer sous « ⋯ » ' + str(r and r[1]))
        ok(r and r[2] == ["Retirer des favoris"] or r and r[2] == ["Mettre en favori (en tête de liste)", "Ajouter à l'ordonnance"] or r and "Ajouter à l'ordonnance" in r[2] and not any('Modifier' in (x or '') or 'Supprimer' in (x or '') for x in r[2]), 'Médic. : étoile et « + » visibles, pas de crayon ni de croix ' + str(r and r[2]))
        await ev("document.querySelector('#mdListe tr.m details.bib-pts > summary').click()"); await pg.wait_for_timeout(200)
        ok(await ev("document.querySelector('#mdListe tr.m details.bib-pts').open"), 'Médic. : « ⋯ » s\'ouvre')
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        # 2. Ordo. type
        await ev(f"ordTypes('{pid}')"); await pg.wait_for_timeout(1200)
        r = await ev("(() => { const tr = document.querySelector('#otListe tr.m'); return tr ? [!!tr.querySelector('details.bib-pts'), !!tr.querySelector('td.act > .ico.vert')] : null; })()")
        ok(r == [True, True], 'Ordo. type : « + » visible, Modifier et Supprimer sous « ⋯ » ' + str(r))
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        # 3. Analyses et Examens compl. : « + » juste après l'étoile, qui ajoute à la demande
        for f, nom in [("ordAnalyses", "Analyses"), ("ordExamens", "Examens compl.")]:
            await ev(f"{f}('{pid}')"); await pg.wait_for_timeout(1200)
            r = await ev("(() => { const tr = [...document.querySelectorAll('#anListe tr.m')].find(t => t.querySelector('.ico.vert')); if (!tr) return null; const td = tr.querySelector('td.act'), k = [...td.children].map(e => e.classList.contains('etoile') ? 'etoile' : e.classList.contains('vert') ? 'plus' : e.tagName === 'DETAILS' ? 'menu' : e.tagName); return k; })()")
            ok(r and r.index('plus') == (1 if r[0] == 'etoile' else 0) and r[-1] == 'menu', f'{nom} : « + » après l\'étoile, puis « ⋯ » ' + str(r))
            n0 = await ev("document.querySelectorAll('#mdOrdo .it, #mdOrdo li, #mdOrdo [data-i]').length")
            await ev("[...document.querySelectorAll('#anListe tr.m')].find(t => t.querySelector('.ico.vert')).querySelector('.ico.vert').click()"); await pg.wait_for_timeout(400)
            n1 = await ev("document.querySelectorAll('#mdOrdo .it, #mdOrdo li, #mdOrdo [data-i]').length")
            ok(n1 == n0 + 1, f'{nom} : « + » ajoute une ligne à la demande ({n0} → {n1})')
            await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        # 4. Courriers : pas de « + », ⋯ ; Doc. : Ouvrir, Remettre, ⋯
        await ev(f"ordCourriers('{pid}')"); await pg.wait_for_timeout(1200)
        r = await ev("(() => { const tr = document.querySelector('#crListe tr.m'); return tr ? [!!tr.querySelector('details.bib-pts'), !!tr.querySelector('.ico.vert')] : null; })()")
        ok(r == [True, False], 'Courriers : « ⋯ », pas de « + » ' + str(r))
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)
        await ev(f"ordDocumentation('{pid}')"); await pg.wait_for_timeout(1500)
        r = await ev("(() => { const td = document.querySelector('#dcListe td.act'); return td ? [[...td.querySelectorAll(':scope > .mini')].map(b => b.textContent.trim()), td.querySelector('details.bib-pts') ? [...td.querySelectorAll('details .m3-l button')].map(b => b.textContent.trim()) : null] : null; })()")
        ok(r and r[0] == ['Ouvrir', 'Remettre'] and r[1] == ['Modifier', 'Supprimer'], 'Doc. : Ouvrir, Remettre visibles ; Modifier, Supprimer sous « ⋯ » ' + str(r))
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        # 5. Paramètres › Bibliothèques (gestion) : boutons visibles, pas de « ⋯ »
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/bibliotheques'); await pg.wait_for_timeout(1800)
        await ev("cfBib('medicaments')"); await pg.wait_for_timeout(1200)
        r = await ev("(() => { const tr = document.querySelector('#mdListe tr.m'); return tr ? [!!tr.querySelector('details.bib-pts'), [...tr.querySelectorAll('td.act > .ico')].map(b => b.getAttribute('title'))] : null; })()")
        ok(r and not r[0] and 'Modifier' in r[1] and 'Supprimer de la liste' in r[1], 'Paramètres › Bibliothèques : crayon et croix visibles, sans « ⋯ » ' + str(r))
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        # 6. Police de l'ordonnance
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2200)
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(1000)
        await ev("document.querySelector('#mdListe tr.m .ico.vert').click()"); await pg.wait_for_timeout(500)
        await ev("mdAfficher()"); await pg.wait_for_timeout(1200)
        for _ in range(3):
            if await ev("!!document.querySelector('.or-dlg')"): await ev("document.querySelector('.or-dlg [data-k]').click()"); await pg.wait_for_timeout(400)
        ok(await ev("!!document.getElementById('orPol') && [...document.getElementById('orPol').options].map(o => o.text).join() === 'Police habituelle,Arial,Helvetica,Times New Roman,Georgia,Verdana'"), 'ordonnance : menu Police (six choix) à côté de A− A+')
        await ev("window.getSelection().removeAllRanges(); orGarderSel(); const s = document.getElementById('orPol'); s.value = 'fg'; s.dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(400)
        ok(await ev("[...document.getElementById('orPage').children].every(e => e.classList.contains('or-fg')) && getComputedStyle(document.getElementById('orPage').firstElementChild).fontFamily.indexOf('Georgia') >= 0"), 'sans sélection : toute l\'ordonnance en Georgia')
        # avec une sélection : un mot en Verdana
        await ev("""(() => { const p = document.getElementById('orPage'), el = [...p.querySelectorAll('*')].find(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 3)); const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim().length > 3); const r = document.createRange(); r.setStart(tn, 0); r.setEnd(tn, 3); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); })()""")
        await ev("orGarderSel(); const s = document.getElementById('orPol'); s.value = 'fv'; s.dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(400)
        ok(await ev("!!document.querySelector('#orPage span.or-fv') && !document.querySelector('#orPage font')"), 'avec une sélection : la sélection seule en Verdana (span or-fv, pas de <font>)')
        await ev("document.getElementById('orImp').click()"); await pg.wait_for_timeout(1500)
        for _ in range(4):
            if await ev("!!document.querySelector('.or-dlg')"): await ev("(document.querySelector('.or-dlg [data-k=ok]') || document.querySelector('.or-dlg [data-k]:last-child')).click()"); await pg.wait_for_timeout(700)
        h = await ev("(window.__win[window.__win.length - 1] || {w:{document:{_h:''}}}).w.document._h")
        ok('or-fg' in h and 'or-fv' in h and '.or-fg{font-family:Georgia' in h, 'impression : la police choisie est imprimée')
        fs = await ev("window.__fs")
        ok(fs.get('utilisateurs/' + (await ev("window.__uid || ''")) , {}).get('policeOrdo') == 'fg' or any(isinstance(v, dict) and v.get('policeOrdo') == 'fg' for k, v in fs.items() if k.startswith('utilisateurs/')), 'police retenue pour le médecin (utilisateurs/{uid}.policeOrdo)')
        ok(any('or-fg' in json.dumps(v) for k, v in fs.items() if '/consultations/' in k), 'ordonnance enregistrée avec sa police')
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        # 7. Formulaire de consultation : Consultation, Date, Titre, Note, puis les champs du formulaire, pour chaque type
        await ev(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(800)
        types = await ev("[...document.querySelectorAll('#csType option')].map(o => o.value)")
        mauvais = []
        for ty in types:
            await ev(f"const s = document.getElementById('csType'); s.value = {json.dumps(ty)}; s.dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(120)
            o = await ev("(() => { const f = document.querySelector('#fenetre .form'), k = [...f.children].filter(e => getComputedStyle(e).display !== 'none').map(e => e.querySelector('#csType') ? 'type' : e.querySelector('#csDate') ? 'd' : e.querySelector('#csTitre') ? 'titre' : e.querySelector('#csNote') ? 'note' : 'x'); return k; })()")
            com = [z for z in o if z != 'x']; idx = o.index('note') if 'note' in o else -1
            if com != ['type', 'd', 'titre', 'note'][:len(com)] or (idx >= 0 and 'x' in o[:idx]): mauvais.append((ty, o))
        ok(types and not mauvais, f'formulaire : Consultation, Date, Titre, Note d\'abord pour les {len(types)} types ' + str(mauvais[:2]))
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        # 8. Types de consultation : RCP sans durée
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/types'); await pg.wait_for_timeout(1800)
        r = await ev("(() => { const l = [...document.querySelectorAll('.ty-l')].find(x => { const n = x.querySelector('.ty-n'); return n && n.value === 'RCP'; }); return l ? [!!l.querySelector('.ty-sd'), !!l.querySelector('select[aria-label^=\"Durée\"]')] : null; })()")
        ok(r is None or r == [True, False], 'Types de consultation : RCP sans durée ' + str(r))

        # 9. Listes : dans Bibliothèques, avec Localisations, Mutuelles, Correspondants, Tâches, Documents
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/listes'); await pg.wait_for_timeout(1800)
        r = await ev("[document.querySelector('.cf-fam button.on') && document.querySelector('.cf-fam button.on').textContent.trim(), [...document.querySelectorAll('.puces .puce')].map(b => b.textContent.replace(/ \\(\\d+\\)$/, '').trim())]")
        ok(r[0] == 'Bibliothèques' and r[1][:2] == ['Mutuelles', 'Correspondants'] and all(k in r[1] for k in ['Localisations', 'Tâches', 'Documents', 'Allergies']), 'Bibliothèques › Listes : Mutuelles, Correspondants, informations médicales (lot A), Localisations, Tâches, Documents ' + str(r))
        await ev("cfFamille('dossier')"); await pg.wait_for_timeout(800)
        ok(not await ev("[...document.querySelectorAll('.cf-sous button')].some(b => /Liste/.test(b.textContent))"), 'Dossier patient : plus de « Listes de la fiche »')
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/documents'); await pg.wait_for_timeout(1800)
        ok(pg.url.endswith('#parametres/listes') and await ev("document.querySelector('.puces .puce.on').textContent.indexOf('Documents') === 0 && !!document.querySelector('#page .cf-td')"), 'ancienne adresse Types de documents → Listes › Documents')
        await ev("cfLs('taches')"); await pg.wait_for_timeout(600)
        ok(await ev("document.body.innerText.indexOf('Types de tâches') >= 0 && document.body.innerText.indexOf('Tâches automatiques') >= 0"), 'Listes › Tâches : types de tâches et tâches automatiques')
        await ev("cfLs('mut')"); await pg.wait_for_timeout(600)
        ok(await ev("!!document.getElementById('cfLq') && document.querySelectorAll('#cfLl input, #cfLl .it').length > 0"), 'Listes › Mutuelles : la liste et sa recherche')
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        await b.close()
asyncio.run(main())
