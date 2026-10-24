import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# T7 (24/10/2026, audit n° 10 d. 56) : 3 retouches de l'arabe (séance de chimio), reprises une fois dans les messages du cabinet ; avertissement
# quand le français d'un message a changé sans l'arabe. Aucune donnée patient.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:300]))
VIEUX = "Bonjour {nom}, séance le {jour}.\n\nمرحبا ⁨{nom}⁩، نذكركم بحصة العلاج الكيميائي يوم {jour_ar} {heure_ar} في ⁨{lieu}⁩.\nيرجى إحضار آخر تحليل للدم. لا تنسوا تناول الأدوية الوقائية إذا وُصفت لكم.\nفي حال الإصابة بالحمى أو حدوث أي مشكل، اتصلوا بنا قبل التنقل.\n{medecin}"
S2 = json.loads(json.dumps(S)); S2[E + 'parametres/whatsapp'] = {'data': json.dumps({'chimio': VIEUX})}
S2[E + 'parametres/migrations'] = dict(S2.get(E + 'parametres/migrations') or {}, waBilingue='2026-10-20')
S2[E + 'parametres/migrations'].pop('waAr3', None)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#accueil'); await pg.wait_for_timeout(4000)
        r = await ev("""(async () => { const m = await import('/js/app/configuration.js'); return { ar: m.WA_AR.chimio, dec1: m.arabeDecale(m.WA0.chimio, 'chimio'), dec2: m.arabeDecale('Venez à jeun le {jour}.\\n{medecin}', 'chimio'), dec3: m.arabeDecale('Venez à jeun.\\n\\n' + m.WA_AR.chimio, 'chimio'), dec4: m.arabeDecale('Venez à jeun.\\n\\nمرحبا، تعالوا صائمين.', 'chimio') }; })()""")
        ok('آخر تحاليل الدم' in r['ar'] and 'التي وُصفت لكم قبل الحصة' in r['ar'] and 'أي مشكلة' in r['ar'] and 'قبل الحضور' in r['ar'], 'arabe de départ : les 3 retouches', r['ar'])
        ok(not r['dec1'] and r['dec2'] and r['dec3'] and not r['dec4'], 'avertissement : français changé avec l\'arabe de départ (ou sans arabe) ; rien si l\'arabe a été réécrit ou si rien n\'a changé', r)
        fs = await ev("window.__fs"); W = json.loads(fs[E + 'parametres/whatsapp']['data'])
        ok('آخر تحاليل الدم' in W['chimio'] and 'قبل الحضور' in W['chimio'] and W['chimio'].startswith('Bonjour {nom}, séance le {jour}.') and (fs.get(E + 'parametres/migrations') or {}).get('waAr3'), 'message du cabinet : retouches reprises une fois, le français gardé (waAr3)', W['chimio'][-120:])
        await ev("location.hash='#parametres/whatsapp'"); await pg.wait_for_timeout(1500)
        await ev("cfWaO('chimio')"); await pg.wait_for_timeout(500)
        await pg.fill('#waT_chimio', 'Bonjour {nom}, venez à jeun le {jour}.\n\n' + W['chimio'][W['chimio'].index('مرحبا'):]); await pg.dispatch_event('#waT_chimio', 'input'); await pg.wait_for_timeout(300)
        t = await ev("(document.getElementById('waDec_chimio')||{}).textContent||''")
        ok('Le français a changé' in t, "Paramètres › WhatsApp : « le français a changé, l'arabe n'est plus sa traduction »", t)
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2])
        await b.close()
    print(f'\nTest T7 : {ok_n} réussis, {ko_n} en échec'); raise SystemExit(1 if ko_n else 0)
asyncio.run(main())
