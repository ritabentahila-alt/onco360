import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# Lot G (19/10/2026) : sur ordinateur, la cure s'ouvre dans le panneau (#panneauCorps) ; une petite fenêtre (#fenetreCorps) passe devant
ESS='PTESS'
# Fenêtre de la cure (depuis le remodelage du dossier) : tableau des jours J1, J8… (une ligne par jour : Ouvrir, Valider,
# Reporter…), « Ouvrir » affiche la vue du jour. Après la validation d'un jour s'ouvre la fenêtre du prix de la consultation
# (« Valider : venu »), qui ramène au dossier : on rouvre alors la cure depuis le tableau des cures.
JOUR=lambda n: ':is(#fenetreCorps,#panneauCorps):not(:empty) table.tsea tr >> nth=%d' % (n+1)
CURE=lambda c: '.acc.on .tcures tr:has-text("%s") >> text=Ouvrir' % c
TR="document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) table.tsea tr')"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await ouvrir(b); ev=pg.evaluate
        await pg.goto('http://localhost:8767/v2.html#dossier/'+ESS); await pg.wait_for_timeout(2500)
        await pg.click('#og-ch'); await pg.wait_for_timeout(400)  # le dossier s'ouvre sur Consultation : onglet Chimiothérapie
        await pg.screenshot(path='/tmp/t7_table.png', clip={'x':280,'y':0,'width':1160,'height':900}, full_page=True)
        await clic_menu(pg, CURE('C3')); await pg.wait_for_timeout(400)
        await clic_menu(pg, JOUR(0)+' >> text=Ouvrir'); await pg.fill('#vD','2026-10-06'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        await plus_tard(pg); await pg.click(':is(#fenetreCorps,#panneauCorps):not(:empty) >> text=Valider : venu'); await pg.wait_for_timeout(800)  # prix de la consultation
        await clic_menu(pg, CURE('C3')); await pg.wait_for_timeout(400)
        # Report de J8
        await clic_menu(pg, JOUR(1)+' >> text=↪ Reporter'); await pg.wait_for_timeout(300)
        await pg.fill('#rD','2026-10-15'); await pg.select_option('#rR','Neutropénie'); await pg.fill('#rC','PNN 900'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        print('ligne J8 :', await ev(TR+"[2].innerText.replace(/\\s*[\\n\\t]\\s*/g,' | ')"), await ev(TR+"[2].querySelector('input').value"))
        await pg.screenshot(path='/tmp/t7_cure.png')
        # J8 : ajout et retrait de molécule
        await clic_menu(pg, JOUR(1)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('J8 boutons :', await ev("[...document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) button')].map(b=>b.textContent).filter(t=>/molécule|Reporter|Valider/.test(t))"))
        await pg.click(':is(#fenetreCorps,#panneauCorps):not(:empty) >> text=+ Ajouter une molécule'); await pg.wait_for_timeout(200)
        print('jours proposés :', await ev("document.getElementById('mJ').value"))
        await pg.fill('#mP','ZOMETA test'); await pg.select_option('#mU','mg'); await pg.fill('#mD','4'); await pg.fill('#mV','IV'); await pg.click('#fOk'); await pg.wait_for_timeout(700)
        print('après ajout, vue :', await ev("document.querySelector(':is(#fenetreCorps,#panneauCorps):not(:empty) h3').textContent"))
        await pg.click(':is(#fenetreCorps,#panneauCorps):not(:empty) >> text=− Retirer une molécule'); await pg.wait_for_timeout(200)
        await pg.click('.rdv:has-text("GEMCITABINE") >> text=Retirer'); await pg.wait_for_timeout(700)
        print('C3 J8 produits :', await ev("[...document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"), '| badges :', await ev("[...document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) .badge.b-gr')].map(b=>b.innerText)"))
        await pg.click('text=‹ Retour à la cure'); await clic_menu(pg, JOUR(0)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('C3 J1 produits :', await ev("[...document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"))
        await pg.click('text=‹ Retour à la cure'); await pg.click('text=Fermer'); await pg.wait_for_timeout(300)
        await clic_menu(pg, CURE('C4')); await pg.wait_for_timeout(300)
        print('C4 jours :', await ev("[...document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) table.tsea td[data-l=Jour] b')].map(b=>b.textContent)"))
        await clic_menu(pg, JOUR(0)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('C4 J1 produits :', await ev("[...document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"))
        await pg.click('text=‹ Retour à la cure'); await clic_menu(pg, JOUR(1)+' >> text=Ouvrir'); await pg.wait_for_timeout(300)
        print('C4 J8 produits :', await ev("[...document.querySelectorAll(':is(#fenetreCorps,#panneauCorps):not(:empty) table.doses tr')].map(r=>r.cells[1]&&r.cells[1].innerText).filter(Boolean)"))
        L=json.loads(await ev(f"window.__fs['{E}patients/{ESS}'].lignesJson"))[0]; print('mods :', [(m['op'],m['k'],m.get('j')) for m in L['mods']], '| sea C3 :', L['cures'][2].get('sea'))
        print('err', pg.errs); await b.close()
asyncio.run(main())
