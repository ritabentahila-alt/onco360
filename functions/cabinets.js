// Onco360 – création d'un cabinet (phase F, étape 4, 09/10/2026). Logique pure, sans Firebase (tests : node functions/test-cabinets.js).
// Ce que reçoit un nouveau cabinet, décidé par Dr Bentahila le 09/10/2026 : protocoles, jours fériés, diagnostics, mutuelles,
// bibliothèques (médicaments, ordonnances types, analyses et bilans, examens, courriers), tarifs de radiothérapie (actes RT,
// VMAT). Rien d'autre : ni correspondants, ni tarifs des consultations et séances, ni établissements, ni patients, ni profil, ni
// bilan, ni documentation déposée (les fiches de départ d'Onco360 s'affichent toutes seules). Réglages : valeurs de départ.
const DEPART = require("./listes-depart.json");

const MODELE = "cabinet-bentahila"; // cabinet dont on copie la bibliothèque
const BIBLIOTHEQUES = ["medicaments", "ordostypes", "analyses", "bilans", "examens", "courriers"];
// Droits du médecin titulaire : tous (mêmes valeurs que DROITS_ROLE.medecin de public/js/app/profil.js, vérifié par le test)
const DROITS_MEDECIN = { identite: true, fichePatient: true, rendezvous: true, consultations: true, ecrireConsultations: true, planningChimio: true, traitements: "modifier", radiotherapie: "modifier", documents: true, administrer: true, encaissements: true, creerPatient: true, supprimerPatient: true, finances: true, parametres: true };
// Mises à niveau de migrations() (v2.js) propres aux dossiers venus de l'ancienne application : déjà « faites » dans un cabinet neuf
// (sinon la liste d'ordonnances types copiée serait remplacée par celle de départ)
const MIGRATIONS = ["dosimetriePeriode", "secretaireChimio", "secretairePlanning", "ordostypesExcel1", "encaissements", "encaissementsJours", "encaissementsBrutV1", "encaissementsBrutV1b"];

const net = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
// Vérifie la demande faite depuis la page Administration ; renvoie les champs nettoyés ou lève une erreur lisible
function verifier(o) {
  const d = { cabinet: net(o.cabinet), prenom: net(o.prenom), nom: net(o.nom).toUpperCase(), email: net(o.email).toLowerCase(), telephone: net(o.telephone) };
  if (d.cabinet.length < 2) throw new Error("Indiquez le nom du cabinet.");
  if (!d.nom) throw new Error("Indiquez le nom du médecin.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) throw new Error("Adresse e-mail invalide.");
  if (d.cabinet.length > 80 || d.prenom.length > 60 || d.nom.length > 60 || d.telephone.length > 30) throw new Error("Un des champs est trop long.");
  return d;
}
// Identifiant lisible et unique : « cab-rabat-oncologie », « cab-rabat-oncologie-2 »…
function idCabinet(nom, existants) {
  const base = "cab-" + (String(nom).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32).replace(/-+$/, "") || "cabinet");
  const pris = new Set(existants || []); let id = base, n = 2;
  while (pris.has(id)) id = base + "-" + n++;
  return id;
}
// Listes : diagnostics et mutuelles du modèle (entières), correspondants vides. « complet » : la liste est celle-ci, sans les
// listes de départ du code (dont les correspondants du cabinet modèle).
function listesDepart(L) {
  L = L || {};
  const plus = (base, aj) => base.concat((aj || []).filter((x) => base.indexOf(x) < 0));
  const diag = L.complet && Array.isArray(L.diag) ? L.diag.slice() : plus(DEPART.DIAG, L.diag);
  const mut = L.complet ? (L.mut || []).slice() : plus(DEPART.MUT0, L.mut);
  return { diag, mut, cor: [], complet: true };
}
// Calendrier : jours fériés seulement (ni absences, ni horaires)
const calendrierDepart = (C) => ({ feries: ((C && C.feries) || []).slice(), abs: [] });
// Tarifs : actes de radiothérapie et VMAT seulement ; aucun établissement (le médecin crée ses grilles dans Paramètres)
function tarifsDepart(T) {
  T = T || {};
  return { repli: "", etablissements: {}, actesRT: (T.actesRT || []).map((a) => ({ nom: a.nom, prix: a.prix })), vmat: T.vmat != null ? T.vmat : 10000 };
}
const migrationsFaites = (jour) => MIGRATIONS.reduce((o, k) => { o[k] = jour; return o; }, { cabinetNeuf: jour });
// Fiche de membre du médecin titulaire
const membreTitulaire = (d, jour, par) => ({ role: "medecin", nom: "Dr " + [d.prenom, d.nom].filter(Boolean).join(" "), email: d.email, telephone: d.telephone, actif: true, tousEtablissements: true, etablissements: [], droits: Object.assign({}, DROITS_MEDECIN), cree: jour, creePar: par });

