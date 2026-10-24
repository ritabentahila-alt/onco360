// 24/10/2026 (signalé par Dr Bentahila : une C1J1 validée absente du bilan) : la case « Traitement associé » (castration, os, support) ne retire
// plus les honoraires d'une vraie chimiothérapie. Protocoles fictifs : node tests/moteur/test-honoraires.mjs
import { ligneHon } from "../../public/js/moteur/finances.js";
let ok = 0, ko = 0;
const cas = (nom, v) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom); } };
const P = (dr, assoc) => ({ nom: "x", assoc, dr: dr.map((p, i) => Object.assign({ id: "d" + i, u: "mg" }, typeof p === "string" ? { p } : p)) });
cas("paclitaxel + carboplatine marqué « associé » : honoraires comptés", ligneHon({ assoc: 1 }, P(["SOLUMEDROL", "PACLITAXEL", "CARBOPLATINE"], 1)));
cas("goséréline marquée « associé » : pas d'honoraires", !ligneHon({ assoc: 1 }, P(["ZOLADEX 3,6 mg (goséréline)"], 1)));
cas("Nivestim seul marqué « associé » : pas d'honoraires", !ligneHon({ assoc: 1 }, P(["NIVESTIM (filgrastim)"], 1)));
cas("acide zolédronique : honoraires (inchangé)", ligneHon({ assoc: 1 }, P(["ZOMETA (acide zolédronique)"], 1)));
cas("hormonothérapie orale seule (non associée) : pas d'honoraires (inchangé)", !ligneHon({}, P([{ p: "LÉTROZOLE", v: "Per os" }])));
cas("chimiothérapie ordinaire : honoraires (inchangé)", ligneHon({}, P(["DOCÉTAXEL"])));
console.log("\n" + ok + " réussi(s), " + ko + " échec(s)"); process.exit(ko ? 1 : 0);
