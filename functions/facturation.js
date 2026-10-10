"use strict";
// Abonnements des cabinets (étape 17.4, 10/10/2026, décidé par Dr Bentahila) : prix mensuel et annuel par pack (annuel = 10 mois),
// essai gratuit de 30 jours, gratuit sans limite possible (amis), rappel 15 jours avant l'échéance ; après 30 jours de retard,
// suspension selon les réglages de l'administration (18.3 : « me demander » par défaut, automatique ou jamais ; délais réglables ;
// un cabinet peut être exclu : jamaisSuspendre) ; jamais le cabinet de Dr Bentahila ni la démonstration.
// Prix TTC (TVA 20 % comprise, décidé le 10/10/2026 : les médecins ne récupèrent pas la TVA, le prix affiché est celui payé).
// Fiche de facturation : facturation/{espace} (serveur seulement, invisible des cabinets) = { mode: essai|mensuel|annuel|gratuit,
// prix (DH par période ; vide = prix du pack), essaiFin, echeance (AAAA-MM-JJ : fin de la période payée), paiements [{ id, d, m,
// periode: mois|an, moyen, ref, note, par, le }], note, journal [{ le, par, txt }], suspenduPour (échéance qui a valu la suspension) }.
// Même code : functions/facturation.js (serveur) et public/js/donnees/facturation.js (site), vérifié par node functions/test-cabinets.js.
const ESSAI_JOURS = 30, DELAI_SUSPENSION = 30, RAPPEL_JOURS = 15, TVA = 20;
// Réglages des abonnements (plateforme/abonnements, 18.3) : suspension demander | auto | jamais, délais en jours
const REGLAGES_ABO0 = { suspension: "demander", delai: DELAI_SUSPENSION, rappel: RAPPEL_JOURS, essai: ESSAI_JOURS }; // + modeles (relances, 18.6) : voir reglagesAbo
// Relances (18.6) : messages de départ, modifiables (Comptabilité › Relances › Modèles des messages) ; champs {medecin} {cabinet}
// {pack} {montant} {montantAn} {echeance} {jours} {rib} {raison}
const MODELES_RELANCE0 = {
  retard: "Bonjour {medecin},\nVotre abonnement Onco360 ({pack}) est arrivé à échéance le {echeance} ({jours} jours de retard). Montant à régler : {montant} TTC.\nPour continuer sans interruption, merci d'effectuer le règlement par virement (RIB {rib}, au nom de {raison}) ou par chèque.\nMerci et bonne journée,\nL'équipe Onco360",
  renouveler: "Bonjour {medecin},\nVotre abonnement Onco360 ({pack}) arrive à échéance le {echeance}, dans {jours} jours. Montant : {montant} TTC, ou {montantAn} TTC pour l'année (2 mois offerts).\nRèglement par virement (RIB {rib}, au nom de {raison}) ou par chèque.\nMerci,\nL'équipe Onco360",
  essai: "Bonjour {medecin},\nVotre essai gratuit d'Onco360 se termine le {echeance} (dans {jours} jours). Pour continuer : {montant} TTC par mois, ou {montantAn} TTC par an (2 mois offerts).\nRépondez simplement à ce message pour choisir votre formule.\nL'équipe Onco360" };
const CANAUX = [["whatsapp", "WhatsApp"], ["email", "E-mail"], ["telephone", "Téléphone"], ["autre", "Autre"]];
function reglagesAbo(o) {
  const x = o || {}, n = (v, d, a, b) => { const k = Math.round(Number(v)); return isNaN(k) || v === "" || v == null ? d : Math.min(b, Math.max(a, k)); };
  const m = x.modeles || {}, modeles = {};
  Object.keys(MODELES_RELANCE0).forEach((k) => { const v = String(m[k] == null ? "" : m[k]).replace(/\r/g, "").trim().slice(0, 1500); modeles[k] = v || MODELES_RELANCE0[k]; });
  return { suspension: ["demander", "auto", "jamais"].indexOf(x.suspension) >= 0 ? x.suspension : "demander", delai: n(x.delai, DELAI_SUSPENSION, 1, 365), rappel: n(x.rappel, RAPPEL_JOURS, 0, 90), essai: n(x.essai, ESSAI_JOURS, 1, 365), modeles };
}
const MODES_FACT = [["essai", "Essai gratuit"], ["mensuel", "Mensuel"], ["annuel", "Annuel"], ["gratuit", "Gratuit, sans limite"]];
const MOYENS = [["virement", "Virement"], ["cheque", "Chèque"], ["especes", "Espèces"], ["carte", "Carte"], ["autre", "Autre"]];
// Prix proposés par Onco360 (DH TTC) : repères = logiciels de cabinet (100 à 140 € par mois en France), Onco360 étant spécialisé
// (chimiothérapie, radiothérapie) ; annuel = 10 mois (2 mois offerts)
const PRIX0 = { essentiel: { mois: 690, an: 6900 }, "onco-pro": { mois: 1190, an: 11900 }, "onco-clinique": { mois: 2490, an: 24900 },
  radiotherapie: { mois: 690, an: 6900 }, "rt-pro": { mois: 1190, an: 11900 }, "rt-centre": { mois: 2490, an: 24900 },
  "oncort-pro": { mois: 1490, an: 14900 }, complet: { mois: 2990, an: 29900 } };
