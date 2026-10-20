import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# 20/10/2026 (demande de Dr Bentahila) : dossier › Consultations et hospitalisations : Annuler le statut, Reçu, Modifier le prix, Modifier,
# Supprimer sous un bouton « ⋯ » ; actions à faire (Venu, Non venu, Encaisser, Fixer le prix) visibles. Patients fictifs. Ordinateur et 390 px.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
S2, PIDS = avec_demo(S, E); P7 = PIDS[6]
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
d7 = S2[E + 'patients/' + P7]; rd = json.loads(d7['rdvsJson'])
rd[0].update(d='2026-10-06', h='09:30', st='fait', dv='2026-10-06'); RID = rd[0]['id']
rd.append(dict(rd[0], id='rAV', d='2026-10-05', h='10:00', st='prevu')); rd[-1].pop('dv', None); d7['rdvsJson'] = json.dumps(rd)
S2[E + 'encaissements/' + P7] = {'data': json.dumps({'rdv': {RID: {'m': 400, 'mode': 'esp'}}})}
LIGNE = "(id)=>{const r=[...document.querySelectorAll('.dos-pat details[data-p=passe] .rdv')].find(e=>e.querySelector('button[onclick*=\"'+id+'\"]'));if(!r)return null;const vis=[...r.querySelectorAll('.actr > button, .actr > .mpts > button')].map(x=>x.textContent);const men=[...r.querySelectorAll('.mpts .cache button')].map(x=>x.textContent);return {vis,men}}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (1440, 390):
            print(f'Largeur {w} px')
            pg = await ouvrir(b, S2, w=w); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P7}'); await pg.wait_for_timeout(2500)
            await ev("document.querySelector('.dos-pat details[data-p=passe]').open=true"); await pg.wait_for_timeout(200)
            l = await ev(f"({LIGNE})('{RID}')")
            ok(l and l['vis'] == ['⋯'] and set(l['men']) >= {'Reçu', 'Annuler le statut', 'Modifier le prix'}, 'rendez-vous payé : seulement « ⋯ » visible ; Reçu, Modifier le prix, Annuler le statut dans le menu', l)
            l2 = await ev("({})('rAV')".format(LIGNE))
            ok(l2 and l2['vis'][:2] == ['Venu', 'Non venu'] and l2['vis'][-1] == '⋯' and l2['men'] == ['Modifier', 'Supprimer'], 'rendez-vous passé à valider : Venu / Non venu visibles, Modifier / Supprimer dans le menu', l2)
            await ev(f"(()=>{{const r=[...document.querySelectorAll('.dos-pat details[data-p=passe] .rdv')].find(e=>e.querySelector('button[onclick*=\"{RID}\"]'));r.querySelector('.sa-plus').scrollIntoView({{block:'center'}})}})()"); await pg.wait_for_timeout(300)
            await ev(f"(()=>{{const r=[...document.querySelectorAll('.dos-pat details[data-p=passe] .rdv')].find(e=>e.querySelector('button[onclick*=\"{RID}\"]'));r.querySelector('.sa-plus').click()}})()"); await pg.wait_for_timeout(200)
            m = await ev("(()=>{const f=document.getElementById('ptsMenuF');if(!f)return null;const r=f.getBoundingClientRect();return {items:[...f.querySelectorAll('button')].map(x=>x.textContent),dans:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}})()")
            ok(m and 'Reçu' in m['items'] and m['dans'], 'clic sur « ⋯ » : menu ouvert, dans l\'écran', m)
            n0 = await ev("window.__win.length")
            await ev("[...document.querySelectorAll('#ptsMenuF button')].find(x=>x.textContent==='Reçu').click()"); await pg.wait_for_timeout(1500)
            ok(await ev(f"window.__win.length > {n0}") and not await ev("!!document.getElementById('ptsMenuF')"), '« Reçu » du menu : reçu imprimé, menu fermé')
            await ev("fermerFenetre && fermerFenetre()")
            r = await ev("({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})")
            ok(r['sw'] <= r['cw'] + 1, 'aucun débordement', r)
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
