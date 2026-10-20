// Onco360 – récupérer un dossier, un document ou tout un cabinet (lot R-F, audit n° 8, 20/10/2026) : logique pure, sans Firebase
// (testée par test-restauration.js ; utilisée par les fonctions serveur `recuperation` et par outils/recuperer.mjs).
//
// Une « source » est un état passé du cabinet : la base telle qu'elle était à une heure donnée (moins de 7 jours, retour à la minute
// près de Firestore), un export (manuel ou automatique de la semaine), la copie faite avant une récupération, une base restaurée à côté.
// Tout est ramené au format de l'export complet : { collections: { col: { id: données } }, dates: { "col/id": [chemins des dates] } },
// valeurs « à plat » (dates en texte ISO, la liste `dates` dit lesquelles remettre en dates Firestore).
//
// Règles de la récupération (choix du 20/10/2026) :
//   • ce qui a été effacé depuis revient ; ce qui a été modifié depuis reprend sa valeur de la source ;
//   • ce qui a été créé depuis (consultation, ordonnance, tâche…) est GARDÉ (rien ne disparaît) ;
//   • l'état d'avant la récupération est d'abord copié (export de ce qui va être remplacé), ce qui permet de l'annuler ;
//   • jamais revenir en arrière sur : un reçu qui existe (numéros, annulations), l'équipe et ses droits (membres), les compteurs, le journal.
const X = require("./exportation");

// Ce qui fait un dossier patient : documents dont l'identifiant est celui du patient, et documents qui portent son patientId
const DOCS_PATIENT = ["patients", "patientsFinances", "encaissements", "rappels"];
const REQUETES_PATIENT = ["consultations", "documentsRT", "fichiers", "rcp", "taches", "salle", "recus", "administrations"];
// Documents « du cabinet » qu'on peut récupérer un par un (listes, paramètres, protocoles, tarifs et paiements, lieux)
const COLS_DOCUMENT = ["bibliotheques", "parametres", "protocoles", "finances", "etablissements", "comptabilite", "signataires"];
// Jamais récupérés (tout le cabinet compris) : équipe et droits, présence, journal du cabinet, compteurs, registre des tâches automatiques
const EXCLUS = ["membres", "presence", "historique", "salleOrdre", "recusCompteur", "tachesAuto"];
// Ajoutés s'ils manquent, jamais remplacés (un reçu numéroté, une administration notée ne reviennent jamais en arrière)
const AJOUT_SEUL = ["recus", "administrations"];

const LIB_COL = {
  patients: "Dossier (identité, fiche, chimiothérapie, radiothérapie, rendez-vous)", patientsFinances: "Montants", encaissements: "Encaissements",
  rappels: "Rappels WhatsApp envoyés", consultations: "Consultations et ordonnances", documentsRT: "Documents de radiothérapie",
  fichiers: "Documents déposés", rcp: "RCP", taches: "Tâches", salle: "Salle d'attente", recus: "Reçus", administrations: "Administrations notées",
  bibliotheques: "Bibliothèques", parametres: "Paramètres", protocoles: "Protocoles", finances: "Tarifs, paiements, versements",
  etablissements: "Lieux d'exercice", comptabilite: "Relevés du comptable", signataires: "Cartes des médecins",
};
const libCol = (c) => LIB_COL[c] || c;

// Valeur stable (clés triées) pour comparer deux versions d'un document, dates comprises
function stable(v) {
  if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + stable(v[k])).join(",") + "}";
  return JSON.stringify(v === undefined ? null : v);
}
// Champs qui changent à chaque écriture sans rien dire du contenu : ignorés pour dire « identique »
const TECHNIQUES = ["version", "maj", "majPar", "majParNom", "majLe"];
const sansTechnique = (o) => { if (!o || typeof o !== "object") return o; const r = Object.assign({}, o); TECHNIQUES.forEach((k) => delete r[k]); return r; };
const memes = (a, b) => stable(sansTechnique(a)) === stable(sansTechnique(b));

