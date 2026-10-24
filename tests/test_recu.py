import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# R-B5 (19/10/2026, demande du 17/10 + audit n° 6, lot F1) : nouveau reçu A5 (mise en page du ticket envoyé par le cabinet) : lieu et date,
# « REÇU » encadré, tableau N° / Patient / Médecin / Prestation / Encaissement, « Visa accueil », mentions (IF, TP, ICE, INPE, spécialité,
# adresse, exonération de TVA à cocher), une page ; IF, TP, ICE dans le profil du médecin ; prix changé après un reçu : avertissement et
# historique ; reçu sans numéro : noté au journal. Patient et identifiants fictifs.
import re, html as H
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
S2, PIDS = avec_demo(S, E); P7 = PIDS[6]
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
d7 = S2[E + 'patients/' + P7]; rd = json.loads(d7['rdvsJson']); rd[0].update(d='2026-10-06', h='09:30', st='fait', dv='2026-10-06'); RID = rd[0]['id']; d7['rdvsJson'] = json.dumps(rd)
d7['identite'] = dict(d7['identite'], numero='202610007')
S2[E + 'encaissements/' + P7] = {'data': json.dumps({'rdv': {RID: {'m': 400, 'mode': 'esp'}}})}
# identifiants fictifs dans le profil du médecin (Mon compte) : sa carte (signataires/{uid}) en est republiée au démarrage
S2['utilisateurs/UIDRITA'] = dict(S2.get('utilisateurs/UIDRITA') or {}, titre='Dr', nom='TEST', prenom='Médecin', specialite='Oncologie médicale', inpe='111111111', idFiscal='IF-TEST-1', tp='TP-TEST-2', ice='ICE-TEST-3')
S2[E + 'etablissements/DEMO'] = {'code': 'DEMO', 'nom': 'Clinique de démonstration', 'adresse': 'Boulevard Fictif', 'ville': 'Casablanca', 'tel': '0522000000', 'actif': True}
S2[E + 'parametres/reglages'] = {'data': json.dumps({'impression': {'entete': 'genere'}})}
async def recu(pg):
    ev = pg.evaluate; n0 = await ev("window.__win.length")
    await ev(f"recuRdv('{P7}', '{RID}')"); await pg.wait_for_timeout(1500)
    return await ev(f"(window.__win.length > {n0}) ? window.__win[window.__win.length - 1].w.document._h : ''")
