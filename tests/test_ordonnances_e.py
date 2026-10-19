import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot R-E (19/10/2026, audit n° 7) : ordonnances et bibliothèques de prescription. Zones « À compléter » et durées, doublons, allergie par
# familles (toutes les lignes), vérification unique avant l'impression, impression sur plusieurs pages, mise à jour des bibliothèques sans
# écrasement, secrétaire sans modification de bibliothèque, ordonnance annulée (pas effacée), version précédente gardée, renouvellement (âge,
# poids, allergie refaits), duplicata, recherche par médicament, format retenu par compte, chimiothérapie orale calculée ; téléphone 390 px.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
P = E + 'patients/' + pid
# Liste des médicaments telle qu'un cabinet l'a enregistrée avant le 19/10 (liste de départ d'avant : corrections défaites) ; TAVANIC modifié
# par le cabinet ; MOSCONTIN retiré
ancien = json.loads(subprocess.run(['node', '--input-type=module', '-e', '''
import { MEDICAMENTS0 } from "./public/js/donnees/medicaments.js"; import { MAJ_BIB } from "./public/js/donnees/majbib.js";
const L = MEDICAMENTS0.slice(0, 165).map((m, i) => ({ id: "m" + (i + 1), nom: m[0], poso: m[1], classe: m[2] || "" }));
MAJ_BIB.medicaments.corrections.forEach((c) => { const o = L.find((z) => z.id === c.apres[0]); o.nom = c.avant[0]; o.poso = c.avant[1]; });
console.log(JSON.stringify(L));'''], cwd=str(ICI.parent), capture_output=True, text=True).stdout)
ancien[[i for i, m in enumerate(ancien) if m['nom'].startswith('TAVANIC')][0]]['poso'] = 'Posologie du cabinet'
ancien = [m for m in ancien if not m['nom'].startswith('MOSCONTIN')]
def seed(maj=False):
    s = json.loads(json.dumps(S))
    d = s[P]; d['clinique'] = dict(d.get('clinique') or {}, allergie='oui', allergies='Pénicilline')
    s[E + 'parametres/reglages'] = {"data": json.dumps({"impression": {"a5": [45, 28, 18], "a4": [60, 35, 22], "doc": [45, 35, 22], "age": True, "poids": True, "allergie": True, "entete": "papier"}})}
    if maj:
        s[E + 'bibliotheques/medicaments'] = {"data": json.dumps(ancien), "retires": ["m94"]}
        s[E + 'parametres/migrations'] = dict(s[E + 'parametres/migrations']); s[E + 'parametres/migrations'].pop('bibE3', None)
    return s
