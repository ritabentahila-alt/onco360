// Tests des règles du référentiel de radiothérapie (espaces/{e}/referentielRT, RTR, RT1 du 25/10/2026) sur l'émulateur Firestore. Lancé par « npm test ».
// Comptes du cabinet A : MED (médecin, sans droit noté = « modifier »), MEDV (médecin, « voir »), MEDA (médecin, « aucun »), SEC (secrétaire,
// sans droit noté = « aucun »), SECV (secrétaire, « voir »), INFV (infirmière, « voir »), INFM (infirmière, « modifier » : ne modifie pas),
// COMPV (comptable, « voir » : jamais), OFF (désactivé). Cabinets : B (module rt retiré), C (fonction rt.referentiel coupée),
// S (suspendu), X (autre cabinet : MEDX y est médecin, pas dans A).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const E = (c) => "espaces/cab-" + c;
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, niv, actif = true) => ({ role, actif, nom: role, tousEtablissements: true, etablissements: [], droits: niv === undefined ? {} : { referentielRT: niv } });
const fiche = (par, o = {}) => Object.assign({ schema: { id: "pro-fav-60-20", titre: "60 Gy / 20 fx" }, localisation_id: "prostate", origine: "cabinet", base: "2026-10-22", note: "", majPar: par, majParNom: par, majLe: "2026-10-25" }, o);

async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, E("a")), { titulaire: "MED" });
    await setDoc(doc(db, E("b")), { titulaire: "MED", abonnement: { modules: { rt: false } } });
    await setDoc(doc(db, E("c")), { titulaire: "MED", abonnement: { reglage: { fonctions: { "rt.referentiel": false } } } });
    await setDoc(doc(db, E("s")), { titulaire: "MED", actif: false });
    await setDoc(doc(db, E("x")), { titulaire: "MEDX" });
    for (const [u, r, n, a] of [["MED", "medecin"], ["MEDV", "medecin", "voir"], ["MEDA", "medecin", "aucun"], ["SEC", "assistante"], ["SECV", "assistante", "voir"],
      ["INFV", "infirmiere", "voir"], ["INFM", "infirmiere", "modifier"], ["COMPV", "comptable", "voir"], ["OFF", "medecin", undefined, false]])
      await setDoc(doc(db, E("a") + "/membres/" + u), membre(r, n, a !== false));
    for (const c2 of ["b", "c", "s"]) await setDoc(doc(db, E(c2) + "/membres/MED"), membre("medecin"));
    await setDoc(doc(db, E("x") + "/membres/MEDX"), membre("medecin"));
    for (const c2 of ["a", "b", "c", "s", "x"]) await setDoc(doc(db, E(c2) + "/referentielRT/pro-fav-60-20"), fiche("MED"));
  });
}
const db = (u) => env.authenticatedContext(u).firestore();
const R = (u, c = "a", i = "pro-fav-60-20") => doc(db(u), E(c) + "/referentielRT/" + i);
const col = (u, c = "a") => collection(db(u), E(c) + "/referentielRT");
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }

console.log("Lire");
await cas("le médecin sans droit noté lit (« modifier » par défaut)", () => assertSucceeds(getDocs(col("MED"))));
await cas("le médecin « voir » lit", () => assertSucceeds(getDoc(R("MEDV"))));
await cas("refusé : le médecin « aucun »", () => assertFails(getDoc(R("MEDA"))));
await cas("refusé : la secrétaire sans droit noté (« aucun » par défaut)", () => assertFails(getDoc(R("SEC"))));
await cas("la secrétaire « voir » lit", () => assertSucceeds(getDocs(col("SECV"))));
await cas("l'infirmière « voir » lit", () => assertSucceeds(getDoc(R("INFV"))));
await cas("refusé : le comptable, même avec « voir »", () => assertFails(getDoc(R("COMPV"))));
await cas("refusé : accès désactivé", () => assertFails(getDoc(R("OFF"))));
await cas("refusé : sans connexion", () => assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), E("a") + "/referentielRT/pro-fav-60-20"))));
await cas("refusé : module rt retiré de la formule", () => assertFails(getDoc(R("MED", "b"))));
await cas("refusé : fonction rt.referentiel coupée", () => assertFails(getDoc(R("MED", "c"))));
await cas("refusé : cabinet suspendu", () => assertFails(getDoc(R("MED", "s"))));
await cas("refusé : médecin d'un autre cabinet", () => assertFails(getDoc(R("MEDX", "a"))));
await cas("le médecin de l'autre cabinet lit le sien", () => assertSucceeds(getDoc(R("MEDX", "x"))));

console.log("Enregistrer pour le cabinet");
await cas("le médecin « modifier » crée une fiche signée par lui", () => assertSucceeds(setDoc(R("MED", "a", "cab-1"), fiche("MED", { nouveau: true }))));
await cas("le médecin « modifier » met à jour", () => assertSucceeds(updateDoc(R("MED"), { note: "Notre pratique", majPar: "MED" })));
await cas("refusé : fiche signée par un autre", () => assertFails(setDoc(R("MED", "a", "cab-1"), fiche("SECV"))));
await cas("refusé : mise à jour sans signature", () => assertFails(updateDoc(R("MED"), { note: "x", majPar: "MEDV" })));
await cas("refusé : le médecin « voir » écrit", () => assertFails(setDoc(R("MEDV", "a", "cab-1"), fiche("MEDV"))));
await cas("refusé : la secrétaire « voir » écrit", () => assertFails(updateDoc(R("SECV"), { note: "x", majPar: "SECV" })));
await cas("refusé : l'infirmière « modifier » écrit (médecin seulement)", () => assertFails(setDoc(R("INFM", "a", "cab-1"), fiche("INFM"))));
await cas("refusé : écrire avec le module rt retiré", () => assertFails(setDoc(R("MED", "b", "cab-1"), fiche("MED"))));
await cas("refusé : écrire avec la fonction coupée", () => assertFails(setDoc(R("MED", "c", "cab-1"), fiche("MED"))));
await cas("refusé : écrire dans un cabinet suspendu", () => assertFails(setDoc(R("MED", "s", "cab-1"), fiche("MED"))));
await cas("refusé : écrire dans un autre cabinet", () => assertFails(setDoc(R("MEDX", "a", "cab-1"), fiche("MEDX"))));

console.log("Revenir à la référence (supprimer la fiche du cabinet)");
await cas("le médecin « modifier » supprime", () => assertSucceeds(deleteDoc(R("MED"))));
await cas("refusé : le médecin « voir » supprime", () => assertFails(deleteDoc(R("MEDV"))));
await cas("refusé : la secrétaire « voir » supprime", () => assertFails(deleteDoc(R("SECV"))));

await env.cleanup();
console.log("\n" + ok + " réussi(s), " + ko + " échec(s)"); process.exit(ko ? 1 : 0);
