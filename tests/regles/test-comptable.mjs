// Tests des règles du rôle Comptable (étape 9 S2, 09/10/2026) sur l'émulateur Firestore. Lancé par « npm test ».
// COMP (comptable, droit finances), MED (médecin), SEC (secrétaire sans finances).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, collection, query, where, setLogLevel } from "firebase/firestore";
setLogLevel("silent");
const P = "espaces/cab-c";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const mb = (role, droits) => ({ role, actif: true, nom: role, tousEtablissements: true, etablissements: [], droits });
async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    await setDoc(doc(db, P + "/membres/COMP"), mb("comptable", { finances: true, encaissements: true }));
    await setDoc(doc(db, P + "/membres/MED"), mb("medecin", { finances: true, parametres: true, identite: true }));
    await setDoc(doc(db, P + "/membres/SEC"), mb("assistante", { encaissements: true, rendezvous: true }));
    await setDoc(doc(db, P + "/patients/p1"), { identite: { nom: "A" }, etablissementId: "HGC", version: 1 });
    await setDoc(doc(db, P + "/consultations/c1"), { patientId: "p1", etablissementId: "HGC" });
    await setDoc(doc(db, P + "/salle/s1"), { patientId: "p1", etablissementId: "HGC" });
    await setDoc(doc(db, P + "/patientsFinances/p1"), { montantsJson: "{}" });
    await setDoc(doc(db, P + "/encaissements/p1"), { etablissementId: "HGC" });
    await setDoc(doc(db, P + "/comptabilite/meta"), { n: 1 });
    await setDoc(doc(db, P + "/finances/tarifs"), { data: "{}" });
    await setDoc(doc(db, P + "/finances/reglements"), { data: "[]" });
    await setDoc(doc(db, P + "/presence/MED"), { patientId: "p1" });
    await setDoc(doc(db, P + "/historique/h1"), { parUid: "MED", txt: "Cure validée" });
  });
}
const db = (u) => env.authenticatedContext(u).firestore();
const D = (u, c) => doc(db(u), P + "/" + c);
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }
console.log("Volet financier");
await cas("le comptable lit le relevé, les tarifs, les paiements", async () => { await assertSucceeds(getDoc(D("COMP", "comptabilite/meta"))); await assertSucceeds(getDoc(D("COMP", "finances/tarifs"))); await assertSucceeds(getDoc(D("COMP", "finances/paiements"))); });
await cas("le comptable pointe un paiement et saisit un versement", async () => { await assertSucceeds(setDoc(D("COMP", "finances/paiements"), { data: "{}" })); await assertSucceeds(setDoc(D("COMP", "finances/versements"), { data: "[]" })); });
await cas("refusé : le comptable modifie les tarifs", () => assertFails(setDoc(D("COMP", "finances/tarifs"), { data: "{}" })));
await cas("refusé : le comptable écrit le relevé, les montants, les encaissements", async () => { await assertFails(setDoc(D("COMP", "comptabilite/meta"), { n: 2 })); await assertFails(setDoc(D("COMP", "patientsFinances/p1"), { montantsJson: "{}" })); await assertFails(setDoc(D("COMP", "encaissements/p1"), { etablissementId: "HGC" })); });
console.log("Règlements reçus des cliniques (étape 15)");
await cas("le comptable lit les règlements reçus", () => assertSucceeds(getDoc(D("COMP", "finances/reglements"))));
await cas("refusé : le comptable saisit un règlement reçu", () => assertFails(setDoc(D("COMP", "finances/reglements"), { data: '[{"id":"x","m":1000}]' })));
await cas("le médecin saisit un règlement reçu", () => assertSucceeds(setDoc(D("MED", "finances/reglements"), { data: '[{"id":"x","m":1000}]' })));
await cas("refusé : la secrétaire (sans « finances ») lit ou saisit un règlement", async () => { await assertFails(getDoc(D("SEC", "finances/reglements"))); await assertFails(setDoc(D("SEC", "finances/reglements"), { data: "[]" })); });
await cas("le médecin prépare le relevé", () => assertSucceeds(setDoc(D("MED", "comptabilite/meta"), { n: 2 })));
await cas("refusé : la secrétaire (sans « finances ») lit le relevé", () => assertFails(getDoc(D("SEC", "comptabilite/meta"))));
console.log("Aucune donnée médicale");
await cas("refusé : le comptable lit un dossier patient", () => assertFails(getDoc(D("COMP", "patients/p1"))));
await cas("refusé : le comptable liste les patients", () => assertFails(getDocs(collection(db("COMP"), P + "/patients"))));
await cas("refusé : le comptable crée un patient", () => assertFails(setDoc(D("COMP", "patients/p2"), { identite: {}, etablissementId: "HGC", version: 1 })));
await cas("refusé : le comptable lit une consultation, la salle d'attente", async () => { await assertFails(getDoc(D("COMP", "consultations/c1"))); await assertFails(getDoc(D("COMP", "salle/s1"))); });
await cas("refusé : le comptable voit qui a ouvert quel dossier", () => assertFails(getDocs(collection(db("COMP"), P + "/presence"))));
await cas("refusé : le comptable lit l'historique de l'équipe", () => assertFails(getDoc(D("COMP", "historique/h1"))));
await cas("refusé : le comptable lit les encaissements par patient", () => assertFails(getDoc(D("COMP", "encaissements/p1"))));
console.log("Les autres rôles inchangés");
await cas("le médecin lit les dossiers, l'historique et écrit les tarifs", async () => { await assertSucceeds(getDoc(D("MED", "patients/p1"))); await assertSucceeds(getDoc(D("MED", "historique/h1"))); await assertSucceeds(setDoc(D("MED", "finances/tarifs"), { data: "{}" })); });
await cas("la secrétaire lit un dossier et la présence", async () => { await assertSucceeds(getDoc(D("SEC", "patients/p1"))); await assertSucceeds(getDocs(collection(db("SEC"), P + "/presence"))); });
console.log("\n" + ok + " réussis, " + ko + " échoués");
await env.cleanup();
if (ko) process.exit(1);
