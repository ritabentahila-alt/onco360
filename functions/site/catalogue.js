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
  ["patients", "Patients", null], ["taches", "Tâches", "taches"], ["rcp", "RCP", "rcp"], ["protocoles", "Protocoles", "chimio"], // RCP : menu (R-B1, 19/10/2026)
  ["parametres", "Paramètres", null], ["bilan", "Bilan", "bilan"], ["profil", "Mon compte", null],
];
// Fonctions de chaque module (partie 1.2 du plan, validée le 10/10/2026) ; 3e élément true = fonction de base, toujours présente avec
// son module (la retirer casserait le module : lignes et cures de chimio, venu / non venu…)
export const FONCTIONS = {
  agenda: [["vues", "Vues Jour, Semaine, Mois"], ["filtre", "Filtre par établissement"], ["report", "Venu / Non venu / report", true], ["whatsapp", "Rappel WhatsApp"], ["horaires", "Horaires grisés"], ["absences", "Absences et jours fériés"]],
  salle: [["etats", "À venir, En salle, Vus, Absents", true], ["prix", "Prix payé d'avance"], ["passage", "Numéro de passage"], ["commentaire", "Commentaire du jour"], ["attente", "Temps d'attente (orange, rouge)"], ["colonnes", "Colonnes au choix"], ["bulles", "Bulles dans le dossier"]],
  taches: [["toutes", "Toutes les tâches de l'équipe"], ["types", "Types de tâches"], ["urgent", "Urgent, échéance"], ["fil", "Fil : historique et commentaires", true], ["reattribuer", "Réattribuer"], ["auto", "Tâches automatiques"], ["gagenda", "Échéances dans Google Agenda"]],
  rcp: [["inscription", "Inscription (question, date)", true], ["calendrier", "Calendrier des semaines", true], ["decision", "Décision, case Fait", true], ["impression", "Impression de la liste"]],
  prescriptions: [["medic", "Médic."], ["exam", "Examens compl."], ["ordo", "Ordo. type"], ["analyse", "Analyses et bilans"], ["courrier", "Courriers"], ["doc", "Doc. (documentation remise)"], ["format", "Ordonnance A5 / A4 modifiable"], ["antecedents", "Antécédents (▾)"], ["compteur", "Nombre d'ordonnances faites (barre du dossier)"]],
  documents: [["depot", "Dépôt de fichiers"], ["types", "Types de documents"], ["rt", "Pli, compte rendu, rendez-vous RT"]],
  gagenda: [["liaison", "Lier mon Google Agenda", true], ["filtre", "Ce que chacun y voit"], ["couleurs", "Couleurs par catégorie"]],
  listes: [["diag", "Diagnostics", true], ["mut", "Mutuelles", true], ["cor", "Correspondants"]],
  bilan: [["filtres", "Périodes et filtres"], ["paye", "Payé / à recevoir, payé auto.", true], ["versements", "Versements"], ["referents", "Référents"], ["rtprev", "Radiothérapies prévisionnelles"], ["exports", "Exports Excel / PDF"], ["comptable", "Relevé du comptable"]],
  chimio: [["lignes", "Lignes de traitement", true], ["cures", "Cures J1 / J8 / J15", true], ["doses", "Calcul des doses", true], ["seances", "% et doses par séance", true], ["molecules", "Molécules ajoutées / retirées"], ["report", "Report de cure"], ["fiche", "Fiche chimio A4"], ["planning", "Planning de l'hôpital de jour", true], ["protocoles", "Bibliothèque de protocoles"]],
  rt: [["prescription", "Prescription (acte, séances, VMAT)", true], ["deroule", "Scanner → contourage → dosimétrie → séances → fin", true], ["hebdo", "Consultations hebdomadaires"], ["taches", "Tâches fixes (contourage, dosimétrie, fin)"], ["documents", "Pli, compte rendu, rendez-vous"], ["tarifs", "Tarifs des actes RT"]],
};
// Fonctions déjà reliées à l'écran (ou au serveur) le 10/10/2026 ; les autres sont enregistrées mais pas encore appliquées (« bientôt »)
export const FONCTIONS_RELIEES = ["prescriptions.medic", "prescriptions.exam", "prescriptions.ordo", "prescriptions.analyse", "prescriptions.courrier", "prescriptions.doc",
  "prescriptions.format", "prescriptions.antecedents", "prescriptions.compteur", "taches.auto", "taches.toutes", "taches.types", "taches.urgent", "taches.reattribuer", "taches.gagenda",
  "rcp.impression", "bilan.exports", "bilan.filtres", "bilan.versements", "bilan.referents", "bilan.rtprev", "bilan.comptable",
  "agenda.whatsapp", "agenda.vues", "agenda.filtre", "agenda.horaires", "agenda.absences",
  "salle.prix", "salle.passage", "salle.commentaire", "salle.attente", "salle.colonnes", "salle.bulles",
  "documents.depot", "documents.types", "documents.rt", "gagenda.filtre", "gagenda.couleurs", "listes.cor",
  "chimio.fiche", "chimio.protocoles", "chimio.molecules", "chimio.report", "rt.taches", "rt.hebdo", "rt.documents", "rt.tarifs"];