dlg = "(document.querySelector('.or-dlg')||{}).innerText||''"
async def repondre(pg, k):
    await pg.wait_for_timeout(250)
    if await pg.evaluate("!!document.querySelector('.or-dlg')"): await pg.evaluate(f"document.querySelector('.or-dlg [data-k={k}]').click()"); await pg.wait_for_timeout(500); return True
    return False
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Mise à jour des bibliothèques sans écrasement (R-E3, R-E4)')
        pg = await ouvrir(b, seed(True)); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(4500)
        fs = await ev("window.__fs"); L = json.loads(fs[E + 'bibliotheques/medicaments']['data']); noms = [m['nom'] for m in L]
        tav = [m for m in L if m['nom'].startswith('TAVANIC')][0]
        ok(tav['poso'] == 'Posologie du cabinet', 'TAVANIC modifié par le cabinet : jamais écrasé', tav)
        ok('OFLOCET (ofloxacine) 200 mg' in noms and 'matin et soir' in [m for m in L if m['nom'].startswith('OFLOCET')][0]['poso'], 'OFLOCET (fiche d\'avant) corrigé : 200 mg matin et soir')
        ok(not any(n.startswith('MOSCONTIN') for n in noms), 'MOSCONTIN retiré par le cabinet : ni remis, ni ses autres dosages')
        ok('SOLUPRED (prednisolone) 20 mg' in noms and 'NAUSELIUM (dompéridone) sirop' in noms and 'LOPERIUM (lopéramide) 2 mg – diarrhée retardée de l\'irinotécan' in noms, 'fiches nouvelles ajoutées (SOLUPRED, NAUSELIUM, LOPERIUM de l\'irinotécan)')
        ok('DUROGESIC (fentanyl) 25 µg/h, patch' in noms and 'LEVOTHYROX (lévothyroxine) 100 µg' in noms, 'une fiche par dosage (DUROGESIC, LEVOTHYROX)')
        ok((fs.get(E + 'parametres/migrations') or {}).get('bibE3') == 1, 'mise à jour notée faite (une seule fois)')
        ok(any('Bibliothèques mises à jour' in (v.get('quoi') or '') for k, v in fs.items() if k.startswith(E + 'historique/')), 'notée au journal du cabinet')
        await pg.close()

        print('Zones à compléter, doublons, allergie, vérification avant l\'impression (R-E1, R-E6)')
        pg = await ouvrir(b, seed()); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(700)
        ide = lambda n: f"[...document.querySelectorAll('#mdListe tr.m')].find(r=>r.innerText.startsWith({json.dumps(n)}))"
        async def ajouter(n):
            await pg.fill('#mdQ', n.split(' ')[0]); await pg.wait_for_timeout(250)
            await ev(f"{ide(n)}.querySelector('[onclick^=mdAjouter]').click()"); await pg.wait_for_timeout(300)
        await ajouter('AUGMENTIN')
        t = await ev(dlg)
        ok('Allergie connue : Pénicilline' in t and 'pénicillines' in t, 'allergie (famille) : AUGMENTIN signalé avant l\'ajout', t)
        await repondre(pg, 'non'); ok('AUGMENTIN' not in await pg.inner_text('#mdOrdo'), '« Ne pas ajouter » : AUGMENTIN pas ajouté')
        await ajouter('CAPÉCITABINE (XELODA) 500 mg / 150 mg')
        ok(await ev("document.querySelectorAll('#mdOrdo .it').length") == 1, 'CAPÉCITABINE ajoutée')
        ok(await ev("!!document.querySelector('#mdOrdo [onclick^=mdCalcul]')"), 'bouton « mg/m² » sur la chimiothérapie orale')
        await ev("document.querySelector('#mdOrdo [onclick^=mdCalcul]').click()"); await pg.wait_for_timeout(400)
        t = await ev(dlg); sc = await ev("(document.getElementById('ccSc')||{}).value")
        ok(sc == '1,71' and 'mg par prise' in t, 'surface corporelle du dossier proposée (65 kg, 162 cm : 1,71 m²) et calcul affiché', [sc, t[-200:]])
        await repondre(pg, 'ok'); o = await pg.inner_text('#mdOrdo')
        ok('3 comprimés de 500 mg et 1 comprimé de 150 mg' in o.replace('\n', ' ') and '1000 mg/m²' in o, 'posologie remplie : 1 710 mg → 3 × 500 + 1 × 150 = 1 650 mg (le moins de comprimés à moins d\'un demi comprimé près)', o[:300])
        await ev("mdLigneLibre()"); await pg.wait_for_timeout(200); await pg.fill('#edNom', 'ROCÉPHINE 1 g'); await pg.fill('#edPoso', '1 injection par jour'); await ev("(mdEditOk(1), 0)"); await pg.wait_for_timeout(300)
        t = await ev(dlg); ok('céphalosporines' in t and 'à vérifier' in t, 'ligne libre vérifiée : ROCÉPHINE, allergie croisée possible à vérifier', t)
        await repondre(pg, 'oui'); ok('ROCÉPHINE' in await pg.inner_text('#mdOrdo'), '« Ajouter quand même » : un clic, rien de bloqué')
        await ev("mdAfficher()"); await pg.wait_for_timeout(800)
        al = await ev("(document.getElementById('orAl')||{}).innerText||''")
        ok('Allergie connue' in al and 'ROCÉPHINE' in al, 'allergie rappelée au-dessus de l\'ordonnance affichée', al)
        z = await ev("[...document.querySelectorAll('#orPage mark.or-ac')].map(m=>m.textContent)")
        ok(not any('compléter' in x for x in z), 'zones de la capécitabine remplies par le calcul : plus de zone jaune', z)
        pat2 = await ev("[...document.querySelectorAll('#orPage .or-pat2')].map(e=>e.innerText).join(' | ')")
        ok('kg' in pat2 and 'Allergie' in pat2, 'âge, poids et allergie sous le nom (Paramètres › Impression)', pat2)
        await ev("window.__win=[]"); await pg.click('#orImp'); await pg.wait_for_timeout(400)
        t = await ev(dlg)
        ok('Avant d\'imprimer' in t and 'Allergie connue' in t and 'Corriger' in t and 'Imprimer quand même' in t, 'une seule vérification avant l\'impression (allergie, zones…) : Corriger / Imprimer quand même', t)
        await repondre(pg, 'corriger'); ok(await ev("!!document.getElementById('orPage')") and not await ev("(window.__win||[]).length"), '« Corriger » : retour à l\'ordonnance, rien d\'imprimé ni d\'enregistré')
        await pg.click('#orImp'); await repondre(pg, 'ok'); await pg.wait_for_timeout(1000)
        hh = await ev("(window.__win||[]).map(w=>w.w.document._h).join('')")
        ok('CAPÉCITABINE' in hh and 'class="or-num"' not in hh, '« Imprimer quand même » : imprimée (une page, sans numéro de page)', hh[:200])
        fs = await ev("window.__fs"); lg = [l for k, v in fs.items() if k.startswith(E + 'consultations/') and v.get('patientId') == pid for l in v.get('lignes', [])]
        l0 = lg[-1] if lg else {}
        ok(l0.get('items') and l0['items'][0]['nom'].startswith('CAPÉCITABINE') and l0.get('par') == 'Dr Rita Bentahila' and l0.get('parUid') == 'UIDRITA', 'enregistrée avec la liste des médicaments et l\'auteur pris du compte', {k: l0.get(k) for k in ('par', 'parUid', 'items')})

        print('Ordonnances types : doublons, plusieurs pages (R-E1, R-E2)')
        await ev(f"ordTypes('{pid}')"); await pg.wait_for_timeout(700)
        async def type_(n):
            await ev(f"[...document.querySelectorAll('#otListe tr.m')].find(r=>r.innerText.startsWith({json.dumps(n)})).click()"); await pg.wait_for_timeout(400)
        await type_('Douleurs – palier 1 et 2'); await type_('Douleurs neuropathiques')
        t = await ev(dlg); ok('PARACÉTAMOL 1 g est déjà dans l\'ordonnance' in t.replace('\n', ' '), 'doublon signalé : PARACÉTAMOL déjà dans l\'ordonnance', t)
        await repondre(pg, 'un')
        o = await pg.inner_text('#mdOrdo'); ok(o.count('PARACÉTAMOL 1 g') == 1 and 'ALYSE' in o, '« Garder une seule ligne » : un seul PARACÉTAMOL, le reste ajouté', o[:200])
        ok('Douleurs – palier 1' in await pg.inner_text('#otListe') and 'paliers 1' not in await pg.inner_text('#otListe'), 'titre « Douleurs – palier 1 »')
        await ev(f"ordTypes('{pid}')"); await pg.wait_for_timeout(600)
        for n in ['Rectite radique et proctologie']:
            if await ev(f"!![...document.querySelectorAll('#otListe tr.m')].find(r=>r.innerText.startsWith({json.dumps(n)}))"): await type_(n); await repondre(pg, 'un')
        await ev("mdAfficher()"); await pg.wait_for_timeout(1200)
        await ev("orFormat('A5')"); await pg.wait_for_timeout(500)
        coupe = await ev("[...document.querySelectorAll('#orPage [data-coupe]')].map(e=>e.getAttribute('data-coupe'))")
        ok(coupe and coupe[0] == 'fin de la page 1', 'aperçu : trait « fin de la page 1 » à l\'endroit de la coupure', coupe)
        await ev("window.__win=[]"); await pg.click('#orImp'); await pg.wait_for_timeout(400)
        t = await ev(dlg); ok('tient sur 2 pages' in t and 'Réduire le texte' in t, 'vérification : « L\'ordonnance tient sur 2 pages : réduire le texte / imprimer quand même »', t)
        await repondre(pg, 'ok'); await pg.wait_for_timeout(1000)
        hh = await ev("(window.__win||[]).map(w=>w.w.document._h).join('')")
        pages = hh.count('class="pgp"')
        ok(pages == 2 and 'page 1 / 2' in hh and 'page 2 / 2' in hh and hh.split('class="pgp"')[-1].count('or-pat') >= 1 and hh.split('class="pgp"')[-1].count('or-date') >= 1, 'impression : 2 pages, « page 1 / 2 », même en-tête (date, patient) en haut de la page 2', pages)
        p2 = hh.split('class="pgp"')[-1] if pages else ''
        ok('or-sig' in p2 and 'or-m' in p2, 'signature sur la dernière page avec le dernier médicament (jamais seule)')
        ok(hh.count('class="or-sig"') == 2, '« Cachet et signature » sur chaque page', hh.count('class="or-sig"'))
        ok(not any(seg.rstrip().endswith('or-m">') for seg in hh.split('<div class="pgb">')), 'aucun médicament coupé de sa posologie')
        fs = await ev("window.__fs"); ok((fs.get('utilisateurs/UIDRITA') or {}).get('formatOrdo') == 'A5', 'format retenu pour la personne (son compte, plus le navigateur)')

        print('Antécédents : version gardée, annulée, duplicata, renouvellement, recherche (R-E7)')
        nb0 = len([1 for k, v in (await ev("window.__fs")).items() if k.startswith(E + 'consultations/') and v.get('patientId') == pid for l in v.get('lignes', []) if l.get('t') == 'ordo' and not l.get('annulee')])
        await ev(f"ordAntecedents('{pid}','ordo')"); await pg.wait_for_timeout(800)
        v0 = await ev("(()=>{const o=document.querySelector('.an-l button.on');return o?o.innerText:''})()")
        await ev("anModifier()"); await pg.wait_for_timeout(800); await ev("mdAfficher()"); await pg.wait_for_timeout(800)
        await ev("document.getElementById('orOk').click()"); await repondre(pg, 'ok'); await pg.wait_for_timeout(1200)
        fs = await ev("window.__fs"); lg = [l for k, v in fs.items() if k.startswith(E + 'consultations/') and v.get('patientId') == pid for l in v.get('lignes', []) if l.get('t') == 'ordo']
        ok(any(len(l.get('versions') or []) == 1 and l['versions'][0].get('html') for l in lg), 'modification : la version d\'avant gardée (feuille, date, auteur)', [[(v.get('le'), v.get('lib', '')[:40], len(v.get('html', ''))) for v in (l.get('versions') or [])] for l in lg])
        await ev(f"ordAntecedents('{pid}','ordo')"); await pg.wait_for_timeout(800)
        ok(await ev("!!document.getElementById('anVer')"), 'antécédents : choix de la version (actuelle ou précédente)')
        await ev("window.__win=[]"); await ev("anDuplicata()"); await pg.wait_for_timeout(700)
        hh = await ev("(window.__win||[]).map(w=>w.w.document._h).join('')"); ok('DUPLICATA' in hh, 'duplicata imprimé (mention « DUPLICATA » et date d\'origine)')
        await ev("anSupprimer()"); await pg.wait_for_timeout(900)
        fs = await ev("window.__fs"); lg = [l for k, v in fs.items() if k.startswith(E + 'consultations/') and v.get('patientId') == pid for l in v.get('lignes', []) if l.get('t') == 'ordo']
        ok(lg and lg[-1].get('annulee') and lg[-1].get('html'), 'ordonnance annulée : gardée (feuille, date et auteur de l\'annulation), pas effacée', lg[-1].get('annulee') if lg else None)
        t = await pg.inner_text('#fenetre'); ok('Annulée le' in t and await ev("document.querySelector('.an-b [onclick=\"anImprimer()\"]').disabled"), 'antécédents : « Annulée le … », plus réimprimable')
        await ev(f"ordAntecedents('{pid}','medic')"); await pg.wait_for_timeout(700)
        await ev("anRenouveler()"); await pg.wait_for_timeout(800)
        ok('kg' in await ev("(document.querySelector('#orPage .or-pat2')||{}).innerText||''"), 'renouveler : âge, poids, allergie refaits depuis le dossier')
        await ev("orFermer()"); await ev(f"ordAntecedents('{pid}','ordo')"); await pg.wait_for_timeout(600); await ev("anFermer()"); await pg.wait_for_timeout(1200)
        n = await ev("(()=>{const b=[...document.querySelectorAll('.pr [data-fn=\"prescriptions.compteur\"]')].map(e=>e.closest('.pr').getAttribute('data-fn')+':'+e.textContent);return b.join(' ')})()")
        ok(f'prescriptions.ordo:{nb0 - 1}' in n if nb0 > 1 else 'prescriptions.ordo' not in n, 'compteur sous « Ordo. type » : l\'ordonnance annulée n\'est plus comptée', [nb0, n])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:3]); await pg.close()

        print('Secrétaire : aucune modification de bibliothèque (R-E5)')
        s2 = seed(); s2[E + 'membres/SECR'] = {"role": "assistante", "nom": "Secrétaire Test", "email": "secr@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {"ecrireConsultations": True, "consultations": True, "identite": True}}
        pg = await ouvrir(b, s2); ev = pg.evaluate; await pg.add_init_script("window.__uid='SECR'")
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(700)
        t = await pg.inner_text('#fenetre')
        ok('Nouveau médicament' not in t and 'Ligne libre' in t, 'secrétaire : plus de « Nouveau médicament » ; « Ligne libre » gardée', t[:200])
        ok(not await ev("!!document.querySelector('#mdListe [onclick^=mdSupprimer], #mdListe [onclick^=mdFiche]')"), 'secrétaire : ni modifier ni supprimer')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:3]); await pg.close()

        print('Téléphone 390 px')
        pg = await ouvrir(b, seed(), w=390, h=844); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        await ev(f"ordTypes('{pid}')"); await pg.wait_for_timeout(700)
        await ev("[...document.querySelectorAll('#otListe tr.m')].find(r=>r.innerText.startsWith('Douleurs – palier 1 et 2')).click()"); await pg.wait_for_timeout(300)
        await ev("[...document.querySelectorAll('#otListe tr.m')].find(r=>r.innerText.startsWith('Douleurs neuropathiques')).click()"); await pg.wait_for_timeout(400)
        lg_ = await ev("(()=>{const d=document.querySelector('.or-dlg .boite');if(!d)return null;const r=d.getBoundingClientRect();return [r.left,r.right,document.documentElement.scrollWidth]})()")
        ok(lg_ and lg_[0] >= 0 and lg_[1] <= 390 and lg_[2] <= 390, 'question (doublon) dans l\'écran, sans débordement', lg_)
        await repondre(pg, 'deux'); await ev("mdAfficher()"); await pg.wait_for_timeout(900)
        ok(await ev("document.documentElement.scrollWidth") <= 390, 'ordonnance affichée sans débordement')
        await pg.click('#orOk'); await pg.wait_for_timeout(400)
        t = await ev(dlg); ok('En double' in t, 'vérification avant d\'enregistrer : doublon gardé signalé', t)
        await repondre(pg, 'ok'); await pg.wait_for_timeout(800)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:3]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
