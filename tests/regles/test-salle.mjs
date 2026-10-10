// Tests des règles de sécurité de la salle d'attente (espaces/{e}/salle) sur l'émulateur Firestore.
// Lancer (Java 21 nécessaire) :  cd tests/regles && npm test
// Comptes : MED (médecin, tous établissements), SEC (secrétaire HGC), INF (infirmière HGC), SECK (secrétaire HCK), OFF (désactivé).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where, serverTimestamp, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const E = "cabinet-test", P = "espaces/" + E, J = "2026-10-08";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, etabs, rdv, actif = true) => ({ role, actif, nom: role, tousEtablissements: etabs === "*", etablissements: etabs === "*" ? [] : etabs, droits: { rendezvous: rdv, encaissements: rdv } });
const id = (pid, cle) => J + "_" + pid + "_" + cle;
const ligne = (par, o = {}) => Object.assign({ jour: J, patientId: "p1", etablissementId: "HGC", cle: "r-a", etat: "salle", arr: 1, majPar: par, maj: serverTimestamp() }, o);

async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    for (const [u, r, e, rdv, a] of [["MED", "medecin", "*", true], ["SEC", "assistante", ["HGC"], true], ["INF", "infirmiere", ["HGC"], false], ["SECK", "assistante", ["HCK"], true], ["OFF", "assistante", "*", true, false]])
      await setDoc(doc(db, P + "/membres/" + u), membre(r, e, rdv, a !== false));
    await setDoc(doc(db, P + "/salle/" + id("p1", "r-a")), ligne("SEC"));
    await setDoc(doc(db, P + "/salle/" + id("p1", "r-c")), ligne("MED", { cle: "r-c", etat: "consult" }));
    await setDoc(doc(db, P + "/salle/" + id("p2", "r-b")), ligne("SECK", { patientId: "p2", etablissementId: "HCK", cle: "r-b" }));
  });
}
const db = (u) => env.authenticatedContext(u).firestore();
const S = (u, i) => doc(db(u), P + "/salle/" + i);
const col = (u) => collection(db(u), P + "/salle");

let ok = 0, ko = 0;
async function cas(nom, f) {
  await preparer();
  try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); }
}

console.log("Lecture");
await cas("le médecin lit toute la salle du jour", () => assertSucceeds(getDocs(query(col("MED"), where("jour", "==", J)))));
await cas("la secrétaire HGC liste la salle de son centre", () => assertSucceeds(getDocs(query(col("SEC"), where("jour", "==", J), where("etablissementId", "in", ["HGC"])))));
await cas("refusé : la secrétaire HGC liste sans filtre d'établissement", () => assertFails(getDocs(query(col("SEC"), where("jour", "==", J)))));
await cas("refusé : la secrétaire HGC lit une ligne HCK", () => assertFails(getDoc(S("SEC", id("p2", "r-b")))));
await cas("l'infirmière lit une ligne de son centre", () => assertSucceeds(getDoc(S("INF", id("p1", "r-a")))));
await cas("refusé : accès désactivé", () => assertFails(getDoc(S("OFF", id("p1", "r-a")))));

console.log("Mettre en salle");
await cas("la secrétaire met en salle", () => assertSucceeds(setDoc(S("SEC", id("p1", "r-n")), ligne("SEC", { cle: "r-n" }))));
await cas("l'infirmière met en salle", () => assertSucceeds(setDoc(S("INF", id("p1", "r-n")), ligne("INF", { cle: "r-n" }))));
await cas("l'infirmière annule une arrivée (état vide)", () => assertSucceeds(setDoc(S("INF", id("p1", "r-a")), ligne("INF", { etat: "" }))));
await cas("refusé : identifiant qui ne correspond pas (autre jour)", () => assertFails(setDoc(S("SEC", "2026-10-09_p1_r-n"), ligne("SEC", { cle: "r-n" }))));
await cas("refusé : signé par un autre", () => assertFails(setDoc(S("SEC", id("p1", "r-n")), ligne("MED", { cle: "r-n" }))));
await cas("refusé : la secrétaire HGC écrit pour HCK", () => assertFails(setDoc(S("SEC", id("p2", "r-n")), ligne("SEC", { patientId: "p2", etablissementId: "HCK", cle: "r-n" }))));
await cas("refusé : état inconnu", () => assertFails(setDoc(S("SEC", id("p1", "r-n")), ligne("SEC", { cle: "r-n", etat: "parti" }))));

console.log("Consultation, validation");
await cas("la secrétaire démarre la consultation", () => assertSucceeds(setDoc(S("SEC", id("p1", "r-a")), ligne("SEC", { etat: "consult", deb: 2 }))));
await cas("le médecin valide (vu)", () => assertSucceeds(setDoc(S("MED", id("p1", "r-c")), ligne("MED", { cle: "r-c", etat: "vu", fin: 3 }))));
await cas("refusé : l'infirmière démarre la consultation", () => assertFails(setDoc(S("INF", id("p1", "r-a")), ligne("INF", { etat: "consult" }))));
await cas("refusé : l'infirmière renvoie en salle un patient en consultation", () => assertFails(setDoc(S("INF", id("p1", "r-c")), ligne("INF", { cle: "r-c", etat: "salle" }))));
await cas("refusé : l'infirmière marque absent", () => assertFails(setDoc(S("INF", id("p1", "r-n")), ligne("INF", { cle: "r-n", etat: "absent" }))));
await cas("refusé : changer de patient", () => assertFails(setDoc(S("SEC", id("p1", "r-a")), ligne("SEC", { patientId: "p9" }))));

