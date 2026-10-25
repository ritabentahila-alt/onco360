// Onco360 – Référentiel de radiothérapie : calculs purs (phase RTR, RT2 du 25/10/2026 ; spécification docs/radiotherapie/SPEC.md), sans DOM
// ni Firebase. Référence = public/donnees-rt (index.json + un fichier par localisation), changements du cabinet = espaces/{e}/referentielRT/{id}
// { schema, localisation_id, nouveau, origine cabinet | modele, copie_de, base, note, majPar… }. Ici : fusion des deux, recherche (synonymes,
// doses, séances), tri, mise en forme des doses (virgule, espace insécable avant l'unité), calcul BED / EQD2. Aucune dose de prescription n'est
// calculée (règle 5 de la spécification). Testé par node tests/moteur/test-rtref.mjs.
import { rangNom } from "./recherche.js";

export const NBSP = " ";
// Sans accents ni majuscules ; ligatures écrites en deux lettres (« Œsophage » = « oesophage »)
export const sansAcc = (s) => String(s == null ? "" : s).toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/[̀-ͯ]/g, "");

// ───── Libellés ─────
export const TYPES = { rte_normo: "Normofractionné", rte_hypo: "Hypofractionné", sbrt: "Stéréotaxie", curie_ldr: "Curiethérapie", curie_hdr: "Curiethérapie", curie_pdr: "Curiethérapie", rte_plus_curie: "RTE + curiethérapie" };
// Menu Fractionnement : un libellé peut couvrir plusieurs types (curiethérapie HDR, PDR, LDR)
export const FRACTIONNEMENTS = ["Normofractionné", "Hypofractionné", "Stéréotaxie", "Curiethérapie", "RTE + curiethérapie"];
export const CONTEXTES = { en_place: "En place", post_op: "Post-opératoire", rattrapage: "Rattrapage", metastatique: "Métastatique", oligometastatique: "Oligométastatique", palliatif: "Palliatif", reirradiation: "Réirradiation" };
// Règle 2 des règles d'affichage : ordre des schémas d'une situation
export const PREUVES = [["essai_phase3", "Essai de phase 3"], ["recommandation", "Recommandation"], ["pratique_institutionnelle", "Pratique institutionnelle"], ["option", "Option"], ["pratique_du_cabinet", "Pratique du cabinet"]];
export const libPreuve = (k) => (PREUVES.find((p) => p[0] === k) || [k, k || ""])[1];
const rangPreuve = (k) => { const i = PREUVES.findIndex((p) => p[0] === k); return i < 0 ? PREUVES.length : i; };

