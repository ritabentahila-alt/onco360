// Onco360 – Référentiel de radiothérapie (phase RTR, spécification docs/radiotherapie/SPEC.md, « Écrans et affichage »).
// Menu « Radiothérapie » (module rt, fonction rt.referentiel, droit referentielRT voir | modifier : RT1). Référence = public/donnees-rt
// (index.json, un fichier par localisation ; jamais modifiés par l'application) ; changements du cabinet = espaces/{e}/referentielRT/{id}
// (écrits en RT5) ; calculs dans moteur/rtref.js. Le module n'écrit rien dans les dossiers patients.
// RT3 (25/10/2026) : page Référentiel. Recherche du module (fixée en haut ; ↑ ↓ Entrée Échap), menus Région › Localisation › Situation ›
// Fractionnement (nombre de schémas entre parenthèses ; Situation = contextes tant qu'aucune localisation n'est choisie), liste (2 lignes par
// schéma, intertitre par localisation, termes surlignés, étoile), accueil sans recherche (Favoris, Consultés récemment, Sommaire), états
// (chargement, aucun résultat, erreur). Recherche et menus restent en mémoire pendant la session (comme les filtres de Protocoles).
// Réglages personnels : utilisateurs/{uid}.rtFavoris (identifiants), .rtRecents (8 derniers ouverts), .rtOnglet (dernier onglet de fiche).
// Fiche (RT4) : à partir de 1 280 px, à droite de la liste ; en dessous, page entière avec Retour.
import { collection, doc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { fusionner, trier, chercher, motBloquant, termes, sansAcc, resumePrescription, libPreuve, nb, TYPES, FRACTIONNEMENTS, CONTEXTES } from "../moteur/rtref.js";
import { idProtocole } from "./protocoles.js";

let A = null, INDEX = null, CAB = null, LISTE = null, ERREUR = null, CHARGE = null;
const LOCS = {}, TEXTES = new Map();
// Recherche et menus de la session ; sel = ligne choisie au clavier ; filtres = menus ouverts sur téléphone
const RF = { q: "", reg: "", loc: "", sit: "", frac: "", sel: -1, filtres: false, y: 0, ouvert: null };
let ARG = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const large = () => window.innerWidth >= 1280;

// ───── Chargement (une fois par session ; servi en no-cache) ─────
async function json(f) { const r = await fetch("donnees-rt/" + f, { cache: "no-cache" }); if (!r.ok) throw new Error(f + " : " + r.status); return r.json(); }
function charger() {
  if (LISTE) return Promise.resolve();
  if (!CHARGE) CHARGE = (async () => {
    try {
      INDEX = await json("index.json");
      CAB = {};
      try { (await getDocs(collection(db, "espaces", A.ESPACE, "referentielRT"))).forEach((d) => { CAB[d.id] = d.data(); }); } catch (e) { console.warn("référentiel du cabinet", e); }
      LISTE = fusionner(INDEX, CAB); ERREUR = null;
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
    '<div class="rtr-mz' + (RF.filtres ? " ouv" : "") + '">' + menus() + (n || RF.q ? '<button class="bt gris petit" onclick="rtrEffacer()">Effacer</button>' : "") + "</div>";
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
  if (accueil) { VUS = []; z.innerHTML = accueilHtml(); return; }
  const L = trier(filtrer(), INDEX, RF.q), T = termes(RF.q), esc = A.esc; VUS = L;
  if (RF.sel >= L.length) RF.sel = L.length - 1;
  let h = '<p class="mesures rtr-nb">' + L.length + " schéma" + (L.length > 1 ? "s" : "") + "</p>";
  const s = RF.sit && !RF.sit.startsWith("ctx:") ? sit(RF.sit) : null;
  if (s && s.criteres) { const c = s.criteres, court = c.length > 90 ? c.slice(0, c.lastIndexOf(" ", 88)) + "…" : c; h += '<p class="rtr-crit">' + esc(court) + (court !== c ? ' <span class="rtr-aide" tabindex="0" title="' + esc(c) + '">?</span>' : "") + "</p>"; }
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
function accueilHtml() {
  const esc = A.esc, nCurie = LISTE.filter((e) => fracDe(e) === "Curiethérapie").length;
  let h = blocListe("Favoris", favoris()) + blocListe("Consultés récemment", recents());
  h += '<section class="rtr-bloc"><h3>Sommaire</h3><button class="rtr-curie" onclick="rtrSommaire(\'\',\'\',\'Curiethérapie\')">Curiethérapie <span>(' + nCurie + ')</span></button><div class="rtr-som">';
  INDEX.regions.slice().sort((a, b) => a.ordre - b.ordre).forEach((r) => {
    const L = INDEX.localisations.filter((l) => l.region_id === r.id).sort((a, b) => a.ordre - b.ordre); if (!L.length) return;
    h += '<div class="rtr-reg"><h4>' + esc(r.nom) + "</h4>" + L.map((l) => { const n = LISTE.filter((e) => e.localisation_id === l.id).length;
      return n ? '<button onclick="rtrSommaire(\'' + r.id + "','" + l.id + "')\">" + esc(l.nom) + " <span>(" + n + ")</span></button>" : '<span class="rtr-red">' + esc(l.nom) + " · En cours de rédaction</span>"; }).join("") + "</div>";
  });
  return h + "</div></section>";
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
window.rtrOnglet = (o) => { if (profil().rtOnglet !== o) noter({ rtOnglet: o }); location.hash = "radiotherapie/s/" + encodeURIComponent(RF.ouvert) + "/" + o; };
const chargerBibs = () => BIBS || (BIBS = Promise.all(["oar.json", "contraintes.json", "essais.json"].map(json)).then(([o, c, e]) => ({ oar: o.oar, jeux: c.jeux, aide: c.aide_colonnes, essais: e.essais })).catch((e) => { BIBS = null; throw e; }));
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
function court(t, n = 90) {
  const s = String(t == null ? "" : t), esc = A.esc; if (IMPRESSION || s.length <= n) return esc(s);
  const c = s.slice(0, s.lastIndexOf(" ", n - 2) > 40 ? s.lastIndexOf(" ", n - 2) : n - 2).replace(/[\s,;:]+$/, "") + "…";
  return '<span class="rtr-c"><span>' + esc(c) + '</span> <button type="button" class="rtr-aide" title="' + esc(s) + '" aria-label="Lire la suite" onclick="rtrPlus(this,event)">?</button><span hidden>' + esc(s) + "</span></span>";
}
window.rtrPlus = (b, ev) => { if (ev) ev.stopPropagation(); const p = b.parentNode; p.firstChild.hidden = true; b.hidden = true; p.lastChild.hidden = false; };
// Paragraphes rédigés : HTML échappé, puis **gras**, `identifiant` et [lien](url) seulement
const md = (t) => A.esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
const textes = (k) => ((FICHE.loc.textes || {})[k] || []).map((p) => '<p class="rtr-tx">' + md(p) + "</p>").join("");
const vide = (note) => "—" + (note ? " " + (IMPRESSION ? '<span class="mesures">' + A.esc(note) + "</span>" : '<button type="button" class="rtr-aide" title="' + A.esc(note) + '" aria-label="Note" onclick="rtrPlus2(this,event)">?</button><span class="mesures" hidden> ' + A.esc(note) + "</span>") : "");
window.rtrPlus2 = (b, ev) => { if (ev) ev.stopPropagation(); b.hidden = true; b.nextSibling.hidden = false; };
const num = (v, suf) => (typeof v === "number" && isFinite(v) ? nb(v) + (suf || "") : null);
const essai = (id) => FICHE.B.essais.find((x) => x.id === id);
const acronymes = (ids) => (ids || []).map((i) => (essai(i) || {}).acronyme || i).join(", ");
const oar = (id) => (id === "cible-ctv" ? { nom: "Cible (CTV)" } : id === "cible-ptv" ? { nom: "Cible (PTV)" } : FICHE.B.oar.find((o) => o.id === id) || { nom: id });
// Lien vers Protocoles : par le nom exact, sinon la page filtrée sur la localisation ; sans module chimio ni la fonction : le nom seul
function lienProtocole(nom) {
  const esc = A.esc; if (!nom) return "";
  if (!A.module("chimio") || !A.fn("chimio.protocoles")) return nom === "—" ? "" : esc(nom);
  const id = nom === "—" ? null : idProtocole(nom), cible = id ? encodeURIComponent(id) : "loc/" + encodeURIComponent(FICHE.loc.nom);
  return (nom === "—" ? "" : esc(nom) + " ") + '<a class="rtr-lien" href="#protocoles/' + cible + '">Ouvrir dans Protocoles ›</a>';
}

// Prescription
function tablePrescription(L) {
  const esc = A.esc;
  return '<div class="rtr-tw"><table class="rtr-tab"><thead><tr><th>Volume</th><th class="n">Dose totale (Gy)</th><th class="n">Séances</th><th class="n">Dose par séance (Gy)</th><th>Mode</th><th>Rythme</th></tr></thead><tbody>' +
    L.map((p) => "<tr" + (p.mode === "SIB" ? ' class="sib"' : "") + '><td data-l="Volume"><b>' + esc(p.volume || "") + "</b>" + (p.note ? '<div class="mesures">' + court(p.note) + "</div>" : "") + "</td>" +
      '<td class="n" data-l="Dose totale (Gy)">' + (num(p.dose_Gy) || vide(p.note)) + '</td><td class="n" data-l="Séances">' + (num(p.fractions) || "—") + '</td><td class="n" data-l="Dose par séance (Gy)">' + (num(p.dose_fx_Gy) || "—") + "</td>" +
      '<td data-l="Mode">' + esc(MODES[p.mode] || p.mode || "") + '</td><td data-l="Rythme">' + court(p.rythme || "", 40) + "</td></tr>").join("") + "</tbody></table></div>";
}
function lignesSyst(rows, champ) {
  const esc = A.esc, s = FICHE.schema;
  const L = rows.filter((x) => !x.situation_id || x.situation_id === s.situation_id); if (!L.length) return "";
  return '<ul class="rtr-sys">' + L.map((x) => "<li>" + (x.situation ? '<span class="mesures">' + esc(x.situation) + " :</span> " : "") + court(x[champ] || "", 140) + (x.protocole ? " · " + lienProtocole(x.protocole) : "") +
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
  if (s.couverture) h += "<h4>Objectifs de couverture</h4><p>" + court(s.couverture, 200) + "</p>";
  if (curie && (L.curie_indications || []).length) h += "<h4>Curiethérapie : indications</h4><ul class=\"rtr-sys\">" + L.curie_indications.map((x) => "<li><b>" + esc(x.indication || "") + "</b> · " + esc(x.modalite || "") + (x.niveau_preuve ? ' <span class="mesures">(' + esc(x.niveau_preuve) + ")</span>" : "") + (x.note ? '<div class="mesures">' + court(x.note) + "</div>" : "") + "</li>").join("") + "</ul>" + textes("curietherapie");
  if (FICHE.cab && FICHE.cab.note) h += "<h4>Note du médecin</h4><p>" + esc(FICHE.cab.note) + "</p>";
  return h;
}
// Centrage
const SIM = [["position", "Position"], ["contention", "Contention"], ["preparation", "Préparation"], ["scanner", "Scanner"], ["imagerie", "Imagerie"], ["reperes", "Repères"]];
const simDe = () => (FICHE.loc.simulations || []).find((x) => x.id === FICHE.schema.simulation_id);
function ongletCentrage() {
  const m = simDe(); if (!m) return '<p class="vide-c">Pas de fiche de centrage du service pour cette localisation</p>' + textes("centrage");
  return '<dl class="rtr-dl">' + SIM.filter(([k]) => m[k]).map(([k, lib]) => "<dt>" + lib + "</dt><dd>" + court(m[k], 220) + "</dd>").join("") + "</dl>" + textes("centrage");
}
// Contourage
const volDe = () => (FICHE.loc.volumes || []).find((x) => x.id === FICHE.schema.volumes_id);
function ongletContourage() {
  const esc = A.esc, v = volDe(); if (!v) return '<p class="vide-c">Pas de volumes décrits pour ce schéma</p>' + textes("contourage");
  let h = '<div class="rtr-tw"><table class="rtr-tab"><thead><tr><th>Nom</th><th>Type</th><th>Définition</th><th>Quand</th><th>Marge</th></tr></thead><tbody>' + (v.cibles || []).map((c) =>
    '<tr><td data-l="Nom"><b>' + esc(c.nom || "") + '</b></td><td data-l="Type"><span class="badge b-gr">' + esc(c.type || "") + '</span></td><td data-l="Définition">' + court(c.definition || "") + '</td><td data-l="Quand">' + court(c.quand || "", 60) + '</td><td data-l="Marge"><b>' + esc(c.marge || "—") + "</b></td></tr>").join("") + "</tbody></table></div>";
  if ((v.oar_ids || []).length) h += "<h4>Organes à risque à contourer</h4><ul class=\"rtr-oar\">" + v.oar_ids.map((id) => { const o = oar(id), n = (v.oar_notes || {})[id];
    return "<li>" + esc(o.nom) + (o.nom_tg263 ? ' <span class="mesures">' + esc(o.nom_tg263) + "</span>" : "") + (n ? ' <span class="mesures">(' + esc(n) + ")</span>" : "") + (o.definition && !IMPRESSION ? ' <button type="button" class="rtr-aide" title="' + esc(o.definition) + '" aria-label="Définition" onclick="rtrPlus2(this,event)">?</button><span class="mesures" hidden> ' + esc(o.definition) + "</span>" : "") + "</li>"; }).join("") + "</ul>";
  if ((v.atlas || []).length) h += '<p class="rtr-l2"><span class="mesures">Atlas</span> ' + v.atlas.map((a) => (a.url ? '<a href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.nom) + "</a>" : esc(a.nom))).join(" · ") + "</p>";
  return h + textes("contourage");
}
// Contraintes : un bloc par jeu, lignes groupées par OAR ; « ? » d'Idéal et de Limitant tirés de aide_colonnes
const jeuxDe = () => (FICHE.schema.contraintes_ids || []).map((id) => FICHE.B.jeux.find((j) => j.id === id)).filter(Boolean);
function aideDe(j) { const A2 = FICHE.B.aide || []; return A2.find((a) => a.source_contient !== "defaut" && String(j.source || "").indexOf(a.source_contient) >= 0) || A2.find((a) => a.source_contient === "defaut") || {}; }
function groupes(j) { const g = []; j.lignes.forEach((l) => { const d = g[g.length - 1]; if (d && d.oar === l.oar_id) d.l.push(l); else g.push({ oar: l.oar_id, l: [l] }); }); return g; }
function tableJeu(j, i) {
  const esc = A.esc, a = aideDe(j), aide = (t) => (t && !IMPRESSION ? ' <span class="rtr-aide" tabindex="0" title="' + esc(t) + '">?</span>' : "");
  return '<section class="rtr-jeu" id="rtrJeu' + i + '"><div class="rtr-jt"><div><h4>' + esc(j.titre) + '</h4><p class="mesures">' + esc([j.fractionnement, j.source].filter(Boolean).join(" · ")) + "</p></div>" +
    (IMPRESSION ? "" : '<button type="button" class="mini rtr-cp" onclick="rtrCopierJeu(' + i + ')">' + A.ic("copier") + "Copier</button>") + "</div>" +
    '<div class="rtr-tw"><table class="rtr-tab rtr-ct"><thead><tr><th>Organe</th><th>Indicateur</th><th class="n">Idéal' + aide(a.ideal) + '</th><th class="n">Limitant' + aide(a.limitant) + "</th><th>Note</th></tr></thead><tbody>" +
    groupes(j).map((g) => { const o = oar(g.oar); return g.l.map((l, k) => '<tr class="' + (k ? "" : "g1") + '">' + (k ? "" : '<td class="o" rowspan="' + g.l.length + '" data-l="Organe"><b>' + esc(o.nom) + "</b>" + (o.nom_tg263 ? '<br><span class="mesures">' + esc(o.nom_tg263) + "</span>" : "") + "</td>") +
      '<td data-l="Indicateur">' + esc(l.indicateur || "") + '</td><td class="n" data-l="Idéal">' + esc(l.ideal || "") + '</td><td class="n lim" data-l="Limitant">' + esc(l.limitant || "") + '</td><td data-l="Note">' + court(l.note || "", 60) + "</td></tr>").join(""); }).join("") + "</tbody></table></div></section>";
}
function ongletContraintes() {
  const J = jeuxDe(), esc = A.esc; if (!J.length) return '<p class="vide-c">Aucun jeu publié pour ce fractionnement</p>';
  return (J.length > 1 ? '<div class="rtr-raccourcis">' + J.map((j, i) => '<button type="button" class="mini" onclick="document.getElementById(\'rtrJeu' + i + '\').scrollIntoView({block:\'start\'})">' + esc(j.titre) + "</button>").join("") + "</div>" : "") + J.map(tableJeu).join("");
}
window.rtrCopierJeu = (i) => {
  const j = jeuxDe()[i]; if (!j) return;
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
function nombres() { const J = jeuxDe(); return { prescription: (FICHE.schema.prescriptions || []).length, centrage: simDe() ? 1 : 0, contourage: volDe() ? 1 : 0, contraintes: J.reduce((n, j) => n + j.lignes.length, 0), essais: (FICHE.schema.essai_ids || []).length, attention: pointsDe().length }; }
function enteteHtml() {
  const esc = A.esc, { e, schema } = FICHE, s = sit(e.situation_id) || {}, l = loc(e.localisation_id) || {}, r = INDEX.regions.find((x) => x.id === l.region_id) || {}, fav = favoris().indexOf(e.id) >= 0;
  const etoile = '<button class="rtr-et' + (fav ? " on" : "") + '" title="' + (fav ? "Retirer des favoris" : "Ajouter aux favoris") + '" aria-pressed="' + fav + '" onclick="rtrEtoile(\'' + esc(e.id) + "')\">" + A.ic("etoile") + "</button>";
  return '<div class="rtr-ft">' + (large() ? "" : '<button class="mini rtr-ret" onclick="rtrRetour()">' + A.ic("retour") + "Retour</button>") +
    '<div class="rtr-ar" role="navigation" aria-label="Fil d\'Ariane"><a href="#radiotherapie" onclick="rtrSommaire(\'' + r.id + "','');return true\">" + esc(r.nom || "") + '</a> › <a href="#radiotherapie" onclick="rtrSommaire(\'' + r.id + "','" + l.id + "');return true\">" + esc(l.nom || "") + "</a> › <span>" + esc(s.titre || "") + "</span></div>" +
    '<div class="rtr-t"><h2>' + esc(e.titre) + '</h2><div class="rtr-act">' + etoile + '<button class="bt clair petit rtr-imp" onclick="rtrImprimer()">' + A.ic("imprimer") + "Imprimer</button>" +
    '<details class="m3 rtr-pts3"><summary class="mini" title="Autres actions" aria-label="Autres actions">⋯</summary><div class="m3-l"><button class="mini" onclick="this.closest(\'details\').open=false;rtrImprimer()">' + A.ic("imprimer") + "Imprimer</button></div></details></div></div>" +
    '<div class="rtr-res">' + esc(resumePrescription(schema)) + ' <span class="badge b-ch"><svg class="pi"><use href="#i-check"/></svg>Validé</span> <span class="badge b-gr">' + esc(libPreuve(schema.preuve || e.preuve)) + "</span>" + (schema.date_verif ? ' <span class="mesures">Vérifié le ' + esc(dfr(schema.date_verif)) + "</span>" : "") + "</div>" +
    (e.modifie ? '<p class="mesures rtr-mod"><span class="badge b-or">Modifié pour le cabinet</span>' + (e.cab && e.cab.majParNom ? " · par " + esc(e.cab.majParNom) + (e.cab.majLe ? " le " + esc(dfr(String(e.cab.majLe).slice(0, 10))) : "") : "") + (e.refChangee ? " · La référence a changé depuis" : "") + "</p>" : "") + "</div>";
}
function dessinerFiche() {
  const z = $("rtrFiche"); if (!z || !FICHE) return;
  const n = nombres(), o = FICHE.onglet;
  z.innerHTML = enteteHtml() + '<div class="ag-vues defile rtr-ong" role="tablist">' + ONGLETS.map(([k, lib]) => '<button role="tab" aria-selected="' + (k === o) + '" class="' + (k === o ? "on" : "") + (n[k] ? "" : " vide") + '" onclick="rtrOnglet(\'' + k + "')\">" + lib + (n[k] && ["contraintes", "essais", "attention"].indexOf(k) >= 0 ? ' <span class="n">' + n[k] + "</span>" : "") + "</button>").join("") + "</div>" +
    '<div class="rtr-oc" role="tabpanel">' + RENDUS[o]() + "</div>";
  const on = z.querySelector(".rtr-ong .on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "nearest" });
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

// ───── Page ─────
// arg : null (accueil et liste) ou « s/<schemaId>/<onglet> » (fiche) ; sous 1 280 px la fiche prend toute la page
export async function pageRadiotherapie(arg) {
  ARG = arg || null;
  const m = /^s\/([^/]+)(?:\/([a-z]+))?/.exec(arg || ""), id = m ? m[1] : null;
  if (!id) RF.ouvert = null;
  const deux = !!id && large(), seule = !!id && !deux, z = $("rtr");
  // deux colonnes déjà affichées : seule la fiche change (la liste garde sa position)
  if (!(deux && z && z.classList.contains("deux") && $("rtrListe"))) {
    $("page").innerHTML = '<div class="rtr' + (deux ? " deux" : "") + (seule ? " seule" : "") + '" id="rtr">' +
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
  if (id) await ouvrirFiche(decodeURIComponent(id), m[2]);
  else if (RF.y) { window.scrollTo(0, RF.y); RF.y = 0; }
}
