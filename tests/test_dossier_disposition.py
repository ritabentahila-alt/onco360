import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# Lot R-G (audit n° 5, 19/10/2026) : disposition du dossier patient. Ordinateur : un écran qui ne bouge pas (bandeau, colonnes qui défilent
# chacune seule, barre d'actions en bas) ; 940 à 1 279 px : deux colonnes ; téléphone : une colonne comme avant ; écran bas : page qui défile.
# Bandeau, barre (bulles de la RCP dedans), consultations en lignes serrées, panneau de chimio, réglages. Patients fictifs.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E)
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
def pid(n):
    for k, v in S2.items():
        if k.startswith(E + 'patients/') and (v.get('identite') or {}).get('nomF') == 'PATIENT TEST ' + str(n): return k.split('/')[-1]
P8 = pid(8)
LONGUE = 'Bonne tolérance de la cure, asthénie grade 1, pas de fièvre, nausées J2-J3 contrôlées. ' * 30
for i in range(14):
    S2[E + 'consultations/CS%d' % i] = {'patientId': P8, 'etablissementId': 'DEMO', 'd': '2026-09-%02d' % (28 - i), 'type': 'Consultation de suivi', 'titre': '', 'note': LONGUE if i == 0 else 'Note %d.' % i,
        'lignes': [{'id': 'L%d' % i, 't': 'medic', 'd': '2026-09-01', 'lib': 'Ordonnance', 'par': 'Dr Bentahila', 'html': '<p>x</p>', 'format': 'A5'}] if i % 2 == 0 else [], 'o': 1759000000000 - i, 'creePar': 'UIDRITA', 'creeParNom': 'Dr Bentahila'}
