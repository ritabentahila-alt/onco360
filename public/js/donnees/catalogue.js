// Onco360 – catalogue de tout ce qui peut se régler, cabinet par cabinet (étape 16.1, 10/10/2026 ; plan : PLAN-ADMINISTRATION.md).
// C'est la liste de ce qui EXISTE dans le code ; l'administration choisit, pour chaque pack (formule) puis pour chaque cabinet, ce
// qui est présent, dans quel ordre. Une nouvelle entrée ici = du code à écrire (nouveau module, nouvelle fonction…).
// Réglage complet (même forme pour un pack et pour un cabinet) :
//   { menu: [clés du menu, dans l'ordre], modules: { clé: bool }, fonctions: { "module.fonction": bool }, accueil: [cartes, dans
//     l'ordre], sections: { clé: bool }, bibliotheques: { clé: bool }, max: { … } } — absent = présent (sauf modules : voir
//   abonnementEffectif dans modules.js).
import { MODULES, FORMULES } from "./modules.js";

// Menu : clé, libellé, module dont il dépend (null = toujours possible)
export const MENU = [
  ["accueil", "Tableau de bord", null], ["agenda", "Agenda / Rendez-vous", "agenda"], ["salle", "Salle d'attente", "salle"],
  ["patients", "Patients", null], ["taches", "Tâches", "taches"], ["protocoles", "Protocoles", "chimio"],
  ["parametres", "Paramètres", null], ["bilan", "Bilan", "bilan"], ["profil", "Profil", null],
];
// Fonctions de chaque module (partie 1.2 du plan, validée le 10/10/2026)
export const FONCTIONS = {
  agenda: [["vues", "Vues Jour, Semaine, Mois"], ["filtre", "Filtre par établissement"], ["report", "Venu / Non venu / report"], ["whatsapp", "Rappel WhatsApp"], ["horaires", "Horaires grisés"], ["absences", "Absences et jours fériés"]],
  salle: [["etats", "À venir, En salle, Vus, Absents"], ["prix", "Prix payé d'avance"], ["passage", "Numéro de passage"], ["commentaire", "Commentaire du jour"], ["attente", "Temps d'attente (orange, rouge)"], ["colonnes", "Colonnes au choix"], ["bulles", "Bulles dans le dossier"]],
  taches: [["toutes", "Toutes les tâches de l'équipe"], ["types", "Types de tâches"], ["urgent", "Urgent, échéance"], ["fil", "Fil : historique et commentaires"], ["reattribuer", "Réattribuer"], ["auto", "Tâches automatiques"], ["gagenda", "Échéances dans Google Agenda"]],
  rcp: [["inscription", "Inscription (question, date)"], ["calendrier", "Calendrier des semaines"], ["decision", "Décision, case Fait"], ["impression", "Impression de la liste"]],
  prescriptions: [["medic", "Médic."], ["exam", "Examens compl."], ["ordo", "Ordo. type"], ["analyse", "Analyses et bilans"], ["courrier", "Courriers"], ["doc", "Doc. (documentation remise)"], ["format", "Ordonnance A5 / A4 modifiable"], ["antecedents", "Antécédents (▾)"]],
  documents: [["depot", "Dépôt de fichiers"], ["types", "Types de documents"], ["rt", "Pli, compte rendu, rendez-vous RT"]],
  gagenda: [["liaison", "Lier mon Google Agenda"], ["filtre", "Ce que chacun y voit"], ["couleurs", "Couleurs par catégorie"]],
  listes: [["diag", "Diagnostics"], ["mut", "Mutuelles"], ["cor", "Correspondants"]],
  bilan: [["filtres", "Périodes et filtres"], ["paye", "Payé / à recevoir, payé auto."], ["versements", "Versements"], ["referents", "Référents"], ["rtprev", "Radiothérapies prévisionnelles"], ["exports", "Exports Excel / PDF"], ["comptable", "Relevé du comptable"]],
  chimio: [["lignes", "Lignes de traitement"], ["cures", "Cures J1 / J8 / J15"], ["doses", "Calcul des doses"], ["seances", "% et doses par séance"], ["molecules", "Molécules ajoutées / retirées"], ["report", "Report de cure"], ["fiche", "Fiche chimio A4"], ["planning", "Planning de l'hôpital de jour"], ["administrations", "Administrations (infirmière)"], ["protocoles", "Bibliothèque de protocoles"]],
  rt: [["prescription", "Prescription (acte, séances, VMAT)"], ["deroule", "Scanner → contourage → dosimétrie → séances → fin"], ["hebdo", "Consultations hebdomadaires"], ["taches", "Tâches fixes (contourage, dosimétrie, fin)"], ["documents", "Pli, compte rendu, rendez-vous"], ["tarifs", "Tarifs des actes RT"]],
};
// Cartes du tableau de bord (ordre de départ)
export const CARTES = [["ppas", "Pour commencer (cabinet neuf)"], ["jour", "Aujourd'hui"], ["sept", "Les 7 prochains jours"], ["taches", "Mes tâches"], ["conflits", "Conflits : rendez-vous à décaler"], ["stats", "Statistiques"]];
// Sections de paramétrage (page Paramètres), et si leurs valeurs viennent de la bibliothèque de la spécialité
export const SECTIONS = [
  ["horaires", "Créneaux & horaires", true], ["fermetures", "Fermetures, congés & jours fériés", true], ["lieux", "Lieux d'exercice", false], ["acces", "Accès (équipe)", false],
  ["audit", "Journal d'audit", false], ["whatsapp", "WhatsApp", true], ["couleurs", "Google Agenda", true], ["documents", "Documents (types)", true], ["taches", "Tâches", true],
  ["rcp", "RCP", true], ["listes", "Listes", true], ["bibliotheques", "Bibliothèques", true], ["impression", "Impression", true], ["alertes", "Alertes", true], ["activites", "Activités et rémunérations", true],
];
// Bibliothèques (copiées de la bibliothèque de la spécialité dans chaque cabinet neuf)
export const BIBLIOTHEQUES = [["protocoles", "Protocoles de chimiothérapie"], ["medicaments", "Médicaments"], ["ordostypes", "Ordonnances types"], ["analyses", "Analyses"], ["bilans", "Bilans biologiques"], ["examens", "Examens complémentaires"], ["courriers", "Courriers"], ["documentation", "Documentation (Doc.)"], ["diag", "Diagnostics"], ["mut", "Mutuelles"]];

