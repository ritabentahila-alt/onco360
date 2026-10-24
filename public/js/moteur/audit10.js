// Audit n° 10 (20/10/2026) – corrections de la bibliothèque de protocoles, calculs purs (sans DOM ni Firebase), testés par
// node tests/moteur/test-audit10.mjs sur la bibliothèque reconstruite du 18/10 (aucune donnée patient).
// S2 (21/10/2026, d. 26, 27, 29) : le danger. Chaque correction n'est faite que si le protocole est encore tel que l'audit l'a vu (rien deux
// fois, rien d'écrasé de ce que le médecin a changé depuis) ; ce qui ne correspond plus est rendu dans « ignores » (journal : à vérifier).
// Les lignes déjà prescrites gardent leur copie du protocole : lignesAVerifier les retrouve pour que le médecin les corrige à la main.
import { premed } from "./doses.js";
const S = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const copie = (p) => JSON.parse(JSON.stringify(p));
const TRASTU = /TRASTUZUMAB|HERCEPTIN/;
const inclus = (a, b) => (a || []).every((x) => (b || []).indexOf(x) >= 0); // jours de a tous dans b
const NOM_ANCIEN_IBRANCE = /FULVES(TE)?ANT/;

// (1) Trastuzumab toutes les 2 semaines (mFOLFOX6 + Herceptin, FOLFIRI + Trastuzumab) : la ligne « 6 mg/kg au C1, puis 4 » (mg/kg_c1) était
// donnée à J1 ET J15, et une 2e ligne 4 mg/kg à J15 et J29 (au-delà du cycle de 28 jours) : 420 + 280 mg à J15, une séance « J29 ».
// Après : charge 6 mg/kg à C1 J1 seulement ; 4 mg/kg à J1 sauf C1 ; 4 mg/kg à J15.
function trastuzumab14(p) {
  const A = p.dr.find((d) => d.u === "mg/kg_c1" && TRASTU.test(S(d.p)) && +d.c1 === 6 && +d.cn === 4 && JSON.stringify(d.j) === "[1,15]");
  const B = p.dr.find((d) => d !== A && d.u === "mg/kg" && TRASTU.test(S(d.p)) && +d.d === 4 && (d.j || []).indexOf(15) >= 0 && (d.j || []).some((j) => j > (p.c || 28)));
  if (!A || !B) return null;
  const charge = { p: "HERCEPTIN (trastuzumab) – charge", u: "mg/kg", d: 6, j: [1], v: A.v || "IV", n: "C1 seule", c1s: 1, id: A.id };
  ["s", "t"].forEach((k) => { if (A[k]) charge[k] = A[k]; });
  const entretien = Object.assign({}, charge, { p: "HERCEPTIN (trastuzumab)", d: 4, n: "sauf C1", id: A.id + "n" }); delete entretien.c1s; entretien.nc1 = 1;
  const j15 = Object.assign({}, B, { j: [15] });
  const dr = []; p.dr.forEach((d) => { if (d === A) dr.push(charge, entretien); else if (d === B) dr.push(j15); else dr.push(d); });
  return { dr, quoi: "trastuzumab : charge 6 mg/kg à C1 J1 seulement, puis 4 mg/kg à J1 (sauf C1) et à J15 ; plus de ligne à J29" };
}
// (2) « C1 seule » / « sauf C1 » écrits seulement en remarque (le calcul ne lisait que c1s / nc1) : Paclitaxel 80 + Trastuzumab, ERBITAX, TPEx,
// et « cycle 1 uniquement » dans le nom d'une ligne
function drapeauxC1(p) {
  let n = 0;
  const dr = p.dr.map((d) => {
    const note = S(d.n).trim(), nom = S(d.p);
    if (!d.c1s && !d.nc1 && (note === "C1 SEULE" || /CYCLE 1 UNIQUEMENT|C1 UNIQUEMENT/.test(nom))) { n++; return Object.assign({}, d, { c1s: 1 }); }
    if (!d.nc1 && !d.c1s && note === "SAUF C1") { n++; return Object.assign({}, d, { nc1: 1 }); }
    return d;
  });
  return n ? { dr, quoi: n + " ligne(s) « C1 seule » / « sauf C1 » prise(s) en compte par le calcul" } : null;
}
// (3) Même ligne sans dose répétée (retrait du diffuseur) ou même prémédication à la même dose, dont les jours sont déjà couverts par une
// autre ligne : retirée (retrait du diffuseur deux fois à J17 ; Solumedrol 80 mg deux fois à J1 dans deux protocoles hebdomadaires du 18/10)
function doublons(p) {
  const retirees = [];
  const meme = (a, b) => S(a.p) === S(b.p) && a.u === b.u && (a.u === "txt" || String(a.d) === String(b.d)) && (a.u === "txt" ? /RETRAIT DU DIFFUSEUR/.test(S(a.p)) : /SOLUMEDROL|METHYLPREDNISOLONE|ONSET|ONDANSETRON|POLARAMINE/.test(S(a.p)));
  p.dr.forEach((d, i) => {
    if (retirees.indexOf(d) >= 0 || d.c1s || d.nc1 || d.cmax || d.tous) return;
    const autre = p.dr.find((e, k) => k !== i && retirees.indexOf(e) < 0 && !e.c1s && !e.nc1 && !e.cmax && !e.tous && meme(d, e) && inclus(d.j, e.j) && ((d.j || []).length < (e.j || []).length || k < i));
    if (autre) retirees.push(d);
  });
  if (!retirees.length) return null;
  return { dr: p.dr.filter((d) => retirees.indexOf(d) < 0), quoi: "ligne(s) en double retirée(s) : " + retirees.map((d) => d.p + " J" + (d.j || []).join(", J") + (d.u !== "txt" ? " (" + d.d + " " + d.u + ")" : "")).join(" ; ") };
}

