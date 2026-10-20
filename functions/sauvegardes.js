// Onco360 – sauvegardes et récupération (fonctions serveur ; étape 1.6 du 11/10/2026, lot R-F de l'audit n° 8 du 20/10/2026).
//   • exporterCabinet : export complet à la demande du médecin titulaire (ZIP écrit au fil de l'eau, R-F6) ;
//   • exportsHebdo (dimanche 1 h 30) / exportAuto : export automatique de la semaine, gardé dans Onco360 et déposé dans le Google Drive
//     du cabinet s'il est relié (R-F4) ; réglé par le titulaire (Paramètres › Cabinet › Export des données) ;
//   • recuperation : récupérer un dossier, un document du cabinet ou tout le cabinet tel qu'il était (R-F2, R-F7), par le titulaire ou par
//     l'Administration (qui ne voit ni nom ni contenu : numéros de dossier et nombres seulement) ;
//   • fichiersNuit / fichiersSauvegarder : copie de secours des fichiers, résultat noté chaque nuit, garde-fou, alerte (R-F5) ;
//   • sauvegardesEtat : état de tout cela pour l'Administration (onglet Sauvegardes).
// Logique pure : exportation.js, restauration.js, sauvegarde.js, drive.js (testées sans Firebase) ; de bout en bout : tests/emulateur/test-export.mjs.
const zlib = require("zlib");
const { Readable } = require("stream");
const X = require("./exportation");
const R = require("./restauration");
const Sv = require("./sauvegarde");
const G = require("./drive");

