// Ancienne application (v1) retirée le 11/10/2026 : ses collections racine sont fermées à tout le monde, même à la titulaire
// (e-mail propriétaire) et à un ancien rôle « admin ». Lancé par « npm test ».
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, collection, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const COLS = ["patients", "protocoles", "parametres", "finances", "roles", "historique"];
let ok = 0, ko = 0;
async function cas(nom, f) { try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }

await env.clearFirestore();
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore();
  for (const col of COLS) await setDoc(doc(db, col + "/x1"), { ancien: true });
  await setDoc(doc(db, "roles/ADM"), { role: "admin" });
});
const titulaire = env.authenticatedContext("TIT", { email: "ritabentahila@gmail.com" }).firestore();
const ancienAdmin = env.authenticatedContext("ADM", { email: "admin@test.ma" }).firestore();
const anonyme = env.unauthenticatedContext().firestore();
console.log("Ancienne application : collections fermées");
for (const col of COLS) {
  await cas(col + " : la titulaire ne lit ni n'écrit", async () => { await assertFails(getDoc(doc(titulaire, col + "/x1"))); await assertFails(getDocs(collection(titulaire, col))); await assertFails(setDoc(doc(titulaire, col + "/x2"), { a: 1 })); });
  await cas(col + " : un ancien « admin » et un visiteur non connecté non plus", async () => { await assertFails(getDoc(doc(ancienAdmin, col + "/x1"))); await assertFails(getDoc(doc(anonyme, col + "/x1"))); });
}
console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
await env.cleanup();
process.exit(ko ? 1 : 0);