// (4) KEYNOTE-A18 – phase 2, créé le 18/10 sans statut : « Validé » (sinon il ne peut pas être prescrit)
const ID_KN18 = "audit3|keynote-a18-phase2";
// (5) « Letrozole 2,5mg ou Fulvesteant + Palbociclib 125mg (Ibrance) + Zometa » prescrivait les deux hormonothérapies ensemble : deux
// protocoles (létrozole ; fulvestrant), « Fulvestrant » bien écrit
const ID_IBRANCE = "sein|ibrance zometa", ID_IBRANCE_F = "audit10|fulvestrant-palbociclib-zometa";
function separerIbrance(p) {
  const L = p.dr.find((d) => /LETROZOLE/.test(S(d.p))), F = p.dr.filter((d) => /FULVESTRANT/.test(S(d.p)));
  if (!L || !F.length || !NOM_ANCIEN_IBRANCE.test(S(p.nom)) || !/LETROZOLE/.test(S(p.nom))) return null;
  const sansOption = (d) => Object.assign({}, d, { p: String(d.p).replace(/\s*\((option \d)\)/i, "").replace(/\s*\(option \d\)\s*–\s*cycle 1 uniquement/i, " – cycle 1 uniquement").trim() });
  const autres = p.dr.filter((d) => d !== L && F.indexOf(d) < 0);
  const notes = (p.no || []).filter((t) => !/cocher l[ée]trozole OU fulvestrant/i.test(t));
  const let_ = copie(p);
  Object.assign(let_, { nom: "Létrozole 2,5 mg + Palbociclib 125 mg (Ibrance) + Zometa / 28 j", dr: autres.concat([sansOption(L)]), no: ["Pré/périménopause : ajouter un agoniste LHRH"].concat(notes) });
  const ful = copie(p);
  Object.assign(ful, { id: ID_IBRANCE_F, nom: "Fulvestrant 500 + Palbociclib 125 mg (Ibrance) + Zometa / 28 j", dr: autres.map(copie).concat(F.map((d) => { const x = sansOption(d); if (/CYCLE 1 UNIQUEMENT/.test(S(x.p))) x.c1s = 1; return x; })), no: ["Fulvestrant 500 mg IM à J1 et J15 de la 1re cure, puis J1 de chaque cure", "Pré/périménopause : ajouter un agoniste LHRH"].concat(notes) });
  ["version", "valide", "majLe", "majPar", "majParNom", "fav"].forEach((k) => delete ful[k]);
  ful.src = (p.src ? p.src + " ; " : "") + "protocole séparé du protocole « létrozole ou fulvestrant » le 21/10/2026 (audit n° 10)";
  return { let_, ful };
}