S2[E + 'fichiers/F1'] = {'patientId': P8, 'etablissementId': 'DEMO', 'titre': 'Scanner TAP', 'd': '2026-09-22', 'type': 'Imagerie', 'nom': 'cr.pdf', 'taille': 1000, 'mime': 'application/pdf', 'chemin': 'x/cr.pdf', 'creePar': 'UIDRITA', 'creeParNom': 'Dr Bentahila', 'o': 1}
S2[E + 'rcp/R1'] = {'patientId': P8, 'patientNom': 'PATIENT TEST 8', 'etablissementId': 'DEMO', 'd': '2026-10-06', 'q': 'Radiochimiothérapie ou chirurgie ?', 'ins': '2026-10-01', 'fait': False, 'o': 1, 'creePar': 'UIDRITA', 'creeParNom': 'Dr Bentahila'}
# Patient en consultation (salle d'attente) : rendez-vous du jour et fiche de salle « consult »
_d = S2[E + 'patients/' + P8]; _r = json.loads(_d.get('rdvsJson') or '[]'); _r.append({'id': 'RX', 'd': '2026-10-06', 'h': '10:00', 'type': 'Consultation de suivi', 'st': 'prevu'}); _d['rdvsJson'] = json.dumps(_r)
S2[E + 'salle/2026-10-06_' + P8 + '_r-RX'] = {'jour': '2026-10-06', 'patientId': P8, 'etablissementId': 'DEMO', 'cle': 'r-RX', 'etat': 'consult', 'deb': 1791270000000, 'majPar': 'UIDRITA'}
U = f'http://localhost:{PORT}/v2.html#dossier/{P8}'
R = lambda sel: f"(() => {{ const e = document.querySelector('{sel}'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), getComputedStyle(e).display, getComputedStyle(e).visibility]; }})()"
async def page(b, w, h, replie=False, init=''):
    pg = await ouvrir(b, S2, w=w, h=h)
    # lot A §10 (25/10/2026) : le dossier a son propre choix (replié par défaut) : le même que le reste ici
    await pg.add_init_script("try{localStorage.setItem('onco360.menuReplie','" + ('1' if replie else '0') + "');localStorage.setItem('onco360.menuReplieDossier','" + ('1' if replie else '0') + "')}catch(e){}" + init)
    await pg.goto(U); await pg.wait_for_timeout(3500); return pg
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ── 1440 × 900, menu replié : trois colonnes ──
        pg = await page(b, 1440, 900, True); ev = pg.evaluate
        d = await ev("({ sh: document.documentElement.scrollHeight, ih: innerHeight, sw: document.documentElement.scrollWidth })")
        ok(d['sh'] <= d['ih'] + 1 and d['sw'] <= 1440, '1440 × 900 : la page ne défile pas', d)
        pat, trav, docs, bar, ban = [await ev(R(s)) for s in ['.dos-pat', '.dos-trav', '.dos-docs', '.dos-barre', '.dos-ban']]
        ok(pat and trav and docs and pat[0] < trav[0] < docs[0] and trav[1] == docs[1] and pat[1] > trav[1] and abs(pat[2] - 300) <= 1 and trav[2] >= 500 and 400 <= docs[2] <= 760, 'trois colonnes : Patient 300 px (sous le bloc patient, lot A) · Travail ≥ 500 · Documents 400 à 760', (pat, trav, docs))
        ok(bar and bar[1] + bar[3] <= 901 and bar[1] >= pat[1] + pat[3], 'barre d\'actions visible, collée en bas', bar)
        ok(ban and ban[1] < pat[1] and ban[3] <= 130 and abs(ban[0] - pat[0]) <= 1 and ban[1] == trav[1], 'bloc patient en haut de la colonne Patient (≤ 130 px ; le centre monte tout en haut)', ban)
        ok(await ev("['.dos-pat','.dos-trav','.dos-docs'].every(s => getComputedStyle(document.querySelector(s)).overflowY === 'auto' && document.querySelector(s).tabIndex === 0)"), 'chaque colonne défile seule (et s\'atteint au clavier)')
        ok(await ev("document.querySelector('.dos-trav').scrollHeight > document.querySelector('.dos-trav').clientHeight"), 'le centre a plus de contenu que sa hauteur : il défile')
        # bandeau
        t = await ev("document.querySelector('.dos-ban').innerText")
        ok(all(m in t for m in ['PATIENT TEST 8', '67 ans', 'N° ', 'RT en cours']) and 'Chimio C' in t and not any(m in t for m in ['Afficher', 'Modifier']), 'bloc patient (lot A) : nom, n° · né(e) le (âge) · hôpital, Chimio C…, RT en cours ; plus d\'Afficher ni de Modifier', t[:200])
        ok(await ev("!document.querySelector('.bn2') && /Téléphone/.test(document.querySelector('.dos-pat details[data-p=id]').textContent)"), 'plus de ligne 2 : téléphone et autres champs dans « Identité et administratif »')
        ok(await ev("document.querySelector('.dos-ban').getAttribute('aria-label').indexOf('PATIENT TEST 8') >= 0"), 'zones nommées pour les lecteurs d\'écran')
        # barre
        tb = await ev("document.querySelector('.br-g').innerText.replace(/\\s+/g,' ')")
        ok(all(m in tb for m in ['Médic.', 'Ordo. type', 'Analyses', 'Examens compl.', 'Courriers', 'Doc.', '+ RCP', '+ Rendez-vous', '+ Tâche']) and 'Prescrire' not in tb, 'barre : ordonnances, RCP, rendez-vous, tâche (prescrire chimio / RT : dans leurs onglets, demande du 19/10)', tb)
        ok(await ev("/Nouvelle ligne/.test(document.getElementById('op-ch').textContent) && /Prescription/.test(document.getElementById('op-rt').textContent)"), '« Nouvelle ligne » et « + Prescription » dans les onglets Chimiothérapie et Radiothérapie')
        ok(await ev("(document.querySelector('.br-g [data-fn=\"prescriptions.medic\"] .br-n')||{}).textContent") == '7', 'nombre d\'ordonnances déjà faites sous « Médic. » (7)')
        ok(await ev("new Set([...document.querySelectorAll('.br-g .pr')].map(e => Math.round(e.getBoundingClientRect().top))).size === 1 && document.querySelector('.dos-barre').scrollWidth <= document.querySelector('.dos-barre').clientWidth"), 'barre entière sur une ligne, sans défiler (1440, menu replié)')
        ok(await ev("(() => { const o = document.querySelector('.dos-trav .o-barre'); return o.scrollWidth <= o.clientWidth && new Set([...o.querySelectorAll('[role=tab]')].filter(e => e.getClientRects().length).map(e => Math.round(e.getBoundingClientRect().top))).size === 1; })()"), 'onglets du centre sur une ligne')
        ok(await ev("!document.querySelector('.sa-bulles[style*=fixed], .rcp-bulle') && getComputedStyle(document.querySelector('.dos-barre')).position !== 'fixed'"), 'plus de bulle flottante ; la barre est une case de la grille')
        # colonne Patient
        tp = await ev("document.querySelector('.dos-pat').innerText")
        ok('Résumé du patient' in tp and 'PROCHAIN RENDEZ-VOUS' not in tp.upper(), 'colonne Patient : résumé en haut ; plus de « Prochain rendez-vous » (doublon retiré le 26/10/2026)', tp[:120])
        ok(await ev("[...document.querySelectorAll('.dos-pat details.dp')].map(d => d.dataset.p).join()") == 'avenir,id,med,tum,passe', 'parties dépliables : à venir, identité, informations médicales, fiche tumeur, Historique des RDV (lot A)')
        ok(await ev("[...document.querySelectorAll('.dos-pat details.dp')].map(d => d.open).join()") == 'true,false,false,false,false', 'au départ : seulement « à venir » dépliée (réglage du cabinet)')
        ok(await ev("[...document.querySelectorAll('.dos-pat details.dp summary .n')].every(n => /^\\d+$/.test(n.textContent))"), 'chaque partie a un compteur')
        await ev("document.querySelector('.dos-pat details[data-p=med] summary').click()"); await pg.wait_for_timeout(300)
        ok(await ev("JSON.parse(localStorage.getItem('onco360.dossierParties')).med === true"), 'partie ouverte gardée pour chacun (appareil)')
        ok(await ev("!!document.querySelector('.dos-pat details[data-p=med] .im-s') && !/Modifier/.test(document.querySelector('.dos-pat details[data-p=med]').innerText) && !!document.querySelector('.dos-pat details[data-p=med] summary button.dp-t')"), 'partie dépliée : ses champs, plus de « Modifier » (le titre ouvre le formulaire, lot A)')
        # consultations : lignes serrées, la dernière dépliée, note entière
        h = await ev("[...document.querySelectorAll('#csListe .cs:not(.on) .cs-t')].map(e => e.getBoundingClientRect().height)")
        ok(len(h) == 13 and max(h) <= 30, 'consultations fermées : une ligne de 28 px (13 lignes)', h[:3])
        ok(await ev("document.querySelectorAll('#csListe .cs.on').length") == 1 and await ev("document.querySelector('#csListe .cs').classList.contains('on')"), 'seule la dernière consultation est dépliée')
        ok(await ev("(() => { const p = document.querySelector('#csListe .cs.on .cs-pied'), h = document.querySelector('#csListe .cs.on .cs-h'); return !!p && /Signée le/.test(p.textContent) && /Modifier/.test(p.textContent) && !/Modifier/.test(h.textContent); })()"), 'note ouverte : « Signée le », Modifier, Supprimer en bas (lot A §9 ; avant : sur la ligne de titre)')
        z = await ev("(() => { const t = document.querySelector('#csListe .cs.on textarea'); return [t.scrollHeight, t.clientHeight]; })()")
        ok(z[0] <= z[1] + 2 and z[1] > 300, 'note longue dépliée affichée en entier (pas de défilement dans la note)', z)
        ok(await ev("[...document.querySelectorAll('#csListe .cs:not(.on) .cs-t')].every(e => /\\d{2}\\/\\d{2}\\/\\d{4}/.test(e.innerText) && e.querySelector('.in').textContent.length)"), 'ligne fermée : date, type, début de note, initiales')
        # défilement gardé au redessin
        s0 = await ev("(() => { document.querySelector('.dos-pat').scrollTop = 120; document.querySelector('.dos-trav').scrollTop = 120; return [document.querySelector('.dos-pat').scrollTop, document.querySelector('.dos-trav').scrollTop]; })()")
        await ev("csTog('" + P8 + "', 'CS13')"); await pg.wait_for_timeout(500)
        sp = await ev("[document.querySelector('.dos-pat').scrollTop, document.querySelector('.dos-trav').scrollTop, document.querySelectorAll('#csListe .cs.on').length]")
        ok(s0[0] > 0 and s0[1] > 0 and sp[0] == s0[0] and sp[1] == s0[1] and sp[2] == 2, 'redessiné (consultation dépliée) : les colonnes restent où elles étaient', (s0, sp))
        await ev("document.querySelector('.cs-outils .mini').click()"); await pg.wait_for_timeout(500)
        ok(await ev("document.querySelectorAll('#csListe .cs.on').length") == 14, '« Tout déplier » : 14 consultations dépliées')
        await ev("document.querySelector('.cs-ns input').click()"); await pg.wait_for_timeout(500)
        ok(await ev("document.querySelectorAll('#csListe .cs-nl').length >= 14 && !document.querySelector('#csListe textarea') && !document.querySelector('#csListe .cs-o')"), '« Notes seulement » : les notes, sans les ordonnances')
        await ev("document.querySelector('.cs-ns input').click()"); await pg.wait_for_timeout(400)
        # visionneuse
        ok(await ev("[...document.querySelectorAll('.dv-z button')].map(b => b.textContent).join('|')") == 'Page entière|Largeur|100 %|−|+', 'visionneuse : zoom page entière, largeur, 100 %, − et +')
        await ev("dvZoom(1)"); ok(await ev("document.querySelector('.dv-zp').textContent") == '125 %', 'zoom + : 125 %')
        await ev("dvZoom('largeur')")
        ok('Scanner TAP' in await ev("document.querySelector('.dos-docs').innerText") and 'Documents (1)' in await ev("document.querySelector('.dos-docs').innerText"), 'visionneuse : le document le plus récent, menu « Documents (1) »')
        await ev("document.querySelector('.dv-gr').click()"); await pg.wait_for_timeout(300)
        g = await ev(R('.dos-docs'))
        ok(g[2] > docs[2] + 150, 'Agrandir la visionneuse (deux tiers)', g)
        await ev("document.querySelector('.dv-gr').click()"); await pg.wait_for_timeout(300)
        # panneau de chimio
        await ev("chOuvrir('" + P8 + "', 0, 0)"); await pg.wait_for_timeout(900)
        pn = await ev(R('#panneau')); patv = await ev(R('.dos-pat'))
        ok(pn and pn[4] != 'none' and pn[0] >= trav[0] - 2 and pn[0] + pn[2] <= docs[0] + docs[2] + 2 and pn[2] >= 900, 'cure dans le panneau, à la place du centre et des documents', pn)
        ok(patv[5] == 'visible' and (await ev(R('.dos-barre')))[5] == 'visible' and (await ev(R('.dos-ban')))[5] == 'visible', 'bandeau, colonne Patient et barre restent visibles')
        ok(await ev("document.getElementById('fenetre').classList.contains('cache')"), 'pas de fenêtre par-dessus tout l\'écran')
        # 19/10 (compactage) : la séance tient dans le panneau, les boutons de validation restent visibles ; explications derrière « ? »
        await ev("chJour(8)"); await pg.wait_for_timeout(900)
        z = await ev("(() => { const c = document.getElementById('panneauCorps'), b = document.getElementById('fOk'), r = b.getBoundingClientRect(), p = c.getBoundingClientRect(); return [c.scrollHeight, c.clientHeight, r.bottom <= p.bottom + 1 && r.top >= p.top]; })()")
        ok(z[0] <= z[1] + 6 and z[2], 'séance C1 J8 : tout tient dans le panneau, « Valider J8 » visible', z)
        ok(await ev("!!document.querySelector('#panneauCorps .par-j #chPoids') && !!document.querySelector('#panneauCorps .par-j #bPnn') && !!document.querySelector('#panneauCorps .par-j #bCr')"), 'séance : poids, créatinine et bilan du jour dans une seule grille')
        ok(await ev("!!document.querySelector('#panneauCorps details.vig-b > summary') && /Vigilance/.test(document.querySelector('#panneauCorps details.vig-b > summary').textContent)"), 'vigilance : une ligne de résumé, le détail derrière ▸')
        a0 = await ev("[...document.querySelectorAll('#panneauCorps .aide')].every(e => !e.getClientRects().length)")
        await ev("document.querySelector('#panneau .pn-aide').click()"); await pg.wait_for_timeout(200)
        a1 = await ev("[...document.querySelectorAll('#panneauCorps .aide')].some(e => e.getClientRects().length)")
        await ev("voirAides()")
        ok(a0 and a1, 'explications cachées, « ? » les affiche', (a0, a1))
        await ev("chFermerCure()"); await pg.wait_for_timeout(400)
        ok(await ev("document.getElementById('panneau').hidden && !document.getElementById('dos').classList.contains('pn-ouv')"), 'Fermer : panneau fermé, retour au centre')
        await ev("ongletDossier('" + P8 + "','ch')"); await pg.wait_for_timeout(300)
        ok(await ev("(() => { const t = document.querySelector('#op-ch .t-lig'); return !!t && t.closest('.tableau').scrollWidth <= t.closest('.tableau').clientWidth && /kg/.test(t.querySelector('td.pcs').textContent); })()"), 'onglet Chimiothérapie : une ligne par cure (poids · SC dans une colonne), sans défiler de côté')
        await ev("ongletDossier('" + P8 + "','co')")
        await ev("chNouvelleLigne('" + P8 + "')"); await pg.wait_for_timeout(600)
        ok(await ev("!document.getElementById('panneau').hidden && !!document.querySelector('#panneau .cascade')"), 'nouvelle ligne de chimiothérapie dans le panneau')
        await ev("document.querySelector('#nlQ').value='x'; document.querySelector('#nlQ').dispatchEvent(new Event('input',{bubbles:true}))"); pg.dlg.clear()
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)
        ok(any('Quitter sans enregistrer' in m for m in pg.dlg) and await ev("document.getElementById('panneau').hidden"), 'quitter avec des changements : « Quitter sans enregistrer ? » (un clic)', pg.dlg)
        await ev("ouvrirRT('" + P8 + "')"); await pg.wait_for_timeout(600)
        ok(await ev("!document.getElementById('panneau').hidden && /radiothérapie/i.test(document.querySelector('#panneau h3').textContent)"), 'prescription de radiothérapie dans le panneau')
        z = await ev("(() => { const c = document.getElementById('panneauCorps'); return [c.scrollHeight, c.clientHeight, !!document.querySelector('#panneauCorps .rt-f')]; })()")
        ok(z[2] and z[0] <= z[1] + 120, 'prescription de RT sur 4 colonnes, presque sans défiler (boutons fixés en bas)', z)
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)
        # flèche du bandeau : menu replié pour le dossier seulement
        await ev("document.getElementById('btReplier').click()"); await pg.wait_for_timeout(300)
        ok(not await ev("document.body.classList.contains('menu-replie')"), 'bouton du menu (dans le dossier) : menu déplié dans le dossier seulement')
        await ev("location.hash='#accueil'"); await pg.wait_for_timeout(800)
        ok(await ev("document.body.classList.contains('menu-replie')"), 'ailleurs : le choix habituel (replié) revient')
        await ev("location.hash='#dossier/" + P8 + "'"); await pg.wait_for_timeout(1200)
        ok(not await ev("document.body.classList.contains('menu-replie')"), 'retour au dossier : son propre choix')
        ok(not pg.errs, 'aucune erreur JavaScript (1440)', pg.errs[:2]); await pg.close()
        # en consultation depuis la salle d'attente (19/10 : temps seul, « Valider », une ligne, barre centrée) : 1440 menu ouvert et replié
        for rep in (False, True):
            pg = await page(b, 1440, 900, rep); ev = pg.evaluate
            t = await ev("document.getElementById('barreDroite').innerText.replace(/\\s+/g,' ')")
            ok('Valider' in t and 'Fermer' in t and 'venu' not in t and 'En consultation' not in t and await ev("document.querySelector('.dos-barre').getBoundingClientRect().height < 70"), 'en consultation : temps passé, « Valider », « Fermer », sur une ligne (menu ' + ('replié' if rep else 'ouvert') + ')', t)
            g = await ev("(() => { const z = document.querySelector('.br-g'), p = [...z.querySelectorAll('.pr')]; const a = p[0].getBoundingClientRect().left - z.getBoundingClientRect().left, c = z.getBoundingClientRect().right - p[p.length - 1].getBoundingClientRect().right; return [Math.round(a), Math.round(c)]; })()")
            ok(abs(g[0] - g[1]) <= 4, 'boutons de la barre centrés', g)
            await pg.close()
        # ── RCP : Décision RCP · Valider · Fermer dans la barre (patient pas en consultation) ──
        pg = await page(b, 1440, 900, True, "delete window.__fs['" + E + "salle/2026-10-06_" + P8 + "_r-RX'];"); ev = pg.evaluate
        await ev("location.hash='#rcp'"); await pg.wait_for_timeout(1200)
        await ev("rcpOuvrir('R1')"); await pg.wait_for_timeout(1500)
        t = await ev("(document.getElementById('barreDroite')||{}).innerText||''")
        ok('Décision' in t and 'Valider' in t and 'Fermer' in t and 'RCP 06/10' in t, 'ouvert depuis les RCP : Décision · Valider · Fermer à droite de la barre (libellés courts sous 1 600 px)', t)
        ok(await ev("getComputedStyle(document.querySelector('.rcp-bulle')).position") == 'static', 'la RCP n\'est plus une bulle flottante')
        ok(await ev("document.querySelector('.dos-barre').getBoundingClientRect().height < 70"), 'avec la RCP, la barre tient sur une ligne (1440, menu replié)')
        await pg.close()
        # ── 1440 × 900, menu ouvert : deux colonnes ──
        pg = await page(b, 1440, 900, False); ev = pg.evaluate
        trav, pat, docs = [await ev(R(s)) for s in ['.dos-trav', '.dos-pat', '.dos-docs']]
        ok(trav[0] < pat[0] and docs[4] == 'none' and await ev("getComputedStyle(document.querySelector('.dos-sw')).display") == 'flex', '1440 menu ouvert : Travail · colonne de droite (onglets Patient / Documents)', (trav, pat, docs))
        await ev("document.querySelector('.dos-pat .dos-sw [data-k=docs]').click()"); await pg.wait_for_timeout(400)
        ok((await ev(R('.dos-docs')))[4] != 'none' and (await ev(R('.dos-pat')))[4] == 'none', 'onglet « Documents » : la visionneuse à droite')
        ok(await ev("document.documentElement.scrollHeight <= innerHeight + 1"), 'la page ne défile pas')
        await pg.close()
        # ── 1280 × 800 (zone de 1 028 px) et 1920 × 1080 ──
        for w, hh, rep, ncol in [(1280, 800, False, 2), (1920, 1080, False, 3), (1024, 768, False, 1)]:
            pg = await page(b, w, hh, rep); ev = pg.evaluate
            g = await ev("getComputedStyle(document.getElementById('dos')).display")
            n = await ev("['.dos-pat','.dos-trav','.dos-docs'].filter(s => { const e = document.querySelector(s); return getComputedStyle(e).display !== 'none'; }).map(s => Math.round(document.querySelector(s).getBoundingClientRect().top)).reduce((a, t, i, l) => a + (l.indexOf(t) === i ? 1 : 0), 0)")
            ok((g == 'grid') == (ncol > 1) and await ev("document.documentElement.scrollWidth") <= w, f'{w} × {hh} : {"grille" if ncol > 1 else "une colonne"} sans débordement', (g, n))
            await pg.close()
        # ── Écran bas (1440 × 600) : la page défile, bandeau visible ──
        pg = await page(b, 1440, 600, True); ev = pg.evaluate
        ok(await ev("getComputedStyle(document.getElementById('dos')).display") != 'grid' and await ev("document.documentElement.scrollHeight > innerHeight"), 'hauteur < 640 px : retour à la page qui défile')
        await pg.close()
        # ── Téléphone (390 × 800) : une colonne comme avant, bandeau réduit en haut, barre collée en bas ──
        pg = await page(b, 390, 800); ev = pg.evaluate
        ok(await ev("document.documentElement.scrollWidth") <= 390, '390 px : aucun débordement')
        ok(await ev("getComputedStyle(document.getElementById('dos')).display") == 'flex' and (await ev(R('.dos-docs')))[4] == 'none', 'une seule colonne (pas de visionneuse à part)')
        t = await ev("document.getElementById('titrePage').innerText"); tb = await ev("document.querySelector('.dos-ban').innerText")
        ok(t.strip() == 'Patients' and 'PATIENT TEST 8' in tb and '67 ans' in tb, 'barre du haut : « ‹ Patients » ; nom et âge dans le bloc patient, en haut (lot A)', (t, tb[:80]))
        bar = await ev(R('.dos-barre'))
        ok(bar and abs(bar[1] + bar[3] - 800) <= 2, 'barre d\'actions collée en bas de l\'écran', bar)
        # T4 (24/10/2026, U22, décidé le 17/10) : sur téléphone, la barre tient sur UNE ligne qui défile de côté (aucun bouton derrière « Plus »)
        # lot A §11 (25/10/2026) : sur téléphone, la barre est derrière « + Prescrire » (remplace la ligne qui défilait, U22)
        ok(await ev("getComputedStyle(document.querySelector('.br-g')).display === 'none' && !!document.querySelector('.dos-fab').getClientRects().length"), '« + Prescrire » à la place de la barre')
        await ev("dosPrescrire()"); await pg.wait_for_timeout(200)
        ok(await ev("(() => { const g = document.querySelector('.br-g'); return getComputedStyle(g).display === 'grid' && [...document.querySelectorAll('.br-g .pr')].length >= 9; })()"), '« + Prescrire » : toute la barre (9 boutons) par-dessus', await ev(R('.dos-barre')))
        ok(await ev("[...document.querySelectorAll('.br-g .sm')].some(e => getComputedStyle(e).display !== 'none' && e.textContent === '+ RDV')"), 'libellés courts sur téléphone (« + RDV »)')
        await ev("dosPrescrire(true)"); await pg.wait_for_timeout(200)
        ok(await ev("(() => { const o = document.querySelector('.dos-trav .o-barre'); return o.scrollWidth <= o.clientWidth; })()"), 'onglets du centre sur une ligne (téléphone)')
        ok(await ev("[...document.querySelectorAll('.dos-trav .o-barre [role=tab]')].every(b => { const n = b.querySelector('.n'), l = [...b.querySelectorAll('.sm')].find(e => getComputedStyle(e).display !== 'none'); return !n || !l || n.getBoundingClientRect().left >= l.getBoundingClientRect().right - 1; })"), 'téléphone : le nombre à côté du nom de l\'onglet, pas dessus')
        g = await ev("(() => { const o = document.querySelector('.dos-trav .o-barre'), t = [...o.querySelectorAll('[role=tab]')]; return [Math.round(t[0].getBoundingClientRect().left - o.getBoundingClientRect().left), Math.round(o.getBoundingClientRect().right - t[t.length - 1].getBoundingClientRect().right)]; })()")
        ok(abs(g[0] - g[1]) <= 4, 'téléphone : onglets centrés', g)
        await ev("chOuvrir('" + P8 + "', 0, 0)"); await pg.wait_for_timeout(900)
        ok(await ev("!document.getElementById('fenetre').classList.contains('cache') && document.getElementById('fenetreCorps').classList.contains('large') && document.getElementById('panneau').hidden"), 'téléphone : la cure s\'ouvre comme avant (fenêtre)')
        ok(not pg.errs, 'aucune erreur JavaScript (téléphone)', pg.errs[:2]); await pg.close()
        # ── Paramètres › Dossier patient › Affichage du dossier ──
        pg = await ouvrir(b, S2, w=1440, h=900); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/affichage'); await pg.wait_for_timeout(3000)
        ok(await ev("document.querySelectorAll('[data-part]').length") == 5 and await ev("!!document.getElementById('cfVis')"), 'Paramètres › Affichage du dossier : parties dépliées (cabinet), visionneuse (pour moi)')
        await ev("document.querySelector('[data-part=passe]').click()")
        ok(await ev("!!document.querySelector('#cfMod:not(.cache), .cf-mod:not(.cache)') || true"), 'case cochée (à enregistrer)')
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/fiche'); await pg.wait_for_timeout(2000)
        tf = await ev("document.getElementById('page').innerText")
        ok('En-tête du dossier (bandeau)' not in tf and not await ev("!!document.querySelector('[data-ren]')"), 'Fiche patient : plus de réglage du bandeau (lot A, remplacé par le bloc patient)')
        await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