console.log("Commentaire");
await cas("l'infirmière commente une ligne en consultation", () => assertSucceeds(setDoc(S("INF", id("p1", "r-c")), ligne("MED", { cle: "r-c", etat: "consult", com: "À jeun", comPar: "INF", majPar: "INF" }))));
await cas("refusé : l'infirmière commente ET change l'étape d'une ligne en consultation", () => assertFails(setDoc(S("INF", id("p1", "r-c")), ligne("INF", { cle: "r-c", etat: "salle", com: "x" }))));
await cas("refusé : la secrétaire HGC commente une ligne HCK", () => assertFails(setDoc(S("SEC", id("p2", "r-b")), ligne("SECK", { patientId: "p2", etablissementId: "HCK", cle: "r-b", com: "x", majPar: "SEC" }))));

await cas("la secrétaire commente une consultation vue d'un jour passé (ligne sans document, étape vide)", () => assertSucceeds(setDoc(S("SEC", "2026-10-01_p1_r-v"), ligne("SEC", { jour: "2026-10-01", cle: "r-v", etat: "", com: "Payé en espèces", comPar: "SEC" }))));
await cas("refusé : document sans étape", () => assertFails(setDoc(S("SEC", "2026-10-01_p1_r-w"), (({ etat, ...r }) => r)(ligne("SEC", { jour: "2026-10-01", cle: "r-w", com: "x" })))));

console.log("Prix payé d'avance");
await cas("la secrétaire note un prix payé d'avance", () => assertSucceeds(setDoc(S("SEC", id("p1", "r-a")), ligne("SEC", { prix: 200, prixPar: "SEC" }))));
await cas("refusé : l'infirmière note un prix", () => assertFails(setDoc(S("INF", id("p1", "r-a")), ligne("INF", { prix: 0, prixPar: "INF" }))));
await cas("refusé : l'infirmière crée une ligne avec un prix", () => assertFails(setDoc(S("INF", id("p1", "r-n")), ligne("INF", { cle: "r-n", prix: 0 }))));

console.log("N° d'ordre (compteur)");
const O = (u, i) => doc(db(u), P + "/salleOrdre/" + i);
await cas("la secrétaire crée le compteur du jour de son centre", () => assertSucceeds(setDoc(O("SEC", J + "_HGC"), { jour: J, etablissementId: "HGC", n: 1, majPar: "SEC" })));
await cas("le compteur monte", async () => { await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), P + "/salleOrdre/" + J + "_HGC"), { jour: J, etablissementId: "HGC", n: 4, majPar: "MED" })); await assertSucceeds(setDoc(O("INF", J + "_HGC"), { jour: J, etablissementId: "HGC", n: 5, majPar: "INF" })); });
await cas("refusé : le compteur redescend", async () => { await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), P + "/salleOrdre/" + J + "_HGC"), { jour: J, etablissementId: "HGC", n: 4, majPar: "MED" })); await assertFails(setDoc(O("SEC", J + "_HGC"), { jour: J, etablissementId: "HGC", n: 4, majPar: "SEC" })); });
await cas("refusé : compteur d'un autre centre", () => assertFails(setDoc(O("SEC", J + "_HCK"), { jour: J, etablissementId: "HCK", n: 1, majPar: "SEC" })));
await cas("lecture d'une ligne pas encore créée (transaction)", () => assertSucceeds(getDoc(S("SEC", id("p1", "r-pasencore")))));
await cas("refusé : lire une ligne existante d'un autre centre", () => assertFails(getDoc(S("SEC", id("p2", "r-b")))));

console.log("Dossier ouvert par");
await cas("la secrétaire signale le dossier qu'elle a ouvert", () => assertSucceeds(setDoc(doc(db("SEC"), P + "/presence/SEC"), { patientId: "p1", nom: "Sara", le: serverTimestamp() })));
await cas("le médecin voit qui a ouvert quel dossier", () => assertSucceeds(getDocs(collection(db("MED"), P + "/presence"))));
await cas("refusé : écrire la présence d'un autre", () => assertFails(setDoc(doc(db("SEC"), P + "/presence/MED"), { patientId: "p1", nom: "x" })));
await cas("refusé : accès désactivé", () => assertFails(getDocs(collection(db("OFF"), P + "/presence"))));

console.log("Suppression");
await cas("l'infirmière supprime une ligne en salle", () => assertSucceeds(deleteDoc(S("INF", id("p1", "r-a")))));
await cas("refusé : l'infirmière supprime une ligne en consultation", () => assertFails(deleteDoc(S("INF", id("p1", "r-c")))));
await cas("le médecin supprime une ligne en consultation", () => assertSucceeds(deleteDoc(S("MED", id("p1", "r-c")))));

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
await env.cleanup();
process.exit(ko ? 1 : 0);