export function correctionsS2(bib) {
  const modifies = [], crees = [], ignores = [];
  const changer = (id, p, quoi) => { const m = modifies.find((x) => x.id === id); if (m) { m.p = p; m.nom = p.nom; m.quoi.push(quoi); } else modifies.push({ id, p, quoi: [quoi], nom: p.nom }); };
  const courant = (id) => { const m = modifies.find((x) => x.id === id); return m ? m.p : bib[id]; };
  Object.keys(bib).forEach((id) => {
    const p0 = bib[id]; if (!p0 || !Array.isArray(p0.dr)) return;
    for (const f of [trastuzumab14, drapeauxC1, doublons]) {
      const p = courant(id), r = f(p); if (!r) continue;
      changer(id, Object.assign(copie(p), { dr: r.dr }), r.quoi);
    }
  });
  const kn = courant(ID_KN18);
  if (kn && kn.st !== "ok") changer(ID_KN18, Object.assign(copie(kn), { st: "ok" }), "statut « Validé » (prescriptible)");
  else if (!kn) ignores.push({ id: ID_KN18, raison: "protocole introuvable (renommé ou supprimé) : à vérifier" });
  const ib = courant(ID_IBRANCE);
  if (ib && !bib[ID_IBRANCE_F]) {
    const r = separerIbrance(ib);
    if (r) { changer(ID_IBRANCE, r.let_, "séparé : celui-ci devient « létrozole » ; le fulvestrant passe dans un protocole à part"); crees.push(r.ful); }
    else ignores.push({ id: ID_IBRANCE, raison: "plus tel que l'audit l'a vu (létrozole et fulvestrant) : à vérifier" });
  }
  return { modifies, crees, ignores };
}

// Lignes de chimio en cours (non arrêtées, au moins une cure pas encore reçue) prescrites avec un des protocoles corrigés : chaque ligne garde
// sa copie du protocole, le médecin la vérifie à la main. patients = [{ id, nom, etablissementId, lignes }]
export function lignesAVerifier(patients, ids) {
  const out = [];
  (patients || []).forEach((x) => (x.lignes || []).forEach((L) => {
    if (L.arret || ids.indexOf(L.protoId) < 0) return;
    const reste = (L.cures || []).some((c) => c && c.st !== "recue" && c.st !== "annulee");
    if (reste) out.push({ patientId: x.id, nom: x.nom, etablissementId: x.etablissementId || "", ligne: L.id, protoId: L.protoId, protocole: (L.pr && L.pr.nom) || "" });
  }));
  return out;
}

// S3 (21/10/2026, d. 44) : arrondi au mg entier qui fausse la dose de plus de 5 % pour une surface de 1,30 à 2,30 m² (ou 40 à 120 kg) :
// une décimale (0,1 mg) ; « max N mg » écrit en remarque devient le plafond lu par le calcul. Sur la bibliothèque du 18/10 : vincristine
// d'EMA-CO, trabectédine (Doxorubicine 60 + Trabectédine), dactinomycine, lurbinectédine (la vinblastine de VeIP avait déjà sa décimale, que le
// calcul n'appliquait pas en mg/kg : corrigé dans moteur/doses.js).
function ecartArrondi(d) {
  const [a, b] = d.u === "mg/m²" ? [1.3, 2.3] : d.u === "mg/kg" ? [40, 120] : [0, 0]; if (!a || !(+d.d > 0)) return 0;
  let w = 0; for (let i = 0; i <= 200; i++) { const x = +d.d * (a + ((b - a) * i) / 200); w = Math.max(w, Math.abs(Math.round(x) - x) / x); }
  return w;
}
function decimales(p) {
  const faits = [];
  const dr = p.dr.map((d) => {
    if (d.dec != null || premed(d) || ecartArrondi(d) <= 0.05) return d;
    const x = Object.assign({}, d, { dec: 1 }), mx = String(d.n || "").match(/max\.?\s*(\d+(?:[,.]\d+)?)\s*mg/i);
    if (mx && x.max == null) x.max = +mx[1].replace(",", ".");
    faits.push(d.p + " : 1 décimale" + (x.max != null && d.max == null ? ", plafond " + x.max + " mg" : "")); return x;
  });
  return faits.length ? { dr, quoi: faits.join(" ; ") } : null;
}
export function correctionsS3(bib) {
  const modifies = [];
  Object.keys(bib).forEach((id) => { const p = bib[id]; if (!p || !Array.isArray(p.dr)) return; const r = decimales(p); if (r) modifies.push({ id, p: Object.assign(copie(p), { dr: r.dr }), quoi: [r.quoi], nom: p.nom }); });
  return { modifies, crees: [], ignores: [] };
}

