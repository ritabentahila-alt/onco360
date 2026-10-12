// Chimio HGC v2 – calcul des doses et des dates de cures (règles A1–A12, B1–B6 de l'inventaire validé le 04/10/2026).
// Reprise à l'identique de l'application v1 (fonctions etat, calcul, clairance, seancesDe, seaInfo_), sans variable globale.
import { num, arr, addJ, ecart, age } from "./outils.js";

// A12 – prémédication et traitements de support : pas de réduction de dose globale. 2.3 (12/10/2026, audit) : reconnus par la DCI
// comme par la marque (« ONDANSETRON » était réduit, « ONSET » non) : antiémétiques, corticoïdes, antihistaminiques, anti-H2 et IPP,
// atropine, facteurs de croissance, érythropoïétines, acide zolédronique et dénosumab.
export const PREMED = ["SOLUMEDROL", "METHYLPREDNISOLONE", "DEXAMETHASONE", "BETAMETHASONE", "CELESTENE", "PREDNISOLONE", "SOLUPRED", "HYDROCORTISONE",
  "ONSET", "ONDANSETRON", "ZOPHREN", "GRANISETRON", "KYTRIL", "PALONOSETRON", "ALOXI", "APREPITANT", "FOSAPREPITANT", "EMEND", "NETUPITANT", "AKYNZEO",
  "METOCLOPRAMIDE", "PRIMPERAN", "DOMPERIDONE", "ATARAX", "HYDROXYZINE", "POLARAMINE", "DEXCHLORPHENIRAMINE", "ATROPINE",
  "RANITIDINE", "FAMOTIDINE", "OMEPRAZOLE", "ESOMEPRAZOLE", "MOPRAL", "INEXIUM",
  "NIVESTIM", "FILGRASTIM", "ZARZIO", "GRANOCYTE", "LENOGRASTIM", "NEULASTA", "PEGFILGRASTIM",
  "RECORMON", "EPREX", "EPOETINE", "ARANESP", "DARBEPOETINE", "ZOMETA", "ACIDE ZOL", "XGEVA", "PROLIA", "DENOSUMAB"];
const sansAccents = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
export const premed = (d) => d.u === "txt" || PREMED.some((m) => sansAccents(d.p).indexOf(m) >= 0);

// A1 – surface corporelle (Mosteller), 2 décimales
export const surface = (poids, taille) => (poids && taille ? Math.round(Math.sqrt((poids * taille) / 3600) * 100) / 100 : null);

// A2/A3 – clairance de Cockcroft-Gault (mg/L ou µmol/L)
export function clairance(ag, po, cr, sx, u) {
  if (!(ag && po && cr && (sx === "H" || sx === "F"))) return null;
  if (u === "mgL") return Math.round(((140 - ag) * po) / (7.2 * cr) * (sx === "F" ? 0.85 : 1));
  return Math.round(((140 - ag) * po * (sx === "H" ? 1.23 : 1.04)) / cr);
}

// A5/A6/A7/A8 – dose théorique d'un produit pour une cure
export function calcul(d, e) {
  let r = null;
  if (d.u === "mg/m²") r = e.sc ? arr(d.d * e.sc, d.dec) : null;
  else if (d.u === "mg/kg") r = e.poids ? arr(d.d * e.poids) : null;
  else if (d.u === "mg") r = d.d;
  else if (d.u === "AUC") r = e.cl ? arr(d.d * (Math.min(e.cl, 125) + 25)) : null;
  else if (d.u === "mg_c1") r = e.n === 1 ? d.c1 : d.cn;
  else if (d.u === "mg/kg_c1") r = e.poids ? arr((e.n === 1 ? d.c1 : d.cn) * e.poids) : null;
  if (r != null && d.max && r > d.max) r = d.max;
  return r;
}

export function dedupIds(pr) { if (!pr || !pr.dr) return false; const seen = {}; let ch = false; pr.dr.forEach((d, i) => { if (!d.id || seen[d.id]) { d.id = (d.id || "d") + "_" + i; ch = true; } seen[d.id] = 1; }); return ch; }
export function joursDe(d) { let js = (d.j || [1]).filter((j) => j !== 99); if (!js.length) js = [(d.j || [1])[0]]; return js.slice().sort((a, b) => a - b); }