// Fiche patient (10/10/2026) : champs existants [clé, libellé, partie (identite | clinique), base = toujours présent], dans l'ordre de
// départ (celui d'aujourd'hui pour l'oncologie). Champs ajoutés par l'administration (pack ou cabinet) : reglage.fiche.ajouts =
// [{ id: "x…", lib, type: texte|nombre|date|choix|ouinon, choix: […], partie, imprimer, entete }] ; valeurs dans identite.extra /
// clinique.extra du dossier.
// Ordre réglé + champs du catalogue ajoutés depuis (ex. CIN, 10/10/2026) : placés juste après le champ qui les précède dans le
// catalogue (CIN après Diagnostic), pas à la fin ; les autres manquants à la fin
function ordreAvecNouveaux(l, ref, cat) {
  if (!Array.isArray(l) || !l.length) return ref.slice();
  const r = l.filter((k, i) => ref.indexOf(k) >= 0 && l.indexOf(k) === i);
  cat.forEach((k, i) => { if (r.indexOf(k) >= 0) return; let j = -1; for (let p = i - 1; p >= 0 && j < 0; p--) j = r.indexOf(cat[p]); r.splice(j + 1, 0, k); });
  ref.forEach((k) => { if (r.indexOf(k) < 0) r.push(k); });
  return r;
}
// Entrées ajoutées au menu après que des cabinets ont réglé le leur (R-B1, 19/10/2026) : placées juste après l'entrée qui les précède dans le
// catalogue (« RCP » sous « Tâches ») ; toute autre entrée absente : à la fin, comme avant
const MENU_NOUVEAUX = ["rcp"];
function menuAvecNouveaux(l) {
  const ref = MENU.map((m) => m[0]), r = ordre(Array.isArray(l) ? l.filter((k) => MENU_NOUVEAUX.indexOf(k) < 0 || l.indexOf(k) >= 0) : l, ref.filter((k) => MENU_NOUVEAUX.indexOf(k) < 0 || (Array.isArray(l) && l.indexOf(k) >= 0)));
  ref.forEach((k, i) => { if (r.indexOf(k) >= 0) return; const j = r.indexOf(ref[i - 1]); r.splice(j >= 0 ? j + 1 : r.length, 0, k); });
  return r;
}
const ordre = (l, ref) => (Array.isArray(l) ? l.filter((k, i) => ref.indexOf(k) >= 0 && l.indexOf(k) === i) : []).concat(ref.filter((k) => !(Array.isArray(l) && l.indexOf(k) >= 0)));
export const FICHE = [
  ["nom", "Nom", "identite", true], ["prenom", "Prénom", "identite", true], ["ddn", "Date de naissance", "identite"], ["sexe", "Sexe", "identite"],
  ["taille", "Taille", "clinique"], ["poids", "Poids", "clinique"], ["diag", "Diagnostic", "clinique"], ["diagP", "Précision du diagnostic", "clinique"], ["cin", "CIN", "identite"], ["tel", "Téléphone", "identite"], ["tel2", "2e téléphone", "identite"],
  ["etab", "Hôpital (lieu d'exercice)", "identite", true], ["ald", "ALD", "identite"], ["cor", "Correspondant", "identite"], ["mut", "Mutuelle", "identite"],
  ["adresse", "Adresse", "identite"], ["email", "E-mail", "identite"], ["allergies", "Allergies", "clinique"], ["atcdMed", "Antécédents médicaux", "clinique"],
  ["atcdFam", "Antécédents familiaux", "clinique"], ["modeVie", "Mode de vie", "clinique"], ["traitCours", "Traitement en cours", "clinique"],
];
// En tête du dossier (sous le nom du patient) au départ : ce qui y est aujourd'hui (10/10/2026) ; réglable champ par champ (entetes)
export const ENTETE0 = ["ddn", "sexe", "taille", "poids", "diag", "diagP", "cin", "tel", "tel2", "etab", "ald", "cor", "mut"]; // diagP : précision (3.11, avant affichée avec le diagnostic)
export const TOUJOURS_ENTETE = ["nom", "prenom"]; // le nom du patient : toujours en tête
// R-G a (audit n° 5, 19/10/2026) : bandeau du dossier. Ligne 1 : « Chimio en cours », « RT en cours » ; ligne 2 : valeurs calculées proposées à
// cocher (surface corporelle, localisation et stade). Rangées avec les champs dans entetes (clés commençant par « _ ») ; [clé, libellé, ligne]
export const ENTETE_CALC = [["_med", "Médecin du patient (plusieurs médecins)", 1], ["_chimio", "Chimio en cours (C3/6)", 1], ["_rt", "RT en cours", 1], ["_sc", "Surface corporelle", 2], ["_locst", "Localisation et stade", 2]];
export const ENTETE_CALC0 = { _med: true, _chimio: true, _rt: true, _sc: false, _locst: false };
export const TYPES_CHAMP = [["texte", "Texte"], ["textelong", "Texte long (plusieurs lignes)"], ["nombre", "Nombre"], ["date", "Date"], ["choix", "Liste de choix"], ["ouinon", "Oui / Non"], ["ouinonp", "Oui / Non + précision"]];
// 3.11 (12/10/2026) – chaque champ de la fiche a un type, affiché et modifiable par le cabinet (types), sauf ceux dont dépendent un calcul,
// une liste du cabinet ou un format (FIXES : la raison affichée) ; « oui / non + précision » : case à remplir si « oui » (valeur : le texte
// dans le champ, le oui / non dans champ + « Oui » ; pour l'allergie : allergie / allergies, comme avant)
export const TYPE_FICHE0 = { nom: "texte", prenom: "texte", ddn: "date", sexe: "sexe", taille: "nombre", poids: "nombre", diag: "liste", diagP: "texte", cin: "texte", tel: "tel", tel2: "tel",
  etab: "etab", ald: "ouinon", cor: "liste", mut: "liste", adresse: "texte", email: "email", allergies: "ouinonp", atcdMed: "textelong", atcdFam: "textelong", modeVie: "textelong", traitCours: "textelong" };
