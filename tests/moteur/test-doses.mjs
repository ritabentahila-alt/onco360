// Calcul des doses (étape 2.1, 12/10/2026), sans navigateur ni donnée réelle : node tests/moteur/test-doses.mjs
// Valeurs attendues calculées à la main (formules : Mosteller, Cockcroft-Gault mg/L et µmol/L, Calvert plafonné à 125).
// Patients et protocoles fictifs, écrits ici. Les essais de l'audit n° 2 (taille modifiée après validation, prémédication écrite
// en DCI…) sont repris tels quels : ils doivent rester vrais.
import { surface, clairance, calcul, etatLigne, protocoleCure, seancesDe, seancesCure, premed, instantane, controleSeance, poidsAvant, poidsDebut, reperesClairance } from "../../public/js/moteur/doses.js";

let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
const copie = (o) => JSON.parse(JSON.stringify(o));
const CTX = { aujourdhui: "2026-10-12", bib: {} };
const patient = (o) => Object.assign({ taille: "170", ddn: "1966-05-01", sexe: "F" }, o || {}); // 60 ans au 12/10/2026

console.log("1. Formules");
cas("Mosteller : 70 kg, 170 cm → 1,82 m²", surface(70, 170) === 1.82, surface(70, 170));
cas("Mosteller : 60 kg, 162 cm → 1,64 m²", surface(60, 162) === 1.64, surface(60, 162));
cas("surface absente sans poids ou sans taille", surface(null, 170) === null && surface(70, null) === null);
cas("Cockcroft mg/L, homme 60 ans, 70 kg, 10 mg/L → 78 ml/min", clairance(60, 70, 10, "H", "mgL") === 78, clairance(60, 70, 10, "H", "mgL"));
cas("Cockcroft mg/L, femme (× 0,85) → 66 ml/min", clairance(60, 70, 10, "F", "mgL") === 66, clairance(60, 70, 10, "F", "mgL"));
cas("Cockcroft µmol/L, homme 60 ans, 70 kg, 88 µmol/L → 78 ml/min", clairance(60, 70, 88, "H", "umol") === 78, clairance(60, 70, 88, "H", "umol"));
cas("Cockcroft µmol/L, femme (1,04) → 66 ml/min", clairance(60, 70, 88, "F", "umol") === 66, clairance(60, 70, 88, "F", "umol"));
cas("clairance absente sans sexe ou sans créatinine", clairance(60, 70, 10, "", "mgL") === null && clairance(60, 70, null, "H", "mgL") === null);
cas("Calvert AUC 5, clairance 78 → 5 × (78 + 25) = 515 mg", calcul({ u: "AUC", d: 5 }, { cl: 78 }) === 515);
cas("Calvert : clairance plafonnée à 125 (200 → 750 mg)", calcul({ u: "AUC", d: 5 }, { cl: 200 }) === 750);
cas("mg/m² : 75 × 1,82 = 136,5 → 137 mg (arrondi à l'unité)", calcul({ u: "mg/m²", d: 75 }, { sc: 1.82 }) === 137);
cas("mg/m² avec 1 décimale demandée → 136,5 mg", calcul({ u: "mg/m²", d: 75, dec: 1 }, { sc: 1.82 }) === 136.5);
cas("mg/kg : 8 × 70 = 560 mg", calcul({ u: "mg/kg", d: 8 }, { poids: 70 }) === 560);
cas("dose fixe en mg", calcul({ u: "mg", d: 420 }, {}) === 420);
cas("dose de charge C1 puis entretien (mg_c1)", calcul({ u: "mg_c1", c1: 840, cn: 420 }, { n: 1 }) === 840 && calcul({ u: "mg_c1", c1: 840, cn: 420 }, { n: 2 }) === 420);
cas("dose maximale appliquée (vincristine 1,4 mg/m², max 2 mg)", calcul({ u: "mg/m²", d: 1.4, dec: 1, max: 2 }, { sc: 2 }) === 2);
cas("sans surface : pas de dose (jamais 0)", calcul({ u: "mg/m²", d: 75 }, { sc: null }) === null);

console.log("2. Une ligne de chimiothérapie (protocole EC fictif, 4 cures, J1 tous les 21 jours)");
const EC = { id: "ec", nom: "EC", c: 21, dr: [
  { id: "epi", p: "EPIRUBICINE", d: 90, u: "mg/m²", j: [1] }, { id: "cyc", p: "CYCLOPHOSPHAMIDE", d: 600, u: "mg/m²", j: [1] },
  { id: "ond", p: "ONDANSETRON", d: 8, u: "mg", j: [1] }, { id: "sol", p: "SOLUMEDROL", d: 80, u: "mg", j: [1] }] };
