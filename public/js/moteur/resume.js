// Chimio HGC v2 – résumé d'un dossier : alimente l'accueil (liste, alertes, agenda 7 jours, statistiques) et Google Agenda. AUCUN montant.
// Regroupe en une seule fonction les 10 couches successives de la v1, dans le même ordre.
import { addJ, ecart } from "./outils.js";
import { etatLigne, protocoleDe, seancesCure } from "./doses.js";
import { rdvMigre } from "./rdv.js";
import { finRT, joursOuvresRest, dosimetrie } from "./rt.js";
import { evtsAgenda } from "./agenda.js";
import { associeVrai } from "./finances.js";

// B7 – statut d'une ligne
export function statutLigne(L, P, ctx) {
  const p = protocoleDe(L, ctx.bib), E = etatLigne(L, P, ctx);
  const pend = E.filter((e) => e.st === "prevue"), rec = E.filter((e) => e.st === "recue");
  const r = { E, pend, next: pend[0] || null, last: rec.length ? rec[rec.length - 1] : null, deb: E[0] && E[0].date, fin: null };
  if (L.arret) { r.code = "stop"; r.fin = L.arret.date; }
  else if (p.c && !pend.length) { r.code = "fin"; r.fin = r.last ? r.last.date : null; }
  else r.code = "cours";
  return r;
}
// B8 – ligne principale en cours (les lignes associées sont ignorées)
// 25/10/2026 : une ligne cochée « Traitement associé » par erreur sur une vraie chimiothérapie reste la ligne en cours (associeVrai)
export function ligneCourante(P, ctx) { const ls = P.lignes || []; for (let i = ls.length - 1; i >= 0; i--) { if (!associeVrai(ls[i], protocoleDe(ls[i], ctx.bib)) && statutLigne(ls[i], P, ctx).code === "cours") return i; } return null; }

export function resume(P, ctx) {
  const t = ctx.aujourdhui, feries = ctx.feries;
  // 1. base
  const r = { nm: P.nom, ddn: P.ddn, diag: P.diag || "", t: null, act: [], rec: [], rep: 0, pr: [] };
  (P.lignes || []).forEach((L, li) => { // li : n° de la ligne (T2, 24/10/2026 : « Cures à valider » ouvre la cure)
    const s = statutLigne(L, P, ctx), p = protocoleDe(L, ctx.bib); r.pr.push(p.nom);
    s.E.forEach((e) => { if (e.st === "recue") r.rec.push(e.date); r.rep += (e.c.rep || []).length; });
    if (s.code === "cours" && s.next) r.act.push({ nom: p.nom, k: s.next.n, nb: L.cures.length, d: s.next.date, c: p.c, li });
  });
  const i = ligneCourante(P, ctx);
  if (i != null) { const L = P.lignes[i], s = statutLigne(L, P, ctx), p = protocoleDe(L, ctx.bib); r.t = { nom: p.nom, st: "cours", k: s.next ? s.next.n : null, nb: L.cures.length, next: s.next ? s.next.date : null, last: s.last ? s.last.date : null, c: p.c, li: i }; }
  else if ((P.lignes || []).length) { const L2 = P.lignes[P.lignes.length - 1], s2 = statutLigne(L2, P, ctx); r.t = Object.assign({ nom: protocoleDe(L2, ctx.bib).nom, st: s2.code, fin: s2.fin }, s2.code === "cours" ? { k: s2.next ? s2.next.n : null, nb: L2.cures.length } : {}); }
  // 2. séances J8/J15 à faire des cures reçues
  (P.lignes || []).forEach((L, li) => {
    if (L.arret) return; const p = protocoleDe(L, ctx.bib);
    etatLigne(L, P, ctx).forEach((e) => {
      if (e.st !== "recue") return;
      seancesCure(L, e, ctx.bib).forEach((s) => { if (s.st === "recue" || s.st === "annulee") return; if (!s.suivi && (!e.c.reelle || ecart(t, e.c.reelle) > s.j + 14)) return; r.act.push({ nom: p.nom + " · J" + s.j, k: e.n, nb: L.cures.length, d: s.prevue, c: 0, sj: s.j, li }); });
    });
  });
  // 3. rendez-vous à venir
  rdvMigre(P);
  r.rdvs = P.rdvs.filter((x) => x.st !== "fait" && x.st !== "absent").map((x) => ({ type: x.type, d: x.d, h: x.h, f: x.f }));
  // 4. étapes de radiothérapie à venir
  r.rt = [];
  // rt / z / h (12/10/2026) : radiothérapie, étape (scan, deb, fin) et heure notée (scanner, 1re séance) : modifiables depuis le dossier
  (P.rts || []).forEach((x) => { if (x.fin) return; const f = finRT(x, feries); [[x.scan, "Scanner de centrage", "scan", x.scanH], [x.deb, "1re séance", "deb", x.debH], [f, "Fin de radiothérapie prévue", "fin", x.finH]].forEach((e) => { if (e[0] && e[0] >= t) r.rt.push({ d: e[0], lib: "RT · " + (x.acte || "Radiothérapie") + " · " + e[1], rt: x.id, z: e[2], h: (e[3] && e[3].h) || "" }); }); const dz = dosimetrie(x, t); if (dz) r.rt.push({ d: dz.du, f: dz.au, lib: "RT · " + (x.acte || "Radiothérapie") + " · Dosimétrie à valider", dosi: x.id, deb: x.deb || "" }); });
  r.rt.sort((a, z) => a.d.localeCompare(z.d));
  // 5. radiothérapies en cours (alertes)
  r.rtE = [];
  (P.rts || []).forEach((x) => { if (x.fin || !x.deb) return; r.rtE.push({ acte: x.acte || "Radiothérapie", deb: x.deb, fin: finRT(x, feries), rest: joursOuvresRest(x, ctx), nb: x.nb }); });
  // 6. référent, établissement, date de 1er contact (les honoraires ne sont plus dans le résumé : calculés au bilan, à partir des montants)
  r.cor = P.cor || ""; r.hop = P.hop || "";
  const ds = []; (P.rdvs || []).forEach((x) => { if (x.d) ds.push(x.d); }); (P.rts || []).forEach((x) => { if (x.deb) ds.push(x.deb); else if (x.cree) ds.push(x.cree); }); (r.rec || []).forEach((d) => { if (d) ds.push(d); }); (P.lignes || []).forEach((L) => { if (L.j1) ds.push(L.j1); });
  ds.sort(); r.c1 = ds[0] || "";
  // 7. Google Agenda
  try { r.ag = evtsAgenda(P, ctx); } catch (e) { r.ag = []; }
  // 8. limite de taille
  if (JSON.stringify(r).length > 40000) { const lim = addJ(t, 120); if (r.ag) r.ag = r.ag.filter((e) => e.d <= lim); if (r.rec && r.rec.length > 60) r.rec = r.rec.slice(-60); if (JSON.stringify(r).length > 40000 && r.pr) r.pr = r.pr.slice(-10); }
  // 9. précision du diagnostic
  if (P.diagP) r.diag = (P.diag || "") + " (" + P.diagP + ")";
  // 10. synthèse des radiothérapies
  r.rtS = (P.rts || []).map((x) => { const f = finRT(x, feries); return { a: x.acte || "Radiothérapie", st: x.fin ? "fin" : x.deb && x.deb <= t ? "cours" : "prev", deb: x.deb || "", fin: x.fin || f || "" }; });
  return r;
}
