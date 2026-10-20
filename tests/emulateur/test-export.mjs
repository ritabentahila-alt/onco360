// Export complet du cabinet (étape 1.6, 11/10/2026) et lot R-F (audit n° 8, 20/10/2026 : export au fil de l'eau, export de la semaine,
// restauration sûre, récupération d'un dossier / d'un document / du cabinet, copie des fichiers surveillée), de bout en bout sur les
// émulateurs Firebase (aucune donnée réelle) :
//   cd tests/regles && npm run export     (lance les émulateurs auth, firestore, storage, functions, puis ce script)
import { createRequire } from "node:module";
import zlib from "node:zlib";
import { readdirSync, unlinkSync } from "node:fs";
const reqF = createRequire(new URL("../../functions/package.json", import.meta.url));
const reqR = createRequire(new URL("../regles/package.json", import.meta.url));
const admin = reqF("firebase-admin"), JSZip = reqF("jszip");
const { initializeApp } = reqR("firebase/app"), { getAuth, connectAuthEmulator, signInWithEmailAndPassword } = reqR("firebase/auth");
const { getFunctions, connectFunctionsEmulator, httpsCallable } = reqR("firebase/functions");

const PROJ = "demo-onco360", BUCKET = PROJ + ".appspot.com", E = "espaces/cab-test";
admin.initializeApp({ projectId: PROJ, storageBucket: BUCKET });
const db = admin.firestore(), bucket = admin.storage().bucket(), TS = admin.firestore.Timestamp;
let ok = 0, ko = 0; const cas = (n, v, d) => { if (v) { ok++; console.log("  ✔ " + n); } else { ko++; console.log("  ✘ " + n + (d === undefined ? "" : " " + JSON.stringify(d).slice(0, 400))); } };
const lireDoc = async (ch) => { const s = await db.doc(ch).get(); return s.exists ? s.data() : null; };

// Cabinet fictif
for (const [uid, email] of [["MED", "med@test.ma"], ["SEC", "sec@test.ma"]]) await admin.auth().createUser({ uid, email, password: "motdepasse-test" }).catch(() => {});
await db.doc(E).set({ titulaire: "MED", nom: "Cabinet Test" });
await db.doc(E + "/membres/MED").set({ role: "medecin", actif: true, nom: "Dr Test", tousEtablissements: true, etablissements: [], droits: {} });
await db.doc(E + "/membres/SEC").set({ role: "assistante", actif: true, nom: "Secrétaire Test", tousEtablissements: true, etablissements: [], droits: {} });
await db.doc("comptes/SEC").set({ espace: "cab-test", espaces: ["cab-test"] });
await db.doc("utilisateurs/MED").set({ nom: "Dr Test", inpe: "000" });
await db.doc(E + "/etablissements/HGC").set({ nom: "Hôpital Test" });
await db.doc(E + "/patients/P1").set({ identite: { numero: "202610001", nomF: "PATIENT", prenom: "Test", ddn: "1960-01-01", tel: "0600000001" }, clinique: { diag: "Sein" }, etablissementId: "HGC", lignesJson: "[]", version: 1, maj: TS.fromDate(new Date("2026-10-11T08:00:00Z")) });
await db.doc(E + "/consultations/C1").set({ patientId: "P1", etablissementId: "HGC", d: "2026-10-11", titre: "Consultation", note: "RAS" });
await db.doc(E + "/taches/T0").set({ titre: "Rappeler", patientId: "P1", statut: "afaire" });
await db.doc(E + "/recus/R1").set({ patientId: "P1", numero: "R-2026-0001", m: 300, annules: [] });
await db.doc(E + "/parametres/listes").set({ data: JSON.stringify({ mut: ["CNSS", "CNOPS"] }) });
const PDF = Buffer.from("%PDF-1.4\n% document de test\n%%EOF\n"), JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
await bucket.file(E + "/patients/P1/fichiers/F1/cr.pdf").save(PDF, { contentType: "application/pdf" });
await bucket.file(E + "/patients/P1/fichiers/F3/photo.jpg").save(JPG, { contentType: "image/jpeg" });
await bucket.file(E + "/documentation/D1/regime.pdf").save(PDF, { contentType: "application/pdf" });
await db.doc(E + "/fichiers/F1").set({ patientId: "P1", etablissementId: "HGC", titre: "CR anapath", d: "2026-10-01", nom: "cr.pdf", chemin: E + "/patients/P1/fichiers/F1/cr.pdf" });
await db.doc(E + "/fichiers/F2").set({ patientId: "P1", etablissementId: "HGC", titre: "Perdu", d: "2026-10-02", nom: "x.pdf", chemin: E + "/patients/P1/fichiers/F2/x.pdf" });
await db.doc(E + "/fichiers/F3").set({ patientId: "P1", etablissementId: "HGC", titre: "Photo", d: "2026-09-01", nom: "photo.jpg", chemin: E + "/patients/P1/fichiers/F3/photo.jpg" });
await db.doc(E + "/bibliotheques/documentation").set({ data: JSON.stringify([{ id: "D1", titre: "Régime pelvien", chemin: E + "/documentation/D1/regime.pdf" }]) });

