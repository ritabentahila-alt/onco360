import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 20/10/2026 (demande de Dr Bentahila) : la fiche du patient se modifie une partie à la fois. Nouveau patient (Patients, tableau de bord,
# agenda, salle d'attente : même fenêtre) et « Modifier » du bandeau = Identité et administratif seulement ; Informations médicales et
# Fiche tumeur : chacune par son « Modifier » dans la colonne Patient. Ordinateur et téléphone (390 px).
# Lot A (25/10/2026) : plus de bandeau ni de « Modifier » : le titre de la rubrique ouvre sa partie au centre.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and json.loads(v.get('lignesJson') or '[]')][0]
SECS = "[...document.querySelectorAll('#fenetre .fp-sec')].map(h=>h.textContent)"
SECP = "[...document.querySelectorAll(':is(#panneau,#fenetre):not(.cache) .fp-sec')].map(h=>h.textContent)"  # lot A (25/10/2026) : rubrique ouverte au centre (en fenêtre sur téléphone)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w in (1440, 390):
            print(f'Largeur {w} px')
            pg = await ouvrir(b, S, w=w); ev = pg.evaluate
            await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(2500)
            # Lot A (25/10/2026) : plus de bandeau ni de « Modifier » ; le titre d'une rubrique ouvre sa partie au centre (formulaire)
            await ev("document.querySelector('details.dp[data-p=id] .dp-t').click()"); await pg.wait_for_timeout(500)
            ok(await ev(SECP) == ['Identité et administratif'], 'titre « Identité et administratif » : cette partie seulement', await ev(SECP))
            ok(await ev("!!document.getElementById('fNomF') && !document.getElementById('fPoids') && !document.getElementById('fDiag') && !document.getElementById('fStatut') && !!document.getElementById('fSup')"), 'nom, pas de poids, de localisation ni de statut ; « Supprimer le patient » reste là')
            r = await ev("(()=>{const f=document.getElementById('panneau');return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,fw:f.scrollWidth,fc:f.clientWidth}})()")
            ok(r['sw'] <= r['cw'] + 1 and r['fw'] <= r['fc'] + 1, 'aucun débordement', r)
            await ev("fermerFenetre()")
            for k, lib, champ in [('id', 'Identité et administratif', 'fNomF'), ('med', 'Informations médicales', 'fPoids'), ('tum', 'Fiche tumeur', 'fDiag')]:
                await ev(f"document.querySelector('details.dp[data-p={k}] .dp-t').click()"); await pg.wait_for_timeout(500)
                ok(await ev(SECP) == [lib] and await ev(f"!!document.getElementById('{champ}')"), f'colonne Patient, titre « {lib} » : cette partie seulement', await ev(SECP))
                ok(await ev("!!document.getElementById('fStatut')") == (k == 'med'), f'statut du patient {"présent" if k == "med" else "absent"}')
                await ev("fermerFenetre()")
            # Enregistrer l'identité seule ne touche pas aux informations médicales
            c0 = (await ev("window.__fs"))[E + 'patients/' + pid].get('clinique')
            await ev(f"modifierIdentite('{pid}')"); await pg.wait_for_timeout(400); await pg.fill('#fTel', '0661000000'); await pg.click('#fOk'); await pg.wait_for_timeout(1500)
            d = (await ev("window.__fs"))[E + 'patients/' + pid]
            ok(d['identite'].get('tel') == '0661000000' and d.get('clinique') == c0, 'identité enregistrée, informations médicales inchangées (poids et sa date compris)')
            # Informations médicales seules : poids enregistré, identité inchangée
            i0 = d['identite']
            await ev(f"modifierIdentite('{pid}','med')"); await pg.wait_for_timeout(400); await pg.fill('#fPoids', '71'); await pg.click('#fOk'); await pg.wait_for_timeout(1500)
            d = (await ev("window.__fs"))[E + 'patients/' + pid]
            ok(str(d['clinique'].get('poids')) == '71' and d['identite'] == i0, 'informations médicales enregistrées, identité inchangée', d['clinique'].get('poids'))
            # Nouveau patient (page Patients) et depuis un nouveau rendez-vous (agenda, tableau de bord, salle d'attente)
            await ev("nouveauPatient()"); await pg.wait_for_timeout(400)
            ok(await ev(SECS) == ['Identité et administratif'] and not await ev("!!document.getElementById('fPoids')||!!document.getElementById('fDiag')"), 'Nouveau patient : Identité et administratif seulement')
            await ev("fermerFenetre()"); await ev("nouveauRdv()"); await pg.wait_for_timeout(400)
            await pg.fill('#rq', 'Zzessai Nouveau'); await pg.wait_for_timeout(300)
            if await ev("!!document.getElementById('rqNv')"):
                await ev("document.getElementById('rqNv').click()"); await pg.wait_for_timeout(400)
                ok(await ev(SECS) == ['Identité et administratif'] and await ev("document.getElementById('fNomF').value") == 'ZZESSAI', 'Nouveau rendez-vous › nouveau patient : Identité et administratif seulement, nom repris')
                await pg.fill('#fPrenom', 'Nouveau'); await pg.click('#fOk'); await pg.wait_for_timeout(1500)
                np = [v for k, v in (await ev("window.__fs")).items() if k.startswith(E + 'patients/') and (v.get('identite') or {}).get('nomF') == 'ZZESSAI']
                ok(np and not (np[0].get('clinique') or {}).get('poids'), 'dossier créé sans partie médicale')
            else: ok(False, 'bouton « Nouveau patient » du rendez-vous introuvable')
            ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
