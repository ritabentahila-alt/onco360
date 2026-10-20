// Copie Drive de la nuit v11 (R-F6, 20/10/2026) : apps-script/onco360-sauvegarde.gs exécuté avec un faux Firestore (API REST) et un faux
// Drive, sans Google : format de l'export (dates gardées, références, journal d'audit), limite de 6 minutes, puis relue par l'outil de
// restauration (outils/restaurer-export.mjs lireExport + functions/exportation.js remettreDates).   node tests/moteur/test-copie-drive.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { lireExport } from "../../outils/restaurer-export.mjs";
const req = createRequire(new URL("../../functions/package.json", import.meta.url)), X = req("./exportation.js");
let ok = 0, ko = 0; const cas = (n, v, d) => { if (v) { ok++; console.log("  ✅ " + n); } else { ko++; console.log("  ❌ " + n + " " + JSON.stringify(d === undefined ? "" : d).slice(0, 300)); } };

// Faux Firestore (valeurs typées de l'API REST) : cabinet, 2 collections, un membre, 3 lignes d'audit
const T = (iso) => ({ timestampValue: iso }), S = (s) => ({ stringValue: s }), BASE = "projects/chimio-hgc/databases/(default)/documents/";
const DOCS = {
  "espaces/cabinet-bentahila": { titulaire: S("MED"), cree: T("2026-10-01T08:00:00Z") },
  "espaces/cabinet-bentahila/patients": [["P1", { identite: { mapValue: { fields: { nomF: S("FICTIF"), numero: S("202610001") } } }, maj: T("2026-10-19T08:30:00.123456Z"), version: { integerValue: "4" },
    fil: { arrayValue: { values: [{ mapValue: { fields: { le: T("2026-10-18T10:00:00Z"), txt: S("2026-10-18T10:00:00Z") } } }] } }, lien: { referenceValue: BASE + "espaces/cabinet-bentahila/etablissements/HGC" } }]],
  "espaces/cabinet-bentahila/membres": [["MED", { role: S("medecin") }]],
  "espaces/cabinet-bentahila/consultations": [["C1", { patientId: S("P1"), note: S("RAS"), poids: { doubleValue: 64.5 }, ok: { booleanValue: true }, rien: { nullValue: null } }]],
  "utilisateurs/MED": { nom: S("Dr Fictif") },
  "audit/cabinet-bentahila/lignes": [["A1", { le: T("2026-10-19T09:00:00Z"), type: S("ouverture") }], ["A2", { le: T("2026-10-19T09:01:00Z"), type: S("modification") }], ["A3", { le: T("2026-10-19T09:02:00Z"), type: S("creation") }]],
};
function lancer({ lent } = {}) {
  const crees = [], mails = [], horloge = { t: 0 };
  const rep = (code, o) => ({ getResponseCode: () => code, getContentText: () => JSON.stringify(o) });
  const UrlFetchApp = { fetch(url, o) {
    if (lent) horloge.t += lent;
    const ch = decodeURIComponent(url.replace(BASE.replace("projects/", "https://firestore.googleapis.com/v1/projects/"), "").replace("https://firestore.googleapis.com/v1/" + BASE, "")).split("?")[0];
    if (/:listCollectionIds$/.test(ch)) return rep(200, { collectionIds: ["consultations", "membres", "patients"] });
    const d = DOCS[ch];
    if (d === undefined) return rep(404, { error: "absent" });
    if (Array.isArray(d)) return rep(200, { documents: d.map(([id, f]) => ({ name: BASE + ch + "/" + id, fields: f })) });
    return rep(200, { name: BASE + ch, fields: d });
  } };
  const dossier = { getFoldersByName: () => ({ hasNext: () => false }), createFolder: () => dossier, getFilesByName: () => ({ hasNext: () => false }), getFiles: () => ({ hasNext: () => false }),
    createFile: (b) => { crees.push(b); return { getSize: () => b.texte.length }; } };
  const env = {
    UrlFetchApp, ScriptApp: { getOAuthToken: () => "jeton" }, DriveApp: { getFolderById: () => dossier },
    Utilities: { formatDate: () => "2026-10-20", newBlob: (texte, type, nom) => ({ texte, type, nom }) }, Session: { getEffectiveUser: () => ({ getEmail: () => "moi@test.ma" }) },
    MailApp: { sendEmail: (a, s, t) => mails.push(s) }, Logger: { log: () => {} }, Date: class extends Date { static now() { return Date.now() + horloge.t; } },
  };
  const code = readFileSync(new URL("../../apps-script/onco360-sauvegarde.gs", import.meta.url), "utf8");
  const f = new Function(...Object.keys(env), code + "\nreturn sauvegardeOnco360();");
  let msg = "", err = null; try { msg = f(...Object.values(env)); } catch (e) { err = e; }
  return { msg, err, crees, mails };
}

