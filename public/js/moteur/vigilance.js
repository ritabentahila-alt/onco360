// Onco360 – vigilance par molécule (12/10/2026, demande de Dr Bentahila) : calculs purs, sans DOM ni Firebase
// (tests/moteur/test-vigilance.mjs). Repères usuels (résumés des caractéristiques des produits, recommandations) validés par
// Dr Bentahila : de simples notifications. Une fenêtre s'ouvre à la validation d'une séance si quelque chose cloche ; le médecin
// confirme (« Valider quand même ») ou revient en arrière. Rien n'est bloqué.
// Tout part de la séance à valider (molécules et doses de ses jours), du bilan du jour (facultatif) et des séances déjà validées
// du patient (toutes ses lignes : instantanés `fige`, 2.2) : dose cumulée, 1re dose d'une molécule, dernière FEVG ou TSH notée.
import { premed } from "./doses.js";
import { ecart } from "./outils.js";
import { motsAllergie } from "./statut.js";

const sa = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

// Familles de molécules (nom du produit sans accents, DCI ou marque)
export const MOL = {
  anthra: /DOXORUBICINE|ADRIAMYCINE|EPIRUBICINE|FARMORUBICINE|DAUNORUBICINE|IDARUBICINE/,
  her2: /TRASTUZUMAB|HERCEPTIN|PERTUZUMAB|PERJETA|KADCYLA|ENHERTU|PHESGO/,
  fluoro: /FLUORO|5-?FU\b|CAPECITABINE|XELODA/,
  irino: /IRINOTECAN|CAMPTO|ONIVYDE/,
  oxali: /OXALIPLATINE|ELOXATINE/,
  cispla: /CISPLATINE/,
  taxDoc: /DOCETAXEL|TAXOTERE|CABAZITAXEL|JEVTANA/,
  taxPac: /PACLITAXEL|TAXOL|ABRAXANE/,
  antiVegf: /BEVACIZUMAB|AVASTIN|YPEVA|MVASI|RAMUCIRUMAB|CYRAMZA|AFLIBERCEPT|ZALTRAP/,
  egfr: /CETUXIMAB|ERBITUX|PANITUMUMAB|VECTIBIX/,
  immuno: /PEMBROLIZUMAB|KEYTRUDA|PEMORIAL|NIVOLUMAB|OPDIVO|ATEZOLIZUMAB|TECENTRIQ|DURVALUMAB|IMFINZI|IPILIMUMAB|YERVOY|CEMIPLIMAB|LIBTAYO|DOSTARLIMAB|JEMPERLI|AVELUMAB|BAVENCIO|TREMELIMUMAB|IMJUDO|TISLELIZUMAB|TEVIMBRA/,
  vincri: /VINCRISTINE|ONCOVIN/,
  pemetrexed: /PEMETREXED|ALIMTA/,
  gem: /GEMCITABINE|GEMZAR/,
  cdk: /PALBOCICLIB|IBRANCE|RIBOCICLIB|KISQALI|ABEMACICLIB|VERZENIOS/,
  ribo: /RIBOCICLIB|KISQALI/,
  itk: /[A-Z]{3,}NIB\b|SUTENT|INLYTA|LENVIMA|CABOMETYX|TYKERB|VITRAKVI|MEKTOVI|MEKINIST|NEXAVAR|STIVARGA|VOTRIENT|GLIVEC|TARCEVA|IRESSA|TAGRISSO/,
  itkAngio: /SUNITINIB|SUTENT|AXITINIB|INLYTA|LENVATINIB|LENVIMA|CABOZANTINIB|CABOMETYX|SORAFENIB|NEXAVAR|REGORAFENIB|STIVARGA|PAZOPANIB|VOTRIENT/,
  os: /ZOLEDRON|ZOMETA|RANCLAST|ACLASTA|DENOSUMAB|XGEVA|PROLIA/,
  temozo: /TEMOZOLOMIDE|TEMODAL/,
  mito: /MITOMYCINE/,
  bleo: /BLEOMYCINE/,
  trabect: /TRABECTEDINE|YONDELIS/,
};
// Produits vésicants (mention sur la fiche de chimiothérapie et dans la séance)
export const VESICANTS = /DOXORUBICINE|ADRIAMYCINE|EPIRUBICINE|FARMORUBICINE|DAUNORUBICINE|IDARUBICINE|MITOXANTRONE|VINCRISTINE|VINBLASTINE|VINORELBINE|NAVELBINE|VINDESINE|MITOMYCINE|DACTINOMYCINE|TRABECTEDINE|YONDELIS/;
export const vesicant = (p) => VESICANTS.test(sa(p)) && !/LIPOSOM|PEGYL|CAELYX/.test(sa(p));

