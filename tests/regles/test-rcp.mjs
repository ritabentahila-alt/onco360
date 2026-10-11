// Tests des règles de sécurité des inscriptions en RCP (espaces/{e}/rcp, 09/10/2026) sur l'émulateur Firestore. Lancé par « npm test ».
// Comptes : MED (médecin, tous établissements), SEC (secrétaire HGC), SEC2 (autre secrétaire HGC), INF (infirmière HGC, sans
// droit d'écrire les consultations), SECK (secrétaire HCK), OFF (désactivé).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, serverTimestamp, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const P = "espaces/cabinet-test";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, etabs, ecrire, actif = true) => ({ role, actif, nom: role, tousEtablissements: etabs === "*", etablissements: etabs === "*" ? [] : etabs, droits: { ecrireConsultations: ecrire } });
const insc = (par, o = {}) => Object.assign({ patientId: "p1", patientNom: "PATIENTE Test", etablissementId: "HGC", d: "2026-10-13", q: "Radiothérapie adjuvante ?", ins: "2026-10-09", fait: false, o: 1, creePar: par, creeParNom: par, majPar: par, maj: serverTimestamp() }, o);

async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    for (const [u, r, e, w, a] of [["MED", "medecin", "*", true], ["SEC", "assistante", ["HGC"], true], ["SEC2", "assistante", ["HGC"], true], ["INF", "infirmiere", ["HGC"], false], ["SECK", "assistante", ["HCK"], true], ["OFF", "assistante", "*", true, false]])
      await setDoc(doc(db, P + "/membres/" + u), membre(r, e, w, a !== false));
    await setDoc(doc(db, P + "/rcp/a"), insc("SEC"));
    await setDoc(doc(db, P + "/rcp/b"), insc("MED"));
    await setDoc(doc(db, P + "/rcp/k"), insc("SECK", { patientId: "p2", etablissementId: "HCK" }));
  });
}
const db = (u) => env.authenticatedContext(u).firestore();
const R = (u, i) => doc(db(u), P + "/rcp/" + i);
const col = (u) => collection(db(u), P + "/rcp");
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }

console.log("Lecture");
await cas("le médecin lit toutes les inscriptions", () => assertSucceeds(getDocs(col("MED"))));
await cas("la secrétaire HGC liste celles de son centre", () => assertSucceeds(getDocs(query(col("SEC"), where("etablissementId", "in", ["HGC"])))));
await cas("refusé : la secrétaire HGC liste sans filtre d'établissement", () => assertFails(getDocs(col("SEC"))));
await cas("refusé : la secrétaire HGC lit une inscription HCK", () => assertFails(getDoc(R("SEC", "k"))));
await cas("l'infirmière lit une inscription de son centre", () => assertSucceeds(getDoc(R("INF", "a"))));
await cas("refusé : accès désactivé", () => assertFails(getDoc(R("OFF", "a"))));

console.log("Inscrire");
await cas("la secrétaire inscrit un patient de son centre", () => assertSucceeds(setDoc(R("SEC", "n"), insc("SEC"))));
await cas("le médecin inscrit un patient HCK", () => assertSucceeds(setDoc(R("MED", "n"), insc("MED", { etablissementId: "HCK" }))));
await cas("refusé : l'infirmière inscrit (pas le droit d'écrire les consultations)", () => assertFails(setDoc(R("INF", "n"), insc("INF"))));
await cas("refusé : la secrétaire HGC inscrit un patient HCK", () => assertFails(setDoc(R("SEC", "n"), insc("SEC", { etablissementId: "HCK" }))));
await cas("refusé : inscription signée par un autre", () => assertFails(setDoc(R("SEC", "n"), insc("MED"))));
await cas("refusé : sans date de RCP", () => assertFails(setDoc(R("SEC", "n"), insc("SEC", { d: null }))));

console.log("Modifier, cocher « Fait », décision");
await cas("la secrétaire coche « Fait »", () => assertSucceeds(updateDoc(R("SEC", "b"), { fait: true, faitLe: "2026-10-13", faitPar: "SEC", majPar: "SEC" })));
await cas("le médecin relie la décision (consultation RCP)", () => assertSucceeds(updateDoc(R("MED", "a"), { decision: "c1", decisionTxt: "RT adjuvante", majPar: "MED" })));
await cas("la secrétaire change la date de RCP", () => assertSucceeds(updateDoc(R("SEC", "a"), { d: "2026-10-20", majPar: "SEC" })));
await cas("refusé : l'infirmière coche « Fait »", () => assertFails(updateDoc(R("INF", "a"), { fait: true, majPar: "INF" })));
await cas("refusé : modification signée par un autre", () => assertFails(updateDoc(R("SEC", "a"), { fait: true, majPar: "MED" })));
await cas("refusé : changer l'auteur", () => assertFails(updateDoc(R("SEC", "b"), { creePar: "SEC", majPar: "SEC" })));
await cas("refusé : changer de patient", () => assertFails(updateDoc(R("SEC", "a"), { patientId: "p9", majPar: "SEC" })));
await cas("refusé : la secrétaire HGC passe l'inscription à HCK", () => assertFails(updateDoc(R("SEC", "a"), { etablissementId: "HCK", majPar: "SEC" })));
await cas("refusé : la secrétaire HGC modifie une inscription HCK", () => assertFails(updateDoc(R("SEC", "k"), { fait: true, majPar: "SEC" })));

console.log("Désinscrire");
await cas("la secrétaire retire une inscription qu'elle a faite", () => assertSucceeds(deleteDoc(R("SEC", "a"))));
await cas("le médecin retire n'importe quelle inscription", () => assertSucceeds(deleteDoc(R("MED", "k"))));
await cas("refusé : une autre secrétaire retire l'inscription de sa collègue", () => assertFails(deleteDoc(R("SEC2", "a"))));
await cas("refusé : la secrétaire retire une inscription du médecin", () => assertFails(deleteDoc(R("SEC", "b"))));
await cas("refusé : l'infirmière retire une inscription", () => assertFails(deleteDoc(R("INF", "a"))));

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
await env.cleanup();
process.exit(ko ? 1 : 0);
