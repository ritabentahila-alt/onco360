import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot A (25/10/2026, demande de Dr Bentahila) : dossier patient retouché. Bloc patient en haut de la colonne Patient (plus de bandeau) ; recherche
# du haut = 8 derniers dossiers ouverts (utilisateurs/{uid}.recents, jamais hors périmètre) ; rubriques : « Historique des RDV » en dernier, titre =
# rubrique ouverte au centre, plus de « Modifier » ; rendez-vous en cartes d'une ou deux lignes, actions sous « ⋯ », 3 puis « Voir plus » ;
# informations médicales en lignes (« non renseigné » cliquable, titre = tout le formulaire au centre, listes du cabinet, saisie libre ajoutée à la liste, doublon, allergie oui / non, traitement
# avec dosage, ancien texte gardé) ; Paramètres › Bibliothèques › Listes ; plus de réglage « En-tête du dossier ». Jeu fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
P0 = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3]
pid, pid2 = P0[0], P0[1]
def jeu():
    s = json.loads(json.dumps(S)); k = E + 'patients/' + pid
    rd = json.loads(s[k].get('rdvsJson') or '[]')
    rd += [{'id': 'rLa' + str(i), 'type': 'Suivi', 'd': '2026-10-%02d' % (10 + i), 'h': '09:%02d' % (10 * i), 'st': 'prevu'} for i in range(1, 6)]  # 5 à venir
    rd += [{'id': 'rLp1', 'type': 'Contrôle', 'd': '2026-10-01', 'h': '11:00', 'st': 'prevu', 'mo': 'Bilan'}]  # passé, à valider
    s[k]['rdvsJson'] = json.dumps(rd)
    s[k]['clinique'] = dict(s[k].get('clinique') or {}, atcdMed='HTA, diabète depuis 2010')  # ancien texte libre
    s['utilisateurs/UIDRITA'] = dict(s.get('utilisateurs/UIDRITA') or {}, recents=['FANTOME', pid2])  # FANTOME : dossier supprimé ou hors périmètre
    return s