// Une molécule de la liste est-elle là ? (prémédications exclues, sauf os = acide zolédronique / dénosumab, rangés avec elles)
const anticancereux = (z) => z && z.u !== "txt" && !premed(z);
export function avec(prods, cle) {
  const re = MOL[cle];
  return (prods || []).some((z) => z && (cle === "os" || cle === "bleo" ? true : anticancereux(z)) && re.test(sa(z.p)));
}
const nomDe = (prods, cle) => ((prods || []).find((z) => z && MOL[cle].test(sa(z.p))) || {}).p || "";

// Séances validées du patient (toutes ses lignes), triées par date : { cle "ligne|cure|jour", d, doses, sc, bio }
export function historique(lignes, exclure) {
  const l = [];
  (lignes || []).forEach((L) => (L.cures || []).forEach((c, k) => {
    if (c.st === "recue" && c.fige) l.push({ cle: L.id + "|" + k + "|1", d: c.reelle || "", f: c.fige });
    Object.keys(c.sea || {}).forEach((j) => { const z = c.sea[j]; if (z && z.st === "recue" && z.fige) l.push({ cle: L.id + "|" + k + "|" + j, d: z.d || "", f: z.fige }); });
  }));
  return l.filter((s) => s.cle !== exclure).map((s) => ({ cle: s.cle, d: s.d, doses: Object.values(s.f.doses || {}), sc: s.f.sc, bio: s.f.bio || {} }))
    .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
}

// Doses cumulées (mg/m² : dose de chaque séance divisée par sa surface corporelle). Anthracyclines en équivalent doxorubicine
// S5 (21/10/2026, audit n° 10 d. 48, « selon la recommandation internationale ») : épirubicine × 0,8 (Feijen 2019, JAMA Oncology ; avant : 0,5
// du RCP), daunorubicine × 0,6 et mitoxantrone × 10,5 (Feijen 2019, repris par le groupe international IGHG en 2025) ; idarubicine non comptée
// (aucun rapport validé) ; doxorubicine liposomale pégylée (Caelyx) à part, non comptée.
export const CUMULS = [
  { id: "anthra", nom: "anthracyclines (équivalent doxorubicine)", seuil: 450, alerte: 0.8, mols: [[/DOXORUBICINE|ADRIAMYCINE/, 1], [/EPIRUBICINE|FARMORUBICINE/, 0.8], [/DAUNORUBICINE|CERUBIDINE/, 0.6], [/MITOXANTRONE|NOVANTRONE/, 10.5]], sauf: /LIPOSOM|PEGYL|CAELYX/,
    msg: "risque d'insuffisance cardiaque : FEVG à contrôler, poursuite à discuter (seuils habituels : doxorubicine 450 à 550 mg/m² ; équivalences : épirubicine × 0,8, daunorubicine × 0,6, mitoxantrone × 10,5)" },
  { id: "oxali", nom: "oxaliplatine", seuil: 850, alerte: 1, mols: [[MOL.oxali, 1]], msg: "neuropathie fréquente au-delà : vérifier le grade de la neuropathie avant de poursuivre" },
  // P3 (18/10/2026, audit n° 3) : bléomycine en mg (30 mg = 30 000 UI), pas par m² ; cisplatine (oreille, rein)
  { id: "bleo", nom: "bléomycine", seuil: 400, alerte: 0.8, u: "mg", mols: [[MOL.bleo, 1]], msg: "toxicité pulmonaire : DLCO, auscultation ; 400 mg = 400 000 UI" },
  { id: "cispla", nom: "cisplatine", seuil: 300, alerte: 1, mols: [[/^CISPLATINE/, 1]], msg: "ototoxicité et néphrotoxicité cumulatives : audiogramme, créatinine, magnésémie" },
];
const parM2 = (doses, sc, C) => (doses || []).reduce((t, z) => {
  if (!z || z.dose == null || !(sc > 0) || (C.sauf && C.sauf.test(sa(z.p)))) return t;
  const m = C.mols.find(([re]) => re.test(sa(z.p))); return m ? t + (C.u === "mg" ? z.dose : z.dose / sc) * m[1] : t;
}, 0);
export const de = (nom) => (/^[aeiouyhéèê]/i.test(nom) ? "d'" : "de ") + nom;
// o : { prods (doses de la séance), sc, histo, date } → [{ id, nom, avant, total, seuil, pct, C }] pour les familles de la séance
export function cumuls(o) {
  return CUMULS.filter((C) => parM2(o.prods, 1, C) > 0).map((C) => {
    const avant = (o.histo || []).filter((s) => !o.date || !s.d || s.d <= o.date).reduce((t, s) => t + parM2(s.doses, s.sc, C), 0);
    const total = Math.round(avant + parM2(o.prods, o.sc, C));
    return { id: C.id, nom: C.nom, avant: Math.round(avant), total, seuil: C.seuil, pct: Math.round((total / C.seuil) * 100), u: C.u || "mg/m²", C };
  });
}

