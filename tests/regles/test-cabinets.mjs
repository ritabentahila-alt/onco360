// Tests d'étanchéité entre cabinets (phase F, 09/10/2026) sur l'émulateur Firestore. Lancé par « npm test ».
// Cabinets : cabinet-bentahila (RITA = Dr Bentahila, titulaire, connectée avec son e-mail ; SECA = sa secrétaire) et
// cab-autre (DRB = titulaire, SECB = sa secrétaire). ADM = compte d'administration (collection administrateurs).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, setLogLevel, serverTimestamp } from "firebase/firestore";
setLogLevel("silent");

const A = "espaces/cabinet-bentahila", B = "espaces/cab-autre";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const TOUS = { identite: true, fichePatient: true, rendezvous: true, consultations: true, ecrireConsultations: true, planningChimio: true, traitements: "modifier", radiotherapie: "modifier", documents: true, administrer: true, encaissements: true, creerPatient: true, supprimerPatient: true, finances: true, parametres: true };
const medecin = (nom) => ({ role: "medecin", actif: true, nom, tousEtablissements: true, etablissements: [], droits: TOUS });
const secretaire = (nom) => ({ role: "assistante", actif: true, nom, tousEtablissements: true, etablissements: [], droits: { identite: true, rendezvous: true } });

async function preparer() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, A), { titulaire: "RITA" });
    await setDoc(doc(db, A + "/membres/RITA"), medecin("Dr Bentahila"));
    await setDoc(doc(db, A + "/membres/SECA"), secretaire("Sec A"));
    await setDoc(doc(db, A + "/patients/pa"), { identite: { nom: "PATIENT A" }, etablissementId: "HGC", version: 1 });
    await setDoc(doc(db, B), { nom: "Cabinet B", titulaire: "DRB" });
    await setDoc(doc(db, B + "/membres/DRB"), medecin("Dr B"));
    await setDoc(doc(db, B + "/membres/SECB"), secretaire("Sec B"));
    await setDoc(doc(db, B + "/patients/pb"), { identite: { nom: "PATIENT B" }, etablissementId: "CLB", version: 1 });
    await setDoc(doc(db, B + "/parametres/listes"), { data: "{}" });
    await setDoc(doc(db, B + "/protocoles/lib_0"), { data: "[]" });
    await setDoc(doc(db, B + "/consultations/c1"), { patientId: "pb", etablissementId: "CLB" });
    await setDoc(doc(db, B + "/finances/tarifs"), { data: "{}" });
    await setDoc(doc(db, "administrateurs/ADM"), { email: "admin@onco360.test" });
    await setDoc(doc(db, "comptes/DRB"), { espace: "cab-autre" });
    for (const u of ["RITA", "SECA", "DRB"]) await setDoc(doc(db, "utilisateurs/" + u), { nom: u });
    // SEC2 : secrétaire des deux cabinets (19.2) ; SEC2X : retirée du cabinet B (plus de fiche de membre)
    await setDoc(doc(db, A + "/membres/SEC2"), Object.assign(secretaire("Sec deux cabinets"), { droits: { identite: true, fichePatient: true, rendezvous: true, consultations: true, ecrireConsultations: true, planningChimio: true, traitements: "voir", radiotherapie: "aucun", documents: true, administrer: false, encaissements: true, creerPatient: true, supprimerPatient: false, finances: false, parametres: false, secretariat: true } }));
    await setDoc(doc(db, B + "/membres/SEC2"), secretaire("Sec deux cabinets"));
    await setDoc(doc(db, "comptes/SEC2"), { espace: "cabinet-bentahila", espaces: ["cabinet-bentahila", "cab-autre"] });
    await setDoc(doc(db, "espaces/cab-trois"), { nom: "Cabinet C", titulaire: "DRC" });
    await setDoc(doc(db, "espaces/cab-trois/patients/pc"), { identite: { nom: "PATIENT C" }, etablissementId: "X", version: 1 });
  });
}
const db = (u) => env.authenticatedContext(u, u === "RITA" ? { email: "ritabentahila@gmail.com" } : { email: u.toLowerCase() + "@test.ma" }).firestore();
let ok = 0, ko = 0;
async function cas(nom, f) { await preparer(); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }

