import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read()); exec(open(pathlib.Path(__file__).parent/'demo_seed.py').read())
# T6 (24/10/2026, décisions 49 à 52, 14, 15) : reçu A5 sur une seule feuille même avec toutes les mentions (A4 au choix) ; fiche de chimio : nom du
# patient et titres des colonnes en haut de chaque page ; « À compléter » jamais imprimé ; ordonnance A5 avec l'en-tête d'Onco360 : marges latérales
# 15 mm. Patients et identifiants fictifs.
import re, html as H
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
S2, PIDS = avec_demo(S, E); P7 = PIDS[6]
for k in [k for k in S2 if k.startswith(E + 'patients/') and k.split('/')[-1] not in PIDS]: del S2[k]
d7 = S2[E + 'patients/' + P7]; rd = json.loads(d7['rdvsJson']); rd[0].update(d='2026-10-06', h='09:30', st='fait', dv='2026-10-06'); RID = rd[0]['id']; d7['rdvsJson'] = json.dumps(rd)
S2[E + 'encaissements/' + P7] = {'data': json.dumps({'rdv': {RID: {'m': 400, 'mode': 'esp'}}})}
S2['utilisateurs/UIDRITA'] = dict(S2.get('utilisateurs/UIDRITA') or {}, titre='Dr', nom='TEST', prenom='Médecin', specialite='Oncologie médicale et radiothérapie oncologique', inpe='111111111', idFiscal='IF-TEST-1234567', tp='TP-TEST-2345678', ice='ICE-TEST-000123456789')
S2[E + 'etablissements/DEMO'] = {'code': 'DEMO', 'nom': 'Clinique de démonstration du boulevard', 'adresse': 'Boulevard Fictif numéro 123, angle rue Imaginaire, quartier Exemple', 'ville': 'Casablanca', 'tel': '0522 00 00 00', 'actif': True}
REG = {'impression': {'entete': 'genere', 'eLogo': True, 'eNom': True, 'eSpe': True, 'eInpe': True, 'eLieu': True, 'rSpe': True, 'rInpe': True, 'rIf': True, 'rTp': True, 'rIce': True}}
S2[E + 'parametres/reglages'] = {'data': json.dumps(REG)}
async def recu(pg):
    ev = pg.evaluate; n0 = await ev("window.__win.length")
    await ev(f"recuRdv('{P7}', '{RID}')"); await pg.wait_for_timeout(1500)
    return await ev(f"(window.__win.length > {n0}) ? window.__win[window.__win.length - 1].w.document._h : ''")
async def pages(b, html, w=None):
    if os.environ.get('NAVIGATEUR') == 'webkit': return 1
    pp = await b.new_page(); await pp.set_content(html); await pp.wait_for_timeout(300); pdf = await pp.pdf(prefer_css_page_size=True); await pp.close()
    return len(re.findall(rb'/Type\s*/Page[^s]', pdf))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P7}'); await pg.wait_for_timeout(3500)
        h = await recu(pg)
        ok('size:A5' in h and 'rcPage' in h and 'zoom' in h, 'reçu A5 avec la réduction automatique', h[:120])
        n = await pages(b, h)
        ok(n == 1, 'reçu A5, toutes les mentions et un long pied de page : une seule feuille', n)
        ok('exonéré' not in h.lower(), 'plus de mention « Acte exonéré de TVA »')
        await pg.close()
        S3 = json.loads(json.dumps(S2)); R3 = json.loads(json.dumps(REG)); R3['impression']['recuA4'] = True; S3[E + 'parametres/reglages'] = {'data': json.dumps(R3)}
        pg = await ouvrir(b, S3); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{P7}'); await pg.wait_for_timeout(3500)
        h = await recu(pg)
        ok('size:A4' in h and 'zoom' not in h, 'case « reçus en A4 » : reçu imprimé en A4', h[:120])
        print('Fiche de chimiothérapie')
        fh = await ev("""(async () => { const m = await import('/js/app/fiche.js'); const L = { cures: [{}, {}], crU: 'mgL' }; const dr = []; for (let i = 0; i < 26; i++) dr.push({ id: 'd' + i, p: 'MOLÉCULE ' + i, u: 'mg', d: 10, j: [1 + (i % 3) * 7] });
          const p = { nom: 'Protocole long', c: 21, dr, r: 'J1, J8, J15' }, e = { n: 1, date: '2026-10-06', poids: 70, dj: [], doses: [] };
          return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + '' + '</style></head><body>' + m.ficheHTML({ nom: 'PATIENT TEST 7' }, L, p, e, { nom: 'Dr TEST', inpe: '1' }) + '</body></html>'; })()""")
        ok('<thead><tr class="rp"><td colspan="12">PATIENT TEST 7' in fh and '</thead><tbody>' in fh, 'nom du patient et titres des colonnes dans l\'en-tête du tableau (répété sur chaque page)')
        print('Ordonnances et courriers')
        v = await ev("""(async () => { const m = await import('/js/app/ordonnances.js'); return m.viderZones('<p>Repos de <mark class="or-ac">À compléter : durée</mark> jours, <mark class="or-ac">15</mark>.</p>'); })()""")
        ok('À compléter' not in v and 'or-vide' in v and '15' in v, '« À compléter » remplacé par une zone vide ; une zone remplie est gardée', v)
        mg = await ev("(async () => { const m = await import('/js/app/reglages.js'); return m.margesMm('a5'); })()")
        ok(mg.split(' ')[1] == '15mm', 'ordonnance A5, en-tête imprimé par Onco360 : marges latérales 15 mm', mg)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\nTest T6 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
