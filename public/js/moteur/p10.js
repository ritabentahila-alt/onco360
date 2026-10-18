// Onco360 – P10 (audit n° 3, 18/10/2026) : interactions médicamenteuses, adaptation hépatique par molécule, arrondi au flacon.
// Calcul pur, sans DOM ni Firebase. Rien n'est bloquant : les messages vont dans la fenêtre « Valider quand même ? » et l'encart Vigilance.

const sa = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const fr = (v) => String(Math.round(v * 100) / 100).replace(".", ",");

// ───── i) Interactions : molécules de la séance (ou du protocole) × traitements en cours / antécédents de la fiche × ordonnances liées
const IPP = /OMEPRAZOLE|ESOMEPRAZOLE|PANTOPRAZOLE|LANSOPRAZOLE|RABEPRAZOLE|MOPRAL|INEXIUM|OEDES|EUPANTOL|INIPOMP|LANZOR|OGAST|PARIET|\bIPP\b|RANITIDINE|FAMOTIDINE|ANTI-H2/;
const INDUCTEURS = /RIFAMPICINE|RIFADINE|CARBAMAZEPINE|TEGRETOL|PHENYTOINE|DI-HYDAN|PHENOBARBITAL|GARDENAL|MILLEPERTUIS|EFAVIRENZ|OXCARBAZEPINE/;
const INHIBITEURS = /KETOCONAZOLE|ITRACONAZOLE|VORICONAZOLE|POSACONAZOLE|CLARITHROMYCINE|ERYTHROMYCINE|RITONAVIR|COBICISTAT|JUS DE PAMPLEMOUSSE/;
const AVK = /WARFARIN|COUMADINE|ACENOCOUMAROL|SINTROM|FLUINDIONE|PREVISCAN|\bAVK\b/;
const CONTRACEPTIF = /CONTRACEPTI|PILULE|ETHINYLESTRADIOL|LEVONORGESTREL|DESOGESTREL/;
const AINS = /\bAINS\b|IBUPROFENE|ADVIL|KETOPROFENE|PROFENID|DICLOFENAC|VOLTARENE|NAPROXENE|CELECOXIB|ASPIRINE|ACIDE ACETYLSALICYLIQUE|INDOMETACINE|PIROXICAM/;
const COTRIM = /COTRIMOXAZOLE|BACTRIM|SULFAMETHOXAZOLE|TRIMETHOPRIME/;
const QT_AUTRES = /AMIODARONE|CORDARONE|SOTALOL|CITALOPRAM|ESCITALOPRAM|SEROPLEX|HALOPERIDOL|METHADONE|DOMPERIDONE|MOTILIUM|AZITHROMYCINE|CLARITHROMYCINE|LEVOFLOXACINE|MOXIFLOXACINE|HYDROXYCHLOROQUINE|PLAQUENIL|ONDANSETRON|ZOPHREN|ONSET|CHEMOSET/;
const TKI = /[A-Z]{3,}NIB\b|SUTENT|INLYTA|LENVIMA|CABOMETYX|TYKERB|NEXAVAR|STIVARGA|VOTRIENT|GLIVEC|TARCEVA|IRESSA|TAGRISSO|GIOTRIF|XALKORI|ALECENSA|KISQALI|IBRANCE|VERZENIOS|LYNPARZA/;
const TKI_PH = /ERLOTINIB|TARCEVA|GEFITINIB|IRESSA|PAZOPANIB|VOTRIENT|DASATINIB|LAPATINIB|TYKERB|NILOTINIB|BOSUTINIB|CAPECITABINE|XELODA/; // absorption diminuée par les IPP / anti-H2
const QT_TKI = /RIBOCICLIB|KISQALI|VANDETANIB|NILOTINIB|LAPATINIB|SUNITINIB|SUTENT|CRIZOTINIB|XALKORI|OSIMERTINIB|TAGRISSO|VEMURAFENIB|ENCORAFENIB|LENVATINIB|ARSENIC/;
const MTX = /METHOTREXATE/;
export function interactions(o) {
  const m = [], P = (o.prods || []).map((z) => sa(typeof z === "string" ? z : z.p)), a = (re) => P.some((p) => re.test(p)), T = sa(o.texte || "");
  const nom = (re) => (o.prods || []).map((z) => (typeof z === "string" ? z : z.p)).find((p) => re.test(sa(p))) || "";
  const emend = (o.ordos || []).some((x) => /EMEND|risque émétique élevé|AC \(/i.test(x)) || a(/APREPITANT|EMEND/);
  if (emend && AVK.test(T)) m.push("Interaction : aprépitant (EMEND) et AVK : effet de l'AVK diminué ; INR à contrôler dans les 7 à 10 jours qui suivent chaque cure.");
  if (emend && CONTRACEPTIF.test(T)) m.push("Interaction : aprépitant (EMEND) et contraception hormonale : efficacité diminuée jusqu'à 28 jours après ; contraception non hormonale associée.");
  if (a(TKI_PH) && IPP.test(T)) m.push("Interaction : " + nom(TKI_PH) + " et IPP / anti-H2 (traitement en cours) : absorption diminuée ; éviter l'association ou espacer les prises (RCP).");
  if (a(TKI) && INDUCTEURS.test(T)) m.push("Interaction : " + nom(TKI) + " et inducteur enzymatique (rifampicine, carbamazépine, phénytoïne, millepertuis…) : concentration diminuée, efficacité réduite.");
  if (a(TKI) && INHIBITEURS.test(T)) m.push("Interaction : " + nom(TKI) + " et inhibiteur du CYP3A4 (azolés, clarithromycine, ritonavir…) : concentration augmentée, toxicité ; dose à adapter (RCP).");
  if (a(MTX) && (AINS.test(T) || IPP.test(T) || COTRIM.test(T))) m.push("Interaction : méthotrexate et " + [AINS.test(T) ? "AINS / aspirine" : "", IPP.test(T) ? "IPP" : "", COTRIM.test(T) ? "cotrimoxazole" : ""].filter(Boolean).join(", ") + " : élimination du méthotrexate diminuée (toxicité grave) ; à arrêter autour du méthotrexate.");
  if (a(QT_TKI) && (a(/ONDANSETRON|ONSET|ZOPHREN|GRANISETRON|PALONOSETRON/) || QT_AUTRES.test(T))) m.push("Interaction : " + nom(QT_TKI) + " allonge le QT, avec " + (a(/ONDANSETRON|ONSET|ZOPHREN|GRANISETRON|PALONOSETRON/) ? "un sétron" : "un autre médicament qui allonge le QT") + " : ECG, kaliémie et magnésémie.");
  if (a(/CAPECITABINE|XELODA|FLUORO|5-?FU\b/) && /PHENYTOINE|DI-HYDAN/.test(T)) m.push("Interaction : 5-FU / capécitabine et phénytoïne : phénytoïnémie augmentée (surveillance).");
  return m;
}

// ───── j) Adaptation hépatique (en plus de la vigilance déjà en place : docétaxel, paclitaxel, anthracyclines, irinotécan, immunothérapie,
// cabazitaxel, trabectédine) : bilirubine, ASAT / ALAT du bilan du jour → réduction proposée (RCP), jamais bloquant
const LSN = { bili: (crU) => (crU === "mgL" ? 12 : 20), transa: 40 };
export const FOIE = [
  { re: /VINCRISTINE|ONCOVIN|VINBLASTINE|VINORELBINE|NAVELBINE|VINDESINE|ERIBULINE|HALAVEN/, fam: "vinca", r: (b, x) => (x.bili > 3 * x.lsn ? "dose à 50 % au moins, ou à suspendre (bilirubine > 3 × N)" : x.bili > 1.5 * x.lsn ? "dose à 50 % (bilirubine 1,5 à 3 × N)" : null) },
  { re: /ETOPOSIDE|VEPESIDE/, fam: "etopo", r: (b, x) => (x.bili > 3 * x.lsn ? "dose à réduire de 50 % (bilirubine > 3 × N)" : x.bili > 1.5 * x.lsn ? "dose à réduire (bilirubine 1,5 à 3 × N)" : null) },
  { re: /GEMCITABINE|GEMZAR/, fam: "gem", r: (b, x) => (x.bili > 1.5 * x.lsn ? "commencer à 800 mg/m², puis augmenter selon la tolérance (bilirubine > 1,5 × N)" : null) },
  { re: /CAPECITABINE|XELODA/, fam: "cape", r: (b, x) => (x.bili > 3 * x.lsn || x.transa > 2.5 * LSN.transa ? "à interrompre jusqu'à bilirubine ≤ 3 × N et transaminases ≤ 2,5 × N (RCP)" : null) },
  { re: /SORAFENIB|NEXAVAR|SUNITINIB|SUTENT|PAZOPANIB|VOTRIENT|REGORAFENIB|STIVARGA|LAPATINIB|TYKERB|IMATINIB|GLIVEC|CABOZANTINIB|CABOMETYX|LENVATINIB|LENVIMA|ERLOTINIB|TARCEVA|GEFITINIB|IRESSA|OSIMERTINIB|TAGRISSO|AFATINIB|GIOTRIF|RIBOCICLIB|KISQALI|ABEMACICLIB|VERZENIOS|PALBOCICLIB|IBRANCE|OLAPARIB|LYNPARZA/, fam: "itk",
    r: (b, x) => (x.transa > 5 * LSN.transa || x.bili > 3 * x.lsn ? "à suspendre (transaminases > 5 × N ou bilirubine > 3 × N), reprise à dose réduite (RCP)" : x.transa > 3 * LSN.transa ? "transaminases > 3 × N : interrompre ou réduire la dose (RCP)" : null) },
  { re: /CYCLOPHOSPHAMIDE|ENDOXAN|IFOSFAMIDE|HOLOXAN/, fam: "oxaza", r: (b, x) => (x.bili > 3 * x.lsn ? "insuffisance hépatique sévère : dose à réduire de 25 % (activation hépatique)" : null) },
];
export function foie(o) {
  const b = o.bio || {}, bili = b.bili != null && b.bili !== "" ? +b.bili : null, transa = Math.max(+b.asat || 0, +b.alat || 0);
  if (bili == null && !transa) return [];
  const x = { bili: bili || 0, transa, lsn: LSN.bili(o.crU) }, m = [], vu = new Set();
  (o.prods || []).forEach((z) => { const p = sa(z.p); FOIE.forEach((F) => { if (vu.has(F.fam) || !F.re.test(p)) return; const r = F.r(b, x); if (r) { vu.add(F.fam); m.push("Foie – " + z.p + " : " + r + "."); } }); });
  return m;
}

// ───── k) Arrondi au flacon (dose banding) : dose arrondie au multiple du plus petit flacon, proposée si l'écart reste dans la marge
// (5 % par défaut) ; le médecin choisit (rien n'est appliqué tout seul). Tailles des flacons (mg) réglables par le cabinet
// (Paramètres › Bibliothèques › Flacons : parametres/flacons { data: JSON { "MOLÉCULE": [tailles] } }).
export const FLACONS0 = {
  CARBOPLATINE: [50, 150, 450], CISPLATINE: [10, 50, 100], OXALIPLATINE: [50, 100, 200], PACLITAXEL: [30, 100, 300], DOCETAXEL: [20, 80, 160],
  DOXORUBICINE: [10, 50], EPIRUBICINE: [10, 50], GEMCITABINE: [200, 1000], IRINOTECAN: [40, 100, 300], "5-FU": [250, 500, 1000, 5000], FLUORO: [250, 500, 1000, 5000],
  CYCLOPHOSPHAMIDE: [500, 1000], ETOPOSIDE: [100], PEMETREXED: [100, 500], VINORELBINE: [10, 50], TRASTUZUMAB: [150, 440], HERCEPTIN: [150, 440],
  BEVACIZUMAB: [100, 400], CETUXIMAB: [100, 500], ERBITUX: [100, 500], NIVOLUMAB: [40, 100, 240], CABAZITAXEL: [60], IFOSFAMIDE: [1000, 2000], TOPOTECAN: [1, 4],
};
export const MARGE_FLACON = 0.05;
export function flaconsDe(p, table) {
  const T = table || FLACONS0, n = sa(p);
  const k = Object.keys(T).filter((m) => n.indexOf(sa(m)) >= 0).sort((a, b) => b.length - a.length)[0];
  return k ? T[k].slice().sort((a, b) => a - b) : null;
}
export function arrondiFlacon(p, dose, table, marge) {
  const f = flaconsDe(p, table); if (!f || !(dose > 0)) return null;
  const pas = f[0], ar = Math.round(dose / pas) * pas, ec = (ar - dose) / dose;
  if (ar <= 0 || ar === Math.round(dose) || Math.abs(ec) > (marge == null ? MARGE_FLACON : marge)) return null;
  return { dose: ar, ecart: Math.round(ec * 1000) / 10, pas, lib: "≈ " + ar + " mg (flacons de " + pas + " mg, " + (ec > 0 ? "+" : "") + fr(ec * 100) + " %)" };
}
// Flacons pour une dose (liste du lendemain pour la pharmacie) : combinaison gloutonne, du plus grand au plus petit (dernier flacon entamé)
export function flaconsPour(p, dose, table) {
  const f = flaconsDe(p, table); if (!f || !(dose > 0)) return "";
  let reste = dose; const n = {}; f.slice().reverse().forEach((t, i, arr) => { const k = i === arr.length - 1 ? Math.ceil(reste / t) : Math.floor(reste / t); if (k > 0) { n[t] = k; reste -= k * t; } });
  return Object.keys(n).sort((a, b) => b - a).map((t) => n[t] + " × " + t + " mg").join(" + ");
}
// Lecture du réglage du cabinet (une ligne par molécule : « CARBOPLATINE : 50, 150, 450 »)
export function lireFlacons(txt) {
  const T = {}; String(txt || "").split("\n").forEach((l) => { const m = l.match(/^\s*([^:]+):\s*(.+)$/); if (!m) return; const v = m[2].split(/[^0-9.,]+/).map((z) => parseFloat(z.replace(",", "."))).filter((z) => z > 0); if (v.length) T[m[1].trim().toUpperCase()] = v; });
  return T;
}
export const ecrireFlacons = (T) => Object.keys(T).map((k) => k + " : " + T[k].join(", ")).join("\n");
