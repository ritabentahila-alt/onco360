// P3 (audit n° 3, 18/10/2026) : risque émétique, seuils du jour, NIVESTIM selon le poids, « cycles 1 à n », cumul de bléomycine :
// node tests/moteur/test-seuils.mjs. Protocoles fictifs écrits ici + la vraie bibliothèque du 18/10/2026 (protocoles seulement).
import { readFileSync } from "node:fs";
import { risqueEmetique, risqueDe, seuilsJour, hebdomadaire } from "../../public/js/moteur/seuils.js";
import { premed, texteNiv, protocoleCure } from "../../public/js/moteur/doses.js";
import { cumuls, EXAMENS, horsNorme } from "../../public/js/moteur/vigilance.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 300))); } };
const P = (...dr) => ({ dr: dr.map(([p, u, d, v]) => ({ p, u, d, v: v || "IV", j: [1] })) });

console.log("1. Risque émétique (MASCC/ESMO 2023)");
const R = (p) => risqueEmetique(p, premed);
cas("cisplatine : élevé", R(P(["CISPLATINE", "mg/m²", 75], ["ONSET (ondansétron)", "mg", 8])) === "eleve");
cas("AC (doxorubicine + cyclophosphamide 600) : élevé", R(P(["DOXORUBICINE", "mg/m²", 60], ["CYCLOPHOSPHAMIDE (Endoxan)", "mg/m²", 600])) === "eleve");
cas("cyclophosphamide 600 seul : modéré ; 1500 : élevé", R(P(["CYCLOPHOSPHAMIDE", "mg/m²", 600])) === "modere" && R(P(["CYCLOPHOSPHAMIDE", "mg/m²", 1500])) === "eleve");
cas("carboplatine AUC 5 : modéré haut ; AUC 2 : modéré", R(P(["CARBOPLATINE", "AUC", 5])) === "modhaut" && R(P(["CARBOPLATINE", "AUC", 2])) === "modere");
cas("oxaliplatine : modéré ; paclitaxel : faible ; pembrolizumab : minimal", R(P(["OXALIPLATINE", "mg/m²", 85])) === "modere" && R(P(["PACLITAXEL", "mg/m²", 80])) === "faible" && R(P(["KEYTRUDA (pembrolizumab)", "mg", 200])) === "minimal");
cas("Enhertu, Trodelvy : modéré haut", R(P(["ENHERTU (trastuzumab déruxtécan)", "mg/kg", 5.4])) === "modhaut" && R(P(["Sacituzumab govitécan (Trodelvy)", "mg/kg", 10])) === "modhaut");
cas("tout per os : oral faible (capécitabine), oral modéré à élevé (témozolomide)", R(P(["CAPECITABINE", "mg/m²", 1000, "Per os"])) === "oral" && R(P(["TEMOZOLOMIDE", "mg/m²", 150, "Per os"])) === "oralfort");
cas("risque choisi par le médecin (re) avant le calcul", risqueDe(Object.assign(P(["PACLITAXEL", "mg/m²", 80]), { re: "modere" }), premed) === "modere");
const BIB = JSON.parse(readFileSync(new URL("./donnees/bibliotheque-2026-10-18.json", import.meta.url)));
const n = {}; BIB.forEach((p) => { const k = R(p); n[k] = (n[k] || 0) + 1; });
cas("vraie bibliothèque : tous les protocoles classés, élevés et modérés hauts nombreux (≈ 97 relèvent d'un anti-NK1 selon l'audit)", (n.eleve || 0) + (n.modhaut || 0) >= 70 && Object.keys(n).every((k) => ["eleve", "modhaut", "modere", "faible", "minimal", "oral", "oralfort"].includes(k)), n);

