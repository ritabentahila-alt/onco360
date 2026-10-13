// Onco360 – Audit n° 3 (12/10/2026), ordre 1 : les 6 protocoles critiques corrigés et les 10 protocoles supprimés (doublons ou sans
// référence), appliqués une fois à la bibliothèque d'un cabinet (protocoles.js `appliquerAudit3`). Calcul pur, sans Firebase : on reçoit
// la bibliothèque { id: protocole }, on rend les protocoles modifiés, créés et supprimés. Chaque correction n'est faite que si le
// protocole est encore tel que l'audit l'a vu (`garde`) : rien n'est appliqué deux fois, un protocole déjà retouché n'est pas touché.
// Solumedrol de J1 (décision de Dr Bentahila, 13/10/2026) : 60 mg avec EMEND (cisplatine sur 1 jour, AC), 80 mg sans EMEND
// (carboplatine, paclitaxel), 50 mg par jour pour le cisplatine sur plusieurs jours.

const sa = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const a = (p, re) => (p.dr || []).find((d) => re.test(sa(d.p)));
const copie = (o) => JSON.parse(JSON.stringify(o));

// Lignes types de l'audit (colonnes de l'éditeur : p produit, d dose, u unité, j jours, jl libellé jour, n précision, v voie, s soluté, t durée)
const onset = (j) => ({ p: "ONSET (ondansétron) 8 mg/4 ml inj.", u: "mg", d: 8, j, n: "30 min avant la chimiothérapie", v: "IV", s: "NaCl 0,9 % 50 ml", t: "15 min" });
const solu = (d, j) => ({ p: "SOLUMEDROL (méthylprednisolone) inj.", u: "mg", d, j, n: "30 min avant la chimiothérapie", v: "IV", s: "NaCl 0,9 % 50 ml", t: "15 min" });
const pola = (j) => ({ p: "POLARAMINE (dexchlorphéniramine) 5 mg/1 ml inj.", u: "mg", d: 5, j, n: "30 min avant la perfusion", v: "IV lente" });
const txt = (p, pos, j, n, v) => ({ p, u: "txt", pos, dt: pos, j, n, v });
const hydAv = (ml, j) => txt("HYDRATATION AVANT CISPLATINE : NaCl 0,9 %", ml + " ml + KCl 1,5 g + MgSO4 2 g", j, "en 1 h, avant le cisplatine", "IV");
const hydAp = (ml, j) => txt("HYDRATATION APRÈS CISPLATINE : NaCl 0,9 %", ml + " ml", j, "en 1 h, après le cisplatine ; diurèse ≥ 100 ml/h", "IV");
// NIVESTIM : sur la fiche (prise en charge avec la chimiothérapie) ; jamais un jour de séance (nd, j 99) ; 30 MU jusqu'à 70 kg, 48 MU au-dessus
const niv = (de, a2) => {
  const n = a2 - de + 1, pos = "1 injection SC par jour : 30 MU (48 MU si poids > 70 kg) × " + n + " injections (J" + de + " → J" + a2 + ")";
  return { p: "NIVESTIM (filgrastim) 30 MU/0,5 ml", u: "txt", j: [99], nd: 1, jl: "J" + de + " → J" + a2, pos, dt: pos, n: "à domicile (infirmière), dès 24 h après la fin de la chimiothérapie ; si G-CSF décidé", v: "SC" };
};

// Remplace une ligne en gardant son identifiant (les séances déjà figées s'y retrouvent)
function remplacer(p, re, nouv) { const i = p.dr.findIndex((d) => re.test(sa(d.p))); if (i < 0) return false; p.dr[i] = Object.assign({ id: p.dr[i].id }, nouv); return true; }
// Hydratation autour du cisplatine : avant la ligne de cisplatine et juste après
function hydrater(p, ml, j) { const i = p.dr.findIndex((d) => /^CISPLATINE/.test(sa(d.p))); p.dr.splice(i + 1, 0, hydAp(ml, j)); p.dr.splice(i, 0, hydAv(ml, j)); }
const ids = (p) => { const vu = {}; p.dr.forEach((d, i) => { if (!d.id || vu[d.id]) d.id = "a3_" + i; vu[d.id] = 1; }); };
const PJ = [1, 8, 15, 29, 36, 43, 57, 64, 71]; // KEYNOTE-355 : paclitaxel J1-J8-J15 de chaque période de 28 jours, sur 84 jours

export const PORTEC3_2 = "audit3|portec3-phase2";
export const NOM_PORTEC3_2 = "PORTEC-3 – phase 2 : Carboplatine AUC 5 + Paclitaxel 175 / 21 j × 4";

