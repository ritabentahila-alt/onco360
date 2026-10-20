// Onco360 – export complet d'un cabinet (étape 1.6, 11/10/2026) : logique pure, sans Firebase (testée par test-exportation.js).
// Le fichier ZIP contient : LISEZMOI.txt, donnees/onco360.json (toutes les collections du cabinet, profils de l'équipe, journal
// d'audit), patients.csv (un patient par ligne, ouvrable dans Excel), fichiers/ (documents déposés), documentation/.
// R-F6 (20/10/2026) : chaque document garde sa vraie extension (.pdf, ou .jpg, .docx… pour les dépôts d'avant le 11/10) ; le téléphone
// est écrit en texte pour Excel (le 0 du début n'est plus retiré).

// Valeur Firestore → valeur JSON simple (dates en texte ISO), récursif. Si `dates` est donné, le chemin de chaque date
// (ex. "maj", "fil.0.le") y est noté : la restauration les remet en dates Firestore (rien n'est perdu).
function plat(v, dates, chemin) {
  if (v == null) return v;
  if (typeof v.toDate === "function") { if (dates) dates.push(chemin || ""); return v.toDate().toISOString(); }
  const sous = (k) => (chemin ? chemin + "." : "") + k;
  if (Array.isArray(v)) return v.map((x, i) => plat(x, dates, sous(i)));
  if (typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = plat(v[k], dates, sous(k)); return o; }
  return v;
}
// Restauration : remet en dates (via `enDate`) les champs notés par plat ; renvoie une copie
function remettreDates(o, dates, enDate) {
  const r = JSON.parse(JSON.stringify(o));
  for (const ch of dates || []) {
    const parts = String(ch).split("."); let x = r;
    for (let i = 0; i < parts.length - 1 && x != null; i++) x = x[parts[i]];
    const k = parts[parts.length - 1];
    if (x != null && typeof x[k] === "string") x[k] = enDate(x[k]);
  }
  return r;
}

