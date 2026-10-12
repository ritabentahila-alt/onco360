import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Vigilance par molécule (12/10/2026) : examens du bilan du jour proposés selon les molécules, encart « Vigilance » de la séance,
# fenêtre de confirmation à la validation, vigilances gardées avec la séance figée, rubrique Paramètres › Vigilance des molécules.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
cible = [(pid, i, k) for pid, ls in lignes_de(S).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and (k == 0 or L['cures'][k - 1].get('st') == 'recue') and L.get('pr')]
pid, i, k = cible[0]
def seed(f):
    S2 = json.loads(json.dumps(S)); ls = json.loads(S2[E + 'patients/' + pid]['lignesJson']); f(ls[i]); S2[E + 'patients/' + pid]['lignesJson'] = json.dumps(ls); return S2
def her_doc(L):
    L['pr']['dr'] += [{'id': 'zh', 'p': 'HERCEPTIN (trastuzumab)', 'd': 6, 'u': 'mg/kg', 'j': [1]}, {'id': 'zd', 'p': 'DOCÉTAXEL', 'd': 75, 'u': 'mg/m²', 'j': [1]}, {'id': 'zx', 'p': 'ÉPIRUBICINE', 'd': 90, 'u': 'mg/m²', 'j': [1]}]
S2 = seed(her_doc)
async def ouvrir_cure(b, S0, w=1440):
    pg = await ouvrir(b, S0, w=w); ev = pg.evaluate
    await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
    await ev(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1200)
    return pg, ev
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Séance avec trastuzumab, docétaxel et épirubicine')
        pg, ev = await ouvrir_cure(b, S2)
        vis = await ev("(()=>{const v=(id)=>{const e=document.getElementById(id);return !!e&&!e.closest('.cache')};return {fevg:v('bx_fevg'),bili:v('bx_bili'),asat:v('bx_asat'),tsh:v('bx_tsh'),tshExiste:!!document.getElementById('bx_tsh')}})()")
        ok(vis['fevg'] and vis['bili'] and vis['asat'] and not vis['tsh'] and vis['tshExiste'], 'examens proposés (FEVG, bilirubine, ASAT) ; TSH derrière « + autres examens »', vis)
        t = await pg.inner_text('#fenetreCorps')
        ok('Vigilance' in t and 'vésicant' in t and 'ÉPIRUBICINE' in t, 'encart « Vigilance » : produit vésicant', t[t.find('Vigilance'):t.find('Vigilance') + 300])
        ok("Dose cumulée d'anthracyclines" in t, 'dose cumulée d\'anthracyclines affichée', t[t.find('Vigilance'):t.find('Vigilance') + 300])
        ok('À vérifier pour' in t and 'Anti-HER2' in t and 'Taxanes' in t, 'notes « À vérifier » des molécules du jour', t[t.find('À vérifier'):t.find('À vérifier') + 120])
        ordre = await ev("(()=>{const t=document.getElementById('fenetreCorps').innerHTML;return [t.indexOf('bio-j'),t.indexOf('<b>Vigilance</b>'),t.indexOf('<b>Molécules</b>')]})()")
        ok(0 < ordre[0] < ordre[1] < ordre[2], 'encart entre le bilan du jour et « Molécules »', ordre)
        await pg.fill('#bx_fevg', '45'); await pg.fill('#bx_bili', '15')
        await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2000)
        d = '\n'.join(pg.dlg)
        ok('Vigilance par molécule' in d and 'moins de 50 %' in d and 'DOCÉTAXEL : bilirubine' in d and 'Valider quand même' in d, 'fenêtre : FEVG < 50 %, bilirubine sous docétaxel', pg.dlg)
        c = lignes_de(await ev("window.__fs"))[pid][i]['cures'][k]
        f = c.get('fige') or {}
        ok(c.get('st') == 'recue' and f.get('bio', {}).get('fevg') == 45 and f.get('bio', {}).get('bili') == 15, 'après confirmation : séance validée, FEVG et bilirubine gardées', f.get('bio'))
        ok(any('moins de 50' in v for v in f.get('vig', [])), 'vigilances confirmées gardées avec la séance figée', f.get('vig'))
        await ev(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1200)
        t = await pg.inner_text('#fenetreCorps')
        ok('45 %' in t and 'Vigilances confirmées à la validation' in t, 'séance validée rouverte : FEVG affichée et vigilances confirmées', t[t.find('Bilan'):t.find('Bilan') + 400])
        rouge = await ev("[...document.querySelectorAll('#fenetreCorps .bio-j div')].some(e=>e.textContent.trim()==='45 %'&&/rouge/.test(e.getAttribute('style')||''))")
        ok(rouge, 'FEVG à 45 % en rouge')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Refus dans la fenêtre : rien n\'est validé')
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev("window.confirm=()=>false")
        await ev(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1200)
        await pg.fill('#bx_fevg', '45')
        await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(1500)
        c = lignes_de(await ev("window.__fs"))[pid][i]['cures'][k]
        ok(c.get('st', 'prevue') == 'prevue', 'séance restée à valider')
        ok(await ev("(document.getElementById('bx_fevg')||{}).value") == '45', 'FEVG saisie gardée à l\'écran')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Téléphone (390 px)')
        pg, ev = await ouvrir_cure(b, S2, w=390)
        lg = await ev("(()=>{const f=document.getElementById('fenetreCorps');return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,f:f.scrollWidth-f.clientWidth}})()")
        ok(lg['sw'] <= lg['cw'] + 1 and lg['f'] <= 1, 'pas de débordement horizontal', lg)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Paramètres › Vigilance des molécules')
        pg = await ouvrir(b, S); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/vigilances'); await pg.wait_for_timeout(2500)
        t = await pg.inner_text('#page')
        ok('Vigilance des molécules' in t and 'Anti-HER2' in (await ev("document.getElementById('page').innerHTML")), 'rubrique affichée avec la liste de départ', t[:200])
        await ev("vgCh(1,'txt','FEVG tous les 3 mois (note du cabinet)')"); await ev("vgEnregistrer()"); await pg.wait_for_timeout(1500)
        doc = (await ev("window.__fs")).get(E + 'parametres/vigilances')
        ok(doc and 'note du cabinet' in doc.get('data', ''), 'notes enregistrées dans parametres/vigilances', doc)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Fiche de chimiothérapie : mention « vésicant »')
        pg, ev = await ouvrir_cure(b, S2)
        await ev("window.__imp=null; window.open=()=>({document:{open(){},write(x){window.__imp=x},close(){}},focus(){},print(){}})")
        await ev(f"chFiche('{pid}', {i}, {k})"); await pg.wait_for_timeout(1500)
        imp = await ev("window.__imp||''")
        ok('ÉPIRUBICINE<br><b>vésicant</b>' in imp and 'DOCÉTAXEL<br><b>vésicant' not in imp, 'épirubicine marquée vésicante, pas le docétaxel', imp[imp.find('ÉPIRUBICINE') - 20:imp.find('ÉPIRUBICINE') + 60] if imp else 'pas d\'impression')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