console.log("Chaque cabinet voit les siens");
await cas("le médecin B lit son patient", () => assertSucceeds(getDoc(doc(db("DRB"), B + "/patients/pb"))));
await cas("Dr Bentahila lit son patient", () => assertSucceeds(getDoc(doc(db("RITA"), A + "/patients/pa"))));
console.log("Secrétaire de deux cabinets (19.2)");
await cas("elle lit un patient du cabinet A", () => assertSucceeds(getDoc(doc(db("SEC2"), A + "/patients/pa"))));
await cas("elle lit un patient du cabinet B", () => assertSucceeds(getDoc(doc(db("SEC2"), B + "/patients/pb"))));
await cas("elle lit le nom de ses deux cabinets (menu « Cabinet »)", async () => { await assertSucceeds(getDoc(doc(db("SEC2"), A))); await assertSucceeds(getDoc(doc(db("SEC2"), B))); });
await cas("elle lit sa fiche comptes (liste de ses cabinets)", () => assertSucceeds(getDoc(doc(db("SEC2"), "comptes/SEC2"))));
await cas("refusé : elle modifie sa liste de cabinets", () => assertFails(setDoc(doc(db("SEC2"), "comptes/SEC2"), { espace: "cab-trois", espaces: ["cab-trois"] })));
await cas("refusé : elle lit un patient d'un troisième cabinet", () => assertFails(getDoc(doc(db("SEC2"), "espaces/cab-trois/patients/pc"))));
await cas("refusé : le médecin B lit la fiche comptes de sa secrétaire", () => assertFails(getDoc(doc(db("DRB"), "comptes/SEC2"))));
await cas("retirée du cabinet B : plus rien de B", async () => { await env.withSecurityRulesDisabled((c) => deleteDoc(doc(c.firestore(), B + "/membres/SEC2"))); await assertFails(getDoc(doc(db("SEC2"), B + "/patients/pb"))); await assertSucceeds(getDoc(doc(db("SEC2"), A + "/patients/pa"))); });
await cas("rappel WhatsApp noté envoyé dans le dossier (droit rendez-vous, 19.4)", () => assertSucceeds(updateDoc(doc(db("SEC2"), A + "/patients/pa"), { rappels: { "2026-10-12|suivi": { le: "x", par: "SEC2", nom: "Sec" } }, version: 2, maj: serverTimestamp(), majPar: "SEC2" })));
await cas("refusé : rappels écrits sans le droit rendez-vous (médecin B hors cabinet)", () => assertFails(updateDoc(doc(db("DRB"), A + "/patients/pa"), { rappels: {}, version: 2, maj: serverTimestamp(), majPar: "DRB" })));
await cas("elle écrit ses couleurs Google Agenda personnelles", () => assertSucceeds(setDoc(doc(db("SEC2"), "utilisateurs/SEC2"), { agendaCouleurs: { chimio: "11" } }, { merge: true })));
console.log("Étanchéité");
await cas("refusé : le médecin B lit un patient de Dr Bentahila", () => assertFails(getDoc(doc(db("DRB"), A + "/patients/pa"))));
await cas("refusé : le médecin B liste les patients de Dr Bentahila", () => assertFails(getDocs(collection(db("DRB"), A + "/patients"))));
await cas("refusé : la secrétaire B lit les membres de Dr Bentahila", () => assertFails(getDocs(collection(db("SECB"), A + "/membres"))));
await cas("refusé : le médecin B écrit un patient chez Dr Bentahila", () => assertFails(setDoc(doc(db("DRB"), A + "/patients/x"), { identite: {}, etablissementId: "HGC", version: 1 })));
await cas("refusé : le médecin B s'ajoute membre chez Dr Bentahila", () => assertFails(setDoc(doc(db("DRB"), A + "/membres/DRB"), medecin("Dr B"))));
await cas("refusé : Dr Bentahila lit un patient du cabinet B", () => assertFails(getDoc(doc(db("RITA"), B + "/patients/pb"))));
await cas("refusé : Dr Bentahila lit une consultation du cabinet B", () => assertFails(getDoc(doc(db("RITA"), B + "/consultations/c1"))));
await cas("refusé : Dr Bentahila lit les listes / protocoles / tarifs du cabinet B", async () => { await assertFails(getDoc(doc(db("RITA"), B + "/parametres/listes"))); await assertFails(getDoc(doc(db("RITA"), B + "/protocoles/lib_0"))); await assertFails(getDoc(doc(db("RITA"), B + "/finances/tarifs"))); });
await cas("refusé : Dr Bentahila s'ajoute membre du cabinet B", () => assertFails(setDoc(doc(db("RITA"), B + "/membres/RITA"), medecin("Dr Bentahila"))));
await cas("refusé : Dr Bentahila modifie la fiche du cabinet B", () => assertFails(updateDoc(doc(db("RITA"), B), { titulaire: "RITA" })));
await cas("refusé : la secrétaire de Dr Bentahila lit le cabinet B", () => assertFails(getDoc(doc(db("SECA"), B + "/patients/pb"))));
console.log("Compte d'administration");
await cas("refusé : l'administration lit un patient (B ou Dr Bentahila)", async () => { await assertFails(getDoc(doc(db("ADM"), B + "/patients/pb"))); await assertFails(getDoc(doc(db("ADM"), A + "/patients/pa"))); });
await cas("refusé : l'administration lit les membres ou la fiche d'un cabinet", async () => { await assertFails(getDocs(collection(db("ADM"), B + "/membres"))); await assertFails(getDoc(doc(db("ADM"), B))); });
await cas("refusé : l'administration s'ajoute membre d'un cabinet", async () => { await assertFails(setDoc(doc(db("ADM"), B + "/membres/ADM"), medecin("Admin"))); await assertFails(setDoc(doc(db("ADM"), A + "/membres/ADM"), medecin("Admin"))); });
await cas("refusé : l'administration crée un cabinet à la main", () => assertFails(setDoc(doc(db("ADM"), "espaces/cab-nouveau"), { titulaire: "ADM" })));
await cas("l'administration lit sa propre fiche administrateurs", () => assertSucceeds(getDoc(doc(db("ADM"), "administrateurs/ADM"))));
await cas("refusé : l'administration lit le profil de Dr Bentahila ou d'un membre", async () => { await assertFails(getDoc(doc(db("ADM"), "utilisateurs/RITA"))); await assertFails(getDoc(doc(db("ADM"), "utilisateurs/DRB"))); });
await cas("refusé : l'administration modifie un profil", () => assertFails(setDoc(doc(db("ADM"), "utilisateurs/RITA"), { nom: "X" }, { merge: true })));
await cas("refusé : l'administration ajoute un administrateur", () => assertFails(setDoc(doc(db("ADM"), "administrateurs/X"), { email: "x@y.ma" })));
await cas("Dr Bentahila lit et complète le profil d'un membre de son équipe (inchangé)", async () => { await assertSucceeds(getDoc(doc(db("RITA"), "utilisateurs/SECA"))); await assertSucceeds(setDoc(doc(db("RITA"), "utilisateurs/SECA"), { nom: "A" }, { merge: true })); });
await cas("chacun lit et modifie son profil", async () => { await assertSucceeds(getDoc(doc(db("DRB"), "utilisateurs/DRB"))); await assertSucceeds(setDoc(doc(db("DRB"), "utilisateurs/DRB"), { nom: "B" }, { merge: true })); });
await cas("refusé : un membre lit le profil d'un autre", () => assertFails(getDoc(doc(db("SECB"), "utilisateurs/DRB"))));
console.log("Dr Bentahila dans son cabinet (inchangé)");
await cas("Dr Bentahila complète ses propres droits (mises à niveau)", () => assertSucceeds(updateDoc(doc(db("RITA"), A + "/membres/RITA"), { "droits.documents": true })));
await cas("refusé : un titulaire de cabinet neuf modifie ses propres droits", () => assertFails(updateDoc(doc(db("DRB"), B + "/membres/DRB"), { "droits.documents": false })));
// 1.3 (11/10/2026) : un nouveau membre est créé par le serveur seulement (fonction creerMembre), plus depuis le navigateur
await cas("refusé : le titulaire B crée lui-même une fiche de membre (passe par le serveur)", () => assertFails(setDoc(doc(db("DRB"), B + "/membres/NOUV"), secretaire("Nouvelle"))));
await cas("refusé : le titulaire B ajoute quelqu'un chez Dr Bentahila", () => assertFails(setDoc(doc(db("DRB"), A + "/membres/NOUV"), secretaire("Nouvelle"))));
console.log("Cabinet suspendu");
const suspendre = () => env.withSecurityRulesDisabled((c) => updateDoc(doc(c.firestore(), B), { actif: false }));
await cas("refusé : le médecin d'un cabinet suspendu lit un patient", async () => { await suspendre(); await assertFails(getDoc(doc(db("DRB"), B + "/patients/pb"))); });
await cas("refusé : la secrétaire d'un cabinet suspendu lit les membres / écrit", async () => { await suspendre(); await assertFails(getDocs(collection(db("SECB"), B + "/membres"))); await assertFails(setDoc(doc(db("SECB"), B + "/patients/x"), { identite: {}, etablissementId: "CLB", version: 1 })); });
await cas("le membre d'un cabinet suspendu lit encore la fiche du cabinet (message)", async () => { await suspendre(); await assertSucceeds(getDoc(doc(db("DRB"), B))); });
await cas("refusé : un non-membre lit la fiche d'un cabinet", () => assertFails(getDoc(doc(db("SECA"), B))));
await cas("refusé : le titulaire réactive lui-même son cabinet", async () => { await suspendre(); await assertFails(updateDoc(doc(db("DRB"), B), { actif: true })); });
await cas("cabinet sans champ actif (Dr Bentahila) : accès normal", () => assertSucceeds(getDoc(doc(db("SECA"), A + "/patients/pa"))));
console.log("comptes/{uid}");
await cas("chacun lit son cabinet", () => assertSucceeds(getDoc(doc(db("DRB"), "comptes/DRB"))));
await cas("refusé : lire le cabinet d'un autre compte", () => assertFails(getDoc(doc(db("SECB"), "comptes/DRB"))));
await cas("refusé : changer soi-même de cabinet", async () => { await assertFails(setDoc(doc(db("DRB"), "comptes/DRB"), { espace: "cabinet-bentahila" })); await assertFails(setDoc(doc(db("SECB"), "comptes/SECB"), { espace: "cab-autre" })); });
await cas("refusé : l'administration écrit un compte", () => assertFails(setDoc(doc(db("ADM"), "comptes/X"), { espace: "cab-autre" })));
await cas("refusé : supprimer son rattachement", () => assertFails(deleteDoc(doc(db("DRB"), "comptes/DRB"))));

