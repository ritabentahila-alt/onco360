// Onco360 – Salle d'attente (étape 6, 08/10/2026) : page « Salle d'attente » du menu (entre Agenda et Patients).
// Un jour (aujourd'hui par défaut ; bandeau de la semaine, flèches jour par jour, calendrier) : rendez-vous de consultation (tous
// les types sauf hospitalisation) et séances de chimiothérapie (J1, J8…).
// Parcours : À venir → En salle d'attente (heure d'arrivée) → En consultation → Vu (= « Venu » du rendez-vous, fenêtre de
// prix ; chimio : « Venu » de la consultation de chimio, la cure étant validée dans le dossier) ; ou Absent (= « Non venu »,
// avec report possible du rendez-vous).
// espaces/{e}/salle/{jour_patient_clé} = { jour, patientId, etablissementId, cle ("r-RDV" ou "c-LIGNE-CURE-JOUR"), etat
// ("" | salle | consult | vu | absent), motif (chimio ; celui des rendez-vous est dans le rendez-vous : mo), arr / deb / fin
// (heure en ms) avec arrPar / arrNom…, sp (auteur de Vu / Absent), prixLe (prix changé : les autres écrans relisent), maj, majPar }.
// « En salle » et « En consultation » ne sont notés que là : le statut du rendez-vous reste « Prévu » jusqu'à « Vu »
// (bilan, agenda et Google Agenda inchangés). Vu et Absent d'un rendez-vous restent dans le rendez-vous (rdvsJson) et sont
// recopiés ici pour les autres écrans (temps réel).
// Droits : tout membre « Met en salle » (infirmière comprise) ; Démarrer, Valider, Absent, Retour : droit « rendezvous »
// (médecin, secrétaire). Prix (colonne, total, fenêtre de prix) : droit « encaissements » ; la secrétaire enregistre le prix par
// le serveur (prixConsultation). Jours passés : validation seulement ; jours à venir : consultation (et motif).
// Colonnes au choix de chaque personne (utilisateurs/{uid}.salleCachees) ; commentaire du jour (com) écrit par tout membre.
// Fiabilité (SA4, 10/10/2026) : chaque action est une transaction qui relit la ligne sur le serveur (une action d'un collègue
// n'est plus effacée ; une action devenue impossible est refusée avec un message) ; n° d'ordre tiré d'un compteur
// salleOrdre/{jour_établissement} ; heures corrigées d'après l'horloge du serveur et affichées à l'heure du Maroc ; passage
// automatique au nouveau jour à minuit.
import { collection, doc, getDoc, getDocs, setDoc, query, where, serverTimestamp, onSnapshot, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { typeRdv, joursH, T_RTC } from "../moteur/rdv.js";
import { lignesSalle, ongletDe, ongletOuverture, dansPeriode as periodeOk, correspond, cleNum as cleNumM, trierSalle, hhmm, MIDI, idDoc } from "../moteur/salle.js"; // calculs purs (SA7)
import { addJ } from "../moteur/outils.js";
import { hmMaroc, jourMaroc, minutesMaroc } from "../moteur/heure.js";
import { tarif } from "../moteur/tarifs.js";
import { oublierEncaissements } from "./chimio.js";
import { reglages } from "./reglages.js";

let A = null;
export function installer(api) { A = api; }
const D = () => A.D();
const $ = (i) => document.getElementById(i);
const col = () => collection(db, "espaces", A.ESPACE, "salle");
// Minutes d'attente : orange, puis rouge (Paramètres › Alertes, parametres/reglages.salle ; par défaut 20 et 45)
const seuils = () => { const s = (reglages().salle) || {}; return [s.orange || 20, s.rouge || 45]; };
// Documents lus (id → données) : le jour même (écoute) et le jour affiché. Toute modification fait avancer GEN, qui invalide les
// lignes gardées en mémoire (SA5, 10/10/2026)
let GEN = 0;
class Memoire extends Map { set(k, v) { GEN++; return super.set(k, v); } delete(k) { GEN++; return super.delete(k); } }
const SA = new Memoire();
let MED = null; // 20/10/2026 (demande de Dr Bentahila) : filtre « Médecin » à partir de 2 médecins (null = pas encore choisi : le médecin connecté voit les siens)
let ECOUTE = null, VUE = "salle", AUTO = true, GARDE = false, PRET = false, FILTRES = false, ETAB = "", RETOUR = null, MINUT = null, JOUR = null, LU = {}, PER = "jour", RECH = "";
const triPerso = () => (D().profil && D().profil.salleTri) || "rdv"; // rdv | arrivee | alpha (réglage personnel)

// Horloge : écart entre cet ordinateur et le serveur (mesuré sur l'écho de nos propres écritures), pour que les heures d'arrivée et
// les attentes soient les mêmes sur tous les postes même si une horloge est fausse ; affichage à l'heure du Maroc.
let ECART = 0, ECRIT = 0;
const maintenant = () => Date.now() + ECART;
function noterEcart(ts) { const v = ts && typeof ts.toMillis === "function" ? ts.toMillis() : null; if (v && Date.now() - ECRIT < 15000) ECART = v - Date.now(); }
// Heure du Maroc d'Onco360 (S1, 21/10/2026 : table des changements d'heure de moteur/heure.js, pas les données horaires du navigateur)
const hm = (ms) => (ms ? hmMaroc(ms) : "");
// Heure du Maroc, horloge corrigée (R-A3, 18/10/2026 : créneaux du jour) : { d: "AAAA-MM-JJ", m: minutes depuis minuit }
export const hmMaintenant = () => hmMaroc(maintenant()); // « 14:05 », heure du Maroc, horloge corrigée (reçu : Visa accueil)
export function heureMaroc() { const t = maintenant(); return { d: jourMaroc(t), m: minutesMaroc(t) }; }
const minutes = (ms) => Math.max(0, Math.floor((maintenant() - ms) / 60000));
const duree = (m) => (m < 60 ? m + " min" : Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0"));
const peutRdv = () => A.peut("rendezvous");
const voitPrix = () => A.peut("finances") || A.peut("encaissements");
const nomConnecte = () => A.nomAgissant(); // Lot C : au nom du titulaire pour un remplaçant
const jourVu = () => JOUR || D().t;
const filtresEtab = () => { const m = D().membre; return m.tousEtablissements ? [] : [where("etablissementId", "in", (m.etablissements || []).length ? m.etablissements : ["—"])]; };

// ───── Temps réel : documents du jour, dans le périmètre de la personne connectée ─────
export function demarrerSalle() {
  if (ECOUTE) return;
  let premier = true;
  ECOUTE = onSnapshot(query(col(), where("jour", "==", D().t), ...filtresEtab()), (s) => {
    const autres = [], arrivees = [];
    s.docChanges().forEach((c) => {
      const av = SA.get(c.doc.id);
      if (c.type === "removed") SA.delete(c.doc.id); else SA.set(c.doc.id, c.doc.data());
      const d = c.doc.data(); if (!premier && d && d.majPar !== D().u.uid) autres.push(d.patientId);
      if (!premier && d && d.majPar !== D().u.uid && d.etat === "salle" && (!av || av.etat !== "salle") && A.estMed() && reglages().salle.notifArrivee !== false) arrivees.push(d);
      if (d && d.majPar === D().u.uid) noterEcart(d.maj);
    });
    premier = false; PRET = true;
    // Écriture d'un collègue : le dossier concerné et ses prix sont relus (statut du rendez-vous, prix, nouveau patient)
    Promise.all([...new Set(autres)].map(relire)).then(() => { apresChangement(); arrivees.forEach((d) => { const x = D().patients.find((p) => p.id === d.patientId); if (x) message(x.r.nm + " est arrivé(e) en salle d'attente" + (d.ordre ? " (n° " + fmtOrdre(d.ordre) + ")" : "") + (d.arrNom ? " · " + d.arrNom : "") + "."); }); });
    apresChangement();
  }, (e) => { console.warn("salle d'attente (écoute)", e); ECOUTE = null; PRET = true; });
  ECRIT = Date.now(); ecrirePresence(); // première mesure de l'écart d'horloge (écho de la présence)
  setInterval(nouveauJour, 60000);
  setInterval(() => { if (location.hash.startsWith("#salle") && $("saL") && maintenant() - AJOUR >= 60000 && !occupe()) actualiser(false); }, 10000); // R-A4 : chaque minute
}
// ───── « Actualiser » (R-A4, 18/10/2026, demande du 17/10) ─────
// Relit les fiches de la salle du jour affiché, les dossiers qui ont quelque chose ce jour-là, leurs prix et encaissements, puis redessine
// ligne par ligne (onglet, tri, défilement et ligne ouverte gardés). Toute seule chaque minute, sauf pendant une fenêtre ou une saisie (faite
// juste après) ; elle ne relit alors les dossiers que si leur écoute en direct ne marche pas (sinon ils sont déjà à jour : une lecture par
// dossier modifié). Le bouton relit tout.
let AJOUR = 0, RELECTURE = false;
const occupe = () => { const a = document.activeElement; return !$("fenetre").classList.contains("cache") || !!(a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)); };
async function actualiser(manuel) {
  if (RELECTURE) return; RELECTURE = true; const bt = $("saAct"), j = jourVu(); if (bt && manuel) A.occupe(bt, true);
  try {
    const s = await getDocs(query(col(), where("jour", "==", j), ...filtresEtab())), vus = new Set();
    s.docs.forEach((d) => { vus.add(d.id); SA.set(d.id, d.data()); });
    [...SA.keys()].forEach((k) => { if (k.indexOf(j + "_") === 0 && !vus.has(k)) SA.delete(k); });
    const pids = [...new Set(lignes([j]).map((l) => l.pid))];
    if (manuel || !A.ecouteDossiers()) await Promise.all(pids.map(relire));
    pids.forEach((pid) => { oublierEncaissements(pid); delete CHARGE[pid]; });
    GEN++; AJOUR = maintenant(); apresChangement(); majAJour();
    if (manuel) A.toast("Salle d'attente à jour (" + hm(AJOUR) + ").");
  } catch (e) { console.warn("salle d'attente (actualiser)", e); if (manuel) A.toast("Actualisation impossible : vérifiez la connexion, puis réessayez."); }
  finally { RELECTURE = false; if (bt && manuel) A.occupe(bt, false); }
}
const majAJour = () => { const e = $("saAjour"); if (e) e.textContent = AJOUR ? "à jour à " + hm(AJOUR).replace(":", " h ") : ""; };
window.saActualiser = () => actualiser(true);
// Écran resté ouvert après minuit : Onco360 se recharge sur le nouveau jour (sauf fenêtre ou saisie en cours : message)
function nouveauJour() {
  const j = jourMaroc(maintenant()); // minuit à l'heure du Maroc (S1)
  if (j <= D().t) return;
  const saisie = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if ($("fenetre") && $("fenetre").classList.contains("cache") && !saisie) location.reload();
  else A.toast("Nouveau jour : terminez votre saisie, puis rechargez la page (Cmd + R).");
}
async function relire(pid) {
  if (!pid) return;
  oublierEncaissements(pid); delete CHARGE[pid];
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "patients", pid)).catch(() => null); if (!s || !s.exists()) return;
  let x = D().patients.find((p) => p.id === pid);
  if (x) { if ((s.data().version || 1) !== (x.doc.version || 1)) A.recalculer(x, s.data()); return; }
  x = { id: pid }; A.recalculer(x, s.data()); D().patients.push(x); D().patients.sort((a, b) => String(a.r.nm).localeCompare(String(b.r.nm)));
}
// R-C1 (19/10/2026) : « Patients à reprogrammer » : fiches des N derniers jours lues une fois (jours pas encore lus), puis les séances
// « Absent, sans reporter » (moteur/reprogrammer.js fait le tri)
let ABS_N = 0;
export async function chargerJoursPasses(n) { if (ABS_N >= n) return false; ABS_N = n; const t = D().t; for (let g = 1; g <= n; g++) { const j = addJ(t, -g); if (!LU[j]) await lireJour(j); } return true; }
export const fichesAbsentes = () => [...SA.values()].filter((d) => d && d.etat === "absent");
// Jour affiché autre qu'aujourd'hui : ses documents sont lus une fois (pas d'écoute)
async function lireJour(j) {
  if (j === D().t) return;
  const s = await getDocs(query(col(), where("jour", "==", j), ...filtresEtab())).catch((e) => { console.warn("salle d'attente (" + j + ")", e); return null; });
  if (s) s.docs.forEach((d) => SA.set(d.id, d.data()));
  LU[j] = 1;
}
// Badge de salle d'attente (agenda, tableau de bord) : « En salle · 12 min », « En consultation · 5 min », « Vu 10:42 », « Absent » ;
// cle = "r-RDV" ou "chimio" (première séance de chimio du patient ce jour-là). Mis à jour en direct (majBadges).
export function badgeSalle(pid, cle) { return '<span class="sa-badge" data-sa="' + A.esc(pid + "|" + cle) + '">' + contenuBadge(lignes([D().t]), pid, cle) + "</span>"; }
function contenuBadge(L, pid, cle) {
  const l = L.find((z) => z.pid === pid && (cle === "chimio" ? !!z.chimio : z.cle === cle)); if (!l) return "";
  const d = l.doc;
  if (l.etat === "salle") { const m = minutes(d.arr || maintenant()); return '<span class="pst ' + (m >= seuils()[1] ? "rouge" : m >= seuils()[0] ? "orange" : "salle") + '"><i></i>En salle · ' + duree(m) + "</span>"; }
  if (l.etat === "consult") return '<span class="pst consult"><i></i>En consultation · ' + duree(minutes(d.deb || maintenant())) + "</span>";
  if (l.etat === "vu" && cle === "chimio") return '<span class="pst vu"><i></i>Vu' + (d.fin ? " " + hm(d.fin) : "") + "</span>";
  return "";
}
function majBadges() {
  const z = document.querySelectorAll(".sa-badge[data-sa]"); if (!z.length) return;
  const L = lignes([D().t]); z.forEach((e) => { const i = e.dataset.sa.indexOf("|"); e.innerHTML = contenuBadge(L, e.dataset.sa.slice(0, i), e.dataset.sa.slice(i + 1)); });
}
setInterval(() => { if (A && D()) { majBadges(); majBulles(); alerteRouge(); } }, 30000); // minutes des badges, bulles, attente au rouge
// Messages à l'écran (SA6, 11/10/2026) : « patient arrivé » (médecin), « attente au rouge » (secrétaire), réglables (Paramètres › Alertes)
function message(m) {
  let z = $("notifs"); if (!z) { z = document.createElement("div"); z.id = "notifs"; z.setAttribute("role", "status"); z.setAttribute("aria-live", "polite"); document.body.appendChild(z); }
  const n = document.createElement("div"); n.className = "notif";
  n.innerHTML = '<button class="tx"><svg class="i"><use href="#i-salle"/></svg><span>' + A.esc(m) + '</span></button><button class="x" aria-label="Fermer">✕</button>';
  n.querySelector(".tx").onclick = () => { n.remove(); JOUR = D().t; VUE = "salle"; AUTO = false; GARDE = true; if (location.hash.startsWith("#salle")) dessiner(); else location.hash = "salle"; };
  n.querySelector(".x").onclick = () => n.remove();
  z.appendChild(n); while (z.children.length > 4) z.firstChild.remove();
  setTimeout(() => n.remove(), 15000);
}
const ROUGES = new Set();
function alerteRouge() {
  if (D().membre.role !== "assistante" || reglages().salle.notifRouge === false) return;
  lignes([D().t]).forEach((l) => { if (l.etat !== "salle" || !l.doc.arr || ROUGES.has(l.cle + l.doc.arr)) return; if (minutes(l.doc.arr) >= seuils()[1]) { ROUGES.add(l.cle + l.doc.arr); message(l.x.r.nm + " attend depuis " + duree(minutes(l.doc.arr)) + "."); } });
}
// R-A4 : dossiers changés sur un autre poste (écoute de v2.js) : leurs prix et encaissements relus, salle et pastilles mises à jour
export function dossiersChanges(ids) { (ids || []).forEach((pid) => { oublierEncaissements(pid); delete CHARGE[pid]; }); GEN++; apresChangement(); }
function apresChangement() {
  majBadges();
  const n = lignes([D().t]).filter((l) => l.etat === "salle").length, e = $("nbSalle");
  if (e) { e.textContent = n; e.classList.toggle("cache", !n); e.title = n + " patient" + (n > 1 ? "s" : "") + " en salle d'attente"; }
  if (location.hash.startsWith("#salle") && $("saL")) dessiner();
  majBulles();
}

