// Onco360 – lot R-E (audit n° 7, 19/10/2026) : calculs purs des ordonnances, sans DOM ni Firebase (tests/moteur/test-ordonnance.mjs).
// - zones « À compléter » : « … » d'une posologie et « [durée à compléter] » deviennent des zones jaunes (mark.or-ac, comme les courriers)
// - doublons : médicament déjà dans l'ordonnance (deux ordonnances types qui ont la même ligne)
// - allergie : familles (pénicillines, céphalosporines, sulfamides, quinolones, AINS, aspirine, produits de contraste iodés, morphiniques),
//   en plus des mots de l'allergie (moteur/statut.js) ; avertissement d'un clic, jamais bloquant
// - pages : découpage d'une ordonnance en pages (un médicament jamais coupé, la signature avec le dernier médicament)
const sa = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// ───── Zones « À compléter » (R-E1) ─────
// Texte déjà échappé (HTML) ; « … » → « À compléter » ; « [durée à compléter] » → « durée à compléter » ; un texte « À compléter » resté
// en clair (ordonnance rouverte pour la modifier : la zone a été relue comme texte) redevient une zone
export const ZONE_TXT = "À compléter";
export function marquerZones(h) {
  const s = String(h || "").replace(/\[([^\][<>]{0,40}à compléter)\]/gi, (m, t) => "\u0001" + t + "\u0002").replace(/…/g, "\u0001" + ZONE_TXT + "\u0002");
  return s.split(/(\u0001[^\u0002]*\u0002)/).map((p) => (p[0] === "\u0001" ? p : p.replace(/(?:[Dd]urée |[Dd]ose |[Nn]ombre )?[àÀ] compléter/g, (t) => "\u0001" + t + "\u0002"))).join("")
    .replace(/\u0001/g, '<mark class="or-ac">').replace(/\u0002/g, "</mark>");
}
// Une zone encore à compléter (texte de la zone) ?
export const zoneRestante = (t) => /à compléter/i.test(String(t || ""));

// ───── Doublons (R-E1, d. 16) ─────
// Nom comparé sans accents, sans majuscules ni espaces en trop ; « PARACÉTAMOL 1 g » = « Paracetamol 1 g »
export const cleMedicament = (n) => sa(n).replace(/\s+/g, " ").trim();
export function doublonsDe(items, nouveaux) {
  const deja = new Set((items || []).map((i) => cleMedicament(i.nom)).filter(Boolean));
  return (nouveaux || []).filter((i) => i && i.nom && deja.has(cleMedicament(i.nom))).map((i) => i.nom);
}
// Doublons à l'intérieur d'une même liste (vérification avant l'impression)
export function doublonsListe(noms) {
  const vus = {}, r = [];
  (noms || []).forEach((n) => { const k = cleMedicament(n); if (!k) return; if (vus[k] === 1) r.push(n); vus[k] = (vus[k] || 0) + 1; });
  return r;
}

