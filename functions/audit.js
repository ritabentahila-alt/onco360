// Onco360 – journal d'audit (étape 9 S1, 09/10/2026). Logique pure, sans Firebase (tests : node functions/test-audit.js).
// Décidé par Dr Bentahila le 09/10/2026 : modifications, suppressions et ouvertures de dossier ; pour une modification, la partie
// du dossier touchée (sans recopier les valeurs) ; lu par le médecin titulaire seul ; tout est gardé (durée à fixer avec le juriste).
// Les lignes sont écrites par le serveur (déclencheur à chaque écriture, avec l'identité réelle de la personne connectée) dans
// espaces/{e}/audit/{id} ; aucune règle ne permet de les écrire, modifier ou effacer depuis le navigateur.

// Collections non notées : le journal lui-même, les signaux de présence (notés comme « ouverture »), les registres du serveur
const IGNOREES = ["audit", "presence", "compteurs", "tachesAuto", "historique"];
const COLLECTIONS = {
  patients: "Dossier patient", patientsFinances: "Montants (honoraires)", encaissements: "Encaissements", consultations: "Consultation",
  fichiers: "Document déposé", documentsRT: "Document de radiothérapie", rcp: "RCP", taches: "Tâche", salle: "Salle d'attente",
  administrations: "Administration (soins)", membres: "Accès et droits", etablissements: "Lieu d'exercice", parametres: "Paramètres",
  protocoles: "Protocoles", bibliotheques: "Bibliothèques", finances: "Finances (tarifs, paiements)",
};
// Parties d'un dossier patient
const CHAMPS_PATIENT = { identite: "Identité", clinique: "Fiche patient", lignesJson: "Chimiothérapie", planningJson: "Planning de chimiothérapie", rdvsJson: "Rendez-vous", rtsJson: "Radiothérapie", etablissementId: "Établissement" };
// Champs techniques jamais cités (mis à jour à chaque écriture)
const TECHNIQUES = ["maj", "majPar", "majParNom", "majLe", "version", "resume", "o", "le", "infosLe", "infosPar", "etatPar"];
const egal = (a, b) => JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);

function type(avant, apres) { return !avant ? "creation" : !apres ? "suppression" : "modification"; }
// Ce qui a changé : parties du dossier (patients) ou noms des champs (autres collections), sans les valeurs
function quoi(col, avant, apres) {
  const a = avant || {}, b = apres || {}, cles = [...new Set(Object.keys(a).concat(Object.keys(b)))].filter((k) => TECHNIQUES.indexOf(k) < 0 && !egal(a[k], b[k]));
  if (col === "patients") { const l = cles.map((k) => CHAMPS_PATIENT[k]).filter(Boolean); return l.length ? [...new Set(l)] : []; }
  return cles.slice(0, 12);
}
// Patient concerné : l'identifiant du document (dossier, montants, encaissements) ou son champ patientId
const patientDe = (col, id, d) => (["patients", "patientsFinances", "encaissements"].indexOf(col) >= 0 ? id : (d && typeof d.patientId === "string" ? d.patientId : ""));
const nomIdentite = (d) => { const i = (d && d.identite) || {}; return [String(i.nom || "").toUpperCase(), i.prenom || ""].filter(Boolean).join(" "); };
// Libellé lisible de l'élément (titre de la consultation, de la tâche, code du lieu…)
const element = (col, id, d) => { d = d || {}; return String(d.titre || d.nom || d.code || (col === "parametres" || col === "bibliotheques" || col === "finances" || col === "protocoles" ? id : "")).slice(0, 80); };

// Ligne d'audit d'une écriture (ou null si rien à noter : collection ignorée, écriture sans changement réel)
function ligne(col, id, avant, apres, qui) {
  if (IGNOREES.indexOf(col) >= 0) return null;
  const t = type(avant, apres), q = t === "modification" ? quoi(col, avant, apres) : [];
  if (t === "modification" && !q.length) return null; // seulement un champ technique (résumé recalculé, version…)
  const d = apres || avant || {};
  return { type: t, col, lib: COLLECTIONS[col] || col, docId: id, element: element(col, id, d), quoi: q,
    patientId: patientDe(col, id, d), patientNom: col === "patients" ? nomIdentite(d) : String(d.patientNom || "").slice(0, 80),
    par: qui.par || "", via: qui.via || "", pour: qui.pour || "" };
}
// Qui a écrit : la personne connectée (app_user) ; une fonction serveur (admin) agit pour l'auteur noté dans le document
function auteur(authType, authId, apres) {
  if (authType === "app_user" && authId) return { par: authId, via: "onco360" };
  return { par: "", via: "serveur", pour: (apres && typeof apres.majPar === "string" && apres.majPar) || "" };
}
// Ouverture de dossier (signal de présence) : à noter si c'est un autre dossier, ou le même après plus de 30 min sans signal
const TRENTE_MIN = 30 * 60 * 1000;
function ouverture(avant, apres, msAvant, msApres) {
  const p = apres && apres.patientId; if (!p) return false;
  if (!avant || avant.patientId !== p) return true;
  return !(msAvant && msApres && msApres - msAvant < TRENTE_MIN);
}
// Export du journal (page Journal d'audit) : texte CSV pour Excel (point-virgule, guillemets doublés)
const csv = (lignes) => lignes.map((l) => l.map((v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"').join(";")).join("\r\n");

module.exports = { IGNOREES, COLLECTIONS, CHAMPS_PATIENT, type, quoi, patientDe, nomIdentite, ligne, auteur, ouverture, csv, TRENTE_MIN };