module.exports = function sauvegardes(o) {
  const { db, getStorage, getFirestore, onCall, onSchedule, HttpsError, FieldValue, Timestamp, estAdministrateur, membre, jAdmin, oauth, SECRET, C } = o;
  const TZ = "Africa/Casablanca", bucket = () => getStorage().bucket();
  const SEMAINES = 14; // exports de la semaine gardés dans Onco360 (données seules) : comme la sauvegarde Firebase (14 semaines)
  const heureMaroc = (d) => new Date(d || Date.now()).toLocaleString("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // ───── Export complet (étape 1.6 ; R-F6 : au fil de l'eau, ancien effacé APRÈS, vraies extensions, données à part pour la récupération) ─────
  // Lecture paresseuse d'un fichier du stockage : ouvert seulement quand le ZIP en est là (jamais des centaines de lectures à la fois)
  const paresseux = (f) => { let s = null; const r = new Readable({ read() { if (s) { s.resume(); return; } s = f.createReadStream(); s.on("data", (c) => { if (!r.push(c)) s.pause(); }); s.on("end", () => r.push(null)); s.on("error", (e) => r.destroy(e)); } }); return r; };
  async function donneesCabinet(espace) {
    const es = await db.doc("espaces/" + espace).get();
    const J = { application: "Onco360", format: 1, espace, date: new Date().toISOString(), cabinet: null, collections: {}, utilisateurs: {}, comptes: {}, journalAudit: {}, dates: {}, zip: {} };
    // dates : { "collection/document": [chemins des champs qui étaient des dates Firestore] } (restauration exacte)
    const noter = (cle, data) => { const l = []; const v = X.plat(data, l); if (l.length) J.dates[cle] = l; return v; };
    J.cabinet = noter("@cabinet", es.data());
    for (const c of await es.ref.listCollections()) { const s = await c.get(); J.collections[c.id] = {}; s.forEach((d) => { J.collections[c.id][d.id] = noter(c.id + "/" + d.id, d.data()); }); }
    for (const uid of Object.keys(J.collections.membres || {})) {
      const u = await db.doc("utilisateurs/" + uid).get(); if (u.exists) J.utilisateurs[uid] = noter("utilisateurs/" + uid, u.data());
      // R-F3 : adresse de connexion et cabinets de chaque membre (pour recréer les comptes avec le même identifiant)
      const cp = await db.doc("comptes/" + uid).get(); let email = ""; try { email = (await o.getAuth().getUser(uid)).email || ""; } catch (e) { /* compte retiré */ }
      J.comptes[uid] = { email, espaces: cp.exists ? cp.data().espaces || [cp.data().espace].filter(Boolean) : [] };
    }
    (await db.collection("audit/" + espace + "/lignes").get()).forEach((d) => { J.journalAudit[d.id] = noter("@audit/" + d.id, d.data()); });
    return { es, J };
  }
  async function faireExport(espace, { par, auto }) {
    const b = bucket(), { es, J } = await donneesCabinet(espace); J.sorte = auto ? "auto" : "manuel";
    const zip = new (require("jszip"))(), patients = J.collections.patients || {}, deja = new Set(), manquants = [];
    let nf = 0, nd = 0;
    const joindre = async (chemin, cz) => { const f = b.file(chemin); try { await f.getMetadata(); } catch (e) { manquants.push(chemin); return false; }
      zip.file(cz, paresseux(f), { binary: true, compression: "STORE" }); J.zip[chemin] = cz; return true; };
    for (const f of Object.values(J.collections.fichiers || {})) { if (f && f.chemin && (await joindre(f.chemin, X.cheminFichier(f, patients, deja)))) nf++; }
    let docs = []; try { docs = JSON.parse(((J.collections.bibliotheques || {}).documentation || {}).data || "[]"); } catch (e) { docs = []; }
    for (const d of docs) { if (d && d.chemin && (await joindre(d.chemin, "documentation/" + String(d.titre || d.nom || d.id).replace(/[\/\\:*?"<>|#]+/g, " ").slice(0, 100) + X.extension(d)))) nd++; }
    const np = Object.keys(patients).length, jour = new Date().toLocaleDateString("sv-SE", { timeZone: TZ }), m = par ? await membre(espace, par) : null;
    const texteJ = JSON.stringify(J, null, 1);
    zip.file("LISEZMOI.txt", X.lisezmoi({ cabinet: es.data().nom, espace, date: heureMaroc(), par: auto ? "Onco360 (export automatique de la semaine)" : m && m.nom, patients: np, fichiers: nf, documentation: nd, manquants: manquants.length }));
    zip.file("patients.csv", "﻿" + X.csvPatients(patients, J.collections.etablissements || {}));
    zip.file("donnees/onco360.json", texteJ);
    const dossier = "espaces/" + espace + "/exports/" + (auto ? "auto-" : "") + Date.now() + "/", chemin = dossier + "Onco360_export_" + (auto ? "semaine_" : "") + jour + ".zip";
    await new Promise((ok, ko) => zip.generateNodeStream({ streamFiles: true, compression: "DEFLATE", compressionOptions: { level: 6 } }).on("error", ko)
      .pipe(b.file(chemin).createWriteStream({ contentType: "application/zip", resumable: true, metadata: { metadata: { creePar: par || "onco360" } } })).on("error", ko).on("finish", ok));
    await b.file(dossier + "donnees.json.gz").save(zlib.gzipSync(texteJ), { contentType: "application/gzip", resumable: false });
    const [meta] = await b.file(chemin).getMetadata(), taille = Number(meta.size || 0);
    // Seulement maintenant (le nouvel export est enregistré) : les anciens sont retirés. Manuel : l'export manuel précédent.
    // Automatique : les ZIP des semaines passées (le dernier suffit au téléchargement, le Drive garde les autres), les données au-delà de 14 semaines.
    const [tous] = await b.getFiles({ prefix: "espaces/" + espace + "/exports/" }), dos = {};
    tous.forEach((f) => { const k = f.name.split("/")[3]; (dos[k] = dos[k] || []).push(f); });
    const autos = Object.keys(dos).filter((k) => /^auto-/.test(k)).sort().reverse(), manuels = Object.keys(dos).filter((k) => /^\d+$/.test(k)).sort().reverse();
    const retirer = [];
    if (auto) autos.forEach((k, i) => dos[k].forEach((f) => { if (i >= SEMAINES || (i >= 1 && /\.zip$/.test(f.name))) retirer.push(f); }));
    else manuels.slice(1).forEach((k) => retirer.push(...dos[k]));
    for (const f of retirer) await f.delete().catch((e) => console.warn("ancien export", f.name, e.message));
    await db.collection("espaces/" + espace + "/historique").add({ parUid: par || "onco360", parNom: auto ? "Onco360 (export de la semaine)" : (m && m.nom) || "", le: FieldValue.serverTimestamp(), patientId: "", patient: "",
      quoi: (auto ? "Export automatique de la semaine : " : "Export complet du cabinet : ") + np + " dossier(s), " + nf + " document(s) déposé(s)" + (manquants.length ? ", " + manquants.length + " introuvable(s)" : "") });
    console.log("export", auto ? "auto" : "manuel", espace, np, "patients", nf, "fichiers", nd, "documentation", manquants.length, "manquants", taille, "octets");
    return { chemin, donnees: dossier + "donnees.json.gz", taille, patients: np, fichiers: nf, documentation: nd, manquants: manquants.length };
  }
  const exporterCabinet = onCall({ timeoutSeconds: 1800, memory: "1GiB" }, async (req) => {
    const par = req.auth && req.auth.uid, { espace } = req.data || {};
    if (!par) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
    const es = espace ? await db.doc("espaces/" + espace).get() : null;
    if (!es || !es.exists) throw new HttpsError("not-found", "Cabinet introuvable.");
    if (es.data().titulaire !== par) throw new HttpsError("permission-denied", "L'export complet est réservé au médecin titulaire du cabinet.");
    return faireExport(espace, { par });
  });

  // ───── Export automatique de la semaine (R-F4) : réglage exportsAuto/{e} (serveur seul), jetons Google Drive driveJetons/{e} (serveur seul) ─────
  const SCOPE_DRIVE = "https://www.googleapis.com/auth/drive.file", NOM_DOSSIER = "Onco360 – exports du cabinet";
  const reglageAuto = async (e) => { const s = await db.doc("exportsAuto/" + e).get(); return Object.assign({ actif: true, garder: 12 }, s.exists ? s.data() : {}); };
  async function titulaireOuAdmin(req, adminPermis) {
    const uid = req.auth && req.auth.uid, e = String((req.data || {}).espace || "");
    if (!uid) throw new HttpsError("unauthenticated", "Connectez-vous à Onco360.");
    if (!e || C.estBib(e)) throw new HttpsError("invalid-argument", "Choisissez un cabinet.");
    const es = await db.doc("espaces/" + e).get(); if (!es.exists) throw new HttpsError("not-found", "Cabinet introuvable.");
    if (o.local) return { uid, e, es, admin: false, local: true }; // outils/recuperer.mjs (sur le Mac, compte propriétaire du projet)
    if (es.data().titulaire === uid) return { uid, e, es, admin: false };
    if (adminPermis && (await estAdministrateur(uid))) return { uid, e, es, admin: true };
    throw new HttpsError("permission-denied", "Réservé au médecin titulaire du cabinet" + (adminPermis ? " et à l'administration d'Onco360." : "."));
  }
  async function deposerDrive(e, ex, reg) {
    const js = await db.doc("driveJetons/" + e).get(); if (!js.exists) return null;
    const J = js.data(), t = await oauth({ grant_type: "refresh_token", refresh_token: J.refresh }).catch((er) => { throw new Error(er.code === "invalid_grant" ? "l'accès au Google Drive a été retiré : reliez-le à nouveau" : er.message); });
    const api = G.creerApi(t.access_token);
    let dossier = J.dossier; if (!(await api.dossierExiste(dossier))) { dossier = (await api.creerDossier(NOM_DOSSIER)).id; await js.ref.set({ dossier }, { merge: true }); }
    const f = bucket().file(ex.chemin), r = await api.envoyer({ nom: ex.chemin.split("/").pop(), parent: dossier, type: "application/zip", taille: ex.taille, lire: async (a, z) => (await f.download({ start: a, end: z }))[0] });
    let retires = 0; for (const x of G.aRetirer(await api.lister(dossier), reg.garder)) { await api.supprimer(x.id); retires++; }
    return { ok: true, email: J.email || "", fichier: r.name, retires };
  }
  async function exportSemaine(e) {
    const reg = await reglageAuto(e), le = new Date().toISOString(), dernier = { le, ok: false };
    try {
      const ex = await faireExport(e, { auto: true }); Object.assign(dernier, { ok: true, taille: ex.taille, patients: ex.patients, fichiers: ex.fichiers, manquants: ex.manquants, chemin: ex.chemin });
      try { const d = await deposerDrive(e, ex, reg); if (d) dernier.drive = d; } catch (er) { dernier.drive = { ok: false, erreur: String(er.message || er).slice(0, 300) }; console.error("drive", e, er); }
    } catch (er) { dernier.erreur = String(er.message || er).slice(0, 300); console.error("export de la semaine", e, er); }
    await db.doc("exportsAuto/" + e).set({ dernier, historique: [dernier].concat((reg.historique || []).slice(0, 19)) }, { merge: true });
    return dernier;
  }
  const exportsHebdo = onSchedule({ schedule: "30 1 * * 0", timeZone: TZ, timeoutSeconds: 1800, memory: "1GiB", secrets: [SECRET] }, async () => {
    for (const d of (await db.collection("espaces").get()).docs) {
      const x = d.data() || {}; if (C.estBib(d.id) || x.bibliotheque || x.demo || x.actif === false) continue;
      if (!(await reglageAuto(d.id)).actif) continue;
      const r = await exportSemaine(d.id); console.log("export de la semaine", d.id, r.ok ? "fait" : "échec", r.drive ? (r.drive.ok ? "Drive : déposé" : "Drive : " + r.drive.erreur) : "");
    }
  });
  const exportAuto = onCall({ timeoutSeconds: 1800, memory: "1GiB", secrets: [SECRET] }, async (req) => {
    const { uid, e, admin } = await titulaireOuAdmin(req, true), d = req.data || {}, ref = db.doc("exportsAuto/" + e);
    const etat = async () => { const r = await reglageAuto(e), j = await db.doc("driveJetons/" + e).get();
      return { actif: r.actif, garder: r.garder, dernier: r.dernier || null, historique: (r.historique || []).slice(0, 10), drive: j.exists ? { email: j.data().email || "", lie: j.data().lie || "" } : null }; };
    if (!d.action || d.action === "etat") return etat();
    if (admin) throw new HttpsError("permission-denied", "Réglé par le médecin titulaire du cabinet.");
    if (d.action === "regler") {
      const garder = Math.min(52, Math.max(1, Math.round(Number(d.garder) || 12)));
      await ref.set({ actif: d.actif !== false, garder, majPar: uid, majLe: new Date().toISOString() }, { merge: true });
      await db.collection("espaces/" + e + "/historique").add({ parUid: uid, parNom: ((await membre(e, uid)) || {}).nom || "", le: FieldValue.serverTimestamp(), patientId: "", patient: "", quoi: "Export de la semaine " + (d.actif !== false ? "activé (" + garder + " gardés dans le Drive)" : "arrêté") });
      return etat();
    }
    if (d.action === "lierDrive") {
      let t; try { t = await oauth({ grant_type: "authorization_code", code: String(d.code || ""), redirect_uri: "postmessage" }); }
      catch (er) { throw new HttpsError("failed-precondition", "Google a refusé la liaison : " + er.message); }
      if (String(t.scope || "").split(" ").indexOf(SCOPE_DRIVE) < 0) throw new HttpsError("failed-precondition", "L'autorisation « fichiers créés par Onco360 » n'a pas été cochée dans la fenêtre Google. Recommencez en la cochant.");
      let email = ""; try { email = JSON.parse(Buffer.from(String(t.id_token).split(".")[1], "base64url").toString()).email || ""; } catch (er) { /* adresse inconnue */ }
      const avant = (await db.doc("driveJetons/" + e).get()).data() || {}, refresh = t.refresh_token || (avant.email === email ? avant.refresh : null);
      if (!refresh) throw new HttpsError("failed-precondition", "Google n'a pas fourni d'accès durable. Allez sur myaccount.google.com/permissions, retirez « Onco360 », puis recommencez.");
      const api = G.creerApi(t.access_token);
      const dossier = avant.email === email && (await api.dossierExiste(avant.dossier)) ? avant.dossier : (await api.creerDossier(NOM_DOSSIER)).id;
      await db.doc("driveJetons/" + e).set({ refresh, email, dossier, lie: new Date().toISOString(), par: uid });
      await db.collection("espaces/" + e + "/historique").add({ parUid: uid, parNom: ((await membre(e, uid)) || {}).nom || "", le: FieldValue.serverTimestamp(), patientId: "", patient: "", quoi: "Google Drive relié pour l'export de la semaine (" + email + ")" });
      return etat();
    }
    if (d.action === "delierDrive") {
      const s = await db.doc("driveJetons/" + e).get();
      if (s.exists) { await fetch("https://oauth2.googleapis.com/revoke?token=" + encodeURIComponent(s.data().refresh), { method: "POST" }).catch(() => {}); await s.ref.delete(); }
      return etat();
    }
    if (d.action === "maintenant") { await exportSemaine(e); return etat(); }
    throw new HttpsError("invalid-argument", "Action inconnue.");
  });

  // ───── Récupérer un dossier, un document ou tout le cabinet (R-F2, R-F7) ─────
  const instantDe = (s) => { const v = R.instantValide(s.le); if (v.erreur) throw new HttpsError("invalid-argument", v.erreur); return Timestamp.fromMillis(v.t); };
  const cheminSur = (e, ch) => typeof ch === "string" && (ch.startsWith("espaces/" + e + "/exports/") || ch.startsWith("espaces/" + e + "/recuperations/")) && ch.indexOf("..") < 0;
  // État au format export depuis un fichier du stockage (données .json.gz ou ZIP d'un export d'avant le 20/10)
  async function lireStockage(e, ch) {
    if (!cheminSur(e, ch)) throw new HttpsError("permission-denied", "Source hors de ce cabinet.");
    const [buf] = await bucket().file(ch).download().catch(() => { throw new HttpsError("not-found", "Cette copie n'existe plus."); });
    if (/\.gz$/.test(ch)) return JSON.parse(zlib.gunzipSync(buf).toString());
    if (/\.json$/.test(ch)) return JSON.parse(buf.toString());
    const z = await require("jszip").loadAsync(buf), f = z.file("donnees/onco360.json"); if (!f) throw new HttpsError("failed-precondition", "Ce fichier n'est pas un export d'Onco360.");
    return JSON.parse(await f.async("string"));
  }
  // Lecteur d'un état : la base actuelle, la base à une heure donnée (minute près, 7 jours), une base restaurée à côté, ou un état au format export
  function lecteurBase(base, e, readTime) {
    const E = "espaces/" + e + "/";
    const lire = async (fn) => (readTime ? base.runTransaction((t) => fn((x) => t.get(x)), { readOnly: true, readTime }) : fn((x) => x.get()));
    const pieces = (snaps) => { const r = {}; snaps.forEach((d) => { if (d.exists) r[d.ref.path.slice(E.length)] = R.aplatir(d.data()); }); return r; };
    return {
      async patients(sansNom) { return lire(async (g) => { const s = await g(base.collection(E + "patients").select("identite")); return { collections: { patients: Object.fromEntries(s.docs.map((d) => [d.id, d.data()])) } }; }); },
      async documents() { return lire(async (g) => { const c = {}; for (const col of R.COLS_DOCUMENT) { const s = await g(base.collection(E + col).select()); c[col] = Object.fromEntries(s.docs.map((d) => [d.id, {}])); } return { collections: c }; }); },
      async pieces(quoi) {
        return lire(async (g) => {
          if (quoi.patient) {
            const p = String(quoi.patient), docs = await Promise.all(R.DOCS_PATIENT.map((c) => g(base.doc(E + c + "/" + p))));
            const req = await Promise.all(R.REQUETES_PATIENT.map((c) => g(base.collection(E + c).where("patientId", "==", p))));
            return pieces(docs.concat(...req.map((s) => s.docs)));
          }
          if (quoi.doc) return pieces([await g(base.doc(E + quoi.doc[0] + "/" + quoi.doc[1]))]);
          const tout = []; for (const c of await base.doc("espaces/" + e).listCollections()) { if (R.EXCLUS.indexOf(c.id) < 0) tout.push(...(await g(c)).docs); }
          return pieces(tout);
        });
      },
    };
  }
  const lecteurJ = (J) => ({ patients: async () => J, documents: async () => J,
    pieces: async (quoi) => (quoi.patient ? R.piecesPatient(J, String(quoi.patient)) : quoi.doc ? R.pieceDocument(J, quoi.doc[0], quoi.doc[1]) : R.piecesCabinet(J)) });
  // Pièces envoyées par le navigateur (export ouvert sur l'ordinateur du titulaire) : seulement des collections connues, 5 Mo au plus
  function lecteurFichier(s, quoi) {
    const P = s && s.pieces; if (!P || typeof P !== "object" || JSON.stringify(P).length > 5e6) throw new HttpsError("invalid-argument", "Fichier illisible ou trop gros.");
    const permis = R.DOCS_PATIENT.concat(R.REQUETES_PATIENT, R.COLS_DOCUMENT), r = {};
    Object.entries(P).forEach(([cle, v]) => { const [c, id] = R.partsDe(cle);
      if (permis.indexOf(c) < 0 || !v || typeof v.data !== "object" || !id || id.indexOf("/") >= 0) return;
      if (quoi.patient && (R.DOCS_PATIENT.indexOf(c) >= 0 ? id !== quoi.patient : v.data.patientId !== quoi.patient)) return;
      if (quoi.doc && (c !== quoi.doc[0] || id !== quoi.doc[1])) return;
      r[cle] = { data: v.data, dates: Array.isArray(v.dates) ? v.dates.map(String) : [] }; });
    return { pieces: async () => r };
  }
  async function lecteurSource(e, s, admin) {
    s = s || {};
    if (s.type === "instant") return { lect: lecteurBase(db, e, instantDe(s)), lib: "la base telle qu'elle était le " + heureMaroc(instantDe(s).toMillis()) };
    if (s.type === "stockage") return { lect: lecteurJ(await lireStockage(e, s.chemin)), lib: /recuperations\//.test(s.chemin) ? "la copie faite avant une récupération" : "l'export " + (/\/auto-/.test(s.chemin) ? "de la semaine" : "complet") + " du " + (s.le ? heureMaroc(s.le) : "?") };
    if (s.type === "export" && o.local && s.J) return { lect: lecteurJ(s.J), lib: "le fichier " + String(s.nom || "d'export") };
    if (s.type === "base") { if (!admin && !o.local) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360."); if (!/^[a-z][a-z0-9-]{3,62}$/.test(String(s.nom || "")) || s.nom === "(default)") throw new HttpsError("invalid-argument", "Nom de base invalide.");
      return { lect: lecteurBase(getFirestore(s.nom), e), lib: "la base restaurée « " + s.nom + " »" }; }
    if (s.type === "fichier") { if (admin) throw new HttpsError("permission-denied", "Réservé au médecin titulaire du cabinet."); return { lect: null, fichier: s, lib: "un fichier d'export (" + String(s.nom || "ZIP").slice(0, 80) + ")" }; }
    throw new HttpsError("invalid-argument", "Choisissez d'où récupérer.");
  }
  const quoiDe = (q) => { q = q || {}; if (q.patient) return { patient: String(q.patient) }; if (Array.isArray(q.doc) && R.COLS_DOCUMENT.indexOf(q.doc[0]) >= 0 && q.doc[1]) return { doc: [String(q.doc[0]), String(q.doc[1])] }; if (q.cabinet === true) return { cabinet: true }; throw new HttpsError("invalid-argument", "Choisissez quoi récupérer."); };
  // PDF d'un document déposé remis : déjà là, sinon repris de la copie de secours des fichiers (version en cours ou la plus récente des anciennes)
  async function remettrePdf(chemin) {
    const b = bucket(); if ((await b.file(chemin).exists())[0]) return "la";
    const projet = JSON.parse(process.env.FIREBASE_CONFIG || "{}").projectId || process.env.GCLOUD_PROJECT, copie = getStorage().bucket(Sv.nomCopie(projet));
    const [l] = await copie.getFiles({ prefix: chemin, versions: true }).catch(() => [[]]);
    const v = l.filter((f) => f.name === chemin).sort((a, z) => Number(z.metadata.generation || 0) - Number(a.metadata.generation || 0))[0];
    if (!v) return "introuvable";
    await v.copy(b.file(chemin)); return "remis";
  }
  const recuperation = onCall({ timeoutSeconds: 540, memory: "1GiB" }, async (req) => {
    const { uid, e, es, admin } = await titulaireOuAdmin(req, true), d = req.data || {}, action = d.action || "sources";
    if (action === "sources") {
      const [l] = await bucket().getFiles({ prefix: "espaces/" + e + "/exports/" }), [lr] = await bucket().getFiles({ prefix: "espaces/" + e + "/recuperations/" });
      const parDos = {}; l.forEach((f) => { const k = f.name.split("/")[3]; if (/donnees\.json\.gz$/.test(f.name) || (!parDos[k] && /\.zip$/.test(f.name))) parDos[k] = f; });
      const exports = Object.entries(parDos).map(([k, f]) => ({ chemin: f.name, le: f.metadata.timeCreated, sorte: /^auto-/.test(k) ? "auto" : "manuel", taille: Number(f.metadata.size || 0) }))
        .concat(lr.map((f) => ({ chemin: f.name, le: f.metadata.timeCreated, sorte: "copie", taille: Number(f.metadata.size || 0), note: (f.metadata.metadata || {}).quoi || "" })))
        .sort((a, z) => String(z.le).localeCompare(String(a.le)));
      return { instant: { de: new Date(Date.now() - 7 * 864e5 + 10 * 60000).toISOString(), a: new Date(Date.now() - 60000).toISOString() }, exports, admin };
    }
    const { lect, lib, fichier } = await lecteurSource(e, d.source, admin);
    if (action === "liste") {
      if (!lect) throw new HttpsError("invalid-argument", "Liste faite par le navigateur pour un fichier.");
      const presents = (await db.collection("espaces/" + e + "/patients").select().get()).docs.map((x) => x.id);
      return { patients: R.listePatients(await lect.patients(admin), presents, admin), documents: R.listeDocuments(await lect.documents()) };
    }
    if (action !== "apercu" && action !== "appliquer") throw new HttpsError("invalid-argument", "Action inconnue.");
    const quoi = quoiDe(d.quoi);
    const passe = await (fichier ? lecteurFichier(fichier, quoi) : lect).pieces(quoi), present = await lecteurBase(db, e).pieces(quoi), cmp = R.comparer(passe, present);
    const nomP = quoi.patient && !admin ? R.nomDe((passe["patients/" + quoi.patient] || present["patients/" + quoi.patient] || {}).data) : "";
    const numero = quoi.patient ? ((((passe["patients/" + quoi.patient] || present["patients/" + quoi.patient] || {}).data || {}).identite || {}).numero || "") : "";
    const cible = quoi.patient ? "dossier " + (nomP ? nomP + " " : "") + (numero ? "n° " + numero : "") : quoi.doc ? R.libCol(quoi.doc[0]) + " › " + quoi.doc[1] : "tout le cabinet";
    const sortie = { cible, source: lib, parCol: cmp.parCol, resume: R.resume(cmp), n: cmp.remettre.length, crees: cmp.crees.length, gardes: cmp.gardes.length, absent: !Object.keys(passe).length };
    if (action === "apercu" || !d.confirmer || !cmp.remettre.length) return Object.assign(sortie, { ecrit: false });
    // 1. Copie de ce qui va être remplacé (et de tout le dossier tel qu'il est) : réutilisable comme source pour annuler la récupération
    const ms = Date.now(), copie = "espaces/" + e + "/recuperations/" + ms + ".json.gz", qui = admin ? "l'administration d'Onco360" : ((await membre(e, uid)) || {}).nom || "le médecin titulaire";
    await bucket().file(copie).save(zlib.gzipSync(JSON.stringify(R.versExport(present, { espace: e, date: new Date(ms).toISOString(), avant: cible, par: uid }))),
      { contentType: "application/gzip", resumable: false, metadata: { metadata: { quoi: "avant la récupération : " + cible } } });
    // 2. Écriture (par lots de 400)
    const enDate = (t) => Timestamp.fromDate(new Date(t)), extra = { maj: FieldValue.serverTimestamp(), majPar: uid };
    for (let i = 0; i < cmp.remettre.length; i += 400) {
      const b = db.batch(); cmp.remettre.slice(i, i + 400).forEach((cle) => b.set(db.doc("espaces/" + e + "/" + cle), R.aEcrire(cle, passe[cle], present[cle], enDate, extra))); await b.commit();
    }
    // 3. PDF des documents déposés remis
    const pdf = { remis: 0, introuvables: 0 };
    for (const cle of cmp.remettre) { const ch = R.cheminFichierDe(cle, passe[cle]); if (!ch) continue; const r = await remettrePdf(ch).catch(() => "introuvable"); if (r === "remis") pdf.remis++; if (r === "introuvable") pdf.introuvables++; }
    const quoiTxt = "Récupération (" + qui + ") : " + cible + " depuis " + lib + " · " + sortie.resume + (pdf.remis || pdf.introuvables ? " · PDF remis : " + pdf.remis + (pdf.introuvables ? ", introuvables : " + pdf.introuvables : "") : "") + " · état d'avant : " + copie;
    await db.collection("espaces/" + e + "/historique").add({ parUid: uid, parNom: admin ? "Administration d'Onco360" : qui, le: FieldValue.serverTimestamp(), patientId: quoi.patient || "", patient: nomP, quoi: quoiTxt.slice(0, 1500) });
    if (admin) await jAdmin(uid, "recuperation", e, es.data().nom || e, quoiTxt.replace(nomP, "").slice(0, 1500));
    return Object.assign(sortie, { ecrit: true, copie, pdf });
  });

  // ───── Copie de secours des fichiers (étape 1.6 ; R-F5 : résultat noté, garde-fou, alerte) ─────
  async function sauvegarderFichiers() {
    const debut = Date.now(), le = new Date(debut).toISOString(), ref = db.doc("plateforme/sauvegardeFichiers");
    try {
      const src = getStorage().bucket(), projet = JSON.parse(process.env.FIREBASE_CONFIG || "{}").projectId || process.env.GCLOUD_PROJECT;
      const dst = getStorage().bucket(Sv.nomCopie(projet));
      const [existe] = await dst.exists().catch(() => [false]);
      if (!existe) await dst.create(Sv.REGLAGES_COPIE).catch((er) => console.warn("création du second emplacement", er.message));
      const liste = async (b) => (await b.getFiles({ prefix: "espaces/" }))[0].map((f) => ({ nom: f.name, md5: f.metadata && f.metadata.md5Hash }));
      const lc = await liste(dst), plan = Sv.planCopie(await liste(src), lc);
      let copies = 0, erreurs = 0; const motifs = [];
      for (const nom of plan.copier) { try { await src.file(nom).copy(dst.file(nom)); copies++; } catch (er) { erreurs++; if (motifs.length < 5) motifs.push(nom.split("/").slice(-1)[0] + " : " + er.message); console.warn("copie", nom, er.message); } }
      for (const nom of plan.retirer) await dst.file(nom).delete().catch((er) => console.warn("retrait", nom, er.message));
      const r = { le, copies, retires: plan.retirer.length, erreurs, motifs, garde: plan.garde, total: lc.length - plan.retirer.length + plan.copier.length - erreurs, duree: Math.round((Date.now() - debut) / 1000), emplacement: dst.name };
      await ref.set(Sv.noterNuit((await ref.get()).data(), r));
      if (erreurs || plan.garde) await jAdmin("onco360", "sauvegarde", "", "", "Copie des fichiers : " + Sv.alerteCopie({ dernier: r })).catch(() => {});
      console.log("copie des fichiers :", copies, "copiés,", plan.retirer.length, "retirés,", erreurs, "erreur(s)", plan.garde ? "GARDE-FOU" : "");
      return { copies, retires: plan.retirer.length, erreurs, garde: plan.garde, emplacement: dst.name };
    } catch (er) {
      const r = { le, echec: String(er.message || er).slice(0, 300), copies: 0, erreurs: 0 };
      await ref.set(Sv.noterNuit((await ref.get().catch(() => null) || { data: () => null }).data(), r)).catch(() => {});
      await jAdmin("onco360", "sauvegarde", "", "", "Copie des fichiers en échec : " + r.echec).catch(() => {});
      throw er;
    }
  }
  const fichiersNuit = onSchedule({ schedule: "15 2 * * *", timeZone: TZ, timeoutSeconds: 540, memory: "512MiB" }, async () => { await sauvegarderFichiers(); });
  const fichiersSauvegarder = onCall({ timeoutSeconds: 540, memory: "512MiB" }, async (req) => {
    if (!(await estAdministrateur(req.auth && req.auth.uid))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
    return sauvegarderFichiers();
  });

  // ───── État des sauvegardes pour l'Administration (sans aucune donnée patient) ─────
  const alerteExport = (r, now) => { const d = r && r.dernier; if (r && r.actif === false) return ""; if (!d) return "aucun export de la semaine encore fait";
    const l = []; if (!d.ok) l.push("dernier export en échec : " + (d.erreur || "?")); if ((now - new Date(d.le).getTime()) / 864e5 > 8) l.push("pas d'export depuis le " + d.le.slice(0, 10));
    if (d.drive && !d.drive.ok) l.push("Google Drive : " + d.drive.erreur); return l.join(" ; "); };
  const sauvegardesEtat = onCall({ timeoutSeconds: 120, memory: "256MiB" }, async (req) => {
    if (!(await estAdministrateur(req.auth && req.auth.uid))) throw new HttpsError("permission-denied", "Réservé à l'administration d'Onco360.");
    const now = Date.now(), f = (await db.doc("plateforme/sauvegardeFichiers").get()).data() || null, cabinets = [];
    for (const d of (await db.collection("espaces").get()).docs) {
      const x = d.data() || {}; if (C.estBib(d.id) || x.bibliotheque) continue;
      const r = await reglageAuto(d.id), j = await db.doc("driveJetons/" + d.id).get();
      cabinets.push({ espace: d.id, nom: x.nom || d.id, demo: !!x.demo, suspendu: x.actif === false, actif: r.actif && !x.demo && x.actif !== false, garder: r.garder, dernier: r.dernier || null,
        drive: j.exists ? { email: j.data().email || "" } : null, alerte: x.demo || x.actif === false ? "" : alerteExport(r, now) });
    }
    return { fichiers: { dernier: f && f.dernier, nuits: ((f && f.nuits) || []).slice(0, 14), alerte: Sv.alerteCopie(f, now) }, cabinets };
  });

  return { exporterCabinet, exportsHebdo, exportAuto, recuperation, fichiersNuit, fichiersSauvegarder, sauvegardesEtat, _faireExport: faireExport };
};
