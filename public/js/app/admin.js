// Onco360 – page Administration (phase F, étape 4, 09/10/2026). Compte d'administration séparé : il crée les cabinets des
// confrères, règle leur formule et leurs modules, les suspend ou les supprime, et modifie les formules elles-mêmes, sans jamais
// lire une donnée médicale : les règles ne lui ouvrent aucun cabinet, tout passe par les fonctions serveur (creerCabinet,
// listeCabinets, abonnementCabinet, formulesEnregistrer, infosCabinet, etatCabinet, supprimerCabinet, lienMotDePasse).
// Trois onglets (#cabinets, #nouveau, #formules) ; les réglages d'un cabinet s'ouvrent dans une fenêtre.
import { app, auth, db } from "../config.js";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { MENU, FONCTIONS, FONCTIONS_RELIEES, CARTES, SECTIONS, BIBLIOTHEQUES, FICHE, TYPES_CHAMP, TOUJOURS_ENTETE, CONSULT, TYPES_CHAMP_CS, reglageEffectif, ficheEffective, ficheRetouches, consultEffective, formRetouches, libDe, avecOnco } from "../donnees/catalogue.js";
import { htmlFacture, dh2 } from "../donnees/factures.js";
import { editeurFiche } from "./editeurfiche.js";
import { CHAMPS_EDITEUR, EDITEUR_REQUIS, editeurIncomplet, REGLAGES_ABO0, MODELES_RELANCE0, CANAUX, remplirRelance, MODES_FACT, MOYENS, PRIX0, ajouterJours, prolonger, etatFacturation, prixCabinet, attendus, impaye } from "../donnees/facturation.js";
import { MODULES, ROLES_MAX, SPECIALITES, specialiteDe, FORMULES as FORMULES0, abonnementEffectif, BIBLIOTHEQUES_SPE, MODULE_FAMILLE, MODULE_MENU, MODULES_BASE, MODULES_PREVUS } from "../donnees/modules.js";

const $ = (i) => document.getElementById(i);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dfr = (d) => (typeof d === "string" && d.length >= 10 ? d.slice(8, 10) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4) : "");
const sansAcc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const ONGLETS = [["cabinets", "Cabinets"], ["nouveau", "Nouveau cabinet"], ["compta", "Comptabilité"], ["specialites", "Par spécialité"], ["modules", "Modules"], ["journal", "Journal"]];
// CABINETS : liste (null = chargement) ; FS : packs (formules) enregistrés (sinon ceux de départ)
let RA = Object.assign({}, REGLAGES_ABO0); // réglages des abonnements (suspension, délais ; 18.3)
let EDITEUR = null, FACT = []; // Mon entreprise (mentions des factures) ; factures et avoirs (18.4)
let ARCH = [], LU = ""; // cabinets supprimés dont la facturation est gardée (comptabilité) ; heure de la dernière lecture
let SPES = {}; // fiche patient de chaque spécialité { nom: { fiche, le } } (plateforme/specialites)
let CABINETS = null, FS = null, BIBS = null, // BIBS : bibliothèques de référence par spécialité (null = pas encore lues)
   MSG = "", RES = "", Q = "", STATUT = "", SPE = "", SPEF = "", PAIE = "", TRI = { k: "cree", sens: -1 };
const FORMULES_ = () => FS || FORMULES0;
const ONG = () => { const h = location.hash.replace("#", ""); return h === "formules" || h === "reference" ? "specialites" : ONGLETS.some((o) => o[0] === h) ? h : "cabinets"; };