// 2.4 (12/10/2026, audit) : un protocole n'est prescriptible que validé explicitement (statut « ok ») ; l'absence de statut ne vaut plus
// accord (les protocoles sans statut ont été marqués « validé avant le 12/10/2026 » une fois, marquerProtocoles de protocoles.js)
export const protocoleValide = (p) => !!p && p.st === "ok";

// Protocole d'une ligne (copie figée dans la ligne, sinon bibliothèque)
export const protocoleDe = (L, bib) => L.pr || (bib && bib[L.protoId]);

// Protocole effectif d'une cure k (0 = C1) : modifications de ligne, produits « tous les n cycles », C1 seule, sauf C1
export function protocoleCure(L, k, bib) {
  const p = protocoleDe(L, bib); if (!p) return null;
  const mods = (L.mods || []).filter((m) => m.k <= k);
  if (!mods.length && !p.dr.some((d) => d.tous || d.c1s || d.nc1)) return p;
  const q = Object.assign({}, p); let dr = p.dr.slice();
  // Modification décidée à une séance (m.j = J8, J15…) : dans SA cure, ne vaut qu'à partir de ce jour ; pleinement aux cures suivantes
  const jours = (d, f) => { const l = (d.j || [1]).filter(f); return l.length ? Object.assign({}, d, { j: l }) : null; };
  mods.forEach((m) => {
    const partiel = m.k === k && m.j > 1;
    if (m.op === "add") { const d = partiel ? jours(m.d, (y) => y === 99 || y >= m.j) : m.d; if (d) dr.push(d); }
    else dr = dr.map((d) => (d.id !== m.id ? d : partiel ? jours(d, (y) => y !== 99 && y < m.j) : null)).filter(Boolean);
  });
  q.dr = dr.filter((d) => (!d.tous || k % d.tous === 0) && (!d.c1s || k === 0) && (!d.nc1 || k > 0));
  return q;
}

// B4 – jours de séance d'un protocole (J1, J8, J15…), hors per os, facteurs de croissance et produits « sans séance »
export function seancesDe(p) {
  const days = [];
  (p && p.dr || []).forEach((d) => { if (d.nd || /per os/i.test(d.v || "") || /NIVESTIM|GRANOCYTE|filgrastim|l[ée]nograstim/i.test(d.p || "")) return; (d.j || []).forEach((j) => { if (j !== 99 && days.indexOf(j) < 0) days.push(j); }); });
  days.sort((a, b) => a - b); const g = [];
  days.forEach((j) => { const l = g[g.length - 1]; if (!l || j - l.days[l.days.length - 1] > 2) g.push({ j, days: [j] }); else l.days.push(j); });
  return g;
}