// ───── Lignes d'un ou plusieurs jours ─────
// Une ligne = { jour, cle, pid, x, h, type, cls, motif, etat, doc, rdv | chimio } ; jours = liste de dates AAAA-MM-JJ.
// Gardées en mémoire tant que rien ne change (documents de la salle : GEN ; dossiers : nombre et versions) : les badges de
// l'Agenda et du tableau de bord, les minutes et chaque action ne refont plus le calcul complet (SA5, 10/10/2026).
const CACHE = new Map();
const empreinte = () => { let v = 0; D().patients.forEach((x) => { v += (x.doc && x.doc.version) || 1; }); return GEN + ":" + D().patients.length + ":" + v; };
export function lignes(jours) {
  const J = jours || [jourVu()], k = J.join(","), e = empreinte(), c = CACHE.get(k);
  if (c && c.e === e) return c.out;
  const out = calculerLignes(J); CACHE.set(k, { e: empreinte(), out });
  if (CACHE.size > 12) CACHE.delete(CACHE.keys().next().value);
  return out;
}
function calculerLignes(jours) {
  return lignesSalle({ patients: D().patients, jours, ctx: D().ctx, doc: (id) => SA.get(id), docs: SA.values(), voitChimio: A.voit("traitements"),
    consPaye: voitPrix() ? (x, lid, n, j) => { const E = encDe(x); return !!(E && E.cons && E.cons[lid + "|" + n + "|" + j]); } : null });
}
// Médecin d'une ligne : rendez-vous = son médecin (sinon le titulaire) ; séance de chimio = médecin de la ligne, sinon du patient, sinon le titulaire
const medLigneSalle = (l) => { if (l.rdv) return A.medRdv(l.rdv); const L = l.chimio && (l.x.P.lignes || []).find((z) => z.id === l.chimio.lid); return (L && L.med) || ((l.x.doc.identite || {}).med) || A.medRdv({}); };
const dansFiltre = (l) => (!ETAB || (l.x.doc.etablissementId || "") === ETAB) && !(MED && A.multiMed() && medLigneSalle(l) !== MED);

// ───── Prix : validé (consultation vue) ou prévu (tarif de l'établissement à cette date) ─────
const CHARGE = {}; // prix à encaisser demandés (une lecture par patient)
let REDESSIN = null;
function encDe(x) {
  if (CHARGE[x.id] === 1) return undefined; // lecture en cours
  const E = A.encaissementsDe(x, () => { delete CHARGE[x.id]; GEN++; clearTimeout(REDESSIN); REDESSIN = setTimeout(() => { if ($("saL")) dessiner(); }, 60); });
  if (E === undefined) CHARGE[x.id] = 1;
  return E;
}
function prixDe(l) {
  if (!voitPrix() || l.etat === "absent") return null;
  const etab = l.x.doc.etablissementId || "", T = A.tarifsVus();
  if (l.etat === "vu") {
    const E = encDe(l.x); if (E === undefined) return { m: null, charge: true };
    if (l.rdv) { const o = E && E.rdv && E.rdv[l.rdv.id]; if (o) return { m: o.tj != null ? o.tj * (joursH(l.rdv) || 1) : o.b != null ? o.b : o.m, ok: true, v1: !!o.v1, np: o.mode === "np" || o.mode === "ae", mode: o.mode }; if (l.rdv.type === T_RTC) return { m: 0, ok: true }; }
    else { const v = E && E.cons && E.cons[l.chimio.lid + "|" + l.chimio.n + "|" + l.chimio.j]; if (v) return { m: v.m, ok: true, np: v.mode === "np" || v.mode === "ae", mode: v.mode }; }
    return { m: null, nonValide: true };
  }
  if (l.doc.prix != null) return { m: l.doc.prix, convenu: true }; // prix convenu d'avance (patient qui paie avant la consultation)
  if (l.rdv) { if (l.rdv.type === T_RTC) return { m: 0 }; const t = T && tarif(T, etab, l.rdv.act || typeRdv(l.rdv.type), l.jour); return { m: t ? t.brut : null }; }
  if (l.chimio.j > 1) return { m: 0 };
  const t = T && tarif(T, etab, "cchimio", l.jour); return { m: t ? t.brut : null };
}
window.saPrix = (pid, cle) => {
  const l = trouver(pid, cle); if (!l || !A.peutPrix()) return;
  if (l.etat !== "vu") { prixAvance(l); return; }
  if (l.rdv) window.prixRdv(pid, l.rdv.id); else window.chVenuChimio(pid, l.chimio.lid, l.chimio.n, l.chimio.j);
};
// Prix d'une consultation pas encore vue (le patient paie avant) : gardé dans la salle d'attente, proposé à la validation
export const prixPrevu = (pid, cle, jour) => { const d = SA.get(idDoc(jour, pid, cle)); return d && d.prix != null ? d.prix : null; };
// 26/10/2026 (lot E, étendu à la Salle d'attente) : ✕ en haut à droite des fenêtres, Échap ferme (data-echap, v2.js) ; boutons b1 (un seul) / b2 / b3
const X = '<span data-echap="1" hidden></span><button type="button" class="b3 fen-x" onclick="fermerFenetre()" aria-label="Fermer" title="Fermer (Échap)">✕</button>';
function prixAvance(l) {
  const p = prixDe(l) || {}, fmt = (v) => A.fmtMil(v);
  A.fenetre(X + "<h3>Prix – " + A.esc(l.x.r.nm) + '</h3><p class="sous">' + A.esc(l.type) + " · " + A.cap(A.jourLong(l.jour)) + (l.h ? " à " + l.h : "") + '</p><div class="form"><div><label for="saPx">Montant (DH)</label><input id="saPx" class="mt" inputmode="decimal" value="' + A.esc(p.m != null ? fmt(p.m) : "") + '"></div></div>' +
    '<p class="mesures">Pour un patient qui paie avant la consultation (réduction, gratuité : 0). Ce montant sera proposé dans la fenêtre de prix à la validation.</p>' +
    '<div class="err" id="fErr"></div><div class="boutons">' + (l.doc.prix != null ? '<button class="b2" id="saPxT" style="margin-right:auto">Revenir au tarif</button>' : "") + '<button class="b2" onclick="fermerFenetre()">Annuler</button><button class="b1" id="fOk">Enregistrer</button></div>');
  const fin = (m) => essayer(async () => { await ecrire(l, m == null ? { prix: null, prixPar: null, prixNom: null } : Object.assign({ prix: m }, qui("prix"))); A.fermerFenetre(); A.toast("Prix enregistré."); });
  if ($("saPxT")) $("saPxT").onclick = () => fin(null);
  $("fOk").onclick = () => { const m = parseFloat(A.val("saPx").replace(/[\s\u202f\u00a0]/g, "").replace(",", ".")); if (isNaN(m) || m < 0) { A.erreur("Indiquez le montant (0 si gratuit)."); return; } fin(m); };
}

