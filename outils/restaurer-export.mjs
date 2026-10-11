// Onco360 – restaurer un export complet (étape 1.6, 11/10/2026) dans un cabinet, sur ce projet Firebase ou un projet vierge.
//
//   node outils/restaurer-export.mjs <export.zip> <cabinet-cible> [--projet <id-du-projet>]
//
// Écrit espaces/<cabinet-cible> (fiche du cabinet, toutes ses collections), les profils de l'équipe (utilisateurs/…), le journal
// d'audit (audit/<cabinet-cible>/lignes) et remet les documents déposés et la documentation dans le stockage (chemins adaptés
// au nouveau cabinet). Les dates redeviennent des dates Firestore (liste « dates » de l'export). Ne restaure pas les comptes de
// connexion (les mots de passe ne s'exportent pas) : recréer l'équipe, puis relier chaque compte au cabinet (comptes/{uid}).
// Mode d'emploi complet : outils/RESTAURER.md. Testé de bout en bout sur les émulateurs (tests/emulateur/test-export.mjs).
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const req = createRequire(new URL("../functions/package.json", import.meta.url));

const remplacerEspace = (txt, de, vers) => String(txt).split("espaces/" + de + "/").join("espaces/" + vers + "/");

// Cœur de la restauration (utilisé aussi par les tests) : zip = contenu du fichier, cible = identifiant du cabinet à écrire
export async function restaurer(zipBuffer, cible, { db, bucket, Timestamp }) {
  const JSZip = req("jszip"), X = req("./exportation.js");
  const zip = await JSZip.loadAsync(zipBuffer), J = JSON.parse(await zip.file("donnees/onco360.json").async("string"));
  if (J.application !== "Onco360" || !J.collections) throw new Error("Ce fichier n'est pas un export complet d'Onco360.");
  const de = J.espace, enDate = (t) => Timestamp.fromDate(new Date(t)), dates = (cle) => (J.dates || {})[cle];
  const prep = (cle, o) => X.remettreDates(o, dates(cle), enDate);
  const bilan = { documents: 0, fichiers: 0, profils: 0, audit: 0 };
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

  for (const [chemin, dansZip] of Object.entries(J.zip || {})) {
    const f = zip.file(dansZip); if (!f) continue;
    await bucket.file(remplacerEspace(chemin, de, cible)).save(await f.async("nodebuffer"), { contentType: "application/pdf" });
    bilan.fichiers++;
  }
  return bilan;
}

// Ligne de commande
if (process.argv[1] && import.meta.url === "file://" + process.argv[1]) {
  const [, , fichier, cible] = process.argv, i = process.argv.indexOf("--projet"), projet = i > 0 ? process.argv[i + 1] : "chimio-hgc";
  if (!fichier || !cible) { console.log("Usage : node outils/restaurer-export.mjs <export.zip> <cabinet-cible> [--projet <id>]"); process.exit(1); }
  const admin = req("firebase-admin");
  admin.initializeApp({ projectId: projet, storageBucket: process.env.STOCKAGE || projet + ".firebasestorage.app" });
  const b = await restaurer(readFileSync(fichier), cible, { db: admin.firestore(), bucket: admin.storage().bucket(), Timestamp: admin.firestore.Timestamp });
  console.log("Restauré dans espaces/" + cible + " : " + b.documents + " document(s), " + b.fichiers + " fichier(s), " + b.profils + " profil(s), " + b.audit + " ligne(s) d'audit.");
  process.exit(0);
}
