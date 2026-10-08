// Tests des règles de sécurité des tâches (espaces/{e}/taches) sur l'émulateur Firestore.
// Lancer (Java 21 nécessaire) :  cd tests/regles && npm test
// Comptes : MED et MED2 (médecins), SEC (secrétaire), INF (infirmière), OFF (accès désactivé).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, arrayUnion, serverTimestamp, setLogLevel } from "firebase/firestore";
setLogLevel("silent"); // les refus attendus ne s'affichent pas en erreur

const E = "cabinet-test", P = "espaces/" + E;
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });

const membre = (role, actif = true) => ({ role, actif, nom: role, tousEtablissements: true, etablissements: [], droits: {} });
const ent = (par, txt, c) => Object.assign({ le: new Date().toISOString(), par, parNom: par, txt }, c ? { c: true } : {});
const tache = (de, pour, o = {}) => Object.assign({ titre: "Tâche", desc: "", type: "", urgent: false, ech: "", h: "", patientId: "", patientNom: "", etablissementId: "",
  de, deNom: de, pour, pourNom: pour, qui: [...new Set([de, pour])], statut: "afaire", fil: [ent(de, "Créée")], o: 1, majPar: de }, o);

async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    for (const [u, r, a] of [["MED", "medecin"], ["MED2", "medecin"], ["SEC", "assistante"], ["INF", "infirmiere"], ["OFF", "assistante", false]]) await setDoc(doc(db, P + "/membres/" + u), membre(r, a !== false));
    await setDoc(doc(db, P + "/taches/t1"), tache("SEC", "INF"));
    await setDoc(doc(db, P + "/taches/t2"), tache("MED", "MED"));
    await setDoc(doc(db, P + "/taches/t3"), tache("SEC", "MED"));
    await setDoc(doc(db, P + "/taches/tf"), tache("MED", "SEC", { statut: "fait" }));
    await setDoc(doc(db, P + "/taches/toff"), tache("OFF", "OFF"));
    await setDoc(doc(db, P + "/taches/tfs"), tache("SEC", "INF", { statut: "fait" }));
  });
}
const db = (u) => env.authenticatedContext(u).firestore();
const T = (u, id) => doc(db(u), P + "/taches/" + id);
const col = (u) => collection(db(u), P + "/taches");
const maj = (u, champs = {}, e) => Object.assign({ fil: arrayUnion(e || ent(u, "Statut : En cours")), majPar: u, maj: serverTimestamp() }, champs);

let ok = 0, ko = 0;
async function cas(nom, f) {
  await preparer();
  try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); }
}

console.log("Lecture");
await cas("l'infirmière lit une tâche pour elle", () => assertSucceeds(getDoc(T("INF", "t1"))));
await cas("la secrétaire lit la tâche qu'elle a créée", () => assertSucceeds(getDoc(T("SEC", "t1"))));
await cas("l'infirmière ne lit pas une tâche du médecin", () => assertFails(getDoc(T("INF", "t2"))));
await cas("la secrétaire ne lit pas une tâche du médecin pour lui-même", () => assertFails(getDoc(T("SEC", "t2"))));
await cas("un autre médecin lit toutes les tâches", () => assertSucceeds(getDoc(T("MED2", "t2"))));
await cas("le médecin liste toutes les tâches", () => assertSucceeds(getDocs(col("MED"))));
await cas("l'infirmière liste ses tâches (qui contient elle)", () => assertSucceeds(getDocs(query(col("INF"), where("qui", "array-contains", "INF")))));
await cas("l'infirmière ne liste pas toutes les tâches", () => assertFails(getDocs(col("INF"))));
await cas("un accès désactivé ne lit rien, même ses tâches", () => assertFails(getDoc(T("OFF", "toff"))));
await cas("une personne hors du cabinet ne lit rien", () => assertFails(getDoc(T("INCONNU", "t1"))));

console.log("Création");
await cas("la secrétaire crée une tâche pour l'infirmière", () => assertSucceeds(setDoc(T("SEC", "n1"), tache("SEC", "INF"))));
await cas("une tâche pour soi-même", () => assertSucceeds(setDoc(T("INF", "n1"), tache("INF", "INF"))));
await cas("refusé : créer au nom d'un autre (de = MED)", () => assertFails(setDoc(T("SEC", "n1"), tache("MED", "INF", { majPar: "SEC" }))));
await cas("refusé : historique signé par un autre", () => assertFails(setDoc(T("SEC", "n1"), tache("SEC", "INF", { fil: [ent("MED", "Créée")] }))));
await cas("refusé : responsable qui n'est pas membre", () => assertFails(setDoc(T("SEC", "n1"), tache("SEC", "PERSONNE"))));
await cas("refusé : « qui » sans le responsable", () => assertFails(setDoc(T("SEC", "n1"), tache("SEC", "INF", { qui: ["SEC"] }))));
await cas("refusé : « qui » avec une personne en plus", () => assertFails(setDoc(T("SEC", "n1"), tache("SEC", "INF", { qui: ["SEC", "INF", "MED2"] }))));
await cas("refusé : créée déjà terminée", () => assertFails(setDoc(T("SEC", "n1"), tache("SEC", "INF", { statut: "fait" }))));
await cas("refusé : sans titre", () => assertFails(setDoc(T("SEC", "n1"), tache("SEC", "INF", { titre: "" }))));
await cas("refusé : accès désactivé", () => assertFails(setDoc(T("OFF", "n1"), tache("OFF", "OFF"))));

