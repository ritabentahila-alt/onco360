// Chimio HGC v2 – rendez-vous (consultations, hospitalisations) : types, libellés, durées (règles D1, E3, E4, E6).
import { addJ } from "./outils.js";
export const T_RTC = "En cours de RT";
// Consultation de fin de radiothérapie (12/10/2026, décision de Dr Bentahila) : créée d'office à la fin de la radiothérapie (réelle, sinon
// calculée), déplaçable librement (c'est une consultation : vue parfois avant ou après la fin) ; prix proposé 0 DH, modifiable à « Venu »
export const T_RTF = "Fin de radiothérapie";
export const dfr = (iso) => (iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4) : "");
export function typeRdv(t) { if (t === T_RTC || t === T_RTF) return "controle"; return t === "Annonce" ? "annonce" : t === "Contrôle" ? "controle" : t === "Hospitalisation" ? "hospit" : "suivi"; }
// Jours ouvrés d'une hospitalisation (lundi–vendredi, sans tenir compte des fériés – comme la v1)
export function joursH(r) { if (!r.d) return 0; const f = r.f && r.f >= r.d ? r.f : r.d; let d = r.d, n = 0; for (let g = 0; g < 400 && d <= f; g++) { const w = new Date(d + "T12:00:00").getDay(); if (w !== 0 && w !== 6) n++; d = addJ(d, 1); } return n; }
// prixRdv, tarH (« HGC » écrit en dur) : plus appelés, retirés le 19/10/2026 (R-C2, audit 4 C8) ; prix des rendez-vous : tarifs des Paramètres
// 3.13 (12/10/2026) : noms des types réglés dans Paramètres › Dossier patient › Types de consultation (moteur/typesconsult.js), par clé
// (annonce, suivi, controle, hospit, rtc, rtf, clé d'une activité ajoutée) ; posés au chargement par v2.js
let NOMS = null;
export const nommerTypes = (m) => { NOMS = m && typeof m === "object" ? m : null; };
export function libRdv(r) {
  if (NOMS && r) { const k = r.type === T_RTC ? "rtc" : r.type === T_RTF ? "rtf" : r.act || typeRdv(r.type), n = NOMS[k];
    if (n) return k === "hospit" && r.f ? n + " du " + dfr(r.d) + " au " + dfr(r.f) + " (" + joursH(r) + " j ouvré" + (joursH(r) > 1 ? "s" : "") + ")" : n; }
  if (r && r.type === T_RTC) return "Consultation en cours de radiothérapie";
  if (r && r.type === T_RTF) return "Consultation de fin de radiothérapie";
  if (r && r.act) return r.type || "Consultation"; // activité ajoutée dans les Paramètres (ex. 2nd avis)
  const t = typeRdv(r.type);
  return t === "hospit" ? "Hospitalisation" + (r.f ? " du " + dfr(r.d) + " au " + dfr(r.f) + " (" + joursH(r) + " j ouvré" + (joursH(r) > 1 ? "s" : "") + ")" : "") : t === "controle" ? "Consultation de contrôle" : "Consultation " + (r.type || "").toLowerCase();
}
// Ancien format « rdv » unique converti en liste
export function rdvMigre(P) { if (P.rdv && P.rdv.d) { P.rdvs = P.rdvs || []; P.rdvs.push({ id: "r" + Date.now(), type: P.rdv.t === "Prochaine consultation" ? "Suivi" : P.rdv.t || "Suivi", d: P.rdv.d, h: P.rdv.h || "", n: P.rdv.n || "", st: "prevu" }); delete P.rdv; } P.rdvs = P.rdvs || []; }
// Durée par type de consultation (AG2, 11/10/2026). Clé du type d'un rendez-vous (« s:Annonce », « a:2avis ») : la même que
// celle des types de la fenêtre du rendez-vous et des durées réglées dans Paramètres › Horaires (parametres/calendrier.durees)
export const cleRdv = (r) => (r && r.act ? "a:" + r.act : "s:" + ((r && r.type) || "Suivi"));
// Durée d'un rendez-vous (min) : la sienne (notée à l'enregistrement, `du`), sinon celle de son type, sinon celle du lieu
export const dureeRdv = (r, durees, duLieu) => (r && +r.du) || (durees || {})[cleRdv(r)] || duLieu || 30;
