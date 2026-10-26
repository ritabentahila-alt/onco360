import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot C (audit n° 4, 19/10/2026) : rendez-vous de chimiothérapie et de radiothérapie, avec le faux Firebase et des patients FICTIFS :
#  1. R-C1 report après « Non venu » (médecin, durée, confirmation WhatsApp) ; consultation hebdomadaire de RT un jour férié (créée, badge
#     « Férié ») ; aide des rythmes ;  2. R-C3 médecin du patient (fiche, création), médecin et lieu des rendez-vous et de la RT ;
#  3. R-C5 WhatsApp français + arabe ; R-C4 rappel noté à part (le dossier ne change pas) ;  4. R-C2 / R-C6 / R-C7 / R-C8 agenda (dossier
#     illisible, ligne arrêtée, contrastes, coche, « 5 consult. · 8 chimio », puce des séances, Actualiser) ;
#  5. secrétaire : patients à reprogrammer, rendez-vous à décaler (férié), médecin à choisir ;  6. RT sans droit « rendez-vous » (R-C4) ;
#  7. téléphone 390 px ; et aucune erreur JavaScript.
T = '2026-10-06'  # mardi
FER = '2026-10-14'  # mercredi : jour férié fictif ajouté au calendrier
S2 = json.loads(json.dumps(S))
cal = json.loads(S2[E+'parametres/calendrier']['data']); cal['feries'] = cal.get('feries', []) + [{"d": FER, "nom": "Fête fictive"}]; S2[E+'parametres/calendrier']['data'] = json.dumps(cal)
S2[E+'membres/UIDB'] = dict(S2[E+'membres/UIDRITA'], nom='Dr Bêta', email='b@test.ma')
S2['utilisateurs/UIDB'] = {"nom": "Bêta", "prenom": "Docteur"}
S2[E+'membres/SEC'] = {"role":"assistante","nom":"SEC","email":"sec@test.ma","actif":True,"tousEtablissements":False,"etablissements":["HGC"],"droits":{}}
S2['utilisateurs/SEC'] = {"nom":"SEC","prenom":"Test"}
S2[E+'membres/INF'] = {"role":"infirmiere","nom":"INF","email":"inf@test.ma","actif":True,"tousEtablissements":True,"etablissements":[],"droits":{"radiotherapie":"modifier","rendezvous":False}}
S2['utilisateurs/INF'] = {"nom":"INF","prenom":"Test"}
# Messages WhatsApp réglés par Dr Bentahila (20/10/2026, français seul : la référence) ; l'arabe est ajouté une fois avant la signature
WA_CAB = {"chimio": "Bonjour {nom}, nous vous rappelons votre séance de chimiothérapie le {jour} {heure} à : {lieu}.\nMerci d'apporter votre bilan sanguin récent. Pensez à prendre votre prémédication si elle vous a été prescrite.\nEn cas de fièvre ou de problème, appelez-nous avant de vous déplacer.\n{medecin}", "annonce": "Bonjour {nom}, nous vous rappelons votre consultation le {jour} {heure} à : {lieu}.\nMerci d'apporter tous vos examens (biopsie, compte rendu anatomopathologique, imagerie, bilans sanguins) et, si vous le souhaitez, d'être accompagné(e) d'un proche.\n{medecin}", "suivi": "Bonjour {nom}, nous vous rappelons votre consultation le {jour} {heure} à : {lieu}.\nMerci d'apporter vos derniers examens (bilan sanguin, imagerie) et vos ordonnances en cours.\n{medecin}", "controle": "Bonjour {nom}, nous vous rappelons votre consultation le {jour} {heure} à : {lieu}.\nMerci d'apporter vos derniers examens (bilan sanguin, imagerie) et vos ordonnances en cours.\n{medecin}", "rtc": "Bonjour {nom}, nous vous rappelons votre consultation de surveillance pendant la radiothérapie le {jour} {heure} à : {lieu}.\n{medecin}", "rt": "Bonjour {nom}, nous vous rappelons votre rendez-vous de radiothérapie le {jour} {heure} à {lieu}.\n{medecin}", "hospit": "Bonjour {nom}, nous vous rappelons votre hospitalisation à partir du {jour} à {lieu}.\nMerci d'apporter votre carte d'identité, votre prise en charge (mutuelle), vos examens et vos traitements habituels.\n{medecin}", "xmux3yr1z": "Bonjour {nom}, nous vous rappelons votre rendez-vous le {jour} {heure} à {lieu}.\n{medecin}", "autre": "Bonjour {nom}, nous vous rappelons votre rendez-vous le {jour} {heure} à {lieu}.\n{medecin}", "confirm": "Bonjour {nom}, votre rendez-vous est confirmé le {jour} {heure} à {lieu}.\nEn cas d'empêchement, merci de nous prévenir.\n{medecin}", "rtf": "Bonjour {nom}, nous vous rappelons votre consultation de fin de radiothérapie le {jour} {heure} à {lieu}.\n{medecin}"}
S2[E+'parametres/whatsapp'] = {"data": json.dumps(WA_CAB)}
S2[E+'parametres/migrations'] = {k: v for k, v in S2.get(E+'parametres/migrations', {}).items() if k != 'waBilingue'}
GEM = {"id": "gem", "nom": "Gemcitabine fictive", "c": 21, "dr": [{"id": "g", "p": "GEMCITABINE", "d": 1000, "u": "mg/m²", "j": [1, 8]}]}
def patient(pid, nom, rdvs=None, lignes=None, rts=None, etab='HGC', tel='0661000000', med=None):
    I = {"nomF": nom, "prenom": "Fictif", "nom": nom + " Fictif", "tel": tel, "ddn": "1960-01-01", "sexe": "F"}
    if med: I['med'] = med
    S2[E+'patients/'+pid] = {"etablissementId": etab, "identite": I, "clinique": {"taille": "165", "poids": "60"}, "lignesJson": json.dumps(lignes or []), "planningJson": "{}",
                             "rdvsJson": json.dumps(rdvs or []), "rtsJson": json.dumps(rts or []), "version": 1}
