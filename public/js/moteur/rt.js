// Chimio HGC v2 – radiothérapie : fin prévue, séances restantes, statut (règles C1–C4).
import { addJ, ouvre } from "./outils.js";
import { dfr } from "./rdv.js";
// Déroulé de la radiothérapie (09/10/2026) : scanner de centrage → contourage (r.cont = date) → dosimétrie (r.dosi = date)
// → 1re séance. Chaque validation par le médecin ouvre l'étape suivante (et sa tâche automatique, functions/logique.js).
// Contourage à valider : du scanner (inclus) à la 1re séance (incluse), tant qu'il n'est pas validé.
// Dosimétrie à valider : de la validation du contourage à la 1re séance, tant qu'elle n'est pas validée.
// Sans 1re séance prévue : jusqu'à aujourd'hui (la période se prolonge chaque jour). Rien pour un traitement clos. 2.5 (12/10/2026,
// audit) : une fois la 1re séance passée sans validation, l'étape reste à valider, « en retard » (radiothérapie commencée sans
// contourage ou dosimétrie validés) au lieu de disparaître. Renvoient { du, au, retard } ou null.
const periodeRT = (du, r, t) => { const au = r.deb ? (r.deb > du ? r.deb : du) : (t > du ? t : du); return au < t ? { du, au, retard: true } : { du, au }; };
export function contourage(r, t) {
  if (!r.scan || r.cont || r.dosi || r.fin) return null;
  return periodeRT(r.scan, r, t);
}
export function dosimetrie(r, t) {
  if (!r.scan || !r.cont || r.dosi || r.fin) return null;
  return periodeRT(r.cont, r, t);
}
export function nbA(r) { const n = parseInt(r.nbA, 10); return n > 0 ? n : 1; }
// 3.5 (12/10/2026) – rythmes : quotidien (1), un jour ouvré sur deux (2), deux séances par jour (bid), une par semaine (hebdo : le jour
// de la semaine de la 1re séance, ou le jour ouvré suivant s'il est férié), jours choisis (jours : r.jours = [1…5], lundi = 1).
// Même calcul côté serveur (functions/logique.js joursSeances) : test de cohérence tests/moteur/test-rt.mjs.
export const RYTHMES = [["1", "Quotidien (lundi–vendredi)"], ["2", "1 jour sur 2"], ["bid", "2 séances par jour"], ["hebdo", "1 par semaine"], ["jours", "Jours choisis"]];
export const libRythme = (r) => (r.ryt === "jours" ? "les " + (r.jours || []).map((k) => ["", "lundis", "mardis", "mercredis", "jeudis", "vendredis"][k]).filter(Boolean).join(", ") : ((RYTHMES.find((x) => x[0] === (r.ryt || "1")) || [])[1] || "").toLowerCase());
const jourSem = (d) => new Date(d + "T12:00:00").getDay();
// Jours de séance (avec le nombre de fractions ce jour-là), de la 1re séance jusqu'à `max` fractions, ou jusqu'à la date `jusqua`
export function joursSeances(r, feries, o) {
  const opt = o || {}, max = opt.jusqua ? Infinity : parseInt(r.nb, 10), out = []; if (!r.deb || !(max > 0)) return out;
  const ryt = r.ryt || "1", jours = (r.jours || []).map(Number), w0 = jourSem(r.deb); let d = r.deb, w = 0, c = 0, sem = -1;
  for (let g = 0; g < 2000 && c < max; g++) {
    if (opt.jusqua && d > opt.jusqua) break;
    if (ouvre(d, feries)) {
      let n = 0;
      if (ryt === "2") n = w % 2 === 0 ? 1 : 0;
      else if (ryt === "bid") n = Math.min(2, max - c);
      else if (ryt === "hebdo") { const k = Math.floor((Date.parse(d) - Date.parse(r.deb)) / 864e5 / 7), dec = (jourSem(d) - w0 + 7) % 7; if (k !== sem && (dec === 0 || k > sem)) { n = 1; sem = k; } }
      else if (ryt === "jours") n = jours.indexOf(jourSem(d)) >= 0 ? 1 : 0;
      else n = 1;
      if (n) { out.push({ d, n }); c += n; }
      w++;
    }
    d = addJ(d, 1);
  }
  return out;
}
// C1/C2 – date de la dernière séance (Nième fraction)
export function finRTcalc(r, feries) { const l = joursSeances(r, feries); return l.length && l.reduce((t, z) => t + z.n, 0) >= parseInt(r.nb, 10) ? l[l.length - 1].d : null; }
// C3 – fin saisie à la main prioritaire
export const finRT = (r, feries) => (r && r.finPrev ? r.finPrev : finRTcalc(r, feries));
// Jours de séance restant à partir d'aujourd'hui
export function joursOuvresRest(r, ctx) {
  const f = finRT(r, ctx.feries), t = ctx.aujourdhui; if (!f || f < t) return 0;
  if (r.finPrev && r.finPrev !== finRTcalc(r, ctx.feries)) { let n = 0, d = r.deb > t ? r.deb : t; for (let g = 0; g < 800 && d <= f; g++) { if (ouvre(d, ctx.feries)) n++; d = addJ(d, 1); } return n; }
  return joursSeances(r, ctx.feries).filter((z) => z.d >= t).length;
}
// 3.5 – volumes : [{ nom, dose, nb, ty: "p" (principal) | "seq" (complément séquentiel, à la suite) | "int" (intégré, mêmes séances) }].
// Radiothérapie d'avant (dose, nb) = un seul volume, rien à ressaisir. Séances = principal + compléments séquentiels.
const num = (v) => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isNaN(n) ? null : n; };
export function volumesRT(r) {
  if (Array.isArray(r.vol) && r.vol.length) return r.vol.map((v, i) => Object.assign({}, v, { ty: i === 0 ? "p" : v.ty === "int" ? "int" : "seq" }));
  return r.dose || r.nb ? [{ nom: r.loc || "", dose: r.dose || "", nb: r.nb || "", ty: "p" }] : [];
}
export const seancesVolumes = (vol) => (vol || []).reduce((t, v, i) => t + (i === 0 || v.ty === "seq" ? parseInt(v.nb, 10) || 0 : 0), 0);
export const dpfVolume = (v, vol) => { const d = num(v.dose), n = v.ty === "int" ? parseInt((vol[0] || {}).nb, 10) : parseInt(v.nb, 10); return d && n ? Math.round((d / n) * 100) / 100 : null; };
// Texte d'un volume : « Sein gauche : 50 Gy en 25 fractions (2 Gy par fraction) » ; complément : « Complément séquentiel – lit : … »
const gy = (n) => String(Math.round(n * 100) / 100).replace(".", ",");
export function texteVolume(v, vol) {
  const d = num(v.dose), n = v.ty === "int" ? parseInt((vol[0] || {}).nb, 10) : parseInt(v.nb, 10), f = dpfVolume(v, vol);
  const tete = (v.ty === "seq" ? "Complément séquentiel" : v.ty === "int" ? "Complément intégré" : "") + (v.nom ? (v.ty === "p" ? "" : " – ") + v.nom : "");
  return (tete ? tete + " : " : "") + [d ? gy(d) + " Gy" : "", n ? "en " + n + " fraction" + (n > 1 ? "s" : "") : "", f ? "(" + gy(f) + " Gy par fraction)" : ""].filter(Boolean).join(" ");
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
const sigRtc = (r) => ["v2", r.cj || "", r.ch || "", r.deb || "", r.nb || "", r.ryt || "", r.finPrev || "", r.fin || "", r.annule ? 1 : 0].join("|") + (r.ryt === "jours" ? "|" + (r.jours || []).join(",") : ""); // jours choisis (3.5) : seulement pour ce rythme (signature des autres inchangée)
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
  const c = Math.min(nb, joursSeances(r, ctx.feries).filter((z) => z.d <= t).reduce((s0, z) => s0 + z.n, 0));
  return { faites: c, nb, pct: Math.round((c * 100) / nb) };
}