const jourD = (s) => new Date(String(s).slice(0, 10) + "T12:00:00Z");
const iso = (d) => d.toISOString().slice(0, 10);
const ajouterJours = (s, n) => { const d = jourD(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const ecart = (a, b) => Math.round((jourD(b) - jourD(a)) / 86400000); // b − a, en jours
// Fin de la période payée après un paiement : la période suit l'échéance précédente (ou la fin de l'essai) ; un cabinet qui reprend
// après une longue interruption (plus d'un an) repart du jour du paiement
function prolonger(f, d, periode) {
  let base = (f && (f.echeance || f.essaiFin)) || d;
  if (ecart(base, d) > 365) base = d;
  const x = jourD(base);
  if (periode === "an") x.setUTCFullYear(x.getUTCFullYear() + 1); else { const j = x.getUTCDate(); x.setUTCMonth(x.getUTCMonth() + 1); if (x.getUTCDate() < j) x.setUTCDate(0); }
  return iso(x);
}
// État de l'abonnement d'un cabinet au jour donné : { etat, jours (restants ou de retard), fin, lib }
//   nonSuivi (pas de fiche), gratuit, essai, ajour, renouveler (≤ 15 j), retard (≤ 30 j), suspendre (> 30 j de retard)
function etatFacturation(f, jour, R) {
  const delai = (R && R.delai) || DELAI_SUSPENSION, rappel = R && R.rappel != null ? R.rappel : RAPPEL_JOURS;
  if (!f || !f.mode) return { etat: "nonSuivi", jours: null, fin: "", lib: "Non suivi" };
  if (f.mode === "gratuit") return { etat: "gratuit", jours: null, fin: "", lib: "Gratuit" };
  const fin = f.mode === "essai" && !f.echeance ? f.essaiFin || "" : f.echeance || f.essaiFin || "";
  if (!fin) return { etat: "retard", jours: 0, fin: "", lib: "Échéance à fixer" };
  const n = ecart(jour, fin);
  if (n >= 0) { if (f.mode === "essai" && !f.echeance) return { etat: "essai", jours: n, fin, lib: "Essai : " + n + " j restant" + (n > 1 ? "s" : "") };
    return n <= rappel ? { etat: "renouveler", jours: n, fin, lib: "À renouveler (" + n + " j)" } : { etat: "ajour", jours: n, fin, lib: "À jour" }; }
  const r = -n;
  return r > delai ? { etat: "suspendre", jours: r, fin, lib: "Retard de " + r + " j" } : { etat: "retard", jours: r, fin, lib: "Retard de " + r + " j" };
}
// Prix d'un cabinet par période et en équivalent mensuel (revenu mensuel du tableau de bord)
function prixCabinet(f, pack, cle) {
  const P = (pack && pack.prix) || PRIX0[cle] || {}, mode = f && f.mode;
  if (!f || mode === "gratuit" || mode === "essai") return { periode: mode === "annuel" ? "an" : "mois", prix: 0, mensuel: 0, catalogue: mode === "annuel" ? P.an : P.mois };
  const an = mode === "annuel", prix = f.prix != null && f.prix !== "" ? Number(f.prix) : an ? P.an : P.mois;
  return { periode: an ? "an" : "mois", prix: prix || 0, mensuel: Math.round((prix || 0) / (an ? 12 : 1)), catalogue: an ? P.an : P.mois };
}
// Fiche envoyée par la page Administration, nettoyée (dates AAAA-MM-JJ, prix ≥ 0)
const dateOk = (s) => (typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "");
const nombreOk = (v) => (v == null || v === "" || isNaN(v) || Number(v) < 0 ? null : Math.round(Number(v)));
function reglageFacturation(o) {
  const x = o || {}, mode = MODES_FACT.some((m) => m[0] === x.mode) ? x.mode : "essai";
  return { mode, prix: nombreOk(x.prix), essaiFin: dateOk(x.essaiFin), echeance: dateOk(x.echeance), note: String(x.note || "").replace(/\s+/g, " ").trim().slice(0, 300), jamaisSuspendre: x.jamaisSuspendre === true };
}
function paiementNettoye(o) {
  const x = o || {}, d = dateOk(x.d), m = nombreOk(x.m);
  if (!d) throw new Error("Date du paiement manquante.");
  if (m == null || m <= 0) throw new Error("Montant du paiement manquant.");
  return { d, m, periode: x.periode === "an" ? "an" : "mois", moyen: MOYENS.some((y) => y[0] === x.moyen) ? x.moyen : "virement", ref: String(x.ref || "").trim().slice(0, 60), note: String(x.note || "").trim().slice(0, 200) };
}
// Coordonnées de facturation d'un cabinet (18.1) : raison sociale, ICE (15 chiffres au Maroc), IF, adresse, e-mail de facturation
function clientNettoye(o) {
  const x = o || {}, t = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  return { raison: t(x.raison, 120), ice: t(x.ice, 20).replace(/\s/g, ""), if: t(x.if, 20), adresse: t(x.adresse, 200), email: t(x.email, 120).toLowerCase() };
}
// Échéances attendues dans les n prochains jours (18.2) : [{ d, m }] pour un cabinet mensuel / annuel actif ; essai : son premier
// paiement attendu à la fin de l'essai (prix du pack, mensuel)
function attendus(f, P, jour, n) {
  const out = []; if (!f || f.mode === "gratuit") return out;
  const fin = ajouterJours(jour, n), prix = P.prix || P.catalogue || 0;
  if (f.mode === "essai" && !f.echeance) { if (f.essaiFin && f.essaiFin >= jour && f.essaiFin <= fin) out.push({ d: f.essaiFin, m: P.catalogue || 0, essai: true }); return out; }
  let d = f.echeance; if (!d || d < jour) return out; // en retard : compté dans les impayés
  for (let i = 0; i < 40 && d <= fin; i++) { out.push({ d, m: prix }); d = prolonger({ echeance: d }, d, f.mode === "annuel" ? "an" : "mois"); }
  return out;
}
// Impayé d'un cabinet en retard (18.2) : périodes échues depuis l'échéance (au moins une) × prix
function impaye(f, P, jour) {
  if (!f || f.mode === "gratuit") return 0;
  const fin = f.mode === "essai" && !f.echeance ? f.essaiFin : f.echeance; if (!fin || fin >= jour) return 0;
  const r = ecart(fin, jour), an = f.mode === "annuel", nb = an ? Math.ceil(r / 365) : Math.ceil(r / 30.4);
  return Math.max(1, nb) * ((f.mode === "essai" && !f.echeance ? P.catalogue : P.prix || P.catalogue) || 0);
}
// ───── Factures (18.4, 10/10/2026 ; décidé : TVA 20 %, prix TTC, numéros F-AAAA-NNNN, avoirs AV-AAAA-NNNN) ─────
// Montants d'une facture à partir du TTC payé : HT = TTC / (1 + taux), TVA = TTC − HT (au centime)
const c2 = (x) => Math.round(x * 100) / 100;
function montants(ttc, taux) { const t = taux == null ? TVA : Number(taux), T = c2(Number(ttc) || 0), H = c2(T / (1 + t / 100)); return { ttc: T, ht: H, tva: c2(T - H), taux: t }; }
// L'éditrice d'Onco360 (plateforme/editeur) : mentions légales des factures (article 145 du CGI : nom, adresse, IF, ICE, RC, taxe
// professionnelle…)
const CHAMPS_EDITEUR = [["raison", "Raison sociale (ou nom)", 120], ["forme", "Forme juridique (SARL, SARLAU, auto-entrepreneur…)", 60], ["ice", "ICE", 20], ["if", "Identifiant fiscal (IF)", 20], ["rc", "Registre de commerce (RC, ville)", 40], ["patente", "Taxe professionnelle (patente)", 30], ["cnss", "CNSS (facultatif)", 30], ["adresse", "Adresse", 200], ["ville", "Ville", 60], ["tel", "Téléphone", 30], ["email", "E-mail", 120], ["rib", "RIB (pour les virements)", 40], ["banque", "Banque", 60], ["mentions", "Mentions en bas de facture (facultatif)", 400]];
const EDITEUR_REQUIS = ["raison", "ice", "if", "adresse", "ville"];
function editeurNettoye(o) { const x = o || {}, out = {}; CHAMPS_EDITEUR.forEach(([k, , n]) => { out[k] = String(x[k] == null ? "" : x[k]).replace(/[ \t]+/g, " ").trim().slice(0, n); }); out.ice = out.ice.replace(/\s/g, ""); out.tva = TVA; return out; }
const editeurIncomplet = (e) => EDITEUR_REQUIS.filter((k) => !(e && e[k]));
const numeroFacture = (type, annee, rang) => (type === "avoir" ? "AV" : "F") + "-" + annee + "-" + String(rang).padStart(4, "0");
// Message de relance rempli (18.6) : remplace {champ} par sa valeur (champ inconnu : laissé tel quel)
const remplirRelance = (modele, V) => String(modele || "").replace(/\{([a-zA-Z]+)\}/g, (t, k) => (V[k] != null && V[k] !== "" ? String(V[k]) : k === "rib" ? "à demander" : t));
module.exports = { ESSAI_JOURS, DELAI_SUSPENSION, RAPPEL_JOURS, TVA, REGLAGES_ABO0, MODELES_RELANCE0, CANAUX, reglagesAbo, MODES_FACT, MOYENS, PRIX0, ajouterJours, ecart, prolonger, etatFacturation, prixCabinet, reglageFacturation, paiementNettoye, clientNettoye, attendus, impaye, montants, CHAMPS_EDITEUR, EDITEUR_REQUIS, editeurNettoye, editeurIncomplet, numeroFacture, remplirRelance };
