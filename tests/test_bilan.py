import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await ouvrir(b)
        await pg.goto('http://localhost:8767/v2.html#accueil'); await pg.wait_for_timeout(2500)
        print(await pg.evaluate("document.querySelector('.accueil h2') && document.querySelector('.accueil h2').textContent"))
        await pg.goto('http://localhost:8767/v2.html#bilan'); await pg.wait_for_timeout(1500)
        await pg.select_option('#biPer','annee'); await pg.wait_for_timeout(400)
        print((await pg.evaluate("[...document.querySelectorAll('.kpi .k')].map(e=>e.textContent)"))[0])
        print('err',pg.errs); await b.close()
asyncio.run(main())
