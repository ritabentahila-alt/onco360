// Tests des règles de la carte des médecins (espaces/{e}/signataires/{uid}, 3.9 du 12/10/2026) sur l'émulateur Firestore. Lancé par « npm test ».
// Comptes : MED (médecin), MED2 (autre médecin), SEC (secrétaire), CPT (comptable), OFF (désactivé).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, setLogLevel } from "firebase/firestore";
setLogLevel("silent");
const P = "espaces/cabinet-test";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, actif = true) => ({ role, actif, nom: role, tousEtablissements: true, etablissements: [], droits: {} });
async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore(); await setDoc(doc(db, P), { titulaire: "MED" });
    for (const [u, r, a] of [["MED", "medecin"], ["MED2", "medecin"], ["SEC", "assistante"], ["CPT", "comptable"], ["OFF", "medecin", false]]) await setDoc(doc(db, P + "/membres/" + u), membre(r, a !== false));
    await setDoc(doc(db, P + "/signataires/MED2"), { nom: "Dr B", inpe: "123" });
  });
}
const S = (u, i) => doc(env.authenticatedContext(u).firestore(), P + "/signataires/" + i);
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }
console.log("Carte des médecins");
await cas("un médecin publie sa carte", () => assertSucceeds(setDoc(S("MED", "MED"), { nom: "Dr A", inpe: "1", signature: "data:image/png;base64,x" })));
await cas("refusé : un médecin écrit la carte d'un autre", () => assertFails(setDoc(S("MED", "MED2"), { nom: "X" })));
await cas("refusé : la secrétaire publie une carte", () => assertFails(setDoc(S("SEC", "SEC"), { nom: "X" })));
await cas("la secrétaire lit la carte d'un médecin (signataire)", () => assertSucceeds(getDoc(S("SEC", "MED2"))));
await cas("refusé : le comptable lit une carte", () => assertFails(getDoc(S("CPT", "MED2"))));
await cas("refusé : accès désactivé", () => assertFails(setDoc(S("OFF", "OFF"), { nom: "X" })));
await cas("le médecin retire sa carte", () => assertSucceeds(deleteDoc(S("MED2", "MED2"))));
console.log(ko ? "❌ " + ko + " échec(s), " + ok + " réussis" : "✅ carte des médecins : " + ok + " réussis");
await env.cleanup(); process.exit(ko ? 1 : 0);
