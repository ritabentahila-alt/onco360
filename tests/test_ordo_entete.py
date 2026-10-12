import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 3.9 (12/10/2026) : en-tête et pied des ordonnances imprimés au choix du cabinet (logo du lieu, médecin, spécialité, INPE, adresse,
# signature scannée) ou papier à en-tête ; choix du médecin signataire quand le cabinet a plusieurs médecins ; carte des médecins publiée.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
HOP = S[E + 'patients/' + pid].get('etablissementId') or 'HGC'
PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
S2 = json.loads(json.dumps(S))
S2[E + 'membres/MED2'] = {"role": "medecin", "nom": "Dr SECOND Médecin", "email": "m2@test.ma", "actif": True, "tousEtablissements": True, "etablissements": [], "droits": {}}
S2[E + 'signataires/MED2'] = {"nom": "Dr SECOND Médecin", "specialite": "Oncologie médicale", "inpe": "999888", "signature": PNG}
S2[E + 'parametres/reglages'] = {"data": json.dumps({"impression": {"a5": [45, 28, 18], "a4": [60, 35, 22], "doc": [45, 35, 22], "age": False, "poids": False, "allergie": False, "entete": "genere", "eLogo": True, "eNom": True, "eSpe": True, "eInpe": True, "eLieu": True, "eSig": True}})}
k = E + 'etablissements/' + HOP
if k in S2: S2[k] = dict(S2[k], adresse='12 rue du Test', tel='0522000000', logo=PNG)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Médecin : carte publiée ; ordonnance avec en-tête imprimé et choix du signataire')
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3500)
        fs = await ev("window.__fs"); uid = await ev("window.__uid || 'UIDB'")
        cartes = [kk for kk in fs if kk.startswith(E + 'signataires/')]
        ok(len(cartes) >= 2, 'carte du médecin connecté publiée (signataires)', cartes)
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(800)
        await ev("(()=>{const b=document.querySelector('#fenetre [onclick^=\"mdAjouter\"]');if(b)b.click()})()"); await pg.wait_for_timeout(300)
        await ev("mdAfficher()"); await pg.wait_for_timeout(600)
        t = await pg.inner_text('#fenetre')
        ok(await ev("!!document.querySelector('#orCadre .or-apercu .or-ent')") and 'Tél.' in t, 'aperçu : en-tête (médecin) et pied (lieu, téléphone)', t[:300])
        ok(await ev("!!document.getElementById('orSig') && document.getElementById('orSig').options.length >= 2"), '« Signée par » : choix entre les médecins du cabinet')
        await pg.select_option('#orSig', 'MED2'); await ev("orSignataire('MED2')"); await pg.wait_for_timeout(200)
        ok('Dr SECOND Médecin' in await pg.inner_text('#orPage') and 'INPE : 999888' in await pg.inner_text('#orCadre'), 'signataire changé : nom sous la signature, INPE dans l\'en-tête')
        await ev("window.__win=[]"); await pg.click('#orImp'); await pg.wait_for_timeout(1500)
        hh = await ev("(window.__win||[]).map(w=>w.w?w.w.document._h:(w.document||{})._h||'').join('')")
        ok('or-ent' in hh and 'or-pied' in hh and 'or-esig' in hh and 'INPE : 999888' in hh and '12 rue du Test' in hh, 'impression : en-tête, pied, signature scannée du signataire', hh[:300])
        cs = [v for kk, v in (await ev("window.__fs")).items() if kk.startswith(E + 'consultations/') and v.get('patientId') == pid]
        lg = [l for c in cs for l in (c.get('lignes') or []) if l.get('medUid') == 'MED2']
        ok(lg and lg[0].get('med') == 'Dr SECOND Médecin' and 'or-ent' not in lg[0].get('html', ''), 'enregistrée : signataire noté, en-tête non enregistré dans le texte', lg[:1])
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/impression'); await pg.wait_for_timeout(1500)
        t = await pg.inner_text('#page')
        ok('En-tête des ordonnances et courriers' in t and 'Papier à en-tête' in t and 'Signature scannée' in t, 'Paramètres › Impression : choix de l\'en-tête')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()

        print('Papier à en-tête : rien d\'imprimé en haut')
        S3 = json.loads(json.dumps(S2)); S3[E + 'parametres/reglages'] = {"data": "{}"}
        pg = await ouvrir(b, S3); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(3000)
        await ev(f"ordMedicaments('{pid}')"); await pg.wait_for_timeout(800); await ev("mdAfficher()"); await pg.wait_for_timeout(500)
        ok(not await ev("!!document.querySelector('#orCadre .or-apercu')"), 'pas d\'aperçu d\'en-tête (papier à en-tête)')
        await ev("window.__win=[]"); await pg.click('#orImp'); await pg.wait_for_timeout(1500)
        hh = await ev("(window.__win||[]).map(w=>w.w?w.w.document._h:(w.document||{})._h||'').join('')")
        ok(hh and 'class="or-ent"' not in hh and 'class="or-esig"' not in hh, 'impression sans en-tête ni signature scannée', hh[:200])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
