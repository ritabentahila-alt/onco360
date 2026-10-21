// Heure du Maroc (S1, 21/10/2026, audit n° 10 d. 2). Onco360 ne demande plus l'heure du Maroc à l'ordinateur ni à Node : leurs données
// horaires peuvent être en retard (Chromium 141 et Node 22 donnaient encore GMT+1 après le retour à GMT du 20/09/2026, décret n° 2.26.530).
// Heure du Maroc = heure universelle + décalage lu dans la table des changements d'heure ci-dessous (heure universelle de chaque
// changement, décalage en minutes à partir de cet instant ; avant le premier : GMT). Table tirée des données horaires 2026c (IANA) ;
// un changement décidé plus tard par le gouvernement (Ramadan, heure d'été) s'ajoute sans programmer : Administration › Plateforme ›
// Heure du Maroc (plateforme/heureMaroc, lu au démarrage par changerTable). Même code côté serveur : functions/heure.js (test-heure).
// Aucune dépendance au navigateur : testable seul.
export const CHANGEMENTS0 = [
  ["2018-03-25T02:00Z", 60], ["2018-05-13T02:00Z", 0], ["2018-06-17T02:00Z", 60], ["2019-05-05T02:00Z", 0], ["2019-06-09T02:00Z", 60],
  ["2020-04-19T02:00Z", 0], ["2020-05-31T02:00Z", 60], ["2021-04-11T02:00Z", 0], ["2021-05-16T02:00Z", 60], ["2022-03-27T02:00Z", 0],
  ["2022-05-08T02:00Z", 60], ["2023-03-19T02:00Z", 0], ["2023-04-23T02:00Z", 60], ["2024-03-10T02:00Z", 0], ["2024-04-14T02:00Z", 60],
  ["2025-02-23T02:00Z", 0], ["2025-04-06T02:00Z", 60], ["2026-02-15T02:00Z", 0], ["2026-03-22T02:00Z", 60], ["2026-09-20T01:00Z", 0],
].map(([du, dec]) => ({ du, dec }));
let TABLE = tableTriee(CHANGEMENTS0);
// Changement valable : instant ISO lisible et décalage entre −12 h et +14 h, en minutes entières
export function changementValide(c) { return !!c && typeof c.du === "string" && !isNaN(Date.parse(c.du)) && Number.isInteger(c.dec) && c.dec >= -720 && c.dec <= 840; }
function tableTriee(l) { return l.map((c) => ({ t: Date.parse(c.du), du: c.du, dec: c.dec })).sort((a, b) => a.t - b.t); }
// Table du code + changements ajoutés par l'Administration (même instant : celui de l'Administration l'emporte) ; liste vide ou abîmée :
// la table du code seule
export function tableAvec(ajouts) {
  const m = new Map(CHANGEMENTS0.map((c) => [Date.parse(c.du), c]));
  (Array.isArray(ajouts) ? ajouts : []).filter(changementValide).forEach((c) => m.set(Date.parse(c.du), { du: c.du, dec: c.dec }));
  return tableTriee([...m.values()]);
}
export function changerTable(ajouts) { TABLE = tableAvec(ajouts); return TABLE.length; }
// Décalage (minutes) de l'heure du Maroc sur l'heure universelle à l'instant ms
export function decalage(ms, table) {
  let d = 0;
  for (const c of table || TABLE) { if (c.t <= ms) d = c.dec; else break; }
  return d;
}
const z = (n) => String(n).padStart(2, "0");
// Parties de l'heure du Maroc : { a, mo, j, h, mi, s, js (0 = dimanche) }
export function partiesMaroc(ms, table) {
  const x = new Date(ms + decalage(ms, table) * 60000);
  return { a: x.getUTCFullYear(), mo: x.getUTCMonth() + 1, j: x.getUTCDate(), h: x.getUTCHours(), mi: x.getUTCMinutes(), s: x.getUTCSeconds(), js: x.getUTCDay() };
}
export function jourMaroc(ms, table) { const p = partiesMaroc(ms, table); return p.a + "-" + z(p.mo) + "-" + z(p.j); }
export function hmMaroc(ms, table) { const p = partiesMaroc(ms, table); return z(p.h) + ":" + z(p.mi); }
export function minutesMaroc(ms, table) { const p = partiesMaroc(ms, table); return p.h * 60 + p.mi; }
// « 21/10/2026 14:05 » (journaux, exports)
export function dateHeureMaroc(ms, table) { const p = partiesMaroc(ms, table); return z(p.j) + "/" + z(p.mo) + "/" + p.a + " " + z(p.h) + ":" + z(p.mi); }
// Instant universel (ms) d'une heure du Maroc « AAAA-MM-JJ », « HH:MM » (écran de l'Administration : « à partir du … à … »)
export function instantMaroc(d, h, table) {
  const u = Date.parse(d + "T" + (h || "00:00") + ":00Z");
  if (isNaN(u)) return NaN;
  const t1 = u - decalage(u, table) * 60000;
  return u - decalage(t1, table) * 60000;
}
