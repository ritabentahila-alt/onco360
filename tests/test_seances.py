import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
ESS='P1790238573180'
# Fenêtre de la cure (depuis le remodelage du dossier) : tableau des jours J1, J8… (une ligne par jour : Ouvrir, Valider,
# Reporter…), « Ouvrir » affiche la vue du jour. Après la validation d'un jour s'ouvre la fenêtre du prix de la consultation
# (« Valider : venu »), qui ramène au dossier : on rouvre alors la cure depuis le tableau des cures.
JOUR=lambda n: '#fenetreCorps table.tsea tr >> nth=%d' % (n+1)
CURE=lambda c: '.acc.on .tcures tr:has-text("%s") >> text=Ouvrir' % c
TR="document.querySelectorAll('#fenetreCorps table.tsea tr')"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await ouvrir(b); ev=pg.evaluate
        await pg.goto('http://localhost:8767/v2.html#dossier/'+ESS); await pg.wait_for_timeout(2500)
        await pg.click('#og-ch'); await pg.wait_for_timeout(400)  # le dossier s'ouvre sur Consultation : onglet Chimiothérapie
        await pg.screenshot(path='/tmp/t7_table.png', clip={'x':280,'y':0,'width':1160,'height':900}, full_page=True)
        await pg.click(CURE('C3')); await pg.wait_for_timeout(400)
        await pg.click(JOUR(0)+' >> text=Ouvrir'); await pg.fill('#vD','2026-10-06'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        await pg.click('#fenetreCorps >> text=Valider : venu'); await pg.wait_for_timeout(800)  # prix de la consultation
        await pg.click(CURE('C3')); await pg.wait_for_timeout(400)
        # Report de J8
        await pg.click(JOUR(1)+' >> text=↪ Reporter'); await pg.wait_for_timeout(300)
        await pg.fill('#rD','2026-10-15'); await pg.select_option('#rR','Neutropénie'); await pg.fill('#rC','PNN 900'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        print('ligne J8 :', await ev(TR+"[2].innerText.replace(/\\s*[\\n\\t]\\s*/g,' | ')"), await ev(TR+"[2].querySelector('input').value"))
        await pg.screenshot(path='/tmp/t7_cure.png')
        # J8 : ajout et retrait de molécule
        await pg.click(JOUR(1)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('J8 boutons :', await ev("[...document.querySelectorAll('#fenetreCorps button')].map(b=>b.textContent).filter(t=>/molécule|Reporter|Valider/.test(t))"))
        await pg.click('#fenetreCorps >> text=+ Ajouter une molécule'); await pg.wait_for_timeout(200)
        print('jours proposés :', await ev("document.getElementById('mJ').value"))
        await pg.fill('#mP','ZOMETA test'); await pg.select_option('#mU','mg'); await pg.fill('#mD','4'); await pg.fill('#mV','IV'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        print('après ajout, vue :', await ev("document.querySelector('#fenetreCorps h3').textContent"))
        await pg.click('#fenetreCorps >> text=− Retirer une molécule'); await pg.wait_for_timeout(200)
        await pg.click('.rdv:has-text("GEMCITABINE") >> text=Retirer'); await pg.wait_for_timeout(700)
        print('C3 J8 produits :', await ev("[...document.querySelectorAll('#fenetreCorps table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"), '| badges :', await ev("[...document.querySelectorAll('#fenetreCorps .badge.b-gr')].map(b=>b.innerText)"))
        await pg.click('text=‹ Retour à la cure'); await pg.click(JOUR(0)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('C3 J1 produits :', await ev("[...document.querySelectorAll('#fenetreCorps table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"))
        await pg.click('text=‹ Retour à la cure'); await pg.click('text=Fermer'); await pg.wait_for_timeout(300)
        await pg.click(CURE('C4')); await pg.wait_for_timeout(300)
        print('C4 jours :', await ev("[...document.querySelectorAll('#fenetreCorps table.tsea td[data-l=Jour] b')].map(b=>b.textContent)"))
        await pg.click(JOUR(0)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('C4 J1 produits :', await ev("[...document.querySelectorAll('#fenetreCorps table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"))
        await pg.click('text=‹ Retour à la cure'); await pg.click(JOUR(1)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('C4 J8 produits :', await ev("[...document.querySelectorAll('#fenetreCorps table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"))
        L=json.loads(await ev(f"window.__fs['{E}patients/{ESS}'].lignesJson"))[0]; print('mods :', [(m['op'],m['k'],m.get('j')) for m in L['mods']], '| sea C3 :', L['cures'][2].get('sea'))
        print('err', pg.errs); await b.close()
asyncio.run(main())