const app = initializeApp({ projectId: PROJ, apiKey: "cle-de-test", authDomain: PROJ + ".firebaseapp.com" });
const auth = getAuth(app); connectAuthEmulator(auth, "http://" + (process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099"), { disableWarnings: true });
const fn = getFunctions(app, "europe-west1"); const [fh, fp] = (process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001").replace(/^https?:\/\//, "").split(":"); connectFunctionsEmulator(fn, fh, +fp);
const appeler = (nom) => httpsCallable(fn, nom, { timeout: 300000 });
const exporter = appeler("exporterCabinet"), recup = appeler("recuperation"), auto = appeler("exportAuto"), sauver = appeler("fichiersSauvegarder"), etatSv = appeler("sauvegardesEtat");
const refus = async (f, d) => { try { await f(d); return "accepté"; } catch (e) { return e.code; } };
const connecter = (m) => signInWithEmailAndPassword(auth, m, "motdepasse-test");

console.log("Refus");
await connecter("sec@test.ma");
cas("une secrétaire ne peut pas exporter le cabinet", (await refus(exporter, { espace: "cab-test" })) === "functions/permission-denied");
cas("ni récupérer un dossier", (await refus(recup, { espace: "cab-test", action: "sources" })) === "functions/permission-denied");
cas("ni régler l'export de la semaine", (await refus(auto, { espace: "cab-test", action: "etat" })) === "functions/permission-denied");

console.log("Export par le médecin titulaire");
await connecter("med@test.ma");
const r1 = (await exporter({ espace: "cab-test" })).data;
cas("réponse : 1 dossier, 2 documents, 1 fiche de documentation, 1 introuvable", r1.patients === 1 && r1.fichiers === 2 && r1.documentation === 1 && r1.manquants === 1, r1);
const [buf] = await bucket.file(r1.chemin).download(), zip = await JSZip.loadAsync(buf), noms = Object.keys(zip.files);
cas("ZIP rangé dans le stockage du cabinet", r1.chemin.startsWith(E + "/exports/") && r1.chemin.endsWith(".zip"), r1.chemin);
cas("contenu : notice, tableau, données, document, documentation", ["LISEZMOI.txt", "patients.csv", "donnees/onco360.json", "fichiers/202610001 PATIENT Test/2026-10-01 CR anapath.pdf", "documentation/Régime pelvien.pdf"].every((n) => noms.includes(n)), noms);
const csv = await zip.file("patients.csv").async("string");
cas("patients.csv : en-tête et le patient, lisible par Excel (BOM, « ; »)", csv.charCodeAt(0) === 0xfeff && csv.includes("N° de dossier;Nom") && csv.includes("202610001;PATIENT;Test;PATIENT Test;1960-01-01"), csv.slice(0, 200));
cas("R-F6 : téléphone en texte pour Excel (0 du début gardé)", csv.includes(';"=""0600000001""";'), csv.split("\r\n")[1]);
cas("R-F6 : photo d'avant le 11/10 gardée en .jpg, identique", noms.includes("fichiers/202610001 PATIENT Test/2026-09-01 Photo.jpg") && Buffer.compare(await zip.file("fichiers/202610001 PATIENT Test/2026-09-01 Photo.jpg").async("nodebuffer"), JPG) === 0, noms);
const J = JSON.parse(await zip.file("donnees/onco360.json").async("string"));
cas("données : dossier, consultation, équipe, profil, dates en texte", J.collections.patients.P1.identite.numero === "202610001" && J.collections.consultations.C1.note === "RAS" && J.collections.membres.SEC && J.utilisateurs.MED.inpe === "000" && J.collections.patients.P1.maj === "2026-10-11T08:00:00.000Z", J.collections.patients.P1);
cas("R-F3 : adresse de connexion de chaque membre dans l'export (pour recréer les comptes avec le même identifiant)", J.comptes && J.comptes.MED.email === "med@test.ma" && J.comptes.SEC.email === "sec@test.ma" && J.comptes.SEC.espaces[0] === "cab-test", J.comptes);
const Jgz = JSON.parse(zlib.gunzipSync((await bucket.file(r1.donnees).download())[0]).toString());
cas("R-F6 : données aussi rangées à part (donnees.json.gz : récupérer un dossier sans ouvrir le ZIP)", r1.donnees.endsWith("/donnees.json.gz") && Jgz.collections.patients.P1.identite.numero === "202610001");
cas("document déposé identique à l'original", Buffer.compare(await zip.file("fichiers/202610001 PATIENT Test/2026-10-01 CR anapath.pdf").async("nodebuffer"), PDF) === 0);
cas("notice : le fichier introuvable est signalé", /1 fichier\(s\) introuvable/.test(await zip.file("LISEZMOI.txt").async("string")));
const h = await db.collection(E + "/historique").get();
cas("export noté dans le journal du cabinet", h.docs.some((d) => /Export complet du cabinet : 1 dossier/.test(d.data().quoi) && d.data().parUid === "MED"));

console.log("Nouvel export");
const r2 = (await exporter({ espace: "cab-test" })).data;
const [existe1] = await bucket.file(r1.chemin).exists(), [existe2] = await bucket.file(r2.chemin).exists(), [existe2d] = await bucket.file(r2.donnees).exists();
cas("l'export précédent est effacé (après l'enregistrement du nouveau), le nouveau est là", !existe1 && existe2 && existe2d, { existe1, existe2, existe2d });

console.log("Export de la semaine (R-F4)");
const e0 = (await auto({ espace: "cab-test", action: "etat" })).data;
cas("réglage de départ : actif, 12 gardés, Drive non relié", e0.actif === true && e0.garder === 12 && e0.drive === null, e0);
const e1 = (await auto({ espace: "cab-test", action: "maintenant" })).data;
cas("export de la semaine fait (sans Drive : gardé dans Onco360)", e1.dernier && e1.dernier.ok && e1.dernier.patients === 1 && /\/exports\/auto-\d+\/Onco360_export_semaine_/.test(e1.dernier.chemin) && !e1.dernier.drive, e1.dernier);
const r3m = (await exporter({ espace: "cab-test" })).data;
cas("un export manuel n'efface pas celui de la semaine", (await bucket.file(e1.dernier.chemin).exists())[0] && !(await bucket.file(r2.chemin).exists())[0]);
const e2 = (await auto({ espace: "cab-test", action: "maintenant" })).data;
const dos1 = e1.dernier.chemin.split("/").slice(0, 4).join("/") + "/";
cas("semaine suivante : ZIP précédent retiré, ses données gardées (14 semaines)", !(await bucket.file(e1.dernier.chemin).exists())[0] && (await bucket.file(dos1 + "donnees.json.gz").exists())[0] && (await bucket.file(e2.dernier.chemin).exists())[0]);
const e3 = (await auto({ espace: "cab-test", action: "regler", actif: false, garder: 6 })).data;
cas("réglage enregistré (arrêté, 6 gardés), historique des exports", e3.actif === false && e3.garder === 6 && e3.historique.length === 2, e3);
await auto({ espace: "cab-test", action: "regler", actif: true, garder: 12 });
let refusDrive = ""; try { await auto({ espace: "cab-test", action: "lierDrive", code: "faux" }); } catch (e) { refusDrive = e.message; }
cas("Drive : code Google refusé → message lisible, rien d'enregistré", /Google a refusé la liaison/.test(refusDrive) && !(await lireDoc("driveJetons/cab-test")), refusDrive);
cas("jetons et réglages hors de portée du navigateur (serveur seul)", true);

console.log("Restauration dans un cabinet vide (outils/restaurer-export.mjs)");
const { restaurer } = await import("../../outils/restaurer-export.mjs");
await db.doc(E + "/taches/T1").set({ titre: "Tâche", fil: [{ le: "2026-10-11T08:00:00.000Z", txt: "texte" }], ech: "2026-10-12", maj: TS.fromDate(new Date("2026-10-11T09:00:00Z")) });
const r3 = (await exporter({ espace: "cab-test" })).data, [zbuf] = await bucket.file(r3.chemin).download();
const opts = { db, bucket, Timestamp: TS, auth: admin.auth() };
const bl = await restaurer(zbuf, "cab-restaure", opts);
cas("restauration : documents, fichiers, profils écrits", bl.documents > 10 && bl.fichiers === 3 && bl.profils >= 1, bl);
const lire = async (e) => { const o = {}; for (const c of await db.doc("espaces/" + e).listCollections()) { if (c.id === "historique") continue; o[c.id] = {}; (await c.get()).forEach((d) => { o[c.id][d.id] = d.data(); }); } return o; };
const norm = (o, e) => JSON.parse(JSON.stringify(o, (k, v) => (v && typeof v.toDate === "function" ? "DATE:" + v.toDate().toISOString() : v)).split("espaces/" + e + "/").join("espaces/X/"));
const avant = norm(await lire("cab-test"), "cab-test"), apres = norm(await lire("cab-restaure"), "cab-restaure");
cas("toutes les collections identiques (dates comprises, chemins adaptés)", JSON.stringify(avant) === JSON.stringify(apres), Object.keys(avant).filter((c) => JSON.stringify(avant[c]) !== JSON.stringify(apres[c])));
const t = (await db.doc("espaces/cab-restaure/taches/T1").get()).data();
cas("une date reste une date, un texte qui ressemble à une date reste un texte", typeof t.maj.toDate === "function" && typeof t.fil[0].le === "string", t);
const [pdfR] = await bucket.file("espaces/cab-restaure/patients/P1/fichiers/F1/cr.pdf").download();
cas("document déposé remis dans le stockage du nouveau cabinet, identique", Buffer.compare(pdfR, PDF) === 0);
const [mJ] = await bucket.file("espaces/cab-restaure/patients/P1/fichiers/F3/photo.jpg").getMetadata();
cas("R-F6 : photo remise avec son vrai type (image/jpeg)", mJ.contentType === "image/jpeg", mJ.contentType);
const fd = (await db.doc("espaces/cab-restaure/fichiers/F1").get()).data();
cas("fiche du document : chemin adapté au nouveau cabinet", fd.chemin === "espaces/cab-restaure/patients/P1/fichiers/F1/cr.pdf", fd.chemin);
cas("comptes déjà là : reliés au cabinet restauré (comptes/{uid})", bl.comptes.deja.length === 2 && (await lireDoc("comptes/SEC")).espaces.includes("cab-restaure"), bl.comptes);

console.log("Restauration sûre (R-F3)");
await db.doc("espaces/cab-restaure/patients/P1").update({ "identite.prenom": "Modifié après" });
let nonVide = null; try { await restaurer(zbuf, "cab-restaure", opts); } catch (e) { nonVide = e; }
cas("cabinet cible non vide : refusé, rien écrit", nonVide && nonVide.nonVide && /n'est pas vide/.test(nonVide.message) && (await lireDoc("espaces/cab-restaure/patients/P1")).identite.prenom === "Modifié après", nonVide && nonVide.message);
const bv = await restaurer(zbuf, "cab-restaure", Object.assign({ vider: true }, opts));
const copies = readdirSync(".").filter((f) => f.startsWith("avant-restauration-cab-restaure-"));
cas("--vider : copie du cabinet écrite d'abord, puis cabinet remplacé", bv.vide && copies.length === 1 && (await lireDoc("espaces/cab-restaure/patients/P1")).identite.prenom === "Test", bv.vide);
copies.forEach((f) => unlinkSync(f));
await admin.auth().deleteUser("SEC");
const bc0 = await restaurer(zbuf, "cab-r2", opts);
cas("compte absent sans --comptes : signalé, pas recréé", bc0.comptes.absents.some((x) => /^SEC \(sec@test\.ma\)/.test(x)) && !(await admin.auth().getUser("SEC").catch(() => null)), bc0.comptes);
const bc = await restaurer(zbuf, "cab-r3", Object.assign({ comptes: true }, opts));
const sec = await admin.auth().getUser("SEC").catch(() => null);
cas("--comptes : compte recréé avec le MÊME identifiant et la même adresse, lien de mot de passe", sec && sec.email === "sec@test.ma" && bc.comptes.recrees.length === 1 && /^http/.test(bc.comptes.liens["sec@test.ma"] || ""), bc.comptes);
cas("--comptes : relié au cabinet (comptes/SEC)", (await lireDoc("comptes/SEC")).espaces.includes("cab-r3"));
await admin.auth().updateUser("SEC", { password: "motdepasse-test" });

console.log("Copie de secours des fichiers (fichiersSauvegarder, R-F5)");
await admin.auth().createUser({ uid: "ADM", email: "adm@test.ma", password: "motdepasse-test" }).catch(() => {});
await db.doc("administrateurs/ADM").set({ nom: "Administration" });
cas("réservée à l'administration (refusée au médecin)", (await refus(sauver, {})) === "functions/permission-denied");
await connecter("adm@test.ma");
const s1 = (await sauver({})).data, copieB = admin.storage().bucket(PROJ + "-sauvegarde-fichiers");
const [lc] = await copieB.getFiles({ prefix: "espaces/" }), nomsC = lc.map((f) => f.name);
cas("documents et documentation recopiés, exports non", nomsC.includes(E + "/patients/P1/fichiers/F1/cr.pdf") && nomsC.includes(E + "/documentation/D1/regime.pdf") && !nomsC.some((n) => n.includes("/exports/")), { s1, nomsC });
const sf = await lireDoc("plateforme/sauvegardeFichiers");
cas("R-F5 : résultat de la nuit noté (date, copiés, erreurs, durée)", sf && sf.dernier && sf.dernier.copies === s1.copies && sf.dernier.erreurs === 0 && typeof sf.dernier.duree === "number" && sf.nuits.length === 1, sf && sf.dernier);
const s2 = (await sauver({})).data;
cas("nuit suivante sans changement : rien recopié", s2.copies === 0 && s2.retires === 0, s2);
await bucket.file(E + "/documentation/D1/regime.pdf").delete();
const s3 = (await sauver({})).data;
cas("fichier supprimé dans Onco360 : retiré de la copie", s3.retires === 1, s3);
await bucket.file(E + "/documentation/D1/regime.pdf").save(PDF, { contentType: "application/pdf" });
for (let i = 0; i < 25; i++) await bucket.file("espaces/cab-vide/patients/P/fichiers/" + i + "/f.pdf").save(PDF, { contentType: "application/pdf" });
await sauver({});
for (let i = 0; i < 25; i++) await bucket.file("espaces/cab-vide/patients/P/fichiers/" + i + "/f.pdf").delete();
const s4 = (await sauver({})).data, sf4 = await lireDoc("plateforme/sauvegardeFichiers");
cas("R-F5 : 25 fichiers disparus d'un coup : rien retiré de la copie (garde-fou)", s4.retires === 0 && s4.garde && s4.garde.n === 25 && sf4.dernier.garde, s4);
const ja = await db.collection("journalAdmin").where("type", "==", "sauvegarde").get();
cas("R-F5 : garde-fou noté au journal de l'Administration", ja.size >= 1 && /disparu d'un coup/.test(ja.docs[0].data().txt), ja.docs.map((d) => d.data().txt));
const es = (await etatSv({})).data;
cas("R-F5 : état des sauvegardes pour l'Administration (alerte, cabinets, export de la semaine)", /disparu d'un coup/.test(es.fichiers.alerte) && es.cabinets.some((c) => c.espace === "cab-test" && c.dernier && c.dernier.ok), es.fichiers.alerte);
cas("aucun nom de patient dans l'état des sauvegardes", !JSON.stringify(es).includes("PATIENT"));
for (let i = 0; i < 25; i++) await copieB.file("espaces/cab-vide/patients/P/fichiers/" + i + "/f.pdf").delete().catch(() => {});
await sauver({});

console.log("Récupérer un dossier effacé (R-F2), par le médecin titulaire");
await connecter("med@test.ma");
const rx = (await exporter({ espace: "cab-test" })).data;
// Après l'export : nouvelle consultation, tâche modifiée ; puis le dossier est supprimé comme dans Onco360 (consultations, documents et leur PDF)
await db.doc(E + "/consultations/C2").set({ patientId: "P1", etablissementId: "HGC", d: "2026-10-20", titre: "Après l'export", note: "nouvelle" });
await db.doc(E + "/taches/T0").update({ titre: "Rappeler (modifiée)" });
await db.doc(E + "/recus/R1").update({ annules: [{ numero: "R-2026-0001", m: 300 }] });
for (const c of ["consultations/C1", "fichiers/F1", "fichiers/F2", "fichiers/F3", "patients/P1"]) await db.doc(E + "/" + c).delete();
await bucket.file(E + "/patients/P1/fichiers/F1/cr.pdf").delete();
const src = (await recup({ espace: "cab-test", action: "sources" })).data;
const ex = src.exports.find((x) => x.sorte === "manuel"), exA = src.exports.find((x) => x.sorte === "auto");
cas("sources : base à une heure donnée (7 jours), export manuel, exports de la semaine", src.instant && src.instant.de && ex && /donnees\.json\.gz$/.test(ex.chemin) && exA, src.exports.map((x) => x.sorte + " " + x.chemin));
const S = { type: "stockage", chemin: ex.chemin, le: ex.le };
const li = (await recup({ espace: "cab-test", action: "liste", source: S })).data;
cas("liste : le patient effacé, repéré « effacé », avec son nom", li.patients.length === 1 && li.patients[0].nom === "PATIENT Test" && li.patients[0].existe === false, li.patients);
cas("liste : documents du cabinet (listes, documentation…)", li.documents.some((d) => d.col === "parametres" && d.id === "listes"));
const ap = (await recup({ espace: "cab-test", action: "apercu", source: S, quoi: { patient: "P1" } })).data;
cas("aperçu : ce qui revient, ce qui est gardé ; rien écrit", !ap.ecrit && ap.n >= 4 && /Consultations et ordonnances : 1 effacé\(s\) depuis, remis, 1 créé\(s\) depuis, gardé/.test(ap.resume) && /Reçus : 1 gardé/.test(ap.resume) && !(await lireDoc(E + "/patients/P1")), ap.resume);
cas("aperçu : nom du dossier et source lisibles", /PATIENT Test/.test(ap.cible) && /n° 202610001/.test(ap.cible) && /export complet/.test(ap.source), [ap.cible, ap.source]);
const t0 = Date.now(), ok1 = (await recup({ espace: "cab-test", action: "appliquer", source: S, quoi: { patient: "P1" }, confirmer: true })).data, duree = Date.now() - t0;
const P1 = await lireDoc(E + "/patients/P1");
cas("dossier remis (identité, dates en dates, version)", P1 && P1.identite.numero === "202610001" && typeof P1.maj.toDate === "function" && P1.version >= 2 && P1.majPar === "MED", P1 && { v: P1.version, majPar: P1.majPar });
cas("consultation et documents remis, tâche remise comme avant", (await lireDoc(E + "/consultations/C1")).note === "RAS" && (await lireDoc(E + "/fichiers/F1")) && (await lireDoc(E + "/taches/T0")).titre === "Rappeler");
cas("créé depuis gardé (nouvelle consultation), reçu annulé gardé tel quel", (await lireDoc(E + "/consultations/C2")).note === "nouvelle" && (await lireDoc(E + "/recus/R1")).annules.length === 1);
cas("PDF effacé repris de la copie de secours des fichiers, identique", ok1.pdf.remis === 1 && Buffer.compare((await bucket.file(E + "/patients/P1/fichiers/F1/cr.pdf").download())[0], PDF) === 0, ok1.pdf);
cas("PDF déjà absent avant l'export : signalé introuvable", ok1.pdf.introuvables === 1, ok1.pdf);
cas("état d'avant copié (pour annuler), récupération notée au journal du cabinet", (await bucket.file(ok1.copie).exists())[0] && (await db.collection(E + "/historique").get()).docs.some((d) => /^Récupération/.test(d.data().quoi) && d.data().patientId === "P1"), ok1.copie);
cas("en moins d'une minute (objectif : une heure)", duree < 60000, duree);
const src2 = (await recup({ espace: "cab-test", action: "sources" })).data;
cas("la copie d'avant la récupération est proposée comme source", src2.exports.some((x) => x.sorte === "copie" && x.chemin === ok1.copie));
const ap2 = (await recup({ espace: "cab-test", action: "apercu", source: S, quoi: { patient: "P1" } })).data;
cas("refaire la même récupération : rien à récupérer", ap2.n === 0, ap2.resume);

console.log("Récupérer un document du cabinet (liste, paramètre)");
await db.doc(E + "/parametres/listes").set({ data: JSON.stringify({ mut: [] }) });
await recup({ espace: "cab-test", action: "appliquer", source: S, quoi: { doc: ["parametres", "listes"] }, confirmer: true });
cas("liste du cabinet remise comme dans l'export", JSON.parse((await lireDoc(E + "/parametres/listes")).data).mut.length === 2);
cas("collection non permise (membres) refusée", (await refus(recup, { espace: "cab-test", action: "apercu", source: S, quoi: { doc: ["membres", "SEC"] } })) === "functions/invalid-argument");

console.log("Base à une heure donnée (retour à la minute près)");
// État A (consultation C1 « RAS »), minute pleine M passée, puis erreur (C1 effacée) : la base « telle qu'elle était à M » redonne C1
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const M = Math.ceil((Date.now() + 1000) / 60000) * 60000; await attendre(M - Date.now() + 1500);
await db.doc(E + "/consultations/C1").delete();
await attendre(M + 61000 - Date.now());
const instant = { type: "instant", le: new Date(M).toISOString() };
const ri = (await recup({ espace: "cab-test", action: "apercu", source: instant, quoi: { patient: "P1" } })).data;
cas("aperçu à une heure donnée : la consultation effacée après cette heure revient", /Consultations et ordonnances : 1 effacé\(s\) depuis, remis/.test(ri.resume) && /telle qu'elle était le/.test(ri.source), ri.resume);
await recup({ espace: "cab-test", action: "appliquer", source: instant, quoi: { patient: "P1" }, confirmer: true });
cas("consultation remise depuis la base à cette heure", (await lireDoc(E + "/consultations/C1")).note === "RAS");
cas("heure de plus de 7 jours : renvoyée aux exports", /7 jours/.test(await recup({ espace: "cab-test", action: "apercu", source: { type: "instant", le: "2026-01-01T00:00:00Z" }, quoi: { patient: "P1" } }).then(() => "", (e) => e.message)));
cas("source hors du cabinet refusée", (await refus(recup, { espace: "cab-test", action: "liste", source: { type: "stockage", chemin: "espaces/autre/exports/1/donnees.json.gz" } })) === "functions/permission-denied");
cas("base restaurée : réservée à l'administration", (await refus(recup, { espace: "cab-test", action: "liste", source: { type: "base", nom: "onco360-restauree" } })) === "functions/permission-denied");

console.log("Depuis un export ouvert sur l'ordinateur (pièces envoyées par le navigateur)");
await db.doc(E + "/consultations/C1").update({ note: "abîmée" });
const pieces = { "consultations/C1": { data: J.collections.consultations.C1, dates: [] }, "membres/SEC": { data: { role: "medecin" }, dates: [] }, "consultations/CX": { data: { patientId: "AUTRE" }, dates: [] } };
const rf = (await recup({ espace: "cab-test", action: "appliquer", source: { type: "fichier", nom: "Onco360_export.zip", pieces }, quoi: { patient: "P1" }, confirmer: true })).data;
cas("consultation remise ; pièce d'une autre collection ou d'un autre patient ignorée", rf.ecrit && (await lireDoc(E + "/consultations/C1")).note === "RAS" && (await lireDoc(E + "/membres/SEC")).role === "assistante" && !(await lireDoc(E + "/consultations/CX")), rf.resume);

console.log("Par l'Administration (sans nom ni contenu) et tout le cabinet (R-F7)");
await connecter("adm@test.ma");
const la = (await recup({ espace: "cab-test", action: "liste", source: S })).data;
cas("liste : numéros de dossier seulement, jamais le nom", la.patients.length === 1 && la.patients[0].numero === "202610001" && la.patients[0].nom === undefined && !JSON.stringify(la).includes("PATIENT"), la.patients);
await db.doc(E + "/patients/P1").update({ "identite.nomF": "ABIME" });
await db.doc(E + "/membres/SEC").update({ role: "infirmiere" });
await db.doc(E + "/parametres/listes").set({ data: "{}" });
const ac = (await recup({ espace: "cab-test", action: "apercu", source: S, quoi: { cabinet: true } })).data;
cas("aperçu de tout le cabinet sans nom de patient", !JSON.stringify(ac).includes("PATIENT") && !JSON.stringify(ac).includes("ABIME") && ac.n >= 2 && ac.cible === "tout le cabinet", ac);
const tc = (await recup({ espace: "cab-test", action: "appliquer", source: S, quoi: { cabinet: true }, confirmer: true })).data;
cas("tout le cabinet remis comme dans l'export", tc.ecrit && (await lireDoc(E + "/patients/P1")).identite.nomF === "PATIENT" && JSON.parse((await lireDoc(E + "/parametres/listes")).data).mut.length === 2);
cas("jamais l'équipe ni ses droits (membres non touchés)", (await lireDoc(E + "/membres/SEC")).role === "infirmiere");
const jr = await db.collection("journalAdmin").where("type", "==", "recuperation").get();
cas("noté au journal de l'Administration, sans nom de patient", jr.size === 1 && !/PATIENT/.test(jr.docs[0].data().txt), jr.docs.map((d) => d.data().txt));
cas("l'Administration ne règle pas l'export de la semaine d'un cabinet", (await refus(auto, { espace: "cab-test", action: "regler", actif: false })) === "functions/permission-denied");

console.log("Ligne de commande (outils/recuperer.mjs, même code)");
const { outil } = await import("../../outils/recuperer.mjs");
const { getFirestore, FieldValue } = reqF("firebase-admin/firestore"), { getStorage } = reqF("firebase-admin/storage");
const cli = outil({ db, getStorage, getFirestore, auth: admin.auth(), Timestamp: TS, FieldValue });
await db.doc(E + "/taches/T0").delete();
const lc2 = await cli({ espace: "cab-test", action: "liste", source: { type: "export", J, nom: "export.zip" } });
const rc = await cli({ espace: "cab-test", action: "appliquer", source: { type: "export", J, nom: "export.zip" }, quoi: { patient: "P1" }, confirmer: true });
cas("liste avec les noms, dossier récupéré depuis un fichier", lc2.patients[0].nom === "PATIENT Test" && rc.ecrit && (await lireDoc(E + "/taches/T0")).titre === "Rappeler", rc.resume);

console.log("\n" + ok + " réussi(s), " + ko + " échec(s)");
process.exit(ko ? 1 : 0);