// S4 (21/10/2026, d. 28, 30 à 33) : harmonisation de la bibliothèque (vérifiée sur les sources le 21/10/2026 : protocole KEYNOTE-177 et
// monographie FOLFIRI de Cancer Care Ontario pour l'acide folinique ; Michael 2005, Br J Cancer, pour la vinorelbine 15 mg/m² hebdomadaire
// avec le cisplatine 20 et la radiothérapie ; essais cités dans chaque protocole pour la durée des immunothérapies).
const fr = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".", ",");
// (1) 5-FU en diffuseur de 96 h ou 120 h écrit « 1 000 mg/m² /j » : la ligne porte la dose totale du diffuseur, la dose par jour en remarque
function diffuseurTotal(p) {
  const faits = [];
  const dr = p.dr.map((d) => {
    const m = String(d.n || "").match(/^\/j en continu \(diffuseur (\d+) h\)$/);
    if (!m || d.u !== "mg/m²" || !/FLUORO|5-FU/.test(S(d.p)) || +m[1] % 24) return d;
    const jours = +m[1] / 24, tot = Math.round(+d.d * jours);
    faits.push("5-FU : " + fr(tot) + " mg/m² par diffuseur de " + m[1] + " h (" + fr(d.d) + " mg/m²/j × " + jours + " j)");
    return Object.assign({}, d, { d: tot, n: "dose totale du diffuseur de " + m[1] + " h (" + fr(d.d) + " mg/m²/j × " + jours + " j)" });
  });
  return faits.length ? { dr, quoi: faits.join(" ; ") } : null;
}
// (2) Solumedrol de J1 avec le carboplatine (sans cisplatine) : 80 mg (règle du 13/10), sauf les protocoles hebdomadaires (carboplatine
// donné plusieurs jours de la cure, cycle de 7 jours ou « hebdo » dans le nom) ; une ligne qui couvre aussi d'autres jours est coupée (J1 à
// 80 mg, les autres jours inchangés). Seulement vers le haut (40, 60 → 80) : les 3 protocoles d'origine à 120 mg (paclitaxel 175 / 200, pémétrexed)
// sont laissés tels quels, question posée à Dr Bentahila le 21/10 (on ne baisse pas une prémédication sans son accord)
function solumedrolCarbo(p) {
  const carbo = p.dr.find((d) => /CARBOPLATINE/.test(S(d.p)));
  if (!carbo || p.dr.some((d) => /CISPLATINE/.test(S(d.p))) || (carbo.j || []).filter((j) => j !== 99).length > 1 || p.c === 7 || /HEBDO/.test(S(p.nom))) return null;
  const faits = [], dr = [];
  p.dr.forEach((d) => {
    if (!/SOLUMEDROL|METHYLPREDNISOLONE/.test(S(d.p)) || d.u !== "mg" || (d.j || []).indexOf(1) < 0 || !(+d.d < 80) || d.c1s || d.nc1 || d.cmax) { dr.push(d); return; }
    faits.push("Solumedrol de J1 : " + d.d + " → 80 mg");
    const autres = (d.j || []).filter((j) => j !== 1);
    dr.push(Object.assign({}, d, { d: 80, j: [1] }));
    if (autres.length) dr.push(Object.assign({}, d, { j: autres, id: d.id + "s" }));
  });
  return faits.length ? { dr, quoi: faits.join(" ; ") } : null;
}
// (3) Acide folinique en dose fixe de 50 mg (pratique d'eviQ) dans les mFOLFOX6, FOLFIRI, LV5FU2 : 400 mg/m² (racémique), la dose des essais
function foliniqueReference(p) {
  if (!p.dr.some((d) => /5-FU DIFFUSEUR/.test(S(d.p)) && /46 H|48 H/.test(S(d.n) + S(d.t)))) return null;
  let n = 0;
  const dr = p.dr.map((d) => {
    if (!/FOLINIQUE/.test(S(d.p)) || d.u !== "mg" || +d.d !== 50) return d; n++;
    return Object.assign({}, d, { u: "mg/m²", d: 400, v: "IV", t: "2 h", n: "folinate de calcium racémique (lévofolinate : 200 mg/m²)" });
  });
  return n ? { dr, quoi: "acide folinique : 50 mg fixe → 400 mg/m² (dose des essais)" } : null;
}
// (4) « Cisplatine 20 + Vinorelbine 15 hebdomadaire + RT » prescrivait 10 mg/m²
const ID_VINO = "poumon|Cisplatine - Navelbine Avec Radiotherapie";
// (5) Immunothérapies : durée maximale selon l'indication, en remarque (rien n'est bloqué)
const DUREES_IO = {
  "poumon|keytruda alimta": "Pembrolizumab : 35 cures au plus en tout (environ 2 ans), cures d'induction comprises (KEYNOTE-189)",
  "poumon|Pemetrexed - cisplatine keytruda": "Pembrolizumab : 35 cures au plus (environ 2 ans), entretien compris (KEYNOTE-189)",
  "poumon|pemetrexed keytruda carbo hebdo": "Pembrolizumab : 35 cures au plus (environ 2 ans), entretien compris (KEYNOTE-189)",
  "sein|carboplatine paclitaxel hebdomadaire pembrolizumab": "Pembrolizumab : 8 cures néoadjuvantes puis 9 cures adjuvantes, soit environ 1 an en tout (KEYNOTE-522)",
  "sein|tcentriq": "Adjuvant : 1 an au plus (16 cures de 1 200 mg, IMpower010) ; métastatique : jusqu'à progression ou toxicité (OAK)",
  "todo|capox-pembrolizumab": "Pembrolizumab : 35 cures au plus (environ 2 ans) (KEYNOTE-859)",
  "todo|folfox-nivolumab": "Nivolumab : 2 ans au plus (CheckMate 649)",
  "todo|capox-nivolumab": "Nivolumab : 2 ans au plus (CheckMate 649)",
  "todo|enfortumab-vedotin-pembrolizumab": "Pembrolizumab : 35 cures au plus (environ 2 ans) ; enfortumab védotin jusqu'à progression ou toxicité (EV-302)",
  "maj|atezolizumab-1200-bevacizumab-15-mg-kg-21-j-imbrave150-": "Pas de durée maximale dans l'essai : jusqu'à progression ou toxicité (IMbrave150)",
  "audit3|n019": "Nivolumab : 2 ans au plus (CheckMate 648)",
  "audit3|n030": "Pas de durée maximale dans l'essai : jusqu'à progression ou toxicité (JAVELIN Merkel 200)",
  "audit3|n031": "Pas de durée maximale fixée par le RCP : jusqu'à progression ou toxicité",
  "audit3|n049": "Pembrolizumab : 35 cures au plus (environ 2 ans) (KEYNOTE-355)",
};
export function correctionsS4(bib) {
  const modifies = [], ignores = [];
  const changer = (id, p, quoi) => { const m = modifies.find((x) => x.id === id); if (m) { m.p = p; m.nom = p.nom; m.quoi.push(quoi); } else modifies.push({ id, p, quoi: [quoi], nom: p.nom }); };
  const courant = (id) => { const m = modifies.find((x) => x.id === id); return m ? m.p : bib[id]; };
  Object.keys(bib).forEach((id) => {
    if (!bib[id] || !Array.isArray(bib[id].dr)) return;
    for (const f of [diffuseurTotal, solumedrolCarbo, foliniqueReference]) { const p = courant(id), r = f(p); if (r) changer(id, Object.assign(copie(p), { dr: r.dr }), r.quoi); }
  });
  const v = courant(ID_VINO), lv = v && v.dr.find((d) => /VINORELBINE|NAVELBINE/.test(S(d.p)) && d.u === "mg/m²");
  if (lv && +lv.d === 10 && /VINORELBINE 15/.test(S(v.nom))) {
    const p = copie(v); p.dr.find((d) => d.id === lv.id).d = 15;
    p.src = "Michael 2005 (Br J Cancer, phase I) : cisplatine 20 + vinorelbine 15 mg/m² hebdomadaires avec la radiothérapie" + (v.src ? " ; " + v.src : "");
    changer(ID_VINO, p, "vinorelbine : 10 → 15 mg/m² (dose du nom et de l'essai)");
  } else if (!lv || +lv.d !== 15) ignores.push({ id: ID_VINO, raison: "vinorelbine plus telle que l'audit l'a vue : à vérifier" });
  Object.keys(DUREES_IO).forEach((id) => {
    const p = courant(id); if (!p) { ignores.push({ id, raison: "protocole introuvable : durée de l'immunothérapie à écrire à la main" }); return; }
    if ((p.no || []).some((t) => t === DUREES_IO[id])) return;
    changer(id, Object.assign(copie(p), { no: (p.no || []).concat([DUREES_IO[id]]) }), "durée de l'immunothérapie en remarque");
  });
  return { modifies, crees: [], ignores };
}