export const FIXES = { nom: "nom du dossier", prenom: "nom du dossier", ddn: "sert à l'âge (doses)", sexe: "sert à la clairance (doses)", taille: "sert à la surface corporelle (doses)",
  poids: "sert aux doses", etab: "hôpital du dossier", diag: "liste des localisations", cor: "liste des correspondants", mut: "liste des mutuelles", tel: "numéro de téléphone", tel2: "numéro de téléphone", email: "adresse e-mail" };
export const LISTES_CAB = { diag: "diag", cor: "cor", mut: "mut", xtstade: "stade", xtgrade: "grade" }; // champs dont la liste est celle du cabinet (parametres/listes)
export const UNITE0 = { taille: "cm", poids: "kg" };
export const libType = (t) => ({ sexe: "Femme / Homme", liste: "liste du cabinet", tel: "téléphone", email: "e-mail", etab: "hôpital" }[t] || ((TYPES_CHAMP.find((z) => z[0] === t) || [])[1] || t).toLowerCase());
export const drapeau = (k) => (k === "allergies" ? "allergie" : k + "Oui"); // « oui / non » d'un champ « oui / non + précision »
// Fiche tumeur (3.1, 12/10/2026, décisions de Dr Bentahila) : champs de la spécialité Oncologie, ajoutés d'office à la fiche des cabinets
// d'oncologie / radiothérapie (formEffectif, s._onco) ; chaque cabinet les affiche ou non, en tête du dossier ou non (Paramètres › Cabinet ›
// Fiche patient). Valeurs dans clinique.extra. La localisation est le champ « Diagnostic » (diag, « Cancer du … », repris par les comptes
// rendus) ; sa précision (diagP) suit le stade. Biomarqueurs proposés selon la localisation (si.diag : familles reconnues dans le diagnostic).
// Listes du stade et du grade : réglables dans Paramètres › Listes (parametres/listes { stade, grade }), sinon celles-ci.
export const STADES = ["In situ", "Localisé", "Localement avancé", "Oligométastatique", "Métastatique", "Récidive locale", "Récidive locorégionale", "Récidive métastatique"];
export const GRADES = ["1", "2", "3", "4", "Bas grade", "Haut grade"];
// Familles de tumeurs reconnues dans le diagnostic (sans accents, en capitales) : biomarqueurs proposés
const sa = (t) => String(t || "").replace(/Œ/g, "OE").replace(/œ/g, "oe").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
export const FAMILLES_DIAG = { sein: /SEIN/, poumon: /POUMON|BRONCH|MESOTHEL/, colorectal: /COLON|RECTUM|COLORECT|APPENDICE|GRELE/, estomac: /ESTOMAC|GASTRIQUE|CARDIA/,
  oesophage: /OESOPHAG/, endometre: /ENDOMETR|CORPS DE L.UTERUS/, ovaire: /OVAIRE|TROMPE|PERITOINE PRIMITIF/, pancreas: /PANCREA|AMPOULE/, biliaire: /BILIAIRE|VESICULE|CHOLANGIO/,
  prostate: /PROSTATE/, melanome: /MELANOME/, thyroide: /THYROIDE/, orl: /ORL|VADS|LARYNX|PHARYNX|CAVITE BUCCALE|LANGUE|LEVRE|SINUS|FOSSES NASALES|SALIVAIRE|PAROTIDE|CAVUM/,
  col: /COL DE L.UTERUS|COL UTERIN/, vessie: /VESSIE|UROTHEL|VOIES URINAIRES|VOIES EXCRETRICES/, inconnu: /PRIMITIF INCONNU|SANS PRIMITIF/ };