// ───── Nombres et doses ─────
// Nombre affiché à la française : au plus 2 décimales, zéros inutiles retirés (1.8 → « 1,8 », 60 → « 60 », 2.67 → « 2,67 »)
export function nb(x, dec = 2) {
  if (typeof x !== "number" || !isFinite(x)) return "";
  return String(Number(x.toFixed(dec))).replace(".", ",");
}
// Nombre arrondi à l'affichage seulement (« 96,4 », « 3,00 ») : décimales gardées
export const fixe = (x, dec) => (typeof x === "number" && isFinite(x) ? x.toFixed(dec).replace(".", ",") : "—");
export const gy = (x) => nb(x) + NBSP + "Gy";
const num = (v) => typeof v === "number" && isFinite(v) && v > 0;
// « 60 Gy / 20 fx (3 Gy/fx) » ; morceaux absents (curiethérapie LDR ou PDR, dose à définir) : ce qui est connu, sinon « — »
export function fmtPrescription(p) {
  if (!p) return "—";
  const t = [], d = num(p.dose_Gy), n = num(p.fractions), f = num(p.dose_fx_Gy);
  if (d) t.push(gy(p.dose_Gy));
  if (n) t.push(nb(p.fractions) + NBSP + "fx");
  let s = t.join(" / ");
  if (f && (d || n)) s += " (" + nb(p.dose_fx_Gy) + NBSP + "Gy/fx)";
  else if (f) s = nb(p.dose_fx_Gy) + NBSP + "Gy/fx";
  return s || "—";
}
// Ligne calculable (lien « EQD2 ») : dose par séance et nombre de séances connus
export const calculable = (p) => !!p && num(p.dose_fx_Gy) && num(p.fractions);
// Résumé de l'en-tête de la fiche : volume de plus haute dose, puis « + n volumes », puis le rythme
// (« 60 Gy / 20 fx (3 Gy/fx) · PTV_PRO · 5 fx/sem »)
export function resumePrescription(schema) {
  const L = (schema && schema.prescriptions) || []; if (!L.length) return "—";
  let p = L[0]; L.forEach((q) => { if (num(q.dose_Gy) && (!num(p.dose_Gy) || q.dose_Gy > p.dose_Gy)) p = q; });
  const autres = new Set(L.map((q) => q.volume).filter((v) => v && v !== p.volume)).size;
  return [fmtPrescription(p), (p.volume || "") + (autres ? " + " + autres + " volume" + (autres > 1 ? "s" : "") : ""), p.rythme || ""].filter(Boolean).join(" · ");
}
// Contrôle de saisie (modification pour le cabinet) : dose par séance = dose totale / séances, écart toléré 0,01 Gy ; nombres > 0
export function controlePrescription(p) {
  const e = [];
  ["dose_Gy", "fractions", "dose_fx_Gy"].forEach((k) => { if (p[k] !== undefined && p[k] !== null && p[k] !== "" && !num(p[k])) e.push({ champ: k, txt: "Nombre supérieur à 0" }); });
  if (num(p.dose_Gy) && num(p.fractions) && num(p.dose_fx_Gy) && Math.abs(p.dose_Gy / p.fractions - p.dose_fx_Gy) > 0.01)
    e.push({ champ: "dose_fx_Gy", txt: "Dose par séance différente de " + gy(p.dose_Gy) + " / " + nb(p.fractions) + " = " + gy(p.dose_Gy / p.fractions) });
  return e;
}

// ───── Fusion référence + cabinet ─────
// Résumé d'un schéma pour la liste et la recherche (même forme que index.json : id, localisation_id, situation_id, titre, type, preuve,
// essais (acronymes), source_institutionnelle, doses, ind)
export function resumeDe(schema, locId, index, acronymeDe) {
  const sit = (index.situations || []).find((s) => s.id === schema.situation_id), loc = (index.localisations || []).find((l) => l.id === locId);
  const reg = loc && (index.regions || []).find((r) => r.id === loc.region_id);
  const ind = Array.isArray(schema.ind) && schema.ind.length === 4 ? schema.ind : [reg ? reg.nom : "", loc ? loc.nom : "", sit ? sit.titre : "", TYPES[schema.type] || schema.type || ""];
  const r = { id: schema.id, localisation_id: locId, situation_id: schema.situation_id, titre: schema.titre || "", type: schema.type, preuve: schema.preuve,
    essais: (schema.essai_ids || []).map((e) => (acronymeDe && acronymeDe(e)) || e), doses: (schema.prescriptions || []).map((p) => ({ volume: p.volume, dose_Gy: p.dose_Gy, fractions: p.fractions, dose_fx_Gy: p.dose_fx_Gy })), ind };
  if (schema.source_institutionnelle) r.source_institutionnelle = schema.source_institutionnelle;
  return r;
}
// Liste affichée : la fiche du cabinet remplace la référence ; schémas créés par le cabinet ajoutés. Chaque entrée garde `cab` (origine,
// base, auteur, note) ; `modifie` = badge « Modifié pour le cabinet » (origine « cabinet » seulement) ; `refChangee` = la référence a changé
// depuis (date_maj de la localisation postérieure à `base`) ; rien n'est fusionné automatiquement.
export function fusionner(index, cabinet, acronymeDe) {
  const C = cabinet || {}, vus = new Set(), dates = {};
  (index.localisations || []).forEach((l) => { dates[l.id] = l.date_maj || ""; });
  const marquer = (e, c) => Object.assign(e, { cab: c, modifie: c.origine === "cabinet", nouveau: !!c.nouveau, refChangee: !c.nouveau && !!c.base && (dates[e.localisation_id] || "") > c.base });
  const liste = (index.schemas || []).map((s) => {
    const c = C[s.id]; vus.add(s.id);
    return c && c.schema && !c.nouveau ? marquer(resumeDe(Object.assign({ id: s.id }, c.schema), s.localisation_id, index, acronymeDe), c) : Object.assign({}, s, { modifie: false, nouveau: false, refChangee: false });
  });
  Object.keys(C).filter((id) => !vus.has(id) && C[id] && C[id].schema && C[id].localisation_id).forEach((id) => {
    liste.push(marquer(resumeDe(Object.assign({ preuve: "pratique_du_cabinet" }, C[id].schema, { id }), C[id].localisation_id, index, acronymeDe), C[id]));
  });
  return liste;
}
// Fiche affichée : celle du cabinet si elle existe, sinon la référence
export const ficheEffective = (ref, cab) => (cab && cab.schema ? Object.assign({}, cab.schema, { id: (ref && ref.id) || cab.schema.id }) : ref || null);