// Réglage complet de départ d'un pack : ses modules ; tout le reste présent, dans l'ordre du catalogue
export function reglageDepart(f) {
  f = f || {}; const mods = f.modules || MODULES.map((m) => m[0]), on = (l) => l.reduce((o, [k]) => ((o[k] = true), o), {});
  const fonctions = {}; Object.entries(FONCTIONS).forEach(([m, l]) => l.forEach(([k]) => { fonctions[m + "." + k] = true; }));
  return { menu: MENU.map((x) => x[0]), modules: MODULES.reduce((o, [k]) => ((o[k] = mods.indexOf(k) >= 0), o), {}), fonctions,
    accueil: CARTES.map((x) => x[0]), sections: on(SECTIONS), bibliotheques: on(BIBLIOTHEQUES), max: Object.assign({}, f.max || {}) };
}
// Réglage d'un cabinet tel qu'il s'applique : complété avec le catalogue (ce qui a été ajouté au code depuis reste présent, sauf les
// modules) ; menu et cartes dans l'ordre choisi, suivis de ceux qui manquent
export function reglageEffectif(r) {
  const d = reglageDepart(), x = r || {}, ordre = (l, ref) => (Array.isArray(l) ? l.filter((k) => ref.indexOf(k) >= 0) : []).concat(ref.filter((k) => !(Array.isArray(l) && l.indexOf(k) >= 0)));
  return { menu: ordre(x.menu, d.menu), modules: Object.assign({}, d.modules, x.modules || {}), fonctions: Object.assign({}, d.fonctions, x.fonctions || {}),
    accueil: ordre(x.accueil, d.accueil), sections: Object.assign({}, d.sections, x.sections || {}), bibliotheques: Object.assign({}, d.bibliotheques, x.bibliotheques || {}), max: Object.assign({}, x.max || {}) };
}
export const FORMULES_DEPART = FORMULES;
