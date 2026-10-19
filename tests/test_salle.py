import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Salle d'attente (SA7, 11/10/2026) : parcours complets dans le navigateur, avec le faux Firebase.
#  1. médecin : arrivée (n° de passage, compteur), refus si un collègue a agi, Démarrer, Retour, Valider (fenêtre de prix),
#     Annuler le statut, Absent avec report, menu ⋯ / clic droit / double-clic, largeur de colonne gardée ;
#  2. secrétaire : prix payé d'avance proposé à la validation, prix enregistré par le serveur (fonction simulée) ;
#  3. infirmière : seulement « Arrivé », pas de prix ;  4. chimio : une arrivée pour le rendez-vous et la séance, Patient suivant,
#     consultation de chimio validée depuis le dossier ;  5. messages à l'écran ;  6. heure du Maroc sur un ordinateur réglé ailleurs ;
#  7. téléphone (390 px, filtres repliés, zones à toucher) ;  8. audit externe (SA9) : onglet d'ouverture, colonnes par défaut,
#     bulle de commentaire, reçus numérotés (R-AAAA-NNNN, duplicata) ;  et aucune erreur JavaScript.
T = '2026-10-06'
S3 = json.loads(json.dumps(S))
def ajout(pid, rdvs):
    R = json.loads(S3[E+'patients/'+pid].get('rdvsJson') or '[]'); R += rdvs; S3[E+'patients/'+pid]['rdvsJson'] = json.dumps(R)
A1, A2, A3, K1 = 'P1790155538558', 'P1790335106635', 'P1790510177539', 'P1790510171257'
ajout(A1, [{"id":"rS1","type":"Suivi","d":T,"h":"09:30","st":"prevu","mo":"Résultats du scanner"},{"id":"rS9","type":"Suivi","d":"2026-10-09","h":"09:00","st":"prevu"}])
ajout(A2, [{"id":"rS2","type":"Annonce","d":T,"h":"11:00","st":"prevu","n":"Nouveau patient"}])
ajout(A3, [{"id":"rS5","type":"Suivi","d":T,"h":"12:00","st":"prevu"}])
ajout(K1, [{"id":"rS3","type":"En cours de RT","d":T,"h":"10:30","st":"prevu"}])
for u, r in [('SEC','assistante'), ('INF','infirmiere')]:
    S3[E+'membres/'+u] = {"role":r,"nom":u,"email":u.lower()+"@test.ma","actif":True,"tousEtablissements":False,"etablissements":["HGC"],"droits":{}}
    S3['utilisateurs/'+u] = {"nom":u,"prenom":"Test"}
U = 'http://localhost:8767/v2.html'
sid = lambda pid, cle, j=T: E+'salle/'+j+'_'+pid+'_'+cle
# Fonction serveur prixConsultation simulée (même effet que functions/logique.js appliquerPrix, en simplifié)
FONC = """window.__fonctions={prixConsultation:async(q)=>{const E='espaces/cabinet-bentahila/',fs=window.__fs,P=fs[E+'patients/'+q.patientId];window.__appels=(window.__appels||[]).concat([q]);
const f=fs[E+'patientsFinances/'+q.patientId]||(fs[E+'patientsFinances/'+q.patientId]={etablissementId:P.etablissementId,montantsJson:'{"rdv":{},"rt":{},"cures":{}}'});const M=JSON.parse(f.montantsJson);M.rdv=M.rdv||{};M.cures=M.cures||{};
const e=fs[E+'encaissements/'+q.patientId]||{etablissementId:P.etablissementId,data:'{"rdv":{},"cons":{}}'};const En=JSON.parse(e.data);En.rdv=En.rdv||{};En.cons=En.cons||{};
if(q.rdvId){(M.rdv[q.rdvId]=M.rdv[q.rdvId]||{}).brut=q.montant;En.rdv[q.rdvId]={m:q.montant};}
else{const k=q.lid+'|'+q.n+'|'+q.j,a=M.cures[q.lid]=M.cures[q.lid]||{},cc=a[q.n]=a[q.n]||{};cc.consJ=cc.consJ||{};if(q.montant==null){delete cc.consJ[q.j];delete En.cons[k];}else{cc.consJ[q.j]=q.montant;En.cons[k]={m:q.montant,d:q.d,lib:q.lib,n:q.n,j:'J'+q.j};}}
f.montantsJson=JSON.stringify(M);e.data=JSON.stringify(En);fs[E+'encaissements/'+q.patientId]=e;return{ok:true};}};"""
ok = ko = 0
def verif(nom, cond, detail=None):
    global ok, ko
    if cond: ok += 1; print('  ✔', nom)
    else: ko += 1; print('  ✘', nom, '' if detail is None else '→ ' + str(detail)[:300])
