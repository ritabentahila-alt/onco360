// Audit n° 3, ordre 1 (13/10/2026) : 6 protocoles critiques corrigés, PORTEC-3 phase 2 créé, 10 suppressions : node tests/moteur/test-audit3.mjs.
// Bibliothèque : les 25 protocoles concernés, tels qu'enregistrés le 13/10/2026 (protocoles seulement, aucune donnée patient).
import { readFileSync } from "node:fs";
import { correctionsAudit3, PORTEC3_2, SUPPRESSIONS } from "../../public/js/moteur/audit3.js";
import { seancesDe, premed, calcul, protocoleValide } from "../../public/js/moteur/doses.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
const BIB = JSON.parse(readFileSync(new URL("./donnees/audit3-bib.json", import.meta.url)));
const avant = JSON.stringify(BIB);
const r = correctionsAudit3(BIB);
const M = (id) => (r.modifies.find((m) => m.id === id) || {}).p;
const L = (p, re) => p.dr.find((d) => re.test(d.p.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase()));
const jours = (p) => seancesDe(p).map((g) => g.j).join(",");

console.log("0. Ensemble");
cas("la bibliothèque reçue n'est pas modifiée", JSON.stringify(BIB) === avant);
cas("6 critiques + 6 protocoles gardés + AI 3 jours + 2 remarques « HGC » = 15 modifiés", r.modifies.length === 15, r.modifies.map((m) => m.id));
cas("1 créé (PORTEC-3 phase 2), 10 supprimés, rien d'ignoré", r.crees.length === 1 && r.crees[0].id === PORTEC3_2 && r.supprimes.length === 10 && !r.ignores.length, r.ignores);
cas("aucune dose de chimiothérapie changée hors des corrections voulues (anticancéreux des protocoles gardés identiques)", ["todo|nivolumab", "todo|carboplatine-gemcitabine", "todo|nivolumab-ipilimumab", "sein|hormono - letrozole", "poumon|Paclitaxel - Carboplatine hebdomdaire", "sein|palbociclib (papillo)"].every((id) => JSON.stringify(M(id).dr) === JSON.stringify(BIB[id].dr)));

console.log("1. [89] KEYNOTE-355");
const k = M("todo|paclitaxel-pembrolizumab");
cas("cycle de 84 jours, nom sans « / 21 j » seul", k.c === 84 && /28 j \+ Pembrolizumab 200 \/ 21 j/.test(k.nom), k.nom);
cas("paclitaxel J1-J8-J15 toutes les 4 semaines (9 injections), 90 mg/m² inchangé", String(L(k, /PACLITAXEL/).j) === "1,8,15,29,36,43,57,64,71" && L(k, /PACLITAXEL/).d === 90);
cas("pembrolizumab toutes les 3 semaines (J1, J22, J43, J64), 200 mg", String(L(k, /PEMBROLIZUMAB/).j) === "1,22,43,64" && L(k, /PEMBROLIZUMAB/).d === 200);
cas("séances : J1 J8 J15 J22 J29 J36 J43 J57 J64 J71", jours(k) === "1,8,15,22,29,36,43,57,64,71", jours(k));
cas("POLARAMINE 5 mg et Solumedrol 80 mg les jours du paclitaxel", L(k, /POLARAMINE/).d === 5 && String(L(k, /POLARAMINE/).j) === String(L(k, /PACLITAXEL/).j) && L(k, /SOLUMEDROL/).d === 80 && String(L(k, /SOLUMEDROL/).j) === String(L(k, /PACLITAXEL/).j));
cas("remarque « adapté en 21 jours » retirée", !k.no.some((x) => /21 jours/.test(x)) && k.src);

console.log("2. [197] PORTEC-3 + phase 2");
const pt = M("todo|cisplatine-radiotherapie-puis-carboplatine-paclitaxel");
const iC = pt.dr.findIndex((d) => /^CISPLATINE/.test(d.p));
cas("hydratation 1000 ml avant et après le cisplatine, J1 et J22", /AVANT/.test(pt.dr[iC - 1].p) && /APR/.test(pt.dr[iC + 1].p) && String(pt.dr[iC - 1].j) === "1,22" && /1000 ml/.test(pt.dr[iC - 1].pos));
cas("cisplatine 50 mg/m², séances J1 et J22 seulement", L(pt, /^CISPLATINE/).d === 50 && jours(pt) === "1,22", jours(pt));
cas("Solumedrol 60 mg (cisplatine sur 1 jour, avec EMEND)", L(pt, /SOLUMEDROL/).d === 60);
const p2 = r.crees[0];
cas("phase 2 : carboplatine AUC 5 + paclitaxel 175, cycle 21, Solumedrol 80 mg (sans EMEND), POLARAMINE", p2.c === 21 && L(p2, /CARBOPLATINE/).u === "AUC" && L(p2, /CARBOPLATINE/).d === 5 && L(p2, /PACLITAXEL/).d === 175 && L(p2, /SOLUMEDROL/).d === 80 && L(p2, /POLARAMINE/));
cas("phase 2 : rangée en Endomètre › Adjuvant, remarque de [197] renvoie vers elle", p2.ind[0][1] === "Endomètre" && pt.no.some((x) => x.indexOf(p2.nom) >= 0));

