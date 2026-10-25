// Onco360 – Référentiel de radiothérapie (phase RTR, spécification docs/radiotherapie/SPEC.md, « Écrans et affichage »).
// Menu « Radiothérapie » (module rt, fonction rt.referentiel, droit referentielRT voir | modifier : RT1). Référence = public/donnees-rt
// (index.json, un fichier par localisation ; jamais modifiés par l'application) ; changements du cabinet = espaces/{e}/referentielRT/{id}
// (écrits en RT5) ; calculs dans moteur/rtref.js. Le module n'écrit rien dans les dossiers patients.
// RT3 (25/10/2026) : page Référentiel. Recherche du module (fixée en haut ; ↑ ↓ Entrée Échap), menus Région › Localisation › Situation ›
// Fractionnement (nombre de schémas entre parenthèses ; Situation = contextes tant qu'aucune localisation n'est choisie), liste (2 lignes par
// schéma, intertitre par localisation, termes surlignés, étoile), sans recherche : Consultés récemment, Favoris, puis tous les schémas (25/10/2026, plus de sommaire), états
// (chargement, aucun résultat, erreur). Recherche et menus restent en mémoire pendant la session (comme les filtres de Protocoles).
// Réglages personnels : utilisateurs/{uid}.rtFavoris (identifiants), .rtRecents (8 derniers ouverts), .rtOnglet (dernier onglet de fiche).
// Fiche (RT4) : à partir de 1 280 px, à droite de la liste ; en dessous, page entière avec Retour.
import { collection, doc, getDocs, setDoc, deleteDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { fusionner, trier, chercher, motBloquant, termes, sansAcc, resumePrescription, fmtPrescription, controlePrescription, nombre, calculBED, calculable, fixe, libPreuve, nb, TYPES, FRACTIONNEMENTS, CONTEXTES,
  contraintesSchema, regimeDe, baseEffective, cleOar, REGIMES } from "../moteur/rtref.js";
import { idProtocole } from "./protocoles.js";

let A = null, INDEX = null, CAB = null, LISTE = null, ERREUR = null, CHARGE = null, PROTOS = {};
// Bibliothèques modifiées par le cabinet (25/10/2026) : referentielRT/_oar { oar: { id: { nom, nom_tg263, definition } }, ajouts: [OAR] } et
// referentielRT/_contraintes { lignes: [lignes modifiées (même id) ou ajoutées (cc-…)], retirees: [id] }
let CAB_OAR = null, CAB_CT = null, CAB_PR = null;
// referentielRT/_protocoles { liens: { traitement du référentiel: [identifiants de protocoles] } } : lien vers Protocoles choisi par le cabinet
export const DOCS_BIB = ["_oar", "_contraintes", "_protocoles"];
const LOCS = {}, TEXTES = new Map();
// Recherche et menus de la session ; sel = ligne choisie au clavier ; filtres = menus ouverts sur téléphone
const RF = { q: "", reg: "", loc: "", sit: "", frac: "", sel: -1, filtres: false, y: 0, ouvert: null };
let ARG = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);

// ───── Chargement (une fois par session ; servi en no-cache) ─────
async function json(f) { const r = await fetch("donnees-rt/" + f, { cache: "no-cache" }); if (!r.ok) throw new Error(f + " : " + r.status); return r.json(); }
function charger() {
  if (LISTE) return Promise.resolve();
  if (!CHARGE) CHARGE = (async () => {
    try {
      INDEX = await json("index.json");
      try { PROTOS = (await json("protocoles-chimio.json")).correspondances || {}; } catch (e) { console.warn("protocoles-chimio", e); PROTOS = {}; }
      CAB = {};
      try { (await getDocs(collection(db, "espaces", A.ESPACE, "referentielRT"))).forEach((d) => { CAB[d.id] = d.data(); }); } catch (e) { console.warn("référentiel du cabinet", e); }
      CAB_OAR = CAB._oar || null; CAB_CT = CAB._contraintes || null; CAB_PR = CAB._protocoles || null; DOCS_BIB.forEach((k) => { delete CAB[k]; });
      // fiches du cabinet : acronymes des essais lus dans la bibliothèque (la référence les a déjà dans index.json)
      if (Object.keys(CAB).length) await chargerBibs().catch(() => null);
      LISTE = fusionner(INDEX, CAB, acronymeDe); ERREUR = null;
    } catch (e) { ERREUR = e; CHARGE = null; throw e; }
  })();
  return CHARGE;
}
const locFichier = async (id) => LOCS[id] || (LOCS[id] = await json(id + ".json"));

// ───── Réglages personnels ─────
const profil = () => D().profil || (D().profil = {});
const favoris = () => (Array.isArray(profil().rtFavoris) ? profil().rtFavoris : []);
const recents = () => (Array.isArray(profil().rtRecents) ? profil().rtRecents : []);
function noter(champs) {
  Object.assign(profil(), champs);
  setDoc(doc(db, "utilisateurs", D().u.uid), champs, { merge: true }).catch((e) => A.toast("Pas de connexion : réessayez (" + e.message + ")"));
}
window.rtrEtoile = (id, ev) => {
  if (ev) ev.stopPropagation();
  const f = favoris().slice(), i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.unshift(id);
  noter({ rtFavoris: f }); dessinerListe(); dessinerEnteteFiche();
};
const noterRecent = (id) => noter({ rtRecents: [id].concat(recents().filter((x) => x !== id)).slice(0, 8) });

// ───── Filtres ─────
const loc = (id) => INDEX.localisations.find((l) => l.id === id);
const sit = (id) => INDEX.situations.find((s) => s.id === id);
const regDe = (e) => (loc(e.localisation_id) || {}).region_id;
const fracDe = (e) => TYPES[e.type] || "";
const actifs = () => ["reg", "loc", "sit", "frac"].filter((k) => RF[k]).length;
// Liste filtrée par la recherche, puis par les menus jusqu'au niveau n (exclu) : sert aux nombres de chaque menu
function filtrer(n = 4) {
  let l = chercher(LISTE, RF.q, INDEX, TEXTES);
  if (n > 0 && RF.reg) l = l.filter((e) => regDe(e) === RF.reg);
  if (n > 1 && RF.loc) l = l.filter((e) => e.localisation_id === RF.loc);
  if (n > 2 && RF.sit) l = l.filter((e) => (RF.sit.startsWith("ctx:") ? (sit(e.situation_id) || {}).contexte === RF.sit.slice(4) : e.situation_id === RF.sit));
  if (n > 3 && RF.frac) l = l.filter((e) => fracDe(e) === RF.frac);
  return l;
}
const valeurDe = (k, e) => (k === "reg" ? regDe(e) : k === "loc" ? e.localisation_id : k === "frac" ? fracDe(e) : RF.sit.startsWith("ctx:") ? "ctx:" + (sit(e.situation_id) || {}).contexte : e.situation_id);
const compter = (l, f) => l.reduce((o, e) => { const k = f(e); if (k) o[k] = (o[k] || 0) + 1; return o; }, {});
function menus() {
  const esc = A.esc, opt = (v, lib, n, cur) => '<option value="' + esc(v) + '"' + (cur === v ? " selected" : "") + ">" + esc(lib) + " (" + n + ")</option>";
  const sel = (k, lib, corps) => '<div><label for="rtr_' + k + '">' + lib + '</label><select id="rtr_' + k + '" onchange="const v=this.value;this.blur();setTimeout(()=>rtrMenu(\'' + k + "',v),30)\"><option value=\"\">Toutes</option>" + corps + "</select></div>";
  const nR = compter(filtrer(0), regDe), nL = compter(filtrer(1), (e) => e.localisation_id), l2 = filtrer(2), nF = compter(filtrer(3), fracDe);
  let hS;
  if (!RF.loc) { const n = compter(l2, (e) => (sit(e.situation_id) || {}).contexte); hS = Object.keys(CONTEXTES).filter((c) => n[c]).map((c) => opt("ctx:" + c, CONTEXTES[c], n[c], RF.sit)).join(""); }
  else {
    const n = compter(l2, (e) => e.situation_id), S = INDEX.situations.filter((s) => s.localisation_id === RF.loc && n[s.id]);
    hS = Object.keys(CONTEXTES).map((c) => { const g = S.filter((s) => s.contexte === c); return g.length ? '<optgroup label="' + esc(CONTEXTES[c]) + '">' + g.map((s) => opt(s.id, s.titre, n[s.id], RF.sit)).join("") + "</optgroup>" : ""; }).join("");
  }
  return '<div class="cascade rtr-menus">' + sel("reg", "Région", INDEX.regions.filter((r) => nR[r.id]).map((r) => opt(r.id, r.nom, nR[r.id], RF.reg)).join("")) +
    sel("loc", "Localisation", INDEX.localisations.filter((l) => nL[l.id] && (!RF.reg || l.region_id === RF.reg)).map((l) => opt(l.id, l.nom, nL[l.id], RF.loc)).join("")) +
    sel("sit", "Situation", hS) + sel("frac", "Fractionnement", FRACTIONNEMENTS.filter((f) => nF[f]).map((f) => opt(f, f, nF[f], RF.frac)).join("")) + "</div>";
}
// Changer un menu vide ceux qui suivent s'ils ne sont plus valables
window.rtrMenu = (k, v) => {
  RF[k] = v; RF.sel = -1;
  if (k === "loc" && v) RF.reg = loc(v).region_id;
  const ordre = ["reg", "loc", "sit", "frac"];
  if (k === "loc" && RF.sit.startsWith("ctx:")) RF.sit = ""; // une localisation choisie : le menu Situation passe des contextes aux situations
  ordre.slice(ordre.indexOf(k) + 1).forEach((k2) => { if (RF[k2] && !filtrer(ordre.indexOf(k2)).some((e) => valeurDe(k2, e) === RF[k2])) RF[k2] = ""; });
  dessinerFiltres(); dessinerListe();
};
window.rtrEffacer = () => { Object.assign(RF, { q: "", reg: "", loc: "", sit: "", frac: "", sel: -1 }); const q = $("rtrQ"); if (q) q.value = ""; dessinerFiltres(); dessinerListe(); };
window.rtrFiltres = () => { RF.filtres = !RF.filtres; dessinerFiltres(); };
window.rtrSommaire = (r, l, f) => { Object.assign(RF, { reg: r || "", loc: l || "", sit: "", frac: f || "", sel: -1 }); dessinerFiltres(); dessinerListe(); window.scrollTo(0, 0); };
window.rtrSansMot = (m) => { RF.q = RF.q.split(/\s+/).filter((x) => x !== m).join(" "); const q = $("rtrQ"); if (q) q.value = RF.q; dessinerFiltres(); dessinerListe(); };
function dessinerFiltres() {
  const z = $("rtrFiltres"); if (!z || !LISTE) return;
  const n = actifs();
  z.innerHTML = '<button class="bt clair petit rtr-ftr' + (RF.filtres ? " ouv" : "") + '" onclick="rtrFiltres()">Filtres' + (n ? ' <span class="n">' + n + "</span>" : "") + "</button>" +
    '<div class="rtr-mz' + (RF.filtres ? " ouv" : "") + '">' + menus() + (n || RF.q ? '<button class="bt gris petit" onclick="rtrEffacer()">Effacer</button>' : "") + (peutModif() ? '<button class="bt clair petit rtr-nouv" onclick="rtrNouveau()">' + A.ic("plus") + "Nouveau schéma</button>" : "") + "</div>";
  const h = document.querySelector(".rtr-haut"), r = $("rtr"); if (h && r) r.style.setProperty("--rtr-h", h.offsetHeight + "px");
}