export const famillesDiag = (diag) => Object.keys(FAMILLES_DIAG).filter((k) => FAMILLES_DIAG[k].test(sa(diag)));
const pour = (...l) => ({ diag: l });
const NF = "Non fait";
const BIO = ["xtre", "xtrp", "xther2", "xtki67", "xtpdl1", "xtegfr", "xtalk", "xtkras", "xtbraf", "xtmsi"];
export const TUMEUR = [
  { id: "xtcote", lib: "Côté", choix: ["Droit", "Gauche", "Bilatéral", "Sans objet"] },
  { id: "xtstade", lib: "Stade", choix: STADES, entete: true },
  { id: "xthisto", lib: "Histologie", type: "texte" },
  { id: "xtre", lib: "RE", choix: ["Positif", "Négatif", NF], si: pour("sein", "endometre") },
  { id: "xtrp", lib: "RP", choix: ["Positif", "Négatif", NF], si: pour("sein", "endometre") },
  { id: "xther2", lib: "HER2", choix: ["0", "1+", "2+ (ISH négative)", "2+ (ISH positive)", "3+", NF], si: pour("sein", "estomac", "oesophage", "colorectal", "biliaire") },
  { id: "xtki67", lib: "Ki-67 (%)", type: "nombre", si: pour("sein") },
  { id: "xtpdl1", lib: "PD-L1", type: "texte", si: pour("poumon", "sein", "estomac", "oesophage", "orl", "col", "vessie", "melanome") },
  { id: "xtegfr", lib: "EGFR", choix: ["Muté", "Non muté", NF], si: pour("poumon") },
  { id: "xtalk", lib: "ALK", choix: ["Réarrangé", "Non réarrangé", NF], si: pour("poumon") },
  { id: "xtkras", lib: "KRAS", choix: ["Muté", "Non muté", NF], si: pour("poumon", "colorectal", "pancreas") },
  { id: "xtbraf", lib: "BRAF", choix: ["Muté (V600E)", "Muté (autre)", "Non muté", NF], si: pour("poumon", "colorectal", "melanome", "thyroide") },
  { id: "xtmsi", lib: "MSI", choix: ["MSI (instable)", "MSS (stable)", NF], si: pour("colorectal", "endometre", "estomac", "pancreas", "biliaire", "ovaire", "prostate") },
  { id: "xtgrade", lib: "Grade", choix: GRADES },
  { id: "xtctnm", lib: "cTNM", type: "texte" },
  { id: "xtptnm", lib: "pTNM", type: "texte" },
  { id: "xtdiagd", lib: "Date du diagnostic", type: "date" },
  { id: "xtoms", lib: "État général (OMS)", choix: ["0", "1", "2", "3", "4"], entete: true },
].map((a) => Object.assign({ partie: "clinique", type: "choix", imprimer: false, entete: false, tumeur: true }, a));
// Ordre de la fiche tumeur : la localisation (diag) d'abord, la précision (diagP) après le stade, les biomarqueurs après l'histologie
export const ORDRE_TUMEUR = ["diag", "xtcote", "xtstade", "diagP", "xthisto"].concat(BIO, ["xtgrade", "xtctnm", "xtptnm", "xtdiagd"]);
// État général (OMS) : dans les informations médicales, avant la taille et le poids (12/10/2026)
// 3.4 (12/10/2026) – formulaires de consultation proposés aux cabinets d'oncologie (formEffectif, s._onco), retirables champ par champ
// (Paramètres › Cabinet › Formulaire de consultation ; « formulaire simple » = type, date, titre, note) : « Consultation d'oncologie »
// (cs: onco) et « RT hebdomadaire » (cs: rt) ; le formulaire affiché suit le type de consultation (formConsult). Valeurs dans extra.
const GR = ["0", "1", "2", "3", "4"], tox = (id, lib, cs) => ({ id, lib, type: "choix", choix: GR, cs });
export const CONSULT_ONCO = [
  { id: "xcsex", lib: "Examen", type: "section", cs: "onco" }, { id: "xcspoids", lib: "Poids", type: "nombre", unite: "kg", cs: "onco" },
  { id: "xcsoms", lib: "État général (OMS)", type: "choix", choix: GR, cs: "onco" }, { id: "xcseva", lib: "Douleur (EVA)", type: "choix", choix: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], cs: "onco" },
  { id: "xcstox", lib: "Toxicités (grade CTCAE 0 à 4)", type: "section", cs: "onco" },
  tox("xcsnau", "Nausées", "onco"), tox("xcsvom", "Vomissements", "onco"), tox("xcsdia", "Diarrhée", "onco"), tox("xcsmuc", "Mucite", "onco"), tox("xcsneu", "Neuropathie", "onco"), tox("xcsast", "Asthénie", "onco"),
  { id: "xcsnf", lib: "Neutropénie fébrile", type: "ouinon", cs: "onco" },
  { id: "xcscat", lib: "Conduite à tenir", type: "choix", choix: ["Poursuite du traitement", "Report", "Réduction de dose", "Changement de traitement", "Arrêt du traitement", "Surveillance"], cs: "onco" },
  { id: "xcsrt", lib: "Tolérance de la radiothérapie (grade 0 à 4)", type: "section", cs: "rt" },
  tox("xcsrrd", "Radiodermite", "rt"), tox("xcsrmu", "Mucite", "rt"), tox("xcsrdy", "Dysphagie", "rt"), tox("xcsrdi", "Diarrhée", "rt"), tox("xcsrcy", "Cystite", "rt"), tox("xcsras", "Asthénie", "rt"),
];
export const formConsult = (type) => (/radioth/i.test(type || "") ? "rt" : /annonce|RCP|secr[ée]tariat|^ordonnance$/i.test(type || "") ? "" : "onco");
export const champConsultPropose = (a, type) => !a.cs || a.cs === formConsult(type);
// 3.12 (12/10/2026) – formulaires de consultation nommés : R.formulaires = [{ id, nom, champs: [ids des champs ajoutés] }] (un champ peut être
// dans plusieurs formulaires : mêmes valeurs d'une consultation à l'autre) ; R.typesForm = { type de consultation: id du formulaire }.
// Sans réglage : oncologie = « Consultation d'oncologie » (champs cs onco + champs du cabinet), « RT hebdomadaire » (cs rt + champs du
// cabinet), « Simple » (champs du cabinet) avec la règle d'avant (formConsult) ; autre spécialité : un formulaire « Consultation ».
// Un champ retiré (champs[id] === false) n'est dans aucun formulaire.
export const FORMS0 = [["onco", "Consultation d'oncologie"], ["rt", "RT hebdomadaire"], ["simple", "Simple"]];
const idForm = (v) => typeof v === "string" && /^[a-z0-9_-]{1,30}$/i.test(v);
export function formulairesDe(R) {
  const aj = (R.ajouts || []).filter((a) => (R.champs || {})[a.id] !== false), ids = aj.map((a) => a.id);
  if (Array.isArray(R.formulaires) && R.formulaires.some((f) => f && idForm(f.id))) {
    const vus = {}; return R.formulaires.filter((f) => f && idForm(f.id) && !vus[f.id] && (vus[f.id] = 1)).map((f) => ({ id: f.id, nom: String(f.nom || "Formulaire").slice(0, 60), champs: (f.champs || []).filter((k, i, l) => ids.indexOf(k) >= 0 && l.indexOf(k) === i) }));
  }
  if (!R.onco && !aj.some((a) => a.cs)) return [{ id: "std", nom: "Consultation", champs: ids }];
  return FORMS0.map(([id, nom]) => ({ id, nom, champs: aj.filter((a) => (id === "simple" ? !a.cs : !a.cs || a.cs === id)).map((a) => a.id) }));
}
export function formDuType(R, type, F) {
  const L = F || formulairesDe(R), t = (R.typesForm || {})[type];
  if (t && L.some((f) => f.id === t)) return t;
  const d = { rt: "rt", "": "simple", onco: "onco" }[formConsult(type)];
  return L.some((f) => f.id === d) ? d : (L[0] || {}).id || "";
}
export const champDuType = (R, a, type, F) => { const L = F || formulairesDe(R), f = L.find((z) => z.id === formDuType(R, type, L)); return !!f && f.champs.indexOf(a.id) >= 0; };
// Un champ à condition (si.diag) est-il proposé, d'après le diagnostic (localisation) ? « Primitif inconnu » : tous ; diagnostic vide : aucun
export const champPropose = (a, vals) => { if (!a.si) return true; const f = famillesDiag((vals || {}).diag); return f.indexOf("inconnu") >= 0 || (a.si.diag || []).some((k) => f.indexOf(k) >= 0); };
// Partie de la fiche d'un champ (3.1 bis) : identité, informations médicales, fiche tumeur (cabinets d'oncologie)
const SEC_ID = ["nom", "prenom", "ddn", "sexe", "cin", "tel", "tel2", "etab", "ald", "cor", "mut", "adresse", "email"];
// 3.11 – description de chaque champ de la fiche effective R, dans l'ordre : { k, lib, type, choix, unite, partie (stockage identite | clinique),
// section (id | med | tum), ajout (champ ajouté ou null), fixe (raison ou ""), liste (clé de liste du cabinet ou ""), present, entete, imprimer }
export function champsDe(R) {
  return (R.ordre || []).map((k) => { const c = FICHE.find((z) => z[0] === k), a = c ? null : (R.ajouts || []).find((z) => z.id === k); if (!c && !a) return null;
    return { k, lib: c ? libDe(FICHE, k, R) : a.lib, type: a ? a.type || "texte" : (R.types || {})[k] || TYPE_FICHE0[k] || "texte", choix: a ? a.choix || [] : (R.choixs || {})[k] || [],
      unite: a ? a.unite || "" : (R.unites || {})[k] || UNITE0[k] || "", partie: c ? c[2] : a.partie === "clinique" ? "clinique" : "identite", section: sectionChamp(k, R), ajout: a || null,
      fixe: c ? FIXES[k] || "" : LISTES_CAB[k] ? "liste du cabinet" : "", liste: LISTES_CAB[k] || "", present: R.champs[k] !== false, entete: !!(R.entetes || {})[k], imprimer: a ? !!a.imprimer : !!(R.imprimes || {})[k] }; }).filter(Boolean);
}
// Spécialité d'oncologie / radiothérapie : fiche tumeur ajoutée (Administration : fiche de la spécialité, réglage d'un cabinet)
export const avecOnco = (f, spe) => (/oncolog|radioth/i.test(String(spe || "")) ? Object.assign({}, f || {}, { _onco: true }) : f || null);
export function sectionChamp(k, R) { const S = R && R.sections && R.sections[k]; if (S === "id" || S === "med" || (S === "tum" && R.onco)) return S; // partie choisie par le cabinet (3.11)
  if (k === "diag" || k === "diagP") return R && R.onco ? "tum" : "med"; if (SEC_ID.indexOf(k) >= 0) return "id"; if (k === "xtoms") return "med"; const a = R && (R.ajouts || []).find((z) => z.id === k); return a ? (a.tumeur ? "tum" : a.partie === "identite" ? "id" : "med") : "med"; }