console.log("2. Seuils du jour");
cas("J8 / J15 ou cycle de 7 jours = séance hebdomadaire ; J1 d'un cycle de 21 jours = non", hebdomadaire({ n: 1, cycle: 21 }) && hebdomadaire({ n: 0, cycle: 7 }) && !hebdomadaire({ n: 0, cycle: 21 }));
const gem = [{ p: "GEMCITABINE", u: "mg/m²", dose: 1800 }];
cas("gemcitabine J8 : PNN 0,8 → 75 %", seuilsJour({ prods: gem, n: 1, bio: { pnn: 0.8, plq: 150 } }).some((m) => /75 %/.test(m)));
cas("gemcitabine J8 : plaquettes 40 → séance non faite", seuilsJour({ prods: gem, n: 1, bio: { pnn: 2, plq: 40 } }).some((m) => /non faite/.test(m)));
cas("gemcitabine J1 : pas de règle J8 ; bilan normal : rien", !seuilsJour({ prods: gem, n: 0, bio: { pnn: 0.8 } }).length && !seuilsJour({ prods: gem, n: 1, bio: { pnn: 1.5, plq: 150 } }).length);
const tra = [{ p: "TRABECTEDINE (Yondelis)", u: "mg/m²", dose: 2.5 }];
cas("trabectédine : CPK > 2,5 × N signalée ; bilan normal : rien", seuilsJour({ prods: tra, bio: { cpk: 900 }, crU: "mgL" }).some((m) => /CPK/.test(m)) && !seuilsJour({ prods: tra, bio: { cpk: 150, pal: 100, bili: 8 }, crU: "mgL" }).length);
const doc = [{ p: "DOCETAXEL", u: "mg/m²", dose: 130 }];
cas("docétaxel : transaminases > 1,5 × N avec PAL > 2,5 × N → contre-indiqué ; transaminases seules : rien ici", seuilsJour({ prods: doc, bio: { asat: 80, pal: 400 } }).length === 1 && !seuilsJour({ prods: doc, bio: { asat: 80, pal: 100 } }).length);
cas("cabazitaxel : bilirubine au-dessus de la normale", seuilsJour({ prods: [{ p: "CABAZITAXEL (Jevtana)", u: "mg/m²" }], bio: { bili: 15 }, crU: "mgL" }).length === 1);
cas("PAL et CPK dans le bilan du jour, rouges au-dessus de la normale", EXAMENS.some((x) => x[0] === "pal") && EXAMENS.some((x) => x[0] === "cpk") && horsNorme("pal", 200) && !horsNorme("cpk", 100));

console.log("3. NIVESTIM selon le poids");
const t = "1 injection SC par jour : 30 MU (48 MU si poids > 70 kg) — J3 → J7 : 5 injections";
cas("65 kg → 30 MU", /^1 injection SC par jour : 30 MU \(poids 65 kg/.test(texteNiv(t, 65)), texteNiv(t, 65));
cas("82 kg → 48 MU", /48 MU \(poids 82 kg/.test(texteNiv(t, 82)), texteNiv(t, 82));
cas("sans poids : texte inchangé ; autre texte : inchangé", texteNiv(t, null) === t && texteNiv("30 000 UI", 80) === "30 000 UI");

console.log("4. « Cycles 1 à n »");
const pr = { dr: [{ id: "a", p: "NIVOLUMAB", u: "mg", d: 360, j: [1] }, { id: "b", p: "CARBOPLATINE", u: "AUC", d: 5, j: [1], cmax: 2 }] };
const Lg = { pr };
cas("carboplatine aux cures 1 et 2 seulement (cmax 2), nivolumab toujours", protocoleCure(Lg, 0).dr.length === 2 && protocoleCure(Lg, 1).dr.length === 2 && protocoleCure(Lg, 2).dr.length === 1 && protocoleCure(Lg, 2).dr[0].id === "a");

console.log("5. Dose cumulée de bléomycine");
const c = cumuls({ prods: [{ p: "BLÉOMYCINE", u: "mg", dose: 30 }], sc: 1.8, histo: [{ d: "2026-01-01", sc: 1.8, doses: [{ p: "BLÉOMYCINE", u: "mg", dose: 30 }] }, { d: "2026-01-08", sc: 1.9, doses: [{ p: "BLÉOMYCINE", u: "mg", dose: 30 }] }], date: "2026-01-15" });
const bl = c.find((z) => z.id === "bleo");
cas("bléomycine comptée en mg (pas par m²) : 3 × 30 = 90 mg sur 400", bl && bl.total === 90 && bl.seuil === 400 && bl.u === "mg", bl);

console.log("\n" + ok + " / " + (ok + ko) + " vérifications justes");
if (ko) process.exit(1);
