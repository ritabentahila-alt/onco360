// Tests de la règle de plateforme/heureMaroc (S1, 21/10/2026 : changements d'heure ajoutés par l'Administration) sur l'émulateur Firestore.
// Lancer (Java 21 nécessaire) :  cd tests/regles && npm test
// Lu par tout compte connecté (chaque poste le lit à l'ouverture) ; écrit par la fonction heureMaroc seulement (jamais depuis le navigateur,
// même par le compte de Dr Bentahila).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, setLogLevel } from "firebase/firestore";
setLogLevel("silent");
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
let ok = 0, ko = 0;
async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), "plateforme/heureMaroc"), { changements: [{ du: "2027-02-07T02:00Z", dec: 60 }] }); await setDoc(doc(c.firestore(), "plateforme/abonnements"), { suspension: "demander" }); });
}
async function cas(nom, f) {
  await preparer();
  try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); }
}
const H = (c) => doc(c.firestore(), "plateforme/heureMaroc");
const rita = () => env.authenticatedContext("UIDRITA", { email: "ritabentahila@gmail.com" });
console.log("Heure du Maroc (plateforme/heureMaroc)");
await cas("un compte connecté lit la table", () => assertSucceeds(getDoc(H(env.authenticatedContext("SEC")))));
await cas("sans connexion : refusé", () => assertFails(getDoc(H(env.unauthenticatedContext()))));
await cas("écriture depuis le navigateur refusée (membre)", () => assertFails(setDoc(H(env.authenticatedContext("SEC")), { changements: [] })));
await cas("écriture refusée même au compte de Dr Bentahila", () => assertFails(setDoc(H(rita()), { changements: [] })));
await cas("suppression refusée", () => assertFails(deleteDoc(H(rita()))));
await cas("les autres documents de plateforme restent fermés", () => assertFails(getDoc(doc(env.authenticatedContext("SEC").firestore(), "plateforme/abonnements"))));
console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
await env.cleanup();
process.exit(ko ? 1 : 0);