// ───── Écriture d'un document (jour, patient, ligne) ─────
// opts.attendu : étapes depuis lesquelles l'action est possible (sinon refus : un collègue a agi entre-temps) ;
// opts.ordre : donner le n° d'ordre de passage (compteur du jour et de l'établissement) si la ligne n'en a pas.
const LIB_ETAT = { "": "à venir", salle: "en salle d'attente", consult: "en consultation", vu: "vu", absent: "absent" };
const propre = (o) => { Object.keys(o).forEach((k) => { if (o[k] === undefined || o[k] === null) delete o[k]; }); return o; };
async function ecrire(l, maj, opts) {
  opts = opts || {};
  const id = idDoc(l.jour, l.pid, l.cle), etab = l.x.doc.etablissementId || "", ref = doc(col(), id), base = { jour: l.jour, patientId: l.pid, etablissementId: etab, cle: l.cle, majPar: D().u.uid };
  const avant = SA.get(id); SA.set(id, propre(Object.assign({ etat: "" }, avant || {}, maj, base))); apresChangement(); // affichage immédiat
  ECRIT = Date.now();
  try {
    const d = await runTransaction(db, async (t) => {
      const s = await t.get(ref), cur = s.exists() ? s.data() : { etat: "" };
      if (opts.attendu && opts.attendu.indexOf(cur.etat || "") < 0) { const e = new Error(l.x.r.nm + " est déjà " + (LIB_ETAT[cur.etat] || cur.etat) + (cur.finNom || cur.debNom || cur.arrNom ? " (" + (cur.finNom || cur.debNom || cur.arrNom) + ")" : "") + "."); e.cur = cur; throw e; }
      const n = propre(Object.assign({ etat: "" }, cur, maj, base, { maj: serverTimestamp() }));
      if (opts.ordre && !cur.ordre) {
        const rc = doc(db, "espaces", A.ESPACE, "salleOrdre", l.jour + "_" + etab), sc = await t.get(rc);
        let m = sc.exists() ? sc.data().n || 0 : 0; SA.forEach((z) => { if (z && z.jour === l.jour && (z.etablissementId || "") === etab && z.ordre > m && z !== SA.get(id)) m = z.ordre; });
        n.ordre = m + 1; t.set(rc, { jour: l.jour, etablissementId: etab, n: n.ordre, majPar: D().u.uid });
      }
      t.set(ref, n); return n;
    });
    SA.set(id, Object.assign({}, d, { maj: null })); apresChangement(); return d;
  } catch (e) {
    if (e && e.cur) SA.set(id, e.cur); else if (avant) SA.set(id, avant); else SA.delete(id);
    apresChangement();
    throw new Error(e && e.cur ? e.message : e && e.code === "permission-denied" ? "Vous n'avez pas le droit de faire cette modification." : "Enregistrement impossible : " + ((e && e.message) || e));
  }
}
const qui = (k) => ({ [k + "Par"]: D().u.uid, [k + "Nom"]: nomConnecte() });
const trouver = (pid, cle, jour) => lignes([jour || jourVu()]).find((l) => l.pid === pid && l.cle === cle) || (!jour && jourVu() !== D().t ? lignes([D().t]).find((l) => l.pid === pid && l.cle === cle) : null);
const essayer = (f) => f().catch((e) => A.toast(e.message || String(e)));

// ───── Actions ─────
// N° d'ordre de passage : attribué à l'arrivée, à la suite des arrivées du jour du même établissement (0001, 0002…), par le
// compteur salleOrdre (ecrire, opts.ordre) : deux arrivées au même moment n'ont jamais le même numéro
const fmtOrdre = (n) => (n ? String(n).padStart(4, "0") : "");
// Un patient = une arrivée (SA6, 11/10/2026) : ses autres lignes du jour (rendez-vous + séance de chimio) suivent, même n°
const autresLignes = (l, etats) => lignes([l.jour]).filter((z) => z.pid === l.pid && z.cle !== l.cle && etats.indexOf(z.etat) >= 0);
async function suivre(l, etats, maj) { for (const z of autresLignes(l, etats)) { try { await ecrire(z, maj, { attendu: etats }); } catch (e) { /* ligne changée par un collègue : laissée telle quelle */ } } }
window.saEnSalle = (pid, cle) => essayer(async () => {
  const l = trouver(pid, cle); if (!l || l.jour !== D().t) return;
  const d = await ecrire(l, Object.assign({ etat: "salle", arr: maintenant(), deb: null, debPar: null, debNom: null }, qui("arr")), { attendu: [""], ordre: true });
  await suivre(l, [""], Object.assign({ etat: "salle", arr: d.arr, ordre: d.ordre }, qui("arr")));
  A.toast(l.x.r.nm + " : en salle d'attente (" + hm(maintenant()) + (d.ordre ? ", n° " + fmtOrdre(d.ordre) : "") + ").");
});
window.saDemarrer = (pid, cle) => essayer(async () => {
  const l = trouver(pid, cle); if (!l || !peutRdv() || l.jour !== D().t) return;
  const m = { etat: "consult", deb: maintenant() }; if (!l.doc.arr) Object.assign(m, { arr: m.deb }, qui("arr"));
  const d = await ecrire(l, Object.assign(m, qui("deb")), { attendu: ["", "salle"], ordre: true });
  await suivre(l, ["", "salle"], Object.assign({ etat: "consult", deb: d.deb, arr: d.arr, ordre: d.ordre }, qui("deb")));
  window.ouvrirDossier(pid);
});
window.saRetour = (pid, cle) => essayer(async () => {
  const l = trouver(pid, cle, D().t) || trouver(pid, cle); if (!l || !peutRdv()) return;
  await ecrire(l, { etat: "salle", deb: null, debPar: null, debNom: null }, { attendu: ["consult"] });
  await suivre(l, ["consult"], { etat: "salle", deb: null, debPar: null, debNom: null });
  A.toast(l.x.r.nm + " : retour en salle d'attente."); location.hash = "salle";
});
// Patient suivant (SA6) : le premier de la file « En salle » passe en consultation et son dossier s'ouvre
const fileSalle = () => trier(lignes([D().t]).filter((l) => dansFiltre(l) && l.etat === "salle"), "salle");
window.saSuivant = () => { const l = fileSalle()[0]; if (!l) { A.toast("Personne en salle d'attente."); return; } window.saDemarrer(l.pid, l.cle); };
// Ordre de la file (SA6) : monter / descendre un patient « En salle » (rang = place entre ses voisins)
window.saBouger = (pid, cle, s) => {
  const f = fileSalle(), i = f.findIndex((l) => l.pid === pid && l.cle === cle); if (i < 0) return;
  const a = s < 0 ? f[i - 1] : f[i + 1], b = s < 0 ? f[i - 2] : f[i + 2]; if (!a) return;
  const rang = b ? (cleNum(a) + cleNum(b)) / 2 : cleNum(a) + s * 60000;
  essayer(() => ecrire(f[i], { rang }, { attendu: ["salle"] }));
};
// Valider : rendez-vous → « Venu » (fenêtre de prix) ; chimio → « Venu » de la consultation de chimio (fenêtre de prix)
window.saValider = (pid, cle, depuisDossier) => {
  const l = depuisDossier ? trouver(pid, cle, D().t) : trouver(pid, cle); if (!l || !peutRdv() || l.jour > D().t) return;
  RETOUR = depuisDossier ? cle : null;
  if (l.rdv) { window.statutRdv(pid, l.rdv.id, "fait"); return; }
  if (!A.peutPrix()) { A.toast("Vous n'avez pas le droit de valider la consultation de chimiothérapie."); return; }
  if (!l.chimio.recue && !confirm("La " + (l.chimio.j === 1 ? "cure" : "séance J" + l.chimio.j) + " n'est pas encore validée dans le dossier.\n\nValider quand même la consultation ?")) return;
  window.chVenuChimio(pid, l.chimio.lid, l.chimio.n, l.chimio.j);
};
// Absent : rendez-vous → fenêtre « Absent » (report possible, v2.js) ; séance de chimio → fenêtre « Reporter » du dossier
// (raison « Patient absent », cette séance seulement ou toute la suite) ou « Absent, sans reporter » (08/10/2026). Le report
// change la date dans le protocole : la séance quitte ce jour (elle reste dans « Absents » avec la nouvelle date).
window.saAbsent = (pid, cle) => {
  const l = trouver(pid, cle); if (!l || !peutRdv() || l.jour > D().t) return;
  if (l.rdv) { window.statutRdv(pid, l.rdv.id, "absent"); return; }
  const marquer = (nd) => essayer(() => ecrire(l, Object.assign({ etat: "absent", sp: D().u.uid, rep: nd || null, motif: l.motif, fin: maintenant() }, qui("fin"))));
  const i = l.x.P.lignes.findIndex((z) => z.id === l.chimio.lid);
  if (i < 0 || !(A.traitMod() || A.peut("planningChimio"))) { if (confirm(l.x.r.nm + " : marquer absent(e) à la séance de chimiothérapie ?\n\n(Le report de la séance se fait par le médecin.)")) marquer(null); return; }
  if (l.chimio.j === 1) window.chReporter(pid, i, l.chimio.n - 1, marquer); else window.chReporterJ(pid, i, l.chimio.n - 1, l.chimio.j, marquer);
};
window.saEncaisser = (pid, cle) => { const l = trouver(pid, cle); if (!l) return; if (l.rdv) window.prixRdv(pid, l.rdv.id, true); else window.chVenuChimio(pid, l.chimio.lid, l.chimio.n, l.chimio.j, true); };
window.saRecu = (pid, cle) => { const l = trouver(pid, cle); if (!l) return; if (l.rdv) window.recuRdv(pid, l.rdv.id); else window.recuCons(pid, l.chimio.lid + "|" + l.chimio.n + "|" + l.chimio.j); };
// Annuler : retour à l'étape précédente (Vu → En consultation, Absent → À venir, En salle → À venir, En consultation → En salle)
window.saAnnuler = (pid, cle) => {
  const l = trouver(pid, cle); if (!l) return;
  if (l.etat === "salle") { if (!confirm("Annuler l'arrivée de " + l.x.r.nm + " (retour dans « À venir ») ?")) return; essayer(async () => { await ecrire(l, { etat: "", arr: null, arrPar: null, arrNom: null, ordre: null, rang: null }, { attendu: ["salle"] }); await suivre(l, ["salle"], { etat: "", arr: null, arrPar: null, arrNom: null, ordre: null, rang: null }); }); return; }
  if (!peutRdv()) return;
  if (l.etat === "consult") { window.saRetour(pid, cle); return; }
  if (l.rdv) { window.statutRdv(pid, l.rdv.id, "prevu"); return; }
  const annulable = A.estMed() || l.doc.sp === D().u.uid;
  if (!annulable) { A.toast("Statut posé par le médecin : lui seul peut l'annuler."); return; }
  if (l.etat === "vu") { if (A.peutPrix()) window.chAnnulerVenuChimio(pid, l.chimio.lid, l.chimio.n, l.chimio.j); return; }
  essayer(() => ecrire(l, { etat: "", fin: null, finPar: null, finNom: null, sp: null }));
};
window.saMotif = (pid, cle) => {
  const l = trouver(pid, cle); if (!l || !peutRdv()) return;
  A.fenetre(X + "<h3>Motif de consultation – " + A.esc(l.x.r.nm) + '</h3><div class="form"><div class="large"><label for="saMo">Motif</label><input id="saMo" value="' + A.esc(l.rdv ? l.rdv.mo || "" : l.doc.motif || "") + '" placeholder="Ex. nouveau patient, résultats du scanner, douleur…"></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="b2" onclick="fermerFenetre()">Annuler</button><button class="b1" id="fOk">Enregistrer</button></div>');
  $("fOk").onclick = async () => {
    const mo = A.val("saMo"); A.occupe($("fOk"), true);
    try {
      if (l.rdv) {
        const R = JSON.parse(l.x.doc.rdvsJson || "[]"), r = R.find((v) => v.id === l.rdv.id); if (!r) throw new Error("Rendez-vous introuvable.");
        if (mo) r.mo = mo; else delete r.mo;
        await A.enregistrer(l.x, { rdvsJson: JSON.stringify(R) }, "Motif de consultation : " + (mo || "retiré"));
        if (l.jour === D().t) await ecrire(l, {}); // les autres écrans relisent le dossier
      } else await ecrire(l, { motif: mo || null });
      A.fermerFenetre(); A.toast("Motif enregistré."); apresChangement();
    } catch (e) { A.occupe($("fOk"), false); A.erreur(e.message || String(e)); }
  };
};

