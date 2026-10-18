// R-A4 (18/10/2026) : écoute en direct des dossiers modifiés depuis l'ouverture d'Onco360 (v2.js `ecouterDossiers`) : la liste des dossiers
// dont `maj` est postérieur à l'ouverture, dans le périmètre de la personne (mêmes filtres d'établissement que la salle d'attente).
// Lancer (Java 21) :  cd tests/regles && npm test
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDocs, setDoc, collection, query, where, Timestamp, setLogLevel } from "firebase/firestore";
setLogLevel("silent");
const E = "cabinet-test", P = "espaces/" + E;
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, etabs, actif = true) => ({ role, actif, nom: role, tousEtablissements: etabs === "*", etablissements: etabs === "*" ? [] : etabs, droits: {} });
const avant = Timestamp.fromMillis(Date.parse("2026-10-18T08:00:00Z")), apres = Timestamp.fromMillis(Date.parse("2026-10-18T09:00:00Z"));
async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    for (const [u, r, e, a] of [["MED", "medecin", "*"], ["SEC", "assistante", ["HGC"]], ["INF", "infirmiere", ["HGC", "HCK"]], ["COMPTA", "comptable", "*"], ["OFF", "assistante", "*", false]]) await setDoc(doc(db, P + "/membres/" + u), membre(r, e, a !== false));
    await setDoc(doc(db, P + "/patients/p1"), { etablissementId: "HGC", version: 3, maj: apres, majPar: "SEC", resume: "{}" });
    await setDoc(doc(db, P + "/patients/p2"), { etablissementId: "HCK", version: 2, maj: apres, majPar: "MED", resume: "{}" });
  });
}
const col = (u) => collection(env.authenticatedContext(u).firestore(), P + "/patients");
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }
console.log("Écoute des dossiers modifiés");
await cas("le médecin (tous les établissements) liste les dossiers modifiés depuis l'ouverture", async () => { const s = await assertSucceeds(getDocs(query(col("MED"), where("maj", ">", avant)))); if (s.size !== 2) throw new Error("2 attendus, " + s.size); });
await cas("la secrétaire HGC liste ceux de son centre (filtre d'établissement)", async () => { const s = await assertSucceeds(getDocs(query(col("SEC"), where("etablissementId", "in", ["HGC"]), where("maj", ">", avant)))); if (s.size !== 1) throw new Error("1 attendu, " + s.size); });
await cas("l'infirmière de deux centres liste les deux", async () => { const s = await assertSucceeds(getDocs(query(col("INF"), where("etablissementId", "in", ["HGC", "HCK"]), where("maj", ">", avant)))); if (s.size !== 2) throw new Error("2 attendus, " + s.size); });
await cas("refusé : la secrétaire HGC sans filtre d'établissement", () => assertFails(getDocs(query(col("SEC"), where("maj", ">", avant)))));
await cas("refusé : la secrétaire HGC demande un autre centre", () => assertFails(getDocs(query(col("SEC"), where("etablissementId", "in", ["HCK"]), where("maj", ">", avant)))));
await cas("refusé : le comptable (aucun dossier)", () => assertFails(getDocs(query(col("COMPTA"), where("maj", ">", avant)))));
await cas("refusé : accès désactivé", () => assertFails(getDocs(query(col("OFF"), where("maj", ">", avant)))));
await env.cleanup();
console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