CL = "(() => window.__fs['" + E + "patients/" + pid + "'].clinique)()"
VIS = "((s) => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'; })"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Bloc patient (§1)')
        pg = await ouvrir(b, jeu(), w=1600, h=900); ev = pg.evaluate
        await pg.add_init_script("try{localStorage.setItem('onco360.menuReplieDossier','1')}catch(e){}")
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3000)
        bp = await ev("(()=>{const b=document.querySelector('.dos-ban .bp');return b?b.innerText:''})()")
        ok('PATIENT TEST REF 1' in bp and 'N° 202609901' in bp and '15/06/1965 (61 ans)' in bp and 'HGC' in bp, 'nom, « N° · né(e) le (âge) · hôpital »', bp)
        ok(not await ev("[...document.querySelectorAll('.dos-ban button')].some(b => /^(Afficher|Modifier|Journal)$/.test(b.textContent.trim()) && b.getClientRects().length)"), 'plus de boutons Afficher, Journal, Modifier visibles')
        ok(await ev("document.getElementById('titrePage').innerText.trim()") == 'Patients' and await ev("!!document.querySelector('#titrePage a[href=\"#patients\"]')"), 'barre du haut : « ‹ Patients » seulement (le nom une seule fois)')
        g = await ev("(()=>{const a=document.querySelector('.dos-ban').getBoundingClientRect(),c=document.querySelector('.dos-pat').getBoundingClientRect(),t=document.querySelector('.dos-trav').getBoundingClientRect();return [Math.round(a.left-c.left),Math.round(c.top-a.bottom),Math.round(t.top-a.top)]})()")
        ok(abs(g[0]) <= 2 and 0 <= g[1] <= 16 and abs(g[2]) <= 2, 'trois colonnes : le bloc est en haut de la colonne Patient, le centre monte tout en haut', g)
        await ev("document.querySelector('.dos-ban .mpts button').click()"); await pg.wait_for_timeout(200)
        ok('Journal' in await ev("(document.getElementById('ptsMenuF')||{}).innerText||''"), '« ⋯ » du nom : Journal (titulaire)'); await ev("document.body.click()")

        print('Rubriques (§3)')
        r = await ev("[...document.querySelectorAll('.dos-pat details.dp')].map(d => d.dataset.p)")
        ok(r == ['avenir', 'id', 'med', 'tum', 'passe'] or r == ['avenir', 'id', 'med', 'passe'], 'ordre : à venir, identité, informations médicales, fiche tumeur, Historique des RDV en dernier', r)
        t = await pg.inner_text('#page')
        ok('HISTORIQUE DES RDV' in t.upper() and 'Consultations et hospitalisations' not in t, '« Historique des RDV » (plus « Consultations et hospitalisations »)')
        ok(not await ev("[...document.querySelectorAll('.dos-pat .dp-c button')].some(b => b.textContent.trim() === 'Modifier' && !b.closest('.cache'))"), 'plus de « Modifier » sous les rubriques (seulement dans les menus « ⋯ »)')
        await ev("document.querySelector('details.dp[data-p=id] .dp-t').click()"); await pg.wait_for_timeout(500)
        ok(await ev(VIS + "('#panneau')") and await ev("!!document.querySelector('#panneau #fNomF') && !!document.querySelector('#panneau #fOk')"), 'titre « Identité » : le formulaire entier au centre (Annuler / Enregistrer)')
        await ev("[...document.querySelectorAll('#panneau .boutons button')].find(b=>b.textContent.trim()==='Annuler').click()"); await pg.wait_for_timeout(300)
        ok(not await ev(VIS + "('#panneau')"), 'Annuler : le centre revient')
        await ev("document.querySelector('details.dp[data-p=avenir] .dp-t').click()"); await pg.wait_for_timeout(500)
        n = await ev("document.querySelectorAll('#panneau [data-rub=avenir] .rc').length")
        ok(n >= 5 and await ev("!!document.querySelector('#panneau [data-rub=avenir] .boutons button')") and not await ev("[...document.querySelectorAll('#panneau [data-rub] button')].some(b=>/^\\+/.test(b.textContent.trim()))"), 'titre « à venir » : la liste complète au centre, Fermer, aucun « + »', n)
        await ev("fermerFenetre()"); await pg.wait_for_timeout(300)

        print('Cartes (§8, §8 bis)')
        c = await ev("(()=>{const L=[...document.querySelectorAll('#rdvListe .rc')];return {n:L.length,h:Math.max(...L.map(e=>e.getBoundingClientRect().height)),pts:L.every(e=>e.querySelector('.mpts')),vis:L.some(e=>[...e.querySelectorAll('button')].some(b=>!b.closest('.mpts .cache')&&!b.closest('.mpts'))),plus:(document.querySelector('#rdvListe .rc-plus')||{}).textContent||''}})()")
        ok(c['n'] == 3 and 'Voir plus' in c['plus'], '3 cartes, puis « Voir plus »', c)
        ok(c['h'] <= 70 and c['pts'] and not c['vis'], 'une ou deux lignes par carte, un seul bouton « ⋯ »', c)
        await ev("document.querySelector('#rdvListe .rc-plus').click()"); await pg.wait_for_timeout(500)
        ok(await ev("document.querySelectorAll('#rdvListe .rc').length") >= 5, '« Voir plus » : toutes les cartes')
        await ev("[...document.querySelectorAll('#rdvListe .rc')].find(e=>/suivi/i.test(e.innerText)).querySelector('.mpts button').click()"); await pg.wait_for_timeout(200)
        m = await ev("[...document.querySelectorAll('#ptsMenuF button')].map(b=>b.textContent.trim())")
        ok('Modifier' in m and 'Supprimer' in m and any('WhatsApp' in x for x in m), 'menu d\'un rendez-vous : rappel WhatsApp, Modifier, Supprimer', m); await ev("document.body.click()")
        await ev("document.querySelector('details.dp[data-p=passe]').open=true"); await pg.wait_for_timeout(200)
        hp = await ev("(()=>{const e=[...document.querySelectorAll('details.dp[data-p=passe] .rc')].find(z=>/contr[ôo]le/i.test(z.innerText));return e?e.innerText:''})()")
        ok('À valider' in hp and 'Motif : Bilan' in hp, 'Historique : « À valider » visible, motif en ligne 2', hp)
        await ev("[...document.querySelectorAll('details.dp[data-p=passe] .rc')].find(z=>/contr[ôo]le/i.test(z.innerText)).querySelector('.mpts button').click()"); await pg.wait_for_timeout(200)
        m = await ev("(document.getElementById('ptsMenuF')||{}).innerText||''")
        ok('Statut : à valider' in m and 'Venu' in m and 'Non venu' in m, 'Historique : statut et Venu / Non venu sous « ⋯ »', m); await ev("document.body.click()")
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Recherche du haut (§2)')
        pg = await ouvrir(b, jeu(), w=1440, h=900); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        ok(await ev("JSON.stringify(window.__fs['utilisateurs/UIDRITA'].recents)") == json.dumps([pid, 'FANTOME', pid2]).replace(' ', ''), 'dossier ouvert : en tête des derniers dossiers (utilisateurs/{uid}.recents)', await ev("window.__fs['utilisateurs/UIDRITA'].recents"))
        await pg.click('#trQ'); await pg.wait_for_timeout(300)
        r = await ev("[...document.querySelectorAll('#trRes button')].map(b=>[b.dataset.id,b.innerText])")
        ok([z[0] for z in r] == [pid, pid2] and 'ans' in r[0][1] and '0600000000' in r[0][1] and 'N° ' in r[0][1], 'sans rien taper : derniers dossiers (numéro, âge, téléphone) ; dossier absent jamais montré', r)
        await ev(f"document.querySelector('#trRes button[data-id=\"{pid2}\"]').dispatchEvent(new MouseEvent('mousedown',{{bubbles:true}}))"); await pg.wait_for_timeout(1200)
        ok(pid2 in await ev("location.hash"), 'clic : le dossier s\'ouvre'); await pg.close()

        print('Informations médicales (§4, §6)')
        pg = await ouvrir(b, jeu(), w=1440, h=900); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev("document.querySelector('details.dp[data-p=med]').open=true"); await pg.wait_for_timeout(200)
        t = await ev("document.querySelector('details.dp[data-p=med]').innerText")
        ok('HTA, diabète depuis 2010' in t and 'Antécédents chirurgicaux' in t and 'non renseigné' in t, 'ancien texte gardé comme première ligne ; sous-parties vides « non renseigné »', t[:300])
        # 25/10 (2e demande) : plus de « + Ajouter » ; on ajoute par « non renseigné » (aussi sur l'OMS) ou par le titre de la rubrique
        ok(not await ev("!!document.querySelector('details.dp[data-p=med] .im-aj') || [...document.querySelectorAll('details.dp[data-p=med] button')].some(b => /Ajouter/.test(b.textContent) && !b.closest('.cache'))"), 'plus de « + Ajouter » dans Informations médicales')
        ok(await ev("[...document.querySelectorAll('details.dp[data-p=med] .im-s')].map(s=>s.dataset.im).join()") == 'atcdMed,atcdChir,atcdFam,allergies,traitCours,modeVie', 'six sous-parties toujours affichées')
        await ev("document.querySelector('.im-s[data-im=atcdChir] button.im-nr').click()"); await pg.wait_for_timeout(400)
        ok(await ev("document.querySelectorAll('#fenetreCorps .im-r').length") == 1 and await ev("document.querySelectorAll('#imDl-atcdChir option').length") >= 30, 'petite fenêtre : une ligne, liste de départ proposée')
        await pg.fill('#fenetreCorps .im-lib', 'Appendicectomie'); await pg.fill('#fenetreCorps .im-no', 'en 1990')
        await ev("document.querySelector('#fenetreCorps .im-plus').click()"); await pg.wait_for_timeout(100)
        await ev("const l=document.querySelectorAll('#fenetreCorps .im-lib'); l[1].value='appendicectomie '")
        await pg.click('#imOk'); await pg.wait_for_timeout(500)
        ok('déjà noté' in await pg.inner_text('#fErr') and 'atcdChir' not in await ev(CL), 'doublon signalé, rien enregistré', await pg.inner_text('#fErr'))
        await ev("const l=document.querySelectorAll('#fenetreCorps .im-lib'); l[1].value='Maladie très rare XYZ'")
        await pg.click('#imOk'); await pg.wait_for_timeout(1200)
        cl = await ev(CL)
        ok(cl.get('atcdChir') == 'Appendicectomie — en 1990\nMaladie très rare XYZ', 'enregistré : une ligne par élément (« libellé — note »)', cl.get('atcdChir'))
        L = json.loads((await ev("(window.__fs['" + E + "parametres/listes']||{}).data||'{}'")))
        ok('Maladie très rare XYZ' in (L.get('atcdChir') or []) and 'Appendicectomie' in (L.get('atcdChir') or []), 'saisie libre ajoutée à la liste du cabinet', (L.get('atcdChir') or [])[-3:])
        t = await ev("document.querySelector('details.dp[data-p=med]').innerText")
        ok('Appendicectomie' in t and 'en 1990' in t, 'affiché sous sa sous-partie')
        # traitement avec dosage
        await ev("document.querySelector('.im-s[data-im=traitCours] button.im-nr').click()"); await pg.wait_for_timeout(400)
        await pg.fill('#fenetreCorps .im-lib', 'Kardegic'); await pg.fill('#fenetreCorps .im-dz', '75 mg'); await pg.click('#imOk'); await pg.wait_for_timeout(1000)
        ok((await ev(CL)).get('traitCours') == 'Kardegic — 75 mg', 'traitement : dosage facultatif sur la même ligne', (await ev(CL)).get('traitCours'))
        # allergie : oui + Pénicilline, puis contrôle d'allergie de la chimiothérapie
        await ev("document.querySelector('.im-s[data-im=allergies] button.im-nr').click()"); await pg.wait_for_timeout(400)
        ok(await ev("document.getElementById('imAl').value") == '' and await ev("document.getElementById('imAlZ').classList.contains('cache')"), 'allergie : Oui / Non à choisir, liste cachée')
        await pg.select_option('#imAl', 'oui'); await pg.wait_for_timeout(100)
        ok(not await ev("document.getElementById('imAlZ').classList.contains('cache')"), 'Oui : la liste s\'ouvre')
        await pg.fill('#fenetreCorps .im-lib', 'Pénicilline'); await pg.click('#imOk'); await pg.wait_for_timeout(1000)
        cl = await ev(CL)
        ok(cl.get('allergie') == 'oui' and cl.get('allergies') == 'Pénicilline', 'allergie enregistrée (allergie = oui, allergies)', cl)
        ok('Allergie' in await ev("document.querySelector('.dos-ban').innerText"), 'bloc patient : allergie affichée')
        al = await ev("import('/js/moteur/statut.js').then(m => m.allergieDans(" + json.dumps({'allergie': 'oui', 'allergies': cl.get('allergies')}) + ", 'PÉNICILLINE G 1 MUI'))")
        ok(al == 'PENICILLINE', 'contrôle d\'allergie de la chimiothérapie : toujours reconnu', al)
        # supprimer une ligne (✎ → ✕)
        await ev("document.querySelector('.im-s[data-im=atcdChir] .im-cr').click()"); await pg.wait_for_timeout(400)
        await ev("document.querySelectorAll('#fenetreCorps .im-x')[1].click()"); await pg.click('#imOk'); await pg.wait_for_timeout(1000)
        ok((await ev(CL)).get('atcdChir') == 'Appendicectomie — en 1990', '✎ puis ✕ : élément supprimé')
        # allergie non
        await ev(f"imOuvrir('{pid}','allergies')"); await pg.wait_for_timeout(400)
        await pg.select_option('#imAl', 'non'); await pg.click('#imOk'); await pg.wait_for_timeout(1000)
        ok((await ev(CL)).get('allergie') == 'non' and 'Aucune allergie connue' in await ev("document.querySelector('details.dp[data-p=med]').innerText"), 'Non : « Aucune allergie connue »')
        # formulaire entier au centre
        await ev("document.querySelector('details.dp[data-p=med] .dp-t').click()"); await pg.wait_for_timeout(500)
        ok(await ev("!!document.querySelector('#panneau [data-champ=atcdMed] .im-ed') && !!document.querySelector('#panneau [data-champ=traitCours] .im-ed')"), 'titre « Informations médicales » : formulaire entier, antécédents et traitements en lignes')
        await ev("const r=document.querySelector('#panneau [data-champ=atcdMed] .im-lib'); r.value='HTA'")
        await pg.click('#panneau #fOk'); await pg.wait_for_timeout(1200)
        ok((await ev(CL)).get('atcdMed') == 'HTA' and not await ev(VIS + "('#panneau')"), 'formulaire entier : enregistré, centre refermé', (await ev(CL)).get('atcdMed'))
        # « non renseigné » de l'OMS : son champ seul dans une petite fenêtre
        ok(await ev("!!document.querySelector('details.dp[data-p=med] [data-champ=xtoms] button.im-nr')"), 'OMS vide : « non renseigné » cliquable')
        await ev("document.querySelector('details.dp[data-p=med] [data-champ=xtoms] button.im-nr').click()"); await pg.wait_for_timeout(400)
        ok(await ev("document.querySelectorAll('#fenetreCorps select, #fenetreCorps input, #fenetreCorps textarea').length") == 1, 'petite fenêtre : le seul champ OMS')
        await ev("const s=document.querySelector('#fenetreCorps select'); s.value='1'"); await pg.click('#imOk'); await pg.wait_for_timeout(1000)
        ok(((await ev(CL)).get('extra') or {}).get('xtoms') == '1' and not await ev("!!document.querySelector('details.dp[data-p=med] [data-champ=xtoms] button.im-nr')"), 'OMS enregistré (1), plus « non renseigné »', (await ev(CL)).get('extra'))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Paramètres (§1, §6)')
        pg = await ouvrir(b, jeu(), w=1440, h=900); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/fiche'); await pg.wait_for_timeout(2500)
        t = await pg.inner_text('#page')
        ok('En-tête du dossier' not in t and not await ev("!!document.querySelector('[data-ren]')"), 'Fiche patient : plus de réglage « En-tête du dossier (bandeau) » ni de case « en-tête »')
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/listes'); await pg.wait_for_timeout(1500)
        pl = await ev("[...document.querySelectorAll('#page .puces .puce')].map(b=>b.textContent.trim())")
        ok([x.split(' (')[0] for x in pl][:8] == ['Mutuelles', 'Correspondants', 'Allergies', 'Antécédents médicaux', 'Antécédents chirurgicaux', 'Antécédents familiaux', 'Traitements en cours', 'Localisations'] and 'Allergies (30)' in pl, 'Listes : mutuelles, correspondants, informations médicales, localisations (départ : 30 allergies)', pl)
        await ev("cfLs('allergies')"); await pg.wait_for_timeout(500)
        ok(await ev("document.querySelectorAll('#cfLl input').length") == 30, 'liste des allergies affichée et modifiable')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Consultations en cartes (§9), menu du dossier (§10)')
        s = jeu()
        for i, (ty, ti) in enumerate([("Consultation de suivi", "Tolérance correcte"), ("Consultation d'annonce", "Annonce")]):
            s[E + 'consultations/cLa' + str(i)] = {'patientId': pid, 'etablissementId': 'HGC', 'd': '2026-10-0' + str(5 - i), 'type': ty, 'titre': ti, 'note': 'Note ' + str(i), 'lignes': [], 'o': 1791000000000 + i, 'creePar': 'UIDRITA', 'creeParNom': 'Dr Médecin Test', 'majPar': 'UIDRITA'}
        pg = await ouvrir(b, s, w=1440, h=900); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3000)
        r = await ev("(()=>{const o=document.querySelector('#csListe .cs.on'),f=document.querySelector('#csListe .cs:not(.on)');return {nom:o&&o.querySelector('.cs-t .in').textContent,pied:o&&[...o.querySelectorAll('.cs-pied button')].map(b=>b.textContent),sig:o&&(o.querySelector('.cs-pied .cs-sig')||{}).textContent,ferme:f&&f.querySelector('.cs-t .in').textContent,fond:o&&getComputedStyle(o.querySelector('.cs-h')).backgroundColor,bord:o&&getComputedStyle(o).borderTopWidth}})()")
        ok(r['nom'] == 'Dr Médecin Test' and r['ferme'] == 'MT' and r['pied'] == ['Modifier', 'Supprimer'] and 'Signée le' in (r['sig'] or '') and r['fond'] == 'rgb(255, 255, 255)' and r['bord'] == '1px', 'consultation ouverte : nom complet, « Signée le … », Modifier / Supprimer en bas, en-tête blanc, filet 1 px ; fermée : initiales', r)
        ok('menu-replie' in await ev("document.body.className") and await ev("getComputedStyle(document.getElementById('dos')).gridTemplateColumns.split(' ').length") == 3, 'dossier : menu en icônes, trois colonnes à 1 440 px')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Téléphone (390 px)')
        pg = await ouvrir(b, jeu(), w=390, h=844); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        o = await ev("[...document.querySelectorAll('.dos-trav .o-barre button[role=tab]')].filter(b=>b.getClientRects().length).map(b=>b.querySelector('.sm').textContent)")
        ok(o[:2] == ['Consult.', 'Patient'] and await ev("getComputedStyle(document.querySelector('.dos-pat')).display") == 'none', 'onglets Consult. (ouvert) · Patient · …', o)
        await ev(f"ongletDossier('{pid}','pat')"); await pg.wait_for_timeout(200)
        ok(await ev("getComputedStyle(document.querySelector('.dos-pat')).display") != 'none' and await ev("getComputedStyle(document.getElementById('op-co')).display") == 'none', 'onglet Patient : la colonne Patient')
        ok(await ev("getComputedStyle(document.querySelector('.dos-barre .br-g')).display") == 'none' and await ev("!!document.querySelector('.dos-fab').getClientRects().length"), 'barre repliée derrière « + Prescrire »')
        await ev("document.querySelector('.dos-fab').click()"); await pg.wait_for_timeout(200)
        ok(await ev("getComputedStyle(document.querySelector('.dos-barre .br-g')).display") == 'grid' and 'Médic.' in await ev("document.querySelector('.dos-barre .br-g').innerText"), '« + Prescrire » : Médic., Ordo. type, … par-dessus')
        await ev("document.querySelector('.dos-fab').click()"); await pg.wait_for_timeout(200)
        ok(await ev("document.documentElement.scrollWidth <= 392") and await ev("document.querySelector('.dos-ban').getBoundingClientRect().top < 200"), 'dossier sans débordement, bloc patient en haut', await ev("document.documentElement.scrollWidth"))
        await ev(f"imOuvrir('{pid}','traitCours',1)"); await pg.wait_for_timeout(400)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'petite fenêtre sans débordement')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
