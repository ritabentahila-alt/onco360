// Lot C (audit n° 4, 19/10/2026) : « Rendez-vous et tâches à venir » (J8 / J15 en retard gardés, R-C2), médecin et lieu de chaque événement
// pour Google Agenda et les créneaux (R-C3). Patient et protocole fictifs. node tests/moteur/test-agenda-c.mjs
import { chimioAVenir, evtsAgenda } from "../../public/js/moteur/agenda.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 400))); } };
const copie = (o) => JSON.parse(JSON.stringify(o));
const GEM = { id: "gem", nom: "Gemcitabine", c: 21, dr: [{ id: "g", p: "GEMCITABINE", d: 1000, u: "mg/m²", j: [1, 8] }] };
const P0 = (lignes, o) => Object.assign({ id: "PX", nom: "PATIENT FICTIF", taille: "170", ddn: "1966-05-01", sexe: "F", poids: "70", lignes, rdvs: [], rts: [] }, o || {});
const ligne = (cures, o) => Object.assign({ id: "L1", protoId: "gem", pr: copie(GEM), j1: "2026-09-21", poids: "70", creat: "", crU: "mgL", cures }, o || {});
const ctx = (t) => ({ aujourdhui: t, bib: {}, feries: [] });

console.log("1. J8 passé sans validation (R-C2, audit 4 d. 12)");
// C1 J1 reçu le 21/09, J8 prévu le 28/09 non validé ; C2 prévue le 12/10
let P = P0([ligne([{ st: "recue", reelle: "2026-09-21" }, {}])]);
let l = chimioAVenir(copie(P), ctx("2026-10-01"));
cas("J8 du 28/09 gardé « en retard » au 01/10", l.some((z) => z.j === 8 && z.n === 1 && /en retard/.test(z.lib)), l);
cas("C2 J1 et J8 à venir listés", l.some((z) => z.n === 2 && z.j === 1) && l.some((z) => z.n === 2 && z.j === 8));
P = P0([ligne([{ st: "recue", reelle: "2026-09-21" }, { st: "recue", reelle: "2026-10-12" }])]);
l = chimioAVenir(copie(P), ctx("2026-10-14"));
cas("cure suivante faite : l'ancien J8 n'est plus listé (oublié, pas à venir)", !l.some((z) => z.n === 1), l);
P = P0([ligne([{}, {}])]);
l = chimioAVenir(copie(P), ctx("2026-10-01"));
cas("J1 pas encore reçu : seul le J1 est « en retard » (pas le J8)", l.some((z) => z.n === 1 && z.j === 1 && /en retard/.test(z.lib)) && !l.some((z) => z.n === 1 && z.j === 8), l);
P = P0([ligne([{ st: "recue", reelle: "2026-09-21" }, {}])]);
l = chimioAVenir(copie(P), ctx("2026-09-25"));
cas("J8 à venir : sans « en retard »", l.some((z) => z.n === 1 && z.j === 8 && !/en retard/.test(z.lib)), l);
P = P0([ligne([{ st: "recue", reelle: "2026-09-21" }, {}], { arret: { date: "2026-09-30" } })]);
cas("ligne arrêtée : rien à venir", !chimioAVenir(copie(P), ctx("2026-10-01")).length);

console.log("2. Médecin et lieu des événements (R-C3)");
P = P0([ligne([{ st: "recue", reelle: "2026-09-21" }, {}], { med: "UB" })], { med: "UA", hop: "HGC", rdvs: [{ id: "r1", type: "Suivi", d: "2026-10-20", st: "prevu", lieu: "HCK" }, { id: "r2", type: "Suivi", d: "2026-10-21", st: "prevu", med: "UB" }], rts: [{ id: "rt1", deb: "2026-10-22", nb: 5, hop: "CIOC" }] });
const ev = evtsAgenda(copie(P), ctx("2026-10-01"));
const de = (k) => ev.find((e) => e.k === "PX|" + k) || {};
cas("séance de chimio : médecin de la ligne (UB)", de("c|0|2").m === "UB" && de("s|0|2|8").m === "UB", ev.map((e) => [e.k, e.m]));
cas("radiothérapie sans médecin noté : médecin du patient (UA)", de("rt|rt1|deb").m === "UA");
cas("rendez-vous : son médecin (UB) ; sans médecin noté : rien (le titulaire)", de("r|r2").m === "UB" && !de("r|r1").m);
cas("rendez-vous : son lieu dans le titre (HCK) ; RT : le sien (CIOC)", /\(HCK\)$/.test(de("r|r1").t) && /\(CIOC\)$/.test(de("rt|rt1|deb").t), [de("r|r1").t, de("rt|rt1|deb").t]);
P.med = ""; P.lignes[0].med = ""; const ev2 = evtsAgenda(copie(P), ctx("2026-10-01"));
cas("ni médecin de la ligne ni du patient : rien (le titulaire)", !ev2.find((e) => e.k === "PX|c|0|2").m);
console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