// B1/B2 + A1–A11 – état de toutes les cures d'une ligne
// patient : {taille, ddn, sexe} ; ctx : {aujourdhui:'AAAA-MM-JJ', bib:{id:protocole}}
// Chaque cure est calculée avec SON protocole (molécules ajoutées/retirées, « tous les n cycles ») : e.dj[x] suit protocoleCure(L, k).dr.
// Paramètres par séance (J1, J8, J15…) : poids, créatinine et % des anticancéreux saisis à J1 (cure) ou à Jn (c.sea[n]) ;
// à défaut, la dernière valeur connue est reprise (séance précédente, puis cure précédente).
// % ou dose modifiés un jour donné : reportés à tous les jours suivants de la cure et à tous les jours des cures suivantes.
export const jourVersSeance = (g, j) => { if (j === 99) return 0; let r = 0; g.forEach((z, n) => { if (z.j <= j) r = n; }); return r; };
export function etatLigne(L, patient, ctx) {
  if (L.pr) dedupIds(L.pr);
  const p = protocoleDe(L, ctx.bib); dedupIds(p);
  const out = []; let prev = null, base = null, dernier = null; const S = {};
  L.cures.forEach((c, i) => {
    const q = protocoleCure(L, i, ctx.bib) || p, e = { n: i + 1, c };
    e.prevue = c.fixe || (i === 0 ? L.j1 : base && p.c ? addJ(base, p.c) : null);
    e.st = c.st || "prevue";
    e.date = e.st === "recue" ? c.reelle : e.prevue;
    base = e.st === "recue" ? c.reelle : e.prevue;
    e.taille = c.fige && c.fige.taille != null ? c.fige.taille : num(patient.taille); // 2.2 : taille figée à la validation
    e.age = age(patient.ddn, e.date || ctx.aujourdhui);
    // Paramètres de chaque séance
    const g0 = seancesDe(q), g = g0.length ? g0 : [{ j: 1, days: [1] }];
    e.g = g.map((z, n) => {
      const src = n === 0 ? c : (c.sea || {})[z.j] || {}, avant = dernier || { poids: num(L.poids), creat: num(L.creat) };
      const o = { j: z.j, days: z.days, poids: num(src.poids) != null ? num(src.poids) : avant.poids, creat: num(src.creat) != null ? num(src.creat) : avant.creat, pctAll: num(src.pctAll), saisi: { poids: num(src.poids) != null, creat: num(src.creat) != null } };
      o.sc = surface(o.poids, e.taille); o.cl = clairance(e.age, o.poids, o.creat, patient.sexe, L.crU);
      // 2.2 (12/10/2026) : séance validée = valeurs figées au moment de la validation (poids, créatinine, surface, clairance, doses)
      const F = src.st === "recue" && src.fige ? src.fige : null;
      if (F) { o.fige = F; ["poids", "creat", "sc", "cl"].forEach((k) => { if (F[k] !== undefined) o[k] = F[k]; }); }
      dernier = o; return o;
    });
    Object.assign(e, { poids: e.g[0].poids, creat: e.g[0].creat, sc: e.g[0].sc, cl: e.g[0].cl });
    e.doses = []; e.calc = []; e.dj = []; e.fac = {}; e.pc = {}; e.pcSet = {}; e.ids = q.dr.map((d) => d.id); e.prod = q.dr.map((d) => ({ p: d.p, u: d.u }));
    q.dr.forEach((d, x) => {
      e.dj[x] = {}; const mol = d.id || d.p;
      joursDe(d).forEach((j, ji) => {
        const G = e.g[jourVersSeance(g, j)], v = calcul(d, { sc: G.sc, poids: G.poids, cl: G.cl, n: e.n });
        const key = d.id + "@" + j, first = ji === 0, st = S[mol] || { pc: 100, f: 1 };
        const pi = c.pct && num(c.pct[key]) != null ? num(c.pct[key]) : c.pct && num(c.pct[d.id]) != null ? num(c.pct[d.id]) : null;
        const pa = !premed(d) ? G.pctAll : null;
        const set = pi != null || pa != null;
        let pc = pi != null ? pi : pa != null ? pa : st.pc;           // A10 – % reconduit
        let f = set ? 1 : st.f;
        if ((d.u === "mg_c1" || d.u === "mg/kg_c1") && e.n === 2) f = 1; // A7
        const b = v == null ? null : arr((v * pc) / 100, d.dec);
        const ov = c.ov && num(c.ov[key]) != null ? num(c.ov[key]) : c.ov && num(c.ov[d.id]) != null ? num(c.ov[d.id]) : null;
        if (ov != null && v) { pc = (ov / v) * 100; f = 1; } else if (ov != null && b) f = ov / b; // A11 – dose saisie reconduite en %
        let dose = ov != null ? ov : b == null ? null : f === 1 ? b : arr(b * f, d.dec);
        const fz = G.fige && G.fige.doses && G.fige.doses[key]; // 2.2 : dose figée de la séance validée
        e.dj[x][j] = fz ? { dose: fz.dose, v: fz.v, pc: fz.pc, pi: pi != null, ov: ov != null, fige: true } : { dose, v, pc: Math.round(pc * 10) / 10, pi: pi != null, ov: ov != null };
        if (fz) { dose = fz.dose; }
        if (first) { e.calc[x] = fz ? fz.v : v; e.doses[x] = dose; e.pc[d.id] = fz ? fz.pc : Math.round(pc * 10) / 10; e.pcSet[d.id] = set; e.fac[d.id] = f; }
        S[mol] = { pc, f };
      });
    });
    out.push(e); prev = e;
  });
  return out;
}

// 2.2 (12/10/2026) – instantané d'une séance au moment de sa validation (n = 0 pour J1, 1 pour la 2e séance…) : ce qui a servi au
// calcul et les doses de chaque produit pour les jours de cette séance ; gardé dans la cure (c.fige) ou la séance (c.sea[j].fige)
export function instantane(e, n) {
  const G = e.g[n] || e.g[0], doses = {};
  (e.dj || []).forEach((dj, x) => Object.keys(dj).forEach((j) => {
    if (G.days.indexOf(+j) < 0 && !(n === 0 && +j === 99)) return;
    const z = dj[j], P = (e.prod || [])[x] || {}; doses[e.ids[x] + "@" + j] = { p: P.p || "", u: P.u || "", dose: z.dose, v: z.v, pc: z.pc };
  }));
  return { taille: e.taille, age: e.age, poids: G.poids, creat: G.creat, sc: G.sc, cl: G.cl, doses };
}