// Modules et formules (09/10/2026) : mêmes valeurs que public/js/donnees/modules.js (vérifié par le test)
const MODULES = ["chimio", "rt", "agenda", "salle", "taches", "rcp", "prescriptions", "documents", "gagenda", "listes", "bilan"];
const MAX = ["medecin", "assistante", "infirmiere", "comptable", "etablissements", "patients"];
const COMMUNS = ["agenda", "prescriptions", "documents", "listes", "gagenda", "bilan"], EQUIPE = ["salle", "taches", "rcp"];
const fo = (specialite, lib, modules, max) => ({ lib, specialite, modules: MODULES.filter((k) => modules.indexOf(k) >= 0), max });
const mx = (medecin, assistante, infirmiere, etablissements, patients, comptable = null) => ({ medecin, assistante, infirmiere, comptable, etablissements, patients });
const FORMULES = {
  essentiel: fo("Oncologie – Radiothérapie", "Oncologie – Essentiel", ["chimio"].concat(COMMUNS), mx(1, 1, 0, 1, 300)),
  "onco-pro": fo("Oncologie – Radiothérapie", "Oncologie – Pro", ["chimio"].concat(COMMUNS, EQUIPE), mx(1, 2, 2, 2, 1000)),
  "onco-clinique": fo("Oncologie – Radiothérapie", "Oncologie – Clinique", ["chimio"].concat(COMMUNS, EQUIPE), mx(5, 5, 10, null, null)),
  radiotherapie: fo("Oncologie – Radiothérapie", "Radiothérapie – Essentiel", ["rt"].concat(COMMUNS), mx(1, 1, 0, 1, 300)),
  "rt-pro": fo("Oncologie – Radiothérapie", "Radiothérapie – Pro", ["rt"].concat(COMMUNS, EQUIPE), mx(1, 2, 1, 2, 1000)),
  "rt-centre": fo("Oncologie – Radiothérapie", "Radiothérapie – Centre", ["rt"].concat(COMMUNS, EQUIPE), mx(5, 5, 5, null, null)),
  "oncort-pro": fo("Oncologie – Radiothérapie", "Onco-radiothérapie – Pro", ["chimio", "rt"].concat(COMMUNS, EQUIPE), mx(1, 2, 2, 2, 1000)),
  complet: fo("Oncologie – Radiothérapie", "Onco-radiothérapie – Clinique", ["chimio", "rt"].concat(COMMUNS, EQUIPE), mx(5, 5, 10, null, null)),
};
// Abonnement envoyé par la page Administration, nettoyé : formule connue (ou « sur mesure »), chaque module oui / non, maximums
// entiers ≥ 0 ou null (sans limite). Sans modules précisés : ceux de la formule.
// Formules modifiées par l'administration (plateforme/formules, 09/10/2026), nettoyées : identifiant court, nom, modules connus,
// maximums. Absentes ou illisibles : formules de départ (FORMULES).
const nombre = (v) => (v == null || v === "" || isNaN(v) ? null : Math.max(0, Math.min(100000, Math.floor(Number(v)))));
function formulesValides(o) {
  const out = {};
  Object.entries(o || {}).slice(0, 20).forEach(([k, f]) => {
    if (!/^[a-z0-9-]{2,30}$/.test(k) || !f) return;
    const max = {}; MAX.forEach((m) => { max[m] = nombre(f.max && f.max[m]); });
    out[k] = { lib: String(f.lib || k).replace(/\s+/g, " ").trim().slice(0, 40) || k, specialite: String(f.specialite || "").replace(/\s+/g, " ").trim().slice(0, 40), modules: MODULES.filter((m) => (f.modules || []).indexOf(m) >= 0), max };
    const rg = reglageNettoye(f.reglage); if (rg) out[k].reglage = rg; // réglage complet du pack (menu, cartes, onglets, fonctions…, 10/10/2026)
    if (out[k].modules.indexOf("taches") < 0) out[k].modules = out[k].modules.filter((m) => m !== "rcp");
  });
  return Object.keys(out).length ? out : null;
}
function abonnement(o, formules) {
  o = o || {}; const FS = formules || FORMULES, f = FS[o.formule] ? o.formule : FS.complet ? "complet" : Object.keys(FS)[0], F = FS[f], mod = {}, max = {};
  MODULES.forEach((k) => { mod[k] = o.modules && k in o.modules ? o.modules[k] === true : F.modules.indexOf(k) >= 0; });
  if (!mod.taches) mod.rcp = false;
  MAX.forEach((k) => { max[k] = nombre(o.max && k in o.max ? o.max[k] : F.max[k]); });
  const pareil = MODULES.every((k) => mod[k] === (F.modules.indexOf(k) >= 0)) && MAX.every((k) => max[k] === nombre(F.max[k]));
  // Réglage : celui envoyé (retouches du cabinet ; « identiqueAuPack » dit s'il est le même que celui du pack), sinon celui du pack
  const rg = o.reglage ? reglageNettoye(o.reglage) : F.reglage ? JSON.parse(JSON.stringify(F.reglage)) : null, retouche = !!o.reglage && o.identiqueAuPack === false;
  return Object.assign({ formule: f, surMesure: !pareil || retouche, retouche, modules: mod, max }, rg ? { reglage: rg } : {});
}
// Trop de comptes actifs pour ce rôle ? (max null = sans limite)
const horsQuota = (ab, role, nbActifs) => { const m = ab && ab.max && ab.max[role]; return m != null && nbActifs > m; };