// ───── Liste ─────
// Termes surlignés sans tenir compte des accents : positions trouvées dans le texte simplifié, reportées sur le texte d'origine
function surligner(txt, T) {
  const s = String(txt || ""), esc = A.esc; if (!T.length) return esc(s);
  let plat = "", pos = [];
  for (let i = 0; i < s.length; i++) { const c = sansAcc(s[i]); for (let j = 0; j < c.length; j++) pos.push(i); plat += c; }
  const marque = new Array(s.length).fill(false);
  T.forEach((t) => { if (!t) return; let k = plat.indexOf(t); while (k >= 0) { for (let j = k; j < k + t.length; j++) marque[pos[j]] = true; k = plat.indexOf(t, k + 1); } });
  let h = "", dans = false;
  for (let i = 0; i < s.length; i++) { if (marque[i] !== dans) { h += marque[i] ? "<mark>" : "</mark>"; dans = marque[i]; } h += esc(s[i]); }
  return h + (dans ? "</mark>" : "");
}
function ligne(e, T, i) {
  const esc = A.esc, s = sit(e.situation_id) || {}, l = loc(e.localisation_id) || {}, fav = favoris().indexOf(e.id) >= 0;
  const ess = (e.essais || []).slice(0, 3).join(", ") + ((e.essais || []).length > 3 ? " +" + (e.essais.length - 3) : "");
  return '<div class="rtr-l' + (i === RF.sel ? " sel" : "") + (RF.ouvert === e.id ? " on" : "") + '" role="button" tabindex="-1" data-i="' + i + '" onclick="rtrOuvrir(\'' + esc(e.id) + "')\">" +
    '<div class="rtr-l1"><b>' + surligner(e.titre, T) + '</b><button class="rtr-et' + (fav ? " on" : "") + '" title="' + (fav ? "Retirer des favoris" : "Ajouter aux favoris") + '" aria-pressed="' + fav + '" onclick="rtrEtoile(\'' + esc(e.id) + "',event)\">" + A.ic("etoile") + "</button></div>" +
    '<div class="mesures">' + surligner(l.nom + " › " + (s.titre || ""), T) + (ess ? " · " + surligner(ess, T) : "") + ' · <span class="rtr-ty">' + esc(TYPES[e.type] || "") + "</span>" +
    (e.modifie ? ' <span class="badge b-or">Modifié pour le cabinet</span>' : "") + "</div></div>";
}
let VUS = [];
function dessinerListe() {
  const z = $("rtrListe"); if (!z) return;
  if (!LISTE) { z.innerHTML = ERREUR ? erreurHtml() : '<div class="rtr-ch">' + '<i></i>'.repeat(6) + "</div>"; return; }
  const accueil = !RF.q.trim() && !actifs();
  const L = trier(filtrer(), INDEX, RF.q), T = termes(RF.q), esc = A.esc; VUS = L;
  if (RF.sel >= L.length) RF.sel = L.length - 1;
  // sans recherche ni menu : les schémas consultés récemment et les favoris en tête, puis tous les schémas (comme la page Protocoles)
  let h = (accueil ? blocListe("Consultés récemment", recents()) + blocListe("Favoris", favoris()) + '<h3 class="rtr-tous">Tous les schémas</h3>' : "") + '<p class="mesures rtr-nb">' + L.length + " schéma" + (L.length > 1 ? "s" : "") + "</p>";
  const s = RF.sit && !RF.sit.startsWith("ctx:") ? sit(RF.sit) : null;
  if (s && s.criteres) h += '<p class="rtr-crit">' + esc(s.criteres) + "</p>";
  if (!L.length) {
    const m = motBloquant(LISTE, RF.q, INDEX, TEXTES);
    h += '<div class="vide-c">Aucun schéma ne correspond' + (m ? '<br><button class="bt clair petit" onclick="rtrSansMot(\'' + esc(m).replace(/'/g, "\\'") + "')\">Chercher sans « " + esc(m) + " »</button>" : "") + (actifs() ? ' <button class="bt gris petit" onclick="rtrEffacer()">Effacer les filtres</button>' : "") + "</div>";
  } else {
    const plusieurs = new Set(L.map((e) => e.localisation_id)).size > 1; let cur = null;
    L.forEach((e, i) => { if (plusieurs && e.localisation_id !== cur) { cur = e.localisation_id; const l = loc(cur) || {}; h += '<h4 class="rtr-it">' + esc(((INDEX.regions.find((r) => r.id === l.region_id) || {}).nom || "") + " › " + (l.nom || "")) + "</h4>"; } h += ligne(e, T, i); });
  }
  z.innerHTML = h;
}
function blocListe(titre, ids) {
  const L = ids.map((id) => LISTE.find((e) => e.id === id)).filter(Boolean);
  return L.length ? '<section class="rtr-bloc"><h3>' + titre + "</h3>" + L.map((e, i) => ligne(e, [], 1000 + i)).join("") + "</section>" : "";
}
const erreurHtml = () => '<div class="vide-c">Le référentiel n\'a pas pu être chargé.<br><button class="bt clair petit" id="rtrReessayer" onclick="rtrReessayer()">Réessayer</button></div>';
window.rtrReessayer = () => { ERREUR = null; pageRadiotherapie(ARG); };

// ───── Fiche (RT4, 25/10/2026) : en-tête, six onglets, copier, lien vers Protocoles, impression ─────
// Onglets dans l'ordre de la chaîne de traitement (jamais déplacés ; vide = grisé, avec sa phrase) ; dernier onglet ouvert gardé pour la
// personne (utilisateurs/{uid}.rtOnglet) et dans l'adresse (#radiotherapie/s/<schéma>/<onglet>). Bibliothèques OAR, contraintes et essais lues
// à la première fiche. Textes : une phrase courte, la suite sous « ? » (survol, ou toucher : la suite s'affiche à la place).
const ONGLETS = [["prescription", "Prescription"], ["centrage", "Centrage"], ["contourage", "Contourage"], ["contraintes", "Contraintes"], ["essais", "Essais et sources"], ["attention", "Points d'attention"]];
const MODES = { SIB: "SIB", sequentiel: "Séquentiel", seul: "Seul" };
const CURIE = /curie|implant|HDR|PDR|LDR|plaque/i;
let BIBS = null, FICHE = null, IMPRESSION = false;
const ongletDe = (o) => (ONGLETS.some((x) => x[0] === o) ? o : "prescription");
window.rtrOuvrir = (id) => { RF.y = window.scrollY; location.hash = "radiotherapie/s/" + encodeURIComponent(id) + "/" + ongletDe(profil().rtOnglet); };
window.rtrRetour = () => { location.hash = "radiotherapie"; };
window.rtrOnglet = (o) => { if (ED) { FICHE.onglet = o; dessinerFiche(); return; } if (profil().rtOnglet !== o) noter({ rtOnglet: o }); location.hash = "radiotherapie/s/" + encodeURIComponent(RF.ouvert) + "/" + o; };
// BB : bibliothèques lues (OAR, jeux de contraintes et aide des colonnes, essais), communes à la fiche et aux sous-pages
let ESSAIS = null, BB = null;
// BB.oar et BB.base : référence + changements du cabinet ; BB.jeux = contraintes propres aux essais et à la curiethérapie ; BB.paires = droite et gauche
const chargerBibs = () => BIBS || (BIBS = Promise.all(["oar.json", "contraintes.json", "essais.json"].map(json)).then(([o, c, e]) => { ESSAIS = {}; e.essais.forEach((x) => { ESSAIS[x.id] = x.acronyme; });
  BB = { oarRef: o.oar, paires: o.paires || [], baseRef: c.base || [], jeux: c.essais || [], aideCol: c.aide || {}, aide: c.aide_colonnes, essais: e.essais }; appliquerCab(); return BB; }).catch((e) => { BIBS = null; throw e; }));
function appliquerCab() {
  if (!BB) return;
  const m = (CAB_OAR && CAB_OAR.oar) || {};
  BB.oar = BB.oarRef.map((o) => (m[o.id] ? Object.assign({}, o, m[o.id], { cabinet: true }) : o)).concat(((CAB_OAR && CAB_OAR.ajouts) || []).map((o) => Object.assign({ region: "divers" }, o, { cabinet: true, ajout: true })));
  BB.base = baseEffective(BB.baseRef, CAB_CT);
}
const acronymeDe = (id) => (ESSAIS && ESSAIS[id]) || id;
async function ouvrirFiche(id, onglet) {
  const e = LISTE.find((x) => x.id === id), z = $("rtrFiche"); if (!z) return;
  RF.ouvert = id;
  if (!e) { FICHE = null; z.innerHTML = '<div class="vide-c">Ce schéma n\'existe pas ou plus.<br><button class="bt clair petit" onclick="rtrRetour()">' + A.ic("retour") + "Retour</button></div>"; return; }
  if (recents()[0] !== id) noterRecent(id);
  if (!FICHE || FICHE.e.id !== id) z.innerHTML = '<div class="rtr-ch">' + "<i></i>".repeat(4) + "</div>";
  try {
    const [L, B] = await Promise.all([locFichier(e.localisation_id), chargerBibs()]), c = CAB[id];
    FICHE = { e, cab: c || null, schema: c && c.schema ? c.schema : L.schemas.find((s) => s.id === id) || {}, loc: L, B, onglet: ongletDe(onglet) };
  } catch (er) { console.warn("fiche", er); z.innerHTML = erreurHtml(); return; }
  if (RF.ouvert === id) dessinerFiche();
}
const dessinerEnteteFiche = () => { if (FICHE && $("rtrFiche")) dessinerFiche(); };

// Petits morceaux communs
const dfr = (d) => String(d || "").split("-").reverse().join("/");
// Textes toujours écrits en entier (demande de Dr Bentahila du 25/10/2026 : plus aucun « ? » dans le module)
const court = (t) => A.esc(String(t == null ? "" : t));
// Paragraphes rédigés : HTML échappé, puis **gras**, `identifiant` et [lien](url) seulement
const md = (t) => A.esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
const textes = (k) => ((FICHE.loc.textes || {})[k] || []).map((p) => '<p class="rtr-tx">' + md(p) + "</p>").join("");
// valeur absente : « — » (la note de la ligne est écrite sous le volume)
const vide = () => "—";
const num = (v, suf) => (typeof v === "number" && isFinite(v) ? nb(v) + (suf || "") : null);
const essai = (id) => BB.essais.find((x) => x.id === id);
const acronymes = (ids) => (ids || []).map((i) => (essai(i) || {}).acronyme || i).join(", ");
// Organe, paire droite et gauche (nom de la paire, deux noms TG-263) ou cible
function oar(id) {
  if (id === "cible-ctv") return { nom: "Cible (CTV)" }; if (id === "cible-ptv") return { nom: "Cible (PTV)" };
  const o = BB.oar.find((x) => x.id === id); if (o) return o;
  const p = BB.paires.find((x) => x.id === id);
  return p ? { id, nom: p.nom, nom_tg263: p.membres.map((m) => (BB.oar.find((x) => x.id === m) || {}).nom_tg263).filter(Boolean).join(" / "), paire: true } : { nom: id };
}
// Lien vers Protocoles : le choix du cabinet (referentielRT/_protocoles), sinon le nom exact, sinon les protocoles correspondants
// (donnees-rt/protocoles-chimio.json, selon la localisation ; tous ceux présents dans le cabinet) ; sans protocole : la page filtrée sur la
// localisation ; sans module chimio ni la fonction : le nom seul. Le médecin qui a le droit « modifier » change le lien (« Changer »).
const bibProto = () => (D().ctx && D().ctx.bib) || {};
function idsCorrespondants(nom) {
  const bib = bibProto(), cab = CAB_PR && CAB_PR.liens && CAB_PR.liens[nom];
  if (cab) return cab.filter((i) => bib[i]);
  const exact = idProtocole(nom); if (exact) return [exact];
  const m = PROTOS[nom], L = Array.isArray(m) ? m : m ? m[FICHE.e.localisation_id] || m["*"] || [] : [];
  return L.filter((i) => bib[i]);
}
const NOMS_PR = [];
function lienProtocole(nom) {
  const esc = A.esc; if (!nom) return "";
  if (!A.module("chimio") || !A.fn("chimio.protocoles")) return nom === "—" ? "" : esc(nom);
  const ids = nom === "—" ? [] : idsCorrespondants(nom), bib = bibProto();
  let i = NOMS_PR.indexOf(nom); if (i < 0) { NOMS_PR.push(nom); i = NOMS_PR.length - 1; }
  const liens = ids.length > 1 ? ids.map((id) => '<a class="rtr-lien" href="#protocoles/' + encodeURIComponent(id) + '">' + esc(bib[id].nom) + " ›</a>").join(" · ")
    : '<a class="rtr-lien" href="#protocoles/' + (ids.length ? encodeURIComponent(ids[0]) : "loc/" + encodeURIComponent(FICHE.loc.nom)) + '">Ouvrir dans Protocoles ›</a>';
  return (nom === "—" ? "" : esc(nom) + " ") + liens + (peutModif() && nom !== "—" && !IMPRESSION ? ' <button type="button" class="mini rtr-chg" onclick="rtrLienProto(' + i + ')">' + A.ic("crayon") + "Changer</button>" : "");
}
// « Changer » : protocoles liés (retirer), en ajouter un (recherche dans la bibliothèque), revenir au lien de la référence
let LP = null;
window.rtrLienProto = (i) => {
  const nom = NOMS_PR[i]; if (!nom || !peutModif()) return;
  LP = { nom, ids: idsCorrespondants(nom).slice() }; dessinerLienProto();
};
function dessinerLienProto() {
  const esc = A.esc, bib = bibProto(), L = Object.values(bib).filter((p) => p && p.nom).sort((a, b) => sansAcc(a.nom).localeCompare(sansAcc(b.nom)));
  A.fenetre("<h3>Protocole lié</h3><p class=\"mesures\">" + esc(LP.nom) + '</p><ul class="rtr-sys rtr-lp">' + (LP.ids.length ? LP.ids.map((id, k) => "<li>" + esc((bib[id] || {}).nom || id) + ' <button type="button" class="mini" onclick="rtrLpRet(' + k + ')" aria-label="Retirer">' + A.ic("croix") + "</button></li>").join("") : '<li class="mesures">Aucun : la page Protocoles s\'ouvrira filtrée sur la localisation</li>') + "</ul>" +
    '<label class="rtr-lab">Ajouter un protocole de la bibliothèque<input id="rtrLpQ" class="rtr-in" list="rtrLpL" placeholder="Nom du protocole" onchange="rtrLpAj(this.value)"></label><datalist id="rtrLpL">' + L.map((p) => '<option value="' + esc(p.nom) + '">').join("") + "</datalist>" +
    '<div class="actr">' + (CAB_PR && CAB_PR.liens && CAB_PR.liens[LP.nom] ? '<button class="bt rouge" onclick="rtrLpOk(1)">Revenir au lien de la référence</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="rtrLpOk()">' + A.ic("enregistrer") + "Enregistrer pour le cabinet</button></div>");
}
window.rtrLpRet = (k) => { LP.ids.splice(k, 1); dessinerLienProto(); };
window.rtrLpAj = (v) => { const p = Object.values(bibProto()).find((x) => x && x.nom === v); if (p && LP.ids.indexOf(p.id) < 0) LP.ids.push(p.id); dessinerLienProto(); };
window.rtrLpOk = async (revenir) => {
  if (!LP || !peutModif()) return;
  const ref = doc(db, "espaces", A.ESPACE, "referentielRT", "_protocoles");
  try {
    CAB_PR = await runTransaction(db, async (tx) => {
      const sn = await tx.get(ref), c = sn.exists() ? sn.data() : { liens: {} }; c.liens = c.liens || {};
      if (revenir) delete c.liens[LP.nom]; else c.liens[LP.nom] = LP.ids.slice();
      Object.assign(c, { majPar: D().u.uid, majParNom: $("nomMenu") ? $("nomMenu").textContent : "", majLe: new Date().toISOString() });
      tx.set(ref, c); return c;
    });
  } catch (e) { console.warn("lien vers Protocoles", e); A.toast("Pas de connexion : réessayez"); return; }
  LP = null; A.fermerFenetre(); A.toast(revenir ? "Lien de la référence rétabli" : "Enregistré pour le cabinet"); if (FICHE) dessinerFiche();
};

// Prescription
function tablePrescription(L) {
  const esc = A.esc;
  return '<div class="rtr-tw"><table class="rtr-tab"><thead><tr><th>Volume</th><th class="n">Dose totale (Gy)</th><th class="n">Séances</th><th class="n">Dose par séance (Gy)</th><th>Mode</th><th>Rythme</th></tr></thead><tbody>' +
    L.map((p) => "<tr" + (p.mode === "SIB" ? ' class="sib"' : "") + '><td data-l="Volume"><b>' + esc(p.volume || "") + "</b>" + (p.note ? '<div class="mesures">' + court(p.note) + "</div>" : "") + "</td>" +
      '<td class="n" data-l="Dose totale (Gy)">' + (num(p.dose_Gy) || vide(p.note)) + '</td><td class="n" data-l="Séances">' + (num(p.fractions) || "—") + '</td><td class="n" data-l="Dose par séance (Gy)">' + (num(p.dose_fx_Gy) || "—") + "</td>" +
      '<td data-l="Mode">' + esc(MODES[p.mode] || p.mode || "") + '</td><td data-l="Rythme">' + court(p.rythme || "", 40) + (IMPRESSION ? "" : calculable(p) ? ' <a class="rtr-eqd" href="#radiotherapie/calcul/' + p.dose_fx_Gy + "/" + p.fractions + '" title="Calcul BED / EQD2 prérempli">EQD2</a>' : ' <span class="rtr-eqd off" title="Calcul non applicable : PDR, LDR ou dose à définir">EQD2</span>') + "</td></tr>").join("") + "</tbody></table></div>";
}
function lignesSyst(rows, champ) {
  const esc = A.esc, s = FICHE.schema;
  const L = rows.filter((x) => !x.situation_id || x.situation_id === s.situation_id); if (!L.length) return "";
  // situation écrite seulement si ce n'est pas celle du schéma (nom de la situation, jamais son identifiant)
  const lib = (x) => { const id = x.situation_id || x.situation, st = sit(id); if (id === s.situation_id) return ""; return st ? st.titre : x.situation || ""; };
  return '<ul class="rtr-sys">' + L.map((x) => "<li>" + (lib(x) ? '<span class="mesures">' + esc(lib(x)) + " :</span> " : "") + court(x[champ] || "", 140) + (x.protocole ? " · " + lienProtocole(x.protocole) : "") +
    (x.essai_ids && x.essai_ids.length ? ' <span class="mesures">(' + esc(acronymes(x.essai_ids)) + ")</span>" : "") + (x.note ? '<div class="mesures">' + court(x.note) + "</div>" : "") + "</li>").join("") + "</ul>";
}
function ongletPrescription() {
  const esc = A.esc, s = FICHE.schema, P = s.prescriptions || [], L = FICHE.loc, curie = /curie/.test(s.type || "");
  let h = "";
  // RTE + curiethérapie : deux tableaux, d'après le nom du volume seulement (une note peut citer la curiethérapie sur une ligne de RTE)
  const c = (p) => CURIE.test(p.volume || ""), nc = P.filter(c).length;
  if (s.type === "rte_plus_curie" && nc && nc < P.length) h += "<h4>Radiothérapie externe</h4>" + tablePrescription(P.filter((p) => !c(p))) + "<h4>Curiethérapie</h4>" + tablePrescription(P.filter(c));
  else h += tablePrescription(P);
  if (s.technique) h += '<p class="rtr-l2"><span class="mesures">Technique</span> ' + court(s.technique, 160) + "</p>";
  const sys = (s.systemique ? '<p class="rtr-l2"><span class="mesures">Traitement associé</span> ' + court(s.systemique, 160) + "</p>" : "") + lignesSyst(L.systemique || [], "traitement") + lignesSyst(L.hormonotherapie || [], "hormonotherapie");
  if (sys) h += "<h4>Traitement systémique</h4>" + sys + textes("systemique");
  if (curie && (L.curie_indications || []).length) h += "<h4>Curiethérapie : indications</h4><ul class=\"rtr-sys\">" + L.curie_indications.map((x) => "<li><b>" + esc(x.indication || "") + "</b> · " + esc(x.modalite || "") + (x.niveau_preuve ? ' <span class="mesures">(' + esc(x.niveau_preuve) + ")</span>" : "") + (x.note ? '<div class="mesures">' + court(x.note) + "</div>" : "") + "</li>").join("") + "</ul>" + textes("curietherapie");
  if (FICHE.cab && FICHE.cab.note) h += "<h4>Note du médecin</h4><p>" + esc(FICHE.cab.note) + "</p>";
  return h;
}
// Centrage
const SIM = [["position", "Position"], ["contention", "Contention"], ["preparation", "Préparation"], ["scanner", "Scanner"], ["imagerie", "Imagerie"], ["reperes", "Repères"]];
const simDe = () => FICHE.schema.simulation || (FICHE.loc.simulations || []).find((x) => x.id === FICHE.schema.simulation_id);
function ongletCentrage() {
  const m = simDe(); if (!m) return '<p class="vide-c">Pas de fiche de centrage du service pour cette localisation</p>' + textes("centrage");
  return '<dl class="rtr-dl">' + SIM.filter(([k]) => m[k]).map(([k, lib]) => "<dt>" + lib + "</dt><dd>" + court(m[k], 220) + "</dd>").join("") + (m.autres || []).filter((x) => x.lib || x.val).map((x) => "<dt>" + court(x.lib) + "</dt><dd>" + court(x.val) + "</dd>").join("") + "</dl>" + textes("centrage");
}
// Contourage
const volDe = () => FICHE.schema.volumes || (FICHE.loc.volumes || []).find((x) => x.id === FICHE.schema.volumes_id);
function ongletContourage() {
  const esc = A.esc, v = volDe(); if (!v) return '<p class="vide-c">Pas de volumes décrits pour ce schéma</p>' + textes("contourage");
  let h = '<div class="rtr-tw"><table class="rtr-tab"><thead><tr><th>Nom</th><th>Type</th><th>Définition</th><th>Quand</th><th>Marge</th></tr></thead><tbody>' + (v.cibles || []).map((c) =>
    '<tr><td data-l="Nom"><b>' + esc(c.nom || "") + '</b></td><td data-l="Type"><span class="badge b-gr">' + esc(c.type || "") + '</span></td><td data-l="Définition">' + court(c.definition || "") + '</td><td data-l="Quand">' + court(c.quand || "", 60) + '</td><td data-l="Marge"><b>' + esc(c.marge || "—") + "</b></td></tr>").join("") + "</tbody></table></div>";
  // organes à risque : le nom et le nom TG-263 seulement (la définition est dans la page Organes à risque)
  if ((v.oar_ids || []).length) h += '<h4>Organes à risque à contourer</h4><ul class="rtr-oar">' + v.oar_ids.map((id) => { const o = oar(id);
    return "<li>" + esc(o.nom) + (o.nom_tg263 ? ' <span class="mesures">' + esc(o.nom_tg263) + "</span>" : "") + "</li>"; }).join("") + "</ul>";
  return h + textes("contourage");
}
// Contraintes : un bloc par jeu, lignes groupées par OAR ; « ? » d'Idéal et de Limitant tirés de aide_colonnes
function aideDe(j) { const A2 = BB.aide || []; return A2.find((a) => a.source_contient !== "defaut" && String(j.source || "").indexOf(a.source_contient) >= 0) || A2.find((a) => a.source_contient === "defaut") || {}; }
function groupes(j) { const g = []; j.lignes.forEach((l) => { const d = g[g.length - 1]; if (d && d.oar === l.oar_id) d.l.push(l); else g.push({ oar: l.oar_id, l: [l] }); }); return g; }
function tableJeu(j, i) {
  const esc = A.esc, a = aideDe(j);
  return '<section class="rtr-jeu" id="rtrJeu' + i + '"><div class="rtr-jt"><div><h4>' + esc(j.titre) + '</h4><p class="mesures">' + esc([j.fractionnement, j.source].filter(Boolean).join(" · ")) + "</p>" + (a.ideal || a.limitant ? '<p class="mesures rtr-aidec">' + (a.ideal ? "<b>Idéal</b> : " + esc(a.ideal) : "") + (a.ideal && a.limitant ? " · " : "") + (a.limitant ? "<b>Limitant</b> : " + esc(a.limitant) : "") + "</p>" : "") + "</div>" +
    (IMPRESSION ? "" : '<button type="button" class="mini rtr-cp" onclick="rtrCopierJeu(\'' + esc(j.id) + '\')">' + A.ic("copier") + "Copier</button>") + "</div>" +
    '<div class="rtr-tw"><table class="rtr-tab rtr-ct"><thead><tr><th>Organe</th><th>Indicateur</th><th class="n">Idéal</th><th class="n">Limitant</th><th>Note</th></tr></thead><tbody>' +
    groupes(j).map((g) => { const o = oar(g.oar); return g.l.map((l, k) => '<tr class="' + (k ? "" : "g1") + '">' + (k ? "" : '<td class="o" rowspan="' + g.l.length + '" data-l="Organe"><b>' + esc(o.nom) + "</b>" + (o.nom_tg263 ? '<br><span class="mesures">' + esc(o.nom_tg263) + "</span>" : "") + "</td>") +
      '<td data-l="Indicateur">' + esc(l.indicateur || "") + '</td><td class="n" data-l="Idéal">' + esc(l.ideal || "") + '</td><td class="n lim" data-l="Limitant">' + esc(l.limitant || "") + '</td><td data-l="Note">' + court(l.note || "", 60) + "</td></tr>").join(""); }).join("") + "</tbody></table></div></section>";
}
// Objectifs de couverture des volumes cibles : en tête de l'onglet Contraintes
const couvHtml = () => (FICHE.schema.couverture ? '<section class="rtr-couv"><h4>Objectifs de couverture</h4><p>' + court(FICHE.schema.couverture) + "</p></section>" : "");
// Une seule table (25/10/2026) : pour chaque organe contouré, la contrainte de la base pour le régime du schéma (RecoRad 2025, précisions de la
// localisation, moteur/rtref.js contraintesSchema), ou celle de l'essai suivi ; table modifiée pour le schéma par le cabinet (schema.contraintes)
function grouperLignes(L, origine) {
  const g = []; L.forEach((l) => { let x = g.find((y) => y.cle === l.oar_id); if (!x) { x = { cle: l.oar_id, origine, lignes: [] }; g.push(x); } x.lignes.push(l); });
  return g.sort((a, b) => (/^cible-/.test(b.cle) ? 1 : 0) - (/^cible-/.test(a.cle) ? 1 : 0));
}
function contraintesCalculees(schema) {
  const v = volDe() || {};
  return contraintesSchema({ schema, loc: FICHE.e.localisation_id, oarIds: v.oar_ids || [], oar: BB.oar, base: BB.base, essais: BB.jeux });
}
const lignesFiche = () => (Array.isArray(FICHE.schema.contraintes) ? grouperLignes(FICHE.schema.contraintes, "cabinet") : contraintesCalculees(FICHE.schema));
function enteteContraintes() {
  const rg = regimeDe(FICHE.schema), a = BB.aideCol || {};
  return '<p class="mesures rtr-aidec">' + (rg ? "<b>" + REGIMES[rg.regime] + (rg.fx ? " · " + rg.fx + " séance" + (rg.fx > 1 ? "s" : "") : "") + "</b> · " : "") + (a.ideal ? "<b>Idéal</b> : " + A.esc(a.ideal) + " · " : "") + (a.limitant ? "<b>Limitant</b> : " + A.esc(a.limitant) : "") + "</p>";
}
function sourceGroupe(g) {
  if (g.origine === "conversion") return "Pas de valeur publiée pour ce fractionnement : valeur du normofractionné, à convertir en EQD2";
  if (g.origine === "cabinet") return "Pratique du cabinet";
  const src = [...new Set(g.lignes.map((l) => l.source).filter(Boolean))].join(" ; ");
  return (g.proche ? "Valeurs publiées pour " + g.proche + " séance" + (g.proche > 1 ? "s" : "") + (g.plusLarge ? ", plus permissives : à adapter" : "") + " · " : "") + src;
}
function tableContraintes(G) {
  const esc = A.esc;
  return '<div class="rtr-tw"><table class="rtr-tab rtr-ct"><thead><tr><th>Organe</th><th>Indicateur</th><th class="n">Idéal</th><th class="n">Limitant</th><th>Note</th></tr></thead><tbody>' +
    G.map((g) => { const o = oar(g.cle), src = sourceGroupe(g), L = g.lignes.length ? g.lignes : [null];
      const tete = (n) => '<td class="o" rowspan="' + n + '" data-l="Organe"><b>' + esc(o.nom) + "</b>" + (o.nom_tg263 ? '<br><span class="mesures">' + esc(o.nom_tg263) + "</span>" : "") + (src ? '<div class="mesures rtr-src' + (g.origine === "conversion" ? " conv" : "") + '">' + esc(src) + "</div>" : "") + "</td>";
      return L.map((l, k) => '<tr class="' + (k ? "" : "g1") + (g.origine === "conversion" ? " conv" : "") + '">' + (k ? "" : tete(L.length)) +
        (l ? '<td data-l="Indicateur">' + esc(l.indicateur || "") + '</td><td class="n" data-l="Idéal">' + esc(l.ideal || "") + '</td><td class="n lim" data-l="Limitant">' + esc(l.limitant || "") + '</td><td data-l="Note">' + court(l.note || "") + "</td>"
          : '<td colspan="4" class="mesures" data-l="Contrainte">Aucune contrainte publiée</td>') + "</tr>").join(""); }).join("") + "</tbody></table></div>";
}
function ongletContraintes() {
  const G = lignesFiche();
  if (!G.length) return couvHtml() + '<p class="vide-c">Aucun organe à risque contouré pour ce schéma</p>';
  return couvHtml() + '<div class="rtr-jt"><div>' + enteteContraintes() + "</div>" + (IMPRESSION ? "" : '<button type="button" class="mini rtr-cp" onclick="rtrCopierCt()">' + A.ic("copier") + "Copier</button>") + "</div>" + tableContraintes(G);
}
window.rtrCopierCt = () => {
  if (!FICHE) return;
  const t = [[FICHE.e.titre, resumePrescription(FICHE.schema)].join("\t"), ["Organe", "TG-263", "Indicateur", "Idéal", "Limitant", "Note", "Source"].join("\t")]
    .concat([].concat(...lignesFiche().map((g) => { const o = oar(g.cle); return g.lignes.map((l) => [o.nom, o.nom_tg263 || "", l.indicateur || "", l.ideal || "", l.limitant || "", l.note || "", sourceGroupe(g)].join("\t")); }))).join("\n");
  copier(t, "Tableau copié");
};
window.rtrCopierJeu = (id) => {
  const j = BB.jeux.find((x) => x.id === id); if (!j) return;
  const t = [[j.titre, j.fractionnement || "", j.source || ""].join("\t"), ["Organe", "TG-263", "Indicateur", "Idéal", "Limitant", "Note"].join("\t")]
    .concat(j.lignes.map((l) => { const o = oar(l.oar_id); return [o.nom, o.nom_tg263 || "", l.indicateur || "", l.ideal || "", l.limitant || "", l.note || ""].join("\t"); })).join("\n");
  copier(t, "Tableau copié");
};
function copier(t, msg) {
  try { navigator.clipboard.writeText(t).then(() => A.toast(msg), () => A.toast("Copie impossible sur cet appareil")); } catch (e) { A.toast("Copie impossible sur cet appareil"); }
}
// Essais et sources
function ongletEssais() {
  const esc = A.esc, s = FICHE.schema, E = (s.essai_ids || []).map(essai).filter(Boolean);
  const liens = (x) => [].concat(x.pmid ? [x.pmid] : [], x.pmid_suite || []).map((p, i) => '<a href="https://pubmed.ncbi.nlm.nih.gov/' + esc(p) + '/" target="_blank" rel="noopener">PubMed' + (i ? " " + (i + 1) : "") + "</a>")
    .concat([].concat(x.doi ? [x.doi] : [], x.doi_suite || []).map((d, i) => '<a href="https://doi.org/' + esc(d) + '" target="_blank" rel="noopener">DOI' + (i ? " " + (i + 1) : "") + "</a>")).join("");
  let h = E.length ? '<div class="rtr-es">' + E.map((x) => '<details class="rtr-e"' + (IMPRESSION ? " open" : "") + "><summary><span class=\"t\"><b>" + esc(x.acronyme) + "</b> " + '<span class="mesures">' + esc([x.revue, x.annee].filter(Boolean).join(", ")) + "</span><br>" + court(x.resultat || "", 140) + '</span><span class="rtr-ln">' + liens(x) + "</span></summary>" +
    '<div class="rtr-ed">' + (x.population ? "<p><span class=\"mesures\">Population</span> " + esc(x.population) + "</p>" : "") + (x.bras ? "<p><span class=\"mesures\">Bras</span> " + esc(x.bras) + "</p>" : "") +
    (IMPRESSION ? "" : '<button type="button" class="mini" onclick="rtrCopierRef(\'' + esc(x.id) + "')\">" + A.ic("copier") + "Copier la référence</button>") + "</div></details>").join("") + "</div>" : '<p class="vide-c">Pas d\'essai cité pour ce schéma</p>';
  if (s.source_institutionnelle) h += "<h4>Source institutionnelle</h4><p>" + esc(s.source_institutionnelle) + "</p>";
  return h;
}
window.rtrCopierRef = (id) => { const x = essai(id); if (x) copier([x.acronyme, x.revue, x.annee, x.pmid ? "PMID " + x.pmid : ""].filter(Boolean).join(", "), "Référence copiée"); };
// Points d'attention : ceux du schéma et ceux de toute la localisation, sans doublon
function pointsDe() { const p = (FICHE.schema.points_attention || []).slice(); (FICHE.loc.points_attention || []).forEach((x) => { if (x.portee === "localisation" && p.indexOf(x.point) < 0) p.push(x.point); }); return p; }
const ongletAttention = () => { const p = pointsDe(); return p.length ? '<ul class="rtr-pts">' + p.map((x) => "<li>" + md(x) + "</li>").join("") + "</ul>" : '<p class="vide-c">Pas de point d\'attention pour ce schéma</p>'; };
const RENDUS = { prescription: ongletPrescription, centrage: ongletCentrage, contourage: ongletContourage, contraintes: ongletContraintes, essais: ongletEssais, attention: ongletAttention };
function nombres() { return { prescription: (FICHE.schema.prescriptions || []).length, centrage: simDe() ? 1 : 0, contourage: volDe() ? 1 : 0, contraintes: lignesFiche().reduce((n, g) => n + g.lignes.length, 0), essais: (FICHE.schema.essai_ids || []).length, attention: pointsDe().length }; }
function enteteHtml() {
  const esc = A.esc, { e, schema } = FICHE, s = sit(e.situation_id) || {}, l = loc(e.localisation_id) || {}, r = INDEX.regions.find((x) => x.id === l.region_id) || {}, fav = favoris().indexOf(e.id) >= 0;
  const etoile = '<button class="rtr-et' + (fav ? " on" : "") + '" title="' + (fav ? "Retirer des favoris" : "Ajouter aux favoris") + '" aria-pressed="' + fav + '" onclick="rtrEtoile(\'' + esc(e.id) + "')\">" + A.ic("etoile") + "</button>";
  return '<div class="rtr-ft"><button class="mini rtr-ret" onclick="rtrRetour()">' + A.ic("retour") + "Retour à la liste</button>" +
    '<div class="rtr-ar" role="navigation" aria-label="Fil d\'Ariane"><a href="#radiotherapie" onclick="rtrSommaire(\'' + r.id + "','');return true\">" + esc(r.nom || "") + '</a> › <a href="#radiotherapie" onclick="rtrSommaire(\'' + r.id + "','" + l.id + "');return true\">" + esc(l.nom || "") + "</a> › <span>" + esc(s.titre || "") + "</span></div>" +
    (ED ? '<div class="rtr-t rtr-ted"><label class="rtr-lab">Titre du schéma' + inp("titre", ED.schema.titre, "Titre du schéma") + "</label>" + err("titre") + "</div>" : '<div class="rtr-t"><h2>' + esc(e.titre) + '</h2><div class="rtr-act">' + etoile + actions() + "</div></div>") +
    '<div class="rtr-res">' + esc(resumePrescription(schema)) + ' <span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>Validé</span> <span class="badge b-gr">' + esc(libPreuve(schema.preuve || e.preuve)) + "</span>" + (schema.date_verif ? ' <span class="mesures">Vérifié le ' + esc(dfr(schema.date_verif)) + "</span>" : "") + "</div>" +
    (e.modifie && !ED ? '<p class="mesures rtr-mod"><span class="badge b-or">Modifié pour le cabinet</span>' + (e.cab && e.cab.majParNom ? " · par " + esc(e.cab.majParNom) + (e.cab.majLe ? " le " + esc(dfr(String(e.cab.majLe).slice(0, 10))) : "") : "") +
      (e.nouveau ? "" : e.refChangee ? ' · La référence a changé depuis · <a href="#" class="rtr-lien" onclick="rtrComparer();return false">Voir la comparaison</a>' : ' · <a href="#" class="rtr-lien" onclick="rtrComparer();return false">Voir la référence</a>') + "</p>" : "") + "</div>";
}
// Actions de la fiche, toujours dans le même ordre : étoile, Imprimer, « Modifier pour le cabinet », ⋯ (Dupliquer, Voir la référence, puis en rouge
// et en dernier Revenir à la référence ou Supprimer le schéma) ; sous 900 px, Imprimer et Modifier passent dans ⋯
function actions() {
  const mod = peutModif(), c = FICHE.cab, ic = A.ic, fm = "this.closest('details').open=false;";
  const tel = '<button class="mini rtr-tel" onclick="' + fm + 'rtrImprimer()">' + ic("imprimer") + "Imprimer</button>" + (mod ? '<button class="mini rtr-tel" onclick="' + fm + 'rtrModifier()">' + ic("crayon") + "Modifier pour le cabinet</button>" : "");
  const autres = (mod ? '<button class="mini" onclick="' + fm + 'rtrDupliquer()">' + ic("copier") + "Dupliquer</button>" : "") + (c && !c.nouveau ? '<button class="mini" onclick="' + fm + 'rtrComparer()">' + ic("liste") + "Voir la référence</button>" : "") +
    (mod && c ? '<button class="mini rouge-t" onclick="' + fm + 'rtrRevenir()">' + ic("retour") + (c.nouveau ? "Supprimer le schéma" : "Revenir à la référence") + "</button>" : "");
  return '<button class="bt clair petit rtr-imp" onclick="rtrImprimer()">' + ic("imprimer") + "Imprimer</button>" + (mod ? '<button class="bt clair petit rtr-mbt" onclick="rtrModifier()">' + ic("crayon") + "Modifier pour le cabinet</button>" : "") +
    '<details class="m3 rtr-pts3' + (autres ? "" : " seul") + '"><summary class="mini" title="Autres actions" aria-label="Autres actions">⋯</summary><div class="m3-l">' + tel + autres + "</div></details>";
}
function dessinerFiche() {
  const z = $("rtrFiche"); if (!z || !FICHE) return;
  const n = nombres(), o = FICHE.onglet, R = ED ? EDITS : RENDUS;
  z.innerHTML = enteteHtml() + '<div class="ag-vues defile rtr-ong" role="tablist">' + ONGLETS.map(([k, lib]) => '<button role="tab" aria-selected="' + (k === o) + '" class="' + (k === o ? "on" : "") + (n[k] ? "" : " vide") + '" onclick="rtrOnglet(\'' + k + "')\">" + lib + (n[k] && ["contraintes", "essais", "attention"].indexOf(k) >= 0 ? ' <span class="n">' + n[k] + "</span>" : "") + "</button>").join("") + "</div>" +
    '<div class="rtr-oc" role="tabpanel">' + R[o]() + "</div>" +
    (ED ? '<div class="barre-enr rtr-barre"><button class="bt gris" onclick="rtrAnnulerEd()">Annuler</button><span class="mesures" id="rtrBmsg" aria-live="polite"></span><button class="bt plein" id="rtrEnr" onclick="rtrEnregistrer()">' + A.ic("enregistrer") + "Enregistrer pour le cabinet</button></div>" : "");
  const on = z.querySelector(".rtr-ong .on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (ED) { majEtat(); if (ED.choisir) { ED.choisir = false; const t = z.querySelector('[data-p="titre"]'); if (t) { t.focus(); t.select(); } } }
}

// Impression : sections cochées (toutes par défaut), A4 portrait, en-tête Onco360 et nom du médecin, sources et date en pied de page
window.rtrImprimer = () => {
  if (!FICHE) return;
  A.fenetre("<h3>Imprimer la fiche</h3><p class=\"mesures\">" + A.esc(FICHE.e.titre) + '</p><div class="rtr-ic">' + ONGLETS.map(([k, lib]) => '<label><input type="checkbox" data-s="' + k + '" checked style="width:auto"> ' + lib + "</label>").join("") +
    '</div><div class="actr"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="rtrImprimerOk()">' + A.ic("imprimer") + "Imprimer</button></div>");
};
window.rtrImprimerOk = () => {
  const ks = [...document.querySelectorAll(".rtr-ic input:checked")].map((i) => i.dataset.s); A.fermerFenetre(); if (!ks.length) return;
  const esc = A.esc, { e, schema } = FICHE, s = sit(e.situation_id) || {}, l = loc(e.localisation_id) || {};
  IMPRESSION = true;
  let corps = "";
  try { corps = ONGLETS.filter(([k]) => ks.indexOf(k) >= 0).map(([k, lib]) => '<section><h2>' + lib + "</h2>" + RENDUS[k]() + "</section>").join(""); } finally { IMPRESSION = false; }
  const sources = [acronymes(schema.essai_ids), schema.source_institutionnelle].filter(Boolean).join(" ; ");
  const html = '<header><b>Onco360</b> · Référentiel de radiothérapie<span>' + esc($("nomMenu") ? $("nomMenu").textContent : "") + "</span></header>" +
    (e.modifie ? '<p class="vc">Version du cabinet, modifiée le ' + esc(dfr(String((e.cab && e.cab.majLe) || "").slice(0, 10))) + "</p>" : "") +
    '<p class="ar">' + esc([l.nom, s.titre].filter(Boolean).join(" › ")) + "</p><h1>" + esc(e.titre) + '</h1><p class="res">' + esc(resumePrescription(schema)) + " · " + esc(libPreuve(schema.preuve || e.preuve)) + (schema.date_verif ? " · vérifié le " + esc(dfr(schema.date_verif)) : "") + "</p>" + corps +
    "<footer>" + (sources ? "Sources : " + esc(sources) + " · " : "") + "Imprimé le " + esc(new Date().toLocaleDateString("fr-FR")) + "</footer>";
  const doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>&#8203;</title><style>' + CSS_IMP + "</style></head><body>" + html + "</body></html>";
  let w = null; try { w = window.open("", "_blank"); } catch (er) { w = null; }
  if (w && w.document) { w.document.open(); w.document.write(doc); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 500); } else A.toast("Impression bloquée : autorisez les fenêtres d'Onco360");
};
const CSS_IMP = "@page{size:A4 portrait;margin:14mm 12mm}body{font-family:Arial,sans-serif;font-size:10.5pt;color:#1E2A44}header{display:flex;justify-content:space-between;border-bottom:1px solid #999;padding-bottom:4px;font-size:9pt}" +
  "h1{font-size:15pt;margin:4px 0}h2{font-size:12pt;margin:14px 0 4px;border-bottom:1px solid #ccc}h4{margin:10px 0 4px;font-size:10.5pt}.ar,.res,.mesures,.vc{color:#555;font-size:9.5pt;margin:2px 0}.vc{font-weight:bold}" +
  "table{width:100%;border-collapse:collapse;margin:4px 0;page-break-inside:auto}tr{page-break-inside:avoid}th,td{border:1px solid #bbb;padding:3px 5px;text-align:left;vertical-align:top;font-size:9.5pt}th{background:#eee}td.n{text-align:right;font-variant-numeric:tabular-nums}td.lim{font-weight:bold}" +
  ".badge{border:1px solid #999;border-radius:8px;padding:0 5px;font-size:8.5pt}ul{margin:4px 0;padding-left:18px}dl{display:grid;grid-template-columns:110px 1fr;gap:3px 10px}dt{color:#555}dd{margin:0}a{color:inherit;text-decoration:none}.rtr-ln,.rtr-raccourcis,.vide-c{color:#555}" +
  "details>summary{list-style:none}footer{margin-top:16px;border-top:1px solid #999;padding-top:4px;font-size:8.5pt;color:#555}";

// ───── Modification pour le cabinet (RT5, 25/10/2026 ; médecin avec le droit referentielRT « modifier ») ─────
// Sur place : même en-tête, mêmes onglets, des champs à la place des valeurs ; barre du bas « Annuler » · « Enregistrer pour le cabinet » (nombre
// de changements) ; champ changé sur fond --prim-c ; contrôles sous le champ, pendant la saisie (dose par séance = dose / séances à 0,01 Gy près,
// nombres > 0, titre) ; quitter avec des changements : « Quitter sans enregistrer ? » (garde de v2.js) ; enregistrement en transaction : fiche
// changée par un collègue entre-temps = rien n'est écrasé, fiche rechargée. Ce que l'on modifie : le schéma (forme de la référence) ; centrage,
// volumes, jeux de contraintes et essais se choisissent parmi ceux de la référence (ils ne sont pas réécrits).
// espaces/{e}/referentielRT/{id} = { schema, localisation_id, origine « cabinet », base (date_maj de la localisation), note, nouveau + copie_de
// (schéma créé ou dupliqué, identifiant cab-…), majPar (règle : la personne connectée), majParNom, majLe }.
let ED = null;
const clone = (x) => JSON.parse(JSON.stringify(x == null ? null : x));
const peutModif = () => !!(A.modifRefRT && A.modifRefRT());
const CHAMPS_ED = ["titre", "type", "situation_id", "technique", "systemique", "couverture", "simulation_id", "volumes_id"];
const CHAMPS_P = ["volume", "dose_Gy", "fractions", "dose_fx_Gy", "mode", "rythme", "note"];
const NUM_P = ["dose_Gy", "fractions", "dose_fx_Gy"];
const txt = (v) => (v == null ? "" : String(v));
function differences() {
  const a = ED.orig, b = ED.schema, d = [];
  CHAMPS_ED.forEach((k) => { if (txt(a[k]) !== txt(b[k])) d.push(k); });
  const n = Math.max((a.prescriptions || []).length, (b.prescriptions || []).length);
  for (let i = 0; i < n; i++) CHAMPS_P.forEach((k) => { if (txt(((a.prescriptions || [])[i] || {})[k]) !== txt(((b.prescriptions || [])[i] || {})[k])) d.push("prescriptions." + i + "." + k); });
  ["contraintes_ids", "essai_ids", "points_attention"].forEach((k) => { if (JSON.stringify(a[k] || []) !== JSON.stringify(b[k] || [])) d.push(k); });
  ["volumes", "simulation", "contraintes"].forEach((k) => { if (JSON.stringify(a[k] == null ? null : a[k]) !== JSON.stringify(b[k] == null ? null : b[k])) d.push(k); });
  if (txt(ED.noteOrig) !== txt(ED.note)) d.push("note");
  return d;
}
function erreurs() {
  const e = {}, P = ED.schema.prescriptions || [];
  if (!txt(ED.schema.titre).trim()) e.titre = "Indiquez le titre du schéma";
  if (!P.length) e.prescriptions = "Au moins une ligne de prescription";
  P.forEach((p, i) => { controlePrescription(p).forEach((x) => { e["prescriptions." + i + "." + x.champ] = x.txt; }); });
  return e;
}
// Saisie d'un nombre : vide = absent ; « 1,8 » ou « 1.8 » = nombre ; autre chose gardé tel quel (le contrôle le signale)
const lireNombre = (v) => { const s = txt(v).trim(); if (!s) return undefined; const n = nombre(s); return isNaN(n) ? s : n; };
function poser(p, v) {
  if (p === "note") { ED.note = v; return; }
  const k = p.split(".");
  if (k[0] === "prescriptions") { const l = ED.schema.prescriptions[Number(k[1])]; const val = NUM_P.indexOf(k[2]) >= 0 ? lireNombre(v) : v; if (val === undefined || val === "") delete l[k[2]]; else l[k[2]] = val; return; }
  if (k[0] === "points_attention") { ED.schema.points_attention[Number(k[1])] = v; return; }
  if (k[0] === "vol") { matVol().cibles[Number(k[1])][k[2]] = v; return; }
  if (k[0] === "sim") { const M = matSim(); if (k[1] === "autres") M.autres[Number(k[2])][k[3]] = v; else M[k[1]] = v; return; }
  if (k[0] === "ct") { matCt()[Number(k[1])][k[2]] = v; return; }
  if (v === "" || v == null) delete ED.schema[p]; else ED.schema[p] = v;
}
// Barre du bas, champs changés, contrôles : mis à jour sans redessiner (le curseur reste dans le champ)
function majEtat() {
  const z = $("rtrFiche"); if (!z || !ED) return;
  const d = differences(), e = erreurs(), ne = Object.keys(e).length;
  z.querySelectorAll("[data-p]").forEach((x) => x.classList.toggle("mod", d.indexOf(x.dataset.p) >= 0 || (x.dataset.p.startsWith("points_attention") && d.indexOf("points_attention") >= 0)));
  z.querySelectorAll("[data-err]").forEach((x) => { const k = x.dataset.err, m = Object.keys(e).filter((c) => c === k || (k !== "prescriptions" && c.startsWith(k + "."))).map((c) => e[c]); x.textContent = m.join(" ; "); x.hidden = !m.length; });
  const b = $("rtrEnr"), msg = $("rtrBmsg");
  if (b) { b.disabled = !!ne || (!d.length && !ED.nouveau); b.title = ne ? "À corriger : " + Object.values(e).join(" ; ") : !d.length && !ED.nouveau ? "Aucun changement" : ""; }
  if (msg) msg.textContent = ne ? Object.values(e)[0] : d.length ? d.length + " changement" + (d.length > 1 ? "s" : "") : ED.nouveau ? "Nouveau schéma" : "Aucun changement";
}
document.addEventListener("input", (ev) => { const t = ev.target; if (!ED || !t.dataset || !t.dataset.p || !t.closest("#rtrFiche")) return; poser(t.dataset.p, t.value); if (t.dataset.p === "titre") FICHE.e.titre = t.value; majEtat(); });
document.addEventListener("change", (ev) => {
  const t = ev.target; if (!ED || !t.closest || !t.closest("#rtrFiche")) return;
  if (t.dataset.p && t.tagName === "SELECT") { poser(t.dataset.p, t.value); dessinerFiche(); }
  else if (t.id === "rtrAjEssai") { const x = BB.essais.find((e) => libEssai(e) === t.value); if (x) { const L = ED.schema.essai_ids = ED.schema.essai_ids || []; if (L.indexOf(x.id) < 0) L.push(x.id); dessinerFiche(); } else t.value = ""; }
});
async function garde() {
  if (!ED || (!differences().length && !ED.nouveau)) { finEdition(); return true; }
  if ((await A.question("<h3>Quitter sans enregistrer ?</h3><p>Les changements de cette fiche seront perdus.</p>", [["rester", "Rester", "plein"], ["quitter", "Quitter", "rouge"]])) !== "quitter") return false;
  finEdition(); return true;
}
function finEdition() { if (ED && ED.avant && FICHE) FICHE.schema = ED.avant; ED = null; A.garde(null); }
function demarrer(ed) {
  ED = Object.assign({ orig: clone(ed.schema), noteOrig: ed.note || "", lu: CAB[ed.id] ? clone(CAB[ed.id]) : null }, ed);
  A.garde(garde);
}
window.rtrModifier = () => {
  if (!FICHE || !peutModif()) return;
  const c = FICHE.cab;
  demarrer({ id: FICHE.e.id, schema: clone(FICHE.schema), note: (c && c.note) || "", localisation_id: FICHE.e.localisation_id, nouveau: !!(c && c.nouveau), copie_de: c && c.copie_de, avant: FICHE.schema });
  FICHE.schema = ED.schema; dessinerFiche();
};
window.rtrAnnulerEd = async () => {
  if (ED && (differences().length || ED.nouveau) && (await A.question("<h3>Abandonner les changements ?</h3>", [["non", "Continuer", "plein"], ["oui", "Abandonner", "rouge"]])) !== "oui") return;
  const neuf = ED && ED.nouveau && !ED.lu, source = ED && ED.copie_de; finEdition();
  if (neuf) location.hash = source ? "radiotherapie/s/" + encodeURIComponent(source) + "/prescription" : "radiotherapie"; else dessinerFiche();
};
// Schéma tel qu'enregistré : textes sans espaces autour, champs vides retirés, ind recalculé
function nettoyer(s0) {
  const s = clone(s0);
  Object.keys(s).forEach((k) => { if (typeof s[k] === "string") { s[k] = s[k].trim(); if (!s[k]) delete s[k]; } });
  s.prescriptions = (s.prescriptions || []).map((p) => { const q = {}; CHAMPS_P.forEach((k) => { const v = typeof p[k] === "string" ? p[k].trim() : p[k]; if (v !== undefined && v !== "") q[k] = v; }); return q; });
  s.points_attention = (s.points_attention || []).map((x) => txt(x).trim()).filter(Boolean);
  const st = sit(s.situation_id) || {}, l = loc(st.localisation_id) || {}, r = INDEX.regions.find((x) => x.id === l.region_id) || {};
  s.ind = [r.nom || "", l.nom || "", st.titre || "", TYPES[s.type] || ""];
  return s;
}
const signature = (c) => (c ? txt(c.majLe) + "|" + txt(c.majPar) : "");
window.rtrEnregistrer = async () => {
  if (!ED || Object.keys(erreurs()).length || (!differences().length && !ED.nouveau)) return;
  const id = ED.id, ref = doc(db, "espaces", A.ESPACE, "referentielRT", id), l = loc(ED.localisation_id) || {}, b = $("rtrEnr"), msg = $("rtrBmsg");
  const d = { schema: nettoyer(ED.schema), localisation_id: ED.localisation_id, origine: "cabinet", base: l.date_maj || "", note: txt(ED.note).trim(), majPar: D().u.uid, majParNom: $("nomMenu") ? $("nomMenu").textContent : "", majLe: new Date().toISOString() };
  if (ED.nouveau) { d.nouveau = true; if (ED.copie_de) d.copie_de = ED.copie_de; }
  if (b) b.disabled = true; if (msg) msg.textContent = "Enregistrement…";
  let res;
  try {
    res = await runTransaction(db, async (tx) => {
      const s = await tx.get(ref), cur = s.exists() ? s.data() : null;
      if (signature(cur) !== signature(ED.lu)) return { conflit: cur };
      tx.set(ref, d); return { ok: true };
    });
  } catch (e) { console.warn("enregistrement du référentiel", e); if (msg) msg.textContent = "Pas de connexion : réessayez (la saisie est conservée)"; if (b) b.disabled = false; return; }
  const neuf = ED.nouveau && !ED.lu;
  if (res.conflit !== undefined) {
    if (res.conflit) CAB[id] = res.conflit; else delete CAB[id];
    rafraichir(); finEdition(); A.toast("Fiche modifiée par un collègue entre-temps : rien n'a été écrasé, elle est rechargée."); FICHE = null;
    if (!neuf) ouvrirFiche(id, ongletDe(profil().rtOnglet)); return;
  }
  CAB[id] = d; rafraichir(); const o = FICHE ? FICHE.onglet : "prescription"; finEdition(); FICHE = null; A.toast("Enregistré pour le cabinet");
  const zf = $("rtrFiche"); if (zf) zf.scrollTop = 0; window.scrollTo(0, 0); // retour en haut : la ligne « Modifié pour le cabinet »
  if (neuf) location.hash = "radiotherapie/s/" + encodeURIComponent(id) + "/" + o; else ouvrirFiche(id, o);
};
function rafraichir() { LISTE = fusionner(INDEX, CAB, acronymeDe); TEXTES.clear(); dessinerListe(); }
// « Revenir à la référence » (schéma de la référence) ou « Supprimer le schéma » (créé par le cabinet) : confirmation qui dit ce qui sera perdu, puis
// 10 secondes pour annuler ; la fiche du cabinet n'est supprimée qu'après
let ANNUL = null;
function annulable(texte, annuler, valider) {
  if (ANNUL) { ANNUL.fin(); }
  const z = document.createElement("div"); z.className = "rtr-annul"; z.setAttribute("role", "status");
  z.innerHTML = "<span>" + A.esc(texte) + '</span><button type="button" class="bt clair petit">Annuler</button>';
  const fin = () => { clearTimeout(t); z.remove(); ANNUL = null; valider(); }, t = setTimeout(fin, 10000);
  z.querySelector("button").onclick = () => { clearTimeout(t); z.remove(); ANNUL = null; annuler(); };
  ANNUL = { fin }; document.body.appendChild(z);
}
window.rtrRevenir = async () => {
  const id = RF.ouvert, c = CAB[id]; if (!c || !peutModif()) return;
  const quand = dfr(txt(c.majLe).slice(0, 10)), neuf = !!c.nouveau;
  const r = await A.question(neuf ? "<h3>Supprimer ce schéma du cabinet ?</h3><p>« " + A.esc(c.schema.titre || "") + " » sera supprimé pour tout le cabinet.</p>" : "<h3>Revenir à la référence ?</h3><p>Les modifications du " + A.esc(quand) + " seront supprimées pour tout le cabinet.</p>",
    [["non", "Rester", "gris"], ["oui", neuf ? "Supprimer le schéma" : "Revenir à la référence", "rouge"]]);
  if (r !== "oui") return;
  delete CAB[id]; rafraichir(); FICHE = null;
  if (neuf) location.hash = "radiotherapie"; else ouvrirFiche(id, ongletDe(profil().rtOnglet));
  annulable(neuf ? "Schéma supprimé." : "Modifications retirées : la référence s'affiche.", () => { CAB[id] = c; rafraichir(); FICHE = null; if (RF.ouvert === id) ouvrirFiche(id, ongletDe(profil().rtOnglet)); else if (neuf) location.hash = "radiotherapie/s/" + encodeURIComponent(id) + "/prescription"; },
    () => { deleteDoc(doc(db, "espaces", A.ESPACE, "referentielRT", id)).catch((e) => { console.warn("référentiel", e); CAB[id] = c; rafraichir(); A.toast("Pas de connexion : la version du cabinet est gardée, réessayez."); }); });
};
const nouvelId = () => "cab-" + Date.now().toString(36);
window.rtrDupliquer = () => {
  if (!FICHE || !peutModif()) return;
  const s = clone(FICHE.schema), id = nouvelId();
  Object.assign(s, { id, titre: "Copie de " + (s.titre || ""), preuve: "pratique_du_cabinet" }); delete s.date_verif; delete s.source_institutionnelle;
  NOUVEAU = { id, schema: s, note: (FICHE.cab && FICHE.cab.note) || "", localisation_id: FICHE.e.localisation_id, nouveau: true, copie_de: FICHE.e.id, loc: FICHE.loc, B: FICHE.B, choisir: true };
  location.hash = "radiotherapie/nouveau";
};
let NOUVEAU = null;
// « + Nouveau schéma » : localisation et situation des menus, à confirmer
window.rtrNouveau = () => {
  if (!peutModif() || !LISTE) return;
  const esc = A.esc, locId = RF.loc || INDEX.localisations[0].id;
  const optsSit = (l) => INDEX.situations.filter((s) => s.localisation_id === l).map((s) => '<option value="' + esc(s.id) + '"' + (s.id === RF.sit ? " selected" : "") + ">" + esc(s.titre) + "</option>").join("");
  A.fenetre('<h3>Nouveau schéma du cabinet</h3><div class="form" style="grid-template-columns:1fr"><div><label for="rtrNL">Localisation</label><select id="rtrNL" onchange="document.getElementById(\'rtrNS\').innerHTML=rtrSits(this.value)">' +
    INDEX.regions.map((r) => '<optgroup label="' + esc(r.nom) + '">' + INDEX.localisations.filter((l) => l.region_id === r.id).map((l) => '<option value="' + l.id + '"' + (l.id === locId ? " selected" : "") + ">" + esc(l.nom) + "</option>").join("") + "</optgroup>").join("") +
    '</select></div><div><label for="rtrNS">Situation</label><select id="rtrNS">' + optsSit(locId) + '</select></div><div><label for="rtrNT">Fractionnement</label><select id="rtrNT">' + Object.keys(TYPES).map((k) => '<option value="' + k + '"' + (TYPES[k] === RF.frac ? " selected" : "") + ">" + esc(TYPES[k] + (/^curie_/.test(k) ? " " + k.slice(6).toUpperCase() : "")) + "</option>").join("") +
    '</select></div></div><div class="actr"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="rtrNouveauOk()">Créer le schéma</button></div>');
  window.rtrSits = optsSit;
};
window.rtrNouveauOk = async () => {
  const l = A.val("rtrNL"), s = A.val("rtrNS"), t = A.val("rtrNT"); A.fermerFenetre();
  let L, B; try { [L, B] = await Promise.all([locFichier(l), chargerBibs()]); } catch (e) { A.toast("Pas de connexion : réessayez"); return; }
  const id = nouvelId();
  NOUVEAU = { id, schema: { id, situation_id: s, titre: "", type: t, preuve: "pratique_du_cabinet", essai_ids: [], prescriptions: [{ volume: "", mode: "seul" }], contraintes_ids: [], points_attention: [] }, note: "", localisation_id: l, nouveau: true, loc: L, B, choisir: true };
  location.hash = "radiotherapie/nouveau";
};
// Champs de la fiche en modification
const libEssai = (x) => x.acronyme + (x.annee ? " (" + x.annee + ")" : "") + (x.revue ? " · " + x.revue : "");
const inp = (p, v, lab, o) => '<input class="rtr-in' + (o && o.num ? " n" : "") + '" data-p="' + p + '" value="' + A.esc(txt(v)) + '" aria-label="' + A.esc(lab) + '"' + (o && o.num ? ' inputmode="decimal"' : "") + (o && o.ph ? ' placeholder="' + A.esc(o.ph) + '"' : "") + ">";
const zone = (p, v, lab, r) => '<label class="rtr-lab">' + A.esc(lab) + '<textarea class="rtr-in" data-p="' + p + '" rows="' + (r || 2) + '">' + A.esc(txt(v)) + "</textarea></label>";
const err = (k) => '<div class="rtr-err" data-err="' + k + '" hidden></div>';
const sel = (p, v, opts, lab) => '<select class="rtr-in" data-p="' + p + '" aria-label="' + A.esc(lab) + '">' + opts.map(([k, l]) => '<option value="' + A.esc(k) + '"' + (txt(v) === k ? " selected" : "") + ">" + A.esc(l) + "</option>").join("") + "</select>";
window.rtrLigne = (i) => { if (!ED) return; const P = ED.schema.prescriptions = ED.schema.prescriptions || []; if (i == null) P.push({ volume: "", mode: P.length ? P[P.length - 1].mode : "seul", rythme: P.length ? P[P.length - 1].rythme : "" }); else P.splice(i, 1); dessinerFiche(); };
window.rtrPoint = (i) => { if (!ED) return; const P = ED.schema.points_attention = ED.schema.points_attention || []; if (i == null) P.push(""); else P.splice(i, 1); dessinerFiche(); };
window.rtrRetEssai = (id) => { if (!ED) return; ED.schema.essai_ids = (ED.schema.essai_ids || []).filter((x) => x !== id); dessinerFiche(); };
function editPrescription() {
  const s = ED.schema, P = s.prescriptions || [];
  let h = ED.nouveau ? '<div class="form rtr-fn"><div><label>Situation</label>' + sel("situation_id", s.situation_id, INDEX.situations.filter((x) => x.localisation_id === ED.localisation_id).map((x) => [x.id, x.titre]), "Situation") + "</div><div><label>Fractionnement</label>" +
    sel("type", s.type, Object.keys(TYPES).map((k) => [k, TYPES[k] + (/^curie_/.test(k) ? " " + k.slice(6).toUpperCase() : "")]), "Fractionnement") + "</div></div>" : "";
  h += '<div class="rtr-tw"><table class="rtr-tab rtr-edt"><thead><tr><th>Volume</th><th class="n">Dose totale (Gy)</th><th class="n">Séances</th><th class="n">Dose par séance (Gy)</th><th>Mode</th><th>Rythme</th><th></th></tr></thead><tbody>' +
    P.map((p, i) => '<tr><td data-l="Volume">' + inp("prescriptions." + i + ".volume", p.volume, "Volume") + inp("prescriptions." + i + ".note", p.note, "Note de la ligne", { ph: "Note" }) + "</td>" +
      '<td data-l="Dose totale (Gy)">' + inp("prescriptions." + i + ".dose_Gy", typeof p.dose_Gy === "number" ? nb(p.dose_Gy) : p.dose_Gy, "Dose totale (Gy)", { num: 1 }) + '</td><td data-l="Séances">' + inp("prescriptions." + i + ".fractions", typeof p.fractions === "number" ? nb(p.fractions) : p.fractions, "Séances", { num: 1 }) + "</td>" +
      '<td data-l="Dose par séance (Gy)">' + inp("prescriptions." + i + ".dose_fx_Gy", typeof p.dose_fx_Gy === "number" ? nb(p.dose_fx_Gy) : p.dose_fx_Gy, "Dose par séance (Gy)", { num: 1 }) + '</td><td data-l="Mode">' + sel("prescriptions." + i + ".mode", p.mode || "seul", [["seul", "Seul"], ["SIB", "SIB"], ["sequentiel", "Séquentiel"]], "Mode") + "</td>" +
      '<td data-l="Rythme">' + inp("prescriptions." + i + ".rythme", p.rythme, "Rythme", { ph: "5 fx/sem" }) + '</td><td><details class="m3"><summary class="mini" title="Autres actions" aria-label="Actions de la ligne">⋯</summary><div class="m3-l"><button type="button" class="mini rouge-t" onclick="rtrLigne(' + i + ')">' + A.ic("corbeille") + "Supprimer la ligne</button></div></details></td></tr>" +
      '<tr class="rtr-errl"><td colspan="7">' + err("prescriptions." + i) + "</td></tr>").join("") + "</tbody></table></div>" + err("prescriptions") +
    '<button type="button" class="mini rtr-aj" onclick="rtrLigne()">' + A.ic("plus") + "Ajouter une ligne</button>";
  h += zone("technique", s.technique, "Technique") + zone("systemique", s.systemique, "Traitement associé") + zone("note", ED.note, "Note du médecin", 3);
  return h;
}
// Centrage, contourage et contraintes modifiés ligne par ligne (25/10/2026) : la première modification recopie dans le schéma la version affichée
// (schema.simulation, schema.volumes, schema.contraintes), qui remplace ensuite le modèle de la localisation et la base
const tri = (L) => L.slice().sort((a, b) => sansAcc(a[1]).localeCompare(sansAcc(b[1])));
function matSim() {
  if (!ED.schema.simulation) { const m = simDe() || {}, x = {}; SIM.forEach(([k]) => { if (m[k]) x[k] = m[k]; }); x.autres = clone(m.autres || []); ED.schema.simulation = x; }
  ED.schema.simulation.autres = ED.schema.simulation.autres || []; return ED.schema.simulation;
}
function matVol() { if (!ED.schema.volumes) { const v = volDe() || {}; ED.schema.volumes = { cibles: clone(v.cibles || []), oar_ids: (v.oar_ids || []).slice() }; } return ED.schema.volumes; }
function matCt() {
  if (!ED.schema.contraintes) ED.schema.contraintes = [].concat(...contraintesCalculees(ED.schema).map((g) => g.lignes.map((l) => ({ oar_id: g.cle, indicateur: l.indicateur || "", ideal: l.ideal || "", limitant: l.limitant || "", note: l.note || "" }))));
  return ED.schema.contraintes;
}
window.rtrSim = (i) => { if (!ED) return; const M = matSim(); if (i == null) M.autres.push({ lib: "", val: "" }); else M.autres.splice(i, 1); dessinerFiche(); };
window.rtrVol = (i) => { if (!ED) return; const V = matVol(); if (i == null) V.cibles.push({ nom: "", type: "", definition: "", quand: "", marge: "" }); else V.cibles.splice(i, 1); dessinerFiche(); };
window.rtrVolOar = (id, ajout) => { if (!ED || !id) return; const V = matVol(); if (ajout) { if (V.oar_ids.indexOf(id) < 0) V.oar_ids.push(id); } else V.oar_ids = V.oar_ids.filter((x) => x !== id); dessinerFiche(); };
window.rtrCt = (i) => { if (!ED) return; const C = matCt(); if (i == null) C.push({ oar_id: (C[C.length - 1] || {}).oar_id || "", indicateur: "", ideal: "", limitant: "", note: "" }); else C.splice(i, 1); dessinerFiche(); };
window.rtrCtBase = () => { if (!ED) return; delete ED.schema.contraintes; dessinerFiche(); };
function editCentrage() {
  const m = ED.schema.simulation || simDe() || {}, autres = m.autres || [];
  return '<div class="rtr-ed2">' + SIM.map(([k, lib]) => zone("sim." + k, m[k], lib)).join("") +
    autres.map((x, i) => '<div class="rtr-pe rtr-sim2">' + inp("sim.autres." + i + ".lib", x.lib, "Rubrique", { ph: "Rubrique" }) + '<textarea class="rtr-in" data-p="sim.autres.' + i + '.val" rows="2" aria-label="Contenu">' + A.esc(txt(x.val)) + '</textarea><button type="button" class="mini" onclick="rtrSim(' + i + ')" aria-label="Retirer cette ligne">' + A.ic("croix") + "</button></div>").join("") +
    '<button type="button" class="mini rtr-aj" onclick="rtrSim()">' + A.ic("plus") + "Ajouter une ligne</button></div>";
}
function editContourage() {
  const esc = A.esc, v = ED.schema.volumes || volDe() || {}, C = v.cibles || [], O = v.oar_ids || [];
  let h = '<div class="rtr-tw"><table class="rtr-tab rtr-edt"><thead><tr><th>Nom</th><th>Type</th><th>Définition</th><th>Quand</th><th>Marge</th><th></th></tr></thead><tbody>' +
    C.map((c, i) => '<tr><td data-l="Nom">' + inp("vol." + i + ".nom", c.nom, "Nom") + '</td><td data-l="Type">' + inp("vol." + i + ".type", c.type, "Type", { ph: "GTV, CTV, PTV" }) + '</td><td data-l="Définition"><textarea class="rtr-in" data-p="vol.' + i + '.definition" rows="2" aria-label="Définition">' + esc(txt(c.definition)) + "</textarea></td>" +
      '<td data-l="Quand">' + inp("vol." + i + ".quand", c.quand, "Quand") + '</td><td data-l="Marge">' + inp("vol." + i + ".marge", c.marge, "Marge") + '</td><td><button type="button" class="mini" onclick="rtrVol(' + i + ')" aria-label="Retirer cette ligne">' + A.ic("croix") + "</button></td></tr>").join("") +
    '</tbody></table></div><button type="button" class="mini rtr-aj" onclick="rtrVol()">' + A.ic("plus") + "Ajouter une ligne</button>";
  h += '<h4>Organes à risque à contourer</h4><ul class="rtr-oar rtr-oare">' + O.map((id) => { const o = oar(id); return "<li>" + esc(o.nom) + (o.nom_tg263 ? ' <span class="mesures">' + esc(o.nom_tg263) + "</span>" : "") + ' <button type="button" class="mini" onclick="rtrVolOar(\'' + esc(id) + '\')" aria-label="Retirer ' + esc(o.nom) + '">' + A.ic("croix") + "</button></li>"; }).join("") + "</ul>" +
    '<label class="rtr-lab">Ajouter un organe à risque<select class="rtr-in" onchange="rtrVolOar(this.value,1)"><option value="">Choisir dans la liste des organes à risque…</option>' +
    tri(BB.oar.filter((o) => O.indexOf(o.id) < 0).map((o) => [o.id, o.nom])).map(([k, l]) => '<option value="' + esc(k) + '">' + esc(l) + "</option>").join("") + "</select></label>";
  return h;
}
function editContraintes() {
  const esc = A.esc, cab = Array.isArray(ED.schema.contraintes);
  const L = cab ? ED.schema.contraintes : [].concat(...contraintesCalculees(ED.schema).map((g) => g.lignes.map((l) => Object.assign({ oar_id: g.cle }, l))));
  const choix = [["cible-ptv", "Cible (PTV)"], ["cible-ctv", "Cible (CTV)"]].concat(tri(BB.paires.map((p) => [p.id, p.nom]).concat(BB.oar.filter((o) => !o.paire).map((o) => [o.id, o.nom]))));
  return zone("couverture", ED.schema.couverture, "Objectifs de couverture") + enteteContraintes() +
    (cab ? '<p class="mesures">Table du cabinet pour ce schéma · <a href="#" class="rtr-lien" onclick="rtrCtBase();return false">Revenir aux contraintes de la base</a></p>' : "") +
    '<div class="rtr-tw"><table class="rtr-tab rtr-edt rtr-ctedit"><thead><tr><th>Organe</th><th>Indicateur</th><th>Idéal</th><th>Limitant</th><th>Note</th><th></th></tr></thead><tbody>' +
    L.map((l, i) => '<tr><td data-l="Organe">' + sel("ct." + i + ".oar_id", l.oar_id, (choix.some(([k]) => k === l.oar_id) ? [] : [[l.oar_id, oar(l.oar_id).nom]]).concat(choix), "Organe") + '</td><td data-l="Indicateur">' + inp("ct." + i + ".indicateur", l.indicateur, "Indicateur", { ph: "Dmax, V20Gy…" }) + "</td>" +
      '<td data-l="Idéal">' + inp("ct." + i + ".ideal", l.ideal, "Idéal") + '</td><td data-l="Limitant">' + inp("ct." + i + ".limitant", l.limitant, "Limitant") + '</td><td data-l="Note">' + inp("ct." + i + ".note", l.note, "Note") + "</td>" +
      '<td><button type="button" class="mini" onclick="rtrCt(' + i + ')" aria-label="Retirer cette contrainte">' + A.ic("croix") + "</button></td></tr>").join("") +
    '</tbody></table></div><button type="button" class="mini rtr-aj" onclick="rtrCt()">' + A.ic("plus") + "Ajouter une contrainte</button>";
}
function editEssais() {
  const esc = A.esc, L = (ED.schema.essai_ids || []).map(essai).filter(Boolean);
  return '<ul class="rtr-sys">' + L.map((x) => "<li><b>" + esc(x.acronyme) + '</b> <span class="mesures">' + esc([x.revue, x.annee].filter(Boolean).join(", ")) + '</span> <button type="button" class="mini" onclick="rtrRetEssai(\'' + esc(x.id) + '\')" aria-label="Retirer ' + esc(x.acronyme) + '">' + A.ic("croix") + "</button></li>").join("") + "</ul>" +
    '<label class="rtr-lab">Ajouter un essai ou une référence de la bibliothèque<input id="rtrAjEssai" class="rtr-in" list="rtrEssaisL" placeholder="Acronyme (ex. CHHiP)"></label><datalist id="rtrEssaisL">' + BB.essais.map((x) => '<option value="' + esc(libEssai(x)) + '">').join("") + "</datalist>";
}
function editAttention() {
  const P = ED.schema.points_attention || [];
  return P.map((x, i) => '<div class="rtr-pe"><textarea class="rtr-in" data-p="points_attention.' + i + '" rows="2" aria-label="Point d\'attention ' + (i + 1) + '">' + A.esc(txt(x)) + '</textarea><button type="button" class="mini" onclick="rtrPoint(' + i + ')" aria-label="Retirer ce point">' + A.ic("croix") + "</button></div>").join("") +
    '<button type="button" class="mini rtr-aj" onclick="rtrPoint()">' + A.ic("plus") + "Ajouter un point</button>";
}
const EDITS = { prescription: editPrescription, centrage: editCentrage, contourage: editContourage, contraintes: editContraintes, essais: editEssais, attention: editAttention };
// Voir la référence : deux colonnes, différences surlignées ; sur téléphone, un sélecteur Référence / Version du cabinet
function lignesComparaison(a, b, na, nb2) {
  const P = (s) => (s.prescriptions || []), lp = (p) => p ? [p.volume, fmtPrescription(p).replace(/ /g, " "), MODES[p.mode] || p.mode, p.rythme, p.note].filter(Boolean).join(" · ") : "";
  const sim = (s) => { const m = s.simulation || (FICHE.loc.simulations || []).find((x) => x.id === s.simulation_id) || {}; return SIM.map(([k, l]) => (m[k] ? l + " : " + m[k] : "")).concat((m.autres || []).map((x) => x.lib + " : " + x.val)).filter(Boolean).join(" • "); };
  const vols = (s) => { const v = s.volumes || (FICHE.loc.volumes || []).find((x) => x.id === s.volumes_id) || {}; return (v.cibles || []).map((c) => [c.nom, c.marge].filter(Boolean).join(" ")).concat((v.oar_ids || []).map((id) => oar(id).nom)).join(" ; "); };
  const jeux = (s) => (Array.isArray(s.contraintes) ? s.contraintes.map((l) => oar(l.oar_id).nom + " " + [l.indicateur, l.ideal, l.limitant].filter(Boolean).join(" ")).join(" ; ") : "Base du référentiel" + ((s.contraintes_ids || []).length ? " ; " + s.contraintes_ids.map((id) => (BB.jeux.find((j) => j.id === id) || { titre: id }).titre).join(" ; ") : ""));
  const r = [["Titre", a.titre, b.titre], ["Fractionnement", TYPES[a.type], TYPES[b.type]], ["Preuve", libPreuve(a.preuve), libPreuve(b.preuve)]];
  for (let i = 0; i < Math.max(P(a).length, P(b).length); i++) r.push(["Prescription " + (i + 1), lp(P(a)[i]), lp(P(b)[i])]);
  return r.concat([["Technique", a.technique, b.technique], ["Traitement associé", a.systemique, b.systemique], ["Couverture", a.couverture, b.couverture], ["Centrage", sim(a), sim(b)], ["Contourage", vols(a), vols(b)],
    ["Contraintes", jeux(a), jeux(b)], ["Essais", acronymes(a.essai_ids), acronymes(b.essai_ids)], ["Points d'attention", (a.points_attention || []).join(" • "), (b.points_attention || []).join(" • ")], ["Note du médecin", na, nb2]]).map(([l, x, y]) => [l, txt(x), txt(y)]);
}
window.rtrComparer = () => {
  const id = RF.ouvert, c = CAB[id], ref = FICHE && FICHE.loc.schemas.find((s) => s.id === id); if (!c || !ref) return;
  const esc = A.esc, l = loc(c.localisation_id) || {};
  A.fenetre('<h3>Voir la référence</h3><p class="mesures">Référence du ' + esc(dfr(l.date_maj)) + " · version du cabinet du " + esc(dfr(txt(c.majLe).slice(0, 10))) + (c.majParNom ? " par " + esc(c.majParNom) : "") + "</p>" +
    '<div class="ag-vues rtr-cmpv"><button class="on" onclick="rtrCmp(this,\'ref\')">Référence</button><button onclick="rtrCmp(this,\'cab\')">Version du cabinet</button></div>' +
    '<div class="rtr-tw"><table class="rtr-tab rtr-cmp voir-ref"><thead><tr><th></th><th>Référence</th><th>Version du cabinet</th></tr></thead><tbody>' +
    lignesComparaison(ref, c.schema, "", c.note).map(([lab, a, b]) => '<tr class="' + (a !== b ? "diff" : "") + '"><th scope="row">' + esc(lab) + '</th><td class="cr" data-l="Référence">' + esc(a || "—") + '</td><td class="cc" data-l="Version du cabinet">' + esc(b || "—") + "</td></tr>").join("") +
    '</tbody></table></div><div class="actr"><button class="bt gris" onclick="fermerFenetre()">Fermer</button></div>', "large");
};
window.rtrCmp = (b, v) => { b.parentNode.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); const t = document.querySelector(".rtr-cmp"); t.classList.toggle("voir-ref", v === "ref"); t.classList.toggle("voir-cab", v === "cab"); };

// ───── Sous-pages (RT6, 25/10/2026) : Organes à risque, Contraintes, Essais, Calcul BED / EQD2 ─────
// Onglets en haut de la page Radiothérapie (Référentiel · Organes à risque · Contraintes · Essais · Calcul BED / EQD2) ; adresses #radiotherapie/oar,
// /contraintes, /essais, /calcul (/calcul/<dose par séance>/<séances> : prérempli depuis le lien « EQD2 » d'une ligne de prescription).
// « Utilisé dans n schémas » et la région d'un jeu de contraintes demandent les 48 fichiers de localisation : lus à la première sous-page.
const SOUS = [["", "Référentiel"], ["oar", "Organes à risque"], ["contraintes", "Contraintes"], ["essais", "Essais"], ["calcul", "Calcul BED / EQD2"]];
const ongletsPage = (k) => '<div class="ag-vues defile rtr-sous" role="tablist">' + SOUS.map(([c, l]) => '<button role="tab" aria-selected="' + (c === k) + '" class="' + (c === k ? "on" : "") + '" onclick="location.hash=\'radiotherapie' + (c ? "/" + c : "") + "'\">" + l + "</button>").join("") + "</div>";
let TOUT = null;
const chargerTout = () => TOUT || (TOUT = Promise.all(INDEX.localisations.map((l) => locFichier(l.id))).catch((e) => { TOUT = null; throw e; }));
// schémas de la référence (+ ceux du cabinet) avec leur fichier : qui cite quel OAR, quel jeu
function schemasComplets() {
  const r = [];
  INDEX.localisations.forEach((l) => { const L = LOCS[l.id]; if (!L) return; L.schemas.forEach((s) => { const c = CAB[s.id]; r.push({ s: c && c.schema ? c.schema : s, L }); }); });
  Object.keys(CAB).forEach((id) => { const c = CAB[id]; if (c.nouveau && c.schema && LOCS[c.localisation_id]) r.push({ s: c.schema, L: LOCS[c.localisation_id] }); });
  return r;
}
const RS = { oarQ: "", oarR: "", jeu: "", jeuQ: "", essQ: "", essTri: "acronyme", essSens: 1 };
const REGIONS_OAR = { orl: "Tête et cou", sein: "Sein", thorax: "Thorax", abdomen: "Abdomen", snc: "Système nerveux central", rachis: "Rachis", pelvis: "Pelvis" };
// Organes à risque
function pageOar() {
  const esc = A.esc, B = BB;
  const z = $("rtrSous"); if (!z) return;
  if (!$("rtrOq")) {
    z.innerHTML = '<div class="rtr-haut rtr-sh"><div class="recherche"><svg class="i"><use href="#i-loupe"/></svg><input id="rtrOq" type="search" autocomplete="off" placeholder="Rechercher un organe (français ou TG-263)" aria-label="Rechercher un organe" value="' + esc(RS.oarQ) + '"></div>' +
      '<div class="cascade rtr-menus"><div><label for="rtrOr">Région</label><select id="rtrOr" onchange="RS_oar(\'r\',this.value)"><option value="">Toutes</option>' + Object.keys(REGIONS_OAR).map((k) => '<option value="' + k + '"' + (RS.oarR === k ? " selected" : "") + ">" + esc(REGIONS_OAR[k]) + "</option>").join("") + '</select></div></div></div><div class="rtr-liste rtr-sl" id="rtrOl"></div>';
    $("rtrOq").oninput = (e) => { RS.oarQ = e.target.value; listeOar(); };
  }
  listeOar();
}
window.RS_oar = (k, v) => { if (k === "r") RS.oarR = v; listeOar(); };
// Liste : nom, TG-263, définition sur deux lignes ; un clic déplie la ligne (définition entière, schémas qui contourent l'organe) ; le médecin qui
// a le droit « modifier » change le nom, le nom TG-263 et la définition pour le cabinet, ou ajoute un organe (referentielRT/_oar)
const oarsDe = (s, L) => (s.volumes || (L.volumes || []).find((x) => x.id === s.volumes_id) || {}).oar_ids || [];
function listeOar() {
  const z = $("rtrOl"); if (!z) return;
  const esc = A.esc, q = sansAcc(RS.oarQ).trim(), L = BB.oar.filter((o) => (!RS.oarR || o.region === RS.oarR) && (!q || sansAcc(o.nom + " " + (o.nom_tg263 || "") + " " + (o.definition || "")).indexOf(q) >= 0));
  z.innerHTML = '<div class="rtr-ohaut"><p class="mesures rtr-nb">' + L.length + " organe" + (L.length > 1 ? "s" : "") + "</p>" + (peutModif() ? '<button type="button" class="mini" onclick="rtrOarForm(null)">' + A.ic("plus") + "Ajouter un organe</button>" : "") + "</div>" +
    (L.length ? '<div class="rtr-tw"><table class="rtr-tab rtr-ot"><thead><tr><th>Nom</th><th>TG-263</th><th>Définition</th></tr></thead><tbody>' +
    L.map((o) => '<tr class="rtr-clic" tabindex="0" data-oar="' + esc(o.id) + '" onclick="rtrDetailOar(this,\'' + esc(o.id) + '\')" onkeydown="if(event.key===\'Enter\')this.click()"><td data-l="Nom"><b>' + esc(o.nom) + "</b>" + (o.cabinet ? ' <span class="badge b-or">Cabinet</span>' : "") + '</td><td data-l="TG-263">' + esc(o.nom_tg263 || "") + '</td><td data-l="Définition"><div class="rtr-def2">' + court(o.definition || "") + "</div></td></tr>").join("") + "</tbody></table></div>" : '<div class="vide-c">Aucun organe ne correspond</div>');
}
window.rtrDetailOar = async (tr, id) => {
  const n = tr.nextElementSibling; if (n && n.classList.contains("rtr-det")) { n.remove(); tr.classList.remove("ouv"); return; }
  const esc = A.esc, d = document.createElement("tr"); d.className = "rtr-det"; tr.classList.add("ouv");
  d.innerHTML = '<td colspan="3"><p class="mesures">Chargement…</p></td>'; tr.after(d);
  try { await chargerTout(); } catch (e) { d.querySelector(".mesures").textContent = "Pas de connexion : réessayez"; return; }
  const S2 = schemasComplets().filter(({ s, L }) => oarsDe(s, L).indexOf(id) >= 0);
  d.querySelector("td").innerHTML = '<p class="mesures rtr-util">Utilisé dans ' + S2.length + " schéma" + (S2.length > 1 ? "s" : "") + (S2.length ? " : " : "") + S2.map(({ s, L }) => '<a href="#radiotherapie/s/' + encodeURIComponent(s.id) + '/contourage">' + esc(L.nom + " · " + s.titre) + "</a>").join(" · ") + "</p>" +
    (peutModif() ? '<button type="button" class="mini" onclick="event.stopPropagation();rtrOarForm(\'' + esc(id) + '\')">' + A.ic("crayon") + "Modifier pour le cabinet</button>" : "");
};
window.rtrOarForm = (id) => {
  if (!peutModif()) return;
  const o = id ? BB.oar.find((x) => x.id === id) : { nom: "", nom_tg263: "", definition: "", region: RS.oarR || "divers" }, esc = A.esc;
  A.fenetre("<h3>" + (id ? "Modifier l'organe pour le cabinet" : "Ajouter un organe") + '</h3><div class="form" style="grid-template-columns:1fr"><div><label for="rtrOn">Nom</label><input id="rtrOn" value="' + esc(o.nom || "") + '"></div><div><label for="rtrOt">TG-263</label><input id="rtrOt" value="' + esc(o.nom_tg263 || "") + '"></div>' +
    '<div><label for="rtrOd">Définition du contourage</label><textarea id="rtrOd" rows="5">' + esc(o.definition || "") + "</textarea></div>" + (id ? "" : '<div><label for="rtrOg">Région</label><select id="rtrOg">' + Object.keys(REGIONS_OAR).map((k) => '<option value="' + k + '"' + (k === o.region ? " selected" : "") + ">" + esc(REGIONS_OAR[k]) + "</option>").join("") + "</select></div>") + "</div>" +
    '<div class="actr">' + (id && CAB_OAR && CAB_OAR.oar && CAB_OAR.oar[id] ? '<button class="bt rouge" onclick="rtrOarOk(\'' + esc(id) + '\',1)">Revenir à la référence</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" onclick="rtrOarOk(\'' + esc(id || "") + '\')">' + A.ic("enregistrer") + "Enregistrer pour le cabinet</button></div>");
};
window.rtrOarOk = async (id, revenir) => {
  const v = { nom: A.val("rtrOn").trim(), nom_tg263: A.val("rtrOt").trim(), definition: A.val("rtrOd").trim() };
  if (!revenir && !v.nom) { A.toast("Indiquez le nom de l'organe"); return; }
  const ref = doc(db, "espaces", A.ESPACE, "referentielRT", "_oar");
  try {
    CAB_OAR = await runTransaction(db, async (tx) => {
      const sn = await tx.get(ref), c = sn.exists() ? sn.data() : { oar: {}, ajouts: [] };
      c.oar = c.oar || {}; c.ajouts = c.ajouts || [];
      const aj = c.ajouts.findIndex((x) => x.id === id);
      if (revenir) delete c.oar[id];
      else if (!id) c.ajouts.push(Object.assign({ id: "oarc-" + Date.now().toString(36), region: A.val("rtrOg") || "divers" }, v));
      else if (aj >= 0) Object.assign(c.ajouts[aj], v);
      else c.oar[id] = v;
      Object.assign(c, { majPar: D().u.uid, majParNom: $("nomMenu") ? $("nomMenu").textContent : "", majLe: new Date().toISOString() });
      tx.set(ref, c); return c;
    });
  } catch (e) { console.warn("organes du cabinet", e); A.toast("Pas de connexion : réessayez"); return; }
  A.fermerFenetre(); appliquerCab(); listeOar(); A.toast(revenir ? "La référence s'affiche de nouveau" : "Enregistré pour le cabinet");
};
// Contraintes (25/10/2026) : tous les organes, une ligne chacun, avec leurs contraintes en normofractionné, hypofractionné et stéréotaxie (selon le
// nombre de séances), et les précisions par localisation ; un clic ouvre la liste complète, modifiable par le médecin qui a le droit « modifier »
// (referentielRT/_contraintes) ; en bas, les contraintes propres aux essais et à la curiethérapie
const nomLoc = (id) => (loc(id) || {}).nom || id;
function cleOarsListe() {
  const vus = new Set(), r = [];
  BB.oar.forEach((o) => { const k = o.somme || o.paire || o.id; if (vus.has(k)) return; vus.add(k); r.push(k); });
  BB.base.forEach((l) => { if (!vus.has(l.oar_id)) { vus.add(l.oar_id); r.push(l.oar_id); } });
  return r;
}
function etiquette(l) { return [l.loc ? l.loc.map(nomLoc).join(", ") : "", l.fx ? l.fx + " séance" + (l.fx > 1 ? "s" : "") + (l.dpf ? " de " + nb(l.dpf) + " Gy" : "") : ""].filter(Boolean).join(" · "); }
function celluleRegime(L) {
  const esc = A.esc, g = []; L.forEach((l) => { const e = etiquette(l); let x = g.find((y) => y.e === e); if (!x) { x = { e, l: [] }; g.push(x); } x.l.push(l); });
  return g.sort((a, b) => (a.e ? 1 : 0) - (b.e ? 1 : 0)).map((x) => (x.e ? '<div class="rtr-ctg">' + esc(x.e) + "</div>" : "") + x.l.map((l) => '<div class="rtr-ctl">' + esc(l.indicateur || "") + " " + (l.ideal ? '<span class="mesures">idéal ' + esc(l.ideal) + "</span> " : "") + "<b>" + esc(l.limitant || "") + "</b></div>").join("")).join("");
}
async function pageContraintesRef() {
  const z = $("rtrSous"); if (!z) return;
  const esc = A.esc, q = sansAcc(RS.jeuQ).trim();
  const K = cleOarsListe().filter((k) => { const o = oar(k), L = BB.base.filter((l) => l.oar_id === k); return !q || sansAcc(o.nom + " " + (o.nom_tg263 || "") + " " + L.map((l) => l.indicateur).join(" ")).indexOf(q) >= 0; });
  const R0 = ["normo", "hypo", "stereo"];
  if (!$("rtrJq")) {
    z.innerHTML = '<div class="rtr-haut rtr-sh"><div class="recherche"><svg class="i"><use href="#i-loupe"/></svg><input id="rtrJq" type="search" autocomplete="off" placeholder="Rechercher un organe ou un indicateur" aria-label="Rechercher un organe" value="' + esc(RS.jeuQ) + '"></div></div><div class="rtr-liste rtr-sl" id="rtrJt"></div>';
    $("rtrJq").oninput = (e) => { RS.jeuQ = e.target.value; pageContraintesRef(); };
  }
  const a = BB.aideCol || {};
  $("rtrJt").innerHTML = '<p class="mesures rtr-nb">' + K.length + " organe" + (K.length > 1 ? "s" : "") + " · base RecoRad 2025, précisions par localisation" + (a.ideal ? " · <b>idéal</b> : " + esc(a.ideal) : "") + "</p>" +
    '<div class="rtr-tw"><table class="rtr-tab rtr-ctr"><thead><tr><th>Organe</th>' + R0.map((r) => "<th>" + REGIMES[r] + "</th>").join("") + "</tr></thead><tbody>" +
    K.map((k) => { const o = oar(k); return '<tr class="rtr-clic" tabindex="0" onclick="rtrDetailCt(this,\'' + esc(k) + '\')" onkeydown="if(event.key===\'Enter\')this.click()"><td data-l="Organe"><b>' + esc(o.nom) + "</b>" + (o.nom_tg263 ? '<br><span class="mesures">' + esc(o.nom_tg263) + "</span>" : "") + "</td>" +
      R0.map((r) => { const L = BB.base.filter((l) => l.oar_id === k && l.regime === r); return '<td data-l="' + REGIMES[r] + '">' + (L.length ? celluleRegime(L) : '<span class="mesures">—</span>') + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" +
    '<h3 class="rtr-tous">Contraintes propres aux essais et à la curiethérapie</h3><p class="mesures">Elles remplacent la base pour les organes qu\'elles citent, dans les schémas qui suivent l\'essai.</p>' +
    BB.jeux.map((j, i) => '<details class="rtr-e"><summary><span class="t"><b>' + esc(j.titre) + '</b> <span class="mesures">' + esc([j.fractionnement, j.source].filter(Boolean).join(" · ")) + "</span></span></summary>" + tableJeu(j, i) + "</details>").join("");
}
let CTED = null;
window.rtrDetailCt = (tr, k) => {
  const n = tr.nextElementSibling; if (n && n.classList.contains("rtr-det")) { n.remove(); CTED = null; return; }
  document.querySelectorAll(".rtr-ctr .rtr-det").forEach((x) => x.remove());
  const d = document.createElement("tr"); d.className = "rtr-det"; d.innerHTML = '<td colspan="4"></td>'; tr.after(d);
  CTED = { k, L: clone(BB.base.filter((l) => l.oar_id === k)), ret: [] }; dessinerCtEd();
};
function dessinerCtEd() {
  const z = document.querySelector(".rtr-ctr .rtr-det td"); if (!z || !CTED) return;
  const esc = A.esc, mod = peutModif(), R0 = [["normo", "Normofractionné"], ["hypo", "Hypofractionné"], ["stereo", "Stéréotaxie"]];
  const locs = [["", "Toutes"]].concat(INDEX.localisations.map((l) => [l.id, l.nom]));
  const c = (i, f, v, ph) => '<input class="rtr-in" data-cti="' + i + '" data-ctf="' + f + '" value="' + esc(txt(v)) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : "") + ' aria-label="' + esc(f) + '">';
  const s = (i, f, v, o) => '<select class="rtr-in" data-cti="' + i + '" data-ctf="' + f + '" aria-label="' + esc(f) + '">' + o.map(([k, l]) => '<option value="' + esc(k) + '"' + (txt(v) === k ? " selected" : "") + ">" + esc(l) + "</option>").join("") + "</select>";
  z.innerHTML = !mod ? '<p class="mesures">' + CTED.L.length + " contrainte" + (CTED.L.length > 1 ? "s" : "") + " · sources : " + esc([...new Set(CTED.L.map((l) => l.source).filter(Boolean))].join(" ; ")) + "</p>" :
    '<div class="rtr-tw"><table class="rtr-tab rtr-edt"><thead><tr><th>Régime</th><th>Séances</th><th>Localisation</th><th>Indicateur</th><th>Idéal</th><th>Limitant</th><th>Note</th><th></th></tr></thead><tbody>' +
    CTED.L.map((l, i) => '<tr><td data-l="Régime">' + s(i, "regime", l.regime, R0) + '</td><td data-l="Séances">' + c(i, "fx", l.fx, "toutes") + '</td><td data-l="Localisation">' + s(i, "loc", (l.loc || [])[0] || "", locs) + (l.loc && l.loc.length > 1 ? '<span class="mesures">' + esc(l.loc.map(nomLoc).join(", ")) + "</span>" : "") + "</td>" +
      '<td data-l="Indicateur">' + c(i, "indicateur", l.indicateur) + '</td><td data-l="Idéal">' + c(i, "ideal", l.ideal) + '</td><td data-l="Limitant">' + c(i, "limitant", l.limitant) + '</td><td data-l="Note">' + c(i, "note", l.note) + "</td>" +
      '<td><button type="button" class="mini" onclick="rtrCtLigne(' + i + ')" aria-label="Retirer cette contrainte">' + A.ic("croix") + "</button></td></tr>").join("") +
    '</tbody></table></div><div class="actr"><button type="button" class="mini rtr-aj" onclick="rtrCtLigne()">' + A.ic("plus") + 'Ajouter une contrainte</button><span></span><button class="bt plein petit" onclick="rtrCtEnr()">' + A.ic("enregistrer") + "Enregistrer pour le cabinet</button></div>";
}
document.addEventListener("input", (ev) => { const t = ev.target; if (!CTED || !t.dataset || t.dataset.cti == null) return; const l = CTED.L[Number(t.dataset.cti)], f = t.dataset.ctf;
  if (f === "fx") { const n = parseInt(t.value, 10); if (n > 0) l.fx = n; else delete l.fx; } else if (f === "loc") { if (t.value) { if (!(l.loc || []).length || l.loc.length === 1) l.loc = [t.value]; } else delete l.loc; } else l[f] = t.value; });
document.addEventListener("change", (ev) => { const t = ev.target; if (!CTED || !t.dataset || t.dataset.cti == null || t.tagName !== "SELECT") return; t.dispatchEvent(new Event("input", { bubbles: true })); });
window.rtrCtLigne = (i) => { if (!CTED) return; if (i == null) CTED.L.push({ id: "cc-" + Date.now().toString(36) + CTED.L.length, oar_id: CTED.k, regime: "normo", indicateur: "", limitant: "", source: "Cabinet" }); else { const x = CTED.L.splice(i, 1)[0]; if (x.id && !/^cc-/.test(x.id)) CTED.ret.push(x.id); } dessinerCtEd(); };
window.rtrCtEnr = async () => {
  if (!CTED || !peutModif()) return;
  const ref = doc(db, "espaces", A.ESPACE, "referentielRT", "_contraintes"), ids = new Set(BB.baseRef.map((l) => l.id));
  const propre = (l) => { const x = {}; ["id", "oar_id", "regime", "fx", "dpf", "loc", "indicateur", "ideal", "limitant", "note", "source"].forEach((k) => { if (l[k] !== undefined && l[k] !== "") x[k] = l[k]; }); return x; };
  const avant = {}; BB.baseRef.forEach((l) => { avant[l.id] = JSON.stringify(propre(l)); });
  const chang = CTED.L.map(propre).filter((l) => !ids.has(l.id) || avant[l.id] !== JSON.stringify(l));
  try {
    CAB_CT = await runTransaction(db, async (tx) => {
      const sn = await tx.get(ref), c = sn.exists() ? sn.data() : { lignes: [], retirees: [] };
      const autres = (c.lignes || []).filter((l) => l.oar_id !== CTED.k);
      c.lignes = autres.concat(chang); c.retirees = [...new Set((c.retirees || []).concat(CTED.ret))];
      Object.assign(c, { majPar: D().u.uid, majParNom: $("nomMenu") ? $("nomMenu").textContent : "", majLe: new Date().toISOString() });
      tx.set(ref, c); return c;
    });
  } catch (e) { console.warn("contraintes du cabinet", e); A.toast("Pas de connexion : réessayez"); return; }
  appliquerCab(); CTED = null; A.toast("Enregistré pour le cabinet"); pageContraintesRef();
};
// Essais : tableau triable (acronyme, année, localisation, revue), recherche ; détail : population, bras, schémas qui le citent
function citants(x) { return LISTE.filter((e) => (e.essais || []).indexOf(x.acronyme) >= 0); }
function pageEssaisRef() {
  const z = $("rtrSous"); if (!z) return;
  const esc = A.esc;
  if (!$("rtrEq")) {
    z.innerHTML = '<div class="rtr-haut rtr-sh"><div class="recherche"><svg class="i"><use href="#i-loupe"/></svg><input id="rtrEq" type="search" autocomplete="off" placeholder="Rechercher un essai (acronyme, revue, population, résultat)" aria-label="Rechercher un essai" value="' + esc(RS.essQ) + '"></div></div><div class="rtr-liste rtr-sl" id="rtrEl"></div>';
    $("rtrEq").oninput = (e) => { RS.essQ = e.target.value; listeEssais(); };
  }
  listeEssais();
}
window.RS_tri = (k) => { if (RS.essTri === k) RS.essSens = -RS.essSens; else { RS.essTri = k; RS.essSens = k === "annee" ? -1 : 1; } listeEssais(); };
function listeEssais() {
  const z = $("rtrEl"); if (!z) return;
  const esc = A.esc, q = sansAcc(RS.essQ).trim(), locsDe = (x) => [...new Set(citants(x).map((e) => (loc(e.localisation_id) || {}).nom))].join(", ");
  const L = BB.essais.map((x) => ({ x, locs: locsDe(x) })).filter(({ x, locs }) => !q || sansAcc([x.acronyme, x.revue, x.annee, x.population, x.bras, x.resultat, locs].join(" ")).indexOf(q) >= 0);
  const v = { acronyme: ({ x }) => sansAcc(x.acronyme), annee: ({ x }) => x.annee || 0, localisation: ({ locs }) => sansAcc(locs || "zzz"), revue: ({ x }) => sansAcc(x.revue || "") }[RS.essTri];
  L.sort((a, b) => (v(a) < v(b) ? -1 : v(a) > v(b) ? 1 : 0) * RS.essSens);
  const th = (k, l) => '<th><button type="button" class="rtr-tri' + (RS.essTri === k ? " on" : "") + '" onclick="RS_tri(\'' + k + '\')" aria-sort="' + (RS.essTri === k ? (RS.essSens > 0 ? "ascending" : "descending") : "none") + '">' + l + (RS.essTri === k ? (RS.essSens > 0 ? " ▲" : " ▼") : "") + "</button></th>";
  z.innerHTML = '<p class="mesures rtr-nb">' + L.length + " essai" + (L.length > 1 ? "s" : "") + " et références</p>" + (L.length ? '<div class="rtr-tw"><table class="rtr-tab rtr-et2"><thead><tr>' + th("acronyme", "Acronyme") + th("annee", "Année") + th("localisation", "Localisation") + th("revue", "Revue") + "</tr></thead><tbody>" +
    L.slice(0, 300).map(({ x, locs }) => '<tr class="rtr-clic" tabindex="0" onclick="rtrDetailEssai(this,\'' + esc(x.id) + '\')" onkeydown="if(event.key===\'Enter\')this.click()"><td data-l="Acronyme"><b>' + esc(x.acronyme) + '</b></td><td class="n" data-l="Année">' + esc(x.annee || "") + '</td><td data-l="Localisation">' + court(locs || "—", 50) + '</td><td data-l="Revue">' + esc(x.revue || "") + "</td></tr>").join("") + "</tbody></table></div>" + (L.length > 300 ? '<p class="mesures rtr-nb">Affinez la recherche pour voir les ' + (L.length - 300) + " autres.</p>" : "") : '<div class="vide-c">Aucun essai ne correspond</div>');
}
window.rtrDetailEssai = (tr, id) => {
  const n = tr.nextElementSibling; if (n && n.classList.contains("rtr-det")) { n.remove(); return; }
  const x = BB.essais.find((e) => e.id === id), esc = A.esc, C = citants(x), d = document.createElement("tr"); d.className = "rtr-det";
  const liens = [].concat(x.pmid ? [x.pmid] : [], x.pmid_suite || []).map((p) => '<a href="https://pubmed.ncbi.nlm.nih.gov/' + esc(p) + '/" target="_blank" rel="noopener">PubMed ' + esc(p) + "</a>").concat([].concat(x.doi ? [x.doi] : [], x.doi_suite || []).map((o) => '<a href="https://doi.org/' + esc(o) + '" target="_blank" rel="noopener">DOI</a>')).join(" · ");
  d.innerHTML = '<td colspan="4">' + (x.resultat ? "<p>" + esc(x.resultat) + "</p>" : "") + (x.population ? '<p><span class="mesures">Population</span> ' + esc(x.population) + "</p>" : "") + (x.bras ? '<p><span class="mesures">Bras</span> ' + esc(x.bras) + "</p>" : "") + (liens ? "<p>" + liens + "</p>" : "") +
    '<p class="mesures">Cité par ' + C.length + " schéma" + (C.length > 1 ? "s" : "") + (C.length ? " : " + C.slice(0, 12).map((e) => '<a href="#radiotherapie/s/' + encodeURIComponent(e.id) + '/essais">' + esc(e.titre) + "</a>").join(" · ") + (C.length > 12 ? " · …" : "") : "") + "</p></td>";
  tr.after(d);
};
// Calcul BED / EQD2 : un seul écran, tout se recalcule pendant la frappe (moteur/rtref.js calculBED) ; valeurs gardées pendant la session
const CALC0 = () => ({ lignes: [{ d: "", n: "" }], ab: ["1,5", "3", "10"], x: "2,0", N: "25" });
let CALC = CALC0();
function pageCalcul(pre) {
  const z = $("rtrSous"); if (!z) return;
  if (pre) { const [d, n] = pre.split("/"); if (d && n) CALC = Object.assign(CALC0(), { lignes: [{ d: d.replace(".", ","), n }] }); }
  const esc = A.esc, mult = CALC.lignes.length > 1;
  z.innerHTML = '<div class="rtr-fiche rtr-calc"><h3>Traitements</h3>' + CALC.lignes.map((l, i) => '<div class="rtr-cl"><label>Dose par fraction (Gy)<input class="rtr-in n" inputmode="decimal" data-c="d" data-i="' + i + '" value="' + esc(l.d) + '"></label><label>Fractions<input class="rtr-in n" inputmode="decimal" data-c="n" data-i="' + i + '" value="' + esc(l.n) + '"></label><span class="rtr-cto mesures" id="rtrCt' + i + '"></span>' +
      (mult ? '<button type="button" class="mini" onclick="rtrCalcLigne(' + i + ')" aria-label="Retirer ce traitement">' + A.ic("croix") + "</button>" : "") + "</div>").join("") +
    '<button type="button" class="mini rtr-aj" onclick="rtrCalcLigne()">' + A.ic("plus") + 'Ajouter un traitement</button><p class="rtr-ctot" id="rtrCtot"></p>' +
    '<div class="rtr-tw"><table class="rtr-tab rtr-cres"><thead><tr><th>α/β (Gy)</th>' + CALC.ab.map((a, k) => '<th class="n"><input class="rtr-in n rtr-ab" inputmode="decimal" data-c="ab" data-i="' + k + '" value="' + esc(a) + '" aria-label="α/β ' + (k + 1) + '"></th>').join("") + "</tr></thead><tbody>" +
    '<tr class="rtr-eqd"><th scope="row"><span class="lg">EQD en </span><span class="sm">EQD</span><input class="rtr-in n rtr-x" inputmode="decimal" data-c="x" value="' + esc(CALC.x) + '" aria-label="Dose par fraction de référence (Gy)"><span class="lg"> Gy/fx</span></th>' + CALC.ab.map((a, k) => '<td class="n" id="rtrE' + k + '">—</td>').join("") + "</tr>" +
    '<tr><th scope="row">BED</th>' + CALC.ab.map((a, k) => '<td class="n" id="rtrB' + k + '">—</td>').join("") + "</tr>" +
    '<tr><th scope="row"><span class="lg">Dose par fraction en </span><span class="sm">Dose/fx en </span><input class="rtr-in n rtr-x" inputmode="decimal" data-c="N" value="' + esc(CALC.N) + '" aria-label="Nombre de fractions"> fx</th>' + CALC.ab.map((a, k) => '<td class="n" id="rtrD' + k + '">—</td>').join("") + "</tr></tbody></table></div>" +
    (mult ? '<details class="rtr-cdet"><summary>Détail par traitement</summary><div class="rtr-tw"><table class="rtr-tab"><thead><tr><th>Traitement</th>' + CALC.ab.map((a, k) => '<th class="n" id="rtrDh' + k + '"></th>').join("") + "</tr></thead><tbody>" +
      CALC.lignes.map((l, i) => '<tr><th scope="row" id="rtrDl' + i + '"></th>' + CALC.ab.map((a, k) => '<td class="n" id="rtrDd' + i + "_" + k + '">—</td>').join("") + "</tr>").join("") + "</tbody></table></div></details>" : "") +
    '<p class="mesures">Modèle linéaire-quadratique, sans correction de temps. Indicatif. <a href="#" class="rtr-lien" onclick="rtrCalcEffacer();return false">Tout effacer</a></p></div>';
  calculer();
}
function calculer() {
  const R = calculBED({ lignes: CALC.lignes, ab: CALC.ab, x: CALC.x, N: CALC.N }), set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  CALC.lignes.forEach((l, i) => { const ok = R.valides[i], e = document.querySelectorAll('[data-i="' + i + '"][data-c]'); e.forEach((x) => { const v = x.dataset.c === "d" ? l.d : l.n; x.classList.toggle("err", String(v).trim() !== "" && isNaN(nombre(v))); }); set("rtrCt" + i, ok ? "= " + fixe(nombre(l.d) * nombre(l.n), 1) + " Gy" : ""); set("rtrDl" + i, ok ? nb(nombre(l.d)) + " Gy × " + nb(nombre(l.n)) : "—"); });
  const nv = R.valides.filter(Boolean).length;
  set("rtrCtot", CALC.lignes.length > 1 && nv ? "Total : " + nb(R.total.n) + " fractions · " + fixe(R.total.dose, 1) + " Gy" : "");
  R.colonnes.forEach((c, k) => { set("rtrE" + k, fixe(c.eqd, 1)); set("rtrB" + k, fixe(c.bed, 1)); set("rtrD" + k, fixe(c.dN, 2)); set("rtrDh" + k, "α/β " + (isNaN(c.ab) ? "—" : nb(c.ab))); c.detail.forEach((v, i) => set("rtrDd" + i + "_" + k, fixe(v, 1))); });
  document.querySelectorAll(".rtr-calc [data-c=ab],.rtr-calc [data-c=x],.rtr-calc [data-c=N]").forEach((x) => x.classList.toggle("err", isNaN(nombre(x.value))));
}
document.addEventListener("input", (ev) => {
  const t = ev.target; if (!t.dataset || !t.dataset.c || !t.closest(".rtr-calc")) return;
  const c = t.dataset.c, i = Number(t.dataset.i);
  if (c === "d" || c === "n") CALC.lignes[i][c] = t.value; else if (c === "ab") CALC.ab[i] = t.value; else CALC[c] = t.value;
  calculer();
});
// Entrée passe au champ suivant : dose, fractions, puis la ligne suivante
document.addEventListener("keydown", (ev) => {
  const t = ev.target; if (ev.key !== "Enter" || !t.dataset || !t.dataset.c || !t.closest(".rtr-calc")) return;
  ev.preventDefault(); const L = [...document.querySelectorAll(".rtr-calc input")], i = L.indexOf(t); if (L[i + 1]) { L[i + 1].focus(); L[i + 1].select(); }
});
window.rtrCalcLigne = (i) => { if (i == null) CALC.lignes.push({ d: "", n: "" }); else CALC.lignes.splice(i, 1); pageCalcul(); const L = document.querySelectorAll('.rtr-calc [data-c="d"]'); if (i == null && L.length) L[L.length - 1].focus(); };
window.rtrCalcEffacer = () => { CALC = CALC0(); pageCalcul(); };
async function pageSous(k, reste) {
  $("page").innerHTML = '<div class="rtr sous" id="rtr">' + ongletsPage(k) + '<div id="rtrSous"><div class="rtr-ch">' + "<i></i>".repeat(4) + "</div></div></div>";
  try { await charger(); await chargerBibs(); } catch (e) { const z = $("rtrSous"); if (z) z.innerHTML = erreurHtml(); return; }
  if (!$("rtrSous")) return;
  if (k === "oar") pageOar(); else if (k === "contraintes") await pageContraintesRef(); else if (k === "essais") pageEssaisRef(); else pageCalcul(reste);
}

// ───── Page ─────
// arg : null (accueil et liste) ou « s/<schemaId>/<onglet> » (fiche) ; sous 1 280 px la fiche prend toute la page
export async function pageRadiotherapie(arg) {
  // Lien « Référentiel › » du dossier (RT8) : #radiotherapie/diag/<diagnostic> = liste filtrée sur la localisation, sinon l'accueil
  if (/^diag\//.test(arg || "")) {
    let l = null; try { await charger(); const c = (await json("diag-localisation.json")).correspondances || {}; l = loc(c[arg.slice(5)]); } catch (e) { console.warn("diag-localisation", e); }
    Object.assign(RF, { q: "", reg: l ? l.region_id : "", loc: l ? l.id : "", sit: "", frac: "", sel: -1 }); location.replace("#radiotherapie"); return;
  }
  const sp = /^(oar|contraintes|essais|calcul)(?:\/(.*))?$/.exec(arg || "");
  if (sp) { ARG = arg; RF.ouvert = null; await pageSous(sp[1], sp[2]); return; }
  if (arg === "nouveau" && !NOUVEAU && !(ED && ED.nouveau)) { location.replace("#radiotherapie"); return; }
  ARG = arg || null;
  const m = /^s\/([^/]+)(?:\/([a-z]+))?/.exec(arg || ""), id = m ? m[1] : arg === "nouveau" ? "nouveau" : null;
  if (!id) RF.ouvert = null;
  // fiche en pleine page (demande du 25/10/2026 : plus de liste à gauche) ; « Retour à la liste » retrouve la recherche et la position
  const seule = !!id;
  {
    $("page").innerHTML = '<div class="rtr' + (seule ? " seule" : "") + '" id="rtr">' + (seule ? "" : ongletsPage("")) +
      (seule ? "" : '<div class="rtr-haut"><div class="recherche"><svg class="i"><use href="#i-loupe"/></svg><input id="rtrQ" type="search" autocomplete="off" placeholder="Rechercher : localisation, dose, essai (ex. prostate 60, col curie, 45 Gy)" aria-label="Rechercher un schéma" value="' + A.esc(RF.q) + '"></div><div class="rtr-filtres" id="rtrFiltres"></div></div>') +
      '<div class="rtr-corps">' + (seule ? "" : '<div class="rtr-liste" id="rtrListe"></div>') + (id ? '<div class="rtr-fiche" id="rtrFiche"></div>' : "") + "</div></div>";
    const q = $("rtrQ");
    if (q) {
      q.oninput = () => { RF.q = q.value; RF.sel = -1; dessinerFiltres(); dessinerListe(); };
      q.onkeydown = (ev) => {
        if (ev.key === "Escape") { ev.preventDefault(); window.rtrEffacer(); return; }
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { if (!VUS.length) return; ev.preventDefault(); RF.sel = Math.max(0, Math.min(VUS.length - 1, RF.sel + (ev.key === "ArrowDown" ? 1 : -1))); dessinerListe(); const s = document.querySelector(".rtr-l.sel"); if (s) s.scrollIntoView({ block: "nearest" }); return; }
        if (ev.key === "Enter") { const e = VUS[RF.sel < 0 ? 0 : RF.sel]; if (e) { ev.preventDefault(); window.rtrOuvrir(e.id); } }
      };
      if (window.innerWidth >= 900 && !id) q.focus();
    }
  }
  dessinerListe();
  try { await charger(); } catch (e) { console.warn("référentiel de radiothérapie", e); }
  if (!$("rtr")) return; // page quittée pendant le chargement
  dessinerFiltres(); dessinerListe();
  if (id === "nouveau") {
    // schéma créé ou dupliqué : fiche en modification, enregistrée seulement par « Enregistrer pour le cabinet »
    if (NOUVEAU) { const n = NOUVEAU; NOUVEAU = null; demarrer(n); FICHE = { e: { id: n.id, titre: n.schema.titre, situation_id: n.schema.situation_id, localisation_id: n.localisation_id, preuve: "pratique_du_cabinet" }, cab: null, schema: ED.schema, loc: n.loc, B: n.B, onglet: "prescription" }; }
    RF.ouvert = ED.id; dessinerFiche();
  } else if (id) await ouvrirFiche(decodeURIComponent(id), m[2]);
  else if (RF.y) { window.scrollTo(0, RF.y); RF.y = 0; }
}
