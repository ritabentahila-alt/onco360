# Jeu de test fictif (Q-a, 18/10/2026) : le jeu commun (protocoles, réglages) avec les 8 patients fictifs de functions/demo.js ajoutés
# (« PATIENT TEST 1 » … « PATIENT TEST 8 », lieu DEMO). À utiliser pour tout test qui affiche ou imprime un dossier.
import json, subprocess
def avec_demo(S, E, jour='2026-10-06'):
    protos = []
    for k, v in S.items():
        if k.startswith(E + 'protocoles/'):
            try: protos += json.loads(v.get('data') or '[]')
            except Exception: pass
    js = ("const D=require('./functions/demo.js');let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const p=JSON.parse(s);"
          "process.stdout.write(JSON.stringify(D.patientsDemo(p,[],'" + jour + "')))})")
    L = json.loads(subprocess.run(['node', '-e', js], input=json.dumps(protos), capture_output=True, text=True, check=True, cwd=str(ICI.parent)).stdout)
    S2 = json.loads(json.dumps(S))
    for p in L: S2[E + 'patients/' + p['id']] = p['data']
    S2[E + 'etablissements/DEMO'] = {'code': 'DEMO', 'nom': 'Clinique de démonstration', 'ville': 'Casablanca', 'actif': True}
    return S2, [p['id'] for p in L]
