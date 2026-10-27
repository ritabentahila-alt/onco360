import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot E (25/10/2026, demande de Dr Bentahila) : règles communes, d'abord sur la page témoin Tâches (à valider avant les autres pages) : trois niveaux de
# boutons (un seul principal), couleur seulement pour ce qui demande une action, explication sous « ? », état vide (une phrase, un bouton), fenêtres
# (✕ en haut à droite, boutons en bas à droite, Échap), texte jamais sous 13 px ; ordinateur et téléphone. Jeu fictif.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
s = json.loads(json.dumps(S)); pid = [k.split('/')[-1] for k in s if k.startswith(E + 'patients/') and k.count('/') == 3][0]
def tache(i, **o):
    d = {'titre': 'Tâche %d' % i, 'desc': '', 'type': 'Administratif', 'urgent': False, 'ech': '', 'h': '', 'patientId': '', 'patientNom': '', 'etablissementId': '', 'de': 'UIDRITA', 'deNom': 'Dr TEST',
         'pour': 'UIDRITA', 'pourNom': 'Dr TEST', 'qui': ['UIDRITA'], 'statut': 'afaire', 'fil': [{'le': '2026-10-05T10:00:00Z', 'par': 'UIDRITA', 'parNom': 'Dr TEST', 'txt': 'Créée'}], 'o': i}
    d.update(o); return d
s[E + 'taches/T1'] = tache(1, titre='Relancer le laboratoire', ech='2026-10-03', urgent=True, patientId=pid, patientNom='PATIENT TEST REF 1')
s[E + 'taches/T2'] = tache(2, titre='Appeler la mutuelle', ech='2026-10-06', statut='encours')
s[E + 'taches/T3'] = tache(3, titre='Préparer le dossier RCP', ech='2026-10-12', desc='Imagerie et anapath à joindre.')
VIS = "(e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'"
# Contraste d'au moins 4,5 pour 1 (critère du lot E) : couleur du texte contre le premier fond non transparent de ses parents
CONTRASTE = """(() => { const rgb = (c) => (c.match(/[\\d.]+/g) || []).map(Number), lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const fond = (e) => { for (let x = e; x; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c.length === 3 || c[3] > 0.5) return c.slice(0, 3); } return [255, 255, 255]; };
  return [...document.querySelectorAll('.p-ta *')].filter(e => (VIS)(e) && !e.closest('.cache') && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => { const a = lum(rgb(getComputedStyle(e).color)), b = lum(fond(e)); return [e.tagName + '.' + e.className + ' « ' + e.textContent.trim().slice(0, 16) + ' »', Math.round((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) * 100) / 100]; }).filter(x => x[1] < 4.5); })()""".replace('VIS', VIS)
