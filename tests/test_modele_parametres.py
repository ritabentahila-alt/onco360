import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Modèle des cabinets neufs ouvert dans Onco360 (20/10/2026, demande de Dr Bentahila : « tout au même endroit, comme un paramétrage de
# médecin ») : page Paramètres du modèle = celle d'un médecin (Cabinet › Tableau de bord ; Dossier patient › Fiche patient, Formulaire et
# Types de consultation, Affichage du dossier ; Listes dans Bibliothèques), sans ce qui est propre à chaque cabinet (lieux, journal, export,
# correspondants). Fiche et formulaire enregistrés dans le modèle de la spécialité (fonction ficheSpecialite, simulée), en entier.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
CAB = E; B = 'espaces/bib-oncologie/'
GS = {'id': 'xgs001', 'lib': 'Groupe sanguin', 'type': 'choix', 'choix': ['A+', 'O+'], 'partie': 'clinique', 'imprimer': True, 'entete': True}
S2 = dict(S)
S2['espaces/bib-oncologie'] = {'nom': 'Bibliothèque Oncologie – Radiothérapie', 'bibliotheque': True, 'titulaire': 'ADM', 'actif': True,
  'abonnement': {'formule': 'bibliotheque', 'modules': {'chimio': True, 'rt': True, 'prescriptions': True, 'listes': True, 'taches': True, 'rcp': True, 'gagenda': True}, 'max': {}},
  'ficheSpe': {'libs': {'mut': 'Organisme'}, 'types': {'ald': 'textelong'}, 'ajouts': [GS]},
  'consultSpe': {'formulaires': [{'id': 'frcp', 'nom': 'RCP', 'champs': ['type', 'd', 'titre', 'note']}], 'typesForm': {'RCP': 'frcp'}}}
S2[B + 'membres/ADM'] = {'role': 'medecin', 'nom': 'Administration Onco360', 'actif': True, 'tousEtablissements': True, 'etablissements': [], 'droits': {'ecrireConsultations': True, 'traitements': 'modifier', 'radiotherapie': 'modifier', 'finances': True, 'parametres': True}}
for k, v in S.items():
    if k.startswith(CAB + 'protocoles/') or k in (CAB + 'parametres/listes', CAB + 'parametres/calendrier'): S2[B + k[len(CAB):]] = v
S2[B + 'finances/tarifs'] = {'data': json.dumps({'repli': '', 'etablissements': {}, 'actesRT': [{'nom': 'Sein', 'prix': 15000}], 'vmat': 10000})}
S2['administrateurs/ADM'] = {'email': 'adm@test.ma'}
MOCK = "window.__uid='ADM';window.__fspe=[];window.__fonctions=Object.assign(window.__fonctions||{},{ficheSpecialite:async(d)=>{window.__fspe.push(d);return {fiche:d.fiche,cabinets:2}}});"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate; await pg.add_init_script(MOCK)
        await pg.goto(f'http://localhost:{PORT}/v2.html?espace=bib-oncologie#parametres/fiche'); await pg.wait_for_timeout(3000)
        t = await pg.inner_text('#page')
        ok(await pg.inner_text('#titrePage') == 'Paramètres du modèle' and 'Rien ne touche le cabinet du Dr Bentahila' in t, 'en-tête « Paramètres du modèle » (barre du haut) : ce que reçoit un cabinet neuf, rien ne touche le cabinet du Dr Bentahila')
        fams = await ev("[...document.querySelectorAll('.cf-fam button')].map(b=>b.textContent.trim())")
        ok(fams[:2] == ['Cabinet', 'Dossier patient'] and 'Agenda et rappels' in fams and 'Bibliothèques' in fams, 'familles comme chez un médecin', fams)
        sous = await ev("[...document.querySelectorAll('.cf-sous button')].map(b=>b.textContent.trim())")
        ok(sous == ['Fiche patient', 'Formulaire de consultation', 'Types de consultation', 'Affichage du dossier'], 'Dossier patient : fiche, formulaire, types de consultation, affichage du dossier (Listes : dans Bibliothèques, lot D)', sous)
        await ev("cfFamille('cabinet')"); await pg.wait_for_timeout(400)
        sc = await ev("[...document.querySelectorAll('.cf-sous button')].map(b=>b.textContent.trim())")
        ok('Tableau de bord' in sc and "Lieux d'exercice" not in sc and "Journal d'audit" not in sc and 'Export des données' not in sc, 'Cabinet : Tableau de bord ; ni lieux, ni journal, ni export (propres à chaque cabinet)', sc)
        # Listes (Bibliothèques, lot D) : comme chez un médecin (localisations, mutuelles, tâches), sans correspondants ; stades et grades depuis leur champ
        await ev("location.hash='parametres/listes'"); await pg.wait_for_timeout(600)
        pl = await ev("[...document.querySelectorAll('#page .puces .puce')].map(b=>b.textContent.trim())")
        ok(any(x.startswith('Localisations') for x in pl) and any(x.startswith('Mutuelles') for x in pl) and not any(x.startswith('Correspondants') or x.startswith('Stades') or x.startswith('Grades') for x in pl), 'Listes : Localisations, Mutuelles (stades, grades : depuis leur champ ; pas de correspondants)', pl)
        # Fiche patient du modèle : celle reçue (Organisme, Groupe sanguin), tout modifiable, enregistrée en entier dans le modèle
        await ev("location.hash='parametres/fiche'"); await pg.wait_for_timeout(600)
        tf = await pg.inner_text('#page')
        ok('Organisme' in tf and 'Groupe sanguin' in tf, 'fiche du modèle affichée (nom « Organisme », champ « Groupe sanguin »)')
        ok(await ev("!!document.querySelector('#page [data-chs=\"xgs001\"]')"), 'champ du modèle modifiable et supprimable (comme dans l\'Administration)')
        await pg.click('#chNouv'); await pg.wait_for_timeout(200); await pg.fill('#chLib', 'Statut'); await pg.select_option('#chType', 'choix'); await pg.fill('#chChoix', 'Nouveau cas\nAncien cas'); await pg.click('#chOk'); await pg.wait_for_timeout(300)
        await pg.uncheck('#page [data-rch="email"]'); await pg.wait_for_timeout(100)
        await ev("cfEnregistrer()"); await pg.wait_for_timeout(1200)
        F = [x for x in await ev("window.__fspe") if x['quoi'] == 'fiche']
        FI = F[-1]['fiche'] if F else {}
        ok(F and F[-1].get('espace') == 'bib-oncologie' and FI.get('libs', {}).get('mut') == 'Organisme' and FI.get('types', {}).get('ald') == 'textelong' and FI.get('champs', {}).get('email') is False
           and sorted(a['lib'] for a in FI.get('ajouts', []) if not a.get('tumeur')) == ['Groupe sanguin', 'Statut'], 'fiche enregistrée dans le modèle, en entier (nom, type, champ retiré, champs ajoutés)', FI)
        ok(not [x for x in await ev("window.__fspe") if x['quoi'] == 'consultation'], 'formulaire de consultation non touché : pas renvoyé')
        ok(not await ev("!!window.__fs['espaces/bib-oncologie/parametres/formulaires']"), 'rien dans parametres/formulaires (c\'est la fiche du modèle, pas des retouches)')
        await ev("location.hash='parametres/consultation'"); await pg.wait_for_timeout(300); await ev("location.hash='parametres/fiche'"); await pg.wait_for_timeout(600)
        ok('Statut' in await pg.inner_text('#page'), 'fiche relue : « Statut » toujours là')
        # Formulaire de consultation du modèle : formulaire « RCP » reçu, champ ajouté avec unité
        await ev("location.hash='parametres/consultation'"); await pg.wait_for_timeout(600)
        ok('RCP' in await pg.inner_text('#page'), 'formulaire du modèle affiché (formulaire « RCP »)')
        await pg.click('#cqNouv'); await pg.wait_for_timeout(200); await pg.fill('#cqLib', 'Tension artérielle'); await pg.select_option('#cqType', 'nombre'); await pg.fill('#cqUnite', 'mmHg'); await pg.click('#cqOk'); await pg.wait_for_timeout(200)
        await ev("cfEnregistrer()"); await pg.wait_for_timeout(1200)
        C = [x for x in await ev("window.__fspe") if x['quoi'] == 'consultation']; CI = C[-1]['fiche'] if C else {}
        ok(C and any(a.get('lib') == 'Tension artérielle' and a.get('unite') == 'mmHg' for a in CI.get('ajouts', [])) and any(f['id'] == 'frcp' for f in CI.get('formulaires', [])) and CI.get('typesForm', {}).get('RCP') == 'frcp', 'formulaire enregistré dans le modèle : champ avec unité, formulaire « RCP » et formulaire du type gardés', CI)
        # Tableau de bord du modèle : enregistré dans ses paramètres (copiés dans chaque cabinet neuf)
        await ev("location.hash='parametres/accueil'"); await pg.wait_for_timeout(600)
        k = await ev("(()=>{const i=document.querySelector('#page .cf-ord input[type=checkbox]:checked');const m=(i.getAttribute('onchange')||'').match(/cfAc\\('([^']+)'/);return m?m[1]:null})()")
        await ev(f"cfAc('{k}', false)"); await ev("cfEnregistrer()"); await pg.wait_for_timeout(1000)
        ac = await ev("window.__fs['espaces/bib-oncologie/parametres/accueil']")
        ok(k and ac and json.loads(ac['data']).get('cartes', {}).get(k) is False, 'Tableau de bord du modèle enregistré (carte retirée : ' + str(k) + ')', ac)
        # Types de consultation et affichage du dossier : présents
        await ev("location.hash='parametres/types'"); await pg.wait_for_timeout(600)
        tv = await ev("[...document.querySelectorAll('#page input')].map(i=>i.value).join('|')"); ok('Types de consultation' in await pg.inner_text('#page') and 'suivi' in tv.lower(), 'Types de consultation présents (types du modèle)', tv[:200])
        await ev("location.hash='parametres/affichage'"); await pg.wait_for_timeout(600)
        ok('colonne Patient' in await pg.inner_text('#page'), 'Affichage du dossier présent')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await ev("location.hash='parametres/fiche'"); await pg.wait_for_timeout(800)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : sans débordement')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
