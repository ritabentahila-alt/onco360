import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Retouches du 26/10/2026 (demandes de Dr Bentahila) : colonne Patient (plus de « Prochain rendez-vous » ; rendez-vous et historique sur une ligne,
# carte complète au centre ; « + » bleu au lieu du crayon des informations médicales ; titre › sous-titre › texte sans gras) ; titre d'une
# consultation ouverte collé au motif ; agenda sur une ligne, grille jusqu'en bas de l'écran ; Calendrier de la salle d'attente ; écart des blocs
# de la page Tâches ; « + Nouveau schéma » sur la ligne des onglets de Radiothérapie ; traitements courants (fichier de Dr Bentahila). Jeu fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
P0 = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3]
pid = P0[0]
def jeu():
    s = json.loads(json.dumps(S)); k = E + 'patients/' + pid
    rd = json.loads(s[k].get('rdvsJson') or '[]')
    rd += [{'id': 'rR' + str(i), 'type': 'Suivi', 'd': '2026-10-%02d' % (10 + i), 'h': '09:%02d' % (10 * i), 'st': 'prevu', 'mo': 'Motif assez long pour être coupé à la largeur de la colonne'} for i in range(1, 5)]
    s[k]['rdvsJson'] = json.dumps(rd)
    s[k]['clinique'] = dict(s[k].get('clinique') or {}, atcdMed='Diabète sucré de type 2\nHypertension artérielle — depuis 2015', allergie='non')
    s[E + 'consultations/CR1'] = {'patientId': pid, 'etablissementId': s[k].get('etablissementId', 'HGC'), 'd': '2026-10-05', 'type': 'Consultation de chimiothérapie', 'titre': 'J15C1 Taxol hebdo', 'note': 'Bonne tolérance.', 'lignes': [], 'o': 1, 'creePar': 'UIDRITA', 'creeParNom': 'Dr TEST'}
    return s
