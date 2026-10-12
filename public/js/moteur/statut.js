// Onco360 – statut du patient, dernières nouvelles, allergie (3.2 et 3.3, 12/10/2026) : calculs purs (tests/moteur/test-statut.mjs).
// clinique.statut : "" | traitement | surveillance | perdu | decede ; clinique.decesLe (date) ; clinique.allergie : "" | oui | non
// (bandeau rouge seulement si « oui », décision de Dr Bentahila) avec le détail dans clinique.allergies.
export const STATUTS = [["traitement", "En traitement"], ["surveillance", "En surveillance"], ["perdu", "Perdu de vue"], ["decede", "Décédé"]];
export const libStatut = (k) => (STATUTS.find((s) => s[0] === k) || [])[1] || "";
export const decede = (P) => !!P && P.statut === "decede";
export const allergique = (P) => !!P && P.allergie === "oui";

// Date des dernières nouvelles (jusqu'à t) : consultations (dates données), rendez-vous « venu », cures et séances reçues,
// radiothérapie commencée ou terminée, décès
export function dernieresNouvelles(P, datesConsult, t) {
  const l = (datesConsult || []).slice();
  (P.rdvs || []).forEach((r) => { if (r.st === "fait" && r.d) l.push(r.d); });
  (P.lignes || []).forEach((L) => (L.cures || []).forEach((c) => {
    if (c.st === "recue" && c.reelle) l.push(c.reelle);
    Object.values(c.sea || {}).forEach((z) => { if (z && z.st === "recue" && z.d) l.push(z.d); });
  }));
  (P.rts || []).forEach((r) => { [r.deb, r.fin].forEach((d) => { if (d) l.push(d); }); });
  if (P.decesLe) l.push(P.decesLe);
  return l.filter((d) => /^\d{4}-\d{2}-\d{2}/.test(d) && (!t || d.slice(0, 10) <= t)).map((d) => d.slice(0, 10)).sort().pop() || "";
}

// Mots d'une allergie (« Pénicilline, iode » → ["PENICILLINE", "IODE"]) ; un médicament qui en contient un → alerte simple
const sa = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const VIDES = ["AUCUNE", "AUCUN", "CONNUE", "ALLERGIE", "ALLERGIES", "AVEC", "SANS", "POUR", "AUX", "DES", "LES"];
export const motsAllergie = (txt) => sa(txt).split(/[^A-Z0-9]+/).filter((w) => w.length >= 4 && VIDES.indexOf(w) < 0);
export function allergieDans(P, nomMedicament) {
  if (!allergique(P)) return null;
  const n = sa(nomMedicament), m = motsAllergie(P.allergies).find((w) => n.indexOf(w) >= 0 || (w.length >= 6 && n.indexOf(w.slice(0, 6)) >= 0));
  return m || null;
}

// 3.1 bis (12/10/2026) : diagnostic complet pour les comptes rendus, courriers et la fiche de chimiothérapie : localisation (diagnostic),
// côté, histologie, stade et précision de la fiche tumeur, quand ils sont remplis (« Cancer de l’ovaire, adénocarcinome séreux,
// métastatique (péritoine) ») ; P = dossier lu (fusionner : clinique.extra dans P.extra)
export function diagnosticComplet(P) {
  const ex = (P && P.extra) || {}, d = String((P && P.diag) || "").trim(), c = ex.xtcote || "", st = String(ex.xtstade || "").trim();
  if (!d) return String((P && P.diagP) || "");
  return d + (c === "Bilatéral" ? ", bilatéral" : c === "Droit" || c === "Gauche" ? ", côté " + c.toLowerCase() : "") + (ex.xthisto ? ", " + ex.xthisto : "") +
    (st ? ", " + (/^[IV0]/.test(st) ? "stade " + st : st.toLowerCase()) : "") + (P.diagP ? " (" + P.diagP + ")" : "");
}
// Champs de la fiche tumeur pour les courriers et comptes rendus : { localisation, cote, histologie, stade, precision, oms }
export const tumeurDe = (P) => { const ex = (P && P.extra) || {}; return { localisation: (P && P.diag) || "", cote: ex.xtcote && ex.xtcote !== "Sans objet" ? ex.xtcote : "", histologie: ex.xthisto || "", stade: ex.xtstade || "", precision: (P && P.diagP) || "", oms: ex.xtoms || "" }; };