// ───── Familles d'allergie (R-E6, d. 27 ; table de l'audit, complétée avec les noms de la bibliothèque) ─────
// mots : dans l'allergie notée ; meds : dans le nom (ou la classe) du médicament, de l'analyse ou de l'examen ; croisees : familles voisines
// (avertissement « allergie croisée possible : à vérifier »)
export const FAMILLES_ALLERGIE = [
  { k: "peni", nom: "pénicillines", mots: ["penicilline", "amoxicilline", "ampicilline", "augmentin", "clamoxyl", "betalactamine", "beta-lactamine"],
    meds: ["augmentin", "clamoxyl", "amoxicilline", "ampicilline", "oxacilline", "extencilline", "oracilline", "penicilline", "pristinamycine"], croisees: ["cepha"] },
  { k: "cepha", nom: "céphalosporines", mots: ["cephalosporine", "ceftriaxone", "cefixime", "rocephine", "oroken", "cefuroxime", "zinnat"],
    meds: ["rocephine", "ceftriaxone", "oroken", "cefixime", "zinnat", "cefuroxime", "cefadroxil", "cefotaxime", "claforan", "cefpodoxime", "orelox", "cephalosporine"], croisees: ["peni"] },
  { k: "sulfa", nom: "sulfamides", mots: ["sulfamide", "sulfamethoxazole", "bactrim", "cotrimoxazole"],
    meds: ["bactrim", "sulfamethoxazole", "cotrimoxazole", "sulfadiazine", "flammazine", "sulfamide"] },
  { k: "quino", nom: "quinolones", mots: ["quinolone", "fluoroquinolone", "levofloxacine", "ofloxacine", "ciprofloxacine", "tavanic", "oflocet", "ciflox"],
    meds: ["tavanic", "oflocet", "ciflox", "levofloxacine", "ofloxacine", "ciprofloxacine", "moxifloxacine", "fluoroquinolone"] },
  { k: "ains", nom: "anti-inflammatoires non stéroïdiens (AINS)", mots: ["ains", "anti-inflammatoire", "antiinflammatoire", "ibuprofene", "ketoprofene", "diclofenac", "voltarene", "profenid", "bufren", "arcoxia", "celecoxib"],
    meds: ["ibuprofene", "bufren", "profenid", "ketoprofene", "voltarene", "diclofenac", "fenac", "naproxene", "celecoxib", "celebrex", "etoricoxib", "arcoxia", "anti-inflammatoire non steroidien"], croisees: ["aspi"] },
  { k: "aspi", nom: "aspirine", mots: ["aspirine", "acide acetylsalicylique", "aspegic", "kardegic", "salicyle"],
    meds: ["aspegic", "kardegic", "aspirine", "acide acetylsalicylique"], croisees: ["ains"] },
  { k: "iode", nom: "produits de contraste iodés", mots: ["iode", "iodee", "iodes", "produit de contraste", "contraste"],
    meds: ["injectee", "injecte", "angio-tdm", "uro-tdm", "produit de contraste iode", "povidone iodee", "betadine"] },
  { k: "morph", nom: "morphiniques", mots: ["morphine", "morphinique", "opioide", "opiace", "codeine", "tramadol", "fentanyl"],
    meds: ["moscontin", "sevredol", "durogesic", "fentanyl", "morphine", "skenan", "oxycodone", "oxycontin", "tramal", "tramadol", "codeine", "cedol", "cetra"] },
];
const contient = (t, m) => { const i = t.indexOf(m); if (i < 0) return false; const av = t[i - 1], ap = t[i + m.length]; return (!av || !/[a-z0-9]/.test(av)) && (m.length >= 6 || !ap || !/[a-z0-9]/.test(ap)); };
// Familles touchées par l'allergie notée (texte libre : « pénicilline, iode »)
export function famillesDe(allergies) { const t = sa(allergies); return FAMILLES_ALLERGIE.filter((f) => f.mots.some((m) => contient(t, m))); }
// Alertes pour des lignes [{ nom, classe }] (nom = ce qui est imprimé ; classe : celle de la bibliothèque, si connue) :
// [{ nom, famille, croisee, mot }] ; motsLibres = mots de l'allergie (moteur/statut.js motsAllergie), pour ce que la table ne connaît pas
export function alertesAllergie(allergies, lignes, motsLibres) {
  const F = famillesDe(allergies), r = [];
  (lignes || []).forEach((l) => {
    if (!l || !l.nom) return; const t = sa(l.nom + " " + (l.classe || ""));
    let a = null;
    F.forEach((f) => { if (!a && f.meds.some((m) => contient(t, m))) a = { nom: l.nom, famille: f.nom, croisee: false }; });
    if (!a) F.forEach((f) => (f.croisees || []).forEach((k) => { const g = FAMILLES_ALLERGIE.find((z) => z.k === k); if (!a && g && g.meds.some((m) => contient(t, m))) a = { nom: l.nom, famille: g.nom, croisee: f.nom }; }));
    if (!a) { const n = sa(l.nom).toUpperCase(), w = (motsLibres || []).find((m) => n.indexOf(m) >= 0 || (m.length >= 6 && n.indexOf(m.slice(0, 6)) >= 0)); if (w) a = { nom: l.nom, mot: w.toLowerCase(), croisee: false }; }
    if (a) r.push(a);
  });
  return r;
}
// Une phrase par alerte (« AUGMENTIN 1 g : pénicillines » ; « ROCÉPHINE : céphalosporines, allergie croisée possible avec les pénicillines : à vérifier »)
export const texteAlerte = (a) => a.nom + " : " + (a.famille ? a.famille + (a.croisee ? ", allergie croisée possible avec les " + a.croisee + " : à vérifier" : "") : "contient « " + a.mot + " »");