async function serveur(nom, donnees) {
  const { getFunctions, httpsCallable } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js");
  try { const r = (await httpsCallable(getFunctions(app, "europe-west1"), nom, { timeout: 120000 })(donnees || {})).data; if (nom !== "journalAdmin" && nom !== "listeCabinets") JL = null; return r; } // une action : le journal sera relu
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
    const o = await serveur("listeCabinets"); if (o.formules) { FS = o.formules; Object.values(FS).forEach((f) => { f.specialite = specialiteDe(f.specialite); }); } BIBS = o.bibliotheques || []; ARCH = o.archives || []; RA = Object.assign({ modeles: Object.assign({}, MODELES_RELANCE0) }, REGLAGES_ABO0, o.reglagesAbo || {}); EDITEUR = o.editeur || null; FACT = (o.factures || []).map((x) => Object.assign({}, x, { le: typeof x.le === "string" ? x.le : "" })); LU = o.lu || new Date().toISOString(); SPES = {}; Object.entries(o.specialites || {}).forEach(([n, v]) => { SPES[specialiteDe(n)] = v; }); MSG = "";
    CABINETS = (o.cabinets || []).map((c) => Object.assign({}, c, { cree: typeof c.cree === "string" ? c.cree : "", suspenduLe: typeof c.suspenduLe === "string" ? c.suspenduLe : "", titulaire: c.titulaire || {} }));
  } catch (e) { CABINETS = []; MSG = '<p class="err">Liste des cabinets indisponible : ' + esc(e.message) + ' <button class="clair petit" onclick="location.reload()">Réessayer</button></p>'; }
  dessiner();
}
const cab = (id) => (CABINETS || []).find((c) => c.id === id);
const formuleDe = (ab) => (ab && FORMULES_()[ab.formule]) || null;
// Cabinet sans abonnement (le vôtre, créé avant les packs) : tous les modules, sans limite, en Oncologie – Radiothérapie (A1, 17.1)
const speDuCab = (c) => (c.abonnement ? specialiteDe((formuleDe(c.abonnement) || {}).specialite) || "" : SPECIALITES[0]);
const nomFormule = (ab) => (!ab ? "Tout compris, sans limite" : ((formuleDe(ab) || {}).lib || ab.formule) + (ab.surMesure || (ab.reglage && ab.retouche === undefined && Object.keys(ab.reglage).length) ? " · sur mesure" : ""));
// ───── Relances (18.6) : cabinets en retard, à renouveler, en fin d'essai ; message prêt (WhatsApp, e-mail), relance notée ─────
const TYPES_REL = { retard: "Retard de paiement", renouveler: "Échéance proche", essai: "Fin d'essai" };
function aRelancer(c) {
  if (!c || c.modele || c.demo || !c.facturation || c.facturation.mode === "gratuit") return null;
  const E = etatDe(c);
  return E.etat === "retard" || E.etat === "suspendre" ? "retard" : E.etat === "renouveler" ? "renouveler" : E.etat === "essai" && E.jours <= RA.rappel ? "essai" : null;
}
const derniereRelance = (c) => { const r = ((c.facturation || {}).relances || []).slice(-1)[0]; return r ? new Date(r.le).toLocaleDateString("fr-FR") + " par " + ((CANAUX.find((x) => x[0] === r.canal) || [])[1] || r.canal) : ""; };
const telWa = (t) => String(t || "").replace(/[^0-9]/g, "").replace(/^00/, "").replace(/^0(?=[5-7])/, "212");
function variablesRelance(c, type) {
  const E = etatDe(c), F = formuleDe(c.abonnement) || {}, P = F.prix || PRIX0[c.abonnement && c.abonnement.formule] || {};
  const m = type === "retard" ? impaye(c.facturation, prixDe(c), JOUR()) : type === "renouveler" ? prixDe(c).prix : P.mois;
  return { medecin: c.titulaire.nom || "Docteur", cabinet: c.nom, pack: nomFormule(c.abonnement), montant: dh(m), montantAn: dh(P.an), echeance: dfr(E.fin), jours: E.jours, rib: (EDITEUR || {}).rib || "", raison: (EDITEUR || {}).raison || "Onco360" };
}
function htmlRelances() {
  const L = (CABINETS || []).map((c) => ({ c, t: aRelancer(c) })).filter((x) => x.t).sort((a, b) => ["retard", "renouveler", "essai"].indexOf(a.t) - ["retard", "renouveler", "essai"].indexOf(b.t));
  return '<section class="carte"><div class="barre" style="justify-content:space-between"><h2 style="margin:0">Relances</h2><button class="clair petit" data-modeles>Modèles des messages</button></div><p class="sous">Cabinets en retard, à renouveler (' + RA.rappel + " jours avant l'échéance) ou en fin d'essai. Le message est prêt ; c'est vous qui l'envoyez (WhatsApp, e-mail) : la relance est alors notée.</p>" +
    (L.length ? '<div class="tableau"><table class="lc"><thead><tr><th>Cabinet</th><th>Motif</th><th>Échéance</th><th class="n">Montant</th><th>Dernière relance</th><th></th></tr></thead><tbody>' + L.map(({ c, t }) => { const E = etatDe(c), V = variablesRelance(c, t);
      return '<tr><td data-l="Cabinet"><b>' + esc(c.nom) + '</b><div class="m">' + esc([c.titulaire.nom, c.titulaire.telephone].filter(Boolean).join(" · ")) + '</div></td><td data-l="Motif"><span class="bdg ' + (t === "retard" ? "al" : "rt") + '">' + esc(TYPES_REL[t]) + '</span><div class="m">' + esc(E.lib) + '</div></td><td data-l="Échéance">' + esc(dfr(E.fin)) + '</td><td data-l="Montant" class="n">' + esc(V.montant) + '</td><td data-l="Dernière relance">' + esc(derniereRelance(c) || "jamais") + '</td><td><button class="petit" data-rel="' + esc(c.id) + '">Relancer</button></td></tr>'; }).join("") + "</tbody></table></div>"
      : '<p class="m">Aucune relance à faire.</p>') + "</section>";
}
document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("[data-rel],[data-modeles]"); if (!t) return; if (t.dataset.rel) ouvrirRelance(cab(t.dataset.rel)); else ouvrirModeles(); });
function ouvrirRelance(c) {
  const type = aRelancer(c) || "retard"; if (!c) return;
  const txt = remplirRelance(RA.modeles[type] || MODELES_RELANCE0[type], variablesRelance(c, type)), tel = telWa(c.titulaire.telephone), mail = (c.facturation && c.facturation.client && c.facturation.client.email) || c.titulaire.email || "";
  fenetre("<h2>Relancer « " + esc(c.nom) + ' »</h2><p class="sous">' + esc(TYPES_REL[type]) + " · " + esc(etatDe(c).lib) + " · dernière relance : " + esc(derniereRelance(c) || "jamais") + '. Modifiez le message si besoin, puis envoyez-le : la relance est notée.</p>' +
    '<textarea id="rlTxt" rows="9">' + esc(txt) + "</textarea>" +
    '<div class="pied"><button class="bt wa" id="rlWa"' + (tel ? "" : ' disabled title="Pas de téléphone pour ce médecin (Modifier)"') + ">Envoyer par WhatsApp</button><button id=\"rlMail\"" + (mail ? "" : " disabled") + '>Envoyer par e-mail</button><button class="clair" id="rlCop">Copier</button><button class="clair" id="rlTel">Noter : relancé par téléphone</button><button class="clair" id="rlAnn">Fermer</button></div>' +
    '<p class="m">' + esc([tel ? "WhatsApp : +" + tel : "", mail ? "E-mail : " + mail : ""].filter(Boolean).join(" · ")) + "</p>");
  const noter = async (canal) => { try { await envoyerFacturation(c, { action: "relance", canal, type }, "Relance notée (" + ((CANAUX.find((x) => x[0] === canal) || [])[1]) + ") pour « " + esc(c.nom) + " »."); } catch (e) { alert("Relance non notée : " + e.message); } };
  $("rlAnn").onclick = fermer;
  $("rlWa").onclick = () => { window.open("https://wa.me/" + tel + "?text=" + encodeURIComponent($("rlTxt").value), "_blank"); noter("whatsapp"); };
  $("rlMail").onclick = () => { window.open("mailto:" + encodeURIComponent(mail) + "?subject=" + encodeURIComponent("Votre abonnement Onco360") + "&body=" + encodeURIComponent($("rlTxt").value), "_blank"); noter("email"); };
  $("rlCop").onclick = async () => { const t = $("rlTxt"); try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand("copy"); } $("rlCop").textContent = "Copié"; };
  $("rlTel").onclick = () => noter("telephone");
}
function ouvrirModeles() {
  fenetre('<h2>Modèles des messages de relance</h2><p class="sous">Champs remplis pour chaque cabinet : {medecin} {cabinet} {pack} {montant} {montantAn} {echeance} {jours} {rib} {raison}. Vide = message proposé par Onco360.</p>' +
    Object.keys(MODELES_RELANCE0).map((k) => '<label for="md_' + k + '">' + esc(TYPES_REL[k]) + '</label><textarea id="md_' + k + '" rows="6">' + esc(RA.modeles[k] || "") + "</textarea>").join("") +
    '<div class="pied"><button id="mdOk">Enregistrer</button><button class="clair" id="mdDep">Revenir aux messages proposés</button><button class="clair" id="mdAnn">Fermer</button></div>');
  $("mdAnn").onclick = fermer;
  $("mdDep").onclick = () => { Object.keys(MODELES_RELANCE0).forEach((k) => { $("md_" + k).value = MODELES_RELANCE0[k]; }); };
  $("mdOk").onclick = async () => {
    const modeles = {}; Object.keys(MODELES_RELANCE0).forEach((k) => { modeles[k] = $("md_" + k).value; });
    const b = $("mdOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { const o = await serveur("reglagesAbonnements", { reglages: Object.assign({}, RA, { modeles }) }); RA = Object.assign({ modeles: Object.assign({}, MODELES_RELANCE0) }, REGLAGES_ABO0, o.reglages); fermer(true); RES = "Modèles des messages de relance enregistrés."; dessiner(); }
    catch (e) { b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}
// ───── Factures (18.4) : Mon entreprise, voir / imprimer une facture ─────
document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("[data-vfac],[data-editeur]"); if (!t) return; if (t.dataset.editeur !== undefined) ouvrirEditeur(); else voirFacture(FACT.find((x) => x.id === t.dataset.vfac || x.numero === t.dataset.num)); });
function voirFacture(F) {
  if (!F) { alert("Facture introuvable (actualisez la page)."); return; }
  const w = window.open("", "_blank"); if (!w) { alert("Autorisez les fenêtres (pop-up) pour afficher la facture."); return; }
  w.document.open(); w.document.write(htmlFacture(F).replace("</body>", '<script>setTimeout(function(){window.print()},300)<\/script></body>')); w.document.close(); w.focus();
}
function ouvrirEditeur() {
  const E = EDITEUR || {};
  fenetre('<h2>Mon entreprise</h2><p class="sous">Les mentions de vos factures (obligatoires : raison sociale, ICE, IF, adresse, ville). Prix TTC, TVA ' + 20 + ' % ; numéros F-AAAA-NNNN, avoirs AV-AAAA-NNNN. Une facture garde les mentions du jour où elle est faite.</p><div class="form">' +
    CHAMPS_EDITEUR.map(([k, l]) => k === "mentions" ? '<div class="large"><label for="ed_' + k + '">' + esc(l) + '</label><textarea id="ed_' + k + '" rows="2">' + esc(E[k] || "") + "</textarea></div>" : ch("ed_" + k, l + (EDITEUR_REQUIS.indexOf(k) >= 0 ? " *" : ""), "", k === "email" ? "email" : "", E[k])).join("") + "</div>" +
    '<div class="pied"><button id="edOk">Enregistrer</button><button class="clair" id="edAnn">Fermer</button></div>');
  $("edAnn").onclick = fermer;
  $("edOk").onclick = async () => {
    const d = {}; CHAMPS_EDITEUR.forEach(([k]) => { d[k] = $("ed_" + k).value; });
    const b = $("edOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { const o = await serveur("editeurEnregistrer", { editeur: d }); EDITEUR = o.editeur; fermer(true); RES = "Mon entreprise enregistré" + (o.manque.length ? " (à compléter pour faire des factures : " + esc(o.manque.join(", ")) + ")" : " : les factures peuvent être créées") + "."; dessiner(); }
    catch (e) { b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}
// Réglages des abonnements (18.3) : suspension des cabinets en retard (me demander, automatique, jamais), délais
document.addEventListener("click", (e) => { const t = e.target.closest && e.target.closest("[data-reg-abo],[data-fiche-o]"); if (!t) return; if (t.dataset.ficheO) ouvrirFiche(cab(t.dataset.ficheO)); else ouvrirReglagesAbo(); });
function ouvrirReglagesAbo() {
  const opt = (k, l, aide) => '<label class="rg-c choix-r"><input type="radio" name="raSusp" value="' + k + '"' + (RA.suspension === k ? " checked" : "") + "><span><b>" + l + '</b><br><span class="m">' + aide + "</span></span></label>";
  fenetre('<h2>Réglages des abonnements</h2><p class="sous">Pour tous les cabinets. Un cabinet peut en plus être exclu des suspensions (sa fiche › Modifier l\'abonnement). Votre cabinet et la démonstration ne sont jamais suspendus.</p>' +
    '<h3 class="st">Cabinet en retard de paiement</h3>' + opt("demander", "Me demander (conseillé)", "Rien n'est suspendu tout seul : après le délai, le cabinet apparaît en haut de la liste des cabinets et vous décidez (Suspendre, ou attendre).") +
    opt("auto", "Suspendre automatiquement", "Chaque nuit, un cabinet en retard depuis plus que le délai est suspendu (données gardées) ; il est réactivé dès qu'un paiement est enregistré.") + opt("jamais", "Ne jamais suspendre", "Les retards sont seulement signalés (tuile « En retard », Comptabilité › Impayés).") +
    '<div class="form" style="margin-top:12px"><div><label for="raDel">Délai après l\'échéance (jours)</label><input id="raDel" type="number" min="1" max="365" value="' + RA.delai + '"></div><div><label for="raRap">Rappel « À renouveler » (jours avant l\'échéance)</label><input id="raRap" type="number" min="0" max="90" value="' + RA.rappel + '"></div><div><label for="raEss">Durée de l\'essai gratuit (jours, cabinets neufs)</label><input id="raEss" type="number" min="1" max="365" value="' + RA.essai + '"></div></div>' +
    '<div class="pied"><button id="raOk">Enregistrer</button><button class="clair" id="raAnn">Fermer</button></div>');
  $("raAnn").onclick = fermer;
  $("raOk").onclick = async () => {
    const r = { suspension: (document.querySelector('input[name="raSusp"]:checked') || {}).value || "demander", delai: $("raDel").value, rappel: $("raRap").value, essai: $("raEss").value };
    if (r.suspension === "auto" && !confirm("Suspendre automatiquement les cabinets en retard de plus de " + r.delai + " jours ?\n\nChaque nuit, Onco360 le fera sans vous demander.")) return;
    const b = $("raOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { const o = await serveur("reglagesAbonnements", { reglages: Object.assign({ modeles: RA.modeles }, r) }); RA = Object.assign({ modeles: Object.assign({}, MODELES_RELANCE0) }, REGLAGES_ABO0, o.reglages); fermer(true); RES = "Réglages des abonnements enregistrés."; dessiner(); }
    catch (e) { b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}
// Actualiser (18.1) : relit cabinets, abonnements et activité ; heure de la dernière lecture
const actualiser = () => '<p class="m lu">' + (LU ? "Chiffres lus à " + esc(new Date(LU).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })) + " · " : "") + '<button class="lien" data-actu>Actualiser</button></p>';
document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-actu]"); if (!b) return; b.disabled = true; b.textContent = "Lecture…"; CABINETS = null; dessiner(); charger(); });
// ───── Abonnements (17.4) : état, prix, badge ─────
const JOUR = () => new Date().toISOString().slice(0, 10);
const etatDe = (c) => etatFacturation(c.facturation, JOUR(), RA);
// Que se passe-t-il pour un cabinet en retard ? (réglages : me demander, automatique, jamais ; cabinet exclu)
const suiteRetard = (c) => (c.facturation && c.facturation.jamaisSuspendre) || RA.suspension === "jamais" ? "jamais suspendu automatiquement" : RA.suspension === "auto" ? "suspendu automatiquement après " + RA.delai + " jours de retard" : "après " + RA.delai + " jours de retard, Onco360 vous demande s'il faut le suspendre";
const prixDe = (c) => prixCabinet(c.facturation, formuleDe(c.abonnement), c.abonnement && c.abonnement.formule);
const BADGE_F = { nonSuivi: "", gratuit: "ok", essai: "", ajour: "ok", renouveler: "rt", retard: "al", suspendre: "al" };
const badgeAbo = (c) => { const E = etatDe(c); return E.etat === "nonSuivi" ? '<span class="m">' + (c.modele ? "Votre cabinet" : c.demo ? "Démonstration" : "Non suivi") + "</span>" : '<span class="bdg ' + BADGE_F[E.etat] + '">' + esc(E.lib) + "</span>" + (E.fin ? '<div class="m">' + (E.etat === "essai" ? "fin le " : E.etat === "retard" || E.etat === "suspendre" ? "échéance du " : "jusqu'au ") + esc(dfr(E.fin)) + "</div>" : ""); };
const dh = (n) => (n == null || n === "" ? "—" : Number(n).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ") + " DH");
const ilYa = (iso) => { if (!iso) return "—"; const n = Math.floor((Date.now() - new Date(iso)) / 86400000); return n <= 0 ? "aujourd'hui" : n === 1 ? "hier" : "il y a " + n + " j"; };
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
  $("page").innerHTML = bandeau + (o === "nouveau" ? htmlNouveau() : o === "specialites" ? htmlSpecialites() : o === "modules" ? htmlModules() : o === "journal" ? htmlJournal() : o === "compta" ? htmlCompta() : htmlCabinets());
  if ($("resX")) $("resX").onclick = () => { RES = ""; dessiner(); };
  if (o === "nouveau") brancherNouveau(); else if (o === "specialites") brancherSpecialites(); else if (o === "modules") brancherModules(); else if (o === "journal") brancherJournal(); else if (o === "compta") brancherCompta(); else brancherCabinets();
}

// ───── Onglet Cabinets : chiffres, recherche, filtres, cartes ─────
function htmlCabinets() {
  if (CABINETS === null) return '<section class="carte"><p class="sous">Chargement des cabinets…</p></section>';
  const L = CABINETS, act = L.filter((c) => c.actif).length;
  const tuile = (n, lib, cls, f, aide) => '<div class="tuile' + (cls ? " " + cls : "") + (f ? " clic" : "") + (f && f !== "tous" && PAIE === f ? " on" : "") + '"' + (f ? ' data-paie="' + f + '" role="button" tabindex="0" aria-pressed="' + (PAIE === f) + '"' : "") + (aide ? ' title="' + esc(aide) + '"' : "") + "><b>" + n + "</b><span>" + esc(lib) + "</span></div>";
  const E = (c) => etatDe(c).etat, nbE = (l) => L.filter((c) => l.indexOf(E(c)) >= 0).length;
  const revenu = L.filter((c) => c.actif && ["ajour", "renouveler", "retard"].indexOf(E(c)) >= 0).reduce((n, c) => n + prixDe(c).mensuel, 0);
  const spes = [...new Set(L.map(speDuCab).filter(Boolean))];
  const m = sansAcc(Q).split(/\s+/).filter(Boolean);
  const PAIES = { essai: ["essai"], renouveler: ["renouveler"], retard: ["retard", "suspendre"], ajour: ["ajour"], gratuit: ["gratuit"], nonSuivi: ["nonSuivi"] };
  const VAL = { nom: (c) => sansAcc(c.nom), medecin: (c) => sansAcc(c.titulaire.nom), pack: (c) => sansAcc(nomFormule(c.abonnement)), abo: (c) => ["suspendre", "retard", "renouveler", "essai", "ajour", "gratuit", "nonSuivi"].indexOf(E(c)) * 10000 + (etatDe(c).jours || 0),
    statut: (c) => (c.actif ? 1 : 0), equipe: (c) => (c.equipe ? c.equipe.filter((x) => x.actif).length : c.membres || 0), dossiers: (c) => c.patients || 0, activite: (c) => (c.activite && c.activite.derniere) || "", cree: (c) => String(c.cree || "") };
  const V = L.filter((c) => (!STATUT || (STATUT === "actif") === c.actif) && (!SPE || speDuCab(c) === SPE) && (!PAIE || PAIES[PAIE].indexOf(E(c)) >= 0) &&
    m.every((w) => sansAcc([c.nom, c.ville, c.id, c.titulaire.nom, c.titulaire.email, nomFormule(c.abonnement)].join(" ")).indexOf(w) >= 0))
    .sort((a, b) => { const x = VAL[TRI.k](a), y = VAL[TRI.k](b); return (x < y ? -1 : x > y ? 1 : 0) * TRI.sens || String(a.nom).localeCompare(String(b.nom)); });
  const th = (k, lib, cls) => '<th' + (cls ? ' class="' + cls + '"' : "") + ' aria-sort="' + (TRI.k === k ? (TRI.sens > 0 ? "ascending" : "descending") : "none") + '"><button class="tri" data-tri="' + k + '">' + esc(lib) + (TRI.k === k ? (TRI.sens > 0 ? " ▲" : " ▼") : "") + "</button></th>";
  const aDecider = RA.suspension === "demander" ? L.filter((c) => c.actif && !c.modele && !c.demo && E(c) === "suspendre" && !(c.facturation && c.facturation.jamaisSuspendre)) : [];
  const demandes = L.filter((c) => c.facturation && (c.facturation.demandes || []).some((q) => !q.traitee));
  const filtre = !!(PAIE || STATUT || SPE || Q), aRegler = L.filter((c) => E(c) === "nonSuivi" && !c.modele && !c.demo);
  return '<div class="tuiles t5">' + tuile(L.length, "Cabinets" + (L.length - act ? " · " + (L.length - act) + " suspendu" + (L.length - act > 1 ? "s" : "") : "") + (filtre ? " · tout afficher" : ""), filtre ? "tous" : "", "tous", "Afficher tous les cabinets (efface les filtres)") +
      tuile(dh(revenu), "Revenu mensuel (TTC)", "vert", "", "Abonnements payants des cabinets actifs (annuel compté au 1/12), TVA comprise") + tuile(nbE(["essai"]), "En essai", "", "essai") +
      tuile(nbE(["renouveler"]), "À renouveler (" + RA.rappel + " j)", nbE(["renouveler"]) ? "orange" : "", "renouveler") + tuile(nbE(["retard", "suspendre"]), "En retard", nbE(["retard", "suspendre"]) ? "rouge" : "", "retard", RA.suspension === "auto" ? "Suspendus automatiquement après " + RA.delai + " jours de retard" : RA.suspension === "jamais" ? "Jamais suspendus automatiquement" : "Après " + RA.delai + " jours de retard, Onco360 vous demande") + "</div>" + MSG +
    // Cabinets à suspendre ? (réglage « me demander ») : la décision vous revient
    (aDecider.length ? '<div class="avert rouge-a"><b>' + aDecider.length + " cabinet" + (aDecider.length > 1 ? "s" : "") + " en retard de plus de " + RA.delai + " jours</b> : à vous de décider. " + aDecider.map((c) => esc(c.nom) + " (" + esc(etatDe(c).lib.toLowerCase()) + ') <button class="lien" data-fiche-o="' + esc(c.id) + '">Ouvrir sa fiche</button>').join(" · ") + ' · <button class="lien" data-reg-abo>Réglages des abonnements</button></div>' : "") +
    (demandes.length ? '<div class="avert bleu-a"><b>' + demandes.length + " demande" + (demandes.length > 1 ? "s" : "") + " des médecins</b> (abonnement) : " + demandes.map((c) => esc(c.nom) + ' <button class="lien" data-fiche-o="' + esc(c.id) + '">Ouvrir sa fiche</button>').join(" · ") + "</div>" : "") +
    (aRegler.length ? '<div class="avert">' + aRegler.length + " cabinet" + (aRegler.length > 1 ? "s" : "") + " sans abonnement réglé (" + aRegler.map((c) => esc(c.nom)).join(", ") + ") : jamais suspendu" + (aRegler.length > 1 ? "s" : "") + ", hors revenu. " + '<button class="lien" data-paie="nonSuivi">Les afficher</button></div>' : "") +
    '<section class="carte"><div class="barre"><div class="recherche"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input id="cQ" type="search" placeholder="Rechercher un cabinet, une ville, un médecin, un e-mail…" value="' + esc(Q) + '"></div>' +
    '<select id="cSt" aria-label="Statut"><option value="">Tous les statuts</option><option value="actif"' + (STATUT === "actif" ? " selected" : "") + '>Actifs</option><option value="susp"' + (STATUT === "susp" ? " selected" : "") + ">Suspendus</option></select>" +
    '<select id="cPa" aria-label="Abonnement"><option value="">Tous les abonnements</option>' + [["essai", "En essai"], ["ajour", "À jour"], ["renouveler", "À renouveler"], ["retard", "En retard"], ["gratuit", "Gratuits"], ["nonSuivi", "Non suivis"]].map(([k, l]) => '<option value="' + k + '"' + (PAIE === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
    (spes.length > 1 ? '<select id="cSp" aria-label="Spécialité"><option value="">Toutes les spécialités</option>' + spes.map((x) => '<option' + (x === SPE ? " selected" : "") + ">" + esc(x) + "</option>").join("") + "</select>" : "") +
    '<button class="clair" data-reg-abo>Réglages des abonnements</button><a class="bt" href="#nouveau">+ Nouveau cabinet</a></div>' + actualiser() +
    '<p class="sous" style="margin:10px 0 0">' + V.length + " cabinet" + (V.length > 1 ? "s" : "") + (V.length !== L.length ? " sur " + L.length : "") + " · aucune donnée médicale, seulement des nombres · cliquez un titre de colonne pour trier.</p></section>" +
    (V.length ? '<section class="carte liste-c"><div class="tableau"><table class="lc"><thead><tr>' + th("nom", "Cabinet") + th("medecin", "Médecin") + th("pack", "Pack") + th("abo", "Abonnement") + th("statut", "Statut") + th("equipe", "Équipe", "n") + th("dossiers", "Dossiers", "n") + th("activite", "Activité") + th("cree", "Créé le") + "</tr></thead><tbody>" + V.map(ligneCabinet).join("") + "</tbody></table></div></section>" : '<section class="carte"><p class="sous">Aucun cabinet ne correspond' + (filtre ? '. <button class="lien" data-paie="tous">Effacer les filtres</button>' : ".") + "</p></section>");
}
// Liste des cabinets (10/10/2026) : une ligne par cabinet ; un clic ouvre sa fiche (fenêtre : informations, équipe, actions)
function ligneCabinet(c) {
  const statut = c.actif ? '<span class="bdg ok">Actif</span>' : '<span class="bdg al">Suspendu</span>';
  return '<tr class="lc-l' + (c.actif ? "" : " susp") + '" data-fiche="' + esc(c.id) + '" tabindex="0"><td data-l="Cabinet"><b>' + esc(c.nom) + "</b>" + (c.demo ? ' <span class="bdg demo">Démonstration</span>' : "") + '<div class="m">' + esc(c.ville || "") + "</div></td>" +
    '<td data-l="Médecin">' + esc(c.titulaire.nom || "—") + '<div class="m">' + esc(c.titulaire.email || "") + "</div></td>" +
    '<td data-l="Pack">' + esc(nomFormule(c.abonnement)) + '<div class="m">' + esc(speDuCab(c) || "") + '</div></td><td data-l="Abonnement">' + badgeAbo(c) + '</td><td data-l="Statut">' + statut + (c.suspenduAuto && !c.actif ? '<div class="m">retard de paiement</div>' : "") + "</td>" +
    '<td data-l="Équipe" class="n">' + (c.equipe ? c.equipe.filter((m) => m.actif).length : c.membres == null ? "?" : c.membres) + '</td><td data-l="Dossiers" class="n">' + (c.patients == null ? "?" : c.patients) + '</td><td data-l="Activité"' + (c.activite && c.activite.derniere ? ' title="' + esc(new Date(c.activite.derniere).toLocaleString("fr-FR") + (c.activite.par ? " · " + c.activite.par : "")) + '"' : "") + ">" + esc(c.activite ? (c.activite.derniere ? ilYa(c.activite.derniere) : "aucune") : "—") + '</td><td data-l="Créé le">' + esc(dfr(c.cree) || "—") + "</td></tr>";
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
    '<div class="formule"><span class="bdg">' + esc(nomFormule(ab)) + "</span>" + (speDuCab(c) ? '<span class="m">' + esc(speDuCab(c)) + "</span>" : "") + "</div>" +
    '<div class="chiffres">' + chiffre(r.medecin || 0, mx.medecin, "Médecins") + chiffre(r.assistante || 0, mx.assistante, "Secrétaires") + chiffre(r.infirmiere || 0, mx.infirmiere, "Infirmières") + (r.comptable || mx.comptable != null ? chiffre(r.comptable || 0, mx.comptable, "Comptables") : "") + chiffre(c.etablissements, mx.etablissements, "Lieux") + chiffre(c.patients, mx.patients, "Dossiers") + "</div>" +
    (c.equipe && c.equipe.length ? '<details class="equipe"><summary>Équipe (' + c.equipe.length + ")</summary>" + c.equipe.slice().sort((a, b) => (b.titulaire ? 1 : 0) - (a.titulaire ? 1 : 0) || String(a.role).localeCompare(String(b.role))).map((m) => '<div class="mb' + (m.actif ? "" : " off") + '"><b>' + esc(m.nom || "—") + '</b> <span class="bdg">' + esc(ROLES_LIB[m.role] || m.role) + (m.titulaire ? " titulaire" : "") + "</span>" + (m.actif ? "" : ' <span class="bdg al">désactivé</span>') + '<div class="m">' + esc(m.email) + "</div></div>").join("") + "</details>" : "") +
    blocAbonnement(c) +
    '<div class="m">Créé le ' + esc(dfr(c.cree) || "—") + (c.activite ? " · dernière activité : " + esc(ilYa(c.activite.derniere)) + (c.activite.par ? " (" + esc(c.activite.par) + ")" : "") + " · " + (c.activite.n30 || 0) + " action" + ((c.activite.n30 || 0) > 1 ? "s" : "") + " en 30 jours" : "") + "</div>" +
    // Actions regroupées (17.3) : gérer · accès · zone sensible
    '<div class="act-g"><div><span class="m">Gérer</span>' + (c.demo ? '<button class="clair petit" data-reinit="' + esc(c.id) + '">Réinitialiser la démo</button>' : "") + '<button class="clair petit" data-info="' + esc(c.id) + '">Modifier</button><button class="clair petit" data-form="' + esc(c.id) + '">Réglage du cabinet</button>' + (c.modele || c.bibliotheque ? "" : '<button class="clair petit" data-modele="' + esc(c.id) + '" title="Ajouter à ce cabinet ce qui lui manque du modèle de sa spécialité (rien de ce qu\'il a modifié n\'est écrasé)">Appliquer le modèle</button>') + '<button class="clair petit" data-jcab="' + esc(c.id) + '" title="Actions de l\'administration sur ce cabinet">Journal</button></div>' +
    (c.modele || !c.titulaire.email ? "" : '<div><span class="m">Accès du médecin</span><button class="clair petit" data-lien="' + esc(c.id) + '">Lien du mot de passe</button><button class="clair petit" data-mail="' + esc(c.titulaire.email) + '">Renvoyer l\'e-mail</button></div>') +
    (c.modele ? "" : '<div class="sensible"><span class="m">Zone sensible</span>' + (c.actif ? '<button class="clair petit rouge-t" data-susp="' + esc(c.id) + '">Suspendre</button>' : '<button class="clair petit" data-react="' + esc(c.id) + '">Réactiver</button><button class="rouge petit" data-suppr="' + esc(c.id) + '">Supprimer</button>') + "</div>") +
    "</div></article>";
}
// Abonnement d'un cabinet (fiche) : état, formule de paiement, prix, échéance, paiements
function blocAbonnement(c) {
  if (c.modele && !c.facturation) return '<div class="abo"><b>Abonnement</b> <span class="m">votre cabinet : aucun abonnement</span></div>';
  const f = c.facturation, E = etatDe(c), P = prixDe(c), mode = f ? (MODES_FACT.find((x) => x[0] === f.mode) || [])[1] : "";
  return '<div class="abo"><div class="abo-h"><b>Abonnement</b> ' + badgeAbo(c) + "</div>" +
    (f ? '<div class="m">' + esc(mode) + (f.mode === "mensuel" || f.mode === "annuel" ? " · " + dh(P.prix) + (P.periode === "an" ? " par an" : " par mois") + (f.prix != null && P.catalogue && f.prix !== P.catalogue ? " (prix du pack : " + dh(P.catalogue) + ")" : "") : "") + (f.note ? " · " + esc(f.note) : "") + "</div>" : '<div class="m">Pas encore de fiche d\'abonnement : « Modifier l\'abonnement » pour la créer.</div>') +
    (E.etat === "retard" || E.etat === "suspendre" ? '<div class="m" style="color:var(--rouge)">' + (E.etat === "retard" && RA.suspension === "auto" && !f.jamaisSuspendre ? "Suspendu automatiquement dans " + Math.max(0, RA.delai - E.jours + 1) + " jour(s) sans paiement." : E.etat === "suspendre" && c.actif && RA.suspension === "demander" && !f.jamaisSuspendre ? "Retard de plus de " + RA.delai + " jours : à vous de décider (Suspendre, dans la zone sensible ci-dessous, ou attendre)." : "En retard : " + suiteRetard(c) + ".") + "</div>" : "") +
    (f && f.jamaisSuspendre ? '<div class="m">Ce cabinet n\'est jamais suspendu automatiquement.</div>' : "") +
    // Relances (18.6) : dernière relance ; « Relancer » quand le cabinet est en retard, à renouveler ou en fin d'essai
    (aRelancer(c) || (f && (f.relances || []).length) ? '<div class="m">' + (derniereRelance(c) ? "Dernière relance : " + esc(derniereRelance(c)) : "Jamais relancé") + (aRelancer(c) ? ' · <button class="lien" data-rel="' + esc(c.id) + '">Relancer</button>' : "") + "</div>" : "") +
    // Demandes du médecin (Mon compte › Abonnement, 18.5) : à traiter
    (f && (f.demandes || []).some((q) => !q.traitee) ? '<div class="avert">' + f.demandes.filter((q) => !q.traitee).map((q) => "<b>Demande du " + esc(new Date(q.le).toLocaleDateString("fr-FR")) + "</b> (" + esc(q.parNom || "titulaire") + ") : " + esc({ renouveler: "renouveler l'abonnement", annuel: "passer à l'annuel", mensuel: "passer au mensuel" }[q.type] || q.type) + (q.message ? " · « " + esc(q.message) + " »" : "") + ' <button class="lien" data-dt="' + esc(c.id) + ":" + esc(q.id) + '">Marquer traitée</button>').join("<br>") + "</div>" : "") +
    (f && f.client && f.client.raison ? '<div class="m">Facturé à : ' + esc([f.client.raison, f.client.ice ? "ICE " + f.client.ice : "", f.client.adresse].filter(Boolean).join(" · ")) + "</div>" : "") +
    '<div class="barre" style="margin-top:6px"><button class="petit" data-paye="' + esc(c.id) + '">Enregistrer un paiement</button><button class="clair petit" data-abo="' + esc(c.id) + '">Modifier l\'abonnement</button><button class="clair petit" data-client="' + esc(c.id) + '">Coordonnées de facturation</button></div>' +
    (f && (f.paiements || []).length ? '<details class="paie"><summary>Paiements (' + f.paiements.length + ")</summary><table class=\"pt\">" + f.paiements.slice().reverse().map((p) => "<tr><td>" + esc(dfr(p.d)) + "</td><td class=\"n\">" + esc(dh(p.m)) + "</td><td>" + (p.periode === "an" ? "1 an" : "1 mois") + " · " + esc((MOYENS.find((x) => x[0] === p.moyen) || [])[1] || p.moyen) + (p.ref ? " · " + esc(p.ref) : "") + '</td><td class="m">→ ' + esc(dfr(p.apres)) + "</td><td>" + (p.facture ? '<button class="lien petit" data-vfac="' + esc(p.factureId || "") + '" data-num="' + esc(p.facture) + '">' + esc(p.facture) + "</button>" : '<button class="lien petit" data-facturer="' + esc(c.id) + ":" + esc(p.id) + '">Créer la facture</button>') + '</td><td><button class="lien-r petit" data-rp="' + esc(c.id) + ":" + esc(p.id) + '" title="' + (p.facture ? "Retirer le paiement : un avoir annule sa facture" : "Retirer le paiement") + '">Retirer</button></td></tr>').join("") + "</table></details>" : "") +
    (f && (f.journal || []).length ? '<details class="paie"><summary>Historique</summary>' + f.journal.slice(-30).reverse().map((j) => '<div class="m">' + esc(new Date(j.le).toLocaleDateString("fr-FR")) + " · " + esc(j.txt) + "</div>").join("") + "</details>" : "") + "</div>";
}
async function envoyerFacturation(c, d, message) {
  const o = await serveur("facturationCabinet", Object.assign({ espace: c.id }, d));
  c.facturation = o.facturation; (o.factures || []).forEach((x) => FACT.unshift(x)); if (o.actif && !c.actif) { c.actif = true; c.suspenduLe = ""; c.suspenduAuto = false; }
  fermer(true); RES = message; dessiner(); ouvrirFiche(c);
}
function ouvrirAbonnement(c) {
  if (!c) return;
  const f = c.facturation || {}, F = formuleDe(c.abonnement) || {}, P = F.prix || PRIX0[c.abonnement && c.abonnement.formule] || {};
  fenetre("<h2>Abonnement de « " + esc(c.nom) + ' »</h2><p class="sous">Pack ' + esc(nomFormule(c.abonnement)) + " : " + dh(P.mois) + " par mois ou " + dh(P.an) + " par an (prix du pack, modifiable dans Par spécialité). Laissez le prix vide pour garder celui du pack ; indiquez-en un pour une remise.</p>" +
    '<div class="form"><div><label for="abMode">Formule de paiement</label><select id="abMode">' + MODES_FACT.map(([k, l]) => '<option value="' + k + '"' + ((f.mode || "essai") === k ? " selected" : "") + ">" + esc(l) + "</option>").join("") + "</select></div>" +
    '<div id="abPrixZ"><label for="abPrix">Prix par période (DH, vide = prix du pack)</label><input id="abPrix" type="number" min="0" value="' + (f.prix == null ? "" : f.prix) + '"></div>' +
    '<div id="abEssaiZ"><label for="abEssai">Fin de l\'essai</label><input id="abEssai" type="date" value="' + esc(f.essaiFin || ajouterJours(JOUR(), RA.essai)) + '"></div>' +
    '<div id="abEchZ"><label for="abEch">Échéance (fin de la période payée)</label><input id="abEch" type="date" value="' + esc(f.echeance || "") + '"></div>' +
    '<div class="large"><label class="rg-c"><input type="checkbox" id="abJam"' + (f.jamaisSuspendre ? " checked" : "") + '><span>Ne jamais suspendre ce cabinet automatiquement (même en retard)</span></label></div>' +
    '<div class="large"><label for="abNote">Note (facultatif)</label><input id="abNote" value="' + esc(f.note || "") + '" placeholder="ex. remise de lancement, ami, contrat signé le…"></div></div>' +
    '<p class="m" id="abAide"></p><div class="pied"><button id="abOk">Enregistrer</button><button class="clair" id="abAnn">Fermer</button></div>');
  const maj = () => { const m = $("abMode").value; $("abPrixZ").style.display = m === "mensuel" || m === "annuel" ? "" : "none"; $("abEssaiZ").style.display = m === "essai" ? "" : "none"; $("abEchZ").style.display = m === "gratuit" || m === "essai" ? "none" : "";
    $("abAide").textContent = m === "gratuit" ? "Gratuit, sans limite de durée : jamais suspendu, compté hors revenu." : m === "essai" ? "Essai gratuit : à la fin de l'essai sans paiement, le cabinet passe en retard ; ensuite : " + suiteRetard(c) + "." : "Échéance dépassée : " + suiteRetard(c) + " (réglable dans « Réglages des abonnements »). Un cabinet suspendu pour retard est réactivé dès qu'un paiement est enregistré."; };
  $("abMode").onchange = maj; maj(); $("abAnn").onclick = fermer;
  $("abOk").onclick = async () => {
    const r = { mode: $("abMode").value, prix: $("abPrix").value, essaiFin: $("abEssai").value, echeance: $("abEch").value, note: $("abNote").value, jamaisSuspendre: $("abJam").checked };
    if ((r.mode === "mensuel" || r.mode === "annuel") && !r.echeance) { alert("Indiquez l'échéance (fin de la période déjà payée, ou aujourd'hui si rien n'est encore payé)."); return; }
    const b = $("abOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { await envoyerFacturation(c, { action: "regler", reglage: r }, "Abonnement de « " + esc(c.nom) + " » enregistré."); } catch (e) { b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}
function ouvrirClient(c) {
  if (!c) return;
  const k = (c.facturation && c.facturation.client) || {};
  fenetre("<h2>Coordonnées de facturation · " + esc(c.nom) + '</h2><p class="sous">Ce qui figurera sur les factures de ce cabinet (raison sociale, ICE…). Vide = nom du cabinet et du médecin titulaire.</p>' +
    '<div class="form">' + ch("clRai", "Raison sociale (ou nom du médecin)", c.nom, "", k.raison) + ch("clIce", "ICE (15 chiffres)", "", "", k.ice) + ch("clIf", "Identifiant fiscal (IF)", "", "", k.if) + ch("clMail", "E-mail de facturation", c.titulaire.email || "", "email", k.email) +
    '<div class="large"><label for="clAdr">Adresse de facturation</label><input id="clAdr" value="' + esc(k.adresse || "") + '" placeholder="' + esc([c.adresse, c.ville].filter(Boolean).join(", ")) + '"></div></div>' +
    '<p class="m" id="clAide"></p><div class="pied"><button id="clOk">Enregistrer</button><button class="clair" id="clAnn">Fermer</button></div>');
  $("clAnn").onclick = fermer;
  $("clOk").onclick = async () => {
    const d = { raison: $("clRai").value, ice: $("clIce").value, if: $("clIf").value, email: $("clMail").value, adresse: $("clAdr").value }, ice = d.ice.replace(/\s/g, "");
    if (ice && !/^\d{15}$/.test(ice) && !confirm("L'ICE marocain compte 15 chiffres (ici : " + ice.length + "). Enregistrer quand même ?")) return;
    const b = $("clOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { await envoyerFacturation(c, { action: "client", client: d }, "Coordonnées de facturation de « " + esc(c.nom) + " » enregistrées."); } catch (e) { b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}
function ouvrirPaiement(c) {
  if (!c) return;
  const f = c.facturation || {}, an = f.mode === "annuel", F = formuleDe(c.abonnement) || {}, P = F.prix || PRIX0[c.abonnement && c.abonnement.formule] || {};
  const montant = (per) => (f.prix != null && (per === "an") === an ? f.prix : per === "an" ? P.an : P.mois);
  fenetre("<h2>Paiement reçu · " + esc(c.nom) + '</h2><p class="sous">Le paiement prolonge l\'échéance d\'un mois ou d\'un an, à partir de l\'échéance précédente' + (c.actif ? "" : " ; le cabinet est réactivé") + ".</p>" +
    '<div class="form"><div><label for="pD">Date de réception</label><input id="pD" type="date" value="' + JOUR() + '"></div>' +
    '<div><label for="pPer">Période payée</label><select id="pPer"><option value="mois"' + (an ? "" : " selected") + '>1 mois</option><option value="an"' + (an ? " selected" : "") + ">1 an</option></select></div>" +
    '<div><label for="pM">Montant (DH)</label><input id="pM" type="number" min="0" value="' + (montant(an ? "an" : "mois") || "") + '"></div>' +
    '<div><label for="pMoy">Moyen</label><select id="pMoy">' + MOYENS.map(([k, l]) => '<option value="' + k + '">' + esc(l) + "</option>").join("") + "</select></div>" +
    '<div><label for="pRef">Référence (facultatif)</label><input id="pRef" placeholder="n° de chèque, de virement…"></div>' +
    '<div><label for="pNote">Note (facultatif)</label><input id="pNote"></div></div>' +
    '<p class="m" id="pAp"></p><div class="pied"><button id="pOk">Enregistrer le paiement</button><button class="clair" id="pAnn">Fermer</button></div>');
  const ap = () => { $("pAp").textContent = "Nouvelle échéance : " + dfr(prolonger(f, $("pD").value || JOUR(), $("pPer").value)); };
  $("pPer").onchange = () => { $("pM").value = montant($("pPer").value) || ""; ap(); }; $("pD").onchange = ap; ap(); $("pAnn").onclick = fermer;
  $("pOk").onclick = async () => {
    const p = { d: $("pD").value, m: $("pM").value, periode: $("pPer").value, moyen: $("pMoy").value, ref: $("pRef").value, note: $("pNote").value };
    if (!p.d || !(Number(p.m) > 0)) { alert("Indiquez la date et le montant."); return; }
    const b = $("pOk"); b.disabled = true; b.textContent = "Enregistrement…";
    try { const n0 = FACT.length; await envoyerFacturation(c, { action: "paiement", paiement: p }, "Paiement de " + esc(dh(p.m)) + " enregistré pour « " + esc(c.nom) + " »."); if (FACT.length > n0) RES += " Facture " + esc(FACT[0].numero) + " créée."; else RES += " Facture non créée : complétez « Mon entreprise » (Comptabilité), puis « Créer la facture » dans les paiements du cabinet."; dessiner(); ouvrirFiche(c); } catch (e) { b.disabled = false; b.textContent = "Enregistrer le paiement"; alert("Enregistrement impossible : " + e.message); }
  };
}
function brancherCabinets() {
  document.querySelectorAll("[data-tri]").forEach((b) => { b.onclick = () => { const k = b.dataset.tri; TRI = { k, sens: TRI.k === k ? -TRI.sens : k === "cree" || k === "activite" || k === "dossiers" || k === "equipe" ? -1 : 1 }; dessiner(); }; });
  document.querySelectorAll("[data-paie]").forEach((b) => { b.onclick = () => { if (b.dataset.paie === "tous") { PAIE = ""; STATUT = ""; SPE = ""; Q = ""; } else PAIE = PAIE === b.dataset.paie ? "" : b.dataset.paie; dessiner(); }; b.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); b.onclick(); } }; });
  if ($("cPa")) $("cPa").onchange = (e) => { PAIE = e.target.value; dessiner(); };
  document.querySelectorAll("[data-fiche]").forEach((tr) => { const o = () => ouvrirFiche(cab(tr.dataset.fiche)); tr.onclick = o; tr.onkeydown = (e) => { if (e.key === "Enter") o(); }; });
  const q = $("cQ"); if (q) q.oninput = () => { Q = q.value; const pos = q.selectionStart; dessiner(); const q2 = $("cQ"); q2.focus(); q2.setSelectionRange(pos, pos); };
  if ($("cSt")) $("cSt").onchange = (e) => { STATUT = e.target.value; dessiner(); };
  if ($("cSp")) $("cSp").onchange = (e) => { SPE = e.target.value; dessiner(); };
}
// Boutons d'action d'un cabinet (dans sa fiche)
function brancherActions(R) {
  const on = (sel, f) => R.querySelectorAll(sel).forEach((b) => { b.onclick = () => f(b); });
  on("[data-info]", (b) => ouvrirInfos(cab(b.dataset.info)));
  on("[data-form]", (b) => ouvrirFormule(cab(b.dataset.form)));
  on("[data-modele]", (b) => ouvrirAppliquerModele(cab(b.dataset.modele)));
  on("[data-lien]", (b) => lien(b, cab(b.dataset.lien)));
  on("[data-mail]", (b) => renvoyer(b, b.dataset.mail));
  on("[data-susp]", (b) => etat(b, cab(b.dataset.susp), false));
  on("[data-react]", (b) => etat(b, cab(b.dataset.react), true));
  on("[data-suppr]", (b) => supprimer(b, cab(b.dataset.suppr)));
  on("[data-reinit]", (b) => reinitDemo(b));
  on("[data-paye]", (b) => ouvrirPaiement(cab(b.dataset.paye)));
  on("[data-jcab]", (b) => { JF = Object.assign(JF, { cab: b.dataset.jcab, periode: "tout" }); JL = null; fermer(true); location.hash = "journal"; });
  on("[data-abo]", (b) => ouvrirAbonnement(cab(b.dataset.abo)));
  on("[data-client]", (b) => ouvrirClient(cab(b.dataset.client)));
  on("[data-dt]", async (b) => { const [id, qid] = b.dataset.dt.split(":"), c = cab(id); b.disabled = true; try { await envoyerFacturation(c, { action: "demandeTraitee", id: qid }, "Demande marquée traitée."); } catch (e) { b.disabled = false; alert("Impossible : " + e.message); } });
  on("[data-facturer]", async (b) => { const [id, pid] = b.dataset.facturer.split(":"), c = cab(id); if (editeurIncomplet(EDITEUR).length) { alert("Complétez d'abord « Mon entreprise » (onglet Comptabilité) : raison sociale, ICE, IF, adresse, ville."); return; }
    b.disabled = true; try { await envoyerFacturation(c, { action: "facturer", id: pid }, "Facture créée."); } catch (e) { b.disabled = false; alert("Impossible : " + e.message); } });
  on("[data-rp]", async (b) => { const [id, pid] = b.dataset.rp.split(":"), c = cab(id), p = c && ((c.facturation || {}).paiements || []).find((x) => x.id === pid); if (!p || !confirm("Retirer le paiement du " + dfr(p.d) + " (" + dh(p.m) + ") ?")) return;
    b.disabled = true; try { await envoyerFacturation(c, { action: "retirerPaiement", id: pid }, "Paiement retiré."); } catch (e) { b.disabled = false; alert("Impossible : " + e.message); } });
}
// ───── Cabinet de démonstration (étape 9 S3, 09/10/2026) ─────
async function creerDemo() {
  const email = prompt("Adresse e-mail du compte de démonstration (identifiant de connexion ; une adresse à vous, par exemple avec « +demo ») :", "ritabentahila+demo@gmail.com");
  if (!email || !email.trim()) return;
  const b = $("dCree"); b.disabled = true; b.textContent = "Création du cabinet et des 8 patients fictifs…";
  try {
    const o = await serveur("creerCabinetDemo", { email: email.trim().toLowerCase() });
    RES = "Cabinet de démonstration créé : " + o.patients + " patients fictifs, " + o.protocoles + " fichiers de protocoles. Pour vous y connecter, utilisez « Lien du mot de passe » dans sa fiche (compte " + esc(email.trim()) + ").";
    CABINETS = null; GARDER = true; location.hash = "cabinets"; dessiner(); charger(); // retour à la liste (la carte est dans Nouveau cabinet depuis le 10/10)
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
      (B.existe ? '<div class="chiffres" style="grid-template-columns:repeat(4,minmax(0,1fr))">' + LIBS.map(([k, lib]) => (B.nb && B.nb[k] != null ? "<div><b>" + B.nb[k] + "</b><span>" + esc(lib) + "</span></div>" : '<div title="La liste fournie par Onco360, pas encore modifiée"><b class="dep">liste Onco360</b><span>' + esc(lib) + "</span></div>")).join("") + "</div>" : '<p class="m">' + (B.id === "bib-oncologie" ? "Sera créée à partir de la copie mise de côté le 09/10 (bibliothèque du Dr Bentahila)." : "Sera créée vide : vous la remplirez (les modules de cette spécialité restent à construire).") + "</p>") +
      '<div class="act"><button data-bib="' + esc(B.id) + '">' + (B.existe ? "Ouvrir et modifier" : "Créer et ouvrir") + "</button>" +
      // P11 (18/10/2026) : la bibliothèque du cabinet Bentahila recopiée dans la référence d'oncologie
      (B.id === "bib-oncologie" && B.existe ? '<button class="clair" data-copie="1" title="Remplace la bibliothèque de référence par celle du cabinet du Dr Bentahila">Recopier depuis le cabinet Bentahila</button>' +
        // P9 (18/10/2026) : version publiée = proposée aux cabinets déjà créés (chacun choisit protocole par protocole)
        '<button class="clair" data-publier="1" title="Les cabinets déjà créés verront les protocoles nouveaux ou différents et choisiront">Publier une version' + (B.version ? " (actuelle : v" + B.version + ")" : "") + "</button>" : "") + "</div>" +
      (B.id === "bib-oncologie" && (B.versions || []).length ? '<div class="m" style="margin-top:6px">' + B.versions.slice().reverse().map((v) => "v" + v.n + " (" + esc(dfr(String(v.le).slice(0, 10))) + ") : " + esc(v.notes)).join("<br>") + "</div>" : "") + "</article>");
}
function brancherReference() {
  document.querySelectorAll("[data-publier]").forEach((b) => { b.onclick = async () => {
    const notes = prompt("Publier une nouvelle version de la bibliothèque de référence.\n\nCe qui a changé (journal des changements, lu par les cabinets) :", "");
    if (!notes || !notes.trim()) return;
    b.disabled = true; b.textContent = "Publication…";
    try { const o = await serveur("referencePublier", { notes }); b.textContent = "Version " + o.version + " publiée"; RES = "Bibliothèque de référence : version " + o.version + " publiée ; les cabinets la verront dans Protocoles."; CABINETS = null; }
    catch (e) { b.disabled = false; b.textContent = "Publier une version"; alert("Impossible : " + e.message); }
  }; });
  document.querySelectorAll("[data-copie]").forEach((b) => { b.onclick = async () => {
    if (!confirm("Recopier la bibliothèque du cabinet du Dr Bentahila dans la bibliothèque de référence d'Oncologie – Radiothérapie ?\n\nProtocoles, médicaments, ordonnances types, analyses, bilans, examens, courriers et paramètres de base remplacent ceux de la référence (étoiles retirées). Jamais : patients, correspondants, prix, lieux, équipe, documentation.\nLes cabinets déjà créés ne changent pas ; les prochains reçoivent cette copie.")) return;
    b.disabled = true; b.textContent = "Copie…";
    try { const o = await serveur("referenceDepuisCabinet"); b.textContent = "Recopiée : " + o.nb.protocoles + " protocoles"; RES = "Bibliothèque de référence recopiée depuis le cabinet du Dr Bentahila (" + o.nb.protocoles + " protocoles)."; }
    catch (e) { b.disabled = false; b.textContent = "Recopier depuis le cabinet Bentahila"; alert("Impossible : " + e.message); }
  }; });
  document.querySelectorAll("[data-bib]").forEach((b) => { b.onclick = async () => {
    if (!confirm("La bibliothèque s'ouvre dans Onco360 (Protocoles et Paramètres), à la place de l'Administration.\nPour revenir : lien « Retour à l'Administration » du menu.")) return;
    b.disabled = true; b.textContent = "Ouverture…";
    try { const o = await serveur("bibliothequeOuvrir", { bib: b.dataset.bib }); location.href = "v2.html?espace=" + encodeURIComponent(o.espace) + "#protocoles"; }
    catch (e) { b.disabled = false; b.textContent = "Ouvrir et modifier"; alert("Impossible : " + e.message); }
  }; });
}

// ───── Modèle de la spécialité (R-A6, 18/10/2026, demande du cabinet du 17/10) ─────
// Le cabinet du Dr Bentahila est le modèle. « Reprendre » : ses réglages effectifs remplacent le modèle de la spécialité (à la demande,
// jamais en continu ; aperçu des différences partie par partie, copie de l'état précédent, journal) ; les cabinets neufs reçoivent ce modèle.
// « Appliquer le modèle » (fiche d'un cabinet) : parties cochées, aperçu, rien de ce que le cabinet a modifié n'est écrasé, ce qui manque est
// ajouté. Fonctions serveur modeleReprendre / modeleAppliquer (functions/index.js, logique functions/modele.js).
const PARTIES_MODELE = [["fiche", "Fiche patient"], ["consultation", "Formulaires de consultation (et formulaire de chaque type)"], ["typesConsult", "Types de consultation"],
  ["parametres", "Paramètres de départ (horaires, fériés, WhatsApp, couleurs, types de documents et de tâches, tâches automatiques, RCP, listes, impression, alertes)"],
  ["bibliotheques", "Bibliothèques de prescription et modèles de documents de radiothérapie"], ["reglage", "Réglage du cabinet (menu, cartes, onglets des Paramètres, fonctions)"]];
const cabModele = () => (CABINETS || []).find((c) => c.modele);
function carteModele() {
  const m = cabModele(); if (!m || speDuCab(m) !== SPEC) return "";
  return '<section class="carte"><h3>Modèle de la spécialité</h3><p class="sous">Le cabinet « ' + esc(m.nom) + ' » est le modèle : ses réglages (fiche patient, formulaires et types de consultation, paramètres de départ, bibliothèques de prescription et modèles de documents de RT, menu, cartes et fonctions) sont repris ici <b>quand vous le décidez</b>, pas en continu. Jamais repris : patients, équipe, lieux, correspondants, tarifs, en-tête, profils et signatures, abonnement, Google Agenda, horaires et absences.</p>' +
    '<p class="m" id="modEtat">État du modèle : lecture…</p><div class="barre"><button id="modVoir">Voir les différences et reprendre</button></div></section>';
}
const ligneDiff = (d) => "<tr><td>" + esc(d.lib.split(" (")[0]) + '</td><td class="n">' + (d.n || "—") + "</td><td>" + esc(d.resume) + "</td></tr>";
const tableDiffs = (diffs) => '<div class="tableau"><table class="lc"><thead><tr><th>Partie</th><th class="n">Différences</th><th>Détail</th></tr></thead><tbody>' + diffs.map(ligneDiff).join("") + "</tbody></table></div>";
async function etatModele() {
  try { const o = await serveur("modeleReprendre", {}); const e = $("modEtat"); if (!e) return;
    e.textContent = (o.repris ? "Modèle repris le " + dfr(String(o.repris.le).slice(0, 10)) : "Modèle jamais repris du cabinet") + " ; " + (o.n ? o.n + " différence" + (o.n > 1 ? "s" : "") + " depuis." : "aucune différence depuis."); }
  catch (er) { const e = $("modEtat"); if (e) e.textContent = "État du modèle illisible : " + er.message; }
}
async function ouvrirReprendreModele() {
  fenetre('<h2>Reprendre le modèle</h2><p class="sous">Lecture des réglages du cabinet modèle…</p>');
  let o; try { o = await serveur("modeleReprendre", {}); } catch (er) { fenetre('<h2>Reprendre le modèle</h2><p class="err">' + esc(er.message) + "</p>"); return; }
  fenetre("<h2>Reprendre le modèle de « " + esc(o.specialite) + ' »</h2><p class="sous">' + (o.repris ? "Dernière reprise : " + esc(dfr(String(o.repris.le).slice(0, 10))) + ". " : "") + "Ce qui changerait dans le modèle (ce que reçoivent les cabinets neufs ; les cabinets déjà créés ne changent pas tant que vous n'y appliquez pas le modèle) :</p>" +
    tableDiffs(o.diffs) + '<p class="m">L\'état actuel du modèle est d\'abord mis de côté (copie), et la reprise est notée au journal.</p><div class="barre"><button id="modOk"' + (o.n ? "" : " disabled") + ">Reprendre comme modèle</button><button class=\"clair\" id=\"modNon\">Fermer</button></div>");
  $("modNon").onclick = () => fermer(true);
  $("modOk").onclick = async () => { const b = $("modOk"); b.disabled = true; b.textContent = "Reprise…";
    try { const r = await serveur("modeleReprendre", { confirmer: true }); fermer(true); RES = "Modèle de « " + r.specialite + " » repris du cabinet modèle (" + r.n + " différence" + (r.n > 1 ? "s" : "") + ")."; dessiner(); }
    catch (er) { b.disabled = false; b.textContent = "Reprendre comme modèle"; alert("Impossible : " + er.message); } };
}
function ouvrirAppliquerModele(c) {
  if (!c) return;
  fenetre("<h2>Appliquer le modèle à « " + esc(c.nom) + ' »</h2><p class="sous">Ce qui manque au cabinet est ajouté depuis le modèle de sa spécialité ; <b>rien de ce que le cabinet a modifié n\'est écrasé</b>. Fiche patient et formulaires : ceux du modèle, sans rien retirer, les retouches du cabinet restent par-dessus.</p>' +
    '<div class="form" style="grid-template-columns:1fr">' + PARTIES_MODELE.map(([k, l]) => '<label style="font-weight:normal"><input type="checkbox" data-mp="' + k + '" checked style="width:auto;margin-right:6px">' + esc(l) + "</label>").join("") +
    '<label style="font-weight:normal" class="m"><input type="checkbox" disabled style="width:auto;margin-right:6px">Correspondants · Tarifs des consultations : jamais dans le modèle (propres à chaque cabinet)</label></div>' +
    '<div id="mpRes"></div><div class="barre"><button id="mpVoir">Voir ce qui serait ajouté</button><button class="clair" id="mpNon">Fermer</button></div>');
  $("mpNon").onclick = () => fermer(true);
  const parties = () => [...document.querySelectorAll("[data-mp]:checked")].map((i) => i.dataset.mp);
  $("mpVoir").onclick = async () => { const b = $("mpVoir"); if (!parties().length) { $("mpRes").innerHTML = '<p class="err">Cochez au moins une partie.</p>'; return; } b.disabled = true; b.textContent = "Lecture…";
    try { const o = await serveur("modeleAppliquer", { espace: c.id, parties: parties() });
      $("mpRes").innerHTML = tableDiffs(o.diffs) + (o.n ? '<p class="m">L\'état actuel du cabinet est d\'abord mis de côté (copie), et l\'application est notée au journal.</p><div class="barre"><button id="mpOk">Appliquer</button></div>' : '<p class="m">Rien à ajouter : le cabinet a déjà tout le modèle.</p>');
      if ($("mpOk")) $("mpOk").onclick = async () => { const k = $("mpOk"); k.disabled = true; k.textContent = "Application…";
        try { const r = await serveur("modeleAppliquer", { espace: c.id, parties: parties(), confirmer: true }); fermer(true); RES = "Modèle appliqué à « " + c.nom + " » (" + r.n + " ajout" + (r.n > 1 ? "s" : "") + ")."; dessiner(); }
        catch (er) { k.disabled = false; k.textContent = "Appliquer"; alert("Impossible : " + er.message); } }; }
    catch (er) { $("mpRes").innerHTML = '<p class="err">' + esc(er.message) + "</p>"; }
    finally { b.disabled = false; b.textContent = "Voir ce qui serait ajouté"; } };
}
// ───── Fenêtre (réglages d'un cabinet, lien du mot de passe) ─────
function fenetre(html) {
  $("modal").innerHTML = '<div class="boite" role="dialog" aria-modal="true"><button class="x" id="mX" aria-label="Fermer">✕</button>' + html + "</div>";
  $("modal").classList.remove("cache"); document.body.classList.add("bloque");
  $("mX").onclick = fermer; $("modal").onclick = (e) => { if (e.target === $("modal")) fermer(); };
}
// GARDE : fonction appelée avant de fermer la fenêtre (réglage modifié et non enregistré : confirmation) ; fermer(true) ferme sans demander
let GARDE = null;
function fermer(force) { if (force !== true && GARDE && !GARDE()) return; GARDE = null; $("modal").classList.add("cache"); $("modal").innerHTML = ""; document.body.classList.remove("bloque"); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("modal").classList.contains("cache")) fermer(); });

// ───── Onglet Nouveau cabinet ─────
function htmlNouveau() {
  SPEF = SPECIALITES.indexOf(SPEF) >= 0 ? SPEF : SPECIALITES[0];
  const def = (packsDe(SPEF)[0] || [""])[0];
  return '<section class="carte"><h2>Nouveau cabinet</h2><p class="sous">Pour un médecin qui utilisera Onco360 avec ses propres patients. Il reçoit un e-mail pour choisir son mot de passe (souvent classé en indésirables : vous pouvez aussi lui envoyer le lien vous-même, bouton « Lien du mot de passe » de sa fiche, onglet Cabinets), puis il est guidé à sa première connexion.</p>' +
    '<h3 class="st">Le cabinet</h3><div class="form">' + ch("aCab", "Nom du cabinet ou de la clinique", "ex. Cabinet d'oncologie Agdal") + ch("aVil", "Ville", "ex. Rabat") + "</div>" +
    '<h3 class="st">Le médecin titulaire</h3><div class="form">' + ch("aPre", "Prénom") + ch("aNom", "Nom") + ch("aMail", "E-mail (identifiant de connexion)", "", "email") + ch("aTel", "Téléphone (WhatsApp)", "06…", "tel") + "</div>" +
    '<h3 class="st">Spécialité et pack</h3><div class="form"><div><label for="aSpe">Spécialité</label><select id="aSpe">' + SPECIALITES.map((x) => "<option" + (x === SPEF ? " selected" : "") + ">" + esc(x) + "</option>").join("") + '</select></div><div><label for="aFor">Pack</label><select id="aFor">' + optionsFormules(packsDe(SPEF).some(([k]) => k === "onco-pro") ? "onco-pro" : def, SPEF) + "</select></div></div>" +
    '<div id="aApercu"></div>' +
    '<h3 class="st">Abonnement</h3><div class="form"><div><label for="aFact">Formule de paiement</label><select id="aFact">' + MODES_FACT.map(([k, l]) => '<option value="' + k + '">' + esc(k === "essai" ? l + " de " + RA.essai + " jours" : l) + "</option>").join("") + '</select></div><div class="m" id="aFactAide" style="align-self:end"></div></div>' +
    '<div style="margin-top:14px"><button id="aOk">Créer le cabinet</button></div><div id="aRes"></div></section>' +
    // Cabinet de démonstration (déplacé ici le 10/10/2026, 18.1)
    ((CABINETS || []).some((c) => c.demo) ? "" : '<section class="carte demo-c"><h2>Cabinet de démonstration</h2><p class="sous">Un cabinet rempli de 8 patients fictifs (PATIENT TEST 1 à 8 : chimiothérapies, radiothérapies, rendez-vous, consultations), pour les démonstrations, les guides et les captures d\'écran. Aucune donnée réelle.</p><button id="dCree">Créer le cabinet de démonstration</button></section>');
}
// Ce que reçoit un cabinet neuf : la bibliothèque et les paramètres de base de sa spécialité, sa fiche patient et son formulaire de consultation
const recu = (spe) => '<p class="recu"><b>Le cabinet reçoit</b> la bibliothèque et les paramètres de base de « ' + esc(spe) + ' » (protocoles, médicaments, ordonnances types, analyses et bilans, examens, courriers, documentation, jours fériés, diagnostics, mutuelles, horaires, WhatsApp, tâches automatiques, RCP, impression, alertes, tarifs de radiothérapie), sa fiche patient et son formulaire de consultation. <b>Il ne reçoit jamais</b> de patients, de correspondants, de lieux d\'exercice, de prix de consultation ni de données d\'un autre cabinet.</p>';
const resumeFormule = (k) => { const F = FORMULES_()[k]; if (!F) return '<p class="m apercu">Aucun pack pour cette spécialité : créez-en un dans Par spécialité.</p>'; const P = F.prix || PRIX0[k] || {}; return '<p class="m apercu"><b>Prix :</b> ' + esc(dh(P.mois)) + " par mois ou " + esc(dh(P.an)) + " par an (TTC, TVA 20 % comprise)<br><b>Modules :</b> " + esc(MODULES.filter((m) => F.modules.indexOf(m[0]) >= 0).map((m) => m[1]).join(" · ")) + "<br><b>Limites :</b> " + esc(texteLimites(F.max)) + "</p>" + recu(specialiteDe(F.specialite)); };
// Limites lisibles (A4, 17.1) : « 1 médecin · 2 secrétaires · 0 infirmière » puis « sans limite : comptables, dossiers patients »
const NOMS_MAX = { medecin: ["médecin", "médecins"], assistante: ["secrétaire", "secrétaires"], infirmiere: ["infirmière", "infirmières"], comptable: ["comptable", "comptables"], etablissements: ["lieu d'exercice", "lieux d'exercice"], patients: ["dossier patient", "dossiers patients"] };
function texteLimites(max) {
  const m = max || {}, fix = ROLES_MAX.filter(([r]) => m[r] != null && m[r] !== ""), libre = ROLES_MAX.filter(([r]) => m[r] == null || m[r] === "");
  return fix.map(([r]) => { const n = Number(m[r]); return n + " " + NOMS_MAX[r][n > 1 ? 1 : 0]; }).join(" · ") + (libre.length ? (fix.length ? " · " : "") + "sans limite : " + libre.map(([r]) => NOMS_MAX[r][1]).join(", ") : "");
}
function brancherNouveau() {
  const ap = () => { $("aApercu").innerHTML = resumeFormule($("aFor").value); };
  $("aSpe").onchange = () => { SPEF = $("aSpe").value; $("aFor").innerHTML = optionsFormules((packsDe(SPEF)[0] || [""])[0], SPEF); ap(); };
  $("aFor").onchange = ap; ap();
  if ($("dCree")) $("dCree").onclick = creerDemo;
  const af = () => { const m = $("aFact").value; $("aFactAide").textContent = m === "essai" ? "Jusqu'au " + dfr(ajouterJours(JOUR(), RA.essai)) + ", puis paiement attendu." : m === "gratuit" ? "Jamais suspendu (amis, partenaires)." : "Premier paiement à enregistrer dans sa fiche."; };
  $("aFact").onchange = af; af();
  $("aOk").onclick = creer;
}
async function creer() {
  const v = (i) => $(i).value.trim(), d = { cabinet: v("aCab"), prenom: v("aPre"), nom: v("aNom"), email: v("aMail").toLowerCase(), telephone: v("aTel"), formule: $("aFor").value, modeFacturation: $("aFact").value }, ville = v("aVil"), res = $("aRes");
  res.innerHTML = "";
  if (!d.formule || !FORMULES_()[d.formule]) { res.innerHTML = '<p class="err">Choisissez un pack (aucun pack pour cette spécialité : créez-en un dans Par spécialité).</p>'; return; }
  if (!d.cabinet || !d.nom || !d.email) { res.innerHTML = '<p class="err">Indiquez au moins le nom du cabinet, le nom du médecin et son e-mail.</p>'; return; }
  if (!confirm("Créer le cabinet « " + d.cabinet + " » pour " + [d.prenom, d.nom].join(" ") + " (" + d.email + ") ?")) return;
  const b = $("aOk"); b.disabled = true; b.textContent = "Création…";
  try {
    const o = await serveur("creerCabinet", d);
    if (ville) await serveur("infosCabinet", { espace: o.espace, nom: d.cabinet, ville }).catch(() => {});
    let mail = "";
    if (!o.existant) { try { await sendPasswordResetEmail(auth, d.email); mail = "Un e-mail a été envoyé à " + d.email + " pour choisir le mot de passe (vérifier aussi les indésirables)."; } catch (e) { mail = "L'e-mail du mot de passe n'a pas pu partir (" + e.message + ") : utilisez « Lien du mot de passe » sur sa carte."; } }
    else mail = "Ce compte existait déjà : la personne garde son mot de passe.";
    RES = "Cabinet « " + esc(d.cabinet) + " » créé (bibliothèque de la spécialité copiée : " + o.protocoles + " fichiers de protocoles). " + esc(mail) + " Adresse à lui donner : <b>" + esc(location.origin) + "</b>";
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

const fleches = (l, i) => '<span class="fl"><button class="clair petit" data-haut="' + l + ":" + i + '"' + (i ? "" : " disabled") + ' aria-label="Monter">↑</button><button class="clair petit" data-bas="' + l + ":" + i + '" aria-label="Descendre">↓</button></span>';
const caseC = (attr, on, txt) => '<label class="rg-c"><input type="checkbox" ' + attr + (on ? " checked" : "") + "><span>" + txt + "</span></label>";

// ───── Écran de réglage (10/10/2026 ; refait le 10/10, 17.2) : le même pour un pack et pour un cabinet ─────
// Sous-onglets : Modules et limites · Menu et tableau de bord · Paramètres et bibliothèques · Fiche et consultation (cabinet) ;
// bouton Enregistrer toujours visible, « Modifications non enregistrées » (confirmation avant de fermer) ; pour un cabinet, pastille
// « retouché » sur ce qui diffère du pack (fiche et consultation : de la spécialité) et « Revenir au pack » bloc par bloc.
// o = { titre, intro, A { formule, modules, max }, R (réglage complet), spe(), avecPack, nom (pack), fiche (cabinet : éditeurs de
// fiche et de consultation), baseFiche(), baseConsult(), compte(k), enregistrer(A, R, nom) }.
let ONGLET_REG = "modules";
function editeurReglage(o) {
  const A = o.A, R = o.R, LIB_MENU = Object.fromEntries(MENU.map((m) => [m[0], m])), LIB_CARTE = Object.fromEntries(CARTES), LIB_SEC = Object.fromEntries(SECTIONS.map((x) => [x[0], x[1]]));
  let nom = o.nom || "";
  const FE = o.fiche ? editeurFiche(R.fiche, "cabinet") : null; // fiche patient : retouches du cabinet (pas dans un pack)
  const CE = o.fiche ? editeurFiche(R.consultation, "cabinet", true) : null; // formulaire de consultation : retouches du cabinet (16.7)
  const SOUS_REG = [["modules", "Modules et limites", ["modules", "max"]], ["menu", "Menu et tableau de bord", ["menu", "accueil"]], ["param", "Paramètres et bibliothèques", ["sections", "bibliotheques"]]].concat(o.fiche ? [["fiche", "Fiche et consultation", ["fiche", "consultation"]]] : []);
  ONGLET_REG = "modules"; // chaque fenêtre s'ouvre sur Modules et limites
  const J = (x) => JSON.stringify(x), num = (v) => (v == null || v === "" || isNaN(v) ? null : Number(v));
  // Ce qui diffère du pack (cabinet seulement)
  const ecarts = () => {
    if (!o.avecPack) return {};
    const F = FORMULES_()[A.formule] || { modules: [], max: {} }, P = reglageEffectif(F.reglage);
    return { modules: MODULES.some(([k]) => !!A.modules[k] !== (F.modules.indexOf(k) >= 0)) || J(R.fonctions) !== J(P.fonctions),
      max: ROLES_MAX.some(([k]) => num(A.max[k]) !== num((F.max || {})[k])), menu: J(R.menu) !== J(P.menu), accueil: J([R.accueil, R.cartes]) !== J([P.accueil, P.cartes]),
      sections: J([R.ordreSections, R.sections]) !== J([P.ordreSections, P.sections]), bibliotheques: J(R.bibliotheques) !== J(P.bibliotheques),
      fiche: !!(o.baseFiche && Object.keys(ficheRetouches(R.fiche, o.baseFiche())).length), consultation: !!(o.baseConsult && Object.keys(formRetouches(CONSULT, R.consultation, o.baseConsult())).length) };
  };
  const revenir = (part) => {
    const F = FORMULES_()[A.formule] || { modules: [], max: {} }, P = reglageEffectif(F.reglage), cl = (x) => JSON.parse(J(x));
    if (part === "modules") { MODULES.forEach(([k]) => { A.modules[k] = F.modules.indexOf(k) >= 0; }); R.fonctions = cl(P.fonctions); }
    else if (part === "max") A.max = Object.assign({}, F.max);
    else if (part === "menu") R.menu = cl(P.menu);
    else if (part === "accueil") { R.accueil = cl(P.accueil); R.cartes = cl(P.cartes); }
    else if (part === "sections") { R.ordreSections = cl(P.ordreSections); R.sections = cl(P.sections); }
    else if (part === "bibliotheques") R.bibliotheques = cl(P.bibliotheques);
    else if (part === "fiche") Object.assign(R.fiche, cl(o.baseFiche()));
    else if (part === "consultation") Object.assign(R.consultation, cl(o.baseConsult()));
  };
  const titre = (part, txt, aide, E) => '<h3 class="st">' + txt + (aide ? ' <span class="m">' + aide + "</span>" : "") + (E[part] ? ' <span class="bdg rt">retouché</span> <button class="lien petit" data-rev="' + part + '">' + (part === "fiche" || part === "consultation" ? "Revenir à la spécialité" : "Revenir au pack") + "</button>" : "") + "</h3>";
  const corps = () => {
    const E = ecarts(), mods = MODULES.filter(([k]) => modulePour(k, o.spe()));
    const panneau = (k, h) => '<div class="ong-p" data-op="' + k + '"' + (k === ONGLET_REG ? "" : " hidden") + ">" + h + "</div>";
    return (o.avecPack ? '<div class="form" style="grid-template-columns:minmax(0,340px) auto;align-items:end"><div><label for="fFor">Pack de départ</label><select id="fFor">' + optionsFormules(A.formule) + '</select></div><div><button class="clair petit" id="fDepart" title="Tout le réglage du pack (ordre, cartes, onglets, fonctions, bibliothèques) ; les modules et limites restent">Tout revenir au pack</button></div></div>'
      : '<div class="form" style="grid-template-columns:minmax(0,340px)"><div><label for="fNom">Nom du pack</label><input id="fNom" value="' + esc(nom) + '"></div></div>') +
      '<div class="puces ong-r" role="tablist">' + SOUS_REG.map(([k, l, parts]) => '<button class="puce' + (k === ONGLET_REG ? " on" : "") + '" role="tab" aria-selected="' + (k === ONGLET_REG) + '" data-fo="' + k + '">' + esc(l) + (parts.some((x) => E[x]) ? ' <span class="pt-r" title="Retouché par rapport au pack">●</span>' : "") + "</button>").join("") + "</div>" +
      panneau("modules", titre("modules", "Modules et fonctions", "", E) + '<div class="mods">' + mods.map(([k, lib, de]) => '<div class="mod-f' + (A.modules[k] ? "" : " off") + '">' + caseC('data-rmod="' + k + '"', A.modules[k], "<b>" + esc(lib) + '</b><br><span class="m">' + esc(de) + "</span>") +
          ((FONCTIONS[k] || []).length ? "<details><summary>Fonctions (" + FONCTIONS[k].filter(([f]) => R.fonctions[k + "." + f] !== false).length + " / " + FONCTIONS[k].length + ")</summary>" + FONCTIONS[k].map(([f, l, base]) => base ? '<div class="rg-c base"><span>✓</span><span>' + esc(l) + ' <span class="m">(fonction de base, toujours là)</span></span></div>' : caseC('data-rfn="' + k + "." + f + '"', R.fonctions[k + "." + f] !== false, esc(l) + (FONCTIONS_RELIEES.indexOf(k + "." + f) < 0 ? ' <span class="m">(bientôt)</span>' : ""))).join("") + "</details>" : "") + "</div>").join("") + "</div>" +
        (o.avecPack ? "" : '<h3 class="st">Prix du pack <span class="m">(DH TTC, TVA 20 % comprise ; vide = pas de prix)</span></h3><div class="form">' + [["mois", "Par mois"], ["an", "Par an"]].map(([k, l]) => '<div><label for="fPx' + k + '">' + l + '</label><input id="fPx' + k + '" type="number" min="0" data-px="' + k + '" value="' + (A.prix && A.prix[k] != null ? A.prix[k] : "") + '"></div>').join("") + "</div>") +
        titre("max", "Nombre maximum", "(vide = sans limite, 0 = aucun)", E) + '<div class="form">' + ROLES_MAX.map(([k, lib]) => { const c = o.compte ? o.compte(k) : undefined; return '<div><label for="fMx' + k + '">' + esc(lib) + (c === undefined ? "" : ' <span class="m">(actuellement ' + (c == null ? "?" : c) + ")</span>") + '</label><input id="fMx' + k + '" type="number" min="0" data-x="' + k + '" placeholder="sans limite" value="' + (A.max[k] == null ? "" : A.max[k]) + '"></div>'; }).join("") + "</div>") +
      panneau("menu", '<div class="rg"><div class="rg-b">' + titre("menu", "Menu", "(ordre ; case = module présent)", E) + R.menu.map((k, i) => { const m = LIB_MENU[k]; if (!m) return ""; return '<div class="rg-l">' + fleches("menu", i) + '<span class="rg-t">' + esc(m[1]) + "</span>" + (m[2] ? caseC('data-rmod="' + m[2] + '"', A.modules[m[2]], "") : '<span class="m">toujours</span>') + "</div>"; }).join("") + "</div>" +
        '<div class="rg-b">' + titre("accueil", "Tableau de bord", "(cartes)", E) + R.accueil.map((k, i) => '<div class="rg-l">' + fleches("accueil", i) + '<span class="rg-t">' + esc(LIB_CARTE[k] || k) + "</span>" + caseC('data-rcarte="' + k + '"', R.cartes[k] !== false, "") + "</div>").join("") + "</div></div>") +
      panneau("param", '<div class="rg"><div class="rg-b">' + titre("sections", "Paramètres", "(onglets)", E) + R.ordreSections.map((k, i) => '<div class="rg-l">' + fleches("ordreSections", i) + '<span class="rg-t">' + esc(LIB_SEC[k] || k) + "</span>" + caseC('data-rsec="' + k + '"', R.sections[k] !== false, "") + "</div>").join("") + "</div>" +
        '<div class="rg-b">' + titre("bibliotheques", "Bibliothèques", "", E) + BIBLIOTHEQUES.map(([k, lib]) => '<div class="rg-l"><span class="rg-t">' + esc(lib) + "</span>" + caseC('data-rbib="' + k + '"', R.bibliotheques[k] !== false, "") + "</div>").join("") + "</div></div>") +
      (o.fiche ? panneau("fiche", titre("fiche", "Fiche patient", "(retouches de ce cabinet ; la fiche commune se règle dans Par spécialité › Bibliothèque et paramètres)", E) + FE.html() +
        titre("consultation", "Formulaire de consultation", "(retouches de ce cabinet ; le formulaire commun se règle dans Par spécialité › Bibliothèque et paramètres)", E) + '<div class="cs-ed">' + CE.html() + "</div>") : "");
  };
  fenetre("<h2>" + esc(o.titre) + '</h2><p class="sous">' + o.intro + '</p><div id="fCorps">' + corps() + '</div><div class="pied colle"><button id="fOk">Enregistrer</button><button class="clair" id="fAnn">Fermer</button><span class="m" id="fEtat"></span></div>');
  const lire = () => { document.querySelectorAll("#fCorps [data-x]").forEach((x) => { A.max[x.dataset.x] = x.value === "" ? null : Number(x.value); }); document.querySelectorAll("#fCorps [data-px]").forEach((x) => { A.prix = A.prix || {}; A.prix[x.dataset.px] = x.value === "" ? null : Number(x.value); }); if ($("fNom")) nom = $("fNom").value.trim(); };
  const etat0 = J([A, R, nom]), modifie = () => J([A, R, nom]) !== etat0;
  const majEtat = () => { const e = $("fEtat"); if (e) e.textContent = modifie() ? "Modifications non enregistrées" : ""; };
  GARDE = () => { lire(); return !modifie() || confirm("Fermer sans enregistrer ?\nLes modifications de ce réglage seront perdues."); };
  const refaire = (sansLire) => { if (!sansLire) lire(); const ouverts = [...document.querySelectorAll("#fCorps details")].map((d) => d.open); $("fCorps").innerHTML = corps(); document.querySelectorAll("#fCorps details").forEach((d, i) => { d.open = !!ouverts[i]; }); brancher(); majEtat(); };
  const bouger = (v, sens) => { const [l, i] = v.split(":"), k = Number(i), j = k + sens, L = R[l]; if (j < 0 || j >= L.length) return; [L[k], L[j]] = [L[j], L[k]]; refaire(); };
  // Toute modification (case, nombre) : pastilles « retouché » et état mis à jour (refaire léger, sans perdre la saisie en cours d'un nombre)
  $("fCorps").addEventListener("change", (e) => { if (e.target.matches("[data-x],[data-rcarte],[data-rsec],[data-rbib]")) refaire(); });
  $("fCorps").addEventListener("input", (e) => { if (e.target.matches("[data-x],[data-px],#fNom")) { lire(); majEtat(); } });
  const brancher = () => {
    document.querySelectorAll("#fCorps [data-fo]").forEach((b) => { b.onclick = () => { ONGLET_REG = b.dataset.fo; refaire(); }; });
    document.querySelectorAll("#fCorps [data-rev]").forEach((b) => { b.onclick = () => { revenir(b.dataset.rev); refaire(true); }; });
    if ($("fFor")) $("fFor").onchange = () => { const F = FORMULES_()[$("fFor").value]; if (!F) return; A.formule = $("fFor").value; A.max = Object.assign({}, F.max); MODULES.forEach(([k]) => { A.modules[k] = F.modules.indexOf(k) >= 0; }); const fi = R.fiche, cs = R.consultation; Object.assign(R, reglageEffectif(F.reglage)); R.fiche = fi; R.consultation = cs; refaire(true); }; // tout le pack (la fiche patient reste : spécialité + retouches)
    if ($("fDepart")) $("fDepart").onclick = () => { const fi = R.fiche, cs = R.consultation; Object.assign(R, reglageEffectif((FORMULES_()[A.formule] || {}).reglage)); R.fiche = fi; R.consultation = cs; refaire(); };
    document.querySelectorAll("#fCorps [data-haut]").forEach((b) => { b.onclick = () => bouger(b.dataset.haut, -1); });
    document.querySelectorAll("#fCorps [data-bas]").forEach((b) => { b.onclick = () => bouger(b.dataset.bas, 1); });
    document.querySelectorAll("#fCorps [data-rmod]").forEach((x) => { x.onchange = () => { const k = x.dataset.rmod; A.modules[k] = x.checked; if (k === "rcp" && x.checked) A.modules.taches = true; if (k === "taches" && !x.checked) A.modules.rcp = false; refaire(); }; });
    document.querySelectorAll("#fCorps [data-rcarte]").forEach((x) => { x.onchange = () => { R.cartes[x.dataset.rcarte] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rsec]").forEach((x) => { x.onchange = () => { R.sections[x.dataset.rsec] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rbib]").forEach((x) => { x.onchange = () => { R.bibliotheques[x.dataset.rbib] = x.checked; }; });
    document.querySelectorAll("#fCorps [data-rfn]").forEach((x) => { x.onchange = () => { R.fonctions[x.dataset.rfn] = x.checked; refaire(); }; });
    if (FE) FE.brancher(() => refaire());
    if (CE) CE.brancher(() => refaire());
  };
  brancher();
  $("fAnn").onclick = fermer;
  $("fOk").onclick = async () => {
    lire(); if (!o.avecPack && !nom) { alert("Indiquez le nom du pack."); return; }
    if ((FE && FE.enCours()) || (CE && CE.enCours())) { if (!confirm("Un champ est en cours de modification (fiche ou consultation) et ne sera pas enregistré. Continuer ?")) return; }
    const b = $("fOk"), g = GARDE; b.disabled = true; b.textContent = "Enregistrement…"; GARDE = null;
    try { await o.enregistrer(A, R, nom); } catch (e) { GARDE = g; b.disabled = false; b.textContent = "Enregistrer"; alert("Enregistrement impossible : " + e.message); }
  };
}
// Réglage d'un cabinet : pack de départ, puis retouches dans le cabinet
function ouvrirFormule(c) {
  if (!c) return;
  const A = JSON.parse(JSON.stringify(abonnementEffectif(c.abonnement))); A.formule = A.formule || "complet";
  const speDe = () => specialiteDe((FORMULES_()[A.formule] || {}).specialite), ficheSpe = () => avecOnco((SPES[speDe()] || {}).fiche || null, speDe()), csSpe = () => avecOnco((SPES[speDe()] || {}).consultation || null, speDe());
  editeurReglage({ titre: "Réglage de « " + c.nom + " »", avecPack: true, A, R: reglageEffectif(c.abonnement && c.abonnement.reglage, ficheSpe(), csSpe()), spe: speDe, fiche: true,
    baseFiche: () => ficheEffective(null, ficheSpe()), baseConsult: () => consultEffective(null, csSpe()),
    intro: "Le pack apporte ses modules, ses limites et son réglage ; retouchez ensuite pour ce cabinet (ordre ↑ ↓, cases). <span class=\"bdg rt\">retouché</span> = différent du pack. Ce qui est retiré est caché, les données sont gardées ; l'équipe voit le changement à sa prochaine ouverture d'Onco360.",
    compte: (k) => (k === "patients" ? c.patients : k === "etablissements" ? c.etablissements : (c.roles || {})[k] || 0),
    enregistrer: async (A2, R2) => {
      // Fiche patient : seulement les différences avec celle de la spécialité ; « identique au pack » se juge sans elle
      const F = FORMULES_()[A2.formule] || {}, fiche = ficheRetouches(R2.fiche, ficheEffective(null, ficheSpe())), consultation = formRetouches(CONSULT, R2.consultation, consultEffective(null, csSpe())), sans = Object.assign({}, R2), P = reglageEffectif(F.reglage);
      ["fiche", "consultation"].forEach((q) => { delete sans[q]; delete P[q]; }); const identique = JSON.stringify(sans) === JSON.stringify(P);
      const o = await serveur("abonnementCabinet", { espace: c.id, formule: A2.formule, modules: A2.modules, max: A2.max, reglage: Object.assign(sans, Object.keys(fiche).length ? { fiche } : {}, Object.keys(consultation).length ? { consultation } : {}), identiqueAuPack: identique });
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
// ───── Onglet Comptabilité (18.2, 10/10/2026) : encaissé, à encaisser, impayés, évolution, répartition, encaissements, export ─────
// Tout vient des fiches de facturation (paiements enregistrés dans la fiche de chaque cabinet), cabinets supprimés compris (ARCH).
// Montants tels qu'enregistrés : TTC (TVA 20 % comprise, décidé le 10/10/2026).
let CP = { per: "annee", du: "", au: "", cab: "", moyen: "" };
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function paiementsTous() {
  const L = [];
  (CABINETS || []).concat(ARCH.map((a) => Object.assign({ archive: true, titulaire: {}, abonnement: null }, a))).forEach((c) => ((c.facturation || {}).paiements || []).forEach((p) => L.push(Object.assign({}, p, { cab: c.id, nomCab: c.nom + (c.archive ? " (supprimé)" : ""), pack: c.archive ? "" : nomFormule(c.abonnement), client: (c.facturation.client || {}) }))));
  return L.sort((a, b) => String(b.d).localeCompare(String(a.d)) || String(b.le || "").localeCompare(String(a.le || "")));
}
function bornesCP() {
  const j = JOUR(), a = j.slice(0, 4), m = j.slice(0, 7), mp = (() => { const d = new Date(j + "T12:00:00Z"); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 7); })();
  const finMois = (ym) => { const d = new Date(ym + "-01T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + 1); d.setUTCDate(0); return d.toISOString().slice(0, 10); };
  return { mois: [m + "-01", finMois(m)], moisp: [mp + "-01", finMois(mp)], annee: [a + "-01-01", a + "-12-31"], anneep: [(a - 1) + "-01-01", (a - 1) + "-12-31"], m12: [ajouterJours(j, -364), j], tout: ["0000-01-01", "9999-12-31"], perso: [CP.du || "0000-01-01", CP.au || "9999-12-31"] }[CP.per];
}
const somme = (L) => L.reduce((n, p) => n + (Number(p.m) || 0), 0);
function htmlCompta() {
  if (CABINETS === null) return '<section class="carte"><p class="sous">Chargement…</p></section>';
  const j = JOUR(), T = paiementsTous(), [du, au] = bornesCP(), dans = (p, a, b) => p.d >= a && p.d <= b;
  const B = bornesCP; const moisC = (() => { const x = CP.per; CP.per = "mois"; const r = B(); CP.per = x; return r; })(), anC = (() => { const x = CP.per; CP.per = "annee"; const r = B(); CP.per = x; return r; })();
  const actifs = (CABINETS || []).filter((c) => c.actif && !c.modele && !c.demo && c.facturation);
  const att = (n) => actifs.flatMap((c) => attendus(c.facturation, prixDe(c), j, n).map((x) => Object.assign({ c }, x)));
  const A90 = att(90).sort((a, b) => a.d.localeCompare(b.d)), sA = (n) => somme(A90.filter((x) => !x.essai && x.d <= ajouterJours(j, n)));
  const IMP = (CABINETS || []).filter((c) => !c.modele && !c.demo && c.facturation && ["retard", "suspendre"].indexOf(etatDe(c).etat) >= 0).map((c) => ({ c, m: impaye(c.facturation, prixDe(c), j), E: etatDe(c) }));
  const essais = A90.filter((x) => x.essai && x.d <= ajouterJours(j, 30));
  const tuile = (n, lib, cls, aide) => '<div class="tuile' + (cls ? " " + cls : "") + '"' + (aide ? ' title="' + esc(aide) + '"' : "") + "><b>" + n + "</b><span>" + lib + "</span></div>";
  // Évolution : 12 derniers mois
  const mois = []; { const d = new Date(j.slice(0, 7) + "-01T12:00:00Z"); for (let i = 11; i >= 0; i--) { const x = new Date(d); x.setUTCMonth(d.getUTCMonth() - i); mois.push(x.toISOString().slice(0, 7)); } }
  const parMois = mois.map((m) => somme(T.filter((p) => String(p.d).slice(0, 7) === m))), max = Math.max(1, ...parMois);
  // Période choisie
  const P = T.filter((p) => dans(p, du, au) && (!CP.cab || p.cab === CP.cab) && (!CP.moyen || p.moyen === CP.moyen));
  const rep = (cle) => { const o = {}; P.forEach((p) => { const k = cle(p) || "—"; o[k] = (o[k] || 0) + (Number(p.m) || 0); }); return Object.entries(o).sort((a, b) => b[1] - a[1]); };
  const barres = (L) => { const t = Math.max(1, ...L.map((x) => x[1])); return L.length ? L.map(([k, v]) => '<div class="rp"><span>' + esc(k) + '</span><i style="width:' + Math.round((v / t) * 100) + '%"></i><b>' + esc(dh(v)) + "</b></div>").join("") : '<p class="m">Aucun encaissement sur la période.</p>'; };
  const cabs = [...new Map(T.map((p) => [p.cab, p.nomCab])).entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  const PER = [["mois", "Ce mois"], ["moisp", "Mois dernier"], ["annee", "Cette année"], ["anneep", "Année dernière"], ["m12", "12 derniers mois"], ["tout", "Tout"], ["perso", "Période…"]];
  const moyenLib = (k) => (MOYENS.find((x) => x[0] === k) || [k, k])[1];
  return '<div class="tuiles t5">' + tuile(dh(somme(T.filter((p) => dans(p, moisC[0], moisC[1])))), "Encaissé ce mois", "vert") + tuile(dh(somme(T.filter((p) => dans(p, anC[0], anC[1])))), "Encaissé en " + j.slice(0, 4), "vert") +
      tuile(dh(sA(30)), "À encaisser (30 j)<br><small>60 j : " + esc(dh(sA(60))) + " · 90 j : " + esc(dh(sA(90))) + "</small>", "", "Échéances à venir des abonnements mensuels et annuels") +
      tuile(dh(somme(IMP)), "Impayés · " + IMP.length + " cabinet" + (IMP.length > 1 ? "s" : ""), IMP.length ? "rouge" : "", "Périodes échues non payées") + tuile(essais.length, "Fins d'essai (30 j)<br><small>" + esc(dh(somme(essais))) + " si tous s'abonnent</small>", "") + "</div>" +
    (editeurIncomplet(EDITEUR).length ? '<div class="avert">Pour créer les factures, complétez <b>Mon entreprise</b> (raison sociale, ICE, IF, adresse, ville). <button class="lien" data-editeur>Compléter</button></div>' : "") +
    '<p class="m reg-l">Suspension des cabinets en retard : <b>' + esc({ demander: "Onco360 vous demande", auto: "automatique", jamais: "jamais" }[RA.suspension]) + "</b> après " + RA.delai + " jours · rappel " + RA.rappel + " jours avant l'échéance · essai " + RA.essai + ' jours · <button class="lien" data-reg-abo>Réglages des abonnements</button> · <button class="lien" data-editeur>Mon entreprise (factures)</button></p>' +
    '<section class="carte"><h2>Évolution des encaissements</h2><p class="sous">12 derniers mois, tous cabinets (montants TTC, tels qu\'enregistrés).</p><div class="evo">' + mois.map((m, i) => '<div class="evo-b" title="' + esc(MOIS[Number(m.slice(5)) - 1] + " " + m.slice(0, 4) + " : " + dh(parMois[i])) + '"><span class="v">' + (parMois[i] ? esc(String(Math.round(parMois[i] / 100) / 10).replace(".", ",")) + " k" : "") + '</span><i style="height:' + Math.round((parMois[i] / max) * 100) + '%"></i><span class="mo">' + MOIS[Number(m.slice(5)) - 1] + "</span></div>").join("") + "</div>" + actualiser() + "</section>" +
    '<section class="carte"><h2>Encaissements</h2><div class="barre" style="margin-top:8px"><select id="cpPer" aria-label="Période">' + PER.map(([k, l]) => '<option value="' + k + '"' + (CP.per === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
      (CP.per === "perso" ? '<input id="cpDu" type="date" value="' + esc(CP.du) + '" aria-label="Du"><input id="cpAu" type="date" value="' + esc(CP.au) + '" aria-label="Au">' : "") +
      '<select id="cpCab" aria-label="Cabinet"><option value="">Tous les cabinets</option>' + cabs.map(([k, n]) => '<option value="' + esc(k) + '"' + (CP.cab === k ? " selected" : "") + ">" + esc(n) + "</option>").join("") + "</select>" +
      '<select id="cpMoy" aria-label="Moyen"><option value="">Tous les moyens</option>' + MOYENS.map(([k, l]) => '<option value="' + k + '"' + (CP.moyen === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
      '<button class="clair" id="cpExp"' + (P.length ? "" : " disabled") + ">Exporter pour le comptable (Excel)</button></div>" +
      '<p class="sous" style="margin:10px 0 0"><b>' + esc(dh(somme(P))) + "</b> · " + P.length + " paiement" + (P.length > 1 ? "s" : "") + (du > "0000" && au < "9999" ? " du " + esc(dfr(du)) + " au " + esc(dfr(au)) : "") + "</p>" +
      '<div class="rg" style="margin-top:10px"><div class="rg-b"><h3 class="st">Par pack</h3>' + barres(rep((p) => p.pack || "Cabinet supprimé")) + '</div><div class="rg-b"><h3 class="st">Par moyen de paiement</h3>' + barres(rep((p) => moyenLib(p.moyen))) + "</div></div>" +
      (P.length ? '<div class="tableau"><table class="lc cp"><thead><tr><th>Date</th><th>Cabinet</th><th class="n">Montant</th><th>Période</th><th>Moyen</th><th>Référence</th><th>Échéance après</th></tr></thead><tbody>' + P.map((p) => '<tr><td data-l="Date">' + esc(dfr(p.d)) + '</td><td data-l="Cabinet">' + esc(p.nomCab) + (p.client.raison ? '<div class="m">' + esc(p.client.raison) + "</div>" : "") + '</td><td data-l="Montant" class="n"><b>' + esc(dh(p.m)) + '</b></td><td data-l="Période">' + (p.periode === "an" ? "1 an" : "1 mois") + '</td><td data-l="Moyen">' + esc(moyenLib(p.moyen)) + '</td><td data-l="Référence" class="m">' + esc(p.ref || "") + (p.note ? " " + esc(p.note) : "") + '</td><td data-l="Échéance après">' + esc(dfr(p.apres || "")) + "</td></tr>").join("") + '</tbody><tfoot><tr><td colspan="2"><b>Total</b></td><td class="n"><b>' + esc(dh(somme(P))) + '</b></td><td colspan="4"></td></tr></tfoot></table></div>' : '<p class="sous">Aucun paiement sur cette période' + (CP.per !== "tout" ? " (essayez « Tout »)" : "") + ".</p>") + "</section>" +
    htmlRelances() + htmlFactures(du, au) +
    '<div class="rg"><section class="carte"><h2>À encaisser (90 jours)</h2>' + (A90.length ? '<table class="pt">' + A90.map((x) => "<tr><td>" + esc(dfr(x.d)) + '</td><td><button class="lien" data-vf="' + esc(x.c.id) + '">' + esc(x.c.nom) + "</button>" + (x.essai ? ' <span class="bdg">fin d\'essai</span>' : "") + '</td><td class="n">' + esc(dh(x.m)) + "</td></tr>").join("") + "</table>" : '<p class="m">Aucune échéance dans les 90 jours.</p>') + "</section>" +
      '<section class="carte"><h2>Impayés</h2>' + (IMP.length ? '<table class="pt">' + IMP.map((x) => '<tr><td><button class="lien" data-vf="' + esc(x.c.id) + '">' + esc(x.c.nom) + '</button><div class="m">échéance du ' + esc(dfr(x.E.fin)) + " · " + esc(x.E.lib) + (x.c.actif ? "" : " · suspendu") + '</div></td><td class="n"><b>' + esc(dh(x.m)) + "</b></td></tr>").join("") + "</table>" : '<p class="m">Aucun impayé.</p>') + "</section></div>";
}
// Factures et avoirs de la période choisie (même période et même cabinet que les encaissements)
function htmlFactures(du, au) {
  const L = FACT.filter((F) => F.d >= du && F.d <= au && (!CP.cab || F.espace === CP.cab)).sort((a, b) => String(b.numero).localeCompare(String(a.numero)));
  const sg = (F) => (F.type === "avoir" ? -1 : 1), tot = (k) => L.reduce((n, F) => n + sg(F) * (Number(F[k]) || 0), 0);
  return '<section class="carte"><h2>Factures</h2><p class="sous">Une facture à chaque paiement enregistré, un avoir quand un paiement est retiré. Période et cabinet : ceux des encaissements ci-dessus.</p>' +
    (L.length ? '<div class="barre" style="margin:8px 0"><span class="m">' + L.length + " document" + (L.length > 1 ? "s" : "") + " · HT " + esc(dh2(tot("ht"))) + " · TVA " + esc(dh2(tot("tva"))) + " · <b>TTC " + esc(dh2(tot("ttc"))) + '</b></span><button class="clair" id="faExp">Exporter les factures (Excel)</button></div>' +
      '<div class="tableau"><table class="lc"><thead><tr><th>Numéro</th><th>Date</th><th>Client</th><th class="n">HT</th><th class="n">TVA</th><th class="n">TTC</th><th></th></tr></thead><tbody>' +
      L.map((F) => '<tr><td data-l="Numéro"><b>' + esc(F.numero) + "</b>" + (F.type === "avoir" ? ' <span class="bdg al">avoir</span><div class="m">annule ' + esc(F.ref) + "</div>" : "") + '</td><td data-l="Date">' + esc(dfr(F.d)) + '</td><td data-l="Client">' + esc((F.client || {}).raison || F.cabinet) + ((F.client || {}).ice ? '<div class="m">ICE ' + esc(F.client.ice) + "</div>" : "") + '</td><td data-l="HT" class="n">' + esc(dh2(sg(F) * F.ht)) + '</td><td data-l="TVA" class="n">' + esc(dh2(sg(F) * F.tva)) + '</td><td data-l="TTC" class="n"><b>' + esc(dh2(sg(F) * F.ttc)) + '</b></td><td><button class="clair petit" data-vfac="' + esc(F.id) + '">Voir / imprimer</button></td></tr>').join("") + "</tbody></table></div>"
      : '<p class="m">Aucune facture sur cette période.</p>') + "</section>";
}
function brancherCompta() {
  if ($("faExp")) $("faExp").onclick = () => {
    const [du, au] = bornesCP(), q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"', n = (x) => String((Number(x) || 0).toFixed(2)).replace(".", ",");
    const L = FACT.filter((F) => F.d >= du && F.d <= au && (!CP.cab || F.espace === CP.cab)).sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
    const csv = "\ufeff" + ["Numéro;Type;Date;Client;ICE client;IF client;Cabinet;HT;TVA;TTC;Taux TVA;Payée le;Moyen;Référence;Facture annulée"].concat(L.map((F) => { const s = F.type === "avoir" ? -1 : 1, C = F.client || {}, P = F.paiement || {};
      return [F.numero, F.type === "avoir" ? "Avoir" : "Facture", dfr(F.d), C.raison, C.ice, C.if, F.cabinet, n(s * F.ht), n(s * F.tva), n(s * F.ttc), F.taux + " %", dfr(P.d), P.moyen, P.ref, F.ref].map(q).join(";"); })).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "Onco360-factures-" + (CP.per === "tout" ? "tout" : du + "_" + au) + ".csv"; document.body.appendChild(a); a.click(); a.remove();
  };
  if (!$("cpPer")) return;
  $("cpPer").onchange = () => { CP.per = $("cpPer").value; dessiner(); };
  if ($("cpDu")) $("cpDu").onchange = () => { CP.du = $("cpDu").value; dessiner(); };
  if ($("cpAu")) $("cpAu").onchange = () => { CP.au = $("cpAu").value; dessiner(); };
  $("cpCab").onchange = () => { CP.cab = $("cpCab").value; dessiner(); };
  $("cpMoy").onchange = () => { CP.moyen = $("cpMoy").value; dessiner(); };
  document.querySelectorAll("[data-vf]").forEach((b) => { b.onclick = () => { const c = cab(b.dataset.vf); if (c) ouvrirFiche(c); }; });
  $("cpExp").onclick = () => {
    const [du, au] = bornesCP(), q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"', mo = (k) => (MOYENS.find((x) => x[0] === k) || [k, k])[1];
    const L = paiementsTous().filter((p) => p.d >= du && p.d <= au && (!CP.cab || p.cab === CP.cab) && (!CP.moyen || p.moyen === CP.moyen));
    const csv = "\ufeff" + ["Date;Cabinet;Raison sociale;ICE;Pack;Montant (DH);Période;Moyen;Référence;Note;Échéance après"].concat(L.map((p) => [dfr(p.d), p.nomCab, p.client.raison, p.client.ice, p.pack, String(p.m).replace(".", ","), p.periode === "an" ? "1 an" : "1 mois", mo(p.moyen), p.ref, p.note, dfr(p.apres || "")].map(q).join(";"))).concat(["" + ";;;;;" + q(String(somme(L)).replace(".", ",")) + ";Total"]).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "Onco360-encaissements-" + (CP.per === "tout" ? "tout" : du + "_" + au) + ".csv"; document.body.appendChild(a); a.click(); a.remove();
  };
}
// ───── Onglet Journal (17.5, 10/10/2026) : actions du compte d'administration et d'Onco360 (suspension automatique) ─────
// Lu par la fonction journalAdmin (période) ; filtres cabinet, type, recherche ; export pour Excel.
const TYPES_J = [["creation", "Création"], ["reglage", "Réglage"], ["infos", "Informations"], ["abonnement", "Abonnement"], ["suspension", "Suspension"], ["reactivation", "Réactivation"], ["suppression", "Suppression"], ["acces", "Accès du médecin"], ["packs", "Packs"], ["specialite", "Spécialité"], ["bibliotheque", "Bibliothèque"], ["demo", "Démonstration"]];
const BADGE_J = { creation: "ok", reactivation: "ok", suspension: "al", suppression: "al", abonnement: "", reglage: "", packs: "demo", specialite: "demo", bibliotheque: "demo" };
let JL = null, JERR = "", JF = { periode: "30", cab: "", type: "", q: "" };
const periodeJ = () => { const n = { "7": 7, "30": 30, "90": 90, "365": 365 }[JF.periode]; return n ? { du: new Date(Date.now() - (n - 1) * 86400000).toISOString().slice(0, 10) } : {}; };
async function chargerJournal() {
  try { const o = await serveur("journalAdmin", periodeJ()); JL = o.lignes || []; JERR = ""; } catch (e) { JL = []; JERR = e.message; }
  if (ONG() === "journal") dessiner();
}
const lignesJ = () => { const m = sansAcc(JF.q).split(/\s+/).filter(Boolean);
  return (JL || []).filter((l) => (!JF.cab || l.espace === JF.cab) && (!JF.type || l.type === JF.type) && m.every((w) => sansAcc([l.cabinet, l.txt, l.parEmail].join(" ")).indexOf(w) >= 0)); };
function htmlJournal() {
  if (JL === null) { JL = undefined; chargerJournal(); }
  if (!JL) return '<section class="carte"><p class="sous">Chargement du journal…</p></section>';
  const L = lignesJ(), cabs = [...new Map((JL || []).filter((l) => l.espace).map((l) => [l.espace, l.cabinet || l.espace])).entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  if (JF.cab && !cabs.some(([k]) => k === JF.cab)) cabs.push([JF.cab, (cab(JF.cab) || {}).nom || JF.cab]);
  const lib = (t) => (TYPES_J.find((x) => x[0] === t) || [t, t])[1];
  return '<section class="carte"><h2>Journal de l\'Administration</h2><p class="sous">Qui a créé, réglé, suspendu, supprimé quel cabinet, et quand ; paiements, packs, fiche et consultation des spécialités ; suspensions automatiques. Aucune donnée médicale. Tout est gardé.</p>' +
    '<div class="barre" style="margin-top:10px"><select id="jPer" aria-label="Période">' + [["7", "7 derniers jours"], ["30", "30 derniers jours"], ["90", "3 derniers mois"], ["365", "12 derniers mois"], ["tout", "Tout"]].map(([k, l]) => '<option value="' + k + '"' + (JF.periode === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
    '<select id="jCab" aria-label="Cabinet"><option value="">Tous les cabinets</option>' + cabs.map(([k, n]) => '<option value="' + esc(k) + '"' + (JF.cab === k ? " selected" : "") + ">" + esc(n) + "</option>").join("") + "</select>" +
    '<select id="jType" aria-label="Type"><option value="">Toutes les actions</option>' + TYPES_J.map(([k, l]) => '<option value="' + k + '"' + (JF.type === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select>" +
    '<input id="jQ" type="search" placeholder="Rechercher…" value="' + esc(JF.q) + '" aria-label="Rechercher"><button class="clair" id="jExp"' + (L.length ? "" : " disabled") + ">Exporter (Excel)</button></div>" +
    (JERR ? '<p class="err">Journal indisponible : ' + esc(JERR) + "</p>" : "") +
    '<p class="sous" style="margin:10px 0 0">' + L.length + " action" + (L.length > 1 ? "s" : "") + (L.length !== JL.length ? " sur " + JL.length : "") + "</p>" +
    (L.length ? '<div class="tableau"><table class="lc jr"><thead><tr><th>Date</th><th>Action</th><th>Cabinet</th><th>Détail</th><th>Par</th></tr></thead><tbody>' + L.map((l) => '<tr><td data-l="Date" class="dt">' + esc(new Date(l.le).toLocaleDateString("fr-FR")) + '<div class="m">' + esc(new Date(l.le).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })) + '</div></td><td data-l="Action"><span class="bdg ' + (BADGE_J[l.type] || "") + '">' + esc(lib(l.type)) + '</span></td><td data-l="Cabinet">' + (l.cabinet ? esc(l.cabinet) : '<span class="m">—</span>') + '</td><td data-l="Détail">' + esc(l.txt) + '</td><td data-l="Par" class="m">' + esc(l.parEmail || l.par || "") + "</td></tr>").join("") + "</tbody></table></div>"
      : '<p class="sous">Aucune action pour ces filtres' + (JF.periode !== "tout" ? " (essayez « Tout »)" : "") + ".</p>") + "</section>";
}
function brancherJournal() {
  if (!$("jPer")) return;
  $("jPer").onchange = () => { JF.periode = $("jPer").value; JL = null; dessiner(); };
  $("jCab").onchange = () => { JF.cab = $("jCab").value; dessiner(); };
  $("jType").onchange = () => { JF.type = $("jType").value; dessiner(); };
  $("jQ").oninput = () => { JF.q = $("jQ").value; const pos = $("jQ").selectionStart; dessiner(); $("jQ").focus(); $("jQ").setSelectionRange(pos, pos); };
  $("jExp").onclick = () => {
    const c = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"', lib = (t) => (TYPES_J.find((x) => x[0] === t) || [t, t])[1];
    const csv = "\ufeff" + ["Date;Heure;Action;Cabinet;Détail;Par"].concat(lignesJ().map((l) => [new Date(l.le).toLocaleDateString("fr-FR"), new Date(l.le).toLocaleTimeString("fr-FR"), lib(l.type), l.cabinet, l.txt, l.parEmail || l.par].map(c).join(";"))).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "Journal-administration-" + JOUR() + ".csv"; document.body.appendChild(a); a.click(); a.remove();
  };
}
// ───── Onglet Modules (10/10/2026) : tous les modules d'Onco360, toutes spécialités confondues ─────
// Parties de base (toujours là), modules activables (packs, cabinets) et modules prévus (à construire) ; pour chacun : spécialités,
// place dans Onco360, fonctions (de base, reliées, bientôt), packs et cabinets qui l'ont.
let MF = { genre: "", spe: "", q: "" };
function listeModules() {
  const FS = Object.entries(FORMULES_()), cabs = (CABINETS || []).filter((c) => !c.bibliotheque);
  const nomBib = (id) => (BIBLIOTHEQUES_SPE.find((b) => b.id === id) || {}).lib || id;
  const base = MODULES_BASE.map(([k, lib, de, ou, cont]) => ({ k, lib, de, ou, genre: "base", spes: [], fonctions: (cont === "cartes" ? CARTES.map((c) => c[1]) : cont === "sections" ? SECTIONS.map((c) => c[1]) : cont).map((l) => ({ lib: l, etat: "" })), packs: null, cabinets: cabs.length }));
  const act = MODULES.map(([k, lib, de]) => ({ k, lib, de, ou: MODULE_MENU[k] || "", genre: "activable", spes: MODULE_FAMILLE[k] ? [nomBib(MODULE_FAMILLE[k])] : [],
    fonctions: (FONCTIONS[k] || []).map(([f, l, b]) => ({ lib: l, etat: b ? "base" : FONCTIONS_RELIEES.indexOf(k + "." + f) < 0 ? "bientot" : "" })),
    packs: FS.filter(([, f]) => (f.modules || []).indexOf(k) >= 0).map(([, f]) => f.lib), cabinets: cabs.filter((c) => abonnementEffectif(c.abonnement).modules[k]).length }));
  const prev = MODULES_PREVUS.map(([k, lib, bib]) => ({ k, lib, de: "À construire (feuille de route, étape 14)", ou: "", genre: "prevu", spes: [nomBib(bib)], fonctions: [], packs: [], cabinets: 0 }));
  return base.concat(act, prev);
}
function htmlModules() {
  const T = listeModules(), sansAcc2 = (t) => sansAcc(String(t || "")).toLowerCase(), q = sansAcc2(MF.q);
  const L = T.filter((m) => (!MF.genre || m.genre === MF.genre) && (!MF.spe || !m.spes.length || m.spes.indexOf(MF.spe) >= 0) && (!q || sansAcc2(m.lib + " " + m.de + " " + m.ou + " " + m.fonctions.map((f) => f.lib).join(" ")).indexOf(q) >= 0));
  const nb = (g) => T.filter((m) => m.genre === g).length, GENRES = [["", "Tous", T.length], ["base", "De base", nb("base")], ["activable", "Activables", nb("activable")], ["prevu", "Prévus", nb("prevu")]];
  const BADGE = { base: '<span class="bdg">de base</span>', activable: '<span class="bdg ok">activable</span>', prevu: '<span class="bdg demo">prévu</span>' };
  const ETAT = { base: ' <span class="m">(de base)</span>', bientot: ' <span class="m">(bientôt)</span>', "": "" };
  return '<section class="carte"><h2>Modules d\'Onco360</h2><p class="sous">Tous les modules, toutes spécialités confondues. <b>De base</b> : toujours présents dans chaque cabinet. <b>Activables</b> : choisis dans un pack puis cabinet par cabinet (Par spécialité, réglage d\'un cabinet). <b>Prévus</b> : à construire pour d\'autres spécialités. Un module sans spécialité sert à toutes.</p>' +
    '<div class="barre" style="margin:10px 0">' + '<div class="puces">' + GENRES.map(([k, l, n]) => '<button class="puce' + (k === MF.genre ? " on" : "") + '" data-mg="' + k + '">' + esc(l) + ' <span class="nb">' + n + "</span></button>").join("") + "</div>" +
    '<select id="mSpe" aria-label="Spécialité"><option value="">Toutes les spécialités</option>' + SPECIALITES.map((x) => "<option" + (x === MF.spe ? " selected" : "") + ">" + esc(x) + "</option>").join("") + "</select>" +
    '<input id="mQ" type="search" placeholder="Rechercher un module, une fonction…" value="' + esc(MF.q) + '" aria-label="Rechercher"></div>' +
    (L.length ? '<div class="tableau"><table class="lc mods-t"><thead><tr><th>Module</th><th>Type</th><th>Spécialité</th><th>Dans Onco360</th><th>Fonctions</th><th>Packs</th><th class="n">Cabinets</th></tr></thead><tbody>' +
      L.map((m) => '<tr data-module="' + esc(m.k) + '"><td data-l="Module"><b>' + esc(m.lib) + '</b><div class="m">' + esc(m.de) + "</div></td>" +
        '<td data-l="Type">' + BADGE[m.genre] + "</td>" +
        '<td data-l="Spécialité">' + (m.spes.length ? esc(m.spes.join(", ")) : '<span class="m">Toutes</span>') + "</td>" +
        '<td data-l="Dans Onco360" class="m">' + esc(m.ou || "—") + "</td>" +
        '<td data-l="Fonctions">' + (m.fonctions.length ? "<details><summary>" + m.fonctions.length + " fonction" + (m.fonctions.length > 1 ? "s" : "") + "</summary><ul class=\"mods-f\">" + m.fonctions.map((f) => "<li>" + esc(f.lib) + ETAT[f.etat] + "</li>").join("") + "</ul></details>" : '<span class="m">—</span>') + "</td>" +
        '<td data-l="Packs">' + (m.packs === null ? '<span class="m">tous</span>' : m.packs.length ? "<details><summary>" + m.packs.length + " pack" + (m.packs.length > 1 ? "s" : "") + "</summary><ul class=\"mods-f\">" + m.packs.map((p) => "<li>" + esc(p) + "</li>").join("") + "</ul></details>" : '<span class="m">aucun</span>') + "</td>" +
        '<td data-l="Cabinets" class="n">' + (CABINETS ? m.cabinets : "…") + "</td></tr>").join("") + "</tbody></table></div>"
      : '<p class="sous">Aucun module ne correspond.</p>') + "</section>";
}
function brancherModules() {
  document.querySelectorAll("[data-mg]").forEach((b) => { b.onclick = () => { MF.genre = b.dataset.mg; dessiner(); }; });
  $("mSpe").onchange = () => { MF.spe = $("mSpe").value; dessiner(); };
  $("mQ").oninput = () => { MF.q = $("mQ").value; const pos = $("mQ").selectionStart; dessiner(); $("mQ").focus(); $("mQ").setSelectionRange(pos, pos); };
}

// ───── Onglet Par spécialité (16.2, 10/10/2026) : packs, modules et menus, bibliothèques et paramètres ─────
let SPEC = null, SOUS = "packs";
const packsDe = (spe) => Object.entries(FORMULES_()).filter(([, f]) => specialiteDe(f.specialite) === spe);
const cabinetsDuPack = (k) => (CABINETS || []).filter((c) => c.abonnement && c.abonnement.formule === k).length;
function htmlSpecialites() {
  SPEC = SPEC || SPECIALITES[0];
  const gauche = '<div class="spe-l">' + SPECIALITES.map((s) => { const np = packsDe(s).length, nc = (CABINETS || []).filter((c) => !c.bibliotheque && speDuCab(c) === s).length;
    return '<button class="spe' + (s === SPEC ? " on" : "") + '" data-spec="' + esc(s) + '"><b>' + esc(s) + '</b><span class="m">' + np + " pack" + (np > 1 ? "s" : "") + " · " + nc + " cabinet" + (nc > 1 ? "s" : "") + "</span></button>"; }).join("") +
    '<p class="m" style="margin:8px 4px">Nouvelle spécialité : étape 16.5.</p></div>';
  const sous = [["packs", "Packs"], ["biblio", "Bibliothèque et paramètres"]]; // « Modules et menus » retiré (10/10/2026 : déjà dans l'écran d'un pack)
  let droite = '<div class="puces">' + sous.map(([k, l]) => '<button class="puce' + (k === SOUS ? " on" : "") + '" data-sous="' + k + '">' + esc(l) + "</button>").join("") + "</div>";
  if (SOUS === "biblio") { const B = (BIBS || []).find((b) => b.specialites.indexOf(SPEC) >= 0) || BIBLIOTHEQUES_SPE.find((b) => b.specialites.indexOf(SPEC) >= 0); droite += '<section class="carte"><p class="sous">Ce que reçoit chaque nouveau cabinet de cette spécialité : bibliothèques (protocoles, médicaments, ordonnances types, analyses et bilans, examens, courriers, documentation) et paramètres de base (horaires, fériés, WhatsApp, couleurs, types, tâches automatiques, RCP, listes, impression, alertes, tarifs RT). Jamais : correspondants, prix des consultations, lieux, équipe, patients.</p></section>' + carteModele() + (B ? '<div class="cabs">' + carteBib(B) + "</div>" : "") + carteFicheSpe("fiche") + carteFicheSpe("consultation"); }
  else {
    const L = packsDe(SPEC);
    droite += '<section class="carte"><p class="sous">Les packs de départ de « ' + esc(SPEC) + ' ». Chacun a son réglage complet (modules et fonctions, menu, cartes du tableau de bord, onglets des Paramètres, bibliothèques, limites). Un cabinet reçoit le réglage de son pack, puis peut être retouché. Modifier un pack met à jour les cabinets qui le suivent sans retouche.</p>' +
      (L.length ? '<div class="tableau"><table class="lc"><thead><tr><th></th><th>Pack</th><th>Modules</th><th>Prix</th><th>Limites</th><th class="n">Cabinets</th><th></th></tr></thead><tbody>' + L.map(([k, f], i) => { const nm = (f.modules || []).length, mx = texteLimites(f.max), nc = cabinetsDuPack(k);
        return '<tr><td><span class="fl"><button class="clair petit" data-ph="' + esc(k) + '"' + (i ? "" : " disabled") + ' aria-label="Monter">↑</button><button class="clair petit" data-pb="' + esc(k) + '"' + (i < L.length - 1 ? "" : " disabled") + ' aria-label="Descendre">↓</button></span></td><td data-l="Pack"><b>' + esc(f.lib) + '</b>' + (f.reglage ? ' <span class="bdg">réglage complet</span>' : "") + '</td><td data-l="Modules">' + nm + ' / ' + MODULES.filter(([m]) => modulePour(m, SPEC)).length + '</td><td data-l="Prix" class="prix">' + (f.prix || PRIX0[k] ? esc(dh((f.prix || PRIX0[k]).mois)) + '<span class="m"> /mois</span><div class="m">' + esc(dh((f.prix || PRIX0[k]).an)) + " /an</div>" : '<span class="m">—</span>') + '</td><td data-l="Limites" class="m">' + esc(mx) + '</td><td data-l="Cabinets" class="n">' + nc + '</td><td class="act"><button class="clair petit" data-pm="' + esc(k) + '">Modifier</button><button class="clair petit" data-pd="' + esc(k) + '">Dupliquer</button>' + (nc ? "" : '<button class="lien-r petit" data-ps="' + esc(k) + '" title="Supprimer ce pack (aucun cabinet ne l\'utilise)">Supprimer</button>') + "</td></tr>"; }).join("") + "</tbody></table></div>" : '<p class="sous">Aucun pack pour l\'instant' + (/générale|Gynéco/.test(SPEC) ? " : les modules de cette spécialité sont à construire (étape 14)." : ".") + "</p>") +
      '<div class="barre" style="margin-top:12px"><button id="pNouv">+ Nouveau pack</button>' + (Object.keys(FORMULES0).some((k) => !FORMULES_()[k] && specialiteDe(FORMULES0[k].specialite) === SPEC) ? '<button class="clair" id="pProp">Ajouter les packs proposés par Onco360</button>' : "") + "</div></section>";
  }
  return '<div class="spe-g">' + gauche + '<div class="spe-d">' + droite + "</div></div>";
}
// Fiche patient et formulaire de consultation de la spécialité : les mêmes pour tous ses packs et tous ses cabinets (retouches d'un
// cabinet en plus). q = "fiche" | "consultation".
const FORMS = { fiche: { titre: "Fiche patient", cat: FICHE, eff: ficheEffective, le: "le", bouton: "Modifier la fiche patient",
    intro: "Ordre (↑ ↓), nom affiché (✎), champs ajoutés (texte, nombre, date, liste de choix, oui / non). <b>présent</b> : le champ est dans la fiche (décoché : caché, sa valeur reste dans les dossiers). <b>en-tête</b> : il s'affiche aussi en haut du dossier, sous le nom du patient (sinon seulement dans « Afficher »). Nom, prénom et hôpital sont toujours présents." },
  consultation: { titre: "Formulaire de consultation", cat: CONSULT, eff: consultEffective, le: "csLe", bouton: "Modifier le formulaire de consultation",
    intro: "La fenêtre « Nouvelle consultation » : ordre (↑ ↓), présence (cases), nom affiché et liste des types de consultation (✎), champs ajoutés (texte, texte long, nombre avec unité, date, liste de choix, oui / non, titre de section pour regrouper). Un champ retiré est caché, ses valeurs restent dans les consultations. La date est toujours présente." } };
function carteFicheSpe(q) {
  const Fm = FORMS[q], sp = SPES[SPEC] || {}, FI = Fm.eff(null, avecOnco(sp[q], SPEC)), pres = FI.ordre.filter((k) => FI.champs[k] !== false).length, ren = Object.keys(FI.libs).length;
  return '<section class="carte" style="margin-top:14px"><h2>' + Fm.titre + '</h2><p class="sous">Le même pour tous les packs de « ' + esc(SPEC) + ' » et tous ses cabinets' + (q === "fiche" ? " : ordre des champs, champs présents, nom affiché des champs existants, champs ajoutés" : " : la fenêtre « Nouvelle consultation » (champs, ordre, sections, liste des types de consultation)") + ". Enregistrer met à jour aussitôt tous les cabinets de la spécialité (un cabinet peut avoir en plus ses propres retouches, dans son réglage).</p>" +
    '<p class="m">' + pres + " champ(s) présent(s) sur " + FI.ordre.length + " · " + FI.ajouts.filter((z) => !z.tumeur && !z.cs).length + " ajouté(s)" + (FI.onco ? (q === "fiche" ? " · fiche tumeur" : " · formulaires d'oncologie et de RT hebdomadaire") : "") + " · " + ren + " renommé(s)" + (sp[Fm.le] ? " · modifié le " + esc(String(sp[Fm.le]).slice(0, 10).split("-").reverse().join("/")) : "") + '</p><div style="margin-top:10px"><button data-fsouvrir="' + q + '">' + Fm.bouton + "</button></div></section>";
}
function ouvrirFicheSpe(q) {
  const Fm = FORMS[q], spe = SPEC, FI = Fm.eff(null, avecOnco((SPES[spe] || {})[q], spe)), FE = editeurFiche(FI, "spe", q === "consultation"); // oncologie : fiche tumeur, formulaires de consultation (12/10/2026)
  fenetre("<h2>" + Fm.titre + " · " + esc(spe) + '</h2><p class="sous">' + Fm.intro + '</p><div id="fsCorps">' + FE.html() + '</div><div class="pied"><button id="fsOk">Enregistrer pour tous les cabinets</button><button class="clair" id="fsAnn">Fermer</button></div>');
  const refaire = () => { $("fsCorps").innerHTML = FE.html(); FE.brancher(refaire); };
  FE.brancher(refaire); $("fsAnn").onclick = fermer;
  $("fsOk").onclick = async () => {
    if (FE.enCours() && !confirm("Un champ est en cours de modification et ne sera pas enregistré. Continuer ?")) return;
    const b = $("fsOk"); b.disabled = true; b.textContent = "Enregistrement…";
    const fiche = { ordre: FI.ordre, champs: FI.champs, libs: FI.libs, ajouts: FI.ajouts.map((a) => { const c = Object.assign({}, a); delete c.cabinet; if (FI.entetes && a.id in FI.entetes) c.entete = FI.entetes[a.id]; return c; }) };
    if (q === "fiche") fiche.entetes = FI.entetes;
    if (q === "consultation") fiche.choixs = FI.choixs;
    try { const o = await serveur("ficheSpecialite", { specialite: spe, quoi: q, fiche }); SPES[spe] = Object.assign({}, SPES[spe] || {}, { [q]: o.fiche, [Fm.le]: new Date().toISOString() }); fermer(); RES = Fm.titre + " de « " + esc(spe) + " » enregistré" + (q === "fiche" ? "e" : "") + " : " + o.cabinets + " cabinet(s) mis à jour (à la prochaine ouverture d'Onco360)."; dessiner(); }
    catch (e) { b.disabled = false; b.textContent = "Enregistrer pour tous les cabinets"; alert("Enregistrement impossible : " + e.message); }
  };
}
async function enregistrerPacks(L, message) {
  const o = await serveur("formulesEnregistrer", { formules: L }); FS = o.formules; Object.values(FS).forEach((f) => { f.specialite = specialiteDe(f.specialite); });
  RES = message + (o.cabinets ? " ; " + o.cabinets + " cabinet(s) mis à jour" : "") + "."; CABINETS = null; dessiner(); charger();
}
function ouvrirPack(k, modele) {
  const F0 = modele || FORMULES_()[k] || { lib: "", specialite: SPEC, modules: MODULES.filter(([m]) => modulePour(m, SPEC)).map((m) => m[0]), max: {} };
  const A = { formule: k, prix: Object.assign({}, F0.prix || PRIX0[k] || {}), modules: Object.fromEntries(MODULES.map(([m]) => [m, (F0.modules || []).indexOf(m) >= 0])), max: Object.fromEntries(ROLES_MAX.map(([r]) => [r, F0.max && F0.max[r] != null ? F0.max[r] : null])) };
  editeurReglage({ titre: (FORMULES_()[k] ? "Pack « " + F0.lib + " »" : "Nouveau pack") + " · " + SPEC, avecPack: false, nom: F0.lib, A, R: reglageEffectif(F0.reglage), spe: () => SPEC,
    intro: "Le réglage de départ des cabinets qui reçoivent ce pack. Les cabinets qui le suivent sans retouche reçoivent aussitôt les modifications ; un cabinet retouché garde les siennes. Fiche patient et consultation : communes à la spécialité (Bibliothèque et paramètres).",
    enregistrer: async (A2, R2, nom) => {
      const L = JSON.parse(JSON.stringify(FORMULES_())); let cle = k;
      if (!L[cle]) { let base = sansAcc(nom).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 26); if (base.length < 2) base = "pack"; cle = base; let n = 2; while (L[cle]) cle = base + "-" + n++; }
      const rg = Object.assign({}, R2); delete rg.fiche; delete rg.consultation; // fiche patient et consultation : celles de la spécialité (Bibliothèque et paramètres)
      L[cle] = { lib: nom.slice(0, 40), specialite: SPEC, modules: MODULES.map(([m]) => m).filter((m) => A2.modules[m]), max: A2.max, prix: A2.prix || {}, reglage: rg };
      fermer(); await enregistrerPacks(L, "Pack « " + esc(nom) + " » enregistré");
    } });
}
function brancherSpecialites() {
  document.querySelectorAll("[data-spec]").forEach((b) => { b.onclick = () => { SPEC = b.dataset.spec; dessiner(); }; });
  document.querySelectorAll("[data-sous]").forEach((b) => { b.onclick = () => { SOUS = b.dataset.sous; dessiner(); }; });
  document.querySelectorAll("[data-fsouvrir]").forEach((b) => { b.onclick = () => ouvrirFicheSpe(b.dataset.fsouvrir); });
  if ($("modVoir")) { $("modVoir").onclick = () => ouvrirReprendreModele(); etatModele(); }
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
