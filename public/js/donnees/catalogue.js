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
// Fonctions de chaque module (partie 1.2 du plan, validée le 10/10/2026) ; 3e élément true = fonction de base, toujours présente avec
// son module (la retirer casserait le module : lignes et cures de chimio, venu / non venu…)
export const FONCTIONS = {
  agenda: [["vues", "Vues Jour, Semaine, Mois"], ["filtre", "Filtre par établissement"], ["report", "Venu / Non venu / report", true], ["whatsapp", "Rappel WhatsApp"], ["horaires", "Horaires grisés"], ["absences", "Absences et jours fériés"]],
  salle: [["etats", "À venir, En salle, Vus, Absents", true], ["prix", "Prix payé d'avance"], ["passage", "Numéro de passage"], ["commentaire", "Commentaire du jour"], ["attente", "Temps d'attente (orange, rouge)"], ["colonnes", "Colonnes au choix"], ["bulles", "Bulles dans le dossier"]],
  taches: [["toutes", "Toutes les tâches de l'équipe"], ["types", "Types de tâches"], ["urgent", "Urgent, échéance"], ["fil", "Fil : historique et commentaires", true], ["reattribuer", "Réattribuer"], ["auto", "Tâches automatiques"], ["gagenda", "Échéances dans Google Agenda"]],
  rcp: [["inscription", "Inscription (question, date)", true], ["calendrier", "Calendrier des semaines", true], ["decision", "Décision, case Fait", true], ["impression", "Impression de la liste"]],
  prescriptions: [["medic", "Médic."], ["exam", "Examens compl."], ["ordo", "Ordo. type"], ["analyse", "Analyses et bilans"], ["courrier", "Courriers"], ["doc", "Doc. (documentation remise)"], ["format", "Ordonnance A5 / A4 modifiable"], ["antecedents", "Antécédents (▾)"]],
  documents: [["depot", "Dépôt de fichiers"], ["types", "Types de documents"], ["rt", "Pli, compte rendu, rendez-vous RT"]],
  gagenda: [["liaison", "Lier mon Google Agenda", true], ["filtre", "Ce que chacun y voit"], ["couleurs", "Couleurs par catégorie"]],
  listes: [["diag", "Diagnostics", true], ["mut", "Mutuelles", true], ["cor", "Correspondants"]],
  bilan: [["filtres", "Périodes et filtres"], ["paye", "Payé / à recevoir, payé auto.", true], ["versements", "Versements"], ["referents", "Référents"], ["rtprev", "Radiothérapies prévisionnelles"], ["exports", "Exports Excel / PDF"], ["comptable", "Relevé du comptable"]],
  chimio: [["lignes", "Lignes de traitement", true], ["cures", "Cures J1 / J8 / J15", true], ["doses", "Calcul des doses", true], ["seances", "% et doses par séance", true], ["molecules", "Molécules ajoutées / retirées"], ["report", "Report de cure"], ["fiche", "Fiche chimio A4"], ["planning", "Planning de l'hôpital de jour", true], ["protocoles", "Bibliothèque de protocoles"]],
  rt: [["prescription", "Prescription (acte, séances, VMAT)", true], ["deroule", "Scanner → contourage → dosimétrie → séances → fin", true], ["hebdo", "Consultations hebdomadaires"], ["taches", "Tâches fixes (contourage, dosimétrie, fin)"], ["documents", "Pli, compte rendu, rendez-vous"], ["tarifs", "Tarifs des actes RT"]],
};
// Fonctions déjà reliées à l'écran (ou au serveur) le 10/10/2026 ; les autres sont enregistrées mais pas encore appliquées (« bientôt »)
export const FONCTIONS_RELIEES = ["prescriptions.medic", "prescriptions.exam", "prescriptions.ordo", "prescriptions.analyse", "prescriptions.courrier", "prescriptions.doc",
  "prescriptions.format", "prescriptions.antecedents", "taches.auto", "taches.toutes", "taches.types", "taches.urgent", "taches.reattribuer", "taches.gagenda",
  "rcp.impression", "bilan.exports", "bilan.filtres", "bilan.versements", "bilan.referents", "bilan.rtprev", "bilan.comptable",
  "agenda.whatsapp", "agenda.vues", "agenda.filtre", "agenda.horaires", "agenda.absences",
  "salle.prix", "salle.passage", "salle.commentaire", "salle.attente", "salle.colonnes", "salle.bulles",
  "documents.depot", "documents.types", "documents.rt", "gagenda.filtre", "gagenda.couleurs", "listes.cor",
  "chimio.fiche", "chimio.protocoles", "chimio.molecules", "chimio.report", "rt.taches", "rt.hebdo", "rt.documents", "rt.tarifs"];
