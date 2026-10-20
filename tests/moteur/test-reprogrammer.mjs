// « Patients à reprogrammer » (R-C1, 19/10/2026) : node tests/moteur/test-reprogrammer.mjs
import { aReprogrammer } from "../../public/js/moteur/reprogrammer.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 300))); } };
const t = "2026-10-19";
const seances = { "L1|2|1": { date: "2026-10-16", st: "prevue" }, "L1|2|8": { date: "2026-10-23", st: "prevue" }, "L2|1|1": { date: "2026-10-20", st: "prevue" }, "L3|4|8": { date: "2026-10-15", st: "recue" } };
const seance = (lid, n, j) => seances[lid + "|" + n + "|" + j] || null;
const pats = [
  { id: "A", nm: "PATIENT A", rdvs: [{ id: "a1", type: "Suivi", d: "2026-10-15", st: "absent" }], seance },
  { id: "B", nm: "PATIENT B", rdvs: [{ id: "b1", type: "Suivi", d: "2026-10-14", st: "absent" }, { id: "b2", type: "Suivi", d: "2026-10-28", st: "prevu", rep: [{ d: "2026-10-14", abs: true }] }], seance },
  { id: "C", nm: "PATIENT C", rdvs: [{ id: "c1", type: "Suivi", d: "2026-10-10", st: "absent" }, { id: "c2", type: "Contrôle", d: "2026-10-12", st: "fait" }], seance },
  { id: "D", nm: "PATIENT D", deces: true, rdvs: [{ id: "d1", type: "Suivi", d: "2026-10-15", st: "absent" }], seance },
  { id: "E", nm: "PATIENT E", rdvs: [{ id: "e1", type: "Suivi", d: "2026-08-01", st: "absent" }, { id: "e2", type: "Hospitalisation", d: "2026-10-16", st: "absent" }], seance },
];
const absents = [
  { patientId: "A", jour: "2026-10-16", cle: "c-L1-2-1", etat: "absent" },
  { patientId: "B", jour: "2026-10-13", cle: "c-L2-1-1", etat: "absent" },
  { patientId: "C", jour: "2026-10-15", cle: "c-L3-4-8", etat: "absent" },
  { patientId: "E", jour: "2026-10-16", cle: "c-L1-2-1", etat: "absent", rep: "2026-10-23" },
  { patientId: "A", jour: "2026-10-16", cle: "r-a1", etat: "absent" },
];
const L = aReprogrammer(pats, absents, { t, jours: 30 }), cles = L.map((z) => z.id + ":" + z.quoi + ":" + z.d).join();
cas("consultation non venue sans nouveau rendez-vous : listée", cles.indexOf("A:rdv:2026-10-15") >= 0, L);
cas("reportée après « Non venu » (nouveau rendez-vous prévu) : pas listée", cles.indexOf("B:rdv") < 0);
cas("revenu ensuite (rendez-vous venu) : pas listé", cles.indexOf("C:rdv") < 0);
cas("patient décédé : jamais", cles.indexOf("D:") < 0);
cas("plus de 30 jours, hospitalisation : pas listées", cles.indexOf("E:rdv") < 0);
cas("séance « absent, sans reporter » encore prévue ce jour-là : listée", cles.indexOf("A:chimio:2026-10-16") >= 0);
cas("séance déplacée depuis (plus prévue ce jour-là) : pas listée", cles.indexOf("B:chimio") < 0);
cas("séance validée depuis : pas listée", cles.indexOf("C:chimio") < 0);
cas("absent puis reporté depuis la salle (rep) : pas listé", cles.indexOf("E:chimio") < 0);
cas("libellés", L.find((z) => z.quoi === "chimio").lib === "C2 de chimiothérapie : absent, sans report" && /non venue$/.test(L.find((z) => z.quoi === "rdv").lib), L.map((z) => z.lib));
cas("du plus récent au plus ancien", L[0].d >= L[L.length - 1].d);
console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
