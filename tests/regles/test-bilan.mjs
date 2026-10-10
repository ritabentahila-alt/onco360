// Tests des règles : changement d'hôpital d'un dossier et historique des hôpitaux (étape 15 bis B1, 10/10/2026). Lancé par « npm test ».
// MED (médecin, tous les établissements), SEC (secrétaire limitée à HGC, droit identité).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, updateDoc, setDoc, serverTimestamp, setLogLevel } from "firebase/firestore";
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
console.log("\n" + ok + " réussis, " + ko + " échoués");
await env.cleanup();
if (ko) process.exit(1);