// Les 6 protocoles critiques : { id, quoi (affiché), garde (encore comme l'audit l'a vu ?), corriger(p) }
export const CRITIQUES = [
  { id: "todo|paclitaxel-pembrolizumab", quoi: "renommé ; cycle de 84 jours (paclitaxel J1-J8-J15 toutes les 4 semaines, pembrolizumab toutes les 3 semaines) ; POLARAMINE ajoutée",
    garde: (p) => p.c === 21 && a(p, /PACLITAXEL/) && String(a(p, /PACLITAXEL/).j) === "1,8,15",
    corriger: (p) => {
      p.nom = "Paclitaxel 90 J1-J8-J15 / 28 j + Pembrolizumab 200 / 21 j (KEYNOTE-355)"; p.c = 84; p.r = "Paclitaxel J1-J8-J15 de chaque période de 28 jours ; pembrolizumab toutes les 3 semaines (cycle de 84 jours = 3 × 28 = 4 × 21)";
      remplacer(p, /SOLUMEDROL/, solu(80, PJ)); remplacer(p, /ONSET/, onset(PJ));
      a(p, /PEMBROLIZUMAB/).j = [1, 22, 43, 64]; a(p, /PACLITAXEL/).j = PJ.slice();
      p.dr.splice(p.dr.findIndex((d) => /ONSET/.test(sa(d.p))) + 1, 0, pola(PJ));
      p.no = (p.no || []).filter((x) => !/adapt[ée] ici en cycle de 21/i.test(x)).concat("Cycle de 84 jours : paclitaxel 90 mg/m² J1-J8-J15 toutes les 4 semaines, pembrolizumab 200 mg toutes les 3 semaines (KEYNOTE-355)");
      p.src = p.src || "KEYNOTE-355 (Cortes 2020)";
    } },
  { id: "todo|cisplatine-radiotherapie-puis-carboplatine-paclitaxel", quoi: "hydratation du cisplatine (J1, J22) ; phase 2 créée : « " + NOM_PORTEC3_2 + " »",
    garde: (p) => a(p, /CISPLATINE/) && !a(p, /HYDRATATION/),
    corriger: (p) => {
      remplacer(p, /SOLUMEDROL/, solu(60, [1, 22])); remplacer(p, /ONSET/, onset([1, 22])); hydrater(p, 1000, [1, 22]);
      p.no = (p.no || []).map((x) => (/^Apr[eè]s la radioth[ée]rapie/i.test(x) ? "Après la radiothérapie (3 semaines après la fin) : nouvelle ligne « " + NOM_PORTEC3_2 + " »" : x));
      p.src = p.src || "PORTEC-3 (de Boer 2018)";
    } },
  { id: "todo|bep", quoi: "bléomycine chiffrée (30 mg = 30 000 UI J1-J8-J15) ; Solumedrol 50 mg/j ; hydratation du cisplatine ; NIVESTIM J7 → J11",
    garde: (p) => a(p, /BLEOMYCINE/) && a(p, /BLEOMYCINE/).u === "txt",
    corriger: (p) => {
      remplacer(p, /BLEOMYCINE/, { p: "BLÉOMYCINE", u: "mg", d: 30, j: [1, 8, 15], n: "30 mg = 30 000 UI", v: "IV", s: "NaCl 0,9 % 100 ml", t: "15 min" });
      remplacer(p, /SOLUMEDROL/, solu(50, [1, 2, 3, 4, 5])); remplacer(p, /ONSET/, onset([1, 2, 3, 4, 5])); hydrater(p, 500, [1, 2, 3, 4, 5]);
      remplacer(p, /NIVESTIM/, niv(7, 11));
      p.no = (p.no || []).map((x) => (/^Bl[ée]omycine/i.test(x) ? "Bléomycine : dose cumulée maximale 400 000 UI (400 mg) ; DLCO avant la C1 ; arrêt si toux, crépitants ou baisse de la DLCO" : x));
      p.src = p.src || "Williams 1987";
    } },
  { id: "maj|ep-21-jours-cisplatine-75-etoposide-100-j1-j3-", quoi: "antiémétiques (ONSET, Solumedrol 60 mg) et hydratation du cisplatine ; rangé aussi en CBPC (maladie limitée, étendue)",
    garde: (p) => !a(p, /SOLUMEDROL|ONSET/) && !a(p, /HYDRATATION/),
    corriger: (p) => {
      p.dr.unshift(onset([1]), solu(60, [1])); hydrater(p, 1000, [1]);
      p.no = (p.no || []).filter((x) => !/non pr[ée]cis[ée]s dans le protocole transmis/i.test(x)).concat("Cisplatine : hydratation et surveillance de la fonction rénale, de la magnésémie et de l'audition");
      ajouterInd(p, [["Poumon / thorax", "CBPC", "Maladie limitée", ""], ["Poumon / thorax", "CBPC", "Maladie étendue", ""]]);
      p.src = p.src || "INT 0096 ; Turrisi 1999";
    } },
  { id: "poumon|Pemetrexed - cisplatine keytruda", quoi: "Solumedrol 50 mg J1-J3 ; hydratation du cisplatine ; corticoïde de la veille sur l'ordonnance « Chimio – Prémédication pémétrexed (ALIMTA) »",
    garde: (p) => !a(p, /SOLUMEDROL|METHYLPREDNISOLONE/) && !a(p, /HYDRATATION/),
    corriger: (p) => {
      const i = p.dr.findIndex((d) => /ONSET/.test(sa(d.p))); p.dr.splice(i + 1, 0, solu(50, [1, 2, 3])); hydrater(p, 500, [1, 2, 3]);
      p.no = (p.no || []).concat("Pémétrexed : corticoïde la veille (J-1), le jour et le lendemain à domicile : ordonnance « Chimio – Prémédication pémétrexed (ALIMTA) »");
      p.src = p.src || "Variante locale, dérivée de KEYNOTE-189";
    } },
  { id: "todo|map-cisplatine-doxorubicine-methotrexate-", quoi: "Solumedrol 50 mg/j ; hydratation du cisplatine ; hyperhydratation alcaline (J22, J29) ; NIVESTIM J4 → J8",
    garde: (p) => a(p, /METHOTREXATE/) && !a(p, /HYDRATATION/),
    corriger: (p) => {
      remplacer(p, /SOLUMEDROL/, solu(50, [1, 2])); remplacer(p, /ONSET/, onset([1, 2])); hydrater(p, 1000, [1, 2]);
      const i = p.dr.findIndex((d) => /METHOTREXATE/.test(sa(d.p)));
      p.dr.splice(i, 0, txt("HYPERHYDRATATION ALCALINE", "3 L/m²/24 h (G5 % + bicarbonate de sodium + KCl), de H-12 jusqu'à méthotrexatémie < 0,1 µmol/L ; pH urinaire > 7", [22, 29], "avant et après le méthotrexate", "IV"));
      const f = a(p, /FOLINIQUE/); if (f) f.jl = "À partir de H24 après chaque méthotrexate (J23, J30)";
      remplacer(p, /NIVESTIM/, niv(4, 8));
      p.no = (p.no || []).concat("Méthotrexatémie à H24, H48, H72 ; glucarpidase si élimination retardée ; pas d'AINS, d'IPP ni de cotrimoxazole");
      p.src = p.src || "EURAMOS-1 (Marina 2016)";
    } },
];

