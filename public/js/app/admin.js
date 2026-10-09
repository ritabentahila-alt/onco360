// Onco360 – page Administration (phase F, étape 4, 09/10/2026). Compte d'administration séparé : il crée les cabinets des
// confrères, règle leur formule et leurs modules, les suspend ou les supprime, et modifie les formules elles-mêmes, sans jamais
// lire une donnée médicale : les règles ne lui ouvrent aucun cabinet, tout passe par les fonctions serveur (creerCabinet,
// listeCabinets, abonnementCabinet, formulesEnregistrer, infosCabinet, etatCabinet, supprimerCabinet, lienMotDePasse).
// Trois onglets (#cabinets, #nouveau, #formules) ; les réglages d'un cabinet s'ouvrent dans une fenêtre.
import { app, auth, db } from "../config.js";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { MENU, FONCTIONS, FONCTIONS_RELIEES, CARTES, SECTIONS, BIBLIOTHEQUES, FICHE, TYPES_CHAMP, reglageEffectif } from "../donnees/catalogue.js";
import { MODULES, ROLES_MAX, SPECIALITES, specialiteDe, FORMULES as FORMULES0, abonnementEffectif, BIBLIOTHEQUES_SPE, MODULE_FAMILLE } from "../donnees/modules.js";

const $ = (i) => document.getElementById(i);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dfr = (d) => (typeof d === "string" && d.length >= 10 ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "");
const sansAcc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const ONGLETS = [["cabinets", "Cabinets"], ["nouveau", "Nouveau cabinet"], ["specialites", "Par spécialité"]];
// CABINETS : liste (null = chargement) ; FS : packs (formules) enregistrés (sinon ceux de départ)
let CABINETS = null, FS = null, BIBS = null, // BIBS : bibliothèques de référence par spécialité (null = pas encore lues)
   MSG = "", RES = "", Q = "", STATUT = "", SPE = "", SPEF = "";
const FORMULES_ = () => FS || FORMULES0;
const ONG = () => { const h = location.hash.replace("#", ""); return h === "formules" || h === "modules" || h === "reference" ? "specialites" : ONGLETS.some((o) => o[0] === h) ? h : "cabinets"; };

async function serveur(nom, donnees) {
  const { getFunctions, httpsCallable } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js");
  try { return (await httpsCallable(getFunctions(app, "europe-west1"), nom, { timeout: 120000 })(donnees || {})).data; }
  catch (e) { throw new Error(String((e && e.message) || e).replace(/^(FirebaseError: )?/, "")); }
}

$("btSortie").onclick = async () => { await signOut(auth).catch(() => {}); location.replace("index.html"); };
onAuthStateChanged(auth, async (u) => {
  if (!u) { location.replace("index.html"); return; }
  $("qui").textContent = u.email;
  const ad = await getDoc(doc(db, "administrateurs", u.uid)).catch(() => null);
  if (!ad || !ad.exists()) { location.replace("v2.html"); return; }
  dessiner(); charger();
});
// Changer d'onglet efface le message affiché, sauf le retour automatique après une création (GARDER)
let GARDER = false;
window.addEventListener("hashchange", () => { if (!GARDER) RES = ""; GARDER = false; dessiner(); });
async function charger() {
  try {
    const o = await serveur("listeCabinets"); if (o.formules) { FS = o.formules; Object.values(FS).forEach((f) => { f.specialite = specialiteDe(f.specialite); }); } BIBS = o.bibliotheques || []; MSG = "";
    CABINETS = (o.cabinets || []).map((c) => Object.assign({}, c, { cree: typeof c.cree === "string" ? c.cree : "", suspenduLe: typeof c.suspenduLe === "string" ? c.suspenduLe : "", titulaire: c.titulaire || {} }));
  } catch (e) { CABINETS = []; MSG = '<p class="err">Liste des cabinets indisponible : ' + esc(e.message) + ' <button class="clair petit" onclick="location.reload()">Réessayer</button></p>'; }
  dessiner();
}
const cab = (id) => (CABINETS || []).find((c) => c.id === id);
const formuleDe = (ab) => (ab && FORMULES_()[ab.formule]) || null;
const nomFormule = (ab) => (!ab ? "Tout compris (sans formule)" : ((formuleDe(ab) || {}).lib || ab.formule) + (ab.surMesure || (ab.reglage && ab.retouche === undefined && Object.keys(ab.reglage).length) ? " · sur mesure" : ""));
const ROLES_LIB = { medecin: "Médecin", assistante: "Secrétaire", infirmiere: "Infirmière", comptable: "Comptable" };
const ch = (id, lib, ph, type, v) => '<div><label for="' + id + '">' + esc(lib) + '</label><input id="' + id + '"' + (type ? ' type="' + type + '"' : "") + (ph ? ' placeholder="' + esc(ph) + '"' : "") + ' value="' + esc(v || "") + '" autocomplete="off"></div>';
// Menu des formules, rangées par spécialité
const optionsFormules = (choisie, spe) => SPECIALITES.concat(Object.values(FORMULES_()).map((f) => f.specialite || "Autres").filter((s, i, a) => SPECIALITES.indexOf(s) < 0 && a.indexOf(s) === i)).filter((s) => !spe || s === spe).map((s) => {
  const l = Object.entries(FORMULES_()).filter(([, f]) => (f.specialite || "Autres") === s);
  return l.length ? '<optgroup label="' + esc(s) + '">' + l.map(([k, f]) => '<option value="' + esc(k) + '"' + (k === choisie ? " selected" : "") + ">" + esc(f.lib) + "</option>").join("") + "</optgroup>" : "";
}).join("");

// ───── Page ─────
function dessiner() {
  const o = ONG();
  $("onglets").innerHTML = ONGLETS.map(([k, lib]) => '<a href="#' + k + '" class="' + (k === o ? "on" : "") + '">' + esc(lib) + (k === "cabinets" && CABINETS ? ' <span class="nb">' + CABINETS.length + "</span>" : "") + "</a>").join("");
  const bandeau = RES ? '<div class="ok bandeau">' + RES + '<button class="x" id="resX" aria-label="Fermer">✕</button></div>' : "";
  $("page").innerHTML = bandeau + (o === "nouveau" ? htmlNouveau() : o === "specialites" ? htmlSpecialites() : htmlCabinets());
  if ($("resX")) $("resX").onclick = () => { RES = ""; dessiner(); };
  if (o === "nouveau") brancherNouveau(); else if (o === "specialites") brancherSpecialites(); else brancherCabinets();
}