console.log("Copie de la nuit au format de l'export");
const r = lancer(), J = JSON.parse(r.crees[0].texte);
cas("un fichier Onco360_AAAA-MM-JJ.json", r.crees.length === 1 && r.crees[0].nom === "Onco360_2026-10-20.json" && !r.err, r.err && r.err.message);
cas("format de l'export : application, collections, profils, journal d'audit", J.application === "Onco360" && J.format === 1 && J.collections.patients.P1.identite.nomF === "FICTIF" && J.utilisateurs.MED.nom === "Dr Fictif" && Object.keys(J.journalAudit).length === 3, Object.keys(J));
cas("dates notées (cabinet, dossier, liste), un texte qui ressemble à une date reste un texte", JSON.stringify(J.dates["@cabinet"]) === '["cree"]' && JSON.stringify(J.dates["patients/P1"]) === '["maj","fil.0.le"]' && J.collections.patients.P1.fil[0].txt === "2026-10-18T10:00:00Z", J.dates);
cas("nombres, booléens, vide gardés ; référence → chemin du document, notée", J.collections.consultations.C1.poids === 64.5 && J.collections.consultations.C1.ok === true && J.collections.consultations.C1.rien === null && J.collections.patients.P1.version === 4 && J.collections.patients.P1.lien === "espaces/cabinet-bentahila/etablissements/HGC" && J.refs["patients/P1"][0] === "lien");
cas("journal d'audit avec ses dates", J.dates["@audit/A1"][0] === "le" && !J.incomplet);
console.log("Relue par l'outil de restauration");
const { J: J2, zip } = await lireExport(Buffer.from(r.crees[0].texte), "Onco360_2026-10-20.json");
const d = X.remettreDates(J2.collections.patients.P1, J2.dates["patients/P1"], (t) => ({ date: t }));
cas("acceptée par restaurer-export (copie Drive, sans ZIP)", J2.espace === "cabinet-bentahila" && zip === null);
cas("les dates redeviennent des dates à la restauration", d.maj.date === "2026-10-19T08:30:00.123Z" && d.fil[0].le.date === "2026-10-18T10:00:00.000Z" && typeof d.fil[0].txt === "string");
console.log("Limite de 6 minutes d'Apps Script");
const lent = lancer({ lent: 100000 });
cas("temps dépassé pendant les dossiers : sauvegarde annulée, rien écrit, e-mail d'alerte", lent.err && /Temps d'Apps Script dépassé/.test(lent.err.message) && !lent.crees.length && lent.mails.some((m) => /a échoué/.test(m)), lent.err && lent.err.message);
const limite = lancer({ lent: 70000 }), Jl = limite.crees[0] && JSON.parse(limite.crees[0].texte);
cas("temps dépassé pendant le journal d'audit : copie faite sans lui, signalée (fichier et e-mail)", Jl && /journal d'audit coupé/.test(Jl.incomplet) && Jl.collections.patients.P1 && limite.mails.some((m) => /incomplète/.test(m)), limite.err ? limite.err.message : Jl && Jl.incomplet);
console.log("\n" + ok + " réussis, " + ko + " échoués"); process.exit(ko ? 1 : 0);
