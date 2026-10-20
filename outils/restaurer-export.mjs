// Onco360 – restaurer un export complet (étape 1.6, 11/10/2026 ; R-F3 du 20/10/2026) dans un cabinet, sur ce projet Firebase ou un projet vierge.
//
//   node outils/restaurer-export.mjs <export.zip | donnees.json(.gz) | copie Drive .json> <cabinet-cible> [--projet <id>] [--vider] [--comptes]
//
// Écrit espaces/<cabinet-cible> (fiche du cabinet, toutes ses collections), les profils de l'équipe (utilisateurs/…), le journal
// d'audit (audit/<cabinet-cible>/lignes) et remet les documents déposés et la documentation dans le stockage (chemins adaptés au nouveau
// cabinet, chaque document avec son vrai type). Les dates redeviennent des dates Firestore (liste « dates » de l'export).
//   • Cabinet cible NON VIDE : refusé (R-F3). Restaurer par-dessus ferait revenir en arrière ce qui a été modifié depuis l'export, sans rien
//     effacer de ce qui a été créé : pour UN dossier ou UN document, utiliser outils/recuperer.mjs (ou le bouton « Récupérer » d'Onco360).
//     --vider : le cabinet cible est d'abord copié dans un fichier (avant-restauration-<cabinet>-<date>.json, dossier courant) puis vidé.
//   • --comptes : recrée chaque compte de l'équipe absent avec LE MÊME identifiant et la même adresse (les droits, tâches, rendez-vous qui
//     citent cet identifiant restent justes), relie chaque compte au cabinet (comptes/{uid}) et affiche un lien pour choisir un mot de passe
//     (les mots de passe ne s'exportent jamais). Sans --comptes : la liste des comptes absents est affichée.
// Mode d'emploi complet : outils/RESTAURER.md. Testé de bout en bout sur les émulateurs (tests/emulateur/test-export.mjs).
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const req = createRequire(new URL("../functions/package.json", import.meta.url));

const remplacerEspace = (txt, de, vers) => String(txt).split("espaces/" + de + "/").join("espaces/" + vers + "/");