async def pages(b, html):
    if os.environ.get('NAVIGATEUR') == 'webkit': return 1  # PDF : Chrome seulement (outil de test) ; le nombre de pages est vérifié sous Chrome
    pp = await b.new_page(); await pp.set_content(html); await pp.wait_for_timeout(200); pdf = await pp.pdf(prefer_css_page_size=True); await pp.close()
    return len(re.findall(rb'/Type\s*/Page[^s]', pdf))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P7}'); await pg.wait_for_timeout(3500)
        html = await recu(pg); t = H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html)))
        ok('Clinique de démonstration' in t and 'Date : 06/10/2026' in t and '>REÇU<' in html.replace(' ', ''), 'en haut : lieu (en-tête imprimé) et « Date : 06/10/2026 » ; « REÇU » encadré', t[:200])
        ok('N° de reçu R-2026-0001' in t, 'N° de reçu R-2026-0001', t[t.find('N°'):][:60])
        ok('Patient PATIENT TEST 7' in t and 'Dossier n° 202610007' in t, 'patient et n° de dossier')
        ok('Médecin Dr TEST Médecin' in t and '<i>Oncologie médicale</i>' in html, 'médecin de l\'acte, spécialité en italique')
        ok("Prestation Consultation d'annonce" in t and 'du 06/10/2026' in t, 'prestation et sa date', t[t.find('Prestation'):][:80])
        ok('400,00 DH' in t and 'quatre cents' in t.lower() and 'Espèces' in t, 'encaissement : 400,00 DH, en lettres, « Espèces »', t[t.find('Encaissement'):][:120])
        ok('Visa accueil' in t and re.search(r'Visa accueil \S.* \d\d h \d\d', t), '« Visa accueil » : qui encaisse et l\'heure', t[t.find('Visa'):][:60])
        ok(all(m in t for m in ['IF : IF-TEST-1', 'TP : TP-TEST-2', 'ICE : ICE-TEST-3', 'INPE : 111111111', 'Adresse : Clinique de démonstration, Boulevard Fictif, Casablanca']) and 'exonéré' not in t, 'mentions : IF, TP, ICE, INPE, adresse ; pas d\'exonération de TVA sans la case', t[t.find('Spécialité'):][:300])
        ok('Cachet et signature' in t and 'code' not in t.lower(), '« Cachet et signature », pas de code-barres')
        ok(await pages(b, html) == 1, 'une seule page A5')
        h2 = await recu(pg)
        ok('R-2026-0001' in h2 and 'DUPLICATA' in h2, 'réimpression au même montant : duplicata, même numéro')
        # Prix changé après le reçu : avertissement, historique
        n0 = len(pg.dlg)
        await ev(f"prixRdv('{P7}', '{RID}')"); await pg.wait_for_timeout(1500)
        note = await ev("(document.getElementById('pvRecu')||{}).textContent || ''")
        ok('Reçu n° R-2026-0001 remis pour 400 DH' in note, 'fenêtre de prix : « Reçu n° … remis pour 400 DH »', note)
        await pg.fill('#pvM', '300'); await ev("document.getElementById('fOk').click()"); await pg.wait_for_timeout(1800)
        ok(any('Un reçu n° R-2026-0001 a été remis pour 400 DH' in m for m in pg.dlg[n0:]), 'prix changé : avertissement d\'un clic (non bloquant)', pg.dlg[n0:])
        rc = await ev(f"window.__fs['{E}recus/{P7}_r-{RID}']")
        ok(rc and (rc.get('prix') or [{}])[-1].get('avant') == 400 and rc['prix'][-1].get('apres') == 300 and rc['prix'][-1].get('par') == 'UIDRITA', 'historique du prix dans le reçu (400 → 300, par qui, quand)', rc and rc.get('prix'))
        await ev(f"prixRdv('{P7}', '{RID}')"); await pg.wait_for_timeout(1500)
        ok('400 → 300 DH' in await ev("(document.getElementById('pvRecu')||{}).textContent || ''"), 'historique affiché à la réouverture')
        await ev("fermerFenetre()")
        # Exonération de TVA cochée
        await ev("window.__fs['" + E + "parametres/reglages'] = { data: JSON.stringify({ impression: { entete: 'genere', rTva: true } }) }")
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        S3 = json.loads(json.dumps(S2)); S3[E + 'parametres/reglages'] = {'data': json.dumps({'impression': {'entete': 'papier', 'rTva': True, 'rIce': False}})}
        pg = await ouvrir(b, S3); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P7}'); await pg.wait_for_timeout(3500)
        html = await recu(pg); t = H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html)))
        ok('exonéré' not in t and 'ICE-TEST-3' not in t and 'Clinique de démonstration Date' not in t, 'T6 (24/10/2026, d. 15) : plus jamais « Acte exonéré de TVA » (même avec l\'ancienne case) ; ICE décoché : absent ; papier à en-tête : pas de lieu en haut', t[:200])
        # Numéro impossible à enregistrer : reçu sans numéro, noté au journal
        await ev("window.__panne = ['/recus/']")  # lecture du reçu impossible (réseau coupé) : la transaction du numéro échoue
        h3 = await recu(pg)
        hist = [v.get('quoi', '') for k, v in (await ev("window.__fs")).items() if '/historique/' in k]
        ok('sans numéro' in h3 and 'R-2026' not in h3 and '400,00 DH' in h3, 'numéro impossible à enregistrer : reçu imprimé quand même, « sans numéro »', h3[:100])
        ok(any('SANS NUMÉRO' in q for q in hist), 'reçu sans numéro : noté au journal du cabinet', hist[-3:])
        await ev("window.__panne = []")
        # Profil : IF, TP, ICE
        await pg.goto(f'http://localhost:{PORT}/v2.html#profil'); await pg.wait_for_timeout(1500)
        ok(await ev("!!document.getElementById('pfIf') && !!document.getElementById('pfTp') && !!document.getElementById('pfIce')"), 'Mon compte : champs IF, TP, ICE (médecin)')
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/impression'); await pg.wait_for_timeout(1500)
        t = await ev("document.getElementById('page').textContent")
        ok('Reçus : mentions imprimées' in t and 'exonéré' not in t and 'comptable' not in t and 'reçus en A4' in t, 'Paramètres › Impression : cases « Reçus : mentions imprimées » (sans TVA ni comptable ; choix A4)')
        await pg.set_viewport_size({'width': 390, 'height': 800}); await pg.wait_for_timeout(400)
        ok(await ev("document.documentElement.scrollWidth <= 392"), 'téléphone (390 px) : Paramètres › Impression sans débordement')
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close(); await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
