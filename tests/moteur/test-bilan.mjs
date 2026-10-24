// Tests du calcul du bilan, sans navigateur (étape 15 bis B1, 10/10/2026) : node tests/moteur/test-bilan.mjs
// 1) Bilan 2026 du jeu de test (tests/seed.json) identique à la référence (tests/bilan_ref.txt) ;
// 2) hôpital de chaque acte (historique des changements d'hôpital) ; 3) identifiant des actes et cases « Payé ».
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const ICI = path.dirname(fileURLToPath(import.meta.url)), P = "file://" + path.join(ICI, "..", "..", "public", "js") + "/";
const { fusionner } = await import(P + "donnees/conversion.js");
const { evtsFin } = await import(P + "moteur/finances.js");
const B = await import(P + "moteur/bilan.js");
let ok = 0, ko = 0;
const cas = (nom, v) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom); } };
const T0 = "2026-10-06", E = "espaces/cabinet-bentahila/";
const REEL = process.env.ONCO360_SEED === "reel"; // S7 (24/10/2026) : jeu fictif par défaut (tests/seed-fictif.json, référence tests/bilan_ref_fictif.txt)
const S = JSON.parse(fs.readFileSync(path.join(ICI, "..", REEL ? "seed.json" : "seed-fictif.json"), "utf8")), J = (k, d) => (S[E + k] ? JSON.parse(S[E + k].data) : d);
const bib = {}; Object.keys(S).filter((k) => k.startsWith(E + "protocoles/")).forEach((k) => JSON.parse(S[k].data).forEach((p) => { bib[p.id] = p; }));
const table = J("finances/tarifs", null), pai = J("finances/paiements", {}), ver = J("finances/versements", []), cal = J("parametres/calendrier", { feries: [] });
const ctx = { aujourdhui: T0, bib, feries: cal.feries || [], table };
const res = Object.keys(S).filter((k) => k.startsWith(E + "patients/")).map((k) => {
  const id = k.split("/").pop(), Pt = fusionner(id, S[k], null), M = JSON.parse((S[E + "patientsFinances/" + id] || {}).montantsJson || "{}");
  return { id, nm: Pt.nom, cor: Pt.cor || "", hop: Pt.hop, fin: JSON.parse(JSON.stringify(evtsFin(Pt, M, ctx))), P: Pt, M };
});
console.log("Bilan du jeu de test");
const ref = fs.readFileSync(path.join(ICI, "..", REEL ? "bilan_ref.txt" : "bilan_ref_fictif.txt"), "utf8").trim();
const txt = B.texteTotaux(B.calculerBilan(res, ver, pai, { per: "annee", hop: "tous" }, T0).tot);
cas("bilan 2026 identique à la référence (" + txt.slice(0, 10) + ")", txt === ref);
if (txt !== ref) console.log("    obtenu : " + txt + "\n    attendu : " + ref);
export { res, ctx, pai, ver, B, cas, T0 };
const fin = () => { console.log("\n" + ok + " réussis, " + ko + " échoués"); if (ko) process.exit(1); };
if (process.argv[2] !== "--seul") { const suite = path.join(ICI, "test-bilan-suite.mjs"); if (fs.existsSync(suite)) { const m = await import("file://" + suite); await m.lancer({ res, ctx, pai, ver, B, cas, T0, evtsFin, fusionner }); } }
fin();
