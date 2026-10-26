import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
exec(open(pathlib.Path(__file__).parent/'reglages_test.py').read())
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await ouvrir(b, S2); ev=pg.evaluate
        await pg.goto('http://localhost:8767/v2.html#protocoles'); await pg.wait_for_timeout(2500)
        print('menus :', await ev("[...document.querySelectorAll('.cascade label')].map(l=>l.textContent)"), '|', await ev("document.querySelector('#prL .mesures').textContent"))
        await pg.select_option('.cascade select >> nth=0','Sein'); await pg.wait_for_timeout(200)
        await pg.select_option('.cascade select >> nth=2','Localisé – adjuvant'); await pg.wait_for_timeout(200)
        print('Sein › Localisé – adjuvant :', await ev("document.querySelector('#prL .mesures').textContent"), '| menus :', await ev("[...document.querySelectorAll('.cascade select')].map(s=>s.value)"))
        await pg.fill('#prQ','trastuzumab'); await pg.wait_for_timeout(200); print('+ recherche :', await ev("document.querySelector('#prL .mesures').textContent"))
        await ev("prFiltre('reinit')"); await pg.wait_for_timeout(200); print('réinitialisé :', await ev("document.querySelector('#prL .mesures').textContent"))
        await pg.screenshot(path='/tmp/t6_proto.png')
        await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(200); print('mobile largeur :', await ev("document.documentElement.scrollWidth")); await pg.screenshot(path='/tmp/t6_mob.png')
        await pg.set_viewport_size({'width':1440,'height':900})
        await pg.goto('http://localhost:8767/v2.html#dossier/'+pid); await pg.wait_for_timeout(800)
        await ev("document.querySelectorAll('details.dp').forEach(d => d.open = true)")  # lot G : parties de la colonne Patient dépliées
        # lot A §8 (25/10/2026) : actions de la carte sous « ⋯ »
        await ev("[...document.querySelectorAll('.rc')].find(e => /10:00/.test(e.innerText)).querySelector('.mpts button').click()"); await pg.wait_for_timeout(200)
        await ev("[...document.querySelectorAll('#ptsMenuF button')].find(b => b.textContent.trim() === 'Venu').click()"); await pg.wait_for_timeout(500)
        print('venu – champs :', await ev("[...document.querySelectorAll('#fenetreCorps label')].map(l=>l.textContent)"), '| NET affiché :', await ev("document.getElementById('fenetreCorps').innerText.includes('NET')"))
        await pg.fill('#pvM','200'); await pg.click('#fOk'); await pg.wait_for_timeout(600)
        print('enregistré :', json.loads(await ev(f"window.__fs['{E}patientsFinances/{pid}'].montantsJson"))['rdv'].get('rTEST'))
        print('err', pg.errs); await b.close()
asyncio.run(main())
