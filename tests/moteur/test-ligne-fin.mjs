// Ligne de chimiothérapie « terminée » (26/10/2026, Dr Bentahila : ligne passée « terminée » alors que le C6 J15 restait à faire) :
// node tests/moteur/test-ligne-fin.mjs. Protocole fictif J1-J8, 2 cures, écrit ici.
import { statutLigne } from "../../public/js/moteur/resume.js";

let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d).slice(0, 300))); } };
const CTX = { aujourdhui: "2026-10-26", bib: {} };
const GEM = { id: "gem", nom: "Gemcitabine J1-J8 (fictif)", c: 21, dr: [{ id: "g", p: "GEMCITABINE", d: 1000, u: "mg/m²", j: [1, 8] }] };
const P = { taille: "170", ddn: "1966-05-01", sexe: "F" };
const ligne = (c2) => ({ id: "L1", protoId: "gem", pr: JSON.parse(JSON.stringify(GEM)), j1: "2026-09-01", poids: "70", cures: [{ st: "recue", reelle: "2026-09-01", sea: { 8: { st: "recue", d: "2026-09-08" } } }, c2] });

console.log("Ligne terminée seulement quand la dernière cure n'a plus de séance à faire");
let s = statutLigne(ligne({ st: "recue", reelle: "2026-09-22", sea: { 8: { st: "prevue" } } }), P, CTX);
cas("C2 J1 reçue, C2 J8 encore prévue : ligne « en cours » (avant : « terminée »)", s.code === "cours", s.code);
s = statutLigne(ligne({ st: "recue", reelle: "2026-09-22", sea: { 8: { st: "recue", d: "2026-09-29" } } }), P, CTX);
cas("C2 J8 reçue : ligne terminée", s.code === "fin", s.code);
s = statutLigne(ligne({ st: "recue", reelle: "2026-09-22", sea: { 8: { st: "annulee" } } }), P, CTX);
cas("C2 J8 annulée : ligne terminée", s.code === "fin", s.code);
s = statutLigne(ligne({}), P, CTX);
cas("C2 pas encore reçue : en cours", s.code === "cours", s.code);
console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