// Bilan du jour élargi : examens facultatifs, proposés selon les molécules de la séance (les autres derrière « + autres examens »)
// [clé, libellé, unité (fonction de l'unité de la créatinine), aide, familles pour lesquelles l'examen est proposé]
export const EXAMENS = [
  ["bili", "Bilirubine", (crU) => (crU === "mgL" ? "mg/L" : "µmol/L"), "", ["taxDoc", "taxPac", "anthra", "irino", "immuno"]],
  ["asat", "ASAT", () => "UI/L", "", ["taxDoc", "immuno", "cdk", "itk"]],
  ["alat", "ALAT", () => "UI/L", "", ["taxDoc", "immuno", "cdk", "itk"]],
  ["mg", "Magnésium", () => "mmol/L", "ou mg/L", ["egfr", "cispla"]],
  ["ca", "Calcémie", () => "mmol/L", "ou mg/L", ["os"]],
  ["tsh", "TSH", () => "mUI/L", "", ["immuno", "itkAngio"]],
  ["fevg", "FEVG", () => "%", "", ["her2", "anthra"]],
  ["ta", "Tension artérielle", () => "mmHg", "ex. 130/80", ["antiVegf", "itkAngio"]],
  ["prot", "Protéinurie", () => "g/24 h", "ou ++", ["antiVegf"]],
  ["pal", "PAL", () => "UI/L", "", ["taxDoc", "trabect"]],
  ["cpk", "CPK", () => "UI/L", "", ["trabect"]],
  ["alb", "Albumine", () => "g/L", "", ["trabect"]], // S5 (21/10/2026) : trabectédine, albumine ≥ 25 g/L (RCP)
];
export const examensProposes = (prods) => EXAMENS.filter((x) => x[4].some((f) => avec(prods, f))).map((x) => x[0]);

// Valeurs normales (limite supérieure de la normale, LSN) et lecture des saisies
const LSN = { bili: (crU) => (crU === "mgL" ? 12 : 20), transa: 40 };
const mmol = (v, f) => (v == null ? null : v > 5 ? v / f : v); // magnésium (mg/L ÷ 24,3), calcium (mg/L ÷ 40,08)
export const lireTA = (t) => { const m = String(t || "").match(/(\d{2,3})\s*[\/-]\s*(\d{2,3})/); return m ? { s: +m[1], d: +m[2] } : null; };
export const lireProt = (t) => { const s = String(t || "").trim(); if (!s) return null; const c = (s.match(/\+/g) || []).length; if (c) return { croix: c };
  const v = parseFloat(s.replace(",", ".")); return isNaN(v) ? null : { g: v }; };
const fr = (v) => String(Math.round(v * 100) / 100).replace(".", ",");
// Valeur hors des normes (affichage en rouge dans le bilan du jour, sans fenêtre)
export function horsNorme(k, v, crU) {
  if (v == null || v === "") return false;
  if (k === "bili") return v > LSN.bili(crU);
  if (k === "asat" || k === "alat") return v > LSN.transa;
  if (k === "mg") return mmol(v, 24.3) < 0.7;
  if (k === "ca") { const c = mmol(v, 40.08); return c < 2.1 || c > 2.65; }
  if (k === "tsh") return v < 0.3 || v > 5;
  if (k === "fevg") return v < 50;
  if (k === "ta") { const t = lireTA(v); return !!t && (t.s >= 160 || t.d >= 100); }
  if (k === "prot") { const p = lireProt(v); return !!p && (p.croix >= 2 || p.g >= 2); }
  if (k === "pal") return v > 130;
  if (k === "cpk") return v > 200;
  return false;
}

// Radiothérapie en cours le jour de la séance : rts = [{ deb, fin (réelle ou prévue) }]
const rtEnCours = (rts, d) => (rts || []).find((r) => r && r.deb && r.deb <= d && (!r.fin || r.fin >= d));
const RADIOS = [["gem", "gemcitabine", "effet radiosensibilisant fort (mucite, œsophagite, pneumopathie) : dose adaptée à l'association ?"],
  ["fluoro", "5-FU / capécitabine", "potentialise la radiothérapie (peau, muqueuses, diarrhée) : schéma prévu pour l'association ?"],
  ["cispla", "cisplatine", "potentialise la radiothérapie : schéma prévu pour l'association (hebdomadaire ou toutes les 3 semaines) ?"],
  ["egfr", "cétuximab", "potentialise la radiothérapie (radiodermite sévère) : soins de peau ?"],
  ["temozo", "témozolomide", "avec la radiothérapie : prévention de la pneumocystose (cotrimoxazole) et NFS chaque semaine"],
  ["mito", "mitomycine", "potentialise la radiothérapie (toxicité cutanée et hématologique)"]];
