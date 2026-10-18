// Onco360 – Audit n° 3, P4 (18/10/2026) : consignes des ordres 2 et 3 du classeur (donnees/audit3p4.js, généré par
// outils/audit3/convertir-p4.mjs) appliquées aux protocoles de la bibliothèque, plus les seuils du jour (`seuils`) et les ordonnances
// liées (`ordos`) de chaque protocole. Calcul pur, sans Firebase. Chaque consigne est vérifiée sur le protocole réel : une ligne déjà là
// n'est pas ajoutée deux fois, une ligne ou une remarque introuvable est laissée de côté (rendue dans `ignores`). Relancer ne refait rien.
import { sansHGC } from "./audit3.js";

const sa = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const cle = (t) => sa(t).replace(/[^A-Z0-9]/g, "");
const copie = (o) => JSON.parse(JSON.stringify(o));
const memeJours = (a, b) => String(a || []) === String(b || []);
const famille = (p) => (/HYDRATATION AVANT/.test(sa(p)) ? "hydAv" : /HYDRATATION APRES/.test(sa(p)) ? "hydAp" : sa(p).split(/[ (]/)[0]);
const estChimioCispla = (d) => /^CISPLATINE/.test(sa(d.p));
const PREMED = /SOLUMEDROL|METHYLPREDNISOLONE|ONSET|ONDANSETRON|POLARAMINE|DEXCHLORPHENIRAMINE|ATROPINE|DEXAMETHASONE|ZOPHREN|PARACETAMOL|EMEND|APREPITANT/;

// Où poser une ligne ajoutée : hydratation avant / après le cisplatine ; prémédication à la suite des autres ; le reste à la fin
function poser(p, d) {
  const f = famille(d.p), iC = p.dr.findIndex(estChimioCispla);
  if (f === "hydAv" && iC >= 0) return p.dr.splice(iC, 0, d);
  if (f === "hydAp" && iC >= 0) return p.dr.splice(iC + 1, 0, d);
  if (PREMED.test(sa(d.p))) { let i = -1; p.dr.forEach((x, k) => { if (PREMED.test(sa(x.p))) i = k; }); return p.dr.splice(i + 1, 0, d); }
  p.dr.push(d);
}
const trouveRem = (p, de) => { const c = cle(sansHGC(de)); return (p.no || []).findIndex((x) => cle(sansHGC(x)) === c || cle(x) === cle(de)); };

// Applique les consignes d'une entrée e à une copie du protocole p0. Rend { p, faites: [libellés], ignores: [libellés] } ; p = null si rien.
export function appliquerEntree(p0, e) {
  const p = copie(p0), faites = [], ignores = [];
  const no = (x) => { p.no = p.no || []; if (p.no.indexOf(x) < 0) { p.no.push(x); return true; } return false; };
  (e.ops || []).forEach((o) => {
    if (o.t === "solu") {
      const d = p.dr.find((x) => /SOLUMEDROL|METHYLPREDNISOLONE/.test(sa(x.p)) && x.d === o.de);
      if (d) { d.d = o.vers; faites.push("Solumedrol " + o.de + " → " + o.vers + " mg"); } else ignores.push("Solumedrol " + o.de + " mg introuvable");
    } else if (o.t === "add") {
      const f = famille(o.d.p);
      if (p.dr.some((x) => famille(x.p) === f && (memeJours(x.j, o.d.j) || f === "hydAv" || f === "hydAp"))) { ignores.push(o.d.p.split(" ")[0] + " déjà là"); return; }
      poser(p, Object.assign({ id: "p4_" + p.dr.length + "_" + f.toLowerCase() }, copie(o.d))); faites.push("ajouté : " + o.d.p.replace(/ \d.*$/, ""));
    } else if (o.t === "niv") {
      const i = p.dr.findIndex((x) => /NIVESTIM|FILGRASTIM/.test(sa(x.p)));
      if (i >= 0 && /48 MU si poids/.test(p.dr[i].pos || "")) { ignores.push("NIVESTIM déjà structuré"); return; }
      if (i >= 0) p.dr[i] = Object.assign({ id: p.dr[i].id }, copie(o.d)); else p.dr.push(Object.assign({ id: "p4_niv" }, copie(o.d)));
      faites.push("NIVESTIM " + (o.d.jl || "").split(" :")[0]);
    } else if (o.t === "suppr") {
      const c = cle(o.p), i = p.dr.findIndex((x) => cle(x.p) === c || cle(x.p).indexOf(c) === 0);
      if (i < 0) { ignores.push("ligne « " + o.p + " » introuvable"); return; }
      const d = p.dr[i], reste = o.j ? (d.j || []).filter((y) => o.j.indexOf(y) < 0) : [];
      if (o.j && reste.length === (d.j || []).length) { ignores.push(o.p + " déjà retiré J" + o.j.join(", J")); return; }
      if (o.j && reste.length && reste.some((y) => y !== 99)) { d.j = reste; faites.push(o.p + " retiré J" + o.j.join(", J")); } else { p.dr.splice(i, 1); faites.push("retiré : " + o.p); }
    } else if (o.t === "remR") {
      const i = trouveRem(p, o.de), v = sansHGC(o.vers);
      if (i >= 0) { p.no[i] = v; faites.push("remarque remplacée"); } else if (trouveRem(p, v) >= 0) ignores.push("remarque déjà remplacée"); else ignores.push("remarque introuvable : " + o.de.slice(0, 50));
    } else if (o.t === "remS") {
      const i = trouveRem(p, o.de); if (i >= 0) { p.no.splice(i, 1); faites.push("remarque retirée"); } else ignores.push("remarque à retirer introuvable");
    } else if (o.t === "remA") { if (no(sansHGC(o.txt))) faites.push("remarque ajoutée"); else ignores.push("remarque déjà là"); }
    else if (o.t === "nom") {
      if (o.vers.indexOf("…") === 0 && p.nom.endsWith(o.vers.slice(1))) { ignores.push("nom déjà changé"); return; }
      const v = o.vers.indexOf("…") === 0 ? p.nom.replace(/\s*\((?:eviQ|voies biliaires)\)\s*$/i, "") + o.vers.slice(1) : o.vers;
      if (p.nom === v) ignores.push("nom déjà changé"); else { p.nom = v; faites.push("renommé"); }
    } else if (o.t === "indA") {
      p.ind = p.ind || []; if (p.ind.some((x) => JSON.stringify(x) === JSON.stringify(o.ind))) { ignores.push("indication déjà là"); return; }
      p.ind.push(o.ind.slice()); faites.push("indication : " + o.ind.filter(Boolean).join(" › "));
    } else if (o.t === "indR") {
      const i = (p.ind || []).findIndex((x) => JSON.stringify(x.slice(0, 3)) === JSON.stringify(o.ind.slice(0, 3)));
      if (i >= 0) { p.ind.splice(i, 1); faites.push("indication retirée"); } else ignores.push("indication à retirer introuvable");
    } else if (o.t === "loc") { /* P5 : la localisation de la fiche suit la 1re indication (nettoyerP5) */ }
    else if (o.t === "prodige23" || o.t === "keynoteA18") { /* protocoles créés par creesP4 */ }
  });
  // P5 : source (essai de référence du classeur) si elle manque
  if (e.src && !p.src) { p.src = e.src; faites.push("source"); }
  // Seuils du jour et ordonnances liées (champs du protocole, P3)
  if (e.seuils && e.seuils.length && JSON.stringify(p.seuils || []) !== JSON.stringify(e.seuils) && !(p.seuils && p.seuils.length)) { p.seuils = e.seuils.slice(); faites.push("seuils du jour"); }
  if (e.ordos && e.ordos.length && !(p.ordos && p.ordos.length)) { p.ordos = e.ordos.slice(); faites.push("ordonnances liées"); }
  return { p: faites.length ? p : null, faites, ignores };
}

// Protocoles créés par P4 : copie « mFOLFIRINOX rectum (PRODIGE 23) » (irinotécan 180 mg/m², 6 cures) et KEYNOTE-A18 phase 2
export function creesP4(bib, P4) {
  const out = [], tr = (n) => Object.entries(P4).find(([, e]) => e.n === n), parId = (k) => (k[0] === "@" ? Object.values(bib).find((p) => p.nom === k.slice(1)) : bib[k]);
  const f = tr(105), pf = f && parId(f[0]);
  if (pf && !bib["audit3|mfolfirinox-prodige23"]) {
    const c = copie(pf); c.id = "audit3|mfolfirinox-prodige23"; c.nom = "mFOLFIRINOX rectum J1-J15 / 28 j × 6 (PRODIGE 23)"; delete c.fav;
    const ir = c.dr.find((d) => /IRINOTECAN/.test(sa(d.p))); if (ir) ir.d = 180;
    c.ind = (pf.ind || []).filter((x) => /rectum/i.test(x.join(" "))); if (!c.ind.length) c.ind = [["Digestif", "Rectum", "Néoadjuvant", ""]];
    c.r = "J1 et J15, tous les 28 jours × 6 (néoadjuvant, avant la radiochimiothérapie)"; c.src = "PRODIGE 23 (Conroy 2021)";
    c.no = ["Irinotécan 180 mg/m² (PRODIGE 23) ; 6 cures avant la radiochimiothérapie"];
    out.push({ p: c, origine: pf.id, retirerRectum: true });
  }
  const k = tr(192), pk = k && parId(k[0]);
  if (pk && !bib["audit3|keynote-a18-phase2"]) {
    out.push({ p: { id: "audit3|keynote-a18-phase2", nom: "KEYNOTE-A18 – phase 2 : Pembrolizumab 400 mg / 6 semaines × 15", c: 42, r: "Pembrolizumab 400 mg toutes les 6 semaines × 15, après la radiochimiothérapie",
      ind: (pk.ind || []).slice(0, 1).map((x) => x.slice()), src: "KEYNOTE-A18 (Lorusso 2024)",
      dr: [{ id: "d0", p: "KEYTRUDA / PEMORIAL (pembrolizumab)", u: "mg", d: 400, j: [1], v: "IV", s: "NaCl 0,9 % 100 ml", t: "30 min" }],
      no: ["Suite du protocole « " + pk.nom + " »", "Surveillance des effets immunologiques : TSH, bilan hépatique, créatinine, glycémie"],
      seuils: ["Immunothérapie : TSH, transaminases, créatinine, glycémie avant chaque cure ; toxicité immunologique de grade ≥ 2 → suspendre"] } });
  }
  return out;
}

// P5 (18/10/2026) : sur tous les protocoles : DCI à côté de la marque (« SOLUMEDROL » → « SOLUMEDROL (méthylprednisolone) ») ;
// localisation de la fiche (`dos` / `loc`, ancien rangement à deux niveaux) = la 1re indication de l'arborescence. Rend les libellés.
export function nettoyerP5(p) {
  const f = [];
  (p.dr || []).forEach((d) => { if (/^SOLUMEDROL\s*$/i.test(d.p)) { d.p = "SOLUMEDROL (méthylprednisolone)"; if (!f.length || f[f.length - 1] !== "DCI") f.push("DCI"); } });
  const i = (p.ind || [])[0];
  if (i && i[0] && (p.dos !== i[0] || p.loc !== (i[1] || i[0]))) { p.dos = i[0]; p.loc = i[1] || i[0]; f.push("localisation"); }
  return f;
}
// Toute la bibliothèque. Rend { modifies: [{ id, p, faites, ignores }], crees: [p], ignores: [{ id, nom, raisons }] }
export function correctionsP4(bib, P4) {
  const r = { modifies: [], crees: [], ignores: [] }, parNom = {};
  Object.values(bib).forEach((p) => { if (p && p.nom) parNom[p.nom] = p; });
  const mod = {};
  Object.entries(P4).forEach(([k, e]) => {
    const p0 = k[0] === "@" ? parNom[k.slice(1)] : bib[k];
    if (!p0) { if ((e.ops || []).length) r.ignores.push({ id: k, nom: e.nom, raisons: ["protocole introuvable"] }); return; }
    const x = appliquerEntree(p0, e); if (x.p) x.faites.push(...nettoyerP5(x.p));
    if (x.p) { mod[p0.id] = x; r.modifies.push(Object.assign({ id: p0.id }, x)); }
    if (x.ignores.length) r.ignores.push({ id: p0.id, nom: p0.nom, raisons: x.ignores });
  });
  // P5 sur les protocoles sans consigne du classeur
  Object.values(bib).forEach((p0) => { if (!p0 || !p0.nom || mod[p0.id]) return; const p = copie(p0), f = nettoyerP5(p); if (f.length) { mod[p0.id] = { p, faites: f, ignores: [] }; r.modifies.push(Object.assign({ id: p0.id }, mod[p0.id])); } });
  const vue = Object.assign({}, bib); Object.entries(mod).forEach(([id, x]) => { vue[id] = x.p; });
  creesP4(vue, P4).forEach((c) => {
    nettoyerP5(c.p); r.crees.push(c.p);
    if (c.retirerRectum) {
      const m = mod[c.origine] || (mod[c.origine] = { p: copie(bib[c.origine]), faites: [], ignores: [] }); c.p.ind = c.p.ind.length ? c.p.ind : [];
      const av = (m.p.ind || []).length; m.p.ind = (m.p.ind || []).filter((x) => !/rectum/i.test(x.join(" "))); nettoyerP5(m.p);
      if (m.p.ind.length !== av) { m.faites.push("indication rectum retirée (version PRODIGE 23 créée)"); if (!r.modifies.some((z) => z.id === c.origine)) r.modifies.push(Object.assign({ id: c.origine }, m)); }
    }
  });
  return r;
}
