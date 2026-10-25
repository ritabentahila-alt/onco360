import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 25/10/2026 (demande de Dr Bentahila) : Bilan : les consultations à 0 DH (J8 / J15 de chimio, consultation en cours ou de fin de radiothérapie…) ne
# s'affichent plus (journal, nombre de consultations, exports, relevé) ; une consultation sans tarif reste affichée ; les totaux en DH ne changent pas.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
REF = open(ICI / 'bilan_ref_fictif.txt').read()
NC = int(REF.split('Consultations – ')[1].split()[0])  # nombre de consultations du calcul (moteur, inchangé)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await ouvrir(b); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#bilan'); await pg.wait_for_timeout(3000)
        await pg.select_option('#biPer', 'annee'); await pg.wait_for_timeout(800)
        k = await ev("[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent.replace(/[\\u202f\\u00a0]/g,' '))")
        ok(REF_BILAN in k[0], 'CA NET inchangé : ' + k[0])
        nk = int(k[2].split('Consultations – ')[1])
        ok(0 < nk < NC and k[2].startswith('35 000 DH'), 'nombre de consultations sans celles à 0 DH (' + str(nk) + ' au lieu de ' + str(NC) + '), montant inchangé', k[2])
        z = await ev("[...document.querySelectorAll('table.bilan tr')].filter(r => r.children.length === 9 && r.children[0].tagName === 'TD' && /^0 DH$/.test(r.children[5].textContent.trim()) && !/séance|Radioth|Hospit/i.test(r.children[3].textContent)).length")
        ok(z == 0, 'journal : aucune consultation à 0 DH', z)
        h = await ev("[...document.querySelectorAll('#page h3')].map(h=>h.textContent).find(t=>/Journal/.test(t))")
        n = await ev("[...document.querySelectorAll('table.bilan')].find(t=>/Acte \\/ prestation/.test(t.textContent)).querySelectorAll('tr:not(.tot)').length - 1")
        ok(h == 'Journal détaillé (' + str(n) + ' actes)', 'titre du journal : le nombre de lignes affichées', (h, n))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        # Une consultation mise à 0 DH disparaît ; son prix changé ensuite à 100 DH : elle réapparaît (bilan recalculé à chaque ouverture)
        s = json.loads(json.dumps(S))
        def cible():  # consultation de chimio J1 payée, d'une cure reçue en 2026 (période « Cette année »)
            for k in s:
                if not k.startswith(E + 'patientsFinances/'): continue
                mm = json.loads(s[k].get('montantsJson') or '{}'); lg = {l['id']: l for l in json.loads(s[E + 'patients/' + k.split('/')[-1]].get('lignesJson') or '[]')}
                for L, cs in (mm.get('cures') or {}).items():
                    for n, c in cs.items():
                        cu = (lg.get(L, {}).get('cures') or [])
                        if (c.get('consJ') or {}).get('1') and int(n) <= len(cu) and str((cu[int(n) - 1] or {}).get('reelle') or '').startswith('2026'): return k, mm, L, n
        kf, m, L, n = cible(); m['cures'][L][n]['consJ']['1'] = 0; s[kf]['montantsJson'] = json.dumps(m)
        pid = kf.split('/')[-1]; nm = s[E + 'patients/' + pid]['identite']['nom']
        pg = await ouvrir(b, s); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#bilan'); await pg.wait_for_timeout(3000); await pg.select_option('#biPer', 'annee'); await pg.wait_for_timeout(800)
        lignes = "(nm) => [...document.querySelectorAll('table.bilan tr')].filter(r => r.children.length === 9 && r.children[0].tagName === 'TD' && r.children[1].firstChild.textContent.trim() === nm && /Consultation/i.test(r.children[3].textContent)).map(r => r.children[5].textContent.trim())"
        nb = "(() => +[...document.querySelectorAll('.kpi .k')][2].textContent.split('Consultations – ')[1])()"
        c0, l0 = await ev(nb), await ev("(" + lignes + ")(" + json.dumps(nm) + ")")
        ok('0 DH' not in l0 and c0 == nk - 1, 'consultation mise à 0 DH : pas affichée, pas comptée (' + nm + ')', (c0, nk, l0))
        m['cures'][L][n]['consJ']['1'] = 100
        await ev("window.__fs[" + json.dumps(kf) + "].montantsJson = " + json.dumps(json.dumps(m)))
        await ev("biActualiser()"); await pg.wait_for_timeout(2500); await pg.select_option('#biPer', 'annee'); await pg.wait_for_timeout(800)
        c1, l1 = await ev(nb), await ev("(" + lignes + ")(" + json.dumps(nm) + ")")
        ok(c1 == c0 + 1 and '100 DH' in l1, 'son prix changé à 100 DH : elle s\'affiche (et compte)', (c0, c1, l1))
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
