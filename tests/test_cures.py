import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
exec(open(pathlib.Path(__file__).parent/'reglages_test.py').read())
ESS='P1790238573180'
# Fenêtre de la cure (depuis le remodelage du dossier) : tableau des jours J1, J8… (une ligne par jour : Ouvrir, Valider,
# Reporter…), « Ouvrir » affiche la vue du jour. Après la validation d'un jour s'ouvre la fenêtre du prix de la consultation
# (« Valider : venu »), qui ramène au dossier : on rouvre alors la cure depuis le tableau des cures.
JOUR=lambda n: '#fenetreCorps table.tsea tr >> nth=%d' % (n+1)
CURE=lambda c: '.acc.on .tcures tr:has-text("%s") >> text=Ouvrir' % c
S2[E+'patients/'+ESS]['identite']['numero']='202609003'  # numéro de dossier (étape 8) : imprimé sur la fiche
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await ouvrir(b, S2); ev=pg.evaluate
        await pg.goto('http://localhost:8767/v2.html#dossier/'+ESS); await pg.wait_for_timeout(2500)
        await pg.click('#og-ch'); await pg.wait_for_timeout(400)  # le dossier s'ouvre sur Consultation : onglet Chimiothérapie
        async def venu():  # fenêtre du prix après une validation : « Valider : venu », retour au dossier
            await plus_tard(pg)
            print('  prix :', await ev("document.querySelector('#fenetreCorps').innerText.split('\\n')[0]"), '=', await ev("document.getElementById('pvM').value"), 'DH')
            await plus_tard(pg); await pg.click('#fenetreCorps >> text=Valider : venu'); await pg.wait_for_timeout(800)
        await pg.click(CURE('C3')); await pg.wait_for_timeout(500)
        await pg.click(JOUR(0)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        await pg.fill('#vD','2026-10-06'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        await venu(); await pg.click(CURE('C3')); await pg.wait_for_timeout(500)
        print('statut après J1 :', await ev("document.querySelector('#fenetreCorps .sous').innerText"), '|', await ev("[...document.querySelectorAll('#fenetreCorps table.tsea tr')].slice(1).map(r=>r.cells[0].innerText+' '+r.cells[3].innerText)"))
        await pg.click(JOUR(1)+' >> text=Ouvrir'); await pg.wait_for_timeout(400)
        print('J8 champs :', await ev("[...document.querySelectorAll('#fenetreCorps .form label')].map(l=>l.textContent+'='+(l.nextElementSibling&&l.nextElementSibling.value||''))"))
        await pg.fill('#fenetreCorps .form input >> nth=0','60'); await pg.press('#fenetreCorps .form input >> nth=0','Tab'); await pg.wait_for_timeout(600)
        print('J8 après poids 60 :', await ev("[...document.querySelectorAll('#fenetreCorps .form input')].map(i=>i.value)"), '| GEM :', await ev("[...document.querySelectorAll('#fenetreCorps tr')].filter(r=>/GEMCI/.test(r.innerText)).map(r=>r.innerText.replace(/\\t/g,' | '))"))
        g=pg.locator('#fenetreCorps tr:has-text("GEMCITABINE") input >> nth=0'); await g.fill('50'); await g.press('Tab'); await pg.wait_for_timeout(600)
        print('jours du tableau J8 :', await ev("[...document.querySelectorAll('#fenetreCorps tr.jr')].map(t=>t.textContent)"))
        await pg.fill('#sD','2026-10-13'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        await venu(); await pg.click(CURE('C3')); await pg.wait_for_timeout(500)
        print('statut après J8 :', await ev("document.querySelector('#fenetreCorps .sous').innerText"), '|', await ev("[...document.querySelectorAll('#fenetreCorps table.tsea tr')].slice(1).map(r=>r.cells[0].innerText+' '+r.cells[3].innerText)"))
        await pg.click('#fenetreCorps >> text=Fermer'); await pg.wait_for_timeout(300)
        print('tableau des cures :', await ev("[...document.querySelectorAll('.acc.on .tcures tr')].slice(1,6).map(r=>r.cells[0].innerText+' '+r.cells[3].innerText.replace(/\\n/g,' ')+' | poids '+r.cells[4].innerText)"))
        await pg.click(CURE('C4')); await pg.wait_for_timeout(400); await pg.click(JOUR(0)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('C4 J1 GEM (%, dose) :', await ev("[...document.querySelectorAll('#fenetreCorps tr')].filter(r=>/GEMCI/.test(r.innerText)).map(r=>[...r.querySelectorAll('input')].map(i=>i.value))"))
        await pg.screenshot(path='/tmp/t2_c4j1.png')
        await pg.click('#fenetreCorps >> text=FICHE CHIMIO'); await pg.wait_for_timeout(800)
        h=await ev("window.__win[window.__win.length-1].w.document._h")
        print('fiche : sans logo (papier à en-tête)', '<img' not in h, '| N° dossier', 'Dossier n° 202609003' in h, '| entêtes :', re.findall(r'<th[^>]*>(.*?)</th>',h)[8:])
        print('prescripteur :', re.search(r'Médecin prescripteur</div>(.*?)</td>',h).group(1))
        open('/tmp/fiche.html','w').write(h)
        print('err', pg.errs); await b.close()
asyncio.run(main())