const ligne = (o) => Object.assign({ id: "L1", protoId: "ec", pr: copie(EC), j1: "2026-08-25", poids: "60", creat: "", crU: "mgL", cures: [{}, {}, {}, {}] }, o || {});
let E = etatLigne(ligne(), patient({ taille: "162" }), CTX);
cas("surface 1,64 m² ; épirubicine 90 × 1,64 = 148 mg ; cyclophosphamide 984 mg", E[0].sc === 1.64 && E[0].doses[0] === 148 && E[0].doses[1] === 984, [E[0].sc, E[0].doses]);
cas("dates prévues tous les 21 jours", E[0].prevue === "2026-08-25" && E[1].prevue === "2026-09-15" && E[3].prevue === "2026-10-27", E.map((e) => e.prevue));
const Lr = ligne(); Lr.cures[1] = { pct: { epi: 80 } };
E = etatLigne(Lr, patient({ taille: "162" }), CTX);
cas("80 % de l'épirubicine décidé en C2 : 118 mg, reconduit en C3 et C4", E[1].doses[0] === 118 && E[2].doses[0] === 118 && E[3].doses[0] === 118 && E[0].doses[0] === 148, E.map((e) => e.doses[0]));
cas("le cyclophosphamide reste à 100 %", E[2].doses[1] === 984);
const Lg = ligne(); Lg.cures[2] = { pctAll: 80 };
E = etatLigne(Lg, patient({ taille: "162" }), CTX);
cas("réduction globale à 80 % en C3 : anticancéreux réduits", E[2].doses[0] === 118 && E[2].doses[1] === 787, E[2].doses);
cas("réduction globale : prémédication non réduite (ONDANSETRON 8 mg, SOLUMEDROL 80 mg)", E[2].doses[2] === 8 && E[2].doses[3] === 80, E[2].doses);
cas("prémédication reconnue par la DCI comme par la marque", premed({ p: "ONDANSETRON" }) && premed({ p: "ONSET" }) && premed({ p: "METHYLPREDNISOLONE" }) && premed({ p: "DEXAMETHASONE" }) && !premed({ p: "EPIRUBICINE" }));
const Lp = ligne(); Lp.cures[0] = { poids: "64" }; Lp.cures[2] = { poids: "58" };
E = etatLigne(Lp, patient({ taille: "162" }), CTX);
cas("poids saisi en C1 (64 kg) repris en C2, nouveau poids en C3 (58 kg) repris en C4", E[0].poids === 64 && E[1].poids === 64 && E[2].poids === 58 && E[3].poids === 58, E.map((e) => e.poids));
const Lo = ligne(); Lo.cures[1] = { ov: { epi: 130 } };
E = etatLigne(Lo, patient({ taille: "162" }), CTX);
cas("dose saisie à la main en C2 (130 mg) reconduite en proportion aux cures suivantes", E[1].doses[0] === 130 && E[2].doses[0] === 130, E.map((e) => e.doses[0]));

console.log("3. Carboplatine AUC (Calvert) et créatinine");
const CB = { id: "cb", nom: "Carbo-Paclitaxel", c: 21, dr: [{ id: "pac", p: "PACLITAXEL", d: 175, u: "mg/m²", j: [1] }, { id: "cbp", p: "CARBOPLATINE", d: 5, u: "AUC", j: [1] }] };
const lc = (creat, crU, o) => Object.assign({ id: "L2", protoId: "cb", pr: copie(CB), j1: "2026-09-01", poids: "70", creat, crU, cures: [{}, {}] }, o || {});
E = etatLigne(lc("10", "mgL"), patient({ sexe: "H" }), CTX);
cas("homme 60 ans, 70 kg, 10 mg/L : clairance 78, carboplatine 515 mg", E[0].cl === 78 && E[0].doses[1] === 515, [E[0].cl, E[0].doses]);
E = etatLigne(lc("88", "umol"), patient({ sexe: "H" }), CTX);
cas("même patient en µmol/L (88) : 515 mg", E[0].cl === 78 && E[0].doses[1] === 515, [E[0].cl, E[0].doses]);
E = etatLigne(lc("", "mgL"), patient({ sexe: "H" }), CTX);
cas("sans créatinine : pas de dose de carboplatine (jamais 0)", E[0].doses[1] === null, E[0].doses);
E = etatLigne(lc("3", "mgL"), patient({ sexe: "H" }), CTX);
cas("créatinine très basse : clairance plafonnée à 125 pour Calvert (750 mg)", E[0].doses[1] === 750, E[0].doses);

