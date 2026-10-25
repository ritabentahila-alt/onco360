// Onco360 – RCP (réunion de concertation pluridisciplinaire, étape 7, 09/10/2026).
// Dates : parametres/rcp = { data: JSON { jours: [1…6, 0], heure, lieu, plus: [dates ajoutées], annulees: [dates] } }
// (Paramètres › RCP, droit « paramètres ») ; un jour férié n'a pas de RCP (sauf date ajoutée à la main).
// Inscriptions : espaces/{e}/rcp/{id} = { patientId, patientNom, etablissementId, d (date de la RCP), q (question posée),
// ins (date d'inscription), fait, faitLe, faitPar, faitParNom, decision (id de la consultation « RCP »), decisionTxt,
// o, creePar, creeParNom, cree, majPar, majParNom, maj }. Lecture : tous les membres (périmètre) ; écriture : droit
// « ecrireConsultations » (médecin, secrétaire) ; suppression : médecin, ou qui a inscrit.
// Dossier : bouton « + RCP » de la barre des prescriptions (à côté de Doc.), inscriptions non faites dans « Rendez-vous et
// tâches à venir ». Page Tâches : onglet « RCP » (calendrier des semaines, période choisie, case Fait). Dossier ouvert depuis
// la liste : bulles Décision RCP (consultation « RCP ») · Valider (case Fait cochée, retour à la liste) · Fermer.
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { nouvelleConsultation, modifierConsultation, assurerConsultations } from "./consultations.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const col = () => collection(db, "espaces", A.ESPACE, "rcp");
const nomConnecte = () => $("nomMenu").textContent;
const peutEcrire = () => A.peut("ecrireConsultations");
const peutSupprimer = (r) => peutEcrire() && (D().membre.role === "medecin" || r.creePar === D().u.uid);
const trouver = (id) => (R || []).find((r) => r.id === id);
const patient = (pid) => D().patients.find((p) => p.id === pid);
const nomDe = (r) => { const x = patient(r.patientId); return x ? x.r.nm : r.patientNom || "Patient"; };
const tri = (a, b) => String(a.d).localeCompare(String(b.d)) || (a.o || 0) - (b.o || 0);

// ───── Dates de RCP ─────
export const CFG0 = () => ({ jours: [], heure: "", lieu: "", plus: [], annulees: [] });
let CFG = null;
export const configRcp = () => JSON.parse(JSON.stringify(CFG || CFG0()));
export const configChargee = () => CFG !== null;
export async function chargerConfigRcp() {
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "parametres", "rcp")).catch(() => null);
  let c = null; try { c = s && s.exists() ? JSON.parse(s.data().data || "{}") : null; } catch (e) { c = null; }
  CFG = Object.assign(CFG0(), c || {}); return configRcp();
}
export async function enregistrerConfigRcp(c) {
  await setDoc(doc(db, "espaces", A.ESPACE, "parametres", "rcp"), { data: JSON.stringify(c), maj: serverTimestamp(), majPar: D().u.uid });
  CFG = JSON.parse(JSON.stringify(c)); apresChangement();
}
const iso = (x) => x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
const jour = (d) => new Date(d + "T12:00:00");
export const ajouterJours = (d, n) => { const x = jour(d); x.setDate(x.getDate() + n); return iso(x); };
const ferie = (d) => (D().ctx.feries || []).some((f) => (typeof f === "string" ? f : f.d) === d);
// RCP prévue ce jour-là ? (jour de la semaine coché et pas férié, ou date ajoutée ; jamais une date annulée)
export function estRcp(d, c) {
  c = c || CFG || CFG0();
  if ((c.annulees || []).indexOf(d) >= 0) return false;
  if ((c.plus || []).indexOf(d) >= 0) return true;
  return (c.jours || []).indexOf(jour(d).getDay()) >= 0 && !ferie(d);
}
export function datesRcp(du, au, c) { const l = []; for (let d = du; d <= au && l.length < 400; d = ajouterJours(d, 1)) if (estRcp(d, c)) l.push(d); return l; }
export const prochainesRcp = (n, c, depuis) => datesRcp(depuis || D().t, ajouterJours(depuis || D().t, 400), c).slice(0, n);
const JS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], MS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const libDate = (d) => { const x = jour(d); return JS[x.getDay()] + " " + x.getDate() + " " + MS[x.getMonth()] + " " + x.getFullYear(); };
const heureLieu = (c) => [c.heure ? "à " + c.heure.replace(":", "h") : "", c.lieu || ""].filter(Boolean).join(" · ");