// Nom et coordonnées d'un cabinet modifiés par l'administration
function infos(o) {
  const t = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  const d = { nom: t(o.nom, 80), ville: t(o.ville, 60), adresse: t(o.adresse, 160), telephone: t(o.telephone, 30), titulaireNom: t(o.titulaireNom, 80), titulaireTel: t(o.titulaireTel, 30) };
  if (d.nom.length < 2) throw new Error("Indiquez le nom du cabinet.");
  return d;
}
// Membre de l'équipe créé par le titulaire (Paramètres › Accès) : rôle connu, droits connus, établissements (10/10/2026)
const ROLES = ["medecin", "assistante", "infirmiere", "comptable"];
const NIVEAUX = { traitements: ["aucun", "voir", "modifier"], radiotherapie: ["aucun", "chimio", "voir", "modifier"] };
function membreDemande(o, jour, par) {
  const t = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  const role = ROLES.indexOf(o.role) >= 0 ? o.role : null; if (!role) throw new Error("Rôle inconnu.");
  const email = t(o.email, 120).toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Indiquez une adresse e-mail valide.");
  const nom = t(o.nom, 60).toUpperCase(), prenom = t(o.prenom, 60); if (!nom) throw new Error("Indiquez le nom.");
  const droits = {}; Object.keys(DROITS_MEDECIN).forEach((k) => { const v = (o.droits || {})[k]; droits[k] = NIVEAUX[k] ? (NIVEAUX[k].indexOf(v) >= 0 ? v : "aucun") : v === true; });
  const tous = role === "medecin" || role === "comptable" ? o.tousEtablissements !== false : o.tousEtablissements === true;
  const etabs = Array.isArray(o.etablissements) ? o.etablissements.map((x) => t(x, 20)).filter(Boolean).slice(0, 50) : [];
  if (!tous && !etabs.length) throw new Error("Choisissez au moins un établissement.");
  return { email, prenom, nomFamille: nom, membre: { role, nom: (role === "medecin" ? "Dr " : "") + [prenom, nom].filter(Boolean).join(" "), email, telephone: t(o.telephone, 30), actif: true, tousEtablissements: tous, etablissements: tous ? [] : etabs, droits, cree: jour, creePar: par } };
}
// Bibliothèques de référence par spécialité (10/10/2026) : un espace sans patient (espaces/bib-…), modifié par l'administration avec
// les écrans d'Onco360 ; un cabinet neuf reçoit la copie de la bibliothèque de la spécialité de sa formule. Même liste dans
// public/js/donnees/modules.js (BIBLIOTHEQUES_SPE, vérifié par le test).
const BIBS = [
  { id: "bib-oncologie", lib: "Oncologie – Radiothérapie", specialites: ["Oncologie – Radiothérapie", "Oncologie médicale", "Radiothérapie", "Oncologie-radiothérapie"] },
  { id: "bib-generaliste", lib: "Médecine générale", specialites: ["Médecine générale"] },
  { id: "bib-gynecologie", lib: "Gynécologie", specialites: ["Gynécologie"] },
];
const bibDe = (specialite) => (BIBS.find((b) => b.specialites.indexOf(specialite) >= 0) || BIBS[0]).id;
const estBib = (e) => /^bib-/.test(String(e || ""));
// Droits du compte d'administration dans une bibliothèque : protocoles, prescriptions, listes, fériés, tarifs RT ; aucun patient
const DROITS_BIB = { identite: false, fichePatient: false, rendezvous: false, consultations: false, ecrireConsultations: true, planningChimio: false, traitements: "modifier", radiotherapie: "modifier", documents: false, administrer: false, encaissements: false, creerPatient: false, supprimerPatient: false, finances: true, parametres: true };
// (modules ouverts pour régler les paramètres correspondants : tâches, RCP, couleurs de Google Agenda… ; la bibliothèque n'a pas de patient)
const MODULES_BIB = { chimio: true, rt: true, agenda: false, salle: false, taches: true, rcp: true, prescriptions: true, documents: false, gagenda: true, listes: true, bilan: false };
// Paramètres de base d'une spécialité (10/10/2026) : gardés dans la bibliothèque de référence, modifiés par l'administration, copiés
// dans chaque cabinet neuf, nettoyés : ni correspondants, ni prix des consultations (tarifs : actes RT seulement, à part), ni
// absences, ni horaires par établissement, ni lieu et dates exceptionnelles de la RCP ; tâches automatiques confiées au titulaire.
const PARAMS_SPE = ["listes", "calendrier", "whatsapp", "couleursAgenda", "typesDocuments", "typesTaches", "tachesAuto", "rcp", "reglages"];
function parametreDepart(id, v, jour) {
  if (PARAMS_SPE.indexOf(id) < 0 || v == null) return null;
  if (id === "listes") return listesDepart(v);
  if (id === "calendrier") return Object.assign(v.horaires ? { horaires: v.horaires } : {}, { feries: (v.feries || []).slice(), abs: [], horairesEtab: {} });
  if (id === "tachesAuto") return { regles: (v.regles || []).map((r) => Object.assign({}, r, { pour: "titulaire", depuis: jour || r.depuis || "" })) };
  if (id === "rcp") return { jours: v.jours || [], heure: v.heure || "", lieu: "", plus: [], annulees: [] };
  return JSON.parse(JSON.stringify(v));
}
// Retouches d'un cabinet (10/10/2026) : listes ordonnées et cases oui / non, clés courtes seulement (le catalogue est sur le site :
// public/js/donnees/catalogue.js ; une clé inconnue est ignorée à l'affichage)
function reglageNettoye(r) {
  if (!r || typeof r !== "object") return null;
  const cle = (k) => typeof k === "string" && /^[a-z0-9._-]{1,40}$/i.test(k), out = {};
  ["menu", "accueil", "ordreSections"].forEach((k) => { if (Array.isArray(r[k])) out[k] = r[k].filter(cle).slice(0, 80); });
  ["cartes", "sections", "bibliotheques", "fonctions"].forEach((k) => { if (r[k] && typeof r[k] === "object") { const o = {}; Object.entries(r[k]).slice(0, 300).forEach(([c, v]) => { if (cle(c) && typeof v === "boolean") o[c] = v; }); out[k] = o; } });
  return out;
}
module.exports = { reglageNettoye, PARAMS_SPE, parametreDepart, BIBS, bibDe, estBib, DROITS_BIB, MODULES_BIB, infos, ROLES, membreDemande, MODULES, MAX, FORMULES, formulesValides, abonnement, horsQuota, MODELE, BIBLIOTHEQUES, DROITS_MEDECIN, MIGRATIONS, verifier, idCabinet, listesDepart, calendrierDepart, tarifsDepart, migrationsFaites, membreTitulaire };