patient('PC1', 'TESTC UN', rdvs=[{"id": "r1", "type": "Suivi", "d": T, "h": "10:00", "st": "prevu", "med": "UIDB", "du": 45}])
patient('PC2', 'TESTC DEUX', rdvs=[{"id": "r2", "type": "Suivi", "d": "2026-10-02", "h": "09:00", "st": "absent"}])
patient('PC3', 'TESTC TROIS')
patient('PC4', 'TESTC QUATRE', rdvs=[{"id": "r4", "type": "En cours de RT", "d": FER, "dO": FER, "h": "", "st": "prevu", "prix": 0, "rtc": "rtq"}],
        rts=[{"id": "rtq", "acte": "RT fictive", "hop": "HGC", "deb": "2026-10-12", "nb": "10", "ryt": "1", "cj": "3"}])
patient('PC5', 'TESTC CINQ', rts=[{"id": "rt5", "acte": "RT fictive", "hop": "HGC", "deb": "2026-10-12", "nb": "10", "ryt": "1", "cj": "2", "_sc": "ancienne"}])
# ligne arrêtée le 05/10 : C1 J1 reçu le 21/09 (gardé), C2 du 12/10 (écartée)
patient('PC6', 'TESTC SIX', lignes=[{"id": "L6", "protoId": "gem", "pr": GEM, "j1": "2026-09-21", "poids": "60", "creat": "", "crU": "mgL", "cures": [{"st": "recue", "reelle": "2026-09-21"}, {}], "arret": {"date": "2026-10-05", "raison": "Décision médicale"}}])
# dossier illisible : la page Agenda doit s'afficher quand même
patient('PC7', 'TESTC SEPT', lignes=[{"id": "L7", "protoId": "gem", "pr": GEM, "j1": "2026-10-05", "cures": 5}])  # Onco360 s'ouvre quand même
patient('PC8', 'TESTC HUIT', rdvs=[None, {"id": "r8", "type": "Suivi", "d": T, "h": "16:00", "st": "prevu"}])  # rendez-vous illisible : l'agenda s'affiche
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
        print('1. Report après « Non venu » (R-C1)')
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#dossier/PC1'); await pg.wait_for_timeout(3000)
        await ev("statutRdv('PC1','r1','absent')"); await pg.wait_for_timeout(400)
        await ev("document.getElementById('abD').value='2026-10-08';document.getElementById('abH').value='15:00'"); await pg.click('#fOk'); await pg.wait_for_timeout(900)
        R = await rdvs(pg, 'PC1'); n = [r for r in R if r['id'] != 'r1']
        verif('rendez-vous manqué « Non venu »', [r for r in R if r['id'] == 'r1'][0]['st'] == 'absent')
        verif('report : même médecin (Dr Bêta) et même durée (45 min)', n and n[0].get('med') == 'UIDB' and n[0].get('du') == 45, n)
        verif('report : « Reporté (initialement le …) » gardé', n and n[0].get('rep', [{}])[0].get('abs') is True, n)
        txt = await ev("document.getElementById('fenetre').innerText")
        verif('confirmation WhatsApp proposée (« Rendez-vous reporté », « Plus tard »)', 'Rendez-vous reporté' in txt and 'Plus tard' in txt, txt[:200])
        verif('message : français puis arabe classique', 'votre rendez-vous est confirmé' in txt and 'نؤكد موعدكم' in txt and 'على الساعة 15:00' in txt, txt[:400])
        await ev("fermerFenetre()")

        print('2. Médecin du patient (R-C3)')
        await ev("modifierIdentite('PC1')"); await pg.wait_for_timeout(400)
        opts = await ev("[...document.querySelectorAll('#fMedP option')].map(o=>o.textContent)")
        verif('fiche : champ « Médecin du patient » (2 médecins)', len(opts) >= 2, opts)
        await ev("document.getElementById('fMedP').value='UIDB'"); await pg.click('#fOk'); await pg.wait_for_timeout(800)
        verif('médecin du patient enregistré (identite.med)', await ev(f"window.__fs['{E}patients/PC1'].identite.med") == 'UIDB')
        await pg.wait_for_timeout(500)
        verif('Identité et administratif : « Médecin du patient : Dr Bêta » (lot A : avant dans le bandeau)', 'Dr Bêta' in await ev("(document.querySelector('.dos-pat details[data-p=id] [data-champ=medecin]')||{}).textContent||''"), await ev("(document.querySelector('.dos-pat details[data-p=id] [data-champ=medecin]')||{}).textContent||''"))
        await ev("ouvrirRdv('PC1')"); await pg.wait_for_timeout(400)
        verif('nouveau rendez-vous : médecin du patient proposé', await ev("document.getElementById('fMed').value") == 'UIDB')
        verif('nouveau rendez-vous : lieu proposé (lieu du patient)', await ev("document.getElementById('fLieu') && document.getElementById('fLieu').value") == 'HGC')
        await ev("document.getElementById('fD').value='2026-10-09';document.getElementById('fH').value='16:00';document.getElementById('fLieu').value='HCK'"); await pg.click('#fOk'); await pg.wait_for_timeout(800)
        r9 = [r for r in await rdvs(pg, 'PC1') if r['d'] == '2026-10-09']
        verif('lieu du rendez-vous noté (HCK ≠ lieu du patient)', r9 and r9[0].get('lieu') == 'HCK' and r9[0].get('med') == 'UIDB', r9)
        await ev("fermerFenetre()")
        await ev("nouveauPatient()"); await pg.wait_for_timeout(400)
        verif('nouveau patient (médecin) : lui par défaut', await ev("document.getElementById('fMedP').value") == 'UIDRITA')
        await ev("document.getElementById('fNomF').value='TESTC NEUF';document.getElementById('fPrenom').value='Fictif'"); await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        neuf = await ev(f"Object.entries(window.__fs).filter(([k,v])=>k.startsWith('{E}patients/')&&v.identite&&v.identite.nomF==='TESTC NEUF').map(([k,v])=>v.identite.med)")
        verif('nouveau patient : identite.med = médecin qui crée', neuf == ['UIDRITA'], neuf)

        print('3. Radiothérapie : consultation hebdomadaire un jour férié, médecin et lieu (R-C1, R-C3)')
        await ev("location.hash='#dossier/PC3'"); await pg.wait_for_timeout(1500)
        await ev("ouvrirRT('PC3')"); await pg.wait_for_timeout(500)
        aide = await ev("document.getElementById('panneau').innerText")
        verif('aide des rythmes (« Jours choisis » fixe, « 1 jour sur 2 » alterne)', 'Jours choisis' in aide and 'alterne' in aide)
        verif('lieu de la RT pré-rempli avec celui du patient', await ev("document.getElementById('rHop').value") == 'HGC')
        verif('médecin de la RT proposé', await ev("!!document.getElementById('rMed')"))
        await ev("""(()=>{const s=document.getElementById('rActe');s.selectedIndex=1;s.dispatchEvent(new Event('change'));
          document.getElementById('rDose').value='20';document.getElementById('rNb').value='10';document.getElementById('rDeb').value='2026-10-12';
          document.getElementById('rCj').value='3';document.getElementById('rHop').value='HCK';document.getElementById('rMed').value='UIDB';})()""")
        await pg.click('#fOk'); await pg.wait_for_timeout(1000)
        R = await rdvs(pg, 'PC3'); rtc = [r for r in R if r.get('type') == 'En cours de RT']
        verif('consultation hebdomadaire créée le mercredi férié (14/10)', any(r['d'] == FER for r in rtc), [r['d'] for r in rtc])
        verif('consultations de la RT : médecin et lieu de la RT', rtc and all(r.get('med') == 'UIDB' and r.get('lieu') == 'HCK' for r in rtc), rtc[:1])
        fin = [r for r in R if r.get('type') == 'Fin de radiothérapie']
        verif('consultation de fin : médecin et lieu de la RT', fin and fin[0].get('med') == 'UIDB' and fin[0].get('lieu') == 'HCK', fin)
        rtj = json.loads(await ev(f"window.__fs['{E}patients/PC3'].rtsJson"))
        verif('RT : médecin noté', rtj[0].get('med') == 'UIDB' and rtj[0].get('hop') == 'HCK', rtj)
        await ev("location.hash='#dossier/PC3'"); await pg.wait_for_timeout(1500)
        av = await ev("(document.getElementById('rdvListe')||{}).innerText||''")
        verif('dossier : badge « Férié » sur la consultation du 14/10', 'Férié' in av, av[:300])

        print('4. WhatsApp et rappel noté à part (R-C5, R-C4)')
        v0 = await ev(f"window.__fs['{E}patients/PC1'].version")
        await ev("envoyerWA('PC1','suivi','2026-10-08','15:00')"); await pg.wait_for_timeout(800)
        url = await ev("window.__win.length ? window.__win[window.__win.length-1].u : ''")
        import urllib.parse as up; msg = up.unquote(url.split('text=')[-1]) if url else ''
        verif('rappel : son message en français puis l\'arabe (jour et heure en arabe)', 'Bonjour TESTC UN Fictif, nous vous rappelons votre consultation le' in msg and 'مرحبا \u2068TESTC UN Fictif\u2069، نذكركم بموعد استشارتكم يوم الخميس 8 أكتوبر' in msg and msg.index('Bonjour') < msg.index('مرحبا'), msg[:300])
        verif('signature à la fin, après l\'arabe', msg.rstrip().split('\n')[-1].startswith('Dr ') and msg.count('Dr ') == 1, msg[-80:])
        W = json.loads((await ev(f"window.__fs['{E}parametres/whatsapp']"))['data'])
        verif('messages du cabinet : arabe ajouté une fois avant la signature, français inchangé', all(W[k].startswith(WA_CAB[k].rsplit('{medecin}', 1)[0].rstrip()) and W[k].rstrip().endswith('{medecin}') and 'مرحبا' in W[k] for k in WA_CAB), {k: W[k][-60:] for k in list(W)[:2]})
        verif('conversion notée une fois (migrations.waBilingue)', bool((await ev(f"window.__fs['{E}parametres/migrations']") or {}).get('waBilingue')))
        await ev("location.hash='#parametres/whatsapp'"); await pg.wait_for_timeout(1200)
        pw = await ev("document.getElementById('page').innerText")
        verif('Paramètres › WhatsApp : messages non « personnalisé » (= messages de départ)', 'personnalisé' not in pw, pw[:200])
        rap = await ev(f"window.__fs['{E}rappels/PC1']")
        verif('rappel noté dans rappels/PC1 (patient, lieu, signé)', rap and rap.get('patientId') == 'PC1' and rap.get('majPar') == 'UIDRITA' and '2026-10-08|suivi' in rap.get('l', {}), rap)
        verif('le dossier n\'est pas réécrit (version inchangée)', await ev(f"window.__fs['{E}patients/PC1'].version") == v0)
        await ev("location.hash='#dossier/PC1'"); await pg.wait_for_timeout(1500)
        verif('rappel WhatsApp « déjà envoyé » dans le dossier (coche verte de la carte ; lot A)', await ev("!!document.querySelector('#rdvListe .rc-wa')"))

        print('5. Agenda (R-C2, R-C6, R-C7, R-C8)')
        await ev("location.hash='#agenda'"); await pg.wait_for_timeout(2500)
        verif('page Agenda affichée malgré un dossier illisible', await ev("!!document.querySelector('.ag-grille')"), pg.errs)
        await ev("agMed('')"); await ev("agJour('2026-09-21')"); await ev("agVue('semaine')"); await pg.wait_for_timeout(400)
        t21 = await ev("document.querySelector('.ag-main').innerText")
        verif('ligne arrêtée : cure passée gardée (semaine du 21/09)', 'TESTC SIX' in t21 or await ev("!!document.querySelector('.puce-ch')"), t21[:200])
        await ev("agJour('2026-09-21',1)"); await pg.wait_for_timeout(300)
        verif('ligne arrêtée : C1 du 21/09 dans la vue Jour, avec une coche (faite)', await ev("[...document.querySelectorAll('.ev-c,.ev-g')].some(e=>e.innerText.includes('TESTC SIX')&&e.querySelector('.ck'))"))
        await ev("agJour('2026-10-12',1)"); await pg.wait_for_timeout(300)
        verif('ligne arrêtée : C2 du 12/10 (après l\'arrêt) écartée', not await ev("document.querySelector('.ag-main').innerText.includes('TESTC SIX')"))
        await ev(f"agJour('{T}')"); await ev("agVue('semaine')"); await pg.wait_for_timeout(400)
        tete = await ev("[...document.querySelectorAll('.ag-tete .nb')].map(e=>e.textContent)")
        verif('en-tête des jours : « N consult. · N chimio »', any('consult.' in t or 'chimio' in t for t in tete), tete)
        c = await ev("(()=>{const e=document.createElement('span');e.className='ev-c c-ch';document.body.appendChild(e);const r=getComputedStyle(e).color;e.className='ev-c c-fer';const f=getComputedStyle(e).color;e.remove();const h=document.querySelector('.heures span:not(.pl)');return [r,f,h?getComputedStyle(h).color:'']})()")
        verif('contrastes : chimio #17693A, férié #8F5600, heures --doux', c == ['rgb(23, 105, 58)', 'rgb(143, 86, 0)', 'rgb(100, 112, 138)'], c)
        verif('fait : couleur pleine (plus de transparence)', await ev("(()=>{const e=document.createElement('span');e.className='ev-c c-co fait';document.body.appendChild(e);const o=getComputedStyle(e).opacity;e.remove();return o})()") == '1')
        verif('séances de chimio sans heure : une puce « N séances de chimio » (semaine)', await ev("[...document.querySelectorAll('.ag-journee .puce-ch')].every(e=>/\\d+ séances? de chimio/.test(e.innerText))"))
        # 26/10/2026 : la grille descend jusqu'en bas de l'écran (hauteurGrille d'agenda.js)
        verif('grille jusqu\'en bas de l\'écran (plus de 620 px fixes)', await ev("(()=>{const g=document.querySelector('.ag-grille'),r=g.getBoundingClientRect();return Math.abs(r.top+parseFloat(g.style.maxHeight)-(innerHeight-18))<=2})()"))
        verif('« Actualiser » et « à jour à … »', await ev("!!document.getElementById('agAct') && /à jour à \\d+ h \\d\\d/.test(document.getElementById('agAjour').textContent)"), await ev("document.getElementById('agAjour')&&document.getElementById('agAjour').textContent"))
        g = await ev("(()=>{const g=document.querySelector('.ag-grille');g.scrollTop=300;return g.scrollTop})()")
        await ev(f"window.__fs['{E}patients/PC2'].rdvsJson=JSON.stringify([{{id:'rx',type:'Suivi',d:'{T}',h:'14:00',st:'prevu'}}]);window.__fs['{E}patients/PC2'].version=5;window.__fs['{E}patients/PC2'].maj=new Date().toISOString()")
        await ev("agActualiser()"); await pg.wait_for_timeout(1200)
        verif('Actualiser : rendez-vous pris sur un autre poste affiché', await ev("document.querySelector('.ag-main').innerText.includes('TESTC DEUX')"))
        verif('Actualiser : vue, date et défilement gardés', await ev("document.querySelector('.ag-vues button.on').innerText.trim()") == 'Semaine' and abs(await ev("document.querySelector('.ag-grille').scrollTop") - g) < 2, await ev("document.querySelector('.ag-grille').scrollTop"))
        verif('aucune erreur JavaScript (médecin)', not pg.errs, pg.errs); await pg.close()

        print('5 bis. Salle d\'attente : filtre « Médecin » (20/10/2026)')
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate
        await pg.goto(U+'#salle'); await pg.wait_for_timeout(3000); await ev("saOnglet('avenir')"); await pg.wait_for_timeout(300)
        verif('filtre « Médecin » : le médecin connecté voit d\'abord les siens', await ev("document.getElementById('saMed') && document.getElementById('saMed').value") == 'UIDRITA')
        sl = await ev("document.getElementById('saL').innerText")
        verif('ses patients (TESTC HUIT, sans médecin = titulaire) ; pas ceux de Dr Bêta (TESTC UN)', 'TESTC HUIT' in sl and 'TESTC UN' not in sl, sl[:0])
        await ev("const s=document.getElementById('saMed');s.value='';s.dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(300)
        sl = await ev("document.getElementById('saL').innerText")
        verif('« Tous les médecins » : il voit aussi les patients de Dr Bêta', 'TESTC HUIT' in sl and 'TESTC UN' in sl)
        await ev("const s=document.getElementById('saMed');s.value='UIDB';s.dispatchEvent(new Event('change'))"); await pg.wait_for_timeout(300)
        sl = await ev("document.getElementById('saL').innerText")
        verif('salle d\'attente de Dr Bêta : seulement ses patients', 'TESTC UN' in sl and 'TESTC HUIT' not in sl)
        verif('aucune erreur JavaScript (salle)', not pg.errs, pg.errs); await pg.close()
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(U+'#salle'); await pg.wait_for_timeout(3000)
        verif('secrétaire : « Tous les médecins » par défaut', await ev("document.getElementById('saMed') && document.getElementById('saMed').value") == '')
        await pg.close()

        print('6. Secrétaire : patients à reprogrammer, rendez-vous à décaler, médecin à choisir (R-C1, R-C3)')
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate; await pg.add_init_script("window.__uid='SEC'")
        await pg.goto(U+'#accueil'); await pg.wait_for_timeout(3500)
        af = await ev("(document.querySelector('.carte.afaire')||{}).innerText||''")
        verif('« Patients à reprogrammer » : consultation non venue sans nouveau rendez-vous', 'Patients à reprogrammer' in af and 'TESTC DEUX' in af, af[:500])
        verif('report fait (PC1 n\'a rien manqué) : pas dans la liste', 'TESTC UN' not in af.split('Patients à reprogrammer')[-1].split('\n\n')[0] if 'Patients à reprogrammer' in af else True)
        tout = await ev("document.getElementById('page').innerText")
        verif('« Rendez-vous à décaler » : consultation de RT du jour férié', 'TESTC QUATRE' in tout and ('décaler' in tout), tout[:200])
        await ev("nouveauPatient()"); await pg.wait_for_timeout(400)
        verif('nouveau patient (secrétaire) : médecin à choisir', await ev("document.getElementById('fMedP') && document.getElementById('fMedP').value") == '')
        await ev("document.getElementById('fNomF').value='TESTC DIX';document.getElementById('fPrenom').value='Fictif'"); await pg.click('#fOk'); await pg.wait_for_timeout(600)
        verif('sans médecin choisi : « Choisissez le médecin du patient. »', 'Choisissez le médecin' in await ev("document.getElementById('fErr').textContent"))
        await ev("document.getElementById('fMedP').value='UIDB'"); await pg.click('#fOk'); await pg.wait_for_timeout(1200)
        dix = await ev(f"Object.entries(window.__fs).filter(([k,v])=>k.startsWith('{E}patients/')&&v.identite&&v.identite.nomF==='TESTC DIX').map(([k,v])=>v.identite.med)")
        verif('médecin choisi par la secrétaire enregistré', dix == ['UIDB'], dix)
        verif('aucune erreur JavaScript (secrétaire)', not pg.errs, pg.errs); await pg.close()

        print('7. RT enregistrée sans le droit « rendez-vous » (R-C4)')
        pg = await ouvrir(b, S2, t=T+"T08:00:00"); ev = pg.evaluate; await pg.add_init_script("window.__uid='INF'")
        await pg.goto(U+'#dossier/PC5'); await pg.wait_for_timeout(3000)
        await ev("ouvrirRT('PC5','rt5')"); await pg.wait_for_timeout(500)
        await ev("document.getElementById('rCj').value='4'"); await pg.click('#fOk'); await pg.wait_for_timeout(1000)
        rt5 = json.loads(await ev(f"window.__fs['{E}patients/PC5'].rtsJson"))[0]
        verif('RT enregistrée (jour changé)', rt5.get('cj') == '4', rt5)
        verif('signature des consultations non enregistrée (elles seront refaites)', rt5.get('_sc') == 'ancienne', rt5.get('_sc'))
        verif('rendez-vous du dossier inchangés', await rdvs(pg, 'PC5') == [])
        await pg.wait_for_timeout(2400)
        verif('message « consultations non mises à jour »', 'non mises à jour' in await ev("document.getElementById('toast').textContent"))
        verif('aucune erreur JavaScript (infirmière)', not pg.errs, pg.errs); await pg.close()

        print('8. Téléphone 390 px')
        for uid, page in [('UIDRITA', '#agenda'), ('UIDRITA', '#dossier/PC1'), ('SEC', '#accueil')]:
            pg = await ouvrir(b, S2, w=390, h=800, t=T+"T08:00:00"); ev = pg.evaluate; await pg.add_init_script(f"window.__uid='{uid}'")
            await pg.goto(U+page); await pg.wait_for_timeout(3000)
            verif(f'390 px, {uid} {page} : rien ne déborde', await ev("document.documentElement.scrollWidth <= 390"), await ev("document.documentElement.scrollWidth"))
            if page == '#agenda': verif('390 px : « Actualiser » visible', await ev("(()=>{const r=document.getElementById('agAct').getBoundingClientRect();return r.width>0&&r.right<=390})()"))
            verif(f'390 px, {page} : aucune erreur JavaScript', not pg.errs, pg.errs); await pg.close()
        await b.close()
    print(f'\n{ok} réussis, {ko} échoués')
    raise SystemExit(1 if ko else 0)
asyncio.run(main())
