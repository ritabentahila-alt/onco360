// Chimio HGC v2 – événements Google Agenda d'un dossier (règle D3). Les clés « k » sont identiques à la v1 (pas de doublon à la bascule).
import { etatLigne, protocoleDe, protocoleCure, seancesDe, seancesCure } from "./doses.js";
import { typeRdv, libRdv } from "./rdv.js";
import { finRT } from "./rt.js";
export function evtsAgenda(P, ctx) {
  const t = ctx.aujourdhui, out = [], nm = P.nom || (P.nomF || "").toUpperCase() + " " + (P.prenom || ""), pid = P.id, hop = P.hop ? " (" + P.hop + ")" : "";
  (P.rdvs || []).forEach((r) => {
    if ((r.st || "prevu") !== "prevu" || !r.d) return; const hs = typeRdv(r.type) === "hospit"; if ((hs && r.f ? r.f : r.d) < t) return;
    out.push({ k: pid + "|r|" + (r.id || r.d), t: (hs ? "" : "🩺 ") + nm + " – " + (hs ? "Hospitalisation" : libRdv(r)) + hop, x: [P.diag, P.tel ? "Tél. " + P.tel : "", r.n].filter(Boolean).join("\n"), d: r.d, h: hs ? "" : r.h || "", f: hs ? r.f || "" : "" });
  });
  (P.lignes || []).forEach((L, i) => {
    if (L.arret) return; const p = protocoleDe(L, ctx.bib);
    etatLigne(L, P, ctx).forEach((e) => {
      const multi = seancesDe(protocoleCure(L, e.n - 1, ctx.bib)).length > 1;
      if (e.st === "prevue" && e.date && e.date >= t) out.push({ k: pid + "|c|" + i + "|" + e.n, t: "💉 " + nm + " – C" + e.n + "/" + L.cures.length + (multi ? " J1" : "") + " · " + p.nom + hop, x: P.diag || "", d: e.date });
      if (e.st !== "annulee" && e.date) seancesCure(L, e, ctx.bib).forEach((s) => { if (s.st === "prevue" && s.prevue && s.prevue >= t) out.push({ k: pid + "|s|" + i + "|" + e.n + "|" + s.j, t: "💉 " + nm + " – C" + e.n + " J" + s.j + " · " + p.nom + hop, x: P.diag || "", d: s.prevue }); });
    });
  });
  (P.rts || []).forEach((r, j) => {
    if (r.fin) return; const f = finRT(r, ctx.feries), id = r.id || j, a = r.acte || "Radiothérapie", hr = r.hop ? " (" + r.hop + ")" : hop;
    [[r.scan, "scan", "Scanner de centrage"], [r.deb, "deb", "1re séance de radiothérapie"], [f, "fin", "Fin de radiothérapie prévue"]].forEach((z) => { if (z[0] && z[0] >= t) out.push({ k: pid + "|rt|" + id + "|" + z[1], t: "☢️ " + nm + " – " + z[2] + " · " + a + hr, x: P.diag || "", d: z[0] }); });
    // Dosimétrie à valider : plus un événement d'agenda depuis le 08/10/2026 (c'est une tâche pour le médecin, P4)
  });
  return out;
}

// D2 – rendez-vous de chimiothérapie à venir dans le dossier : TOUTES les séances prévues (J1, J8, J15…) de toutes les cures,
// de la prochaine jusqu'à la dernière (07/10/2026 ; avant : seulement la cure en cours). Les dates suivent le protocole
// (reports, dates modifiées). Une cure prévue dans le passé et non validée est signalée « en retard ».
export function chimioAVenir(P, ctx) {
  const t = ctx.aujourdhui, out = [];
  (P.lignes || []).forEach((L) => {
    if (L.arret) return; const p = protocoleDe(L, ctx.bib), E = etatLigne(L, P, ctx);
    E.forEach((e) => {
      if (e.st === "annulee" || !e.date) return;
      const multi = seancesDe(protocoleCure(L, e.n - 1, ctx.bib)).length > 1, lib = "Chimio · " + p.nom + " · C" + e.n;
      if (e.st === "prevue") out.push({ d: e.date, lib: lib + (multi ? " J1" : "") + (e.date < t ? " (en retard)" : ""), lid: L.id, n: e.n, j: 1 });
      seancesCure(L, e, ctx.bib).forEach((s) => { if (s.st === "prevue" && s.prevue && s.prevue >= t) out.push({ d: s.prevue, lib: lib + " J" + s.j, lid: L.id, n: e.n, j: s.j }); });
    });
  });
  return out;
}