// 2.3 (12/10/2026, audit) – contrôle d'une séance avant sa validation (n = 0 pour J1) : `refus` = dose d'un anticancéreux impossible à
// calculer (vide : sans surface, sans poids, sans créatinine…) → validation impossible ; une dose à 0 voulue (0 mg/m² au protocole,
// 0 % décidé) reste permise ; `alertes` = valeurs hors des seuils décidés par Dr Bentahila (validation après
// confirmation). poidsAvant : poids de la séance précédente (variation > 10 %).
export const SEUILS = { poids: [30, 200], taille: [120, 220], sc: [1.2, 2.6], creatMgL: [3, 30], creatUmol: [25, 265], cl: [30, 200], variation: 10 };
export function controleSeance(e, n, crU, poidsAvant) {
  const G = (e.g || [])[n] || {}, refus = [], alertes = [], S = SEUILS, hors = (v, [a, b]) => v != null && (v < a || v > b);
  (e.dj || []).forEach((dj, x) => {
    const P = (e.prod || [])[x] || {}; if (premed(P)) return;
    (G.days || [1]).concat(n === 0 ? [99] : []).forEach((j) => {
      const z = dj[j]; if (!z) return;
      if (z.dose == null) refus.push(P.p + " (J" + (j === 99 ? 1 : j) + ") : " + (P.u === "AUC" && G.creat == null ? "créatinine manquante, dose impossible à calculer" : "dose manquante"));
    });
  });
  if (hors(G.poids, S.poids)) alertes.push("poids de " + G.poids + " kg (hors de " + S.poids.join(" à ") + " kg)");
  if (hors(e.taille, S.taille)) alertes.push("taille de " + e.taille + " cm (hors de " + S.taille.join(" à ") + " cm : saisie en mètres ?)");
  if (hors(G.sc, S.sc)) alertes.push("surface corporelle de " + G.sc + " m² (hors de " + S.sc.join(" à ") + " m²)");
  const sc = crU === "mgL" ? S.creatMgL : S.creatUmol;
  if (hors(G.creat, sc)) alertes.push("créatinine de " + G.creat + (crU === "mgL" ? " mg/L" : " µmol/L") + " (hors de " + sc.join(" à ") + " : bonne unité ?)");
  if (hors(G.cl, S.cl)) alertes.push("clairance de " + G.cl + " ml/min (hors de " + S.cl.join(" à ") + ")");
  if (G.poids != null && poidsAvant && Math.abs(G.poids - poidsAvant) / poidsAvant * 100 > S.variation)
    alertes.push("poids passé de " + poidsAvant + " à " + G.poids + " kg (" + (G.poids > poidsAvant ? "+" : "") + Math.round((G.poids - poidsAvant) / poidsAvant * 100) + " %)");
  return { refus, alertes };
}
// Poids de la séance précédente (séance n de la cure k) : séance d'avant dans la cure, sinon dernière séance de la cure d'avant
export const poidsAvant = (E, k, n) => (n > 0 ? E[k].g[n - 1].poids : k > 0 && E[k - 1] ? E[k - 1].g[E[k - 1].g.length - 1].poids : null);

// B5 – séances J8, J15… d'une cure, avec décalage en cascade
export function seancesCure(L, e, bib) {
  const g = seancesDe(protocoleCure(L, e.n - 1, bib)); let dec = 0;
  return g.slice(1).map((s) => {
    const x = (e.c.sea || {})[s.j] || {}, nat = e.date ? addJ(e.date, s.j - 1 + dec) : null, prev = x.fixe || nat, anc = x.st === "recue" && x.d ? x.d : x.fixe;
    if (anc && e.date) dec = ecart(anc, addJ(e.date, s.j - 1));
    return { j: s.j, st: x.st || "prevue", d: x.d || null, prevue: prev, suivi: !!(e.c.sea && e.c.sea[s.j]), ann: x.ann || null }; // st : prevue | recue | annulee
  });
}