console.log("4. Séances J1 / J8 (gemcitabine fictive, J1 J8 tous les 21 jours)");
const GEM = { id: "gem", nom: "Gemcitabine", c: 21, dr: [{ id: "g", p: "GEMCITABINE", d: 1000, u: "mg/m²", j: [1, 8] }] };
cas("séances J1 et J8", JSON.stringify(seancesDe(GEM).map((s) => s.j)) === "[1,8]");
const lg = Object.assign({ id: "L3", protoId: "gem", pr: copie(GEM), j1: "2026-09-01", poids: "70", creat: "", crU: "mgL", cures: [{ sea: { 8: { poids: "64" } } }, {}] });
E = etatLigne(lg, patient(), CTX);
cas("J1 : 1,82 m² → 1820 mg ; J8 avec 64 kg (1,74 m²) → 1740 mg", E[0].dj[0][1].dose === 1820 && E[0].dj[0][8].dose === 1740, E[0].dj[0]);
cas("le poids de J8 est repris en C2", E[1].poids === 64 && E[1].dj[0][1].dose === 1740, E[1].dj[0]);
const lg2 = copie(lg); lg2.cures[0].sea[8].pctAll = 75;
E = etatLigne(lg2, patient(), CTX);
cas("75 % décidé à J8 : J8 réduit, reconduit en C2", E[0].dj[0][1].dose === 1820 && E[0].dj[0][8].dose === 1305 && E[1].dj[0][1].dose === 1305, [E[0].dj[0], E[1].dj[0]]);
const sc = seancesCure(lg, E[0], {});
cas("date de J8 = J1 + 7 jours", sc.length === 1 && sc[0].j === 8 && sc[0].prevue === "2026-09-08", sc);

console.log("5. Molécules ajoutées, retirées, « tous les n cycles », C1 seule");
const lm = ligne({ mods: [{ k: 2, op: "del", id: "cyc" }, { k: 3, op: "add", d: { id: "tra", p: "TRASTUZUMAB", d: 6, u: "mg/kg", j: [1] } }] });
cas("cyclophosphamide retiré à partir de C3", protocoleCure(lm, 1).dr.some((d) => d.id === "cyc") && !protocoleCure(lm, 2).dr.some((d) => d.id === "cyc"));
cas("trastuzumab ajouté à partir de C4 (6 mg/kg × 60 = 360 mg)", !protocoleCure(lm, 2).dr.some((d) => d.id === "tra") && etatLigne(lm, patient(), CTX)[3].doses.includes(360));
const PT = { id: "pt", nom: "x", c: 21, dr: [{ id: "a", p: "ACIDE ZOLEDRONIQUE", d: 4, u: "mg", j: [1], tous: 2 }, { id: "c1", p: "X", d: 1, u: "mg", j: [1], c1s: 1 }] };
const lt = { id: "L5", pr: PT, j1: "2026-09-01", poids: "70", cures: [{}, {}, {}] };
cas("« tous les 2 cycles » : C1 et C3 ; « C1 seule » : C1", JSON.stringify([0, 1, 2].map((k) => protocoleCure(lt, k).dr.map((d) => d.id).join("+"))) === '["a+c1","","a"]', [0, 1, 2].map((k) => protocoleCure(lt, k).dr.map((d) => d.id)));

console.log("6. Cure validée : figée (audit n° 2, essai 1)");
const lf = ligne(); lf.cures[0] = { st: "recue", reelle: "2026-08-25" };
const E1 = etatLigne(lf, patient({ taille: "162" }), CTX);
lf.cures[0].fige = instantane(E1[0], 0);
const E2 = etatLigne(lf, patient({ taille: "182" }), CTX);
cas("après validation, changer la taille ne change plus les doses de la cure validée (148 mg)", E2[0].doses[0] === 148 && E2[0].sc === 1.64, [E2[0].doses, E2[0].sc]);
cas("la cure suivante, non validée, suit la nouvelle taille (182 cm → 1,74 m², 157 mg)", E2[1].sc === 1.74 && E2[1].doses[0] === 157, [E2[1].sc, E2[1].doses]);

