import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Agenda et rendez-vous (étape 21, audit externe du 11/10/2026), avec le faux Firebase :
#  1. AG1 téléphone : vue Jour à l'ouverture (Semaine sur ordinateur) ;
#  2. AG2 durée par type de consultation : hauteur dans la grille, créneaux, double réservation, durée notée, Paramètres › Horaires ;
#  3. secrétaire : règle les durées ;  4. AG3 glisser-déposer : repère, confirmation, historique, créneau pris ;
#  5. AG4 médecin du rendez-vous : filtre, côte à côte, créneaux par médecin, médecin noté (et dans le résumé pour Google) ;
#  6. AG5 heure des séances de chimio et du scanner : fenêtre, glisser depuis « Journée », Google, droits ;
#  et aucune erreur JavaScript.
T = '2026-10-06'  # mardi
S2 = json.loads(json.dumps(S))
def ajout(pid, rdvs):
    R = json.loads(S2[E+'patients/'+pid].get('rdvsJson') or '[]'); R += rdvs; S2[E+'patients/'+pid]['rdvsJson'] = json.dumps(R)
A1, A2, A3 = 'P1790155538558', 'P1790335106635', 'P1790510177539'
ajout(A1, [{"id":"rG1","type":"Annonce","d":T,"h":"10:00","st":"prevu"}])
ajout(A2, [{"id":"rG2","type":"Suivi","d":T,"h":"11:00","st":"prevu","du":20}])
cal = json.loads(S2[E+'parametres/calendrier']['data']); cal['durees'] = {"s:Annonce": 45}; S2[E+'parametres/calendrier']['data'] = json.dumps(cal)
S2[E+'membres/SEC'] = {"role":"assistante","nom":"SEC","email":"sec@test.ma","actif":True,"tousEtablissements":False,"etablissements":["HGC"],"droits":{}}
S2['utilisateurs/SEC'] = {"nom":"SEC","prenom":"Test"}
U = 'http://localhost:8767/v2.html'
ok = ko = 0
def verif(nom, cond, detail=None):
    global ok, ko
    if cond: ok += 1; print('  ✔', nom)
    else: ko += 1; print('  ✘', nom, '' if detail is None else '→ ' + str(detail)[:300])
