import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Heures d'une séance de chimio (12/10/2026) : le médecin propose l'heure de consultation de la prochaine séance à la validation ;
# l'infirmière, depuis son planning, ajoute l'heure et la durée de la séance (hôpital de jour) sans toucher à l'heure du médecin ;
# sans heure du médecin, la consultation se place juste avant la séance. Le médecin ne voit jamais la durée de la chimio.
import re
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
def lignes_de(seed): return {k.split('/')[-1]: json.loads(v.get('lignesJson') or '[]') for k, v in seed.items() if k.startswith(E + 'patients/')}
cible = [(pid, i, k) for pid, ls in lignes_de(S).items() for i, L in enumerate(ls) for k, c in enumerate(L.get('cures', [])) if c.get('st', 'prevue') == 'prevue' and (k == 0 or L['cures'][k - 1].get('st') == 'recue') and L.get('pr')]
pid, i, k = cible[0]
MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
def date_de(t):
    m = re.search(r'(\d{1,2}) (' + '|'.join(MOIS) + r') (\d{4})', t)
    return f"{m.group(3)}-{MOIS.index(m.group(2)) + 1:02d}-{int(m.group(1)):02d}" if m else None
S_INF = json.loads(json.dumps(S))
S_INF[E + 'membres/INF'] = {"role": "infirmiere", "nom": "INF Test", "email": "inf@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [],
    "droits": {"identite": False, "fichePatient": False, "rendezvous": False, "consultations": False, "planningChimio": False, "traitements": "voir", "radiotherapie": "chimio", "documents": False, "administrer": True}}
