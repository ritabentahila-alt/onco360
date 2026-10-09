// Onco360 – page Administration (phase F, étape 4, 09/10/2026). Compte d'administration séparé : il crée les cabinets des
// confrères, règle leur formule et leurs modules, les suspend ou les supprime, et modifie les formules elles-mêmes, sans jamais
// lire une donnée médicale : les règles ne lui ouvrent aucun cabinet, tout passe par les fonctions serveur (creerCabinet,
// listeCabinets, abonnementCabinet, formulesEnregistrer, infosCabinet, etatCabinet, supprimerCabinet, lienMotDePasse).
// Trois onglets (#cabinets, #nouveau, #formules) ; les réglages d'un cabinet s'ouvrent dans une fenêtre.
import { app, auth, db } from "../config.js";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { MENU, FONCTIONS, FONCTIONS_RELIEES, CARTES, SECTIONS, BIBLIOTHEQUES, reglageEffectif } from "../donnees/catalogue.js";
import { MODULES, ROLES_MAX, SPECIALITES, specialiteDe, FORMULES as FORMULES0, abonnementEffectif, BIBLIOTHEQUES_SPE, MODULE_FAMILLE, MODULE_MENU, MENU_COMMUN, MODULES_PREVUS } from "../donnees/modules.js";

const $ = (i) => document.getElementById(i);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dfr = (d) => (typeof d === "string" && d.length >= 10 ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "");
const sansAcc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const ONGLETS = [["cabinets", "Cabinets"], ["nouveau", "Nouveau cabinet"], ["formules", "Formules"], ["modules", "Modules et menus"], ["reference", "Bibliothèques et paramètres"]];
// CABINETS : liste (null = chargement) ; FS : formules enregistrées (sinon celles de départ) ; FED : formules en cours de modification
let CABINETS = null, FS = null, FED = null, BIBS = null, // BIBS : bibliothèques de référence par spécialité (null = pas encore lues)
   MSG = "", RES = "", Q = "", STATUT = "", SPE = "", SPEF = "";
