import pathlib; __file__=str(pathlib.Path(__file__).resolve()); exec(open(pathlib.Path(__file__).parent/'base.py').read())
# 3.13 (12/10/2026) : référentiel unique des types de consultation (Paramètres › Dossier patient › Types de consultation), relié à tout :
# prise de rendez-vous, journal des consultations, durée, formulaire, rendez-vous créés d'office, WhatsApp, Google Agenda, Activités.
ok_n = ko_n = 0
def ok(c, m, d=None):
    global ok_n, ko_n
    if c: ok_n += 1; print('  ✔ ' + m)
    else: ko_n += 1; print('  ✘ ' + m + ('' if d is None else ' ' + str(d)[:400]))
pid = [k.split('/')[-1] for k, v in S.items() if k.startswith(E + 'patients/') and k.count('/') == 3][0]
S2 = json.loads(json.dumps(S)); P = S2[E + 'patients/' + pid]; HOP = P.get('etablissementId') or 'HGC'
P['rdvsJson'] = json.dumps(json.loads(P.get('rdvsJson') or '[]') + [{"id": "rS1", "type": "Suivi", "d": "2026-12-01", "h": "10:00", "n": "", "st": "prevu"}])
S2[E + 'consultations/csT1'] = {"patientId": pid, "etablissementId": HOP, "d": "2026-10-01", "type": "Consultation de suivi", "titre": "", "note": "Ancienne", "o": 1, "creePar": "x", "majPar": "x"}
nomsTy = "[...document.querySelectorAll('.ty-l:not(.ty-h) .ty-n')].map(i=>i.value)"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('Paramètres › Dossier patient › Types de consultation')
        pg = await ouvrir(b, S2); ev = pg.evaluate
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/types'); await pg.wait_for_timeout(2000)
        L = await ev(nomsTy)
        ok(L[:4] == ["Consultation d'annonce", 'Consultation de suivi', 'Consultation de contrôle', 'Hospitalisation'] and 'Consultation de fin de radiothérapie' in L and 'RCP' in L and 'Note du secrétariat' in L, 'liste de départ : types de rendez-vous, RT, journal', L)
        fam = await ev("[...document.querySelectorAll('.cf-sous button')].map(b=>b.innerText.trim())")
        md = await ev("Object.fromEntries([...document.querySelectorAll('.ty-l:not(.ty-h)')].map(l=>[l.querySelector('.ty-n').value,l.querySelector('select').value]))")
        ok(md.get('Consultation de suivi') == 'main' and md.get('Consultation en cours de radiothérapie') == 'office' and md.get('RCP') == 'sans' and not await ev("[...document.querySelectorAll('.ty-l select option')].some(o=>/^Créneau du lieu/.test(o.textContent))"), '3.13 bis : « Comment il est prévu » ; durée réelle de chaque type (plus de « créneau du lieu »)', md)
        ok(fam == ['Fiche patient', 'Formulaire de consultation', 'Types de consultation', 'Listes de la fiche', 'Affichage du dossier'], 'famille Dossier patient', fam)
        i = L.index('Consultation de suivi')
        await ev(f"(()=>{{const e=document.querySelectorAll('.ty-l:not(.ty-h) .ty-n')[{i}];e.value='Consultation de surveillance';e.dispatchEvent(new Event('change'))}})()"); await pg.wait_for_timeout(300)
        i = (await ev(nomsTy)).index('Consultation de contrôle')
        await ev(f"(()=>{{const c=document.querySelectorAll('.ty-l:not(.ty-h)')[{i}].querySelector('select');c.value='sans';c.dispatchEvent(new Event('change'))}})()")  # 3.13 bis : « Comment il est prévu »
        await ev("window.prompt=()=>'Deuxième avis'"); await ev("cfTyAj()"); await pg.wait_for_timeout(400)
        L = await ev(nomsTy); j = L.index('Deuxième avis')
        await ev(f"(()=>{{const s=document.querySelectorAll('.ty-l:not(.ty-h)')[{j}].querySelectorAll('select');s[1].value='45';s[1].dispatchEvent(new Event('change'));s[2].value='simple';s[2].dispatchEvent(new Event('change'))}})()")
        await ev("cfEnregistrer()"); await pg.wait_for_timeout(1800)
        fs = await ev("window.__fs")
        T = json.loads(fs.get(E + 'parametres/typesConsult', {}).get('data') or '[]')
        su = [t for t in T if t['k'] == 'suivi']; dv = [t for t in T if t['nom'] == 'Deuxième avis']
        ok(su and su[0]['nom'] == 'Consultation de surveillance' and su[0].get('anciens') == ['Consultation de suivi'] and dv and dv[0]['rdv'] and not [t for t in T if t['k'] == 'controle'][0]['rdv'], 'enregistré : renommé (ancien nom gardé), ajouté, contrôle plus en rendez-vous', T)
        cal = json.loads(fs[E + 'parametres/calendrier']['data'])
        ok(cal.get('durees', {}).get('a:' + dv[0]['k']) == 45, 'durée enregistrée (même place qu\'avant)', cal.get('durees'))
        fo = json.loads(fs.get(E + 'parametres/formulaires', {}).get('data') or '{}').get('consultation', {})
        ok(fo.get('typesForm', {}).get('Deuxième avis') == 'simple', 'formulaire du type enregistré', fo.get('typesForm'))
        print('Relié partout')
        await pg.goto(f'http://localhost:{PORT}/v2.html#dossier/{pid}'); await pg.wait_for_timeout(1500)
        await ev(f"ouvrirRdv('{pid}')"); await pg.wait_for_timeout(400)
        op = await ev("[...document.getElementById('fType').options].map(o=>o.textContent)")
        ok('Deuxième avis' in op and 'Consultation de surveillance' in op and 'Consultation de contrôle' not in op and 'RCP' not in op, 'prise de rendez-vous : types « pris en rendez-vous »', op)
        await pg.select_option('#fType', label='Deuxième avis'); await ev("document.getElementById('fType').dispatchEvent(new Event('change'))")
        ok(await ev("document.getElementById('fDu').value") == '45', 'durée du type proposée (45 min)')
        await ev("fermerFenetre()")
        ok('Consultation de surveillance' in await pg.inner_text('#page'), 'rendez-vous existant (Suivi) affiché sous le nouveau nom')
        await ev(f"csNouvelle('{pid}')"); await pg.wait_for_timeout(400)
        tp = await ev("[...document.getElementById('csType').options].map(o=>o.textContent)")
        ok('Deuxième avis' in tp and 'RCP' in tp and 'Consultation de suivi' not in tp, 'journal : tous les types, nom actuel', tp)
        await ev("fermerFenetre()"); await ev(f"ongletDossier('{pid}','co')"); await pg.wait_for_timeout(400)
        t = await pg.inner_text('#page')
        ok('Consultation de surveillance' in t, 'consultation enregistrée sous l\'ancien nom : affichée sous le nouveau')
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/whatsapp'); await pg.wait_for_timeout(1200)
        t = await pg.inner_text('#page')
        ok('Deuxième avis' in t and 'Consultation de fin de radiothérapie' in t and 'Consultation de surveillance' in t, 'WhatsApp : un message par type (fin de RT comprise)')
        cats = await ev("(()=>{try{return JSON.stringify(window.__catAg||null)}catch(e){return ''}})()")
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/couleurs'); await pg.wait_for_timeout(1500)
        t = await pg.inner_text('#page')
        ok('Deuxième avis' in t and 'Consultation de surveillance' in t, 'Google Agenda : ce qui y apparaît suit les types', t[:200])
        await pg.goto(f'http://localhost:{PORT}/v2.html#parametres/activites'); await pg.wait_for_timeout(1500)
        t = await pg.inner_text('#page')
        ok('Deuxième avis' in t and 'non facturé ici' in t and 'Consultation de surveillance' in t and 'Ajouter un type de consultation' in t, 'Activités et rémunérations : chaque type dans chaque lieu', t[:300])
        ok(not pg.errs, 'aucune erreur JavaScript', pg.errs[:2]); await pg.close()
        await b.close()
    print(f'\n{ok_n} réussis, {ko_n} échoués')
asyncio.run(main())
