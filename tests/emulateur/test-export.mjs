// Export complet du cabinet (étape 1.6, 11/10/2026), de bout en bout sur les émulateurs Firebase (aucune donnée réelle) :
//   cd tests/regles && npm run export     (lance les émulateurs auth, firestore, storage, functions, puis ce script)
import { createRequire } from "node:module";
const reqF = createRequire(new URL("../../functions/package.json", import.meta.url));
const reqR = createRequire(new URL("../regles/package.json", import.meta.url));
const admin = reqF("firebase-admin"), JSZip = reqF("jszip");
const { initializeApp } = reqR("firebase/app"), { getAuth, connectAuthEmulator, signInWithEmailAndPassword } = reqR("firebase/auth");
const { getFunctions, connectFunctionsEmulator, httpsCallable } = reqR("firebase/functions");

const PROJ = "demo-onco360", BUCKET = PROJ + ".appspot.com", E = "espaces/cab-test";
admin.initializeApp({ projectId: PROJ, storageBucket: BUCKET });
const db = admin.firestore(), bucket = admin.storage().bucket();
let ok = 0, ko = 0; const cas = (n, v, d) => { if (v) { ok++; console.log("  ✔ " + n); } else { ko++; console.log("  ✘ " + n + (d === undefined ? "" : " " + JSON.stringify(d).slice(0, 300))); } };

// Cabinet fictif
for (const [uid, email] of [["MED", "med@test.ma"], ["SEC", "sec@test.ma"]]) await admin.auth().createUser({ uid, email, password: "motdepasse-test" }).catch(() => {});
await db.doc(E).set({ titulaire: "MED", nom: "Cabinet Test" });
await db.doc(E + "/membres/MED").set({ role: "medecin", actif: true, nom: "Dr Test", tousEtablissements: true, etablissements: [], droits: {} });
await db.doc(E + "/membres/SEC").set({ role: "assistante", actif: true, nom: "Secrétaire Test", tousEtablissements: true, etablissements: [], droits: {} });
await db.doc("utilisateurs/MED").set({ nom: "Dr Test", inpe: "000" });
await db.doc(E + "/etablissements/HGC").set({ nom: "Hôpital Test" });
await db.doc(E + "/patients/P1").set({ identite: { numero: "202610001", nomF: "PATIENT", prenom: "Test", ddn: "1960-01-01" }, clinique: { diag: "Sein" }, etablissementId: "HGC", lignesJson: "[]", version: 1, maj: admin.firestore.Timestamp.fromDate(new Date("2026-10-11T08:00:00Z")) });
await db.doc(E + "/consultations/C1").set({ patientId: "P1", etablissementId: "HGC", d: "2026-10-11", titre: "Consultation", note: "RAS" });
const PDF = Buffer.from("%PDF-1.4\n% document de test\n%%EOF\n");
await bucket.file(E + "/patients/P1/fichiers/F1/cr.pdf").save(PDF, { contentType: "application/pdf" });
await bucket.file(E + "/documentation/D1/regime.pdf").save(PDF, { contentType: "application/pdf" });
await db.doc(E + "/fichiers/F1").set({ patientId: "P1", etablissementId: "HGC", titre: "CR anapath", d: "2026-10-01", nom: "cr.pdf", chemin: E + "/patients/P1/fichiers/F1/cr.pdf" });
await db.doc(E + "/fichiers/F2").set({ patientId: "P1", etablissementId: "HGC", titre: "Perdu", d: "2026-10-02", nom: "x.pdf", chemin: E + "/patients/P1/fichiers/F2/x.pdf" });
await db.doc(E + "/bibliotheques/documentation").set({ data: JSON.stringify([{ id: "D1", titre: "Régime pelvien", chemin: E + "/documentation/D1/regime.pdf" }]) });