console.log("3. [253] BEP");
const b = M("todo|bep");
cas("bléomycine chiffrée : 30 mg (30 000 UI), dose fixe, J1-J8-J15", L(b, /BLEOMYCINE/).u === "mg" && L(b, /BLEOMYCINE/).d === 30 && String(L(b, /BLEOMYCINE/).j) === "1,8,15" && calcul(L(b, /BLEOMYCINE/), {}) === 30);
cas("bléomycine comptée comme anticancéreux (plus en texte)", !premed(L(b, /BLEOMYCINE/)));
cas("Solumedrol 50 mg J1-J5 (cisplatine sur plusieurs jours)", L(b, /SOLUMEDROL/).d === 50 && String(L(b, /SOLUMEDROL/).j) === "1,2,3,4,5");
cas("hydratation 500 ml J1-J5 (cisplatine 20 mg/m²)", /500 ml/.test(L(b, /HYDRATATION AVANT/).pos) && String(L(b, /HYDRATATION AVANT/).j) === "1,2,3,4,5");
cas("NIVESTIM J7 → J11, 5 injections, 30 / 48 MU, jamais un jour de séance", /J7 → J11/.test(L(b, /NIVESTIM/).jl) && /48 MU si poids > 70 kg/.test(L(b, /NIVESTIM/).pos) && L(b, /NIVESTIM/).nd === 1 && jours(b) === "1,8,15", jours(b));
cas("remarque : cumul 400 000 UI", b.no.some((x) => /400 000 UI/.test(x)));

console.log("4. [273] EP");
const e = M("maj|ep-21-jours-cisplatine-75-etoposide-100-j1-j3-");
cas("ONSET et Solumedrol 60 mg à J1, avant la chimiothérapie", /ONSET/.test(e.dr[0].p) && /SOLUMEDROL/.test(e.dr[1].p) && e.dr[1].d === 60);
cas("hydratation 1000 ml autour du cisplatine", /1000 ml/.test(L(e, /HYDRATATION AVANT/).pos) && L(e, /HYDRATATION APR/));
cas("rangé aussi en CBPC (maladie limitée et étendue), Prostate gardé", e.ind.some((x) => x[1] === "CBPC" && x[2] === "Maladie limitée") && e.ind.some((x) => x[2] === "Maladie étendue") && e.ind.some((x) => x[1] === "Prostate"));
cas("remarque « non précisés » retirée", !e.no.some((x) => /non pr[ée]cis/.test(x)));

console.log("5. [14] Pémétrexed + cisplatine fractionné + pembrolizumab");
const pm = M("poumon|Pemetrexed - cisplatine keytruda");
cas("Solumedrol 50 mg J1-J3", L(pm, /SOLUMEDROL/).d === 50 && String(L(pm, /SOLUMEDROL/).j) === "1,2,3");
cas("hydratation 500 ml J1-J3 ; doses inchangées (pémétrexed 500, cisplatine 25, pembrolizumab 200)", /500 ml/.test(L(pm, /HYDRATATION AVANT/).pos) && L(pm, /PEMETREXED/).d === 500 && L(pm, /^CISPLATINE/).d === 25 && L(pm, /PEMBROLIZUMAB/).d === 200);
cas("remarque : ordonnance « Chimio – Prémédication pémétrexed (ALIMTA) », sans « HGC »", pm.no.some((x) => /Prémédication pémétrexed/.test(x)) && !/HGC/.test(JSON.stringify(pm)));

console.log("6. [217] MAP");
const mp = M("todo|map-cisplatine-doxorubicine-methotrexate-");
const iM = mp.dr.findIndex((d) => /THOTREXATE/.test(d.p));
cas("hyperhydratation alcaline J22 et J29, juste avant le méthotrexate", /HYPERHYDRATATION/.test(mp.dr[iM - 1].p) && String(mp.dr[iM - 1].j) === "22,29");
cas("Solumedrol 50 mg J1-J2 ; hydratation du cisplatine J1-J2", L(mp, /SOLUMEDROL/).d === 50 && String(L(mp, /HYDRATATION AVANT/).j) === "1,2");
cas("sauvetage folinique gardé (15 mg/m² toutes les 6 h), J23 et J30 indiqués", /15 mg\/m²/.test(L(mp, /FOLINIQUE/).pos) && /J23, J30/.test(L(mp, /FOLINIQUE/).jl));
cas("NIVESTIM J4 → J8 ; séances inchangées (J1 J22 J29)", /J4 → J8/.test(L(mp, /NIVESTIM/).jl) && jours(mp) === "1,22,29", jours(mp));

