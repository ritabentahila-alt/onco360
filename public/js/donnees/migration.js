// Chimio HGC v2 – mise au format des dossiers de la v1 (reprise de la fonction « migrer » de la v1) :
// très anciens dossiers (protocole au niveau du patient) → lignes ; copie figée du protocole dans chaque ligne ;
// consultations hebdomadaires de radiothérapie à jour.
import { genererConsultRT } from "../moteur/rt.js";
export function idsParDefaut() {
  return (prefixe, g) => prefixe === "r" ? "r" + Date.now().toString(36) + (g != null ? g : "") : prefixe === "rt" ? "rt" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) : prefixe + Date.now() + Math.floor(Math.random() * 1000);
}
const copieP = (p) => { const q = JSON.parse(JSON.stringify(p)); q.dr.forEach((d, i) => { d.id = d.id || "d" + i + "_" + Math.floor(Math.random() * 1e6); }); return q; };
export function migrerV1(p, ctx) {
  const bib = ctx.bib || {};
  if (!p.lignes) {
    p.lignes = [];
    if (p.protoId && bib[p.protoId]) {
      const cs = (p.cures || []).map((c) => ({ poids: c.poids, creat: c.creat, ov: c.ov, fixe: c.j1 }));
      p.lignes.push({ id: ctx.nouvelId("L"), protoId: p.protoId, j1: p.j1, poids: (p.cures && p.cures[0] && p.cures[0].poids) || "", cures: cs.length ? cs : [{}] });
    }
  }
  p.lignes.forEach((L) => {
    if (!L.pr && bib[L.protoId]) {
      L.pr = copieP(bib[L.protoId]);
      L.cures.forEach((c) => { if (c.ov) { const o = {}; Object.keys(c.ov).forEach((k) => { const d = L.pr.dr[+k]; if (d) o[d.id] = c.ov[k]; }); c.ov = o; } });
    }
  });
  try { genererConsultRT(p, ctx); } catch (e) {}
  delete p._rtcCh;
  return p;
}