const sansSep = (s) => String(s == null ? "" : s).replace(/[\r\n]+/g, " ").trim();
// Une cellule CSV (séparateur « ; » pour Excel en français)
const cellule = (s) => { const t = sansSep(s); return /[";]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
// Cellule lue comme du texte par Excel (="06…" : sinon Excel en fait un nombre et retire le 0 du début)
const texte = (s) => { const t = sansSep(s).replace(/"/g, ""); return t ? '="' + t + '"' : ""; };
const nomPatient = (id) => sansSep(id.nom || [String(id.nomF || "").toUpperCase(), id.prenom].filter(Boolean).join(" "));

const COLONNES = ["N° de dossier", "Nom", "Prénom", "Nom complet", "Date de naissance", "Sexe", "Téléphone", "CIN", "Mutuelle", "Correspondant",
  "Diagnostic", "Établissement", "Identifiant Onco360"];
// Tableau des patients : { id: dossier } → texte CSV (avec en-tête), trié par nom
function csvPatients(patients, etabs) {
  const lignes = Object.keys(patients || {}).map((pid) => {
    const p = patients[pid] || {}, id = p.identite || {}, cl = p.clinique || {}, et = (etabs || {})[p.etablissementId] || {};
    return [id.numero, id.nomF, id.prenom, nomPatient(id), id.ddn, id.sexe, texte(id.tel), id.cin, id.mut, id.cor, cl.diag, et.nom || p.etablissementId, pid];
  }).sort((a, b) => String(a[3]).localeCompare(String(b[3]), "fr"));
  return [COLONNES].concat(lignes).map((l) => l.map(cellule).join(";")).join("\r\n") + "\r\n";
}

// Nom de fichier sûr (Windows, Mac), sans barre ni caractère interdit
const sur = (s, max) => (sansSep(s).replace(/[\/\\:*?"<>|#\[\]]+/g, " ").replace(/\s+/g, " ").trim() || "document").slice(0, max || 80);
// Extension d'un document : celle de son nom (ou de son chemin dans le stockage), sinon d'après son type, sinon .pdf (R-F6)
const TYPES = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", heic: "image/heic",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", txt: "text/plain", rtf: "application/rtf", odt: "application/vnd.oasis.opendocument.text",
  zip: "application/zip", json: "application/json", gz: "application/gzip" };
function extension(f) {
  for (const n of [f && f.nom, f && f.chemin]) { const m = /\.([a-z0-9]{1,5})$/i.exec(String(n || "")); if (m && TYPES[m[1].toLowerCase()]) return "." + m[1].toLowerCase(); }
  const t = String((f && (f.mime || f.contentType)) || "").toLowerCase(), k = Object.keys(TYPES).find((x) => TYPES[x] === t);
  return "." + (k || "pdf");
}
// Type d'un fichier d'après son nom (restauration : le document est remis avec son vrai type)
const typeDe = (nom) => TYPES[extension({ nom }).slice(1)];
// Chemin d'un document déposé dans le ZIP : fichiers/<n° de dossier> <nom du patient>/<date> <titre>.<extension> (sans doublon)
function cheminFichier(f, patients, deja) {
  const p = (patients || {})[f.patientId] || {}, id = p.identite || {};
  const dossier = sur([id.numero, nomPatient(id) || f.patientId].filter(Boolean).join(" "));
  const base = "fichiers/" + dossier + "/" + sur([f.d, f.titre || f.nom].filter(Boolean).join(" "), 100), ext = extension(f);
  let c = base + ext, n = 2;
  while (deja && deja.has(c)) c = base + " (" + n++ + ")" + ext;
  if (deja) deja.add(c);
  return c;
}

function lisezmoi(o) {
  return [
    "Onco360 – export complet du cabinet « " + (o.cabinet || o.espace) + " »",
    "Fait le " + o.date + " par " + (o.par || "le médecin titulaire") + ".",
    "",
    "Contenu :",
    "  patients.csv          " + o.patients + " patient(s), une ligne chacun (s'ouvre dans Excel ; séparateur « ; »).",
    "  donnees/onco360.json  toutes les données du cabinet : dossiers (identité, chimiothérapie, radiothérapie, rendez-vous…),",
    "                        consultations et ordonnances, montants, tarifs, paramètres, protocoles, tâches, salle d'attente,",
    "                        équipe et profils, journal d'audit. Format JSON : lisible par tout logiciel ou développeur.",
    "  fichiers/             " + o.fichiers + " document(s) déposé(s) dans les dossiers, rangés par patient (PDF ; les plus anciens dans leur format d'origine).",
    "  documentation/        " + o.documentation + " fiche(s) de la documentation du cabinet (PDF).",
    o.manquants ? "\nAttention : " + o.manquants + " fichier(s) introuvable(s) dans le stockage n'ont pas pu être joints." : "",
    "",
    "Dans donnees/onco360.json, les champs « lignesJson », « planningJson », « rdvsJson », « rtsJson » et « data » sont eux-mêmes",
    "du JSON écrit en texte (lignes de chimiothérapie, planning, rendez-vous, radiothérapies, listes) : les relire avec JSON.parse.",
    "Les dates sont au format ISO (AAAA-MM-JJ ou AAAA-MM-JJTHH:MM:SSZ). Dans patients.csv, le téléphone est écrit =\"06…\" pour qu'Excel garde le 0.",
    "Pour remettre ces données dans Onco360 : guide « En cas de problème » (Paramètres › Cabinet › Export des données).",
    "",
    "Ce fichier contient des données de santé : à garder en lieu sûr, ne pas envoyer par e-mail ni WhatsApp.",
  ].join("\r\n");
}

module.exports = { plat, remettreDates, csvPatients, cheminFichier, extension, typeDe, lisezmoi, nomPatient, COLONNES, TYPES };
