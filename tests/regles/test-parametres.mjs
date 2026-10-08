// Tests des règles de sécurité de parametres/* (listes du cabinet) sur l'émulateur Firestore. Lancé par « npm test ».
// Comptes : MED (droit paramètres), SEC (fiche patient, identité, sans paramètres), INF (aucun de ces droits), OFF (désactivé).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const P = "espaces/cabinet-test";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, droits, actif = true) => ({ role, actif, nom: role, tousEtablissements: true, etablissements: [], droits });
async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    await setDoc(doc(db, P + "/membres/MED"), membre("medecin", { parametres: true, identite: true, fichePatient: true, creerPatient: true }));
    await setDoc(doc(db, P + "/membres/SEC"), membre("assistante", { identite: true, fichePatient: true, creerPatient: true }));
    await setDoc(doc(db, P + "/membres/INF"), membre("infirmiere", { administrer: true }));
    await setDoc(doc(db, P + "/membres/OFF"), membre("assistante", { identite: true, fichePatient: true }, false));
    await setDoc(doc(db, P + "/parametres/listes"), { data: "{}" });
  });
}
const db = (u) => env.authenticatedContext(u).firestore();
const D = (u, n) => doc(db(u), P + "/parametres/" + n);
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }

console.log("Listes du cabinet (parametres/listes)");
await cas("tous les membres lisent les listes", () => assertSucceeds(getDoc(D("INF", "listes"))));
await cas("le médecin (paramètres) les modifie", () => assertSucceeds(setDoc(D("MED", "listes"), { data: '{"mut":["X"]}' })));
await cas("la secrétaire (fiche patient) y ajoute un nom tapé dans une fiche", () => assertSucceeds(setDoc(D("SEC", "listes"), { data: '{"mut":["Nouvelle mutuelle"]}' })));
await cas("refusé : l'infirmière sans droit sur les fiches", () => assertFails(setDoc(D("INF", "listes"), { data: "{}" })));
await cas("refusé : accès désactivé", () => assertFails(setDoc(D("OFF", "listes"), { data: "{}" })));
console.log("Autres paramètres : droit « paramètres » seulement");
await cas("refusé : la secrétaire modifie les réglages (impression…)", () => assertFails(setDoc(D("SEC", "reglages"), { data: "{}" })));
await cas("refusé : la secrétaire modifie les types de tâches", () => assertFails(setDoc(D("SEC", "typesTaches"), { data: "[]" })));
await cas("le médecin modifie les réglages", () => assertSucceeds(setDoc(D("MED", "reglages"), { data: "{}" })));
console.log("Tâches automatiques (P4)");
await cas("le médecin modifie les règles des tâches automatiques", () => assertSucceeds(setDoc(D("MED", "tachesAuto"), { data: '{"regles":[]}' })));
await cas("refusé : la secrétaire modifie les règles des tâches automatiques", () => assertFails(setDoc(D("SEC", "tachesAuto"), { data: "{}" })));
await cas("refusé : registre des tâches automatiques invisible depuis le navigateur (même le médecin)", () => assertFails(getDoc(doc(db("MED"), P + "/tachesAuto/auto-x"))));
await cas("refusé : écrire dans le registre (ne pas empêcher une tâche)", () => assertFails(setDoc(doc(db("MED"), P + "/tachesAuto/auto-x"), { le: "x" })));

await env.cleanup();
console.log("\n" + ok + " réussi(s), " + ko + " échoué(s)");
process.exit(ko ? 1 : 0);