const AVK = /WARFARIN|COUMADINE|ACENOCOUMAROL|SINTROM|FLUINDIONE|PREVISCAN|\bAVK\b/;

// Vigilances de la séance à valider. o = { prods [{ p, u, dose, v }] (doses des jours de la séance), n (0 = J1), k (cure, 0 = C1),
// sc, cl, creatSaisie, crU, bio (bilan du jour), histo (historique()), date, patient { sexe, age, texte (antécédents, traitements) },
// rts [{ deb, fin }] } → liste de messages (vide : rien à signaler)
export function vigilances(o) {
  const P = o.prods || [], H = o.histo || [], b = o.bio || {}, d = o.date || "", m = [], a = (cle) => avec(P, cle);
  const recu = (cle) => H.some((s) => avec(s.doses, cle)); // déjà reçu lors d'une séance validée
  const dernier = (k) => { if (b[k] != null && b[k] !== "") return { v: b[k], d }; for (let i = H.length - 1; i >= 0; i--) if (H[i].bio && H[i].bio[k] != null && H[i].bio[k] !== "") return { v: H[i].bio[k], d: H[i].d }; return null; };
  const avant = (k) => { for (let i = H.length - 1; i >= 0; i--) if (H[i].bio && H[i].bio[k] != null && H[i].bio[k] !== "") return { v: H[i].bio[k], d: H[i].d }; return null; };
  const dfr = (x) => (x ? x.slice(8, 10) + "/" + x.slice(5, 7) + "/" + x.slice(0, 4) : "");
  const lsnB = LSN.bili(o.crU), uB = o.crU === "mgL" ? " mg/L" : " µmol/L";

  // Allergie connue (« oui », 3.2) dont un mot est dans le nom d'un produit de la séance (prémédications comprises)
  if (o.patient && o.patient.allergie) { const mots = motsAllergie(o.patient.allergie);
    P.forEach((z) => { const w = z && mots.find((x) => sa(z.p).indexOf(x) >= 0); if (w && !m.some((t) => t.indexOf(z.p) >= 0)) m.push("allergie connue (" + o.patient.allergie + ") : " + z.p + " contient « " + w.toLowerCase() + " »."); }); }
  // 1er traitement du patient (aucune séance validée)
  if (!H.length) m.push("1er traitement : sérologie de l'hépatite B faite ? Pas de vaccin vivant pendant le traitement" +
    (o.patient && o.patient.sexe === "F" && o.patient.age >= 12 && o.patient.age <= 50 ? " ; test de grossesse ou contraception" : "") + ".");
  // Doses cumulées
  cumuls({ prods: P, sc: o.sc, histo: H, date: d }).forEach((c) => {
    if (c.total >= c.seuil) m.push("dose cumulée " + de(c.nom) + " : " + c.total + " " + c.u + " avec cette séance, seuil de " + c.seuil + " " + c.u + " atteint ou dépassé ; " + c.C.msg + ".");
    else if (c.total >= c.seuil * c.C.alerte) m.push("dose cumulée " + de(c.nom) + " : " + c.total + " " + c.u + " avec cette séance (" + c.pct + " % du seuil de " + c.seuil + " " + c.u + ") ; " + c.C.msg + ".");
  });
  // Cœur : FEVG (anti-HER2, anthracyclines)
  const fevg = dernier("fevg"), fevgAv = avant("fevg");
  if (a("anthra") && !recu("anthra") && !fevg) m.push("1re anthracycline : FEVG (échographie cardiaque) non notée, à faire avant de commencer.");
  if (a("her2")) {
    if (!fevg) m.push(nomDe(P, "her2") + " : FEVG non notée (à contrôler avant de commencer puis tous les 3 mois).");
    else if (d && ecart(d, fevg.d) > 92) m.push(nomDe(P, "her2") + " : dernière FEVG notée le " + dfr(fevg.d) + " (plus de 3 mois) : à contrôler.");
  }
  if ((a("her2") || a("anthra")) && b.fevg != null && b.fevg !== "") {
    if (b.fevg < 50) m.push("FEVG à " + b.fevg + " % (moins de 50 %) : traitement cardiotoxique à discuter (pause du trastuzumab, avis cardiologique).");
    if (fevgAv && fevgAv.v - b.fevg >= 10) m.push("FEVG en baisse de " + (fevgAv.v - b.fevg) + " points (" + fevgAv.v + " % le " + dfr(fevgAv.d) + " → " + b.fevg + " %).");
  }
  // Fluoropyrimidines : déficit en DPD, AVK
  if (a("fluoro") && !recu("fluoro")) m.push("1re dose de 5-FU / capécitabine : uracilémie (dépistage du déficit en DPD) faite ? Un déficit expose à une toxicité grave, parfois mortelle.");
  if (a("fluoro") && o.patient && AVK.test(sa(o.patient.texte))) m.push("5-FU / capécitabine avec un anticoagulant AVK (antécédents ou traitement en cours) : INR à surveiller de près.");
  // Foie
  const transa = Math.max(b.asat || 0, b.alat || 0);
  if (a("taxDoc") && ((b.bili != null && b.bili > lsnB) || transa > 1.5 * LSN.transa)) m.push(nomDe(P, "taxDoc") + " : bilirubine au-dessus de la normale ou transaminases > 1,5 × la normale : contre-indiqué ou dose à réduire (RCP).");
  if (a("taxPac") && b.bili != null && b.bili > 1.25 * lsnB) m.push(nomDe(P, "taxPac") + " : bilirubine à " + fr(b.bili) + uB + " (> 1,25 × la normale) : dose à réduire.");
  if (a("anthra") && b.bili != null && b.bili > lsnB) m.push(nomDe(P, "anthra") + " : bilirubine à " + fr(b.bili) + uB + " : dose réduite à 50 %" + (b.bili > (o.crU === "mgL" ? 30 : 51) ? ", à 25 % au-delà de 30 mg/L (51 µmol/L)" : " (25 % au-delà de 30 mg/L, 51 µmol/L)") + ".");
  if (a("irino") && b.bili != null && b.bili > 1.5 * lsnB) m.push(nomDe(P, "irino") + " : bilirubine à " + fr(b.bili) + uB + " (> 1,5 × la normale) : dose à réduire, contre-indiqué au-delà de 3 × la normale.");
  if (a("immuno") && (transa > 3 * LSN.transa || (b.bili != null && b.bili > 1.5 * lsnB))) m.push(nomDe(P, "immuno") + " : transaminases > 3 × la normale ou bilirubine > 1,5 × la normale : hépatite immunologique ?");
  // Thyroïde (immunothérapie, iTK anti-angiogéniques)
  if (a("immuno") || a("itkAngio")) {
    const nm = nomDe(P, a("immuno") ? "immuno" : "itkAngio"), t = dernier("tsh");
    if (b.tsh != null && b.tsh !== "" && (b.tsh < 0.3 || b.tsh > 5)) m.push(nm + " : TSH à " + fr(b.tsh) + " mUI/L (hors de 0,3 à 5) : dysthyroïdie ?");
    if (!t) m.push(nm + " : TSH jamais notée (à contrôler avant de commencer puis toutes les 6 semaines environ).");
    else if (d && ecart(d, t.d) > 42) m.push(nm + " : dernière TSH notée le " + dfr(t.d) + " (plus de 6 semaines) : à contrôler.");
  }
  // iTK : fonction rénale (décision du 12/10/2026)
  if (a("itk") && !o.creatSaisie) m.push(nomDe(P, "itk") + " : DFG à contrôler (créatinine du jour non saisie).");
  // Tension artérielle et protéinurie (anti-VEGF, iTK anti-angiogéniques)
  if (a("antiVegf") || a("itkAngio")) {
    const nm = nomDe(P, a("antiVegf") ? "antiVegf" : "itkAngio"), t = lireTA(b.ta), p = lireProt(b.prot);
    if (t && (t.s >= 160 || t.d >= 100)) m.push(nm + " : tension artérielle à " + t.s + "/" + t.d + " mmHg (≥ 160/100) : HTA à équilibrer avant la cure.");
    if (a("antiVegf")) {
      const manque = [!t ? "tension artérielle" : "", !p ? "protéinurie" : ""].filter(Boolean);
      if (manque.length) m.push(nm + " : " + manque.join(" et ") + " non notée" + (manque.length > 1 ? "s" : "") + " dans le bilan du jour (à contrôler avant chaque cure).");
      if (p && p.g >= 2) m.push(nm + " : protéinurie à " + fr(p.g) + " g/24 h (≥ 2 g) : traitement habituellement suspendu.");
      if (p && p.croix >= 2) m.push(nm + " : protéinurie à " + "+".repeat(p.croix) + " à la bandelette : protéinurie des 24 heures à faire (suspendre si ≥ 2 g/24 h).");
      if (!recu("antiVegf")) m.push("1re dose de " + nm + " : pas de chirurgie dans les 28 jours avant ni après, cicatrisation complète ?");
    }
  }
  // Magnésium (anti-EGFR, cisplatine)
  if ((a("egfr") || a("cispla")) && b.mg != null && b.mg !== "" && mmol(b.mg, 24.3) < 0.7) m.push(nomDe(P, a("egfr") ? "egfr" : "cispla") + " : magnésium bas (" + fr(b.mg) + (b.mg > 5 ? " mg/L" : " mmol/L") + ") : à supplémenter.");
  if (a("egfr") && !recu("egfr")) m.push("1re dose d'anti-EGFR (" + nomDe(P, "egfr") + ") : statut RAS non muté vérifié (cancer colorectal) ?");
  // Os : acide zolédronique, dénosumab
  if (a("os")) {
    const nm = nomDe(P, "os");
    if (b.ca != null && b.ca !== "" && mmol(b.ca, 40.08) < 2.1) m.push(nm + " : calcémie basse (" + fr(b.ca) + (b.ca > 5 ? " mg/L" : " mmol/L") + ") : hypocalcémie à corriger avant l'injection.");
    if (!recu("os")) m.push("1re dose de " + nm + " : bilan dentaire fait (ostéonécrose de la mâchoire) ? Calcium et vitamine D prescrits ?");
  }
  // Pémétrexed
  if (a("pemetrexed")) {
    if (!recu("pemetrexed")) m.push("1re dose de pémétrexed : acide folique (au moins 7 jours avant) et vitamine B12 débutés ?");
    else if (o.n === 0 && o.k > 0 && o.k % 3 === 0) m.push("pémétrexed : injection de vitamine B12 à refaire (toutes les 9 semaines).");
    if (o.cl != null && o.cl < 80) m.push("pémétrexed avec une clairance de " + o.cl + " ml/min (moins de 80) : éviter les anti-inflammatoires (AINS) autour de la perfusion.");
  }
  // Inhibiteurs de CDK4/6
  if (a("cdk") && o.n === 0 && o.k <= 1) m.push(nomDe(P, "cdk") + " (C" + (o.k + 1) + ") : NFS à J15 prévue ?" + (a("ribo") && o.k === 0 ? " Ribociclib : ECG (QT) à J14." : ""));
  // Irinotécan
  if (a("irino") && !recu("irino")) m.push("1re dose d'irinotécan : lopéramide remis au patient (diarrhée tardive) ; atropine si syndrome cholinergique.");
  // Bléomycine
  if (a("bleo") && !recu("bleo")) m.push("1re dose de bléomycine : EFR / DLCO faites ? Dose cumulée maximale 400 000 UI.");
  // Vincristine : plafond de 2 mg
  P.forEach((z) => { if (z && z.dose != null && MOL.vincri.test(sa(z.p)) && z.dose > 2) m.push(z.p + " : " + fr(z.dose) + " mg (plafond habituel 2 mg par injection)."); });
  // Radiothérapie en cours : molécules qui la potentialisent (une fois par radiothérapie)
  const rt = d && rtEnCours(o.rts, d);
  if (rt) RADIOS.forEach(([cle, nom, txt]) => {
    if (!a(cle)) return;
    if (H.some((s) => s.d >= rt.deb && s.d <= d && avec(s.doses, cle))) return;
    m.push("radiothérapie en cours (depuis le " + dfr(rt.deb) + ") : " + nom + " " + txt);
  });
  return m;
}

