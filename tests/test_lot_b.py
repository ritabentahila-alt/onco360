import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot B (25/10/2026, demande de Dr Bentahila) : plus de titre de page (Agenda, Salle d'attente, Patients, Tâches, RCP, Protocoles, Paramètres,
# Bilan, Mon compte, Radiothérapie) ; la barre d'outils de chaque page est la première ligne ; « à jour à … » sous Actualiser ; salle d'attente :
# Colonnes, Imprimer, Pharmacie, Clôturer sous « ⋯ » ; Patients : « + Nouveau patient » en tête de la liste ; Tâches : Imprimer (liste filtrée) ;
# Mon compte et Déconnexion dans le menu du compte (nom ou photo) ; Paramètres en icône dans la barre du haut ; téléphone 390 px sans débordement.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
PAGES = ['agenda', 'salle', 'patients', 'taches', 'rcp', 'protocoles', 'parametres', 'bilan', 'profil', 'radiotherapie']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, w=1440); ev = pg.evaluate
        for nom in PAGES:
            await pg.goto(f'http://localhost:{PORT}/v2.html#{nom}'); await pg.wait_for_timeout(1800)
            titre = await ev("!!document.querySelector('#page .accueil') || !!document.querySelector('#page > h2, #page section.accueil h2')")
            haut = await ev("(() => { const p = document.getElementById('page'), e = [...p.querySelectorAll('*')].find(x => x.offsetParent !== null && x.getBoundingClientRect().height > 0); return e ? Math.round(e.getBoundingClientRect().top - p.getBoundingClientRect().top) : -1; })()")
            ok(not titre and 0 <= haut <= 40, f'{nom} : pas de titre de page, le premier élément est en haut ({haut} px)')
        ok(not pg.errs, 'aucune erreur JavaScript (dix pages) ' + str(pg.errs[:2]))

        # Agenda : « + Nouveau rendez-vous » dans la barre, après Actualiser ; « à jour à » sous Actualiser
        await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(1800)
        r = await ev("(() => { const b = document.querySelector('.ag-barre .ag-nouv'), a = document.getElementById('agAct'), j = document.getElementById('agAjour'); if (!b || !a || !j) return null; const rb = b.getBoundingClientRect(), ra = a.getBoundingClientRect(), rj = j.getBoundingClientRect(); return [rb.left > ra.right, Math.abs((rb.top + rb.height / 2) - (ra.top + ra.height / 2)) < 14, rj.top >= ra.bottom - 1, j.textContent]; })()")
        ok(r and r[0] and r[2] and r[3].startswith('à jour à'), 'agenda : « + Nouveau rendez-vous » au bout de la barre, « à jour à » sous Actualiser ' + str(r))

        # Salle d'attente
        await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(2000)
        r = await ev("(() => { const l1 = document.querySelector('.sa-l1'), j = document.getElementById('saJours'), m = document.getElementById('saPlus'); return [!!l1 && l1.contains(j) && l1.contains(m), [...m.querySelectorAll('.m3-l button')].map(b => b.textContent.trim()), !!document.querySelector('#saOutils #saQ') && !!document.querySelector('#saOutils #saTri')]; })()")
        ok(r[0], 'salle : jour, Calendrier, Aujourd\'hui et « ⋯ » sur la première ligne')
        ok(r[1][:3] == ['Colonnes', 'Imprimer la liste du jour', 'Pharmacie'] and 'Clôturer la journée' in r[1], 'salle : « ⋯ » = Colonnes, Imprimer, Pharmacie, Clôturer ' + str(r[1]))
        ok(r[2], 'salle : recherche et tri sur la deuxième ligne')
        await pg.click('#saPlus > summary'); await pg.wait_for_timeout(300)
        ok(await ev("document.getElementById('saPlus').open && getComputedStyle(document.querySelector('#saPlus .m3-l')).display !== 'none'"), 'salle : « ⋯ » s\'ouvre')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        ok(await ev("!document.getElementById('saPlus').open"), 'salle : Échap ferme « ⋯ »')
        n0 = len(pg.dlg); await pg.click('#saPlus > summary'); await pg.click('#saPlus .m3-l button:has-text("Imprimer")'); await pg.wait_for_timeout(800)
        ok(await ev("window.__win.length > 0 && window.__win[window.__win.length - 1].w.document._h.indexOf('Salle d') >= 0"), 'salle : « Imprimer la liste du jour » depuis « ⋯ »')
        # jour passé non clôturé : pastille sur « ⋯ »
        await ev("saAller('2026-10-05')"); await pg.wait_for_timeout(1000)
        n = await ev("document.getElementById('saPtsN').textContent")
        ok(await ev("!document.getElementById('saClo').classList.contains('cache')") and (n == '' or n.isdigit()), f'salle, jour passé : « Clôturer la journée » proposé, pastille « {n} »')

        # Patients
        await pg.goto(f'http://localhost:{PORT}/v2.html#patients'); await pg.wait_for_timeout(1500)
        r = await ev("(() => { const f = document.querySelector('#page .filtres'), t = document.querySelector('#page .liste-tete'), b = t && t.querySelector('.b1'); return [!!f && !!t && f.getBoundingClientRect().bottom <= t.getBoundingClientRect().top + 1, b ? b.textContent.trim() : '', !!t && !!t.querySelector('#nbRes')]; })()")
        ok(r[0] and r[1] == 'Nouveau patient' and r[2], 'patients : filtres d\'abord, puis « + Nouveau patient » en tête de la liste, à côté du nombre ' + str(r))
        await pg.click('.liste-tete .b1'); await pg.wait_for_timeout(600)
        ok(await ev("!document.getElementById('fenetre').classList.contains('cache')"), 'patients : le bouton ouvre « Nouveau patient »')
        await ev("fermerFenetre()")

        # Tâches : Mes tâches / Toutes, Imprimer et « + Nouvelle tâche » sur la même ligne ; Imprimer = la liste filtrée
        await pg.goto(f'http://localhost:{PORT}/v2.html#taches'); await pg.wait_for_timeout(1800)
        r = await ev("(() => { const v = document.querySelector('.barre-page .ta-vues'), i = document.getElementById('taImp'), n = document.querySelector('.barre-page .bp-act .bt.plein, .barre-page .bp-act .b1'); if (!v || !i || !n) return null; const c = (e) => { const x = e.getBoundingClientRect(); return x.top + x.height / 2; }; return Math.abs(c(v) - c(i)) < 14 && Math.abs(c(v) - c(n)) < 14 && i.getBoundingClientRect().right <= n.getBoundingClientRect().left; })()")
        ok(r, 'tâches : Mes tâches / Toutes les tâches, Imprimer, « + Nouvelle tâche » alignés')
        await pg.fill('#taQ', 'zzzz-aucune'); await pg.wait_for_timeout(300)
        await pg.click('#taImp'); await pg.wait_for_timeout(600)
        h = await ev("window.__win[window.__win.length - 1].w.document._h")
        ok('Tâches' in h and 'Recherche : zzzz-aucune' in h and 'Aucune tâche' in h, 'tâches : Imprimer reprend la recherche en cours (aucune tâche)')
        await pg.fill('#taQ', ''); await ev("taVue('toutes')"); await pg.wait_for_timeout(500)
        nb = await ev("document.querySelectorAll('#taL .tache').length")
        await pg.click('#taImp'); await pg.wait_for_timeout(600)
        h = await ev("window.__win[window.__win.length - 1].w.document._h")
        ok(h.count('<tr><td') == nb and (nb > 0 or 'Aucune tâche' in h), f'tâches : Imprimer = les {nb} tâches affichées')

        # Menu : plus de Paramètres ni de Mon compte ; menu du compte ; icône Paramètres
        vis = await ev("[...document.querySelectorAll('nav a[data-p]')].map(a => a.dataset.p)")
        ok('parametres' not in vis and 'profil' not in vis and not await ev("!!document.querySelector('#menu .sortie')"), 'menu : ni Paramètres, ni Mon compte, ni Déconnexion ' + str(vis))
        await pg.click('#btCompte'); await pg.wait_for_timeout(300)
        r = await ev("(() => { const m = document.getElementById('menuCompte'); return [m.offsetParent !== null || getComputedStyle(m).display !== 'none', [...m.querySelectorAll('a,button')].map(x => x.textContent.trim()), document.getElementById('mcNom').textContent]; })()")
        ok(r[0] and r[1] == ['Mon compte', 'Déconnexion'] and r[2], 'menu du compte (nom en bas du menu) : Mon compte, Déconnexion ' + str(r))
        await pg.click('#mcCompte'); await pg.wait_for_timeout(1200)
        ok(pg.url.endswith('#profil') and await ev("document.getElementById('menuCompte').classList.contains('cache')"), 'Mon compte s\'ouvre depuis le menu du compte, qui se ferme')
        await pg.click('#avTete'); await pg.wait_for_timeout(300)
        ok(await ev("!document.getElementById('menuCompte').classList.contains('cache')"), 'photo en haut à droite : même menu du compte')
        await pg.mouse.click(700, 500); await pg.wait_for_timeout(200)
        ok(await ev("document.getElementById('menuCompte').classList.contains('cache')"), 'clic ailleurs : le menu du compte se ferme')
        r = await ev("(() => { const q = document.getElementById('trPil'), g = document.getElementById('btParam'), c = document.getElementById('cloche'); return q.getBoundingClientRect().right <= g.getBoundingClientRect().left && g.getBoundingClientRect().right <= c.getBoundingClientRect().left; })()")
        ok(r, 'icône Paramètres entre la recherche et la cloche')
        await pg.click('#btParam'); await pg.wait_for_timeout(1200)
        ok(pg.url.endswith('#parametres') and await ev("document.getElementById('btParam').classList.contains('on')"), 'icône Paramètres : ouvre Paramètres (en surbrillance)')
        # menu replié : la photo seule ouvre le menu du compte
        await pg.click('#btReplier'); await pg.wait_for_timeout(400)
        await pg.click('#btCompte'); await pg.wait_for_timeout(300)
        ok(await ev("!document.getElementById('menuCompte').classList.contains('cache')"), 'menu replié : la photo ouvre le menu du compte')
        await pg.keyboard.press('Escape'); await pg.click('#btReplier'); await pg.wait_for_timeout(300)
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        await pg.close()

        # Comptable : pas d'icône Paramètres, Mon compte par le menu du compte
        S2 = dict(S); S2[E + 'membres/UIDCOMP'] = {'role': 'comptable', 'actif': True, 'nom': 'Karima COMPTABLE', 'tousEtablissements': True, 'etablissements': [], 'droits': {'finances': True}}
        pc = await ouvrir(b, S2); await pc.add_init_script("window.__uid='UIDCOMP'")
        await pc.goto(f'http://localhost:{PORT}/v2.html#bilan'); await pc.wait_for_timeout(2500)
        ok(await pc.evaluate("document.getElementById('btParam').offsetParent === null"), 'comptable : pas d\'icône Paramètres')
        ok('relevé' in await pc.inner_text('.barre-page'), 'comptable : l\'état du relevé sous Actualiser')
        await pc.click('#btCompte'); await pc.wait_for_timeout(300); await pc.click('#mcCompte'); await pc.wait_for_timeout(1200)
        ok(pc.url.endswith('#profil'), 'comptable : Mon compte par le menu du compte')
        await pc.close()

        # Téléphone 390 px : aucune page ne déborde
        pt = await ouvrir(b, w=390, h=844)
        deb = []
        for nom in PAGES:
            await pt.goto(f'http://localhost:{PORT}/v2.html#{nom}'); await pt.wait_for_timeout(1500)
            if await pt.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"): deb.append(nom)
        ok(not deb, 'téléphone 390 px : aucune des dix pages ne déborde ' + str(deb))
        await pt.click('#avTete'); await pt.wait_for_timeout(300)
        ok(await pt.evaluate("(() => { const m = document.getElementById('menuCompte'), r = m.getBoundingClientRect(); return !m.classList.contains('cache') && r.left >= 0 && r.right <= window.innerWidth; })()"), 'téléphone : la photo ouvre le menu du compte, dans l\'écran')
        ok(not pt.errs, 'téléphone : aucune erreur JavaScript ' + str(pt.errs[:2]))
        await b.close()
asyncio.run(main())
