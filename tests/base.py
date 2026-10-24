import asyncio, json, os, subprocess, time, urllib.request
from playwright.async_api import async_playwright
# Q2 (12/10/2026) : NAVIGATEUR=webkit → les tests tournent avec le moteur de Safari (p.chromium renvoie WebKit), sans changer les tests
if os.environ.get("NAVIGATEUR") == "webkit":
    from playwright.async_api import Playwright as _PW
    _PW.chromium = property(lambda self: self.webkit)
import pathlib
ICI=pathlib.Path(__file__).resolve().parent if '__file__' in dir() else pathlib.Path('tests').resolve()
ROOT=str(ICI.parent/'public'); PORT=8767
def serveur():
    try: urllib.request.urlopen(f'http://localhost:{PORT}/v2.html',timeout=1); return
    except Exception: pass
    subprocess.Popen(['python3','-m','http.server',str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True); time.sleep(1.2)
M={n:open(ICI/'mockfb'/n).read() for n in ['firebase-app.js','firebase-auth.js','firebase-firestore.js','firebase-functions.js','firebase-storage.js']}
JSZ=open(ICI/'mockfb'/'jszip.min.js').read()
# S7 (24/10/2026, audit n° 10 d. 7) : jeu de test FICTIF (tests/seed-fictif.json, construit par tests/mkfictif.mjs) ; la copie de vrais dossiers
# (tests/seed.json) n'est plus lue que si ONCO360_SEED=reel est demandé, le temps de finir la transition
S=json.load(open(ICI/('seed.json' if os.environ.get('ONCO360_SEED')=='reel' else 'seed-fictif.json'))); E='espaces/cabinet-bentahila/'
# chiffre du bilan 2026 du jeu de test (« 353 449 » pour le jeu fictif), pour les tests qui le comparent à l'écran
REF_BILAN=open(ICI/('bilan_ref.txt' if os.environ.get('ONCO360_SEED')=='reel' else 'bilan_ref_fictif.txt')).read().split(' DH')[0].strip()
# audit n° 3 (13/10/2026) : corrections de la bibliothèque déjà faites dans le jeu commun (sa fenêtre cacherait les boutons) ; test_audit3 les rejoue
S.setdefault(E + 'parametres/migrations', {}).update({'audit3a': '2026-10-13', 'audit3b': '2026-10-13', 'audit3c': '2026-10-18', 'audit3d': '2026-10-18', 'audit3e': '2026-10-18', 'audit3f': '2026-10-18', 'audit3g': '2026-10-18', 'bibE3': 2, 'audit10a': '2026-10-21', 'audit10b': '2026-10-21', 'audit10c': '2026-10-21', 'audit10d': '2026-10-24'})  # audit10a : corrections de l'audit n° 10 (S2), rejouées par test_audit10  # bibE3 : mise à jour des bibliothèques (R-E3, 19/10/2026), rejouée par test_ordonnances_e
async def ouvrir(b, seed=None, w=1440, h=900, t="2026-10-06T10:00:00", tz=None):
    pg=await b.new_page(viewport={'width':w,'height':h},**({'timezone_id':tz} if tz else {})); pg.errs=[]; pg.dlg=[]; pg.dl=[]
    pg.on('pageerror',lambda e: pg.errs.append(str(e)))
    pg.on('dialog', lambda d: (pg.dlg.append(d.message), asyncio.ensure_future(d.accept())))
    pg.on('download', lambda d: pg.dl.append(d))
    async def fb(route): await route.fulfill(body=M[route.request.url.split('/')[-1]],content_type='application/javascript')
    async def jz(route): await route.fulfill(body=JSZ,content_type='application/javascript')
    await pg.route('https://www.gstatic.com/**',fb); await pg.route('https://cdnjs.cloudflare.com/**',jz)
    await pg.add_init_script("window.__fs="+json.dumps(seed or S)+";window.__win=[];window.open=(u)=>{const w={document:{_h:'',open(){},write(x){this._h+=x},close(){}},focus(){},print(){},closed:false};window.__win.push({u,w});return w};")
    await pg.clock.set_fixed_time(t)
    return pg
serveur()
# Après la validation d'une séance de chimio : fenêtre « Prochaine séance » (heure de consultation, 12/10/2026) → « Plus tard »
async def plus_tard(pg):
    if await pg.evaluate("!!document.getElementById('hNon')"): await pg.click('#hNon'); await pg.wait_for_timeout(500)
# 3.7 (12/10/2026) : actions secondaires des cures dans un menu ⋯ (details.m3) : ouvert avant de cliquer
async def clic_menu(pg, sel):
    await pg.locator(sel).first.evaluate("e => e.click()")