// Protocole lié de PORTEC-3 (phase 2), créé avec la correction de [197]
export function portec3Phase2() {
  return {
    id: PORTEC3_2, nom: NOM_PORTEC3_2, c: 21, st: "ok", r: "J1 tous les 21 jours × 4, à commencer 3 semaines après la fin de la radiothérapie",
    ind: [["Gynécologie", "Endomètre", "Adjuvant", ""]],
    dr: [onset([1]), solu(80, [1]), pola([1]),
      { p: "PACLITAXEL", u: "mg/m²", d: 175, j: [1], v: "IV", s: "NaCl 0,9 % 500 ml, filtre 0,22 µm", t: "3 h" },
      { p: "CARBOPLATINE", u: "AUC", d: 5, j: [1], v: "IV", s: "G5 % 250 ml", t: "30-60 min" }].map((d, i) => Object.assign({ id: "d" + i }, d)),
    no: ["Suite du protocole « Cisplatine 50 J1-J22 + Radiothérapie (PORTEC-3) »", "Carboplatine : créatinine du jour (Calvert, clairance plafonnée à 125 ml/min)"],
    src: "PORTEC-3 (de Boer 2018)",
  };
}

// Les 10 suppressions : vers = protocole gardé, qui reçoit d'abord les indications, les remarques et l'étoile du supprimé
export const SUPPRESSIONS = [
  { id: "todo|nivolumab-adjuvant", vers: "todo|nivolumab", pourquoi: "doublon" },
  { id: "maj|carboplatine-auc-5-gemcitabine-1000-j1-j8-21-j-poumon-", vers: "todo|carboplatine-gemcitabine", pourquoi: "doublon" },
  { id: "maj|nivolumab-3-mg-kg-ipilimumab-1-mg-kg-21-j-4-checkmate-214-", vers: "todo|nivolumab-ipilimumab", pourquoi: "doublon" },
  { id: "sein|hormono - Lefftara (letrozole)", vers: "sein|hormono - letrozole", pourquoi: "doublon (LEFFTARA = létrozole)" },
  { id: "sein|carboplatine pacltiaxel hebdo J1 J8 J 15", vers: "poumon|Paclitaxel - Carboplatine hebdomdaire", pourquoi: "doublon (Solumedrol 80 mg du protocole gardé, au lieu de 120 mg)" },
  { id: "sein|ibrance", vers: "sein|palbociclib (papillo)", pourquoi: "palier de dose du palbociclib 125 mg" },
  { id: "sein|hormono - ibrance 75 mg", vers: "sein|palbociclib (papillo)", pourquoi: "palier de dose du palbociclib 125 mg" },
  { id: "todo|cisplatine-trastuzumab-pertuzumab", pourquoi: "essai JACOB négatif (garder ToGA et KEYNOTE-811)" },
  { id: "sein|carboplatine hebdomadaire bevacizumab", pourquoi: "sans référence (bévacizumab validé dans le sein seulement avec le paclitaxel ou la capécitabine)" },
  { id: "sein|hormono - kisqali (ribociclib)", pourquoi: "ribociclib seul : toujours avec une hormonothérapie (protocoles associés)" },
];
export const NOTE_PALIERS = "Paliers de dose : 125 → 100 → 75 mg (changer la dose à la prescription)";

