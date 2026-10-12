// Onco360 – création d'un cabinet (phase F, étape 4, 09/10/2026). Logique pure, sans Firebase (tests : node functions/test-cabinets.js).
// Ce que reçoit un nouveau cabinet, décidé par Dr Bentahila le 09/10/2026 : protocoles, jours fériés, diagnostics, mutuelles,
// bibliothèques (médicaments, ordonnances types, analyses et bilans, examens, courriers), tarifs de radiothérapie (actes RT,
// VMAT). Rien d'autre : ni correspondants, ni tarifs des consultations et séances, ni établissements, ni patients, ni profil, ni
// bilan, ni documentation déposée (les fiches de départ d'Onco360 s'affichent toutes seules). Réglages : valeurs de départ.
const DEPART = require("./listes-depart.json");

const MODELE = "cabinet-bentahila"; // cabinet dont on copie la bibliothèque
const BIBLIOTHEQUES = ["medicaments", "ordostypes", "analyses", "bilans", "examens", "courriers"];
// Droits du médecin titulaire : tous (mêmes valeurs que DROITS_ROLE.medecin de public/js/app/profil.js, vérifié par le test)
const DROITS_MEDECIN = { identite: true, fichePatient: true, rendezvous: true, consultations: true, ecrireConsultations: true, planningChimio: true, traitements: "modifier", radiotherapie: "modifier", documents: true, administrer: true, encaissements: true, creerPatient: true, supprimerPatient: true, finances: true, parametres: true, secretariat: true };
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
const { PRIX0 } = require("./facturation");
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
Object.keys(FORMULES).forEach((k) => { FORMULES[k].prix = Object.assign({}, PRIX0[k]); }); // prix proposés (17.4), modifiables pack par pack
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
    const rg = reglageNettoye(f.reglage); if (rg) { delete rg.fiche; delete rg.consultation; out[k].reglage = rg; } // réglage complet du pack (menu, cartes, onglets, fonctions…, 10/10/2026) ; la fiche patient est celle de la spécialité
    if (out[k].modules.indexOf("taches") < 0) out[k].modules = out[k].modules.filter((m) => m !== "rcp");
    // Prix du pack (17.4) : DH hors taxes par mois et par an ; absent = prix proposé par Onco360 pour ce pack, sinon aucun
    const px = f.prix || PRIX0[k]; if (px) out[k].prix = { mois: nombre(px.mois), an: nombre(px.an) };
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
// Plusieurs cabinets pour un compte (19.2, 10/10/2026 : une secrétaire qui travaille pour plusieurs médecins) :
// comptes/{uid} = { espace (cabinet principal, ouvert par défaut), espaces: [tous ses cabinets] } ; anciens comptes : { espace } seul ;
// aucune fiche = cabinet modèle si la personne y est membre (membreModele)
function espacesCompte(c, membreModele) {
  const l = [], aj = (x) => { if (x && typeof x === "string" && l.indexOf(x) < 0) l.push(x); };
  if (c) { aj(c.espace); (Array.isArray(c.espaces) ? c.espaces : []).forEach(aj); } else if (membreModele) aj(MODELE);
  return l;
}
// Fiche comptes après l'ajout (present) ou le retrait d'un cabinet ; null = plus aucun cabinet (fiche à effacer)
function compteModifie(c, membreModele, e, present) {
  const l0 = espacesCompte(c, membreModele), l = present ? (l0.indexOf(e) >= 0 ? l0 : l0.concat([e])) : l0.filter((x) => x !== e);
  return l.length ? { espace: l[0], espaces: l } : null;
}
// Noms corrigés dans Paramètres › Listes (19.3, 10/10/2026) : corrigés dans TOUS les dossiers du cabinet par le serveur (une secrétaire
// d'un seul lieu ne voit pas les autres dossiers) ; diagnostic, mutuelle, correspondant ; comparaison sans casse ni espaces autour
const CHAMP_LISTE = { diag: ["clinique", "diag"], mut: ["identite", "mut"], cor: ["identite", "cor"] };
function renomsValides(l) {
  return (Array.isArray(l) ? l : []).filter((r) => r && CHAMP_LISTE[r.k] && typeof r.de === "string" && typeof r.vers === "string")
    .map((r) => ({ k: r.k, de: r.de.trim().slice(0, 200), vers: r.vers.trim().slice(0, 200) })).filter((r) => r.de && r.vers && r.de !== r.vers).slice(0, 200);
}
// Changements d'un dossier (null = rien à corriger) ; le résumé garde le diagnostic à jour
function corrigerDossier(d, renoms) {
  const ch = {};
  renoms.forEach(({ k, de, vers }) => { const [b, f] = CHAMP_LISTE[k], B = ch[b] || Object.assign({}, d[b] || {}); if (String(B[f] || "").trim().toLowerCase() === de.toLowerCase()) { B[f] = vers; ch[b] = B; } });
  if (!Object.keys(ch).length) return null;
  if (ch.clinique && d.resume) { try { const r = JSON.parse(d.resume); r.diag = ch.clinique.diag || ""; ch.resume = JSON.stringify(r); } catch (e) { /* résumé illisible : refait au prochain enregistrement */ } }
  return ch;
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
const DROITS_BIB = { identite: false, fichePatient: false, rendezvous: false, consultations: false, ecrireConsultations: true, planningChimio: false, traitements: "modifier", radiotherapie: "modifier", documents: false, administrer: false, encaissements: false, creerPatient: false, supprimerPatient: false, finances: true, parametres: true, secretariat: false };
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
// Fiche patient (10/10/2026) : ordre, présence, nom affiché des champs (libs), champs ajoutés (libellé, type, choix, partie, imprimer,
// en-tête). Sert à la fiche de la spécialité (ficheSpecialite) et aux retouches d'un cabinet.
// Sert aussi au formulaire de consultation (16.7 : types texte long et titre de section, unité d'un nombre, choixs = listes de choix
// des champs existants).
const TYPES_CHAMP = ["texte", "textelong", "nombre", "date", "choix", "ouinon", "section"];
function ficheNettoyee(f) {
  if (!f || typeof f !== "object") return null;
  const cle = (k) => typeof k === "string" && /^[a-z0-9._-]{1,40}$/i.test(k), t = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n), F = {};
  if (Array.isArray(f.ordre)) F.ordre = f.ordre.filter(cle).slice(0, 120);
  if (f.champs && typeof f.champs === "object") { F.champs = {}; Object.entries(f.champs).slice(0, 120).forEach(([c, v]) => { if (cle(c) && typeof v === "boolean") F.champs[c] = v; }); }
  if (f.entetes && typeof f.entetes === "object") { F.entetes = {}; Object.entries(f.entetes).slice(0, 120).forEach(([c, v]) => { if (cle(c) && typeof v === "boolean") F.entetes[c] = v; }); } // en tête du dossier (fiche)
  if (f.libs && typeof f.libs === "object") { F.libs = {}; Object.entries(f.libs).slice(0, 120).forEach(([c, v]) => { if (cle(c) && t(v, 60)) F.libs[c] = t(v, 60); }); }
  const liste = (l) => (Array.isArray(l) ? l.map((c) => t(c, 60)).filter(Boolean).slice(0, 40) : []);
  if (f.choixs && typeof f.choixs === "object") { F.choixs = {}; Object.entries(f.choixs).slice(0, 20).forEach(([c, v]) => { const l = liste(v); if (cle(c) && l.length) F.choixs[c] = l; }); }
  if (Array.isArray(f.ajouts)) F.ajouts = f.ajouts.filter((a) => a && /^x[a-z0-9]{3,20}$/.test(a.id || "") && t(a.lib, 60)).slice(0, 80).map((a) => Object.assign({ id: a.id, lib: t(a.lib, 60),
    type: TYPES_CHAMP.indexOf(a.type) >= 0 ? a.type : "texte", choix: liste(a.choix),
    partie: a.partie === "clinique" ? "clinique" : "identite", imprimer: a.imprimer === true, entete: a.entete === true }, t(a.unite, 15) ? { unite: t(a.unite, 15) } : {}, a.tumeur === true ? { tumeur: true } : {})); // tumeur : partie « Fiche tumeur » (12/10/2026)
  return F;
}
const idSpecialite = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "specialite";
// Retouches d'un cabinet (10/10/2026) : listes ordonnées et cases oui / non, clés courtes seulement (le catalogue est sur le site :
// public/js/donnees/catalogue.js ; une clé inconnue est ignorée à l'affichage)
function reglageNettoye(r) {
  if (!r || typeof r !== "object") return null;
  const cle = (k) => typeof k === "string" && /^[a-z0-9._-]{1,40}$/i.test(k), out = {};
  ["menu", "accueil", "ordreSections"].forEach((k) => { if (Array.isArray(r[k])) out[k] = r[k].filter(cle).slice(0, 80); });
  ["cartes", "sections", "bibliotheques", "fonctions"].forEach((k) => { if (r[k] && typeof r[k] === "object") { const o = {}; Object.entries(r[k]).slice(0, 300).forEach(([c, v]) => { if (cle(c) && typeof v === "boolean") o[c] = v; }); out[k] = o; } });
  // Fiche patient : retouches du cabinet (en plus de la fiche de la spécialité)
  const F = ficheNettoyee(r.fiche); if (F) out.fiche = F;
  const Cs = ficheNettoyee(r.consultation); if (Cs) out.consultation = Cs; // formulaire de consultation : retouches du cabinet (16.7)
  return out;
}
module.exports = { renomsValides, corrigerDossier, espacesCompte, compteModifie, ficheNettoyee, idSpecialite, reglageNettoye, PARAMS_SPE, parametreDepart, BIBS, bibDe, estBib, DROITS_BIB, MODULES_BIB, infos, ROLES, membreDemande, MODULES, MAX, FORMULES, formulesValides, abonnement, horsQuota, MODELE, BIBLIOTHEQUES, DROITS_MEDECIN, MIGRATIONS, verifier, idCabinet, listesDepart, calendrierDepart, tarifsDepart, migrationsFaites, membreTitulaire };