PETITS = "[...document.querySelectorAll('.p-ta *')].filter(e => (" + VIS + ")(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 13 && !e.closest('.cache')).map(e => e.tagName + '.' + e.className + ' ' + getComputedStyle(e).fontSize + ' « ' + e.textContent.trim().slice(0, 20) + ' »')"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (390, 900, 1280, 1600):  # largeurs des critères d'acceptation de la fiche
            print('Page Tâches (' + str(w) + ' px)')
            pg = await ouvrir(b, s, w=w, h=900 if w > 500 else 844); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#taches'); await pg.wait_for_timeout(3000)
            r = await ev("(() => { const v = " + VIS + "; return { b1: [...document.querySelectorAll('.p-ta .b1')].filter(v).map(e => e.textContent.trim()), imp: document.getElementById('taImp').className, vieux: [...document.querySelectorAll('.p-ta .bt')].filter(v).length }; })()")
            ok(r['b1'] == ['Nouvelle tâche'] and r['imp'] == 'b2' and r['vieux'] == 0, 'un seul bouton principal (« Nouvelle tâche ») ; Imprimer en secondaire ; plus d\'anciens boutons', r)
            c = await ev("(() => { const t = [...document.querySelectorAll('.tache')], f = (re) => t.find(e => re.test(e.innerText)); const en = f(/mutuelle/), ur = f(/laboratoire/); return { auj: !!en.querySelector('.ta-neutre') && !en.querySelector('.badge.b-or'), bordEn: getComputedStyle(en.querySelector('.c-t > svg')).color, bordUr: getComputedStyle(ur.querySelector('.c-t > svg')).color, selEn: getComputedStyle(en.querySelector('select.st')).color, rouge: [...ur.querySelectorAll('.badge.b-al')].map(e => e.textContent) }; })()")
            ok(c['auj'] and c['bordEn'] != c['bordUr'] and c['selEn'] in ('rgb(85, 96, 122)', 'rgb(47, 85, 151)', 'rgb(30, 42, 68)', 'rgb(0, 38, 76)') and c['bordUr'] == await ev("getComputedStyle(document.body).getPropertyValue('--d-danger').trim() === '#E5004C' ? 'rgb(229, 0, 76)' : ''") and c['rouge'] == ['Urgent', 'En retard'], 'couleur seulement pour ce qui demande une action (drapeau rouge si urgent, en retard) ; « Aujourd\'hui » neutre ; statut en pastille douce (26/10/2026)', c)
            ok(await ev("document.querySelector('.ta-entete .sous').offsetParent === null") and not await ev("!!document.querySelector('.q-aide')"), 'en-tête de la liste : ni nombre ni « ? » sans filtre (26/10/2026, style minimaliste)')
            ok(await ev("[...document.querySelectorAll('#taL .ta-h span')].map(e => e.textContent).join('|')") == 'Tâche|Patient|Assignée à|Créée par|Échéance|Statut' or w < 900, 'tableau : Tâche, Patient, Assignée à, Créée par, Échéance, Statut')
            ok(not await ev(PETITS), 'aucun texte sous 13 px', await ev(PETITS))
            ok(await ev("document.documentElement.scrollWidth") <= w, 'rien ne déborde')
            ok(not await ev(CONTRASTE), 'contraste d\'au moins 4,5 pour 1', await ev(CONTRASTE))
            # fenêtre d'une tâche : ✕ en haut à droite, boutons en bas à droite, un seul principal, Échap
            await ev("taOuvrir('T1')"); await pg.wait_for_timeout(800)
            f = await ev("(() => { const v = " + VIS + ", bo = document.getElementById('fenetreCorps').getBoundingClientRect(), x = document.querySelector('#fenetreCorps .fen-x').getBoundingClientRect(); const bt = [...document.querySelectorAll('#taFiche .boutons button')]; return { x: [Math.round(bo.right - x.right), Math.round(x.top - bo.top)], b1: [...document.querySelectorAll('#fenetreCorps .b1')].filter(v).map(e => e.textContent.trim()), bas: bt.map(e => e.textContent.trim() + ':' + e.className), vieux: [...document.querySelectorAll('#fenetreCorps .bt')].filter(v).length }; })()")
            ok(0 <= f['x'][0] <= 24 and 0 <= f['x'][1] <= 24, 'fenêtre : ✕ en haut à droite', f['x'])
            ok(f['b1'] == ['Envoyer'] and f['bas'][-2:] == ['Fermer:b2', 'Modifier:b2'] and f['vieux'] == 0, 'un seul principal ; Fermer en secondaire, en bas à droite ; plus d\'anciens boutons', f)
            ok(not await ev(PETITS), 'fenêtre : aucun texte sous 13 px', await ev(PETITS))
            ok(not await ev(CONTRASTE), 'fenêtre : contraste d\'au moins 4,5 pour 1', await ev(CONTRASTE))
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
            ok(await ev("document.getElementById('fenetre').classList.contains('cache')"), 'Échap ferme la fenêtre')
            await ev("taNouvelle()"); await pg.wait_for_timeout(800)
            f = await ev("[...document.querySelectorAll('#fenetreCorps .boutons button')].map(e => e.textContent.trim() + ':' + e.className)")
            ok(f == ['Annuler:b2', 'Créer la tâche:b1'] and await ev("!!document.querySelector('#fenetreCorps .fen-x')"), 'Nouvelle tâche : ✕, puis Annuler (secondaire) et Créer la tâche (principal) en bas à droite', f)
            await ev("document.querySelector('#fenetreCorps .fen-x').click()"); await pg.wait_for_timeout(300)
            ok(await ev("document.getElementById('fenetre').classList.contains('cache')"), '✕ ferme la fenêtre')
            # état vide : une phrase grise centrée, un seul bouton
            await pg.fill('#taQ', 'zzzz-aucune'); await ev("document.getElementById('taQ').dispatchEvent(new Event('input'))"); await pg.wait_for_timeout(300)
            v = await ev("(() => { const z = document.querySelector('#taL .vide-e'); return z ? [z.querySelector('p').textContent, [...z.querySelectorAll('button')].map(e => e.textContent.trim() + ':' + e.className), getComputedStyle(z).textAlign] : null; })()")
            ok(v and v[0] == 'Aucune tâche ne correspond aux filtres.' and v[1] == ['Effacer les filtres:b2'] and v[2] == 'center', 'état vide : une phrase, un bouton', v)
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
