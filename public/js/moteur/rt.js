// Chimio HGC v2 – radiothérapie : fin prévue, séances restantes, statut (règles C1–C4).
import { addJ, ouvre } from "./outils.js";
import { dfr } from "./rdv.js";
// Déroulé de la radiothérapie (09/10/2026) : scanner de centrage → contourage (r.cont = date) → dosimétrie (r.dosi = date)
// → 1re séance. Chaque validation par le médecin ouvre l'étape suivante (et sa tâche automatique, functions/logique.js).
// Contourage à valider : du scanner (inclus) à la 1re séance (incluse), tant qu'il n'est pas validé.
// Dosimétrie à valider : de la validation du contourage à la 1re séance, tant qu'elle n'est pas validée.
// Sans 1re séance prévue : jusqu'à aujourd'hui (la période se prolonge chaque jour). Rien pour un traitement clos, ni une
// fois la 1re séance passée. Renvoient { du, au } ou null.
const periodeRT = (du, r, t) => { const au = r.deb ? (r.deb > du ? r.deb : du) : (t > du ? t : du); return au < t ? null : { du, au }; };
export function contourage(r, t) {
  if (!r.scan || r.cont || r.dosi || r.fin) return null;
  return periodeRT(r.scan, r, t);
}
export function dosimetrie(r, t) {
  if (!r.scan || !r.cont || r.dosi || r.fin) return null;
  return periodeRT(r.cont, r, t);
}
export function nbA(r) { const n = parseInt(r.nbA, 10); return n > 0 ? n : 1; }
// C1/C2 – date de la Nième séance (jours ouvrés, rythme quotidien ou 1 jour sur 2)
export function finRTcalc(r, feries) {
  const nb = parseInt(r.nb, 10); if (!r.deb || !nb || nb < 1) return null;
  const pas = r.ryt === "2" ? 2 : 1; let d = r.deb, c = 0, w = 0;
  for (let g = 0; g < 800; g++) { if (ouvre(d, feries)) { if (w % pas === 0) { c++; if (c === nb) return d; } w++; } d = addJ(d, 1); }
  return null;
}
// C3 – fin saisie à la main prioritaire
export const finRT = (r, feries) => (r && r.finPrev ? r.finPrev : finRTcalc(r, feries));
// Séances restant à faire à partir d'aujourd'hui
export function joursOuvresRest(r, ctx) {
  const f = finRT(r, ctx.feries), t = ctx.aujourdhui; if (!f || f < t) return 0;
  const pas = r.ryt === "2" ? 2 : 1; let d = r.deb > t ? r.deb : t, n = 0, w = 0;
  if (pas === 2) { let d0 = r.deb; for (let g = 0; g < 800 && d0 <= f; g++) { if (ouvre(d0, ctx.feries)) { if (w % 2 === 0 && d0 >= t) n++; w++; } d0 = addJ(d0, 1); } return n; }
  for (let g2 = 0; g2 < 800 && d <= f; g2++) { if (ouvre(d, ctx.feries)) n++; d = addJ(d, 1); }
  return n;
}
// C4 – statut
export function statutRT(r, ctx) {
  const t = ctx.aujourdhui, f = finRT(r, ctx.feries);
  if (r.fin) return { c: "fin", lib: "Terminée le " + dfr(r.fin) };
  if (r.deb && r.deb <= t) return f && f < t ? { c: "dep", lib: "Fin prévue dépassée – à clôturer" } : { c: "cours", lib: "En cours" };
  return { c: "prev", lib: "Prévue" };
}

// C5 – consultations hebdomadaires « en cours de radiothérapie » (gratuites) : générées le jour choisi, du lendemain de la 1re séance
// à la fin prévue, hors fériés, à partir d'aujourd'hui ; jamais modifiées si passées, validées, non venues ou reportées.
// ctx.nouvelId(prefixe) fournit les identifiants. Renvoie true si le dossier a changé.
export const T_RTC_RDV = "En cours de RT";
const idRT = (r, ctx) => { if (!r.id) r.id = ctx.nouvelId("rt"); return r.id; };
const sigRtc = (r) => ["v2", r.cj || "", r.ch || "", r.deb || "", r.nb || "", r.ryt || "", r.finPrev || "", r.fin || "", r.annule ? 1 : 0].join("|");
function regenRtc(P, r, ctx) {
  const id = idRT(r, ctx), t = ctx.aujourdhui; P.rdvs = P.rdvs || [];
  P.rdvs = P.rdvs.filter((x) => x.rtc !== id || (x.st && x.st !== "prevu") || (x.rep && x.rep.length) || x.d < t);
  if (!r.cj || !r.deb) return; const fin = r.fin || finRT(r, ctx.feries); if (!fin) return;
  const deja = {}; P.rdvs.forEach((x) => { if (x.rtc === id) deja[x.dO || x.d] = 1; });
  const d1 = addJ(r.deb, 1); let d = d1 > t ? d1 : t;
  for (let g = 0; g < 400 && d <= fin; g++) {
    if (String(new Date(d + "T12:00:00").getDay()) === String(r.cj) && !(ctx.feries || []).some((f) => f.d === d) && !deja[d])
      P.rdvs.push({ id: ctx.nouvelId("r", g), type: T_RTC_RDV, d, dO: d, h: r.ch || "", n: "", st: "prevu", prix: 0, rtc: id });
    d = addJ(d, 1);
  }
}
export function genererConsultRT(P, ctx) {
  if (!P) return false; let ch = false; const ids = {};
  (P.rts || []).forEach((r) => { const s = sigRtc(r); ids[idRT(r, ctx)] = 1; if (r._sc !== s) { regenRtc(P, r, ctx); r._sc = s; ch = true; } });
  const t = ctx.aujourdhui, n0 = (P.rdvs || []).length;
  P.rdvs = (P.rdvs || []).filter((x) => !x.rtc || ids[x.rtc] || (x.st && x.st !== "prevu") || x.d < t);
  if (P.rdvs.length !== n0) ch = true; return ch;
}

// Compteur de séances réalisées (nouveauté v2) : séances prévues de la 1re séance jusqu'à aujourd'hui inclus,
// lundi–vendredi hors fériés, rythme quotidien ou 1 jour sur 2. Radiothérapie terminée = toutes les séances.
export function compteurRT(r, ctx) {
  const nb = parseInt(r.nb, 10); if (!r.deb || !nb) return null;
  if (r.fin) return { faites: nb, nb, pct: 100 };
  const t = ctx.aujourdhui; if (r.deb > t) return { faites: 0, nb, pct: 0 };
  const pas = r.ryt === "2" ? 2 : 1; let d = r.deb, c = 0, w = 0;
  for (let g = 0; g < 800 && d <= t && c < nb; g++) { if (ouvre(d, ctx.feries)) { if (w % pas === 0) c++; w++; } d = addJ(d, 1); }
  return { faites: c, nb, pct: Math.round((c * 100) / nb) };
}
