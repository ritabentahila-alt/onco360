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
  ["parametres", "Paramètres", null], ["bilan", "Bilan", "bilan"], ["profil", "Mon compte", null],
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
// Ordre réglé + champs du catalogue ajoutés depuis (ex. CIN, 10/10/2026) : placés juste après le champ qui les précède dans le
// catalogue (CIN après Diagnostic), pas à la fin ; les autres manquants à la fin
function ordreAvecNouveaux(l, ref, cat) {
  if (!Array.isArray(l) || !l.length) return ref.slice();
  const r = l.filter((k, i) => ref.indexOf(k) >= 0 && l.indexOf(k) === i);
  cat.forEach((k, i) => { if (r.indexOf(k) >= 0) return; let j = -1; for (let p = i - 1; p >= 0 && j < 0; p--) j = r.indexOf(cat[p]); r.splice(j + 1, 0, k); });
  ref.forEach((k) => { if (r.indexOf(k) < 0) r.push(k); });
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
export const ENTETE0 = ["ddn", "sexe", "taille", "poids", "diag", "cin", "tel", "tel2", "etab", "ald", "cor", "mut"];
export const TOUJOURS_ENTETE = ["nom", "prenom"]; // le nom du patient : toujours en tête
export const TYPES_CHAMP = [["texte", "Texte"], ["nombre", "Nombre"], ["date", "Date"], ["choix", "Liste de choix"], ["ouinon", "Oui / Non"]];
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
// Un champ à condition (si.diag) est-il proposé, d'après le diagnostic (localisation) ? « Primitif inconnu » : tous ; diagnostic vide : aucun
export const champPropose = (a, vals) => { if (!a.si) return true; const f = famillesDiag((vals || {}).diag); return f.indexOf("inconnu") >= 0 || (a.si.diag || []).some((k) => f.indexOf(k) >= 0); };
// Partie de la fiche d'un champ (3.1 bis) : identité, informations médicales, fiche tumeur (cabinets d'oncologie)
const SEC_ID = ["nom", "prenom", "ddn", "sexe", "cin", "tel", "tel2", "etab", "ald", "cor", "mut", "adresse", "email"];
export function sectionChamp(k, R) { if (k === "diag" || k === "diagP") return R && R.onco ? "tum" : "med"; if (SEC_ID.indexOf(k) >= 0) return "id"; if (k === "xtoms") return "med"; const a = R && (R.ajouts || []).find((z) => z.id === k); return a ? (a.tumeur ? "tum" : a.partie === "identite" ? "id" : "med") : "med"; }
// Formulaire de consultation (16.7, 10/10/2026) : champs existants [clé, libellé, -, base, choix de départ (liste modifiable)] = la
// fenêtre « Nouvelle consultation » d'aujourd'hui (oncologie) ; champs ajoutés : mêmes types que la fiche + texte long, titre de section,
// nombre avec unité ; valeurs dans consultations/{c}.extra.
export const CONSULT_TYPES0 = ["Consultation de suivi", "Consultation d'annonce", "RCP", "Consultation de contrôle", "Consultation de chimiothérapie", "Consultation en cours de radiothérapie", "Consultation de fin de traitement"];
export const CONSULT = [["type", "Consultation", "", false, CONSULT_TYPES0], ["d", "Date", "", true], ["titre", "Titre de la consultation", ""], ["note", "Note", ""]];
export const TYPES_CHAMP_CS = [["texte", "Texte"], ["textelong", "Texte long (plusieurs lignes)"], ["nombre", "Nombre"], ["date", "Date"], ["choix", "Liste de choix"], ["ouinon", "Oui / Non"], ["section", "Titre de section"]];
// Formulaire effectif d'un cabinet (fiche patient ou consultation) = celui de la spécialité (spe : le même pour tous les packs) +
// retouches du cabinet (f : ordre, présence, noms affichés, listes de choix des champs existants, champs ajoutés propres au cabinet,
// marqués cabinet: true). libs = nom affiché d'un champ existant ; choixs = liste de choix d'un champ existant (absent = d'origine).
export function formEffectif(CAT, f, spe) {
  const x = f || {}, s = spe || {}, ok = (a) => a && /^x[a-z0-9]{3,20}$/.test(a.id || "") && a.lib;
  const aS0 = (Array.isArray(s.ajouts) ? s.ajouts : []).filter(ok).map((a) => Object.assign({}, a, { cabinet: false }));
  // fiche tumeur des cabinets d'oncologie (3.1) : en tête des champs de la spécialité, sauf si la spécialité les a déjà
  const aS = (CAT === FICHE && s._onco ? TUMEUR.filter((a) => !aS0.some((z) => z.id === a.id)).map((a) => Object.assign({}, a, { cabinet: false })) : []).concat(aS0), ids = aS.map((a) => a.id);
  const aC = (Array.isArray(x.ajouts) ? x.ajouts : []).filter((a) => ok(a) && ids.indexOf(a.id) < 0).map((a) => Object.assign({}, a, { cabinet: true }));
  const ajouts = aS.concat(aC), onco = CAT === FICHE && !!(s._onco || s.onco), champs = {}, libs = {}, choixs = {};
  // oncologie : la fiche tumeur dans son ordre (localisation, côté, stade, précision, histologie, biomarqueurs, grade…), à la suite
  const ref = onco ? CAT.map((c) => c[0]).filter((k) => ORDRE_TUMEUR.indexOf(k) < 0).reduce((l, k) => l.concat(k === "taille" && ajouts.some((a) => a.id === "xtoms") ? ["xtoms", k] : [k]), []).concat(ORDRE_TUMEUR.filter((k) => k[0] !== "x" || ajouts.some((a) => a.id === k)), ajouts.map((a) => a.id).filter((k) => ORDRE_TUMEUR.indexOf(k) < 0 && k !== "xtoms")) : CAT.map((c) => c[0]).concat(ajouts.map((a) => a.id));
  ref.forEach((k) => { const v = x.champs && typeof x.champs[k] === "boolean" ? x.champs[k] : s.champs && s.champs[k]; champs[k] = v !== false; });
  CAT.forEach(([k, , , base, ch0]) => { if (base) champs[k] = true; const l = (x.libs && x.libs[k]) || (s.libs && s.libs[k]); if (l) libs[k] = l;
    if (ch0) { const c = (x.choixs && x.choixs[k]) || (s.choixs && s.choixs[k]); choixs[k] = Array.isArray(c) && c.length ? c.slice() : ch0.slice(); } });
  if (onco) { if (!libs.diag) libs.diag = "Localisation"; if (!libs.diagP) libs.diagP = "Précision"; } // oncologie : diagnostic = localisation (3.1 bis)
  const out = { ordre: ordreAvecNouveaux(Array.isArray(x.ordre) && x.ordre.length ? x.ordre : s.ordre, ref, CAT.map((c) => c[0])), champs, libs, choixs, ajouts, onco };
  // Fiche patient : en tête du dossier ou non, champ par champ (champs existants : ENTETE0 au départ ; champs ajoutés : leur case « En tête »)
  if (CAT === FICHE) { const en = {}, v = (k) => (x.entetes && typeof x.entetes[k] === "boolean" ? x.entetes[k] : s.entetes && typeof s.entetes[k] === "boolean" ? s.entetes[k] : undefined);
    FICHE.forEach(([k]) => { const b = v(k); en[k] = TOUJOURS_ENTETE.indexOf(k) >= 0 || (b === undefined ? ENTETE0.indexOf(k) >= 0 : b); });
    ajouts.forEach((a) => { const b = v(a.id); en[a.id] = b === undefined ? a.entete === true : b; });
    out.entetes = en; }
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
  ["horaires", "Créneaux & horaires", true], ["fermetures", "Fermetures, congés & jours fériés", true], ["rdvauto", "Rendez-vous automatiques", true], ["lieux", "Lieux d'exercice", false],
  ["accueil", "Tableau de bord (cartes)", false], ["fiche", "Fiche patient", false], ["consultation", "Formulaire de consultation", false], ["acces", "Accès (équipe)", false],
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
  return { menu: ordre(x.menu, MENU.map((m) => m[0])), accueil: ordreAvecNouveaux(x.accueil, CARTES.map((c) => c[0]), CARTES.map((c) => c[0])), cartes: b(x.cartes, vrais(CARTES)),
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