// Document Firestore (avec dates) → { data à plat, dates } ; même forme que l'export
function aplatir(data) { const dates = []; return { data: X.plat(data, dates), dates }; }

// Pièces d'un dossier dans un état (format export) : { "col/id": { data, dates } }
function piecesPatient(J, pid) {
  const C = (J && J.collections) || {}, D = (J && J.dates) || {}, r = {};
  const prendre = (col, id) => { r[col + "/" + id] = { data: C[col][id], dates: D[col + "/" + id] || [] }; };
  DOCS_PATIENT.forEach((col) => { if (C[col] && C[col][pid]) prendre(col, pid); });
  REQUETES_PATIENT.forEach((col) => Object.keys(C[col] || {}).forEach((id) => { if (C[col][id] && C[col][id].patientId === pid) prendre(col, id); }));
  return r;
}
// Un document du cabinet (bibliothèque, paramètre…)
function pieceDocument(J, col, id) {
  const C = (J && J.collections) || {}, D = (J && J.dates) || {};
  return C[col] && C[col][id] ? { [col + "/" + id]: { data: C[col][id], dates: D[col + "/" + id] || [] } } : {};
}
// Tout le cabinet (« recopier un cabinet », R-F7), sauf les collections exclues
function piecesCabinet(J) {
  const C = (J && J.collections) || {}, D = (J && J.dates) || {}, r = {};
  Object.keys(C).filter((col) => EXCLUS.indexOf(col) < 0).forEach((col) => Object.keys(C[col] || {}).forEach((id) => { r[col + "/" + id] = { data: C[col][id], dates: D[col + "/" + id] || [] }; }));
  return r;
}
const partsDe = (cle) => { const i = cle.indexOf("/"); return [cle.slice(0, i), cle.slice(i + 1)]; };

// Nom lisible d'un patient (identité de son dossier)
const nomDe = (p) => X.nomPatient((p && p.identite) || {}) || "";
// Patients d'un état, triés par nom : { id, nom, numero, ddn, existe (aujourd'hui) } ; sansNom = pour l'administration (numéro seul)
function listePatients(J, presents, sansNom) {
  const P = ((J && J.collections) || {}).patients || {}, ici = new Set(presents || []);
  return Object.keys(P).map((id) => { const p = P[id] || {}, idt = p.identite || {};
    return Object.assign({ id, numero: idt.numero || "", existe: ici.has(id) }, sansNom ? {} : { nom: nomDe(p), ddn: idt.ddn || "" }); })
    .sort((a, b) => String(a.nom || a.numero).localeCompare(String(b.nom || b.numero), "fr"));
}
// Documents du cabinet qu'on peut récupérer un par un : [{ col, id, lib }]
function listeDocuments(J) {
  const C = (J && J.collections) || {}, r = [];
  COLS_DOCUMENT.forEach((col) => Object.keys(C[col] || {}).sort().forEach((id) => r.push({ col, id, lib: libCol(col) + " › " + id })));
  return r;
}

