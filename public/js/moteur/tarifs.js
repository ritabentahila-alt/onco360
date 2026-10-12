// Chimio HGC v2 – tarifs : tableau « Activités et rémunérations » par établissement, avec historique daté.
// Net = brut × (1 − rétrocession %) × (1 − impôt %). Le tarif appliqué à un acte est celui en vigueur à la date de l'acte.
export const ACTIVITES = [
  ["annonce", "Consultation d'annonce"], ["suivi", "Consultation de suivi"], ["controle", "Consultation de contrôle"],
  ["cchimio", "Consultation de chimiothérapie"], ["seance", "Séance de chimiothérapie"], ["hospit", "Hospitalisation (par jour ouvré)"],
  ["rt", "Radiothérapie (tarif de l'acte)"],
];
// Valeur en vigueur à une date : la dernière entrée de l'historique dont la date de début est ≤ date
export function valeurAu(act, date) {
  const h = (act && act.historique) || []; let v = null;
  h.forEach((x) => { if (!date || x.depuis <= date) { if (!v || x.depuis >= v.depuis) v = x; } });
  return v || h[0] || null;
}
// Activité d'un établissement (repli sur le premier établissement qui la propose, comme la v1 qui se repliait sur HGC)
export function activite(table, etab, type) {
  const e = table.etablissements[etab]; const a = e && e.activites.find((x) => x.type === type);
  if (a) return a;
  const repli = table.repli && table.etablissements[table.repli]; return (repli && repli.activites.find((x) => x.type === type)) || null; // repli du cabinet seulement (1.7)
}
export function tarif(table, etab, type, date) { return valeurAu(activite(table, etab, type), date); }
export const net = (brut, v) => brut * (1 - (v ? v.retro : 0) / 100) * (1 - (v ? v.impot : 0) / 100);

// Construction du tableau à partir des tarifs v1 (configuration initiale validée le 04/10/2026)
export function tableDepuisV1(T, sansChimio) {
  const H = (brut, retro, impot) => ({ historique: [{ depuis: "2000-01-01", brut, retro, impot }] });
  const out = { repli: "HGC", etablissements: {}, actesRT: (T.rt || []).map((a) => ({ nom: a.nom, prix: a.prix })), vmat: T.vmat != null ? T.vmat : 10000 };
  for (const [code, h] of Object.entries(T.hop || {})) {
    const imp = T.impot != null ? T.impot : 10, sc = (sansChimio || []).indexOf(code) >= 0, acts = [];
    const add = (type, v) => { const lib = ACTIVITES.find((x) => x[0] === type)[1]; acts.push(Object.assign({ type, libelle: lib }, v)); };
    if (code === "HCK") { add("annonce", H(250, 0, imp)); add("suivi", H(250, 0, imp)); }   // 250 − 10 % = 225 (net identique à la v1)
    else { add("annonce", H(h.annonce, 0, 0)); add("suivi", H(h.suivi, 0, 0)); }
    add("controle", H(h.controle || 0, 0, 0));
    if (!sc) { add("cchimio", H(h.cchimio, 0, 0)); add("seance", H(h.seance, 0, imp)); add("hospit", H(h.hospit != null ? h.hospit : 400, 0, imp)); }
    add("rt", H(null, 100 - h.taux, imp));
    out.etablissements[code] = { activites: acts };
  }
  return out;
}