const app = initializeApp({ projectId: PROJ, apiKey: "cle-de-test", authDomain: PROJ + ".firebaseapp.com" });
const auth = getAuth(app); connectAuthEmulator(auth, "http://" + (process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099"), { disableWarnings: true });
const fn = getFunctions(app, "europe-west1"); const [fh, fp] = (process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001").replace(/^https?:\/\//, "").split(":"); connectFunctionsEmulator(fn, fh, +fp);
const exporter = httpsCallable(fn, "exporterCabinet", { timeout: 120000 });

console.log("Refus");
await signInWithEmailAndPassword(auth, "sec@test.ma", "motdepasse-test");
let refus = null; try { await exporter({ espace: "cab-test" }); } catch (e) { refus = e.code; }
cas("une secrétaire ne peut pas exporter le cabinet", refus === "functions/permission-denied", refus);

console.log("Export par le médecin titulaire");
await signInWithEmailAndPassword(auth, "med@test.ma", "motdepasse-test");
const r1 = (await exporter({ espace: "cab-test" })).data;
cas("réponse : 1 dossier, 1 document, 1 fiche de documentation, 1 introuvable", r1.patients === 1 && r1.fichiers === 1 && r1.documentation === 1 && r1.manquants === 1, r1);
const [buf] = await bucket.file(r1.chemin).download(), zip = await JSZip.loadAsync(buf), noms = Object.keys(zip.files);
cas("ZIP rangé dans le stockage du cabinet", r1.chemin.startsWith(E + "/exports/") && r1.chemin.endsWith(".zip"), r1.chemin);
cas("contenu : notice, tableau, données, document, documentation", ["LISEZMOI.txt", "patients.csv", "donnees/onco360.json", "fichiers/202610001 PATIENT Test/2026-10-01 CR anapath.pdf", "documentation/Régime pelvien.pdf"].every((n) => noms.includes(n)), noms);
const csv = await zip.file("patients.csv").async("string");
cas("patients.csv : en-tête et le patient, lisible par Excel (BOM, « ; »)", csv.charCodeAt(0) === 0xfeff && csv.includes("N° de dossier;Nom") && csv.includes("202610001;PATIENT;Test;PATIENT Test;1960-01-01"), csv.slice(0, 200));
const J = JSON.parse(await zip.file("donnees/onco360.json").async("string"));
cas("données : dossier, consultation, équipe, profil, dates en texte", J.collections.patients.P1.identite.numero === "202610001" && J.collections.consultations.C1.note === "RAS" && J.collections.membres.SEC && J.utilisateurs.MED.inpe === "000" && J.collections.patients.P1.maj === "2026-10-11T08:00:00.000Z", J.collections.patients.P1);
cas("document déposé identique à l'original", Buffer.compare(await zip.file("fichiers/202610001 PATIENT Test/2026-10-01 CR anapath.pdf").async("nodebuffer"), PDF) === 0);
cas("notice : le fichier introuvable est signalé", /1 fichier\(s\) introuvable/.test(await zip.file("LISEZMOI.txt").async("string")));
const h = await db.collection(E + "/historique").get();
cas("export noté dans le journal du cabinet", h.docs.some((d) => /Export complet du cabinet : 1 dossier/.test(d.data().quoi) && d.data().parUid === "MED"));

console.log("Nouvel export");
const r2 = (await exporter({ espace: "cab-test" })).data;
const [existe1] = await bucket.file(r1.chemin).exists(), [existe2] = await bucket.file(r2.chemin).exists();
cas("l'export précédent est effacé, le nouveau est là", !existe1 && existe2, { existe1, existe2 });

console.log("Restauration dans un cabinet vide (outils/restaurer-export.mjs)");
const { restaurer } = await import("../../outils/restaurer-export.mjs");
await db.doc(E + "/taches/T1").set({ titre: "Tâche", fil: [{ le: "2026-10-11T08:00:00.000Z", txt: "texte" }], ech: "2026-10-12", maj: admin.firestore.Timestamp.fromDate(new Date("2026-10-11T09:00:00Z")) });
const r3 = (await exporter({ espace: "cab-test" })).data, [zbuf] = await bucket.file(r3.chemin).download();
const bl = await restaurer(zbuf, "cab-restaure", { db, bucket, Timestamp: admin.firestore.Timestamp });
cas("restauration : documents, fichiers, profils écrits", bl.documents > 10 && bl.fichiers === 2 && bl.profils === 1, bl);
const lire = async (e) => { const o = {}; for (const c of await db.doc("espaces/" + e).listCollections()) { if (c.id === "historique") continue; o[c.id] = {}; (await c.get()).forEach((d) => { o[c.id][d.id] = d.data(); }); } return o; };
const norm = (o, e) => JSON.parse(JSON.stringify(o, (k, v) => (v && typeof v.toDate === "function" ? "DATE:" + v.toDate().toISOString() : v)).split("espaces/" + e + "/").join("espaces/X/"));
const avant = norm(await lire("cab-test"), "cab-test"), apres = norm(await lire("cab-restaure"), "cab-restaure");
cas("toutes les collections identiques (dates comprises, chemins adaptés)", JSON.stringify(avant) === JSON.stringify(apres), Object.keys(avant).filter((c) => JSON.stringify(avant[c]) !== JSON.stringify(apres[c])));
const t = (await db.doc("espaces/cab-restaure/taches/T1").get()).data();
cas("une date reste une date, un texte qui ressemble à une date reste un texte", typeof t.maj.toDate === "function" && typeof t.fil[0].le === "string", t);
const [pdfR] = await bucket.file("espaces/cab-restaure/patients/P1/fichiers/F1/cr.pdf").download();
cas("document déposé remis dans le stockage du nouveau cabinet, identique", Buffer.compare(pdfR, PDF) === 0);
const fd = (await db.doc("espaces/cab-restaure/fichiers/F1").get()).data();
cas("fiche du document : chemin adapté au nouveau cabinet", fd.chemin === "espaces/cab-restaure/patients/P1/fichiers/F1/cr.pdf", fd.chemin);

console.log("Copie de secours des fichiers (fichiersSauvegarder)");
await admin.auth().createUser({ uid: "ADM", email: "adm@test.ma", password: "motdepasse-test" }).catch(() => {});
await db.doc("administrateurs/ADM").set({ nom: "Administration" });
const sauver = httpsCallable(fn, "fichiersSauvegarder", { timeout: 120000 });
let refusS = null; try { await sauver({}); } catch (e) { refusS = e.code; }
cas("réservé à l'administration (refusé au médecin)", refusS === "functions/permission-denied", refusS);
await signInWithEmailAndPassword(auth, "adm@test.ma", "motdepasse-test");
const s1 = (await sauver({})).data, copieB = admin.storage().bucket(PROJ + "-sauvegarde-fichiers");
const [lc] = await copieB.getFiles({ prefix: "espaces/" }), nomsC = lc.map((f) => f.name);
cas("documents et documentation recopiés, exports non", nomsC.includes(E + "/patients/P1/fichiers/F1/cr.pdf") && nomsC.includes(E + "/documentation/D1/regime.pdf") && !nomsC.some((n) => n.includes("/exports/")), { s1, nomsC });
const s2 = (await sauver({})).data;
cas("nuit suivante sans changement : rien recopié", s2.copies === 0 && s2.retires === 0, s2);
await bucket.file(E + "/documentation/D1/regime.pdf").delete();
const s3 = (await sauver({})).data;
cas("fichier supprimé dans Onco360 : retiré de la copie", s3.retires === 1, s3);

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
process.exit(ko ? 1 : 0);
