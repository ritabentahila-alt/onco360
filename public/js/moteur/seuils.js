// Onco360 – P3 (audit n° 3, 18/10/2026) : risque émétique d'un protocole et seuils particuliers du jour. Calcul pur, sans DOM ni Firebase.
// Rien n'est bloquant : les messages vont dans la fenêtre « Valider quand même ? » qui existe déjà (chimio.js `verifierValidation`).

const sa = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const oral = (d) => /PER OS|ORAL/i.test(d.v || "");
const dose = (d) => (d.u === "mg/m²" || d.u === "mg" ? d.d : d.u === "AUC" ? d.d : null);

// Risque émétique (MASCC/ESMO 2023) : celui de la molécule la plus émétisante ; anthracycline + cyclophosphamide = élevé.
// Niveaux : eleve, modhaut (modéré haut : carboplatine AUC ≥ 5, trastuzumab déruxtécan, sacituzumab, zolbétuximab), modere, faible, minimal ;
// protocole entièrement per os : oral (oralfort si témozolomide, lomustine, procarbazine, cyclophosphamide oral…).
export const RISQUES = [["eleve", "Élevé"], ["modhaut", "Modéré haut"], ["modere", "Modéré"], ["faible", "Faible"], ["minimal", "Minimal"], ["oralfort", "Oral modéré à élevé"], ["oral", "Oral faible"]];
export const libRisque = (k) => (RISQUES.find((r) => r[0] === k) || [k, ""])[1];
const NIV = { eleve: 5, modhaut: 4, modere: 3, faible: 2, minimal: 1 };
function niveau(d) {
  const p = sa(d.p), v = dose(d);
  if (/CISPLATINE|DACARBAZINE|DETICENE|CARMUSTINE|MECHLORETHAMINE|STREPTOZOCINE/.test(p)) return "eleve";
  if (/CYCLOPHOSPHAMIDE|ENDOXAN/.test(p) && d.u === "mg/m²" && v >= 1500) return "eleve";
  if (/CARBOPLATINE/.test(p)) return d.u === "AUC" && v >= 5 ? "modhaut" : "modere";
  if (/DERUXTECAN|ENHERTU|SACITUZUMAB|TRODELVY|ZOLBETUXIMAB|VYLOY/.test(p)) return "modhaut";
  if (/OXALIPLATINE|IRINOTECAN|CAMPTO|IFOSFAMIDE|HOLOXAN|CYCLOPHOSPHAMIDE|ENDOXAN|DOXORUBICINE|ADRIAMYCINE|EPIRUBICINE|FARMORUBICINE|DAUNORUBICINE|IDARUBICINE|TRABECTEDINE|YONDELIS|BENDAMUSTINE|AZACITIDINE|CLOFARABINE|ACTINOMYCINE|DACTINOMYCINE|MELPHALAN|BUSULFAN|TEMOZOLOMIDE|ARSENIC/.test(p)) return "modere";
  if (/CYTARABINE/.test(p)) return d.u === "mg/m²" && v > 200 ? "modere" : "faible";
  if (/DOCETAXEL|TAXOTERE|PACLITAXEL|TAXOL|ABRAXANE|CABAZITAXEL|JEVTANA|ETOPOSIDE|VEPESIDE|FLUORO|5-?FU\b|GEMCITABINE|PEMETREXED|ALIMTA|TOPOTECAN|MITOMYCINE|MITOXANTRONE|ERIBULINE|HALAVEN|IXABEPILONE|CETUXIMAB|ERBITUX|PANITUMUMAB|VECTIBIX|TRASTUZUMAB EMTANSINE|KADCYLA|ENFORTUMAB|PADCEV|BRENTUXIMAB|LIPOSOM|CAELYX|METHOTREXATE/.test(p)) return "faible";
  return "minimal";
}
// Molécules orales émétisantes (risque modéré à élevé)
const ORAL_FORT = /TEMOZOLOMIDE|TEMODAL|LOMUSTINE|BELUSTINE|PROCARBAZINE|NATULAN|CYCLOPHOSPHAMIDE|ENDOXAN|IMATINIB|GLIVEC|CRIZOTINIB|CERITINIB|LENVATINIB|NIRAPARIB|OLAPARIB|RUCAPARIB|BOSUTINIB|ABEMACICLIB/;
export function risqueEmetique(p, premed) {
  const mols = (p && p.dr || []).filter((d) => d.u !== "txt" && !(premed && premed(d)));
  if (!mols.length) return "minimal";
  if (mols.every(oral)) return mols.some((d) => ORAL_FORT.test(sa(d.p))) ? "oralfort" : "oral";
  const iv = mols.filter((d) => !oral(d)), a = iv.some((d) => /DOXORUBICINE|ADRIAMYCINE|EPIRUBICINE|FARMORUBICINE/.test(sa(d.p))), c = iv.some((d) => /CYCLOPHOSPHAMIDE|ENDOXAN/.test(sa(d.p)));
  if (a && c) return "eleve";
  return iv.map(niveau).sort((x, y) => NIV[y] - NIV[x])[0] || "minimal";
}
// Risque retenu : celui noté dans le protocole (`re`, choisi par le médecin), sinon le calcul
export const risqueDe = (p, premed) => (p && p.re) || risqueEmetique(p, premed);

