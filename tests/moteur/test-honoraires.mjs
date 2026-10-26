// 24/10/2026 (signalé par Dr Bentahila : une C1J1 validée absente du bilan) : la case « Traitement associé » (castration, os, support) ne retire
// plus les honoraires d'une vraie chimiothérapie. Protocoles fictifs : node tests/moteur/test-honoraires.mjs
import { ligneHon, associeVrai } from "../../public/js/moteur/finances.js";
import { resume, ligneCourante } from "../../public/js/moteur/resume.js";
let ok = 0, ko = 0;
const cas = (nom, v) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom); } };
const P = (dr, assoc) => ({ nom: "x", assoc, dr: dr.map((p, i) => Object.assign({ id: "d" + i, u: "mg" }, typeof p === "string" ? { p } : p)) });
cas("paclitaxel + carboplatine marqué « associé » : honoraires comptés", ligneHon({ assoc: 1 }, P(["SOLUMEDROL", "PACLITAXEL", "CARBOPLATINE"], 1)));
cas("goséréline marquée « associé » : pas d'honoraires", !ligneHon({ assoc: 1 }, P(["ZOLADEX 3,6 mg (goséréline)"], 1)));
cas("Nivestim seul marqué « associé » : pas d'honoraires", !ligneHon({ assoc: 1 }, P(["NIVESTIM (filgrastim)"], 1)));
cas("acide zolédronique : honoraires (inchangé)", ligneHon({ assoc: 1 }, P(["ZOMETA (acide zolédronique)"], 1)));
cas("hormonothérapie orale seule (non associée) : pas d'honoraires (inchangé)", !ligneHon({}, P([{ p: "LÉTROZOLE", v: "Per os" }])));
cas("chimiothérapie ordinaire : honoraires (inchangé)", ligneHon({}, P(["DOCÉTAXEL"])));
// 26/10/2026 : Zometa, Xgeva facturés (hôpital de jour) ; castration injectable, comprimés, Nivestim et fer seuls non facturés (sur ordonnance)
cas("Xgeva (dénosumab, SC) : honoraires de séance", ligneHon({}, P([{ p: "XGEVA (dénosumab) 120 mg", v: "SC" }])));
cas("Zometa non coché « associé » : honoraires de séance", ligneHon({}, P(["ACIDE ZOLÉDRONIQUE (Zometa) 4 mg"])));
cas("Décapeptyl (triptoréline) injectable : pas d'honoraires", !ligneHon({}, P([{ p: "DÉCAPEPTYL LP 11,25 mg (triptoréline)", v: "IM" }])));
cas("Firmagon (dégarélix) : pas d'honoraires", !ligneHon({}, P([{ p: "FIRMAGON (dégarélix) 80 mg", v: "SC" }])));
cas("Nivestim seul, non coché « associé » : pas d'honoraires", !ligneHon({}, P([{ p: "NIVESTIM 30 MU (filgrastim)", v: "SC" }])));
cas("fer injectable seul (carboxymaltose ferrique) : pas d'honoraires", !ligneHon({}, P([{ p: "FERINJECT (carboxymaltose ferrique) 1000 mg", v: "IV" }])));
cas("paclitaxel + Zometa dans le même protocole : honoraires de séance", ligneHon({}, P(["PACLITAXEL", "ACIDE ZOLÉDRONIQUE (Zometa) 4 mg"])));
cas("paclitaxel + Nivestim dans le même protocole : honoraires de séance", ligneHon({}, P(["PACLITAXEL", { p: "NIVESTIM 30 MU (filgrastim)", v: "SC" }])));
cas("létrozole + Zoladex seuls : pas d'honoraires", !ligneHon({}, P([{ p: "LÉTROZOLE", v: "Per os" }, { p: "ZOLADEX 3,6 mg (goséréline)", v: "SC" }])));
cas("thérapie ciblée orale : pas d'honoraires", !ligneHon({}, P([{ p: "GIOTRIF (afatinib) 40 mg cp", v: "Per os" }])));
// 25/10/2026 : même ligne, côté dossier : elle reste la ligne en cours (bandeau « Chimio C2/6 », plus « Cundefined/undefined »)
const PC = Object.assign(P([{ p: "PACLITAXEL", u: "mg/m²", d: 80, j: [1, 8, 15] }, { p: "CARBOPLATINE", u: "AUC", d: 2, j: [1, 8, 15] }], 1), { id: "x|pc", c: 21 });
const Lc = { id: "L1", protoId: PC.id, pr: PC, assoc: 1, j1: "2026-10-22", poids: "70", creat: "8", crU: "mgL", cures: [{ st: "recue", reelle: "2026-10-22" }, {}, {}, {}, {}, {}] };
const ctx = { aujourdhui: "2026-10-25", bib: {}, feries: [] }, Pt = { nom: "PATIENT TEST", lignes: [Lc], rdvs: [], rts: [] };
cas("vraie chimio cochée « associé » : pas un traitement associé (associeVrai)", !associeVrai(Lc, PC) && associeVrai({ assoc: 1 }, P(["ZOLADEX 3,6 mg (goséréline)"], 1)));
cas("vraie chimio cochée « associé » : ligne en cours du dossier", ligneCourante(Pt, ctx) === 0);
const r = resume(JSON.parse(JSON.stringify(Pt)), ctx);
cas("bandeau : cure et nombre de cures connus (C2/6)", r.t && r.t.st === "cours" && r.t.k === 2 && r.t.nb === 6);
const Pz = { nom: "PATIENT TEST", lignes: [Object.assign({}, Lc, { pr: Object.assign(P(["ZOLADEX 3,6 mg (goséréline)"], 1), { id: "x|z", c: 28 }) })], rdvs: [], rts: [] };
const rz = resume(JSON.parse(JSON.stringify(Pz)), ctx);
cas("vraie ligne associée seule (goséréline) : cure et nombre de cures aussi donnés", rz.t && (rz.t.st !== "cours" || rz.t.nb === 6));
console.log("\n" + ok + " réussi(s), " + ko + " échec(s)"); process.exit(ko ? 1 : 0);