LARGE = "document.documentElement.scrollWidth > innerWidth + 1"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); s = jeu()
        for w in (1440, 390):
            print('Dossier (' + str(w) + ' px)')
            pg = await ouvrir(b, s, w=w, h=900 if w > 500 else 844); ev = pg.evaluate
            await pg.add_init_script("try{localStorage.setItem('onco360.dossierParties',JSON.stringify({avenir:true,med:true,passe:true}))}catch(e){}")
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3000)
            if w < 500: await ev("ongletDossier('" + pid + "','pat')"); await pg.wait_for_timeout(500)
            ok(not await ev("!!document.querySelector('.dp-proch')") and 'PROCHAIN RENDEZ-VOUS' not in (await ev("document.querySelector('.dos-pat').innerText")).upper(), 'plus de « Prochain rendez-vous »')
            L = await ev("[...document.querySelectorAll('#rdvListe .rc')].map(e=>({rl:e.classList.contains('rl'),h:Math.round(e.getBoundingClientRect().height),t:e.innerText.replace(/\\n/g,' ')}))")
            ok(len(L) >= 3 and all(x['rl'] and x['h'] <= 46 for x in L), 'à venir : une ligne par rendez-vous (hauteur ≤ 46 px)', L[:3])
            ok(any(x['t'].startswith('Lun. 12/10 · 09:20') or 'Suivi' in x['t'] for x in L) and all(':' in x['t'] or '/' in x['t'] for x in L), 'ligne = « Jour jj/mm · hh:mm », puis le nom court (Suivi, Séance chimio…)', [x['t'] for x in L][:3])
            pa = await ev("[...document.querySelectorAll('.dp[data-p=passe] .rc')].map(e=>e.classList.contains('rl'))")
            ok(len(pa) == 0 or all(pa), 'Historique des RDV : une ligne par rendez-vous', pa)
            ok(not await ev(LARGE), 'rien ne déborde')
            # informations médicales : « + » bleu (pas de crayon), fenêtre avec une ligne vide en plus
            pl = await ev("(()=>{const b=document.querySelector('.im-s[data-im=atcdMed] .im-ajt');return b?{c:getComputedStyle(b).color,u:b.querySelector('use').getAttribute('href')}:null})()")
            ok(pl and pl['u'] == '#i-plus' and pl['c'] == 'rgb(53, 99, 176)' and not await ev("!!document.querySelector('.im-s use[href=\"#i-crayon\"]')"), 'informations médicales remplies : « + » bleu à la place du crayon', pl)
            fw = await ev("getComputedStyle(document.querySelector('.im-s[data-im=atcdMed] li span')).fontWeight")
            tl = await ev("[parseFloat(getComputedStyle(document.querySelector('.dp[data-p=med] .dp-t')).fontSize),parseFloat(getComputedStyle(document.querySelector('.im-s[data-im=atcdMed] .im-l')).fontSize),parseFloat(getComputedStyle(document.querySelector('.im-s[data-im=atcdMed] li')).fontSize)]")
            ok(fw in ('400', 'normal') and tl[0] >= tl[1] >= tl[2], 'antécédent renseigné sans gras ; titre ≥ sous-titre ≥ texte', (fw, tl))
            await ev("document.querySelector('.im-s[data-im=atcdMed] .im-ajt').click()"); await pg.wait_for_timeout(500)
            n = await ev("[...document.querySelectorAll('#fenetreCorps .im-lib')].map(i=>i.value)")
            ok(len(n) == 3 and n[-1] == '', '« + » : les 2 antécédents notés et une ligne vide pour en ajouter', n)
            await ev("fermerFenetre()"); await pg.wait_for_timeout(300)
            # titre de la rubrique : la carte complète au centre
            await ev("document.querySelector('.dp[data-p=avenir] .dp-t').click()"); await pg.wait_for_timeout(700)
            ok(await ev("[...document.querySelectorAll('.rc-grand .rc')].length") >= 3 and not await ev("!!document.querySelector('.rc-grand .rc.rl')"), 'clic sur le titre : rendez-vous en entier au centre (cartes)')
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Consultation ouverte')
        pg = await ouvrir(b, s, w=1440); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3000)
        g = await ev("(()=>{const c=document.querySelector('.cs.on .cs-t');if(!c)return null;const a=c.querySelector('.ti').getBoundingClientRect(),t=c.querySelector('.tt').getBoundingClientRect();return [Math.round(t.left-a.right),c.querySelector('.tt').textContent]})()")
        ok(g and g[1] == 'J15C1 Taxol hebdo' and 0 <= g[0] <= 16, 'consultation ouverte : le titre reste collé au type (comme pliée)', g)
        await pg.close()
        for w in (1440, 1280, 1024, 390):
            print('Agenda (' + str(w) + ' px)')
            pg = await ouvrir(b, s, w=w, h=900 if w > 500 else 844); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(2500)
            if w >= 1280:
                t = await ev("[...document.querySelectorAll('.ag-barre > *')].map(e=>Math.round(e.getBoundingClientRect().top+e.getBoundingClientRect().height/2))")
                ok(max(t) - min(t) <= 8, 'vues, Aujourd\'hui ‹ › période, Actualiser et « + Nouveau rendez-vous » sur une ligne', t)
                ok(await ev("(()=>{const b=document.querySelector('.ag-nav b');return b.scrollWidth<=b.clientWidth+1})()"), 'période écrite en entier')
                ok(await ev("!!document.querySelector('.ag-cote .ag-fil .ag-etab')"), 'filtre établissement en tête de la colonne de gauche')
            if await ev("!!document.querySelector('.ag-grille')"):
                r = await ev("(()=>{const r=document.querySelector('.ag-grille').getBoundingClientRect();return Math.round(innerHeight-r.bottom)})()")
                ok(w < 500 or 0 <= r <= 30, 'grille jusqu\'en bas de l\'écran', r)
            ok(not await ev(LARGE), 'rien ne déborde'); ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        print('Salle d\'attente, Tâches, Radiothérapie')
        pg = await ouvrir(b, s, w=1440); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#salle'); await pg.wait_for_timeout(2500)
        ok(await ev("typeof document.getElementById('saD').onclick === 'function'"), 'Calendrier : un clic ouvre le calendrier du navigateur (showPicker)')
        await pg.click('.sa-cal'); await pg.wait_for_timeout(300); ok(not pg.errs, 'clic sur Calendrier sans erreur', pg.errs[:2])
        await pg.goto(f'http://localhost:{PORT}/v2.html#taches'); await pg.wait_for_timeout(2500)
        e = await ev("(()=>{const a=document.querySelector('.p-ta .barre-page').getBoundingClientRect(),f=document.querySelector('.p-ta .ta-filtres').getBoundingClientRect(),c=document.querySelector('.p-ta > .carte').getBoundingClientRect();return [Math.round(f.top-a.bottom),Math.round(c.top-f.bottom)]})()")
        ok(e[0] >= 14 and e[1] >= 14, 'Tâches : les blocs ne sont plus collés (≥ 14 px)', e)
        await pg.goto(f'http://localhost:{PORT}/v2.html#radiotherapie'); await pg.wait_for_timeout(2500)
        r = await ev("(()=>{const n=document.querySelector('.rtr-tete > .rtr-nouv'),o=document.querySelector('.rtr-tete .rtr-sous');if(!n||!o)return null;const a=n.getBoundingClientRect(),b=o.getBoundingClientRect();return [n.className,Math.round(Math.abs((a.top+a.bottom)/2-(b.top+b.bottom)/2))]})()")
        ok(r and 'b1' in r[0].split() and r[1] <= 8, '« + Nouveau schéma » sur la ligne des onglets, bouton principal comme « + Créer un protocole »', r)
        ok(not await ev("!!document.querySelector('.rtr-mz .rtr-nouv')"), 'plus de « Nouveau schéma » dans les filtres')
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev("imOuvrir('" + pid + "','traitCours',true)"); await pg.wait_for_timeout(400)
        dl = await ev("(async()=>{const m=await import('./js/app/infosmed.js');return m.listeMed('traitCours')})()")
        ok('DOLIPRANE (paracétamol)' in dl and 'ADVIL (ibuprofène)' in dl and 'BUFREN (ibuprofène)' in dl and not any(' mg' in x for x in dl if x.startswith('DOLIPRANE')), 'traitements en cours : noms commerciaux (molécule) du fichier, sans dose', [x for x in dl if x.startswith(('DOLI', 'ADV', 'BUF'))])
        ok(len(dl) == len(set(x.lower() for x in dl)), 'aucun doublon dans la liste')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
