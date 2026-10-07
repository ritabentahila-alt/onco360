// Onco360 – conversion finale (phase D) : plan de copie des données de l'application actuelle (v1) vers Onco360 (v2),
// SANS effacer ce qui a été réglé dans Onco360. Fonction pure (aucun accès à la base) : testable hors navigateur.
//
// Repris de l'application actuelle (elle reste la référence jusqu'à la bascule) :
//   • dossiers patients et leurs montants (remplacent les dossiers d'essai d'Onco360) ;
//   • paiements et versements ;
//   • absences, jours fériés, correspondants et mutuelles : AJOUTÉS à ceux d'Onco360 ;
//   • protocoles créés depuis dans l'application actuelle : AJOUTÉS (jamais ceux supprimés dans Onco360).
// Conservés tels quels dans Onco360 :
//   horaires (y compris par établissement), établissements (adresse, logo…), accès et droits de l'équipe, profil
//   (photo, signature, INPE), bibliothèque de protocoles (favoris, statuts, modifications), tarifs et activités,
//   messages WhatsApp.
import { separer, fusionner } from "./conversion.js";
import { migrerV1, idsParDefaut } from "./migration.js";
import { tableDepuisV1 } from "../moteur/tarifs.js";
import { resume } from "../moteur/resume.js";

export const ETABS0 = { HGC: "Hôpital Général de Casablanca", HCK: "Hôpital Cheikh Khalifa", CIOC: "Centre International d'Oncologie de Casablanca" };
export const DROITS_MEDECIN = { identite: true, rendezvous: true, planningChimio: true, traitements: "modifier", radiotherapie: "modifier", administrer: true, creerPatient: true, supprimerPatient: true, finances: true, parametres: true };
const copie = (o) => JSON.parse(JSON.stringify(o));
const unir = (a, b, cle) => { const vu = {}, out = []; (a || []).concat(b || []).forEach((x) => { const k = cle(x); if (!vu[k]) { vu[k] = 1; out.push(x); } }); return out; };

