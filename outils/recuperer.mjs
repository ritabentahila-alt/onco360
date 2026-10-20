// Onco360 – récupérer UN dossier, UN document du cabinet ou TOUT le cabinet tel qu'il était (R-F2, R-F7, 20/10/2026), depuis le Mac.
// Même code que le bouton « Récupérer » d'Onco360 (functions/sauvegardes.js, fonction `recuperation`) : à utiliser si Onco360 est
// inaccessible, ou pour une base restaurée à côté (sauvegarde Firebase). Rien n'est écrit sans --oui : la commande montre d'abord ce qui
// serait remis. Ce qui a été créé depuis est gardé ; l'état d'avant est copié dans le stockage (espaces/<cabinet>/recuperations/…).
//
//   node outils/recuperer.mjs --cabinet <cabinet> --depuis <source> --liste
//   node outils/recuperer.mjs --cabinet <cabinet> --depuis <source> --dossier <n° de dossier | nom | identifiant> [--oui]
//   node outils/recuperer.mjs --cabinet <cabinet> --depuis <source> --document <collection/identifiant> [--oui]   (ex. bibliotheques/medicaments)
//   node outils/recuperer.mjs --cabinet <cabinet> --depuis <source> --tout [--oui]                                  (tout le cabinet)
//
// <source> : un fichier d'export (ZIP, donnees.json.gz, copie Drive .json), « heure:2026-10-19T09:30 » (heure du Maroc, moins de 7 jours),
// « base:onco360-restauree » (base restaurée à côté depuis une sauvegarde Firebase) ou « stockage:espaces/<cabinet>/recuperations/….json.gz »
// (copie faite avant une récupération : pour l'annuler). Projet : --projet <id> (défaut chimio-hgc).
// Prérequis (une fois) : gcloud auth application-default login ; cd functions && npm install. Mode d'emploi : outils/RESTAURER.md.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { lireExport } from "./restaurer-export.mjs";
const req = createRequire(new URL("../functions/package.json", import.meta.url));

// Heure du Maroc (« 2026-10-19T09:30 ») → instant ISO : lue à l'heure de ce Mac (au Maroc : la bonne, ramadan compris)
export function heureMarocVersIso(t) {
  const d = /^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d)?([zZ]|[+-]\d\d:?\d\d)?$/.test(t) ? new Date(t) : new Date(NaN);
  if (!isFinite(d)) throw new Error("Heure illisible : " + t + " (attendu : AAAA-MM-JJTHH:MM)");
  return d.toISOString();
}
// Appel du même code que la fonction serveur, sans passer par Internet (compte propriétaire du projet)
export function outil({ db, getStorage, getFirestore, auth, Timestamp, FieldValue }) {
  const ident = (o, f) => f, SV = req("./sauvegardes.js")({ db, getStorage, getFirestore, getAuth: () => auth, onCall: ident, onSchedule: ident,
    HttpsError: class extends Error { constructor(c, m) { super(m); this.code = c; } }, FieldValue, Timestamp, local: true,
    estAdministrateur: async () => false, membre: async () => ({ nom: "outil recuperer.mjs" }), jAdmin: async () => {}, oauth: async () => { throw new Error("sans Google"); }, SECRET: null, C: req("./cabinets.js") });
  return (data) => SV.recuperation({ auth: { uid: "outil-recuperer" }, data });
}
async function sourceDe(s) {
  if (/^heure:/.test(s)) return { type: "instant", le: heureMarocVersIso(s.slice(6)) };
  if (/^base:/.test(s)) return { type: "base", nom: s.slice(5) };
  if (/^stockage:/.test(s)) return { type: "stockage", chemin: s.slice(9) };
  const { J } = await lireExport(readFileSync(s), s); return { type: "export", J, nom: s.split("/").pop() };
}

if (process.argv[1] && import.meta.url === "file://" + process.argv[1]) {
  const a = process.argv.slice(2), val = (k) => (a.indexOf(k) >= 0 ? a[a.indexOf(k) + 1] : null), opt = (k) => a.indexOf(k) >= 0;
  const cab = val("--cabinet"), dep = val("--depuis"), projet = val("--projet") || "chimio-hgc";
  if (!cab || !dep || !(opt("--liste") || val("--dossier") || val("--document") || opt("--tout"))) { console.log(readFileSync(new URL(import.meta.url)).toString().split("\n").filter((l) => l.startsWith("//")).slice(4, 13).map((l) => l.slice(3)).join("\n")); process.exit(1); }
  const admin = req("firebase-admin"), { getFirestore, FieldValue, Timestamp } = req("firebase-admin/firestore"), { getStorage } = req("firebase-admin/storage");
  admin.initializeApp({ projectId: projet, storageBucket: process.env.STOCKAGE || projet + ".firebasestorage.app" });
  const appel = outil({ db: getFirestore(), getStorage, getFirestore, auth: admin.auth(), Timestamp, FieldValue });
  try {
    const source = await sourceDe(dep);
    if (opt("--liste")) {
      const l = await appel({ espace: cab, action: "liste", source });
      console.log("Patients dans la source (" + l.patients.length + ") — « effacé » = absent d'Onco360 aujourd'hui :");
      l.patients.forEach((p) => console.log("  " + (p.numero || "—").padEnd(11) + " " + (p.nom || "").padEnd(32) + " " + (p.existe ? "" : "EFFACÉ   ") + p.id));
      console.log("Documents du cabinet récupérables un par un : " + l.documents.map((d) => d.col + "/" + d.id).join(", "));
      process.exit(0);
    }
    let quoi;
    if (opt("--tout")) quoi = { cabinet: true };
    else if (val("--document")) quoi = { doc: val("--document").split("/") };
    else {
      const q = val("--dossier"), l = (await appel({ espace: cab, action: "liste", source })).patients, s = (x) => String(x || "").toLowerCase();
      const t = l.filter((p) => p.id === q || p.numero === q || s(p.nom).indexOf(s(q)) >= 0);
      if (t.length !== 1) { console.log(t.length ? "Plusieurs dossiers correspondent, précisez (n° de dossier) :\n" + t.map((p) => "  " + p.numero + " " + p.nom + " " + p.id).join("\n") : "Aucun dossier « " + q + " » dans la source (voir --liste)."); process.exit(1); }
      quoi = { patient: t[0].id };
    }
    const r = await appel({ espace: cab, action: opt("--oui") ? "appliquer" : "apercu", source, quoi, confirmer: opt("--oui") });
    console.log("Récupérer : " + r.cible + "\nDepuis : " + r.source + "\n" + r.resume);
    if (r.ecrit) console.log("FAIT : " + r.n + " élément(s) remis" + (r.pdf && (r.pdf.remis || r.pdf.introuvables) ? " ; PDF remis : " + r.pdf.remis + (r.pdf.introuvables ? ", introuvables : " + r.pdf.introuvables : "") : "") + ".\nPour annuler : même commande avec --depuis stockage:" + r.copie);
    else if (r.n) console.log("\nRien n'a été écrit. Pour le faire, relancer la même commande avec --oui");
    process.exit(0);
  } catch (e) { console.error("Impossible : " + e.message); process.exit(2); }
}