// Après « Venu », « Non venu » ou « Annuler le statut » d'un rendez-vous (dossier, agenda ou salle d'attente) : le document du
// jour suit, pour les autres écrans. ancien = statut avant le changement.
export function apresStatutRdv(x, r, st, ancien) {
  if (!r || st === "supprimer" || r.d > D().t) return;
  const l = trouver(x.id, "r-" + r.id, r.d); if (!l) return;
  let m;
  if (st === "fait") m = Object.assign({ etat: "vu", fin: maintenant(), sp: D().u.uid }, qui("fin"));
  else if (st === "absent") m = Object.assign({ etat: "absent", fin: maintenant(), sp: D().u.uid }, qui("fin"));
  else m = { etat: ancien === "absent" || !l.doc.arr ? "" : l.doc.deb ? "consult" : "salle", fin: null, finPar: null, finNom: null, sp: null };
  oublierEncaissements(x.id); delete CHARGE[x.id];
  essayer(() => ecrire(l, m));
  if (st === "fait" && RETOUR === l.cle) { RETOUR = null; JOUR = D().t; location.hash = "salle"; }
}
// Après « Venu » (oui) ou son annulation de la consultation de chimio
export function apresVenuChimio(x, lid, n, j, oui) {
  const cle = "c-" + lid + "-" + n + "-" + j, l = trouver(x.id, cle); if (!l || l.jour > D().t) return;
  oublierEncaissements(x.id); delete CHARGE[x.id];
  const deja = l.etat === "vu" && oui;
  essayer(() => ecrire(l, deja ? { prixLe: maintenant() } : oui ? Object.assign({ etat: "vu", fin: maintenant(), sp: D().u.uid }, qui("fin")) : { etat: l.doc.arr ? "consult" : "", fin: null, finPar: null, finNom: null, sp: null }));
  if (oui && RETOUR === l.cle) { RETOUR = null; JOUR = D().t; location.hash = "salle"; }
}
// Prix d'une consultation déjà vue changé (médecin ou secrétaire) : les autres écrans relisent les prix
export function apresPrix(x, cle, jour) {
  oublierEncaissements(x.id); delete CHARGE[x.id];
  if (jour > D().t) return; const l = trouver(x.id, cle, jour); if (l) essayer(() => ecrire(l, { prixLe: maintenant() }));
}

// ───── Colonnes (08/10/2026) : chacun choisit celles qu'il voit ; Heure, Patient, Statut et les boutons restent toujours ─────
// SA8a (11/10/2026) : civilité dans le nom, heures étroites (RDV, Arrivée, Attente, Présence en hh:mm), largeur de chaque colonne
// réglable à la souris (poignée du titre), gardée pour chaque compte (utilisateurs/{uid}.salleLargeurs { colonne: px })
const COLS = [
  ["ord", "N° d'ordre", "36px"], ["h", "RDV", "44px", 1], ["nm", "Patient", "minmax(170px,2fr)", 1], ["type", "Type", "76px"],
  ["mo", "Motif", "minmax(56px,1fr)"], ["cor", "Correspondant", "minmax(70px,.8fr)"], ["mut", "Mutuelle", "58px"], ["ar", "Arrivée", "42px"],
  ["att", "Attente", "42px"], ["pres", "Présence", "44px"], ["st", "Statut", "92px", 1], ["px", "Prix", "52px"], ["com", "Commentaire", "minmax(70px,1fr)"], ["act", "", "104px", 1]];
const TITRE_COURT = { ord: "N°", ar: "Arr.", att: "Att.", pres: "Prés.", cor: "Corresp.", mut: "Mut.", com: "Comment." };
const largeurs = () => (D().profil && D().profil.salleLargeurs) || {};
// 26/10/2026 (demande de Dr Bentahila) : Patient, Type, Motif, Correspondant et Mutuelle à la largeur de leur texte le plus long du jour (mesuré,
// avec un plafond) pour être lus en entier ; le Commentaire prend la place qui reste (coupé par « … », texte entier au survol). Une largeur tirée
// à la main (poignée de l'en-tête) reste prioritaire. Place insuffisante : le Motif rétrécit d'abord (coupé par « … », texte entier au survol).
let MESURE = null;
const largeurTexte = (s, police) => { if (!MESURE) MESURE = document.createElement("canvas").getContext("2d"); MESURE.font = police; return MESURE.measureText(String(s || "")).width; };
const BORNES = { nm: [150, 340], type: [60, 130], mo: [80, 460], cor: [70, 220], mut: [50, 160] };
function largeursAuto(L) {
  const fs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--t4")) || 14, n = (p) => p + " " + fs + "px Arial", b = (p) => "bold " + p + "px Arial", w = {};
  const max = (k, f) => { w[k] = Math.ceil(Math.min(BORNES[k][1], Math.max(BORNES[k][0], ...L.map(f), 0))); };
  max("nm", (l) => largeurTexte((l.x.P.sexe === "F" ? "Mme " : l.x.P.sexe === "H" ? "M. " : "") + l.x.r.nm, b(fs)) + (l.x.doc.etablissementId ? largeurTexte(" " + l.x.doc.etablissementId, b(11)) + 6 : 0) + 34);
  max("type", (l) => largeurTexte(l.type, b(12)) + 22);
  max("mo", (l) => largeurTexte(l.motif, n("")) + 8);
  max("cor", (l) => largeurTexte(court(l.x.P.cor), n("")) + 8);
  max("mut", (l) => largeurTexte(court(l.x.P.mut), n("")) + 8);
  return w;
}
let DERN = []; // lignes du jour affichées (largeurs automatiques gardées pendant qu'on tire une poignée)
const gabarit = (cv, L = DERN) => { const a = L && L.length ? largeursAuto(L) : {};
  return cv.map((c) => (c[0] !== "act" && largeurs()[c[0]] ? largeurs()[c[0]] + "px" : a[c[0]] ? (c[0] === "mo" ? "minmax(" + Math.min(a.mo, 100) + "px," + a.mo + "px)" : a[c[0]] + "px") : c[0] === "com" ? "minmax(60px,1fr)" : c[2])).join(" "); };
