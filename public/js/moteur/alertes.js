// Onco360 – alertes cliniques vues (R-B2, 19/10/2026, demande du cabinet du 17/10) : calcul pur (test : tests/moteur/test-alertes.mjs).
// Une alerte du tableau de bord (perte de poids, fonction rénale, bilan) validée « Vu » par un médecin ne revient pas ; une nouvelle valeur,
// une nouvelle cure ou un nouveau bilan font une nouvelle alerte. Rangées par médecin : utilisateurs/{uid}.alertesVues { clé: date }, entrées de
// plus de 90 jours effacées.
import { addJ } from "./outils.js";
// Clé courte (sans point ni barre, pour un nom de champ) d'après le patient, la ligne, la cure, le type et la valeur
export function cleAlerte(o) {
  const s = [o.pid, o.lid, o.n, o.type, o.v].join("|"); let h = 5381, g = 52711;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h = ((h * 33) ^ c) >>> 0; g = ((g * 31) + c) >>> 0; }
  return "a" + h.toString(36) + g.toString(36);
}
export const JOURS_VUES = 90;
export function vuesNettoyees(vues, jour, jours) {
  const lim = addJ(jour, -(jours || JOURS_VUES)), o = {};
  Object.entries(vues && typeof vues === "object" ? vues : {}).forEach(([k, d]) => { if (/^a[a-z0-9]+$/.test(k) && typeof d === "string" && d >= lim) o[k] = d; });
  return o;
}
// Alertes à voir et alertes déjà vues (encore d'actualité)
export const partagerAlertes = (l, vues) => ({ aVoir: (l || []).filter((a) => !(vues || {})[a.cle]), vues: (l || []).filter((a) => (vues || {})[a.cle]) });