// Notes « À vérifier » par molécule (Paramètres › Listes et bibliothèques › Vigilance des molécules) : modifiables par le médecin
// (parametres/vigilances { data: JSON [{ id, nom, mots, txt }] }) ; absentes = cette liste de départ. mots : noms (DCI, marques)
// séparés par des virgules, cherchés dans le nom du produit.
export const VIG0 = [
  { id: "v1", nom: "Anthracyclines", mots: "DOXORUBICINE, ADRIAMYCINE, EPIRUBICINE, FARMORUBICINE", txt: "Dose cumulée (doxorubicine 450 à 550 mg/m², épirubicine 900 mg/m²). FEVG avant de commencer. Dose réduite si la bilirubine est élevée. Produit vésicant : voie veineuse sûre." },
  { id: "v2", nom: "Anti-HER2", mots: "TRASTUZUMAB, HERCEPTIN, PERTUZUMAB, PERJETA, KADCYLA, ENHERTU, PHESGO", txt: "FEVG avant de commencer puis tous les 3 mois ; pause si baisse de 10 points ou plus sous 50 %. Enhertu : pneumopathie interstitielle (toux, essoufflement)." },
  { id: "v3", nom: "5-FU / capécitabine", mots: "FLUORO, 5-FU, CAPECITABINE, XELODA", txt: "Uracilémie (déficit en DPD) avant la 1re dose. Interaction avec les AVK (INR). Syndrome main-pied, diarrhée, mucite." },
  { id: "v4", nom: "Taxanes", mots: "PACLITAXEL, TAXOL, DOCETAXEL, TAXOTERE, CABAZITAXEL", txt: "Prémédication (corticoïdes ; anti-H1 et anti-H2 pour le paclitaxel). Neuropathie. Bilan hépatique. Docétaxel : rétention d'eau." },
  { id: "v5", nom: "Immunothérapie", mots: "PEMBROLIZUMAB, KEYTRUDA, NIVOLUMAB, OPDIVO, ATEZOLIZUMAB, TECENTRIQ, DURVALUMAB, IMFINZI, IPILIMUMAB, YERVOY, CEMIPLIMAB, DOSTARLIMAB, AVELUMAB, TREMELIMUMAB, TISLELIZUMAB", txt: "Avant chaque cure : TSH, bilan hépatique, créatinine, glycémie ; cortisol si fatigue. Toxicités immunitaires possibles même après l'arrêt (diarrhée, toux, éruption) : carte patient." },
  { id: "v6", nom: "Anti-VEGF", mots: "BEVACIZUMAB, AVASTIN, YPEVA, RAMUCIRUMAB, CYRAMZA, AFLIBERCEPT", txt: "Tension artérielle et protéinurie avant chaque cure. Pas de chirurgie dans les 28 jours avant ou après. Risque de perforation digestive et d'hémorragie." },
  { id: "v7", nom: "Gemcitabine", mots: "GEMCITABINE", txt: "Fort effet radiosensibilisant pendant une radiothérapie. Toxicité pulmonaire ; syndrome hémolytique et urémique (rare)." },
  { id: "v8", nom: "Oxaliplatine", mots: "OXALIPLATINE", txt: "Neuropathie cumulative (vers 850 mg/m²), aggravée par le froid. Allergie possible après plusieurs cures." },
  { id: "v9", nom: "Cisplatine", mots: "CISPLATINE", txt: "Hydratation, magnésium et potassium. Audiogramme si symptômes. Fonction rénale avant chaque cure." },
  { id: "v10", nom: "Irinotécan", mots: "IRINOTECAN, CAMPTO, ONIVYDE", txt: "Diarrhée tardive : lopéramide remis au patient. Syndrome cholinergique : atropine. Bilirubine. UGT1A1 si disponible." },
  { id: "v11", nom: "Vinca-alcaloïdes", mots: "VINCRISTINE, VINORELBINE, NAVELBINE, VINBLASTINE, ERIBULINE", txt: "Vincristine : 2 mg au plus par injection, JAMAIS en intrathécal. Produits vésicants. Constipation, neuropathie." },
  { id: "v12", nom: "Pémétrexed", mots: "PEMETREXED, ALIMTA", txt: "Acide folique (7 jours avant) et vitamine B12 (toutes les 9 semaines). Dexaméthasone. Pas d'AINS si clairance < 80 ml/min." },
  { id: "v13", nom: "Anti-EGFR", mots: "CETUXIMAB, ERBITUX, PANITUMUMAB, VECTIBIX", txt: "Statut RAS non muté (côlon). Magnésium. Toxicité cutanée (cyclines préventives). Réaction à la perfusion (cétuximab)." },
  { id: "v14", nom: "Inhibiteurs de CDK4/6", mots: "PALBOCICLIB, IBRANCE, RIBOCICLIB, KISQALI, ABEMACICLIB, VERZENIOS", txt: "NFS à J1 et J15 des 2 premiers cycles. Bilan hépatique. Ribociclib : ECG (QT) à J14 de C1. Abémaciclib : diarrhée." },
  { id: "v15", nom: "Inhibiteurs de tyrosine kinase", mots: "TINIB, FENIB, PANIB, SUTENT, INLYTA, LENVIMA, CABOMETYX, TYKERB", txt: "Tension artérielle, TSH, QT, fonction rénale (DFG). Nombreuses interactions (CYP3A4) ; éviter le pamplemousse." },
  { id: "v16", nom: "Acide zolédronique / dénosumab", mots: "ZOLEDRON, ZOMETA, RANCLAST, DENOSUMAB, XGEVA", txt: "Bilan dentaire avant la 1re dose (ostéonécrose de la mâchoire). Calcémie ; calcium et vitamine D. Acide zolédronique : fonction rénale." },
  { id: "v17", nom: "Témozolomide", mots: "TEMOZOLOMIDE, TEMODAL", txt: "Avec la radiothérapie : prévention de la pneumocystose (cotrimoxazole) et NFS chaque semaine. Lymphopénie." },
  { id: "v18", nom: "Mitomycine", mots: "MITOMYCINE", txt: "Produit vésicant. Syndrome hémolytique et urémique, toxicité pulmonaire (dose cumulée)." },
  { id: "v19", nom: "Bléomycine", mots: "BLEOMYCINE", txt: "Dose cumulée maximale 400 000 UI. EFR / DLCO avant de commencer. Pas d'oxygène à forte concentration." },
  { id: "v20", nom: "Méthotrexate", mots: "METHOTREXATE", txt: "Haute dose : hydratation alcaline, dosages sanguins, acide folinique. Interactions : IPP, AINS, cotrimoxazole." },
  { id: "v21", nom: "Ifosfamide / cyclophosphamide", mots: "IFOSFAMIDE, HOLOXAN, CYCLOPHOSPHAMIDE, ENDOXAN", txt: "MESNA (ifosfamide, cyclophosphamide à forte dose). Hydratation. Ifosfamide : encéphalopathie (bleu de méthylène)." },
];
// Notes qui concernent les produits de la séance (prémédications comprises pour l'acide zolédronique et le dénosumab)
// Audit n° 3 (18/10/2026) : seuils du jour ajoutés aux notes (AJOUTS_VIG3 : texte ajouté à une famille existante) et familles nouvelles
// (NOUVELLES_VIG3) ; appliqués à VIG0 ci-dessous et, une fois, à la liste déjà enregistrée par un cabinet (vigilances.js vigilancesAudit3)
export const AJOUTS_VIG3 = {
  v3: "Mucite ou diarrhée de grade ≥ 2 → report. Capécitabine : DFG 30-50 ml/min → 75 % ; < 30 contre-indiquée. Acide folinique : doses de la bibliothèque en folinate de calcium racémique ; lévofolinate (Elvorine) = moitié de la dose.",
  v4: "Docétaxel : bilirubine ≤ normale ; ne pas faire si ASAT/ALAT > 1,5 × N avec PAL > 2,5 × N. Paclitaxel : bilirubine ≤ 1,5 × N ; neuropathie de grade ≥ 2 → réduire. Cabazitaxel : bilirubine ≤ normale, PNN ≥ 1,5 G/L.",
  v5: "TSH, transaminases, créatinine, glycémie avant chaque cure ; toxicité immunologique de grade ≥ 2 → suspendre. Ipilimumab : cortisol ; colite de grade ≥ 2 → arrêt.",
  v6: "TA < 160/100 ; protéinurie < 2 g/24 h (bandelette < 2+) ; pas de chirurgie < 28 jours.",
  v7: "J8 / J15 : PNN ≥ 1,0 et plaquettes ≥ 100 → 100 % ; PNN 0,5-1,0 ou plaquettes 50-100 → 75 % ; en dessous, séance non faite.",
  v9: "DFG ≥ 60 ml/min (45-59 : réduire ou carboplatine) ; magnésémie et audition avant chaque cure.",
  v10: "Bilirubine ≤ 1,5 × N ; pas de diarrhée en cours ; génotype UGT1A1*28 si toxicité. Irinotécan liposomal : bilirubine ≤ normale, PNN ≥ 1,5 G/L.",
  v11: "Vinorelbine : PNN ≥ 1,5 G/L (J8 : ≥ 1,0).",
  v12: "DFG ≥ 45 ml/min.",
  v13: "Éruption de grade 3 → report.",
  v20: "DFG ≥ 60 ml/min ; pas d'épanchement (3e secteur).",
  v21: "Ifosfamide : DFG ≥ 60 ml/min, pas d'hématurie ; encéphalopathie → arrêt.",
};
export const NOUVELLES_VIG3 = [
  { id: "v22", nom: "Trabectédine", mots: "TRABECTEDINE, YONDELIS", txt: "PNN ≥ 1,5, plaquettes ≥ 100, bilirubine ≤ normale, PAL ≤ 2,5 × N, ASAT/ALAT ≤ 2,5 × N, CPK ≤ 2,5 × N. Voie centrale. Prémédication : Solumedrol 100 mg." },
  { id: "v23", nom: "Topotécan", mots: "TOPOTECAN, HYCAMTIN", txt: "PNN ≥ 1,5 G/L, plaquettes ≥ 100 G/L, hémoglobine ≥ 9 g/dL." },
  { id: "v24", nom: "Trastuzumab déruxtécan", mots: "DERUXTECAN, ENHERTU", txt: "PNN ≥ 1,5, plaquettes ≥ 100 ; toute pneumopathie interstitielle → arrêt et scanner ; FEVG. Risque émétique modéré haut." },
  { id: "v25", nom: "Enfortumab védotin", mots: "ENFORTUMAB, PADCEV", txt: "Glycémie < 2,5 g/L ; éruption ou neuropathie de grade ≥ 2 → suspendre." },
];
export function vigAudit3(L) {
  let n = 0; const out = L.map((v) => { const a = AJOUTS_VIG3[v.id]; if (a && String(v.txt || "").indexOf(a) < 0) { n++; return Object.assign({}, v, { txt: (v.txt ? v.txt + " " : "") + a }); } return v; });
  NOUVELLES_VIG3.forEach((v) => { if (!out.some((x) => x.id === v.id || x.nom === v.nom)) { out.push(Object.assign({}, v)); n++; } });
  return { liste: out, n };
}
VIG0.splice(0, VIG0.length, ...vigAudit3(VIG0).liste);
export function notesPour(prods, notes) {
  const noms = (prods || []).filter((z) => z && z.u !== "txt").map((z) => sa(z.p));
  return (notes || []).filter((N) => N && N.txt && String(N.mots || "").split(",").map((w) => sa(w).trim()).filter(Boolean).some((w) => noms.some((n) => n.indexOf(w) >= 0)));
}
