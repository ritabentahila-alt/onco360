// T1 (24/10/2026) : tri de la recherche des protocoles, nombre de cures proposé. node tests/moteur/test-recherche.mjs
import { rangNom, trierRecherche, curesProposees } from "../../public/js/moteur/recherche.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d))); } };
const L = [{ nom: "Docétaxel 75 + Cyclophosphamide (TC)" }, { nom: "EC 90/600 / 21 j × 4" }, { nom: "AC 60/600 × 4 puis paclitaxel" }, { nom: "FEC 100" }, { nom: "Paclitaxel hebdo après EC" }, { nom: "ECF" }];
const t = trierRecherche(L, "EC").map((p) => p.nom);
cas("« EC » : EC 90/600, puis ECF, puis « … après EC », puis les autres", t[0] === "EC 90/600 / 21 j × 4" && t[1] === "ECF" && t[2] === "Paclitaxel hebdo après EC", t);
cas("rangs : mot entier au début 0, lettres au début 1, mot entier ailleurs 2, ailleurs 3", rangNom("EC 90/600", "ec") === 0 && rangNom("ECF", "EC") === 1 && rangNom("après EC", "EC") === 2 && rangNom("FEC 100", "EC") === 3);
cas("sans recherche : ordre alphabétique", trierRecherche(L, "").map((p) => p.nom)[0] === "AC 60/600 × 4 puis paclitaxel");
cas("accents ignorés (« docetaxel »)", rangNom("Docétaxel 75", "docetaxel") === 0);
cas("nombre de cures : « × 4 » du nom", curesProposees({ nom: "AC 60/600 / 21 j × 4" }) === 4 && curesProposees({ nom: "TPEx : … / 21 j × 4" }) === 4);
cas("nombre de cures : réglé dans le protocole (nbc) d'abord", curesProposees({ nom: "AC × 4", nbc: 3 }) === 3);
cas("nombre de cures : « x 6 » du rythme ; rien = 6", curesProposees({ nom: "TC", r: "J1 tous les 21 jours x 6" }) === 6 && curesProposees({ nom: "FOLFOX" }) === 6 && curesProposees({ nom: "BEP × 3" }) === 3);
cas("« 300 mg × 2/j » ou « 150 mg × 2 » : pas un nombre de cures (6)", curesProposees({ nom: "Olaparib 300 mg × 2/j" }) === 6 && curesProposees({ nom: "Abémaciclib 150 mg × 2/j (adjuvant)" }) === 6 && curesProposees({ nom: "Capécitabine 1000 mg/m² × 2" }) === 6);
cas("« / 21 j × 4 (CheckMate 8HW) » : 4", curesProposees({ nom: "Nivolumab 240 + Ipilimumab 1 mg/kg / 21 j × 4 (CheckMate 8HW)" }) === 4);
console.log("\n" + ok + " réussi(s), " + ko + " échec(s)"); process.exit(ko ? 1 : 0);