// Formulaire de consultation (16.7, 10/10/2026) : champs existants [clé, libellé, -, base, choix de départ (liste modifiable)] = la
// fenêtre « Nouvelle consultation » d'aujourd'hui (oncologie) ; champs ajoutés : mêmes types que la fiche + texte long, titre de section,
// nombre avec unité ; valeurs dans consultations/{c}.extra.
export const CONSULT_TYPES0 = ["Consultation de suivi", "Consultation d'annonce", "RCP", "Consultation de contrôle", "Consultation de chimiothérapie", "Consultation en cours de radiothérapie", "Consultation de fin de traitement", "Note du secrétariat"];
export const CONSULT = [["type", "Consultation", "", false, CONSULT_TYPES0], ["d", "Date", "", true], ["titre", "Titre de la consultation", ""], ["note", "Note", ""]];
export const TYPES_CHAMP_CS = [["texte", "Texte"], ["textelong", "Texte long (plusieurs lignes)"], ["nombre", "Nombre"], ["date", "Date"], ["choix", "Liste de choix"], ["ouinon", "Oui / Non"], ["section", "Titre de section"]];
// Formulaire effectif d'un cabinet (fiche patient ou consultation) = celui de la spécialité (spe : le même pour tous les packs) +
// retouches du cabinet (f : ordre, présence, noms affichés, listes de choix des champs existants, champs ajoutés propres au cabinet,
// marqués cabinet: true). libs = nom affiché d'un champ existant ; choixs = liste de choix d'un champ existant (absent = d'origine).
export function formEffectif(CAT, f, spe) {
  const x = f || {}, s = spe || {}, ok = (a) => a && /^x[a-z0-9]{3,20}$/.test(a.id || "") && a.lib;
  // champ de la fiche tumeur enregistré par la spécialité (Administration) : sa définition du catalogue (conditions, type) + nom, liste, en-tête
  // de la spécialité ; nom et liste retouchés par le cabinet (x.libs / x.choixs, 12/10/2026)
  const DEF = CAT === FICHE ? TUMEUR : CAT === CONSULT ? CONSULT_ONCO : []; // champs proposés par le catalogue (fiche tumeur, formulaires 3.4)
  const aS0 = (Array.isArray(s.ajouts) ? s.ajouts : []).filter(ok).map((a) => { const T = DEF.find((z) => z.id === a.id);
    return Object.assign({}, T || {}, a, T ? { si: T.si, cs: T.cs, tumeur: T.tumeur, type: T.type, choix: a.choix && a.choix.length ? a.choix : T.choix } : {}, { cabinet: false }); });
  // fiche tumeur des cabinets d'oncologie (3.1) : en tête des champs de la spécialité, sauf si la spécialité les a déjà
  const aS = (s._onco ? DEF.filter((a) => !aS0.some((z) => z.id === a.id)).map((a) => Object.assign({}, a, { cabinet: false })) : []).concat(aS0), ids = aS.map((a) => a.id);
  const aC = (Array.isArray(x.ajouts) ? x.ajouts : []).filter((a) => ok(a) && ids.indexOf(a.id) < 0).map((a) => Object.assign({}, a, { cabinet: true }));
  aS.forEach((a) => { const l = x.libs && x.libs[a.id], c = x.choixs && x.choixs[a.id]; if (l) a.lib = l; if (Array.isArray(c) && c.length) a.choix = c.slice(); });
  const ajouts = aS.concat(aC), onco = (CAT === FICHE || CAT === CONSULT) && !!(s._onco || s.onco), champs = {}, libs = {}, choixs = {};
  // oncologie : la fiche tumeur dans son ordre (localisation, côté, stade, précision, histologie, biomarqueurs, grade…), à la suite
  const ref = onco && CAT === CONSULT ? ["type", "d", "titre"].concat(CONSULT_ONCO.map((a) => a.id).filter((k) => ajouts.some((a) => a.id === k)), ["note"], ajouts.map((a) => a.id).filter((k) => !CONSULT_ONCO.some((z) => z.id === k))) // formulaires 3.4 avant la note
    : onco ? CAT.map((c) => c[0]).filter((k) => ORDRE_TUMEUR.indexOf(k) < 0).reduce((l, k) => l.concat(k === "taille" && ajouts.some((a) => a.id === "xtoms") ? ["xtoms", k] : [k]), []).concat(ORDRE_TUMEUR.filter((k) => k[0] !== "x" || ajouts.some((a) => a.id === k)), ajouts.map((a) => a.id).filter((k) => ORDRE_TUMEUR.indexOf(k) < 0 && k !== "xtoms")) : CAT.map((c) => c[0]).concat(ajouts.map((a) => a.id));
  ref.forEach((k) => { const v = x.champs && typeof x.champs[k] === "boolean" ? x.champs[k] : s.champs && s.champs[k]; champs[k] = v !== false; });
  CAT.forEach(([k, , , base, ch0]) => { if (base) champs[k] = true; const l = (x.libs && x.libs[k]) || (s.libs && s.libs[k]); if (l) libs[k] = l;
    if (ch0) { const c = (x.choixs && x.choixs[k]) || (s.choixs && s.choixs[k]); choixs[k] = Array.isArray(c) && c.length ? c.slice() : ch0.slice(); } });
  if (onco && CAT === FICHE) { if (!libs.diag) libs.diag = "Localisation"; if (!libs.diagP) libs.diagP = "Précision"; } // oncologie : diagnostic = localisation (3.1 bis)
  const out = { ordre: ordreAvecNouveaux(Array.isArray(x.ordre) && x.ordre.length ? x.ordre : s.ordre, ref, CAT.map((c) => c[0])), champs, libs, choixs, ajouts, onco };
  if (CAT === CONSULT) { // 3.12 : formulaires nommés et formulaire de chaque type (cabinet, sinon spécialité)
    const fo = Array.isArray(x.formulaires) && x.formulaires.length ? x.formulaires : Array.isArray(s.formulaires) && s.formulaires.length ? s.formulaires : null;
    if (fo) out.formulaires = JSON.parse(JSON.stringify(fo));
    const tf = Object.assign({}, s.typesForm && typeof s.typesForm === "object" ? s.typesForm : {}, x.typesForm && typeof x.typesForm === "object" ? x.typesForm : {});
    if (Object.keys(tf).length) out.typesForm = tf; }
  // 3.11 – fiche patient : type, partie, impression et unité de chaque champ (spécialité, puis retouches du cabinet)
  if (CAT === FICHE) { const m = (n) => Object.assign({}, s[n] && typeof s[n] === "object" ? s[n] : {}, x[n] && typeof x[n] === "object" ? x[n] : {}), TV = TYPES_CHAMP.map((t) => t[0]);
    const T = m("types"), Sx = m("sections"), Im = m("imprimes"), Un = m("unites"); out.types = {}; out.sections = {}; out.imprimes = {}; out.unites = {};
    FICHE.forEach(([k]) => { if (!FIXES[k] && TV.indexOf(T[k]) >= 0) out.types[k] = T[k]; if (typeof Im[k] === "boolean") out.imprimes[k] = Im[k]; if (Un[k]) out.unites[k] = String(Un[k]).slice(0, 15); });
    ajouts.forEach((a) => { if (a.cabinet) return; if (TV.indexOf(T[a.id]) >= 0 && !LISTES_CAB[a.id]) a.type = T[a.id]; if (Un[a.id] != null) a.unite = String(Un[a.id]).slice(0, 15); if (typeof Im[a.id] === "boolean") a.imprimer = Im[a.id]; });
    out.ordre.forEach((k) => { if (Sx[k] === "id" || Sx[k] === "med" || (Sx[k] === "tum" && onco)) out.sections[k] = Sx[k]; });
    // champ d'origine devenu « liste de choix » : sa liste (cabinet, puis spécialité)
    FICHE.forEach(([k]) => { if (out.types[k] === "choix") { const c = (x.choixs && x.choixs[k]) || (s.choixs && s.choixs[k]); choixs[k] = Array.isArray(c) ? c.slice() : []; } }); }
  // Fiche patient : en tête du dossier ou non, champ par champ (champs existants : ENTETE0 au départ ; champs ajoutés : leur case « En tête »)
  if (CAT === FICHE) { const en = {}, v = (k) => (x.entetes && typeof x.entetes[k] === "boolean" ? x.entetes[k] : s.entetes && typeof s.entetes[k] === "boolean" ? s.entetes[k] : undefined);
    FICHE.forEach(([k]) => { const b = v(k); en[k] = TOUJOURS_ENTETE.indexOf(k) >= 0 || (b === undefined ? ENTETE0.indexOf(k) >= 0 : b); });
    ajouts.forEach((a) => { const b = v(a.id); en[a.id] = b === undefined ? a.entete === true : b; });
    ENTETE_CALC.forEach(([k]) => { const b = v(k); en[k] = b === undefined ? !!ENTETE_CALC0[k] : b; }); // R-G a : ligne 1 et valeurs calculées du bandeau
    out.entetes = en;
    const co = Object.assign({}, s.courts && typeof s.courts === "object" ? s.courts : {}, x.courts && typeof x.courts === "object" ? x.courts : {}); out.courts = {}; Object.keys(co).forEach((k) => { const t = String(co[k] || "").trim().slice(0, 14); if (t) out.courts[k] = t; }); } // R-G a : libellés courts du bandeau
  return out;
}
export const libDe = (CAT, k, R) => (R && R.libs && R.libs[k]) || ((CAT.find((c) => c[0] === k) || [])[1]) || k;
// Retouches d'un cabinet = différences entre son formulaire (R, effectif) et celui de la spécialité (base = formEffectif(CAT, null, spe))
export function formRetouches(CAT, R, base) {
  const out = {}, ch = {}, lb = {}, cx = {};
  const attendu = base.ordre.concat(R.ajouts.filter((a) => a.cabinet).map((a) => a.id)); // champs propres au cabinet : à la fin
  if (JSON.stringify(R.ordre) !== JSON.stringify(attendu)) out.ordre = R.ordre.slice();
  Object.keys(R.champs).forEach((k) => { if (R.champs[k] !== (base.champs[k] !== false)) ch[k] = R.champs[k]; });
  CAT.forEach(([k, , , , ch0]) => { if (libDe(CAT, k, R) !== libDe(CAT, k, base)) lb[k] = libDe(CAT, k, R);
    if (ch0 && JSON.stringify((R.choixs || {})[k] || ch0) !== JSON.stringify((base.choixs || {})[k] || ch0)) cx[k] = (R.choixs || {})[k]; });
  // 3.11 : type, partie, impression, unité (fiche) : différences avec la spécialité ; champs de la spécialité retouchés : dans les mêmes tables
  if (CAT === FICHE) {
    ["types", "sections", "imprimes", "unites", "courts"].forEach((n) => { const d = {}, r = R[n] || {}, b = base[n] || {}; Object.keys(r).forEach((k) => { if (JSON.stringify(r[k]) !== JSON.stringify(b[k])) d[k] = r[k]; }); if (Object.keys(d).length) out[n] = d; });
    Object.keys(R.types || {}).forEach((k) => { if (R.types[k] === "choix" && JSON.stringify((R.choixs || {})[k] || []) !== JSON.stringify((base.choixs || {})[k] || [])) cx[k] = (R.choixs || {})[k] || []; });
    R.ajouts.filter((a) => !a.cabinet).forEach((a) => { const b0 = (base.ajouts || []).find((z) => z.id === a.id); if (!b0) return; const met = (n, v) => { (out[n] = out[n] || {})[a.id] = v; };
      if (a.type !== b0.type) met("types", a.type); if ((a.unite || "") !== (b0.unite || "")) met("unites", a.unite || ""); if (!!a.imprimer !== !!b0.imprimer) met("imprimes", !!a.imprimer); });
  }
  // 3.12 : formulaires de consultation et formulaire de chaque type : différences avec la spécialité
  if (CAT === CONSULT) {
    const fR = formulairesDe(R), fB = formulairesDe(base); if (JSON.stringify(fR) !== JSON.stringify(fB)) out.formulaires = fR;
    const types = ((R.choixs || {}).type || []).concat(Object.keys(R.typesForm || {})), tf = {};
    types.forEach((t) => { const a = formDuType(R, t, fR), b = formDuType(base, t, fB); if (a !== b || (out.formulaires && (R.typesForm || {})[t])) tf[t] = a; });
    if (Object.keys(tf).length) out.typesForm = tf; }
  // champs de la spécialité (fiche tumeur…) renommés ou liste changée par le cabinet (12/10/2026)
  R.ajouts.filter((a) => !a.cabinet).forEach((a) => { const b0 = (base.ajouts || []).find((z) => z.id === a.id); if (!b0) return; if (a.lib !== b0.lib) lb[a.id] = a.lib; if (a.type === "choix" && JSON.stringify(a.choix || []) !== JSON.stringify(b0.choix || [])) cx[a.id] = a.choix; });
  if (Object.keys(ch).length) out.champs = ch; if (Object.keys(lb).length) out.libs = lb; if (Object.keys(cx).length) out.choixs = cx;
  // En tête du dossier (fiche) : différences avec la spécialité ; un champ propre au cabinet garde son réglage dans le champ lui-même
  if (R.entetes) { const en = {}; Object.keys(R.entetes).forEach((k) => { const a = R.ajouts.find((z) => z.id === k); if (a && a.cabinet) { a.entete = R.entetes[k]; return; } if (R.entetes[k] !== !!(base.entetes || {})[k]) en[k] = R.entetes[k]; }); if (Object.keys(en).length) out.entetes = en; }
  const aj = R.ajouts.filter((a) => a.cabinet).map((a) => { const c = Object.assign({}, a); delete c.cabinet; return c; }); if (aj.length) out.ajouts = aj;
  return out;
}
// Fiche patient (espaces/{e}.ficheSpe + reglage.fiche) et consultation (espaces/{e}.consultSpe + reglage.consultation)
export const ficheEffective = (f, spe) => formEffectif(FICHE, f, spe);
export const ficheRetouches = (R, base) => formRetouches(FICHE, R, base);
export const libChamp = (k, R) => libDe(FICHE, k, R);
export const consultEffective = (f, spe) => formEffectif(CONSULT, f, spe);
// Retouches faites par le cabinet lui-même (Paramètres › Cabinet, 11/10/2026 : parametres/formulaires { fiche, consultation }), par-dessus
// la fiche et le formulaire réglés par l'administration (spécialité + retouches de l'administration) : ceux-ci servent de base (leurs
// champs ajoutés ne sont pas modifiables par le cabinet, seulement présents / ordre / nom / en-tête).
export function formulairesCabinet(reg, cab) {
  const C = cab || {}, out = Object.assign({}, reg);
  if (C.fiche && typeof C.fiche === "object") out.fiche = formEffectif(FICHE, C.fiche, reg.fiche);
  if (C.consultation && typeof C.consultation === "object") out.consultation = formEffectif(CONSULT, C.consultation, reg.consultation);
  return out;
}
// Cartes du tableau de bord (ordre de départ ; « afaire » = « À valider par le médecin » / « À faire par la secrétaire » /
// « À faire par l'infirmière », selon le rôle, 11/10/2026)
export const CARTES = [["ppas", "Pour commencer (cabinet neuf)"], ["jour", "Aujourd'hui"], ["afaire", "À valider / À faire (selon le rôle)"], ["rappels", "Rappels WhatsApp à envoyer"], ["sept", "Les 7 prochains jours"], ["taches", "Mes tâches"], ["conflits", "Conflits : rendez-vous à décaler"], ["stats", "Statistiques"]];
// Colonne de chaque carte sur grand écran (11/10/2026) : g = gauche, d = droite, l = pleine largeur ; sur tablette et téléphone, une
// seule colonne dans l'ordre réglé. Le programme du jour est à gauche.
export const COLONNES0 = { ppas: "l", jour: "g", afaire: "d", rappels: "d", sept: "g", taches: "d", conflits: "d", stats: "l" };
// Organisation du tableau de bord : réglage de l'administration (reg = reglageEffectif(...) : accueil, cartes, col éventuel) puis
// celui du cabinet (cab = parametres/accueil décodé { ordre, cartes, col }, ou null : Paramètres › Cabinet › Tableau de bord).
// cartes du cabinet : true et false comptent (le cabinet peut remettre une carte retirée par l'administration) ; absent = réglage
// de l'administration. Renvoie { ordre: [clés], cartes: { clé: bool }, col: { clé: "g"|"d"|"l" } }.
export function accueilEffectif(reg, cab) {
  const R = reg || {}, C = cab || {}, cles = CARTES.map((c) => c[0]), bo = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => cles.indexOf(k) >= 0 && typeof v === "boolean"));
  const co = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => cles.indexOf(k) >= 0 && ["g", "d", "l"].indexOf(v) >= 0));
  const base = ordreAvecNouveaux(R.accueil, cles, cles);
  return { ordre: Array.isArray(C.ordre) && C.ordre.length ? ordreAvecNouveaux(C.ordre, cles, cles) : base, cartes: Object.assign(vrais(CARTES), bo(R.cartes), bo(C.cartes)), col: Object.assign({}, COLONNES0, co(R.col), co(C.col)) };
}
// Sections de paramétrage (page Paramètres), et si leurs valeurs viennent de la bibliothèque de la spécialité
export const SECTIONS = [
  ["horaires", "Créneaux & horaires", true], ["fermetures", "Fermetures, congés & jours fériés", true], ["lieux", "Lieux d'exercice", false],
  ["accueil", "Tableau de bord (cartes)", false], ["fiche", "Fiche patient", false], ["consultation", "Formulaire de consultation", false], ["types", "Types de consultation", false], ["acces", "Accès (équipe)", false],
  ["audit", "Journal d'audit", false], ["whatsapp", "WhatsApp", true], ["couleurs", "Google Agenda", true], ["documents", "Documents (types)", true], ["taches", "Tâches", true],
  ["rcp", "RCP", true], ["listes", "Listes", true], ["bibliotheques", "Bibliothèques", true], ["vigilances", "Vigilance des molécules", true], ["impression", "Impression", true], ["alertes", "Alertes", true], ["activites", "Activités et rémunérations", true],
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
export function reglageEffectif(r, spe, speCs) {
  const x = r || {}, b = (o, d) => Object.assign(d, Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => k in d && typeof v === "boolean")));
  // menu réglé avant le 19/10 : « RCP » placé juste après « Tâches », le reste comme avant (menuAvecNouveaux)
  return { menu: menuAvecNouveaux(x.menu), accueil: ordreAvecNouveaux(x.accueil, CARTES.map((c) => c[0]), CARTES.map((c) => c[0])), cartes: b(x.cartes, vrais(CARTES)),
    ordreSections: ordre(x.ordreSections, SECTIONS.map((c) => c[0])), sections: b(x.sections, vrais(SECTIONS)), bibliotheques: b(x.bibliotheques, vrais(BIBLIOTHEQUES)), fonctions: Object.assign(b(x.fonctions, toutesFonctions()), fonctionsDeBase()), fiche: ficheEffective(x.fiche, spe), consultation: consultEffective(x.consultation, speCs) };
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