// ───── Onglet Cabinets : chiffres, recherche, filtres, cartes ─────
function htmlCabinets() {
  if (CABINETS === null) return '<section class="carte"><p class="sous">Chargement des cabinets…</p></section>';
  const L = CABINETS, act = L.filter((c) => c.actif).length, dos = L.reduce((n, c) => n + (c.patients || 0), 0);
  const tuile = (n, lib, cls) => '<div class="tuile' + (cls ? " " + cls : "") + '"><b>' + n + "</b><span>" + esc(lib) + "</span></div>";
  const spes = [...new Set(L.map((c) => (formuleDe(c.abonnement) || {}).specialite).filter(Boolean))];
  const m = sansAcc(Q).split(/\s+/).filter(Boolean);
  const V = L.filter((c) => (!STATUT || (STATUT === "actif") === c.actif) && (!SPE || (formuleDe(c.abonnement) || {}).specialite === SPE) &&
    m.every((w) => sansAcc([c.nom, c.ville, c.id, c.titulaire.nom, c.titulaire.email, nomFormule(c.abonnement)].join(" ")).indexOf(w) >= 0))
    .sort((a, b) => String(b.cree).localeCompare(String(a.cree)) || String(a.nom).localeCompare(String(b.nom)));
  return '<div class="tuiles">' + tuile(L.length, "Cabinets") + tuile(act, "Actifs", "vert") + tuile(L.length - act, "Suspendus", L.length - act ? "rouge" : "") + tuile(dos, "Dossiers patients au total") + "</div>" + MSG +
    '<section class="carte"><div class="barre"><div class="recherche"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input id="cQ" type="search" placeholder="Rechercher un cabinet, une ville, un médecin, un e-mail…" value="' + esc(Q) + '"></div>' +
    '<select id="cSt"><option value="">Tous les statuts</option><option value="actif"' + (STATUT === "actif" ? " selected" : "") + '>Actifs</option><option value="susp"' + (STATUT === "susp" ? " selected" : "") + ">Suspendus</option></select>" +
    (spes.length ? '<select id="cSp"><option value="">Toutes les spécialités</option>' + spes.map((s) => '<option' + (s === SPE ? " selected" : "") + ">" + esc(s) + "</option>").join("") + "</select>" : "") +
    '<a class="bt" href="#nouveau">+ Nouveau cabinet</a></div>' +
    '<p class="sous" style="margin:10px 0 0">' + V.length + " cabinet" + (V.length > 1 ? "s" : "") + (V.length !== L.length ? " sur " + L.length : "") + " · aucune donnée médicale, seulement des nombres.</p></section>" +
    (L.some((c) => c.demo) ? "" : '<section class="carte demo-c"><h2>Cabinet de démonstration</h2><p class="sous">Un cabinet rempli de 8 patients fictifs (PATIENT TEST 1 à 8 : chimiothérapies, radiothérapies, rendez-vous, consultations), pour les démonstrations, les guides et les captures d\'écran. Aucune donnée réelle.</p><button id="dCree">Créer le cabinet de démonstration</button></section>') +
    (V.length ? '<section class="carte liste-c"><div class="tableau"><table class="lc"><thead><tr><th>Cabinet</th><th>Médecin</th><th>Spécialité</th><th>Pack</th><th>Statut</th><th class="n">Équipe</th><th class="n">Dossiers</th><th>Créé le</th></tr></thead><tbody>' + V.map(ligneCabinet).join("") + "</tbody></table></div></section>" : '<section class="carte"><p class="sous">Aucun cabinet ne correspond.</p></section>');
}
// Liste des cabinets (10/10/2026) : une ligne par cabinet ; un clic ouvre sa fiche (fenêtre : informations, équipe, actions)
function ligneCabinet(c) {
  const F = formuleDe(c.abonnement), statut = c.actif ? '<span class="bdg ok">Actif</span>' : '<span class="bdg al">Suspendu</span>';
  return '<tr class="lc-l' + (c.actif ? "" : " susp") + '" data-fiche="' + esc(c.id) + '" tabindex="0"><td data-l="Cabinet"><b>' + esc(c.nom) + "</b>" + (c.demo ? ' <span class="bdg demo">Démonstration</span>' : "") + '<div class="m">' + esc(c.ville || "") + "</div></td>" +
    '<td data-l="Médecin">' + esc(c.titulaire.nom || "—") + '<div class="m">' + esc(c.titulaire.email || "") + "</div></td>" +
    '<td data-l="Spécialité">' + esc(F ? specialiteDe(F.specialite) : "—") + '</td><td data-l="Pack">' + esc(nomFormule(c.abonnement)) + '</td><td data-l="Statut">' + statut + "</td>" +
    '<td data-l="Équipe" class="n">' + (c.equipe ? c.equipe.filter((m) => m.actif).length : c.membres == null ? "?" : c.membres) + '</td><td data-l="Dossiers" class="n">' + (c.patients == null ? "?" : c.patients) + '</td><td data-l="Créé le">' + esc(dfr(c.cree) || "—") + "</td></tr>";
}
function ouvrirFiche(c) {
  if (!c) return;
  fenetre(carteCabinet(c).replace('<article class="cab', '<article class="cab fiche'));
  brancherActions($("modal"));
}
function carteCabinet(c) {
  const ab = c.abonnement, F = formuleDe(ab), r = c.roles || {}, mx = abonnementEffectif(ab).max;
  const chiffre = (n, max, lib) => '<div><b>' + (n == null ? "?" : n) + (max != null ? '<small> / ' + max + "</small>" : "") + "</b><span>" + esc(lib) + "</span></div>";
  return '<article class="cab' + (c.actif ? "" : " susp") + '" data-cab="' + esc(c.id) + '"><div class="haut"><div><h3>' + esc(c.nom) + '</h3><div class="m">' + esc([c.ville, c.id].filter(Boolean).join(" · ")) + "</div></div>" +
    (c.demo ? '<span class="bdg demo">Démonstration</span> ' : "") + (c.actif ? '<span class="bdg ok">Actif</span>' : '<span class="bdg al">Suspendu' + (c.suspenduLe ? " le " + esc(dfr(c.suspenduLe.slice(0, 10))) : "") + "</span>") + "</div>" +
    '<div class="medecin"><b>' + esc(c.titulaire.nom || "—") + '</b><span class="m">' + esc([c.titulaire.email, c.titulaire.telephone].filter(Boolean).join(" · ")) + "</span></div>" +
    '<div class="formule"><span class="bdg">' + esc(nomFormule(ab)) + "</span>" + (F && F.specialite ? '<span class="m">' + esc(F.specialite) + "</span>" : "") + "</div>" +
    '<div class="chiffres">' + chiffre(r.medecin || 0, mx.medecin, "Médecins") + chiffre(r.assistante || 0, mx.assistante, "Secrétaires") + chiffre(r.infirmiere || 0, mx.infirmiere, "Infirmières") + (r.comptable || mx.comptable != null ? chiffre(r.comptable || 0, mx.comptable, "Comptables") : "") + chiffre(c.etablissements, mx.etablissements, "Lieux") + chiffre(c.patients, mx.patients, "Dossiers") + "</div>" +
    (c.equipe && c.equipe.length ? '<details class="equipe"><summary>Équipe (' + c.equipe.length + ")</summary>" + c.equipe.slice().sort((a, b) => (b.titulaire ? 1 : 0) - (a.titulaire ? 1 : 0) || String(a.role).localeCompare(String(b.role))).map((m) => '<div class="mb' + (m.actif ? "" : " off") + '"><b>' + esc(m.nom || "—") + '</b> <span class="bdg">' + esc(ROLES_LIB[m.role] || m.role) + (m.titulaire ? " titulaire" : "") + "</span>" + (m.actif ? "" : ' <span class="bdg al">désactivé</span>') + '<div class="m">' + esc(m.email) + "</div></div>").join("") + "</details>" : "") +
    '<div class="m">Créé le ' + esc(dfr(c.cree) || "—") + "</div>" +
    '<div class="act">' + (c.demo ? '<button class="clair petit" data-reinit="' + esc(c.id) + '">Réinitialiser la démo</button>' : "") + '<button class="clair petit" data-info="' + esc(c.id) + '">Modifier</button><button class="clair petit" data-form="' + esc(c.id) + '">Réglage du cabinet</button>' +
    (c.modele ? "" : (c.titulaire.email ? '<button class="clair petit" data-lien="' + esc(c.id) + '">Lien du mot de passe</button><button class="clair petit" data-mail="' + esc(c.titulaire.email) + '">Renvoyer l\'e-mail</button>' : "") +
      (c.actif ? '<button class="clair petit" data-susp="' + esc(c.id) + '">Suspendre</button>' : '<button class="clair petit" data-react="' + esc(c.id) + '">Réactiver</button><button class="rouge petit" data-suppr="' + esc(c.id) + '">Supprimer</button>')) +
    "</div></article>";
}
function brancherCabinets() {
  document.querySelectorAll("[data-fiche]").forEach((tr) => { const o = () => ouvrirFiche(cab(tr.dataset.fiche)); tr.onclick = o; tr.onkeydown = (e) => { if (e.key === "Enter") o(); }; });
  if ($("dCree")) $("dCree").onclick = creerDemo;
  const q = $("cQ"); if (q) q.oninput = () => { Q = q.value; const pos = q.selectionStart; dessiner(); const q2 = $("cQ"); q2.focus(); q2.setSelectionRange(pos, pos); };
  if ($("cSt")) $("cSt").onchange = (e) => { STATUT = e.target.value; dessiner(); };
  if ($("cSp")) $("cSp").onchange = (e) => { SPE = e.target.value; dessiner(); };
}
// Boutons d'action d'un cabinet (dans sa fiche)
function brancherActions(R) {
  const on = (sel, f) => R.querySelectorAll(sel).forEach((b) => { b.onclick = () => f(b); });
  on("[data-info]", (b) => ouvrirInfos(cab(b.dataset.info)));
  on("[data-form]", (b) => ouvrirFormule(cab(b.dataset.form)));
  on("[data-lien]", (b) => lien(b, cab(b.dataset.lien)));
  on("[data-mail]", (b) => renvoyer(b, b.dataset.mail));
  on("[data-susp]", (b) => etat(b, cab(b.dataset.susp), false));
  on("[data-react]", (b) => etat(b, cab(b.dataset.react), true));
  on("[data-suppr]", (b) => supprimer(b, cab(b.dataset.suppr)));
  on("[data-reinit]", (b) => reinitDemo(b));
}
// ───── Cabinet de démonstration (étape 9 S3, 09/10/2026) ─────
async function creerDemo() {
  const email = prompt("Adresse e-mail du compte de démonstration (identifiant de connexion ; une adresse à vous, par exemple avec « +demo ») :", "ritabentahila+demo@gmail.com");
  if (!email || !email.trim()) return;
  const b = $("dCree"); b.disabled = true; b.textContent = "Création du cabinet et des 8 patients fictifs…";
  try {
    const o = await serveur("creerCabinetDemo", { email: email.trim().toLowerCase() });
    RES = "Cabinet de démonstration créé : " + o.patients + " patients fictifs, " + o.protocoles + " fichiers de protocoles. Pour vous y connecter, utilisez « Lien du mot de passe » sur sa carte (compte " + esc(email.trim()) + ").";
    CABINETS = null; dessiner(); charger();
  } catch (e) { b.disabled = false; b.textContent = "Créer le cabinet de démonstration"; alert("Création impossible : " + e.message); }
}
async function reinitDemo(b) {
  if (!confirm("Réinitialiser le cabinet de démonstration ?\n\nLes patients, consultations, tâches et rendez-vous de la démo sont effacés puis recréés (8 patients fictifs, dates d'aujourd'hui). Aucun autre cabinet n'est touché.")) return;
  b.disabled = true; b.textContent = "Réinitialisation…";
  try { const o = await serveur("demoReinitialiser"); fermer(); RES = "Démonstration réinitialisée : " + o.patients + " patients fictifs au " + esc(dfr(o.jour)) + "."; CABINETS = null; dessiner(); charger(); }
  catch (e) { b.disabled = false; b.textContent = "Réinitialiser la démo"; alert("Impossible : " + e.message); }
}
// ───── Onglet Bibliothèques (10/10/2026) : une bibliothèque de référence par spécialité ─────
// Ce que reçoit un cabinet neuf, selon la spécialité de sa formule. Chacune est un espace sans patient, ouvert dans Onco360
// (v2.html?espace=bib-…) pour tout ajouter, modifier, supprimer avec les écrans habituels ; aucun cabinet n'y est relié.
const LIBS = [["protocoles", "Protocoles de chimiothérapie"], ["medicaments", "Médicaments"], ["ordostypes", "Ordonnances types"], ["analyses", "Analyses"], ["bilans", "Bilans biologiques"], ["examens", "Examens complémentaires"], ["courriers", "Courriers"], ["documentation", "Documentation (Doc.)"]];
function carteBib(B) {
  return ('<article class="cab"><div class="haut"><div><h3>' + esc(B.lib) + '</h3><div class="m">' + esc(B.specialites[0]) + "</div></div>" + (B.existe ? '<span class="bdg ok">En place</span>' : '<span class="bdg">À créer</span>') + "</div>" +
      (B.existe ? '<div class="chiffres" style="grid-template-columns:repeat(4,minmax(0,1fr))">' + LIBS.map(([k, lib]) => "<div><b>" + (B.nb && B.nb[k] != null ? B.nb[k] : "départ") + "</b><span>" + esc(lib) + "</span></div>").join("") + "</div>" : '<p class="m">' + (B.id === "bib-oncologie" ? "Sera créée à partir de la copie mise de côté le 09/10 (bibliothèque du Dr Bentahila)." : "Sera créée vide : vous la remplirez (les modules de cette spécialité restent à construire).") + "</p>") +
      '<div class="act"><button data-bib="' + esc(B.id) + '">' + (B.existe ? "Ouvrir et modifier" : "Créer et ouvrir") + "</button></div></article>");
}
function brancherReference() {
  document.querySelectorAll("[data-bib]").forEach((b) => { b.onclick = async () => {
    b.disabled = true; b.textContent = "Ouverture…";
    try { const o = await serveur("bibliothequeOuvrir", { bib: b.dataset.bib }); location.href = "v2.html?espace=" + encodeURIComponent(o.espace) + "#protocoles"; }
    catch (e) { b.disabled = false; b.textContent = "Ouvrir et modifier"; alert("Impossible : " + e.message); }
  }; });
}

