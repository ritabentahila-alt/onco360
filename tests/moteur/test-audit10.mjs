// Audit n° 10 (S2, 21/10/2026) : corrections de la bibliothèque sur la bibliothèque reconstruite comme à l'ouverture d'Onco360 (copie du 18/10,
// puis audit n° 3, P4, P5, P7 ; aucune donnée patient) ; doses calculées par le moteur pour une patiente fictive de 70 kg (1,82 m²).
// node tests/moteur/test-audit10.mjs
import { readFileSync } from "node:fs";
import { correctionsAudit3 } from "../../public/js/moteur/audit3.js";
import { correctionsP4, correctionsP5b } from "../../public/js/moteur/audit3p4.js";
import { P4, P7 } from "../../public/js/donnees/audit3p4.js";
import { correctionsS2, lignesAVerifier } from "../../public/js/moteur/audit10.js";
import { protocoleCure, calcul, seancesDe, joursDe, protocoleValide } from "../../public/js/moteur/doses.js";
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

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
process.exit(ko ? 1 : 0);