// ───── Lecture en direct (écoute ouverte au démarrage d'Onco360) ─────
let R = null, ECOUTE = null;
export function demarrerRcp() {
  if (ECOUTE) return;
  if (CFG === null) chargerConfigRcp().then(apresChangement);
  const m = D().membre;
  if (!m.tousEtablissements && !(m.etablissements || []).length) { R = []; return; }
  const q = m.tousEtablissements ? col() : query(col(), where("etablissementId", "in", (m.etablissements || []).slice(0, 30)));
  ECOUTE = onSnapshot(q, (s) => { R = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort(tri); apresChangement(); },
    (e) => { console.warn("RCP (écoute)", e); ECOUTE = null; if (R === null) R = []; apresChangement(); });
}
// Inscriptions non faites d'un patient (dossier : « Rendez-vous et tâches à venir »)
export const rcpDuPatient = (pid) => (R || []).filter((r) => r.patientId === pid && !r.fait);
export const nbRcpAFaire = () => (R || []).filter((r) => !r.fait).length;
function apresChangement() {
  majBadgeRcp(); // pastille du menu « RCP »
  if ($("rcpZone") && R && CFG) { if (!DU) periodeDefaut(); dessinerListe(); }
}

// ───── Inscrire en RCP (bouton « + RCP » du dossier) ─────
window.rcpInscrire = (pid) => { const x = patient(pid); if (x && peutEcrire()) formulaire(x, null); };
window.rcpModifier = (id) => { const r = trouver(id), x = r && patient(r.patientId); if (!r) return; if (!x) { A.toast("Ce dossier n'existe plus ou n'est pas dans vos établissements."); return; } if (peutEcrire()) formulaire(x, r); };
function formulaire(x, r) {
  const esc = A.esc, t = D().t, c = CFG || CFG0(), dates = prochainesRcp(12, c);
  if (r && r.d && dates.indexOf(r.d) < 0) dates.unshift(r.d);
  const choisie = r ? r.d : dates[0] || "";
  const autre = !choisie || dates.indexOf(choisie) < 0;
  const deja = (R || []).filter((z) => z.patientId === x.id && (!r || z.id !== r.id)).sort(tri).reverse();
  A.fenetre("<h3>" + (r ? "Modifier l'inscription en RCP" : "Inscrire en RCP") + "</h3>" +
    '<p class="sous" style="margin-top:-4px">' + esc(x.r.nm) + (x.r.diag ? " · " + esc(x.r.diag) : "") + "</p>" +
    '<div class="form"><div><label for="rcpD">Date de la RCP</label>' +
    (dates.length ? '<select id="rcpD">' + dates.map((d) => '<option value="' + d + '"' + (d === choisie ? " selected" : "") + ">" + esc(A.cap(libDate(d))) + (d === dates[0] && !r ? " (prochaine)" : "") + "</option>").join("") + '<option value="autre"' + (autre && dates.length ? " selected" : "") + ">Autre date…</option></select>" : "") +
    '<input id="rcpDa" type="date" value="' + esc(choisie || "") + '"' + (dates.length && !autre ? ' class="cache"' : "") + ' style="margin-top:6px" aria-label="Autre date de RCP"></div>' +
    '<div><label for="rcpIns">Date d\'inscription</label><input id="rcpIns" type="date" value="' + esc(r ? r.ins || "" : t) + '"></div>' +
    '<div class="large"><label for="rcpQ">Question posée à la RCP</label><textarea id="rcpQ" rows="5" class="cs-note" placeholder="Ex. Indication d\'une radiothérapie adjuvante ? Chimiothérapie néoadjuvante ?">' + esc(r ? r.q || "" : "") + "</textarea></div></div>" +
    (dates.length ? "" : '<p class="mesures">Aucune date de RCP réglée : choisissez la date, ou réglez les jours de RCP dans Paramètres › RCP.</p>') +
    (c.heure || c.lieu ? '<p class="mesures">RCP ' + esc(heureLieu(c)) + "</p>" : "") +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="rcpOk">' + (r ? "Enregistrer" : "Inscrire") + "</button></div>" +
    (deja.length ? '<h4 style="margin:18px 0 6px">Inscriptions de ce patient</h4>' + deja.map(ligneHisto).join("") : ""));
  if ($("rcpD")) $("rcpD").onchange = () => { const v = $("rcpD").value; $("rcpDa").classList.toggle("cache", v !== "autre"); if (v !== "autre") $("rcpDa").value = v; };
  $("rcpQ").focus();
  $("rcpOk").onclick = async () => {
    const v = $("rcpD") && $("rcpD").value !== "autre" ? $("rcpD").value : A.val("rcpDa"), ins = A.val("rcpIns"), q = String($("rcpQ").value || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { A.erreur("Choisissez la date de la RCP."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ins)) { A.erreur("Indiquez la date d'inscription."); return; }
    if (!q) { A.erreur("Écrivez la question posée à la RCP."); $("rcpQ").focus(); return; }
    if (!estRcp(v, c) && !confirm("Le " + libDate(v) + " n'est pas une date de RCP prévue dans Paramètres › RCP.\nInscrire quand même à cette date ?")) return;
    if (!r && (R || []).some((z) => z.patientId === x.id && z.d === v && !z.fait) && !confirm(x.r.nm + " est déjà inscrit(e) à la RCP du " + A.dfrA(v) + ".\nAjouter une autre question ?")) return;
    A.occupe($("rcpOk"), true);
    const maj = { d: v, ins, q, patientNom: x.r.nm, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
    try {
      if (r) { await updateDoc(doc(db, "espaces", A.ESPACE, "rcp", r.id), maj); Object.assign(r, maj); R.sort(tri); A.journal(x, "RCP modifiée : " + A.dfrA(v) + " – " + q); }
      else {
        const n = Object.assign({ patientId: x.id, etablissementId: x.doc.etablissementId || "", fait: false, o: Date.now(), creePar: D().u.uid, creeParNom: nomConnecte(), cree: serverTimestamp() }, maj);
        const ref = await addDoc(col(), n); if (R && !trouver(ref.id)) { R.push(Object.assign({ id: ref.id }, n)); R.sort(tri); }
        A.journal(x, "Inscrit(e) en RCP du " + A.dfrA(v) + " : " + q);
      }
      A.fermerFenetre(); A.toast(r ? "Inscription modifiée." : "Inscrit(e) à la RCP du " + A.dfrA(v) + "."); raf(x.id);
    } catch (e) { A.occupe($("rcpOk"), false); A.erreur(e && e.code === "permission-denied" ? "Vous n'avez pas le droit d'inscrire en RCP." : "Enregistrement impossible : " + ((e && e.message) || e)); }
  };
}
// Une inscription (fenêtre du patient)
function ligneHisto(r) {
  const esc = A.esc;
  return '<div class="rcp-h"><span class="badge ' + (r.fait ? "b-ch" : r.d < D().t ? "b-al" : "b-co") + '">' + A.dfrA(r.d) + "</span>" +
    '<div class="tx"><b>' + esc(r.q || "") + '</b><div class="mesures">Inscrit(e) le ' + A.dfrA(r.ins) + (r.creeParNom ? " par " + esc(r.creeParNom) : "") + (r.fait ? " · fait" + (r.faitParNom ? " (" + esc(r.faitParNom) + ")" : "") : r.d < D().t ? " · décision à saisir" : "") + "</div>" +
    (r.decisionTxt ? '<div class="rcp-dec">' + esc(r.decisionTxt) + "</div>" : "") + "</div>" +
    (peutEcrire() ? '<div class="actr"><button class="mini" onclick="rcpModifier(\'' + r.id + '\')">Modifier</button>' + (peutSupprimer(r) ? '<button class="mini r" onclick="rcpSupprimer(\'' + r.id + '\')">Désinscrire</button>' : "") + "</div>" : "") + "</div>";
}
// Flèche ▾ à côté de « + RCP » : toutes les inscriptions du patient
window.rcpHistorique = (pid) => {
  const x = patient(pid); if (!x) return;
  const l = (R || []).filter((r) => r.patientId === pid).sort(tri).reverse();
  A.fenetre("<h3>RCP de " + A.esc(x.r.nm) + "</h3>" + (l.length ? l.map(ligneHisto).join("") : '<p class="sous">Aucune inscription en RCP.</p>') +
    '<div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Fermer</button>' + (peutEcrire() ? '<button class="bt plein" onclick="rcpInscrire(\'' + pid + '\')">' + A.ic("plus") + "Inscrire en RCP</button>" : "") + "</div>");
};
window.rcpSupprimer = async (id) => {
  const r = trouver(id); if (!r || !peutSupprimer(r)) return;
  if (!confirm("Désinscrire " + nomDe(r) + " de la RCP du " + A.dfrA(r.d) + " ?\n\nQuestion : " + (r.q || "") + (r.decision ? "\n\nLa consultation « RCP » déjà écrite reste dans le dossier." : ""))) return;
  try {
    await deleteDoc(doc(db, "espaces", A.ESPACE, "rcp", id)); R = R.filter((z) => z.id !== id);
    const x = patient(r.patientId); if (x) A.journal(x, "Désinscrit(e) de la RCP du " + A.dfrA(r.d));
    A.toast("Inscription retirée."); if ($("fenetre") && !$("fenetre").classList.contains("cache")) A.fermerFenetre(); raf(r.patientId); apresChangement();
  } catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de retirer cette inscription." : "Suppression impossible."); }
};
// Dossier affiché : redessiné (rendez-vous à venir)
const raf = (pid) => { if (location.hash === "#dossier/" + encodeURIComponent(pid)) A.pageDossier(pid); };

// ───── Case « Fait » ─────
async function marquer(r, oui) {
  const maj = oui ? { fait: true, faitLe: D().t, faitPar: D().u.uid, faitParNom: nomConnecte() } : { fait: false, faitLe: "", faitPar: "", faitParNom: "" };
  Object.assign(maj, { majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() });
  await updateDoc(doc(db, "espaces", A.ESPACE, "rcp", r.id), maj); Object.assign(r, maj);
  const x = patient(r.patientId); if (x) A.journal(x, "RCP du " + A.dfrA(r.d) + (oui ? " : faite" : " : case Fait décochée"));
}
window.rcpFait = async (id, el) => {
  const r = trouver(id); if (!r) return;
  if (!peutEcrire()) { el.checked = !!r.fait; return; }
  try { await marquer(r, el.checked); apresChangement(); }
  catch (e) { el.checked = !!r.fait; A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la RCP." : "Enregistrement impossible."); }
};

// ───── Onglet « RCP » de la page Tâches ─────
let MOIS = null, DU = null, AU = null, FILTRE = "tous";
const lundi = (d) => ajouterJours(d, -((jour(d).getDay() + 6) % 7));
const finMois = (m) => { const x = jour(m + "-01"); x.setMonth(x.getMonth() + 1); x.setDate(0); return iso(x); };
const semaineIso = (d) => { const x = jour(d); x.setDate(x.getDate() + 3 - ((x.getDay() + 6) % 7)); const j1 = new Date(x.getFullYear(), 0, 4, 12); return 1 + Math.round(((x - j1) / 864e5 - 3 + ((j1.getDay() + 6) % 7)) / 7); };
// Période par défaut : la semaine de la prochaine RCP (ou la semaine en cours)
function periodeDefaut() {
  const p = prochainesRcp(1)[0] || (R || []).filter((r) => r.d >= D().t).map((r) => r.d)[0] || D().t;
  DU = lundi(p); AU = ajouterJours(DU, 6); MOIS = p.slice(0, 7);
}
// R-B1 (19/10/2026, demande du 17/10) : page « RCP » du menu principal, juste sous Tâches (avant : onglet de la page Tâches, #taches/rcp
// y renvoie) ; même contenu : calendrier des semaines, période, Tous / À faire / Faits, case Fait, impression
export function pageRcpMenu() {
  $("page").innerHTML = htmlOngletRcp(); // Lot B (25/10/2026) : plus de titre de page, les onglets de la RCP en haut
  pageRcp(); majBadgeRcp();
}
const majBadgeRcp = () => { const e = $("nbRcp"), n = nbRcpAFaire(); if (e) { e.textContent = n; e.classList.toggle("cache", !n); e.title = n + " inscription" + (n > 1 ? "s" : "") + " en RCP sans décision"; } };
export function htmlOngletRcp() { return '<div id="rcpZone"><p class="sous">Chargement des RCP…</p></div>'; }
export function pageRcp() { if (R && CFG) { if (!DU) periodeDefaut(); dessinerListe(); } } // sinon : dessinée à la fin de la lecture
function dessinerListe() {
  const z = $("rcpZone"); if (!z) return;
  const esc = A.esc, t = D().t, c = CFG || CFG0();
  const dansPer = (R || []).filter((r) => r.d >= DU && r.d <= AU);
  const retard = (R || []).filter((r) => !r.fait && r.d < t);
  // Calendrier du mois : une ligne par semaine (numéro = toute la semaine), un clic sur un jour = ce jour
  const nb = {}; (R || []).forEach((r) => { const o = nb[r.d] || (nb[r.d] = { n: 0, f: 0 }); o.n++; if (r.fait) o.f++; });
  const m1 = MOIS + "-01", mf = finMois(MOIS);
  let cal = '<div class="rcp-cal" role="grid" aria-label="Calendrier des RCP"><span class="tt">Sem.</span>' + ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((j) => '<span class="tt">' + j + "</span>").join("");
  for (let s = lundi(m1); s <= mf; s = ajouterJours(s, 7)) {
    const fs = ajouterJours(s, 6), toute = DU === s && AU === fs;
    cal += '<button class="sem' + (toute ? " on" : "") + '" onclick="rcpPer(\'' + s + "','" + fs + '\')" title="Semaine du ' + A.dfrA(s) + " au " + A.dfrA(fs) + '">S' + semaineIso(s) + "</button>";
    for (let i = 0; i < 7; i++) {
      const d = ajouterJours(s, i), o = nb[d], rc = estRcp(d, c), sel = d >= DU && d <= AU;
      cal += '<button class="j' + (d.slice(0, 7) !== MOIS ? " hors" : "") + (rc ? " rcp" : "") + (sel ? " sel" : "") + (d === t ? " auj" : "") + '" onclick="rcpPer(\'' + d + "','" + d + '\')" aria-label="' + esc(libDate(d)) + (rc ? ", RCP" : "") + (o ? ", " + o.n + " dossier(s)" : "") + '">' + jour(d).getDate() +
        (o ? '<i class="' + (o.f === o.n ? "ok" : d < t ? "ret" : "") + '">' + o.n + "</i>" : rc ? '<i class="vide"></i>' : "") + "</button>";
    }
  }
  cal += "</div>";
  const moisLib = A.cap(MS[+MOIS.slice(5, 7) - 1]) + " " + MOIS.slice(0, 4);
  const prochaine = prochainesRcp(1)[0];
  let h = '<section class="carte rcp-haut"><div class="rcp-gauche"><div class="rcp-nav"><button class="sa-fl" onclick="rcpMois(-1)" aria-label="Mois précédent">‹</button><b>' + moisLib + '</b><button class="sa-fl" onclick="rcpMois(1)" aria-label="Mois suivant">›</button></div>' + cal +
    '<p class="mesures" style="margin:8px 0 0"><span class="rcp-leg rcp"></span>jour de RCP' + (c.heure || c.lieu ? " (" + esc(heureLieu(c)) + ")" : "") + ' · chiffre = dossiers inscrits</p></div>' +
    '<div class="rcp-droite"><div class="lbl">Période</div><div class="rcp-per"><label>Du <input type="date" id="rcpDu" value="' + DU + '"></label><label>au <input type="date" id="rcpAu" value="' + AU + '"></label></div>' +
    '<div class="puces" style="margin-top:8px">' + (prochaine ? '<button class="puce' + (DU === prochaine && AU === prochaine ? " on" : "") + '" onclick="rcpPer(\'' + prochaine + "','" + prochaine + '\')">Prochaine RCP (' + A.dfr(prochaine) + ")</button>" : "") +
    '<button class="puce" onclick="rcpPer(\'' + lundi(t) + "','" + ajouterJours(lundi(t), 6) + '\')">Cette semaine</button><button class="puce" onclick="rcpPer(\'' + t.slice(0, 7) + "-01','" + finMois(t.slice(0, 7)) + '\')">Ce mois</button></div>' +
    '<div class="lbl" style="margin-top:6px">Afficher</div><div class="puces">' + [["tous", "Tous"], ["afaire", "À faire"], ["fait", "Faits"]].map(([k, l]) => '<button class="puce' + (FILTRE === k ? " on" : "") + '" onclick="rcpFiltre(\'' + k + '\')">' + l + "</button>").join("") + "</div>" +
    (c.jours && c.jours.length || (c.plus || []).length ? "" : '<p class="mesures">Aucun jour de RCP réglé : Paramètres › RCP.</p>') + "</div></section>";
  if (retard.length) h += '<div class="rcp-alerte">' + A.ic("alerte") + "<span><b>" + retard.length + " dossier" + (retard.length > 1 ? "s" : "") + "</b> de RCP passée" + (retard.length > 1 ? "s" : "") + ' sans case « Fait » cochée.</span><button class="lien" onclick="rcpRetard()">Les afficher</button></div>';
  // Liste : par date de RCP (avec les dates de RCP de la période sans inscrit)
  const L = dansPer.filter((r) => FILTRE === "tous" || (FILTRE === "fait" ? r.fait : !r.fait));
  const jours = Array.from(new Set(L.map((r) => r.d).concat(FILTRE === "fait" ? [] : datesRcp(DU, AU, c)))).sort();
  const per = DU === AU ? "le " + libDate(DU) : "du " + A.dfrA(DU) + " au " + A.dfrA(AU);
  h += '<section class="carte"><div class="ta-entete"><span class="sous">RCP ' + esc(per) + " · " + L.length + " dossier" + (L.length > 1 ? "s" : "") + (FILTRE === "afaire" ? " à faire" : FILTRE === "fait" ? " faits" : "") + "</span>" +
    (L.length ? '<button class="bt gris petit" data-fn="rcp.impression" onclick="rcpImprimer()" title="Imprimer la liste des dossiers de la période">' + A.ic("imprimer") + "Imprimer</button>" : "") + "</div>";
  if (!jours.length) h += '<p class="vide-c">Aucune RCP ni aucun dossier inscrit sur cette période.</p>';
  jours.forEach((d) => {
    const l = L.filter((r) => r.d === d), nf = l.filter((r) => r.fait).length;
    h += '<div class="rcp-j"><h4>' + esc(A.cap(libDate(d))) + (estRcp(d, c) && c.heure ? " · " + esc(c.heure.replace(":", "h")) : "") + '<span class="mesures">' + (l.length ? l.length + " dossier" + (l.length > 1 ? "s" : "") + (nf ? " · " + nf + " fait" + (nf > 1 ? "s" : "") : "") : "aucun dossier inscrit") + "</span></h4>";
    if (l.length) h += '<div class="rcp-l ent"><span>Patient</span><span>Question</span><span>Décision</span><span>Inscrit le</span><span class="c">Fait</span></div>' + l.map(ligneListe).join("");
    h += "</div>";
  });
  z.innerHTML = h + "</section>";
  $("rcpDu").onchange = () => { const v = $("rcpDu").value; if (!v) return; DU = v; if (AU < DU) AU = DU; MOIS = DU.slice(0, 7); dessinerListe(); };
  $("rcpAu").onchange = () => { const v = $("rcpAu").value; if (!v) return; AU = v; if (AU < DU) DU = AU; dessinerListe(); };
}
function ligneListe(r) {
  const esc = A.esc, x = patient(r.patientId), q = "'" + r.id + "'";
  const age = x && x.P.ddn ? (() => { let a = +D().t.slice(0, 4) - +x.P.ddn.slice(0, 4); if (D().t.slice(5) < x.P.ddn.slice(5)) a--; return a + " ans"; })() : "";
  return '<div class="rcp-l' + (r.fait ? " fait" : r.d < D().t ? " ret" : "") + '">' +
    '<div class="rpat">' + (x ? '<button class="lien-l" onclick="rcpOuvrir(' + q + ')" title="Ouvrir le dossier (décision, puis Valider)">' + esc(nomDe(r)) + "</button>" : "<b>" + esc(nomDe(r)) + "</b>") +
      '<div class="mesures">' + esc([age, x ? x.r.diag : ""].filter(Boolean).join(" · ")) + "</div></div>" +
    '<div class="q" data-l="Question">' + esc(r.q || "") + "</div>" +
    '<div class="dec" data-l="Décision">' + (r.decisionTxt ? esc(r.decisionTxt) : r.decision ? "Saisie" : "") + "</div>" +
    '<div class="ins mesures" data-l="Inscrit le">' + A.dfrA(r.ins) + (r.creeParNom ? "<br>" + esc(r.creeParNom) : "") + "</div>" +
    '<div class="c"><label class="rcp-ck" title="' + (r.fait ? "Fait le " + A.dfrA(r.faitLe) + (r.faitParNom ? " par " + esc(r.faitParNom) : "") : "Cocher quand le dossier est passé en RCP") + '"><input type="checkbox"' + (r.fait ? " checked" : "") + (peutEcrire() ? "" : " disabled") + ' onchange="rcpFait(' + q + ',this)"><span>Fait</span></label>' +
      (peutEcrire() ? '<button class="ico" title="Modifier l\'inscription" aria-label="Modifier l\'inscription" onclick="rcpModifier(' + q + ')"><svg class="pi"><use href="#i-crayon"/></svg></button>' + (peutSupprimer(r) ? '<button class="ico rouge" title="Désinscrire" aria-label="Désinscrire" onclick="rcpSupprimer(' + q + ')">✕</button>' : "") : "") + "</div></div>";
}
window.rcpPer = (du, au) => { DU = du; AU = au; if (du.slice(0, 7) !== MOIS && au.slice(0, 7) !== MOIS) MOIS = du.slice(0, 7); dessinerListe(); };
window.rcpMois = (n) => { const x = jour(MOIS + "-01"); x.setMonth(x.getMonth() + n); MOIS = iso(x).slice(0, 7); dessinerListe(); };
window.rcpFiltre = (k) => { FILTRE = k; dessinerListe(); };
window.rcpRetard = () => { const l = (R || []).filter((r) => !r.fait && r.d < D().t); if (!l.length) return; DU = l[0].d; AU = ajouterJours(D().t, -1); FILTRE = "afaire"; MOIS = DU.slice(0, 7); dessinerListe(); };
// Fiche à imprimer pour la réunion : dossiers de la période, par date
window.rcpImprimer = () => {
  const esc = A.esc, c = CFG || CFG0(), L = (R || []).filter((r) => r.d >= DU && r.d <= AU && (FILTRE === "tous" || (FILTRE === "fait" ? r.fait : !r.fait)));
  const jours = Array.from(new Set(L.map((r) => r.d))).sort();
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>RCP ' + esc(DU === AU ? A.dfrA(DU) : A.dfrA(DU) + " – " + A.dfrA(AU)) + '</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;font-size:11px;color:#1E2A44}h1{font-size:17px;margin:0 0 2px}p{margin:0 0 10px;color:#64708A}h2{font-size:13px;margin:14px 0 4px;color:#24365F}table{width:100%;border-collapse:collapse}th,td{border:1px solid #CCD3E0;padding:5px 6px;text-align:left;vertical-align:top}th{background:#EAF0FA}td.dec{width:32%;height:46px}</style></head><body>' +
    "<h1>Réunion de concertation pluridisciplinaire</h1><p>" + esc(DU === AU ? A.cap(libDate(DU)) : "Du " + A.dfrA(DU) + " au " + A.dfrA(AU)) + (heureLieu(c) ? " · " + esc(heureLieu(c)) : "") + " · " + L.length + " dossier" + (L.length > 1 ? "s" : "") + " · imprimé le " + A.dfrA(D().t) + "</p>" +
    jours.map((d) => "<h2>" + esc(A.cap(libDate(d))) + "</h2><table><tr><th>N°</th><th>Patient</th><th>Âge</th><th>Diagnostic</th><th>Question posée</th><th>Décision</th></tr>" + L.filter((r) => r.d === d).map((r, i) => {
      const x = patient(r.patientId); let a = ""; if (x && x.P.ddn) { a = +D().t.slice(0, 4) - +x.P.ddn.slice(0, 4); if (D().t.slice(5) < x.P.ddn.slice(5)) a--; a += " ans"; }
      return "<tr><td>" + (i + 1) + "</td><td>" + esc(nomDe(r)) + "</td><td>" + esc(a) + "</td><td>" + esc(x ? x.r.diag || "" : "") + "</td><td>" + esc(r.q || "") + '</td><td class="dec">' + esc(r.decisionTxt || "") + "</td></tr>";
    }).join("") + "</table>").join("") + "</body></html>";
  let w = null; try { w = window.open("", "_blank"); } catch (er) { w = null; }
  if (!w || !w.document) { A.toast("Autorisez l'ouverture des fenêtres pour imprimer la liste."); return; }
  w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
};

// ───── Dossier ouvert depuis la liste RCP : Décision RCP · Valider · Fermer (barre d'actions du dossier) ─────
let COURANT = null;
window.rcpOuvrir = (id) => { const r = trouver(id); if (!r) return; if (!patient(r.patientId)) { A.toast("Ce dossier n'existe plus ou n'est pas dans vos établissements."); return; } COURANT = id; window.ouvrirDossier(r.patientId); };
window.addEventListener("hashchange", () => { const r = COURANT && trouver(COURANT); if (r && location.hash !== "#dossier/" + encodeURIComponent(r.patientId)) COURANT = null; });
// R-G a (audit n° 5, 19/10/2026) : plus de bulle flottante, la RCP (date, question, décision) et ses boutons sont à droite de la barre d'actions
export function bulleRcp(x) {
  const r = COURANT && trouver(COURANT); if (!r || r.patientId !== x.id) return "";
  const esc = A.esc;
  return '<div class="rcp-bulle" role="region" aria-label="RCP"><div class="lbl" title="' + esc((r.q || "") + (r.decisionTxt ? "\nDécision : " + r.decisionTxt : "")) + '">' + A.ic("rcp") + "<span><b><span class=\"lg\">RCP du " + A.dfrA(r.d) + '</span><span class="sm">RCP ' + A.dfrA(r.d).slice(0, 5) + "</span></b>" + (r.fait ? " · faite" : "") + '</span><span class="q">' + esc(r.q || "") + "</span>" +
    (r.decisionTxt ? '<span class="q dec"><b>Décision :</b> ' + esc(r.decisionTxt) + "</span>" : "") + "</div>" +
    '<div class="bts">' + (peutEcrire() ? '<button class="bt clair" onclick="rcpDecision()">' + A.ic(r.decision ? "crayon" : "plus") + (r.decision ? '<span class="lg">Modifier la décision</span><span class="sm">Décision</span>' : '<span class="lg">Décision RCP</span><span class="sm">Décision</span>') + "</button>" +
      '<button class="bt vert" onclick="rcpValider()"><svg class="i"><use href="#i-check"/></svg>Valider</button>' : "") +
    '<button class="bt fonce" onclick="rcpFermer()"><svg class="i"><use href="#i-retour"/></svg>Fermer</button></div></div>';
}
const retourListe = () => { COURANT = null; location.hash = "rcp"; };
window.rcpFermer = () => retourListe();
// Décision : nouvelle consultation « RCP » (question reprise dans la note), ou la consultation déjà écrite
window.rcpDecision = async () => {
  const r = COURANT && trouver(COURANT), x = r && patient(r.patientId); if (!x || !peutEcrire()) return;
  const apres = async (cid, base) => {
    const m = /D[ée]cision\s*:\s*([\s\S]*)$/i.exec(base.note || ""), txt = String(m ? m[1] : base.note || "").trim().slice(0, 600);
    const maj = { decision: cid, decisionTxt: txt, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() };
    try { await updateDoc(doc(db, "espaces", A.ESPACE, "rcp", r.id), maj); Object.assign(r, maj); } catch (e) { console.warn("RCP décision", e); A.toast("La décision est dans la consultation, mais n'a pas pu être reliée à la RCP."); }
  };
  if (r.decision) {
    const L = await assurerConsultations(x).catch(() => null);
    if (L && L.some((c) => c.id === r.decision)) { modifierConsultation(x.id, r.decision, apres); return; }
  }
  const d = r.d <= D().t ? r.d : D().t; // consultation « RCP » ; titre = date de la séance si la décision est écrite un autre jour
  nouvelleConsultation(x.id, { type: "RCP", titre: d === r.d ? "" : "Séance du " + A.dfrA(r.d), d, note: "Question : " + (r.q || "") + "\n\nDécision : " }, apres);
};
window.rcpValider = async () => {
  const r = COURANT && trouver(COURANT); if (!r || !peutEcrire()) return;
  if (!r.decision && !confirm("Aucune décision n'a été saisie (bouton « Décision RCP »).\nCocher « Fait » quand même ?")) return;
  try { if (!r.fait) await marquer(r, true); A.toast(nomDe(r) + " : RCP faite."); retourListe(); }
  catch (e) { A.toast(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de modifier la RCP." : "Enregistrement impossible."); }
};

// ───── Suivi du dossier ─────
export async function suivreEtablissementRcp(x, etab) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) if (d.data().etablissementId !== etab) await updateDoc(d.ref, { etablissementId: etab, majPar: D().u.uid, majParNom: nomConnecte(), maj: serverTimestamp() }).catch((e) => console.warn("RCP", d.id, e));
}
export async function supprimerRcp(x) {
  const s = await getDocs(query(col(), where("patientId", "==", x.id))).catch(() => null); if (!s) return;
  for (const d of s.docs) await deleteDoc(d.ref).catch((e) => console.warn("RCP", d.id, e));
}
