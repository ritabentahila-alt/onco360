// Tests des règles de sécurité des reçus numérotés (espaces/{e}/recus et recusCompteur, SA9c 11/10/2026) sur l'émulateur Firestore.
// Lancer (Java 21 nécessaire) :  cd tests/regles && npm test
// Comptes : MED (médecin, finances, tous établissements), SEC (secrétaire HGC, encaissements), INF (infirmière HGC, sans prix),
// SECK (secrétaire HCK), CPT (comptable, finances), OFF (désactivé).
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp, setLogLevel } from "firebase/firestore";
import { recuAEcrire, numeroRecu } from "../../public/js/moteur/recus.js";
setLogLevel("silent");

const E = "cabinet-test", P = "espaces/" + E, AN = "2026";
const env = await initializeTestEnvironment({ projectId: "demo-onco360", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
const membre = (role, etabs, droits, actif = true) => ({ role, actif, nom: role, tousEtablissements: etabs === "*", etablissements: etabs === "*" ? [] : etabs, droits });

async function preparer(avecRecu) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, P), { titulaire: "MED" });
    for (const [u, r, e, d, a] of [["MED", "medecin", "*", { finances: true }], ["SEC", "assistante", ["HGC"], { encaissements: true }], ["INF", "infirmiere", ["HGC"], {}],
      ["SECK", "assistante", ["HCK"], { encaissements: true }], ["CPT", "comptable", "*", { finances: true }], ["OFF", "assistante", "*", { encaissements: true }, false]])
      await setDoc(doc(db, P + "/membres/" + u), membre(r, e, d, a !== false));
    if (avecRecu) {
      await setDoc(doc(db, P + "/recusCompteur/" + AN), { n: 1, majPar: "MED" });
      await setDoc(doc(db, P + "/recus/p1_r-a"), recuAEcrire(null, base("MED"), 1));
    }
  });
}
const base = (par, o = {}) => Object.assign({ pid: "p1", nom: "Patient Un", etab: "HGC", cle: "r-a", d: "2026-10-08", lib: "Consultation", m: 300, mode: "esp", annee: AN, par, parNom: par, le: 1 }, o);
const db = (u) => env.authenticatedContext(u).firestore();
const R = (u, id = "p1_r-a") => doc(db(u), P + "/recus/" + id);
const C = (u, a = AN) => doc(db(u), P + "/recusCompteur/" + a);
// Ce que fait Onco360 (v2.js numeroterRecu) : lecture du reçu et du compteur, puis écriture des deux dans la même transaction
async function imprimer(u, o = {}, triche = {}) {
  const d = db(u);
  return runTransaction(d, async (tr) => {
    const id = (o.pid || "p1") + "_" + (o.cle || "r-a"), a = await tr.get(doc(d, P + "/recus/" + id)), ancien = a.exists() ? a.data() : null;
    const c = await tr.get(doc(d, P + "/recusCompteur/" + AN)), n = (c.exists() ? c.data().n : 0) + 1 + (triche.saut || 0);
    if (!triche.sansCompteur) tr.set(doc(d, P + "/recusCompteur/" + AN), { n, majPar: u });
    tr.set(doc(d, P + "/recus/" + id), Object.assign(recuAEcrire(ancien, base(u, o), n + (triche.decale || 0)), { le: serverTimestamp() }));
  });
}

let ok = 0, ko = 0;
async function cas(nom, f, avecRecu = false) {
  await preparer(avecRecu);
  try { await f(); ok++; console.log("  ✔ " + nom); } catch (e) { ko++; console.log("  ✘ " + nom + "\n      " + (e && e.message ? e.message.split("\n")[0] : e)); }
}

console.log("Premier reçu");
await cas("le médecin imprime un reçu : n° 1 de l'année", async () => { await assertSucceeds(imprimer("MED")); const s = await getDoc(R("MED")); if (s.data().numero !== numeroRecu(AN, 1)) throw new Error(s.data().numero); });
await cas("la secrétaire HGC imprime le reçu d'un patient HGC", () => assertSucceeds(imprimer("SEC")));
await cas("refusé : la secrétaire HCK pour un patient HGC", () => assertFails(imprimer("SECK")));
await cas("refusé : l'infirmière (sans droit de prix)", () => assertFails(imprimer("INF")));
await cas("refusé : le comptable (lecture des finances seulement)", () => assertFails(imprimer("CPT")));
await cas("refusé : accès désactivé", () => assertFails(imprimer("OFF")));
await cas("refusé : numéro qui ne suit pas le compteur", () => assertFails(imprimer("MED", {}, { decale: 1 })));
await cas("refusé : compteur qui saute un numéro", () => assertFails(imprimer("MED", {}, { saut: 1 })));
await cas("refusé : numéro sans passer par le compteur", () => assertFails(imprimer("MED", {}, { sansCompteur: true })));
await cas("refusé : reçu signé au nom d'un autre", () => assertFails(setDoc(R("SEC"), Object.assign(recuAEcrire(null, base("MED"), 1)))));

console.log("Réimpression et nouveau numéro");
await cas("deuxième patient : n° 2", async () => { await assertSucceeds(imprimer("SEC", { pid: "p2", cle: "r-b" })); const s = await getDoc(R("MED", "p2_r-b")); if (s.data().n !== 2) throw new Error(s.data().n); }, true);
await cas("duplicata : même numéro, compteur inchangé", async () => {
  await assertSucceeds(updateDoc(R("SEC"), { imp: 2, dernier: 2, dernierPar: "SEC", dernierNom: "SEC" }));
  const c = await getDoc(C("MED")); if (c.data().n !== 1) throw new Error("compteur " + c.data().n);
}, true);
await cas("refusé : duplicata qui change le montant", () => assertFails(updateDoc(R("SEC"), { imp: 2, m: 250, dernierPar: "SEC" })), true);
await cas("montant changé : nouveau numéro, l'ancien annulé", async () => {
  await assertSucceeds(imprimer("SEC", { m: 250 }));
  const s = (await getDoc(R("MED"))).data(); if (s.n !== 2 || s.annules.length !== 1 || s.annules[0].numero !== numeroRecu(AN, 1)) throw new Error(JSON.stringify(s));
}, true);
await cas("refusé : nouveau numéro qui efface les numéros annulés", () => { const d = db("SEC"); return assertFails(runTransaction(d, async (tr) => {
  tr.set(doc(d, P + "/recusCompteur/" + AN), { n: 2, majPar: "SEC" }); tr.set(doc(d, P + "/recus/p1_r-a"), recuAEcrire(null, base("SEC", { m: 250 }), 2));
})); }, true);
await cas("refusé : supprimer un reçu", () => assertFails(deleteDoc(R("MED"))), true);
await cas("refusé : remettre le compteur à zéro", () => assertFails(setDoc(C("MED"), { n: 0, majPar: "MED" })), true);
await cas("refusé : supprimer le compteur", () => assertFails(deleteDoc(C("MED"))), true);

console.log("Lecture");
await cas("la secrétaire HGC lit le reçu", () => assertSucceeds(getDoc(R("SEC"))), true);
await cas("refusé : la secrétaire HCK lit un reçu HGC", () => assertFails(getDoc(R("SECK"))), true);
await cas("refusé : l'infirmière lit un reçu", () => assertFails(getDoc(R("INF"))), true);

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
await env.cleanup();
process.exit(ko ? 1 : 0);
