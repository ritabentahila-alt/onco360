// Tests des règles : changement d'hôpital d'un dossier et historique des hôpitaux (étape 15 bis B1, 10/10/2026). Lancé par « npm test ».
// MED (médecin, tous les établissements), SEC (secrétaire limitée à HGC, droit identité).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, updateDoc, setDoc, getDoc, getDocs, collection, query, where, runTransaction, serverTimestamp, setLogLevel } from "firebase/firestore";
setLogLevel("silent");
const P = "espaces/cab-b";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
// Grille complète (comme dans Onco360 : chaque droit est présent dans la fiche du membre)
const GRILLE = { identite: false, fichePatient: false, rendezvous: false, planningChimio: false, traitements: "voir", radiotherapie: "voir", finances: false, creerPatient: false, supprimerPatient: false };
const mb = (role, tous, droits) => ({ role, actif: true, nom: role, tousEtablissements: tous, etablissements: tous ? [] : ["HGC"], droits: Object.assign({}, GRILLE, droits) });
async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    await setDoc(doc(db, P + "/membres/MED"), mb("medecin", true, { identite: true, finances: true, rendezvous: true }));
    await setDoc(doc(db, P + "/membres/SEC"), mb("assistante", false, { identite: true, rendezvous: true }));
    await setDoc(doc(db, P + "/patients/p1"), { identite: { nom: "A" }, etablissementId: "HGC", version: 1 });
    // R-D3 (C8) : montants de deux patients, un par établissement ; médecin limité à HGC avec le droit « finances » ; comptable
    await setDoc(doc(db, P + "/membres/MEDH"), mb("medecin", false, { finances: true }));
    await setDoc(doc(db, P + "/membres/CPT"), Object.assign(mb("comptable", true, { finances: true }), { role: "comptable" }));
    await setDoc(doc(db, P + "/patientsFinances/p1"), { etablissementId: "HGC", montantsJson: "{}" });
    await setDoc(doc(db, P + "/patientsFinances/p2"), { etablissementId: "HCK", montantsJson: "{}" });
    await setDoc(doc(db, P + "/finances/paiements"), { data: "{}" });
  });
}
const D = (u, c) => doc(env.authenticatedContext(u).firestore(), P + "/" + c);
const maj = (u, champs) => updateDoc(D(u, "patients/p1"), Object.assign({ version: 2, maj: serverTimestamp(), majPar: u }, champs));
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }
console.log("Changement d'hôpital d'un dossier");
await cas("le médecin change l'hôpital et note l'historique", () => assertSucceeds(maj("MED", { etablissementId: "HCK", hopHist: [{ hop: "HGC", avant: "2026-10-10" }] })));
await cas("refusé : la secrétaire limitée à un centre écrit l'historique des hôpitaux", () => assertFails(maj("SEC", { hopHist: [{ hop: "HCK", avant: "2026-01-01" }] })));
await cas("refusé : la secrétaire limitée à un centre change l'hôpital", () => assertFails(maj("SEC", { etablissementId: "HCK", hopHist: [] })));
await cas("la secrétaire modifie l'identité (sans toucher à l'hôpital)", () => assertSucceeds(maj("SEC", { identite: { nom: "B" } })));
console.log("Montants dans la limite des établissements (R-D3, C8)");
const cF = (u) => collection(env.authenticatedContext(u).firestore(), P + "/patientsFinances");
await cas("le médecin de tous les établissements lit les montants (un dossier, toute la liste)", async () => { await assertSucceeds(getDoc(D("MED", "patientsFinances/p2"))); await assertSucceeds(getDocs(cF("MED"))); });
await cas("le médecin limité à HGC lit les montants d'un patient HGC", () => assertSucceeds(getDoc(D("MEDH", "patientsFinances/p1"))));
await cas("refusé : le médecin limité à HGC lit les montants d'un patient HCK", () => assertFails(getDoc(D("MEDH", "patientsFinances/p2"))));
await cas("le médecin limité à HGC lit la liste de ses établissements (bilan)", () => assertSucceeds(getDocs(query(cF("MEDH"), where("etablissementId", "in", ["HGC"])))));
await cas("refusé : le médecin limité à HGC lit toute la liste", () => assertFails(getDocs(cF("MEDH"))));
await cas("refusé : le comptable lit les montants des dossiers (il lit le relevé)", () => assertFails(getDoc(D("CPT", "patientsFinances/p1"))));
await cas("refusé : la secrétaire sans droit « finances »", () => assertFails(getDoc(D("SEC", "patientsFinances/p1"))));
await cas("montants d'un dossier sans document : lecture permise (rien à lire)", () => assertSucceeds(getDoc(D("MEDH", "patientsFinances/p9"))));
console.log("Écritures en transaction (R-D3, C2 à C4)");
await cas("le médecin écrit montants et prix à encaisser dans une même transaction", () => { const db = env.authenticatedContext("MED").firestore(); return assertSucceeds(runTransaction(db, async (t) => {
  const s = await t.get(doc(db, P + "/patientsFinances/p1")); const M = JSON.parse(s.data().montantsJson); M.rdv = { r1: { brut: 300 } };
  t.set(doc(db, P + "/patientsFinances/p1"), { etablissementId: "HGC", montantsJson: JSON.stringify(M) }, { merge: true }); t.set(doc(db, P + "/encaissements/p1"), { etablissementId: "HGC", data: "{}" }); })); });
await cas("le comptable coche « Payé » dans une transaction", () => { const db = env.authenticatedContext("CPT").firestore(); return assertSucceeds(runTransaction(db, async (t) => { const s = await t.get(doc(db, P + "/finances/paiements")); t.set(doc(db, P + "/finances/paiements"), { data: JSON.stringify(Object.assign(JSON.parse(s.data().data), { "p1#r|1": "2026-10-20" })) }); })); });
await cas("refusé : le comptable écrit les règlements des cliniques", () => assertFails(setDoc(D("CPT", "finances/reglements"), { data: "[]" })));

console.log("\n" + ok + " réussis, " + ko + " échoués");
await env.cleanup();
if (ko) process.exit(1);