console.log("Tâches lues (utilisateurs/{uid}.tachesVu)");
await cas("chacun enregistre ses tâches lues dans son profil", () => assertSucceeds(setDoc(doc(db("INF"), "utilisateurs/INF"), { tachesVu: { t1: 2 } }, { merge: true })));
await cas("refusé : écrire dans le profil d'un autre", () => assertFails(setDoc(doc(db("INF"), "utilisateurs/SEC"), { tachesVu: { t1: 2 } }, { merge: true })));

console.log("Statut, commentaires, réattribution");
await cas("le responsable change le statut", () => assertSucceeds(updateDoc(T("INF", "t1"), maj("INF", { statut: "encours" }))));
await cas("le responsable termine la tâche", () => assertSucceeds(updateDoc(T("INF", "t1"), maj("INF", { statut: "fait", faitPar: "INF", faitParNom: "INF", faitLe: new Date().toISOString() }))));
await cas("le responsable commente", () => assertSucceeds(updateDoc(T("INF", "t1"), maj("INF", {}, ent("INF", "Vu ce matin", true)))));
await cas("l'auteur commente", () => assertSucceeds(updateDoc(T("SEC", "t1"), maj("SEC", {}, ent("SEC", "Merci", true)))));
await cas("un médecin commente une tâche dont il n'est ni auteur ni responsable", () => assertSucceeds(updateDoc(T("MED", "t1"), maj("MED", {}, ent("MED", "OK", true)))));
await cas("refusé : commentaire signé par un autre", () => assertFails(updateDoc(T("INF", "t1"), maj("INF", {}, ent("SEC", "faux", true)))));
await cas("refusé : commenter une tâche qu'on ne voit pas", () => assertFails(updateDoc(T("INF", "t2"), maj("INF", {}, ent("INF", "?", true)))));
await cas("refusé : modifier sans entrée dans le fil", () => assertFails(updateDoc(T("INF", "t1"), { statut: "encours", majPar: "INF" })));
await cas("refusé : effacer le fil", () => assertFails(updateDoc(T("MED", "t1"), { fil: [], majPar: "MED" })));
await cas("refusé : changer l'auteur", () => assertFails(updateDoc(T("MED", "t1"), maj("MED", { de: "MED", qui: ["MED", "INF"] }))));
await cas("refusé : statut inconnu", () => assertFails(updateDoc(T("INF", "t1"), maj("INF", { statut: "archive" }))));
await cas("le responsable réattribue à un médecin", () => assertSucceeds(updateDoc(T("INF", "t1"), maj("INF", { pour: "MED", pourNom: "MED", qui: ["SEC", "MED"] }, ent("INF", "Réattribuée à MED")))));
await cas("après réattribution, l'ancien responsable ne la voit plus", async () => {
  await updateDoc(T("INF", "t1"), maj("INF", { pour: "MED", pourNom: "MED", qui: ["SEC", "MED"] }, ent("INF", "Réattribuée à MED")));
  await assertFails(getDoc(T("INF", "t1")));
});
await cas("refusé : réattribuer en oubliant de mettre « qui » à jour", () => assertFails(updateDoc(T("INF", "t1"), maj("INF", { pour: "MED", pourNom: "MED" }))));
await cas("refusé : réattribuer à quelqu'un qui n'est pas membre", () => assertFails(updateDoc(T("SEC", "t1"), maj("SEC", { pour: "X", pourNom: "X", qui: ["SEC", "X"] }))));

console.log("Suppression");
await cas("l'auteur supprime sa tâche non terminée", () => assertSucceeds(deleteDoc(T("SEC", "t1"))));
await cas("un médecin supprime la tâche d'un autre (non terminée)", () => assertSucceeds(deleteDoc(T("MED2", "t1"))));
await cas("refusé : le responsable qui n'en est pas l'auteur supprime", () => assertFails(deleteDoc(T("INF", "t1"))));
await cas("l'auteur supprime sa tâche terminée (08/10)", () => assertSucceeds(deleteDoc(T("MED", "tf"))));
await cas("refusé : un médecin supprime la tâche terminée d'un autre", () => assertFails(deleteDoc(T("MED", "tfs"))));
await cas("refusé : le responsable supprime une tâche terminée qu'il n'a pas créée", () => assertFails(deleteDoc(T("SEC", "tf"))));
await cas("refusé : un accès désactivé supprime sa propre tâche", () => assertFails(deleteDoc(T("OFF", "toff"))));

await env.cleanup();
console.log("\n" + ok + " réussi(s), " + ko + " échoué(s)");
process.exit(ko ? 1 : 0);
