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
  ["listes", "Listes", "Diagnostics, mutuelles, correspondants : contenu de la bibliothèque de la spécialité, modifiable dans Paramètres › Listes"],
  ["bilan", "Bilan financier", "Page Bilan, exports"],
];
// Modules et menus par spécialité (10/10/2026) : un module sans famille sert à toutes les spécialités ; sinon il appartient à la
// famille d'une bibliothèque (ex. Chimiothérapie et protocoles : Oncologie – Radiothérapie). Menu toujours présent : MENU_COMMUN.
export const MODULE_FAMILLE = { chimio: "bib-oncologie", rt: "bib-oncologie" };
export const MODULE_MENU = { chimio: "Menu « Protocoles » ; onglet Chimiothérapie du dossier", rt: "Onglet Radiothérapie du dossier", agenda: "Menu « Agenda / Rendez-vous »", salle: "Menu « Salle d'attente »", taches: "Menu « Tâches »", rcp: "Bouton « + RCP » du dossier ; onglet RCP des Tâches", prescriptions: "Boutons Médic., Examens compl., Ordo. type, Analyses, Courriers, Doc. du dossier", documents: "Onglet Documents du dossier ; pli, compte rendu", gagenda: "Paramètres › Google Agenda", listes: "Paramètres › Listes", bilan: "Menu « Bilan »" };
export const MENU_COMMUN = ["Tableau de bord", "Patients (dossiers, consultations, rendez-vous)", "Paramètres", "Profil"];
// Modules prévus pour d'autres spécialités (à construire, feuille de route étape 14)
export const MODULES_PREVUS = [["stocks", "Traitements et stocks", "bib-generaliste"], ["materiel", "Matériel et consommables", "bib-generaliste"]];
export const ROLES_MAX = [["medecin", "Médecins"], ["assistante", "Secrétaires"], ["infirmiere", "Infirmières"], ["comptable", "Comptables"], ["etablissements", "Lieux d'exercice"], ["patients", "Dossiers patients"]];
// Spécialités (09/10/2026) : chaque formule appartient à une spécialité. Médecine générale et gynécologie : modules à créer plus
// tard (feuille de route), avec leurs propres formules.
// Une seule spécialité d'oncologie depuis le 10/10/2026 (oncologie médicale, radiothérapie, onco-radiothérapie = packs) ; anciens noms
// reconnus (SPECIALITE_ANCIENNE) pour les packs enregistrés avant
export const SPECIALITES = ["Oncologie – Radiothérapie", "Médecine générale", "Gynécologie"];
export const specialiteDe = (s) => (["Oncologie médicale", "Radiothérapie", "Oncologie-radiothérapie"].indexOf(s) >= 0 ? "Oncologie – Radiothérapie" : s || "Oncologie – Radiothérapie");
// Bibliothèques de référence par spécialité (10/10/2026) : ce que reçoit un cabinet neuf selon la spécialité de sa formule
export const BIBLIOTHEQUES_SPE = [
  { id: "bib-oncologie", lib: "Oncologie – Radiothérapie", specialites: ["Oncologie – Radiothérapie", "Oncologie médicale", "Radiothérapie", "Oncologie-radiothérapie"] },
  { id: "bib-generaliste", lib: "Médecine générale", specialites: ["Médecine générale"] },
  { id: "bib-gynecologie", lib: "Gynécologie", specialites: ["Gynécologie"] },
];
// Formules proposées par Onco360 (modifiables par l'administration ; « essentiel », « radiotherapie » et « complet » gardent
// leur identifiant d'origine pour les cabinets qui les ont déjà)
const COMMUNS = ["agenda", "prescriptions", "documents", "listes", "gagenda", "bilan"], EQUIPE = ["salle", "taches", "rcp"];
const f = (specialite, lib, modules, max) => ({ lib, specialite, modules: MODULES.map((m) => m[0]).filter((k) => modules.indexOf(k) >= 0), max });
const mx = (medecin, assistante, infirmiere, etablissements, patients, comptable = null) => ({ medecin, assistante, infirmiere, comptable, etablissements, patients });
export const FORMULES = {
  essentiel: f("Oncologie – Radiothérapie", "Oncologie – Essentiel", ["chimio"].concat(COMMUNS), mx(1, 1, 0, 1, 300)),
  "onco-pro": f("Oncologie – Radiothérapie", "Oncologie – Pro", ["chimio"].concat(COMMUNS, EQUIPE), mx(1, 2, 2, 2, 1000)),
  "onco-clinique": f("Oncologie – Radiothérapie", "Oncologie – Clinique", ["chimio"].concat(COMMUNS, EQUIPE), mx(5, 5, 10, null, null)),
  radiotherapie: f("Oncologie – Radiothérapie", "Radiothérapie – Essentiel", ["rt"].concat(COMMUNS), mx(1, 1, 0, 1, 300)),
  "rt-pro": f("Oncologie – Radiothérapie", "Radiothérapie – Pro", ["rt"].concat(COMMUNS, EQUIPE), mx(1, 2, 1, 2, 1000)),
  "rt-centre": f("Oncologie – Radiothérapie", "Radiothérapie – Centre", ["rt"].concat(COMMUNS, EQUIPE), mx(5, 5, 5, null, null)),
  "oncort-pro": f("Oncologie – Radiothérapie", "Onco-radiothérapie – Pro", ["chimio", "rt"].concat(COMMUNS, EQUIPE), mx(1, 2, 2, 2, 1000)),
  complet: f("Oncologie – Radiothérapie", "Onco-radiothérapie – Clinique", ["chimio", "rt"].concat(COMMUNS, EQUIPE), mx(5, 5, 10, null, null)),
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
