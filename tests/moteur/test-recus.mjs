// Numéro des reçus (SA9c, 11/10/2026) sans navigateur : node tests/moteur/test-recus.mjs
import { numeroRecu, cleRecuRdv, cleRecuCons, idRecu, decisionRecu, recuAEcrire } from "../../public/js/moteur/recus.js";
let ok = 0, ko = 0;
const cas = (nom, v) => { if (v) { ok++; console.log("  ✔ " + nom); } else { ko++; console.log("  ✘ " + nom); } };
const o = { pid: "p1", nom: "Patient Un", etab: "HGC", cle: "r-a", d: "2026-10-08", lib: "Consultation", m: 300, mode: "esp", annee: "2026", par: "SEC", parNom: "Secrétaire", le: 5 };

console.log("Numéro");
cas("format R-AAAA-NNNN", numeroRecu("2026", 1) === "R-2026-0001" && numeroRecu("2026", 42) === "R-2026-0042" && numeroRecu("2027", 9999) === "R-2027-9999");
cas("au-delà de 9 999 : numéro complet", numeroRecu("2026", 12345) === "R-2026-12345");
cas("identifiants : rendez-vous, consultation de chimio", cleRecuRdv("rdv1") === "r-rdv1" && cleRecuCons("L1", 2, 8) === "c-L1-2-8" && idRecu("p1", "r-a") === "p1_r-a");

console.log("Premier reçu, duplicata, nouveau numéro");
const r1 = recuAEcrire(null, o, 1);
cas("premier reçu : n° 1, une impression, aucun numéro annulé", r1.numero === "R-2026-0001" && r1.n === 1 && r1.imp === 1 && r1.annules.length === 0 && r1.patientId === "p1" && r1.etablissementId === "HGC");
cas("même montant et même mode : duplicata", decisionRecu(r1, 300, "esp") === "duplicata");
const d2 = recuAEcrire(r1, Object.assign({}, o, { par: "MED", parNom: "Médecin", le: 9 }));
cas("duplicata : seules les impressions changent (numéro gardé)", d2.imp === 2 && d2.dernierPar === "MED" && !("numero" in d2) && !("n" in d2) && Object.keys(d2).sort().join() === "dernier,dernierNom,dernierPar,imp");
cas("montant changé : nouveau numéro", decisionRecu(r1, 250, "esp") === "nouveau");
cas("mode changé : nouveau numéro", decisionRecu(r1, 300, "carte") === "nouveau");
cas("montant écrit en texte ou en nombre : même montant", decisionRecu(r1, "300", "esp") === "duplicata");
const r3 = recuAEcrire(r1, Object.assign({}, o, { m: 250 }), 7);
cas("nouveau numéro : l'ancien passe dans « annulés »", r3.numero === "R-2026-0007" && r3.imp === 1 && r3.annules.length === 1 && r3.annules[0].numero === "R-2026-0001" && r3.annules[0].m === 300);
const r4 = recuAEcrire(r3, Object.assign({}, o, { m: 200 }), 8);
cas("deux changements : les deux numéros annulés sont gardés", r4.annules.map((a) => a.numero).join() === "R-2026-0001,R-2026-0007");

console.log("\n" + ok + " réussis, " + ko + " échoués");
process.exit(ko ? 1 : 0);