// Réglage du cabinet (10/10/2026) : n° de passage, prix, commentaire retirés = colonnes absentes pour tous
const fnS = (k) => !D().reg || D().reg.fonctions["salle." + k] !== false;
const COL_FN = { ord: "passage", px: "prix", com: "commentaire" };
// Sans choix personnel : Correspondant et Commentaire cachés (audit externe, SA9a 11/10/2026 ; un choix déjà fait est gardé)
const CACHEES0 = ["cor", "com"];
const cachees = () => { const c = D().profil && D().profil.salleCachees; return (Array.isArray(c) ? c : CACHEES0).concat(Object.keys(COL_FN).filter((c) => !fnS(COL_FN[c]))); };
const colsVues = () => COLS.filter((c) => c[3] || (cachees().indexOf(c[0]) < 0 && (c[0] !== "px" || voitPrix())));
window.saColonnes = () => {
  const l = COLS.filter((c) => !c[3] && (c[0] !== "px" || voitPrix()) && (!COL_FN[c[0]] || fnS(COL_FN[c[0]])));
  A.fenetre(X + '<h3>Colonnes de la salle d\'attente</h3><p class="sous">Cochez les colonnes à afficher (réglage personnel, gardé sur tous vos appareils). Heure, patient, statut et boutons restent toujours affichés.</p><div class="form">' +
    l.map((c) => '<div><label style="font-weight:normal"><input type="checkbox" data-c="' + c[0] + '"' + (cachees().indexOf(c[0]) < 0 ? " checked" : "") + ' style="width:auto;margin-right:8px">' + c[1] + "</label></div>").join("") + "</div>" +
    (Object.keys(largeurs()).length ? '<p class="mesures" style="margin-top:10px"><label style="font-weight:normal"><input type="checkbox" id="saLargRaz" style="width:auto;margin-right:8px">Remettre les largeurs de colonnes d\'origine</label></p>' : '<p class="mesures" style="margin-top:10px">Largeur d\'une colonne : tirez le bord droit de son titre.</p>') +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="b2" onclick="fermerFenetre()">Annuler</button><button class="b1" id="fOk">Enregistrer</button></div>');
  $("fOk").onclick = async () => {
    const c = [...document.querySelectorAll("#fenetreCorps input[data-c]")].filter((e) => !e.checked).map((e) => e.dataset.c);
    if (!voitPrix() && cachees().indexOf("px") >= 0) c.push("px");
    D().profil.salleCachees = c; A.fermerFenetre(); dessiner();
    if ($("saLargRaz") && $("saLargRaz").checked) { D().profil.salleLargeurs = {}; dessiner(); setDoc(doc(db, "utilisateurs", D().u.uid), { salleLargeurs: {} }, { merge: true }).catch(() => {}); }
    setDoc(doc(db, "utilisateurs", D().u.uid), { salleCachees: c }, { merge: true }).catch((e) => A.toast("Réglage non enregistré : " + e.message));
  };
};
// Commentaire du jour sur une ligne (médecin, secrétaire, infirmière)
window.saCom = (pid, cle) => {
  const l = trouver(pid, cle); if (!l) return;
  A.fenetre(X + "<h3>Commentaire – " + A.esc(l.x.r.nm) + '</h3><p class="sous">' + A.esc(l.type) + " · " + A.cap(A.jourLong(l.jour)) + (l.doc.comNom ? " · dernier commentaire de " + A.esc(l.doc.comNom) : "") + '</p><div class="form"><div class="large"><label for="saC">Commentaire</label><textarea id="saC" rows="3" placeholder="Ex. à jeun, bilan sanguin apporté, accompagné…">' + A.esc(l.doc.com || "") + "</textarea></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="b2" onclick="fermerFenetre()">Annuler</button><button class="b1" id="fOk">Enregistrer</button></div>');
  $("fOk").onclick = async () => {
    const c = A.val("saC"); A.occupe($("fOk"), true);
    try { await ecrire(l, c ? Object.assign({ com: c }, qui("com")) : { com: null, comPar: null, comNom: null }); A.fermerFenetre(); A.toast("Commentaire enregistré."); }
    catch (e) { A.occupe($("fOk"), false); A.erreur(e.message || String(e)); }
  };
};

// ───── Page ─────
// Adresse précédente (retour d'un dossier ou non) ; ce module est chargé avant v2.js, son écoute passe avant celle des pages
let H0 = location.hash, PREC = "";
window.addEventListener("hashchange", () => { PREC = H0; H0 = location.hash; });
const ONGLETS = [["avenir", "À venir"], ["salle", "En salle d'attente", "En salle"], ["vus", "Vus"], ["absents", "Absents"]];
const JC = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const lundi = (d) => { const w = new Date(d + "T12:00:00").getDay(); return addJ(d, w === 0 ? -6 : 1 - w); };
export function pageSalle(j) {
  if (j) JOUR = j; if (!JOUR) JOUR = D().t;
  // Arrivée sur la page (pas un simple rafraîchissement) : onglet choisi selon le jour, sauf retour d'un dossier (onglet gardé)
  if (!$("saL")) { AUTO = !GARDE && !/^#dossier\//.test(PREC); GARDE = false; }
  const m = D().membre, etabs = m.tousEtablissements ? D().etabs.map((e) => e.code) : (m.etablissements || []);
  if (ETAB && etabs.indexOf(ETAB) < 0) ETAB = "";
  // Médecin (comme l'agenda) : un médecin voit d'abord ses patients, la secrétaire et l'infirmière ceux de tous ; « Tous les médecins » pour aider un confrère
  if (!A.multiMed()) MED = null; else if (MED == null || (MED && !A.medecins().some((z) => z.uid === MED))) MED = A.estMed() && A.medecins().some((z) => z.uid === A.medDefaut()) ? A.medDefaut() : ""; // Lot C : remplaçant = patients du titulaire
  // Lot B (25/10/2026) : plus de titre ; ligne 1 = le jour (‹ jour ›, semaine, Calendrier, Aujourd'hui) à gauche, Patient suivant, Actualiser
  // (à jour dessous) et « ⋯ » (Colonnes, Imprimer, Pharmacie, Clôturer la journée) à droite ; ligne 2 = recherche, période, établissement, médecin, tri
  $("page").innerHTML = '<div class="sa-pg' + (FILTRES ? " ouv" : "") + '" id="saPg"><div class="barre-page sa-l1">' +
    '<div class="sa-jours' + (semaineOuverte() ? "" : " repli") + '" id="saJours"><button class="b3 sa-fl" onclick="saJour(-1)" aria-label="Jour précédent" title="Jour précédent">‹</button><button class="sa-jtxt" id="saJtxt" onclick="saSemaine()" title="Afficher ou replier la semaine"></button><div class="sa-sem" id="saSem"></div><button class="b3 sa-fl" onclick="saJour(1)" aria-label="Jour suivant" title="Jour suivant">›</button>' +
    '<label class="sa-cal" title="Choisir un jour dans le calendrier"><svg class="i"><use href="#i-agenda"/></svg><span>Calendrier</span><input type="date" id="saD" aria-label="Choisir un jour"></label>' +
    '<button class="b2" id="saAuj" onclick="saAller(\'' + D().t + '\')">Aujourd\'hui</button></div>' +
    '<div class="bp-act sa-etab">' +
    '<button class="b2 sa-ftr" id="saFtr" onclick="saFiltres()" aria-expanded="' + FILTRES + '" aria-controls="saOutils"><svg class="i"><use href="#i-loupe"/></svg>Filtres<span class="n" id="saFtrN"></span></button>' +
    '<button class="b1 cache" id="saSuiv" onclick="saSuivant()"><svg class="i"><use href="#i-check"/></svg>Patient suivant</button>' +
    '<span class="bp-maj"><button class="b2" id="saAct" onclick="saActualiser()" title="Relire la salle d\'attente, les dossiers du jour et les prix (fait aussi tout seul chaque minute)"><svg class="i"><use href="#i-actualiser"/></svg>Actualiser</button><span class="mesures sa-ajour" id="saAjour"></span></span>' +
    '<details class="m3 sa-plus" id="saPlus"><summary class="b3 sa-pts" title="Autres actions" aria-label="Autres actions">⋯<span class="sa-pts-n cache" id="saPtsN"></span></summary><div class="m3-l">' +
    '<button class="mini" data-fn="salle.colonnes" onclick="saColonnes()" title="Choisir les colonnes affichées"><svg class="i"><use href="#i-liste"/></svg>Colonnes</button>' +
    '<button class="mini" onclick="saImprimer()" title="Imprimer la liste du jour"><svg class="i"><use href="#i-imprimer"/></svg>Imprimer la liste du jour</button>' +
    (A.voit("traitements") ? '<button class="mini" data-mod="chimio" onclick="saPharmacie()" title="Séances de chimiothérapie du lendemain, doses et flacons, pour la pharmacie de la clinique"><svg class="i"><use href="#i-pilule"/></svg>Pharmacie</button>' : "") +
    '<button class="mini cache" id="saClo" onclick="saCloturer()" title="Patients restés en salle, en consultation ou jamais arrivés"><svg class="i"><use href="#i-check"/></svg>Clôturer la journée</button></div></details></div></div>' +
    '<div class="sa-outils barre-filtres" id="saOutils">' +
    '<div class="recherche"><svg class="i"><use href="#i-loupe"/></svg><input id="saQ" type="search" placeholder="Nom, n° de dossier, téléphone…" autocomplete="off" aria-label="Rechercher un patient"></div>' +
    '<div class="sa-per" role="group" aria-label="Période">' + [["matin", "Matinée"], ["am", "Après-midi"], ["jour", "Toute la journée"]].map(([k, t]) => '<button data-per="' + k + '" onclick="saPeriode(\'' + k + '\')">' + t + "</button>").join("") + "</div>" +
    (etabs.length > 1 ? '<select id="saEtab" aria-label="Établissement"><option value="">Tous les établissements</option>' + etabs.map((c) => '<option value="' + A.esc(c) + '"' + (c === ETAB ? " selected" : "") + ">" + A.esc(c) + "</option>").join("") + "</select>" : "") +
    (A.multiMed() ? '<select id="saMed" aria-label="Médecin"><option value="">Tous les médecins</option>' + A.medecins().map((z) => '<option value="' + A.esc(z.uid) + '"' + (z.uid === MED ? " selected" : "") + ">" + A.esc(z.nom) + "</option>").join("") + "</select>" : "") +
    '<select id="saTri" aria-label="Tri"><option value="rdv">Tri : heure du rendez-vous</option><option value="arrivee">Tri : heure d\'arrivée</option><option value="alpha">Tri : alphabétique</option></select></div>' +
    // Onglets, indicateurs et titres des colonnes restent en haut pendant le défilement (SA6, 11/10/2026)
    '<section class="carte onglets sa-carte" id="saCarte"><div class="sa-haut"><div class="o-barre sa-o" role="tablist" aria-label="Salle d\'attente" id="saO"></div><div class="sa-ent-z" id="saEZ"><div id="saE"></div></div></div>' +
    '<div class="sa-defile" id="saDef"><div id="saL"></div></div><div id="saTot"></div></section></div>';
  $("saDef").onscroll = () => { $("saEZ").scrollLeft = $("saDef").scrollLeft; };
  if ($("saEtab")) $("saEtab").onchange = () => { ETAB = $("saEtab").value; dessiner(); };
  if ($("saMed")) $("saMed").onchange = () => { MED = $("saMed").value; dessiner(); };
  $("saD").onchange = () => { if ($("saD").value) window.saAller($("saD").value); };
  // 26/10/2026 (Dr Bentahila : « Calendrier ne sert à rien ») : le champ date invisible ne s'ouvrait qu'en visant sa petite icône ; un clic n'importe
  // où sur le bouton ouvre maintenant le calendrier du navigateur
  $("saD").onclick = (e) => { try { if (e.target.showPicker) { e.preventDefault(); e.target.showPicker(); } } catch (er) { /* ancien navigateur : comportement d'avant */ } };
  $("saQ").value = RECH; $("saQ").oninput = () => { RECH = $("saQ").value; dessiner(); };
  $("saTri").value = triPerso(); $("saTri").onchange = () => { const v = $("saTri").value; D().profil.salleTri = v; dessiner(); setDoc(doc(db, "utilisateurs", D().u.uid), { salleTri: v }, { merge: true }).catch(() => {}); };
  dessiner(); majAJour();
  if (JOUR !== D().t && !LU[JOUR]) lireJour(JOUR).then(() => { if ($("saL")) dessiner(); });
  if (!AJOUR || maintenant() - AJOUR >= 60000) actualiser(false); // à l'arrivée sur la page
  clearInterval(MINUT); MINUT = setInterval(() => { if (location.hash.startsWith("#salle") && $("saL")) majMinutes(); else clearInterval(MINUT); }, 30000);
}
window.saAller = (j) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(j || "")) return;
  const avant = JOUR; JOUR = j; if (avant !== j && VUE !== "vus" && VUE !== "absents") AUTO = true;
  if (j !== D().t && !LU[j]) { dessiner(); lireJour(j).then(() => { if ($("saL")) dessiner(); }); } else dessiner();
};
window.saJour = (n) => window.saAller(addJ(JOUR || D().t, n));
window.saOnglet = (k) => { VUE = k; AUTO = false; dessiner(); };
window.saPeriode = (k) => { PER = k; dessiner(); };
window.saFiltres = () => { FILTRES = !FILTRES; $("saPg").classList.toggle("ouv", FILTRES); $("saFtr").setAttribute("aria-expanded", FILTRES); };
// Filtres de la liste : période (heure du rendez-vous, sinon d'arrivée ; sans heure : toujours) et recherche (nom)
const dansPeriode = (l) => periodeOk(l, PER, hm);
const dansRecherche = (l) => correspond(l, RECH);
const cleNum = (l) => cleNumM(l, triPerso());
const trier = (l, vue) => trierSalle(l, vue, triPerso(), hm);
function dessiner() {
  if (!$("saL")) return;
  const t = D().t, j0 = lundi(JOUR), sem = Array.from({ length: 7 }, (_, i) => addJ(j0, i)), tout = lignes(sem).filter(dansFiltre);
  const nb = {}; tout.forEach((l) => { nb[l.jour] = (nb[l.jour] || 0) + 1; });
  // Lot B (25/10/2026) : plus de titre « Salle d'attente » ni de date sous le titre : le jour est dans la barre des jours (#saJtxt)
  remplir($("saSem"), sem.map((d) => '<button class="sa-j' + (d === JOUR ? " on" : "") + (d === t ? " auj" : "") + '" onclick="saAller(\'' + d + '\')" aria-pressed="' + (d === JOUR) + '" title="' + A.esc(A.cap(A.jourLong(d))) + '"><span>' + JC[new Date(d + "T12:00:00").getDay()] + "</span><b>" + +d.slice(8, 10) + "</b><i>" + (nb[d] || "") + "</i></button>").join(""));
  $("saD").value = JOUR; $("saAuj").classList.toggle("cache", JOUR === t);
  document.querySelectorAll(".sa-per button").forEach((b) => b.classList.toggle("on", b.dataset.per === PER));
  const nf = (ETAB ? 1 : 0) + (MED ? 1 : 0) + (PER !== "jour" ? 1 : 0) + (RECH.trim() ? 1 : 0); remplir($("saFtrN"), nf ? String(nf) : ""); // filtres actifs
  const L = tout.filter((l) => l.jour === JOUR && dansPeriode(l) && dansRecherche(l)), n = {}; ONGLETS.forEach(([k]) => { n[k] = 0; }); L.forEach((l) => { n[ongletDe(l)]++; });
  // Onglet d'ouverture (SA9a) : choisi une fois les documents du jour reçus, puis laissé tel quel (clics, arrivées)
  if (AUTO) { VUE = ongletOuverture(n); if (JOUR === t ? PRET : LU[JOUR]) AUTO = false; }
  remplir($("saO"), ONGLETS.map(([k, lib, court]) => { if (k === "avenir" && JOUR < t) { lib = "À valider"; court = ""; } return '<button role="tab" aria-selected="' + (k === VUE) + '"' + (k === VUE ? ' class="on"' : "") + ' onclick="saOnglet(\'' + k + '\')">' + (court ? '<span class="lg">' + lib + '</span><span class="sm">' + court + "</span>" : lib) + '<span class="n">' + n[k] + "</span></button>"; }).join(""));
  const l = trier(L.filter((z) => ongletDe(z) === VUE), VUE);
  const vide = { avenir: JOUR < t ? "Aucune consultation restée sans validation." : JOUR > t ? "Aucune consultation prévue ce jour-là." : "Plus aucun patient attendu aujourd'hui.", salle: "Personne en salle d'attente.", vus: "Aucun patient vu.", absents: "Aucun absent." }[VUE];
  DERN = L.filter(dansFiltre); const cv = colsVues(), gc = gabarit(cv); $("saL").style.setProperty("--cols", gc); $("saE").style.setProperty("--cols", gc);
  $("saCarte").classList.add("compact"); // compact = affichage normal (11/10/2026)
  remplir($("saJtxt"), A.cap(A.jourLong(JOUR)) + (JOUR === t ? " · aujourd'hui" : JOUR < t ? " · jour passé" : "") + ' <span class="fl">' + (semaineOuverte() ? "▴" : "▾") + "</span>");
  remplir($("saE"), l.length ? '<div class="sa-l ent">' + cv.map((c) => '<span class="c-' + c[0] + '" title="' + c[1] + '">' + (TITRE_COURT[c[0]] || c[1]) + (c[0] !== "act" ? '<i class="sa-poi" data-c="' + c[0] + '" title="Tirer pour élargir ; double-clic : largeur d\'origine"></i>' : "") + "</span>").join("") + "</div>" : "");
  // Mise à jour ligne par ligne : une ligne inchangée n'est pas touchée (clic en cours, survol et défilement gardés)
  poser($("saL"), l.length ? l.map((z) => ({ k: z.pid + "|" + z.cle, h: ligneHtml(z, cv) })) : [{ k: "vide", h: '<div class="vide-e" data-k="vide"><p>' + vide + "</p></div>" }]);
  // Patient suivant (médecin, aujourd'hui) ; Clôturer la journée (aujourd'hui et jours passés)
  const f = JOUR === t && peutRdv() && A.estMed() ? fileSalle() : [];
  $("saSuiv").classList.toggle("cache", !f.length); if (f.length) $("saSuiv").title = "Démarrer la consultation de " + f[0].x.r.nm + " (attend depuis " + duree(minutes(f[0].doc.arr || maintenant())) + ")";
  $("saClo").classList.toggle("cache", !(JOUR <= t && peutRdv()));
  // Lot B : « Clôturer la journée » rangé sous « ⋯ » ; une pastille sur « ⋯ » quand un jour passé n'est pas clôturé (patients restés en salle,
  // en consultation ou jamais arrivés) ; pas pour aujourd'hui, où les patients de l'après-midi ne sont pas encore arrivés
  { const n = JOUR < t && peutRdv() ? lignes([JOUR]).filter((l) => dansFiltre(l) && (l.etat === "" || l.etat === "salle" || l.etat === "consult")).length : 0; remplir($("saPtsN"), n ? String(n) : ""); $("saPtsN").classList.toggle("cache", !n); $("saPtsN").title = n ? n + " patient" + (n > 1 ? "s" : "") + " à clôturer" : ""; }
  // Total du jour (établissement choisi), sans les absents : encaissé (vus, prix validé) et prévu (le reste, au tarif)
  if (voitPrix()) {
    // à encaisser (19.5, lieux « payé au cabinet ») : vu (validé par le médecin) mais pas encore encaissé, ou non payé : compté à part
    // lieux payés par l'établissement (virement, ex. HCK) : comptés dans les vus, pour que le médecin les voie, et montrés à part
    let enc = 0, prev = 0, nv = 0, np = 0, etb = 0;
    L.forEach((z) => { const p = prixDe(z); if (!p) return; if (z.etat === "vu") { if (p.ok && p.np) np += p.m || 0; else if (p.ok) { enc += p.m || 0; if (!A.payeCabinet(z.x)) etb += p.m || 0; } else nv++; } else prev += p.m || 0; });
    remplir($("saTot"), '<div class="sa-tot"><span>Encaissé (vus) : <b>' + A.fmtMil(enc) + " DH</b>" + (etb && etb < enc ? ' <span class="mesures">dont ' + A.fmtMil(etb) + " DH payés par l'établissement</span>" : etb ? ' <span class="mesures">(payé par l\'établissement)</span>' : "") + "</span>" + (np ? '<span style="color:var(--orange)">À encaisser : <b>' + A.fmtMil(np) + " DH</b></span>" : "") + "<span>Prévu (restant) : <b>" + A.fmtMil(prev) + " DH</b></span>" + (nv ? '<span class="mesures">' + nv + " consultation" + (nv > 1 ? "s" : "") + " vue" + (nv > 1 ? "s" : "") + " sans prix</span>" : "") + "</div>");
  } else remplir($("saTot"), "");
}
// Contenu remplacé seulement s'il a changé
function remplir(el, h) { if (el && el._h !== h) { el.innerHTML = h; el._h = h; } }
// Liste par clé (data-k) : les éléments au même contenu sont gardés et seulement déplacés, les autres remplacés ou retirés
function poser(cont, items) {
  const vieux = new Map(), garde = new Set();
  [...cont.children].forEach((e) => { if (e.dataset && e.dataset.k) vieux.set(e.dataset.k, e); });
  items.forEach(({ k, h }, i) => {
    let n = vieux.get(k);
    if (!n || n._h !== h) { const t = document.createElement("div"); t.innerHTML = h; const nn = t.firstElementChild; nn._h = h; if (n) n.replaceWith(nn); n = nn; }
    garde.add(n);
    const cur = cont.children[i]; if (cur !== n) cont.insertBefore(n, cur || null);
  });
  [...cont.children].forEach((e) => { if (!garde.has(e)) e.remove(); });
}
// Bandeau de la semaine : replié par défaut, ouvert au clic sur la date (réglage gardé sur cet ordinateur)
const semaineOuverte = () => { try { return localStorage.getItem("onco360.salleSemaine") === "1"; } catch (e) { return false; } };
window.saSemaine = () => { const v = !semaineOuverte(); try { localStorage.setItem("onco360.salleSemaine", v ? "1" : "0"); } catch (e) { /* navigation privée */ } $("saJours").classList.toggle("repli", !v); dessiner(); };
// Largeur des colonnes : poignée du titre (tirer), double-clic = largeur d'origine ; enregistrée pour le compte
document.addEventListener("pointerdown", (ev) => {
  const p = ev.target.closest && ev.target.closest(".sa-poi"); if (!p) return;
  ev.preventDefault(); const k = p.dataset.c, cel = p.parentElement, x0 = ev.clientX, w0 = cel.getBoundingClientRect().width;
  const bouge = (e) => { const L = Object.assign({}, largeurs(), { [k]: Math.max(34, Math.round(w0 + e.clientX - x0)) }); D().profil.salleLargeurs = L; const gc = gabarit(colsVues()); $("saL").style.setProperty("--cols", gc); $("saE").style.setProperty("--cols", gc); };
  const fin = () => { document.removeEventListener("pointermove", bouge); document.removeEventListener("pointerup", fin); setDoc(doc(db, "utilisateurs", D().u.uid), { salleLargeurs: largeurs() }, { merge: true }).catch(() => {}); };
  document.addEventListener("pointermove", bouge); document.addEventListener("pointerup", fin);
});
document.addEventListener("dblclick", (ev) => {
  const p = ev.target.closest && ev.target.closest(".sa-poi"); if (!p) return;
  const L = Object.assign({}, largeurs()); delete L[p.dataset.c]; D().profil.salleLargeurs = L; dessiner();
  setDoc(doc(db, "utilisateurs", D().u.uid), { salleLargeurs: L }, { merge: true }).catch(() => {});
});
// Clôturer la journée (SA6) : patients restés en consultation, en salle ou jamais arrivés ; les jamais arrivés en « Absent » d'un clic
window.saCloturer = () => {
  const L = lignes([JOUR]).filter((l) => dansFiltre(l) && (l.etat === "" || l.etat === "salle" || l.etat === "consult")), q = (l) => "'" + l.pid + "','" + l.cle + "'";
  const g = [["consult", "En consultation"], ["salle", "Encore en salle d'attente"], ["", "Jamais arrivés"]].map(([e, t]) => [e, t, trier(L.filter((l) => l.etat === e), e === "" ? "avenir" : "salle")]).filter((z) => z[2].length);
  const ligne = (l) => '<div class="rdv"><span class="badge b-gr">' + A.esc(l.h || "—") + '</span><div class="tx"><b>' + A.esc(l.x.r.nm) + '</b><div class="mesures">' + A.esc(l.type + (l.motif ? " · " + l.motif : "")) + "</div></div>" +
    '<div class="actr">' + (l.rdv || A.peutPrix() ? '<button class="mini v" onclick="fermerFenetre();saValider(' + q(l) + ')">Valider</button>' : "") + '<button class="mini" onclick="fermerFenetre();ouvrirDossier(\'' + l.pid + '\')">Dossier</button></div></div>';
  A.fenetre(X + "<h3>Clôturer la journée – " + A.esc(A.cap(A.jourLong(JOUR))) + "</h3>" + (g.length ? '<p class="sous">Validez les patients vus (fenêtre de prix) ; ceux qui ne sont jamais arrivés passent en « Absent » (sans report), en un clic.</p>' + g.map(([e, t, l]) => '<h4 class="soustitre">' + t + " (" + l.length + ")</h4>" + l.map(ligne).join("")).join("") : '<p class="sous">Tout est clôturé : chaque patient est vu ou absent.</p>') +
    '<div class="err" id="fErr"></div><div class="boutons">' + (L.some((l) => l.etat === "") ? '<button class="b2 danger" id="saCloA">Jamais arrivés → Absent</button>' : "") + '<button class="b2" onclick="fermerFenetre()">Fermer</button></div>', "large");
  if ($("saCloA")) $("saCloA").onclick = async () => {
    const l0 = L.filter((l) => l.etat === ""); if (!confirm(l0.length + " patient" + (l0.length > 1 ? "s" : "") + " jamais arrivé" + (l0.length > 1 ? "s" : "") + " : marquer « Absent » sans report ?")) return;
    A.occupe($("saCloA"), true); let n = 0;
    for (const l of l0) { try { if (l.rdv) { if (await window.rdvAbsentDirect(l.pid, l.rdv.id)) n++; } else { await ecrire(l, Object.assign({ etat: "absent", sp: D().u.uid, motif: l.motif, fin: maintenant() }, qui("fin")), { attendu: [""] }); n++; } } catch (e) { /* ligne changée entre-temps */ } }
    A.fermerFenetre(); A.toast(n + " patient" + (n > 1 ? "s" : "") + " marqué" + (n > 1 ? "s" : "") + " absent" + (n > 1 ? "s" : "") + "."); dessiner();
  };
};
// Toutes les 30 s : seules les minutes (attente, consultation) changent, sans redessiner la liste
function majMinutes() {
  const L = lignes([JOUR]);
  document.querySelectorAll("#saL .sa-l.salle[data-k], #saL .sa-l.consult[data-k]").forEach((e) => {
    const k = e.dataset.k, i = k.indexOf("|"), l = L.find((z) => z.pid === k.slice(0, i) && z.cle === k.slice(i + 1)); if (!l) return;
    [[".c-st", statut], [".att", attente], [".pres", presence]].forEach(([s, f]) => { const c = e.querySelector(s); if (c) c.innerHTML = f(l); });
  });
}
// Statut : pastille ronde de couleur + mot court (SA8a, 11/10/2026) ; les minutes sont dans les colonnes Attente et Présence
function statut(l) {
  const d = l.doc, auj = l.jour === D().t;
  if (l.etat === "salle") { const m = auj && d.arr ? minutes(d.arr) : 0, c = m >= seuils()[1] ? "rouge" : m >= seuils()[0] ? "orange" : "salle"; return '<span class="rd ' + c + '"><i></i>En salle</span>'; }
  if (l.etat === "consult") return '<span class="rd consult"><i></i>En consult.</span>';
  if (l.etat === "vu") return '<span class="rd vu"><i></i>Vu' + (d.fin ? " " + hm(d.fin) : "") + "</span>";
  if (l.etat === "absent") return '<span class="rd absent" title="' + (d.rep ? "Reportée au " + A.dfrA(d.rep) : "Absent") + '"><i></i>Absent' + (d.rep ? " → " + A.dfrA(d.rep).slice(0, 5) : "") + "</span>";
  if (l.jour < D().t) return '<span class="rd orange"><i></i>Non validé</span>';
  return '<span class="rd prevu"><i></i>Prévu</span>';
}
// Durées en hh:mm (colonnes Attente et Présence)
function attente(l) {
  const d = l.doc; if (!d.arr) return "";
  if (l.etat === "salle") { if (l.jour !== D().t) return ""; const m = minutes(d.arr), c = m >= seuils()[1] ? "rouge" : m >= seuils()[0] ? "orange" : ""; return '<span class="' + c + '" title="En attente depuis ' + duree(m) + '">' + hhmm(m) + "</span>"; }
  return d.deb ? hhmm(Math.max(0, Math.round((d.deb - d.arr) / 60000))) : "";
}
function presence(l) {
  const d = l.doc; if (!d.arr || l.etat === "absent") return "";
  if (d.fin && l.etat === "vu") return hhmm(Math.max(0, Math.round((d.fin - d.arr) / 60000)));
  return (l.etat === "salle" || l.etat === "consult") && l.jour === D().t ? hhmm(minutes(d.arr)) : "";
}
// « CNOPS — Caisse nationale… » → « CNOPS » (nom complet au survol)
const court = (s) => String(s || "").split(/\s+[—–]\s+/)[0];
// Actions d'une ligne (SA8a) : la prochaine étape en bouton, toutes les autres dans le menu ⋯ (aussi au clic droit)
function actionsDe(l) {
  const okR = peutRdv(), okV = okR && (l.rdv || A.peutPrix()), t = D().t, p = prixDe(l), L = [];
  let prin = null;
  if (l.jour === t) {
    if (l.etat === "") { prin = ["Arrivé", "saEnSalle", "Mettre en salle d'attente (heure d'arrivée notée)"]; if (okR) L.push(["Démarrer la consultation", "saDemarrer"], ["Absent", "saAbsent"]); }
    else if (l.etat === "salle") { if (okR) prin = ["Démarrer", "saDemarrer", "Démarrer la consultation (ouvre le dossier)"]; if (okV) L.push(["Valider", "saValider"]); if (okR && triPerso() !== "alpha") L.push(["Faire passer avant ↑", "saMonter"], ["Faire passer après ↓", "saDescendre"]); L.push(["Annuler l'arrivée", "saAnnuler"]); }
    else if (l.etat === "consult" && okR) { if (okV) prin = ["Valider", "saValider", "Consultation terminée : fenêtre de prix"]; L.push(["Retour en salle", "saRetour"]); }
  } else if (l.jour < t && (l.etat === "" || l.etat === "salle" || l.etat === "consult")) { if (okV) prin = ["Valider", "saValider"]; if (okR && l.etat === "") L.push(["Absent", "saAbsent"]); }
  if (l.etat === "vu" && p && p.ok && A.payeCabinet(l.x) && A.peutPrix()) { if (p.np) prin = ["Encaisser", "saEncaisser", "Paiement reçu : mode de paiement et reçu"]; else if (p.mode && p.m > 0) L.push(["Réimprimer le reçu", "saRecu"]); }
  if ((l.etat === "vu" || l.etat === "absent") && okR && (l.rdv || A.peutPrix() || l.etat === "absent") && !l.orphelin && !l.derive) L.push(["Annuler le statut", "saAnnuler"]);
  if ((!!l.chimio || A.voitRdv()) && okR) L.push(["Motif de consultation", "saMotif"]);
  L.push(["Commentaire", "saCom"]);
  if (l.etat !== "absent" && A.peutPrix() && !(l.rdv && l.rdv.type === T_RTC) && !(p && p.v1 && !A.peut("finances")) && !(l.derive && !(p && p.ok))) L.push([l.etat === "vu" ? "Modifier le prix" : "Prix payé d'avance", "saPrix"]);
  L.push(["Ouvrir le dossier", "saDossier"]);
  return { prin, menu: L };
}
window.saMonter = (pid, cle) => window.saBouger(pid, cle, -1);
window.saDescendre = (pid, cle) => window.saBouger(pid, cle, 1);
window.saDossier = (pid) => window.ouvrirDossier(pid);
// Menu ⋯ (une seule fenêtre flottante, fermée au clic ailleurs ou par Échap)
window.saMenu = (ev, pid, cle) => {
  ev.preventDefault(); ev.stopPropagation(); fermerMenu();
  const l = trouver(pid, cle); if (!l) return;
  const { menu } = actionsDe(l), m = document.createElement("div"), q = "'" + pid + "','" + cle + "'";
  m.id = "saMenuF"; m.className = "sa-menu"; m.setAttribute("role", "menu");
  m.innerHTML = '<div class="sa-menu-t">' + A.esc(l.x.r.nm) + "</div>" + menu.map(([lib, fn]) => '<button role="menuitem" onclick="fermerSaMenu();' + fn + "(" + q + ')">' + A.esc(lib) + "</button>").join("");
  document.body.appendChild(m);
  const r = (ev.currentTarget && ev.currentTarget.getBoundingClientRect && ev.type === "click") ? ev.currentTarget.getBoundingClientRect() : { right: ev.clientX, bottom: ev.clientY, top: ev.clientY };
  const w = m.offsetWidth, h = m.offsetHeight, x = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)), y = r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4;
  m.style.left = x + "px"; m.style.top = y + "px";
  const b = m.querySelector("button"); if (b) b.focus();
};
function fermerMenu() { const m = $("saMenuF"); if (m) m.remove(); }
window.fermerSaMenu = fermerMenu;
document.addEventListener("click", (e) => { if ($("saMenuF") && !e.target.closest("#saMenuF")) fermerMenu(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermerMenu(); });
window.addEventListener("scroll", fermerMenu); // défilement de la page seulement (pas celui de la liste)
function ligneHtml(l, cv) {
  const q = "'" + l.pid + "','" + l.cle + "'", { prin } = actionsDe(l);
  const voitMo = !!l.chimio || A.voitRdv(), P = l.x.P, civ = P.sexe === "F" ? "Mme " : P.sexe === "H" ? "M. " : "";
  const p = prixDe(l), px = !p ? "" : p.charge ? '<span class="mesures">…</span>' : p.nonValide ? (l.derive ? "—" : '<span class="mesures" title="Prix non fixé">?</span>') : p.m == null ? "—" : '<span class="' + (p.ok ? "px-ok" : p.convenu ? "px-conv" : "px-prev") + '" title="' + (p.ok ? "Prix validé" : p.convenu ? "Prix payé d'avance (proposé à la validation)" : "Prix prévu (tarif)") + '">' + A.fmtMil(p.m) + "</span>";
  const etab = !ETAB && $("saEtab") && l.x.doc.etablissementId ? ' <span class="sa-etb">' + A.esc(l.x.doc.etablissementId) + "</span>" : "";
  // colonne Commentaire cachée : bulle à côté du nom (texte au survol, clic = modifier)
  const cm = l.doc.com && !cv.some((c) => c[0] === "com") ? '<button class="sa-cm" onclick="saCom(' + q + ')" title="' + A.esc(l.doc.com + (l.doc.comNom ? " — " + l.doc.comNom : "")) + '" aria-label="Commentaire : ' + A.esc(l.doc.com) + '"><svg class="pi"><use href="#i-bulle"/></svg></button>' : "";
  const cel = {
    ord: '<span class="ord" title="N° d\'ordre de passage">' + fmtOrdre(l.doc.ordre) + "</span>",
    h: '<span class="h">' + A.esc(l.h || "—") + "</span>",
    nm: '<span class="nm" title="' + A.esc(civ + l.x.r.nm) + '">' + cm + '<span class="civ">' + civ + '</span><a class="lien-nm" href="#dossier/' + encodeURIComponent(l.pid) + '">' + A.esc(l.x.r.nm) + "</a>" + etab + '<span class="sa-pz" data-p="' + A.esc(l.pid) + '">' + presenceHtml(l.pid) + "</span></span>",
    type: '<span class="c-type"><span class="badge ' + l.cls + '">' + A.esc(l.type) + "</span></span>",
    mo: '<span class="mo" data-l="Motif" title="' + A.esc(voitMo ? l.motif : "") + '">' + (voitMo ? A.esc(l.motif) : "") + "</span>",
    cor: '<span class="cor" data-l="Correspondant" title="' + A.esc(P.cor || "") + '">' + A.esc(court(P.cor)) + "</span>",
    mut: '<span class="mut" data-l="Mutuelle" title="' + A.esc(P.mut || "") + '">' + A.esc(court(P.mut)) + "</span>",
    ar: '<span class="ar" data-l="Arrivée">' + (l.doc.arr ? hm(l.doc.arr) : "") + "</span>",
    att: '<span class="att" data-l="Attente">' + attente(l) + "</span>",
    pres: '<span class="pres" data-l="Présence">' + presence(l) + "</span>",
    st: '<span class="c-st">' + statut(l) + "</span>",
    px: '<span class="px" data-l="Prix">' + px + "</span>",
    com: '<span class="com" data-l="Commentaire" title="' + A.esc((l.doc.com || "") + (l.doc.comNom ? " — " + l.doc.comNom : "")) + '">' + A.esc(l.doc.com || "") + "</span>",
    act: '<span class="actr">' + (prin ? '<button class="mini v" onclick="' + prin[1] + "(" + q + ')"' + (prin[2] ? ' title="' + prin[2] + '"' : "") + ">" + prin[0] + "</button>" : "") + '<button class="mini sa-plus" onclick="saMenu(event,' + q + ')" aria-label="Autres actions" title="Autres actions">⋯</button></span>',
  };
  return '<div class="sa-l ' + (l.etat || "prevu") + '" data-k="' + A.esc(l.pid + "|" + l.cle) + '" ondblclick="if(!event.target.closest(\'button,a\'))ouvrirDossier(\'' + l.pid + '\')" oncontextmenu="saMenu(event,' + q + ')">' + cv.map((c) => cel[c[0]]).join("") + "</div>";
}

// ───── Dossier ouvert pendant la consultation : « Valider » (venu) et « Fermer » (retour en salle sans valider) ─────
// R-G a (audit n° 5, 19/10/2026) : plus de bulles flottantes, les boutons sont à droite de la barre d'actions du dossier (mêmes fonctions)
export function bullesDossier(x) {
  if (!peutRdv() || !fnS("bulles")) return "";
  const l = lignes([D().t]).filter((z) => z.pid === x.id && z.etat === "consult");
  if (!l.length) return "";
  return '<div class="sa-bulles" id="saBulles" data-pid="' + A.esc(x.id) + '">' + l.map((z) => {
    const q = "'" + z.pid + "','" + z.cle + "'", okV = z.rdv || A.peutPrix();
    // 19/10/2026 (demande de Dr Bentahila) : seulement le temps passé (« 12 min », détail au survol) et « Valider », pour tenir sur une ligne
    const dd = duree(minutes(z.doc.deb || maintenant()));
    return '<div class="sa-b"><span class="lbl" data-k="' + A.esc(z.cle) + '" title="En consultation depuis ' + A.esc(dd) + (l.length > 1 ? " · " + A.esc(z.type) : "") + '"><i></i>' + dd + (l.length > 1 ? " · " + A.esc(z.type) : "") + "</span>" +
      (okV ? '<button class="bt vert" onclick="saValider(' + q + ',1)" title="Valider la consultation : patient venu"><svg class="i"><use href="#i-check"/></svg>Valider</button>' : "") +
      '<button class="bt fonce" onclick="saRetour(' + q + ')" title="Fermer : retour en salle d\'attente sans valider"><svg class="i"><use href="#i-retour"/></svg>Fermer</button></div>';
  }).join("") + "</div>";
}
function majBulles() {
  const z = $("saBulles"), m = /^#dossier\/(.+)$/.exec(location.hash), pid = m ? decodeURIComponent(m[1]) : null;
  if (!pid) return;
  const x = D().patients.find((p) => p.id === pid); if (!x) return;
  const h = bullesDossier(x);
  // mêmes boutons : seules les minutes changent (les boutons ne sont pas remplacés : aucun clic perdu)
  if (z && h) { const t = document.createElement("div"); t.innerHTML = h; const nv = t.querySelectorAll(".lbl"), an = z.querySelectorAll(".lbl");
    if (nv.length === an.length && [...nv].every((e, i) => e.dataset.k === an[i].dataset.k) && t.querySelectorAll("button").length === z.querySelectorAll("button").length) { nv.forEach((e, i) => { if (an[i].innerHTML !== e.innerHTML) an[i].innerHTML = e.innerHTML; }); return; } }
  if (z) { if (!h) z.remove(); else z.outerHTML = h; }
  else if (h && $("barreDroite")) $("barreDroite").insertAdjacentHTML("afterbegin", h);
}

// ───── Imprimer la liste du jour (08/10/2026) : jour, établissement, période et recherche choisis ; colonnes affichées ─────
// P10 n (audit n° 3, 18/10/2026) : liste pour la pharmacie de la clinique : séances de chimiothérapie prévues un jour (le lendemain par
// défaut), par établissement : patient, protocole, cure et jour, anticancéreux, dose, flacons ; imprimable
window.saPharmacie = (jour) => {
  const j = jour || addJ(D().t, 1), etabs = D().etabsTous || D().etabs || [], nomE = (c) => (etabs.find((z) => z.code === c) || {}).nom || c || "Sans établissement";
  const L = lignes([j]).filter((l) => l.chimio && l.etat !== "absent" && !l.orphelin && (!ETAB || (l.x.doc.etablissementId || "") === ETAB));
  const par = {}; L.forEach((l) => { const c = l.x.doc.etablissementId || ""; (par[c] = par[c] || []).push(l); });
  const esc = A.esc, corps = Object.keys(par).sort().map((c) => "<h2>" + esc(nomE(c)) + " (" + par[c].length + ")</h2><table><tr><th>Patient</th><th>Protocole · cure</th><th>Anticancéreux</th><th>Dose</th><th>Flacons</th></tr>" +
    par[c].sort((a, b) => a.x.r.nm.localeCompare(b.x.r.nm)).map((l) => { const d = window.chDosesSeance ? window.chDosesSeance(l.pid, l.chimio.lid, l.chimio.n, l.chimio.j) : [], n = Math.max(1, d.length);
      return d.length ? d.map((z, i) => "<tr>" + (i === 0 ? '<td rowspan="' + n + '"><b>' + esc(l.x.r.nm) + "</b>" + (l.h ? "<br>" + esc(l.h) : "") + '</td><td rowspan="' + n + '">' + esc((l.chimio.lib || "") + " · C" + l.chimio.n + " J" + l.chimio.j) + "</td>" : "") + "<td>" + esc(z.p) + "</td><td>" + (z.dose != null ? esc(String(z.dose).replace(".", ",")) + " mg" : "à calculer") + "</td><td>" + esc(z.fl) + "</td></tr>").join("")
        : "<tr><td><b>" + esc(l.x.r.nm) + "</b></td><td>" + esc(l.motif) + '</td><td colspan="3">—</td></tr>'; }).join("") + "</table>").join("");
  A.fenetre(X + "<h3>Pharmacie – séances du " + esc(A.dfrA(j)) + "</h3>" + '<div class="form" style="grid-template-columns:minmax(0,220px) 1fr;align-items:end"><div><label for="phJ">Jour</label><input type="date" id="phJ" value="' + j + '" onchange="saPharmacie(this.value)"></div><div class="mesures">' + L.length + " séance" + (L.length > 1 ? "s" : "") + (ETAB ? " · " + esc(nomE(ETAB)) : "") + " · doses calculées avec le dernier poids connu ; elles peuvent changer à la validation.</div></div>" +
    '<div id="phL" class="tableau">' + (corps || '<p class="mesures">Aucune séance de chimiothérapie prévue ce jour-là.</p>') + "</div>" +
    '<div class="boutons"><button class="b2" onclick="fermerFenetre()">Fermer</button><button class="b1" id="phImp"' + (L.length ? "" : " disabled") + '><svg class="pi"><use href="#i-imprimer"/></svg>Imprimer</button></div>', "large");
  const b = $("phImp"); if (b) b.onclick = () => {
    let w = null; try { w = window.open("", "_blank"); } catch (er) { w = null; } if (!w || !w.document) { A.toast("Autorisez l'ouverture des fenêtres pour imprimer."); return; }
    w.document.open(); w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pharmacie – ' + esc(A.dfrA(j)) + '</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;font-size:11px;color:#1E2A44}h1{font-size:16px}h2{font-size:13px;margin:14px 0 4px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #9AA3B5;padding:4px 5px;text-align:left;vertical-align:top}th{background:#EEF2F8}</style></head><body><h1>Pharmacie – séances de chimiothérapie du ' + esc(A.cap(A.jourLong(j))) + " " + j.slice(0, 4) + "</h1>" + corps + "</body></html>");
    w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
  };
};
window.saImprimer = async () => {
  // fenêtre ouverte tout de suite (sinon le navigateur la bloque), remplie quand les prix des patients vus sont chargés
  let w = null; try { w = window.open("", "_blank"); } catch (er) { w = null; }
  if (!w || !w.document) { A.toast("Autorisez l'ouverture des fenêtres pour imprimer la liste."); return; }
  const t = D().t, L = lignes([JOUR]).filter((l) => dansFiltre(l) && dansPeriode(l) && dansRecherche(l));
  for (let k = 0; k < 40 && voitPrix() && L.some((l) => { const p = prixDe(l); return p && p.charge; }); k++) await new Promise((r) => setTimeout(r, 100));
  const cv = colsVues().filter((c) => c[0] !== "act"), lib = { "": "À venir", salle: "En salle d'attente", consult: "En consultation", vu: "Vus", absent: "Absents" };
  const st = (l) => ({ salle: "En salle", consult: "En consultation", vu: "Vu", absent: "Absent" }[l.etat] || (l.jour < t ? "Non validé" : "Prévu"));
  const val = (l, k) => {
    const P = l.x.P, d = l.doc, p = k === "px" ? prixDe(l) : null;
    return { ord: fmtOrdre(d.ordre), h: l.h || "—", nm: (P.sexe === "F" ? "Mme " : P.sexe === "H" ? "M. " : "") + l.x.r.nm, att: attente(l).replace(/<[^>]+>/g, ""), pres: presence(l), type: l.type, mo: l.chimio || A.voitRdv() ? l.motif : "", cor: P.cor || "", mut: court(P.mut), ar: d.arr ? hm(d.arr) : "",
      st: st(l) + (l.etat === "vu" && d.fin ? " à " + hm(d.fin) : "") + (d.rep ? " (reportée au " + A.dfrA(d.rep) + ")" : ""), px: p && p.m != null ? A.fmtMil(p.m) + " DH" : "", com: d.com || "" }[k];
  };
  const groupes = ["consult", "salle", "", "vu", "absent"].map((e) => [e, trier(L.filter((l) => l.etat === e), e === "" ? "avenir" : e === "consult" ? "salle" : e === "vu" ? "vus" : "absents")]).filter((g) => g[1].length);
  const e = ETAB ? ((D().etabsTous || D().etabs).find((z) => z.code === ETAB) || {}).nom || ETAB : "Tous les établissements";
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Salle d\'attente – ' + A.esc(A.dfrA(JOUR)) + '</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;font-size:11px;color:#1E2A44}h1{font-size:17px;margin:0 0 2px}p{margin:0 0 10px;color:#64708A}h2{font-size:13px;margin:14px 0 4px;color:#24365F}table{width:100%;border-collapse:collapse}th,td{border:1px solid #CCD3E0;padding:4px 6px;text-align:left;vertical-align:top}th{background:#EAF0FA}</style></head><body>' +
    "<h1>Salle d'attente – " + A.esc(A.cap(A.jourLong(JOUR))) + " " + JOUR.slice(0, 4) + "</h1><p>" + A.esc(e) + ({ matin: " · Matinée", am: " · Après-midi" }[PER] || "") + (RECH ? " · Recherche : " + A.esc(RECH) : "") + " · " + L.length + " patient" + (L.length > 1 ? "s" : "") + " · imprimé le " + A.esc(A.dfrA(t)) + " à " + hm(maintenant()) + "</p>" +
    (groupes.length ? groupes.map(([k, g]) => "<h2>" + lib[k] + " (" + g.length + ")</h2><table><tr>" + cv.map((c) => "<th>" + A.esc(c[0] === "ord" ? "N°" : c[1]) + "</th>").join("") + "</tr>" + g.map((l) => "<tr>" + cv.map((c) => "<td>" + A.esc(val(l, c[0])) + "</td>").join("") + "</tr>").join("") + "</table>").join("") : "<p>Aucun patient.</p>") + "</body></html>";
  w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
};

// ───── « Dossier ouvert par » (08/10/2026) : chaque personne signale le dossier qu'elle a ouvert ─────
// espaces/{e}/presence/{uid} = { patientId (ou ""), nom, role, le } : écrit par la personne elle-même (règles), renouvelé chaque
// minute tant que le dossier reste ouvert ; considéré comme fermé après 3 minutes sans nouvelle (onglet fermé, coupure).
const PRES = new Map(); let ECOUTE_P = null, MON_DOSSIER = "", BATTEMENT = null;
const ms = (v) => (v && typeof v.toMillis === "function" ? v.toMillis() : v ? new Date(v).getTime() : maintenant());
const ROLES = { medecin: "Médecin", infirmiere: "Infirmière", assistante: "Secrétaire", comptable: "Comptable" };
function ecrirePresence() {
  ECRIT = Date.now();
  setDoc(doc(db, "espaces", A.ESPACE, "presence", D().u.uid), { patientId: MON_DOSSIER, nom: nomConnecte(), role: D().membre.role || "", le: serverTimestamp() }).catch(() => {});
}
export function presenceDossier(pid) {
  pid = pid || "";
  if (pid !== MON_DOSSIER) { MON_DOSSIER = pid; ecrirePresence(); clearInterval(BATTEMENT); if (pid) BATTEMENT = setInterval(ecrirePresence, 60000); }
  if (!ECOUTE_P) {
    ECOUTE_P = onSnapshot(collection(db, "espaces", A.ESPACE, "presence"), (s) => {
      s.docChanges().forEach((c) => { if (c.type === "removed") PRES.delete(c.doc.id); else { PRES.set(c.doc.id, c.doc.data()); if (c.doc.id === D().u.uid) noterEcart(c.doc.data().le); } });
      majPresence();
    }, (e) => { console.warn("présence (écoute)", e); ECOUTE_P = null; });
    window.addEventListener("pagehide", () => { if (MON_DOSSIER) { MON_DOSSIER = ""; ecrirePresence(); } });
  }
  majPresence();
}
// Collègues qui ont ce dossier ouvert (moi exclu)
const qui0uvre = (pid) => { const l = []; PRES.forEach((p, uid) => { if (uid !== D().u.uid && p && p.patientId === pid && maintenant() - ms(p.le) < 180000) l.push(p.nom + (ROLES[p.role] ? " (" + ROLES[p.role].toLowerCase() + ")" : "")); }); return l; };
function presenceHtml(pid) { const l = qui0uvre(pid); return l.length ? '<div class="sa-pres" title="Dossier ouvert en ce moment par ' + A.esc(l.join(", ")) + '"><svg class="pi"><use href="#i-document"/></svg>Ouvert par ' + A.esc(l.join(", ")) + "</div>" : ""; }
function majPresence() {
  document.querySelectorAll("#saL .sa-pz[data-p]").forEach((e) => { const h = presenceHtml(e.dataset.p); if (e.innerHTML !== h) e.innerHTML = h; });
  const m = /^#dossier\/(.+)$/.exec(location.hash), pid = m ? decodeURIComponent(m[1]) : null; if (!pid) return;
  // R-G a : dans le bandeau du dossier (place « presSlot »)
  const l = qui0uvre(pid), z = $("presSlot");
  const h = l.length ? '<span class="pres-dossier" id="presDossier" title="Dossier ouvert en ce moment par ' + A.esc(l.join(", ")) + '"><svg class="pi"><use href="#i-document"/></svg>Ouvert aussi par <b>' + A.esc(l.join(", ")) + "</b></span>" : "";
  if (z && z.innerHTML !== h) z.innerHTML = h;
}
export const majPresenceDossier = () => majPresence();
