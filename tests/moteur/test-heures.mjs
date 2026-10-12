// Heures d'une séance de chimio (12/10/2026) : consultation du médecin, séance de l'infirmière (moteur/heures.js), lecture et
// séparation du dossier (donnees/conversion.js). Données fictives. node tests/moteur/test-heures.mjs
import { noterHeures, consultationDe, seanceProposee, decaler } from "../../public/js/moteur/heures.js";
import { fusionner, separer } from "../../public/js/donnees/conversion.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
const MED = { par: "MED", parNom: "Dr A", le: "2026-10-12T08:00:00Z" }, INF = { par: "INF", parNom: "Inf B", le: "2026-10-12T09:00:00Z" };

console.log("1. Saisies");
let v = noterHeures(null, { cons: "09:30" }, MED);
cas("le médecin choisit la consultation", v.cons.h === "09:30" && v.cons.du === 15 && v.cons.par === "MED" && !v.seance, v);
v = noterHeures(v, { seance: { h: "09:45", du: 180 } }, INF);
cas("l'infirmière ajoute la séance sans toucher à la consultation", v.cons.h === "09:30" && v.cons.par === "MED" && v.seance.h === "09:45" && v.seance.du === 180, v);
cas("consultation affichée = celle du médecin", consultationDe(v.cons, v.seance).h === "09:30" && !consultationDe(v.cons, v.seance).auto);
v = noterHeures(v, { seance: { h: "11:00", du: 120 } }, INF);
cas("l'infirmière change sa séance : la consultation du médecin reste", consultationDe(v.cons, v.seance).h === "09:30");
const w = noterHeures(null, { seance: { h: "11:00", du: 120 } }, INF);
cas("sans heure du médecin : consultation placée juste avant la séance (10:45, auto)", consultationDe(w.cons, w.seance).h === "10:45" && consultationDe(w.cons, w.seance).auto, consultationDe(w.cons, w.seance));
const w2 = noterHeures(w, { seance: { h: "14:00", du: 120 } }, INF);
cas("elle déplace sa séance : la consultation automatique suit (13:45)", consultationDe(w2.cons, w2.seance).h === "13:45");
const w3 = noterHeures(w2, { cons: "13:00" }, MED);
cas("le médecin choisit ensuite : son heure passe avant", consultationDe(w3.cons, w3.seance).h === "13:00" && !consultationDe(w3.cons, w3.seance).auto);
const w4 = noterHeures(w3, { cons: "" }, MED);
cas("le médecin retire son heure : retour à l'automatique", w4.cons === null && consultationDe(w4.cons, w4.seance).h === "13:45");
cas("aucune heure : aucune consultation", consultationDe(null, null) === null);
cas("séance proposée juste après la consultation", seanceProposee({ h: "09:30", du: 15 }) === "09:45" && seanceProposee(null) === "");
cas("décalage borné à la journée", decaler("00:05", -15) === "00:00");

console.log("2. Dossier : lecture et enregistrement");
const lignes = [{ id: "L1", cures: [{ st: "recue", reelle: "2026-10-01", sea: { 8: { st: "prevue" } } }, { st: "prevue" }] }];
const doc = { identite: { nom: "PATIENT Test" }, clinique: {}, lignesJson: JSON.stringify(lignes), planningJson: JSON.stringify({ L1: { 2: { hr: { h: "08:00", du: 60 } } } }),
  heures: { "L1|1|8": { cons: { h: "10:00", du: 15, par: "MED" } }, "L1|2|1": { seance: { h: "09:00", du: 240, par: "INF" } } } };
const P = fusionner("p1", doc, null), c1 = P.lignes[0].cures[0], c2 = P.lignes[0].cures[1];
cas("J8 de C1 : consultation du médecin", c1.sea[8].hc.h === "10:00" && !c1.sea[8].hc.auto && !c1.sea[8].hr, c1.sea[8]);
cas("C2 : séance de l'infirmière avant l'ancienne heure du planning, consultation automatique 08:45", c2.hr.h === "09:00" && c2.hr.du === 240 && c2.hc.h === "08:45" && c2.hc.auto, c2);
const P0 = fusionner("p1", Object.assign({}, doc, { heures: {} }), null);
cas("ancienne heure du planning (avant le 12/10) : gardée comme séance, consultation 07:45", P0.lignes[0].cures[1].hr.h === "08:00" && P0.lignes[0].cures[1].hc.h === "07:45", P0.lignes[0].cures[1]);
const r = separer(P).patient, L2 = JSON.parse(r.lignesJson)[0], pl = JSON.parse(r.planningJson);
cas("enregistrement : rien des heures dans les lignes", !JSON.stringify(L2).match(/"h[rc]m?"/), L2);
cas("enregistrement : les heures du champ « heures » ne vont pas dans le planning", !JSON.stringify(pl).includes("09:00") && !JSON.stringify(pl).includes("10:00"), pl);
const r0 = JSON.parse(separer(P0).patient.planningJson);
cas("l'ancienne heure du planning y reste", r0.L1 && r0.L1[2] && r0.L1[2].hr && r0.L1[2].hr.h === "08:00", r0);
const P3 = fusionner("p1", Object.assign({}, doc, { heures: { "L1|2|1": { seance: null } } }), null);
cas("séance retirée : l'ancienne heure du planning ne revient pas", !P3.lignes[0].cures[1].hr && !P3.lignes[0].cures[1].hc, P3.lignes[0].cures[1]);

console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