// Comparaison d'un état passé (pieces de la source) et de l'état actuel (mêmes clés + celles créées depuis).
// → { remettre: [clés à écrire] (effaces + modifies), identiques, crees (créés depuis : gardés), gardes (reçus, administrations : jamais remplacés),
//     parCol: { col: { lib, remettre, effaces, modifies, identiques, crees, gardes } } }
function comparer(passe, present) {
  const r = { remettre: [], effaces: [], modifies: [], identiques: [], crees: [], gardes: [], parCol: {} };
  const col = (c) => (r.parCol[c] = r.parCol[c] || { lib: libCol(c), remettre: 0, effaces: 0, modifies: 0, identiques: 0, crees: 0, gardes: 0 });
  Object.keys(passe || {}).forEach((cle) => {
    const [c] = partsDe(cle), maintenant = (present || {})[cle], z = col(c);
    if (!maintenant) { r.remettre.push(cle); r.effaces.push(cle); z.remettre++; z.effaces++; return; }
    if (memes(passe[cle].data, maintenant.data)) { r.identiques.push(cle); z.identiques++; return; }
    if (AJOUT_SEUL.indexOf(c) >= 0) { r.gardes.push(cle); z.gardes++; return; }
    r.remettre.push(cle); r.modifies.push(cle); z.remettre++; z.modifies++;
  });
  Object.keys(present || {}).forEach((cle) => { if (!(passe || {})[cle]) { const [c] = partsDe(cle); r.crees.push(cle); col(c).crees++; } });
  return r;
}
// Phrase de résumé d'une comparaison
function resume(cmp) {
  const l = Object.values(cmp.parCol).filter((z) => z.remettre || z.crees || z.gardes).map((z) =>
    z.lib + " : " + [z.effaces ? z.effaces + " effacé(s) depuis, remis" : "", z.modifies ? z.modifies + " modifié(s) depuis, remis comme avant" : "",
      z.crees ? z.crees + " créé(s) depuis, gardé(s)" : "", z.gardes ? z.gardes + " gardé(s) tel(s) quel(s)" : ""].filter(Boolean).join(", "));
  return l.length ? l.join(" ; ") : "Rien à récupérer : tout est déjà comme dans la source.";
}

// Données à écrire pour une pièce (dates remises par `enDate`), avec la version du dossier toujours plus grande que l'actuelle
// (les postes ouverts voient « Ce dossier vient d'être modifié » et relisent) ; `extra` = champs posés par la récupération
function aEcrire(cle, piece, actuel, enDate, extra) {
  const [c] = partsDe(cle), d = X.remettreDates(piece.data, piece.dates, enDate);
  if (c === "patients") {
    const v = Math.max(Number((actuel && actuel.data && actuel.data.version) || 0), Number(d.version || 0)) + 1;
    Object.assign(d, { version: v }, extra || {});
  }
  return d;
}

// Chemin des documents déposés d'une pièce « fichiers » (pour remettre le PDF depuis la copie de secours s'il manque)
const cheminFichierDe = (cle, piece) => (partsDe(cle)[0] === "fichiers" && piece && piece.data && piece.data.chemin) || "";

// État « à plat » au format de l'export, fait de pièces (copie d'avant la récupération, réutilisable comme source pour l'annuler)
function versExport(pieces, o) {
  const J = Object.assign({ application: "Onco360", format: 1, sorte: "copie avant récupération", collections: {}, dates: {} }, o || {});
  Object.keys(pieces).forEach((cle) => { const [c, id] = partsDe(cle); (J.collections[c] = J.collections[c] || {})[id] = pieces[cle].data; if (pieces[cle].dates.length) J.dates[cle] = pieces[cle].dates; });
  return J;
}

// Heure demandée pour la base « à une heure donnée » : minute entière, entre 7 jours (moins 5 min de marge) et maintenant moins une minute
function instantValide(iso, maintenant) {
  const t = new Date(iso).getTime(), now = maintenant || Date.now();
  if (!isFinite(t)) return { erreur: "Heure illisible." };
  const m = Math.floor(t / 60000) * 60000;
  if (m > now - 60000) return { erreur: "Choisissez une heure passée (au moins une minute avant maintenant)." };
  if (m < now - 7 * 864e5 + 5 * 60000) return { erreur: "Au-delà de 7 jours, choisissez un export (copie de la semaine)." };
  return { t: m };
}

module.exports = { DOCS_PATIENT, REQUETES_PATIENT, COLS_DOCUMENT, EXCLUS, AJOUT_SEUL, libCol, stable, memes, aplatir, piecesPatient, pieceDocument,
  piecesCabinet, partsDe, listePatients, listeDocuments, comparer, resume, aEcrire, cheminFichierDe, versExport, instantValide, nomDe };
