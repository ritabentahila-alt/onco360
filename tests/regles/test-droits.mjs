// Droits imposés par le serveur (étape 1.3, 11/10/2026, audit) : fiches de membres créées par le serveur seulement, historique d'une
// tâche jamais réécrit, modules retirés fermés à l'écriture. Comptes : MED (médecin titulaire), SEC (secrétaire). Lancé par « npm test ».
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, setDoc, updateDoc, serverTimestamp, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const P = "espaces/cabinet-test";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const tous = { ecrireConsultations: true, documents: true, rendezvous: true };
const membre = (role) => ({ role, actif: true, nom: role, tousEtablissements: true, etablissements: [], droits: Object.assign({}, tous) });
const ent = (par, txt) => ({ le: "2026-10-11T10:00:00Z", par, parNom: par, txt });
const tache = (de, pour, o = {}) => Object.assign({ titre: "Tâche", desc: "", type: "", urgent: false, ech: "", h: "", patientId: "", patientNom: "", etablissementId: "",
  de, deNom: de, pour, pourNom: pour, qui: [...new Set([de, pour])], statut: "afaire", fil: [ent(de, "Créée")], o: 1, majPar: de }, o);
const db = (u) => env.authenticatedContext(u, { email: u.toLowerCase() + "@test.ma" }).firestore();
const D = (u, ch) => doc(db(u), P + "/" + ch);

async function preparer(modules) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const f = c.firestore();
    await setDoc(doc(f, P), Object.assign({ titulaire: "MED" }, modules ? { abonnement: { formule: "essentiel", modules } } : {}));
    await setDoc(doc(f, P + "/membres/MED"), membre("medecin"));
    await setDoc(doc(f, P + "/membres/SEC"), membre("assistante"));
    await setDoc(doc(f, P + "/taches/t1"), tache("MED", "SEC", { fil: [ent("MED", "Créée"), ent("SEC", "Statut : En cours")] }));
  });
}
let ok = 0, ko = 0;
async function cas(nom, f, modules) { await preparer(modules); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }

console.log("Membres : créés par le serveur seulement");
await cas("refusé : le titulaire crée lui-même un membre (rattacher un compte quelconque)", () => assertFails(setDoc(D("MED", "membres/AUTRE"), membre("assistante"))));
await cas("le titulaire modifie les droits d'un membre existant", () => assertSucceeds(updateDoc(D("MED", "membres/SEC"), { "droits.documents": false })));
await cas("refusé : le titulaire modifie sa propre fiche", () => assertFails(updateDoc(D("MED", "membres/MED"), { "droits.finances": true })));
await cas("refusé : une secrétaire modifie un membre", () => assertFails(updateDoc(D("SEC", "membres/MED"), { actif: false })));

console.log("Tâches : historique jamais réécrit");
await cas("ajouter une entrée au fil", () => assertSucceeds(updateDoc(D("SEC", "taches/t1"), { fil: [ent("MED", "Créée"), ent("SEC", "Statut : En cours"), ent("SEC", "Commentaire")], majPar: "SEC" })));
await cas("refusé : réécrire une entrée déjà écrite en en ajoutant une", () => assertFails(updateDoc(D("SEC", "taches/t1"), { fil: [ent("MED", "Créée"), ent("SEC", "Statut : Fait (modifié)"), ent("SEC", "Commentaire")], majPar: "SEC" })));
await cas("refusé : retirer une entrée et en ajouter une", () => assertFails(updateDoc(D("SEC", "taches/t1"), { fil: [ent("MED", "Créée"), ent("SEC", "X"), ent("SEC", "Y")].slice(1), majPar: "SEC" })));

console.log("Modules retirés : fermés à l'écriture");
const salle = { jour: "2026-10-11", patientId: "p1", cle: "r-a", etat: "salle", etablissementId: "HGC", majPar: "SEC" };
const rcp = { patientId: "p1", patientNom: "PATIENT Test", etablissementId: "HGC", d: "2026-10-13", q: "?", ins: "2026-10-11", fait: false, o: 1, creePar: "MED", majPar: "MED", maj: serverTimestamp() };
const fichier = { patientId: "p1", etablissementId: "HGC", titre: "CR", d: "2026-10-11", type: "", nom: "a.pdf", chemin: "x", creePar: "SEC", majPar: "SEC" };
await cas("sans abonnement (cabinet Bentahila) : salle, RCP, tâche, document permis", async () => {
  await assertSucceeds(setDoc(D("SEC", "salle/2026-10-11_p1_r-a"), salle)); await assertSucceeds(setDoc(D("MED", "rcp/r1"), rcp));
  await assertSucceeds(setDoc(D("MED", "taches/n1"), tache("MED", "SEC"))); await assertSucceeds(setDoc(D("SEC", "fichiers/f1"), fichier)); });
