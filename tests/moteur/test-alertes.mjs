// R-B2 (19/10/2026) : alertes cliniques vues, sans navigateur : node tests/moteur/test-alertes.mjs
import { cleAlerte, vuesNettoyees, partagerAlertes } from "../../public/js/moteur/alertes.js";
let ok = 0, ko = 0;
const cas = (nom, v, d) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom + (d === undefined ? "" : "  " + JSON.stringify(d))); } };
const a = { pid: "p1", lid: "L1", n: 3, type: "poids", v: 60 };
cas("même alerte : même clé", cleAlerte(a) === cleAlerte(Object.assign({}, a)));
cas("nouvelle valeur, nouvelle cure, autre type, autre patient : autre clé", new Set([a, Object.assign({}, a, { v: 59 }), Object.assign({}, a, { n: 4 }), Object.assign({}, a, { type: "bio" }), Object.assign({}, a, { pid: "p2" })].map(cleAlerte)).size === 5);
cas("clé utilisable comme nom de champ (lettres et chiffres)", /^a[a-z0-9]+$/.test(cleAlerte(a)), cleAlerte(a));
const v = vuesNettoyees({ [cleAlerte(a)]: "2026-10-19", avieille: "2026-07-01", aok: "2026-07-21", "x.y": "2026-10-19", abad: 3 }, "2026-10-19");
cas("vues de plus de 90 jours effacées, entrées illisibles ignorées", Object.keys(v).sort().join() === [cleAlerte(a), "aok"].sort().join(), v);
const L = [{ cle: "a1" }, { cle: "a2" }], p = partagerAlertes(L, { a2: "2026-10-19" });
cas("alertes à voir / déjà vues", p.aVoir.length === 1 && p.aVoir[0].cle === "a1" && p.vues.length === 1);
cas("rien de vu : tout à voir", partagerAlertes(L, null).aVoir.length === 2);
console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
