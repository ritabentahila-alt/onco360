// Audit n° 10 (S2, 21/10/2026) : corrections de la bibliothèque sur la bibliothèque reconstruite comme à l'ouverture d'Onco360 (copie du 18/10,
// puis audit n° 3, P4, P5, P7 ; aucune donnée patient) ; doses calculées par le moteur pour une patiente fictive de 70 kg (1,82 m²).
// node tests/moteur/test-audit10.mjs
import { readFileSync } from "node:fs";
import { correctionsAudit3 } from "../../public/js/moteur/audit3.js";
import { correctionsP4, correctionsP5b } from "../../public/js/moteur/audit3p4.js";
import { P4, P7 } from "../../public/js/donnees/audit3p4.js";
import { correctionsS2, correctionsS3, correctionsS4, correctionsS4b, lignesAVerifier } from "../../public/js/moteur/audit10.js";
import { protocoleCure, calcul, seancesDe, joursDe, protocoleValide, premed } from "../../public/js/moteur/doses.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
const L = JSON.parse(readFileSync(new URL("./donnees/bibliotheque-2026-10-18.json", import.meta.url))), BIB = {};
L.forEach((p) => { BIB[p.id] = p; });
const ap = (r) => { r.modifies.forEach((m) => { BIB[m.id] = m.p; }); (r.crees || []).forEach((p) => { BIB[p.id] = p; }); (r.supprimes || []).forEach((s) => delete BIB[s.id]); };
ap(correctionsAudit3(BIB)); ap(correctionsP4(BIB, P4, P7)); ap(correctionsP5b(BIB));
const avant = JSON.stringify(BIB), r = correctionsS2(BIB), APRES = Object.assign({}, BIB);
r.modifies.forEach((m) => { APRES[m.id] = m.p; }); r.crees.forEach((p) => { APRES[p.id] = p; });
const S = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const E = { sc: 1.82, poids: 70, cl: 90 };
// doses d'une molécule (motif) par jour pour la cure k (0 = C1) : { 1: [420], 15: [280] }
const doses = (p, k, re) => { const q = protocoleCure({ pr: p }, k), o = {}; q.dr.filter((d) => re.test(S(d.p))).forEach((d) => joursDe(d).forEach((j) => { (o[j] = o[j] || []).push(calcul(d, Object.assign({ n: k + 1 }, E))); })); return o; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log("0. Ensemble");
cas("la bibliothèque reçue n'est pas modifiée", JSON.stringify(BIB) === avant);
cas("9 protocoles corrigés, 1 créé, rien d'ignoré", r.modifies.length === 9 && r.crees.length === 1 && !r.ignores.length, [r.modifies.map((m) => m.nom), r.crees.length, r.ignores]);
cas("relancer ne refait rien (rien deux fois)", (() => { const r2 = correctionsS2(APRES); return !r2.modifies.length && !r2.crees.length; })(), correctionsS2(APRES).modifies.map((m) => m.quoi));
cas("identifiants de lignes uniques", r.modifies.every((m) => new Set(m.p.dr.map((d) => d.id)).size === m.p.dr.length));

console.log("1. Anticorps prescrit deux fois le même jour (d. 26)");
for (const [id, nom] of [["colon|FOLFOX herceptine", "mFOLFOX6 + Herceptin"], ["todo|folfiri-trastuzumab", "FOLFIRI + Trastuzumab"]]) {
  const av = BIB[id], ap2 = APRES[id];
  cas(nom + " : avant, C1 J15 = 420 + 280 mg (défaut reproduit)", eq(doses(av, 0, /TRASTUZUMAB/)[15], [420, 280]), doses(av, 0, /TRASTUZUMAB/));
  cas(nom + " : C1 = 420 mg à J1, 280 mg à J15", eq(doses(ap2, 0, /TRASTUZUMAB/), { 1: [420], 15: [280] }), doses(ap2, 0, /TRASTUZUMAB/));
  cas(nom + " : C2 et C6 = 280 mg à J1 et à J15", eq(doses(ap2, 1, /TRASTUZUMAB/), { 1: [280], 15: [280] }) && eq(doses(ap2, 5, /TRASTUZUMAB/), { 1: [280], 15: [280] }), doses(ap2, 1, /TRASTUZUMAB/));
  cas(nom + " : plus de séance « J29 » (séances J1 et J15 seulement)", eq(seancesDe(ap2).map((g) => g.j), [1, 15]) && eq(seancesDe(av).map((g) => g.j).slice(-1), [29]), [seancesDe(av).map((g) => g.j), seancesDe(ap2).map((g) => g.j)]);
  cas(nom + " : autres molécules inchangées", eq(ap2.dr.filter((d) => !/TRASTUZUMAB|HERCEPTIN|RETRAIT/.test(S(d.p))), av.dr.filter((d) => !/TRASTUZUMAB|HERCEPTIN|RETRAIT/.test(S(d.p)))));
}
cas("mFOLFOX6 + Herceptin : retrait du diffuseur une seule fois à J17", APRES["colon|FOLFOX herceptine"].dr.filter((d) => /RETRAIT/.test(S(d.p))).length === 1 && eq(APRES["colon|FOLFOX herceptine"].dr.find((d) => /RETRAIT/.test(S(d.p))).j, [3, 17]));
for (const [id, nom, re, c1, cn] of [["audit3|n042", "Paclitaxel 80 + Trastuzumab hebdo", /TRASTUZUMAB/, 280, 140], ["audit3|n057", "ERBITAX", /CETUXIMAB/, 728, 455], ["audit3|n056", "TPEx", /CETUXIMAB/, 728, 455]]) {
  const av = BIB[id], ap2 = APRES[id];
  cas(nom + " : avant, J1 de chaque cure = " + c1 + " + " + cn + " mg (défaut reproduit)", eq(doses(av, 1, re)[1], [c1, cn]), doses(av, 1, re));
  cas(nom + " : C1 J1 = " + c1 + " mg seulement, C2 J1 = " + cn + " mg seulement, J8 = " + cn, eq(doses(ap2, 0, re)[1], [c1]) && eq(doses(ap2, 1, re)[1], [cn]) && eq(doses(ap2, 1, re)[8], [cn]), [doses(ap2, 0, re), doses(ap2, 1, re)]);
}

console.log("2. Prémédication en double (relevé en passant, protocoles créés le 18/10)");
for (const id of ["audit3|n022", "audit3|n036"]) {
  const q = protocoleCure({ pr: APRES[id] }, 0), j1 = q.dr.filter((d) => /SOLUMEDROL/.test(S(d.p)) && (d.j || []).indexOf(1) >= 0);
  cas(APRES[id].nom + " : Solumedrol 80 mg une seule fois à J1 (avant : deux lignes de 80 mg)", j1.length === 1 && j1[0].d === 80 && eq(j1[0].j, [1, 8, 15]), j1);
}

console.log("3. KEYNOTE-A18 – phase 2 et hormonothérapies (d. 27, 29)");
cas("KEYNOTE-A18 – phase 2 : avant non prescriptible, après « Validé »", !protocoleValide(BIB["audit3|keynote-a18-phase2"]) && protocoleValide(APRES["audit3|keynote-a18-phase2"]));
const LE = APRES["sein|ibrance zometa"], FU = APRES["audit10|fulvestrant-palbociclib-zometa"];
cas("létrozole : nom corrigé, plus de fulvestrant", /^Létrozole 2,5 mg \+ Palbociclib/.test(LE.nom) && !LE.dr.some((d) => /FULVESTRANT/.test(S(d.p))) && LE.dr.some((d) => /LETROZOLE/.test(S(d.p))) && !/option/i.test(JSON.stringify(LE.dr)), LE);
cas("fulvestrant : protocole à part, « Fulvestrant » bien écrit, plus de létrozole, validé", /^Fulvestrant 500 \+ Palbociclib/.test(FU.nom) && !FU.dr.some((d) => /LETROZOLE/.test(S(d.p))) && protocoleValide(FU), FU && FU.nom);
cas("fulvestrant : 500 mg à J1 et J15 de C1, puis J1 seulement", eq(doses(FU, 0, /FULVESTRANT/), { 1: [500], 15: [500] }) && eq(doses(FU, 1, /FULVESTRANT/), { 1: [500] }), [doses(FU, 0, /FULVESTRANT/), doses(FU, 1, /FULVESTRANT/)]);
cas("les deux gardent Ibrance et Zometa", [LE, FU].every((p) => p.dr.some((d) => /IBRANCE/.test(S(d.p))) && p.dr.some((d) => /ZOMETA/.test(S(d.p)))));
cas("aucun nom de la bibliothèque en double", (() => { const n = Object.values(APRES).map((p) => S(p.nom).trim()); return new Set(n).size === n.length; })());

console.log("4. Protocole modifié par le médecin depuis l'audit : rien d'écrasé");
const B2 = JSON.parse(JSON.stringify(BIB)); B2["colon|FOLFOX herceptine"].dr = B2["colon|FOLFOX herceptine"].dr.filter((d) => d.id !== "d2b");
const r2 = correctionsS2(B2), m2 = r2.modifies.find((m) => m.id === "colon|FOLFOX herceptine");
cas("trastuzumab déjà changé par le médecin : non touché (seul le retrait en double est retiré)", m2 && m2.quoi.length === 1 && /retrait/i.test(m2.quoi[0]), m2 && m2.quoi);
const B3 = JSON.parse(JSON.stringify(BIB)); B3["sein|ibrance zometa"].dr = B3["sein|ibrance zometa"].dr.filter((d) => !/FULVESTRANT/.test(S(d.p)));
cas("protocole létrozole / fulvestrant déjà séparé à la main : rien de créé, signalé", !correctionsS2(B3).crees.length && correctionsS2(B3).ignores.some((x) => x.id === "sein|ibrance zometa"));

console.log("5. Patients déjà sous ces protocoles");
const pats = [
  { id: "p1", nom: "PATIENT TEST 1", lignes: [{ id: "L1", protoId: "colon|FOLFOX herceptine", pr: { nom: "mFOLFOX6 + Herceptin" }, cures: [{ st: "recue" }, { st: "prevue" }] }] },
  { id: "p2", nom: "PATIENT TEST 2", lignes: [{ id: "L2", protoId: "audit3|n057", cures: [{ st: "recue" }, { st: "recue" }] }, { id: "L3", protoId: "audit3|n056", arret: { d: "2026-10-01" }, cures: [{ st: "prevue" }] }] },
  { id: "p3", nom: "PATIENT TEST 3", lignes: [{ id: "L4", protoId: "sein|autre", cures: [{ st: "prevue" }] }] }];
const v = lignesAVerifier(pats, r.modifies.map((m) => m.id));
cas("ligne en cours retrouvée ; ligne finie, arrêtée ou d'un autre protocole : non", v.length === 1 && v[0].patientId === "p1" && v[0].ligne === "L1", v);

console.log("6. S4 : harmonisation (d. 28, 30 à 34)");
const B4 = Object.assign({}, APRES); correctionsS3(B4).modifies.forEach((m) => { B4[m.id] = m.p; });
const av4 = JSON.stringify(B4), r4 = correctionsS4(B4), A4 = Object.assign({}, B4); r4.modifies.forEach((m) => { A4[m.id] = m.p; });
cas("la bibliothèque reçue n'est pas modifiée ; rien d'ignoré ; relancer ne refait rien", JSON.stringify(B4) === av4 && !r4.ignores.length && !correctionsS4(A4).modifies.length, [r4.ignores, correctionsS4(A4).modifies.map((m) => m.quoi)]);
cas("aucun protocole créé ni supprimé", Object.keys(A4).length === Object.keys(B4).length);
const fu = (id) => A4[id].dr.find((d) => /FLUORO/.test(S(d.p)));
cas("TPF : 5-FU 4 000 mg/m² par diffuseur de 96 h (1 000 mg/m²/j × 4 j en remarque) ; 7 280 mg pour 1,82 m²", fu("todo|tpf").d === 4000 && /1 000 mg\/m²\/j × 4 j/.test(fu("todo|tpf").n) && calcul(fu("todo|tpf"), E) === 7280, fu("todo|tpf"));
cas("CheckMate 648 : 5-FU 4 000 mg/m² par diffuseur de 120 h (800 × 5)", fu("audit3|n019").d === 4000 && /120 h/.test(fu("audit3|n019").n));
cas("5-FU 225 mg/m²/j pendant toute la RT : laissé par jour (pas de durée fixe)", A4["todo|5-fu-radiotherapie"].dr.find((d) => /FLUORO/.test(S(d.p))).d === 225);
cas("FOLFOX et FOLFIRI (diffuseur de 46 h, déjà en dose totale) : 2 400 mg/m² inchangé", A4["maj|mfolfox6-eviq-"].dr.find((d) => /5-FU DIFF/.test(S(d.p))).d === 2400);
const sol1 = (id) => A4[id].dr.filter((d) => /SOLUMEDROL/.test(S(d.p)) && (d.j || []).indexOf(1) >= 0);
cas("Carboplatine AUC 5 + Étoposide : Solumedrol 80 mg à J1, 60 mg à J2 et J3 (ligne coupée)", eq(sol1("todo|carboplatine-etoposide").map((d) => [d.d, d.j]), [[80, [1]]]) && A4["todo|carboplatine-etoposide"].dr.some((d) => /SOLUMEDROL/.test(S(d.p)) && d.d === 60 && eq(d.j, [2, 3])), A4["todo|carboplatine-etoposide"].dr.filter((d) => /SOLUMEDROL/.test(S(d.p))));
cas("Carboplatine AUC 6 (sein), séminome AUC 7, Carboplatine + Vinorelbine (40) : 80 mg à J1", ["todo|carboplatine", "todo|carboplatine-auc-7-seminome-", "poumon|carboplatine navelbine"].every((id) => sol1(id).length === 1 && sol1(id)[0].d === 80));
cas("protocoles hebdomadaires (MITO-7, KEYNOTE-355, carboplatine hebdomadaire) : inchangés", ["audit3|n021", "audit3|n049", "poumon|carbo hebdo"].every((id) => eq(A4[id].dr.filter((d) => /SOLUMEDROL/.test(S(d.p))), B4[id].dr.filter((d) => /SOLUMEDROL/.test(S(d.p))))));
cas("avec cisplatine : inchangé (TPF)", eq(A4["todo|tpf"].dr.filter((d) => /SOLUMEDROL/.test(S(d.p))), B4["todo|tpf"].dr.filter((d) => /SOLUMEDROL/.test(S(d.p)))));
cas("120 mg (3 protocoles d'origine) : jamais baissé sans accord", sol1("estomac|carboplatine paclitaxel j1j21")[0].d === 120);
const lv = (id) => A4[id].dr.find((d) => /FOLINIQUE/.test(S(d.p)));
cas("acide folinique des 14 mFOLFOX6 / FOLFIRI / LV5FU2 : 400 mg/m² (728 mg pour 1,82 m²)", ["maj|mfolfox6-eviq-", "maj|folfiri-14-j-eviq-", "maj|lv5fu2-simplifie-14-j-eviq-", "todo|folfox-pembrolizumab", "audit3|n012"].every((id) => lv(id).u === "mg/m²" && lv(id).d === 400 && calcul(lv(id), E) === 728) && !Object.values(A4).some((p) => p.dr.some((d) => /FOLINIQUE/.test(S(d.p)) && d.u === "mg" && +d.d === 50)));
cas("FLOT, FOLFOXIRI (200 mg/m²) et méthotrexate (15 mg) : inchangés", lv("estomac|FLOT").d === 200 && lv("todo|folfoxiri").d === 200 && lv("audit3|n024").d === 15);
const vi = A4["poumon|Cisplatine - Navelbine Avec Radiotherapie"];
cas("Cisplatine 20 + Vinorelbine 15 hebdomadaire + RT : vinorelbine 15 mg/m², source notée", vi.dr.find((d) => /VINORELBINE/.test(S(d.p))).d === 15 && /Michael 2005/.test(vi.src));
cas("14 immunothérapies : durée maximale en remarque (selon l'indication)", r4.modifies.filter((m) => m.quoi.some((q) => /immunoth/.test(q))).length === 14 && /35 cures/.test(A4["poumon|keytruda alimta"].no.join(" ")) && /KEYNOTE-522/.test(A4["sein|carboplatine paclitaxel hebdomadaire pembrolizumab"].no.join(" ")));
cas("aucune dose d'anticancéreux changée hors 5-FU (total du diffuseur), acide folinique et vinorelbine", r4.modifies.every((m) => B4[m.id].dr.filter((d) => !premed(d) && !/FLUORO|FOLINIQUE|VINORELBINE|SOLUMEDROL/.test(S(d.p))).every((d) => m.p.dr.some((x) => x.id === d.id && x.d === d.d && x.u === d.u))));

console.log("7. 24/10 : POLARAMINE, Solumedrol du pémétrexed-carboplatine, « Traitement associé »");
const B5 = Object.assign({}, A4), r5 = correctionsS4b(B5), A5 = Object.assign({}, B5); r5.modifies.forEach((m) => { A5[m.id] = m.p; });
cas("plus aucune POLARAMINE dans la bibliothèque ; relancer ne refait rien", !Object.values(A5).some((p) => p.dr.some((d) => /POLARAMINE/.test(S(d.p)))) && !correctionsS4b(A5).modifies.length);
cas("pémétrexed + carboplatine : Solumedrol 80 mg ; paclitaxel 175 + carboplatine J1-J21 : 120 mg gardé (dexaméthasone 20 mg du RCP)", A5["poumon|Pemetrexed - Carboplatine J1J21"].dr.find((d) => /SOLUMEDROL/.test(S(d.p))).d === 80 && A5["estomac|carboplatine paclitaxel j1j21"].dr.find((d) => /SOLUMEDROL/.test(S(d.p))).d === 120);
cas("« Paclitaxel + Carboplatine hebdomadaire » : plus « Traitement associé » ; goséréline : gardé", !A5["poumon|Paclitaxel - Carboplatine hebdomdaire"].assoc && (!A5["todo|gosereline-3-6-mg"] || A5["todo|gosereline-3-6-mg"].assoc));
cas("aucune dose d'anticancéreux changée", r5.modifies.every((m) => B5[m.id].dr.filter((d) => !premed(d)).every((d) => m.p.dr.some((x) => x.id === d.id && x.d === d.d))));

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
process.exit(ko ? 1 : 0);