// v1 : { patients:{id: objet v1}, protocoles:{docId:[protocoles]}, tarifs, paiements, versements, calendrier, listes }
// v2 : { espace, membres:{uid:…}, utilisateur, etablissements:{code:…}, tarifs, paiements, versements,
//        parametres:{calendrier, listes, activites, whatsapp, protocolesSupprimes}, protocoles:{docId:[…]}, patients:[ids], patientsFinances:[ids] }
// ctx : { uid, email, aujourdhui }
export function planifier(v1, v2, ctx) {
  const R = { garde: [], ajoute: [], remplace: [], avert: [] }, ecr = [], t = ctx.aujourdhui;
  const P2 = v2.parametres || {};

  // 1. Espace, membre titulaire, profil : créés seulement s'ils n'existent pas
  if (!v2.espace) ecr.push({ c: "espaces/E", d: { nom: "Cabinet Dr Bentahila", titulaire: ctx.uid, actif: true, cree: "__ts" } });
  else R.garde.push("Espace « " + (v2.espace.nom || "Cabinet") + " »");
  if (!(v2.membres || {})[ctx.uid]) ecr.push({ c: "espaces/E/membres/" + ctx.uid, d: { role: "medecin", nom: "Dr Bentahila", email: ctx.email, actif: true, tousEtablissements: true, etablissements: Object.keys(ETABS0), droits: DROITS_MEDECIN } });
  const nm = Object.keys(v2.membres || {}).length;
  if (nm) R.garde.push("Accès et droits de l'équipe : " + nm + " membre" + (nm > 1 ? "s" : ""));
  if (!v2.utilisateur) ecr.push({ c: "utilisateurs/" + ctx.uid, d: { email: ctx.email, nom: "BENTAHILA", titre: "Dr", profession: "medecin", actif: true } });
  else R.garde.push("Profil du médecin (nom, INPE" + (v2.utilisateur.signature ? ", signature" : "") + (v2.utilisateur.photo ? ", photo" : "") + ")");

  // 2. Établissements : on ne crée que ceux qui manquent (les dossiers peuvent en citer d'autres)
  const etabs = Object.assign({}, v2.etablissements || {}), codes = new Set(Object.keys(ETABS0));
  Object.values(v1.patients).forEach((p) => { if (p.hop) codes.add(p.hop); });
  codes.forEach((c) => { if (!etabs[c]) { const e = { code: c, nom: ETABS0[c] || c, actif: true }; etabs[c] = e; ecr.push({ c: "espaces/E/etablissements/" + c, d: e }); R.ajoute.push("Établissement " + c); } });
  const ne = Object.keys(v2.etablissements || {}).length;
  if (ne) R.garde.push("Établissements : " + ne + " (" + Object.values(v2.etablissements).filter((e) => e.logo).length + " avec logo)");

  // 3. Tarifs : ceux d'Onco360 s'ils existent (dates d'effet, activités ajoutées), sinon conversion de ceux de la v1
  let table = v2.tarifs;
  if (table) R.garde.push("Tarifs et activités par établissement");
  else { table = tableDepuisV1(v1.tarifs, ["HCK"]); ecr.push({ c: "espaces/E/finances/tarifs", d: { data: JSON.stringify(table) } }); R.ajoute.push("Tarifs (convertis depuis l'application actuelle)"); }
  if (P2.activites) R.garde.push("Liste des activités proposées pour les rendez-vous");
  if (P2.whatsapp && Object.keys(P2.whatsapp).length) R.garde.push("Messages WhatsApp personnalisés : " + Object.keys(P2.whatsapp).length);

  // 4. Paiements et versements : ceux de l'application actuelle (saisie réelle)
  ecr.push({ c: "espaces/E/finances/paiements", d: { data: JSON.stringify(v1.paiements || {}) } });
  ecr.push({ c: "espaces/E/finances/versements", d: { data: JSON.stringify(v1.versements || []) } });
  R.remplace.push("Paiements : " + Object.keys(v1.paiements || {}).length + " (essais Onco360 : " + Object.keys(v2.paiements || {}).length + ")");
  R.remplace.push("Versements : " + (v1.versements || []).length + " (essais Onco360 : " + (v2.versements || []).length + ")");

  // 5. Calendrier : horaires d'Onco360 ; absences et jours fériés réunis (Onco360 prioritaire en cas de même date)
  const c1 = v1.calendrier || { feries: (v1.tarifs && v1.tarifs.feries) || [], abs: (v1.tarifs && v1.tarifs.abs) || [] }, c2 = P2.calendrier;
  let cal;
  if (!c2) { cal = copie(c1); R.ajoute.push("Calendrier (jours fériés et absences de l'application actuelle)"); }
  else {
    cal = copie(c2);
    const absAv = (cal.abs || []).length, ferAv = (cal.feries || []).length;
    cal.abs = unir(cal.abs, c1.abs, (a) => a.du + "|" + a.au).sort((a, b) => String(a.du).localeCompare(String(b.du)));
    cal.feries = unir(cal.feries, c1.feries, (f) => f.d).sort((a, b) => a.d.localeCompare(b.d));
    R.garde.push("Horaires de consultation" + (cal.horairesEtab && Object.keys(cal.horairesEtab).length ? " (dont " + Object.keys(cal.horairesEtab).join(", ") + ")" : ""));
    R.garde.push("Absences : " + absAv + (cal.abs.length > absAv ? " + " + (cal.abs.length - absAv) + " de l'application actuelle" : ""));
    R.garde.push("Jours fériés : " + ferAv + (cal.feries.length > ferAv ? " + " + (cal.feries.length - ferAv) + " de l'application actuelle" : ""));
  }
  if (JSON.stringify(cal) !== JSON.stringify(c2)) ecr.push({ c: "espaces/E/parametres/calendrier", d: { data: JSON.stringify(cal) } });

  // 6. Correspondants et mutuelles : réunis
  const l1 = v1.listes || { cor: [], mut: [] }, l2 = P2.listes, listes = { cor: unir(l2 && l2.cor, l1.cor, (x) => String(x).toLowerCase()), mut: unir(l2 && l2.mut, l1.mut, (x) => String(x).toLowerCase()) };
  if (JSON.stringify(listes) !== JSON.stringify(l2)) ecr.push({ c: "espaces/E/parametres/listes", d: { data: JSON.stringify(listes) } });

  // 7. Protocoles : bibliothèque d'Onco360 gardée ; protocoles nouveaux de la v1 ajoutés ; jamais ceux supprimés dans Onco360
  const b2 = v2.protocoles || {}, supp = new Set((P2.protocolesSupprimes || []).map(String)), bib = {}, ids2 = new Set();
  Object.values(b2).forEach((l) => l.forEach((p) => { ids2.add(p.id); bib[p.id] = p; }));
  if (!ids2.size) {
    Object.entries(v1.protocoles).forEach(([d, l]) => { ecr.push({ c: "espaces/E/protocoles/" + d, d: { data: JSON.stringify(l), n: l.length } }); l.forEach((p) => { bib[p.id] = p; }); });
    R.ajoute.push("Bibliothèque de protocoles : " + Object.keys(bib).length);
  } else {
    const blocs = {}; let ajout = 0, diff = 0;
    Object.entries(v1.protocoles).forEach(([d, l]) => l.forEach((p) => {
      if (ids2.has(p.id)) { const q = copie(bib[p.id]); delete q.fav; delete q.st; const r = copie(p); delete r.fav; delete r.st; if (JSON.stringify(q) !== JSON.stringify(r)) diff++; return; }
      if (supp.has(String(p.id))) return;
      (blocs[d] = blocs[d] || copie(b2[d] || [])).push(p); bib[p.id] = p; ajout++;
    }));
    Object.entries(blocs).forEach(([d, l]) => ecr.push({ c: "espaces/E/protocoles/" + d, d: { data: JSON.stringify(l), n: l.length } }));
    R.garde.push("Bibliothèque de protocoles : " + ids2.size + " (favoris, statuts et modifications d'Onco360)");
    if (ajout) R.ajoute.push("Protocoles créés depuis dans l'application actuelle : " + ajout);
    if (supp.size) R.garde.push("Protocoles supprimés dans Onco360 (non recopiés) : " + supp.size);
    if (diff) R.avert.push(diff + " protocole(s) diffèrent entre les deux applications : la version d'Onco360 est gardée.");
  }

  // 8. Dossiers patients : copie de la v1 (remplace les dossiers d'essai)
  const ctxM = { aujourdhui: t, bib, feries: cal.feries || [], nouvelId: idsParDefaut() }, ctxR = { aujourdhui: t, bib, feries: cal.feries || [], table };
  const patients = [], v1n = {};
  Object.entries(v1.patients).forEach(([id, p0]) => {
    const P = migrerV1(copie(p0), ctxM); P.id = id; v1n[id] = P;
    const { patient, montants } = separer(P), F = fusionner(id, patient, null);
    patients.push({ id, patient: Object.assign({}, patient, { resume: JSON.stringify(resume(copie(F), ctxR)), version: 1, majPar: ctx.uid, maj: "__ts" }), finances: { etablissementId: patient.etablissementId, montantsJson: JSON.stringify(montants) }, montants });
  });
  const essais = (v2.patients || []).filter((id) => !v1.patients[id]);
  R.remplace.push("Dossiers patients : " + patients.length + " copiés de l'application actuelle" + ((v2.patients || []).length ? " (remplacent les " + v2.patients.length + " dossiers d'Onco360" + (essais.length ? ", dont " + essais.length + " créé(s) seulement dans Onco360" : "") + ")" : ""));
  if (essais.length) R.avert.push(essais.length + " dossier(s) n'existent que dans Onco360 (dossiers d'essai) et seront effacés : " + essais.join(", "));
  const effacer = unir(v2.patients, v2.patientsFinances, (x) => x);
  return { ecritures: ecr, patients, effacer, v1n, table, tableV1: tableDepuisV1(v1.tarifs, ["HCK"]), cal, bib, rapport: R };
}
