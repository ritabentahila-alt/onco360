// Onco360 – export complet d'un cabinet (étape 1.6, 11/10/2026) : logique pure, sans Firebase (testée par test-exportation.js).
// Le fichier ZIP contient : LISEZMOI.txt, donnees/onco360.json (toutes les collections du cabinet, profils de l'équipe, journal
// d'audit), patients.csv (un patient par ligne, ouvrable dans Excel), fichiers/ (documents déposés, en PDF), documentation/.

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
const nomPatient = (id) => sansSep(id.nom || [String(id.nomF || "").toUpperCase(), id.prenom].filter(Boolean).join(" "));

const COLONNES = ["N° de dossier", "Nom", "Prénom", "Nom complet", "Date de naissance", "Sexe", "Téléphone", "CIN", "Mutuelle", "Correspondant",
  "Diagnostic", "Établissement", "Identifiant Onco360"];
// Tableau des patients : { id: dossier } → texte CSV (avec en-tête), trié par nom
function csvPatients(patients, etabs) {
  const lignes = Object.keys(patients || {}).map((pid) => {
    const p = patients[pid] || {}, id = p.identite || {}, cl = p.clinique || {}, et = (etabs || {})[p.etablissementId] || {};
    return [id.numero, id.nomF, id.prenom, nomPatient(id), id.ddn, id.sexe, id.tel, id.cin, id.mut, id.cor, cl.diag, et.nom || p.etablissementId, pid];
  }).sort((a, b) => String(a[3]).localeCompare(String(b[3]), "fr"));
  return [COLONNES].concat(lignes).map((l) => l.map(cellule).join(";")).join("\r\n") + "\r\n";
}

// Nom de fichier sûr (Windows, Mac), sans barre ni caractère interdit
const sur = (s, max) => (sansSep(s).replace(/[\/\\:*?"<>|#\[\]]+/g, " ").replace(/\s+/g, " ").trim() || "document").slice(0, max || 80);
// Chemin d'un document déposé dans le ZIP : fichiers/<n° de dossier> <nom du patient>/<date> <titre>.pdf (sans doublon)
function cheminFichier(f, patients, deja) {
  const p = (patients || {})[f.patientId] || {}, id = p.identite || {};
  const dossier = sur([id.numero, nomPatient(id) || f.patientId].filter(Boolean).join(" "));
  const base = "fichiers/" + dossier + "/" + sur([f.d, f.titre || f.nom].filter(Boolean).join(" "), 100);
  let c = base + ".pdf", n = 2;
  while (deja && deja.has(c)) c = base + " (" + n++ + ").pdf";
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
    "  fichiers/             " + o.fichiers + " document(s) déposé(s) dans les dossiers, en PDF, rangés par patient.",
    "  documentation/        " + o.documentation + " fiche(s) de la documentation du cabinet (PDF).",
    o.manquants ? "\nAttention : " + o.manquants + " fichier(s) introuvable(s) dans le stockage n'ont pas pu être joints." : "",
    "",
    "Dans donnees/onco360.json, les champs « lignesJson », « planningJson », « rdvsJson », « rtsJson » et « data » sont eux-mêmes",
    "du JSON écrit en texte (lignes de chimiothérapie, planning, rendez-vous, radiothérapies, listes) : les relire avec JSON.parse.",
    "Les dates sont au format ISO (AAAA-MM-JJ ou AAAA-MM-JJTHH:MM:SSZ).",
    "",
    "Ce fichier contient des données de santé : à garder en lieu sûr, ne pas envoyer par e-mail ni WhatsApp.",
  ].join("\r\n");
}

module.exports = { plat, remettreDates, csvPatients, cheminFichier, lisezmoi, nomPatient, COLONNES };
