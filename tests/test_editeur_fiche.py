import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 12/10/2026 : Paramètres › Cabinet › Fiche patient à jour (trois parties, champs de la fiche tumeur renommables, listes modifiables, champ
# ajouté dans la fiche tumeur, plus de « nom d'origine » ni « ajouté ») ; chimio (3.7) : cure d'un seul jour ouverte directement, un bouton
# principal + menu ⋯, plus de titre « Ligne n — protocole » en double, heure à côté de la date prévue.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Paramètres › Cabinet › Fiche patient')
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/fiche'); await pg.wait_for_timeout(2000)
        t = await pg.inner_text('#page')
        ok([h for h in await ev("[...document.querySelectorAll('.edf h4, .fiche-b h4')].map(h=>h.textContent)") if h] == ['Identité', 'Informations médicales', 'Fiche tumeur'], 'trois parties : Identité, Informations médicales, Fiche tumeur', await ev("[...document.querySelectorAll('.fiche-b h4')].map(h=>h.textContent)"))
        ok("nom d'origine" not in t and 'ajouté (' not in t, 'plus de « nom d\'origine » ni « ajouté »')
        ordre = await ev("(()=>{const h=[...document.querySelectorAll('.fiche-b h4')].find(x=>x.textContent==='Fiche tumeur');const l=[];let e=h.nextElementSibling;while(e&&e.tagName!=='H4'){l.push(e.querySelector('.rg-t').firstChild.textContent.trim());e=e.nextElementSibling}return l.slice(0,6)})()")
        ok(ordre[:5] == ['Localisation', 'Côté', 'Stade', 'Précision', 'Histologie'], 'fiche tumeur dans l\'ordre (localisation, côté, stade, précision, histologie…)', ordre)
        med = await ev("(()=>{const h=[...document.querySelectorAll('.fiche-b h4')].find(x=>x.textContent==='Informations médicales');const e=h.nextElementSibling;return e.querySelector('.rg-t').firstChild.textContent.trim()})()")
        ok(med == 'État général (OMS)', 'informations médicales : OMS en premier', med)
        ok(await ev("!!document.querySelector('.fiche-b [data-cha=\"xthisto\"]') && !!document.querySelector('.fiche-b [data-cha=\"xtre\"]')"), 'champs de la fiche tumeur modifiables (✎)')
        await ev("document.querySelector('.fiche-b [data-cha=\"xthisto\"]').click()"); await pg.wait_for_timeout(200)
        await pg.fill('#chNomA', 'Type histologique'); await ev("document.getElementById('chAOk').click()"); await pg.wait_for_timeout(200)
        await ev("document.querySelector('.fiche-b [data-cha=\"xtre\"]').click()"); await pg.wait_for_timeout(200)
        ok(await ev("!!document.getElementById('chListe')"), 'liste de choix des biomarqueurs modifiable')
        await pg.fill('#chListe', 'Positif\nNégatif\nFaiblement positif\nNon fait'); await ev("document.getElementById('chAOk').click()"); await pg.wait_for_timeout(200)
        await ev("document.querySelector('.fiche-b [data-cha=\"xtstade\"]').click()"); await pg.wait_for_timeout(200)
        ok(not await ev("!!document.getElementById('chListe')"), 'stade : liste réglée dans Paramètres › Listes (pas ici)')
        await ev("document.getElementById('chAnn').click()"); await pg.wait_for_timeout(200)
        await ev("document.getElementById('chNouv').click()"); await pg.wait_for_timeout(200)
        ok(await ev("[...document.getElementById('chPartie').options].map(o=>o.textContent).join()") == 'Identité,Informations médicales,Fiche tumeur', 'nouveau champ : Identité, Informations médicales ou Fiche tumeur')
        await pg.fill('#chLib', 'Score de Gleason'); await pg.select_option('#chPartie', 'tumeur'); await ev("document.getElementById('chOk').click()"); await pg.wait_for_timeout(200)
        await ev("cfEnregistrer()"); await pg.wait_for_timeout(1500)
        fo = json.loads((await ev("window.__fs")).get(E + 'parametres/formulaires', {}).get('data') or '{}').get('fiche', {})
        ok(fo.get('libs', {}).get('xthisto') == 'Type histologique' and 'Faiblement positif' in (fo.get('choixs', {}).get('xtre') or []), 'enregistré : nom et liste retouchés par le cabinet', fo)
        ok(any(a.get('lib') == 'Score de Gleason' and a.get('tumeur') for a in fo.get('ajouts', [])), 'champ propre au cabinet dans la fiche tumeur', fo.get('ajouts'))
        pid = [x for x, ls in lignes_de(S).items() if ls][0]
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(1500)
        await ev(f"modifierIdentite('{pid}')"); await pg.wait_for_timeout(600)
        lab = await ev("(()=>{const l=(k)=>{const e=document.querySelector('#fenetre [data-champ=\"'+k+'\"] label');return e?e.textContent:''};const g=[...document.querySelectorAll('#fenetre [data-sec=tum] label')].some(x=>/Gleason/.test(x.textContent));return {histo:l('xthisto'),gleason:g,re:[...document.getElementById('fx_xtre').options].map(o=>o.value).join()}})()")
        ok(lab['histo'].startswith('Type histologique') and lab['gleason'] and 'Faiblement positif' in lab['re'], 'fiche du patient : nom, liste et nouveau champ appliqués', lab)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Chimiothérapie : cure d\'un seul jour, bouton principal + ⋯, plus de titre en double')
        L = lignes_de(S)
        cible = [(x, i, k) for x, ls in L.items() for i, l in enumerate(ls) for k, c in enumerate(l.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and l.get('pr') and all(len(d.get('j') or [1]) == 1 and (d.get('j') or [1])[0] in (1, 99) for d in l['pr'].get('dr', []))]
        if not cible:  # cure d'un seul jour fabriquée : tous les produits à J1
            x0, i0, k0 = [(x, i, k) for x, ls in L.items() for i, l in enumerate(ls) for k, c in enumerate(l.get('cures', [])) if l.get('pr') and c.get('st', 'prevue') == 'prevue'][0]
            S1 = json.loads(json.dumps(S)); ls = json.loads(S1[E + 'patients/' + x0]['lignesJson'])
            for d in ls[i0]['pr']['dr']: d['j'] = [1]
            for c in ls[i0]['cures']: c.pop('sea', None)
            S1[E + 'patients/' + x0]['lignesJson'] = json.dumps(ls); S1[E + 'patients/' + x0]['planningJson'] = '{}'; cible = [(x0, i0, k0)]
        else: S1 = S
        pg = await ouvrir(b, S1); ev = pg.evaluate
        if cible:
            x, i, k = cible[0]
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{x}'); await pg.wait_for_timeout(2000)
            await ev(f"chOuvrir('{x}', {i}, {k})"); await pg.wait_for_timeout(800)
            t = await pg.inner_text('#fenetreCorps')
            ok('Molécules' in t and 'table' not in await ev("document.querySelector('#fenetreCorps .tsea:not(.doses)') ? 'table' : ''"), 'cure d\'un seul jour : la séance s\'ouvre directement (pas de tableau des jours)', t[:200])
            ok(await ev("[...document.querySelectorAll('#fenetreCorps button')].some(b=>b.textContent.trim()==='Fermer')"), 'bouton « Fermer » (au lieu de « Retour à la cure »)')
            await ev("fermerFenetre()")
        else:
            ok(True, '(pas de cure d\'un seul jour dans le jeu de test)')
        pid = [x for x, ls in L.items() if ls][0]
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2000)
        await ev(f"ongletDossier('{pid}','ch')"); await pg.wait_for_timeout(300)
        r = await ev("(()=>{const a=document.querySelector('#cChimio .acc.on');if(!a)return null;const tr=[...a.querySelectorAll('.tcures tr')].slice(1);return {h4:!!a.querySelector('.acc-c h4'),menuLigne:!!a.querySelector('.acc-c > .actr details.m3'),principal:tr.every(t=>t.querySelectorAll('.btns > button').length===1),menus:tr.some(t=>!!t.querySelector('details.m3')),arreter:/Arrêter la ligne/.test(a.querySelector('.acc-c > .actr details.m3 .m3-l').textContent),visible:getComputedStyle(a.querySelector('.acc-c > .actr details.m3 .m3-l')).display}})()")
        ok(r and not r['h4'], 'plus de titre « Ligne n — protocole » en double', r)
        ok(r and r['principal'] and r['menus'], 'un bouton principal par cure, le reste dans ⋯', r)
        ok(r and r['menuLigne'] and r['arreter'], '« Arrêter la ligne » et « Supprimer » dans le menu ⋯ de la ligne', r)
        ok(await ev("[...document.querySelectorAll('#cChimio .tcures td[data-l=\"Date prévue\"] button')].some(b=>/heure|🩺/.test(b.textContent))"), 'heure de la consultation à côté de la date prévue')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