const lc2 = lc("10", "mgL"); lc2.cures[0] = { st: "recue", reelle: "2026-09-01" };
lc2.cures[0].fige = instantane(etatLigne(lc2, patient({ sexe: "H" }), CTX)[0], 0); lc2.cures[0].creat = "20"; lc2.cures[1] = { creat: "20" };
const E3 = etatLigne(lc2, patient({ sexe: "H" }), CTX);
cas("carboplatine validé à 515 mg : la créatinine de C1 corrigée ensuite ne le change pas", E3[0].doses[1] === 515 && E3[0].cl === 78, [E3[0].cl, E3[0].doses]);
cas("… la cure suivante, avec sa créatinine (20 mg/L → clairance 39 → 320 mg), est recalculée", E3[1].cl === 39 && E3[1].doses[1] === 320, [E3[1].cl, E3[1].doses]);
const lj = copie(lg); lj.cures[0].st = "recue"; lj.cures[0].reelle = "2026-09-01"; lj.cures[0].sea[8].st = "recue";
const Ej = etatLigne(lj, patient(), CTX); lj.cures[0].fige = instantane(Ej[0], 0); lj.cures[0].sea[8].fige = instantane(Ej[0], 1);
cas("instantané de J8 : seulement les doses de J8", Object.keys(lj.cures[0].sea[8].fige.doses).join() === "g@8" && lj.cures[0].sea[8].fige.doses["g@8"].dose === 1740, lj.cures[0].sea[8].fige);
lj.cures[0].sea[8].poids = "80";
const Ej2 = etatLigne(lj, patient(), CTX);
cas("séance J8 validée : poids modifié ensuite sans effet sur J8 (1740 mg)", Ej2[0].dj[0][8].dose === 1740 && Ej2[0].dj[0][8].fige === true, Ej2[0].dj[0]);
const lr = copie(lf); lr.cures[0] = {};
cas("validation annulée (instantané retiré) : la cure suit de nouveau le dossier", etatLigne(lr, patient({ taille: "182" }), CTX)[0].doses[0] === 157);

console.log("7. Contrôle avant validation (2.3, audit n° 2 essais 2 à 4)");
let K = etatLigne(ligne(), patient({ taille: "162" }), CTX);
let r = controleSeance(K[0], 0, "mgL", null);
cas("cure normale : ni refus ni alerte", !r.refus.length && !r.alertes.length, r);
const l640 = ligne(); l640.cures[2] = { poids: "640" }; K = etatLigne(l640, patient({ taille: "182" }), CTX);
r = controleSeance(K[2], 0, "mgL", poidsAvant(K, 2, 0));
cas("640 kg : alerte poids, surface et variation (+967 %)", r.alertes.some((a) => /poids de 640/.test(a)) && r.alertes.some((a) => /surface/.test(a)) && r.alertes.some((a) => /\+967 %/.test(a)) && !r.refus.length, r);
const l6 = ligne(); l6.cures[2] = { poids: "6.4" }; K = etatLigne(l6, patient({ taille: "182" }), CTX);
cas("6,4 kg : alerte", controleSeance(K[2], 0, "mgL", 60).alertes.some((a) => /poids de 6.4/.test(a)));
K = etatLigne(ligne(), patient({ taille: "1.62" }), CTX);
cas("taille saisie en mètres (1,62) : alerte « saisie en mètres ? »", controleSeance(K[0], 0, "mgL", null).alertes.some((a) => /mètres/.test(a)));
K = etatLigne(lc("0.7", "mgL"), patient({ sexe: "H" }), CTX); r = controleSeance(K[0], 0, "mgL", null);
cas("créatinine 0,7 mg/L (clairance 1111) : alertes créatinine et clairance", r.alertes.some((a) => /créatinine de 0.7 mg\/L/.test(a)) && r.alertes.some((a) => /clairance de/.test(a)), r);
K = etatLigne(lc("70", "mgL"), patient({ sexe: "H" }), CTX); r = controleSeance(K[0], 0, "mgL", null);
cas("créatinine 70 mg/L (clairance 11) : alertes", r.alertes.some((a) => /créatinine de 70/.test(a)) && r.alertes.some((a) => /clairance de 11/.test(a)), r);
K = etatLigne(lc("88", "umol"), patient({ sexe: "H" }), CTX);
cas("88 µmol/L : pas d'alerte (bonne unité)", !controleSeance(K[0], 0, "umol", null).alertes.length);
K = etatLigne(lc("", "mgL"), patient({ sexe: "H" }), CTX); r = controleSeance(K[0], 0, "mgL", null);
cas("carboplatine sans créatinine : validation refusée", r.refus.length === 1 && /CARBOPLATINE.*créatinine manquante/.test(r.refus[0]), r);
K = etatLigne(ligne(), patient({ taille: "" }), CTX); r = controleSeance(K[0], 0, "mgL", null);
cas("sans taille (pas de surface) : doses impossibles → refus ; prémédication non concernée", r.refus.some((x) => /EPIRUBICINE/.test(x)) && r.refus.some((x) => /CYCLOPHOSPHAMIDE/.test(x)) && !r.refus.some((x) => /ONDANSETRON|SOLUMEDROL/.test(x)), r);
const l0 = ligne(); l0.cures[0] = { pct: { epi: 0 } }; K = etatLigne(l0, patient({ taille: "162" }), CTX);
cas("0 % décidé pour une molécule (non donnée cette cure) : permis", !controleSeance(K[0], 0, "mgL", null).refus.length);
const l11 = ligne(); l11.cures[1] = { poids: "53" }; K = etatLigne(l11, patient({ taille: "162" }), CTX);
cas("perte de poids de 12 % depuis la cure précédente : alerte ; 5 % : rien", controleSeance(K[1], 0, "mgL", poidsAvant(K, 1, 0)).alertes.some((a) => /60 à 53 kg \(-12 %\)/.test(a)) &&
  !controleSeance(etatLigne(Object.assign(ligne(), { cures: [{}, { poids: "57" }, {}, {}] }), patient({ taille: "162" }), CTX)[1], 0, "mgL", 60).alertes.length);
