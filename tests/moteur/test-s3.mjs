// S3 (21/10/2026, audit n° 10 d. 44 et 45) : décimales aussi en mg/kg ; créatinine sous 7 mg/L avant un carboplatine = avertissement avec la
// dose qu'on aurait avec 7 mg/L, sans changer le calcul. Patients et protocoles fictifs : node tests/moteur/test-s3.mjs
import { readFileSync } from "node:fs";
import { calcul, etatLigne, controleSeance, clairance } from "../../public/js/moteur/doses.js";
import { correctionsAudit3 } from "../../public/js/moteur/audit3.js";
import { correctionsP4, correctionsP5b } from "../../public/js/moteur/audit3p4.js";
import { P4, P7 } from "../../public/js/donnees/audit3p4.js";
import { correctionsS2, correctionsS3 } from "../../public/js/moteur/audit10.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
const CTX = { aujourdhui: "2026-10-21", bib: {} };

console.log("1. Décimales (d. 44)");
cas("VeIP : vinblastine 0,11 mg/kg × 50 kg = 5,5 mg avec 1 décimale (avant : 6 mg)", calcul({ u: "mg/kg", d: 0.11, dec: 1 }, { poids: 50 }) === 5.5 && calcul({ u: "mg/kg", d: 0.11 }, { poids: 50 }) === 6);
cas("mg/kg sans décimale réglée : inchangé (8 × 70 = 560)", calcul({ u: "mg/kg", d: 8 }, { poids: 70 }) === 560);
cas("mg/kg_c1 avec décimale : 0,5 × 63 = 31,5", calcul({ u: "mg/kg_c1", c1: 0.5, cn: 0.25, dec: 1 }, { poids: 63, n: 1 }) === 31.5);
cas("vincristine 1 mg/m² × 1,50 m² = 1,5 mg avec 1 décimale (avant : 2 mg)", calcul({ u: "mg/m²", d: 1, dec: 1 }, { sc: 1.5 }) === 1.5);
cas("trabectédine 1,1 × 1,36 = 1,5 mg ; dactinomycine 1,25 × 1,30 = 1,6 mg ; lurbinectédine 3,2 × 1,41 = 4,5 mg", calcul({ u: "mg/m²", d: 1.1, dec: 1 }, { sc: 1.36 }) === 1.5 && calcul({ u: "mg/m²", d: 1.25, dec: 1 }, { sc: 1.3 }) === 1.6 && calcul({ u: "mg/m²", d: 3.2, dec: 1 }, { sc: 1.41 }) === 4.5);
cas("dactinomycine plafonnée à 2 mg (1,25 × 1,82 = 2,3)", calcul({ u: "mg/m²", d: 1.25, dec: 1, max: 2 }, { sc: 1.82 }) === 2);

console.log("2. Créatinine plancher avant un carboplatine (d. 45)");
const CB = { id: "cb", nom: "Carboplatine AUC 5", c: 21, dr: [{ id: "cb", p: "CARBOPLATINE", d: 5, u: "AUC", j: [1] }, { id: "ond", p: "ONSET (ondansétron)", d: 8, u: "mg", j: [1] }] };
const ligne = (creat, crU) => ({ id: "L1", protoId: "cb", pr: JSON.parse(JSON.stringify(CB)), j1: "2026-10-21", poids: "45", creat: String(creat), crU: crU || "mgL", cures: [{ creat: String(creat) }] });
const pat = { taille: "155", ddn: "1946-01-01", sexe: "F" }; // 80 ans
let E = etatLigne(ligne(4), pat, CTX), r = controleSeance(E[0], 0, "mgL");
cas("cas de l'audit : 80 ans, 45 kg, créatinine 4 mg/L → clairance 80 ml/min, carboplatine 525 mg (calcul inchangé)", E[0].g[0].cl === 80 && E[0].doses[0] === 525, [E[0].g[0].cl, E[0].doses]);
const m = r.alertes.find((a) => /^carboplatine : créatinine de 4 mg\/L/.test(a));
cas("avertissement : sous 7 mg/L, avec 7 mg/L : 355 mg au lieu de 525 mg", m && /sous 7 mg\/L/.test(m) && /355 mg au lieu de 525 mg/.test(m) && /46 ml\/min/.test(m), r.alertes);
cas("il ne bloque rien (aucun refus)", !r.refus.length);
cas("7 mg/L et plus : rien", !controleSeance(etatLigne(ligne(7), pat, CTX)[0], 0, "mgL").alertes.some((a) => /plancher/.test(a)));
const Eu = etatLigne(ligne(35, "umol"), pat, CTX), ru = controleSeance(Eu[0], 0, "umol");
cas("en µmol/L : plancher 62 µmol/L", ru.alertes.some((a) => /créatinine de 35 µmol\/L \(sous 62 µmol\/L\)/.test(a)), ru.alertes);
const sansCarbo = { id: "L2", protoId: "x", pr: { id: "x", c: 21, dr: [{ id: "pac", p: "PACLITAXEL", d: 175, u: "mg/m²", j: [1] }] }, j1: "2026-10-21", poids: "45", creat: "4", crU: "mgL", cures: [{ creat: "4" }] };
cas("sans carboplatine : pas cet avertissement", !controleSeance(etatLigne(sansCarbo, pat, CTX)[0], 0, "mgL").alertes.some((a) => /plancher/.test(a)));
cas("clairance de contrôle (80 ans, 45 kg, 7 mg/L, femme) = 46 ml/min", clairance(80, 45, 7, "F", "mgL") === 46);

console.log("3. Bibliothèque reconstruite du 18/10 : lignes réglées à 1 décimale");
const L = JSON.parse(readFileSync(new URL("./donnees/bibliotheque-2026-10-18.json", import.meta.url))), BIB = {};
L.forEach((p) => { BIB[p.id] = p; });
const ap = (r) => { r.modifies.forEach((m) => { BIB[m.id] = m.p; }); (r.crees || []).forEach((p) => { BIB[p.id] = p; }); (r.supprimes || []).forEach((x) => delete BIB[x.id]); };
ap(correctionsAudit3(BIB)); ap(correctionsP4(BIB, P4, P7)); ap(correctionsP5b(BIB)); ap(correctionsS2(BIB));
const avant = JSON.stringify(BIB), r3 = correctionsS3(BIB);
cas("la bibliothèque reçue n'est pas modifiée", JSON.stringify(BIB) === avant);
cas("4 protocoles : EMA-CO, Actinomycine D, Lurbinectédine, Doxorubicine + Trabectédine", r3.modifies.length === 4 && ["audit3|n025", "audit3|n027", "audit3|n038", "audit3|n040"].every((id) => r3.modifies.some((m) => m.id === id)), r3.modifies.map((m) => [m.nom, m.quoi]));
const lig = (id, re) => r3.modifies.find((m) => m.id === id).p.dr.find((d) => re.test(d.p));
cas("dactinomycine : 1 décimale et plafond 2 mg (remarque « max 2 mg »)", lig("audit3|n025", /ACTINOMYCINE/).dec === 1 && lig("audit3|n025", /ACTINOMYCINE/).max === 2);
cas("EMA-CO : vincristine à 1 décimale ; dactinomycine en mg fixe non touchée", lig("audit3|n027", /VINCRISTINE/).dec === 1 && lig("audit3|n027", /ACTINOMYCINE/).dec == null);
r3.modifies.forEach((m) => { BIB[m.id] = m.p; });
cas("relancer ne refait rien", !correctionsS3(BIB).modifies.length);
console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
process.exit(ko ? 1 : 0);
