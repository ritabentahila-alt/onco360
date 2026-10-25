import pathlib, sys; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# Lot R-G (audit n° 5, 19/10/2026) : « rien ne disparaît ». Liste des actions du dossier patient (fonctions appelées par les boutons et
# liens, onglets), rôle par rôle (médecin titulaire, secrétaire, infirmière), sur deux patients fictifs (chimio + RT, chimio seule).
# `python test_dossier_boutons.py --ref` : écrit la référence (faite le 19/10/2026 sur la disposition d'avant le lot G) ;
# sans option : compare, et toute action de la référence absente est une erreur.
import re
REF = ICI / 'dossier_boutons_ref.json'
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
S2, PIDS = avec_demo(S, E)
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
for u, r in [('SEC', 'assistante'), ('INF', 'infirmiere')]:
    S2[E + 'membres/' + u] = {'role': r, 'nom': u, 'email': u.lower() + '@test.ma', 'actif': True, 'tousEtablissements': True, 'etablissements': [], 'droits': {}}
    S2['utilisateurs/' + u] = {'nom': u}
# Une consultation et un document pour le patient 8 (boutons des consultations et des documents)
def pid(n):
    for k, v in S2.items():
        if k.startswith(E + 'patients/') and (v.get('identite') or {}).get('nomF') == 'PATIENT TEST ' + str(n): return k.split('/')[-1]
P8, P2 = pid(8), pid(2)
S2[E + 'consultations/CS1'] = {'patientId': P8, 'etablissementId': 'DEMO', 'd': '2026-10-01', 'type': 'Consultation de suivi', 'titre': '', 'note': 'Bonne tolérance.', 'lignes': [{'id': 'L1', 't': 'medic', 'd': '2026-10-01', 'lib': 'Ordonnance', 'par': 'Dr Bentahila', 'html': '<p>x</p>', 'format': 'A5'}], 'o': 1, 'creePar': 'UIDRITA', 'creeParNom': 'Dr Bentahila'}
S2[E + 'consultations/CS2'] = {'patientId': P8, 'etablissementId': 'DEMO', 'd': '2026-09-20', 'type': 'Annonce', 'titre': '', 'note': 'Annonce faite.', 'lignes': [], 'o': 0, 'creePar': 'UIDRITA', 'creeParNom': 'Dr Bentahila'}
S2[E + 'fichiers/F1'] = {'patientId': P8, 'etablissementId': 'DEMO', 'titre': 'Compte rendu', 'd': '2026-09-15', 'type': 'Comptes-rendus', 'nom': 'cr.pdf', 'taille': 1000, 'mime': 'application/pdf', 'chemin': 'x/cr.pdf', 'creePar': 'UIDRITA', 'creeParNom': 'Dr Bentahila', 'o': 1}
JS = r"""(() => {
  const s = new Set(), f = (t) => { (String(t || '').match(/[A-Za-z_$][\w$]*(?=\()/g) || []).forEach((n) => { if (!/^(this|event|document|if|return|confirm|setTimeout|getElementById|closest|toggle|contains|stopPropagation|preventDefault|querySelector|querySelectorAll|classList|replace|focus|select|click|blur|function)$/.test(n)) s.add(n); }); };
  document.querySelectorAll('#page [onclick], #page [onchange], #page [oninput], #fenetre [onclick]').forEach((e) => { f(e.getAttribute('onclick')); f(e.getAttribute('onchange')); });
  document.querySelectorAll('#page a[href^="#"], #titrePage a[href^="#"]').forEach((a) => s.add('lien:' + a.getAttribute('href').split('/')[0])); // lot A : « ‹ Patients » dans la barre du haut
  document.querySelectorAll('#page [role=tab][id]').forEach((t) => s.add('onglet:' + t.id));
  return [...s].sort();
})()"""
async def actions(b, uid, p):
    pg = await ouvrir(b, S2, w=1440, h=900); await pg.add_init_script(f"window.__uid='{uid}'")
    await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{p}'); await pg.wait_for_timeout(3500)
    await pg.evaluate(f"window.voirAvTout && voirAvTout('{p}')"); await pg.wait_for_timeout(600)  # T4 (24/10) : 5 prochains, puis « Voir tout » : rien ne disparaît
    tout = set(await pg.evaluate(JS))
    # photo du bandeau agrandie au clic (lot G) : « Changer ou retirer la photo » dans la fenêtre
    if await pg.evaluate("!!document.querySelector('.bn-ph')"):
        await pg.evaluate("document.querySelector('.bn-ph').click()"); await pg.wait_for_timeout(300); tout |= set(await pg.evaluate(JS)); await pg.evaluate("fermerFenetre()")
    for t in await pg.evaluate("[...document.querySelectorAll('#page [role=tab][id]')].map(t => t.id)"):
        await pg.evaluate(f"document.getElementById('{t}').click()"); await pg.wait_for_timeout(500)
        tout |= set(await pg.evaluate(JS))
    errs = pg.errs[:]; await pg.close(); return sorted(tout), errs
async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for uid, role in [('UIDRITA', 'medecin'), ('SEC', 'secretaire'), ('INF', 'infirmiere')]:
            for n, pp in [(8, P8), (2, P2)]:
                a, errs = await actions(b, uid, pp); res[role + '|' + str(n)] = a
                ok(not errs, f'{role}, patient {n} : aucune erreur JavaScript', errs[:2])
        await b.close()
    if '--ref' in sys.argv:
        json.dump(res, open(REF, 'w'), ensure_ascii=False, indent=1); print('Référence écrite :', REF); return
    ref = json.load(open(REF))
    # même action, autre place (lot G) : menu et plein écran de l'aperçu de l'onglet → ceux de la visionneuse de droite (ordinateur)
    # lot A (25/10/2026) : Afficher et Modifier du bandeau → titre de la rubrique (formulaire entier ou lecture au centre, dosRubrique)
    EQUIV = {'fiMenu': 'dvMenu', 'fiPleinEcran': 'dvPleinEcran', 'afficherPatient': 'dosRubrique', 'modifierIdentite': 'dosRubrique'}
    for k in res: res[k] = res[k] + [a for a, b in EQUIV.items() if b in res[k]]
    for k, L in ref.items():
        manque = [a for a in L if a not in res.get(k, [])]
        ok(not manque, f'{k} : les {len(L)} actions d\'avant sont toujours là', manque)
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