const lgv = copie(lg); K = etatLigne(lgv, patient(), CTX);
cas("J8 : poids comparé à J1 (70 → 64 kg, -9 % : rien)", !controleSeance(K[0], 1, "mgL", poidsAvant(K, 0, 1)).alertes.length && poidsAvant(K, 0, 1) === 70);

console.log("8. Repères de Dr Bentahila (notifications, jamais bloquantes)");
const CIS = { id: "cis", nom: "Cisplatine", c: 21, dr: [{ id: "cp", p: "CISPLATINE", d: 75, u: "mg/m²", j: [1] }, { id: "on", p: "ONDANSETRON", d: 8, u: "mg", j: [1] }] };
const lcis = (creat) => ({ id: "L9", pr: copie(CIS), j1: "2026-09-01", poids: "70", creat, crU: "mgL", cures: [{}, {}] });
const rep = (creat) => { const K2 = etatLigne(lcis(creat), patient({ sexe: "H" }), CTX); return reperesClairance(K2[0], K2[0].g[0]); };
cas("cisplatine, clairance 78 (≥ 60) : rien", rep("10").length === 0, rep("10"));
cas("cisplatine, clairance 52 : zone d'adaptation, réduction possible à 50-70 %", /zone d'adaptation.*50-70 %/.test(rep("15").join()), rep("15"));
cas("cisplatine, clairance 39 : contre-indication habituelle", /moins de 45 ml\/min, contre-indication habituelle/.test(rep("20").join()), rep("20"));
cas("cisplatine sans créatinine : clairance inconnue signalée", /créatinine non saisie/.test(rep("").join()), rep(""));
K = etatLigne(lc("30", "mgL"), patient({ sexe: "H" }), CTX); r = controleSeance(K[0], 0, "mgL", null, null);
cas("carboplatine, clairance 26 : contre-indiqué ou réévaluation stricte, sans doublon « hors seuil »", r.alertes.some((x) => /carboplatine.*moins de 30 ml\/min/.test(x)) && !r.alertes.some((x) => /^clairance de/.test(x)) && !r.refus.length, r);
const lp = ligne(); lp.cures[3] = { poids: "53" }; lp.cures[2] = { poids: "56" }; K = etatLigne(lp, patient({ taille: "162" }), CTX);
r = controleSeance(K[3], 0, "mgL", poidsAvant(K, 3, 0), poidsDebut(K));
cas("perte de poids de 12 % depuis le début de la ligne (60 → 53 kg) signalée", r.alertes.some((x) => /12 % depuis le début de la ligne \(60 → 53 kg\)/.test(x)), r);

console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
