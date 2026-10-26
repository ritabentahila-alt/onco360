// Chimio HGC v2 – honoraires (règles E1–E8), calculés à partir du tableau des tarifs et des montants du dossier.
// Chaque acte : [date, type, établissement, libellé, brut, taux %, net, statut, mode de paiement (19.5) ou null, identifiant de l'acte,
// sans tarif (1 : aucun tarif pour ce lieu et cette activité ni montant saisi → compté 0 DH ; 0 sinon) (15 bis B2)]
// Identifiant (15 bis, 10/10/2026) : « s|ligne|cure|jour » (séance), « cc|ligne|cure » (consultation de chimio), « r|rendez-vous »,
// « rt|radiothérapie » : sert à retrouver la case « Payé » même si la date ou le libellé de l'acte changent.
// R-D1 (20/10/2026, audit n° 6, C1) : consultation de chimio comptée **jour par jour** (un acte par jour payé, à sa date, avec son mode ;
// avant : un seul acte daté du J1 avec le total de la cure). Le premier jour payé de la cure (le J1 presque toujours) garde l'identifiant
// « cc|ligne|cure » (case « Payé » déjà cochée reprise) ; les jours suivants : « cc|ligne|cure|jour ».
import { num } from "./outils.js";
import { etatLigne, protocoleDe, premed, seancesCure } from "./doses.js";
import { typeRdv, libRdv, joursH, T_RTC } from "./rdv.js";
import { tarif, net } from "./tarifs.js";
import { nbA, finRT } from "./rt.js";
const RE_OS = /zol[ée]dron|zometa|d[ée]nosumab|xgeva/i;
const RE_CAST = /zoladex|gos[ée]r[ée]line|d[ée]capeptyl|tript?or[ée]line|leupror[ée]line|eligard|[ée]nantone|d[ée]gar[ée]lix|firmagon|castration/i;
const RE_HO = /tamox|l[ée]trozole|anastrozole|ex[ée]m[ée]stane|aromasine|femara|arimidex|abirat[ée]rone|zytiga|enzalutamide|xtandi|apalutamide|erleada|darolutamide|nubeqa|bicalutamide|casodex|m[ée]gestrol|m[ée]droxyprog|farlutal|prednis/i;
// Traitement sans vraie chimiothérapie (castration, hormonothérapie, comprimés seuls ; prémédication et texte exclus)
const horsChimioDe = (p) => { const ac = (p.dr || []).filter((d) => !premed(d) && d.u !== "txt"); return { ac, hors: ac.every((d) => RE_CAST.test(d.p) || /per os/i.test(d.v || "") || (RE_HO.test(d.p) && !d.v)) }; };
// « Traitement associé » qui compte comme tel (24-25/10/2026) : la case de la ligne, seulement pour un traitement sans vraie chimiothérapie.
// Cochée sur une vraie chimiothérapie (reprise de l'ancienne application, ex. « Paclitaxel + Carboplatine hebdomadaire – fractionné »), elle
// est ignorée partout : bilan, ligne en cours du dossier (bandeau), nom de la ligne. Les lignes déjà prescrites gardent leur case.
export function associeVrai(L, p) { if (!L || !L.assoc) return false; const h = horsChimioDe(p || {}); return !h.ac.length || h.hors; }
// Une ligne donne-t-elle lieu à des honoraires de séance ? Oui pour la chimiothérapie et pour l'acide zolédronique / le dénosumab (Zometa, Xgeva :
// faits en hôpital de jour, séance au tarif des Paramètres) ; non pour l'hormonothérapie, la castration (Zoladex, Décapeptyl, Firmagon), les comprimés,
// et les traitements de support seuls (Nivestim, fer, EPO : sur ordonnance) — 26/10/2026, demande de Dr Bentahila
const RE_SUPPORT = /\bfer\b|ferinject|carboxymaltose|venofer|monofer|saccharate ferrique|ferrique/i;
export function ligneHon(L, p) {
  const txt = (p.nom || "") + " " + (p.dr || []).map((d) => d.p).join(" ");
  if (RE_OS.test(txt)) return true;
  const h = horsChimioDe(p);
  if (!h.ac.length || h.ac.every((d) => RE_SUPPORT.test(d.p))) return false;
  if (associeVrai(L, p)) return false;
  if (h.ac.length && h.hors) return false;
  return true;
}
const r2 = (x) => Math.round(x * 100) / 100;
// Consultations de chimio d'une cure, jour par jour : { "1": 250, "8": 0 } (montants du dossier, M.cures[ligne][cure]) ; une seule source,
// reprise par chimio.js (même code que consJours de functions/logique.js). Ancien fonctionnement (case « Consultation encaissée »,
// cons.enc) = une validation au jour cons.jour (J1 par défaut), montant null = tarif du jour.
export function consJours(c) {
  if (!c) return {};
  if (c.consJ) return c.consJ;
  if (c.cons && c.cons.enc) { const j = c.cons.jour && c.cons.jour !== "autre" ? String(c.cons.jour) : "1"; return { [j]: c.cons.m == null ? null : num(c.cons.m) }; }
  return {};
}
// Honoraires d'un dossier : P = dossier médical (sans montants) ; M = montants du dossier (patientsFinances) ; ctx.table = tarifs.
// Montants enregistrés par la v1 (« v1: true ») : repris tels quels, avec la règle v1 (consultations au montant saisi, hospitalisation − impôt).
// Hôpital d'un acte à sa date (15 bis, 10/10/2026) : P.hopHist = [{ hop, avant }] noté à chaque changement d'hôpital du dossier
// (hop = l'ancien hôpital, avant = date du changement) ; un acte daté avant le changement reste à l'ancien hôpital.
// Taux commun de la radiothérapie (Paramètres › Activités et rémunérations, finances/tarifs.tauxRT = { retro, impot }), pour un lieu
// sans ligne « Radiothérapie » ; null s'il n'est pas réglé (les deux vides), une case vide seule = 0 % (R-D3, C5)
export function tauxRT(tab) {
  const t = tab && tab.tauxRT; if (!t || (num(t.retro) == null && num(t.impot) == null)) return null;
  return { retro: num(t.retro) || 0, impot: num(t.impot) || 0 };
}
export function hopAu(P, d) {
  const h = (P.hopHist || []).filter((x) => x && x.avant).sort((a, b) => String(a.avant).localeCompare(String(b.avant))).find((x) => d && d < x.avant);
  return h ? h.hop || "" : P.hop || "";
}
export function evtsFin(P, M, ctx) {
  const tab = ctx.table, mt = M || {}, ev = [], hopA = (d) => hopAu(P, d);
  const tf = (etab, type, date) => tarif(tab, etab, type, date);
  const cm = (L, n) => (mt.cures && mt.cures[L.id] && mt.cures[L.id][n]) || {};
  (P.lignes || []).forEach((L) => {
    const p = protocoleDe(L, ctx.bib); if (!ligneHon(L, p)) return;
    etatLigne(L, P, ctx).forEach((e) => {
      if (e.st !== "recue") return; const c = e.c, x = cm(L, e.n), lib = p.nom + " · C" + e.n;
      const vS = (d) => tf(hopA(d), "seance", d), hon = x.hon || {}, cle = L.id + "|" + e.n;
      const m1 = hon[1] && hon[1].m != null ? hon[1].m : (vS(c.reelle) || {}).brut;
      const sansT = (j, d) => (hon[j] && hon[j].m != null) || vS(d) ? 0 : 1;
      ev.push([c.reelle, "seance", hopA(c.reelle), "Séance chimio J1 – " + lib, m1, 100, r2(net(num(m1) || 0, vS(c.reelle))), "Validée", null, "s|" + cle + "|1", sansT(1, c.reelle)]);
      if (c.sea) Object.keys(c.sea).forEach((j) => { const s = c.sea[j]; if (s.st === "recue") { const m = hon[j] && hon[j].m != null ? hon[j].m : (vS(s.d) || {}).brut; ev.push([s.d, "seance", hopA(s.d), "Séance chimio J" + j + " – " + lib, m, 100, r2(net(num(m) || 0, vS(s.d))), "Validée", null, "s|" + cle + "|" + j, sansT(j, s.d)]); } });
      // R-D1 : une consultation par jour payé (0 DH = rien à compter), à sa date (J8, J15… : date de la séance, sinon date prévue), avec son mode
      const J = consJours(x), jours = Object.keys(J).sort((a, b) => a - b); let sea = null, prem = true;
      jours.forEach((j) => {
        const m0 = J[j]; if (m0 != null && !(num(m0) > 0)) return;
        if (j !== "1" && !sea) sea = seancesCure(L, e, ctx.bib);
        const z = j === "1" ? null : sea.find((s) => s.j === +j) || {};
        const d = !x.consJ && x.cons && x.cons.jour === "autre" && x.cons.date ? x.cons.date : j === "1" ? c.reelle : z.d || z.prevue || c.reelle;
        const hC = hopA(d), vC = tf(hC, "cchimio", d), mc = m0 != null ? m0 : (vC || {}).brut;
        ev.push([d, "cchimio", hC, "Consultation chimio" + (j === "1" ? "" : " J" + j) + " – " + lib, mc, 100, r2(net(num(mc) || 0, vC)), "Encaissée", (x.consModeJ || {})[j] || null, "cc|" + cle + (prem ? "" : "|" + j), m0 != null || vC ? 0 : 1]);
        prem = false;
      });
    });
  });
  (P.rdvs || []).forEach((r) => {
    if (r.st !== "fait") return; const t = r.act || typeRdv(r.type), d = r.dv || r.d, x = (mt.rdv || {})[r.id] || {}, hs = t === "hospit", hopP = hopA(d);
    let brut, nt, sansT = 0;
    if (x.v1) { brut = x.prix; const vH = tf(hopP, "hospit", d); nt = hs ? r2((num(brut) || 0) * (1 - ((vH && vH.impot) != null ? vH.impot : 10) / 100)) : brut; }
    else {
      const v0 = r.type === T_RTC ? { brut: 0, retro: 0, impot: 0 } : tf(hopP, t, d), v = v0 || { brut: 0, retro: 0, impot: 0 };
      if (!v0 && x.brut == null && !(hs && x.tj != null)) sansT = 1;
      brut = x.brut != null ? x.brut : hs ? joursH(r) * (x.tj != null ? x.tj : v.brut) : v.brut;
      nt = r2(net(num(brut) || 0, v));
    }
    ev.push([d, t, hopP, libRdv(r), brut, 100, nt, hs ? "Réalisée" : "Venu", x.mode || null, "r|" + (r.id || r.d + "|" + (r.type || "")), sansT]); // 9e : mode de paiement (19.5)
  });
  (P.rts || []).forEach((r) => {
    // R-D3 (20/10/2026, audit n° 6, C5) : part du médecin = ligne « Radiothérapie » du lieu, sinon taux commun des Paramètres (tauxRT) ;
    // plus de 60 % / 10 % pris en silence : sans l'un ni l'autre, l'acte est « sans tarif » (0 DH)
    const h = r.hop || P.hop || "", x = (mt.rt || {})[r.id] || {}, dRef = r.fin || finRT(r, ctx.feries) || r.deb || "", v = tf(h, "rt", dRef) || tauxRT(tab);
    const prix = x.prix != null ? x.prix : ((tab.actesRT || []).find((a) => a.nom === r.acte) || {}).prix;
    const brut = (num(prix) || 0) * nbA(r) + (r.vmat ? num(x.vmatPrix != null ? x.vmatPrix : tab.vmat) || 0 : 0);
    const fx = x.netFixe != null && r.fin, nt = fx ? x.netFixe : v ? Math.round(brut * (100 - v.retro) / 100 * (1 - v.impot / 100)) : 0;
    const lib = "RT " + (r.acte || "") + (nbA(r) > 1 ? " × " + nbA(r) : "") + (r.vmat ? " + VMAT" : "");
    const sansT = (prix == null || !v) && !fx ? 1 : 0, tx = v ? 100 - v.retro : 0;
    if (r.fin) ev.push([r.fin, "rt", h, lib, brut, fx ? null : tx, nt, "Terminée", null, "rt|" + r.id, sansT]);
    else if (r.deb || r.nb) ev.push([finRT(r, ctx.feries) || r.deb || "", "rtprev", h, lib, brut, tx, nt, "En cours / prévue", null, "rt|" + r.id, sansT]);
  });
  return ev;
}
