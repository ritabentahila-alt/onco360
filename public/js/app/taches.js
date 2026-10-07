// Onco360 – Tâches (étape T1, 07/10/2026) : page « Tâches » du menu (entre Patients et Protocoles), bouton « + Tâche » du dossier.
// espaces/{e}/taches/{id} = { titre, desc, type, urgent, ech (AAAA-MM-JJ ou ""), h (HH:MM ou ""), patientId, patientNom,
// etablissementId, pour (uid du responsable), pourNom, de (uid de l'auteur), deNom, qui: [auteur, responsable] (requêtes et
// règles), statut: "afaire" | "encours" | "fait", faitPar, faitParNom, faitLe, fil: [{ le (ISO), par, parNom, txt, c }]
// (historique et commentaires (c: true, T3) : une entrée ajoutée à chaque modification, jamais retirée), o (ordre de création), cree, maj, majPar }.
// Lecture : les médecins toutes ; les autres celles qu'ils ont créées ou dont ils sont responsables.
// Modification et réattribution : l'auteur, le responsable, les médecins. Suppression : l'auteur ou un médecin, jamais une
// tâche terminée. Les tâches d'un patient ne s'affichent pas dans son dossier (décision du 07/10/2026).
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const col = () => collection(db, "espaces", A.ESPACE, "taches");
const nomConnecte = () => $("nomMenu").textContent;
const estMedecin = () => D().membre.role === "medecin";
let T = null, MB = null, VUE = "mes", TERM = false; // tâches lues (null = à lire), membres, onglet, terminées affichées

export const TYPES = ["Rappel perso", "Examens à voir", "Courriers à faire", "Rendez-vous ajouté/déplacé", "Question patient", "Question", "Autre"];
const STATUTS = [["afaire", "À faire"], ["encours", "En cours"], ["fait", "Terminée"]];
const libStatut = (s) => (STATUTS.find((z) => z[0] === s) || STATUTS[0])[1];
const ROLES = { medecin: "Médecin", infirmiere: "Infirmière", assistante: "Secrétaire" };

// ───── Lecture ─────
async function membres() {
  if (!MB) { const s = await getDocs(collection(db, "espaces", A.ESPACE, "membres")); MB = s.docs.map((d) => Object.assign({ uid: d.id }, d.data())).sort((a, b) => String(a.nom || a.email).localeCompare(String(b.nom || b.email))); }
  return MB;
}
const nomMembre = (m) => m ? String(m.nom || m.email || "").trim() : "";
// Le médecin lit toutes les tâches ; les autres celles où ils sont auteur ou responsable (même filtre que les règles)
async function charger() {
  const s = estMedecin() ? await getDocs(col()) : await getDocs(query(col(), where("qui", "array-contains", D().u.uid)));
  T = s.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}
const trouver = (id) => (T || []).find((t) => t.id === id);

// ───── Droits (les règles du serveur disent la même chose) ─────
// Modifier, réattribuer : l'auteur, le responsable, les médecins ; supprimer : l'auteur ou un médecin, jamais une tâche terminée
const peutModifier = (t) => estMedecin() || t.de === D().u.uid || t.pour === D().u.uid;
const peutSupprimer = (t) => (estMedecin() || t.de === D().u.uid) && t.statut !== "fait";

