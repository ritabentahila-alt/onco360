// Lot C (25/10/2026) : médecin remplaçant. Mêmes droits et établissements que le titulaire (recopiés par le serveur), agit comme un
// médecin (consultations, bibliothèques, protocoles, tâches de tous) ; n'entre que pendant sa période (remplaceDebMs / remplaceFinMs) ;
// ne gère pas l'équipe ; ne publie pas de carte de signataire (il signe au nom du titulaire). Lancé par « npm test ».
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, setLogLevel } from "firebase/firestore";
setLogLevel("silent");

const P = "espaces/cabinet-test";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const DROITS = { identite: true, fichePatient: true, creerPatient: true, rendezvous: true, traitements: "modifier", radiotherapie: "modifier", ecrireConsultations: true, documents: true, parametres: true, finances: true };
const JOUR = 86400000, now = Date.now();
const membre = (role, o = {}) => Object.assign({ role, actif: true, nom: role, tousEtablissements: false, etablissements: ["HGC"], droits: Object.assign({}, DROITS) }, o);
const rem = (deb, fin) => membre("remplacant", { remplace: "MED", remplaceDebMs: deb, remplaceFinMs: fin });
const db = (u) => env.authenticatedContext(u, { email: u.toLowerCase() + "@test.ma" }).firestore();
const D = (u, ch) => doc(db(u), P + "/" + ch);
const ent = (par, txt) => ({ le: "2026-10-25T10:00:00Z", par, parNom: par, txt });
const tache = (de, pour) => ({ titre: "Tâche", desc: "", type: "", urgent: false, ech: "", h: "", patientId: "", patientNom: "", etablissementId: "", de, deNom: de, pour, pourNom: pour, qui: [de, pour], statut: "afaire", fil: [ent(de, "Créée")], o: 1, majPar: de });
const cons = (par, etab = "HGC") => ({ patientId: "p1", etablissementId: etab, d: "2026-10-25", titre: "Consultation", note: "", lignes: [], o: 1, creePar: par, creeParNom: "Dr Titulaire", majPar: par, majParNom: "Dr Titulaire" });

async function preparer(r) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const f = c.firestore();
    await setDoc(doc(f, P), { titulaire: "MED" });
    await setDoc(doc(f, P + "/membres/MED"), membre("medecin"));
    await setDoc(doc(f, P + "/membres/SEC"), membre("assistante", { droits: { ecrireConsultations: true, rendezvous: true } }));
    await setDoc(doc(f, P + "/membres/REM"), r);
    await setDoc(doc(f, P + "/patients/p1"), { etablissementId: "HGC", identite: { nom: "TEST" }, version: 1 });
    await setDoc(doc(f, P + "/patients/p2"), { etablissementId: "HCK", identite: { nom: "AUTRE" }, version: 1 });
    await setDoc(doc(f, P + "/consultations/cMed"), cons("MED"));
    await setDoc(doc(f, P + "/taches/t1"), tache("MED", "SEC"));
  });
}
let ok = 0, ko = 0;
async function cas(nom, f, r = rem(0, 0)) { await preparer(r); try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); } }

console.log("Remplaçant sans limite : agit comme le médecin, dans le périmètre du titulaire");
await cas("lit un dossier de ses établissements", () => assertSucceeds(getDoc(D("REM", "patients/p1"))));
await cas("refusé : dossier d'un autre établissement que ceux du titulaire", () => assertFails(getDoc(D("REM", "patients/p2"))));
await cas("écrit une consultation (signée de son identifiant, au nom du titulaire)", () => assertSucceeds(setDoc(D("REM", "consultations/c1"), cons("REM"))));
await cas("supprime une consultation du titulaire (comme un médecin)", () => assertSucceeds(deleteDoc(D("REM", "consultations/cMed"))));
await cas("refusé à la secrétaire : supprimer une consultation du médecin", () => assertFails(deleteDoc(D("SEC", "consultations/cMed"))));
await cas("modifie les bibliothèques de prescription et les protocoles", async () => {
  await assertSucceeds(setDoc(D("REM", "bibliotheques/medicaments"), { data: "[]" })); await assertSucceeds(setDoc(D("REM", "protocoles/lib_perso"), { data: "[]" })); });
await cas("voit toutes les tâches de l'équipe (comme un médecin)", () => assertSucceeds(getDoc(D("REM", "taches/t1"))));
await cas("refusé : gérer l'équipe (fiche d'un membre)", () => assertFails(updateDoc(D("REM", "membres/SEC"), { "droits.documents": false })));
await cas("refusé : changer ses propres droits ou sa période", () => assertFails(updateDoc(D("REM", "membres/REM"), { remplaceFinMs: 0 })));
await cas("refusé : publier sa carte de signataire (il signe au nom du titulaire)", () => assertFails(setDoc(D("REM", "signataires/REM"), { nom: "Dr R" })));

console.log("Période de remplacement");
await cas("pendant la période : entre", () => assertSucceeds(getDoc(D("REM", "patients/p1"))), rem(now - JOUR, now + JOUR));
await cas("refusé avant le début", async () => { await assertFails(getDoc(D("REM", "patients/p1"))); await assertFails(setDoc(D("REM", "consultations/c1"), cons("REM"))); }, rem(now + JOUR, now + 10 * JOUR));
await cas("refusé après la fin (dossiers, consultations, tâches, équipe)", async () => {
  await assertFails(getDoc(D("REM", "patients/p1"))); await assertFails(setDoc(D("REM", "consultations/c1"), cons("REM")));
  await assertFails(getDoc(D("REM", "taches/t1"))); await assertFails(getDoc(D("REM", "membres/MED"))); }, rem(now - 10 * JOUR, now - JOUR));
await cas("après la fin : lit encore sa propre fiche (message clair à l'ouverture)", () => assertSucceeds(getDoc(D("REM", "membres/REM"))), rem(now - 10 * JOUR, now - JOUR));
await cas("refusé : lire la fiche d'un autre membre sans être membre", () => assertFails(getDoc(D("AUTRE", "membres/REM"))));
await cas("accès désactivé à la main : refusé, même dans la période", () => assertFails(getDoc(D("REM", "patients/p1"))), Object.assign(rem(0, 0), { actif: false }));

console.log((ko ? "✘ " : "✔ ") + ok + " réussis, " + ko + " échoués");
await env.cleanup();
process.exit(ko ? 1 : 0);