// Seuils particuliers du jour. o = { prods [{ p, u, dose }] (anticancéreux de la séance), n (séance dans la cure, 0 = J1), cycle (jours),
// bio (bilan du jour : pnn, plq, bili, asat, alat, pal, cpk), crU } → messages (vide : rien à signaler). Les repères généraux (PNN ≥ 1,5,
// plaquettes ≥ 100, hémoglobine ≥ 8) restent dans chimio.js ; ici, ce qui change selon la séance ou la molécule.
export const LSN = { bili: (crU) => (crU === "mgL" ? 12 : 20), transa: 40, pal: 130, cpk: 200 };
export const hebdomadaire = (o) => (o.n || 0) > 0 || (o.cycle > 0 && o.cycle <= 7);
// Séances hebdomadaires (J8, J15… ou cycle de 7 jours) : PNN ≥ 1,0 G/L et plaquettes ≥ 75 G/L au lieu de 1,5 et 100
export const SEUILS_HEBDO = { pnn: 1, plq: 75 };
const fr = (v) => String(Math.round(v * 100) / 100).replace(".", ",");
export function seuilsJour(o) {
  const m = [], b = o.bio || {}, P = (o.prods || []).map((z) => sa(z.p)), a = (re) => P.some((p) => re.test(p)), lsnB = LSN.bili(o.crU), uB = o.crU === "mgL" ? " mg/L" : " µmol/L";
  const transa = Math.max(b.asat || 0, b.alat || 0);
  // Gemcitabine à J8 / J15 : 100 % si PNN ≥ 1,0 et plaquettes ≥ 100 ; 75 % si PNN 0,5-1,0 ou plaquettes 50-100 ; en dessous : séance non faite
  if (a(/GEMCITABINE|GEMZAR/) && (o.n || 0) > 0 && (b.pnn != null || b.plq != null)) {
    if ((b.pnn != null && b.pnn < 0.5) || (b.plq != null && b.plq < 50)) m.push("Gemcitabine (J8 / J15) : PNN < 0,5 G/L ou plaquettes < 50 G/L : séance habituellement non faite.");
    else if ((b.pnn != null && b.pnn < 1) || (b.plq != null && b.plq < 100)) m.push("Gemcitabine (J8 / J15) : PNN 0,5-1,0 G/L ou plaquettes 50-100 G/L : gemcitabine à 75 % de la dose.");
  }
  // Trabectédine : PNN ≥ 1,5, plaquettes ≥ 100, bilirubine ≤ normale, PAL ≤ 2,5 × N, transaminases ≤ 2,5 × N, CPK ≤ 2,5 × N
  if (a(/TRABECTEDINE|YONDELIS/)) {
    const l = [];
    if (b.bili != null && b.bili > lsnB) l.push("bilirubine " + fr(b.bili) + uB);
    if (b.pal != null && b.pal > 2.5 * LSN.pal) l.push("PAL " + b.pal + " UI/L");
    if (transa > 2.5 * LSN.transa) l.push("transaminases " + transa + " UI/L");
    if (b.cpk != null && b.cpk > 2.5 * LSN.cpk) l.push("CPK " + b.cpk + " UI/L");
    if (l.length) m.push("Trabectédine : " + l.join(", ") + " au-dessus des seuils (bilirubine ≤ normale ; PAL, transaminases, CPK ≤ 2,5 × la normale) : report ou dose réduite.");
  }
  // Docétaxel : ne pas faire si transaminases > 1,5 × N avec PAL > 2,5 × N (la bilirubine est déjà vue par la vigilance)
  if (a(/DOCETAXEL|TAXOTERE/) && transa > 1.5 * LSN.transa && b.pal != null && b.pal > 2.5 * LSN.pal) m.push("Docétaxel : transaminases > 1,5 × la normale avec PAL > 2,5 × la normale : contre-indiqué (RCP).");
  // Cabazitaxel : bilirubine ≤ normale
  if (a(/CABAZITAXEL|JEVTANA/) && b.bili != null && b.bili > lsnB) m.push("Cabazitaxel : bilirubine à " + fr(b.bili) + uB + " (au-dessus de la normale) : dose à réduire ou à reporter.");
  return m;
}