async def rdvs(pg, pid): return json.loads(await pg.evaluate(f"window.__fs['{E}patients/{pid}'].rdvsJson"))

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('1. Téléphone (AG1)')
        pg = await ouvrir(b, S2, w=390, h=800, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000); assert await ev("!!document.querySelector('.ag-vues button.on')"), pg.errs
        verif('390 px : vue Jour à l\'ouverture', await ev("document.querySelector('.ag-vues button.on').innerText.trim()") == 'Jour')
        verif('390 px : une seule colonne de jour', await ev("document.querySelectorAll('.ag-g .col').length") == 1)
        verif('390 px : rien ne déborde', await ev("document.documentElement.scrollWidth <= 390"), await ev("document.documentElement.scrollWidth"))
        verif('aucune erreur JavaScript (téléphone)', not pg.errs, pg.errs); await pg.close()

        print('2. Durée par type (AG2)')
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000); assert await ev("!!document.querySelector('.ag-vues button.on')"), pg.errs
        verif('ordinateur : vue Semaine à l\'ouverture', await ev("document.querySelector('.ag-vues button.on').innerText.trim()") == 'Semaine')
        await ev("agVue('jour')"); await pg.wait_for_timeout(300)
        hauteur = lambda txt: ev(f"(()=>{{const e=[...document.querySelectorAll('.ev-g')].find(x=>x.innerText.includes('{txt}'));return e?e.getBoundingClientRect().height:0}})()")
        verif('Annonce sans durée notée : 45 min (type) → 64 px', abs(await hauteur('10:00') - 64) < 1, await hauteur('10:00'))
        verif('Suivi avec durée notée 20 min → 27 px', abs(await hauteur('11:00') - 27.33) < 1, await hauteur('11:00'))
        # nouveau rendez-vous de suivi (pas du lieu 30 min) pour un 3e patient
        await ev(f"ouvrirRdv('{A3}', null, {{d:'{T}', h:''}})"); await pg.wait_for_timeout(400)
        verif('fenêtre : durée du type Suivi = pas du lieu (30 min)', await ev("document.getElementById('fDu').value") == '30')
        pris = await ev("[...document.querySelectorAll('#fCr .cr.pris')].map(e=>e.firstChild.textContent)")
        verif('créneaux pris : 09:30 et 10:00 (Annonce de 45 min), 10:30 (fin à 10:45), 11:00', pris == ['09:30', '10:00', '10:30', '11:00'] or pris == ['10:00', '10:30', '11:00'], pris)
        verif('11:30 libre (Suivi de 20 min fini à 11:20)', await ev("!!document.querySelector('#fCr button.cr[data-h=\"11:30\"]')"))
        await ev("document.getElementById('fType').value='s:Annonce'; document.getElementById('fType').dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(200)
        verif('type Annonce choisi : durée 45 min', await ev("document.getElementById('fDu').value") == '45')
        verif('fin de journée : dernier créneau d\'Annonce à 17:00 (45 min avant 18:00)', await ev("[...document.querySelectorAll('#fCr .cr')].map(e=>e.dataset.h||e.firstChild.textContent).pop()") == '17:00')
        await ev("document.getElementById('fH').value='10:30'; document.getElementById('fH').dispatchEvent(new Event('change'))")
        pg.dlg.clear(); await pg.click('#fOk'); await pg.wait_for_timeout(800)
        verif('double réservation signalée (10:30 touche l\'Annonce de 10:00, 45 min)', any('il y a déjà' in m for m in pg.dlg), pg.dlg)
        r = [x for x in await rdvs(pg, A3) if x.get('d') == T and x.get('h') == '10:30']
        verif('durée notée sur le rendez-vous (du = 45)', r and r[0].get('du') == 45, r)
        # Paramètres › Horaires : durée du Suivi
        await pg.goto(U+'#parametres/types'); await pg.wait_for_timeout(1200)  # 3.13 : durée réglée avec le type de consultation
        verif('Paramètres › Types de consultation : durée de chaque type', await ev("document.body.innerText.includes('Types de consultation') && !!document.querySelector('select[aria-label=\"Durée : Consultation de suivi\"]')"))
        await pg.select_option('select[aria-label="Durée : Consultation de suivi"]', '20'); await pg.wait_for_timeout(200)
        await pg.click('#cfOk'); await pg.wait_for_timeout(1000)
        verif('durée enregistrée dans parametres/calendrier', json.loads(await ev(f"window.__fs['{E}parametres/calendrier'].data")).get('durees') == {"s:Annonce": 45, "s:Suivi": 20})
        verif('aucune erreur JavaScript', not pg.errs, pg.errs); await pg.close()

        print('3. Secrétaire : règle la durée')
        pg = await ouvrir(b, S2, t=T+"T08:00:00", ); ev = pg.evaluate
        await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(U+'#parametres/types'); await pg.wait_for_timeout(1500)
        verif('secrétaire : liste des durées modifiable', await ev("(()=>{const s=document.querySelector('select[aria-label=\"Durée : Consultation de suivi\"]');return !!s && !s.disabled})()"))
        verif('aucune erreur JavaScript (secrétaire)', not pg.errs, pg.errs); await pg.close()
        print('4. Glisser-déposer (AG3)')
        pg = await ouvrir(b, S2, h=1400, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000); await ev("agVue('jour')"); await pg.wait_for_timeout(300)
        verif('consultation prévue glissable', await ev("document.querySelectorAll('.ev-g.dep[draggable]').length") >= 2)
        src = pg.locator('.ev-g', has_text='11:00').first; bb = await src.bounding_box()
        await ev("document.querySelector('.ag-grille').style.maxHeight='none'"); bb = await src.bounding_box()
        col = await ev("(()=>{const c=document.querySelector('.ag-g .col').getBoundingClientRect();return [c.x,c.y]})()")
        y1500 = col[1] + (15*60 - 7*60) / 15 * 22   # 15:00 (grille depuis 7 h, 22 px par quart d'heure)
        await pg.mouse.move(bb['x'] + 20, bb['y'] + 5); await pg.mouse.down()
        await pg.mouse.move(bb['x'] + 30, bb['y'] + 40, steps=4); await pg.mouse.move(bb['x'] + 20, y1500 + 5, steps=8)
        verif('repère du créneau visé : 15:00 – 15:20', (await ev("(document.querySelector('.ag-cible')||{}).textContent")) == '15:00 – 15:20', await ev("(document.querySelector('.ag-cible')||{}).textContent"))
        await pg.mouse.up(); await pg.wait_for_timeout(400)
        verif('fenêtre de confirmation : ancien et nouvel horaire', 'au Mardi 6 octobre à 15:00' in await ev("document.querySelector('.dep-de')?.innerText||''"), await ev("document.querySelector('.dep-de')?.innerText||''"))
        verif('rien n\'est enregistré avant la confirmation', [x for x in await rdvs(pg, A2) if x['id'] == 'rG2'][0]['h'] == '11:00')
        await pg.click('#fOk'); await pg.wait_for_timeout(800)
        r = [x for x in await rdvs(pg, A2) if x['id'] == 'rG2'][0]
        verif('déplacé à 15:00, ancien horaire gardé (rep), durée gardée', r['h'] == '15:00' and r['d'] == T and r.get('rep', [{}])[-1].get('h') == '11:00' and r.get('du') == 20, r)
        verif('grille redessinée : le rendez-vous est à 15:00', await ev("[...document.querySelectorAll('.ev-g')].some(e=>e.innerText.startsWith('15:00'))"))
        # vers un créneau déjà pris (Annonce de 10:00, 45 min) → avertissement
        await ev("agVue('semaine')"); await pg.wait_for_timeout(300)
        verif('vue Semaine : glissable aussi', await ev("document.querySelectorAll('.ev-g.dep[draggable]').length") >= 2)
        await ev("agVue('jour')"); await pg.wait_for_timeout(300)
        await ev("document.querySelector('.ag-grille').style.maxHeight='none'"); src = pg.locator('.ev-g', has_text='15:00').first; bb = await src.bounding_box()
        col = await ev("(()=>{const c=document.querySelector('.ag-g .col').getBoundingClientRect();return [c.x,c.y]})()")
        y1015 = col[1] + (10*60 + 15 - 7*60) / 15 * 22
        await pg.mouse.move(bb['x'] + 20, bb['y'] + 5); await pg.mouse.down(); await pg.mouse.move(bb['x'] + 25, bb['y'] - 30, steps=4); await pg.mouse.move(bb['x'] + 20, y1015 + 5, steps=8); await pg.mouse.up(); await pg.wait_for_timeout(400)
        verif('créneau pris : avertissement « Déjà prévu » et « Déplacer quand même »', 'Déjà prévu' in await ev("document.getElementById('fen')?.innerText||document.body.innerText") and await ev("document.getElementById('fOk').innerText") == 'Déplacer quand même')
        await ev("fermerFenetre()")
        verif('hospitalisation et rendez-vous passés non glissables', await ev("[...document.querySelectorAll('.ev-g.dep')].every(e=>!e.classList.contains('fait'))"))
        verif('aucune erreur JavaScript (glisser)', not pg.errs, pg.errs); await pg.close()
        print('5. Médecin du rendez-vous (AG4)')
        S5 = json.loads(json.dumps(S2))
        S5[E+'membres/MED2'] = {"role":"medecin","nom":"Dr Second","email":"med2@test.ma","actif":True,"tousEtablissements":True,"etablissements":["HGC","HCK","CIOC"],"droits":{"rendezvous":True,"parametres":False}}
        S5['utilisateurs/MED2'] = {"nom":"Second","prenom":"Ali"}
        R3 = json.loads(S5[E+'patients/'+A3].get('rdvsJson') or '[]'); R3.append({"id":"rG3","type":"Suivi","d":T,"h":"10:00","st":"prevu","du":30,"med":"MED2"}); S5[E+'patients/'+A3]['rdvsJson'] = json.dumps(R3)
        pg = await ouvrir(b, S5, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000); await ev("agVue('jour')"); await pg.wait_for_timeout(300)
        verif('2 médecins : filtre « Médecin » affiché', await ev("!!document.getElementById('agMed')"))
        verif('médecin titulaire : son agenda d\'abord (anciens rendez-vous sans médecin compris)', await ev("document.getElementById('agMed').value") == 'UIDRITA' and await ev("[...document.querySelectorAll('.ev-g')].map(e=>e.innerText.slice(0,5)).sort().join()") == '10:00,11:00', await ev("[...document.querySelectorAll('.ev-g')].map(e=>e.innerText.slice(0,5)).join()"))
        await pg.select_option('#agMed', ''); await pg.wait_for_timeout(300)
        verif('tous les médecins : rendez-vous côte à côte à 10:00, nom du médecin', await ev("document.querySelectorAll('.ev-g.part').length") == 2 and await ev("document.body.innerText.includes('· Dr Second')"))
        await pg.select_option('#agMed', 'MED2'); await pg.wait_for_timeout(300)
        verif('filtre Dr Second : seulement son rendez-vous', await ev("document.querySelectorAll('.ev-g').length") == 1)
        # créneau cliqué avec le filtre Dr Second : rendez-vous pour Dr Second ; 10:00 libre pour Dr Bentahila
        await ev(f"ouvrirRdv('{A2}', null, {{d:'{T}', h:'', med:'MED2'}})"); await pg.wait_for_timeout(400)
        verif('fenêtre : médecin prérempli (Dr Second)', await ev("document.getElementById('fMed').value") == 'MED2')
        verif('créneaux de Dr Second : 10:00 pris', await ev("[...document.querySelectorAll('#fCr .cr.pris')].map(e=>e.firstChild.textContent).join()") == '10:00')
        await pg.select_option('#fMed', 'UIDRITA'); await pg.wait_for_timeout(200)
        verif('créneaux de Dr Bentahila : 10:00 et 10:30 pris (Annonce 45 min), pas celui de Dr Second', await ev("[...document.querySelectorAll('#fCr .cr.pris')].map(e=>e.firstChild.textContent).join()") in ('10:00,10:30,11:00', '10:00,10:30'), await ev("[...document.querySelectorAll('#fCr .cr.pris')].map(e=>e.firstChild.textContent).join()"))
        await pg.select_option('#fMed', 'MED2'); await ev("document.getElementById('fH').value='14:00'"); await pg.click('#fOk'); await pg.wait_for_timeout(800)
        r = [x for x in await rdvs(pg, A2) if x.get('h') == '14:00']
        verif('médecin noté sur le rendez-vous (med = MED2)', r and r[0].get('med') == 'MED2', r)
        res = json.loads(await ev(f"window.__fs['{E}patients/{A2}'].resume"))
        verif('résumé (Google Agenda) : médecin dans l\'événement', any(e.get('m') == 'MED2' and e.get('h') == '14:00' for e in res.get('ag', [])))
        verif('aucune erreur JavaScript (médecins)', not pg.errs, pg.errs); await pg.close()
        # secrétaire : tous les médecins par défaut ; un seul médecin : pas de filtre
        pg = await ouvrir(b, S5, t=T+"T08:00:00"); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000)
        verif('secrétaire : tous les médecins par défaut', await ev("document.getElementById('agMed') && document.getElementById('agMed').value") == '')
        await pg.close()
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000)
        await ev(f"ouvrirRdv('{A3}', null, {{d:'{T}', h:''}})"); await pg.wait_for_timeout(300)
        verif('un seul médecin : ni filtre ni choix du médecin', not await ev("!!document.getElementById('agMed') || !!document.getElementById('fMed')"))
        await pg.close()
        print('6. Heure des séances de chimio et du scanner (AG5 ; depuis le 12/10 : consultation du médecin, séance de l\'infirmière)')
        S6 = json.loads(json.dumps(S2))
        S6[E+'patients/'+A1]['rtsJson'] = json.dumps([{"id":"rtG","acte":"Sein","hop":"HGC","scan":"2026-10-08","deb":"2026-10-19","nb":"25","cj":"5","ryt":"1","cree":T}])
        for u, r in [('INF','infirmiere')]:
            S6[E+'membres/'+u] = {"role":r,"nom":u,"email":u.lower()+"@test.ma","actif":True,"tousEtablissements":True,"etablissements":["HGC","HCK","CIOC"],"droits":{}}
            S6['utilisateurs/'+u] = {"nom":u,"prenom":"Test"}
        ESS = 'P1790238674279'  # suivie au CIOC
        NOM_ESS = S6[E+'patients/'+ESS]['identite']['nomF'].upper()  # nom lu dans le jeu de test : jamais écrit dans le code
        S6[E+'membres/SEC'] = dict(S6[E+'membres/SEC'], etablissements=["HGC", "HCK", "CIOC"])
        pg = await ouvrir(b, S6, h=1400, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000); await ev("agJour('2026-10-08',1)"); await pg.wait_for_timeout(300)
        await ev("document.querySelector('.ag-grille').style.maxHeight='none'")
        verif('séance sans heure : dans « Journée », glissable', await ev("!!document.querySelector('.ag-journee .ev-c.c-ch.dep')"))
        await pg.locator('.ag-journee .ev-c.c-ch', has_text=NOM_ESS).first.click(); await pg.wait_for_timeout(300)
        t = await pg.inner_text('#fenetre')
        verif('3.16 : clic = Fermer · Ouvrir le dossier · Modifier / décaler', 'Fermer' in t and 'Ouvrir le dossier' in t and 'Modifier / décaler' in t, t[:200])
        await pg.click('#fenetre button:has-text("Modifier / décaler")'); await pg.wait_for_timeout(300)
        verif('Modifier (médecin) : date et heure de la consultation, sans durée', await ev("!!document.getElementById('mD') && !!document.getElementById('mH') && !document.getElementById('hDu')"))
        await ev("document.getElementById('mH').value='09:00'"); await pg.click('#fOk'); await pg.wait_for_timeout(900)
        hs = await ev(f"window.__fs['{E}patients/{ESS}'].heures") or {}
        verif('consultation notée dans le dossier (J15, champ « heures »)', any(k.endswith('|15') and (v or {}).get('cons', {}).get('h') == '09:00' for k, v in hs.items()), hs)
        h = await ev("(()=>{const e=[...document.querySelectorAll('.ev-g.c-ch')].find(x=>x.innerText.includes('"+NOM_ESS+"'));return e?[e.innerText.slice(0,5),e.getBoundingClientRect().height]:null})()")
        verif('consultation dans la grille à 09:00, 15 min (20 px)', h and h[0] == '09:00' and abs(h[1] - 20) < 1, h)
        res = json.loads(await ev(f"window.__fs['{E}patients/{ESS}'].resume"))
        verif('Google Agenda : consultation à 09:00, 15 min (jamais la durée de la chimio)', any(e.get('h') == '09:00' and e.get('dur') == 15 for e in res.get('ag', [])), [e for e in res.get('ag', []) if e.get('h')])
        # scanner de centrage : glissé de « Journée » vers 11:00
        col = await ev("(()=>{const c=document.querySelector('.ag-g .col').getBoundingClientRect();return [c.x,c.y]})()")
        src = pg.locator('.ag-journee .ev-c.c-rt.dep', has_text='Scanner').first; bb = await src.bounding_box()
        y = col[1] + (11*60 - 7*60) / 15 * 22
        await pg.mouse.move(bb['x'] + 10, bb['y'] + 5); await pg.mouse.down(); await pg.mouse.move(bb['x'] + 20, bb['y'] + 40, steps=4); await pg.mouse.move(bb['x'] + 10, y + 3, steps=8); await pg.mouse.up(); await pg.wait_for_timeout(900)
        rt = json.loads(await ev(f"window.__fs['{E}patients/{A1}'].rtsJson"))[0]
        verif('scanner glissé à 11:00 (30 min par défaut)', rt.get('scanH') == {"h": "11:00", "du": 30}, rt)
        # autre jour refusé
        await ev("agVue('semaine')"); await pg.wait_for_timeout(300); await ev("document.querySelector('.ag-grille').style.maxHeight='none'")
        src = pg.locator('.ev-g.c-ch', has_text=NOM_ESS).first; bb = await src.bounding_box()
        await pg.mouse.move(bb['x'] + 10, bb['y'] + 5); await pg.mouse.down(); await pg.mouse.move(bb['x'] + 60, bb['y'] + 20, steps=4); await pg.mouse.move(bb['x'] + bb['width'] + 40, bb['y'] + 20, steps=6); await pg.mouse.up(); await pg.wait_for_timeout(500)
        verif('3.16 : glissé vers un autre jour → « Modifier » avec la nouvelle date et la question sur la suite', await ev("!!document.getElementById('mD') && document.getElementById('mD').value!=='2026-10-08' && !document.getElementById('mSz').classList.contains('cache')"), await ev("document.getElementById('mD') && document.getElementById('mD').value"))
        await ev("fermerFenetre()")
        # retirer l'heure
        await ev("agVue('jour')"); await pg.wait_for_timeout(300)
        await pg.locator('.ev-g.c-ch', has_text=NOM_ESS).first.click(); await pg.wait_for_timeout(300); await pg.click('#fenetre button:has-text("Modifier / décaler")'); await pg.wait_for_timeout(300); await ev("document.getElementById('mH').value=''"); await pg.click('#fOk'); await pg.wait_for_timeout(900)
        verif('« Retirer l\'heure » : retour dans « Journée »', await ev("!![...document.querySelectorAll('.ag-journee .ev-c.c-ch')].find(x=>x.innerText.includes('"+NOM_ESS+"'))"))
        verif('aucune erreur JavaScript (heures)', not pg.errs, pg.errs); await pg.close()
        # secrétaire (droit planning) : peut noter l'heure de la chimio, pas celle du scanner ; infirmière : rien
        pg = await ouvrir(b, S6, t=T+"T08:00:00"); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000); await ev("agJour('2026-10-08',1)"); await pg.wait_for_timeout(300)
        n_ch = await ev("document.querySelectorAll('.ag-journee .ev-c.c-ch.dep').length")
        verif('secrétaire : séances de chimio glissables, pas le scanner', n_ch >= 1 and not await ev("!!document.querySelector('.ag-journee .ev-c.c-rt.dep')"), n_ch)
        if n_ch:
            await pg.locator('.ag-journee .ev-c.c-ch.dep').first.click(); await pg.wait_for_timeout(300); await pg.click('#fenetre button:has-text("Modifier / décaler")'); await pg.wait_for_timeout(300)
            await ev("document.getElementById('mH').value='14:00'"); await pg.click('#fOk'); await pg.wait_for_timeout(900)
            verif('secrétaire : heure de consultation enregistrée', '14:00' in (await ev("[...document.querySelectorAll('.ev-g.c-ch')].map(e=>e.innerText).join()")), pg.errs)
        verif('aucune erreur JavaScript (secrétaire)', not pg.errs, pg.errs); await pg.close()
        pg = await ouvrir(b, S6, t=T+"T08:00:00"); ev = pg.evaluate; await pg.add_init_script("window.__uid='INF'")
        await pg.goto(U+'#agenda'); await pg.wait_for_timeout(3000); await ev("agJour('2026-10-08',1)"); await pg.wait_for_timeout(300)
        verif('infirmière : séances de chimio glissables (sa séance), pas le scanner', await ev("document.querySelectorAll('.ag-journee .ev-c.c-ch.dep').length") >= 1 and not await ev("!!document.querySelector('.c-rt.dep')"))
        await pg.locator('.ag-journee .ev-c.c-ch.dep').first.click(); await pg.wait_for_timeout(300); await pg.click('#fenetre button:has-text("Modifier / décaler")'); await pg.wait_for_timeout(300)
        verif('infirmière : fenêtre heure et durée de la séance (2 h par défaut)', await ev("!!document.getElementById('hS') && document.getElementById('hDu').value") == '120')
        verif('aucune erreur JavaScript (infirmière)', not pg.errs, pg.errs); await pg.close()
        await b.close()
    print(f'\n{ok} réussis, {ko} échoués'); sys.exit(1 if ko else 0)
import sys
asyncio.run(main())
