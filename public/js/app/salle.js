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
import { collection, doc, getDoc, getDocs, setDoc, query, where, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../config.js";
import { typeRdv, libRdv, joursH, T_RTC } from "../moteur/rdv.js";
import { etatLigne, protocoleDe, seancesCure } from "../moteur/doses.js";
import { addJ } from "../moteur/outils.js";
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
const SA = new Map(); // documents lus (id → données) : le jour même (écoute) et le jour affiché
let ECOUTE = null, VUE = "salle", ETAB = "", RETOUR = null, MINUT = null, JOUR = null, LU = {}, PER = "jour", RECH = "";
const MIDI = "13:00"; // Matinée : rendez-vous (ou arrivée) avant 13 h ; Après-midi : à partir de 13 h ; sans heure : dans les deux
const triPerso = () => (D().profil && D().profil.salleTri) || "rdv"; // rdv | arrivee | alpha (réglage personnel)

const hm = (ms) => { if (!ms) return ""; const d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const minutes = (ms) => Math.max(0, Math.floor((Date.now() - ms) / 60000));
const duree = (m) => (m < 60 ? m + " min" : Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0"));
const peutRdv = () => A.peut("rendezvous");
const voitPrix = () => A.peut("finances") || A.peut("encaissements");
const idDoc = (jour, pid, cle) => jour + "_" + pid + "_" + cle;
const nomConnecte = () => $("nomMenu").textContent;
const jourVu = () => JOUR || D().t;
const filtresEtab = () => { const m = D().membre; return m.tousEtablissements ? [] : [where("etablissementId", "in", (m.etablissements || []).length ? m.etablissements : ["—"])]; };

// ───── Temps réel : documents du jour, dans le périmètre de la personne connectée ─────
export function demarrerSalle() {
  if (ECOUTE) return;
  let premier = true;
  ECOUTE = onSnapshot(query(col(), where("jour", "==", D().t), ...filtresEtab()), (s) => {
    const autres = [];
    s.docChanges().forEach((c) => {
      if (c.type === "removed") SA.delete(c.doc.id); else SA.set(c.doc.id, c.doc.data());
      const d = c.doc.data(); if (!premier && d && d.majPar !== D().u.uid) autres.push(d.patientId);
    });
    premier = false;
    // Écriture d'un collègue : le dossier concerné et ses prix sont relus (statut du rendez-vous, prix, nouveau patient)
    Promise.all([...new Set(autres)].map(relire)).then(apresChangement);
    apresChangement();
  }, (e) => { console.warn("salle d'attente (écoute)", e); ECOUTE = null; });
}
async function relire(pid) {
  if (!pid) return;
  oublierEncaissements(pid); delete CHARGE[pid];
  const s = await getDoc(doc(db, "espaces", A.ESPACE, "patients", pid)).catch(() => null); if (!s || !s.exists()) return;
  let x = D().patients.find((p) => p.id === pid);
  if (x) { if ((s.data().version || 1) !== (x.doc.version || 1)) A.recalculer(x, s.data()); return; }
  x = { id: pid }; A.recalculer(x, s.data()); D().patients.push(x); D().patients.sort((a, b) => String(a.r.nm).localeCompare(String(b.r.nm)));
}
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
  if (l.etat === "salle") { const m = minutes(d.arr || Date.now()); return '<span class="pst ' + (m >= seuils()[1] ? "rouge" : m >= seuils()[0] ? "orange" : "salle") + '"><i></i>En salle · ' + duree(m) + "</span>"; }
  if (l.etat === "consult") return '<span class="pst consult"><i></i>En consultation · ' + duree(minutes(d.deb || Date.now())) + "</span>";
  if (l.etat === "vu" && cle === "chimio") return '<span class="pst vu"><i></i>Vu' + (d.fin ? " " + hm(d.fin) : "") + "</span>";
  return "";
}
function majBadges() {
  const z = document.querySelectorAll(".sa-badge[data-sa]"); if (!z.length) return;
  const L = lignes([D().t]); z.forEach((e) => { const i = e.dataset.sa.indexOf("|"); e.innerHTML = contenuBadge(L, e.dataset.sa.slice(0, i), e.dataset.sa.slice(i + 1)); });
}
setInterval(() => { if (A && D()) majBadges(); }, 30000);
function apresChangement() {
  majBadges();
  const n = lignes([D().t]).filter((l) => l.etat === "salle").length, e = $("nbSalle");
  if (e) { e.textContent = n; e.classList.toggle("cache", !n); e.title = n + " patient" + (n > 1 ? "s" : "") + " en salle d'attente"; }
  if (location.hash.startsWith("#salle") && $("saL")) dessiner();
  majBulles();
}

// ───── Lignes d'un ou plusieurs jours ─────
// Catégorie (couleur du badge) et libellé court du type de consultation
// Libellés courts (08/10/2026 : chimiothérapie = chimio, hebdomadaire = hebdo) pour que les colonnes ne se chevauchent pas
function typeDe(v) {
  if (v.type === T_RTC) return ["RT hebdo", "b-rt"];
  if (v.act) return [A.cap(String(v.type || "Consultation").replace(/^consultation\s+(de\s+|d')?/i, "").replace(/chimioth[ée]rapie/gi, "chimio").replace(/radioth[ée]rapie/gi, "RT").replace(/hebdomadaire/gi, "hebdo")), "b-gr"];
  const t = typeRdv(v.type);
  return t === "annonce" ? ["Annonce", "b-or"] : t === "controle" ? ["Contrôle", "b-gr"] : [A.cap(String(v.type || "Suivi").toLowerCase()), "b-co"];
}
// Une ligne = { jour, cle, pid, x, h, type, cls, motif, etat, doc, rdv | chimio } ; jours = liste de dates AAAA-MM-JJ
export function lignes(jours) {
  const J = new Set(jours || [jourVu()]), out = [], voitCh = A.voit("traitements");
  D().patients.forEach((x) => {
    const P = x.P;
    (P.rdvs || []).forEach((v) => {
      if (!J.has(v.d) || typeRdv(v.type) === "hospit" || v.st === "reporte") return;
      const cle = "r-" + v.id, sd = SA.get(idDoc(v.d, x.id, cle)) || {}, [type, cls] = typeDe(v);
      const etat = v.st === "fait" ? "vu" : v.st === "absent" ? "absent" : sd.etat || "";
      out.push({ jour: v.d, cle, pid: x.id, x, h: v.h || "", type, cls, motif: v.mo || v.n || "", etat, doc: sd, rdv: v });
    });
    if (!voitCh) return;
    (P.lignes || []).forEach((L) => {
      let pn = "", E = []; try { pn = protocoleDe(L, D().ctx.bib).nom; E = etatLigne(L, P, D().ctx); } catch (er) { return; }
      E.forEach((e) => {
        if (e.st !== "recue" && e.st !== "prevue") return;
        const jl = [];
        if ((e.st === "prevue" && J.has(e.date) && !L.arret) || (e.st === "recue" && J.has(e.c.reelle))) jl.push({ j: 1, d: e.st === "recue" ? e.c.reelle : e.date, recue: e.st === "recue" });
        seancesCure(L, e, D().ctx.bib).forEach((s) => { if ((s.st === "prevue" && J.has(s.prevue) && !L.arret) || (s.st === "recue" && J.has(s.d))) jl.push({ j: s.j, d: s.st === "recue" ? s.d : s.prevue, recue: s.st === "recue" }); });
        jl.forEach(({ j, d, recue }) => {
          const cle = "c-" + L.id + "-" + e.n + "-" + j, sd = SA.get(idDoc(d, x.id, cle)) || {};
          // Venue déjà notée ailleurs (avant la salle d'attente, ou depuis le dossier) : « Vu » si la consultation de chimio a
          // son prix, ou, pour un jour passé, si la cure / séance est validée (reçue)
          let etat = sd.etat || "", derive = false;
          if (!etat && recue && d < D().t) { etat = "vu"; derive = true; }
          if (!etat && recue && voitPrix()) { const E = encDe(x); if (E && E.cons && E.cons[L.id + "|" + e.n + "|" + j]) { etat = "vu"; derive = true; } }
          out.push({ jour: d, cle, pid: x.id, x, h: "", type: "Séance chimio", cls: "b-ch", motif: sd.motif || pn + " · C" + e.n + " J" + j, etat, derive, doc: sd, chimio: { lid: L.id, n: e.n, j, recue, lib: pn } });
        });
      });
    });
  });
  // Séance de chimio marquée absente puis reportée : elle n'est plus prévue ce jour-là, mais reste dans « Absents »
  SA.forEach((d, id) => {
    if (!d || d.etat !== "absent" || !J.has(d.jour) || String(d.cle || "").indexOf("c-") !== 0 || out.some((o) => o.jour === d.jour && o.pid === d.patientId && o.cle === d.cle)) return;
    const x = D().patients.find((p) => p.id === d.patientId), m = /^c-(.+)-(\d+)-(\d+)$/.exec(d.cle); if (!x || !m) return;
    out.push({ jour: d.jour, cle: d.cle, pid: x.id, x, h: "", type: "Séance de chimiothérapie", cls: "b-ch", motif: d.motif || "", etat: "absent", doc: d, orphelin: true, chimio: { lid: m[1], n: +m[2], j: +m[3], recue: false } });
  });
  return out;
}
const dansFiltre = (l) => !ETAB || (l.x.doc.etablissementId || "") === ETAB;

// ───── Prix : validé (consultation vue) ou prévu (tarif de l'établissement à cette date) ─────
const CHARGE = {}; // prix à encaisser demandés (une lecture par patient)
let REDESSIN = null;
function encDe(x) {
  if (CHARGE[x.id] === 1) return undefined; // lecture en cours
  const E = A.encaissementsDe(x, () => { delete CHARGE[x.id]; clearTimeout(REDESSIN); REDESSIN = setTimeout(() => { if ($("saL")) dessiner(); }, 60); });
  if (E === undefined) CHARGE[x.id] = 1;
  return E;
}
function prixDe(l) {
  if (!voitPrix() || l.etat === "absent") return null;
  const etab = l.x.doc.etablissementId || "", T = A.tarifsVus();
  if (l.etat === "vu") {
    const E = encDe(l.x); if (E === undefined) return { m: null, charge: true };
    if (l.rdv) { const o = E && E.rdv && E.rdv[l.rdv.id]; if (o) return { m: o.tj != null ? o.tj * (joursH(l.rdv) || 1) : o.b != null ? o.b : o.m, ok: true, v1: !!o.v1 }; if (l.rdv.type === T_RTC) return { m: 0, ok: true }; }
    else { const v = E && E.cons && E.cons[l.chimio.lid + "|" + l.chimio.n + "|" + l.chimio.j]; if (v) return { m: v.m, ok: true }; }
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
function prixAvance(l) {
  const p = prixDe(l) || {}, fmt = (v) => A.fmtMil(v);
  A.fenetre("<h3>Prix – " + A.esc(l.x.r.nm) + '</h3><p class="sous">' + A.esc(l.type) + " · " + A.cap(A.jourLong(l.jour)) + (l.h ? " à " + l.h : "") + '</p><div class="form"><div><label for="saPx">Montant (DH)</label><input id="saPx" class="mt" inputmode="decimal" value="' + A.esc(p.m != null ? fmt(p.m) : "") + '"></div></div>' +
    '<p class="mesures">Pour un patient qui paie avant la consultation (réduction, gratuité : 0). Ce montant sera proposé dans la fenêtre de prix à la validation.</p>' +
    '<div class="err" id="fErr"></div><div class="boutons">' + (l.doc.prix != null ? '<button class="bt gris" id="saPxT" style="margin-right:auto">Revenir au tarif</button>' : "") + '<button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  const fin = (m) => essayer(async () => { await ecrire(l, m == null ? { prix: null, prixPar: null, prixNom: null } : Object.assign({ prix: m }, qui("prix"))); A.fermerFenetre(); A.toast("Prix enregistré."); });
  if ($("saPxT")) $("saPxT").onclick = () => fin(null);
  $("fOk").onclick = () => { const m = parseFloat(A.val("saPx").replace(/[\s\u202f\u00a0]/g, "").replace(",", ".")); if (isNaN(m) || m < 0) { A.erreur("Indiquez le montant (0 si gratuit)."); return; } fin(m); };
}

// ───── Écriture d'un document (jour, patient, ligne) ─────
async function ecrire(l, maj) {
  const id = idDoc(l.jour, l.pid, l.cle), d = Object.assign({ etat: "" }, SA.get(id) || {}, maj, { jour: l.jour, patientId: l.pid, etablissementId: l.x.doc.etablissementId || "", cle: l.cle, majPar: D().u.uid, maj: serverTimestamp() });
  if (d.etat == null) d.etat = ""; // ligne sans document (vue avant la salle d'attente…) : étape vide, le rendez-vous reste la référence
  Object.keys(d).forEach((k) => { if (d[k] === undefined || d[k] === null) delete d[k]; });
  const avant = SA.get(id); SA.set(id, d); apresChangement();
  try { await setDoc(doc(col(), id), d); }
  catch (e) { if (avant) SA.set(id, avant); else SA.delete(id); apresChangement(); throw new Error(e && e.code === "permission-denied" ? "Vous n'avez pas le droit de faire cette modification." : "Enregistrement impossible : " + ((e && e.message) || e)); }
}
const qui = (k) => ({ [k + "Par"]: D().u.uid, [k + "Nom"]: nomConnecte() });
const trouver = (pid, cle, jour) => lignes([jour || jourVu()]).find((l) => l.pid === pid && l.cle === cle) || (!jour && jourVu() !== D().t ? lignes([D().t]).find((l) => l.pid === pid && l.cle === cle) : null);
const essayer = (f) => f().catch((e) => A.toast(e.message || String(e)));

// ───── Actions ─────
// N° d'ordre de passage : attribué à l'arrivée, à la suite des arrivées du jour du même établissement (0001, 0002…)
const prochainOrdre = (l) => { let m = 0; SA.forEach((d) => { if (d && d.jour === l.jour && (d.etablissementId || "") === (l.x.doc.etablissementId || "") && d.ordre > m) m = d.ordre; }); return m + 1; };
const fmtOrdre = (n) => (n ? String(n).padStart(4, "0") : "");
window.saEnSalle = (pid, cle) => essayer(async () => {
  const l = trouver(pid, cle); if (!l || l.jour !== D().t) return;
  await ecrire(l, Object.assign({ etat: "salle", arr: Date.now(), ordre: l.doc.ordre || prochainOrdre(l), deb: null, debPar: null, debNom: null }, qui("arr")));
  A.toast(l.x.r.nm + " : en salle d'attente (" + hm(Date.now()) + ").");
});
window.saDemarrer = (pid, cle) => essayer(async () => {
  const l = trouver(pid, cle); if (!l || !peutRdv() || l.jour !== D().t) return;
  const m = { etat: "consult", deb: Date.now() }; if (!l.doc.arr) Object.assign(m, { arr: m.deb, ordre: l.doc.ordre || prochainOrdre(l) }, qui("arr"));
  await ecrire(l, Object.assign(m, qui("deb")));
  window.ouvrirDossier(pid);
});
window.saRetour = (pid, cle) => essayer(async () => {
  const l = trouver(pid, cle, D().t) || trouver(pid, cle); if (!l || !peutRdv()) return;
  await ecrire(l, { etat: "salle", deb: null, debPar: null, debNom: null });
  A.toast(l.x.r.nm + " : retour en salle d'attente."); location.hash = "salle";
});
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
  const marquer = (nd) => essayer(() => ecrire(l, Object.assign({ etat: "absent", sp: D().u.uid, rep: nd || null, motif: l.motif, fin: Date.now() }, qui("fin"))));
  const i = l.x.P.lignes.findIndex((z) => z.id === l.chimio.lid);
  if (i < 0 || !(A.traitMod() || A.peut("planningChimio"))) { if (confirm(l.x.r.nm + " : marquer absent(e) à la séance de chimiothérapie ?\n\n(Le report de la séance se fait par le médecin.)")) marquer(null); return; }
  if (l.chimio.j === 1) window.chReporter(pid, i, l.chimio.n - 1, marquer); else window.chReporterJ(pid, i, l.chimio.n - 1, l.chimio.j, marquer);
};
// Annuler : retour à l'étape précédente (Vu → En consultation, Absent → À venir, En salle → À venir, En consultation → En salle)
window.saAnnuler = (pid, cle) => {
  const l = trouver(pid, cle); if (!l) return;
  if (l.etat === "salle") { if (!confirm("Annuler l'arrivée de " + l.x.r.nm + " (retour dans « À venir ») ?")) return; essayer(() => ecrire(l, { etat: "", arr: null, arrPar: null, arrNom: null, ordre: null })); return; }
  if (!peutRdv()) return;
  if (l.etat === "consult") { window.saRetour(pid, cle); return; }
  if (l.rdv) { window.statutRdv(pid, l.rdv.id, "prevu"); return; }
  const annulable = D().membre.role === "medecin" || l.doc.sp === D().u.uid;
  if (!annulable) { A.toast("Statut posé par le médecin : lui seul peut l'annuler."); return; }
  if (l.etat === "vu") { if (A.peutPrix()) window.chAnnulerVenuChimio(pid, l.chimio.lid, l.chimio.n, l.chimio.j); return; }
  essayer(() => ecrire(l, { etat: "", fin: null, finPar: null, finNom: null, sp: null }));
};
window.saMotif = (pid, cle) => {
  const l = trouver(pid, cle); if (!l || !peutRdv()) return;
  A.fenetre("<h3>Motif de consultation – " + A.esc(l.x.r.nm) + '</h3><div class="form"><div class="large"><label for="saMo">Motif</label><input id="saMo" value="' + A.esc(l.rdv ? l.rdv.mo || "" : l.doc.motif || "") + '" placeholder="Ex. nouveau patient, résultats du scanner, douleur…"></div></div>' +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
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
  if (st === "fait") m = Object.assign({ etat: "vu", fin: Date.now(), sp: D().u.uid }, qui("fin"));
  else if (st === "absent") m = Object.assign({ etat: "absent", fin: Date.now(), sp: D().u.uid }, qui("fin"));
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
  essayer(() => ecrire(l, deja ? { prixLe: Date.now() } : oui ? Object.assign({ etat: "vu", fin: Date.now(), sp: D().u.uid }, qui("fin")) : { etat: l.doc.arr ? "consult" : "", fin: null, finPar: null, finNom: null, sp: null }));
  if (oui && RETOUR === l.cle) { RETOUR = null; JOUR = D().t; location.hash = "salle"; }
}
// Prix d'une consultation déjà vue changé (médecin ou secrétaire) : les autres écrans relisent les prix
export function apresPrix(x, cle, jour) {
  oublierEncaissements(x.id); delete CHARGE[x.id];
  if (jour > D().t) return; const l = trouver(x.id, cle, jour); if (l) essayer(() => ecrire(l, { prixLe: Date.now() }));
}

// ───── Colonnes (08/10/2026) : chacun choisit celles qu'il voit ; Heure, Patient, Statut et les boutons restent toujours ─────
const COLS = [
  ["ord", "N° d'ordre", "42px"], ["h", "Heure", "44px", 1], ["civ", "Civilité", "38px"], ["nm", "Patient", "minmax(100px,1.2fr)", 1], ["type", "Type", "minmax(80px,.9fr)"],
  ["mo", "Motif", "minmax(78px,1fr)"], ["cor", "Correspondant", "minmax(68px,.8fr)"], ["mut", "Mutuelle", "minmax(58px,.7fr)"], ["ar", "Arrivée", "48px"],
  ["st", "Statut", "minmax(96px,1fr)", 1], ["px", "Prix", "70px"], ["com", "Commentaire", "minmax(68px,1fr)"], ["act", "", "minmax(152px,236px)", 1]];
// Réglage du cabinet (10/10/2026) : n° de passage, prix, commentaire retirés = colonnes absentes pour tous
const fnS = (k) => !D().reg || D().reg.fonctions["salle." + k] !== false;
const COL_FN = { ord: "passage", px: "prix", com: "commentaire" };
const cachees = () => ((D().profil && D().profil.salleCachees) || []).concat(Object.keys(COL_FN).filter((c) => !fnS(COL_FN[c])));
const colsVues = () => COLS.filter((c) => c[3] || (cachees().indexOf(c[0]) < 0 && (c[0] !== "px" || voitPrix())));
window.saColonnes = () => {
  const l = COLS.filter((c) => !c[3] && (c[0] !== "px" || voitPrix()) && (!COL_FN[c[0]] || fnS(COL_FN[c[0]])));
  A.fenetre('<h3>Colonnes de la salle d\'attente</h3><p class="sous">Cochez les colonnes à afficher (réglage personnel, gardé sur tous vos appareils). Heure, patient, statut et boutons restent toujours affichés.</p><div class="form">' +
    l.map((c) => '<div><label style="font-weight:normal"><input type="checkbox" data-c="' + c[0] + '"' + (cachees().indexOf(c[0]) < 0 ? " checked" : "") + ' style="width:auto;margin-right:8px">' + c[1] + "</label></div>").join("") + "</div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  $("fOk").onclick = async () => {
    const c = [...document.querySelectorAll("#fenetreCorps input[data-c]")].filter((e) => !e.checked).map((e) => e.dataset.c);
    if (!voitPrix() && cachees().indexOf("px") >= 0) c.push("px");
    D().profil.salleCachees = c; A.fermerFenetre(); dessiner();
    setDoc(doc(db, "utilisateurs", D().u.uid), { salleCachees: c }, { merge: true }).catch((e) => A.toast("Réglage non enregistré : " + e.message));
  };
};
// Commentaire du jour sur une ligne (médecin, secrétaire, infirmière)
window.saCom = (pid, cle) => {
  const l = trouver(pid, cle); if (!l) return;
  A.fenetre("<h3>Commentaire – " + A.esc(l.x.r.nm) + '</h3><p class="sous">' + A.esc(l.type) + " · " + A.cap(A.jourLong(l.jour)) + (l.doc.comNom ? " · dernier commentaire de " + A.esc(l.doc.comNom) : "") + '</p><div class="form"><div class="large"><label for="saC">Commentaire</label><textarea id="saC" rows="3" placeholder="Ex. à jeun, bilan sanguin apporté, accompagné…">' + A.esc(l.doc.com || "") + "</textarea></div></div>" +
    '<div class="err" id="fErr"></div><div class="boutons"><button class="bt gris" onclick="fermerFenetre()">Annuler</button><button class="bt plein" id="fOk">Enregistrer</button></div>');
  $("fOk").onclick = async () => {
    const c = A.val("saC"); A.occupe($("fOk"), true);
    try { await ecrire(l, c ? Object.assign({ com: c }, qui("com")) : { com: null, comPar: null, comNom: null }); A.fermerFenetre(); A.toast("Commentaire enregistré."); }
    catch (e) { A.occupe($("fOk"), false); A.erreur(e.message || String(e)); }
  };
};

// ───── Page ─────
const ONGLETS = [["avenir", "À venir"], ["salle", "En salle d'attente", "En salle"], ["vus", "Vus"], ["absents", "Absents"]];
const ongletDe = (l) => (l.etat === "vu" ? "vus" : l.etat === "absent" ? "absents" : l.etat === "salle" || l.etat === "consult" ? "salle" : "avenir");
const JC = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const lundi = (d) => { const w = new Date(d + "T12:00:00").getDay(); return addJ(d, w === 0 ? -6 : 1 - w); };
export function pageSalle(j) {
  if (j) JOUR = j; if (!JOUR) JOUR = D().t;
  const m = D().membre, etabs = m.tousEtablissements ? D().etabs.map((e) => e.code) : (m.etablissements || []);
  if (ETAB && etabs.indexOf(ETAB) < 0) ETAB = "";
  $("page").innerHTML = '<section class="accueil"><div><h2>Salle d\'attente</h2><p id="saTitre"></p></div>' +
    '<div class="actions sa-etab">' + (etabs.length > 1 ? '<select id="saEtab" aria-label="Établissement"><option value="">Tous les établissements</option>' + etabs.map((c) => '<option value="' + A.esc(c) + '"' + (c === ETAB ? " selected" : "") + ">" + A.esc(c) + "</option>").join("") + "</select>" : "") +
    '<button class="bt gris" data-fn="salle.colonnes" onclick="saColonnes()" title="Choisir les colonnes affichées"><svg class="i"><use href="#i-liste"/></svg>Colonnes</button></div></section>' +
    '<div class="sa-jours"><button class="sa-fl" onclick="saJour(-1)" aria-label="Jour précédent" title="Jour précédent">‹</button><div class="sa-sem" id="saSem"></div><button class="sa-fl" onclick="saJour(1)" aria-label="Jour suivant" title="Jour suivant">›</button>' +
    '<label class="sa-cal" title="Choisir un jour dans le calendrier"><svg class="i"><use href="#i-agenda"/></svg><span>Calendrier</span><input type="date" id="saD" aria-label="Choisir un jour"></label>' +
    '<button class="bt clair petit" id="saAuj" onclick="saAller(\'' + D().t + '\')">Aujourd\'hui</button></div>' +
    '<div class="sa-outils"><div class="sa-per" role="group" aria-label="Période">' + [["matin", "Matinée"], ["am", "Après-midi"], ["jour", "Toute la journée"]].map(([k, t]) => '<button data-per="' + k + '" onclick="saPeriode(\'' + k + '\')">' + t + "</button>").join("") + "</div>" +
    '<div class="recherche"><svg class="i"><use href="#i-loupe"/></svg><input id="saQ" type="search" placeholder="Rechercher un patient…" autocomplete="off" aria-label="Rechercher un patient"></div>' +
    '<select id="saTri" aria-label="Tri"><option value="rdv">Tri : heure du rendez-vous</option><option value="arrivee">Tri : heure d\'arrivée</option><option value="alpha">Tri : alphabétique</option></select>' +
    '<button class="bt gris" onclick="saImprimer()" title="Imprimer la liste du jour"><svg class="i"><use href="#i-imprimer"/></svg>Imprimer</button></div>' +
    '<section class="carte onglets"><div class="o-barre sa-o" role="tablist" aria-label="Salle d\'attente" id="saO"></div><div class="sa-defile"><div id="saL"></div></div><div id="saTot"></div></section>';
  if ($("saEtab")) $("saEtab").onchange = () => { ETAB = $("saEtab").value; dessiner(); };
  $("saD").onchange = () => { if ($("saD").value) window.saAller($("saD").value); };
  $("saQ").value = RECH; $("saQ").oninput = () => { RECH = $("saQ").value; dessiner(); };
  $("saTri").value = triPerso(); $("saTri").onchange = () => { const v = $("saTri").value; D().profil.salleTri = v; dessiner(); setDoc(doc(db, "utilisateurs", D().u.uid), { salleTri: v }, { merge: true }).catch(() => {}); };
  dessiner();
  if (JOUR !== D().t && !LU[JOUR]) lireJour(JOUR).then(() => { if ($("saL")) dessiner(); });
  clearInterval(MINUT); MINUT = setInterval(() => { if (location.hash.startsWith("#salle") && $("saL")) dessiner(); else clearInterval(MINUT); }, 30000);
}
window.saAller = (j) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(j || "")) return;
  const avant = JOUR; JOUR = j; if (avant !== j && VUE !== "vus" && VUE !== "absents") VUE = j === D().t ? "salle" : "avenir";
  if (j !== D().t && !LU[j]) { dessiner(); lireJour(j).then(() => { if ($("saL")) dessiner(); }); } else dessiner();
};
window.saJour = (n) => window.saAller(addJ(JOUR || D().t, n));
window.saOnglet = (k) => { VUE = k; dessiner(); };
window.saPeriode = (k) => { PER = k; dessiner(); };
// Filtres de la liste : période (heure du rendez-vous, sinon d'arrivée ; sans heure : toujours) et recherche (nom)
const dansPeriode = (l) => { const h = l.h || (l.doc.arr ? hm(l.doc.arr) : ""); return PER === "jour" || !h || (PER === "matin" ? h < MIDI : h >= MIDI); };
const dansRecherche = (l) => { const m = A.sansAcc(RECH).split(/\s+/).filter(Boolean); return !m.length || m.every((w) => A.sansAcc(l.x.r.nm).indexOf(w) >= 0); };
// Tri : chimio en tête d'« À venir » ; « En salle » : en consultation d'abord ; puis heure du rendez-vous, d'arrivée ou nom
function trier(l, vue) {
  const t = triPerso(), hh = (z) => z.h || (z.doc.arr ? hm(z.doc.arr) : "99:99"), nom = (a, b) => a.x.r.nm.localeCompare(b.x.r.nm);
  const cle = (a, b) => (t === "alpha" ? nom(a, b) : t === "arrivee" ? (a.doc.arr || 9e15) - (b.doc.arr || 9e15) || hh(a).localeCompare(hh(b)) : hh(a).localeCompare(hh(b))) || nom(a, b);
  if (vue === "salle") return l.sort((a, b) => (a.etat === "consult" ? 0 : 1) - (b.etat === "consult" ? 0 : 1) || (b.doc.urgent ? 1 : 0) - (a.doc.urgent ? 1 : 0) || cle(a, b));
  if (vue === "vus" && t !== "alpha") return l.sort((a, b) => (a.doc.fin || 0) - (b.doc.fin || 0) || cle(a, b));
  if (vue === "avenir") return l.sort((a, b) => (a.chimio ? 0 : 1) - (b.chimio ? 0 : 1) || cle(a, b));
  return l.sort(cle);
}
function dessiner() {
  if (!$("saL")) return;
  const t = D().t, j0 = lundi(JOUR), sem = Array.from({ length: 7 }, (_, i) => addJ(j0, i)), tout = lignes(sem).filter(dansFiltre);
  const nb = {}; tout.forEach((l) => { nb[l.jour] = (nb[l.jour] || 0) + 1; });
  $("saTitre").textContent = A.cap(A.jourLong(JOUR)) + " " + JOUR.slice(0, 4) + (JOUR === t ? " · aujourd'hui" : JOUR < t ? " · jour passé" : "");
  $("saSem").innerHTML = sem.map((d) => '<button class="sa-j' + (d === JOUR ? " on" : "") + (d === t ? " auj" : "") + '" onclick="saAller(\'' + d + '\')" aria-pressed="' + (d === JOUR) + '" title="' + A.esc(A.cap(A.jourLong(d))) + '"><span>' + JC[new Date(d + "T12:00:00").getDay()] + "</span><b>" + +d.slice(8, 10) + "</b><i>" + (nb[d] || "") + "</i></button>").join("");
  $("saD").value = JOUR; $("saAuj").classList.toggle("cache", JOUR === t);
  document.querySelectorAll(".sa-per button").forEach((b) => b.classList.toggle("on", b.dataset.per === PER));
  const L = tout.filter((l) => l.jour === JOUR && dansPeriode(l) && dansRecherche(l)), n = {}; ONGLETS.forEach(([k]) => { n[k] = 0; }); L.forEach((l) => { n[ongletDe(l)]++; });
  $("saO").innerHTML = ONGLETS.map(([k, lib, court]) => { if (k === "avenir" && JOUR < t) { lib = "À valider"; court = ""; } return '<button role="tab" aria-selected="' + (k === VUE) + '"' + (k === VUE ? ' class="on"' : "") + ' onclick="saOnglet(\'' + k + '\')">' + (court ? '<span class="lg">' + lib + '</span><span class="sm">' + court + "</span>" : lib) + '<span class="n">' + n[k] + "</span></button>"; }).join("");
  const l = trier(L.filter((z) => ongletDe(z) === VUE), VUE);
  const vide = { avenir: JOUR < t ? "Aucune consultation restée sans validation." : JOUR > t ? "Aucune consultation prévue ce jour-là." : "Plus aucun patient attendu aujourd'hui.", salle: "Personne en salle d'attente.", vus: "Aucun patient vu.", absents: "Aucun absent." }[VUE];
  const sc = window.scrollY;
  const cv = colsVues(); $("saL").style.setProperty("--cols", cv.map((c) => c[2]).join(" "));
  $("saL").innerHTML = l.length ? '<div class="sa-l ent">' + cv.map((c) => '<span class="c-' + c[0] + '" title="' + c[1] + '">' + (c[0] === "civ" ? "Civ." : c[0] === "ord" ? "N°" : c[1]) + "</span>").join("") + "</div>" + l.map((z) => ligneHtml(z, cv)).join("") : '<p class="sous" style="margin:6px 0">' + vide + "</p>";
  // Total du jour (établissement choisi), sans les absents : encaissé (vus, prix validé) et prévu (le reste, au tarif)
  if (voitPrix()) {
    let enc = 0, prev = 0, nv = 0;
    L.forEach((z) => { const p = prixDe(z); if (!p) return; if (z.etat === "vu") { if (p.ok) enc += p.m || 0; else nv++; } else prev += p.m || 0; });
    $("saTot").innerHTML = '<div class="sa-tot"><span>Encaissé (vus) : <b>' + A.fmtMil(enc) + " DH</b></span><span>Prévu (restant) : <b>" + A.fmtMil(prev) + " DH</b></span>" + (nv ? '<span class="mesures">' + nv + " consultation" + (nv > 1 ? "s" : "") + " vue" + (nv > 1 ? "s" : "") + " sans prix</span>" : "") + "</div>";
  } else $("saTot").innerHTML = "";
  window.scrollTo(0, sc);
}
// Pastille de statut (au trait) avec le temps écoulé
function statut(l) {
  const d = l.doc, now = Date.now(), auj = l.jour === D().t;
  if (l.etat === "salle") { if (!auj || !fnS("attente")) return '<span class="pst salle"><i></i>Arrivé' + (d.arr ? " à " + hm(d.arr) : "") + "</span>"; const m = minutes(d.arr || now), c = m >= seuils()[1] ? "rouge" : m >= seuils()[0] ? "orange" : "salle"; return '<span class="pst ' + c + '" title="En attente depuis ' + duree(m) + '"><i></i>Attente ' + duree(m) + "</span>"; }
  if (l.etat === "consult") return '<span class="pst consult"><i></i>' + (auj ? "Consultation " + duree(minutes(d.deb || now)) : "En consultation") + "</span>";
  if (l.etat === "vu") return '<span class="pst vu"><i></i>Vu' + (d.fin ? " à " + hm(d.fin) : "") + "</span>" + (d.arr && d.deb ? '<div class="mesures">Attente ' + duree(Math.max(0, Math.round((d.deb - d.arr) / 60000))) + (d.fin ? " · consultation " + duree(Math.max(0, Math.round((d.fin - d.deb) / 60000))) + " · présence " + duree(Math.max(0, Math.round((d.fin - d.arr) / 60000))) : "") + "</div>" : "");
  if (l.etat === "absent") return '<span class="pst absent"><i></i>Absent</span>' + (d.rep ? '<div class="mesures">Reportée au ' + A.dfrA(d.rep) + "</div>" : "");
  if (l.jour < D().t) return '<span class="pst orange"><i></i>Non validé</span>';
  return '<span class="pst prevu"><i></i>Prévu</span>';
}
// « CNOPS — Caisse nationale… » → « CNOPS » (nom complet au survol)
const court = (s) => String(s || "").split(/\s+[—–]\s+/)[0];
function ligneHtml(l, cv) {
  const q = "'" + l.pid + "','" + l.cle + "'", b = (lib, fn, cls, ti) => '<button class="mini ' + (cls || "") + '" onclick="' + fn + "(" + q + ')"' + (ti ? ' title="' + ti + '"' : "") + ">" + lib + "</button>";
  const okR = peutRdv(), okV = okR && (l.rdv || A.peutPrix()), t = D().t;
  let act = "";
  if (l.jour === t) {
    if (l.etat === "") act = b("Mettre en salle", "saEnSalle", "bleu") + (okR ? b("Démarrer", "saDemarrer", "v") + b("Absent", "saAbsent", "r") : "");
    else if (l.etat === "salle") act = (okR ? b("Démarrer", "saDemarrer", "v", "Démarrer la consultation (ouvre le dossier)") : "") + (okV ? b("Valider", "saValider") : "") + b("Annuler", "saAnnuler");
    else if (l.etat === "consult") act = okR ? (okV ? b("Valider", "saValider", "v") : "") + b("Retour en salle", "saRetour") : "";
  } else if (l.jour < t && (l.etat === "" || l.etat === "salle" || l.etat === "consult")) act = (okV ? b("Valider", "saValider", "v") : "") + (okR && l.etat === "" ? b("Absent", "saAbsent", "r") : "");
  if ((l.etat === "vu" || l.etat === "absent") && okR && (l.rdv || A.peutPrix() || l.etat === "absent") && !l.orphelin && !l.derive) act = b("Annuler", "saAnnuler");
  // Motif : visible si la personne voit les consultations (l'infirmière : celui des séances de chimio seulement)
  const voitMo = !!l.chimio || A.voitRdv(), mo = voitMo ? A.esc(l.motif) : "", etab = !ETAB && $("saEtab") && l.x.doc.etablissementId ? ' <span class="badge b-gr">' + A.esc(l.x.doc.etablissementId) + "</span>" : "";
  const p = prixDe(l), px = !p ? "" : p.charge ? '<span class="mesures">…</span>' : p.nonValide ? (l.derive ? "—" : '<span class="mesures">Prix non fixé</span>') : p.m == null ? "—" : '<span class="' + (p.ok ? "px-ok" : p.convenu ? "px-conv" : "px-prev") + '" title="' + (p.ok ? "Prix validé" : p.convenu ? "Prix payé d'avance (proposé à la validation)" : "Prix prévu (tarif)") + '">' + A.fmtMil(p.m) + " DH</span>";
  const crayonPx = l.etat !== "absent" && A.peutPrix() && !(l.rdv && l.rdv.type === T_RTC) && !(p && p.v1 && !A.peut("finances")) && !(l.derive && !(p && p.ok)) ? '<button class="crayon" onclick="saPrix(' + q + ')" title="' + (l.etat === "vu" ? "Modifier le prix" : "Prix payé d'avance") + '" aria-label="Modifier le prix"><svg class="pi"><use href="#i-crayon"/></svg></button>' : "";
  const P = l.x.P, crayon = (fn, t) => '<button class="crayon" onclick="' + fn + "(" + q + ')" title="' + t + '" aria-label="' + t + '"><svg class="pi"><use href="#i-crayon"/></svg></button>';
  const cel = {
    ord: '<span class="ord" title="N° d\'ordre de passage">' + fmtOrdre(l.doc.ordre) + "</span>",
    h: '<span class="h">' + A.esc(l.h || "—") + "</span>",
    civ: '<span class="civ">' + (P.sexe === "F" ? "Mme" : P.sexe === "H" ? "M." : "") + "</span>",
    nm: '<span class="nm"><button class="lien-nm" onclick="ouvrirDossier(\'' + l.pid + '\')" title="Ouvrir le dossier (sans changer le statut)">' + A.esc(l.x.r.nm) + "</button>" + etab + presenceHtml(l.pid) + "</span>",
    type: '<span class="c-type"><span class="badge ' + l.cls + '">' + A.esc(l.type) + "</span></span>",
    mo: '<span class="mo" data-l="Motif">' + mo + (voitMo && okR ? crayon("saMotif", "Modifier le motif") : "") + "</span>",
    cor: '<span class="cor" data-l="Correspondant" title="' + A.esc(P.cor || "") + '">' + A.esc(court(P.cor)) + "</span>",
    mut: '<span class="mut" data-l="Mutuelle" title="' + A.esc(P.mut || "") + '">' + A.esc(court(P.mut)) + "</span>",
    ar: '<span class="ar" data-l="Arrivée">' + (l.doc.arr ? hm(l.doc.arr) : "") + "</span>",
    st: '<span class="c-st">' + statut(l) + "</span>",
    px: '<span class="px" data-l="Prix">' + px + crayonPx + "</span>",
    com: '<span class="com" data-l="Commentaire"' + (l.doc.comNom ? ' title="' + A.esc(l.doc.comNom) + '"' : "") + ">" + A.esc(l.doc.com || "") + crayon("saCom", l.doc.com ? "Modifier le commentaire" : "Ajouter un commentaire") + "</span>",
    act: '<span class="actr">' + act + "</span>",
  };
  return '<div class="sa-l ' + (l.etat || "prevu") + '">' + cv.map((c) => cel[c[0]]).join("") + "</div>";
}

// ───── Dossier ouvert pendant la consultation : bulles Valider / Retour en salle (en bas à gauche) ─────
export function bullesDossier(x) {
  if (!peutRdv() || !fnS("bulles")) return "";
  const l = lignes([D().t]).filter((z) => z.pid === x.id && z.etat === "consult");
  if (!l.length) return "";
  return '<div class="sa-bulles" id="saBulles" data-pid="' + A.esc(x.id) + '">' + l.map((z) => {
    const q = "'" + z.pid + "','" + z.cle + "'", okV = z.rdv || A.peutPrix();
    return '<div class="sa-b"><span class="lbl"><i></i>En consultation depuis ' + duree(minutes(z.doc.deb || Date.now())) + (l.length > 1 ? " · " + A.esc(z.type) : "") + "</span>" +
      (okV ? '<button class="bt vert" onclick="saValider(' + q + ',1)"><svg class="i"><use href="#i-check"/></svg>Valider</button>' : "") +
      '<button class="bt fonce" onclick="saRetour(' + q + ')"><svg class="i"><use href="#i-retour"/></svg>Retour en salle</button></div>';
  }).join("") + '</div><div class="sa-espace"></div>';
}
function majBulles() {
  const z = $("saBulles"), m = /^#dossier\/(.+)$/.exec(location.hash), pid = m ? decodeURIComponent(m[1]) : null;
  if (!pid) return;
  const x = D().patients.find((p) => p.id === pid); if (!x) return;
  const h = bullesDossier(x);
  if (z) { if (!h) { z.nextElementSibling && z.nextElementSibling.classList.contains("sa-espace") && z.nextElementSibling.remove(); z.remove(); } else z.outerHTML = h.replace(/<div class="sa-espace"><\/div>$/, ""); }
  else if (h && $("page")) $("page").insertAdjacentHTML("beforeend", h);
}

// ───── Imprimer la liste du jour (08/10/2026) : jour, établissement, période et recherche choisis ; colonnes affichées ─────
window.saImprimer = () => {
  const t = D().t, L = lignes([JOUR]).filter((l) => dansFiltre(l) && dansPeriode(l) && dansRecherche(l));
  const cv = colsVues().filter((c) => c[0] !== "act"), lib = { "": "À venir", salle: "En salle d'attente", consult: "En consultation", vu: "Vus", absent: "Absents" };
  const st = (l) => ({ salle: "En salle", consult: "En consultation", vu: "Vu", absent: "Absent" }[l.etat] || (l.jour < t ? "Non validé" : "Prévu"));
  const val = (l, k) => {
    const P = l.x.P, d = l.doc, p = k === "px" ? prixDe(l) : null;
    return { ord: fmtOrdre(d.ordre), h: l.h || "—", civ: P.sexe === "F" ? "Mme" : P.sexe === "H" ? "M." : "", nm: l.x.r.nm, type: l.type, mo: l.chimio || A.voitRdv() ? l.motif : "", cor: P.cor || "", mut: court(P.mut), ar: d.arr ? hm(d.arr) : "",
      st: st(l) + (l.etat === "vu" && d.fin ? " à " + hm(d.fin) : "") + (d.rep ? " (reportée au " + A.dfrA(d.rep) + ")" : ""), px: p && p.m != null ? A.fmtMil(p.m) + " DH" : "", com: d.com || "" }[k];
  };
  const groupes = ["consult", "salle", "", "vu", "absent"].map((e) => [e, trier(L.filter((l) => l.etat === e), e === "" ? "avenir" : e === "consult" ? "salle" : e === "vu" ? "vus" : "absents")]).filter((g) => g[1].length);
  const e = ETAB ? ((D().etabsTous || D().etabs).find((z) => z.code === ETAB) || {}).nom || ETAB : "Tous les établissements";
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Salle d\'attente – ' + A.esc(A.dfrA(JOUR)) + '</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;font-size:11px;color:#1E2A44}h1{font-size:17px;margin:0 0 2px}p{margin:0 0 10px;color:#64708A}h2{font-size:13px;margin:14px 0 4px;color:#24365F}table{width:100%;border-collapse:collapse}th,td{border:1px solid #CCD3E0;padding:4px 6px;text-align:left;vertical-align:top}th{background:#EAF0FA}</style></head><body>' +
    "<h1>Salle d'attente – " + A.esc(A.cap(A.jourLong(JOUR))) + " " + JOUR.slice(0, 4) + "</h1><p>" + A.esc(e) + ({ matin: " · Matinée", am: " · Après-midi" }[PER] || "") + (RECH ? " · Recherche : " + A.esc(RECH) : "") + " · " + L.length + " patient" + (L.length > 1 ? "s" : "") + " · imprimé le " + A.esc(A.dfrA(t)) + " à " + hm(Date.now()) + "</p>" +
    (groupes.length ? groupes.map(([k, g]) => "<h2>" + lib[k] + " (" + g.length + ")</h2><table><tr>" + cv.map((c) => "<th>" + A.esc(c[0] === "ord" ? "N°" : c[1]) + "</th>").join("") + "</tr>" + g.map((l) => "<tr>" + cv.map((c) => "<td>" + A.esc(val(l, c[0])) + "</td>").join("") + "</tr>").join("") + "</table>").join("") : "<p>Aucun patient.</p>") + "</body></html>";
  let w = null; try { w = window.open("", "_blank"); } catch (er) { w = null; }
  if (!w || !w.document) { A.toast("Autorisez l'ouverture des fenêtres pour imprimer la liste."); return; }
  w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
};

// ───── « Dossier ouvert par » (08/10/2026) : chaque personne signale le dossier qu'elle a ouvert ─────
// espaces/{e}/presence/{uid} = { patientId (ou ""), nom, role, le } : écrit par la personne elle-même (règles), renouvelé chaque
// minute tant que le dossier reste ouvert ; considéré comme fermé après 3 minutes sans nouvelle (onglet fermé, coupure).
const PRES = new Map(); let ECOUTE_P = null, MON_DOSSIER = "", BATTEMENT = null;
const ms = (v) => (v && typeof v.toMillis === "function" ? v.toMillis() : v ? new Date(v).getTime() : Date.now());
const ROLES = { medecin: "Médecin", infirmiere: "Infirmière", assistante: "Secrétaire", comptable: "Comptable" };
function ecrirePresence() {
  setDoc(doc(db, "espaces", A.ESPACE, "presence", D().u.uid), { patientId: MON_DOSSIER, nom: nomConnecte(), role: D().membre.role || "", le: serverTimestamp() }).catch(() => {});
}
export function presenceDossier(pid) {
  pid = pid || "";
  if (pid !== MON_DOSSIER) { MON_DOSSIER = pid; ecrirePresence(); clearInterval(BATTEMENT); if (pid) BATTEMENT = setInterval(ecrirePresence, 60000); }
  if (!ECOUTE_P) {
    ECOUTE_P = onSnapshot(collection(db, "espaces", A.ESPACE, "presence"), (s) => {
      s.docChanges().forEach((c) => { if (c.type === "removed") PRES.delete(c.doc.id); else PRES.set(c.doc.id, c.doc.data()); });
      majPresence();
    }, (e) => { console.warn("présence (écoute)", e); ECOUTE_P = null; });
    window.addEventListener("pagehide", () => { if (MON_DOSSIER) { MON_DOSSIER = ""; ecrirePresence(); } });
  }
  majPresence();
}
// Collègues qui ont ce dossier ouvert (moi exclu)
const qui0uvre = (pid) => { const l = []; PRES.forEach((p, uid) => { if (uid !== D().u.uid && p && p.patientId === pid && Date.now() - ms(p.le) < 180000) l.push(p.nom + (ROLES[p.role] ? " (" + ROLES[p.role].toLowerCase() + ")" : "")); }); return l; };
function presenceHtml(pid) { const l = qui0uvre(pid); return l.length ? '<div class="sa-pres" title="Dossier ouvert en ce moment par ' + A.esc(l.join(", ")) + '"><svg class="pi"><use href="#i-document"/></svg>Ouvert par ' + A.esc(l.join(", ")) + "</div>" : ""; }
function majPresence() {
  if (location.hash.startsWith("#salle") && $("saL")) dessiner();
  const m = /^#dossier\/(.+)$/.exec(location.hash), pid = m ? decodeURIComponent(m[1]) : null; if (!pid) return;
  const l = qui0uvre(pid), z = $("presDossier");
  const h = l.length ? '<div class="pres-dossier" id="presDossier"><svg class="pi"><use href="#i-document"/></svg>Dossier ouvert aussi par <b>' + A.esc(l.join(", ")) + "</b></div>" : "";
  if (z) { if (h) z.outerHTML = h; else z.remove(); }
  else if (h && $("page")) { const r = $("page").querySelector(".retour"); if (r) r.insertAdjacentHTML("afterend", h); else $("page").insertAdjacentHTML("afterbegin", h); }
}
export const majPresenceDossier = () => majPresence();