// Contenu d'un fichier → { J (données au format de l'export), zip (ou null) }
export async function lireExport(buf, nom) {
  const JSZip = req("jszip");
  if (buf[0] === 0x50 && buf[1] === 0x4b) { const zip = await JSZip.loadAsync(buf), f = zip.file("donnees/onco360.json"); if (!f) throw new Error("Ce ZIP n'est pas un export complet d'Onco360."); return { J: JSON.parse(await f.async("string")), zip }; }
  const texte = buf[0] === 0x1f && buf[1] === 0x8b ? gunzipSync(buf).toString() : buf.toString();
  const J = JSON.parse(texte); if (J.application !== "Onco360" || !J.collections) throw new Error((nom || "Ce fichier") + " n'est pas un export d'Onco360 (ni une copie Drive v11)."); return { J, zip: null };
}
// Le cabinet cible contient-il déjà quelque chose ?
async function contenu(db, cible) {
  const r = { fiche: (await db.doc("espaces/" + cible).get()).exists, collections: {} };
  for (const c of await db.doc("espaces/" + cible).listCollections()) { const s = await c.get(); if (s.size) r.collections[c.id] = s.size; }
  r.vide = !r.fiche && !Object.keys(r.collections).length; return r;
}
// Copie puis vidage du cabinet cible (--vider) : documents, journal d'audit, fichiers du stockage (sauf exports et copies de récupération)
async function vider(db, bucket, cible, X) {
  const copie = { application: "Onco360", format: 1, sorte: "avant restauration", espace: cible, date: new Date().toISOString(), collections: {}, dates: {} };
  const fiche = await db.doc("espaces/" + cible).get(); if (fiche.exists) { const l = []; copie.cabinet = X.plat(fiche.data(), l); if (l.length) copie.dates["@cabinet"] = l; }
  const refs = [];
  for (const c of await db.doc("espaces/" + cible).listCollections()) { copie.collections[c.id] = {}; (await c.get()).forEach((d) => { const l = []; copie.collections[c.id][d.id] = X.plat(d.data(), l); if (l.length) copie.dates[c.id + "/" + d.id] = l; refs.push(d.ref); }); }
  (await db.collection("audit/" + cible + "/lignes").get()).forEach((d) => refs.push(d.ref));
  const fichier = "avant-restauration-" + cible + "-" + new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-") + ".json";
  writeFileSync(fichier, JSON.stringify(copie));
  for (let i = 0; i < refs.length; i += 400) { const b = db.batch(); refs.slice(i, i + 400).forEach((r) => b.delete(r)); await b.commit(); }
  if (fiche.exists) await db.doc("espaces/" + cible).delete();
  const [fs] = await bucket.getFiles({ prefix: "espaces/" + cible + "/" }).catch(() => [[]]);
  for (const f of fs) if (!/\/(exports|recuperations)\//.test(f.name)) await f.delete().catch(() => {});
  return { fichier, documents: refs.length };
}

// Cœur de la restauration (utilisé aussi par les tests) : buf = contenu du fichier, cible = identifiant du cabinet à écrire
export async function restaurer(buf, cible, { db, bucket, Timestamp, auth, vider: viderAvant, comptes, nom }) {
  const X = req("./exportation.js"), { J, zip } = await lireExport(buf, nom);
  const etat = await contenu(db, cible);
  if (!etat.vide && !viderAvant) {
    const e = new Error("Le cabinet « " + cible + " » n'est pas vide (" + Object.entries(etat.collections).map(([c, n]) => n + " " + c).join(", ") + "). Rien n'a été écrit.\n" +
      "  • Pour récupérer UN dossier ou UN document : node outils/recuperer.mjs (ou le bouton « Récupérer » d'Onco360).\n" +
      "  • Pour remplacer tout le cabinet : relancer avec --vider (une copie du cabinet actuel est d'abord écrite dans un fichier).");
    e.nonVide = etat; throw e;
  }
  const bilan = { documents: 0, fichiers: 0, profils: 0, audit: 0, comptes: { recrees: [], deja: [], absents: [], conflits: [], liens: {} }, vide: null };
  if (!etat.vide) bilan.vide = await vider(db, bucket, cible, X);
  const de = J.espace, enDate = (t) => Timestamp.fromDate(new Date(t)), dates = (cle) => (J.dates || {})[cle];
  const prep = (cle, o) => X.remettreDates(o, dates(cle), enDate);
  let lot = db.batch(), n = 0;
  const ecrire = async (ref, data) => { lot.set(ref, data); bilan.documents++; if (++n >= 400) { await lot.commit(); lot = db.batch(); n = 0; } };

  await ecrire(db.doc("espaces/" + cible), prep("@cabinet", J.cabinet || {}));
  for (const [col, docs] of Object.entries(J.collections)) {
    for (const [id, data] of Object.entries(docs)) {
      let d = prep(col + "/" + id, data);
      if (de !== cible) {
        if (col === "fichiers" && d.chemin) d.chemin = remplacerEspace(d.chemin, de, cible);
        if (col === "bibliotheques" && id === "documentation" && typeof d.data === "string") d.data = remplacerEspace(d.data, de, cible);
      }
      await ecrire(db.doc("espaces/" + cible + "/" + col + "/" + id), d);
    }
  }
  for (const [uid, data] of Object.entries(J.utilisateurs || {})) { await ecrire(db.doc("utilisateurs/" + uid), prep("utilisateurs/" + uid, data)); bilan.profils++; }
  for (const [id, data] of Object.entries(J.journalAudit || {})) { await ecrire(db.doc("audit/" + cible + "/lignes/" + id), prep("@audit/" + id, data)); bilan.audit++; }
  if (n) await lot.commit();

  if (zip) for (const [chemin, dansZip] of Object.entries(J.zip || {})) {
    const f = zip.file(dansZip); if (!f) continue;
    await bucket.file(remplacerEspace(chemin, de, cible)).save(await f.async("nodebuffer"), { contentType: X.typeDe(chemin) || X.typeDe(dansZip) });
    bilan.fichiers++;
  }

  // Comptes de l'équipe (R-F3) : même identifiant, même adresse ; reliés au cabinet restauré
  if (auth) for (const uid of Object.keys(J.collections.membres || {})) {
    const c = (J.comptes || {})[uid] || {}, existe = await auth.getUser(uid).then(() => true).catch(() => false);
    if (existe) bilan.comptes.deja.push(uid);
    else if (!comptes) { bilan.comptes.absents.push(uid + (c.email ? " (" + c.email + ")" : "")); continue; }
    else if (!c.email) { bilan.comptes.conflits.push(uid + " : adresse inconnue (export d'avant le 20/10/2026) : recréer le membre dans Paramètres › Accès"); continue; }
    else {
      try { await auth.createUser({ uid, email: c.email }); bilan.comptes.recrees.push(uid + " (" + c.email + ")"); }
      catch (er) { bilan.comptes.conflits.push(uid + " (" + c.email + ") : " + (er.code === "auth/email-already-exists" ? "adresse déjà prise par un autre compte" : er.message)); continue; }
      bilan.comptes.liens[c.email] = await auth.generatePasswordResetLink(c.email).catch(() => "");
    }
    const ref = db.doc("comptes/" + uid), s = await ref.get(), av = s.exists ? s.data() : {}, l = [].concat(av.espaces || (av.espace ? [av.espace] : []));
    if (l.indexOf(cible) < 0) l.push(cible);
    await ref.set({ espace: av.espace || cible, espaces: l }, { merge: true });
  }
  return bilan;
}

// Ligne de commande
if (process.argv[1] && import.meta.url === "file://" + process.argv[1]) {
  const a = process.argv.slice(2), opt = (k) => a.indexOf(k) >= 0, val = (k) => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : null);
  const [fichier, cible] = a.filter((x, i) => !x.startsWith("--") && a[i - 1] !== "--projet"), projet = val("--projet") || "chimio-hgc";
  if (!fichier || !cible) { console.log("Usage : node outils/restaurer-export.mjs <export.zip | .json | .json.gz> <cabinet-cible> [--projet <id>] [--vider] [--comptes]"); process.exit(1); }
  const admin = req("firebase-admin");
  admin.initializeApp({ projectId: projet, storageBucket: process.env.STOCKAGE || projet + ".firebasestorage.app" });
  try {
    const b = await restaurer(readFileSync(fichier), cible, { db: admin.firestore(), bucket: admin.storage().bucket(), Timestamp: admin.firestore.Timestamp, auth: admin.auth(), vider: opt("--vider"), comptes: opt("--comptes"), nom: fichier });
    if (b.vide) console.log("Cabinet « " + cible + " » d'abord copié dans " + b.vide.fichier + " puis vidé (" + b.vide.documents + " document(s)).");
    console.log("Restauré dans espaces/" + cible + " : " + b.documents + " document(s), " + b.fichiers + " fichier(s), " + b.profils + " profil(s), " + b.audit + " ligne(s) d'audit.");
    const C = b.comptes;
    if (C.recrees.length) { console.log("Comptes recréés (même identifiant) : " + C.recrees.join(", ")); Object.entries(C.liens).forEach(([m, l]) => console.log("  Lien pour choisir un mot de passe, à envoyer à " + m + " :\n  " + l)); }
    if (C.absents.length) console.log("Comptes absents de ce projet (relancer avec --comptes pour les recréer) : " + C.absents.join(", "));
    if (C.conflits.length) console.log("À régler à la main : " + C.conflits.join(" ; "));
    process.exit(0);
  } catch (e) { console.error(e.message); process.exit(2); }
}
