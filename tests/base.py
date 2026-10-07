import asyncio, json, os, subprocess, time, urllib.request
from playwright.async_api import async_playwright
import pathlib
ICI=pathlib.Path(__file__).resolve().parent if '__file__' in dir() else pathlib.Path('tests').resolve()
ROOT=str(ICI.parent/'public'); PORT=8767
def serveur():
    try: urllib.request.urlopen(f'http://localhost:{PORT}/v2.html',timeout=1); return
    except Exception: pass
    subprocess.Popen(['python3','-m','http.server',str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True); time.sleep(1.2)
M={n:open(ICI/'mockfb'/n).read() for n in ['firebase-app.js','firebase-auth.js','firebase-firestore.js']}
JSZ=open(ICI/'mockfb'/'jszip.min.js').read()
S=json.load(open(ICI/'seed.json')); E='espaces/cabinet-bentahila/'
async def ouvrir(b, seed=None, w=1440, h=900, t="2026-10-06T10:00:00"):
    pg=await b.new_page(viewport={'width':w,'height':h}); pg.errs=[]; pg.dlg=[]; pg.dl=[]
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