// ───── Tri ─────
// Région, localisation, ordre de la situation, niveau de preuve, puis ordre du fichier ; avec une recherche, le rang du titre d'abord
export function trier(liste, index, q) {
  const o = {}, ordreR = {}, ordreL = {}, ordreS = {};
  (index.regions || []).forEach((r) => { ordreR[r.id] = r.ordre; });
  (index.localisations || []).forEach((l) => { ordreL[l.id] = [ordreR[l.region_id] || 0, l.ordre || 0]; });
  (index.situations || []).forEach((s) => { ordreS[s.id] = s.ordre || 0; });
  (index.schemas || []).forEach((s, i) => { o[s.id] = i; });
  const cle = (e) => { const l = ordreL[e.localisation_id] || [99, 99]; return [l[0], l[1], ordreS[e.situation_id] || 0, rangPreuve(e.preuve), e.id in o ? o[e.id] : 1e6]; };
  const qq = String(q || "").trim();
  return liste.slice().sort((a, b) => {
    if (qq) { const d = rangNom(a.titre, qq) - rangNom(b.titre, qq); if (d) return d; }
    const x = cle(a), y = cle(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return 0;
  });
}

// ───── Recherche ─────
// Synonymes (spécification, « Recherche libre ») : le mot tapé trouve aussi ces mots ; post-opératoire et adjuvant se trouvent l'un l'autre
// (la prostate n'a pas de situation « post-opératoire » : « Après prostatectomie — rattrapage précoce ou adjuvant »)
const POSTOP = ["post-operatoire", "postoperatoire", "adjuvant"];
export const SYNONYMES = { hypo: ["hypofractionne"], hypofrac: ["hypofractionne"], normo: ["normofractionne"], stereo: ["stereotaxie"], sbrt: ["stereotaxie"], sabr: ["stereotaxie"],
  curie: ["curietherapie"], hdr: ["curietherapie"], pdr: ["curietherapie"], ldr: ["curietherapie"], "post-op": POSTOP, postop: POSTOP,
  postoperatoire: POSTOP, adjuvant: POSTOP, rct: ["radiochimiotherapie"] };
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const egal = (a, b) => typeof a === "number" && Math.abs(a - b) < 1e-6;
// Texte cherché d'un schéma (situation : titre, critères, contexte) ; doses écrites avec virgule et point
export function texteDe(e, index) {
  const sit = (index.situations || []).find((s) => s.id === e.situation_id) || {};
  const doses = (e.doses || []).map((p) => [p.volume, num(p.dose_Gy) ? nb(p.dose_Gy) + " gy " + p.dose_Gy + " gy" : "", num(p.fractions) ? p.fractions + " fx" : "", num(p.dose_fx_Gy) ? nb(p.dose_fx_Gy) + " " + p.dose_fx_Gy : ""].join(" "));
  return sansAcc([e.titre, (e.ind || []).join(" "), sit.titre, sit.criteres, CONTEXTES[sit.contexte], TYPES[e.type], (e.essais || []).join(" "), e.source_institutionnelle, doses.join(" ")].filter(Boolean).join(" | "));
}
// Requête découpée : doses (« 45 Gy », « 45Gy », « 1,8 Gy »), séances (« 5 fx », « 25 fractions », « 5 séances »), nombres seuls, mots
export function analyser(q) {
  let s = sansAcc(q).replace(/(\d),(\d)/g, "$1.$2"); const doses = [], fx = [];
  s = s.replace(/(\d+(?:\.\d+)?)\s*gy\b/g, (m, n) => { doses.push(Number(n)); return " "; });
  s = s.replace(/(\d+)\s*(?:fx|fractions?|seances?)\b/g, (m, n) => { fx.push(Number(n)); return " "; });
  const mots = s.split(/\s+/).filter(Boolean), nombres = mots.filter((m) => /^\d+(?:\.\d+)?$/.test(m)).map(Number);
  return { doses, fx, nombres, mots: mots.filter((m) => !/^\d+(?:\.\d+)?$/.test(m)) };
}
// Termes à surligner dans la liste (mots tapés et leurs synonymes, nombres tels qu'affichés)
export function termes(q) {
  const a = analyser(q), t = [];
  a.mots.forEach((m) => { t.push(m); (SYNONYMES[m] || []).forEach((x) => t.push(x)); });
  a.doses.concat(a.nombres).forEach((n) => t.push(nb(n)));
  return t;
}
function correspond(e, a, txt) {
  const p = e.doses || [];
  if (!a.doses.every((d) => p.some((x) => egal(x.dose_Gy, d)))) return false;
  if (!a.fx.every((n) => p.some((x) => egal(x.fractions, n)))) return false;
  // nombre seul : une dose, un nombre de séances, une dose par séance, ou le nombre écrit dans le titre
  if (!a.nombres.every((n) => p.some((x) => egal(x.dose_Gy, n) || egal(x.fractions, n) || egal(x.dose_fx_Gy, n)) || new RegExp("(^|[^0-9.,])" + reEsc(nb(n)) + "($|[^0-9,])").test(sansAcc(e.titre)))) return false;
  return a.mots.every((m) => txt.indexOf(m) >= 0 || (SYNONYMES[m] || []).some((x) => txt.indexOf(x) >= 0));
}
// Schémas qui répondent à la recherche (tous les mots, sans accents ni majuscules ; dès 2 caractères) ; `textes` = cache des textes
export function chercher(liste, q, index, textes) {
  const qq = String(q || "").trim(); if (qq.length < 2) return liste.slice();
  const a = analyser(qq), T = textes || new Map();
  return liste.filter((e) => { let t = T.get(e); if (t === undefined) { t = texteDe(e, index); T.set(e, t); } return correspond(e, a, t); });
}
// Aucun résultat : le mot qui bloque (celui dont le retrait rend le plus de résultats), pour « Chercher sans "…" »
export function motBloquant(liste, q, index, textes) {
  const mots = String(q || "").trim().split(/\s+/).filter(Boolean); if (mots.length < 2) return null;
  let best = null, n = 0;
  mots.forEach((m, i) => { const r = chercher(liste, mots.filter((x, j) => j !== i).join(" "), index, textes).length; if (r > n) { n = r; best = m; } });
  return best;
}

// ───── Calcul BED / EQD2 (modèle linéaire-quadratique, sans correction de temps ; pleine précision, arrondi à l'affichage) ─────
// Saisie : virgule ou point ; valeur nulle, négative ou non numérique = NaN (ligne ignorée)
export function nombre(v) {
  if (typeof v === "number") return isFinite(v) && v > 0 ? v : NaN;
  const s = String(v == null ? "" : v).trim().replace(",", "."); if (!/^\d+(\.\d+)?$|^\.\d+$/.test(s)) return NaN;
  const n = Number(s); return n > 0 ? n : NaN;
}
export const bedLigne = (d, n, ab) => n * d * (1 + d / ab);
// lignes = [{ d, n }] (dose par fraction, fractions), ab = [α/β…], x = dose par fraction de référence (EQDx), N = fractions de la dose équivalente
export function calculBED({ lignes, ab = [1.5, 3, 10], x = 2, N = 25 }) {
  const L = (lignes || []).map((l) => ({ d: nombre(l.d), n: nombre(l.n) })), ok = L.map((l) => !isNaN(l.d) && !isNaN(l.n));
  const val = L.filter((l, i) => ok[i]), X = nombre(x), NN = nombre(N);
  const total = { n: val.reduce((s, l) => s + l.n, 0), dose: val.reduce((s, l) => s + l.n * l.d, 0) };
  const colonnes = (ab || []).map((a0) => {
    const a = nombre(a0); if (isNaN(a) || !val.length) return { ab: a, bed: NaN, eqd: NaN, dN: NaN, detail: L.map(() => NaN) };
    const detail = L.map((l, i) => (ok[i] ? bedLigne(l.d, l.n, a) : NaN)), bed = detail.filter((v) => !isNaN(v)).reduce((s, v) => s + v, 0);
    return { ab: a, bed, eqd: isNaN(X) ? NaN : bed / (1 + X / a), dN: isNaN(NN) ? NaN : (-a + Math.sqrt(a * a + 4 * a * bed / NN)) / 2, detail };
  });
  return { valides: ok, total, colonnes };
}

// ───── Contraintes d'un schéma (table unique, donnees-rt/contraintes.json format 2, 25/10/2026) ─────
// Base = une contrainte par OAR et par régime (normofractionné, hypofractionné, stéréotaxie selon le nombre de séances), avec des précisions par
// localisation (champ loc) ; un essai suivi par le schéma (contraintes_ids) remplace la base pour les OAR qu'il cite. Clé d'un OAR : structure
// réunie (somme : poumons, reins, hippocampes), paire droite et gauche (paire), sinon l'OAR lui-même.
export const REGIMES = { normo: "Normofractionné", hypo: "Hypofractionné", stereo: "Stéréotaxie" };
const REG_TYPE = { rte_normo: "normo", rte_plus_curie: "normo", rte_hypo: "hypo", sbrt: "stereo" };
export const cleOar = (o) => (o ? o.somme || o.paire || o.id : null);
// Régime du schéma, d'après son type ; séances et dose par séance de la ligne de prescription la plus longue (volume principal)
export function regimeDe(schema) {
  const regime = REG_TYPE[schema && schema.type]; if (!regime) return null;
  const p = (schema.prescriptions || []).filter((x) => num(x.fractions)).sort((a, b) => b.fractions - a.fractions)[0];
  return { regime, fx: p ? p.fractions : null, dpf: p && num(p.dose_fx_Gy) ? p.dose_fx_Gy : null };
}
// Lignes d'un régime qui conviennent au schéma : même nombre de séances (et même dose par séance si la ligne la précise) ; sinon les lignes valables
// pour tout le régime ; sinon, par prudence, le plus grand nombre de séances publié qui ne dépasse pas celui du schéma, s'il en vaut au moins la
// moitié (moins de séances = valeurs plus strictes ; proche = ce nombre) ; sinon rien
export function choisirLignes(L, fx, dpf) {
  const avec = L.filter((l) => l.fx), sans = L.filter((l) => !l.fx);
  if (fx) {
    const ex = avec.filter((l) => l.fx === fx && (!l.dpf || (num(dpf) && Math.abs(l.dpf - dpf) < 0.01)));
    if (ex.length) { const d = ex.filter((l) => l.dpf); return { lignes: d.length ? d : ex }; }
  }
  if (sans.length) return { lignes: sans };
  const ok = num(fx) ? avec.filter((l) => !l.dpf && l.fx <= fx && l.fx * 2 >= fx) : [];
  if (!ok.length) return { lignes: [] };
  const n = Math.max(...ok.map((l) => l.fx));
  return { lignes: ok.filter((l) => l.fx === n), proche: n };
}
// Lignes de la base pour une clé : celles de la localisation si elle en a pour ce régime, sinon les lignes générales
export function lignesBase(base, cle, loc, rg) {
  const L = (base || []).filter((l) => l.oar_id === cle && l.regime === rg.regime);
  const ici = choisirLignes(L.filter((l) => l.loc && l.loc.indexOf(loc) >= 0), rg.fx, rg.dpf);
  return ici.lignes.length ? ici : choisirLignes(L.filter((l) => !l.loc), rg.fx, rg.dpf);
}
// Table des contraintes d'un schéma : une entrée par organe contouré (dans l'ordre du contourage), puis les organes cités par l'essai seulement.
// origine : essai | base | conversion (hypofractionnement ou stéréotaxie sans valeur publiée : valeur du normofractionné, à convertir en EQD2) | aucune
export function contraintesSchema({ schema, loc, oarIds, oar, base, essais }) {
  const parId = {}; (oar || []).forEach((o) => { parId[o.id] = o; });
  const cle = (id) => cleOar(parId[id]) || id, rg = regimeDe(schema);
  const parEssai = {};
  (schema.contraintes_ids || []).forEach((jid) => { const j = (essais || []).find((x) => x.id === jid); if (!j) return;
    j.lignes.forEach((l) => { const k = cle(l.oar_id); (parEssai[k] = parEssai[k] || []).push(Object.assign({}, l, { oar_id: k, source: j.titre + (j.source ? " (" + j.source + ")" : "") })); }); });
  const cles = []; (oarIds || []).forEach((id) => { const k = cle(id); if (cles.indexOf(k) < 0) cles.push(k); });
  Object.keys(parEssai).forEach((k) => { if (cles.indexOf(k) < 0) cles.push(k); });
  return cles.map((k) => {
    if (parEssai[k]) return { cle: k, origine: "essai", lignes: parEssai[k] };
    if (!rg) return { cle: k, origine: "aucune", lignes: [] };
    const b = lignesBase(base, k, loc, rg);
    if (b.lignes.length) return { cle: k, origine: "base", lignes: b.lignes, proche: b.proche };
    if (rg.regime === "stereo") {
      // stéréotaxie sans valeur publiée pour ce nombre de séances (ni moins) : nombre de séances publié le plus proche, signalé (jamais le normofractionné)
      const L = (base || []).filter((l) => l.oar_id === k && l.regime === "stereo" && l.fx && !l.dpf), ici = L.filter((l) => l.loc && l.loc.indexOf(loc) >= 0), G = ici.length ? ici : L.filter((l) => !l.loc);
      if (G.length && num(rg.fx)) { const n = G.map((l) => l.fx).reduce((m, x) => (Math.abs(x - rg.fx) < Math.abs(m - rg.fx) ? x : m)); return { cle: k, origine: "base", lignes: G.filter((l) => l.fx === n), proche: n, plusLarge: n > rg.fx }; }
    }
    if (rg.regime === "hypo") { const n = lignesBase(base, k, loc, { regime: "normo" }); if (n.lignes.length) return { cle: k, origine: "conversion", lignes: n.lignes }; }
    return { cle: k, origine: "aucune", lignes: [] };
  }).map((x) => Object.assign(x, { lignes: sansDoublon(x.lignes) })).sort((a, b) => (/^cible-/.test(b.cle) ? 1 : 0) - (/^cible-/.test(a.cle) ? 1 : 0));
}
function sansDoublon(L) { const vus = new Set(); return L.filter((l) => { const c = [l.indicateur, l.ideal, l.limitant, l.note].join("|"); if (vus.has(c)) return false; vus.add(c); return true; }); }
// Base du cabinet : lignes modifiées (même id), ajoutées (id « cc-… ») et retirées (retirees) par-dessus la référence
export function baseEffective(ref, cab) {
  if (!cab) return ref || [];
  const mod = {}; (cab.lignes || []).forEach((l) => { mod[l.id] = l; });
  const ret = new Set(cab.retirees || []);
  const L = (ref || []).filter((l) => !ret.has(l.id)).map((l) => (mod[l.id] ? Object.assign({}, l, mod[l.id], { cabinet: true }) : l));
  (cab.lignes || []).forEach((l) => { if (!(ref || []).some((r) => r.id === l.id) && !ret.has(l.id)) L.push(Object.assign({}, l, { cabinet: true })); });
  return L;
}