// ───── Fenêtre (réglages d'un cabinet, lien du mot de passe) ─────
function fenetre(html) {
  $("modal").innerHTML = '<div class="boite" role="dialog" aria-modal="true"><button class="x" id="mX" aria-label="Fermer">✕</button>' + html + "</div>";
  $("modal").classList.remove("cache"); document.body.classList.add("bloque");
  $("mX").onclick = fermer; $("modal").onclick = (e) => { if (e.target === $("modal")) fermer(); };
}
function fermer() { $("modal").classList.add("cache"); $("modal").innerHTML = ""; document.body.classList.remove("bloque"); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("modal").classList.contains("cache")) fermer(); });

// ───── Onglet Nouveau cabinet ─────
function htmlNouveau() {
  return '<section class="carte"><h2>Nouveau cabinet</h2><p class="sous">Pour un confrère qui utilisera Onco360 avec ses propres patients. Il reçoit un e-mail pour choisir son mot de passe (souvent classé en indésirables : vous pouvez aussi lui envoyer le lien vous-même, bouton « Lien du mot de passe » de sa carte), puis il est guidé à sa première connexion.</p>' +
    '<h3 class="st">Le cabinet</h3><div class="form">' + ch("aCab", "Nom du cabinet ou de la clinique", "ex. Cabinet d'oncologie Agdal") + ch("aVil", "Ville", "ex. Rabat") + "</div>" +
    '<h3 class="st">Le médecin titulaire</h3><div class="form">' + ch("aPre", "Prénom") + ch("aNom", "Nom") + ch("aMail", "E-mail (identifiant de connexion)", "", "email") + ch("aTel", "Téléphone (WhatsApp)", "06…", "tel") + "</div>" +
    '<h3 class="st">La formule</h3><div class="form"><div><label for="aSpe">Spécialité</label><select id="aSpe"><option value="">Toutes</option>' + SPECIALITES.map((s) => "<option" + (s === SPEF ? " selected" : "") + ">" + esc(s) + "</option>").join("") + '</select></div><div><label for="aFor">Formule</label><select id="aFor">' + optionsFormules("onco-pro", SPEF) + "</select></div></div>" +
    '<div id="aApercu"></div>' +
    '<p class="recu"><b>Le cabinet reçoit</b> une copie de la bibliothèque de protocoles, des bibliothèques de prescription (médicaments, ordonnances types, analyses et bilans, examens, courriers), des jours fériés, des listes de diagnostics et de mutuelles, et des tarifs de radiothérapie. <b>Il ne reçoit pas</b> vos patients, vos correspondants, vos établissements, vos autres tarifs, votre profil ni votre bilan.</p>' +
    '<div style="margin-top:14px"><button id="aOk">Créer le cabinet</button></div><div id="aRes"></div></section>';
}
const resumeFormule = (k) => { const F = FORMULES_()[k]; if (!F) return ""; return '<p class="m apercu">' + esc(MODULES.filter((m) => F.modules.indexOf(m[0]) >= 0).map((m) => m[1]).join(" · ")) + "<br>" + esc(ROLES_MAX.map(([r, lib]) => lib + " : " + (F.max[r] == null ? "sans limite" : F.max[r])).join(" · ")) + "</p>"; };
function brancherNouveau() {
  const ap = () => { $("aApercu").innerHTML = resumeFormule($("aFor").value); };
  $("aSpe").onchange = () => { SPEF = $("aSpe").value; const v = $("aFor").value; $("aFor").innerHTML = optionsFormules(v, SPEF); ap(); };
  $("aFor").onchange = ap; ap();
  $("aOk").onclick = creer;
}
async function creer() {
  const v = (i) => $(i).value.trim(), d = { cabinet: v("aCab"), prenom: v("aPre"), nom: v("aNom"), email: v("aMail").toLowerCase(), telephone: v("aTel"), formule: $("aFor").value }, ville = v("aVil"), res = $("aRes");
  res.innerHTML = "";
  if (!d.cabinet || !d.nom || !d.email) { res.innerHTML = '<p class="err">Indiquez au moins le nom du cabinet, le nom du médecin et son e-mail.</p>'; return; }
  if (!confirm("Créer le cabinet « " + d.cabinet + " » pour " + [d.prenom, d.nom].join(" ") + " (" + d.email + ") ?")) return;
  const b = $("aOk"); b.disabled = true; b.textContent = "Création…";
  try {
    const o = await serveur("creerCabinet", d);
    if (ville) await serveur("infosCabinet", { espace: o.espace, nom: d.cabinet, ville }).catch(() => {});
    let mail = "";
    if (!o.existant) { try { await sendPasswordResetEmail(auth, d.email); mail = "Un e-mail a été envoyé à " + d.email + " pour choisir le mot de passe (vérifier aussi les indésirables)."; } catch (e) { mail = "L'e-mail du mot de passe n'a pas pu partir (" + e.message + ") : utilisez « Lien du mot de passe » sur sa carte."; } }
    else mail = "Ce compte existait déjà : la personne garde son mot de passe.";
    RES = "Cabinet « " + esc(d.cabinet) + " » créé (" + o.protocoles + " fichiers de protocoles copiés). " + esc(mail) + " Adresse à lui donner : <b>" + esc(location.origin) + "</b>";
    CABINETS = null; GARDER = true; location.hash = "cabinets"; dessiner(); charger();
  } catch (e) { b.disabled = false; b.textContent = "Créer le cabinet"; res.innerHTML = '<p class="err">' + esc(e.message) + "</p>"; }
}

