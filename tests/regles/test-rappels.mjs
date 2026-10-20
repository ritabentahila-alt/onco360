// Tests des règles des rappels WhatsApp envoyés (espaces/{e}/rappels/{patient}, R-C4 du 19/10/2026, audit 4 C7) sur l'émulateur Firestore.
// Lancer (Java 21 nécessaire) :  cd tests/regles && npm test
// Comptes : MED (médecin, tous établissements), SEC (secrétaire HGC, rendez-vous), INF (infirmière HGC, sans rendez-vous), SECK (secrétaire HCK),
// OFF (désactivée), CPT (comptable).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where, serverTimestamp, deleteField, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const E = "cabinet-test", P = "espaces/" + E;
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, etabs, rdv, actif = true) => ({ role, actif, nom: role, tousEtablissements: etabs === "*", etablissements: etabs === "*" ? [] : etabs, droits: { rendezvous: rdv } });
const envoi = (par) => ({ le: "2026-10-19T09:00:00.000Z", par, nom: par });
const rappel = (par, o = {}) => Object.assign({ patientId: "p1", etablissementId: "HGC", l: { "2026-10-20|suivi": envoi(par) }, majPar: par, maj: serverTimestamp() }, o);

async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    for (const [u, r, e, rdv, a] of [["MED", "medecin", "*", true], ["SEC", "assistante", ["HGC"], true], ["INF", "infirmiere", ["HGC"], false], ["SECK", "assistante", ["HCK"], true], ["OFF", "assistante", "*", true, false], ["CPT", "comptable", "*", false]])
      await setDoc(doc(db, P + "/membres/" + u), membre(r, e, rdv, a !== false));
    await setDoc(doc(db, P + "/rappels/p1"), rappel("SEC"));
    await setDoc(doc(db, P + "/rappels/p2"), rappel("SECK", { patientId: "p2", etablissementId: "HCK" }));
  });
}
const db = (u) => env.authenticatedContext(u).firestore();
const R = (u, p) => doc(db(u), P + "/rappels/" + p);
const col = (u) => collection(db(u), P + "/rappels");

let ok = 0, ko = 0;
async function cas(nom, f) {
  await preparer();
  try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); }
}

console.log("Lecture");
await cas("le médecin lit tous les rappels", () => assertSucceeds(getDocs(col("MED"))));
await cas("la secrétaire HGC liste les rappels de son centre", () => assertSucceeds(getDocs(query(col("SEC"), where("etablissementId", "in", ["HGC"])))));
await cas("refusé : la secrétaire HGC liste sans filtre d'établissement", () => assertFails(getDocs(col("SEC"))));
await cas("refusé : la secrétaire HGC lit un rappel de HCK", () => assertFails(getDoc(R("SEC", "p2"))));
await cas("l'infirmière HGC lit (bouton vert « déjà envoyé »)", () => assertSucceeds(getDoc(R("INF", "p1"))));
await cas("refusé : le comptable", () => assertFails(getDoc(R("CPT", "p1"))));
await cas("refusé : un membre désactivé", () => assertFails(getDoc(R("OFF", "p1"))));
console.log("Écriture");
await cas("la secrétaire note un rappel (fusion)", () => assertSucceeds(setDoc(R("SEC", "p1"), { patientId: "p1", etablissementId: "HGC", l: { "2026-10-21|chimio": envoi("SEC") }, majPar: "SEC", maj: serverTimestamp() }, { merge: true })));
await cas("la secrétaire retire au passage un rappel de plus de 7 jours", () => assertSucceeds(setDoc(R("SEC", "p1"), { patientId: "p1", etablissementId: "HGC", l: { "2026-10-20|suivi": deleteField(), "2026-10-22|rt": envoi("SEC") }, majPar: "SEC", maj: serverTimestamp() }, { merge: true })));
await cas("le médecin crée le document d'un nouveau patient", () => assertSucceeds(setDoc(R("MED", "p3"), rappel("MED", { patientId: "p3", etablissementId: "HCK" }))));
await cas("refusé : signé au nom d'un autre", () => assertFails(setDoc(R("SEC", "p1"), rappel("MED"))));
await cas("refusé : identifiant du document ≠ patient", () => assertFails(setDoc(R("SEC", "p9"), rappel("SEC"))));
await cas("refusé : l'infirmière (sans droit « rendez-vous »)", () => assertFails(setDoc(R("INF", "p1"), rappel("INF"))));
await cas("refusé : la secrétaire HCK écrit un rappel de HGC", () => assertFails(setDoc(R("SECK", "p1"), rappel("SECK"))));
await cas("refusé : déplacer un rappel de HCK vers HGC (hors périmètre d'origine)", () => assertFails(setDoc(R("SEC", "p2"), rappel("SEC", { patientId: "p2" }))));
await cas("refusé : `l` qui n'est pas une liste de rappels", () => assertFails(setDoc(R("SEC", "p1"), rappel("SEC", { l: "x" }))));
await cas("dossier supprimé : la secrétaire retire ses rappels", () => assertSucceeds(deleteDoc(R("SEC", "p1"))));
await cas("refusé : l'infirmière supprime des rappels", () => assertFails(deleteDoc(R("INF", "p1"))));

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
await env.cleanup();
process.exit(ko ? 1 : 0);