await cas("modules présents dans la formule : permis", () => assertSucceeds(setDoc(D("MED", "rcp/r1"), rcp)), { rcp: true, salle: true, taches: true, documents: true });
const sans = { rcp: false, salle: false, taches: false, documents: false };
await cas("refusé : salle d'attente retirée", () => assertFails(setDoc(D("SEC", "salle/2026-10-11_p1_r-a"), salle)), sans);
await cas("refusé : RCP retirée", () => assertFails(setDoc(D("MED", "rcp/r1"), rcp)), sans);
await cas("refusé : tâches retirées", () => assertFails(setDoc(D("MED", "taches/n1"), tache("MED", "SEC"))), sans);
await cas("refusé : documents retirés (dépôt, document de radiothérapie)", async () => {
  await assertFails(setDoc(D("SEC", "fichiers/f1"), fichier));
  await assertFails(setDoc(D("SEC", "documentsRT/p1_rt1_pli"), { patientId: "p1", etablissementId: "HGC", rtId: "rt1", type: "pli", html: "", majPar: "SEC" })); }, sans);

console.log("Protocoles : modifiés par un médecin seulement (2.4)");
await cas("le médecin (droit paramètres) modifie la bibliothèque", async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), P + "/membres/MED"), Object.assign(membre("medecin"), { droits: Object.assign({}, tous, { parametres: true }) })); });
  await assertSucceeds(setDoc(D("MED", "protocoles/lib_0"), { data: "[]", n: 0 })); });
await cas("refusé : une secrétaire avec le droit paramètres", async () => {
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), P + "/membres/SEC"), Object.assign(membre("assistante"), { droits: Object.assign({}, tous, { parametres: true }) })); });
  await assertFails(setDoc(D("SEC", "protocoles/lib_0"), { data: "[]", n: 0 })); });

console.log("Heure des séances de chimio (12/10/2026) : champ « heures » du dossier");
async function avecInfirmiere() {
  await env.withSecurityRulesDisabled(async (c) => { const f = c.firestore();
    await setDoc(doc(f, P + "/membres/INF"), { role: "infirmiere", actif: true, nom: "INF", tousEtablissements: true, etablissements: [], droits: { administrer: true, traitements: "voir", planningChimio: false } });
    await setDoc(doc(f, P + "/patients/p1"), { etablissementId: "HGC", identite: { nom: "PATIENT Test" }, planningJson: "{}", lignesJson: "[]", version: 1 }); });
}
const maj = (u, o) => Object.assign({ version: 2, maj: serverTimestamp(), majPar: u }, o);
const hr = { "L1|2|1": { h: "09:30", du: 180, par: "INF", parNom: "INF", le: "2026-10-12T08:00:00Z" } };
await cas("l'infirmière note l'heure d'une séance", async () => { await avecInfirmiere(); await assertSucceeds(updateDoc(D("INF", "patients/p1"), maj("INF", { heures: hr }))); });
await cas("refusé : l'infirmière change le planning (les dates)", async () => { await avecInfirmiere(); await assertFails(updateDoc(D("INF", "patients/p1"), maj("INF", { planningJson: "{\"L1\":{}}" }))); });
await cas("refusé : l'infirmière modifie les lignes de chimio", async () => { await avecInfirmiere(); await assertFails(updateDoc(D("INF", "patients/p1"), maj("INF", { lignesJson: "[{}]" }))); });
await cas("la secrétaire (planning) note l'heure", async () => { await avecInfirmiere();
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), P + "/membres/SEC"), Object.assign(membre("assistante"), { droits: Object.assign({}, tous, { planningChimio: true }) })); });
  await assertSucceeds(updateDoc(D("SEC", "patients/p1"), maj("SEC", { heures: hr }))); });
await cas("refusé : un membre sans droit (ni planning, ni traitements, ni administrer)", async () => { await avecInfirmiere();
  await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), P + "/membres/SEC"), Object.assign(membre("assistante"), { droits: Object.assign({}, tous, { planningChimio: false, traitements: "voir" }) })); });
  await assertFails(updateDoc(D("SEC", "patients/p1"), maj("SEC", { heures: hr }))); });

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
await env.cleanup();
process.exit(ko ? 1 : 0);
