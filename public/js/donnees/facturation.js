// Abonnements des cabinets (étape 17.4, 10/10/2026, décidé par Dr Bentahila) : prix mensuel et annuel par pack (annuel = 10 mois),
// essai gratuit de 30 jours, gratuit sans limite possible (amis), rappel 15 jours avant l'échéance, cabinet suspendu
// automatiquement 30 jours après une échéance non payée (jamais le cabinet de Dr Bentahila ni la démonstration).
// Fiche de facturation : facturation/{espace} (serveur seulement, invisible des cabinets) = { mode: essai|mensuel|annuel|gratuit,
// prix (DH par période ; vide = prix du pack), essaiFin, echeance (AAAA-MM-JJ : fin de la période payée), paiements [{ id, d, m,
// periode: mois|an, moyen, ref, note, par, le }], note, journal [{ le, par, txt }], suspenduPour (échéance qui a valu la suspension) }.
// Même code : functions/facturation.js (serveur) et public/js/donnees/facturation.js (site), vérifié par node functions/test-cabinets.js.
const ESSAI_JOURS = 30, DELAI_SUSPENSION = 30, RAPPEL_JOURS = 15;
const MODES_FACT = [["essai", "Essai gratuit"], ["mensuel", "Mensuel"], ["annuel", "Annuel"], ["gratuit", "Gratuit, sans limite"]];
const MOYENS = [["virement", "Virement"], ["cheque", "Chèque"], ["especes", "Espèces"], ["carte", "Carte"], ["autre", "Autre"]];
// Prix proposés par Onco360 (DH hors taxes) : repères = logiciels de cabinet (100 à 140 € par mois en France), Onco360 étant spécialisé
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
function etatFacturation(f, jour) {
  if (!f || !f.mode) return { etat: "nonSuivi", jours: null, fin: "", lib: "Non suivi" };
  if (f.mode === "gratuit") return { etat: "gratuit", jours: null, fin: "", lib: "Gratuit" };
  const fin = f.mode === "essai" && !f.echeance ? f.essaiFin || "" : f.echeance || f.essaiFin || "";
  if (!fin) return { etat: "retard", jours: 0, fin: "", lib: "Échéance à fixer" };
  const n = ecart(jour, fin);
  if (n >= 0) { if (f.mode === "essai" && !f.echeance) return { etat: "essai", jours: n, fin, lib: "Essai : " + n + " j restant" + (n > 1 ? "s" : "") };
    return n <= RAPPEL_JOURS ? { etat: "renouveler", jours: n, fin, lib: "À renouveler (" + n + " j)" } : { etat: "ajour", jours: n, fin, lib: "À jour" }; }
  const r = -n;
  return r > DELAI_SUSPENSION ? { etat: "suspendre", jours: r, fin, lib: "Retard de " + r + " j" } : { etat: "retard", jours: r, fin, lib: "Retard de " + r + " j" };
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
  return { mode, prix: nombreOk(x.prix), essaiFin: dateOk(x.essaiFin), echeance: dateOk(x.echeance), note: String(x.note || "").replace(/\s+/g, " ").trim().slice(0, 300) };
}
function paiementNettoye(o) {
  const x = o || {}, d = dateOk(x.d), m = nombreOk(x.m);
  if (!d) throw new Error("Date du paiement manquante.");
  if (m == null || m <= 0) throw new Error("Montant du paiement manquant.");
  return { d, m, periode: x.periode === "an" ? "an" : "mois", moyen: MOYENS.some((y) => y[0] === x.moyen) ? x.moyen : "virement", ref: String(x.ref || "").trim().slice(0, 60), note: String(x.note || "").trim().slice(0, 200) };
}
export { ESSAI_JOURS, DELAI_SUSPENSION, RAPPEL_JOURS, MODES_FACT, MOYENS, PRIX0, ajouterJours, ecart, prolonger, etatFacturation, prixCabinet, reglageFacturation, paiementNettoye };