const FORMULES_ = () => FS || FORMULES0;
const ONG = () => { const h = location.hash.replace("#", ""); return ONGLETS.some((o) => o[0] === h) ? h : "cabinets"; };

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
const nomFormule = (ab) => (!ab ? "Tout compris (sans formule)" : ((formuleDe(ab) || {}).lib || ab.formule) + (ab.surMesure || (ab.reglage && Object.keys(ab.reglage).length) ? " · sur mesure" : ""));
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
  $("page").innerHTML = bandeau + (o === "nouveau" ? htmlNouveau() : o === "formules" ? htmlFormules() : o === "reference" ? htmlReference() : o === "modules" ? htmlModules() : htmlCabinets());
  if ($("resX")) $("resX").onclick = () => { RES = ""; dessiner(); };
  if (o === "nouveau") brancherNouveau(); else if (o === "formules") brancherFormules(); else if (o === "reference") brancherReference(); else brancherCabinets();
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
function htmlReference() {
  const L = BIBS === null ? null : BIBS;
  return '<section class="carte"><h2>Bibliothèques et paramètres de base</h2><p class="sous">Pour chaque spécialité, ce que reçoit chaque <b>nouveau</b> cabinet selon la spécialité de sa formule :</p>' +
    '<ul class="liste-m"><li><b>Bibliothèques</b> : protocoles de chimiothérapie, médicaments, ordonnances types, analyses et bilans, examens complémentaires, courriers, documentation (Doc.).</li>' +
    '<li><b>Paramètres de base</b> : créneaux et horaires, jours fériés, messages WhatsApp, couleurs de Google Agenda, types de documents et de tâches, tâches automatiques, jours et heure de RCP, diagnostics et mutuelles, marges d\'impression, alertes, tarifs de radiothérapie.</li>' +
    '<li><b>Jamais</b> : correspondants, prix des consultations, lieux d\'exercice, équipe, patients.</li></ul>' +
    '<p class="sous">Tout est <b>mis de côté</b> : ce que fait un médecin dans son cabinet, y compris le Dr Bentahila, n\'y change rien. Vous les modifiez ici (« Ouvrir et modifier »), avec les écrans habituels d\'Onco360. Les cabinets déjà créés gardent leur propre copie.</p></section>' +
    (L === null ? '<section class="carte"><p class="sous">Chargement…</p></section>' : '<div class="cabs">' + L.map((B) => '<article class="cab"><div class="haut"><div><h3>' + esc(B.lib) + '</h3><div class="m">' + esc(B.specialites.join(" · ")) + "</div></div>" + (B.existe ? '<span class="bdg ok">En place</span>' : '<span class="bdg">À créer</span>') + "</div>" +
      (B.existe ? '<div class="chiffres" style="grid-template-columns:repeat(4,minmax(0,1fr))">' + LIBS.map(([k, lib]) => "<div><b>" + (B.nb && B.nb[k] != null ? B.nb[k] : "départ") + "</b><span>" + esc(lib) + "</span></div>").join("") + "</div>" : '<p class="m">' + (B.id === "bib-oncologie" ? "Sera créée à partir de la copie mise de côté le 09/10 (bibliothèque du Dr Bentahila)." : "Sera créée vide : vous la remplirez (les modules de cette spécialité restent à construire).") + "</p>") +
      '<div class="act"><button data-bib="' + esc(B.id) + '">' + (B.existe ? "Ouvrir et modifier" : "Créer et ouvrir") + "</button></div></article>").join("") + "</div>");
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

// ───── Réglage du cabinet (10/10/2026) : pack de départ, puis retouches à l'intérieur du cabinet ─────
// Menu (ordre), modules et leurs fonctions, cartes du tableau de bord (ordre, présence), onglets des Paramètres (ordre, présence),
// bibliothèques, maximums. Enregistré par abonnementCabinet (modules, max, reglage).
function ouvrirFormule(c) {
  if (!c) return;
  const A = JSON.parse(JSON.stringify(abonnementEffectif(c.abonnement))); A.formule = A.formule || "complet";
  const R = reglageEffectif(c.abonnement && c.abonnement.reglage);
  const n = (k) => (k === "patients" ? c.patients : k === "etablissements" ? c.etablissements : (c.roles || {})[k] || 0);
  const spe = () => (FORMULES_()[A.formule] || {}).specialite;
  const LIB_MOD = Object.fromEntries(MODULES.map((m) => [m[0], m[1]])), LIB_MENU = Object.fromEntries(MENU.map((m) => [m[0], m])), LIB_CARTE = Object.fromEntries(CARTES), LIB_SEC = Object.fromEntries(SECTIONS.map((x) => [x[0], x[1]]));
  const fleches = (l, i) => '<span class="fl"><button class="clair petit" data-haut="' + l + ":" + i + '"' + (i ? "" : " disabled") + ' aria-label="Monter">↑</button><button class="clair petit" data-bas="' + l + ":" + i + '" aria-label="Descendre">↓</button></span>';
  const caseC = (attr, on, txt) => '<label class="rg-c"><input type="checkbox" ' + attr + (on ? " checked" : "") + "><span>" + txt + "</span></label>";
  const corps = () => {
    const mods = MODULES.filter(([k]) => modulePour(k, spe()));
    return '<div class="form" style="grid-template-columns:minmax(0,340px) auto;align-items:end"><div><label for="fFor">Pack de départ</label><select id="fFor">' + optionsFormules(A.formule) + '</select></div><div><button class="clair petit" id="fDepart" title="Ordre et présence par défaut ; les modules et limites du pack restent">Remettre l\'ordre de départ</button></div></div>' +
      '<div class="rg"><div class="rg-b"><h3 class="st">Menu (ordre)</h3>' + R.menu.map((k, i) => { const m = LIB_MENU[k]; if (!m) return ""; return '<div class="rg-l">' + fleches("menu", i) + "<span class=\"rg-t\">" + esc(m[1]) + "</span>" + (m[2] ? caseC('data-rmod="' + m[2] + '"', A.modules[m[2]], "") : '<span class="m">toujours</span>') + "</div>"; }).join("") + "</div>" +
      '<div class="rg-b"><h3 class="st">Tableau de bord (cartes)</h3>' + R.accueil.map((k, i) => '<div class="rg-l">' + fleches("accueil", i) + '<span class="rg-t">' + esc(LIB_CARTE[k] || k) + "</span>" + caseC('data-rcarte="' + k + '"', R.cartes[k] !== false, "") + "</div>").join("") + "</div>" +
      '<div class="rg-b"><h3 class="st">Paramètres (onglets)</h3>' + R.ordreSections.map((k, i) => '<div class="rg-l">' + fleches("ordreSections", i) + '<span class="rg-t">' + esc(LIB_SEC[k] || k) + "</span>" + caseC('data-rsec="' + k + '"', R.sections[k] !== false, "") + "</div>").join("") + "</div>" +
      '<div class="rg-b"><h3 class="st">Bibliothèques</h3>' + BIBLIOTHEQUES.map(([k, lib]) => '<div class="rg-l"><span class="rg-t">' + esc(lib) + "</span>" + caseC('data-rbib="' + k + '"', R.bibliotheques[k] !== false, "") + "</div>").join("") + "</div></div>" +
      '<h3 class="st">Modules et fonctions</h3><div class="mods">' + mods.map(([k, lib, de]) => '<div class="mod-f' + (A.modules[k] ? "" : " off") + '">' + caseC('data-rmod="' + k + '"', A.modules[k], "<b>" + esc(lib) + '</b><br><span class="m">' + esc(de) + "</span>") +
        ((FONCTIONS[k] || []).length ? '<details' + (A.modules[k] ? "" : "") + "><summary>Fonctions (" + FONCTIONS[k].filter(([f]) => R.fonctions[k + "." + f] !== false).length + " / " + FONCTIONS[k].length + ")</summary>" + FONCTIONS[k].map(([f, l, base]) => base ? '<div class="rg-c base"><span>✓</span><span>' + esc(l) + ' <span class="m">(fonction de base, toujours là)</span></span></div>' : caseC('data-rfn="' + k + "." + f + '"', R.fonctions[k + "." + f] !== false, esc(l) + (FONCTIONS_RELIEES.indexOf(k + "." + f) < 0 ? ' <span class="m">(bientôt)</span>' : ""))).join("") + "</details>" : "") + "</div>").join("") + "</div>" +
      '<h3 class="st">Nombre maximum <span class="m">(vide = sans limite, 0 = aucun)</span></h3><div class="form">' + ROLES_MAX.map(([k, lib]) => '<div><label for="fMx' + k + '">' + esc(lib) + ' <span class="m">(actuellement ' + (n(k) == null ? "?" : n(k)) + ')</span></label><input id="fMx' + k + '" type="number" min="0" data-x="' + k + '" placeholder="sans limite" value="' + (A.max[k] == null ? "" : A.max[k]) + '"></div>').join("") + "</div>";
  };
  fenetre("<h2>Réglage de « " + esc(c.nom) + ' »</h2><p class="sous">Choisissez le pack, puis retouchez à volonté pour ce cabinet : ordre (↑ ↓), présence (cases), fonctions de chaque module. Ce qui est retiré est caché, les données sont gardées. Le changement s\'applique à la prochaine ouverture d\'Onco360 par l\'équipe.</p><div id="fCorps">' + corps() + '</div><div class="pied"><button id="fOk">Enregistrer</button><button class="clair" id="fAnn">Fermer</button></div>');
  const lireMax = () => document.querySelectorAll("#fCorps [data-x]").forEach((x) => { A.max[x.dataset.x] = x.value === "" ? null : Number(x.value); });
  const refaire = (sansLire) => { if (!sansLire) lireMax(); const ouverts = [...document.querySelectorAll("#fCorps details")].map((d) => d.open); $("fCorps").innerHTML = corps(); document.querySelectorAll("#fCorps details").forEach((d, i) => { d.open = !!ouverts[i]; }); brancher(); };
  const bouger = (v, sens) => { const [l, i] = v.split(":"), k = Number(i), j = k + sens, L = R[l]; if (j < 0 || j >= L.length) return; [L[k], L[j]] = [L[j], L[k]]; refaire(); };
  const brancher = () => {
    $("fFor").onchange = () => { const F = FORMULES_()[$("fFor").value]; if (!F) return; A.formule = $("fFor").value; A.max = Object.assign({}, F.max); MODULES.forEach(([k]) => { A.modules[k] = F.modules.indexOf(k) >= 0; }); refaire(true); }; // limites du pack (pas celles affichées)
    $("fDepart").onclick = () => { Object.assign(R, reglageEffectif(null)); refaire(); };
    document.querySelectorAll("#fCorps [data-haut]").forEach((b) => { b.onclick = () => bouger(b.dataset.haut, -1); });
    document.querySelectorAll("#fCorps [data-bas]").forEach((b) => { b.onclick = () => bouger(b.dataset.bas, 1); });
    document.querySelectorAll("#fCorps [data-rmod]").forEach((x) => { x.onchange = () => { const k = x.dataset.rmod; A.modules[k] = x.checked; if (k === "rcp" && x.checked) A.modules.taches = true; if (k === "taches" && !x.checked) A.modules.rcp = false; refaire(); }; });
    document.querySelectorAll("#fCorps [data-rcarte]").forEach((x) => { x.onchange = () => { R.cartes[x.dataset.rcarte] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rsec]").forEach((x) => { x.onchange = () => { R.sections[x.dataset.rsec] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rbib]").forEach((x) => { x.onchange = () => { R.bibliotheques[x.dataset.rbib] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rfn]").forEach((x) => { x.onchange = () => { R.fonctions[x.dataset.rfn] = x.checked; refaire(); }; });
  };
  brancher();
  $("fAnn").onclick = fermer;
  $("fOk").onclick = async () => {
    lireMax(); const b = $("fOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { const o = await serveur("abonnementCabinet", { espace: c.id, formule: A.formule, modules: A.modules, max: A.max, reglage: R }); c.abonnement = o.abonnement; fermer(); RES = "Réglage enregistré pour « " + esc(c.nom) + " » : " + esc(nomFormule(o.abonnement)) + ". Il s'applique à la prochaine ouverture d'Onco360 par l'équipe."; dessiner(); }
    catch (e) { b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
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

// ───── Onglet Formules : par spécialité ; nom, spécialité, modules, maximums ; ajouter, supprimer ─────
function htmlFormules() {
  const L = FED || JSON.parse(JSON.stringify(FORMULES_())), util = (k) => (CABINETS || []).filter((c) => c.abonnement && c.abonnement.formule === k).length;
  const spes = SPECIALITES.concat(Object.values(L).map((f) => f.specialite || "Autres").filter((s, i, a) => SPECIALITES.indexOf(s) < 0 && a.indexOf(s) === i));
  const manquantes = Object.keys(FORMULES0).filter((k) => !L[k]).length;
  const carte = ([k, f]) => '<div class="fml" data-f="' + esc(k) + '"><div class="fml-haut"><input class="nomf" data-fl="lib" value="' + esc(f.lib) + '" aria-label="Nom de la formule">' +
    '<select data-fs aria-label="Spécialité">' + spes.map((s) => "<option" + (s === (f.specialite || "Autres") ? " selected" : "") + ">" + esc(s) + "</option>").join("") + "</select>" +
    '<span class="m">' + util(k) + " cabinet(s)</span>" + (util(k) ? "" : '<button class="rouge petit" data-fsup="' + esc(k) + '">Supprimer</button>') + "</div>" +
    '<div class="mods">' + MODULES.filter(([m]) => modulePour(m, f.specialite)).map(([m, lib]) => '<label class="mod"><input type="checkbox" data-fm="' + m + '"' + ((f.modules || []).indexOf(m) >= 0 ? " checked" : "") + "><span>" + esc(lib) + (MODULE_FAMILLE[m] ? ' <span class="m">(' + esc(famille(MODULE_FAMILLE[m])) + ")</span>" : "") + "</span></label>").join("") + "</div>" +
    '<div class="form maxs">' + ROLES_MAX.map(([m, lib]) => "<div><label>" + esc(lib) + '</label><input type="number" min="0" data-fx="' + m + '" value="' + (f.max && f.max[m] != null ? f.max[m] : "") + '" placeholder="sans limite"></div>').join("") + "</div></div>";
  return '<section class="carte"><h2>Formules</h2><p class="sous">Ce que contient chaque formule, rangée par spécialité. Les cabinets qui suivent une formule sans retouche reçoivent ses nouvelles valeurs dès l\'enregistrement ; un cabinet « sur mesure » garde les siennes. Maximum vide = sans limite, 0 = aucun.</p>' +
    '<div class="puces"><button class="puce' + (SPE === "" ? " on" : "") + '" data-spe="">Toutes</button>' + spes.map((s) => '<button class="puce' + (s === SPE ? " on" : "") + '" data-spe="' + esc(s) + '">' + esc(s) + ' <span class="nb">' + Object.values(L).filter((f) => (f.specialite || "Autres") === s).length + "</span></button>").join("") + "</div>" +
    '<div class="barre" style="margin-top:12px"><button class="clair" id="fNouv">+ Nouvelle formule</button>' + (manquantes ? '<button class="clair" id="fProp">Ajouter les ' + manquantes + " formule(s) proposée(s) par Onco360</button>" : "") + "</div></section>" +
    spes.filter((s) => !SPE || s === SPE).map((s) => { const l = Object.entries(L).filter(([, f]) => (f.specialite || "Autres") === s); return '<section class="carte"><h2>' + esc(s) + ' <span class="m">' + l.length + " formule" + (l.length > 1 ? "s" : "") + "</span></h2>" + (l.length ? l.map(carte).join("") : '<p class="sous">Aucune formule pour l\'instant' + (/générale|Gynéco/.test(s) ? " : les modules de cette spécialité sont à créer (feuille de route)." : ".") + "</p>") + "</section>"; }).join("") +
    '<div class="enreg' + (FED ? " on" : "") + '" id="fBarre"><span>Modifications non enregistrées</span><button class="clair" id="fAnnul">Annuler</button><button id="fEnr">Enregistrer les formules</button></div>';
}
function lireFormules() {
  const L = JSON.parse(JSON.stringify(FED || FORMULES_())); // formules cachées par le filtre de spécialité : gardées telles quelles
  document.querySelectorAll(".fml").forEach((z) => {
    const k = z.dataset.f, max = {};
    z.querySelectorAll("[data-fx]").forEach((x) => { max[x.dataset.fx] = x.value === "" ? null : Number(x.value); });
    L[k] = { lib: z.querySelector("[data-fl]").value.trim() || k, specialite: z.querySelector("[data-fs]").value, modules: [...z.querySelectorAll("[data-fm]")].filter((x) => x.checked).map((x) => x.dataset.fm), max };
    if (L[k].modules.indexOf("taches") < 0) L[k].modules = L[k].modules.filter((m) => m !== "rcp");
  });
  return L;
}
function brancherFormules() {
  const modif = () => { FED = lireFormules(); $("fBarre").classList.add("on"); };
  document.querySelectorAll(".fml input, .fml select").forEach((x) => { x.oninput = x.onchange = () => { modif(); if (x.type === "checkbox" || x.tagName === "SELECT") dessiner(); }; });
  document.querySelectorAll("[data-spe]").forEach((b) => { b.onclick = () => { if (FED) FED = lireFormules(); SPE = b.dataset.spe; dessiner(); }; });
  document.querySelectorAll("[data-fsup]").forEach((b) => { b.onclick = () => { const L = lireFormules(); if (!confirm("Supprimer la formule « " + (L[b.dataset.fsup] || {}).lib + " » ?")) return; delete L[b.dataset.fsup]; FED = L; dessiner(); }; });
  $("fNouv").onclick = () => {
    const nom = prompt("Nom de la nouvelle formule :"); if (!nom || !nom.trim()) return;
    const L = lireFormules(); let base = sansAcc(nom).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 26);
    if (base.length < 2) base = "formule"; let k = base, n = 2; while (L[k]) k = base + "-" + n++;
    L[k] = { lib: nom.trim().slice(0, 40), specialite: SPE || SPECIALITES[0], modules: MODULES.map((m) => m[0]), max: { medecin: 1, assistante: 1, infirmiere: 0, etablissements: 1, patients: null } }; FED = L; dessiner();
  };
  if ($("fProp")) $("fProp").onclick = () => { const L = lireFormules(); Object.entries(FORMULES0).forEach(([k, f]) => { if (!L[k]) L[k] = JSON.parse(JSON.stringify(f)); }); FED = L; dessiner(); };
  $("fAnnul").onclick = () => { FED = null; dessiner(); };
  $("fEnr").onclick = async () => {
    const b = $("fEnr"), L = lireFormules(); b.disabled = true; b.textContent = "Enregistrement…";
    try { const o = await serveur("formulesEnregistrer", { formules: L }); FS = o.formules; FED = null; RES = "Formules enregistrées" + (o.cabinets ? " ; " + o.cabinets + " cabinet(s) mis à jour" : "") + "."; CABINETS = null; dessiner(); charger(); }
    catch (e) { b.disabled = false; b.textContent = "Enregistrer les formules"; alert("Enregistrement impossible : " + e.message); }
  };
}
// ───── Onglet Modules et menus (10/10/2026) ─────
// Chaque module : à quelle(s) spécialité(s) il sert, ce qu'il ajoute au menu et au dossier, dans quelles formules et chez combien de
// cabinets. Le contenu d'un module (ses écrans) est le même pour tous : une modification s'applique à tous les cabinets qui l'ont.
const famille = (id) => (BIBLIOTHEQUES_SPE.find((b) => b.id === id) || {}).lib || id;
const bibDe = (spe) => (BIBLIOTHEQUES_SPE.find((b) => b.specialites.indexOf(spe) >= 0) || BIBLIOTHEQUES_SPE[0]).id;
const modulePour = (k, spe) => !MODULE_FAMILLE[k] || MODULE_FAMILLE[k] === bibDe(spe || SPECIALITES[0]);
function htmlModules() {
  const F = FORMULES_(), C = CABINETS || [];
  const ligne = ([k, lib, de]) => { const fs = Object.values(F).filter((f) => (f.modules || []).indexOf(k) >= 0).map((f) => f.lib), nc = C.filter((c) => c.actif && abonnementEffectif(c.abonnement).modules[k]).length;
    return '<div class="modl"><div><b>' + esc(lib) + '</b><div class="m">' + esc(de) + '</div><div class="m">↳ ' + esc(MODULE_MENU[k] || "") + '</div></div><div class="m n">' + nc + " cabinet" + (nc > 1 ? "s" : "") + " actif" + (nc > 1 ? "s" : "") + "<br>" + (fs.length ? esc(fs.length + " formule" + (fs.length > 1 ? "s" : "")) : "aucune formule") + "</div></div>"; };
  return '<section class="carte"><h2>Modules et menus</h2><p class="sous">Un <b>module</b> est une partie d\'Onco360 (menu, onglet ou bouton). Les modules communs servent à toutes les spécialités ; d\'autres sont propres à une spécialité (ex. Protocoles : oncologie – radiothérapie). <b>Le contenu d\'un module est le même pour tous</b> : quand vous demandez une modification (ex. « modifie le module Tâches »), elle s\'applique, dès sa mise en ligne, à <b>tous les cabinets actifs qui ont ce module</b>. Qui a quel module : onglet Formules, et « Formule et modules » de chaque cabinet.</p>' +
    '<h3 class="st">Toujours présents (toutes spécialités)</h3><p class="m">' + esc(MENU_COMMUN.join(" · ")) + "</p></section>" +
    '<section class="carte"><h2>Modules communs</h2><p class="m">Toutes les spécialités, selon la formule.</p>' + MODULES.filter(([k]) => !MODULE_FAMILLE[k]).map(ligne).join("") + "</section>" +
    BIBLIOTHEQUES_SPE.map((B) => { const l = MODULES.filter(([k]) => MODULE_FAMILLE[k] === B.id), p = MODULES_PREVUS.filter((x) => x[2] === B.id);
      return '<section class="carte"><h2>' + esc(B.lib) + '</h2><p class="m">' + esc(B.specialites.join(" · ")) + "</p>" + l.map(ligne).join("") + p.map(([, lib]) => '<div class="modl prevu"><div><b>' + esc(lib) + '</b><div class="m">À construire (feuille de route, étape 14)</div></div><span class="bdg">Prévu</span></div>').join("") + (l.length || p.length ? "" : '<p class="m">Aucun module propre pour l\'instant (à décider).</p>') + "</section>"; }).join("");
}
