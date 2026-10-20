import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot G (19/10/2026) : sur ordinateur, la cure s'ouvre dans le panneau (#panneauCorps) ; une petite fenêtre (#fenetreCorps) passe devant
# 12/10/2026 : intention de la ligne (fenêtre après le choix du protocole ; en-tête « [Métastatique · 1re ligne] ») ; en-tête sans date en
# double ; téléphone : cures et doses en cartes ; OMS dans les informations médicales ; allergie à cocher pour les ordonnances ; rendez-vous
# automatiques décochables ; modèles des documents de radiothérapie modifiables (Bibliothèques › Courriers).
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
pid = [p for p, ls in lignes_de(S).items() if ls][0]
HOP = S[E + 'patients/' + pid].get('etablissementId') or 'HGC'
async def dossier(b, S2, w=1440):
    pg = await ouvrir(b, S2, w=w); await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500); return pg, pg.evaluate
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Nouvelle ligne : intention')
        pg, ev = await dossier(b, S)
        n0 = len(lignes_de(S)[pid])
        await ev(f"chNouvelleLigne('{pid}')"); await pg.wait_for_timeout(600)
        proto = await ev("(()=>{const e=document.querySelector('#nlL [onclick^=\"nlProto\"]');return e?e.getAttribute('onclick'):null})()")
        ok(proto is not None, 'liste des protocoles', proto)
        await ev(proto); await pg.wait_for_timeout(400)
        t = await pg.inner_text(':is(#fenetreCorps,#panneauCorps):not(:empty)')
        ok('Intention de la ligne' in t and 'Néoadjuvante' in t and 'Adjuvante' in t and 'Métastatique' in t and 'Concomitante' in t and 'Palliative' not in t, 'fenêtre intermédiaire : néoadjuvante, adjuvante, métastatique, concomitante', t[:300])
        await pg.click('#itP [data-k=meta]'); await pg.wait_for_timeout(100)
        ok(await ev("!document.getElementById('itR').classList.contains('cache')"), 'métastatique : numéro de la ligne demandé')
        await pg.select_option('#itRang', '2'); await pg.click('#fOk'); await pg.wait_for_timeout(400)
        ok('Intention : Métastatique · 2e ligne' in await pg.inner_text(':is(#fenetreCorps,#panneauCorps):not(:empty)'), 'paramètres de la ligne : intention rappelée', (await pg.inner_text(':is(#fenetreCorps,#panneauCorps):not(:empty)'))[:300])
        await ev("document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) input.req').forEach(i=>{if(!i.value){i.value=i.type==='date'?'2026-10-12':'10';i.dispatchEvent(new Event('change'))}})"); await pg.wait_for_timeout(300)
        await ev("document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) input.req').forEach(i=>{if(!i.value){i.value=i.type==='date'?'2026-10-12':'10';i.dispatchEvent(new Event('change'))}})"); await pg.wait_for_timeout(300)
        await pg.click('#fOk'); await pg.wait_for_timeout(2000)
        L = lignes_de(await ev("window.__fs"))[pid]
        ok(len(L) == n0 + 1 and L[-1].get('intent') == 'meta' and L[-1].get('rang') == 2, 'ligne créée avec son intention (métastatique, 2e ligne)', [l.get('intent') for l in L])
        await ev(f"ongletDossier('{pid}','ch')"); await pg.wait_for_timeout(400)
        ent = await ev("[...document.querySelectorAll('#cChimio .acc-t')].map(e=>e.innerText.replace(/\\n/g,' | '))")
        ok(any('[Métastatique · 2e ligne]' in e for e in ent), 'en-tête : [Métastatique · 2e ligne]', ent[-1:])
        ok(all('Protocole :' not in e for e in ent) and all(e.count('Depuis le') <= 1 for e in ent), 'en-tête raccourci, date de début une seule fois', ent)
        # modifier l'intention d'une ligne existante
        await ev(f"chIntention('{pid}', 0)"); await pg.wait_for_timeout(300); await pg.click('#itP [data-k=neo]'); await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        ok(lignes_de(await ev("window.__fs"))[pid][0].get('intent') == 'neo', 'intention modifiée après coup (néoadjuvante)')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); S2 = json.loads(json.dumps(await ev("window.__fs"))); await pg.close()

        print('Téléphone (390 px) : cures et doses en cartes')
        pg, ev = await dossier(b, S2, w=390)
        await ev(f"ongletDossier('{pid}','ch')"); await pg.wait_for_timeout(400)
        await ev(f"chTog('{pid}', 0)"); await pg.wait_for_timeout(500)
        r = await ev("(()=>{const t=document.querySelector('#cChimio .tcures.tsea');if(!t)return null;const tr=t.querySelectorAll('tr')[1];return {carte:getComputedStyle(tr).display,lbl:getComputedStyle(tr.querySelector('td'),'::before').content,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}})()")
        ok(r and r['carte'] == 'block' and 'Cure' in r['lbl'], 'tableau des cures : une carte par cure, libellés', r)
        await ev(f"chOuvrir('{pid}', 0, 0, 1)"); await pg.wait_for_timeout(1000)
        r2 = await ev("(()=>{const t=document.querySelector(':is(#fenetreCorps,#panneauCorps):not(:empty) .doses.tsea');if(!t)return null;const l=[...t.querySelectorAll('td[data-l]')].map(td=>td.dataset.l);const v=(k)=>{const td=t.querySelector('td[data-l=\"'+k+'\"]');return !!td&&td.offsetWidth>0};return {pct:v('% dose'),ret:v('Dose retenue'),sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}})()")
        ok(r2 and r2['pct'] and r2['ret'] and r2['sw'] <= r2['cw'] + 1, 'doses en cartes : « % dose » et « Dose retenue » visibles, sans débordement', r2)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Fiche : OMS dans les informations médicales')
        pg, ev = await dossier(b, S2)
        await ev(f"modifierIdentite('{pid}','med')"); await pg.wait_for_timeout(600)
        o = await ev("[...document.querySelectorAll('#fenetre [data-sec=med] > [data-champ]')].map(e=>e.dataset.champ).slice(0,3)")
        ok(o == ['xtoms', 'taille', 'poids'], 'État général (OMS) avant la taille et le poids', o)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Rendez-vous automatiques décochés : pas de consultation de fin de RT')
        S3 = json.loads(json.dumps(S2)); S3[E + 'parametres/reglages'] = {'data': json.dumps({'auto': {'rtHebdo': False, 'rtFin': False}})}
        S3[E + 'patients/' + pid]['rtsJson'] = json.dumps([]); S3[E + 'patients/' + pid]['rdvsJson'] = json.dumps([])
        pg, ev = await dossier(b, S3)
        await ev(f"ouvrirRT('{pid}')"); await pg.wait_for_timeout(400)
        await ev("(()=>{const s=document.getElementById('rActe');s.value=s.options[1].value})()"); await pg.fill('#rDose', '50'); await pg.fill('#rNb', '25'); await pg.fill('#rDeb', '2026-10-19'); await pg.select_option('#rCj', '2')
        await pg.click('#fOk'); await pg.wait_for_timeout(1500)
        rd = json.loads((await ev("window.__fs"))[E + 'patients/' + pid].get('rdvsJson') or '[]')
        ok(not any(z.get('rtfin') or z.get('rtc') for z in rd), 'ni consultation de fin, ni consultations hebdomadaires', rd)
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/rdvauto'); await pg.wait_for_timeout(1200)
        t = await pg.inner_text('#page')
        ok('Types de consultation' in t and 'Comment il est prévu' in t and await ev("[...document.querySelectorAll('.ty-n')].some(i=>i.value==='Consultation de fin de radiothérapie')"), 'Paramètres › Types de consultation : rendez-vous créés d\'office (ancienne adresse rdvauto)', t[:300])
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/impression'); await pg.wait_for_timeout(1000)
        ok(await ev("[...document.querySelectorAll('#page label.chk')].some(l=>/Allergie/.test(l.textContent))"), 'Paramètres › Impression : allergie à cocher')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Modèles des documents de radiothérapie (Bibliothèques › Courriers)')
        rt = {"id": "rtM", "acte": "Sein", "hop": HOP, "deb": "2026-10-12", "nb": "25", "dose": "50", "ryt": "1", "nbA": 1, "cree": "2026-10-01"}
        S4 = json.loads(json.dumps(S2)); S4[E + 'patients/' + pid]['rtsJson'] = json.dumps([rt]); S4[E + 'patients/' + pid]['clinique'] = dict(S4[E + 'patients/' + pid].get('clinique') or {}, notes='Patiente de 52 ans, tumeur du sein gauche opérée')
        pg, ev = await dossier(b, S4)
        await ev("ordCourriersGestion ? 0 : 0") if False else None
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/bibliotheques'); await pg.wait_for_timeout(1200)
        await ev("cfBib('courriers')"); await pg.wait_for_timeout(1200)
        t = await pg.inner_text(':is(#fenetreCorps,#panneauCorps):not(:empty)')
        ok('Pli confidentiel (radiothérapie)' in t and 'Compte rendu de fin de radiothérapie' in t and 'Calendrier de fin de radiothérapie' in t, 'les trois documents dans la liste des modèles', t[:400])
        await ev("crFiche('rt-pli')"); await pg.wait_for_timeout(500)
        ok('{renseignements}' in await pg.inner_text('#crPage') and 'Renseignements cliniques' in await pg.inner_text(':is(#fenetreCorps,#panneauCorps):not(:empty)'), 'éditeur : champs du pli ({renseignements}…)')
        await ev("document.getElementById('crPage').insertAdjacentHTML('afterbegin','<p>MENTION DU CABINET</p>')"); await pg.click('#crOk'); await pg.wait_for_timeout(1500)
        L = json.loads((await ev("window.__fs")).get(E + 'bibliotheques/courriers', {}).get('data') or '[]')
        ok(any(m.get('id') == 'rt-pli' and 'MENTION DU CABINET' in m.get('html', '') for m in L), 'modèle du pli enregistré dans la bibliothèque du cabinet')
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2000)
        await ev(f"docRT('{pid}','rtM','pli')"); await pg.wait_for_timeout(1800)
        t = await ev("(document.getElementById('dcPage')||{}).innerText||''")
        ok('MENTION DU CABINET' in t and 'Patiente de 52 ans, tumeur du sein gauche opérée, nécessitant une radiothérapie' in t, 'pli ouvert avec le modèle du cabinet et le résumé du patient', t[:500])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