// 24/10/2026 (demandes de Dr Bentahila) : (1) POLARAMINE (dexchlorphéniramine) retirée de tous les protocoles : elle n'existe pas au Maroc ;
// (2) Solumedrol à 120 mg avec le carboplatine, vérifié dans la littérature : paclitaxel 175-200 mg/m² toutes les 3 semaines = dexaméthasone 20 mg
// avant la perfusion (RCP du paclitaxel) ≈ méthylprednisolone 107 mg (0,75 mg de dexaméthasone ≈ 4 mg de méthylprednisolone) : 120 mg gardé ;
// pémétrexed + carboplatine (pas de taxane : prémédication antiémétique seulement) : 80 mg (règle du 13/10) ; (3) chimiothérapie marquée par erreur
// « Traitement associé » (castration, os, support ; reprise de l'ancienne application) : case retirée (« Paclitaxel + Carboplatine hebdomadaire –
// fractionné » : ses séances n'étaient pas comptées dans le bilan)
const ID_PEM_CARBO = "poumon|Pemetrexed - Carboplatine J1J21";
const RE_ASSOC_OK = /ZOLADEX|GOSERELINE|DECAPEPTYL|TRIPTORELINE|LEUPRORELINE|ELIGARD|ENANTONE|DEGARELIX|FIRMAGON|ZOMETA|ZOLEDRON|DENOSUMAB|XGEVA|PROLIA|NIVESTIM|FILGRASTIM|RECORMON|EPOETINE|EPREX|ARANESP|NEULASTA|PEGFILGRASTIM|TAMOX|LETROZOLE|ANASTROZOLE|EXEMESTANE|FULVESTRANT|ABIRATERONE|ENZALUTAMIDE|APALUTAMIDE|DAROLUTAMIDE|BICALUTAMIDE|PREDNIS/;
export function correctionsS4b(bib) {
  const modifies = [], ignores = [];
  Object.keys(bib).forEach((id) => {
    const p0 = bib[id]; if (!p0 || !Array.isArray(p0.dr)) return;
    const p = copie(p0), quoi = [];
    const avant = p.dr.length; p.dr = p.dr.filter((d) => !/POLARAMINE|DEXCHLORPHENIRAMINE/.test(S(d.p)));
    if (p.dr.length < avant) { quoi.push("POLARAMINE retirée (n'existe pas au Maroc)"); p.no = (p.no || []).map((t) => String(t).replace(/La POLARAMINE et le SOLUMEDROL couvrent/i, "Le SOLUMEDROL couvre")); }
    if (id === ID_PEM_CARBO) p.dr.forEach((d) => { if (/SOLUMEDROL|METHYLPREDNISOLONE/.test(S(d.p)) && d.u === "mg" && +d.d === 120 && JSON.stringify(d.j) === "[1]") { d.d = 80; quoi.push("Solumedrol de J1 : 120 → 80 mg (pas de taxane ; règle du 13/10)"); } });
    if (p.assoc) { const ac = p.dr.filter((d) => !premed(d) && d.u !== "txt"); if (ac.length && ac.some((d) => !RE_ASSOC_OK.test(S(d.p)) && !/PER OS/.test(S(d.v)))) { delete p.assoc; quoi.push("case « Traitement associé » retirée (chimiothérapie : séances et consultations comptées dans le bilan)"); } }
    if (quoi.length) modifies.push({ id, p, quoi, nom: p.nom });
  });
  return { modifies, crees: [], ignores };
}
