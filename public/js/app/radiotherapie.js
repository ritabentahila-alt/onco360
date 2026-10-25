// Onco360 – Référentiel de radiothérapie (phase RTR, spécification docs/radiotherapie/SPEC.md, « Écrans et affichage »).
// Menu « Radiothérapie » (module rt, fonction rt.referentiel, droit referentielRT voir | modifier : RT1). Référence = public/donnees-rt
// (index.json, un fichier par localisation ; jamais modifiés par l'application) ; changements du cabinet = espaces/{e}/referentielRT/{id}
// (écrits en RT5) ; calculs dans moteur/rtref.js. Le module n'écrit rien dans les dossiers patients.
// RT3 (25/10/2026) : page Référentiel. Recherche du module (fixée en haut ; ↑ ↓ Entrée Échap), menus Région › Localisation › Situation ›
// Fractionnement (nombre de schémas entre parenthèses ; Situation = contextes tant qu'aucune localisation n'est choisie), liste (2 lignes par
// schéma, intertitre par localisation, termes surlignés, étoile), accueil sans recherche (Favoris, Consultés récemment, Sommaire), états
// (chargement, aucun résultat, erreur). Recherche et menus restent en mémoire pendant la session (comme les filtres de Protocoles).
// Réglages personnels : utilisateurs/{uid}.rtFavoris (identifiants), .rtRecents (8 derniers ouverts). Fiche : en-tête seulement (RT4 la complète) ;
// à partir de 1 280 px, à droite de la liste ; en dessous, page entière avec Retour.
import { collection, doc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { fusionner, trier, chercher, motBloquant, termes, sansAcc, resumePrescription, libPreuve, TYPES, FRACTIONNEMENTS, CONTEXTES } from "../moteur/rtref.js";

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

// ───── Fiche (en-tête ; onglets : RT4) ─────
window.rtrOuvrir = (id) => { RF.y = window.scrollY; location.hash = "radiotherapie/s/" + encodeURIComponent(id) + "/prescription"; };
window.rtrRetour = () => { location.hash = "radiotherapie"; };
let FICHE = null;
async function ouvrirFiche(id) {
  const e = LISTE.find((x) => x.id === id), z = $("rtrFiche"); if (!z) return;
  RF.ouvert = id; FICHE = null;
  if (!e) { z.innerHTML = '<div class="vide-c">Ce schéma n\'existe pas ou plus.<br><button class="bt clair petit" onclick="rtrRetour()">' + A.ic("retour") + "Retour</button></div>"; return; }
  if (recents()[0] !== id) noterRecent(id);
  z.innerHTML = '<div class="rtr-ch">' + '<i></i>'.repeat(4) + "</div>";
  try {
    const L = await locFichier(e.localisation_id), c = CAB[id];
    FICHE = { e, schema: c && c.schema ? c.schema : L.schemas.find((s) => s.id === id) || {}, loc: L };
  } catch (er) { console.warn("fiche", er); z.innerHTML = erreurHtml(); return; }
  dessinerEnteteFiche();
}
function dessinerEnteteFiche() {
  const z = $("rtrFiche"); if (!z || !FICHE) return;
  const esc = A.esc, { e, schema } = FICHE, s = sit(e.situation_id) || {}, l = loc(e.localisation_id) || {}, r = INDEX.regions.find((x) => x.id === l.region_id) || {}, fav = favoris().indexOf(e.id) >= 0;
  const dv = String(schema.date_verif || "").split("-").reverse().join("/");
  z.innerHTML = '<div class="rtr-ft">' + (large() ? "" : '<button class="mini rtr-ret" onclick="rtrRetour()">' + A.ic("retour") + "Retour</button>") +
    '<div class="rtr-ar" role="navigation" aria-label="Fil d\'Ariane"><a href="#radiotherapie" onclick="rtrSommaire(\'' + r.id + "','');return true\">" + esc(r.nom || "") + '</a> › <a href="#radiotherapie" onclick="rtrSommaire(\'' + r.id + "','" + l.id + "');return true\">" + esc(l.nom || "") + "</a> › <span>" + esc(s.titre || "") + "</span></div>" +
    '<div class="rtr-t"><h2>' + esc(e.titre) + '</h2><button class="rtr-et' + (fav ? " on" : "") + '" title="' + (fav ? "Retirer des favoris" : "Ajouter aux favoris") + '" aria-pressed="' + fav + '" onclick="rtrEtoile(\'' + esc(e.id) + "')\">" + A.ic("etoile") + "</button></div>" +
    '<div class="rtr-res">' + esc(resumePrescription(schema)) + ' <span class="badge b-ch">' + A.ic("check") + 'Validé</span> <span class="badge b-gr">' + esc(libPreuve(schema.preuve || e.preuve)) + "</span>" + (dv ? ' <span class="mesures">Vérifié le ' + esc(dv) + "</span>" : "") + "</div>" +
    (e.modifie ? '<p class="mesures"><span class="badge b-or">Modifié pour le cabinet</span>' + (e.cab && e.cab.majParNom ? " · par " + esc(e.cab.majParNom) : "") + (e.refChangee ? " · La référence a changé depuis" : "") + "</p>" : "") +
    '</div><div class="vide-c">Les onglets de la fiche (prescription, centrage, contourage, contraintes, essais, points d\'attention) arrivent à l\'étape suivante.</div>';
}

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
  if (id) await ouvrirFiche(decodeURIComponent(id));
  else if (RF.y) { window.scrollTo(0, RF.y); RF.y = 0; }
}
