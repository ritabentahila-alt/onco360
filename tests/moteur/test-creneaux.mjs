// R-A3 (18/10/2026) : ce qui occupe un médecin un jour donné, sans navigateur : node tests/moteur/test-creneaux.mjs
import { occupations, chevauche, texteConflit } from "../../public/js/moteur/creneaux.js";
let ok = 0, ko = 0;
const cas = (nom, v) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom); } };
const D = "2026-10-20", TIT = "UT", AUTRE = "UB";
const pats = [
  { id: "p1", nm: "PATIENT UN", etab: "A", rdvs: [{ id: "r1", type: "Suivi", d: D, h: "09:00", du: 30 }, { id: "r2", type: "Contrôle", d: D, h: "", st: "prevu" }, { id: "r3", type: "Suivi", d: D, h: "10:00", st: "absent" }, { id: "r4", type: "Hospitalisation", d: D, f: "2026-10-22" }],
    ag: [{ k: "p1|r|r1", d: D, h: "09:00" }, { k: "p1|c|0|3", d: D, h: "11:00", dur: 15 }, { k: "p1|s|0|2|8", d: "2026-10-21", h: "11:00" }] },
  { id: "p2", nm: "PATIENT DEUX", etab: "A", rdvs: [{ id: "q1", type: "Fin de radiothérapie", d: D, h: "", rtfin: "x" }, { id: "q2", type: "En cours de RT", d: D, h: "14:00", med: AUTRE }],
    ag: [{ k: "p2|s|1|4|8", d: D }, { k: "p2|rt|x|scan", d: D, h: "15:00", dur: 20 }, { k: "p2|rt|x|deb", d: D }] },
];
const o = (x) => Object.assign({ titulaire: TIT, multi: false, dureeDe: (r) => +r.du || 30 }, x || {});
let r = occupations(pats, D, o());
cas("avec heure : consultation, consultation de chimio (heure choisie ou placée d'après la séance), étape de RT avec heure, consultation de RT", r.avec.map((z) => z.k).join(",") === "p1|r|r1,p1|c|0|3,p2|r|q2,p2|rt|x|scan");
cas("consultation de chimio : 15 min ; étape de RT : sa durée", r.avec.find((z) => z.quoi === "chimio").du === 15 && r.avec.find((z) => z.quoi === "rt").du === 20);
cas("sans heure : rendez-vous et consultations de chimio du jour (pas les étapes de RT sans heure)", r.sans.map((z) => z.k).join(",") === "p1|r|r2,p2|r|q1,p2|s|1|4|8");
cas("libellés : « C3 J1 (consultation de chimio) », « C4 J8 … », « Scanner de centrage », « Consultation de fin de radiothérapie »", r.avec.find((z) => z.quoi === "chimio").lib === "C3 J1 (consultation de chimio)" && r.sans.find((z) => z.quoi === "chimio").lib === "C4 J8 (consultation de chimio)" && r.avec.find((z) => z.quoi === "rt").lib === "Scanner de centrage" && r.sans.find((z) => z.k === "p2|r|q1").lib === "Consultation de fin de radiothérapie");
cas("absent et hospitalisation : ne comptent pas ; autre jour : non plus", !r.avec.concat(r.sans).some((z) => ["p1|r|r3", "p1|r|r4", "p1|s|0|2|8"].indexOf(z.k) >= 0));
cas("le rendez-vous lui-même n'est pas compté (Modifier)", !occupations(pats, D, o({ sauf: { pid: "p1", rid: "r1" } })).avec.some((z) => z.k === "p1|r|r1"));
cas("la consultation de chimio elle-même n'est pas comptée (heure de la séance)", !occupations(pats, D, o({ sauf: { pid: "p1", k: "p1|c|0|3" } })).avec.some((z) => z.k === "p1|c|0|3"));
r = occupations(pats, D, o({ multi: true, med: TIT }));
cas("deux médecins : seulement ceux du médecin (sans médecin noté = titulaire)", r.avec.map((z) => z.k).join(",") === "p1|r|r1,p1|c|0|3,p2|rt|x|scan");
cas("deux médecins : l'autre médecin ne voit que son rendez-vous", occupations(pats, D, o({ multi: true, med: AUTRE })).avec.map((z) => z.k).join(",") === "p2|r|q2");
const A = occupations(pats, D, o()).avec;
cas("chevauchement : 11:10 pendant 30 min touche la consultation de chimio de 11:00", chevauche(A, "11:10", 30).map((z) => z.k).join(",") === "p1|c|0|3");
cas("pas de chevauchement juste après (11:15) ni juste avant (10:30-11:00)", !chevauche(A, "11:15", 30).length && !chevauche(A, "10:30", 30).length);
cas("texte de l'avertissement", texteConflit(chevauche(A, "11:10", 30)) === "11:00 PATIENT UN – C3 J1 (consultation de chimio)");
console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