S_INF['utilisateurs/INF'] = {"nom": "INF Test"}
_id = S[E + 'patients/' + pid]['identite']
NOM = (_id.get('nom') or (str(_id.get('nomF', '')).upper() + ' ' + str(_id.get('prenom', '')))).strip()
# Planning du jour d (vue Liste), lignes du patient seulement : « HH:MM | texte »
async def agenda(pg, d):
    await pg.goto(f'http://localhost:{PORT}/v2.html#agenda'); await pg.wait_for_timeout(2500)
    await pg.evaluate(f"agVue('liste'); agJour('{d}')"); await pg.wait_for_timeout(1200)
    return await pg.evaluate("(n)=>{const j=document.querySelector('#page .jour7');return j?[...j.querySelectorAll('.ev')].filter(e=>e.innerText.includes(n)).map(e=>e.innerText.replace(/\\n/g,' | ')).join('\\n'):''}", NOM)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Médecin : validation sans fenêtre en plus, puis heure depuis « Rendez-vous et tâches à venir »')
        pg = await ouvrir(b, S_INF); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
        await ev(f"chOuvrir('{pid}', {i}, {k}, 1)"); await pg.wait_for_timeout(1200)
        await ev(f"chValiderJ1('{pid}', {i}, {k})"); await pg.wait_for_timeout(2500)
        ok(not await ev("!!document.getElementById('hNon')") and 'Prochaine séance' not in (await ev("(document.getElementById('fenetreCorps')||{}).innerText||''")), 'plus de fenêtre « Prochaine séance » après la validation')
        await ev("fermerFenetre(); fermerFenetre()"); await ev(f"ouvrirDossier('{pid}')"); await pg.wait_for_timeout(1500)  # lot G : la petite fenêtre, puis le panneau de la cure
        mod = await ev("(()=>{const b=[...document.querySelectorAll('#rdvListe button')].find(x=>/chModifierRdvChimio/.test(x.getAttribute('onclick')||''));return b?b.getAttribute('onclick'):null})()")
        ok(mod is not None, 'bouton « Modifier » sur la prochaine séance de chimio', mod)
        await ev(mod); await pg.wait_for_timeout(600)
        t = await pg.inner_text('#fenetreCorps'); d = await ev("document.getElementById('mD').value")
        ok('Heure de la consultation' in t and 'Durée' not in t and d, 'fenêtre : date et heure de la consultation, sans durée', t[:200])
        await pg.fill('#mH', '09:30'); await pg.click('#fOk'); await pg.wait_for_timeout(2000)
        fs = await ev("window.__fs"); H = fs[E + 'patients/' + pid].get('heures') or {}
        cle = [c for c, v in H.items() if (v or {}).get('cons')]
        ok(len(cle) == 1 and H[cle[0]]['cons']['h'] == '09:30', 'consultation notée dans le dossier (champ « heures »)', H)
        ok('09:30' in (await ev("[...document.querySelectorAll('#rdvListe .rdv')].map(e=>e.innerText).join('|')")), 'heure affichée dans « Rendez-vous et tâches à venir »')
        t = await agenda(pg, d)
        ok('09:30' in t and 'Consultation' in t and 'Séance ·' not in t, 'planning du médecin : consultation à 09:30, pas de séance', t[:300])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        S2 = json.loads(json.dumps(fs))

        print('Infirmière : son planning, la séance après la consultation')
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.add_init_script("window.__uid='INF'")
        t = await agenda(pg, d)
        ok('Consultation du médecin' in t and '09:30' in t, 'elle voit la consultation du médecin (09:30)', t[:400])
        clic = await ev("(n)=>{const e=[...document.querySelectorAll('#page .jour7')][0];const r=e&&[...e.querySelectorAll('.ev')].find(x=>x.innerText.includes(n)&&/Journée/.test(x.innerText)&&!/Consultation/.test(x.innerText));return r?r.getAttribute('onclick'):null}", NOM)
        n = clic
        ok(clic is not None, 'séance sans heure dans la ligne « Journée »', n)
        if clic:
            await ev(clic); await pg.wait_for_timeout(500); await pg.click('#fenetre button:has-text("Modifier / décaler")'); await pg.wait_for_timeout(600)  # 3.16
            t = await pg.inner_text('#fenetreCorps')
            ok('hôpital de jour' in t and 'Durée prévue' in t and await ev("document.getElementById('hS').value") == '09:45', 'fenêtre de l\'infirmière : heure proposée 09:45 (après la consultation), durée', t[:300])
            await pg.select_option('#hDu', '180'); await pg.click('#hOk'); await pg.wait_for_timeout(2000)
        H = (await ev("window.__fs"))[E + 'patients/' + pid].get('heures') or {}
        v = H.get(cle[0]) or {}
        ok((v.get('seance') or {}).get('h') == '09:45' and v['seance']['du'] == 180 and v['cons']['h'] == '09:30' and v['cons']['par'] != 'INF', 'séance 09:45 · 3 h notée ; consultation du médecin inchangée', v)
        pl0 = S2[E + 'patients/' + pid].get('planningJson'); pl1 = (await ev("window.__fs"))[E + 'patients/' + pid].get('planningJson')
        ok(pl0 == pl1, 'le planning (les dates) n\'est pas touché')
        t = await agenda(pg, d)
        ok('Séance' in t and '09:45' in t, 'son planning : la séance à 09:45', t[:400])
        await ev(f"agVue('jour'); agJour('{d}')"); await pg.wait_for_timeout(1000)
        drag = await ev("[...document.querySelectorAll('#page [draggable]')].some(e=>/Consultation du médecin/.test(e.innerText))")
        ok(not drag, 'la consultation du médecin n\'est pas déplaçable par l\'infirmière')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Médecin : toujours sa consultation, jamais la durée')
        H2 = json.loads(json.dumps(S2)); H2[E + 'patients/' + pid]['heures'] = {cle[0]: v}
        pg = await ouvrir(b, H2); ev = pg.evaluate
        t = await agenda(pg, d)
        ok('09:30' in t and '09:45' not in t and '3 h' not in t, 'planning du médecin : 09:30 seulement', t[:400])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Sans heure du médecin : consultation placée juste avant la séance de l\'infirmière')
        H3 = json.loads(json.dumps(S2)); H3[E + 'patients/' + pid]['heures'] = {cle[0]: {'seance': {'h': '11:00', 'du': 120, 'par': 'INF'}}}
        pg = await ouvrir(b, H3); ev = pg.evaluate
        t = await agenda(pg, d)
        ok('10:45' in t and 'Consultation' in t and '11:00' not in t, 'planning du médecin : consultation à 10:45', t[:400])
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2000)
        kk, jj = [int(z) for z in cle[0].split('|')[1:]]
        await ev(f"chHeure('{pid}', {i}, {kk - 1}, {jj})"); await pg.wait_for_timeout(800)
        t = await pg.inner_text('#fenetreCorps')
        ok('Placée pour l\'instant à 10:45' in t and 'Durée' not in t, 'fenêtre du médecin : consultation automatique expliquée, sans durée', t[:400])
        await pg.fill('#hS', '10:00'); await pg.click('#hOk'); await pg.wait_for_timeout(2000)
        v = ((await ev("window.__fs"))[E + 'patients/' + pid].get('heures') or {}).get(cle[0]) or {}
        ok(v.get('cons', {}).get('h') == '10:00' and v.get('seance', {}).get('h') == '11:00', 'le médecin fixe 10:00 ; la séance de l\'infirmière reste à 11:00', v)
        await ev(f"chChamp('{pid}', {i}, {kk - 1}, 'pctAll', '90', 1)"); await pg.wait_for_timeout(1500)
        doc = (await ev("window.__fs"))[E + 'patients/' + pid]
        ok('"hc"' not in doc.get('lignesJson', '') and '"hcm"' not in doc.get('lignesJson', '') and '11:00' not in doc.get('planningJson', ''), 'enregistrement du médecin : les heures ne passent ni dans les lignes ni dans le planning')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