// ───── Modifier un cabinet (nom, coordonnées, titulaire) ─────
function ouvrirInfos(c) {
  if (!c) return;
  fenetre("<h2>Modifier « " + esc(c.nom) + " »</h2>" +
    '<div class="form">' + ch("iNom", "Nom du cabinet", "", "", c.nom) + ch("iVil", "Ville", "", "", c.ville) + ch("iAdr", "Adresse", "", "", c.adresse) + ch("iTel", "Téléphone du cabinet", "", "tel", c.telephone) +
    ch("iTit", "Médecin titulaire (nom affiché)", "", "", c.titulaire.nom) + ch("iTtel", "Téléphone du médecin (WhatsApp)", "", "tel", c.titulaire.telephone) + "</div>" +
    '<p class="m" style="margin-top:8px">L\'e-mail de connexion (' + esc(c.titulaire.email || "—") + ") ne se change pas ici.</p>" +
    '<div class="pied"><button id="iOk">Enregistrer</button><button class="clair" id="iAnn">Fermer</button></div>');
  $("iAnn").onclick = fermer;
  $("iOk").onclick = async () => {
    const v = (i) => $(i).value.trim(), d = { espace: c.id, nom: v("iNom"), ville: v("iVil"), adresse: v("iAdr"), telephone: v("iTel"), titulaireNom: v("iTit"), titulaireTel: v("iTtel") }, ok = $("iOk");
    if (d.nom.length < 2) { alert("Indiquez le nom du cabinet."); return; }
    ok.disabled = true; ok.textContent = "Enregistrement…";
    try {
      await serveur("infosCabinet", d);
      Object.assign(c, { nom: d.nom, ville: d.ville, adresse: d.adresse, telephone: d.telephone }); if (d.titulaireNom) Object.assign(c.titulaire, { nom: d.titulaireNom, telephone: d.titulaireTel });
      fermer(); RES = "Cabinet « " + esc(d.nom) + " » enregistré."; dessiner();
    } catch (e) { ok.disabled = false; ok.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}

// ───── Écran de réglage (10/10/2026) : le même pour un pack et pour un cabinet ─────
// Menu (ordre), modules et leurs fonctions, cartes du tableau de bord (ordre, présence), onglets des Paramètres (ordre, présence),
// bibliothèques, maximums. o = { titre, intro, A { formule, modules, max }, R (réglage complet), spe(), avecPack, nom (pack),
// compte(k), enregistrer(A, R, nom) }.
function editeurReglage(o) {
  const A = o.A, R = o.R, LIB_MENU = Object.fromEntries(MENU.map((m) => [m[0], m])), LIB_CARTE = Object.fromEntries(CARTES), LIB_SEC = Object.fromEntries(SECTIONS.map((x) => [x[0], x[1]]));
  let nom = o.nom || "", ED_CH = null; // ED_CH : champ ajouté en cours de modification (id) ou "nouveau"
  // Fiche patient : champs existants et ajoutés (ordre, présence) ; formulaire d'un champ ajouté
  const htmlFiche = () => {
    const FI = R.fiche, LIB = Object.fromEntries(FICHE.map((c) => [c[0], c])), AJ = Object.fromEntries(FI.ajouts.map((a) => [a.id, a]));
    const ligne = (k, i) => { const c = LIB[k], a = AJ[k]; if (!c && !a) return "";
      return '<div class="rg-l">' + fleches("fiche", i) + '<span class="rg-t">' + esc(c ? c[1] : a.lib) + ' <span class="m">' + (c ? (c[2] === "clinique" ? "fiche clinique" : "identité") : "ajouté · " + ((TYPES_CHAMP.find((t) => t[0] === a.type) || [])[1] || a.type).toLowerCase() + (a.imprimer ? " · imprimé" : "") + (a.entete ? " · en-tête" : "")) + "</span></span>" +
        (a ? '<button class="clair petit" data-chm="' + k + '" aria-label="Modifier le champ">✎</button><button class="clair petit" data-chs="' + k + '" aria-label="Supprimer le champ">✕</button>' : "") +
        (c && c[3] ? '<span class="m">toujours</span>' : caseC('data-rch="' + k + '"', FI.champs[k] !== false, "")) + "</div>"; };
    const a = ED_CH && ED_CH !== "nouveau" ? AJ[ED_CH] || {} : { type: "texte", partie: "identite" };
    const form = ED_CH ? '<div class="ch-f"><div class="form"><div><label for="chLib">Nom du champ</label><input id="chLib" value="' + esc(a.lib || "") + '" placeholder="ex. Groupe sanguin"></div>' +
      '<div><label for="chType">Type</label><select id="chType">' + TYPES_CHAMP.map(([k, l]) => '<option value="' + k + '"' + (a.type === k ? " selected" : "") + ">" + esc(l) + "</option>").join("") + "</select></div>" +
      '<div><label for="chPartie">Partie de la fiche</label><select id="chPartie"><option value="identite"' + (a.partie !== "clinique" ? " selected" : "") + '>Identité</option><option value="clinique"' + (a.partie === "clinique" ? " selected" : "") + ">Fiche clinique</option></select></div>" +
      '<div class="large" id="chChoixZ"' + (a.type === "choix" ? "" : ' style="display:none"') + '><label for="chChoix">Choix possibles (un par ligne)</label><textarea id="chChoix" rows="3">' + esc((a.choix || []).join("\n")) + "</textarea></div></div>" +
      '<div class="barre" style="margin-top:6px">' + caseC('id="chImp"', !!a.imprimer, "À imprimer (fiche chimio, courriers)") + caseC('id="chEnt"', !!a.entete, "En tête du dossier") + '<button class="petit" id="chOk">' + (ED_CH === "nouveau" ? "Ajouter le champ" : "Enregistrer le champ") + '</button><button class="clair petit" id="chAnn">Annuler</button></div></div>' : "";
    return '<h3 class="st">Fiche patient <span class="m">(ordre ↑ ↓, présence ; un champ retiré est caché, sa valeur gardée)</span></h3><div class="rg-b fiche-b">' + FI.ordre.map(ligne).join("") + "</div>" +
      (ED_CH ? form : '<div style="margin-top:8px"><button class="clair petit" id="chNouv">+ Ajouter un champ</button></div>');
  };
  const fleches = (l, i) => '<span class="fl"><button class="clair petit" data-haut="' + l + ":" + i + '"' + (i ? "" : " disabled") + ' aria-label="Monter">↑</button><button class="clair petit" data-bas="' + l + ":" + i + '" aria-label="Descendre">↓</button></span>';
  const caseC = (attr, on, txt) => '<label class="rg-c"><input type="checkbox" ' + attr + (on ? " checked" : "") + "><span>" + txt + "</span></label>";
  const corps = () => {
    const mods = MODULES.filter(([k]) => modulePour(k, o.spe()));
    return (o.avecPack ? '<div class="form" style="grid-template-columns:minmax(0,340px) auto;align-items:end"><div><label for="fFor">Pack de départ</label><select id="fFor">' + optionsFormules(A.formule) + '</select></div><div><button class="clair petit" id="fDepart" title="Réglage du pack (ordre, cartes, onglets, fonctions, bibliothèques) ; les modules et limites restent">Revenir au réglage du pack</button></div></div>'
      : '<div class="form" style="grid-template-columns:minmax(0,340px)"><div><label for="fNom">Nom du pack</label><input id="fNom" value="' + esc(nom) + '"></div></div>') +
      '<div class="rg"><div class="rg-b"><h3 class="st">Menu (ordre)</h3>' + R.menu.map((k, i) => { const m = LIB_MENU[k]; if (!m) return ""; return '<div class="rg-l">' + fleches("menu", i) + '<span class="rg-t">' + esc(m[1]) + "</span>" + (m[2] ? caseC('data-rmod="' + m[2] + '"', A.modules[m[2]], "") : '<span class="m">toujours</span>') + "</div>"; }).join("") + "</div>" +
      '<div class="rg-b"><h3 class="st">Tableau de bord (cartes)</h3>' + R.accueil.map((k, i) => '<div class="rg-l">' + fleches("accueil", i) + '<span class="rg-t">' + esc(LIB_CARTE[k] || k) + "</span>" + caseC('data-rcarte="' + k + '"', R.cartes[k] !== false, "") + "</div>").join("") + "</div>" +
      '<div class="rg-b"><h3 class="st">Paramètres (onglets)</h3>' + R.ordreSections.map((k, i) => '<div class="rg-l">' + fleches("ordreSections", i) + '<span class="rg-t">' + esc(LIB_SEC[k] || k) + "</span>" + caseC('data-rsec="' + k + '"', R.sections[k] !== false, "") + "</div>").join("") + "</div>" +
      '<div class="rg-b"><h3 class="st">Bibliothèques</h3>' + BIBLIOTHEQUES.map(([k, lib]) => '<div class="rg-l"><span class="rg-t">' + esc(lib) + "</span>" + caseC('data-rbib="' + k + '"', R.bibliotheques[k] !== false, "") + "</div>").join("") + "</div></div>" +
      htmlFiche() +
      '<h3 class="st">Modules et fonctions</h3><div class="mods">' + mods.map(([k, lib, de]) => '<div class="mod-f' + (A.modules[k] ? "" : " off") + '">' + caseC('data-rmod="' + k + '"', A.modules[k], "<b>" + esc(lib) + '</b><br><span class="m">' + esc(de) + "</span>") +
        ((FONCTIONS[k] || []).length ? "<details><summary>Fonctions (" + FONCTIONS[k].filter(([f]) => R.fonctions[k + "." + f] !== false).length + " / " + FONCTIONS[k].length + ")</summary>" + FONCTIONS[k].map(([f, l, base]) => base ? '<div class="rg-c base"><span>✓</span><span>' + esc(l) + ' <span class="m">(fonction de base, toujours là)</span></span></div>' : caseC('data-rfn="' + k + "." + f + '"', R.fonctions[k + "." + f] !== false, esc(l) + (FONCTIONS_RELIEES.indexOf(k + "." + f) < 0 ? ' <span class="m">(bientôt)</span>' : ""))).join("") + "</details>" : "") + "</div>").join("") + "</div>" +
      '<h3 class="st">Nombre maximum <span class="m">(vide = sans limite, 0 = aucun)</span></h3><div class="form">' + ROLES_MAX.map(([k, lib]) => { const c = o.compte ? o.compte(k) : undefined; return '<div><label for="fMx' + k + '">' + esc(lib) + (c === undefined ? "" : ' <span class="m">(actuellement ' + (c == null ? "?" : c) + ")</span>") + '</label><input id="fMx' + k + '" type="number" min="0" data-x="' + k + '" placeholder="sans limite" value="' + (A.max[k] == null ? "" : A.max[k]) + '"></div>'; }).join("") + "</div>";
  };
  fenetre("<h2>" + esc(o.titre) + '</h2><p class="sous">' + o.intro + '</p><div id="fCorps">' + corps() + '</div><div class="pied"><button id="fOk">Enregistrer</button><button class="clair" id="fAnn">Fermer</button></div>');
  const lire = () => { document.querySelectorAll("#fCorps [data-x]").forEach((x) => { A.max[x.dataset.x] = x.value === "" ? null : Number(x.value); }); if ($("fNom")) nom = $("fNom").value.trim(); };
  const refaire = (sansLire) => { if (!sansLire) lire(); const ouverts = [...document.querySelectorAll("#fCorps details")].map((d) => d.open); $("fCorps").innerHTML = corps(); document.querySelectorAll("#fCorps details").forEach((d, i) => { d.open = !!ouverts[i]; }); brancher(); };
  const bouger = (v, sens) => { const [l, i] = v.split(":"), k = Number(i), j = k + sens, L = l === "fiche" ? R.fiche.ordre : R[l]; if (j < 0 || j >= L.length) return; [L[k], L[j]] = [L[j], L[k]]; refaire(); };
  const brancher = () => {
    if ($("fFor")) $("fFor").onchange = () => { const F = FORMULES_()[$("fFor").value]; if (!F) return; A.formule = $("fFor").value; A.max = Object.assign({}, F.max); MODULES.forEach(([k]) => { A.modules[k] = F.modules.indexOf(k) >= 0; }); Object.assign(R, reglageEffectif(F.reglage)); refaire(true); }; // tout le pack (pas les limites affichées)
    if ($("fDepart")) $("fDepart").onclick = () => { Object.assign(R, reglageEffectif((FORMULES_()[A.formule] || {}).reglage)); refaire(); };
    document.querySelectorAll("#fCorps [data-haut]").forEach((b) => { b.onclick = () => bouger(b.dataset.haut, -1); });
    document.querySelectorAll("#fCorps [data-bas]").forEach((b) => { b.onclick = () => bouger(b.dataset.bas, 1); });
    document.querySelectorAll("#fCorps [data-rmod]").forEach((x) => { x.onchange = () => { const k = x.dataset.rmod; A.modules[k] = x.checked; if (k === "rcp" && x.checked) A.modules.taches = true; if (k === "taches" && !x.checked) A.modules.rcp = false; refaire(); }; });
    document.querySelectorAll("#fCorps [data-rcarte]").forEach((x) => { x.onchange = () => { R.cartes[x.dataset.rcarte] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rsec]").forEach((x) => { x.onchange = () => { R.sections[x.dataset.rsec] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rbib]").forEach((x) => { x.onchange = () => { R.bibliotheques[x.dataset.rbib] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rfn]").forEach((x) => { x.onchange = () => { R.fonctions[x.dataset.rfn] = x.checked; refaire(); }; });
    // Fiche patient
    document.querySelectorAll("#fCorps [data-rch]").forEach((x) => { x.onchange = () => { R.fiche.champs[x.dataset.rch] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-chm]").forEach((b) => { b.onclick = () => { ED_CH = b.dataset.chm; refaire(); }; });
    document.querySelectorAll("#fCorps [data-chs]").forEach((b) => { b.onclick = () => { const k = b.dataset.chs, a = R.fiche.ajouts.find((z) => z.id === k); if (!confirm("Retirer le champ « " + (a && a.lib) + " » de la fiche ?\n(Les valeurs déjà saisies restent dans les dossiers.)")) return; R.fiche.ajouts = R.fiche.ajouts.filter((z) => z.id !== k); R.fiche.ordre = R.fiche.ordre.filter((z) => z !== k); delete R.fiche.champs[k]; refaire(); }; });
    if ($("chNouv")) $("chNouv").onclick = () => { ED_CH = "nouveau"; refaire(); };
    if ($("chType")) $("chType").onchange = () => { $("chChoixZ").style.display = $("chType").value === "choix" ? "" : "none"; };
    if ($("chAnn")) $("chAnn").onclick = () => { ED_CH = null; refaire(); };
    if ($("chOk")) $("chOk").onclick = () => {
      const lib = $("chLib").value.trim(); if (!lib) { alert("Indiquez le nom du champ."); return; }
      const d = { lib: lib.slice(0, 60), type: $("chType").value, partie: $("chPartie").value, choix: $("chChoix").value.split("\n").map((c) => c.trim()).filter(Boolean).slice(0, 40), imprimer: $("chImp").checked, entete: $("chEnt").checked };
      if (d.type === "choix" && !d.choix.length) { alert("Indiquez au moins un choix (un par ligne)."); return; }
      if (ED_CH === "nouveau") { const id = "x" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); R.fiche.ajouts.push(Object.assign({ id }, d)); R.fiche.ordre.push(id); R.fiche.champs[id] = true; }
      else { const a = R.fiche.ajouts.find((z) => z.id === ED_CH); if (a) Object.assign(a, d); }
      ED_CH = null; refaire();
    };
  };
  brancher();
  $("fAnn").onclick = fermer;
  $("fOk").onclick = async () => {
    lire(); if (!o.avecPack && !nom) { alert("Indiquez le nom du pack."); return; }
    const b = $("fOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { await o.enregistrer(A, R, nom); } catch (e) { b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}
// Réglage d'un cabinet : pack de départ, puis retouches dans le cabinet
function ouvrirFormule(c) {
  if (!c) return;
  const A = JSON.parse(JSON.stringify(abonnementEffectif(c.abonnement))); A.formule = A.formule || "complet";
  editeurReglage({ titre: "Réglage de « " + c.nom + " »", avecPack: true, A, R: reglageEffectif(c.abonnement && c.abonnement.reglage), spe: () => (FORMULES_()[A.formule] || {}).specialite,
    intro: "Choisissez le pack (il apporte ses modules, ses limites et son réglage), puis retouchez à volonté pour ce cabinet : ordre (↑ ↓), présence (cases), fonctions de chaque module. Ce qui est retiré est caché, les données sont gardées. Le changement s'applique à la prochaine ouverture d'Onco360 par l'équipe.",
    compte: (k) => (k === "patients" ? c.patients : k === "etablissements" ? c.etablissements : (c.roles || {})[k] || 0),
    enregistrer: async (A2, R2) => {
      const F = FORMULES_()[A2.formule] || {}, identique = JSON.stringify(R2) === JSON.stringify(reglageEffectif(F.reglage));
      const o = await serveur("abonnementCabinet", { espace: c.id, formule: A2.formule, modules: A2.modules, max: A2.max, reglage: R2, identiqueAuPack: identique });
      c.abonnement = o.abonnement; fermer(); RES = "Réglage enregistré pour « " + esc(c.nom) + " » : " + esc(nomFormule(o.abonnement)) + ". Il s'applique à la prochaine ouverture d'Onco360 par l'équipe."; dessiner();
    } });
}
// ───── Mot de passe, suspension, suppression ─────
async function renvoyer(b, email) {
  b.disabled = true;
  try { await sendPasswordResetEmail(auth, email); b.textContent = "E-mail envoyé"; }
  catch (e) { b.disabled = false; alert("Envoi impossible : " + e.message); }
}
// Lien pour choisir le mot de passe, à envoyer soi-même (WhatsApp, SMS…) : valable environ 1 heure, un seul usage
async function lien(b, c) {
  if (!c) return;
  b.disabled = true; const t0 = b.textContent; b.textContent = "Lien…";
  try {
    const o = await serveur("lienMotDePasse", { email: c.titulaire.email });
    const txt = "Bonjour " + (c.titulaire.nom || "") + ",\nVotre cabinet Onco360 est prêt. Cliquez sur ce lien pour choisir votre mot de passe (valable 1 heure) :\n" + o.lien +
      "\n\nEnsuite, connectez-vous sur " + location.origin + " avec votre adresse " + c.titulaire.email + ".";
    const tel = String(c.titulaire.telephone || "").replace(/[^0-9]/g, "").replace(/^00/, "").replace(/^0(?=[5-7])/, "212");
    fenetre("<h2>Lien pour " + esc(c.titulaire.nom || c.titulaire.email) + '</h2><p class="sous">Valable 1 heure, un seul usage. Envoyez-le quand le médecin est disponible.</p>' +
      '<textarea id="lnTexte" rows="7" readonly>' + esc(txt) + "</textarea>" +
      '<div class="pied"><button id="lnCopier">Copier le message</button><a class="bt wa" target="_blank" rel="noopener" href="https://wa.me/' + tel + "?text=" + encodeURIComponent(txt) + '">Envoyer par WhatsApp</a></div>');
    $("lnCopier").onclick = async () => { const t = $("lnTexte"); try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand("copy"); } $("lnCopier").textContent = "Copié"; };
  } catch (e) { alert("Lien impossible : " + e.message); }
  b.disabled = false; b.textContent = t0;
}
// Suspendre (abonnement non payé : plus personne n'entre, rien n'est effacé) ou réactiver
async function etat(b, c, actif) {
  if (!c) return;
  if (!confirm(actif ? "Réactiver le cabinet « " + c.nom + " » ? Son équipe pourra de nouveau se connecter." : "Suspendre le cabinet « " + c.nom + " » ?\n\nPlus personne de ce cabinet ne pourra se connecter. Rien n'est effacé : vous pourrez le réactiver à tout moment.")) return;
  b.disabled = true;
  try { await serveur("etatCabinet", { espace: c.id, actif }); fermer(); c.actif = actif; c.suspenduLe = actif ? "" : new Date().toISOString(); RES = "Cabinet « " + esc(c.nom) + " » " + (actif ? "réactivé." : "suspendu."); dessiner(); }
  catch (e) { b.disabled = false; alert("Impossible : " + e.message); }
}
// Supprimer définitivement (cabinet suspendu seulement, nom retapé)
async function supprimer(b, c) {
  if (!c) return;
  const t = prompt("SUPPRESSION DÉFINITIVE du cabinet « " + c.nom + " » : ses " + (c.patients || 0) + " dossiers, ses fichiers et les comptes de ses " + (c.membres || 0) + " membres seront effacés.\n\nPour confirmer, tapez exactement le nom du cabinet :");
  if (t == null) return;
  if (t.trim() !== String(c.nom).trim()) { alert("Le nom ne correspond pas : rien n'a été supprimé."); return; }
  b.disabled = true; b.textContent = "Suppression…";
  try { const o = await serveur("supprimerCabinet", { espace: c.id, confirmation: t.trim() }); fermer(); CABINETS = CABINETS.filter((x) => x.id !== c.id); RES = "Cabinet « " + esc(c.nom) + " » supprimé (" + o.comptes + " compte(s) effacé(s))."; dessiner(); }
  catch (e) { b.disabled = false; b.textContent = "Supprimer"; alert("Suppression impossible : " + e.message); }
}

// ───── Onglet Modules et menus (10/10/2026) ─────
// Chaque module : à quelle(s) spécialité(s) il sert, ce qu'il ajoute au menu et au dossier, dans quelles formules et chez combien de
// cabinets. Le contenu d'un module (ses écrans) est le même pour tous : une modification s'applique à tous les cabinets qui l'ont.
const famille = (id) => (BIBLIOTHEQUES_SPE.find((b) => b.id === id) || {}).lib || id;
const bibDe = (spe) => (BIBLIOTHEQUES_SPE.find((b) => b.specialites.indexOf(spe) >= 0) || BIBLIOTHEQUES_SPE[0]).id;
const modulePour = (k, spe) => !MODULE_FAMILLE[k] || MODULE_FAMILLE[k] === bibDe(spe || SPECIALITES[0]);
// ───── Onglet Par spécialité (16.2, 10/10/2026) : packs, modules et menus, bibliothèques et paramètres ─────
let SPEC = null, SOUS = "packs";
const packsDe = (spe) => Object.entries(FORMULES_()).filter(([, f]) => specialiteDe(f.specialite) === spe);
const cabinetsDuPack = (k) => (CABINETS || []).filter((c) => c.abonnement && c.abonnement.formule === k).length;
function htmlSpecialites() {
  SPEC = SPEC || SPECIALITES[0];
  const gauche = '<div class="spe-l">' + SPECIALITES.map((s) => { const np = packsDe(s).length, nc = (CABINETS || []).filter((c) => specialiteDe((formuleDe(c.abonnement) || {}).specialite) === s && c.abonnement).length;
    return '<button class="spe' + (s === SPEC ? " on" : "") + '" data-spec="' + esc(s) + '"><b>' + esc(s) + '</b><span class="m">' + np + " pack" + (np > 1 ? "s" : "") + " · " + nc + " cabinet" + (nc > 1 ? "s" : "") + "</span></button>"; }).join("") +
    '<p class="m" style="margin:8px 4px">Nouvelle spécialité : étape 16.5.</p></div>';
  const sous = [["packs", "Packs"], ["biblio", "Bibliothèque et paramètres"]]; // « Modules et menus » retiré (10/10/2026 : déjà dans l'écran d'un pack)
  let droite = '<div class="puces">' + sous.map(([k, l]) => '<button class="puce' + (k === SOUS ? " on" : "") + '" data-sous="' + k + '">' + esc(l) + "</button>").join("") + "</div>";
  if (SOUS === "biblio") { const B = (BIBS || []).find((b) => b.specialites.indexOf(SPEC) >= 0) || BIBLIOTHEQUES_SPE.find((b) => b.specialites.indexOf(SPEC) >= 0); droite += '<section class="carte"><p class="sous">Ce que reçoit chaque nouveau cabinet de cette spécialité : bibliothèques (protocoles, médicaments, ordonnances types, analyses et bilans, examens, courriers, documentation) et paramètres de base (horaires, fériés, WhatsApp, couleurs, types, tâches automatiques, RCP, listes, impression, alertes, tarifs RT). Jamais : correspondants, prix des consultations, lieux, équipe, patients.</p></section>' + (B ? '<div class="cabs">' + carteBib(B) + "</div>" : ""); }
  else {
    const L = packsDe(SPEC);
    droite += '<section class="carte"><p class="sous">Les packs de départ de « ' + esc(SPEC) + ' ». Chacun a son réglage complet (modules et fonctions, menu, cartes du tableau de bord, onglets des Paramètres, bibliothèques, limites). Un cabinet reçoit le réglage de son pack, puis peut être retouché. Modifier un pack met à jour les cabinets qui le suivent sans retouche.</p>' +
      (L.length ? '<div class="tableau"><table class="lc"><thead><tr><th></th><th>Pack</th><th>Modules</th><th>Limites</th><th class="n">Cabinets</th><th></th></tr></thead><tbody>' + L.map(([k, f], i) => { const nm = (f.modules || []).length, mx = ROLES_MAX.filter(([r]) => f.max && f.max[r] != null).map(([r, lib]) => f.max[r] + " " + lib.toLowerCase()).join(", ") || "sans limite", nc = cabinetsDuPack(k);
        return '<tr><td><span class="fl"><button class="clair petit" data-ph="' + esc(k) + '"' + (i ? "" : " disabled") + ' aria-label="Monter">↑</button><button class="clair petit" data-pb="' + esc(k) + '"' + (i < L.length - 1 ? "" : " disabled") + ' aria-label="Descendre">↓</button></span></td><td data-l="Pack"><b>' + esc(f.lib) + '</b>' + (f.reglage ? ' <span class="bdg">réglage complet</span>' : "") + '</td><td data-l="Modules">' + nm + ' / ' + MODULES.filter(([m]) => modulePour(m, SPEC)).length + '</td><td data-l="Limites" class="m">' + esc(mx) + '</td><td data-l="Cabinets" class="n">' + nc + '</td><td class="act"><button class="clair petit" data-pm="' + esc(k) + '">Modifier</button><button class="clair petit" data-pd="' + esc(k) + '">Dupliquer</button>' + (nc ? "" : '<button class="rouge petit" data-ps="' + esc(k) + '">Supprimer</button>') + "</td></tr>"; }).join("") + "</tbody></table></div>" : '<p class="sous">Aucun pack pour l\'instant' + (/générale|Gynéco/.test(SPEC) ? " : les modules de cette spécialité sont à construire (étape 14)." : ".") + "</p>") +
      '<div class="barre" style="margin-top:12px"><button id="pNouv">+ Nouveau pack</button>' + (Object.keys(FORMULES0).some((k) => !FORMULES_()[k] && specialiteDe(FORMULES0[k].specialite) === SPEC) ? '<button class="clair" id="pProp">Ajouter les packs proposés par Onco360</button>' : "") + "</div></section>";
  }
  return '<div class="spe-g">' + gauche + '<div class="spe-d">' + droite + "</div></div>";
}
async function enregistrerPacks(L, message) {
  const o = await serveur("formulesEnregistrer", { formules: L }); FS = o.formules; Object.values(FS).forEach((f) => { f.specialite = specialiteDe(f.specialite); });
  RES = message + (o.cabinets ? " ; " + o.cabinets + " cabinet(s) mis à jour" : "") + "."; CABINETS = null; dessiner(); charger();
}
function ouvrirPack(k, modele) {
  const F0 = modele || FORMULES_()[k] || { lib: "", specialite: SPEC, modules: MODULES.filter(([m]) => modulePour(m, SPEC)).map((m) => m[0]), max: {} };
  const A = { formule: k, modules: Object.fromEntries(MODULES.map(([m]) => [m, (F0.modules || []).indexOf(m) >= 0])), max: Object.fromEntries(ROLES_MAX.map(([r]) => [r, F0.max && F0.max[r] != null ? F0.max[r] : null])) };
  editeurReglage({ titre: (FORMULES_()[k] ? "Pack « " + F0.lib + " »" : "Nouveau pack") + " · " + SPEC, avecPack: false, nom: F0.lib, A, R: reglageEffectif(F0.reglage), spe: () => SPEC,
    intro: "Le réglage de départ des cabinets qui reçoivent ce pack. Les cabinets qui le suivent sans retouche reçoivent aussitôt les modifications ; un cabinet retouché garde les siennes.",
    enregistrer: async (A2, R2, nom) => {
      const L = JSON.parse(JSON.stringify(FORMULES_())); let cle = k;
      if (!L[cle]) { let base = sansAcc(nom).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 26); if (base.length < 2) base = "pack"; cle = base; let n = 2; while (L[cle]) cle = base + "-" + n++; }
      L[cle] = { lib: nom.slice(0, 40), specialite: SPEC, modules: MODULES.map(([m]) => m).filter((m) => A2.modules[m]), max: A2.max, reglage: R2 };
      fermer(); await enregistrerPacks(L, "Pack « " + esc(nom) + " » enregistré");
    } });
}
function brancherSpecialites() {
  document.querySelectorAll("[data-spec]").forEach((b) => { b.onclick = () => { SPEC = b.dataset.spec; dessiner(); }; });
  document.querySelectorAll("[data-sous]").forEach((b) => { b.onclick = () => { SOUS = b.dataset.sous; dessiner(); }; });
  document.querySelectorAll("[data-pm]").forEach((b) => { b.onclick = () => ouvrirPack(b.dataset.pm); });
  document.querySelectorAll("[data-pd]").forEach((b) => { b.onclick = () => { const F = JSON.parse(JSON.stringify(FORMULES_()[b.dataset.pd])); F.lib = (F.lib + " (copie)").slice(0, 40); ouvrirPack("", F); }; });
  document.querySelectorAll("[data-ps]").forEach((b) => { b.onclick = async () => { const L = JSON.parse(JSON.stringify(FORMULES_())), f = L[b.dataset.ps]; if (!confirm("Supprimer le pack « " + f.lib + " » ? (aucun cabinet ne l'utilise)")) return; delete L[b.dataset.ps]; try { await enregistrerPacks(L, "Pack « " + esc(f.lib) + " » supprimé"); } catch (e) { alert("Impossible : " + e.message); } }; });
  const bouge = async (k, sens) => { const E = Object.entries(FORMULES_()), mes = E.filter(([, f]) => specialiteDe(f.specialite) === SPEC).map(([c]) => c), i = mes.indexOf(k), j = i + sens; if (j < 0 || j >= mes.length) return;
    [mes[i], mes[j]] = [mes[j], mes[i]]; const L = {}; E.filter(([, f]) => specialiteDe(f.specialite) !== SPEC).forEach(([c, f]) => { L[c] = f; }); mes.forEach((c) => { L[c] = FORMULES_()[c]; });
    try { await enregistrerPacks(JSON.parse(JSON.stringify(L)), "Ordre des packs enregistré"); } catch (e) { alert("Impossible : " + e.message); } };
  document.querySelectorAll("[data-ph]").forEach((b) => { b.onclick = () => bouge(b.dataset.ph, -1); });
  document.querySelectorAll("[data-pb]").forEach((b) => { b.onclick = () => bouge(b.dataset.pb, 1); });
  if ($("pNouv")) $("pNouv").onclick = () => ouvrirPack("");
  if ($("pProp")) $("pProp").onclick = async () => { const L = JSON.parse(JSON.stringify(FORMULES_())); Object.entries(FORMULES0).forEach(([k, f]) => { if (!L[k] && specialiteDe(f.specialite) === SPEC) L[k] = JSON.parse(JSON.stringify(f)); }); try { await enregistrerPacks(L, "Packs proposés ajoutés"); } catch (e) { alert("Impossible : " + e.message); } };
  brancherReference();
}