// ───── Affichage ─────
const retard = (t) => t.statut !== "fait" && !!t.ech && t.ech < D().t;
const ordre = (a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || (retard(b) ? 1 : 0) - (retard(a) ? 1 : 0) ||
  ((a.ech || "9999") + (a.h || "99")).localeCompare((b.ech || "9999") + (b.h || "99")) || (b.o || 0) - (a.o || 0);
// Date et heure locales d'un moment enregistré en ISO (UTC) : « 08/10/2026 à 00:25 »
const quand = (iso) => { const d = new Date(iso); if (isNaN(d)) return ""; const z = (n) => String(n).padStart(2, "0"); return z(d.getDate()) + "/" + z(d.getMonth() + 1) + "/" + d.getFullYear() + " à " + z(d.getHours()) + ":" + z(d.getMinutes()); };
const echeance = (t) => t.ech ? "Échéance : " + A.dfrA(t.ech) + (t.h ? " à " + t.h : "") : "";
function badges(t) {
  let h = t.urgent && t.statut !== "fait" ? '<span class="badge b-al">Urgent</span>' : "";
  if (retard(t)) h += '<span class="badge b-al">En retard</span>';
  else if (t.statut !== "fait" && t.ech === D().t) h += '<span class="badge b-or">Aujourd\'hui</span>';
  return h;
}
const nbCom = (t) => (t.fil || []).filter((f) => f.c).length;
function ligne(t) {
  const esc = A.esc, q = "'" + t.id + "'", moi = D().u.uid;
  const qui = t.de === t.pour ? "Pour soi-même (" + (t.de === moi ? "moi" : t.deNom) + ")" : "De " + (t.de === moi ? "moi" : t.deNom || "?") + " → pour " + (t.pour === moi ? "moi" : t.pourNom || "?");
  const pat = t.patientId ? '<button class="lien-p" onclick="event.stopPropagation();taPatient(' + q + ')">' + esc(t.patientNom || "Patient") + "</button>" : "";
  const fin = t.statut === "fait" ? "Terminée par " + esc(t.faitParNom || "?") + (t.faitLe ? " le " + quand(t.faitLe) : "") : "";
  return '<div class="tache st-' + t.statut + (retard(t) ? " retard" : "") + (t.urgent && t.statut !== "fait" ? " urgent" : "") + '" onclick="taOuvrir(' + q + ')">' +
    '<div class="tx"><div class="ti"><b>' + esc(t.titre) + "</b>" + badges(t) + "</div>" +
    '<div class="de">' + [t.type && t.titre.indexOf(t.type) !== 0 ? esc(t.type) : "", pat, t.ech ? '<span class="' + (retard(t) ? "rouge" : "") + '">' + esc(echeance(t)) + "</span>" : ""].filter(Boolean).join(" · ") + "</div>" +
    '<div class="de">' + esc(qui) + (fin ? " · " + fin : "") + (nbCom(t) ? ' · <span class="ta-com" title="Commentaires">' + A.ic("bulle") + nbCom(t) + "</span>" : "") + "</div></div>" +
    '<select class="st" aria-label="Statut de la tâche" onclick="event.stopPropagation()" onchange="taStatut(' + q + ',this.value)">' + STATUTS.map(([k, l]) => '<option value="' + k + '"' + (t.statut === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div>";
}

// ───── Filtres (T2, 08/10/2026) : recherche, responsable (onglet Toutes les tâches), statut, échéance, type ─────
const F0 = { q: "", qui: "", st: "ouv", ech: "", type: "" };
let F = Object.assign({}, F0);
const finSemaine = () => { const d = new Date(D().t + "T12:00:00"); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
function filtrer(l) {
  const mots = A.sansAcc(F.q).split(/\s+/).filter(Boolean), t0 = D().t, fs = finSemaine(), role = (uid) => ((MB || []).find((m) => m.uid === uid) || {}).role;
  return l.filter((t) => {
    if (mots.length) { const hay = A.sansAcc([t.titre, t.desc, t.type, t.patientNom, t.deNom, t.pourNom].join(" ")); if (!mots.every((w) => hay.indexOf(w) >= 0)) return false; }
    if (F.qui && VUE === "toutes") {
      const [k, v] = [F.qui.slice(0, 2), F.qui.slice(2)];
      if (k === "r:" && role(t.pour) !== v) return false; if (k === "u:" && t.pour !== v) return false; if (k === "d:" && t.de !== v) return false;
    }
    if (F.st === "ouv" ? false : F.st !== "tous" && t.statut !== F.st) return false;
    if (F.ech === "retard" && !retard(t)) return false;
    if (F.ech === "auj" && !(t.statut !== "fait" && t.ech === t0)) return false;
    if (F.ech === "sem" && !(t.statut !== "fait" && t.ech && t.ech <= fs)) return false; // en retard compris : à traiter cette semaine
    if (F.ech === "sans" && t.ech) return false;
    if (F.type && t.type !== F.type) return false;
    return true;
  });
}
const filtresActifs = () => Object.keys(F0).some((k) => F[k] !== F0[k] && !(k === "qui" && VUE !== "toutes"));

export async function pageTaches() {
  $("page").innerHTML = '<p class="sous">Chargement des tâches…</p>';
  try { await Promise.all([charger(), membres()]); }
  catch (e) { console.warn("tâches", e); $("page").innerHTML = '<div class="carte"><h3>Tâches</h3><p class="sous" style="color:var(--rouge)">Les tâches n\'ont pas pu être lues. Rechargez la page.</p></div>'; return; }
  if (!location.hash.startsWith("#taches")) return; // page quittée pendant la lecture
  dessiner();
}
const base = () => (VUE === "mes" ? T.filter((t) => t.pour === D().u.uid) : T);
function dessiner() {
  const esc = A.esc, moi = D().u.uid, mes = T.filter((t) => t.pour === moi);
  const onglet = (k, ico, lib, n) => '<button class="' + (VUE === k ? "on" : "") + '" onclick="taVue(\'' + k + '\')">' + A.ic(ico) + lib + ' <span class="nb">' + n + "</span></button>";
  const nbOuv = (x) => x.filter((t) => t.statut !== "fait").length;
  const sel = (id, lib, v, opts) => '<select id="' + id + '" aria-label="' + lib + '">' + opts.map(([k, l]) => (k === "—" ? '<optgroup label="' + esc(l) + '">' : k === "/—" ? "</optgroup>" : '<option value="' + esc(k) + '"' + (k === v ? " selected" : "") + ">" + esc(l) + "</option>")).join("") + "</select>";
  // Responsable : rôles et membres (médecin), « Demandées par moi » (tous) ; seulement dans « Toutes les tâches »
  const optsQui = [["", "Toute l'équipe"]].concat(estMedecin() ? [["r:medecin", "Pour les médecins"], ["r:assistante", "Pour les secrétaires"], ["r:infirmiere", "Pour les infirmières"], ["—", "Pour…"]].concat((MB || []).filter((m) => T.some((t) => t.pour === m.uid) || m.actif !== false).map((m) => ["u:" + m.uid, m.uid === moi ? "Moi" : nomMembre(m)])).concat([["/—", ""]]) : [["u:" + moi, "Pour moi"]]).concat([["d:" + moi, "Demandées par moi"]]);
  const types = TYPES.concat(T.map((t) => t.type).filter((x) => x && TYPES.indexOf(x) < 0)).filter((x, i, a) => a.indexOf(x) === i);
  let h = '<section class="accueil"><div><h2>Tâches</h2><p>Rappels, demandes et suivis de l\'équipe.</p></div><div class="actions"><button class="bt plein" onclick="taNouvelle()">' + A.ic("plus") + "Nouvelle tâche</button></div></section>" +
    '<div class="ag-vues" style="align-self:flex-start">' + onglet("mes", "profil", "Mes tâches", nbOuv(mes)) + onglet("toutes", "taches", "Toutes les tâches", nbOuv(T)) + "</div>" +
    '<div class="ta-filtres"><div class="recherche">' + A.ic("loupe") + '<input id="taQ" type="search" placeholder="Rechercher : titre, patient, personne…" autocomplete="off" value="' + esc(F.q) + '"></div>' +
    (VUE === "toutes" ? sel("taFqui", "Responsable", F.qui, optsQui) : "") +
    sel("taFst", "Statut", F.st, [["ouv", "À faire et en cours"], ["afaire", "À faire"], ["encours", "En cours"], ["fait", "Terminées"], ["tous", "Tous les statuts"]]) +
    sel("taFech", "Échéance", F.ech, [["", "Toutes les échéances"], ["retard", "En retard"], ["auj", "Aujourd'hui"], ["sem", "Cette semaine"], ["sans", "Sans échéance"]]) +
    sel("taFtype", "Type", F.type, [["", "Tous les types"]].concat(types.map((x) => [x, x]))) + "</div>" +
    '<section class="carte"><div class="ta-entete"><span class="sous" id="taNb"></span><button class="lien' + (filtresActifs() ? "" : " cache") + '" id="taFx" onclick="taEffacer()">Effacer les filtres</button></div><div id="taL"></div></section>';
  $("page").innerHTML = h;
  $("taQ").oninput = () => { F.q = $("taQ").value; liste(); };
  [["taFqui", "qui"], ["taFst", "st"], ["taFech", "ech"], ["taFtype", "type"]].forEach(([i, k]) => { if ($(i)) $(i).onchange = () => { F[k] = $(i).value; liste(); }; });
  liste();
}
// Liste seule (la recherche garde le curseur) : ouvertes, puis terminées (repliées quand le statut est « À faire et en cours »)
function liste() {
  const l = filtrer(base()), ouvertes = l.filter((t) => t.statut !== "fait").sort(ordre), finies = l.filter((t) => t.statut === "fait").sort((a, b) => String(b.faitLe || "").localeCompare(String(a.faitLe || "")));
  const actifs = filtresActifs(), n = F.st === "ouv" ? ouvertes.length : l.length;
  $("taNb").textContent = (VUE === "mes" ? "Les tâches dont vous êtes responsable" : estMedecin() ? "Toutes les tâches de l'équipe" : "Vos tâches et celles que vous avez demandées") + " · " + n + " tâche" + (n > 1 ? "s" : "") + (F.st === "ouv" ? " à faire" : "") + (actifs ? " (filtrées)" : "");
  $("taFx").classList.toggle("cache", !actifs);
  let h = ouvertes.map(ligne).join("");
  if (F.st === "ouv") {
    if (!ouvertes.length) h += '<p class="sous">' + (actifs ? "Aucune tâche ne correspond aux filtres." : "Aucune tâche à faire." + (VUE === "mes" ? " « Nouvelle tâche » pour en créer une." : "")) + "</p>";
    if (finies.length) h += '<button class="lien" style="margin-top:12px" onclick="taTerminees()">' + (TERM ? "▾ Masquer" : "▸ Afficher") + " les tâches terminées (" + finies.length + ")</button>" + (TERM ? '<div class="taches-finies">' + finies.map(ligne).join("") + "</div>" : "");
  } else {
    h += finies.map(ligne).join("");
    if (!l.length) h += '<p class="sous">Aucune tâche ne correspond aux filtres.</p>';
  }
  $("taL").innerHTML = h;
}
// Après une modification : page redessinée (nombres des onglets), filtres gardés
const raf = () => { if (location.hash.startsWith("#taches") && T && $("taL")) dessiner(); };
window.taVue = (k) => { VUE = k; if (T && $("taL")) dessiner(); else pageTaches(); };
window.taTerminees = () => { TERM = !TERM; liste(); };
window.taEffacer = () => { F = Object.assign({}, F0); if (T && $("taL")) dessiner(); };
window.taPatient = (id) => {
  const t = trouver(id); if (!t) return;
  if (!D().patients.some((p) => p.id === t.patientId)) { A.toast("Ce dossier n'existe plus ou n'est pas dans vos établissements."); return; }
  A.fermerFenetre(); window.ouvrirDossier(t.patientId);
};

// ───── Écriture : une entrée d'historique à chaque modification ─────
const entree = (txt, c) => Object.assign({ le: new Date().toISOString(), par: D().u.uid, parNom: nomConnecte(), txt }, c ? { c: true } : {});
async function ecrire(t, champs, txt, c) {
  const e = entree(txt, c), maj = Object.assign({}, champs, { fil: arrayUnion(e), maj: serverTimestamp(), majPar: D().u.uid });
  await updateDoc(doc(db, "espaces", A.ESPACE, "taches", t.id), maj);
  Object.assign(t, champs, { fil: (t.fil || []).concat([e]), majPar: D().u.uid });
}
const messageErreur = (e) => e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier cette tâche." : "Enregistrement impossible : " + ((e && e.message) || e);

window.taStatut = async (id, s) => {
  const t = trouver(id); if (!t || t.statut === s) return;
  const champs = { statut: s }, avant = t.statut;
  if (s === "fait") Object.assign(champs, { faitPar: D().u.uid, faitParNom: nomConnecte(), faitLe: new Date().toISOString() });
  else if (avant === "fait") Object.assign(champs, { faitPar: null, faitParNom: null, faitLe: null });
  try { await ecrire(t, champs, s === "fait" ? "Terminée" : avant === "fait" ? "Rouverte : " + libStatut(s) : "Statut : " + libStatut(s)); A.toast(s === "fait" ? "Tâche terminée." : "Statut : " + libStatut(s) + "."); }
  catch (e) { A.toast(messageErreur(e)); }
  if (ficheOuverte(id)) taFiche(t);
  raf();
};

// ───── Fiche d'une tâche : détails, statut, réattribution, fil (historique + commentaires), Modifier / Supprimer ─────
const ficheOuverte = (id) => $("fenetre") && !$("fenetre").classList.contains("cache") && $("taFiche") && $("taFiche").dataset.id === id;
function taFiche(t) {
  const esc = A.esc, q = "'" + t.id + "'", moi = D().u.uid;
  const champ = (lib, v) => v ? '<div class="large"><label>' + lib + "</label><div>" + v + "</div></div>" : "";
  // Responsable : changé ici par l'auteur, le responsable ou un médecin (tâche non terminée)
  const reattr = peutModifier(t) && t.statut !== "fait" && MB;
  const pour = reattr ? '<select id="taRe" aria-label="Pour">' + MB.filter((m) => m.actif !== false || m.uid === t.pour).map((m) => '<option value="' + esc(m.uid) + '"' + (m.uid === t.pour ? " selected" : "") + ">" + esc(m.uid === moi ? "Moi-même (" + nomMembre(m) + ")" : nomMembre(m)) + "</option>").join("") + '</select><button class="bt plein petit cache" id="taReOk" onclick="taReattribuer(' + q + ')">Réattribuer</button>' : esc(t.pourNom || "?");
  // Fil : dans l'ordre, les événements en petit, les commentaires en bulles
  const fil = (t.fil || []).map((f) => f.c
    ? '<div class="ta-c' + (f.par === moi ? " moi" : "") + '"><div class="qui"><b>' + esc(f.parNom || "") + "</b>" + esc(quand(f.le)) + '</div><div class="txt">' + esc(f.txt || "") + "</div></div>"
    : '<div class="ta-ev"><span class="dt">' + esc(quand(f.le).replace(" à ", " ")) + "</span><b>" + esc(f.parNom || "") + "</b> " + esc(f.txt || "") + "</div>").join("");
  A.fenetre('<div id="taFiche" data-id="' + esc(t.id) + '"><h3>' + esc(t.titre) + "</h3>" + '<div class="ti" style="margin:-6px 0 12px">' + badges(t) + "</div>" +
    '<div class="form">' + champ("Type", esc(t.type)) + champ("Description", t.desc ? '<div class="ta-desc">' + esc(t.desc) + "</div>" : "") +
    champ("Patient", t.patientId ? '<button class="lien-p" onclick="taPatient(' + q + ')">' + esc(t.patientNom || "Patient") + "</button>" : "") +
    champ("Échéance", t.ech ? esc(A.dfrA(t.ech) + (t.h ? " à " + t.h : "")) : "") +
    '<div><label>De la part de</label><div>' + esc(t.deNom || "?") + '</div></div><div><label' + (reattr ? ' for="taRe"' : "") + '>Pour</label><div class="ta-re">' + pour + "</div></div>" +
    '<div class="large"><label for="taSt">Statut</label><select id="taSt" onchange="taStatut(' + q + ',this.value)">' + STATUTS.map(([k, l]) => '<option value="' + k + '"' + (t.statut === k ? " selected" : "") + ">" + l + "</option>").join("") + "</select></div></div>" +
    '<h4 class="soustitre">Fil de la tâche</h4><div class="ta-fil" id="taFil">' + fil + "</div>" +
    '<div class="ta-ecrire"><textarea id="taCom" rows="2" placeholder="Écrire un commentaire (consigne, précision…)"></textarea><button class="bt plein" id="taComOk" onclick="taCommenter(' + q + ')">Envoyer</button></div>' +
    '<div class="err" id="fErr"></div><div class="boutons">' + (peutSupprimer(t) ? '<button class="bt gris" style="margin-right:auto;color:var(--rouge)" onclick="taSupprimer(' + q + ')">' + A.ic("corbeille") + "Supprimer</button>" : "") +
    (peutModifier(t) ? '<button class="bt clair" onclick="taModifier(' + q + ')">Modifier</button>' : "") + '<button class="bt plein" onclick="fermerFenetre()">Fermer</button></div></div>');
  const z = $("taFil"); z.scrollTop = z.scrollHeight; // le plus récent en bas, visible
  if ($("taRe")) $("taRe").onchange = () => $("taReOk").classList.toggle("cache", $("taRe").value === t.pour);
  $("taCom").onkeydown = (ev) => { if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); window.taCommenter(t.id); } };
}
// Ouverture : affichée tout de suite, puis relue (un collègue a pu commenter ou la modifier depuis)
window.taOuvrir = async (id) => {
  const t = trouver(id); if (!t) return; taFiche(t);
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "taches", id)).catch(() => null);
  if (!s || !s.exists() || (s.data().fil || []).length === (t.fil || []).length && s.data().statut === t.statut) return;
  Object.keys(t).forEach((k) => { if (k !== "id") delete t[k]; }); Object.assign(t, s.data());
  if (ficheOuverte(id) && !A.val("taCom")) taFiche(t); raf();
};
window.taCommenter = async (id) => {
  const t = trouver(id), txt = String(($("taCom") || {}).value || "").trim(); if (!t || !txt) { if ($("taCom")) $("taCom").focus(); return; }
  A.occupe($("taComOk"), true);
  try { await ecrire(t, {}, txt, true); if (ficheOuverte(id)) { taFiche(t); setTimeout(() => $("taCom") && $("taCom").focus(), 80); } raf(); }
  catch (e) { A.occupe($("taComOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de commenter cette tâche." : "Envoi impossible : " + ((e && e.message) || e)); }
};
window.taReattribuer = async (id) => {
  const t = trouver(id), uid = A.val("taRe"), moi = D().u.uid; if (!t || !uid || uid === t.pour || !peutModifier(t)) return;
  const m = (MB || []).find((z) => z.uid === uid), nom = nomMembre(m), perdue = !estMedecin() && t.de !== moi && uid !== moi;
  if (perdue && !confirm("Réattribuer la tâche à " + nom + " ?\n\nVous ne la verrez plus dans votre liste (seuls son auteur, la personne responsable et le médecin la voient).")) return;
  A.occupe($("taReOk"), true);
  try {
    await ecrire(t, { pour: uid, pourNom: nom, qui: [...new Set([t.de, uid])] }, "Réattribuée à " + nom);
    if (perdue) { T = T.filter((z) => z.id !== id); A.fermerFenetre(); } else if (ficheOuverte(id)) taFiche(t);
    A.toast("Tâche réattribuée à " + nom + "."); raf();
  } catch (e) { A.occupe($("taReOk"), false); A.erreur(messageErreur(e)); }
};
window.taModifier = (id) => { const t = trouver(id); if (t && peutModifier(t)) formulaire(t, null); };
window.taSupprimer = async (id) => {
  const t = trouver(id); if (!t || !peutSupprimer(t)) return;
  if (!confirm("Supprimer la tâche « " + t.titre + " » ?")) return;
  try { await deleteDoc(doc(db, "espaces", A.ESPACE, "taches", id)); T = T.filter((z) => z.id !== id); A.fermerFenetre(); A.toast("Tâche supprimée."); raf(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de supprimer cette tâche." : "Suppression impossible."); }
};

// ───── Nouvelle tâche / modifier : type, titre, description, pour qui, échéance, urgent, patient ─────
async function formulaire(t, pid) {
  const esc = A.esc, moi = D().u.uid;
  let mb; try { mb = (await membres()).filter((m) => m.actif !== false || (t && m.uid === t.pour)); } catch (e) { A.toast("La liste de l'équipe n'a pas pu être lue."); return; }
  const P = { id: t ? t.patientId || "" : pid || "", nom: t ? t.patientNom || "" : "" };
  if (P.id && !P.nom) { const x = D().patients.find((z) => z.id === P.id); P.nom = x ? x.r.nm : ""; }
  let type = t ? t.type || "" : "";
  const optsPour = '<option value="">— Choisir —</option>' + mb.map((m) => '<option value="' + esc(m.uid) + '"' + (t && t.pour === m.uid ? " selected" : "") + ">" + esc(m.uid === moi ? "Moi-même (" + nomMembre(m) + ")" : nomMembre(m) + " – " + (ROLES[m.role] || m.role || "")) + "</option>").join("");
  A.fenetre("<h3>" + (t ? "Modifier la tâche" : "Nouvelle tâche") + "</h3>" +
    '<div class="puces" id="taTypes" role="radiogroup" aria-label="Type de tâche">' + TYPES.map((x) => '<button type="button" class="puce' + (x === type ? " on" : "") + '" role="radio" aria-checked="' + (x === type) + '" data-t="' + esc(x) + '">' + esc(x) + "</button>").join("") + "</div>" +
    '<div class="form"><div class="large"><label for="taTitre">Titre</label><input id="taTitre" value="' + esc(t ? t.titre : "") + '" placeholder="Ex. Relancer le laboratoire"></div>' +
    '<div class="large"><label for="taDesc">Description <span class="mesures">(facultatif)</span></label><textarea id="taDesc" rows="3">' + esc(t ? t.desc || "" : "") + "</textarea></div>" +
    '<div class="large"><label for="taPour">Pour qui</label><select id="taPour">' + optsPour + "</select></div>" +
    '<div><label for="taEch">Échéance <span class="mesures">(facultatif)</span></label><input id="taEch" type="date" value="' + esc(t ? t.ech || "" : "") + '"></div>' +
    '<div><label for="taH">Heure <span class="mesures">(facultatif)</span></label><input id="taH" type="time" value="' + esc(t ? t.h || "" : "") + '"></div>' +
    '<div class="large"><label style="font-weight:normal;color:var(--encre)"><input id="taUrg" type="checkbox" style="width:auto;margin-right:8px"' + (t && t.urgent ? " checked" : "") + ">Urgent</label></div>" +
    '<div class="large" style="position:relative"><label for="taPq">Patient <span class="mesures">(facultatif)</span></label><div id="taPch"></div><input id="taPq" placeholder="Nom, prénom…" autocomplete="off"><div id="taPl" class="sug cache"></div></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="taOk">' + (t ? "Enregistrer" : "Créer la tâche") + "</button></div>");
  // Type rapide : préremplit le titre s'il est vide (ou s'il n'était que le type précédent)
  $("taTypes").onclick = (ev) => {
    const b = ev.target.closest("[data-t]"); if (!b) return; const avant = type; type = type === b.dataset.t ? "" : b.dataset.t;
    $("taTypes").querySelectorAll(".puce").forEach((p) => { const on = p.dataset.t === type; p.classList.toggle("on", on); p.setAttribute("aria-checked", on); });
    const ti = $("taTitre"); if (!ti.value.trim() || ti.value.trim() === avant) ti.value = type && type !== "Autre" ? type : "";
    ti.focus();
  };
  // Patient : recherche par nom, une puce une fois choisi (✕ pour le retirer)
  const puce = () => {
    $("taPch").innerHTML = P.id ? '<span class="puce on" style="display:inline-flex;align-items:center;gap:8px;margin-bottom:6px">' + esc(P.nom || "Patient") + '<button type="button" id="taPx" aria-label="Retirer le patient" style="background:none;border:0;color:#fff;padding:0;font-size:15px;line-height:1">✕</button></span>' : "";
    $("taPq").classList.toggle("cache", !!P.id); if (P.id) $("taPx").onclick = () => { P.id = ""; P.nom = ""; puce(); $("taPq").focus(); };
  };
  const sugg = () => {
    const m = A.sansAcc($("taPq").value).split(/\s+/).filter(Boolean), l = m.length ? D().patients.filter((x) => m.every((w) => A.sansAcc(x.r.nm).indexOf(w) >= 0)).slice(0, 8) : [];
    $("taPl").innerHTML = l.map((x) => '<div data-id="' + esc(x.id) + '"><b>' + esc(x.r.nm) + '</b> <span class="mesures">' + esc([x.r.ddn ? A.dfrA(x.r.ddn) : "", x.r.diag].filter(Boolean).join(" · ")) + "</span></div>").join("") || (m.length ? '<div class="mesures">Aucun patient trouvé.</div>' : "");
    $("taPl").classList.toggle("cache", !m.length);
  };
  $("taPq").oninput = sugg;
  $("taPl").onclick = (ev) => { const b = ev.target.closest("[data-id]"); if (!b) return; const x = D().patients.find((z) => z.id === b.dataset.id); P.id = x.id; P.nom = x.r.nm; $("taPq").value = ""; $("taPl").classList.add("cache"); puce(); };
  puce();

  $("taOk").onclick = async () => {
    const titre = A.val("taTitre"), desc = String($("taDesc").value || "").replace(/\s+$/, ""), pour = A.val("taPour"), ech = A.val("taEch"), h = ech ? A.val("taH") : "", urgent = $("taUrg").checked;
    if (!titre) { A.erreur("Donnez un titre à la tâche."); $("taTitre").focus(); return; }
    if (!pour) { A.erreur("Choisissez pour qui est la tâche."); $("taPour").focus(); return; }
    if (ech && !/^\d{4}-\d{2}-\d{2}$/.test(ech)) { A.erreur("Échéance : date invalide."); return; }
    const m = mb.find((z) => z.uid === pour), x = P.id ? D().patients.find((z) => z.id === P.id) : null;
    const champs = { titre, desc, type, urgent, ech, h, pour, pourNom: nomMembre(m), patientId: P.id || "", patientNom: P.id ? P.nom : "", etablissementId: x ? x.doc.etablissementId || "" : t && P.id === t.patientId ? t.etablissementId || "" : "" };
    A.occupe($("taOk"), true);
    try {
      if (t) {
        const chg = [], av = t; if (av.titre !== titre) chg.push("titre"); if ((av.desc || "") !== desc) chg.push("description"); if ((av.type || "") !== type) chg.push("type");
        if ((av.ech || "") !== ech || (av.h || "") !== h) chg.push(ech ? "échéance " + A.dfrA(ech) + (h ? " à " + h : "") : "échéance retirée");
        if (!!av.urgent !== urgent) chg.push(urgent ? "urgente" : "plus urgente"); if ((av.patientId || "") !== champs.patientId) chg.push(champs.patientId ? "patient " + champs.patientNom : "patient retiré");
        const reattr = av.pour !== pour;
        if (!chg.length && !reattr) { A.fermerFenetre(); return; }
        if (reattr) champs.qui = [...new Set([av.de, pour])];
        await ecrire(t, champs, [reattr ? "Réattribuée à " + champs.pourNom : "", chg.length ? "Modifiée : " + chg.join(", ") : ""].filter(Boolean).join(" ; "));
        A.fermerFenetre(); A.toast("Tâche enregistrée."); raf();
      } else {
        const n = Object.assign({ de: moi, deNom: nomConnecte(), qui: [...new Set([moi, pour])], statut: "afaire", fil: [entree(pour === moi ? "Créée (pour soi-même)" : "Créée pour " + champs.pourNom)], o: Date.now(), cree: serverTimestamp(), maj: serverTimestamp(), majPar: moi }, champs);
        const r = await addDoc(col(), n);
        if (T) T.push(Object.assign({ id: r.id }, n));
        A.fermerFenetre(); A.toast(pour === moi ? "Tâche créée." : "Tâche créée pour " + champs.pourNom + "."); raf();
      }
    } catch (e) { A.occupe($("taOk"), false); A.erreur(messageErreur(e)); }
  };
}
// Nouvelle tâche, depuis la page Tâches ou depuis le dossier d'un patient (patient déjà choisi)
window.taNouvelle = (pid) => formulaire(null, pid || "");
