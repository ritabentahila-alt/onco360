// Chimio HGC v2 – honoraires (règles E1–E8), calculés à partir du tableau des tarifs et des montants du dossier.
// Chaque acte : [date, type, établissement, libellé, brut, taux %, net, statut]
import { num } from "./outils.js";
import { etatLigne, protocoleDe, premed } from "./doses.js";
import { typeRdv, libRdv, joursH, T_RTC } from "./rdv.js";
import { tarif, net } from "./tarifs.js";
import { nbA, finRT } from "./rt.js";
const RE_OS = /zol[ée]dron|zometa|d[ée]nosumab|xgeva/i;
const RE_CAST = /zoladex|gos[ée]r[ée]line|d[ée]capeptyl|tript?or[ée]line|leupror[ée]line|eligard|[ée]nantone|d[ée]gar[ée]lix|firmagon|castration/i;
const RE_HO = /tamox|l[ée]trozole|anastrozole|ex[ée]m[ée]stane|aromasine|femara|arimidex|abirat[ée]rone|zytiga|enzalutamide|xtandi|apalutamide|erleada|darolutamide|nubeqa|bicalutamide|casodex|m[ée]gestrol|m[ée]droxyprog|farlutal|prednis/i;
// Une ligne donne-t-elle lieu à des honoraires de séance ? (pas l'hormonothérapie ni la castration seules ; oui pour l'acide zolédronique / dénosumab)
export function ligneHon(L, p) {
  const txt = (p.nom || "") + " " + (p.dr || []).map((d) => d.p).join(" ");
  if (RE_OS.test(txt)) return true; if (L.assoc) return false;
  const ac = (p.dr || []).filter((d) => !premed(d) && d.u !== "txt");
  if (ac.length && ac.every((d) => RE_CAST.test(d.p) || /per os/i.test(d.v || "") || (RE_HO.test(d.p) && !d.v))) return false;
  return true;
}
const r2 = (x) => Math.round(x * 100) / 100;
// Honoraires d'un dossier : P = dossier médical (sans montants) ; M = montants du dossier (patientsFinances) ; ctx.table = tarifs.
// Montants enregistrés par la v1 (« v1: true ») : repris tels quels, avec la règle v1 (consultations au montant saisi, hospitalisation − impôt).
export function evtsFin(P, M, ctx) {
  const tab = ctx.table, mt = M || {}, ev = [], hopP = P.hop || "";
  const tf = (etab, type, date) => tarif(tab, etab, type, date);
  const cm = (L, n) => (mt.cures && mt.cures[L.id] && mt.cures[L.id][n]) || {};
  (P.lignes || []).forEach((L) => {
    const p = protocoleDe(L, ctx.bib); if (!ligneHon(L, p)) return;
    etatLigne(L, P, ctx).forEach((e) => {
      if (e.st !== "recue") return; const c = e.c, x = cm(L, e.n), lib = p.nom + " · C" + e.n;
      const vS = (d) => tf(hopP, "seance", d), hon = x.hon || {};
      const m1 = hon[1] && hon[1].m != null ? hon[1].m : (vS(c.reelle) || {}).brut;
      ev.push([c.reelle, "seance", hopP, "Séance chimio J1 – " + lib, m1, 100, r2(net(num(m1) || 0, vS(c.reelle))), "Validée"]);
      if (c.sea) Object.keys(c.sea).forEach((j) => { const s = c.sea[j]; if (s.st === "recue") { const m = hon[j] && hon[j].m != null ? hon[j].m : (vS(s.d) || {}).brut; ev.push([s.d, "seance", hopP, "Séance chimio J" + j + " – " + lib, m, 100, r2(net(num(m) || 0, vS(s.d))), "Validée"]); } });
      if (x.cons && x.cons.enc) { const vC = tf(hopP, "cchimio", c.reelle), mc = x.cons.m != null ? x.cons.m : (vC || {}).brut, mj = Object.values(x.consModeJ || {}); ev.push([c.reelle, "cchimio", hopP, "Consultation chimio – " + lib, mc, 100, r2(net(num(mc) || 0, vC)), "Encaissée"].concat(mj.length ? [mj.indexOf("np") >= 0 ? "np" : mj[0]] : [])); }
    });
  });
  (P.rdvs || []).forEach((r) => {
    if (r.st !== "fait") return; const t = r.act || typeRdv(r.type), d = r.dv || r.d, x = (mt.rdv || {})[r.id] || {}, hs = t === "hospit";
    let brut, nt;
    if (x.v1) { brut = x.prix; const vH = tf(hopP, "hospit", d); nt = hs ? r2((num(brut) || 0) * (1 - ((vH && vH.impot) != null ? vH.impot : 10) / 100)) : brut; }
    else {
      const v = r.type === T_RTC ? { brut: 0, retro: 0, impot: 0 } : tf(hopP, t, d) || { brut: 0, retro: 0, impot: 0 };
      brut = x.brut != null ? x.brut : hs ? joursH(r) * (x.tj != null ? x.tj : v.brut) : v.brut;
      nt = r2(net(num(brut) || 0, v));
    }
    ev.push([d, t, hopP, libRdv(r), brut, 100, nt, hs ? "Réalisée" : "Venu"].concat(x.mode ? [x.mode] : [])); // 9e : mode de paiement (19.5)
  });
  (P.rts || []).forEach((r) => {
    const h = r.hop || hopP, x = (mt.rt || {})[r.id] || {}, dRef = r.fin || finRT(r, ctx.feries) || r.deb || "", v = tf(h, "rt", dRef) || { retro: 60, impot: 10 };
    const prix = x.prix != null ? x.prix : ((tab.actesRT || []).find((a) => a.nom === r.acte) || {}).prix;
    const brut = (num(prix) || 0) * nbA(r) + (r.vmat ? num(x.vmatPrix != null ? x.vmatPrix : tab.vmat) || 0 : 0);
    const fx = x.netFixe != null && r.fin, nt = fx ? x.netFixe : Math.round(brut * (100 - v.retro) / 100 * (1 - v.impot / 100));
    const lib = "RT " + (r.acte || "") + (nbA(r) > 1 ? " × " + nbA(r) : "") + (r.vmat ? " + VMAT" : "");
    if (r.fin) ev.push([r.fin, "rt", h, lib, brut, fx ? null : 100 - v.retro, nt, "Terminée"]);
    else if (r.deb || r.nb) ev.push([finRT(r, ctx.feries) || r.deb || "", "rtprev", h, lib, brut, 100 - v.retro, nt, "En cours / prévue"]);
  });
  return ev;
}