console.log("7. Suppressions");
const S = (id) => r.supprimes.find((s) => s.id === id);
cas("les 10 de l'audit", SUPPRESSIONS.every((s) => S(s.id)));
cas("nivolumab adjuvant → nivolumab 480 : indications œsophage, vessie reprises, mélanome gardé, remarque CheckMate 577 reprise", M("todo|nivolumab").ind.length === 5 && M("todo|nivolumab").no.some((x) => /CheckMate 577/.test(x)));
cas("carboplatine-gemcitabine poumon → voies biliaires : indication poumon et étoile reprises, « Référence eviQ » non reprise", M("todo|carboplatine-gemcitabine").ind.some((x) => x[1] === "CBNPC") && M("todo|carboplatine-gemcitabine").fav === 1 && !(M("todo|carboplatine-gemcitabine").no || []).some((x) => /eviq/i.test(x)));
cas("palbociclib 100 et 75 → 125 : étoile reprise, paliers notés", M("sein|palbociclib (papillo)").fav === 1 && M("sein|palbociclib (papillo)").no.some((x) => /Paliers/.test(x)));
cas("paclitaxel-carboplatine hebdo (sein) → poumon : indications sein reprises", M("poumon|Paclitaxel - Carboplatine hebdomdaire").ind.filter((x) => x[0] === "Sein").length === 2);
cas("JACOB, carboplatine-bévacizumab, ribociclib seul : supprimés sans protocole de remplacement", ["todo|cisplatine-trastuzumab-pertuzumab", "sein|carboplatine hebdomadaire bevacizumab", "sein|hormono - kisqali (ribociclib)"].every((id) => S(id) && !S(id).vers));

console.log("7 bis. Palier 3 (18/10/2026) : [211] AI 3 jours, « HGC » retiré des remarques");
const ai = M("todo|doxorubicine-ifosfamide-fractionne");
cas("furosémide bien nommé (OEDES = oméprazole), 40 mg inchangé", !ai.dr.some((d) => /OEDES/.test(d.p)) && L(ai, /FUROSEMIDE/).d === 40 && L(ai, /FUROSEMIDE/).u === "mg");
cas("bicarbonate 14 ‰ : 500 ml (plus 500 mg), jamais compté comme anticancéreux", L(ai, /BICARBONATE/).u === "txt" && L(ai, /BICARBONATE/).pos === "500 ml" && premed(L(ai, /BICARBONATE/)));
cas("doses d'ifosfamide, doxorubicine, mesna inchangées ; séances J1-J3", L(ai, /IFOSFAMIDE/).d === 2500 && L(ai, /DOXORUBICINE/).d === 60 && jours(ai) === "1", jours(ai));
cas("AI 3 jours : « HGC » retiré de la remarque (« Variante locale »)", !/HGC/.test(JSON.stringify(ai.no)) && ai.no.some((x) => /^Variante locale/.test(x)), ai.no);
cas("« HGC » retiré de toutes les remarques, le reste de la phrase gardé", ["maj|carboplatine-j1-j15", "todo|vdc-ie"].every((id) => M(id) && !/HGC/.test(JSON.stringify(M(id).no))) && M("todo|vdc-ie").no.some((x) => /^Votre fiche, conforme/.test(x)), M("todo|vdc-ie") && M("todo|vdc-ie").no);
cas("aucune remarque « HGC » ne reste dans la bibliothèque corrigée", r.modifies.every((m) => !/\bHGC\b/.test(JSON.stringify(m.p.no || []))));

console.log("8. Une seule fois");
const bib2 = Object.assign({}, BIB); r.modifies.forEach((m) => { bib2[m.id] = m.p; }); r.crees.forEach((p) => { bib2[p.id] = p; }); r.supprimes.forEach((s) => delete bib2[s.id]);
const r2 = correctionsAudit3(bib2);
cas("relancé sur la bibliothèque corrigée : rien modifié, rien créé, rien supprimé", !r2.modifies.length && !r2.crees.length && !r2.supprimes.length, r2);
cas("un protocole retouché depuis l'audit n'est pas touché", correctionsAudit3(Object.assign({}, BIB, { "todo|bep": Object.assign({}, BIB["todo|bep"], { dr: M("todo|bep").dr }) })).ignores.some((x) => x.id === "todo|bep"));
cas("bibliothèque d'un autre cabinet sans ces protocoles : rien", (() => { const z = correctionsAudit3({}); return !z.modifies.length && !z.supprimes.length && !z.crees.length; })());
cas("identifiants de lignes uniques", r.modifies.concat(r.crees.map((p) => ({ p }))).every((m) => new Set(m.p.dr.map((d) => d.id)).size === m.p.dr.length));

console.log("\n" + ok + " / " + (ok + ko) + " vérifications justes");
if (ko) process.exit(1);
