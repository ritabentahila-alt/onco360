// Onco360 – modules et formules d'abonnement par cabinet (phase F, 09/10/2026, décidé par Dr Bentahila : formules toutes prêtes
// puis retouches module par module ; nombre maximum de comptes par rôle ; module retiré = caché, données gardées).
// Choisis par le compte d'administration (page Administration, fonction abonnementCabinet) dans espaces/{e}.abonnement =
// { formule, modules: { clé: true|false }, max: { medecin, assistante, infirmiere, etablissements, patients } } (null = sans limite).
// Cabinet sans abonnement (cabinet de Dr Bentahila, cabinets créés avant) : tout, sans limite.
// Même liste côté serveur : functions/cabinets.js (vérifié par node functions/test-cabinets.js).
export const MODULES = [
  ["chimio", "Chimiothérapie et protocoles", "Lignes, cures, doses, fiche chimio, bibliothèque de protocoles"],
  ["rt", "Radiothérapie", "Prescriptions, scanner, contourage, dosimétrie, séances"],
  ["agenda", "Agenda", "Page Agenda (jour, semaine, mois)"],
  ["salle", "Salle d'attente", "Arrivées, en salle, vus, absents"],
  ["taches", "Tâches", "Tâches de l'équipe, tâches automatiques"],
  ["rcp", "RCP", "Inscriptions, calendrier, décisions (demande le module Tâches)"],
  ["prescriptions", "Prescriptions et bibliothèques", "Médicaments, ordonnances types, analyses, examens, courriers, documentation"],
  ["documents", "Documents", "Documents déposés, pli confidentiel, compte rendu"],
  ["gagenda", "Google Agenda", "Chacun relie son Google Agenda"],
  ["listes", "Listes", "Diagnostics et mutuelles modifiables (Paramètres › Listes)"],
  ["bilan", "Bilan financier", "Page Bilan, exports"],
];
export const ROLES_MAX = [["medecin", "Médecins"], ["assistante", "Secrétaires"], ["infirmiere", "Infirmières"], ["etablissements", "Lieux d'exercice"], ["patients", "Dossiers patients"]];
// Spécialités (09/10/2026) : chaque formule appartient à une spécialité. Médecine générale et gynécologie : modules à créer plus
// tard (feuille de route), avec leurs propres formules.
export const SPECIALITES = ["Oncologie médicale", "Radiothérapie", "Oncologie-radiothérapie", "Médecine générale", "Gynécologie"];
// Formules proposées par Onco360 (modifiables par l'administration ; « essentiel », « radiotherapie » et « complet » gardent
// leur identifiant d'origine pour les cabinets qui les ont déjà)
const COMMUNS = ["agenda", "prescriptions", "documents", "listes", "gagenda", "bilan"], EQUIPE = ["salle", "taches", "rcp"];
const f = (specialite, lib, modules, max) => ({ lib, specialite, modules: MODULES.map((m) => m[0]).filter((k) => modules.indexOf(k) >= 0), max });
const mx = (medecin, assistante, infirmiere, etablissements, patients) => ({ medecin, assistante, infirmiere, etablissements, patients });
export const FORMULES = {
  essentiel: f("Oncologie médicale", "Oncologie – Essentiel", ["chimio"].concat(COMMUNS), mx(1, 1, 0, 1, 300)),
  "onco-pro": f("Oncologie médicale", "Oncologie – Pro", ["chimio"].concat(COMMUNS, EQUIPE), mx(1, 2, 2, 2, 1000)),
  "onco-clinique": f("Oncologie médicale", "Oncologie – Clinique", ["chimio"].concat(COMMUNS, EQUIPE), mx(5, 5, 10, null, null)),
  radiotherapie: f("Radiothérapie", "Radiothérapie – Essentiel", ["rt"].concat(COMMUNS), mx(1, 1, 0, 1, 300)),
  "rt-pro": f("Radiothérapie", "Radiothérapie – Pro", ["rt"].concat(COMMUNS, EQUIPE), mx(1, 2, 1, 2, 1000)),
  "rt-centre": f("Radiothérapie", "Radiothérapie – Centre", ["rt"].concat(COMMUNS, EQUIPE), mx(5, 5, 5, null, null)),
  "oncort-pro": f("Oncologie-radiothérapie", "Onco-radiothérapie – Pro", ["chimio", "rt"].concat(COMMUNS, EQUIPE), mx(1, 2, 2, 2, 1000)),
  complet: f("Oncologie-radiothérapie", "Onco-radiothérapie – Clinique", ["chimio", "rt"].concat(COMMUNS, EQUIPE), mx(5, 5, 10, null, null)),
};
// Abonnement tel qu'il s'applique : sans abonnement, tous les modules ; avec un abonnement, seulement les modules cochés (un module
// créé plus tard, ex. pour la médecine générale, n'apparaît pas chez les cabinets qui ne l'ont pas reçu) ; maximum absent = sans
// limite ; RCP sans Tâches = sans RCP
export function abonnementEffectif(ab) {
  const m = {}, x = {}, a = ab || {};
  MODULES.forEach(([k]) => { m[k] = !a.modules || a.modules[k] === true; });
  if (!m.taches) m.rcp = false;
  ROLES_MAX.forEach(([k]) => { const v = a.max && a.max[k]; x[k] = v == null || v === "" || isNaN(v) ? null : Math.max(0, Math.floor(Number(v))); });
  return { formule: a.formule || "", modules: m, max: x };
}
