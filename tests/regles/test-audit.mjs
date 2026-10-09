// Tests des règles du journal d'audit (audit/{e}/lignes, étape 9, 09/10/2026) sur l'émulateur Firestore. Lancé par « npm test ».
// Cabinet cab-a : TIT (titulaire), MED (autre médecin), SEC (secrétaire) ; cab-b : TITB. ADM : compte d'administration.
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, setLogLevel } from "firebase/firestore";
setLogLevel("silent");
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const mb = (role) => ({ role, actif: true, nom: role, tousEtablissements: true, etablissements: [], droits: { finances: role === "medecin", parametres: role === "medecin" } });
const ligne = { type: "modification", col: "patients", lib: "Dossier patient", patientId: "p1", patientNom: "ALAOUI Fatima", quoi: ["Rendez-vous"], par: "SEC", le: new Date("2026-10-09T10:00:00Z") };
async function preparer(suspendu) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, "espaces/cab-a"), Object.assign({ titulaire: "TIT" }, suspendu ? { actif: false } : {}));
    for (const [u, r] of [["TIT", "medecin"], ["MED", "medecin"], ["SEC", "assistante"]]) await setDoc(doc(db, "espaces/cab-a/membres/" + u), mb(r));
    await setDoc(doc(db, "espaces/cab-b"), { titulaire: "TITB" }); await setDoc(doc(db, "espaces/cab-b/membres/TITB"), mb("medecin"));
    await setDoc(doc(db, "administrateurs/ADM"), { email: "adm@test.ma" });
    await setDoc(doc(db, "audit/cab-a/lignes/l1"), ligne);
  });
}
const db = (u) => env.authenticatedContext(u, u === "RITA" ? { email: "ritabentahila@gmail.com" } : {}).firestore();
const L = (u) => doc(db(u), "audit/cab-a/lignes/l1"), C = (u) => collection(db(u), "audit/cab-a/lignes");
let ok = 0, ko = 0;
async function cas(nom, f, susp) { await preparer(susp); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }
console.log("Lecture");
await cas("le titulaire lit le journal de son cabinet", async () => { await assertSucceeds(getDoc(L("TIT"))); await assertSucceeds(getDocs(query(C("TIT"), where("le", ">=", new Date("2026-10-01")), orderBy("le", "desc")))); });
await cas("refusé : un autre médecin du cabinet", () => assertFails(getDocs(C("MED"))));
await cas("refusé : la secrétaire (même ses propres lignes)", () => assertFails(getDoc(L("SEC"))));
await cas("refusé : le titulaire d'un autre cabinet", () => assertFails(getDocs(C("TITB"))));
await cas("refusé : le compte d'administration", () => assertFails(getDocs(C("ADM"))));
await cas("refusé : Dr Bentahila (cabinet d'un autre)", () => assertFails(getDocs(C("RITA"))));
await cas("refusé : titulaire d'un cabinet suspendu", () => assertFails(getDocs(C("TIT"))), true);
console.log("Aucune écriture depuis le navigateur");
await cas("refusé : le titulaire ajoute une ligne", () => assertFails(setDoc(doc(db("TIT"), "audit/cab-a/lignes/x"), ligne)));
await cas("refusé : le titulaire modifie une ligne", () => assertFails(updateDoc(L("TIT"), { par: "MED" })));
await cas("refusé : le titulaire efface une ligne", () => assertFails(deleteDoc(L("TIT"))));
await cas("refusé : la secrétaire efface la trace de son action", () => assertFails(deleteDoc(L("SEC"))));
await cas("refusé : l'administration écrit", () => assertFails(setDoc(doc(db("ADM"), "audit/cab-a/lignes/y"), ligne)));
console.log("\n" + ok + " réussis, " + ko + " échoués");
await env.cleanup();
if (ko) process.exit(1);