ligne = lambda pg, txt: pg.locator(f'#saL .sa-l:has-text("{txt}")').first
async def menu(pg, txt, action):
    await ligne(pg, txt).locator('.sa-plus').click(); await pg.wait_for_timeout(150)
    await pg.locator('#saMenuF button', has_text=action).first.click(); await pg.wait_for_timeout(500)
async def onglet(pg, k): await pg.evaluate(f"window.saOnglet('{k}')"); await pg.wait_for_timeout(250)
async def doc(pg, k): return await pg.evaluate(f"window.__fs['{k}']") or {}
async def rdv(pg, pid, rid): return [x for x in json.loads(await pg.evaluate(f"window.__fs['{E}patients/{pid}'].rdvsJson")) if x['id'] == rid]

# Zones à toucher de moins de 40 px (boutons, liens, champs) visibles à l'écran
PETITES = """[...document.querySelectorAll('button, a, input, select, label.sa-cal')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && Math.min(b.width, b.height) < 40; }).map(e => (e.id || e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))"""
# Reçu (SA9c) : rendez-vous rS1 « Venu », 300 DH payés en espèces
S8 = json.loads(json.dumps(S3))
_R = json.loads(S8[E+'patients/'+A1]['rdvsJson']); [r.update(st='fait', dv=T) for r in _R if r['id'] == 'rS1']; S8[E+'patients/'+A1]['rdvsJson'] = json.dumps(_R)
_F = S8.setdefault(E+'patientsFinances/'+A1, {"etablissementId": S8[E+'patients/'+A1].get('etablissementId', 'HGC'), "montantsJson": '{"rdv":{},"rt":{},"cures":{}}'})
_M = json.loads(_F['montantsJson']); _M.setdefault('rdv', {})['rS1'] = {"brut": 300, "mode": "esp"}; _F['montantsJson'] = json.dumps(_M)
S8[E+'encaissements/'+A1] = {"etablissementId": S8[E+'patients/'+A1].get('etablissementId', 'HGC'), "data": json.dumps({"rdv": {"rS1": {"m": 300, "mode": "esp"}}, "cons": {}})}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('1. Médecin')
        pg = await ouvrir(b, S3, t=T+"T10:00:00"); ev = pg.evaluate
        await pg.goto(U+'#salle'); await pg.wait_for_timeout(2500); await onglet(pg, 'avenir')
        verif('à venir : 4 consultations du jour', (await ev("document.querySelector('#saO button').innerText")).endswith('4'), await ev("document.querySelector('#saO button').innerText"))
        verif('une ligne = un bouton « Arrivé » + menu ⋯', set(await ev("[...document.querySelectorAll('#saL .actr')].map(a=>a.innerText.replace(/\\n/g,' '))")) == {'Arrivé ⋯'})
        verif('semaine repliée par défaut', await ev("document.getElementById('saJours').classList.contains('repli')"))
        await ligne(pg, '09:30').locator('.actr >> text=Arrivé').click(); await pg.wait_for_timeout(600)
        d = await doc(pg, sid(A1, 'r-rS1'))
        verif('Arrivé : en salle, n° 1, heure notée', d.get('etat') == 'salle' and d.get('ordre') == 1 and d.get('arr'), d)
        verif('compteur du jour et de l\'établissement', (await doc(pg, E+'salleOrdre/'+T+'_HGC')).get('n') == 1)
        # un collègue démarre la consultation ; cet écran ne l'a pas encore reçu et clique « Démarrer » au même moment
        await ev(f"window.__fs['{sid(A1,'r-rS1')}'].etat='consult'; window.__fs['{sid(A1,'r-rS1')}'].debNom='Dr Collègue'; window.saDemarrer('{A1}','r-rS1')"); await pg.wait_for_timeout(700)
        verif('un collègue a déjà démarré : action refusée avec un message', 'déjà en consultation (Dr Collègue)' in await ev("document.getElementById('toast').innerText"), await ev("document.getElementById('toast').innerText"))
        await ev(f"window.__fs['{sid(A1,'r-rS1')}'].etat='salle'"); await pg.wait_for_timeout(900); await onglet(pg, 'salle')
        await ligne(pg, '09:30').locator('.actr >> text=Démarrer').click(); await pg.wait_for_timeout(1000)
        verif('Démarrer : dossier ouvert, bulles Valider / Retour', (await ev("location.hash")).startswith('#dossier/') and await ev("!!document.getElementById('saBulles')"))
        await pg.click('#saBulles >> text=Fermer')  # lot G : « Fermer » = retour en salle sans valider; await pg.wait_for_timeout(800)
        verif('Retour en salle', await ev("location.hash") == '#salle' and (await doc(pg, sid(A1, 'r-rS1'))).get('etat') == 'salle')
        await ligne(pg, '09:30').locator('.actr >> text=Démarrer').click(); await pg.wait_for_timeout(1000)
        await pg.click('#saBulles >> text=Valider'); await pg.wait_for_timeout(700)
        verif('Valider : fenêtre de prix au tarif (300 DH)', await ev("document.getElementById('pvM').value") == '300')
        await pg.fill('#pvM', '250'); await pg.click('#fOk'); await pg.wait_for_timeout(1300)
        M = json.loads(await ev(f"window.__fs['{E}patientsFinances/{A1}'].montantsJson"))['rdv'].get('rS1', {})
        verif('rendez-vous « Venu », prix 250 DH, retour à la salle', (await rdv(pg, A1, 'rS1'))[0]['st'] == 'fait' and M.get('brut') == 250 and await ev("location.hash") == '#salle', M)
        await onglet(pg, 'vus'); await menu(pg, '09:30', 'Annuler le statut')
        verif('Annuler le statut : retour « En consultation »', (await rdv(pg, A1, 'rS1'))[0]['st'] == 'prevu' and (await doc(pg, sid(A1, 'r-rS1'))).get('etat') == 'consult')
        await onglet(pg, 'avenir'); await menu(pg, '11:00', 'Absent')
        await pg.fill('#abD', '2026-10-08'); await pg.fill('#abH', '15:00'); await pg.click('#fOk'); await pg.wait_for_timeout(1000)
        R = json.loads(await ev(f"window.__fs['{E}patients/{A2}'].rdvsJson"))
        verif('Absent + report : rendez-vous « Non venu », nouveau le 08/10 à 15:00', any(x['id']=='rS2' and x['st']=='absent' for x in R) and any(x['d']=='2026-10-08' and x.get('h')=='15:00' and x.get('rep') for x in R))
        await onglet(pg, 'avenir'); await ligne(pg, '12:00').click(button='right'); await pg.wait_for_timeout(200)
        verif('clic droit : menu des actions', await ev("!!document.getElementById('saMenuF')"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
        box = await pg.locator('#saE .sa-poi[data-c="mo"]').bounding_box(); w0 = await ev("Math.round(document.querySelector('#saE .c-mo').getBoundingClientRect().width)")
        await pg.mouse.move(box['x']+4, box['y']+5); await pg.mouse.down(); await pg.mouse.move(box['x']+84, box['y']+5, steps=5); await pg.mouse.up(); await pg.wait_for_timeout(400)
        L = (await doc(pg, 'utilisateurs/UIDRITA')).get('salleLargeurs', {})
        verif('largeur de colonne tirée et gardée pour le compte', L.get('mo', 0) >= w0 + 70, (w0, L))
        await ligne(pg, '12:00').locator('.c-type').dblclick(); await pg.wait_for_timeout(800)
        verif('double-clic sur la ligne : dossier', await ev("location.hash") == '#dossier/' + A3)
        verif('aucune erreur (médecin)', not pg.errs, pg.errs)
        S4 = await ev("window.__fs"); await pg.close()

        print('2. Secrétaire')
        ps = await ouvrir(b, S4, t=T+"T10:20:00"); await ps.add_init_script("window.__uid='SEC';" + FONC)
        await ps.goto(U+'#salle'); await ps.wait_for_timeout(2500); await onglet(ps, 'avenir')
        verif('ne voit que son centre (pas le patient de HCK)', not await ps.locator('#saL .sa-l:has-text("10:30")').count())
        await menu(ps, '12:00', "Prix payé d'avance"); await ps.fill('#saPx', '150'); await ps.click('#fOk'); await ps.wait_for_timeout(600)
        verif("prix payé d'avance noté (150 DH)", (await doc(ps, sid(A3, 'r-rS5'))).get('prix') == 150)
        await ligne(ps, '12:00').locator('.actr >> text=Arrivé').click(); await ps.wait_for_timeout(500); await onglet(ps, 'salle')
        await menu(ps, '12:00', 'Valider'); await ps.wait_for_timeout(500)
        verif('fenêtre de prix : montant payé d\'avance proposé', await ps.evaluate("document.getElementById('pvM').value") == '150')
        await ps.click('#fOk'); await ps.wait_for_timeout(1300)
        verif('prix écrit par le serveur (fonction prixConsultation)', (await ps.evaluate("window.__appels||[]"))[-1:] == [{'espace':'cabinet-bentahila','patientId':A3,'rdvId':'rS5','montant':150}], await ps.evaluate("window.__appels"))
        verif('aucune erreur (secrétaire)', not ps.errs, ps.errs)
        S5 = await ps.evaluate("window.__fs"); await ps.close()

        print('3. Infirmière')
        pi = await ouvrir(b, S5, t=T+"T10:30:00"); await pi.add_init_script("window.__uid='INF'")
        await pi.goto(U+'#salle'); await pi.wait_for_timeout(2500); await onglet(pi, 'salle')  # 09:30 en consultation (après le médecin)
        verif('pas de colonne Prix', 'PRIX' not in (await pi.evaluate("document.getElementById('saE').innerText")).upper())
        await pi.locator('#saL .sa-l .sa-plus').first.click(); await pi.wait_for_timeout(150)
        mi = await pi.evaluate("[...document.querySelectorAll('#saMenuF button')].map(b=>b.innerText)")
        verif('menu : ni Démarrer, ni Absent, ni prix', not any(x in ' '.join(mi) for x in ['Démarrer', 'Absent', 'prix']), mi)
        verif('aucune erreur (infirmière)', not pi.errs, pi.errs); await pi.close()

        print('4. Chimio et patient suivant (09/10)')
        pc = await ouvrir(b, S3, t="2026-10-09T10:00:00"); ev = pc.evaluate
        await pc.goto(U+'#salle'); await pc.wait_for_timeout(2500); await onglet(pc, 'avenir')
        verif('séance de chimio en tête d\'« À venir »', 'Séance chimio' in await ev("document.querySelector('#saL .sa-l').innerText"))
        await ligne(pc, '09:00').locator('.actr >> text=Arrivé').click(); await pc.wait_for_timeout(800)
        st = [(k.split('_')[-1], v.get('etat'), v.get('ordre')) for k, v in (await ev("window.__fs")).items() if '/salle/2026-10-09_'+A1 in k]
        verif('une arrivée : rendez-vous et séance en salle, même n°', len(st) == 2 and all(e == 'salle' and o == 1 for _, e, o in st), st)
        await onglet(pc, 'salle'); await pc.click('#saSuiv'); await pc.wait_for_timeout(1200)
        verif('Patient suivant : dossier ouvert, deux bulles (rendez-vous + chimio)', (await ev("location.hash")).endswith(A1) and await ev("document.querySelectorAll('#saBulles .sa-b').length") == 2)
        await pc.locator('#saBulles .sa-b').nth(1).locator('text=Valider').click(); await pc.wait_for_timeout(900)
        verif('chimio : fenêtre de la consultation C1 J15 (0 DH)', 'C1 J15' in await ev("document.getElementById('fenetreCorps').innerText") and await ev("document.getElementById('pvM').value") == '0')
        await pc.click('#fOk'); await pc.wait_for_timeout(1300)
        verif('séance « Vu »', any(v.get('etat') == 'vu' for k, v in (await ev("window.__fs")).items() if '/salle/2026-10-09_'+A1+'_c-' in k))
        verif('aucune erreur (chimio)', not pc.errs, pc.errs); await pc.close()

        print('5. Messages à l\'écran')
        pm = await ouvrir(b, S3, t=T+"T10:00:00"); await pm.goto(U+'#salle'); await pm.wait_for_timeout(2500)
        await pm.evaluate(f"window.__fs['{sid(K1,'r-rS3')}']={{jour:'{T}',patientId:'{K1}',etablissementId:'HCK',cle:'r-rS3',etat:'salle',arr:Date.now()-50*60000,arrNom:'Sara',ordre:3,majPar:'SEC'}}")
        await pm.wait_for_timeout(1600)
        verif('médecin : « (patient) est arrivé(e) en salle d\'attente »', any('est arrivé(e)' in n for n in await pm.evaluate("[...document.querySelectorAll('#notifs .notif')].map(n=>n.innerText)")))
        await pm.close()
        ps = await ouvrir(b, S4, t=T+"T10:00:00"); await ps.add_init_script("window.__uid='SEC'"); await ps.goto(U+'#salle'); await ps.wait_for_timeout(2500)
        await ps.evaluate(f"window.__fs['{sid(A1,'r-rS1')}']=Object.assign(window.__fs['{sid(A1,'r-rS1')}'],{{etat:'salle',arr:Date.now()-60*60000,majPar:'MED'}})"); await ps.wait_for_timeout(1200)
        await ps.clock.run_for(31000); await ps.wait_for_timeout(500)
        verif('secrétaire : « … attend depuis 1 h 00 » (attente au rouge)', any('attend depuis' in n for n in await ps.evaluate("[...document.querySelectorAll('#notifs .notif')].map(n=>n.innerText)")))
        await ps.close()

        print('6. Heure du Maroc')
        S7 = json.loads(json.dumps(S3)); S7[sid(A1,'r-rS1')] = {"jour":T,"patientId":A1,"etablissementId":"HGC","cle":"r-rS1","etat":"salle","arr":1791277200000,"majPar":"SEC"}  # 06/10/2026 09:00 UTC
        pb = await ouvrir(b, S7, t="2026-10-06T11:00:00+02:00", tz="Europe/Brussels")
        await pb.goto(U+'#salle'); await pb.wait_for_timeout(2500); await onglet(pb, 'salle')
        attendu = await pb.evaluate("new Intl.DateTimeFormat('fr-FR',{timeZone:'Africa/Casablanca',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(1791277200000))")
        verif('ordinateur à l\'heure belge : arrivée affichée à l\'heure du Maroc (' + attendu + ')', await pb.evaluate("document.querySelector('#saL .ar').innerText") == attendu)

        print('7. Téléphone')
        pt = await ouvrir(b, S3, w=390, h=844, t=T+"T10:00:00"); await pt.goto(U+'#salle'); await pt.wait_for_timeout(2500)
        verif('390 px : rien ne déborde', await pt.evaluate("document.documentElement.scrollWidth") <= 390, await pt.evaluate("document.documentElement.scrollWidth"))
        # SA9b (audit externe) : filtres repliés, zones à toucher d'au moins 40 px, patients sur le premier écran
        verif('téléphone : filtres repliés derrière « Filtres »', await pt.evaluate("getComputedStyle(document.getElementById('saFtr')).display!=='none' && getComputedStyle(document.getElementById('saOutils')).display==='none'"))
        petites = await pt.evaluate(PETITES)
        verif('téléphone : aucune zone à toucher de moins de 40 px', not petites, petites)
        verif('téléphone : liste des patients sur le premier écran', await pt.evaluate("document.getElementById('saCarte').getBoundingClientRect().top") < 400, await pt.evaluate("document.getElementById('saCarte').getBoundingClientRect().top"))
        await pt.click('#saFtr'); await pt.fill('#saQ', 'el'); await pt.wait_for_timeout(300)
        verif('téléphone : « Filtres » ouvre les filtres et compte ceux qui sont actifs', await pt.evaluate("getComputedStyle(document.getElementById('saOutils')).display!=='none'") and await pt.evaluate("document.getElementById('saFtrN').innerText") == '1')
        verif('aucune erreur (téléphone)', not pt.errs, pt.errs); await pt.close()

        print('8. Audit externe (SA9) : onglet d\'ouverture, colonnes, reçus numérotés')
        p8 = await ouvrir(b, S8, t=T+"T10:00:00"); ev = p8.evaluate; await p8.goto(U+'#salle'); await p8.wait_for_timeout(2500)
        verif('personne en salle : la page s\'ouvre sur « À venir »', (await ev("document.querySelector('#saO .on').innerText")).startswith('À venir'))
        ent = await ev("document.getElementById('saE').innerText.toUpperCase()")
        verif('colonnes Correspondant et Commentaire cachées par défaut', 'CORRESP' not in ent and 'COMMENT' not in ent and 'MOTIF' in ent, ent)
        verif('1 440 px : aucun titre de colonne coupé', not await ev("[...document.querySelectorAll('#saE .sa-l.ent > span')].filter(s => s.scrollWidth > s.clientWidth + 1).map(s => s.innerText)"))
        await onglet(p8, 'vus'); await ev(f"location.hash='#dossier/{A1}'"); await p8.wait_for_timeout(900); await ev("location.hash='#salle'"); await p8.wait_for_timeout(900)
        verif('retour d\'un dossier : l\'onglet choisi est gardé', (await ev("document.querySelector('#saO .on').innerText")).startswith('Vus'))
        # reçu : rendez-vous « Venu » payé en espèces (300 DH)
        await ev(f"location.hash='#dossier/{A1}'"); await p8.wait_for_timeout(1200)
        await ev(f"window.recuRdv('{A1}','rS1')"); await p8.wait_for_timeout(800)
        r1 = await ev("(window.__win.slice(-1)[0]||{w:{document:{_h:''}}}).w.document._h")
        verif('reçu : numéro R-2026-0001 (tableau du reçu, R-B5)', '<th>N° de reçu</th><td><b>R-2026-0001</b></td>' in r1, len(r1))
        await ev(f"window.recuRdv('{A1}','rS1')"); await p8.wait_for_timeout(800)
        r2 = await ev("window.__win.slice(-1)[0].w.document._h"); R1 = await doc(p8, E+'recus/'+A1+'_r-rS1')
        verif('réimpression : même numéro, « DUPLICATA »', '<b>R-2026-0001</b> · DUPLICATA' in r2 and R1.get('imp') == 2, R1.get('imp'))
        verif('compteur des reçus de l\'année : 1', (await doc(p8, E+'recusCompteur/2026')).get('n') == 1)
        verif('aucune erreur (SA9)', not p8.errs, p8.errs); await p8.close()
        S9 = json.loads(json.dumps(S3)); S9['utilisateurs/UIDRITA'] = dict(S9.get('utilisateurs/UIDRITA', {}), salleCachees=[])
        S9[sid(A1,'r-rS1')] = {"jour":T,"patientId":A1,"etablissementId":"HGC","cle":"r-rS1","etat":"salle","arr":1791277200000,"majPar":"SEC","com":"À jeun"}
        p9 = await ouvrir(b, S9, t=T+"T11:00:00"); await p9.goto(U+'#salle'); await p9.wait_for_timeout(2500)
        verif('quelqu\'un en salle : la page s\'ouvre sur « En salle »', (await p9.evaluate("document.querySelector('#saO .on').innerText")).startswith('En salle'))
        verif('choix de colonnes déjà fait : gardé (Correspondant affiché)', 'CORRESP' in (await p9.evaluate("document.getElementById('saE').innerText")).upper())
        await p9.close()
        S9['utilisateurs/UIDRITA'].pop('salleCachees')
        p9 = await ouvrir(b, S9, t=T+"T11:00:00"); await p9.goto(U+'#salle'); await p9.wait_for_timeout(2500)
        verif('colonne Commentaire cachée : bulle 💬 à côté du nom', 'À jeun' in (await p9.evaluate("(document.querySelector('#saL .sa-cm')||{}).title||''")))
        verif('aucune erreur (SA9, colonnes)', not p9.errs, p9.errs)
        await b.close()
    print(f'\n{ok} réussis, {ko} échoués')
    if ko: sys.exit(1)
import sys
asyncio.run(main())
