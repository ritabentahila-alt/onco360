import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot D (audit n° 6 : finances, 20/10/2026) dans le navigateur : R-D1 consultation de chimio jour par jour (J8 payé = acte à sa date),
# R-D3 transactions (montants + prix à encaisser ensemble) et taux commun
# de la radiothérapie (écrit une fois : 60 % / 10 %, bilan inchangé), R-D4 cases « Payé » rangées par année ; ordinateur et 390 px.
ok = lambda c, m: print(('✅ ' if c else '❌ ') + m)
PID, LID = 'PTESS', 'LESS'  # cure C1 validée avec une séance J8 le 10/09/2026 (jeu de test)
RG = [{'id': 'rg1', 'd': '2026-09-15', 'hop': 'HCK', 'mode': 'vir', 'm': 5000, 'ref': 'V1', 'per': 'août', 'par': 'x', 'parNom': 'x', 'le': 1},
      {'id': 'rg2', 'd': '2026-09-20', 'hop': 'HCK', 'mode': 'chq', 'm': 1000, 'ref': 'C1', 'per': 'août', 'par': 'x', 'parNom': 'x', 'le': 2}]
kpi = "[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent.replace(/[\\u202f\\u00a0]/g,' '))"
sp = lambda t: t.replace('\u202f', ' ').replace('\xa0', ' ')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        seed = dict(S); seed[E + 'finances/reglements'] = {'data': json.dumps(RG)}
        pg = await ouvrir(b, seed)
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(3000)
        fs = await pg.evaluate("window.__fs")
        T = json.loads(fs[E + 'finances/tarifs']['data'])
        ok(T.get('tauxRT') == {'retro': 60, 'impot': 10} and fs[E + 'parametres/migrations'].get('tauxRT'), 'taux commun de la radiothérapie écrit une fois : 60 % / 10 %')
        await pg.evaluate("location.hash='bilan'"); await pg.wait_for_timeout(1500)
        await pg.select_option('#biPer', 'annee'); await pg.wait_for_timeout(500)
        k0 = await pg.evaluate(kpi)
        ok(REF_BILAN in k0[0], 'bilan de l\'année inchangé : ' + k0[0])
        fs = await pg.evaluate("window.__fs")
        docs = sorted(k.split('/')[-1] for k in fs if '/finances/paiements' in k)
        n26 = len(json.loads(fs[E + 'finances/paiements_2026']['data'])); nV = len(json.loads(fs[E + 'finances/paiements']['data']))
        ok('paiements_2026' in docs and n26 > 0, 'cases « Payé » rangées par année : ' + ', '.join(docs) + ' (2026 : ' + str(n26) + ', anciennes clés introuvables gardées : ' + str(nV) + ')')
        ok(n26 + nV == len(json.loads(S[E + 'finances/paiements']['data'])), 'aucune case perdue ni en double (' + str(n26 + nV) + ')')
        # Cocher puis décocher « Payé » : dans le document de l'année de l'acte
        await pg.select_option('#biPay', 'att'); await pg.wait_for_timeout(400)
        i0 = await pg.evaluate("[...document.querySelectorAll('[onclick^=biPaye]')].findIndex(b=>b.textContent==='Payé')")
        cle = await pg.evaluate(f"(()=>{{const b=[...document.querySelectorAll('[onclick^=biPaye]')][{i0}];return b.closest('tr').children[0].textContent}})()")
        await pg.evaluate(f"[...document.querySelectorAll('[onclick^=biPaye]')][{i0}].click()"); await pg.wait_for_timeout(600)
        fs = await pg.evaluate("window.__fs")
        an = '20' + cle.strip()[-2:] if len(cle.strip()) <= 8 else cle.strip()[-4:]
        n2 = len(json.loads(fs[E + 'finances/paiements_' + an]['data'])) if E + 'finances/paiements_' + an in fs else 0
        ok(n2 == (n26 + 1 if an == '2026' else 1), 'case cochée rangée dans paiements_' + an + ' (acte du ' + cle.strip() + ')')
        k1 = await pg.evaluate(kpi)
        await pg.select_option('#biPay', 'paye'); await pg.wait_for_timeout(400)
        ok(k1 != k0, 'bilan « à recevoir » mis à jour après le clic')
        await pg.select_option('#biPay', 'tous'); await pg.wait_for_timeout(400)
        # 20/10/2026 : rapprochement retiré (les cliniques paient des mois après l'acte) ; explications derrière un « ? » à côté du titre
        ok(await pg.evaluate("!document.getElementById('biRap') && !/Rapprochement/.test(document.getElementById('page').innerText)"), 'plus de cadre « Rapprochement des règlements »')
        q = await pg.evaluate("(()=>{const h=[...document.querySelectorAll('#page section.carte > h3')].filter(h=>/Versements et règlements|Par établissement|Mois par mois|Référents/.test(h.textContent));return [h.length, h.filter(x=>x.querySelector('.cf-q')).length, h.filter(x=>!x.nextElementSibling.classList.contains('cache')).length]})()")
        ok(q[0] == 4 and q[1] == 4 and q[2] == 0, 'explications cachées derrière un « ? » (4 titres) ' + str(q))
        await pg.evaluate("[...document.querySelectorAll('#page section.carte > h3 .cf-q')][0].click()"); await pg.wait_for_timeout(200)
        ok(await pg.evaluate("!document.querySelector('#page section.carte > h3 + p.sous').classList.contains('cache')"), '« ? » : un clic affiche l\'explication')
        ok('Janvier à' in sp(await pg.inner_text('#page')), 'mois par mois : chiffres de l\'année toujours visibles')
        # R-D1 : consultation de chimio payée au J8 (200 DH) : un acte à sa date
        await pg.evaluate(f"location.hash='dossier/{PID}'"); await pg.wait_for_timeout(1200)
        await pg.evaluate(f"chVenuChimio('{PID}','{LID}',1,8)"); await pg.wait_for_timeout(700)
        await pg.fill('#pvM', '200'); await pg.click('#fOk'); await pg.wait_for_timeout(900)
        fs = await pg.evaluate("window.__fs")
        M = json.loads(fs[E + 'patientsFinances/' + PID]['montantsJson']); Ec = json.loads(fs[E + 'encaissements/' + PID]['data'])
        ok(M['cures'][LID]['1']['consJ'].get('8') == 200 and Ec['cons'].get(LID + '|1|8', {}).get('m') == 200, 'J8 à 200 DH : montants et prix à encaisser écrits ensemble')
        await pg.evaluate("location.hash='bilan'"); await pg.wait_for_timeout(1500)
        await pg.select_option('#biPer', 'perso'); await pg.wait_for_timeout(300)
        await pg.evaluate("biF('du','2026-09-10');biF('au','2026-09-10')"); await pg.wait_for_timeout(500)
        j = sp(await pg.inner_text('#page'))
        ok('Consultation chimio J8' in j and '200 DH' in j, 'bilan : « Consultation chimio J8 » de 200 DH le 10/09/2026')
        # Taux commun dans Paramètres
        await pg.evaluate("location.hash='parametres/activites'"); await pg.wait_for_timeout(1000)
        ok(await pg.evaluate("document.getElementById('paTrR') && document.getElementById('paTrR').value==='60' && document.getElementById('paTrI').value==='10'"), 'Paramètres : taux commun de la radiothérapie 60 % / 10 % affiché')
        await pg.fill('#paTrR', '55'); await pg.dispatch_event('#paTrR', 'change'); await pg.click('#paOk'); await pg.wait_for_timeout(700)
        T = json.loads((await pg.evaluate("window.__fs"))[E + 'finances/tarifs']['data'])
        ok(T.get('tauxRT', {}).get('retro') == 55 and T['tauxRT'].get('impot') == 10, 'taux commun modifié et enregistré (55 % / 10 %)')
        # 390 px
        await pg.set_viewport_size({'width': 390, 'height': 800})
        for h in ['bilan', 'parametres/activites']:
            await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(1200)
            ok(await pg.evaluate("document.documentElement.scrollWidth<=390"), '390 px : ' + h + ' sans débordement')
        ok(not pg.errs, 'aucune erreur JavaScript ' + str(pg.errs[:2]))
        await b.close()
asyncio.run(main())