// ───── Pages (R-E2, d. 24) ─────
// blocs : [{ h (hauteur), lie (reste avec le bloc précédent : posologie d'un médicament, signature avec le dernier médicament) }] ;
// H1 : hauteur utile de la 1re page ; H : celle des suivantes (en-tête « nom du patient · date » répété en haut). Rend [[indices]].
// Un groupe (bloc + blocs liés) n'est jamais coupé ; trop grand pour une page, il commence une page à lui seul.
export function paginer(blocs, H1, H) {
  const G = []; (blocs || []).forEach((b, i) => { if (b.lie && G.length) { G[G.length - 1].i.push(i); G[G.length - 1].h += b.h; } else G.push({ i: [i], h: b.h }); });
  const pages = [[]]; let reste = H1;
  G.forEach((g) => {
    if (g.h > reste + 0.5 && pages[pages.length - 1].length) { pages.push([]); reste = H; }
    pages[pages.length - 1].push(...g.i); reste -= g.h;
  });
  return pages;
}

// ───── Chimiothérapie orale calculée (R-E7, d. 32) : nombre de comprimés d'après la surface corporelle et la dose en mg/m² ─────
// Les « … » de la fiche sont remplis dans l'ordre (capécitabine : comprimés de 500 mg, de 150 mg, mg/m² ; vinorelbine : capsules de 20 mg,
// de 30 mg ; témozolomide : gélules) ; le médecin relit et corrige sur la feuille
export const CHIMIO_ORALE = [
  { k: "capecitabine", nom: "capécitabine", re: /cap[ée]citabine|xeloda/i, forces: [500, 150], dose: 1000, par: "par prise (2 fois par jour)", zones: (r, d) => [r.n[500], r.n[150], d] },
  { k: "vinorelbine", nom: "vinorelbine", re: /navelbine|vinorelbine/i, forces: [30, 20], dose: 60, par: "par semaine", zones: (r) => [r.n[20], r.n[30]] },
  { k: "temozolomide", nom: "témozolomide", re: /temodal|t[ée]mozolomide/i, forces: [250, 180, 140, 100, 20, 5], dose: 150, par: "par jour",
    zones: (r) => [Object.keys(r.n).map(Number).sort((a, b) => b - a).filter((f) => r.n[f]).map((f) => r.n[f] + " × " + f + " mg").join(" + ")] },
];
export const chimioOrale = (nom) => CHIMIO_ORALE.find((c) => c.re.test(String(nom || "")));
// Combinaison de comprimés pour une dose : à moins de 5 % et d'un demi petit comprimé près, le moins d'unités (puis l'écart le plus petit) ;
// sinon la plus proche ; au plus « max » unités
export function comprimes(dose, forces, max) {
  const F = forces.slice().sort((a, b) => b - a), M = max || 14, tol = Math.min(dose * 0.05, Math.min(...forces) / 2) + 1e-9; let best = null; const acc = [];
  const mieux = (e, n) => { if (!best) return true; const a = e <= tol, b = best.e <= tol; if (a !== b) return a; if (a) return n < best.n || (n === best.n && e < best.e - 1e-9); return e < best.e - 1e-9 || (Math.abs(e - best.e) < 1e-9 && n < best.n); };
  const rec = (i, reste, n) => {
    if (i === F.length) { const e = Math.abs(reste); if (mieux(e, n)) best = { e, n, c: acc.slice(), tot: dose - reste }; return; }
    for (let k = 0; n + k <= M && (k - 1) * F[i] <= reste; k++) { acc[i] = k; rec(i + 1, reste - k * F[i], n + k); }
    acc[i] = 0;
  };
  rec(0, dose, 0);
  const n = {}; F.forEach((f, i) => { n[f] = best.c[i] || 0; });
  return { total: Math.round(best.tot), n, ecart: Math.round(best.tot - dose) };
}
// Dose et comprimés pour une surface corporelle : { dose (mg par prise), total, n, ecart, zones }
export function doseOrale(c, sc, mgm2) {
  const dose = Math.round(sc * mgm2), r = comprimes(dose, c.forces);
  return Object.assign(r, { dose, zones: c.zones(r, String(mgm2).replace(".", ",")) });
}
// Les premiers « … » d'un texte remplacés par des valeurs (dans l'ordre)
export function remplirZones(t, valeurs) { let i = 0; return String(t || "").replace(/…/g, (m) => (i < valeurs.length ? String(valeurs[i++]) : m)).replace(/\b([01]) (comprimé|capsule|gélule)s\b/g, "$1 $2"); } // « 1 comprimé »