// Fiche patient (10/10/2026) : champs existants [clé, libellé, partie (identite | clinique), base = toujours présent], dans l'ordre de
// départ (celui d'aujourd'hui pour l'oncologie). Champs ajoutés par l'administration (pack ou cabinet) : reglage.fiche.ajouts =
// [{ id: "x…", lib, type: texte|nombre|date|choix|ouinon, choix: […], partie, imprimer, entete }] ; valeurs dans identite.extra /
// clinique.extra du dossier.
const ordre = (l, ref) => (Array.isArray(l) ? l.filter((k, i) => ref.indexOf(k) >= 0 && l.indexOf(k) === i) : []).concat(ref.filter((k) => !(Array.isArray(l) && l.indexOf(k) >= 0)));
export const FICHE = [
  ["nom", "Nom", "identite", true], ["prenom", "Prénom", "identite", true], ["ddn", "Date de naissance", "identite"], ["sexe", "Sexe", "identite"],
  ["taille", "Taille", "clinique"], ["poids", "Poids", "clinique"], ["diag", "Diagnostic", "clinique"], ["tel", "Téléphone", "identite"], ["tel2", "2e téléphone", "identite"],
  ["etab", "Hôpital (lieu d'exercice)", "identite", true], ["ald", "ALD", "identite"], ["cor", "Correspondant", "identite"], ["mut", "Mutuelle", "identite"],
  ["adresse", "Adresse", "identite"], ["email", "E-mail", "identite"], ["allergies", "Allergies", "clinique"], ["atcdMed", "Antécédents médicaux", "clinique"],
  ["atcdFam", "Antécédents familiaux", "clinique"], ["modeVie", "Mode de vie", "clinique"], ["traitCours", "Traitement en cours", "clinique"],
];
export const TYPES_CHAMP = [["texte", "Texte"], ["nombre", "Nombre"], ["date", "Date"], ["choix", "Liste de choix"], ["ouinon", "Oui / Non"]];
export function ficheEffective(f) {
  const x = f || {}, ajouts = (Array.isArray(x.ajouts) ? x.ajouts : []).filter((a) => a && /^x[a-z0-9]{3,20}$/.test(a.id || "") && a.lib);
  const ref = FICHE.map((c) => c[0]).concat(ajouts.map((a) => a.id)), champs = {};
  ref.forEach((k) => { champs[k] = !(x.champs && x.champs[k] === false); }); FICHE.forEach(([k, , , base]) => { if (base) champs[k] = true; });
  return { ordre: ordre(x.ordre, ref), champs, ajouts };
}
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

// Réglage d'un cabinet (espaces/{e}.abonnement.reglage, 10/10/2026), retouché depuis l'administration sur la base de son pack (les
// modules et les maximums restent dans l'abonnement) :
//   { menu: [ordre du menu], accueil: [ordre des cartes], cartes: { carte: bool }, ordreSections: [ordre des onglets des Paramètres],
//     sections: { onglet: bool }, bibliotheques: { bibliothèque: bool }, fonctions: { "module.fonction": bool } }
// Absent = présent, dans l'ordre du catalogue (ce qui est ajouté au code plus tard apparaît à la fin).
const vrais = (l) => l.reduce((o, [k]) => ((o[k] = true), o), {});
export const toutesFonctions = () => { const o = {}; Object.entries(FONCTIONS).forEach(([m, l]) => l.forEach(([k]) => { o[m + "." + k] = true; })); return o; };
export const fonctionsDeBase = () => { const o = {}; Object.entries(FONCTIONS).forEach(([m, l]) => l.forEach(([k, , base]) => { if (base) o[m + "." + k] = true; })); return o; };
export function reglageEffectif(r) {
  const x = r || {}, b = (o, d) => Object.assign(d, Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => k in d && typeof v === "boolean")));
  return { menu: ordre(x.menu, MENU.map((m) => m[0])), accueil: ordre(x.accueil, CARTES.map((c) => c[0])), cartes: b(x.cartes, vrais(CARTES)),
    ordreSections: ordre(x.ordreSections, SECTIONS.map((c) => c[0])), sections: b(x.sections, vrais(SECTIONS)), bibliotheques: b(x.bibliotheques, vrais(BIBLIOTHEQUES)), fonctions: Object.assign(b(x.fonctions, toutesFonctions()), fonctionsDeBase()), fiche: ficheEffective(x.fiche) };
}
// Éléments de l'écran liés à une bibliothèque (bouton du dossier, carte de Paramètres › Bibliothèques) : data-bib
export const BIB_BOUTON = { medicaments: "medic", ordostypes: "ordo", analyses: "analyse", examens: "exam", courriers: "courrier", documentation: "doc" };
// Feuille de style qui cache ce qui est retiré du cabinet : [data-fn~="module.fonction"], [data-bib~="bibliothèque"], [data-carte~="carte"]
export function styleRetraits(R) {
  const sel = Object.keys(R.fonctions).filter((k) => R.fonctions[k] === false).map((k) => '[data-fn~="' + k + '"]')
    .concat(Object.keys(R.bibliotheques).filter((k) => R.bibliotheques[k] === false).map((k) => '[data-bib~="' + k + '"]'));
  return sel.length ? sel.join(",") + "{display:none!important}" : "";
}
export const FORMULES_DEPART = FORMULES;