function ajouterInd(p, l) { p.ind = p.ind || []; l.forEach((x) => { if (!p.ind.some((y) => JSON.stringify(y) === JSON.stringify(x))) p.ind.push(x.slice()); }); }
function ajouterNo(p, l) { p.no = p.no || []; l.forEach((x) => { if (!/eviq/i.test(x) && p.no.indexOf(x) < 0) p.no.push(x); }); if (!p.no.length) delete p.no; }

// Calcul de toutes les corrections. bib = { id: protocole } (n'est pas modifiée). Rend { modifies: [{ p, quoi }], crees: [p],
// supprimes: [{ id, nom, vers, versNom, pourquoi }], ignores: [{ id, nom, raison }] }.
export function correctionsAudit3(bib) {
  const out = { modifies: [], crees: [], supprimes: [], ignores: [] }, mod = {};
  const prendre = (id) => mod[id] || (bib[id] ? (mod[id] = copie(bib[id])) : null);
  CRITIQUES.forEach((c) => {
    const p0 = bib[c.id];
    if (!p0) { out.ignores.push({ id: c.id, nom: "", raison: "absent de la bibliothèque" }); return; }
    if (!c.garde(p0)) { out.ignores.push({ id: c.id, nom: p0.nom, raison: "déjà modifié depuis l'audit" }); return; }
    const p = prendre(c.id); c.corriger(p); ids(p); out.modifies.push({ id: c.id, quoi: c.quoi });
    if (c.id === "todo|cisplatine-radiotherapie-puis-carboplatine-paclitaxel" && !bib[PORTEC3_2]) out.crees.push(portec3Phase2());
  });
  SUPPRESSIONS.forEach((s) => {
    const p0 = bib[s.id];
    if (!p0) { out.ignores.push({ id: s.id, nom: "", raison: "déjà supprimé" }); return; }
    if (s.vers) {
      const v = prendre(s.vers);
      if (!v) { out.ignores.push({ id: s.id, nom: p0.nom, raison: "protocole à garder introuvable : rien supprimé" }); return; }
      ajouterInd(v, p0.ind || []); ajouterNo(v, p0.no || []);
      if (/palbociclib|ibrance/i.test(p0.nom)) ajouterNo(v, [NOTE_PALIERS]);
      if (p0.fav) v.fav = 1;
      if (!out.modifies.some((m) => m.id === s.vers)) out.modifies.push({ id: s.vers, quoi: "indications et remarques des doublons reprises" });
    }
    out.supprimes.push({ id: s.id, nom: p0.nom, vers: s.vers || "", versNom: s.vers ? mod[s.vers].nom : "", pourquoi: s.pourquoi, fav: p0.fav ? 1 : 0 });
  });
  out.modifies.forEach((m) => { m.p = mod[m.id]; });
  return out;
}