console.log("Abonnements (facturation/{e}, 17.4) : serveur seulement");
const fact = async () => env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), "facturation/cab-autre"), { mode: "mensuel", prix: 900 }); });
await cas("le titulaire d'un cabinet ne lit pas son abonnement", async () => { await fact(); await assertFails(getDoc(doc(db("DRB"), "facturation/cab-autre"))); });
await cas("ni ne l'écrit (prix, échéance)", async () => { await assertFails(setDoc(doc(db("DRB"), "facturation/cab-autre"), { mode: "gratuit" })); });
await cas("Dr Bentahila ne lit pas l'abonnement d'un autre cabinet", async () => { await fact(); await assertFails(getDoc(doc(db("RITA"), "facturation/cab-autre"))); });
await cas("le compte d'administration non plus depuis le navigateur (fonction serveur)", async () => { await fact(); await assertFails(getDoc(doc(db("ADM"), "facturation/cab-autre"))); });
console.log("Journal de l'Administration (journalAdmin, 17.5) : serveur seulement");
await cas("un cabinet ne lit pas le journal de l'administration", async () => { await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), "journalAdmin/j1"), { type: "suspension", espace: "cab-autre" }); }); await assertFails(getDoc(doc(db("DRB"), "journalAdmin/j1"))); await assertFails(getDocs(collection(db("RITA"), "journalAdmin"))); });
await cas("personne n'y écrit depuis le navigateur (pas même l'administration)", async () => { await assertFails(setDoc(doc(db("ADM"), "journalAdmin/j2"), { type: "creation" })); await assertFails(setDoc(doc(db("RITA"), "journalAdmin/j3"), { type: "creation" })); });
console.log("Factures (factures, plateforme/editeur, compteurs/factures, 18.4) : serveur seulement");
await cas("un cabinet ne lit ni ses factures ni celles des autres depuis le navigateur", async () => { await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), "factures/f1"), { numero: "F-2026-0001", espace: "cab-autre" }); await setDoc(doc(c.firestore(), "plateforme/editeur"), { raison: "X" }); }); await assertFails(getDoc(doc(db("DRB"), "factures/f1"))); await assertFails(getDocs(collection(db("RITA"), "factures"))); await assertFails(getDoc(doc(db("DRB"), "plateforme/editeur"))); });
await cas("personne ne crée de facture ni ne change le compteur depuis le navigateur", async () => { await assertFails(setDoc(doc(db("ADM"), "factures/f9"), { numero: "F-2026-0009" })); await assertFails(setDoc(doc(db("RITA"), "compteurs/factures"), { "F-2026": 0 })); });
console.log("\n" + ok + " réussis, " + ko + " échoués");
await env.cleanup();
if (ko) process.exit(1);
